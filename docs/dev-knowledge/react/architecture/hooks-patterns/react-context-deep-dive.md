---
title: React Context 深度专题
tags: ['React', 'Context']
---

# React Context 深度专题

Context 是 React 提供的跨层级数据传递机制，解决了「Props Drilling」问题。但 Context 的性能陷阱、拆分策略、与状态管理的协作边界，是工程实践中最容易踩坑的领域。本文从原理到实践系统梳理 Context 的正确用法。

---

## 一、Context 核心机制

### 1.1 三要素：创建 → 提供 → 消费

```tsx
// ① 创建 Context
import { createContext, useContext } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ② 提供（Provider）
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Page />
    </ThemeContext.Provider>
  )
}

// ③ 消费
function ThemedButton() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('必须在 ThemeContext.Provider 内使用')
  return (
    <button className={ctx.theme === 'dark' ? 'btn-dark' : 'btn-light'}
      onClick={ctx.toggleTheme}>
      切换主题
    </button>
  )
}
```

### 1.2 默认值

```tsx
// createContext 的参数是「默认值」，仅在组件没有被 Provider 包裹时生效
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

// 使用自定义 Hook 封装安全消费
function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}
```

---

## 二、Context 性能陷阱

### 2.1 核心问题：Provider value 变化导致所有消费者重渲染

```tsx
// ❌ 性能陷阱
function App() {
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState('light')
  const [lang, setLang] = useState('zh')

  // 每次 theme 变化 → value 对象重建 → 所有消费者重渲染
  // 即使他们只需要 lang
  return (
    <AppContext.Provider value={{ user, theme, lang, setTheme, setLang }}>
      <Page />
    </AppContext.Provider>
  )
}
```

**问题本质**：Context 的更新粒度是 **Provider 的 value 引用**。value 变化时，**所有** `useContext` 消费者都会重渲染，无法像 Zustand selector 那样精确订阅。

### 2.2 性能影响量化

```
Provider value 变化时：

  Provider
  ├── ConsumerA（只需要 theme）→ 重渲染 ✅
  ├── ConsumerB（只需要 lang）→ 重渲染 ✅（不必要的！）
  ├── ConsumerC（只需要 user）→ 重渲染 ✅（不必要的！）
  └── DeepChild → ConsumerD → 重渲染 ✅
```

### 2.3 解决方案一：拆分 Context

```tsx
// ✅ 按变化频率或业务域拆分
const ThemeContext = createContext<ThemeValue>(/* ... */)
const UserContext = createContext<UserValue>(/* ... */)
const LangContext = createContext<LangValue>(/* ... */)

function App() {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState('zh')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <LangContext.Provider value={{ lang, setLang }}>
          <Page />
        </LangContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

// 只消费 theme 的组件：theme 不变时不会重渲染
function ThemedButton() {
  const { theme } = useContext(ThemeContext)
  // ...
}
```

### 2.4 解决方案二：useMemo 稳定 value

```tsx
function App() {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<User | null>(null)

  // ✅ 只有 theme 变化时才重建 value
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme])
  // ✅ 只有 user 变化时才重建 value
  const userValue = useMemo(() => ({ user, setUser }), [user])

  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
        <Page />
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}
```

### 2.5 解决方案三：状态与 dispatch 分离

```tsx
// 将「状态」和「更新函数」拆成两个 Context
// 更新函数引用永远不变 → 只需要 dispatch 的消费者不会因 state 变化而重渲染

const CountStateContext = createContext<number>(0)
const CountDispatchContext = createContext<React.Dispatch<Action>>(() => {})

function CountProvider({ children }: { children: React.ReactNode }) {
  const [count, dispatch] = useReducer(countReducer, 0)

  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={dispatch}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  )
}

// 只需要 dispatch 的组件：永远不会因 count 变化重渲染
function IncrementButton() {
  const dispatch = useContext(CountDispatchContext)
  return <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
}

// 只需要 state 的组件
function CountDisplay() {
  const count = useContext(CountStateContext)
  return <span>{count}</span>
}
```

---

## 三、Context 选择器模式

### 3.1 自定义 selector Hook

React Context 本身不支持 selector，但可以手动实现：

```tsx
// 方案一：useContextSelector 提案（react-redux 风格的 selector）
function useContextSelector<T, S>(
  context: React.Context<T>,
  selector: (value: T) => S,
  equalityFn: (a: S, b: S) => boolean = Object.is
): S {
  const value = useContext(context)
  const selected = selector(value)
  const prevRef = useRef(selected)

  // 引用不变则返回缓存值
  if (equalityFn(prevRef.current, selected)) {
    return prevRef.current
  }
  prevRef.current = selected
  return selected
}

// 使用
const user = useContextSelector(UserContext, (ctx) => ctx.user)
```

> 注意：这种方式**不能阻止重渲染**，只是避免返回不同的值。真正阻止重渲染需要 `React.memo` 配合或使用 `useSyncExternalStore`。

### 3.2 使用 `useSyncExternalStore` 实现精确订阅

```tsx
// 将 Context 改造为可精确订阅的外部 store
function createContextStore<T>(initialValue: T) {
  let currentValue = initialValue
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => currentValue,
    subscribe: (cb: () => void) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    set: (newValue: T) => {
      currentValue = newValue
      listeners.forEach((cb) => cb())
    },
  }
}

// 组件中精确订阅
const userStore = createContextStore<User | null>(null)

function useUser() {
  return useSyncExternalStore(userStore.subscribe, userStore.getSnapshot)
}

// 只有 user 真正变化时才重渲染
```

---

## 四、Context 最佳实践

### 4.1 何时用 Context

| 场景 | 适合 Context | 原因 |
|---|---|---|
| 主题（Theme） | ✅ | 低频变化，全树消费 |
| 国际化（i18n） | ✅ | 低频变化，全树消费 |
| 认证状态（Auth） | ✅ | 多组件需要访问 |
| 表单状态 | ❌ | 高频变化，用 React Hook Form |
| 服务端数据 | ❌ | 用 TanStack Query / SWR |
| 复杂全局状态 | ❌ | 用 Zustand / Jotai |

### 4.2 Provider 组合模式

```tsx
// ❌ 嵌套地狱
<ThemeProvider>
  <AuthProvider>
    <LangProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </LangProvider>
  </AuthProvider>
</ThemeProvider>

// ✅ 组合函数扁平化
function composeProviders(...providers: React.ComponentType<{ children: React.ReactNode }>[]) {
  return providers.reduce(
    (Prev, Curr) =>
      function Composed({ children }: { children: React.ReactNode }) {
        return (
          <Prev>
            <Curr>{children}</Curr>
          </Prev>
        )
      }
  )
}

const Providers = composeProviders(ThemeProvider, AuthProvider, LangProvider, QueryProvider)

function App() {
  return (
    <Providers>
      <Page />
    </Providers>
  )
}
```

### 4.3 自定义 Hook 封装消费逻辑

```tsx
// ❌ 在组件中直接 useContext + 判空
function Header() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('...')
  const { user } = ctx
  // ...
}

// ✅ 封装为安全的自定义 Hook
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}

function Header() {
  const { user } = useAuth()
  // ...
}
```

---

## 五、Context vs 状态管理库

| 维度 | Context + useState | Zustand / Redux |
|---|---|---|
| 更新粒度 | 全量（所有消费者） | 精确（selector 订阅） |
| 性能 | 低频场景足够 | 高频场景必需 |
| DevTools | 无 | Redux DevTools / Zustand DevTools |
| 中间件 | 无 | 持久化、日志、 Immer 集成 |
| 学习成本 | 零（React 内置） | 需学习 API |
| 适用规模 | 小型应用 / 低频数据 | 中大型应用 / 高频数据 |

**决策规则**：

- 变化频率低（主题、语言、认证）→ Context
- 变化频率高（表单、实时数据、动画状态）→ 状态管理库
- 需要 DevTools / 中间件 → 状态管理库
- 不确定 → 先用 Context，性能不够时再迁移

---

## 六、React 19 Context 变更

### 6.1 `use(Context)` 选择性消费

React 19 引入 `use()` Hook，可以在条件语句中使用 Context：

```tsx
import { use } from 'react'

function ThemedButton() {
  const theme = use(ThemeContext) // 可以在 if 中使用
  if (theme === 'dark') {
    return <DarkButton />
  }
  return <LightButton />
}
```

### 6.2 Context 选择性消费（提案中）

React 团队正在探索 Context selector 的原生支持：

```tsx
// 未来 API（提案阶段）
const user = useContext(UserContext, (ctx) => ctx.user)
// 只有 ctx.user 变化时才重渲染
```

目前可通过 `useSyncExternalStore` 或状态管理库实现类似效果。

---

## 七、Context 速查表

| 问题 | 方案 |
|---|---|
| Props Drilling | Context 跨层级传递 |
| Provider value 变化导致全树重渲染 | 拆分 Context / useMemo 稳定 value |
| 只需要 dispatch 不想重渲染 | 状态与 dispatch 分离为两个 Context |
| 需要精确订阅 | Zustand selector / useSyncExternalStore |
| 多个 Provider 嵌套太深 | composeProviders 组合函数 |
| 安全消费 Context | 封装 `useXxx` 自定义 Hook + 判空 |
| 主题/语言等低频全局数据 | Context 是最佳选择 |
| 高频全局状态 | 不用 Context，用 Zustand/Jotai |
