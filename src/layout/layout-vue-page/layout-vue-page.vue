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
          <a-breadcrumb-item>VUE-TEST</a-breadcrumb-item>
          <a-breadcrumb-item>{{ menu_lv1?.label }}</a-breadcrumb-item>
          <a-breadcrumb-item v-if="menu_lv2">{{ menu_lv2?.label }}</a-breadcrumb-item>
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
import { sideMenuList } from './config/config.js'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'

import { useGlobalState } from 'src/output/common/composable-common.js'
const selectedKeys2 = ref([])
const openKeys = ref([])
const menu_lv1 = ref('')
const menu_lv2 = ref('')

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
  console.log('route------------layout-vue-page---2----', route)

  let len = route.matched.length
  if (len > 3) {
    let lv1_name = route.matched[len - 2]?.name
    let lv2_name = route.matched[len - 1]?.name
    selectedKeys2.value = [lv2_name]

    openKeys.value = [lv1_name]
    menu_lv2.value = { key: lv2_name, label: lv2_name }
    menu_lv1.value = { key: lv1_name, label: lv1_name }
  } else {
    let lv1_name = route.matched[len - 1]?.name

    menu_lv1.value = { key: lv1_name, label: lv1_name }
    menu_lv2.value = null
  }
}

const handle_click_menu = ({ key, keyPath }) => {
  console.log('handle_click_menu--layout-vue-page--', selectedKeys2.value)

  for (let i = 0; i < sideMenuList.length; i++) {
    if (sideMenuList[i].children) {
      for (let j = 0; j < sideMenuList[i].children.length; j++) {
        let item = sideMenuList[i].children[j]
        if (item.key === key) {
          menu_lv1.value = sideMenuList[i]
          menu_lv2.value = item
          break
        }
      }
    } else {
      if (sideMenuList[i].key === key) {
        menu_lv1.value = sideMenuList[i]
        menu_lv2.value = null
        break
      }
    }
  }

  router.push({ name: key })
}
</script>
<style scoped>
#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
.layout-content {
  background: #fff;
  padding: 24px;
  margin: 0;
  min-height: 680px;
  height: calc(100vh - 64px);

  overflow-y: auto;
}
</style>
