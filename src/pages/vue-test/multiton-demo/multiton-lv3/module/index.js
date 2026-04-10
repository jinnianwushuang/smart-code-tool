// --- 搜索逻辑 ---
const onSearch = () => {
  pagination.current = 1
  loadData()
}
const onReset = () => {
  searchState.name = ''
  searchState.category = undefined
  onSearch()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formState, {
    id: null,
    name: '',
    category: undefined,
    contactPerson: '',
    phone: '',
    address: '',
    status: '1',
  })
  modalVisible.value = true
}

const handleEdit = (item) => {
  isEdit.value = true
  Object.assign(formState, { ...item })
  modalVisible.value = true
}
const handleModalOk = (values) => {
  confirmLoading.value = true
  // 这里通常是调用 API 提交 values
  setTimeout(() => {
    message.success(isEdit.value ? '信息更新成功' : '商户入驻成功')
    modalVisible.value = false
    confirmLoading.value = false
    loadData()
  }, 800)
}

const handleDelete = (id) => {
  message.success(`已成功移除商户 ID: ${id}`)
  loadData()
}
