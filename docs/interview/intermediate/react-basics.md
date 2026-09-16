---
title: 'React 入门：JSX、Hooks、组件模式 [P5-P6]'
level: 'intermediate'
tags: ['React', 'JSX', 'Hooks', '组件', 'useState', 'useEffect']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# React 入门：JSX、Hooks、组件模式 [P5-P6]

> React 是构建用户界面的 JavaScript 库。掌握 JSX、Hooks 和组件模式，是学习 React 的基础。

## 核心概念（What）

### React 基础

```
React 核心概念：
├── JSX → JavaScript XML（声明式语法）
├── 组件 → 可复用的 UI 单元
├── Props → 组件参数（只读）
├── State → 组件状态（可变）
├── Hooks → 函数组件的能力
└── 虚拟 DOM → 高效更新

React 特点：
├── 声明式 → 描述 UI 应该是什么样子
├── 组件化 → 拆分独立组件
├── 单向数据流 → Props 向下传递
└── 高效更新 → Diff 算法
```

## 底层原理（Why）

### JSX

```jsx
// JSX = JavaScript + XML 语法

// JSX 语法
function App() {
  const name = 'Alice'
  return <h1>Hello, {name}</h1>
}

// 编译后
function App() {
  const name = 'Alice'
  return React.createElement('h1', null, 'Hello, ', name)
}

// JSX 规则
// 1. 必须有一个根元素
function App() {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}

// 或使用 Fragment
function App() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}

// 2. 属性使用 camelCase
function App() {
  return (
    <div className="container" onClick={handleClick}>
      <img src={imageUrl} alt="photo" />
    </div>
  )
}

// 3. 条件渲染
function App() {
  const isLoggedIn = true

  return (
    <div>
      {isLoggedIn ? <Dashboard /> : <Login />}
      {isLoggedIn && <Welcome />}
    </div>
  )
}

// 4. 列表渲染
function App() {
  const items = ['Apple', 'Banana', 'Cherry']

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

// 5. 样式
function App() {
  const style = { color: 'red', fontSize: '16px' }

  return (
    <div>
      <p style={style}>内联样式</p>
      <p className="text-red">CSS 类</p>
    </div>
  )
}
```

**为什么 JSX 必须有一个根元素？**

| 原因              | 说明                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **编译限制**      | JSX 会被编译为 `React.createElement()`，该函数只能返回**单个对象**；多个并列元素无法用一个返回值表达   |
| **虚拟 DOM 结构** | React 用树形结构做 Diff，每个组件对应树中**一个节点**；多根元素会破坏树的完整性，Diff 算法无法正确工作 |
| **Fiber 一致性**  | React 18 的 Fiber 架构要求每个组件返回一棵**完整的 Fiber 子树**，多根节点会导致 Fiber 链表断裂         |

> **解决方案**：用 `<Fragment>`（`<>`）包裹，编译后**不会**产生真实 DOM 节点，既满足单根要求，又不增加额外标签。

### 函数组件

```jsx
// 函数组件 = 返回 JSX 的函数

// 基础组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 使用
<Welcome name="Alice" />

// 解构 Props
function Welcome({ name, age }) {
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// 默认 Props
function Button({ text = 'Click me', onClick }) {
  return <button onClick={onClick}>{text}</button>;
}

// Props 类型（TypeScript）
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ text, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

// children
function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h1>Title</h1>
  <p>Content</p>
</Card>
```

### useState

```jsx
// useState = 状态管理

import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  )
}

// 对象状态
function Form() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return <input value={form.username} onChange={(e) => handleChange('username', e.target.value)} />
}

// 数组状态
function TodoList() {
  const [todos, setTodos] = useState([])

  const addTodo = (text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text }])
  }

  const removeTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          {todo.text}
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </div>
      ))}
    </div>
  )
}

// 函数式更新
function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount((prev) => prev + 1) // 推荐
    // setCount(count + 1); // 不推荐（可能有问题）
  }

  return <button onClick={increment}>Count: {count}</button>
}
```

### useEffect

```jsx
// useEffect = 副作用处理

import { useState, useEffect } from 'react'

function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // 副作用代码
    const timer = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    // 清理函数
    return () => {
      clearInterval(timer)
    }
  }, []) // 空数组 → 只在挂载时执行

  return <p>Seconds: {seconds}</p>
}

// 依赖数组
useEffect(() => {
  console.log('组件挂载或更新')
}, [dependency1, dependency2]) // 依赖变化时执行

// 常见用法

// 1. API 请求
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('请求失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// 2. 事件监听
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <p>
      Size: {size.width} x {size.height}
    </p>
  )
}

// 3. 订阅
function Chat() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const subscription = chatService.subscribe((message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <div>{/* 渲染消息 */}</div>
}
```

### 自定义 Hook

```jsx
// 自定义 Hook = 复用逻辑

// 1. useLocalStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

// 使用
const [name, setName] = useLocalStorage('name', 'Alice')

// 2. useFetch
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(url)
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// 使用
const { data, loading, error } = useFetch('/api/users')

// 3. useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// 使用
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch)
  }
}, [debouncedSearch])
```

## 实战应用（How）

### 组件模式

```jsx
// 1. 容器/展示组件分离
// UserContainer.jsx（容器）
function UserContainer() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser().then(setUser)
  }, [])

  return <UserDisplay user={user} />
}

// UserDisplay.jsx（展示）
function UserDisplay({ user }) {
  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// 2. 高阶组件（HOC）
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>
    }
    return <Component {...props} />
  }
}

const UserListWithLoading = withLoading(UserList)

// 3. Render Props
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY })
  }

  return <div onMouseMove={handleMouseMove}>{render(position)}</div>
}

;<MouseTracker
  render={({ x, y }) => (
    <p>
      Mouse position: {x}, {y}
    </p>
  )}
/>
```

## 高频面试题

### Q1: React 的生命周期？

```
类组件：
├── 挂载：constructor → render → componentDidMount
├── 更新：render → componentDidUpdate
└── 卸载：componentWillUnmount

函数组件（Hooks）：
├── 挂载：useEffect(() => {}, [])
├── 更新：useEffect(() => {}, [deps])
└── 卸载：useEffect(() => { return cleanup }, [])
```

### Q2: useState 和 useReducer 的区别？

```
useState：
├── 简单状态
├── 直接更新
└── 适合独立状态

useReducer：
├── 复杂状态逻辑
├── 通过 action 更新
├── 适合相关状态
└── 类似 Redux

选择：
├── 简单 → useState
├── 复杂 → useReducer
└── 多个相关状态 → useReducer
```

### Q3: useEffect 的依赖数组？

```
依赖数组决定何时执行：

[] → 只在挂载时执行
[dep] → dep 变化时执行
[dep1, dep2] → 任一变化时执行
不传 → 每次渲染都执行

清理函数：
useEffect(() => {
  // 副作用
  return () => {
    // 清理（组件卸载或下次副作用前执行）
  };
}, [deps]);
```

## 延伸思考

1. 如何优化 React 性能？
2. React 的 Diff 算法原理？
3. 如何设计可复用的组件？

## 参考资料

- [React 官方文档](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)
