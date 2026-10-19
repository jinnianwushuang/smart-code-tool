---
title: '并发渲染与 Suspense [P6-P7]'
level: 'senior'
tags: ['React', '并发', 'Suspense', 'Transitions']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# 并发渲染与 Suspense [P6-P7]

> React 18 的并发特性（Concurrent Features）是 Fiber 架构的最终呈现。Suspense 让异步数据获取和代码分割成为一等公民，Transitions 让 UI 过渡保持响应。理解并发模型是掌握现代 React 的关键。

## 核心概念（What）

### 并发渲染的本质

```
同步渲染（React 17 及之前）：
  开始渲染 → 不可中断 → 提交 DOM → 完成
  问题：渲染期间阻塞用户交互

并发渲染（React 18+）：
  开始渲染 → 可中断 → 处理用户交互 → 恢复渲染 → 提交 DOM
  核心：渲染可以被"打断"，让位给更高优先级的任务

关键 API：
├── useTransition     → 标记低优先级更新
├── useDeferredValue → 延迟更新某个值
├── Suspense         → 声明异步边界
└── use()            → 在渲染中读取异步资源
```

---

## 底层原理（Why）

### 1. Scheduler 时间切片引擎

并发渲染的根基不是 Suspense，而是 **Scheduler**——一个纯 JavaScript 实现的协作式任务调度器。

```
Scheduler 核心执行链路：

workLoop（render 阶段）
  │
  ├── shouldYield() 检查
  │   └── getCurrentTime() >= deadline → 让出主线程
  │
  ├── performUnitOfWork(fiber)
  │   ├── beginWork(fiber) → 处理当前节点
  │   └── 返回 next fiber（child / sibling / return）
  │
  └── 循环直到 workLoop 完成或 shouldYield() 为 true

时间切片机制：
  ┌──────────────────────────────────────────────────────┐
  │ MessageChannel.postMessage → 宏任务回调              │
  │ deadline = getCurrentTime() + yieldInterval(5ms)     │
  │                                                      │
  │ while (workInProgress && !shouldYield()) {           │
  │   workInProgress = performUnitOfWork(workInProgress) │
  │ }                                                    │
  │                                                      │
  │ if (workInProgress) → 再次 postMessage 续期          │
  │ else → 进入 commit 阶段（同步不可中断）              │
  └──────────────────────────────────────────────────────┘
```

**关键洞察**：

- React 不用 `requestIdleCallback`（兼容性差、触发频率不可控），而是用 `MessageChannel` + `postMessage` 模拟时间切片
- `yieldInterval` 默认 5ms，意味着每 5ms 检查一次是否需要让出主线程
- `shouldYield()` 比较 `performance.now()` 与 deadline，超时则暂停 workLoop
- commit 阶段（DOM 操作）是同步不可中断的——这就是为什么 render 阶段要尽量纯

### 2. Suspense 协议：throw / catch 链路

Suspense 的底层不是「等待 Promise」，而是 React 渲染引擎中的一个**异常捕获协议**。

```
Suspense 执行链路：

AsyncComponent 渲染
  │
  ├── 检查缓存（React Cache / 外部缓存）
  │   ├── 已缓存 → 直接返回数据，正常渲染
  │   └── 未缓存 → throw promise（抛出一个 Promise 对象）
  │
  ├── React 的 beginWork 捕获这个 throw
  │   ├── 判断 thrownValue.then === 'function'（是 Promise）
  │   └── 向上遍历 Fiber 树，寻找最近的 Suspense Fiber
  │
  ├── 找到 Suspense Fiber
  │   ├── 标记 Suspense 的 state：suspenseContext = true
  │   ├── 渲染 fallback 子树（fallback={...}）
  │   └── 注册 Promise.then 回调 → 触发 Suspense 重新渲染
  │
  └── Promise resolve 后
      ├── 清除缓存标记
      ├── 重新触发 Suspense 的 render
      └── 这次 AsyncComponent 读到缓存数据 → 正常渲染 children
```

**核心设计**：

- `throw promise` 不是错误——React 用 `try/catch` 在 `beginWork` 中捕获，区分 `thenable`（Promise）和普通 Error
- Suspense 边界可以嵌套：内层 Suspense 先显示自己的 fallback，外层不受影响
- React 19 中 Suspense 还支持 `useActionState` 的表单操作挂起

### 3. Lane 位运算优先级模型

React 18 用**位掩码（bitmask）**表示优先级，一个 32 位整数可以表示 32 种独立的优先级通道。

```
Lane 位运算模型：

SyncLane           = 0b0000000000000000000000000000001  (最高优先级)
InputContinuousLane= 0b0000000000000000000000000000100
DefaultLane        = 0b0000000000000000000000000010000
TransitionLanes    = 0b0000000001111111100000000000000  (过渡动画)
IdleLane           = 0b0100000000000000000000000000000  (最低优先级)

优先级判断（位运算，O(1)）：
  // 判断 lane 是否属于 TransitionLanes
  (lane & TransitionLanes) !== 0  → true/false

  // 合并多个 lane
  pendingLanes = pendingLanes | updateLane

  // 取最高优先级 lane
  highestPriorityLane = pendingLanes & -pendingLanes

饥饿处理（Starvation Prevention）：
  // 如果低优先级更新等待时间超过阈值（约 5 秒）
  // React 会提升其优先级，防止无限饥饿
  if (currentTime - updateTime > STARVATION_THRESHOLD) {
    提升为 SyncLane 立即执行
  }
```

**为什么用位运算而不是数字排序**：

- 位运算合并 `|`、判断 `&`、取最高 `& -x` 都是 O(1)
- 一个整数可以同时标记多个 Lane（如 TransitionLanes 包含 9 个独立通道）
- 比较优先级只需一次位运算，不需要 if-else 链

### 4. 撕裂（Tearing）检测与 useSyncExternalStore

**撕裂**：同一个渲染周期内，不同组件读到了外部状态的不同值（因为渲染被中断后恢复时，外部状态可能已变）。

```
撕裂场景：

时间线：
  t1: ComponentA 读取 store.count = 5 → 开始渲染
  t2: 外部事件 → store.count = 6（渲染被中断）
  t3: ComponentB 读取 store.count = 6 → 渲染
  t4: ComponentA 恢复渲染，但用的是旧值 5
  → 同一帧内 A 显示 5，B 显示 6 → 视觉不一致 = 撕裂

useSyncExternalStore 的解决方案：
  1. render 阶段：调用 getSnapshot() 获取值
  2. commit 阶段前：再次调用 getSnapshot() 对比
  3. 如果两次值不同 → 丢弃当前渲染，重新 render
  4. 这就是"双重调用"的底层原因——不是 bug，是安全机制
```

**关键洞察**：React 内部状态（useState/useReducer）不会撕裂（因为 Fiber 树保证了顺序），只有外部状态（DOM、WebSocket、第三方 Store）需要 `useSyncExternalStore` 来保证一致性。

### 5. Transition 调度链路

`startTransition` 的底层不是「延迟执行」，而是**改变更新的 Lane 标记**。

```
startTransition 执行链路：

startTransition(() => { setSearchQuery(value) })
  │
  ├── 设置当前执行上下文：ExecutionContext |= TransitionContext
  │
  ├── setSearchQuery(value) 触发 setState
  │   └── 创建 update 对象：update.lane = pickTransitionLane()
  │       → 从 TransitionLanes 中选一个未使用的 lane
  │
  ├── 将 update 加入 Fiber 的 pendingUpdates
  │
  └── 调度器检查 pendingLanes
      ├── 如果当前有 SyncLane 正在执行 → Transition 更新排队等待
      ├── 如果没有更高优先级 → 立即开始 render
      └── render 完成后 → isPending 从 true 变为 false

isPending 的底层：
  Suspense 内部维护一个 transition 计数器
  startTransition → counter++
  异步操作完成 → counter--
  counter === 0 → isPending = false
```

---

## 实战应用（How）

### 并发模式下的性能优化

```jsx
// 1. 使用 React.memo 配合并发渲染
const ExpensiveList = React.memo(({ items }) => {
  return items.map((item) => <ListItem key={item.id} item={item} />)
})

// 2. 合理使用 Suspense 边界
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<AppSkeleton />}>
        <Router />
      </Suspense>
    </ErrorBoundary>
  )
}

// 3. 避免在过渡更新中做昂贵计算
function SearchPage({ query }) {
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    // 只在 deferredQuery 变化时重新计算
    return expensiveSearch(deferredQuery)
  }, [deferredQuery])

  return <ResultList results={results} />
}
```

---

## 高频面试题

### Q1: React 并发渲染的核心原理是什么？

**参考答案要点**：

- 基于 Fiber 架构的可中断渲染
- 渲染阶段可暂停、恢复、丢弃
- 通过 Lane Model 区分更新优先级
- 用户交互（输入/点击）优先级高于数据更新
- startTransition 标记的更新为低优先级

### Q2: Suspense 的工作原理是什么？

**参考答案要点**：

- 组件在渲染时 throw Promise 来"挂起"
- React 捕获 Promise，显示最近的 Suspense fallback
- Promise resolve 后重新渲染
- 支持嵌套 Suspense 实现渐进式加载
- React 19 中 Suspense 也支持表单操作（useActionState）

### Q3: useTransition 和 useDeferredValue 的区别？

**参考答案要点**：

- useTransition：在触发更新时标记为过渡更新，返回 isPending
- useDeferredValue：延迟更新接收到的值，在紧急更新完成后才更新
- 效果类似：都是将部分更新标记为低优先级
- 使用场景：useTransition 适合在新数据产生时，useDeferredValue 适合在接收数据时

---

## 延伸思考

1. **设计题**：如何设计一个支持并发渲染的组件库，让每个组件都能独立加载和更新？
2. **场景题**：一个搜索页面在输入时卡顿，如何用并发特性优化？
3. **对比题**：React 的并发模型 vs Vue 的响应式系统 vs SolidJS 的 Signals，各自处理异步的方式？

---

## 参考资料

- [React 18 并发特性](https://react.dev/reference/react/useTransition)
- [React Suspense 文档](https://react.dev/reference/react/Suspense)
- [React 18 Working Group](https://github.com/reactwg/react-18)
- [Dan Abramov - Suspense in React 18](https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md)
