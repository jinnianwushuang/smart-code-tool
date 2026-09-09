<template>
  <div class="q-pa-md">
    <q-card flat bordered class="tool-main-card">
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { codeToolTabs, codeToolDefaultTab } from './tool-registry.js'
import { usePersistentTab } from 'src/pages/use-persistent-tab.js'

const current_tab_name = usePersistentTab(codeToolTabs, codeToolDefaultTab, 'code')
const all_tabs = codeToolTabs
const current_component = computed(() => {
  const current_tab = all_tabs.find((t) => t.name === current_tab_name.value)
  return current_tab ? current_tab.component : null
})
</script>

<style scoped>
.tool-main-card {
  /* 确保在切换黑白主题时有平滑过渡 */
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
  min-height: 600px;
}
</style>
