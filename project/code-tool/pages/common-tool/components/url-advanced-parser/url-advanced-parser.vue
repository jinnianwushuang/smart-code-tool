<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-lg q-mx-auto max-w-1200">
      <!-- 左侧：编辑器 -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="main-card transition-base shadow-2">
          <q-card-section class="bg-indigo-8 text-white row items-center">
            <q-icon name="link" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">URL 参数解析与编辑器</div>
            <q-space />
            <q-btn
              color="white"
              text-color="indigo-8"
              label="立即解析"
              icon="sync"
              size="sm"
              @click="handleParse"
            />
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <!-- 原始输入 -->
            <div class="section-label">原始 URL 地址</div>
            <a-input-search
              v-model:value="urlInput"
              placeholder="粘贴 URL 到这里..."
              enter-button="重置"
              @search="handleParse"
              class="mb-20"
            />

            <!-- 路径编辑 -->
            <div class="section-label">结构化路径 (Path)</div>
            <a-input-group compact class="mb-20 font-mono">
              <a-select v-model:value="urlParts.protocol" style="width: 15%">
                <a-select-option value="https:">https://</a-select-option>
                <a-select-option value="http:">http://</a-select-option>
              </a-select>
              <a-input v-model:value="urlParts.host" style="width: 35%" placeholder="Host" />
              <a-input
                v-model:value="urlParts.pathname"
                style="width: 50%"
                placeholder="/path/to/resource"
              />
            </a-input-group>

            <!-- 参数列表 -->
            <div class="section-label">查询参数 (Query Parameters)</div>
            <div v-for="(item, index) in queryItems" :key="index" class="param-row">
              <a-input
                v-model:value="item.key"
                placeholder="Key"
                style="width: 30%"
                class="font-mono"
              />
              <a-input
                v-model:value="item.value"
                placeholder="Value"
                style="flex: 1"
                class="font-mono"
              />
              <div class="action-group">
                <a-checkbox v-model:checked="item.isBase64" @change="handleBase64(item)">
                  Base64
                </a-checkbox>
                <a-button type="text" danger @click="removeItem(index)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </div>
            </div>

            <a-button type="dashed" block @click="addItem" class="mt-10">
              <template #icon><PlusOutlined /></template>添加新参数
            </a-button>

            <div class="bottom-actions">
              <a-button
                type="primary"
                block
                size="large"
                @click="handleGenerate"
                class="btn-generate"
              >
                <template #icon><LinkOutlined /></template>更新原始 URL 并合成
              </a-button>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：JSON 预览 -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="json-card transition-base shadow-2">
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-sm">
            <q-icon name="code" size="xs" class="q-mr-xs" />
            <div class="text-subtitle2">实时 JSON 结果</div>
            <q-space />
            <q-btn
              flat
              dense
              icon="content_copy"
              size="sm"
              @click="copyToClipboard(JSON.stringify(liveJson, null, 2))"
            />
          </q-card-section>
          <div class="json-box q-pa-sm">
            <json-viewer :value="liveJson" :expand-depth="5" copyable boxed sort theme="jv-light" />
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  LinkOutlined,
  CodeOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import JsonViewer from 'vue-json-viewer'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

// --- 状态定义 ---
const urlInput = ref('https://api.example.com')
const urlParts = reactive({
  protocol: 'https:',
  host: '',
  pathname: '',
})
const queryItems = ref([])

// --- 核心逻辑：解析 URL ---
const handleParse = () => {
  try {
    const url = new URL(urlInput.value)
    urlParts.protocol = url.protocol
    urlParts.host = url.host
    urlParts.pathname = url.pathname

    const params = []
    url.searchParams.forEach((value, key) => {
      params.push({ key, value, isBase64: false })
    })
    queryItems.value = params
    message.success('解析成功')
  } catch (e) {
    message.error('无效的 URL 格式')
  }
}

// --- 核心逻辑：生成 URL ---
const handleGenerate = () => {
  try {
    const url = new URL(`${urlParts.protocol}//${urlParts.host}${urlParts.pathname}`)
    queryItems.value.forEach((item) => {
      if (item.key) url.searchParams.append(item.key, item.value)
    })
    urlInput.value = url.toString()
    message.success('URL 已合成')
  } catch (e) {
    message.error('生成失败，请检查路径格式')
  }
}

// --- Base64 处理 ---
const handleBase64 = (item) => {
  try {
    if (item.isBase64) {
      item.value = btoa(item.value) // 编码
    } else {
      item.value = atob(item.value) // 解码
    }
  } catch (e) {
    message.warning('转换失败：内容不符合 Base64 规范')
    item.isBase64 = !item.isBase64 // 状态回滚
  }
}

// --- 计算属性：实时 JSON ---
const liveJson = computed(() => {
  const result = {}
  queryItems.value.forEach((item) => {
    if (item.key) result[item.key] = item.value
  })
  return result
})

// --- 操作方法 ---
const addItem = () => queryItems.value.push({ key: '', value: '', isBase64: false })
const removeItem = (index) => queryItems.value.splice(index, 1)
const copyToClipboard = (text) => {
  projectCopyText(text)
}
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.max-w-1200 {
  max-width: 1200px;
}

.section-label {
  font-size: 12px;
  color: var(--q-primary);
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mb-20 {
  margin-bottom: 20px;
}
.mt-10 {
  margin-top: 10px;
}

.param-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.param-row:hover {
  background: rgba(128, 128, 128, 0.08);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.btn-generate {
  border-radius: 8px;
  height: 44px;
  font-weight: 600;
}

.bottom-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.json-box {
  background: #ffffff;
  border-radius: 4px;
}

/* 覆盖 json-viewer 默认边距 */
:deep(.jv-container) {
  padding: 0 !important;
}
</style>
