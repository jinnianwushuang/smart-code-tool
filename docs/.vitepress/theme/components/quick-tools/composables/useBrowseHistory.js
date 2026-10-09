/**
 * useBrowseHistory.js — 浏览历史 composable
 *
 * 架构层级：业务逻辑层
 * 职责：
 *   - 记录页面浏览历史（URL + 标题 + 进入时间）
 *   - 倒序排列（最新在前）
 *   - 上限 300 条，超出自动丢弃最旧记录
 *   - 去重：最新一条记录若为同一 URL 则不重复记录（刷新/长时间停留均只记一次）
 *   - 闪跳过滤：新记录与最新一条间隔不足 3 分钟时，删除旧记录再插入（快速切换无阅读价值）
 *
 * 存储：IndexedDB（qt:history）
 * 依赖：useQtStorage / constants
 */

import { ref, computed } from 'vue'
import { readQt, writeQt, KEY_HISTORY } from '../shared/useQtStorage'
import { HISTORY_LIMIT } from '../shared/constants'
import { formatDatePart, todayStr } from '../shared/utils'

/** 全局单例 */
let globalInstance = null

/**
 * useBrowseHistory — 浏览历史管理
 *
 * @param {function} getPage - 返回 { url, title } 的函数
 */
export function useBrowseHistory(getPage) {
  if (globalInstance) return globalInstance

  const records = ref([])
  const loaded = ref(false)
  let initPromise = null // 共享初始化 Promise，防止 load/recordVisit 竞态

  /** 内部：确保 IDB 数据已加载（仅执行一次） */
  function _ensureLoaded() {
    if (!initPromise) {
      initPromise = readQt(KEY_HISTORY).then((data) => {
        records.value = data
        loaded.value = true
      })
    }
    return initPromise
  }

  /** 加载历史记录 */
  async function load() {
    await _ensureLoaded()
  }

  /** 记录当前页面浏览 */
  async function recordVisit() {
    if (!getPage) return

    // 确保已加载（防止 onAfterRouteChanged 先于 onMounted.load() 触发）
    await _ensureLoaded()

    const { url, title } = getPage()
    if (!url || url === '/' || url === '/index.html') return

    // 去重：最新一条已是同 URL 则跳过
    if (records.value.length > 0 && records.value[0].url === url) return

    // 闪跳过滤：与最新一条间隔不足 3 分钟 → 删除旧记录（无实质阅读停留）
    const now = new Date()
    if (records.value.length > 0) {
      const lastTime = new Date(records.value[0].visitedAt)
      const diffSec = (now - lastTime) / 1000
      if (diffSec < 180) {
        records.value.shift() // 删除上一条
      }
    }

    const record = {
      url,
      title: title || url,
      visitedAt: now.toISOString(),
    }

    // 插入到头部（最新在前）
    records.value.unshift(record)

    // 超出上限则截断
    if (records.value.length > HISTORY_LIMIT) {
      records.value = records.value.slice(0, HISTORY_LIMIT)
    }

    // 持久化
    await writeQt(KEY_HISTORY, records.value)
  }

  /** 清空全部历史 */
  async function clearAll() {
    records.value = []
    await writeQt(KEY_HISTORY, [])
  }

  /** 按天分组（倒序，按本地日期） */
  const recordsByDay = computed(() => {
    const map = {}
    for (const record of records.value) {
      const day = formatDatePart(record.visitedAt)
      if (!day) continue
      if (!map[day]) map[day] = []
      map[day].push(record)
    }
    return map
  })

  /** 有浏览记录的日期列表（倒序，今天在前） */
  const activeDays = computed(() => {
    return Object.keys(recordsByDay.value).sort((a, b) => b.localeCompare(a))
  })

  /** 头部快捷日期按钮（最多 8 天） */
  const topDays = computed(() => activeDays.value.slice(0, 8))

  /** 总记录数 */
  const totalCount = computed(() => records.value.length)

  /** 今日浏览数（按本地日期） */
  const todayCount = computed(() => {
    const today = todayStr()
    return records.value.filter((r) => formatDatePart(r.visitedAt) === today).length
  })

  const instance = {
    records,
    loaded,
    load,
    recordVisit,
    clearAll,
    recordsByDay,
    activeDays,
    topDays,
    totalCount,
    todayCount,
  }

  globalInstance = instance
  return instance
}
