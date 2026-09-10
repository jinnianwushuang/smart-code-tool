<script setup>
import {
  SearchOutlined,
  CopyOutlined,
  BugOutlined,
} from '@ant-design/icons-vue'
import { useHttpStatus } from './composables/use-http-status.js'

const {
  searchText,
  pdfArea,
  isExporting,
  filteredStatus,
  copyCode,
  downloadPdf,
} = useHttpStatus()
</script>

<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-900 transition-base">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="info_outline" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">HTTP 状态码开发手册</div>
        <q-space />
        <div class="row items-center q-gutter-x-md">
          <a
            href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status"
            target="_blank"
            class="text-white text-caption"
            style="text-decoration: underline"
            >MDN 文档</a
          >
          <q-btn
            color="white"
            text-color="negative"
            label="导出 PDF"
            icon="picture_as_pdf"
            size="sm"
            :loading="isExporting"
            @click="downloadPdf"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索代码(如404)或关键词(如'权限')..."
            size="large"
            allow-clear
          >
            <template #prefix><SearchOutlined style="color: #bfbfbf" /></template>
          </a-input-search>
        </div>

        <!-- 列表区域 (PDF 导出引用此 DOM) -->
        <div ref="pdfArea" class="status-list">
          <div v-if="filteredStatus.length === 0" class="empty-box">
            <a-empty description="未找到相关状态码" />
          </div>

          <div
            v-for="item in filteredStatus"
            :key="item.code"
            class="status-item transition-base"
            :style="{ borderLeftColor: item.color }"
          >
            <div class="item-main">
              <div class="code-badge font-mono" :style="{ backgroundColor: item.color }">
                {{ item.code }}
              </div>
              <div class="info-zone">
                <div class="name-row">
                  <span class="status-name">{{ item.title }}</span>
                  <span class="status-desc">{{ item.desc }}</span>
                </div>
                <div class="scenario-card">
                  <div class="scenario-tag"><BugOutlined /> 开发实战场景:</div>
                  <div class="scenario-text">{{ item.scenario }}</div>
                </div>
              </div>
            </div>
            <div class="item-actions">
              <a-button type="text" @click="copyCode(item.code)">
                <template #icon><CopyOutlined /></template>
              </a-button>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.3s;
}

.max-w-900 {
  max-width: 900px;
}

.search-bar {
  margin-bottom: 16px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: rgba(128, 128, 128, 0.03);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-left-width: 5px;
  border-radius: 4px 8px 8px 4px;
}

.status-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.item-main {
  display: flex;
  gap: 20px;
  flex: 1;
}

.code-badge {
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  height: fit-content;
  padding: 4px 12px;
  border-radius: 6px;
  min-width: 70px;
  text-align: center;
}

.name-row {
  margin-bottom: 10px;
}
.status-name {
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
}
.status-desc {
  color: rgba(128, 128, 128, 0.7);
  font-size: 14px;
}

.scenario-card {
  background: rgba(128, 128, 128, 0.05);
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px dashed rgba(128, 128, 128, 0.2);
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', monospace;
}

.scenario-tag {
  font-size: 12px;
  color: #595959;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.scenario-text {
  color: #434343;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.empty-box {
  padding: 40px 0;
}
</style>
