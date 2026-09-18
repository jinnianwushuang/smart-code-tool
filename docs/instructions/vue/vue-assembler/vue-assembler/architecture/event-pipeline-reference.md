# 事件管道系统参照

## 核心概念

事件管道是集中式事件处理系统。所有用户交互通过管道路由，处理程序按业务域组织在独立文件中，由装配器自动发现和注册。

**流程**：用户交互 → 组件触发 `ALL_EVENT_PIPELINE.域.处理函数()` → 状态变更 / API 调用 → 响应式更新 → UI 重新渲染

## 事件管道注册

```javascript
// module/event-pipeline/event-pipeline.js
import { assemble_event_pipeline } from '<!-- 需配置 -->'

// 自动扫描 event-pipeline 目录下的所有模块
const modules = import.meta.glob('../module/event-pipeline/*.js', { eager: true })
const current_file_path = import.meta.url

export const { ALL_EVENT_PIPELINE, create_event_pipeline } = assemble_event_pipeline(
  modules,
  current_file_path,
)
```

## 按业务域组织事件处理程序

```
module/event-pipeline/
├── dialog.js    # 对话框相关事件
├── table.js     # 表格相关事件
└── other.js     # 通用事件（查询、初始化等）
```

### 对话框事件（dialog.js）

```javascript
// 对话框确认按钮点击
export const handle_dialog_copy_use_confirm_click = (payload) => {
  const { all_dialog_state } = payload
  all_dialog_state.value.dialog_copy_use = true
}
```

### 表格事件（table.js）

```javascript
// 表格分页/排序/筛选变更
export const on_table_change = (payload, { pagination, filters, sorter }) => {
  // 基于新分页获取数据
}

// 表格操作确认
export const handle_table_action_confirm_click = (payload, str) => {
  // 处理表格操作
}
```

### 通用事件（other.js）

```javascript
// 查询按钮点击 — 触发 API 调用
export const handle_query_click = (payload) => {
  const { handle_init_table_data } = payload
  handle_init_table_data(payload)
}
```

## 在组件中使用事件管道

```vue
<template>
  <!-- 直接绑定事件管道处理函数 -->
  <button @click="ALL_EVENT_PIPELINE.other.handle_query_click">查询</button>

  <!-- 带参数调用 -->
  <button @click="() => ALL_EVENT_PIPELINE.table.handle_delete(payload, record_id)">删除</button>
</template>

<script setup>
// 从装配器获取事件管道
const { ALL_EVENT_PIPELINE } = useContextAssembler(base_payload, all_atoms_assembler())
</script>
```

## 事件链（事件触发其他事件）

```javascript
export const handle_save_record = (payload) => {
  const { ALL_EVENT_PIPELINE, table_data } = payload

  // 1. 执行保存操作
  save_to_database(table_data.value)

  // 2. 链式触发刷新
  ALL_EVENT_PIPELINE.other.handle_query_click(payload)
}
```

## 创建新事件的标准步骤

1. 在 `module/event-pipeline/` 下对应的业务域文件中新增导出函数
2. 函数命名规则：`handle_*`（主动操作）或 `on_*`（响应变化）
3. 第一个参数固定为 `payload`，第二个参数为额外数据
4. **无需手动注册** — 装配器自动发现

## 事件处理函数签名

```javascript
// 无额外参数
export const handle_xxx = (payload) => {}

// 有额外参数
export const handle_xxx = (payload, extra_data) => {}

// 响应式变化回调
export const on_xxx_change = (payload, { pagination, filters, sorter }) => {}
```

## 关键约束

- 事件处理程序保持单一职责，一个函数只做一件事
- 按业务域组织文件（dialog / table / other），禁止混放
- 禁止在事件处理程序外部创建副作用
- 禁止在组件中直接修改状态（必须通过事件管道）
- 事件链深度不超过 2 层，避免过度级联
