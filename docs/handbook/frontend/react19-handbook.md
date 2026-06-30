# React 19 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: React 开发者、前端工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、JSX](#二jsx)
- [三、组件](#三组件)
- [四、Hooks](#四hooks)
- [五、状态管理](#五状态管理)
- [六、事件处理](#六事件处理)
- [七、表单](#七表单)
- [八、Refs](#八refs)
- [九、Context](#九context)
- [十、性能优化](#十性能优化)
- [十一、错误边界](#十一错误边界)
- [十二、Suspense](#十二suspense)
- [十三、React 19 新特性](#十三react-19-新特性)
- [十四、最佳实践](#十四最佳实践)

---

## 一、基础概念

### 1.1 创建应用

```javascript
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

### 1.2 函数组件

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

// 箭头函数
const Welcome = ({ name }) => {
  return <h1>Hello, {name}</h1>
}
```

### 1.3 元素渲染

```javascript
const element = <h1>Hello, world</h1>

ReactDOM.render(element, document.getElementById('root'))
```

---

## 二、JSX

### 2.1 基本语法

```jsx
// JSX 表达式
const name = 'Josh Perez'
const element = <h1>Hello, {name}</h1>

// 属性
const element = <img src={user.avatarUrl} />

// 嵌套
const element = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
)
```

### 2.2 条件渲染

```jsx
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>
  }
  return <h1>Please sign up.</h1>
}

// 三元运算符
{
  isLoggedIn ? <LogoutButton /> : <LoginButton />
}

// 逻辑与
{
  unreadMessages.length > 0 && <h2>You have {unreadMessages.length} unread messages.</h2>
}
```

### 2.3 列表渲染

```jsx
function NumberList({ numbers }) {
  return (
    <ul>
      {numbers.map((number) => (
        <li key={number.toString()}>{number}</li>
      ))}
    </ul>
  )
}
```

---

## 三、组件

### 3.1 Props

```jsx
function Welcome({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Age: {age}</p>
    </div>
  )
}

// 默认值
Welcome.defaultProps = {
  age: 0,
}

// 或使用默认参数
function Welcome({ name, age = 0 }) {
  // ...
}
```

### 3.2 组合组件

```jsx
function SplitPane({ left, right }) {
  return (
    <div className="SplitPane">
      <div className="left">{left}</div>
      <div className="right">{right}</div>
    </div>
  )
}

;<SplitPane left={<Contacts />} right={<Chat />} />
```

### 3.3 Children

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

;<Card title="My Card">
  <p>Content goes here</p>
</Card>
```

---

## 四、Hooks

### 4.1 useState

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}

// 惰性初始化
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props)
  return initialState
})

// 更新基于前一个状态
setCount((prevCount) => prevCount + 1)
```

### 4.2 useEffect

```jsx
import { useState, useEffect } from 'react'

function Example() {
  const [count, setCount] = useState(0)

  // 组件挂载和更新时执行
  useEffect(() => {
    document.title = `You clicked ${count} times`

    // 清理函数
    return () => {
      console.log('Cleanup')
    }
  }, [count]) // 依赖数组

  return <div>{count}</div>
}

// 仅挂载时执行
useEffect(() => {
  // 订阅
  return () => {
    // 取消订阅
  }
}, [])

// 每次渲染都执行
useEffect(() => {
  // 无依赖数组
})
```

### 4.3 useContext

```jsx
import { useContext } from 'react'

const ThemeContext = React.createContext('light')

function ThemedButton() {
  const theme = useContext(ThemeContext)

  return <button className={theme}>Themed Button</button>
}
```

### 4.4 useReducer

```jsx
import { useReducer } from 'react'

const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      throw new Error()
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  )
}
```

### 4.5 useCallback

```jsx
import { useState, useCallback } from 'react'

function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log('Clicked')
  }, []) // 依赖数组

  return <Child onClick={handleClick} />
}
```

### 4.6 useMemo

```jsx
import { useMemo } from 'react'

function ExpensiveComponent({ items }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value)
  }, [items])

  return <div>{sortedItems.map((item) => item.name)}</div>
}
```

### 4.7 useRef

```jsx
import { useRef, useEffect } from 'react'

function TextInput() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return <input ref={inputRef} />
}

// 保存可变值
function Timer() {
  const intervalRef = useRef()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // ...
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])
}
```

### 4.8 useImperativeHandle

```jsx
import { useRef, useImperativeHandle, forwardRef } from 'react'

const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef()

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus()
    },
  }))

  return <input ref={inputRef} />
})

function Form() {
  const inputRef = useRef()

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  )
}
```

### 4.9 useLayoutEffect

```jsx
import { useLayoutEffect, useRef } from 'react'

function LayoutExample() {
  const divRef = useRef()

  useLayoutEffect(() => {
    // 在 DOM 突变后同步执行
    const rect = divRef.current.getBoundingClientRect()
    console.log(rect)
  }, [])

  return <div ref={divRef}>Content</div>
}
```

### 4.10 useDebugValue

```jsx
import { useDebugValue } from 'react'

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null)

  useDebugValue(isOnline ? 'Online' : 'Offline')

  return isOnline
}
```

---

## 五、状态管理

### 5.1 提升状态

```jsx
function Parent() {
  const [sharedState, setSharedState] = useState(initialValue)

  return (
    <>
      <ChildA state={sharedState} setState={setSharedState} />
      <ChildB state={sharedState} />
    </>
  )
}
```

### 5.2 Context API

```jsx
const ThemeContext = React.createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar() {
  return <ThemedButton />
}

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Themed Button</button>
}
```

### 5.3 Redux

```javascript
import { configureStore } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
  },
})

export const { increment, decrement } = counterSlice.actions
export default counterSlice.reducer

// 使用
function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  )
}
```

### 5.4 Zustand

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

function Counter() {
  const { count, inc } = useStore()
  return (
    <div>
      <span>{count}</span>
      <button onClick={inc}>+</button>
    </div>
  )
}
```

---

## 六、事件处理

### 6.1 事件绑定

```jsx
function Button() {
  function handleClick(e) {
    e.preventDefault()
    console.log('Clicked')
  }

  return <button onClick={handleClick}>Click me</button>
}

// 内联函数
;<button onClick={(e) => handleClick(id, e)}>Click</button>
```

### 6.2 事件对象

```jsx
function Form() {
  function handleChange(e) {
    console.log(e.target.value)
    console.log(e.target.name)
  }

  return <input onChange={handleChange} />
}
```

---

## 七、表单

### 7.1 受控组件

```jsx
function Form() {
  const [value, setValue] = useState('')

  function handleChange(e) {
    setValue(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log(value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 7.2 非受控组件

```jsx
function Form() {
  const inputRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()
    console.log(inputRef.current.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="Hello" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## 八、Refs

### 8.1 createRef

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  componentDidMount() {
    this.inputRef.current.focus()
  }

  render() {
    return <input ref={this.inputRef} />
  }
}
```

### 8.2 useRef (函数组件)

```jsx
function MyComponent() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return <input ref={inputRef} />
}
```

---

## 九、Context

### 9.1 创建 Context

```jsx
const ThemeContext = React.createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}
```

### 9.2 消费 Context

```jsx
function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Themed Button</button>
}

// Class 组件
class ThemedButton extends React.Component {
  static contextType = ThemeContext

  render() {
    return <button className={this.context}>Themed Button</button>
  }
}
```

---

## 十、性能优化

### 10.1 React.memo

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>
})

// 自定义比较函数
function areEqual(prevProps, nextProps) {
  return prevProps.value === nextProps.value
}

const MyComponent = React.memo(MyComponent, areEqual)
```

### 10.2 useMemo

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
```

### 10.3 useCallback

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### 10.4 Code Splitting

```jsx
import { lazy, Suspense } from 'react'

const OtherComponent = lazy(() => import('./OtherComponent'))

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  )
}
```

---

## 十一、错误边界

### 11.1 Class 组件

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}

// 使用
;<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

---

## 十二、Suspense

### 12.1 代码分割

```jsx
const OtherComponent = lazy(() => import('./OtherComponent'))

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  )
}
```

### 12.2 数据获取

```jsx
import { Suspense } from 'react'

function ProfileDetails() {
  const user = resource.user.read()
  return <h1>{user.name}</h1>
}

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
    </Suspense>
  )
}
```

---

## 十三、React 19 新特性

### 13.1 Actions

```jsx
function UpdateName() {
  async function updateName(formData) {
    'use server'
    await db.user.update({
      name: formData.get('name'),
    })
  }

  return (
    <form action={updateName}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```

### 13.2 useOptimistic

```jsx
import { useOptimistic } from 'react'

function Comments({ comments }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (currentComments, newComment) => [...currentComments, newComment],
  )

  return (
    <ul>
      {optimisticComments.map((comment) => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  )
}
```

### 13.3 useFormStatus

```jsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### 13.4 useActionState

```jsx
import { useActionState } from 'react'

function UpdateName() {
  const [error, submitAction, isPending] = useActionState(async (previousState, formData) => {
    const error = await updateName(formData.get('name'))
    if (error) return error
    return null
  }, null)

  return (
    <form action={submitAction}>
      {error && <p>{error}</p>}
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
    </form>
  )
}
```

### 13.5 Server Components

```jsx
// Server Component
async function Note({ id }) {
  const note = await db.note.get(id)

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
    </div>
  )
}

// Client Component
;('use client')

function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 13.6 Document Metadata

```jsx
import { Metadata } from 'next'

export const metadata = {
  title: 'My Page',
  description: 'Page description',
}

function Page() {
  return <h1>Hello</h1>
}
```

---

## 十四、最佳实践

### 14.1 项目结构

```
src/
├── components/     # 通用组件
├── pages/         # 页面组件
├── hooks/         # 自定义 Hooks
├── contexts/      # Context
├── stores/        # 状态管理
├── services/      # API 服务
├── utils/         # 工具函数
├── assets/        # 静态资源
└── styles/        # 样式
```

### 14.2 性能优化

```jsx
// 懒加载
const LazyComponent = lazy(() => import('./LazyComponent'))

// 虚拟列表
import { FixedSizeList } from 'react-window'

// 防抖节流
import { useDebounce, useThrottle } from 'usehooks-ts'

// 图片优化
;<img loading="lazy" src={image} alt="" />
```

### 14.3 TypeScript

```tsx
interface Props {
  name: string
  age?: number
  onClick: () => void
}

function Welcome({ name, age = 0, onClick }: Props) {
  return (
    <div onClick={onClick}>
      {name}, {age}
    </div>
  )
}

// Hook 类型
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue)
  return [count, setCount] as const
}
```

### 14.4 测试

```jsx
import { render, screen, fireEvent } from '@testing-library/react'

test('renders hello world', () => {
  render(<App />)
  const element = screen.getByText(/hello world/i)
  expect(element).toBeInTheDocument()
})

test('handles click', () => {
  render(<Button onClick={mockHandler} />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockHandler).toHaveBeenCalled()
})
```

---

## 附录

### A. 生态系统

- **Next.js**: React 框架
- **Remix**: Web 框架
- **React Router**: 路由
- **TanStack Query**: 数据获取
- **Zustand/Jotai**: 状态管理
- **React Testing Library**: 测试

### B. 有用的资源

- **官方文档**: https://react.dev/
- **Beta 文档**: https://beta.reactjs.org/
- **Awesome React**: https://github.com/enaqx/awesome-react

### C. 学习路线

```
JavaScript → JSX → 组件 → Hooks → 状态管理 → 路由 → 高级特性 → 工程化

1. JavaScript ES6+
2. JSX 语法
3. 组件和 Props
4. State 和 Lifecycle
5. Hooks
6. Context API
7. 状态管理 (Redux/Zustand)
8. React Router
9. 性能优化
10. TypeScript
11. 测试
12. SSR/Next.js
```

---

**祝您 React 19 开发愉快！** ⚛️

如有问题，请查阅官方文档或社区论坛。
