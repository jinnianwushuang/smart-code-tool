<script setup>
import { ref, computed } from 'vue'
import { dayjs, formatRelative, downloadText, exportTimestamp } from '../shared/utils'
import { REVIEW_RATING } from '../composables/useReviewScheduler'
import { getTagsById, getAllTags } from '../shared/useDocIdMapper'
import TagFilter from '../shared/TagFilter.vue'

const props = defineProps({
  review: { type: Object, required: true },
  navigateTo: { type: Function, required: true },
})

// ── 子视图切换 ──
const subView = ref('today') // today | blindspot | all | stats | settings
const blindSpotTab = ref('neverOpened') // neverOpened | neverLearned | neverReviewed

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
  if (filterGroup.value) {
    list = list.filter((r) => r.group === filterGroup.value)
  }
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

// ── 盲区当前列表（含标签筛选）──
const blindSpotTag = ref('')

const currentBlindSpotList = computed(() => {
  const bs = blindSpots.value
  let list = []
  if (blindSpotTab.value === 'neverOpened') list = bs.neverOpened
  else if (blindSpotTab.value === 'neverLearned') list = bs.neverLearned
  else list = bs.neverReviewed
  // 标签筛选
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

// ── 清空 ──
async function handleClearAll() {
  if (!confirm(`确定清空全部复习数据吗？此操作不可恢复。`)) return
  await props.review.clearAll()
}

// ── 通知开关 ──
async function handleNotificationToggle(enabled) {
  if (enabled) {
    if (typeof Notification === 'undefined') {
      alert('当前浏览器不支持通知功能')
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

// ── 状态标签 ──
function stateLabel(state) {
  const map = { new: '新文档', learning: '学习中', review: '复习中', relearning: '重新学习' }
  return map[state] || state
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

<template>
  <div class="qt-tab-content">
    <!-- 子视图切换栏 -->
    <div class="rv-sub-tabs">
      <button :class="['rv-sub-tab', { active: subView === 'today' }]" @click="subView = 'today'">
        今日待复习
        <span v-if="dueRecords.length" class="rv-sub-badge">{{ dueRecords.length }}</span>
      </button>
      <button
        :class="['rv-sub-tab', { active: subView === 'blindspot' }]"
        @click="subView = 'blindspot'"
      >
        文档盲区
        <span v-if="review.blindSpotTotal.value" class="rv-sub-badge warn">
          {{ review.blindSpotTotal.value }}
        </span>
      </button>
      <button :class="['rv-sub-tab', { active: subView === 'all' }]" @click="subView = 'all'">
        全部文档
      </button>
      <button :class="['rv-sub-tab', { active: subView === 'stats' }]" @click="subView = 'stats'">
        统计
      </button>
      <button
        :class="['rv-sub-tab', { active: subView === 'settings' }]"
        @click="subView = 'settings'"
      >
        设置
      </button>
    </div>

    <!-- ════════════ 今日待复习 ════════════ -->
    <div v-if="subView === 'today'" class="qt-record-scroll">
      <div v-if="!review.isReady.value" class="qt-empty">⏳ 正在初始化复习系统...</div>
      <div v-else-if="dueRecords.length === 0" class="qt-empty">
        <div class="rv-empty-icon">🎉</div>
        <div>今日无到期复习文档</div>
        <div class="rv-empty-hint">系统会在你阅读文档时自动安排复习计划</div>
      </div>
      <div v-else class="qt-record-list">
        <div
          v-for="record in dueRecords"
          :key="record.docId"
          class="qt-record-card rv-review-card"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <button class="qt-icon-btn nav" @click="navigateTo(record.url)" title="跳转到此页面">
                🔗
              </button>
            </div>
          </div>
          <div class="qt-record-meta">
            <span class="rv-state-tag">{{ stateLabel(record.state) }}</span>
            <span class="rv-due-info">{{ dueLabel(record.due) }}</span>
            <span class="rv-review-count">第 {{ record.reviewCount + 1 }} 次复习</span>
          </div>
          <div class="rv-rating-row">
            <button
              v-for="(info, key) in ratingLabels"
              :key="key"
              class="rv-rating-btn"
              :style="{ '--rating-color': info.color }"
              @click="handleReview(record.docId, key)"
            >
              {{ info.emoji }} {{ info.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════ 文档盲区 ════════════ -->
    <div v-if="subView === 'blindspot'" class="qt-record-scroll">
      <div class="rv-blindspot-tabs">
        <button
          :class="['rv-bs-tab', { active: blindSpotTab === 'neverOpened' }]"
          @click="blindSpotTab = 'neverOpened'"
        >
          从未打开 ({{ blindSpots.neverOpened.length }})
        </button>
        <button
          :class="['rv-bs-tab', { active: blindSpotTab === 'neverLearned' }]"
          @click="blindSpotTab = 'neverLearned'"
        >
          从未学习 ({{ blindSpots.neverLearned.length }})
        </button>
        <button
          :class="['rv-bs-tab', { active: blindSpotTab === 'neverReviewed' }]"
          @click="blindSpotTab = 'neverReviewed'"
        >
          从未复习 ({{ blindSpots.neverReviewed.length }})
        </button>
      </div>
      <div class="rv-filter-bar">
        <TagFilter :tags="allTags" v-model="blindSpotTag" />
      </div>

      <div v-if="currentBlindSpotList.length === 0" class="qt-empty">
        <div class="rv-empty-icon">✨</div>
        <div>没有盲区，太棒了！</div>
      </div>
      <div v-else class="qt-record-list">
        <div
          v-for="doc in currentBlindSpotList"
          :key="doc.id"
          class="qt-record-card"
          @click="navigateTo(doc.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="doc.title">{{ doc.title }}</span>
            <span class="rv-group-tag">{{ doc.group }}</span>
          </div>
          <div v-if="doc.accumulatedSeconds" class="qt-record-meta">
            <span class="rv-progress-hint">
              已阅读 {{ Math.round(doc.accumulatedSeconds / 60) }} 分钟
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════ 全部文档 ════════════ -->
    <div v-if="subView === 'all'" class="qt-record-scroll">
      <div class="rv-filter-bar">
        <input
          v-model="searchQuery"
          class="rv-search-input"
          type="text"
          placeholder="🔍 搜索文档..."
        />
        <select v-model="filterGroup" class="rv-group-select">
          <option value="">全部分组</option>
          <option v-for="g in allGroups" :key="g" :value="g">{{ g }}</option>
        </select>
        <TagFilter :tags="allTags" v-model="filterTag" />
      </div>

      <div v-if="filteredRecords.length === 0" class="qt-empty">暂无匹配文档</div>
      <div v-else class="qt-record-list">
        <div
          v-for="record in filteredRecords"
          :key="record.docId"
          :class="['qt-record-card', { resolved: record.isArchived }]"
          @click="navigateTo(record.url)"
        >
          <div class="qt-record-header">
            <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
            <div class="qt-record-actions" @click.stop>
              <button class="qt-icon-btn nav" @click="navigateTo(record.url)" title="跳转">
                🔗
              </button>
            </div>
          </div>
          <div class="qt-record-meta">
            <span class="rv-state-tag">{{ stateLabel(record.state) }}</span>
            <span v-if="record.due" class="rv-due-info">{{ dueLabel(record.due) }}</span>
            <span class="rv-review-count">复习 {{ record.reviewCount }} 次</span>
            <span v-if="record.group" class="rv-group-tag">{{ record.group }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════ 统计面板 ════════════ -->
    <div v-if="subView === 'stats'" class="qt-record-scroll">
      <div class="rv-stats-grid">
        <div class="rv-stat-card">
          <div class="rv-stat-num">{{ stats.totalDocs }}</div>
          <div class="rv-stat-label">全站文档</div>
        </div>
        <div class="rv-stat-card">
          <div class="rv-stat-num">{{ stats.learnedCount }}</div>
          <div class="rv-stat-label">已学习</div>
        </div>
        <div class="rv-stat-card">
          <div class="rv-stat-num">{{ stats.reviewedCount }}</div>
          <div class="rv-stat-label">已复习</div>
        </div>
        <div class="rv-stat-card highlight">
          <div class="rv-stat-num">{{ stats.coverageRate }}%</div>
          <div class="rv-stat-label">覆盖率</div>
        </div>
        <div class="rv-stat-card warn">
          <div class="rv-stat-num">{{ stats.dueCount }}</div>
          <div class="rv-stat-label">今日到期</div>
        </div>
        <div class="rv-stat-card">
          <div class="rv-stat-num">{{ review.blindSpotTotal.value }}</div>
          <div class="rv-stat-label">文档盲区</div>
        </div>
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
          <select
            :value="settings.algorithm"
            @change="review.updateSettings({ algorithm: $event.target.value })"
          >
            <option value="fsrs">FSRS（推荐，智能调度）</option>
            <option value="ebbinghaus">经典艾宾浩斯（固定间隔）</option>
          </select>
        </div>
        <div class="rv-setting-item">
          <label>目标保持率：{{ Math.round(settings.requestRetention * 100) }}%</label>
          <input
            type="range"
            min="0.7"
            max="0.99"
            step="0.01"
            :value="settings.requestRetention"
            @input="review.updateSettings({ requestRetention: parseFloat($event.target.value) })"
          />
        </div>
        <div class="rv-setting-item">
          <label>最大间隔（天）：{{ settings.maximumInterval }}</label>
          <input
            type="range"
            min="30"
            max="730"
            step="30"
            :value="settings.maximumInterval"
            @input="review.updateSettings({ maximumInterval: parseInt($event.target.value) })"
          />
        </div>
        <div class="rv-setting-item">
          <label>
            <input
              type="checkbox"
              :checked="settings.enableNotification"
              @change="handleNotificationToggle($event.target.checked)"
            />
            开启浏览器通知（到期复习提醒）
          </label>
        </div>

        <div class="rv-setting-divider"></div>

        <div class="rv-setting-actions">
          <button class="qt-action-btn ghost" @click="handleExport">⬇️ 导出数据</button>
          <button class="qt-action-btn ghost" @click="handleImportClick">📥 导入数据</button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleImportFile"
          />
          <button class="qt-action-btn ghost danger" @click="handleClearAll">🧹 清空全部</button>
        </div>
      </div>
    </div>
  </div>
</template>
