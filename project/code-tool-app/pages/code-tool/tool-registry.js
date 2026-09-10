import { defineAsyncComponent } from 'vue'

export const codeToolTabs = [
  {
    name: 'StringChangeCase',
    label: '字符串格式转换',
    component: defineAsyncComponent(
      () => import('./components/string-change-case/string-change-case.vue'),
    ),
  },
  {
    name: 'TextDeduplication',
    label: '文本去重清洗',
    component: defineAsyncComponent(
      () => import('./components/text-deduplication/text-deduplication.vue'),
    ),
  },
  {
    name: 'PropertyToVariable',
    label: '属性转换为变量',
    component: defineAsyncComponent(
      () => import('./components/property-to-variable/property-to-variable.vue'),
    ),
  },
  {
    name: 'RefVariableToAssignmentStatement',
    label: 'ref 赋值语句转换器',
    component: defineAsyncComponent(
      () =>
        import('./components/ref-variable-to-assignment-statement/ref-variable-to-assignment-statement.vue'),
    ),
  },
  {
    name: 'VariableNameExtraction',
    label: '变量名称提取',
    component: defineAsyncComponent(
      () => import('./components/variable-name-extraction/variable-name-extraction.vue'),
    ),
  },
  {
    name: 'ConvertToTemplateRef',
    label: 'useTemplateRef',
    component: defineAsyncComponent(
      () => import('./components/convert-to-template-ref/convert-to-template-ref.vue'),
    ),
  },
  {
    name: 'MethodNameToArrowFunction',
    label: '方法名称转箭头函数',
    component: defineAsyncComponent(
      () => import('./components/method-name-to-arrow-function/method-name-to-arrow-function.vue'),
    ),
  },
  {
    name: 'FunctionCodeCorrection',
    label: '函数代码修正',
    component: defineAsyncComponent(
      () => import('./components/function-code-correction/function-code-correction.vue'),
    ),
  },
  {
    name: 'TemplateUnifiedExtractor',
    label: 'Vue模板提取器',
    component: defineAsyncComponent(
      () => import('./components/template-unified-extractor/template-unified-extractor.vue'),
    ),
  },
  {
    name: 'ComposableCodeGennerater',
    label: '组合式代码生成',
    component: defineAsyncComponent(
      () => import('./components/composable-code-gennerater/composable-code-gennerater.vue'),
    ),
  },
  {
    name: 'SvgBatchConverter',
    label: 'SVG 批量转换VUE组件',
    component: defineAsyncComponent(
      () => import('./components/svg-batch-converter/svg-batch-converter.vue'),
    ),
  },
  {
    name: 'I18nEditorWithDiff',
    label: 'i18n 编辑器',
    component: defineAsyncComponent(
      () => import('./components/i18n-editor-with-diff/i18n-editor-with-diff.vue'),
    ),
  },
  {
    name: 'PathCalculation',
    label: '引用路径计算',
    component: defineAsyncComponent(
      () => import('./components/path-calculation/path-calculation.vue'),
    ),
  },
  {
    name: 'TreeFolderEditer',
    label: '树形文件夹编辑器',
    component: defineAsyncComponent(
      () => import('./components/tree-folder-editer/tree-folder-editer.vue'),
    ),
  },
  {
    name: 'WebCharacterEscape',
    label: 'Web 字符转义',
    component: defineAsyncComponent(
      () => import('./components/web-character-escape/web-character-escape.vue'),
    ),
  },
]

export const codeToolDefaultTab = 'StringChangeCase'
