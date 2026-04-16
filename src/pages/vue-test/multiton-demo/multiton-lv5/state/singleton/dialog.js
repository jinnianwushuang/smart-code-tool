import { ref, reactive, onMounted, computed } from 'vue'
// --- 弹窗逻辑 ---
export const modalVisible = ref(false)
export const confirmLoading = ref(false)
export const isEdit = ref(false)
export const formRef = ref(null)

export const init_singleton = () => {
  modalVisible.value = false
  confirmLoading.value = false
  formRef.value = null
  isEdit.value = false
}
