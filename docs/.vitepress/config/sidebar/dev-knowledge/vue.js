/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── Vue 体系 ──
export const vueSection = {
  text: 'Vue 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          text: '通用工具',
          collapsed: true,
          items: [
            {
              id: 'WOOyjk6ud4ZontyREErymom2',
              text: '模块加载器',
              link: '/dev-knowledge/vue/architecture/general-tools/module-loader',
            },
            {
              id: 'AMjMxQ3yJfETZYMiZKxI9gT6',
              text: 'Payload 包装器',
              link: '/dev-knowledge/vue/architecture/general-tools/wrap-with-payload',
            },
          ],
        },
        {
          text: '标准化模板',
          collapsed: true,
          items: [
            {
              id: 'r-tGROgH9IwcYj3OFcsizlZ4',
              text: '架构概述',
              link: '/dev-knowledge/vue/architecture/standardized-template/architecture-overview',
            },
            {
              id: 'm2HrrwOb0WOOwPk3n6VvVtoc',
              text: 'LV1-LV5 架构演进',
              link: '/dev-knowledge/vue/architecture/standardized-template/architecture-evolution',
            },
            {
              id: 'U5lxbDG60Nj7bRrke-avlJXP',
              text: '装配器模式',
              link: '/dev-knowledge/vue/architecture/standardized-template/assembler-pattern',
            },
            {
              id: 'zNr29dH4Q_qZbSgr9YODdzc0',
              text: '状态管理',
              link: '/dev-knowledge/vue/architecture/standardized-template/state-management',
            },
            {
              id: '3zY6MzaeU3cKb4Nknvya95t4',
              text: '生命周期与副作用',
              link: '/dev-knowledge/vue/architecture/standardized-template/lifecycle-and-effects',
            },
            {
              id: 'sTroFr7o8FSIJXNYwoHTSw0U',
              text: '事件管道系统',
              link: '/dev-knowledge/vue/architecture/standardized-template/event-pipeline-system',
            },
            {
              id: 'd-BsMZyhz7Cm5LickkTzGILi',
              text: '组件系统',
              link: '/dev-knowledge/vue/architecture/standardized-template/component-system',
            },
            {
              id: 'xtuQnT10Rk5_eljtSDlFlvKp',
              text: 'API 请求与模块调用',
              link: '/dev-knowledge/vue/architecture/standardized-template/api-request-and-module',
            },
            {
              id: 'WA3-D7C67zfC9w4f5HMKZg70',
              text: '组件设计模式',
              link: '/dev-knowledge/vue/architecture/standardized-template/component-design-patterns',
            },
          ],
        },
        {
          id: 'jmZppMUuPce-rPkZ4M52dExt',
          text: 'Composable 设计模式',
          link: '/dev-knowledge/vue/architecture/composable-patterns/vue-composable-design-patterns',
        },
        {
          id: 'e4jG6awmVYV5vfPujfF23Ay0',
          text: '性能优化系统手册',
          link: '/dev-knowledge/vue/architecture/performance/vue-performance-optimization',
        },
        {
          text: '研发思维',
          collapsed: true,
          items: [
            {
              id: 'PAykDF42Bo7mSnv02Ts6WmTd',
              text: '数据·算法·显示 三者分离',
              link: '/dev-knowledge/vue/architecture/thinking/data-algorithm-view-separation',
            },
            {
              id: '7vSTvvhTv_CRFphgHA_HU3id',
              text: 'shallowRef 范式与高性能架构',
              link: '/dev-knowledge/vue/architecture/thinking/shallowref-paradigm',
            },
            {
              id: '2AOuDMk4QL5HV9RqOUmXKofs',
              text: '无效渲染的元凶与根治',
              link: '/dev-knowledge/vue/architecture/thinking/render-chaos-root-cause',
            },
            {
              id: 'SHrmpVqt9g44MEm4YG9MKs9X',
              text: '渲染原理 × 事件调度 × 数据视图同步',
              link: '/dev-knowledge/vue/architecture/thinking/rendering-scheduling-sync',
            },
            {
              id: 'yFI4p_KcAc6j4uxs5KtNXgh3',
              text: '大型深层对象的按频率分频治理',
              link: '/dev-knowledge/vue/architecture/thinking/deep-object-frequency-governance',
            },
            {
              id: 'TO9ExYoi-tGxuequTlEufAFB',
              text: 'VNode 数据结构精讲',
              link: '/dev-knowledge/vue/architecture/thinking/vnode-data-structure',
            },
          ],
        },
        {
          text: '底层原理拆解',
          collapsed: true,
          items: [
            {
              id: 'qIHz-e_lbrfPmnOXt21NKhcu',
              text: 'Vue 3 响应式系统架构',
              link: '/dev-knowledge/vue/architecture/typical-analysis/vue-reactivity-system',
            },
            {
              id: 'gYXcE4eZYTMvdgnPjGSS7U1h',
              text: 'Vue 3 编译器优化原理',
              link: '/dev-knowledge/vue/architecture/typical-analysis/vue-compiler-optimization',
            },
            {
              id: 'juq3DSMJcp-vvS8eNqRjAyDa',
              text: 'Vue Router 4 底层原理',
              link: '/dev-knowledge/vue/architecture/typical-analysis/vue-router-internals',
            },
          ],
        },
      ],
    },
    {
      text: '面试知识库',
      collapsed: true,
      items: [
        {
          text: '初级 [P4-P5]',
          collapsed: true,
          items: [
            {
              id: '1ot9IOOLg2vKJ5anJwVHwHOx',
              text: 'Vue 3 入门：模板、组件、生命周期 [P4-P5]',
              link: '/dev-knowledge/vue/interview/junior/vue-basics',
            },
            {
              id: 'ty5GgVz1dZo4abVcLyl2iXeA',
              text: 'Vue 组件模式：Props、Emit、Slots [P4-P5]',
              link: '/dev-knowledge/vue/interview/junior/vue-component-patterns',
            },
          ],
        },
        {
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'sCN3TnCTzy76QUKE46GtR-SR',
              text: 'Vue 3 生命周期深入 [P5-P6]',
              link: '/dev-knowledge/vue/interview/intermediate/vue-lifecycle',
            },
            {
              id: 'GavSBXLDWPbBY-fHVFQ57RMR',
              text: 'Vue 组件通信方式全景 [P5-P6]',
              link: '/dev-knowledge/vue/interview/intermediate/vue-communication',
            },
            {
              id: 'kON_BC8lqCgY2UBhbvLDHq_H',
              text: 'Vue Router 路由实战 [P5-P6]',
              link: '/dev-knowledge/vue/interview/intermediate/vue-router-basics',
            },
          ],
        },
        {
          text: '高级 [P6-P7/P8]',
          collapsed: true,
          items: [
            {
              id: '38Bk7Ewz7RE1Dq5hDtAxMxL2',
              text: 'Vue 响应式系统底层 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/reactivity-deep',
            },
            {
              id: '3Dozt_5YTYgoedhZhlZrA33b',
              text: 'Vue 编译器优化 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/compiler-optimization',
            },
            {
              id: 'rDrlgs9FUtJeMnGz6i7O49PV',
              text: 'Vapor Mode 原理 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/vapor-mode',
            },
            {
              id: 'jfIrEws6dHSugY_qwkGxa3lk',
              text: '渲染器 Patch 流程与 Diff 算法 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/renderer-patch-flow',
            },
            {
              id: 'G-d3WPxfR75uI3QcV99lZ2pD',
              text: 'Vue 3.5+ 新特性与响应式重构 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/vue-3.5-new-features',
            },
            {
              id: 'rNh3Vc98OOPcduO6HTKpGuz4',
              text: 'Pinia 状态管理原理与实战 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/pinia-deep',
            },
            {
              id: 'jhcNa2AR9rGwLIoYm-TNS7LN',
              text: 'Vue Router 4 路由系统深度 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/vue-router-4',
            },
            {
              id: 'lzs9_UedncP1VtNKZ_NZRgS4',
              text: 'Nuxt 3 全栈框架原理与实战 [P8]',
              link: '/dev-knowledge/vue/interview/advanced/nuxt-3-fullstack',
            },
            {
              id: 'OqPXL8N2WahQODW_6ZtG7Nhu',
              text: 'Vue 3 生态实战模式 [P6-P7]',
              link: '/dev-knowledge/vue/interview/advanced/vue-ecosystem-patterns',
            },
          ],
        },
      ],
    },
    {
      text: '技术选型',
      collapsed: true,
      items: [
        {
          id: 'HT4bhn1D2I8G_E5MJ-cmjfkM',
          text: 'App 项目',
          link: '/dev-knowledge/vue/architecture/technology-selection/app-project',
        },
        {
          id: 'C-AagpGm_uwydAP7sCKdLpMx',
          text: '后端项目',
          link: '/dev-knowledge/vue/architecture/technology-selection/backend-project',
        },
        {
          id: '3b-AsUoYK44zklayS_8xI7nd',
          text: '客户端项目',
          link: '/dev-knowledge/vue/architecture/technology-selection/client-project',
        },
        {
          id: 'dQRj9pvWGNzYJD4VGZgEmaIJ',
          text: '桌面端项目',
          link: '/dev-knowledge/vue/architecture/technology-selection/desktop-project',
        },
        {
          id: 'JZ4vdWeSD_Wx9FBveCRRW6kB',
          text: '业务组件 SDK 打包',
          link: '/dev-knowledge/vue/architecture/technology-selection/sdk-project',
        },
        {
          id: 'DI-hGS4JGqfwH4WOpv-FyIdD',
          text: 'Electron + Vue 3 技术选型',
          link: '/dev-knowledge/vue/architecture/technology-selection/electron-vue3',
        },
      ],
    },
  ],
}
