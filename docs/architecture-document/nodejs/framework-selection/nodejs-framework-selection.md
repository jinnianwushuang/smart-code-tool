---
title: Node.js 框架架构选型
order: 20
---

# Node.js 框架架构选型

Node.js 框架生态经历了从 Express 的极简主义到 NestJS 的企业级架构的演进。2026 年，Fastify 和 Hono 在性能赛道崛起，全栈框架 Next.js 和 Nuxt.js 模糊了前后端边界。

本文从**架构设计**角度，系统梳理 Node.js 框架的选型决策、迁移路径与工程化实践。

> **面试视角**：框架对比的原理分析请参考 [Node.js Web 框架对比与 API 设计](../../../interview/engineering/nodejs-web-framework)。本文侧重工程选型和项目级架构决策。

---

## 一、框架全景图

### 后端 API 框架

| 框架        | 架构风格             | 性能 | TypeScript      | 适用规模   | 核心特色                       |
| ----------- | -------------------- | ---- | --------------- | ---------- | ------------------------------ |
| **Express** | 极简中间件链         | 中   | 需手动配置      | 小型/原型  | 生态最大、中间件最丰富         |
| **Koa**     | 洋葱模型中间件       | 中   | 需手动配置      | 小型/中型  | 异步原生支持、中间件精简       |
| **Fastify** | Schema 驱动 + 插件   | 极高 | 原生支持        | 中大型/API | JSON Schema 校验、高性能       |
| **NestJS**  | 模块化 + DI + 装饰器 | 中   | 原生 TypeScript | 大型企业级 | Angular 风格、完整架构体系     |
| **Hono**    | Web Standard API     | 极高 | 原生支持        | Edge/全栈  | 跨运行时（Node/Deno/Bun/Edge） |
| **Egg.js**  | 约定优于配置         | 中   | 支持            | 企业级     | 内置加载器、插件机制           |

### 全栈框架

| 框架          | 基座                 | 渲染模式              | TypeScript | 适用场景             |
| ------------- | -------------------- | --------------------- | ---------- | -------------------- |
| **Next.js**   | 自有（可接 Express） | SSR / SSG / ISR / RSC | 原生       | React 全栈应用       |
| **Nuxt.js**   | Nitro（基于 H3）     | SSR / SSG / Hybrid    | 原生       | Vue 全栈应用         |
| **Remix**     | Express / 适配器     | SSR + 嵌套路由        | 原生       | React 全栈、Web 标准 |
| **SvelteKit** | Vite + adapter       | SSR / SSG             | 原生       | Svelte 全栈应用      |

---

## 二、选型决策矩阵

### 后端 API 框架决策树

```
你的项目需要什么？
│
├── 快速原型 / 个人项目 / 简单 API
│   ├── 团队熟悉 Express → Express
│   └── 追求更现代体验 → Hono
│
├── 中型 API 服务（10-50 个端点）
│   ├── 性能优先 → Fastify
│   └── 灵活定制中间件 → Koa
│
├── 大型企业项目（50+ 端点，多团队协作）
│   ├── 需要完整架构规范 → NestJS
│   └── 已有 Egg.js 经验 → Egg.js
│
├── 高性能微服务 / 网关
│   └── Fastify 或 Hono
│
├── 边缘计算 / 跨平台
│   └── Hono（Node / Deno / Bun / Cloudflare Workers）
│
└── 全栈 Web 应用
    ├── React 技术栈 → Next.js
    └── Vue 技术栈 → Nuxt.js
```

### 多维度评分

| 维度           | Express | Koa  | Fastify | NestJS | Hono  | Egg.js |
| -------------- | ------- | ---- | ------- | ------ | ----- | ------ |
| **上手速度**   | ★★★★★   | ★★★★ | ★★★     | ★★     | ★★★★  | ★★★    |
| **TypeScript** | ★★      | ★★   | ★★★★    | ★★★★★  | ★★★★★ | ★★★    |
| **性能**       | ★★      | ★★   | ★★★★★   | ★★     | ★★★★★ | ★★     |
| **生态丰富度** | ★★★★★   | ★★★  | ★★★     | ★★★★   | ★★★   | ★★★    |
| **架构规范性** | ★       | ★    | ★★★     | ★★★★★  | ★★    | ★★★★   |
| **可测试性**   | ★★      | ★★   | ★★★     | ★★★★★  | ★★★   | ★★★    |
| **学习曲线**   | 极低    | 低   | 中      | 高     | 低    | 中     |

---

## 三、Express：经典之选

### 适用场景

- 快速原型和 MVP
- 团队新人多、需要最低学习成本
- 依赖大量 Express 中间件生态

### 现代 Express 项目模板

```typescript
// src/app.ts
import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'
import { userRouter } from './modules/user/user.router'
import { orderRouter } from './modules/order/order.router'

const app = express()

// 全局中间件
app.use(express.json({ limit: '10mb' }))
app.use(corsMiddleware)
app.use(requestLogger)

// 路由
app.use('/api/users', userRouter)
app.use('/api/orders', orderRouter)

// 健康检查
app.get('/health', (_, res) => res.json({ status: 'ok' }))

// 错误处理（必须放在最后）
app.use(errorHandler)

export { app }
```

### Express 的局限

| 问题           | 说明                                   | 解决方案                      |
| -------------- | -------------------------------------- | ----------------------------- |
| 无内置参数校验 | 需手动或引入 joi/zod                   | 配合 zod + 校验中间件         |
| 无内置 DI      | 依赖手动管理                           | typedi 或模块模式             |
| 无内置测试工具 | 需 supertest                           | supertest + vitest            |
| 回调风格遗留   | 虽然支持 async，但错误处理需 next(err) | express-async-errors 或包装器 |

---

## 四、Koa：洋葱模型的优雅

### 核心优势

Koa 由 Express 原班人马打造，核心改进是**洋葱模型中间件**和**原生 async/await 支持**。

```typescript
// Koa 洋葱模型
import Koa from 'koa'
const app = new Koa()

// 中间件执行顺序：请求 → 外层 → 内层 → 内层 → 外层 → 响应
app.use(async (ctx, next) => {
  console.log('1. 请求进入')
  await next()
  console.log('6. 响应返回')
})

app.use(async (ctx, next) => {
  console.log('2. 认证检查')
  await next()
  console.log('5. 响应处理')
})

app.use(async (ctx, next) => {
  console.log('3. 业务处理')
  ctx.body = { message: 'Hello' }
  console.log('4. 准备响应')
})
```

### Koa vs Express

| 维度       | Express          | Koa                    |
| ---------- | ---------------- | ---------------------- |
| 中间件模型 | 线性管道         | 洋葱模型（可后置处理） |
| 异步支持   | 需 next(err)     | 原生 async/await       |
| 内置功能   | 路由、静态文件等 | 极简内核，一切皆插件   |
| 路由       | 内置             | 需 @koa/router         |
| 上下文     | req/res 分离     | ctx 统一上下文         |

---

## 五、Fastify：高性能 API 首选

### 核心特色

```typescript
import Fastify from 'fastify'
import { Type } from '@sinclair/typebox'

const app = Fastify({ logger: true })

// ── Schema 驱动：请求校验 + 响应序列化 + 自动文档 ──
app.post('/users', {
  schema: {
    body: Type.Object({
      name: Type.String({ minLength: 1 }),
      email: Type.String({ format: 'email' }),
      age: Type.Optional(Type.Number({ minimum: 0 })),
    }),
    response: {
      201: Type.Object({
        id: Type.String(),
        name: Type.String(),
        email: Type.String(),
      }),
    },
  },
  handler: async (request, reply) => {
    const user = await userService.create(request.body)
    reply.status(201).send(user)
  },
})

// ── 插件系统（封装性优于 Express 中间件） ──
app.register(async (instance) => {
  instance.get('/health', async () => ({ status: 'ok' }))
})
```

### Fastify 性能优势来源

| 特性                 | 说明                                                            |
| -------------------- | --------------------------------------------------------------- |
| **Schema 编译**      | JSON Schema 预编译为函数，序列化速度比 JSON.stringify 快 2-3 倍 |
| **路由树优化**       | 使用 radix tree 路由，查找复杂度 O(log n)                       |
| **零 overhead 插件** | 插件封装不增加请求处理开销                                      |

---

## 六、NestJS：企业级架构

### 核心架构理念

NestJS 借鉴了 Angular 的架构设计，提供了完整的模块化、依赖注入和装饰器体系。

```
NestJS 架构核心：
├── Module（模块）     → 功能边界划分
├── Controller（控制器）→ 请求路由
├── Provider（提供者）  → 可注入的服务
├── Guard（守卫）      → 认证/授权
├── Interceptor（拦截器）→ 请求/响应转换
├── Pipe（管道）       → 数据校验/转换
├── Filter（过滤器）   → 异常处理
└── Middleware（中间件）→ Express 兼容
```

### 何时选择 NestJS

| 场景                              | 推荐                          |
| --------------------------------- | ----------------------------- |
| 团队 > 10 人，需要统一架构规范    | NestJS                        |
| 微服务架构（gRPC / 消息队列）     | NestJS                        |
| 需要完整的 DI 和模块化            | NestJS                        |
| 团队有 Angular / Java Spring 经验 | NestJS                        |
| 快速原型 / 小项目                 | Express / Hono（NestJS 过重） |
| 性能极度敏感                      | Fastify / Hono                |

---

## 七、Hono：新一代轻量框架

### 核心定位

Hono 是 2026 年增长最快的 Node.js 框架，主打**超轻量 + 跨运行时 + Web 标准 API**。

```typescript
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// 中间件
app.use('*', logger())
app.use('*', cors())

// 路由 + 校验
app.post(
  '/users',
  validator('json', (value, c) => {
    const parsed = userSchema.safeParse(value)
    if (!parsed.success) return c.json({ error: 'Invalid' }, 400)
    return parsed.data
  }),
  async (c) => {
    const user = await userService.create(c.req.valid('json'))
    return c.json(user, 201)
  },
)

// 同一套代码可运行在：
// - Node.js
// - Deno
// - Bun
// - Cloudflare Workers
// - AWS Lambda
```

### Hono vs Express vs Fastify

| 维度       | Hono                   | Express        | Fastify       |
| ---------- | ---------------------- | -------------- | ------------- |
| 包体积     | ~14KB                  | ~200KB         | ~500KB        |
| 性能       | 极高                   | 中             | 极高          |
| 跨运行时   | 是                     | 否（仅 Node）  | 否（仅 Node） |
| TypeScript | 原生                   | 需 @types      | 原生          |
| 中间件生态 | 中等                   | 最丰富         | 丰富          |
| 适用场景   | Edge / 轻量 API / 全栈 | 传统 Node 项目 | 高性能 API    |

---

## 八、全栈框架：Next.js vs Nuxt.js

### Next.js 架构特色

```
Next.js 架构模型：
├── App Router（文件系统路由 + 嵌套布局）
├── React Server Components（服务端组件默认）
├── Server Actions（表单提交直接调用服务端函数）
├── 数据获取（组件内直接 async/await）
├── 缓存体系（Request Memoization / Data Cache / Full Route Cache）
└── 部署（Vercel / 自托管 Node.js / Docker）
```

### Nuxt.js 架构特色

```
Nuxt.js 架构模型：
├── 文件路由（pages/ 目录自动生成路由）
├── 自动导入（组件、composables、工具函数自动可用）
├── Nitro 引擎（跨平台服务端引擎）
├── 混合渲染（SSR + SSG + ISR 按路由配置）
├── 模块系统（可扩展的模块化架构）
└── 部署（Vercel / Netlify / Node.js / Deno）
```

### 全栈框架选型

| 维度       | Next.js                   | Nuxt.js                 |
| ---------- | ------------------------- | ----------------------- |
| 前端框架   | React                     | Vue                     |
| 服务端引擎 | 自有                      | Nitro（基于 H3）        |
| 数据获取   | Server Components / fetch | useFetch / useAsyncData |
| API 路由   | Route Handlers            | server/api/             |
| 部署平台   | Vercel 优先               | 多平台均衡              |
| 生态规模   | 更大                      | 中等但完善              |

---

## 九、框架迁移路径

### Express → Fastify

```typescript
// Express
app.get('/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id)
  res.json(user)
})

// Fastify（几乎相同的 API）
app.get('/users/:id', async (request, reply) => {
  const user = await userService.findById(request.params.id)
  return reply.send(user)
})
```

### Express → NestJS

NestJS 底层可选择 Express 或 Fastify 作为 HTTP 引擎，迁移可分步：

1. 将 Express 路由逐步转为 NestJS Controller
2. 将中间件转为 NestJS Guard / Interceptor
3. 将手动 DI 转为 NestJS 内置 DI
4. 引入 Module 划分功能边界

### Express → Hono

```typescript
// Express
import express from 'express'
const app = express()
app.get('/users', (req, res) => res.json(users))

// Hono
import { Hono } from 'hono'
const app = new Hono()
app.get('/users', (c) => c.json(users))
```

---

## 十、选型决策速查表

| 你的情况                      | 推荐                         |
| ----------------------------- | ---------------------------- |
| 大前端工程师，写个 API 服务   | Hono 或 Express              |
| 需要完整的后端架构规范        | NestJS                       |
| 做 React 全栈应用             | Next.js                      |
| 做 Vue 全栈应用               | Nuxt.js                      |
| 高性能 API / 微服务           | Fastify                      |
| 边缘计算 / Cloudflare Workers | Hono                         |
| 维护 Egg.js 老项目            | 考虑迁移到 NestJS 或 Fastify |
| 团队有 Java Spring 背景       | NestJS                       |
| 快速 MVP / 原型验证           | Express 或 Hono              |
