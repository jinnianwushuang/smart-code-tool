import { useState, useEffect } from 'react'
import { CATEGORY_OPTIONS, STATUS_OPTIONS, FORM_RULES } from '../data/merchant-data'
import { Modal, Form, Input, Select, Radio, Row, Col } from 'antd'

const { TextArea } = Input

/**
 * 多例模式 - 商户表单弹窗
 *
 * 纯受控组件，通过 props 接收状态。每个 MainArea 实例独立管理自己的弹窗
 */
export default function MerchantFormModal({
  visible,
  isEdit,
  editingRecord,
  confirmLoading,
  onClose,
  onOk,
}) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (isEdit && editingRecord) {
        form.setFieldsValue({ ...editingRecord })
      } else {
        form.resetFields()
      }
    }
  }, [visible, isEdit, editingRecord, form])

  if (!visible) return null

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onOk(values)
    } catch (err) {
      // validation failed
    }
  }

  return (
    <Modal
      title={isEdit ? '修改商户资料' : '商户入驻申请'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      okText="确定"
      cancelText="取消"
      width={580}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ status: '1' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="商户全称"
              rules={[{ required: true, message: '请输入商户全称' }]}
            >
              <Input placeholder="请输入完整公司/店名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="经营类目"
              rules={[{ required: true, message: '请选择经营类目' }]}
            >
              <Select placeholder="请选择行业" options={CATEGORY_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="负责人姓名"
              rules={[{ required: true, message: '请输入负责人姓名' }]}
            >
              <Input placeholder="请输入负责人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="详细经营地址"
          rules={[{ required: true, message: '请输入详细地址' }]}
        >
          <TextArea rows={2} placeholder="请输入详细地址" />
        </Form.Item>

        <Form.Item name="status" label="运营状态">
          <Radio.Group buttonStyle="solid">
            {STATUS_OPTIONS.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}

function getEmptyForm() {
  return { name: '', category: '', contactPerson: '', phone: '', address: '', status: '1' }
}
