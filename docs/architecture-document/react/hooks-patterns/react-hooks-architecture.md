---
title: React Hooks 架构模式
order: 20
---

# React Hooks 架构模式

Hooks 是 React 架构的基石。自 React 16.8 引入以来，它彻底改变了逻辑复用和副作用管理的方式。本文从**架构设计**角度，系统阐述自定义 Hook 的设计原则、分层体系、副作用管理、性能优化以及常见反模式。

---

## 一、自定义 Hook 设计原则

自定义 Hook 是 React 逻辑复用的核心单元。好的 Hook 设计直接决定了项目的可维护性。

### 原则 1：单一职责

每个 Hook 只做一件事，返回清晰的结果。

```tsx
// ✅ 单一职责：只负责数据请求
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchUser(userId).then((data) => {
      if (!cancelled) {
        setUser(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { user, loading }
}

// ❌ 职责混杂：同时处理请求、表单、权限
function useUserManagement() {
  // 请求用户 + 校验表单 + 检查权限 + 处理路由...
}
```

### 原则 2：组合优先

复杂逻辑通过组合多个简单 Hook 实现，而非在一个 Hook 中堆砌。

```tsx
// ✅ 组合模式：每个 Hook 职责清晰
function useUserProfile(userId: string) {
  const { user, loading } = useUser(userId)
  const { permissions } = usePermissions(user?.role)
  const { recentOrders } = useOrders(userId, { limit: 5 })

  return {
    user,
    loading,
    canEdit: permissions.includes('user:edit'),
    recentOrders,
  }
}
```

### 原则 3：返回值结构化

返回对象而非数组，让调用方可以解构需要的字段。

```tsx
// ✅ 返回对象：调用方按需解构
function usePagination(total: number) {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  }
}

// 调用方只取需要的
const { page, nextPage } = usePagination(100)
```

### 原则 4：依赖项显式声明

Hook 内部所有 `useEffect`、`useMemo`、`useCallback` 的依赖项必须完整、正确。

```tsx
// ✅ 依赖完整
function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    searchApi(query, controller.signal)
      .then(setResults)
      .catch(() => {}) // 忽略取消请求的错误
    return () => controller.abort()
  }, [query]) // query 必须在依赖数组中

  return results
}
```

---

## 二、Hook 分层体系

在大型项目中，Hook 应该按照抽象层级进行分层，避免"扁平化堆砌"。

### 三层架构

```
┌─────────────────────────────────────────────┐
│  页面 Hook（Page Hooks）                     │
│  职责：编排业务 Hook，组装页面级数据          │
│  示例：useDashboardPage, useOrderListPage    │
├─────────────────────────────────────────────┤
│  业务 Hook（Business Hooks）                 │
│  职责：封装特定业务领域的逻辑                 │
│  示例：useCart, useAuth, useOrder, useSearch │
├─────────────────────────────────────────────┤
│  基础 Hook（Foundation Hooks）               │
│  职责：与业务无关的通用能力                   │
│  示例：useDebounce, useLocalStorage, useFetch│
└─────────────────────────────────────────────┘
```

### 各层详解

**基础 Hook**：纯工具性质，可在任何项目复用。

```tsx
// useDebounce：通用防抖
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// useLocalStorage：本地存储同步
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}
```

**业务 Hook**：封装特定业务领域逻辑，调用基础 Hook。

```tsx
// useCart：电商购物车业务 Hook
function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const debouncedItems = useDebounce(items, 300) // 调用基础 Hook

  const totalPrice = useMemo(
    () => debouncedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [debouncedItems],
  )

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { productId: product.id, price: product.price, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  return { items, totalPrice, addItem, removeItem }
}
```

**页面 Hook**：编排多个业务 Hook，为页面提供完整数据。

```tsx
// useCheckoutPage：结算页面 Hook
function useCheckoutPage() {
  const { items, totalPrice } = useCart()
  const { user } = useAuth()
  const { addresses, loading: addrLoading } = useAddresses(user?.id)
  const { submitOrder, submitting } = useSubmitOrder()

  return {
    items,
    totalPrice,
    addresses,
    addrLoading,
    submitting,
    handleSubmit: submitOrder,
  }
}
```

### 目录结构建议

```
src/hooks/
├── foundation/          # 基础 Hook
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── use-fetch.ts
├── business/            # 业务 Hook
│   ├── use-cart.ts
│   ├── use-auth.ts
│   └── use-order.ts
└── pages/               # 页面 Hook
    ├── use-checkout-page.ts
    └── use-dashboard-page.ts
```

---

## 三、副作用管理体系

副作用管理是 Hooks 架构中最复杂的部分。不当的副作用处理是 React 项目中 Bug 的首要来源。

### 副作用分类与清理策略

| 类型         | 示例                     | 清理方式                                |
| ------------ | ------------------------ | --------------------------------------- |
| **DOM 事件** | addEventListener         | 返回函数中 removeEventListener          |
| **定时器**   | setTimeout / setInterval | 返回函数中 clearTimeout / clearInterval |
| **网络请求** | fetch / axios            | AbortController.abort()                 |
| **订阅**     | WebSocket / EventSource  | ws.close() / eventSource.close()        |
| **观察者**   | IntersectionObserver     | observer.disconnect()                   |

### 竞态条件处理

异步副作用中最常见的 Bug 是竞态：快速切换页面或搜索词时，旧请求的结果覆盖了新请求。

```tsx
// ❌ 竞态 Bug：快速输入时，旧结果可能覆盖新结果
function useSearch(query: string) {
  const [results, setResults] = useState([])

  useEffect(() => {
    searchApi(query).then(setResults) // 没有取消机制
  }, [query])

  return results
}

// ✅ 使用 AbortController 处理竞态
function useSearch(query: string) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    searchApi(query, { signal: controller.signal })
      .then(setResults)
      .catch((err) => {
        if (err.name !== 'AbortError') throw err
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort() // 清理：取消上一次请求
  }, [query])

  return { results, loading }
}
```

### 副作用依赖管理原则

1. **能不用就不用**：如果值可以从 Props/State 派生，用 `useMemo` 而非 `useEffect`
2. **依赖项必须完整**：ESLint 的 `react-hooks/exhaustive-deps` 规则必须开启
3. **避免 Effect 链**：不要用一个 `useEffect` 的结果触发另一个 `useEffect`，这通常意味着数据流设计有问题

---

## 四、状态派生模式

React 中很多"看似需要 useEffect"的场景，实际上应该用**状态派生**解决。

### 决策树

```
这个值需要从其他状态计算出来？
├── 是 → 计算开销大吗？
│   ├── 是 → useMemo
│   └── 否 → 直接派生（普通变量）
│
└── 否 → 这个值需要异步获取吗？
    ├── 是 → useEffect + useState（或 TanStack Query）
    └── 否 → useState
```

### 直接派生（首选）

```tsx
// ✅ 直接派生：不需要 useEffect
function CartSummary({ items }: { items: CartItem[] }) {
  // 直接从 props 计算，无需额外 state
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.length
  const hasDiscount = totalPrice > 100

  return (
    <div>
      总计: ¥{totalPrice} ({itemCount} 件{hasDiscount ? '，已享折扣' : ''})
    </div>
  )
}
```

### useMemo（计算开销大时使用）

```tsx
// ✅ useMemo：排序 + 过滤大量数据
function ProductList({ products, filter, sortBy }: ProductListProps) {
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.category === filter)
      .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))
  }, [products, filter, sortBy])

  return (
    <ul>
      {filteredProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

### 常见错误：用 useEffect 同步状态

```tsx
// ❌ 反模式：用 useEffect 把 props 同步到 state
function FilteredList({ items, keyword }: Props) {
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setFiltered(items.filter((i) => i.name.includes(keyword)))
  }, [items, keyword]) // 多了一次不必要的渲染

  return <List data={filtered} />
}

// ✅ 正确：直接派生
function FilteredList({ items, keyword }: Props) {
  const filtered = useMemo(() => items.filter((i) => i.name.includes(keyword)), [items, keyword])

  return <List data={filtered} />
}
```

---

## 五、Hook 与 Context 协作模式

Context 是 React 内置的依赖注入机制。结合自定义 Hook，可以构建清晰的依赖注入架构。

### Provider + Hook 模式

```tsx
// ── 1. 定义 Context 和 Provider ──
interface AuthContextValue {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (credentials: Credentials) => {
    const user = await authApi.login(credentials)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// ── 2. 封装消费 Hook（带安全检查） ──
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }
  return context
}

// ── 3. 在组件中使用 ──
function LoginPage() {
  const { login, user } = useAuth()
  // 直接使用，无需关心数据从哪来
}
```

### 多 Provider 组合

```tsx
// 应用根组件：组合多个 Provider
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router}>
            <MainLayout />
          </RouterProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

### Context 拆分原则

| 原则                     | 说明                                    |
| ------------------------ | --------------------------------------- |
| **按领域拆分**           | Auth、Theme、Cart 各自独立 Context      |
| **按变更频率拆分**       | 频繁变化的状态不要和不常变化的放一起    |
| **避免单一巨型 Context** | 一个 Context 变化会导致所有消费者重渲染 |

---

## 六、性能优化 Hook 模式

### useCallback 的正确使用时机

`useCallback` 不是免费的，它有记忆化开销。只在以下场景使用：

```tsx
// ✅ 场景 1：函数作为 Props 传给 React.memo 子组件
const MemoizedChild = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  // 不用 useCallback 的话，每次渲染都会创建新函数，导致子组件重渲染
  const handleClick = useCallback(() => {
    // ...
  }, [])

  return <MemoizedChild onClick={handleClick} />
}

// ✅ 场景 2：函数作为其他 Hook 的依赖
function useDataLoader(userId: string) {
  const fetchUser = useCallback(() => {
    return api.getUser(userId)
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])
}
```

```tsx
// ❌ 不需要 useCallback 的场景
function SimpleComponent() {
  // 普通事件处理，不传给子组件，无需 useCallback
  const handleClick = () => {
    console.log('clicked')
  }

  return <button onClick={handleClick}>Click</button>
}
```

### useMemo 的性能收益判断

```tsx
// ✅ 值得 useMemo：计算量大
function ExpensiveList({ items, filter }: Props) {
  const filtered = useMemo(
    () => items.filter(/* 复杂过滤逻辑 */),
    [items, filter]
  )
  return <ul>{filtered.map(...)}</ul>
}

// ❌ 不值得 useMemo：计算 trivial
function SimpleDisplay({ name }: { name: string }) {
  // 字符串拼接不需要 useMemo
  const displayName = `${name} (verified)`
  return <span>{displayName}</span>
}
```

---

## 七、常见反模式

### 反模式 1：useEffect 滥用

用 `useEffect` 处理可以用派生状态解决的问题。

```tsx
// ❌ 反模式
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ 正确
const fullName = `${firstName} ${lastName}`
```

### 反模式 2：闭包旧值陷阱

在 useEffect 或事件回调中捕获了旧的 State 值。

```tsx
// ❌ 闭包陷阱
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count) // 永远是 0！
      setCount(count + 1) // 永远设置为 1！
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 空依赖，闭包中的 count 永远是初始值 0

  return <div>{count}</div>
}

// ✅ 修复 1：使用函数式更新
setCount((prev) => prev + 1)

// ✅ 修复 2：正确声明依赖
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1)
  }, 1000)
  return () => clearInterval(timer)
}, []) // 使用函数式更新后，不需要依赖 count
```

### 反模式 3：在循环或条件语句中使用 Hook

```tsx
// ❌ 违反 Hook 规则
function Component({ showExtra }: Props) {
  const [count, setCount] = useState(0)
  if (showExtra) {
    const [extra, setExtra] = useState(0) // 违反规则！
  }
}

// ✅ 始终在顶层调用
function Component({ showExtra }: Props) {
  const [count, setCount] = useState(0)
  const [extra, setExtra] = useState(0)
  // 条件逻辑放在 Hook 之后的代码中
  if (!showExtra) return <div>{count}</div>
  return (
    <div>
      {count} + {extra}
    </div>
  )
}
```

### 反模式 4：Hook 中直接修改引用类型

```tsx
// ❌ 直接修改：React 无法检测到变化，不会触发重渲染
function useBrokenState() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 })

  const updateName = (name: string) => {
    user.name = name // 直接修改对象属性
    setUser(user) // 引用没变，不会触发渲染
  }

  return { user, updateName }
}

// ✅ 返回新对象
function useCorrectState() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 })

  const updateName = (name: string) => {
    setUser((prev) => ({ ...prev, name })) // 创建新对象
  }

  return { user, updateName }
}
```

---

## 八、Hook 设计速查表

| 场景                  | 推荐方案                                             |
| --------------------- | ---------------------------------------------------- |
| 从 Props/State 计算值 | 直接派生 或 useMemo                                  |
| 异步数据获取          | TanStack Query（优先）或 useEffect + AbortController |
| 跨组件共享状态        | Context + Provider + 消费 Hook                       |
| 全局复杂状态          | Zustand / Redux Toolkit                              |
| DOM 操作              | useRef                                               |
| 防抖/节流             | useDebounce / useThrottle 自定义 Hook                |
| 事件监听              | useEffect + addEventListener + 清理                  |
| 组件卸载清理          | useEffect return cleanup function                    |
| 性能优化              | useMemo（计算密集）/ useCallback（传给 memo 子组件） |
