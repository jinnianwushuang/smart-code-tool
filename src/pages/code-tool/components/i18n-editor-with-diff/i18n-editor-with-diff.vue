<template>
  <div class="i18n-master-container">
    <a-card title="🚀 国际化多语言高级编辑器" :bordered="false">
      <!-- 顶部操作栏 -->
      <template #extra>
        <a-space>
          <a-button @click="showPasteModal = true"
            ><template #icon><FileTextOutlined /></template>粘贴JSON</a-button
          >
          <a-upload accept=".json" :show-upload-list="false" :before-upload="handleImport">
            <a-button ghost type="primary"
              ><template #icon><UploadOutlined /></template>导入文件</a-button
            >
          </a-upload>
          <a-button type="primary" @click="exportJson"
            ><template #icon><DownloadOutlined /></template>导出成果</a-button
          >
        </a-space>
      </template>

      <!-- 搜索与批量功能区 -->
      <div class="toolbar-wrapper">
        <a-row :gutter="16" align="middle">
          <a-col :span="8">
            <a-input-search
              v-model:value="searchText"
              placeholder="快速定位 Key 或 翻译内容..."
              allow-clear
            />
          </a-col>
          <a-col :span="4">
            <a-checkbox v-model:checked="showOnlyEmpty">仅看未完成</a-checkbox>
          </a-col>
          <a-col :span="12" style="text-align: right">
            <a-space>
              <a-button
                type="primary"
                danger
                ghost
                :loading="batchLoading"
                @click="handleBatchTranslate"
              >
                <template #icon><ThunderboltOutlined /></template>补全可见缺失
              </a-button>
              <a-button type="primary" @click="addNewKey"
                ><template #icon><PlusOutlined /></template>新增行</a-button
              >
            </a-space>
          </a-col>
        </a-row>
        <!-- 进度条 -->
        <a-progress v-if="batchLoading" :percent="translateProgress" size="small" status="active" />
      </div>

      <!-- 主表格 -->
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="{ pageSize: 50, showSizeChanger: true }"
        bordered
        sticky
        :scroll="{ y: 'calc(100vh - 400px)' }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'keyName'">
            <a-input v-model:value="record.keyName" class="key-input" placeholder="命名空间.键名" />
          </template>

          <template v-if="['zh', 'en', 'jp'].includes(column.key)">
            <a-textarea
              v-model:value="record[column.key]"
              auto-size
              :class="{ 'empty-cell': !record[column.key] }"
              placeholder="请输入翻译..."
            />
          </template>

          <template v-if="column.key === 'action'">
            <a-button type="link" danger @click="deleteKey(record.keyName || index)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 弹窗：手动粘贴数据 -->
    <a-modal v-model:visible="showPasteModal" title="粘贴 JSON 数据" @ok="handlePasteConfirm">
      <a-alert
        message="支持嵌套或扁平 JSON，系统将自动识别并合并至当前列表。"
        type="info"
        style="margin-bottom: 12px"
      />
      <a-textarea
        v-model:value="pasteContent"
        :rows="12"
        placeholder='{ "zh": { "msg": "你好" }, "en": { "msg": "Hello" } }'
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'
import { set, isObject, get } from 'lodash-es'
import translate from 'google-translate-open-api'

// --- 状态定义 ---
const dataSource = ref([])
const searchText = ref('')
const showOnlyEmpty = ref(false)
const showPasteModal = ref(false)
const pasteContent = ref('')
const batchLoading = ref(false)
const translateProgress = ref(0)

const columns = [
  { title: '配置路径 (Key Path)', dataIndex: 'keyName', key: 'keyName', width: '25%' },
  { title: '中文 (zh-CN)', dataIndex: 'zh', key: 'zh', width: '23%' },
  { title: '英文 (en-US)', dataIndex: 'en', key: 'en', width: '23%' },
  { title: '日语 (ja-JP)', dataIndex: 'jp', key: 'jp', width: '23%' },
  { title: '操作', key: 'action', width: '60px', align: 'center' },
]

// --- 核心逻辑：数据扁平化与合并 ---
const flatten = (obj, prefix = '', res = {}) => {
  for (let key in obj) {
    const name = prefix ? `${prefix}.${key}` : key
    if (isObject(obj[key]) && !Array.isArray(obj[key])) flatten(obj[key], name, res)
    else res[name] = obj[key]
  }
  return res
}

const processRawJson = (json) => {
  const tempMap = Object.fromEntries(dataSource.value.map((i) => [i.keyName, i]))
  const langs = ['zh', 'en', 'jp']

  langs.forEach((lang) => {
    if (json[lang]) {
      const flat = flatten(json[lang])
      Object.keys(flat).forEach((key) => {
        if (!tempMap[key]) tempMap[key] = { keyName: key, zh: '', en: '', jp: '' }
        tempMap[key][lang] = flat[key]
      })
    }
  })
  dataSource.value = Object.values(tempMap)
}

// --- 事件处理 ---
const handleImport = (file) => {
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = (e) => {
    try {
      processRawJson(JSON.parse(e.target.result))
      message.success('文件导入并合并成功')
    } catch (err) {
      message.error('JSON 格式错误')
    }
  }
  return false
}

const handlePasteConfirm = () => {
  try {
    processRawJson(JSON.parse(pasteContent.value))
    showPasteModal.value = false
    pasteContent.value = ''
    message.success('数据已成功合并')
  } catch (err) {
    message.error('非法 JSON 字符串')
  }
}

const handleBatchTranslate = async () => {
  const tasks = []
  filteredData.value.forEach((item) => {
    if (item.zh) {
      if (!item.en) tasks.push({ item, lang: 'en', to: 'en' })
      if (!item.jp) tasks.push({ item, lang: 'jp', to: 'ja' })
    }
  })

  if (!tasks.length) return message.info('未发现缺失翻译项')

  batchLoading.value = true
  translateProgress.value = 0

  for (let i = 0; i < tasks.length; i++) {
    const { item, lang, to } = tasks[i]
    try {
      const res = await translate(item.zh, { tld: 'cn', from: 'zh-CN', to })
      item[lang] = res.data
      translateProgress.value = Math.floor(((i + 1) / tasks.length) * 100)
      await new Promise((r) => setTimeout(r, 200)) // 频率保护
    } catch (e) {
      console.error('翻译失败', e)
    }
  }
  batchLoading.value = false
  message.success('批量补全完成')
}

const exportJson = () => {
  const res = { zh: {}, en: {}, jp: {} }
  dataSource.value.forEach((i) => {
    if (!i.keyName) return
    set(res.zh, i.keyName, i.zh || '')
    set(res.en, i.keyName, i.en || '')
    set(res.jp, i.keyName, i.jp || '')
  })
  const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `i18n_full_${Date.now()}.json`
  a.click()
}

const filteredData = computed(() => {
  return dataSource.value.filter((i) => {
    const matchSearch =
      !searchText.value ||
      [i.keyName, i.zh, i.en, i.jp].some((v) =>
        v?.toLowerCase().includes(searchText.value.toLowerCase()),
      )
    const matchEmpty = !showOnlyEmpty.value || !i.zh || !i.en || !i.jp
    return matchSearch && matchEmpty
  })
})

const addNewKey = () => dataSource.value.unshift({ keyName: '', zh: '', en: '', jp: '' })
const deleteKey = (key) => {
  dataSource.value = dataSource.value.filter((i) => i.keyName !== key)
}
</script>

<style scoped>
.i18n-master-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}
.toolbar-wrapper {
  margin-bottom: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}
.empty-cell {
  border-color: #ff4d4f !important;
  background: #fff2f0;
}
.key-input {
  font-family: monospace;
  font-weight: 600;
  color: #1890ff;
}
:deep(.ant-table-wrapper) {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
</style>
