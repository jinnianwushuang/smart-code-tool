---
title: 'BFF 模式与 API 网关 [P8]'
level: 'architect'
tags: ['BFF', 'API 网关', '接口聚合', 'OpenAPI', 'Protobuf']
difficulty: 'expert'
updated: '2026-09-10'
target: '架构师（P8）'
---

# BFF 模式与 API 网关 [P8]

> BFF（Backend For Frontend）和 API 网关是微服务架构中前端与服务端之间的关键层。2026 年，BFF 从简单的接口聚合演进为「体验编排层」。

## 核心概念（What）

### BFF vs API 网关

```
┌──────────┐  ┌──────────┐
│  Web 端   │  │ Mobile 端 │
└────┬─────┘  └────┬─────┘
     │              │
┌────▼─────┐  ┌────▼─────┐
│ Web BFF  │  │Mobile BFF│  ← BFF：按端定制
└────┬─────┘  └────┬─────┘
     │              │
┌────▼──────────────▼────┐
│      API 网关           │  ← 网关：通用能力
│  认证/限流/路由/日志     │
└────────────┬───────────┘
             │
┌────────────▼───────────┐
│    微服务集群            │
│ User  Order  Payment   │
└────────────────────────┘
```

| 层级         | 职责                         | 技术选型              |
| ------------ | ---------------------------- | --------------------- |
| **BFF**      | 接口聚合、数据裁剪、格式转换 | Node.js / Go          |
| **API 网关** | 认证、限流、路由、日志       | Kong / APISIX / Envoy |

---

## 底层原理（Why）

### 1. BFF 接口聚合

```typescript
// BFF：聚合多个微服务数据
async function getDashboard(userId: string) {
  // 并行请求多个服务
  const [user, orders, notifications] = await Promise.all([
    userService.getUser(userId),
    orderService.getRecentOrders(userId, 5),
    notificationService.getUnread(userId),
  ])

  // 按前端需求裁剪和组装
  return {
    user: {
      name: user.name,
      avatar: user.avatarUrl,
      level: user.membershipLevel,
    },
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.totalAmount,
      items: o.items.slice(0, 3).map((i) => i.productName),
    })),
    notifications: {
      count: notifications.length,
      latest: notifications[0]?.title,
    },
  }
}
```

### 2. API 网关配置

```yaml
# Apache APISIX 路由配置
routes:
  - uri: /api/v1/users/*
    upstream:
      type: roundrobin
      nodes:
        user-service:8080: 1
    plugins:
      jwt-auth: {}
      limit-count:
        count: 100
        time_window: 60
      cors:
        allow_origin: 'https://app.example.com'

  - uri: /api/v1/orders/*
    upstream:
      nodes:
        order-service:8080: 1
    plugins:
      jwt-auth: {}
      proxy-rewrite:
        headers:
          set:
            X-Service: order
```

### 3. OpenAPI 契约设计

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: Example API
  version: 1.0.0

paths:
  /users/{id}:
    get:
      summary: 获取用户信息
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
```

```
OpenAPI 工作流：
1. 后端先写 OpenAPI Spec（契约优先）
2. 自动生成：服务端 Stub + 客户端 SDK + 文档
3. Mock Server 供前端并行开发
4. CI 检查：实现是否符合 Spec
```

### 4. Protobuf 与 gRPC-Web

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User); // 服务端流
}

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

```
gRPC-Web 架构：
浏览器 → gRPC-Web Proxy（Envoy）→ gRPC 服务

优势：
├── 强类型（Protobuf 生成代码）
├── 高性能（二进制序列化）
├── 支持流式传输
└── 跨语言（自动生成多语言 Stub）

限制：
├── 浏览器不支持 HTTP/2 多路复用（需 Proxy 转换）
├── 调试不如 JSON 直观
└── 需要额外的 Proxy 层
```

---

## 高频面试题

### Q1: BFF 和 API 网关的职责如何划分？

**参考答案要点**：

- BFF：面向前端，按端定制（Web/Mobile 不同裁剪逻辑），负责接口聚合和数据转换
- API 网关：面向全局，提供通用能力（认证、限流、路由、日志、熔断）
- BFF 可以部署在网关之后，也可以独立部署
- 小团队可以合并 BFF 和网关，大团队建议分离

### Q2: 契约优先（Contract-First）开发模式的优势？

**参考答案要点**：

- 前后端并行开发（Mock Server）
- 自动生成代码（减少手写类型定义）
- API 变更可追溯（Spec 版本管理）
- CI 自动验证实现是否符合契约
- 工具：OpenAPI Generator、buf（Protobuf）

### Q3: 接口聚合的性能优化策略？

**参考答案要点**：

- 并行请求多个下游服务（Promise.all）
- 缓存热点数据（Redis）
- 超时控制（单个服务超时不影响整体）
- 降级策略（非核心服务失败时返回默认值）
- 请求合并（Batch Request）

---

## 延伸思考

1. **设计题**：设计一个支持多端（Web/App/小程序）的 BFF 架构。
2. **场景题**：API 网关如何实现灰度发布和流量镜像？
3. **对比题**：Kong vs APISIX vs Envoy 作为 API 网关的 trade-off？

---

## 参考资料

- [BFF Pattern](https://samnewman.io/patterns/architectural/bff/)
- [OpenAPI 规范](https://spec.openapis.org/oas/latest.html)
- [gRPC-Web 文档](https://github.com/grpc/grpc-web)
- [Apache APISIX 文档](https://apisix.apache.org)
