<template>
  <a-layout-header class="header">
    <q-toolbar>
      <div class="logo" style="width: 80px">
        <img src="logo/icons8-light-on-96.png" alt="logo" width="40px" height="40px" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys1"
        :theme="$q.dark.isActive ? 'dark' : 'light'"
        mode="horizontal"
        :items="topMenuList"
        class="header-menu"
        @click="handle_click_menu"
      >
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
      <!-- <q-toggle
        v-model="isDarkTheme"
        color="indigo"
        keep-color
        icon="light_mode"
        checked-icon="nightlight_round"
        unchecked-icon="light_mode"
        class="q-mr-sm header-toggle"
      >
        <q-tooltip>{{ isDarkTheme ? '切换至日间模式' : '切换至夜间模式' }}</q-tooltip>
      </q-toggle> -->
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

const topMenuList = [
  { key: 'tool', label: '工具库' },
  { key: 'vue-test', label: 'VUE 架构验证' },
  //   { key: '3', label: 'nav 3' },
]

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
  }
}

const hanle_toogle = () => {
  isDarkTheme.value = !isDarkTheme.value
}

const handle_click_menu = ({ key }) => {
  // console.log(item, key, keyPath)
  console.log('handle_click_menu----layout-header---', key)

  router.push({ name: key })
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
  background: transparent !important;
  line-height: 64px;
  border-bottom: none !important;
}

body.body--light .header {
  --q-header-bg: #ffffff;
  --q-header-text-color: rgba(0, 0, 0, 0.85);
  --q-header-border-color: rgba(0, 0, 0, 0.1); /* 日间模式下使用浅色边框 */
}

body.body--dark .header {
  --q-header-bg: #141414;
  --q-header-text-color: rgba(255, 255, 255, 0.85);
  --q-header-border-color: rgba(255, 255, 255, 0.1); /* 夜间模式下使用深色边框 */
}
</style>
