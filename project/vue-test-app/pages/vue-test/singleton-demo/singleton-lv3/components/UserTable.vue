<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="(pag) => $emit('change', pag)"
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
        <a @click="$emit('edit', record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确定要删除该用户吗？" @confirm="$emit('delete', record.id)">
          <a style="color: #ff4d4f">删除</a>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { columns } from '../config/config.js'
defineProps({
  dataSource: Array,
  loading: Boolean,
  pagination: Object,
})
defineEmits(['change', 'edit', 'delete'])
</script>

<style scoped>
:deep(.ant-table-pagination) {
  margin: 16px 0 !important;
}
</style>
