<template>
  <div class="row q-col-gutter-md">
    <div v-for="col in statColumns" :key="col.name" class="col-12 col-sm-6 col-md-4">
      <q-card flat bordered class="stat-card transition-base">
        <q-card-section class="row items-center no-wrap">
          <div class="text-subtitle1 text-weight-bold stat-title" :title="col.label">
            {{ col.label }}
          </div>
          <q-badge :color="col.isNumeric ? 'blue' : 'orange'" class="q-mx-sm">
            {{ col.isNumeric ? '数值型' : '分类型' }}
          </q-badge>
          <q-space />
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="content_copy"
            color="teal"
            @click.stop="copyCardData(col)"
          >
            <q-tooltip>复制统计数据</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="bar_chart"
            color="primary"
            @click.stop="$emit('openChart', col)"
          >
            <q-tooltip>查看图表</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-card-section v-if="col.isNumeric" class="q-pt-none">
          <div class="row q-gutter-sm">
            <div v-for="item in numericStats" :key="item.key" class="stat-item">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ formatNum(col.stats[item.key]) }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else class="q-pt-none">
          <div class="text-caption text-grey-7 q-mb-xs">
            去重数：{{ col.stats.uniqueCount }} | 总计：{{ col.stats.count }} 条
          </div>
          <q-table
            :rows="col.stats.topN"
            :columns="categoryColumns"
            flat
            dense
            bordered
            hide-bottom
            :pagination="{ rowsPerPage: 0 }"
            row-key="value"
            class="category-table"
          >
            <template v-slot:body-cell-index="props">
              <q-td :props="props" style="width: 40px" class="text-center">
                {{ props.rowIndex + 1 }}
              </q-td>
            </template>
            <template v-slot:body-cell-percent="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <q-linear-progress
                    :value="Number(props.row.percent) / 100"
                    color="orange"
                    class="q-mr-sm"
                    style="width: 60px"
                  />
                  <span>{{ props.row.percent }}%</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { copyText } from 'src/output/common/project-common.js'
import { formatNum } from '../utils/parse-table.js'

defineProps({
  statColumns: { type: Array, required: true },
})

defineEmits(['openChart'])

const numericStats = [
  { key: 'sum', label: '总和' },
  { key: 'avg', label: '平均' },
  { key: 'max', label: '最大' },
  { key: 'min', label: '最小' },
  { key: 'median', label: '中位数' },
  { key: 'stdDev', label: '标准差' },
]

const categoryColumns = [
  { name: 'index', label: '#', field: 'index', align: 'center' },
  { name: 'value', label: '值', field: 'value', align: 'left' },
  { name: 'count', label: '数量', field: 'count', align: 'right', style: 'width: 60px' },
  { name: 'percent', label: '占比', field: 'percent', align: 'left', style: 'min-width: 120px' },
]

const copyCardData = (col) => {
  let text = ''
  if (col.isNumeric) {
    const lines = [`${col.label}（数值型）统计：`]
    numericStats.forEach((item) => {
      lines.push(`${item.label}: ${formatNum(col.stats[item.key])}`)
    })
    text = lines.join('\n')
  } else {
    const lines = [
      `${col.label}（分类型）分布：去重数 ${col.stats.uniqueCount}，总计 ${col.stats.count} 条`,
    ]
    lines.push('序号\t值\t数量\t占比')
    col.stats.topN.forEach((item, idx) => {
      lines.push(`${idx + 1}\t${item.value}\t${item.count}\t${item.percent}%`)
    })
    text = lines.join('\n')
  }
  copyText(text)
}
</script>

<style scoped>
.stat-card {
  border: 2px solid transparent;
}
.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.stat-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
  cursor: default;
  user-select: text;
}
.stat-item {
  text-align: center;
  min-width: 70px;
}
.stat-label {
  font-size: 11px;
  opacity: 0.7;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
}
.category-table {
  font-size: 12px;
  user-select: text;
}
.category-table :deep(th),
.category-table :deep(td) {
  user-select: text !important;
  cursor: text;
}
.category-table :deep(.q-table__top),
.category-table :deep(.q-table__bottom) {
  display: none;
}
.category-table :deep(th) {
  font-size: 11px;
  padding: 4px 8px;
}
.category-table :deep(td) {
  padding: 3px 8px;
}
</style>
