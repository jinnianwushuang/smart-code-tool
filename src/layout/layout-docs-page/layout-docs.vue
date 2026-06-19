<template>
  <a-layout style="height: 100vh">
    <!-- 顶部导航栏 -->

    <LayoutHeader />

    <a-layout>
      <!-- 内容区 -->
      <a-layout-content ref="scrollContainer" class="layout-content dark" @scroll="handle_scroll">
        <iframe src="./docs/index.html" width="100%" height="calc(100vh - 65px)"></iframe>

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
import { ref, onMounted, useTemplateRef } from 'vue'
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue'
import { RouterView, useRouter } from 'vue-router'

import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'

const $q = useQuasar()

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')

const router = useRouter()

onMounted(() => {})

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
  padding: 24px;
  margin: 0;
  min-height: 680px;
  height: calc(100vh - 64px);

  overflow-y: auto;
  position: relative;
  transition: background-color 0.3s ease;
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
