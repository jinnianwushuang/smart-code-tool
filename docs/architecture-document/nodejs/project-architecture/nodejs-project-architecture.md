---
title: Node.js 项目架构与分层规范
order: 10
---

# Node.js 项目架构与分层规范

Node.js 项目的架构设计随着项目规模增长，需要从"一个 app.js 搞定"演进到清晰的分层架构。本文系统梳理 Node.js 项目的目录结构设计、分层模式、依赖注入与模块化实践。

---

## 一、项目架构演进路径

```
阶段 1：单文件（Demo / 原型）
├── app.js              ← 路由 + 逻辑 + DB 全在一起

阶段 2：路由分离（小型项目）
├── src/
│   ├── app.js
│   ├── routes/
│   └── middleware/

阶段 3：分层架构（中型项目）
├── src/
│   ├── controllers/    ← 请求处理
│   ├── services/       ← 业务逻辑
│   ├── repositories/   ← 数据访问
│   ├── models/         ← 数据模型
│   ├── middleware/      ← 中间件
│   └── config/         ← 配置

阶段 4：模块化分层（大型项目）
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.module.ts
│   │   └── order/
│   └── shared/         ← 跨模块共享

阶段 5：Monorepo（超大型 / 微服务）
├── packages/
│   ├── api-gateway/
│   ├── user-service/
│   ├── order-service/
│   └── shared-lib/
```

---

## 二、分层架构详解

### 三层标准结构

```
┌─────────────────────────────────────────────┐
│  Controller Layer（控制器层）                 │
│  职责：接收请求、参数校验、调用 Service、返回响应 │
│  规则：不包含业务逻辑，只做编排                 │
├─────────────────────────────────────────────┤
│  Service Layer（服务层）                      │
│  职责：核心业务逻辑、事务管理、跨模块协调       │
│  规则：不关心 HTTP 细节，可独立测试             │
├─────────────────────────────────────────────┤
│  Repository Layer（数据访问层）               │
│  职责：数据库操作、缓存读写、外部 API 调用      │
│  规则：只负责数据的存取，不包含业务判断          │
└─────────────────────────────────────────────┘
```

### Express 分层示例

```typescript
// ── Repository 层 ──
// src/repositories/user-repository.ts
import { prisma } from '../lib/prisma'
import type { User, CreateUserDto } from '../models/user'

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findAll(skip: number, take: number): Promise<User[]> {
    return prisma.user.findMany({ skip, take })
  }

  async create(data: CreateUserDto): Promise<User> {
    return prisma.user.create({ data })
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

// ── Service 层 ──
// src/services/user-service.ts
import { UserRepository } from '../repositories/user-repository'
import { AppError } from '../errors/app-error'

export class UserService {
  private repo = new UserRepository()

  async getUser(id: string) {
    const user = await this.repo.findById(id)
    if (!user) throw new AppError('用户不存在', 404)
    return user
  }

  async createUser(data: CreateUserDto) {
    // 业务校验
    const existing = await this.repo.findByEmail(data.email)
    if (existing) throw new AppError('邮箱已注册', 409)

    return this.repo.create(data)
  }
}

// ── Controller 层 ──
// src/controllers/user-controller.ts
import { Request, Response, Next } from 'express'
import { UserService } from '../services/user-service'

const userService = new UserService()

export class UserController {
  static async getById(req: Request, res: Response, next: Next) {
    try {
      const user = await userService.getUser(req.params.id)
      res.json({ data: user })
    } catch (err) {
      next(err)
    }
  }

  static async create(req: Request, res: Response, next: Next) {
    try {
      const user = await userService.createUser(req.body)
      res.status(201).json({ data: user })
    } catch (err) {
      next(err)
    }
  }
}
```

### NestJS 分层（内置依赖注入）

```typescript
// ── Repository ──
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}

// ── Service ──
@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string) {
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }
}

// ── Controller ──
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id)
  }
}

// ── Module（注册依赖） ──
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

---

## 三、依赖注入方案

### 手动注入（Express / Koa）

```typescript
// src/container.ts — 简单的服务定位器
class Container {
  private services = new Map<string, any>()

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory)
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name)
    if (!factory) throw new Error(`Service ${name} not registered`)
    return factory()
  }
}

export const container = new Container()

// 注册
container.register('userService', () => new UserService(new UserRepository()))
container.register(
  'orderService',
  () => new OrderService(new OrderRepository(), container.resolve<UserService>('userService')),
)

// 使用
const userService = container.resolve<UserService>('userService')
```

### NestJS 内置 DI

NestJS 提供了完整的依赖注入容器，基于装饰器自动解析依赖。

### typedi（轻量 DI 库）

```typescript
import { Service, Inject, Container } from 'typedi'

@Service()
class UserRepository {
  async findById(id: string) {
    /* ... */
  }
}

@Service()
class UserService {
  constructor(@Inject() private repo: UserRepository) {}
}

// 使用
const service = Container.get(UserService)
```

---

## 四、配置管理

### 多环境配置

```typescript
// src/config/index.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

function loadConfig(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('环境变量校验失败:', result.error.format())
    process.exit(1)
  }
  return result.data
}

export const config = loadConfig()
```

### .env 文件

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
JWT_SECRET=dev-secret-key-at-least-32-chars-long
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://prod-host:5432/myapp
JWT_SECRET=${VAULT_JWT_SECRET}  # 从密钥管理服务获取
LOG_LEVEL=info
```

---

## 五、错误处理架构

### 统一错误体系

```typescript
// src/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}不存在`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthError extends AppError {
  constructor(message = '未授权') {
    super(message, 401, 'UNAUTHORIZED')
  }
}
```

### 全局错误处理中间件

```typescript
// Express
import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // 已知业务错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { details: err.details }),
      },
    })
  }

  // 未知错误：记录日志，返回通用错误
  console.error('[Unhandled Error]', err)
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
  })
}

// NestJS（异常过滤器）
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json({
        error: { code: exception.code, message: exception.message },
      })
    }

    response.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
  }
}
```

---

## 六、模块化设计

### Feature Module 模式

```
src/
├── modules/
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.module.ts
│   │   └── __tests__/
│   │       └── user.service.spec.ts
│   ├── order/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.repository.ts
│   │   └── order.module.ts
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       └── auth.module.ts
├── shared/
│   ├── middleware/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── decorators/
│   └── utils/
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
├── app.ts
└── main.ts
```

### 模块间通信原则

```typescript
// ✅ 正确：通过 Service 接口通信
// order.module.ts
@Module({
  imports: [UserModule], // 导入 UserModule 导出的 Service
})
export class OrderModule {}

// order.service.ts
@Injectable()
export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private userService: UserService, // 通过 DI 注入
  ) {}

  async createOrder(userId: string, items: OrderItem[]) {
    const user = await this.userService.getUser(userId) // 通过接口调用
    // ...
  }
}

// ❌ 错误：直接访问其他模块的 Repository
@Injectable()
export class OrderService {
  constructor(private userRepo: UserRepository) {} // 跨模块直接访问数据层
}
```

---

## 七、全栈框架项目结构

### Next.js 项目结构

```
my-next-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── (auth)/             # 路由分组
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # 仪表盘布局
│   │   │   ├── page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/                # API Routes
│   │       └── users/route.ts
│   ├── components/
│   │   ├── ui/                 # 基础 UI 组件
│   │   └── features/           # 业务组件
│   ├── lib/
│   │   ├── db.ts               # 数据库连接
│   │   ├── auth.ts             # 认证逻辑
│   │   └── validators.ts       # 校验 schema
│   ├── services/               # 业务逻辑层
│   │   ├── user-service.ts
│   │   └── order-service.ts
│   └── types/
├── prisma/
├── public/
├── next.config.ts
└── package.json
```

### Nuxt.js 项目结构

```
my-nuxt-app/
├── app/
│   ├── app.vue
│   ├── pages/                  # 文件路由
│   ├── layouts/                # 布局
│   ├── components/             # 自动导入组件
│   ├── composables/            # 自动导入组合式函数
│   ├── middleware/              # 路由中间件
│   └── plugins/                # 插件
├── server/
│   ├── api/                    # API 路由
│   ├── middleware/              # 服务端中间件
│   └── utils/
├── modules/                    # Nuxt 模块
├── nuxt.config.ts
└── package.json
```

---

## 八、架构决策速查表

| 项目规模               | 推荐框架               | 分层模式                                   | DI 方案           |
| ---------------------- | ---------------------- | ------------------------------------------ | ----------------- |
| 小型 API（< 10 路由）  | Express / Koa / Hono   | 路由 + Service                             | 手动              |
| 中型项目（10-50 路由） | Express + TS / Fastify | Controller + Service + Repository          | typedi / 手动     |
| 大型企业项目           | NestJS                 | Module + Controller + Service + Repository | 内置 DI           |
| 全栈 Web               | Next.js / Nuxt.js      | App Router + Server Actions                | Server Components |
| 微服务集群             | NestJS / Fastify       | 模块化 + 事件驱动                          | 内置 DI           |
| 高性能 API             | Fastify / Hono         | Plugin + Route                             | 轻量注入          |
