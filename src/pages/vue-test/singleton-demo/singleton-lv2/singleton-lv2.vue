<template>
  <div style="">
    <UserSearch :search-state="searchState" @search="onSearch" @reset="onReset" />

    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        新增用户
      </a-button>
    </div>

    <UserTable
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <UserModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :initial-data="formState"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserModal from './components/UserModal.vue'

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
<style scoped></style>
