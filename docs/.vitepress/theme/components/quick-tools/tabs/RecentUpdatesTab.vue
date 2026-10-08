<!--
  RecentUpdatesTab.vue — 近期更新 Tab

  架构层级：Tab 子组件（独立数据加载）
  职责：
    1. 展示近 30 天内有更新/新增的文档
    2. 头部日期快捷过滤：最多 8 个有更新的日期，显示 YYYY-MM-DD(N)
    3. 统计概览：近30天更新数 / 新增文档数 / 修改文档数 / 活跃天数
    4. 文档卡片显示：标题、新增/修改标签、分组、更新时间、创建时间、tags

  数据源：
    - 自包含 fetch doc-list.json（不依赖 review 系统）
    - doc-list.json 包含每个文档的 createdAt / updatedAt 时间戳
    - 时间戳由 gen-doc-list.mjs 构建时从 git log 提取

  Props：
    - navigateTo: Function — 文档导航方法
-->
<template>
  <div class="qt-tab-content">
    <el-scrollbar>
      <!-- 加载状态 -->
      <el-empty v-if="loading" description="⏳ 正在加载文档时间线..." :image-size="80" />

      <template v-else>
        <!-- 日期快捷过滤（头部） -->
        <div class="ru-day-bar">
          <el-button
            size="small"
            :type="!selectedDay ? 'primary' : 'default'"
            @click="selectedDay = ''"
          >
            全部 <span class="ru-day-count">{{ recentDocs.length }}</span>
          </el-button>
          <el-button
            v-for="day in topDays"
            :key="day"
            size="small"
            :type="selectedDay === day ? 'primary' : 'default'"
            @click="selectedDay = selectedDay === day ? '' : day"
          >
            {{ day }} <span class="ru-day-count">{{ docsByDay[day].length }}</span>
          </el-button>
        </div>

        <!-- 统计概览 -->
        <div class="ru-stats-grid">
          <el-card class="ru-stat-card" shadow="never">
            <div class="ru-stat-num">{{ recentDocs.length }}</div>
            <div class="ru-stat-label">近 30 天更新</div>
          </el-card>
          <el-card class="ru-stat-card new" shadow="never">
            <div class="ru-stat-num">{{ newDocs.length }}</div>
            <div class="ru-stat-label">新增文档</div>
          </el-card>
          <el-card class="ru-stat-card modified" shadow="never">
            <div class="ru-stat-num">{{ modifiedDocs.length }}</div>
            <div class="ru-stat-label">修改文档</div>
          </el-card>
          <el-card class="ru-stat-card highlight" shadow="never">
            <div class="ru-stat-num">{{ activeDays.length }}</div>
            <div class="ru-stat-label">活跃天数</div>
          </el-card>
        </div>

        <!-- 文档列表 -->
        <div v-if="displayDocs.length === 0" class="ru-empty">
          <el-empty description="近 30 天内无文档更新" :image-size="80" />
        </div>
        <div v-else class="qt-record-list">
          <div class="qt-result-count">
            {{
              selectedDay
                ? `${selectedDay} 共 ${displayDocs.length} 篇`
                : `共 ${displayDocs.length} 篇近期更新`
            }}
          </div>
          <el-card
            v-for="doc in displayDocs"
            :key="doc.id"
            class="qt-record-card ru-doc-card"
            shadow="hover"
            @click="navigateTo(doc.url)"
          >
            <div class="qt-record-header">
              <span class="qt-record-title" :title="doc.title">{{ doc.title }}</span>
              <div class="ru-doc-badges">
                <el-tag v-if="isNew(doc)" size="small" type="success" effect="dark">新增</el-tag>
                <el-tag v-else size="small" type="warning" effect="plain">修改</el-tag>
                <el-tag size="small" type="info">{{ doc.group }}</el-tag>
              </div>
            </div>
            <div class="qt-record-meta">
              <span class="ru-time-label"> 📅 更新于 {{ doc.updatedAt }} </span>
              <span
                v-if="!isNew(doc) && doc.createdAt"
                class="ru-created-label"
                :title="'创建时间'"
              >
                🕐 创建于 {{ doc.createdAt }}
              </span>
            </div>
            <div v-if="doc.tags && doc.tags.length" class="rv-card-tags">
              <el-tag
                v-for="tag in doc.tags"
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
      </template>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DOC_LIST_URL } from '../shared/constants'

const props = defineProps({
  navigateTo: { type: Function, required: true },
})

const loading = ref(true)
const allDocs = ref([])
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

// ── 30 天前的时间戳 ──
const thirtyDaysAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  d.setHours(0, 0, 0, 0)
  return d
}

// ── 近 30 天有更新的文档 ──
const recentDocs = computed(() => {
  const cutoff = thirtyDaysAgo()
  return allDocs.value
    .filter((doc) => {
      if (!doc.updatedAt) return false
      return new Date(doc.updatedAt) >= cutoff
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})

// ── 新增 vs 修改 ──
const newDocs = computed(() => recentDocs.value.filter(isNew))
const modifiedDocs = computed(() => recentDocs.value.filter((d) => !isNew(d)))

function isNew(doc) {
  return doc.createdAt === doc.updatedAt
}

// ── 按天分组 ──
const docsByDay = computed(() => {
  const map = {}
  for (const doc of recentDocs.value) {
    const day = doc.updatedAt?.slice(0, 10)
    if (!day) continue
    if (!map[day]) map[day] = []
    map[day].push(doc)
  }
  return map
})

// ── 有更新的日期列表（倒序，今天在前） ──
const activeDays = computed(() => {
  return Object.keys(docsByDay.value).sort((a, b) => b.localeCompare(a))
})

// ── 头部快捷日期按钮（最多 8 天） ──
const topDays = computed(() => activeDays.value.slice(0, 8))

// ── 当前展示的文档（按选中日期过滤） ──
const displayDocs = computed(() => {
  if (!selectedDay.value) return recentDocs.value
  return docsByDay.value[selectedDay.value] || []
})

// ── 加载数据 ──
onMounted(async () => {
  try {
    const res = await fetch(DOC_LIST_URL)
    if (!res.ok) throw new Error(`Failed to fetch doc-list: ${res.status}`)
    const data = await res.json()
    allDocs.value = Array.isArray(data) ? data : data.docs || []
  } catch (err) {
    console.warn('[RecentUpdates] 加载文档清单失败:', err.message)
  } finally {
    loading.value = false
  }
})
</script>
