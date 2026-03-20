<template>
  <q-page class="q-pa-md bg-grey-2">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 1200px">
      <!-- 头部工具栏 -->
      <q-card-section class="bg-teal-9 text-white row items-center q-gutter-sm">
        <q-icon name="transform" size="sm" />
        <div class="text-h6 text-weight-bold">Excel-JSON 转换器</div>
        <q-space />
        <q-btn flat color="white" label="清空" icon="clear_all" @click="clearAll" />
        <q-btn
          color="white"
          text-color="teal-10"
          label="下载 JSON"
          icon="download"
          @click="downloadJson"
          :disable="!finalJson.length"
        />
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入与配置 -->
        <div class="col-12 col-md-5 q-gutter-y-md">
          <!-- 数据导入区 -->
          <q-tabs
            v-model="importTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="file" icon="upload_file" label="上传文件" />
            <q-tab name="paste" icon="content_paste" label="直接粘贴" />
          </q-tabs>

          <q-tab-panels v-model="importTab" animated class="bg-transparent">
            <q-tab-panel name="file" class="q-pa-none">
              <q-file
                v-model="excelFile"
                filled
                label="选择 Excel 文件"
                accept=".xlsx, .xls"
                @update:model-value="handleFileImport"
              >
                <template v-slot:prepend><q-icon name="attach_file" /></template>
              </q-file>
            </q-tab-panel>
            <q-tab-panel name="paste" class="q-pa-none">
              <q-input
                v-model="pasteText"
                type="textarea"
                filled
                label="粘贴 Excel 单元格"
                placeholder="从表格复制后在此 Ctrl+V"
                rows="5"
                @paste="handlePaste"
              />
            </q-tab-panel>
          </q-tab-panels>

          <!-- 字段映射与过滤 (便利性功能 1) -->
          <q-expansion-item
            icon="settings"
            label="表头映射与过滤"
            header-class="bg-white border-radius-4"
            default-opened
          >
            <q-card>
              <q-card-section class="q-gutter-y-xs">
                <div
                  v-if="rawHeaders.length === 0"
                  class="text-caption text-grey text-center q-pa-md"
                >
                  暂无表头信息，请先导入数据
                </div>
                <div
                  v-for="header in rawHeaders"
                  :key="header"
                  class="row items-center q-gutter-x-sm"
                >
                  <q-checkbox v-model="mapping[header].enabled" dense />
                  <q-input
                    v-model="mapping[header].newKey"
                    dense
                    filled
                    :label="`原: ${header}`"
                    class="col"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 数据清洗开关 (便利性功能 2) -->
          <div class="row q-gutter-sm">
            <q-toggle v-model="config.trimSpace" label="去除首尾空格" dense />
            <q-toggle v-model="config.removeEmpty" label="过滤空行" dense />
            <q-toggle
              v-model="config.asObject"
              label="单对象模式"
              dense
              v-if="finalJson.length === 1"
            />
          </div>
        </div>

        <!-- 右侧：实时预览 -->
        <div class="col-12 col-md-7">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-grey-8">
              JSON 实时预览
              <q-badge color="teal" class="q-ml-sm">{{ finalJson.length }} 条记录</q-badge>
            </div>
            <div class="q-gutter-x-xs">
              <q-btn
                flat
                dense
                color="primary"
                icon="copy_all"
                label="复制"
                @click="copy(jsonString)"
                :disable="!jsonString"
              />
              <q-btn flat dense color="grey" icon="help_outline">
                <q-tooltip>映射功能可将 Excel 的中文列名转换为英文变量名</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-input
            v-model="jsonString"
            type="textarea"
            filled
            readonly
            rows="25"
            bg-color="white"
            class="code-font"
            placeholder="数据转换结果将显示在这里..."
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar, exportFile, copyToClipboard } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()

// 状态变量
const importTab = ref('file')
const excelFile = ref(null)
const pasteText = ref('')
const rawData = ref([]) // 原始数组
const rawHeaders = ref([]) // 原始表头
const mapping = reactive({}) // 字段映射表 { '姓名': { newKey: 'name', enabled: true } }

const config = reactive({
  trimSpace: true,
  removeEmpty: true,
  asObject: false,
})

// 核心转换逻辑：将原始数据根据映射表和配置进行清洗
const finalJson = computed(() => {
  if (rawData.value.length === 0) return []

  return rawData.value
    .map((row) => {
      const newRow = {}
      rawHeaders.value.forEach((header) => {
        const { newKey, enabled } = mapping[header]
        if (enabled) {
          let val = row[header]
          if (config.trimSpace && typeof val === 'string') val = val.trim()
          newRow[newKey || header] = val
        }
      })
      return newRow
    })
    .filter((row) => {
      if (!config.removeEmpty) return true
      return Object.values(row).some((v) => v !== null && v !== undefined && v !== '')
    })
})

const jsonString = computed(() => {
  if (finalJson.value.length === 0) return ''
  const data =
    config.asObject && finalJson.value.length === 1 ? finalJson.value[0] : finalJson.value
  return JSON.stringify(data, null, 2)
})

// 初始化映射表
const initMapping = (headers) => {
  rawHeaders.value = headers
  headers.forEach((h) => {
    if (!mapping[h]) {
      mapping[h] = { newKey: '', enabled: true }
    }
  })
}

// 处理文件导入
const handleFileImport = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
    const ws = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(ws)
    if (json.length > 0) {
      initMapping(Object.keys(json[0]))
      rawData.value = json
    }
  }
  reader.readAsArrayBuffer(file)
}

// 处理粘贴逻辑 (自动解析 Tab 分隔符)
const handlePaste = (e) => {
  const text = e.clipboardData.getData('text')
  if (!text) return
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split('\t'))
  if (rows.length < 2) return

  const headers = rows[0].map((h) => h.trim())
  const data = rows.slice(1).map((row) => {
    const obj = {}
    headers.forEach((h, i) => (obj[h] = row[i]))
    return obj
  })

  initMapping(headers)
  rawData.value = data
}

// 复制与下载
const copy = (txt) => {
  copyToClipboard(txt).then(() => $q.notify({ message: '已复制', color: 'positive', timeout: 800 }))
}

const downloadJson = () => {
  exportFile(`data_${Date.now()}.json`, jsonString.value, 'application/json')
}

const clearAll = () => {
  rawData.value = []
  rawHeaders.value = []
  excelFile.value = null
  pasteText.value = ''
  // 不重置 mapping 以便下次导入相同格式时复用
}
</script>

<style scoped>
.code-font :deep(textarea) {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  background: #fafafa;
}
.border-radius-4 {
  border-radius: 4px;
}
</style>
