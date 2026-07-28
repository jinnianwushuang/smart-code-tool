<template>
  <div>
    <q-card>
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'

const JsonExcelConverter = defineAsyncComponent(() => import('src/pages/common-tool/components/json-excel-converter/json-excel-converter.vue'))
const ExcelJsonConverter = defineAsyncComponent(() => import('src/pages/common-tool/components/excel-json-converter/excel-json-converter.vue'))
const TimestampTimestr = defineAsyncComponent(() => import('src/pages/common-tool/components/timestamp-timestr/timestamp-timestr.vue'))
const RandomSelection = defineAsyncComponent(() => import('src/pages/common-tool/components/random-selection/random-selection.vue'))
const RandomValues = defineAsyncComponent(() => import('src/pages/common-tool/components/random-values/random-values.vue'))
const TextSegmentation = defineAsyncComponent(() => import('src/pages/common-tool/components/text-segmentation/text-segmentation.vue'))
const Base64Tool = defineAsyncComponent(() => import('src/pages/common-tool/components/base64-tool/base64-tool.vue'))
const UrlAdvancedParser = defineAsyncComponent(() => import('src/pages/common-tool/components/url-advanced-parser/url-advanced-parser.vue'))
const IdGenerator = defineAsyncComponent(() => import('src/pages/common-tool/components/id-generator/id-generator.vue'))
const HttpStatusManual = defineAsyncComponent(() => import('src/pages/common-tool/components/http-status-manual/http-status-manual.vue'))
const ColorConverter = defineAsyncComponent(() => import('src/pages/common-tool/components/color-converter/color-converter.vue'))
const RegexTester = defineAsyncComponent(() => import('src/pages/common-tool/components/regex-tester/regex-tester.vue'))

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
.div {
  padding: 16px;
}
</style>
