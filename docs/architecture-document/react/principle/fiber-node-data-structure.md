---
title: 'React Fiber Node 数据结构精讲'
tags: ['React']
---

# React Fiber Node 数据结构精讲

> Fiber 是 React 16+ 的核心数据结构。它用一个 JS 对象替代了传统虚拟 DOM 的树形递归，通过链表实现可中断的增量渲染。理解 Fiber Node 的每一个字段，就理解了 React 为什么能暂停、恢复、优先级调度。

---

## 1. 为什么需要 Fiber

React 15 的 Stack Reconciler 递归遍历组件树，一旦开始就不可中断。当组件树很大时（数千节点），一次更新可能阻塞主线程数百毫秒，导致掉帧。

**Fiber 的核心创新**：将"不可中断的递归"变成"可中断的链表遍历"。每个 Fiber 节点是一个 JS 对象，通过指针连接兄弟节点，使遍历可以在任意节点暂停。

---

## 2. Fiber Node 完整数据结构

```typescript
interface FiberNode {
  // ══════════ 节点身份 ══════════
  tag: WorkTag // 组件类型标识（FunctionComponent / ClassComponent / HostComponent 等）
  type: any // 对于 DOM 节点是标签名（'div'），对于组件是对应函数/类
  key: null | string // 列表中的唯一标识，用于 Diff 时判断节点复用

  // ══════════ 链表指针（替代树的 children 数组）══════════
  child: FiberNode | null // 第一个子节点
  sibling: FiberNode | null // 下一个兄弟节点
  return: FiberNode | null // 父节点（命名为 return 而非 parent，因为函数调用栈的返回语义）

  // ══════════ 双缓冲 ══════════
  alternate: FiberNode | null // 指向另一棵树（current ↔ workInProgress）的对应节点

  // ══════════ 状态与副作用 ══════════
  pendingProps: any // 新的 props（来自 ReactElement）
  memoizedProps: any // 上一次渲染时的 props
  memoizedState: any // Hooks 链表（函数组件）或 state 对象（类组件）
  updateQueue: UpdateQueue | null // 待处理的更新队列（setState 等产生的更新）

  // ══════════ 副作用标记 ══════════
  flags: Flags // 副作用标记位（Placement / Update / Deletion 等二进制位）
  subtreeFlags: Flags // 子树的副作用聚合（冒泡优化，避免遍历子树检查）
  deletions: FiberNode[] | null // 需要删除的子节点列表

  // ══════════ Effect 链表 ══════════
  updateQueue: {
    lastEffect: Effect | null // Effect 循环链表头（useEffect / useLayoutEffect）
  }

  // ══════════ 调度优先级 ══════════
  lanes: Lanes // 本节点的优先级车道位
  childLanes: Lanes // 子树的优先级聚合
}
```

---

## 3. 关键字段深度解析

### 3.1 tag — 节点类型标识

`tag` 决定 React 如何处理这个节点：

| tag 值                       | 含义          | 处理方式                       |
| ---------------------------- | ------------- | ------------------------------ |
| `FunctionComponent` (0)      | 函数组件      | 调用函数，收集 Hooks           |
| `ClassComponent` (1)         | 类组件        | 调用 render()，处理生命周期    |
| `IndeterminateComponent` (2) | 未确定类型    | 首次渲染后根据结果确定类型     |
| `HostRoot` (3)               | 应用根节点    | ReactDOM.createRoot() 创建的根 |
| `HostComponent` (5)          | 原生 DOM 元素 | 创建/更新真实 DOM 节点         |
| `HostText` (6)               | 纯文本节点    | 直接操作 textContent           |
| `SuspenseComponent` (13)     | Suspense 边界 | 管理 fallback 与异步加载       |

### 3.2 链表指针 — 树的链表化

传统虚拟 DOM 用 `children` 数组表示子节点，遍历必须递归。Fiber 用三个指针将树转化为链表：

```
          root (return=null)
           |
          div (child→h1, sibling=null)
         / \
        h1  p
   (sibling→p)

遍历顺序（深度优先）：
root → div → h1 → (h1.sibling) p → (p.return) div → (div.return) root → 结束
```

**遍历算法**：

```javascript
function walk(fiber) {
  let node = fiber
  while (node) {
    // 1. 处理当前节点
    doWork(node)

    // 2. 有子节点 → 深入
    if (node.child) {
      node = node.child
      continue
    }

    // 3. 无子节点 → 找兄弟或回退
    while (node) {
      if (node.sibling) {
        node = node.sibling
        break
      }
      node = node.return // 回退到父节点
    }
  }
}
```

这种遍历可以在任意节点暂停（让出主线程），恢复时从暂停点继续。

### 3.3 alternate — 双缓冲机制

React 维护两棵 Fiber 树：

- **current 树**：当前屏幕上显示的 UI 对应的 Fiber 树
- **workInProgress 树**：正在构建的新 Fiber 树

```
current 树:                workInProgress 树:
    root ────────────────────── root
    / \                         / \
   A   B  ← alternate 互相引用 → A'  B'
  / \                           / \
 C   D                         C'  D'
```

**工作流程**：

1. 更新时，React 从 current 树的根开始，为每个节点创建对应的 workInProgress 节点
2. workInProgress 节点复用 current 节点的 `memoizedState`（如果 props 没变则跳过）
3. 构建完成后，将 root 的 `current` 指针切换到 workInProgress 树（称为 "commit"）
4. 下一次更新时，角色互换

### 3.4 memoizedState — Hooks 链表

对于函数组件，`memoizedState` 不是单个 state 对象，而是一个 **Hook 链表**：

```javascript
// 组件代码
function Counter() {
  const [count, setCount] = useState(0) // Hook 1
  const [name, setName] = useState('') // Hook 2
  useEffect(() => {
    /* ... */
  }, [count]) // Hook 3

  return (
    <div>
      {count} {name}
    </div>
  )
}

// 对应的 memoizedState 链表
memoizedState = {
  // Hook 1: useState(0)
  memoizedState: 0, // 当前 state 值
  baseState: 0,
  baseQueue: null,
  queue: { pending: null, lastRenderedState: 0 },
  next: {
    // Hook 2: useState('')
    memoizedState: '',
    baseState: '',
    queue: { pending: null, lastRenderedState: '' },
    next: {
      // Hook 3: useEffect
      memoizedState: {
        tag: HookHasEffect | HookPassive,
        create: () => {
          /* effect 函数 */
        },
        destroy: undefined,
        deps: [0], // 上次渲染时的依赖
        next: null, // Effect 循环链表（同一组件多个 Effect 互相链接）
      },
      next: null,
    },
  },
}
```

**为什么是链表而不是数组？** 因为 React 通过**执行顺序**定位 Hook。每次渲染时，React 从头遍历链表，按顺序将每个 Hook 与上一次的对应节点匹配。如果写在 `if` 语句里，顺序会乱，匹配就出错。

### 3.5 flags — 副作用标记位

`flags` 是二进制位，用于 Commit 阶段快速判断节点需要执行什么操作：

| 标记            | 值                 | 含义                           |
| --------------- | ------------------ | ------------------------------ |
| `Placement`     | 0b0000000000000010 | 新增节点，需要插入 DOM         |
| `Update`        | 0b0000000000000100 | 节点属性/内容需要更新          |
| `Deletion`      | 0b0000000000001000 | 节点需要删除                   |
| `ChildDeletion` | 0b0000000000010000 | 子节点需要删除                 |
| `ContentReset`  | 0b0000000001000000 | 文本内容需要重置               |
| `Callback`      | 0b0000001000000000 | 类组件的 callback ref 需要执行 |
| `Passive`       | 0b0000100000000000 | 需要执行 useEffect             |
| `Layout`        | 0b0100000000000000 | 需要执行 useLayoutEffect       |

`subtreeFlags` 是子树所有节点 flags 的按位或（OR），Commit 阶段通过检查 `subtreeFlags` 决定是否跳过整棵子树的遍历（冒泡优化）。

---

## 4. Fiber 节点的生命周期

```
Render 阶段（可中断，纯计算）：
  1. beginWork(fiber)  — 从上到下，创建/复用/更新子 Fiber 节点
  2. completeWork(fiber) — 从下到上，创建 DOM 节点、收集副作用
  3. 遍历可在任意节点暂停（让出主线程给浏览器渲染/用户输入）

Commit 阶段（不可中断，操作真实 DOM）：
  1. Before Mutation — 执行 useLayoutEffect 的 destroy
  2. Mutation — 执行 DOM 操作（Placement/Update/Deletion）
  3. Layout — 执行 useLayoutEffect 的 create + useEffect 异步调度
```

---

## 5. 与 Vue VNode 的核心差异

| 维度         | React Fiber Node                       | Vue VNode                            |
| ------------ | -------------------------------------- | ------------------------------------ |
| **结构**     | 链表（child/sibling/return 指针）      | 树（children 数组）                  |
| **遍历**     | 可中断的迭代式遍历                     | 递归遍历（不可中断）                 |
| **双缓冲**   | current ↔ workInProgress 两棵树        | 无（每次重新创建 VNode 树）          |
| **状态存储** | 状态存在 Fiber 节点上（memoizedState） | 状态存在响应式系统中（ref/reactive） |
| **副作用**   | 二进制 flags + Effect 链表             | 副作用函数由调度器统一管理           |
| **调度**     | 内置优先级车道（lanes）                | 无内置优先级（批量异步更新）         |

---

## 6. 实践意义

理解 Fiber Node 的数据结构，能直接解释以下常见面试题和 Bug：

- **为什么 Hooks 不能写在 if 里？** → memoizedState 是链表，靠执行顺序匹配
- **为什么 useEffect 是异步的？** → Effect 存在 updateQueue 的 lastEffect 循环链表中，Commit 后异步调度
- **为什么 startTransition 能提升流畅度？** → lanes 机制让 Transition 更新可被用户输入打断
- **为什么 React 的 Diff 是同层比较？** → Fiber 链表只遍历 child → sibling，不跨层
- **为什么 key 很重要？** → Diff 时通过 key 判断节点是否可以复用（alternate 复用）
