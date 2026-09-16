import { useUserContext } from '../context/UserContext'
import { TABLE_COLUMNS } from '../data/user-data'
import { Table, Tag, Button, Popconfirm, Space, Typography } from 'antd'

const { Text } = Typography

/**
 * 单例模式 - 表格组件
 *
 * 通过 Context 消费表格数据和操作管道
 */
export default function UserTable() {
  const {
    tableData,
    filteredData,
    loading,
    pagination,
    handlePageChange,
    handleEdit,
    handleDelete,
  } = useUserContext()

  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (_, record) =>
          record.status === '1' ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
      }
    }
    if (col.key === 'action') {
      return {
        ...col,
        render: (_, record) => (
          <Space>
            <a onClick={() => handleEdit(record)}>编辑</a>
            <Popconfirm
              title="确定要删除该用户吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </Space>
        ),
      }
    }
    return col
  })

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: filteredData.length,
        showTotal: (total) => `共 ${total} 条`,
        onChange: (page, pageSize) => handlePageChange(page, pageSize),
      }}
      size="middle"
    />
  )
}
