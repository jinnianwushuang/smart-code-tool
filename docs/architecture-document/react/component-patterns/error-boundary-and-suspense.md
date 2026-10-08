---
title: Error Boundary 与错误恢复
tags: ['React', '错误处理']
---

# Error Boundary 与错误恢复

Error Boundary 是 React 中捕获组件树渲染错误的核心机制。它使得应用在局部组件崩溃时，仍能保持整体可用，而非白屏。本文系统梳理 Error Boundary 的实现原理、最佳实践以及与 Suspense 的协同模式。

---

## 一、Error Boundary 核心机制

### 1.1 什么是 Error Boundary

Error Boundary 是一种特殊的 React 组件，能够：

- **捕获**：子组件树中渲染阶段抛出的错误
- **记录**：将错误信息上报到日志系统
- **降级**：渲染备用 UI，替代崩溃的组件树

> 注意：Error Boundary **只能**捕获渲染阶段（Render Phase）的错误，无法捕获以下场景：
>
> - 事件处理函数内的错误（用 `try/catch`）
> - 异步代码（`setTimeout`、`Promise.then`）
> - SSR 中的错误
> - Error Boundary 组件自身的错误

### 1.2 类组件实现（唯一方式）

Error Boundary 目前**必须用类组件**实现，通过 `static getDerivedStateFromError` 和 `componentDidCatch` 两个生命周期：

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode | ((error: Error) => ReactNode)
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // ① 更新 state，使下一次渲染能显示降级 UI
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  // ② 记录错误信息（上报日志）
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    // 上报到错误监控平台
    reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    // 调用外部回调
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 支持函数式 fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!)
      }
      return this.props.fallback
    }
    return this.props.children
  }
}
```

**两个生命周期的职责分工**：

| 生命周期                   | 阶段           | 职责                      | 能否有副作用 |
| -------------------------- | -------------- | ------------------------- | ------------ |
| `getDerivedStateFromError` | Render（同步） | 返回新 state 触发降级渲染 | ❌ 纯函数    |
| `componentDidCatch`        | Commit（异步） | 记录错误、上报日志        | ✅ 可以      |

### 1.3 函数组件方案

React 19 之前，函数组件无法直接实现 Error Boundary。社区方案：

```tsx
// 方案一：使用 react-error-boundary 库（推荐）
import { ErrorBoundary } from 'react-error-boundary'

function MyComponent() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => console.error(error)}
    >
      <ChildComponent />
    </ErrorBoundary>
  )
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div role="alert">
      <h3>出错了：{error.message}</h3>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  )
}

// 方案二：自定义 Hook 包裹（有限场景）
// 只能捕获 Hook 内部错误，无法捕获子组件渲染错误
function useErrorHandler() {
  const [, setError] = useState<Error | null>(null)
  return (error: Error) => setError(error)
}
```

---

## 二、Error Boundary 分层策略

### 2.1 三层错误边界

```tsx
function App() {
  return (
    // 第 1 层：全局兜底 — 整个应用白屏降级
    <ErrorBoundary fallback={<GlobalError />}>
      <Header />
      <Main>
        {/* 第 2 层：路由级 — 单个页面崩溃不影响其他页面 */}
        <ErrorBoundary fallback={<PageError />}>
          <Dashboard />
        </ErrorBoundary>

        <ErrorBoundary fallback={<PageError />}>
          <Settings />
        </ErrorBoundary>
      </Main>

      <Sidebar>
        {/* 第 3 层：组件级 — 单个 Widget 崩溃不影响侧边栏 */}
        <ErrorBoundary fallback={<WidgetError />}>
          <NotificationPanel />
        </ErrorBoundary>
        <ErrorBoundary fallback={<WidgetError />}>
          <ActivityFeed />
        </ErrorBoundary>
      </Sidebar>
    </ErrorBoundary>
  )
}
```

### 2.2 分层原则

| 层级        | 粒度         | 降级 UI               | 恢复策略     |
| ----------- | ------------ | --------------------- | ------------ |
| 全局        | 整个 App     | 全屏错误页 + 刷新按钮 | 用户刷新页面 |
| 路由/页面   | 单个页面     | 页面骨架屏 + 重试     | 用户重新导航 |
| 组件/Widget | 单个功能区块 | 占位符 + 错误提示     | 用户点击重试 |

---

## 三、错误恢复模式

### 3.1 重置状态 — `resetErrorBoundary`

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function DataWidget() {
  const [retryKey, setRetryKey] = useState(0)

  return (
    <ErrorBoundary
      key={retryKey} // key 变化会重建 Error Boundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div>
          <p>加载失败：{error.message}</p>
          <button
            onClick={() => {
              setRetryKey((k) => k + 1) // 重建组件
              resetErrorBoundary() // 重置错误状态
            }}
          >
            重试
          </button>
        </div>
      )}
    >
      <DataFetcher />
    </ErrorBoundary>
  )
}
```

### 3.2 路由变化自动恢复

```tsx
import { useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  const location = useLocation()

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      // 路由变化时自动重置错误状态
      resetKeys={[location.pathname]}
    >
      <Routes>...</Routes>
    </ErrorBoundary>
  )
}
```

### 3.3 错误重试 + 指数退避

```tsx
function useRetry(fn: () => Promise<void>, maxRetries = 3) {
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const retry = useCallback(async () => {
    try {
      await fn()
      setError(null)
      setAttempts(0)
    } catch (err) {
      setError(err as Error)
      if (attempts < maxRetries) {
        const delay = Math.pow(2, attempts) * 1000
        setTimeout(() => setAttempts((a) => a + 1), delay)
      }
    }
  }, [fn, attempts, maxRetries])

  return { error, attempts, retry }
}
```

---

## 四、Error Boundary + Suspense 协同

### 4.1 统一的加载/错误状态

```tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function DataSection() {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <Card variant="error">
          <p>数据加载失败：{error.message}</p>
          <Button onClick={resetErrorBoundary}>重试</Button>
        </Card>
      )}
    >
      <Suspense
        fallback={
          <Card variant="skeleton">
            <Skeleton />
          </Card>
        }
      >
        <DataContent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

**协同模型**：

```
组件加载流程：

  挂载 → Suspense 接管（显示 loading）
           ├── 数据就绪 → 渲染成功 UI
           ├── 数据失败 → Error Boundary 接管（显示 error）
           └── 用户重试 → 重新挂载 → 回到 Suspense
```

### 4.2 React 19 `use()` Hook 与错误边界

```tsx
// React 19 中，use() 在 Suspense 内抛出的 Promise/错误
// 会被最近的 Suspense + ErrorBoundary 自动捕获

function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise) // 挂起 or 抛错
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  )
}

// 外层包裹
;<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<Spinner />}>
    <Comments commentsPromise={fetchComments()} />
  </Suspense>
</ErrorBoundary>
```

---

## 五、生产环境错误上报

### 5.1 错误上报集成

```tsx
// 统一错误上报
function reportError(params: {
  message: string
  stack?: string
  componentStack?: string | null
  tags?: Record<string, string>
}) {
  // 发送到 Sentry / 自建监控
  if (typeof window !== 'undefined' && window.__REPORTER__) {
    window.__REPORTER__.captureException(params)
  }

  // 开发环境打印详细信息
  if (process.env.NODE_ENV === 'development') {
    console.group('[Error Report]')
    console.error('Message:', params.message)
    console.error('Stack:', params.stack)
    console.error('Component Stack:', params.componentStack)
    console.groupEnd()
  }
}

// Error Boundary 中使用
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      tags: { module: 'error-boundary' },
    })
  }
}
```

### 5.2 `componentStack` 的价值

`componentStack` 提供组件层级的堆栈信息，比 JS 错误堆栈更有助于定位：

```
Component: ErrorFallback
    in ErrorBoundary (created by App)
    in div (created by Main)
    in Main (created by App)
    in App
```

通过 `componentStack` 可以直接定位是哪个组件树节点出了问题。

---

## 六、Error Boundary 速查表

| 问题                     | 方案                                                    |
| ------------------------ | ------------------------------------------------------- |
| 如何捕获子组件渲染错误   | `static getDerivedStateFromError` + `componentDidCatch` |
| 函数组件如何实现         | `react-error-boundary` 库                               |
| 如何防止整个 App 白屏    | 三层 Error Boundary（全局/路由/组件）                   |
| 崩溃后如何恢复           | `resetErrorBoundary` + `resetKeys`                      |
| 如何区分加载中和出错     | `ErrorBoundary` 包裹 `Suspense`                         |
| 事件处理函数错误怎么捕获 | `try/catch`（Error Boundary 无法捕获）                  |
| 异步错误怎么捕获         | 转为 Promise rejection → Suspense 抛给 ErrorBoundary    |
| 如何上报错误             | `componentDidCatch` 中调用日志 SDK                      |
