<template>
  <div class="q-pa-md bg-grey-2">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-11">
        <q-card flat bordered class="shadow-4">
          <!-- 顶部导航 -->
          <q-tabs
            v-model="activeTab"
            dense
            class="bg-indigo-10 text-white"
            active-color="cyan-3"
            indicator-color="cyan-3"
            align="justify"
          >
            <q-tab name="single" icon="brush" label="单项美化设计" />
            <q-tab name="batch" icon="picture_as_pdf" label="批量名片 & PDF" />
            <q-tab name="scan" icon="qr_code_scanner" label="扫码与识别" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated class="bg-transparent">
            <!-- 1. 单项美化设计面板 -->
            <q-tab-panel name="single" class="row q-col-gutter-lg">
              <div class="col-12 col-md-7 q-gutter-y-md">
                <q-input
                  v-model="singleText"
                  type="textarea"
                  filled
                  label="二维码内容 (URL/文本)"
                  rows="10"
                  @update:model-value="refreshCanvas"
                />

                <div class="row q-col-gutter-sm">
                  <div class="col-6 col-sm-3">
                    <q-input filled v-model="foreground" label="前景" dense>
                      <template v-slot:append
                        ><q-icon name="colorize" class="cursor-pointer"
                          ><q-menu><q-color v-model="foreground" /></q-menu></q-icon
                      ></template>
                    </q-input>
                  </div>
                  <div class="col-6 col-sm-3">
                    <q-input filled v-model="background" label="背景" dense>
                      <template v-slot:append
                        ><q-icon name="colorize" class="cursor-pointer"
                          ><q-menu><q-color v-model="background" /></q-menu></q-icon
                      ></template>
                    </q-input>
                  </div>
                  <div class="col-6 col-sm-3">
                    <q-select
                      v-model="level"
                      :options="['L', 'M', 'Q', 'H']"
                      filled
                      dense
                      label="容错"
                    />
                  </div>
                  <div class="col-6 col-sm-3">
                    <q-input v-model.number="size" type="number" filled dense label="尺寸(px)" />
                  </div>
                </div>

                <q-file
                  v-model="logoFile"
                  label="叠加中心 Logo"
                  filled
                  dense
                  accept="image/*"
                  @update:model-value="handleLogoUpload"
                >
                  <template v-slot:prepend><q-icon name="add_photo_alternate" /></template>
                  <template v-slot:append v-if="logoFile"
                    ><q-icon name="close" @click.stop="clearLogo" class="cursor-pointer"
                  /></template>
                </q-file>

                <div class="row q-gutter-md q-mt-md">
                  <q-btn
                    color="indigo-7"
                    icon="download"
                    label="下载图片"
                    @click="downloadQR"
                    class="col"
                  />
                  <q-btn
                    color="deep-purple-6"
                    icon="content_copy"
                    label="复制图片"
                    @click="copyQRImage"
                    class="col"
                  />
                </div>
              </div>

              <div class="col-12 col-md-5 flex flex-center column">
                <div class="qr-preview-box q-pa-md bg-white shadow-5 rounded-borders">
                  <!-- 隐藏组件用于逻辑生成 -->

                  <qrcode-vue
                    class="hidden"
                    :value="singleText || ' '"
                    :size="size"
                    :level="level"
                    :foreground="foreground"
                    :background="background"
                    render-as="svg"
                    ref="qrcodeRef"
                  />

                  <!-- 最终渲染画布 -->
                  <canvas
                    ref="mainCanvas"
                    :width="size"
                    :height="size"
                    class="responsive-canvas"
                  ></canvas>
                </div>
                <div class="text-caption q-mt-md text-grey-7 text-center">
                  支持实时预览及图片合成
                </div>
              </div>
            </q-tab-panel>

            <!-- 2. 批量名片 & PDF 导出面板 -->
            <q-tab-panel name="batch" class="row q-col-gutter-md">
              <div class="col-12 col-md-4 q-gutter-y-md">
                <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders">
                  格式: 姓名,电话,职位 (每行一人)
                </q-banner>
                <q-input
                  v-model="batchInput"
                  type="textarea"
                  filled
                  label="数据源"
                  placeholder="张三,13800138000,技术经理"
                  rows="12"
                />
                <div class="row q-gutter-sm">
                  <q-btn
                    color="indigo"
                    label="生成预览"
                    icon="refresh"
                    class="col"
                    @click="generateBatch"
                  />
                  <q-btn
                    color="green-8"
                    label="导出 PDF"
                    icon="picture_as_pdf"
                    class="col"
                    @click="exportBatchPDF"
                    :disable="!batchCards.length"
                  />
                </div>
              </div>

              <div class="col-12 col-md-8">
                <div id="pdf-content" class="bg-white q-pa-md rounded-borders min-height-400">
                  <div class="row q-col-gutter-md" v-if="batchCards.length">
                    <div v-for="(card, index) in batchCards" :key="index" class="col-4 text-center">
                      <div class="q-pa-sm border-dashed rounded-borders bg-grey-1">
                        <qrcode-vue
                          :value="card.vcard"
                          :size="130"
                          level="M"
                          :foreground="foreground"
                        />
                        <div class="text-subtitle2 q-mt-xs">{{ card.name }}</div>
                        <div class="text-caption text-grey-8">{{ card.title }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex flex-center text-grey-4 q-pa-xl">输入数据并生成名片</div>
                </div>
              </div>
            </q-tab-panel>

            <!-- 3. 扫描与识别面板 -->
            <q-tab-panel name="scan" class="column items-center q-gutter-y-md">
              <div class="row q-col-gutter-md full-width justify-center">
                <!-- 摄像头扫描 -->
                <div class="col-12 col-md-6">
                  <div
                    class="video-box relative-position bg-black rounded-borders overflow-hidden shadow-10"
                  >
                    <video ref="videoRef" class="full-width full-height object-cover"></video>
                    <div class="scanner-line" v-if="isScanning"></div>
                  </div>
                  <div class="row justify-center q-mt-md">
                    <q-btn
                      v-if="!isScanning"
                      color="primary"
                      icon="videocam"
                      label="开启摄像头"
                      @click="startScanner"
                    />
                    <q-btn
                      v-else
                      color="negative"
                      icon="videocam_off"
                      label="停止扫描"
                      @click="stopScanner"
                    />
                  </div>
                </div>

                <!-- 图片识别 -->
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="scanFile"
                    filled
                    label="上传图片识别"
                    accept="image/*"
                    @update:model-value="scanFromImage"
                  >
                    <template v-slot:prepend><q-icon name="image" /></template>
                  </q-file>
                  <canvas ref="imgScanCanvas" class="hidden"></canvas>
                </div>
              </div>

              <q-card v-if="scanResult" flat bordered class="full-width bg-green-1 border-green">
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle1 text-weight-bold">识别结果:</div>
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    color="primary"
                    @click="copyText(scanResult)"
                  />
                </q-card-section>
                <q-card-section class="q-pt-none font-mono text-break text-body2">{{
                  scanResult
                }}</q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'
import jsQR from 'jsqr'
import html2pdf from 'html2pdf.js'
import { BrowserMultiFormatReader } from '@zxing/library'

const $q = useQuasar()

// 基础状态
const activeTab = ref('single')
const singleText = ref('https://github.com')
const size = ref(300)
const level = ref('H')
const foreground = ref('#1a237e')
const background = ref('#ffffff')
const logoFile = ref(null)
const logoImage = ref(null)

// 批量状态
const batchInput = ref('张三,13800138000,CTO\n李四,13911112222,设计总监')
const batchCards = ref([])

// 扫描与识别
const videoRef = ref(null)
const isScanning = ref(false)
const scanResult = ref('')
const scanFile = ref(null)
const imgScanCanvas = ref(null)
let codeReader = null

// DOM 引用
const qrcodeRef = ref(null)
const mainCanvas = ref(null)

/**
 * 1. 核心单项渲染 (带 Logo 自动合成)
 */
const refreshCanvas = () => {
  nextTick(() => {
    if (!mainCanvas.value || !qrcodeRef.value) return
    const ctx = mainCanvas.value.getContext('2d')
    const svgElement = qrcodeRef.value.$el
    console.error('source-------------', svgElement)
    console.error('ctx-------------', ctx)

    // 将SVG转换为数据URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    // 创建Image对象并绘制到Canvas
    const img = new Image()
    img.onload = function () {
      ctx.clearRect(0, 0, size.value, size.value)

      ctx.drawImage(img, 0, 0)

      if (logoImage.value) {
        const lSize = size.value * 0.22
        const pos = (size.value - lSize) / 2
        // 绘制白色中心保护层
        ctx.fillStyle = background.value
        ctx.fillRect(pos - 4, pos - 4, lSize + 8, lSize + 8)
        ctx.drawImage(logoImage.value, pos, pos, lSize, lSize)
      }

      // 清理URL对象
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

const change_svg_to_img = () => {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
}
function svgToCanvas(svgElement, canvas) {
  // 将SVG转换为数据URL
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  // 创建Image对象并绘制到Canvas
  const img = new Image()
  img.onload = function () {
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    // 清理URL对象
    URL.revokeObjectURL(url)
  }
  img.src = url
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

/**
 * 2. 批量生成 & PDF 导出
 */
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

/**
 * 3. 扫描识别逻辑 (摄像头 + 图片)
 */
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

// 基础功能
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

const clearLogo = () => {
  logoFile.value = null
  logoImage.value = null
  refreshCanvas()
}
const copyText = (txt) => {
  copyToClipboard(txt).then(() => $q.notify({ message: '文本已复制', color: 'green' }))
}

onMounted(refreshCanvas)
onUnmounted(stopScanner)
</script>

<style scoped>
.responsive-canvas {
  max-width: 100%;
  height: auto !important;
  border-radius: 8px;
}
.qr-preview-box {
  border: 1px solid #ddd;
  line-height: 0;
}
.video-box {
  width: 100%;
  height: 350px;
  background: #000;
}
.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 15px cyan;
  animation: scanning 2.5s infinite;
}
@keyframes scanning {
  0% {
    top: 0%;
  }
  100% {
    top: 100%;
  }
}
.border-dashed {
  border: 1.5px dashed #ccc;
}
.font-mono {
  font-family: 'Fira Code', monospace;
}
.text-break {
  word-break: break-all;
}
.object-cover {
  object-fit: cover;
}
.min-height-400 {
  min-height: 400px;
}
</style>
