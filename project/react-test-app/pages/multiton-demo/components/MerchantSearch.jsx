import { CATEGORY_OPTIONS } from '../data/merchant-data'
import { Input, Select, Button, Space, Card, Typography } from 'antd'

const { Text } = Typography

/**
 * 多例模式 - 共享搜索组件
 *
 * 纯受控组件，通过 props 接收状态和操作函数
 * 可被多个实例复用，对标 Vue 侧 merchant-search
 */
export default function MerchantSearch({
  searchState,
  onSearchChange,
  onSearch,
  onReset,
  onAdd,
  total,
}) {
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Space>
            <span>商户名称</span>
            <Input
              style={{ width: 160 }}
              value={searchState.name}
              onChange={(e) => onSearchChange({ ...searchState, name: e.target.value })}
              placeholder="请输入商户名"
            />
          </Space>
          <Space>
            <span>行业类型</span>
            <Select
              style={{ width: 140 }}
              value={searchState.category}
              onChange={(value) => onSearchChange({ ...searchState, category: value })}
              options={[{ value: '', label: '全部' }, ...CATEGORY_OPTIONS]}
            />
          </Space>
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
          <Button onClick={onReset}>重置</Button>
        </Space>
      </Card>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button type="primary" size="large" onClick={onAdd}>
          + 入驻新商户
        </Button>
        <Text type="secondary">当前共 {total} 家商户</Text>
      </div>
    </div>
  )
}
