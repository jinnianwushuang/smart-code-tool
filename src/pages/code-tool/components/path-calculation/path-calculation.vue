<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <a-card
      title="Vue 相对引用路径计算器"
      :bordered="false"
      style="max-width: 850px; margin: 0 auto"
    >
      <a-alert
        message="场景描述"
        description="计算在 文件A 中通过 import 引用 文件B 时所需的相对路径。"
        type="info"
        show-icon
        style="margin-bottom: 20px"
      />

      <a-form layout="vertical">
        <a-form-item label="当前文件 A (Source File)">
          <a-input v-model:value="pathA" placeholder="src/pages/dir1/a.vue" allow-clear />
        </a-form-item>

        <a-form-item label="目标文件 B (Target File)">
          <a-input v-model:value="pathB" placeholder="src/pages/dir2/b.vue" allow-clear />
        </a-form-item>

        <a-divider />

        <a-descriptions title="计算结果" bordered :column="1">
          <a-descriptions-item label="相对引用路径 (Relative Import)">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <code v-if="relativeImport" class="path-code">{{ relativeImport }}</code>
              <span v-else style="color: #999">请输入完整路径</span>
              <a-button
                type="primary"
                size="small"
                :disabled="!relativeImport"
                @click="copy(relativeImport)"
              >
                复制引用
              </a-button>
            </div>
          </a-descriptions-item>

          <a-descriptions-item label="代码示例">
            <pre v-if="relativeImport" class="code-block">
import MyComponent from '{{ relativeImport }}'</pre
            >
          </a-descriptions-item>
        </a-descriptions>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import { copyText } from 'src/output/common/project-common.js'

// 默认值采用你提供的示例
const pathA = ref('src/pages/architecture-document/vue/component/core-principle/core-principle.vue')
const pathB = ref('src/pages/architecture-document/vue/component/rrr/rrr-princi121ple/cer.vue')

/**
 * 核心逻辑：计算相对路径
 * 由于浏览器环境没有 node:path，我们使用数组处理法
 */
const relativeImport = computed(() => {
  if (!pathA.value || !pathB.value) return ''

  const fromParts = pathA.value.split('/')
  const toParts = pathB.value.split('/')

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
})

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
