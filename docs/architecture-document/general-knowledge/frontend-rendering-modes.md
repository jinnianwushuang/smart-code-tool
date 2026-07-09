# 前端渲染模式全解

## 概述

前端渲染模式决定了页面内容在何处、何时生成，直接影响应用的性能、SEO、用户体验和部署复杂度。本文系统梳理主流渲染模式，帮助你在不同业务场景下做出合理选型。

---

## CSR — 客户端渲染 (Client-Side Rendering)

### 工作原理

1. 服务器返回一个空白的 HTML 骨架 + JS bundle
2. 浏览器下载并执行 JS
3. JS 通过 API 获取数据，动态生成 DOM 并挂载

### 典型框架

- React (CRA)
- Vue (Vue CLI / Vite 默认模式)
- Angular
- Svelte (默认模式)

### 优缺点

| 维度    | 说明                                 |
| ------- | ------------------------------------ |
| ✅ 优点 | 交互体验流畅，首次加载后路由切换快   |
| ✅ 优点 | 服务器压力小，只需提供静态文件和 API |
| ❌ 缺点 | 首屏白屏时间长，SEO 不友好           |
| ❌ 缺点 | JS 体积大，低端设备性能差            |

### 适用场景

- 后台管理系统、内部工具
- 不需要 SEO 的 SPA 应用
- 重交互型应用（如在线编辑器）

---

## SSR — 服务端渲染 (Server-Side Rendering)

### 工作原理

1. 用户请求页面时，服务器执行框架代码，渲染出完整 HTML
2. 将 HTML + JS bundle 一起返回给浏览器
3. 浏览器展示 HTML（用户可立即看到内容）
4. JS 执行 **Hydration（注水）**，绑定事件，使页面变为可交互

### 典型框架

- Next.js (React)
- Nuxt.js (Vue)
- SvelteKit
- Remix

### 核心概念：Hydration

```
服务器输出 HTML → 浏览器渲染（可看不可交互）
                    ↓
下载 JS → 执行 Hydration → 绑定事件（可交互）
```

Hydration 的代价：需要重新执行一遍组件逻辑，对 CPU 和内存有消耗。

### 优缺点

| 维度    | 说明                                       |
| ------- | ------------------------------------------ |
| ✅ 优点 | 首屏快，FCP/LCP 优秀                       |
| ✅ 优点 | SEO 友好，爬虫可抓取完整 HTML              |
| ❌ 缺点 | 服务器计算压力大，TTFB 较高                |
| ❌ 缺点 | Hydration 期间页面不可交互（"恐怖谷"现象） |
| ❌ 缺点 | 架构复杂度高，需维护 Node.js 服务          |

### 适用场景

- 电商、内容网站、需要 SEO 的应用
- 首屏性能要求高的场景

---

## SSG — 静态站点生成 (Static Site Generation)

### 工作原理

1. **构建时**预先渲染所有页面为静态 HTML 文件
2. 部署到 CDN，用户请求直接返回静态文件
3. 浏览器加载 HTML + JS，Hydration 后变为可交互

### 典型框架

- Next.js (`getStaticProps`)
- Nuxt.js (`nuxt generate`)
- Gatsby
- Astro
- VitePress / Docusaurus

### 优缺点

| 维度    | 说明                             |
| ------- | -------------------------------- |
| ✅ 优点 | 速度极快，CDN 边缘缓存直接返回   |
| ✅ 优点 | 无服务器计算，成本最低           |
| ✅ 优点 | SEO 友好                         |
| ❌ 缺点 | 构建时间长（页面多时）           |
| ❌ 缺点 | 内容更新需重新构建               |
| ❌ 缺点 | 不适合动态内容（如用户个人页面） |

### 适用场景

- 文档站、博客、营销页
- 内容不频繁变化的展示型网站

---

## ISR — 增量静态再生 (Incremental Static Regeneration)

### 工作原理

1. 构建时生成部分静态页面
2. 用户请求已生成的页面 → 直接返回缓存的静态页
3. 用户请求未生成的页面 → 服务器渲染并缓存
4. 超过 `revalidate` 时间后，后台异步重新生成，下次请求拿到新内容

```
请求 /product/123
    ↓
缓存命中？→ 返回旧页面（后台异步重新生成）
    ↓ 未命中
服务器渲染 → 缓存 → 返回
```

### 典型框架

- Next.js (`getStaticProps` + `revalidate`)
- Nuxt.js (Nitro 的 route rules)

### 优缺点

| 维度    | 说明                                               |
| ------- | -------------------------------------------------- |
| ✅ 优点 | 兼顾静态性能和内容新鲜度                           |
| ✅ 优点 | 构建速度快（只生成部分页面）                       |
| ✅ 优点 | 无需重新部署即可更新内容                           |
| ❌ 缺点 | 用户可能短暂看到过期内容（stale-while-revalidate） |
| ❌ 缺点 | 需要支持 ISR 的托管平台（如 Vercel）               |

### 适用场景

- 电商商品页（海量 SKU，无法全量 SSG）
- 内容频繁更新但仍需 SEO 的场景

---

## ISR vs SSG vs SSR 对比

| 特性       | SSG          | SSR          | ISR                   |
| ---------- | ------------ | ------------ | --------------------- |
| 渲染时机   | 构建时       | 请求时       | 构建时 + 按需再生     |
| 首屏速度   | ⭐⭐⭐ 最快  | ⭐⭐ 中等    | ⭐⭐⭐ 快             |
| 内容新鲜度 | 低（构建时） | 高（实时）   | 中高（按 revalidate） |
| 服务器成本 | 最低         | 高           | 中等                  |
| 构建时间   | 页面多时很慢 | 无（运行时） | 快（按需）            |
| SEO        | ✅ 友好      | ✅ 友好      | ✅ 友好               |
| 适用规模   | 小型站点     | 任意         | 大型站点              |

---

## Streaming SSR — 流式服务端渲染

### 工作原理

1. 服务器将 HTML 分块（chunk）逐步发送给浏览器
2. 浏览器收到一部分就开始渲染，无需等待完整 HTML
3. 配合 React 18 的 `Suspense`，可以优先渲染关键内容，慢内容后续流式补充

```
服务器：[<header>...</header>] → [<main>...</main>] → [<footer>...</footer>]
浏览器：收到 header 立即渲染 → 等待 main → 渲染 main → 渲染 footer
```

### 典型框架

- Next.js 13+ (App Router，React Server Components)
- Remix
- Nuxt 3 (Nitro streaming)

### 优缺点

| 维度    | 说明                          |
| ------- | ----------------------------- |
| ✅ 优点 | TTFB 极低，用户更快看到内容   |
| ✅ 优点 | 慢数据源不阻塞整个页面        |
| ❌ 缺点 | 实现复杂，需要框架支持        |
| ❌ 缺点 | 某些 CDN / 代理不支持流式响应 |

---

## React Server Components (RSC)

### 核心思想

将组件分为两类：

- **Server Components**：仅在服务器执行，不发送 JS 到客户端，直接输出 HTML
- **Client Components**：与 CSR 类似，在浏览器执行并支持交互

```jsx
// Server Component（服务器执行，无 JS 发送到客户端）
async function ProductList() {
  const products = await db.query('SELECT * FROM products')
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}

// Client Component（浏览器执行，支持交互）
;('use client')
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

### 优势

- 减少 JS bundle 体积
- 直接访问后端资源（数据库、文件系统）
- 自动代码分割

---

## Partial Hydration — 部分注水

### 核心思想

只对需要交互的组件进行 Hydration，静态部分保持纯 HTML，不加载 JS。

### 典型框架

- **Astro**（Islands Architecture）
- Qwik（Resumability）

```astro
---
// Astro 页面，默认不发送 JS
import Counter from '../components/Counter.jsx'
---
<html>
  <body>
    <h1>这是静态内容，不需要 JS</h1>
    <Counter client:load />  {/* 只有这个组件会 Hydration */}
  </body>
</html>
```

---

## 选型决策树

```
需要 SEO？
├── 否 → CSR（SPA）
└── 是
    ├── 内容基本不变 → SSG
    ├── 内容频繁更新，页面量大 → ISR
    ├── 需要实时数据 → SSR / Streaming SSR
    └── 重交互 + 内容混合 → RSC + Streaming
```

---

## 总结

| 模式          | 核心特征              | 代表框架           |
| ------------- | --------------------- | ------------------ |
| CSR           | 浏览器渲染，JS 驱动   | React/Vue SPA      |
| SSR           | 服务器渲染，Hydration | Next.js/Nuxt.js    |
| SSG           | 构建时预渲染          | VitePress/Gatsby   |
| ISR           | 静态再生，按需更新    | Next.js            |
| Streaming SSR | 流式分块，渐进渲染    | Next.js 13+        |
| RSC           | 服务器组件，零 JS     | Next.js App Router |
| Partial Hyd.  | 仅交互部分注水        | Astro/Qwik         |

没有"最好"的渲染模式，只有最适合当前业务场景的选择。理解每种模式的取舍，才能做出理性的技术决策。
