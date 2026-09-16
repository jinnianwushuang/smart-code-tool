<script setup>
import { ref, nextTick } from 'vue'
import { dayjs, formatRelative } from './utils'

const props = defineProps({
  records: { type: Array, required: true },
  sorted: { type: Array, required: true },
  draft: { type: String, required: true },
  editingId: { type: String, default: null },
})

const emit = defineEmits(['update:draft', 'save', 'edit', 'delete'])

const textareaRef = ref(null)

const onEdit = (record) => {
  emit('edit', record)
  nextTick(() => textareaRef.value?.focus())
}

const focusTextarea = () => {
  nextTick(() => textareaRef.value?.focus())
}

defineExpose({ focusTextarea })
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
      </div>
    </div>

    <!-- 笔记列表 -->
    <div v-if="records.length === 0" class="qt-empty">暂无笔记</div>

    <div v-else class="qt-record-list">
      <div v-for="record in sorted" :key="record.id" class="qt-record-card">
        <div class="qt-record-header">
          <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
          <div class="qt-record-actions">
            <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
            <button class="qt-icon-btn" @click="onEdit(record)" title="编辑">✏️</button>
            <button class="qt-icon-btn danger" @click="emit('delete', record.id)" title="删除">
              🗑️
            </button>
          </div>
        </div>
        <div class="qt-record-meta">
          <span class="qt-record-time">🕐 {{ dayjs(record.updatedAt || record.time).format('YYYY-MM-DD HH:mm') }}</span>
          <span class="qt-relative-time">{{ formatRelative(record.updatedAt || record.time) }}</span>
        </div>
        <div class="qt-note-text">{{ record.content }}</div>
      </div>
    </div>
  </div>
</template>
