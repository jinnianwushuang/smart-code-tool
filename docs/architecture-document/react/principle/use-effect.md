---
title: useEffect
order: 14
---

# useEffect

对于资深开发者，理解 `useEffect` 不能停留在“生命周期替代品”，而应从 **“同步（Synchronization）”** 和 **“闭包快照（Closure Snapshot）”** 的底层视角来剖析。

其核心原理可以拆解为以下三个层面：

## 1. 核心本质：从“生命周期”到“副作用同步”

Vue 的生命周期是**基于动作**的（挂载了、更新了）；而 `useEffect` 是**基于状态**的。
React 的哲学是：**UI 是状态的函数，副作用也应该是状态的函数。**
`useEffect` 的真正作用是：**根据当前的状态（Deps），将外部系统（DOM、API、订阅）与当前的 Props/State 同步。**

## 2. 执行机制：渲染循环中的位点

`useEffect` 的执行是在 **浏览器完成渲染（Paint）之后** 异步触发的。

1. **Render 阶段**：React 计算组件输出（JSX），生成 Fiber 树。
2. **Commit 阶段**：React 操作 DOM，使界面更新。
3. **Paint**：浏览器绘制。
4. **Effect 执行**：浏览器绘制完成后，React 顺着 Fiber 树执行所有的 `useEffect`。
   - _注：这种异步设计是为了不阻塞视觉渲染。如果需要阻塞渲染（防止闪烁），应使用 `useLayoutEffect`。_

## 3. 闭包与“快照”原理

这是资深开发者最容易掉坑的地方。**每一次渲染，useEffect 看到的都是那一次渲染时的快照。**

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      // 这里的 count 永远指向这个 Effect 被创建时的那个值
      // 即使 3 秒后 count 变成了 5，这里打印的可能还是 0
      console.log(count)
    }, 3000)
  }, []) // 仅挂载执行
}
```

**底层逻辑**：当组件渲染时，React 会创建一个新的闭包函数传给 `useEffect`。这个函数捕获了当时的变量值。

## 4. 依赖项对比（Object.is）

React 如何决定是否重新执行 Effect？

- React 会在内部维护一个 **Effect 链表**。
- 它会存储上一次执行时的依赖项数组。
- 下一次渲染时，使用 `Object.is` 对新旧依赖项进行**浅比较**。
- 只要有一个元素变了，React 就会先执行上一次渲染留下的 **Cleanup 函数**，再执行本次的新 Effect。
-

## 5. 清理机制（Cleanup）

`useEffect` 返回的函数不是在组件卸载时才执行，而是在 **“下一次 Effect 执行前”** 执行。

- **流程**：渲染界面 $\rightarrow$ 清理上一次渲染的 Effect $\rightarrow$ 执行当前渲染的 Effect。
- 这保证了副作用的逻辑始终与当前状态匹配，避免了类似“旧订阅没取消就开了新订阅”导致的内存泄漏。
- ***

## 资深开发者深度避坑：

- **不要在依赖项里撒谎**：如果 Effect 用到了某个变量但没写进 `[]`，会产生难以排查的闭包旧值 Bug。
- **避免 Effect 链式调用**：如果 A Effect 改了 B 状态，B Effect 又改了 C 状态，这通常说明你的数据流设计有问题，建议合并状态或使用 `useMemo`。
- **函数组件的本能**：永远记住，函数组件体会在每次渲染时从头到尾跑一遍。所有的 Hooks 都是通过 Fiber 上的 **MemoizedState 链表** 按顺序找回自己状态的。
- ## 结合 Fiber 架构的源码逻辑，深入讲讲 React 是如何存储这些依赖项数组的

从资深开发者的角度看，`useEffect` 的底层实现是 **Fiber 架构**与**链表调度**的结合。我们直接拆解 React 源码级别的运行逻辑。

## 1. 存储结构：副作用链表 (Effect List)

在 React 的 **Fiber 节点**上，有一个属性叫 `memoizedState`。对于函数组件，它是一个**单向链表**，按 Hook 声明顺序存储了 `useState`、`useEffect` 等信息。

- **每一个 Hook 节点**：都保存了当前 Hook 的数据。

- **Effect 特有的数据结构**：

  ```typescript
  const effect = {
    tag, // 标识是 useEffect 还是 useLayoutEffect
    create, // 你的 Effect 函数体
    destroy, // 你的 Cleanup 清理函数
    deps, // 依赖项数组
    next, // 指向组件下一个 Effect 的循环链表
  }
  ```

-

这些 Effect 对象会被挂载到 Fiber 节点的 `updateQueue` 中。

## 2. 两个阶段：Mount 与 Update

React 源码中将 Hooks 分为 `mountEffect` 和 `updateEffect` 两个路径：

## **Mount 阶段 (首次渲染)**

1. **创建 Effect 对象**：将你的函数体和依赖项打包。
2. **构建循环链表**：将该 Effect 放入 Fiber 的 `updateQueue` 中。
3. **打上标记 (Flags)**：给这个 Fiber 节点打上一个 `Passive` (被动副作用) 或 `HasEffect` 的二进制标记。

## **Update 阶段 (后续渲染)**

1. **获取旧依赖**：从对应的旧 Fiber 节点（Alternate）中取出上次的 `deps`。
2. **浅比较 (Shallow Compare)**：
   - 遍历新旧 `deps`，使用 `Object.is` 逐个对比。
3. **决定是否执行**：
   - 如果**完全相同**：创建一个新的 Effect 对象，但**不打**执行标记，跳过本次执行。
   - 如果**不相同**：创建一个新 Effect 对象，并**打上 `HasEffect` 标记**，准备执行。

## 3. 调度与执行：异步宏任务

这是 React 性能优化的关键。`useEffect` 的执行是由 **Scheduler（调度器）** 维护的。

1. **渲染结束**：Commit 阶段结束后，React 不会立即运行 Effect。
2. **注册任务**：React 利用 `MessageChannel` (或类似的异步宏任务机制) 注册一个回调。
3. **浏览器绘图**：浏览器完成渲染，用户看到新界面。
4. **执行副作用**：
   - **先销毁**：遍历 Effect 链表，执行所有打标记节点的 `destroy` (Cleanup) 函数。
   - **再创建**：再次遍历，执行所有打标记节点的 `create` 函数。

## 4. 深度 Q&A：为什么必须是单向链表？

**问：为什么 Hooks 不能写在 if 语句里？**
**答：** 因为 React 查找旧状态（或旧依赖项）唯一的依据就是 **“执行顺序”**。
在 `updateEffect` 时，React 只是简单地移动 Fiber 链表指针：`nextHook = currentHook.next`。如果你的 Hooks 顺序变了，React 就会把 `useState` 的数据当成 `useEffect` 的，或者拿 A Effect 的旧依赖去对比 B Effect 的新依赖，导致内存数据完全错乱。

## 5. 核心源码逻辑伪代码

```javascript
function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook() // 找到当前对应的 Hook 节点
  const nextDeps = deps === undefined ? null : deps
  const prevEffect = hook.memoizedState

  if (prevEffect !== null) {
    const prevDeps = prevEffect.deps
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      // Object.is 比较
      // 依赖没变，只推入链表，不给 Fiber 打执行 Tag
      pushEffect(Passive, create, prevEffect.destroy, nextDeps)
      return
    }
  }

  // 依赖变了，打上 HasEffect 标记，后续会在 Commit 阶段后执行
  sideEffectTag |= HasEffect
  hook.memoizedState = pushEffect(Passive | HasEffect, create, undefined, nextDeps)
}
```

## 总结

`useEffect` 并不是魔法，它只是在 Fiber 节点上维护了一个 **Effect 任务链表**，并在浏览器渲染后的空闲时刻，通过 **依赖项浅比较** 决定是否触发链表里的回调。

**您想了解 `useLayoutEffect` 与 `useEffect` 在 Fiber 调度阶段的具体差异点吗？**

了解 `useLayoutEffect` 和 `useEffect` 的差异，是进阶 React 架构师的必经之路。虽然两者的 API 完全一致，但在 **Fiber 渲染流水线**中的执行时机有着本质区别。

简单一句话总结：**`useLayoutEffect` 是“看之前”同步执行，`useEffect` 是“看以后”异步执行。**

---

## 1. 执行时机的深度对比

在 React 的 **Commit 阶段**（即处理 DOM 的阶段），执行流程如下：

1. **Mutation 阶段**：React 将 Virtual DOM 的变更真正写入原生 DOM（此时用户还看不见，浏览器还未重绘）。
2. **执行 `useLayoutEffect` 的销毁函数**。
3. **执行 `useLayoutEffect` 的回调函数**：
   - **关键点**：此时代码是**同步**执行的。由于 JS 引擎线程和 GUI 渲染线程互斥，JS 没跑完，浏览器就无法进行 Paint（重绘）。
   - **结果**：如果你在这里修改了 DOM（比如改变颜色或位置），浏览器会合并这些修改，用户只会看到最终结果，**不会有闪烁**。
4. **浏览器 Paint（重绘）**：屏幕刷新，用户看到画面。
5. **执行 `useEffect`**：
   - **关键点**：由调度器以**异步宏任务**（通常是 `MessageChannel`）触发。
   - **结果**：此时用户已经看到第一版画面了。如果你在 `useEffect` 里改 DOM，用户会先看到 A，瞬间变到 B，产生**视觉闪烁**。

---

## 2. 核心差异对照表

| 特性                 | `useEffect`                         | `useLayoutEffect`                   |
| :------------------- | :---------------------------------- | :---------------------------------- |
| **执行时机**         | 浏览器渲染**后**（异步）            | 浏览器渲染**前**（同步）            |
| **对渲染的影响**     | **不阻塞**浏览器渲染，性能友好      | **阻塞**浏览器渲染，可能导致掉帧    |
| **适用场景**         | 绝大多数场景（API请求、订阅、日志） | 需要**操作 DOM 且防止闪烁**的场景   |
| **服务端渲染 (SSR)** | 正常工作                            | 会有警告（因为服务器没有 DOM 布局） |

---

## 3. 什么时候必须用 `useLayoutEffect`？

如果你需要**测量 DOM 元素的尺寸或位置**，并根据这些信息立即修改 UI，就必须用它。

**场景案例：自动定位的 Tooltip（气泡提示）**

1. 用户点击按钮，气泡弹出。
2. **使用 `useEffect`**：气泡先出现在默认位置 (0,0)，下一帧根据计算位移到按钮旁边。用户看到气泡“跳”了一下。
3. **使用 `useLayoutEffect`**：在浏览器还没画出来之前，代码已经算好了位置并改好了 DOM。用户看到气泡第一眼就在正确的位置。

---

## 4. 源码视角下的标记位

在 Fiber 架构中，这两者的存储位置都在 `updateQueue` 中，但 **Tag 标记** 不同：

- `useEffect` 打的是 `Passive` 标记（被动副作用）。
- `useLayoutEffect` 打的是 `Layout` 标记。
-

React 在 Commit 阶段完成后，会立即检查是否有 `Layout` 标记的任务，如果有，直接在当前线程循环里跑完；而对于 `Passive` 标记，则丢给调度器等下一波异步通知。

---

## 5. 资深开发者建议

- **默认使用 `useEffect`**：为了保证页面的流畅度（FCP/LCP 指标），不要轻易阻塞渲染。

- **警惕性能陷阱**：如果在 `useLayoutEffect` 里进行耗时计算，整个页面会卡死，直到代码跑完。

- **SSR 兼容性**：在 Next.js 或 Remix 中，由于服务器没有 `window` 环境，使用 `useLayoutEffect` 会报警告。常见的 hack 手法是：

  ```javascript
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
  ```

- **既然聊到了渲染性能，您想顺便了解一下如何通过 `useTransition` (React 18 新特性) 来优化那些会导致卡顿的大规模状态更新吗？**
