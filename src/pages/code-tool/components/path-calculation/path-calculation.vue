<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <a-card
      title="Vue 组件引用生成器"
      :bordered="false"
      class="q-mb-lg max-w-1250"
      style="max-width: 1250px; margin: 0 auto 20px auto"
    >
      <div class="q-gutter-md">
        <!-- 输入框 -->
        <a-input
          v-model:value="fullPath"
          placeholder="粘贴 Vue 文件路径 (例如: src/pages/user/UserInfo.vue)"
          allow-clear
          @change="generateCode_2"
        />

        <!-- 操作按钮 -->
        <div style="margin-top: 16px; display: flex; gap: 10px">
          <a-button type="primary" @click="generateCode_2" :disabled="!fullPath">
            生成引用
          </a-button>
          <a-button v-if="generatedCode" @click="copyOutput"> 一键复制 </a-button>
        </div>

        <!-- 结果展示 -->
        <div v-if="generatedCode" style="margin-top: 24px">
          <p class="text-caption text-grey">生成结果：</p>
          <div class="result-box">
            <pre v-if="generatedCode" class="code-block q-ma-none">{{ generatedCode }}</pre>
          </div>
        </div>
      </div>
    </a-card>
    <a-card
      title="Vue 相对引用路径计算器"
      :bordered="false"
      style="max-width: 1250px; margin: 0 auto"
    >
      <a-form layout="vertical">
        <a-form-item label="文件 A">
          <a-input v-model:value="pathA" placeholder="src/pages/dir1/a.vue" allow-clear />
        </a-form-item>

        <a-form-item label="文件 B">
          <a-input v-model:value="pathB" placeholder="src/pages/dir2/b.vue" allow-clear />
        </a-form-item>

        <a-divider />
      </a-form>
      <!-- 计算结果: A 引入 B -->
      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item-label header class="text-weight-bold text-primary">计算结果: A 引入 B</q-item-label>

        <q-item>
          <q-item-section>
            <q-item-label caption>相对引用路径 (Relative Import)</q-item-label>
            <div class="row items-center justify-between q-gutter-sm q-mt-md">
              <code v-if="relativeImport_AB" class="path-code text-body2">{{
                relativeImport_AB
              }}</code>
              <span v-else class="text-grey-6">请输入完整路径</span>

              <q-btn
                color="primary"
                size="sm"
                label="复制引用"
                :disabled="!relativeImport_AB"
                @click="copy(relativeImport_AB)"
              />
            </div>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>代码示例</q-item-label>
            <div class="row items-start justify-between q-gutter-sm q-mt-md">
              <pre v-if="relativeImport_AB" class="code-block q-ma-none">{{
                generateCode(relativeImport_AB)
              }}</pre>
              <q-space />
              <q-btn
                color="primary"
                size="sm"
                label="复制引用"
                :disabled="!relativeImport_AB"
                @click="copy(generateCode(relativeImport_AB))"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 计算结果: B 引入 A -->
      <q-list bordered separator class="rounded-borders">
        <q-item-label header class="text-weight-bold text-primary">计算结果: B 引入 A</q-item-label>

        <q-item>
          <q-item-section>
            <q-item-label caption>相对引用路径 (Relative Import)</q-item-label>
            <div class="row items-center justify-between q-gutter-sm q-mt-md">
              <code v-if="relativeImport_BA" class="path-code text-body2">{{
                relativeImport_BA
              }}</code>
              <span v-else class="text-grey-6">请输入完整路径</span>

              <q-btn
                color="primary"
                size="sm"
                label="复制引用"
                :disabled="!relativeImport_BA"
                @click="copy(relativeImport_BA)"
              />
            </div>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>代码示例</q-item-label>
            <div class="row items-start justify-between q-gutter-sm q-mt-md">
              <pre v-if="relativeImport_BA" class="code-block q-ma-none">{{
                generateCode(relativeImport_BA)
              }}</pre>
              <q-space />
              <q-btn
                color="primary"
                size="sm"
                label="复制引用"
                :disabled="!relativeImport_BA"
                @click="copy(generateCode(relativeImport_BA))"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { pascalCase } from 'change-case'
import { copyText, lodash } from 'src/output/common/project-common.js'

// 默认值采用你提供的示例
const pathA = ref('src/pages/architecture-document/vue/component/core-principle/core-principle.vue')
const pathB = ref('src/pages/architecture-document/vue/component/rrr/rrr-princi121ple/cer.vue')
const fullPath = ref('')
const generatedCode = ref('')

/**
 * 核心逻辑：计算相对路径
 * 由于浏览器环境没有 node:path，我们使用数组处理
 */
const relativeImport_AB = computed(() => {
  if (!pathA.value || !pathB.value) return ''
  return compute_relative_path(pathA.value, pathB.value)
})
const relativeImport_BA = computed(() => {
  if (!pathA.value || !pathB.value) return ''
  return compute_relative_path(pathB.value, pathA.value)
})

const compute_relative_path = (fromPath, toPath) => {
  const fromParts = fromPath.split('/')
  const toParts = toPath.split('/')

  // 移除文件名，只保留目录部分进行计算
  fromParts.pop()

  let i = 0
  // 找出公共前缀路径
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++
  }

  // 需要向上跳的层级 (..的数量)
  const upLevels = fromParts.length - i
  const upPath = upLevels > 0 ? '../'.repeat(upLevels) : './'

  // 目标文件相对于公共目录的剩余路径
  const downPath = toParts.slice(i).join('/')

  const result = upPath + downPath

  // 规范化：确保如果是同级目录，结果以 ./ 开头
  return result.startsWith('.') ? result : './' + result
}
const generateCode_2 = () => {
  generatedCode.value = generateCode(fullPath.value)
  copyOutput()
}
const generateCode = (file_path) => {
  console.error(file_path)
  if (!file_path) {
    return ''
  }
  let sub = file_path.substring(file_path.lastIndexOf('.'))
  file_path = lodash.trimStart(file_path, './ ').replace(/\.\w+$/, '')
  // 1. 提取文件名。例如: '.../reference-code.vue' -> 'reference-code'
  const pathParts = file_path.split('/')
  let fileName = ''
  if (file_path.endsWith('index')) {
    fileName = pathParts[pathParts.length - 2]
  } else {
    fileName = pathParts[pathParts.length - 1]
  }

  // 2. 转换为 PascalCase。例如: 'reference-code' -> 'ReferenceCode'
  const componentName = pascalCase(fileName)

  // 3. 拼接 import 语句 (保留原始路径)
  // 如果路径不是以 src 或 @ 开头，可以根据项目规范在此处补全别名
  const path = file_path.trim()

  return `import ${componentName} from "${path}${sub}"`
}
const copyOutput = () => {
  copyText(generatedCode.value)
}
const copy = async (text) => {
  copyText(text)
}
</script>

<style scoped>
.path-code {
  background: #fffbe6;
  padding: 4px 8px;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #d46b08;
  font-weight: bold;
  font-family: 'Cascadia Code', Consolas, monospace;
}

.code-block {
  background: #2d2d2d;
  color: #ccc;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-size: 13px;
}
</style>
