---
title: "前端架构模式 [P8]"
level: "architect"
tags: ["Clean Architecture", "Hexagonal", "DDD", "架构模式"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 前端架构模式 [P8]

> 前端架构从 MVC 演进到 Clean Architecture、Hexagonal、DDD 前端落地，核心目标是**关注点分离**和**业务逻辑可测试**。

## 核心概念（What）

### 架构演进路线

```
MVC → MVP → MVVM → Clean Architecture → Hexagonal → DDD 前端落地
 │       │        │          │                │            │
 耦合    分离V    双向绑定   分层依赖         端口适配器   领域驱动
```

### 核心原则

- **依赖倒置**：内层（领域）不依赖外层（框架/UI）
- **业务逻辑独立**：不绑定任何框架，可独立测试
- **框架可替换**：React/Vue 只是实现细节

---

## 底层原理（Why）

### 1. Clean Architecture 分层

```
┌─────────────────────────────┐
│         UI / Framework      │  ← React/Vue 组件
│    (最外层，可随时替换)       │
├─────────────────────────────┤
│      Presenters / DTOs      │  ← 数据转换层
├─────────────────────────────┤
│     Use Cases (Interactors) │  ← 业务用例
├─────────────────────────────┤
│    Entities (Domain Models) │  ← 核心业务实体
│     (最内层，最稳定)          │
└─────────────────────────────┘

依赖方向：外层 → 内层（通过接口反转）
```

```typescript
// 内层：领域实体（不依赖任何框架）
class Order {
  constructor(
    public id: string,
    public items: OrderItem[],
    public status: OrderStatus,
  ) {}

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  canCancel(): boolean {
    return this.status === 'PENDING' || this.status === 'CONFIRMED';
  }
}

// 内层：用例（定义接口）
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

class CancelOrderUseCase {
  constructor(private orderRepo: OrderRepository) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (!order.canCancel()) throw new Error('Order cannot be cancelled');
    order.status = 'CANCELLED';
    await this.orderRepo.save(order);
  }
}

// 外层：基础设施实现
class ApiOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    return data ? OrderMapper.fromDTO(data) : null;
  }
  async save(order: Order): Promise<void> {
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      body: JSON.stringify(OrderMapper.toDTO(order)),
    });
  }
}
```

### 2. Hexagonal（端口与适配器）

```
        ┌──────────────┐
  HTTP  │   ┌──────┐   │  WebSocket
 ──────→│   │      │   │←──────
        │   │ Core │   │
  CLI  →│   │      │   │←─ Event
        │   └──────┘   │
        └──────────────┘

端口（Port）：核心暴露的接口（入端口）+ 依赖的外部接口（出端口）
适配器（Adapter）：端口的具体实现（HTTP Controller、DB Repository）
```

### 3. DDD 前端落地

```
DDD 核心概念在前端的映射：
├── Entity → 有唯一标识的领域对象（Order, User）
├── Value Object → 无标识，值相等即相同（Money, Address）
├── Aggregate → 一组相关对象的根（Order 包含 OrderItems）
├── Domain Event → 领域事件（OrderCreated, PaymentCompleted）
├── Repository → 仓储接口（前端实现为 API 调用）
└── Domain Service → 跨聚合的业务逻辑
```

```typescript
// Value Object
class Money {
  constructor(public amount: number, public currency: string) {}

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Domain Event
interface DomainEvent {
  type: string;
  payload: unknown;
  occurredAt: Date;
}

class OrderCreated implements DomainEvent {
  type = 'OrderCreated' as const;
  occurredAt = new Date();
  constructor(public payload: { orderId: string; total: number }) {}
}
```

---

## 高频面试题

### Q1: Clean Architecture 在前端项目中如何落地？

**参考答案要点**：
- 领域层：纯 TypeScript，不依赖任何框架
- 用例层：编排业务流程，依赖领域层接口
- 基础设施层：API 调用、本地存储等具体实现
- 展示层：React/Vue 组件，调用用例
- 关键：依赖方向由外向内，通过接口反转

### Q2: DDD 在前端有必要吗？

**参考答案要点**：
- 简单 CRUD 项目：不需要，MVC 足够
- 复杂业务逻辑（电商、金融）：DDD 帮助组织业务概念
- 核心价值：统一前后端语言（Ubiquitous Language）、业务逻辑可测试
- 风险：过度设计，小项目慎用

### Q3: Hexagonal 和 Clean Architecture 有什么区别？

**参考答案要点**：
- 本质相同：都是关注点分离 + 依赖倒置
- Clean Architecture 更强调分层（同心圆）
- Hexagonal 更强调端口/适配器的插拔能力
- 实际落地差异不大，选择一种坚持即可

---

## 延伸思考

1. **设计题**：将一个 MVC 结构的 React 项目重构为 Clean Architecture。
2. **场景题**：如何在大型前端项目中推行 DDD？
3. **对比题**：前端架构模式和后端微服务架构的异同？

---

## 参考资料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [DDD 在前端的实践](https://medium.com/@matiasfha/)
