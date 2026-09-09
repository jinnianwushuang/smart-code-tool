---
title: 'Node.js 数据库与 ORM 集成 [P6-P7]'
level: 'senior'
tags: ['Node.js', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ORM']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Node.js 数据库与 ORM 集成 [P6-P7]

> 前端工程师向全栈延伸，数据库是必经之路。2026 年，Prisma 成为 TypeScript ORM 的事实标准，同时 Redis 缓存层和连接池管理是面试高频考点。

## 核心概念（What）

### 数据库选型矩阵

| 数据库         | 类型   | 适用场景                  | Node.js 驱动       |
| -------------- | ------ | ------------------------- | ------------------ |
| **PostgreSQL** | 关系型 | 复杂查询、事务、JSON 支持 | pg / Prisma        |
| **MySQL**      | 关系型 | Web 应用、成熟生态        | mysql2 / Prisma    |
| **MongoDB**    | 文档型 | 灵活 Schema、快速迭代     | mongodb / Mongoose |
| **Redis**      | 键值型 | 缓存、会话、排行榜        | ioredis            |

### ORM 对比

| ORM         | 类型安全 | 迁移 | 学习曲线 | 适用场景            |
| ----------- | -------- | ---- | -------- | ------------------- |
| **Prisma**  | 极高     | 内置 | 低       | TypeScript 项目首选 |
| **TypeORM** | 高       | 内置 | 中       | NestJS 生态         |
| **Drizzle** | 极高     | 内置 | 低       | 轻量、Edge Runtime  |
| **Knex**    | 中       | 内置 | 中       | SQL-like API、灵活  |

---

## 底层原理（Why）

### 1. Prisma 工作原理

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int    @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User   @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

```typescript
// Prisma Client 使用
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 类型安全的查询
const users = await prisma.user.findMany({
  where: { email: { endsWith: '@example.com' } },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
})

// 事务
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'alice@example.com' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } }),
])
```

### 2. 连接池管理

```typescript
// 连接池配置
const pool = new mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0, // 排队请求数（0=无限）
  enableKeepAlive: true, // 保持连接活跃
  keepAliveInitialDelay: 10000,
})

// 连接池泄漏排查
// 1. 确保每次查询后释放连接
// 2. 使用 pool.on('acquire') 监控连接获取
// 3. 设置 idleTimeout 回收空闲连接
```

### 3. Redis 缓存层

```typescript
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

// Cache-Aside 模式
async function getUserById(id: number) {
  const cacheKey = `user:${id}`

  // 1. 先查缓存
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // 2. 缓存未命中，查数据库
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null

  // 3. 写入缓存，设置 TTL
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600)
  return user
}

// 缓存失效策略
async function updateUser(id: number, data: UpdateUserDto) {
  const user = await prisma.user.update({ where: { id }, data })
  await redis.del(`user:${id}`) // 写后失效
  return user
}
```

### 4. 事务处理

```typescript
// 交互式事务（推荐）
await prisma.$transaction(async (tx) => {
  // 扣减库存
  await tx.inventory.update({
    where: { productId: id },
    data: { quantity: { decrement: 1 } },
  })

  // 创建订单
  await tx.order.create({
    data: { userId, productId: id, status: 'PENDING' },
  })

  // 如果任何一步失败，整个事务回滚
})

// 隔离级别
// READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
// 安全性递增，性能递减
// 默认：PostgreSQL READ COMMITTED / MySQL REPEATABLE READ
```

---

## 高频面试题

### Q1: Prisma 相比传统 ORM 有什么优势？

**参考答案要点**：

- 自动生成类型安全的 Client（基于 Schema 推导）
- 声明式 Schema（类 GraphQL 语法）
- 内置迁移工具
- 支持关系型数据库的关联查询（include、select）
- 与 TypeScript 深度集成，查询结果类型自动推导

### Q2: 如何解决数据库连接池耗尽问题？

**参考答案要点**：

- 合理设置 connectionLimit（CPU 核数 × 2 + 磁盘数）
- 使用连接池健康检查（ping/pong）
- 避免长事务占用连接
- 使用连接池监控（acquire/release 事件）
- Serverless 场景使用 Serverless 连接池（如 PlanetScale、Neon）

### Q3: Cache-Aside 和 Write-Through 缓存策略有什么区别？

**参考答案要点**：

- Cache-Aside：读时加载缓存，写时失效缓存（最常用）
- Write-Through：写操作同时写数据库和缓存（一致性好，延迟高）
- Write-Behind：写操作只写缓存，异步批量写数据库（性能高，可能丢数据）
- 选择依据：读多写少用 Cache-Aside，强一致用 Write-Through

---

## 延伸思考

1. **设计题**：设计一个支持读写分离的数据库架构。
2. **场景题**：高并发下如何防止缓存穿透和缓存雪崩？
3. **对比题**：Prisma vs Drizzle vs TypeORM，2026 年该怎么选？

---

## 参考资料

- [Prisma 文档](https://www.prisma.io/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Redis 缓存策略](https://redis.io/docs/manual/patterns/)
- [数据库连接池最佳实践](https://github.com/sidorares/node-mysql2/blob/master/documentation/Promise-Wrapper.md)
