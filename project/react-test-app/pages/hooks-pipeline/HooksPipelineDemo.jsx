import { useState, useRef } from 'react'
import { useList, useLocalStorage, useStats } from './hooks/useTodoCore'
import { useFilter } from './hooks/useFilter'
import {
  Card,
  Input,
  Button,
  Checkbox,
  Tag,
  Space,
  Typography,
  Empty,
  Statistic,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, DeleteOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

/**
 * Hook 组合管线 Demo - Todo 待办管理
 *
 * 核心展示：多个 Hook 按职责分层组合，形成数据管线
 *
 * 管线架构：
 *   useList（数据层）→ useFilter（过滤层）→ useStats（计算层）
 *                          ↓
 *                    useLocalStorage（持久化层）
 *
 * 对标 Vue 的装配器模式：
 *   Vue: all_atoms_assembler() 组装 state + computed + event_pipeline
 *   React: 多个 Hook 组合组装出完整的业务逻辑
 */
export default function HooksPipelineDemo() {
  const inputRef = useRef(null)

  // ── 第 1 层：数据管理 ──
  const { items, addItem, removeItem, toggleItem, clearCompleted } = useList([
    { id: 1, text: '学习 React 自定义 Hook', completed: true, createdAt: '' },
    { id: 2, text: '理解 Hook 组合管线模式', completed: false, createdAt: '' },
    { id: 3, text: '对比 Vue 装配器 vs React Hook 组合', completed: false, createdAt: '' },
    { id: 4, text: '实现完整的 Todo 应用', completed: false, createdAt: '' },
  ])

  // ── 第 2 层：过滤逻辑 ──
  const { filtered, filterText, setFilterText, filterStatus, setFilterStatus } = useFilter(items)

  // ── 第 3 层：统计计算 ──
  const { total, completed, pending, completionRate } = useStats(items)

  // ── 第 4 层：持久化（副作用） ──
  useLocalStorage('react-todo-demo', items)

  // ── 新增处理 ──
  const handleAdd = () => {
    const text = inputRef.current?.input?.value?.trim()
    if (!text) return
    addItem({ text, completed: false })
    if (inputRef.current) inputRef.current.input.value = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Hook 组合管线 - Hook Composition Pipeline
        </Title>
        <Paragraph type="secondary">
          多个 Hook 按职责分层组合，形成数据管线。对标 Vue 的装配器模式， 但采用 React
          的"分层调用、逐层消费"哲学。
        </Paragraph>
      </div>

      {/* 管线可视化 */}
      <Card type="inner" style={{ marginBottom: 20 }}>
        <Space size="middle" wrap>
          <Tag color="blue">useList · 数据层</Tag>
          <Text type="secondary">→</Text>
          <Tag color="purple">useFilter · 过滤层</Tag>
          <Text type="secondary">→</Text>
          <Tag color="cyan">useStats · 计算层</Tag>
          <Text type="secondary">+</Text>
          <Tag color="orange">useLocalStorage · 持久化</Tag>
        </Space>
      </Card>

      {/* 统计面板 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card type="inner">
            <Statistic title="总计" value={total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card type="inner">
            <Statistic title="已完成" value={completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card type="inner">
            <Statistic title="待完成" value={pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card type="inner">
            <Statistic
              title="完成率"
              value={completionRate}
              suffix="%"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 输入区域 */}
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          ref={inputRef}
          placeholder="输入新的待办事项..."
          onPressEnter={handleKeyDown}
          size="large"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          添加
        </Button>
      </Space.Compact>

      {/* 过滤栏 */}
      <Card type="inner" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ width: 180 }}
            allowClear
          />
          <Space.Compact>
            {['all', 'active', 'completed'].map((status) => (
              <Button
                key={status}
                type={filterStatus === status ? 'primary' : 'default'}
                onClick={() => setFilterStatus(status)}
              >
                {{ all: '全部', active: '进行中', completed: '已完成' }[status]}
              </Button>
            ))}
          </Space.Compact>
          {completed > 0 && (
            <Button icon={<ClearOutlined />} onClick={clearCompleted} danger>
              清除已完成
            </Button>
          )}
        </Space>
      </Card>

      {/* 列表 */}
      <Card styles={{ body: { padding: 0 } }}>
        {filtered.length === 0 ? (
          <Empty description="暂无匹配事项" style={{ padding: 32 }} />
        ) : (
          filtered.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom:
                  index < filtered.length - 1
                    ? '1px solid var(--ant-color-border-secondary)'
                    : 'none',
              }}
            >
              <Checkbox checked={item.completed} onChange={() => toggleItem(item.id)}>
                <Text delete={item.completed} type={item.completed ? 'secondary' : undefined}>
                  {item.text}
                </Text>
              </Checkbox>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removeItem(item.id)}
                danger
              />
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
