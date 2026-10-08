---
title: React 事件系统
tags: ['React', '事件系统']
---

# React 事件系统

React 拥有一套独立于浏览器原生事件的事件系统——合成事件（SyntheticEvent）。它实现了跨浏览器兼容、事件委托优化、以及与 Fiber 调度的深度集成。本文从底层原理到工程实践，系统梳理 React 事件系统的核心机制。

---

## 一、合成事件（SyntheticEvent）

### 1.1 核心概念

React 不直接将事件处理器绑定到具体 DOM 节点，而是通过**事件委托**统一在根节点处理：

```tsx
// React 代码
function Button() {
  const handleClick = (e: React.MouseEvent) => {
    console.log('clicked', e.nativeEvent) // 原生事件
  }
  return <button onClick={handleClick}>Click me</button>
}

// 实际行为：
// React 在 root 节点统一监听 click 事件
// 通过 Fiber 树找到目标组件，调用对应的 handler
```

### 1.2 SyntheticEvent 与 NativeEvent

```tsx
function EventHandler(e: React.MouseEvent<HTMLButtonElement>) {
  // e 是 SyntheticEvent（合成事件）
  e.preventDefault() // 可以阻止默认行为
  e.stopPropagation() // 可以阻止冒泡

  // e.nativeEvent 是浏览器原生事件
  console.log(e.nativeEvent instanceof MouseEvent) // true

  // SyntheticEvent 的常用属性（跨浏览器统一）
  console.log(e.currentTarget) // 绑定事件的元素（button）
  console.log(e.target)        // 触发事件的元素（可能是子元素）
  console.log(e.type)          // 'click'
  console.log(e.timeStamp)     // 事件时间戳
}
```

### 1.3 SyntheticEvent 对象池（React 16 已废弃）

React 16 之前，SyntheticEvent 使用对象池复用，事件回调执行后属性会被清空。React 17+ 已移除此机制，每次事件创建独立的 SyntheticEvent 实例。

---

## 二、事件委托机制

### 2.1 React 17+ 的事件委托

```
React 17+ 事件委托模型：

  document
  └── #root（React 根节点）
      ├── 所有 React 事件监听器注册在这里
      ├── click → dispatchEvent
      ├── input → dispatchEvent
      ├── focus → dispatchEvent（注意：focus 不冒泡，React 用 capture 阶段监听）
      └── ...

  事件触发流程：
  ① 用户点击 button
  ② 浏览器原生事件冒泡到 #root
  ③ React 的事件处理器被触发
  ④ React 通过 Fiber 树确定事件目标组件
  ⑤ 按组件树顺序执行对应的 handler（冒泡阶段）
```

### 2.2 React 16 vs 17 的区别

| 版本 | 委托目标 | 问题 |
|---|---|---|
| React 16 | `document` | 多 React 实例共存时事件冲突 |
| React 17+ | `ReactDOM.createRoot()` 的容器 | 多实例互不干扰 |

```tsx
// React 17+ 可以安全地在一个页面中嵌入多个 React 应用
// 因为事件委托在各自的 root 容器上，不会互相影响
```

---

## 三、事件冒泡与捕获

### 3.1 冒泡阶段（默认）

```tsx
function Parent() {
  const handleClick = () => console.log('Parent clicked')
  return (
    <div onClick={handleClick}>
      <Child />
    </div>
  )
}

function Child() {
  const handleClick = () => console.log('Child clicked')
  return <button onClick={handleClick}>Click</button>
}

// 点击 button → 输出：Child clicked → Parent clicked（冒泡顺序）
```

### 3.2 捕获阶段

```tsx
// onClickCapture：在捕获阶段触发（从外到内）
function Parent() {
  const handleClick = () => console.log('Parent capture')
  return (
    <div onClickCapture={handleClick}>
      <Child />
    </div>
  )
}

function Child() {
  const handleClick = () => console.log('Child capture')
  return <button onClickCapture={handleClick}>Click</button>
}

// 点击 button → 输出：Parent capture → Child capture（捕获顺序）
```

### 3.3 混合冒泡与捕获

```tsx
// 同时注册冒泡和捕获
<div onClick={() => console.log('div bubble')}
     onClickCapture={() => console.log('div capture')}>
  <button onClick={() => console.log('btn bubble')}
          onClickCapture={() => console.log('btn capture')}>
    Click
  </button>
</div>

// 点击 button → 输出顺序：
// 1. div capture    （捕获阶段：从外到内）
// 2. btn capture    （捕获阶段：到达目标）
// 3. btn bubble     （冒泡阶段：目标开始）
// 4. div bubble     （冒泡阶段：从内到外）
```

---

## 四、事件中的 `this` 与闭包

### 4.1 类组件中的 this 绑定

```tsx
class Button extends React.Component {
  // ❌ 不绑定 this
  handleClick() {
    console.log(this) // undefined（严格模式）
  }

  // ✅ 箭头函数自动绑定
  handleClickArrow = () => {
    console.log(this) // Button 实例
  }

  // ✅ 构造函数中手动绑定
  constructor(props) {
    super(props)
    this.handleClickBound = this.handleClick.bind(this)
  }

  render() {
    return (
      <>
        <button onClick={this.handleClick}>Wrong</button>
        <button onClick={this.handleClickArrow}>Correct</button>
        <button onClick={this.handleClickBound}>Correct</button>
      </>
    )
  }
}
```

### 4.2 函数组件中的闭包陷阱

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  const showAlert = () => {
    // 闭包捕获的是「创建时」的 count 值
    setTimeout(() => {
      alert(`Count: ${count}`) // 始终弹出创建时的值
    }, 3000)
  }

  // ✅ 方案一：使用 ref 获取最新值
  const countRef = useRef(count)
  countRef.current = count

  const showAlertLatest = () => {
    setTimeout(() => {
      alert(`Count: ${countRef.current}`) // 最新值
    }, 3000)
  }

  // ✅ 方案二：使用函数式更新
  const incrementDelayed = () => {
    setTimeout(() => {
      setCount((prev) => prev + 1) // 始终基于最新 state
    }, 3000)
  }

  return <button onClick={showAlert}>Click (count={count})</button>
}
```

---

## 五、事件传参

### 5.1 传参模式对比

```tsx
// ❌ 直接在 JSX 中调用（每次渲染都执行）
<button onClick={handleClick('save')}>Save</button>

// ✅ 方案一：箭头函数包裹
<button onClick={() => handleClick('save')}>Save</button>

// ✅ 方案二：高阶函数返回处理器
const createHandler = (action: string) => () => handleClick(action)
<button onClick={createHandler('save')}>Save</button>

// ✅ 方案三：data 属性（性能最优，无闭包）
<button data-action="save" onClick={handleClickWithDataset}>Save</button>

function handleClickWithDataset(e: React.MouseEvent<HTMLButtonElement>) {
  const action = e.currentTarget.dataset.action
  console.log(action) // 'save'
}
```

### 5.2 性能影响

| 方案 | 每次渲染创建新函数 | 适合场景 |
|---|---|---|
| 箭头函数包裹 | ✅ 是 | 通用场景（绝大多数情况） |
| 高阶函数 | ✅ 是 | 需要参数化时 |
| data 属性 | ❌ 否 | 列表项大量事件、性能敏感场景 |

> 箭头函数包裹的性能开销极小，只有在万级列表渲染时才需要考虑 data 属性方案。

---

## 六、自定义事件

### 6.1 组件间通信：自定义事件模式

```tsx
// 方案一：回调 Props（最常用）
interface SearchBarProps {
  onSearch: (query: string) => void
  onChange?: (query: string) => void
}

function SearchBar({ onSearch, onChange }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange?.(e.target.value)
        }}
      />
      <button type="submit">搜索</button>
    </form>
  )
}

// 方案二：mitt 事件总线（跨组件 / 跨层级）
import mitt from 'mitt'

type Events = {
  'user:login': User
  'user:logout': void
  'notification:new': Notification
}

const emitter = mitt<Events>()

// 发布
emitter.emit('user:login', user)

// 订阅
emitter.on('notification:new', (notification) => {
  console.log('New notification:', notification)
})
```

### 6.2 与 DOM 自定义事件集成

```tsx
// React 组件派发 DOM 自定义事件
function CustomElement() {
  const ref = useRef<HTMLDivElement>(null)

  const emitCustomEvent = () => {
    ref.current?.dispatchEvent(
      new CustomEvent('my-event', {
        detail: { message: 'Hello from React' },
        bubbles: true,
      })
    )
  }

  return (
    <div ref={ref} onClick={emitCustomEvent}>
      Click to emit custom event
    </div>
  )
}

// 非 React 代码中监听
document.addEventListener('my-event', (e: Event) => {
  const detail = (e as CustomEvent).detail
  console.log(detail.message) // 'Hello from React'
})
```

---

## 七、Portal 与事件冒泡

### 7.1 Portal 中的事件行为

```tsx
// Portal 将 DOM 渲染到 React 树之外
function Modal({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body // DOM 挂载在 body 下
  )
}

// 关键：事件仍然按 React 组件树冒泡，而非 DOM 树
function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div onClick={() => console.log('App clicked')}>
      {/* 即使 Modal 的 DOM 在 body 下 */}
      {/* 点击 Modal 内容仍会冒泡到 App 的 onClick */}
      {showModal && <Modal>Modal Content</Modal>}
    </div>
  )
}
```

**React 事件冒泡 vs DOM 事件冒泡**：

| 维度 | React 合成事件 | DOM 原生事件 |
|---|---|---|
| 冒泡路径 | React 组件树 | DOM 节点树 |
| Portal 影响 | 不影响（仍按组件树） | Portal DOM 在 body 下 |
| stopPropagation | 阻止 React 合成事件冒泡 | 不阻止 React 合成事件冒泡 |

---

## 八、事件系统速查表

| 主题 | 要点 |
|---|---|
| 合成事件 | `SyntheticEvent`，跨浏览器统一，React 17+ 委托到 root 容器 |
| 事件冒泡 | 默认冒泡阶段，`onXxxCapture` 在捕获阶段 |
| this 绑定 | 类组件用箭头函数；函数组件无此问题 |
| 闭包陷阱 | 事件回调捕获创建时的 state，用 `useRef` 或函数式更新获取最新值 |
| 事件传参 | 箭头函数包裹（通用）/ data 属性（性能敏感） |
| 自定义事件 | 回调 Props（组件间）/ mitt（跨层级）/ CustomEvent（与 DOM 集成） |
| Portal 事件 | 按 React 组件树冒泡，不受 DOM 位置影响 |
| 原生事件 | `e.nativeEvent` 访问；`useEffect` 中 `addEventListener` 需手动清理 |
