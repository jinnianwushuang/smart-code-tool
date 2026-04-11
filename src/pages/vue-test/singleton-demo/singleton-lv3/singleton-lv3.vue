<template>
  <div style="padding: 24px; background: #fff; min-height: 100vh">
    <UserSearch :search-state="searchState" @search="onSearch" @reset="onReset" />
    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        新增用户
      </a-button>
    </div>
    <UserTable
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <UserModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :initial-data="formState"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
    />
  </div>
</template>
<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserModal from './components/UserModal.vue'

import { create_variable } from './variable/index.js'
import { composable_index } from './componsable/index.js'
// 状态机
const base_paylaod = create_variable({
  pageSize: 100,
})
const {
  searchState,
  formState,
  modalVisible,
  isEdit,
  confirmLoading,
  tableData,
  loading,
  pagination,
} = base_paylaod
const { onSearch, onReset, handleTableChange, handleEdit, handleDelete, handleAdd, handleModalOk } =
  composable_index(base_paylaod)
</script>
<style scoped></style>
