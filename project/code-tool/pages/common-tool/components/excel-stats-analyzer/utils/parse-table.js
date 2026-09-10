/**
 * 表格数据解析与统计分析工具
 */
import * as XLSX from 'xlsx'

const CR = String.fromCharCode(13)
const LF = String.fromCharCode(10)
const CRLF = CR + LF

/**
 * 按制表符或多空格分割单行
 */
export const splitLine = (line) => {
  if (line.includes('\t')) return line.split('\t')
  return line.split(/\s{2,}/)
}

/**
 * 解析粘贴的表格文本，返回 { headers, rows }
 * - 兼容 \r\n / \n / \r 换行
 * - 首行为标题（制表符分隔）
 * - 兼容 Confluence 首行可能是合并标题的情况
 */
export const parseTableText = (val) => {
  if (!val || !val.trim()) {
    return { headers: [], rows: [], error: '' }
  }

  try {
    // 统一换行符
    const normalized = val.split(CRLF).join(LF).split(CR).join(LF)
    const lines = normalized.split(LF).filter((l) => l.trim() !== '')

    if (lines.length < 2) {
      return { headers: [], rows: [], error: '至少需要 2 行数据（首行标题 + 至少 1 行数据）' }
    }

    const firstLineFields = splitLine(lines[0])
    const secondLineFields = splitLine(lines[1])

    // 如果首行只有 1 列但第二行有多列，说明首行可能是标题行（合并单元格），跳过
    let headerLineIdx = 0
    if (firstLineFields.length <= 1 && secondLineFields.length > 1) {
      headerLineIdx = 1
    }

    const rawHeaders = splitLine(lines[headerLineIdx])
    const headers = rawHeaders.map((h, i) => h.trim() || `列${i + 1}`)

    const rows = []
    for (let i = headerLineIdx + 1; i < lines.length; i++) {
      const fields = splitLine(lines[i])
      if (fields.length === 0) continue
      const row = { __index: i }
      headers.forEach((h, idx) => {
        row[h] = (fields[idx] || '').trim()
      })
      rows.push(row)
    }

    return { headers, rows, error: '' }
  } catch (e) {
    return { headers: [], rows: [], error: '解析失败：' + e.message }
  }
}

/**
 * 根据解析后的数据计算每列的统计信息
 */
export const computeStatColumns = (headers, rows) => {
  return headers.map((h) => {
    const values = rows.map((r) => r[h]).filter((v) => v !== '' && v != null)
    const numericValues = values.map(Number).filter((v) => !isNaN(v))
    const isNumeric = numericValues.length >= values.length * 0.6 && numericValues.length > 0

    if (isNumeric) {
      const sorted = [...numericValues].sort((a, b) => a - b)
      const sum = sorted.reduce((a, b) => a + b, 0)
      const avg = sum / sorted.length
      const mid =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
      // 标准差
      const variance = sorted.reduce((acc, v) => acc + (v - avg) ** 2, 0) / sorted.length
      const stdDev = Math.sqrt(variance)
      return {
        name: h,
        label: h,
        isNumeric: true,
        stats: {
          sum,
          avg,
          max: sorted[sorted.length - 1],
          min: sorted[0],
          median: mid,
          stdDev,
          count: sorted.length,
        },
      }
    } else {
      const countMap = {}
      values.forEach((v) => {
        const key = String(v)
        countMap[key] = (countMap[key] || 0) + 1
      })
      const total = values.length
      const sorted = Object.entries(countMap)
        .map(([value, count]) => ({ value, count, percent: ((count / total) * 100).toFixed(1) }))
        .sort((a, b) => b.count - a.count)
      return {
        name: h,
        label: h,
        isNumeric: false,
        stats: {
          uniqueCount: sorted.length,
          topValue: sorted[0]?.value || '-',
          topCount: sorted[0]?.count || 0,
          topPercent: sorted[0]?.percent || '0',
          topN: sorted.slice(0, 8),
          distribution: sorted,
          count: total,
        },
      }
    }
  })
}

/**
 * 格式化数字显示
 */
export const formatNum = (n) => {
  if (n == null) return '-'
  return Number.isInteger(n) ? n.toLocaleString() : Number(n.toFixed(2)).toLocaleString()
}

/**
 * 将 rows 转为纯数据（去除 __index）
 * @param {Array} headers - 表头
 * @param {Array} rows - 数据行
 * @param {boolean} withIndex - 是否在首列插入序号列
 */
export const toPlainData = (headers, rows, withIndex = false) => {
  return rows.map((r, idx) => {
    const obj = {}
    if (withIndex) obj['序号'] = idx + 1
    headers.forEach((h) => (obj[h] = r[h]))
    return obj
  })
}

/**
 * 解析文件（xlsx/csv/tsv），返回 { headers, rows, error }
 */
export const parseFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (json.length < 2) {
          resolve({ headers: [], rows: [], error: '文件数据不足，至少需要标题行 + 1 行数据' })
          return
        }
        const headers = json[0].map((h, i) => String(h).trim() || `列${i + 1}`)
        const rows = json
          .slice(1)
          .filter((row) => row.some((c) => String(c).trim() !== ''))
          .map((row, idx) => {
            const r = { __index: idx + 1 }
            headers.forEach((h, i) => {
              r[h] = String(row[i] ?? '').trim()
            })
            return r
          })
        resolve({ headers, rows, error: '' })
      } catch (err) {
        resolve({ headers: [], rows: [], error: '文件解析失败：' + err.message })
      }
    }
    reader.onerror = () => resolve({ headers: [], rows: [], error: '文件读取失败' })
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 按指定列分组，对目标数值列进行统计
 * @param {Array} rows - 数据行
 * @param {string} groupCol - 分组列名
 * @param {string} valueCol - 统计的数值列名
 * @returns {Array} 分组统计结果
 */
export const computeGroupStats = (rows, groupCol, valueCol) => {
  const groups = {}
  rows.forEach((r) => {
    const key = String(r[groupCol] || '').trim()
    if (!key) return
    if (!groups[key]) groups[key] = []
    const val = Number(r[valueCol])
    if (!isNaN(val)) groups[key].push(val)
  })
  return Object.entries(groups)
    .map(([name, vals]) => {
      const sum = vals.reduce((a, b) => a + b, 0)
      return {
        name,
        count: vals.length,
        sum,
        avg: vals.length ? sum / vals.length : 0,
        max: vals.length ? Math.max(...vals) : 0,
        min: vals.length ? Math.min(...vals) : 0,
      }
    })
    .sort((a, b) => b.sum - a.sum)
}
