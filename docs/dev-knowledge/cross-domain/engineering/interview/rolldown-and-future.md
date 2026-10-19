---
title: 'Rolldown 与构建工具未来 [P8]'
level: 'architect'
tags: ['Rolldown', 'Oxc', 'Vite 8', 'Rust', '构建工具']
difficulty: 'expert'
target: '架构师（P8）'
---

# Rolldown 与构建工具未来 [P8]

> Rolldown 是 Vite 团队用 Rust 开发的打包器，2026 年 3 月随 Vite 8 发布，**统一替代了 esbuild + Rollup 双引擎**，成为 Vite 唯一的构建内核。配合 Oxc 统一工具链，构建工具正式进入 Rust 时代。

## 核心概念（What）

### 构建工具演进时间线

```
2023：Rolldown 项目在 ViteConf 首次公开
2024：Rolldown 开源，持续 Beta 迭代
2025：rolldown-vite 技术预览包发布，供社区早期试用
2025-12：Vite 8 Beta 发布，Rolldown 完整集成
2026-03-12：Vite 8.0 正式发布，Rolldown 成为默认且唯一的打包引擎
2026-05-07：Rolldown 1.0 正式发布（比 Rollup 快 10-30 倍）
2026-06-23：Vite 8.1 发布，引入实验性 Bundled Dev Mode
```

---

## 底层原理（Why）

### 1. Rolldown 架构

```
Rolldown 架构：

┌─────────────────────────────────────┐
│           Rolldown Core             │
│  Rust 实现，兼容 Rollup API         │
├─────────────────────────────────────┤
│           解析器                     │
│  Oxc（Rust）解析 JS/TS/JSX          │
├─────────────────────────────────────┤
│           转换                       │
│  Oxc 转译（替代 esbuild/Babel）     │
├─────────────────────────────────────┤
│           优化                       │
│  Tree Shaking + Scope Hoisting      │
├─────────────────────────────────────┤
│           输出                       │
│  ESM / CJS / IIFE                  │
└─────────────────────────────────────┘

为什么用 Rust？
├── 比 JS 快 10-100x
├── 内存安全（无 GC 暂停）
├── 并发友好（多线程）
└── 生态成熟（SWC/Turbopack/Rspack 验证）
```

### 2. Vite 8 + Rolldown

```typescript
// Vite 8 配置（Rolldown 统一引擎）
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Vite 8：rolldownOptions 替代 rollupOptions
    rolldownOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
    // 压缩默认使用 Oxc minifier
    minify: 'oxc',
  },
})

// 性能对比（Vite 7 Rollup vs Vite 8 Rolldown）：
// 生产构建速度：提升 10-30x（Linear: 46s → 6s）
// 内存使用：减少 30-60%
// Tree Shaking：更彻底（统一模块图）
```

### 3. Oxc 统一工具链

```
Oxc（氧化编译器）：

一个 Rust 工具链，替代多个 JS 工具：

┌─────────────────────────────────────┐
│              Oxc                    │
├─────────────────────────────────────┤
│  Parser：解析 JS/TS/JSX（替代 Babel）│
│  Linter：代码检查（替代 ESLint）    │
│  Transformer：转译（替代 Babel）    │
│  Minifier：压缩（替代 Terser）      │
│  Formatter：格式化（替代 Prettier） │
│  Resolver：模块解析（替代 resolve） │
└─────────────────────────────────────┘

性能优势：
├── 比 Babel + ESLint + Terser 快 10-50x
├── 统一工具链（减少配置复杂度）
├── 增量处理（只处理变更文件）
└── 内存高效（Rust 无 GC）
```

### 4. esbuild 已退出核心链路

```
Vite 8 中 esbuild 的位置变化：

旧架构（Vite 2-7）：
├── 开发态：esbuild 预构建 + 转译
├── 生产态：Rollup 打包
└── esbuild 是核心依赖

Vite 8 新架构：
├── 开发态：Rolldown 预构建 + Oxc 转译
├── 生产态：Rolldown 打包 + Oxc 压缩
└── esbuild 从 dependencies 退到 peerDependencies（可选）

esbuild 仍保留的场景：
├── 旧插件兼容层（部分插件依赖 esbuild 行为）
├── 独立使用（不需要 Rolldown 功能）
└── 简单转译任务（不需要完整打包）

2026 现状：
├── Vite dev：Rolldown（预构建）+ Oxc（转译）
├── Vite prod：Rolldown（打包）+ Oxc（压缩）
└── esbuild 已退出 Vite 核心链路
```

### 5. 2026-2027 演进方向

```
构建工具未来方向：

1. Rust 化
├── 所有核心工具用 Rust 重写
├── 性能提升 10-100x
└── 内存安全、并发友好

2. 统一工具链
├── Oxc 替代 Babel + ESLint + Terser
├── 减少配置复杂度
└── 更好的开发体验

3. AI 辅助构建
├── 自动优化配置
├── 智能代码分割
└── 自动性能调优

4. Edge-first
├── 构建产物适配 Edge Runtime
├── 更小的 bundle 体积
└── 更快的冷启动

5. 增量编译
├── 持久化编译缓存
├── 只编译变更部分
└── 秒级构建（即使大型项目）
```

---

## 高频面试题

### Q1: Rolldown 是什么？为什么需要它？

**参考答案要点**：

- Vite 团队用 Rust 开发的统一打包器
- 替代 esbuild + Rollup 双引擎，成为 Vite 8 唯一构建内核
- 兼容 Rollup API（迁移成本低）
- 性能提升 10-30x（Rust 实现，Linear: 46s→6s）
- 配合 Oxc 统一工具链

### Q2: Oxc 工具链包含什么？

**参考答案要点**：

- Parser：解析 JS/TS/JSX（替代 Babel parser）
- Linter：代码检查（替代 ESLint）
- Transformer：转译（替代 Babel）
- Minifier：压缩（替代 Terser）
- 全部 Rust 实现，比 JS 工具快 10-50x

### Q3: 构建工具的未来方向？

**参考答案要点**：

- Rust 化（性能提升 10-100x）
- 统一工具链（Oxc 替代多个 JS 工具）
- 增量编译（持久化缓存）
- Edge-first（适配 Edge Runtime）
- AI 辅助构建优化

---

## 延伸思考

1. **设计题**：为一个大型前端团队设计构建工具迁移方案（Webpack → Vite 8 + Rolldown）。
2. **场景题**：Rolldown 替代 esbuild + Rollup 后，现有插件如何适配？
3. **对比题**：Oxc vs SWC vs esbuild，Rust 转译工具怎么选？

---

## 参考资料

- [Rolldown 官网](https://rolldown.rs)
- [Oxc 项目](https://oxc.rs)
- [Vite 8 发布说明](https://vitejs.dev/blog/announcing-vite8)
- [Vite 8 迁移指南](https://vitejs.dev/guide/migration)
