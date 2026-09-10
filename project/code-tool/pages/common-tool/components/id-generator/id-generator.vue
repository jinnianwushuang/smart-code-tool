<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base shadow-2">
      <!-- 统一头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="fingerprint" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">标识符 (ID) 生成器</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：配置面板 -->
        <div class="col-12 col-md-4">
          <div class="text-subtitle2 q-mb-md text-grey-8">生成配置</div>
          <a-form layout="vertical">
            <a-form-item label="标识符类型">
              <a-radio-group v-model:value="config.type" button-style="solid" class="full-width">
                <a-radio-button value="uuid" style="width: 50%; text-align: center"
                  >UUID (v4)</a-radio-button
                >
                <a-radio-button value="nanoid" style="width: 50%; text-align: center"
                  >NanoID</a-radio-button
                >
              </a-radio-group>
            </a-form-item>

            <a-form-item label="生成数量">
              <a-input-number v-model:value="config.count" :min="1" :max="100" class="full-width" />
            </a-form-item>

            <a-form-item v-if="config.type === 'nanoid'" label="NanoID 长度定制">
              <a-slider v-model:value="config.length" :min="2" :max="64" />
            </a-form-item>

            <a-form-item label="自定义前缀">
              <a-input v-model:value="config.prefix" placeholder="例如: user_" allow-clear />
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="config.uppercase">强制全大写 (UPPERCASE)</a-checkbox>
            </a-form-item>

            <div class="actions">
              <a-button type="primary" block size="large" @click="generateIds" class="btn-generate">
                <template #icon><ThunderboltOutlined /></template>
                立即生成
              </a-button>
            </div>
          </a-form>
        </div>

        <!-- 右侧：结果展示 -->
        <div class="col-12 col-md-8">
          <div class="result-header q-mb-md">
            <span class="text-subtitle2 text-grey-8"
              >生成结果 (最近 {{ generatedList.length }} 条)</span
            >
            <a-space v-if="generatedList.length > 0">
              <a-button size="small" @click="copyAll">
                <template #icon><CopyOutlined /></template>复制全部
              </a-button>
              <a-button size="small" danger @click="clearHistory">
                <template #icon><DeleteOutlined /></template>清空
              </a-button>
            </a-space>
          </div>

          <div class="list-wrapper">
            <div v-if="generatedList.length === 0" class="empty-state">
              <a-empty description="暂无生成的 ID" />
            </div>

            <div
              v-for="(item, index) in generatedList"
              :key="index"
              class="id-item transition-base"
            >
              <div class="id-content">
                <span class="id-time">[{{ item.timestamp }}]</span>
                <code class="id-value font-mono">{{ item.value }}</code>
              </div>
              <a-button
                type="link"
                @click="copyToClipboard(item)"
                :class="item.copied ? 'text-positive' : 'text-primary'"
              >
                <template #icon>
                  <CheckOutlined v-if="item.copied" />
                  <CopyOutlined v-else />
                </template>
                {{ item.copied ? '已复制' : '复制' }}
              </a-button>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  CopyOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CheckOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

// --- 状态定义 ---
const config = reactive({
  type: 'uuid', // 生成类型: uuid | nanoid
  count: 10, // 批量生成数量
  length: 21, // nanoid 专属长度
  prefix: '', // 自定义前缀
  uppercase: false, // 是否大写
})

const generatedList = ref([])

// --- 核心逻辑：生成器 ---
const generateIds = () => {
  const results = []
  for (let i = 0; i < config.count; i++) {
    let id = ''

    if (config.type === 'uuid') {
      id = uuidv4()
    } else {
      // nanoid 支持自定义长度
      id = nanoid(config.length)
    }

    // 处理前缀
    if (config.prefix) {
      id = `${config.prefix}${id}`
    }

    // 处理大小写
    if (config.uppercase) {
      id = id.toUpperCase()
    }

    results.push({
      value: id,
      copied: false,
      timestamp: new Date().toLocaleTimeString(),
    })
  }
  generatedList.value = [...results, ...generatedList.value].slice(0, 100) // 保留最近100条
  message.success(`成功生成 ${config.count} 个 ID`)
}

// --- 操作方法 ---
const copyToClipboard = (item) => {
  projectCopyText(item.value)
  item.copied = true
  setTimeout(() => {
    item.copied = false
  }, 2000)
}

const copyAll = () => {
  const allText = generatedList.value.map((i) => i.value).join('\n')
  projectCopyText(allText)
}

const clearHistory = () => {
  generatedList.value = []
}

// 初始化生成一次
onMounted(() => {
  generateIds()
})
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

.full-width {
  width: 100%;
}

.actions {
  margin-top: 24px;
}

.btn-generate {
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

.list-wrapper {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding-right: 4px;
}

.id-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 8px;
}

.id-item:hover {
  border-color: var(--q-primary);
  background: rgba(128, 128, 128, 0.08);
}

.id-content {
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.id-time {
  color: rgba(128, 128, 128, 0.6);
  font-size: 12px;
}

.id-value {
  color: inherit;
  font-weight: 500;
  word-break: break-all;
}

.empty-state {
  padding: 40px 0;
}

/* 自定义滚动条 */
.list-wrapper::-webkit-scrollbar {
  width: 6px;
}
.list-wrapper::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-radius: 3px;
}
</style>
