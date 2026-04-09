<template>
  <div style="padding: 24px; background: #fff; min-height: 100vh">
    <div>停留时长： {{ use_time_str }} : {{ encouragement }}</div>
    <UserSearch />
    <UserTable />
    <UserModal v-model:visible="modalVisible" />
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserModal from './components/UserModal.vue'

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = []
// 基础上下文
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}

const { modalVisible, encouragement, use_time_str } = useContextAssembler(
  base_payload,
  all_atoms_assembler(),
)
</script>
<style scoped></style>
