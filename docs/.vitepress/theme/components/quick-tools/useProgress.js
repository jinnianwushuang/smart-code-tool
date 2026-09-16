import { ref, onMounted } from 'vue'
import { readStorage, writeStorage } from './utils'
import { PROGRESS_KEY, PROGRESS_LIMIT } from './constants'

/**
 * 记忆进度：记录当前页面 URL + 标题 + 时间
 */
export function useProgress(getPage) {
  const records = ref([])

  const add = () => {
    const { url, title } = getPage()
    records.value.unshift({ url, title, time: new Date().toISOString() })
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
    records.value = []
    writeStorage(PROGRESS_KEY, records.value)
  }

  onMounted(() => {
    records.value = readStorage(PROGRESS_KEY)
  })

  return { records, add, remove, clearAll }
}
