/**
 * 数据导出工具：JSON / CSV / Excel 导出逻辑
 */
import * as XLSX from 'xlsx'
import { exportFile } from 'quasar'
import dayjs from 'dayjs'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'
import { toPlainData, formatNum } from './parse-table.js'
import { TIMESTAMP_FORMAT } from './constants.js'

/** 生成时间戳字符串 */
export const getTimestamp = () => dayjs().format(TIMESTAMP_FORMAT)

/**
 * 获取导出数据（纯数据，不含映射）
 */
export const getExportData = (headers, rows, enableIndex) => toPlainData(headers, rows, enableIndex)

/**
 * 根据 keyMapping 生成映射后的数据
 */
export const buildMappedData = (keyMapping, headers, rows, enableIndex) => {
  const originalKeys = Object.keys(keyMapping)
  return rows.map((r, idx) => {
    const obj = {}
    if (enableIndex) obj[keyMapping['序号'] || 'index'] = idx + 1
    originalKeys.forEach((origKey) => {
      if (origKey === '序号') return
      obj[keyMapping[origKey]] = r[origKey]
    })
    return obj
  })
}

/**
 * 生成 key 映射对象（新键 -> 原始键）
 */
export const buildKeyMapping = (keyMapping, headers, enableIndex) => {
  if (keyMapping) {
    // 弹窗配置模式：反转映射（新键 -> 原始键）
    const mapping = {}
    Object.entries(keyMapping).forEach(([orig, mapped]) => {
      mapping[mapped] = orig
    })
    return mapping
  }
  // 直接导出模式：键名不变
  const mapping = {}
  if (enableIndex) mapping['index'] = '序号'
  headers.forEach((h) => (mapping[h] = h))
  return mapping
}

/**
 * 复制 JSON 到剪贴板
 */
export const copyJsonToClipboard = (data) => {
  projectCopyText(JSON.stringify(data, null, 2))
}

/**
 * 导出 JSON 文件（数据 + 映射文件）
 */
export const downloadJsonFiles = (data, keyMapping, timestamp) => {
  const ts = timestamp || getTimestamp()
  exportFile(`表格统计数据_${ts}.json`, JSON.stringify(data, null, 2))
  exportFile(`表格统计数据_${ts}_mapping.json`, JSON.stringify(keyMapping, null, 2))
}

/**
 * 导出 CSV 文件
 */
export const downloadCsv = (data, timestamp) => {
  if (!data.length) return
  const ts = timestamp || getTimestamp()
  const headerKeys = Object.keys(data[0])
  const lines = [headerKeys.join(',')]
  data.forEach((row) => {
    lines.push(
      headerKeys
        .map((k) => {
          const v = String(row[k] ?? '')
          return v.includes(',') || v.includes('"') || v.includes('\n')
            ? `"${v.replace(/"/g, '""')}"`
            : v
        })
        .join(','),
    )
  })
  const bom = '\uFEFF'
  exportFile(`表格统计数据_${ts}.csv`, bom + lines.join('\n'))
}

/**
 * 导出 Excel 文件（含统计摘要行）
 */
export const downloadExcel = (data, statColumns, enableIndex, timestamp) => {
  const ts = timestamp || getTimestamp()
  const statsRow = {}
  if (enableIndex) statsRow['序号'] = ''
  statColumns.forEach((col) => {
    if (col.isNumeric) {
      statsRow[col.name] =
        `总和: ${formatNum(col.stats.sum)} | 平均: ${formatNum(col.stats.avg)} | 标准差: ${formatNum(col.stats.stdDev)}`
    } else {
      statsRow[col.name] =
        `去重: ${col.stats.uniqueCount} | 最多: ${col.stats.topValue}(${col.stats.topCount})`
    }
  })

  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.sheet_add_json(ws, [statsRow], { skipHeader: true, origin: -1 })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '统计数据')
  XLSX.writeFile(wb, `表格统计分析_${ts}.xlsx`)
}
