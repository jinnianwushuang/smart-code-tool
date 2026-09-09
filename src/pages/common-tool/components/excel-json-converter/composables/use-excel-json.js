import { ref, reactive, computed } from 'vue'
import { exportFile } from 'quasar'
import * as XLSX from 'xlsx'
import { copyText } from 'src/output/common/project-common.js'

export function useExcelJson() {
  const importTab = ref('file')
  const excelFile = ref(null)
  const pasteText = ref('')
  const rawData = ref([])
  const rawHeaders = ref([])
  const mapping = reactive({})

  const config = reactive({
    trimSpace: true,
    removeEmpty: true,
    asObject: false,
  })

  const finalJson = computed(() => {
    if (rawData.value.length === 0) return []

    return rawData.value
      .map((row) => {
        const newRow = {}
        rawHeaders.value.forEach((header) => {
          const { newKey, enabled } = mapping[header]
          if (enabled) {
            let val = row[header]
            if (config.trimSpace && typeof val === 'string') val = val.trim()
            newRow[newKey || header] = val
          }
        })
        return newRow
      })
      .filter((row) => {
        if (!config.removeEmpty) return true
        return Object.values(row).some((v) => v !== null && v !== undefined && v !== '')
      })
  })

  const jsonString = computed(() => {
    if (finalJson.value.length === 0) return ''
    const data =
      config.asObject && finalJson.value.length === 1 ? finalJson.value[0] : finalJson.value
    return JSON.stringify(data, null, 2)
  })

  const initMapping = (headers) => {
    rawHeaders.value = headers
    headers.forEach((h) => {
      if (!mapping[h]) {
        mapping[h] = { newKey: '', enabled: true }
      }
    })
  }

  const handleFileImport = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
      const ws = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws)
      if (json.length > 0) {
        initMapping(Object.keys(json[0]))
        rawData.value = json
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (!text) return
    const rows = text
      .trim()
      .split(/\r?\n/)
      .map((row) => row.split('\t'))
    if (rows.length < 2) return

    const headers = rows[0].map((h) => h.trim())
    const data = rows.slice(1).map((row) => {
      const obj = {}
      headers.forEach((h, i) => (obj[h] = row[i]))
      return obj
    })

    initMapping(headers)
    rawData.value = data
  }

  const copy = (txt) => {
    if (!txt) return
    copyText(txt)
  }

  const downloadJson = () => {
    exportFile(`data_${Date.now()}.json`, jsonString.value, 'application/json')
  }

  const clearAll = () => {
    rawData.value = []
    rawHeaders.value = []
    excelFile.value = null
    pasteText.value = ''
  }

  return {
    importTab,
    excelFile,
    pasteText,
    rawHeaders,
    mapping,
    config,
    finalJson,
    jsonString,
    handleFileImport,
    handlePaste,
    copy,
    downloadJson,
    clearAll,
  }
}
