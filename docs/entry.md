# smart-code-tool/docs — AI 入口

> AI 助手请从本文件开始理解整个文档站。

---

## AI 必读（加载顺序）

执行任何任务前，**必须按以下顺序读取**：

1. **本文件**（`docs/entry.md`）— 理解站点全貌
2. **`../AGENTS.md`**（项目根目录）— 理解项目级约束与规范
3. **`../z-doc/文档规范.md`** — Markdown 和 Vue 组件的写作规范
4. **对应模块的 `entry.md`** — 深入具体模块前必读（见下表）

---

## 站点概览

| 模块         | 路径              | 篇数 | AI 入口                  | 说明                            |
| ------------ | ----------------- | ---- | ------------------------ | ------------------------------- |
| 🔮 研发知识  | `/dev-knowledge/` | 274  | `dev-knowledge/entry.md` | 按框架组织的核心知识体系        |
| 🧠 心理认知  | `/psychology/`    | 20   | —                        | 心智模型、行动准则、复盘方法论  |
| 📖 开发手册  | `/handbook/`      | 55   | —                        | 开发规范、最佳实践、工具使用    |
| 🤖 AI 知识库 | `/ai/`            | 28   | `ai/instructions/`       | AI 概念、Agent 实践、指令集     |
| 🎨 AIGC      | `/aigc/`          | 50   | —                        | AI 生成内容、技能转型、变现路径 |
| 🛠️ 工具应用  | `/app-iframe/`    | —    | —                        | Excel 统计、实用工具集          |

---

## 研发知识子模块入口

`dev-knowledge/` 是核心模块，按框架/领域组织，每个子模块有独立 `entry.md`：

| 子模块       | 篇数 | AI 入口                                 | 说明                           |
| ------------ | ---- | --------------------------------------- | ------------------------------ |
| Vue 体系     | 42   | `dev-knowledge/vue/entry.md`            | 响应式、组件、Composable、原理 |
| React 体系   | 38   | `dev-knowledge/react/entry.md`          | Fiber、Hooks、并发渲染、RSC    |
| Flutter 体系 | 44   | `dev-knowledge/flutter/entry.md`        | Widget、状态管理、渲染、插件   |
| JS/TS 体系   | 28   | `dev-knowledge/js-ts/entry.md`          | 引擎、类型系统、异步、设计模式 |
| Node.js 体系 | 10   | `dev-knowledge/nodejs/entry.md`         | 框架、ORM、部署                |
| Python 体系  | 3    | `dev-knowledge/python/entry.md`         | 工程化、AI 开发                |
| 跨域知识     | 103  | `dev-knowledge/cross-domain/entry.md`   | 通用基础、架构、工程化、管理   |
| 学习路径     | 6    | `dev-knowledge/learning-paths/entry.md` | P4→P8 分级学习规划             |

---

## 技术栈

- **框架**: VitePress（Vue 3 + Vite）
- **部署**: Docker + Nginx，GitHub Pages
- **Base**: `/smart-code-tool/`（所有绝对链接自动加此前缀）
- **配置文件**: `.vitepress/config.js`、`.vitepress/config/`（侧边栏、导航）

---

## 目录结构

```
docs/
├── entry.md                    ← 你正在阅读的文件（站点级 AI 入口）
├── index.md                    ← VitePress 首页（layout: home）
│
├── .vitepress/
│   ├── config.js               ← VitePress 主配置（base、title）
│   ├── config/
│   │   ├── nav.js              ← 顶部导航栏
│   │   ├── sidebar.js          ← 侧边栏路由注册
│   │   └── sidebar/            ← 各模块侧边栏配置（新增文档必须更新）
│   │       ├── dev-knowledge.js
│   │       ├── ai.js
│   │       ├── aigc.js
│   │       ├── psychology.js
│   │       ├── handbook.js
│   │       └── home.js
│   └── theme/                  ← 自定义主题（QuickTools、抗遗忘复习）
│
├── dev-knowledge/              ← 🔮 研发知识（核心，274 篇）
│   ├── entry.md                ← 模块 AI 入口 + 新增文档规范
│   ├── index.md                ← 模块首页
│   ├── vue/ react/ flutter/    ← 按框架组织
│   ├── js-ts/ nodejs/ python/
│   ├── cross-domain/           ← 跨域通用知识
│   └── learning-paths/         ← 学习路径导航
│
├── psychology/                 ← 🧠 心理认知（20 篇）
├── handbook/                   ← 📖 开发手册（55 篇）
├── ai/                         ← 🤖 AI 知识库（28 篇）
│   └── instructions/           ← AI 协作指令集
├── aigc/                       ← 🎨 AIGC（50 篇）
└── app-iframe/                 ← 🛠️ 工具应用
```

---

## AI 协作约束

### 新增文档后必做

1. **更新侧边栏**：编辑 `.vitepress/config/sidebar/<module>.js`，否则新文档在导航中不可见
2. **注入 ID**：运行 `node scripts/inject-sidebar-ids.mjs`
3. **生成标签**：运行 `pnpm gen:frontmatter-tags`
4. **更新文档列表**：运行 `pnpm gen:doc-list`
5. **同步学习路径**：如文档被 `learning-paths/` 引用，更新对应路径文件中的链接

### 文件命名

- 文档：kebab-case（`vue-lifecycle.md`）
- 目录：kebab-case（`cross-domain/`、`js-ts/`）
- Frontmatter 必填：`title`、`tags`

### 链接规范

- 使用绝对路径：`/dev-knowledge/vue/interview/advanced/reactivity-deep`
- 不加 `.md` 后缀，VitePress 自动处理路由
- `base: '/smart-code-tool/'` 会自动拼接前缀，无需手动写

### 双文件约定

每个模块目录必须同时有：

- `entry.md` — AI 入口（模块概览、约束）
- `index.md` — VitePress 路由索引（目录级链接解析到此）

> ⚠️ 只有 `entry.md` 没有 `index.md` → 目录级路由 404。

---

## 相关入口

| 文件                                    | 用途                              |
| --------------------------------------- | --------------------------------- |
| `../AGENTS.md`                          | 项目级 AI 认知入口                |
| `../z-doc/文档规范.md`                  | Markdown + Vue 组件写作规范       |
| `../z-doc/抗遗忘复习系统-AI认知文档.md` | 复习系统架构说明                  |
| `dev-knowledge/entry.md`                | 研发知识库 AI 入口 + 新增文档规范 |
| `ai/instructions/`                      | AI 协作指令集                     |
