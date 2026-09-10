<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 1200px">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="analytics" class="q-mr-sm" />
        <div class="text-h6">Vue 模板全能提取器</div>
        <q-space />
        <div class="text-caption">支持 {{}}、@Event 和 :Property</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 输入区 -->
        <q-input
          v-model="rawTemplate"
          type="textarea"
          filled
          label="粘贴 Vue Template 代码"
          placeholder='例如: <div :title="pageTitle" @click="handleClick">{{ userInfo.name }}</div>'
          rows="8"
          @update:model-value="processAll"
        />

        <!-- 全局控制栏 -->
        <div
          class="row items-center q-gutter-x-md control-panel q-pa-sm rounded-borders border-grey-4 q-my-md"
        >
          <q-btn label="清空全部" color="grey-7" @click="reset" icon="delete_sweep" />
          <q-separator vertical inset />
          <q-checkbox v-model="addComma" label="末尾加逗号" dense color="indigo" />
          <q-space />
          <div class="text-caption">
            共识别:
            <q-badge color="blue" class="q-mx-xs">{{
              mustacheProps.length + mustacheMethods.length
            }}</q-badge>
            插值 |
            <q-badge color="orange" class="q-mx-xs">{{ eventFunctions.length }}</q-badge> 事件 |
            <q-badge color="cyan" class="q-mx-xs">{{ colonProps.length }}</q-badge> 绑定
          </div>
        </div>

        <!-- 结果展示网格 -->
        <div class="row q-col-gutter-md">
          <!-- 1. Mustache 变量 -->
          <div class="col-12 col-sm-6 col-md-3">
            <ResultCard
              title="插值变量 (Data/Props)"
              icon="Data"
              color="blue-8"
              :content="displayMustacheProps"
              @copy="copy(displayMustacheProps)"
            />
          </div>

          <!-- 2. Mustache 函数 -->
          <div class="col-12 col-sm-6 col-md-3">
            <ResultCard
              title="插值函数 (Computed/Methods)"
              icon="functions"
              color="indigo-7"
              :content="displayMustacheMethods"
              @copy="copy(displayMustacheMethods)"
            />
          </div>

          <!-- 3. 事件函数 (@) -->
          <div class="col-12 col-sm-6 col-md-3">
            <ResultCard
              title="事件函数 (@Events)"
              icon="ads_click"
              color="orange-9"
              :content="displayEvents"
              @copy="copy(displayEvents)"
            />
          </div>

          <!-- 4. 绑定属性 (:) -->
          <div class="col-12 col-sm-6 col-md-3">
            <ResultCard
              title="绑定属性 (:Props)"
              icon="link"
              color="cyan-9"
              :content="displayColonProps"
              @copy="copy(displayColonProps)"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { copyText, extract_base_variable } from 'src/output/common/project-common.js'
import ResultCard from './components/result-card.vue'

// --- 子组件：结果卡片 ---
// 为了代码整洁，内部定义一个小组件或直接在主模板中书写

// --- 状态管理 ---
const rawTemplate = ref('')
const addComma = ref(true)

const mustacheProps = ref([])
const mustacheMethods = ref([])
const eventFunctions = ref([])
const colonProps = ref([])

// --- 正则表达式定义 ---
const MUSTACHE_REGEX = /\{\{(.*?)\}\}/g
const VUE_EVENT_REGEX = /@([\w-]+)((?:\.[\w-]+)*)\s*=\s*["']([^"']+)["']/g
const COLON_PROP_REGEX = /:([\w.-]+)="([^"]+)"/g

// --- 核心逻辑 ---

/**
 * 解析事件处理器字符串
 */
const parseVueHandler = (expression) => {
  const content = expression.trim()
  if (!content || /[=+\-*/&|!>]/.test(content)) return null
  const funcMatch = content.match(/^([a-zA-Z_$][\w$]*)/)
  return funcMatch ? funcMatch[1] : null
}

const processAll = () => {
  const text = rawTemplate.value
  if (!text) {
    resetResult()
    return
  }

  // 1. 提取 Mustache {{ }}
  const mProps = new Set()
  const mMethods = new Set()
  let mMatch
  MUSTACHE_REGEX.lastIndex = 0
  while ((mMatch = MUSTACHE_REGEX.exec(text)) !== null) {
    const inner = mMatch[1].trim()
    if (inner.includes('(')) {
      const funcName = inner.split('(')[0].trim()
      if (funcName) mMethods.add(funcName)
    } else {
      const baseProp = inner.split('.')[0].trim()
      if (baseProp) mProps.add(baseProp)
    }
  }
  mustacheProps.value = Array.from(mProps)
  mustacheMethods.value = Array.from(mMethods)

  // 2. 提取事件 @
  const eFuncs = new Set()
  let eMatch
  VUE_EVENT_REGEX.lastIndex = 0
  while ((eMatch = VUE_EVENT_REGEX.exec(text)) !== null) {
    const funcName = parseVueHandler(eMatch[3])
    if (funcName) eFuncs.add(funcName)
  }
  eventFunctions.value = Array.from(eFuncs)

  // 3. 提取绑定属性 :
  const cProps = new Set()
  let cMatch
  COLON_PROP_REGEX.lastIndex = 0
  while ((cMatch = COLON_PROP_REGEX.exec(text)) !== null) {
    let attrVal = cMatch[2].trim()
    if (attrVal) {
      attrVal = extract_base_variable(attrVal)
      cProps.add(attrVal)
    }
  }
  colonProps.value = Array.from(cProps)
}

// --- 格式化输出 ---
const formatList = (list) => {
  if (!list.length) return ''
  return list.map((item) => `${item}${addComma.value ? ',' : ''}`).join('\n')
}

const displayMustacheProps = computed(() => formatList(mustacheProps.value))
const displayMustacheMethods = computed(() => formatList(mustacheMethods.value))
const displayEvents = computed(() => formatList(eventFunctions.value))
const displayColonProps = computed(() => formatList(colonProps.value))

// --- 通用方法 ---
const resetResult = () => {
  mustacheProps.value = []
  mustacheMethods.value = []
  eventFunctions.value = []
  colonProps.value = []
}

const reset = () => {
  rawTemplate.value = ''
  resetResult()
}

const copy = (text) => {
  if (!text) return
  copyText(text)
}
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.control-panel {
  background-color: rgba(128, 128, 128, 0.05);
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

.rounded-borders {
  border-radius: 8px;
}

.border-grey-4 {
  border: 1px solid rgba(128, 128, 128, 0.2);
  transition: border-color 0.3s;
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.q-card-section.q-pa-none {
  flex-grow: 1;
}
</style>
