<template>
  <div class="container-wrapper">
    <a-row :gutter="24">
      <!-- 左侧：编辑器 -->
      <a-col :xs="24" :lg="16">
        <a-card title="URL 参数解析与编辑器" :bordered="false" class="main-card">
          <template #extra>
            <a-button type="primary" @click="handleParse">
              <template #icon><SwapOutlined /></template>立即解析
            </a-button>
          </template>

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
          <a-input-group compact class="mb-20">
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
            <a-input v-model:value="item.key" placeholder="Key" style="width: 30%" />
            <a-input v-model:value="item.value" placeholder="Value" style="flex: 1" />
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
            <a-button type="primary" block size="large" @click="handleGenerate">
              <template #icon><LinkOutlined /></template>更新原始 URL 并合成
            </a-button>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧：JSON 预览 -->
      <a-col :xs="24" :lg="8">
        <a-card title="实时 JSON 结果" :bordered="false" class="json-card">
          <template #extra>
            <a-button type="link" @click="copyToClipboard(JSON.stringify(liveJson, null, 2))">
              <template #icon><CopyOutlined /></template>复制
            </a-button>
          </template>
          <div class="json-box">
            <json-viewer :value="liveJson" :expand-depth="5" copyable boxed sort />
          </div>
        </a-card>
      </a-col>
    </a-row>
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
  navigator.clipboard.writeText(text)
  message.success('已复制到剪贴板')
}
</script>

<style scoped>
.container-wrapper {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.main-card,
.json-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
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
  background: #fafafa;
  border-radius: 4px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
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
