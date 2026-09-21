# 组件模式参照

## React 19 组件核心约束

| 约束          | 说明                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| 仅函数组件    | 禁止 class 组件，全部使用函数组件                                        |
| Compiler 兼容 | 禁止手写 `useMemo`/`useCallback`/`forwardRef`/`defaultProps`/`propTypes` |
| ref 作为 prop | React 19 不再需要 `forwardRef`，ref 直接作为 prop 传入                   |
| Context 简写  | `<Context.Provider>` 简写为 `<Context>`                                  |

## 页面组件标准结构

```jsx
// pages/user-management/index.jsx
import { useUserManagement } from './hooks/use-user-management'
import { SearchBar } from './components/SearchBar'
import { DataTable } from './components/DataTable'
import { ActionDialog } from './components/ActionDialog'

export default function UserManagementPage() {
  const state = useUserManagement()

  return (
    <div className="page-container">
      <SearchBar
        queryForm={state.queryForm}
        onQuery={state.handleQuery}
        onReset={state.handleReset}
      />
      <DataTable
        data={state.tableData}
        loading={state.tableLoading}
        pagination={state.pagination}
        columns={state.columns}
        onTableChange={state.handleTableChange}
      />
      <ActionDialog
        visible={state.dialogVisible}
        record={state.currentRecord}
        onConfirm={state.handleDialogConfirm}
        onCancel={state.handleDialogCancel}
      />
    </div>
  )
}
```

## 自定义 Hook 标准写法

```jsx
// hooks/use-user-management.js
import { useState, useCallback } from 'react'
import { fetchUserList } from '../api/user-api'

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
}

export function useUserManagement() {
  // 状态声明
  const [tableData, setTableData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [pagination, setPagination] = useState({ ...defaultPagination })
  const [queryForm, setQueryForm] = useState({})
  const [dialogVisible, setDialogVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  // 数据获取
  const loadTableData = useCallback(
    async (params = {}) => {
      setTableLoading(true)
      try {
        const response = await fetchUserList({
          ...queryForm,
          page: pagination.current,
          pageSize: pagination.pageSize,
          ...params,
        })
        setTableData(response.data.rows)
        setPagination((prev) => ({ ...prev, total: response.data.total }))
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setTableLoading(false)
      }
    },
    [queryForm, pagination.current, pagination.pageSize],
  )

  // 事件处理
  const handleQuery = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadTableData({ page: 1 })
  }, [loadTableData])

  const handleReset = useCallback(() => {
    setQueryForm({})
    setPagination({ ...defaultPagination })
    loadTableData({ page: 1, ...{} })
  }, [loadTableData])

  const handleTableChange = useCallback(
    (newPagination) => {
      setPagination(newPagination)
      loadTableData({ page: newPagination.current, pageSize: newPagination.pageSize })
    },
    [loadTableData],
  )

  const handleDialogConfirm = useCallback(
    async (formData) => {
      // 保存逻辑
      setDialogVisible(false)
      loadTableData()
    },
    [loadTableData],
  )

  const handleDialogCancel = useCallback(() => {
    setDialogVisible(false)
    setCurrentRecord(null)
  }, [])

  // 初始加载
  useMountEffect(() => {
    loadTableData()
  })

  return {
    tableData,
    tableLoading,
    pagination,
    queryForm,
    dialogVisible,
    currentRecord,
    handleQuery,
    handleReset,
    handleTableChange,
    handleDialogConfirm,
    handleDialogCancel,
  }
}
```

## 子组件标准写法

```jsx
// components/SearchBar.jsx
export function SearchBar({ queryForm, onQuery, onReset }) {
  return (
    <div className="search-bar">
      <input
        value={queryForm.keyword || ''}
        onChange={(e) => (queryForm.keyword = e.target.value)}
        placeholder="关键字搜索"
      />
      <button onClick={onQuery}>查询</button>
      <button onClick={onReset}>重置</button>
    </div>
  )
}
```

## 组件通信模式

```
页面组件（useXxx Hook 管理状态）
  ├── 子组件 A（接收 props：数据 + 回调函数）
  ├── 子组件 B（接收 props：数据 + 回调函数）
  └── 子组件 C（通过 Context 获取跨层级状态）
```

### 属性流（父 → 子）

```
useUserManagement() → state object → <SearchBar queryForm={} onQuery={} />
                                     → <DataTable data={} loading={} />
                                     → <ActionDialog visible={} onConfirm={} />
```

### 事件流（子 → 父）

```
用户点击查询 → onQuery() → handleQuery() → loadTableData() → setState → UI 重渲染
```

## 组件拆分原则

| 原则         | 说明                                          |
| ------------ | --------------------------------------------- |
| 单一职责     | 每个组件/Hook 只做一件事                      |
| 状态就近     | 状态放在最近需要它的层级                      |
| 提升有度     | 共享状态提升到公共父级，不过度提升            |
| 组合优于继承 | 通过 children / render props / slots 模式组合 |

## 关键约束

- 组件文件使用 `PascalCase.jsx` 命名（如 `SearchBar.jsx`）
- Hook 文件使用 `kebab-case.js` 命名（如 `use-user-management.js`）
- 禁止在组件内部定义子组件（会导致每次渲染重建）
- 禁止使用 class 组件
- 禁止手写 `useMemo`/`useCallback`（React Compiler 自动处理）
- 禁止使用 `forwardRef`，ref 直接作为 prop
- 单个组件文件不超过 200 行（不含 Hook），超过则拆分
