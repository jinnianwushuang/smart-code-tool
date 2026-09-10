import { loadData } from '../../../api-request/loadData.js'

export const handleEdit = (payload, item) => {
  const { isEdit, modalVisible, current_record_to_dialog_data } = payload
  isEdit.value = true
  current_record_to_dialog_data.value = item

  modalVisible.value = true
}
export const handleDelete = (payload, id) => {
  message.success(`已成功移除商户 ID: ${id}`)
  loadData(payload)
}
