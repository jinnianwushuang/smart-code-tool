<template>
  <div>
    <q-card>
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { commonToolTabs, commonToolDefaultTab } from './tool-registry.js'
import { usePersistentTab } from 'src/pages/use-persistent-tab.js'

const current_tab_name = usePersistentTab(commonToolTabs, commonToolDefaultTab, 'common')
const all_tabs = commonToolTabs
const current_component = computed(() => {
  const current_tab = all_tabs.find((t) => t.name === current_tab_name.value)
  return current_tab ? current_tab.component : null
})
</script>

<style scoped>
.div {
  padding: 16px;
}
</style>
