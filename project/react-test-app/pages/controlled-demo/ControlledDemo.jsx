import { useState, useRef } from 'react'
import { Card, Input, Button, Select, Typography, Table, Tag, Space, Alert } from 'antd'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

/**
 * 受控 vs 非受控 Demo
 *
 * React 独有的表单处理范式，Vue 没有直接对应概念
 * （Vue 的 v-model 本质是受控模式的语法糖）
 *
 * 受控组件：React state 是"唯一数据源"，每次按键都触发 setState
 * 非受控组件：DOM 自身管理值，通过 ref 在需要时读取
 */
export default function ControlledDemo() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          受控 vs 非受控 - Controlled / Uncontrolled
        </Title>
        <Paragraph type="secondary">
          React 独有的表单处理范式。受控组件以 state 为唯一数据源，非受控组件让 DOM 自行管理值。 Vue
          的 v-model 本质是受控模式的语法糖，因此 Vue 开发者通常不需要理解这对概念。
        </Paragraph>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <ControlledForm />
        <UncontrolledForm />
      </div>

      {/* 对比总结 */}
      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>
          选择指南
        </Title>
        <Table
          columns={[
            {
              title: '维度',
              dataIndex: 'dimension',
              key: 'dimension',
              render: (t) => <strong>{t}</strong>,
            },
            { title: '受控组件', dataIndex: 'controlled', key: 'controlled' },
            { title: '非受控组件', dataIndex: 'uncontrolled', key: 'uncontrolled' },
          ]}
          dataSource={[
            {
              key: '1',
              dimension: '数据源',
              controlled: 'React state（单一数据源）',
              uncontrolled: 'DOM 自身（ref 读取）',
            },
            {
              key: '2',
              dimension: '每次按键',
              controlled: '触发 setState → 重渲染',
              uncontrolled: '不触发渲染',
            },
            {
              key: '3',
              dimension: '实时验证',
              controlled: <Text type="success">天然支持</Text>,
              uncontrolled: <Text type="warning">需手动监听 onChange</Text>,
            },
            {
              key: '4',
              dimension: '字段联动',
              controlled: <Text type="success">直接通过 state 计算</Text>,
              uncontrolled: <Text type="warning">需手动同步</Text>,
            },
            {
              key: '5',
              dimension: '大表单性能',
              controlled: <Text type="warning">每次按键重渲染整个表单</Text>,
              uncontrolled: <Text type="success">无重渲染开销</Text>,
            },
            {
              key: '6',
              dimension: 'Vue 对应',
              controlled: 'v-model（语法糖）',
              uncontrolled: 'ref 直接读取 DOM 值',
            },
            {
              key: '7',
              dimension: '推荐场景',
              controlled: '需要实时验证/联动/格式化',
              uncontrolled: '只需最终提交值/集成第三方库',
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

/**
 * 受控表单 - 每个字段由 React state 管理
 */
function ControlledForm() {
  const [form, setForm] = useState({ username: '', email: '', role: 'developer', bio: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleUsernameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      username: value,
      email: value && !prev.email.includes('@') ? `${value}@example.com` : prev.email,
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = '用户名不能为空'
    if (!form.email.includes('@')) errs.email = '请输入有效邮箱'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSubmitted({ ...form, time: new Date().toLocaleTimeString() })
  }

  return (
    <Card
      title={
        <Space>
          <Text strong>受控组件</Text>
          <Tag color="blue">state 驱动</Tag>
        </Space>
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        每个输入框的 value 绑定到 state，每次按键触发 setState 并重渲染。 支持实时验证和字段联动。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            用户名
          </Text>
          <Input
            value={form.username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="输入后观察邮箱自动联动"
            status={errors.username ? 'error' : undefined}
          />
          {errors.username && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {errors.username}
            </Text>
          )}
          {form.username && !errors.username && (
            <Text type="success" style={{ fontSize: 12, display: 'block' }}>
              已输入 {form.username.length} 字符
            </Text>
          )}
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            邮箱（自动联动）
          </Text>
          <Input
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="自动填充用户名前缀"
            status={errors.email ? 'error' : undefined}
          />
          {errors.email && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {errors.email}
            </Text>
          )}
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            角色
          </Text>
          <Select
            value={form.role}
            onChange={(value) => updateField('role', value)}
            style={{ width: '100%' }}
            options={[
              { value: 'developer', label: '开发者' },
              { value: 'designer', label: '设计师' },
              { value: 'pm', label: '产品经理' },
            ]}
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            简介
          </Text>
          <TextArea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={2}
            placeholder="受控的 textarea"
          />
        </div>

        <Button type="primary" block onClick={handleSubmit}>
          提交（受控）
        </Button>

        {submitted && (
          <Alert
            type="success"
            showIcon
            message={
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(submitted, null, 2)}
              </pre>
            }
          />
        )}
      </Space>
    </Card>
  )
}

/**
 * 非受控表单 - DOM 自行管理值，提交时通过 ref 读取
 */
function UncontrolledForm() {
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const roleRef = useRef(null)
  const bioRef = useRef(null)
  const [submitted, setSubmitted] = useState(null)

  const handleSubmit = () => {
    const values = {
      username: nameRef.current?.input?.value || '',
      email: emailRef.current?.input?.value || '',
      role: roleRef.current?.input?.value || 'developer',
      bio: bioRef.current?.resizableTextArea?.textArea?.value || '',
      time: new Date().toLocaleTimeString(),
    }

    if (!values.username.trim()) {
      nameRef.current?.focus()
      return
    }
    if (!values.email.includes('@')) {
      emailRef.current?.focus()
      return
    }

    setSubmitted(values)
  }

  return (
    <Card
      title={
        <Space>
          <Text strong>非受控组件</Text>
          <Tag color="orange">DOM 驱动</Tag>
        </Space>
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        输入框自行管理值（defaultValue），React 不参与每次按键。 提交时通过 ref
        一次性读取所有值，零重渲染。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            用户名
          </Text>
          <Input ref={nameRef} defaultValue="" placeholder="输入时不触发渲染" />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            邮箱
          </Text>
          <Input ref={emailRef} defaultValue="" placeholder="输入时不触发渲染" />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            角色
          </Text>
          <Select
            ref={roleRef}
            defaultValue="developer"
            style={{ width: '100%' }}
            options={[
              { value: 'developer', label: '开发者' },
              { value: 'designer', label: '设计师' },
              { value: 'pm', label: '产品经理' },
            ]}
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 5 }}>
            简介
          </Text>
          <TextArea ref={bioRef} defaultValue="" rows={2} placeholder="非受控的 textarea" />
        </div>

        <Button type="primary" block onClick={handleSubmit}>
          提交（非受控）
        </Button>

        {submitted && (
          <Alert
            type="success"
            showIcon
            message={
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(submitted, null, 2)}
              </pre>
            }
          />
        )}
      </Space>
    </Card>
  )
}
