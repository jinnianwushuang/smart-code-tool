import { Link } from 'react-router-dom'
import { Card, Table, Tag, Typography, Descriptions } from 'antd'

const { Title, Text, Paragraph } = Typography

/**
 * React 架构验证 - 首页（5 种范式总览）
 */

const PATTERNS = [
  {
    key: 'singleton',
    path: '/react-test/singleton',
    icon: '1',
    color: '#1677ff',
    bgColor: '#e6f4ff',
    title: '单例模式',
    subtitle: 'Singleton — Context 共享',
    problem: '多个组件需要共享同一份状态（如用户列表），且全局只有一份数据',
    solution: 'Context + 自定义 Hook。Hook 封装全部业务逻辑，Context 将状态注入组件树',
    vueMapping: 'provide / inject + useContextAssembler',
    tags: ['Context', '共享状态', '表格+弹窗'],
    when: '全局唯一的状态（用户信息、购物车、配置）',
  },
  {
    key: 'multiton',
    path: '/react-test/multiton',
    icon: 'N',
    color: '#389e0d',
    bgColor: '#f6ffed',
    title: '多例模式',
    subtitle: 'Multiton — 独立实例',
    problem: '同一组件需要渲染多个实例，每个实例拥有完全独立的状态',
    solution: '每个组件实例独立调用 Hook，利用闭包隔离状态。多个实例互不干扰',
    vueMapping: '每个组件调用 useContextAssembler 创建独立实例',
    tags: ['独立闭包', 'Hook 多实例', '卡片网格'],
    when: '同一 UI 模式重复出现但数据独立（多个面板、多个列表）',
  },
  {
    key: 'compound',
    path: '/react-test/compound',
    icon: 'C',
    color: '#fa8c16',
    bgColor: '#fff7e6',
    title: '复合组件模式',
    subtitle: 'Compound Component — JSX 组合',
    problem: '需要设计灵活的组件 API，使用者能自由组合子组件而不必手动传参',
    solution: '父组件通过 Context 提供状态，子组件通过 Context 消费状态。使用者只需写 JSX 嵌套',
    vueMapping: '具名插槽 + provide/inject（React 用 JSX 组合更自然）',
    tags: ['Context 通信', '声明式 API', 'Tabs/Collapse'],
    when: '设计通用 UI 组件库（Tabs、Menu、Form、Select 等）',
  },
  {
    key: 'hooks',
    path: '/react-test/hooks-pipeline',
    icon: 'H',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    title: 'Hook 组合管线',
    subtitle: 'Hook Pipeline — 分层组合',
    problem: '复杂业务逻辑需要拆分为多个关注点（数据、过滤、计算、持久化），如何组织',
    solution: '每个 Hook 负责单一职责，按数据流方向分层组合：数据层 → 过滤层 → 计算层 → 副作用层',
    vueMapping: '装配器 all_atoms_assembler() 的 React 版本',
    tags: ['单一职责', '分层管线', '可独立测试'],
    when: '复杂页面逻辑需要清晰的分层架构',
  },
  {
    key: 'controlled',
    path: '/react-test/controlled',
    icon: 'U',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    title: '受控 vs 非受控',
    subtitle: 'Controlled / Uncontrolled — 表单范式',
    problem: 'React 表单如何处理用户输入？每次按键都要触发重渲染吗？',
    solution: '受控：state 驱动 value，实时验证/联动；非受控：DOM 自行管理，ref 读取最终值',
    vueMapping: 'v-model 是受控的语法糖；Vue 很少需要非受控模式',
    tags: ['表单处理', '性能取舍', 'React 独有'],
    when: '表单场景：需要实时验证选受控，大表单性能敏感选非受控',
  },
]

const TABLE_COLUMNS = [
  { title: '范式', dataIndex: 'name', key: 'name', render: (text) => <strong>{text}</strong> },
  { title: '核心机制', dataIndex: 'mechanism', key: 'mechanism' },
  { title: '状态归属', dataIndex: 'scope', key: 'scope' },
  { title: '组件间关系', dataIndex: 'relation', key: 'relation' },
  { title: 'Vue 对标', dataIndex: 'vue', key: 'vue' },
]

const TABLE_DATA = [
  {
    key: '1',
    name: '单例',
    mechanism: 'Context + Hook',
    scope: '全局唯一（Provider 级别）',
    relation: '共享同一份状态',
    vue: 'provide/inject',
  },
  {
    key: '2',
    name: '多例',
    mechanism: '独立 Hook 调用',
    scope: '每个实例独立',
    relation: '互不干扰',
    vue: '每个组件调装配器',
  },
  {
    key: '3',
    name: '复合组件',
    mechanism: 'Context + JSX 组合',
    scope: '父组件持有',
    relation: '声明式嵌套组合',
    vue: '具名插槽',
  },
  {
    key: '4',
    name: 'Hook 管线',
    mechanism: '多 Hook 分层组合',
    scope: '各 Hook 各管各的',
    relation: '数据流管线',
    vue: '装配器 assembler',
  },
  {
    key: '5',
    name: '受控/非受控',
    mechanism: 'state vs ref',
    scope: 'React state 或 DOM',
    relation: '表单与渲染解耦',
    vue: 'v-model（受控语法糖）',
  },
]

export default function ReactTestHome() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* 标题区 */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          React 架构验证 — 5 种核心范式
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 15, lineHeight: 1.7 }}>
          每种范式解决不同的架构问题。从状态管理到组件设计到表单处理，覆盖 React
          开发中最常见的架构决策。
        </Paragraph>
      </div>

      {/* 5 种范式卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 18,
          marginBottom: 32,
        }}
      >
        {PATTERNS.map((p) => (
          <Link key={p.key} to={p.path} style={{ textDecoration: 'none' }}>
            <Card hoverable styles={{ body: { padding: 22 } }} style={{ height: '100%' }}>
              {/* 标题行 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: p.bgColor,
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {p.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {p.subtitle}
                  </Text>
                </div>
              </div>

              {/* 详情 */}
              <Descriptions column={1} size="small" labelStyle={{ width: 70, color: '#999' }}>
                <Descriptions.Item label="解决什么">{p.problem}</Descriptions.Item>
                <Descriptions.Item label="React 方案">{p.solution}</Descriptions.Item>
                <Descriptions.Item label="Vue 对应">
                  <Text type="secondary">{p.vueMapping}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="何时使用">
                  <Text type="success">{p.when}</Text>
                </Descriptions.Item>
              </Descriptions>

              {/* 标签 */}
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.tags.map((tag) => (
                  <Tag key={tag} color={p.color} style={{ marginRight: 0 }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 核心区别总览表 */}
      <Card>
        <Title level={5} style={{ marginBottom: 4 }}>
          5 种范式的核心区别
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          前两种（单例/多例）解决"状态放在哪里"的问题，后三种（复合组件/Hook管线/受控非受控）解决"如何组织代码"的问题。
        </Paragraph>
        <Table
          columns={TABLE_COLUMNS}
          dataSource={TABLE_DATA}
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  )
}
