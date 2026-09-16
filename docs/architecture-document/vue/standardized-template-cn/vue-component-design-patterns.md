---
title: Vue 组件设计模式
order: 10
---

# Vue 组件设计模式

Vue 组件设计模式是构建可维护、可复用 Vue 应用的核心方法论。与 React 将 UI 完全交给 JavaScript 表达不同，Vue 采用 **模板 + 响应式系统** 的双轨模型——模板编译器负责声明式渲染，响应式内核（Proxy）负责自动依赖追踪。这使得 Vue 的组件模式在保持直觉性的同时，拥有极强的架构表达力。

本文从**工程实践**角度，系统梳理 Vue 3 Composition API 下最常用的组件设计模式、适用场景与决策依据。

---

## 一、逻辑抽取模式（Composable）

Composable 是 Vue 3 最核心的架构模式，对标 React 的自定义 Hook，但得益于响应式系统的自动追踪，Composable 的使用更加自然。

### 核心思想

将组件中的**业务逻辑**抽取为独立函数，函数内部使用 `ref`、`computed`、`watch` 等响应式 API，返回响应式数据和方法。组件只需调用 Composable 即可获得完整逻辑。

| 维度             | 组件（.vue）               | Composable（.js/.ts） |
| ---------------- | -------------------------- | --------------------- |
| **职责**         | 模板声明 + 样式 + 逻辑粘合 | 纯业务逻辑封装        |
| **是否包含模板** | 是                         | 否                    |
| **可复用性**     | 低，与 UI 绑定             | 高，纯逻辑无关 UI     |
| **可测试性**     | 需要挂载组件               | 直接调用函数即可测试  |

### 工程实现

```vue
<!-- ── Composable：useUserList.js ── -->
<script setup>
import { ref, computed } from 'vue'

export function useUserList() {
  const keyword = ref('')
  const users = ref([])

  const filteredUsers = computed(() => users.value.filter((u) => u.name.includes(keyword.value)))

  async function fetchUsers() {
    users.value = await api.getUsers()
  }

  return { keyword, users, filteredUsers, fetchUsers }
}
</script>

<!-- ── 组件：UserPage.vue ── -->
<script setup>
import { useUserList } from './composables/useUserList'

const { keyword, filteredUsers, fetchUsers } = useUserList()
fetchUsers()
</script>

<template>
  <input v-model="keyword" placeholder="搜索..." />
  <ul>
    <li v-for="u in filteredUsers" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
```

### 何时使用

- 业务逻辑需要在多个组件间复用
- 需要将逻辑从模板中剥离以提升可测试性
- 复杂页面需要分层组织（数据层 → 过滤层 → 计算层）

### 何时避免

- 逻辑与 UI 高度耦合（如动画控制），强行抽取反而增加复杂度
- 简单组件只有一个 `ref`，无需抽取

---

## 二、单例/多例状态模式（provide/inject vs 独立调用）

Vue 通过 `provide/inject` 实现跨层级状态共享（单例），通过每个组件独立调用 Composable 实现状态隔离（多例）。

### 单例模式：provide/inject

```vue
<!-- ── 父组件：提供全局状态 ── -->
<script setup>
import { provide, ref } from 'vue'

const currentUser = ref(null)
provide('currentUser', currentUser)
</script>

<!-- ── 子孙组件：消费全局状态 ── -->
<script setup>
import { inject } from 'vue'

const currentUser = inject('currentUser')
</script>
```

### 多例模式：独立调用

```vue
<!-- ── 每个组件实例独立调用，闭包隔离 ── -->
<script setup>
import { useMerchantList } from './composables/useMerchantList'

// 每次调用创建独立状态
const { list, fetchList } = useMerchantList()
</script>
```

### 单例 vs 多例决策

| 维度         | 单例（provide/inject）    | 多例（独立调用）         |
| ------------ | ------------------------- | ------------------------ |
| **状态数量** | 全局唯一                  | 每实例独立               |
| **通信方式** | 隐式注入，无需 Props 透传 | 无需通信，各自独立       |
| **适用场景** | 用户会话、全局配置、主题  | 多标签页、多面板、多商户 |
| **内存影响** | 单份数据，内存友好        | N 份数据，注意内存       |

---

## 三、作用域插槽模式（Scoped Slot）

作用域插槽是 Vue **独有**的、比 React 更强大的组件通信范式。子组件通过 `<slot>` 将内部数据暴露给父组件，由父组件决定如何渲染。

### 核心思想

```vue
<!-- ── 通用 DataTable.vue ── -->
<template>
  <table>
    <tr v-for="(row, i) in data" :key="i">
      <!-- 子组件暴露 row 数据，父组件决定渲染方式 -->
      <slot name="row" :row="row" :index="i">
        <td>{{ row }}</td>
      </slot>
    </tr>
  </table>
</template>

<!-- ── 使用方：自定义每行渲染 ── -->
<DataTable :data="users">
  <template #row="{ row }">
    <td>{{ row.name }}</td>
    <td><a-tag :color="row.status === 'active' ? 'green' : 'red'">{{ row.status }}</a-tag></td>
  </template>
</DataTable>
```

### 作用域插槽的核心优势

| 优势              | 说明                                            |
| ----------------- | ----------------------------------------------- |
| **零 Props 透传** | 子组件内部数据直接暴露给父组件模板              |
| **渲染权委托**    | 子组件管数据和逻辑，父组件管显示                |
| **类型安全**      | Vue 3.3+ 支持插槽类型定义（defineSlots）        |
| **React 对比**    | React 需用 Render Props 或 Context 模拟等价效果 |

### 典型应用场景

- 通用表格组件（DataTable / DataGrid）
- 通用列表组件（DataList）
- 布局组件（Layout / Card）
- 表单组件（FormField 暴露验证状态）

---

## 四、装配器模式（Assembler）

装配器是 Vue 标准化架构中的高级模式，通过 Vite 自动扫描目录，将状态机、事件管道、生命周期钩子自动装配为上下文。组件只需调用一个 `useContextAssembler()` 即可获得完整上下文。

### 核心思想

```
目录结构（约定优于配置）：
├── state/          → 状态机定义
├── module/         → 事件管道 / 函数
├── composable/     → 业务 Composable
└── component.vue   → 只调用装配函数
```

```vue
<!-- ── 组件内只需两行 ── -->
<script setup>
import { useContextAssembler } from 'src/output/common/composable-common.js'

const payload = useContextAssembler(
  import.meta.glob('./state/*.js'),
  import.meta.glob('./composable/*.js'),
)
</script>

<template>
  <div>{{ payload.userList }}</div>
</template>
```

### 装配器的层级演进

| 级别 | 模式                 | 特征                       |
| ---- | -------------------- | -------------------------- |
| LV1  | 代码堆砌             | 所有逻辑在一个 .vue 文件   |
| LV2  | 子组件拆分           | Props/Emit 父子通信        |
| LV3  | Composable 抽取      | 逻辑与 UI 物理隔离         |
| LV4  | 单例 + MITT 事件管道 | 跨组件直接消费，无需 Props |
| LV5  | 装配器自动装配       | Vite 扫描目录，零手动引入  |

---

## 五、v-model 双向绑定模式

`v-model` 是 Vue 最直观的组件通信模式，本质是 `:modelValue` + `@update:modelValue` 的语法糖。

### 基础用法

```vue
<!-- ── 父组件 ── -->
<CustomInput v-model="text" />

<!-- ── 子组件 CustomInput.vue ── -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input :value="modelValue" @input="emit('update:modelValue', $event.target.value)" />
</template>
```

### 多个 v-model（Vue 3.4+）

```vue
<!-- ── 父组件：同时绑定多个值 ── -->
<UserForm v-model:name="name" v-model:age="age" />

<!-- ── 子组件 ── -->
<script setup>
const props = defineProps(['name', 'age'])
const emit = defineEmits(['update:name', 'update:age'])
</script>
```

### v-model vs React 受控组件

| 维度           | Vue v-model                | React 受控组件            |
| -------------- | -------------------------- | ------------------------- |
| **语法**       | `v-model` 一行搞定         | `value` + `onChange` 手动 |
| **底层机制**   | 编译器语法糖               | 手动 state 管理           |
| **非受控支持** | `ref` 直接读取 DOM         | `useRef` + `defaultValue` |
| **多值绑定**   | 原生支持多个 `v-model:xxx` | 需手动管理多个 onChange   |

---

## 六、组件通信全景图

Vue 组件通信有多种方式，不同场景选择不同方案：

| 通信方式              | 适用关系          | 数据方向         | 典型场景           |
| --------------------- | ----------------- | ---------------- | ------------------ |
| `props` / `emit`      | 父 → 子 / 子 → 父 | 单向 / 事件回传  | 简单父子通信       |
| `v-model`             | 父 ↔ 子           | 双向             | 表单组件           |
| `provide` / `inject`  | 祖先 → 后代       | 单向（可响应式） | 跨层级共享         |
| `Composable`          | 任意组件          | 闭包隔离         | 逻辑复用           |
| `Pinia Store`         | 全局              | 响应式全局状态   | 跨模块共享         |
| `MITT` 事件总线       | 任意组件          | 发布/订阅        | 解耦跨组件通知     |
| `useContextAssembler` | 模块内            | 上下文注入       | 标准化架构自动装配 |

---

## 七、模式选择决策树

```
需要复用逻辑（非 UI）？
├── 是 → Composable（优先）
│   └── 需要跨层级共享同一份？→ provide/inject
│   └── 需要全局状态管理？→ Pinia Store
│
└── 否 → 需要复用 UI 结构？
    ├── 是 → 组件组合
    │   ├── 父组件需要控制每项渲染？→ 作用域插槽
    │   ├── 固定布局结构？→ 容器/展示拆分
    │   └── 需要灵活内容投射？→ 具名插槽
    │
    └── 否 → 单组件设计
        ├── 需要双向绑定？→ v-model
        ├── 内部管理状态？→ ref/reactive
        └── 标准化架构？→ 装配器模式
```

---

## 八、反模式警示

### 反模式 1：God Component（上帝组件）

一个 `.vue` 文件超过 500 行，模板、逻辑、样式全部堆砌。

```vue
<!-- ❌ 反模式 -->
<script setup>
// 200+ 行响应式数据、方法、生命周期...
</script>
```

**修复**：将逻辑抽取为 Composable，将 UI 拆分为子组件。

### 反模式 2：Prop Drilling（属性钻透）

Props 层层传递超过 3 层，中间组件仅做透传。

```vue
<!-- ❌ 反模式 -->
<GrandParent :user="user">
  <Parent :user="user">
    <Child :user="user">
      <GrandChild :user="user" />
    </Child>
  </Parent>
</GrandParent>
```

**修复**：使用 `provide/inject` 或 Pinia Store，让数据直接到达目标组件。

### 反模式 3：watch 驱动状态同步

用 `watch` 在 Props 变化时更新 State，导致多余计算。

```vue
<!-- ❌ 反模式 -->
<script setup>
const props = defineProps(['userId'])
const user = ref(null)
watch(
  () => props.userId,
  async (id) => {
    user.value = await fetchUser(id)
  },
  { immediate: true },
)
</script>

<!-- ✅ 正确：使用 computed 或 Composable -->
<script setup>
const props = defineProps(['userId'])
const user = computed(() => useUserStore().getById(props.userId))
</script>
```

---

## 九、与 React 模式对照

| Vue 模式       | React 对应              | 差异说明                                  |
| -------------- | ----------------------- | ----------------------------------------- |
| Composable     | 自定义 Hook             | Vue 自动追踪依赖，React 需手动声明        |
| provide/inject | Context + useContext    | Vue 支持响应式注入，React 需配合 useState |
| 作用域插槽     | Render Props / children | Vue 语法更简洁，React 需函数传参          |
| v-model        | value + onChange        | Vue 编译器糖，React 手动管理              |
| 装配器         | 无直接对应              | Vue 独有的框架级自研 DSL                  |
| Pinia Store    | Zustand / Redux Toolkit | Vue 官方推荐，React 生态碎片化            |

---

## 总结

| 模式         | 核心价值       | Vue 独有 | 适用规模   |
| ------------ | -------------- | -------- | ---------- |
| Composable   | 逻辑复用与分层 | 否       | 所有规模   |
| 单例/多例    | 状态共享与隔离 | 否       | 中大型     |
| 作用域插槽   | 渲染权委托     | **是**   | 组件库     |
| 装配器       | 自动化装配     | **是**   | 大型标准化 |
| v-model      | 双向绑定       | **是**   | 表单场景   |
| 组件通信全景 | 多方式灵活选择 | 部分     | 所有规模   |

Vue 组件设计的核心心法是**声明优于命令**：模板声明渲染意图，响应式系统自动追踪依赖，编译器处理语法糖。开发者只需关注"数据是什么"，而非"如何触发更新"。
