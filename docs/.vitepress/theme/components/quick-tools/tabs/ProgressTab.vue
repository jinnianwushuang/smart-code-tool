<script setup>
import { ref, computed } from 'vue'
import { dayjs, formatRelative } from '../shared/utils'
import { getTagsById, getAllTags } from '../shared/useDocIdMapper'
import TagFilter from '../shared/TagFilter.vue'

const props = defineProps({
  records: { type: Array, required: true },
  navigateTo: { type: Function, required: true },
})

const emit = defineEmits(['add', 'delete', 'clearAll', 'export'])

const filterTag = ref('')
const allTags = computed(() => {
  const tagSet = new Set()
  for (const r of props.records) {
    const tags = getTagsById(r.docId)
    tags.forEach((t) => tagSet.add(t))
  }
  return Array.from(tagSet).sort()
})
const filteredRecords = computed(() => {
  if (!filterTag.value) return props.records
  return props.records.filter((r) => {
    const tags = getTagsById(r.docId)
    return tags.includes(filterTag.value)
  })
})
</script>

<template>
  <div class="qt-tab-content">
    <div class="qt-progress-toolbar">
      <button class="qt-action-btn primary" @click="emit('add')">📌 记录当前页面进度</button>
      <button
        v-if="records.length > 0"
        class="qt-action-btn ghost qt-right"
        @click="emit('export')"
        title="导出为 Markdown"
      >
        ⬇️ 导出
      </button>
      <button
        v-if="records.length > 0"
        class="qt-action-btn ghost danger"
        @click="emit('clearAll')"
        title="清空全部记录"
      >
        🧹 清空全部
      </button>
    </div>

    <div class="qt-record-scroll">
      <div v-if="allTags.length > 0" class="rv-filter-bar">
        <TagFilter :tags="allTags" v-model="filterTag" />
      </div>
      <div v-if="filteredRecords.length === 0" class="qt-empty">暂无记录</div>

      <div v-else class="qt-record-list">
        <div
          v-for="(record, index) in filteredRecords"
          :key="index"
          class="qt-record-card"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <button class="qt-icon-btn nav" @click="navigateTo(record.url)" title="跳转到此页面">
                🔗
              </button>
              <button class="qt-icon-btn danger" @click="emit('delete', index)" title="删除">
                🗑️
              </button>
            </div>
          </div>
          <div class="qt-record-meta">
            <span class="qt-record-time"
              >🕐 {{ dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') }}</span
            >
            <span class="qt-relative-time">{{ formatRelative(record.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
