<template>
  <div class="q-pa-md bg-grey-1">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 1300px">
      <!-- 头部工具栏 -->
      <q-card-section class="bg-blue-grey-10 text-white row items-center q-gutter-sm">
        <q-icon name="admin_panel_settings" size="sm" />
        <div class="text-h6 text-weight-bold">JSON-Excel 转换器</div>
        <q-space />
        <q-btn flat color="white" label="样例数据" icon="lightbulb" @click="loadSample" />
        <q-btn flat color="white" label="清空" icon="delete" @click="clearAll" />
        <q-btn
          color="cyan-4"
          text-color="black"
          label="下载 JSON"
          icon="download"
          @click="downloadJson"
          :disable="!finalData.length"
        />
        <q-btn
          color="green-7"
          label="导出 Excel"
          icon="description"
          @click="exportToExcel"
          :disable="!finalData.length"
        />
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入控制区 -->
        <div class="col-12 col-md-5 q-gutter-y-md">
          <q-tabs
            v-model="inputTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="paste" icon="content_paste" label="粘贴代码" />
            <q-tab name="file" icon="upload_file" label="导入文件" />
          </q-tabs>

          <q-tab-panels v-model="inputTab" animated class="bg-transparent">
            <q-tab-panel name="paste" class="q-pa-none">
              <q-input
                v-model="rawInput"
                type="textarea"
                filled
                label="支持标准 JSON 或 JS 数组"
                rows="10"
                class="code-font"
                @update:model-value="smartParse"
              />
            </q-tab-panel>
            <q-tab-panel name="file" class="q-pa-none">
              <q-file
                v-model="filePicker"
                filled
                label="选择文件"
                accept=".json,.txt,.js"
                @update:model-value="handleFileImport"
              >
                <template v-slot:prepend><q-icon name="cloud_upload" /></template>
              </q-file>
            </q-tab-panel>
          </q-tab-panels>

          <!-- 治理工具箱 -->
          <q-list bordered class="rounded-borders bg-white shadow-1">
            <q-item-label header class="text-weight-bold text-indigo">数据治理配置</q-item-label>

            <!-- 1. 类型自动修复 (新增功能) -->
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="config.autoTypeRepair" color="green-7"
              /></q-item-section>
              <q-item-section>
                <q-item-label>类型自动修复</q-item-label>
                <q-item-label caption>自动转换数字字符串、布尔值及 Null</q-item-label>
              </q-item-section>
            </q-item>

            <!-- 2. 命名转换 -->
            <q-item>
              <q-item-section>
                <q-item-label caption>Key 命名风格转换</q-item-label>
                <div class="row q-gutter-xs q-mt-xs">
                  <q-btn
                    size="sm"
                    :outline="config.caseType !== 'camel'"
                    color="primary"
                    label="小驼峰"
                    @click="config.caseType = 'camel'"
                  />
                  <q-btn
                    size="sm"
                    :outline="config.caseType !== 'snake'"
                    color="primary"
                    label="下划线"
                    @click="config.caseType = 'snake'"
                  />
                  <q-btn size="sm" flat color="grey" label="重置" @click="config.caseType = ''" />
                </div>
              </q-item-section>
            </q-item>

            <!-- 3. 字段过滤 -->
            <q-item>
              <q-item-section>
                <q-input
                  v-model="filterKeys"
                  dense
                  filled
                  label="仅保留字段 (逗号隔开)"
                  placeholder="例如: id, name"
                />
              </q-item-section>
            </q-item>

            <!-- 4. 智能脱敏 -->
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="config.maskSensitive" color="red"
              /></q-item-section>
              <q-item-section>
                <q-item-label>智能脱敏开启</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧：预览区 -->
        <div class="col-12 col-md-7">
          <q-tabs
            v-model="viewTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
          >
            <q-tab name="table" label="在线表格" icon="grid_on" />
            <q-tab name="json" label="预览结果" icon="code" />
          </q-tabs>

          <q-tab-panels v-model="viewTab" animated class="bg-transparent shadow-1 rounded-borders">
            <q-tab-panel name="table" class="q-pa-none q-pt-md">
              <q-table
                :rows="finalData"
                :columns="tableColumns"
                flat
                bordered
                :pagination="{ rowsPerPage: 10 }"
                class="result-table-area"
              >
                <template v-slot:top-right>
                  <q-badge color="indigo" class="q-pa-sm">共 {{ finalData.length }} 条</q-badge>
                </template>
              </q-table>
            </q-tab-panel>

            <q-tab-panel name="json" class="q-pa-none q-pt-md">
              <div class="relative-position">
                <q-btn
                  icon="content_copy"
                  color="primary"
                  flat
                  dense
                  class="absolute-top-right z-top"
                  @click="copy(formattedJson)"
                />
                <q-input
                  v-model="formattedJson"
                  type="textarea"
                  filled
                  readonly
                  rows="22"
                  bg-color="white"
                  class="code-font"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar, exportFile, copyToClipboard } from 'quasar'
import * as XLSX from 'xlsx'
import * as changeCaseLib from 'change-case'

const $q = useQuasar()
const inputTab = ref('paste')
const viewTab = ref('table')
const rawInput = ref('')
const filePicker = ref(null)
const parsedData = ref([])
const filterKeys = ref('')

const config = reactive({
  maskSensitive: false,
  autoTypeRepair: true,
  caseType: '',
})

// 核心解析
const smartParse = (val) => {
  if (!val || !val.trim()) {
    parsedData.value = []
    return
  }
  try {
    const res = JSON.parse(val)
    parsedData.value = Array.isArray(res) ? res : [res]
  } catch (e) {
    try {
      const res = new Function(`return ${val}`)()
      parsedData.value = Array.isArray(res) ? res : [res]
    } catch (err) {
      parsedData.value = []
    }
  }
}

// 类型修复引擎
const repairType = (val) => {
  if (typeof val !== 'string') return val
  const s = val.trim()
  // 1. 数字修复
  if (s !== '' && !isNaN(Number(s))) return Number(s)
  // 2. 布尔修复
  if (s.toLowerCase() === 'true') return true
  if (s.toLowerCase() === 'false') return false
  // 3. Null/Undefined 修复
  if (s.toLowerCase() === 'null') return null
  if (s.toLowerCase() === 'undefined') return undefined
  return val
}

const handleFileImport = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    rawInput.value = e.target.result
    smartParse(e.target.result)
    inputTab.value = 'paste'
  }
  reader.readAsText(file)
}

// 治理流水线
const finalData = computed(() => {
  if (!parsedData.value.length) return []
  const selectedKeys = filterKeys.value ? filterKeys.value.split(',').map((k) => k.trim()) : null

  return parsedData.value.map((item) => {
    let newItem = {}
    Object.keys(item).forEach((key) => {
      if (selectedKeys && !selectedKeys.includes(key)) return

      let newKey = key
      if (config.caseType === 'camel') newKey = changeCaseLib.camelCase(key)
      else if (config.caseType === 'snake') newKey = changeCaseLib.snakeCase(key)

      let val = item[key]

      // 执行类型修复
      if (config.autoTypeRepair) val = repairType(val)

      // 智能脱敏
      if (config.maskSensitive && typeof val === 'string') {
        if (/^\d{11}$/.test(val)) val = val.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
        else if (val.includes('@')) val = val.replace(/(.{2}).+(@.+)/, '$1***$2')
      }
      newItem[newKey] = val
    })
    return newItem
  })
})

const formattedJson = computed(() => JSON.stringify(finalData.value, null, 2))
const tableColumns = computed(() => {
  if (!finalData.value.length) return []
  const keys = new Set()
  finalData.value.slice(0, 10).forEach((obj) => Object.keys(obj).forEach((k) => keys.add(k)))
  return Array.from(keys).map((key) => ({
    name: key,
    label: key,
    field: key,
    align: 'left',
    sortable: true,
  }))
})

const clearAll = () => {
  rawInput.value = ''
  parsedData.value = []
  filterKeys.value = ''
  config.caseType = ''
  filePicker.value = null
}
const loadSample = () => {
  rawInput.value = `[{ "User_ID": "1001", "User_Name": "张三", "Age": "25", "Is_Admin": "true", "Avatar": "null" }]`
  smartParse(rawInput.value)
}
const copy = (txt) =>
  copyToClipboard(txt).then(() =>
    $q.notify({ message: '复制成功', color: 'positive', timeout: 800 }),
  )
const downloadJson = () => exportFile(`治理结果.json`, formattedJson.value)
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(finalData.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `数据治理导出.xlsx`)
}
</script>

<style scoped>
.code-font :deep(textarea) {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
}
.result-table-area {
  height: 500px;
}
</style>
