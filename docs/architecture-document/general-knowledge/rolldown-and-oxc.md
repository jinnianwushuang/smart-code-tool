# Rolldown 与 Oxc — Rust 重塑前端工具链的双引擎

> Vite 8 的底层架构从 esbuild + Rollup 双引擎切换为 Rolldown + Oxc 统一引擎。
> 这不是简单的"换个打包器"，而是整个 JavaScript 工具链从 JS/Go 向 Rust 迁移的标志性事件。
> 本文深度拆解 Rolldown（打包器）和 Oxc（编译器）的定位、架构、性能与生态影响。

---

## 一、Rolldown — 统一打包器

### 1.1 一句话定义

Rolldown 是一个用 **Rust** 编写的高性能 JavaScript/TypeScript 打包器，兼容 Rollup 插件 API，统一替代 esbuild + Rollup 双引擎，是 Vite 8 的底层打包核心。

### 1.2 为什么需要 Rolldown

Vite 7 及之前的双引擎架构存在根本矛盾：

```
┌─────────────────────────────────────────────────────┐
│  Vite 7 双引擎架构                                   │
│                                                     │
│  开发模式：esbuild（Go）→ 依赖预构建 + 代码转换     │
│  生产模式：Rollup（JS）→ 打包 + Tree Shaking        │
│                                                     │
│  问题：                                              │
│  ① dev/build 行为不一致 → "dev 能跑，build 就炸"   │
│  ② esbuild 产物控制弱 → 无法自定义分包策略          │
│  ③ Rollup 是 JS 写的 → 大项目构建慢                 │
│  ④ 两套引擎 → 维护复杂度高                          │
└─────────────────────────────────────────────────────┘
```

Rolldown 的设计目标就是**用一个引擎解决所有问题**：

| 维度       | Rollup (JS)          | esbuild (Go)         | Rolldown (Rust)         |
| ---------- | -------------------- | -------------------- | ----------------------- |
| 打包速度   | 基准线               | ≈10x Rollup          | ≈10-30x Rollup          |
| 插件 API   | Rollup 插件生态      | 自有、封闭           | 兼容 Rollup / Vite 插件 |
| 产物控制   | 强（renderChunk 等） | 弱（不暴露产物钩子） | 强                      |
| 分包策略   | manualChunks         | 不支持自定义         | advancedChunks（更细）  |
| 编译器基座 | Acorn                | 自研                 | Oxc（语义分析可复用）   |

### 1.3 核心架构

```
┌─────────────────────────────────────────────┐
│  Vite 8 统一架构                             │
│  - dev server, HMR, 插件容器, 环境 API       │
├─────────────────────────────────────────────┤
│  Rolldown      打包器 (Rust)                 │
│  - 模块图, 分包, tree-shaking, 产物生成      │
├─────────────────────────────────────────────┤
│  Oxc           编译器 (Rust)                 │
│  - parser, resolver, transformer,            │
│    minifier, 语义分析                        │
├─────────────────────────────────────────────┤
│  Lightning CSS CSS 处理 (Rust)               │
│  - CSS 压缩 (默认), 语法降级                 │
└─────────────────────────────────────────────┘
```

### 1.4 三大设计原则

**① 性能**：Rust 编写，原生速度运行。在基准测试中比 Rollup 快 10-30 倍，与 esbuild 处于同一性能量级。

**② 兼容性**：支持与 Rollup 和 Vite 相同的插件 API。大多数现有 Vite 插件在 Vite 8 中开箱即用，生态无需重写。

**③ 更多特性**：提供了 Rollup 和 esbuild 都没有的功能：

- 高级分块控制（advancedChunks）
- 内置模块热替换（HMR）
- 模块联邦（Module Federation）
- 模块级持久缓存

### 1.5 时间线

| 时间       | 事件                                                     |
| ---------- | -------------------------------------------------------- |
| 2024-03    | Rolldown 开源，定位为"Vite 未来使用的打包器"             |
| 2025-12    | Vite 8 Beta 发布（rolldown-vite 试验包转正前奏）         |
| 2026-01    | Rolldown 1.0 RC 发布                                     |
| 2026-03-12 | **Vite 8.0 正式发布**：Rolldown 成为默认且唯一的打包引擎 |
| 2026-05-07 | **Rolldown 1.0 正式发布**                                |
| 2026-06-23 | Vite 8.1 发布：引入 Bundled Dev Mode                     |
| 2026-06    | VoidZero（Rolldown 母公司）被 Cloudflare 收购            |

### 1.6 社区实测性能

| 项目                    | 构建时间变化      |
| ----------------------- | ----------------- |
| Linear                  | 生产构建 46s → 6s |
| PayFit（复杂 Monorepo） | 120s → 8s         |
| Beehiiv                 | 构建时间 -64%     |
| Ramp                    | 构建时间 -57%     |
| Mercedes-Benz.io        | 构建时间 -38%     |

### 1.7 配置迁移

```js
// Vite 7 → Vite 8 配置变化
export default {
  build: {
    // ❌ 旧写法
    // rollupOptions: { ... }
    // minify: 'esbuild'

    // ✅ 新写法
    rolldownOptions: {
      advancedChunks: {
        groups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            minSize: 10000,
          },
        },
      },
    },
    minify: 'oxc', // 使用 Oxc 压缩替代 esbuild
  },
}
```

---

## 二、Oxc — 编译器工具链

### 2.1 一句话定义

Oxc（The **Ox**idation **C**ompiler）是一套用 Rust 编写的 JavaScript 工具链集合，包含 Parser、Linter、Formatter、Transformer、Resolver、Minifier 六大模块，所有工具**共享同一个 AST**，从根本上消除重复解析开销。

### 2.2 不是"一个工具"，而是"一整套工具链"

```
┌─────────────┐
│  oxc-parser │  ← 唯一的解析器
│  (AST Core) │
└──────┬──────┘
       │
       │  共享 AST
       │
  ┌────┼────┬────┬────┬────┐
  │    │    │    │    │    │
  ▼    ▼    ▼    ▼    ▼    ▼
Oxlint Oxfmt oxc-  oxc-  oxc-  oxc-
(Lint) (Fmt) trans  resol  minif  node
             form   ver
```

| 模块              | 替代对象             | 性能提升                |
| ----------------- | -------------------- | ----------------------- |
| **oxc-parser**    | Acorn / Babel Parser | 比 SWC 快 3 倍          |
| **oxc-transform** | Babel                | 快 40 倍，内存少 70%    |
| **oxc-resolver**  | enhanced-resolve     | 快 30 倍                |
| **Oxlint**        | ESLint               | 快 50-100 倍，800+ 规则 |
| **Oxfmt**         | Prettier             | 快 35 倍                |
| **oxc-minify**    | Terser               | 内置死代码消除          |

### 2.3 核心哲学：AST 共享

传统工具链的痛点：

```
ESLint 解析一次 → Babel 解析一次 → Terser 再解析一次
= 同一份代码被解析 3 次，每次构建不同的 AST
```

Oxc 的方案：

```
oxc-parser 解析一次 → 产出统一 AST
  ├── Oxlint 直接消费（检查）
  ├── oxc-transform 直接消费（转译）
  ├── oxc-minify 直接消费（压缩）
  └── Rolldown 直接消费（打包）
= 零重复解析，所有工具对代码的理解完全一致
```

### 2.4 在 Vite 8 中的角色

Oxc 是 Rolldown 的"编译器基座"，提供底层能力：

```
Vite 8 调用链：

  Vite（编排层）
    │
    ▼
  Rolldown（打包层）
    │
    ├── oxc_parser    → 解析源码为 AST
    ├── oxc_resolver  → 模块路径解析（node_modules、tsconfig paths）
    ├── oxc_transformer → TS/JSX 降级转译
    ├── oxc_minifier  → 生产压缩 + 死代码消除
    └── 语义分析       → 增强 Tree Shaking 精度
```

### 2.5 Oxlint — 最成熟的组件

Oxlint 是 Oxc 工具链中最早可用、社区关注度最高的组件：

- **ESLint 兼容**：支持 ESLint 配置格式和规则命名
- **800+ 规则**：覆盖 ESLint 核心规则和常用插件规则
- **类型感知 Lint**：通过 tsgo 提供真正的类型感知检查
- **JS 插件支持**：可以使用现有的 ESLint JS 插件
- **速度**：大型项目 lint 时间从 30s+ 降至毫秒级

```bash
# 安装
pnpm add -D oxlint

# 运行（替代 eslint）
oxlint ./src

# 自动修复
oxlint ./src --fix
```

### 2.6 Oxfmt — Prettier 的替代者

Oxfmt 是 Oxc 的格式化组件，兼容 Prettier 配置：

```bash
# 安装
pnpm add -D oxfmt

# 运行（替代 prettier）
oxfmt --write ./src
```

---

## 三、Rolldown + Oxc 的协同效应

### 3.1 统一工具链的端到端优势

```
┌──────────────────────────────────────────────────────┐
│  VoidZero 统一工具链愿景                              │
│                                                      │
│  构建工具：Vite（编排层）                              │
│  打包器：  Rolldown（Rust）                           │
│  编译器：  Oxc（Rust）                                │
│  CSS：    Lightning CSS（Rust）                       │
│  Lint：   Oxlint（Rust）                             │
│  格式化：  Oxfmt（Rust）                              │
│                                                      │
│  全部 Rust，全部共享 AST，端到端一致                  │
└──────────────────────────────────────────────────────┘
```

### 3.2 为什么"统一"比"快"更重要

| 维度             | 双引擎（Vite 7）               | 统一引擎（Vite 8）     |
| ---------------- | ------------------------------ | ---------------------- |
| dev/build 一致性 | ❌ esbuild vs Rollup 行为不同  | ✅ 同一引擎，行为一致  |
| 调试复杂度       | 两套逻辑，问题难定位           | 一套逻辑，问题可追溯   |
| 插件兼容         | 需要同时兼容 esbuild 和 Rollup | 只需兼容 Rolldown      |
| 维护成本         | 维护两套引擎代码               | 维护一套引擎代码       |
| 语言规范跟进     | 两个引擎分别跟进               | Oxc 统一跟进，一次到位 |

### 3.3 2026 前端工具链 Rust 化全景

| 环节       | 传统工具          | Rust 替代                     | 状态      |
| ---------- | ----------------- | ----------------------------- | --------- |
| 代码解析   | Acorn / Babel     | Oxc Parser / SWC              | ✅ 成熟   |
| 代码转译   | Babel             | Oxc Transform / SWC           | ✅ 成熟   |
| 代码打包   | Rollup / Webpack  | Rolldown / Rspack / Turbopack | ✅ 成熟   |
| 代码检查   | ESLint            | Oxlint / Biome                | ✅ 成熟   |
| 代码格式化 | Prettier          | Oxfmt / Biome                 | ✅ 可用   |
| 代码压缩   | Terser            | Oxc Minify / SWC              | ✅ 成熟   |
| CSS 处理   | PostCSS / cssnano | Lightning CSS                 | ✅ 成熟   |
| 包管理     | npm / pnpm        | pnpm 12（Rust 核心）          | ✅ 进行中 |

---

## 四、深度思考

1. **插件迁移成本**：虽然 Rolldown 兼容 Rollup API，但底层从 JS 换成了 Rust。哪些 Rollup 插件在 Rolldown 上可能出问题？
2. **Cloudflare 收购的影响**：VoidZero 被 Cloudflare 收购后，Rolldown/Oxc 的发展方向会如何变化？是否会偏向边缘计算场景？
3. **ESLint 的未来**：Oxlint 已经覆盖 800+ 规则，但 ESLint 的插件生态（如 eslint-plugin-react-hooks）如何迁移？
4. **Rust 化的边界**：前端工具链全面 Rust 化后，JS 开发者在工具链层面的参与度是否会降低？

---

## 参考

- [Rolldown 官方文档](https://rolldown.rs)
- [Vite 8 — Rolldown 集成指南](https://cn.vitejs.dev/guide/rolldown)
- [Oxc 官方文档](https://oxc.rs)
- [Vite 8 深度拆解：Rolldown + Oxc 统一架构](https://www.chenxutan.com/d/5840.html)
- [OXC 深度拆解：AST 共享架构](https://www.chenxutan.com/d/5739.html)
- [Rolldown 1.0 深度拆解](https://www.chenxutan.com/d/5816.html)
