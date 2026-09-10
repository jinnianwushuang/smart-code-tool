<template>
  <a-layout style="height: 100vh">
    <!-- 顶部导航栏（iframe 嵌入时隐藏） -->
    <a-layout-header v-if="!isInIframe" class="header">
      <q-toolbar>
        <div class="logo" style="width: 80px">
          <img src="logo/icons8-light-on-96.png" alt="logo" width="40px" height="40px" />
        </div>
        <span class="header-title">VUE 架构验证</span>
        <q-space />
        <q-btn
          flat
          round
          dense
          :icon="isDarkTheme ? 'nightlight_round' : 'light_mode'"
          @click="hanle_toogle"
        >
          <q-tooltip>{{ isDarkTheme ? '切换至日间模式' : '切换至夜间模式' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" :style="{ background: isDarkTheme ? undefined : '#fff' }">
        <a-menu
          v-model:selectedKeys="selectedKeys2"
          v-model:openKeys="openKeys"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          :items="sideMenuList"
          @click="handle_click_menu"
        >
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="item in title_arr" :key="item">{{ item }}</a-breadcrumb-item>
        </a-breadcrumb>
        <a-layout-content
          ref="scrollContainer"
          class="layout-content"
          :class="{ dark: isDarkTheme }"
          @scroll="handle_scroll"
        >
          <router-view></router-view>

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
  </a-layout>
</template>
<script setup>
import { ref, onMounted, watch, useTemplateRef } from 'vue'
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue'
import { isDarkTheme } from 'src/output/common/project-common.js'
import { useGlobalState } from 'src/output/common/composable-common.js'
import { menu_vue_test } from '../router/routes/vue-test-routes.js'

const sideMenuList = menu_vue_test[0].children
const selectedKeys2 = ref([])
const openKeys = ref([])

const title_arr = ref([])

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')

const { router, route } = useGlobalState()

const hanle_toogle = () => {
  isDarkTheme.value = !isDarkTheme.value
}

watch(route, () => {
  check_route()
})

const handle_scroll = (e) => {
  show_back_top.value = e.target.scrollTop > 300
}

const scroll_to_top = () => {
  // 获取原生 DOM 元素进行滚动
  const el = scroll_container_ref.value?.$el || scroll_container_ref.value
  el?.scrollTo({ top: 0, behavior: 'smooth' })
}

const isInIframe = ref(false)

onMounted(() => {
  isInIframe.value = window.self !== window.top
  check_route()
})

const check_route = () => {
  // console.log('src/layout/layout-vue-page/layout-vue-page.vue ,       check_route    ', route)
  // console.log('src/layout/layout-vue-page/layout-vue-page.vue ,    selectedKeys2 ', selectedKeys2)
  // console.log('src/layout/layout-vue-page/layout-vue-page.vue ,    openKeys ', openKeys)
  let t_arr = []

  let matched = route.matched
  let matched_len = matched.length
  for (let i = 0; i < matched_len; i++) {
    let item = matched[i]
    t_arr.push(item.meta.title)
  }
  openKeys.value = [matched[matched_len - 2].name]
  selectedKeys2.value = [matched[matched_len - 1].name]
  title_arr.value = t_arr.filter((item) => item)
}

const handle_click_menu = ({ key }) => {
  router.push({ name: key })
}
</script>
<style lang="scss" scoped>
.header {
  height: 64px;
  line-height: 64px;
  background: var(--q-header-bg) !important;
  border-bottom: 1px solid var(--q-header-border-color);
  padding: 0 16px;
  transition: all 0.3s ease;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--q-header-text-color) !important;
}

.layout-content {
  padding: 24px;
  margin: 0;
  min-height: 680px;
  height: calc(100vh - var(--header-height, 64px));
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

:deep(.ant-layout-sider),
:deep(.ant-menu) {
  transition:
    background 0.3s,
    border 0.3s;
}

body.body--light .header {
  --q-header-bg: #ffffff;
  --q-header-text-color: rgba(0, 0, 0, 0.85);
  --q-header-border-color: rgba(0, 0, 0, 0.1);
}

body.body--dark .header {
  --q-header-bg: #141414;
  --q-header-text-color: rgba(255, 255, 255, 0.85);
  --q-header-border-color: rgba(255, 255, 255, 0.1);
}
</style>
