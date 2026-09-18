# 组件系统参照

## 三大核心组件

| 组件          | 位置                         | 职责               |
| ------------- | ---------------------------- | ------------------ |
| DialogWrapper | `component/dialog-wrapper/`  | 管理模态对话框显示 |
| TableMainArea | `component/table-main-area/` | 显示分页表格数据   |
| TopSearchArea | `component/top-search-area/` | 提供搜索/筛选界面  |

## 组件包装器模式

每个组件遵循统一模式：接收 `all_singleton`（状态）、`ALL_EVENT_PIPELINE`（事件）、`all_config`（配置）。

```vue
<template>
  <WrappedComponent
    :config="wrapper_config"
    :all_singleton="all_singleton"
    :ALL_EVENT_PIPELINE="ALL_EVENT_PIPELINE"
    :all_config="all_config"
  />
</template>

<script setup>
// 从 props 中获取状态和事件通道
const props = defineProps({
  all_singleton: Object,
  ALL_EVENT_PIPELINE: Object,
})
</script>
```

## 对话框组件（DialogWrapper）

### 配置（config/config.js）

```javascript
import { common_assemble_component } from '<!-- 需配置 -->'
import { markRaw } from 'vue'

// 自动发现对话框组件
const modules = import.meta.glob('../component/*/*.vue', { eager: true })
const components = common_assemble_component(modules)
const { DialogCopyUse } = components

// 定义可用对话框列表
export const dialog_wrapper_config = [
  {
    name: '警告弹窗',
    model_key: 'dialog_copy_use',
    component: markRaw(DialogCopyUse),
  },
]
```

### 添加新对话框的步骤

1. 在 `component/dialog-wrapper/component/` 下创建新的 `.vue` 文件
2. 组件自动被 `import.meta.glob` 发现
3. 在 `dialog_wrapper_config` 数组中添加条目
4. 通过设置 `all_dialog_state[model_key] = true` 触发显示

## 表格组件（TableMainArea）

### 列配置（config/config.js）

```javascript
import { h } from 'vue'
import { common_assemble_component } from '<!-- 需配置 -->'

const modules = import.meta.glob('../component/table-td-copy-use/*.vue', { eager: true })
const components = common_assemble_component(modules)
const { TableTdCopyUse } = components

// 列定义
export const columns = [
  {
    name: '序号',
    dataIndex: 'index',
    key: 'index',
    customRender: ({ text, record, index }) => index + 1,
  },
  {
    name: '名称',
    dataIndex: 'name',
    key: 'name',
    customRender: (obj) => h(TableTdCopyUse, obj), // 自定义组件渲染
  },
  {
    name: '年龄',
    dataIndex: 'age',
    key: 'age',
    customRender: ({ text }) => text + '岁',
  },
]
```

## 搜索组件（TopSearchArea）

```vue
<template>
  <div>
    <input v-model="query_form.key_word" placeholder="关键字" />
    <button @click="ALL_EVENT_PIPELINE.other.handle_query_click">查询</button>
  </div>
</template>

<script setup>
const props = defineProps({
  all_singleton: Object,
  ALL_EVENT_PIPELINE: Object,
})
// 直接从单例状态中获取查询表单
const { query_form } = props.all_singleton
</script>
```

## 组件通信流程

### 属性流（父 → 子）

```
index.vue → DialogWrapper → DialogCopyUse（接收 all_singleton, ALL_EVENT_PIPELINE）
index.vue → TableMainArea → TableTdCopyUse（接收 record, index, text）
index.vue → TopSearchArea（直接使用共享状态）
```

### 事件流（子 → 事件管道）

```
用户点击按钮 → ALL_EVENT_PIPELINE.域.处理函数() → 状态变更 → 响应式更新 → UI 重渲染
```

## 组件对接文档要求

装配架构下的组件，必须明确声明对接文档：

```javascript
// 父级提供状态机：table_data, table_columns, table_loading
// 父级提供通道名称：table
// 父级提供通道函数：handle_query_table_data, handle_edit_table_row, handle_delete_table_row
```

## 关键约束

- 组件保持单一职责，不在组件内写复杂业务逻辑
- 使用框架提供的属性（配置、状态、事件），不创建本地组件状态
- 业务逻辑委托给事件管道，不直接修改状态
- 重型组件使用 `markRaw()` 避免不必要的响应式开销
- 组件通过 `import.meta.glob` 自动发现，无需手动导入
