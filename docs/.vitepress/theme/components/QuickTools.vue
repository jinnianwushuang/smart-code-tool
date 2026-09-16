<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// ==================== 存储键名 ====================
const PROGRESS_KEY = 'quick-tools-progress'
const DOUBT_KEY = 'quick-tools-doubts'
const NOTE_KEY = 'quick-tools-notes'
const READING_TIME_KEY = 'quick-tools-reading-time'

// ==================== 存储工具 ====================
const readStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

const writeStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// ==================== 响应式状态 ====================
const isOpen = ref(false)
const activeTab = ref('progress') // 'progress' | 'doubt' | 'note'
const progressRecords = ref([])
const doubtRecords = ref([])
const noteRecords = ref([])

// 疑惑表单状态
const doubtDraft = ref('')
const doubtTitle = ref('')
const doubtUrl = ref('')
const editingDoubtId = ref(null)

// 笔记表单状态
const noteDraft = ref('')
const editingNoteId = ref(null)

const textareaRef = ref(null)
const noteTextareaRef = ref(null)

// ==================== 相对时间格式化 ====================
const formatRelative = (time) => {
  if (!time) return ''
  const d = dayjs(time)
  const diffMin = dayjs().diff(d, 'minute')
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffHour = dayjs().diff(d, 'hour')
  if (diffHour < 24) return `${diffHour} 小时前`
  const diffDay = dayjs().diff(d, 'day')
  if (diffDay < 30) return `${diffDay} 天前`
  const diffMonth = dayjs().diff(d, 'month')
  if (diffMonth < 12) return `${diffMonth} 个月前`
  return d.format('YYYY-MM-DD')
}

// 每分钟刷新相对时间
const nowTick = ref(Date.now())
let tickTimer = null

// ==================== 计算属性 ====================
const totalCount = computed(
  () => progressRecords.value.length + doubtRecords.value.length + noteRecords.value.length,
)

const unresolvedDoubtCount = computed(() => doubtRecords.value.filter((r) => !r.resolved).length)

// ==================== 当前页面信息（响应式跟踪） ====================
const currentUrl = ref('')
const currentTitle = ref('')

const refreshCurrentPage = () => {
  if (typeof window === 'undefined') return
  currentUrl.value = window.location.href
  currentTitle.value = document.title || ''
}

const sortedDoubtRecords = computed(() => {
  return [...doubtRecords.value].sort((a, b) => new Date(b.time) - new Date(a.time))
})

const sortedNoteRecords = computed(() => {
  return [...noteRecords.value].sort(
    (a, b) => new Date(b.updatedAt || b.time) - new Date(a.updatedAt || a.time),
  )
})

// ==================== 学习计时 ====================
const todaySeconds = ref(0)
let readingTimer = null
let idleTimer = null
let isIdle = false
const IDLE_TIMEOUT = 120_000 // 2分钟无操作视为离开

const getTodayKey = () => dayjs().format('YYYY-MM-DD')

const loadTodayReading = () => {
  const data = readStorage(READING_TIME_KEY, {})
  todaySeconds.value = data[getTodayKey()] || 0
}

const saveTodayReading = () => {
  const data = readStorage(READING_TIME_KEY, {})
  data[getTodayKey()] = todaySeconds.value
  // 只保留最近 30 天
  const keys = Object.keys(data).sort()
  if (keys.length > 30) {
    keys.slice(0, keys.length - 30).forEach((k) => delete data[k])
  }
  writeStorage(READING_TIME_KEY, data)
}

const startReadingTimer = () => {
  stopReadingTimer()
  readingTimer = setInterval(() => {
    if (!isIdle && document.visibilityState === 'visible') {
      todaySeconds.value++
      // 每 30 秒持久化一次
      if (todaySeconds.value % 30 === 0) saveTodayReading()
    }
  }, 1000)
}

const stopReadingTimer = () => {
  if (readingTimer) {
    clearInterval(readingTimer)
    readingTimer = null
  }
}

const resetIdle = () => {
  isIdle = false
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    isIdle = true
  }, IDLE_TIMEOUT)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    resetIdle()
  } else {
    isIdle = true
    saveTodayReading()
  }
}

const formatReadingTime = computed(() => {
  const s = todaySeconds.value
  if (s < 60) return `${s}秒`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}分钟`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}小时${rm}分`
})

// ==================== 面板开关 ====================
const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    activeTab.value = 'progress'
  }
}

const closePanel = () => {
  isOpen.value = false
}

// ==================== 记忆进度 ====================
const addProgress = () => {
  refreshCurrentPage()
  const record = {
    url: currentUrl.value,
    title: currentTitle.value,
    time: new Date().toISOString(),
  }
  progressRecords.value.unshift(record)
  // 只保留最近 15 条
  if (progressRecords.value.length > 15) {
    progressRecords.value = progressRecords.value.slice(0, 15)
  }
  writeStorage(PROGRESS_KEY, progressRecords.value)
}

const deleteProgress = (index) => {
  progressRecords.value.splice(index, 1)
  writeStorage(PROGRESS_KEY, progressRecords.value)
}

// ==================== 记忆疑惑 ====================
const initDoubtForm = () => {
  refreshCurrentPage()
  const existing = doubtRecords.value.find((r) => r.url === currentUrl.value)
  if (existing) {
    editingDoubtId.value = existing.id
    doubtDraft.value = existing.doubt
    doubtTitle.value = existing.title
    doubtUrl.value = existing.url
  } else {
    editingDoubtId.value = null
    doubtDraft.value = ''
    doubtTitle.value = currentTitle.value
    doubtUrl.value = currentUrl.value
  }
}

const switchToDoubt = () => {
  activeTab.value = 'doubt'
  initDoubtForm()
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const saveDoubt = () => {
  if (!doubtDraft.value.trim()) return
  refreshCurrentPage()

  if (editingDoubtId.value) {
    const record = doubtRecords.value.find((r) => r.id === editingDoubtId.value)
    if (record) {
      record.doubt = doubtDraft.value.trim()
      record.title = doubtTitle.value
      record.url = doubtUrl.value
    }
  } else {
    // 检查同链接是否已存在
    const existingIndex = doubtRecords.value.findIndex((r) => r.url === currentUrl.value)
    if (existingIndex !== -1) {
      doubtRecords.value[existingIndex].doubt = doubtDraft.value.trim()
      doubtRecords.value[existingIndex].title = currentTitle.value
    } else {
      if (doubtRecords.value.length >= 30) {
        alert('疑惑记录已达上限（30条），请先删除部分记录')
        return
      }
      doubtRecords.value.push({
        id: Date.now().toString(),
        url: currentUrl.value,
        title: currentTitle.value,
        time: new Date().toISOString(),
        doubt: doubtDraft.value.trim(),
        resolved: false,
        resolvedTime: null,
      })
    }
  }

  writeStorage(DOUBT_KEY, doubtRecords.value)
  doubtDraft.value = ''
  editingDoubtId.value = null
  initDoubtForm()
}

const editDoubt = (record) => {
  editingDoubtId.value = record.id
  doubtDraft.value = record.doubt
  doubtTitle.value = record.title
  doubtUrl.value = record.url
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const resolveDoubt = (record) => {
  record.resolved = true
  record.resolvedTime = new Date().toISOString()
  writeStorage(DOUBT_KEY, doubtRecords.value)
}

const deleteDoubt = (id) => {
  doubtRecords.value = doubtRecords.value.filter((r) => r.id !== id)
  writeStorage(DOUBT_KEY, doubtRecords.value)
  if (editingDoubtId.value === id) {
    editingDoubtId.value = null
    doubtDraft.value = ''
    initDoubtForm()
  }
}

// ==================== 清空 ====================
const clearAllProgress = () => {
  progressRecords.value = []
  writeStorage(PROGRESS_KEY, progressRecords.value)
}

const clearResolvedDoubts = () => {
  doubtRecords.value = doubtRecords.value.filter((r) => !r.resolved)
  writeStorage(DOUBT_KEY, doubtRecords.value)
}

// ==================== 页面笔记 ====================
const initNoteForm = () => {
  refreshCurrentPage()
  const existing = noteRecords.value.find((r) => r.url === currentUrl.value)
  if (existing) {
    editingNoteId.value = existing.id
    noteDraft.value = existing.content
  } else {
    editingNoteId.value = null
    noteDraft.value = ''
  }
}

const switchToNote = () => {
  activeTab.value = 'note'
  initNoteForm()
  nextTick(() => {
    noteTextareaRef.value?.focus()
  })
}

const saveNote = () => {
  if (!noteDraft.value.trim()) return
  refreshCurrentPage()

  if (editingNoteId.value) {
    const record = noteRecords.value.find((r) => r.id === editingNoteId.value)
    if (record) {
      record.content = noteDraft.value.trim()
      record.updatedAt = new Date().toISOString()
    }
  } else {
    const existingIndex = noteRecords.value.findIndex((r) => r.url === currentUrl.value)
    if (existingIndex !== -1) {
      noteRecords.value[existingIndex].content = noteDraft.value.trim()
      noteRecords.value[existingIndex].updatedAt = new Date().toISOString()
    } else {
      if (noteRecords.value.length >= 30) {
        alert('笔记记录已达上限（30条），请先删除部分记录')
        return
      }
      noteRecords.value.push({
        id: Date.now().toString(),
        url: currentUrl.value,
        title: currentTitle.value,
        content: noteDraft.value.trim(),
        time: new Date().toISOString(),
        updatedAt: null,
      })
    }
  }

  writeStorage(NOTE_KEY, noteRecords.value)
  noteDraft.value = ''
  editingNoteId.value = null
  initNoteForm()
}

const editNote = (record) => {
  editingNoteId.value = record.id
  noteDraft.value = record.content
  nextTick(() => {
    noteTextareaRef.value?.focus()
  })
}

const deleteNote = (id) => {
  noteRecords.value = noteRecords.value.filter((r) => r.id !== id)
  writeStorage(NOTE_KEY, noteRecords.value)
  if (editingNoteId.value === id) {
    editingNoteId.value = null
    noteDraft.value = ''
    initNoteForm()
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  progressRecords.value = readStorage(PROGRESS_KEY)
  doubtRecords.value = readStorage(DOUBT_KEY)
  noteRecords.value = readStorage(NOTE_KEY)
  refreshCurrentPage()
  // 学习计时
  loadTodayReading()
  startReadingTimer()
  resetIdle()
  document.addEventListener('visibilitychange', handleVisibility)
  // 用户交互重置空闲
  const events = ['mousemove', 'scroll', 'keydown', 'click']
  events.forEach((e) => document.addEventListener(e, resetIdle, { passive: true }))
  // 每分钟刷新相对时间显示
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
  stopReadingTimer()
  if (idleTimer) clearTimeout(idleTimer)
  saveTodayReading()
  document.removeEventListener('visibilitychange', handleVisibility)
  const events = ['mousemove', 'scroll', 'keydown', 'click']
  events.forEach((e) => document.removeEventListener(e, resetIdle))
})
</script>

<template>
  <div class="quick-tools-wrapper">
    <!-- 右侧贴边按钮 -->
    <button class="qt-sticky-btn" @click="togglePanel" title="快捷工具">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        />
      </svg>
      <span v-if="totalCount > 0" class="qt-badge">{{ totalCount }}</span>
    </button>

    <!-- 遮罩层 -->
    <Transition name="qt-fade">
      <div v-if="isOpen" class="qt-overlay" @click.self="closePanel">
        <!-- 弹窗面板 -->
        <div class="qt-panel">
          <!-- 头部 -->
          <div class="qt-panel-header">
            <h3 class="qt-panel-title">🧰 快捷工具</h3>
            <span class="qt-reading-time" title="今日累计阅读时长">⏱️ {{ formatReadingTime }}</span>
            <button class="qt-close-btn" @click="closePanel" title="关闭">✕</button>
          </div>

          <!-- Tab 切换 -->
          <div class="qt-tabs">
            <button
              :class="['qt-tab', { active: activeTab === 'progress' }]"
              @click="activeTab = 'progress'"
            >
              📖 进度 ({{ progressRecords.length }})
            </button>
            <button :class="['qt-tab', { active: activeTab === 'doubt' }]" @click="switchToDoubt">
              ❓ 疑惑 ({{ unresolvedDoubtCount }})
            </button>
            <button :class="['qt-tab', { active: activeTab === 'note' }]" @click="switchToNote">
              📝 笔记 ({{ noteRecords.length }})
            </button>
          </div>

          <!-- 面板内容区 -->
          <div class="qt-panel-body">
            <!-- ========== 记忆进度 Tab ========== -->
            <div v-if="activeTab === 'progress'" class="qt-tab-content">
              <div class="qt-progress-toolbar">
                <button class="qt-action-btn primary" @click="addProgress">
                  📌 记录当前页面进度
                </button>
                <button
                  v-if="progressRecords.length > 0"
                  class="qt-action-btn ghost"
                  @click="clearAllProgress"
                >
                  🧹 清空全部
                </button>
              </div>

              <div v-if="progressRecords.length === 0" class="qt-empty">暂无记录</div>

              <div v-else class="qt-record-list">
                <div v-for="(record, index) in progressRecords" :key="index" class="qt-record-card">
                  <div class="qt-record-header">
                    <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
                    <div class="qt-record-actions">
                      <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
                      <button
                        class="qt-icon-btn danger"
                        @click="deleteProgress(index)"
                        title="删除"
                      >
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

            <!-- ========== 记忆疑惑 Tab ========== -->
            <div v-if="activeTab === 'doubt'" class="qt-tab-content">
              <!-- 疑惑录入/编辑表单 -->
              <div class="qt-doubt-form">
                <textarea
                  ref="textareaRef"
                  v-model="doubtDraft"
                  class="qt-textarea"
                  placeholder="请填写你的疑惑点..."
                  rows="3"
                ></textarea>
                <div class="qt-form-actions">
                  <button
                    class="qt-action-btn primary"
                    :disabled="!doubtDraft.trim()"
                    @click="saveDoubt"
                  >
                    {{ editingDoubtId ? '💾 更新疑惑' : '💾 保存疑惑' }}
                  </button>
                  <span v-if="editingDoubtId" class="qt-edit-hint">✏️ 正在编辑已有记录</span>
                </div>
              </div>

              <!-- 疑惑列表 -->
              <div v-if="doubtRecords.length === 0" class="qt-empty">暂无记录</div>

              <div v-else>
                <div class="qt-record-list">
                  <div
                    v-for="record in sortedDoubtRecords"
                    :key="record.id"
                    :class="['qt-record-card', { resolved: record.resolved }]"
                  >
                    <div class="qt-record-header">
                      <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
                      <div class="qt-record-actions">
                        <button
                          v-if="!record.resolved"
                          class="qt-icon-btn success"
                          @click="resolveDoubt(record)"
                          title="标记为已解决"
                        >
                          ✅
                        </button>
                        <button
                          class="qt-icon-btn danger"
                          @click="deleteDoubt(record.id)"
                          title="删除"
                        >
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

                <div v-if="doubtRecords.some((r) => r.resolved)" class="qt-doubt-footer">
                  <button class="qt-text-btn" @click="clearResolvedDoubts">
                    🧹 清除已解决记录
                  </button>
                </div>
              </div>
            </div>

            <!-- ========== 页面笔记 Tab ========== -->
            <div v-if="activeTab === 'note'" class="qt-tab-content">
              <!-- 笔记录入/编辑表单 -->
              <div class="qt-doubt-form">
                <textarea
                  ref="noteTextareaRef"
                  v-model="noteDraft"
                  class="qt-textarea"
                  placeholder="记录学习心得、总结、要点..."
                  rows="3"
                ></textarea>
                <div class="qt-form-actions">
                  <button
                    class="qt-action-btn primary"
                    :disabled="!noteDraft.trim()"
                    @click="saveNote"
                  >
                    {{ editingNoteId ? '💾 更新笔记' : '💾 保存笔记' }}
                  </button>
                  <span v-if="editingNoteId" class="qt-edit-hint">✏️ 正在编辑已有笔记</span>
                </div>
              </div>

              <!-- 笔记列表 -->
              <div v-if="noteRecords.length === 0" class="qt-empty">暂无笔记</div>

              <div v-else class="qt-record-list">
                <div
                  v-for="record in sortedNoteRecords"
                  :key="record.id"
                  class="qt-record-card"
                >
                  <div class="qt-record-header">
                    <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
                    <div class="qt-record-actions">
                      <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
                      <button class="qt-icon-btn" @click="editNote(record)" title="编辑">✏️</button>
                      <button
                        class="qt-icon-btn danger"
                        @click="deleteNote(record.id)"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div class="qt-record-meta">
                    <span class="qt-record-time"
                      >🕐 {{ dayjs(record.updatedAt || record.time).format('YYYY-MM-DD HH:mm') }}</span
                    >
                    <span class="qt-relative-time">{{ formatRelative(record.updatedAt || record.time) }}</span>
                  </div>
                  <div class="qt-note-text">{{ record.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ==================== 贴边按钮 ==================== */
.qt-sticky-btn {
  position: fixed;
  right: 0;
  bottom: 130px;
  z-index: 998;
  width: 36px;
  height: 56px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.12);
  transition: all 0.25s ease;
}

.qt-sticky-btn:hover {
  width: 42px;
  background: var(--vp-c-brand-2);
  box-shadow: -3px 0 16px rgba(0, 0, 0, 0.2);
}

.qt-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

/* ==================== 遮罩 ==================== */
.qt-overlay {
  position: fixed;
  inset: 0;
  z-index: 997;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

/* ==================== 面板 ==================== */
.qt-panel {
  width: 520px;
  max-width: 92vw;
  max-height: 80vh;
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.qt-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.qt-panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.qt-reading-time {
  flex: 1;
  text-align: right;
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
}

.qt-close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qt-close-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

/* ==================== Tabs ==================== */
.qt-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0 20px;
}

.qt-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.qt-tab:hover {
  color: var(--vp-c-text-1);
}

.qt-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

/* ==================== 内容区 ==================== */
.qt-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}

.qt-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qt-empty {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 32px 0;
  font-size: 13px;
}

.qt-relative-time {
  font-size: 11px;
  color: var(--vp-c-brand-1);
  font-weight: 500;
  background: var(--vp-c-brand-soft);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ==================== 工具栏 ==================== */
.qt-progress-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qt-action-btn.ghost {
  background: transparent;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  padding: 6px 12px;
}

.qt-action-btn.ghost:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}

/* ==================== 列表底部操作 ==================== */
.qt-doubt-footer {
  margin-top: 8px;
  text-align: center;
}

.qt-text-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.qt-text-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

/* ==================== 操作按钮 ==================== */
.qt-action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.qt-action-btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.qt-action-btn.primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.qt-action-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 记录卡片 ==================== */
.qt-record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qt-record-card {
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}

.qt-record-card:hover {
  border-color: var(--vp-c-brand-1);
}

.qt-record-card.resolved {
  opacity: 0.65;
}

.qt-record-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.qt-record-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.qt-record-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.qt-icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.qt-icon-btn:hover {
  background: var(--vp-c-bg-mute);
}

.qt-icon-btn.nav:hover {
  background: rgba(59, 130, 246, 0.1);
}

.qt-icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.qt-icon-btn.success:hover {
  background: rgba(34, 197, 94, 0.1);
}

.qt-record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.qt-record-time {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.qt-resolved-tag {
  font-size: 11px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.qt-record-link {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

.qt-record-link:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

/* ==================== 疑惑表单 ==================== */
.qt-doubt-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qt-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.qt-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.qt-textarea::placeholder {
  color: var(--vp-c-text-3);
}

.qt-form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qt-edit-hint {
  font-size: 12px;
  color: var(--vp-c-brand-1);
}

.qt-doubt-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding: 8px 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border-left: 3px solid var(--vp-c-brand-1);
  word-break: break-word;
}

.qt-note-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding: 8px 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
  word-break: break-word;
  white-space: pre-wrap;
}

/* ==================== 动画 ==================== */
.qt-fade-enter-active,
.qt-fade-leave-active {
  transition: opacity 0.25s ease;
}

.qt-fade-enter-from,
.qt-fade-leave-to {
  opacity: 0;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .qt-panel {
    max-width: 96vw;
    max-height: 85vh;
  }

  .qt-panel-body {
    padding: 12px 14px 16px;
  }
}
</style>
