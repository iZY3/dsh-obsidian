window.__ModuleLoader__.load({
  id: '@local/dsh-obsidian',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    const NS = 'dshObsidian';
    const PANEL_ID = 'obsidian';
    const RPC_CHANNEL = '/dsh-obsidian';
    const CHAT_SLOT = 'obsidian.chat.conversation';

    const DICTIONARIES = {
      zh: {
        'sidebar.label': 'Obsidian',
        'header.title': 'Obsidian \u7b14\u8bb0\u5de5\u4f5c\u53f0',
        'header.subtitle': '\u8fde\u63a5\u672c\u5730 Obsidian \u5e93\uff0c\u5728\u9605\u8bfb\u548c\u7f16\u8f91\u7b14\u8bb0\u7684\u540c\u65f6\u4e0e AI \u6df1\u5ea6\u5bf9\u8bdd',
        'vaults.refresh': '\u5237\u65b0\u5217\u8868',
        'vaults.addFolder': '\u9009\u62e9\u672c\u5730\u5e93\u76ee\u5f55',
        'vaults.addManual': '\u8f93\u5165\u8def\u5f84\u6dfb\u52a0',
        'vaults.manualPlaceholder': '\u8f93\u5165\u672c\u5730 Obsidian \u5e93\u6587\u4ef6\u5939\u7edd\u5bf9\u8def\u5f84\uff0c\u4f8b\u5982 D:\\Notes\\MyVault',
        'vaults.confirmAdd': '\u6dfb\u52a0\u5e76\u8fde\u63a5',
        'vaults.cancel': '\u53d6\u6d88',
        'vaults.emptyTitle': '\u6682\u672a\u53d1\u73b0\u672c\u5730 Obsidian \u5e93',
        'vaults.emptyDesc': '\u5982\u679c\u5df2\u5b89\u88c5 Obsidian\uff0c\u7cfb\u7edf\u4f1a\u81ea\u52a8\u8bfb\u53d6 obsidian.json\uff1b\u4f60\u4e5f\u53ef\u4ee5\u70b9\u51fb\u4e0a\u65b9\u6309\u94ae\u76f4\u63a5\u9009\u62e9\u4efb\u610f\u7b14\u8bb0\u6587\u4ef6\u5939\u3002',
        'vaults.openStudio': '\u8fdb\u5165\u5e93\u5e76\u5f00\u542f AI \u5bf9\u8bdd',
        'vaults.remove': '\u79fb\u9664',
        'vaults.noteCount': '{count} \u7bc7\u7b14\u8bb0',
        'vaults.source.obsidian': '\u81ea\u52a8\u53d1\u73b0',
        'vaults.source.custom': '\u624b\u52a8\u8fde\u63a5',
        'vaults.status.missing': '\u8def\u5f84\u4e0d\u5b58\u5728',
        'vaults.status.ready': '\u5df2\u5c31\u7eea',
        'studio.backToVaults': '\u5207\u6362\u5e93',
        'studio.allVaults': '\u6240\u6709\u5e93',
        'studio.searchPlaceholder': '\u641c\u7d22\u7b14\u8bb0\u6807\u9898\u6216\u6b63\u6587\u5185\u5bb9\u2026',
        'studio.newNote': '\u65b0\u5efa\u7b14\u8bb0',
        'studio.newNotePrompt': '\u8f93\u5165\u65b0\u7b14\u8bb0\u76f8\u5bf9\u8def\u5f84\uff08\u4f8b\u5982 Daily/\u4eca\u65e5\u7b14\u8bb0.md\uff09\uff1a',
        'studio.save': '\u4fdd\u5b58',
        'studio.saving': '\u4fdd\u5b58\u4e2d\u2026',
        'studio.saved': '\u5df2\u4fdd\u5b58',
        'studio.unsaved': '\u672a\u4fdd\u5b58\u4fee\u6539',
        'studio.deleteNote': '\u79fb\u81f3\u56de\u6536\u7ad9',
        'studio.mode.preview': '\u9605\u8bfb\u89c6\u56fe',
        'studio.mode.split': '\u5206\u680f\u89c6\u56fe',
        'studio.mode.edit': '\u7f16\u8f91\u6e90\u7801',
        'studio.toggleTree': '\u6298\u53e0/\u5c55\u5f00\u76ee\u5f55\u6811',
        'studio.toggleChat': '\u6298\u53e0/\u5c55\u5f00 AI \u5bf9\u8bdd\u680f',
        'studio.openMainChat': '\u5728\u4e3b\u754c\u9762\u6253\u5f00\u6b64\u4f1a\u8bdd',
        'studio.newChatSession': '\u65b0\u5efa\u5bf9\u8bdd',
        'studio.noNoteSelected': '\u4ece\u5de6\u4fa7\u76ee\u5f55\u6811\u9009\u62e9\u4e00\u7bc7\u7b14\u8bb0\uff0c\u6216\u70b9\u51fb\u201c\u65b0\u5efa\u7b14\u8bb0\u201d\u5f00\u59cb\u7f16\u5199',
        'studio.contextSynced': '\u5df2\u540c\u6b65\u81f3 AI \u4e0a\u4e0b\u6587\uff1a{note}',
        'studio.contextVaultOnly': '\u5df2\u8fde\u63a5\u5e93\uff1a{vault}',
        'studio.aiSummarize': 'AI \u603b\u7ed3\u6b64\u7b14\u8bb0',
        'studio.aiPolish': 'AI \u6da6\u8272\u4e0e\u7ed3\u6784\u4f18\u5316',
        'studio.aiTodos': '\u63d0\u53d6\u5f85\u529e\u4e0e\u884c\u52a8\u9879',
        'studio.aiAskSelection': '\u5411 AI \u63d0\u95ee\u9009\u4e2d\u5185\u5bb9',
        'studio.prompt.summarize': '\u8bf7\u9605\u8bfb\u6211\u5f53\u524d\u5728 Obsidian \u4e2d\u6253\u5f00\u7684\u7b14\u8bb0\u300a{title}\u300b\uff08\u8def\u5f84\uff1a{path}\uff09\uff0c\u4e3a\u6211\u63d0\u4f9b\u7ed3\u6784\u5316\u7684\u6838\u5fc3\u8981\u70b9\u603b\u7ed3\u3002',
        'studio.prompt.polish': '\u8bf7\u9605\u8bfb\u6211\u5f53\u524d\u6253\u5f00\u7684 Obsidian \u7b14\u8bb0\u300a{title}\u300b\uff08\u8def\u5f84\uff1a{path}\uff09\uff0c\u63d0\u51fa\u6392\u7248\u3001\u7ed3\u6784\u6216\u8868\u8fbe\u4e0a\u7684\u6da6\u8272\u5efa\u8bae\uff1b\u5982\u679c\u5408\u9002\uff0c\u53ef\u4ee5\u4f7f\u7528 obsidian_notes \u5de5\u5177\u66f4\u65b0\u7b14\u8bb0\u3002',
        'studio.prompt.todos': '\u8bf7\u4ece\u6211\u5f53\u524d\u6253\u5f00\u7684 Obsidian \u7b14\u8bb0\u300a{title}\u300b\uff08\u8def\u5f84\uff1a{path}\uff09\u4e2d\u63d0\u53d6\u6240\u6709\u5f85\u529e\u4e8b\u9879\u3001\u5173\u952e\u95ee\u9898\u4e0e\u4e0b\u4e00\u6b65\u884c\u52a8\u9879\u3002',
        'studio.prompt.askSelection': '\u5173\u4e8e\u5f53\u524d\u7b14\u8bb0\u300a{title}\u300b\u4e2d\u7684\u8fd9\u6bb5\u5185\u5bb9\uff1a\n\n> {selection}\n\n\u8bf7\u5e2e\u6211\u6df1\u5165\u5206\u6790\u5e76\u89e3\u7b54\uff1a',
        'studio.searchResults': '\u641c\u7d22\u7ed3\u679c ({count})',
        'studio.clearSearch': '\u6e05\u9664\u641c\u7d22',
        'studio.frontmatter': '\u7b14\u8bb0\u5c5e\u6027',
        'studio.tags': '\u6807\u7b7e',
        'studio.links': '\u53cc\u94fe\u5f15\u7528',
        'studio.connectingSession': '\u6b63\u5728\u8fde\u63a5\u8be5 Obsidian \u5e93\u7684 AI \u4f1a\u8bdd\u2026',
        'studio.sessionError': 'AI \u4f1a\u8bdd\u8fde\u63a5\u5931\u8d25\uff1a{message}',
        'studio.retrySession': '\u91cd\u8bd5\u8fde\u63a5',
        'studio.emptyTree': '\u8be5\u5e93\u6682\u65e0 Markdown \u7b14\u8bb0',
      },
      en: {
        'sidebar.label': 'Obsidian',
        'header.title': 'Obsidian vault workspace',
        'header.subtitle': 'Connect local Obsidian vaults to browse notes and chat with AI side-by-side',
        'vaults.refresh': 'Refresh',
        'vaults.addFolder': 'Pick vault folder',
        'vaults.addManual': 'Add by path',
        'vaults.manualPlaceholder': 'Enter absolute path to an Obsidian vault folder, e.g. D:\\Notes\\MyVault',
        'vaults.confirmAdd': 'Add vault',
        'vaults.cancel': 'Cancel',
        'vaults.emptyTitle': 'No Obsidian vaults found yet',
        'vaults.emptyDesc': 'Vaults from obsidian.json are discovered automatically, or you can pick any folder above.',
        'vaults.openStudio': 'Open vault & chat with AI',
        'vaults.remove': 'Remove',
        'vaults.noteCount': '{count} notes',
        'vaults.source.obsidian': 'Auto-discovered',
        'vaults.source.custom': 'Custom',
        'vaults.status.missing': 'Missing path',
        'vaults.status.ready': 'Ready',
        'studio.backToVaults': 'Switch vault',
        'studio.allVaults': 'All vaults',
        'studio.searchPlaceholder': 'Search note titles or content\u2026',
        'studio.newNote': 'New note',
        'studio.newNotePrompt': 'Enter relative path for the new note (e.g. Daily/Note.md):',
        'studio.save': 'Save',
        'studio.saving': 'Saving\u2026',
        'studio.saved': 'Saved',
        'studio.unsaved': 'Unsaved changes',
        'studio.deleteNote': 'Move to trash',
        'studio.mode.preview': 'Reading view',
        'studio.mode.split': 'Split view',
        'studio.mode.edit': 'Source edit',
        'studio.toggleTree': 'Toggle file tree',
        'studio.toggleChat': 'Toggle AI chat pane',
        'studio.openMainChat': 'Open session in main chat',
        'studio.newChatSession': 'New chat',
        'studio.noNoteSelected': 'Select a note from the file tree on the left, or create a new note',
        'studio.contextSynced': 'Synced to AI context: {note}',
        'studio.contextVaultOnly': 'Connected vault: {vault}',
        'studio.aiSummarize': 'Summarize note',
        'studio.aiPolish': 'Polish & structure',
        'studio.aiTodos': 'Extract action items',
        'studio.aiAskSelection': 'Ask AI about selection',
        'studio.prompt.summarize': 'Please read my currently open Obsidian note "{title}" (path: {path}) and provide a structured summary of its key points.',
        'studio.prompt.polish': 'Please review my currently open Obsidian note "{title}" (path: {path}) and suggest improvements to its structure and clarity.',
        'studio.prompt.todos': 'Please extract all action items, todos, and open questions from my currently open Obsidian note "{title}" (path: {path}).',
        'studio.prompt.askSelection': 'Regarding this excerpt from note "{title}":\n\n> {selection}\n\nPlease explain and analyze:',
        'studio.searchResults': 'Search results ({count})',
        'studio.clearSearch': 'Clear',
        'studio.frontmatter': 'Properties',
        'studio.tags': 'Tags',
        'studio.links': 'Outlinks',
        'studio.connectingSession': 'Connecting AI session for this Obsidian vault\u2026',
        'studio.sessionError': 'AI session connection failed: {message}',
        'studio.retrySession': 'Retry connection',
        'studio.emptyTree': 'No Markdown notes in this vault yet',
      },
    };

    const STYLE_TAG_ID = '@local/dsh-obsidian/styles';
    const CSS_TEXT = `
      .dshObsRoot {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-family: inherit;
        overflow: hidden;
      }
      .dshObsVaultPage {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 36px 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .dshObsVaultContainer {
        width: 100%;
        max-width: 1040px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .dshObsPageHeader {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsTitleGroup {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .dshObsTitleText {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .dshObsTitle {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 28px;
        color: var(--dsw-alias-label-primary);
      }
      .dshObsSubtitle {
        margin: 0;
        font-size: 13px;
        line-height: 20px;
        color: var(--dsw-alias-label-secondary);
      }
      .dshObsHeaderActions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .dshObsBtn {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .dshObsBtn:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2);
        border-color: var(--dsw-alias-border-l2);
      }
      .dshObsBtn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .dshObsBtnPrimary {
        background: var(--dsw-alias-brand-primary);
        border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
      }
      .dshObsBtnPrimary:hover:not(:disabled) {
        background: var(--dsw-alias-brand-primary);
        border-color: var(--dsw-alias-brand-primary);
        opacity: 0.9;
      }
      .dshObsBtnSmall {
        height: 26px;
        padding: 0 9px;
        font-size: 12px;
        border-radius: 6px;
      }
      .dshObsBtnGhost {
        background: transparent;
        border-color: transparent;
        color: var(--dsw-alias-label-secondary);
      }
      .dshObsBtnGhost:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2);
        border-color: transparent;
        color: var(--dsw-alias-label-primary);
      }
      .dshObsManualBar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsInput {
        box-sizing: border-box;
        flex: 1;
        min-width: 0;
        height: 32px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        outline: none;
      }
      .dshObsInput:focus {
        border-color: var(--dsw-alias-brand-primary);
      }
      .dshObsVaultGrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      .dshObsVaultCard {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        padding: 18px;
        border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1);
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .dshObsVaultCard:hover {
        border-color: var(--dsw-alias-border-l2);
        background: var(--dsw-alias-bg-layer-2);
      }
      .dshObsVaultCardTop {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .dshObsVaultCardHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .dshObsVaultName {
        font-size: 16px;
        font-weight: 600;
        color: var(--dsw-alias-label-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dshObsBadgeRow {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .dshObsBadge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        border: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsBadgeSuccess {
        color: var(--dsw-alias-state-success-primary);
      }
      .dshObsBadgeWarn {
        color: var(--dsw-alias-state-warn-primary);
      }
      .dshObsVaultPath {
        font-size: 12px;
        line-height: 18px;
        color: var(--dsw-alias-label-secondary);
        word-break: break-all;
      }
      .dshObsVaultMeta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
      }
      .dshObsVaultActions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsEmptyState {
        padding: 48px 24px;
        border-radius: 12px;
        border: 1px dashed var(--dsw-alias-border-l2);
        background: var(--dsw-alias-bg-layer-1);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
      }
      .dshObsErrorBanner {
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid var(--dsw-alias-state-error-primary);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-state-error-primary);
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      /* Studio Split View */
      .dshObsStudio {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .dshObsTopbar {
        box-sizing: border-box;
        min-height: 46px;
        padding: 6px 14px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-specific-sidebar-fill);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .dshObsTopbarLeft,
      .dshObsTopbarCenter,
      .dshObsTopbarRight {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .dshObsNoteBreadcrumb {
        font-size: 13px;
        font-weight: 500;
        color: var(--dsw-alias-label-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 340px;
      }
      .dshObsColumns {
        flex: 1;
        min-height: 0;
        min-width: 0;
        display: flex;
        flex-direction: row;
        overflow: hidden;
      }
      .dshObsTreePane {
        box-sizing: border-box;
        width: 250px;
        min-width: 190px;
        max-width: 360px;
        border-right: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-specific-sidebar-fill);
        display: flex;
        flex-direction: column;
        min-height: 0;
        flex: none;
      }
      .dshObsTreeHeader {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsTreeScroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 6px;
      }
      .dshObsTreeItem {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
      }
      .dshObsTreeItem:hover {
        background: var(--dsw-alias-bg-layer-2);
      }
      .dshObsTreeItemActive {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-brand-primary);
        font-weight: 600;
      }
      .dshObsTreeLabel {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dshObsNotePane {
        flex: 1;
        min-width: 280px;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: var(--dsw-alias-bg-base);
        overflow: hidden;
      }
      .dshObsAiActionBar {
        box-sizing: border-box;
        padding: 6px 16px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .dshObsSyncStatus {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dshObsSyncDot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--dsw-alias-state-success-primary);
        flex: none;
      }
      .dshObsNoteBodyWrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: row;
        overflow: hidden;
      }
      .dshObsEditorCol,
      .dshObsPreviewCol {
        flex: 1;
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
      }
      .dshObsEditorCol {
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsTextarea {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        flex: 1;
        padding: 20px 24px;
        border: none;
        outline: none;
        resize: none;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 14px;
        line-height: 1.65;
      }
      .dshObsPreviewCol {
        padding: 24px 32px;
      }
      .dshObsMarkdown {
        max-width: 760px;
        margin: 0 auto;
        font-size: 14px;
        line-height: 1.7;
        color: var(--dsw-alias-label-primary);
        word-break: break-word;
      }
      .dshObsMarkdown h1,
      .dshObsMarkdown h2,
      .dshObsMarkdown h3,
      .dshObsMarkdown h4 {
        margin: 1.1em 0 0.45em;
        font-weight: 600;
        line-height: 1.35;
        color: var(--dsw-alias-label-primary);
      }
      .dshObsMarkdown h1 {
        font-size: 24px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dshObsMarkdown h2 { font-size: 19px; }
      .dshObsMarkdown h3 { font-size: 16px; }
      .dshObsMarkdown p { margin: 0.65em 0; }
      .dshObsMarkdown ul,
      .dshObsMarkdown ol {
        margin: 0.5em 0;
        padding-left: 22px;
      }
      .dshObsMarkdown blockquote {
        margin: 0.8em 0;
        padding: 6px 14px;
        border-left: 3px solid var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        border-radius: 0 6px 6px 0;
      }
      .dshObsMarkdown pre {
        margin: 0.8em 0;
        padding: 12px 14px;
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1);
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 13px;
        line-height: 1.5;
      }
      .dshObsMarkdown code {
        padding: 1px 5px;
        border-radius: 4px;
        background: var(--dsw-alias-bg-layer-2);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.9em;
      }
      .dshObsMarkdown pre code {
        padding: 0;
        background: transparent;
      }
      .dshObsWikilink {
        display: inline;
        padding: 0 3px;
        border-radius: 4px;
        border: none;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-brand-primary);
        font-size: inherit;
        font-family: inherit;
        cursor: pointer;
        text-decoration: underline;
      }
      .dshObsWikilink:hover {
        opacity: 0.85;
      }
      .dshObsMetaBox {
        margin-bottom: 18px;
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1);
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12px;
      }
      .dshObsMetaRow {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .dshObsSplitter {
        width: 5px;
        cursor: col-resize;
        background: transparent;
        border-left: 1px solid var(--dsw-alias-border-l1);
        flex: none;
      }
      .dshObsSplitter:hover {
        background: var(--dsw-alias-bg-layer-2);
      }
      .dshObsChatPane {
        box-sizing: border-box;
        min-width: 320px;
        max-width: 720px;
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: var(--dsw-alias-bg-base);
        flex: none;
        overflow: hidden;
      }
      .dshObsChatHeader {
        box-sizing: border-box;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .dshObsSelect {
        box-sizing: border-box;
        height: 26px;
        max-width: 200px;
        padding: 0 8px;
        border-radius: 6px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
      }
      .dshObsChatBody {
        flex: 1;
        min-height: 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }
    `;

    function ensureStyles() {
      if (typeof document === 'undefined') return () => {};
      let styleEl = document.querySelector(`style[data-plugin-css="${STYLE_TAG_ID}"]`);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.dataset.plugin = '@local/dsh-obsidian';
        styleEl.dataset.pluginCss = STYLE_TAG_ID;
        styleEl.textContent = CSS_TEXT;
        document.head.appendChild(styleEl);
      }
      return () => {
        if (styleEl && styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      };
    }

    /**
     * Format timestamp into concise readable date.
     */
    function formatTime(ms) {
      if (!ms || ms <= 0) return '';
      try {
        const d = new Date(ms);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } catch {
        return '';
      }
    }

    /**
     * Normalize paths for comparison across Windows and POSIX.
     */
    function normalizePathCompare(p) {
      if (typeof p !== 'string') return '';
      return p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
    }

    /**
     * Sidebar icon component rendered inside `sidebar.panellist`.
     */
    function ObsidianSidebarIcon(props) {
      const size = props?.size ?? 18;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block', flexShrink: 0 },
        },
        h('polygon', {
          points: '11,2 18,5.5 19.5,14.5 14,22 6.5,18.5 5,9',
          stroke: 'currentColor',
          strokeWidth: '1.75',
          strokeLinejoin: 'round',
          fill: props?.active ? 'currentColor' : 'none',
          fillOpacity: props?.active ? '0.18' : '0',
        }),
        h('polyline', {
          points: '11,2 13,10 14,22',
          stroke: 'currentColor',
          strokeWidth: '1.4',
          strokeLinejoin: 'round',
        }),
        h('polyline', {
          points: '5,9 13,10 18,5.5',
          stroke: 'currentColor',
          strokeWidth: '1.4',
          strokeLinejoin: 'round',
        })
      );
    }

    /**
     * Fixed Chat selection used by our embedded Conversation occurrence.
     */
    function FixedChatConversationView(props) {
      return h(React.Fragment, null, props.renderSlot('conversation.session', { view: 'chat' }));
    }

    /**
     * Session-scoped Conversation occurrence rendered inside `obsidian.chat.conversation`.
     */
    function ObsidianConversationSlotPanel(props) {
      const { sessionId, useSession, useConversation, useSessions, renderFactorySlot } = props;
      const session = useSession((value) => value);
      const conversation = useConversation((value) => value);
      const summaryBlank = useSessions((state) => (sessionId === undefined ? undefined : state.byId[sessionId]?.blank));
      const shellPhase =
        session === undefined || conversation === undefined
          ? 'blank'
          : conversation.activeTargets.size > 0 || (!session.blank && !session.awaitingFirstTurn) || session.running
          ? 'active'
          : session.promptAttempted
          ? 'engaging'
          : 'blank';
      const settling = shellPhase === 'blank' && session?.openState === 'loading' && summaryBlank !== true;
      const hero = shellPhase === 'blank' && (session?.openState === 'open' || summaryBlank === true);
      return renderFactorySlot(
        'conversation.content',
        {
          variant: 'embedded',
          phase: settling ? 'settling' : hero ? 'hero' : 'active',
          hero,
        },
        { slots: { views: FixedChatConversationView } }
      );
    }

    /**
     * Render inline Markdown tokens including `[[WikiLinks]]`, `code`, **bold**, *italic*, and [links](url).
     */
    function renderInlineMarkdown(text, onOpenWikiLink) {
      if (!text) return null;
      const parts = [];
      const tokenRegex = /(\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
      let lastIndex = 0;
      let match;
      let keyIdx = 0;

      while ((match = tokenRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        if (match[2] !== undefined) {
          const targetNote = match[2].trim();
          const alias = (match[3] || targetNote).trim();
          parts.push(
            h(
              'button',
              {
                key: `wl-${keyIdx++}`,
                type: 'button',
                className: 'dshObsWikilink',
                title: `[[${targetNote}]]`,
                onClick: () => onOpenWikiLink && onOpenWikiLink(targetNote),
              },
              `[[${alias}]]`
            )
          );
        } else if (match[4] !== undefined) {
          parts.push(h('code', { key: `code-${keyIdx++}` }, match[4]));
        } else if (match[5] !== undefined) {
          parts.push(h('strong', { key: `b-${keyIdx++}` }, match[5]));
        } else if (match[6] !== undefined) {
          parts.push(h('em', { key: `i-${keyIdx++}` }, match[6]));
        } else if (match[7] !== undefined && match[8] !== undefined) {
          parts.push(
            h(
              'a',
              {
                key: `a-${keyIdx++}`,
                href: match[8],
                target: '_blank',
                rel: 'noopener noreferrer',
                style: { color: 'var(--dsw-alias-brand-primary)' },
              },
              match[7]
            )
          );
        }
        lastIndex = tokenRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }
      return parts;
    }

    /**
     * Lightweight Markdown renderer supporting YAML frontmatter stripping, headings, code blocks, lists, quotes, and wikilinks.
     */
    function MarkdownPreview({ content, frontmatter, tags, links, onOpenWikiLink, t }) {
      const blocks = useMemo(() => {
        if (typeof content !== 'string') return [];
        const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
        const lines = body.split(/\r?\n/);
        const result = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];

          // Code block
          if (line.trim().startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
              codeLines.push(lines[i]);
              i++;
            }
            i++; // skip closing ```
            result.push(
              h(
                'pre',
                { key: `pre-${i}` },
                h('code', null, codeLines.join('\n'))
              )
            );
            continue;
          }

          // Heading
          const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
          if (headingMatch) {
            const level = Math.min(4, headingMatch[1].length);
            result.push(
              h(`h${level}`, { key: `h-${i}` }, renderInlineMarkdown(headingMatch[2], onOpenWikiLink))
            );
            i++;
            continue;
          }

          // Blockquote
          if (line.trim().startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
              quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
              i++;
            }
            result.push(
              h(
                'blockquote',
                { key: `q-${i}` },
                quoteLines.map((ql, idx) => h('div', { key: idx }, renderInlineMarkdown(ql, onOpenWikiLink)))
              )
            );
            continue;
          }

          // Unordered list
          if (/^\s*[-*+]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
              const rawItem = lines[i].replace(/^\s*[-*+]\s+/, '');
              const taskMatch = /^\[([ xX])\]\s+(.*)$/.exec(rawItem);
              if (taskMatch) {
                const checked = taskMatch[1].toLowerCase() === 'x';
                items.push(
                  h(
                    'li',
                    { key: `li-${i}`, style: { listStyle: 'none', marginLeft: '-18px' } },
                    h('input', {
                      type: 'checkbox',
                      checked,
                      readOnly: true,
                      style: { marginRight: '8px', verticalAlign: 'middle' },
                    }),
                    renderInlineMarkdown(taskMatch[2], onOpenWikiLink)
                  )
                );
              } else {
                items.push(h('li', { key: `li-${i}` }, renderInlineMarkdown(rawItem, onOpenWikiLink)));
              }
              i++;
            }
            result.push(h('ul', { key: `ul-${i}` }, items));
            continue;
          }

          // Horizontal rule
          if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
            result.push(
              h('hr', {
                key: `hr-${i}`,
                style: { border: 'none', borderTop: '1px solid var(--dsw-alias-border-l1)', margin: '16px 0' },
              })
            );
            i++;
            continue;
          }

          // Blank line
          if (line.trim() === '') {
            i++;
            continue;
          }

          // Paragraph
          result.push(h('p', { key: `p-${i}` }, renderInlineMarkdown(line, onOpenWikiLink)));
          i++;
        }
        return result;
      }, [content, onOpenWikiLink]);

      const hasFrontmatter = frontmatter && Object.keys(frontmatter).length > 0;
      const hasTags = Array.isArray(tags) && tags.length > 0;
      const hasLinks = Array.isArray(links) && links.length > 0;

      return h(
        'div',
        { className: 'dshObsMarkdown' },
        (hasFrontmatter || hasTags || hasLinks) &&
          h(
            'div',
            { className: 'dshObsMetaBox' },
            hasFrontmatter &&
              h(
                'div',
                { className: 'dshObsMetaRow' },
                h('strong', { style: { color: 'var(--dsw-alias-label-secondary)' } }, `${t('studio.frontmatter')}:`),
                Object.entries(frontmatter).map(([k, v]) =>
                  h('span', { key: k, className: 'dshObsBadge' }, `${k}: ${String(v)}`)
                )
              ),
            hasTags &&
              h(
                'div',
                { className: 'dshObsMetaRow' },
                h('strong', { style: { color: 'var(--dsw-alias-label-secondary)' } }, `${t('studio.tags')}:`),
                tags.map((tag) => h('span', { key: tag, className: 'dshObsBadge' }, `#${tag}`))
              ),
            hasLinks &&
              h(
                'div',
                { className: 'dshObsMetaRow' },
                h('strong', { style: { color: 'var(--dsw-alias-label-secondary)' } }, `${t('studio.links')}:`),
                links.map((lnk) =>
                  h(
                    'button',
                    {
                      key: lnk,
                      type: 'button',
                      className: 'dshObsWikilink',
                      onClick: () => onOpenWikiLink && onOpenWikiLink(lnk),
                    },
                    `[[${lnk}]]`
                  )
                )
              )
          ),
        blocks
      );
    }

    /**
     * Recursive folder and note tree component.
     */
    function NoteTreeNodes({ nodes, activeNotePath, expandedFolders, onToggleFolder, onSelectNote, depth = 0 }) {
      if (!Array.isArray(nodes) || nodes.length === 0) return null;
      return h(
        React.Fragment,
        null,
        nodes.map((node) => {
          const indentStyle = { paddingLeft: `${8 + depth * 14}px` };
          if (node.type === 'folder') {
            const expanded = expandedFolders.has(node.path);
            return h(
              React.Fragment,
              { key: `folder:${node.path}` },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshObsTreeItem',
                  style: indentStyle,
                  onClick: () => onToggleFolder(node.path),
                },
                h('span', { style: { fontSize: '10px', width: '12px', color: 'var(--dsw-alias-label-secondary)' } }, expanded ? '\u25bc' : '\u25b6'),
                h('span', { className: 'dshObsTreeLabel', style: { fontWeight: 500 } }, node.name)
              ),
              expanded &&
                h(NoteTreeNodes, {
                  nodes: node.children,
                  activeNotePath,
                  expandedFolders,
                  onToggleFolder,
                  onSelectNote,
                  depth: depth + 1,
                })
            );
          }

          const isActive = activeNotePath === node.path;
          return h(
            'button',
            {
              key: `note:${node.path}`,
              type: 'button',
              className: `dshObsTreeItem${isActive ? ' dshObsTreeItemActive' : ''}`,
              style: indentStyle,
              title: node.path,
              onClick: () => onSelectNote(node.path),
            },
            h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, '\ud83d\udcc4'),
            h('span', { className: 'dshObsTreeLabel' }, node.title || node.name)
          );
        })
      );
    }

    /**
     * Main panel component registered at `main` (`key: 'obsidian'`).
     */
    function ObsidianMainPanel(props) {
      const {
        t,
        callHost,
        pickDirectory,
        ensureVaultSession,
        createNewVaultSession,
        openSessionInMain,
        useWorkspaces,
        useSessions,
        SessionProvider,
        renderSlot,
      } = props;

      const [vaults, setVaults] = useState([]);
      const [loadingVaults, setLoadingVaults] = useState(true);
      const [errorMsg, setErrorMsg] = useState(null);
      const [showManualAdd, setShowManualAdd] = useState(false);
      const [manualPath, setManualPath] = useState('');

      // Selected vault studio state
      const [selectedVault, setSelectedVault] = useState(null);
      const [noteTree, setNoteTree] = useState([]);
      const [flatNotes, setFlatNotes] = useState([]);
      const [expandedFolders, setExpandedFolders] = useState(() => new Set());
      const [activeNote, setActiveNote] = useState(null); // { path, title, content, frontmatter, tags, links }
      const [draftContent, setDraftContent] = useState('');
      const [saving, setSaving] = useState(false);
      const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'split' | 'edit'
      const [showTree, setShowTree] = useState(true);
      const [showChat, setShowChat] = useState(true);
      const [chatWidth, setChatWidth] = useState(430);
      const [searchQuery, setSearchQuery] = useState('');
      const [searchResults, setSearchResults] = useState(null);
      const [selectedText, setSelectedText] = useState('');

      // New note inline bar state
      const [creatingNote, setCreatingNote] = useState(false);
      const [newNoteName, setNewNoteName] = useState('');

      // Session binding state for the right-hand AI Conversation pane
      const [activeSessionId, setActiveSessionId] = useState(null);
      const [sessionRef, setSessionRef] = useState(null);
      const [sessionConnecting, setSessionConnecting] = useState(false);
      const [sessionError, setSessionError] = useState(null);

      const lastSeenRevRef = useRef(0);

      const workspacesSnap = useWorkspaces ? useWorkspaces((s) => s) : null;
      const sessionsSnap = useSessions ? useSessions((s) => s) : null;

      const loadVaults = useCallback(async () => {
        setLoadingVaults(true);
        setErrorMsg(null);
        try {
          const data = await callHost('vaults.list', {});
          setVaults(Array.isArray(data?.vaults) ? data.vaults : []);
          if (typeof data?.revision === 'number') {
            lastSeenRevRef.current = data.revision;
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        } finally {
          setLoadingVaults(false);
        }
      }, [callHost]);

      useEffect(() => {
        loadVaults();
      }, [loadVaults]);

      const loadVaultNotes = useCallback(
        async (vaultPath, autoSelectFirst = false) => {
          try {
            const data = await callHost('notes.list', { vaultPath });
            const tree = Array.isArray(data?.tree) ? data.tree : [];
            const notes = Array.isArray(data?.notes) ? data.notes : [];
            setNoteTree(tree);
            setFlatNotes(notes);
            if (typeof data?.revision === 'number') {
              lastSeenRevRef.current = data.revision;
            }
            if (autoSelectFirst && notes.length > 0) {
              const first = notes[0];
              const noteData = await callHost('notes.read', { vaultPath, notePath: first.path });
              setActiveNote(noteData);
              setDraftContent(noteData.content || '');
            }
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : String(err));
          }
        },
        [callHost]
      );

      const openNote = useCallback(
        async (vaultPath, notePath) => {
          try {
            setErrorMsg(null);
            const noteData = await callHost('notes.read', { vaultPath, notePath });
            setActiveNote(noteData);
            setDraftContent(noteData.content || '');
            setSelectedText('');
            // Expand parent folders
            const parts = (noteData.path || '').split('/');
            if (parts.length > 1) {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                let prefix = '';
                for (let i = 0; i < parts.length - 1; i++) {
                  prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
                  next.add(prefix);
                }
                return next;
              });
            }
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : String(err));
          }
        },
        [callHost]
      );

      // Sync active vault + note + selection to Host so AI system prompt has live context
      useEffect(() => {
        if (!selectedVault) {
          callHost('context.sync', { vaultPath: null }).catch(() => {});
          return;
        }
        callHost('context.sync', {
          sessionId: activeSessionId,
          vaultPath: selectedVault.path,
          vaultName: selectedVault.name,
          notePath: activeNote?.path || null,
          noteTitle: activeNote?.title || null,
          noteContent: activeNote?.content || '',
          selectedText,
        }).catch(() => {});
      }, [callHost, selectedVault, activeSessionId, activeNote, selectedText]);

      // Poll Host status every 2.5s while in studio so AI tool writes (`obsidian_notes`) auto-refresh UI
      useEffect(() => {
        if (!selectedVault) return undefined;
        const timer = setInterval(async () => {
          try {
            const status = await callHost('status.poll', {});
            if (typeof status?.revision === 'number' && status.revision > lastSeenRevRef.current) {
              lastSeenRevRef.current = status.revision;
              await loadVaultNotes(selectedVault.path, false);
              if (activeNote?.path) {
                const refreshed = await callHost('notes.read', {
                  vaultPath: selectedVault.path,
                  notePath: activeNote.path,
                }).catch(() => null);
                if (refreshed) {
                  setActiveNote(refreshed);
                  setDraftContent((prev) => (prev === activeNote.content ? refreshed.content : prev));
                }
              }
            }
          } catch {
            // ignore poll error
          }
        }, 2500);
        return () => clearInterval(timer);
      }, [callHost, selectedVault, activeNote, loadVaultNotes]);

      // Connect and retain a DSH Session for the selected vault
      const connectVaultAiSession = useCallback(
        async (vault) => {
          if (!vault || !vault.exists) return;
          setSessionConnecting(true);
          setSessionError(null);
          try {
            const sid = await ensureVaultSession(vault.path);
            setActiveSessionId(sid);
          } catch (err) {
            setSessionError(err instanceof Error ? err.message : String(err));
          } finally {
            setSessionConnecting(false);
          }
        },
        [ensureVaultSession]
      );

      // Retain sessionRef whenever activeSessionId changes
      useEffect(() => {
        if (!activeSessionId || !props.retainSession) {
          setSessionRef(null);
          return undefined;
        }
        let ref;
        try {
          ref = props.retainSession(activeSessionId);
          setSessionRef(ref);
        } catch (err) {
          setSessionError(err instanceof Error ? err.message : String(err));
          return undefined;
        }
        return () => {
          try {
            ref?.release?.();
          } catch {
            // ignore
          }
        };
      }, [activeSessionId, props]);

      const handleSelectVault = useCallback(
        async (vault) => {
          if (!vault.exists) return;
          setSelectedVault(vault);
          setActiveNote(null);
          setDraftContent('');
          setSearchQuery('');
          setSearchResults(null);
          await loadVaultNotes(vault.path, true);
          await connectVaultAiSession(vault);
        },
        [loadVaultNotes, connectVaultAiSession]
      );

      const handlePickFolder = useCallback(async () => {
        try {
          setErrorMsg(null);
          const picked = await pickDirectory();
          if (!picked) return;
          const res = await callHost('vaults.add', { path: picked, createIfMissing: true });
          if (Array.isArray(res?.vaults)) setVaults(res.vaults);
          if (res?.added?.exists) {
            await handleSelectVault(res.added);
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        }
      }, [pickDirectory, callHost, handleSelectVault]);

      const handleManualAdd = useCallback(async () => {
        const trimmed = manualPath.trim();
        if (!trimmed) return;
        try {
          setErrorMsg(null);
          const res = await callHost('vaults.add', { path: trimmed, createIfMissing: true });
          if (Array.isArray(res?.vaults)) setVaults(res.vaults);
          setManualPath('');
          setShowManualAdd(false);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        }
      }, [manualPath, callHost]);

      const handleRemoveVault = useCallback(
        async (vaultPath) => {
          try {
            const res = await callHost('vaults.remove', { path: vaultPath });
            if (Array.isArray(res?.vaults)) setVaults(res.vaults);
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : String(err));
          }
        },
        [callHost]
      );

      const handleSaveNote = useCallback(async () => {
        if (!selectedVault || !activeNote) return;
        setSaving(true);
        setErrorMsg(null);
        try {
          const saved = await callHost('notes.write', {
            vaultPath: selectedVault.path,
            notePath: activeNote.path,
            content: draftContent,
            mode: 'overwrite',
          });
          setActiveNote(saved);
          setDraftContent(saved.content || '');
          await loadVaultNotes(selectedVault.path, false);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        } finally {
          setSaving(false);
        }
      }, [selectedVault, activeNote, draftContent, callHost, loadVaultNotes]);

      const handleCreateNoteSubmit = useCallback(async () => {
        if (!selectedVault || !newNoteName.trim()) return;
        const cleanName = newNoteName.trim();
        const title = cleanName.replace(/\.md$/i, '').split('/').pop() || cleanName;
        const initialMd = `# ${title}\n\n`;
        try {
          setErrorMsg(null);
          const created = await callHost('notes.write', {
            vaultPath: selectedVault.path,
            notePath: cleanName,
            content: initialMd,
            mode: 'create',
          });
          setCreatingNote(false);
          setNewNoteName('');
          await loadVaultNotes(selectedVault.path, false);
          setActiveNote(created);
          setDraftContent(created.content || '');
          setViewMode('split');
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        }
      }, [selectedVault, newNoteName, callHost, loadVaultNotes]);

      const handleDeleteNote = useCallback(async () => {
        if (!selectedVault || !activeNote) return;
        try {
          await callHost('notes.delete', {
            vaultPath: selectedVault.path,
            notePath: activeNote.path,
          });
          setActiveNote(null);
          setDraftContent('');
          await loadVaultNotes(selectedVault.path, true);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
        }
      }, [selectedVault, activeNote, callHost, loadVaultNotes]);

      // Resolve [[WikiLink]] navigation inside the current vault
      const handleOpenWikiLink = useCallback(
        async (targetName) => {
          if (!selectedVault || !targetName) return;
          const clean = targetName.trim();
          const lower = clean.toLowerCase();
          const match = flatNotes.find(
            (n) =>
              n.path.toLowerCase() === lower ||
              n.path.toLowerCase() === `${lower}.md` ||
              n.title.toLowerCase() === lower ||
              n.name.toLowerCase() === lower
          );
          if (match) {
            await openNote(selectedVault.path, match.path);
          } else {
            // Create and open if not existing yet
            const created = await callHost('notes.write', {
              vaultPath: selectedVault.path,
              notePath: clean.endsWith('.md') ? clean : `${clean}.md`,
              content: `# ${clean}\n\n`,
              mode: 'overwrite',
            });
            await loadVaultNotes(selectedVault.path, false);
            setActiveNote(created);
            setDraftContent(created.content || '');
          }
        },
        [selectedVault, flatNotes, openNote, callHost, loadVaultNotes]
      );

      // Search handler
      useEffect(() => {
        if (!selectedVault) return undefined;
        const q = searchQuery.trim();
        if (!q) {
          setSearchResults(null);
          return undefined;
        }
        const timer = setTimeout(async () => {
          try {
            const res = await callHost('notes.search', {
              vaultPath: selectedVault.path,
              query: q,
              limit: 25,
            });
            setSearchResults(Array.isArray(res?.results) ? res.results : []);
          } catch {
            // ignore
          }
        }, 220);
        return () => clearTimeout(timer);
      }, [selectedVault, searchQuery, callHost]);

      // Send a quick prompt to the active AI session
      const sendQuickPromptToAi = useCallback(
        async (promptText) => {
          if (!promptText) return;
          setShowChat(true);
          try {
            if (sessionRef?.binding?.session?.prompt) {
              await sessionRef.binding.session.prompt([{ type: 'text', text: promptText }], 'queue');
            }
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : String(err));
          }
        },
        [sessionRef]
      );

      // Sessions belonging to the selected vault's workspace
      const vaultSessions = useMemo(() => {
        if (!selectedVault || !workspacesSnap?.items || !sessionsSnap?.byId) return [];
        const normVault = normalizePathCompare(selectedVault.path);
        const ws = workspacesSnap.items.find((w) => normalizePathCompare(w.path) === normVault);
        if (!ws || !Array.isArray(ws.sessionIds)) return [];
        return ws.sessionIds
          .map((id) => sessionsSnap.byId[id])
          .filter((s) => s !== undefined && !s.archived);
      }, [selectedVault, workspacesSnap, sessionsSnap]);

      // Drag handle for resizing the right AI chat column
      const startChatResize = useCallback(
        (e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startW = chatWidth;
          const onMove = (moveEvent) => {
            const delta = startX - moveEvent.clientX;
            setChatWidth(Math.max(320, Math.min(720, startW + delta)));
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        },
        [chatWidth]
      );

      // =====================================================================
      // VIEW 1: VAULT BROWSER (when no vault is selected)
      // =====================================================================
      if (!selectedVault) {
        return h(
          'div',
          { className: 'dshObsRoot', 'data-testid': 'obsidian-vault-browser' },
          h(
            'div',
            { className: 'dshObsVaultPage' },
            h(
              'div',
              { className: 'dshObsVaultContainer' },
              h(
                'header',
                { className: 'dshObsPageHeader' },
                h(
                  'div',
                  { className: 'dshObsTitleGroup' },
                  h(ObsidianSidebarIcon, { size: 32, active: true }),
                  h(
                    'div',
                    { className: 'dshObsTitleText' },
                    h('h1', { className: 'dshObsTitle' }, t('header.title')),
                    h('p', { className: 'dshObsSubtitle' }, t('header.subtitle'))
                  )
                ),
                h(
                  'div',
                  { className: 'dshObsHeaderActions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn',
                      onClick: loadVaults,
                      disabled: loadingVaults,
                    },
                    t('vaults.refresh')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn',
                      onClick: () => setShowManualAdd((v) => !v),
                    },
                    t('vaults.addManual')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnPrimary',
                      onClick: handlePickFolder,
                    },
                    t('vaults.addFolder')
                  )
                )
              ),

              errorMsg &&
                h(
                  'div',
                  { className: 'dshObsErrorBanner', role: 'alert' },
                  h('span', null, errorMsg),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall',
                      onClick: () => setErrorMsg(null),
                    },
                    '\u00d7'
                  )
                ),

              showManualAdd &&
                h(
                  'div',
                  { className: 'dshObsManualBar' },
                  h('input', {
                    type: 'text',
                    className: 'dshObsInput',
                    value: manualPath,
                    placeholder: t('vaults.manualPlaceholder'),
                    onChange: (e) => setManualPath(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === 'Enter') handleManualAdd();
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnPrimary',
                      disabled: !manualPath.trim(),
                      onClick: handleManualAdd,
                    },
                    t('vaults.confirmAdd')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn',
                      onClick: () => setShowManualAdd(false),
                    },
                    t('vaults.cancel')
                  )
                ),

              vaults.length === 0 && !loadingVaults
                ? h(
                    'div',
                    { className: 'dshObsEmptyState' },
                    h(ObsidianSidebarIcon, { size: 40, active: false }),
                    h('strong', { style: { fontSize: '15px' } }, t('vaults.emptyTitle')),
                    h(
                      'p',
                      { style: { margin: 0, maxWidth: '520px', fontSize: '13px', color: 'var(--dsw-alias-label-secondary)' } },
                      t('vaults.emptyDesc')
                    ),
                    h(
                      'div',
                      { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dshObsBtn dshObsBtnPrimary',
                          onClick: handlePickFolder,
                        },
                        t('vaults.addFolder')
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dshObsBtn',
                          onClick: () => setShowManualAdd(true),
                        },
                        t('vaults.addManual')
                      )
                    )
                  )
                : h(
                    'div',
                    { className: 'dshObsVaultGrid' },
                    vaults.map((vault) =>
                      h(
                        'div',
                        { key: vault.path, className: 'dshObsVaultCard' },
                        h(
                          'div',
                          { className: 'dshObsVaultCardTop' },
                          h(
                            'div',
                            { className: 'dshObsVaultCardHeader' },
                            h('span', { className: 'dshObsVaultName', title: vault.name }, vault.name),
                            h(
                              'div',
                              { className: 'dshObsBadgeRow' },
                              h(
                                'span',
                                { className: 'dshObsBadge' },
                                t(vault.source === 'obsidian' ? 'vaults.source.obsidian' : 'vaults.source.custom')
                              ),
                              h(
                                'span',
                                {
                                  className: `dshObsBadge ${vault.exists ? 'dshObsBadgeSuccess' : 'dshObsBadgeWarn'}`,
                                },
                                t(vault.exists ? 'vaults.status.ready' : 'vaults.status.missing')
                              )
                            )
                          ),
                          h('div', { className: 'dshObsVaultPath' }, vault.path),
                          h(
                            'div',
                            { className: 'dshObsVaultMeta' },
                            h('span', null, t('vaults.noteCount', { count: vault.noteCount ?? 0 })),
                            h('span', null, formatTime(vault.lastModifiedMs))
                          )
                        ),
                        h(
                          'div',
                          { className: 'dshObsVaultActions' },
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'dshObsBtn dshObsBtnPrimary',
                              style: { flex: 1 },
                              disabled: !vault.exists,
                              onClick: () => handleSelectVault(vault),
                            },
                            t('vaults.openStudio')
                          ),
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'dshObsBtn dshObsBtnSmall dshObsBtnGhost',
                              onClick: () => handleRemoveVault(vault.path),
                              title: t('vaults.remove'),
                            },
                            '\u00d7'
                          )
                        )
                      )
                    )
                  )
            )
          )
        );
      }

      // =====================================================================
      // VIEW 2: SELECTED VAULT STUDIO (Note Tree + Note Viewer/Editor + AI Conversation)
      // =====================================================================
      const isDirty = activeNote && draftContent !== activeNote.content;

      return h(
        'div',
        { className: 'dshObsRoot dshObsStudio', 'data-testid': 'obsidian-vault-studio' },
        // Top Toolbar
        h(
          'header',
          { className: 'dshObsTopbar' },
          h(
            'div',
            { className: 'dshObsTopbarLeft' },
            h(
              'button',
              {
                type: 'button',
                className: 'dshObsBtn dshObsBtnSmall',
                onClick: () => setSelectedVault(null),
              },
              `\u2190 ${t('studio.backToVaults')}`
            ),
            h(
              'select',
              {
                className: 'dshObsSelect',
                value: selectedVault.path,
                onChange: (e) => {
                  const target = vaults.find((v) => v.path === e.target.value);
                  if (target) handleSelectVault(target);
                },
              },
              vaults
                .filter((v) => v.exists)
                .map((v) => h('option', { key: v.path, value: v.path }, `\ud83d\udce6 ${v.name}`))
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshObsBtn dshObsBtnSmall dshObsBtnGhost',
                onClick: () => setShowTree((v) => !v),
                title: t('studio.toggleTree'),
              },
              showTree ? '\u21e4' : '\u21e5'
            )
          ),

          h(
            'div',
            { className: 'dshObsTopbarCenter' },
            activeNote &&
              h(
                React.Fragment,
                null,
                h('span', { className: 'dshObsNoteBreadcrumb', title: activeNote.path }, activeNote.path),
                h(
                  'span',
                  {
                    className: `dshObsBadge ${isDirty ? 'dshObsBadgeWarn' : 'dshObsBadgeSuccess'}`,
                  },
                  t(saving ? 'studio.saving' : isDirty ? 'studio.unsaved' : 'studio.saved')
                )
              )
          ),

          h(
            'div',
            { className: 'dshObsTopbarRight' },
            activeNote &&
              h(
                React.Fragment,
                null,
                ['preview', 'split', 'edit'].map((m) =>
                  h(
                    'button',
                    {
                      key: m,
                      type: 'button',
                      className: `dshObsBtn dshObsBtnSmall${viewMode === m ? ' dshObsBtnPrimary' : ''}`,
                      onClick: () => setViewMode(m),
                    },
                    t(`studio.mode.${m}`)
                  )
                ),
                isDirty &&
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall dshObsBtnPrimary',
                      disabled: saving,
                      onClick: handleSaveNote,
                    },
                    t('studio.save')
                  ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshObsBtn dshObsBtnSmall dshObsBtnGhost',
                    onClick: () => handleDeleteNote,
                    title: t('studio.deleteNote'),
                  },
                  '\ud83d\uddd1'
                )
              ),
            h(
              'button',
              {
                type: 'button',
                className: `dshObsBtn dshObsBtnSmall${showChat ? ' dshObsBtnPrimary' : ''}`,
                onClick: () => setShowChat((v) => !v),
                title: t('studio.toggleChat'),
              },
              '\ud83d\udcac AI'
            )
          )
        ),

        errorMsg &&
          h(
            'div',
            { className: 'dshObsErrorBanner', role: 'alert', style: { margin: '6px 14px 0' } },
            h('span', null, errorMsg),
            h(
              'button',
              {
                type: 'button',
                className: 'dshObsBtn dshObsBtnSmall',
                onClick: () => setErrorMsg(null),
              },
              '\u00d7'
            )
          ),

        // 3-Column Body
        h(
          'div',
          { className: 'dshObsColumns' },
          // Left Column: Note Tree & Search
          showTree &&
            h(
              'aside',
              { className: 'dshObsTreePane' },
              h(
                'div',
                { className: 'dshObsTreeHeader' },
                h(
                  'div',
                  { style: { display: 'flex', gap: '6px' } },
                  h('input', {
                    type: 'search',
                    className: 'dshObsInput',
                    style: { height: '28px', fontSize: '12px' },
                    value: searchQuery,
                    placeholder: t('studio.searchPlaceholder'),
                    onChange: (e) => setSearchQuery(e.target.value),
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall',
                      onClick: () => setCreatingNote((v) => !v),
                      title: t('studio.newNote'),
                    },
                    '+'
                  )
                ),
                creatingNote &&
                  h(
                    'div',
                    { style: { display: 'flex', gap: '4px' } },
                    h('input', {
                      type: 'text',
                      className: 'dshObsInput',
                      style: { height: '26px', fontSize: '12px' },
                      placeholder: t('studio.newNotePrompt'),
                      value: newNoteName,
                      onChange: (e) => setNewNoteName(e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') handleCreateNoteSubmit();
                      },
                    }),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshObsBtn dshObsBtnSmall dshObsBtnPrimary',
                        onClick: handleCreateNoteSubmit,
                      },
                      '\u2713'
                    )
                  )
              ),
              h(
                'div',
                { className: 'dshObsTreeScroll' },
                searchResults !== null
                  ? h(
                      'div',
                      { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                      h(
                        'div',
                        {
                          style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            fontSize: '11px',
                            color: 'var(--dsw-alias-label-secondary)',
                          },
                        },
                        h('span', null, t('studio.searchResults', { count: searchResults.length })),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshObsBtnGhost',
                            style: { border: 'none', fontSize: '11px', cursor: 'pointer' },
                            onClick: () => setSearchQuery(''),
                          },
                          t('studio.clearSearch')
                        )
                      ),
                      searchResults.map((item) =>
                        h(
                          'button',
                          {
                            key: item.path,
                            type: 'button',
                            className: `dshObsTreeItem${activeNote?.path === item.path ? ' dshObsTreeItemActive' : ''}`,
                            style: { flexDirection: 'column', alignItems: 'flex-start', gap: '2px' },
                            onClick: () => openNote(selectedVault.path, item.path),
                          },
                          h('span', { className: 'dshObsTreeLabel', style: { fontWeight: 500 } }, item.title),
                          h(
                            'span',
                            { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } },
                            item.path
                          ),
                          item.matches?.[0] &&
                            h(
                              'span',
                              {
                                style: {
                                  fontSize: '11px',
                                  color: 'var(--dsw-alias-label-secondary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%',
                                },
                              },
                              `L${item.matches[0].line}: ${item.matches[0].snippet}`
                            )
                        )
                      )
                    )
                  : noteTree.length === 0
                  ? h(
                      'div',
                      { style: { padding: '18px 10px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', textAlign: 'center' } },
                      t('studio.emptyTree')
                    )
                  : h(NoteTreeNodes, {
                      nodes: noteTree,
                      activeNotePath: activeNote?.path || null,
                      expandedFolders,
                      onToggleFolder: (folderPath) => {
                        setExpandedFolders((prev) => {
                          const next = new Set(prev);
                          if (next.has(folderPath)) next.delete(folderPath);
                          else next.add(folderPath);
                          return next;
                        });
                      },
                      onSelectNote: (notePath) => openNote(selectedVault.path, notePath),
                    })
              )
            ),

          // Center Column: Note Viewer & Editor
          h(
            'section',
            { className: 'dshObsNotePane' },
            activeNote &&
              h(
                'div',
                { className: 'dshObsAiActionBar' },
                h(
                  'div',
                  { className: 'dshObsSyncStatus' },
                  h('span', { className: 'dshObsSyncDot' }),
                  h('span', null, t('studio.contextSynced', { note: activeNote.path }))
                ),
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                  selectedText.trim() !== '' &&
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshObsBtn dshObsBtnSmall dshObsBtnPrimary',
                        onClick: () =>
                          sendQuickPromptToAi(
                            t('studio.prompt.askSelection', {
                              title: activeNote.title,
                              selection: selectedText.trim(),
                            })
                          ),
                      },
                      `\u2728 ${t('studio.aiAskSelection')}`
                    ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall',
                      onClick: () =>
                        sendQuickPromptToAi(
                          t('studio.prompt.summarize', {
                            title: activeNote.title,
                            path: activeNote.path,
                          })
                        ),
                    },
                    t('studio.aiSummarize')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall',
                      onClick: () =>
                        sendQuickPromptToAi(
                          t('studio.prompt.polish', {
                            title: activeNote.title,
                            path: activeNote.path,
                          })
                        ),
                    },
                    t('studio.aiPolish')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn dshObsBtnSmall',
                      onClick: () =>
                        sendQuickPromptToAi(
                          t('studio.prompt.todos', {
                            title: activeNote.title,
                            path: activeNote.path,
                          })
                        ),
                    },
                    t('studio.aiTodos')
                  )
                )
              ),

            !activeNote
              ? h(
                  'div',
                  {
                    style: {
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '24px',
                      color: 'var(--dsw-alias-label-secondary)',
                      fontSize: '13px',
                    },
                  },
                  h(ObsidianSidebarIcon, { size: 36, active: false }),
                  h('span', null, t('studio.noNoteSelected')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshObsBtn',
                      onClick: () => {
                        setShowTree(true);
                        setCreatingNote(true);
                      },
                    },
                    `+ ${t('studio.newNote')}`
                  )
                )
              : h(
                  'div',
                  {
                    className: 'dshObsNoteBodyWrap',
                    onMouseUp: () => {
                      const sel = typeof window !== 'undefined' ? window.getSelection()?.toString() || '' : '';
                      if (sel.trim() !== selectedText.trim()) {
                        setSelectedText(sel.trim());
                      }
                    },
                  },
                  (viewMode === 'edit' || viewMode === 'split') &&
                    h(
                      'div',
                      { className: 'dshObsEditorCol' },
                      h('textarea', {
                        className: 'dshObsTextarea',
                        value: draftContent,
                        onChange: (e) => setDraftContent(e.target.value),
                        onKeyDown: (e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                            e.preventDefault();
                            handleSaveNote();
                          }
                        },
                      })
                    ),
                  (viewMode === 'preview' || viewMode === 'split') &&
                    h(
                      'div',
                      { className: 'dshObsPreviewCol' },
                      h(MarkdownPreview, {
                        content: draftContent,
                        frontmatter: activeNote.frontmatter,
                        tags: activeNote.tags,
                        links: activeNote.links,
                        onOpenWikiLink: handleOpenWikiLink,
                        t,
                      })
                    )
                )
          ),

          // Right Column: Embedded Native DSH AI Conversation
          showChat &&
            h(
              React.Fragment,
              null,
              h('div', {
                className: 'dshObsSplitter',
                onPointerDown: startChatResize,
              }),
              h(
                'aside',
                {
                  className: 'dshObsChatPane',
                  style: { width: `${chatWidth}px` },
                },
                h(
                  'div',
                  { className: 'dshObsChatHeader' },
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 } },
                    vaultSessions.length > 0 &&
                      h(
                        'select',
                        {
                          className: 'dshObsSelect',
                          value: activeSessionId || '',
                          onChange: (e) => {
                            if (e.target.value) setActiveSessionId(e.target.value);
                          },
                        },
                        vaultSessions.map((s) =>
                          h('option', { key: s.id, value: s.id }, s.title || s.id.slice(0, 8))
                        )
                      ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshObsBtn dshObsBtnSmall',
                        onClick: async () => {
                          try {
                            const nextId = await createNewVaultSession(selectedVault.path);
                            if (nextId) setActiveSessionId(nextId);
                          } catch (err) {
                            setSessionError(err instanceof Error ? err.message : String(err));
                          }
                        },
                      },
                      `+ ${t('studio.newChatSession')}`
                    )
                  ),
                  activeSessionId &&
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshObsBtn dshObsBtnSmall dshObsBtnGhost',
                        onClick: () => openSessionInMain(activeSessionId),
                        title: t('studio.openMainChat'),
                      },
                      '\u2197'
                    )
                ),
                h(
                  'div',
                  { className: 'dshObsChatBody' },
                  sessionConnecting
                    ? h(
                        'div',
                        {
                          style: {
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            color: 'var(--dsw-alias-label-secondary)',
                            fontSize: '13px',
                          },
                        },
                        t('studio.connectingSession')
                      )
                    : sessionError
                    ? h(
                        'div',
                        {
                          style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '24px',
                            color: 'var(--dsw-alias-state-error-primary)',
                            fontSize: '13px',
                            textAlign: 'center',
                          },
                        },
                        h('span', null, t('studio.sessionError', { message: sessionError })),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshObsBtn dshObsBtnSmall',
                            onClick: () => connectVaultAiSession(selectedVault),
                          },
                          t('studio.retrySession')
                        )
                      )
                    : sessionRef && SessionProvider
                    ? h(
                        SessionProvider,
                        { session: sessionRef },
                        renderSlot(CHAT_SLOT, {})
                      )
                    : null
                )
              )
            )
        )
      );
    }

    const inject = ['slots', 'locale', 'connection', 'sessions', 'workspaces', 'uiWorkspace', 'layout'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, DICTIONARIES), 'dsh-obsidian: dictionaries');
      ctx.effect(() => ensureStyles(), 'dsh-obsidian: styles');

      const t = ctx.locale.bind(NS);

      // Helper to call Host `/dsh-obsidian/<endpoint>` RPC
      const callHost = async (endpoint, payload = {}) => {
        if (ctx.connection?.rpc?.call) {
          const res = await ctx.connection.rpc.call(RPC_CHANNEL, endpoint, payload);
          if (res && typeof res === 'object' && 'ok' in res) {
            if (!res.ok) {
              throw new Error(res.error?.message || `Obsidian RPC failed: ${endpoint}`);
            }
            return res.value;
          }
          return res;
        }
        const response = await window.fetch(`${RPC_CHANNEL}/${endpoint}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!data.ok) {
          throw new Error(data.error?.message || `Obsidian HTTP failed: ${endpoint}`);
        }
        return data.value;
      };

      // Ensure a DSH Workspace exists for `vaultPath` and connect/resolve an active Session
      const ensureVaultSession = async (vaultPath) => {
        const normTarget = normalizePathCompare(vaultPath);
        const snap = ctx.workspaces.list.getSnapshot();
        let ws = Array.isArray(snap?.items)
          ? snap.items.find((item) => normalizePathCompare(item.path) === normTarget)
          : undefined;
        if (!ws) {
          ws = await ctx.workspaces.create({ path: vaultPath });
        }
        const workspaceId = ws.workspaceId;
        if (ctx.uiWorkspace?.connectWorkspace) {
          return await ctx.uiWorkspace.connectWorkspace(workspaceId);
        }
        return await ctx.sessions.create({ workspaceId, cwd: vaultPath });
      };

      // Create a brand-new Session in the vault's Workspace
      const createNewVaultSession = async (vaultPath) => {
        const normTarget = normalizePathCompare(vaultPath);
        const snap = ctx.workspaces.list.getSnapshot();
        let ws = Array.isArray(snap?.items)
          ? snap.items.find((item) => normalizePathCompare(item.path) === normTarget)
          : undefined;
        if (!ws) {
          ws = await ctx.workspaces.create({ path: vaultPath });
        }
        return await ctx.sessions.create({ workspaceId: ws.workspaceId, cwd: vaultPath });
      };

      const retainSession = (sessionId) =>
        ctx.sessions.retain(sessionId, {
          source: 'obsidianPanel',
        });

      const openSessionInMain = (sessionId) => {
        if (ctx.uiWorkspace?.openSession) {
          ctx.uiWorkspace.openSession(sessionId);
        }
        if (ctx.layout?.selectPanel) {
          ctx.layout.selectPanel(null);
        }
      };

      // 1. Register left sidebar entry (`sidebar.panellist`)
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 15,
            locale: NS,
            label: () => t('sidebar.label'),
          },
          ObsidianSidebarIcon
        )
      );

      // 2. Register central main panel (`main`, key: 'obsidian') + child session slot (`obsidian.chat.conversation`)
      ctx.slots.inject('main', function* () {
        yield ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            children: {
              [CHAT_SLOT]: {
                kind: 'single',
                scope: 'session',
              },
            },
            inject: () => ({
              callHost,
              pickDirectory: () =>
                ctx.uiWorkspace?.pickDirectory ? ctx.uiWorkspace.pickDirectory() : Promise.resolve(null),
              ensureVaultSession,
              createNewVaultSession,
              retainSession,
              openSessionInMain,
            }),
          },
          ObsidianMainPanel
        );

        yield ctx.slots.register(
          {
            name: CHAT_SLOT,
          },
          ObsidianConversationSlotPanel
        );
      });
    }

    return {
      inject,
      apply,
    };
  },
});
