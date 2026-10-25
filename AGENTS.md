# smart-code-tool — AI 快速认知入口

> 本文件是 Qoder 自动加载的 Agent 上下文文件。
> AI 助手启动时自动载入，快速定位各模块的详细文档。

---

## 项目概览

smart-code-tool 是一个**个人知识管理与文档站项目**，基于 VitePress 构建，包含研发知识库、心理认知、AI/AIGC 知识、开发手册等内容体系，以及抗遗忘复习系统。

**技术栈**：VitePress (Vue 3 + Vite) · Docker + Nginx · GitHub Pages

---

## AI 必读（加载顺序）

执行任何任务前，**必须按以下顺序读取**：

1. **本文件**（`AGENTS.md`）— 理解项目全貌与约束
2. **[`docs/entry.md`](./docs/entry.md)** — 文档站 AI 入口（站点概览、模块入口、协作规范）
3. **[`z-doc/文档规范.md`](./z-doc/文档规范.md)** — Markdown 和 Vue 组件写作规范
4. **对应模块的 `entry.md`** — 深入具体模块前必读（见 docs/entry.md 中的子模块入口表）

---

## 目录结构

```
smart-code-tool/
├── AGENTS.md               ← 你正在阅读的文件（项目级 AI 入口）
├── docs/                   ← VitePress 文档站源码（核心）
│   ├── entry.md            ← 文档站 AI 入口
│   ├── index.md            ← VitePress 首页
│   ├── dev-knowledge/      ← 🔮 研发知识（274 篇，按框架组织）
│   ├── psychology/         ← 🧠 心理认知（20 篇）
│   ├── handbook/           ← 📖 开发手册（55 篇）
│   ├── ai/                 ← 🤖 AI 知识库（28 篇）
│   ├── aigc/               ← 🎨 AIGC（50 篇）
│   ├── app-iframe/         ← 🛠️ 工具应用
│   └── .vitepress/         ← VitePress 配置与主题
│       ├── config.js       ← 主配置（base: /smart-code-tool/）
│       ├── config/sidebar/ ← 侧边栏配置（新增文档必须更新）
│       └── theme/          ← 自定义主题（QuickTools、抗遗忘）
│
├── src/                    ← Vue 3 应用源码
├── scripts/                ← 工程脚本
├── job/                    ← 定时任务与工具脚本
├── project/                ← 子项目（vue-test-app、react-test-app 等）
├── z-doc/                  ← 项目协作文档与规范
└── public/                 ← 静态资源
```

---

## 文档与组件规范

所有 Markdown 文档和 Vue 组件必须遵循：[`z-doc/文档规范.md`](./z-doc/文档规范.md)

**Markdown 核心**：

- 文件首行必须是 frontmatter（含 `title` + `tags`）
- 新增文档后运行 `pnpm gen:frontmatter-tags` + `pnpm gen:doc-list`

**Vue 组件核心**：

- 代码块顺序：`<template>` → `<script setup>` → `<style scoped>`
- VitePress 主题侧使用 **Element Plus**，优先用 `el-*` 组件，避免手写按钮/卡片/弹窗
- 暗色模式由 Element Plus `dark/css-vars.css` 自动适配，无需手动写 `.dark` 覆盖
- 自定义 CSS 只保留布局/间距，视觉样式交给组件库

**时间与时区**：

- 项目有两种时间源：git 时间戳（本地时间）和 `toISOString()`（UTC），显示时必须转为本地时间
- **禁止直接截取 ISO 字符串显示**（如 `.slice(0, 19)`），必须使用 `utils.js` 中的 `formatTimestamp()` / `formatDatePart()` / `todayStr()`
- `dayjs()` 解析 ISO 字符串时自动转本地，无需额外处理
- 详见：[`z-doc/文档规范.md`](./z-doc/文档规范.md) 第 8 节

---

## 新增文档必做清单

```
□ 1. 将文档放入正确的模块目录（参考 docs/entry.md 中的站点概览）
□ 2. 更新侧边栏：docs/.vitepress/config/sidebar/<module>.js
□ 3. 运行 inject IDs：node scripts/inject-sidebar-ids.mjs
□ 4. 运行标签生成：pnpm gen:frontmatter-tags
□ 5. 运行文档列表：pnpm gen:doc-list
□ 6. 如被学习路径引用，同步更新 docs/dev-knowledge/learning-paths/ 中的链接
```

---

## 抗遗忘复习系统 ✅ 已实现

基于艾宾浩斯遗忘曲线的智能复习调度系统，集成在 QuickTools 快捷工具中。

**核心体验**：自动感知学习行为（页面停留 ≥ 10 分钟），零手动操作，到期提醒复习。

| 文档             | 路径                                                                         | 说明                                   |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| **详细认知文档** | [`z-doc/抗遗忘复习系统-AI认知文档.md`](./z-doc/抗遗忘复习系统-AI认知文档.md) | 架构设计、数据模型、模块职责、文件位置 |
| **技术方案书**   | [`z-doc/抗遗忘复习系统方案.md`](./z-doc/抗遗忘复习系统方案.md)               | 完整技术调研 + 方案设计                |
| **原始需求**     | [`z-doc/艾宾浩斯遗忘曲线.txt`](./z-doc/艾宾浩斯遗忘曲线.txt)                 | 用户原始需求描述                       |

**关键技术**：ts-fsrs 调度算法 · idb-keyval (IndexedDB) · 24 字符 nanoid 文档 ID 锚定 · tags 标签筛选

**核心文件**：

- 编排层：`docs/.vitepress/theme/components/QuickTools.vue`
- 业务逻辑：`docs/.vitepress/theme/components/quick-tools/composables/useReview.js`
- 构建脚本：`scripts/inject-sidebar-ids.mjs`、`scripts/gen-doc-list.mjs`

---

## 常用命令

```bash
# 开发
pnpm dev              # 启动 VitePress 开发服务器

# 构建
pnpm build            # 构建文档站

# 文档维护
pnpm gen:frontmatter-tags   # 生成/更新 frontmatter 标签
pnpm gen:doc-list           # 生成文档列表
node scripts/inject-sidebar-ids.mjs  # 注入侧边栏 ID

# 工具
pnpm dev:rn             # React Native 联动启动
```

---

## 其他文档索引

| 文档               | 路径                              | 说明                         |
| ------------------ | --------------------------------- | ---------------------------- |
| 文档站 AI 入口     | `docs/entry.md`                   | 站点概览与模块入口           |
| 研发知识规范       | `docs/dev-knowledge/entry.md`     | 新增文档规范、子模块入口     |
| 研发知识库菜单规范 | `z-doc/研发知识库菜单结构规范.md` | 侧边栏统一分组模型与维护约定 |
| 文档写作规范       | `z-doc/文档规范.md`               | Markdown + Vue 组件规范      |
| 子项目添加指南     | `z-doc/add-sub-project.md`        | 如何添加子项目               |
| AI 相关笔记        | `z-doc/ai.txt`                    | AI 相关思考和笔记            |
| 待讨论区域         | `z-doc/待讨论区域.md`             | 待讨论的内容                 |
