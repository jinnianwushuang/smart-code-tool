---
title: "API 设计模式与选型 [P8]"
level: "architect"
tags: ["RESTful", "GraphQL", "tRPC", "gRPC-Web", "API 版本管理"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
---

# API 设计模式与选型 [P8]

> API 是前后端的契约边界。2026 年，RESTful 仍是主流，但 GraphQL、tRPC 在特定场景展现强大优势，gRPC-Web 在微服务间通信成为标配。

## 核心概念（What）

### API 范式对比

| 范式 | 类型安全 | 实时性 | 学习曲线 | 适用场景 |
|------|---------|--------|----------|----------|
| **RESTful** | 低（需手动定义） | 低 | 低 | 通用 CRUD、公开 API |
| **GraphQL** | 高（Schema 驱动） | 中（Subscription） | 中 | 复杂查询、多端适配 |
| **tRPC** | 极高（端到端类型） | 低 | 低 | TypeScript 全栈 |
| **gRPC-Web** | 高（Protobuf） | 高（Stream） | 高 | 微服务通信、高性能 |

---

## 底层原理（Why）

### 1. RESTful 最佳实践

```typescript
// 统一响应格式
interface ApiResponse<T> {
  code: number;       // 业务状态码
  data: T;            // 数据
  message: string;    // 描述信息
  requestId: string;  // 链路追踪 ID
}

// 分页响应（Cursor-based）
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    prevCursor?: string;
    hasMore: boolean;
  };
}

// 错误响应
interface ApiError {
  code: number;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// RESTful 设计规范
// GET    /api/v1/users          → 列表（分页）
// GET    /api/v1/users/:id      → 详情
// POST   /api/v1/users          → 创建
// PUT    /api/v1/users/:id      → 全量更新
// PATCH  /api/v1/users/:id      → 部分更新
// DELETE /api/v1/users/:id      → 删除
```

### 2. GraphQL 实战

```graphql
# Schema 定义
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts(first: Int, after: String): PostConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

```typescript
// GraphQL 性能问题：N+1 查询
// 使用 DataLoader 解决
class UserDataLoader {
  private loader = new DataLoader<number, User>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids.map(Number) } },
    });
    const userMap = new Map(users.map(u => [u.id, u]));
    return ids.map(id => userMap.get(Number(id)));
  });

  getUser(id: number) {
    return this.loader.load(id);
  }
}
```

### 3. tRPC 端到端类型安全

```typescript
// 服务端 Router
const appRouter = router({
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return prisma.user.findUnique({ where: { id: input.id } });
      }),
    create: protectedProcedure
      .input(z.object({ name: z.string(), email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        return prisma.user.create({ data: input });
      }),
  }),
});

// 客户端（自动类型推导，无需生成代码）
const client = createTRPCClient<AppRouter>({ url: '/api' });
const user = await client.user.getById.query({ id: 1 });
// user 类型自动推导为 User | null
```

### 4. API 版本管理策略

```
版本管理方案对比：
├── URL 路径：/api/v1/users（最常用，直观）
├── 请求头：Accept: application/vnd.api.v1+json（REST 纯粹）
├── 查询参数：/api/users?version=1（不推荐）
└── 无版本：向后兼容 + 废弃通知（Google 风格）

推荐策略：
- 大版本变更（破坏性）→ URL 路径版本
- 小版本兼容 → 字段级别废弃 + Deprecation 头
- 文档标注 → OpenAPI/Swagger 同步更新
```

---

## 高频面试题

### Q1: REST vs GraphQL 如何选择？

**参考答案要点**：
- REST：接口简单、缓存友好、适合 CRUD 场景
- GraphQL：前端按需查询、减少 over-fetching、适合复杂数据关系
- 选择依据：数据关系复杂度、客户端多样性（多端适配）、团队技术栈
- 实际项目：核心业务 REST + 复杂查询场景 GraphQL 混合使用

### Q2: 如何设计 API 的错误处理规范？

**参考答案要点**：
- 统一错误响应格式（code + message + details）
- 区分 HTTP 状态码和业务状态码
- 参数校验错误返回字段级详情
- 使用 RFC 7807 Problem Details 标准
- 国际化支持（错误消息多语言）

### Q3: tRPC 的优缺点是什么？

**参考答案要点**：
- 优点：端到端类型安全、零代码生成、开发体验极佳
- 缺点：前后端必须同语言（TypeScript）、不支持非 TS 客户端
- 适用：全栈 TypeScript 项目（Next.js + tRPC）
- 不适用：对外开放 API、多语言客户端场景

---

## 延伸思考

1. **设计题**：为一个多端（Web/iOS/Android/小程序）应用设计统一的 API 层。
2. **场景题**：GraphQL 的 N+1 问题如何系统性解决？
3. **对比题**：OpenAPI vs Protobuf 作为 API 契约，各自的 trade-off？

---

## 参考资料

- [RESTful API 设计指南](https://restfulapi.net)
- [GraphQL 规范](https://spec.graphql.org)
- [tRPC 文档](https://trpc.io)
- [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807)
