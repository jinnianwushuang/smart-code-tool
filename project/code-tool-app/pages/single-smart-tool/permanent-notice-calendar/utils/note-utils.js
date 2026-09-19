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
