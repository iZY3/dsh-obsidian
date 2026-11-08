# dsh-obsidian (`@local/dsh-obsidian`)

**Obsidian Vault Workspace Plugin for DeepSeek Harness (DSH)**  
**DeepSeek Harness 的 Obsidian 笔记工作台插件**

将本地 Obsidian 笔记库无缝接入 DeepSeek Harness：在左侧边栏提供 **Obsidian** 入口，自动发现系统中已存在的 Obsidian 库，并在主界面提供 **目录树 + Markdown 阅读/编辑器 + 内嵌原生 AI 对话** 的三栏协同工作台。

---

## ✨ 功能特性 (Features)

1. **侧边栏一键直达 (`sidebar.panellist`)**
   - 在 DSH 左侧导航栏注册原生 **Obsidian** 面板图标，点击即可在主视图切换至 Obsidian 工作台。
2. **自动发现与管理本地 Obsidian 库**
   - 自动解析系统全局 `obsidian.json` 配置（支持 Windows / macOS / Linux），列出本机所有已存在的 Obsidian 笔记库、笔记数量与最近修改时间。
   - 支持通过系统原生文件夹选择器或手动输入路径连接任意 Markdown 笔记目录。
3. **三栏分屏：边看笔记边与 AI 对话**
   - **左栏（文件树与全文搜索）**：支持多级文件夹展开/折叠、按文件名或正文内容搜索并展示匹配行内容、一键新建笔记。
   - **中栏（Markdown 阅读与源码编辑）**：
     - 支持 **阅读视图 / 分栏视图 / 编辑源码** 三种模式切换及 `Ctrl/Cmd + S` 快捷保存。
     - 自动解析展示 YAML Frontmatter 属性标签、`#tags` 标签与 `[[WikiLinks]]` 双链引用。
     - 支持点击笔记内的 `[[双链]]` 直接在库内跳转或创建对应笔记。
     - 提供快捷 AI 协作栏：**AI 总结此笔记**、**AI 润色与结构优化**、**提取待办与行动项**，以及划选任意段落后一键 **向 AI 提问选中内容**。
   - **右栏（内嵌原生 DSH AI 对话栏）**：
     - 基于 `SessionProvider` 与 `conversation.content` 内嵌完整的 DSH 原生会话组件，自动关联该 Obsidian 库所在的工作区会话。
     - 支持在工作台内直接切换该库的历史对话、新建对话或一键切回全屏主对话界面。
4. **实时上下文同步与专属 AI 工具**
   - **动态上下文 (`obsidian:active-context`)**：当你在工作台打开笔记或划选文字时，当前库路径、笔记标题、Frontmatter、选中文本及正文内容会自动注入 AI 上下文，无需手动复制粘贴。
   - **Agent 工具**：
     - `obsidian_vaults`：列出、添加或移除已连接的 Obsidian 库（`list` / `add` / `remove`）。
     - `obsidian_notes`：查看目录树、读取、全文搜索、创建、覆盖更新、追加或移至 `.trash` 回收站（`list` / `read` / `write` / `append` / `create` / `search` / `delete`）。AI 修改笔记后前端界面自动同步刷新。

---

## 📦 目录结构 (Project Structure)

```text
.
├── package.json          # DSH Bundle 与 Client 模块声明
├── cordis.patch.yml      # Cordis 插件挂载配置
├── index.js              # Host 端：库发现、笔记读写服务、RPC 路由、AI 工具与动态上下文
├── client.js             # Client 端：侧栏入口、库浏览页、三栏笔记阅读编辑与内嵌 AI 对话
├── icon.svg              # 插件图标
├── locale/
│   ├── zh.json           # 中文元数据
│   └── en.json           # 英文元数据
└── LICENSE               # MIT 开源协议
```

---

## 🚀 安装方式 (Installation)

### 方式一：在 DeepSeek Harness 对话中直接安装
克隆本仓库到本地后，在 DSH 对话中告诉 AI：
> 安装本地插件目录 `<克隆后的仓库绝对路径>`

或由 AI 调用 `plugin_manager` 工具：
```json
{
  "action": "install_bundle",
  "target": "/path/to/Obsidian-plugin"
}
```

### 方式二：在 DSH 插件管理器中添加
打开 DeepSeek Harness **插件管理 (Plugins)** 页面，选择从本地目录或 Git/包地址安装本仓库并启用。

---

## 📄 开源协议 (License)

[MIT](./LICENSE)
