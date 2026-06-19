<template>
  <a-layout-header class="header">
    <q-toolbar>
      <div class="logo" style="width: 80px">
        <img src="logo/icons8-light-on-96.png" alt="logo" width="40px" height="40px" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys1"
        mode="horizontal"
        class="header-menu"
        @click="handle_click_menu"
      >
        <a-menu-item key="tool">工具库</a-menu-item>
        <a-menu-item key="vue-test">VUE 架构验证</a-menu-item>
        <a-menu-item key="docs">文档</a-menu-item>
      </a-menu>
      <q-space />

      <!-- <div class="text-caption mobile-hide header-text">
        {{ buildTime }}
      </div> -->
      <div class="text-caption mobile-hide header-text columns">
        <div class="text-caption">
          {{ build_date }}
        </div>
        <div class="text-caption">
          {{ build_time }}
        </div>
      </div>

      <q-btn
        flat
        round
        dense
        :icon="isDarkTheme ? 'nightlight_round' : 'light_mode'"
        @click="hanle_toogle"
        class="q-mr-sm header-btn"
      >
        <q-tooltip>{{ isDarkTheme ? '切换至日间模式' : '切换至夜间模式' }}</q-tooltip>
      </q-btn>
    </q-toolbar>
  </a-layout-header>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { dayjs, isDarkTheme } from 'src/output/common/project-common.js'
import { useGlobalState } from 'src/output/common/composable-common.js'
const { router, route, $q } = useGlobalState()
const buildTime = __APP_BUILD_TIME__
const build_date = dayjs(buildTime).format('YYYY-MM-DD')
const build_time = dayjs(buildTime).format('HH:mm:ss Z')

const selectedKeys1 = ref([])

onMounted(() => {
  check_route()
})
watch(route, () => {
  check_route()
})

const check_route = () => {
  const targetKeys = ['tool', 'vue-test']

  // 查找 matched 记录中第一个匹配 targetKeys 的 name

  let match = targetKeys.find((key) => {
    const match = route.matched.find((item) => key === item.name)
    return !!match
  })

  if (match) {
    selectedKeys1.value = [match]
  } else {
    selectedKeys1.value = []
  }
}

const hanle_toogle = () => {
  isDarkTheme.value = !isDarkTheme.value

  // 如果当前在文档页面，同步主题到 VitePress
  if (route.path.includes('/docs')) {
    syncThemeToDocs()
  }
}

// 同步主题到文档 iframe
const syncThemeToDocs = () => {
  const currentTheme = isDarkTheme.value ? 'dark' : 'light'

  // 查找文档页面的 iframe 元素
  const iframe = document.querySelector('iframe[src*="docs"]')

  if (iframe && iframe.contentWindow) {
    // 向 iframe 发送主题变更消息
    iframe.contentWindow.postMessage({ type: 'theme-change', theme: currentTheme }, '*')
    console.log('[Header] 主题已同步到 iframe:', currentTheme)
  }
}

const handle_click_menu = ({ key }) => {
  console.log('handle_click_menu----layout-header---', key)

  // 如果是文档菜单，跳转到文档路由
  if (key === 'docs') {
    router.push({ name: 'docs' })
  } else {
    router.push({ name: key })
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 64px;
  line-height: 64px;
  background: var(--q-header-bg) !important;
  border-bottom: 1px solid var(--q-header-border-color);
  transition: all 0.3s ease; /* 添加过渡效果 */
  padding: 0 16px;
}

.header-text,
.header-btn,
.header-toggle {
  color: var(--q-header-text-color) !important;
  transition: color 0.3s ease;
}

.header-menu {
  background: transparent;
  border-bottom: none !important;
  height: 64px;
  flex: 1;

  // 深度覆盖 Ant Design 菜单项样式
  :deep(.ant-menu-item) {
    height: 64px !important;
    line-height: 64px !important;
    padding: 0 20px !important;
    margin: 0 4px !important;
    top: 0 !important;
    color: var(--q-header-text-color) !important;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    border-bottom: 3px solid transparent !important; // 初始透明边框防止抖动

    // 移除 Ant Design 默认的下划线伪元素
    &::after {
      display: none !important;
    }

    &:hover {
      color: var(--q-primary) !important;
      background: rgba(25, 118, 210, 0.05); // 悬停时淡淡的背景色
    }
  }

  :deep(.ant-menu-item-selected) {
    color: var(--q-primary) !important;
    border-bottom-color: var(--q-primary) !important; // 选中时的底部色线
    background: transparent !important;
    font-weight: 600;
  }
}

body.body--light .header {
  --q-header-bg: #ffffff;
  --q-header-text-color: rgba(0, 0, 0, 0.85);
  --q-header-border-color: rgba(0, 0, 0, 0.1); /* 日间模式下使用浅色边框 */
  --q-primary: #1976d2;
}

body.body--dark .header {
  --q-header-bg: #141414;
  --q-header-text-color: rgba(255, 255, 255, 0.85);
  --q-header-border-color: rgba(255, 255, 255, 0.1); /* 夜间模式下使用深色边框 */
  --q-primary: #2196f3;
}
</style>
