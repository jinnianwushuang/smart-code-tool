---
title: React 组件设计模式
order: 10
---

# React 组件设计模式

React 组件设计模式是构建可维护、可复用、可测试 UI 系统的核心方法论。与 Vue 的模板 + 选项式 API 不同，React 将 UI 完全交给 JavaScript/TypeScript 表达，这使得组件模式的选择更加灵活，也更加考验架构设计能力。

本文从**工程实践**角度，系统梳理 React 中最常用的组件设计模式、适用场景与决策依据。

---

## 一、容器/展示组件分离模式（Container / Presentational）

这是 React 最经典的架构分层模式，由 Dan Abramov 在 2015 年提出，至今仍是大型项目的基础架构原则。

### 核心思想

将组件按职责分为两类：

| 维度               | 容器组件（Container）        | 展示组件（Presentational）  |
| ------------------ | ---------------------------- | --------------------------- |
| **职责**           | 管理状态、处理逻辑、发起请求 | 纯 UI 渲染、接收 Props 展示 |
| **是否知道数据源** | 是，连接 Store / API         | 否，只通过 Props 接收       |
| **可复用性**       | 低，与业务强绑定             | 高，纯 UI 无关业务          |
| **测试难度**       | 需要 Mock 数据               | 直接传 Props 即可测试       |

### 工程实现

```tsx
// ── 展示组件：纯 UI，无业务逻辑 ──
interface UserCardProps {
  name: string
  avatar: string
  onEdit: () => void
}

export function UserCard({ name, avatar, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <button onClick={onEdit}>编辑</button>
    </div>
  )
}

// ── 容器组件：连接数据源，处理业务 ──
export function UserCardContainer({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId)
  const navigate = useNavigate()

  if (isLoading) return <Skeleton />

  return (
    <UserCard
      name={user.name}
      avatar={user.avatar}
      onEdit={() => navigate(`/users/${userId}/edit`)}
    />
  )
}
```

### 何时使用

- 组件需要连接多个数据源（API、Store、路由）
- 同一 UI 需要被多个不同数据源复用
- 团队需要清晰分离"关注点"

### 何时避免

- 简单组件（状态和 UI 紧密耦合，强行拆分会增加无谓复杂度）
- 使用 Hooks 后，逻辑可以在自定义 Hook 中复用，容器/展示的边界变得模糊

---

## 二、高阶组件模式（HOC）

高阶组件（Higher-Order Component）是一个函数，接收一个组件并返回一个新的增强组件。这是 React 早期（Hooks 之前）最主要的逻辑复用模式。

### 核心思想

```tsx
// HOC 签名
function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    return <WrappedComponent {...props} />
  }
}

// 使用
const ProtectedDashboard = withAuth(Dashboard)
```

### HOC 的核心应用场景

| 场景           | 说明                          |
| -------------- | ----------------------------- |
| **权限守卫**   | 统一拦截未登录/无权限用户     |
| **数据预加载** | 组件挂载前确保数据已就绪      |
| **主题注入**   | 将 Theme 对象注入到任意组件   |
| **埋点包装**   | 统一处理曝光/点击事件上报     |
| **错误边界**   | 包裹组件提供统一的错误兜底 UI |

### HOC 的问题与替代

HOC 存在以下已知问题，在现代 React 项目中应谨慎使用：

1. **嵌套地狱**：多个 HOC 包裹后，Props 来源不清晰

   ```tsx
   // 难以追踪 props 到底从哪来
   export default withTheme(withAuth(withLogging(withLoading(MyComponent)))
   ```

2. **命名冲突**：多个 HOC 向 Props 注入同名字段时互相覆盖

3. **TypeScript 推导复杂**：泛型 HOC 的类型推导经常出错

**现代替代方案**：自定义 Hook 可以解决 90% 的 HOC 场景，且更直观、类型更友好。

```tsx
// HOC 方式 ❌
const Enhanced = withAuth(withTheme(MyComponent))

// Hook 方式 ✅
function MyComponent() {
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()
  // 逻辑清晰，来源明确
}
```

---

## 三、Render Props 模式

Render Props 是将渲染逻辑作为 Props 传递的函数，由调用方决定如何渲染。

### 核心思想

```tsx
// ── 定义：接受 render 函数 ──
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return <>{render(pos)}</>
}

// ── 使用：调用方决定渲染方式 ──
;<MouseTracker
  render={({ x, y }) => (
    <div>
      Mouse at: {x}, {y}
    </div>
  )}
/>
```

### Render Props vs HOC

| 维度                  | HOC              | Render Props             |
| --------------------- | ---------------- | ------------------------ |
| **Props 来源透明度**  | 低（隐式注入）   | 高（显式接收参数）       |
| **嵌套复杂度**        | 高（多层包裹）   | 低（函数嵌套可读性尚可） |
| **TypeScript 友好度** | 中（泛型复杂）   | 高（函数签名清晰）       |
| **JSX 可读性**        | 好（组件名直观） | 中（嵌套函数降低可读性） |

### 何时使用

- 需要让调用方**完全控制**渲染输出
- 封装复杂的交互逻辑（拖拽、滚动、手势），将状态暴露给外部

---

## 四、复合组件模式（Compound Components）

复合组件是 React 中最优雅的组件 API 设计模式。多个组件协同工作，共享隐式状态，同时保持灵活的组合能力。

### 核心思想

以 Select 组件为例：

```tsx
// ── 使用方式 ──
<Select defaultValue="apple">
  <SelectTrigger>
    <SelectValue placeholder="选择水果" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">苹果</SelectItem>
    <SelectItem value="banana">香蕉</SelectItem>
    <SelectItem value="orange">橙子</SelectItem>
  </SelectContent>
</Select>
```

### 实现原理

通过 React Context 在父组件中创建共享状态，子组件通过 `useContext` 消费：

```tsx
// ── 创建 Context ──
interface SelectContextValue {
  value: string
  onChange: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('必须在 <Select> 内部使用')
  return ctx
}

// ── 根组件：提供状态 ──
interface SelectProps {
  defaultValue: string
  children: React.ReactNode
}

function Select({ defaultValue, children }: SelectProps) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onChange: setValue, open, setOpen }}>
      <div className="select-wrapper">{children}</div>
    </SelectContext.Provider>
  )
}

// ── 子组件：消费状态 ──
function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useSelectContext()
  const isSelected = ctx.value === value

  return (
    <div
      className={`select-item ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        ctx.onChange(value)
        ctx.setOpen(false)
      }}
    >
      {children}
    </div>
  )
}
```

### 复合组件的核心优势

| 优势             | 说明                                        |
| ---------------- | ------------------------------------------- |
| **API 灵活性**   | 调用方可自由组合子组件，不受固定 Props 约束 |
| **隐式状态共享** | 无需手动传递 Props，Context 自动穿透        |
| **语义化 JSX**   | 组件名即文档，结构一目了然                  |
| **可扩展性**     | 新增子组件不影响现有 API                    |

### 典型应用场景

- 表单组件（Form / FormField / FormLabel / FormInput / FormError）
- 对话框/弹窗（Dialog / DialogHeader / DialogBody / DialogFooter）
- 标签页（Tabs / TabsList / TabsTrigger / TabsContent）
- 下拉菜单（DropdownMenu / DropdownMenuItem / DropdownMenuSeparator）

---

## 五、受控/非受控组件模式（Control Props）

React 组件的状态管理有两种基本范式：受控（Controlled）和非受控（Uncontrolled）。优秀的组件库通常同时支持两种模式。

### 受控组件

组件的值完全由外部 Props 控制，组件本身不维护内部状态。

```tsx
// 父组件完全掌控状态
function Parent() {
  const [value, setValue] = useState('')
  return <Input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

### 非受控组件

组件内部维护自己的状态，外部只在初始化时传入默认值。

```tsx
// 组件内部管理状态
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log(inputRef.current?.value) // 直接读取 DOM
  }

  return <input ref={inputRef} defaultValue="" />
}
```

### 双模式组件设计

成熟的组件库（如 Radix UI、shadcn/ui）通常通过 **Control Props 模式** 同时支持两种用法：

```tsx
interface InputProps {
  value?: string // 受控模式
  defaultValue?: string // 非受控模式
  onChange?: (value: string) => void
}

function Input({ value, defaultValue, onChange }: InputProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

### 模式选择决策

| 场景                   | 推荐模式     |
| ---------------------- | ------------ |
| 表单校验需要实时响应   | 受控         |
| 简单输入、无需实时响应 | 非受控       |
| 组件库设计             | 同时支持两种 |
| 性能敏感（大量输入框） | 非受控 + ref |

---

## 六、插槽组合模式（Slot Composition）

Vue 开发者熟悉 `<slot>` 的概念。React 没有原生插槽语法，但通过 `children` 和具名 Props 可以实现等价甚至更灵活的效果。

### 默认插槽：children

```tsx
// ── 组件定义 ──
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>
}

// ── 使用 ──
;<Card>
  <h2>标题</h2>
  <p>内容</p>
</Card>
```

### 具名插槽：Props 传递 ReactNode

```tsx
// ── 组件定义 ──
interface LayoutProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode // 默认插槽
  footer?: React.ReactNode
}

function Layout({ header, sidebar, children, footer }: LayoutProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  )
}

// ── 使用 ──
;<Layout header={<NavBar />} sidebar={<SideMenu />} footer={<Copyright />}>
  <PageContent />
</Layout>
```

### 作用域插槽：Render Props

```tsx
// ── 组件定义（向外部暴露内部状态） ──
interface DataTableProps<T> {
  data: T[]
  renderRow: (item: T, index: number) => React.ReactNode
}

function DataTable<T>({ data, renderRow }: DataTableProps<T>) {
  return (
    <table>
      <tbody>{data.map((item, i) => renderRow(item, i))}</tbody>
    </table>
  )
}

// ── 使用（调用方控制每行如何渲染，同时能访问 item 数据） ──
;<DataTable
  data={users}
  renderRow={(user, i) => (
    <tr key={i}>
      <td>{user.name}</td>
      <td>{user.email}</td>
    </tr>
  )}
/>
```

### Vue Slot vs React 对照表

| Vue 概念                             | React 等价实现                                  |
| ------------------------------------ | ----------------------------------------------- |
| `<slot />`                           | `{children}`                                    |
| `<slot name="header" />`             | `header?: ReactNode` (Props)                    |
| `<slot :data="item" />` (作用域插槽) | `render: (data: T) => ReactNode` (Render Props) |
| `<template #header>`                 | 直接传 JSX 给对应 Props                         |

---

## 七、模式选择决策树

在实际项目中，面对一个组件设计需求，应该如何选择模式？以下是决策路径：

```
需要复用逻辑（非 UI）？
├── 是 → 自定义 Hook（优先）
│   └── 需要注入 UI 增强？→ HOC（谨慎使用）
│
└── 否 → 需要复用 UI 结构？
    ├── 是 → 组件组合
    │   ├── 调用方需要控制子元素排列？→ 复合组件模式
    │   ├── 固定布局结构？→ 容器/展示模式
    │   └── 需要灵活插槽？→ Slot Composition
    │
    └── 否 → 单组件设计
        ├── 需要外部控制值？→ 受控模式
        ├── 内部管理状态？→ 非受控模式
        └── 组件库？→ 同时支持受控/非受控
```

---

## 八、模式组合：真实项目中的综合应用

一个成熟的 React 项目通常同时使用多种模式。以下是一个后台管理系统的典型架构：

```tsx
// ── 复合组件 + 受控模式 ──
<DataTable
  data={users}
  pagination={{ page, pageSize, onChange: setPage }}
>
  <DataTable.Column header="姓名" accessor="name" />
  <DataTable.Column header="邮箱" accessor="email" />
  <DataTable.Column
    header="操作"
    renderCell={(user) => (
      <Button onClick={() => handleDelete(user.id)}>删除</Button>
    )}
  />
</DataTable>

// ── 容器/展示分离 + Slot Composition ──
<PageContainer title="用户管理">
  <PageContainer.Toolbar>
    <SearchInput value={search} onChange={setSearch} />
    <Button onClick={handleExport}>导出</Button>
  </PageContainer.Toolbar>

  <UserTable data={filteredUsers} />
</PageContainer>
```

---

## 九、反模式警示

### 反模式 1：God Component（上帝组件）

一个组件承担过多职责，超过 300 行，难以理解和维护。

```tsx
// ❌ 反模式：一个组件处理数据获取、状态管理、UI 渲染、表单校验
function UserManagementPage() {
  // 200+ 行代码...
}
```

**修复**：拆分为容器组件 + 展示组件 + 自定义 Hook。

### 反模式 2：Prop Drilling（属性钻透）

Props 层层传递超过 3 层，中间组件仅做透传。

```tsx
// ❌ 反模式：props 穿过 4 层组件
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>
```

**修复**：使用 Context 或状态管理库，让数据直接到达目标组件。

### 反模式 3：useEffect 驱动状态同步

用 `useEffect` 在 Props 变化时更新 State，导致多余渲染。

```tsx
// ❌ 反模式
function Component({ userId }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
}

// ✅ 正确：使用自定义 Hook 或 TanStack Query
function Component({ userId }) {
  const { data: user } = useUser(userId)
}
```

---

## 总结

| 模式             | 核心价值             | 适用规模 |
| ---------------- | -------------------- | -------- |
| 容器/展示        | 关注点分离           | 中大型   |
| HOC              | 逻辑增强（谨慎使用） | 中型     |
| Render Props     | 渲染权委托           | 中型     |
| 复合组件         | 灵活 API + 隐式状态  | 组件库   |
| 受控/非受控      | 状态控制权选择       | 所有规模 |
| Slot Composition | 内容插槽灵活组合     | 所有规模 |

React 组件设计的核心心法是**组合优于继承**：优先使用 Props + children + Hook 的组合方式，而非继承或 HOC 包裹。
