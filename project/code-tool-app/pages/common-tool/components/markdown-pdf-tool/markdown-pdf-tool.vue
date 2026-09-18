<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1400px">
      <!-- 头部工具栏 -->
      <q-card-section class="header-section">
        <div class="row items-center q-gutter-sm">
          <q-icon name="picture_as_pdf" size="sm" />
          <div class="text-h6 text-weight-bold">Markdown → PDF / 图片</div>
          <q-space />
          <a-tag color="green">GitHub 样式</a-tag>
          <q-btn flat color="white" label="示例" icon="lightbulb" size="sm" @click="loadSample" />
          <q-btn flat color="white" label="清空" icon="delete" size="sm" @click="clearAll" />
        </div>
      </q-card-section>

      <!-- 操作栏 -->
      <q-card-section class="q-pb-none">
        <div class="row items-center q-gutter-sm">
          <!-- 文件上传 -->
          <a-upload
            :before-upload="handleFileUpload"
            :show-upload-list="false"
            accept=".md,.markdown,.txt"
          >
            <a-button>
              <template #icon><UploadOutlined /></template>
              上传 .md 文件
            </a-button>
          </a-upload>

          <q-separator vertical />

          <!-- 文件名 -->
          <q-input
            v-model="fileName"
            dense
            outlined
            label="导出文件名"
            style="max-width: 240px"
            class="font-mono"
          />

          <q-space />

          <!-- 预览切换 -->
          <q-btn-toggle
            v-model="previewVisible"
            :options="[
              { label: '编辑 + 预览', value: true },
              { label: '纯预览', value: 'preview-only' },
            ]"
            toggle-color="primary"
            dense
            size="sm"
          />

          <q-separator vertical />

          <!-- 导出按钮 -->
          <a-button
            type="primary"
            :loading="exporting"
            @click="handleSaveMarkdown"
            :disabled="!hasContent"
          >
            <template #icon><SaveOutlined /></template>
            保存 .md
          </a-button>
          <a-button :loading="exporting" @click="handleExportHtml" :disabled="!hasContent">
            <template #icon><Html5Outlined /></template>
            导出 HTML
          </a-button>
          <a-button :loading="exporting" @click="handleExportImage" :disabled="!hasContent">
            <template #icon><FileImageOutlined /></template>
            保存为图片
          </a-button>
          <a-button
            type="primary"
            :loading="exporting"
            @click="handleExportPdf"
            :disabled="!hasContent"
          >
            <template #icon><FilePdfOutlined /></template>
            导出 PDF
          </a-button>
        </div>
      </q-card-section>

      <q-separator class="q-my-sm" />

      <!-- 主内容区 -->
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md">
          <!-- 左侧：Markdown 编辑 -->
          <div v-if="previewVisible === true" class="col-12 col-md-6">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">
              Markdown 源码
              <span class="text-caption text-grey-5 q-ml-sm">{{ charCount }} 字符</span>
              <a-button type="link" size="small" @click="copyMarkdown" :disabled="!hasContent">
                复制源码
              </a-button>
            </div>
            <a-textarea
              v-model="markdownText"
              placeholder="在此粘贴 Markdown 内容...&#10;&#10;也支持拖拽 .md 文件到右侧预览区域"
              :auto-size="{ minRows: 20, maxRows: 40 }"
              class="font-mono markdown-editor"
            />
          </div>

          <!-- 右侧：预览区域 -->
          <div :class="previewVisible === true ? 'col-12 col-md-6' : 'col-12'">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">预览 (GitHub 风格)</div>
            <div
              ref="previewRef"
              class="markdown-body preview-area"
              :class="{ 'drag-over': isDragging }"
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              @dragover="handleDragOver"
              @drop="handleDrop"
            >
              <div v-if="!hasContent" class="empty-placeholder">
                <q-icon name="description" size="64px" color="grey-5" />
                <div class="text-grey-5 q-mt-md">粘贴 Markdown 内容、上传文件或拖拽文件到此处</div>
                <div class="text-caption text-grey-4 q-mt-xs">支持 .md / .markdown / .txt</div>
              </div>
              <div v-else v-html="renderedHtml" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import {
  UploadOutlined,
  SaveOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  Html5Outlined,
} from '@ant-design/icons-vue'
import { useMarkdownPdf } from './composables/use-markdown-pdf.js'

const {
  markdownText,
  previewVisible,
  isDragging,
  exporting,
  fileName,
  renderedHtml,
  hasContent,
  charCount,
  previewRef,
  handleFileUpload,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleExportPdf,
  handleExportImage,
  handleExportHtml,
  handleSaveMarkdown,
  loadSample,
  clearAll,
  copyMarkdown,
} = useMarkdownPdf()
</script>

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

.header-section {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
}

.font-mono :deep(textarea) {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.markdown-editor :deep(textarea) {
  background: rgba(128, 128, 128, 0.02);
}

.preview-area {
  min-height: 400px;
  max-height: 70vh;
  overflow: auto;
  border: 2px dashed transparent;
  border-radius: 8px;
  padding: 24px;
  background: #fff;
  transition: all 0.3s;
}

.preview-area.drag-over {
  border-color: #1a73e8;
  background: #e8f0fe;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* GitHub Markdown 样式覆盖 */
.preview-area :deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
  color: #1f2328;
}

.preview-area :deep(.markdown-body h1) {
  font-size: 2em;
  border-bottom: 1px solid #d1d9e0;
  padding-bottom: 0.3em;
}

.preview-area :deep(.markdown-body h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #d1d9e0;
  padding-bottom: 0.3em;
}

.preview-area :deep(.markdown-body pre) {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.preview-area :deep(.markdown-body code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
}

.preview-area :deep(.markdown-body table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.preview-area :deep(.markdown-body table th),
.preview-area :deep(.markdown-body table td) {
  border: 1px solid #d1d9e0;
  padding: 6px 13px;
}

.preview-area :deep(.markdown-body table th) {
  background: #f6f8fa;
  font-weight: 600;
}

.preview-area :deep(.markdown-body blockquote) {
  border-left: 4px solid #d1d9e0;
  padding: 0 16px;
  color: #656d76;
  margin: 16px 0;
}

/* 暗色模式适配 */
:deep(body.body--dark) .preview-area {
  background: #0d1117;
  color: #e6edf3;
}

:deep(body.body--dark) .preview-area .markdown-body {
  color: #e6edf3;
}
</style>
