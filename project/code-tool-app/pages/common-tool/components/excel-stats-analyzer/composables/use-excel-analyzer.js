/**
 * Excel 统计分析核心状态与逻辑
 */
import { ref, computed } from 'vue'
import {
  parseTableText,
  parseFile,
  computeStatColumns,
  computeGroupStats,
  formatNum,
} from '../utils/parse-table.js'
import {
  getExportData,
  buildMappedData,
  buildKeyMapping,
  copyJsonToClipboard,
  downloadJsonFiles,
  downloadCsv,
  downloadExcel,
  getTimestamp,
} from '../utils/export-data.js'
import { JS_KEY_REGEX, SAMPLE_DATA } from '../utils/constants.js'

export function useExcelAnalyzer() {
  // ─── 核心状态 ───
  const rawInput = ref('')
  const parseError = ref('')
  const headers = ref([])
  const parsedRows = ref([])
  const mainTab = ref('table')
  const enableIndex = ref(false)
  const inputCollapsed = ref(false)
  const uploadFile = ref(null)
  const tableFilter = ref('')

  // ─── 分组统计 ───
  const groupCol = ref('')
  const valueCol = ref('')

  // ─── 弹窗 refs ───
  const chartDialogRef = ref(null)
  const chartDialogShow = ref(false)
  const chartDialogCol = ref(null)
  const jsonExportDialogRef = ref(null)

  // ─── 计算属性 ───
  const statColumns = computed(() => computeStatColumns(headers.value, parsedRows.value))

  const groupColOptions = computed(() =>
    statColumns.value.filter((c) => !c.isNumeric).map((c) => ({ label: c.label, value: c.name })),
  )

  const valueColOptions = computed(() =>
    statColumns.value.filter((c) => c.isNumeric).map((c) => ({ label: c.label, value: c.name })),
  )

  const groupStats = computed(() => {
    if (!groupCol.value || !valueCol.value) return []
    return computeGroupStats(parsedRows.value, groupCol.value, valueCol.value)
  })

  const tableColumns = computed(() => {
    const cols = []
    if (enableIndex.value) {
      cols.push({ name: '__idx', label: '序号', field: '__idx', align: 'center', sortable: true })
    }
    headers.value.forEach((h) => {
      cols.push({ name: h, label: h, field: h, align: 'left', sortable: true })
    })
    return cols
  })

  const displayRows = computed(() => {
    if (!enableIndex.value) return parsedRows.value
    return parsedRows.value.map((r, idx) => ({ ...r, __idx: idx + 1 }))
  })

  const filteredRows = computed(() => {
    const keyword = (tableFilter.value || '').trim().toLowerCase()
    if (!keyword) return displayRows.value
    return displayRows.value.filter((r) =>
      headers.value.some((h) =>
        String(r[h] || '')
          .toLowerCase()
          .includes(keyword),
      ),
    )
  })

  // ─── 输入处理 ───
  const handleInput = (val) => {
    const result = parseTableText(val)
    parseError.value = result.error
    headers.value = result.headers
    parsedRows.value = result.rows
    if (result.rows.length) inputCollapsed.value = true
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    const result = await parseFile(file)
    parseError.value = result.error
    headers.value = result.headers
    parsedRows.value = result.rows
    if (result.rows.length) {
      inputCollapsed.value = true
      rawInput.value = ''
    }
  }

  // ─── 图表 ───
  const openChart = (col) => {
    chartDialogCol.value = col
    chartDialogRef.value?.open(col)
  }

  // ─── 键名校验 ───
  const allKeysValid = () => {
    const keys = enableIndex.value ? ['index', ...headers.value] : [...headers.value]
    return keys.every((k) => JS_KEY_REGEX.test(k))
  }

  // ─── 导出操作 ───
  const copyJson = () => {
    if (allKeysValid()) {
      copyJsonToClipboard(getExportData(headers.value, parsedRows.value, enableIndex.value))
    } else {
      jsonExportDialogRef.value?.open('copy')
    }
  }

  const downloadJson = () => {
    if (allKeysValid()) {
      const data = getExportData(headers.value, parsedRows.value, enableIndex.value)
      const mapping = buildKeyMapping(null, headers.value, enableIndex.value)
      downloadJsonFiles(data, mapping)
    } else {
      jsonExportDialogRef.value?.open('export')
    }
  }

  const handleJsonExport = (keyMapping) => {
    const data = buildMappedData(keyMapping, headers.value, parsedRows.value, enableIndex.value)
    const mapping = buildKeyMapping(keyMapping)
    downloadJsonFiles(data, mapping)
  }

  const handleJsonCopy = (keyMapping) => {
    const data = buildMappedData(keyMapping, headers.value, parsedRows.value, enableIndex.value)
    copyJsonToClipboard(data)
  }

  const exportCsv = () => {
    const data = getExportData(headers.value, parsedRows.value, enableIndex.value)
    downloadCsv(data)
  }

  const exportExcel = () => {
    const data = getExportData(headers.value, parsedRows.value, enableIndex.value)
    downloadExcel(data, statColumns.value, enableIndex.value)
  }

  // ─── 样例与清空 ───
  const loadSample = () => {
    rawInput.value = SAMPLE_DATA
    handleInput(rawInput.value)
  }

  const clearAll = () => {
    rawInput.value = ''
    headers.value = []
    parsedRows.value = []
    parseError.value = ''
    mainTab.value = 'table'
    enableIndex.value = false
    inputCollapsed.value = false
    uploadFile.value = null
    tableFilter.value = ''
    groupCol.value = ''
    valueCol.value = ''
    chartDialogShow.value = false
  }

  return {
    // 状态
    rawInput,
    parseError,
    headers,
    parsedRows,
    mainTab,
    enableIndex,
    inputCollapsed,
    uploadFile,
    tableFilter,
    groupCol,
    valueCol,
    // 弹窗 refs
    chartDialogRef,
    chartDialogShow,
    chartDialogCol,
    jsonExportDialogRef,
    // 计算属性
    statColumns,
    groupColOptions,
    valueColOptions,
    groupStats,
    tableColumns,
    filteredRows,
    // 方法
    handleInput,
    handleFileUpload,
    openChart,
    copyJson,
    downloadJson,
    handleJsonExport,
    handleJsonCopy,
    exportCsv,
    exportExcel,
    loadSample,
    clearAll,
  }
}
