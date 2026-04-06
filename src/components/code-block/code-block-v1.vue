<template>
  <div class="code-block-wrapper">
    <div
      class="code-header"
      style="
        display: flex;
        justify-content: space-between;
        background: #222;
        padding: 4px 12px;
        color: #888;
        font-size: 12px;
      "
    >
      <span style="text-transform: uppercase">{{ lang }}</span>
      <button
        @click="handleCopy"
        style="cursor: pointer; background: none; border: none; color: inherit"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>

    <!-- 关键点：使用 v-pre 阻止 Vue 解析插槽内的内容 -->
    <!-- 原始代码存放在隐藏节点或通过 props 传入  shiki-content" github-dark-->
    <div ref="codeContainer" class="github-dark">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { copyText, lodash } from 'src/output/common/project-common.js'
const props = defineProps({
  lang: String,
  rawCode: String, // 接收编码后的原始代码用于复制
})

const copied = ref(false)

const handleCopy = async () => {
  // 解码并复制
  const text = decodeURIComponent(props.rawCode)

  copyText(text)

  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
