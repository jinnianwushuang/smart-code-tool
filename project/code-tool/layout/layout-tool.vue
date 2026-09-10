<template>
  <a-layout style="height: 100vh">
    <!-- 顶部导航栏：非 iframe 环境才显示 -->
    <LayoutHeader v-if="!isInIframe" />

    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        width="200"
        :theme="isDarkTheme ? 'dark' : 'light'"
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
      <a-layout-content
        ref="scrollContainer"
        class="layout-content"
        :class="{ dark: isDarkTheme }"
        :style="{ height: isInIframe ? '100vh' : 'calc(100vh - 64px)' }"
        @scroll="handle_scroll"
      >
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
import { ref, onMounted, useTemplateRef, computed } from 'vue'
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue'
import { RouterView, useRouter } from 'vue-router'
// import { menuList } from './config/config.js'
import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
import LayoutHeader from 'project/layout/layout-header.vue'
import { isDarkTheme } from 'src/output/common/project-common.js'
import { menu_routes_tool } from '../router/routes/module/tool.js'
const menuList = menu_routes_tool[0].children
const $q = useQuasar()
const collapsed = ref(false)

// 检测是否在 iframe 内嵌环境（被 VitePress 页面嵌入时隐藏头部导航）
const isInIframe = computed(() => {
  try {
    return window.self !== window.top
  } catch {
    return true // 跨域访问 window.top 会抛异常，说明在 iframe 中
  }
})

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')

// const selectedKeys = useStorage('src_layout_layout1', menuList[0])
const STORAGE_KEY = 'tool_last_route'
const router = useRouter()
const selectedKeys = ref([menuList[0].key])

// 从 localStorage 恢复上次的路由，不匹配则使用当前路由或默认路由
onMounted(() => {
  const validNames = new Set(menuList.map((m) => m.key))
  const stored = localStorage.getItem(STORAGE_KEY)
  const currentName = router.currentRoute.value.name

  // 优先级: 存储的路由 > 当前路由(刷新时URL保留) > 默认第一个
  let targetName = menuList[0].key
  if (stored && validNames.has(stored)) {
    targetName = stored
  } else if (currentName && validNames.has(currentName)) {
    targetName = currentName
  }

  selectedKeys.value = [targetName]
  if (currentName !== targetName) {
    router.push({ name: targetName })
  }
})

const handle_click_menu = ({ key }) => {
  localStorage.setItem(STORAGE_KEY, key)
  selectedKeys.value = [key]
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
  /* height 通过 inline style 动态设置 */

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
