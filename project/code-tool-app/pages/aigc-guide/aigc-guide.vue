<template>
  <div class="aigc-guide generator-wrapper">
    <!-- 控制栏 -->
    <a-card class="control-panel q-mx-auto max-w-1200 transition-base" :bordered="false">
      <!-- PC 端：按钮组 -->
      <div class="pc-tabs-container hidden-sm-and-down" v-if="!is_mobile">
        <div class="button-group">
          <a-button
            v-for="tab in aigc_tabs"
            :key="tab.key"
            :type="current_tab === tab.key ? 'primary' : 'default'"
            @click="handleTabClick(tab.key)"
            class="tab-btn"
          >
            {{ tab.name }}
          </a-button>
        </div>
      </div>

      <!-- H5 端：Tabs -->
      <div class="mobile-tabs-container hidden-md-and-up" v-if="is_mobile">
        <div class="tabs-wrapper">
          <a-tabs
            v-model:activeKey="current_tab"
            @change="handleTabChange"
            :tab-bar-gutter="12"
            type="card"
            class="custom-tabs"
          >
            <a-tab-pane v-for="tab in aigc_tabs" :key="tab.key" :tab="tab.name" />
          </a-tabs>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar-container row items-center q-py-md">
        <q-input
          v-model="search_key"
          placeholder="搜索 AIGC 工具..."
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
      <div class="card-grid">
        <div v-for="group in filtered_groups" :key="group.category" class="group-wrapper">
          <a-divider orientation="left" class="category-divider">
            {{ group.category }}
          </a-divider>
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in group.items" :key="item.name">
              <a-card
                hoverable
                class="nav-card transition-base"
                @click="openLink(item.url)"
                :class="{ 'dark-card': $q.dark.isActive }"
              >
                <div class="card-top">
                  <span class="name">{{ item.name }}</span>
                  <a-tag :color="getTagColor(group.color)" size="small" class="tag-badge">
                    {{ item.tag }}
                  </a-tag>
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { ExportOutlined } from '@ant-design/icons-vue'
import { aigc_tabs, aigc_docs } from './config/aigc-config.js'
import { useStorage } from '@vueuse/core'

const current_tab = useStorage('pages_aigc_guide_tab', 'all')
const $q = useQuasar()
const is_mobile = $q.platform.is.mobile
const search_key = ref('')
const filtered_groups = ref([])

const openLink = (url) => window.open(url, '_blank')

const handleTabChange = (key) => {
  current_tab.value = key
  search_key.value = ''
  filtered_groups.value = filterGroups()
}

const handleTabClick = (key) => {
  current_tab.value = key
  search_key.value = ''
  filtered_groups.value = filterGroups()
}

const handleClearSearch = () => {
  search_key.value = ''
  nextTick(() => {
    filtered_groups.value = filterGroups()
  })
}

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
    amber: 'orange',
  }
  return colorMap[color] || 'blue'
}

const filterGroups = () => {
  const groups = aigc_docs[current_tab.value] || []
  if (!search_key.value || search_key.value.trim() === '') return groups
  const q = search_key.value.toLowerCase().trim()
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        [item.name || '', item.desc || '', item.tag || ''].join(' ').toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

watch(search_key, () => {
  filtered_groups.value = filterGroups()
})
onMounted(() => {
  filtered_groups.value = filterGroups()
})
</script>

<style scoped>
.aigc-guide {
  min-height: 100vh;
  transition: background-color 0.3s;
}
.control-panel {
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: transparent;
}
.pc-tabs-container {
  margin-bottom: 12px;
}
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tab-btn {
  font-size: 14px;
  padding: 6px 16px;
  height: auto;
  border-radius: 6px;
  transition: all 0.3s;
  white-space: nowrap;
}
.tab-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}
.tab-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .tabs-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 transparent;
  }
  .tabs-wrapper::-webkit-scrollbar {
    height: 6px;
  }
  .tabs-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }
  .tabs-wrapper::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;
  }
}

.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
.custom-tabs :deep(.ant-tabs-tab) {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}
.custom-tabs :deep(.ant-tabs-ink-bar) {
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
}
.custom-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1890ff;
  font-weight: 600;
}

.search-bar-container {
  background: rgba(128, 128, 128, 0.04);
  border-radius: 8px;
}
.content-viewport {
  padding: 24px;
  border-radius: 12px;
}
.category-divider {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 16px;
}

.nav-card {
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e8e8e8;
  background: #fff;
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

@media (max-width: 768px) {
  .content-viewport {
    padding: 16px;
  }
  .nav-card:hover {
    transform: translateY(-3px);
  }
}
</style>
