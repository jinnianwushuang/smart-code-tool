# 文件索引

> 指令集全部文件的功能索引，按目录组织。

## 目录结构总览

```
vue-assembler/
├── docs/                          ← 人类文档区
│   ├── index.md
│   ├── design.md
│   ├── execution-flow.md
│   ├── config-guide.md
│   └── file-index.md              ← 本文件
│
├── vue-assembler/                 ← AI 指令区
│   ├── entry/
│   │   ├── context-entry.md
│   │   └── example.md
│   ├── architecture/
│   │   ├── assembler-reference.md
│   │   ├── state-reference.md
│   │   ├── lifecycle-reference.md
│   │   ├── event-pipeline-reference.md
│   │   ├── component-reference.md
│   │   ├── api-request-reference.md
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
| [context-entry.md](../vue-assembler/entry/context-entry.md) | **AI 入口文件**。定义 5 步加载顺序：配置 → 术语 → 架构参照 → 执行框架 → 等待任务 |
| [example.md](../vue-assembler/entry/example.md) | 端到端完整示例。从任务提交格式到 AI 10 步执行过程到输出报告 |

### architecture/ — 架构参照

内嵌标准代码片段，自包含，无需依赖外部路径。AI 按需读取。

| 文件 | 功能 |
|------|------|
| [assembler-reference.md](../vue-assembler/architecture/assembler-reference.md) | 装配器核心机制：assembler.js 标准写法、多例/单例 index.vue 写法、模块命名规则 |
| [state-reference.md](../vue-assembler/architecture/state-reference.md) | 状态管理参照：单例/多例/计算/配置四类状态的标准写法 |
| [lifecycle-reference.md](../vue-assembler/architecture/lifecycle-reference.md) | 生命周期参照：6 个钩子函数标准写法 + 6 种副作用清理完整代码 |
| [event-pipeline-reference.md](../vue-assembler/architecture/event-pipeline-reference.md) | 事件管道参照：注册方式、按业务域组织、事件链、创建新事件步骤 |
| [component-reference.md](../vue-assembler/architecture/component-reference.md) | 组件系统参照：三大核心组件、包装器模式、组件通信流程 |
| [api-request-reference.md](../vue-assembler/architecture/api-request-reference.md) | API 请求参照：7 步标准请求流程、调用链路（仅单例模板） |
| [directory-convention.md](../vue-assembler/architecture/directory-convention.md) | 目录与命名约定：多例/单例模板完整目录结构、文件/变量命名规则 |

### instructions/ — 执行指令

AI 执行框架与任务指令。

| 文件 | 功能 |
|------|------|
| [launcher.md](../vue-assembler/instructions/launcher.md) | **启动器**。9 步标准执行流程、任务类型识别规则、存疑即问、安全熔断 |
| [constraints.md](../vue-assembler/instructions/constraints.md) | **约束规则**。8 条硬性约束：单次执行、存疑即问、安全熔断、验证边界、CSS 复用等 |
| [code-standard.md](../vue-assembler/instructions/code-standard.md) | 代码规范：命名、注释、模块职责、payload 传递、CSS 优先级、组件规范 |
| [gate-check.md](../vue-assembler/instructions/gate-check.md) | 门禁检查：4 类前置检查（配置完整性、文件存在性、任务信息、依赖） |
| [common-steps.md](../vue-assembler/instructions/common-steps.md) | 通用基础步骤：6 个复用步骤（A-F），被各任务指令引用 |
| [task-new-feature.md](../vue-assembler/instructions/task-new-feature.md) | 任务指令：新需求开发（7 步流程） |
| [task-refactor.md](../vue-assembler/instructions/task-refactor.md) | 任务指令：重构（5 步流程） |
| [task-iteration.md](../vue-assembler/instructions/task-iteration.md) | 任务指令：需求迭代（4 步流程） |
| [task-fix.md](../vue-assembler/instructions/task-fix.md) | 任务指令：修复（5 步流程） |
| [task-code-review.md](../vue-assembler/instructions/task-code-review.md) | 任务指令：代码检查（10 步流程，含报告生成和总表更新） |
| [review-checklist.md](../vue-assembler/instructions/review-checklist.md) | 复核自检清单：9 类检查项（命名/注释/代码量/架构/状态/副作用/CSS/组件/完成度） |

### 根级文件

| 文件 | 功能 |
|------|------|
| [config.md](../vue-assembler/config.md) | **填空式配置模板**。6 大类配置项，标记 `<!-- 需配置 -->` 的为必填 |
| [config.example.md](../vue-assembler/config.example.md) | **完整配置示例**。以当前项目为蓝本的完整填写示例 |
| [glossary.md](../vue-assembler/glossary.md) | **架构术语表**。核心概念、状态、事件、生命周期、副作用、模板、命名规则 |
| [VERSION.md](../VERSION.md) | 版本记录与变更日志 |
