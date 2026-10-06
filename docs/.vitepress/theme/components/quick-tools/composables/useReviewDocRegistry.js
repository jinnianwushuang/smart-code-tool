/**
 * 抗遗忘复习系统 — 文档清单管理
 *
 * 职责：
 * - 从 doc-list.json 获取全站文档清单
 * - 建立 URL ↔ docId 的双向映射
 * - 检测文档增删、URL/标题变更
 * - 提供盲区检测数据
 */

import { ref } from 'vue'
import { DOC_LIST_URL } from '../shared/constants'
import { injectDocList, stripBase } from '../shared/useDocIdMapper'

/**
 * useReviewDocRegistry — 文档清单管理
 *
 * @param {object} storage - useReviewStorage 实例
 */
export function useReviewDocRegistry(storage) {
  /** 全站文档清单 */
  const docList = ref([])
  /** URL → docId 映射 */
  const urlToIdMap = new Map()
  /** docId → 文档信息 映射 */
  const idToDocMap = new Map()
  /** 是否已初始化 */
  let initialized = false

  /**
   * 初始化：加载 doc-list.json 并建立映射
   */
  async function init() {
    if (initialized) return

    try {
      const response = await fetch(DOC_LIST_URL)
      if (!response.ok) throw new Error(`Failed to fetch doc-list: ${response.status}`)
      const data = await response.json()

      // doc-list.json 可能是数组或 { docs: [...] } 格式
      const docs = Array.isArray(data) ? data : data.docs || []
      docList.value = docs

      // 建立双向映射
      for (const doc of docs) {
        if (doc.id && doc.url) {
          urlToIdMap.set(doc.url, doc.id)
          idToDocMap.set(doc.id, {
            id: doc.id,
            url: doc.url,
            title: doc.title,
            group: doc.group || '未分组',
          })
        }
      }

      // 注入数据到共享 mapper，避免 Progress/Doubt/Note 重复 fetch
      injectDocList(docs)

      // 保存文档快照
      await storage.saveDocSnapshot({
        version: 1,
        updatedAt: new Date().toISOString(),
        docs: docs.map((d) => ({ url: d.url, title: d.title, group: d.group })),
      })

      initialized = true
    } catch (err) {
      console.warn('[DocRegistry] 加载文档清单失败:', err.message)
    }
  }

  /**
   * 根据 URL 查找 docId（剥离 VitePress base 前缀后匹配）
   */
  function getDocIdByUrl(url) {
    const cleanUrl = stripBase(url)
    // 尝试精确匹配
    if (urlToIdMap.has(cleanUrl)) return urlToIdMap.get(cleanUrl)

    // 尝试规范化匹配（去掉尾部斜杠）
    const normalized = cleanUrl.replace(/\/$/, '')
    for (const [docUrl, docId] of urlToIdMap) {
      if (docUrl.replace(/\/$/, '') === normalized) return docId
    }

    return null
  }

  /**
   * 根据 docId 查找文档信息
   */
  function getDocInfoById(docId) {
    return idToDocMap.get(docId) || null
  }

  /**
   * 同步文档清单与 IndexedDB 记录：
   * - 旧记录修复 → 补全 docId + 规范化 URL
   * - 新增文档 → 自动创建空记录
   * - 删除文档 → 标记 isArchived
   * - URL/标题变更 → 更新记录
   */
  async function syncDocsWithRecords() {
    const allRecords = storage.getAllRecords()
    const recordsToUpdate = []
    let changes = { added: 0, archived: 0, updated: 0, migrated: 0 }

    // 0. 修复旧记录：补全 docId + 规范化 URL（完整 URL → 路径格式）
    for (const record of allRecords) {
      if (!record.docId && record.url) {
        const cleanUrl = stripBase(record.url)
        const docId = urlToIdMap.get(cleanUrl)
        if (docId) {
          record.docId = docId
          record.url = cleanUrl
          const docInfo = idToDocMap.get(docId)
          if (docInfo) {
            record.title = docInfo.title
            record.group = docInfo.group
          }
          recordsToUpdate.push(record)
          changes.migrated++
        }
      }
    }

    // 重新构建 recordIds（包含已迁移的 docId）
    const recordIds = new Set(allRecords.map((r) => r.docId).filter(Boolean))

    // 1. 检测新增文档（doc-list 中有但 IndexedDB 中无）
    for (const doc of docList.value) {
      if (!recordIds.has(doc.id)) {
        storage.getOrCreateRecord(doc.id, doc.url, doc.title, doc.group)
        changes.added++
      }
    }

    // 2. 检测 URL/标题变更 + 归档已删除文档
    for (const record of allRecords) {
      // 跳过刚迁移过的记录（已更新，无需重复处理）
      if (recordsToUpdate.includes(record)) continue

      const docInfo = idToDocMap.get(record.docId)

      if (!docInfo) {
        // 文档已从清单中删除 → 归档
        if (!record.isArchived) {
          record.isArchived = true
          recordsToUpdate.push(record)
          changes.archived++
        }
      } else {
        // 文档存在 → 同步 URL/标题
        let changed = false
        if (record.isArchived) {
          record.isArchived = false
          changed = true
        }
        if (record.url !== docInfo.url) {
          record.url = docInfo.url
          changed = true
        }
        if (record.title !== docInfo.title) {
          record.title = docInfo.title
          changed = true
        }
        if (record.group !== docInfo.group) {
          record.group = docInfo.group
          changed = true
        }
        if (changed) {
          recordsToUpdate.push(record)
          changes.updated++
        }
      }
    }

    if (recordsToUpdate.length > 0) {
      await storage.saveRecords(recordsToUpdate)
    }

    return changes
  }

  /**
   * 获取文档盲区数据
   *
   * 返回三类盲区：
   * - neverOpened: 从未打开（在 doc-list 中但 IndexedDB 无记录）
   * - neverLearned: 从未学习（有记录但 autoLearnedAt 为 null）
   * - neverReviewed: 从未复习（已学习但 reviewCount 为 0）
   */
  function getBlindSpots() {
    const allRecords = storage.getAllRecords()
    const recordMap = new Map(allRecords.map((r) => [r.docId, r]))

    const neverOpened = []
    const neverLearned = []
    const neverReviewed = []

    for (const doc of docList.value) {
      const record = recordMap.get(doc.id)

      if (!record) {
        neverOpened.push(doc)
      } else if (!record.autoLearnedAt && !record.isArchived && !record.isDismissed) {
        neverLearned.push({ ...doc, accumulatedSeconds: record.accumulatedSeconds })
      } else if (
        record.autoLearnedAt &&
        record.reviewCount === 0 &&
        !record.isArchived &&
        !record.isDismissed
      ) {
        neverReviewed.push({ ...doc, autoLearnedAt: record.autoLearnedAt })
      }
    }

    return { neverOpened, neverLearned, neverReviewed }
  }

  /**
   * 获取文档总数
   */
  function getTotalDocCount() {
    return docList.value.length
  }

  return {
    docList,
    init,
    getDocIdByUrl,
    getDocInfoById,
    syncDocsWithRecords,
    getBlindSpots,
    getTotalDocCount,
  }
}
