# React 19 核心底层原理深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-07  
> **适用对象**: 高级前端工程师、架构师、对 React internals 感兴趣的开发者

---

## 📑 目录

- [一、React 渲染机制](#一react-渲染机制)
- [二、Fiber 架构](#二fiber-架构)
- [三、协调算法（Reconciliation）](#三协调算法reconciliation)
- [四、Hooks 实现原理](#四hooks-实现原理)
- [五、并发特性（Concurrent Features）](#五并发特性concurrent-features)
- [六、自动批处理（Automatic Batching）](#六自动批处理automatic-batching)
- [七、Transition 和 Suspense](#七transition-和-suspense)
- [八、Server Components](#八server-components)
- [九、Actions 和 Server Actions](#九actions-和-server-actions)
- [十、性能优化机制](#十性能优化机制)

---

## 一、React 渲染机制

### 1.1 渲染流程概览

```
用户交互/状态变化
    ↓
触发重新渲染（Re-render）
    ↓
创建新的 Virtual DOM 树
    ↓
Diff 算法对比新旧树
    ↓
生成最小化的变更集合
    ↓
提交到真实 DOM
    ↓
浏览器绘制（Paint）
```

### 1.2 渲染阶段划分

React 19 的渲染分为两个主要阶段：

**Render 阶段（可中断）**

- 构建 Fiber 树
- 执行组件函数
- 调用 Hooks
- 计算差异
- 此阶段可以被暂停、中止或重启

**Commit 阶段（不可中断）**

- 将变更应用到 DOM
- 执行生命周期方法
- 执行 useLayoutEffect
- 此阶段必须同步完成，保证 UI 一致性

### 1.3 调度器（Scheduler）

```javascript
// React 内部使用优先级队列管理任务
const taskQueue = new MinHeap() // 基于优先级的最小堆

// 优先级等级（数字越小优先级越高）
const ImmediatePriority = 1 // 用户输入、动画
const UserBlockingPriority = 2 // 用户交互
const NormalPriority = 3 // 普通更新
const LowPriority = 4 // 分析、日志
const IdlePriority = 5 // 空闲时执行
```

**工作原理**：

- 使用 `requestIdleCallback` 或 `MessageChannel` 实现时间切片
- 每帧（约 16ms）检查剩余时间，如果不足则让出控制权
- 高优先级任务可以打断低优先级任务

---

## 二、Fiber 架构

### 2.1 Fiber 节点结构

```typescript
interface FiberNode {
  // 类型标识
  tag: WorkTag // 组件类型（函数/类/DOM等）
  key: string | null // React key

  // 树结构指针
  return: Fiber | null // 父节点
  child: Fiber | null // 第一个子节点
  sibling: Fiber | null // 兄弟节点

  // 状态相关
  stateNode: any // 对应的实例（DOM节点、组件实例等）
  memoizedState: any // 当前状态（useState的值）
  memoizedProps: any // 当前属性

  // 更新相关
  updateQueue: UpdateQueue<any> | null // 更新队列
  alternate: Fiber | null // 双缓冲的另一棵树

  // 副作用
  flags: Flags // 副作用标记
  subtreeFlags: Flags // 子树副作用标记

  // 其他
  lanes: Lanes // 优先级车道
  dependencies: Dependencies | null // 依赖关系
}
```

### 2.2 双缓冲机制（Double Buffering）

```
Current Tree (当前显示)          WorkInProgress Tree (工作中)
┌─────────────┐                 ┌─────────────┐
│   Root      │                 │   Root'     │
│     │       │                 │     │       │
│   App       │     Render      │   App'      │
│     │       │    ───────►     │     │       │
│  Component  │                 │  Component' │
└─────────────┘                 └─────────────┘
                                      │
                                 Commit 阶段
                                     │
                              交换两棵树引用
                                     ▼
┌─────────────┐                 ┌─────────────┐
│   Root'     │                 │   Root      │
│     │       │                 │     │       │
│   App'      │                 │   App       │
│     │       │                 │     │       │
│  Component' │                 │  Component  │
└─────────────┘                 └─────────────┘
  (新的 Current)                (新的 WIP)
```

**核心优势**：

- Render 阶段可以安全地中断和重试，不影响当前 UI
- Commit 阶段原子性地切换树，保证 UI 一致性
- 复用 Fiber 节点，减少内存分配

### 2.3 Fiber 遍历算法

React 使用深度优先遍历（DFS）构建 Fiber 树：

```javascript
function workLoop() {
  let unitOfWork = workInProgressRoot

  while (unitOfWork !== null) {
    unitOfWork = performUnitOfWork(unitOfWork)
  }
}

function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  const current = unitOfWork.alternate

  // beginWork: 处理当前节点，返回第一个子节点
  let next = beginWork(current, unitOfWork)

  if (next !== null) {
    return next  // 继续处理子节点
  }

  // completeWork: 子节点处理完毕，处理当前节点
  completeWork(unitOfWork)

  // 如果有兄弟节点，处理兄弟节点
  if (unitOfWork.sibling !== null) {
    return unitOfWork.sibling
  }

  // 否则回溯到父节点
  return unitOfWork.return
}
```

---

## 三、协调算法（Reconciliation）

### 3.1 Diff 算法三大策略

**1. Tree Diff - O(n)**

- 只比较同级节点，不跨层级比较
- 如果节点类型不同，直接销毁重建整个子树
- 避免 O(n³) 的复杂度

```javascript
// 伪代码
if (oldElement.type !== newElement.type) {
  // 类型不同，替换整个子树
  replaceSubtree(oldFiber, newElement)
  return
}
```

**2. Component Diff**

- 相同类型的组件，保留实例，更新 props
- 不同类型的组件，卸载旧组件，挂载新组件

**3. Element Diff**

- 通过 `key` 属性优化列表节点的复用
- 使用双向链表进行节点移动、插入、删除

### 3.2 Key 的作用与陷阱

```jsx
// ✅ 正确：使用稳定的唯一标识
{
  items.map((item) => <Item key={item.id} data={item} />)
}

// ❌ 错误：使用索引作为 key（会导致状态错乱）
{
  items.map((item, index) => <Item key={index} data={item} />)
}

// ❌ 错误：使用随机数（每次渲染都不同）
{
  items.map((item) => <Item key={Math.random()} data={item} />)
}
```

**底层原理**：

- React 使用 Map 存储旧节点的 key -> fiber 映射
- 遍历时查找相同 key 的节点进行复用
- 没有 key 或 key 不匹配时，创建新节点

### 3.3 Lane 模型（优先级调度）

React 19 使用 Lane 模型替代了旧的 expirationTime：

```typescript
// Lane 是位掩码，每个位代表一个优先级
type Lane = number

const NoLanes = 0b0000000000000000000000000000000
const SyncLane = 0b0000000000000000000000000000001
const InputContinuousLane = 0b0000000000000000000000000000010
const DefaultLane = 0b0000000000000000000000000000100
const TransitionLane = 0b0000000000000000000000000001000
const RetryLane = 0b0000000000000000000000000010000
const IdleLane = 0b0000000000000000000000000100000

// 可以组合多个 lane
const combinedLanes = SyncLane | InputContinuousLane
```

**优势**：

- 支持更细粒度的优先级控制
- 可以同时追踪多个优先级的更新
- 便于实现并发特性

---

## 四、Hooks 实现原理

### 4.1 Hooks 数据结构

```typescript
interface Hook {
  memoizedState: any // 当前状态值
  baseState: any // 基础状态（用于恢复）
  baseQueue: Update<any> | null // 基础更新队列
  queue: Update<any> | null // 当前更新队列
  next: Hook | null // 下一个 Hook（链表）
}

interface Update<S, A> {
  lane: Lane // 优先级
  action: A // 更新动作
  hasEagerState: boolean // 是否有预先计算的状态
  eagerState: S | null // 预先计算的状态
  next: Update<S, A> // 下一个更新
}
```

### 4.2 Hooks 链表

```
Component Function Call
        │
        ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │ Hook 1  │─────▶│ Hook 2  │─────▶│ Hook 3  │──▶ null
   │useState │      │useEffect│      │useState │
   └─────────┘      └─────────┘      └─────────┘
        │                │                │
   memoizedState    memoizedState    memozedState
   = 0              = cleanup fn     = 'text'
```

**关键规则**：

- Hooks 必须在顶层调用，不能在条件语句中
- 调用顺序必须保持一致
- React 通过调用顺序来对应正确的 Hook

### 4.3 useState 实现细节

```javascript
// 简化的 useState 实现
function mountState(initialState) {
  const hook = mountWorkInProgressHook()

  // 惰性初始化
  if (typeof initialState === 'function') {
    initialState = initialState()
  }

  hook.memoizedState = initialState
  hook.baseState = initialState

  const queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
  }
  hook.queue = queue

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)

  return [hook.memoizedState, dispatch]
}

function updateState() {
  return updateReducer(basicStateReducer)
}

function dispatchSetState(fiber, queue, action) {
  const lane = requestUpdateLane(fiber)

  const update = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null,
  }

  // 将更新加入队列
  enqueueConcurrentHookUpdate(fiber, queue, update, lane)

  // 调度渲染
  scheduleUpdateOnFiber(fiber, lane)
}
```

**批量更新优化**：

```javascript
// React 18+ 自动批处理
function handleClick() {
  setCount((c) => c + 1) // 不会立即触发渲染
  setText('hello') // 不会立即触发渲染
  // 两次更新被合并，只触发一次渲染
}
```

### 4.4 useEffect 实现细节

```typescript
interface Effect {
  tag: HookFlags // 副作用类型
  create: () => (() => void) | void // 创建函数
  destroy: (() => void) | null // 清理函数
  deps: Array<mixed> | null // 依赖数组
  next: Effect // 下一个 effect
}

// Effect 存储在 Fiber 节点上
fiber.updateQueue = {
  lastEffect: Effect, // 单向循环链表
}
```

**执行时机**：

```
Render 阶段
  ├─ 执行组件函数
  ├─ 收集 effects（不执行）
  └─ 构建 Fiber 树

Commit 阶段
  ├─ 应用 DOM 变更
  ├─ 同步执行 useLayoutEffect
  └─ 调度 useEffect（异步，在绘制后执行）
```

### 4.5 useMemo/useCallback 记忆化

```javascript
function mountMemo(nextCreate, deps) {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps

  // 首次渲染，直接执行并缓存结果
  const nextValue = nextCreate()
  hook.memoizedState = [nextValue, nextDeps]

  return nextValue
}

function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  const prevState = hook.memoizedState

  if (prevState !== null && nextDeps !== null) {
    const prevDeps = prevState[1]

    // 浅比较依赖项
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      // 依赖未变化，返回缓存值
      return prevState[0]
    }
  }

  // 依赖变化，重新计算
  const nextValue = nextCreate()
  hook.memoizedState = [nextValue, nextDeps]
  return nextValue
}

// 浅比较实现
function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue
    }
    return false
  }
  return true
}
```

### 4.6 useRef 的特殊性

```javascript
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook()

  // 创建普通对象，不是 React 管理的状态
  const ref = { current: initialValue }
  hook.memoizedState = ref

  return ref
}

function updateRef() {
  const hook = updateWorkInProgressHook()
  return hook.memoizedState // 始终返回同一个对象引用
}
```

**为什么不触发重渲染**：

- `ref.current` 的修改不涉及 React 的状态更新机制
- 没有调用 `scheduleUpdateOnFiber`
- 只是一个普通的 JavaScript 对象属性赋值

---

## 五、并发特性（Concurrent Features）

### 5.1 并发渲染的核心概念

**可中断渲染**：

```javascript
// React 可以将渲染工作拆分成多个小任务
function renderWithScheduling() {
  let deadline = getCurrentTime() + TIME_SLICE_MS

  while (workInProgress !== null && getCurrentTime() < deadline) {
    workInProgress = performUnitOfWork(workInProgress)
  }

  if (workInProgress !== null) {
    // 时间用完了，让出控制权，下一帧继续
    scheduleCallback(renderWithScheduling)
  }
}
```

**优先级抢占**：

```
低优先级任务正在执行...
  ├─ 处理 Component A
  ├─ 处理 Component B
  │
  👤 用户点击（高优先级）
  │
  ⏸️ 暂停低优先级任务
  │
  ▶️ 立即执行高优先级任务
  ├─ 处理用户输入响应
  └─ 更新 UI
  │
  ▶️ 恢复低优先级任务（可能从头开始）
```

### 5.2 useTransition

```jsx
import { useTransition, useState } from 'react'

function SearchPage() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  function handleSearch(newQuery) {
    setQuery(newQuery) // 立即更新

    // 延迟更新，不阻塞用户输入
    startTransition(() => {
      const filtered = expensiveFilter(items, newQuery)
      setResults(filtered)
    })
  }

  return (
    <>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  )
}
```

**底层实现**：

```javascript
function mountTransition() {
  const [isPending, setPending] = useState(false)

  const start = startTransition.bind(null, setPending)
  const hook = mountStateImpl(start)

  return [isPending, start]
}

function startTransition(setPending, scope) {
  // 标记为过渡更新
  const previousTransition = ReactSharedInternals.t
  ReactSharedInternals.t = {}

  try {
    setPending(true)
    scope() // 执行范围内的更新使用较低优先级
  } finally {
    ReactSharedInternals.t = previousTransition
    setPending(false)
  }
}
```

### 5.3 useDeferredValue

```jsx
function SearchResults({ query }) {
  // 延迟更新 results，保持 UI 响应
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    return expensiveSearch(allItems, deferredQuery)
  }, [deferredQuery])

  return <List items={results} />
}
```

**与 useTransition 的区别**：

- `useTransition`: 控制更新的优先级
- `useDeferredValue`: 延迟某个值的变化

---

## 六、自动批处理（Automatic Batching）

### 6.1 React 18 之前的批处理

```javascript
// React 17: 只在合成事件中批处理
setTimeout(() => {
  setCount((c) => c + 1) // 触发渲染
  setText('hello') // 再次触发渲染 ❌
}, 1000)

// React 18+: 所有场景都批处理
setTimeout(() => {
  setCount((c) => c + 1) // 不立即渲染
  setText('hello') // 不立即渲染
  // 微任务结束时统一渲染 ✅
}, 1000)
```

### 6.2 实现原理

```javascript
// 简化的批处理逻辑
let isBatchingLegacy = false
let batchedUpdates = []

function batchedUpdates$1(fn) {
  if (isBatchingLegacy) {
    return fn()
  }

  isBatchingLegacy = true

  try {
    const result = fn()

    // 在微任务中刷新批处理的更新
    scheduleMicrotask(() => {
      flushSyncCallbacks()
    })

    return result
  } finally {
    isBatchingLegacy = false
  }
}

// 退出批处理时刷新
function ensureRootIsScheduled(root) {
  if (!isBatchingLegacy) {
    flushSyncCallbacks()
  }
}
```

### 6.3 flushSync 强制同步

```javascript
import { flushSync } from 'react-dom'

// 需要立即获取 DOM 时使用
flushSync(() => {
  setValue(1)
})
// 此时 DOM 已更新
console.log(ref.current.textContent)
```

---

## 七、Transition 和 Suspense

### 7.1 Suspense 边界

```jsx
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

**工作流程**：

```
1. 渲染 AsyncComponent
2. 组件抛出 Promise（suspend）
3. React 捕获 Promise
4. 显示 fallback UI
5. Promise resolve 后重新渲染
6. 显示实际内容
```

### 7.2 Suspense 实现机制

```javascript
function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
  if (value !== null && typeof value === 'object' && typeof value.then === 'function') {
    // 这是一个 Promise，挂起渲染
    const wakeable = value

    // 标记 Fiber 为 suspended
    sourceFiber.flags |= DidCapture

    // 添加 retry 回调
    const thenableState = getOrCreateThenableState(wakeable)
    wakeable.then(
      () => {
        // Promise resolve，重试渲染
        retryTimedOutBoundary(returnFiber, thenableState)
      },
      (error) => {
        // Promise reject，触发错误边界
        triggerErrorOnBoundary(returnFiber, error)
      },
    )

    throw value // 抛出 Promise，中断渲染
  }
}
```

### 7.3 多个 Suspense 边界

```jsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
  <Footer />
</Suspense>
```

**嵌套行为**：

- 内层 Suspense 先加载完成，先显示
- 外层 Suspense 等待所有内层完成
- 可以实现渐进式加载

---

## 八、Server Components

### 8.1 RSC 架构

```
┌─────────────────────────────────────┐
│         Client (Browser)            │
│  ┌───────────────────────────────┐  │
│  │   Client Components (.client) │  │
│  │   - useState, useEffect       │  │
│  │   - Event handlers            │  │
│  │   - Browser APIs              │  │
│  └───────────────────────────────┘  │
│              ▲                      │
│              │ Hydration            │
│              │                      │
│  ┌───────────────────────────────┐  │
│  │   Server Components (.server) │  │
│  │   - 直接访问数据库            │  │
│  │   - 文件系统操作              │  │
│  │   - 后端 API 调用             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ▲
              │ Streaming
              │
┌─────────────────────────────────────┐
│         Server (Node.js)            │
│  - 渲染 Server Components           │
│  - 序列化为特殊格式                  │
│  - 流式传输到客户端                  │
└─────────────────────────────────────┘
```

### 8.2 序列化协议

Server Components 使用特殊的序列化格式：

```
M1:{"id":"./App.server","chunks":["client1"],"name":""}
J0:["$","div",null,{"children":[
  ["$","h1",null,{"children":"Hello"}],
  ["@","./Counter.client",{"props":{"initialCount":0}}]
]}]
```

**符号说明**：

- `M`: Module reference（模块引用）
- `J`: JSON data（JSON 数据）
- `$`: React element（React 元素）
- `@`: Lazy reference（懒加载引用）

### 8.3 水合（Hydration）过程

```javascript
// 1. 服务器发送 HTML + 特殊注释
<div id="root">
  <h1>Hello</h1>
  <!--$?--><template id="B:0"></template>
  <!--/$-->
</div>

// 2. 客户端接收并解析
// 3. 找到对应的 Client Component
// 4. 附加事件监听器
// 5. 完成水合，变为交互式
```

### 8.4 数据获取优化

```jsx
// Server Component - 直接在服务端获取数据
async function Note({ id }) {
  // 无需 useEffect，无 waterfall
  const note = await db.notes.get(id)
  const author = await db.authors.get(note.authorId)

  return (
    <article>
      <h1>{note.title}</h1>
      <p>By {author.name}</p>
      <p>{note.content}</p>
    </article>
  )
}
```

**优势**：

- 消除客户端-服务器往返
- 可以直接访问后端资源
- 减小 bundle 体积（服务端代码不发送到客户端）

---

## 九、Actions 和 Server Actions

### 9.1 Server Actions 原理

```jsx
// app/actions.js
'use server'

export async function updateUser(formData) {
  const name = formData.get('name')
  await db.users.update({ name })
  revalidatePath('/profile')
}

// app/profile/page.jsx
import { updateUser } from '../actions'

function ProfileForm() {
  return (
    <form action={updateUser}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```

**工作流程**：

```
1. 表单提交
2. 序列化表单数据
3. POST 请求到特殊端点 /__nextjs_action
4. 服务器反序列化并执行 Action
5. 返回更新后的 RSC payload
6. 客户端合并更新
```

### 9.2 useActionState

```jsx
import { useActionState } from 'react'

function UpdateForm() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await validateAndSubmit(formData)
      return error || null
    },
    null, // 初始状态
  )

  return (
    <form action={submitAction}>
      {error && <p className="error">{error}</p>}
      <input name="email" />
      <button disabled={isPending}>{isPending ? 'Submitting...' : 'Submit'}</button>
    </form>
  )
}
```

**底层实现**：

```javascript
function useActionState(action, initialState) {
  const [state, setState] = useState(initialState)
  const [pending, setPending] = useState(false)

  const boundAction = useCallback(
    async (formData) => {
      setPending(true)
      try {
        const result = await action(state, formData)
        setState(result)
        return result
      } finally {
        setPending(false)
      }
    },
    [action, state],
  )

  return [state, boundAction, pending]
}
```

### 9.3 乐观更新（Optimistic Updates）

```jsx
import { useOptimistic } from 'react'

function Comments({ comments }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (currentComments, newComment) => [...currentComments, newComment],
  )

  async function handleSubmit(formData) {
    const comment = formData.get('comment')

    // 立即更新 UI（乐观更新）
    addOptimisticComment({ id: 'temp', text: comment })

    // 后台发送请求
    await submitComment(comment)

    // 服务器返回后，React 会自动同步真实数据
  }

  return (
    <ul>
      {optimisticComments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  )
}
```

**原理**：

- 维护两个状态：optimistic state 和 real state
- 乐观更新立即反映到 UI
- 服务器响应后，用真实数据覆盖
- 如果失败，回滚到真实状态

---

## 十、性能优化机制

### 10.1 React.memo 实现

```javascript
function memo<Props>(
  Component: ComponentType<Props>,
  compare?: (oldProps: Props, newProps: Props) => boolean
) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type: Component,
    compare: compare === undefined ? null : compare,
  }
}

// 渲染时的比较逻辑
if (workInProgress.type.compare !== null) {
  const compare = workInProgress.type.compare
  if (compare(oldProps, newProps)) {
    // Props 相同，跳过渲染
    bailoutOnAlreadyFinishedWork(current, workInProgress)
    return
  }
}
```

### 10.2 虚拟 DOM Diff 优化

**启发式算法**：

1. **类型不同**：直接替换整棵子树
2. **key 不同**：视为不同节点
3. **相同类型**：复用节点，更新 props

```javascript
function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
  // 单一子节点优化
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild))
    }
  }

  // 多个子节点
  return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
}
```

### 10.3 列表 Diff 算法

```javascript
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null
  let previousNewFiber = null
  let oldFiber = currentFirstChild
  let lastPlacedIndex = 0
  let newIdx = 0
  let nextOldFiber = null

  // 第一轮：处理相同 key 的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes)

    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber
      }
      break
    }

    // 记录放置位置
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber)
      }
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }
    previousNewFiber = newFiber
    oldFiber = nextOldFiber
  }

  // 第二轮：处理新增节点
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber)
    return resultingFirstChild
  }

  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes)
      if (newFiber === null) continue

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }

  // 第三轮：处理移动和删除
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      lanes,
      newChildren[newIdx],
    )

    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key)
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
  }

  if (shouldTrackSideEffects) {
    existingChildren.forEach((child) => deleteChild(returnFiber, child))
  }

  return resultingFirstChild
}
```

### 10.4 代码分割与懒加载

```jsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

**实现原理**：

```javascript
function lazy(factory) {
  let status = 'pending'
  let result = null
  let promise = null

  const payload = {
    _status: status,
    _result: result,
    _init: factory,
  }

  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: initLazyComponent,
  }
}

function initLazyComponent(payload) {
  if (payload._status === 'fulfilled') {
    return payload._result
  }

  if (payload._status === 'pending') {
    if (!payload._promise) {
      payload._promise = payload._init().then(
        (module) => {
          payload._status = 'fulfilled'
          payload._result = module.default
        },
        (error) => {
          payload._status = 'rejected'
          payload._result = error
        },
      )
    }
    throw payload._promise // 抛出 Promise，触发 Suspense
  }

  throw payload._result
}
```

### 10.5 Profiler API

```jsx
import { Profiler } from 'react'

function onRenderCallback(
  id, // profiler 的 id
  phase, // "mount" 或 "update"
  actualDuration, // 实际渲染时间
  baseDuration, // 估算的渲染时间
  startTime, // 开始时间
  commitTime, // 提交时间
  interactions, // 相关的交互
) {
  console.log(`${id} took ${actualDuration}ms`)
}

;<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

---

## 附录

### A. 常见性能问题排查

**1. 不必要的重渲染**

```javascript
// 使用 React DevTools Profiler
// 查看哪些组件频繁重渲染
// 使用 why-did-you-render 库定位原因
```

**2. 大列表性能**

```javascript
// 使用虚拟滚动
import { FixedSizeList } from 'react-window'

;<FixedSizeList height={600} itemCount={10000} itemSize={50} width={300}>
  {Row}
</FixedSizeList>
```

**3. 记忆化过度**

```javascript
// ❌ 不要过度使用 useMemo/useCallback
const value = useMemo(() => compute(), []) // 如果 compute 很快，不需要

// ✅ 仅在真正需要时使用
const expensiveValue = useMemo(() => {
  return heavyComputation(data) // 耗时操作才需要记忆化
}, [data])
```

### B. React 19 新特性总结

| 特性              | 作用            | 底层机制           |
| ----------------- | --------------- | ------------------ |
| Actions           | 服务端表单处理  | 序列化 + 特殊端点  |
| useOptimistic     | 乐观更新        | 双状态管理         |
| useFormStatus     | 表单状态        | Context + Suspense |
| useActionState    | 带状态的 Action | useState + Action  |
| Document Metadata | 元数据管理      | 流式渲染           |
| Asset Loading     | 资源预加载      | Resource hints     |
| Ref Cleanup       | Ref 清理        | 新的生命周期       |

### C. 学习资源

- **官方文档**: https://react.dev/
- **React 源码**: https://github.com/facebook/react
- **Beta 文档**: https://beta.reactjs.org/
- **React Internals**: https://github.com/acdlite/react-fiber-architecture

---

**深入理解 React 底层原理，才能写出更高效、更可靠的代码！** ⚛️
