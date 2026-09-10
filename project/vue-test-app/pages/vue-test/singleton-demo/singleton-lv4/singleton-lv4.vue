<template>
  <div style="">
    <div>停留时长： {{ use_time_str }} : {{ encouragement }}</div>
    <UserSearch />
    <UserTable />
    <UserModal v-model:visible="modalVisible" />
  </div>
</template>
<script setup>
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserModal from './components/UserModal.vue'

import { composable_index } from './componsable/index.js'
import { composable_state } from './componsable/state.js'
import { src_composable_demo_use_user_time_composable_index } from 'src/output/common/composable-common.js'

// 状态机
const base_paylaod = composable_state({
  pageSize: 100,
})
const { modalVisible, encouragement, use_time_str } = base_paylaod
const { loadData } = composable_index(base_paylaod)
src_composable_demo_use_user_time_composable_index({
  ...base_paylaod,
  run_every_2_minutes: loadData,
})
</script>
<style scoped></style>
