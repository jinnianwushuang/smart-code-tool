import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import Fuse from 'fuse.js'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { httpStatusDb } from '../utils/http-status-data.js'

export function useHttpStatus() {
  const searchText = ref('')
  const pdfArea = ref(null)
  const isExporting = ref(false)

  const fuse = new Fuse(httpStatusDb, {
    keys: ['code', 'title', 'desc'],
    threshold: 0.3,
  })

  const filteredStatus = computed(() => {
    if (!searchText.value) return httpStatusDb
    return fuse.search(searchText.value).map((r) => r.item)
  })

  const copyCode = (code) => {
    navigator.clipboard.writeText(code.toString())
    message.success(`状态码 ${code} 已复制`)
  }

  const downloadPdf = async () => {
    if (filteredStatus.value.length === 0) return
    isExporting.value = true
    const hide = message.loading('正在生成 PDF...', 0)

    try {
      const element = pdfArea.value
      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.text('HTTP Status Manual - DevTools', 10, 10)
      pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight)
      pdf.save(`HTTP_Manual_${new Date().getTime()}.pdf`)
      message.success('PDF 导出成功')
    } catch (err) {
      message.error('导出失败')
    } finally {
      isExporting.value = false
      hide()
    }
  }

  return {
    searchText,
    pdfArea,
    isExporting,
    filteredStatus,
    copyCode,
    downloadPdf,
  }
}
