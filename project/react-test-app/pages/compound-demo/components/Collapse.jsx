import { createContext, useContext, useState } from 'react'
import { theme } from 'antd'

/**
 * 复合组件模式 - Collapse 折叠面板
 *
 * 展示另一种复合组件变体：手风琴模式（同时只展开一个）
 * 与 Tabs 对比：同样的 Context 通信机制，不同的交互语义
 */
const CollapseContext = createContext(null)

function Collapse({ defaultExpandedKeys = [], children, accordion = false }) {
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys)
  const { token } = theme.useToken()

  const toggle = (key) => {
    setExpandedKeys((prev) => {
      if (accordion) {
        return prev.includes(key) ? [] : [key]
      }
      return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    })
  }

  return (
    <CollapseContext.Provider value={{ expandedKeys, toggle }}>
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
    </CollapseContext.Provider>
  )
}

function CollapseItem({ itemKey, title, children }) {
  const { expandedKeys, toggle } = useContext(CollapseContext)
  const { token } = theme.useToken()
  const isExpanded = expandedKeys.includes(itemKey)

  return (
    <div style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          cursor: 'pointer',
          fontSize: 14,
          color: token.colorText,
          transition: 'background 0.2s',
          userSelect: 'none',
          background: isExpanded ? token.colorFillQuaternary : 'transparent',
        }}
        onClick={() => toggle(itemKey)}
      >
        <span
          style={{
            fontSize: 10,
            color: token.colorTextQuaternary,
            transition: 'transform 0.2s',
            display: 'inline-block',
            transform: isExpanded ? 'rotate(90deg)' : 'none',
          }}
        >
          ▶
        </span>
        <span style={{ fontWeight: 500 }}>{title}</span>
      </div>
      {isExpanded && (
        <div
          style={{
            padding: '12px 16px 16px 36px',
            fontSize: 14,
            color: token.colorTextSecondary,
            lineHeight: 1.7,
            background: token.colorFillQuaternary,
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

Collapse.CollapseItem = CollapseItem

export default Collapse
