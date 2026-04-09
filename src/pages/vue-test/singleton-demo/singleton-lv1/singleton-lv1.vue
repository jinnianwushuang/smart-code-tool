<template>
  <div style="padding: 24px; background: #fff; min-height: 100vh">
    <!-- 1. 搜索表单 -->
    <a-form layout="inline" :model="searchState" style="margin-bottom: 24px">
      <a-form-item label="用户名">
        <a-input v-model:value="searchState.username" placeholder="请输入用户名" allow-clear />
      </a-form-item>
      <a-form-item label="状态">
        <a-select
          v-model:value="searchState.status"
          placeholder="请选择"
          style="width: 120px"
          allow-clear
        >
          <a-select-option value="1">启用</a-select-option>
          <a-select-option value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch">查询</a-button>
        <a-button style="margin-left: 8px" @click="onReset">重置</a-button>
      </a-form-item>
    </a-form>

    <!-- 2. 操作按钮区 -->
    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        新增用户
      </a-button>
    </div>

    <!-- 3. 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
      bordered
    >
      <!-- 状态列插槽 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === '1' ? 'green' : 'red'">
            {{ record.status === '1' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <!-- 操作列插槽 -->
        <template v-else-if="column.key === 'action'">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该用户吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(record.id)"
          >
            <a style="color: #ff4d4f">删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 4. 新增/编辑 弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="confirmLoading"
      destroyOnClose
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        layout="vertical"
        style="padding-top: 20px"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio value="1">启用</a-radio>
            <a-radio value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

// --- 表格列定义 ---
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
]

// --- 状态变量 ---
const loading = ref(false)
const tableData = ref([])
const searchState = reactive({
  username: '',
  status: undefined,
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条数据`,
})

// --- 数据加载 ---
const loadData = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    console.log('正在查询参数:', {
      ...searchState,
      page: pagination.current,
      size: pagination.pageSize,
    })

    // 模拟延迟和假数据
    setTimeout(() => {
      const mockList = []
      for (let i = 1; i <= pagination.pageSize; i++) {
        const id = (pagination.current - 1) * pagination.pageSize + i
        mockList.push({
          id,
          username: `用户_${id}`,
          email: `user${id}@example.com`,
          status: Math.random() > 0.3 ? '1' : '0',
          createTime: '2023-10-01 12:00:00',
        })
      }
      tableData.value = mockList
      pagination.total = 100 // 模拟总数
      loading.value = false
    }, 500)
  } catch (err) {
    message.error('加载数据失败')
    loading.value = false
  }
}

// 搜索与重置
const onSearch = () => {
  pagination.current = 1
  loadData()
}
const onReset = () => {
  searchState.username = ''
  searchState.status = undefined
  onSearch()
}

// 表格分页/排序改变
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// --- 弹窗与表单逻辑 ---
const modalVisible = ref(false)
const confirmLoading = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const modalTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

const formState = reactive({
  id: undefined,
  username: '',
  email: '',
  status: '1',
})

// 表单校验规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false
  Object.assign(formState, { id: undefined, username: '', email: '', status: '1' })
  modalVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (record) => {
  isEdit.value = true
  // 使用浅拷贝将行数据存入表单
  Object.assign(formState, { ...record })
  modalVisible.value = true
}

// 弹窗提交
const handleModalOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      confirmLoading.value = true
      try {
        // 模拟提交 API
        console.log('提交表单:', formState)
        setTimeout(() => {
          message.success(isEdit.value ? '修改成功' : '新增成功')
          confirmLoading.value = false
          modalVisible.value = false
          loadData()
        }, 800)
      } catch (error) {
        confirmLoading.value = false
      }
    })
    .catch((info) => {
      console.log('校验失败:', info)
    })
}

const handleModalCancel = () => {
  formRef.value.resetFields()
}

// 删除操作
const handleDelete = (id) => {
  console.log('删除ID:', id)
  message.success('删除成功')
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 可根据需要添加样式 */
:deep(.ant-table-pagination) {
  margin: 16px 0 !important;
}
</style>
