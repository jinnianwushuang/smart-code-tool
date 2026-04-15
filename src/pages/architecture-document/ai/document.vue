<template>
  <div>
    <q-card>
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import SentenceAssembly from 'src/pages/architecture-document/ai/component/sentence_assembly/sentence_assembly.vue'
import VueCase from 'src/pages/architecture-document/ai/component/vue/vue-case.vue'
const current_tab_name = ref('SentenceAssembly')
const all_tabs = [
  { name: 'SentenceAssembly', label: '语句组装', component: SentenceAssembly },
  { name: 'VueCase', label: 'Vue语句', component: VueCase },
]
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
