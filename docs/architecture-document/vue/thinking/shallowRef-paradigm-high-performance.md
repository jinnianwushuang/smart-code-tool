# shallowRef 范式 + 纯粹算法转换 + 合理调度策略 = 完全可控的高性能项目

> Vue 3 的响应式系统是一把双刃剑：`ref` / `reactive` 的深度响应性让开发变得简单，却也在数据量膨胀时成为性能瓶颈。本文提出一套以 `shallowRef` 为基石的性能范式——**用 shallowRef 掌控响应式边界，用纯函数算法掌控数据转换，用调度策略掌控更新节奏**——三者合一，构建完全可控的高性能 Vue 3 项目。

---

## 一、问题的起源：深度响应性的隐性代价

### 1.1 ref / reactive 的"甜蜜陷阱"

Vue 3 的 `ref` 和 `reactive` 默认提供**深度响应性**（Deep Reactivity）——对一个嵌套对象任何层级的属性修改，都会触发依赖追踪和视图更新。这在小型数据场景下极其方便，但在中大型项目中，它会悄悄制造性能灾难。

```javascript
// ❌ 甜蜜陷阱：用 reactive 管理大型列表
const tableData = reactive({
  list: [], // 后端返回的 500 条记录
  filters: {},
  pagination: {},
})

// 每一条记录的每一个字段变更，都会触发深度 proxy 的 set 拦截
// 500 条 × 20 个字段 = 10000 个潜在的响应式触发点
// 而你真正关心的，可能只是"列表整体变了"这一个信号
```

### 1.2 深度响应性的性能成本

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ref / reactive 深度响应性的成本                      │
│                                                                     │
│  ① 初始化成本：递归代理                                               │
│     reactive(obj) → 递归遍历 obj 的每个属性 → 为每个嵌套对象创建 Proxy │
│     500 条记录 × 平均 15 个属性 = 7500+ 个 Proxy 对象                 │
│                                                                     │
│  ② 内存成本：依赖图膨胀                                               │
│     每个被访问的响应式属性都会建立 dep（依赖集合）                      │
│     一个 computed 如果读取了 500 条记录的 3 个字段                     │
│     → 建立 1500 个依赖追踪关系                                       │
│                                                                     │
│  ③ 更新成本：级联触发                                                  │
│     修改任意一个深层属性 → 触发 dep 通知 → 所有依赖它的 effect 重算     │
│     如果 computed 重算结果变了 → 触发组件重新渲染                      │
│                                                                     │
│  ④ GC 成本：Proxy 对象生命周期                                         │
│     深度 Proxy 在对象替换时产生大量废弃 Proxy，增加 GC 压力             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 关键洞察：你真正需要响应的是什么？

在绝大多数业务场景中，数据更新的粒度是**"整体替换"**而非**"局部修改"**：

| 场景             | 实际更新方式              | 需要的响应式粒度           |
| ---------------- | ------------------------- | -------------------------- |
| 接口返回新列表   | 整体替换 `list = newData` | 只需知道"list 引用变了"    |
| 用户修改筛选条件 | 替换 filters 对象         | 只需知道"filters 引用变了" |
| 分页切换         | 整体替换列表数据          | 只需知道"list 引用变了"    |
| 排序切换         | 整体替换列表数据          | 只需知道"list 引用变了"    |

**90% 以上的业务场景，只需要浅层响应性（Shallow Reactivity）——只在 `.value` 引用变更时触发更新，不追踪内部属性变化。**

---

## 二、shallowRef 范式：掌控响应式边界

### 2.1 shallowRef 的核心语义

```javascript
import { shallowRef, triggerRef } from 'vue'

const data = shallowRef({ list: [], total: 0 })

// ✅ 触发更新：替换整个 .value 引用
data.value = { list: newList, total: newList.length }

// ❌ 不触发更新：修改内部属性（shallowRef 不追踪）
data.value.list.push(newItem) // 静默修改，视图不更新
data.value.total = 999 // 静默修改，视图不更新

// ✅ 手动触发：修改内部属性后，显式通知
data.value.list.push(newItem)
triggerRef(data) // 显式触发，视图更新
```

**shallowRef 的语义极其清晰**：

```
shallowRef 的契约：
┌──────────────────────────────────────────────────┐
│                                                    │
│  • 只有 data.value = newValue 才触发响应式更新     │
│  • 内部属性的修改完全在响应式系统"雷达"之下        │
│  • 开发者拥有完全控制权：何时更新，由你决定         │
│  • 没有深度 Proxy，没有递归追踪，没有隐性开销       │
│                                                    │
│  一句话：shallowRef = "我告诉你数据变了，你才变"   │
│                                                    │
└──────────────────────────────────────────────────┘
```

### 2.2 shallowRef vs ref：性能差异的本质

```
┌─────────────────────────────────────────────────────────────────┐
│                     ref 的响应式追踪                              │
│                                                                  │
│   ref({ list: [{ a: 1, b: 2 }, { a: 3, b: 4 }] })              │
│                                                                  │
│   Proxy 层级：                                                    │
│   ref 外层 → .value 对象 → list 数组 → 每个数组元素 → 每个属性    │
│                                                                  │
│   依赖追踪：                                                      │
│   任何 computed / watch 只要读取了 list[0].a                     │
│   → 就建立了从 ref 到 .value 到 list 到 [0] 到 .a 的追踪链      │
│   → 修改 list[0].a 就会触发这个 computed 重算                    │
│                                                                  │
│   成本：O(n) Proxy 对象 + O(n) 依赖追踪                          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     shallowRef 的响应式追踪                       │
│                                                                  │
│   shallowRef({ list: [{ a: 1, b: 2 }, { a: 3, b: 4 }] })       │
│                                                                  │
│   Proxy 层级：                                                    │
│   仅 ref 外层（只追踪 .value 的引用变更）                         │
│                                                                  │
│   依赖追踪：                                                      │
│   computed / watch 读取 data.value                               │
│   → 只建立了从 ref 到 .value 的追踪                              │
│   → 只有 data.value = newValue 才触发重算                        │
│   → 内部怎么改都不会触发                                          │
│                                                                  │
│   成本：O(1) Proxy 对象 + O(1) 依赖追踪                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 shallowRef 范式的核心原则

```
┌─────────────────────────────────────────────────────────────────┐
│                  shallowRef 范式三原则                             │
│                                                                  │
│  原则一：数据不可变更新（Immutable Update）                        │
│  → 永远不修改 shallowRef 内部的属性                               │
│  → 每次更新都创建新对象，整体替换 .value                          │
│  → 让响应式系统的判断逻辑最简单：引用变了 = 需要更新              │
│                                                                  │
│  原则二：算法在响应式之外（Algorithm Outside Reactivity）          │
│  → 数据转换逻辑是纯函数，不依赖响应式 API                         │
│  → 纯函数接收原始数据，返回新的显示数据                           │
│  → 响应式系统只负责"搬运"，不负责"计算"                          │
│                                                                  │
│  原则三：更新时机可控（Controllable Update Timing）                │
│  → 开发者明确知道何时触发更新                                     │
│  → 可以批量合并多次变更为一次更新                                 │
│  → 可以延迟更新到合适的时机（如 nextTick、requestAnimationFrame） │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、纯粹的算法转换：响应式之外的纯计算

### 3.1 为什么算法必须在响应式之外

当 shallowRef 把响应式边界收缩到"引用变更"这一个维度时，**所有内部数据的加工逻辑必须交给纯函数算法**。这是一个自然的架构推论：

```
如果 shallowRef 不追踪内部属性变化
→ 那么内部属性的转换就不能依赖响应式的 computed 自动重算
→ 必须用显式的纯函数调用来完成转换
→ 算法层天然独立于响应式系统
```

这恰好与"数据·算法·显示"三层分离完美契合：

```
① 接口原始数据 → shallowRef 缓存（浅层响应式）
        ↓
② 纯函数算法 → 对原始数据进行加工转换（不依赖 Vue）
        ↓
③ 显示数据 → 写入另一个 shallowRef（或直接赋值给模板绑定的 ref）
        ↓
   Vue 渲染 → 只响应 .value 引用的变更
```

### 3.2 标准写法：shallowRef + 纯函数算法

```javascript
// ── ② 算法层：纯函数，不 import 任何 Vue API ──
// transforms/order-transform.js

/**
 * 将接口原始订单数据转换为表格显示数据
 * 纯函数：同样的输入永远返回同样的输出
 */
export function buildOrderTableData(rawOrders, filters) {
  return rawOrders
    .filter((order) => matchesFilters(order, filters))
    .sort((a, b) => b.created_at - a.created_at)
    .map((order) => ({
      id: order.id,
      orderNo: formatOrderNo(order.order_no),
      customerName: order.customer.name,
      amountText: formatCurrency(order.amount, order.currency),
      statusText: STATUS_MAP[order.status],
      createdAtText: formatDate(order.created_at),
    }))
}

// ── ②③ 桥梁层：shallowRef + 纯函数调用 ──
// composables/useOrderList.js
import { shallowRef, computed } from 'vue'
import { fetchOrders } from '@/api/order-api'
import { buildOrderTableData } from '@/transforms/order-transform'

export function useOrderList() {
  // ① 原始数据：用 shallowRef 缓存，不深度代理
  const rawOrders = shallowRef([])
  const filters = shallowRef({})
  const loading = shallowRef(false)

  // ③ 显示数据：computed 内部调用纯函数算法
  // computed 只在 rawOrders.value 或 filters.value 的引用变更时重算
  const tableData = computed(() => buildOrderTableData(rawOrders.value, filters.value))

  // 数据获取：整体替换 .value，触发一次更新
  async function load() {
    loading.value = true
    try {
      const data = await fetchOrders(filters.value)
      rawOrders.value = data // ✅ 整体替换，触发一次 computed 重算
      // 而不是 rawOrders.value = reactive(data) 创建深度代理
    } finally {
      loading.value = false
    }
  }

  // 筛选变更：整体替换 filters 引用
  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters } // ✅ 新对象，触发更新
  }

  return { tableData, filters, loading, load, updateFilters }
}
```

### 3.3 对比：ref 深度响应 vs shallowRef + 纯函数

```javascript
// ── ❌ 反模式：ref 深度响应 + 组件内混写算法 ──
const orders = ref([]) // 深度代理所有订单对象

async function load() {
  const data = await fetchOrders()
  orders.value = data // 为每条订单创建深度 Proxy

  // 在组件内直接做转换，算法与响应式耦合
  const display = orders.value
    .filter((o) => o.status === selectedStatus.value) // 追踪了每条订单的 status
    .map((o) => ({ ...o, displayAmount: formatCurrency(o.amount) }))
}

// 问题：
// 1. 500 条订单 = 500 个深度 Proxy + 每条订单 N 个属性的依赖追踪
// 2. 如果某条订单的 status 被局部修改，会触发 filter 链重算
// 3. 算法逻辑散落在组件中，不可独立测试

// ── ✅ 正确模式：shallowRef + 纯函数算法 ──
const rawOrders = shallowRef([]) // 不代理内部，O(1) 开销
const selectedStatus = shallowRef('all')

// 算法是纯函数，可独立测试、可缓存、可复用
const tableData = computed(() =>
  buildOrderTableData(rawOrders.value, { status: selectedStatus.value }),
)

async function load() {
  const data = await fetchOrders()
  rawOrders.value = data // 整体替换，触发一次 computed 重算
}

// 优势：
// 1. 0 个深度 Proxy，O(1) 的响应式开销
// 2. 只有 rawOrders.value 引用变更才触发重算，内部修改不会意外触发
// 3. 算法在独立文件中，纯函数，可独立测试
```

---

## 四、合理的调度策略：掌控更新节奏

### 4.1 Vue 调度器的工作机制

Vue 3 的响应式调度器（Scheduler）负责决定"何时执行更新"。理解它是掌控性能的关键：

```
┌─────────────────────────────────────────────────────────────────┐
│                  Vue 3 调度器的核心机制                            │
│                                                                  │
│  ① 异步批量更新                                                   │
│     多个响应式变更在同一同步代码块中 → 只触发一次渲染              │
│     a.value = 1                                                  │
│     b.value = 2    → 合并为一次渲染更新                           │
│     c.value = 3                                                  │
│                                                                  │
│  ② 微任务队列                                                     │
│     更新被推入微任务队列（Promise.then / queueMicrotask）          │
│     在当前同步代码执行完毕后、下一次宏任务之前执行                 │
│                                                                  │
│  ③ computed 的惰性求值                                            │
│     computed 不会在依赖变化时立即重算                              │
│     而是在下次被读取时才重算（Lazy Evaluation）                    │
│     如果从未被读取，就永远不会重算                                 │
│                                                                  │
│  ④ watch 的 flush 时机                                            │
│     flush: 'pre'  → 在 DOM 更新之前执行（默认）                    │
│     flush: 'post' → 在 DOM 更新之后执行                           │
│     flush: 'sync' → 立即同步执行（慎用，破坏批量更新）             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 shallowRef 与调度器的协同

shallowRef 的浅层响应性与 Vue 调度器天然互补：

```
shallowRef.value = newData
       ↓
  触发 shallowRef 的 dep 通知（只有 1 个依赖点）
       ↓
  依赖它的 computed effect 被标记为 dirty
       ↓
  Vue 调度器将更新推入微任务队列
       ↓
  当前同步代码执行完毕
       ↓
  computed 惰性重算：调用纯函数算法 buildTableData()
       ↓
  如果结果引用变了 → 触发组件重新渲染（一次 DOM Patch）
  如果结果引用没变 → 不触发渲染（零开销）
```

**关键优势**：由于 shallowRef 只有一个依赖点（`.value`），调度器只需要处理一个通知 → 一个 computed 重算 → 最多一次渲染。没有深度响应性带来的"一对多"级联触发。

### 4.3 调度策略的三个层级

```
┌─────────────────────────────────────────────────────────────────┐
│                  调度策略的三个层级                                 │
│                                                                  │
│  Level 1：自动批量（Vue 内置）                                    │
│  ─────────────────────────────                                   │
│  利用 Vue 的异步批量机制，同步代码中的多次赋值自动合并             │
│                                                                  │
│  rawOrders.value = newOrders      // 标记 dirty                  │
│  filters.value = newFilters       // 标记 dirty                  │
│  loading.value = false            // 标记 dirty                  │
│  // → 同步代码结束，三次变更合并为一次渲染                        │
│                                                                  │
│  Level 2：手动节流（开发者控制）                                   │
│  ─────────────────────────────                                   │
│  对于高频触发场景（如搜索输入、滚动加载），手动控制更新频率        │
│                                                                  │
│  // 搜索输入：debounce 后更新 shallowRef                          │
│  const debouncedSearch = debounce((keyword) => {                 │
│    searchParams.value = { ...searchParams.value, keyword }       │
│  }, 300)                                                         │
│                                                                  │
│  Level 3：帧调度（极致性能）                                      │
│  ─────────────────────────────                                   │
│  将非关键更新延迟到下一帧，避免阻塞当前帧的渲染                    │
│                                                                  │
│  // 大量数据处理：在下一帧中更新                                  │
│  function processAndRender(hugeData) {                           │
│    const result = heavyTransform(hugeData)  // 同步计算            │
│    requestAnimationFrame(() => {                                 │
│      displayData.value = result           // 下一帧更新视图        │
│    })                                                            │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 triggerRef：精确控制更新时机

`triggerRef` 是 shallowRef 范式中"手动挡"的关键——当你在某些特殊场景下需要就地修改内部属性（而非整体替换），可以用 `triggerRef` 显式触发更新：

```javascript
import { shallowRef, triggerRef } from 'vue'

const chartConfig = shallowRef({
  series: [],
  xAxis: {},
  yAxis: {},
})

// 场景：增量更新图表配置（多个步骤修改内部属性）
function updateChart(newData) {
  // 就地修改，不触发更新
  chartConfig.value.series = buildSeries(newData)
  chartConfig.value.xAxis = buildXAxis(newData)
  chartConfig.value.yAxis = buildYAxis(newData)

  // 所有修改完成后，一次性触发更新
  triggerRef(chartConfig) // ✅ 三次修改 → 一次更新
}

// 对比：如果用 reactive，每次赋值都会触发一次更新
// chartConfig.series = ...  → 触发
// chartConfig.xAxis = ...   → 又触发
// chartConfig.yAxis = ...   → 又触发
// = 3 次更新（或至少 3 次 dep 通知）
```

---

## 五、三者合一：完整的性能范式

### 5.1 公式

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   shallowRef 范式        掌控响应式边界                           │
│   +                                                              │
│   纯粹的算法转换          掌控数据加工逻辑                        │
│   +                                                              │
│   合理的调度策略          掌控更新节奏                             │
│   ─────────────────────────────────────                          │
│   =                                                              │
│   完全可控的高性能项目                                             │
│                                                                  │
│   • 完全可控：开发者决定何时更新、更新什么、更新多少               │
│   • 高性能：零深度代理开销、零级联触发、零意外重算                 │
│   • 可预测：数据流单向、算法确定性、调度可分析                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 完整实战示例

```javascript
// ═══════════════════════════════════════════════════════════════
// 文件结构
// ═══════════════════════════════════════════════════════════════
// src/
// ├── api/user-api.js                    # 接口原始数据层
// ├── transforms/user-transform.js       # 算法层（纯函数）
// ├── composables/useUserDashboard.js    # 桥梁层（shallowRef + 调度）
// └── components/UserDashboard.vue       # 显示层（模板绑定）

// ═══════════════════════════════════════════════════════════════
// ① api/user-api.js — 接口原始数据层
// ═══════════════════════════════════════════════════════════════
export async function fetchUserDashboard(params) {
  const res = await request.get('/api/dashboard/users', { params })
  return res.data // 返回原始数据，不做任何加工
}

// ═══════════════════════════════════════════════════════════════
// ② transforms/user-transform.js — 算法层（纯函数，不 import Vue）
// ═══════════════════════════════════════════════════════════════

/**
 * 将原始用户数据转换为仪表盘显示数据
 * 纯函数：同样的 rawUsers + filters 永远返回同样的结果
 */
export function buildUserDashboard(rawUsers, filters) {
  // 1. 过滤
  const filtered = rawUsers.filter((user) => matchFilters(user, filters))

  // 2. 排序
  const sorted = filtered.sort((a, b) => {
    const key = filters.sortBy || 'score'
    const order = filters.sortOrder === 'asc' ? 1 : -1
    return (a[key] - b[key]) * order
  })

  // 3. 分页
  const start = (filters.page - 1) * filters.pageSize
  const paged = sorted.slice(start, start + filters.pageSize)

  // 4. 映射为显示数据结构
  const tableRows = paged.map((user) => ({
    id: user.id,
    displayName: `${user.first_name} ${user.last_name}`,
    department: getDeptName(user.dept_id),
    score: user.score,
    statusTag: STATUS_CONFIG[user.status],
    lastActiveText: formatRelativeTime(user.last_active_at),
  }))

  // 5. 计算统计摘要
  const summary = {
    total: filtered.length,
    avgScore: Math.round(filtered.reduce((sum, u) => sum + u.score, 0) / filtered.length),
    activeCount: filtered.filter((u) => u.status === 'active').length,
  }

  return { tableRows, summary, total: filtered.length }
}

// ═══════════════════════════════════════════════════════════════
// ②③ composables/useUserDashboard.js — 桥梁层（shallowRef + 调度）
// ═══════════════════════════════════════════════════════════════
import { shallowRef, computed } from 'vue'
import { fetchUserDashboard } from '@/api/user-api'
import { buildUserDashboard } from '@/transforms/user-transform'

export function useUserDashboard() {
  // ── 原始数据：shallowRef 缓存，不深度代理 ──
  const rawUsers = shallowRef([])
  const loading = shallowRef(false)

  // ── 显示参数：shallowRef，整体替换 ──
  const filters = shallowRef({
    keyword: '',
    status: 'all',
    sortBy: 'score',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20,
  })

  // ── 显示数据：computed 自动同步 ──
  // 只在 rawUsers.value 或 filters.value 引用变更时重算
  const dashboard = computed(() => buildUserDashboard(rawUsers.value, filters.value))

  // ── 数据获取 ──
  async function load() {
    loading.value = true
    try {
      const data = await fetchUserDashboard(filters.value)
      rawUsers.value = data // ✅ 整体替换，一次更新
    } finally {
      loading.value = false
    }
  }

  // ── 筛选更新：整体替换 filters 引用 ──
  function updateFilters(partial) {
    filters.value = { ...filters.value, ...partial } // ✅ 新对象引用
  }

  return { dashboard, filters, loading, load, updateFilters }
}

// ═══════════════════════════════════════════════════════════════
// ③ components/UserDashboard.vue — 显示层
// ═══════════════════════════════════════════════════════════════
// <script setup>
// import { useUserDashboard } from '@/composables/useUserDashboard'
//
// const { dashboard, filters, loading, load, updateFilters } = useUserDashboard()
//
// onMounted(() => load())
// </script>
//
// <template>
//   <div class="dashboard">
//     <div class="summary">
//       <span>总计：{{ dashboard.summary.total }}</span>
//       <span>平均分：{{ dashboard.summary.avgScore }}</span>
//       <span>活跃：{{ dashboard.summary.activeCount }}</span>
//     </div>
//     <table>
//       <tr v-for="row in dashboard.tableRows" :key="row.id">
//         <td>{{ row.displayName }}</td>
//         <td>{{ row.department }}</td>
//         <td>{{ row.score }}</td>
//         <td>{{ row.statusTag.label }}</td>
//         <td>{{ row.lastActiveText }}</td>
//       </tr>
//     </table>
//   </div>
// </template>
```

### 5.3 数据流全景图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    shallowRef 范式的数据流全景                        │
│                                                                     │
│  后端 API                                                           │
│     ↓ HTTP Response（原始 JSON）                                     │
│                                                                     │
│  ① api/user-api.js                                                  │
│     ↓ 返回原始数据，不做加工                                         │
│                                                                     │
│  ② shallowRef 缓存                                                  │
│     rawUsers.value = rawData   ← 整体替换，一次响应式通知            │
│     ↓                                                               │
│                                                                     │
│  ② transforms/user-transform.js（纯函数算法）                       │
│     buildUserDashboard(rawUsers.value, filters.value)               │
│     ↓ 过滤 → 排序 → 分页 → 映射 → 统计                              │
│     ↓ 输出：{ tableRows, summary, total }                           │
│                                                                     │
│  ③ computed 自动同步                                                │
│     dashboard.value = 算法输出   ← 引用变更才触发                    │
│     ↓                                                               │
│                                                                     │
│  ③ Vue 模板渲染                                                     │
│     v-for="row in dashboard.tableRows"                              │
│     ↓ 一次 DOM Patch                                                 │
│                                                                     │
│  用户看到更新后的界面                                                 │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                     │
│  性能特征：                                                          │
│  • 响应式开销：O(1)，与数据量无关                                    │
│  • 算法开销：O(n)，但纯函数可缓存、可 Worker                        │
│  • 渲染开销：一次 DOM Patch，由 Vue Diff 算法优化                   │
│  • 更新次数：每次操作最多触发 1 次 computed + 1 次渲染              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 六、反模式对照

### 6.1 反模式一：reactive 管理大型数据集

```javascript
// ❌ reactive 深度代理大型列表
const state = reactive({
  users: [], // 500 条记录，每条 20 个字段
  selectedIds: [],
  filters: {},
})

// 问题：
// 1. 500 × 20 = 10000 个 Proxy 对象
// 2. 任何字段的修改都会触发依赖追踪
// 3. 内存占用高，GC 压力大
```

```javascript
// ✅ shallowRef + 整体替换
const users = shallowRef([])
const selectedIds = shallowRef([])
const filters = shallowRef({})

// 优势：
// 1. 0 个深度 Proxy
// 2. 只有 .value 引用变更才触发更新
// 3. 内存占用极低
```

### 6.2 反模式二：在 watch 中做数据转换

```javascript
// ❌ 在 watch 回调中混写算法和状态修改
watch(rawData, (newData) => {
  // 算法逻辑散落在 watch 中
  const processed = newData
    .filter((x) => x.status === 1)
    .map((x) => ({ ...x, label: formatLabel(x) }))
  tableData.value = processed
  summary.value = calculateSummary(processed)
  chartData.value = buildChartData(processed)
  // ... 更多转换逻辑
})
```

```javascript
// ✅ 算法在纯函数中，computed 自动调度
const tableData = computed(() => buildTableData(rawData.value, filters.value))
const summary = computed(() => buildSummary(tableData.value))
const chartData = computed(() => buildChartData(tableData.value))

// 优势：
// 1. 每个 computed 职责单一，可独立测试
// 2. computed 惰性求值，未被读取的不重算
// 3. Vue 调度器自动批量处理
```

### 6.3 反模式三：滥用 triggerRef

```javascript
// ❌ 频繁 triggerRef，破坏了批量更新的优势
function addItems(newItems) {
  for (const item of newItems) {
    list.value.items.push(item)
    triggerRef(list) // 每次 push 都触发一次更新 → N 次渲染
  }
}
```

```javascript
// ✅ 批量修改后一次性 triggerRef
function addItems(newItems) {
  // 创建新数组（不可变更新）
  list.value = {
    ...list.value,
    items: [...list.value.items, ...newItems],
  }
  // 一次赋值 → 一次更新
}
```

---

## 七、适用场景与边界

### 7.1 何时使用 shallowRef 范式

| 场景                   | 适用性      | 原因                             |
| ---------------------- | ----------- | -------------------------------- |
| 大型列表/表格数据      | ✅ 强烈推荐 | 深度代理开销与数据量成正比       |
| 接口返回的复杂嵌套对象 | ✅ 强烈推荐 | 避免递归 Proxy 的内存开销        |
| 图表配置数据           | ✅ 推荐     | 配置对象通常整体替换             |
| 表单数据（少量字段）   | ⚠️ 可选     | 数据量小，深度响应性的开销可忽略 |
| 需要局部编辑的嵌套状态 | ⚠️ 谨慎     | 需要手动 triggerRef 或整体替换   |

### 7.2 何时不需要 shallowRef

- **小型组件**：只有几个简单字段，`ref` / `reactive` 的开销可忽略
- **表单场景**：需要双向绑定到深层输入字段，`reactive` 更方便
- **原型开发**：先跑通逻辑，再优化性能

### 7.3 检验清单

- [ ] 数据量超过 100 条的列表/数组，是否使用了 `shallowRef`？
- [ ] 算法转换逻辑是否在纯函数中（不 import Vue API）？
- [ ] 更新数据时是否采用整体替换（而非修改内部属性）？
- [ ] 是否存在不必要的 `triggerRef` 调用（在循环中频繁触发）？
- [ ] `computed` 是否只调用了纯函数算法（而非包含副作用）？
- [ ] 高频操作（搜索输入、滚动）是否有节流/防抖策略？

---

## 八、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Vue 3 高性能项目的性能方程式：                                  │
│                                                                  │
│   shallowRef 范式                                                │
│   → 把响应式的边界收缩到"引用变更"这一个维度                     │
│   → 消除深度 Proxy 的内存和计算开销                              │
│   → 让开发者完全掌控"何时更新"                                   │
│                                                                  │
│   +                                                              │
│                                                                  │
│   纯粹的算法转换                                                  │
│   → 数据加工逻辑是纯函数，独立于框架和响应式                     │
│   → 可测试、可缓存、可复用、可 Worker                            │
│   → 算法的确定性让性能可预测                                     │
│                                                                  │
│   +                                                              │
│                                                                  │
│   合理的调度策略                                                  │
│   → 利用 Vue 内置的异步批量更新                                  │
│   → 高频场景手动节流/防抖                                        │
│   → 非关键更新延迟到下一帧                                       │
│                                                                  │
│   =                                                              │
│                                                                  │
│   完全可控的高性能项目                                             │
│   → 性能不依赖框架的"黑魔法"，而是架构决策的结果                 │
│   → 每一分性能提升都可解释、可度量、可复现                       │
│   → 开发者对系统的掌控力达到最大                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**性能不是优化出来的，是设计出来的。** shallowRef 范式的本质不是"避免深度响应性的性能损失"，而是**从架构层面让性能成为一个可控的、可预测的属性**——就像纯函数算法让数据转换变得可预测一样。当你把响应式边界、算法逻辑、调度策略三者都掌控在手中时，高性能不是目标，而是自然的结果。
