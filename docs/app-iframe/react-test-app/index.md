---
layout: page
title: React 架构验证
sidebar: false
aside: false
---

<div style="position: fixed; top: var(--vp-nav-height); left: 0; right: 0; bottom: 0;">
  <iframe
    v-show="iframeReady"
    ref="iframeEl"
    :src="iframeSrc"
    style="width: 100%; height: 100%; border: none;"
    allow="fullscreen; clipboard-read; clipboard-write"
    @load="onIframeLoad"
  ></iframe>
</div>

<script setup>
import { ref, onMounted } from 'vue'

const iframeSrc = ref('')
const iframeReady = ref(false)
const iframeEl = ref(null)

function syncTheme() {
  const iframe = iframeEl.value
  if (iframe?.contentWindow) {
    const theme = localStorage.getItem('app-theme-mode') || 'dark'
    iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*')
  }
}

function onIframeLoad() {
  syncTheme()
  iframeReady.value = true
}

onMounted(() => {
  const isDev = import.meta.env.DEV
  iframeSrc.value = isDev
    ? 'http://localhost:23370/smart-code-tool/react-test-app/project/react-test-app/index.html'
    : '/smart-code-tool/react-test-app/index.html'

  // 页面重新可见时，重置状态让 iframe 重新同步主题后再显示
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && iframeEl.value) {
      iframeReady.value = false
      iframeEl.value.src = iframeEl.value.src
    }
  })
})
</script>
