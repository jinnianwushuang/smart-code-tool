/**
 * 单例模式 - 用户管理 Mock 数据
 */

export const STATUS_OPTIONS = [
  { value: '1', label: '启用' },
  { value: '0', label: '禁用' },
]

export const MOCK_USERS = [
  {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    status: '1',
    role: '管理员',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    username: '李四',
    email: 'lisi@example.com',
    status: '1',
    role: '编辑',
    createTime: '2024-02-20',
  },
  {
    id: 3,
    username: '王五',
    email: 'wangwu@example.com',
    status: '0',
    role: '访客',
    createTime: '2024-03-10',
  },
  {
    id: 4,
    username: '赵六',
    email: 'zhaoliu@example.com',
    status: '1',
    role: '编辑',
    createTime: '2024-04-05',
  },
  {
    id: 5,
    username: '钱七',
    email: 'qianqi@example.com',
    status: '0',
    role: '访客',
    createTime: '2024-05-18',
  },
  {
    id: 6,
    username: '孙八',
    email: 'sunba@example.com',
    status: '1',
    role: '管理员',
    createTime: '2024-06-22',
  },
  {
    id: 7,
    username: '周九',
    email: 'zhoujiu@example.com',
    status: '1',
    role: '编辑',
    createTime: '2024-07-01',
  },
  {
    id: 8,
    username: '吴十',
    email: 'wushi@example.com',
    status: '0',
    role: '访客',
    createTime: '2024-07-15',
  },
  {
    id: 9,
    username: '郑十一',
    email: 'zheng11@example.com',
    status: '1',
    role: '编辑',
    createTime: '2024-08-03',
  },
  {
    id: 10,
    username: '陈十二',
    email: 'chen12@example.com',
    status: '1',
    role: '管理员',
    createTime: '2024-08-20',
  },
  {
    id: 11,
    username: '林十三',
    email: 'lin13@example.com',
    status: '0',
    role: '访客',
    createTime: '2024-09-01',
  },
  {
    id: 12,
    username: '黄十四',
    email: 'huang14@example.com',
    status: '1',
    role: '编辑',
    createTime: '2024-09-15',
  },
]

export const TABLE_COLUMNS = [
  { key: 'id', dataIndex: 'id', title: 'ID', width: 60 },
  { key: 'username', dataIndex: 'username', title: '用户名' },
  { key: 'email', dataIndex: 'email', title: '邮箱' },
  { key: 'role', dataIndex: 'role', title: '角色' },
  { key: 'status', dataIndex: 'status', title: '状态' },
  { key: 'createTime', dataIndex: 'createTime', title: '创建时间' },
  { key: 'action', title: '操作', width: 120 },
]
