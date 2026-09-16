import { ref, computed } from 'vue'

/**
 * 数据层 Composable — 纯 CRUD 操作
 * 职责：管理列表数据的增删改查，不涉及任何过滤/统计/持久化逻辑
 */
export function useList(initialData = []) {
  const list = ref([...initialData])

  function addItem(item) {
    list.value.push({ ...item, id: Date.now(), createdAt: new Date().toISOString() })
  }

  function removeItem(id) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) list.value.splice(index, 1)
  }

  function updateItem(id, updates) {
    const target = list.value.find((item) => item.id === id)
    if (target) Object.assign(target, updates)
  }

  function toggleItem(id, field) {
    const target = list.value.find((item) => item.id === id)
    if (target) target[field] = !target[field]
  }

  function clearAll() {
    list.value.splice(0, list.value.length)
  }

  return { list, addItem, removeItem, updateItem, toggleItem, clearAll }
}
