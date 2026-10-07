/**
 * 学习实况追踪器 — "打脸"模块
 *
 * 记录每天是否有学习活动，计算连续天数、最长连续、断档天数。
 * 数据存入 IndexedDB（键: qt:learningDays）。
 *
 * 触发时机：进度添加、疑惑保存、笔记保存、复习提交。
 */

import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import { qtStore } from '../shared/useQtStorage'

const KEY_LEARNING = 'qt:learningDays'

// ── 工具函数 ──

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysAgoStr(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateToStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ── 模块级单例状态 ──
const learningDays = ref({}) // { '2026-10-07': { date, eventCount, lastEventAt } }
const initialized = ref(false)

// ── 持久化 ──

async function load() {
  const data = await get(KEY_LEARNING, qtStore)
  if (data && typeof data === 'object') {
    learningDays.value = data
  }
  initialized.value = true
}

async function persist() {
  // Vue reactive proxy 无法被 IndexedDB 结构化克隆，需深度转为纯对象
  const plain = JSON.parse(JSON.stringify(learningDays.value))
  await set(KEY_LEARNING, plain, qtStore)
}

// ── 核心 API ──

/**
 * 记录今天有学习活动
 * @param {string} source 来源标识（progress / doubt / note / review）
 */
async function recordToday(source = 'unknown') {
  if (!initialized.value) await load()

  const today = todayStr()
  const existing = learningDays.value[today]

  if (existing) {
    existing.eventCount++
    existing.lastEventAt = new Date().toISOString()
    if (source && !existing.sources?.includes(source)) {
      existing.sources = [...(existing.sources || []), source]
    }
  } else {
    learningDays.value[today] = {
      date: today,
      eventCount: 1,
      lastEventAt: new Date().toISOString(),
      sources: [source],
    }
  }

  await persist()
}

// ── 计算属性 ──

/** 当前连续天数（从今天往前数，连续有记录的天数） */
const currentStreak = computed(() => {
  let count = 0
  // 如果今天没记录，从昨天开始算
  let startOffset = learningDays.value[todayStr()] ? 0 : 1
  for (let i = startOffset; i < 3650; i++) {
    if (learningDays.value[daysAgoStr(i)]) {
      count++
    } else {
      break
    }
  }
  return count
})

/** 最长连续天数 */
const longestStreak = computed(() => {
  const dates = Object.keys(learningDays.value).sort()
  if (dates.length === 0) return 0

  let max = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      current++
      max = Math.max(max, current)
    } else {
      current = 1
    }
  }
  return max
})

/** 总学习天数 */
const totalDays = computed(() => Object.keys(learningDays.value).length)

/** 本月学习天数 */
const thisMonthDays = computed(() => {
  const now = new Date()
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return Object.keys(learningDays.value).filter((d) => d.startsWith(prefix)).length
})

/** 最近一次学习距今天数 */
const daysSinceLastLearning = computed(() => {
  const dates = Object.keys(learningDays.value).sort()
  if (dates.length === 0) return -1
  const last = new Date(dates[dates.length - 1])
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  last.setHours(0, 0, 0, 0)
  return Math.round((now - last) / (1000 * 60 * 60 * 24))
})

/** 打脸等级与消息 */
const truthMessage = computed(() => {
  const gap = daysSinceLastLearning.value
  const streak = currentStreak.value

  if (gap === -1) {
    return { level: 'none', emoji: '🫥', text: '还没有任何学习记录…今天开始？', color: '#909399' }
  }
  if (gap === 0) {
    if (streak >= 30)
      return {
        level: 'legend',
        emoji: '🏆',
        text: `${streak} 天连续！学习传说！`,
        color: '#e6a23c',
      }
    if (streak >= 14)
      return { level: 'great', emoji: '🔥', text: `${streak} 天连续，势不可挡！`, color: '#f56c6c' }
    if (streak >= 7)
      return { level: 'good', emoji: '💪', text: `${streak} 天连续，保持住！`, color: '#67c23a' }
    return { level: 'ok', emoji: '✅', text: `今天已学习，连续 ${streak} 天`, color: '#409eff' }
  }
  if (gap === 1)
    return {
      level: 'warn',
      emoji: '⚠️',
      text: '昨天没学，连续断了！今天赶紧补上',
      color: '#e6a23c',
    }
  if (gap <= 3)
    return {
      level: 'danger',
      emoji: '😰',
      text: `已经 ${gap} 天没学了，别骗自己了`,
      color: '#f56c6c',
    }
  if (gap <= 7)
    return {
      level: 'critical',
      emoji: '🚨',
      text: `${gap} 天没学…说好的每天学习呢？`,
      color: '#f56c6c',
    }
  return { level: 'dead', emoji: '💀', text: `${gap} 天…你管这叫"一直在学"？`, color: '#9b59b6' }
})

/** 日历数据：最近 N 天的学习状态（倒序，今天在前） */
function getCalendarData(days = 90) {
  const result = []
  for (let i = 0; i < days; i++) {
    const dateStr = daysAgoStr(i)
    const record = learningDays.value[dateStr]
    result.push({
      date: dateStr,
      learned: !!record,
      eventCount: record?.eventCount || 0,
      dayOfWeek: new Date(dateStr).getDay(),
    })
  }
  return result
}

/** 获取最近的断档区间 */
function getRecentGaps(maxGap = 30) {
  const gaps = []
  for (let i = 1; i <= maxGap; i++) {
    const dateStr = daysAgoStr(i)
    if (!learningDays.value[dateStr]) {
      // 找到连续未学习的区间
      let start = i
      while (i < maxGap && !learningDays.value[daysAgoStr(i + 1)]) {
        i++
      }
      const length = i - start + 1
      gaps.push({
        from: daysAgoStr(i),
        to: daysAgoStr(start),
        length,
      })
    }
  }
  return gaps
}

// ── 导出 ──

export function useLearningStreak() {
  return {
    // 状态
    learningDays,
    initialized,
    // 计算
    currentStreak,
    longestStreak,
    totalDays,
    thisMonthDays,
    daysSinceLastLearning,
    truthMessage,
    // 方法
    recordToday,
    load,
    getCalendarData,
    getRecentGaps,
  }
}
