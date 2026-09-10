import { message } from 'ant-design-vue'

// 弹窗提交
export const handleModalOk = (payload) => {
  const { formRef, confirmLoading, isEdit, modalVisible } = payload
  formRef.value
    .validate()
    .then(async () => {
      confirmLoading.value = true
      try {
        // 模拟提交 API
        console.log('提交表单:', formState)
        setTimeout(() => {
          message.success(isEdit.value ? '修改成功' : '新增成功')
          confirmLoading.value = false
          modalVisible.value = false
          loadData(payload)
        }, 800)
      } catch (error) {
        confirmLoading.value = false
      }
    })
    .catch((info) => {
      console.log('校验失败:', info)
    })
}

export const handleModalCancel = (payload) => {
  const { formRef } = payload
  formRef.value.resetFields()
}
