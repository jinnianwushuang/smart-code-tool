---
title: "React Server Components 原理 [P6-P7]"
level: "senior"
tags: ["React", "RSC", "流式渲染", "序列化协议"]
difficulty: "expert"
updated: "2026-09-10"
target: "P6+ 高级工程师"
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

### 1. 组件类型标记

```javascript
// "use client" 指令标记客户端组件边界
// 文件顶部声明，该文件及其依赖为客户端组件

"use client";

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 没有 "use client" 的组件默认是服务端组件
// 服务端组件可以：
// - 直接 async/await 获取数据
// - 访问服务端资源（数据库、文件系统）
// - 不包含客户端代码（无 Hooks、无事件处理）

async function ServerComponent() {
  const data = await db.query('SELECT * FROM posts');
  return <PostList posts={data} />;
}
```

### 2. RSC Payload 格式

```javascript
// RSC Payload 是一种特殊的序列化格式
// 使用 React Flight 协议传输

// 简化示例：
// 服务端组件树：
// <Layout>
//   <ServerComponent />  ← 服务端执行
//   <ClientComponent />  ← 客户端执行
// </Layout>

// RSC Payload（简化表示）：
[
  // 模块引用
  ["module1", "client-component.js", {"default": "ClientComponent"}],

  // 服务端组件的渲染结果（已序列化为 JSON 风格的树）
  ["S", "div", null, {
    "children": [
      ["$", "h1", null, {"children": "Hello"}],
      ["$", "p", null, {"children": "Server rendered content"}],
      // 客户端组件以引用形式嵌入
      ["$", "module1", "default", {"initialCount": 0}]
    ]
  }]
]

// 客户端解析 RSC Payload：
// 1. 遇到普通元素 → 直接渲染
// 2. 遇到模块引用 → 加载对应的客户端组件
// 3. 将服务端渲染结果与客户端组件合并
```

### 3. 流式渲染

```javascript
// RSC 支持流式传输，服务端渲染一部分就发送一部分

// 服务端（Next.js App Router）
async function Page() {
  return (
    <div>
      <Header /> {/* 快速渲染，先发送 */}
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent /> {/* 等待数据，后发送 */}
      </Suspense>
      <Footer /> {/* 快速渲染，先发送 */}
    </div>
  );
}

// 传输过程：
// 1. 服务端开始渲染
// 2. Header 和 Footer 立即渲染完成 → 发送
// 3. SlowDataComponent 等待数据 → 显示 Suspense fallback
// 4. 数据到达 → SlowDataComponent 渲染完成 → 发送替换内容
// 5. 客户端接收到替换内容 → 更新 DOM
```

### 4. 序列化协议

```javascript
// RSC 的序列化支持以下类型：
// - 基本类型：string, number, boolean, null, undefined
// - 对象和数组
// - Date, RegExp, Map, Set
// - Promise（作为异步边界）
// - 服务端组件引用（序列化为模块引用）

// 不能序列化的类型：
// - 函数（事件处理、回调）
// - 类实例
// - Symbol
// - 循环引用

// 解决方案：
// 1. 函数 → 只能在客户端组件中使用
// 2. 复杂对象 → 在服务端序列化为 JSON，客户端反序列化
// 3. 服务端组件通过 props 传递数据给客户端组件（数据必须是可序列化的）
```

### 5. Server Actions

```javascript
// Server Actions 允许客户端组件调用服务端函数
"use client";

import { createPost } from './actions';

function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  );
}

// actions.js
"use server";

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  await db.posts.create({ title, content });
  revalidatePath('/posts');
}

// 底层机制：
// 1. 表单提交时，客户端发送 POST 请求到服务端
// 2. 服务端执行 createPost 函数
// 3. 执行完成后，返回更新的 RSC Payload
// 4. 客户端用新 Payload 更新 UI
```

### 6. 缓存策略

```javascript
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
```

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
```

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
