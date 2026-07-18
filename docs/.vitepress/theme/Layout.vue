<script setup>
import DefaultTheme from 'vitepress/theme'
import BackToTop from './components/BackToTop.vue'
import dayjs from 'dayjs'

const { Layout } = DefaultTheme

// 构建时间，由 vite define 注入
const buildTime = __APP_BUILD_TIME__
// const build_time = dayjs(buildTime).format('YYYY-MM-DD HH:mm:ss Z')
const build_date = dayjs(buildTime).format('YYYY-MM-DD')
const build_time = dayjs(buildTime).format('HH:mm:ss Z')
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <div class="build-info-wrapper">
        <span class="build-date-badge" :title="'构建日期: ' + build_date">
          📅 {{ build_date }}
        </span>
        <span class="build-time-badge" :title="'构建时间: ' + build_time">
          🕒 {{ build_time }}
        </span>
      </div>
    </template>
    <template #layout-bottom>
      <BackToTop />
    </template>
  </Layout>
</template>

<style scoped>
.build-info-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin-left: 8px;
}
.build-date-badge,
.build-time-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-family: monospace;
  letter-spacing: 0.3px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 1px 8px;
  white-space: nowrap;
  line-height: 1.4;
}
</style>
