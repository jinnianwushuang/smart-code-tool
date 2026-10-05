/**
 * 文档 ID 映射器 — 供 Progress/Doubt/Note 等工具使用
 *
 * 职责：
 * - 获取 doc-list.json，建立 URL ↔ docId 双向映射
 * - 提供 URL → docId 查找
 * - 提供旧数据自动迁移（为无 docId 的记录补上 docId）
 */

import { DOC_LIST_URL } from './constants'

let urlToIdMap = null
let idToDocMap = null
let initPromise = null

/** 懒初始化（仅首次调用时 fetch） */
async function ensureInit() {
  if (urlToIdMap) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const res = await fetch(DOC_LIST_URL)
      if (!res.ok) return
      const data = await res.json()
      const docs = Array.isArray(data) ? data : data.docs || []

      urlToIdMap = new Map()
      idToDocMap = new Map()

      for (const doc of docs) {
        if (doc.id && doc.url) {
          urlToIdMap.set(doc.url, doc.id)
          idToDocMap.set(doc.id, { id: doc.id, url: doc.url, title: doc.title, group: doc.group })
        }
      }
    } catch {
      // 获取失败时映射表为空，不影响功能
    }
  })()

  return initPromise
}

/** 根据 URL 查找 docId（异步，首次会 fetch doc-list） */
export async function getDocIdByUrl(url) {
  await ensureInit()
  if (!urlToIdMap) return null
  if (urlToIdMap.has(url)) return urlToIdMap.get(url)
  // 规范化：去掉尾部斜杠再试
  const normalized = url.replace(/\/$/, '')
  for (const [docUrl, docId] of urlToIdMap) {
    if (docUrl.replace(/\/$/, '') === normalized) return docId
  }
  return null
}

/** 根据 docId 查找文档信息 */
export async function getDocInfoById(docId) {
  await ensureInit()
  return idToDocMap?.get(docId) || null
}

/**
 * 批量迁移旧记录：为没有 docId 的记录补上 docId
 * 返回 { migrated: number, records: Array }
 */
export async function migrateRecords(records) {
  await ensureInit()
  if (!urlToIdMap) return { migrated: 0, records }

  let migrated = 0
  for (const record of records) {
    if (!record.docId && record.url) {
      const docId = urlToIdMap.get(record.url)
      if (docId) {
        record.docId = docId
        migrated++
      }
    }
  }
  return { migrated, records }
}

/**
 * 在记录列表中按 docId 优先查找，回退到 URL 匹配
 * 返回匹配的 record 或 undefined
 */
export function findByDocIdOrUrl(records, docId, url) {
  // 优先 docId 匹配
  if (docId) {
    const byId = records.find((r) => r.docId === docId)
    if (byId) return byId
  }
  // 回退 URL 匹配（兼容旧数据）
  if (url) {
    return records.find((r) => r.url === url)
  }
  return undefined
}

/**
 * 在记录列表中按 docId 优先查找索引，回退到 URL 匹配
 * 返回索引或 -1
 */
export function findIndexByDocIdOrUrl(records, docId, url) {
  if (docId) {
    const idx = records.findIndex((r) => r.docId === docId)
    if (idx !== -1) return idx
  }
  if (url) {
    return records.findIndex((r) => r.url === url)
  }
  return -1
}
