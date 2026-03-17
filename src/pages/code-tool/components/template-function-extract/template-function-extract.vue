<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 900px">
      <q-card-section class="bg-deep-orange-7 text-white row items-center">
        <q-icon name="ads_click" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue 事件函数提取器 (@Event)</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 正则提示与复制 -->
        <div class="row items-center bg-orange-1 q-pa-sm rounded-borders border-orange-2">
          <div class="text-caption text-orange-9">
            通用匹配正则: <code class="bg-white q-px-xs">@[\w.-]+="([^"(]+)"</code>
          </div>
          <q-space />
          <q-btn
            flat
            dense
            color="orange-9"
            icon="content_copy"
            label="复制正则"
            size="sm"
            @click="copy(regPattern)"
          >
            <q-tooltip>用于 IDE 全局搜索提取</q-tooltip>
          </q-btn>
        </div>

        <!-- 代码输入区 -->
        <q-input
          v-model="rawTemplate"
          type="textarea"
          filled
          label="粘贴带有 @ 绑定的 Vue Template 代码"
          placeholder='例如: <q-btn @click="saveData" @on-close="handleClose" />'
          rows="10"
          @update:model-value="extractFunctions"
        />
        <div class="row q-my-md q-gutter-x-sm">
          <q-btn label="清空" color="grey" variant="flat" @click="reset" />
        </div>
        <!-- 控制与统计 -->
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="addComma" label="每行末尾增加逗号" color="deep-orange" />
          <q-separator vertical inset />
          <div class="text-subtitle2 text-grey-8">
            识别到唯一函数: <q-badge color="deep-orange">{{ functionList.length }}</q-badge>
          </div>
        </div>

        <!-- 结果输出区 -->
        <q-input
          v-model="formattedResult"
          type="textarea"
          filled
          readonly
          label="提取出的函数名称列表"
          bg-color="white"
          rows="8"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="content_copy"
              color="primary"
              @click="copy(formattedResult)"
              :disable="!formattedResult"
            >
              <q-tooltip>一键复制全部</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const rawTemplate = ref('')
const addComma = ref(true)
const functionList = ref([])
const regPattern = ref('@[\\w.-]+="([^"(]+)"')

const extractFunctions = () => {
  if (!rawTemplate.value) {
    functionList.value = []
    return
  }

  // 正则逻辑：
  // @[\w.-]+= 匹配 @click, @update:model-value 等
  // "([^"(]+)  匹配引号内的内容，直到遇到左括号(（排除参数）或结束引号"
  const eventRegex = /@[\w.-]+="([^"(]+)(?:\(.*?\))?"/g

  const funcSet = new Set()
  let match

  while ((match = eventRegex.exec(rawTemplate.value)) !== null) {
    const funcName = match[1].trim()
    // 排除简单的内联表达式（如 @click="show = true"）
    if (funcName && !funcName.includes('=') && !funcName.includes('=>')) {
      funcSet.add(funcName)
    }
  }

  functionList.value = Array.from(funcSet)
}

// 格式化输出字符串
const formattedResult = computed(() => {
  if (functionList.value.length === 0) return ''
  return functionList.value.map((name) => `${name}${addComma.value ? ',' : ''}`).join('\n')
})

const reset = () => {
  rawTemplate.value = ''
  functionList.value = []
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
.border-orange-2 {
  border: 1px solid #ffcc80;
}
code {
  font-family: monospace;
  font-weight: bold;
}
</style>
