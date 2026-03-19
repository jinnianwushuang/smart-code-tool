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
  navigator.clipboard.writeText(item.value)
  item.copied = true
  message.success('已复制到剪贴板')
  setTimeout(() => {
    item.copied = false
  }, 2000)
}

const copyAll = () => {
  const allText = generatedList.value.map((i) => i.value).join('\n')
  navigator.clipboard.writeText(allText)
  message.success('全部已复制')
}

const clearHistory = () => {
  generatedList.value = []
}

// 初始化生成一次
onMounted(() => {
  generateIds()
})
</script>

<template>
  <div class="generator-container">
    <a-row :gutter="24">
      <!-- 左侧：配置面板 -->
      <a-col :xs="24" :lg="8">
        <a-card title="生成配置" :bordered="false" class="config-card">
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
              <a-checkbox v-model:checked="config.uppercase">强制转换为大写</a-checkbox>
            </a-form-item>

            <div class="actions">
              <a-button type="primary" block size="large" @click="generateIds">
                <template #icon><ThunderboltOutlined /></template>
                立即生成
              </a-button>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右侧：结果展示 -->
      <a-col :xs="24" :lg="16">
        <a-card :bordered="false" class="result-card">
          <template #title>
            <div class="result-header">
              <span>生成结果 (最近 {{ generatedList.length }} 条)</span>
              <div class="header-btns">
                <a-button size="small" @click="copyAll" v-if="generatedList.length > 0">
                  <template #icon><CopyOutlined /></template>复制全部
                </a-button>
                <a-button size="small" danger @click="clearHistory" v-if="generatedList.length > 0">
                  <template #icon><DeleteOutlined /></template>清空
                </a-button>
              </div>
            </div>
          </template>

          <div class="list-wrapper">
            <div v-if="generatedList.length === 0" class="empty-state">
              <a-empty description="暂无生成的 ID" />
            </div>

            <div v-for="(item, index) in generatedList" :key="index" class="id-item">
              <div class="id-content">
                <span class="id-time">[{{ item.timestamp }}]</span>
                <code class="id-value">{{ item.value }}</code>
              </div>
              <a-button
                type="link"
                @click="copyToClipboard(item)"
                :class="{ 'copied-btn': item.copied }"
              >
                <template #icon>
                  <CheckOutlined v-if="item.copied" />
                  <CopyOutlined v-else />
                </template>
                {{ item.copied ? '已复制' : '复制' }}
              </a-button>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.generator-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.config-card,
.result-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.full-width {
  width: 100%;
}

.actions {
  margin-top: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-btns {
  display: flex;
  gap: 8px;
}

.list-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

.id-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s;
}

.id-item:hover {
  background: #fff;
  border-color: #1890ff;
  transform: translateX(4px);
}

.id-content {
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.id-time {
  color: #bfbfbf;
  font-family: monospace;
  font-size: 12px;
}

.id-value {
  color: #333;
  font-weight: 600;
  word-break: break-all;
}

.copied-btn {
  color: #52c41a !important;
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
