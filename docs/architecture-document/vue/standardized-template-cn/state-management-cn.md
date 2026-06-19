---
title: 状态管理系统
order: 99
---

# 状态管理系统

## 概述

该模板使用结合 Vue 3 响应式原语的模块化组织的高级状态管理系统。状态分为三个类别：

1. **单例** - 在所有组件实例间共享
2. **多例** - 每实例状态
3. **计算** - 派生状态

## 架构

```
┌─────────────────────────────────────┐
│     useContextAssembler()           │
├─────────────────────────────────────┤
│ Receives payload with:              │
│ - props                             │
│ - income_pipeline                   │
│ - wrap_payload                      │
│ - base_payload                      │
└────────┬────────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │  Assembler Initialization   │
    └────┬───────────────────┬────┘
         │                   │
    ┌────▼────────┐  ┌──────▼───────┐
    │  Singleton  │  │ Computed     │
    │   State     │  │ Properties   │
    └────┬────────┘  └──────┬───────┘
         │                  │
    ┌────▼──────────────────▼───┐
    │  Return Composed Context   │
    │  {                         │
    │    user_info,             │
    │    table_data,            │
    │    pagination,            │
    │    ...handlers            │
    │  }                         │
    └────────────────────────────┘
```

## 1. 单例状态

### 定义

单例状态是**全局共享**的，在整个页面的生命周期中创建一个实例并保持。

### 位置

`/state/singleton/`

### 文件

**singleton.js** - 聚合所有单例模块：

```javascript
import { common_assemble_singleton } from 'src/output/common/project-common.js'
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'

const modules = import.meta.glob('./singleton/*.js', { eager: true })

export const { all_singleton, init_all_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
```

**singleton/table.js** - 表格数据状态：

```javascript
import { ref } from 'vue'

const default_pagination = {
  current: 1,
  pageSize: 10,
  total: 0,
}

export const table_data = ref([])
export const table_loading = ref(false)
export const selected_data = ref([])
export const pagination = ref({ ...default_pagination })

export const init_singleton = () => {
  table_data.value = []
  selected_data.value = []
  table_loading.value = false
  pagination.value = { ...default_pagination }
}
```

**singleton/dialog.js** - 对话框状态：

```javascript
import { ref } from 'vue'

export const all_dialog_state = ref({})
export const query_form = ref({})
export const current_record_to_dialog_data = ref({})

export const init_singleton = () => {
  all_dialog_state.value = {}
  query_form.value = {}
  current_record_to_dialog_data.value = {}
}
```

**singleton/other.js** - 其他共享状态：

```javascript
import { ref } from 'vue'

export const user_info = ref({ name: 'Guest' })

export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

### 访问模式

在组件中：

```javascript
import { all_singleton } from "src/standardization/backend-page-template/state/singleton.js"

const { table_data, pagination, user_info } = all_singleton

// Use in template
// 在模板中使用
<div>{{ user_info }}</div>
<div>Total: {{ table_data.length }}</div>
```

在事件处理程序中：

```javascript
// Event handlers receive payload with singleton state injected
// 事件处理程序接收注入单例状态的有效载荷
export const handle_query_click = (payload) => {
  const { table_data, pagination } = payload

  table_data.value = []
  pagination.value.current = 1
}
```

### 单例生命周期

1. **创建** - 首次导入时创建 `all_singleton`
2. **初始化** - 调用 `init_singleton()` 重置状态
3. **持久化** - 组件实例更改时状态保留
4. **清理** - 页面销毁时调用 `init_singleton()`

## 2. 多例状态

### 定义

多例状态是**每实例**的，为每个组件实例创建新的副本。每个实例有自己的副本。

### 位置

`/state/multiton.js`

### 示例

```javascript
import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const current_time = ref(new Date())

  return { current_time }
}
```

### 用法

每个调用 `useContextAssembler()` 的组件都会获得自己的 `current_time`：

```javascript
// Component A
// 组件 A
const { current_time: componentA_time } = useContextAssembler(payload, assembler)

// Component B
// 组件 B
const { current_time: componentB_time } = useContextAssembler(payload, assembler)

// componentA_time 和 componentB_time 是独立的 ref
```

### 何时使用

- 每组件计时或计数器
- 不应共享的实例特定状态
- 不应持久化的临时数据

## 3. 计算状态

### 定义

计算属性是**派生值**，使用 Vue 的 `computed()` 从单例或多例状态计算。

### 位置

`/state/computed.js`

### 示例

```javascript
import { computed } from 'vue'

export const create_computed_variable = (payload) => {
  const demo_computed = computed(() => {
    return 'demo_computed'
  })

  return { demo_computed }
}
```

### 高级示例

```javascript
import { computed } from 'vue'

export const create_computed_variable = (payload) => {
  const { table_data, user_info } = payload

  // Computed property: row count
  // 计算属性：行数
  const visible_row_count = computed(() => {
    return table_data.value.length
  })

  // Computed property: is user admin
  // 计算属性：用户是否为管理员
  const is_admin = computed(() => {
    return user_info.value.role === 'admin'
  })

  // Computed property: can user delete
  // 计算属性：用户是否可以删除
  const can_delete = computed(() => {
    return is_admin.value && visible_row_count.value > 0
  })

  return {
    visible_row_count,
    is_admin,
    can_delete,
  }
}
```

### 益处

- **响应式跟踪** - 依赖更改时自动更新
- **记忆化** - 仅在依赖更改时计算
- **类型安全** - 清晰的输入/输出契约
- **可测试** - 纯函数

## 配置状态

### 位置

`/state/config.js`

### 目的

存储应用级配置选项

### 示例

```javascript
export const demo_options = [
  { key: 'option1', value: 'value1' },
  { key: 'option2', value: 'value2' },
]
```

## 状态有效载荷结构

### 什么是有效载荷？

有效载荷是在装配器中传递的上下文对象，包含：

```javascript
const payload = {
  // Vue component props
  // Vue 组件属性
  props,

  // Singleton state
  // 单例状态
  table_data,
  pagination,
  user_info,
  all_dialog_state,
  query_form,
  current_record_to_dialog_data,

  // Multiton state
  // 多例状态
  current_time,

  // Computed properties
  // 计算属性
  visible_row_count,
  is_admin,
  can_delete,

  // Emit functions
  // 发射函数
  emit,

  // Config
  // 配置
  income_pipeline,
  wrap_payload,
}
```

### 处理程序中的访问

```javascript
export const handle_query_click = (payload) => {
  const { table_data, query_form, pagination } = payload

  // Use state
  // 使用状态
  table_data.value = newData

  // API call with current state
  // 使用当前状态进行 API 调用
  api_service.query({
    keyword: query_form.value.key_word,
    page: pagination.value.current,
  })
}
```

## 状态变更模式

### 模式 1：直接变更

```javascript
export const handle_reset = (payload) => {
  const { table_data, pagination } = payload

  table_data.value = []
  pagination.value.current = 1
}
```

### 模式 2：计算派生状态

```javascript
const total_count = computed(() => {
  return table_data.value.reduce((sum, item) => sum + item.count, 0)
})
```

### 模式 3：条件更新

```javascript
export const handle_api_response = (payload, response) => {
  const { table_data, pagination } = payload

  if (response.code === 200) {
    table_data.value = response.data.rows
    pagination.value.total = response.data.total
  }
}
```

## 响应式依赖

### 观察器的副作用

```javascript
// In cleanup_effect_watcher
// 在 cleanup_effect_watcher 中
export const cleanup_effect_watcher = (payload) => {
  const { current_time } = payload

  return [
    watch(current_time, (new_time) => {
      console.log('Time changed:', new_time)
    }),
  ]
}
```

### 具有多个依赖的计算

```javascript
const can_submit = computed(() => {
  const hasData = table_data.value.length > 0
  const isValid = validation_result.value === true
  const notLoading = !table_loading.value

  return hasData && isValid && notLoading
})
```

## 状态初始化和重置

### 初始化

```javascript
import { all_singleton } from './state/singleton.js'

// In lifecycle hook
// 在生命周期钩子中
export const lifecycle_onBeforeMount = (payload) => {
  const { init_singleton } = payload
  init_singleton() // Reset all singleton state
}
```

### 重置模式

```javascript
export const handle_reset_form = (payload) => {
  const { query_form } = payload

  query_form.value = {
    key_word: '',
    category: '',
    date_range: [],
  }
}
```

## 最佳实践

### ✅ 应该做

- 对真正全局状态使用单例（用户信息、共享配置）
- 对组件作用域临时状态使用多例
- 对派生计算使用计算
- 保持状态结构扁平且规范化
- 记录状态形状和变更

### ❌ 不应该做

- 混合单例和本地组件状态
- 创建读取兄弟计算的计算（创建合并计算）
- 在不重新分配的情况下深度变更数组/对象
- 创建紧密耦合的状态依赖
