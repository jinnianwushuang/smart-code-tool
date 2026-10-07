<template>
  <div class="qt-tab-content">
    <!-- 子视图切换 -->
    <el-tabs v-model="subView" class="rv-sub-tabs">
      <el-tab-pane name="today">
        <template #label>
          <span>今日待复习</span>
          <el-badge v-if="dueRecords.length" :value="dueRecords.length" type="danger" />
        </template>
      </el-tab-pane>
      <el-tab-pane name="blindspot">
        <template #label>
          <span>文档盲区</span>
          <el-badge
            v-if="review.blindSpotTotal.value"
            :value="review.blindSpotTotal.value"
            type="warning"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane label="全部文档" name="all" />
      <el-tab-pane label="统计" name="stats" />
      <el-tab-pane label="设置" name="settings" />
    </el-tabs>

    <!-- ════════════ 今日待复习 ════════════ -->
    <div v-if="subView === 'today'" class="qt-record-scroll">
      <el-empty
        v-if="!review.isReady.value"
        description="⏳ 正在初始化复习系统..."
        :image-size="80"
      />
      <el-empty v-else-if="dueRecords.length === 0" :image-size="80">
        <template #description>
          <div style="text-align: center">
            <div style="font-size: 28px; margin-bottom: 8px">🎉</div>
            <div>今日无到期复习文档</div>
            <div style="color: var(--el-text-color-placeholder); font-size: 13px; margin-top: 4px">
              系统会在你阅读文档时自动安排复习计划
            </div>
          </div>
        </template>
      </el-empty>
      <div v-else class="qt-record-list">
        <el-card
          v-for="record in dueRecords"
          :key="record.docId"
          class="qt-record-card rv-review-card"
          shadow="hover"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <el-button size="small" circle @click="navigateTo(record.url)" title="跳转到此页面">
                🔗
              </el-button>
            </div>
          </div>
          <div class="qt-record-meta">
            <el-tag :type="stateType(record.state)" size="small">
              {{ stateLabel(record.state) }}
            </el-tag>
            <span class="rv-due-info">{{ dueLabel(record.due) }}</span>
            <span class="rv-review-count">第 {{ record.reviewCount + 1 }} 次复习</span>
          </div>
          <div class="rv-rating-row">
            <el-button
              v-for="(info, key) in ratingLabels"
              :key="key"
              class="rv-rating-btn"
              :style="{ '--rating-color': info.color, borderColor: info.color }"
              @click="handleReview(record.docId, key)"
            >
              {{ info.emoji }} {{ info.text }}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- ════════════ 文档盲区 ════════════ -->
    <div v-if="subView === 'blindspot'" class="qt-record-scroll">
      <el-radio-group v-model="blindSpotTab" class="rv-bs-radio-group">
        <el-radio-button value="neverOpened">
          从未打开 ({{ blindSpots.neverOpened.length }})
        </el-radio-button>
        <el-radio-button value="neverLearned">
          从未学习 ({{ blindSpots.neverLearned.length }})
        </el-radio-button>
        <el-radio-button value="neverReviewed">
          从未复习 ({{ blindSpots.neverReviewed.length }})
        </el-radio-button>
      </el-radio-group>

      <div class="rv-filter-bar">
        <TagFilter :tags="allTags" v-model="blindSpotTag" />
      </div>

      <el-empty
        v-if="currentBlindSpotList.length === 0"
        description="没有盲区，太棒了！✨"
        :image-size="80"
      />
      <div v-else class="qt-record-list">
        <el-card
          v-for="doc in currentBlindSpotList"
          :key="doc.id"
          class="qt-record-card"
          shadow="hover"
          @click="navigateTo(doc.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="doc.title">{{ doc.title }}</span>
            <el-tag size="small" type="info">{{ doc.group }}</el-tag>
          </div>
          <div v-if="doc.accumulatedSeconds" class="qt-record-meta">
            <span class="rv-progress-hint">
              已阅读 {{ Math.round(doc.accumulatedSeconds / 60) }} 分钟
            </span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- ════════════ 全部文档 ════════════ -->
    <div v-if="subView === 'all'" class="qt-record-scroll">
      <div class="rv-filter-bar rv-filter-bar-multi">
        <el-input
          v-model="searchQuery"
          placeholder="🔍 搜索文档..."
          clearable
          style="width: 200px"
        />
        <el-select v-model="filterGroup" placeholder="全部分组" clearable style="width: 160px">
          <el-option v-for="g in allGroups" :key="g" :label="g" :value="g" />
        </el-select>
        <TagFilter :tags="allTags" v-model="filterTag" />
      </div>

      <el-empty v-if="filteredRecords.length === 0" description="暂无匹配文档" :image-size="80" />
      <div v-else class="qt-record-list">
        <el-card
          v-for="record in filteredRecords"
          :key="record.docId"
          :class="['qt-record-card', { resolved: record.isArchived }]"
          shadow="hover"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <el-button size="small" circle @click="navigateTo(record.url)" title="跳转"
                >🔗</el-button
              >
            </div>
          </div>
          <div class="qt-record-meta">
            <el-tag :type="stateType(record.state)" size="small">
              {{ stateLabel(record.state) }}
            </el-tag>
            <span v-if="record.due" class="rv-due-info">{{ dueLabel(record.due) }}</span>
            <span class="rv-review-count">复习 {{ record.reviewCount }} 次</span>
            <el-tag v-if="record.group" size="small" type="info">{{ record.group }}</el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <!-- ════════════ 统计面板 ════════════ -->
    <div v-if="subView === 'stats'" class="qt-record-scroll">
      <div class="rv-stats-grid">
        <el-card class="rv-stat-card" shadow="never">
          <div class="rv-stat-num">{{ stats.totalDocs }}</div>
          <div class="rv-stat-label">全站文档</div>
        </el-card>
        <el-card class="rv-stat-card" shadow="never">
          <div class="rv-stat-num">{{ stats.learnedCount }}</div>
          <div class="rv-stat-label">已学习</div>
        </el-card>
        <el-card class="rv-stat-card" shadow="never">
          <div class="rv-stat-num">{{ stats.reviewedCount }}</div>
          <div class="rv-stat-label">已复习</div>
        </el-card>
        <el-card class="rv-stat-card highlight" shadow="never">
          <div class="rv-stat-num">{{ stats.coverageRate }}%</div>
          <div class="rv-stat-label">覆盖率</div>
        </el-card>
        <el-card class="rv-stat-card warn" shadow="never">
          <div class="rv-stat-num">{{ stats.dueCount }}</div>
          <div class="rv-stat-label">今日到期</div>
        </el-card>
        <el-card class="rv-stat-card" shadow="never">
          <div class="rv-stat-num">{{ review.blindSpotTotal.value }}</div>
          <div class="rv-stat-label">文档盲区</div>
        </el-card>
      </div>

      <!-- 标签分布图 -->
      <div v-if="tagDistribution.length" class="rv-tag-dist">
        <h4 class="rv-tag-dist-title">📊 标签覆盖分布</h4>
        <div class="rv-tag-dist-list">
          <div v-for="item in tagDistribution" :key="item.tag" class="rv-tag-dist-row">
            <span class="rv-tag-dist-name">{{ item.tag }}</span>
            <div class="rv-tag-dist-bars">
              <div
                class="rv-tag-bar reviewed"
                :style="{ width: (item.reviewed / item.total) * 100 + '%' }"
                :title="`已复习 ${item.reviewed}`"
              ></div>
              <div
                class="rv-tag-bar learned"
                :style="{ width: ((item.learned - item.reviewed) / item.total) * 100 + '%' }"
                :title="`已学习 ${item.learned - item.reviewed}`"
              ></div>
            </div>
            <span class="rv-tag-dist-count">{{ item.learned }}/{{ item.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════ 设置 ════════════ -->
    <div v-if="subView === 'settings'" class="qt-record-scroll">
      <div class="rv-settings">
        <div class="rv-setting-item">
          <label>调度算法</label>
          <el-select
            :model-value="settings.algorithm"
            @update:model-value="review.updateSettings({ algorithm: $event })"
            style="width: 280px"
          >
            <el-option value="fsrs" label="FSRS（推荐，智能调度）" />
            <el-option value="ebbinghaus" label="经典艾宾浩斯（固定间隔）" />
          </el-select>
        </div>
        <div class="rv-setting-item">
          <label>目标保持率：{{ Math.round(settings.requestRetention * 100) }}%</label>
          <el-slider
            :model-value="settings.requestRetention * 100"
            :min="70"
            :max="99"
            :step="1"
            @update:model-value="review.updateSettings({ requestRetention: $event / 100 })"
            style="max-width: 300px"
          />
        </div>
        <div class="rv-setting-item">
          <label>最大间隔（天）：{{ settings.maximumInterval }}</label>
          <el-slider
            :model-value="settings.maximumInterval"
            :min="30"
            :max="730"
            :step="30"
            @update:model-value="review.updateSettings({ maximumInterval: $event })"
            style="max-width: 300px"
          />
        </div>
        <div class="rv-setting-item">
          <label>浏览器通知（到期复习提醒）</label>
          <el-switch
            :model-value="settings.enableNotification"
            @update:model-value="handleNotificationToggle($event)"
          />
        </div>

        <el-divider />

        <div class="rv-setting-actions">
          <el-button @click="handleExport">⬇️ 导出数据</el-button>
          <el-button @click="handleImportClick">📥 导入数据</el-button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleImportFile"
          />
          <el-button type="danger" plain @click="handleClearAll">🧹 清空全部</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { dayjs, formatRelative, downloadText, exportTimestamp } from '../shared/utils'
import { REVIEW_RATING } from '../composables/useReviewScheduler'
import { useLearningStreak } from '../composables/useLearningStreak'
import { getTagsById, getAllTags } from '../shared/useDocIdMapper'
import TagFilter from '../shared/TagFilter.vue'

const { recordToday: recordLearning } = useLearningStreak()

const props = defineProps({
  review: { type: Object, required: true },
  navigateTo: { type: Function, required: true },
})

// ── 子视图切换 ──
const subView = ref('today')
const blindSpotTab = ref('neverOpened')

// ── 从 review 实例解构常用属性 ──
const dueRecords = computed(() => props.review.dueRecords.value)
const blindSpots = computed(() => props.review.blindSpots.value)
const stats = computed(() => props.review.stats.value)
const allRecords = computed(() => props.review.records.value)
const settings = computed(() => props.review.settings.value)

// ── 全部文档视图：搜索/筛选 ──
const searchQuery = ref('')
const filterGroup = ref('')
const filterTag = ref('')

const allTags = computed(() => getAllTags())

const allGroups = computed(() => {
  const groups = new Set(allRecords.value.map((r) => r.group).filter(Boolean))
  return Array.from(groups).sort()
})

const filteredRecords = computed(() => {
  let list = allRecords.value.filter((r) => !r.isArchived)
  if (filterGroup.value) list = list.filter((r) => r.group === filterGroup.value)
  if (filterTag.value) {
    list = list.filter((r) => {
      const tags = getTagsById(r.docId)
      return tags.includes(filterTag.value)
    })
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((r) => r.title.toLowerCase().includes(q))
  }
  return list.sort((a, b) => {
    if (a.due && b.due) return new Date(a.due) - new Date(b.due)
    return (b.updatedAt || '') > (a.updatedAt || '') ? 1 : -1
  })
})

// ── 盲区 ──
const blindSpotTag = ref('')

const currentBlindSpotList = computed(() => {
  const bs = blindSpots.value
  let list = []
  if (blindSpotTab.value === 'neverOpened') list = bs.neverOpened
  else if (blindSpotTab.value === 'neverLearned') list = bs.neverLearned
  else list = bs.neverReviewed
  if (blindSpotTag.value) {
    list = list.filter((doc) => {
      const tags = getTagsById(doc.id)
      return tags.includes(blindSpotTag.value)
    })
  }
  return list
})

// ── 标签分布统计 ──
const tagDistribution = computed(() => {
  const map = {}
  for (const record of allRecords.value) {
    if (record.isArchived) continue
    const tags = getTagsById(record.docId)
    for (const tag of tags) {
      if (!map[tag]) map[tag] = { total: 0, learned: 0, reviewed: 0 }
      map[tag].total++
      if (record.autoLearnedAt) map[tag].learned++
      if (record.reviewCount > 0) map[tag].reviewed++
    }
  }
  return Object.entries(map)
    .map(([tag, counts]) => ({ tag, ...counts }))
    .sort((a, b) => b.total - a.total)
})

// ── 评分操作 ──
const ratingLabels = {
  [REVIEW_RATING.FORGOT]: { emoji: '😟', text: '忘了', color: '#ef4444' },
  [REVIEW_RATING.HARD]: { emoji: '😐', text: '有印象', color: '#f59e0b' },
  [REVIEW_RATING.GOOD]: { emoji: '🙂', text: '记得', color: '#22c55e' },
  [REVIEW_RATING.EASY]: { emoji: '😎', text: '秒记', color: '#3b82f6' },
}

async function handleReview(docId, rating) {
  await props.review.submitReview(docId, rating)
  recordLearning('review')
}

// ── 导入/导出 ──
const fileInput = ref(null)

async function handleExport() {
  const data = await props.review.exportData()
  const json = JSON.stringify(data, null, 2)
  downloadText(`review-data_${exportTimestamp()}.json`, json, 'application/json;charset=utf-8')
}

function handleImportClick() {
  fileInput.value?.click()
}

async function handleImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const result = await props.review.importData(data)
    alert(`导入成功！共导入 ${result.imported} 条记录`)
  } catch (err) {
    alert(`导入失败：${err.message}`)
  }
  event.target.value = ''
}

async function handleClearAll() {
  if (!confirm(`确定清空全部复习数据吗？此操作不可恢复。`)) return
  await props.review.clearAll()
}

async function handleNotificationToggle(enabled) {
  if (enabled) {
    if (typeof Notification === 'undefined') {
      alert('当前浏览器不支持通知 functionality')
      return
    }
    if (Notification.permission === 'denied') {
      alert('通知权限已被拒绝，请在浏览器设置中手动开启')
      return
    }
    const result = await Notification.requestPermission()
    if (result !== 'granted') {
      alert('未获得通知权限，无法开启提醒')
      return
    }
  }
  await props.review.updateSettings({ enableNotification: enabled })
}

function stateLabel(state) {
  const map = { new: '新文档', learning: '学习中', review: '复习中', relearning: '重新学习' }
  return map[state] || state
}

function stateType(state) {
  const map = { new: 'info', learning: 'warning', review: 'success', relearning: 'danger' }
  return map[state] || 'info'
}

function dueLabel(due) {
  if (!due) return ''
  const d = dayjs(due)
  const now = dayjs()
  if (d.isBefore(now)) return `逾期 ${now.diff(d, 'day')} 天`
  if (d.isSame(now, 'day')) return '今天到期'
  return `${d.fromNow()}`
}
</script>
