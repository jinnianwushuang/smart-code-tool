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
        <!-- <div>关键字：</div> -->
        <q-input
          v-model="search_key"
          placeholder="请输入关键字"
          outlined
          dense
          clearable
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
      <!-- 2. 卡片视图模式 -->
      <div class="card-grid">
        <div
          v-for="group in filtered_groups"
          :key="group.category"
          class="group-wrapper"
        >
          <a-divider orientation="left">
            <component :is="group.icon" style="margin-right: 8px" />
            {{ group.category }}
          </a-divider>
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in group.items" :key="item.name">
              <a-card hoverable class="nav-card transition-base" @click="openLink(item.url)">
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
import { ref, computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { ExportOutlined } from '@ant-design/icons-vue'
import { all_tabs, all_docs } from './config/config.js'
import { useStorage } from '@vueuse/core'
const current_category = useStorage('src_pages_domain_guide_domain_guide', 'vue')
const $q = useQuasar()
const is_mobile = $q.platform.is.mobile
const search_key = ref('')
const openLink = (url) => window.open(url, '_blank')
const hanle_tab_change = (key) => {
  current_category.value = key
}

const filtered_groups = computed(() => {
  const groups = all_docs[current_category.value] || []
  if (!search_key.value) {
    return groups
  }
  const q = search_key.value.toLowerCase()
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        [item.name, item.desc, item.tag].some((val) => val?.toLowerCase().includes(q)),
      ),
    }))
    .filter((group) => group.items.length > 0)
})
</script>

<style scoped>
.nav-manager {
  min-height: 100vh;
  transition: background-color 0.3s;
}

.control-panel {
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: transparent;
}

.search-bar-container {
  background: rgba(128, 128, 128, 0.05);
  border-radius: 4px;
}

.content-viewport {
  padding: 24px;
  border-radius: 8px;
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
}
</style>
