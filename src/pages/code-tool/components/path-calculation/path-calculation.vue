<template>
  <div class="q-pa-md generator-wrapper">
    <!-- 1. 引用生成器 -->
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base q-mb-lg">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="link" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue 组件引用生成器</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 输入框 -->
        <q-input
          v-model="fullPath"
          filled
          placeholder="粘贴 Vue 文件路径 (例如: src/pages/user/UserInfo.vue)"
          clearable
          @update:model-value="generateCode_2"
        />

        <!-- 操作按钮 -->
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            color="indigo"
            outline
            label="生成引用"
            size="sm"
            @click="generateCode_2"
            :disabled="!fullPath"
          />
          <q-space />
          <q-btn
            v-if="generatedCode"
            color="secondary"
            icon="content_copy"
            label="一键复制"
            size="sm"
            @click="copyOutput"
          />
        </div>

        <!-- 结果展示 -->
        <div v-if="generatedCode">
          <div class="text-caption text-grey q-mb-xs">生成结果：</div>
          <pre class="code-block font-mono">{{ generatedCode }}</pre>
        </div>
      </q-card-section>
    </q-card>

    <!-- 2. 相对路径计算器 -->
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="route" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue 相对引用路径计算器</div>
      </q-card-section>

      <q-card-section>
        <a-form layout="vertical">
          <a-form-item label="文件 A">
            <a-input v-model:value="pathA" placeholder="src/pages/dir1/a.vue" allow-clear />
          </a-form-item>

          <a-form-item label="文件 B">
            <a-input v-model:value="pathB" placeholder="src/pages/dir2/b.vue" allow-clear />
          </a-form-item>
        </a-form>
      </q-card-section>

      <!-- 计算结果: A 引入 B -->
      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item-label header class="text-weight-bold text-primary">计算结果: A 引入 B</q-item-label>

        <q-item>
          <q-item-section>
            <q-item-label caption>相对引用路径 (Relative Import)</q-item-label>
            <div class="row items-center justify-between q-gutter-sm q-mt-md">
              <code v-if="relativeImport_AB" class="path-code text-body2 font-mono">{{
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
            <div class="column q-gutter-y-sm q-mt-md">
              <pre v-if="relativeImport_AB" class="code-block font-mono">{{
                generateCode(relativeImport_AB)
              }}</pre>
              <div class="row justify-end">
                <q-btn
                  color="primary"
                  size="sm"
                  label="复制引用"
                  :disabled="!relativeImport_AB"
                  @click="copy(generateCode(relativeImport_AB))"
                />
              </div>
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
              <code v-if="relativeImport_BA" class="path-code text-body2 font-mono">{{
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
            <div class="column q-gutter-y-sm q-mt-md">
              <pre v-if="relativeImport_BA" class="code-block font-mono">{{
                generateCode(relativeImport_BA)
              }}</pre>
              <div class="row justify-end">
                <q-btn
                  color="primary"
                  size="sm"
                  label="复制引用"
                  :disabled="!relativeImport_BA"
                  @click="copy(generateCode(relativeImport_BA))"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
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

.path-code {
  background: rgba(255, 251, 230, 0.1);
  padding: 4px 8px;
  border: 1px solid rgba(255, 229, 143, 0.5);
  border-radius: 4px;
  color: var(--q-primary);
  font-weight: 600;
}

.code-block {
  background: rgba(128, 128, 128, 0.05);
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-size: 12px;
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.font-mono {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
}
</style>
