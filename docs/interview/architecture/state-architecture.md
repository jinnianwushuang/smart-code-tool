---
title: "大型应用状态架构 [P8]"
level: "architect"
tags: ["状态管理", "有限状态机", "事件溯源", "CQRS"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 大型应用状态架构 [P8]

> 状态管理是前端架构的核心挑战。2026 年，从简单的 Store 模式演进到有限状态机、事件溯源、CQRS 前端，状态管理正在借鉴后端架构思想。

## 核心概念（What）

### 状态管理复杂度分级

| 级别 | 方案 | 适用场景 |
|------|------|----------|
| L1 | 组件本地状态 | 简单 UI 状态 |
| L2 | Context + useReducer | 跨组件共享 |
| L3 | Zustand / Pinia | 中型应用全局状态 |
| L4 | XState / 状态机 | 复杂流程控制 |
| L5 | 事件溯源 + CQRS | 审计追踪、协作编辑 |

---

## 底层原理（Why）

### 1. 有限状态机（XState）

```typescript
import { createMachine, assign } from 'xstate';

// 订单状态机
const orderMachine = createMachine({
  id: 'order',
  initial: 'draft',
  states: {
    draft: {
      on: {
        SUBMIT: { target: 'pending', actions: 'sendToServer' },
      },
    },
    pending: {
      on: {
        APPROVE: { target: 'confirmed' },
        REJECT: { target: 'rejected' },
        CANCEL: { target: 'cancelled' },
      },
    },
    confirmed: {
      on: {
        SHIP: { target: 'shipped' },
      },
    },
    shipped: {
      on: {
        DELIVER: { target: 'delivered' },
      },
    },
    delivered: { type: 'final' },
    rejected: { type: 'final' },
    cancelled: { type: 'final' },
  },
});

// 优势：
// 1. 状态转换可视化（状态图）
// 2. 不可能的状态天然被排除
// 3. 可测试性极强
// 4. 自动处理竞态条件
```

### 2. 事件溯源（Event Sourcing）

```typescript
// 不存储当前状态，而是存储所有事件
interface DomainEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: Date;
  version: number;
}

// 事件存储
class EventStore {
  private events: DomainEvent[] = [];

  append(event: DomainEvent) {
    this.events.push(event);
  }

  // 从事件重建状态
  replay<T>(reducer: (state: T, event: DomainEvent) => T, initial: T): T {
    return this.events.reduce(reducer, initial);
  }
}

// 示例：从事件重建购物车状态
const events: DomainEvent[] = [
  { type: 'ITEM_ADDED', payload: { id: 1, qty: 2 }, ... },
  { type: 'ITEM_ADDED', payload: { id: 2, qty: 1 }, ... },
  { type: 'ITEM_REMOVED', payload: { id: 1 }, ... },
];

// 当前状态 = 初始状态 + 所有事件
const cartState = events.reduce(reducer, { items: [] });
```

### 3. CQRS 前端

```
CQRS（Command Query Responsibility Segregation）：

命令端（写）：                    查询端（读）：
┌──────────┐                    ┌──────────┐
│ dispatch  │                    │ selector  │
│ (Intent)  │                    │ (Query)   │
└────┬─────┘                    └────┬─────┘
     │                               │
     ▼                               ▼
┌──────────┐                    ┌──────────┐
│ Command   │                    │ Read      │
│ Handler   │                    │ Model     │
│ (副作用)   │                    │ (缓存)    │
└────┬─────┘                    └──────────┘
     │
     ▼
┌──────────┐
│ Event     │
│ Store     │
└──────────┘

优势：
├── 读写分离，各自优化
├── 命令端可以做复杂验证
├── 查询端可以做缓存和派生
└── 完整的事件审计日志
```

### 4. 状态管理选型决策

```
选型决策树：
├── 状态只在单个组件？ → useState / ref
├── 父子/兄弟组件共享？ → Props / Provide-Inject
├── 全局状态，逻辑简单？ → Zustand / Pinia
├── 状态转换复杂，有明确流程？ → XState（状态机）
├── 需要撤销/重做、审计追踪？ → 事件溯源
└── 读写分离，高性能查询？ → CQRS
```

---

## 高频面试题

### Q1: 什么时候应该使用状态机？

**参考答案要点**：
- 状态数量有限，转换规则明确（订单流程、表单向导）
- 需要防止不可能的状态组合
- 需要处理异步竞态条件
- 需要可视化状态转换图
- 不需要：简单 CRUD、纯数据展示

### Q2: 事件溯源的优缺点？

**参考答案要点**：
- 优点：完整审计日志、支持时间旅行、可重建任意时刻状态
- 缺点：查询复杂（需 replay）、事件版本迁移困难、学习曲线陡
- 适用：金融系统、协作编辑、需要撤销/重做的场景

### Q3: CQRS 在前端有必要吗？

**参考答案要点**：
- 大多数前端应用不需要完整 CQRS
- 轻量版：写操作 dispatch action，读操作使用 selector/memo
- 重度版：事件溯源 + 查询模型（适合协作编辑、实时应用）
- 判断标准：业务复杂度是否值得引入额外复杂性

---

## 延伸思考

1. **设计题**：为一个在线协作白板应用设计状态管理架构。
2. **场景题**：如何将现有 Redux 应用迁移到状态机模式？
3. **对比题**：Signals vs State Machine vs Event Sourcing，各自的适用边界？

---

## 参考资料

- [XState 文档](https://xstate.js.org)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS](https://martinfowler.com/bliki/CQRS.html)
