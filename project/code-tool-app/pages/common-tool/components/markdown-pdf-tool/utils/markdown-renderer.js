import { Marked } from 'marked'
import hljs from 'highlight.js'
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
 * 导出 HTML 为 PDF（使用 html2pdf.js）
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} filename - 文件名（不含扩展名）
 */
export async function exportToPdf(element, filename = 'markdown-export') {
  const html2pdf = (await import('html2pdf.js')).default
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }
  await html2pdf().set(opt).from(element).save()
}

/**
 * 导出 HTML 为 PNG 图片（使用 html2canvas）
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} filename - 文件名（不含扩展名）
 */
export async function exportToImage(element, filename = 'markdown-export') {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
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
