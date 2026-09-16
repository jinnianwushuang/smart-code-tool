import MerchantSearch from './components/MerchantSearch'
import MerchantMainArea from './components/MerchantMainArea'
import { useState } from 'react'
import { Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

/**
 * 多例模式 Demo 页面
 *
 * 架构对标 Vue 侧 multiton-lv5：
 * - Vue: 每个 MerchantMainArea 调用 useContextAssembler 创建独立状态实例
 * - React: 每个 MerchantMainArea 调用 useMerchantList Hook 拥有独立状态
 * - 搜索栏为页面级共享状态，各 MainArea 实例完全独立
 * - 关键：多个实例互不干扰，各自管理自己的数据、弹窗、分页
 */
export default function MultitonDemo() {
  // 页面级搜索状态（所有实例共享搜索条件）
  const [searchState, setSearchState] = useState({ name: '', category: '' })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          多例模式 - 商户管理
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          每个 <Text code>MerchantMainArea</Text> 组件实例通过独立调用{' '}
          <Text code>useMerchantList</Text> Hook 拥有完全独立的状态。 多个实例互不干扰，对标 Vue 的
          useContextAssembler 多例模式。
        </Paragraph>
      </div>

      {/* 共享搜索栏 */}
      <MerchantSearch
        searchState={searchState}
        onSearchChange={setSearchState}
        onSearch={() => {}}
        onReset={() => setSearchState({ name: '', category: '' })}
        onAdd={() => {}}
        total={10}
      />

      {/* 多个独立实例 - 每个拥有独立状态 */}
      <MerchantMainArea key="1" index={1} />
      <MerchantMainArea key="2" index={2} />
    </div>
  )
}
