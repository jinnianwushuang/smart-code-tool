---
title: 'React Fiber 架构与并发模式原理'
tags: ['React', 'Fiber', '并发模式', '调度', '底层原理']
---

# React Fiber 架构与并发模式原理

> 本文从 React 15 的 Stack Reconciler 瓶颈出发，完整拆解 Fiber 架构的设计动机、Fiber Node 数据结构、双缓冲机制、协调过程（Reconciliation）、并发模式（Concurrent Mode）、Lane 优先级调度模型、Render/Commit 两阶段提交，以及 Suspense/Transition 的底层原理。

---

## 一、从 Stack Reconciler 到 Fiber 架构

### 1.1 React 15 的瓶颈

```
React 15（Stack Reconciler）
┌──────────────────────────────────────────────────────────┐
│  递归调用栈（同步、不可中断）                               │
│                                                          │
│  reconcileTree(parent)                                   │
│  ├── reconcileChild(child1)                              │
│  │   ├── reconcileChild(grandchild1)                     │
│  │   │   └── ... 递归到底                                 │
│  │   └── reconcileChild(grandchild2)                     │
│  ├── reconcileChild(child2)                              │
│  └── ...                                                 │
│                                                          │
│  问题：                                                    │
│  ① 递归调用栈一旦开始，无法暂停                            │
│  ② 整棵树必须在一次帧内完成（>16.6ms → 掉帧卡顿）         │
│  ③ 无法区分"这个更新"和"那个更新"的优先级                  │
│  ④ 用户输入/动画 与 数据更新 争抢主线程                    │
└──────────────────────────────────────────────────────────┘
```

**核心矛盾**：JavaScript 单线程 + 递归不可中断 = 长任务阻塞渲染。

### 1.2 Fiber 架构的设计目标

```
Fiber 架构三大目标
├── ① 可中断的渲染：将递归改为链表遍历，每步可暂停
├── ② 优先级调度：不同更新有不同优先级，高优先级可打断低优先级
└── ③ 增量渲染：大任务拆分为多个小任务，跨帧执行
```

**本质**：将 React 的渲染从"同步递归"变为"异步可中断的协程式调度"。

---

## 二、Fiber Node 数据结构

### 2.1 Fiber 节点完整字段

```typescript
// Fiber Node 完整数据结构（React 源码简化版）
interface FiberNode {
  // ── 静态数据结构（描述组件树形状）──
  tag: WorkTag // 组件类型：FunctionComponent / ClassComponent / HostComponent / HostRoot ...
  key: null | string // 复用标识
  type: any // 组件函数/类/DOM 标签名（'div' / App / () => <div/>）
  stateNode: any // 原生 DOM 节点 / 类组件实例

  // ── 链表结构（替代树的子节点/兄弟/父指针）──
  return: Fiber | null // 父节点（调用者）
  child: Fiber | null // 第一个子节点
  sibling: Fiber | null // 下一个兄弟节点
  index: number // 在兄弟链表中的位置

  // ── 双缓冲（指向另一棵树的对应节点）──
  alternate: Fiber | null // 指向 workInProgress 树（或 current 树）中的对应节点

  // ── 状态与更新（存储组件数据和待处理更新）──
  memoizedState: any // 函数组件：Hooks 链表；类组件：state
  memoizedProps: any // 上次渲染的 props
  pendingProps: any // 待处理的 props（尚未应用）
  updateQueue: UpdateQueue | null // 待处理的更新队列（setState 等）

  // ── 副作用标记（标记需要执行的副作用）──
  flags: Flags // 副作用标记：Placement / Update / Deletion / ChildDeletion ...
  subtreeFlags: Flags // 子树的副作用汇总（优化冒泡）
  deletions: Fiber[] // 需要删除的子节点列表

  // ── 优先级 ──
  lanes: Lanes // 本节点的优先级
  childLanes: Lanes // 子树的优先级（用于跳过无变化的子树）

  // ── Ref ──
  ref: Ref | null // ref 回调 / RefObject
}
```

### 2.2 链表遍历 vs 递归遍历

```
传统树递归：                           Fiber 链表遍历：

       A                                    A
      / \                                  / \
     B   C                                B → C
    / \   \                              / \    \
   D   E   F                            D → E    F

递归调用栈：                            链表遍历（while 循环）：
A()                                    firstChild = A.child
 ├─ B()                                │
 │  ├─ D()                             while (node) {
 │  └─ E()                             │   work(node);     // 处理当前节点
 └─ C()                                │   if (node.child) {
    └─ F()                             │     node = node.child;  // 深入子节点
                                       │   } else if (node.sibling) {
问题：调用栈深度 = 树深度               │     node = node.sibling; // 横向移动
     无法中断                           │   } else {
                                       │     node = node.return;   // 回溯父节点
                                       │     while (node && !node.sibling) {
                                       │       node = node.return;
                                       │     }
                                       │     node = node?.sibling;
                                       │   }
                                       │ }
                                       优势：每步都是 O(1)，可随时暂停
```

### 2.3 Fiber 遍历顺序（深度优先）

```
构建阶段（Render）的遍历顺序：

A → B → D → (D 无子 → 兄弟) → E → (E 无子 → 兄弟) → (B 无兄弟 → 回溯)
→ C → F → (F 无子 → 兄弟) → (C 无兄弟 → 回溯) → (A 无兄弟 → 完成)

完整顺序：A → B → D → E → C → F

对应"向下深度优先 + 回溯"的遍历路径：
    A
   ↙  ↘
  B    C
 ↙ ↘    ↘
D   E    F

遍历时：
  - 有 child → 向下
  - 无 child → 看 sibling
  - 无 sibling → 回 return，再找 sibling
```

---

## 三、双缓冲机制（Double Buffering）

### 3.1 current 树与 workInProgress 树

```
┌─────────────────────────────────────────────────────────────┐
│                    双缓冲机制                                  │
│                                                              │
│  current 树（当前屏幕显示）    workInProgress 树（内存构建）   │
│                                                              │
│       A (current)                   A' (workInProgress)      │
│      ↕ alternate                   ↕ alternate               │
│       B                             B'                       │
│      ↕                             ↕                        │
│       C                             C'                       │
│                                                              │
│  渲染过程：                                                   │
│  ① 从 current 树的 root 开始                                 │
│  ② 对比 current node 与 pending changes                      │
│  ③ 创建/复用 workInProgress 节点                             │
│  ④ 通过 alternate 指针关联两棵树的对应节点                   │
│  ⑤ 构建完成后，root 指针切换到 workInProgress 树             │
│  ⑥ 下次渲染时，角色互换                                      │
│                                                              │
│  优势：                                                       │
│  • 屏幕始终显示完整的 current 树（不会闪烁）                  │
│  • workInProgress 树在内存中构建，不影响 UI                   │
│  • 通过 alternate 指针实现 O(1) 节点复用                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 节点复用规则

```
createWorkInProgress(fiber, pendingProps):
│
├── alternate 存在？
│   ├── 是 → 复用已有节点，更新 pendingProps
│   │        flags = NoFlags（重置副作用标记）
│   │
│   └── 否 → 创建新节点
│            如果是 HostComponent → 创建 DOM 节点
│            如果是 ClassComponent → 创建实例
│            建立 alternate 双向指针
│
└── 返回 workInProgress 节点

// 关键：alternate 指针在渲染完成后不会断开
// 下次渲染时，workInProgress 变成 current，current 变成 workInProgress
```

---

## 四、协调过程（Reconciliation）

### 4.1 beginWork — 向下遍历

```
beginWork(current, workInProgress, renderLanes):
│
├── ① 检查是否可以复用（bailout）
│   ├── oldProps === newProps？
│   ├── current !== null？
│   └── 子树无变化（childLanes 无交集）？
│   → 全部满足 → 跳过，直接复用
│
├── ② 根据 tag 类型分发处理
│   ├── FunctionComponent → 调用组件函数，获取 children
│   ├── ClassComponent → 调用 render()，获取 children
│   ├── HostComponent → 处理原生 DOM 属性
│   └── HostRoot → 处理根节点
│
├── ③ 处理 Hooks（函数组件）
│   └── 遍历 Hooks 链表，执行 useState/useEffect 等
│
├── ④ 递归处理子节点（reconcileChildren）
│   └── Diff 算法：对比 current.child 与 newChildren
│
└── ⑤ 返回第一个子节点（继续向下遍历）
```

### 4.2 completeWork — 向上冒泡

```
completeWork(current, workInProgress, renderLanes):
│
├── ① 根据 tag 类型处理
│   ├── HostComponent（原生 DOM）
│   │   ├── 创建/更新 DOM 实例
│   │   ├── 设置属性（props → DOM attributes）
│   │   └── 收集副作用标记
│   │
│   ├── HostText（文本节点）
│   │   └── 创建/更新文本 DOM
│   │
│   └── FunctionComponent / ClassComponent
│       └── 不需要创建 DOM，只需冒泡子树的副作用
│
├── ② 冒泡子树副作用
│   └── workInProgress.subtreeFlags |= child.subtreeFlags
│
└── ③ 返回兄弟节点或父节点（向上回溯）
```

### 4.3 Diff 算法（reconcileChildren）

```
Diff 三种场景：

场景一：单节点 Diff
├── key + type 相同 → 复用（updateSlot）
└── 不同 → 创建新节点（标记旧节点为 Deletion）

场景二：多节点 Diff（数组）
├── 第一轮：从左到右，key + type 相同则复用
│   └── 遇到不同 → 停止第一轮
├── 第二轮：处理剩余节点
│   ├── 新节点全部处理完 → 旧节点标记为 Deletion
│   ├── 旧节点全部处理完 → 新节点标记为 Placement
│   └── 都有剩余 → 用 Map 做 key 索引
│       └── 遍历新节点，从 Map 中查找可复用的旧节点
│           ├── 找到 → 复用 + 标记 Placement（位置变化）
│           └── 未找到 → 创建新节点
│
└── 关键优化：
    • 只比较同层节点（不跨层）
    • 用 key 做 O(1) 查找（Map 索引）
    • 两轮遍历覆盖所有场景

场景三：条件分支（if/else 切换）
├── key 不同 → 整棵子树销毁重建
└── key 相同 → 复用（与单节点 Diff 相同）
```

---

## 五、并发模式与时间切片

### 5.1 Scheduler 调度器

```
React 并发模型分层：

┌──────────────────────────────────────────────────────────┐
│  React 层（组件代码）                                      │
│  setState / useReducer / startTransition                 │
└────────────────────────┬─────────────────────────────────┘
                         │ 创建 Update
┌────────────────────────▼─────────────────────────────────┐
│  React Reconciler 层                                     │
│  Fiber 遍历 + Diff + 标记副作用                           │
│  可中断（每个 Fiber 节点处理完可暂停）                      │
└────────────────────────┬─────────────────────────────────┘
                         │ 调度工作单元
┌────────────────────────▼─────────────────────────────────┐
│  Scheduler 调度器（独立包）                                │
│  时间切片 + 优先级队列 + MessageChannel                    │
│  核心：scheduleCallback(priorityLevel, callback)          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 时间切片原理

```
浏览器一帧 = 16.6ms（60fps）

时间切片策略：
┌──────────────────────────────────────────────────────────┐
│  帧 1                                                    │
│  ├── React 工作 5ms → 让出主线程                         │
│  ├── 浏览器渲染 11.6ms                                    │
│                                                          │
│  帧 2                                                    │
│  ├── React 继续工作 5ms → 让出主线程                      │
│  ├── 浏览器渲染 11.6ms                                    │
│                                                          │
│  帧 3                                                    │
│  ├── React 完成工作 3ms → 进入 Commit 阶段               │
│  ├── Commit（同步、不可中断）2ms                          │
│  └── 浏览器渲染 11.6ms                                    │
└──────────────────────────────────────────────────────────┘

实现机制：
  • MessageChannel .postMessage() 创建宏任务
  • 每个时间片 = 5ms（默认）
  • 时间片用完 → yield（让出主线程）
  • 下一帧 → 恢复执行（从暂停的 Fiber 节点继续）
```

### 5.3 工作循环（workLoop）

```
// workLoop 简化版（React 源码核心逻辑）
function workLoopConcurrent() {
  // 当前有工作单元 且 没有更高优先级的任务打断
  while (workInProgress !== null && !shouldYield()) {
    // 处理一个 Fiber 节点（同步、不可中断）
    performUnitOfWork(workInProgress);
  }
}

function workLoopSync() {
  // 同步模式：不允许中断
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;

  // ① beginWork：向下遍历，处理当前节点
  let next = beginWork(current, unitOfWork, renderLanes);

  if (next === null) {
    // 没有子节点 → 完成当前节点 → 向上冒泡
    completeUnitOfWork(unitOfWork);
  } else {
    // 有子节点 → 继续处理子节点
    workInProgress = next;
  }
}
```

---

## 六、Lane 优先级调度模型

### 6.1 Lane 位运算模型

```
React 18 Lane 模型（位运算优先级）：

┌──────────────────────────────────────────────────────────┐
│  Lane 名称              位值              优先级          │
│  ─────────────────────────────────────────────────       │
│  SyncLane               0b000000000000001  最高          │
│  InputContinuousLane    0b000000000000100  高（连续输入） │
│  DefaultLane            0b000000000010000  默认          │
│  TransitionLanes        0b000011111000000  过渡（低）    │
│  IdleLane               0b010000000000000  空闲（最低）  │
│  OffscreenLane          0b100000000000000  离屏          │
│                                                              │
│  位运算操作：                                                 │
│  • 合并优先级：lane1 | lane2（OR）                           │
│  • 检查包含：lanes & lane（AND → 非零则包含）               │
│  • 移除优先级：lanes & ~lane（AND NOT）                      │
│  • 最高优先级：lanes & -lanes（取最低位的 1）                │
└──────────────────────────────────────────────────────────┘
```

### 6.2 优先级映射

```
用户操作                    → Lane 优先级
─────────────────────────────────────────
flushSync(() => setState()) → SyncLane（最高，同步执行）
onClick / onInput           → InputContinuousLane（连续输入）
useState / useReducer       → DefaultLane（默认）
startTransition(() => ...)  → TransitionLanes（过渡，可中断）
useDeferredValue()          → TransitionLanes（延迟值）
useEffect                   → 跟随触发更新的 Lane
useIdleCallback             → IdleLane（空闲时执行）
```

### 6.3 饥饿问题与优先级提升

```
问题：低优先级任务可能永远得不到执行（被高优先级不断打断）

解决方案：优先级提升（Starvation Prevention）

workLoop 每次执行前检查：
  const nextLane = getHighestPriorityLane(pendingLanes);

  // 如果低优先级任务等待时间超过阈值
  if (currentTime - task.startTime > TIMEOUT_THRESHOLD) {
    // 提升优先级到 SyncLane，强制执行
    task.lane = SyncLane;
  }

效果：
  • 低优先级任务等待过久 → 自动提升为最高优先级
  • 保证所有更新最终都会被处理
  • 类似操作系统调度的"老化"机制
```

---

## 七、Render 阶段与 Commit 阶段

### 7.1 两阶段模型

```
React 渲染两阶段：

┌──────────────────────────────────────────────────────────┐
│  Render 阶段（可中断、纯计算、无副作用）                    │
│                                                          │
│  • 遍历 Fiber 树                                         │
│  • 对比 current 与 workInProgress                        │
│  • 标记副作用（flags）                                    │
│  • 不调用 DOM API                                         │
│  • 不调用 ref                                             │
│  • 可被更高优先级更新打断                                  │
│                                                          │
│  包含：beginWork + completeWork + reconcileChildren       │
└──────────────────────────┬───────────────────────────────┘
                           │ Render 完成
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Commit 阶段（同步、不可中断、执行副作用）                  │
│                                                          │
│  三个子阶段（按顺序执行）：                                │
│                                                          │
│  ① Before Mutation（DOM 操作前）                          │
│     • 调用 getSnapshotBeforeUpdate                       │
│     • 调度 useEffect 的销毁（异步）                       │
│                                                          │
│  ② Mutation（执行 DOM 操作）                              │
│     • 执行 Placement（插入 DOM）                          │
│     • 执行 Update（更新 DOM 属性）                        │
│     • 执行 Deletion（移除 DOM + 调用卸载生命周期）        │
│     • 调用 useLayoutEffect 的销毁                         │
│     • 切换 current 指针（root.current = finishedWork）    │
│                                                          │
│  ③ Layout（DOM 操作后）                                   │
│     • 调用 useLayoutEffect 的创建                         │
│     • 调用 componentDidMount / componentDidUpdate        │
│     • 设置 ref                                            │
│                                                          │
│  Commit 后（异步）：                                       │
│  • 调度 useEffect 的创建（被动效果）                       │
│  • 调度被动事件监听器                                      │
└──────────────────────────────────────────────────────────┘
```

### 7.2 为什么 Commit 不可中断？

```
Commit 阶段必须同步完成的原因：

① DOM 操作是批量的
   • 如果中断，用户会看到"半更新"的 UI
   • 例如：列表插入了 3 项但只渲染了 1 项

② 生命周期需要确定性
   • componentDidMount 必须在 DOM 插入后立即调用
   • useLayoutEffect 必须在浏览器绘制前同步执行
   • 如果中断，生命周期调用时机不确定

③ Ref 需要指向正确的节点
   • ref.current 必须在 Commit 后指向新的 DOM 节点
   • 如果中断，ref 可能指向旧节点

结论：
  Render 阶段可中断 → 因为只是计算，不影响 UI
  Commit 阶段不可中断 → 因为涉及真实 DOM 操作和生命周期
```

---

## 八、Suspense 与 Transition

### 8.1 Suspense 底层原理

```
Suspense 工作机制：

┌──────────────────────────────────────────────────────────┐
│  <Suspense fallback={<Loading />}>                       │
│    <AsyncComponent />                                     │
│  </Suspense>                                              │
│                                                          │
│  渲染流程：                                                │
│  ① 渲染 AsyncComponent → 抛出 Promise（数据未就绪）       │
│  ② React 捕获 Promise → 向上查找最近的 Suspense 边界     │
│  ③ 渲染 fallback（Loading）                              │
│  ④ Promise resolve 后 → 重新渲染 AsyncComponent          │
│  ⑤ 用真实内容替换 fallback                                │
│                                                          │
│  Fiber 层面的实现：                                        │
│  • Suspense 组件对应 SuspenseComponent tag                │
│  • 子组件 throw Promise → 标记为 Suspended                │
│  • 创建 Offscreen Fiber（隐藏子树）                       │
│  • Promise resolve → 调度重新渲染 → 切换到显示子树        │
└──────────────────────────────────────────────────────────┘
```

### 8.2 startTransition 原理

```
startTransition(() => {
  setSearchQuery(input);  // 标记为 Transition 优先级
});

底层流程：
┌──────────────────────────────────────────────────────────┐
│  ① startTransition 设置全局 Transition Lane               │
│     → 内部的 setState 使用 TransitionLanes               │
│                                                          │
│  ② React 调度器将 Transition 更新排入低优先级队列          │
│     → 不阻塞用户输入（SyncLane / InputContinuousLane）    │
│                                                          │
│  ③ 如果用户继续输入 → 高优先级更新打断 Transition 渲染    │
│     → Transition 渲染暂停，等待高优先级完成               │
│                                                          │
│  ④ 高优先级完成后 → 恢复 Transition 渲染                  │
│     → 可能重新基于最新状态开始（丢弃旧的 workInProgress） │
│                                                          │
│  效果：                                                    │
│  • 用户输入始终流畅（不被大数据渲染阻塞）                  │
│  • Transition 渲染在空闲时完成                             │
│  • 如果数据变化太快 → 旧的 Transition 渲染被丢弃          │
└──────────────────────────────────────────────────────────┘
```

### 8.3 useDeferredValue 原理

```
const deferredQuery = useDeferredValue(query);

底层实现：
┌──────────────────────────────────────────────────────────┐
│  ① query 变化 → 触发同步渲染（DefaultLane）              │
│     → 输入框立即更新（高优先级）                          │
│                                                          │
│  ② React 检测到 useDeferredValue                         │
│     → 自动创建一个 Transition 优先级的渲染                │
│     → deferredQuery 在 Transition 渲染中使用新值          │
│                                                          │
│  ③ 同步渲染先完成（输入框更新）                           │
│     → 浏览器绘制                                         │
│                                                          │
│  ④ Transition 渲染在后台继续                             │
│     → deferredQuery 更新 → 列表重新渲染                  │
│     → 可被用户输入打断                                    │
│                                                          │
│  对比 startTransition：                                   │
│  • startTransition：包裹 setState，标记更新优先级         │
│  • useDeferredValue：包裹值，延迟值的"生效"时间           │
│  • 本质相同：都是将部分渲染降级为 Transition 优先级        │
└──────────────────────────────────────────────────────────┘
```

---

## 九、Fiber 架构与 Vue/Flutter 调度模型对比

```
┌─────────────────────────────────────────────────────────────┐
│                  三大框架调度模型对比                          │
│                                                              │
│  React Fiber              Vue 3 Scheduler       Flutter      │
│  ───────────              ───────────────       ────────     │
│                                                              │
│  可中断的 Fiber 遍历      同步递归 + 批量更新    帧回调       │
│  └── 每个节点可暂停       └── nextTick 批量      └── VSync    │
│                                                              │
│  Lane 优先级模型          异步 + 微任务批处理    无优先级     │
│  └── 位运算区分           └── queueJob 去重      └── 按帧调度 │
│                                                              │
│  双缓冲（current/WIP）   无（直接修改响应式）   三棵树       │
│  └── alternate 指针      └── Proxy 拦截          └── Widget   │
│                           Effect → 渲染         Element      │
│                                                       RenderObject │
│                                                              │
│  时间切片               无（依赖浏览器 VSync）  VSync 回调   │
│  └── MessageChannel      └── 微任务队列         └── 16.6ms   │
│                                                              │
│  核心差异：                                                    │
│  • React：应用层实现并发调度（不依赖浏览器）                  │
│  • Vue：依赖浏览器微任务 + Proxy 响应式                      │
│  • Flutter：依赖引擎 VSync + 三层树不可中断                  │
│                                                              │
│  共同本质：                                                    │
│  数据变化 → 构建虚拟树 → Diff → 应用到真实树 → 像素上屏     │
└─────────────────────────────────────────────────────────────┘
```

---

## 十、高频面试题

### 10.1 Fiber 架构解决了什么问题？

```
Stack Reconciler 的问题：
  • 递归调用栈不可中断
  • 大组件树渲染阻塞主线程 → 掉帧卡顿
  • 无法区分更新优先级

Fiber 架构的解决：
  • 递归 → 链表遍历（每步 O(1)，可暂停）
  • 时间切片（每 5ms 让出主线程）
  • Lane 优先级模型（高优先级可打断低优先级）
  • 双缓冲（current / workInProgress，不闪烁）
```

### 10.2 Render 阶段和 Commit 阶段有什么区别？

```
Render 阶段：
  • 可中断（每个 Fiber 节点处理完可暂停）
  • 纯计算（不调用 DOM API，不执行副作用）
  • 遍历 Fiber 树 + Diff + 标记副作用
  • 可被更高优先级更新打断

Commit 阶段：
  • 不可中断（同步执行）
  • 执行副作用（DOM 操作、生命周期、ref）
  • 三个子阶段：Before Mutation → Mutation → Layout
  • 完成后切换 current 指针
```

### 10.3 startTransition 和 useDeferredValue 有什么区别？

```
startTransition：
  • 包裹 setState 调用
  • 标记"这个更新"为 Transition 优先级
  • 适用于：你能控制 setState 调用的场景

useDeferredValue：
  • 包裹一个值
  • 延迟这个值的"生效"时间
  • 适用于：你无法控制 setState（如 props 传入的值）的场景

本质相同：
  都是将部分渲染降级为 Transition 优先级
  区别在于标记的位置（更新 vs 值）
```

---

## 参考资料

- [React 源码](https://github.com/facebook/react)
- [A Guide to the React Rendering Model](https://blog.isquaredsoftware.com/series/illustrated-react/)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
