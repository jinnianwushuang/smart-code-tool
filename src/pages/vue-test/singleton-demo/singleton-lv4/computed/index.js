import { ref, reactive, onMounted, computed } from 'vue'

export const create_computed_variable = (payload) => {
  const modalTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

  return {
    modalTitle,
  }
}
