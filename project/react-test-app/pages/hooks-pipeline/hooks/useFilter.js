import { useState, useMemo } from 'react'

/**
 * Hook 组合管线 - 过滤 Hook
 *
 * 纯过滤层 Hook：根据关键词和状态过滤列表
 * 对标 Vue 的 computed filter
 *
 * 设计原则：接收原始数据 + 过滤条件 → 返回过滤结果
 * 与 useList 完全解耦，可独立测试和复用
 */
export function useFilter(items, filterText = '', filterStatus = 'all') {
  const [localText, setLocalText] = useState(filterText)
  const [localStatus, setLocalStatus] = useState(filterStatus)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // 文本过滤
      const matchText = !localText || item.text.toLowerCase().includes(localText.toLowerCase())
      // 状态过滤
      const matchStatus =
        localStatus === 'all' ||
        (localStatus === 'active' && !item.completed) ||
        (localStatus === 'completed' && item.completed)
      return matchText && matchStatus
    })
  }, [items, localText, localStatus])

  return {
    filtered,
    filterText: localText,
    setFilterText: setLocalText,
    filterStatus: localStatus,
    setFilterStatus: setLocalStatus,
  }
}
