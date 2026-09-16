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

/** 秒数格式化为可读时间 */
export const formatSeconds = (seconds) => {
  if (seconds < 60) return `${seconds}秒`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}分钟`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}小时${rm}分`
}
