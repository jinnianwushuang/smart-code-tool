<template>
  <div>{{ user_info }}</div>
  <div>{{ compute_btn_class('a') }}</div>

  <div></div>
</template>

<script setup>
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

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

<style lang="scss" scoped></style>
