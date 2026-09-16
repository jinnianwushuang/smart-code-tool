import { Card, Tag, Button, Space, Typography, Rate, Popconfirm } from 'antd'
import { theme } from 'antd'

const { Text } = Typography

/**
 * 多例模式 - 商户卡片组件
 *
 * 纯展示组件，通过 props 接收数据和操作函数
 * 每个 MerchantMainArea 实例中的卡片共享此组件
 */
export default function MerchantCard({ item, instanceIndex, onEdit, onDelete }) {
  const { token } = theme.useToken()

  return (
    <Card
      size="small"
      title={
        <Text strong ellipsis>
          商户组 {instanceIndex} : {item.name}
        </Text>
      }
      extra={
        item.status === '1' ? <Tag color="success">营业中</Tag> : <Tag color="warning">休息中</Tag>
      }
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* 商户详情 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            负责人
          </Text>
          <Text style={{ fontSize: 13 }}>{item.contactPerson}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            联系电话
          </Text>
          <Text style={{ fontSize: 13 }}>{item.phone}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            主营类目
          </Text>
          <Text style={{ fontSize: 13 }}>{item.category}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            账户余额
          </Text>
          <Text type="danger" strong style={{ fontSize: 13 }}>
            ￥{item.balance?.toLocaleString()}
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            综合评分
          </Text>
          <Space size={4}>
            <Rate disabled defaultValue={Math.round(item.rating || 0)} style={{ fontSize: 14 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.rating}
            </Text>
          </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            详细地址
          </Text>
          <Text type="secondary" style={{ fontSize: 12, maxWidth: 160 }} ellipsis>
            {item.address}
          </Text>
        </div>
      </div>

      {/* 操作按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button type="link" size="small" onClick={() => onEdit(item)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除该商户及其所有数据？"
          onConfirm={() => onDelete(item.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </div>
    </Card>
  )
}
