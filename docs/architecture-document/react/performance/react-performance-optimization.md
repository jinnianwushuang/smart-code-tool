---
title: React 性能优化系统手册
tags: ['React', '性能优化']
---

# React 性能优化系统手册

React 性能优化是一个**系统性工程**，而非零散的技巧堆砌。本文从渲染成本控制、计算缓存、资源加载、运行时诊断四个维度，构建完整的 React 性能优化知识体系。

---

## 一、渲染成本控制

React 的核心性能问题 = **不必要的 Re-render**。控制渲染范围是第一道防线。

### 1.1 `React.memo` — 组件级缓存

```tsx
// 不加 memo：父组件任何 state 变化，子组件都重渲染
function UserCard({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  )
}

// 加 memo：props 不变则跳过渲染（Object.is 浅比较）
const UserCard = React.memo(function UserCard({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  )
})
```

**使用原则**：

| 场景                      | 是否用 memo | 原因                          |
| ------------------------- | ----------- | ----------------------------- |
| 纯展示组件，props 稳定    | ✅ 用       | 避免父组件更新导致的无效渲染  |
| 频繁接收新 props 的组件   | ❌ 不用     | 比较成本 > 渲染成本           |
| 列表中的子项组件          | ✅ 用       | 列表渲染是高频场景            |
| 组件内部有频繁 state 变化 | ❌ 不用     | 自身 state 变化不受 memo 控制 |

**自定义比较函数**（慎用，99% 场景不需要）：

```tsx
const UserCard = React.memo(
  function UserCard({ name, avatar }: Props) {
    return <div>...</div>
  },
  (prevProps, nextProps) => {
    // 返回 true 表示跳过渲染
    return prevProps.name === nextProps.name
  },
)
```

### 1.2 `useMemo` — 计算结果缓存

```tsx
function ProductList({ products, filter }: { products: Product[]; filter: string }) {
  // ❌ 每次渲染都重新计算
  const filtered = products.filter((p) => p.name.includes(filter))

  // ✅ 仅依赖变化时重算
  const filtered = useMemo(
    () => products.filter((p) => p.name.includes(filter)),
    [products, filter],
  )

  return (
    <ul>
      {filtered.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

**何时用 useMemo**：

- 计算开销大（排序、过滤、聚合大数据集）
- 计算结果作为其他 Hook 依赖或传给 `memo` 组件的 props
- 保持引用稳定以避免触发下游 `useEffect`

**何时不用**：

- 简单运算（加减乘除、字符串拼接）
- 每次都需要重算的场景
- 组件本身已经很轻量

### 1.3 `useCallback` — 函数引用稳定

```tsx
function Parent() {
  const [count, setCount] = useState(0)

  // ❌ 每次渲染创建新函数 → Child 的 memo 失效
  const handleClick = () => {
    console.log('clicked')
  }

  // ✅ 函数引用稳定 → Child 的 memo 生效
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, []) // 空依赖 = 永不变化

  return <ChildMemoized onClick={handleClick} />
}
```

**核心判断**：`useCallback` 的价值不在于「省一个函数创建」，而在于**稳定引用传递给 `memo` 子组件或 `useEffect` 依赖**。如果接收方不比较引用，`useCallback` 毫无意义。

### 1.4 状态下沉 — 最小化渲染范围

```tsx
// ❌ 问题：输入框每次按键都导致整个 ExpensiveList 重渲染
function Page() {
  const [search, setSearch] = useState('')
  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ExpensiveList />
    </div>
  )
}

// ✅ 方案：将状态下沉到需要它的组件
function Page() {
  return (
    <div>
      <SearchBar /> {/* search state 在这里 */}
      <ExpensiveList /> {/* 不受 search 影响 */}
    </div>
  )
}

function SearchBar() {
  const [search, setSearch] = useState('')
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />
}
```

---

## 二、代码分割与懒加载

### 2.1 `React.lazy` + `Suspense` — 路由级分割

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 懒加载：只在首次访问时加载
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const UserProfile = lazy(() => import('./pages/UserProfile'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 2.2 组件级分割 — 重型组件按需加载

```tsx
// 图表编辑器：ECharts 只在打开图表页时加载
const ChartEditor = lazy(() =>
  import('./components/ChartEditor').then((mod) => ({
    default: mod.ChartEditor,
  })),
)

function DocumentEditor() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      <Toolbar onInsertChart={() => setShowChart(true)} />
      <TextEditor />
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <ChartEditor />
        </Suspense>
      )}
    </div>
  )
}
```

### 2.3 预加载策略

```tsx
// 鼠标悬停时预加载，用户点击时已经就绪
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const preload = useCallback(() => {
    // 根据路由预加载对应组件
    if (to === '/settings') import('./pages/Settings')
    if (to === '/profile') import('./pages/UserProfile')
  }, [to])

  return (
    <Link to={to} onMouseEnter={preload}>
      {children}
    </Link>
  )
}
```

---

## 三、列表性能优化

### 3.1 虚拟列表 — 万级数据渲染不卡

当列表超过 100 项时，DOM 节点数量会严重影响性能。虚拟列表只渲染可视区域的节点。

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 每行预估高度
    overscan: 5, // 可视区外多渲染 5 行
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              height: `${virtualRow.size}px`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**主流虚拟列表库对比**：

| 库                        | 适用场景 | 特点                               |
| ------------------------- | -------- | ---------------------------------- |
| `@tanstack/react-virtual` | 通用     | Headless、无样式侵入、支持动态高度 |
| `react-window`            | 简单列表 | 轻量（< 10KB）、API 简单           |
| `react-virtuoso`          | 复杂列表 | 自动高度、分组、无限滚动           |

### 3.2 key 的正确使用

```tsx
// ❌ 用 index 做 key：排序/删除/插入时导致错误复用
{
  items.map((item, index) => <Item key={index} data={item} />)
}

// ✅ 用唯一 ID 做 key：精确复用 DOM
{
  items.map((item) => <Item key={item.id} data={item} />)
}
```

**何时可以用 index**：列表不会重排序、不会插入/删除（纯静态展示）。

---

## 四、状态管理性能模式

### 4.1 选择器精确订阅

```tsx
// ❌ 订阅整个 store → 任何字段变化都触发渲染
const { user, settings, notifications } = useStore()

// ✅ 精确订阅 → 只订阅需要的字段
const user = useStore((state) => state.user)
const settings = useStore((state) => state.settings)

// ✅ 浅比较选择器（Zustand 推荐）
import { useShallow } from 'zustand/react/shallow'
const { user, settings } = useStore(
  useShallow((state) => ({ user: state.user, settings: state.settings })),
)
```

### 4.2 状态分片 — 按更新频率拆分

```tsx
// ❌ 所有状态放一个 store
const useAppStore = create((set) => ({
  user: null, // 低频：登录时更新
  theme: 'light', // 低频：切换主题时
  mousePos: { x: 0, y: 0 }, // 高频：每次鼠标移动
  formData: {}, // 中频：每次输入
}))

// ✅ 按频率拆分
const useUserStore = create(/* user: 低频 */)
const useThemeStore = create(/* theme: 低频 */)
const useMouseStore = create(/* mousePos: 高频 */)
const useFormStore = create(/* formData: 中频 */)
```

### 4.3 事件总线解耦高频更新

对于极高频更新（鼠标追踪、实时波形），绕过 React 渲染树：

```tsx
import mitt from 'mitt'

const emitter = mitt()

// 发布方：每帧推送
requestAnimationFrame(function tick() {
  emitter.emit('mouse', { x: e.clientX, y: e.clientY })
  requestAnimationFrame(tick)
})

// 消费方：useSyncExternalStore 精确订阅
function useMousePosition() {
  const pos = useSyncExternalStore(
    (cb) => {
      emitter.on('mouse', cb)
      return () => emitter.off('mouse', cb)
    },
    () => mouseRef.current,
    () => mouseRef.current,
  )
  return pos
}
```

---

## 五、React Profiler 诊断实战

### 5.1 Profiler 组件 — 代码级性能度量

```tsx
import { Profiler } from 'react'

function onRender(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
) {
  console.log(
    `[${phase}] ${id}: 实际 ${actualDuration.toFixed(1)}ms, 预估 ${baseDuration.toFixed(1)}ms`,
  )
}

;<Profiler id="Dashboard" onRender={onRender}>
  <Dashboard />
</Profiler>
```

### 5.2 React DevTools Profiler

操作步骤：

1. 打开 React DevTools → Profiler 面板
2. 点击「录制」→ 执行目标操作（如输入搜索、点击按钮）
3. 停止录制 → 查看火焰图

**火焰图关键指标**：

| 颜色    | 含义                | 行动     |
| ------- | ------------------- | -------- |
| 🟩 绿色 | 渲染耗时短          | 正常     |
| 🟨 黄色 | 渲染耗时中等        | 可优化   |
| 🟥 红色 | 渲染耗时长          | 必须优化 |
| ⬛ 灰色 | 未渲染（memo 跳过） | 符合预期 |

### 5.3 性能诊断决策树

```
页面卡顿 / 交互延迟
├── 单组件渲染慢？
│   ├── 是 → 检查该组件的 props 变化频率 → useMemo/useCallback
│   └── 否 → 继续
├── 父组件更新导致子树重渲染？
│   ├── 是 → React.memo + 稳定 props
│   └── 否 → 继续
├── Context 更新导致大范围渲染？
│   ├── 是 → 拆分 Context / 使用 useMemo 包裹 value
│   └── 否 → 继续
├── 列表渲染 DOM 过多？
│   ├── 是 → 虚拟列表
│   └── 否 → 继续
├── 首屏加载慢？
│   └── 是 → 代码分割 + lazy + Suspense
└── 高频事件（鼠标/滚动）？
    └── 是 → useSyncExternalStore + 节流
```

---

## 六、性能优化速查表

| 优化手段               | 适用场景               | 收益                  | 成本               |
| ---------------------- | ---------------------- | --------------------- | ------------------ |
| `React.memo`           | 纯展示组件、列表子项   | 跳过不必要的渲染      | 低（加一层包裹）   |
| `useMemo`              | 大数据过滤/排序/聚合   | 避免重复计算          | 低（包裹计算逻辑） |
| `useCallback`          | 传给 memo 子组件的回调 | 稳定引用，配合 memo   | 低                 |
| 状态下沉               | 局部 state 影响大范围  | 缩小渲染范围          | 中（组件拆分）     |
| `React.lazy`           | 路由/重型组件          | 减少首屏 JS 体积      | 低                 |
| 虚拟列表               | 100+ 项列表            | DOM 节点从 N 降到 ~20 | 中（引入库）       |
| 选择器精确订阅         | Zustand/Redux          | 减少无关更新          | 低                 |
| 状态分频               | 多频率状态混合         | 隔离高频更新          | 中（拆分 store）   |
| `useSyncExternalStore` | 极高频外部数据源       | 绕过 React 渲染树     | 高（需理解机制）   |

---

## 七、常见误区

### 误区 1：到处用 `useMemo` / `useCallback`

`useMemo` 本身有成本（依赖比较 + 缓存分配）。简单计算直接算比缓存更快：

```tsx
// ❌ 过度优化
const fullName = useMemo(() => `${first} ${last}`, [first, last])

// ✅ 简单拼接直接算
const fullName = `${first} ${last}`
```

### 误区 2：用 `React.memo` 包裹一切

如果组件的 props 每次渲染都不同（如内联对象），`memo` 的比较成本 > 渲染成本：

```tsx
// ❌ memo 无效：每次都是新对象
<MemoChild style={{ color: 'red' }} />

// ✅ 提取到外部常量
const STYLE = { color: 'red' }
<MemoChild style={STYLE} />
```

### 误区 3：先优化，后测量

**永远先 Profiler，后优化**。没有数据的优化是猜测：

1. 用 React DevTools Profiler 找到真正的瓶颈
2. 确认组件渲染次数和耗时
3. 针对性优化
4. 再次测量验证效果
