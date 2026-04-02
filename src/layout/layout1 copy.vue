<template>
  <q-layout :view="view" style="" class="shadow-2 rounded-borders">
    <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
      <q-toolbar>
        <a-button type="text" @click="drawer = !drawer" shape="circle" size="small">
          <template #icon><menu-outlined /></template>
        </a-button>
        <q-toolbar-title>工具库{{ isDev ? '（开发版）' : '' }}</q-toolbar-title>
        <q-space />
        <div class="text-caption">构建时间: {{ buildTime }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="200"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item
              clickable
              :active="current_menu.name === menuItem.name"
              @click="handle_click_menu(menuItem)"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'
import { menuList } from './config/menu.js'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const isDesktop = $q.platform.is.desktop
const view = isDesktop ? 'hHh Lpr lff' : 'lhh LpR lff'
const isDev = import.meta.env.DEV
const envName = import.meta.env.MODE
const drawer = ref(false)
const current_menu = ref({})
const router = useRouter()
const buildTime = __APP_BUILD_TIME__
onMounted(() => {
  current_menu.value = menuList[0]
  router.push({ name: menuList[0].name })
})
const handle_click_menu = (menuItem) => {
  console.log(menuItem)
  current_menu.value = menuItem
  // drawer.value = false
  router.push({ name: menuItem.name })
}
</script>
