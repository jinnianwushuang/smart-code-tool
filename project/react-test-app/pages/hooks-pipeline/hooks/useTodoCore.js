import { useState, useEffect, useCallback } from 'react'

/**
 * Hook 组合管线 - 列表管理 Hook
 *
 * 纯数据层 Hook：管理列表的增删改，不涉及任何 UI
 * 对标 Vue 的 reactive + 操作函数
 *
 * 设计原则：只暴露最小必要接口，内部状态完全封装
 */
export function useList(initialItems = []) {
  const [items, setItems] = useState(initialItems)

  const addItem = useCallback((item) => {
    setItems((prev) => [...prev, { ...item, id: Date.now(), createdAt: new Date().toISOString() }])
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.completed))
  }, [])

  return { items, addItem, removeItem, toggleItem, clearCompleted }
}

/**
 * Hook 组合管线 - 本地持久化 Hook
 *
 * 纯副作用层 Hook：将数据同步到 localStorage
 * 对标 Vue 的 watch + localStorage
 *
 * 设计原则：无返回值，纯副作用，数据变化自动同步
 */
export function useLocalStorage(key, data) {
  // 初始化时从 localStorage 读取
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored && !initialized) {
        // 注意：这里只是演示，实际应通过回调通知上层
        console.log(`[useLocalStorage] 从 ${key} 恢复数据`)
      }
    } catch {
      // localStorage 不可用时静默失败
    }
    setInitialized(true)
  }, [key, initialized])

  // 数据变化时自动持久化
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // 静默失败
    }
  }, [key, data, initialized])

  return { initialized }
}

/**
 * Hook 组合管线 - 统计 Hook
 *
 * 纯计算层 Hook：从原始数据派生统计信息
 * 对标 Vue 的 computed
 *
 * 设计原则：纯函数式，输入数据 → 输出统计，无副作用
 */
export function useStats(items) {
  const total = items.length
  const completed = items.filter((i) => i.completed).length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, pending, completionRate }
}
