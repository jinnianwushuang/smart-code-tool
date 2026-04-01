<template>
  <a-layout class="layout-container">
    <!-- 侧边栏组件 -->
    <side-menu :collapsed="collapsed" />

    <a-layout>
      <!-- 顶栏组件 -->
      <global-header v-model:collapsed="collapsed" />

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <div class="content-wrapper">
          <slot>
            <!-- 路由出口或默认内容 -->
            <router-view />
          </slot>
        </div>
      </a-layout-content>

      <!-- 页脚（可选） -->
      <a-layout-footer style="text-align: center">
        Ant Design Vue Admin ©2026 Created by Gemini Assist
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import SideMenu from './component/SideMenu.vue'
import GlobalHeader from './component/GlobalHeader.vue'

const collapsed = ref(false)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-content {
  margin: 24px 16px;
  padding: 24px;
  background: #f0f2f5;
  min-height: 280px;
}

.content-wrapper {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  height: 100%;
}
</style>
