<template>
  <div class="qt-tab-content">
    <div class="qt-progress-toolbar">
      <el-button type="primary" @click="emit('add')">📌 记录当前页面进度</el-button>
      <div class="qt-toolbar-right">
        <el-button v-if="records.length > 0" @click="emit('export')" title="导出为 Markdown">
          ⬇️ 导出
        </el-button>
        <el-button
          v-if="records.length > 0"
          type="danger"
          plain
          @click="emit('clearAll')"
          title="清空全部记录"
        >
          🧹 清空全部
        </el-button>
      </div>
    </div>

    <div class="qt-record-scroll">
      <div v-if="allTags.length > 0" class="rv-filter-bar">
        <TagFilter :tags="allTags" v-model="filterTag" />
      </div>

      <el-empty v-if="filteredRecords.length === 0" description="暂无记录" :image-size="80" />

      <div v-else class="qt-record-list">
        <el-card
          v-for="(record, index) in filteredRecords"
          :key="index"
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
              <el-button
                size="small"
                circle
                type="danger"
                plain
                @click="emit('delete', index)"
                title="删除"
              >
                🗑️
              </el-button>
            </div>
          </div>
          <div class="qt-record-meta">
            <el-tag size="small" type="info">
              🕐 {{ dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') }}
            </el-tag>
            <span class="qt-relative-time">{{ formatRelative(record.time) }}</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

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

const filterTag = ref([])
const allTags = computed(() => {
  const tagSet = new Set()
  for (const r of props.records) {
    const tags = getTagsById(r.docId)
    tags.forEach((t) => tagSet.add(t))
  }
  return Array.from(tagSet).sort()
})
const filteredRecords = computed(() => {
  if (!filterTag.value.length) return props.records
  return props.records.filter((r) => {
    const tags = getTagsById(r.docId)
    return filterTag.value.some((t) => tags.includes(t))
  })
})
</script>
