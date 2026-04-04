<template>
  <div class="nav-manager">
    <!-- 控制栏 -->
    <a-card class="control-panel" :bordered="false">
      <a-tabs v-model:activeKey="current_category" @change="hanle_tab_change" :tab-bar-gutter="16">
        <a-tab-pane
          v-for="category in all_tabs"
          :key="category.key"
          :tab="category.name.toUpperCase()"
        />
      </a-tabs>
    </a-card>

    <!-- 视图区域 -->
    <div class="content-viewport">
      <!-- 2. 卡片视图模式 -->
      <div class="card-grid">
        <div
          v-for="group in all_docs[current_category]"
          :key="group.category"
          class="group-wrapper"
        >
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
import { ExportOutlined } from '@ant-design/icons-vue'
import { all_tabs, all_docs } from './config/config.js'
import { useStorage } from '@vueuse/core'
const current_category = useStorage('src_pages_domain_guide_domain_guide', 'vue')

const openLink = (url) => window.open(url, '_blank')
const hanle_tab_change = (key) => {
  current_category.value = key
}
</script>

<style scoped>
.nav-manager {
  /* padding: 24px; */
  background: #f0f2f5;
  min-height: 100vh;
}
.control-panel {
  margin-bottom: 8 px;

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
