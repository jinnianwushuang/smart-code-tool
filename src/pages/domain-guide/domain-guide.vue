<template>
  <div class="nav-manager">
    <!-- 控制栏 -->
    <a-card class="control-panel" :bordered="false">
      <a-row type="flex" justify="space-between" align="middle">
        <a-col>
          <a-space size="large" v-if="isDesktop">
            <span class="page-title">大前端架构导航</span>
            <a-radio-group v-model:value="viewMode" button-style="solid">
              <a-radio-button value="card"><appstore-outlined /> 卡片视图</a-radio-button>
              <a-radio-button value="table"><table-outlined /> 表格视图</a-radio-button>
            </a-radio-group>
          </a-space>
        </a-col>
        <a-col>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索文档名称或标签..."
            style="width: 300px"
            allow-clear
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 视图区域 -->
    <div class="content-viewport">
      <!-- 1. 表格视图模式 -->
      <a-table
        v-if="viewMode === 'table'"
        :columns="columns"
        :data-source="filteredData"
        :pagination="{ pageSize: 100 }"
        row-key="name"
        class="custom-table"
        :scroll="{ y: 500 }"
        :sticky="true"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <a @click="openLink(record.url)" class="table-link">{{ index + 1 }}</a>
          </template>
          <template v-if="column.key === 'name'">
            <a @click="openLink(record.url)" class="table-link">{{ record.name }}</a>
          </template>
          <template v-if="column.key === 'tag'">
            <a-tag :color="getTagColor(record.category)">{{ record.tag }}</a-tag>
          </template>
          <template v-if="column.key === 'priority'">
            <a-rate :value="record.priority || 5" disabled style="font-size: 12px" />
          </template>
        </template>
      </a-table>

      <!-- 2. 卡片视图模式 -->
      <div v-else class="card-grid">
        <div v-for="group in groupedData" :key="group.category" class="group-wrapper">
          <a-divider orientation="left">
            <component :is="group.icon" style="margin-right: 8px" />
            {{ group.category }}
          </a-divider>
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in group.items" :key="item.name">
              <a-card hoverable class="nav-card" @click="openLink(item.url)">
                <div class="card-top">
                  <span class="name">{{ item.name }}</span>
                  <a-tag color="blue" size="small">{{ item.tag }}</a-tag>
                </div>
                <p class="desc">{{ item.desc }}</p>
                <div class="card-footer">
                  <span class="cat">{{ group.category }}</span>
                  <export-outlined />
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import {
  AppstoreOutlined,
  TableOutlined,
  ExportOutlined,
  RocketOutlined,
  NodeIndexOutlined,
  BuildOutlined,
} from '@ant-design/icons-vue'
import { allDocGroups } from './config/config.js'
import { useQuasar } from 'src/output/common/project-common.js'
// 视图切换状态
const viewMode = ref('card')
const searchText = ref('')
const $q = useQuasar()
const isDesktop = $q.platform.is.desktop
// 数据定义（合并了 Vue, React, 全栈, 工具库）

// 表格列定义
const columns = [
  { title: '序号', dataIndex: 'name', key: 'index', dataIndex: 'index' },
  { title: '名称', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  {
    title: '所属分类',
    dataIndex: 'category',
    key: 'category',
    filters: [
      { text: 'Vue 生态', value: 'Vue 生态' },
      { text: 'React 生态', value: 'React 生态' },
    ],
  },
  { title: '标签', dataIndex: 'tag', key: 'tag' },
  { title: '描述', dataIndex: 'desc', key: 'desc', width: '35%' },
  { title: '重要度', dataIndex: 'priority', key: 'priority' },
]

// 计算属性：扁平化数据（用于表格）
const flatData = computed(() => {
  return allDocGroups.value.flatMap((group) =>
    group.items.map((item) => ({ ...item, category: group.category })),
  )
})

// 计算属性：根据搜索过滤
const filteredData = computed(() => {
  const query = searchText.value.toLowerCase()
  return fliter_by_query(flatData.value, query)
})

const fliter_by_query = (list, query) => {
  const q = query.toLowerCase()
  return list.filter(
    (i) =>
      (i.name || '').toLowerCase().includes(q) ||
      (i.desc || '').toLowerCase().includes(q) ||
      (i.tag || '').toLowerCase().includes(q),
  )
}

// 计算属性：过滤后的分组数据（用于卡片）
const groupedData = computed(() => {
  const query = searchText.value.toLowerCase()
  return allDocGroups.value
    .map((group) => ({
      ...group,
      items: fliter_by_query(group.items, query),
    }))
    .filter((g) => g.items.length > 0)
})

const getTagColor = (cat) => {
  const colors = { 'Vue 生态': 'green', 'React 生态': 'cyan', 全栈与工程化: 'orange' }
  return colors[cat] || 'blue'
}

const openLink = (url) => window.open(url, '_blank')
</script>

<style scoped>
.nav-manager {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.control-panel {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}
.content-viewport {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}
/* 表格滚动区域美化 */
.scroll-table :deep(.ant-table-body) {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #d9d9d9 #fafafa;
}
.scroll-table :deep(.ant-table-body::-webkit-scrollbar) {
  width: 6px;
}
.scroll-table :deep(.ant-table-body::-webkit-scrollbar-thumb) {
  background: #d9d9d9;
  border-radius: 3px;
}

/* 卡片样式 */
.nav-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.name {
  font-weight: bold;
  font-size: 15px;
}
.desc {
  color: #666;
  font-size: 12px;
  height: 36px;
  overflow: hidden;
  margin-bottom: 16px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #bfbfbf;
  font-size: 11px;
}

/* 表格样式 */
.table-link {
  font-weight: 500;
}
.custom-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}
</style>
