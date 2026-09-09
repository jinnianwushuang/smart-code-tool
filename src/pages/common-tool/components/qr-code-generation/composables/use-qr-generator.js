import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import QrcodeVue from 'qrcode.vue'
import jsQR from 'jsqr'
import html2pdf from 'html2pdf.js'
import { BrowserMultiFormatReader } from '@zxing/library'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

export function useQrGenerator() {
  const $q = useQuasar()

  // ========== 单项 QR 状态 ==========
  const activeTab = ref('single')
  const singleText = ref('https://github.com')
  const size = ref(300)
  const level = ref('H')
  const foreground = ref('#1a237e')
  const background = ref('#ffffff')
  const logoFile = ref(null)
  const logoImage = ref(null)
  const qrcodeRef = ref(null)
  const mainCanvas = ref(null)

  // ========== 批量名片状态 ==========
  const batchInput = ref('张三,13800138000,CTO\n李四,13911112222,设计总监')
  const batchCards = ref([])

  // ========== 扫描识别状态 ==========
  const videoRef = ref(null)
  const isScanning = ref(false)
  const scanResult = ref('')
  const scanFile = ref(null)
  const imgScanCanvas = ref(null)
  let codeReader = null

  // ========== 1. 单项渲染 (带 Logo 合成) ==========
  const refreshCanvas = () => {
    nextTick(() => {
      if (!mainCanvas.value || !qrcodeRef.value) return
      const ctx = mainCanvas.value.getContext('2d')
      const svgElement = qrcodeRef.value.$el

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.onload = function () {
        ctx.clearRect(0, 0, size.value, size.value)
        ctx.drawImage(img, 0, 0)

        if (logoImage.value) {
          const lSize = size.value * 0.22
          const pos = (size.value - lSize) / 2
          ctx.fillStyle = background.value
          ctx.fillRect(pos - 4, pos - 4, lSize + 8, lSize + 8)
          ctx.drawImage(logoImage.value, pos, pos, lSize, lSize)
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  watch([singleText, size, level, foreground, background, logoImage], refreshCanvas)

  const handleLogoUpload = (file) => {
    if (!file) return (logoImage.value = null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        logoImage.value = img
        refreshCanvas()
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const clearLogo = () => {
    logoFile.value = null
    logoImage.value = null
    refreshCanvas()
  }

  const downloadQR = () => {
    const url = mainCanvas.value.toDataURL()
    const a = document.createElement('a')
    a.download = 'Design_QR.png'
    a.href = url
    a.click()
  }

  const copyQRImage = () => {
    mainCanvas.value.toBlob((blob) => {
      const item = new ClipboardItem({ 'image/png': blob })
      navigator.clipboard.write([item])
      $q.notify({ message: '已存入剪贴板', color: 'indigo' })
    })
  }

  // ========== 2. 批量名片 ==========
  const generateBatch = () => {
    const lines = batchInput.value.split('\n').filter((l) => l.trim())
    batchCards.value = lines.map((line) => {
      const [name, tel, title] = line.split(/[，,]/)
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${tel}\nTITLE:${title}\nEND:VCARD`
      return { name, title: title || '员工', vcard }
    })
  }

  const exportBatchPDF = () => {
    const element = document.getElementById('pdf-content')
    const opt = {
      margin: 10,
      filename: `QR_Labels_${Date.now()}.pdf`,
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }
    html2pdf().set(opt).from(element).save()
  }

  // ========== 3. 扫描识别 ==========
  const startScanner = async () => {
    codeReader = new BrowserMultiFormatReader()
    isScanning.value = true
    try {
      const devices = await codeReader.listVideoInputDevices()
      codeReader.decodeFromVideoDevice(devices[0].deviceId, videoRef.value, (result) => {
        if (result) {
          scanResult.value = result.text
          $q.notify({ message: '扫码成功', color: 'positive', icon: 'done' })
          if (navigator.vibrate) navigator.vibrate(100)
        }
      })
    } catch {
      $q.notify({ message: '摄像头启动失败', color: 'negative' })
      isScanning.value = false
    }
  }

  const stopScanner = () => {
    if (codeReader) {
      codeReader.reset()
      isScanning.value = false
    }
  }

  const scanFromImage = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const cvs = imgScanCanvas.value
        const ctx = cvs.getContext('2d')
        cvs.width = img.width
        cvs.height = img.height
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, cvs.width, cvs.height)
        const code = jsQR(data.data, data.width, data.height)
        if (code) {
          scanResult.value = code.data
          $q.notify({ message: '识别成功', color: 'positive' })
        } else {
          $q.notify({ message: '未识别到二维码', color: 'negative' })
          scanResult.value = ''
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const copyText = (text) => {
    if (!text) return
    projectCopyText(text)
  }

  onMounted(refreshCanvas)
  onUnmounted(stopScanner)

  return {
    // 单项
    activeTab,
    singleText,
    size,
    level,
    foreground,
    background,
    logoFile,
    logoImage,
    qrcodeRef,
    mainCanvas,
    refreshCanvas,
    handleLogoUpload,
    clearLogo,
    downloadQR,
    copyQRImage,
    // 批量
    batchInput,
    batchCards,
    generateBatch,
    exportBatchPDF,
    // 扫描
    videoRef,
    isScanning,
    scanResult,
    scanFile,
    imgScanCanvas,
    startScanner,
    stopScanner,
    scanFromImage,
    copyText,
  }
}
