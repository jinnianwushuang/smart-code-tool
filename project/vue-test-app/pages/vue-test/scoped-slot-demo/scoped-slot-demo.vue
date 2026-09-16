<template>
  <div class="scoped-slot-container">
    <!-- 说明 -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <span class="card-title">Scoped Slot 作用域插槽</span>
      </template>
      <p class="desc-text">
        Vue 的 <strong>作用域插槽</strong> 允许子组件将内部数据"暴露"给父组件的模板，
        由父组件决定如何渲染。这是 Vue 独有的、比 React 更强大的组件通信范式——
        子组件管数据和逻辑，父组件管显示。
      </p>
      <a-row :gutter="16" class="q-mt-sm">
        <a-col :span="8" v-for="feat in features" :key="feat.title">
          <div class="feature-item">
            <div class="feature-title">{{ feat.title }}</div>
            <div class="feature-desc">{{ feat.desc }}</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- Demo 1: DataTable -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="blue">Demo 1</a-tag>
        DataTable — 通用数据表格
      </template>
      <template #extra>
        <a-button size="small" @click="refreshTableData">刷新数据</a-button>
      </template>
      <DataTable :data="tableData" :columns="tableColumns">
        <!-- 自定义 status 列的渲染 -->
        <template #cell-status="{ value }">
          <a-tag :color="value === 'active' ? 'green' : value === 'pending' ? 'orange' : 'red'">
            {{ statusMap[value] }}
          </a-tag>
        </template>
        <!-- 自定义操作列 -->
        <template #cell-actions="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
          </a-space>
        </template>
      </DataTable>
    </a-card>

    <!-- Demo 2: DataList -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="purple">Demo 2</a-tag>
        DataList — 通用列表（自定义每项渲染）
      </template>
      <DataList :data="userList" :page-size="4">
        <template #default="{ item, index }">
          <div class="user-item">
            <a-avatar :style="{ background: avatarColors[index % avatarColors.length] }">
              {{ item.name[0] }}
            </a-avatar>
            <div class="user-info">
              <div class="user-name">{{ item.name }}</div>
              <div class="user-role">{{ item.role }}</div>
            </div>
            <a-tag color="blue">{{ item.level }}</a-tag>
          </div>
        </template>
        <template #empty>
          <a-empty description="暂无用户数据" />
        </template>
      </DataList>
    </a-card>

    <!-- Demo 3: DataGrid -->
    <a-card :bordered="false">
      <template #title>
        <a-tag color="cyan">Demo 3</a-tag>
        DataGrid — 卡片网格（自定义卡片内容）
      </template>
      <DataGrid :data="productList" :columns="3">
        <template #default="{ item }">
          <div class="product-card">
            <div class="product-emoji">{{ item.emoji }}</div>
            <div class="product-name">{{ item.name }}</div>
            <div class="product-price">¥{{ item.price }}</div>
            <a-progress
              :percent="item.stock"
              :stroke-color="item.stock > 50 ? '#52c41a' : '#faad14'"
              size="small"
            />
            <div class="product-stock">库存: {{ item.stock }}%</div>
          </div>
        </template>
      </DataGrid>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from './components/DataTable.vue'
import DataList from './components/DataList.vue'
import DataGrid from './components/DataGrid.vue'

const features = [
  { title: '子组件管数据', desc: '子组件内部管理数据源、分页、排序等逻辑' },
  { title: '父组件管渲染', desc: '通过 #cell-xxx / #default 插槽自定义每个单元格的显示' },
  { title: '零 Props 透传', desc: '不需要为每种自定义渲染定义额外的 props 或事件' },
]

// ── Demo 1: Table ──
const statusMap = { active: '活跃', pending: '待审', inactive: '停用' }
const tableColumns = [
  { key: 'id', title: 'ID', width: 60 },
  { key: 'name', title: '名称' },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 },
  { key: 'actions', title: '操作', width: 140, slot: 'actions' },
]

const tableData = ref(generateTableData())

function refreshTableData() {
  tableData.value = generateTableData()
}

function generateTableData() {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  const statuses = ['active', 'pending', 'inactive']
  return names.map((name, i) => ({
    id: i + 1,
    name,
    email: `${name.toLowerCase()}@example.com`,
    status: statuses[i % 3],
  }))
}

function handleView(record) {
  console.log('查看:', record)
}
function handleDelete(record) {
  tableData.value = tableData.value.filter((d) => d.id !== record.id)
}

// ── Demo 2: List ──
const avatarColors = ['#1677ff', '#722ed1', '#13c2c2', '#52c41a', '#faad14', '#f5222d']
const userList = ref([
  { name: '刘备', role: 'CEO', level: 'P9' },
  { name: '关羽', role: 'CTO', level: 'P8' },
  { name: '张飞', role: 'COO', level: 'P7' },
  { name: '赵云', role: '架构师', level: 'P7' },
  { name: '诸葛亮', role: '首席顾问', level: 'P10' },
  { name: '黄忠', role: '高级工程师', level: 'P6' },
])

// ── Demo 3: Grid ──
const productList = ref([
  { name: 'MacBook Pro', emoji: '💻', price: 14999, stock: 85 },
  { name: 'iPhone 16', emoji: '📱', price: 7999, stock: 60 },
  { name: 'AirPods Pro', emoji: '🎧', price: 1999, stock: 92 },
  { name: 'iPad Air', emoji: '📋', price: 4799, stock: 45 },
  { name: 'Apple Watch', emoji: '⌚', price: 2999, stock: 30 },
  { name: 'HomePod', emoji: '🔊', price: 2299, stock: 15 },
])
</script>

<style scoped>
.scoped-slot-container {
  max-width: 1000px;
  margin: 0 auto;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.desc-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}
.feature-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}
.feature-title {
  font-weight: 600;
  font-size: 13px;
  color: #1677ff;
  margin-bottom: 4px;
}
.feature-desc {
  font-size: 12px;
  color: #888;
}

/* Demo 2: User Item */
.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  width: 100%;
}
.user-info {
  flex: 1;
}
.user-name {
  font-weight: 600;
  font-size: 14px;
}
.user-role {
  font-size: 12px;
  color: #999;
}

/* Demo 3: Product Card */
.product-card {
  text-align: center;
  padding: 16px;
}
.product-emoji {
  font-size: 36px;
  margin-bottom: 8px;
}
.product-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}
.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #f5222d;
  margin-bottom: 8px;
}
.product-stock {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 暗色模式 */
body.body--dark .desc-text {
  color: #aaa;
}
body.body--dark .feature-item {
  background: #2a2a2a;
}
body.body--dark .feature-desc {
  color: #888;
}
body.body--dark .user-role {
  color: #777;
}
body.body--dark .product-stock {
  color: #777;
}
</style>
