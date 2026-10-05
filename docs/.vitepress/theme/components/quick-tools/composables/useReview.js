/**
 * 抗遗忘复习系统 — 核心业务逻辑（重构版）
 *
 * 组合：storage + scheduler + docRegistry + autoLearn
 * 暴露 Vue 响应式 API 供 ReviewTab 和 QuickTools 使用
 */

import { ref, computed, shallowRef } from 'vue'
import { useReviewStorage } from './useReviewStorage'
import { useReviewScheduler, REVIEW_RATING } from './useReviewScheduler'
import { useReviewDocRegistry } from './useReviewDocRegistry'
import { useAutoLearn } from './useAutoLearn'
import { HISTORY_LIMIT_PER_DOC } from '../shared/constants'

/** 全局单例（避免多组件重复初始化） */
let globalInstance = null

/**
 * useReview — 复习系统主 composable
 *
 * @param {function} getPage - 返回 { url, title } 的函数
 */
export function useReview(getPage) {
  if (globalInstance) return globalInstance

  // ── 初始化各模块 ──
  const storage = useReviewStorage()
  const settings = shallowRef({ algorithm: 'fsrs', requestRetention: 0.9, maximumInterval: 365 })
  let scheduler = useReviewScheduler(settings.value)
  const docRegistry = useReviewDocRegistry(storage)

  // ── 响应式状态 ──
  const records = ref([])
  const isReady = ref(false)
  const activeSubView = ref('today') // today | blindspot | all | stats | settings

  // ── 自动学习感知 ──
  const autoLearn = useAutoLearn(
    getPage,
    storage,
    scheduler,
    (url) => docRegistry.getDocIdByUrl(url),
    (docId) => docRegistry.getDocInfoById(docId),
  )

  // ── 计算属性 ──

  /** 今日到期待复习 */
  const dueRecords = computed(() => scheduler.getDueRecords(records.value))

  /** 文档盲区 */
  const blindSpots = computed(() => docRegistry.getBlindSpots())

  /** 盲区总数 */
  const blindSpotTotal = computed(
    () =>
      blindSpots.value.neverOpened.length +
      blindSpots.value.neverLearned.length +
      blindSpots.value.neverReviewed.length,
  )

  /** 统计概览 */
  const stats = computed(() => {
    const all = records.value.filter((r) => !r.isArchived)
    const learned = all.filter((r) => r.autoLearnedAt)
    const reviewed = all.filter((r) => r.reviewCount > 0)
    const today = dueRecords.value
    const totalDocs = docRegistry.getTotalDocCount()

    return {
      totalDocs,
      totalRecords: all.length,
      learnedCount: learned.length,
      reviewedCount: reviewed.length,
      dueCount: today.length,
      coverageRate: totalDocs > 0 ? Math.round((learned.length / totalDocs) * 100) : 0,
    }
  })

  // ── 核心方法 ──

  /**
   * 初始化系统（应用启动时调用一次）
   */
  async function init() {
    // 1. 初始化存储（从 IndexedDB 加载）
    await storage.init()

    // 2. 尝试从 localStorage 迁移旧数据
    await storage.migrateFromLocalStorage()

    // 3. 加载用户配置
    const savedSettings = await storage.getSettings()
    settings.value = savedSettings
    scheduler = useReviewScheduler(savedSettings)

    // 4. 加载文档清单
    await docRegistry.init()

    // 5. 同步文档清单与记录
    await docRegistry.syncDocsWithRecords()

    // 6. 刷新记录列表
    refreshRecords()

    isReady.value = true
  }

  /** 刷新内存中的记录列表 */
  function refreshRecords() {
    records.value = storage.getAllRecords()
  }

  /**
   * 提交复习评分
   *
   * @param {string} docId - 文档 ID
   * @param {string} ratingStr - 'again' | 'hard' | 'good' | 'easy'
   */
  async function submitReview(docId, ratingStr) {
    const record = storage.getRecord(docId)
    if (!record) return

    const { fsrsFields, logEntry } = scheduler.scheduleReview(record, ratingStr)

    // 更新 FSRS 字段
    Object.assign(record, fsrsFields)

    // 添加学习历史
    record.history.push(logEntry)
    // 裁剪历史（保留最新 N 条）
    if (record.history.length > HISTORY_LIMIT_PER_DOC) {
      record.history = record.history.slice(-HISTORY_LIMIT_PER_DOC)
    }

    await storage.saveRecord(record)
    refreshRecords()
  }

  /**
   * 标记文档为「已知」（从盲区移除，不参与调度）
   */
  async function dismissDoc(docId) {
    const record = storage.getRecord(docId)
    if (!record) return
    record.isDismissed = true
    await storage.saveRecord(record)
    refreshRecords()
  }

  /**
   * 取消「已知」标记
   */
  async function undismissDoc(docId) {
    const record = storage.getRecord(docId)
    if (!record) return
    record.isDismissed = false
    await storage.saveRecord(record)
    refreshRecords()
  }

  /**
   * 更新用户配置
   */
  async function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    await storage.saveSettings(settings.value)
    // 重建调度器（参数可能变了）
    scheduler = useReviewScheduler(settings.value)
  }

  /**
   * 导出全部数据
   */
  async function exportData() {
    return await storage.exportAllData()
  }

  /**
   * 导入数据
   */
  async function importData(data) {
    const result = await storage.importAllData(data)
    refreshRecords()
    return result
  }

  /**
   * 清空全部数据
   */
  async function clearAll() {
    await storage.clearAllRecords()
    refreshRecords()
  }

  /**
   * 跳转到文档页面
   */
  function goToDoc(url) {
    window.location.href = url
  }

  // ── 构建实例 ──
  const instance = {
    // 状态
    records,
    isReady,
    settings,
    activeSubView,
    autoLearn,
    // 计算属性
    dueRecords,
    blindSpots,
    blindSpotTotal,
    stats,
    // 方法
    init,
    refreshRecords,
    submitReview,
    dismissDoc,
    undismissDoc,
    updateSettings,
    exportData,
    importData,
    clearAll,
    goToDoc,
    // 子模块暴露（高级用法）
    storage,
    scheduler,
    docRegistry,
    REVIEW_RATING,
  }

  globalInstance = instance
  return instance
}

/** 重置全局单例（仅测试用） */
export function _resetReviewInstance() {
  globalInstance = null
}
