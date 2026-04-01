<template>
  <a-layout-header class="global-header">
    <div class="header-left">
      <menu-unfold-outlined v-if="collapsed" class="trigger" @click="toggleCollapsed" />
      <menu-fold-outlined v-else class="trigger" @click="toggleCollapsed" />

      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>首页</a-breadcrumb-item>
        <a-breadcrumb-item>当前页面</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="header-right">
      <a-dropdown>
        <span class="user-action">
          <a-avatar size="small">U</a-avatar>
          <span class="username">管理员</span>
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item>个人中心</a-menu-item>
            <a-menu-divider />
            <a-menu-item>退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup>
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  collapsed: Boolean,
})

const emit = defineEmits(['update:collapsed'])

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed)
}
</script>

<style scoped>
.global-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  margin-right: 24px;
}

.trigger:hover {
  color: #1890ff;
}

.user-action {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
