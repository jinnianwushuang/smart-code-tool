import { createContext, useContext, useState } from 'react'
import { theme } from 'antd'

/**
 * 复合组件模式 - Tabs 组件
 *
 * React 最经典的组件设计模式，对标 Ant Design 的 Tabs / Vue 的 a-tabs
 * 核心：父子组件通过 Context 隐式通信，使用者只需组合 JSX 无需手动传参
 *
 * 用法：
 *   <Tabs defaultActiveKey="1">
 *     <Tabs.TabList>
 *       <Tabs.Tab tabKey="1" label="标签一" />
 *       <Tabs.Tab tabKey="2" label="标签二" />
 *     </Tabs.TabList>
 *     <Tabs.TabPanel tabKey="1">内容一</Tabs.TabPanel>
 *     <Tabs.TabPanel tabKey="2">内容二</Tabs.TabPanel>
 *   </Tabs>
 */
const TabsContext = createContext(null)

function Tabs({ defaultActiveKey, children, onChange }) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || '')
  const { token } = theme.useToken()

  const handleSelect = (key) => {
    setActiveKey(key)
    onChange?.(key)
  }

  return (
    <TabsContext.Provider value={{ activeKey, onSelect: handleSelect }}>
      <div
        style={{
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabList({ children }) {
  const { token } = theme.useToken()
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
      }}
    >
      {children}
    </div>
  )
}

function Tab({ tabKey, label }) {
  const { activeKey, onSelect } = useContext(TabsContext)
  const { token } = theme.useToken()
  const isActive = activeKey === tabKey

  return (
    <button
      style={{
        padding: '10px 20px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 14,
        color: isActive ? token.colorPrimary : token.colorTextSecondary,
        borderBottom: `2px solid ${isActive ? token.colorPrimary : 'transparent'}`,
        transition: 'all 0.2s',
        fontWeight: isActive ? 500 : 400,
      }}
      onClick={() => onSelect(tabKey)}
    >
      {label}
    </button>
  )
}

function TabPanel({ tabKey, children }) {
  const { activeKey } = useContext(TabsContext)
  if (activeKey !== tabKey) return null
  return <div style={{ padding: 20 }}>{children}</div>
}

// 复合导出：Tabs.TabList / Tabs.Tab / Tabs.TabPanel
Tabs.TabList = TabList
Tabs.Tab = Tab
Tabs.TabPanel = TabPanel

export default Tabs
