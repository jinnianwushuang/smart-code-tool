import { ref, computed } from 'vue'

/**
 * 过滤层 Composable — 消费数据层的原始列表，输出过滤后的视图
 * 职责：搜索关键字过滤 + 状态筛选，不修改原始数据
 */
export function useFilter(listRef) {
  const keyword = ref('')
  const statusFilter = ref('all') // 'all' | 'active' | 'completed'

  const filteredList = computed(() => {
    let result = listRef.value

    // 关键字过滤
    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase()
      result = result.filter((item) => item.title.toLowerCase().includes(kw))
    }

    // 状态过滤
    if (statusFilter.value === 'active') {
      result = result.filter((item) => !item.completed)
    } else if (statusFilter.value === 'completed') {
      result = result.filter((item) => item.completed)
    }

    return result
  })

  function resetFilter() {
    keyword.value = ''
    statusFilter.value = 'all'
  }

  return { keyword, statusFilter, filteredList, resetFilter }
}
