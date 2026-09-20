# React 19 大型深层对象的代码组织：zustand + selector + Immer 分频治理

> React 项目的性能问题，本质上是"不必要的 Re-render"问题。当大型深层对象（仪表盘配置、实时数据面板、编辑器状态）中的不同数据区域以不同频率更新时，如果把它们放在同一个 `useState` / `useReducer` / `Context` 中，高频更新会不断触发整棵组件树的重渲染——即使只有某个叶子节点需要刷新。本文提出 React 19 中的**分频治理范式**：**用 zustand 承载全局状态，用 selector 实现细粒度订阅隔离，用 Immer 简化不可变更新**——三件套协同，构建与 Vue shallowRef + computed 等价但更符合 React 心智模型的高性能代码组织。

---

## 一、问题的本质：React 渲染模型下大型深层对象的困境

### 1.1 React 与 Vue 的根本差异

Vue 的响应式系统是"精确追踪"——只有读取了变化数据的组件才会重渲染。React 的渲染模型是"函数重执行"——**父组件 setState 触发后，所有子组件的函数都会重新执行**，除非显式用 `React.memo` 阻断。

```
┌─────────────────────────────────────────────────────────────────────┐
│                  React vs Vue：大型对象更新的传播差异                    │
│                                                                     │
│  Vue 3（精确追踪）：                                                 │
│  shallowRef.value = newData                                         │
│  → 只有读取了该 shallowRef 的组件收到通知                            │
│  → 其他组件完全不受影响                                              │
│  → 默认精确更新                                                      │
│                                                                     │
│  React（函数重执行）：                                                │
│  setState(newState)                                                  │
│  → 当前组件函数重新执行                                              │
│  → 所有子组件函数也重新执行（除非 memo 阻断）                        │
│  → 默认全量重跑，需要主动优化                                        │
│                                                                     │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                     │
│  这意味着：                                                           │
│  • Vue 中"一个 reactive 管所有"只是性能差（深度追踪开销大）          │
│  • React 中"一个 useState 管所有"是灾难（整棵子树重渲染）            │
│  • React 必须从架构层面解决"谁能收到通知"的问题                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 大型深层对象在 React 中的三种反模式

```javascript
// ❌ 反模式一：useState 管理大型对象
function Dashboard() {
  const [state, setState] = useState({
    config: { theme: 'dark', layout: 'grid' /* ...15 个字段 */ },
    stats: { totalRequests: 0, avgResponseTime: 0 /* ...20 个字段 */ },
    realtime: { cpu: 0, memory: 0, network: {} /* ...30 个字段 */ },
  })

  // 问题：任何 setState → 整个 Dashboard 重渲染 → 所有子组件重渲染
  // 即使只改了 realtime.cpu，config 相关的子组件也被迫重跑
}

// ❌ 反模式二：Context 管理大型对象
const DashboardContext = createContext()

function DashboardProvider({ children }) {
  const [state, setState] = useState({ config: {}, stats: {}, realtime: {} })
  return <DashboardContext.Provider value={state}>{children}</DashboardContext.Provider>
}

// 问题：state 任何变化 → Provider 重渲染 → 所有 Consumer 重渲染
// Context 没有"选择性订阅"机制，所有消费者收到整个对象

// ❌ 反模式三：多个 useState 散落各处
function Dashboard() {
  const [config, setConfig] = useState({})
  const [stats, setStats] = useState({})
  const [realtime, setRealtime] = useState({})
  // 问题：三个独立 state 无法跨组件共享
  // 如果 CpuChart 需要 config + realtime，必须提升到父组件
  // 提升后又回到了反模式一的问题
}
```

### 1.3 核心洞察：React 需要"外部 Store + 选择性订阅"

```
┌─────────────────────────────────────────────────────────────────┐
│                  React 大型对象治理的核心思路                        │
│                                                                  │
│  Vue 的解法：                                                    │
│  shallowRef → 响应式系统自动精确追踪 → computed 终端消费          │
│  → 框架帮你做了"谁该更新"的判断                                  │
│                                                                  │
│  React 的解法：                                                   │
│  zustand（外部 Store）→ selector（选择性订阅）→ Immer（不可变更新）│
│  → 开发者显式声明"我只关心哪部分" → Store 精确判断"你是否需要更新"│
│                                                                  │
│  关键差异：                                                       │
│  • Vue 是"框架帮你追踪"（自动但不够灵活）                        │
│  • React 是"你自己声明订阅"（手动但完全可控）                    │
│  • zustand 的 selector 就是 React 世界对 Vue 依赖追踪的等价替代  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、三件套架构：zustand + selector + Immer

### 2.1 zustand：外部 Store，脱离 React 渲染树

zustand 的核心优势是**Store 在 React 组件树之外**——状态变更不经过 React 的渲染调度，而是由 zustand 自己决定通知哪些订阅者。

```javascript
// ═══════════════════════════════════════════════════════════════
// stores/dashboard-store.js — zustand Store 定义
// ═══════════════════════════════════════════════════════════════
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useDashboardStore = create(
  immer((set, get) => ({
    // ── 低频区域：页面配置 ──
    config: {
      theme: 'dark',
      layout: 'grid',
      chartTypes: { cpu: 'line', memory: 'area', disk: 'bar' },
      alertRules: [
        { metric: 'cpu', threshold: 80, action: 'notify' },
        { metric: 'memory', threshold: 90, action: 'restart' },
      ],
    },

    // ── 中频区域：统计数据 ──
    stats: {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      activeUsers: 0,
    },

    // ── 高频区域：实时指标 ──
    realtime: {
      cpu: { current: 0, history: [] },
      memory: { current: 0, history: [] },
      network: { inbound: 0, outbound: 0 },
    },

    // ── Actions ──
    updateConfig: (partial) =>
      set((state) => {
        Object.assign(state.config, partial) // Immer 自动产生不可变更新
      }),

    updateStats: (partial) =>
      set((state) => {
        Object.assign(state.stats, partial)
      }),

    updateCpu: (value) =>
      set((state) => {
        state.realtime.cpu.current = value
        state.realtime.cpu.history = [...state.realtime.cpu.history.slice(-59), value]
      }),

    updateMemory: (value) =>
      set((state) => {
        state.realtime.memory.current = value
        state.realtime.memory.history = [...state.realtime.memory.history.slice(-59), value]
      }),
  })),
)

export default useDashboardStore
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  zustand vs Context 的本质差异                      │
│                                                                  │
│  Context：                                                        │
│  Provider state 变化 → 所有 useContext() 消费者重渲染             │
│  → 无法选择性订阅，全量广播                                      │
│  → 即使组件只读取 context.theme，context.realtime 变了也重渲染   │
│                                                                  │
│  zustand：                                                        │
│  Store state 变化 → 只有 selector 返回值变了的组件重渲染          │
│  → 精确订阅，按需通知                                            │
│  → 组件只选 config.theme → realtime 变了完全不受影响              │
│                                                                  │
│  类比 Vue：                                                       │
│  • Context ≈ 把所有数据放在一个 reactive 中（全量通知）           │
│  • zustand + selector ≈ shallowRef + computed（精确通知）         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 selector：细粒度订阅，等价于 Vue 的依赖追踪

selector 是 zustand 高性能的核心——它决定了"Store 变化时，这个组件是否需要重渲染"。

```javascript
// ═══════════════════════════════════════════════════════════════
// 组件中使用 selector 精确订阅
// ═══════════════════════════════════════════════════════════════

// ✅ 精确订阅：只订阅 config.theme
function ThemeToggle() {
  // 只有 theme 值变了才重渲染
  // config 的其他字段变了 → selector 返回相同值 → 不重渲染
  const theme = useDashboardStore((state) => state.config.theme)
  return <button>{theme === 'dark' ? '🌙' : '☀️'}</button>
}

// ✅ 精确订阅：只订阅 cpu.current
function CpuGauge() {
  // 只有 cpu.current 变了才重渲染
  // memory、network、config 的变化完全不影响此组件
  const cpuCurrent = useDashboardStore((state) => state.realtime.cpu.current)
  return <div className="gauge">{cpuCurrent.toFixed(1)}%</div>
}

// ✅ 精确订阅：订阅 cpu 的派生数据
function CpuStatus() {
  // selector 中做计算：等价于 Vue 的 computed
  const cpuStatus = useDashboardStore((state) => {
    const v = state.realtime.cpu.current
    if (v >= 90) return { label: '危险', color: 'red' }
    if (v >= 70) return { label: '警告', color: 'orange' }
    return { label: '正常', color: 'green' }
  })
  return <span style={{ color: cpuStatus.color }}>{cpuStatus.label}</span>
}

// ❌ 错误用法：selector 返回整个对象（每次都是新引用 → 每次都重渲染）
function CpuChart() {
  // 每次 set() 都会产生新的 state.realtime.cpu 对象引用
  // → selector 返回新引用 → 组件每次都重渲染
  const cpu = useDashboardStore((state) => state.realtime.cpu)
  return <Chart data={cpu.history} />
}

// ✅ 正确用法：selector 返回基本类型值或手动浅比较
function CpuChart() {
  const cpuHistory = useDashboardStore(
    (state) => state.realtime.cpu.history,
    // 自定义相等函数：浅比较数组内容
    (prev, next) => prev.length === next.length && prev.every((v, i) => v === next[i]),
  )
  return <Chart data={cpuHistory} />
}
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  selector 与 Vue computed 的对应关系                │
│                                                                  │
│  Vue：                                                            │
│  const cpuStatus = computed(() => {                              │
│    const v = cpuValue.value                                       │
│    if (v >= 90) return '危险'                                    │
│    if (v >= 70) return '警告'                                    │
│    return '正常'                                                  │
│  })                                                              │
│  → 依赖 cpuValue.value 变化时自动重算                            │
│  → 结果不变时不触发更新（缓存）                                   │
│                                                                  │
│  React + zustand：                                                │
│  const cpuStatus = useDashboardStore((state) => {                │
│    const v = state.realtime.cpu.current                           │
│    if (v >= 90) return '危险'                                    │
│    if (v >= 70) return '警告'                                    │
│    return '正常'                                                  │
│  })                                                              │
│  → selector 在每次 store 变化时被调用                            │
│  → 返回值与上次相同（=== 比较）→ 不触发重渲染                    │
│  → 返回值不同 → 触发组件重渲染                                    │
│                                                                  │
│  关键差异：                                                       │
│  • Vue computed 是惰性求值（被读取时才重算）                     │
│  • zustand selector 是立即求值（每次 store 变化都执行）          │
│  • 但效果等价：结果不变时都不触发更新                             │
│                                                                  │
│  性能注意：                                                       │
│  • selector 中避免创建新对象/数组（每次返回新引用 = 每次都更新） │
│  • 返回基本类型（string/number/boolean）最安全                   │
│  • 需要返回复杂值时用 equality function 或 zustand 的 shallow    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Immer：不可变更新的语法糖

Immer 让 zustand 的 `set` 函数可以像"直接修改"一样写代码，但底层自动产生不可变更新——这与 Vue 中 shallowRef 的"整体替换"理念一致，但语法更友好。

```javascript
// ═══════════════════════════════════════════════════════════════
// Immer 的不可变更新 vs 手动展开
// ═══════════════════════════════════════════════════════════════

// ❌ 手动展开：深层嵌套时极其繁琐
set((state) => ({
  ...state,
  realtime: {
    ...state.realtime,
    cpu: {
      ...state.realtime.cpu,
      current: 75.3,
      history: [...state.realtime.cpu.history, 75.3],
    },
  },
}))

// ✅ Immer（zustand/middleware/immer）：直接"修改"草稿
set((state) => {
  state.realtime.cpu.current = 75.3
  state.realtime.cpu.history.push(75.3)
  // Immer 自动将上面的"修改"转换为不可变更新
  // 底层：produce(state, draft => { draft.realtime.cpu.current = 75.3 })
})

// ── Immer 的核心价值 ──
// 1. 语法简洁：不用写 5 层展开运算符
// 2. 安全不可变：底层自动 produce，不会意外修改原状态
// 3. 与 zustand 完美集成：zustand/middleware/immer 一行启用
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  Immer vs Vue shallowRef 更新方式                   │
│                                                                  │
│  Vue shallowRef：                                                 │
│  rawConfig.value = { ...rawConfig.value, ...partial }            │
│  → 手动创建新对象，整体替换 .value                                │
│  → 深层嵌套时同样需要多层展开                                     │
│                                                                  │
│  zustand + Immer：                                                │
│  set((state) => { Object.assign(state.config, partial) })        │
│  → 直接"修改"草稿，Immer 自动产生新对象                         │
│  → 语法更简洁，但本质同样是不可变更新                             │
│                                                                  │
│  共同原则：                                                       │
│  • 永远不直接修改原状态对象                                       │
│  • 每次更新都产生新引用（让 React/Vue 知道"数据变了"）           │
│  • 不可变更新是精确比较（===）的前提                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、按更新频率分频治理

### 3.1 频率分层策略

```
┌─────────────────────────────────────────────────────────────────┐
│                  React 分频治理的三层策略                            │
│                                                                  │
│  低频数据：页面配置、用户偏好、表单元信息                          │
│  → zustand store 中的一个 slice                                   │
│  → selector 订阅整个 slice（因为字段少，整体订阅即可）            │
│  → Immer 简化不可变更新                                           │
│  → 更新频率：用户操作时才变（每分钟 0~2 次）                      │
│                                                                  │
│  中频数据：统计数据、列表数据                                      │
│  → zustand store 中的另一个 slice                                 │
│  → selector 订阅具体字段                                          │
│  → 更新频率：每隔几秒刷新一次                                     │
│                                                                  │
│  高频数据：实时指标、流式数据                                      │
│  → zustand store 中的独立 slice（每个指标独立）                   │
│  → selector 精确到单个标量值                                      │
│  → 事件源（WebSocket）+ 节流/防抖 → 再写入 store                 │
│  → 更新频率：节流后每秒 5~10 次                                   │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  关键原则：                                                       │
│  • 不同频率的数据放在 store 的不同 slice 中                       │
│  • selector 只订阅组件真正需要的字段                              │
│  • 高频数据写入 store 之前必须经过节流/防抖                       │
│  • 每个组件的 selector 返回基本类型值（避免引用比较陷阱）         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Store 的分频设计

```javascript
// ═══════════════════════════════════════════════════════════════
// stores/dashboard-store.js — 分频 Store 设计
// ═══════════════════════════════════════════════════════════════
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribe } from './realtime-subscriber' // 高频事件订阅

const useDashboardStore = create(
  immer((set, get) => ({
    // ══════════════════════════════════════════════════════════
    // 低频 slice：配置数据
    // ══════════════════════════════════════════════════════════
    config: {
      theme: 'dark',
      layout: 'grid',
      refreshInterval: 5000,
      chartTypes: { cpu: 'line', memory: 'area', disk: 'bar' },
      alertRules: [],
    },

    // ══════════════════════════════════════════════════════════
    // 中频 slice：统计数据
    // ══════════════════════════════════════════════════════════
    stats: {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      activeUsers: 0,
    },

    // ══════════════════════════════════════════════════════════
    // 高频 slice：实时指标（每个指标独立存储）
    // ══════════════════════════════════════════════════════════
    realtime: {
      cpuCurrent: 0, // 标量值，selector 直接订阅
      cpuHistory: [], // 数组，需自定义相等函数
      memoryCurrent: 0,
      memoryHistory: [],
      networkInbound: 0,
      networkOutbound: 0,
    },

    // ══════════════════════════════════════════════════════════
    // Actions：按频率分组
    // ══════════════════════════════════════════════════════════

    // 低频 action：配置更新
    updateConfig: (partial) =>
      set((state) => {
        Object.assign(state.config, partial)
      }),

    // 中频 action：统计数据更新
    updateStats: (partial) =>
      set((state) => {
        Object.assign(state.stats, partial)
      }),

    // 高频 action：实时指标更新（由节流后的事件回调调用）
    updateCpuCurrent: (value) =>
      set((state) => {
        state.realtime.cpuCurrent = value
        state.realtime.cpuHistory = [...state.realtime.cpuHistory.slice(-59), value]
      }),

    updateMemoryCurrent: (value) =>
      set((state) => {
        state.realtime.memoryCurrent = value
        state.realtime.memoryHistory = [...state.realtime.memoryHistory.slice(-59), value]
      }),

    updateNetwork: (inbound, outbound) =>
      set((state) => {
        state.realtime.networkInbound = inbound
        state.realtime.networkOutbound = outbound
      }),
  })),
)

// ═══════════════════════════════════════════════════════════════
// 高频事件订阅层：WebSocket → 节流 → Store
// ═══════════════════════════════════════════════════════════════
// 在 Store 外部订阅 WebSocket 事件，节流后写入 Store
// 这与 Vue 中 mitt + throttle 的模式完全对应

import mitt from 'mitt'
const realtimeEmitter = mitt()

// 节流工具
function throttle(fn, interval) {
  let lastTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    }
  }
}

// WebSocket 接入
function connectRealtime() {
  const ws = new WebSocket('wss://api.example.com/realtime')

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    // 按领域拆分事件
    if (msg.cpu !== undefined) realtimeEmitter.emit('cpu', msg.cpu)
    if (msg.memory !== undefined) realtimeEmitter.emit('memory', msg.memory)
    if (msg.network !== undefined) realtimeEmitter.emit('network', msg.network)
  }
  return ws
}

// 节流后写入 Store
// CPU：throttle 100ms（每秒最多 10 次）
realtimeEmitter.on(
  'cpu',
  throttle((value) => {
    useDashboardStore.getState().updateCpuCurrent(value)
  }, 100),
)

// 内存：throttle 200ms（每秒最多 5 次）
realtimeEmitter.on(
  'memory',
  throttle((value) => {
    useDashboardStore.getState().updateMemoryCurrent(value)
  }, 200),
)

// 网络：throttle 100ms
realtimeEmitter.on(
  'network',
  throttle(({ inbound, outbound }) => {
    useDashboardStore.getState().updateNetwork(inbound, outbound)
  }, 100),
)

export { useDashboardStore, connectRealtime }
```

### 3.3 组件层的 selector 消费

```javascript
// ═══════════════════════════════════════════════════════════════
// 组件消费：每个组件只订阅自己需要的字段
// ═══════════════════════════════════════════════════════════════

// ── 低频消费：配置面板 ──
function ConfigPanel() {
  // 只订阅 config slice
  // stats 和 realtime 的变化不会触发此组件重渲染
  const config = useDashboardStore((state) => state.config)
  const updateConfig = useDashboardStore((state) => state.updateConfig)

  return (
    <div>
      <ThemeSelector value={config.theme} onChange={(v) => updateConfig({ theme: v })} />
      <LayoutSelector value={config.layout} onChange={(v) => updateConfig({ layout: v })} />
    </div>
  )
}

// ── 高频消费：CPU 仪表盘 ──
function CpuDashboard() {
  // 精确订阅单个标量值
  // 只有 cpuCurrent 变了才重渲染
  // memory、network、config、stats 的变化完全不影响
  const cpuCurrent = useDashboardStore((state) => state.realtime.cpuCurrent)
  const cpuStatus = cpuCurrent >= 90 ? 'danger' : cpuCurrent >= 70 ? 'warning' : 'normal'

  return (
    <div>
      <Gauge value={cpuCurrent} />
      <StatusBadge status={cpuStatus} />
    </div>
  )
}

// ── 高频消费：CPU 历史图表 ──
import { shallow } from 'zustand/shallow'

function CpuHistoryChart() {
  // 订阅数组时使用自定义相等函数
  const cpuHistory = useDashboardStore(
    (state) => state.realtime.cpuHistory,
    shallow, // zustand 提供的浅比较工具
  )

  return <LineChart data={cpuHistory} />
}

// ── 中频消费：统计摘要 ──
function StatsSummary() {
  // 订阅多个字段，返回派生对象
  // 使用 shallow 比较避免每次返回新对象导致的重渲染
  const stats = useDashboardStore(
    (state) => ({
      total: state.stats.totalRequests,
      avgTime: state.stats.avgResponseTime,
      errorRate: state.stats.errorRate,
    }),
    shallow, // 浅比较：只要三个字段的值没变就不重渲染
  )

  return (
    <div>
      <span>总请求：{stats.total}</span>
      <span>平均响应：{stats.avgTime}ms</span>
      <span>错误率：{stats.errorRate}%</span>
    </div>
  )
}
```

---

## 四、完整数据流：与 Vue 双管道的对照

### 4.1 React 完整数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                  React 分频治理的完整数据流                            │
│                                                                     │
│  ┌─────────────────── 低频管道 ───────────────────────────────────┐  │
│  │                                                                │  │
│  │  用户操作（修改配置）                                           │  │
│  │     ↓                                                          │  │
│  │  store.updateConfig({ theme: 'light' })                        │  │
│  │     ↓                                                          │  │
│  │  Immer 产生不可变更新 → config 引用变更                        │  │
│  │     ↓                                                          │  │
│  │  zustand 通知所有订阅者                                         │  │
│  │     ↓                                                          │  │
│  │  selector(state => state.config.theme) → 值变了                │  │
│  │     ↓                                                          │  │
│  │  只有订阅了 theme 的组件重渲染                                  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────── 高频管道 ───────────────────────────────────┐  │
│  │                                                                │  │
│  │  WebSocket 推送（每秒 30 次）                                   │  │
│  │     ↓                                                          │  │
│  │  mitt.emit('cpu', 75.3)   ← 按领域拆分事件                     │  │
│  │     ↓                                                          │  │
│  │  throttle handler（100ms）→ 每秒最多 10 次                     │  │
│  │     ↓                                                          │  │
│  │  store.updateCpuCurrent(75.3)   ← 节流后写入 zustand           │  │
│  │     ↓                                                          │  │
│  │  zustand 通知所有订阅者                                         │  │
│  │     ↓                                                          │  │
│  │  selector(state => state.realtime.cpuCurrent) → 值变了         │  │
│  │  selector(state => state.realtime.memoryCurrent) → 值没变      │  │
│  │     ↓                                                          │  │
│  │  只有订阅了 cpuCurrent 的组件重渲染                             │  │
│  │  订阅 memoryCurrent 的组件完全不受影响                          │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 React vs Vue 双管道完全对照

```
┌─────────────────────────────────────────────────────────────────────┐
│                  React vs Vue：分频治理完全对照                        │
│                                                                     │
│  概念维度            React 19                     Vue 3              │
│  ─────────────      ──────────────────────      ──────────────────  │
│                                                                     │
│  全局状态容器        zustand store                shallowRef          │
│                     （外部 Store，脱离组件树）    （响应式引用）       │
│                                                                     │
│  细粒度订阅          selector                     Vue 依赖追踪       │
│                     useStore(state => state.x)    （自动收集）       │
│                     （手动声明订阅）                                 │
│                                                                     │
│  不可变更新          Immer                        整体替换            │
│                     set(state => { ... })         .value = { ...old }│
│                     （语法更简洁）                （手动展开）        │
│                                                                     │
│  派生数据            selector 中计算              computed            │
│                     useStore(s => transform(s))   computed(() => fn) │
│                     （每次 store 变化都执行）     （惰性求值）        │
│                                                                     │
│  事件总线            mitt（相同）                  mitt（相同）        │
│                     外部订阅 → throttle → store  外部订阅 → throttle │
│                                                                     │
│  节流/防抖          throttle / debounce           throttle / debounce│
│                     （在事件回调层，相同）        （在事件回调层）    │
│                                                                     │
│  组件消费            useStore(selector)           模板绑定 computed  │
│                     精确到单个字段                 精确到依赖的 ref   │
│                                                                     │
│  防止无效渲染        selector 返回基本类型         computed 缓存      │
│                     + shallow 比较                + shallowRef 切深  │
│                                                                     │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                     │
│  核心差异总结：                                                      │
│  • Vue 的精确更新是"框架默认行为"（响应式自动追踪）                 │
│  • React 的精确更新是"开发者主动选择"（selector 手动声明）           │
│  • 但最终效果等价：都实现了"谁变更新谁"的精确控制                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 五、selector 性能陷阱与最佳实践

### 5.1 陷阱一：selector 返回新对象引用

```javascript
// ❌ 每次 selector 执行都创建新对象 → 每次都重渲染
function CpuPanel() {
  const cpuData = useDashboardStore((state) => ({
    current: state.realtime.cpuCurrent,
    status: state.realtime.cpuCurrent >= 90 ? 'danger' : 'normal',
  }))
  // 即使 cpuCurrent 没变，这个对象也是新引用 → 组件每次都重渲染
  return (
    <div>
      {cpuData.current} - {cpuData.status}
    </div>
  )
}

// ✅ 方案一：拆分为多个基本类型 selector
function CpuPanel() {
  const cpuCurrent = useDashboardStore((state) => state.realtime.cpuCurrent)
  const cpuStatus = cpuCurrent >= 90 ? 'danger' : 'normal' // 在组件内派生
  return (
    <div>
      {cpuCurrent} - {cpuStatus}
    </div>
  )
}

// ✅ 方案二：使用 shallow 比较函数
import { shallow } from 'zustand/shallow'

function CpuPanel() {
  const cpuData = useDashboardStore(
    (state) => ({
      current: state.realtime.cpuCurrent,
      status: state.realtime.cpuCurrent >= 90 ? 'danger' : 'normal',
    }),
    shallow, // 浅比较：字段值没变就不重渲染
  )
  return (
    <div>
      {cpuData.current} - {cpuData.status}
    </div>
  )
}
```

### 5.2 陷阱二：selector 中执行昂贵计算

```javascript
// ❌ selector 中执行重计算（每次 store 变化都执行）
function CpuHistoryChart() {
  const chartData = useDashboardStore((state) => {
    // 这个 filter + map 每次 store 变化都会执行
    // 即使变化的是完全不相关的 config
    return state.realtime.cpuHistory.filter((v) => v > 0).map((v, i) => ({ x: i, y: v }))
  })
  return <Chart data={chartData} />
}

// ✅ 方案：selector 只取原始数据，计算放在 useMemo 中
function CpuHistoryChart() {
  const cpuHistory = useDashboardStore((state) => state.realtime.cpuHistory, shallow)
  // useMemo 只在 cpuHistory 引用变化时才重算
  const chartData = useMemo(
    () => cpuHistory.filter((v) => v > 0).map((v, i) => ({ x: i, y: v })),
    [cpuHistory],
  )
  return <Chart data={chartData} />
}
```

### 5.3 陷阱三：高频更新不使用节流

```javascript
// ❌ WebSocket 每次推送都直接写入 store
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  useDashboardStore.getState().updateCpuCurrent(data.cpu)
  // 每秒 30 次 → 30 次 store 变更 → 30 次 selector 执行 → 30 次重渲染
}

// ✅ 节流后写入
const throttledUpdateCpu = throttle((value) => {
  useDashboardStore.getState().updateCpuCurrent(value)
}, 100) // 每秒最多 10 次

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  throttledUpdateCpu(data.cpu)
  // 每秒最多 10 次 → 10 次 selector 执行 → 10 次重渲染
  // 人眼根本看不出 30 次和 10 次的区别
}
```

### 5.4 selector 最佳实践速查

```
┌─────────────────────────────────────────────────────────────────┐
│                  selector 性能最佳实践                              │
│                                                                  │
│  ✅ 返回基本类型（string/number/boolean）                         │
│     → === 比较天然有效，零配置                                    │
│                                                                  │
│  ✅ 返回数组/对象时搭配 shallow 比较                              │
│     → useStore(selector, shallow)                                │
│                                                                  │
│  ✅ 复杂派生数据用 useMemo 二次包装                               │
│     → selector 取原始数据 → useMemo 做计算                      │
│                                                                  │
│  ✅ 多个独立字段用多个 selector                                   │
│     → 比合并为一个对象更安全                                      │
│                                                                  │
│  ❌ 不要在 selector 中创建新对象（除非搭配 shallow）              │
│     → 新引用 = 每次都触发重渲染                                   │
│                                                                  │
│  ❌ 不要在 selector 中执行昂贵计算                                │
│     → selector 每次 store 变化都执行，不是惰性的                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、反模式对照

### 6.1 反模式一：Context 管理高频数据

```javascript
// ❌ Context 全量广播
const RealtimeContext = createContext()

function RealtimeProvider({ children }) {
  const [cpu, setCpu] = useState(0)
  const [memory, setMemory] = useState(0)
  const [network, setNetwork] = useState({})

  // 每秒 30 次 setCpu → Provider 重渲染 → 所有 Consumer 重渲染
  // 即使某个 Consumer 只关心 memory
  return (
    <RealtimeContext.Provider value={{ cpu, memory, network }}>{children}</RealtimeContext.Provider>
  )
}

// ✅ zustand 精确订阅
function CpuDisplay() {
  const cpu = useDashboardStore((s) => s.realtime.cpuCurrent)
  // 只有 cpuCurrent 变了才重渲染
  return <span>{cpu}%</span>
}
```

### 6.2 反模式二：组件内 useState 管理全局数据

```javascript
// ❌ 提升到顶层组件的多个 useState
function Dashboard() {
  const [config, setConfig] = useState({})
  const [realtime, setRealtime] = useState({})
  // config 变了 → 整个 Dashboard 重渲染 → realtime 相关的子组件也重跑

  return (
    <>
      <ConfigPanel config={config} setConfig={setConfig} />
      <CpuChart realtime={realtime} />
    </>
  )
}

// ✅ zustand 外部 Store，组件直接订阅
function ConfigPanel() {
  const config = useDashboardStore((s) => s.config)
  // 只订阅 config，realtime 变化不影响
}

function CpuChart() {
  const cpu = useDashboardStore((s) => s.realtime.cpuCurrent)
  // 只订阅 cpu，config 变化不影响
}
```

### 6.3 反模式三：selector 过于宽泛

```javascript
// ❌ selector 返回整个 store
function CpuDisplay() {
  const state = useDashboardStore() // 没有 selector → 任何变化都重渲染
  return <span>{state.realtime.cpuCurrent}%</span>
}

// ❌ selector 返回整个 slice
function CpuDisplay() {
  const realtime = useDashboardStore((s) => s.realtime)
  // memory、network 变了也会重渲染（新引用）
  return <span>{realtime.cpuCurrent}%</span>
}

// ✅ selector 精确到字段
function CpuDisplay() {
  const cpuCurrent = useDashboardStore((s) => s.realtime.cpuCurrent)
  return <span>{cpuCurrent}%</span>
}
```

---

## 七、决策指南与检验清单

### 7.1 何时使用 zustand + selector + Immer

| 场景                       | 适用性      | 原因                                        |
| -------------------------- | ----------- | ------------------------------------------- |
| 跨组件共享的大型深层对象   | ✅ 强烈推荐 | zustand 的选择性订阅解决 Context 的全量广播 |
| 高频实时更新数据           | ✅ 强烈推荐 | selector 精确隔离 + 节流控制更新频率        |
| 多层嵌套的配置对象         | ✅ 推荐     | Immer 简化深层不可变更新                    |
| 小型局部状态（表单、弹窗） | ❌ 不需要   | useState / useReducer 即可                  |
| 服务端数据缓存             | ❌ 不需要   | TanStack Query 更合适                       |

### 7.2 检验清单

```
┌─────────────────────────────────────────────────────────────────┐
│                  React 分频治理检验清单                              │
│                                                                  │
│  □ 大型深层对象是否使用了 zustand（而非 Context / useState）？    │
│    → zustand 的选择性订阅是性能的基础                            │
│                                                                  │
│  □ 每个组件的 selector 是否只订阅了必要的字段？                   │
│    → 避免 selector 返回整个 store 或整个 slice                   │
│                                                                  │
│  □ selector 返回对象/数组时是否搭配了 shallow 比较？              │
│    → 避免新引用导致的不必要重渲染                                  │
│                                                                  │
│  □ 是否启用了 Immer 中间件？                                      │
│    → zustand/middleware/immer 简化不可变更新                      │
│                                                                  │
│  □ 高频数据写入 store 前是否经过了节流/防抖？                     │
│    → 不在 WebSocket 回调中直接 set()                              │
│                                                                  │
│  □ 不同频率的数据是否放在了 store 的不同 slice 中？               │
│    → 低频配置、中频统计、高频实时各自独立                        │
│                                                                  │
│  □ 昂贵计算是否用 useMemo 包装（而非在 selector 中直接执行）？    │
│    → selector 取原始数据 → useMemo 做派生计算                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 八、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   React 19 大型深层对象的代码组织：                                │
│   zustand + selector + Immer 分频治理                            │
│                                                                  │
│   zustand                                                        │
│   → 外部 Store，脱离 React 渲染树                                │
│   → 状态变更不触发整棵组件树重渲染                                │
│   → 等价于 Vue 的 shallowRef（独立于组件的状态容器）              │
│                                                                  │
│   +                                                              │
│                                                                  │
│   selector                                                       │
│   → 选择性订阅，精确到单个字段                                    │
│   → 只有 selector 返回值变了才触发重渲染                          │
│   → 等价于 Vue 的依赖追踪 + computed（精确控制谁收到通知）        │
│                                                                  │
│   +                                                              │
│                                                                  │
│   Immer                                                          │
│   → 不可变更新的语法糖                                            │
│   → 直接"修改"草稿，自动产生新引用                                │
│   → 等价于 Vue 的 .value = { ...old, ...partial }（但更简洁）    │
│                                                                  │
│   =                                                              │
│                                                                  │
│   分频治理的高性能 React 项目                                      │
│   → 低频数据：zustand + selector + Immer（声明式消费）            │
│   → 高频数据：mitt + throttle + zustand + selector（事件驱动）    │
│   → 每个组件只重渲染它真正需要的那部分                            │
│                                                                  │
│   与 Vue 的核心差异：                                             │
│   • Vue 靠框架自动追踪依赖（被动精确）                            │
│   • React 靠开发者显式声明订阅（主动精确）                        │
│   • 最终效果等价：都实现了"谁变更新谁"                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**React 的性能优化不是"事后打补丁"，而是"架构选择的结果"。** 当你用 zustand 替代 Context 管理大型深层对象、用 selector 精确声明每个组件的订阅范围、用 Immer 简化不可变更新时，不必要的 Re-render 就从架构层面被消除了——不需要满屏的 `React.memo`，不需要 `useMemo` / `useCallback` 的过度使用。这与 Vue 中用 shallowRef + computed 消除深度追踪开销的思路完全同构：**好的性能不是优化出来的，是选对工具和组织方式后自然得到的。**
