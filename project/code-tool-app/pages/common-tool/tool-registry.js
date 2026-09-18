import { defineAsyncComponent } from 'vue'

export const commonToolTabs = [
  {
    name: 'JsonExcelConverter',
    label: 'JSON 转 Excel',
    component: defineAsyncComponent(
      () => import('./components/json-excel-converter/json-excel-converter.vue'),
    ),
  },
  {
    name: 'ExcelJsonConverter',
    label: 'Excel 转 JSON',
    component: defineAsyncComponent(
      () => import('./components/excel-json-converter/excel-json-converter.vue'),
    ),
  },
  {
    name: 'TimestampTimestr',
    label: '时间戳转换',
    component: defineAsyncComponent(
      () => import('./components/timestamp-timestr/timestamp-timestr.vue'),
    ),
  },
  {
    name: 'RandomSelection',
    label: '随机选择',
    component: defineAsyncComponent(
      () => import('./components/random-selection/random-selection.vue'),
    ),
  },
  {
    name: 'RandomValues',
    label: '随机密码生成器',
    component: defineAsyncComponent(() => import('./components/random-values/random-values.vue')),
  },
  {
    name: 'TextSegmentation',
    label: '文本分段',
    component: defineAsyncComponent(
      () => import('./components/text-segmentation/text-segmentation.vue'),
    ),
  },
  {
    name: 'UrlAdvancedParser',
    label: 'URL 高级解析器',
    component: defineAsyncComponent(
      () => import('./components/url-advanced-parser/url-advanced-parser.vue'),
    ),
  },
  {
    name: 'HttpStatusManual',
    label: 'HTTP 状态码手册',
    component: defineAsyncComponent(
      () => import('./components/http-status-manual/http-status-manual.vue'),
    ),
  },
  {
    name: 'Base64Tool',
    label: 'Base64 工具',
    component: defineAsyncComponent(() => import('./components/base64-tool/base64-tool.vue')),
  },
  {
    name: 'IdGenerator',
    label: 'UUID / NanoID 生成器',
    component: defineAsyncComponent(() => import('./components/id-generator/id-generator.vue')),
  },
  {
    name: 'ColorConverter',
    label: '颜色转换器',
    component: defineAsyncComponent(
      () => import('./components/color-converter/color-converter.vue'),
    ),
  },
  {
    name: 'RegexTester',
    label: '正则表达式测试器',
    component: defineAsyncComponent(() => import('./components/regex-tester/regex-tester.vue')),
  },
  {
    name: 'ExcelStatsAnalyzer',
    label: 'Excel 表格统计分析',
    component: defineAsyncComponent(
      () => import('./components/excel-stats-analyzer/excel-stats-analyzer.vue'),
    ),
  },
  {
    name: 'TextExtractStats',
    label: '文本提取与模板替换',
    component: defineAsyncComponent(
      () => import('./components/text-extract-stats/text-extract-stats.vue'),
    ),
  },
  {
    name: 'DateIntervalCalculator',
    label: '日期间隔计算器',
    component: defineAsyncComponent(
      () => import('./components/date-interval-calculator/date-interval-calculator.vue'),
    ),
  },
  {
    name: 'FestivalCalculator',
    label: '中国传统节日计算器',
    component: defineAsyncComponent(
      () => import('./components/festival-calculator/festival-calculator.vue'),
    ),
  },
  {
    name: 'MarkdownPdfTool',
    label: 'Markdown → PDF / 图片',
    component: defineAsyncComponent(
      () => import('./components/markdown-pdf-tool/markdown-pdf-tool.vue'),
    ),
  },
]

export const commonToolDefaultTab = 'JsonExcelConverter'
