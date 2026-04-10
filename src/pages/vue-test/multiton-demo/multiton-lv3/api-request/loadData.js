// --- 获取数据 ---
export const loadData = async () => {
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    const data = []
    for (let i = 1; i <= pagination.pageSize; i++) {
      data.push({
        id: i + (pagination.current - 1) * pagination.pageSize,
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
