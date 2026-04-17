---
title: 模板接入说明
order: 52
---

# 组件使用与模板接入说明

## 主组件入口

`index.vue` 是本模块的主组件入口，它展示了如何将可拔插架构接入 Vue 组件。

```javascript
<template>
  <div>{{ user_info }}</div>
  <div>{{ compute_btn_class('a') }}</div>
  <div></div>
</template>

<script setup>
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/module/assembler.js'

const props = defineProps({})
const emit = defineEmits([])
const income_pipeline = ['income_public_fn_a']
const wrap_payload = ['handle_query_demo']
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}

const {
  user_info,
  btn_a_click,
  wrapped_payload: { handle_query_demo },
} = useContextAssembler(base_payload, all_atoms_assembler())
</script>
```

## 解释说明

- `props`：组件对外属性
- `emit`：组件事件发射
- `income_pipeline`：下游组件调用的入口函数名列表
- `wrap_payload`：将指定方法包装进组件模板
- `base_payload`：作为组件上下文传给 `useContextAssembler`

## `useContextAssembler` 的作用

`useContextAssembler` 负责将：

- 经过 `all_atoms_assembler()` 装配的状态
- 当前组件的 `base_payload`

组合成可供模板直接使用的响应式对象。

## 示例说明

```javascript
const {
  user_info,
  btn_a_click,
  wrapped_payload: { handle_query_demo },
} = useContextAssembler(base_payload, all_atoms_assembler())
```

- `user_info` 来自状态模块
- `btn_a_click` 来自 `module/emit/emit.js`
- `handle_query_demo` 来自包装后的业务方法

## 组件可插拔点

1. 在 `component/` 下新增子模块
2. 在 `module/` 下新增事件、生命周期或业务方法
3. 在 `state/` 下新增共享状态
4. 在 `api-request/` 下新增请求流程

## 小结

- `index.vue` 是组件与可拔插架构的接合点
- `base_payload` 与动态组装器是贯穿整个模板的核心
- 该组件结构适合快速扩展业务功能且不污染主逻辑
