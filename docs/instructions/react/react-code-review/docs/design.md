# 设计架构

> React 通用代码检查指令集的整体设计思路。

## 设计目标

1. **通用性**：不绑定特定架构，所有 React 19 项目均可使用
2. **可复制**：拷贝到新项目，修改配置即可使用
3. **可扩展**：检查维度可按需增减，支持自定义检查规则
4. **可追溯**：每次检查生成带时间戳的报告，支持历史对比

## 目录结构

```
docs/instructions/react/react-code-review/
│
├── docs/                          ← 人类文档区（本区域）
│   ├── index.md                   ← 概述 + 快速开始
│   ├── design.md                  ← 设计架构说明（本文件）
│   ├── execution-flow.md          ← 执行流程图
│   ├── config-guide.md            ← 配置指南
│   └── file-index.md              ← 文件索引
│
├── react-code-review/             ← AI 指令区（拷贝走的部分）
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

### 为什么不绑定特定架构？

- 代码检查是所有 React 19 项目的通用需求
- 不同项目可能使用不同的架构模式（Zustand、Redux Toolkit、Context、Next.js App Router 等）
- 检查维度聚焦于通用的代码质量和最佳实践

### 为什么默认启用 React Compiler 约束？

- React 19 官方推荐启用 React Compiler 自动优化
- Compiler 接管记忆化后，手写 `useMemo` / `useCallback` / `memo` 多为冗余甚至反模式
- 明确标注反模式有助于团队统一到 React 19 心智模型

### 为什么检查维度分为 10 个？

- 每个维度对应一个独立的关注点
- 便于按需启用/禁用特定维度
- 便于新增维度而不影响现有维度

### 为什么报告支持历史对比？

- 帮助团队追踪代码质量趋势
- 量化改进效果（Error 从 X 降到 Y）
- 形成持续改进的正反馈循环
