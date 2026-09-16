import { computed } from 'vue'

/**
 * 计算层 Composable — 消费过滤后的列表，输出统计数据
 * 职责：纯计算，不产生副作用，类似 React 的 useMemo 链
 */
export function useStats(listRef, filteredListRef) {
  const total = computed(() => listRef.value.length)
  const completed = computed(() => listRef.value.filter((item) => item.completed).length)
  const active = computed(() => total.value - completed.value)
  const completionRate = computed(() => {
    if (total.value === 0) return 0
    return Math.round((completed.value / total.value) * 100)
  })
  const filteredCount = computed(() => filteredListRef.value.length)

  return { total, completed, active, completionRate, filteredCount }
}
