---
title: 'Monorepo 架构设计 [P8]'
level: 'architect'
tags: ['Monorepo', 'pnpm', 'Turborepo', 'Nx']
difficulty: 'hard'
target: '架构师（P8）'
---

# Monorepo 架构设计 [P8]

> Monorepo 是将多个项目放在同一个仓库中管理的策略。Google、Meta、Microsoft 等大厂早已采用，2026 年已成为前端工程化的标配。理解 Monorepo 的架构设计和工具选型是架构师的必备能力。

## 核心概念（What）

### Monorepo vs Polyrepo

| 维度       | Monorepo           | Polyrepo         |
| ---------- | ------------------ | ---------------- |
| 代码共享   | 直接引用，无需发布 | 需要发布到 npm   |
| 原子变更   | 跨项目修改一次提交 | 需要协调多个仓库 |
| 统一工具链 | 一套配置           | 每套独立配置     |
| 构建速度   | 需要增量构建工具   | 各自独立         |
| 权限管理   | 需要 CODEOWNERS    | 仓库级别隔离     |
| 仓库大小   | 可能很大           | 各自独立         |

---

## 底层原理（Why）

### 1. pnpm Workspace 的符号链接解析算法

pnpm Workspace 的底层不是「yaml 配置」，而是**基于硬链接 + 符号链接的依赖解析算法**，解决幽灵依赖和版本冲突问题。

```
pnpm 依赖解析算法：

  存储层（Content-Addressable Store）：
    ├── 所有包按 content hash 存储在全局 store
    │   └── ~/.pnpm-store/v3/files/{hash-prefix}/{hash}
    ├── 相同内容的包只存储一份（去重）
    └── 不同项目引用同一包 → 硬链接到同一个 store 文件

  链接层（.pnpm 虚拟存储）：
    ├── node_modules/.pnpm/ 是 pnpm 的核心创新
    ├── 结构：node_modules/.pnpm/{pkg}@{version}/node_modules/{pkg}
    ├── 每个包有自己独立的 node_modules（包含其依赖的符号链接）
    └── 形成“扁平化”的依赖树（每个包的依赖都在同一层级）

  解析层（依赖提升）：
    ├── 项目的 node_modules/{pkg} → 符号链接到 .pnpm/{pkg}/node_modules/{pkg}
    ├── 只有 package.json 中声明的依赖才会被链接（严格模式）
    ├── 未声明的依赖无法访问（解决幽灵依赖）
    └── workspace:* 协议 → 直接链接到本地包（不经过 store）

  workspace:* vs workspace:^ 的区别：
    ├── workspace:* → 始终使用本地版本（发布时替换为实际版本）
    ├── workspace:^ → 使用本地版本，但允许语义化版本范围匹配
    └── workspace:~ → 使用本地版本，但只允许补丁版本更新
```

### 2. Turborepo 的增量构建与缓存哈希算法

Turborepo 的底层不是「并行构建」，而是**基于内容哈希的增量构建 + 有向无环图任务调度**。

```
Turborepo 缓存算法：

  任务哈希计算（Hash 决定是否需要重新执行）：
    hash = f(所有输入的变化)
    输入包括：
    ├── 源文件内容：src/** 的所有文件 hash（Merkle Tree）
    ├── 配置文件：package.json, tsconfig.json, turbo.json
    ├── 依赖包版本：所有依赖包的 hash
    ├── 环境变量：影响构建输出的 env 变量
    └── 任务命令：build / lint / test 的具体命令

  哈希匹配流程：
    1. 计算当前任务的哈希
    2. 检查本地缓存：.turbo/cache/{hash}.json
    │   ├── 命中 → 恢复缓存产物（dist/ 等），跳过执行
    │   └── 未命中 → 执行任务
    3. 执行完成后，将产物存入缓存
    4. 可选：检查远程缓存（Vercel Remote Cache）

  任务调度 DAG：
    ├── dependsOn: ["^build"] → 先构建依赖包，再构建当前包
    ├── 拓扑排序确定执行顺序：shared → ui → web
    ├── 无依赖关系的任务并行执行
    └── persistent 任务（如 dev）不受缓存影响

  受影响分析（Affected）：
    ├── 对比当前分支与基准分支的差异
    ├── 找出变更的文件 → 影响的包 → 依赖这些包的上层包
    └── 只构建受影响的包（节省 CI 时间）
```

### 3. 包间依赖的版本协调协议

Monorepo 中包间依赖的底层不是「workspace 引用」，而是**版本协调协议 + 构建顺序推导 + 发布版本管理**。

```
包间依赖协调协议：

  依赖图构建：
    ├── 扫描所有 package.json 的 dependencies
    ├── 识别 workspace: 协议 → 建立内部依赖边
    ├── 识别外部依赖 → 提升到根 node_modules（如果版本兼容）
    └── 生成依赖图（DAG）

  构建顺序推导（拓扑排序）：
    ├── 无依赖的包 → 第一层（最先构建）
    ├── 只依赖第一层的包 → 第二层
    ├── 以此类推...直到所有包分层
    └── 循环依赖检测 → 报错（DAG 不能有环）

  发布版本管理：
    ├── changesets 工具：记录每个包的版本变更
    ├── 版本推导规则：
    │   ├── 包 A 的 breaking change → 包 A 升 major
    │   ├── 包 B 依赖包 A → 包 B 也需要升 patch（依赖更新）
    │   └── 自动计算传递依赖的版本影响
    └── 发布顺序：按拓扑排序反向发布（先发布底层包，再发布上层包）
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
