---
title: React 状态管理架构
order: 30
---

# React 状态管理架构

React 的状态管理是架构设计中最关键的决策之一。与 Vue 内置 Pinia 不同，React 生态提供了从轻量到重量级的多种方案，选型不当会直接影响项目的可维护性和开发效率。

本文从**架构选型**和**工程化实践**角度出发，系统梳理 React 状态管理的分类体系、方案选型与集成模式。

---

## 一、React 状态分类体系

在选型之前，首先要明确"状态"并不是一个单一概念。按来源和生命周期，React 中的状态可以分为四类：

| 状态类型         | 说明                   | 典型示例                 | 推荐管理方式      |
| ---------------- | ---------------------- | ------------------------ | ----------------- |
| **服务端状态**   | 来自后端 API 的数据    | 用户列表、订单详情       | TanStack Query    |
| **全局 UI 状态** | 跨组件共享的 UI 状态   | 主题、侧边栏折叠、登录态 | Zustand / Context |
| **组件状态**     | 单个组件内部的局部状态 | 表单输入、弹窗开关       | useState          |
| **URL 状态**     | 路由参数、查询字符串   | 分页、筛选条件           | React Router      |

### 核心原则

> **不要把所有状态都塞进全局 Store。**

大多数应用 80% 的状态应该是组件状态或服务端状态，只有真正需要跨组件共享的 UI 状态才需要放入全局 Store。

```
状态占比建议：
├── 服务端状态：~50%（TanStack Query 管理）
├── 组件状态：  ~30%（useState 管理）
├── URL 状态：  ~10%（Router 管理）
└── 全局 UI：   ~10%（Zustand / Context 管理）
```

---

## 二、方案选型决策矩阵

### 全方案对比

| 方案              | 包体积 | 学习成本 | 模板代码         | DevTools       | 中间件 | 适用规模         |
| ----------------- | ------ | -------- | ---------------- | -------------- | ------ | ---------------- |
| **useState**      | 0      | 极低     | 无               | React DevTools | 无     | 组件级           |
| **useReducer**    | 0      | 低       | 中               | React DevTools | 无     | 组件级复杂逻辑   |
| **Context**       | 0      | 低       | 中               | React DevTools | 无     | 小型全局状态     |
| **Zustand**       | ~1KB   | 低       | 极少             | 需插件         | 丰富   | 中大型全局状态   |
| **Jotai**         | ~2KB   | 中       | 少               | 需插件         | 有限   | 原子化细粒度状态 |
| **Redux Toolkit** | ~10KB  | 高       | 多（已大幅简化） | 官方 DevTools  | 丰富   | 大型企业级       |
| **MobX**          | ~16KB  | 中       | 少               | 需插件         | 有限   | 响应式偏好团队   |

### 选型决策树

```
你的状态是什么类型？
│
├── 服务端数据（API 返回）
│   └── 使用 TanStack Query（不在本文范围，见第六节概述）
│
├── URL 参数（路由/查询字符串）
│   └── 使用 React Router 的 useParams / useSearchParams
│
├── 组件内部状态
│   ├── 简单值（boolean, string, number）→ useState
│   └── 复杂状态机（多字段联动）→ useReducer
│
└── 跨组件共享状态
    ├── 变化不频繁（主题、语言、用户信息）→ Context
    ├── 变化频繁 + 需要性能优化 → Zustand
    ├── 大量独立原子状态 → Jotai
    └── 企业级 + 需要严格规范 + 时间旅行调试 → Redux Toolkit
```

---

## 三、Zustand 工程化实践

Zustand 是目前 React 生态中最受欢迎的状态管理方案。它以极简 API、零样板代码和优秀的 TypeScript 支持著称，被称为"React 版的 Pinia"。

### 基础 Store 定义

```tsx
// stores/useAuthStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,

        // Actions
        login: async (credentials) => {
          const { user, token } = await authApi.login(credentials)
          set({ user, token, isAuthenticated: true })
        },

        logout: () => {
          authApi.logout()
          set({ user: null, token: null, isAuthenticated: false })
        },

        setUser: (user) => set({ user }),
      }),
      { name: 'auth-storage' }, // localStorage 持久化
    ),
  ),
)
```

### Store 分层设计

大型项目中，将所有状态放在一个 Store 会导致维护困难。推荐按业务领域拆分：

```
stores/
├── useAuthStore.ts       # 认证状态（用户、Token、权限）
├── useCartStore.ts       # 购物车状态
├── useUIStore.ts         # UI 状态（侧边栏、弹窗、主题）
├── useNotificationStore.ts # 通知/消息状态
└── index.ts              # 统一导出
```

### 性能优化：选择器

Zustand 的核心优势之一是**选择器级别的精细订阅**，只有选中字段变化时才触发重渲染：

```tsx
function Header() {
  // ✅ 只订阅 user，token 变化不会导致重渲染
  const user = useAuthStore((state) => state.user)
  return <span>{user?.name}</span>
}

function LogoutButton() {
  // ✅ 只订阅 logout action
  const logout = useAuthStore((state) => state.logout)
  return <button onClick={logout}>退出</button>
}

// ✅ 使用 shallow 比较避免对象引用变化导致的多余渲染
import { useShallow } from 'zustand/react/shallow'

function UserProfile() {
  const { user, setUser } = useAuthStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser })),
  )
}
```

### 中间件体系

| 中间件     | 用途                          |
| ---------- | ----------------------------- |
| `devtools` | 连接 Redux DevTools 调试      |
| `persist`  | 状态持久化到 localStorage     |
| `immer`    | 支持"可变"风格的状态更新      |
| `combine`  | 简化初始状态和 Actions 的定义 |

```tsx
// immer 中间件：适合复杂嵌套状态
import { immer } from 'zustand/middleware/immer'

const useCartStore = create(
  immer((set) => ({
    items: [],
    addItem: (product: Product) =>
      set((state) => {
        const existing = state.items.find((i) => i.id === product.id)
        if (existing) {
          existing.quantity += 1 // immer 允许直接修改
        } else {
          state.items.push({ ...product, quantity: 1 })
        }
      }),
  })),
)
```

---

## 四、Redux Toolkit 工程化实践

Redux Toolkit（RTK）是 Redux 官方推荐的现代开发方式，大幅简化了传统 Redux 的样板代码。适合需要严格规范、强类型和高级调试能力的大型企业项目。

### Slice 设计模式

```tsx
// features/counter/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
  status: 'idle' | 'loading' | 'failed'
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1 // RTK 内置 immer，可直接修改
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

### 异步逻辑：createAsyncThunk

```tsx
// features/users/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface UsersState {
  list: User[]
  loading: boolean
  error: string | null
}

// 异步 Thunk
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.getUsers()
    return response.data
  } catch (err) {
    return rejectWithValue('获取用户列表失败')
  }
})

export const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})
```

### RTK Query：内置数据获取方案

RTK Query 是 Redux Toolkit 内置的数据获取和缓存方案，功能类似 TanStack Query：

```tsx
// api/pokemonApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  tagTypes: ['Pokemon'],
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
      providesTags: (_, __, name) => [{ type: 'Pokemon', id: name }],
    }),
    getAllPokemon: builder.query<Pokemon[], number>({
      query: (limit = 20) => `pokemon?limit=${limit}`,
      providesTags: ['Pokemon'],
    }),
  }),
})

export const { useGetPokemonByNameQuery, useGetAllPokemonQuery } = pokemonApi
```

### 何时选择 Redux Toolkit

| 场景                               | 推荐          |
| ---------------------------------- | ------------- |
| 中大型项目，团队 > 10 人           | Redux Toolkit |
| 需要严格的状态管理规范             | Redux Toolkit |
| 需要时间旅行调试                   | Redux Toolkit |
| 需要复杂中间件（saga、observable） | Redux Toolkit |
| 小型项目或个人项目                 | Zustand       |
| 快速原型开发                       | Zustand       |

---

## 五、Jotai 原子状态模型

Jotai 采用**自底向上**的原子化状态管理，与 Zustand 的**自顶向下**单 Store 模式形成对比。

### 核心概念

```tsx
import { atom, useAtom } from 'jotai'

// 定义原子：每个 atom 是一个独立的状态单元
const countAtom = atom(0)
const nameAtom = atom('Alice')

// 派生原子：类似 computed
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 写入原子：自定义 setter 逻辑
const incrementAtom = atom(
  (get) => get(countAtom),
  (get, set, amount: number) => set(countAtom, get(countAtom) + amount),
)

// 组件中使用
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [doubleCount] = useAtom(doubleCountAtom)
  const [, increment] = useAtom(incrementAtom)

  return (
    <div>
      <p>
        Count: {count} (Double: {doubleCount})
      </p>
      <button onClick={() => increment(5)}>+5</button>
    </div>
  )
}
```

### Jotai vs Zustand

| 维度         | Zustand              | Jotai                  |
| ------------ | -------------------- | ---------------------- |
| **模型**     | 单 Store（自顶向下） | 原子集合（自底向上）   |
| **适用场景** | 全局状态集中管理     | 分散的细粒度状态       |
| **性能**     | 选择器优化           | 原子级精细订阅         |
| **DevTools** | Redux DevTools       | 需专用工具             |
| **学习成本** | 低                   | 中（需要理解原子组合） |
| **SSR 支持** | 需配置               | 内置 Provider 隔离     |

### Jotai 适用场景

- 大量独立的、互不关联的状态（如多个表单、多个面板）
- 需要精确控制渲染粒度（每个原子独立订阅）
- 服务端渲染需要状态隔离（每个请求独立 Provider）

---

## 六、服务端状态管理概述

服务端状态（从 API 获取的数据）不应放入全局 Store。TanStack Query 是 React 生态中管理服务端状态的最佳方案。

### 核心优势

| 能力              | 说明                                    |
| ----------------- | --------------------------------------- |
| **自动缓存**      | 请求结果自动缓存，避免重复请求          |
| **后台更新**      | 数据过期时自动在后台重新请求            |
| **乐观更新**      | 支持乐观 UI，先更新界面再等待服务器确认 |
| **分页/无限滚动** | 内置 `useInfiniteQuery` 支持            |
| **请求去重**      | 同时发起相同请求时自动去重              |

### 基础使用

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 查询
function UserList() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorDisplay error={error} />

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}

// 变更 + 缓存失效
function AddUserForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newUser: CreateUserDto) => api.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }) // 触发重新请求
    },
  })

  return <form onSubmit={(e) => mutation.mutate(formData)}>...</form>
}
```

### 与全局 Store 的协作

```tsx
// TanStack Query 管理服务端数据
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.getUser(userId),
})

// Zustand 管理 UI 状态（如选中状态）
const { selectedUserId, setSelectedUserId } = useUIStore()

// 两者互补，不重叠
```

---

## 七、状态管理迁移路径

### 从 Context 迁移到 Zustand

当 Context 管理的状态变化频繁，导致不必要的组件重渲染时，应迁移到 Zustand。

```tsx
// ── 迁移前：Context（频繁变化导致全树重渲染） ──
const CartContext = createContext<CartState>(...)

function CartProvider({ children }) {
  const [items, setItems] = useState([]) // 每次 addItem 都触发所有消费者重渲染
  return <CartContext.Provider value={{ items, setItems }}>{children}</CartContext.Provider>
}

// ── 迁移后：Zustand（精细订阅，只有真正用到 items 的组件重渲染） ──
const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))

// 只订阅 addItem 的组件不会因 items 变化重渲染
function AddButton() {
  const addItem = useCartStore((s) => s.addItem)
  return <button onClick={() => addItem(newItem)}>Add</button>
}
```

### 从 Redux 迁移到 Zustand

如果项目当前使用传统 Redux（非 Toolkit），且不需要时间旅行调试，可以考虑迁移到 Zustand。

| 迁移步骤           | 说明                                             |
| ------------------ | ------------------------------------------------ |
| 1. 识别 Store 切片 | 将 Redux 的每个 Slice 对应创建一个 Zustand Store |
| 2. 迁移 Actions    | 将 Reducer 逻辑转为 Zustand 的 set 函数          |
| 3. 迁移选择器      | 将 `useSelector` 替换为 Zustand 的选择器参数     |
| 4. 移除 Provider   | Zustand 不需要 Provider（可选添加）              |
| 5. 逐步替换        | 可以两个方案共存，逐步迁移                       |

---

## 八、架构决策速查表

| 项目特征                | 推荐方案                              |
| ----------------------- | ------------------------------------- |
| 小型项目 / 原型         | useState + Context                    |
| 中型 SPA                | Zustand + TanStack Query              |
| 大型企业应用            | Redux Toolkit + RTK Query             |
| 大量独立原子状态        | Jotai + TanStack Query                |
| 需要严格规范 + 团队协作 | Redux Toolkit                         |
| SSR 项目（Next.js）     | Zustand（配合 Provider）或 Jotai      |
| 表单密集型              | React Hook Form（不要放入全局 Store） |

---

## 九、常见误区

### 误区 1：所有状态都放全局 Store

```tsx
// ❌ 错误：表单输入也放全局
const useFormStore = create((set) => ({
  email: '',
  setEmail: (email) => set({ email }),
}))

// ✅ 正确：表单状态留在组件内部
function LoginForm() {
  const [email, setEmail] = useState('')
  // 只在提交时才与全局交互
}
```

### 误区 2：用 Context 管理频繁变化的状态

```tsx
// ❌ Context 变化会导致所有消费者重渲染
const CountContext = createContext(0)
function App() {
  const [count, setCount] = useState(0)
  return <CountContext.Provider value={count}>{/* 整棵树 */}</CountContext.Provider>
}

// ✅ 频繁变化的状态用 Zustand
const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}))
```

### 误区 3：服务端状态放入全局 Store

```tsx
// ❌ 错误：用户列表放全局 Store，手动管理 loading/error
const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true })
    try {
      const users = await api.getUsers()
      set({ users, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },
}))

// ✅ 正确：用 TanStack Query 管理服务端状态
function UserList() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  })
}
```
