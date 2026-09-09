---
title: "Monorepo 构建优化 [P8]"
level: "architect"
tags: ["Monorepo", "Turborepo", "Nx", "pnpm", "增量构建"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# Monorepo 构建优化 [P8]

> Monorepo 架构中，构建性能是核心挑战。Turborepo 和 Nx 通过缓存、任务编排、增量构建等手段，将大型 Monorepo 的构建时间从分钟级降到秒级。

## 核心概念（What）

### Monorepo 构建工具对比

| 特性 | Turborepo | Nx | pnpm workspace |
|------|-----------|-----|----------------|
| 缓存 | ✅（本地+远程） | ✅（本地+远程） | ❌ |
| 任务编排 | ✅（topology） | ✅（计算图） | ❌ |
| 增量构建 | ✅ | ✅ | ❌ |
| 受影响分析 | ❌ | ✅ | ❌ |
| 配置复杂度 | 低 | 中 | 低 |
| 学习曲线 | 低 | 高 | 低 |
| 2026 趋势 | 主流 | 主流 | 基础 |

---

## 底层原理（Why）

### 1. Turborepo 缓存机制

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": [
        "src/**",
        "tsconfig.json",
        "package.json"
      ]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```
Turborepo 缓存原理：

1. 计算任务哈希（基于输入文件 + 依赖 + 环境变量）
2. 检查本地缓存（.turbo/cache）
3. 命中 → 直接恢复产物（秒级）
4. 未命中 → 执行任务 → 存入缓存
5. 远程缓存（Vercel Remote Cache / 自建）

哈希计算：
├── 源文件内容（inputs）
├── 依赖包版本
├── 环境变量
├── 工具版本（TypeScript/Node.js）
└── 上游任务哈希

缓存命中率优化：
├── 精确配置 inputs（避免不必要的文件参与哈希）
├── 使用远程缓存（团队共享）
└── 避免在构建中使用随机值/时间戳
```

### 2. Nx 计算图

```
Nx 计算图（Computation Graph）：

1. 分析项目依赖关系（project.json / package.json）
2. 构建计算图（哪些项目受影响）
3. 只构建受影响的项目（affected）

示例：
apps/
├── web/        → 依赖 @shared/ui, @shared/utils
├── mobile/     → 依赖 @shared/ui, @shared/api
└── docs/       → 依赖 @shared/utils

packages/
├── ui/         → 无依赖
├── utils/      → 无依赖
└── api/        → 依赖 @shared/utils

修改 packages/utils/ → 受影响项目：
├── web（直接依赖）
├── mobile（间接依赖）
├── docs（直接依赖）
└── api（直接依赖）

nx affected --target=build
→ 只构建 web, mobile, docs, api（不构建 ui）
```

### 3. pnpm workspace 依赖管理

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'

# 依赖提升策略
# .npmrc
shamefully-hoist=true    # 提升所有依赖（兼容性最好）
# 或
public-hoist-pattern[]=*eslint*  # 选择性提升
```

```
pnpm workspace 依赖管理：

1. 共享依赖提升（hoist）
2. 严格依赖隔离（phantom dependencies 问题）
3. 工作区协议（workspace:*）

package.json 中使用 workspace 协议：
{
  "dependencies": {
    "@shared/ui": "workspace:*"  // 引用工作区内包
  }
}

优势：
├── 严格的依赖管理（避免幽灵依赖）
├── 高效的磁盘使用（硬链接）
├── 快速安装（比 npm/yarn 快）
└── 原生 workspace 支持
```

### 4. 远程缓存

```bash
# Turborepo 远程缓存
# turbo.json
{
  "remoteCache": {
    "signature": true  // 签名验证
  }
}

# 环境变量
TURBO_TOKEN=your-token
TURBO_TEAM=your-team

# 自建远程缓存
# 使用 turbo-remote-cache（开源）
# 或使用 Vercel Remote Cache（商业）

# Nx Cloud
# nx.json
{
  "nxCloudAccessToken": "your-token",
  "nxCloudUrl": "https://nx.app"
}
```

### 5. 增量构建策略

```
增量构建策略：

1. 文件哈希缓存
├── 记录每个文件的哈希
├── 只处理变更的文件
└── 跳过未变更的文件

2. 任务级缓存
├── 任务输入不变 → 直接恢复产物
├── 任务输入变更 → 重新执行
└── 上游任务变更 → 级联重建

3. 项目级增量（Nx）
├── 分析项目依赖图
├── 只构建受影响的项目
└── nx affected --target=build

4. 模块级增量（Vite/Rollup）
├── 只编译变更的模块
├── 缓存未变更模块的编译结果
└── HMR 感知（开发模式）
```

---

## 高频面试题

### Q1: Turborepo 的缓存机制是什么？

**参考答案要点**：
- 基于任务输入哈希（源文件 + 依赖 + 环境变量）
- 命中缓存 → 直接恢复产物（秒级）
- 未命中 → 执行任务 → 存入缓存
- 支持本地缓存和远程缓存（团队共享）

### Q2: Nx 的受影响分析（affected）是什么？

**参考答案要点**：
- 分析项目依赖图
- 检测哪些项目受代码变更影响
- 只构建/测试受影响的项目
- 大型 Monorepo 中显著减少构建时间

### Q3: Monorepo 中如何优化构建性能？

**参考答案要点**：
- 任务缓存（Turborepo/Nx）
- 远程缓存（团队共享）
- 增量构建（只构建变更部分）
- 并行任务执行
- 精确配置 inputs（避免不必要的缓存失效）

---

## 延伸思考

1. **设计题**：为一个 50+ 包的 Monorepo 设计构建优化方案。
2. **场景题**：Turborepo 缓存命中率低，如何排查和优化？
3. **对比题**：Turborepo vs Nx，大型 Monorepo 怎么选？

---

## 参考资料

- [Turborepo 文档](https://turbo.build/repo)
- [Nx 文档](https://nx.dev)
- [pnpm workspace](https://pnpm.io/workspaces)
