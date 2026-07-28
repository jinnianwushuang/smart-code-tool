<template>
  <div class="q-pa-md">
    <q-card flat bordered class="tool-main-card">
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
const PropertyToVariable = defineAsyncComponent(() => import('src/pages/code-tool/components/property-to-variable/property-to-variable.vue'))
const VariableNameExtraction = defineAsyncComponent(() => import('src/pages/code-tool/components/variable-name-extraction/variable-name-extraction.vue'))
const MethodNameToArrowFunction = defineAsyncComponent(() => import('src/pages/code-tool/components/method-name-to-arrow-function/method-name-to-arrow-function.vue'))
const StringChangeCase = defineAsyncComponent(() => import('src/pages/code-tool/components/string-change-case/string-change-case.vue'))
const ConvertToTemplateRef = defineAsyncComponent(() => import('src/pages/code-tool/components/convert-to-template-ref/convert-to-template-ref.vue'))
const TextDeduplication = defineAsyncComponent(() => import('src/pages/code-tool/components/text-deduplication/text-deduplication.vue'))
const FunctionCodeCorrection = defineAsyncComponent(() => import('src/pages/code-tool/components/function-code-correction/function-code-correction.vue'))
const WebCharacterEscape = defineAsyncComponent(() => import('src/pages/code-tool/components/web-character-escape/web-character-escape.vue'))

const TemplateUnifiedExtractor = defineAsyncComponent(() => import('src/pages/code-tool/components/template-unified-extractor/template-unified-extractor.vue'))

const ComposableCodeGennerater = defineAsyncComponent(() => import('src/pages/code-tool/components/composable-code-gennerater/composable-code-gennerater.vue'))
const SvgBatchConverter = defineAsyncComponent(() => import('src/pages/code-tool/components/svg-batch-converter/svg-batch-converter.vue'))
const I18nEditorWithDiff = defineAsyncComponent(() => import('src/pages/code-tool/components/i18n-editor-with-diff/i18n-editor-with-diff.vue'))
const PathCalculation = defineAsyncComponent(() => import('src/pages/code-tool/components/path-calculation/path-calculation.vue'))
const TreeFolderEditer = defineAsyncComponent(() => import('src/pages/code-tool/components/tree-folder-editer/tree-folder-editer.vue'))

const RefVariableToAssignmentStatement = defineAsyncComponent(() => import('src/pages/code-tool/components/ref-variable-to-assignment-statement/ref-variable-to-assignment-statement.vue'))

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

const current_tab_name = ref('StringChangeCase')
const all_tabs = [
  { name: 'StringChangeCase', label: '字符串格式转换', component: StringChangeCase },
  { name: 'TextDeduplication', label: '文本去重清洗', component: TextDeduplication },
  { name: 'PropertyToVariable', label: '属性转换为变量', component: PropertyToVariable },
  {
    name: 'RefVariableToAssignmentStatement',
    label: 'ref 赋值语句转换器',
    component: RefVariableToAssignmentStatement,
  },
  { name: 'VariableNameExtraction', label: '变量名称提取', component: VariableNameExtraction },
  { name: 'ConvertToTemplateRef', label: 'useTemplateRef', component: ConvertToTemplateRef },
  {
    name: 'MethodNameToArrowFunction',
    label: '方法名称转箭头函数',
    component: MethodNameToArrowFunction,
  },

  { name: 'FunctionCodeCorrection', label: '函数代码修正', component: FunctionCodeCorrection },
  { name: 'TemplateUnifiedExtractor', label: 'Vue模板提取器', component: TemplateUnifiedExtractor },

  {
    name: 'ComposableCodeGennerater',
    label: '组合式代码生成',
    component: ComposableCodeGennerater,
  },

  { name: 'SvgBatchConverter', label: 'SVG 批量转换VUE组件', component: SvgBatchConverter },
  { name: 'I18nEditorWithDiff', label: 'i18n 编辑器', component: I18nEditorWithDiff },
  { name: 'PathCalculation', label: '引用路径计算', component: PathCalculation },
  { name: 'TreeFolderEditer', label: '树形文件夹编辑器', component: TreeFolderEditer },
  { name: 'WebCharacterEscape', label: 'Web 字符转义', component: WebCharacterEscape },
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
.tool-main-card {
  /* 确保在切换黑白主题时有平滑过渡 */
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
  min-height: 600px;
}
</style>
