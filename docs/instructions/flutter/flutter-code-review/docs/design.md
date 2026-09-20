# 设计架构

> Flutter 通用代码检查指令集的整体设计思路。

## 设计目标

1. **通用性**：不绑定特定业务架构，所有 Flutter 3 项目均可使用
2. **可复制**：拷贝到新项目，修改配置即可使用
3. **可扩展**：检查维度可按需增减，支持自定义检查规则
4. **可追溯**：每次检查生成带时间戳的报告，支持历史对比

## 目录结构

```
docs/instructions/flutter/flutter-code-review/
│
├── docs/                          ← 人类文档区（本区域）
│   ├── index.md                   ← 概述 + 快速开始
│   ├── design.md                  ← 设计架构说明（本文件）
│   ├── execution-flow.md          ← 执行流程图
│   ├── config-guide.md            ← 配置指南
│   └── file-index.md              ← 文件索引
│
├── flutter-code-review/           ← AI 指令区（拷贝走的部分）
│   ├── config.md                  ← 填空式配置模板
│   ├── config.example.md          ← 完整配置示例
│   ├── glossary.md                ← 术语表
│   ├── entry/                     ← AI 入口
│   ├── check-rules/               ← 10 大检查维度规则
│   ├── instructions/              ← 执行指令
│   └── architecture/              ← 检查框架参照
│
└── VERSION.md                     ← 版本记录
```

## 设计决策

### 为什么偏向 GetX？

- 团队 Flutter 项目以 GetX 作为主力状态管理与路由方案
- GetX 提供了 View/Controller/Binding 三件套、依赖注入、路由、国际化等一体化能力
- 检查维度纳入 GetX 专项（build 内禁止 Get.put、Obx 粒度、Worker 生命周期等）
- 若项目未使用 GetX，可将 `state_management` 设为其他值，GetX 专项自动降级为提示

### 为什么以 Flutter 3 / Dart 3 为基线？

- 忽略历史版本（如 MaterialStateProperty、WillPopScope 等旧 API）的兼容写法
- 统一到 Material 3、WidgetStateProperty、PopScope、null safety、Dart 3 Records/Patterns/sealed class
- 检查项直接给出旧 API → 新 API 的迁移建议

### 为什么用 dart analyze 替代 ESLint 审计？

- Dart 生态的静态分析入口是 `analysis_options.yaml` + `dart analyze`
- 对应 Vue/React 的 ESLint 审计，检查 lint 规则集（`flutter_lints`）完整性

### 为什么报告支持历史对比？

- 帮助团队追踪代码质量趋势
- 量化改进效果（Error 从 X 降到 Y）
- 形成持续改进的正反馈循环
