---
title: React Router v6+ 路由架构
tags: ['React', '路由']
---

# React Router v6+ 路由架构

React Router 是 React 生态中最主流的路由方案，v6 带来了全新的 API 设计，v6.4+ 进一步引入数据加载/提交 API，向全栈路由演进。本文从架构角度系统梳理路由模式、数据流、守卫、性能优化等核心主题。

---

## 一、路由模式选择

### 1.1 三种路由模式

```tsx
// ① BrowserRouter — 生产环境首选
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/users/:id', element: <UserDetail /> },
])

function App() {
  return <RouterProvider router={router} />
}

// ② HashRouter — 静态部署 / 无服务端配置
import { createHashRouter } from 'react-router-dom'
const router = createHashRouter([...])
// URL 格式：http://example.com/#/users/123

// ③ MemoryRouter — 测试 / 非浏览器环境
import { createMemoryRouter } from 'react-router-dom'
const router = createMemoryRouter([...], {
  initialEntries: ['/dashboard'],
})
```

**选型决策**：

| 模式 | URL 格式 | 服务端配置 | 适用场景 |
|---|---|---|---|
| BrowserRouter | `/users/123` | 需要 fallback | 生产环境、SEO 友好 |
| HashRouter | `/#/users/123` | 不需要 | 静态托管、iframe 嵌入 |
| MemoryRouter | 无 URL 变化 | 不需要 | 单元测试、React Native |

### 1.2 与 Next.js App Router 的对比

| 维度 | React Router v6 | Next.js App Router |
|---|---|---|
| 运行环境 | 纯客户端 | 服务端 + 客户端 |
| 数据加载 | `loader`（客户端执行） | Server Component + `fetch` |
| 路由定义 | JS 配置对象 | 文件系统（目录结构） |
| SSR | 需自行配置 | 内置 |
| 适用场景 | SPA | 全栈应用 |

---

## 二、路由配置与嵌套

### 2.1 路由配置对象

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      {
        index: true, // 索引路由（默认子路由）
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: dashboardLoader,
      },
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          { index: true, element: <UserList /> },
          { path: ':id', element: <UserDetail /> },
          { path: ':id/edit', element: <UserEdit /> },
        ],
      },
      {
        path: '*', // 通配路由（404）
        element: <NotFound />,
      },
    ],
  },
])
```

### 2.2 Layout 路由 — 共享布局

```tsx
function RootLayout() {
  return (
    <div className="app">
      <Header />
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>
      <main>
        <Outlet /> {/* 子路由渲染位置 */}
      </main>
      <Footer />
    </div>
  )
}
```

### 2.3 路径模式

| 模式 | 示例 | 说明 |
|---|---|---|
| 静态路径 | `/about` | 精确匹配 |
| 动态参数 | `/users/:id` | `useParams()` 获取 |
| 可选参数 | `/users/:id?` | 有或无均可匹配 |
| 通配符 | `*` | 匹配剩余路径 |
| 索引路由 | `index: true` | 父路由的默认子路由 |

---

## 三、数据加载 — loader 与 action

### 3.1 loader — 路由级数据获取

```tsx
// loader 在路由匹配时、组件渲染前执行
async function userLoader({ params, request }: LoaderFunctionArgs) {
  const response = await fetch(`/api/users/${params.id}`, {
    signal: request.signal, // 支持请求取消
  })
  if (!response.ok) {
    throw new Response('Not Found', { status: 404 })
  }
  return response.json()
}

const router = createBrowserRouter([
  {
    path: '/users/:id',
    element: <UserDetail />,
    loader: userLoader,
  },
])

// 组件中读取 loader 数据
import { useLoaderData } from 'react-router-dom'

function UserDetail() {
  const user = useLoaderData() as User
  return <div>{user.name}</div>
}
```

### 3.2 action — 路由级数据提交

```tsx
async function userAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')

  // 验证
  const errors = {}
  if (!name) errors.name = '姓名必填'
  if (!email) errors.email = '邮箱必填'
  if (Object.keys(errors).length) return { errors }

  // 提交
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  })

  return redirect('/users')
}

const router = createBrowserRouter([
  {
    path: '/users/new',
    element: <UserForm />,
    action: userAction,
  },
])

// 组件中使用
import { useActionData, Form } from 'react-router-dom'

function UserForm() {
  const actionData = useActionData() as { errors?: Record<string, string> }

  return (
    <Form method="post">
      <input name="name" />
      {actionData?.errors?.name && <span>{actionData.errors.name}</span>}
      <input name="email" />
      <button type="submit">创建</button>
    </Form>
  )
}
```

### 3.3 数据流模型

```
用户导航到 /users/123

  ① Router 匹配路由
  ② 执行 loader（可并行执行多个层级的 loader）
  ③ loader 返回数据
  ④ 渲染组件树（useLoaderData 获取数据）
  ⑤ 用户提交表单
  ⑥ 执行 action
  ⑦ action 完成后重新执行所有匹配路由的 loader
  ⑧ 重新渲染
```

---

## 四、路由守卫与权限控制

### 4.1 认证守卫

```tsx
import { Navigate, useLocation } from 'react-router-dom'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // 未登录：重定向到登录页，记录来源
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// 使用：包裹需要认证的路由
const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
])

// 或者在 loader 中守卫
{
  path: '/dashboard',
  loader: async ({ request }) => {
    const user = await getUser(request)
    if (!user) throw redirect('/login')
    return { user }
  },
  element: <Dashboard />,
}
```

### 4.2 角色权限守卫

```tsx
function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}

// 使用
{
  path: '/admin',
  element: (
    <RequireAuth>
      <RequireRole roles={['admin', 'superadmin']}>
        <AdminPanel />
      </RequireRole>
    </RequireAuth>
  ),
}
```

---

## 五、代码分割与性能

### 5.1 路由级懒加载

```tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const UserProfile = lazy(() => import('./pages/UserProfile'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <Dashboard />
          </Suspense>
        ),
        loader: async () => {
          // 同时预加载组件
          await import('./pages/Dashboard')
          return dashboardLoader()
        },
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
])
```

### 5.2 预加载策略

```tsx
// 鼠标悬停链接时预加载目标路由的数据
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const revalidator = useRevalidator()

  return (
    <Link
      to={to}
      onMouseEnter={() => {
        // 预取 loader 数据
        revalidator.revalidate()
      }}
    >
      {children}
    </Link>
  )
}

// 或使用 React Router 内置 prefetch
<Link to="/dashboard" prefetch="intent">
  Dashboard
</Link>
// prefetch="intent"：鼠标悬停时预加载
// prefetch="render"：路由渲染时预加载
// prefetch="viewport"：链接进入视口时预加载
```

---

## 六、错误处理

### 6.1 路由级 Error Boundary

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />, // 全局错误边界
    children: [
      {
        path: 'users/:id',
        element: <UserDetail />,
        loader: userLoader,
        errorElement: <UserErrorBoundary />, // 路由级错误边界
      },
    ],
  },
])

// loader 中抛出错误自动被 errorElement 捕获
function userLoader({ params }: LoaderFunctionArgs) {
  const user = await fetchUser(params.id)
  if (!user) {
    throw new Response('', { status: 404, statusText: '用户不存在' })
  }
  return user
}

// 错误边界组件
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

function UserErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>
  }

  return <div>出错了：{(error as Error).message}</div>
}
```

---

## 七、路由架构速查表

| 主题 | 方案 | API |
|---|---|---|
| 路由模式 | BrowserRouter / HashRouter / MemoryRouter | `createBrowserRouter` |
| 嵌套布局 | Layout 组件 + `<Outlet />` | `children` 配置 |
| 数据加载 | 路由级 loader | `loader` + `useLoaderData` |
| 数据提交 | 路由级 action | `action` + `<Form>` |
| 认证守卫 | 包裹组件 / loader 中判断 | `Navigate` + `redirect` |
| 代码分割 | `lazy` + `Suspense` | 路由级懒加载 |
| 错误处理 | 路由级 errorElement | `useRouteError` |
| 预加载 | prefetch 属性 | `prefetch="intent"` |
| 编程式导航 | `useNavigate` | `navigate('/path')` |
| 读取参数 | `useParams` / `useSearchParams` | URL 参数 / 查询参数 |
