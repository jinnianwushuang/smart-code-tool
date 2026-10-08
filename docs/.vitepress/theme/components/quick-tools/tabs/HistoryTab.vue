<!--
  HistoryTab.vue — 浏览历史 Tab

  架构层级：Tab 子组件
  职责：
    1. 展示页面浏览历史（倒序，最新在前）
    2. 头部日期快捷过滤：最多 8 个有记录的日期，显示 YYYY-MM-DD(N)
    3. 统计概览：总记录数 / 今日浏览数
    4. 每条记录显示：标题、URL、进入时间、文档 tags
    5. 支持清空全部历史

  Props：
    - history: Object — useBrowseHistory() composable 实例
    - navigateTo: Function — 文档导航方法
-->
<template>
  <div class="qt-tab-content">
    <el-scrollbar>
      <!-- 日期快捷过滤（头部） -->
      <div class="ru-day-bar">
        <el-button
          size="small"
          :type="!selectedDay ? 'primary' : 'default'"
          @click="selectedDay = ''"
        >
          全部 <span class="ru-day-count">({{ history.totalCount.value }})</span>
        </el-button>
        <el-button
          v-for="day in history.topDays.value"
          :key="day"
          size="small"
          :type="selectedDay === day ? 'primary' : 'default'"
          @click="selectedDay = selectedDay === day ? '' : day"
        >
          {{ day }} <span class="ru-day-count">({{ history.recordsByDay.value[day].length }})</span>
        </el-button>
      </div>

      <!-- 统计概览 -->
      <div class="rh-stats">
        <el-card class="rh-stat-card" shadow="never">
          <div class="rh-stat-num">{{ history.totalCount.value }}</div>
          <div class="rh-stat-label">总浏览</div>
        </el-card>
        <el-card class="rh-stat-card today" shadow="never">
          <div class="rh-stat-num">{{ history.todayCount.value }}</div>
          <div class="rh-stat-label">今日浏览</div>
        </el-card>
        <el-card class="rh-stat-card days" shadow="never">
          <div class="rh-stat-num">{{ history.activeDays.value.length }}</div>
          <div class="rh-stat-label">活跃天数</div>
        </el-card>
      </div>

      <!-- 规则提示 -->
      <div class="rh-hint">💡 页面停留不足 1 分钟不记录，快速切换自动合并</div>

      <!-- 历史列表 -->
      <div v-if="displayRecords.length === 0" class="rh-empty">
        <el-empty description="暂无浏览记录" :image-size="80" />
      </div>
      <div v-else class="qt-record-list">
        <div class="qt-result-count">
          <span>{{
            selectedDay
              ? `${selectedDay} 共 ${displayRecords.length} 条`
              : `共 ${displayRecords.length} 条浏览记录`
          }}</span>
          <el-button
            v-if="history.totalCount.value > 0"
            type="danger"
            text
            size="small"
            @click="handleClear"
          >
            🧹 清空全部
          </el-button>
        </div>
        <el-card
          v-for="record in displayRecords"
          :key="record.visitedAt + record.url"
          class="qt-record-card rh-history-card"
          shadow="hover"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <span class="rh-visit-time">{{ formatVisitTime(record.visitedAt) }}</span>
          </div>
          <div class="qt-record-meta">
            <span class="rh-url-label" :title="record.url">{{ record.url }}</span>
          </div>
          <div v-if="getDocTags(record).length" class="rv-card-tags">
            <el-tag
              v-for="tag in getDocTags(record)"
              :key="tag"
              size="small"
              :color="tagColor(tag)"
              effect="dark"
              class="rv-card-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTagsById, getDocIdByUrlSync } from '../shared/useDocIdMapper'
import { formatTimestamp } from '../shared/utils'

const props = defineProps({
  history: { type: Object, required: true },
  navigateTo: { type: Function, required: true },
})

const selectedDay = ref('')

// ── 标签颜色 ──
const tagColors = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#00bcd4',
  '#9c27b0',
  '#ff9800',
]
function tagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return tagColors[Math.abs(hash) % tagColors.length]
}

// ── 预计算每条记录的 tags（getDocIdByUrl 是 async，不能在模板内直接调用） ──
const recordTagsMap = computed(() => {
  const map = new Map()
  for (const record of props.history.records.value) {
    const docId = getDocIdByUrlSync(record.url)
    const tags = docId ? (getTagsById(docId) || []) : []
    map.set(record.visitedAt + record.url, tags)
  }
  return map
})
function getDocTags(record) {
  return recordTagsMap.value.get(record.visitedAt + record.url) || []
}

// ── 格式化访问时间（转本地时间） ──
function formatVisitTime(isoStr) {
  return formatTimestamp(isoStr)
}

// ── 当前展示的記錄（按選中日期過濾） ──
const displayRecords = computed(() => {
  if (!selectedDay.value) return props.history.records.value
  return props.history.recordsByDay.value[selectedDay.value] || []
})

// ── 清空全部 ──
function handleClear() {
  props.history.clearAll()
  selectedDay.value = ''
}
</script>
