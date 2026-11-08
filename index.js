import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const name = 'dsh-obsidian';

const RPC_CHANNEL = '/dsh-obsidian';
const MAX_NOTE_BYTES = 2 * 1024 * 1024; // 2 MiB
const MAX_PROMPT_NOTE_CHARS = 12000;
const IGNORED_DIRS = new Set(['.obsidian', '.git', '.trash', 'node_modules', '.DS_Store']);
const NOTE_EXTENSIONS = new Set(['.md', '.markdown', '.canvas', '.base', '.txt']);

/**
 * Resolve candidate paths for Obsidian's global `obsidian.json` registry across platforms.
 */
function getObsidianRegistryPaths() {
  const home = os.homedir();
  const candidates = [];
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    candidates.push(path.join(appData, 'obsidian', 'obsidian.json'));
  } else if (process.platform === 'darwin') {
    candidates.push(path.join(home, 'Library', 'Application Support', 'obsidian', 'obsidian.json'));
  } else {
    const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    candidates.push(path.join(xdgConfig, 'obsidian', 'obsidian.json'));
    candidates.push(path.join(home, '.var', 'app', 'md.obsidian.Obsidian', 'config', 'obsidian', 'obsidian.json'));
    candidates.push(path.join(home, 'snap', 'obsidian', 'current', '.config', 'obsidian', 'obsidian.json'));
  }
  return candidates;
}

/**
 * Local state file for custom vaults and active selection persistence.
 */
function getLocalStateFilePath() {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(dshHome, 'obsidian-plugin-state.json');
}

async function readLocalState() {
  try {
    const raw = await fsp.readFile(getLocalStateFilePath(), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        customVaults: Array.isArray(parsed.customVaults)
          ? parsed.customVaults.filter((item) => typeof item === 'string' && item.trim() !== '')
          : [],
        removedAutoVaults: Array.isArray(parsed.removedAutoVaults)
          ? parsed.removedAutoVaults.filter((item) => typeof item === 'string' && item.trim() !== '')
          : [],
      };
    }
  } catch {
    // ignore missing or malformed state file
  }
  return { customVaults: [], removedAutoVaults: [] };
}

async function writeLocalState(state) {
  const filePath = getLocalStateFilePath();
  try {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // best-effort persistence
  }
}

/**
 * Normalize a filesystem path for deduplication while preserving native separators.
 */
function normalizeVaultKey(vaultPath) {
  const resolved = path.resolve(vaultPath.trim());
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

/**
 * Parse YAML frontmatter, #tags, and [[wikilinks]] from Markdown text.
 */
function parseNoteMetadata(content) {
  const frontmatter = {};
  let body = content;
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (fmMatch) {
    body = content.slice(fmMatch[0].length);
    const lines = fmMatch[1].split(/\r?\n/);
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();
        if (key && !key.startsWith('#')) {
          frontmatter[key] = val.replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }

  const tagsSet = new Set();
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\u4e00-\u9fa5/]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(body)) !== null) {
    tagsSet.add(tagMatch[1]);
  }
  if (frontmatter.tags) {
    const rawTags = String(frontmatter.tags)
      .replace(/^\[|\]$/g, '')
      .split(/[,\s]+/)
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean);
    for (const t of rawTags) tagsSet.add(t);
  }

  const linksSet = new Set();
  const linkRegex = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(body)) !== null) {
    const target = linkMatch[1].trim();
    if (target) linksSet.add(target);
  }

  return {
    frontmatter,
    tags: [...tagsSet],
    links: [...linksSet],
  };
}

/**
 * Validate and resolve a relative note path strictly within a vault root.
 */
function resolveSafeNotePath(vaultPath, notePath, ensureMdExtension = false) {
  if (typeof vaultPath !== 'string' || vaultPath.trim() === '') {
    throw new Error('Vault path is required.');
  }
  if (typeof notePath !== 'string' || notePath.trim() === '') {
    throw new Error('Note path is required.');
  }
  const vaultRoot = path.resolve(vaultPath);
  let cleaned = notePath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (ensureMdExtension && path.extname(cleaned) === '') {
    cleaned += '.md';
  }
  const resolved = path.resolve(vaultRoot, cleaned);
  const relative = path.relative(vaultRoot, resolved);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid note path outside vault boundary: ${notePath}`);
  }
  const topSegment = relative.split(/[/\\]/)[0];
  if (topSegment === '.obsidian' || topSegment === '.git') {
    throw new Error(`Access to protected directory "${topSegment}" is not allowed.`);
  }
  return {
    vaultRoot,
    resolvedPath: resolved,
    relativePath: relative.replace(/\\/g, '/'),
  };
}

/**
 * Quickly count notes and latest mtime in a vault directory (bounded depth/count for responsiveness).
 */
async function summarizeVaultDirectory(vaultPath) {
  let exists = false;
  let hasObsidianConfig = false;
  let noteCount = 0;
  let lastModifiedMs = 0;

  try {
    const stat = await fsp.stat(vaultPath);
    if (!stat.isDirectory()) {
      return { exists: false, hasObsidianConfig: false, noteCount: 0, lastModifiedMs: 0 };
    }
    exists = true;
    lastModifiedMs = stat.mtimeMs || 0;
  } catch {
    return { exists: false, hasObsidianConfig: false, noteCount: 0, lastModifiedMs: 0 };
  }

  try {
    const obsStat = await fsp.stat(path.join(vaultPath, '.obsidian'));
    hasObsidianConfig = obsStat.isDirectory();
  } catch {
    hasObsidianConfig = false;
  }

  const stack = [{ dir: vaultPath, depth: 0 }];
  let scannedEntries = 0;
  while (stack.length > 0 && scannedEntries < 5000) {
    const { dir, depth } = stack.pop();
    if (depth > 8) continue;
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      scannedEntries++;
      if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push({ dir: fullPath, depth: depth + 1 });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (NOTE_EXTENSIONS.has(ext)) {
          noteCount++;
          try {
            const st = await fsp.stat(fullPath);
            if (st.mtimeMs > lastModifiedMs) lastModifiedMs = st.mtimeMs;
          } catch {
            // ignore
          }
        }
      }
    }
  }

  return { exists, hasObsidianConfig, noteCount, lastModifiedMs };
}

/**
 * Build Obsidian service for both Client UI RPC and AI Agent Tools.
 */
function createObsidianService(ctx, initialConfig) {
  let revision = 1;
  const activeContexts = new Map(); // sessionId -> active context
  let globalActiveContext = null;

  const bumpRevision = () => {
    revision += 1;
    return revision;
  };

  async function persistCustomVaultsToProfile(customVaults) {
    try {
      const entry = ctx.fiber?.entry;
      const editor = ctx.get?.('configEditor');
      if (entry !== undefined && editor !== undefined) {
        await editor.edit(entry, (current) => ({
          ...current,
          customVaults,
        }));
      }
    } catch {
      // Fallback to local state file already handled
    }
  }

  async function listVaults() {
    const state = await readLocalState();
    const configVaults = Array.isArray(initialConfig?.customVaults)
      ? initialConfig.customVaults.filter((v) => typeof v === 'string' && v.trim() !== '')
      : [];
    const removedSet = new Set(state.removedAutoVaults.map(normalizeVaultKey));

    const discoveredMap = new Map(); // normalizedKey -> { id, path, name, source, open, ts }

    // 1. Read official obsidian.json files
    for (const regPath of getObsidianRegistryPaths()) {
      try {
        if (!fs.existsSync(regPath)) continue;
        const raw = await fsp.readFile(regPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.vaults === 'object' && parsed.vaults !== null) {
          for (const [id, info] of Object.entries(parsed.vaults)) {
            if (!info || typeof info.path !== 'string' || info.path.trim() === '') continue;
            const resolved = path.resolve(info.path);
            const key = normalizeVaultKey(resolved);
            if (removedSet.has(key)) continue;
            discoveredMap.set(key, {
              id,
              path: resolved,
              name: path.basename(resolved) || resolved,
              source: 'obsidian',
              open: Boolean(info.open),
              ts: typeof info.ts === 'number' ? info.ts : 0,
            });
          }
        }
      } catch {
        // ignore unreadable registry file
      }
    }

    // 2. Merge custom vaults from config + local state
    const allCustom = [...configVaults, ...state.customVaults];
    for (const rawPath of allCustom) {
      if (typeof rawPath !== 'string' || rawPath.trim() === '') continue;
      const resolved = path.resolve(rawPath.trim());
      const key = normalizeVaultKey(resolved);
      if (!discoveredMap.has(key)) {
        discoveredMap.set(key, {
          id: `custom-${Buffer.from(key).toString('base64url').slice(0, 12)}`,
          path: resolved,
          name: path.basename(resolved) || resolved,
          source: 'custom',
          open: false,
          ts: 0,
        });
      }
    }

    // 3. Summarize each vault on disk
    const vaults = [];
    for (const item of discoveredMap.values()) {
      const summary = await summarizeVaultDirectory(item.path);
      vaults.push({
        ...item,
        exists: summary.exists,
        hasObsidianConfig: summary.hasObsidianConfig,
        noteCount: summary.noteCount,
        lastModifiedMs: summary.lastModifiedMs || item.ts || 0,
        obsidianUri: `obsidian://open?vault=${encodeURIComponent(item.name)}`,
      });
    }

    // Sort: existing first, then open/recent
    vaults.sort((a, b) => {
      if (a.exists !== b.exists) return a.exists ? -1 : 1;
      if (a.open !== b.open) return a.open ? -1 : 1;
      return (b.lastModifiedMs || 0) - (a.lastModifiedMs || 0);
    });

    return { vaults, revision };
  }

  async function addVault(vaultPath, createIfMissing = false) {
    if (typeof vaultPath !== 'string' || vaultPath.trim() === '') {
      throw new Error('Vault directory path is required.');
    }
    const resolved = path.resolve(vaultPath.trim());
    let stat;
    try {
      stat = await fsp.stat(resolved);
    } catch {
      if (createIfMissing) {
        await fsp.mkdir(path.join(resolved, '.obsidian'), { recursive: true });
        stat = await fsp.stat(resolved);
      } else {
        throw new Error(`Directory does not exist: ${resolved}`);
      }
    }
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${resolved}`);
    }

    // Ensure .obsidian folder exists if creating/initializing
    try {
      await fsp.mkdir(path.join(resolved, '.obsidian'), { recursive: true });
    } catch {
      // ignore if read-only
    }

    const state = await readLocalState();
    const key = normalizeVaultKey(resolved);
    const nextCustom = state.customVaults.filter((p) => normalizeVaultKey(p) !== key);
    nextCustom.push(resolved);
    const nextRemoved = state.removedAutoVaults.filter((p) => normalizeVaultKey(p) !== key);
    await writeLocalState({ customVaults: nextCustom, removedAutoVaults: nextRemoved });
    await persistCustomVaultsToProfile(nextCustom);
    bumpRevision();

    const listing = await listVaults();
    const added = listing.vaults.find((v) => normalizeVaultKey(v.path) === key);
    return {
      added: added ?? {
        id: 'custom',
        path: resolved,
        name: path.basename(resolved) || resolved,
        source: 'custom',
        exists: true,
      },
      vaults: listing.vaults,
      revision,
    };
  }

  async function removeVault(vaultPath) {
    if (typeof vaultPath !== 'string' || vaultPath.trim() === '') {
      throw new Error('Vault directory path is required.');
    }
    const resolved = path.resolve(vaultPath.trim());
    const key = normalizeVaultKey(resolved);
    const state = await readLocalState();
    const nextCustom = state.customVaults.filter((p) => normalizeVaultKey(p) !== key);
    const nextRemoved = [...new Set([...state.removedAutoVaults, resolved])];
    await writeLocalState({ customVaults: nextCustom, removedAutoVaults: nextRemoved });
    await persistCustomVaultsToProfile(nextCustom);
    bumpRevision();
    const listing = await listVaults();
    return { removed: resolved, vaults: listing.vaults, revision };
  }

  async function listNotes(vaultPath) {
    if (typeof vaultPath !== 'string' || vaultPath.trim() === '') {
      throw new Error('Vault path is required.');
    }
    const vaultRoot = path.resolve(vaultPath.trim());
    const stat = await fsp.stat(vaultRoot).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`Vault directory not found: ${vaultRoot}`);
    }

    const notes = [];

    async function walk(currentDir, relPrefix, depth) {
      if (depth > 10 || notes.length > 5000) return [];
      let entries;
      try {
        entries = await fsp.readdir(currentDir, { withFileTypes: true });
      } catch {
        return [];
      }
      entries.sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      const treeNodes = [];
      for (const entry of entries) {
        if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
        const fullPath = path.join(currentDir, entry.name);
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          const children = await walk(fullPath, relPath, depth + 1);
          treeNodes.push({
            type: 'folder',
            name: entry.name,
            path: relPath,
            children,
          });
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!NOTE_EXTENSIONS.has(ext)) continue;
          let fileStat = { size: 0, mtimeMs: 0 };
          try {
            fileStat = await fsp.stat(fullPath);
          } catch {
            // ignore
          }
          const title = entry.name.slice(0, entry.name.length - ext.length) || entry.name;
          const noteItem = {
            type: 'note',
            name: entry.name,
            title,
            path: relPath,
            folder: relPrefix || '',
            ext,
            size: fileStat.size,
            mtimeMs: fileStat.mtimeMs,
          };
          notes.push(noteItem);
          treeNodes.push(noteItem);
        }
      }
      return treeNodes;
    }

    const tree = await walk(vaultRoot, '', 0);
    return {
      vaultPath: vaultRoot,
      vaultName: path.basename(vaultRoot) || vaultRoot,
      tree,
      notes,
      totalNotes: notes.length,
      revision,
    };
  }

  async function readNote(vaultPath, notePath) {
    const { vaultRoot, resolvedPath, relativePath } = resolveSafeNotePath(vaultPath, notePath, false);
    let stat;
    try {
      stat = await fsp.stat(resolvedPath);
    } catch {
      // Try appending .md if not found directly
      if (!notePath.toLowerCase().endsWith('.md')) {
        return readNote(vaultPath, `${notePath}.md`);
      }
      throw new Error(`Note not found: ${relativePath}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Path is not a regular file: ${relativePath}`);
    }
    if (stat.size > MAX_NOTE_BYTES) {
      throw new Error(`Note exceeds maximum readable size (2 MiB): ${relativePath}`);
    }
    const content = await fsp.readFile(resolvedPath, 'utf8');
    const ext = path.extname(resolvedPath);
    const baseName = path.basename(resolvedPath);
    const title = ext ? baseName.slice(0, baseName.length - ext.length) : baseName;
    const metadata = parseNoteMetadata(content);
    const vaultName = path.basename(vaultRoot) || vaultRoot;

    return {
      vaultPath: vaultRoot,
      vaultName,
      path: relativePath,
      name: baseName,
      title,
      content,
      frontmatter: metadata.frontmatter,
      tags: metadata.tags,
      links: metadata.links,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      obsidianUri: `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(relativePath)}`,
      revision,
    };
  }

  async function writeNote(vaultPath, notePath, content, mode = 'overwrite') {
    if (typeof content !== 'string') {
      throw new Error('Note content must be a string.');
    }
    const { vaultRoot, resolvedPath, relativePath } = resolveSafeNotePath(vaultPath, notePath, true);
    await fsp.mkdir(path.dirname(resolvedPath), { recursive: true });

    let finalContent = content;
    if (mode === 'create') {
      const exists = await fsp
        .stat(resolvedPath)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        throw new Error(`Note already exists: ${relativePath}`);
      }
    } else if (mode === 'append') {
      let existing = '';
      try {
        existing = await fsp.readFile(resolvedPath, 'utf8');
      } catch {
        existing = '';
      }
      const sep = existing.length > 0 && !existing.endsWith('\n') ? '\n\n' : existing.length > 0 ? '\n' : '';
      finalContent = `${existing}${sep}${content}`;
    }

    await fsp.writeFile(resolvedPath, finalContent, 'utf8');
    bumpRevision();

    // Update cached active context if this note is currently active
    if (
      globalActiveContext &&
      normalizeVaultKey(globalActiveContext.vaultPath) === normalizeVaultKey(vaultRoot) &&
      globalActiveContext.notePath === relativePath
    ) {
      globalActiveContext = {
        ...globalActiveContext,
        noteContent: finalContent,
        updatedAt: Date.now(),
      };
    }
    for (const [sid, ctxItem] of activeContexts.entries()) {
      if (
        normalizeVaultKey(ctxItem.vaultPath) === normalizeVaultKey(vaultRoot) &&
        ctxItem.notePath === relativePath
      ) {
        activeContexts.set(sid, {
          ...ctxItem,
          noteContent: finalContent,
          updatedAt: Date.now(),
        });
      }
    }

    return readNote(vaultRoot, relativePath);
  }

  async function deleteNote(vaultPath, notePath) {
    const { vaultRoot, resolvedPath, relativePath } = resolveSafeNotePath(vaultPath, notePath, false);
    const stat = await fsp.stat(resolvedPath).catch(() => null);
    if (!stat || !stat.isFile()) {
      throw new Error(`Note not found: ${relativePath}`);
    }
    const trashPath = path.join(vaultRoot, '.trash', relativePath);
    await fsp.mkdir(path.dirname(trashPath), { recursive: true });
    try {
      await fsp.rename(resolvedPath, trashPath);
    } catch {
      await fsp.copyFile(resolvedPath, trashPath);
      await fsp.unlink(resolvedPath);
    }
    bumpRevision();
    return {
      deleted: true,
      vaultPath: vaultRoot,
      path: relativePath,
      trashedTo: `.trash/${relativePath}`,
      revision,
    };
  }

  async function searchNotes(vaultPath, query, limit = 30) {
    if (typeof query !== 'string' || query.trim() === '') {
      return { vaultPath, query: '', results: [], revision };
    }
    const listing = await listNotes(vaultPath);
    const needle = query.trim().toLowerCase();
    const results = [];

    for (const note of listing.notes) {
      if (results.length >= limit) break;
      const pathMatch = note.path.toLowerCase().includes(needle) || note.title.toLowerCase().includes(needle);
      const matches = [];

      try {
        if (note.size <= MAX_NOTE_BYTES) {
          const fullPath = path.join(listing.vaultPath, note.path);
          const text = await fsp.readFile(fullPath, 'utf8');
          const lines = text.split(/\r?\n/);
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(needle)) {
              matches.push({
                line: i + 1,
                snippet: lines[i].slice(0, 180),
              });
              if (matches.length >= 4) break;
            }
          }
        }
      } catch {
        // ignore read error on individual file
      }

      if (pathMatch || matches.length > 0) {
        results.push({
          path: note.path,
          title: note.title,
          folder: note.folder,
          mtimeMs: note.mtimeMs,
          pathMatch,
          matches,
        });
      }
    }

    return {
      vaultPath: listing.vaultPath,
      query: query.trim(),
      results,
      revision,
    };
  }

  async function syncActiveContext(payload = {}) {
    const {
      sessionId,
      vaultPath,
      vaultName,
      notePath,
      noteTitle,
      noteContent,
      selectedText,
    } = payload || {};

    if (!vaultPath) {
      if (sessionId) activeContexts.delete(sessionId);
      globalActiveContext = null;
      return { synced: true, activeContext: null, revision };
    }

    let resolvedContent = typeof noteContent === 'string' ? noteContent : undefined;
    let frontmatter = {};
    if (notePath && resolvedContent === undefined) {
      try {
        const readRes = await readNote(vaultPath, notePath);
        resolvedContent = readRes.content;
        frontmatter = readRes.frontmatter || {};
      } catch {
        resolvedContent = '';
      }
    } else if (typeof resolvedContent === 'string') {
      frontmatter = parseNoteMetadata(resolvedContent).frontmatter;
    }

    const record = {
      sessionId: sessionId || null,
      vaultPath: path.resolve(vaultPath),
      vaultName: vaultName || path.basename(vaultPath) || vaultPath,
      notePath: notePath || null,
      noteTitle: noteTitle || (notePath ? path.basename(notePath, path.extname(notePath)) : null),
      noteContent: resolvedContent || '',
      frontmatter,
      selectedText: typeof selectedText === 'string' ? selectedText : '',
      updatedAt: Date.now(),
    };

    if (sessionId) {
      activeContexts.set(sessionId, record);
    }
    globalActiveContext = record;

    return {
      synced: true,
      activeContext: {
        sessionId: record.sessionId,
        vaultPath: record.vaultPath,
        vaultName: record.vaultName,
        notePath: record.notePath,
        noteTitle: record.noteTitle,
        selectedText: record.selectedText,
        updatedAt: record.updatedAt,
      },
      revision,
    };
  }

  function getActiveContextForPrompt() {
    return globalActiveContext;
  }

  function getStatus() {
    return {
      revision,
      activeContext: globalActiveContext
        ? {
            sessionId: globalActiveContext.sessionId,
            vaultPath: globalActiveContext.vaultPath,
            vaultName: globalActiveContext.vaultName,
            notePath: globalActiveContext.notePath,
            noteTitle: globalActiveContext.noteTitle,
            updatedAt: globalActiveContext.updatedAt,
          }
        : null,
    };
  }

  return {
    listVaults,
    addVault,
    removeVault,
    listNotes,
    readNote,
    writeNote,
    deleteNote,
    searchNotes,
    syncActiveContext,
    getActiveContextForPrompt,
    getStatus,
  };
}

/**
 * Register HTTP / Connection RPC endpoint handler for `/dsh-obsidian`.
 */
function registerRpcRoutes(ctx, service) {
  const dispatch = async (endpoint, payload = {}) => {
    switch (endpoint) {
      case 'vaults.list':
        return await service.listVaults();
      case 'vaults.add':
        return await service.addVault(payload?.path, Boolean(payload?.createIfMissing));
      case 'vaults.remove':
        return await service.removeVault(payload?.path);
      case 'notes.list':
        return await service.listNotes(payload?.vaultPath);
      case 'notes.read':
        return await service.readNote(payload?.vaultPath, payload?.notePath);
      case 'notes.write':
        return await service.writeNote(
          payload?.vaultPath,
          payload?.notePath,
          payload?.content ?? '',
          payload?.mode || 'overwrite'
        );
      case 'notes.delete':
        return await service.deleteNote(payload?.vaultPath, payload?.notePath);
      case 'notes.search':
        return await service.searchNotes(payload?.vaultPath, payload?.query ?? '', payload?.limit ?? 30);
      case 'context.sync':
        return await service.syncActiveContext(payload);
      case 'status.poll':
        return service.getStatus();
      default:
        throw new Error(`Unknown Obsidian RPC endpoint: ${endpoint}`);
    }
  };

  const rpcHandler = async (endpoint, payload) => {
    try {
      const value = await dispatch(endpoint, payload);
      return { ok: true, value };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'obsidian/operation-failed',
          message: error instanceof Error ? error.message : String(error),
          details: {},
        },
      };
    }
  };

  const webServer = ctx.get?.('webServer');
  const connection = ctx.get?.('connection');

  const disposers = [];

  if (webServer && typeof webServer.register === 'function') {
    const disposeWeb = webServer.register({
      kind: 'prefix',
      path: RPC_CHANNEL,
      handler: async (req, res) => {
        const rejection = connection?.requestRejection?.(req);
        if (rejection !== undefined) {
          res.writeHead(rejection, { 'content-type': 'text/plain; charset=utf-8' });
          res.end(rejection === 401 ? 'unauthorized' : 'forbidden');
          return;
        }
        const url = new URL(req.url ?? '/', 'http://dsh.internal');
        if (!url.pathname.startsWith(`${RPC_CHANNEL}/`)) {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('not found');
          return;
        }
        const endpoint = url.pathname.slice(RPC_CHANNEL.length + 1);
        if (req.method !== 'POST' || !endpoint) {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('not found');
          return;
        }
        let body = {};
        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const raw = Buffer.concat(chunks).toString('utf8');
          body = raw ? JSON.parse(raw) : {};
        } catch {
          res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('invalid JSON body');
          return;
        }

        // Support both DSH `client-request` envelope (`ctx.connection.rpc.call`) and plain JSON body
        if (body && body.type === 'client-request' && typeof body.rpcId === 'string') {
          const result = await rpcHandler(endpoint, body.payload);
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          res.end(
            JSON.stringify({
              type: 'server-response',
              rpcId: body.rpcId,
              result,
            })
          );
          return;
        }

        const result = await rpcHandler(endpoint, body);
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      },
    });
    disposers.push(disposeWeb);
  } else if (connection?.rpc?.handle) {
    const disposeRpc = connection.rpc.handle(RPC_CHANNEL, rpcHandler);
    disposers.push(() => {
      Promise.resolve(disposeRpc()).catch(() => {});
    });
  }

  return () => {
    for (const d of disposers) {
      try {
        d();
      } catch {
        // ignore
      }
    }
  };
}

/**
 * Register AI Agent tools (`obsidian_vaults` and `obsidian_notes`) sharing the exact same service operations.
 */
function registerAgentTools(toolsService, service) {
  const disposeVaultsTool = toolsService.register({
    name: 'obsidian_vaults',
    description:
      'List, add, or remove local Obsidian vaults connected to DeepSeek Harness. Use action="list" to see all discovered and custom Obsidian vaults with their paths and note counts.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['action'],
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'add', 'remove'],
          description: 'Vault operation: "list" all vaults, "add" a vault directory path, or "remove" a vault path.',
        },
        path: {
          type: 'string',
          description: 'Absolute directory path of the Obsidian vault (required for "add" and "remove").',
        },
        createIfMissing: {
          type: 'boolean',
          description: 'When action="add", create the directory and .obsidian folder if it does not exist.',
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
      render(_args, value) {
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }];
      },
    },
    async execute(args) {
      const { action, path: vaultPath, createIfMissing } = args || {};
      if (action === 'list') {
        return await service.listVaults();
      }
      if (action === 'add') {
        return await service.addVault(vaultPath, Boolean(createIfMissing));
      }
      if (action === 'remove') {
        return await service.removeVault(vaultPath);
      }
      throw new Error(`Unsupported obsidian_vaults action: ${String(action)}`);
    },
    presentCall(args) {
      return {
        card: 'generic',
        title: `Obsidian vaults (${args?.action || 'list'})`,
        kind: args?.action === 'list' ? 'read' : 'edit',
        rawInput: args,
      };
    },
  });

  const disposeNotesTool = toolsService.register({
    name: 'obsidian_notes',
    description:
      'Browse, read, search, create, update, append, or delete Markdown notes inside a connected Obsidian vault. When the user is viewing a note in the Obsidian panel, its vaultPath and notePath are also provided in the active Obsidian context.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['action', 'vaultPath'],
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'read', 'write', 'append', 'create', 'search', 'delete'],
          description:
            'Operation on the Obsidian vault: "list" note tree, "read" a note, "write" (overwrite) a note, "append" to a note, "create" a new note, "search" notes by keyword, or "delete" (move to .trash).',
        },
        vaultPath: {
          type: 'string',
          description: 'Absolute root path of the target Obsidian vault.',
        },
        notePath: {
          type: 'string',
          description: 'Vault-relative path of the Markdown note (e.g. "Daily/2026-11-08.md"). Required for read/write/append/create/delete.',
        },
        content: {
          type: 'string',
          description: 'Markdown content to write or append (required for write/append/create).',
        },
        query: {
          type: 'string',
          description: 'Search keyword or phrase when action="search".',
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
      render(_args, value) {
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }];
      },
    },
    async execute(args) {
      const { action, vaultPath, notePath, content, query } = args || {};
      switch (action) {
        case 'list':
          return await service.listNotes(vaultPath);
        case 'read':
          return await service.readNote(vaultPath, notePath);
        case 'write':
          return await service.writeNote(vaultPath, notePath, content ?? '', 'overwrite');
        case 'append':
          return await service.writeNote(vaultPath, notePath, content ?? '', 'append');
        case 'create':
          return await service.writeNote(vaultPath, notePath, content ?? '', 'create');
        case 'search':
          return await service.searchNotes(vaultPath, query ?? '');
        case 'delete':
          return await service.deleteNote(vaultPath, notePath);
        default:
          throw new Error(`Unsupported obsidian_notes action: ${String(action)}`);
      }
    },
    presentCall(args) {
      const act = args?.action || 'read';
      const target = args?.notePath || args?.query || args?.vaultPath || '';
      return {
        card: 'generic',
        title: `Obsidian ${act}: ${target}`,
        kind: act === 'read' || act === 'list' ? 'read' : act === 'search' ? 'search' : act === 'delete' ? 'delete' : 'edit',
        rawInput: args,
      };
    },
  });

  return () => {
    disposeVaultsTool();
    disposeNotesTool();
  };
}

/**
 * Host entry point for `@local/dsh-obsidian`.
 */
export function apply(ctx, config = {}) {
  const service = createObsidianService(ctx, config);

  // 1. Register HTTP / Connection RPC routes when webServer & connection are available
  ctx.inject(['webServer', 'connection'], (webCtx) => {
    webCtx.effect(() => registerRpcRoutes(webCtx, service), 'dsh-obsidian: rpc routes');
  });

  // 2. Register AI Agent tools (`obsidian_vaults`, `obsidian_notes`)
  ctx.inject(['tools'], (toolCtx) => {
    toolCtx.effect(() => registerAgentTools(toolCtx.tools, service), 'dsh-obsidian: agent tools');
  });

  // 3. Register dynamic System Prompt context so the AI knows the currently viewed vault & note
  ctx.inject(['systemPrompt'], (promptCtx) => {
    promptCtx.effect(
      () =>
        promptCtx.systemPrompt.context({
          name: 'obsidian:active-context',
          order: 650,
          text: () => {
            const active = service.getActiveContextForPrompt();
            if (!active || !active.vaultPath) return '';
            const lines = [
              '<obsidian-active-context>',
              `Active Obsidian Vault: "${active.vaultName}" (${active.vaultPath})`,
            ];
            if (active.notePath) {
              lines.push(`Currently Viewed Note in Obsidian Panel: "${active.notePath}" (Title: "${active.noteTitle || active.notePath}")`);
              if (active.frontmatter && Object.keys(active.frontmatter).length > 0) {
                lines.push(`Note Frontmatter: ${JSON.stringify(active.frontmatter)}`);
              }
              if (active.selectedText && active.selectedText.trim() !== '') {
                lines.push(`User Highlighted Selection in Note:\n"""\n${active.selectedText.slice(0, 4000)}\n"""`);
              }
              if (typeof active.noteContent === 'string' && active.noteContent.trim() !== '') {
                const preview =
                  active.noteContent.length > MAX_PROMPT_NOTE_CHARS
                    ? `${active.noteContent.slice(0, MAX_PROMPT_NOTE_CHARS)}\n...(truncated)...`
                    : active.noteContent;
                lines.push(`Current Note Content:\n\`\`\`markdown\n${preview}\n\`\`\``);
              }
            } else {
              lines.push('No specific note is currently open in the viewer.');
            }
            lines.push(
              'You can use `obsidian_notes` (list, read, write, append, create, search, delete) and `obsidian_vaults` (list, add, remove) to read or modify notes in this Obsidian vault.'
            );
            lines.push('</obsidian-active-context>');
            return lines.join('\n');
          },
        }),
      'dsh-obsidian: system-prompt active context'
    );
  });
}
