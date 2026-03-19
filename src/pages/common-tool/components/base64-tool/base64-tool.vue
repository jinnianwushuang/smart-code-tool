<template>
  <div class="p-6 max-w-4xl mx-auto">
    <a-card title="🔐 Base64 转换专家" :bordered="false" class="shadow-lg">
      <template #extra>
        <a-tag color="green">支持中文字符转码</a-tag>
      </template>

      <a-tabs v-model:activeKey="activeTab">
        <!-- 1. 文本互转 -->
        <a-tab-pane key="text" tab="文本 ↔ Base64">
          <div class="space-y-4 pt-4">
            <div>
              <div class="flex justify-between mb-2">
                <span class="font-medium text-gray-500">原文 (UTF-8):</span>
                <a-button size="small" type="link" @click="handleTextClear">清空</a-button>
              </div>
              <a-textarea
                v-model:value="sourceText"
                placeholder="请输入需要转换的文字..."
                :auto-size="{ minRows: 4, maxRows: 6 }"
                @change="encodeText"
              />
            </div>

            <div class="flex justify-center py-2">
              <a-space>
                <a-button type="primary" shape="circle" @click="encodeText">↓</a-button>
                <a-button type="primary" shape="circle" @click="decodeText">↑</a-button>
              </a-space>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="font-medium text-gray-500">Base64 编码结果:</span>
                <a-button size="small" type="link" @click="copyToClipboard(base64Text)"
                  >复制结果</a-button
                >
              </div>
              <a-textarea
                v-model:value="base64Text"
                placeholder="在此输入 Base64 字符串进行还原..."
                :auto-size="{ minRows: 4, maxRows: 6 }"
                @change="decodeText"
              />
            </div>
          </div>
        </a-tab-pane>

        <!-- 2. 图片转 Base64 -->
        <a-tab-pane key="image" tab="图片 → Base64">
          <div class="pt-4 text-center">
            <a-upload-dragger
              name="file"
              :multiple="false"
              :before-upload="handleImageUpload"
              @change="onFileChange"
              accept="image/*"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">点击或将图片拖拽到此区域转换</p>
              <p class="ant-upload-hint">支持 JPG, PNG, GIF, SVG 等</p>
            </a-upload-dragger>

            <div v-if="imgBase64" class="mt-6 text-left">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs text-gray-400">Data URL (可直接用于 HTML/CSS):</span>
                <a-button size="small" type="primary" @click="copyToClipboard(imgBase64)"
                  >复制 DataURL</a-button
                >
              </div>
              <a-textarea
                :value="imgBase64"
                readonly
                :auto-size="{ minRows: 3, maxRows: 5 }"
                class="mb-4"
              />

              <div class="bg-gray-100 p-4 rounded-lg flex justify-center">
                <img :src="imgBase64" class="max-h-48 rounded shadow-sm" alt="预览" />
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { Base64 } from 'js-base64' // 核心依赖：处理 UTF-8 乱码

const activeTab = ref('text')
const sourceText = ref('')
const base64Text = ref('')
const imgBase64 = ref('')

// --- 文本处理逻辑 ---

// 编码：原文 -> Base64
const encodeText = () => {
  if (!sourceText.value) {
    base64Text.value = ''
    return
  }
  try {
    base64Text.value = Base64.encode(sourceText.value)
  } catch (e) {
    message.error('编码失败，请检查输入')
  }
}

// 解码：Base64 -> 原文
const decodeText = () => {
  if (!base64Text.value) {
    sourceText.value = ''
    return
  }
  try {
    // isValid 检查是否为合法的 Base64
    if (Base64.isValid(base64Text.value)) {
      sourceText.value = Base64.decode(base64Text.value)
    } else {
      message.warn('不合法的 Base64 字符串')
    }
  } catch (e) {
    message.error('解码失败，可能包含非法字符')
  }
}

const handleTextClear = () => {
  sourceText.value = ''
  base64Text.value = ''
}

// --- 图片处理逻辑 ---

const handleImageUpload = (file) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    imgBase64.value = reader.result
    message.success('图片转换成功')
  }
  return false // 阻止默认上传行为
}

// --- 通用功能 ---
const copyToClipboard = async (content) => {
  if (!content) return message.warning('内容为空')
  try {
    await navigator.clipboard.writeText(content)
    message.success('复制成功！')
  } catch (err) {
    message.error('复制失败，请手动选择复制')
  }
}
</script>

<style scoped>
.ant-card {
  border-radius: 12px;
}
:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
