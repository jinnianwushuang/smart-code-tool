---
title: 'Next.js 15 全栈框架原理 [P8]'
level: 'architect'
tags: ['Next.js 15', 'App Router', 'Server Actions', '缓存', 'Turbopack']
difficulty: 'expert'
updated: '2026-09-10'
target: '架构师（P8）'
---

# Next.js 15 全栈框架原理 [P8]

> Next.js 15 是 React 全栈框架的事实标准。App Router、Server Actions、多层缓存体系、Turbopack 集成，使其成为 2026 年全栈开发的核心选择。

## 核心概念（What）

### Next.js 15 架构全景

```
┌──────────────────────────────────────────┐
│              应用层                       │
│  app/ │ 路由 │ Server Components │ Actions│
├──────────────────────────────────────────┤
│              React 19                    │
│  Server Components │ Suspense │ use()    │
├──────────────────────────────────────────┤
│              Next.js 运行时              │
│  Node.js（服务端）│ Edge Runtime │ 浏览器 │
├──────────────────────────────────────────┤
│              构建工具                     │
│  Turbopack（开发）│ Webpack（生产）       │
└──────────────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. App Router 深度

```typescript
// App Router：文件系统路由（app/ 目录）
// app/
// ├── page.tsx              → /
// ├── about/page.tsx        → /about
// ├── blog/[slug]/page.tsx  → /blog/:slug（动态路由）
// ├── shop/[[...slug]]/page.tsx → /shop/*（可选捕获所有）
// ├── (auth)/login/page.tsx → /login（路由分组，不影响 URL）
// └── api/users/route.ts    → /api/users（API Route）

// 动态路由参数
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}

// 路由分组（不影响 URL 结构）
// app/(marketing)/about/page.tsx → /about
// app/(dashboard)/dashboard/page.tsx → /dashboard
// (marketing) 和 (dashboard) 是分组，不出现在 URL 中

// Layout 嵌套
// app/layout.tsx（根布局）
// app/dashboard/layout.tsx（Dashboard 布局，嵌套在根布局内）
```

### 2. Server Components vs Client Components

```typescript
// Server Component（默认）
// app/users/page.tsx
export default async function UsersPage() {
  // 直接在服务端获取数据（无需 API 调用）
  const users = await db.query('SELECT * FROM users');

  return (
    <ul>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}

// Client Component（需要交互时使用）
// app/components/SearchBar.tsx
'use client'; // 标记为客户端组件

import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// 组合策略：Server Component 包裹 Client Component
// app/search/page.tsx（Server Component）
import SearchBar from '../components/SearchBar'; // Client Component

export default async function SearchPage() {
  const results = await getInitialResults(); // 服务端获取
  return (
    <div>
      <SearchBar /> {/* 客户端交互 */}
      <ResultsList initial={results} />
    </div>
  );
}
```

### 3. Server Actions

```typescript
// Server Actions：在客户端调用服务端函数
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  await db.insert({ title, completed: false });
  revalidatePath('/todos'); // 重新验证缓存
}

export async function deleteTodo(id: string) {
  await db.delete(id);
  revalidatePath('/todos');
}

// 组件使用
// app/todos/page.tsx
import { createTodo, deleteTodo } from '../actions';

export default function TodosPage() {
  return (
    <div>
      <form action={createTodo}>
        <input name="title" />
        <button type="submit">添加</button>
      </form>

      <TodoList />
    </div>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  return (
    <form action={deleteTodo.bind(null, todo.id)}>
      <span>{todo.title}</span>
      <button type="submit">删除</button>
    </form>
  );
}

// Server Actions 原理：
// 1. 客户端提交 → POST 请求到特殊端点
// 2. 服务端执行函数（在 Node.js 运行时）
// 3. 返回结果（序列化后发送回客户端）
// 4. React 自动处理表单状态（useActionState）
```

### 4. 缓存体系

```typescript
// Next.js 15 四层缓存体系：

// 1. Request Memoization（请求记忆化）
// 同一渲染中相同请求只执行一次
async function getUser(id: string) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}
// 即使多个组件调用 getUser('1')，只执行一次

// 2. Data Cache（数据缓存）
// 跨请求缓存数据（类似 ISR）
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // 每小时重新验证
  });
  return res.json();
}

// 3. Full Route Cache（完整路由缓存）
// 缓存整个页面的渲染结果
// app/layout.tsx 或页面中设置
export const dynamic = 'force-dynamic';  // 禁用缓存
export const revalidate = 3600;          // 缓存 1 小时

// 4. Router Cache（路由缓存）
// 客户端缓存已访问的路由
// 前进/后退导航不重新获取数据
// 使用 Link 预取
import Link from 'next/link';
<Link href="/about" prefetch={true}>About</Link>

// 缓存失效：
import { revalidatePath, revalidateTag } from 'next/cache';
revalidatePath('/products');      // 使路径缓存失效
revalidateTag('products');        // 使标签缓存失效
```

### 5. Middleware

```typescript
// middleware.ts（根目录）
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 认证检查
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 国际化
  const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)

  // A/B 测试
  const bucket = Math.random() < 0.5 ? 'control' : 'experiment'
  response.cookies.set('ab-bucket', bucket)

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}

// Middleware 运行在 Edge Runtime（轻量、快速）
// 适用于：认证、重定向、国际化、A/B 测试、请求改写
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
- 配合 useActionState 处理表单状态
- 配合 revalidatePath 更新缓存

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
