---
title: Vue 3 响应式系统架构
tags: ['Vue', '响应式']
---

# Vue 3 响应式系统架构

Vue 3 的响应式系统是整个框架的核心引擎。它基于 ES6 Proxy 实现了自动依赖收集与精确更新，是 Vue 区别于 React（手动 memo）和 Flutter（Widget 重建）的根本差异所在。本文从架构角度系统梳理响应式系统的设计原理、调度机制与工程实践。

---

## 一、响应式核心机制

### 1.1 三大原语：ref / reactive / computed

```ts
import { ref, reactive, computed } from 'vue'

// ref：包装单值，通过 .value 访问
const count = ref(0)
count.value++ // 触发更新

// reactive：包装对象，深层响应式
const state = reactive({
  user: { name: 'Alice', age: 25 },
  items: [1, 2, 3],
})
state.user.name = 'Bob' // 触发更新（深层）

// computed：声明式派生，自动依赖追踪
const doubleCount = computed(() => count.value * 2)
// doubleCount.value 在 count 变化时自动重算
```

**ref vs reactive 选型**：

| 维度     | `ref`                   | `reactive`                        |
| -------- | ----------------------- | --------------------------------- |
| 适用类型 | 任意值（原始值 + 对象） | 仅对象/数组/Map/Set               |
| 访问方式 | `.value`                | 直接访问属性                      |
| 解构     | 保持响应式              | 丢失响应式（需 `toRefs`）         |
| 整体替换 | `count.value = 10` ✅   | `state = newState` ❌（断开代理） |
| 性能     | 浅层包装，开销小        | 深层代理，开销大                  |
| 推荐场景 | 通用首选                | 表单对象、配置对象                |

### 1.2 shallowRef / shallowReactive — 性能关键

```ts
import { shallowRef, triggerRef } from 'vue'

// shallowRef：只代理 .value 的赋值，不深层追踪
const data = shallowRef({ list: [1, 2, 3], meta: { total: 3 } })

data.value.list.push(4) // ❌ 不触发更新（深层修改不追踪）
data.value = { ...data.value, list: [...data.value.list, 4] } // ✅ 触发更新
triggerRef(data) // ✅ 手动触发（强制更新依赖）
```

**架构意义**：对于大型对象（ECharts 实例、地图数据、万级列表数据），`shallowRef` 避免了深度代理的巨大开销，是 Vue 性能优化的核心手段。

---

## 二、依赖收集与触发

### 2.1 底层实现：Proxy + effect + track/trigger

```
响应式更新流程：

  ① 组件 setup() 执行
     └── 创建 Render Effect（渲染副作用）
         └── 执行 render 函数
             └── 读取 count.value
                 └── Proxy get 拦截 → track()
                     └── 记录：count → [当前 Render Effect]

  ② 用户操作：count.value++
     └── Proxy set 拦截 → trigger()
         └── 查找：count → [Render Effect]
             └── 调度器将 Effect 推入微任务队列
                 └── 下一个 Tick 执行批量更新
```

### 2.2 依赖收集的自动性

```ts
// Vue 的依赖收集是隐式的——不需要手动声明
const firstName = ref('John')
const lastName = ref('Doe')

// computed 自动追踪 firstName 和 lastName
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 模板自动追踪 count
// <div>{{ count }}</div>
// 等价于隐式创建了 Render Effect
```

**与 React 的核心差异**：

| 维度     | Vue 响应式         | React 手动 memo                |
| -------- | ------------------ | ------------------------------ |
| 依赖声明 | 隐式（自动追踪）   | 显式（依赖数组）               |
| 更新粒度 | 精确到被读取的变量 | 组件级（整个函数重跑）         |
| 心智负担 | 低（自动工作）     | 高（useMemo/useCallback 决策） |
| 调试难度 | 中（追踪链不直观） | 低（React DevTools 可视化）    |

### 2.3 依赖收集的边界

```ts
// ❌ 条件分支中的依赖：只在条件为 true 时追踪
const show = ref(true)
const data = ref({ x: 1 })
const result = computed(() => {
  if (show.value) {
    return data.value.x // 追踪了 data
  }
  return 0 // data 未被追踪
})

// ✅ 每次 computed 重算时重新收集依赖
show.value = false // 此时 data 的依赖被清除
// 后续修改 data.value.x 不再触发 result 重算
```

---

## 三、调度器（Scheduler）

### 3.1 异步批量更新

```ts
const count = ref(0)

count.value = 1
count.value = 2
count.value = 3

// Vue 不会立即更新 DOM
// 而是将更新推入微任务队列，在下一个 Tick 批量执行
// 最终 DOM 只更新一次：count = 3

// nextTick 等待 DOM 更新完成
import { nextTick } from 'vue'

count.value = 10
await nextTick()
// 此时 DOM 已更新
```

### 3.2 调度器在事件循环中的位置

```
一个事件循环 Tick：

  ① 宏任务：事件回调（如 click handler）
     └── 同步修改多个 ref
         └── 调度器收集所有受影响的 Effect

  ② 微任务队列：
     └── flushPreFlushCbs（pre 侦听器）
     └── 渲染更新（Render Effect 批量执行）
     └── flushPostFlushCbs（post 侦听器）

  ③ 浏览器渲染（Layout → Paint → Composite）
```

### 3.3 侦听器的调度

```ts
import { watch, watchEffect } from 'vue'

const count = ref(0)

// watchEffect：立即执行，自动追踪依赖
watchEffect(() => {
  console.log(count.value) // 首次立即执行
})

// watch：惰性侦听，只在依赖变化时执行
watch(count, (newVal, oldVal) => {
  console.log(`changed: ${oldVal} → ${newVal}`)
})

// watch 的 flush 时机
watch(count, cb, { flush: 'pre' }) // 默认：渲染前（微任务）
watch(count, cb, { flush: 'post' }) // 渲染后（微任务）
watch(count, cb, { flush: 'sync' }) // 同步（立即，不推荐）
```

---

## 四、响应式系统的工程实践

### 4.1 避免响应式丢失

```ts
// ❌ 解构 reactive 丢失响应式
const state = reactive({ x: 1, y: 2 })
const { x, y } = state // x, y 是普通值，不响应

// ✅ 方案一：toRefs
const { x, y } = toRefs(state) // x.value, y.value 保持响应式

// ✅ 方案二：直接访问
state.x // 保持响应式

// ❌ 赋值整个对象断开代理
let state = reactive({ count: 0 })
state = reactive({ count: 1 }) // 旧代理断开

// ✅ 方案：用 ref 包裹
const state = ref({ count: 0 })
state.value = { count: 1 } // ✅ ref 的 .value 赋值保持响应式
```

### 4.2 避免不必要的深层代理

```ts
// ❌ 大型数组用 reactive：每个元素都被代理
const list = reactive(hugeArray) // 10000 个对象 = 10000 个 Proxy

// ✅ 方案一：shallowRef + 整体替换
const list = shallowRef(hugeArray)
list.value = [...list.value, newItem] // 只代理一次

// ✅ 方案二：冻结不需要响应的数据
const list = shallowRef(Object.freeze(hugeArray))
// 完全跳过代理，性能最优
```

### 4.3 computed vs watch 选择

```ts
// ✅ 派生数据用 computed（声明式、有缓存）
const filtered = computed(() => items.value.filter((i) => i.active))

// ✅ 副作用用 watch（命令式、无返回值）
watch(userId, async (id) => {
  const data = await fetchUser(id)
  userData.value = data
})

// ❌ 反模式：用 watch 做可以用 computed 做的事
watch(items, (newItems) => {
  filtered.value = newItems.filter((i) => i.active) // 多余！
})
```

---

## 五、响应式系统与 React/Flutter 的对比

| 维度         | Vue 3 响应式         | React useState          | Flutter setState                  |
| ------------ | -------------------- | ----------------------- | --------------------------------- |
| 更新触发     | Proxy 自动追踪       | 手动 setState           | 手动 setState                     |
| 更新粒度     | 精确到变量           | 组件级                  | Widget 子树级                     |
| 派生数据     | computed（自动缓存） | useMemo（手动声明依赖） | 无内建（手动计算）                |
| 副作用       | watch / watchEffect  | useEffect               | initState / didChangeDependencies |
| 深层追踪     | 默认深层（reactive） | 无概念                  | 无概念                            |
| 性能优化方向 | shallowRef 减少追踪  | memo 减少渲染           | const Widget + RepaintBoundary    |

---

## 六、响应式系统速查表

| 问题             | 方案                                   |
| ---------------- | -------------------------------------- |
| 单值/通用        | `ref`                                  |
| 对象/表单        | `reactive` + `toRefs`                  |
| 大型对象/数组    | `shallowRef` + 整体替换                |
| 派生数据         | `computed`（有缓存，自动追踪）         |
| 副作用           | `watch`（惰性）/ `watchEffect`（立即） |
| 等待 DOM 更新    | `await nextTick()`                     |
| 手动触发更新     | `triggerRef()`                         |
| 解构保持响应式   | `toRefs()` / `toRef()`                 |
| 只读派生         | `computed` 返回只读 ref                |
| 冻结数据跳过代理 | `shallowRef(Object.freeze(data))`      |
