<template>
  <a-layout style="height: 100vh">
    <!-- 顶部导航栏 -->

    <LayoutHeader />

    <a-layout>
      <!-- 内容区 -->
      <a-layout-content ref="scrollContainer" class="layout-content dark" @scroll="handle_scroll">
        <iframe ref="docsIframe" src="./docs/index.html" class="iframe-container"></iframe>

        <!-- 滚动到顶部按钮 -->
        <transition name="fade">
          <div v-if="show_back_top" class="back-to-top" @click="scroll_to_top">
            <a-button type="primary" shape="circle" size="large" shadow>
              <template #icon><vertical-align-top-outlined /></template>
            </a-button>
          </div>
        </transition>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref, onMounted, useTemplateRef, watch } from 'vue'
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue'
import { RouterView, useRouter } from 'vue-router'

import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'
import { isDarkTheme } from 'src/output/common/project-common.js'

const $q = useQuasar()

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')
const iframe_ref = useTemplateRef('docsIframe')

const router = useRouter()

onMounted(() => {
  // iframe 加载完成后发送初始主题
  const iframe = document.querySelector('iframe[src*="docs"]')
  if (iframe) {
    iframe.addEventListener('load', () => {
      syncThemeToIframe()
    })
  }
})

// 监听主题变化，同步到 iframe
watch(isDarkTheme, () => {
  syncThemeToIframe()
})

// 同步主题到 iframe
const syncThemeToIframe = () => {
  const iframe = iframe_ref.value
  const currentTheme = isDarkTheme.value ? 'dark' : 'light'

  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'theme-change', theme: currentTheme }, '*')
    console.log('[Docs Layout] 主题已同步到 iframe:', currentTheme)
  } else {
    console.warn('[Docs Layout] iframe 未就绪')
  }
}

const handle_scroll = (e) => {
  show_back_top.value = e.target.scrollTop > 300
}

const scroll_to_top = () => {
  // 获取原生 DOM 元素进行平滑滚动
  const el = scroll_container_ref.value?.$el || scroll_container_ref.value
  el?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<style lang="scss" scoped>
.layout-content {
  margin: 0;
  min-height: 680px;
  height: calc(100vh - 66px);

  overflow-y: auto;
  position: relative;
  transition: background-color 0.3s ease;
  .iframe-container {
    border: none;
    width: 100%;
    height: 100%;
  }
}

.back-to-top {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 1000;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 4px 12px var(--q-dark-page, rgba(0, 0, 0, 0.15));
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
}

/* 渐变动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
