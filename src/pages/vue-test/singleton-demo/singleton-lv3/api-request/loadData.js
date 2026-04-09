import { message } from 'ant-design-vue'
// --- 数据加载 ---
export const loadData = async (payload) => {
  const { loading, tableData, searchState, pagination } = payload
  loading.value = true
  try {
    // 模拟 API 调用
    console.log('正在查询参数:', {
      ...searchState,
      page: pagination.value.current,
      size: pagination.value.pageSize,
    })

    // 模拟延迟和假数据
    setTimeout(() => {
      const mockList = []
      for (let i = 1; i <= pagination.value.pageSize; i++) {
        const id = (pagination.value.current - 1) * pagination.value.pageSize + i
        mockList.push({
          id,
          username: `用户_${id}`,
          email: `user${id}@example.com`,
          status: Math.random() > 0.3 ? '1' : '0',
          createTime: '2023-10-01 12:00:00',
        })
      }
      tableData.value = mockList
      pagination.value.total = 100 // 模拟总数
      loading.value = false
    }, 500)
  } catch (err) {
    console.error('----err----', err)
    message.error('加载数据失败')
    loading.value = false
  }
}
