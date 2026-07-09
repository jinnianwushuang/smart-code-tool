# Egg.js V3 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-10  
> **适用版本**: Egg.js 3.x（基于 Koa 2）  
> **适用对象**: Node.js 后端开发者、全栈开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、项目初始化](#二项目初始化)
- [三、目录结构](#三目录结构)
- [四、路由系统](#四路由系统)
- [五、控制器 (Controller)](#五控制器-controller)
- [六、服务层 (Service)](#六服务层-service)
- [七、中间件](#七中间件)
- [八、配置系统](#八配置系统)
- [九、插件机制](#九插件机制)
- [十、数据库集成](#十数据库集成)
- [十一、模板渲染](#十一模板渲染)
- [十二、安全机制](#十二安全机制)
- [十三、错误处理](#十三错误处理)
- [十四、定时任务](#十四定时任务)
- [十五、日志系统](#十五日志系统)
- [十六、测试](#十六测试)
- [十七、部署发布](#十七部署发布)
- [十八、最佳实践](#十八最佳实践)

---

## 一、基础概念

### 1.1 什么是 Egg.js

Egg.js 是阿里开源的企业级 Node.js 框架，基于 Koa 2 封装，奉行「约定优于配置」的原则，提供了一套统一的技术规范和开发范式。

**核心特性**：

- 基于 Koa 2 的高性能内核
- 高度可扩展的插件机制
- 内置多进程管理（基于 egg-cluster）
- 约定优于配置的目录规范
- 完善的开发调试和测试工具链
- 内置安全防护（XSS、CSRF、SQL 注入等）

### 1.2 Egg.js 版本说明

```
Egg.js V3 (本文档)
├── 基于 Koa 2
├── Node.js >= 18
├── 使用 class 语法 (非装饰器)
├── CommonJS / ESM 均支持
└── 稳定的企业级方案

Egg.js V4 (不在本文档范围)
├── 基于 Koa 3
├── 全面 ESM
├── 装饰器风格
└── 新架构设计
```

### 1.3 与 Koa/Express 对比

| 特性       | Egg.js 3.x   | Koa 2  | Express 4.x |
| ---------- | ------------ | ------ | ----------- |
| 底层框架   | 基于 Koa 2   | 原生   | 原生        |
| 插件系统   | 内置完善     | 无     | 无          |
| 多进程     | 内置         | 需自行 | 需自行      |
| 目录规范   | 约定式       | 自由   | 自由        |
| TypeScript | 支持         | 支持   | 支持        |
| 安全防护   | 内置         | 需自行 | 需自行      |
| 配置管理   | 多环境分文件 | 无     | 无          |
| 定时任务   | 内置插件     | 需自行 | 需自行      |

---

## 二、项目初始化

### 2.1 创建项目

```bash
# 使用脚手架创建
npm init egg --type=simple

# 或指定模板
npm init egg --type=ts    # TypeScript 模板

# 安装依赖
npm install

# 启动开发服务
npm run dev

# 启动（默认监听 7001 端口）
# http://localhost:7001
```

### 2.2 常用命令

```bash
# 开发模式（热重载）
npm run dev

# 启动（生产模式）
npm start

# 停止
npm stop

# 重启
npm restart

# 调试模式
npm run debug

# 代码检查
npm run lint

# 运行测试
npm test
npm run test-local

# 生成覆盖率报告
npm run cov
```

---

## 三、目录结构

### 3.1 标准目录

```
egg-project/
├── app/                       # 应用目录
│   ├── controller/            # 控制器
│   │   ├── home.js
│   │   └── user.js
│   ├── service/               # 服务层（业务逻辑）
│   │   └── user.js
│   ├── middleware/             # 中间件
│   │   └── auth.js
│   ├── view/                  # 模板文件
│   │   └── home.nj
│   ├── public/                # 静态资源
│   │   └── css/
│   ├── schedule/              # 定时任务
│   │   └── clean.js
│   ├── extend/                # 框架扩展
│   │   ├── helper.js          # 扩展 ctx.helper
│   │   ├── request.js         # 扩展 ctx.request
│   │   ├── response.js        # 扩展 ctx.response
│   │   ├── context.js         # 扩展 ctx
│   │   ├── application.js     # 扩展 app
│   │   └── agent.js           # 扩展 agent
│   ├── router.js              # 路由配置
│   └── middleware.js           # 中间件配置（可选）
├── config/                    # 配置文件
│   ├── config.default.js      # 默认配置
│   ├── config.prod.js         # 生产环境
│   ├── config.local.js        # 本地开发
│   ├── config.unittest.js     # 单元测试
│   └── plugin.js              # 插件配置
├── logs/                      # 日志目录
├── test/                      # 测试文件
│   ├── app/
│   │   ├── controller/
│   │   └── service/
│   └── fixture/
├── typings/                   # TypeScript 类型声明
├── package.json
└── README.md
```

### 3.2 命名规范

```
文件名:
├── controller/user.js     → ctx.controller.user
├── controller/admin/user.js → ctx.controller.admin.user
├── service/user.js        → ctx.service.user
├── service/admin/user.js  → ctx.service.admin.user
└── middleware/auth.js     → app.middleware.auth

规则:
├── 文件名使用小写字母 + 下划线 (snake_case)
├── 目录名使用小写字母
├── 类名使用大驼峰 (PascalCase)
└── 属性/方法使用小驼峰 (camelCase)
```

---

## 四、路由系统

### 4.1 基础路由

```javascript
// app/router.js
module.exports = (app) => {
  const { router, controller } = app

  // GET 请求
  router.get('/users', controller.user.list)
  router.get('/users/:id', controller.user.show)

  // POST 请求
  router.post('/users', controller.user.create)

  // PUT 请求
  router.put('/users/:id', controller.user.update)

  // DELETE 请求
  router.delete('/users/:id', controller.user.destroy)

  // PATCH 请求
  router.patch('/users/:id', controller.user.patch)

  // 匹配所有 HTTP 方法
  router.all('/api/:path*', controller.api.proxy)
}
```

### 4.2 路由参数

```javascript
// app/router.js
module.exports = (app) => {
  const { router, controller } = app

  // 路径参数
  router.get('/users/:id', controller.user.show)
  // controller 中获取: this.ctx.params.id

  // 多个参数
  router.get('/orgs/:orgId/repos/:repoId', controller.repo.show)
  // this.ctx.params.orgId, this.ctx.params.repoId

  // 正则参数
  router.get('/posts/:id(\\d+)', controller.post.show)
  // 只匹配数字 ID

  // 查询参数
  // GET /users?page=1&limit=10
  // this.ctx.query.page, this.ctx.query.limit
}
```

### 4.3 RESTful 路由

```javascript
// app/router.js — 使用 resources 快捷定义 RESTful 路由
module.exports = (app) => {
  const { router, controller } = app

  // 自动生成标准 RESTful 路由
  router.resources('users', '/api/users', controller.users)
  // 等价于:
  // GET    /api/users       → controller.users.index()
  // GET    /api/users/new   → controller.users.new()
  // GET    /api/users/:id   → controller.users.show()
  // GET    /api/users/:id/edit → controller.users.edit()
  // POST   /api/users       → controller.users.create()
  // PUT    /api/users/:id   → controller.users.update()
  // DELETE /api/users/:id   → controller.users.destroy()

  // 嵌套资源
  router.resources('comments', '/api/posts/:postId/comments', controller.comments)
}
```

### 4.4 路由中间件

```javascript
// app/router.js
module.exports = (app) => {
  const { router, controller, middleware } = app

  // 全局中间件（在 config 中配置更推荐）

  // 路由级中间件
  const auth = middleware.auth()
  const admin = middleware.admin()

  // 单个路由使用中间件
  router.get('/admin', admin, controller.admin.index)
  router.post('/admin/posts', auth, admin, controller.admin.createPost)

  // 路由组
  router.prefix('/api/v1')
  router.get('/users', controller.user.list)
  router.get('/posts', controller.post.list)
  // → /api/v1/users, /api/v1/posts
}
```

---

## 五、控制器 (Controller)

### 5.1 基础控制器

```javascript
// app/controller/user.js
const { Controller } = require('egg')

class UserController extends Controller {
  // GET /users
  async index() {
    const { ctx, service } = this
    const users = await service.user.list()
    ctx.body = { code: 0, data: users }
  }

  // GET /users/:id
  async show() {
    const { ctx, service } = this
    const user = await service.user.find(ctx.params.id)
    if (!user) {
      ctx.status = 404
      ctx.body = { code: 404, message: '用户不存在' }
      return
    }
    ctx.body = { code: 0, data: user }
  }

  // POST /users
  async create() {
    const { ctx, service } = this
    const body = ctx.request.body
    const user = await service.user.create(body)
    ctx.status = 201
    ctx.body = { code: 0, data: user }
  }

  // PUT /users/:id
  async update() {
    const { ctx, service } = this
    const user = await service.user.update(ctx.params.id, ctx.request.body)
    ctx.body = { code: 0, data: user }
  }

  // DELETE /users/:id
  async destroy() {
    const { ctx, service } = this
    await service.user.destroy(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = UserController
```

### 5.2 获取请求数据

```javascript
// app/controller/demo.js
const { Controller } = require('egg')

class DemoController extends Controller {
  async index() {
    const { ctx } = this

    // 1. 查询参数 — GET /api?name=egg&age=3
    const { name, age } = ctx.query
    // ctx.query = { name: 'egg', age: '3' }

    // 2. 查询字符串（原始）
    // GET /api?ids=1&ids=2
    ctx.querystring // 'ids=1&ids=2'

    // 3. 请求体（POST/PUT JSON）
    const body = ctx.request.body
    // 需要先配置 bodyParser:
    // config.bodyParser = { jsonLimit: '1mb' }

    // 4. 表单数据
    // Content-Type: application/x-www-form-urlencoded
    const formData = ctx.request.body

    // 5. 路径参数
    // GET /users/:id
    const id = ctx.params.id

    // 6. 请求头
    const token = ctx.get('Authorization')
    const contentType = ctx.get('Content-Type')

    // 7. 文件上传
    // Content-Type: multipart/form-data
    const stream = await ctx.getFileStream()
    const file = stream.fields // 表单字段
    // stream 为文件流

    // 8. Cookie
    const sessionId = ctx.cookies.get('session_id')

    ctx.body = { name, id }
  }
}

module.exports = DemoController
```

### 5.3 设置响应

```javascript
class DemoController extends Controller {
  async index() {
    const { ctx } = this

    // JSON 响应
    ctx.body = { code: 0, data: { name: 'egg' } }

    // 字符串响应
    ctx.body = 'Hello World'

    // 设置状态码
    ctx.status = 201

    // 设置响应头
    ctx.set('X-Custom-Header', 'value')
    ctx.set({
      'X-Header-1': 'value1',
      'X-Header-2': 'value2',
    })

    // 设置 Cookie
    ctx.cookies.set('token', 'abc123', {
      httpOnly: true,
      signed: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 天
    })

    // 重定向
    ctx.redirect('/login')

    // 渲染模板
    await ctx.render('home.nj', { title: 'Home' })

    // 文件下载
    ctx.attachment('report.pdf')
    ctx.set('Content-Type', 'application/pdf')
    ctx.body = fs.createReadStream('/path/to/report.pdf')
  }
}
```

---

## 六、服务层 (Service)

### 6.1 基础服务

```javascript
// app/service/user.js
const { Service } = require('egg')

class UserService extends Service {
  // 通过 this.ctx 访问上下文
  // 通过 this.config 访问配置
  // 通过 this.logger 访问日志

  async list() {
    const { ctx } = this
    // 调用数据库
    const users = await ctx.model.User.findAndCountAll({
      limit: 20,
      offset: 0,
    })
    return users
  }

  async find(id) {
    const { ctx } = this
    return await ctx.model.User.findByPk(id)
  }

  async create(data) {
    const { ctx } = this
    return await ctx.model.User.create(data)
  }

  async update(id, data) {
    const { ctx } = this
    const user = await ctx.model.User.findByPk(id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    return await user.update(data)
  }

  async destroy(id) {
    const { ctx } = this
    const user = await ctx.model.User.findByPk(id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await user.destroy()
  }
}

module.exports = UserService
```

### 6.2 服务间调用

```javascript
// app/service/order.js
const { Service } = require('egg')

class OrderService extends Service {
  async createOrder(data) {
    const { ctx, service } = this

    // 调用其他 service
    const user = await service.user.find(data.userId)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }

    // 检查库存
    const stock = await service.product.checkStock(data.productId, data.quantity)
    if (!stock) {
      ctx.throw(400, '库存不足')
    }

    // 创建订单
    const order = await ctx.model.Order.create({
      userId: user.id,
      productId: data.productId,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
    })

    return order
  }
}

module.exports = OrderService
```

### 6.3 调用外部 API

```javascript
// app/service/github.js
const { Service } = require('egg')

class GithubService extends Service {
  async getUser(username) {
    const { ctx } = this

    // 使用 ctx.curl 发起 HTTP 请求（内置 httpclient）
    const result = await ctx.curl(`https://api.github.com/users/${username}`, {
      dataType: 'json',
      timeout: 5000,
    })

    if (result.status !== 200) {
      ctx.throw(result.status, 'GitHub API 请求失败')
    }

    return result.data
  }

  async searchRepos(query) {
    const { ctx } = this

    const result = await ctx.curl('https://api.github.com/search/repositories', {
      dataType: 'json',
      data: { q: query, sort: 'stars' },
      timeout: 10000,
    })

    return result.data
  }
}

module.exports = GithubService
```

---

## 七、中间件

### 7.1 编写中间件

```javascript
// app/middleware/auth.js
module.exports = (options, app) => {
  return async function auth(ctx, next) {
    // 从请求头获取 token
    const token = ctx.get('Authorization')

    if (!token) {
      ctx.status = 401
      ctx.body = { code: 401, message: '未提供认证令牌' }
      return
    }

    try {
      // 验证 token
      const decoded = app.jwt.verify(token, app.config.jwt.secret)
      ctx.state.user = decoded

      // 继续执行后续中间件和路由
      await next()
    } catch (err) {
      ctx.status = 401
      ctx.body = { code: 401, message: '认证令牌无效' }
    }
  }
}
```

### 7.2 中间件配置

```javascript
// config/config.default.js
module.exports = {
  // 全局中间件
  middleware: ['auth', 'errorHandler'],

  // 中间件选项
  auth: {
    ignore: ['/login', '/register', '/api/public'], // 忽略路径
    match: '/api', // 只匹配此路径
  },

  // 自定义中间件配置
  errorHandler: {
    enable: true,
  },
}
```

### 7.3 常用中间件示例

```javascript
// app/middleware/errorHandler.js — 统一错误处理
module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (err) {
      // 记录日志
      ctx.app.emit('error', err, ctx)

      const status = err.status || 500
      const error = status === 500 ? { message: '服务器内部错误' } : { message: err.message }

      ctx.status = status
      ctx.body = {
        code: status,
        ...error,
      }
    }
  }
}

// app/middleware/cors.js — 跨域处理
module.exports = (options) => {
  return async function cors(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', options.origin || '*')
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    ctx.set('Access-Control-Max-Age', '86400')

    if (ctx.method === 'OPTIONS') {
      ctx.status = 204
      return
    }

    await next()
  }
}

// app/middleware/rateLimit.js — 速率限制
module.exports = (options = {}) => {
  const windowMs = options.windowMs || 60000
  const max = options.max || 100
  const store = new Map()

  return async function rateLimit(ctx, next) {
    const ip = ctx.ip
    const now = Date.now()

    if (!store.has(ip)) {
      store.set(ip, [])
    }

    const timestamps = store.get(ip).filter((ts) => now - ts < windowMs)

    if (timestamps.length >= max) {
      ctx.status = 429
      ctx.body = { code: 429, message: '请求过于频繁' }
      return
    }

    timestamps.push(now)
    store.set(ip, timestamps)
    await next()
  }
}
```

---

## 八、配置系统

### 8.1 多环境配置

```javascript
// config/config.default.js — 默认配置（所有环境共享）
module.exports = (appInfo) => {
  const config = {}

  // 应用密钥（用于 Cookie 签名等）
  config.keys = appInfo.name + '_your_secret_key'

  // 服务器配置
  config.cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1',
    },
  }

  // Body Parser
  config.bodyParser = {
    jsonLimit: '1mb',
    formLimit: '1mb',
  }

  // 静态资源
  config.static = {
    prefix: '/public/',
    dir: 'app/public',
    maxAge: 31536000,
  }

  // 安全配置
  config.security = {
    csrf: {
      enable: true,
      ignoreJSON: true,
    },
    domainWhiteList: ['.example.com'],
  }

  return config
}

// config/config.prod.js — 生产环境配置
module.exports = {
  // 数据库
  sequelize: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // 日志级别
  logger: {
    level: 'INFO',
    consoleLevel: 'WARN',
  },
}

// config/config.local.js — 本地开发配置
module.exports = {
  sequelize: {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    database: 'egg_dev',
    username: 'root',
    password: 'password',
    logging: true,
  },

  // 开发环境关闭 CSRF
  security: {
    csrf: { enable: false },
  },

  // 开发日志
  logger: {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  },
}
```

### 8.2 读取配置

```javascript
// 在 Controller/Service/Middleware 中
class MyController extends Controller {
  async index() {
    // 访问配置
    const dbConfig = this.config.sequelize
    const appKeys = this.config.keys

    // 访问应用信息
    const appName = this.app.config.name
  }
}

// 在插件中
module.exports = (app) => {
  const config = app.config.myPlugin
  // ...
}
```

---

## 九、插件机制

### 9.1 启用插件

```javascript
// config/plugin.js
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
}

exports.redis = {
  enable: true,
  package: 'egg-redis',
}

exports.jwt = {
  enable: true,
  package: 'egg-jwt',
}

exports.cors = {
  enable: true,
  package: 'egg-cors',
}

exports.validate = {
  enable: true,
  package: 'egg-validate',
}

// 使用本地路径
exports.myPlugin = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/my-plugin'),
}
```

### 9.2 常用插件

```bash
# 数据库
npm install egg-sequelize      # MySQL/PostgreSQL (Sequelize ORM)
npm install egg-mongoose       # MongoDB (Mongoose)

# 认证
npm install egg-jwt            # JWT 认证
npm install egg-passport       # Passport 认证

# 缓存
npm install egg-redis          # Redis 缓存

# 安全
npm install egg-cors           # 跨域支持

# 验证
npm install egg-validate       # 参数验证

# 视图
npm install egg-view-nunjucks  # Nunjucks 模板引擎
npm install egg-view-ejs       # EJS 模板引擎

# 定时任务
npm install egg-schedule       # 定时任务（内置）

# 其他
npm install egg-socket.io      # WebSocket
npm install egg-graphql         # GraphQL
```

### 9.3 自定义插件

```
egg-my-plugin/
├── app/
│   ├── middleware/
│   │   └── myMiddleware.js
│   ├── extend/
│   │   └── context.js
│   └── service/
│       └── myService.js
├── config/
│   └── config.default.js
├── app.js                     # 插件启动入口
├── agent.js                   # Agent 进程入口
└── package.json               # 需声明 eggPlugin
```

```json
// package.json
{
  "name": "egg-my-plugin",
  "eggPlugin": {
    "name": "myPlugin",
    "dependencies": ["sequelize"]
  }
}
```

```javascript
// app.js — 插件启动逻辑
module.exports = (app) => {
  // 在 app 启动时执行的初始化逻辑
  app.beforeStart(async () => {
    // 检查数据库连接
    await app.testDatabaseConnection()
  })
}
```

---

## 十、数据库集成

### 10.1 Sequelize (MySQL/PostgreSQL)

```bash
npm install egg-sequelize mysql2
```

```javascript
// config/config.default.js
exports.sequelize = {
  dialect: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  database: 'egg_db',
  username: 'root',
  password: 'password',
  define: {
    timestamps: true, // 自动添加 createdAt, updatedAt
    underscored: true, // 字段使用下划线命名
    freezeTableName: true, // 禁止自动表名复数化
  },
}
```

```javascript
// app/model/user.js
module.exports = (app) => {
  const { STRING, INTEGER, DATE, BOOLEAN } = app.Sequelize

  const User = app.model.define('user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: STRING(255),
      allowNull: false,
    },
    role: {
      type: STRING(20),
      defaultValue: 'user',
    },
    isActive: {
      type: BOOLEAN,
      defaultValue: true,
    },
  })

  // 模型关联
  User.associate = function () {
    // 一对多: User -> Post
    app.model.User.hasMany(app.model.Post, { foreignKey: 'userId' })
    // 一对多: User -> Comment
    app.model.User.hasMany(app.model.Comment, { foreignKey: 'userId' })
  }

  return User
}
```

```javascript
// app/service/user.js
const { Service } = require('egg')

class UserService extends Service {
  async list({ page = 1, limit = 20 } = {}) {
    const { ctx } = this
    const offset = (page - 1) * limit

    const result = await ctx.model.User.findAndCountAll({
      limit,
      offset,
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

  async find(id) {
    const { ctx } = this
    return await ctx.model.User.findByPk(id, {
      include: [{ model: ctx.model.Post, as: 'posts' }],
    })
  }

  async create(data) {
    const { ctx } = this
    return await ctx.model.User.create(data)
  }

  async update(id, data) {
    const { ctx } = this
    const user = await ctx.model.User.findByPk(id)
    if (!user) return null
    return await user.update(data)
  }

  async destroy(id) {
    const { ctx } = this
    const user = await ctx.model.User.findByPk(id)
    if (!user) return false
    await user.destroy()
    return true
  }
}

module.exports = UserService
```

### 10.2 Mongoose (MongoDB)

```bash
npm install egg-mongoose
```

```javascript
// config/config.default.js
exports.mongoose = {
  client: {
    url: 'mongodb://127.0.0.1:27017/egg_db',
    options: {},
  },
}
```

```javascript
// app/model/user.js
module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema(
    {
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
    },
    {
      timestamps: true,
    },
  )

  return mongoose.model('User', UserSchema)
}
```

---

## 十一、模板渲染

### 11.1 Nunjucks 模板

```bash
npm install egg-view-nunjucks
```

```javascript
// config/plugin.js
exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
}

// config/config.default.js
exports.view = {
  defaultViewEngine: 'nunjucks',
  mapping: {
    '.nj': 'nunjucks',
  },
}
```

```html
{# app/view/layout.nj #}
<!DOCTYPE html>
<html>
  <head>
    <title>{% block title %}默认标题{% endblock %}</title>
  </head>
  <body>
    <header>{% block header %}{% endblock %}</header>
    <main>{% block content %}{% endblock %}</main>
    <footer>© 2026 Egg.js App</footer>
  </body>
</html>
```

```html
{# app/view/home.nj #} {% extends "layout.nj" %} {% block title %}首页{% endblock %} {% block
content %}
<h1>欢迎, {{ user.name }}</h1>

{% if posts.length > 0 %}
<ul>
  {% for post in posts %}
  <li>
    <a href="/posts/{{ post.id }}">{{ post.title }}</a>
    <span>{{ post.createdAt | date('YYYY-MM-DD') }}</span>
  </li>
  {% endfor %}
</ul>
{% else %}
<p>暂无文章</p>
{% endif %} {% endblock %}
```

```javascript
// app/controller/home.js
class HomeController extends Controller {
  async index() {
    const { ctx, service } = this
    const user = ctx.state.user
    const posts = await service.post.list()

    await ctx.render('home.nj', { user, posts })
  }
}
```

---

## 十二、安全机制

### 12.1 CSRF 防护

```javascript
// config/config.default.js
exports.security = {
  csrf: {
    enable: true,
    ignoreJSON: true, // JSON 请求忽略 CSRF 检查
    cookieName: 'csrfToken',
    sessionName: 'csrfToken',
    headerName: 'x-csrf-token',
    bodyName: '_csrf',
    queryName: '_csrf',
  },
}

// 在模板中使用 CSRF token
// <input type="hidden" name="_csrf" value="{{ ctx.csrf }}">
```

### 12.2 XSS 防护

```javascript
// Egg.js 内置 XSS 防护

// 1. 安全 JSON 序列化（自动转义危险字符）
ctx.body = { data: '<script>alert("xss")</script>' }
// 输出会自动转义

// 2. 使用 helper 转义
// app/extend/helper.js
exports.escapeHtml = function (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// 在模板中: {{ helper.escapeHtml(userInput) }}
```

### 12.3 安全 Headers

```javascript
// config/config.default.js
exports.security = {
  // HSTS
  hsts: {
    enable: true,
    maxAge: 365 * 24 * 3600,
    includeSubDomains: true,
  },

  // X-Frame-Options
  xframe: {
    enable: true,
    value: 'SAMEORIGIN',
  },

  // 内容安全策略
  csp: {
    enable: true,
    policy: {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
    },
  },

  // Referrer 策略
  referrerPolicy: {
    enable: true,
    policy: 'no-referrer-when-downgrade',
  },
}
```

---

## 十三、错误处理

### 13.1 全局错误处理中间件

```javascript
// app/middleware/errorHandler.js
module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (err) {
      // 发送错误事件
      ctx.app.emit('error', err, ctx)

      const status = err.status || 500

      // 生产环境隐藏详细错误
      const message =
        status === 500 && ctx.app.config.env === 'prod' ? '服务器内部错误' : err.message

      ctx.status = status
      ctx.body = {
        success: false,
        code: status,
        message,
        // 开发环境返回堆栈信息
        ...(ctx.app.config.env === 'local' && { stack: err.stack }),
      }
    }
  }
}
```

### 13.2 自定义业务错误

```javascript
// app/extend/context.js — 扩展 ctx 方法
module.exports = {
  // 抛出业务错误
  throwBizError(code, message) {
    const err = new Error(message)
    err.status = code
    err.code = code
    throw err
  },

  // 统一成功响应
  success(data = null, message = 'ok') {
    this.body = { success: true, code: 0, data, message }
  },

  // 统一失败响应
  fail(code = 500, message = 'error') {
    this.status = code >= 100 && code < 600 ? code : 500
    this.body = { success: false, code, message }
  },
}

// 在 Controller 中使用
class UserController extends Controller {
  async show() {
    const { ctx, service } = this
    const user = await service.user.find(ctx.params.id)

    if (!user) {
      ctx.fail(404, '用户不存在')
      return
    }

    ctx.success(user)
  }
}
```

---

## 十四、定时任务

### 14.1 基础定时任务

```javascript
// app/schedule/clean_log.js
exports.schedule = {
  type: 'worker', // 每台机器只有一个 worker 执行
  cron: '0 0 2 * * *', // 每天凌晨 2 点执行
  // 或使用 interval
  // interval: '1h',   // 每小时执行
  // interval: '10m',  // 每 10 分钟执行
  immediate: false, // 启动时不立即执行
  disable: false, // 是否禁用
}

exports.task = async (ctx) => {
  ctx.logger.info('开始清理过期日志...')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  await ctx.model.Log.destroy({
    where: {
      createdAt: { $lt: thirtyDaysAgo },
    },
  })

  ctx.logger.info('过期日志清理完成')
}
```

### 14.2 任务类型

```javascript
// type: 'worker'  — 每台机器随机选一个 worker 执行
// type: 'all'     — 每台机器所有 worker 都执行

// app/schedule/sync_data.js — 所有 worker 执行
exports.schedule = {
  type: 'all',
  interval: '5m',
}

exports.task = async (ctx) => {
  ctx.logger.info(`Worker ${process.pid} 正在同步数据...`)
  await ctx.service.sync.pull()
}
```

---

## 十五、日志系统

### 15.1 日志配置

```javascript
// config/config.default.js
exports.logger = {
  dir: 'logs', // 日志目录
  level: 'INFO', // 文件日志级别
  consoleLevel: 'INFO', // 控制台日志级别
  outputJSON: false, // 是否输出 JSON 格式
  appLogName: 'app.log', // 应用日志文件名
  coreLogName: 'core.log', // 框架日志文件名
  agentLogName: 'agent.log', // Agent 日志文件名
  errorLogName: 'error.log', // 错误日志文件名
}

// 日志级别:
// DEBUG < INFO < WARN < ERROR < NONE
```

### 15.2 使用日志

```javascript
// 在 Controller/Service 中
class MyService extends Service {
  async process() {
    // ctx.logger — 请求级日志（带 requestId）
    this.ctx.logger.debug('调试信息')
    this.ctx.logger.info('普通信息')
    this.ctx.logger.warn('警告信息')
    this.ctx.logger.error('错误信息')

    // app.logger — 应用级日志
    this.app.logger.info('应用信息')

    // coreLogger — 框架级日志
    this.app.coreLogger.info('框架信息')
  }
}
```

---

## 十六、测试

### 16.1 单元测试

```javascript
// test/app/controller/user.test.js
const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/controller/user.test.js', () => {
  it('GET /api/users', async () => {
    const res = await app.httpRequest().get('/api/users').expect(200)

    assert(res.body.success === true)
    assert(Array.isArray(res.body.data))
  })

  it('GET /api/users/:id', async () => {
    const res = await app.httpRequest().get('/api/users/1').expect(200)

    assert(res.body.data.id === 1)
  })

  it('POST /api/users', async () => {
    const res = await app
      .httpRequest()
      .post('/api/users')
      .send({ username: 'test', email: 'test@test.com' })
      .expect(201)

    assert(res.body.data.username === 'test')
  })

  it('GET /api/users/:id - not found', async () => {
    await app.httpRequest().get('/api/users/999').expect(404)
  })
})
```

### 16.2 Service 测试

```javascript
// test/app/service/user.test.js
const { app, assert, mock } = require('egg-mock/bootstrap')

describe('test/app/service/user.test.js', () => {
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

  it('should return null for non-existent user', async () => {
    const ctx = app.mockContext()
    const user = await ctx.service.user.find(999)

    assert(user === null)
  })
})
```

### 16.3 Mock 测试

```javascript
const { app, mock } = require('egg-mock/bootstrap')

describe('mock test', () => {
  // Mock Service 方法
  it('should mock service', async () => {
    const ctx = app.mockContext()

    mock(ctx.service.user, 'find', async (id) => {
      return { id, username: 'mock_user' }
    })

    const user = await ctx.service.user.find(1)
    assert(user.username === 'mock_user')
  })

  // Mock HTTP 请求
  it('should mock http request', async () => {
    mock(app.httpclient, 'curl', async () => {
      return { status: 200, data: { login: 'mock_user' } }
    })

    const ctx = app.mockContext()
    const result = await ctx.service.github.getUser('test')
    assert(result.login === 'mock_user')
  })

  // Mock 配置
  it('should mock config', async () => {
    mock(app.config, 'customKey', 'mock_value')
    assert(app.config.customKey === 'mock_value')
  })
})
```

---

## 十七、部署发布

### 17.1 生产启动

```bash
# 标准启动（多进程模式）
npm start
# 等价于: egg-scripts start --daemon

# 停止
npm stop

# 指定参数启动
npx egg-scripts start \
  --port=7001 \
  --workers=4 \
  --daemon \
  --title=egg-app

# 前台启动（调试用）
npx egg-scripts start --port=7001
```

### 17.2 Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci --production

# 复制源码
COPY . .

# 暴露端口
EXPOSE 7001

# 启动
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  app:
    build: .
    ports:
      - '7001:7001'
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=egg_db
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: egg_db
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  mysql_data:
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

  # 静态资源直接 Nginx 处理
  location /public/ {
    alias /app/app/public/;
    expires 30d;
  }
}
```

### 17.4 PM2 部署

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'egg-app',
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
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs egg-app

# 重启
pm2 restart egg-app

# 停止
pm2 stop egg-app
```

---

## 十八、最佳实践

### 18.1 项目结构规范

```
✅ 推荐:
├── Controller 只做参数校验和转发，不写业务逻辑
├── Service 承载所有业务逻辑
├── Model 只定义数据结构
├── 公共逻辑抽取到 extend/helper.js
├── 配置按环境分文件
└── 中间件职责单一

❌ 避免:
├── Controller 中直接操作数据库
├── Service 中处理 HTTP 请求/响应
├── 硬编码配置值
└── 中间件逻辑过于复杂
```

### 18.2 统一响应格式

```javascript
// app/extend/context.js
module.exports = {
  success(data, message = 'ok') {
    this.body = {
      success: true,
      code: 0,
      data,
      message,
    }
  },

  fail(code, message) {
    this.body = {
      success: false,
      code,
      message,
    }
  },

  paginate({ list, total, page, limit }) {
    this.body = {
      success: true,
      code: 0,
      data: {
        list,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  },
}
```

### 18.3 参数校验

```javascript
// 使用 egg-validate 插件
// app/controller/user.js
class UserController extends Controller {
  async create() {
    const { ctx } = this

    // 参数校验规则
    const rules = {
      username: { type: 'string', min: 2, max: 50 },
      email: { type: 'email' },
      password: { type: 'password', min: 8 },
      age: { type: 'int', min: 0, max: 150, required: false },
    }

    // 校验请求体
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.fail(400, errors.map((e) => e.message).join(', '))
      return
    }

    const user = await ctx.service.user.create(ctx.request.body)
    ctx.success(user, '创建成功')
  }
}
```

### 18.4 性能优化清单

```
1. 数据库优化
   ├── 使用索引加速查询
   ├── 合理使用连接池
   ├── 分页查询避免全量加载
   └── 使用 Redis 缓存热点数据

2. 应用层优化
   ├── 开启 Gzip 压缩
   ├── 合理使用多进程 (worker 数 = CPU 核心数)
   ├── 避免阻塞事件循环
   └── 使用 Stream 处理大文件

3. 安全优化
   ├── 开启 HTTPS
   ├── 配置安全 Headers
   ├── 参数校验和过滤
   └── 定期更新依赖
```

---

## 附录

### A. 常用命令

```bash
# 开发
npm run dev           # 开发模式 (热重载)
npm run debug         # 调试模式

# 生产
npm start             # 生产启动
npm stop              # 停止

# 测试
npm test              # 运行测试
npm run cov           # 覆盖率

# 工具
npm run lint          # 代码检查
npm run lint:fix      # 自动修复
npm run autod         # 自动更新依赖
```

### B. Egg.js 生态

| 插件              | 用途           |
| ----------------- | -------------- |
| egg-sequelize     | MySQL/PG ORM   |
| egg-mongoose      | MongoDB        |
| egg-redis         | Redis 缓存     |
| egg-jwt           | JWT 认证       |
| egg-passport      | OAuth 认证     |
| egg-cors          | 跨域支持       |
| egg-validate      | 参数校验       |
| egg-view-nunjucks | Nunjucks 模板  |
| egg-socket.io     | WebSocket      |
| egg-graphql       | GraphQL        |
| egg-ci            | CI/CD 配置生成 |

### C. 学习资源

- **官方文档**: https://www.eggjs.org/
- **GitHub**: https://github.com/eggjs/egg
- **插件市场**: https://github.com/eggjs/egg/wiki#plugins
- **示例项目**: https://github.com/eggjs/examples

---

**提示**: 本手册基于 Egg.js V3.x 版本编写，V4.x 版本有较大的架构变更，请参考官方文档。
