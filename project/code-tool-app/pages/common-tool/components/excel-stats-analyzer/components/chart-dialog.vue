<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 80vw; max-width: 90vw; min-height: 70vh">
      <q-card-section class="row items-center q-pb-none dialog-header">
        <div class="text-h6 text-weight-bold">{{ col?.label }} - 图表分析</div>
        <q-badge :color="col?.isNumeric ? 'blue' : 'orange'" class="q-ml-sm">
          {{ col?.isNumeric ? '数值型' : '分类型' }}
        </q-badge>
        <q-space />
        <q-btn-toggle
          v-if="col"
          v-model="chartType"
          no-caps
          size="sm"
          class="q-mr-md chart-toggle"
          :options="chartOptions"
          toggle-color="primary"
          @update:model-value="renderChart"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="image"
          label="导出图片"
          color="primary"
          class="q-mr-sm"
          @click="exportImage"
        />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>
      <q-card-section style="height: 60vh">
        <div ref="chartEl" style="width: 100%; height: 100%"></div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getChartOptions, getDefaultChartType, buildChartOption } from '../utils/chart-builder.js'

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

const props = defineProps({
  col: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  headers: { type: Array, default: () => [] },
})

const show = defineModel('show', { type: Boolean, default: false })

const chartType = ref('bar')
const chartEl = ref(null)
let chartInstance = null

const chartOptions = computed(() => getChartOptions(props.col))

const chartTypeLabelMap = {
  bar: '柱状图',
  line: '折线图',
  'smooth-line': '平滑折线图',
  pie: '饼图',
  radar: '雷达图',
  treemap: '矩形树图',
}

const exportImage = () => {
  if (!chartInstance) return
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: isDark.value ? '#1e1e1e' : '#fff',
  })
  const typeName = chartTypeLabelMap[chartType.value] || chartType.value
  const timeStr = dayjs().format('YYYY-MM-DD-HH-mm-ss')
  const fileName = `${props.col?.label || 'chart'}_${typeName}_${timeStr}.png`
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
}

const open = (col) => {
  chartType.value = getDefaultChartType(col)
  show.value = true
  nextTick(() => renderChart())
}

const close = () => {
  show.value = false
  disposeChart()
}

const disposeChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

const renderChart = () => {
  const el = chartEl.value
  if (!el || !props.col) return

  if (!chartInstance) {
    chartInstance = echarts.init(el, isDark.value ? 'dark' : undefined)
  }

  const option = buildChartOption(
    props.col,
    chartType.value,
    props.rows,
    props.headers,
    isDark.value,
  )
  chartInstance.setOption(option, true)
}

// 主题切换时重新渲染
watch(isDark, () => {
  if (show.value) {
    disposeChart()
    nextTick(() => renderChart())
  }
})

// 窗口 resize
const handleResize = () => chartInstance?.resize()
window.addEventListener('resize', handleResize)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeChart()
})

defineExpose({ open })
</script>

<style scoped>
.dialog-header {
  background: var(--guide-card-bg, #f5f5f5);
  transition: background-color 0.3s;
}

.chart-toggle {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.chart-toggle :deep(.q-btn) {
  padding: 4px 10px;
  min-height: 32px;
}

.chart-toggle :deep(.q-btn .q-icon) {
  font-size: 18px;
  margin-right: 4px;
}
</style>
