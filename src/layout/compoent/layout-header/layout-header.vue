<template>
  <a-layout-header class="header">
    <q-toolbar>
      <div class="logo" />

      <a-menu
        v-model:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        @click="handle_click_menu"
      >
        <a-menu-item v-for="item in topMenuList" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
      <q-space class="mobile-hide" />
      <div class="text-caption mobile-hide text-white">构建时间: {{ buildTime }}</div>
    </q-toolbar>
  </a-layout-header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGlobalState } from 'src/output/common/composable-common.js'
const { router, route, $q } = useGlobalState()
const buildTime = __APP_BUILD_TIME__

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
