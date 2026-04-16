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
