<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white">
        <div class="row items-center">
          <q-icon name="code" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Composable 代码生成器</div>
        </div>
        <div class="text-caption text-grey-3">根据目录路径自动生成标准模块引入及初始化代码</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 路径输入 -->
        <q-input
          v-model="pathInput"
          filled
          label="输入目录路径"
          placeholder="例如: src/pages/code-tool/componsable/"
          hint="末尾的斜杠会自动处理"
          @update:model-value="generateCode"
          clearable
        />

        <!-- 结果展示 -->
        <div class="column q-gutter-y-sm">
          <div class="row items-center q-gutter-x-md">
            <span class="text-subtitle2 text-weight-bold">生成的代码片段:</span>
            <q-space />
            <q-btn label="清空" color="grey-7" icon="delete" @click="reset" />
            <q-btn
              color="secondary"
              icon="content_copy"
              label="一键复制"
              @click="copyOutput"
              :disable="!generatedCode"
            />
          </div>

          <q-input
            v-model="generatedCode"
            type="textarea"
            filled
            readonly
            rows="12"
            class="font-mono"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import * as changeCase from 'change-case'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const pathInput = ref('src/pages/code-tool/componsable/')
const generatedCode = ref('')

const generateCode = () => {
  let path = pathInput.value.trim()
  if (!path) {
    generatedCode.value = ''
    return
  }

  // 1. 标准化路径：去掉末尾斜杠
  const cleanPath = path.replace(/\/+$/, '')

  // 2. 生成变量名前缀：将路径中的 / 替换为 _
  let prefix = cleanPath.replace(/\//g, '_')
  prefix = changeCase.snakeCase(prefix)

  // 3. 提取最后一段目录名作为相对路径参考 (./xxx/)
  const pathParts = cleanPath.split('/')
  const lastDir = pathParts[pathParts.length - 1]

  // 4. 构建代码模板
  const codeTemplate = [
    `import {${prefix}_index} from "./${lastDir}/index.js";`,
    `import {${prefix}_variable} from "./${lastDir}/variable.js";`,
    '',
    `const base_payload = ${prefix}_variable({});`,
    '',
    `const {} = ${prefix}_index({`,
    `    ...base_payload`,
    `});`,
  ].join('\n')

  generatedCode.value = codeTemplate
}

const copyOutput = () => {
  copyText(generatedCode.value)
}
const reset = () => {
  pathInput.value = ''
  generatedCode.value = ''
}

// 初始执行一次
generateCode()
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
