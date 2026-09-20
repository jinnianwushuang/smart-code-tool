import { theme } from 'antd'

/**
 * 主题感知的代码块组件
 *
 * 通过 antd `theme.useToken()` 自动跟随亮/暗主题切换，
 * 替代硬编码 `background: '#f6f8fa'` 的写法，避免暗色下代码块保持亮色。
 *
 * 用法：
 *   <CodeBlock>{codeString}</CodeBlock>
 *   <CodeBlock style={{ marginBottom: 24 }}>{codeString}</CodeBlock>
 */
export default function CodeBlock({ children, style }) {
  const { token } = theme.useToken()

  return (
    <pre
      style={{
        background: token.colorFillQuaternary,
        color: token.colorText,
        padding: 16,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        fontSize: 13,
        lineHeight: 1.7,
        overflow: 'auto',
        margin: '0 0 16px',
        fontFamily: token.fontFamilyCode,
        ...style,
      }}
    >
      <code>{children}</code>
    </pre>
  )
}
