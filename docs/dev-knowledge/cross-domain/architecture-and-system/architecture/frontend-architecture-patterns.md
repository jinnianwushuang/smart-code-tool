---
title: '前端架构模式 [P8]'
level: 'architect'
tags: ['Clean Architecture', 'Hexagonal', 'DDD', '架构模式']
difficulty: 'expert'
target: '架构师（P8）'
---

# 前端架构模式 [P8]

> 前端架构从 mvc 演进到 Clean Architecture、Hexagonal、DDD 前端落地，核心目标是**关注点分离**和**业务逻辑可测试**。

## 核心概念（What）

### 架构演进路线

```
MVC → MVP → MVVM → Clean Architecture → Hexagonal → DDD 前端落地
 │       │        │          │                │            │
 耦合    分离V    双向绑定   分层依赖         端口适配器   领域驱动
```

### 核心原则

- **依赖倒置**：内层（（领域）不依赖外层（框架/UI）
- **业务逻辑独立**：不绑定任何框架，可独立测试
- **框架可替换**：React/Vue 只是实现细节

---

## 底层原理（Why）

### 1. 依赖倒置的边界穿越机制

Clean Architecture 的底层不是「分层目录结构」，而是**依赖规则的形式化约束 + 边界穿越协议**。

```
依赖规则的形式化：

  核心约束：源码依赖只能指向内层（从外向内）
    ├── 外层模块 import 内层接口（依赖倒置）
    ├── 内层接口由外层实现（控制反转）
    └── 内层完全不知道外层的存在（解耦）

  边界穿越协议：
    请求方向（外 → 内）：
      UI 事件 → Use Case 接口 → Entity 方法
      ├── 数据以 DTO（Data Transfer Object）形式穿越边界
      ├── 每层边界进行数据转换（Mapper）
      └── 内层只接收业务对象（不是 API 响应）

    响应方向（内 → 外）：
      Entity 状态 → Use Case 返回 → UI 渲染
      ├── 内层返回业务结果（不关心如何展示）
      ├── 外层将结果转换为视图模型（ViewModel）
      └── UI 层绑定 ViewModel 进行渲染

  为什么分层是同心圆而不是线性：
    ├── 同心圆：内层被多层外层包裹（越内越稳定）
    ├── 线性分层：层与层之间是平等的（没有“核心”概念）
    └── 同心圆的核心优势：可以独立测试内层（不启动外层）
```

### 2. Hexagonal 的端口协议与适配器插拔机制

Hexagonal 的底层不是「MVC 的变体」，而是**端口（Port）定义协议 + 适配器（Adapter）运行时插拔**。

```
端口与适配器模型：

  端口（Port）= 核心领域定义的接口协议：
    ├── 入端口（Driving Port）：
    │   ├── 由外部触发器调用（HTTP/CLI/Event）
    │   ├── 定义核心业务用例的入口方法
    │   └── 示例：OrderService.placeOrder(cmd: PlaceOrderCommand)
    │
    └── 出端口（Driven Port）：
        ├── 由核心领域调用外部资源
        ├── 定义外部依赖的抽象接口
        └── 示例：OrderRepository.save(order: Order)

  适配器（Adapter）= 端口的具体实现：
    ├── 入适配器：HTTP Controller、CLI Handler、Event Listener
    │   ├── 负责将外部请求转换为端口协议格式
    │   └── 可可插拔：替换 HTTP 为 gRPC 不影响核心
    │
    └── 出适配器：DB Repository、HTTP Client、Message Queue Producer
        ├── 负责将端口协议转换为外部调用格式
        └── 可插拔：替换 MySQL 为 PostgreSQL 不影响核心

  插拔机制的运行时实现：
    ├── 依赖注入容器（IoC Container）在启动时组装
    ├── 核心只持有端口接口引用（不是具体实现）
    ├── 适配器在容器配置中绑定到端口
    └── 测试时用 Mock 适配器替换真实适配器（零代码修改）
```

### 3. DDD 在前端的领域模型构建机制

DDD 的底层不是「代码组织方式」，而是**统一语言（Ubiquitous Language）+ 限界上下文（Bounded Context）+ 领域事件驱动架构**。

```
DDD 前端落地的三个核心机制：

  1. 统一语言（Ubiquitous Language）：
     ├── 前后端共用同一套业务术语（不是技术术语）
     ├── “订单”不是 OrderDTO，而是 Order 聚合根
     ├── “支付”不是 pay() 函数，而是 PaymentCompleted 领域事件
     └── 代码即文档：读代码就是读业务

  2. 限界上下文（Bounded Context）：
     ├── 同一个概念在不同上下文中含义不同
     │   ├── 订单上下文中的“用户”= 买家（关注收货地址）
     │   ├── 支付上下文中的“用户”= 付款人（关注账户余额）
     │   └── 物流上下文中的“用户”= 收件人（关注配送地址）
     ├── 每个上下文有自己的领域模型和数据存储
     └── 上下文之间通过领域事件通信（不是直接调用）

  3. 领域事件驱动架构：
     ├── 聚合根状态变更时发布领域事件
     │   ├── Order.create() → 发布 OrderCreated 事件
     │   └── 事件是不可变的事实记录（不是命令）
     ├── 事件总线（Event Bus）分发事件到订阅者
     │   ├── 库存服务订阅 OrderCreated → 扣减库存
     │   ├── 通知服务订阅 OrderCreated → 发送确认邮件
     │   └── 分析服务订阅 OrderCreated → 更新统计报表
     └── 事件溯源（Event Sourcing）：
         ├── 不存储当前状态，存储所有事件序列
         ├── 状态 = 事件回放的结果
         └── 优势：完整审计轨迹 + 可回溯任意时间点
```

---

## 高频面试题

### Q1: Clean Architecture 在前端项目中如何落地？

**参考答案要点**：

- 领域层：纯 TypeScript，不依赖任何框架
- 用例层：编排业务流程，依赖领域层接口
- 基础设施层：API 调用、本地存储等具体实现
- 展示层：React/Vue 组件，调用用例
- 关键：依赖方向由外内，通过接口反转

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
