import { Solar } from 'lunar-javascript'

/**
 * 获取农历日（含干支年），用于日历单元格显示
 * @param {dayjs} current - dayjs 日期对象
 * @returns {string} 如 "丙午 初一"
 */
export const getLunarDay = (current) => {
  const lun = Solar.fromDate(current.toDate()).getLunar()
  return `${lun.getYearInGanZhi()} ${lun.getDayInChinese()}`
}

/**
 * 获取节日/节气名称
 * @param {dayjs} current - dayjs 日期对象
 * @returns {string|null}
 */
export const getFestival = (current) => {
  const sol = Solar.fromDate(current.toDate())
  const lun = sol.getLunar()
  const f = [...lun.getFestivals(), ...sol.getFestivals(), ...lun.getJieQi()]
  return f.length > 0 ? f[0] : null
}

/**
 * 获取完整农历详情（干支年+生肖+农历月日）
 * @param {dayjs} day - dayjs 日期对象
 * @returns {string} 如 "丙午年(马) 三月初一"
 */
export const getFullLunarDetail = (day) => {
  const lun = Solar.fromDate(day.toDate()).getLunar()
  return `${lun.getYearInGanZhi()}年(${lun.getYearShengXiao()}) ${lun.getMonthInChinese()}月${lun.getDayInChinese()}`
}
