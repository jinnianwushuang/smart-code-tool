<template>
  <a-layout-header class="header">
    <q-toolbar>
      <div class="logo" style="width: 80px">
        <img src="logo/icons8-light-on-96.png" alt="logo" width="40px" height="40px" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        :items="topMenuList"
        @click="handle_click_menu"
      >
      </a-menu>
      <q-space class="mobile-hide" />

      <div class="text-caption mobile-hide text-white">构建时间: {{ buildTime }} {{ isDark }}</div>
      <q-btn
        flat
        round
        dense
        :icon="isDark ? 'nightlight_round' : 'light_mode'"
        @click="hanle_toogle"
        class="q-mr-sm text-white"
      >
        <q-tooltip>{{ isDark ? '切换至日间模式' : '切换至夜间模式' }}</q-tooltip>
      </q-btn>
    </q-toolbar>
  </a-layout-header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useGlobalState } from 'src/output/common/composable-common.js'
const { router, route, $q } = useGlobalState()
const buildTime = __APP_BUILD_TIME__
// 自动管理 html 上的 .dark 类
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)
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
  $q.dark.toggle()
  toggleDark()
}

const handle_click_menu = ({ key }) => {
  // console.log(item, key, keyPath)
  console.log('handle_click_menu----layout-header---', key)

  router.push({ name: key })
}
</script>

<style lang="scss" scoped>
.header {
  height: 50px;
  line-height: 50px;
}
</style>
