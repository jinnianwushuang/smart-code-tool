import { ref, onMounted, computed } from 'vue'

export const create_variable = (payload) => {
  const { pageSize = 10 } = payload
  // --- 状态变量 ---
  const loading = ref(false)
  const tableData = ref([])
  const searchState = ref({
    username: '',
    status: undefined,
  })

  // 分页配置
  const pagination = ref({
    current: 1,
    pageSize,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条数据`,
  })

  // --- 弹窗与表单逻辑 ---
  const modalVisible = ref(false)
  const confirmLoading = ref(false)
  const formRef = ref(null)
  const isEdit = ref(false)
  const modalTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

  const formState = ref({
    id: undefined,
    username: '',
    email: '',
    status: '1',
  })

  return {
    loading,
    tableData,
    searchState,
    pagination,
    modalVisible,
    confirmLoading,
    formRef,
    isEdit,
    modalTitle,
    formState,
  }
}
