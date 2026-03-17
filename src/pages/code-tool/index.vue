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
import PropertyToVariable from './components/property-to-variable/property-to-variable.vue'
import VariableNameExtraction from './components/variable-name-extraction/variable-name-extraction.vue'
import MethodNameToArrowFunction from './components/method-name-to-arrow-function/method-name-to-arrow-function.vue'
import StringChangeCase from './components/string-change-case/string-change-case.vue'
import ConvertToTemplateRef from './components/convert-to-template-ref/convert-to-template-ref.vue'
import TextDeduplication from './components/text-deduplication/text-deduplication.vue'
import FunctionCodeCorrection from './components/function-code-correction/function-code-correction.vue'
import TemplateInterpolationExtract from './components/template-interpolation-extract/template-interpolation-extract.vue'
import TemplateFunctionExtract from './components/template-function-extract/template-function-extract.vue'
import TemplateColonPropertyExtract from './components/template-colon-property-extract/template-colon-property-extract.vue'
import ComposableCodeGennerater from './components/composable-code-gennerater/composable-code-gennerater.vue'

const current_tab_name = ref('PropertyToVariable')
const all_tabs = [
  { name: 'PropertyToVariable', label: '属性转换为变量', component: PropertyToVariable },
  { name: 'VariableNameExtraction', label: '变量名称提取', component: VariableNameExtraction },
  {
    name: 'MethodNameToArrowFunction',
    label: '方法名称转箭头函数',
    component: MethodNameToArrowFunction,
  },

  { name: 'StringChangeCase', label: '字符串转换', component: StringChangeCase },
  { name: 'ConvertToTemplateRef', label: '转换为 useTemplateRef', component: ConvertToTemplateRef },
  { name: 'TextDeduplication', label: '文本去重清洗', component: TextDeduplication },
  { name: 'FunctionCodeCorrection', label: '函数代码纠正', component: FunctionCodeCorrection },
  {
    name: 'TemplateInterpolationExtract',
    label: '模板{{}}插值提取',
    component: TemplateInterpolationExtract,
  },
  { name: 'TemplateFunctionExtract', label: '模板@函数提取', component: TemplateFunctionExtract },
  {
    name: 'TemplateColonPropertyExtract',
    label: '模板:属性提取',
    component: TemplateColonPropertyExtract,
  },
  {
    name: 'ComposableCodeGennerater',
    label: '组合式代码生成',
    component: ComposableCodeGennerater,
  },
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
