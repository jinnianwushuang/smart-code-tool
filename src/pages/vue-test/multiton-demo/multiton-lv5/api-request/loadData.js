// --- 获取数据 ---
export const loadData = async (payload) => {
  const { merchantList, loading, pagination, searchState } = payload

  // 模拟 API 调用
  console.error('正在查询参数:', {
    ...searchState,
    page: pagination.value.current,
    size: pagination.value.pageSize,
  })
  // console.error(merchantList, 'merchantList', pagination.value.pageSize)
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    const data = []
    for (let i = 1; i <= pagination.value.pageSize; i++) {
      data.push({
        id: i + (pagination.value.current - 1) * pagination.value.pageSize,
        name: `阳光${['果蔬', '海鲜', '火锅', '便利店'][i % 4]}旗舰店`,
        category: ['餐饮', '零售', '娱乐'][i % 3],
        contactPerson: '张经理',
        phone: '138-0000-0000',
        balance: (Math.random() * 10000).toFixed(2),
        rating: Math.floor(Math.random() * 3) + 3,
        status: Math.random() > 0.2 ? '1' : '0',
        address: '某某市高新区技术软件园 A 座 10' + i + '号',
      })
    }
    merchantList.value = data

    loading.value = false
  }, 600)
}
