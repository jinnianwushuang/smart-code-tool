<template>
  <q-page>
    <q-card>
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'

import CorePrinciple from 'src/pages/architecture-document/vue/component/core-principle/core-principle.vue'

const current_tab_name = ref('CorePrinciple')
const all_tabs = [{ name: 'CorePrinciple', label: '核心原理', component: CorePrinciple }]
const current_component = computed(() => {
  const current_tab = all_tabs.find((t) => t.name === current_tab_name.value)
  return current_tab ? current_tab.component : null
})
</script>

<style scoped>
.q-page {
  padding: 16px;
}
</style>
pjt9sxBJw4HEsiQsFgbAh4rr
