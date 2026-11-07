import { Marked } from 'marked'
import hljs from 'highlight.js'
import dayjs from 'dayjs'
import 'github-markdown-css/github-markdown-light.css'

// 创建 marked 实例，配置代码高亮
const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(text, { language }).value
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    },
  },
})

/**
 * 构建带时间戳的导出文件名（年月日时分秒，中横线分割）
 * @param {string} baseName - 基础文件名（不含扩展名）
 * @param {string} ext - 扩展名（不含点）
 * @returns {string} 如 markdown-export-2026-11-07-14-30-25.pdf
 */
export function buildTimestampedFileName(baseName, ext) {
  const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss')
  return `${baseName}-${timestamp}.${ext}`
}

/**
 * 将 Markdown 文本渲染为 HTML
 * @param {string} mdText - Markdown 源文本
 * @returns {string} 渲染后的 HTML
 */
export function renderMarkdown(mdText) {
  if (!mdText) return ''
  return marked.parse(mdText)
}

/**
 * 构建完整的带 GitHub 样式的 HTML 文档（用于导出）
 * @param {string} htmlContent - 渲染后的 HTML 内容
 * @returns {string} 完整 HTML 文档字符串
 */
export function buildFullHtmlDocument(htmlContent) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-light.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css">
  <style>
    body {
      max-width: 980px;
      margin: 0 auto;
      padding: 40px;
      background: #fff;
    }
    .markdown-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .markdown-body pre { background: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; }
    .markdown-body code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
    @media print {
      body { margin: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${htmlContent}
  </div>
</body>
</html>`
}

/**
 * 临时解除滚动容器的 max-height / overflow 限制，导出完整内容后再还原。
 * 预览区 .preview-area 设了 max-height:70vh + overflow:auto，
 * 直接截图只会得到可见的第一屏，导致导出的 PDF / 图片被截断。
 * @param {HTMLElement} element - 目标元素
 * @param {() => Promise<any>} task - 在展开状态下执行的导出任务
 * @returns {Promise<any>}
 */
async function withExpandedElement(element, task) {
  const prevMaxHeight = element.style.maxHeight
  const prevOverflow = element.style.overflow
  element.style.maxHeight = 'none'
  element.style.overflow = 'visible'
  try {
    return await task()
  } finally {
    element.style.maxHeight = prevMaxHeight
    element.style.overflow = prevOverflow
  }
}

/**
 * 采样页面背景亮度（取左上角内边距区域），用于让空白行检测同时适配明/暗主题。
 * @param {CanvasRenderingContext2D} ctx
 * @returns {number} 背景亮度 0~255，异常时默认白底 255
 */
function getBackgroundLuminance(ctx) {
  try {
    const d = ctx.getImageData(0, 0, 8, 8).data
    let sum = 0
    let n = 0
    for (let i = 0; i < d.length; i += 4) {
      sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
      n++
    }
    return n ? sum / n : 255
  } catch {
    return 255
  }
}

/**
 * 在长图中寻找“安全切点”：从理想切线（页底）向上回退，
 * 找到一条几乎没有文字墨迹的空白行（行间空隙）再下刀，
 * 从而避免把文字 / 表格行从中间切成两半。
 * 判定“墨迹”采用与背景亮度的差值，因此亮色/暗色主题都能正确识别空白行。
 * @param {CanvasRenderingContext2D} ctx - 长图上下文
 * @param {number} width - 画布宽度（px）
 * @param {number} idealCutY - 理想切线 y（页底）
 * @param {number} minCutY - 允许回退到的最高 y（搜索窗口上界）
 * @param {number} bgLum - 页面背景亮度
 * @returns {number} 安全切点 y；找不到则退回 idealCutY
 */
function findSafeCutY(ctx, width, idealCutY, minCutY, bgLum) {
  const h = idealCutY - minCutY
  if (h <= 0) return idealCutY
  let img
  try {
    img = ctx.getImageData(0, minCutY, width, h)
  } catch {
    // 画布被跨域图片污染等异常，退回固定切点
    return idealCutY
  }
  const data = img.data
  // 从最接近页底的一行往上扫描，返回第一个（最低）空白行，尽量把页面填满
  for (let row = h - 1; row >= 0; row--) {
    const base = row * width * 4
    let ink = 0
    for (let x = 0; x < width; x++) {
      const i = base + x * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      // 与背景亮度差异足够大才视为文字/边框墨迹
      if (Math.abs(lum - bgLum) > 25) ink++
    }
    // 该行墨迹像素占比 < 0.5% 视为空白行，可安全切分
    if (ink / width < 0.005) return minCutY + row
  }
  return idealCutY
}

/**
 * 导出 HTML 为 PDF（html2canvas 渲染整页长图 + jsPDF 手动智能分页）
 * 分页时自动在空白行下刀，避免文字被从中间切断（比 html2pdf.js 内置分页更可靠）。
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} filename - 文件名（不含扩展名）
 */
export async function exportToPdf(element, filename = 'markdown-export') {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // 1. 展开滚动容器，把完整内容渲染成一张长图
  const canvas = await withExpandedElement(element, () =>
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
    }),
  )
  const ctx = canvas.getContext('2d')
  const bgLum = getBackgroundLuminance(ctx)

  // 2. 计算每页在长图像素坐标系下的可用高度
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWidthMm = pdf.internal.pageSize.getWidth() // 210
  const pageHeightMm = pdf.internal.pageSize.getHeight() // 297
  const marginMm = 10
  const contentWidthMm = pageWidthMm - marginMm * 2 // 190
  const contentHeightMm = pageHeightMm - marginMm * 2 // 277
  const pxPerMm = canvas.width / contentWidthMm
  const pageHeightPx = Math.max(1, Math.floor(contentHeightMm * pxPerMm))
  const searchWindow = Math.floor(pageHeightPx * 0.4) // 安全切点回退搜索范围

  // 3. 逐页切分并写入 PDF
  const totalHeightPx = canvas.height
  let top = 0 // 当前页在长图中的起始 y
  let pageIndex = 0

  while (top < totalHeightPx) {
    let bottom = Math.min(top + pageHeightPx, totalHeightPx)
    // 非最后一页：在页底附近寻找空白行作为安全切点
    if (bottom < totalHeightPx) {
      const minCutY = Math.max(top + 1, bottom - searchWindow)
      bottom = findSafeCutY(ctx, canvas.width, bottom, minCutY, bgLum)
    }
    const sliceHeight = bottom - top
    if (sliceHeight <= 0) break // 防御：避免死循环

    // 把这一段画到临时画布，转成图片
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    const pctx = pageCanvas.getContext('2d')
    pctx.fillStyle = '#ffffff'
    pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    pctx.drawImage(canvas, 0, top, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.95)
    const imgHeightMm = sliceHeight / pxPerMm

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidthMm, imgHeightMm)

    pageIndex++
    top = bottom
  }

  pdf.save(buildTimestampedFileName(filename, 'pdf'))
}

/**
 * 导出 HTML 为 PNG 图片（使用 html2canvas）
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} filename - 文件名（不含扩展名）
 */
export async function exportToImage(element, filename = 'markdown-export') {
  const html2canvas = (await import('html2canvas')).default
  await withExpandedElement(element, async () => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
    })
    const link = document.createElement('a')
    link.download = buildTimestampedFileName(filename, 'png')
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

/**
 * 触发浏览器下载文本文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME 类型
 */
export function downloadTextFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
