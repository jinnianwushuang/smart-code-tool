import { Typography, Card, Tag, Divider, Alert } from 'antd'
import CodeBlock from 'project/components/CodeBlock'

const { Title, Paragraph, Text } = Typography

const codeTransition = `// 搜索场景：用户输入是紧急更新，搜索结果是非紧急更新
import { useTransition, useState } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')           // 紧急：输入框立即响应
  const [results, setResults] = useState([])        // 非紧急：搜索结果可以延迟
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    const value = e.target.value
    setQuery(value)  // 紧急更新：输入框立即显示

    // 非紧急更新：标记为低优先级，不阻塞输入
    startTransition(() => {
      setResults(filterExpensiveSearch(value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}   {/* 低优先级更新正在进行 */}
      <ResultList results={results} />
    </div>
  )
}`

const codeDeferred = `// 实时仪表盘：高频数据用 useDeferredValue 降优先级
import { useDeferredValue, useMemo } from 'react'

function Dashboard({ realtimeData }) {
  // 延迟版本：当高优先级更新到来时，先处理高优先级
  const deferredData = useDeferredValue(realtimeData)

  // 重计算只在 deferredData 变化时执行
  const chartData = useMemo(
    () => expensiveTransform(deferredData),
    [deferredData]
  )

  return <Chart data={chartData} />
}`

export default function ConcurrentRendering() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>并发渲染与优先级调度</Title>
      <Paragraph type="secondary">
        useTransition + useDeferredValue + startTransition —— React 19 独有的渲染优先级控制
      </Paragraph>

      <Alert
        message="一句话理解"
        description="告诉 React 哪些更新是紧急的（用户输入），哪些可以延迟（搜索结果、图表重算），让 UI 始终响应用户操作。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="解决什么问题" size="small" style={{ marginBottom: 16 }}>
        <Paragraph style={{ margin: 0 }}>
          当用户输入触发大量计算（搜索过滤、图表重算）时，如果所有更新都是同一优先级，
          计算会阻塞输入框的响应 —— 用户感觉"打字卡顿"。 React 19 的并发特性允许开发者
          <Text strong>标记更新优先级</Text>， 让 React
          在渲染过程中可以"中断低优先级、先处理高优先级"。
        </Paragraph>
      </Card>

      <Card title="三个核心 API" size="small" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>
              <Text code>useTransition()</Text>
            </Text>
            ：返回 <Text code>[isPending, startTransition]</Text>。
            将一段状态更新标记为"非紧急"，React 可以在渲染中途暂停它去处理更紧急的更新
          </li>
          <li>
            <Text strong>
              <Text code>useDeferredValue(value)</Text>
            </Text>
            ：返回一个"延迟版本"的值。当新值到来时，React 先渲染旧值（保持 UI 响应），
            然后在后台重新渲染新值
          </li>
          <li>
            <Text strong>
              <Text code>startTransition(fn)</Text>
            </Text>
            ：<Text code>useTransition</Text> 的独立版本，
            可以在任何地方（不仅是组件内）标记低优先级更新
          </li>
        </ul>
      </Card>

      <Title level={5}>useTransition：搜索场景</Title>
      <CodeBlock>{codeTransition}</CodeBlock>

      <Title level={5}>useDeferredValue：实时仪表盘</Title>
      <CodeBlock>{codeDeferred}</CodeBlock>

      <Divider />

      <Card title="与 Vue 的对比" size="small">
        <Paragraph style={{ margin: 0 }}>
          Vue 没有这个概念 —— 因为 Vue 的响应式系统天然就是"精确更新"，
          输入框绑定和列表渲染是不同的依赖追踪，互不阻塞。 React
          需要这个机制是因为它的渲染模型是"函数重执行"， 一次 setState
          会重跑整个组件函数，必须通过优先级调度来避免阻塞。
          <br />
          <br />
          <Text strong>本质差异</Text>：Vue 靠"精确追踪"避免不必要的渲染， React
          靠"优先级调度"在必要时也能先处理紧急任务。 两种框架从不同角度解决了同一个问题：保持 UI
          响应性。
        </Paragraph>
      </Card>
    </div>
  )
}
