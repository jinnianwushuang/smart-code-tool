# 状态管理参照

## 状态分类

| 类别       | 方案                           | 作用域   | 说明                   |
| ---------- | ------------------------------ | -------- | ---------------------- |
| 组件状态   | `useState`                     | 单组件   | 组件内部的局部状态     |
| 跨组件状态 | `useReducer` + Context         | 组件树   | 中等复杂度的共享状态   |
| 全局状态   | Zustand / Jotai                | 应用级   | 跨页面的全局状态       |
| 服务端状态 | `use()` + Suspense             | 数据缓存 | 服务端数据的获取与缓存 |
| URL 状态   | React Router `useSearchParams` | URL      | 反映在 URL 中的状态    |

## 组件状态标准写法

```jsx
// 简单状态
const [count, setCount] = useState(0)
const [name, setName] = useState('')

// 对象状态（使用函数式更新避免闭包陷阱）
const [form, setForm] = useState({ keyword: '', status: '' })
setForm((prev) => ({ ...prev, keyword: 'new value' }))

// 数组状态
const [items, setItems] = useState([])
setItems((prev) => [...prev, newItem])
setItems((prev) => prev.filter((item) => item.id !== targetId))
```

## useReducer 标准写法

```jsx
// state/todo-reducer.js
const todoInitialState = {
  items: [],
  loading: false,
  error: null,
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) }
    case 'RESET':
      return todoInitialState
    default:
      return state
  }
}

// 在 Hook 中使用
function useTodoList() {
  const [state, dispatch] = useReducer(todoReducer, todoInitialState)

  const fetchTodos = async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const data = await api.getTodos()
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message })
    }
  }

  return { ...state, fetchTodos, dispatch }
}
```

## Zustand 全局状态标准写法

```jsx
// store/use-auth-store.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      token: null,
      isAuthenticated: false,

      // 操作
      login: async (credentials) => {
        const response = await api.login(credentials)
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      // 计算属性（通过 getter 实现）
      get isAdmin() {
        return get().user?.role === 'admin'
      },
    }),
    {
      name: 'auth-storage', // localStorage 键名
      partialize: (state) => ({ token: state.token }), // 只持久化 token
    },
  ),
)
```

## Context 跨组件状态标准写法

```jsx
// context/theme-context.js
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(defaultTheme)
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

// 自定义 Hook 封装消费
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## 状态选型决策树

```
状态是否只在一个组件内使用？
  ├── 是 → useState
  └── 否 → 状态是否有复杂的状态转换逻辑？
        ├── 是 → useReducer
        └── 否 → 状态是否需要跨页面共享？
              ├── 是 → Zustand（全局）
              └── 否 → Context + useReducer（组件树内）

数据是否来自服务端？
  ├── 是 → use() + Suspense（React 19）
  └── 否 → 上述客户端状态方案
```

## 关键约束

- 禁止将服务端数据存入全局状态（使用 `use()` + Suspense）
- Zustand store 禁止在组件外调用 `setState`
- Context 禁止传递频繁变化的值（会导致整棵子树重渲染）
- `useReducer` 的 action type 必须用字符串常量，禁止用数字
- 状态更新使用函数式更新避免闭包陷阱：`setCount((prev) => prev + 1)`
