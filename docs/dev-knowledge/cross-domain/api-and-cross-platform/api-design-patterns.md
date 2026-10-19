---
title: 'API 设计模式与选型 [P8]'
level: 'architect'
tags: ['RESTful', 'GraphQL', 'tRPC', 'gRPC-Web', 'API 版本管理']
difficulty: 'hard'
target: '架构师（P8）'
---

# API 设计模式与选型 [P8]

> API 是前后端的契约边界。2026 年，RESTful 仍是主流，但 GraphQL、tRPC 在特定场景展现强大优势，gRPC-Web 在微服务间通信成为标配。

## 核心概念（What）

### API 范式对比

| 范式         | 类型安全           | 实时性             | 学习曲线 | 适用场景            |
| ------------ | ------------------ | ------------------ | -------- | ------------------- |
| **RESTful**  | 低（需手动定义）   | 低                 | 低       | 通用 CRUD、公开 API |
| **GraphQL**  | 高（Schema 驱动）  | 中（Subscription） | 中       | 复杂查询、多端适配  |
| **tRPC**     | 极高（端到端类型） | 低                 | 低       | TypeScript 全栈     |
| **gRPC-Web** | 高（Protobuf）     | 高（Stream）       | 高       | 微服务通信、高性能  |

---

## 底层原理（Why）

### 1. REST 资源模型：统一接口约束 + HTTP 语义

REST 的底层不是「URL 命名规范」，而是**面向资源的架构约束 + HTTP 方法的形式化语义 + 超媒体驱动**。

```
REST 统一接口约束（Uniform Interface）：

  四个子约束：
    1. 资源标识（Identification of Resources）：
       ├── 每个资源由 URI 唯一标识
       ├── 资源 ≠ 表示（同一资源可以有 JSON/XML/HTML 表示）
       └── URI 设计原则：名词复数（/users）、层级关系（/users/1/orders）

    2. 通过表示操作资源（Manipulation of Resources through Representations）：
       ├── 客户端持有资源表示（JSON）+ 元数据
       ├── 创建：POST /users（提交表示 → 服务端创建资源）
       ├── 读取：GET /users/1（获取表示）
       ├── 更新：PUT（全量替换）vs PATCH（部分修改）
       └── 删除：DELETE /users/1（幂等操作）

    3. 自描述消息（Self-descriptive Messages）：
       ├── Content-Type: application/json（消息格式）
       ├── Cache-Control: max-age=3600（缓存语义）
       ├── ETag + If-None-Match（条件请求）
       └── Link 头（HATEOAS：响应中包含相关操作的链接）

    4. 超媒体作为应用状态引擎（HATEOAS）：
       ├── 响应中包含可用操作的链接
       ├── 客户端通过链接发现下一步操作（不需要硬编码 URL）
       └── 实际落地较少（大多数 API 只实现了前三个约束）

  分页策略的底层选择：
    ├── Offset-based（?page=2&size=20）：
    │   ├── 简单直观，支持跳页
    │   └── 问题：数据变动时出现重复/遗漏
    ├── Cursor-based（?cursor=eyJpZCI6MTAwfQ）：
    │   ├── 基于上一页最后一条记录的标识
    │   ├── 一致性：不受数据变动影响
    │   └── 不支持跳页（只能上一页/下一页）
    └── Keyset-based（?since_id=100）：
        ├── 基于排序键的值（如 id > 100）
        ├── 性能最优（数据库索引直接定位）
        └── 限制：只能按索引字段排序

  API 错误模型（RFC 7807 Problem Details）：
    ├── 标准化错误响应格式：
    │   { type, title, status, detail, instance }
    ├── type：错误类型 URI（可机器解析）
    ├── status：HTTP 状态码
    ├── detail：人类可读的错误描述
    └── extensions：自定义扩展字段（如 field-level errors）
```

### 2. GraphQL 执行引擎：解析 → 验证 → 执行 → 序列化

GraphQL 的底层不是「前端按需查询」，而是**查询语言解析 + 类型系统验证 + Resolver 执行图 + DataLoader 批处理**。

```
GraphQL 执行管线：

  1. 解析阶段（Parse）：
     ├── 查询字符串 → Lexer（词法分析）→ Token 流
     ├── Token 流 → Parser（语法分析）→ AST（抽象语法树）
     └── AST 包含：Operation Definition、Selection Set、Field 节点

  2. 验证阶段（Validate）：
     ├── AST + Schema → 类型检查
     │   ├── 字段是否存在于类型定义中
     │   ├── 参数类型是否匹配
     │   ├── 片段引用是否有效
     │   └── 查询深度/复杂度限制（防止 DoS）
     └── 验证失败 → 返回错误（不执行查询）

  3. 执行阶段（Execute）：
     ├── 从根字段开始，递归执行 Resolver
     ├── 每个 Field 对应一个 Resolver 函数：
     │   (parent, args, context, info) → 返回值
     ├── Resolver 返回标量 → 直接使用
     ├── Resolver 返回对象 → 继续执行子字段的 Resolver
     └── 执行结果 = 与查询结构匹配的嵌套对象

  N+1 查询问题的底层原因与解决：
    ├── 问题根源：
    │   ├── 查询 { users { posts { title } } }
    │   ├── users Resolver → 1 次 SQL 查询（获取所有用户）
    │   ├── 每个 user 的 posts Resolver → N 次 SQL 查询
    │   └── 总计：1 + N 次查询（N = 用户数量）
    │
    └── DataLoader 解决方案：
        ├── 核心机制：同一事件循环内的请求批量合并
        │   ├── user1.posts 请求 → 加入批次队列
        │   ├── user2.posts 请求 → 加入批次队列
        │   └── 微任务调度时 → 一次性 SELECT * WHERE user_id IN (1, 2)
        ├── 缓存层：相同 ID 的请求直接返回缓存结果
        └── 限制：只能优化同一层级的 N+1（嵌套层级需要嵌套 DataLoader）
```

### 3. tRPC 端到端类型推导机制

tRPC 的底层不是「自动类型生成」，而是**TypeScript 条件类型 + 模板字面量类型 + 运行时路由代理**。

```
tRPC 端到端类型安全原理：

  核心机制：TypeScript 类型推导链
    ├── 服务端定义 Router：
    │   ├── router({ user: router({ getById: procedure... }) })
    │   └── TypeScript 推导出 AppRouter 类型（包含所有路由的类型签名）
    │
    ├── 类型传递：
    │   ├── AppRouter 类型通过泛型参数传递给客户端
    │   ├── createTRPCClient<AppRouter>({ url })
    │   └── 客户端调用 client.user.getById.query({ id: 1 })
    │       ├── "user" → 从 AppRouter 推导
    │       ├── "getById" → 从 user router 推导
    │       ├── .query 的参数类型 → 从 input schema (zod) 推导
    │       └── 返回值类型 → 从 Resolver 返回类型推导
    │
    └── 关键 TypeScript 技术：
        ├── 条件类型：根据 key 查找对应的类型
        │   type RouterShape<T> = T extends Router<infer S> ? S : never
        ├── 模板字面量类型：路径拼接的类型安全
        │   type RoutePath = `${Prefix}/${Suffix}`
        └── 递归类型：嵌套路由的类型展开

  零代码生成的实现原理：
    ├── 传统方案（OpenAPI/Protobuf）：
    │   ├── 服务端定义 Schema → 生成代码文件 → 客户端引入
    │   └── 需要构建步骤（代码生成 → 编译 → 发布）
    ├── tRPC 方案：
    │   ├── 服务端 Router 类型通过 TypeScript 编译时共享
    │   ├── 客户端直接引用 AppRouter 类型（不是生成的代码）
    │   └── 无需构建步骤（类型在编译时自动推导）
    └── 限制：要求前后端在同一个 TypeScript 项目中

  序列化协议：
    ├── 默认：superjson（支持 Date、Map、Set、undefined 等复杂类型）
    ├── 可选：JSON（标准，但不支持复杂类型）
    └── 自定义：实现 Transformer 接口
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

- 统一错误响应格式（RFC 7807 Problem Details）
- 区分 HTTP 状态码和业务状态码
- 参数校验错误返回字段级详情
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
