# Next.js 核心底层原理深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-10  
> **适用对象**: 高级前端工程师、架构师、对 Next.js internals 感兴趣的开发者

---

## 📑 目录

- [一、Next.js 架构概览](#一nextjs-架构概览)
- [二、编译与构建管道](#二编译与构建管道)
- [三、React Server Components 原理](#三react-server-components-原理)
- [四、路由系统内部机制](#四路由系统内部机制)
- [五、渲染引擎（SSR/SSG/ISR/Streaming）](#五渲染引擎ssrsggisrstreaming)
- [六、缓存系统](#六缓存系统)
- [七、Server Actions 原理](#七server-actions-原理)
- [八、中间件原理](#八中间件原理)
- [九、导航与预取](#九导航与预取)
- [十、性能优化机制](#十性能优化机制)

---

## 一、Next.js 架构概览

### 1.1 运行时架构

```
Next.js 应用
├── 构建时 (Build Time)
│   ├── Webpack / Turbopack 编译
│   ├── 静态分析 & 路由提取
│   ├── RSC Payload 生成
│   └── HTML 预渲染 (SSG/ISR)
│
├── 请求时 (Request Time)
│   ├── Middleware (Edge Runtime)
│   ├── Route Matching
│   ├── Server Components 执行
│   ├── Data Fetching (带缓存/去重)
│   └── Streaming SSR
│
└── 客户端 (Client Side)
    ├── Router Cache (已访问路由)
    ├── Prefetch (视口内 Link)
    ├── Hydration (RSC + Client JS)
    └── Soft Navigation (不刷新页面)
```

### 1.2 双运行时模型

```
┌─────────────────────────────────────────────────┐
│                 Server Runtime                   │
│  ┌───────────────────────────────────────────┐  │
│  │  Edge Runtime (Middleware, API Routes)    │  │
│  │  - 轻量、低延迟、全球分发                  │  │
│  │  - 受限 API（无 Node.js 完整 API）         │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Node.js Runtime (Server Components, SSR) │  │
│  │  - 完整 Node.js API                        │  │
│  │  - 数据库、文件系统、后端调用               │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │ Streaming
                     ▼
┌─────────────────────────────────────────────────┐
│                 Client Runtime                   │
│  - React 18+ Concurrent Features                │
│  - RSC Payload 解析                              │
│  - Selective Hydration                           │
│  - Router Cache & Prefetch                      │
└─────────────────────────────────────────────────┘
```

### 1.3 请求生命周期

```
HTTP 请求
    ↓
Middleware (Edge Runtime)
    ├── 认证检查 / 重定向 / 请求头修改
    ↓
Route Matching
    ├── 静态路由优先 → 动态路由 → Catch-all
    ↓
Layout 解析 (从根到叶子)
    ├── Root Layout → Nested Layouts → Page
    ↓
Data Fetching (并行)
    ├── Server Components 执行
    ├── fetch 请求 (带缓存/去重)
    └── generateMetadata / generateStaticParams
    ↓
Rendering
    ├── RSC Payload 生成
    ├── Streaming HTML
    └── 发送到客户端
    ↓
Client Hydration
    ├── 解析 RSC Payload
    ├── 加载客户端 JS Bundle
    └── 为客户端组件注入交互
```

---

## 二、编译与构建管道

### 2.1 构建阶段

```
源码 (app/ 目录)
    ↓
┌─────────────────────────────────────────────┐
│  1. 编译 (Compilation)                       │
│     ├── Webpack/Turbopack 编译源码           │
│     ├── Tree Shaking 移除死代码              │
│     ├── 代码分割 (Code Splitting)            │
│     └── 'use client' / 'use server' 边界解析 │
├─────────────────────────────────────────────┤
│  2. 静态分析                                 │
│     ├── 检测页面是否可静态生成               │
│     ├── 分析动态路由参数                     │
│     └── 确定渲染策略 (SSG/SSR/ISR)          │
├─────────────────────────────────────────────┤
│  3. 预渲染 (Prerender)                       │
│     ├── 执行 generateStaticParams            │
│     ├── 执行 generateMetadata                │
│     ├── 运行服务端组件                       │
│     └── 生成 HTML + RSC Payload              │
├─────────────────────────────────────────────┤
│  4. 输出                                     │
│     ├── .next/server/   → 服务端代码         │
│     ├── .next/static/   → 客户端 JS/CSS      │
│     └── .next/cache/    → 构建缓存           │
└─────────────────────────────────────────────┘
```

### 2.2 Turbopack vs Webpack

```
Webpack:
├── 基于 JavaScript
├── 全量编译 → HMR 慢 (大项目)
└── 成熟稳定，插件生态丰富

Turbopack (Rust 编写):
├── 增量编译 — 只编译变化的模块
├── 惰性求值 — 只计算当前需要的结果
├── HMR 速度提升 10x
├── 冷启动速度提升 4x
└── 仍在持续完善中
```

```javascript
// next.config.js — Turbopack 配置
module.exports = {
  experimental: {
    turbo: {
      resolveAlias: {
        '@': './src',
      },
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}
```

### 2.3 'use client' / 'use server' 指令处理

```
构建时编译器扫描所有模块:

'use client' 模块
├── 标记为客户端边界
├── 提取为独立的客户端 JS Bundle
├── 在服务端组件中 → 序列化为引用占位符
└── 客户端加载时 → Hydration 注入交互

'use server' 模块
├── 标记为服务端边界
├── 为每个导出函数生成唯一 ID + 加密引用
├── 客户端拿到的是序列化引用 (不是实际函数)
└── 运行时通过 /__next_action 端点调用
```

---

## 三、React Server Components 原理

### 3.1 RSC 渲染流程

```
服务端                          客户端
  │                               │
  ├─ 1. 接收请求                   │
  │                               │
  ├─ 2. 执行 Server Component      │
  │   (数据库查询、API 调用等)      │
  │                               │
  ├─ 3. 生成 RSC Payload           │
  │   (序列化的 React 树，          │
  │    不包含 JS 代码)              │
  │                               │
  ├─ 4. 流式传输 ──────────────────→│
  │   (Streaming SSR)              │
  │                               │
  │                  5. 接收 RSC Payload
  │                     + 客户端 JS Bundle
  │                               │
  │                  6. Selective Hydration
  │                     (为客户端组件注入交互)
  │                               │
  └───────────────────────────────┘
```

### 3.2 RSC Payload 格式

```
// RSC Payload 是一种特殊的序列化格式 (Flight)
// 每个模块/组件对应一行，用特殊前缀标识

0:["$","div",null,{"children":[
  ["$","h1",null,{"children":"Hello World"}],
  ["$","p",null,{"children":"Server rendered content"}]
]}]

1:I{"id":"./ClientCounter","chunks":["client-chunk-abc"],"name":""}

2:["$","div",null,{"children":[
  "@1",               // ← 客户端组件引用
  {"props":{"initialCount":0}}
]}]

符号说明:
- $  : React element (服务端渲染)
- I  : Module import reference (客户端模块引用)
- @  : Lazy reference (懒加载引用)
- 数字前缀 : Chunk ID，支持流式增量解析
```

### 3.3 RSC 边界规则

```typescript
// ❌ 错误: 服务端组件不能直接使用客户端模块的 hooks
// ServerComponent.tsx
import { useTheme } from './ThemeContext' // 'use client' 模块
export default function Page() {
  const theme = useTheme() // ❌ hooks 只能在客户端组件使用
}

// ✅ 正确: 通过 children/props 传递客户端组件
// ServerComponent.tsx
import ClientThemeProvider from './ClientThemeProvider'

export default async function Page() {
  const data = await fetchData()
  return (
    <ClientThemeProvider>
      <DataView data={data} />
    </ClientThemeProvider>
  )
}

// ✅ 正确: 服务端组件可以 import 客户端组件作为子节点
// 但不能调用其 hooks 或读取其内部状态
```

### 3.4 服务端组件 vs 客户端组件

```
Server Component (默认)
├── 执行环境: Node.js / Edge
├── JS Bundle: 零 (不发送到客户端)
├── 可以: 数据库、文件系统、敏感密钥
├── 不能: useState/useEffect、事件、浏览器 API
└── 适合: 数据展示、布局、静态内容

Client Component ('use client')
├── 执行环境: 浏览器
├── JS Bundle: 发送到客户端
├── 可以: Hooks、事件、浏览器 API
├── 不能: 直接访问数据库/文件系统
└── 适合: 表单、交互、动画、状态管理
```

---

## 四、路由系统内部机制

### 4.1 路由匹配算法

```
URL: /blog/hello-world

匹配顺序 (优先级从高到低):
1. 精确静态路由:   app/blog/hello-world/page.tsx
2. 动态路由:       app/blog/[slug]/page.tsx
3. 捕获所有路由:   app/blog/[...slug]/page.tsx
4. 可选捕获路由:   app/blog/[[...slug]]/page.tsx

路由表构建 (构建时):
├── 扫描 app/ 目录
├── 提取 page.tsx / route.ts / layout.tsx
├── 按优先级排序 (静态 > 动态 > catch-all)
└── 生成路由清单 (Manifest)
```

### 4.2 Layout 嵌套与复用

```
请求: /dashboard/settings

Layout 树解析:
┌──────────────────────────────────────┐
│  Root Layout (app/layout.tsx)        │  ← 永远挂载
│  ┌────────────────────────────────┐  │
│  │  Dashboard Layout              │  │  ← /dashboard/* 共享
│  │  (app/dashboard/layout.tsx)    │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  Settings Page           │  │  │  ← 当前页面
│  │  │  (app/dashboard/         │  │  │
│  │  │   settings/page.tsx)     │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

关键特性:
- Layout 在导航时被复用 (不重新渲染)
- 只有 Page 和变化的 Layout 会重新执行
- 共享 Layout 状态在导航间保留
```

### 4.3 路由组与并行路由

```typescript
// 路由组: (group) — 不影响 URL 路径
// app/(marketing)/about/page.tsx  → /about
// app/(shop)/products/page.tsx    → /products
// 用途: 组织代码、共享 Layout

// 并行路由: @slot — 同一 URL 渲染多个页面
// app/dashboard/@analytics/page.tsx  → 分析面板
// app/dashboard/@revenue/page.tsx    → 收入面板

// 实现原理:
// 构建时将 @slot 目录编译为独立的 Page 组件
// Layout 通过 props 接收各 slot 的渲染结果:
export default function DashboardLayout({
  children,    // 主页面
  analytics,   // @analytics slot
  revenue,     // @revenue slot
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  revenue: React.ReactNode
}) {
  return (
    <>
      {children}
      {analytics}
      {revenue}
    </>
  )
}
```

---

## 五、渲染引擎（SSR/SSG/ISR/Streaming）

### 5.1 渲染策略决策树

```
页面是否使用动态数据?
├── 否 → SSG (Static)
│   └── 构建时生成 HTML，CDN 缓存
│
├── 是 → 是否需要实时?
│   ├── 否 → ISR (Incremental Static Regeneration)
│   │   └── 静态生成 + 定时后台重新验证
│   │
│   └── 是 → SSR (Dynamic)
│       └── 每次请求时服务器渲染
│
└── 混合 → Streaming SSR / Partial Prerendering
    └── 静态部分立即发送，动态部分流式注入
```

### 5.2 SSG 实现原理

```javascript
// 构建时执行
// app/blog/[slug]/page.tsx

// 1. 获取所有动态路由参数
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then((r) => r.json())
  return posts.map((post) => ({ slug: post.slug }))
}

// 2. 为每个参数组合执行 Server Component
//    生成 RSC Payload + HTML
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}

// 构建输出:
// .next/server/app/blog/hello-world.html       (预渲染 HTML)
// .next/server/app/blog/hello-world.rsc         (RSC Payload)
// .next/server/app/blog/nextjs-tips.html
// .next/server/app/blog/nextjs-tips.rsc
```

### 5.3 ISR 实现原理

```typescript
// ISR = SSG + 后台重新验证
export const revalidate = 60 // 60 秒后重新验证

// 请求流程:
// 1. 首次请求: 返回缓存的静态页面
// 2. 60 秒内: 继续返回缓存 (stale-while-revalidate)
// 3. 超过 60 秒: 返回旧缓存 + 触发后台重新生成
// 4. 重新生成完成: 更新缓存，下次请求使用新内容

// 按需重新验证 (On-demand Revalidation)
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST() {
  revalidatePath('/blog') // 重新验证路径
  revalidatePath('/blog/[slug]', 'page') // 重新验证动态路由
  revalidateTag('blog-posts') // 重新验证标签

  return Response.json({ revalidated: true })
}

// 给 fetch 打标签
fetch('https://api.example.com/posts', {
  next: { tags: ['blog-posts'] },
})
```

### 5.4 Streaming SSR 原理

```
传统 SSR (一次性):
请求 → 等待所有数据 → 生成完整 HTML → 发送 → Hydration

Streaming SSR (渐进式):
请求 → 立即发送 Shell HTML → 逐块流式发送内容 → 逐步 Hydration

实现依赖:
- React 18 Suspense + Selective Hydration
- Transfer-Encoding: chunked
- 每个 Suspense 边界独立解析和渲染
```

```typescript
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* 立即显示骨架，数据就绪后替换 */}
      <Suspense fallback={<SkeletonCard />}>
        <SlowDataComponent />
      </Suspense>

      <Suspense fallback={<SkeletonChart />}>
        <ChartComponent />
      </Suspense>
    </div>
  )
}

// loading.tsx 本质上就是页面级的 Suspense fallback
// Next.js 自动将 page.tsx 包裹在 Suspense 中
```

### 5.5 Partial Prerendering (PPR)

```
Partial Prerendering — 同页面混合静态 + 动态:

用户请求 /product/123
  │
  ├─ 1. 立即返回静态 Shell (从边缘节点 CDN)
  │     ├── Header (静态)
  │     ├── Product Info (静态)
  │     └── Reviews 占位符 (动态)
  │
  └─ 2. 流式注入动态部分
        └── Reviews (从源服务器获取后流式填充)
```

```typescript
// next.config.js
module.exports = {
  experimental: { ppr: true }, // 全局启用
}

// 或在单个路由启用
// app/product/[id]/page.tsx
export const experimental_ppr = true

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id) // 静态 — 构建时获取

  return (
    <div>
      <ProductInfo product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />  {/* 动态 — 运行时获取 */}
      </Suspense>
    </div>
  )
}
```

---

## 六、缓存系统

### 6.1 四层缓存架构

```
┌──────────────────────────────────────────┐
│  1. 请求缓存 (Request Memoization)        │  ← 同一请求内去重
├──────────────────────────────────────────┤
│  2. 数据缓存 (Data Cache)                 │  ← 跨请求持久化
├──────────────────────────────────────────┤
│  3. 完整路由缓存 (Full Route Cache)        │  ← RSC Payload + HTML
├──────────────────────────────────────────┤
│  4. 路由缓存 (Router Cache)               │  ← 客户端已访问路由
└──────────────────────────────────────────┘
```

### 6.2 请求缓存 (Request Memoization)

```typescript
// 同一渲染中相同的 fetch 自动去重
// 组件 A 和组件 B 都调用 fetchUser(1)，只会请求一次

async function ComponentA() {
  const user = await fetchUser(1) // 实际请求
  return <div>{user.name}</div>
}

async function ComponentB() {
  const user = await fetchUser(1) // 复用缓存，不重复请求
  return <div>{user.email}</div>
}

// 实现原理:
// Next.js 在渲染上下文维护一个 fetch 调用 Map
// key = hash(url + options)
// value = Promise<Response>
// 相同 key 返回同一个 Promise

// 手动实现去重:
function createFetchCache() {
  const cache = new Map<string, Promise<any>>()

  return function cachedFetch(url: string) {
    if (cache.has(url)) return cache.get(url)!
    const promise = fetch(url).then(r => r.json())
    cache.set(url, promise)
    return promise
  }
}

// 禁用去重: 添加唯一参数或使用 AbortController
fetch('/api/data', { cache: 'no-store' })
```

### 6.3 数据缓存 (Data Cache)

```typescript
// 基于 fetch 的持久化缓存，跨请求共享
// 存储在 .next/cache/fetch/

// 永久缓存 (默认)
fetch('https://api.example.com/data')
// → cache: 'force-cache'

// 定时重新验证
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }, // 1 小时后失效
})

// 不缓存
fetch('https://api.example.com/data', {
  cache: 'no-store',
})

// 按标签重新验证
fetch('https://api.example.com/posts', {
  next: { tags: ['blog-posts'] },
})

// 重新验证
import { revalidatePath, revalidateTag } from 'next/cache'
revalidatePath('/blog') // 重新验证路径
revalidateTag('blog-posts') // 重新验证标签
```

### 6.4 完整路由缓存与路由缓存

```typescript
// 完整路由缓存 (服务端)
// 缓存 RSC Payload + 预渲染 HTML
// 默认: 静态路由永久缓存
// 动态路由: 不缓存 (除非使用 revalidate)

// 路由级配置
export const dynamic = 'force-static' // 强制静态 → 缓存
export const dynamic = 'force-dynamic' // 强制动态 → 不缓存
export const revalidate = 60 // ISR → 60秒后失效

// 路由缓存 (客户端)
// 浏览器内存中缓存已访问的路由 RSC Payload
// 默认: 已访问路由 + 预取路由缓存 30 秒
// 可通过 router.refresh() 清除
```

---

## 七、Server Actions 原理

### 7.1 工作流程

```
构建时:
├── 扫描 'use server' 模块
├── 为每个导出函数生成唯一 ID
├── 创建加密引用 (Closure Reference)
└── 客户端拿到的是序列化引用 (不是实际函数)

运行时:
├── 客户端调用 → POST /__next_action
│   └── body: { actionId, args }
├── 服务端根据 actionId 找到原始函数
├── 执行函数
├── 返回 RSC Payload (更新后的 UI 片段)
└── 自动触发相关路由重新验证
```

```typescript
'use server'

// 构建时生成:
// createActionReference("app/actions.ts#createUser")
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  await db.user.create({ data: { name } })
  revalidatePath('/users') // 自动刷新相关页面
}
```

### 7.2 安全机制与最佳实践

```typescript
// Server Actions 安全注意事项:
// ├── 所有 action 函数都暴露在 /__next_action 端点
// ├── 必须在 action 内部做认证检查
// ├── 必须验证所有输入参数
// ├── 不能信任客户端传来的数据
// └── 建议使用 Zod 等库做 schema 验证

'use server'
import { z } from 'zod'
import { auth } from './auth'

const ProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export async function updateProfile(formData: FormData) {
  // 1. 认证检查
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // 2. 输入验证
  const validated = ProfileSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  // 3. 执行业务逻辑
  await db.user.update({
    where: { id: session.userId },
    data: validated,
  })

  revalidatePath('/profile')
}
```

### 7.3 客户端集成

```typescript
'use client'
import { useActionState } from 'react'
import { createUser } from '../actions'

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null)

  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  )
}

// useActionState 内部实现 (简化):
// 1. 维护 state + pending 状态
// 2. 包装 action 函数，拦截 form submit
// 3. 调用时 POST /__next_action
// 4. 接收 RSC Payload 更新 UI
// 5. 将 action 返回值更新到 state
```

---

## 八、中间件原理

### 8.1 执行环境

```
Middleware 运行在 Edge Runtime:
├── 基于 Web Standard API (Request/Response)
├── 无 Node.js 完整 API (无 fs, net, tls 等)
├── 全球边缘节点执行，低延迟
├── 在路由匹配之前执行
└── 每个请求都会触发 (受 matcher 限制)
```

### 8.2 执行流程

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. 认证检查
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. 请求头修改
  const response = NextResponse.next()
  response.headers.set('x-request-id', crypto.randomUUID())

  // 3. 重写 (内部路由转换，URL 不变)
  if (request.nextUrl.pathname.startsWith('/api/v2')) {
    return NextResponse.rewrite(new URL('/api/v1' + request.nextUrl.pathname.slice(6), request.url))
  }

  return response
}

// matcher 配置 — 控制哪些路径触发中间件
export const config = {
  matcher: [
    // 匹配所有路径，排除静态资源
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // 匹配特定路径
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
}
```

### 8.3 中间件链模式

```typescript
// 多个中间件的组合模式
import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'

type NextMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
) => NextResponse | Promise<NextResponse>

function createMiddlewareChain(middlewares: NextMiddleware[]) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    let response = NextResponse.next()

    for (const mw of middlewares) {
      const result = await mw(request, event)
      if (result.status !== 200) return result // 短路返回
      // 合并 headers
      result.headers.forEach((value, key) => {
        response.headers.set(key, value)
      })
    }

    return response
  }
}

// 使用
const authMiddleware: NextMiddleware = (request) => {
  const token = request.cookies.get('token')
  if (!token) return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}

const rateLimitMiddleware: NextMiddleware = (request) => {
  // 速率限制逻辑
  return NextResponse.next()
}

export const middleware = createMiddlewareChain([authMiddleware, rateLimitMiddleware])
```

---

## 九、导航与预取

### 9.1 客户端导航原理

```
Link 组件的导航流程:

1. 用户点击 <Link>
2. 浏览器发起 soft navigation (不刷新页面)
3. Next.js 客户端 Router 接管
4. 检查 Router Cache → 命中则直接使用
5. 未命中 → 请求目标页面的 RSC Payload
6. 复用共享 Layout (不重新渲染)
7. 只更新变化的部分 (Page + 变化的 Layout)
8. 浏览器 History API 更新 URL
9. 更新 Router Cache

vs 传统页面跳转:
- 传统: 完整页面刷新 → 重新加载所有资源
- Next.js: 只请求 RSC Payload (增量数据)
```

### 9.2 预取策略

```typescript
// 自动预取 — Link 组件默认行为
// 1. 页面加载完成后
// 2. Link 进入视口 (Intersection Observer)
// 3. 自动预取目标页面的 RSC Payload
// 4. 用户点击时几乎瞬间导航

// 预取粒度控制
<Link href="/about">About</Link>                 // 默认: 预取到 loading.tsx 边界
<Link href="/about" prefetch={true}>About</Link>  // 完全预取整页
<Link href="/about" prefetch={false}>About</Link> // 禁用预取
<Link href="/about" prefetch={null}>About</Link>  // 仅预取到 loading 边界 (默认)

// 编程式预取
'use client'
import { useRouter } from 'next/navigation'

function PrefetchExample() {
  const router = useRouter()

  return (
    <button
      onMouseEnter={() => router.prefetch('/dashboard')}
      onClick={() => router.push('/dashboard')}
    >
      Dashboard
    </button>
  )
}
```

### 9.3 路由缓存生命周期

```
用户访问 /page-a
├── 导航到 /page-b
│   ├── Router Cache: /page-a 保留 30 秒
│   └── 预取 /page-b RSC Payload
├── 返回 /page-a
│   └── Router Cache 命中 → 瞬间返回 (不重新请求)
├── 30 秒后访问 /page-a
│   └── Cache 过期 → 重新请求 RSC Payload
└── router.refresh()
    └── 清除所有 Router Cache → 下次导航重新请求
```

---

## 十、性能优化机制

### 10.1 自动代码分割

```typescript
// Next.js 自动对以下内容进行代码分割:
// 1. 每个 Page 组件 → 独立 chunk
// 2. 'use client' 组件 → 客户端 chunk
// 3. 动态导入 → 按需加载 chunk

import dynamic from 'next/dynamic'

// 动态导入 — 按需加载重型组件
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // 禁用 SSR (仅客户端渲染)
})

// 条件加载
const Editor = dynamic(
  () => import('../components/Editor'),
  {
    loading: () => <SkeletonEditor />,
    suspense: true, // 配合 Suspense 使用
  },
)

// 命名导出导入
const { DatePicker } = dynamic(
  () => import('../components/DatePicker'),
  { ssr: false },
)
```

### 10.2 图片与字体优化

```typescript
// Image 组件的底层优化:
// ├── 自动 WebP/AVIF 转换 (比 JPEG 小 30-50%)
// ├── 响应式 srcset 生成 (多种尺寸)
// ├── 懒加载 (进入视口才加载)
// ├── 防止布局偏移 (CLS) — 强制指定宽高
// └── 模糊占位符 (blurDataURL)

import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={800}
  priority           // 首屏图片: 禁用懒加载 + preload
  placeholder="blur" // 模糊占位符
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// next/font 优化:
// ├── 自动自托管 (不请求 Google Fonts CDN)
// ├── 字体文件内联到 CSS
// ├── 零布局偏移
// └── 自动预加载关键字体

import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### 10.3 脚本加载策略

```typescript
import Script from 'next/script'

// 加载策略
<Script src="https://analytics.com/script.js" strategy="beforeInteractive" />
// → 在页面 hydration 之前加载 (关键脚本)

<Script src="https://analytics.com/script.js" strategy="afterInteractive" />
// → 在页面 hydration 之后加载 (默认，大多数第三方脚本)

<Script src="https://analytics.com/script.js" strategy="lazyOnload" />
// → 在浏览器空闲时加载 (非关键脚本)

<Script src="https://analytics.com/script.js" strategy="worker" />
// → 在 Web Worker 中加载 (实验性，不阻塞主线程)
```

### 10.4 Bundle 分析

```bash
# 分析 bundle 大小
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})
```

```bash
# 运行分析
ANALYZE=true npm run build

# 输出:
# .next/analyze/client.html  → 客户端 bundle 分析
# .next/analyze/nodejs.html  → 服务端 bundle 分析
# .next/analyze/edge.html    → Edge bundle 分析
```

### 10.5 性能监控

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />      {/* 页面访问分析 */}
        <SpeedInsights />   {/* Web Vitals 监控 */}
      </body>
    </html>
  )
}

// 自定义 Web Vitals 上报
// app/web-vitals.ts
export function reportWebVitals(metric) {
  // metric: { name, value, rating, delta, id, ... }
  // name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  console.log(metric.name, metric.value)
  // 发送到你的分析服务
}
```

---

## 附录

### A. Next.js 渲染策略对比

| 特性       | SSG        | SSR              | ISR                   | Streaming   |
| ---------- | ---------- | ---------------- | --------------------- | ----------- |
| 生成时机   | 构建时     | 每次请求         | 构建时 + 后台重新验证 | 每次请求    |
| TTFB       | 最快 (CDN) | 较慢             | 快 (CDN)              | 快 (渐进式) |
| 数据新鲜度 | 静态       | 实时             | 准实时                | 实时        |
| 服务器负载 | 低         | 高               | 低                    | 中          |
| 适用场景   | 博客、文档 | 用户数据、仪表盘 | 产品列表、新闻        | 复杂页面    |

### B. 缓存层级对比

| 缓存         | 位置               | 生命周期      | 清除方式                 |
| ------------ | ------------------ | ------------- | ------------------------ |
| 请求缓存     | 服务端内存         | 单次请求      | 请求结束自动清除         |
| 数据缓存     | 磁盘 (.next/cache) | 跨请求持久化  | revalidate/revalidateTag |
| 完整路由缓存 | 磁盘 (.next/cache) | 构建时/运行时 | revalidatePath           |
| 路由缓存     | 客户端内存         | 30 秒         | router.refresh() / 导航  |

### C. 学习资源

- **官方文档**: https://nextjs.org/docs
- **Next.js 源码**: https://github.com/vercel/next.js
- **React Server Components**: https://react.dev/reference/rsc
- **Next.js Learn**: https://nextjs.org/learn

---

**深入理解 Next.js 底层原理，才能构建更快、更可靠的 Web 应用！** ⚡
