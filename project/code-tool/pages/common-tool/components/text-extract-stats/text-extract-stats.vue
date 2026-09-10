<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1400px">
      <!-- 头部工具栏 -->
      <q-card-section class="bg-indigo-8 text-white">
        <div class="row items-center q-gutter-sm">
          <q-icon name="text_fields" size="sm" />
          <div class="text-h6 text-weight-bold">文本提取与模板替换工具</div>
          <q-space />
          <q-btn
            flat
            color="white"
            label="样例数据"
            icon="lightbulb"
            size="sm"
            @click="loadSample"
          />
          <q-btn flat color="white" label="清空" icon="delete" size="sm" @click="clearAll" />
        </div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入与配置 -->
        <div class="col-12 col-md-5 q-gutter-y-md">
          <!-- 提取模式 -->
          <div class="control-panel q-pa-md rounded-borders">
            <div class="text-subtitle2 q-mb-sm">提取模式</div>
            <q-btn-toggle
              v-model="extractMode"
              toggle-color="primary"
              :options="[
                { label: '英文单词 (转小写)', value: 'words' },
                { label: '连续数字', value: 'numbers' },
              ]"
              class="w-full"
            />
          </div>

          <!-- 输入文本 -->
          <q-input
            v-model="inputText"
            type="textarea"
            filled
            label="输入文本内容"
            placeholder="粘贴或输入需要提取的文本..."
            rows="10"
            clearable
            class="font-mono"
          >
            <template v-slot:hint> 当前字数: {{ inputText.length.toLocaleString() }} </template>
          </q-input>

          <!-- 模板替换区域 -->
          <div class="control-panel q-pa-md rounded-borders">
            <div class="text-subtitle2 q-mb-sm">模板语法替换</div>
            <q-input
              v-model="placeholder"
              dense
              filled
              label="占位符"
              placeholder="{{item}}"
              class="q-mb-sm font-mono"
            />
            <q-input
              v-model="template"
              type="textarea"
              filled
              label="模板内容 (使用占位符)"
              :placeholder="`例如: const ${placeholder} = ref('')`"
              rows="4"
              class="font-mono"
            />
          </div>

          <!-- 模板替换结果 -->
          <div v-if="templateResult">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-grey-8">替换结果</div>
              <q-btn
                flat
                dense
                icon="content_copy"
                color="primary"
                label="复制结果"
                size="sm"
                @click="copyTemplateResult"
              />
            </div>
            <q-input
              :model-value="templateResult"
              type="textarea"
              filled
              readonly
              rows="8"
              class="font-mono result-area"
            />
          </div>
        </div>

        <!-- 右侧：统计结果 -->
        <div class="col-12 col-md-7">
          <div class="text-subtitle2 text-grey-8 q-mb-md">提取结果与统计</div>
          <ExtractStats
            v-if="stats.total > 0"
            :stats="stats"
            :copyStats="copyStats"
            :copyExtracted="copyExtracted"
          />
          <div v-else class="text-center text-grey-5 q-pa-xl">
            <q-icon name="info_outline" size="48px" class="q-mb-md" />
            <div>请输入文本并选择提取模式</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import ExtractStats from './components/extract-stats.vue'
import { useTextExtract } from './composables/use-text-extract.js'

const {
  inputText,
  extractMode,
  template,
  placeholder,
  stats,
  uniqueItems,
  templateResult,
  copyExtracted,
  copyStats,
  copyTemplateResult,
  loadSample,
  clearAll,
} = useTextExtract()
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

.control-panel {
  background-color: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.rounded-borders {
  border-radius: 8px;
}

.font-mono :deep(textarea),
.font-mono :deep(input) {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 13px;
}

.result-area :deep(textarea) {
  background: rgba(128, 128, 128, 0.02);
}

.w-full {
  width: 100%;
}
</style>
