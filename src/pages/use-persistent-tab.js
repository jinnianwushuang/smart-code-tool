import { ref, watch } from 'vue'

const STORAGE_PREFIX = 'tool_tab_'

/**
 * 持久化 tab 选中状态
 * - 刷新页面后恢复上次选中的 tab
 * - 若存储的 tab 不在当前列表中，回退到默认 tab
 * @param {Array} tabs - 可用的 tab 列表 [{ name, label, component }]
 * @param {string} defaultTab - 默认 tab name
 * @param {string} storageKey - 本地存储的区分 key
 */
export function usePersistentTab(tabs, defaultTab, storageKey) {
  const fullKey = STORAGE_PREFIX + storageKey

  // 从 localStorage 读取并校验
  const stored = localStorage.getItem(fullKey)
  const isValid = stored && tabs.some((t) => t.name === stored)
  const current_tab_name = ref(isValid ? stored : defaultTab)

  // 监听变化，持久化到 localStorage
  watch(current_tab_name, (val) => {
    localStorage.setItem(fullKey, val)
  })

  return current_tab_name
}
