<template>
  <div style="">
    <div>停留时长： {{ use_time_str }} : {{ encouragement }}</div>
    <UserSearch />

    <UserTable />
    <UserModal v-model:visible="modalVisible" />
  </div>
</template>
<script setup>
import { provide, inject } from 'vue'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserModal from './components/UserModal.vue'

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'
import { ALL_CONTEXT_STATE, ALL_EVENT_PIPELINE } from './assembler/expose.js'

// 记录当前文件路径
const VUE_FILE_PATH = import.meta.url
// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
// const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = []
// 基础上下文
const base_payload = {
  VUE_FILE_PATH,

  ALL_CONTEXT_STATE,
  ALL_EVENT_PIPELINE,

  // props,
  income_pipeline,
  wrap_payload,
}
// try {
const { modalVisible, encouragement, use_time_str } = useContextAssembler(
  base_payload,
  all_atoms_assembler(),
)
// } catch (error) {
//   console.error(error)
// }

console.log('ALL_CONTEXT_STATE--------', ALL_CONTEXT_STATE)
provide('ALL_EVENT_PIPELINE', ALL_EVENT_PIPELINE)
provide('ALL_CONTEXT_STATE', ALL_CONTEXT_STATE)
</script>
<style scoped></style>
