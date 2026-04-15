---
title: VUE转REACT代码
order: 44
---

将 Vue 3 代码转换为最新的 React 代码（React 18/19），核心是将 Vue 的**响应式系统**和**模板语法**映射到 React 的 **Hooks** 和 **JSX** 上。

如果你不想手动重写，可以使用 [VuReact](https://juejin.cn/post/7628206582480371721) 这种自动编译器，它能将 Vue 3 代码编译为标准 React 代码，并自动处理 `watchEffect` 和依赖数组。 [1, 2]

以下是核心语法的**手动转换对照表**：

## 1. 响应式状态

Vue 使用 `ref` 或 `reactive`，React 使用 `useState`。

- **Vue 3**: `const count = ref(0)`
- **React**: `const [count, setCount] = useState(0)`
  - _注意：React 状态是只读的，必须通过 `setCount(count + 1)` 更新，不能直接 `count.value++`。_

## 2. 生命周期与副作用

Vue 的生命周期钩子在 React 中统一由 `useEffect` 处理。

| Vue 3 钩子              | React 等价实现 (useEffect)                                     |
| :---------------------- | :------------------------------------------------------------- |
| `onMounted`             | `useEffect(() => { ... }, [])` (空依赖数组)                    |
| `onUpdated`             | `useEffect(() => { ... })` (无依赖数组)                        |
| `onUnmounted`           | `useEffect(() => { return () => { ... } }, [])` (返回清理函数) |
| `watch` / `watchEffect` | `useEffect(() => { ... }, [dep])` (在依赖项变化时触发)         |

## 3. 计算属性 (Computed)

- **Vue 3**: `const double = computed(() => count.value * 2)`
- **React**: `const double = useMemo(() => count * 2, [count])`

## 4. 组件通信 (Props)

Vue 通过 `defineProps` 接收参数，React 直接通过函数参数接收。

- **Vue 3**: `const props = defineProps(['msg'])`
- **React**: `function MyComponent({ msg }) { ... }`

---

## 转换示例

**Vue 3 源代码：**

```javascript

import { ref, onMounted } from 'vue'
const count = ref(0)
const increment = () => count.value++
onMounted(() => console.log('Mounted!'))



  <button @click="increment">{{ count }}</button>

```

**转换后的 React 代码：**

```javascript
import React, { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount((prev) => prev + 1)

  useEffect(() => {
    console.log('Mounted!')
  }, [])

  return <button onClick={increment}>{count}</button>
}
```

## 推荐工具与进阶

1. **自动转换工具**：[VuReact](https://juejin.cn/post/7627751127488987151) 支持全自动 `defineProps` 转换、TS 类型交叉支持及 `useAttrs` 兼容。
2. **状态管理**：如果你在 Vue 中使用 Pinia，迁移到 React 时推荐使用 [Zustand](https://zhuanlan.zhihu.com/p/2021611801972842620)，它的 API 风格与 Vue 开发者习惯更接近，避免了 Redux 的复杂样板代码。 [2, 3, 4]

为了最直观地展示转型差异，我挑选了一个包含 **响应式状态、计算属性、侦听器、生命周期、以及父子通信（插槽）** 的经典 Vue 3 组件，并将其重构为高质量的 React 代码。

## 场景：一个带搜索功能的计数器列表

---

## 1. Vue 3 版本 (Composition API)

```javascript
<template>
  <div class="container">
    <h2>{{ title }}</h2>
    <input v-model="searchQuery" placeholder="搜索关键词..." />
    <p>当前计数: {{ count }} (双倍: {{ doubleCount }})</p>
    <button @click="increment">增加</button>

    <!-- 插槽 -->
    <slot name="footer" :count="count"></slot>
  </div>
</template>


import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps(['title']);
const emit = defineEmits(['update']);

const count = ref(0);
const searchQuery = ref('');

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 侦听器
watch(count, (newVal) => {
  emit('update', newVal);
});

// 方法
const increment = () => {
  count.value++;
};

// 生命周期
onMounted(() => {
  console.log('组件已挂载');
});

```

---

## 2. React 18+ 版本 (Functional Component)

```tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react'

// 定义类型 (如果是 TS)
interface Props {
  title: string
  onUpdate?: (val: number) => void
  children?: (data: { count: number }) => React.ReactNode // 对应作用域插槽
}

const CounterComponent: React.FC<Props> = ({ title, onUpdate, children }) => {
  // 1. 状态映射 (ref -> useState)
  const [count, setCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // 2. 计算属性映射 (computed -> useMemo)
  const doubleCount = useMemo(() => count * 2, [count])

  // 3. 侦听器映射 (watch -> useEffect)
  useEffect(() => {
    onUpdate?.(count)
  }, [count, onUpdate])

  // 4. 方法 (建议用 useCallback 包裹以优化性能)
  const increment = useCallback(() => {
    setCount((prev) => prev + 1) // 推荐函数式更新，避免闭包陷阱
  }, [])

  // 5. 生命周期 (onMounted -> useEffect 空依赖数组)
  useEffect(() => {
    console.log('组件已挂载')
  }, [])

  return (
    <div className="container">
      <h2>{title}</h2>
      {/* 双向绑定拆解 */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索关键词..."
      />
      <p>
        当前计数: {count} (双倍: {doubleCount})
      </p>
      <button onClick={increment}>增加</button>

      {/* 作用域插槽映射 (Render Props 模式) */}
      {children?.({ count })}
    </div>
  )
}

export default CounterComponent
```

---

## 3. 核心转换差异对照表

| 维度            | Vue 3                 | React                        | 转换心法                                    |
| :-------------- | :-------------------- | :--------------------------- | :------------------------------------------ |
| **状态声明**    | `ref(0)`              | `useState(0)`                | React 返回一个值和一个设置函数。            |
| **数据修改**    | `count.value++`       | `setCount(c => c + 1)`       | **不可变性**：永远不要直接修改变量。        |
| **计算属性**    | `computed(() => ...)` | `useMemo(() => ..., [deps])` | React 需要手动声明依赖项。                  |
| **副作用/侦听** | `watch(source, cb)`   | `useEffect(cb, [deps])`      | React 的 `useEffect` 涵盖了监听和生命周期。 |
| **双向绑定**    | `v-model="msg"`       | `value={msg}` + `onChange`   | React 提倡受控组件，手动处理输入。          |
| **插槽 (Slot)** | `<slot />`            | `{children}`                 | 插槽在 React 里本质就是组件的 Props。       |
| **模板逻辑**    | `v-if` / `v-for`      | `&&` / `map()`               | 回归纯原生 JavaScript 逻辑。                |

## 资深开发者进阶 Tips：

1. **渲染频率**：Vue 的 `setup` 只运行一次，而 React 函数体**每次更新都会重新运行**。所以耗时计算务必用 `useMemo`，函数传递务必用 `useCallback`。
2. **依赖项数组**：这是 React 最容易出错的地方。请务必开启 ESLint 的 `plugin-react-hooks`，它会强制要求你写全 `useEffect` 的依赖。
3. **Ref 的区别**：Vue 的 `ref` 主要用于响应式；React 的 `useRef` 主要是为了**持久化引用**（存 DOM 或定时器 ID），修改 `useRef.current` 不会触发组件重新渲染。
