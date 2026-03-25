<template>
  <div>
    <MarkdownViewer :content="mdContent" />
  </div>
</template>

<script setup>
import mdContent from './md/core-principle.md?raw'
</script>

<style lang="scss" scoped></style>
