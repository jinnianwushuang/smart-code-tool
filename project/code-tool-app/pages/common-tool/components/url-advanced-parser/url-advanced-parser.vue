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
          <div class="json-box q-pa-sm" :class="isDarkTheme ? 'json-box--dark' : 'json-box--light'">
            <JsonViewer
              :value="liveJson"
              :expand-depth="5"
              copyable
              boxed
              sort
              :theme="jsonTheme"
            />
          </div>
        </q-card>

        <!-- URL 编码/解码小工具 -->
        <q-card flat bordered class="json-card transition-base shadow-2 q-mt-md">
          <q-card-section class="bg-teal-8 text-white row items-center q-py-sm">
            <q-icon name="translate" size="xs" class="q-mr-xs" />
            <div class="text-subtitle2">URL 编码 / 解码</div>
            <q-space />
            <q-btn
              flat
              dense
              icon="content_copy"
              size="sm"
              @click="copyToClipboard(urlEncodeResult)"
            />
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <a-textarea
              v-model:value="urlEncodeInput"
              placeholder="输入需要编码/解码的内容..."
              :rows="2"
              :maxlength="2000"
              show-count
              allow-clear
            />
            <div class="row q-gutter-xs q-mt-sm">
              <a-tooltip title="编码所有特殊字符（含 :/?#[]@!$&'()*+,;=），适用于编码单个参数值">
                <a-button size="small" type="primary" @click="handleUrlEncode"
                  >encodeURIComponent</a-button
                >
              </a-tooltip>
              <a-tooltip title="解码 encodeURIComponent 编码的内容，还原所有特殊字符">
                <a-button size="small" @click="handleUrlDecode">decodeURIComponent</a-button>
              </a-tooltip>
              <a-tooltip title="保留 URL 结构字符（:/?#[]@ 等）不编码，适用于编码完整 URL">
                <a-button size="small" type="dashed" @click="handleUrlEncodeComponent"
                  >encodeURI</a-button
                >
              </a-tooltip>
              <a-tooltip title="解码 encodeURI 编码的内容，保留的 URL 结构字符不会被还原">
                <a-button size="small" type="dashed" @click="handleUrlDecodeComponent"
                  >decodeURI</a-button
                >
              </a-tooltip>
            </div>
            <div
              v-if="urlEncodeResult"
              class="encode-result q-mt-sm"
              :class="isDarkTheme ? 'encode-result--dark' : 'encode-result--light'"
            >
              <code class="font-mono">{{ urlEncodeResult }}</code>
            </div>
          </q-card-section>
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
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/vue3-json-viewer.css'
import { copyText as projectCopyText, isDarkTheme } from 'src/output/common/project-common.js'

// --- 主题适配 ---
const jsonTheme = computed(() => (isDarkTheme.value ? 'jv-dark' : 'jv-light'))

// --- URL 编码/解码 ---
const urlEncodeInput = ref('')
const urlEncodeResult = ref('')

const handleUrlEncode = () => {
  try {
    urlEncodeResult.value = encodeURIComponent(urlEncodeInput.value)
  } catch (e) {
    message.error('编码失败：' + e.message)
  }
}

const handleUrlDecode = () => {
  try {
    urlEncodeResult.value = decodeURIComponent(urlEncodeInput.value)
  } catch (e) {
    message.error('解码失败：内容不是合法的 URL 编码')
  }
}

const handleUrlEncodeComponent = () => {
  try {
    urlEncodeResult.value = encodeURI(urlEncodeInput.value)
  } catch (e) {
    message.error('encodeURI 失败：' + e.message)
  }
}

const handleUrlDecodeComponent = () => {
  try {
    urlEncodeResult.value = decodeURI(urlEncodeInput.value)
  } catch (e) {
    message.error('decodeURI 失败：内容不是合法的 URI 编码')
  }
}

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
  border-radius: 4px;
  transition: background-color 0.3s;
}

.json-box--light {
  background: #ffffff;
}

.json-box--dark {
  background: #1e1e1e;
}

/* 暗色主题 json-viewer 颜色适配 */
:deep(.jv-container.jv-dark) {
  background: #1e1e1e;
  color: #d4d4d4;
}

:deep(.jv-container.jv-dark .jv-key) {
  color: #9cdcfe;
}

:deep(.jv-container.jv-dark .jv-item.jv-string) {
  color: #ce9178;
}

:deep(.jv-container.jv-dark .jv-item.jv-number) {
  color: #b5cea8;
}

:deep(.jv-container.jv-dark .jv-item.jv-boolean) {
  color: #569cd6;
}

:deep(.jv-container.jv-dark .jv-item.jv-undefined) {
  color: #808080;
}

:deep(.jv-container.jv-dark.boxed) {
  border-color: #333;
}

:deep(.jv-container.jv-dark .jv-button) {
  color: #4fc3f7;
}

/* 覆盖 json-viewer 默认边距 */
:deep(.jv-container) {
  padding: 0 !important;
}

.encode-result {
  padding: 8px 12px;
  border-radius: 6px;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.6;
  transition: background-color 0.3s;
}

.encode-result--light {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.encode-result--dark {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ce9178;
}
</style>
