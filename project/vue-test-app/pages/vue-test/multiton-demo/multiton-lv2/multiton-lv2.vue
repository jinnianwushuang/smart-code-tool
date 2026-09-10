<template>
  <div>
    <!-- 1. 顶部查询区域 -->
    <MerchantSearch :search-state="searchState" @search="onSearch" @reset="onReset" />

    <!-- 2. 操作栏 -->
    <div
      style="
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <a-button type="primary" size="large" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        入驻新商户
      </a-button>
      <span style="color: #999">当前共 {{ pagination.total }} 家商户</span>
    </div>

    <!-- 3. 卡片列表区域 (替代表格) -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }"
      :data-source="merchantList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <MerchantCard :item="item" @edit="handleEdit" @delete="handleDelete" />
        </a-list-item>
      </template>
    </a-list>

    <!-- 4. 底部翻页 -->
    <div style="margin-top: 24px; text-align: right">
      <a-pagination
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
        @change="loadData"
      />
    </div>

    <!-- 5. 新增/编辑 抽屉弹窗 (商户字段多，建议用抽屉或大弹窗) -->
    <MerchantFormModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :initial-data="formState"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import MerchantSearch from './components/MerchantSearch.vue'
import MerchantCard from './components/MerchantCard.vue'
import MerchantFormModal from './components/MerchantFormModal.vue'

// --- 数据定义 ---
const loading = ref(false)
const merchantList = ref([])
const searchState = reactive({ name: '', category: undefined })
const pagination = reactive({ current: 1, pageSize: 8, total: 40 })

// --- 获取数据 ---
const loadData = async () => {
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    const data = []
    for (let i = 1; i <= pagination.pageSize; i++) {
      data.push({
        id: i + (pagination.current - 1) * pagination.pageSize,
        name: `阳光${['果蔬', '海鲜', '火锅', '便利店'][i % 4]}旗舰店`,
        category: ['餐饮', '零售', '娱乐'][i % 3],
        contactPerson: '张经理',
        phone: '138-0000-0000',
        balance: (Math.random() * 10000).toFixed(2),
        rating: Math.floor(Math.random() * 3) + 3,
        status: Math.random() > 0.2 ? '1' : '0',
        address: '某某市高新区技术软件园 A 座 10' + i + '号',
      })
    }
    merchantList.value = data
    loading.value = false
  }, 600)
}

// --- 搜索逻辑 ---
const onSearch = () => {
  pagination.current = 1
  loadData()
}
const onReset = () => {
  searchState.name = ''
  searchState.category = undefined
  onSearch()
}

// --- 弹窗逻辑 ---
const modalVisible = ref(false)
const confirmLoading = ref(false)
const isEdit = ref(false)
const formState = reactive({
  id: null,
  name: '',
  category: undefined,
  contactPerson: '',
  phone: '',
  address: '',
  status: '1',
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formState, {
    id: null,
    name: '',
    category: undefined,
    contactPerson: '',
    phone: '',
    address: '',
    status: '1',
  })
  modalVisible.value = true
}

const handleEdit = (item) => {
  isEdit.value = true
  Object.assign(formState, { ...item })
  modalVisible.value = true
}
const handleModalOk = (values) => {
  confirmLoading.value = true
  // 这里通常是调用 API 提交 values
  setTimeout(() => {
    message.success(isEdit.value ? '信息更新成功' : '商户入驻成功')
    modalVisible.value = false
    confirmLoading.value = false
    loadData()
  }, 800)
}

const handleDelete = (id) => {
  message.success(`已成功移除商户 ID: ${id}`)
  loadData()
}

onMounted(loadData)
</script>

<style scoped></style>
