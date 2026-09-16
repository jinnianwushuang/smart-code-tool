<script setup>
import { dayjs, formatRelative } from './utils'

const props = defineProps({
  records: { type: Array, required: true },
})

const emit = defineEmits(['add', 'delete', 'clearAll'])
</script>

<template>
  <div class="qt-tab-content">
    <div class="qt-progress-toolbar">
      <button class="qt-action-btn primary" @click="emit('add')">📌 记录当前页面进度</button>
      <button v-if="records.length > 0" class="qt-action-btn ghost" @click="emit('clearAll')">
        🧹 清空全部
      </button>
    </div>

    <div v-if="records.length === 0" class="qt-empty">暂无记录</div>

    <div v-else class="qt-record-list">
      <div v-for="(record, index) in records" :key="index" class="qt-record-card">
        <div class="qt-record-header">
          <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
          <div class="qt-record-actions">
            <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
            <button class="qt-icon-btn danger" @click="emit('delete', index)" title="删除">🗑️</button>
          </div>
        </div>
        <div class="qt-record-meta">
          <span class="qt-record-time">🕐 {{ dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') }}</span>
          <span class="qt-relative-time">{{ formatRelative(record.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
