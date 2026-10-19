---
title: 'SSR/SSG/ISR 全栈方案对比 [P6-P7]'
level: 'senior'
tags: ['SSR', 'SSG', 'ISR', 'Next.js', 'Nuxt', 'Astro']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# SSR/SSG/ISR 全栈方案对比 [P6-P7]

> 2026 年，全栈框架从「Next.js 一家独大」走向「百花齐放」。Next.js、Nuxt、Astro、SvelteKit 各有特色，SSR/SSG/ISR 的选择直接影响性能和 SEO。

## 核心概念（What）

### 渲染模式对比

| 模式              | 渲染时机 | SEO | 首屏速度 | 数据实时性 | 适用场景   |
| ----------------- | -------- | --- | -------- | ---------- | ---------- |
| **CSR**           | 客户端   | 差  | 慢       | 高         | 后台管理   |
| **SSR**           | 每次请求 | 好  | 快       | 高         | 电商、社交 |
| **SSG**           | 构建时   | 好  | 最快     | 低         | 文档、博客 |
| **ISR**           | 按需再生 | 好  | 快       | 中         | 内容站点   |
| **Streaming SSR** | 流式     | 好  | 最快     | 高         | 大数据页面 |

### 框架对比

| 框架          | 生态   | 渲染模式 | 特色            | 适用场景 |
| ------------- | ------ | -------- | --------------- | -------- |
| **Next.js**   | React  | 全部     | App Router, RSC | 大型应用 |
| **Nuxt**      | Vue    | 全部     | 模块系统        | Vue 全栈 |
| **Astro**     | 多框架 | SSG 为主 | Islands 架构    | 内容站点 |
| **SvelteKit** | Svelte | 全部     | 编译时优化      | 轻量全栈 |

---

## 底层原理（Why）

### 1. SSR 渲染管线：组件树 → HTML 流 → 水合

SSR 的底层不是「服务端执行 React.renderToString」，而是**组件树遍历 → 数据预取 → HTML 序列化 → 客户端水合的四阶段管线**。

```
SSR 渲染管线：

  Phase 1: 路由解析 + 数据预取
    ├── 请求 URL → 匹配路由 → 确定组件树
    ├── 遍历组件树，执行所有 loader/getServerData
    │   ├── 并行执行无依赖的数据请求
    │   └── 串行执行有依赖的请求（按依赖顺序）
    └── 数据就绪 → 进入渲染阶段

  Phase 2: 组件树序列化（服务端）
    ├── 从根组件开始递归执行 render
    ├── 每个组件执行 → 生成 HTML 字符串
    │   ├── Server Component → 直接渲染为 HTML（不发送 JS）
    │   └── Client Component → 渲染 HTML + 记录水合指令
    ├── Suspense 边界处理：
    │   ├── 已就绪的组件 → 立即发送 HTML
    │   └── 未就绪的组件 → 发送 fallback HTML + 占位注释
    └── 输出：HTML 流（Chunked Transfer Encoding）

  Phase 3: 客户端水合（Hydration）
    ├── 浏览器接收 HTML → 立即显示（无需等待 JS）
    ├── JS Bundle 下载完成 → 开始水合
    ├── 水合过程：
    │   ├── 遍历 DOM 树 → 匹配 React/Vue 组件树
    │   ├── 为每个 DOM 节点绑定事件监听器
    │   └── 恢复组件状态（从服务端传递的初始状态）
    └── 水合完成 → 页面变为可交互（TTI）

  Phase 4: 选择性水合（Selective Hydration，React 18+）
    ├── 传统水合：一次性水合整个组件树（阻塞式）
    ├── 选择性水合：
    │   ├── 每个 Suspense 边界独立水合
    │   ├── 优先级调度：用户交互的组件优先水合
    │   └── 水合中断不影响已水合的部分
    └── 优势：TTI 提前（不需要等待所有组件水合完成）
```

### 2. Islands 架构：零 JS 默认 + 按需水合

Islands 的底层不是「多框架混用」，而是**编译时分析组件交互性 → 只发送必要的 JS → 独立水合每个交互岛**。

```
Islands 架构底层：

  编译时分析阶段（构建时）：
    ├── 扫描所有组件引用
    ├── 分析每个组件的 client: 指令：
    │   ├── 无指令 → 纯静态（只输出 HTML，不发送 JS）
    │   ├── client:load → 页面加载时立即水合
    │   ├── client:visible → 元素进入视口时水合（IntersectionObserver）
    │   ├── client:idle → 浏览器空闲时水合（requestIdleCallback）
    │   └── client:media → 媒体查询匹配时水合
    └── 为每个交互组件生成独立的 JS Bundle

  运行时水合阶段：
    ├── 每个 Island 独立水合（互不影响）
    ├── 不同框架的 Island 使用各自的运行时
    │   ├── React Island → 只加载 React 运行时（~40KB）
    │   ├── Vue Island → 只加载 Vue 运行时（~30KB）
    │   └── Svelte Island → 零运行时（编译为原生 JS）
    └── Island 之间通过原生 DOM 通信（不共享框架状态）

  性能优势：
    ├── 零 JS 默认：大部分页面只有 HTML + CSS
    ├── JS 体积大幅减少（只发送交互组件的代码）
    ├── TTI ≈ FCP（几乎不需要水合时间）
    └── 适合内容站点（90% 的页面不需要交互）
```

### 3. Streaming SSR 的分块传输协议

Streaming SSR 的底层不是「Suspense + 流式」，而是**HTTP Chunked Transfer + HTML 注释占位符 + 增量脚本注入的分块协议**。

```
Streaming SSR 分块协议：

  服务端流式输出：
    Chunk 1: HTML 头部 + 导航栏 + 骨架屏
      <header>...</header>
      <main>
        <!--$?-->  ← Suspense 占位符（标记位置）
        <template hidden>...</template>  ← fallback 内容

    Chunk 2: 数据就绪后注入真实内容
      <div hidden id="S:1">  ← 真实内容（hidden，不显示）
        <article>数据加载完成的内容</article>
      </div>
      <script>
        // 替换占位符为真实内容
        document.getElementById('S:1').previousSibling...
      </script>

    Chunk 3: 更多组件的流式注入
      ...

  客户端处理：
    ├── 浏览器接收到 Chunk 1 → 立即解析并显示（骨架屏）
    ├── 接收到 Chunk 2 → 执行内联脚本 → 替换占位符为真实内容
    ├── 每次替换都是局部 DOM 操作（不重新渲染整个页面）
    └── 用户看到渐进式渲染效果

  与传统 SSR 的性能对比：
    ├── 传统 SSR：等待所有数据就绪 → 一次性发送完整 HTML
    │   └── TTFB = max(所有数据请求的延迟)
    ├── Streaming SSR：立即发送骨架屏 → 数据就绪后流式注入
    │   └── TTFB = min(第一个数据请求的延迟)
    └── 性能提升：TTFB 从最慢请求变为最快请求
```

### 4. 选择决策

```
渲染模式选择：
├── 内容不常变？ → SSG（文档、博客）
├── 内容常变 + SEO 重要？ → ISR 或 SSR
├── 后台应用（无需 SEO）？ → CSR
├── 首屏性能极致？ → Streaming SSR
└── 内容站 + 少量交互？ → Astro（Islands）
```

---

## 高频面试题

### Q1: SSR 和 SSG 如何选择？

**参考答案要点**：

- SSG：内容不常变（文档、博客、文档站）
- SSR：内容频繁变化且需要 SEO（电商、社交）
- ISR：折中方案（内容偶尔变化）
- 考虑因素：构建时间、CDN 缓存、数据实时性

### Q2: Astro 的 Islands 架构有什么优势？

**参考答案要点**：

- 编译时分析组件交互性 → 零 JS 默认
- 交互组件按需水合（client:load/visible/idle）
- 多框架混用（React + Vue + Svelte 各自独立运行时）
- TTI ≈ FCP（几乎不需要水合时间）

### Q3: Streaming SSR 如何提升性能？

**参考答案要点**：

- HTTP Chunked Transfer + HTML 占位符 + 增量脚本注入
- TTFB 从最慢请求变为最快请求（骨架屏立即发送）
- Suspense 边界独立流式加载
- 渐进式渲染（用户先看到骨架，再看到内容）

---

## 延伸思考

1. **设计题**：为一个新闻网站选择渲染策略（首页、详情页、搜索页）。
2. **场景题**：Next.js SSG 构建时间太长（10000+ 页面），如何优化？
3. **对比题**：Next.js vs Nuxt vs Astro vs SvelteKit，2026 年怎么选？

---

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Astro 文档](https://docs.astro.build)
- [Nuxt 文档](https://nuxt.com)
- [SvelteKit 文档](https://kit.svelte.dev)
