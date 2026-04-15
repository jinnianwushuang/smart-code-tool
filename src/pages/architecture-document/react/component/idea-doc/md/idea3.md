---
title: 路线图
order: 34
---

这份路径图专为**资深开发者**设计，跳过基础语法，直接从“底层逻辑映射”和“工程实践差异”入手，帮助你快速完成脑回路的切换。

---

## 资深开发者：Vue to React 快速映射路径图

## 第一阶段：思维解构与重组（Day 1-2）

**核心目标：** 忘掉“自动响应式”，拥抱“单向数据流”和“不可变数据”。

- **从响应式到快照（Snapshot）：**
  - **Vue：** 数据是响应式的（Proxy），修改 `data.a = 1` 视图自动变。
  - **React：** UI 是状态的**快照**。必须通过 `setCount(newCount)` 触发重新渲染。**切记：** 不要直接修改 State，永远返回新对象。
- **指令 vs 逻辑：**
  - `v-if` / `v-for` $\rightarrow$ 全部回归到 JS 的 `logical &&` 和 `map()`。
  - `v-model` $\rightarrow$ 拆解为 `value` 属性 + `onChange` 回调。

## 第二阶段：核心 API 深度对标（Day 3-5）

**核心目标：** 建立 API 之间的直觉联系，理解 Hooks 的本质。

- **逻辑复用对标：**
  - **Vue 3 Composition API：** `setup` 只执行一次，通过闭包维护响应式。
  - **React Hooks：** 组件每次渲染都会**从上到下完整执行一遍**。必须严格遵守 Hooks 规则（不能在循环/判断中使用）。
- **核心 Hook 映射：**
  - `ref` / `reactive` $\rightarrow$ `useState` (基本值/对象)
  - `computed` $\rightarrow$ `useMemo` (缓存计算结果)
  - `watch` / 生命周期 $\rightarrow$ `useEffect` (副作用处理)
  - `template ref` $\rightarrow$ `useRef` (操作 DOM)

## 第三阶段：组件模式与通信（Day 6-8）

**核心目标：** 掌握 React 风格的高阶用法。

- **Slot 的替代方案：**
  - Vue 的插槽在 React 中就是 **`children` 属性** 或 **Render Props**（传入一个返回 JSX 的函数）。
- **状态管理：**
  - Vuex / Pinia $\rightarrow$ 简单的跨层级传参用 `useContext`，复杂逻辑推荐 `Zustand` 或 `Redux Toolkit`。
- **CSS 处理：**
  - 由于没有 `scoped` 概念，资深开发者应快速上手 **Tailwind CSS** 或 **CSS Modules**，这是 React 生态的主流。

## 第四阶段：性能优化与工程实践（Day 9-14）

**核心目标：** 掌握“手动档”优化的技巧。

- **避免不必要的渲染：**
  - Vue 自动追踪依赖，性能优化是自动的；React 需要手动干预。
  - 学习 `React.memo` (类似 Vue 的缓存) 和如何正确使用 `useCallback` 来防止子组件意外刷新。
- **TypeScript 集成：**
  - 学习如何定义 `React.FC<Props>` 和处理事件类型（如 `React.ChangeEvent<HTMLInputElement>`）。

---

## 避坑指南（资深开发者最易犯的错）

1. **闭包陷阱（Stale Closures）：** 在 `useEffect` 或异步回调中拿到了旧的 State。
2. **把 `useEffect` 当成生命周期勾子用：** 不要满屏都是 `useEffect`，优先考虑在事件回调中处理逻辑，而不是监听数据变化。
3. **试图在 React 里实现双向绑定：** 别再折腾怎么让子组件直接改父组件的变量了。

---

## 推荐的“最小闭环”技术栈

为了让你快速达到“资深”级别的生产力，建议直接上手这套组合：

- **框架：** Next.js (目前 React 开发的事实标准)
- **状态：** Zustand (轻量、逻辑清晰)
- **获取数据：** TanStack Query (原 React Query，极其强大)
- **UI：** Shadcn UI + Tailwind CSS
