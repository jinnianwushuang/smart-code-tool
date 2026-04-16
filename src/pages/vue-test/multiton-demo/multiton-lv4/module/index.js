import { loadData } from '../api-request/loadData.js'
import { message } from 'ant-design-vue'

// --- 搜索逻辑 ---
export const onSearch = (payload) => {
  const { pagination } = payload
  pagination.value.current = 1
  loadData(payload)
}
export const onReset = (payload) => {
  const { searchState } = payload
  searchState.name = ''
  searchState.category = undefined
  onSearch(payload)
}

export const handleAdd = (payload) => {
  const { isEdit, modalVisible, formState } = payload
  isEdit.value = false
  Object.assign(formState, {
    id: null,
    name: '',
    category: undefined,
    contactPerson: '',
    phone: '',
    address: '',
    status: '1',
  })
  modalVisible.value = true
}

export const handleEdit = (payload, item) => {
  const { isEdit, modalVisible, formState } = payload
  isEdit.value = true
  Object.assign(formState, { ...item })
  modalVisible.value = true
}
export const handleModalOk = (payload, values) => {
  const { isEdit, modalVisible, confirmLoading } = payload
  confirmLoading.value = true
  // 这里通常是调用 API 提交 values
  setTimeout(() => {
    message.success(isEdit.value ? '信息更新成功' : '商户入驻成功')
    modalVisible.value = false
    confirmLoading.value = false
    loadData(payload)
  }, 800)
}

export const handleDelete = (payload, id) => {
  message.success(`已成功移除商户 ID: ${id}`)
  loadData(payload)
}
