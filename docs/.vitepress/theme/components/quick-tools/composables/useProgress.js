import { ref, onMounted } from 'vue'
import { dayjs, downloadText, exportTimestamp } from '../shared/utils'
import { PROGRESS_LIMIT } from '../shared/constants'
import { getDocIdByUrl, migrateRecords } from '../shared/useDocIdMapper'
import { readQt, writeQt, KEY_PROGRESS } from '../shared/useQtStorage'

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
    await writeQt(KEY_PROGRESS, records.value)
  }

  const remove = async (index) => {
    records.value.splice(index, 1)
    await writeQt(KEY_PROGRESS, records.value)
  }

  const clearAll = async () => {
    if (!records.value.length) return
    if (!confirm(`确定清空全部 ${records.value.length} 条进度记录吗？`)) return
    records.value = []
    await writeQt(KEY_PROGRESS, records.value)
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
    // 从 IDB 加载（自动迁移 localStorage 旧数据）
    const data = await readQt(KEY_PROGRESS)
    // 自动迁移：规范化 URL + 补全 docId
    const { migrated, records: patched } = await migrateRecords(data)
    records.value = patched
    if (migrated > 0) await writeQt(KEY_PROGRESS, patched)
  })

  return { records, add, remove, clearAll, exportRecords }
}
