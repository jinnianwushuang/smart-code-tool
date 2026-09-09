---
title: "Fiber 架构与优先级调度 [P6-P7]"
level: "senior"
tags: ["React", "Fiber", "时间切片", "优先级调度"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Fiber 架构与优先级调度 [P6-P7]

> React Fiber 是 React 16 引入的全新协调引擎，它将不可中断的递归渲染改造为可中断的链表遍历，实现了时间切片和优先级调度，是 React 并发模式的基石。

## 核心概念（What）

### Fiber 架构解决了什么问题？

```
Stack Reconciler（React 15 及之前）
├── 递归调用，调用栈不可中断
├── 大量组件更新时阻塞主线程
├── 无法区分更新优先级
└── 用户交互被阻塞 → 卡顿

Fiber Reconciler（React 16+）
├── 链表结构替代树结构
├── 每个 Fiber 节点是一个工作单元
├── 工作可中断、可恢复
├── 支持优先级调度
└── 时间切片 → 流畅的用户体验
```

### Fiber 节点结构

```javascript
// Fiber 节点的简化结构
function FiberNode {
  // 静态数据结构
  tag;           // 组件类型（FunctionComponent, ClassComponent, HostComponent...）
  key;           // 唯一标识
  type;          // 组件函数/类/DOM 标签名
  stateNode;     // DOM 节点或类组件实例

  // 链表结构（替代树的 children/parent）
  return;        // 父节点
  child;         // 第一个子节点
  sibling;       // 下一个兄弟节点
  index;         // 在兄弟节点中的索引

  // 工作单元
  pendingProps;  // 新的 props
  memoizedProps; // 上次渲染的 props
  memoizedState; // 上次渲染的 state（Hooks 链表）
  updateQueue;   // 待处理的更新队列

  // 副作用
  flags;         // 副作用标记（Placement, Update, Deletion...）
  subtreeFlags;  // 子树的副作用
  deletions;     // 需要删除的子节点

  // 双缓冲
  alternate;     // 指向另一棵树中对应的 Fiber 节点
}
```

---

## 底层原理（Why）

### 1. Fiber 链表遍历

```
Fiber 树（链表结构）：

        Root
         │ (child)
        App
         │ (child)
       Header ──→ Main ──→ Footer
        │          │
     (child)    (child)
      Logo     Content
                  │
               (child)
              List ──→ Sidebar
               │
            (child)
            Item1 ──→ Item2 ──→ Item3

遍历顺序（深度优先）：
Root → App → Header → Logo → (返回 Header)
→ (返回 App) → Main → Content → List → Item1
→ Item2 → Item3 → (返回 List) → Sidebar
→ (返回 Main) → Footer → (返回 App) → (返回 Root)
```

```javascript
// Fiber 遍历算法（简化版）
function workLoop() {
  let workInProgress = rootFiber.child;

  while (workInProgress) {
    // 执行当前 Fiber 的工作
    workInProgress = performUnitOfWork(workInProgress);
    // performUnitOfWork 返回下一个要处理的 Fiber
  }
}

function performUnitOfWork(fiber) {
  // 1. 执行当前节点的工作（渲染/对比）
  beginWork(fiber);

  // 2. 返回下一个工作单元
  // 优先级：子节点 → 兄弟节点 → 叔父节点
  if (fiber.child) {
    return fiber.child;
  }

  while (fiber) {
    completeWork(fiber); // 完成当前节点

    if (fiber.sibling) {
      return fiber.sibling; // 处理兄弟
    }
    fiber = fiber.return; // 向上回溯
  }

  return null; // 遍历完成
}
```

### 2. 双缓冲机制（Double Buffering）

```javascript
// React 维护两棵 Fiber 树：current 和 workInProgress

// current 树：当前显示在屏幕上的
// workInProgress 树：正在构建的新树

// 更新过程：
// 1. 从 current 树的根节点开始
// 2. 为每个节点创建/复用 alternate 节点
// 3. 在 workInProgress 树上执行更新
// 4. 完成后，将 workInProgress 树的根节点替换 current 根节点

function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (!workInProgress) {
    // 首次：创建新的 Fiber 节点
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用：更新 props
    workInProgress.pendingProps = pendingProps;
    workInProgress.flags = 0;
    workInProgress.subtreeFlags = 0;
  }

  return workInProgress;
}

// 提交阶段：切换两棵树
function commitRoot(root) {
  const finishedWork = root.finishedWork;

  // 切换 current 指针
  root.current = finishedWork;

  // 执行 DOM 操作
  commitMutationEffects(root, finishedWork);

  // 清理 alternate 引用
  // ...
}
```

### 3. 优先级调度（Lane Model）

```javascript
// React 18 的 Lane 优先级模型
const Lanes = {
  NoLanes:          0b0000000000000000000000000000000,
  SyncLane:         0b0000000000000000000000000000001, // 同步任务
  InputContinuousLane: 0b0000000000000000000000000000100, // 连续输入
  DefaultLane:      0b0000000000000000000000000010000, // 默认优先级
  TransitionLanes:  0b0000000000000000011111111000000, // 过渡动画
  IdleLane:         0b0100000000000000000000000000000, // 空闲任务
};

// 优先级从高到低：
// Sync > InputContinuous > Default > Transition > Idle

// 不同操作对应的 Lane：
// - setState（用户交互触发）→ SyncLane
// - onClick/onInput → InputContinuousLane
// - useEffect → DefaultLane
// - startTransition → TransitionLanes
// - 空闲时执行 → IdleLane
```

```javascript
// 时间切片实现（Scheduler）
function workLoopConcurrent() {
  // 在每个时间切片中检查是否需要让出主线程
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function shouldYield() {
  // 检查当前帧是否还有剩余时间
  // 默认 5ms 一个时间切片
  return getCurrentTime() >= deadline;
}

// Scheduler 使用 MessageChannel 实现调度
// 比 setTimeout 更精确（setTimeout 最小延迟 4ms）
const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = performWorkUntilDeadline;

function scheduleCallback(callback) {
  port.postMessage(null);
}
```

### 4. beginWork 与 completeWork

```javascript
// beginWork：向下遍历，执行组件渲染/对比
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case FunctionComponent: {
      // 执行函数组件，收集 Hooks 状态
      const children = renderWithHooks(
        current, workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
      reconcileChildren(current, workInProgress, children);
      break;
    }
    case HostComponent: {
      // 原生 DOM 元素
      reconcileChildren(current, workInProgress, workInProgress.pendingProps.children);
      break;
    }
  }

  // 返回第一个子节点继续遍历
  return workInProgress.child;
}

// completeWork：向上回溯，创建/更新 DOM 节点
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostComponent: {
      if (current === null) {
        // 首次挂载：创建 DOM 节点
        const instance = createInstance(workInProgress.type, workInProgress.pendingProps);
        // 将所有子节点 append 到 instance
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      } else {
        // 更新：标记需要更新的 props
        markUpdate(workInProgress);
      }
      break;
    }
  }

  // 冒泡副作用标记到父节点
  bubbleProperties(workInProgress);
}
```

---

## 实战应用（How）

### 使用 startTransition 控制优先级

```jsx
import { useState, useTransition, startTransition } from 'react';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value); // 高优先级：立即更新输入框

    startTransition(() => {
      // 低优先级：搜索结果可以延迟
      setResults(expensiveSearch(value));
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList results={results} />
    </div>
  );
}
```

### 避免不必要的重渲染

```jsx
// 1. React.memo 跳过未变化的组件
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexUI data={data} />;
});

// 2. useMemo 缓存计算结果
const filteredList = useMemo(() => {
  return list.filter(item => item.active);
}, [list]);

// 3. useCallback 稳定函数引用
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);

// 4. 使用 key 强制重新挂载
<Component key={userId} /> // userId 变化时完全重新创建
```

---

## 高频面试题

### Q1: React Fiber 架构的核心改进是什么？

**参考答案要点**：
- 将递归渲染改造为可中断的链表遍历
- 每个 Fiber 节点是一个工作单元，工作可暂停/恢复
- 引入双缓冲机制（current + workInProgress）
- 支持基于优先级的调度（Lane Model）
- 实现时间切片，避免长时间阻塞主线程

### Q2: React 的调度机制是如何工作的？

**参考答案要点**：
- Scheduler 使用 MessageChannel 实现异步调度
- 每个时间切片默认 5ms，超时则让出主线程
- Lane Model 将更新分为不同优先级
- 用户交互（点击/输入）优先级最高
- useEffect 和过渡动画优先级较低
- shouldYield() 在每个工作单元后检查是否需要让出

### Q3: beginWork 和 completeWork 分别做什么？

**参考答案要点**：
- beginWork：向下遍历，执行组件渲染函数，对比子节点（reconcile）
- completeWork：向上回溯，创建/更新 DOM 节点，冒泡副作用标记
- beginWork 阶段可以中断，completeWork 阶段不可中断
- completeWork 阶段创建的 DOM 节点还未挂载，等到 commit 阶段才真正操作 DOM

---

## 延伸思考

1. **设计题**：如果让你设计一个可中断的渲染引擎，如何实现工作单元的保存和恢复？
2. **场景题**：一个大型表单在输入时卡顿，如何用 Fiber 的优先级机制优化？
3. **对比题**：React Fiber vs Vue 3 的响应式系统，各自的更新策略差异？

---

## 参考资料

- [React 源码 - ReactFiberWorkLoop](https://github.com/facebook/react/tree/main/packages/react-reconciler/src)
- [A Complete Guide to React Fiber Architecture](https://juejin.cn/post/70781409539)
- [React Scheduler](https://github.com/facebook/react/tree/main/packages/scheduler)
- [Inside Fiber: in-depth overview of the new reconciliation algorithm](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e)
