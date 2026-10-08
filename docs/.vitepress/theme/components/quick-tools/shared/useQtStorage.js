/**
 * useQtStorage.js — QuickTools 统一 IndexedDB 存储层
 *
 * 架构层级：共享基础设施
 * 职责：
 *   - 所有工具（Progress/Doubt/Note）共用同一个 IDB 数据库
 *   - DB 名: smart-code-tool，Store: quick-tools
 *   - 自动从 localStorage 迁移旧数据（一次性迁移）
 *   - 提供 readQt/writeQt 统一读写接口
 *
 * 与 useReviewStorage.js 共用同一个 IDB 数据库
 */

import { get, set, createStore } from 'idb-keyval'
import { toRaw } from 'vue'

// 与 useReviewStorage.js 共用同一个 IDB 数据库
export const qtStore = createStore('smart-code-tool', 'quick-tools')

// ── IDB 键名 ──
const KEY_PROGRESS = 'qt:progress'
const KEY_DOUBTS = 'qt:doubts'
const KEY_NOTES = 'qt:notes'
const KEY_HISTORY = 'qt:history'

// ── localStorage 旧键（用于一次性迁移） ──
const LEGACY_KEYS = {
  [KEY_PROGRESS]: 'quick-tools-progress',
  [KEY_DOUBTS]: 'quick-tools-doubts',
  [KEY_NOTES]: 'quick-tools-notes',
}

/**
 * 读取数据（IDB 优先，回退 localStorage 旧数据）
 */
export async function readQt(idbKey) {
  // 先尝试 IDB
  const idbData = await get(idbKey, qtStore)
  if (idbData) return idbData

  // IDB 无数据 → 尝试从 localStorage 迁移
  const legacyKey = LEGACY_KEYS[idbKey]
  if (legacyKey) {
    try {
      const raw = localStorage.getItem(legacyKey)
      if (raw) {
        const data = JSON.parse(raw)
        if (data && data.length > 0) {
          // 写入 IDB 并清除 localStorage
          await set(idbKey, data, qtStore)
          localStorage.removeItem(legacyKey)
          return data
        }
      }
    } catch {
      // localStorage 读取/解析失败，忽略
    }
  }

  // 返回默认空数组
  return []
}

/**
 * 写入数据（仅 IDB）
 * 注意：Vue 响应式 Proxy 对象无法被 IDB 结构化克隆，必须先 toRaw 脱敏
 */
export async function writeQt(idbKey, data) {
  await set(idbKey, toRaw(data), qtStore)
}

// ── 键名导出（供各工具使用） ──
export { KEY_PROGRESS, KEY_DOUBTS, KEY_NOTES, KEY_HISTORY }
