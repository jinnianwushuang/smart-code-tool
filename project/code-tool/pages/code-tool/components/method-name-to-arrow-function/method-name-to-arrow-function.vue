<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="bolt" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">JS 函数转箭头函数</div>
        <q-space />
        <q-checkbox v-model="addExport" label="添加 export" keep-color color="white" dark />
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <!-- 输入区 -->
          <div class="col-12">
            <q-input
              v-model="inputCode"
              type="textarea"
              filled
              label="原始函数 (例如: get_name(str){ )"
              rows="12"
              placeholder="get_name(a, b) { ..."
              class="font-mono"
              @update:model-value="transformCode"
            />
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-btn label="开始转换" color="indigo" icon="play_arrow" @click="transformCode" />
          <q-btn label="重置" color="grey-7" icon="refresh" @click="reset" />
          <q-space />
          <q-btn
            label="复制结果"
            color="secondary"
            icon="content_copy"
            @click="copyOutput"
            :disable="!outputCode"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="outputCode"
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const inputCode = ref('')
const outputCode = ref('')
const addExport = ref(true)
const transformCode = () => {
  if (!inputCode.value.trim()) {
    $q.notify({ message: '请输入代码', color: 'warning' })
    return
  }
  let input_str = inputCode.value.trim()
  input_str = input_str.replace(/function /g, ' ')
  input_str = input_str.replace(/export /g, ' ')
  let has_async = input_str.includes('async ')
  if (has_async) {
    input_str = input_str.replace(/async /g, ' ')
  }
  // 正则逻辑说明：
  // ^\s* 匹配行首空格
  // ([a-zA-Z_$][\w$]*) 捕获组1：函数名
  // \s*\((.*?)\) 捕获组2：括号内的参数（支持0到多个）
  // \s*\{ 匹配起始花括号
  const regex = /([a-zA-Z_$][\w$]*)\s*\((.*?)\)\s*\{/g
  const prefix = addExport.value ? 'export const ' : 'const '
  // 执行替换
  const result = input_str.replace(regex, (match, funcName, params) => {
    return `${prefix}${funcName} =  ${has_async ? 'async ' : ''}(${params}) => {`
  })
  outputCode.value = result
  if (result === inputCode.value.trim()) {
    $q.notify({ message: '未匹配到可转换的函数格式', color: 'orange' })
  }
  copyOutput()
}
const copyOutput = () => {
  copyText(outputCode.value)
}
const reset = () => {
  inputCode.value = ''
  outputCode.value = ''
}
async function get_name(str) {
  return str
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
    box-shadow 0.3s;
}

.max-w-1200 {
  max-width: 1200px;
}

.font-mono :deep(textarea) {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style>
