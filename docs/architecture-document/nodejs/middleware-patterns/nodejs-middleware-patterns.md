---
title: Node.js 中间件与管道架构
order: 30
---

# Node.js 中间件与管道架构

中间件是 Node.js Web 框架的核心抽象。理解中间件的设计模式、组合方式和性能影响，是构建健壮后端服务的关键。

本文系统梳理 Node.js 中间件架构的演进、常见模式、管道设计与工程化最佳实践。

---

## 一、中间件模型演进

### Express 线性模型

```
请求 → mw1 → mw2 → mw3 → handler → mw4 → mw5 → 响应
         ↓       ↓
       next()  next()
```

Express 中间件是线性管道：每个中间件调用 `next()` 将控制权传递给下一个。错误通过 `next(err)` 跳转到错误处理中间件。

```typescript
// Express 中间件签名
type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void

// 示例
app.use(async (req, res, next) => {
  const start = Date.now()
  await next() // 无法在 next() 之后执行后置逻辑
  // 实际上 Express 的 next() 是异步的，后置代码不一定能正确执行
})
```

### Koa 洋葱模型

```
请求 → 外层前置 → 内层前置 → handler → 内层后置 → 外层后置 → 响应
```

Koa 的洋葱模型通过 `await next()` 实现了真正的前置/后置处理：

```typescript
// Koa 中间件签名
type KoaMiddleware = (ctx: Context, next: () => Promise<void>) => Promise<void>

// 洋葱模型示例
app.use(async (ctx, next) => {
  // 前置：请求进入时执行
  const start = Date.now()
  console.log(`→ ${ctx.method} ${ctx.url}`)

  await next() // 等待内层中间件全部执行完毕

  // 后置：响应返回前执行
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  console.log(`← ${ctx.method} ${ctx.url} [${ms}ms]`)
})
```

### 模型对比

| 维度     | Express 线性模型  | Koa 洋葱模型                |
| -------- | ----------------- | --------------------------- |
| 后置处理 | 不支持（需 hack） | 原生支持（await next 之后） |
| 错误传播 | next(err) 跳转    | throw 冒泡到外层            |
| 上下文   | req/res 分离      | ctx 统一对象                |
| 异步安全 | 需小心处理        | async/await 天然安全        |
| 性能     | 略高（简单回调）  | 略低（Promise 链开销）      |

---

## 二、中间件分类与职责

### 按职责分层

```
请求管道：
┌─────────────────────────────────────────────┐
│  1. 基础设施层                                │
│     ├── 请求日志（request-logger）            │
│     ├── CORS 处理                            │
│     └── 请求 ID 注入                         │
├─────────────────────────────────────────────┤
│  2. 安全层                                    │
│     ├── Helmet（安全头）                      │
│     ├── Rate Limiting（限流）                 │
│     ├── IP 白名单                            │
│     └── CSRF 防护                            │
├─────────────────────────────────────────────┤
│  3. 解析层                                    │
│     ├── Body Parser（JSON / URL-encoded）     │
│     ├── Cookie Parser                        │
│     └── 文件上传解析（multipart）             │
├─────────────────────────────────────────────┤
│  4. 认证层                                    │
│     ├── JWT 验证                             │
│     ├── Session 验证                         │
│     └── API Key 验证                         │
├─────────────────────────────────────────────┤
│  5. 业务层                                    │
│     ├── 参数校验（zod / joi）                 │
│     ├── 权限检查                             │
│     └── 路由处理器                           │
├─────────────────────────────────────────────┤
│  6. 响应层                                    │
│     ├── 响应压缩（gzip / brotli）             │
│     ├── ETag 生成                            │
│     └── 响应缓存                             │
└─────────────────────────────────────────────┘
```

---

## 三、常见中间件架构模式

### 模式 1：认证守卫

```typescript
// JWT 认证中间件
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: { id: string; role: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '缺少认证令牌' } })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: '令牌无效或已过期' } })
  }
}

// 角色权限中间件
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '权限不足' } })
    }
    next()
  }
}

// 使用
app.get('/api/admin/users', authMiddleware, requireRole('admin'), adminController.getUsers)
```

### 模式 2：请求限流

```typescript
import rateLimit from 'express-rate-limit'

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每 IP 最多 100 次
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT', message: '请求过于频繁，请稍后重试' } },
})

// 登录接口限流（更严格）
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // 成功登录不计入限流
  message: { error: { code: 'LOGIN_RATE_LIMIT', message: '登录尝试过多，请 15 分钟后再试' } },
})

app.use('/api', globalLimiter)
app.post('/api/auth/login', loginLimiter, authController.login)
```

### 模式 3：请求日志与追踪

```typescript
import { randomUUID } from 'crypto'

// 请求 ID + 日志中间件
export function requestLogger() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID()
    const start = performance.now()

    // 注入请求 ID 到上下文
    ;(req as any).requestId = requestId
    res.setHeader('X-Request-Id', requestId)

    // 使用 Koa 洋葱模型可以优雅地记录响应时间
    console.log(`[${requestId}] → ${req.method} ${req.url}`)

    // 监听响应完成
    res.on('finish', () => {
      const duration = (performance.now() - start).toFixed(2)
      console.log(`[${requestId}] ← ${res.statusCode} ${req.method} ${req.url} [${duration}ms]`)
    })

    next()
  }
}
```

### 模式 4：参数校验管道

```typescript
import { z, ZodSchema } from 'zod'

// 通用校验中间件工厂
export function validate(schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, any> = {}

    if (schema.body) {
      const result = schema.body.safeParse(req.body)
      if (!result.success) errors.body = result.error.format()
      else (req as any).validatedBody = result.data
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query)
      if (!result.success) errors.query = result.error.format()
      else (req as any).validatedQuery = result.data
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params)
      if (!result.success) errors.params = result.error.format()
      else (req as any).validatedParams = result.data
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: '参数校验失败', details: errors },
      })
    }

    next()
  }
}

// 使用
const createUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
})

app.post('/api/users', validate({ body: createUserSchema }), userController.create)
```

### 模式 5：响应压缩

```typescript
import compression from 'compression'

// 智能压缩：只对大于阈值的响应启用
app.use(
  compression({
    threshold: 1024, // 小于 1KB 不压缩
    filter: (req, res) => {
      // 排除已压缩的内容类型
      if (req.headers['x-no-compression']) return false
      return compression.filter(req, res)
    },
  }),
)
```

---

## 四、NestJS 管道架构

NestJS 提供了比 Express 中间件更精细的请求处理管道：

```
请求 → Middleware → Guard → Interceptor(前) → Pipe → Handler → Interceptor(后) → Filter → 响应
```

### 各层职责

| 层              | 职责             | 典型用途                   |
| --------------- | ---------------- | -------------------------- |
| **Middleware**  | Express 级别处理 | CORS、日志、Body 解析      |
| **Guard**       | 认证/授权        | JWT 验证、角色检查         |
| **Interceptor** | 请求/响应转换    | 缓存、超时、日志、数据转换 |
| **Pipe**        | 数据校验/转换    | 参数校验、类型转换         |
| **Filter**      | 异常处理         | 统一错误格式               |

### 拦截器示例

```typescript
// 响应转换拦截器：统一包装响应格式
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        timestamp: new Date().toISOString(),
      })),
    )
  }
}

// 超时拦截器
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(timeout(5000))
  }
}

// 缓存拦截器
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = context.getHandler().name
    const cached = cache.get(key)
    if (cached) return of(cached)

    return next.handle().pipe(
      tap((data) => cache.set(key, data, 60)), // 缓存 60 秒
    )
  }
}
```

---

## 五、错误处理架构

### 异步错误捕获

```typescript
// Express 的异步错误陷阱
// ❌ 错误：async 中间件中的错误不会自动被 Express 捕获
app.get('/users', async (req, res) => {
  const user = await db.findUser(req.params.id) // 如果抛出异常，Express 不会处理
  res.json(user)
})

// ✅ 修复 1：手动 try/catch
app.get('/users', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// ✅ 修复 2：包装器（推荐）
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next)

app.get(
  '/users',
  asyncHandler(async (req, res) => {
    const user = await db.findUser(req.params.id)
    res.json(user)
  }),
)

// ✅ 修复 3：express-async-errors（一行代码全局修复）
import 'express-async-errors'
```

### 全局错误处理

```typescript
// 统一错误处理中间件（必须注册在所有路由之后）
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 1. 区分已知错误和未知错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }

  // 2. 未知错误：记录完整日志
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: (req as any).requestId,
    path: req.path,
    method: req.method,
  })

  // 3. 返回通用错误（不暴露内部细节）
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
  })
})
```

---

## 六、中间件性能考量

### 中间件顺序优化

```typescript
// ✅ 推荐顺序：从快到慢、从通用到专用
app.use(helmet()) // 1. 设置安全头（极快）
app.use(compression()) // 2. 响应压缩（快）
app.use(cors()) // 3. CORS 处理（快）
app.use(requestLogger()) // 4. 请求日志（快）
app.use(express.json()) // 5. Body 解析（中等）
app.use(rateLimiter) // 6. 限流（需查存储）
app.use(authMiddleware) // 7. 认证（需验证 Token）
app.use('/api', apiRouter) // 8. 路由处理（最慢）
```

### 避免的性能陷阱

| 陷阱           | 说明                              | 解决方案                 |
| -------------- | --------------------------------- | ------------------------ |
| 全局 Body 解析 | 所有请求都解析 JSON，包括静态文件 | 只在 API 路由上启用      |
| 同步阻塞       | 中间件中执行同步操作              | 使用 async 中间件        |
| 重复校验       | 多个中间件重复校验同一数据        | 校验一次，结果挂载到 req |
| 无缓存的限流   | 每次请求都查 Redis                | 使用内存缓存 + 定期同步  |

---

## 七、中间件设计最佳实践

### 实践 1：单一职责

```typescript
// ❌ 一个中间件做太多事
app.use(async (req, res, next) => {
  // 日志 + 认证 + 限流 + 校验...
})

// ✅ 每个中间件只做一件事
app.use(requestLogger())
app.use(authMiddleware())
app.use(rateLimiter())
app.use(validateBody(userSchema))
```

### 实践 2：条件执行

```typescript
// 只在特定路径执行
app.use('/api', authMiddleware) // 只有 /api 开头的路由需要认证
app.use('/admin', requireRole('admin')) // 只有 /admin 路径检查管理员角色

// 动态跳过
app.use(
  rateLimit({
    skip: (req) => req.path === '/health', // 健康检查不限流
  }),
)
```

### 实践 3：可组合性

```typescript
// 中间件组合器
function compose(...middlewares: Function[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0
    const dispatch = () => {
      if (index >= middlewares.length) return next()
      const mw = middlewares[index++]
      return (mw as any)(req, res, dispatch)
    }
    return dispatch()
  }
}

// 使用：将多个中间件组合为一个
const apiMiddleware = compose(authMiddleware, validateBody(userSchema), requireRole('user'))

app.post('/api/users', apiMiddleware, userController.create)
```

---

## 八、与面试文档的关系

| 面试文档                                                                    | 面试视角                           | 本文视角                       |
| --------------------------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| [Node.js Web 框架对比](../../../interview/engineering/nodejs-web-framework) | 框架性能基准、中间件模型原理       | 工程化中间件设计模式与管道架构 |
| [Node.js 运行时](../../../interview/javascript/nodejs-runtime)              | libuv、Stream、Worker Threads 原理 | 中间件在运行时层面的执行模型   |
