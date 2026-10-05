import { ref, computed, onMounted } from 'vue'
import { readStorage, writeStorage, dayjs, downloadText, exportTimestamp } from '../shared/utils'
import { NOTE_KEY, NOTE_LIMIT } from '../shared/constants'
import {
  getDocIdByUrl,
  migrateRecords,
  findByDocIdOrUrl,
  findIndexByDocIdOrUrl,
} from '../shared/useDocIdMapper'

/**
 * 页面笔记：同链接唯一，支持编辑/删除
 */
export function useNote(getPage) {
  const records = ref([])
  const draft = ref('')
  const editingId = ref(null)

  const sorted = computed(() =>
    [...records.value].sort(
      (a, b) => new Date(b.updatedAt || b.time) - new Date(a.updatedAt || a.time),
    ),
  )

  /** 初始化表单：检测当前页面是否已有笔记（docId 优先，回退 URL） */
  const initForm = async () => {
    const { url } = getPage()
    const docId = await getDocIdByUrl(url)
    const existing = findByDocIdOrUrl(records.value, docId, url)
    if (existing) {
      editingId.value = existing.id
      draft.value = existing.content
    } else {
      editingId.value = null
      draft.value = ''
    }
  }

  const save = async () => {
    if (!draft.value.trim()) return
    const { url, title } = getPage()
    const docId = await getDocIdByUrl(url)

    if (editingId.value) {
      const record = records.value.find((r) => r.id === editingId.value)
      if (record) {
        record.content = draft.value.trim()
        record.updatedAt = new Date().toISOString()
        if (docId) record.docId = docId
      }
    } else {
      const existingIndex = findIndexByDocIdOrUrl(records.value, docId, url)
      if (existingIndex !== -1) {
        records.value[existingIndex].content = draft.value.trim()
        records.value[existingIndex].updatedAt = new Date().toISOString()
        if (docId) records.value[existingIndex].docId = docId
      } else {
        if (records.value.length >= NOTE_LIMIT) {
          alert(`笔记记录已达上限（${NOTE_LIMIT}条），请先删除部分记录`)
          return
        }
        records.value.push({
          id: Date.now().toString(),
          docId,
          url,
          title,
          content: draft.value.trim(),
          time: new Date().toISOString(),
          updatedAt: null,
        })
      }
    }

    writeStorage(NOTE_KEY, records.value)
    draft.value = ''
    editingId.value = null
    initForm()
  }

  const edit = (record) => {
    editingId.value = record.id
    draft.value = record.content
  }

  const remove = (id) => {
    records.value = records.value.filter((r) => r.id !== id)
    writeStorage(NOTE_KEY, records.value)
    if (editingId.value === id) {
      editingId.value = null
      draft.value = ''
      initForm()
    }
  }

  const clearAll = () => {
    if (!records.value.length) return
    if (!confirm(`确定清空全部 ${records.value.length} 条笔记吗？`)) return
    records.value = []
    writeStorage(NOTE_KEY, records.value)
    editingId.value = null
    draft.value = ''
  }

  onMounted(async () => {
    const data = readStorage(NOTE_KEY)
    // 自动迁移旧数据
    const { migrated, records: patched } = await migrateRecords(data)
    records.value = patched
    if (migrated > 0) writeStorage(NOTE_KEY, patched)
  })

  /** 导出为 Markdown（按更新时间倒序） */
  const exportRecords = () => {
    if (!records.value.length) return
    const blocks = sorted.value.map((r, i) => {
      const t = r.updatedAt || r.time
      return [
        `## ${i + 1}. ${r.title}`,
        `- 🔗 ${r.url}`,
        `- 🕐 ${r.updatedAt ? '更新' : '记录'}：${dayjs(t).format('YYYY-MM-DD HH:mm:ss')}`,
        '',
        r.content,
        '',
      ].join('\n')
    })
    const md = [
      '# 📝 页面笔记',
      '',
      `> 导出时间：${dayjs().format('YYYY-MM-DD HH:mm')} ・ 共 ${records.value.length} 条`,
      '',
      ...blocks,
    ].join('\n')
    downloadText(`页面笔记_${exportTimestamp()}.md`, md)
  }

  return {
    records,
    draft,
    editingId,
    sorted,
    initForm,
    save,
    edit,
    remove,
    clearAll,
    exportRecords,
  }
}
