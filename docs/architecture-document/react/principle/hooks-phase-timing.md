---
title: Hooks 执行阶段：Render vs Commit
order: 15
tags: ['React']

---

# Hooks 执行阶段：Render vs Commit

> React 的每一次渲染都分为两个阶段：**Render（计算）** 和 **Commit（提交）**。
> 不同 Hooks 在不同阶段执行，理解这一点是排查"为什么 effect 没触发""为什么 state 更新后 DOM 还没变"等问题的关键。

---

## 一、渲染全链路总览

```
用户操作 / setState / 父组件更新
        │
        ▼
┌───────────────────────────────────────────────────────┐
│  Render 阶段（可中断，纯计算，不操作 DOM）             │
│                                                       │
│  ① 调用组件函数                                        │
│  ② 执行 useState / useReducer / useMemo / useCallback │
│  ③ 生成新的虚拟 DOM（Fiber 树）                        │
│  ④ Diff 对比，标记变更                                 │
│                                                       │
│  ⚠️ 可能被高优先级任务中断，也可能被调用多次            │
└───────────────────────────┬───────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────┐
│  Commit 阶段（不可中断，操作 DOM）                     │
│                                                       │
│  ① Mutation：将变更应用到真实 DOM                      │
│  ② useInsertionEffect 的 cleanup + setup              │
│  ③ useLayoutEffect 的 cleanup + setup                 │
│  ④ 浏览器 Paint（绘制到屏幕）                          │
│  ⑤ useEffect 的 cleanup + setup（异步，不阻塞绘制）    │
│                                                       │
│  ✅ 保证同步执行，不会被中断                            │
└───────────────────────────────────────────────────────┘
```

**核心原则**：Render 阶段是"算"，Commit 阶段是"做"。

---

## 二、各 Hook 执行阶段速查表

| Hook                  | 执行阶段   | 执行时机                              | 能否操作 DOM | 可被中断    |
| --------------------- | ---------- | ------------------------------------- | ------------ | ----------- |
| `useState`            | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useReducer`          | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useContext`          | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useMemo`             | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useCallback`         | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useRef`              | **Render** | 组件函数执行时（读写 `.current`）     | ⚠️ 条件性    | ✅ 可中断   |
| `useId`               | **Render** | 组件函数执行时                        | ❌           | ✅ 可中断   |
| `useInsertionEffect`  | **Commit** | DOM 变更后、布局计算前                | ✅           | ❌ 不可中断 |
| `useLayoutEffect`     | **Commit** | DOM 变更后、浏览器绘制前              | ✅           | ❌ 不可中断 |
| `useEffect`           | **Commit** | 浏览器绘制后（异步）                  | ✅           | ❌ 不可中断 |
| `useImperativeHandle` | **Commit** | DOM 变更后（同 useLayoutEffect 时机） | ✅           | ❌ 不可中断 |

---

## 三、Render 阶段详解

### 3.1 特征

- **纯计算**：相同输入必须产出相同输出，不能有副作用
- **可中断**：React 可能在 Render 过程中暂停，去处理更高优先级的更新
- **可能多次调用**：在 Strict Mode 下，React 会故意调用组件函数两次来帮助发现副作用泄漏
- **不操作 DOM**：此时虚拟 DOM 还在计算中，真实 DOM 尚未更新

### 3.2 Render 阶段执行的 Hooks

```tsx
function Counter({ step }: { step: number }) {
  // ── 以下全部在 Render 阶段执行 ──

  // 1. useState：读取/初始化状态
  const [count, setCount] = useState(0)

  // 2. useReducer：读取/初始化 reducer 状态
  const [state, dispatch] = useReducer(reducer, initialState)

  // 3. useContext：读取上下文值
  const theme = useContext(ThemeContext)

  // 4. useMemo：缓存计算结果
  const expensive = useMemo(() => computeExpensive(count), [count])

  // 5. useCallback：缓存回调函数
  const handleClick = useCallback(() => setCount((c) => c + step), [step])

  // 6. useRef：获取/创建 ref 对象（注意：修改 .current 是副作用）
  const inputRef = useRef<HTMLInputElement>(null)

  // 7. useId：生成唯一 ID
  const id = useId()

  // ── 返回 JSX（也是 Render 阶段的一部分）──
  return <input ref={inputRef} id={id} value={count} onChange={handleClick} />
}
```

### 3.3 Render 阶段的禁忌

```tsx
// ❌ 在 Render 阶段操作 DOM
function Bad() {
  const ref = useRef<HTMLDivElement>(null)
  const [count] = useState(0)

  // 此时 DOM 还没更新！ref.current 可能指向旧节点
  ref.current!.textContent = String(count) // 💥 不可靠

  return <div ref={ref} />
}

// ❌ 在 Render 阶段发起副作用
function AlsoBad() {
  const [data, setData] = useState(null)

  // Render 阶段不应发请求，应放在 useEffect 中
  fetch('/api/data')
    .then((r) => r.json())
    .then(setData) // 💥

  return <div>{data}</div>
}

// ✅ 正确做法：副作用放在 useEffect
function Good() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then(setData)
  }, [])

  return <div>{data}</div>
}
```

---

## 四、Commit 阶段详解

Commit 阶段分为三个子步骤，按严格顺序执行：

```
Commit 开始
    │
    ├── ① Mutation 子阶段
    │   └── 将 Fiber 树的变更应用到真实 DOM
    │
    ├── ② useInsertionEffect（cleanup → setup）
    │   └── 最早执行的 Effect，用于 CSS-in-JS 库注入样式
    │
    ├── ③ useLayoutEffect（cleanup → setup）
    │   └── DOM 已更新、浏览器尚未绘制 → 可以读取布局并同步修改
    │
    ├── ④ 浏览器 Paint
    │   └── 用户看到画面
    │
    └── ⑤ useEffect（cleanup → setup）
        └── 最晚执行，异步，不阻塞绘制
```

### 4.1 useInsertionEffect — 最早（DOM 变更后、布局前）

```tsx
// 典型场景：CSS-in-JS 库（styled-components、Emotion）内部使用
useInsertionEffect(() => {
  // 在 DOM 节点插入后、浏览器计算布局前注入 <style> 标签
  injectStylesIntoDocument()
}, [dynamicStyles])
```

**极少直接使用**，99% 的场景应该用 `useEffect` 或 `useLayoutEffect`。

### 4.2 useLayoutEffect — 同步阻塞绘制

```tsx
// 典型场景：需要在浏览器绘制前读取/修改 DOM 布局
function Tooltip({ targetRect }) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    // 此时 DOM 已更新但浏览器还没绘制
    // 可以安全读取布局信息
    const tooltipRect = tooltipRef.current!.getBoundingClientRect()

    // 同步调整位置，用户看不到闪烁
    tooltipRef.current!.style.top = `${targetRect.top - tooltipRect.height}px`
  }, [targetRect])

  return (
    <div ref={tooltipRef} className="tooltip">
      ...
    </div>
  )
}
```

**关键特性**：会阻塞浏览器绘制。如果内部有耗时操作，用户会看到界面卡顿。

### 4.3 useEffect — 最晚（绘制后异步执行）

```tsx
// 典型场景：数据请求、事件订阅、日志上报
useEffect(() => {
  // 浏览器已经绘制完成，用户看到了界面
  // 此时发起请求不会影响首屏渲染
  const controller = new AbortController()
  fetch('/api/data', { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)

  return () => controller.abort()
}, [])
```

**关键特性**：不阻塞绘制，适合大部分副作用场景。

---

## 五、三种 Effect 的时序对比

```
时间线 ─────────────────────────────────────────────────────→

  Render        Commit                    浏览器
  (纯计算)      (操作 DOM)                (绘制)
  ┌──────┐  ┌──────────────────────┐  ┌────────┐
  │ 组件  │  │  DOM                 │  │        │
  │ 函数  │→ │  Mutation            │→ │ Paint  │
  │ 执行  │  │  ↓                   │  │        │
  │       │  │  useInsertionEffect  │  │        │
  │       │  │  ↓                   │  │        │
  │       │  │  useLayoutEffect     │  │        │
  └──────┘  │                      │  └────┬───┘
            └──────────────────────┘       │
                                           │ 异步
                                           ↓
                                     ┌────────────┐
                                     │ useEffect  │
                                     │ (不阻塞)    │
                                     └────────────┘
```

| 维度              | useInsertionEffect     | useLayoutEffect        | useEffect              |
| ----------------- | ---------------------- | ---------------------- | ---------------------- |
| 执行时机          | DOM 变更后、布局计算前 | DOM 变更后、绘制前     | 绘制后                 |
| 是否阻塞绘制      | ✅ 是                  | ✅ 是                  | ❌ 否                  |
| 能否读取 DOM 布局 | ✅                     | ✅                     | ✅（但可能已过时）     |
| 能否同步修改 DOM  | ✅（用户看不到）       | ✅（用户看不到）       | ⚠️（用户可能看到闪烁） |
| 典型用途          | CSS-in-JS 注入样式     | 测量布局、同步修正位置 | 数据请求、订阅、日志   |
| 使用频率          | 极低（库作者用）       | 低（特殊场景）         | 高（日常首选）         |

---

## 六、useRef 的双重身份

`useRef` 比较特殊，它在两个阶段都有行为：

```tsx
function Input() {
  const ref = useRef<HTMLInputElement>(null)

  // Render 阶段：ref 对象已创建/获取，.current 可能是旧值
  console.log(ref.current) // 可能是 null 或上一次渲染后的值

  // Commit 阶段：React 将真实 DOM 赋值给 ref.current
  // 此时 ref.current 才是最新的 DOM 节点

  useLayoutEffect(() => {
    console.log(ref.current) // ✅ 此时一定是最新的 DOM 节点
    ref.current.focus()
  }, [])

  return <input ref={ref} />
}
```

| 行为                  | 阶段              | 说明                                              |
| --------------------- | ----------------- | ------------------------------------------------- |
| 获取 ref 对象本身     | Render            | `useRef()` 调用时返回同一个对象                   |
| React 赋值 `.current` | Commit (Mutation) | DOM 节点创建后赋值                                |
| 读取 `.current`       | 任意              | 但 Render 阶段读到的可能是旧值                    |
| 修改 `.current`       | ⚠️ 建议 Commit    | Render 阶段修改属于副作用，Strict Mode 下会被检测 |

---

## 七、实战排查指南

### 问题 1："为什么 ref.current 是 null？"

```
原因：在 Render 阶段读取了 ref.current，此时 DOM 还没挂载。
解决：在 useEffect / useLayoutEffect 中读取。
```

### 问题 2："为什么 useLayoutEffect 里能拿到最新 DOM，useEffect 里有时拿不到？"

```
原因：useLayoutEffect 在 DOM 变更后、绘制前同步执行；
      useEffect 在绘制后异步执行，此时可能已有其他更新覆盖了 DOM。
解决：需要读取精确布局时用 useLayoutEffect，其他情况用 useEffect。
```

### 问题 3："为什么 setState 后立即读取 DOM 还是旧值？"

```
原因：setState 触发的是下一次 Render，当前函数体内的 DOM 还是旧的。
解决：在 useLayoutEffect 中读取（同步，DOM 已更新）。
```

### 问题 4："Strict Mode 下 effect 执行了两次？"

```
原因：React 在开发模式下故意调用组件函数两次 + cleanup/setup 两次，
      目的是检测 Render 阶段的副作用泄漏。
解决：确保 Render 阶段是纯计算，副作用全部放在 useEffect 中。
```

---

## 八、深度思考

1. **为什么 Render 阶段要设计为可中断？** — 为了 Concurrent Mode。高优先级更新（如用户输入）可以打断低优先级渲染（如列表渲染），保证界面流畅。
2. **为什么 useEffect 不在 Render 阶段执行？** — Render 可能被中断或丢弃，如果在 Render 阶段执行副作用，中断后就会产生"幽灵 effect"。
3. **useLayoutEffect 和 useInsertionEffect 的边界在哪？** — useInsertionEffect 更早，专为 CSS-in-JS 设计；useLayoutEffect 在样式计算后、绘制前执行，适合布局测量。
4. **React Compiler（React 19+）会改变这些规则吗？** — React Compiler 自动优化记忆化，但不会改变 Hooks 的执行阶段——Render 纯计算、Commit 执行副作用的原则不变。

---

## 参考

- [React 官方文档 — Render and Commit](https://react.dev/learn/render-and-commit)
- [React 官方文档 — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React 源码 — commitRoot](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js)
