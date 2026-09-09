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
import StringChangeCase from './components/string-change-case/string-change-case.vue'

const PropertyToVariable = defineAsyncComponent(
  () => import('./components/property-to-variable/property-to-variable.vue'),
)
const VariableNameExtraction = defineAsyncComponent(
  () => import('./components/variable-name-extraction/variable-name-extraction.vue'),
)
const MethodNameToArrowFunction = defineAsyncComponent(
  () => import('./components/method-name-to-arrow-function/method-name-to-arrow-function.vue'),
)
const ConvertToTemplateRef = defineAsyncComponent(
  () => import('./components/convert-to-template-ref/convert-to-template-ref.vue'),
)
const TextDeduplication = defineAsyncComponent(
  () => import('./components/text-deduplication/text-deduplication.vue'),
)
const FunctionCodeCorrection = defineAsyncComponent(
  () => import('./components/function-code-correction/function-code-correction.vue'),
)
const WebCharacterEscape = defineAsyncComponent(
  () => import('src/pages/code-tool/components/web-character-escape/web-character-escape.vue'),
)
const TemplateUnifiedExtractor = defineAsyncComponent(
  () => import('./components/template-unified-extractor/template-unified-extractor.vue'),
)
const ComposableCodeGennerater = defineAsyncComponent(
  () => import('./components/composable-code-gennerater/composable-code-gennerater.vue'),
)
const SvgBatchConverter = defineAsyncComponent(
  () => import('src/pages/code-tool/components/svg-batch-converter/svg-batch-converter.vue'),
)
const I18nEditorWithDiff = defineAsyncComponent(
  () => import('src/pages/code-tool/components/i18n-editor-with-diff/i18n-editor-with-diff.vue'),
)
const PathCalculation = defineAsyncComponent(
  () => import('src/pages/code-tool/components/path-calculation/path-calculation.vue'),
)
const TreeFolderEditer = defineAsyncComponent(
  () => import('src/pages/code-tool/components/tree-folder-editer/tree-folder-editer.vue'),
)
const RefVariableToAssignmentStatement = defineAsyncComponent(
  () =>
    import('src/pages/code-tool/components/ref-variable-to-assignment-statement/ref-variable-to-assignment-statement.vue'),
)

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
