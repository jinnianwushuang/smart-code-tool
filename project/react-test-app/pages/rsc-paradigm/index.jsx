import { Typography, Card, Tag, Divider, Alert } from 'antd'
import { CodeOutlined, CloudServerOutlined, DesktopOutlined } from '@ant-design/icons'
import CodeBlock from 'project/components/CodeBlock'

const { Title, Paragraph, Text } = Typography

const codeServerComponent = `// app/components/ProductList.tsx
// 默认就是 Server Component —— 在服务器上执行，零 JS 发送到客户端
import { db } from '@/lib/db'

export default async function ProductList() {
  // 直接在组件中访问数据库（服务端 API）
  const products = await db.product.findMany()

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          {p.name} — ¥{p.price}
          {/* 需要交互的部分 → 标记为 Client Component */}
          <AddToCartButton productId={p.id} />
        </li>
      ))}
    </ul>
  )
}`

const codeClientComponent = `// app/components/AddToCartButton.tsx
'use client'  // ← 显式标记为 Client Component

import { useState } from 'react'

export function AddToCartButton({ productId }) {
  const [count, setCount] = useState(0)
  // 可以使用 useState、useEffect、事件绑定等
  return (
    <button onClick={() => setCount(c => c + 1)}>
      加入购物车 ({count})
    </button>
  )
}`

export default function RscParadigm() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>Server / Client 边界划分</Title>
      <Paragraph type="secondary">
        React 19 最核心的架构变革 —— 组件不再都运行在浏览器中，而是分为服务端组件和客户端组件
      </Paragraph>

      <Alert
        message="一句话理解"
        description="Server Component = 在服务器上执行、不发送 JS 到客户端的组件；Client Component = 传统意义上的 React 组件。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="解决什么问题" size="small" style={{ marginBottom: 16 }}>
        <Paragraph style={{ margin: 0 }}>
          传统 React 应用的所有组件都在浏览器中执行 ——
          即使某些组件只是展示静态数据（如从数据库读取商品列表）。 这意味着：大量 JS
          代码需要下载到客户端 → 解析 → 执行 → 才能看到页面内容。
          <Text strong>RSC 让"只读展示"回归服务端</Text>
          ，零 JS 发送，首屏速度大幅提升。
        </Paragraph>
      </Card>

      <Card title="核心规则" size="small" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>默认即服务端</Text>：所有组件默认是 Server Component，无需特殊标记
          </li>
          <li>
            <Text code>'use client'</Text>：需要交互（useState、事件绑定）时，在文件顶部显式标记
          </li>
          <li>
            <Tag color="green">Server</Tag> 可以导入 <Tag color="blue">Client</Tag> 组件（作为
            children 传入）
          </li>
          <li>
            <Tag color="blue">Client</Tag> <Text strong>不能</Text>导入{' '}
            <Tag color="green">Server</Tag> 组件（服务端代码无法在浏览器运行）
          </li>
          <li>Server Component 中不能使用 useState、useEffect、事件绑定等客户端 API</li>
        </ul>
      </Card>

      <Title level={5}>
        <CloudServerOutlined /> Server Component 示例
      </Title>
      <CodeBlock>{codeServerComponent}</CodeBlock>

      <Title level={5}>
        <DesktopOutlined /> Client Component 示例
      </Title>
      <CodeBlock>{codeClientComponent}</CodeBlock>

      <Divider />

      <Card title="边界划分决策" size="small" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            需要 useState / useEffect / useReducer → <Tag color="blue">Client</Tag>
          </li>
          <li>
            需要 onClick / onChange 等事件处理 → <Tag color="blue">Client</Tag>
          </li>
          <li>
            需要浏览器 API（localStorage、window）→ <Tag color="blue">Client</Tag>
          </li>
          <li>
            只是展示数据、直接访问后端 → <Tag color="green">Server</Tag>
          </li>
          <li>
            数据获取 + 展示（无交互）→ <Tag color="green">Server</Tag>
          </li>
        </ul>
      </Card>

      <Card title="与 Vue 的对比" size="small">
        <Paragraph style={{ margin: 0 }}>
          Vue 的 SSR（Nuxt）是"整个页面在服务端渲染为 HTML 字符串"，客户端仍需下载完整 Vue
          运行时进行"激活（Hydration）"。 React 19 的 RSC 更精细：<Text strong>按组件粒度</Text>
          决定在服务端还是客户端执行， 纯展示组件完全不发送 JS，只有交互组件才需要客户端 JS。
          这是架构层面的范式差异，不仅仅是渲染策略的不同。
        </Paragraph>
      </Card>
    </div>
  )
}
