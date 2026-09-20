# Vue 3 大型深层对象的代码组织：按更新频率分频治理

> Vue 3 项目中，大型深层对象（如仪表盘配置、编辑器状态、实时数据面板）的性能问题，往往不是因为数据"大"，而是因为不同更新频率的数据被混在同一套响应式管道中——低频的配置变更和高频的实时推送共享同一条响应式链路，导致高频更新不断触发低频数据的冗余重算和重渲染。本文提出**按更新频率分频治理**的代码组织范式：**低频数据走 shallowRef + computed 的声明式管道，高频数据走 mitt + 节流防抖 + 领域细项导出 + computed 终端消费的事件驱动管道**——两条管道各司其职，互不干扰。

---

## 一、问题的本质：频率混用导致响应式管道拥堵

### 1.1 大型深层对象的典型困境

在中大型 Vue 3 项目中，几乎每个复杂页面都会遇到这样的数据结构：

```javascript
// 一个典型的"大型深层对象"——实时数据仪表盘
const dashboard = reactive({
  // 低频区域：页面配置，用户手动操作才变
  config: {
    theme: 'dark',
    layout: 'grid',
    refreshInterval: 5000,
    chartTypes: { cpu: 'line', memory: 'area', disk: 'bar' },
    alertRules: [
      { metric: 'cpu', threshold: 80, action: 'notify' },
      { metric: 'memory', threshold: 90, action: 'restart' },
    ],
  },

  // 中频区域：统计数据，每隔几秒刷新一次
  stats: {
    totalRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    topEndpoints: [],
    // ... 更多统计字段
  },

  // 高频区域：实时指标，每秒推送数十次
  realtime: {
    cpu: { current: 0, history: [] },
    memory: { current: 0, history: [] },
    network: { inbound: 0, outbound: 0, packets: [] },
    disk: { read: 0, write: 0, iops: 0 },
    // ... 更多实时字段
  },
})
```

**问题在于**：这三个区域的更新频率完全不同，但它们被放在同一个 `reactive` 对象中——

```
┌─────────────────────────────────────────────────────────────────────┐
│                  频率混用的灾难链条                                    │
│                                                                     │
│  ① 高频实时更新（每秒 30 次）                                        │
│     realtime.cpu.current = 75.3    → 触发 reactive 的 set 拦截       │
│     → 通知所有依赖 dashboard 的 computed / watch                     │
│     → 即使 computed 只读取 config.theme，也要走一遍依赖检查           │
│                                                                     │
│  ② 依赖图膨胀                                                       │
│     reactive 的深度追踪为每个嵌套属性建立 dep                         │
│     config（15 个字段）+ stats（20 个字段）+ realtime（30 个字段）    │
│     = 65+ 个依赖追踪点                                               │
│     → 任何一个变动都通知所有建立了依赖关系的 effect                   │
│                                                                     │
│  ③ 无效重算级联                                                      │
│     realtime 每秒更新 30 次                                           │
│     → 触发依赖 dashboard 的 computed 重算 30 次                      │
│     → 其中 29 次重算的结果可能完全相同（因为 config 没变）            │
│     → 每次重算都可能触发组件重新渲染                                  │
│                                                                     │
│  ④ 渲染风暴                                                          │
│     用户只关心界面上的数字在跳动                                      │
│     但每次跳动都伴随着：computed 重算 + VNode Diff + DOM Patch        │
│     如果组件树较深，一次更新可能涉及数十个组件的重新渲染              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 频率混用的根源

```
┌─────────────────────────────────────────────────────────────────┐
│                  频率混用的三个认知误区                              │
│                                                                  │
│  误区一："一个 reactive 管所有"                                    │
│  → 把所有状态放在一个对象中，因为"它们都属于这个页面"              │
│  → 忽略了不同数据的更新频率可能相差 100 倍以上                    │
│                                                                  │
│  误区二："响应式系统会自动优化"                                    │
│  → 认为 Vue 的 computed 缓存能自动避免冗余计算                   │
│  → 但 computed 的缓存只在"依赖值未变"时生效                      │
│  → 高频数据每次变化都是新值 → computed 每次都要重算              │
│                                                                  │
│  误区三："shallowRef 能解决一切"                                  │
│  → shallowRef 确实消除了深度追踪开销                              │
│  → 但对于高频数据，即使 shallowRef 的 .value 整体替换             │
│  → 每秒 30 次替换仍然触发 30 次 computed 重算 + 30 次渲染        │
│  → shallowRef 解决的是"追踪深度"问题，不是"更新频率"问题         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 核心洞察：按频率分治

```
┌─────────────────────────────────────────────────────────────────┐
│                  分频治理的核心思想                                  │
│                                                                  │
│  大型深层对象中的不同数据区域，更新频率天然不同：                  │
│                                                                  │
│  低频数据：页面配置、用户偏好、表单元信息                          │
│  → 更新频率：用户操作时才变（每分钟 0~2 次）                      │
│  → 特点：变更少、数据稳定、是其他计算的基础                        │
│                                                                  │
│  高频数据：实时指标、流式数据、动画状态                            │
│  → 更新频率：每秒数次到数十次                                     │
│  → 特点：变更频繁、数据瞬时、只关心最新值                          │
│                                                                  │
│  分频治理：                                                        │
│  → 低频数据用声明式管道（shallowRef + computed）                  │
│  → 高频数据用事件驱动管道（mitt + 节流防抖 + 细项导出）           │
│  → 两条管道在 computed 终端汇合，组件只消费最终结果                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、低频数据管道：shallowRef + computed 的声明式范式

### 2.1 适用场景

低频数据的典型特征：

| 特征       | 说明                             | 示例                         |
| ---------- | -------------------------------- | ---------------------------- |
| 更新触发方 | 用户手动操作（点击、选择、输入） | 修改配置、切换筛选条件       |
| 更新频率   | 每分钟 0~2 次                    | 页面配置、表单数据           |
| 数据体量   | 通常较大（嵌套对象、列表）       | 接口返回的复杂 JSON          |
| 消费方式   | 多个 computed / 组件依赖         | 配置驱动多个子组件的显示逻辑 |
| 响应式需求 | 需要声明式同步，但不需要高频触发 | 配置变了 → 视图自动更新      |

### 2.2 标准写法

```javascript
// ═══════════════════════════════════════════════════════════════
// 低频数据管道：shallowRef + computed
// ═══════════════════════════════════════════════════════════════
import { shallowRef, computed } from 'vue'

// ── 原始数据：shallowRef 缓存，不深度代理 ──
const rawConfig = shallowRef({
  theme: 'dark',
  layout: 'grid',
  chartTypes: { cpu: 'line', memory: 'area', disk: 'bar' },
  alertRules: [
    { metric: 'cpu', threshold: 80, action: 'notify' },
    { metric: 'memory', threshold: 90, action: 'restart' },
  ],
})

// ── 显示参数：shallowRef，整体替换 ──
const displayFilters = shallowRef({
  showCpu: true,
  showMemory: true,
  showDisk: true,
})

// ── 派生数据：computed 自动同步 ──
// 只在 rawConfig.value 或 displayFilters.value 引用变更时重算
const visibleChartConfigs = computed(() => {
  const config = rawConfig.value
  const filters = displayFilters.value
  return Object.entries(config.chartTypes)
    .filter(([key]) => filters[`show${capitalize(key)}`])
    .map(([key, type]) => ({ key, type, alertRule: findAlertRule(config.alertRules, key) }))
})

// ── 更新方式：整体替换 .value ──
function updateConfig(partial) {
  rawConfig.value = { ...rawConfig.value, ...partial } // ✅ 新对象引用，触发一次更新
}

function toggleChartVisibility(chartKey) {
  displayFilters.value = {
    ...displayFilters.value,
    [`show${capitalize(chartKey)}`]: !displayFilters.value[`show${capitalize(chartKey)}`],
  }
}
```

### 2.3 管道的数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                  低频数据管道的完整数据流                           │
│                                                                  │
│  用户操作（修改配置 / 切换筛选）                                   │
│     ↓                                                           │
│  整体替换 shallowRef.value（一次引用变更）                        │
│     ↓                                                           │
│  Vue 响应式系统检测到 .value 引用变了                             │
│     ↓                                                           │
│  依赖它的 computed 被标记 dirty                                   │
│     ↓                                                           │
│  模板渲染时读取 computed → 惰性重算（纯函数算法）                 │
│     ↓                                                           │
│  结果引用变了 → 触发一次 DOM Patch                                │
│  结果引用没变 → 不触发渲染（零开销）                              │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  性能特征：                                                       │
│  • 响应式开销：O(1)，与数据复杂度无关                             │
│  • 渲染次数：每次操作恒定 1 次                                    │
│  • computed 缓存：依赖不变时零重算                                │
│  • 深度 Proxy：零（shallowRef 不追踪内部属性）                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 关键原则

```
┌─────────────────────────────────────────────────────────────────┐
│                  低频数据管道的三条铁律                              │
│                                                                  │
│  铁律一：永远整体替换，永远不修改内部属性                          │
│  → rawConfig.value = { ...old, ...partial }  ✅                 │
│  → rawConfig.value.theme = 'light'             ❌（静默修改）    │
│                                                                  │
│  铁律二：算法在纯函数中，computed 只做桥梁                        │
│  → computed(() => pureFunction(rawConfig.value, filters.value))  │
│  → computed 内部不包含副作用，不修改其他状态                      │
│                                                                  │
│  铁律三：一个 shallowRef 只管一个逻辑域                          │
│  → 配置是配置，筛选是筛选，不要混在一个 shallowRef 中            │
│  → 细粒度拆分让 computed 的依赖追踪更精确，减少不必要的重算      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、高频数据管道：mitt + 节流防抖 + 领域细项导出 + computed 终端消费

### 3.1 适用场景

高频数据的典型特征：

| 特征       | 说明                                       | 示例                         |
| ---------- | ------------------------------------------ | ---------------------------- |
| 更新触发方 | WebSocket 推送、定时器轮询、传感器数据     | 实时指标、股票行情、聊天消息 |
| 更新频率   | 每秒数次到数十次                           | CPU 监控（每秒 10 次+）      |
| 数据体量   | 单次推送小，但累积量大                     | 单个指标值 + 历史数组        |
| 消费方式   | 多个组件 / computed 消费不同字段           | 仪表盘多个图表各取所需       |
| 响应式需求 | 需要控制更新节奏，不能让每次推送都触发渲染 | 节流到人眼可感知的频率       |

### 3.2 为什么高频数据不能直接走 shallowRef

```javascript
// ❌ 错误做法：高频数据直接写入 shallowRef
const realtimeData = shallowRef({ cpu: 0, memory: 0, network: {} })

// WebSocket 每秒推送 30 次
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  realtimeData.value = { ...realtimeData.value, ...data } // 每秒触发 30 次更新
}

// 问题：
// 1. 每秒 30 次 shallowRef 赋值 → 30 次响应式通知
// 2. 依赖它的 computed 每秒重算 30 次
// 3. 组件每秒重新渲染 30 次 → 用户根本看不出 30 次和 10 次的区别
// 4. 大量渲染开销被浪费在人眼无法感知的更新上

// ❌ 更糟的做法：用 ref 深度追踪
const realtimeData = ref({ cpu: 0, memory: 0, network: {} })
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  Object.assign(realtimeData.value, data) // 每次推送触发 N 个属性的依赖通知
  // 30 次/秒 × N 个属性 = 30N 次响应式通知
}
```

### 3.3 架构全景：事件驱动 + 分频消费管道

```
┌─────────────────────────────────────────────────────────────────────┐
│                  高频数据管道的完整架构                                  │
│                                                                     │
│  数据源（WebSocket / 定时器 / EventSource）                          │
│     ↓ 原始事件流（每秒 30 次）                                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ① mitt 事件总线：接收原始数据流                              │    │
│  │     emitter.emit('realtime:cpu', { value: 75.3, ts: ... })  │    │
│  │     emitter.emit('realtime:memory', { value: 82.1, ts: ... })│    │
│  │     → 按领域（细项）分发事件，而非一个大对象                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│     ↓                                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ② 节流/防抖层：控制更新节奏                                  │    │
│  │     throttle(cpuHandler, 100)   → 每秒最多 10 次             │    │
│  │     debounce(memoryHandler, 200) → 停顿 200ms 后才更新       │    │
│  │     requestAnimationFrame(networkHandler) → 与渲染帧对齐     │    │
│  │     → 根据数据特性选择不同的降频策略                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│     ↓                                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ③ 领域细项导出层：每个数据细项独立的 ref / shallowRef        │    │
│  │     const cpuValue = ref(0)          // 细粒 ref             │    │
│  │     const cpuHistory = shallowRef([]) // 数组用 shallowRef   │    │
│  │     const memoryValue = ref(0)                               │    │
│  │     → 细项隔离：cpu 更新不影响 memory 的依赖方               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│     ↓                                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ④ computed 终端消费层：组件只消费计算后的结果                │    │
│  │     const cpuDisplay = computed(() => formatPercent(cpuValue))│    │
│  │     const cpuTrend = computed(() => buildTrend(cpuHistory))  │    │
│  │     → 组件绑定 computed，不直接绑定底层 ref                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│     ↓                                                               │
│  Vue 组件渲染                                                       │
│  → 每个组件只依赖自己关心的 computed                                │
│  → 更新频率已被节流层降到合理范围                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 第一层：mitt 事件总线——按领域分发原始数据流

```javascript
// ═══════════════════════════════════════════════════════════════
// realtime-bus.js — 高频数据的事件总线
// ═══════════════════════════════════════════════════════════════
import mitt from 'mitt'

// 创建专用事件总线，不复用全局事件
const realtimeEmitter = mitt()

// ── 事件类型定义 ──
// 按领域（细项）拆分事件，而非推送一个大对象
// ✅ 细项事件：每个指标独立推送
//    emitter.emit('realtime:cpu', { value: 75.3, timestamp: Date.now() })
//    emitter.emit('realtime:memory', { value: 82.1, timestamp: Date.now() })
//
// ❌ 聚合事件：所有指标打包推送
//    emitter.emit('realtime:update', { cpu: {...}, memory: {...}, ... })
//    → 消费方必须接收整个对象，即使只关心其中一个字段

// ── WebSocket 接入层：将原始消息拆分为细项事件 ──
let ws = null

function connectRealtime() {
  ws = new WebSocket('wss://api.example.com/realtime')

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)

    // 关键：将服务端的一条聚合消息拆分为多个细项事件
    // 服务端推送：{ cpu: 75.3, memory: 82.1, network: {...}, timestamp: ... }
    // 拆分为独立事件，让消费方按需订阅
    if (message.cpu !== undefined) {
      realtimeEmitter.emit('realtime:cpu', {
        value: message.cpu,
        timestamp: message.timestamp,
      })
    }
    if (message.memory !== undefined) {
      realtimeEmitter.emit('realtime:memory', {
        value: message.memory,
        timestamp: message.timestamp,
      })
    }
    if (message.network !== undefined) {
      realtimeEmitter.emit('realtime:network', {
        inbound: message.network.inbound,
        outbound: message.network.outbound,
        timestamp: message.timestamp,
      })
    }
  }
}

export { realtimeEmitter, connectRealtime }
```

**为什么用 mitt 而不是直接写 shallowRef？**

```
┌─────────────────────────────────────────────────────────────────┐
│                  mitt 在高频管道中的三个不可替代作用                 │
│                                                                  │
│  ① 解耦数据生产与消费                                             │
│     WebSocket 只管 emit 事件，不知道谁在消费、消费几次            │
│     消费方只管 on 事件，不知道数据从哪来、怎么传输                │
│     → 生产端和消费端可以独立开发、独立测试                       │
│                                                                  │
│  ② 天然支持一对多广播                                              │
│     一个 'realtime:cpu' 事件可以同时被多个消费方监听              │
│     图表 A 监听 cpu 更新折线图                                    │
│     仪表盘 B 监听 cpu 更新数字显示                                │
│     告警模块 C 监听 cpu 检查阈值                                  │
│     → 无需手动维护订阅列表                                       │
│                                                                  │
│  ③ 为节流/防抖提供天然的插入点                                    │
│     emit → [节流层] → ref 赋值                                    │
│     节流逻辑在"事件接收"和"状态赋值"之间                         │
│     → 不影响数据生产端，不影响消费端                              │
│     → 节流策略可以随时调整                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 第二层：节流/防抖——控制更新节奏

```javascript
// ═══════════════════════════════════════════════════════════════
// 节流/防抖工具函数
// ═══════════════════════════════════════════════════════════════

/**
 * 节流：固定时间间隔内最多执行一次
 * 适用于：需要持续更新但不需要每帧都更新的场景（如 CPU 使用率）
 */
export function throttle(fn, interval) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 防抖：停止触发后等待一段时间才执行
 * 适用于：只关心最终稳定值的场景（如内存使用量趋势）
 */
export function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * 帧对齐：与 requestAnimationFrame 同步
 * 适用于：需要与渲染帧对齐的视觉更新（如动画、进度条）
 */
export function frameAlign(fn) {
  let rafId = null
  return function (...args) {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = null
      fn.apply(this, args)
    })
  }
}
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  三种降频策略的选择决策                              │
│                                                                  │
│  数据类型              推荐策略          原因                      │
│  ─────────────        ──────────       ──────────────────────     │
│  CPU 使用率            throttle 100ms   需要持续可见，但 10 次/秒  │
│                                        已足够人眼感知              │
│                                                                  │
│  内存使用量            debounce 200ms   趋势变化缓慢，停顿后更新   │
│                                        即可，不需要实时跳动        │
│                                                                  │
│  网络流量              frameAlign       与渲染帧对齐，避免一帧内   │
│                                        多次更新造成视觉闪烁        │
│                                                                  │
│  磁盘 I/O              throttle 500ms   变化频率低，2 次/秒足够    │
│                                                                  │
│  告警状态              不降频           告警是关键时刻必须立即响应  │
│                                        不能有任何延迟              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 第三层：领域细项导出——每个数据细项独立的 ref / shallowRef

```javascript
// ═══════════════════════════════════════════════════════════════
// composables/useRealtimeMetrics.js — 领域细项导出层
// ═══════════════════════════════════════════════════════════════
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import { realtimeEmitter, connectRealtime } from '@/realtime/realtime-bus'
import { throttle, debounce, frameAlign } from '@/utils/throttle'

export function useRealtimeMetrics() {
  // ── 领域细项导出：每个指标独立的响应式状态 ──
  // 标量值用 ref（需要精确追踪值变更）
  const cpuValue = ref(0)
  const memoryValue = ref(0)
  const networkInbound = ref(0)
  const networkOutbound = ref(0)
  const diskRead = ref(0)
  const diskWrite = ref(0)

  // 数组/对象用 shallowRef（整体替换，不深度追踪）
  const cpuHistory = shallowRef([])
  const memoryHistory = shallowRef([])
  const networkPackets = shallowRef([])

  // ── 事件订阅 + 节流/防抖 ──
  // CPU：throttle 100ms，每秒最多 10 次更新
  const handleCpuUpdate = throttle((data) => {
    cpuValue.value = data.value
    // 历史数组：整体替换（不可变更新）
    cpuHistory.value = [...cpuHistory.value.slice(-59), data.value]
  }, 100)

  // 内存：debounce 200ms，停顿后更新
  const handleMemoryUpdate = debounce((data) => {
    memoryValue.value = data.value
    memoryHistory.value = [...memoryHistory.value.slice(-59), data.value]
  }, 200)

  // 网络：frameAlign，与渲染帧对齐
  const handleNetworkUpdate = frameAlign((data) => {
    networkInbound.value = data.inbound
    networkOutbound.value = data.outbound
  })

  // ── 注册/注销事件监听 ──
  onMounted(() => {
    connectRealtime()
    realtimeEmitter.on('realtime:cpu', handleCpuUpdate)
    realtimeEmitter.on('realtime:memory', handleMemoryUpdate)
    realtimeEmitter.on('realtime:network', handleNetworkUpdate)
  })

  onUnmounted(() => {
    realtimeEmitter.off('realtime:cpu', handleCpuUpdate)
    realtimeEmitter.off('realtime:memory', handleMemoryUpdate)
    realtimeEmitter.off('realtime:network', handleNetworkUpdate)
  })

  // ── 返回细项导出的响应式状态 ──
  return {
    // CPU 相关
    cpuValue,
    cpuHistory,
    // 内存相关
    memoryValue,
    memoryHistory,
    // 网络相关
    networkInbound,
    networkOutbound,
    networkPackets,
    // 磁盘相关
    diskRead,
    diskWrite,
  }
}
```

**为什么按细项拆分而不是一个大 shallowRef？**

```
┌─────────────────────────────────────────────────────────────────┐
│                  细项拆分 vs 聚合对象的依赖隔离效果                  │
│                                                                  │
│  ❌ 聚合模式：一个大 shallowRef                                    │
│  const allMetrics = shallowRef({ cpu: 0, memory: 0, network: {} })│
│                                                                  │
│  问题：                                                           │
│  • CPU 图表组件读取 allMetrics.value → 建立依赖                   │
│  • 内存图表组件读取 allMetrics.value → 也建立依赖                 │
│  • CPU 更新 → allMetrics.value 引用变更 → 两个组件都重渲染       │
│  • 即使内存值没变，内存图表也被迫重渲染                           │
│  • → 无法实现"谁变更新谁"的精确控制                               │
│                                                                  │
│  ✅ 细项模式：每个指标独立的 ref                                    │
│  const cpuValue = ref(0)                                         │
│  const memoryValue = ref(0)                                      │
│                                                                  │
│  效果：                                                           │
│  • CPU 图表组件只读取 cpuValue → 只依赖 cpuValue                 │
│  • 内存图表组件只读取 memoryValue → 只依赖 memoryValue            │
│  • CPU 更新 → 只有 CPU 图表重渲染 → 内存图表完全不受影响         │
│  • → 实现了"领域隔离"：每个领域的更新只影响该领域的消费方         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 第四层：computed 终端消费——组件只消费计算后的结果

```javascript
// ═══════════════════════════════════════════════════════════════
// composables/useCpuDisplay.js — computed 终端消费层
// ═══════════════════════════════════════════════════════════════
import { computed } from 'vue'
import { useRealtimeMetrics } from './useRealtimeMetrics'

export function useCpuDisplay() {
  const { cpuValue, cpuHistory } = useRealtimeMetrics()

  // ── computed 终端消费：组件直接绑定的显示数据 ──
  // 组件不直接读取 cpuValue，而是读取 computed 派生的显示数据
  // 这样即使底层 ref 的更新策略变了，组件代码不需要修改

  // 百分比显示
  const cpuPercentText = computed(() => `${cpuValue.value.toFixed(1)}%`)

  // 状态标签
  const cpuStatusTag = computed(() => {
    const v = cpuValue.value
    if (v >= 90) return { label: '危险', color: 'red' }
    if (v >= 70) return { label: '警告', color: 'orange' }
    return { label: '正常', color: 'green' }
  })

  // 趋势数据（给图表组件用）
  const cpuTrendData = computed(() => cpuHistory.value.map((v, i) => ({ index: i, value: v })))

  // 峰值/谷值
  const cpuStats = computed(() => {
    const history = cpuHistory.value
    if (history.length === 0) return { max: 0, min: 0, avg: 0 }
    return {
      max: Math.max(...history),
      min: Math.min(...history),
      avg: history.reduce((sum, v) => sum + v, 0) / history.length,
    }
  })

  return { cpuPercentText, cpuStatusTag, cpuTrendData, cpuStats }
}
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  computed 终端消费的三层隔离效果                     │
│                                                                  │
│  底层 ref（cpuValue）                                             │
│     ↓ 被节流层控制频率                                            │
│  computed（cpuPercentText / cpuStatusTag / cpuTrendData）         │
│     ↓ 惰性求值 + 缓存                                            │
│  组件模板（{{ cpuPercentText }}）                                 │
│     → 只在 computed 结果变化时重渲染                              │
│     → 如果节流后 cpuValue 从 75.3 变到 75.31                     │
│     → cpuPercentText 从 "75.3%" 变到 "75.3%"（toFixed(1) 相同）  │
│     → computed 缓存生效，组件不重渲染！                           │
│                                                                  │
│  这就是"终端消费"的意义：                                         │
│  computed 不仅是数据转换，更是最后一道"去重过滤器"                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、双管齐下：低频管道与高频管道的协同

### 4.1 完整实战：实时仪表盘的双管道架构

```javascript
// ═══════════════════════════════════════════════════════════════
// 文件结构
// ═══════════════════════════════════════════════════════════════
// src/
// ├── realtime/
// │   └── realtime-bus.js              # mitt 事件总线
// ├── utils/
// │   └── throttle.js                  # 节流/防抖/帧对齐工具
// ├── api/
// │   └── dashboard-api.js             # 低频数据 API
// ├── transforms/
// │   └── dashboard-transform.js       # 纯函数算法（不 import Vue）
// ├── composables/
// │   ├── useDashboardConfig.js        # 低频管道：配置管理
// │   ├── useRealtimeMetrics.js        # 高频管道：实时指标接入
// │   └── useCpuDisplay.js             # 终端消费：CPU 显示数据
// └── components/
//     ├── CpuChart.vue                 # 只消费 CPU 的 computed
//     ├── MemoryChart.vue              # 只消费内存的 computed
//     └── DashboardConfig.vue          # 消费配置的 shallowRef

// ═══════════════════════════════════════════════════════════════
// composables/useDashboardConfig.js — 低频管道
// ═══════════════════════════════════════════════════════════════
import { shallowRef, computed } from 'vue'
import { fetchDashboardConfig } from '@/api/dashboard-api'
import { buildChartConfigs } from '@/transforms/dashboard-transform'

export function useDashboardConfig() {
  // 低频：页面配置，用户操作时才变
  const rawConfig = shallowRef(null)
  const loading = shallowRef(false)

  // computed：配置 → 图表配置的纯函数转换
  const chartConfigs = computed(() => {
    if (!rawConfig.value) return []
    return buildChartConfigs(rawConfig.value)
  })

  async function loadConfig() {
    loading.value = true
    try {
      rawConfig.value = await fetchDashboardConfig()
    } finally {
      loading.value = false
    }
  }

  function updateConfig(partial) {
    rawConfig.value = { ...rawConfig.value, ...partial }
  }

  return { rawConfig, chartConfigs, loading, loadConfig, updateConfig }
}

// ═══════════════════════════════════════════════════════════════
// 组件中的双管道协同
// ═══════════════════════════════════════════════════════════════
// <script setup>
// import { useDashboardConfig } from '@/composables/useDashboardConfig'
// import { useCpuDisplay } from '@/composables/useCpuDisplay'
//
// // 低频管道：配置
// const { chartConfigs, loading, loadConfig } = useDashboardConfig()
//
// // 高频管道：实时指标（终端消费）
// const { cpuPercentText, cpuStatusTag, cpuTrendData } = useCpuDisplay()
//
// onMounted(() => loadConfig())
// </script>
//
// <template>
//   <!-- 配置区域：低频更新，由 shallowRef + computed 驱动 -->
//   <div class="config-panel">
//     <ChartConfigGrid :configs="chartConfigs" />
//   </div>
//
//   <!-- 实时区域：高频更新，由 mitt + 节流 + 细项 ref + computed 驱动 -->
//   <div class="realtime-panel">
//     <CpuChart
//       :percent="cpuPercentText"
//       :status="cpuStatusTag"
//       :trend="cpuTrendData"
//     />
//   </div>
// </template>
```

### 4.2 双管道的数据流全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                  双管道协同的数据流全景                                │
│                                                                     │
│  ┌─────────────────── 低频管道 ───────────────────────────────────┐  │
│  │                                                                │  │
│  │  用户操作                                                       │  │
│  │     ↓                                                          │  │
│  │  shallowRef.value = newConfig   ← 整体替换，一次通知            │  │
│  │     ↓                                                          │  │
│  │  computed 重算（纯函数算法）                                    │  │
│  │     ↓                                                          │  │
│  │  配置驱动的组件更新（极少触发）                                  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────── 高频管道 ───────────────────────────────────┐  │
│  │                                                                │  │
│  │  WebSocket 推送（每秒 30 次）                                   │  │
│  │     ↓                                                          │  │
│  │  mitt.emit('realtime:cpu', data)   ← 按领域拆分事件            │  │
│  │     ↓                                                          │  │
│  │  throttle / debounce / frameAlign   ← 降频到人眼可感知范围     │  │
│  │     ↓                                                          │  │
│  │  cpuValue.value = data.value   ← 细项 ref，领域隔离            │  │
│  │     ↓                                                          │  │
│  │  computed 终端消费（cpuPercentText 等）                         │  │
│  │     ↓                                                          │  │
│  │  只有依赖该细项的组件重渲染                                      │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                     │
│  两条管道的隔离保证：                                                │
│  • 高频实时更新不会触发低频配置的 computed 重算                     │
│  • 低频配置更新不会干扰高频数据的节流节奏                           │
│  • 两条管道唯一的交汇点在组件模板中——组件同时绑定两类 computed      │
│    但它们的更新是完全独立的                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 两条管道的对比

```
┌─────────────────────────────────────────────────────────────────────┐
│                  低频管道 vs 高频管道：全方位对比                       │
│                                                                     │
│  维度              低频管道                    高频管道               │
│  ─────────        ──────────────────         ──────────────────     │
│                                                                     │
│  数据源            用户操作 / API 响应         WebSocket / 定时器     │
│                                                                     │
│  更新频率          每分钟 0~2 次               每秒 5~30 次          │
│                                                                     │
│  核心工具          shallowRef                  mitt 事件总线          │
│                                                                     │
│  节奏控制          不需要（本身就低频）        节流/防抖/帧对齐       │
│                                                                     │
│  数据粒度          整体对象（配置通常整体使用）细项 ref（按指标拆分） │
│                                                                     │
│  算法层            纯函数 transform             事件回调中的简单赋值  │
│                                                                     │
│  终端消费          computed                     computed              │
│                                                                     │
│  依赖隔离方式      按 shallowRef 分域           按 ref 细项分域       │
│                                                                     │
│  渲染触发条件      .value 引用变更              ref.value 值变更      │
│                                                                     │
│  典型数据          页面配置、筛选条件、表单      实时指标、流式数据    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 五、反模式对照

### 5.1 反模式一：一个 reactive 管所有频率的数据

```javascript
// ❌ 频率混用：所有数据在一个 reactive 中
const dashboard = reactive({
  config: { theme: 'dark', layout: 'grid' }, // 低频
  realtime: { cpu: 0, memory: 0 }, // 高频
})

// 问题：
// 1. realtime 每秒更新 30 次 → reactive 的 set 拦截触发 30 次
// 2. 每次 set 拦截都检查 config 相关属性的 dep → 冗余检查
// 3. 深度 Proxy 为 config 的每个嵌套属性都建立了追踪 → 内存浪费
// 4. 无法对高频数据和低频数据采用不同的更新策略
```

```javascript
// ✅ 分频治理：低频 shallowRef + 高频 mitt + 细项 ref
const config = shallowRef({ theme: 'dark', layout: 'grid' }) // 低频管道
const cpuValue = ref(0) // 高频管道，细项隔离
const memoryValue = ref(0) // 高频管道，细项隔离
// 两条管道互不干扰
```

### 5.2 反模式二：高频数据不降频直接写入响应式

```javascript
// ❌ 不做节流，每次推送都写入
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  cpuValue.value = data.cpu // 每秒 30 次 → 30 次渲染
}
```

```javascript
// ✅ 节流后写入
const handleCpuUpdate = throttle((data) => {
  cpuValue.value = data.cpu // 节流到每秒 10 次 → 最多 10 次渲染
}, 100)

ws.onmessage = (event) => {
  realtimeEmitter.emit('realtime:cpu', JSON.parse(event.data))
}
realtimeEmitter.on('realtime:cpu', handleCpuUpdate)
```

### 5.3 反模式三：高频数据不拆分细项

```javascript
// ❌ 一个大 shallowRef 存所有实时指标
const allMetrics = shallowRef({ cpu: 0, memory: 0, network: {} })

// CPU 更新 → allMetrics.value 引用变更 → 所有依赖 allMetrics 的组件都重渲染
// 即使内存图表只关心 memory，也不得不重渲染
```

```javascript
// ✅ 按细项拆分 ref
const cpuValue = ref(0)
const memoryValue = ref(0)

// CPU 更新 → 只有依赖 cpuValue 的组件重渲染
// 内存图表完全不受影响
```

### 5.4 反模式四：组件直接消费底层 ref 而非 computed

```javascript
// ❌ 组件直接绑定底层 ref
// <template>
//   <span>{{ cpuValue.toFixed(1) }}%</span>
// </template>
// 问题：cpuValue 每次变化都触发组件重渲染
// 即使 toFixed(1) 的结果可能没变（75.34 → 75.35，toFixed(1) 都是 "75.3"）
```

```javascript
// ✅ 组件绑定 computed
const cpuPercentText = computed(() => `${cpuValue.value.toFixed(1)}%`)
// <template>
//   <span>{{ cpuPercentText }}</span>
// </template>
// 效果：cpuValue 从 75.34 变到 75.35 → cpuPercentText 仍是 "75.3%"
// → computed 缓存生效 → 组件不重渲染 → 零开销
```

---

## 六、决策指南：何时用哪条管道

### 6.1 频率判定决策树

```
┌─────────────────────────────────────────────────────────────────┐
│                  数据频率判定与管道选择决策树                        │
│                                                                  │
│  拿到一个大型深层对象的数据字段：                                  │
│       ↓                                                          │
│  这个字段的更新频率是多少？                                        │
│       │                                                          │
│       ├─ 用户操作时才变（< 2 次/分钟）                            │
│       │   └→ 低频管道：shallowRef + computed                      │
│       │                                                           │
│       ├─ 定时轮询 / 周期性更新（2~60 次/分钟）                    │
│       │   └→ 中频管道：shallowRef + computed（不需要节流）         │
│       │      或 shallowRef + throttle（如果需要更精细控制）        │
│       │                                                           │
│       ├─ 实时推送（> 60 次/分钟）                                 │
│       │   └→ 高频管道：mitt + 节流防抖 + 细项 ref + computed      │
│       │                                                           │
│       └─ 不确定                                                   │
│           └→ 先用低频管道，性能测试后按需升级到高频管道            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 高频管道内部的选择矩阵

```
┌─────────────────────────────────────────────────────────────────┐
│                  高频管道内部的选择矩阵                              │
│                                                                  │
│  问题                           选择                             │
│  ──────────────────────────    ──────────────────────────────    │
│                                                                  │
│  数据需要被多个组件消费？       是 → mitt 事件总线（一对多广播）  │
│                                 否 → 直接在 composable 中处理    │
│                                                                  │
│  不同指标需要不同的降频策略？   是 → 按细项拆分 ref + 各自节流    │
│                                 否 → 统一节流后写入一个 ref      │
│                                                                  │
│  消费方需要精确的原始值？       是 → ref（精确追踪值变更）        │
│                                 否 → shallowRef（整体替换即可）  │
│                                                                  │
│  数据是标量还是数组/对象？      标量 → ref                        │
│                                 数组/对象 → shallowRef           │
│                                                                  │
│  组件直接绑定还是经过转换？     直接绑定 → ref 即可               │
│                                 需要转换 → computed 终端消费     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 检验清单

```
┌─────────────────────────────────────────────────────────────────┐
│                  分频治理检验清单                                    │
│                                                                  │
│  □ 大型深层对象中的数据是否按更新频率分类？                       │
│    → 低频 / 中频 / 高频                                          │
│                                                                  │
│  □ 低频数据是否使用了 shallowRef + computed？                     │
│    → 不深度代理，整体替换                                        │
│                                                                  │
│  □ 高频数据是否使用了事件总线（mitt）解耦生产和消费？             │
│    → 不在 WebSocket 回调中直接写响应式状态                       │
│                                                                  │
│  □ 高频数据是否有节流/防抖策略？                                  │
│    → 不同数据类型选择合适的降频策略                              │
│                                                                  │
│  □ 高频数据是否按细项拆分为独立的 ref？                           │
│    → 不同领域的指标不共享同一个 ref                              │
│                                                                  │
│  □ 组件是否通过 computed 消费数据（而非直接绑定底层 ref）？       │
│    → computed 作为最后一道去重过滤器                             │
│                                                                  │
│  □ 低频管道和高频管道是否完全隔离？                               │
│    → 高频更新不触发低频 computed 重算                            │
│                                                                  │
│  □ onUnmounted 中是否注销了所有 mitt 事件监听？                   │
│    → 防止内存泄漏                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 七、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Vue 3 大型深层对象的代码组织：按更新频率分频治理                │
│                                                                  │
│   低频数据管道                                                    │
│   → shallowRef + computed                                        │
│   → 声明式、整体替换、零深度代理开销                              │
│   → 适用于：配置、筛选条件、表单元信息                            │
│                                                                  │
│   +                                                              │
│                                                                  │
│   高频数据管道                                                    │
│   → mitt + 节流防抖 + 领域细项导出（ref/shallowRef）              │
│     + computed 终端消费                                          │
│   → 事件驱动、降频控制、领域隔离、精确依赖                        │
│   → 适用于：实时指标、流式数据、动画状态                          │
│                                                                  │
│   =                                                              │
│                                                                  │
│   分频治理的高性能项目                                             │
│   → 不同频率的数据走不同的管道                                    │
│   → 低频管道简洁声明，高频管道精确控制                            │
│   → 两条管道互不干扰，在组件模板中汇合                            │
│   → 性能不是靠"优化"得来的，而是靠"架构设计"得来的               │
│                                                                  │
│   核心思维：                                                      │
│   • 不是所有数据都需要相同的响应式策略                             │
│   • 更新频率决定了数据应该走哪条管道                              │
│   • 低频用声明式（简单、直观），高频用事件驱动（精确、可控）      │
│   • computed 是两条管道共同的终端消费层                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**大型深层对象的性能问题，本质上不是"数据太大"的问题，而是"频率混用"的问题。** 当你把每秒更新 30 次的实时指标和每分钟更新 1 次的页面配置放在同一个响应式管道中时，性能灾难就已经注定了。分频治理的本质是**让每条数据走适合它频率的管道**——低频数据用 shallowRef + computed 简洁声明，高频数据用 mitt + 节流防抖 + 细项导出 + computed 精确控制。两条管道各司其职，互不干扰，最终在组件模板中汇合——这才是大型深层对象代码组织的正确范式。
