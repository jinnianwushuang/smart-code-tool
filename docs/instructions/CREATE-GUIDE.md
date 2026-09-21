# 新增指令集指南

> 本文件是创建新指令集的完整规范。AI 助手在接到「新增指令集」任务时，必须先阅读本文件。

## 1. 指令集定义

指令集是一套**面向 AI 助手**的结构化指令文件集合。使用者将指令集拷贝到目标项目中，修改配置后，AI 即可按架构规范执行开发任务。

核心理念：**复制 → 改配置 → 傻瓜式快速使用**。

## 2. 目录隔离规则

所有指令集必须遵循两级目录隔离：

```
docs/instructions/<框架分类>/<指令集名称>/
```

| 层级               | 说明               | 示例                                |
| ------------------ | ------------------ | ----------------------------------- |
| 第一级：框架分类   | 按技术栈或用途分组 | `vue` / `react` / `code-review`     |
| 第二级：指令集名称 | 具体指令集标识     | `vue-assembler` / `react-assembler` |

**命名规则**：

- 框架分类：小写英文，如 `vue`、`react`、`code-review`
- 指令集名称：小写英文 + 连字符，如 `vue-assembler`、`react-hooks`
- 完整路径全部使用小写

## 3. 指令集内部结构

每个指令集目录内部分为**三个区域**：

```
docs/instructions/<框架分类>/<指令集名称>/
│
├── docs/                                      ← 人类文档区
│   ├── index.md                               ← 概述 + 快速开始
│   ├── design.md                              ← 设计架构说明
│   ├── execution-flow.md                      ← 执行流程图
│   ├── config-guide.md                        ← 配置指南
│   └── file-index.md                          ← 文件索引
│
├── <指令集名称>/                               ← AI 指令区（使用者拷贝走的部分）
│   ├── entry/                                 ← AI 入口
│   │   ├── context-entry.md                   ← 上下文加载入口
│   │   └── example.md                         ← 端到端完整示例
│   │
│   ├── architecture/                          ← 架构参照（内嵌代码片段）
│   │   └── *.md                               ← 按架构模块拆分
│   │
│   ├── instructions/                          ← 执行指令
│   │   ├── launcher.md                        ← 启动器（标准执行流程）
│   │   ├── constraints.md                     ← 约束规则
│   │   ├── code-standard.md                   ← 代码规范
│   │   ├── gate-check.md                      ← 门禁检查
│   │   ├── common-steps.md                    ← 通用基础步骤
│   │   ├── task-*.md                          ← 各类任务指令
│   │   └── review-checklist.md                ← 复核自检清单
│   │
│   ├── custom/                                ← 业务扩展指令区（仅第 4/6 层）
│   │   ├── index.md                           ← 入口汇总（AI 自动维护）
│   │   └── *.md                               ← 单个业务指令文件（一指令一文件）
│   │
│   ├── config.md                              ← 填空式配置模板
│   ├── config.example.md                      ← 完整配置示例
│   └── glossary.md                            ← 术语表
│
└── VERSION.md                                 ← 版本记录
```

## 4. 各区域职责与约束

### 4.1 docs/ — 人类文档区

| 规则     | 说明                                                   |
| -------- | ------------------------------------------------------ |
| 受众     | 人类阅读，VitePress 渲染                               |
| 是否拷贝 | **不拷贝**，留在原文档项目中                           |
| 语言风格 | 友好、有引导性、有导航链接                             |
| 必须包含 | 概述、快速开始、设计架构、执行流程、配置指南、文件索引 |

各文件职责：

| 文件                | 职责                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `index.md`          | 指令集概述、快速开始（4 步：拷贝→配置→加载→提交任务）、支持的任务类型、核心约束摘要、文档导航        |
| `design.md`         | 设计目标、完整目录结构树、设计决策解释（为什么分离、为什么内嵌代码、为什么两级隔离）、架构核心概念图 |
| `execution-flow.md` | ASCII 流程图总览 + 每个步骤的详细解释、任务提交格式模板                                              |
| `config-guide.md`   | 每个配置项的类型/必填/默认值/说明表格、最小化配置示例、常见问题                                      |
| `file-index.md`     | 目录结构总览 + 每个文件的功能说明表格                                                                |

### 4.2 `<指令集名称>/` — AI 指令区

| 规则     | 说明                                |
| -------- | ----------------------------------- |
| 受众     | AI 助手解析执行                     |
| 是否拷贝 | **整个目录拷贝**到目标项目          |
| 语言风格 | 精简、准确、结构化、无冗余          |
| 核心原则 | 自包含 — 不依赖外部路径即可完整执行 |

#### entry/ — AI 入口

| 文件               | 职责                   | 要求                                                                |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| `context-entry.md` | 定义 AI 加载文件的顺序 | 必须明确 5 步加载顺序：配置 → 术语 → 架构参照 → 执行框架 → 等待任务 |
| `example.md`       | 端到端完整示例         | 必须包含：任务提交格式 → AI 逐步执行过程 → 最终输出报告             |

#### architecture/ — 架构参照

| 规则                 | 说明                                                     |
| -------------------- | -------------------------------------------------------- |
| 内容                 | 按架构模块拆分的参照文件                                 |
| **必须内嵌代码片段** | 每个参照文件直接包含标准写法的代码示例，不引用外部路径   |
| 拆分粒度             | 一个核心概念一个文件（如状态管理、生命周期、组件系统等） |

内嵌代码片段格式：

````markdown
### 标准写法

```javascript
// 代码片段：xxx 的标准写法
// ... 完整可参照的代码 ...
```
````

#### instructions/ — 执行指令

| 文件                  | 职责                                                                   | 是否必须     |
| --------------------- | ---------------------------------------------------------------------- | ------------ |
| `launcher.md`         | 标准执行流程（步骤化）、任务类型识别规则表、存疑即问规则、安全熔断规则 | ✅ 必须      |
| `constraints.md`      | 硬性约束规则列表，AI 不可违反                                          | ✅ 必须      |
| `code-standard.md`    | 命名规范、注释规范、CSS 规范、代码量约束等                             | ✅ 必须      |
| `gate-check.md`       | 前置条件检查清单（配置完整性、文件存在性等）                           | ✅ 必须      |
| `common-steps.md`     | 被多个任务指令复用的通用步骤                                           | ✅ 必须      |
| `task-*.md`           | 各类任务的具体执行步骤                                                 | ✅ 至少 1 个 |
| `review-checklist.md` | 复核自检清单，分类列出检查项                                           | ✅ 必须      |

#### 根级文件

| 文件                | 职责           | 要求                                                                        |
| ------------------- | -------------- | --------------------------------------------------------------------------- |
| `config.md`         | 填空式配置模板 | 必填项标记 `<!-- 需配置 -->`，按类别分组（路径/技术栈/编码规范/资源清单等） |
| `config.example.md` | 完整填写示例   | 以一个真实项目为蓝本，所有配置项都有具体值                                  |
| `glossary.md`       | 术语表         | 分类列出所有术语，包含含义和对应文件                                        |

### 4.3 VERSION.md — 版本记录

| 规则 | 说明                            |
| ---- | ------------------------------- |
| 位置 | 指令集根目录下（与 docs/ 同级） |
| 格式 | 语义化版本号（SemVer）          |
| 内容 | 版本号 + 日期 + 变更说明        |

## 5. 设计原则（必须遵守）

### 5.1 自包含原则

- 架构参照文件**必须内嵌代码片段**，不能引用项目中的实际路径
- AI 拷贝到新项目后，无需额外配置即可理解架构标准写法
- 原因：新项目中可能不存在已验证的实现代码

### 5.2 用户与 AI 分离原则

- `docs/` 面向人类，追求引导性和可读性
- `<指令集名称>/` 面向 AI，追求精简和准确
- 两者独立维护，互不影响

### 5.3 配置驱动原则

- 所有项目相关的差异都通过 `config.md` 配置
- 必填项明确标记，可选项有默认值
- 提供 `config.example.md` 降低理解成本
- 可选 `show_config_before_exec` 实现配置透明化

### 5.4 约束优先原则

- 必须有 `constraints.md` 定义 AI 行为边界
- 核心约束包括：存疑即问、安全熔断、单次执行、验证边界
- AI 在任何任务中都不可违反这些约束

### 5.5 任务类型隔离原则

- 一次只执行一类任务
- 每类任务有独立的 `task-*.md` 指令文件
- 禁止混合执行多种任务类型

### 5.6 业务扩展指令原则（仅第 4/6 层）

- 第 4 层（代码检查）和第 6 层（文档生成）的指令集必须包含 `custom/` 子目录
- `custom/index.md` 作为入口汇总，列出所有扩展指令的标题、用途、创建时间
- 每个业务扩展指令独立一个 `.md` 文件，不合并
- AI 在执行中发现缺少指令时，主动创建新文件并更新 `index.md`
- AI 在执行指令后，可根据执行结果优化指令内容（自我进化）
- 扩展指令与预设指令物理隔离，互不干扰
- 每个扩展指令文件头部标注 `created`、`last_evolved`、`evolved_count` 时间戳

## 6. 创建流程（按顺序执行）

### 步骤 1：确定指令集定位

确认以下信息（存疑即问）：

- 框架分类（第一级目录名）
- 指令集名称（第二级目录名）
- 面向的架构/技术栈是什么
- 支持哪些任务类型（新需求开发/重构/迭代/修复/代码检查 等）

### 步骤 2：创建目录结构

```bash
# 创建指令集根目录
mkdir -p docs/instructions/<框架分类>/<指令集名称>/docs/
mkdir -p docs/instructions/<框架分类>/<指令集名称>/<指令集名称>/entry/
mkdir -p docs/instructions/<框架分类>/<指令集名称>/<指令集名称>/architecture/
mkdir -p docs/instructions/<框架分类>/<指令集名称>/<指令集名称>/instructions/

# 仅第 4 层（代码检查）和第 6 层（文档生成）需要创建 custom/ 目录
mkdir -p docs/instructions/<框架分类>/<指令集名称>/<指令集名称>/custom/
```

### 步骤 3：创建 AI 指令区文件

按以下优先级顺序创建（先核心后外围）：

```
Phase 1：architecture/ — 架构参照文件
  → 分析目标架构的核心模块
  → 每个模块一个文件，内嵌标准代码片段

Phase 2：config.md + config.example.md — 配置模板
  → 根据目标架构提取需要配置的项
  → 分类：路径/技术栈/编码规范/资源清单/可选参照源
  → 必填项标记 <!-- 需配置 -->

Phase 3：instructions/ 基础指令
  → launcher.md（启动器）
  → constraints.md（约束规则）
  → code-standard.md（代码规范）
  → gate-check.md（门禁检查）
  → common-steps.md（通用步骤）

Phase 4：instructions/ 任务指令
  → 每种任务类型一个 task-*.md
  → review-checklist.md（复核清单）

Phase 5：glossary.md — 术语表

Phase 6：entry/ — AI 入口
  → context-entry.md（加载顺序）
  → example.md（端到端示例）

Phase 7：VERSION.md — 版本记录
```

### 步骤 4：创建人类文档区文件

```
docs/index.md           — 概述 + 快速开始
docs/design.md          — 设计架构说明
docs/execution-flow.md  — 执行流程图
docs/config-guide.md    — 配置指南
docs/file-index.md      — 文件索引
```

### 步骤 5：注册到 VitePress

#### 5.1 更新总览页

编辑 `docs/instructions/index.md`，在「可用指令集」表格中新增一行。

#### 5.2 更新侧边栏

编辑 `docs/.vitepress/config/sidebar/instructions.js`，新增一个分组：

```javascript
{
  text: '<指令集显示名称>',
  collapsed: false,
  items: [
    { text: '概述与快速开始', link: '/instructions/<框架分类>/<指令集名称>/docs/' },
    { text: '设计架构', link: '/instructions/<框架分类>/<指令集名称>/docs/design' },
    { text: '执行流程', link: '/instructions/<框架分类>/<指令集名称>/docs/execution-flow' },
    { text: '配置指南', link: '/instructions/<框架分类>/<指令集名称>/docs/config-guide' },
    { text: '文件索引', link: '/instructions/<框架分类>/<指令集名称>/docs/file-index' },
  ],
},
```

如果有 VERSION.md，同时添加版本记录条目：

```javascript
{
  text: '版本记录',
  items: [
    { text: '<指令集显示名称> — 变更日志', link: '/instructions/<框架分类>/<指令集名称>/VERSION' },
  ],
},
```

### 步骤 6：更新打包脚本

编辑 `scripts/archive-instructions.mjs`，在 `TASKS` 数组中新增一条打包规则：

```javascript
{
  name: '<指令集名称>',
  src: 'docs/instructions/<框架分类>/<指令集名称>/<指令集名称>',
  output: `${ARCHIVE_DIR}/<指令集名称>.zip`,
},
```

同时在人类文档区 `docs/index.md` 的快速开始章节添加下载按钮：

```html
<a href="/<指令集名称>.zip" class="download-btn" download>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
  下载指令集压缩包
</a>
```

> 打包后的 zip 文件存放在 `docs/public/archive/` 目录，已加入 `.gitignore`，构建时自动生成。

### 步骤 7：质量自检

创建完成后，逐项检查以下清单：

## 7. 质量自检清单

### 目录结构

- [ ] 遵循两级目录隔离 `docs/instructions/<框架分类>/<指令集名称>/`
- [ ] docs/ 和 `<指令集名称>/` 两个区域分离
- [ ] VERSION.md 在根目录

### AI 指令区

- [ ] `entry/context-entry.md` 定义了明确的加载顺序
- [ ] `entry/example.md` 包含完整的端到端示例
- [ ] `architecture/` 每个文件内嵌了代码片段，不依赖外部路径
- [ ] `instructions/launcher.md` 有标准执行流程和任务类型识别规则
- [ ] `instructions/constraints.md` 有存疑即问、安全熔断、单次执行约束
- [ ] `instructions/gate-check.md` 有前置条件检查清单
- [ ] `instructions/common-steps.md` 有可复用的通用步骤
- [ ] 每种任务类型有独立的 `task-*.md`
- [ ] `instructions/review-checklist.md` 有分类自检项
- [ ] `config.md` 必填项标记 `<!-- 需配置 -->`
- [ ] `config.example.md` 所有配置项都有具体值
- [ ] `glossary.md` 覆盖所有领域特定术语

### 人类文档区

- [ ] `docs/index.md` 有快速开始 4 步引导
- [ ] `docs/design.md` 有设计决策解释
- [ ] `docs/execution-flow.md` 有 ASCII 流程图
- [ ] `docs/config-guide.md` 有配置项详解表格
- [ ] `docs/file-index.md` 有全部文件索引

### VitePress 注册

- [ ] `docs/instructions/index.md` 总览页已更新
- [ ] `docs/.vitepress/config/sidebar/instructions.js` 侧边栏已添加
- [ ] 侧边栏链接路径与实际文件路径一致

### 打包与下载

- [ ] `scripts/archive-instructions.mjs` 的 `TASKS` 数组已新增打包规则
- [ ] `docs/index.md` 快速开始章节已添加下载按钮
- [ ] 下载链接路径与打包输出路径一致

### 设计原则

- [ ] 自包含：架构参照不引用外部路径
- [ ] 配置驱动：项目差异通过 config.md 配置
- [ ] 约束优先：constraints.md 定义了行为边界
- [ ] 任务隔离：每种任务类型独立文件
- [ ] 业务扩展：第 4/6 层包含 `custom/` 目录，含入口汇总和统一格式

## 8. 业务扩展指令创建规范（仅第 4/6 层）

当指令集覆盖第 4 层（代码检查）或第 6 层（文档生成）时，必须包含 `custom/` 子目录。

### 目录结构

```
custom/
├── index.md                   ← 入口汇总（AI 自动维护）
├── check-api-consistency.md   ← 单个业务指令文件
├── check-state-flow.md        ← 单个业务指令文件
└── ...
```

### 入口汇总文件格式（custom/index.md）

```markdown
# 业务扩展指令汇总

> 本文件由 AI 助手自动维护，列出所有业务扩展指令。

| 指令文件                                               | 用途                 | 创建时间   | 最后进化   | 进化次数 |
| ------------------------------------------------------ | -------------------- | ---------- | ---------- | -------- |
| [check-api-consistency.md](./check-api-consistency.md) | 检查 API 接口一致性  | 2024-03-15 | 2024-04-02 | 3        |
| [check-state-flow.md](./check-state-flow.md)           | 检查状态机流转完整性 | 2024-03-20 | 2024-03-20 | 0        |
```

### 单个指令文件格式

```markdown
---
title: <指令标题>
layer: <所属层级，如 layer-4>
created: YYYY-MM-DD
last_evolved: YYYY-MM-DD
evolved_count: <进化次数>
source: ai | human
---

# <指令标题>

## 适用场景

<描述什么情况下触发此指令>

## 执行步骤

1. ...
2. ...

## 检查项 / 输出格式

- ...

## 进化记录

- YYYY-MM-DD: <本次进化内容>
```

### AI 追加与自我进化流程

```
AI 执行任务 → 发现缺少某条检查/生成指令
  → 在 custom/ 下创建新文件（按统一格式）
  → 更新 custom/index.md 汇总表格
  → 后续执行该指令后，评估结果
  → 发现可优化 → 修改指令文件 + 更新 last_evolved / evolved_count
  → 在「进化记录」中追加变更说明
```

## 9. 参照实现

当前已有一个完整的参照实现：

```
docs/instructions/vue/vue-assembler/
```

| 方面       | 说明                                           |
| ---------- | ---------------------------------------------- |
| 框架分类   | `vue`                                          |
| 指令集名称 | `vue-assembler`                                |
| 面向架构   | Vue 3 标准化装配架构                           |
| 任务类型   | 新需求开发 / 重构 / 需求迭代 / 修复 / 代码检查 |
| 文件总数   | 30 个（docs 5 + AI 指令区 24 + VERSION 1）     |

创建新指令集时，建议先阅读参照实现的文件结构和内容风格，保持一致性。

## 10. 常见场景 FAQ

### 同一框架下可以有多个指令集吗？

可以。例如 Vue 框架下可以有 `vue-assembler`（装配架构）和 `vue-composable`（组合式函数）两个指令集，它们各自独立目录。

### 任务类型必须和参照实现一样吗？

不需要。根据目标架构的实际场景定义任务类型。但至少应包含「新需求开发」和「代码检查」两类基础任务。

### config.md 的配置项数量有要求吗？

没有硬性要求。但建议分为「必填」和「可选」两类，必填项控制在 10 个以内，降低配置成本。

### 架构参照文件数量有要求吗？

根据架构复杂度决定。原则是：一个核心概念一个文件，每个文件控制在 100-200 行，内嵌的代码片段应完整可读。
