<template>
  <a-layout style="height: 100vh">
    <!-- 顶部导航栏 -->

    <LayoutHeader />

    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        width="200"
        theme="light"
        breakpoint="lg"
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          :items="menuList"
          @click="handle_click_menu"
        >
        </a-menu>
      </a-layout-sider>

      <!-- 内容区 -->
      <a-layout-content ref="scrollContainer" class="layout-content dark" @scroll="handle_scroll">
        <router-view />

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
import { menuList } from './config/config.js'
import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'
const $q = useQuasar()
const collapsed = ref(false)

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')

// const selectedKeys = useStorage('src_layout_layout1', menuList[0])
const router = useRouter()
const selectedKeys = ref([[menuList[0].key]])
onMounted(() => {
  selectedKeys.value = [menuList[0].key]
  handle_click_menu({ key: menuList[0].key })
})
const handle_click_menu = ({ key }) => {
  console.log('handle_click_menu---layout-tool-', key)
  console.log('handle_click_menu---layout-tool-selectedKeys--', selectedKeys)
  router.push({ name: key })
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
