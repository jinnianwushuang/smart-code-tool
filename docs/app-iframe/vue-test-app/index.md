---
layout: page
title: VUE 架构验证
sidebar: false
aside: false
---

<div style="position: fixed; top: var(--vp-nav-height); left: 0; right: 0; bottom: 0;">
  <iframe
    :src="iframeSrc"
    style="width: 100%; height: 100%; border: none;"
    allow="fullscreen; clipboard-read; clipboard-write"
  ></iframe>
</div>

<script setup>
import { ref, onMounted } from 'vue'

const iframeSrc = ref('')

onMounted(() => {
  const isDev = import.meta.env.DEV
  // 开发环境指向 vue-test 独立开发服务器，生产环境使用相对路径（同域部署）
  iframeSrc.value = isDev
    ? 'http://localhost:23350/smart-code-tool/vue-test-app/index-vue-test.html'
    : '/smart-code-tool/vue-test-app/index-vue-test.html'
})
</script>
