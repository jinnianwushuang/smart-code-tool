import { ref } from 'vue'

// --- 数据定义 ---

export const searchState = ref({ name: '', category: undefined })

export const init_singleton = () => {
  searchState.value = { name: '', category: undefined }
}
