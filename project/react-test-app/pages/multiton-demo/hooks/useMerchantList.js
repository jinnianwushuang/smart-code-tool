import { useState, useMemo, useCallback } from 'react'
import { MOCK_MERCHANTS } from '../data/merchant-data'

/**
 * 多例模式 - 商户列表业务逻辑 Hook
 *
 * 每次调用创建独立的状态实例，对标 Vue 侧 multiton 的 useContextAssembler 多例模式
 * 每个 MerchantMainArea 组件实例调用此 Hook 拥有完全独立的状态
 *
 * @param {number} instanceIndex - 实例编号（用于区分不同实例）
 */
export function useMerchantList(instanceIndex = 0) {
  // ── 搜索状态 ──
  const [searchState, setSearchState] = useState({ name: '', category: '' })

  // ── 列表状态 ──
  const [loading, setLoading] = useState(false)
  const [merchantList, setMerchantList] = useState(() => {
    // 每个实例获取不同的数据子集，模拟不同业务场景
    const offset = instanceIndex * 3
    return MOCK_MERCHANTS.slice(offset, offset + 5)
  })

  // ── 分页状态 ──
  const [pagination, setPagination] = useState({ current: 1, pageSize: 4, total: 5 })

  // ── 弹窗状态 ──
  const [modalVisible, setModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // ── 过滤 ──
  const filteredList = useMemo(() => {
    return merchantList.filter((item) => {
      const matchName = !searchState.name || item.name.includes(searchState.name)
      const matchCategory = !searchState.category || item.category === searchState.category
      return matchName && matchCategory
    })
  }, [merchantList, searchState])

  // ── 搜索 ──
  const handleSearch = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [])

  // ── 重置 ──
  const handleReset = useCallback(() => {
    setSearchState({ name: '', category: '' })
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [])

  // ── 新增 ──
  const handleAdd = useCallback(() => {
    setIsEdit(false)
    setCurrentRecord(null)
    setModalVisible(true)
  }, [])

  // ── 编辑 ──
  const handleEdit = useCallback((record) => {
    setIsEdit(true)
    setCurrentRecord(record)
    setModalVisible(true)
  }, [])

  // ── 删除 ──
  const handleDelete = useCallback((id) => {
    setMerchantList((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // ── 弹窗确认 ──
  const handleModalOk = useCallback(
    (formValues) => {
      setConfirmLoading(true)
      setTimeout(() => {
        if (isEdit) {
          setMerchantList((prev) =>
            prev.map((item) => (item.id === currentRecord.id ? { ...item, ...formValues } : item)),
          )
        } else {
          const newId = Date.now()
          setMerchantList((prev) => [...prev, { ...formValues, id: newId, balance: 0, rating: 0 }])
        }
        setModalVisible(false)
        setConfirmLoading(false)
      }, 500)
    },
    [isEdit, currentRecord],
  )

  // ── 分页变更 ──
  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, current: page }))
  }, [])

  return {
    // 搜索
    searchState,
    setSearchState,
    handleSearch,
    handleReset,
    // 列表
    filteredList,
    loading,
    // 分页
    pagination,
    handlePageChange,
    // 弹窗
    modalVisible,
    setModalVisible,
    isEdit,
    currentRecord,
    confirmLoading,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalOk,
  }
}
