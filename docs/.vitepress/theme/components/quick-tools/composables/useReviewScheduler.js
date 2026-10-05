/**
 * 抗遗忘复习系统 — 调度引擎
 *
 * 双模式支持：
 *   1. FSRS（默认）：基于 ts-fsrs 的机器学习间隔重复
 *   2. Ebbinghaus：经典固定间隔（5min → 30min → 12h → 1d → 2d → 4d → 7d → 15d）
 *
 * 评分映射：
 *   😟 忘了 → Again (1)  |  😐 有印象 → Hard (2)  |  🙂 记得 → Good (3)  |  😎 秒记 → Easy (4)
 */

import { fsrs, createEmptyCard, Rating } from 'ts-fsrs'

// ── 经典艾宾浩斯固定间隔（单位：天）──
const EBBINGHAUS_INTERVALS = [
  5 / 1440, // 5 分钟
  30 / 1440, // 30 分钟
  0.5, // 12 小时
  1, // 1 天
  2, // 2 天
  4, // 4 天
  7, // 7 天
  15, // 15 天
]

// ── 评分枚举（UI 层使用）──
export const REVIEW_RATING = {
  FORGOT: 'again', // 😟 忘了
  HARD: 'hard', // 😐 有印象
  GOOD: 'good', // 🙂 记得
  EASY: 'easy', // 😎 秒记
}

// ── 字符串 Rating → ts-fsrs 数值 Rating ──
const RATING_MAP = {
  [REVIEW_RATING.FORGOT]: Rating.Again,
  [REVIEW_RATING.HARD]: Rating.Hard,
  [REVIEW_RATING.GOOD]: Rating.Good,
  [REVIEW_RATING.EASY]: Rating.Easy,
}

/**
 * useReviewScheduler — 调度引擎工厂
 *
 * @param {object} settings - 用户配置 { algorithm, requestRetention, maximumInterval, ... }
 * @returns 调度引擎实例
 */
export function useReviewScheduler(settings = {}) {
  const algorithm = settings.algorithm || 'fsrs'
  const requestRetention = settings.requestRetention || 0.9
  const maximumInterval = settings.maximumInterval || 365

  // 创建 FSRS 实例
  const f = fsrs({
    request_retention: requestRetention,
    maximum_interval: maximumInterval,
    enable_fuzz: true,
  })

  /**
   * 首次学习调度（自动学习达标后调用）
   *
   * @param {object} record - ReviewRecord
   * @returns {object} 更新后的 FSRS 字段
   */
  function scheduleFirstLearn(record) {
    if (algorithm === 'ebbinghaus') {
      return scheduleEbbinghaus(record, 0)
    }

    const card = createEmptyCard()
    const now = new Date()
    const result = f.next(card, now, Rating.Good)

    return {
      state: stateToString(result.card.state),
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      due: result.card.due.toISOString(),
      lastReview: result.card.last_review?.toISOString() || now.toISOString(),
      reviewCount: result.card.reps,
      lapses: result.card.lapses,
    }
  }

  /**
   * 复习调度（用户评分后调用）
   *
   * @param {object} record - ReviewRecord（包含当前 FSRS 字段）
   * @param {string} ratingStr - 评分字符串：'again' | 'hard' | 'good' | 'easy'
   * @returns {object} { fsrsFields, logEntry }
   */
  function scheduleReview(record, ratingStr) {
    const rating = RATING_MAP[ratingStr]
    if (rating === undefined) {
      throw new Error(`无效的评分: ${ratingStr}`)
    }

    if (algorithm === 'ebbinghaus') {
      const fields = scheduleEbbinghaus(record, record.reviewCount)
      const logEntry = createLogEntry(ratingStr, fields)
      return { fsrsFields: fields, logEntry }
    }

    // FSRS 模式
    const card = recordToCard(record)
    const now = new Date()
    // 如果 due 已过期，使用 due 时间作为 review 时间（而非当前时间）
    const reviewTime = new Date(record.due) < now ? new Date(record.due) : now
    const result = f.next(card, reviewTime, rating)

    const fsrsFields = {
      state: stateToString(result.card.state),
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      due: result.card.due.toISOString(),
      lastReview: result.card.last_review?.toISOString() || now.toISOString(),
      reviewCount: result.card.reps,
      lapses: result.card.lapses,
    }

    const logEntry = {
      timestamp: now.toISOString(),
      type: 'review',
      rating: ratingStr,
      interval: result.log.scheduled_days,
      elapsedDays: result.log.elapsed_days,
    }

    return { fsrsFields, logEntry }
  }

  /**
   * 经典艾宾浩斯调度
   */
  function scheduleEbbinghaus(record, reviewIndex) {
    const days = EBBINGHAUS_INTERVALS[reviewIndex] ?? 30
    const now = new Date()
    const due = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return {
      state: reviewIndex < EBBINGHAUS_INTERVALS.length ? 'learning' : 'review',
      stability: days,
      difficulty: 5,
      due: due.toISOString(),
      lastReview: now.toISOString(),
      reviewCount: record.reviewCount + 1,
      lapses: record.lapses,
    }
  }

  /**
   * 获取今日到期待复习的记录
   */
  function getDueRecords(records) {
    const now = new Date()
    return records
      .filter((r) => !r.isArchived && !r.isDismissed && r.autoLearnedAt && new Date(r.due) <= now)
      .sort((a, b) => new Date(a.due) - new Date(b.due))
  }

  /**
   * 获取即将到期的记录（未来 N 天）
   */
  function getUpcomingRecords(records, days = 7) {
    const now = new Date()
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return records
      .filter(
        (r) =>
          !r.isArchived &&
          !r.isDismissed &&
          r.autoLearnedAt &&
          new Date(r.due) > now &&
          new Date(r.due) <= future,
      )
      .sort((a, b) => new Date(a.due) - new Date(b.due))
  }

  // ── 内部工具函数 ──

  /** ReviewRecord → ts-fsrs Card */
  function recordToCard(record) {
    return {
      due: new Date(record.due),
      stability: record.stability || 0,
      difficulty: record.difficulty || 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: record.reviewCount || 0,
      lapses: record.lapses || 0,
      learning_steps: 0,
      state: stringToState(record.state),
      last_review: record.lastReview ? new Date(record.lastReview) : undefined,
    }
  }

  /** State 数值 → 字符串 */
  function stateToString(state) {
    const map = { 0: 'new', 1: 'learning', 2: 'review', 3: 'relearning' }
    return map[state] || 'new'
  }

  /** 字符串 → State 数值 */
  function stringToState(state) {
    const map = { new: 0, learning: 1, review: 2, relearning: 3 }
    return map[state] ?? 0
  }

  /** 创建复习日志条目 */
  function createLogEntry(ratingStr, fields) {
    return {
      timestamp: new Date().toISOString(),
      type: 'review',
      rating: ratingStr,
      interval: fields.stability,
      elapsedDays: 0,
    }
  }

  return {
    scheduleFirstLearn,
    scheduleReview,
    getDueRecords,
    getUpcomingRecords,
    REVIEW_RATING,
  }
}
