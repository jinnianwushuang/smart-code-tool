---
title: 事件管道系统
order: 11121
---

# 事件管道系统

## 概述

事件管道是一个高级事件处理系统，提供：

1. **集中式事件管理** - 所有交互通过管道路由
2. **类型安全的事件处理程序** - 结构化有效载荷传递
3. **自动发现** - 事件模块自动扫描和注册
4. **可组合管道** - 事件可以触发其他事件

## 架构

```
User Interaction (click, change, etc.)
用户交互（点击、更改等）
  ↓
Component Emit
组件发射
  ↓
Event Pipeline Handler
事件管道处理程序
  ↓
State Mutation / API Call / Other Event
状态变更 / API 调用 / 其他事件
  ↓
Reactive Update
响应式更新
  ↓
UI Re-render
UI 重新渲染
```

## 核心文件

### event-pipeline.js

注册并公开所有事件管道：

```javascript
import { assemble_event_pipeline } from 'src/output/common/project-common.js'

const modules = import.meta.glob('../module/event-pipeline/\*.js', {
  eager: true,
})

const currentFilePath = import.meta.url

export const { ALL_EVENT_PIPELINE, create_event_pipeline } = assemble_event_pipeline(
  modules,
  currentFilePath,
)
```

### 模块结构

事件处理程序按域组织在 `module/event-pipeline/module/` 中：

```

module/event-pipeline/module/
├── dialog.js # 对话框相关事件
├── table.js # 表格相关事件
└── other.js # 通用事件

```

## 事件处理程序

### 对话框事件 (`module/event-pipeline/module/dialog.js`)

```javascript
export const handle_dialog_copy_use_confirm_click = (payload) => {
  const { all_dialog_state } = payload
  all_dialog_state.value.dialog_copy_use = true
}
```

**触发者**: 对话框确认按钮
**有效载荷包括**: 对话框状态、记录数据
**效果**: 更新对话框可见性状态

### 表格事件 (`module/event-pipeline/module/table.js`)

```javascript
export const handle_table_action_confirm_click = (payload, str) => {
  console.log('handle_table_action_confirm_click', payload, str)
  // Handle table action
  // 处理表格操作
}

export const on_table_change = (payload, { pagination, filters, sorter }) => {
  console.log('Pagination changed:', pagination)
  // Fetch new data based on pagination
  // 基于分页获取新数据
}
```

**触发者**: 表格分页、排序、筛选
**参数**: 表格组件的标准事件参数
**效果**: 更新表格数据和分页状态

### 其他事件 (`module/event-pipeline/module/other.js`)

```javascript
import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

export { handle_init_table_data }

export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
```

**触发者**: 搜索按钮点击
**效果**: 启动 API 调用以获取筛选数据

## 事件使用模式

### 在组件中

```javascript
<q-btn label="查询" @click="ALL_EVENT_PIPELINE.other.handle_query_click" />

import { ALL_EVENT_PIPELINE } from
'src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js'
```

### 直接调用与有效载荷

```javascript
<q-btn
  label="Delete"
  @click="() => ALL_EVENT_PIPELINE.table.handle_table_action_confirm_click(payload, 'delete')"
/>
```

### 传递事件数据

```javascript
// In component
// 在组件中
const handle_table_row_click = (record) => {
  ALL_EVENT_PIPELINE.table.handle_row_click({ record })
}

// In event handler
// 在事件处理程序中
export const handle_row_click = (payload, data) => {
  const { current_record_to_dialog_data } = payload
  const { record } = data

  current_record_to_dialog_data.value = record
}
```

## 创建新事件

### 步骤 1：创建处理程序模块

创建文件 `module/event-pipeline/module/new-feature.js`：

```javascript
export const handle_new_feature_action = (payload) => {
  const { table_data } = payload
  console.log('Custom action triggered')
  return { success: true }
}
```

### 步骤 2：模块自动发现

装配器自动通过全局模式找到它。

### 步骤 3：在组件中使用

```javascript
const { handle_new_feature_action } = useContextAssembler(payload, all_atoms_assembler())

// Or via event pipeline if configured
// 或者如果配置了通过事件管道
ALL_EVENT_PIPELINE.new_feature.handle_new_feature_action()
```

## 事件链

事件可以触发其他事件：

```javascript
export const handle_save_record = (payload) => {
  const { ALL_EVENT_PIPELINE, table_data } = payload

  // Save operation
  // 保存操作
  saveToDatabase(table_data.value)

  // Chain: trigger refresh
  // 链式：触发刷新
  ALL_EVENT_PIPELINE.other.handle_query_click(payload)
}
```

## 具有自定义参数的事件

```javascript
// Handler with custom parameters
// 具有自定义参数的处理程序
export const handle_delete_record = (payload, recordId, callback) => {
  const { table_data } = payload

  table_data.value = table_data.value.filter((item) => item.id !== recordId)

  if (callback) callback()
}

// Usage
// 用法
ALL_EVENT_PIPELINE.table.handle_delete_record(null, recordId, () => {
  console.log('Delete complete')
})
```

## 事件生命周期

### 1. 事件被触发

```javascript
ALL_EVENT_PIPELINE.dialog.handle_dialog_copy_use_confirm_click()
```

### 2. 处理程序被调用

事件系统传递：

- `payload` - 完整上下文对象
- `...args` - 附加参数

### 3. 状态变更

处理程序通过有效载荷引用修改状态：

```javascript
const { all_dialog_state } = payload
all_dialog_state.value = {
  /* new state */
}
```

### 4. 响应式被触发

Vue 检测 ref 更改并重新渲染

### 5. 组件更新

所有读取修改状态的组件看到更改

## 最佳实践

### ✅ 应该做

- 保持处理程序专注于单一责任
- 使用描述性的处理程序名称（`handle_*`、`on_*`）
- 按域组织（对话框、表格等）
- 通过处理程序传递所有变更
- 尽可能保持处理程序纯净

### ❌ 不应该做

- 在处理程序外部创建副作用
- 在组件中直接修改状态
- 创建修改其他域状态的处理程序
- 链式太多事件（限制深度）
- 创建具有隐式依赖的处理程序

## 测试事件

```javascript
// Test event handler
// 测试事件处理程序
import { handle_query_click } from './module/event-pipeline/module/other.js'

test('handle_query_click updates table data', () => {
  const payload = {
    query_form: { value: { key_word: 'test' } },
    table_data: { value: [] },
  }

  handle_query_click(payload)

  // Assert state changes
  // 断言状态更改
  expect(payload.table_data.value.length).toBeGreaterThan(0)
})
```

## 事件错误处理

```javascript
export const handle_api_call = (payload) => {
  const { table_data, table_loading } = payload

  table_loading.value = true

  try {
    const response = await api_service.fetch(payload)
    table_data.value = response.data
  } catch (error) {
    console.error('API Error:', error)
    // Trigger error event
    // 触发错误事件
    ALL_EVENT_PIPELINE.other.handle_error(payload, error)
  } finally {
    table_loading.value = false
  }
}
```
