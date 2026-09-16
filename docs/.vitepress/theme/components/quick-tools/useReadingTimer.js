import { ref, computed, onMounted, onUnmounted } from 'vue'
import { readStorage, writeStorage, formatSeconds, dayjs } from './utils'
import { READING_TIME_KEY, IDLE_TIMEOUT, SAVE_INTERVAL, READING_HISTORY_DAYS } from './constants'

/**
 * 学习计时：基于页面活跃状态追踪今日阅读时长
 */
export function useReadingTimer() {
  const todaySeconds = ref(0)
  let readingTimer = null
  let idleTimer = null
  let isIdle = false

  const getTodayKey = () => dayjs().format('YYYY-MM-DD')

  const load = () => {
    const data = readStorage(READING_TIME_KEY, {})
    todaySeconds.value = data[getTodayKey()] || 0
  }

  const save = () => {
    const data = readStorage(READING_TIME_KEY, {})
    data[getTodayKey()] = todaySeconds.value
    // 只保留最近 N 天
    const keys = Object.keys(data).sort()
    if (keys.length > READING_HISTORY_DAYS) {
      keys.slice(0, keys.length - READING_HISTORY_DAYS).forEach((k) => delete data[k])
    }
    writeStorage(READING_TIME_KEY, data)
  }

  const start = () => {
    stop()
    readingTimer = setInterval(() => {
      if (!isIdle && document.visibilityState === 'visible') {
        todaySeconds.value++
        if (todaySeconds.value % SAVE_INTERVAL === 0) save()
      }
    }, 1000)
  }

  const stop = () => {
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
      save()
    }
  }

  const displayTime = computed(() => formatSeconds(todaySeconds.value))

  const ACTIVITY_EVENTS = ['mousemove', 'scroll', 'keydown', 'click']

  onMounted(() => {
    load()
    start()
    resetIdle()
    document.addEventListener('visibilitychange', handleVisibility)
    ACTIVITY_EVENTS.forEach((e) => document.addEventListener(e, resetIdle, { passive: true }))
  })

  onUnmounted(() => {
    stop()
    if (idleTimer) clearTimeout(idleTimer)
    save()
    document.removeEventListener('visibilitychange', handleVisibility)
    ACTIVITY_EVENTS.forEach((e) => document.removeEventListener(e, resetIdle))
  })

  return { todaySeconds, displayTime }
}
