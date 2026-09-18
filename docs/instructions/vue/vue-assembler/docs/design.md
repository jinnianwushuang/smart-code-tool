# 设计架构

> Vue 装配架构指令集的整体设计思路与目录结构。

## 设计目标

1. **可复制**：整个指令集拷贝到新项目，修改配置即可使用
2. **自包含**：架构参照文件内嵌代码片段，无需额外依赖外部路径
3. **可扩展**：两级目录隔离，支持多指令集共存（Vue / React / 代码检查等）
4. **安全可控**：存疑即问、安全熔断、验证边界等多重约束机制
5. **用户与 AI 分离**：人类文档（`docs/`）与 AI 指令文件（`vue-assembler/`）独立维护

## 目录结构设计

```
docs/instructions/vue/vue-assembler/          ← 指令集根目录
│
├── docs/                                      ← 人类文档区（VitePress 渲染）
│   ├── index.md                               ← 概述 + 快速开始
│   ├── design.md                              ← 设计架构说明（本文件）
│   ├── execution-flow.md                      ← 执行流程图
│   ├── config-guide.md                        ← 配置指南
│   └── file-index.md                          ← 文件索引
│
├── vue-assembler/                             ← AI 指令区（拷贝走的部分）
│   │
│   ├── entry/                                 ← AI 入口
│   │   ├── context-entry.md                   ← 上下文加载入口（AI 首先读取）
│   │   └── example.md                         ← 端到端完整示例
│   │
│   ├── architecture/                          ← 架构参照（内嵌代码片段）
│   │   ├── assembler-reference.md             ← 装配器核心机制
│   │   ├── state-reference.md                 ← 状态管理参照
│   │   ├── lifecycle-reference.md             ← 生命周期与副作用
│   │   ├── event-pipeline-reference.md        ← 事件管道参照
│   │   ├── component-reference.md             ← 组件系统参照
│   │   ├── api-request-reference.md           ← API 请求参照（单例模板）
│   │   └── directory-convention.md            ← 目录与命名约定
│   │
│   ├── instructions/                          ← 执行指令
│   │   ├── launcher.md                        ← 启动器（9 步标准流程）
│   │   ├── constraints.md                     ← 约束规则（8 条硬性约束）
│   │   ├── code-standard.md                   ← 代码规范
│   │   ├── gate-check.md                      ← 门禁检查（前置条件）
│   │   ├── common-steps.md                    ← 通用基础步骤（A-F）
│   │   ├── task-new-feature.md                ← 任务：新需求开发
│   │   ├── task-refactor.md                   ← 任务：重构
│   │   ├── task-iteration.md                  ← 任务：需求迭代
│   │   ├── task-fix.md                        ← 任务：修复
│   │   ├── task-code-review.md                ← 任务：代码检查
│   │   └── review-checklist.md                ← 复核自检清单
│   │
│   ├── config.md                              ← 填空式配置模板
│   ├── config.example.md                      ← 完整配置示例
│   └── glossary.md                            ← 架构术语表
│
└── VERSION.md                                 ← 版本记录
```

## 设计决策

### 为什么用户文档与 AI 指令分离？

| 考量     | 说明                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 受众不同 | `docs/` 面向人类阅读，支持 VitePress 渲染美化；`vue-assembler/` 面向 AI 解析，追求精简准确 |
| 拷贝粒度 | 用户只需拷贝 `vue-assembler/` 子目录，`docs/` 留在原文档项目中                             |
| 维护独立 | 文档更新不影响 AI 指令，反之亦然                                                           |

### 为什么架构参照内嵌代码片段？

- **自包含**：AI 不需要再去读取项目中的实际源码路径，避免路径不存在时的上下文断裂
- **可复制**：拷贝到新项目后，架构参照即刻可用，无需额外配置
- **一致性**：代码片段是标准化的"应该怎么写"，而非"当前怎么写"

### 为什么采用两级目录隔离？

```
docs/instructions/<框架分类>/<指令集名称>/
```

- **框架分类**（第一级）：按技术栈分组（vue / react / code-review），便于总览页分类展示
- **指令集名称**（第二级）：同一框架下可有多个指令集，互不干扰
- **可扩展**：未来新增 React 指令集只需添加 `docs/instructions/react/react-assembler/`

### 配置透明化设计

- `config.md` 采用填空式模板，标记 `<!-- 需配置 -->` 的为必填项
- `config.example.md` 提供完整填写示例，降低理解成本
- `show_config_before_exec` 选项允许用户在执行前查看合并后的完整配置，避免黑盒

## 装配架构核心概念

本指令集面向的 Vue 3 标准化装配架构，核心思想是：

```
┌─────────────────────────────────────────┐
│              index.vue                  │
│  定义 base_payload（props/emit/pipeline）│
│  调用 useContextAssembler 注入上下文     │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │   assembler.js  │
       │  自动发现模块    │
       │  验证并组合模块  │
       │  生成 payload    │
       └───────┬────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 state/    module/    component/
 状态管理   事件管道    组件
 生命周期   副作用清理
```

- **装配器（Assembler）**：核心枢纽，通过 `import.meta.glob` 自动发现并组合模块
- **payload**：统一上下文对象，在模块间传递状态、方法和事件管道
- **事件管道**：集中式事件处理系统，所有用户交互通过管道路由
- **生命周期编排**：6 个钩子函数 + 6 种副作用清理，确保资源正确释放

详细概念请参照 [术语表](../vue-assembler/glossary.md)。
