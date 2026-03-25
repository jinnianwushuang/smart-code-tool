<template>
  <div class="code-gen-container">
    <a-card title="Vue 组件引用生成器" :bordered="false">
      <div class="q-gutter-md">
        <!-- 输入框 -->
        <a-input
          v-model:value="fullPath"
          placeholder="粘贴 Vue 文件路径 (例如: src/pages/user/UserInfo.vue)"
          allow-clear
          @change="generateCode"
        />

        <!-- 操作按钮 -->
        <div style="margin-top: 16px; display: flex; gap: 10px">
          <a-button type="primary" @click="generateCode" :disabled="!fullPath"> 生成引用 </a-button>
          <a-button v-if="generatedCode" @click="copyOutput"> 一键复制 </a-button>
        </div>

        <!-- 结果展示 -->
        <div v-if="generatedCode" style="margin-top: 24px">
          <p class="text-caption text-grey">生成结果：</p>
          <div class="result-box">
            <code>{{ generatedCode }}</code>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { pascalCase } from 'change-case'
import { message } from 'ant-design-vue'
import { copyText } from 'src/output/common/project-common.js'

const fullPath = ref('')
const generatedCode = ref('')

/**
 * 核心生成逻辑
 */
const generateCode = () => {
  if (!fullPath.value) return

  // 1. 提取文件名。例如: '.../reference-code.vue' -> 'reference-code'
  const pathParts = fullPath.value.split('/')
  const fileNameWithExt = pathParts.pop()
  const fileName = fileNameWithExt.replace(/\.\w+$/, '')

  // 2. 转换为 PascalCase。例如: 'reference-code' -> 'ReferenceCode'
  const componentName = pascalCase(fileName)

  // 3. 拼接 import 语句 (保留原始路径)
  // 如果路径不是以 src 或 @ 开头，可以根据项目规范在此处补全别名
  const path = fullPath.value.trim()

  generatedCode.value = `import ${componentName} from '${path}'`
  copyOutput()
}

const copyOutput = () => {
  copyText(generatedCode.value)
}
</script>

<style scoped>
.code-gen-container {
  max-width: 800px;
  margin: 20px auto;
}

.result-box {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
  font-family: 'Fira Code', monospace;
  word-break: break-all;
  color: #c41d7f; /* AntD 主题常用强调色 */
}

.text-caption {
  font-size: 12px;
  margin-bottom: 4px;
}
</style>
