---
title: "Node.js Web 框架对比与 API 设计 [P6-P7]"
level: "senior"
tags: ["Node.js", "Express", "Koa", "NestJS", "Fastify"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Node.js Web 框架对比与 API 设计 [P6-P7]

> Node.js Web 框架从 Express 的极简主义到 NestJS 的企业级架构，各有适用场景。2026 年，Fastify 和 Hono 在性能赛道脱颖而出。

## 核心概念（What）

### 框架对比矩阵

| 框架 | 性能 | 学习曲线 | 生态 | 适用场景 |
|------|------|----------|------|----------|
| **Express** | 中 | 低 | 最丰富 | 快速原型、小型项目 |
| **Koa** | 中 | 低 | 中等 | 中间件定制、轻量 API |
| **Fastify** | 高 | 中 | 增长中 | 高性能 API、微服务 |
| **NestJS** | 中 | 高 | 丰富 | 大型企业项目、微服务 |
| **Hono** | 极高 | 低 | 增长中 | Edge Runtime、全栈 |

---

## 底层原理（Why）

### 1. 中间件模型对比

```javascript
// Express：回调式中间件
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Koa：洋葱模型（async/await）
app.use(async (ctx, next) => {
  ctx.state.startTime = Date.now();
  await next();
  const duration = Date.now() - ctx.state.startTime;
  ctx.set('X-Response-Time', `${duration}ms`);
});

// Fastify：插件系统 + Hook
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now();
});
fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - request.startTime;
  reply.header('X-Response-Time', `${duration}ms`);
});
```

### 2. Fastify 高性能秘密

```
Fastify 性能优化：
├── 基于 find-my-way 的路由（基数树，O(1) 查找）
├── 序列化使用 fast-json-stringify（预编译 Schema）
├── Schema 验证使用 Ajv（JIT 编译验证函数）
├── 插件系统支持异步加载
└── 内置日志（Pino，比 console.log 快 5 倍）
```

### 3. NestJS 架构

```
NestJS 核心概念：
├── Module：功能模块（依赖注入容器）
├── Controller：路由处理
├── Service：业务逻辑
├── Guard：认证/授权
├── Interceptor：请求/响应转换
├── Pipe：数据验证/转换
├── Filter：异常处理
└── Middleware：兼容 Express 中间件
```

---

## 高频面试题

### Q1: Express 和 Fastify 的性能差异在哪里？

**参考答案要点**：
- Fastify 使用基数树路由（O(1)），Express 使用线性遍历
- Fastify 预编译 JSON Schema 序列化，Express 使用 JSON.stringify
- Fastify 内置 Ajv JIT 验证，Express 需要额外中间件
- 基准测试：Fastify 比 Express 快 2-3 倍

### Q2: NestJS 的依赖注入是如何实现的？

**参考答案要点**：
- 使用 TypeScript 装饰器 + Reflect Metadata
- IoC 容器管理模块和依赖关系
- 支持构造函数注入、属性注入、工厂注入
- 模块可以导入其他模块，形成依赖图

### Q3: 如何设计 RESTful API？

**参考答案要点**：
- 资源命名：使用名词复数（/users, /orders）
- HTTP 方法语义：GET 查询、POST 创建、PUT 全量更新、PATCH 部分更新、DELETE 删除
- 状态码：200/201/204 成功、400/401/403/404 客户端错误、500 服务端错误
- 分页：cursor-based 优于 offset-based
- 版本管理：URL 路径（/v1/users）或请求头（Accept-Version）

---

## 延伸思考

1. **设计题**：设计一个支持百万并发的 Node.js API 网关。
2. **场景题**：Express 项目如何渐进迁移到 Fastify？
3. **对比题**：Hono vs Fastify vs Elysia，Edge Runtime 框架对比？

---

## 参考资料

- [Fastify 文档](https://www.fastify.io)
- [NestJS 文档](https://docs.nestjs.com)
- [Hono 文档](https://hono.dev)
- [RESTful API 设计指南](https://restfulapi.net)
