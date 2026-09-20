import { Typography, Card, Tag, Divider, Alert } from 'antd'
import CodeBlock from 'project/components/CodeBlock'

const { Title, Paragraph, Text } = Typography

const codeStore = `// stores/app-store.js
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useAppStore = create(
  immer((set) => ({
    // 低频数据：配置
    config: { theme: 'dark', language: 'zh-CN' },
    // 高频数据：实时指标
    realtime: { cpu: 0, memory: 0 },

    updateConfig: (partial) =>
      set((state) => { Object.assign(state.config, partial) }),

    updateCpu: (value) =>
      set((state) => { state.realtime.cpu = value }),
  }))
)`

const codeSelector = `// 组件中精确订阅
function ThemeToggle() {
  // ✅ 只订阅 config.theme → 只有 theme 变了才重渲染
  const theme = useAppStore((s) => s.config.theme)
  return <button>{theme}</button>
}

function CpuGauge() {
  // ✅ 只订阅 realtime.cpu → config 变化完全不影响
  const cpu = useAppStore((s) => s.realtime.cpu)
  return <span>{cpu}%</span>
}

// ❌ 错误：selector 返回整个对象（每次新引用 → 每次都重渲染）
function Bad() {
  const config = useAppStore((s) => s.config) // 任何 set 都触发
}`

export default function ZustandPattern() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>外部 Store + 精确订阅 + 不可变更新</Title>
      <Paragraph type="secondary">
        zustand + selector + Immer —— React 19 管理大型深层对象的高性能范式
      </Paragraph>

      <Alert
        message="一句话理解"
        description="zustand 把状态放在 React 组件树之外，selector 让每个组件只订阅自己关心的字段，Immer 让不可变更新像直接修改一样简单。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="解决什么问题" size="small" style={{ marginBottom: 16 }}>
        <Paragraph style={{ margin: 0 }}>
          React 的 Context 是"全量广播"——Provider 的值变了，<Text strong>所有</Text> Consumer
          都重渲染， 即使某个 Consumer
          只用了值的一个字段。当全局状态是大型深层对象（仪表盘配置、实时数据面板）时，
          高频更新会导致大量不必要的 Re-render。zustand 通过 selector 实现了
          <Text strong>"谁变更新谁"</Text>的精确控制。
        </Paragraph>
      </Card>

      <Card title="三件套各自职责" size="small" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text strong>zustand</Text>：外部 Store 容器，脱离 React 渲染树。 状态变更不经过 React
            调度，由 zustand 自己通知订阅者
          </li>
          <li>
            <Text strong>selector</Text>：选择性订阅机制。 组件通过{' '}
            <Text code>useStore(s =&gt; s.field)</Text> 声明"我只关心这个字段"，
            只有该字段变了才触发重渲染
          </li>
          <li>
            <Text strong>Immer</Text>：不可变更新的语法糖。 在 <Text code>set()</Text>{' '}
            中直接"修改"草稿对象，Immer 自动产生不可变更新
          </li>
        </ul>
      </Card>

      <Title level={5}>Store 定义</Title>
      <CodeBlock>{codeStore}</CodeBlock>

      <Title level={5}>组件中精确订阅</Title>
      <CodeBlock>{codeSelector}</CodeBlock>

      <Divider />

      <Card title="与 Vue 的对应关系" size="small" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Tag color="blue">zustand store</Tag> ≈ Vue 的 <Tag color="green">shallowRef</Tag>
            —— 都是独立于组件/渲染树的状态容器
          </li>
          <li>
            <Tag color="blue">selector</Tag> ≈ Vue 的<Tag color="green">依赖追踪 + computed</Tag>
            —— 都实现精确的"谁变更新谁"
          </li>
          <li>
            <Tag color="blue">Immer set()</Tag> ≈ Vue 的
            <Tag color="green">.value = {'{ ...old }'}</Tag>
            —— 都是不可变更新
          </li>
        </ul>
      </Card>

      <Card title="关键性能陷阱" size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            selector 返回新对象引用 → 每次都重渲染（搭配 <Text code>shallow</Text> 比较解决）
          </li>
          <li>selector 中执行昂贵计算 → 每次 store 变化都执行（改用 useMemo 包装）</li>
          <li>高频数据不节流直接写入 → 每秒 30 次重渲染（先 throttle 再 set）</li>
        </ul>
      </Card>
    </div>
  )
}
