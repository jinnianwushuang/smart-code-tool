import { message } from 'ant-design-vue'

// 弹窗提交
export const handleModalOk = (payload) => {
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

export const handleModalCancel = (payload) => {
  const { formRef } = payload
  formRef.value.resetFields()
}
