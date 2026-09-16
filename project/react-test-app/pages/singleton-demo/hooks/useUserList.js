import { useState, useMemo, useCallback } from 'react'
import { MOCK_USERS } from '../data/user-data'

/**
 * 单例模式 - 用户管理业务逻辑 Hook
 *
 * 对标 Vue 侧 useContextAssembler 的原子组装模式
 * 将所有状态和操作封装在一个 Hook 中，供 Context 或组件直接消费
 */
export function useUserList() {
  // ── 搜索状态 ──
  const [searchState, setSearchState] = useState({ username: '', status: '' })

  // ── 表格状态 ──
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: MOCK_USERS.length,
  })

  // ── 弹窗状态 ──
  const [modalVisible, setModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // ── 数据源（全量） ──
  const [dataSource, setDataSource] = useState(MOCK_USERS)

  // ── 过滤后的数据 ──
  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const matchName = !searchState.username || item.username.includes(searchState.username)
      const matchStatus = !searchState.status || item.status === searchState.status
      return matchName && matchStatus
    })
  }, [dataSource, searchState])

  // ── 当前页数据 ──
  const tableData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination.current, pagination.pageSize])
  // ── 搜索 ──
  const handleSearch = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [])

  // ── 重置 ──
  const handleReset = useCallback(() => {
    setSearchState({ username: '', status: '' })
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
    setDataSource((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // ── 弹窗确认 ──
  const handleModalOk = useCallback(
    (formValues) => {
      setConfirmLoading(true)
      // 模拟 API 提交
      setTimeout(() => {
        if (isEdit) {
          setDataSource((prev) =>
            prev.map((item) => (item.id === currentRecord.id ? { ...item, ...formValues } : item)),
          )
        } else {
          const newId = Math.max(...dataSource.map((d) => d.id)) + 1
          setDataSource((prev) => [
            ...prev,
            { ...formValues, id: newId, createTime: new Date().toISOString().slice(0, 10) },
          ])
        }
        setModalVisible(false)
        setConfirmLoading(false)
      }, 500)
    },
    [isEdit, currentRecord, dataSource],
  )

  // ── 分页变更 ──
  const handlePageChange = useCallback((page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }))
  }, [])

  return {
    // 搜索
    searchState,
    setSearchState,
    handleSearch,
    handleReset,
    // 表格
    tableData,
    filteredData,
    loading,
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
