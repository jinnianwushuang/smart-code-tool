# Egg.js V4 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-10  
> **适用版本**: Egg.js 4.x（基于 Koa 3，全面 ESM）  
> **适用对象**: Node.js 后端开发者、TypeScript 开发者

---

## 📑 目录

- [一、Egg.js V4 概览](#一eggjs-v4-概览)
- [二、项目初始化](#二项目初始化)
- [三、目录结构](#三目录结构)
- [四、路由系统](#四路由系统)
- [五、控制器与装饰器](#五控制器与装饰器)
- [六、服务层 (Service)](#六服务层-service)
- [七、中间件](#七中间件)
- [八、配置系统](#八配置系统)
- [九、依赖注入 (DI)](#九依赖注入-di)
- [十、插件机制](#十插件机制)
- [十一、数据库集成](#十一数据库集成)
- [十二、安全机制](#十二安全机制)
- [十三、错误处理](#十三错误处理)
- [十四、定时任务](#十四定时任务)
- [十五、日志系统](#十五日志系统)
- [十六、测试](#十六测试)
- [十七、部署发布](#十七部署发布)
- [十八、V3 → V4 迁移指南](#十八v3--v4-迁移指南)

---

## 一、Egg.js V4 概览

### 1.1 V4 核心变化

Egg.js V4 是一次全面的架构升级，相比 V3 有以下重大变更：

```
V3 (Koa 2)                        V4 (Koa 3)
├── CommonJS 为主                 ├── 全面 ESM (import/export)
├── class 继承风格                ├── 装饰器 (Decorator) 风格
├── Node.js >= 18                ├── Node.js >= 20
├── 手动依赖管理                  ├── 内置依赖注入 (DI)
├── 传统插件系统                 ├── 新插件架构 (基于 IoC)
├── require() 加载               ├── 原生 ESM 加载
└── JavaScript 优先               └── TypeScript First
```

### 1.2 核心特性

- **全面 ESM** — 原生 `import/export`，不再依赖 CommonJS
- **装饰器编程** — 使用 `@Controller`、`@Get`、`@Inject` 等装饰器
- **依赖注入 (DI)** — 内置 IoC 容器，自动注入依赖
- **TypeScript First** — 完整的类型推导和类型安全
- **Koa 3 内核** — 基于最新的 Koa 3，更好的中间件链
- **新插件架构** — 基于 IoC 的插件系统，更灵活

### 1.3 与 V3 语法对比

```typescript
// V3 (CommonJS + class 继承)
const { Controller } = require('egg')

class UserController extends Controller {
  async index() {
    const users = await this.service.user.list()
    this.ctx.body = users
  }
}
module.exports = UserController

// V4 (ESM + 装饰器)
import { Controller, Get, Inject } from '@eggjs/tegg'
import { UserService } from '../service/UserService.js'

@Controller('/users')
export class UserController {
  @Inject()
  userService: UserService

  @Get('/')
  async index() {
    return await this.userService.list()
  }
}
```

---

## 二、项目初始化

### 2.1 创建项目

```bash
# 使用脚手架创建 V4 项目
npm init egg@latest --type=ts-v4

# 或使用 pnpm
pnpm create egg --type=ts-v4

# 安装依赖
npm install

# 启动开发服务
npm run dev
# http://localhost:7001
```

### 2.2 package.json 配置

```json
{
  "name": "my-egg-app",
  "type": "module",
  "egg": {
    "framework": "egg"
  },
  "scripts": {
    "dev": "egg-bin dev",
    "build": "tsc",
    "start": "egg-scripts start --port=7001",
    "stop": "egg-scripts stop",
    "test": "egg-bin test",
    "cov": "egg-bin cov",
    "lint": "eslint . --ext .ts"
  },
  "dependencies": {
    "egg": "^4.0.0",
    "@eggjs/tegg": "^3.0.0",
    "@eggjs/tegg-config": "^3.0.0",
    "@eggjs/tegg-controller-plugin": "^3.0.0",
    "@eggjs/tegg-orm-plugin": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "egg-bin": "^7.0.0",
    "egg-mock": "^6.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 2.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

## 三、目录结构

### 3.1 V4 标准目录

```
egg-v4-project/
├── src/                           # 源码目录 (ESM)
│   ├── app/
│   │   ├── controller/            # 控制器 (装饰器风格)
│   │   │   ├── UserController.ts
│   │   │   └── PostController.ts
│   │   ├── service/               # 服务层
│   │   │   ├── UserService.ts
│   │   │   └── PostService.ts
│   │   ├── middleware/             # 中间件
│   │   │   └── AuthMiddleware.ts
│   │   ├── model/                 # 数据模型
│   │   │   └── User.ts
│   │   ├── schedule/              # 定时任务
│   │   │   └── CleanTask.ts
│   │   └── extend/                # 框架扩展
│   │       └── helper.ts
│   └── config/                    # 配置
│       ├── config.default.ts
│       ├── config.prod.ts
│       ├── config.local.ts
│       └── plugin.ts
├── test/                          # 测试文件
│   ├── controller/
│   └── service/
├── typings/                       # 类型声明
├── logs/                          # 日志目录
├── dist/                          # 编译输出
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 V3 vs V4 目录对比

```
V3 结构                          V4 结构
app/controller/user.js    →     src/app/controller/UserController.ts
app/service/user.js       →     src/app/service/UserService.ts
app/middleware/auth.js    →     src/app/middleware/AuthMiddleware.ts
app/schedule/clean.js     →     src/app/schedule/CleanTask.ts
config/config.default.js  →     src/config/config.default.ts
app/router.js             →     不再需要 (装饰器自动注册)
```

---

## 四、路由系统

### 4.1 装饰器路由 (推荐)

V4 使用装饰器定义路由，无需单独的 `router.js` 文件：

```typescript
// src/app/controller/UserController.ts
import { Controller, Get, Post, Put, Delete, Inject } from '@eggjs/tegg'
import { Context } from 'egg'
import { UserService } from '../service/UserService.js'

@Controller('/api/users')
export class UserController {
  @Inject()
  ctx: Context

  @Inject()
  userService: UserService

  // GET /api/users
  @Get('/')
  async list() {
    return await this.userService.list()
  }

  // GET /api/users/:id
  @Get('/:id')
  async show() {
    const { id } = this.ctx.params
    const user = await this.userService.find(id)
    if (!user) {
      this.ctx.status = 404
      return { code: 404, message: '用户不存在' }
    }
    return { code: 0, data: user }
  }

  // POST /api/users
  @Post('/')
  async create() {
    const body = this.ctx.request.body
    const user = await this.userService.create(body)
    this.ctx.status = 201
    return { code: 0, data: user }
  }

  // PUT /api/users/:id
  @Put('/:id')
  async update() {
    const { id } = this.ctx.params
    const user = await this.userService.update(id, this.ctx.request.body)
    return { code: 0, data: user }
  }

  // DELETE /api/users/:id
  @Delete('/:id')
  async destroy() {
    const { id } = this.ctx.params
    await this.userService.destroy(id)
    this.ctx.status = 204
  }
}
```

### 4.2 路由参数

```typescript
@Controller('/api')
export class DemoController {
  @Inject()
  ctx: Context

  // 路径参数
  @Get('/posts/:id')
  async showPost() {
    const id = this.ctx.params.id
    return { id }
  }

  // 多个路径参数
  @Get('/orgs/:orgId/repos/:repoId')
  async showRepo() {
    const { orgId, repoId } = this.ctx.params
    return { orgId, repoId }
  }

  // 查询参数
  @Get('/search')
  async search() {
    const { q, page = '1', limit = '20' } = this.ctx.query
    return { q, page, limit }
  }
}
```

### 4.3 传统路由 (兼容)

```typescript
// V4 仍支持传统 router.js (兼容模式)
// src/app/router.ts
import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  // 传统路由方式
  router.get('/legacy/users', controller.user.list)
  router.post('/legacy/users', controller.user.create)
}
```

---

## 五、控制器与装饰器

### 5.1 装饰器一览

```typescript
import {
  Controller, // 标记为控制器，定义基础路径
  Get, // GET 请求
  Post, // POST 请求
  Put, // PUT 请求
  Delete, // DELETE 请求
  Patch, // PATCH 请求
  Inject, // 依赖注入
  Middleware, // 应用中间件到控制器/方法
  HTTPError, // HTTP 错误类
  HTTPBody, // 设置响应体
  HTTPQuery, // 获取查询参数
  HTTPParam, // 获取路径参数
} from '@eggjs/tegg'
```

### 5.2 控制器中间件

```typescript
import { Controller, Get, Post, Middleware } from '@eggjs/tegg'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { AdminMiddleware } from '../middleware/AdminMiddleware.js'

// 控制器级中间件 — 所有方法都经过
@Controller('/api/admin')
@Middleware(AuthMiddleware)
export class AdminController {
  // 方法级中间件 — 仅该方法经过
  @Post('/posts')
  @Middleware(AdminMiddleware)
  async createPost() {
    // 只有认证 + 管理员权限才能执行
  }

  @Get('/stats')
  async getStats() {
    // 只需要认证 (不需要 AdminMiddleware)
  }
}
```

### 5.3 请求与响应

```typescript
@Controller('/api')
export class ApiController {
  @Inject()
  ctx: Context

  @Get('/demo')
  async demo() {
    // 查询参数
    const query = this.ctx.query
    const name = this.ctx.query.name

    // 请求体
    const body = this.ctx.request.body

    // 请求头
    const token = this.ctx.get('Authorization')

    // Cookie
    const sessionId = this.ctx.cookies.get('session_id')

    // 设置响应头
    this.ctx.set('X-Custom', 'value')

    // 设置 Cookie
    this.ctx.cookies.set('token', 'abc123', {
      httpOnly: true,
      signed: true,
      maxAge: 86400000,
    })

    // 直接返回对象 (自动序列化为 JSON)
    return { code: 0, data: query }
  }

  @Post('/upload')
  async upload() {
    // 文件上传
    const stream = await this.ctx.getFileStream()
    const fields = stream.fields
    // 处理文件流...
    return { success: true }
  }

  @Get('/redirect')
  async redirect() {
    this.ctx.redirect('/login')
  }

  @Get('/download')
  async download() {
    this.ctx.attachment('report.pdf')
    this.ctx.set('Content-Type', 'application/pdf')
    this.ctx.body = fs.createReadStream('/path/to/file.pdf')
  }
}
```

---

## 六、服务层 (Service)

### 6.1 基础服务

```typescript
// src/app/service/UserService.ts
import { AccessLevel, ContextProto, Inject } from '@eggjs/tegg'
import { Context } from 'egg'

@ContextProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  @Inject()
  ctx: Context

  async list(options?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = options || {}
    const offset = (page - 1) * limit

    const users = await this.ctx.model.User.findAndCountAll({
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    })

    return {
      list: users.rows,
      total: users.count,
      page,
      totalPages: Math.ceil(users.count / limit),
    }
  }

  async find(id: string) {
    return await this.ctx.model.User.findByPk(id)
  }

  async create(data: CreateUserDTO) {
    return await this.ctx.model.User.create(data)
  }

  async update(id: string, data: Partial<CreateUserDTO>) {
    const user = await this.ctx.model.User.findByPk(id)
    if (!user) return null
    return await user.update(data)
  }

  async destroy(id: string) {
    const user = await this.ctx.model.User.findByPk(id)
    if (!user) return false
    await user.destroy()
    return true
  }
}

// DTO 类型定义
interface CreateUserDTO {
  username: string
  email: string
  password: string
  role?: string
}
```

### 6.2 服务间调用

```typescript
// src/app/service/OrderService.ts
import { AccessLevel, ContextProto, Inject } from '@eggjs/tegg'
import { UserService } from './UserService.js'
import { ProductService } from './ProductService.js'

@ContextProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class OrderService {
  @Inject()
  ctx: Context

  // 自动注入其他 Service
  @Inject()
  userService: UserService

  @Inject()
  productService: ProductService

  async createOrder(data: CreateOrderDTO) {
    // 调用 userService
    const user = await this.userService.find(data.userId)
    if (!user) {
      this.ctx.throw(404, '用户不存在')
    }

    // 调用 productService
    const hasStock = await this.productService.checkStock(data.productId, data.quantity)
    if (!hasStock) {
      this.ctx.throw(400, '库存不足')
    }

    // 创建订单
    const order = await this.ctx.model.Order.create({
      userId: user.id,
      productId: data.productId,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      status: 'pending',
    })

    return order
  }
}
```

### 6.3 调用外部 API

```typescript
// src/app/service/GithubService.ts
import { AccessLevel, ContextProto, Inject } from '@eggjs/tegg'
import { Context } from 'egg'

@ContextProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class GithubService {
  @Inject()
  ctx: Context

  async getUser(username: string) {
    const result = await this.ctx.curl(`https://api.github.com/users/${username}`, {
      dataType: 'json',
      timeout: 5000,
    })

    if (result.status !== 200) {
      this.ctx.throw(result.status, 'GitHub API 请求失败')
    }
    return result.data
  }

  async searchRepos(query: string) {
    const result = await this.ctx.curl('https://api.github.com/search/repositories', {
      dataType: 'json',
      data: { q: query, sort: 'stars' },
      timeout: 10000,
    })
    return result.data
  }
}
```

---

## 七、中间件

### 7.1 编写中间件

```typescript
// src/app/middleware/AuthMiddleware.ts
import { Middleware } from '@eggjs/tegg'
import type { Context, Next } from 'egg'

@Middleware()
export class AuthMiddleware {
  async handle(ctx: Context, next: Next) {
    const token = ctx.get('Authorization')

    if (!token) {
      ctx.status = 401
      ctx.body = { code: 401, message: '未提供认证令牌' }
      return
    }

    try {
      const decoded = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret)
      ctx.state.user = decoded
      await next()
    } catch {
      ctx.status = 401
      ctx.body = { code: 401, message: '认证令牌无效' }
    }
  }
}
```

### 7.2 全局中间件配置

```typescript
// src/config/config.default.ts
import { EggAppConfig } from 'egg'

export default {
  middleware: ['errorHandler', 'cors'],

  // 中间件配置
  cors: {
    origin: '*',
    allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowHeaders: 'Content-Type, Authorization',
  },
} satisfies Partial<EggAppConfig>
```

### 7.3 常用中间件示例

```typescript
// 统一错误处理
@Middleware()
export class ErrorHandlerMiddleware {
  async handle(ctx: Context, next: Next) {
    try {
      await next()
    } catch (err: any) {
      ctx.app.emit('error', err, ctx)

      const status = err.status || 500
      const message =
        status === 500 && ctx.app.config.env === 'prod' ? '服务器内部错误' : err.message

      ctx.status = status
      ctx.body = { success: false, code: status, message }
    }
  }
}

// 速率限制
@Middleware()
export class RateLimitMiddleware {
  private store = new Map<string, number[]>()

  constructor(private options: { windowMs?: number; max?: number } = {}) {}

  async handle(ctx: Context, next: Next) {
    const windowMs = this.options.windowMs || 60000
    const max = this.options.max || 100
    const ip = ctx.ip
    const now = Date.now()

    const timestamps = (this.store.get(ip) || []).filter((ts) => now - ts < windowMs)

    if (timestamps.length >= max) {
      ctx.status = 429
      ctx.body = { code: 429, message: '请求过于频繁' }
      return
    }

    timestamps.push(now)
    this.store.set(ip, timestamps)
    await next()
  }
}
```

---

## 八、配置系统

### 8.1 多环境配置

```typescript
// src/config/config.default.ts — 默认配置
import { EggAppConfig } from 'egg'
import { fileURLToPath } from 'node:url'

const config: Partial<EggAppConfig> = {
  keys: 'your_app_secret_key_here',

  cluster: {
    listen: { port: 7001, hostname: '127.0.0.1' },
  },

  bodyParser: {
    jsonLimit: '1mb',
    formLimit: '1mb',
  },

  static: {
    prefix: '/public/',
    dir: 'app/public',
  },

  security: {
    csrf: { enable: true, ignoreJSON: true },
    domainWhiteList: ['.example.com'],
  },
}

export default config
```

```typescript
// src/config/config.prod.ts — 生产环境
export default {
  sequelize: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  logger: {
    level: 'INFO',
    consoleLevel: 'WARN',
  },
}
```

```typescript
// src/config/config.local.ts — 本地开发
export default {
  sequelize: {
    dialect: 'mysql',
    host: '127.0.0.1',
    database: 'egg_dev',
    username: 'root',
    password: 'password',
    logging: true,
  },
  security: {
    csrf: { enable: false },
  },
  logger: {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  },
}
```

### 8.2 读取配置

```typescript
@ContextProto()
export class MyService {
  @Inject()
  ctx: Context

  async doSomething() {
    // 访问配置
    const dbConfig = this.ctx.app.config.sequelize
    const appKeys = this.ctx.app.config.keys
    const env = this.ctx.app.config.env // 'local' | 'prod' | ...
  }
}
```

---

## 九、依赖注入 (DI)

### 9.1 IoC 容器

```typescript
import {
  AccessLevel,
  ContextProto, // 请求级生命周期 (每个请求一个实例)
  SingletonProto, // 单例生命周期 (全局共享)
  Inject,
} from '@eggjs/tegg'

// 请求级 — 每个 HTTP 请求创建新实例
@ContextProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  @Inject()
  ctx: Context // 自动注入当前请求上下文
}

// 单例级 — 应用启动时创建，全局共享
@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class CacheService {
  private cache = new Map<string, any>()

  get(key: string) {
    return this.cache.get(key)
  }

  set(key: string, value: any, ttl?: number) {
    this.cache.set(key, value)
    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl)
    }
  }
}
```

### 9.2 注入方式

```typescript
@Controller('/api')
export class ApiController {
  // 属性注入
  @Inject()
  userService: UserService

  @Inject()
  cacheService: CacheService

  // 通过 ctx 注入
  @Inject()
  ctx: Context

  @Get('/demo')
  async demo() {
    // 使用注入的 service
    const users = await this.userService.list()
    const cached = this.cacheService.get('users')
    return { users, cached }
  }
}
```

### 9.3 生命周期

```
SingletonProto (单例)
├── 应用启动时创建
├── 全局共享一个实例
├── 适合: 配置服务、缓存服务、连接池
└── 注意: 不能注入 ctx (因为不绑定请求)

ContextProto (请求级)
├── 每个 HTTP 请求创建新实例
├── 请求结束后销毁
├── 适合: 业务 Service、Controller
└── 可以注入 ctx
```

---

## 十、插件机制

### 10.1 启用插件

```typescript
// src/config/plugin.ts
export default {
  sequelize: {
    enable: true,
    package: '@eggjs/tegg-orm-plugin',
  },
  redis: {
    enable: true,
    package: '@eggjs/tegg-redis-plugin',
  },
  jwt: {
    enable: true,
    package: '@eggjs/tegg-jwt-plugin',
  },
  cors: {
    enable: true,
    package: '@eggjs/tegg-cors-plugin',
  },
  validate: {
    enable: true,
    package: '@eggjs/tegg-validate-plugin',
  },
  view: {
    enable: true,
    package: '@eggjs/tegg-view-plugin',
  },
  schedule: {
    enable: true,
    package: '@eggjs/tegg-schedule-plugin',
  },
}
```

### 10.2 V4 插件特性

```
V4 插件 vs V3 插件:
├── 基于 IoC 容器注册
├── 使用装饰器声明
├── 支持 TypeScript 类型推导
├── 更好的生命周期管理
├── 插件间依赖自动解析
└── 热加载支持 (开发模式)
```

### 10.3 自定义插件

```typescript
// 插件目录结构
egg-my-plugin/
├── src/
│   ├── index.ts                   # 入口
│   ├── service/
│   │   └── MyPluginService.ts
│   └── middleware/
│       └── MyPluginMiddleware.ts
├── package.json
└── tsconfig.json
```

```typescript
// src/index.ts
import { SingletonProto, AccessLevel } from '@eggjs/tegg'

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
  name: 'myPluginService',
})
export class MyPluginService {
  async init() {
    // 插件初始化逻辑
  }

  async doSomething() {
    // 插件提供的功能
  }
}
```

---

## 十一、数据库集成

### 11.1 Sequelize (推荐)

```bash
npm install @eggjs/tegg-orm-plugin sequelize mysql2
```

```typescript
// src/app/model/User.ts
import { Model, Column, Table } from '@eggjs/tegg-orm-plugin'

@Table('users')
export class User extends Model {
  @Column({ type: 'INTEGER', primaryKey: true, autoIncrement: true })
  id: number

  @Column({ type: 'STRING', length: 50, allowNull: false, unique: true })
  username: string

  @Column({ type: 'STRING', length: 100, allowNull: false, unique: true })
  email: string

  @Column({ type: 'STRING', length: 255, allowNull: false })
  password: string

  @Column({ type: 'STRING', length: 20, defaultValue: 'user' })
  role: string

  @Column({ type: 'BOOLEAN', defaultValue: true })
  isActive: boolean
}
```

```typescript
// src/app/service/UserService.ts
import { AccessLevel, ContextProto, Inject } from '@eggjs/tegg'
import { User } from '../model/User.js'

@ContextProto({ accessLevel: AccessLevel.PUBLIC })
export class UserService {
  @Inject()
  ctx: Context

  async list(options?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = options || {}

    const result = await User.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    })

    return {
      list: result.rows,
      total: result.count,
      page,
      totalPages: Math.ceil(result.count / limit),
    }
  }

  async find(id: number) {
    return await User.findByPk(id)
  }

  async create(data: Partial<User>) {
    return await User.create(data)
  }

  async update(id: number, data: Partial<User>) {
    const user = await User.findByPk(id)
    if (!user) return null
    return await user.update(data)
  }

  async destroy(id: number) {
    const user = await User.findByPk(id)
    if (!user) return false
    await user.destroy()
    return true
  }
}
```

### 11.2 数据库迁移

```typescript
// database/migrations/001_create_users.ts
import { Migration } from '@eggjs/tegg-orm-plugin'

export class CreateUsers extends Migration {
  async up() {
    await this.createTable('users', {
      id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
      username: { type: 'STRING(50)', allowNull: false, unique: true },
      email: { type: 'STRING(100)', allowNull: false, unique: true },
      password: { type: 'STRING(255)', allowNull: false },
      role: { type: 'STRING(20)', defaultValue: 'user' },
      isActive: { type: 'BOOLEAN', defaultValue: true },
      createdAt: { type: 'DATE', defaultValue: 'NOW()' },
      updatedAt: { type: 'DATE', defaultValue: 'NOW()' },
    })

    // 创建索引
    await this.addIndex('users', ['email'], { unique: true })
    await this.addIndex('users', ['role'])
  }

  async down() {
    await this.dropTable('users')
  }
}
```

---

## 十二、安全机制

### 12.1 CSRF 防护

```typescript
// src/config/config.default.ts
export default {
  security: {
    csrf: {
      enable: true,
      ignoreJSON: true,
      headerName: 'x-csrf-token',
      bodyName: '_csrf',
      queryName: '_csrf',
    },
  },
}

// 在模板中使用
// <input type="hidden" name="_csrf" value="{{ ctx.csrf }}">
```

### 12.2 安全 Headers

```typescript
// src/config/config.default.ts
export default {
  security: {
    hsts: {
      enable: true,
      maxAge: 365 * 24 * 3600,
      includeSubDomains: true,
    },
    xframe: {
      enable: true,
      value: 'SAMEORIGIN',
    },
    csp: {
      enable: true,
      policy: {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
      },
    },
  },
}
```

### 12.3 参数校验

```typescript
import { Controller, Post, Inject } from '@eggjs/tegg'
import { z } from 'zod'

// 使用 Zod 做参数校验
const CreateUserSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).optional(),
})

@Controller('/api/users')
export class UserController {
  @Inject()
  ctx: Context

  @Post('/')
  async create() {
    try {
      const data = CreateUserSchema.parse(this.ctx.request.body)
      const user = await this.userService.create(data)
      return { code: 0, data: user }
    } catch (err: any) {
      if (err.name === 'ZodError') {
        this.ctx.status = 400
        return {
          code: 400,
          message: '参数校验失败',
          errors: err.errors,
        }
      }
      throw err
    }
  }
}
```

---

## 十三、错误处理

### 13.1 全局错误处理

```typescript
// src/app/middleware/ErrorHandler.ts
import { Middleware } from '@eggjs/tegg'
import type { Context, Next } from 'egg'

@Middleware()
export class ErrorHandlerMiddleware {
  async handle(ctx: Context, next: Next) {
    try {
      await next()
    } catch (err: any) {
      ctx.app.emit('error', err, ctx)

      const status = err.status || 500
      const message =
        status === 500 && ctx.app.config.env === 'prod' ? '服务器内部错误' : err.message

      ctx.status = status
      ctx.body = {
        success: false,
        code: err.code || status,
        message,
        ...(ctx.app.config.env === 'local' && { stack: err.stack }),
      }
    }
  }
}
```

### 13.2 自定义业务错误

```typescript
// src/app/common/BizError.ts
export class BizError extends Error {
  constructor(
    public code: number,
    message: string,
    public status: number = 400,
  ) {
    super(message)
    this.name = 'BizError'
  }
}

// 使用
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  async show() {
    const user = await this.userService.find(this.ctx.params.id)
    if (!user) {
      throw new BizError(404, '用户不存在', 404)
    }
    return { code: 0, data: user }
  }
}
```

---

## 十四、定时任务

### 14.1 定义定时任务

```typescript
// src/app/schedule/CleanLog.ts
import { Schedule, ScheduleType } from '@eggjs/tegg-schedule-plugin'
import { Inject } from '@eggjs/tegg'

@Schedule({
  type: ScheduleType.WORKER, // 每台机器只有一个 worker 执行
  cron: '0 0 2 * * *', // 每天凌晨 2 点
  // interval: '1h',               // 或按间隔执行
  immediate: false,
  disable: false,
})
export class CleanLogSchedule {
  @Inject()
  ctx: Context

  async exec() {
    this.ctx.logger.info('开始清理过期日志...')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await this.ctx.model.Log.destroy({
      where: { createdAt: { $lt: thirtyDaysAgo } },
    })

    this.ctx.logger.info('过期日志清理完成')
  }
}
```

### 14.2 任务类型

```typescript
// WORKER — 每台机器随机选一个 worker 执行 (推荐)
@Schedule({ type: ScheduleType.WORKER, cron: '0 */5 * * * *' })

// ALL — 每台机器所有 worker 都执行
@Schedule({ type: ScheduleType.ALL, interval: '10m' })
```

---

## 十五、日志系统

### 15.1 日志配置

```typescript
// src/config/config.default.ts
export default {
  logger: {
    dir: 'logs',
    level: 'INFO',
    consoleLevel: 'INFO',
    outputJSON: false,
    appLogName: 'app.log',
    coreLogName: 'core.log',
    errorLogName: 'error.log',
  },
}
```

### 15.2 使用日志

```typescript
@ContextProto()
export class MyService {
  @Inject()
  ctx: Context

  async process() {
    // 请求级日志 (自动带 requestId)
    this.ctx.logger.debug('调试信息')
    this.ctx.logger.info('普通信息')
    this.ctx.logger.warn('警告信息')
    this.ctx.logger.error('错误信息')

    // 应用级日志
    this.ctx.app.logger.info('应用信息')

    // 框架级日志
    this.ctx.app.coreLogger.info('框架信息')
  }
}
```

---

## 十六、测试

### 16.1 Controller 测试

```typescript
// test/controller/UserController.test.ts
import { app, assert } from 'egg-mock/bootstrap'

describe('UserController', () => {
  it('GET /api/users', async () => {
    const res = await app.httpRequest().get('/api/users').expect(200)

    assert(res.body.code === 0)
    assert(Array.isArray(res.body.data.list))
  })

  it('GET /api/users/:id', async () => {
    const res = await app.httpRequest().get('/api/users/1').expect(200)

    assert(res.body.data.id === 1)
  })

  it('POST /api/users', async () => {
    const res = await app
      .httpRequest()
      .post('/api/users')
      .send({
        username: 'test_user',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)

    assert(res.body.data.username === 'test_user')
  })

  it('GET /api/users/:id - not found', async () => {
    await app.httpRequest().get('/api/users/999').expect(404)
  })
})
```

### 16.2 Service 测试

```typescript
// test/service/UserService.test.ts
import { app, assert, mock } from 'egg-mock/bootstrap'

describe('UserService', () => {
  it('should list users', async () => {
    const ctx = app.mockContext()
    const result = await ctx.service.user.list()

    assert(result.list)
    assert(typeof result.total === 'number')
  })

  it('should find user by id', async () => {
    const ctx = app.mockContext()
    const user = await ctx.service.user.find(1)

    assert(user)
    assert(user.id === 1)
  })
})
```

### 16.3 Mock 测试

```typescript
import { app, mock } from 'egg-mock/bootstrap'

describe('mock examples', () => {
  it('mock service method', async () => {
    const ctx = app.mockContext()

    mock(ctx.service.user, 'find', async (id: number) => ({
      id,
      username: 'mock_user',
    }))

    const user = await ctx.service.user.find(1)
    assert(user.username === 'mock_user')
  })

  it('mock HTTP request', async () => {
    mock(app.httpclient, 'curl', async () => ({
      status: 200,
      data: { login: 'mock_github_user' },
    }))

    const ctx = app.mockContext()
    const result = await ctx.service.github.getUser('test')
    assert(result.login === 'mock_github_user')
  })
})
```

---

## 十七、部署发布

### 17.1 生产启动

```bash
# 编译 TypeScript
npm run build

# 启动 (多进程模式)
npm start
# 等价于: egg-scripts start --port=7001 --workers=4 --daemon

# 停止
npm stop
```

### 17.2 Docker 部署

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 7001
CMD ["npm", "start"]
```

### 17.3 Nginx 反向代理

```nginx
upstream egg_app {
  server 127.0.0.1:7001;
}

server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://egg_app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /public/ {
    alias /app/app/public/;
    expires 30d;
  }
}
```

### 17.4 PM2 部署

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'egg-v4-app',
      script: 'node_modules/.bin/egg-scripts',
      args: 'start --port=7001 --workers=4',
      cwd: '/path/to/app',
      env: {
        NODE_ENV: 'production',
        EGG_SERVER_ENV: 'prod',
      },
    },
  ],
}
```

```bash
pm2 start ecosystem.config.cjs
pm2 logs egg-v4-app
pm2 restart egg-v4-app
```

---

## 十八、V3 → V4 迁移指南

### 18.1 核心变更清单

| 项目         | V3                      | V4                       |
| ------------ | ----------------------- | ------------------------ |
| 模块系统     | CommonJS (`require`)    | ESM (`import/export`)    |
| 编程风格     | class 继承              | 装饰器 (`@Controller`)   |
| 路由定义     | `router.js` 文件        | 装饰器 (`@Get`, `@Post`) |
| 依赖管理     | 手动 `this.service.xxx` | 自动注入 (`@Inject`)     |
| Node.js      | >= 18                   | >= 20                    |
| TypeScript   | 支持                    | First-class              |
| 底层框架     | Koa 2                   | Koa 3                    |
| 插件系统     | `plugin.js`             | `plugin.ts` + IoC        |
| package.json | 无 `type` 字段          | `"type": "module"`       |

### 18.2 Controller 迁移

```typescript
// V3 → V4 Controller 迁移

// ❌ V3
const { Controller } = require('egg')
class UserController extends Controller {
  async index() {
    const users = await this.service.user.list()
    this.ctx.body = users
  }
}
module.exports = UserController

// ✅ V4
import { Controller, Get, Inject } from '@eggjs/tegg'
import { UserService } from '../service/UserService.js'

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService

  @Inject()
  ctx: Context

  @Get('/')
  async index() {
    return await this.userService.list()
  }
}
```

### 18.3 Service 迁移

```typescript
// ❌ V3
const { Service } = require('egg')
class UserService extends Service {
  async list() {
    return await this.ctx.model.User.findAll()
  }
}
module.exports = UserService

// ✅ V4
import { AccessLevel, ContextProto, Inject } from '@eggjs/tegg'

@ContextProto({ accessLevel: AccessLevel.PUBLIC })
export class UserService {
  @Inject()
  ctx: Context

  async list() {
    return await this.ctx.model.User.findAll()
  }
}
```

### 18.4 配置文件迁移

```typescript
// ❌ V3 (config.default.js)
module.exports = (appInfo) => {
  const config = {}
  config.keys = appInfo.name + '_secret'
  return config
}

// ✅ V4 (config.default.ts)
import { EggAppConfig } from 'egg'

const config: Partial<EggAppConfig> = {
  keys: 'your_secret_key',
}
export default config
```

### 18.5 package.json 迁移

```json
// V3
{
  "name": "my-app",
  "egg": { "framework": "egg" },
  "scripts": { "dev": "egg-bin dev" }
}

// V4
{
  "name": "my-app",
  "type": "module",
  "egg": { "framework": "egg" },
  "scripts": { "dev": "egg-bin dev", "build": "tsc" }
}
```

---

## 附录

### A. 常用命令

```bash
npm run dev           # 开发模式 (热重载)
npm run debug         # 调试模式
npm run build         # 编译 TypeScript
npm start             # 生产启动
npm stop              # 停止
npm test              # 运行测试
npm run cov           # 覆盖率
npm run lint          # 代码检查
```

### B. Egg.js V4 生态

| 插件                         | 用途          |
| ---------------------------- | ------------- |
| @eggjs/tegg-orm-plugin       | Sequelize ORM |
| @eggjs/tegg-redis-plugin     | Redis 缓存    |
| @eggjs/tegg-jwt-plugin       | JWT 认证      |
| @eggjs/tegg-cors-plugin      | 跨域支持      |
| @eggjs/tegg-validate-plugin  | 参数校验      |
| @eggjs/tegg-view-plugin      | 模板引擎      |
| @eggjs/tegg-schedule-plugin  | 定时任务      |
| @eggjs/tegg-socket.io-plugin | WebSocket     |

### C. 学习资源

- **官方文档**: https://www.eggjs.org/
- **GitHub**: https://github.com/eggjs/egg
- **tegg 文档**: https://github.com/eggjs/tegg
- **V4 迁移指南**: https://www.eggjs.org/basics/v4

---

**提示**: 本手册基于 Egg.js V4.x 编写。如需了解 V3 版本，请参阅 [Egg.js V3 手册](/handbook/backend/eggjs-handbook)。
