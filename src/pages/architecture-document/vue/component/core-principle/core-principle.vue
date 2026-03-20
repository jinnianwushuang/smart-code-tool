<template>
  <div>
    <!-- <MarkdownEditor v-model:modelValue="markdown" :tocVisible="true" /> -->
    <MarkdownViewer :content="mdContent" />
  </div>
</template>

<script setup>
import mdContent from './md/core-principle.md?raw'

// // const markdown = ref('# 核心原则')

// import { ref, onMounted } from 'vue'

// const mdContent = ref('')

// onMounted(async () => {
//   // 示例：从 public 目录或 API 获取本地 md 文件
//   const res = await fetch('./md/core-principle.md')
//   //   mdContent.value = await res.text()
//   mdContent.value = markdown
// })
</script>

<style lang="scss" scoped></style>
