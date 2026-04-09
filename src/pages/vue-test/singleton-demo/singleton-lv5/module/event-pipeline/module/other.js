import { loadData } from '../../../api-request/loadData.js'

// 搜索与重置
export const onSearch = (payload) => {
  const { pagination } = payload
  pagination.value.current = 1
  loadData(payload)
}
export const onReset = (payload) => {
  const { searchState } = payload
  searchState.value.username = ''
  searchState.value.status = undefined
  onSearch(payload)
}
// 打开新增弹窗
export const handleAdd = (payload) => {
  const { isEdit, modalVisible } = payload
  isEdit.value = false
  Object.assign(formState, { id: undefined, username: '', email: '', status: '1' })
  modalVisible.value = true
}
