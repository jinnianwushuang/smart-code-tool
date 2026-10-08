/**
 * useDocIdMapper.js — 文档 ID 映射器
 *
 * 架构层级：共享基础设施
 * 职责：
 *   - 建立 URL ↔ docId 双向映射
 *   - 提供 URL → docId 查找（getDocIdByUrl）
 *   - 提供 docId → 文档元数据查找（getTagsById/getTimestampsById）
 *   - 提供旧数据自动迁移（为无 docId 的记录补上 docId）
 *
 * 数据源策略：
 *   - 优先由 useReviewDocRegistry 加载后注入（injectDocList），零额外请求
 *   - 兜底：若无人注入，首次调用时自行 fetch doc-list.json
 */

import { DOC_LIST_URL } from './constants'

let urlToIdMap = null
let idToDocMap = null
let initPromise = null

/**
 * 将运行时 URL 规范化为 doc-list 格式
 *
 * 输入可能是：
 *   完整 URL: https://jinnianwushuang.github.io/smart-code-tool/interview/react/xxx.html
 *   带 base 路径: /smart-code-tool/interview/react/xxx.html
 *   纯路径: /interview/react/xxx
 *
 * 输出统一为: /interview/react/xxx
 *
 * 剥离：① 域名  ② base 前缀  ③ .html 后缀
 */
export function stripBase(url) {
  if (!url) return url
  let clean = url

  // ① 剥离域名，提取 pathname
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      clean = new URL(clean).pathname
    } catch {
      return url
    }
  }

  // ② 剥离 VitePress base 前缀（如 /smart-code-tool/）
  const base = import.meta.env.BASE_URL || '/'
  if (base && base !== '/' && clean.startsWith(base)) {
    clean = '/' + clean.slice(base.length)
  }

  // ③ 剥离 .html 后缀（VitePress 生产环境生成）
  if (clean.endsWith('.html')) {
    clean = clean.slice(0, -5)
  }

  return clean
}

/** 内部：从 docs 数组构建映射表 */
function buildMaps(docs) {
  urlToIdMap = new Map()
  idToDocMap = new Map()
  for (const doc of docs) {
    if (doc.id && doc.url) {
      urlToIdMap.set(doc.url, doc.id)
      idToDocMap.set(doc.id, {
        id: doc.id,
        url: doc.url,
        title: doc.title,
        group: doc.group,
        tags: doc.tags || [],
        createdAt: doc.createdAt || null,
        updatedAt: doc.updatedAt || null,
      })
    }
  }
}

/**
 * 注入已加载的文档清单（由 useReviewDocRegistry 调用）
 * 避免重复 fetch doc-list.json
 */
export function injectDocList(docs) {
  if (!Array.isArray(docs) || docs.length === 0) return
  buildMaps(docs)
}

/** 懒初始化：优先已注入，否则自行 fetch */
async function ensureInit() {
  if (urlToIdMap) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const res = await fetch(DOC_LIST_URL)
      if (!res.ok) return
      const data = await res.json()
      const docs = Array.isArray(data) ? data : data.docs || []
      buildMaps(docs)
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
  // 剥离 VitePress base 前缀，统一为 doc-list 格式
  const cleanUrl = stripBase(url)
  if (urlToIdMap.has(cleanUrl)) return urlToIdMap.get(cleanUrl)
  // 规范化：去掉尾部斜杠再试
  const normalized = cleanUrl.replace(/\/$/, '')
  for (const [docUrl, docId] of urlToIdMap) {
    if (docUrl.replace(/\/$/, '') === normalized) return docId
  }
  return null
}

/** 根据 docId 查找文档信息（含 tags） */
export async function getDocInfoById(docId) {
  await ensureInit()
  return idToDocMap?.get(docId) || null
}

/** 根据 docId 获取 tags */
export function getTagsById(docId) {
  return idToDocMap?.get(docId)?.tags || []
}

/** 根据 docId 获取时间戳 { createdAt, updatedAt } */
export function getTimestampsById(docId) {
  const doc = idToDocMap?.get(docId)
  return doc
    ? { createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null }
    : { createdAt: null, updatedAt: null }
}

/** 获取所有不重复的 tags 列表 */
export function getAllTags() {
  if (!idToDocMap) return []
  const tagSet = new Set()
  for (const doc of idToDocMap.values()) {
    if (doc.tags) doc.tags.forEach((t) => tagSet.add(t))
  }
  return Array.from(tagSet).sort()
}

/**
 * 批量迁移旧记录：
 * - 为没有 docId 的记录补上 docId
 * - 规范化 URL（完整 URL → 路径格式）
 * 返回 { migrated: number, records: Array }
 */
export async function migrateRecords(records) {
  await ensureInit()
  if (!urlToIdMap) return { migrated: 0, records }

  let migrated = 0
  for (const record of records) {
    let changed = false
    // 规范化 URL（完整 URL → 路径格式）
    if (record.url) {
      const cleanUrl = stripBase(record.url)
      if (cleanUrl !== record.url) {
        record.url = cleanUrl
        changed = true
      }
    }
    // 补全 docId
    if (!record.docId && record.url) {
      const docId = urlToIdMap.get(record.url)
      if (docId) {
        record.docId = docId
        changed = true
      }
    }
    if (changed) migrated++
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
