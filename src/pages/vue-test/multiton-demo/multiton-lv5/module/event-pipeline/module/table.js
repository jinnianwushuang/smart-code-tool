import { message } from 'ant-design-vue'
import { loadData } from '../../../api-request/loadData.js'

// 表格分页/排序改变
export const handleTableChange = (payload, pag) => {
  const { pagination } = payload
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData(payload)
}

// 删除操作
export const handleDelete = (payload, id) => {
  // console.error(payload, '123')
  message.success(`已成功移除商户 ID: ${id}`)
  loadData(payload)
}
// 打开编辑弹窗
export const handleEdit = (payload, item) => {
  const { isEdit, modalVisible, formState } = payload
  console.error(item, '/multiton-lv5/multiton-lv5/multiton-lv5/multiton-lv4', formState)
  isEdit.value = true
  Object.assign(formState, { ...item })
  modalVisible.value = true
}
