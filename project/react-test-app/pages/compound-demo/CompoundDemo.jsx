import Tabs from './components/Tabs'
import Collapse from './components/Collapse'
import { Card, Typography, Space } from 'antd'

const { Title, Paragraph, Text } = Typography

/**
 * 复合组件模式 Demo
 *
 * React 最优雅的组件设计模式：
 * - 父组件通过 Context 隐式向子组件传递状态
 * - 使用者只需组合 JSX，无需手动传参
 * - 对标：Ant Design Tabs / Element Plus Tabs / HTML <select>+<option>
 *
 * 与 Vue 对比：
 * - Vue: 具名插槽 <template #tab> + provide/inject
 * - React: 复合组件 <Tabs.Tab> + Context（更自然的 JSX 组合）
 */
export default function CompoundDemo() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          复合组件模式 - Compound Component
        </Title>
        <Paragraph type="secondary">
          父子组件通过 Context 隐式通信，使用者只需组合 JSX 无需手动传参。 对标 Ant Design 的
          Tabs、Collapse 等经典组件设计。
        </Paragraph>
      </div>

      {/* 示例 1: Tabs */}
      <Card style={{ marginBottom: 28 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          示例 1：Tabs 标签页
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          通过 <Text code>{'<Tabs.Tab tabKey="1" label="标签" />'}</Text> 声明式注册标签， TabPanel
          自动匹配 activeKey 显示/隐藏。
        </Paragraph>
        <Tabs defaultActiveKey="info" onChange={(key) => console.log('Tab changed:', key)}>
          <Tabs.TabList>
            <Tabs.Tab tabKey="info" label="基本信息" />
            <Tabs.Tab tabKey="detail" label="详细信息" />
            <Tabs.Tab tabKey="config" label="配置项" />
          </Tabs.TabList>
          <Tabs.TabPanel tabKey="info">
            <div style={{ lineHeight: 1.8 }}>
              <Title level={5}>基本信息</Title>
              <Paragraph>
                复合组件的核心思想：父组件提供上下文（Context），子组件消费上下文，使用者只需组合
                JSX。
              </Paragraph>
              <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
                <li>
                  <Text code>Tabs</Text> — 提供 activeKey 状态和 onSelect 方法
                </li>
                <li>
                  <Text code>Tabs.Tab</Text> — 消费 Context 渲染标签按钮
                </li>
                <li>
                  <Text code>Tabs.TabPanel</Text> — 消费 Context 条件渲染面板
                </li>
              </ul>
            </div>
          </Tabs.TabPanel>
          <Tabs.TabPanel tabKey="detail">
            <div style={{ lineHeight: 1.8 }}>
              <Title level={5}>详细信息</Title>
              <Paragraph>
                这种模式的优点：组件间通信对使用者透明，API 极其简洁。对比 Vue 的具名插槽方案，React
                的复合组件更加灵活，因为 Tab 和 TabPanel 之间不需要通过 slot name 关联。
              </Paragraph>
            </div>
          </Tabs.TabPanel>
          <Tabs.TabPanel tabKey="config">
            <div style={{ lineHeight: 1.8 }}>
              <Title level={5}>配置项</Title>
              <Paragraph>
                这里是配置面板的内容。复合组件模式在 React 生态中无处不在：Form + FormItem、Select +
                Option、Menu + MenuItem 等。
              </Paragraph>
            </div>
          </Tabs.TabPanel>
        </Tabs>
      </Card>

      {/* 示例 2: Collapse */}
      <Card style={{ marginBottom: 28 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          示例 2：Collapse 折叠面板（手风琴模式）
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          同一模式的不同语义变体。<Text code>accordion</Text> 属性控制是否同时只展开一个。
        </Paragraph>
        <Collapse defaultExpandedKeys={['react']} accordion>
          <Collapse.CollapseItem itemKey="react" title="React 的核心设计理念">
            React 的核心理念是「UI = f(state)」。组件是函数的映射，状态变化驱动 UI 更新。 与 Vue
            的响应式系统不同，React 采用单向数据流 + 不可变数据的哲学。
          </Collapse.CollapseItem>
          <Collapse.CollapseItem itemKey="hooks" title="Hooks 的设计哲学">
            Hooks 解决了三个核心问题：逻辑复用（自定义 Hook）、副作用管理（useEffect）、
            状态局部化（useState）。它让函数组件获得了类组件的全部能力，同时保持函数的简洁。
          </Collapse.CollapseItem>
          <Collapse.CollapseItem itemKey="context" title="Context 的定位与边界">
            Context 不是万能的状态管理方案。它适合低频更新的全局数据（主题、语言、用户信息），
            不适合高频更新的数据（表单输入、动画状态）。高频场景应使用 props 或状态管理库。
          </Collapse.CollapseItem>
        </Collapse>
      </Card>

      {/* 架构说明 */}
      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>
          模式要点
        </Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Card type="inner" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🧩</div>
            <Title level={5}>声明式组合</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              通过 JSX 嵌套关系声明组件结构，而非命令式 API 调用
            </Paragraph>
          </Card>
          <Card type="inner" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔗</div>
            <Title level={5}>隐式通信</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              父子组件通过 Context 通信，中间无需手动传递 props
            </Paragraph>
          </Card>
          <Card type="inner" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
            <Title level={5}>复合导出</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Tabs.Tab / Tabs.TabPanel 命名空间模式，API 自文档化
            </Paragraph>
          </Card>
        </div>
      </Card>
    </div>
  )
}
