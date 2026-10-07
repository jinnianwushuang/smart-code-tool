<template>
  <div class="qt-tab-content">
    <div class="qt-record-scroll ls-container">
      <!-- 打脸真相卡片 -->
      <div class="ls-truth-card" :style="{ borderColor: truth.color }">
        <div class="ls-truth-emoji">{{ truth.emoji }}</div>
        <div class="ls-truth-text">{{ truth.text }}</div>
      </div>

      <!-- 统计卡片 -->
      <div class="ls-stats-grid">
        <el-card class="ls-stat-card" shadow="never">
          <div class="ls-stat-num" :style="{ color: streakColor }">{{ streak }}</div>
          <div class="ls-stat-label">当前连续（天）</div>
        </el-card>
        <el-card class="ls-stat-card" shadow="never">
          <div class="ls-stat-num">{{ longest }}</div>
          <div class="ls-stat-label">最长连续（天）</div>
        </el-card>
        <el-card class="ls-stat-card" shadow="never">
          <div class="ls-stat-num">{{ monthDays }}</div>
          <div class="ls-stat-label">本月学习（天）</div>
        </el-card>
        <el-card class="ls-stat-card" shadow="never">
          <div class="ls-stat-num">{{ total }}</div>
          <div class="ls-stat-label">累计学习（天）</div>
        </el-card>
      </div>

      <!-- 日历热力图 -->
      <div class="ls-calendar-section">
        <div class="ls-calendar-header">
          <h4>最近 90 天学习实况</h4>
          <div class="ls-calendar-legend">
            <span class="ls-legend-item"> <span class="ls-legend-dot learned"></span>已学习 </span>
            <span class="ls-legend-item"> <span class="ls-legend-dot idle"></span>未学习 </span>
          </div>
        </div>
        <div class="ls-calendar-grid">
          <div
            v-for="day in calendarData"
            :key="day.date"
            class="ls-calendar-cell"
            :class="{ learned: day.learned, weekend: day.dayOfWeek === 0 || day.dayOfWeek === 6 }"
            :title="`${day.date}${day.learned ? ` ✅ 学习 ${day.eventCount} 次` : ' ❌ 未学习'}`"
          >
            <span class="ls-cell-date">{{ day.date }}</span>
          </div>
        </div>
      </div>

      <!-- 断档记录 -->
      <div v-if="recentGaps.length" class="ls-gaps-section">
        <h4>📉 近期断档记录</h4>
        <div class="ls-gap-list">
          <div v-for="gap in recentGaps" :key="gap.from" class="ls-gap-item">
            <el-tag type="danger" size="small">{{ gap.length }} 天</el-tag>
            <span class="ls-gap-range">{{ gap.from }} → {{ gap.to }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="total === 0"
        description="还没有学习记录，今天开始打脸之旅吧！"
        :image-size="80"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useLearningStreak } from '../composables/useLearningStreak'

const {
  currentStreak,
  longestStreak,
  totalDays,
  thisMonthDays,
  truthMessage,
  load,
  getCalendarData,
  getRecentGaps,
} = useLearningStreak()

const streak = computed(() => currentStreak.value)
const longest = computed(() => longestStreak.value)
const total = computed(() => totalDays.value)
const monthDays = computed(() => thisMonthDays.value)
const truth = computed(() => truthMessage.value)
const calendarData = computed(() => getCalendarData(90))
const recentGaps = computed(() => getRecentGaps(30))

const streakColor = computed(() => {
  if (streak.value >= 30) return '#e6a23c'
  if (streak.value >= 14) return '#f56c6c'
  if (streak.value >= 7) return '#67c23a'
  return '#409eff'
})

onMounted(() => {
  load()
})
</script>
