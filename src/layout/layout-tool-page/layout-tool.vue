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
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" @click="handle_click_menu">
          <a-menu-item v-for="menuItem in menuList" :key="menuItem.key">
            <template #icon>
              <!-- 这里假设 menuItem.icon 是 Antdv 的图标组件名，或者你可以动态渲染组件 -->
              <component :is="menuItem.icon" />
            </template>
            <span>{{ menuItem.label }}</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { menuList } from './config/config.js'
import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
import LayoutHeader from 'src/layout/compoent/layout-header/layout-header.vue'
const $q = useQuasar()
const collapsed = ref(false)

// const selectedKeys = useStorage('src_layout_layout1', menuList[0])
const router = useRouter()
const selectedKeys = ref([[menuList[0].name]])
onMounted(() => {
  router.push({ name: selectedKeys[0] })
})
const handle_click_menu = ({ key }) => {
  console.log('handle_click_menu---layout-tool-', key)
  router.push({ name: key })
}
</script>
<style lang="scss" scoped>
.layout-content {
  background: #fff;
  padding: 24px;
  margin: 0;
  min-height: 680px;
  height: calc(100vh - 64px);

  overflow-y: auto;
}
</style>
