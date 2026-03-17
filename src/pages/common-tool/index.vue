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

import JsonExcelConverter from './components/json-excel-converter/json-excel-converter.vue'
import ExcelJsonConverter from './components/excel-json-converter/excel-json-converter.vue'
import TimestampTimestr from './components/timestamp-timestr/timestamp-timestr.vue'
import RandomSelection from './components/random-selection/random-selection.vue'
import RandomValues from 'src/pages/common-tool/components/random-values/random-values.vue'
import QrCodeGeneration from 'src/pages/common-tool/components/qr-code-generation/qr-code-generation.vue'

const current_tab_name = ref('JsonExcelConverter')
const all_tabs = [
  { name: 'JsonExcelConverter', label: 'JSON 转 Excel', component: JsonExcelConverter },
  { name: 'ExcelJsonConverter', label: 'Excel 转 JSON', component: ExcelJsonConverter },
  { name: 'TimestampTimestr', label: '时间戳转换', component: TimestampTimestr },
  { name: 'RandomSelection', label: '随机选择', component: RandomSelection },
  { name: 'RandomValues', label: '随机密码生成器', component: RandomValues },
  { name: 'QrCodeGeneration', label: '二维码工作站', component: QrCodeGeneration },
]
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
