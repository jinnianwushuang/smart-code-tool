---
title: Vue 标准化架构中的数据·算法·显示分离
order: 90
---

# Vue 标准化架构 — 数据·算法·显示 三者分离

> Vue 的响应式系统和 Composition API 天然为三层分离提供了基础设施。本文从 Vue 标准化装配架构的视角，阐述三者分离在 Vue 生态中的现代化落地方式——它不是额外引入的设计模式，而是对 Vue 架构本质的回归。

---

## 一、Vue 框架与三层分离的天然契合

### 1.1 Vue 响应式系统本身就是一次三层分离

Vue 3 的响应式系统（`reactive` / `ref` / `computed` / `watch`）本质上就是在做一件事：**把"数据"和"渲染"解耦，让框架自动完成同步。**

```
开发者声明式地描述：显示数据（ref/reactive）
                          ↓
              Vue 的响应式调度器（Scheduler）
                          ↓
              自动触发 DOM 更新（渲染层）
```

开发者不需要手动操作 DOM，只需要维护好"显示数据"，Vue 负责把它同步到界面。这就是三层分离中 **③ 显示数据 → 框架渲染** 的自动化。

### 1.2 Composition API 让三层边界显式化

Options API 时代，`data`、`computed`、`methods`、`watch` 虽然逻辑上分层，但在组件选项中是"平铺"的，边界模糊。Composition API 彻底改变了这一点：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vue 组件中的三层映射                           │
│                                                                  │
│   ① 接口原始数据层                                                │
│      → api/ 目录下的请求函数，返回原始 response                   │
│      → 单例模板中的 api-request/ 模块                            │
│                                                                  │
│   ② 算法层                                                       │
│      → composables/ 目录下的 use-*.js（纯逻辑，不 import Vue）    │
│      → 或 composable 内部的纯函数部分                             │
│                                                                  │
│   ③ 显示数据层                                                    │
│      → ref() / reactive() 声明的响应式状态                        │
│      → computed() 派生的展示用数据                                │
│      → 模板直接绑定的数据结构                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、Vue 标准化装配架构中的三层体现

### 2.1 标准化模板的目录结构即三层分离

```
standardization/multiton-template/
├── index.vue                    # ③ 显示层：主组件，只管布局和绑定
├── assembler/                   # 胶水层：装配器，串联三层
│   └── assembler.js
├── state/                       # ③ 显示数据层 + ② 算法层的交界
│   ├── config.js                # 配置（属于显示数据的元信息）
│   ├── multiton.js              # 多例状态聚合（显示数据）
│   ├── computed.js              # 计算属性（算法 → 显示数据的桥梁）
│   └── singleton/               # 单例状态模块
│       ├── table.js             # 表格显示数据
│       └── dialog.js            # 对话框显示数据
├── module/                      # ② 算法层的主要承载
│   ├── lifecycle/               # 生命周期钩子（串联数据获取和状态更新）
│   ├── event/                   # 事件处理（用户交互 → 算法 → 状态更新）
│   ├── effect/                  # 副作用（watch、DOM 操作等）
│   └── api-request/             # ① 接口原始数据层（单例模板特有）
│       └── *.js                 # 每个文件对应一个 API 请求
└── components/                  # ③ 显示层：可复用 UI 子组件
```

**关键洞察**：标准化模板的目录结构，天然就是三层分离的物理体现。`api-request/` 是数据获取层，`state/` 和 `computed/` 是显示数据和算法的交汇，`module/` 中的 `lifecycle/` 和 `event/` 承载业务算法，`index.vue` 和 `components/` 是纯粹的显示层。

### 2.2 装配器是三层之间的"粘合剂"

装配器（`assembler.js`）通过 `import.meta.glob()` 自动扫描并组装各模块，它的角色相当于浏览器渲染管线中的**调度器**——不需要手动编排每一层的执行顺序，框架自动完成。

```javascript
// 装配器的本质：自动发现并组合三层模块
const lifecycleModules = import.meta.glob('./module/lifecycle/*.js', { eager: true })
const eventModules = import.meta.glob('./module/event/*.js', { eager: true })
const effectModules = import.meta.glob('./module/effect/*.js', { eager: true })

// 装配：把原始数据层、算法层、显示数据层粘合在一起
export function useContextAssembler(context) {
  // 1. 初始化显示数据（state/）
  // 2. 注册生命周期钩子（module/lifecycle/）→ 在这里调用 API 获取原始数据
  // 3. 注册事件处理（module/event/）→ 在这里执行业务算法
  // 4. 注册副作用（module/effect/）→ 在这里监听数据变化并响应
}
```

---

## 三、Composable：Vue 中算法层的最佳载体

### 3.1 Composable 的双重身份

在 Vue 生态中，Composable（`use-*.js`）有两种定位：

| 定位                  | 说明                                         | 示例                                    |
| --------------------- | -------------------------------------------- | --------------------------------------- |
| **框架内 Composable** | 使用 `ref` / `computed` / `watch` 等 Vue API | `useTableData()` 返回响应式状态         |
| **纯函数 Composable** | 不依赖任何 Vue API，纯 JavaScript            | `transformUserData(rawData)` 纯数据转换 |

**三层分离要求**：算法层的核心逻辑应该是**纯函数 Composable**，只在最外层用 `ref` / `computed` 包装以接入响应式系统。

### 3.2 标准写法：从原始数据到显示数据

```javascript
// ── ① 接口原始数据层 ──
// api/user-api.js
export async function fetchUserList(params) {
  const res = await request.get('/api/users', { params })
  return res.data   // 返回原始数据，不做加工
}

// ── ② 算法层（纯函数）──
// transforms/user-transform.js（不 import 任何 Vue API）
export function buildUserTableData(rawList, filters) {
  return rawList
    .filter(user => matchesFilters(user, filters))
    .sort((a, b) => b.score - a.score)
    .map(user => ({
      id: user.id,
      displayName: `${user.first_name} ${user.last_name}`,
      departmentName: getDepartmentName(user.dept_id),
      statusText: STATUS_MAP[user.status],
      lastLoginText: formatRelativeTime(user.last_login_at),
    }))
}

// ── ②③ 桥梁层（Composable，接入响应式）──
// composables/useUserList.js
import { ref, computed } from 'vue'
import { fetchUserList } from '@/api/user-api'
import { buildUserTableData } from '@/transforms/user-transform'

export function useUserList() {
  const rawUsers = ref([])       // 原始数据的响应式缓存
  const filters = ref({})        // 显示数据的过滤条件
  const loading = ref(false)

  // 显示数据 = 算法（原始数据 + 过滤条件）
  const tableData = computed(() =>
    buildUserTableData(rawUsers.value, filters.value)
  )

  async function load() {
    loading.value = true
    try {
      rawUsers.value = await fetchUserList(filters.value)  // 拿原始数据
    } finally {
      loading.value = false
    }
  }

  return { tableData, filters, loading, load }
}

// ── ③ 显示层（组件）──
// components/UserTable.vue
<script setup>
import { useUserList } from '@/composables/useUserList'

const { tableData, filters, loading, load } = useUserList()
// 组件只关心 tableData 的结构，不关心它是怎么算出来的
</script>

<template>
  <table>
    <tr v-for="row in tableData" :key="row.id">
      <td>{{ row.displayName }}</td>
      <td>{{ row.departmentName }}</td>
      <td>{{ row.statusText }}</td>
    </tr>
  </table>
</template>
```

### 3.3 computed 是算法层到显示数据层的"自动管道"

Vue 的 `computed` 是三层分离中最精妙的设计：

```
原始数据变化 → computed 自动重新执行算法 → 显示数据自动更新 → DOM 自动刷新
```

它让算法层和显示数据层之间建立了**声明式的自动同步**，开发者不需要手动调用转换函数，不需要手动触发更新——只需要声明"显示数据 = 算法（原始数据）"这个关系。

这与浏览器的渲染管线高度一致：

```
浏览器：HTML 变化 → 自动重新解析 → 自动重新布局 → 自动重新绘制
Vue：   原始数据变化 → computed 自动重算 → ref 自动更新 → DOM 自动刷新
```

---

## 四、Pinia Store 中的三层分离

### 4.1 Store 的三层职责划分

当使用 Pinia 进行全局状态管理时，三层分离同样适用：

```javascript
// stores/order.js
import { defineStore } from 'pinia'
import { fetchOrders } from '@/api/order-api'
import { buildOrderSummary } from '@/transforms/order-transform'

export const useOrderStore = defineStore('order', () => {
  // ① 原始数据层
  const rawOrders = ref([])

  // ③ 显示数据层
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ② 算法层（通过 computed 自动同步到显示数据）
  const summaryData = computed(() =>
    buildOrderSummary(rawOrders.value, {
      keyword: searchKeyword.value,
      page: currentPage.value,
      size: pageSize.value,
    }),
  )

  // 数据获取（原始数据层的行为）
  async function loadOrders() {
    rawOrders.value = await fetchOrders()
  }

  return { rawOrders, searchKeyword, currentPage, pageSize, summaryData, loadOrders }
})
```

### 4.2 关键规则

| 规则                                | 说明                                         |
| ----------------------------------- | -------------------------------------------- |
| Store 不直接暴露原始 API 响应给组件 | 组件通过 `computed` 获取加工后的显示数据     |
| 算法逻辑放在独立的 transform 文件中 | Store 文件只负责状态编排，不负责数据转换细节 |
| 组件不直接修改 rawOrders            | 通过 action 修改，保持数据流单向             |

---

## 五、Vue 特有优势：模板编译器是天然的"显示层编译器"

### 5.1 模板 = 纯粹的显示声明

Vue 的模板编译器把 `<template>` 编译为渲染函数，这个过程本身就是一次**从声明到像素的编译**——和浏览器把 HTML/CSS 编译为渲染树如出一辙。

```
Vue 模板（声明"长什么样"）
    ↓ 模板编译器
渲染函数（描述"怎么创建 VNode"）
    ↓ Virtual DOM Diff
Patch 操作（最小化 DOM 更新）
    ↓
浏览器绘制（像素输出）
```

这意味着 Vue 的模板层可以**完全不知道**数据是怎么来的、经过了什么算法——它只需要声明"给定这些数据时，界面长什么样"。这就是三层分离中显示层的终极形态：**纯粹的声明式映射**。

### 5.2 v-for + computed = 数据驱动的列表渲染

```html
<!-- 模板只关心：拿到什么数据就渲染什么 -->
<table>
  <tr v-for="item in processedList" :key="item.id">
    <td>{{ item.displayName }}</td>
    <td>{{ item.statusText }}</td>
  </tr>
</table>
```

```javascript
// processedList 是算法层的输出
const processedList = computed(() => buildTableData(rawData.value, filters.value))
```

模板不关心 `rawData` 从哪来、`buildTableData` 怎么算——它只绑定最终的 `processedList`。这和浏览器的 Compositor 不关心 HTML 从哪来、只关心图层怎么合成，是完全同构的。

---

## 六、Vue 标准化架构中的"防火墙"检验

### 6.1 三层独立可测试

```javascript
// ✅ 算法层可脱离 Vue 环境独立测试
import { buildUserTableData } from './user-transform'

test('buildUserTableData 过滤并排序', () => {
  const raw = [
    { id: 1, status: 1, score: 80 },
    { id: 2, status: 0, score: 90 },
  ]
  const result = buildUserTableData(raw, {})
  expect(result).toHaveLength(1)
  expect(result[0].id).toBe(1)
})
// 不需要 mount 组件，不需要 mock Vue 的响应式系统
```

### 6.2 三层可独立替换

| 替换场景                       | 需要改动的文件   | 不需要改动的文件             |
| ------------------------------ | ---------------- | ---------------------------- |
| 后端接口换了（REST → GraphQL） | `api/*.js`       | `transform/*.js`、组件       |
| 展示逻辑变了（列表 → 卡片）    | 组件模板         | `api/*.js`、`transform/*.js` |
| 排序/过滤规则变了              | `transform/*.js` | `api/*.js`、组件模板         |

### 6.3 检验清单

- [ ] `transform/` 目录下的文件是否不 import `vue`？
- [ ] 组件模板中是否直接访问了 API 原始响应的字段名（如 `item.raw_backend_field`）？
- [ ] `api/` 目录下的函数是否返回了原始数据（而非加工后的数据）？
- [ ] `computed` 是否只做了数据转换（而非副作用）？

---

## 七、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Vue 的三层分离实现路径：                                        │
│                                                                  │
│   ① 接口原始数据    →  api/*.js  +  api-request/ 模块            │
│   ② 算法处理        →  transform/*.js（纯函数）                   │
│   ③ 界面显示数据    →  ref/reactive + computed + 模板             │
│                                                                  │
│   Vue 提供的"自动化管线"：                                        │
│   • computed：算法 → 显示数据的自动同步                           │
│   • watch：数据变化 → 副作用的自动触发                            │
│   • 模板编译器：显示数据 → DOM 的自动渲染                         │
│   • 装配器：三层模块的自动发现和组装                               │
│                                                                  │
│   核心思想不变：                                                   │
│   数据进来 → 算法加工 → 显示出去                                  │
│   Vue 只是让中间的"加工"和"同步"变得声明式和自动化                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Vue 的响应式系统和 Composition API 不是"帮你做"三层分离，而是"让你更容易做"三层分离。最终的架构决策权，始终在开发者手中。
