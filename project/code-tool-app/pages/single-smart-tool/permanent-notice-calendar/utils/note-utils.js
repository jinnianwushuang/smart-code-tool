/**
 * 根据备注内容返回颜色标识（Quasar color name）
 * @param {string} content - 备注内容
 * @returns {string} Quasar 颜色名
 */
export const getNoteColor = (content) => {
  if (content.includes('生日') || content.includes('纪念')) return 'red'
  if (content.includes('加班') || content.includes('工作')) return 'blue'
  return 'orange'
}

/**
 * 获取指定日期的备注列表
 * @param {Array} allNotes - 全部备注数组
 * @param {dayjs} current - dayjs 日期对象
 * @returns {Array}
 */
export const getNotesByDate = (allNotes, current) => {
  const dStr = current.format('YYYY-MM-DD')
  return allNotes.filter((n) => n.date === dStr)
}

/**
 * 计算指定日期距今的天数差及可读描述
 * @param {string} dateStr - YYYY-MM-DD 格式日期
 * @param {Function} dayjs - dayjs 工厂函数
 * @returns {{ diff: number, label: string, isPast: boolean, isToday: boolean }}
 */
export const getDateDistanceInfo = (dateStr, dayjs) => {
  const today = dayjs().startOf('day')
  const target = dayjs(dateStr)
  const diff = target.diff(today, 'day')

  if (diff === 0) {
    return { diff, label: '今天', isPast: false, isToday: true }
  }

  const absDiff = Math.abs(diff)
  const isPast = diff < 0

  // 生成可读描述
  let readable = ''
  if (absDiff < 7) {
    readable = `${absDiff} 天`
  } else if (absDiff < 30) {
    const weeks = Math.floor(absDiff / 7)
    const remainDays = absDiff % 7
    readable = remainDays > 0 ? `${weeks} 周 ${remainDays} 天` : `${weeks} 周`
  } else if (absDiff < 365) {
    const months = Math.floor(absDiff / 30)
    const remainDays = absDiff - months * 30
    readable = remainDays > 0 ? `${months} 个月 ${remainDays} 天` : `${months} 个月`
  } else {
    const years = Math.floor(absDiff / 365)
    const remainAfterYears = absDiff - years * 365
    const months = Math.floor(remainAfterYears / 30)
    readable = months > 0 ? `${years} 年 ${months} 个月` : `${years} 年`
  }

  return {
    diff,
    label: isPast ? `${absDiff} 天 · ${readable}前` : `${absDiff} 天 · ${readable}后`,
    isPast,
    isToday: false,
  }
}
