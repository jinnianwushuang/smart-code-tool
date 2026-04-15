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

import ReferenceCode from './component/reference-code/reference-code.vue'
import IdeaDoc from './component/idea-doc/idea-doc.vue'

const current_tab_name = ref('IdeaDoc')
const all_tabs = [
  { name: 'IdeaDoc', label: '思考', component: IdeaDoc },
  { name: 'ReferenceCode', label: '参考代码', component: ReferenceCode },
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
