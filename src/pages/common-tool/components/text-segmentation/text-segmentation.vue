<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base shadow-2">
      <!-- 统一头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="content_cut" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">进阶文本切割专家</div>
        <q-space />
        <div class="row items-center q-gutter-x-sm">
          <a-tag color="orange">支持 ZIP 导出</a-tag>
          <a-upload :before-upload="handleFileUpload" :show-upload-list="false">
            <q-btn
              color="white"
              text-color="indigo-8"
              label="读取大文件 (.txt)"
              icon="upload_file"
              size="sm"
            />
          </a-upload>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 输入区 -->
        <q-input
          v-model="inputText"
          type="textarea"
          filled
          label="原始文本内容"
          placeholder="粘贴文本或通过上方按钮导入文件..."
          rows="10"
          clearable
          class="font-mono"
        >
          <template v-slot:hint> 当前字数: {{ inputText.length.toLocaleString() }} </template>
        </q-input>

        <!-- 高级配置面板 -->
        <div class="control-panel q-pa-md rounded-borders">
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
        </div>

        <a-button
          type="primary"
          block
          size="large"
          @click="handleSplit"
          :loading="loading"
          class="btn-process"
        >
          <template #icon><ThunderboltOutlined v-if="!loading" /></template>
          开始处理并生成预览
        </a-button>

        <!-- 结果控制与展示 -->
        <div v-if="results.length > 0">
          <div
            class="row items-center justify-between q-mb-md results-header q-pa-sm rounded-borders"
          >
            <div class="text-subtitle2">
              生成了 <span class="font-bold text-blue-600">{{ results.length }}</span> 个片段
            </div>
            <a-space>
              <a-button size="small" @click="downloadAsTxt">合并导出 (.txt)</a-button>
              <a-button type="primary" @click="downloadAsZip">打包下载 (.zip)</a-button>
            </a-space>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            <q-card
              v-for="(item, index) in results"
              :key="index"
              flat
              bordered
              class="segment-card transition-base"
            >
              <q-card-section
                class="q-py-xs row items-center justify-between bg-grey-1 transition-base card-header"
              >
                <span class="text-caption text-weight-bold">#{{ index + 1 }}</span>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  size="xs"
                  color="primary"
                  @click="copyToClipboard(item)"
                >
                  <q-tooltip>复制此段</q-tooltip>
                </q-btn>
              </q-card-section>
              <q-separator />
              <q-card-section class="text-xs text-grey-8 line-clamp-4 leading-relaxed font-mono">
                {{ item }}
              </q-card-section>
              <q-card-section class="q-pt-none row justify-end">
                <div class="text-[10px] text-grey-5">{{ item.length }} chars</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { ThunderboltOutlined } from '@ant-design/icons-vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

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

.control-panel {
  background-color: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.results-header {
  background-color: rgba(33, 150, 243, 0.08);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.segment-card {
  background: rgba(128, 128, 128, 0.02);
}

.segment-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
}

.card-header {
  background: rgba(128, 128, 128, 0.05) !important;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

.btn-process {
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
