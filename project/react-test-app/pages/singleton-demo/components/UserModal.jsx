import { useState, useEffect } from 'react'
import { useUserContext } from '../context/UserContext'
import { STATUS_OPTIONS } from '../data/user-data'
import { Modal, Form, Input, Select, Radio, Space } from 'antd'

/**
 * 单例模式 - 弹窗组件
 *
 * 通过 Context 消费弹窗状态和表单数据
 */
export default function UserModal() {
  const { modalVisible, setModalVisible, isEdit, currentRecord, confirmLoading, handleModalOk } =
    useUserContext()

  const [form] = Form.useForm()

  // 弹窗打开时初始化表单
  useEffect(() => {
    if (modalVisible) {
      if (isEdit && currentRecord) {
        form.setFieldsValue({
          username: currentRecord.username || '',
          email: currentRecord.email || '',
          status: currentRecord.status || '1',
          role: currentRecord.role || '访客',
        })
      } else {
        form.resetFields()
      }
    }
  }, [modalVisible, isEdit, currentRecord, form])

  const validate = () => {
    return form
      .validateFields()
      .then(() => true)
      .catch(() => false)
  }

  const handleSubmit = async () => {
    const valid = await validate()
    if (!valid) return
    const values = form.getFieldsValue()
    handleModalOk(values)
  }

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      okText="确定"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ status: '1', role: '访客' }}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item name="role" label="角色">
          <Select
            options={[
              { value: '管理员', label: '管理员' },
              { value: '编辑', label: '编辑' },
              { value: '访客', label: '访客' },
            ]}
          />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Radio.Group>
            {STATUS_OPTIONS.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}
