/**
 * 抗遗忘复习系统 — 自动学习感知
 *
 * 核心功能：
 * - 页面停留计时（仅 visibilityState === 'visible' 时累加）
 * - 累计达到阈值（默认 10 分钟）自动标记「已学习」
 * - 路由切换时自动暂停旧页面、开始新页面
 * - 支持累计计时（同一页面多次进入时间累加）
 */

import { ref, computed } from 'vue'
import { AUTO_LEARN_THRESHOLD, TICK_INTERVAL } from '../shared/constants'

/**
 * useAutoLearn — 自动学习感知 composable
 *
 * @param {function} getPage - 返回 { url, title } 的函数
 * @param {object} storage - useReviewStorage 实例
 * @param {object} scheduler - useReviewScheduler 实例
 * @param {function} getDocIdByUrl - 根据 URL 查找 docId 的函数
 * @param {function} getDocInfoById - 根据 docId 查找文档信息 { url, title, group } 的函数
 */
export function useAutoLearn(getPage, storage, scheduler, getDocIdByUrl, getDocInfoById) {
  /** 当前页面累计有效秒数 */
  const accumulatedSeconds = ref(0)
  /** 当前页面是否已自动标记学习 */
  const isAutoLearned = ref(false)
  /** 学习进度百分比（0-100） */
  const progressPercent = computed(() =>
    Math.min(100, Math.round((accumulatedSeconds.value / AUTO_LEARN_THRESHOLD) * 100)),
  )
  /** 当前正在追踪的 docId */
  const currentDocId = ref(null)

  let timer = null
  let trackingUrl = ''

  /**
   * 开始追踪指定 URL 的页面
   */
  async function startTracking(url) {
    trackingUrl = url
    const docId = getDocIdByUrl(url)

    if (!docId) {
      // 不在文档清单中的页面（如首页、索引页），不追踪
      currentDocId.value = null
      return
    }

    currentDocId.value = docId
    const record = storage.getRecord(docId)

    // 已自动标记过 → 跳过
    if (record?.autoLearnedAt) {
      isAutoLearned.value = true
      accumulatedSeconds.value = record.accumulatedSeconds || 0
      return
    }

    isAutoLearned.value = false
    // 恢复已累计的秒数
    accumulatedSeconds.value = record?.accumulatedSeconds ?? 0

    // 如果已累计达标（从之前的会话恢复），直接触发
    if (accumulatedSeconds.value >= AUTO_LEARN_THRESHOLD) {
      await onAutoLearned()
      return
    }

    startTimer()
  }

  /**
   * 启动计时器
   */
  function startTimer() {
    stopTimer()
    timer = setInterval(tick, TICK_INTERVAL)
  }

  /**
   * 停止计时器
   */
  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /**
   * 每秒 tick：仅页面可见时累加
   */
  async function tick() {
    if (document.visibilityState !== 'visible') return
    accumulatedSeconds.value++

    if (accumulatedSeconds.value >= AUTO_LEARN_THRESHOLD) {
      await onAutoLearned()
    }
  }

  /**
   * 达到阈值：自动注册「已学习」
   */
  async function onAutoLearned() {
    stopTimer()
    isAutoLearned.value = true

    const docId = currentDocId.value
    if (!docId) return

    const docInfo = getDocInfoById(docId)
    if (!docInfo) return

    // 标记自动学习
    const record = await storage.markAutoLearned(docId, {
      url: docInfo.url,
      title: docInfo.title,
      group: docInfo.group,
      accumulatedSeconds: accumulatedSeconds.value,
    })

    // 触发首次调度（计算首次复习时间）
    const fsrsFields = scheduler.scheduleFirstLearn(record)
    Object.assign(record, fsrsFields)

    // 添加首次学习日志
    record.history.push({
      timestamp: new Date().toISOString(),
      type: 'review',
      rating: 'good',
      interval: Math.round(fsrsFields.stability),
      elapsedDays: 0,
    })

    // 裁剪历史
    if (record.history.length > 50) {
      record.history = record.history.slice(-50)
    }

    await storage.saveRecord(record)
  }

  /**
   * 路由切换处理：停止旧追踪 → 开始新追踪
   */
  async function onRouteChange(newUrl) {
    // 持久化旧页面的累计秒数
    await persistCurrentProgress()
    stopTimer()

    // 开始追踪新页面
    await startTracking(newUrl)
  }

  /**
   * 持久化当前页面的累计进度
   */
  async function persistCurrentProgress() {
    const docId = currentDocId.value
    if (!docId || isAutoLearned.value) return

    const record = storage.getRecord(docId)
    if (record) {
      record.accumulatedSeconds = Math.max(record.accumulatedSeconds, accumulatedSeconds.value)
      await storage.saveRecord(record)
    }
  }

  /**
   * 组件卸载时清理
   */
  async function destroy() {
    await persistCurrentProgress()
    stopTimer()
  }

  return {
    accumulatedSeconds,
    isAutoLearned,
    progressPercent,
    currentDocId,
    startTracking,
    onRouteChange,
    persistCurrentProgress,
    destroy,
  }
}
