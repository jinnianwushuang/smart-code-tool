# Next.js 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: React 开发者、前端工程师、全栈开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、项目初始化](#二项目初始化)
- [三、路由系统](#三路由系统)
- [四、数据获取](#四数据获取)
- [五、服务端组件](#五服务端组件)
- [六、客户端组件](#六客户端组件)
- [七、API 路由](#七api-路由)
- [八、样式方案](#八样式方案)
- [九、图片优化](#九图片优化)
- [十、元数据管理](#十元数据管理)
- [十一、中间件](#十一中间件)
- [十二、性能优化](#十二性能优化)
- [十三、部署发布](#十三部署发布)
- [十四、最佳实践](#十四最佳实践)

---

## 一、基础概念

### 1.1 什么是 Next.js

Next.js 是一个基于 React 的全栈框架,提供服务器端渲染(SSR)、静态站点生成(SSG)、增量静态再生(ISR)等特性。

**核心特性**:

- 文件系统路由
- 服务端渲染 (SSR)
- 静态站点生成 (SSG)
- 增量静态再生 (ISR)
- API 路由
- 内置优化(图片、字体、脚本)
- TypeScript 支持
- CSS/Sass 支持

### 1.2 版本对比

```
Next.js 13+ (App Router) - 推荐使用
├── app/ 目录
├── 服务端组件 (默认)
├── 流式 SSR
├── 并行路由
└── 拦截路由

Next.js 12 及以前 (Pages Router)
├── pages/ 目录
├── 客户端组件 (默认)
├── getServerSideProps
├── getStaticProps
└── getInitialProps
```

### 1.3 渲染模式

```javascript
// 1. 客户端渲染 (CSR)
// 在浏览器中渲染,适合交互式应用

// 2. 服务端渲染 (SSR)
// 每次请求时服务器渲染,适合动态内容
export const dynamic = 'force-dynamic'

// 3. 静态站点生成 (SSG)
// 构建时预渲染,适合静态内容
export const dynamic = 'force-static'

// 4. 增量静态再生 (ISR)
// 静态生成 + 后台重新验证
export const revalidate = 60 // 60秒后重新验证
```

---

## 二、项目初始化

### 2.1 创建项目

```bash
# 使用 create-next-app
npx create-next-app@latest my-app
cd my-app

# 或使用 pnpm/yarn
pnpm create next-app my-app
yarn create next-app my-app
```

### 2.2 项目结构

```
my-app/
├── app/                    # App Router (推荐)
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── globals.css        # 全局样式
│   ├── (auth)/            # 路由组
│   │   ├── login/
│   │   └── register/
│   ├── api/               # API 路由
│   │   └── users/
│   │       └── route.ts
│   └── blog/
│       ├── [slug]/        # 动态路由
│       │   └── page.tsx
│       └── page.tsx
├── components/            # 组件
├── lib/                   # 工具库
├── public/                # 静态资源
├── styles/                # 样式文件
├── types/                 # TypeScript 类型
├── next.config.js         # Next.js 配置
├── tsconfig.json          # TypeScript 配置
├── package.json
└── README.md
```

### 2.3 配置文件

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化
  images: {
    domains: ['example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },

  // 重定向
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },

  // 重写
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

---

## 三、路由系统

### 3.1 文件系统路由

```
app/
├── page.tsx              # /
├── about/
│   └── page.tsx          # /about
├── blog/
│   ├── page.tsx          # /blog
│   └── [slug]/
│       └── page.tsx      # /blog/[slug]
└── products/
    ├── [category]/
    │   └── [id]/
    │       └── page.tsx  # /products/[category]/[id]
```

### 3.2 特殊文件

```typescript
// layout.tsx - 布局组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>Header</header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  )
}

// loading.tsx - 加载状态
export default function Loading() {
  return <div>Loading...</div>
}

// error.tsx - 错误边界
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// not-found.tsx - 404 页面
export default function NotFound() {
  return <div>Page not found</div>
}

// template.tsx - 模板(每次导航重新挂载)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// route.ts - API 路由
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' })
}
```

### 3.3 动态路由

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  return <h1>Post: {params.slug}</h1>
}

// app/products/[category]/[id]/page.tsx
export default function Product({
  params,
}: {
  params: { category: string; id: string }
}) {
  return (
    <div>
      <h1>Category: {params.category}</h1>
      <p>Product ID: {params.id}</p>
    </div>
  )
}
```

### 3.4 捕获所有路由

```typescript
// app/docs/[...slug]/page.tsx
export default function Docs({
  params,
}: {
  params: { slug: string[] }
}) {
  return <div>Slug: {params.slug.join('/')}</div>
}

// 匹配:
// /docs/hello -> ['hello']
// /docs/a/b/c -> ['a', 'b', 'c']
```

### 3.5 可选捕获路由

```typescript
// app/blog/[[...slug]]/page.tsx
export default function Blog({
  params,
}: {
  params: { slug?: string[] }
}) {
  return <div>Slug: {params.slug?.join('/') || 'home'}</div>
}

// 匹配:
// /blog -> undefined
// /blog/hello -> ['hello']
```

### 3.6 路由组

```
app/
├── (marketing)/          # 路由组(不影响 URL)
│   ├── about/
│   │   └── page.tsx     # /about
│   └── contact/
│       └── page.tsx     # /contact
└── (shop)/
    ├── products/
    │   └── page.tsx     # /products
    └── cart/
        └── page.tsx     # /cart
```

### 3.7 并行路由

```typescript
// app/dashboard/@analytics/page.tsx
export default function Analytics() {
  return <div>Analytics Panel</div>
}

// app/dashboard/@revenue/page.tsx
export default function Revenue() {
  return <div>Revenue Panel</div>
}

// app/dashboard/layout.tsx
export default function DashboardLayout({
  analytics,
  revenue,
  children,
}: {
  analytics: React.ReactNode
  revenue: React.ReactNode
  children: React.ReactNode
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

### 3.8 拦截路由

```typescript
// app/@modal/(.)photo/[id]/page.tsx
// 拦截 /photo/123,显示模态框而不是完整页面
export default function PhotoModal({
  params,
}: {
  params: { id: string }
}) {
  return <Modal>Photo {params.id}</Modal>
}

// 修饰符:
// (.) - 同级
// (..) - 上一级
// (...) - 根目录
```

### 3.9 导航

```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()

  return (
    <nav>
      {/* Link 组件 */}
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog/post-1">Blog Post</Link>

      {/* 编程式导航 */}
      <button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>

      {/* 替换当前历史 */}
      <button onClick={() => router.replace('/login')}>
        Replace
      </button>

      {/* 后退 */}
      <button onClick={() => router.back()}>Back</button>

      {/* 前进 */}
      <button onClick={() => router.forward()}>Forward</button>

      {/* 刷新 */}
      <button onClick={() => router.refresh()}>Refresh</button>
    </nav>
  )
}
```

---

## 四、数据获取

### 4.1 服务端组件数据获取

```typescript
// app/blog/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 4.2 缓存策略

```typescript
// 默认缓存(类似 SSG)
fetch('https://api.example.com/data')

// 不缓存(类似 SSR)
fetch('https://api.example.com/data', { cache: 'no-store' })

// 定时重新验证(类似 ISR)
fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // 60秒
})

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 强制静态生成
export const dynamic = 'force-static'
```

### 4.3 generateMetadata

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  }
}
```

### 4.4 generateStaticParams

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  // ...
}
```

### 4.5 Server Actions

```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  // 数据库操作
  await db.user.create({ name, email })

  return { success: true }
}

export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } })
  return { success: true }
}
```

### 4.6 表单中使用 Server Actions

```typescript
// app/users/page.tsx
import { createUser } from '../actions'

export default function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit">Create User</button>
    </form>
  )
}
```

### 4.7 useActionState

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
```

---

## 五、服务端组件

### 5.1 服务端组件(RSC)

```typescript
// app/page.tsx (默认是服务端组件)
export default async function HomePage() {
  // 可以直接访问后端资源
  const data = await db.query('SELECT * FROM users')

  return <div>{data}</div>
}

// ✅ 可以在服务端组件中:
// - 访问数据库
// - 读取文件系统
// - 使用服务端-only 的库
// - 保持敏感信息在服务端

// ❌ 不能在服务端组件中:
// - 使用 useState, useEffect
// - 使用浏览器 API
// - 添加事件处理器
```

### 5.2 客户端组件

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count])

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}

// ✅ 可以在客户端组件中:
// - 使用 React Hooks
// - 使用浏览器 API
// - 添加事件处理器
// - 使用 state 和 effects

// ❌ 不能在客户端组件中:
// - 直接访问数据库
// - 读取文件系统
```

### 5.3 组合模式

```typescript
// app/page.tsx (服务端组件)
import ClientComponent from './ClientComponent'

export default function Page() {
  // 服务端数据
  const data = fetchData()

  return (
    <div>
      <h1>{data.title}</h1>
      {/* 传递数据给客户端组件 */}
      <ClientComponent initialData={data} />
    </div>
  )
}

// app/ClientComponent.tsx
'use client'

export default function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData)

  return <div>{/* 交互逻辑 */}</div>
}
```

---

## 六、客户端组件

### 6.1 React Hooks

```typescript
'use client'

import { useState, useEffect, useContext } from 'react'

export default function Example() {
  const [state, setState] = useState(0)

  useEffect(() => {
    console.log('Mounted')
    return () => console.log('Unmounted')
  }, [])

  return <div>{state}</div>
}
```

### 6.2 Context

```typescript
// app/context/ThemeContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

### 6.3 自定义 Hooks

```typescript
// hooks/useLocalStorage.ts
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: any) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

---

## 七、API 路由

### 7.1 Route Handlers

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

// GET
export async function GET(request: Request) {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

// POST
export async function POST(request: Request) {
  const body = await request.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}

// PUT
export async function PUT(request: Request) {
  const body = await request.json()
  const user = await db.user.update({
    where: { id: body.id },
    data: body,
  })
  return NextResponse.json(user)
}

// DELETE
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

### 7.2 动态 API 路由

```typescript
// app/api/users/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const user = await db.user.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(user)
}
```

### 7.3 查询参数

```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'

  const results = await search(query, { page, limit })

  return NextResponse.json(results)
}
```

### 7.4 请求头

```typescript
export async function GET(request: Request) {
  const headers = request.headers

  const authorization = headers.get('authorization')
  const contentType = headers.get('content-type')

  // 验证 token
  if (!authorization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ message: 'Success' })
}
```

### 7.5 Cookies

```typescript
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()

  // 获取 cookie
  const token = cookieStore.get('token')

  // 设置 cookie
  cookieStore.set('theme', 'dark', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // 删除 cookie
  cookieStore.delete('session')

  return NextResponse.json({ message: 'Success' })
}
```

### 7.6 中间件保护 API

```typescript
// app/api/protected/route.ts
import { getToken } from 'next-auth/jwt'

export async function GET(request: Request) {
  const token = await getToken({ req: request })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 受保护的数据
  return NextResponse.json({ data: 'Protected content' })
}
```

---

## 八、样式方案

### 8.1 CSS Modules

```typescript
// components/Button.module.css
.button {
  padding: 10px 20px;
  background: blue;
  color: white;
}

.button:hover {
  background: darkblue;
}
```

```typescript
// components/Button.tsx
import styles from './Button.module.css'

export default function Button({ children }) {
  return <button className={styles.button}>{children}</button>
}
```

### 8.2 Tailwind CSS

```bash
# 安装
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```typescript
// app/page.tsx
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-blue-600">
        Hello Next.js
      </h1>
    </div>
  )
}
```

### 8.3 CSS-in-JS

```typescript
// 使用 styled-jsx (内置)
export default function Page() {
  return (
    <div>
      <h1>Hello World</h1>
      <style jsx>{`
        h1 {
          color: blue;
          font-size: 2rem;
        }
      `}</style>
    </div>
  )
}
```

### 8.4 Sass/SCSS

```bash
npm install sass
```

```scss
// styles/variables.scss
$primary-color: #0070f3;
$font-size-large: 1.5rem;
```

```scss
// styles/global.scss
@import './variables';

body {
  color: $primary-color;
  font-size: $font-size-large;
}
```

---

## 九、图片优化

### 9.1 Image 组件

```typescript
import Image from 'next/image'

export default function Page() {
  return (
    <div>
      {/* 本地图片 */}
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={800}
        height={600}
        priority // 优先加载
      />

      {/* 远程图片 */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Remote photo"
        width={400}
        height={300}
      />

      {/* 响应式图片 */}
      <Image
        src="/responsive.jpg"
        alt="Responsive"
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* 填充父容器 */}
      <div className="relative w-full h-96">
        <Image
          src="/fill.jpg"
          alt="Fill"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  )
}
```

### 9.2 图片配置

```javascript
// next.config.js
module.exports = {
  images: {
    // 允许的域名
    domains: ['example.com', 'cdn.example.com'],

    // 更灵活的配置
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
        port: '',
        pathname: '/images/**',
      },
    ],

    // 设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200],

    // 图像格式
    formats: ['image/webp', 'image/avif'],
  },
}
```

### 9.3 字体优化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

```typescript
// 使用本地字体
import localFont from 'next/font/local'

const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
})
```

---

## 十、元数据管理

### 10.1 Metadata API

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'A Next.js application',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'John Doe' }],
  creator: 'John Doe',
  publisher: 'My Company',

  // Open Graph
  openGraph: {
    title: 'My App',
    description: 'A Next.js application',
    url: 'https://example.com',
    siteName: 'My App',
    images: [
      {
        url: 'https://example.com/og.jpg',
        width: 1200,
        height: 630,
        alt: 'OG Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'My App',
    description: 'A Next.js application',
    images: ['https://example.com/twitter.jpg'],
  },

  // 图标
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // 其他元数据
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### 10.2 动态元数据

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}
```

### 10.3 viewport

```typescript
// app/layout.tsx
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0070f3',
}
```

---

## 十一、中间件

### 11.1 基础中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 添加自定义 header
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')

  return response
}

// 配置匹配路径
export const config = {
  matcher: ['/api/:path*', '/about/:path*'],
}
```

### 11.2 认证中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  // 需要认证的路径
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

### 11.3 国际化中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 检查是否已有 locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  if (pathnameIsMissingLocale) {
    // 重定向到默认 locale
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 11.4 速率限制

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, [])
  }

  const timestamps = rateLimit.get(ip)
  const recentRequests = timestamps.filter((ts: number) => now - ts < 60000)

  if (recentRequests.length >= 10) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  return NextResponse.next()
}
```

---

## 十二、性能优化

### 12.1 代码分割

```typescript
// 动态导入
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 禁用 SSR
})

export default function Page() {
  return <HeavyComponent />
}
```

### 12.2 懒加载

```typescript
// 图片懒加载
<Image src="/image.jpg" alt="Image" width={800} height={600} loading="lazy" />

// 组件懒加载
const Chart = dynamic(() => import('../components/Chart'), {
  loading: () => <Skeleton />,
})
```

### 12.3 缓存策略

```typescript
// 数据缓存
fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // 60秒缓存
})

// 路由缓存
export const revalidate = 60 // ISR

// 完全动态
export const dynamic = 'force-dynamic'

// 完全静态
export const dynamic = 'force-static'
```

### 12.4 预取

```typescript
// Link 自动预取视口内的链接
<Link href="/about">About</Link>

// 禁用预取
<Link href="/about" prefetch={false}>About</Link>

// 编程式预取
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/about')
```

### 12.5 分析工具

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 12.6 Bundle 分析

```bash
# 分析 bundle 大小
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})

# 运行
ANALYZE=true npm run build
```

---

## 十三、部署发布

### 13.1 Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 13.2 自建部署

```bash
# 构建
npm run build

# 启动
npm start

# 或使用 PM2
pm2 start npm --name "next-app" -- start
```

### 13.3 Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
}
```

### 13.4 环境变量

```bash
# .env.local (本地开发)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=your_api_key

# .env.production (生产环境)
DATABASE_URL=postgresql://user:pass@production:5432/db
API_KEY=production_api_key

# .env (所有环境)
NEXT_PUBLIC_ANALYTICS_ID=abc123
```

```typescript
// 使用环境变量
const dbUrl = process.env.DATABASE_URL
const apiKey = process.env.API_KEY

// 客户端可访问(必须以 NEXT_PUBLIC_ 开头)
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID
```

---

## 十四、最佳实践

### 14.1 项目结构

```
app/
├── (auth)/              # 路由组
├── (marketing)/
├── api/                 # API 路由
├── blog/
├── dashboard/
├── layout.tsx          # 根布局
├── page.tsx            # 首页
└── globals.css

components/             # 通用组件
├── ui/                 # UI 组件
├── forms/              # 表单组件
└── layout/             # 布局组件

lib/                    # 工具库
├── db.ts              # 数据库连接
├── utils.ts           # 工具函数
└── validations.ts     # 验证 schema

hooks/                  # 自定义 Hooks
types/                  # TypeScript 类型
styles/                 # 样式文件
public/                 # 静态资源
```

### 14.2 性能优化清单

1. **图片优化**
   - 使用 Next.js Image 组件
   - 指定宽度和高度
   - 使用适当的格式(WebP/AVIF)
   - 实现懒加载

2. **字体优化**
   - 使用 next/font
   - 预加载关键字体
   - 使用 font-display: swap

3. **代码优化**
   - 动态导入重型组件
   - 移除未使用的依赖
   - 启用 Tree Shaking

4. **缓存策略**
   - 合理使用 ISR
   - 配置 revalidate 时间
   - 使用 SWR/TanStack Query

5. **SEO 优化**
   - 完善 metadata
   - 使用语义化 HTML
   - 生成 sitemap
   - 配置 robots.txt

### 14.3 安全最佳实践

1. **输入验证**

   ```typescript
   import { z } from 'zod'

   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   })

   const data = schema.parse(input)
   ```

2. **CSRF 保护**

   ```typescript
   // 使用 SameSite cookies
   cookies().set('token', value, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
   })
   ```

3. **XSS 防护**
   - 避免 dangerouslySetInnerHTML
   - 使用 DOMPurify 清理 HTML
   - 转义用户输入

4. **SQL 注入防护**
   - 使用 ORM/Query Builder
   - 参数化查询
   - 避免拼接 SQL

### 14.4 测试策略

```bash
# 安装测试工具
npm install -D jest @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

describe('Page', () => {
  it('renders heading', () => {
    render(<Page />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
```

### 14.5 监控和日志

1. **错误追踪**
   - Sentry
   - LogRocket
   - Datadog

2. **性能监控**
   - Vercel Analytics
   - Web Vitals
   - Lighthouse CI

3. **日志记录**

   ```typescript
   // lib/logger.ts
   export function log(message: string, data?: any) {
     console.log(`[${new Date().toISOString()}] ${message}`, data)
   }

   export function error(message: string, err?: Error) {
     console.error(`[${new Date().toISOString()}] ERROR: ${message}`, err)
   }
   ```

### 14.6 开发工作流

1. **Git 工作流**
   - 使用 conventional commits
   - 分支策略(GitFlow/GitHub Flow)
   - Code Review

2. **CI/CD**
   - 自动化测试
   - 自动化部署
   - 预览部署

3. **文档**
   - README.md
   - API 文档
   - 组件文档(Storybook)

---

## 附录

### A. 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动
npm start

# 代码检查
npm run lint

# 格式化
npm run format

# 类型检查
npm run type-check
```

### B. 学习资源

- **官方文档**: https://nextjs.org/docs
- **Learn Next.js**: https://nextjs.org/learn
- **GitHub**: https://github.com/vercel/next.js
- **社区**: https://github.com/vercel/next.js/discussions
- **Awesome Next.js**: https://github.com/unicodeveloper/awesome-nextjs

### C. 生态系统

- **UI 框架**: shadcn/ui, Chakra UI, Mantine
- **状态管理**: Zustand, Jotai, Redux
- **数据获取**: SWR, TanStack Query, RTK Query
- **表单**: React Hook Form, Formik
- **认证**: NextAuth.js, Clerk, Supabase Auth
- **ORM**: Prisma, Drizzle, Kysely
- **部署**: Vercel, Netlify, Railway

---

**提示**: 本手册涵盖了 Next.js 日常开发中最常用的功能和最佳实践,建议结合实际项目需求深入学习和实践。
