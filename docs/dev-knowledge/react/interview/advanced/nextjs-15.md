---
title: 'Next.js 15 全栈框架原理 [P8]'
level: 'architect'
tags: ['Next.js 15', 'App Router', 'Server Actions', '缓存', 'Turbopack']
difficulty: 'expert'
target: '架构师（P8）'
---

# Next.js 15 全栈框架原理 [P8]

> Next.js 15 是 React 全栈框架的事实标准。App Router、Server Actions、多层缓存体系、Turbopack 集成，使其成为 2026 年全栈开发的核心选择。

## 核心概念（What）

### Next.js 15 架构全景

```
请求流转路径（从外到内）：

┌─────────────────────────────────────────────────────┐
│  ① 边缘层  Middleware（Edge Runtime）                │
│  认证 · 重定向 · i18n · A/B 测试 · 请求改写         │
├─────────────────────────────────────────────────────┤
│  ② 路由层  App Router（文件系统路由）                │
│  layout · page · loading · error · not-found        │
│  路由分组 () · 动态 [slug] · 拦截 @modal            │
├─────────────────────────────────────────────────────┤
│  ③ 数据层  四层缓存 + Server Actions                 │
│  Request Memo → Data Cache → Full Route → Router    │
│  'use server' ←→ revalidatePath / revalidateTag     │
├─────────────────────────────────────────────────────┤
│  ④ 渲染层  RSC + Client Components + Streaming      │
│  Server Component（默认）→ RSC Payload → Hydration  │
│  Suspense 边界 · use() · 渐进式加载                  │
├─────────────────────────────────────────────────────┤
│  ⑤ 核心层  React 19                                  │
│  Fiber 协调器 · Concurrent Mode · Compiler 优化      │
├─────────────────────────────────────────────────────┤
│  ⑥ 构建层  Turbopack（dev + prod）                   │
│  Rust 内核 · 增量编译 · HMR                          │
└─────────────────────────────────────────────────────┘

运行时部署目标：Node.js（标准）│ Edge Runtime（低延迟）│ 浏览器（CSR）
```

---

## 底层原理（Why）

### 1. App Router 路由解析引擎

App Router 不是简单的“文件映射 URL”，而是一套**构建时路由编译器**。

```
路由解析链路：

构建阶段（Turbopack/Webpack）：
  1. 扫描 app/ 目录，收集所有 page.tsx / route.ts
  2. 将文件系统路径转换为路由模式：
     ├── [slug]      → 动态段（Named Capture）
     ├── [...slug]   → 捕获所有（Greedy Match）
     ├── [[...slug]] → 可选捕获（Optional Greedy）
     └── (group)     → 布局分组（不影响 URL）
  3. 生成路由清单（Route Manifest）
  4. 为每个路由创建 Chunk（代码分割单元）

运行时请求：
  URL: /blog/hello-world
  │
  ├── 路由匹配器（基于正则优先级）
  │   ├── 静态路由优先于动态路由
  │   ├── 动态路由优先于捕获所有
  │   └── 最长匹配优先
  │
  ├── 匹配到 app/blog/[slug]/page.tsx
  ├── 加载对应 Chunk（懒加载）
  ├── 解析 params = { slug: 'hello-world' }
  └── 执行组件渲染

Layout 嵌套机制：
  每个 layout.tsx 包裹其下所有 page 和子 layout
  └── 形成 React 组件嵌套树
      └── 导航时只有 page 变化，layout 保持不卸载（保持状态）
```

### 2. 四层缓存架构与失效协议

Next.js 15 的缓存不是单一机制，而是**四层独立的缓存系统**，每层解决不同问题。

```
四层缓存模型：

┌─────────────────────────────────────────────────────────┐
│ Layer 1: Request Memoization（请求级）                    │
│   作用域：单次渲染                                         │
│   机制：同一渲染中相同 URL+参数的 fetch 只执行一次        │
│   失效：渲染结束即清除                                     │
└─────────────────────────────────────────────────────────┘
n┌─────────────────────────────────────────────────────────┐
│ Layer 2: Data Cache（数据级）                             │
│   作用域：跨请求、全局                                   │
│   机制：类似 HTTP 缓存，存储 fetch 结果到磁盘             │
│   失效：revalidateTag() / revalidatePath() / 时间过期    │
│   存储位置：.next/cache/fetch-cache                      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Full Route Cache（路由级）                       │
│   作用域：整个页面的渲染结果                               │
│   机制：缓存 RSC Payload + HTML（对 SSR 页面）          │
│   失效：revalidatePath() / 数据缓存失效时级联失效      │
│   注意：含 useSearchParams / cookies 的路由自动跳过    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Router Cache（客户端级）                         │
│   作用域：浏览器内存                                       │
│   机制：已访问的路由 RSC Payload 缓存在客户端             │
│   失效：关闭标签页 / 手动清除 / 30 秒自动过期（默认）  │
│   注意：Link prefetch 会提前填充 Router Cache          │
└─────────────────────────────────────────────────────────┘

缓存失效级联：
  revalidatePath('/products')
    → 清除 Full Route Cache 中 /products 的渲染结果
    → 清除 Data Cache 中 /products 相关的 fetch 缓存
    → 下次访问时重新从数据源获取
```

### 3. Middleware 与 Edge Runtime

Middleware 不是运行在 Node.js 上，而是运行在 **Edge Runtime**（基于 V8 Isolate）。

```
Edge Runtime vs Node.js Runtime：

Node.js Runtime：
  ├── 完整 Node.js API（fs, path, crypto 等）
  ├── 冷启动较慢（加载完整运行时）
  └── 适合：Server Components、API Routes、Server Actions

Edge Runtime：
  ├── 精简 Web API（fetch, Request, Response, crypto.subtle）
  ├── 无 Node.js API（无 fs, path 等）
  ├── 冷启动极快（V8 Isolate 复用，无进程开销）
  └── 适合：Middleware、Edge Functions

Middleware 执行链路：

请求到达 → Edge Runtime 加载 middleware.ts
  │
  ├── 解析请求（NextRequest 封装）
  ├── 执行 middleware(request) 函数
  │   ├── 可以读取 cookies/headers
  │   ├── 可以修改请求（rewrite/redirect）
  │   └── 可以设置响应头
  │
  ├── 返回 NextResponse
  │   ├── NextResponse.next() → 继续路由匹配
  │   ├── NextResponse.redirect() → 302 重定向
  │   └── NextResponse.rewrite() → 内部改写（URL 不变）
  │
  └── 匹配到的路由开始执行

性能影响：
  Middleware 在每次请求前执行 → 必须极快（< 1ms 级别）
  避免在 Middleware 中做重计算或数据库查询
```

---

## 高频面试题

### Q1: Server Components 和 Client Components 的区别？

**参考答案要点**：

- Server Component：服务端渲染，不发送 JS 到客户端，可直接访问数据库
- Client Component：需要交互（useState/useEffect），JS 发送到客户端
- 默认是 Server Component，`'use client'` 标记为 Client
- 组合策略：Server 包裹 Client（服务端获取数据 + 客户端交互）

### Q2: Next.js 15 的缓存体系有几层？

**参考答案要点**：

- Request Memoization：同一渲染中请求去重
- Data Cache：跨请求数据缓存（fetch + revalidate）
- Full Route Cache：完整页面缓存
- Router Cache：客户端路由缓存
- 失效方式：revalidatePath / revalidateTag

### Q3: Server Actions 的工作原理？

**参考答案要点**：

- 客户端表单提交 → POST 请求到特殊端点
- 服务端执行标记为 `'use server'` 的函数
- 结果序列化返回客户端
- 配合 React 19 `useActionState` 处理表单状态与乐观更新
- 配合 `revalidatePath` / `revalidateTag` 更新缓存

### Q4: App Router 的路由模式有哪些？

**参考答案要点**：

- 文件系统路由：`page.tsx` → URL，`layout.tsx` 嵌套布局
- 动态路由：`[slug]`（单段）、`[[...slug]]`（可选捕获所有）
- 路由分组：`(groupName)` 不影响 URL，用于逻辑分组
- 拦截路由：`@modal` 插槽，在同一布局中展示不同视图，弹窗展示内容
- 特殊文件：`loading.tsx`（Suspense fallback）、`error.tsx`（错误边界）、`not-found.tsx`
- Next.js 15 中 `params` 和 `searchParams` 变为 Promise，需 `await`

### Q5: Middleware 的运行机制和应用场景？

**参考答案要点**：

- 运行在 Edge Runtime（非 Node.js），启动极快、资源占用低
- 在请求到达路由之前执行，可改写/重定向/拒绝请求
- 典型场景：认证守卫、i18n 语言检测、A/B 测试分桶、请求头注入
- 通过 `config.matcher` 精确匹配路径，避免全局执行
- 返回 `NextResponse.redirect()` / `NextResponse.rewrite()` / `NextResponse.next()`

---

## 延伸思考

1. **设计题**：为一个 SaaS 平台设计 Next.js 15 架构（多租户、权限、国际化）。
2. **场景题**：Next.js App Router 页面首屏白屏时间长，如何排查？
3. **对比题**：Next.js 15 vs Nuxt 3 vs Remix，全栈框架架构对比？

---

## 参考资料

- [Next.js 15 文档](https://nextjs.org/docs)
- [App Router 架构](https://nextjs.org/docs/app/building-your-application/routing)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
