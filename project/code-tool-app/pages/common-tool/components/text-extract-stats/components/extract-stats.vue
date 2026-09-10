<template>
  <div>
    <!-- 汇总信息 -->
    <div class="row q-gutter-md q-mb-md">
      <q-badge color="indigo" class="q-px-md q-py-sm"> 总数: {{ stats.total }} </q-badge>
      <q-badge color="teal" class="q-px-md q-py-sm"> 去重数: {{ stats.unique }} </q-badge>
      <q-space />
      <q-btn
        flat
        dense
        icon="content_copy"
        color="primary"
        label="复制统计"
        size="sm"
        @click="copyStats"
      />
      <q-btn
        flat
        dense
        icon="content_copy"
        color="teal"
        label="复制去重列表"
        size="sm"
        @click="copyExtracted"
      />
    </div>

    <!-- 统计表格 -->
    <q-table
      :rows="stats.sortedRows"
      :columns="columns"
      flat
      bordered
      dense
      hide-bottom
      :pagination="{ rowsPerPage: 0 }"
      row-key="value"
      class="stats-table rounded-borders"
    >
      <template v-slot:body-cell-index="props">
        <q-td :props="props" style="width: 50px" class="text-center text-weight-bold text-grey-6">
          {{ props.row.index }}
        </q-td>
      </template>
      <template v-slot:body-cell-value="props">
        <q-td :props="props" class="text-weight-bold font-mono">
          {{ props.row.value }}
        </q-td>
      </template>
      <template v-slot:body-cell-count="props">
        <q-td :props="props" class="text-center">
          <q-badge color="orange" :label="props.row.count" />
        </q-td>
      </template>
      <template v-slot:body-cell-percent="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-linear-progress
              :value="Number(props.row.percent) / 100"
              color="orange"
              class="q-mr-sm"
              style="width: 80px"
            />
            <span class="text-caption">{{ props.row.percent }}%</span>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
defineProps({
  stats: Object,
  copyStats: Function,
  copyExtracted: Function,
})

const columns = [
  { name: 'index', label: '#', field: 'index', align: 'center' },
  { name: 'value', label: '值', field: 'value', align: 'left', sortable: true },
  { name: 'count', label: '次数', field: 'count', align: 'center', sortable: true },
  { name: 'percent', label: '占比', field: 'percent', align: 'left', sortable: true },
]
</script>

<style scoped>
.stats-table {
  max-height: 400px;
}

.stats-table :deep(th),
.stats-table :deep(td) {
  user-select: text !important;
  cursor: text;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', monospace;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
