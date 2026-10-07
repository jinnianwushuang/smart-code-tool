<template>
  <div class="qt-tab-content">
    <!-- 笔记录入/编辑表单 -->
    <div class="qt-doubt-form">
      <div class="qt-rows-switch">
        <span class="qt-rows-label">行数</span>
        <el-button
          v-for="n in rowOptions"
          :key="n"
          :type="textareaRows === n ? 'primary' : 'default'"
          size="small"
          @click="textareaRows = n"
        >
          {{ n }}
        </el-button>
      </div>
      <el-input
        ref="textareaRef"
        :model-value="draft"
        type="textarea"
        :rows="textareaRows"
        placeholder="记录学习心得、总结、要点..."
        @update:model-value="emit('update:draft', $event)"
      />
      <div class="qt-form-actions">
        <el-button type="primary" :disabled="!draft?.trim()" @click="emit('save')">
          {{ editingId ? '💾 更新笔记' : '💾 保存笔记' }}
        </el-button>
        <span v-if="editingId" class="qt-edit-hint">✏️ 正在编辑已有笔记</span>
        <div class="qt-form-actions-right">
          <el-button v-if="records.length > 0" @click="emit('export')" title="导出为 Markdown">
            ⬇️ 导出
          </el-button>
          <el-button
            v-if="records.length > 0"
            type="danger"
            plain
            @click="emit('clear-all')"
            title="清空全部记录"
          >
            🧹 清空全部
          </el-button>
        </div>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="qt-record-scroll">
      <div v-if="allTags.length > 0" class="rv-filter-bar">
        <TagFilter :tags="allTags" v-model="filterTag" />
      </div>

      <el-empty v-if="filteredSorted.length === 0" description="暂无笔记" :image-size="80" />

      <div v-else class="qt-record-list">
        <el-card
          v-for="record in filteredSorted"
          :key="record.id"
          class="qt-record-card"
          shadow="hover"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <el-button size="small" circle @click="navigateTo(record.url)" title="跳转到此页面">
                🔗
              </el-button>
              <el-button size="small" circle @click="onEdit(record)" title="编辑">✏️</el-button>
              <el-button
                size="small"
                circle
                type="danger"
                plain
                @click="emit('delete', record.id)"
                title="删除"
              >
                🗑️
              </el-button>
            </div>
          </div>
          <div class="qt-record-meta">
            <el-tag size="small" type="info">
              🕐 {{ dayjs(record.updatedAt || record.time).format('YYYY-MM-DD HH:mm') }}
            </el-tag>
            <span class="qt-relative-time">
              {{ formatRelative(record.updatedAt || record.time) }}
            </span>
          </div>
          <div class="qt-note-text">{{ record.content }}</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { dayjs, formatRelative } from '../shared/utils'
import { getTagsById } from '../shared/useDocIdMapper'
import TagFilter from '../shared/TagFilter.vue'

const props = defineProps({
  records: { type: Array, required: true },
  sorted: { type: Array, required: true },
  draft: { type: String, required: true },
  editingId: { type: String, default: null },
  navigateTo: { type: Function, required: true },
})

const emit = defineEmits(['update:draft', 'save', 'edit', 'delete', 'export', 'clear-all'])

const textareaRef = ref(null)
const textareaRows = ref(5)
const rowOptions = [5, 10, 15, 20, 25, 30]

const onEdit = (record) => {
  emit('edit', record)
  nextTick(() => textareaRef.value?.focus())
}

const focusTextarea = () => {
  nextTick(() => textareaRef.value?.focus())
}

defineExpose({ focusTextarea })

// ── 标签筛选 ──
const filterTag = ref([])
const allTags = computed(() => {
  const tagSet = new Set()
  for (const r of props.records) {
    const tags = getTagsById(r.docId)
    tags.forEach((t) => tagSet.add(t))
  }
  return Array.from(tagSet).sort()
})
const filteredSorted = computed(() => {
  if (!filterTag.value.length) return props.sorted
  return props.sorted.filter((r) => {
    const tags = getTagsById(r.docId)
    return filterTag.value.some((t) => tags.includes(t))
  })
})
</script>
