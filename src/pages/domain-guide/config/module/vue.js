export const tab_name = 'Vue'
export const order = 30
export const docs = [
  {
    category: 'Vue 生态核心',
    color: 'green',
    items: [
      {
        name: 'Vue 3',
        url: 'https://cn.vuejs.org',
        tag: 'Core',
        desc: '易学易用、性能卓越、灵活多变的渐进式框架。',
      },
      {
        name: 'Vue Router',
        url: 'https://router.vuejs.org/zh/',
        tag: 'Router',
        desc: 'Vue.js 官方的路由管理器,支持嵌套路由与动态路由。',
      },
      {
        name: 'Nuxt.js',
        url: 'https://nuxt.com',
        tag: 'Framework',
        desc: '直观的 Vue 框架,内置 SSR、SSG 和混合渲染能力。',
      },
      {
        name: 'Quasar',
        url: 'https://quasar.dev/',
        tag: 'Framework',
        desc: '高性能 Vue.js 框架,一套代码构建 SPA、SSR、PWA、移动端和桌面应用。',
      },
      {
        name: 'DCloud (uni-app)',
        url: 'https://www.dcloud.io/',
        tag: 'Cross-platform',
        desc: '使用 Vue.js 开发所有前端应用的框架,一套代码可发布到 iOS、Android、Web、小程序等多端。',
      },
      {
        name: 'Vue RFCs',
        url: 'https://github.com/vuejs/rfcs',
        tag: 'Design',
        desc: '跟踪 Vue 核心 API 的变动逻辑与设计哲学。',
      },
    ],
  },
  {
    category: 'UI 组件库',
    color: 'blue',
    items: [
      {
        name: 'shadcn-vue',
        url: 'https://www.shadcn-vue.com',
        tag: 'Components',
        desc: 'shadcn/ui 的 Vue 社区移植版,完美适配 Radix Vue,为 Vue 开发者提供极致的 UI 自定义自由度。',
      },
      {
        name: 'Element Plus',
        url: 'https://element-plus.org/zh-CN/',
        tag: 'Components',
        desc: '基于 Vue 3 的组件库,国内最流行的企业级 UI 解决方案。',
      },
      {
        name: 'Ant Design Vue',
        url: 'https://antdv.com',
        tag: 'Components',
        desc: 'Ant Design 的 Vue 实现,提供丰富的企业级组件。',
      },
      {
        name: 'Naive UI',
        url: 'https://www.naiveui.com',
        tag: 'Components',
        desc: '一个 Vue 3 组件库,主题可调,使用 TypeScript,速度快。',
      },
      {
        name: 'Vuetify',
        url: 'https://vuetifyjs.com',
        tag: 'Components',
        desc: '基于 Material Design 的 Vue 组件库,功能丰富且美观。',
      },
    ],
  },
  {
    category: 'Headless UI (无样式组件库)',
    color: 'cyan',
    items: [
      {
        name: 'Radix Vue',
        url: 'https://www.radix-vue.com',
        tag: 'Headless',
        desc: 'Radix UI 的 Vue 移植版，保持高水准的无障碍支持。',
      },
      {
        name: 'PrimeVue (Unstyled)',
        url: 'https://primevue.org/uikit/',
        tag: 'Unstyled',
        desc: '提供强大的“非样式模式”，允许开发者完全自定义 UI 表现。',
      },
      {
        name: 'Headless UI Vue',
        url: 'https://headlessui.com/vue/menu',
        tag: 'Headless',
        desc: 'Headless UI 的 Vue 官方实现版本。',
      },
    ],
  },
  {
    category: '状态管理',
    color: 'orange',
    items: [
      {
        name: 'Pinia',
        url: 'https://pinia.vuejs.org/zh/',
        tag: 'State',
        desc: '符合直觉的 Vue 官方状态管理库,TypeScript 友好。',
      },
      {
        name: 'Vuex',
        url: 'https://vuex.vuejs.org/zh/',
        tag: 'State',
        desc: 'Vue.js 应用程序开发的状态管理模式和库(legacy)。',
      },
    ],
  },
  {
    category: '数据获取',
    color: 'teal',
    items: [
      {
        name: 'Vue Query',
        url: 'https://tanstack.com/query/latest/docs/framework/vue/overview',
        tag: 'Async',
        desc: 'TanStack Query 的 Vue 版本,强大的异步状态管理。',
      },
      {
        name: 'Axios',
        url: 'https://axios-http.com',
        tag: 'HTTP',
        desc: '基于 Promise 的 HTTP 客户端,适用于浏览器和 Node.js。',
      },
      {
        name: 'Apollo Client',
        url: 'https://www.apollographql.com/docs/react/',
        tag: 'GraphQL',
        desc: '功能完整的 GraphQL 客户端,支持 Vue 集成。',
      },
    ],
  },
  {
    category: '表单处理',
    color: 'green',
    items: [
      {
        name: 'VeeValidate',
        url: 'https://vee-validate.logaretm.com/v4/',
        tag: 'Form',
        desc: '基于模板的 Vue 表单验证库,简单易用。',
      },
      {
        name: 'FormKit',
        url: 'https://formkit.dev',
        tag: 'Form',
        desc: '为 Vue 打造的表单框架,减少样板代码。',
      },
      {
        name: 'Zod',
        url: 'https://zod.dev',
        tag: 'Validation',
        desc: 'TypeScript 优先的模式声明和验证库,可与 VeeValidate 配合使用。',
      },
    ],
  },
  {
    category: '动画效果',
    color: 'pink',
    items: [
      {
        name: 'GSAP',
        url: 'https://gsap.com',
        tag: 'Animation',
        desc: '专业级 JavaScript 动画库,性能卓越且功能强大。',
      },
      {
        name: 'Animate.css',
        url: 'https://animate.style',
        tag: 'Animation',
        desc: '即用型跨浏览器 CSS 动画库。',
      },
      {
        name: '@vueuse/motion',
        url: 'https://motion.vueuse.org',
        tag: 'Animation',
        desc: '基于 Framer Motion 的 Vue 动画库。',
      },
    ],
  },
  {
    category: '样式方案',
    color: 'indigo',
    items: [
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        tag: 'CSS',
        desc: '实用程序优先的 CSS 框架,快速构建现代界面。',
      },
      {
        name: 'UnoCSS',
        url: 'https://unocss.dev',
        tag: 'CSS',
        desc: '即时按需的原子化 CSS 引擎,极致的性能与灵活性。',
      },
    ],
  },
  {
    category: '测试工具',
    color: 'red',
    items: [
      {
        name: 'Vitest',
        url: 'https://vitest.dev',
        tag: 'Testing',
        desc: '由 Vite 驱动的极速单元测试框架,兼容 Jest API。',
      },
      {
        name: 'Vue Test Utils',
        url: 'https://test-utils.vuejs.org/zh/',
        tag: 'Testing',
        desc: 'Vue.js 官方的单元测试实用工具库。',
      },
      {
        name: 'Cypress',
        url: 'https://www.cypress.io',
        tag: 'E2E',
        desc: '快速、简单、可靠的端到端测试框架。',
      },
      {
        name: 'Playwright',
        url: 'https://playwright.dev',
        tag: 'E2E',
        desc: '跨浏览器、跨平台的可靠端到端测试方案。',
      },
    ],
  },
  {
    category: '图表与可视化',
    color: 'yellow',
    items: [
      {
        name: 'ECharts',
        url: 'https://echarts.apache.org/zh/index.html',
        tag: 'Chart',
        desc: '百度开源的强大交互式数据可视化库。',
      },
      {
        name: 'Chart.js',
        url: 'https://www.chartjs.org',
        tag: 'Chart',
        desc: '简单灵活的 JavaScript 图表库。',
      },
      {
        name: 'Vue ChartJS',
        url: 'https://vue-chartjs.org',
        tag: 'Chart',
        desc: 'Chart.js 的 Vue 封装,易于集成。',
      },
    ],
  },
  {
    category: '富文本编辑器',
    color: 'brown',
    items: [
      {
        name: 'TipTap',
        url: 'https://tiptap.dev',
        tag: 'Editor',
        desc: '无头富文本编辑器框架,完全可定制且基于 ProseMirror,支持 Vue。',
      },
      {
        name: 'Quill',
        url: 'https://quilljs.com',
        tag: 'Editor',
        desc: '现代化的富文本编辑器,有 Vue 封装版本。',
      },
    ],
  },
  {
    category: '国际化',
    color: 'violet',
    items: [
      {
        name: 'vue-i18n',
        url: 'https://vue-i18n.intlify.dev',
        tag: 'i18n',
        desc: 'Vue.js 的国际化插件,支持多种语言切换。',
      },
    ],
  },
  {
    category: '生态工具',
    color: 'cyan',
    items: [
      {
        name: 'VueUse',
        url: 'https://vueuse.org',
        tag: 'Utils',
        desc: '基于 Composition API 的高质量实用函数集合。',
      },
      {
        name: 'VitePress',
        url: 'https://vitepress.dev',
        tag: 'Docs',
        desc: '基于 Vite 和 Vue 的极速静态站点生成器。',
      },
    ],
  },
  {
    category: '企业级实战项目',
    color: 'magenta',
    items: [
      {
        name: 'Vue Vben Admin',
        url: 'https://github.com/vbenjs/vue-vben-admin',
        tag: 'Admin',
        desc: '基于 Vue3, Vite, Ant Design 的超大规模中后台集成方案。',
      },
      {
        name: 'Nuxt UI Example',
        url: 'https://github.com/nuxt/ui',
        tag: 'Nuxt',
        desc: 'Nuxt 官方出品的 UI 框架实战，展示了现代 Vue 全栈开发的极速体验。',
      },
    ],
  },
]
