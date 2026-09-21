# 文件索引

> 指令集全部文件的功能索引，按目录组织。

## 目录结构总览

```
flutter-assembler/
├── docs/                          ← 人类文档区
│   ├── index.md
│   ├── design.md
│   ├── execution-flow.md
│   ├── config-guide.md
│   └── file-index.md              ← 本文件
│
├── flutter-assembler/             ← AI 指令区
│   ├── entry/
│   │   ├── context-entry.md
│   │   └── example.md
│   ├── architecture/
│   │   ├── widget-reference.md
│   │   ├── controller-reference.md
│   │   ├── state-reference.md
│   │   ├── route-reference.md
│   │   ├── lifecycle-reference.md
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

| 文件 | 功能 |
|------|------|
| [index.md](../docs/index.md) | 指令集概述、快速开始、支持的任务类型、核心约束 |
| [design.md](../docs/design.md) | 设计架构说明、目录结构设计、设计决策解释 |
| [execution-flow.md](../docs/execution-flow.md) | AI 执行任务的完整流程图 |
| [config-guide.md](../docs/config-guide.md) | config.md 各配置项详细说明、最小化配置示例 |
| [file-index.md](../docs/file-index.md) | 本文件，全部文件的功能索引 |

### entry/ — AI 入口

| 文件 | 功能 |
|------|------|
| [context-entry.md](../flutter-assembler/entry/context-entry.md) | **AI 入口文件**。定义 5 步加载顺序 |
| [example.md](../flutter-assembler/entry/example.md) | 端到端完整示例 |

### architecture/ — 架构参照

| 文件 | 功能 |
|------|------|
| [widget-reference.md](../flutter-assembler/architecture/widget-reference.md) | Widget 装配模式：GetView、const 构造、Obx 下沉、Material 3 |
| [controller-reference.md](../flutter-assembler/architecture/controller-reference.md) | GetxController 生命周期：onInit/onReady/onClose、Binding 注册 |
| [state-reference.md](../flutter-assembler/architecture/state-reference.md) | 状态管理：Obx/GetBuilder、响应式 vs 简单状态、Obx 粒度控制 |
| [route-reference.md](../flutter-assembler/architecture/route-reference.md) | 路由管理：命名路由、GetPage、Middleware |
| [lifecycle-reference.md](../flutter-assembler/architecture/lifecycle-reference.md) | 生命周期约束：禁止 build 内 Get.put、Isolate 并发 |
| [directory-convention.md](../flutter-assembler/architecture/directory-convention.md) | 目录与命名约定 |

### instructions/ — 执行指令

| 文件 | 功能 |
|------|------|
| [launcher.md](../flutter-assembler/instructions/launcher.md) | **启动器**。9 步标准执行流程 |
| [constraints.md](../flutter-assembler/instructions/constraints.md) | **约束规则**。8 条硬性约束 |
| [code-standard.md](../flutter-assembler/instructions/code-standard.md) | 代码规范：命名、注释、Widget/Controller/Binding 规范 |
| [gate-check.md](../flutter-assembler/instructions/gate-check.md) | 门禁检查：4 类前置检查 |
| [common-steps.md](../flutter-assembler/instructions/common-steps.md) | 通用基础步骤 |
| [task-new-feature.md](../flutter-assembler/instructions/task-new-feature.md) | 任务指令：新需求开发 |
| [task-refactor.md](../flutter-assembler/instructions/task-refactor.md) | 任务指令：重构 |
| [task-iteration.md](../flutter-assembler/instructions/task-iteration.md) | 任务指令：需求迭代 |
| [task-fix.md](../flutter-assembler/instructions/task-fix.md) | 任务指令：修复 |
| [task-code-review.md](../flutter-assembler/instructions/task-code-review.md) | 任务指令：代码检查 |
| [review-checklist.md](../flutter-assembler/instructions/review-checklist.md) | 复核自检清单：10 类检查项 |

### 根级文件

| 文件 | 功能 |
|------|------|
| [config.md](../flutter-assembler/config.md) | **填空式配置模板** |
| [config.example.md](../flutter-assembler/config.example.md) | **完整配置示例** |
| [glossary.md](../flutter-assembler/glossary.md) | **架构术语表** |
| [VERSION.md](../VERSION.md) | 版本记录与变更日志 |
