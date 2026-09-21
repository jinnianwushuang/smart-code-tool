# 文件索引

> 指令集全部文件的功能索引，按目录组织。

## 目录结构总览

```
react-assembler/
├── docs/                          ← 人类文档区
│   ├── index.md
│   ├── design.md
│   ├── execution-flow.md
│   ├── config-guide.md
│   └── file-index.md              ← 本文件
│
├── react-assembler/               ← AI 指令区
│   ├── entry/
│   │   ├── context-entry.md
│   │   └── example.md
│   ├── architecture/
│   │   ├── component-reference.md
│   │   ├── hooks-reference.md
│   │   ├── state-reference.md
│   │   ├── actions-reference.md
│   │   ├── rsc-reference.md
│   │   └── directory-convention.md
│   ├── instructions/
│   │   ├── launcher.md
│   │   ├── constraints.md
│   │   ├── code-standard.md
│   │   ├── gate-check.md
│   │   ├── common-steps.md
│   │   ├── task-new-feature.md
│   │   ├── task-refactor.md
│   │   ├── task-iteration.md
│   │   ├── task-fix.md
│   │   ├── task-code-review.md
│   │   └── review-checklist.md
│   ├── config.md
│   ├── config.example.md
│   └── glossary.md
│
└── VERSION.md
```

## 文件索引

### docs/ — 人类文档区

面向人类阅读，VitePress 渲染。不随指令集拷贝。

| 文件 | 功能 |
|------|------|
| [index.md](../docs/index.md) | 指令集概述、快速开始、支持的任务类型、核心约束 |
| [design.md](../docs/design.md) | 设计架构说明、目录结构设计、设计决策解释 |
| [execution-flow.md](../docs/execution-flow.md) | AI 执行任务的完整流程图（ASCII 流程图 + 各步骤详解） |
| [config-guide.md](../docs/config-guide.md) | config.md 各配置项详细说明、最小化配置示例、常见问题 |
| [file-index.md](../docs/file-index.md) | 本文件，全部文件的功能索引 |

### entry/ — AI 入口

AI 助手使用指令集的起点。

| 文件 | 功能 |
|------|------|
| [context-entry.md](../react-assembler/entry/context-entry.md) | **AI 入口文件**。定义 5 步加载顺序：配置 → 术语 → 架构参照 → 执行框架 → 等待任务 |
| [example.md](../react-assembler/entry/example.md) | 端到端完整示例。从任务提交格式到 AI 10 步执行过程到输出报告 |

### architecture/ — 架构参照

内嵌标准代码片段，自包含，无需依赖外部路径。AI 按需读取。

| 文件 | 功能 |
|------|------|
| [component-reference.md](../react-assembler/architecture/component-reference.md) | React 19 组件模式：函数组件、Composition 模式、Compiler 约束、ref 作为 prop |
| [hooks-reference.md](../react-assembler/architecture/hooks-reference.md) | 自定义 Hooks 模式：页面 Hook、功能 Hook、数据 Hook、工具 Hook 分类与写法 |
| [state-reference.md](../react-assembler/architecture/state-reference.md) | 状态管理模式：useState/useReducer/Zustand/Context 分层与选型决策树 |
| [actions-reference.md](../react-assembler/architecture/actions-reference.md) | Actions 模式：useActionState、乐观更新 useOptimistic、use() API |
| [rsc-reference.md](../react-assembler/architecture/rsc-reference.md) | Server/Client 组件边界：`'use client'`/`'use server'` 标记与数据获取模式 |
| [directory-convention.md](../react-assembler/architecture/directory-convention.md) | 目录与命名约定：页面目录结构、全局共享目录、文件/变量命名规则 |

### instructions/ — 执行指令

AI 执行框架与任务指令。

| 文件 | 功能 |
|------|------|
| [launcher.md](../react-assembler/instructions/launcher.md) | **启动器**。9 步标准执行流程、任务类型识别规则、存疑即问、安全熔断 |
| [constraints.md](../react-assembler/instructions/constraints.md) | **约束规则**。8 条硬性约束：单次执行、存疑即问、安全熔断、Compiler 兼容、CSS 复用等 |
| [code-standard.md](../react-assembler/instructions/code-standard.md) | 代码规范：命名、注释、组件规范、Hooks 规则、CSS 优先级 |
| [gate-check.md](../react-assembler/instructions/gate-check.md) | 门禁检查：4 类前置检查（配置完整性、文件存在性、任务信息、依赖） |
| [common-steps.md](../react-assembler/instructions/common-steps.md) | 通用基础步骤：复用步骤，被各任务指令引用 |
| [task-new-feature.md](../react-assembler/instructions/task-new-feature.md) | 任务指令：新需求开发（6 步流程） |
| [task-refactor.md](../react-assembler/instructions/task-refactor.md) | 任务指令：重构（5 步流程） |
| [task-iteration.md](../react-assembler/instructions/task-iteration.md) | 任务指令：需求迭代（5 步流程） |
| [task-fix.md](../react-assembler/instructions/task-fix.md) | 任务指令：修复（5 步流程） |
| [task-code-review.md](../react-assembler/instructions/task-code-review.md) | 任务指令：代码检查（含报告生成和总表更新） |
| [review-checklist.md](../react-assembler/instructions/review-checklist.md) | 复核自检清单：10 类检查项（命名/注释/代码量/架构/Compiler/Hooks/状态/CSS/组件/完成度） |

### 根级文件

| 文件 | 功能 |
|------|------|
| [config.md](../react-assembler/config.md) | **填空式配置模板**。5 大类配置项，标记 `<!-- 需配置 -->` 的为必填 |
| [config.example.md](../react-assembler/config.example.md) | **完整配置示例**。以 React 19 + Ant Design + Zustand 项目为蓝本的完整填写示例 |
| [glossary.md](../react-assembler/glossary.md) | **架构术语表**。核心概念、状态、事件、生命周期、命名规则 |
| [VERSION.md](../VERSION.md) | 版本记录与变更日志 |
