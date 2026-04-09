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

import ArchitectureDocument from './component/architecture/architecture-document.vue'
import ReferenceCode from 'src/pages/architecture-document/vue/component/reference-code/reference-code.vue'
import StandardCode from 'src/pages/architecture-document/vue/component/standard-code/standard-code.vue'
import GeneralTools from 'src/pages/architecture-document/vue/component/general-tools/general-tools.vue'
import GeneralComposable from 'src/pages/architecture-document/vue/component/general-composable/general-composable.vue'

import StandardizedTemplateCn from 'src/pages/architecture-document/vue/component/standardized-template-cn/standardized-template-cn.vue'
const current_tab_name = ref('ArchitectureDocument')
const all_tabs = [
  { name: 'ArchitectureDocument', label: '架构文档', component: ArchitectureDocument },
  { name: 'StandardCode', label: '标准代码', component: StandardCode },
  { name: 'ReferenceCode', label: '参考代码', component: ReferenceCode },
  { name: 'GeneralTools', label: '通用工具', component: GeneralTools },
  { name: 'GeneralComposable', label: '副作用清理', component: GeneralComposable },
  { name: 'StandardizedTemplateCn', label: '标准模板', component: StandardizedTemplateCn },
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
