import { ref, reactive, onMounted, computed } from 'vue'
export const loading = ref(false)
export const tableData = ref([])

// 分页配置
export const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条数据`,
})

export const current_editing_record = ref({
  id: undefined,
  username: '',
  email: '',
  status: '1',
})

export const init_singleton = () => {
  loading.value = false
  tableData.value = []
  pagination.value = {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条数据`,
  }

  current_editing_record.value = {
    id: undefined,
    username: '',
    email: '',
    status: '1',
  }
}
