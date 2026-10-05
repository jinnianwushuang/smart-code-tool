import { ref, onMounted } from 'vue'
import { readStorage, writeStorage, dayjs, downloadText, exportTimestamp } from '../shared/utils'
import { PROGRESS_KEY, PROGRESS_LIMIT } from '../shared/constants'
import { getDocIdByUrl, migrateRecords } from '../shared/useDocIdMapper'

/**
 * 记忆进度：记录当前页面 URL + 标题 + 时间
 */
export function useProgress(getPage) {
  const records = ref([])

  const add = async () => {
    const { url, title } = getPage()
    const docId = await getDocIdByUrl(url)
    records.value.unshift({ docId, url, title, time: new Date().toISOString() })
    if (records.value.length > PROGRESS_LIMIT) {
      records.value = records.value.slice(0, PROGRESS_LIMIT)
    }
    writeStorage(PROGRESS_KEY, records.value)
  }

  const remove = (index) => {
    records.value.splice(index, 1)
    writeStorage(PROGRESS_KEY, records.value)
  }

  const clearAll = () => {
    if (!records.value.length) return
    if (!confirm(`确定清空全部 ${records.value.length} 条进度记录吗？`)) return
    records.value = []
    writeStorage(PROGRESS_KEY, records.value)
  }

  /** 导出为 Markdown（表格） */
  const exportRecords = () => {
    if (!records.value.length) return
    const rows = records.value.map(
      (r, i) =>
        `| ${i + 1} | [${r.title}](${r.url}) | ${dayjs(r.time).format('YYYY-MM-DD HH:mm:ss')} |`,
    )
    const md = [
      '# 📖 学习进度记录',
      '',
      `> 导出时间：${dayjs().format('YYYY-MM-DD HH:mm')} ・ 共 ${records.value.length} 条`,
      '',
      '| # | 页面 | 记录时间 |',
      '| --- | --- | --- |',
      ...rows,
      '',
    ].join('\n')
    downloadText(`学习进度_${exportTimestamp()}.md`, md)
  }

  onMounted(async () => {
    const data = readStorage(PROGRESS_KEY)
    // 自动迁移旧数据：为无 docId 的记录补上 docId
    const { migrated, records: patched } = await migrateRecords(data)
    records.value = patched
    if (migrated > 0) writeStorage(PROGRESS_KEY, patched)
  })

  return { records, add, remove, clearAll, exportRecords }
}
