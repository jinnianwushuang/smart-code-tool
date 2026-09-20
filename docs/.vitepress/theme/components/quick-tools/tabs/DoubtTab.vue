<script setup>
import { ref, nextTick } from 'vue'
import { dayjs, formatRelative } from '../shared/utils'

const props = defineProps({
  records: { type: Array, required: true },
  sorted: { type: Array, required: true },
  draft: { type: String, required: true },
  editingId: { type: String, default: null },
})

const emit = defineEmits([
  'update:draft',
  'save',
  'edit',
  'resolve',
  'delete',
  'clearResolved',
  'clear-all',
  'export',
])

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
    <!-- 疑惑录入/编辑表单 -->
    <div class="qt-doubt-form">
      <textarea
        ref="textareaRef"
        :value="draft"
        class="qt-textarea"
        placeholder="请填写你的疑惑点..."
        rows="3"
        @input="emit('update:draft', $event.target.value)"
      ></textarea>
      <div class="qt-form-actions">
        <button class="qt-action-btn primary" :disabled="!draft.trim()" @click="emit('save')">
          {{ editingId ? '💾 更新疑惑' : '💾 保存疑惑' }}
        </button>
        <span v-if="editingId" class="qt-edit-hint">✏️ 正在编辑已有记录</span>
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

    <!-- 疑惑列表 -->
    <div class="qt-record-scroll">
      <div v-if="records.length === 0" class="qt-empty">暂无记录</div>

      <div v-else>
        <div class="qt-record-list">
          <div
            v-for="record in sorted"
            :key="record.id"
            :class="['qt-record-card', { resolved: record.resolved }]"
          >
            <div class="qt-record-header">
              <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
              <div class="qt-record-actions">
                <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
                <button
                  v-if="!record.resolved"
                  class="qt-icon-btn success"
                  @click="emit('resolve', record)"
                  title="标记为已解决"
                >
                  ✅
                </button>
                <button class="qt-icon-btn danger" @click="emit('delete', record.id)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
            <div class="qt-record-meta">
              <span class="qt-record-time"
                >🕐 {{ dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') }}</span
              >
              <span class="qt-relative-time">{{ formatRelative(record.time) }}</span>
              <span v-if="record.resolved" class="qt-resolved-tag">
                ✅ 已解决 {{ formatRelative(record.resolvedTime) }}
              </span>
            </div>
            <div class="qt-doubt-text">{{ record.doubt }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="records.some((r) => r.resolved)" class="qt-doubt-footer">
      <button class="qt-text-btn" @click="emit('clearResolved')">🧹 清除已解决记录</button>
    </div>
  </div>
</template>
