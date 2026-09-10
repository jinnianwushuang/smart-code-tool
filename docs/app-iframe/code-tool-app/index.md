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
const iframeRef = ref(null)

// 向 iframe 推送当前主题，解决页面缓存后主题不同步的问题
function syncThemeToIframe() {
  const iframe = document.querySelector('iframe')
  if (iframe?.contentWindow) {
    const theme = localStorage.getItem('app-theme-mode') || 'dark'
    iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*')
  }
}

onMounted(() => {
  const isDev = import.meta.env.DEV
  toolSrc.value = isDev
    ? 'http://localhost:23330/smart-code-tool/code-tool-app/index-code-tool.html'
    : '/smart-code-tool/code-tool-app/index-code-tool.html'

  // 页面可见时同步主题（处理 VitePress 页面缓存场景）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncThemeToIframe()
  })
})
</script>
