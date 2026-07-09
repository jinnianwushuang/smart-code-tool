# Prisma ORM 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Node.js/TypeScript 开发者、后端工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、Schema 定义](#二schema-定义)
- [三、数据模型](#三数据模型)
- [四、关系定义](#四关系定义)
- [五、CRUD 操作](#五crud-操作)
- [六、查询操作](#六查询操作)
- [七、事务处理](#七事务处理)
- [八、迁移管理](#八迁移管理)
- [九、高级特性](#九高级特性)
- [十、最佳实践](#十最佳实践)

---

## 一、基础概念

### 1.1 什么是 Prisma

Prisma 是一个开源的下一代 ORM，包含：

- **Prisma Client**: 类型安全的数据库客户端
- **Prisma Migrate**: 数据库迁移工具
- **Prisma Studio**: 数据库可视化工具

### 1.2 安装和初始化

```bash
# 安装 Prisma CLI
npm install prisma --save-dev

# 初始化 Prisma
npx prisma init

# 安装 Prisma Client
npm install @prisma/client
```

### 1.3 项目结构

```
prisma/
├── schema.prisma      # Schema 定义
├── migrations/        # 迁移文件
└── seed.ts           # 种子数据
```

### 1.4 环境变量

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## 二、Schema 定义

### 2.1 基本结构

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### 2.2 数据源配置

```prisma
// PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// MySQL
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// SQLite
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// SQL Server
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

// MongoDB
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

### 2.3 生成器配置

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "./generated/client"
  previewFeatures = ["fullTextSearch"]
}
```

---

## 三、数据模型

### 3.1 标量类型

```prisma
model Example {
  id        Int       @id @default(autoincrement())
  string    String
  int       Int
  float     Float
  boolean   Boolean   @default(false)
  dateTime  DateTime  @default(now())
  bytes     Bytes
  decimal   Decimal   @db.Decimal(10, 2)
  bigInt    BigInt
  json      Json
}
```

### 3.2 属性修饰符

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?  // 可选字段
  age       Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  role      Role     @default(USER)
}

enum Role {
  USER
  ADMIN
}
```

### 3.3 唯一约束

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  username  String

  @@unique([email, username]) // 复合唯一
}
```

### 3.4 索引

```prisma
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String

  @@index([title])
  @@index([title, content])
}
```

### 3.5 默认值

```prisma
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  isActive  Boolean  @default(true)
  role      String   @default("user")
  score     Int      @default(0)
}
```

---

## 四、关系定义

### 4.1 一对一关系

```prisma
model User {
  id       Int      @id @default(autoincrement())
  profile  Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
```

### 4.2 一对多关系

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### 4.3 多对多关系

```prisma
// 隐式多对多
model Post {
  id         Int        @id @default(autoincrement())
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

// 显式多对多（推荐）
model Post {
  id            Int              @id @default(autoincrement())
  categories    CategoriesOnPosts[]
}

model Category {
  id       Int              @id @default(autoincrement())
  posts    CategoriesOnPosts[]
}

model CategoriesOnPosts {
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int

  @@id([postId, categoryId])
}
```

### 4.4 自引用关系

```prisma
model Employee {
  id            Int        @id @default(autoincrement())
  name          String
  managerId     Int?
  manager       Employee?  @relation("EmployeeToManager", fields: [managerId], references: [id])
  subordinates  Employee[] @relation("EmployeeToManager")
}
```

---

## 五、CRUD 操作

### 5.1 创建记录

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 创建单条记录
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
})

// 创建并关联
const post = await prisma.post.create({
  data: {
    title: 'My Post',
    content: 'Content here',
    author: {
      connect: { id: 1 },
    },
  },
})

// 嵌套创建
const userWithPost = await prisma.user.create({
  data: {
    email: 'bob@example.com',
    posts: {
      create: {
        title: 'First Post',
        content: 'Hello!',
      },
    },
  },
  include: {
    posts: true,
  },
})
```

### 5.2 读取记录

```typescript
// 查找单条
const user = await prisma.user.findUnique({
  where: { id: 1 },
})

// 查找第一条
const user = await prisma.user.findFirst({
  where: { email: 'alice@example.com' },
})

// 查找所有
const users = await prisma.user.findMany()

// 带条件查找
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: 'example.com',
    },
  },
})
```

### 5.3 更新记录

```typescript
// 更新单条
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: 'Alice Updated',
  },
})

// 更新或创建
const user = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice' },
  create: {
    email: 'alice@example.com',
    name: 'Alice',
  },
})

// 批量更新
const result = await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { isActive: false },
})
```

### 5.4 删除记录

```typescript
// 删除单条
const user = await prisma.user.delete({
  where: { id: 1 },
})

// 批量删除
const result = await prisma.user.deleteMany({
  where: { isActive: false },
})
```

---

## 六、查询操作

### 6.1 过滤条件

```typescript
const users = await prisma.user.findMany({
  where: {
    // 等于
    age: 25,

    // 不等于
    age: { not: 25 },

    // 在列表中
    id: { in: [1, 2, 3] },

    // 不在列表中
    id: { notIn: [4, 5] },

    // 小于
    age: { lt: 30 },

    // 小于等于
    age: { lte: 30 },

    // 大于
    age: { gt: 18 },

    // 大于等于
    age: { gte: 18 },

    // 包含
    name: { contains: 'John' },

    // 以...开头
    email: { startsWith: 'admin' },

    // 以...结尾
    email: { endsWith: '.com' },

    // 匹配正则
    name: { mode: 'insensitive' },
  },
})
```

### 6.2 排序

```typescript
const users = await prisma.user.findMany({
  orderBy: {
    createdAt: 'desc',
  },
})

// 多字段排序
const users = await prisma.user.findMany({
  orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
})
```

### 6.3 分页

```typescript
// 基于偏移的分页
const users = await prisma.user.findMany({
  skip: 10,
  take: 20,
})

// 基于游标的分页
const users = await prisma.user.findMany({
  cursor: { id: lastSeenId },
  take: 20,
  skip: 1, // 跳过游标本身
})

// 获取总数
const [users, total] = await prisma.$transaction([
  prisma.user.findMany({ skip: 0, take: 10 }),
  prisma.user.count(),
])
```

### 6.4 选择字段

```typescript
// 只选择特定字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
})

// 排除某些字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        title: true,
      },
    },
  },
})
```

### 6.5 包含关系

```typescript
// 包含关联数据
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true,
  },
})

// 嵌套包含
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: {
        comments: true,
      },
    },
  },
})

// 过滤关联数据
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
  },
})
```

### 6.6 聚合查询

```typescript
// 计数
const count = await prisma.user.count({
  where: {
    role: 'ADMIN',
  },
})

// 求和
const total = await prisma.order.aggregate({
  _sum: {
    amount: true,
  },
})

// 平均值
const avg = await prisma.product.aggregate({
  _avg: {
    price: true,
  },
})

// 最小值/最大值
const stats = await prisma.product.aggregate({
  _min: {
    price: true,
  },
  _max: {
    price: true,
  },
})

// 分组
const grouped = await prisma.post.groupBy({
  by: ['authorId'],
  _count: {
    _all: true,
  },
})
```

### 6.7 原始查询

```typescript
// 原始 SQL
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE name = ${name}
`

// 原始 SQL（字符串）
const users = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE name = $1', name)

// 执行原始命令
await prisma.$executeRaw`
  UPDATE User SET active = false WHERE lastLogin < ${date}
`
```

---

## 七、事务处理

### 7.1 批量事务

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: { email: 'alice@example.com' },
  }),
  prisma.post.create({
    data: {
      title: 'Hello',
      authorId: 1,
    },
  }),
])
```

### 7.2 交互式事务

```typescript
const result = await prisma.$transaction(async (prisma) => {
  const user = await prisma.user.create({
    data: { email: 'alice@example.com' },
  })

  const post = await prisma.post.create({
    data: {
      title: 'Hello',
      authorId: user.id,
    },
  })

  return { user, post }
})
```

### 7.3 事务选项

```typescript
await prisma.$transaction(
  async (prisma) => {
    // 事务逻辑
  },
  {
    maxWait: 5000, // 最大等待时间（毫秒）
    timeout: 10000, // 超时时间（毫秒）
  },
)
```

---

## 八、迁移管理

### 8.1 创建迁移

```bash
# 创建迁移
npx prisma migrate dev --name add_user_model

# 创建迁移（生产环境）
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 创建迁移并跳过种子数据执行
npx prisma migrate dev --name add_post_model --skip-seed

# 创建迁移但不自动应用（仅生成 SQL 文件）
npx prisma migrate dev --name add_comment_model --create-only

# 指定 Schema 文件路径创建迁移
npx prisma migrate dev --name init --schema ./prisma/schema.prisma

# 强制重置数据库（跳过确认提示）
npx prisma migrate reset --force

# 基线已有数据库（将现有 Schema 标记为已迁移）
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > baseline.sql
```

### 8.2 迁移历史

```bash
# 查看迁移状态
npx prisma migrate status

# 回滚迁移
npx prisma migrate resolve --rolled-back "migration_name"

# 标记迁移为已应用
npx prisma migrate resolve --applied "migration_name"

# 查看所有迁移历史记录（含时间戳和状态）
npx prisma migrate status --verbose

# 生成两个 Schema 之间的迁移 SQL（不执行）
npx prisma migrate diff --from-schema-datasource ./prisma/schema.prisma --to-schema-datamodel ./prisma/schema.prisma

# 从迁移目录生成 SQL 脚本
npx prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --script

# 查看某次迁移的 SQL 内容
cat prisma/migrations/<migration_folder_name>/migration.sql

# 清理已失败的迁移记录（开发环境）
npx prisma migrate resolve --rolled-back "failed_migration_name"
npx prisma migrate dev --name retry_migration
```

### 8.3 种子数据

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 九、高级特性

### 9.1 中间件

```typescript
// Prisma Client 扩展
prisma.$use((params, next) => {
  if (params.action === 'create') {
    console.log('Creating:', params.args)
  }
  return next(params)
})
```

### 9.2 日志

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// 事件日志
prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Duration:', e.duration)
})
```

### 9.3 连接池

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// 自定义连接池大小
// DATABASE_URL 中添加 ?connection_limit=10
```

### 9.4 软删除

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  deletedAt DateTime?

  @@index([deletedAt])
}
```

```typescript
// 查询时排除已删除
const posts = await prisma.post.findMany({
  where: {
    deletedAt: null,
  },
})

// 软删除
await prisma.post.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
})
```

### 9.5 全文搜索

```prisma
// schema.prisma
model Post {
  id      Int    @id @default(autoincrement())
  title   String
  content String

  @@fulltext([title, content])
}
```

```typescript
const posts = await prisma.post.findMany({
  where: {
    OR: [{ title: { search: 'keyword' } }, { content: { search: 'keyword' } }],
  },
})
```

---

## 十、最佳实践

### 10.1 项目结构

```
prisma/
├── schema.prisma
├── migrations/
├── seed.ts
└── client.ts        # Prisma Client 单例

src/
├── lib/
│   └── prisma.ts    # Prisma 实例
├── services/
│   ├── user.service.ts
│   └── post.service.ts
└── controllers/
```

### 10.2 Prisma Client 单例

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### 10.3 错误处理

```typescript
import { Prisma } from '@prisma/client'

try {
  await prisma.user.create({
    data: { email: 'test@example.com' },
  })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      console.log('Unique constraint violation')
    }
  }
}
```

### 10.4 性能优化

```typescript
// 避免 N+1 问题 - 使用 include
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
})

// 只选择需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
  },
})

// 使用适当的分页
const users = await prisma.user.findMany({
  take: 20,
  skip: 0,
})
```

### 10.5 类型安全

```typescript
// 使用生成的类型
import { User, Post } from '@prisma/client'

function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data })
}

// 使用 Prisma Types
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>
```

### 10.6 环境变量

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
DIRECT_URL="postgresql://user:password@localhost:5432/mydb"
```

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 附录

### A. 常用命令

```bash
# 开发
npx prisma generate        # 生成 Client
npx prisma migrate dev     # 开发迁移
npx prisma studio          # 打开 Studio

# 生产
npx prisma migrate deploy  # 部署迁移
npx prisma generate        # 生成 Client

# 调试
npx prisma validate        # 验证 Schema
npx prisma format          # 格式化 Schema
npx prisma db pull         # 从数据库拉取 Schema
npx prisma db push         # 推送 Schema 到数据库

# Schema  introspection（数据库反向生成 Schema）
npx prisma db pull --schema ./prisma/schema.prisma

# 数据浏览与编辑
npx prisma studio --port 5556        # 指定端口启动 Studio
npx prisma studio --browser none     # 启动 Studio 但不自动打开浏览器

# 迁移辅助
npx prisma migrate status                              # 查看迁移状态
npx prisma migrate diff --from-schema-datamodel ./prisma/schema.prisma --to-schema-datasource ./prisma/schema.prisma  # 对比 Schema 与数据库差异
npx prisma migrate reset --force                       # 强制重置数据库
npx prisma migrate resolve --rolled-back "migration"   # 回滚指定迁移

# 生成与初始化
npx prisma generate --schema ./prisma/schema.prisma    # 指定 Schema 路径生成 Client
npx prisma generate --watch                            # 监听 Schema 变化自动生成 Client
npx prisma init                                        # 初始化 Prisma 项目
npx prisma init --datasource-provider sqlite             # 初始化并指定 SQLite 数据源
npx prisma init --datasource-provider postgresql         # 初始化并指定 PostgreSQL 数据源

# 版本与诊断
npx prisma --version         # 查看 Prisma CLI 版本
npx prisma debug             # 输出调试信息（用于排查问题）
```

### B. 有用的资源

- **官方文档**: https://www.prisma.io/docs
- **GitHub**: https://github.com/prisma/prisma
- **Prisma Examples**: https://github.com/prisma/prisma-examples
- **Prisma Slack**: https://slack.prisma.io/

### C. 学习路线

```
SQL 基础 → Prisma Schema → CRUD 操作 → 关系查询 → 迁移管理 → 高级特性 → 性能优化

1. SQL 和数据库基础
2. Prisma Schema 定义
3. 基本 CRUD 操作
4. 关系和关联查询
5. 过滤、排序、分页
6. 事务处理
7. 迁移管理
8. 性能优化
9. 类型安全
10. 生产部署
```

---

**祝您 Prisma 开发愉快！** 🚀
