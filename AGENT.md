# AI 快速认知入口

> 本文件是 Qoder 自动加载的 Agent 上下文文件。
> AI 助手启动时自动载入，快速定位各模块的详细文档。

---

## 文档规范

所有 Markdown 文档必须遵循：[`z-doc/文档规范.md`](./z-doc/文档规范.md)

核心要求：

- 文件首行必须是 frontmatter（`---` 包裹）
- 必须包含 `title` 和 `tags` 字段
- tags 为字符串数组，1-6 个标签，反映核心技术主题
- 新增文档时运行 `node scripts/gen-doc-list.mjs` 重新生成 doc-list.json

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

## 其他文档索引

| 文档           | 路径                       | 说明              |
| -------------- | -------------------------- | ----------------- |
| 子项目添加指南 | `z-doc/add-sub-project.md` | 如何添加子项目    |
| AI 相关笔记    | `z-doc/ai.txt`             | AI 相关思考和笔记 |
| 待讨论区域     | `z-doc/待讨论区域.md`      | 待讨论的内容      |
