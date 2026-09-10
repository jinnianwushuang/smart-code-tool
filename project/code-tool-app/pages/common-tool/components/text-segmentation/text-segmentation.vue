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

        <!-- 结果展示 -->
        <ResultDisplay
          v-if="results.length > 0"
          :results="results"
          :downloadAsTxt="downloadAsTxt"
          :downloadAsZip="downloadAsZip"
          :copyToClipboard="copyToClipboard"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ThunderboltOutlined } from '@ant-design/icons-vue'
import ResultDisplay from './components/result-display.vue'
import { useTextSegmentation } from './composables/use-text-segmentation.js'

const {
  inputText,
  loading,
  results,
  config,
  handleFileUpload,
  applyPreset,
  handleSplit,
  downloadAsZip,
  downloadAsTxt,
  copyToClipboard,
} = useTextSegmentation()
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

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

.btn-process {
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
