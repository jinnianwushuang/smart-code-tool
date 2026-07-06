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

**作用**: 在函数组件中添加状态管理能力，返回当前状态值和更新状态的函数。

**底层原理**: React 内部通过链表结构存储组件的状态队列。每次调用 `useState` 时，React 会根据调用顺序从链表中获取对应的状态节点。当状态更新时，React 会创建新的状态值并触发组件重新渲染，但不会立即修改原状态，而是将其加入更新队列，在下一次渲染时使用新值。

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

**作用**: 处理副作用操作（如数据获取、订阅、手动 DOM 操作等），在组件渲染后异步执行。

**底层原理**: React 在每次渲染后将 effect 函数放入一个队列中，在浏览器绘制完成后异步执行。effect 的依赖数组决定了何时重新执行：如果依赖项变化，先执行上一次的清理函数，再执行新的 effect。这种机制确保了副作用与 UI 同步，同时避免阻塞浏览器渲染。

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

**作用**: 读取 Context 对象中的当前值，使组件能够订阅 Context 的变化。

**底层原理**: React 内部维护一个 Context 栈，当组件调用 `useContext` 时，React 会从最近的 Provider 中读取值，并在组件与 Context 之间建立订阅关系。当 Provider 的值发生变化时，所有订阅该 Context 的组件都会被标记为需要重新渲染。这避免了通过 props 逐层传递数据的需要。

```jsx
import { useContext } from 'react'

const ThemeContext = React.createContext('light')

function ThemedButton() {
  const theme = useContext(ThemeContext)

  return <button className={theme}>Themed Button</button>
}
```

### 4.4 useReducer

**作用**: 管理复杂的状态逻辑，通过 reducer 函数根据 action 类型计算新状态。

**底层原理**: 与 `useState` 类似，但使用 reducer 模式。React 内部存储当前状态，当 dispatch 被调用时，将 action 传递给 reducer 函数，reducer 返回新状态。这种方式适合状态转换逻辑复杂或下一个状态依赖于前一个状态的场景。React 会对连续多次的 dispatch 进行批处理优化。

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

**作用**: 记忆化回调函数，仅在依赖项变化时返回新的函数引用，避免不必要的子组件重渲染。

**底层原理**: React 内部存储函数的引用和依赖数组。每次渲染时，React 会比较依赖数组中的值是否发生变化（使用 Object.is 比较）。如果依赖未变化，返回之前记忆的函数引用；如果变化，则创建新函数并更新记忆。这对于传递给使用 `React.memo` 优化的子组件的回调函数特别有用。

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

**作用**: 记忆化计算结果，仅在依赖项变化时重新计算，避免昂贵的重复计算。

**底层原理**: React 内部存储计算结果和依赖数组。每次渲染时，比较依赖项是否变化。如果未变化，直接返回缓存的结果；如果变化，执行传入的计算函数并缓存新结果。注意：不应在 `useMemo` 中执行副作用操作，它仅用于性能优化而非保证语义正确性。

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

**作用**: 创建可变引用对象，其 `.current` 属性可以保存任何值，且修改不会触发组件重渲染。

**底层原理**: React 在首次渲染时创建一个普通的 JavaScript 对象 `{ current: initialValue }`，并在整个组件生命周期中保持同一个对象引用。由于修改 `.current` 不会触发 React 的状态更新机制，因此不会引起重渲染。常用于访问 DOM 元素、保存定时器 ID 或其他不需要触发渲染的可变值。

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

**作用**: 自定义暴露给父组件的 ref 实例方法，通常与 `forwardRef` 配合使用。

**底层原理**: 当父组件通过 ref 访问子组件时，`useImperativeHandle` 允许子组件控制暴露哪些方法和属性。React 会将第二个参数（工厂函数）的返回值作为 ref 的 current 值。这种方式可以隐藏子组件的内部实现细节，只暴露必要的接口，实现更好的封装。

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

**作用**: 与 `useEffect` 类似，但在 DOM 突变后、浏览器绘制前同步执行，适用于需要测量 DOM 布局的场景。

**底层原理**: React 在完成所有 DOM 变更后立即同步执行 `useLayoutEffect`，此时浏览器尚未进行绘制。这使得可以在用户看到屏幕更新之前读取和修改 DOM 布局（如元素尺寸、位置）。由于是同步执行，可能会阻塞浏览器绘制，因此应谨慎使用，仅在需要避免视觉闪烁时使用。

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

**作用**: 在 React DevTools 中为自定义 Hook 显示标签，便于调试。

**底层原理**: 这是一个仅用于开发的辅助 Hook，在生产环境中会被完全忽略。React DevTools 会读取通过 `useDebugValue` 设置的值，并将其显示在自定义 Hook 旁边。可以接受第二个参数（格式化函数）来定制显示的格式。不会影响组件的实际行为或性能。

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

**底层原理**: 状态提升是 React 单向数据流的核心体现。当多个组件需要共享同一状态时，将状态移动到它们最近的共同父组件中。父组件通过 props 将状态和更新函数传递给子组件。这种模式确保了数据流向的可预测性：数据从上到下流动（父到子），事件从下到上传播（子到父）。React 的状态更新会触发从根组件开始的协调过程（Reconciliation），通过 Fiber 树结构高效地计算最小 DOM 变更。

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

**底层原理**: Context API 通过 Provider-Consumer 模式实现跨组件树的数据传递，避免了 props drilling。React 内部维护一个 Context 链表，每个 Provider 节点包含 value 值和订阅者列表。当组件调用 `useContext` 时，React 从当前组件向上遍历组件树，找到最近的匹配 Provider 并建立订阅关系。当 Provider 的 value 变化时，React 使用 Object.is 进行浅比较，如果值不同则标记所有订阅该 Context 的组件为需要更新。这种机制在深层组件树中特别有效，但频繁更新的 Context 可能导致不必要的重渲染，可以通过拆分 Context 或使用 memo 优化。

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

**底层原理**: Redux 基于 Flux 架构，采用单一不可变状态树（Store）和纯函数 reducer 来管理应用状态。核心原则包括：单一数据源、状态只读、使用纯函数修改。Redux Toolkit (RTK) 简化了 Redux 的使用，内置了 Immer 库来实现不可变更新。当 dispatch action 时，Redux 遍历所有注册的 reducer，根据 action type 计算新状态。React-Redux 通过 `useSelector` 和 `useDispatch` hooks 连接 React 和 Redux。`useSelector` 会在每次 store 更新时执行选择器函数，并使用浅比较判断返回值是否变化，只有变化时才触发组件重渲染。Redux 使用发布-订阅模式，store 维护订阅者列表，state 变化时通知所有订阅者。

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

**底层原理**: Zustand 是一个轻量级状态管理库，基于 React Hooks 和发布-订阅模式。它不依赖 Context API，而是直接使用 React 的状态更新机制。Zustand 创建一个 store 对象，其中包含状态和更新方法。当组件调用 hook（如 `useStore`）时，Zustand 会在内部建立一个订阅关系，监听 store 的变化。与 Redux 不同，Zustand 允许组件直接订阅 store 的特定部分，只有当订阅的部分发生变化时才会触发重渲染，这避免了不必要的组件更新。Zustand 使用 selector 函数来提取所需的状态片段，并通过浅比较判断是否需要更新。它的优势在于简洁的 API、零样板代码和良好的 TypeScript 支持，适合中小型应用或作为 Redux 的替代方案。

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

**作用**: 简化表单提交和服务端操作，允许在组件中直接定义异步函数来处理用户交互，自动管理加载状态、错误处理和乐观更新。

**底层原理**: React 将标记为 `'use server'` 的函数序列化为服务端可执行的代码。当表单提交时，React 拦截提交事件，调用对应的服务端函数，并自动跟踪执行状态（pending、error）。React 内部使用 Transition API 来管理并发更新，确保 UI 在等待服务端响应时保持响应性。如果操作失败，React 会自动回滚到之前的状态。

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

**作用**: 实现乐观更新，在等待服务端响应时立即更新 UI，提供更好的用户体验。如果操作失败，自动回滚到之前的状态。

**底层原理**: `useOptimistic` 维护两个状态：当前确认的状态和乐观状态。当调用更新函数时，React 立即应用乐观更新器函数生成新的乐观状态并渲染。同时，React 在后台跟踪 pending 状态。如果操作成功，乐观状态被确认为真实状态；如果失败，React 自动丢弃乐观更新，恢复到之前的确认状态。这种机制通过内部的状态队列和事务管理实现，确保 UI 始终处于一致状态。

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

**作用**: 在表单内的子组件中访问表单的提交状态（pending、data、method、action），无需通过 props 传递状态。

**底层原理**: `useFormStatus` 利用 React 的 Context API 在内部创建了一个表单状态上下文。当表单开始提交时，React 自动更新这个上下文中的状态值。所有调用 `useFormStatus` 的组件都会订阅这个上下文，并在状态变化时重新渲染。这使得表单内的任何子组件都能访问提交状态，而无需显式传递 props。该 Hook 必须在 `<form>` 组件的子树中使用，因为它依赖于父级表单提供的上下文。

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

**作用**: 管理表单操作的状态，包括错误信息、提交函数和 pending 状态，简化表单提交流程。

**底层原理**: `useActionState` 结合了状态管理和 Actions 的功能。它内部维护一个状态值（通常是错误信息或表单数据），并提供一个包装过的提交函数。当表单提交时，React 自动设置 pending 状态为 true，执行传入的异步函数，并根据返回结果更新状态。如果函数返回错误，状态会被更新为错误信息；如果成功，状态可以被重置。React 使用内部的 transition 机制来管理整个流程，确保状态更新的原子性和一致性。这个 Hook 替代了传统的 useState + onSubmit 模式，提供了更简洁的 API。

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

**作用**: 允许组件在服务端渲染，直接访问数据库和后端资源，减少客户端 JavaScript 包体积，提升首屏加载性能。

**底层原理**: React Server Components (RSC) 在 Node.js 环境中执行，可以直接访问服务端资源（数据库、文件系统等）。组件渲染后，React 生成一种特殊的序列化格式（不是 HTML），包含组件树结构和数据。客户端接收这个序列化数据后，将其与客户端组件合并成完整的 UI 树。服务端组件不会打包到客户端 bundle 中，因此可以安全地使用服务端专用的库和 API。React 通过流式传输逐步发送组件内容，配合 Suspense 实现渐进式 hydration。客户端组件通过 `'use client'` 指令标识，可以在其中使用 Hooks 和浏览器 API。

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

**作用**: 在组件中声明式地管理文档元数据（title、meta 标签等），支持服务端渲染和动态更新。

**底层原理**: React 提供了一个内置的元数据管理系统，允许在任何组件中声明 document head 的内容。在服务器端渲染时，React 收集所有组件中声明的元数据，并将其注入到最终的 HTML 中。在客户端，React 使用 DOM API 动态更新 document.head 中的标签。React 会智能地合并来自不同组件的元数据，处理冲突（例如多个组件设置 title 时，最近的组件优先）。这种机制避免了传统方案中需要手动操作 document.title 或使用第三方库的复杂性，同时保证了 SSR 兼容性。

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
