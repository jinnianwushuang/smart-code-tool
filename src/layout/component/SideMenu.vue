<template>
  <a-layout-sider :collapsed="collapsed" :trigger="null" collapsible>
    <div class="logo">
      <img src="@/assets/logo.svg" alt="logo" v-if="!collapsed" />
      <span v-if="!collapsed">管理系统</span>
    </div>
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
      <a-menu-item key="1">
        <template #icon><dashboard-outlined /></template>
        <span>控制台</span>
      </a-menu-item>
      <a-menu-item key="2">
        <template #icon><user-outlined /></template>
        <span>用户管理</span>
      </a-menu-item>
      <a-menu-item key="3">
        <template #icon><setting-outlined /></template>
        <span>系统设置</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { ref } from 'vue'
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons-vue'

defineProps({
  collapsed: Boolean,
})

const selectedKeys = ref(['1'])
</script>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
</style>
