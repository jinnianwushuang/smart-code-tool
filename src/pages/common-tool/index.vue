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
import TextSegmentation from 'src/pages/common-tool/components/text-segmentation/text-segmentation.vue'
import Base64Tool from 'src/pages/common-tool/components/base64-tool/base64-tool.vue'
import UrlAdvancedParser from 'src/pages/common-tool/components/url-advanced-parser/url-advanced-parser.vue'
import IdGenerator from 'src/pages/common-tool/components/id-generator/id-generator.vue'
import HttpStatusManual from 'src/pages/common-tool/components/http-status-manual/http-status-manual.vue'
import ColorConverter from 'src/pages/common-tool/components/color-converter/color-converter.vue'
import RegexTester from 'src/pages/common-tool/components/regex-tester/regex-tester.vue'

const current_tab_name = ref('JsonExcelConverter')
const all_tabs = [
  { name: 'JsonExcelConverter', label: 'JSON 转 Excel', component: JsonExcelConverter },
  { name: 'ExcelJsonConverter', label: 'Excel 转 JSON', component: ExcelJsonConverter },
  { name: 'TimestampTimestr', label: '时间戳转换', component: TimestampTimestr },
  { name: 'RandomSelection', label: '随机选择', component: RandomSelection },
  { name: 'RandomValues', label: '随机密码生成器', component: RandomValues },
  { name: 'TextSegmentation', label: '文本分段', component: TextSegmentation },
  { name: 'UrlAdvancedParser', label: 'URL 高级解析器', component: UrlAdvancedParser },
  { name: 'HttpStatusManual', label: 'HTTP 状态码手册', component: HttpStatusManual },
  { name: 'Base64Tool', label: 'Base64 工具', component: Base64Tool },
  { name: 'IdGenerator', label: 'UUID / NanoID 生成器', component: IdGenerator },
  { name: 'ColorConverter', label: '颜色转换器', component: ColorConverter },
  { name: 'RegexTester', label: '正则表达式测试器', component: RegexTester },
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
