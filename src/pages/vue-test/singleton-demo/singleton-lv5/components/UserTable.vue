<template>
  <a-table
    :columns="columns"
    :data-source="tableData"
    :loading="loading"
    :pagination="pagination"
    @change="(pag) => all_event_pipeline.table.handleTableChange(pag)"
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
        <a @click="all_event_pipeline.table.handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确定要删除该用户吗？"
          @confirm="all_event_pipeline.table.handleDelete(record.id)"
        >
          <a style="color: #ff4d4f">删除</a>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { columns } from '../state/config.js'
import { all_singleton } from '../state/singleton.js'
import { all_event_pipeline } from '../module/event-pipeline/event-pipeline.js'
const { tableData, loading, pagination } = all_singleton
defineProps({})
</script>

<style scoped>
:deep(.ant-table-pagination) {
  margin: 16px 0 !important;
}
</style>
