# 状态管理参照

## 状态分类

| 类别     | 位置                   | 作用域     | 说明                           |
| -------- | ---------------------- | ---------- | ------------------------------ |
| 单例状态 | `state/singleton/*.js` | 跨实例共享 | 所有组件实例共享同一份状态     |
| 多例状态 | `state/multiton.js`    | 每实例独立 | 每个组件实例拥有独立副本       |
| 计算属性 | `state/computed.js`    | 派生状态   | 从单例或多例状态派生的响应式值 |
| 配置     | `state/config.js`      | 静态配置   | 应用级配置选项                 |

## 单例状态标准写法

### 按业务域拆分文件（state/singleton/table.js）

```javascript
import { ref } from 'vue'

// 默认值定义（用于重置）
const default_pagination = {
  current: 1,
  pageSize: 10,
  total: 0,
}

// 状态声明
export const table_data = ref([])
export const table_loading = ref(false)
export const selected_data = ref([])
export const pagination = ref({ ...default_pagination })

// 重置函数 — 组件卸载时调用，恢复初始状态
export const init_singleton = () => {
  table_data.value = []
  selected_data.value = []
  table_loading.value = false
  pagination.value = { ...default_pagination }
}
```

### 对话框状态（state/singleton/dialog.js）

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

### 单例聚合（state/singleton.js — 仅单例模板）

```javascript
import { common_assemble_singleton } from '<!-- 需配置 -->'
import * as dialog_copy_use_singleton from '<!-- 需配置：组件级单例 -->'

// 自动扫描本目录下的单例模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })

export const { all_singleton, init_all_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
```

## 多例状态标准写法（state/multiton.js）

```javascript
import { ref } from 'vue'

// 每次调用 useContextAssembler() 都会创建新的实例
export const create_multiton_variable = (payload) => {
  const current_time = ref(new Date())
  return { current_time }
}
```

## 计算属性标准写法（state/computed.js）

```javascript
import { computed } from 'vue'

// payload 中包含所有单例/多例状态，可直接引用
export const create_computed_variable = (payload) => {
  const { table_data, user_info } = payload

  // 计算属性：可见行数
  const visible_row_count = computed(() => {
    return table_data.value.length
  })

  // 计算属性：是否为管理员
  const is_admin = computed(() => {
    return user_info.value.role === 'admin'
  })

  return { visible_row_count, is_admin }
}
```

## 配置状态（state/config.js）

```javascript
// 静态配置选项，不参与响应式
export const demo_options = [
  { key: 'option1', value: 'value1' },
  { key: 'option2', value: 'value2' },
]
```

## payload 中的状态结构

```javascript
const payload = {
  // Vue 组件属性
  props,
  // 单例状态（来自 state/singleton/*.js）
  table_data,
  pagination,
  user_info,
  all_dialog_state,
  query_form,
  // 多例状态（来自 state/multiton.js）
  current_time,
  // 计算属性（来自 state/computed.js）
  visible_row_count,
  is_admin,
  // 事件管道
  ALL_EVENT_PIPELINE,
  // 配置
  income_pipeline,
  wrap_payload,
}
```

## 在事件处理程序中访问状态

```javascript
// 通过 payload 解构获取状态
export const handle_query_click = (payload) => {
  const { table_data, query_form, pagination } = payload

  // 直接修改 .value 触发响应式更新
  table_data.value = new_data
  pagination.value.current = 1
}
```

## 关键约束

- 每个单例文件必须导出 `init_singleton` 函数
- 状态变量使用 `snake_case` 命名
- 单例状态按业务域拆分文件（table / dialog / other）
- 计算属性禁止读取同级的其他计算属性（避免循环依赖）
- 多例状态通过 `create_multiton_variable` 函数返回对象
