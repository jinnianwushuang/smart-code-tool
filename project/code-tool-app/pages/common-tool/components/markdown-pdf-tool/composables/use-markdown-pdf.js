import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  renderMarkdown,
  buildFullHtmlDocument,
  exportToPdf,
  exportToImage,
  downloadTextFile,
} from '../utils/markdown-renderer.js'

// 示例 Markdown 数据
const SAMPLE_MARKDOWN = `# Markdown to PDF 工具示例

## 功能特性

- ✅ 粘贴 Markdown 代码实时预览
- ✅ 上传 \`.md\` 文件
- ✅ 拖拽文件到预览区
- ✅ GitHub 风格渲染
- ✅ 导出 PDF / PNG 图片

## 代码高亮

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`)
  return { status: 'ok', timestamp: Date.now() }
}
\`\`\`

## 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 解析 | ✅ | 使用 marked |
| 代码高亮 | ✅ | 使用 highlight.js |
| PDF 导出 | ✅ | 使用 html2pdf.js |
| 图片导出 | ✅ | 使用 html2canvas |

## 引用

> 工欲善其事，必先利其器。

---

*由 Markdown PDF Tool 生成*
`

export function useMarkdownPdf() {
  // --- 状态 ---
  const markdownText = ref('')
  const previewVisible = ref(true)
  const isDragging = ref(false)
  const exporting = ref(false)
  const fileName = ref('markdown-export')

  // --- 计算属性 ---
  const renderedHtml = computed(() => renderMarkdown(markdownText.value))
  const hasContent = computed(() => markdownText.value.trim().length > 0)
  const charCount = computed(() => markdownText.value.length.toLocaleString())

  // 监听内容变化，自动生成文件名
  watch(
    () => markdownText.value,
    (val) => {
      if (!val.trim()) {
        fileName.value = 'markdown-export'
        return
      }
      // 取第一行 # 标题作为文件名
      const titleMatch = val.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        fileName.value =
          titleMatch[1].replace(/[^\w\u4e00-\u9fa5-]/g, '-').slice(0, 50) || 'markdown-export'
      }
    },
  )

  // --- 文件读取 ---
  const readFileContent = (file) => {
    if (
      !file.name.endsWith('.md') &&
      !file.name.endsWith('.markdown') &&
      !file.name.endsWith('.txt')
    ) {
      message.warning('请上传 .md / .markdown / .txt 文件')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      markdownText.value = e.target.result
      fileName.value = file.name.replace(/\.(md|markdown|txt)$/, '') || 'markdown-export'
      message.success(`已加载文件: ${file.name}`)
    }
    reader.readAsText(file)
  }

  // --- 文件上传 ---
  const handleFileUpload = (file) => {
    readFileContent(file)
    return false // 阻止 ant-design 默认上传
  }

  // --- 拖拽处理 ---
  const handleDragEnter = (e) => {
    e.preventDefault()
    isDragging.value = true
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    isDragging.value = false
  }
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  const handleDrop = (e) => {
    e.preventDefault()
    isDragging.value = false
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      readFileContent(files[0])
    }
  }

  // --- 导出操作 ---
  const previewRef = ref(null)

  const handleExportPdf = async () => {
    if (!hasContent.value) return message.warning('没有可导出的内容')
    if (!previewRef.value) return message.error('预览区域未就绪')
    exporting.value = true
    try {
      await exportToPdf(previewRef.value, fileName.value)
      message.success('PDF 导出成功')
    } catch (err) {
      console.error('PDF export error:', err)
      message.error('PDF 导出失败，请重试')
    } finally {
      exporting.value = false
    }
  }

  const handleExportImage = async () => {
    if (!hasContent.value) return message.warning('没有可导出的内容')
    if (!previewRef.value) return message.error('预览区域未就绪')
    exporting.value = true
    try {
      await exportToImage(previewRef.value, fileName.value)
      message.success('图片导出成功')
    } catch (err) {
      console.error('Image export error:', err)
      message.error('图片导出失败，请重试')
    } finally {
      exporting.value = false
    }
  }

  const handleExportHtml = () => {
    if (!hasContent.value) return message.warning('没有可导出的内容')
    const fullHtml = buildFullHtmlDocument(renderedHtml.value)
    downloadTextFile(fullHtml, `${fileName.value}.html`, 'text/html')
    message.success('HTML 文件已保存')
  }

  const handleSaveMarkdown = () => {
    if (!hasContent.value) return message.warning('没有可保存的内容')
    downloadTextFile(markdownText.value, `${fileName.value}.md`, 'text/markdown')
    message.success('Markdown 文件已保存')
  }

  // --- 通用操作 ---
  const loadSample = () => {
    markdownText.value = SAMPLE_MARKDOWN
    message.success('已加载示例数据')
  }

  const clearAll = () => {
    markdownText.value = ''
    fileName.value = 'markdown-export'
  }

  const copyMarkdown = async () => {
    if (!hasContent.value) return message.warning('内容为空')
    try {
      await navigator.clipboard.writeText(markdownText.value)
      message.success('Markdown 源码已复制')
    } catch {
      message.error('复制失败')
    }
  }

  return {
    // 状态
    markdownText,
    previewVisible,
    isDragging,
    exporting,
    fileName,
    renderedHtml,
    hasContent,
    charCount,
    previewRef,
    // 方法
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleExportPdf,
    handleExportImage,
    handleExportHtml,
    handleSaveMarkdown,
    loadSample,
    clearAll,
    copyMarkdown,
  }
}
