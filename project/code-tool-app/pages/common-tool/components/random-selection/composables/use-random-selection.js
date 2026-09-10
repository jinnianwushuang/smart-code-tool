import { ref, onMounted, toRaw } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import Dexie from 'dexie'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

export function useRandomSelection() {
  const $q = useQuasar()
  const db = new Dexie('FinalDataGovernanceDB')
  db.version(1).stores({ history: '++id, name, time' })

  const rawInput = ref('')
  const blacklistInput = ref('')
  const whitelistInput = ref('')
  const processedList = ref([])
  const drawCount = ref(1)
  const drawResults = ref([])
  const libName = ref('')
  const historyList = ref([])
  const fileInput = ref(null)

  const splitText = (text) => {
    if (!text) return []
    const regex = /[,，:："'""''";；\s\n]+/
    return [
      ...new Set(
        text
          .split(regex)
          .map((i) => i.trim())
          .filter((i) => i.length > 0),
      ),
    ]
  }

  const processAll = () => {
    const raw = splitText(rawInput.value)
    const black = splitText(blacklistInput.value)
    const white = splitText(whitelistInput.value)
    let result = raw.filter((item) => !black.includes(item))
    if (white.length > 0) result = result.filter((item) => white.includes(item))
    processedList.value = result
  }

  const exportStandard = (type) => {
    if (processedList.value.length === 0) return
    let content = ''
    let fileName = `standard_data_${Date.now()}`
    let mimeType = 'text/plain'
    if (type === 'txt') {
      content = processedList.value.join('\r\n')
      fileName += '.txt'
    } else if (type === 'csv') {
      const header = 'Standard_Item\n'
      content = header + processedList.value.join('\n')
      fileName += '.csv'
      mimeType = 'text/csv'
    }
    const status = exportFile(fileName, content, mimeType)
    if (status === true) {
      $q.notify({ message: `成功导出 ${processedList.value.length} 条数据`, color: 'positive' })
    }
  }

  const doDraw = () => {
    const pool = [...processedList.value]
    const count = Math.min(drawCount.value, pool.length)
    const picked = []
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      picked.push(pool.splice(idx, 1))
    }
    drawResults.value = picked
  }

  const saveToDB = async () => {
    const name = libName.value || `快照_${new Date().toLocaleTimeString()}`
    try {
      await db.history.add({
        name,
        originalRaw: rawInput.value,
        standardData: toRaw(processedList.value),
        blacklist: toRaw(splitText(blacklistInput.value)),
        whitelist: toRaw(splitText(whitelistInput.value)),
        time: Date.now(),
      })
      libName.value = ''
      await refreshHistory()
      $q.notify({ message: '治理状态已保存', color: 'positive' })
    } catch (error) {
      console.error('存储失败:', error)
      $q.notify({ message: '存储失败: 数据无法被克隆', color: 'negative' })
    }
  }

  const loadFromHistory = (item) => {
    rawInput.value = item.originalRaw || item.standardData.join(', ')
    blacklistInput.value = item.blacklist?.join(', ') || ''
    whitelistInput.value = item.whitelist?.join(', ') || ''
    processAll()
    $q.notify({ message: '已载入历史快照', color: 'info' })
  }

  const refreshHistory = async () => {
    historyList.value = await db.history.reverse().toArray()
  }

  const deleteHistory = async (id) => {
    await db.history.delete(id)
    refreshHistory()
  }

  const triggerImport = () => fileInput.value.click()

  const handleFileRestore = (e) => {
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        await db.history.bulkAdd(data.map(({ id, ...rest }) => rest))
        refreshHistory()
      } catch {
        $q.notify({ message: '解析失败', color: 'negative' })
      }
    }
    reader.readAsText(e.target.files)
  }

  const exportHistory = () =>
    exportFile(
      `governance_backup.json`,
      JSON.stringify(historyList.value, null, 2),
      'application/json',
    )

  const copy = (txt) => {
    if (!txt) return
    projectCopyText(txt)
  }

  onMounted(refreshHistory)

  return {
    rawInput,
    blacklistInput,
    whitelistInput,
    processedList,
    drawCount,
    drawResults,
    libName,
    historyList,
    fileInput,
    processAll,
    exportStandard,
    doDraw,
    saveToDB,
    loadFromHistory,
    deleteHistory,
    triggerImport,
    handleFileRestore,
    exportHistory,
    copy,
  }
}
