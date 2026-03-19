<template>
  <div class="regex-container">
    <a-card title="🔬 全能正则调试器 (带语义解释)" :bordered="false">
      <a-row :gutter="24">
        <!-- 左侧：输入与配置 -->
        <a-col :span="12">
          <a-space direction="vertical" style="width: 100%" size="middle">
            <!-- 常用库 (保持之前功能) -->
            <div class="library-tags">
              <a-tag
                v-for="item in regexLib"
                :key="item.name"
                color="blue"
                class="lib-tag"
                @click="applyLibrary(item)"
              >
                {{ item.name }}
              </a-tag>
            </div>

            <!-- 正则输入 -->
            <div class="section">
              <div class="label">正则表达式:</div>
              <a-input v-model:value="regexStr" size="large">
                <template #prefix><span class="slash">/</span></template>
                <template #suffix>
                  <span class="slash">/</span>
                  <a-checkbox-group v-model:value="flags" :options="['g', 'i', 'm']" />
                </template>
              </a-input>
            </div>

            <!-- 解释模式面板 -->
            <div class="explanation-panel">
              <div class="label"><InfoCircleOutlined style="margin-right: 8px" />正则语义拆解:</div>
              <div class="explain-content">
                <a-empty
                  v-if="!explanations.length"
                  description="请输入正则查看解释"
                  size="small"
                />
                <div v-else class="explain-list">
                  <div v-for="(exp, i) in explanations" :key="i" class="explain-item">
                    <span class="exp-token">{{ exp.token }}</span>
                    <span class="exp-text">{{ exp.desc }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 测试文本 -->
            <div class="section">
              <div class="label">测试文本:</div>
              <a-textarea v-model:value="testText" :rows="5" />
            </div>
          </a-space>
        </a-col>

        <!-- 右侧：结果展示 -->
        <a-col :span="12">
          <div class="sticky-panel">
            <div class="section">
              <div class="label">匹配高亮预览:</div>
              <div class="highlight-area" v-html="highlightedHtml"></div>
            </div>

            <div class="section" style="margin-top: 24px">
              <div class="label">代码片段 (Vue 3):</div>
              <div class="code-wrapper">
                <pre><code>{{ jsSnippet }}</code></pre>
                <a-button
                  size="small"
                  type="primary"
                  ghost
                  class="copy-btn"
                  @click="copy(jsSnippet)"
                  >复制</a-button
                >
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'

// 1. 正则解释映射表
const SCHEMA = [
  { re: /\\d/, desc: '匹配一个数字字符 (0-9)' },
  { re: /\\w/, desc: '匹配字母、数字或下划线' },
  { re: /\\s/, desc: '匹配任意空白符 (空格、制表符)' },
  { re: /\^/, desc: '匹配字符串的开始位置' },
  { re: /\$/, desc: '匹配字符串的结束位置' },
  { re: /\.\*/, desc: '匹配任意字符 (零个或多个)' },
  { re: /\+/, desc: '匹配前面的子表达式一次或多次' },
  { re: /\*/, desc: '匹配前面的子表达式零次或多次' },
  { re: /\?/, desc: '匹配前面的子表达式零次或一次 (或开启非贪婪模式)' },
  { re: /\[.*\]/, desc: '字符集合，匹配方括号内的任意字符' },
  { re: /\(.*\)/, desc: '捕获分组，记忆匹配到的内容' },
  { re: /\{(\d+),?(\d+)?\}/, desc: '限定符，匹配前面的元素指定次数' },
  { re: /\\b/, desc: '匹配一个单词边界' },
  { re: /\|/, desc: '指明两项之间的一个选择 (或)' },
]

const regexStr = ref('^1[3-9]\\d{9}$')
const flags = ref(['g'])
const testText = ref('我的电话是 13800138000，他的电话是 19912345678')

// 2. 计算语义解释
const explanations = computed(() => {
  if (!regexStr.value) return []
  const result = []

  // 简单的 Token 扫描逻辑
  // 实际项目中可使用更复杂的正则解析器如 'regjsparser'
  SCHEMA.forEach((item) => {
    if (item.re.test(regexStr.value)) {
      // 提取实际匹配到的字符
      const matches = regexStr.value.match(new RegExp(item.re.source, 'g'))
      if (matches) {
        result.push({ token: matches[0], desc: item.desc })
      }
    }
  })

  // 处理普通文字
  if (/[a-zA-Z0-9]/.test(regexStr.value.replace(/\\[dws]/g, ''))) {
    result.push({ token: 'abc', desc: '匹配字面量字符 (精确匹配)' })
  }

  return result
})

// 3. 基础逻辑 (复用之前优化版本)
const highlightedHtml = computed(() => {
  if (!testText.value || !regexStr.value) return testText.value
  try {
    const re = new RegExp(regexStr.value, flags.value.join(''))
    return testText.value
      .replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])
      .replace(re, (m) => `<mark class="regex-match">${m}</mark>`)
  } catch {
    return '正则语法有误'
  }
})

const jsSnippet = computed(
  () => `const re = /${regexStr.value}/${flags.value.join('')};\nconsole.log(re.test(text));`,
)

const regexLib = [
  { name: '手机号', pattern: '^1[3-9]\\d{9}$', flags: ['g'], test: '13800138000' },
  {
    name: '邮箱',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    flags: ['g'],
    test: 'admin@vue.js',
  },
]

const applyLibrary = (item) => {
  regexStr.value = item.pattern
  flags.value = [...item.flags]
  testText.value = item.test
}

const copy = (t) => {
  navigator.clipboard.writeText(t)
  message.success('已复制')
}
</script>

<style scoped>
.regex-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}
.label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #444;
  display: flex;
  align-items: center;
}
.slash {
  color: #aaa;
  font-weight: bold;
  padding: 0 4px;
}

/* 解释面板样式 */
.explanation-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin: 10px 0;
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
  background: #f5f5f5;
  color: #c41d7f;
  padding: 0 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  border: 1px solid #ddd;
}
.exp-text {
  color: #666;
  font-size: 13px;
}

.highlight-area {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 12px;
  min-height: 150px;
  white-space: pre-wrap;
  font-family: monospace;
}
:deep(.regex-match) {
  background: #ffe58f;
  border-bottom: 2px solid #faad14;
}

.code-wrapper {
  position: relative;
  background: #282c34;
  border-radius: 8px;
  padding: 12px;
}
.code-wrapper pre {
  margin: 0;
  color: #9cdcfe;
  font-size: 12px;
}
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
.sticky-panel {
  position: sticky;
  top: 20px;
}
.library-tags {
  margin-bottom: 12px;
}
.lib-tag {
  cursor: pointer;
}
</style>
