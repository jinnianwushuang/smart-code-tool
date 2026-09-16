import { ref, computed, onMounted } from 'vue'
import { readStorage, writeStorage } from './utils'
import { DOUBT_KEY, DOUBT_LIMIT } from './constants'

/**
 * 记忆疑惑：同链接唯一，支持编辑/已解决/删除
 */
export function useDoubt(getPage) {
  const records = ref([])
  const draft = ref('')
  const editingId = ref(null)

  const unresolvedCount = computed(() => records.value.filter((r) => !r.resolved).length)

  const sorted = computed(() =>
    [...records.value].sort((a, b) => new Date(b.time) - new Date(a.time)),
  )

  /** 初始化表单：检测当前页面是否已有疑惑 */
  const initForm = () => {
    const { url, title } = getPage()
    const existing = records.value.find((r) => r.url === url)
    if (existing) {
      editingId.value = existing.id
      draft.value = existing.doubt
    } else {
      editingId.value = null
      draft.value = ''
    }
    return { url, title }
  }

  const save = () => {
    if (!draft.value.trim()) return
    const { url, title } = getPage()

    if (editingId.value) {
      const record = records.value.find((r) => r.id === editingId.value)
      if (record) {
        record.doubt = draft.value.trim()
        record.title = title
        record.url = url
      }
    } else {
      const existingIndex = records.value.findIndex((r) => r.url === url)
      if (existingIndex !== -1) {
        records.value[existingIndex].doubt = draft.value.trim()
        records.value[existingIndex].title = title
      } else {
        if (records.value.length >= DOUBT_LIMIT) {
          alert(`疑惑记录已达上限（${DOUBT_LIMIT}条），请先删除部分记录`)
          return
        }
        records.value.push({
          id: Date.now().toString(),
          url,
          title,
          time: new Date().toISOString(),
          doubt: draft.value.trim(),
          resolved: false,
          resolvedTime: null,
        })
      }
    }

    writeStorage(DOUBT_KEY, records.value)
    draft.value = ''
    editingId.value = null
    initForm()
  }

  const edit = (record) => {
    editingId.value = record.id
    draft.value = record.doubt
  }

  const resolve = (record) => {
    record.resolved = true
    record.resolvedTime = new Date().toISOString()
    writeStorage(DOUBT_KEY, records.value)
  }

  const remove = (id) => {
    records.value = records.value.filter((r) => r.id !== id)
    writeStorage(DOUBT_KEY, records.value)
    if (editingId.value === id) {
      editingId.value = null
      draft.value = ''
      initForm()
    }
  }

  const clearResolved = () => {
    records.value = records.value.filter((r) => !r.resolved)
    writeStorage(DOUBT_KEY, records.value)
  }

  onMounted(() => {
    records.value = readStorage(DOUBT_KEY)
  })

  return {
    records,
    draft,
    editingId,
    unresolvedCount,
    sorted,
    initForm,
    save,
    edit,
    resolve,
    remove,
    clearResolved,
  }
}
