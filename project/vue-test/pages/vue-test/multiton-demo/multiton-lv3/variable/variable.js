import { ref, reactive, onMounted } from 'vue'
export const create_multiton_variable = (payload) => {
  const { pageSize = 10 } = payload

  // --- 数据定义 ---
  const loading = ref(false)
  const merchantList = ref([])
  const searchState = ref({ name: '', category: undefined })
  const pagination = ref({ current: 1, pageSize, total: 40 })
  // --- 弹窗逻辑 ---
  const modalVisible = ref(false)
  const confirmLoading = ref(false)
  const isEdit = ref(false)
  const formState = ref({
    id: null,
    name: '',
    category: undefined,
    contactPerson: '',
    phone: '',
    address: '',
    status: '1',
  })

  return {
    loading,
    merchantList,
    searchState,
    pagination,
    modalVisible,
    confirmLoading,
    isEdit,
    formState,
  }
}
