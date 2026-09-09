<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base shadow-2">
      <!-- 统一头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="biotech" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">🔬 全能正则调试器 (带语义解释)</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入与配置 -->
        <div class="col-12 col-md-6">
          <a-space direction="vertical" style="width: 100%" size="middle">
            <!-- 常用库 -->
            <div class="library-tags">
              <div class="text-caption q-mb-xs">常用正则库:</div>
              <a-tag
                v-for="item in regexLib"
                :key="item.name"
                color="blue"
                class="lib-tag cursor-pointer"
                @click="applyLibrary(item)"
              >
                {{ item.name }}
              </a-tag>
            </div>

            <!-- 正则输入 -->
            <div class="section">
              <div class="label q-mb-xs">正则表达式:</div>
              <a-input v-model:value="regexStr" size="large" class="font-mono">
                <template #prefix><span class="slash">/</span></template>
                <template #suffix>
                  <span class="slash">/</span>
                  <a-checkbox-group
                    v-model:value="flags"
                    :options="['g', 'i', 'm']"
                    class="flag-group"
                  />
                </template>
              </a-input>
            </div>

            <!-- 解释模式面板 -->
            <div class="explanation-panel transition-base">
              <div class="label"><InfoCircleOutlined style="margin-right: 8px" />正则语义拆解:</div>
              <div class="explain-content">
                <div v-if="!explanations.length" class="text-grey-5 text-center q-pa-sm">
                  请输入正则查看解释
                </div>
                <div v-else class="explain-list">
                  <div v-for="(exp, i) in explanations" :key="i" class="explain-item">
                    <span class="exp-token font-mono">{{ exp.token }}</span>
                    <span class="exp-text">{{ exp.desc }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 测试文本 -->
            <div class="section">
              <div class="label">测试文本:</div>
              <a-textarea
                v-model:value="testText"
                :rows="6"
                placeholder="输入待测试的文本内容..."
              />
            </div>
          </a-space>
        </div>

        <!-- 右侧：结果展示 -->
        <div class="col-12 col-md-6">
          <div class="result-sticky-wrapper">
            <div class="section">
              <div class="label">匹配高亮预览:</div>
              <div class="highlight-area font-mono" v-html="highlightedHtml"></div>
            </div>

            <div class="section q-mt-lg">
              <div class="label">代码片段 (Vue 3):</div>
              <div class="code-wrapper font-mono">
                <pre class="q-ma-none"><code>{{ jsSnippet }}</code></pre>
                <q-btn
                  size="sm"
                  color="indigo-3"
                  flat
                  icon="content_copy"
                  class="copy-btn"
                  @click="copy(jsSnippet)"
                >
                  <q-tooltip>复制 JS 代码</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { useRegexTester } from './composables/use-regex-tester.js'

const {
  regexStr,
  flags,
  testText,
  explanations,
  highlightedHtml,
  jsSnippet,
  regexLib,
  applyLibrary,
  copy,
} = useRegexTester()
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

.label {
  font-weight: 600;
  display: flex;
  align-items: center;
  color: var(--q-primary);
}

.slash {
  color: rgba(128, 128, 128, 0.5);
  font-weight: bold;
  padding: 0 4px;
}

/* 解释面板样式 */
.explanation-panel {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.explain-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.explain-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.exp-token {
  background: rgba(196, 29, 127, 0.1);
  color: #c41d7f;
  padding: 0 6px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid rgba(196, 29, 127, 0.2);
}

.exp-text {
  color: inherit;
  opacity: 0.8;
  font-size: 13px;
}

.highlight-area {
  background: rgba(128, 128, 128, 0.03);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-height: 180px;
  white-space: pre-wrap;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

:deep(.regex-match) {
  background: rgba(255, 229, 143, 0.4);
  border-bottom: 2px solid #faad14;
  color: inherit;
}

.code-wrapper {
  position: relative;
  background: rgba(40, 44, 52, 0.95);
  border-radius: 8px;
  padding: 16px;
  color: #9cdcfe;
}

.code-wrapper pre {
  margin: 0;
  font-size: 12px;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.result-sticky-wrapper {
  position: sticky;
  top: 0;
}
</style>
