<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="list_alt" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bold">JavaScript 变量提取器</div>
          <div class="text-caption text-grey-3">输入 JS 代码，自动提取 const 定义的变量名</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 输入框 -->
        <q-input
          v-model="rawCode"
          type="textarea"
          filled
          label="粘贴代码到这里"
          placeholder='例如: export const myVar = ref("")'
          rows="12"
          clearable
          class="font-mono"
          @update:model-value="extractVariables"
        />

        <!-- 操作按钮 -->
        <div class="row items-center q-gutter-x-sm">
          <q-btn label="提取变量" color="indigo" icon="analytics" @click="extractVariables" />
          <q-btn label="清空" color="grey-7" icon="delete" @click="clear" />
          <q-space />
          <q-btn
            label="复制结果"
            color="secondary"
            icon="content_copy"
            @click="copyOutput"
            :disable="!result.length"
          />
        </div>

        <!-- 结果展示 -->
        <div v-if="result.length > 0" class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">提取结果 ({{ result.length }}):</div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="outputText"
          filled
          readonly
          type="textarea"
          label="生成结果"
          rows="12"
          class="font-mono"
        >
          <template v-slot:append>
            <q-btn flat icon="content_copy" @click="copyOutput" padding="xs" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const rawCode = ref('')
const result = ref([])

const outputText = computed(() => {
  return result.value.join(',\n')
})
const extractVariables = () => {
  if (!rawCode.value.trim()) {
    $q.notify({ message: '请输入代码内容', color: 'warning' })
    return
  }

  // 正则解析逻辑：
  // 1. (?:export\s+)? 匹配可选的 export
  // 2. const\s+ 匹配必须的 const
  // 3. ([a-zA-Z_$][\w$]*) 捕获组：匹配合法的 JS 变量名
  // 4. \s*[:=] 匹配变量名后的冒号（TS）或等号
  const regex = /(?:export\s+)?const\s+([a-zA-Z_$][\w$]*)\s*[:=]/g

  let matches = []
  let match

  // 循环匹配所有项
  while ((match = regex.exec(rawCode.value)) !== null) {
    matches.push(match[1])
  }
  matches = [...new Set(matches)] // 去重
  if (matches.length > 0) {
    result.value = matches
    $q.notify({ message: `成功提取 ${matches.length} 个变量`, color: 'positive' })
  } else {
    result.value = []
    $q.notify({ message: '未发现匹配的变量定义', color: 'negative' })
  }
  copyOutput()
}

const clear = () => {
  rawCode.value = ''
  result.value = []
}
const copyOutput = () => {
  copyText(outputText.value)
}
</script>

<style scoped></style>
