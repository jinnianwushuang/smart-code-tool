<template>
  <a-layout style="height: 100vh">
    <LayoutHeader />
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
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
        <a-layout-content ref="scrollContainer" class="layout-content" @scroll="handle_scroll">
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
// import { sideMenuList } from './config/config.js'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'

import { useGlobalState } from 'src/output/common/composable-common.js'
import { menu_vue_test } from 'src/router/routes/module/vue-test.js'
const sideMenuList = menu_vue_test[0].children
const selectedKeys2 = ref([])
const openKeys = ref([])

const title_arr = ref([])

const show_back_top = ref(false)
const scroll_container_ref = useTemplateRef('scrollContainer')

const { router, route } = useGlobalState()

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

onMounted(() => {
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

const handle_click_menu = ({ key, keyPath }) => {
  router.push({ name: key })
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

:deep(.ant-layout-sider),
:deep(.ant-menu) {
  transition:
    background 0.3s,
    border 0.3s;
}
</style>
