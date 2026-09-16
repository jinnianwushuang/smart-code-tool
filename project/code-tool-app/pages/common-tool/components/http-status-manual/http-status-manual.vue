<script setup>
import { computed } from 'vue'
import { SearchOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { useHttpStatus } from './composables/use-http-status.js'

const { searchText, pdfArea, isExporting, filteredStatus, copyCode, downloadPdf } = useHttpStatus()

// 按类别分组
const CATEGORY_META = {
  '2xx': { label: '2xx 成功', color: '#52c41a', icon: '✅' },
  '4xx': { label: '4xx 客户端错误', color: '#faad14', icon: '⚠️' },
  '5xx': { label: '5xx 服务端错误', color: '#722ed1', icon: '🔥' },
}

const groupedStatus = computed(() => {
  const groups = {}
  filteredStatus.value.forEach((item) => {
    const cat = String(item.code)[0] + 'xx'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  return groups
})
</script>

<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1000 transition-base">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="info_outline" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">HTTP 状态码速查手册</div>
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

      <q-card-section class="q-gutter-y-sm">
        <!-- 搜索栏 -->
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索代码(如404)或关键词(如'权限')..."
          allow-clear
          size="small"
          style="max-width: 400px"
        >
          <template #prefix><SearchOutlined style="color: #bfbfbf" /></template>
        </a-input-search>

        <!-- 分组列表 (PDF 导出区域) -->
        <div ref="pdfArea" class="status-groups">
          <div v-if="filteredStatus.length === 0" class="empty-box">
            <a-empty description="未找到相关状态码" />
          </div>

          <template v-for="(items, catKey) in groupedStatus" :key="catKey">
            <!-- 分组标题 -->
            <div class="group-header" :style="{ borderLeftColor: CATEGORY_META[catKey]?.color }">
              <span class="group-icon">{{ CATEGORY_META[catKey]?.icon }}</span>
              <span class="group-label">{{ CATEGORY_META[catKey]?.label }}</span>
              <span class="group-count">{{ items.length }}</span>
            </div>

            <!-- 紧凑表格 -->
            <div class="compact-table">
              <div v-for="item in items" :key="item.code" class="table-row">
                <div class="row-code font-mono" :style="{ color: item.color }">
                  {{ item.code }}
                </div>
                <div class="row-title">{{ item.title }}</div>
                <div class="row-desc">{{ item.desc }}</div>
                <div class="row-scenario">
                  <span class="scenario-text">{{ item.scenario }}</span>
                </div>
                <div class="row-action">
                  <a-button type="text" size="small" @click="copyCode(item.code)">
                    <template #icon><CopyOutlined /></template>
                  </a-button>
                </div>
              </div>
            </div>
          </template>
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
    box-shadow 0.3s;
}
.max-w-1000 {
  max-width: 1000px;
}
.font-mono {
  font-family: 'Fira Code', 'Monaco', monospace;
}

/* 分组标题 */
.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin-top: 12px;
  border-left: 4px solid;
  background: rgba(128, 128, 128, 0.06);
  border-radius: 0 6px 6px 0;
}
.group-header:first-child {
  margin-top: 0;
}
.group-icon {
  font-size: 14px;
}
.group-label {
  font-size: 13px;
  font-weight: 600;
  color: #434343;
}
.group-count {
  font-size: 11px;
  color: #888;
  background: rgba(128, 128, 128, 0.12);
  padding: 0 6px;
  border-radius: 8px;
}

/* 紧凑表格 */
.compact-table {
  border: 1px solid rgba(128, 128, 128, 0.12);
  border-radius: 6px;
  overflow: hidden;
}
.table-row {
  display: grid;
  grid-template-columns: 56px 140px 110px 1fr 32px;
  align-items: center;
  padding: 6px 12px;
  gap: 8px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.08);
  font-size: 13px;
  transition: background-color 0.15s;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: rgba(128, 128, 128, 0.06);
}
.row-code {
  font-weight: 700;
  font-size: 14px;
}
.row-title {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-desc {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-scenario {
  overflow: hidden;
}
.scenario-text {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.row-action {
  display: flex;
  justify-content: center;
}

.empty-box {
  padding: 40px 0;
}

/* 暗色模式 */
</style>

<style>
body.body--dark .generator-wrapper .row-title {
  color: #e0e0e0;
}
body.body--dark .generator-wrapper .row-desc {
  color: #aaa;
}
body.body--dark .generator-wrapper .scenario-text {
  color: #888;
}
</style>
