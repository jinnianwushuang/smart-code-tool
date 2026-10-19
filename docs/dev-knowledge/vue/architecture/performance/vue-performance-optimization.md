---
title: Vue 3 性能优化系统手册
tags: ['Vue', '性能优化']
---

# Vue 3 性能优化系统手册

Vue 3 的性能优化围绕响应式系统的精确控制展开。与 React 需要手动 `memo` 不同，Vue 的更新粒度天然更细，但不当使用仍会导致性能问题。本文从渲染控制、计算优化、资源加载、运行时诊断四个维度构建完整的优化体系。

---

## 一、渲染成本控制

### 1.1 `v-once` — 静态内容永不更新

```vue
<template>
  <!-- 只渲染一次，后续 state 变化不影响 -->
  <div v-once class="static-banner">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>
```

**适用场景**：初始化后不再变化的内容（协议文本、版权信息、静态配置展示）。

### 1.2 `v-memo` — 条件性跳过子树更新

```vue
<template>
  <!-- 仅当 selection 变化时才重新渲染列表项 -->
  <div v-memo="[selection]">
    <p>Selected: {{ selection }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
```

**v-memo 的价值**：即使 `items` 变化，只要 `selection` 不变，整棵子树跳过渲染。适用于大列表中只有部分区域需要响应的场景。

### 1.3 `shallowRef` — 减少响应式追踪开销

```ts
// ❌ 深度代理：10000 个对象 = 10000 个 Proxy
const tableData = ref(hugeArray.map((row) => reactive(row)))

// ✅ 浅层代理：只追踪 .value 赋值
const tableData = shallowRef(hugeArray)

// 更新方式：整体替换
tableData.value = [...tableData.value, newRow]

// 或配合 triggerRef 手动触发
import { triggerRef } from 'vue'
tableData.value[0].name = 'updated'
triggerRef(tableData) // 强制通知依赖更新
```

### 1.4 `computed` 缓存 vs 方法调用

```vue
<script setup>
const items = ref([/* 10000 items */])
const keyword = ref('')

// ✅ computed：keyword 不变时不重算
const filtered = computed(() => items.value.filter((i) => i.name.includes(keyword.value)))

// ❌ 方法：每次渲染都重算
function getFiltered() {
  return items.value.filter((i) => i.name.includes(keyword.value))
}
</script>
```

---

## 二、组件级优化

### 2.1 `defineAsyncComponent` — 组件懒加载

```ts
import { defineAsyncComponent } from 'vue'

// 路由级分割
const Dashboard = defineAsyncComponent(() => import('./pages/Dashboard.vue'))

// 带加载状态
const ChartEditor = defineAsyncComponent({
  loader: () => import('./components/ChartEditor.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200, // 200ms 后才显示 loading
  timeout: 10000, // 10s 超时
})
```

### 2.2 `KeepAlive` — 组件状态缓存

```vue
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="['Dashboard', 'UserList']" :max="5">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

**适用场景**：Tab 切换、路由来回跳转时保留组件状态（滚动位置、表单输入、展开状态）。

### 2.3 组件拆分缩小渲染范围

```vue
<!-- ❌ 问题：输入框变化导致大列表重渲染 -->
<template>
  <input v-model="search" />
  <BigList :items="filteredItems" />
</template>

<!-- ✅ 方案：将搜索状态下沉到子组件 -->
<template>
  <SearchBar />
  <!-- search state 在这里 -->
  <BigList :items="allItems" />
  <!-- 不受 search 影响 -->
</template>
```

---

## 三、列表与大数据优化

### 3.1 虚拟滚动

```vue
<script setup>
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(hugeArray, { itemHeight: 48 })
</script>

<template>
  <div v-bind="containerProps" style="height: 600px; overflow: auto">
    <div v-bind="wrapperProps">
      <div v-for="{ data, index } in list" :key="index" style="height: 48px">
        {{ data.name }}
      </div>
    </div>
  </div>
</template>
```

### 3.2 `Object.freeze` 冻结静态大数据

```ts
// 不需要响应式的静态数据：完全跳过 Vue 的代理机制
const STATIC_CONFIG = Object.freeze({
  columns: [/* ... */],
  options: [/* ... */],
})

// 用于表格列配置、图表配置等初始化后不变的数据
```

### 3.3 按频率分频治理

```ts
// 低频数据：shallowRef + computed（声明式管道）
const userData = shallowRef<User | null>(null)
const displayName = computed(() => userData.value?.name ?? '')

// 高频数据：mitt 事件总线 + 节流 + 独立消费
import { ref, onMounted, onUnmounted } from 'vue'
import mitt from 'mitt'

const emitter = mitt()
const mousePos = ref({ x: 0, y: 0 })

let ticking = false
emitter.on('mouse', (pos: { x: number; y: number }) => {
  if (!ticking) {
    requestAnimationFrame(() => {
      mousePos.value = pos
      ticking = false
    })
    ticking = true
  }
})
```

---

## 四、构建时优化

### 4.1 Tree Shaking 友好写法

```ts
// ✅ 具名导入，可被 Tree Shake
import { ref, computed, watch } from 'vue'

// ❌ 默认导入，无法 Tree Shake
import Vue from 'vue'
Vue.ref() // 整个 Vue 对象都被打包
```

### 4.2 编译器宏

```vue
<script setup>
// defineProps / defineEmits 是编译时宏，不产生运行时开销
const props = defineProps<{
  title: string
  count?: number
}>()

// withDefaults 提供默认值，编译时优化
const { title, count = 0 } = withDefaults(defineProps<{
  title: string
  count?: number
}>(), {
  count: 0,
})
</script>
```

### 4.3 代码分割策略

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'chart-vendor': ['echarts', 'vue-echarts'],
        },
      },
    },
  },
})
```

---

## 五、性能诊断

### 5.1 Vue DevTools Performance 面板

操作步骤：

1. 打开 Vue DevTools → Performance 面板
2. 点击「录制」→ 执行目标操作
3. 停止录制 → 查看组件渲染耗时

**关键指标**：

| 指标             | 含义         | 优化目标        |
| ---------------- | ------------ | --------------- |
| Component Render | 组件渲染耗时 | < 16ms（60fps） |
| App Mount        | 应用挂载耗时 | < 500ms         |
| Update Count     | 更新次数     | 越少越好        |

### 5.2 `app.config.performance = true`

```ts
// 开发环境开启性能追踪
const app = createApp(App)
app.config.performance = true

// 控制台会输出组件渲染耗时警告
// [Vue warn]: Component <BigList> rendered in 45ms (threshold: 5ms)
```

### 5.3 性能诊断决策树

```
页面卡顿 / 交互延迟
├── 大量组件不必要的重渲染？
│   ├── 是 → shallowRef 减少追踪 / v-memo 跳过子树
│   └── 否 → 继续
├── computed 计算开销大？
│   ├── 是 → 确认用了 computed 而非方法 / 检查依赖是否过多
│   └── 否 → 继续
├── 列表 DOM 过多？
│   ├── 是 → 虚拟滚动（useVirtualList）
│   └── 否 → 继续
├── 首屏加载慢？
│   └── 是 → defineAsyncComponent + 路由分割 + manualChunks
├── 高频事件（鼠标/滚动）？
│   └── 是 → mitt + requestAnimationFrame 节流
└── 大型对象深度代理？
    └── 是 → shallowRef + Object.freeze
```

---

## 六、Vue vs React 性能优化对比

| 优化手段   | Vue 3                          | React 19                |
| ---------- | ------------------------------ | ----------------------- |
| 跳过渲染   | `v-once` / `v-memo`            | `React.memo`            |
| 缓存计算   | `computed`（自动）             | `useMemo`（手动）       |
| 稳定引用   | 不需要（自动追踪）             | `useCallback`           |
| 缩小范围   | 组件拆分 + 状态下沉            | 组件拆分 + 状态下沉     |
| 懒加载     | `defineAsyncComponent`         | `React.lazy`            |
| 大数据控制 | `shallowRef` + `Object.freeze` | `useSyncExternalStore`  |
| 诊断工具   | Vue DevTools Performance       | React DevTools Profiler |

**核心差异**：Vue 的优化更多是「减少不必要的追踪」，React 的优化更多是「手动声明 memo 边界」。Vue 默认精确，需要主动降低精度来提升性能；React 默认粗糙，需要主动提升精度来减少渲染。

---

## 七、性能优化速查表

| 优化手段               | 适用场景           | 收益                     |
| ---------------------- | ------------------ | ------------------------ |
| `v-once`               | 永不变化的静态内容 | 零后续更新成本           |
| `v-memo`               | 条件性跳过子树     | 大列表局部更新           |
| `shallowRef`           | 大型对象/数组      | 减少 Proxy 开销          |
| `computed`             | 派生数据           | 自动缓存，依赖变化才重算 |
| `defineAsyncComponent` | 路由/重型组件      | 减少首屏 JS 体积         |
| `KeepAlive`            | Tab/路由切换       | 保留状态避免重建         |
| 虚拟滚动               | 100+ 项列表        | DOM 节点从 N 降到 ~20    |
| `Object.freeze`        | 静态配置数据       | 完全跳过代理             |
| 按频率分频             | 多频率状态混合     | 隔离高频更新             |
| `manualChunks`         | 构建配置           | 按需加载第三方库         |
