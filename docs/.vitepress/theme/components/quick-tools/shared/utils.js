/**
 * utils.js — 快捷工具纯函数工具集
 *
 * 包含：
 * - dayjs 初始化（中文相对时间）
 * - localStorage 安全读写
 * - 相对时间格式化（刚刚/X分钟前/X小时前/X天前/X个月前）
 * - 导出文件时间戳生成
 * - 浏览器下载触发
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export { dayjs }

/** 安全读取 localStorage */
export const readStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

/** 写入 localStorage */
export const writeStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

/** 相对时间格式化（中文） */
export const formatRelative = (time) => {
  if (!time) return ''
  const d = dayjs(time)
  const diffMin = dayjs().diff(d, 'minute')
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffHour = dayjs().diff(d, 'hour')
  if (diffHour < 24) return `${diffHour} 小时前`
  const diffDay = dayjs().diff(d, 'day')
  if (diffDay < 30) return `${diffDay} 天前`
  const diffMonth = dayjs().diff(d, 'month')
  if (diffMonth < 12) return `${diffMonth} 个月前`
  return d.format('YYYY-MM-DD')
}

/** 生成导出文件名的时间戳后缀（YYYY-MM-DD_HHmm） */
export const exportTimestamp = () => dayjs().format('YYYY-MM-DD_HHmm')

/** 触发浏览器下载文本文件 */
export const downloadText = (filename, content, mime = 'text/markdown;charset=utf-8') => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 时间戳格式化（转本地时间）
 *
 * 支持两种输入：
 * - ISO 格式: "2026-10-09T14:30:25.000Z" (UTC) → 转本地时间
 * - 无时区格式: "2026-10-09 14:30:25" (已是本地时间，如 git 时间戳)
 *
 * 输出: "YYYY-MM-DD HH:mm:ss" (本地时间)
 */
export function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T'))
  if (isNaN(d.getTime())) return ts
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

/**
 * 时间戳提取日期部分（本地时间）
 * 输出: "YYYY-MM-DD"
 */
export function formatDatePart(ts) {
  return formatTimestamp(ts).slice(0, 10)
}

/**
 * 获取今天的日期字符串（本地时间）
 * 输出: "YYYY-MM-DD"
 */
export function todayStr() {
  return formatDatePart(new Date().toISOString())
}
