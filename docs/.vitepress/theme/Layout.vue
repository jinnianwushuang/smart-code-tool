<script setup>
import DefaultTheme from 'vitepress/theme'
import BackToTop from './components/BackToTop.vue'

const { Layout } = DefaultTheme

// 构建时间，由 vite define 注入
const buildTime = __APP_BUILD_TIME__
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <span class="build-time-badge" :title="'构建时间: ' + buildTime">
        🕒 {{ buildTime }}
      </span>
    </template>
    <template #layout-bottom>
      <BackToTop />
    </template>
  </Layout>
</template>

<style scoped>
.build-time-badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-family: monospace;
  letter-spacing: 0.3px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 3px 10px;
  white-space: nowrap;
  line-height: 1.4;
  margin-left: 8px;
}
</style>
