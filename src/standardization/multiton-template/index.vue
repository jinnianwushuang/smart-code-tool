<template>
  <div>{{ user_info }}</div>
  <div>{{ compute_btn_class('a') }}</div>
  <ComponentDemo :parent_payload="payload" />
  <div></div>
</template>

<script setup>
import { provide, inject } from 'vue'
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'
import ComponentDemo from './component/component-demo/component-demo.vue'
const current_tab = inject('current_tab')
// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = ['income_public_fn_a']
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = ['handle_query_demo']
// 基础上下文
const base_payload = {
  current_tab,
  props,
  income_pipeline,

  wrap_payload,
}
const payload = useContextAssembler(base_payload, all_atoms_assembler())

const {
  user_info,
  btn_a_click,
  wrapped_payload: { handle_query_demo },
  // all_event_pipeline,
} = payload

// provide('all_event_pipeline', all_event_pipeline)
</script>

<style lang="scss" scoped></style>
