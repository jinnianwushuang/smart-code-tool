<template>
  <div class="q-pa-md bg-grey-2">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 1000px">
      <q-card-section class="bg-blue-8 text-white row items-center">
        <q-icon name="content_paste" size="sm" class="q-mr-sm" />
        <div class="text-h6">Vue 3 插值提取器 (Mustache {{}})</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 顶部正则提示区 -->
        <div class="row items-center bg-blue-1 q-pa-sm rounded-borders border-blue-2">
          <div class="text-caption text-blue-9 text-weight-bold">
            正则参考: <code class="bg-white q-px-xs">\{\{(.*?)\}\}</code>
          </div>
          <q-space />
          <q-btn
            flat
            dense
            color="blue-9"
            icon="content_copy"
            label="复制正则"
            size="sm"
            @click="copy(regPattern)"
          >
            <q-tooltip>复制用于搜索的正则表达式</q-tooltip>
          </q-btn>
        </div>

        <!-- 输入区 -->
        <q-input
          v-model="rawTemplate"
          type="textarea"
          filled
          label="粘贴 Vue Template 代码,或者正则提取后的代码"
          :placeholder="placehoderTemplate"
          rows="8"
          @update:model-value="extractContent"
        />

        <div class="row q-my-md q-gutter-x-sm">
          <q-btn label="清空" color="grey" variant="flat" @click="reset" />
        </div>

        <div class="row q-col-gutter-md">
          <!-- 属性提取结果 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-item class="bg-grey-1">
                <q-item-section>
                  <q-item-label class="text-weight-bold">提取的属性 (Data/Props)</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="addComma" label="加逗号" dense size="sm" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-input
                  v-model="displayProps"
                  type="textarea"
                  borderless
                  readonly
                  class="q-px-md"
                  placeholder="等待提取..."
                  rows="8"
                />
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  color="primary"
                  icon="content_copy"
                  label="复制属性"
                  @click="copy(displayProps)"
                  :disable="!displayProps"
                />
              </q-card-actions>
            </q-card>
          </div>

          <!-- 函数提取结果 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-item class="bg-grey-1">
                <q-item-section>
                  <q-item-label class="text-weight-bold">提取的函数 (Methods)</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="addComma" label="加逗号" dense size="sm" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-input
                  v-model="displayMethods"
                  type="textarea"
                  borderless
                  readonly
                  class="q-px-md"
                  placeholder="等待提取..."
                  rows="8"
                />
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  color="primary"
                  icon="content_copy"
                  label="复制函数"
                  @click="copy(displayMethods)"
                  :disable="!displayMethods"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const rawTemplate = ref('')
const addComma = ref(true)
const regPattern = ref('\\{\\{(.*?)\\}\\}')

const extractedProps = ref([])
const extractedMethods = ref([])

const placehoderTemplate = `例如: <div>{{ userInfo.name }}</div> <q-btn @click="submit(info)">{{ formatTime(now) }}</q-btn> `

const extractContent = () => {
  if (!rawTemplate.value) {
    extractedProps.value = []
    extractedMethods.value = []
    return
  }

  // 1. 匹配所有 {{ }} 里的内容
  const mustacheRegex = /\{\{(.*?)\}\}/g
  const rawMatches = []
  let match
  while ((match = mustacheRegex.exec(rawTemplate.value)) !== null) {
    rawMatches.push(match[1].trim())
  }

  const propSet = new Set()
  const methodSet = new Set()

  rawMatches.forEach((item) => {
    // 简单的函数识别逻辑：包含括号 () 则视为函数，否则视为属性
    if (item.includes('(')) {
      // 提取函数名：(a,b) 之前的字符
      const funcName = item.split('(')[0].trim()
      if (funcName) methodSet.add(funcName)
    } else {
      // 处理 . 链式调用，取第一位作为原始变量（可选逻辑，根据需要调整）
      const baseProp = item.split('.')[0].trim()
      if (baseProp) propSet.add(baseProp)
    }
  })

  extractedProps.value = Array.from(propSet)
  extractedMethods.value = Array.from(methodSet)
}

// 格式化输出逻辑
const displayProps = computed(() => {
  return extractedProps.value.map((p) => p + (addComma.value ? ',' : '')).join('\n')
})

const displayMethods = computed(() => {
  return extractedMethods.value.map((m) => m + (addComma.value ? ',' : '')).join('\n')
})

const reset = () => {
  rawTemplate.value = ''
  extractedProps.value = []
  extractedMethods.value = []
}
const copy = (text) => {
  if (!text) return
  copyText(text)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.border-blue-2 {
  border: 1px solid #90caf9;
}
</style>
