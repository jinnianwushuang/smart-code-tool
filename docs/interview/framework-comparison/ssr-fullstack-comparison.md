---
title: "SSR/SSG/ISR 全栈方案对比 [P6-P7]"
level: "senior"
tags: ["SSR", "SSG", "ISR", "Next.js", "Nuxt", "Astro"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# SSR/SSG/ISR 全栈方案对比 [P6-P7]

> 2026 年，全栈框架从「Next.js 一家独大」走向「百花齐放」。Next.js、Nuxt、Astro、SvelteKit 各有特色，SSR/SSG/ISR 的选择直接影响性能和 SEO。

## 核心概念（What）

### 渲染模式对比

| 模式 | 渲染时机 | SEO | 首屏速度 | 数据实时性 | 适用场景 |
|------|---------|-----|---------|-----------|----------|
| **CSR** | 客户端 | 差 | 慢 | 高 | 后台管理 |
| **SSR** | 每次请求 | 好 | 快 | 高 | 电商、社交 |
| **SSG** | 构建时 | 好 | 最快 | 低 | 文档、博客 |
| **ISR** | 按需再生 | 好 | 快 | 中 | 内容站点 |
| **Streaming SSR** | 流式 | 好 | 最快 | 高 | 大数据页面 |

### 框架对比

| 框架 | 生态 | 渲染模式 | 特色 | 适用场景 |
|------|------|---------|------|----------|
| **Next.js** | React | 全部 | App Router, RSC | 大型应用 |
| **Nuxt** | Vue | 全部 | 模块系统 | Vue 全栈 |
| **Astro** | 多框架 | SSG 为主 | Islands 架构 | 内容站点 |
| **SvelteKit** | Svelte | 全部 | 编译时优化 | 轻量全栈 |

---

## 底层原理（Why）

### 1. Next.js App Router

```typescript
// Server Component（默认）
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 3600 }, // ISR：1 小时再生
  }).then(r => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={params.id} /> {/* Client Component */}
    </div>
  );
}

// 静态生成（构建时）
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products').then(r => r.json());
  return products.map(p => ({ id: p.id }));
}
```

### 2. Astro Islands 架构

```astro
---
// Astro：默认零 JS 发送
import ReactCounter from '../components/Counter.tsx';
import VueChart from '../components/Chart.vue';
---

<html>
<body>
  <h1>零 JS 默认</h1>
  <!-- 只有标记为交互的组件才发送 JS -->
  <ReactCounter client:load />
  <VueChart client:visible />
</body>
</html>

<!-- Astro 优势：
- 默认零 JS（只有 HTML + CSS）
- 多框架混用（React + Vue + Svelte）
- 内容站点性能最优
-->
```

### 3. Streaming SSR

```typescript
// Next.js Streaming SSR
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Header />  {/* 立即发送 */}
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent />  {/* 数据就绪后流式发送 */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AnotherSlowComponent />  {/* 独立流式加载 */}
      </Suspense>
    </div>
  );
}

// 优势：
// 1. 首屏 HTML 立即发送（不等所有数据）
// 2. 各 Suspense 边界独立加载
// 3. 用户看到渐进式渲染
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
- 默认零 JS 发送（只有 HTML + CSS）
- 交互组件按需加载 JS（client:load/visible）
- 多框架混用（React + Vue + Svelte 同一页面）
- 内容站点性能最优（Lighthouse 接近满分）

### Q3: Streaming SSR 如何提升性能？

**参考答案要点**：
- HTML 分块发送（不等所有数据就绪）
- Suspense 边界独立加载
- 首屏时间大幅缩短（FCP/LCP 提前）
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
