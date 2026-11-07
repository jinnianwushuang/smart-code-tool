import dayjs from 'dayjs'

/**
 * 导出文件名时间戳格式：年月日时分秒，中横线分割
 * 例：2026-11-07-21-10-22
 */
export const EXPORT_TIMESTAMP_FORMAT = 'YYYY-MM-DD-HH-mm-ss'

/**
 * 生成导出用时间戳字符串（本地时间，年月日时分秒，中横线分割）
 * @returns {string} 如 2026-11-07-21-10-22
 * @description 使用 dayjs 取本地时间，禁止直接截取 ISO 字符串（会带 UTC 时区偏差）。
 */
export const getExportTimestamp = () => dayjs().format(EXPORT_TIMESTAMP_FORMAT)

/**
 * 构建带时间戳后缀的导出文件名（年月日时分秒，中横线分割）
 * @param {string} baseName - 基础文件名（不含扩展名），如 "治理结果"
 * @param {string} [ext] - 扩展名，含或不含点均可（如 "pdf" 或 ".pdf"）；不传则只返回 baseName-时间戳
 * @returns {string} 如 治理结果-2026-11-07-21-10-22.xlsx
 * @description 全项目所有导出功能统一使用本函数生成文件名，保证时间戳格式一致。
 */
export const buildExportFileName = (baseName, ext) => {
  const stamped = `${baseName}-${getExportTimestamp()}`
  if (!ext) return stamped
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`
  return `${stamped}${normalizedExt}`
}
