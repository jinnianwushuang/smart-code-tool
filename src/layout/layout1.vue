<template>
  <q-layout :view="view" style="" class="shadow-2 rounded-borders">
    <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />

        <q-toolbar-title>工具库{{ isDev ? '（开发版）' : '' }}</q-toolbar-title>
        <q-space class="mobile-hide" />
        <div class="text-caption mobile-hide">构建时间: {{ buildTime }}</div>
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
import { menuList } from './config/menu.js'
import { useQuasar } from 'quasar'
import { useStorage } from '@vueuse/core'
const $q = useQuasar()
const isDesktop = $q.platform.is.desktop
const view = isDesktop ? 'hHh Lpr lff' : 'hHh Lpr lff'
const isDev = import.meta.env.DEV
const drawer = ref(false)
const current_menu = useStorage('src_layout_layout1', menuList[0])
const router = useRouter()
const buildTime = __APP_BUILD_TIME__
onMounted(() => {
  router.push({ name: current_menu.name })
})
const handle_click_menu = (menuItem) => {
  console.log(menuItem)
  current_menu.value = menuItem
  // drawer.value = false
  router.push({ name: menuItem.name })
}
</script>
