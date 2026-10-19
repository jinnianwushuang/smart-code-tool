---
title: 'TanStack Query 数据获取与缓存 [P6-P7]'
level: 'senior'
tags: ['TanStack Query', 'React Query', '数据获取', '缓存', '乐观更新']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# TanStack Query 数据获取与缓存 [P6-P7]

> TanStack Query（原 React Query）是 2026 年 React 生态数据获取和缓存的事实标准。它将服务端状态管理从客户端状态管理中分离，提供缓存、去重、后台更新、乐观更新等能力。

## 核心概念（What）

### TanStack Query 核心能力

| 能力              | 说明                           |
| ----------------- | ------------------------------ |
| **缓存**          | 自动缓存请求结果，避免重复请求 |
| **去重**          | 同一请求并发时只发一次         |
| **后台刷新**      | 先显示缓存，后台静默更新       |
| **分页/无限滚动** | useInfiniteQuery 内置支持      |
| **乐观更新**      | 先更新 UI，失败回滚            |
| **Mutation**      | 创建/更新/删除操作管理         |
| **DevTools**      | 可视化缓存状态                 |

---

## 底层原理（Why）

### 1. QueryCache 内部数据结构

TanStack Query 的核心不是 `useQuery`，而是底层的 **QueryCache**——一个基于哈希表的缓存引擎。

```
QueryCache 内部结构：

QueryClient
  └── QueryCache
        └── Map<queryHash, Query>  ← 核心存储

Query 对象：
  {
    queryKey: ['users', { page: 1 }],
    queryHash: '["users",{"page":1}]',  ← 序列化后的字符串
    state: {
      data: undefined | TData,
      error: null | Error,
      status: 'pending' | 'success' | 'error',
      dataUpdatedAt: number,  ← 上次成功更新的时间戳
      fetchStatus: 'fetching' | 'idle' | 'paused',
    },
    observers: Set<QueryObserver>,  ← 订阅者列表
    promise: Promise<TData> | null,  ← 当前进行中的请求（去重用）
    gcTimeout: number | null,  ← GC 定时器 ID
  }

queryKey 哈希算法：
  queryKey: ['users', { page: 1 }]
  → JSON.stringify + 排序
  → '["users",{"page":1}]'

  匹配规则：
    精确匹配：queryKey 完全相同 → 同一个 Query
    部分匹配：invalidateQueries({ queryKey: ['users'] })
      → 遍历所有 Query，检查 queryKey 是否以 ['users'] 开头
```

### 2. Observer 模式与订阅通知

`useQuery` 不直接访问缓存，而是通过 **QueryObserver** 间接访问。

```
Observer 订阅链路：

useQuery() Hook
  │
  ├── 创建/复用 QueryObserver
  │   └── Observer 持有对 Query 的引用
  │
  ├── Observer.subscribe(query)
  │   └── 将自身加入 query.observers 集合
  │
  ├── Query 数据更新时
  │   └── 遍历 query.observers → 调用每个 observer.onUpdate()
  │       └── observer 触发 React setState → 组件重渲染
  │
  └── 组件卸载时
      └── observer.unsubscribe() → 从 observers 中移除
          └── 如果 observers.size === 0 → 启动 GC 计时器

多组件共享同一 Query：
  ComponentA: useQuery(['users']) → ObserverA → Query['users']
  ComponentB: useQuery(['users']) → ObserverB → Query['users']

  两个 Observer 订阅同一个 Query
  → 数据更新时两个组件同时收到通知
  → 请求只发一次（promise 去重）
```

### 3. 请求去重与 Promise 共享

多个组件同时请求同一个 queryKey 时，只会发送一次网络请求。

```
去重机制：

ComponentA: useQuery(['users'])
  │
  ├── 检查 cache 中是否有 Query['users']
  │   ├── 没有 → 创建 Query，发起 fetch，保存 promise
  │   └── 有 → 检查 state.fetchStatus
  │       ├── 'fetching' → 直接复用现有 promise（不发新请求）
  │       └── 'idle' → 检查是否 stale
  │           ├── stale → 发起新 fetch
  │           └── fresh → 直接返回缓存数据
  │
  └── ComponentB: useQuery(['users']) 同时调用
      └── 发现 promise 已存在 → 直接 await 同一个 promise

Promise 生命周期：
  fetch 开始 → promise 保存到 query.promise
  fetch 完成 → promise = null（清除，下次可以重新发起）
  fetch 失败 → promise = null + 重试逻辑
```

### 4. 新鲜度模型与后台刷新

TanStack Query 的核心创新是**新鲜度模型**（Staleness Model）。

```
新鲜度状态机：

          fetch 成功
              │
              ▼
         ┌─────────┐
         │  fresh   │ ← staleTime 内（默认 0，立即过期）
         └────┬─────┘
              │ staleTime 过期
              ▼
         ┌─────────┐
         │  stale   │ ← 显示缓存，后台静默 refetch
         └────┬─────┘
              │ gcTime 过期（无 Observer 订阅时）
              ▼
         ┌─────────┐
         │  已回收  │ ← 从缓存中彻底清除
         └─────────┘

触发 refetch 的条件：
  ├── 组件挂载时（如果数据已 stale）
  ├── 窗口聚焦时（refetchOnWindowFocus: true）
  ├── 网络恢复时（refetchOnReconnect: true）
  ├── invalidateQueries() 手动触发
  └── 订阅的 queryKey 对应的数据被标记为 stale

为什么默认 staleTime = 0：
  - 保守策略：每次挂载都重新获取，保证数据最新
  - 适合大多数场景（数据变化频繁）
  - 性能场景才设置较大的 staleTime（减少不必要的请求）
```

---

## 高频面试题

### Q1: staleTime 和 gcTime 的区别？

**参考答案要点**：

- `staleTime`：数据新鲜期，期间直接使用缓存，不重新获取
- `gcTime`：缓存保留时间，过期后从缓存中清除
- staleTime < gcTime：过期后后台静默更新（显示旧数据）
- staleTime = 0：每次使用都重新获取（默认）

### Q2: 乐观更新的实现原理？

**参考答案要点**：

- onMutate 中先取消进行中的请求
- 保存旧缓存值（previousData）
- 立即更新缓存（setQueriesData）→ UI 立即更新
- onError 中回滚到旧值
- onSettled 中重新获取最新数据

### Q3: TanStack Query 和 SWR 的区别？

**参考答案要点**：

- TanStack Query：功能全面（Query + Mutation + InfiniteQuery）
- SWR：更轻量，专注数据获取
- TanStack Query 缓存管理更精细（staleTime/gcTime）
- SWR API 更简洁（data, error, isLoading）
- 2026 趋势：TanStack Query 更主流

---

## 延伸思考

1. **设计题**：为一个电商应用设计数据获取层（商品列表/详情/购物车/订单）。
2. **场景题**：多个组件使用同一 queryKey，如何避免重复请求？
3. **对比题**：TanStack Query vs SWR vs Apollo Client，GraphQL 场景怎么选？

---

## 参考资料

- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
