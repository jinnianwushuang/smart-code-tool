---
layout: page
title: 工具库
sidebar: false
aside: false
---

<div style="position: fixed; top: var(--vp-nav-height); left: 0; right: 0; bottom: 0;">
  <iframe
    :src="toolSrc"
    style="width: 100%; height: 100%; border: none;"
    allow="fullscreen; clipboard-read; clipboard-write"
  ></iframe>
</div>

<script setup>
import { ref, onMounted } from 'vue'

const toolSrc = ref('')

onMounted(() => {
  // 开发环境指向 Vue 开发服务器，生产环境使用相对路径（同域部署）
  const isDev = import.meta.env.DEV
  toolSrc.value = isDev
    ? 'http://localhost:23330/smart-code-tool/code-tool-app/index-code-tool.html'
    : '/smart-code-tool/code-tool-app/index-code-tool.html'
})
</script>
