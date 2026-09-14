---
title: LV1-LV5 架构演进
order: 2
---

# Vue 标准化装配架构 — LV1 到 LV5 演进过程

## 概述

这套 Vue 标准化装配架构并非一蹴而就，而是经历了从 LV1 到 LV5 五个阶段的渐进式演进。每个阶段都是在前一阶段的问题驱动下进行重构，最终形成当前的"约定优于配置"装配模式。

验证代码位于 `project/vue-test-app/pages/vue-test/` 目录下，包含多例（multiton）和单例（singleton）两条演进线路。

## 演进总览

```
LV1 单文件堆砌
  ↓ 组件拆分
LV2 Props/Emit 通信
  ↓ 状态机函数化 + Composable
LV3 逻辑与 UI 物理隔离
  ↓ 单例状态 + MITT 事件管道
LV4 去组件中心化通信
  ↓ Vite 自动扫描装配
LV5 标准化装配架构（最终形态）
```

---

## LV1 — 单文件堆砌

### 思路

最基本的代码堆砌。所有状态、方法、UI 模板、样式全部集中在一个 Vue 文件中。

### 对应代码

`project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv1/multiton-lv1.vue`

### 代码特征

```vue
<script setup>
import { ref, reactive, onMounted } from 'vue'

// --- 数据定义 ---
const loading = ref(false)
const merchantList = ref([])
const searchState = reactive({ name: '', category: undefined })
const pagination = reactive({ current: 1, pageSize: 8, total: 40 })

// --- 获取数据 ---
const loadData = async () => {
  /* ... */
}

// --- 搜索逻辑 ---
const onSearch = () => {
  /* ... */
}
const onReset = () => {
  /* ... */
}

// --- 弹窗逻辑 ---
const modalVisible = ref(false)
const formState = reactive({/* ... */})
const handleAdd = () => {
  /* ... */
}
const handleEdit = (item) => {
  /* ... */
}
const handleModalOk = () => {
  /* ... */
}
const handleDelete = (id) => {
  /* ... */
}

onMounted(loadData)
</script>
```

一个文件约 280 行，涵盖：

- 数据定义（loading、merchantList、searchState、pagination）
- API 请求（loadData）
- 搜索与重置（onSearch、onReset）
- 弹窗增删改（handleAdd、handleEdit、handleModalOk、handleDelete）
- 模板（查询区域 + 卡片列表 + 分页 + 弹窗）
- 样式

### 问题总结

| 问题             | 说明                                                        |
| ---------------- | ----------------------------------------------------------- |
| **高耦合**       | 业务逻辑、UI 交互与接口请求高度耦合，修改功能如同拆解乱线团 |
| **状态膨胀**     | 响应式变量动辄上百行，未区分 UI 状态与核心业务数据          |
| **无法复用**     | Props 与 Emit 定义模棱两可，组件完全无法复用                |
| **生命周期过载** | onMounted 内堆放过多的异步初始化代码，缺乏内存清理          |
| **Watch 滥用**   | 滥用 Watch 监听实现补丁逻辑，数据流向混乱                   |
| **样式膨胀**     | CSS 随代码无限膨胀，缺乏统筹管理                            |

---

## LV2 — 组件拆分 + Props/Emit

### 思路

对单一组件进行功能子组件拆分，使用 Props/Emit 实现父子组件通信。

### 对应代码

`project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv2/`

### 目录结构

```
multiton-lv2/
├── multiton-lv2.vue              # 父组件（状态中心）
├── config/config.js              # 配置文件
└── components/
    ├── MerchantSearch.vue         # 搜索组件
    ├── MerchantCard.vue           # 卡片组件
    └── MerchantFormModal.vue      # 弹窗组件
```

### 代码特征

父组件仍然持有所有状态，通过 Props 下发、Emit 上报：

```vue
<template>
  <MerchantSearch :search-state="searchState" @search="onSearch" @reset="onReset" />
  <a-list :data-source="merchantList" :loading="loading">
    <template #renderItem="{ item }">
      <MerchantCard :item="item" @edit="handleEdit" @delete="handleDelete" />
    </template>
  </a-list>
  <MerchantFormModal
    v-model:visible="modalVisible"
    :is-edit="isEdit"
    :initial-data="formState"
    :confirm-loading="confirmLoading"
    @ok="handleModalOk"
  />
</template>

<script setup>
// 所有状态仍在父组件
const loading = ref(false)
const merchantList = ref([])
const searchState = reactive({ name: '', category: undefined })
const pagination = reactive({ current: 1, pageSize: 8, total: 40 })
const modalVisible = ref(false)
const formState = reactive({/* ... */})
// ... 所有方法也仍在父组件
</script>
```

子组件通过 Props 接收数据，通过 Emit 上报事件：

```vue
<!-- MerchantSearch.vue -->
<script setup>
const props = defineProps({ searchState: Object })
const emit = defineEmits(['search', 'reset'])
</script>
```

### 进步

- 模板按功能结构拆分，单文件行数减少
- 子组件职责清晰，UI 组件可独立预览

### 问题总结

| 问题                 | 说明                                                   |
| -------------------- | ------------------------------------------------------ |
| **Props 逐级透传**   | 嵌套层级加深后，中间层组件沦为纯搬运工                 |
| **父组件状态臃肿**   | 需管理所有子组件的响应式数据，单文件逻辑依然厚重       |
| **Emit 监听过长**    | 父组件监听列表极长，回调函数命名冲突风险增加           |
| **复用性受限**       | 强耦合的父子通信导致子组件离开特定父环境后无法独立运行 |
| **跨层级通信困难**   | 孙子传爷爷被迫使用 EventBus 或过度依赖 Root            |
| **调试转移而非消失** | 多个文件间来回跳转追踪数据流向，认知负担增加           |

**核心问题**：通信链路过长 + 逻辑中心化。

---

## LV3 — 状态机函数 + Composable

### 思路

1. 将组件状态机封装为函数式生成，实现数据结构的标准化
2. 业务逻辑全量封装为 Composable，实现逻辑与 UI 的物理隔离
3. Vue 组件仅作为"粘合层"，调用状态机函数生成上下文，再调用 Composable 激活页面

### 对应代码

`project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv3/`

### 目录结构

```
multiton-lv3/
├── multiton-lv3.vue              # 粘合层（仅 86 行）
├── config/config.js
├── variable/variable.js           # 状态机函数
├── componsable/index.js           # 业务逻辑 Composable
├── module/index.js                # 业务方法
├── api-request/loadData.js        # API 请求
└── components/                    # UI 组件（同 LV2）
```

### 代码特征

**状态机函数** — `variable/variable.js`：

```javascript
import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const { pageSize = 10 } = payload

  const loading = ref(false)
  const merchantList = ref([])
  const searchState = ref({ name: '', category: undefined })
  const pagination = ref({ current: 1, pageSize, total: 40 })
  const modalVisible = ref(false)
  const formState = ref({/* ... */})

  return { loading, merchantList, searchState, pagination, modalVisible, formState }
}
```

**业务 Composable** — `componsable/index.js`：

```javascript
import { onMounted } from 'vue'
import {
  onSearch,
  onReset,
  handleEdit,
  handleDelete,
  handleAdd,
  handleModalOk,
} from '../module/index.js'
import { loadData } from '../api-request/loadData.js'
import { wrap_with_payload } from 'src/output/common/project-common.js'

export const composable_index = (payload) => {
  onMounted(() => {
    loadData(payload)
  })

  return wrap_with_payload(payload, {
    onSearch,
    onReset,
    handleEdit,
    handleDelete,
    handleAdd,
    handleModalOk,
  })
}
```

**Vue 组件变为粘合层** — `multiton-lv3.vue`：

```vue
<script setup>
import { create_multiton_variable } from './variable/variable.js'
import { composable_index } from './componsable/index.js'

// 1. 调用状态机生成基础上下文
const base_payload = create_multiton_variable({ pageSize: 100 })

// 2. 解构状态
const { searchState, merchantList, loading, pagination, modalVisible } = base_payload

// 3. 调用 Composable 激活页面
const { onSearch, onReset, handleEdit, handleDelete, handleAdd, handleModalOk } =
  composable_index(base_payload)
</script>
```

### 进步

- Vue 组件代码从 280 行降至 86 行
- 逻辑与 UI 物理隔离，业务方法可独立测试
- 状态机函数化，数据结构标准化

### 问题总结

| 问题             | 说明                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| **过度抽象**     | 逻辑高度抽象导致"代码跳转陷阱"，需在多个 Composable 文件间反复横跳     |
| **黑盒效应**     | 新成员难以直观看到响应式变量的来源，逻辑溯源困难                       |
| **隐性依赖**     | 多个 Composable 之间可能存在隐性依赖，调用顺序错误会导致状态初始化失败 |
| **父子传参仍多** | Vue 代码整洁，无函数实现代码，但父子组件之间 Props/Emit 传参仍然较多   |
| **过度设计风险** | 简单的业务需求也被"过度封装"                                           |

---

## LV4 — 单例状态 + MITT 事件管道

### 思路

1. 父组件状态机转换为**单例模式**，跨组件共享统一数据源
2. 子孙组件消费的父组件事件函数使用 **MITT 管道**函数式封装
3. 下游子孙组件直接引入单例状态集合和 MITT 管道派发方法
4. 子组件无需 Props/Emit，直接消费单例状态和事件管道

### 对应代码

`project/vue-test-app/pages/vue-test/singleton-demo/singleton-lv4/`

### 目录结构

```
singleton-lv4/
├── singleton-lv4.vue             # 父组件（仅 30 行）
├── config/config.js
├── variable/
│   └── singleton.js              # 单例状态（模块级共享）
├── componsable/
│   ├── index.js                  # 业务逻辑 Composable
│   └── state.js                  # 状态管理 Composable
├── computed/index.js             # 计算属性
├── mitt/
│   ├── mitt-emit.js              # MITT 事件派发
│   └── mitt-register.js          # MITT 事件注册
├── module/
│   ├── table.js                  # 表格相关方法
│   └── dialog.js                 # 弹窗相关方法
├── api-request/loadData.js
└── components/                   # UI 组件（无需 Props/Emit）
```

### 代码特征

**单例状态** — `variable/singleton.js`：

```javascript
import { ref } from 'vue'

// 模块级变量，所有组件实例共享
export const loading = ref(false)
export const tableData = ref([])
export const searchState = ref({ username: '', status: undefined })
export const pagination = ref({ current: 1, pageSize: 10, total: 0 })
export const modalVisible = ref(false)

// 单例重置函数
export const init_singleton = () => {
  loading.value = false
  tableData.value = []
  searchState.value = { username: '', status: undefined }
  // ...
}
```

**MITT 事件派发** — `mitt/mitt-emit.js`：

```javascript
import { EMITTER } from 'src/output/common/project-common.js'

export const mitt_emit = (...args) => {
  EMITTER.emit('src_pages_vue_test_singleton_demo_singleton_lv4_mitt_mitt_emit', ...args)
}
```

**MITT 事件注册** — `mitt/mitt-register.js`：

```javascript
import { EMITTER } from 'src/output/common/project-common.js'
import { onSearch, onReset, handleTableChange, handleEdit, handleDelete } from '../module/table.js'
import { handleAdd, handleModalOk } from '../module/dialog.js'
import { wrap_with_payload_pipeline } from 'src/output/common/project-common.js'

export const mitt_register = (payload) => {
  return EMITTER.on('...', (...args) => {
    const [event_name, ...rest_params] = args
    const fn_obj = wrap_with_payload_pipeline(payload, rest_params, {
      onSearch,
      onReset,
      handleTableChange,
      handleEdit,
      handleDelete,
      handleAdd,
      handleModalOk,
    })
    if (fn_obj[event_name]) return fn_obj[event_name]()
  })
}
```

**Vue 组件** — `singleton-lv4.vue`（仅 30 行）：

```vue
<template>
  <div>停留时长： {{ use_time_str }} : {{ encouragement }}</div>
  <UserSearch />
  <UserTable />
  <UserModal v-model:visible="modalVisible" />
</template>

<script setup>
import { composable_index } from './componsable/index.js'
import { composable_state } from './componsable/state.js'

const base_payload = composable_state({ pageSize: 100 })
const { modalVisible, encouragement, use_time_str } = base_payload
const { loadData } = composable_index(base_payload)
</script>
```

子组件直接引入单例状态，无需 Props/Emit：

```vue
<!-- UserTable.vue -->
<script setup>
import { tableData, pagination, searchState } from '../variable/singleton.js'
import { mitt_emit } from '../mitt/mitt-emit.js'
// 直接消费状态，直接派发事件
</script>
```

### 进步

- 子组件彻底摆脱 Props/Emit 束缚
- 跨层级通信变得简单直接
- Vue 组件代码进一步精简至 30 行

### 问题总结

| 问题                 | 说明                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| **生命周期脱节**     | 单例模式导致组件实例与状态生命周期脱节，不手动重置状态会造成内存泄漏       |
| **事件溯源困难**     | MITT 属于全局发布订阅，缺乏原生事件的冒泡与捕获语义，事件流向难以溯源      |
| **数据修改失控**     | 子组件直接修改父组件单例状态，破坏单向数据流，引发"数据被谁改了"的定位灾难 |
| **Devtools 失效**    | 过度隔离使得 Vue Devtools 的组件状态追踪失效                               |
| **模板与脚本割裂**   | 逻辑完全剥离出 Vue 组件体系，模板与脚本的直观关联性降至冰点                |
| **切面执行顺序交叉** | 多个切面之间存在执行顺序交叉，必须了解每个切面的输入输出                   |

**这已经很像一种"自定义的微型状态管理系统"了。**

---

## LV5 — 标准化装配架构（最终形态）

### 思路

1. 优化目录结构，提供全局封装函数
2. 使用 Vite `import.meta.glob()` 扫描目录，自动装配状态机、函数、事件管道、生命周期调度、副作用注入与销毁
3. 组件内只需按固定目录结构放置代码，"配置即功能"
4. 在模块内固定文件调用聚合函数生成零件队列
5. 在 Vue 组件内调用 `useContextAssembler()` 注入上下文，执行零件队列，不断扩展上下文
6. 所有地方消费的上下文是同一个，一切从 payload 上下文获取

### 对应代码

- 验证代码：`project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv5/`
- 标准模板：`src/standardization/multiton-template/` 和 `src/standardization/singleton-template/`

### 目录结构

```
multiton-lv5/                          # 或 src/standardization/multiton-template/
├── multiton-lv5.vue                   # 主入口（仅 39 行）
├── config/config.js                   # 配置
├── assembler/
│   └── assembler.js                   # 装配器入口
├── state/
│   ├── singleton.js                   # 单例状态聚合
│   ├── singleton/
│   │   ├── table.js                   # 表格状态
│   │   ├── dialog.js                  # 弹窗状态
│   │   └── other.js                   # 其他共享状态
│   ├── multiton.js                    # 多例状态
│   └── computed.js                    # 计算属性
├── module/
│   ├── lifecycle/lifecycle.js         # 6 个生命周期钩子
│   ├── emit/emit.js                   # 事件发射器
│   ├── event-pipeline/
│   │   ├── event-pipeline.js          # 事件管道装配
│   │   └── module/
│   │       ├── dialog.js              # 弹窗事件
│   │       ├── table.js               # 表格事件
│   │       └── other.js               # 通用事件
│   ├── exposed-method/
│   │   └── exposed-method.js          # 暴露方法
│   ├── effect/                        # 6 种副作用清理
│   │   ├── dom.js
│   │   ├── listener.js
│   │   ├── watcher.js
│   │   ├── timer.js
│   │   ├── mitter.js
│   │   └── other.js
│   └── other-method/
│       ├── index.js
│       └── event-listener.js
└── components/                        # UI 子组件（也可拥有自己的装配器）
    ├── merchant-search/
    ├── merchant-main-area/
    │   ├── assembler/assembler.js     # 子组件装配器
    │   ├── state/                     # 子组件状态
    │   ├── module/                    # 子组件模块
    │   └── merchant-main-area.vue
    └── merchant-card/
```

### 代码特征

**装配器** — `assembler/assembler.js`：

```javascript
import { atoms_assembler } from 'src/output/common/project-common.js'

const public_assembler = ['useGlobalState']
const manual_assembler = []
const current_file_path = import.meta.url

// Vite 自动扫描模块
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], { eager: true })

// 聚合装配
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
```

**Vue 主入口** — `multiton-lv5.vue`（仅 39 行）：

```vue
<template>
  <div>
    <MerchantSearch />
    <MerchantMainArea key="1" :index="1" />
    <MerchantMainArea key="2" :index="2" />
  </div>
</template>

<script setup>
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

const props = defineProps({})
const emit = defineEmits([])
const income_pipeline = []
const wrap_payload = []
const base_payload = { props, income_pipeline, wrap_payload }

const {} = useContextAssembler(base_payload, all_atoms_assembler())
</script>
```

**单例模板额外提供 expose.js** — 声明对下游组件提供的状态和事件通道：

```javascript
// assembler/expose.js
export const ALL_CONTEXT_STATE = {} // 对下游提供的状态挂载点
export const ALL_EVENT_PIPELINE = {} // 对下游提供的事件通道挂载点
```

### 核心机制

| 机制                          | 说明                                                     |
| ----------------------------- | -------------------------------------------------------- |
| **import.meta.glob 自动发现** | Vite 扫描 `module/**/*.js` 和 `state/*.js`，零手动引入   |
| **payload 上下文统一传递**    | 所有模块通过同一个 payload 对象获取状态和方法            |
| **三类状态管理**              | 单例（跨实例共享）、多例（每实例独立）、计算（派生状态） |
| **6 种副作用自动清理**        | DOM、监听器、观察器、定时器、Mitter、其他                |
| **事件管道系统**              | 按域组织（dialog/table/other），支持事件链               |
| **组件可嵌套装配**            | 子组件也可拥有自己的 assembler，形成嵌套装配             |

### 优势与代价

| 优势                           | 代价                                |
| ------------------------------ | ----------------------------------- |
| 新增功能只需新增文件，自动发现 | 架构高度抽象，新成员学习曲线陡峭    |
| Vue 组件代码极度精简           | 极度依赖固定目录结构                |
| 全链路同一份上下文，状态一致   | 黑盒化装配削弱 Devtools 感知力      |
| 副作用自动清理，无内存泄漏     | 过度中心化 Payload 可能导致内存膨胀 |
| 模块可独立测试                 | 调试需要理解底层扫描与装配逻辑      |

**这套架构已进化到"框架级的自研 DSL"阶段。这种"约定优于配置"的模式在大型低代码平台或复杂后台中非常强大。**

---

## 演进对比表

| 级别    | 文件数 | Vue 代码行数 | 核心特征            | 通信方式                       | 关键问题               |
| ------- | ------ | ------------ | ------------------- | ------------------------------ | ---------------------- |
| **LV1** | 1      | ~280         | 单文件堆砌          | 无                             | 高耦合、难维护         |
| **LV2** | 4      | ~160         | 组件拆分            | Props/Emit                     | Props 透传、逻辑中心化 |
| **LV3** | 7+     | ~86          | 状态机 + Composable | Props/Emit + wrap_with_payload | 过度抽象、黑盒效应     |
| **LV4** | 10+    | ~30          | 单例 + MITT         | 单例状态 + MITT 管道           | 调试困难、数据修改失控 |
| **LV5** | 20+    | ~39          | 装配器模式          | payload 上下文统一             | 学习曲线陡峭           |

## 关键转折点

### LV2 → LV3：逻辑与 UI 分离

LV2 的 Props 透传问题促使将状态封装为函数，业务逻辑封装为 Composable。Vue 组件从"逻辑中心"退化为"粘合层"。

### LV3 → LV4：去组件中心化通信

LV3 虽然逻辑隔离了，但父子 Props/Emit 传参仍然很多。LV4 引入单例状态和 MITT 事件管道，子组件彻底摆脱 Props/Emit。

### LV4 → LV5：从手动到自动

LV4 的单例和 MITT 需要手动管理引入和注册。LV5 引入 `import.meta.glob()` 自动扫描和 `useContextAssembler()` 统一注入，实现"放置即装配"。

## 两种模板的适用场景

| 模板         | 路径                                      | 适用场景                                                                           |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| **多例模板** | `src/standardization/multiton-template/`  | 每实例独立状态的页面（如多个同类卡片并排）                                         |
| **单例模板** | `src/standardization/singleton-template/` | 跨实例共享状态的页面（如标准 CRUD 管理页），额外提供 `expose.js` 和 `api-request/` |
