# DISCUSSION-TO-DOC — 待讨论内容转深度文档并接入菜单入口

> **指令用途**：把 `z-doc/待讨论区域.md` 中随手记录的主题要点，扩写成一篇**有深度**的技术文档，放入 `docs/dev-knowledge/` 合适目录，并同步接入侧边栏菜单与入口，最后跑完文档站的生成脚本，一步到位。
>
> **触发方式**：直接发送指令名 `DISCUSSION-TO-DOC`，或说「执行 DISCUSSION-TO-DOC 指令」。
>
> **配套输入**：用户在 `z-doc/待讨论区域.md` 内写好主题要点（可以很零散，如「JSBridge 基础原理 / RN 和 EXPO 桥接 / 胶水层 / 多种通信模式」）。若用户在指令里额外指定了主题或目标目录，以用户当次说明为准。

---

## 一、执行流程

### 第 1 步：读取待讨论内容

1. 读取 `z-doc/待讨论区域.md`，提取用户本次要落地的主题要点。
2. 若文件为空或无明确主题，**先询问用户**要写什么，不要凭空猜测。
3. 把零散要点归纳为文档需要覆盖的核心子话题清单（后续每个子话题都要在正文里有对应章节，不能遗漏）。

### 第 2 步：确定文档归属目录

参考 `docs/dev-knowledge/entry.md` 的「4.1 文件放置规则」判断内容属于哪个框架/领域：

| 内容属于       | 放置目录                                                      |
| -------------- | ------------------------------------------------------------- |
| Vue 相关       | `dev-knowledge/vue/architecture/` 或 `interview/<level>/`     |
| React 相关     | `dev-knowledge/react/architecture/` 或 `interview/<level>/`   |
| Flutter 相关   | `dev-knowledge/flutter/architecture/` 或 `interview/<level>/` |
| JS/TS 语言层   | `dev-knowledge/js-ts/architecture/` 或 `interview/<level>/`   |
| Node.js 相关   | `dev-knowledge/nodejs/`                                       |
| Python 相关    | `dev-knowledge/python/`                                       |
| 跨框架通用知识 | `dev-knowledge/cross-domain/` 下对应子目录                    |
| 学习路径规划   | `dev-knowledge/learning-paths/`                               |

- **拿不准时**：先 `Glob`/`ls` 查看候选目录里已有的文档，选主题最贴近的一组归入。
- 跨端 / 桥接 / 架构 / 工程化 / 数据结构 / 设计模式等通用主题 → `cross-domain/` 下对应子目录。

### 第 3 步：对齐格式规范

1. 读取目标目录内 1-2 篇现有文档，对齐 frontmatter 字段、标题风格、章节结构、ASCII 图风格。
2. 读取 `z-doc/文档规范.md`（如涉及 Markdown/Vue 组件写法约束）。

### 第 4 步：创建深度文档

- **文件名**：kebab-case，语义化，如 `jsbridge-and-native-communication.md`。
- **必须「有深度」**：不能停留在概念罗列，要讲清底层原理、演进脉络、方案对比、代码示例。
- **Frontmatter 必填**：`title`（含等级标签如 `[P7-P8]`）、`level`、`tags`；可选 `difficulty`、`target`。
- **推荐结构**（What → Why → How）：

```markdown
---
title: '标题 [P6-P7]'
level: 'advanced'
tags: ['标签1', '标签2']
difficulty: 'hard'
target: '高级工程师（P6-P7）'
---

# 标题 [P6-P7]

> 一句话说明本文解决什么问题。

## 核心概念（What） ← 定义、知识框架、ASCII 思维导图

## 底层原理（Why） ← 原理拆解、演进脉络、方案对比表、代码示例

## 高频面试题 ← Q + 参考答案要点

## 延伸思考 ← 设计题 / 场景题 / 对比题

## 相关链接 ← 站内绝对路径（去 .md 后缀）+ 权威外部链接
```

- **覆盖度检查**：第 1 步归纳的每个子话题都要在正文有对应章节。
- **链接规范**：站内用绝对路径、不加 `.md`、不手写 base 前缀（`/smart-code-tool/` 自动拼接）。

### 第 5 步：接入侧边栏菜单

编辑对应模块的侧边栏文件 `docs/.vitepress/config/sidebar/dev-knowledge/<module>.js`（如 `cross-domain.js`）：

- 在对应分组 `items` 数组末尾追加一条：

```javascript
{
  text: '文档标题 [P6-P7]',
  link: '/dev-knowledge/cross-domain/api-and-cross-platform/jsbridge-and-native-communication',
},
```

- **`id` 字段无需手写**，第 7 步的 `inject-sidebar-ids.mjs` 会自动注入。

### 第 6 步：更新入口描述

更新目标目录的 `entry.md` 和 `index.md` 里的一句话概述，把新文档主题补进去（两个文件都要改，保持一致）。

### 第 7 步：运行生成脚本（顺序固定）

```bash
cd /Users/jinnian/Code/web/smart-code-tool
node scripts/inject-sidebar-ids.mjs   # 注入侧边栏 id
pnpm gen:frontmatter-tags             # 生成/补充 frontmatter 标签
pnpm gen:doc-list                     # 重新生成 doc-list.json
```

- 确认脚本输出中新文档已被收录（对应分组篇数 +1）。

### 第 8 步：收尾

1. 询问/告知用户：是否需要把已落地的要点从 `z-doc/待讨论区域.md` 中移除（默认**不自动删**，除非用户要求）。
2. **不自动执行 `pnpm build`**（遵循「小改动不自动构建验证」约定），提醒用户需要预览/验证时自行 `pnpm dev` 或 `pnpm build`。
3. 输出变更摘要：新增文档路径、归属目录、菜单项、脚本执行结果。

---

## 二、深度要求清单

一篇合格的「深度文档」应满足：

```
□ 有 ASCII 架构图/流程图/时序图，可视化关键机制
□ 有方案/版本对比表（横向对比多种实现或演进阶段）
□ 有真实可读的代码示例（多语言/多端场景要给出对应代码）
□ 讲清「为什么这样设计」而不仅是「是什么」
□ 覆盖待讨论区列出的全部子话题，无遗漏
□ 附高频面试题 + 延伸思考题
□ 相关链接指向站内文档 + 权威外部资料
```

---

## 三、注意事项

1. **主题不明时先问**，不要凭空捏造内容或强行归类。
2. **归属目录要准**，宁可多花时间对比现有文档，也不要放错模块。
3. **entry.md 与 index.md 都要更新**，两者概述需一致。
4. **侧边栏 id 交给脚本**，手动写容易冲突/格式错误。
5. **链接不加 .md、不写 base 前缀**，遵循 VitePress 路由约定。
6. **脚本按顺序跑**，`inject-sidebar-ids` 必须在改完侧边栏之后。
7. **不自动 build**，仅提醒用户。

---

## 四、涉及文件速查

| 用途       | 路径                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 待讨论输入 | `z-doc/待讨论区域.md`                                                            |
| 放置规则   | `docs/dev-knowledge/entry.md`（4.1 节）                                          |
| 写作规范   | `z-doc/文档规范.md`                                                              |
| 侧边栏配置 | `docs/.vitepress/config/sidebar/dev-knowledge/<module>.js`                       |
| 目录入口   | 目标目录下的 `entry.md` + `index.md`                                             |
| 生成脚本   | `scripts/inject-sidebar-ids.mjs`、`add-frontmatter-tags.mjs`、`gen-doc-list.mjs` |

---

## 五、上次执行记录

| 日期       | 主题     | 执行结果                                                                                                     |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| 2026.11.03 | JSBridge | 新建 `cross-domain/api-and-cross-platform/jsbridge-and-native-communication.md`，接入侧边栏+入口，脚本已跑通 |
| 2026.11.04 | 三框架生命周期与 Hooks 对比 | 新建 `cross-domain/architecture-and-system/framework-lifecycle-hooks-comparison.md`（与性能对决正交维度），接入「跨框架思考文档」侧边栏+入口，脚本已跑通 |
