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
  const { pagination } = payload
  console.log('删除ID:', id)
  message.success('删除成功')
  loadData(payload)
}
// 打开编辑弹窗
export const handleEdit = (payload, record) => {
  const { isEdit, current_editing_record, modalVisible } = payload
  isEdit.value = true
  // 使用浅拷贝将行数据存入表单
  current_editing_record.value = record
  modalVisible.value = true
}
