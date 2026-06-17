<template>
  <div class="nav-manager generator-wrapper">
    <!-- 控制栏 -->
    <a-card class="control-panel q-mx-auto max-w-1200 transition-base" :bordered="false">
      <a-tabs v-model:activeKey="current_category" @change="hanle_tab_change" :tab-bar-gutter="16">
        <a-tab-pane
          v-for="category in all_tabs"
          :key="category.key"
          :tab="category.name.toUpperCase()"
        />
      </a-tabs>
      <div class="search-bar-container row items-center q-px-sm q-pb-md">
        <q-input
          v-model="search_key"
          placeholder="请输入关键字搜索..."
          outlined
          dense
          clearable
          @clear="handleClearSearch"
          :dark="$q.dark.isActive"
          :class="is_mobile ? 'col' : 'w-400'"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </a-card>

    <!-- 视图区域 -->
    <div class="content-viewport q-mx-auto max-w-1200">
      <!-- 卡片视图模式 -->
      <div class="card-grid">
        <div
          v-for="group in filtered_groups"
          :key="group.tab_name + group.category"
          class="group-wrapper"
        >
          <a-divider orientation="left" class="category-divider">
            <component :is="group.icon" style="margin-right: 8px" v-if="group.icon" />
            {{
              current_category == 'all'
                ? `【${group.tab_name}】：` + group.category
                : group.category
            }}
          </a-divider>
          <a-row :gutter="[16, 16]">
            <a-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              v-for="item in group.items"
              :key="group.tab_name + group.category + item.name"
            >
              <a-card
                hoverable
                class="nav-card transition-base"
                @click="openLink(item.url)"
                :class="{ 'dark-card': $q.dark.isActive }"
              >
                <div class="card-top">
                  <span class="name">{{ item.name }}</span>
                  <a-tag :color="getTagColor(group.color)" size="small" class="tag-badge">{{
                    item.tag
                  }}</a-tag>
                </div>
                <p class="desc">{{ item.desc }}</p>
                <div class="card-footer">
                  <span class="cat">{{ group.category }}</span>
                  <export-outlined class="export-icon" />
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { ExportOutlined } from '@ant-design/icons-vue'
import { all_tabs, all_docs } from './config/config.js'
import { useStorage } from '@vueuse/core'

const current_category = useStorage('src_pages_domain_guide_domain_guide', 'vue')
const $q = useQuasar()
const is_mobile = $q.platform.is.mobile
const search_key = ref('')
const filtered_groups = ref([])

const openLink = (url) => window.open(url, '_blank')

const hanle_tab_change = (key) => {
  current_category.value = key
  search_key.value = ''
  filtered_groups.value = handle_filter_groups()
}
onMounted(() => {
  filtered_groups.value = handle_filter_groups()
})

// 根据分类颜色获取标签颜色
const getTagColor = (color) => {
  const colorMap = {
    blue: 'blue',
    cyan: 'cyan',
    green: 'green',
    orange: 'orange',
    red: 'red',
    purple: 'purple',
    pink: 'pink',
    magenta: 'magenta',
    yellow: 'gold',
    lime: 'lime',
    teal: 'cyan',
    indigo: 'geekblue',
    brown: 'volcano',
    geekblue: 'geekblue',
    gold: 'gold',
    volcano: 'volcano',
  }
  return colorMap[color] || 'blue'
}

// 监听搜索关键字变化，确保响应式更新
watch(search_key, (newVal) => {
  // 当搜索关键字改变时，强制触发重新计算
  console.log('搜索关键字变化:', newVal)
  filtered_groups.value = handle_filter_groups()
})

// 处理清除搜索
const handleClearSearch = () => {
  search_key.value = ''
  // 强制触发更新
  nextTick(() => {
    console.log('搜索已清除')
    filtered_groups.value = handle_filter_groups()
  })
}

const handle_filter_groups = () => {
  const groups = all_docs[current_category.value] || []

  // 如果没有搜索关键字，返回所有分组
  if (!search_key.value || search_key.value.trim() === '') {
    return groups
  }

  const q = search_key.value.toLowerCase().trim()

  // 过滤每个分组中的项目
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // 检查名称、描述、标签是否包含搜索关键字
        const searchText = [item.name || '', item.desc || '', item.tag || '']
          .join(' ')
          .toLowerCase()

        return searchText.includes(q)
      }),
    }))
    .filter((group) => group.items.length > 0)
}
</script>

<style scoped>
.nav-manager {
  min-height: 100vh;
  transition: background-color 0.3s;
}

.control-panel {
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: transparent;
}

.search-bar-container {
  background: rgba(128, 128, 128, 0.04);
  border-radius: 8px;
  padding: 8px;
}

.content-viewport {
  padding: 24px;
  border-radius: 12px;
}

/* 分类标题 */
.category-divider {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 16px;
}

/* 卡片样式优化 */
.nav-card {
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e8e8e8;
  background: #ffffff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.nav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(24, 144, 255, 0.15);
  border-color: #1890ff;
}

.nav-card:hover::before {
  opacity: 1;
}

/* 暗色模式卡片 */
.dark-card {
  background: #1f1f1f;
  border-color: #303030;
}

.dark-card:hover {
  border-color: #177ddc;
  box-shadow: 0 12px 24px rgba(23, 125, 220, 0.2);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.name {
  font-weight: 600;
  font-size: 15px;
  color: #262626;
  line-height: 1.4;
  flex: 1;
  word-break: break-word;
}

.dark-card .name {
  color: #e8e8e8;
}

.tag-badge {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.desc {
  color: #595959;
  font-size: 13px;
  line-height: 1.6;
  height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.dark-card .desc {
  color: #a6a6a6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8c8c8c;
  font-size: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.dark-card .card-footer {
  color: #595959;
  border-top-color: #303030;
}

.cat {
  opacity: 0.7;
}

.export-icon {
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.nav-card:hover .export-icon {
  opacity: 1;
  color: #1890ff;
}

.dark-card:hover .export-icon {
  color: #177ddc;
}

/* 表格样式 */
.table-link {
  font-weight: 500;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .content-viewport {
    padding: 16px;
  }

  .nav-card:hover {
    transform: translateY(-3px);
  }
}
</style>
