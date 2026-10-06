/**
 * 抗遗忘复习系统 — IndexedDB 持久化层
 *
 * 基于 idb-keyval，以 docId 为主键管理复习记录。
 * 三个逻辑命名空间：
 *   - review:records    → ReviewRecord[]
 *   - review:docSnapshot → DocSnapshot
 *   - review:settings   → UserSettings
 */

import { get, set, createStore } from 'idb-keyval'

// ── IndexedDB 自定义存储（替代默认 keyval-store）──
const reviewStore = createStore('smart-code-tool', 'quick-tools')

// ── IndexedDB 键名 ──
const KEY_RECORDS = 'review:records'
const KEY_DOC_SNAPSHOT = 'review:docSnapshot'
const KEY_SETTINGS = 'review:settings'

// ── localStorage 旧键（用于迁移）──
const LEGACY_REVIEW_KEY = 'quick-tools-reviews'

// ── 默认用户配置 ──
const DEFAULT_SETTINGS = {
  algorithm: 'fsrs',
  requestRetention: 0.9,
  maximumInterval: 365,
  dailyReviewLimit: 50,
  historyLimitPerDoc: 50,
  enableNotification: false,
}

// ── 创建空 ReviewRecord ──
function createEmptyRecord(docId, url, title, group) {
  const now = new Date().toISOString()
  return {
    docId,
    url,
    title,
    group,
    autoLearnedAt: null,
    accumulatedSeconds: 0,
    // FSRS 字段
    state: 'new',
    stability: 0,
    difficulty: 0,
    due: now,
    lastReview: null,
    // 历史
    reviewCount: 0,
    lapses: 0,
    history: [],
    // 元数据
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    isDismissed: false,
  }
}

/**
 * useReviewStorage — IndexedDB 持久化层
 *
 * 所有写操作返回 Promise<void>，读操作返回 Promise<T>。
 * 内部维护一份 records Map<docId, ReviewRecord> 缓存，避免重复读取。
 */
export function useReviewStorage() {
  /** 内存缓存：Map<docId, ReviewRecord> */
  let recordsMap = new Map()
  /** 是否已初始化 */
  let initialized = false

  // ── 初始化：从 IndexedDB 加载全部记录到内存 ──
  async function init() {
    if (initialized) return
    const records = (await get(KEY_RECORDS, reviewStore)) || []
    recordsMap = new Map(records.map((r) => [r.docId, r]))
    initialized = true
  }

  // ── 持久化：将内存缓存写回 IndexedDB ──
  async function persist() {
    const records = Array.from(recordsMap.values())
    await set(KEY_RECORDS, records, reviewStore)
  }

  // ── 数据迁移：localStorage → IndexedDB ──
  async function migrateFromLocalStorage() {
    if (initialized && recordsMap.size > 0) return { migrated: 0 }

    try {
      const raw = localStorage.getItem(LEGACY_REVIEW_KEY)
      if (!raw) return { migrated: 0 }
      const legacyRecords = JSON.parse(raw)
      if (!Array.isArray(legacyRecords) || legacyRecords.length === 0) {
        return { migrated: 0 }
      }

      // 转换旧格式到新格式
      const migrated = legacyRecords
        .filter((r) => r.url)
        .map((r) => {
          const docId = r.id || `legacy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
          const record = createEmptyRecord(docId, r.url, r.title || r.url, '未分组')
          record.autoLearnedAt = r.time || r.updatedAt || null
          record.createdAt = r.time || record.createdAt
          record.updatedAt = r.updatedAt || record.updatedAt
          return record
        })

      for (const r of migrated) {
        recordsMap.set(r.docId, r)
      }
      await persist()

      // 迁移成功后清除旧数据
      localStorage.removeItem(LEGACY_REVIEW_KEY)
      return { migrated: migrated.length }
    } catch {
      return { migrated: 0 }
    }
  }

  // ── 获取单条记录 ──
  function getRecord(docId) {
    return recordsMap.get(docId) || null
  }

  // ── 获取全部记录（返回数组）──
  function getAllRecords() {
    return Array.from(recordsMap.values())
  }

  // ── 获取或创建记录 ──
  function getOrCreateRecord(docId, url, title, group) {
    let record = recordsMap.get(docId)
    if (!record) {
      record = createEmptyRecord(docId, url, title, group)
      recordsMap.set(docId, record)
    }
    return record
  }

  // ── 更新记录并持久化 ──
  async function saveRecord(record) {
    record.updatedAt = new Date().toISOString()
    recordsMap.set(record.docId, record)
    await persist()
  }

  // ── 批量更新记录并持久化 ──
  async function saveRecords(records) {
    const now = new Date().toISOString()
    for (const r of records) {
      r.updatedAt = now
      recordsMap.set(r.docId, r)
    }
    await persist()
  }

  // ── 删除记录 ──
  async function removeRecord(docId) {
    recordsMap.delete(docId)
    await persist()
  }

  // ── 清空全部记录 ──
  async function clearAllRecords() {
    recordsMap.clear()
    await persist()
  }

  // ── 自动学习标记 ──
  async function markAutoLearned(docId, { url, title, group, accumulatedSeconds }) {
    const record = getOrCreateRecord(docId, url, title, group)
    record.autoLearnedAt = new Date().toISOString()
    record.accumulatedSeconds = accumulatedSeconds
    // 加入学习历史
    record.history.push({
      timestamp: record.autoLearnedAt,
      type: 'auto-learn',
      accumulatedSeconds,
    })
    await saveRecord(record)
    return record
  }

  // ── 保存累计阅读秒数（未达自动学习阈值时切走页面） ──
  async function saveAccumulatedSeconds(docId, seconds) {
    const record = recordsMap.get(docId)
    if (record) {
      record.accumulatedSeconds = Math.max(record.accumulatedSeconds, seconds)
      await persist()
    }
  }

  // ── 文档快照 ──
  async function getDocSnapshot() {
    return (await get(KEY_DOC_SNAPSHOT, reviewStore)) || null
  }

  async function saveDocSnapshot(snapshot) {
    await set(KEY_DOC_SNAPSHOT, snapshot, reviewStore)
  }

  // ── 用户配置 ──
  async function getSettings() {
    const saved = (await get(KEY_SETTINGS, reviewStore)) || {}
    return { ...DEFAULT_SETTINGS, ...saved }
  }

  async function saveSettings(settings) {
    await set(KEY_SETTINGS, { ...DEFAULT_SETTINGS, ...settings }, reviewStore)
  }

  // ── 导出全部数据（JSON） ──
  async function exportAllData() {
    const records = getAllRecords()
    const settings = await getSettings()
    const snapshot = await getDocSnapshot()
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      records,
      settings,
      docSnapshot: snapshot,
    }
  }

  // ── 导入数据（JSON） ──
  async function importAllData(data) {
    if (!data || !Array.isArray(data.records)) throw new Error('无效的导入数据')
    recordsMap = new Map(data.records.map((r) => [r.docId, r]))
    await persist()
    if (data.settings) await saveSettings(data.settings)
    if (data.docSnapshot) await saveDocSnapshot(data.docSnapshot)
    return { imported: data.records.length }
  }

  return {
    init,
    migrateFromLocalStorage,
    getRecord,
    getAllRecords,
    getOrCreateRecord,
    saveRecord,
    saveRecords,
    removeRecord,
    clearAllRecords,
    markAutoLearned,
    saveAccumulatedSeconds,
    getDocSnapshot,
    saveDocSnapshot,
    getSettings,
    saveSettings,
    exportAllData,
    importAllData,
  }
}
