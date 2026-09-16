import { useMerchantList } from '../hooks/useMerchantList'
import MerchantCard from './MerchantCard'
import MerchantFormModal from './MerchantFormModal'
import { Card, Input, Button, Space, Typography, Pagination, Empty } from 'antd'

const { Title, Text } = Typography

/**
 * 多例模式 - 商户主区域组件
 *
 * 核心设计：每个组件实例通过 useMerchantList Hook 拥有完全独立的状态
 * 对标 Vue 侧 MerchantMainArea 的 useContextAssembler 多例模式
 *
 * @param {number} index - 实例编号，用于区分不同实例
 */
export default function MerchantMainArea({ index }) {
  const {
    filteredList,
    loading,
    pagination,
    handlePageChange,
    modalVisible,
    setModalVisible,
    isEdit,
    currentRecord,
    confirmLoading,
    searchState,
    setSearchState,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalOk,
  } = useMerchantList(index)

  return (
    <Card style={{ marginBottom: 20 }}>
      <Title
        level={5}
        style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--ant-color-border-secondary)',
        }}
      >
        商户列表区域 {index}
      </Title>

      {/* 搜索区域 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          style={{ width: 140 }}
          value={searchState.name}
          onChange={(e) => setSearchState((s) => ({ ...s, name: e.target.value }))}
          placeholder="搜索商户"
        />
        <Button type="primary" onClick={handleSearch}>
          查询
        </Button>
        <Button onClick={handleReset}>重置</Button>
        <Button type="primary" style={{ background: '#52c41a' }} onClick={handleAdd}>
          + 新增
        </Button>
      </Space>

      {/* 卡片网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filteredList.length === 0 ? (
          <Empty description="暂无商户数据" style={{ gridColumn: '1 / -1' }} />
        ) : (
          filteredList.map((item) => (
            <MerchantCard
              key={item.id}
              item={item}
              instanceIndex={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 分页 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page) => handlePageChange(page)}
          showSizeChanger={false}
          simple
        />
      </div>

      {/* 弹窗 */}
      <MerchantFormModal
        visible={modalVisible}
        isEdit={isEdit}
        editingRecord={currentRecord}
        confirmLoading={confirmLoading}
        onClose={() => setModalVisible(false)}
        onOk={handleModalOk}
      />
    </Card>
  )
}
