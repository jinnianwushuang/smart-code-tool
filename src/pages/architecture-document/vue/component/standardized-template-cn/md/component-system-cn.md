---
title: 组件系统
order: 42
---

# 组件系统

## 概述

该模板使用三个主要 Vue 组件来演示可插拔架构：

1. **DialogWrapper** - 管理模态对话框
2. **TableMainArea** - 显示具有分页的表格数据
3. **TopSearchArea** - 提供搜索/筛选界面

## 组件架构

### 组件包装器模式

每个组件都遵循一致的模式：

```javascript
<template>
  <WrappedComponent
    :config="wrapper_config"
    :all_singleton="all_singleton"
    :all_event_pipeline="all_event_pipeline"
    :all_config="all_config"
  />
</template>

<script setup>
// Import central service modules
// 导入中央服务模块
const { all_singleton } = all_singleton; // 状态
const { all_event_pipeline } = all_event_pipeline; // 事件
const { wrapper_config } = wrapper_config; // 配置
</script>
```

这种模式确保：

- **一致的属性** - 所有组件接收相同的属性结构
- **共享状态** - 所有组件访问单例状态
- **统一事件** - 集中式事件处理
- **配置驱动** - 行为由配置控制

### 1. DialogWrapper 组件

**位置**: `/component/dialog-wrapper/`

**目的**: 使用可插拔的对话框类型管理模态对话框显示

**文件**:

- `dialog-wrapper.vue` - 主包装组件
- `config/config.js` - 对话框配置和自动加载
- `component/dialog-copy-use/` - 示例对话框实现

**配置** (`config.js`):

```javascript
import { common_assemble_component } from 'src/output/common/project-common.js'
import { markRaw } from 'vue'

// Auto-discover dialog components
// 自动发现对话框组件
const modules = import.meta.glob('../component/*/*.vue', { eager: true })
const components = common_assemble_component(modules)
const { DialogCopyUse } = components

// Define available dialogs
// 定义可用的对话框
export const dialog_wrapper_config = [
  {
    name: '警告弹窗',
    model_key: 'dialog_copy_use',
    component: markRaw(DialogCopyUse),
  },
  {
    name: '确认弹窗',
    model_key: 'public_dialog_copy_use',
    component: markRaw(PublicDialogCopyUse),
  },
]
```

**状态管理**:

```javascript
// In state/singleton/dialog.js
// 在 state/singleton/dialog.js 中
export const all_dialog_state = ref({})
export const current_record_to_dialog_data = ref({})
```

**添加新对话框**:

1. 在 `component/dialog-wrapper/component/` 中创建新的 `.vue` 文件
2. 组件由全局模式自动发现
3. 将条目添加到 `dialog_wrapper_config` 数组
4. 通过设置 `all_dialog_state[model_key] = true` 触发对话框

### 2. TableMainArea 组件

**位置**: `/component/table-main-area/`

**目的**: 显示具有自定义单元格呈现的分页表格数据

**文件**:

- `table-main-area.vue` - 主表格组件
- `config/config.js` - 列定义和组件程序集
- `component/table-td-copy-use/` - 示例自定义单元格组件

**列配置** (`config.js`):

```javascript
const { TableTdCopyUse } = components

export const columns = [
  {
    name: 'index',
    dataIndex: 'index',
    key: 'index',
    customRender: ({ text, record, index }) => index + 1,
  },
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name',
    customRender: (obj) => h(TableTdCopyUse, obj), // 自定义组件
  },
  {
    name: 'Age',
    dataIndex: 'age',
    key: 'age',
    customRender: ({ text, record, index }) => text + '岁',
  },
]
```

**状态管理**:

```javascript
// In state/singleton/table.js
// 在 state/singleton/table.js 中
export const table_data = ref([])
export const table_loading = ref(false)
export const selected_data = ref([])
export const pagination = ref({ current: 1, pageSize: 10, total: 0 })
```

**事件处理**:

```javascript
// In module/event-pipeline/module/table.js
// 在 module/event-pipeline/module/table.js 中
export const on_table_change = (payload, { pagination, filters, sorter }) => {
  // Triggered on pagination/sorting change
  // 在分页/排序改变时触发
}

export const handle_table_action_confirm_click = (payload, str) => {
  // Triggered by action buttons
  // 由操作按钮触发
}
```

**添加自定义单元格组件**:

1. 在 `component/table-main-area/component/table-td-copy-use/` 中创建 `.vue` 组件
2. 组件接收 `{ text, record, index }` 属性
3. 使用 `customRender` 添加到列配置
4. 组件自动发现并注入

### 3. TopSearchArea 组件

**位置**: `/component/top-search-area/`

**目的**: 表格查询的搜索/筛选界面

**特性**:

- 搜索条件的输入字段
- 触发 API 调用的查询按钮
- 直接状态修改

**状态集成**:

```javascript
// In state/singleton/dialog.js
// 在 state/singleton/dialog.js 中
export const query_form = ref({})

// Usage in TopSearchArea
// TopSearchArea 中的用法
<template>
  <q-input v-model="query_form.key_word" label="关键字" />
  <q-btn @click="all_event_pipeline.other.handle_query_click" label="查询" />
</template>
```

## 组件通信流程

### 属性流（父级 → 子级）

```
index.vue
  ↓ passes config/state/events
  ↓ 传递配置/状态/事件
DialogWrapper → DialogCopyUse (receives all_singleton, all_event_pipeline)
                              (接收 all_singleton, all_event_pipeline)
TableMainArea → TableTdCopyUse (receives record, index, text)
                               (接收 record, index, text)
TopSearchArea → (uses shared state)
              → (使用共享状态)
```

### 事件流（子级 → 事件管道）

```
User clicks button
用户点击按钮
  ↓
Component emits event via all_event_pipeline
组件通过 all_event_pipeline 发出事件
  ↓
Event handler in module/event-pipeline/
module/event-pipeline/ 中的事件处理程序
  ↓
State update via all_singleton
通过 all_singleton 更新状态
  ↓
Reactive propagation to all components
反应性传播到所有组件
```

### 状态更新流

```
API response
API 响应
  ↓
success_handler updates all_singleton.table_data
success_handler 更新 all_singleton.table_data
  ↓
Vue reactivity detected
Vue 反应性被检测到
  ↓
Table re-renders with new data
表格使用新数据重新呈现
  ↓
Dependent components update via computed properties
依赖组件通过计算属性更新
```

## 动态组件程序集

### 组件如何自动加载

**在对话框包装器配置中**:

```javascript
const modules = import.meta.glob('../component/*/*.vue', { eager: true })
const components = common_assemble_component(modules)
```

**发生了什么**:

1. Glob 找到所有与模式匹配的 `.vue` 文件
2. `common_assemble_component()` 处理它们
3. 按文件名键入的组件
4. 组件可用为 `components.DialogCopyUse`

**益处**:

- 添加新对话框 → 自动发现
- 无需手动导入
- 使用急切加载时最小化构建开销

## 最佳实践

### ✅ 应该做

- 保持组件专注于单一责任
- 使用提供的属性（配置、状态、事件）
- 将业务逻辑委托给事件管道
- 对重型组件使用 `markRaw()`

### ❌ 不应该做

- 创建本地组件状态（改用单例）
- 发出自定义事件（改用事件管道）
- 直接导入其他组件
- 在组件中处理 API 调用

## 示例

### 创建新的自定义表格单元格组件

```javascript
<!-- component/table-main-area/component/custom-cell/custom-cell.vue -->
<template>
  <div class="custom-cell">
    <span @click="handle_click">{{ text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: String,
  record: Object,
  index: Number,
})

const emit = defineEmits(['cell-click'])

const handle_click = () => {
  emit('cell-click', props.record)
}
</script>
```

然后在 `config/config.js` 中：

```javascript
const { CustomCell } = components

export const columns = [
  {
    name: 'Custom',
    dataIndex: 'custom_field',
    customRender: (obj) => h(CustomCell, obj),
  },
]
```

### 创建新对话框类型

```javascript
<!-- component/dialog-wrapper/component/confirm-dialog/confirm-dialog.vue -->
<template>
  <q-dialog v-model="all_dialog_state[model_key]">
    <q-card>
      <q-card-section>
        <div class="text-h6">确认操作</div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="确认"
          @click="all_event_pipeline.dialog.handle_confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const model_key = 'confirm_dialog'
const props = defineProps({
  all_singleton: Object,
  all_event_pipeline: Object,
})

const { all_dialog_state } = props.all_singleton
</script>
```

然后在 `dialog-wrapper.vue` 配置中：

```javascript
export const dialog_wrapper_config = [
  {
    name: '确认对话框',
    model_key: 'confirm_dialog',
    component: markRaw(ConfirmDialog),
  },
]
```
