import { watch, onUnmounted } from 'vue'

/**
 * 持久化层 Composable — 副作用层
 * 职责：将数据同步到 localStorage，组件卸载时清理副作用
 *
 * 注意：这个 Composable 不返回任何响应式数据，
 * 它的价值在于"副作用的管理与清理"
 */
export function usePersist(listRef, options = {}) {
  const storageKey = options.key || 'composable-chain-data'

  // 启动时从 localStorage 恢复
  function restore() {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          listRef.value.splice(0, listRef.value.length, ...parsed)
        }
      }
    } catch (e) {
      console.warn('[usePersist] 恢复数据失败:', e)
    }
  }

  // 数据变化时自动持久化（防抖）
  let timer = null
  watch(
    listRef,
    (newVal) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newVal))
        } catch (e) {
          console.warn('[usePersist] 持久化失败:', e)
        }
      }, 300)
    },
    { deep: true },
  )

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimeout(timer)
  })

  return { restore }
}
