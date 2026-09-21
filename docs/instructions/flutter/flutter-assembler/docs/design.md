# 设计架构

> Flutter 装配架构指令集的整体设计思路与目录结构。

## 设计目标

1. **可复制**：整个指令集拷贝到新项目，修改配置即可使用
2. **自包含**：架构参照文件内嵌代码片段，无需额外依赖外部路径
3. **可扩展**：两级目录隔离，支持多指令集共存（Vue / React / Flutter 等）
4. **安全可控**：存疑即问、安全熔断、验证边界等多重约束机制
5. **用户与 AI 分离**：人类文档（`docs/`）与 AI 指令文件（`flutter-assembler/`）独立维护
6. **Material 3 友好**：所有规范兼容 Flutter 3 + Material 3

## 目录结构设计

```
docs/instructions/flutter/flutter-assembler/          ← 指令集根目录
│
├── docs/                                              ← 人类文档区（VitePress 渲染）
│   ├── index.md                                       ← 概述 + 快速开始
│   ├── design.md                                      ← 设计架构说明（本文件）
│   ├── execution-flow.md                              ← 执行流程图
│   ├── config-guide.md                                ← 配置指南
│   └── file-index.md                                  ← 文件索引
│
├── flutter-assembler/                                 ← AI 指令区（拷贝走的部分）
│   │
│   ├── entry/                                         ← AI 入口
│   │   ├── context-entry.md                           ← 上下文加载入口
│   │   └── example.md                                 ← 端到端完整示例
│   │
│   ├── architecture/                                  ← 架构参照（内嵌代码片段）
│   │   ├── widget-reference.md                        ← Widget 装配模式
│   │   ├── controller-reference.md                    ← GetxController 生命周期
│   │   ├── state-reference.md                         ← 状态管理模式
│   │   ├── route-reference.md                         ← 路由管理
│   │   ├── lifecycle-reference.md                     ← 生命周期约束
│   │   └── directory-convention.md                    ← 目录与命名约定
│   │
│   ├── instructions/                                  ← 执行指令
│   │   ├── launcher.md                                ← 启动器（9 步标准流程）
│   │   ├── constraints.md                             ← 约束规则（8 条硬性约束）
│   │   ├── code-standard.md                           ← 代码规范
│   │   ├── gate-check.md                              ← 门禁检查
│   │   ├── common-steps.md                            ← 通用基础步骤
│   │   ├── task-new-feature.md                        ← 任务：新需求开发
│   │   ├── task-refactor.md                           ← 任务：重构
│   │   ├── task-iteration.md                          ← 任务：需求迭代
│   │   ├── task-fix.md                                ← 任务：修复
│   │   ├── task-code-review.md                        ← 任务：代码检查
│   │   └── review-checklist.md                        ← 复核自检清单
│   │
│   ├── config.md                                      ← 填空式配置模板
│   ├── config.example.md                              ← 完整配置示例
│   └── glossary.md                                    ← 架构术语表
│
└── VERSION.md                                         ← 版本记录
```

## 设计决策

### 为什么用户文档与 AI 指令分离？

| 考量 | 说明 |
| --- | --- |
| 受众不同 | `docs/` 面向人类阅读；`flutter-assembler/` 面向 AI 解析 |
| 拷贝粒度 | 用户只需拷贝 `flutter-assembler/` 子目录 |
| 维护独立 | 文档更新不影响 AI 指令，反之亦然 |

### 为什么架构参照内嵌代码片段？

- **自包含**：AI 不需要再去读取项目中的实际源码路径
- **可复制**：拷贝到新项目后即刻可用
- **一致性**：代码片段是标准化的"应该怎么写"

### 为什么采用两级目录隔离？

```
docs/instructions/<框架分类>/<指令集名称>/
```

- **框架分类**（第一级）：按技术栈分组（vue / react / flutter）
- **指令集名称**（第二级）：同一框架下可有多个指令集

## 装配架构核心概念

本指令集面向的 Flutter 3 + GetX 装配模式，核心思想是：

```
┌──────────────────────────────────────┐
│         xxx_page.dart                │
│  页面入口（GetView<Controller>）      │
│  组合子 Widget，通过 Controller 通信  │
└──────────────┬───────────────────────┘
               │
       ┌───────▼─────────┐
       │  xxx_controller  │
       │  .dart           │
       │  业务逻辑         │
       │  状态 + 事件      │
       │  + API 调用       │
       └───────┬─────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 子 Widget   Model      API 服务
 (Obx/       (数据模型)  (dio/http)
  GetBuilder)
```

- **GetView 模式**：页面入口继承 `GetView<T>`，通过 `controller` 访问业务逻辑
- **Binding 注入**：Controller 通过 Binding 注册，自动管理生命周期
- **Obx 下沉**：响应式监听贴近最小刷新单元
- **状态分层**：响应式状态（.obs）→ 简单状态（GetBuilder）→ 全局状态（lazySingleton）

详细概念请参照 [术语表](../flutter-assembler/glossary.md)。
