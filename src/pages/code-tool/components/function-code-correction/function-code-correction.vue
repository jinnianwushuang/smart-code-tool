<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mx-auto shadow-2 max-w-1200">
      <q-card-section class="bg-indigo-7 text-white">
        <div class="text-h6">函数代码重构助手</div>
        <div class="text-caption">规则：自动注入 payload 参数并提取 .value 变量</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <!-- 输入区 -->
          <div class="col-12">
            <q-input
              v-model="inputCode"
              type="textarea"
              filled
              label="原始函数代码"
              placeholder="export const myFunc = (id) => { ..."
              rows="20"
              @update:model-value="transformCode"
            />
          </div>
        </div>

        <div
          class="row justify-between items-center bg-grey-3 q-pa-sm rounded-borders q-gutter-x-md"
        >
          <q-btn label="解析识别" color="primary" @click="transformCode" :disable="!inputCode" />
          <q-btn
            label="复制重构代码"
            color="primary"
            icon="content_copy"
            @click="copyOutput"
            :disable="!outputCode"
          />
          <q-space />
          <q-checkbox
            v-model="addVariableDefinitions"
            label="顶部添加变量定义"
            keep-color
            left-label
          />
          <div class="text-subtitle2 text-grey-8">
            识别到的变量: <q-badge color="primary">{{ detectedVars.length }}</q-badge>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="outputCode" filled readonly type="textarea" label="生成结果" rows="20">
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
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const inputCode = ref(`
const test_fn_1 = (ww) => {
  console.log('test_fn_1')
  var_a.value = 123
  console.log(var_a.value)
  console.log(var_b.value)
  var_c.value = {
    name: 'test_fn_1',
    value: var_a.value,
  }
}
`)
const outputCode = ref('')
const detectedVars = ref([])
const addVariableDefinitions = ref(false)

const transformCode = () => {
  const code = inputCode.value.trim()
  if (!code) {
    outputCode.value = ''
    detectedVars.value = []
    return
  }

  let lines = code.split('\n')
  if (lines.length === 0) return

  // 1. 提取所有 x.value 中的 x (去重)
  const valueRegex = /([a-zA-Z_$][\w$]*)\.value/g
  const varSet = new Set()
  let match
  while ((match = valueRegex.exec(code)) !== null) {
    varSet.add(match[1])
  }
  const vars = Array.from(varSet)
  detectedVars.value = vars

  // 2. 处理第一行：注入 payload 参数
  // 匹配模式: (参数) => { 或 参数 => {
  let firstLine = lines[0]
  const hasVars = vars.length > 0

  if (hasVars) {
    if (firstLine.includes('(')) {
      // 已经有括号的情况，直接在参数列表前插入 payload, 例如: const fn = (a, b) => { ... 变成 const fn = (payload, a, b) => { ...

      // 寻找箭头函数参数部分的正则
      // 匹配类似 (a, b) => 或 ( ) => 或 a =>
      firstLine = firstLine.replace(/([^()]*)(\()([^()]*?)(\))(\s*=>)/, (m, p1, p2, p3, p4, p5) => {
        console.error('m----', m)
        console.error('p1----', p1)
        console.error('p2----', p2)
        console.error('p3----', p3)
        console.error('p4----', p4)
        console.error('p5----', p5)

        let params = p3.trim()
        // 如果原本没参数或者是空括号
        if (!params || params === '') {
          return `${p1}(payload)${p5}{`
        }
        // 如果已有参数，在最前面插入 payload
        return `${p1}(payload, ${params})${p5}{`
      })
    } else {
      // 没有括号的情况，直接在参数前插入 payload, 例如: const fn = a => { ... 变成 const fn = (payload, a) => { ...
      firstLine = firstLine.replace(/([^=]*=)\s*([a-zA-Z_$][\w$]*)\s*=>/, (m, p1, p2) => {
        console.error('m----', m)
        console.error('p1----', p1)
        console.error('p2----', p2)
        return `${p1} (payload, ${p2}) =>`
      })
    }
  }

  lines[0] = firstLine

  // 3. 生成解构行并插入第二行
  if (hasVars) {
    const destructureLine = `  const { ${vars.join(', ')} } = payload;`
    // 检查第二行是否已经是左大括号，如果是，在其后插入
    if (lines[0].includes('{')) {
      lines.splice(1, 0, destructureLine)
    }
  }

  // 4. 生成外部的 export const 定义 (放在最顶部展示)
  let definitions = vars.map((v) => `export const ${v} = ref("");`).join('\n')
  if (addVariableDefinitions.value) {
    definitions = `${definitions}\n\n`
  } else {
    definitions = ''
  }

  outputCode.value = definitions + lines.join('\n')
}

const copyOutput = () => {
  copyText(outputCode.value)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
</style>
