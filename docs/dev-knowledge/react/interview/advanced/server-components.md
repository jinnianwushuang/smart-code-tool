---
title: 'React Server Components 原理 [P6-P7]'
level: 'senior'
tags: ['React', 'RSC', '流式渲染', '序列化协议']
difficulty: 'expert'
target: 'P6+ 高级工程师'
---

# React Server Components 原理 [P6-P7]

> React Server Components（RSC）是 React 架构的范式转变。它将组件分为服务端组件和客户端组件，在服务端执行组件逻辑，将渲染结果以特殊格式序列化传输到客户端，实现零客户端 JS 的服务端渲染。

## 核心概念（What）

### RSC 架构全景

```
┌─────────────────────────────────────────────┐
│              服务端                           │
│                                              │
│  Server Components（默认）                    │
│  ├── 直接访问数据库/文件系统                   │
│  ├── 不发送到客户端（零 JS 开销）              │
│  ├── 可以 import 客户端组件                   │
│  └── 渲染结果序列化为 RSC Payload             │
│                                              │
│  Client Components（"use client"）           │
│  ├── 发送到客户端执行                         │
│  ├── 可以使用 Hooks、事件处理                  │
│  ├── 可以 import 服务端组件（作为 children）   │
│  └── 渲染结果为普通 HTML                      │
└──────────────────────┬──────────────────────┘
                       │
              RSC Payload（流式传输）
                       │
┌──────────────────────┴──────────────────────┐
│              客户端                           │
│                                              │
│  React Flight Client                        │
│  ├── 解析 RSC Payload                        │
│  ├── 重建组件树                              │
│  ├── 与客户端组件合并                         │
│  └── Hydration（水合）                       │
│                                              │
│  最终输出：完整 HTML + 最小 JS                │
└─────────────────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. RSC Wire Format 协议

服务端组件的渲染结果不是 HTML，而是一种特殊的序列化格式——**RSC Wire Format**（React Flight 协议）。

```
RSC Wire Format 核心设计：

服务端渲染结果 ≠ HTML，而是“组件树描述”（类似 JSX 的 JSON 版本）

序列化规则：
  ┌───────────────────────────────────────────────────────┐
  │ 普通 HTML 元素 → ["$", "div", null, { children: ... }] │
  │ 客户端组件   → ["$", "moduleRef", "exportName", props] │
  │ 服务端组件   → 已展开为上述两种形式（服务端已执行完）  │
  │ Promise      → 特殊占位符，客户端 use() 时等待       │
  │ 函数         │ 不可序列化，只能在客户端组件中         │
  └───────────────────────────────────────────────────────┘

关键设计：
  - 服务端组件的执行结果被“扁平化”为纯数据
  - 客户端组件以“模块引用”形式存在，不发送源码
  - Promise 作为一等公民支持异步边界（Suspense）
  - 相同 Promise 引用在序列化时自动去重（Deduplication）
```

**为什么不是 HTML**：

- HTML 是最终渲染结果，无法保留组件结构和交互能力
- RSC Payload 保留了组件树的语义信息，客户端可以用它来“水合”（Hydration）
- 服务端组件的代码永远不会发送到客户端（零 Bundle 影响）

### 2. "use client" 边界的编译时解析

`"use client"` 不是运行时检查，而是**构建时指令**。

```
"use client" 边界解析链路：

构建阶段（Webpack/Turbopack）：
  1. 解析器遇到 "use client" 指令
  2. 标记该文件为“客户端入口”
  3. 该文件的依赖树全部打包到客户端 Bundle
  4. 服务端保留该文件的“模块引用”（路径 + export 名称）

运行时序列化：
  服务端渲染到 "use client" 组件时：
  ├── 不执行该组件的代码
  ├── 输出一个“模块引用”占位符：["module-ref", "/path/to/client.js", "default"]
  ├── 该组件的 props 被序列化（必须是可序列化类型）
  └── 客户端加载该模块后，用 props 水合该组件

边界规则：
  ┌───────────────────────────────────────────────────────┐
  │ 服务端组件（默认）                                    │
  │   ├── 可以 async/await                                │
  │   ├── 可以访问服务端资源（DB/FS）                     │
  │   ├── 可以 import 其他服务端组件                       │
  │   ├── 可以 import "use client" 组件（作为“叶子”）    │
  │   └── 不能包含 Hooks / 事件处理器                     │
  │                                                       │
  │ ─ ─ ─ ─ ─ ─ "use client" 边界 ─ ─ ─ ─ ─ ─ ─ ─ ─ │
  │                                                       │
  │ 客户端组件                                            │
  │   ├── 可以使用 Hooks / 事件处理器                     │
  │   ├── 可以接收服务端传来的可序列化 props              │
  │   ├── 不能直接 import 服务端模块（只能传 Server Action）│
  │   └── 可以通过 children 插槽渲染服务端组件            │
  └───────────────────────────────────────────────────────┘
```

### 3. 流式传输与渐进式水合

RSC 支持**流式传输**——服务端渲染一部分就发送一部分，客户端渐进式接收和渲染。

```
流式传输链路：

服务端                          客户端
  │                              │
  ├── Header 渲染完成 ────发送──→│──→ 立即渲染 Header
  │                              │
  ├── SlowData 等待中...         │   （Header 已可交互）
  │                              │
  ├── SlowData 完成 ──────发送──→│──→ 替换 Suspense fallback
  │                              │
  └── Footer 渲染完成 ────发送──→│──→ 渲染 Footer

底层协议：
  - 使用 ReadableStream + TextEncoder 流式传输
  - 每个“块”（chunk）是一个完整的 RSC 片段
  - Suspense fallback 先发送，真实内容后发送
  - 客户端用 createFromReadableStream() 解析流

渐进式水合：
  1. 客户端接收到第一个 chunk → 立即开始水合 Header
  2. 不需要等待所有 chunk 到达
  3. 每个 Suspense 边界独立水合
  4. TTFB（首字节时间）≠ 可交互时间
```

### 4. Server Actions 底层机制

Server Actions 不是简单的 API 调用，而是一套**双向 RPC 协议**。

```
Server Actions 执行链路：

客户端提交表单：
  <form action={createPost}>
  │
  ├── 浏览器拦截原生表单提交
  ├── 序列化 FormData 为请求体
  ├── 添加隐藏字段：
  │   ├── $ACTION_ID：对应服务端函数的唯一标识
  │   └── $ACTION_REF：如果引用了特定函数
  └── 发送 POST 请求到当前页面 URL

服务端处理：
  │
  ├── 解析请求体，找到 $ACTION_ID
  ├── 查找对应的服务端函数（createPost）
  ├── 反序列化参数，调用函数
  ├── 函数执行完成
  └── 返回新的 RSC Payload（包含更新后的组件树）

客户端接收响应：
  │
  ├── 解析新的 RSC Payload
  ├── 用新 Payload 替换旧的组件树
  └── React 自动 diff 并更新 DOM

关键设计：
  - Server Actions 是“幂等”的（建议设计为幂等）
  - 支持 useActionState 管理表单状态
  - 支持 useFormStatus 获取提交状态
  - revalidatePath() 触发相关路由缓存失效
```

// React 提供了多种缓存策略

// 1. React.cache() - 请求级缓存
import { cache } from 'react';

const getUser = cache(async (id) => {
return await db.users.find(id);
});

// 同一个请求中，多次调用 getUser(1) 只执行一次查询

// 2. React.use() + Suspense - 去重和瀑布流优化
// React 自动对相同的 Promise 进行去重

// 3. 框架级缓存（Next.js）
// - fetch 缓存
// - 全路由缓存
// - 数据缓存（ISR）

````

---

## 实战应用（How）

### RSC 最佳实践

```jsx
// 1. 默认使用服务端组件
// 只在需要交互时才添加 "use client"

// 2. 将 "use client" 边界尽量下推
// 反模式：整个页面标记为客户端
"use client";
function Page() {
  return (
    <Layout>
      <Header />
      <Content />
      <Footer />
    </Layout>
  );
}

// 优化：只在需要交互的组件标记
// layout.tsx（服务端组件）
export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// search-bar.tsx（客户端组件）
"use client";
function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// 3. 通过 children 传递客户端组件到服务端组件
// 这样可以避免将整个组件树标记为客户端
function Layout({ children }) {
  return (
    <div>
      <ServerHeader />
      {children} {/* 客户端组件通过 children 传入 */}
      <ServerFooter />
    </div>
  );
}
````

---

## 高频面试题

### Q1: React Server Components 的核心原理是什么？

**参考答案要点**：

- 组件分为服务端组件和客户端组件
- 服务端组件在服务端执行，渲染结果序列化为 RSC Payload
- RSC Payload 通过流式传输发送到客户端
- 客户端解析 Payload，与服务端渲染的 HTML 合并
- 服务端组件零 JS 开销，客户端组件负责交互

### Q2: RSC 与传统 SSR 有什么区别？

**参考答案要点**：

- 传统 SSR：服务端渲染 HTML → 客户端下载 JS → Hydration
- RSC：服务端渲染组件 → 序列化为 RSC Payload → 客户端解析
- RSC 的服务端组件不需要发送到客户端（零 JS 开销）
- RSC 支持流式传输和渐进式 Hydration
- RSC 可以直接在服务端访问数据库等资源

### Q3: Server Actions 的工作原理是什么？

**参考答案要点**：

- 客户端组件通过表单或函数调用触发 Server Action
- 底层发送 RPC 请求到服务端
- 服务端执行 Action 函数
- 执行完成后返回更新的 RSC Payload
- 客户端用新 Payload 更新 UI（不需要整页刷新）

---

## 延伸思考

1. **设计题**：如何设计一个支持 RSC 的组件库，让组件同时支持服务端和客户端渲染？
2. **场景题**：一个电商页面的商品列表需要实时库存信息，如何用 RSC 架构实现？
3. **对比题**：RSC vs Remix 的 Loader/Action vs Astro 的 Islands，各自的服务端渲染策略？

---

## 参考资料

- [React Server Components 文档](https://react.dev/reference/rsc/server-components)
- [RSC 架构 RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Dan Abramov - React Server Components 演讲](https://www.youtube.com/watch?v=TQQPAU21ZUw)
