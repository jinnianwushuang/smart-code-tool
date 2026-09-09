---
title: react 基础代码
order: 104
---

# react 基础代码

对于资深开发者，React 的“常用代码”不再是基础的 `HelloWorld`，而是那些能解决**性能、逻辑抽象和复杂组件通信**的工程化片段。

以下是 React 开发中最核心的 5 类参考代码：

## 1. 状态与逻辑：自定义 Hook (取代 Vue 的 Composition API)

这是 React 逻辑复用的核心。将分散的逻辑封装成可复用的函数。

```tsx
// useFetch.ts - 数据请求 Hook
import { useState, useEffect } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true // 防止内存泄漏
    setLoading(true)
    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        if (isMounted) setData(result)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    } // 清除副作用
  }, [url])

  return { data, loading }
}
```

## 2. 性能优化：`useMemo` 与 `useCallback`

React 每次更新都会重新执行函数体，资深开发者必须手动管理“引用稳定性”。

```tsx
const MemoizedComponent = ({ list, onItemClick }) => {
  // 1. 缓存计算结果（对应 Vue 的 computed）
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => a.value - b.value)
  }, [list])

  // 2. 缓存函数引用（防止子组件因函数重新创建而误触发重新渲染）
  const handleClick = useCallback(
    (id: string) => {
      onItemClick(id)
    },
    [onItemClick],
  )

  return (
    <ul>
      {sortedList.map((item) => (
        <ListItem key={item.id} item={item} onClick={handleClick} />
      ))}
    </ul>
  )
}
```

## 3. 跨组件通信：Context API (对应 Vue 的 Provide/Inject)

当 Props 下钻超过 3 层时使用。

```tsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const toggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

// 消费端使用
const ThemeButton = () => {
  const ctx = useContext(ThemeContext)
  return <button onClick={ctx?.toggle}>{ctx?.theme}</button>
}
```

## 4. DOM 操作与持久化：`useRef`

用于直接操作 DOM 或保存不需要触发渲染的变量（如定时器、上一次的状态）。

```tsx
const InputFocus = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number>() // 保存定时器 ID

  const startFocus = () => {
    inputRef.current?.focus() // 操作原生 DOM
    timerRef.current = window.setInterval(() => {
      console.log('Keep alive...')
    }, 1000)
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current) // 卸载时清理
  }, [])

  return <input ref={inputRef} />
}
```

## 5. 动态列表渲染与条件渲染

React 没有任何指令，全部是 JS 原生语法。

```tsx
const ListRenderer = ({ items, isLoading, error }) => {
  // 1. 条件渲染（对应 v-if / v-else）
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {/* 2. 空列表处理 */}
      {items.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <ul>
          {/* 3. 列表渲染（对应 v-for） */}
          {items.map((item) => (
            <li key={item.id}>
              {item.name}
              {item.isNew && <span>(New!)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## 进阶建议：

- **不要滥用 `useEffect`**：如果你可以根据 `props` 或 `state` 计算出某个值，请使用 `useMemo` 而不是 `useEffect` 来同步状态。
- **状态提升**：如果两个组件需要共享状态，Vue 习惯放在全局 Store，而 React 习惯先尝试“状态提升”到最近的共同父组件。

**需要我为你提供一份 Zustand (最流行的 React 状态管理) 的配置参考代码吗？**
