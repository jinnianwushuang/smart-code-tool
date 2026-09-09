import { ref, computed } from 'vue'
import { copyText } from 'src/output/common/project-common.js'

export function useTextExtract() {
  // --- 状态 ---
  const inputText = ref('')
  const extractMode = ref('words') // 'words' | 'numbers'
  const template = ref('')
  const placeholder = ref('{{item}}')

  // --- 提取逻辑 ---
  const extractedItems = computed(() => {
    if (!inputText.value) return []
    const text = inputText.value
    let matches = []

    if (extractMode.value === 'words') {
      // 提取连续英文字母组成的单词，转小写
      matches = text.match(/[a-zA-Z]+/g) || []
      return matches.map((w) => w.toLowerCase())
    } else {
      // 提取连续数字
      matches = text.match(/\d+/g) || []
      return matches
    }
  })

  // --- 统计逻辑 ---
  const stats = computed(() => {
    const items = extractedItems.value
    if (!items.length) return { total: 0, unique: 0, freqMap: [], sortedRows: [] }

    const freq = {}
    items.forEach((item) => {
      freq[item] = (freq[item] || 0) + 1
    })

    const freqMap = Object.entries(freq).map(([value, count]) => ({ value, count }))
    // 按出现次数从高到低排序
    const sortedRows = freqMap
      .sort((a, b) => b.count - a.count)
      .map((item, index) => ({
        index: index + 1,
        value: item.value,
        count: item.count,
        percent: ((item.count / items.length) * 100).toFixed(1),
      }))

    return {
      total: items.length,
      unique: Object.keys(freq).length,
      freqMap,
      sortedRows,
    }
  })

  // --- 去重列表 ---
  const uniqueItems = computed(() => {
    return [...new Set(extractedItems.value)]
  })

  // --- 模板替换逻辑 ---
  const templateResult = computed(() => {
    if (!template.value || !uniqueItems.value.length) return ''
    const ph = placeholder.value || '{{item}}'
    return uniqueItems.value.map((item) => template.value.replaceAll(ph, item)).join('\n')
  })

  // --- 操作方法 ---
  const copyExtracted = () => {
    const text = uniqueItems.value.join('\n')
    if (!text) return
    copyText(text)
  }

  const copyStats = () => {
    const rows = stats.value.sortedRows
    if (!rows.length) return
    const text = rows.map((r) => `${r.index}\t${r.value}\t${r.count}\t${r.percent}%`).join('\n')
    const header = `序号\t值\t次数\t占比\n`
    const summary = `\n去重数: ${stats.value.unique}\t总数: ${stats.value.total}`
    copyText(header + text + summary)
  }

  const copyTemplateResult = () => {
    if (!templateResult.value) return
    copyText(templateResult.value)
  }

  const loadSample = () => {
    if (extractMode.value === 'words') {
      inputText.value = `Hello world! This is a test. Hello Vue, hello World. The test is about Vue and React.`
    } else {
      inputText.value = `订单号 10023，用户ID 4589，电话 13800138000，验证码 9527，订单号 10023，金额 299`
    }
    template.value = `const ${placeholder.value} = ref('')`
  }

  const clearAll = () => {
    inputText.value = ''
    template.value = ''
  }

  return {
    inputText,
    extractMode,
    template,
    placeholder,
    extractedItems,
    stats,
    uniqueItems,
    templateResult,
    copyExtracted,
    copyStats,
    copyTemplateResult,
    loadSample,
    clearAll,
  }
}
