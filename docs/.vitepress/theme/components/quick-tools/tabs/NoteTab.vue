<script setup>
import { ref, computed, nextTick } from 'vue'
import { dayjs, formatRelative } from '../shared/utils'
import { getTagsById } from '../shared/useDocIdMapper'

const props = defineProps({
  records: { type: Array, required: true },
  sorted: { type: Array, required: true },
  draft: { type: String, required: true },
  editingId: { type: String, default: null },
  navigateTo: { type: Function, required: true },
})

const emit = defineEmits(['update:draft', 'save', 'edit', 'delete', 'export', 'clear-all'])

const textareaRef = ref(null)

const onEdit = (record) => {
  emit('edit', record)
  nextTick(() => textareaRef.value?.focus())
}

const focusTextarea = () => {
  nextTick(() => textareaRef.value?.focus())
}

defineExpose({ focusTextarea })

// ── 标签筛选 ──
const filterTag = ref('')
const allTags = computed(() => {
  const tagSet = new Set()
  for (const r of props.records) {
    const tags = getTagsById(r.docId)
    tags.forEach((t) => tagSet.add(t))
  }
  return Array.from(tagSet).sort()
})
const filteredSorted = computed(() => {
  if (!filterTag.value) return props.sorted
  return props.sorted.filter((r) => {
    const tags = getTagsById(r.docId)
    return tags.includes(filterTag.value)
  })
})
</script>

<template>
  <div class="qt-tab-content">
    <!-- 笔记录入/编辑表单 -->
    <div class="qt-doubt-form">
      <textarea
        ref="textareaRef"
        :value="draft"
        class="qt-textarea"
        placeholder="记录学习心得、总结、要点..."
        rows="3"
        @input="emit('update:draft', $event.target.value)"
      ></textarea>
      <div class="qt-form-actions">
        <button class="qt-action-btn primary" :disabled="!draft.trim()" @click="emit('save')">
          {{ editingId ? '💾 更新笔记' : '💾 保存笔记' }}
        </button>
        <span v-if="editingId" class="qt-edit-hint">✏️ 正在编辑已有笔记</span>
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
          @click="emit('clear-all')"
          title="清空全部记录"
        >
          🧹 清空全部
        </button>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="qt-record-scroll">
      <div v-if="allTags.length > 0" class="rv-filter-bar">
        <select v-model="filterTag" class="rv-group-select">
          <option value="">全部标签</option>
          <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div v-if="filteredSorted.length === 0" class="qt-empty">暂无笔记</div>

      <div v-else class="qt-record-list">
        <div
          v-for="record in filteredSorted"
          :key="record.id"
          class="qt-record-card"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <button class="qt-icon-btn nav" @click="navigateTo(record.url)" title="跳转到此页面">
                🔗
              </button>
              <button class="qt-icon-btn" @click="onEdit(record)" title="编辑">✏️</button>
              <button class="qt-icon-btn danger" @click="emit('delete', record.id)" title="删除">
                🗑️
              </button>
            </div>
          </div>
          <div class="qt-record-meta">
            <span class="qt-record-time"
              >🕐 {{ dayjs(record.updatedAt || record.time).format('YYYY-MM-DD HH:mm') }}</span
            >
            <span class="qt-relative-time">{{
              formatRelative(record.updatedAt || record.time)
            }}</span>
          </div>
          <div class="qt-note-text">{{ record.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
