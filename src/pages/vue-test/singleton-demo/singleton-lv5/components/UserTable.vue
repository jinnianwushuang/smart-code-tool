<template>
  <a-table
    :columns="columns"
    :data-source="tableData"
    :loading="loading"
    :pagination="pagination"
    @change="(pag) => ALL_EVENT_PIPELINE.table?.handleTableChange(pag)"
    row-key="id"
    bordered
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <a-tag :color="record.status === '1' ? 'green' : 'red'">
          {{ record.status === '1' ? '启用' : '禁用' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'action'">
        <a @click="ALL_EVENT_PIPELINE.table?.handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确定要删除该用户吗？"
          @confirm="ALL_EVENT_PIPELINE.table?.handleDelete(record.id)"
        >
          <a style="color: #ff4d4f">删除</a>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { provide, inject } from 'vue'

const ALL_EVENT_PIPELINE = inject('ALL_EVENT_PIPELINE')
const ALL_CONTEXT_STATE = inject('ALL_CONTEXT_STATE')
const { tableData, loading, pagination, columns } = ALL_CONTEXT_STATE
defineProps({})
</script>

<style scoped>
:deep(.ant-table-pagination) {
  margin: 16px 0 !important;
}
</style>
