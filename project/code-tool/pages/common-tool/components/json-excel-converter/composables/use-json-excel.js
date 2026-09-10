import { ref, reactive, computed } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import * as XLSX from 'xlsx'
import * as changeCaseLib from 'change-case'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'
import { smartParse, repairType } from '../utils/data-governance.js'

export function useJsonExcel() {
  const $q = useQuasar()
  const inputTab = ref('paste')
  const viewTab = ref('table')
  const rawInput = ref('')
  const filePicker = ref(null)
  const parsedData = ref([])
  const filterKeys = ref('')

  const config = reactive({
    maskSensitive: false,
    autoTypeRepair: true,
    caseType: '',
  })

  const handleParse = (val) => {
    parsedData.value = smartParse(val)
  }

  const handleFileImport = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      rawInput.value = e.target.result
      handleParse(e.target.result)
      inputTab.value = 'paste'
    }
    reader.readAsText(file)
  }

  const finalData = computed(() => {
    if (!parsedData.value.length) return []
    const selectedKeys = filterKeys.value ? filterKeys.value.split(',').map((k) => k.trim()) : null
    return parsedData.value.map((item) => {
      let newItem = {}
      Object.keys(item).forEach((key) => {
        if (selectedKeys && !selectedKeys.includes(key)) return
        let newKey = key
        if (config.caseType === 'camel') newKey = changeCaseLib.camelCase(key)
        else if (config.caseType === 'snake') newKey = changeCaseLib.snakeCase(key)
        let val = item[key]
        if (config.autoTypeRepair) val = repairType(val)
        if (config.maskSensitive && typeof val === 'string') {
          if (/^\d{11}$/.test(val)) val = val.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
          else if (val.includes('@')) val = val.replace(/(.{2}).+(@.+)/, '$1***$2')
        }
        newItem[newKey] = val
      })
      return newItem
    })
  })

  const formattedJson = computed(() => JSON.stringify(finalData.value, null, 2))
  const tableColumns = computed(() => {
    if (!finalData.value.length) return []
    const keys = new Set()
    finalData.value.slice(0, 10).forEach((obj) => Object.keys(obj).forEach((k) => keys.add(k)))
    return Array.from(keys).map((key) => ({ name: key, label: key, field: key, align: 'left', sortable: true }))
  })

  const clearAll = () => {
    rawInput.value = ''
    parsedData.value = []
    filterKeys.value = ''
    config.caseType = ''
    filePicker.value = null
  }

  const loadSample = () => {
    rawInput.value = `[{ "User_ID": "1001", "User_Name": "张三", "Age": "25", "Is_Admin": "true", "Avatar": "null" }]`
    handleParse(rawInput.value)
  }

  const copy = (txt) => {
    if (!txt) return
    projectCopyText(txt)
  }

  const downloadJson = () => exportFile(`治理结果.json`, formattedJson.value)

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(finalData.value)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, `数据治理导出.xlsx`)
  }

  return {
    inputTab, viewTab, rawInput, filePicker, filterKeys, config,
    finalData, formattedJson, tableColumns,
    handleParse, handleFileImport, clearAll, loadSample, copy, downloadJson, exportToExcel,
  }
}
