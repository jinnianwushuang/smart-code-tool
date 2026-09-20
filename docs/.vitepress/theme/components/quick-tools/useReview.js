import { ref, computed, onMounted } from 'vue'
import { readStorage, writeStorage, dayjs, downloadText, exportTimestamp } from './utils'
import { REVIEW_KEY } from './constants'

/**
 * 复习记录：同链接唯一，记录当前页面 + 掌握程度（0-10），无条数上限
 * 排序模式：time（更新时间）| mastery-desc（掌握程度从高到低）| mastery-asc（掌握程度从低到高）
 */
export function useReview(getPage) {
  const records = ref([])
  const currentPage = ref({ url: '', title: '' })
  const sortMode = ref('time')

  /** 当前页面已有的掌握程度（用于高亮按钮），无记录返回 null */
  const currentMastery = computed(() => {
    const existing = records.value.find((r) => r.url === currentPage.value.url)
    return existing ? existing.mastery : null
  })

  const latestTime = (r) => new Date(r.updatedAt || r.time)

  const sorted = computed(() => {
    const list = [...records.value]
    if (sortMode.value === 'mastery-desc') {
      return list.sort((a, b) => b.mastery - a.mastery || latestTime(b) - latestTime(a))
    }
    if (sortMode.value === 'mastery-asc') {
      return list.sort((a, b) => a.mastery - b.mastery || latestTime(b) - latestTime(a))
    }
    return list.sort((a, b) => latestTime(b) - latestTime(a))
  })

  /** 刷新当前页面信息（切换到复习 Tab 时调用） */
  const refreshPage = () => {
    const { url, title } = getPage()
    currentPage.value = { url, title }
  }

  /** 记录/更新当前页面的掌握程度 */
  const recordMastery = (mastery) => {
    const { url, title } = getPage()
    currentPage.value = { url, title }
    const now = new Date().toISOString()
    const existing = records.value.find((r) => r.url === url)

    if (existing) {
      existing.mastery = mastery
      existing.title = title
      existing.updatedAt = now
    } else {
      records.value.push({
        id: Date.now().toString(),
        url,
        title,
        mastery,
        time: now,
        updatedAt: null,
      })
    }

    writeStorage(REVIEW_KEY, records.value)
  }

  const remove = (id) => {
    records.value = records.value.filter((r) => r.id !== id)
    writeStorage(REVIEW_KEY, records.value)
  }

  const clearAll = () => {
    if (!records.value.length) return
    if (!confirm(`确定清空全部 ${records.value.length} 条复习记录吗？`)) return
    records.value = []
    writeStorage(REVIEW_KEY, records.value)
  }

  /** 导出为 Markdown（表格，按当前排序） */
  const exportRecords = () => {
    if (!records.value.length) return
    const rows = sorted.value.map(
      (r, i) =>
        `| ${i + 1} | [${r.title}](${r.url}) | ${r.mastery} | ${dayjs(r.updatedAt || r.time).format('YYYY-MM-DD HH:mm')} | ${dayjs(r.time).format('YYYY-MM-DD HH:mm')} |`,
    )
    const md = [
      '# 🔁 复习记录（掌握程度）',
      '',
      `> 导出时间：${dayjs().format('YYYY-MM-DD HH:mm')} ・ 共 ${records.value.length} 条（掌握程度 0-10）`,
      '',
      '| # | 页面 | 掌握程度 | 更新时间 | 加入时间 |',
      '| --- | --- | --- | --- | --- |',
      ...rows,
      '',
    ].join('\n')
    downloadText(`复习记录_${exportTimestamp()}.md`, md)
  }

  onMounted(() => {
    records.value = readStorage(REVIEW_KEY)
  })

  return {
    records,
    sorted,
    sortMode,
    currentPage,
    currentMastery,
    refreshPage,
    recordMastery,
    remove,
    clearAll,
    exportRecords,
  }
}
