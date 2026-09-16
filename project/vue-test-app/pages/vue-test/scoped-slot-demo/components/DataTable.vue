<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width ? col.width + 'px' : 'auto' }"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIdx) in data" :key="rowIdx">
          <td v-for="col in columns" :key="col.key">
            <!-- 如果该列定义了 slot 名称，使用对应的插槽 -->
            <slot
              v-if="col.slot"
              :name="`cell-${col.slot}`"
              :value="row[col.key]"
              :record="row"
              :index="rowIdx"
            >
              {{ row[col.key] }}
            </slot>
            <!-- 否则直接显示值 -->
            <template v-else>{{ row[col.key] }}</template>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.length === 0" class="empty-state">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
})
</script>

<style scoped>
.data-table {
  width: 100%;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #666;
}
td {
  font-size: 14px;
}
tr:hover td {
  background: #f5f5f5;
}
.empty-state {
  text-align: center;
  padding: 32px;
  color: #bbb;
}

/* 暗色模式 */
body.body--dark th,
body.body--dark td {
  border-bottom-color: #333;
}
body.body--dark th {
  background: #2a2a2a;
  color: #aaa;
}
body.body--dark tr:hover td {
  background: #2a2a2a;
}
body.body--dark .empty-state {
  color: #777;
}
</style>
