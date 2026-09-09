---
title: "Monorepo 架构设计 [P8]"
level: "architect"
tags: ["Monorepo", "pnpm", "Turborepo", "Nx"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
---

# Monorepo 架构设计 [P8]

> Monorepo 是将多个项目放在同一个仓库中管理的策略。Google、Meta、Microsoft 等大厂早已采用，2026 年已成为前端工程化的标配。理解 Monorepo 的架构设计和工具选型是架构师的必备能力。

## 核心概念（What）

### Monorepo vs Polyrepo

| 维度 | Monorepo | Polyrepo |
|------|----------|----------|
| 代码共享 | 直接引用，无需发布 | 需要发布到 npm |
| 原子变更 | 跨项目修改一次提交 | 需要协调多个仓库 |
| 统一工具链 | 一套配置 | 每套独立配置 |
| 构建速度 | 需要增量构建工具 | 各自独立 |
| 权限管理 | 需要 CODEOWNERS | 仓库级别隔离 |
| 仓库大小 | 可能很大 | 各自独立 |

---

## 底层原理（Why）

### 1. pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'

# 工作空间协议
# workspace:* 表示使用本地工作空间版本
# package.json
{
  "dependencies": {
    "@my-org/ui": "workspace:*",
    "@my-org/utils": "workspace:^1.0.0"
  }
}
```

### 2. Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "package.json"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### 3. Nx

```
Nx 的核心特性：
├── 项目图（Project Graph）：自动分析依赖关系
├── 受影响分析（Affected）：只构建/测试变更影响的项目
├── 远程缓存：团队共享构建缓存
├── 代码生成器：nx generate
└── 模块边界：enforce-module-boundaries
```

### 4. 推荐的 Monorepo 结构

```
monorepo/
├── apps/                    # 应用
│   ├── web/                 # Web 应用
│   ├── mobile/              # 移动应用
│   └── docs/                # 文档站
├── packages/                # 共享包
│   ├── ui/                  # UI 组件库
│   ├── utils/               # 工具函数
│   ├── config/              # 共享配置（ESLint、TS）
│   └── types/               # 共享类型定义
├── tools/                   # 构建工具/脚本
├── turbo.json               # Turborepo 配置
├── pnpm-workspace.yaml      # 工作空间配置
└── package.json
```

---

## 高频面试题

### Q1: Monorepo 的核心优势是什么？

**参考答案要点**：
- 代码共享无需发布：包之间直接引用
- 原子变更：跨包修改可以在一个 PR 中完成
- 统一工具链和代码规范
- 依赖版本一致性：避免版本冲突
- 适合中大型团队和多项目场景

### Q2: Turborepo 和 Nx 如何选择？

**参考答案要点**：
- Turborepo：配置简单、学习曲线低、适合已有项目
- Nx：功能全面、项目图分析、代码生成器、适合新项目
- Turborepo 构建无关（支持任何包管理器）
- Nx 有自己的生态和约定

### Q3: Monorepo 的构建性能如何优化？

**参考答案要点**：
- 增量构建：只构建变更的项目
- 远程缓存：团队共享构建产物
- 并行执行：无依赖关系的项目并行构建
- 受影响分析：只处理变更影响的项目

---

## 延伸思考

1. **设计题**：设计一个支持 100+ 包的 Monorepo 架构。
2. **场景题**：一个 Monorepo 的 CI 构建需要 30 分钟，如何优化？
3. **对比题**：pnpm workspace + Turborepo vs Nx vs Bazel，各自的 trade-off？

---

## 参考资料

- [Turborepo 文档](https://turbo.build/repo)
- [Nx 文档](https://nx.dev)
- [pnpm Workspace](https://pnpm.io/workspaces)
