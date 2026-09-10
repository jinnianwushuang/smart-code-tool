export const categoryOptions = [
  { label: '餐饮美食', value: '餐饮' },
  { label: '百货零售', value: '零售' },
  { label: '休闲娱乐', value: '娱乐' },
]

export const statusOptions = [
  { label: '正常营业', value: '1' },
  { label: '关店歇业', value: '0' },
]

export const formRules = {
  name: [{ required: true, message: '商户名不能为空' }],
  category: [{ required: true, message: '请选择经营类目' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }],
}
