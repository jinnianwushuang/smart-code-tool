---
title: 'useEffect 深度解析：从同步语义到 Fiber 调度'
tags: ['React']
---

# useEffect 深度解析：从同步语义到 Fiber 调度

> 理解 useEffect 不能停留在"生命周期替代品"，而应从**同步（Synchronization）**和**闭包快照（Closure Snapshot）**的底层视角剖析。

---

## 1. 核心本质：基于状态的副作用同步

Vue 的生命周期是**基于动作**的（挂载了、更新了），而 `useEffect` 是**基于状态**的。

React 的哲学：**UI 是状态的函数，副作用也应该是状态的函数。**

`useEffect` 的真正作用：根据当前状态（Deps），将外部系统（DOM、API、订阅）与 Props/State **同步**。

---

## 2. 执行机制：渲染流水线中的位点

`useEffect` 在浏览器完成渲染（Paint）**之后**异步触发：

| 阶段       | 说明                                                    |
| ---------- | ------------------------------------------------------- |
| **Render** | React 计算组件输出（JSX），生成 Fiber 树                |
| **Commit** | React 操作 DOM，界面更新                                |
| **Paint**  | 浏览器绘制                                              |
| **Effect** | 浏览器绘制完成后，React 沿 Fiber 树执行所有 `useEffect` |

> 异步设计是为了不阻塞视觉渲染。若需阻塞渲染（防止闪烁），应使用 `useLayoutEffect`。

---

## 3. 闭包快照：每次渲染都是独立世界

**每一次渲染，useEffect 看到的都是那一次渲染时的快照。**

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      // 这里的 count 永远指向 Effect 被创建时的值
      // 即使 3 秒后 count 变成 5，这里打印的仍是 0
      console.log(count)
    }, 3000)
  }, []) // 仅挂载执行
}
```

**底层逻辑**：当组件渲染时，React 创建新的闭包函数传给 `useEffect`，该函数捕获了当时的变量值。

---

## 4. 依赖项对比与清理机制

### 4.1 依赖项对比（Object.is）

React 决定是否重新执行 Effect 的流程：

1. 内部维护 **Effect 链表**，存储上一次的依赖项数组
2. 下次渲染时，用 `Object.is` 对新旧依赖项逐个**浅比较**
3. 任一元素变化 → 先执行上次的 **Cleanup**，再执行本次的新 Effect

### 4.2 清理机制（Cleanup）

`useEffect` 返回的清理函数**不是**仅在卸载时执行，而是在**下一次 Effect 执行前**执行：

```
渲染界面 → 清理上一次 Effect → 执行当前 Effect
```

这保证副作用始终与当前状态匹配，避免"旧订阅没取消就开新订阅"的内存泄漏。

---

## 5. Fiber 架构：副作用的存储与调度

### 5.1 存储结构：副作用链表

Fiber 节点的 `memoizedState` 是一个**单向链表**，按 Hook 声明顺序存储。每个 Effect 节点的数据结构：

```typescript
const effect = {
  tag, // 标识 useEffect / useLayoutEffect
  create, // Effect 函数体
  destroy, // Cleanup 清理函数
  deps, // 依赖项数组
  next, // 指向下一个 Effect（循环链表）
}
```

这些 Effect 对象挂载在 Fiber 节点的 `updateQueue` 中。

### 5.2 两阶段路径：Mount 与 Update

**Mount（首次渲染）**：

1. 创建 Effect 对象，将函数体和依赖项打包
2. 构建循环链表，放入 `updateQueue`
3. 给 Fiber 打上 `Passive | HasEffect` 二进制标记

**Update（后续渲染）**：

1. 从 Alternate（旧 Fiber）中取出上次的 `deps`
2. 用 `Object.is` 逐个对比新旧依赖
3. 依赖**相同** → 创建新 Effect 对象，但**不打执行标记**，跳过
4. 依赖**不同** → 创建新 Effect 对象，**打上 `HasEffect` 标记**，准备执行

### 5.3 调度执行：异步宏任务

1. Commit 阶段结束，React 不立即运行 Effect
2. 利用 `MessageChannel` 注册异步回调
3. 浏览器完成渲染，用户看到新界面
4. 执行副作用：**先销毁**所有标记节点的 `destroy`，**再创建**所有标记节点的 `create`

### 5.4 为什么 Hooks 不能写在 if 里？

React 通过**执行顺序**找回旧状态。`updateEffect` 时只是移动链表指针：`nextHook = currentHook.next`。如果 Hooks 顺序变了，React 会把 `useState` 的数据当成 `useEffect` 的，导致内存数据完全错乱。

### 5.5 核心源码逻辑

```javascript
function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  const prevEffect = hook.memoizedState

  if (prevEffect !== null) {
    const prevDeps = prevEffect.deps
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      // 依赖没变，只推入链表，不给 Fiber 打执行 Tag
      pushEffect(Passive, create, prevEffect.destroy, nextDeps)
      return
    }
  }

  // 依赖变了，打上 HasEffect 标记
  sideEffectTag |= HasEffect
  hook.memoizedState = pushEffect(Passive | HasEffect, create, undefined, nextDeps)
}
```

---

## 6. useEffect vs useLayoutEffect

一句话总结：**`useLayoutEffect` 是"看之前"同步执行，`useEffect` 是"看以后"异步执行。**

### 6.1 执行时机对比

在 Commit 阶段（处理 DOM 的阶段）：

1. **Mutation**：React 将 Virtual DOM 变更写入原生 DOM（浏览器还未重绘）
2. **执行 `useLayoutEffect` 的销毁 + 回调**（同步执行，阻塞浏览器 Paint）
3. **浏览器 Paint**：屏幕刷新，用户看到画面
4. **执行 `useEffect`**：异步宏任务触发，用户已看到第一版画面

### 6.2 差异对照

| 特性             | `useEffect`                        | `useLayoutEffect`           |
| ---------------- | ---------------------------------- | --------------------------- |
| **执行时机**     | 浏览器渲染**后**（异步）           | 浏览器渲染**前**（同步）    |
| **对渲染的影响** | **不阻塞**渲染，性能友好           | **阻塞**渲染，可能掉帧      |
| **适用场景**     | API 请求、订阅、日志等绝大多数场景 | 需要**操作 DOM 且防止闪烁** |
| **SSR**          | 正常工作                           | 有警告（服务器无 DOM 布局） |

### 6.3 何时必须用 useLayoutEffect？

需要**测量 DOM 尺寸/位置并立即修改 UI** 时。

**案例：自动定位的 Tooltip**

- 用 `useEffect`：气泡先出现在默认位置，下一帧才位移到按钮旁 → 用户看到"跳动"
- 用 `useLayoutEffect`：浏览器还没画出来就算好位置改好 DOM → 第一眼就在正确位置

### 6.4 SSR 兼容写法

```javascript
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
```

---

## 7. 实践要点

- **不要在依赖项里撒谎**：Effect 用到的变量必须写进 `[]`，否则产生闭包旧值 Bug
- **避免 Effect 链式调用**：A Effect 改 B 状态 → B Effect 改 C 状态，说明数据流设计有问题，建议合并状态或用 `useMemo`
- **默认用 `useEffect`**：不要阻塞渲染，除非确实需要防止闪烁
- **`useLayoutEffect` 性能陷阱**：耗时计算会让整个页面卡死
- **函数组件的本能**：组件体每次渲染从头到尾执行一遍，所有 Hooks 通过 Fiber 上的 **MemoizedState 链表**按顺序找回状态
