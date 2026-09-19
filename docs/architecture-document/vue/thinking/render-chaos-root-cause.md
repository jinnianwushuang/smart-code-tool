# Vue 3 项目卡顿的元凶：逻辑驱动的混乱无序高频无效渲染

> 绝大多数 Vue 3 项目的性能问题，不是框架慢，不是数据量大，不是组件多——**而是业务逻辑以混乱无序的方式触发了大量高频且完全无用的 Vue 渲染**。Vue 的响应式系统忠实地执行了每一次状态变更通知，但这些变更中 80% 以上根本不应该触发渲染。本文深入剖析这一元凶的病灶，给出系统性的根治方案。

---

## 一、一个残酷的事实：你的项目 80% 的渲染都是无用的

### 1.1 什么是"无用渲染"

**无用渲染**指的是：组件的 `setup` / `computed` / `watch` 被响应式系统触发，组件的渲染函数被重新执行，但最终 DOM 没有任何可见变化——或者变化微乎其微，用户完全感知不到。

```
┌─────────────────────────────────────────────────────────────────┐
│                  无用渲染的三种典型形态                             │
│                                                                  │
│  ① 值未变但触发更新                                               │
│     state.count = 1                                              │
│     state.count = 1    ← 值没变，但 reactive 仍然走了 set 拦截    │
│     → 依赖它的 computed 被标记 dirty → 组件重新渲染               │
│                                                                  │
│  ② 中间态触发渲染                                                 │
│     state.a = 'x'     → 触发渲染（但 a 的值用户看不到）            │
│     state.b = 'y'     → 又触发渲染（b 的值用户也看不到）           │
│     state.c = 'z'     → 再触发渲染（c 的值用户还是看不到）         │
│     state.display = computeResult()  → 最终渲染（用户这才看到）   │
│     → 前 3 次渲染全是浪费，只有最后 1 次有意义                     │
│                                                                  │
│  ③ 级联触发雪崩                                                   │
│     修改 state.filter                                             │
│     → watch(filter) 触发 → 修改 state.list                       │
│     → watch(list) 触发 → 修改 state.summary                      │
│     → watch(summary) 触发 → 修改 state.chartData                 │
│     → 4 个 watch 级联执行，每次都可能触发组件渲染                  │
│     → 用户只关心最终结果，中间过程全是无效渲染                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 一个真实的性能灾难场景

```javascript
// ❌ 一个典型的"看起来没问题"的搜索功能
const searchKeyword = ref('')
const searchResults = ref([])
const selectedCategory = ref('all')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const displayList = ref([])
const totalCount = ref(0)
const hasMore = ref(false)

// 监听关键词变化 → 立即搜索
watch(searchKeyword, async (keyword) => {
  loading.value = true // ← 触发 1 次渲染（显示 loading）
  searchResults.value = [] // ← 触发 1 次渲染（清空列表）
  currentPage.value = 1 // ← 触发 1 次渲染（重置页码）

  const res = await searchAPI(keyword, selectedCategory.value)

  searchResults.value = res.list // ← 触发 1 次渲染
  totalCount.value = res.total // ← 触发 1 次渲染
  hasMore.value = res.hasMore // ← 触发 1 次渲染
  loading.value = false // ← 触发 1 次渲染

  // 再计算显示列表
  displayList.value = buildDisplayList(res.list) // ← 触发 1 次渲染
})

// 监听分类变化 → 也搜索
watch(selectedCategory, async (category) => {
  loading.value = true // ← 又触发 1 次渲染
  // ... 同样的逻辑
})

// 监听排序变化 → 也搜索
watch(sortOrder, async (order) => {
  loading.value = true // ← 又触发 1 次渲染
  // ... 同样的逻辑
})

// 用户输入一个字 → 触发 7~8 次渲染
// 用户输入 10 个字 → 触发 70~80 次渲染
// 如果列表有 500 条数据，每次渲染都要做 diff → 性能灾难
```

**问题不在于 Vue 慢，而在于逻辑代码以"每一步都通知"的方式运行。** Vue 的响应式系统忠实地执行了每一次赋值的通知——它不知道这 8 次渲染中只有最后 1 次是有意义的。

---

## 二、病灶解剖：混乱逻辑如何制造无效渲染

### 2.1 病灶一：逐步赋值代替整体替换

```javascript
// ❌ 逐步赋值：每一步都触发响应式通知
function updateFilters(newFilters) {
  filters.keyword = newFilters.keyword // 通知 1
  filters.status = newFilters.status // 通知 2
  filters.sortBy = newFilters.sortBy // 通知 3
  filters.page = 1 // 通知 4
}
// reactive 对象每次属性赋值都会触发依赖通知
// 4 次通知 → 可能导致 4 次 computed 重算 → 4 次渲染

// ❌ 多个 ref 逐步赋值
function resetState() {
  keyword.value = '' // 通知 1
  status.value = 'all' // 通知 2
  page.value = 1 // 通知 3
  list.value = [] // 通知 4
  loading.value = false // 通知 5
}
// 5 个 ref 各自通知 → 5 次响应式更新周期
```

**病灶本质**：把"一次逻辑更新"拆散成了"多次响应式赋值"，每次都触发独立的响应式通知链。Vue 虽然在同一个同步代码块中会做批量合并（microtask 级别），但 `async` 函数中的 `await` 会打断批量——`await` 之后的赋值会开启新的微任务，无法与之前的合并。

### 2.2 病灶二：watch 链式级联

```javascript
// ❌ watch 级联：A 变了触发 B，B 变了触发 C，C 变了触发 D
watch(
  () => state.filter,
  (newFilter) => {
    state.filteredList = computeFilteredList(newFilter) // 修改 B
  },
)

watch(
  () => state.filteredList,
  (newList) => {
    state.summary = computeSummary(newList) // 修改 C
  },
)

watch(
  () => state.summary,
  (newSummary) => {
    state.chartData = buildChartData(newSummary) // 修改 D
  },
)

// filter 变一次 → 3 个 watch 依次执行
// 每次 watch 执行完，Vue 都可能触发一次渲染
// 形成"响应式多米诺骨牌"
```

**病灶本质**：用 `watch` 做数据转换，把本该一次完成的计算链条拆成了多个独立的响应式步骤。每一步都修改一个响应式状态，每一步都可能触发渲染——**这是在用响应式系统模拟同步函数调用栈**，完全违背了声明式的设计初衷。

### 2.3 病灶三：在事件处理中混合"状态准备"和"状态提交"

```javascript
// ❌ 事件处理中逐步构建数据，每步都触发渲染
async function handleSubmit() {
  // 阶段一：准备数据
  formData.value.loading = true // 渲染 1：显示 loading
  formData.value.errors = {} // 渲染 2：清除错误

  // 阶段二：校验
  const errors = validate(formData.value)
  formData.value.errors = errors // 渲染 3：显示错误（即使为空）
  if (Object.keys(errors).length > 0) {
    formData.value.loading = false // 渲染 4：关闭 loading
    return
  }

  // 阶段三：提交
  const result = await submitAPI(formData.value) // await 打断批量
  formData.value.loading = false // 渲染 5
  formData.value.result = result // 渲染 6
  formData.value.successMessage = '提交成功' // 渲染 7
}

// 一个提交操作 → 5~7 次渲染
// 其中"清除错误""显示空错误"对用户来说完全无感
```

### 2.4 病灶四：computed 中隐藏副作用

```javascript
// ❌ computed 中触发副作用，导致不可预测的级联更新
const processedList = computed(() => {
  const result = rawData.value.filter((x) => x.status === 1)

  // 在 computed 中修改另一个响应式状态！
  totalCount.value = result.length // ← 副作用！
  lastUpdateTime.value = Date.now() // ← 副作用！

  return result
})

// 问题：
// 1. rawData 变化 → processedList 重算 → 修改 totalCount → 触发更多渲染
// 2. Vue 3 会警告 "computed should not have side effects"
// 3. 但在复杂项目中，这种隐蔽的副作用很难被发现
```

### 2.5 病灶全景图

```
┌─────────────────────────────────────────────────────────────────────┐
│              Vue 3 项目无效渲染的四大病灶                              │
│                                                                     │
│  ① 逐步赋值          一次逻辑更新被拆成 N 次响应式赋值                │
│     └→ 每次赋值触发独立通知链                                        │
│                                                                     │
│  ② watch 级联        用 watch 链代替同步函数调用                      │
│     └→ A→B→C→D 的多米诺骨牌，每步可能触发渲染                       │
│                                                                     │
│  ③ 准备/提交混合     async 中 await 打断批量更新                     │
│     └→ 中间状态暴露给渲染层                                          │
│                                                                     │
│  ④ computed 副作用   计算过程中修改其他状态                           │
│     └→ 不可预测的级联触发                                            │
│                                                                     │
│  ────────────────────────────────────────────────────────────────    │
│                                                                     │
│  共同特征：                                                          │
│  • 逻辑代码不控制"何时让渲染层知道"                                  │
│  • 把响应式系统当作"实时广播"，而不是"批量同步"                      │
│  • 中间过程被暴露给渲染层，而用户只关心最终结果                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 三、根治方案：让逻辑服从渲染纪律

### 3.1 核心原则：计算完毕再通知

```
┌─────────────────────────────────────────────────────────────────┐
│                  渲染纪律的第一原则                                 │
│                                                                  │
│  ❌ 错误模式：                                                     │
│     改一点 → 通知渲染 → 改一点 → 通知渲染 → 改一点 → 通知渲染    │
│                                                                  │
│  ✅ 正确模式：                                                     │
│     改 → 改 → 改 → 计算 → 计算 → 完成 → 一次性通知渲染            │
│                                                                  │
│  关键：在"完成"之前，不让响应式系统知道任何变化                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 药方一：纯函数算法 + 整体替换

**核心思路**：把所有数据加工逻辑放在纯函数中，纯函数在响应式系统的"视野"之外运行——它不触发任何通知。等纯函数计算完毕，一次性把结果赋值给响应式状态。

```javascript
// ✅ 纯函数：在响应式系统之外运行，零通知
function processSearchResults(rawResults, filters) {
  return rawResults
    .filter((item) => matchFilters(item, filters))
    .sort((a, b) => compareBy(a, b, filters.sortBy, filters.sortOrder))
    .slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize)
    .map((item) => ({
      id: item.id,
      displayName: item.name,
      statusText: STATUS_MAP[item.status],
      scoreText: item.score.toFixed(1),
    }))
}

// ✅ 桥梁层：计算完毕，一次性提交
async function doSearch() {
  // 阶段一：纯计算（不触发任何响应式通知）
  const rawResults = await searchAPI(keyword.value, category.value)
  const displayList = processSearchResults(rawResults, {
    sortBy: sortOrder.value,
    sortOrder: sortOrder.value,
    page: currentPage.value,
    pageSize: pageSize.value,
  })
  const summary = computeSummary(rawResults)

  // 阶段二：一次性提交所有状态变更（同步代码块，Vue 自动批量）
  loading.value = false
  list.value = displayList
  totalCount.value = summary.total
  hasMore.value = summary.hasMore
  // → Vue 在这段同步代码结束后，只触发 1 次渲染
}
```

**为什么有效**：

```
❌ 旧模式：
   loading=true  → 渲染 1
   list=[]       → 渲染 2
   page=1        → 渲染 3
   [await]       → 异步断点
   list=data     → 渲染 4
   total=N       → 渲染 5
   loading=false → 渲染 6
   = 6 次渲染

✅ 新模式：
   [纯函数计算，零通知]
   loading=false; list=data; total=N  → 同步批量 → 1 次渲染
   = 1 次渲染
```

### 3.3 药方二：用 computed 替代 watch 链

**核心思路**：如果 B 的值完全由 A 决定（B = transform(A)），那么 B 应该是 `computed`，不应该是 `watch` + 手动赋值。`computed` 是惰性求值的——它只在被读取时才重算，不会主动触发额外的渲染。

```javascript
// ❌ watch 链：3 个 watch 级联，每次修改都触发渲染
const filter = ref({})
const filteredList = ref([])
const summary = ref({})
const chartData = ref({})

watch(
  filter,
  (f) => {
    filteredList.value = computeFilteredList(f) // 触发渲染 1
  },
  { immediate: true },
)

watch(
  filteredList,
  (list) => {
    summary.value = computeSummary(list) // 触发渲染 2
  },
  { immediate: true },
)

watch(
  summary,
  (s) => {
    chartData.value = buildChartData(s) // 触发渲染 3
  },
  { immediate: true },
)

// ✅ computed 链：惰性求值，读取时才计算，Vue 自动批量
const filter = ref({})

const filteredList = computed(
  () => computeFilteredList(filter.value), // 惰性，不主动执行
)

const summary = computed(
  () => computeSummary(filteredList.value), // 惰性，依赖变化时只标记 dirty
)

const chartData = computed(
  () => buildChartData(summary.value), // 惰性，被读取时才重算
)

// filter 变化时：
// 1. 只有 filter.value 的依赖通知被触发
// 2. filteredList / summary / chartData 被标记为 dirty（但不执行）
// 3. 模板渲染时读取 chartData → 触发整条链的重算 → 一次渲染
// = 1 次渲染，而不是 3 次
```

**computed 链 vs watch 链的本质区别**：

```
watch 链（主动推送模式）：
  A 变化 → watch1 立即执行 → 修改 B → watch2 立即执行 → 修改 C → ...
  每一步都"推"着响应式系统往前走，每步都可能触发渲染

computed 链（惰性拉取模式）：
  A 变化 → computed 标记 dirty（不执行）
  模板读取 computed → 按需重算 → 一次渲染
  只有在"被需要"的时候才"拉"动计算，不会主动推送
```

### 3.4 药方三：async 函数中的"状态快照"模式

**核心思路**：在 async 函数中，用局部变量收集所有中间结果，等全部计算完毕后，一次性同步赋值给响应式状态。

```javascript
// ✅ 状态快照模式：局部变量收集结果，最后一次性提交
async function handleSubmit() {
  // 阶段一：用局部变量准备数据（不触发任何响应式通知）
  const errors = validate(formData.value)

  if (Object.keys(errors).length > 0) {
    // 只在真正需要更新 UI 时，一次性同步赋值
    formErrors.value = errors
    return // 不触发 loading 的变更，因为 loading 从未被修改
  }

  // 阶段二：提交（await 会打断批量，但此时还没修改任何响应式状态）
  const result = await submitAPI(formData.value)

  // 阶段三：全部完成后，一次性同步提交所有状态变更
  loading.value = false
  formErrors.value = {}
  submitResult.value = result
  successMessage.value = '提交成功'
  // → 这段同步代码只触发 1 次渲染
}

// 对比：
// ❌ 旧模式：7 次渲染（每步赋值都触发）
// ✅ 新模式：2 次渲染（开始 loading 1 次 + 完成提交 1 次）
```

### 3.5 药方四：shallowRef 切断响应式追踪

对于大型数据集，使用 `shallowRef` 可以彻底消除深度响应性带来的"意外触发"：

```javascript
// ✅ shallowRef：只有 .value 引用变更才触发通知
const tableData = shallowRef([])

// 修改内部属性 → 不触发任何通知
tableData.value[0].name = 'new name' // 静默
tableData.value.push(newItem) // 静默

// 只有整体替换 → 触发 1 次通知
tableData.value = newData // 通知 1 次

// 对比 ref：
const tableDataRef = ref([])
tableDataRef.value[0].name = 'new name' // 触发通知！因为深度追踪
tableDataRef.value.push(newItem) // 触发通知！因为深度追踪
// 每次修改都可能触发一次"无用的"渲染
```

---

## 四、渲染纪律的完整范式

### 4.1 三层隔离 = 渲染纪律的制度保障

```
┌─────────────────────────────────────────────────────────────────────┐
│                  三层隔离如何保障渲染纪律                              │
│                                                                     │
│  ① 接口原始数据层（api/）                                            │
│     只负责"拿数据"，不修改任何响应式状态                              │
│     → 不可能触发渲染                                                  │
│                                                                     │
│  ② 算法层（transforms/）                                             │
│     纯函数，不 import Vue，不知道响应式系统的存在                      │
│     → 不可能触发渲染                                                  │
│     → 在响应式系统的"视野"之外完成所有数据加工                        │
│                                                                     │
│  ③ 显示数据层（composables/ + 组件）                                  │
│     shallowRef 缓存原始数据                                          │
│     computed 声明"显示数据 = 算法（原始数据）"                        │
│     只在 .value 引用变更时触发 1 次 computed 重算 + 1 次渲染          │
│                                                                     │
│  ────────────────────────────────────────────────────────────────    │
│                                                                     │
│  效果：                                                              │
│  • 数据获取 → 不触发渲染                                             │
│  • 数据加工 → 不触发渲染（纯函数在响应式之外）                        │
│  • 状态提交 → 触发 1 次渲染（整体替换 .value）                       │
│  • 无论数据多复杂、加工多耗时，渲染次数恒定为 1                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 渲染次数预算制

给每个用户操作设定"渲染预算"——一个操作最多允许触发几次渲染：

```
┌─────────────────────────────────────────────────────────────────┐
│                  渲染预算表                                        │
│                                                                  │
│  操作类型              渲染预算        实现方式                    │
│  ─────────────────    ──────────     ──────────────────────────  │
│  数据加载              2 次           loading=true → 数据到位 1 次 │
│  搜索/筛选             1 次           纯函数计算 → 整体替换        │
│  表单提交              2 次           loading=true → 结果到位 1 次 │
│  排序切换              1 次           computed 自动重算            │
│  分页切换              1 次           computed 自动重算            │
│  批量操作              1 次           所有修改完成后整体替换        │
│  拖拽/滚动             0 次           requestAnimationFrame 节流   │
│                                                                  │
│  如果某个操作超出了预算 → 说明逻辑代码违反了渲染纪律               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 完整示例：从混乱到有序

```javascript
// ═══════════════════════════════════════════════════════════════
// ❌ 混乱版：一个页面加载操作触发 10+ 次渲染
// ═══════════════════════════════════════════════════════════════
async function loadDashboard() {
  loading.value = true // 渲染 1
  dashboardData.value = null // 渲染 2

  const userData = await fetchUser()
  user.value = userData // 渲染 3

  const orders = await fetchOrders()
  orderList.value = orders // 渲染 4

  // 在 watch 中：orderList 变化 → 计算统计
  // 在另一个 watch 中：统计变化 → 计算图表
  // 在又一个 watch 中：图表变化 → 更新摘要

  loading.value = false // 渲染 N
}
// 总计：5~10 次渲染，取决于 watch 链的长度

// ═══════════════════════════════════════════════════════════════
// ✅ 有序版：同样的操作，只触发 2 次渲染
// ═══════════════════════════════════════════════════════════════
import { shallowRef, computed } from 'vue'
import { fetchUser, fetchOrders } from '@/api/dashboard-api'
import { buildDashboardData } from '@/transforms/dashboard-transform'

// shallowRef：不追踪内部属性
const rawDashboard = shallowRef(null)
const loading = shallowRef(false)

// computed：惰性求值，读取时才计算
const dashboard = computed(() => {
  if (!rawDashboard.value) return null
  return buildDashboardData(rawDashboard.value.user, rawDashboard.value.orders)
})

async function loadDashboard() {
  loading.value = true // 渲染 1：显示 loading

  // 并行获取数据，用局部变量暂存（不触发响应式通知）
  const [user, orders] = await Promise.all([fetchUser(), fetchOrders()])

  // 纯函数在响应式之外完成所有计算
  // 最后一次性赋值 → 1 次渲染
  rawDashboard.value = { user, orders } // 渲染 2：数据到位
  loading.value = false // 同步赋值，与上面合并为 1 次
}

// 总计：2 次渲染（loading + 数据到位）
// 无论数据多复杂，buildDashboardData 在纯函数中完成，零渲染开销
```

---

## 五、诊断工具：如何发现项目中的无效渲染

### 5.1 Vue DevTools 的渲染追踪

Vue DevTools 的 Performance 面板可以直观地看到每个组件的渲染次数和耗时：

```
诊断步骤：
1. 打开 Vue DevTools → Performance 面板
2. 执行一个用户操作（如搜索、翻页）
3. 观察组件渲染瀑布图：
   • 如果同一个操作触发了大量组件的连续渲染 → 存在无效渲染
   • 如果渲染耗时集中在某些组件 → 这些组件可能是性能瓶颈
4. 对比"期望渲染次数"和"实际渲染次数"：
   • 搜索操作期望 1~2 次渲染，实际 8 次 → 有 6 次无效渲染
```

### 5.2 代码级诊断：渲染计数器

```javascript
// 在组件中临时添加渲染计数器，诊断无效渲染
import { shallowRef, computed, onUpdated } from 'vue'

let renderCount = 0

onUpdated(() => {
  renderCount++
  console.log(`[渲染计数] 组件已更新 ${renderCount} 次`)
})

// 执行一个操作后观察控制台：
// 如果 renderCount 远超预期 → 存在无效渲染
```

### 5.3 代码审查清单

```
┌─────────────────────────────────────────────────────────────────┐
│                  无效渲染代码审查清单                              │
│                                                                  │
│  □ 是否有 watch 中修改响应式状态，然后另一个 watch 监听它？       │
│    → 改用 computed 链                                            │
│                                                                  │
│  □ async 函数中是否有 await 之后的多次逐步赋值？                  │
│    → 改用局部变量收集 + 一次性赋值                                │
│                                                                  │
│  □ reactive 对象是否存储了大量数据（100+ 条记录）？               │
│    → 改用 shallowRef                                             │
│                                                                  │
│  □ computed 中是否有修改其他 ref / reactive 的代码？              │
│    → 把副作用移出 computed，改为在赋值时一并处理                  │
│                                                                  │
│  □ 是否在 for 循环中逐个修改响应式状态？                          │
│    → 先在局部数组/对象中构建结果，再一次性赋值                    │
│                                                                  │
│  □ 是否有 watch(..., { immediate: true }) 在初始化时触发不必要    │
│    的计算？                                                       │
│    → 改用 computed 的惰性求值                                    │
│                                                                  │
│  □ 高频事件（input/scroll/resize）是否直接修改响应式状态？        │
│    → 加 debounce / throttle / requestAnimationFrame              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、思维模型：从"实时广播"到"批量提交"

### 6.1 错误的思维模型

```
❌ 把响应式系统当作"实时广播系统"：
   每次状态变化 → 立即广播给所有监听者 → 立即渲染

   这就像：
   每写一个字 → 就发一条消息给所有人 → 所有人立即回复
   写 100 个字 → 发 100 条消息 → 收到 100 次回复
```

### 6.2 正确的思维模型

```
✅ 把响应式系统当作"事务提交系统"：
   收集所有变更 → 计算完毕 → 一次性提交 → 一次渲染

   这就像：
   写完一整篇文章 → 一次性发送 → 收到 1 次回复

   数据库事务的类比：
   BEGIN TRANSACTION    → 开始收集变更（不通知任何人）
   UPDATE ...           → 修改数据（不通知任何人）
   UPDATE ...           → 修改数据（不通知任何人）
   COMMIT               → 一次性提交 → 触发 1 次渲染
```

### 6.3 一句话总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Vue 3 项目卡顿的元凶：                                        │
│   逻辑代码以"实时广播"的方式操作响应式状态                        │
│   → 每一步修改都触发通知                                         │
│   → 中间过程暴露给渲染层                                         │
│   → 大量高频且无用的渲染消耗性能                                 │
│                                                                  │
│   根治方案：                                                      │
│   纯函数算法（在响应式之外完成计算）                              │
│   + shallowRef（切断深度追踪的意外通知）                          │
│   + computed 惰性求值（替代 watch 链的主动推送）                  │
│   + 整体替换（一次性提交代替逐步赋值）                            │
│   = 每个操作只触发必要的 1~2 次渲染                               │
│                                                                  │
│   思维转变：                                                      │
│   从"每步都通知" → 到"算完再通知"                                │
│   从"实时广播" → 到"事务提交"                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Vue 不慢，是你的逻辑代码太"话多"了。** 它忠实地执行了你发出的每一条通知——如果你能学会"少说多做"，把计算放在纯函数中、把通知控制在必要时机，Vue 的渲染性能会远超你的预期。高性能不是框架给你的，是你用渲染纪律换来的。
