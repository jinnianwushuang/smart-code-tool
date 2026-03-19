<template>
  <div class="p-6 max-w-5xl mx-auto">
    <a-card title="🛠️ 进阶文本切割专家" :bordered="false" class="shadow-lg">
      <template #extra>
        <a-space>
          <a-upload :before-upload="handleFileUpload" :show-upload-list="false">
            <a-button type="dashed">读取大文件 (.txt)</a-button>
          </a-upload>
          <a-tag color="orange">支持 ZIP 导出</a-tag>
        </a-space>
      </template>

      <a-space direction="vertical" class="w-full" size="large">
        <!-- 输入区 -->
        <div class="relative">
          <a-textarea
            v-model:value="inputText"
            placeholder="粘贴文本或通过上方按钮导入文件..."
            :auto-size="{ minRows: 8, maxRows: 12 }"
            allow-clear
          />
          <div class="absolute bottom-2 right-4 text-gray-400 text-xs">
            当前字数: {{ inputText.length.toLocaleString() }}
          </div>
        </div>

        <!-- 高级配置面板 -->
        <a-tabs v-model:activeKey="config.type" type="card">
          <!-- 长度模式 -->
          <a-tab-pane key="length" tab="按字数切割">
            <a-input-number
              v-model:value="config.length"
              :min="1"
              addon-after="字/份"
              class="w-64"
            />
          </a-tab-pane>

          <!-- 份数模式 -->
          <a-tab-pane key="count" tab="均分为份数">
            <a-input-number
              v-model:value="config.count"
              :min="1"
              addon-after="总份数"
              class="w-64"
            />
          </a-tab-pane>

          <!-- 正则模式 -->
          <a-tab-pane key="regex" tab="正则/预设切割">
            <a-space>
              <a-select
                v-model:value="config.regexPreset"
                style="width: 200px"
                @change="applyPreset"
              >
                <a-select-option value="\n\n+">按段落 (空行)</a-select-option>
                <a-select-option value="[。！？?!\n]">按句子 (中英文标点)</a-select-option>
                <a-select-option value="第[一二三四五六七八九十\d]+章"
                  >按章节名 (第x章)</a-select-option
                >
                <a-select-option value="custom">自定义正则表达式</a-select-option>
              </a-select>
              <a-input
                v-if="config.regexPreset === 'custom'"
                v-model:value="config.regexStr"
                placeholder="输入正则，如 \d+"
              />
            </a-space>
          </a-tab-pane>
        </a-tabs>

        <a-button type="primary" block size="large" @click="handleSplit" :loading="loading">
          开始处理并生成预览
        </a-button>

        <!-- 结果控制与展示 -->
        <div v-if="results.length > 0">
          <div class="flex justify-between items-center mb-4 bg-blue-50 p-3 rounded">
            <div>
              生成了 <span class="font-bold text-blue-600">{{ results.length }}</span> 个片段
            </div>
            <a-space>
              <a-button @click="downloadAsTxt">单文件导出 (.txt)</a-button>
              <a-button type="primary" @click="downloadAsZip">打包下载 (.zip)</a-button>
            </a-space>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            <a-card
              v-for="(item, index) in results"
              :key="index"
              size="small"
              :title="`#${index + 1}`"
              hoverable
            >
              <template #extra>
                <a-typography-link @click="copyToClipboard(item)">复制</a-typography-link>
              </template>
              <div class="text-xs text-gray-500 line-clamp-4 leading-relaxed">
                {{ item }}
              </div>
              <div class="mt-2 text-[10px] text-gray-300">{{ item.length }} chars</div>
            </a-card>
          </div>
        </div>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

const inputText = ref('')
const loading = ref(false)
const results = ref([])

const config = reactive({
  type: 'length',
  length: 5000,
  count: 5,
  regexPreset: '\\n\\n+',
  regexStr: '',
})

// 1. 处理大文件导入
const handleFileUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target.result
    message.success('文件读取成功')
  }
  reader.readAsText(file)
  return false // 阻止自动上传
}

// 2. 预设正则切换
const applyPreset = (val) => {
  if (val !== 'custom') config.regexStr = val
}

// 3. 核心切割逻辑
const handleSplit = () => {
  if (!inputText.value) return message.error('请提供文本内容')
  loading.value = true

  // 使用 setTimeout 模拟微任务，防止 UI 瞬间死掉
  setTimeout(() => {
    const text = inputText.value
    let res = []

    try {
      if (config.type === 'length') {
        for (let i = 0; i < text.length; i += config.length) {
          res.push(text.substring(i, i + config.length))
        }
      } else if (config.type === 'count') {
        const size = Math.ceil(text.length / config.count)
        for (let i = 0; i < text.length; i += size) {
          res.push(text.substring(i, i + size))
        }
      } else if (config.type === 'regex') {
        const pattern = new RegExp(config.regexStr || config.regexPreset, 'g')
        // 按正则分割并过滤掉空项
        res = text.split(pattern).filter((s) => s.trim().length > 0)
      }

      results.value = res
      message.success(`切割完成，共 ${res.length} 段`)
    } catch (e) {
      message.error('正则语法错误，请检查')
    } finally {
      loading.value = false
    }
  }, 100)
}

// 4. 打包导出为 ZIP
const downloadAsZip = async () => {
  const zip = new JSZip()
  const folder = zip.folder('split_results')

  results.value.forEach((content, index) => {
    folder.file(`part_${index + 1}.txt`, content)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `text_parts_${Date.now()}.zip`)
  message.success('ZIP 打包导出成功')
}

const downloadAsTxt = () => {
  const blob = new Blob([results.value.join('\n\n---NEXT_PART---\n\n')], { type: 'text/plain' })
  saveAs(blob, 'combined_parts.txt')
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  message.success('已复制')
}
</script>

<style scoped>
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
