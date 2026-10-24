/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['Vue', '架构']
 */

// 研发知识库侧边栏配置 — 按语言/框架优先组织

// ── Vue 体系 ──
const vueSection = {
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

// ── React 体系 ──
const reactSection = {
  text: 'React 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          text: '组件设计模式',
          collapsed: true,
          items: [
            {
              id: 'AFofBeLBGBaVpBDs7HDmwi1x',
              text: 'React 组件设计模式',
              link: '/dev-knowledge/react/architecture/component-patterns/react-component-design-patterns',
            },
            {
              id: '18zkkyDoKF0H2BOB6mC8vVg-',
              text: 'Error Boundary 与错误恢复',
              link: '/dev-knowledge/react/architecture/component-patterns/error-boundary-and-suspense',
            },
          ],
        },
        {
          text: 'Hooks 架构模式',
          collapsed: true,
          items: [
            {
              id: 'agy-NmNWHZKDGoEuAk9gZC3S',
              text: 'React Hooks 架构模式',
              link: '/dev-knowledge/react/architecture/hooks-patterns/react-hooks-architecture',
            },
            {
              id: 'yHnIr_RQYrUJmUNkw_4CuivO',
              text: '数据·算法·显示 三者分离',
              link: '/dev-knowledge/react/architecture/hooks-patterns/data-algorithm-view-separation',
            },
            {
              id: 'CA926s5iUe9LsJqr1S4yoJPM',
              text: 'React Ref 完全指南',
              link: '/dev-knowledge/react/architecture/hooks-patterns/react-ref-complete-guide',
            },
            {
              id: 'vpHnGtuOt3ZPMfwwySoih1WF',
              text: 'React Context 深度专题',
              link: '/dev-knowledge/react/architecture/hooks-patterns/react-context-deep-dive',
            },
          ],
        },
        {
          id: 'r8uugqqAaWRRYphVkGdHjp3A',
          text: '状态管理架构',
          link: '/dev-knowledge/react/architecture/state-management/react-state-management-architecture',
        },
        {
          id: 'Og_aKOHhwarLYSCaHd3tMn4d',
          text: 'React Router v6+ 路由架构',
          link: '/dev-knowledge/react/architecture/routing/react-router-architecture',
        },
        {
          text: '性能思考',
          collapsed: true,
          items: [
            {
              id: 'bEhQUpj3xRrdzlcThooItNAd',
              text: '大型单例对象高性能消费',
              link: '/dev-knowledge/react/architecture/performance/large-object-consumption',
            },
            {
              id: '3rtQpw6oq8VGircrY8564mv_',
              text: 'React 性能优化系统手册',
              link: '/dev-knowledge/react/architecture/performance/react-performance-optimization',
            },
          ],
        },
        {
          text: '研发思维',
          collapsed: true,
          items: [
            {
              id: '5adbQAa-oSA9z3QEPh58rD6x',
              text: '不必要 Re-render 的元凶与根治',
              link: '/dev-knowledge/react/architecture/thinking/unnecessary-rerender-root-cause',
            },
            {
              id: 'zDBtS1uQE2cJ1IUGPAvqRWYG',
              text: 'Fiber × 并发调度 × 数据视图同步',
              link: '/dev-knowledge/react/architecture/thinking/fiber-concurrent-sync-formula',
            },
            {
              id: 'Ofs0IrZZGhHliEcjAlHyGe3L',
              text: '大型深层对象的 zustand+selector+Immer 分频治理',
              link: '/dev-knowledge/react/architecture/thinking/deep-object-frequency-governance',
            },
          ],
        },
        {
          text: '底层原理拆解',
          collapsed: true,
          items: [
            {
              id: 'AJMxSNS9mSZrOFvVARXgrLNs',
              text: 'useEffect 原理',
              link: '/dev-knowledge/react/architecture/typical-analysis/use-effect',
            },
            {
              id: 'R1joyK7UGQTV0m5OLb2dpwWR',
              text: 'Hooks 执行阶段：Render vs Commit',
              link: '/dev-knowledge/react/architecture/typical-analysis/hooks-phase-timing',
            },
            {
              id: 'soHn6g5ZccPBgJw1ZWJk0hxx',
              text: 'Fiber Node 数据结构精讲',
              link: '/dev-knowledge/react/architecture/typical-analysis/fiber-node-data-structure',
            },
            {
              id: 'LlgdPnhmZHXq8ule5MdYLQYz',
              text: 'React 事件系统',
              link: '/dev-knowledge/react/architecture/typical-analysis/react-event-system',
            },
            {
              id: 'CUK7Gzgzec4GVST-l9SE1B9r',
              text: 'Fiber 架构与并发模式原理',
              link: '/dev-knowledge/react/architecture/typical-analysis/react-fiber-architecture',
            },
            {
              id: 'sNv9cdhWy67CdYniEjbJeVq-',
              text: 'Hooks 闭包陷阱与依赖追踪原理',
              link: '/dev-knowledge/react/architecture/typical-analysis/react-hooks-closure-trap',
            },
            {
              id: '6eliPJDqutxEb0RfSpKy_1Tx',
              text: 'Context 底层原理与性能陷阱',
              link: '/dev-knowledge/react/architecture/typical-analysis/react-context-internals',
            },
          ],
        },
        {
          text: '技术选型',
          collapsed: true,
          items: [
            {
              id: 'UPW63eWb-aXm1docdAvP-I4C',
              text: 'App 项目',
              link: '/dev-knowledge/react/architecture/technology-selection/app-project',
            },
            {
              id: '6FW5JXCu7qS6yD-FLnEo7sn7',
              text: '后端项目',
              link: '/dev-knowledge/react/architecture/technology-selection/backend-project',
            },
            {
              id: 'kUGZCfPkmuk-qqVg1ZewysiX',
              text: '客户端项目',
              link: '/dev-knowledge/react/architecture/technology-selection/client-project',
            },
            {
              id: 'epaF_1tsi_qOWqJhpP_7hamS',
              text: '桌面端项目',
              link: '/dev-knowledge/react/architecture/technology-selection/desktop-project',
            },
            {
              id: 'g75toUf0KdcYu280ibkMG4VE',
              text: 'Electron + React 技术选型',
              link: '/dev-knowledge/react/architecture/technology-selection/electron-react',
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
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'Oy2XqO1LbQc_4Lsp1dB8oE-K',
              text: 'React 入门：JSX、Hooks、组件模式 [P5-P6]',
              link: '/dev-knowledge/react/interview/intermediate/react-basics',
            },
          ],
        },
        {
          text: '高级 [P6-P7/P8]',
          collapsed: true,
          items: [
            {
              id: '_BrpbhUgrkG4M1GpNan7hf0y',
              text: 'Fiber 架构与优先级调度 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/fiber-architecture',
            },
            {
              id: 'F7YeniQV2zKhgoskA9BmZTpJ',
              text: '并发渲染与 Suspense [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/concurrent-rendering',
            },
            {
              id: 'JL4l0ikgoLjYHFJcqtpJUyn_',
              text: 'React Server Components 原理 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/server-components',
            },
            {
              id: 'evUT2Mvi8Aaktqbrkc7qo5k5',
              text: '状态管理本质与有限状态机 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/state-machine',
            },
            {
              id: 'FQ-_lYMmOlvhy6StMl95NhvP',
              text: 'React 19 新特性深度解析 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/react-19-features',
            },
            {
              id: 'Rd7GV_XZb4q-MdOkPhQalZcs',
              text: 'React Compiler 原理与实践 [P8]',
              link: '/dev-knowledge/react/interview/advanced/react-compiler',
            },
            {
              id: 'qiIIRu9lymeurfGaJ1BuTjL6',
              text: 'Zustand/Jotai 状态管理深度 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/zustand-and-jotai',
            },
            {
              id: '1CpHo72NidT3sAX3kLk4C0Kw',
              text: 'TanStack Query 数据获取与缓存 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/tanstack-query',
            },
            {
              id: 'FYit0dquzPQf5SqLdY4OrzRM',
              text: 'Next.js 15 全栈框架原理 [P8]',
              link: '/dev-knowledge/react/interview/advanced/nextjs-15',
            },
            {
              id: 'rCNQaNvdX4NLVKdRimFrrnGg',
              text: 'React Hook Form + Zod 表单体系 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/react-hook-form-and-zod',
            },
            {
              id: 'uho-Tb7AARLjpS45V927slNF',
              text: 'Testing Library + MSW 测试体系 [P6-P7]',
              link: '/dev-knowledge/react/interview/advanced/react-testing-library',
            },
            {
              id: 'eDhvjsNQLR3qifv6BpkYNE73',
              text: 'React 生态架构模式 [P8]',
              link: '/dev-knowledge/react/interview/advanced/react-architecture-patterns',
            },
          ],
        },
      ],
    },
  ],
}

// ── Flutter 体系 ──
const flutterSection = {
  text: 'Flutter 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: 'KbBCv62gFVzrycd3XvOO_3TP',
          text: '状态管理架构选型',
          link: '/dev-knowledge/flutter/architecture/state-management/flutter-state-management-architecture',
        },
        {
          id: 'jK4lM8nO9pQrStUvWxYzAb',
          text: 'GetX 模块化架构与路由守卫',
          link: '/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards',
        },
        {
          id: 'uHcM_T2B52yVU-u-GjENoQI0',
          text: '路由架构设计',
          link: '/dev-knowledge/flutter/architecture/routing/flutter-routing-architecture',
        },
        {
          id: '7Uu_qlN-TJ-WqqrOlSsH2Fnc',
          text: '网络层架构设计',
          link: '/dev-knowledge/flutter/architecture/networking/flutter-network-architecture',
        },
        {
          id: 'mN3pQ7rT7vWxYzAbCdEfGh',
          text: 'Dio 拦截器链与 Token 无感刷新',
          link: '/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh',
        },
        {
          id: 'isSEc6XtrCeB1vPoZaaeJx7p',
          text: '项目结构与分层规范',
          link: '/dev-knowledge/flutter/architecture/project-structure/flutter-project-structure',
        },
        {
          id: 'Bgc270M67VMEpOscZXHdzzHf',
          text: '渲染管线与 Impeller',
          link: '/dev-knowledge/flutter/architecture/rendering/flutter-rendering-pipeline',
        },
        {
          id: 'LpF1Wz_wLwzwICMW9gLR07oI',
          text: '性能优化实战',
          link: '/dev-knowledge/flutter/architecture/performance/flutter-performance-optimization',
        },
        {
          id: 'cD5eF6gH7iJ8kL9mN0oPqR',
          text: 'UI 适配·主题·加载状态设计',
          link: '/dev-knowledge/flutter/architecture/performance/flutter-ui-adaptation-theming-loading-states',
        },
        {
          id: 'HWDzZAuNvqSdv91bjRfEhf6c',
          text: '插件开发架构',
          link: '/dev-knowledge/flutter/architecture/plugin/flutter-plugin-architecture',
        },
        {
          text: '思考文档',
          collapsed: true,
          items: [
            {
              id: '-hyBAm5xogA7hMFLQXwR6Amb',
              text: '原生开发主流语言对比',
              link: '/dev-knowledge/flutter/architecture/thinking/native-languages-comparison',
            },
            {
              id: '-fW5fF51prhT6C9jqfbwVbnn',
              text: 'iOS 与 Android 必备知识',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-ios-android-knowledge',
            },
            {
              id: 'HVm3YZa2uTKGBCXNKBGbpAdD',
              text: 'APP 启动与屏幕渲染原理',
              link: '/dev-knowledge/flutter/architecture/thinking/app-launch-and-rendering-pipeline',
            },
            {
              id: 'cfzKvw7B0xKS3wTRciuLOFa6',
              text: '系统内核与平台差异适配',
              link: '/dev-knowledge/flutter/architecture/thinking/os-kernel-platform-differences',
            },
            {
              id: '8B28ShJQKM16_BXjjB6tbyU6',
              text: '网络层与弱网优化',
              link: '/dev-knowledge/flutter/architecture/thinking/mobile-network-layer',
            },
            {
              id: 'A-R-fVowDMq6YNjsd8Br2EDv',
              text: '内存管理与性能调优',
              link: '/dev-knowledge/flutter/architecture/thinking/memory-management-performance',
            },
            {
              id: 'Qhw_0pOrcA1fHAwdfWfVcj7E',
              text: '音视频与相机管线',
              link: '/dev-knowledge/flutter/architecture/thinking/audio-video-camera',
            },
            {
              id: 'K5Rl92RPC-6HiRthT3K5ZQKV',
              text: '数据·算法·显示 三者分离',
              link: '/dev-knowledge/flutter/architecture/thinking/data-algorithm-view-separation',
            },
            {
              id: 'rlIouQ8Dsr1HIVb83ZNNkrlj',
              text: '组件设计模式',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-component-design-patterns',
            },
            {
              id: 'L8HpzqpbDGjtE01xh4QNzDPg',
              text: 'setState 滥用与 Widget 重建失控',
              link: '/dev-knowledge/flutter/architecture/thinking/setstate-rebuild-chaos-root-cause',
            },
            {
              id: 'BHF7S0XNwLAHxncKTawqTW13',
              text: 'Widget × 帧调度 × 三层对象同步',
              link: '/dev-knowledge/flutter/architecture/thinking/widget-frame-sync-formula',
            },
            {
              id: 'yJkjUZ6K5zfVO5wfhnLBK3Sk',
              text: '大型深层对象的按频率分频治理',
              link: '/dev-knowledge/flutter/architecture/thinking/deep-object-frequency-governance-cn',
            },
            {
              id: 'l0gTibqpTdhNZn4yiu8FfMvr',
              text: '节点数据结构精讲：三棵树',
              link: '/dev-knowledge/flutter/architecture/thinking/element-widget-renderobject-tree',
            },
            {
              id: '93u6FYYBuUMhDs8AKUg3R0Xl',
              text: '存储与数据同步',
              link: '/dev-knowledge/flutter/architecture/thinking/storage-data-sync',
            },
            {
              id: '-wXH82X5rUl4u4GWscJU9Qtu',
              text: '安全攻防基础',
              link: '/dev-knowledge/flutter/architecture/thinking/mobile-security',
            },
            {
              id: 'khrv3JWx-4QXNKJ7g99e1dfo',
              text: '混合栈与模块化架构',
              link: '/dev-knowledge/flutter/architecture/thinking/hybrid-stack-modularization',
            },
            {
              id: 'lGYwyIS94_nINNZz1XDXcPTJ',
              text: 'CI/CD 与发布工程化',
              link: '/dev-knowledge/flutter/architecture/thinking/cicd-release-engineering',
            },
            {
              id: 'HLCXZsx12bscxu6bzHij-06z',
              text: '测试体系',
              link: '/dev-knowledge/flutter/architecture/thinking/testing-system',
            },
            {
              id: 'sT1uV2wX3yZ4aB5cD6eF7g',
              text: 'build_runner 代码生成工程化',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-build-runner-code-generation',
            },
            {
              id: 'hI8jK9lM0nO1pQ2rS3tU4v',
              text: '离线优先架构与分页加载',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-offline-first-and-pagination',
            },
            {
              id: 'wX5yZ6aB7cD8eF9gH0iJ1k',
              text: '全局错误处理与启动优化',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-error-handling-and-launch-optimization',
            },
            {
              id: 'lM2nO3pQ4rS5tU6vW7xY8z',
              text: 'slang 国际化方案',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-slang-i18n-solution',
            },
          ],
        },
        {
          text: '典型拆解',
          collapsed: true,
          items: [
            {
              id: 'aUG6KrqH31voEkF8JFWP_69a',
              text: 'GetX 框架底层设计原理',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/getx-reactive-system',
            },
            {
              id: 'vut3BJhl2AtM1q9mJvEVfQmi',
              text: 'Widget 重建与 Element 更新拆解',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-widget-rebuild',
            },
            {
              id: 'PIGJBdMMaqpkNVEZFcgxx_9R',
              text: 'Dart Future/Stream/Isolate 异步调度',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/dart-async-scheduling',
            },
            {
              id: 'LZsPzHC1MZ1CD_qZyTB3szK0',
              text: 'StatefulWidget 底层原理',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-stateful-widget-internals',
            },
            {
              id: 'kR7mNx2QwVpL9tYjHdF3sZ8a',
              text: 'WidgetsFlutterBinding 底层原理与启动全链路',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-binding-init-and-engine-bootstrap',
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
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'in6d1Hl_mssi1o6gqqIYwsOb',
              text: 'Dart 语言基础与核心特性 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-dart-basics',
            },
            {
              id: 'QKV18LLgycWkfAjy79HUk34q',
              text: 'Widget 体系与布局系统 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-widget-and-layout',
            },
            {
              id: 'dGXGFv1spj2oc4tDEtuPEAGj',
              text: '状态管理基础 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-state-management-basics',
            },
            {
              id: 'P-Uw6FmGQpTUhjVr0e0TVxOM',
              text: '导航与路由实战 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-navigation-and-routing',
            },
          ],
        },
        {
          text: '高级 [P6-P7/P8]',
          collapsed: true,
          items: [
            {
              id: 'j7rM9VOgk1uTN12yGhx_GPu5',
              text: '渲染引擎 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/rendering-engine',
            },
            {
              id: 'w9DX0zUy_RmeeENpVzCAPS-R',
              text: 'Dart 语言深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/dart-advanced',
            },
            {
              id: 'NmXVJAB3u6Z73UJ1gW1vwJJA',
              text: '状态管理架构 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/architecture-patterns',
            },
            {
              id: 'G0v8zUZoxOLs-8gpgbOEtpWb',
              text: '与原生交互 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/platform-interop',
            },
            {
              id: 'f_ZJMcefLeF1NqZn0SrRlqNH',
              text: '性能优化与工程化 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/performance-engineering',
            },
            {
              id: '3GxIoUUdsywHvEyMQ-JS_Jxr',
              text: 'Riverpod 状态管理深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/riverpod-deep',
            },
            {
              id: 'AoOEv_P4GbqgzZX6h90LztJY',
              text: 'BLoC/Cubit 架构模式 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/bloc-cubit-architecture',
            },
            {
              id: 'SgbKK2tFJ-aPBVU6ehcJ2pBY',
              text: 'GetX 生态体系 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/getx-ecosystem',
            },
            {
              id: 'FqUBIIsc32dgdMvsC8Wru5c7',
              text: 'GoRouter 路由管理深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/go-router-deep',
            },
            {
              id: 'GAgHctm4HfKkb9nI-WwIP4Q-',
              text: 'Dio 网络层与 HTTP 客户端 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/dio-and-networking',
            },
            {
              id: 'DssKXepkIEINRm-hBfmzqOpI',
              text: '本地存储与持久化 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/flutter-local-storage',
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
          text: '选型总览',
          link: '/dev-knowledge/flutter/architecture/technology-selection/',
          id: 'YjGY3Nh-jm4CAFZPuAnoxf7C',
        },
        {
          text: '状态管理选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/state-management',
          id: '9l3xUTzQgPKEZkFZlg0m7T8U',
        },
        {
          text: '路由导航选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/routing',
          id: 'EvohiaDNjja04qXuxTpNeWI3',
        },
        {
          text: '网络请求选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/networking',
          id: 'c1835YlsFeNgTrJOxzIyw-YI',
        },
        {
          text: '本地存储选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/storage',
          id: 'Cb16UoRc6oA-S7a4vpFZQH7W',
        },
      ],
    },
  ],
}

// ── JavaScript / TypeScript 体系 ──
const jsTsSection = {
  text: 'JS / TS 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计 · 典型拆解',
      collapsed: true,
      items: [
        {
          id: 'kO6UCEdk1rha6K4KV9OUMQOA',
          text: 'TypeScript 类型拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/typescript-type-analysis',
        },
        {
          id: 'rA9udWF5wwQaBV5VONkhjHje',
          text: 'Node.js 事件调度拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/nodejs-event-scheduling',
        },
        {
          id: '8jpruzE08DnJORpME6b90wec',
          text: '浏览器端 JS 调度拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/browser-js-scheduling',
        },
        {
          id: 'fiSVVWqF2Dxd6X7HVZBCIf-E',
          text: 'Promise/A+ 手写实现',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/promise-implementation',
        },
        {
          id: 'cMDL7J_dlxosVNwZWbw3e0-3',
          text: '原型链与继承拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/prototype-chain-and-inheritance',
        },
        {
          id: 'VckFdImfXejTKmAFXzMrhW8v',
          text: '虚拟 DOM Diff 算法',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/virtual-dom-diff',
        },
        {
          id: 'oSYkTg_vQz_QEmIz4N_zuELr',
          text: '响应式系统核心原理',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/reactive-system',
        },
        {
          id: 'XC-rS--Mh3XKnZeyyoyvGsmZ',
          text: '深拷贝全场景拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/deep-clone',
        },
        {
          id: 'AFw4gelpkEVB4vIUYsfdZ7JC',
          text: '前端路由系统实现',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/frontend-router',
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
              id: '-8Ksefqf4tkT7hwGUQRIj8Q6',
              text: 'JavaScript 基础：变量、类型、运算 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/js-basics',
            },
            {
              id: 'UItBDrfw2U9Rtr2KOnGcWUrV',
              text: '函数与作用域基础 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/functions-and-scope',
            },
            {
              id: 'YEEDCwCS-nltorVKGkBRoR3_',
              text: '对象与类基础 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/objects-and-classes',
            },
            {
              id: '7uONuDNKP_gqPNQ-J-Jeohtc',
              text: 'DOM 操作与事件处理 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/dom-and-events',
            },
            {
              id: 'cw_Z5xqtiTQKuYsB1tfHNj59',
              text: 'TypeScript 入门：类型注解 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/typescript-basics',
            },
          ],
        },
        {
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'F4VxPMbplonlBcXGir85BSRW',
              text: '闭包、作用域链与执行上下文 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/js-closures-context',
            },
            {
              id: 'nXuLnjEeFAwes6mQntpEkvhl',
              text: 'ES6+ 模块系统与工程化 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/es6-modules',
            },
            {
              id: 'jGIyz_l6Y6fBN52EEMS7fTjd',
              text: 'JavaScript 常用设计模式 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/js-design-patterns',
            },
          ],
        },
        {
          text: 'JavaScript 深度 [P6-P7]',
          collapsed: true,
          items: [
            {
              id: '7FcTxvyZBydnGCbzkm5cQoxu',
              text: 'V8 引擎与 JavaScript 运行时 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/engine-and-runtime',
            },
            {
              id: 'gnorY4RZxUOKwykn2ioHkANp',
              text: 'Node.js 运行时 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/nodejs-runtime',
            },
            {
              id: 'yFqASUX54rzj7s_cT9mVYLsZ',
              text: 'JavaScript 类型系统深层 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/type-system-deep',
            },
            {
              id: 'TgGwpjj5SXvzYLmB7Ra6JSl-',
              text: '异步编程模型演进 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/async-model',
            },
            {
              id: 'H2u9GDIVRhFh97F-lyNjerIZ',
              text: 'GC 算法与内存管理 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/gc-and-memory',
            },
            {
              id: '62rt3B2SWG3BEPh3K5eVjdax',
              text: '原型链本质与元编程 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/prototype-and-oop',
            },
            {
              id: '-NSuUpm2IdWaXYyJn0Y7UFHx',
              text: 'ES2025/2026 新特性 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/es2025-2026',
            },
          ],
        },
        {
          text: 'TypeScript 高阶',
          collapsed: true,
          items: [
            {
              id: 'lVGwkawU2L-vH4CSmKW0p0jv',
              text: '高级类型体操 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/typescript/type-challenges',
            },
            {
              id: 'RWRfyoRtAo4F7ZGdVNEu_zfs',
              text: 'TypeScript 编译器架构 [P8]',
              link: '/dev-knowledge/js-ts/interview/typescript/compiler-internals',
            },
            {
              id: 'Ub4w0Hzgi2rzNFbYqP_iBmHU',
              text: '类型系统设计哲学 [P8]',
              link: '/dev-knowledge/js-ts/interview/typescript/type-system-design',
            },
            {
              id: 'VSA0v1QWEeL1ulrWdbEpi9In',
              text: 'TypeScript 5.x 新特性 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/typescript/ts5-new-features',
            },
          ],
        },
      ],
    },
  ],
}

// ── Node.js 体系 ──
const nodejsSection = {
  text: 'Node.js 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: '7wIutCbmNfPBY7Rq138Yko4A',
          text: '项目架构与分层规范',
          link: '/dev-knowledge/nodejs/architecture/project-architecture/nodejs-project-architecture',
        },
        {
          id: 'mSm7341KdjaElDSdzCEVwghS',
          text: '框架架构选型',
          link: '/dev-knowledge/nodejs/architecture/framework-selection/nodejs-framework-selection',
        },
        {
          id: '1-scn9M2HBhjgtw-xeJzXCw8',
          text: '中间件与管道架构',
          link: '/dev-knowledge/nodejs/architecture/middleware-patterns/nodejs-middleware-patterns',
        },
      ],
    },
    {
      text: '面试知识库 [P6-P7]',
      collapsed: true,
      items: [
        {
          id: '30DSzuswZmc9NJi5FaRqOBj1',
          text: '构建工具链演进',
          link: '/dev-knowledge/nodejs/interview/advanced/build-toolchain',
        },
        {
          id: '8y5-H_PDc6BKt-rWt-NCA5tc',
          text: 'Monorepo 架构设计 [P8]',
          link: '/dev-knowledge/nodejs/interview/advanced/monorepo-architecture',
        },
        {
          id: '7THpPiaAMhkRref1Q-hf9HU9',
          text: '微前端方案对比 [P8]',
          link: '/dev-knowledge/nodejs/interview/advanced/micro-frontend',
        },
        {
          id: 'DswTcN0VbZaOX47X8NF5jV32',
          text: '性能预算体系',
          link: '/dev-knowledge/nodejs/interview/advanced/performance-budget',
        },
        {
          id: 'xA1La8d66plIqrH8ic7mD9Gq',
          text: 'Node.js Web 框架对比',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-web-framework',
        },
        {
          id: 'EAeWOXukZZJ1DAXH2dCi8BjJ',
          text: 'Node.js 数据库与 ORM',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-database-orm',
        },
        {
          id: 'LIlwiTESLWx_E-2tfKOHxD1T',
          text: 'Node.js 部署与运维',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-deploy-ops',
        },
      ],
    },
  ],
}

// ── Python 体系 ──
const pythonSection = {
  text: 'Python 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: 'wsnitjiF85ksXTCIg_3yy9-y',
          text: 'Python 项目工程化实践',
          link: '/dev-knowledge/python/architecture/engineering/python-engineering-practices',
        },
        {
          id: 'ITiSVHYAz4NWfQ_u4Bd_Gfvx',
          text: 'Python 后端框架技术选型',
          link: '/dev-knowledge/python/architecture/technology-selection/python-backend-framework-selection',
        },
        {
          id: 'MQeLTmqoA0Ajx_xtq52NuRN4',
          text: 'Python AI 开发架构指南',
          link: '/dev-knowledge/python/architecture/ai-architecture/python-ai-development-guide',
        },
      ],
    },
  ],
}

// ── 跨域知识 ──
const crossDomainSection = {
  text: '跨域知识',
  collapsed: false,
  items: [
    {
      text: '通用基础',
      collapsed: true,
      items: [
        {
          id: 'MliV2FVS1M5SGCElBX-jy0bR',
          text: '前端渲染模式全解',
          link: '/dev-knowledge/cross-domain/general-fundamentals/frontend-rendering-modes',
        },
        {
          id: 'Y4-UFeJQlOoaKrBB8Zx6ube9',
          text: '网络通用知识',
          link: '/dev-knowledge/cross-domain/general-fundamentals/network-fundamentals',
        },
        {
          id: 'nuHqxG_feLtvWQB6lLD22mTt',
          text: 'Chrome 开发者工具全解',
          link: '/dev-knowledge/cross-domain/general-fundamentals/chrome-devtools',
        },
        {
          id: 'Yjsx2VyS0UhBYCkwcVsVunsB',
          text: '系统内核与 CPU 架构',
          link: '/dev-knowledge/cross-domain/general-fundamentals/os-kernel-cpu-architecture',
        },
        {
          id: 'zhU8WLuufgTpd_TS8cpecQa3',
          text: 'Linux 目录结构',
          link: '/dev-knowledge/cross-domain/general-fundamentals/linux-directory-structure',
        },
        {
          id: 'n4-cMrm770aiE3vPbyQhXSts',
          text: '国内开发镜像设置与还原',
          link: '/dev-knowledge/cross-domain/general-fundamentals/dev-mirror-setup',
        },
        {
          id: 'Xol_6HFr_8Tmuw66MZhf0yn3',
          text: '构建优化核心概念',
          link: '/dev-knowledge/cross-domain/general-fundamentals/build-optimization-concepts',
        },
        {
          id: 'i2FSa5ytqWGYqKuo7GoQqwlh',
          text: 'Rolldown 与 Oxc',
          link: '/dev-knowledge/cross-domain/general-fundamentals/rolldown-and-oxc',
        },
        {
          id: 'JG0soMNv1D3rjtVNg6OomyHc',
          text: 'Signal 细粒度响应式',
          link: '/dev-knowledge/cross-domain/general-fundamentals/signal-reactivity',
        },
        {
          id: '33QWEm2o9E9pIIpGg6vzxNQ1',
          text: 'PostgreSQL vs MySQL + MongoDB',
          link: '/dev-knowledge/cross-domain/general-fundamentals/postgresql-vs-mysql-mongodb',
        },
        {
          id: 'fplLRLYtyOmF9GvZtaMPYl2S',
          text: 'HTML5 语义化 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/html-semantics',
        },
        {
          id: 'NbcHxF0JANobWR3B1p_vOYej',
          text: 'CSS 布局：Flexbox 与 Grid [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/css-layout',
        },
        {
          id: '1ub6Urqlo5BXTC9k9IIULSdE',
          text: '响应式设计与移动端适配 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/responsive-design',
        },
        {
          id: 'L_WBws0DW2I6UojzlbOss8NT',
          text: 'CSS 新特性：变量、动画、过渡 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/css-modern-features',
        },
        {
          id: '0qp4ey5mcc7uT6uztLE_bBxa',
          text: '浏览器基础与 DevTools [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/browser-basics',
        },
        {
          id: 'g3C03e8D4YB3TnRu9Rg0uBZq',
          text: 'HTTP 协议基础 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/http-basics',
        },
        {
          id: 'ASLmkJfHVxz3ROxAAvS4nicO',
          text: '本地存储与 Cookie [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/storage-and-cookie',
        },
        {
          id: 'vX8TwRExiv4RBTWoY-mg611T',
          text: 'Git 基础 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/git-basics',
        },
        {
          id: 'ppM-7-jKeU7rqzGmNf7LzhRN',
          text: 'npm/pnpm 包管理入门 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/npm-pnpm-basics',
        },
        {
          id: 'ZSkr8e2VnZPMUnVMieBXpjFD',
          text: '前端调试基础 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/debugging-basics',
        },
        {
          id: 'r8z4GCDOrR5Rs_LCmBmKrFbg',
          text: 'SPA 部署基础 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/spa-deploy-basics',
        },
        {
          id: 'SXF6BJxAQ6rFZ12OrtRD_0vL',
          text: '表单与验证基础 [P4-P5]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/form-validation-basics',
        },
        {
          id: 'DefrRzBLnphQ4-LHVmQallBo',
          text: 'CSS 架构：BEM/Modules/Tailwind [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/css-architecture',
        },
        {
          id: '6qfm7VUBElWVIoUhEjBTA-E7',
          text: 'CSS 预处理器：Sass/Less/PostCSS [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/css-preprocessors',
        },
        {
          id: 'AA1022K8PUOKk1KG_LllLOit',
          text: 'HTTP 缓存策略 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/http-caching',
        },
        {
          id: 'p3gusrqwcG-UvjAmKW_0l6gk',
          text: '前端网络优化 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/network-optimization',
        },
        {
          id: 'zlkudP7JO1wQCmjSirfYVYgb',
          text: '前端性能优化基础 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/performance-basics',
        },
        {
          id: 'xavn_AR0YSSwTN7jL1DX5HGs',
          text: 'Web 安全实战 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/web-security-practice',
        },
        {
          id: 'gttXDQGKl0OIhX_pQNIN15DH',
          text: 'Docker 容器化基础 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/docker-basics',
        },
        {
          id: 'oc6SudNVCysTDj8A7_92Utz5',
          text: '前端错误处理与监控 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/error-handling',
        },
        {
          id: '1T_L-cyeXl94QMJHF1SWO3JC',
          text: 'TypeScript 类型体操入门 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/ts-types-practice',
        },
        {
          id: 'REyrQwhiR4JVP_7jxm1LZniO',
          text: 'TypeScript 工程化实践 [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/ts-engineering',
        },
        {
          id: 'GIcm15Nw16391NYE66c6HfyN',
          text: '构建工具入门：Vite [P5-P6]',
          link: '/dev-knowledge/cross-domain/general-fundamentals/build-tools-basics',
        },
      ],
    },
    {
      text: '数据结构',
      collapsed: true,
      items: [
        {
          id: 'eAhnAv4m64JGc4-97vJEwrbo',
          text: '基础概念',
          link: '/dev-knowledge/cross-domain/data-structure/basic-concepts',
        },
        {
          id: 'hLmdQ-fIpv9sfS08E8VKkSai',
          text: '线性结构',
          link: '/dev-knowledge/cross-domain/data-structure/linear-structures',
        },
        {
          id: 'Nba765t4zTGR6bxXAu4UDeWF',
          text: '树形结构',
          link: '/dev-knowledge/cross-domain/data-structure/tree-structures',
        },
        {
          id: 'FZCRp0v8cMzYhsd6VLrMZxZ1',
          text: '图结构',
          link: '/dev-knowledge/cross-domain/data-structure/graph-structures',
        },
        {
          id: 'I8cmlZAcRxEfENmtkH45zphN',
          text: '哈希表与集合',
          link: '/dev-knowledge/cross-domain/data-structure/hash-structures',
        },
        {
          id: 'eiDdwp9oto_GD4rNhOcSU2I-',
          text: '高级数据结构',
          link: '/dev-knowledge/cross-domain/data-structure/advanced-structures',
        },
      ],
    },
    {
      text: '设计模式',
      collapsed: true,
      items: [
        {
          id: 'KWmngAtU5C3Zglsn_g8xB9jQ',
          text: '概述',
          link: '/dev-knowledge/cross-domain/design-patterns/overview',
        },
        {
          id: 'OftbUiQ7oLR-crBL8AczMQ5R',
          text: '创建型模式',
          link: '/dev-knowledge/cross-domain/design-patterns/creational',
        },
        {
          id: 'hsw4PbiWS_iHcxUaOSAuhw5j',
          text: '结构型模式',
          link: '/dev-knowledge/cross-domain/design-patterns/structural',
        },
        {
          id: 'Pq3w8nCtLIZt8tW-2GNNkLiB',
          text: '行为型模式',
          link: '/dev-knowledge/cross-domain/design-patterns/behavioral',
        },
      ],
    },
    {
      text: '浏览器与网络 [P6-P7]',
      collapsed: true,
      items: [
        {
          id: 'OcxOjh2iBKv4QSzguVDiU2JU',
          text: '浏览器渲染管线',
          link: '/dev-knowledge/cross-domain/browser-and-network/rendering-pipeline',
        },
        {
          id: 'YwedUq_OGQZTsB6i-Cqz7t7K',
          text: 'HTTP/3、WebTransport 与 QUIC',
          link: '/dev-knowledge/cross-domain/browser-and-network/http3-and-webtransport',
        },
        {
          id: 'nGcgMeAyYpJcBDG2HMCIeJqc',
          text: 'WebAssembly 在前端的应用',
          link: '/dev-knowledge/cross-domain/browser-and-network/wasm-frontend',
        },
        {
          id: 'H8-ZJ2JHIURR3rr17F2O14fg',
          text: '浏览器安全模型',
          link: '/dev-knowledge/cross-domain/browser-and-network/security-model',
        },
      ],
    },
    {
      text: '工程化实践',
      collapsed: true,
      items: [
        {
          id: 'GxVtIgmdhfDWSV2azN12P45x',
          text: '前端脚手架背后的脚本语言解析',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/frontend-scaffold-scripts',
        },
        {
          id: 'woqsIbjYneLSBj4o06jxayDO',
          text: '项目根目录配置文件解析',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/frontend-project-config-files',
        },
        {
          id: 'YEt1rCc5Pe9OeHIGdlcJgODq',
          text: 'Docker 镜像构建脚本对比',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/docker-image-build-script-comparison',
        },
        {
          id: '7Dv5hdCJfOeerLixqfDVU0xE',
          text: '包管理与 Monorepo 工具链',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/npm-pnpm-monorepo-toolchain',
        },
        {
          id: 'Qkfzo4-cOBqiX__PHN_xrvMF',
          text: '单仓 vs 多仓的选择',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/monorepo-vs-polyrepo',
        },
        {
          id: '5BhGRhx3PuNHtW4F5lwnTcQw',
          text: '常见 SaaS 平台功能',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/common-saas-platform-features',
        },
        {
          id: 'd5pydZhFDjXrOQXF1TS4Ji1U',
          text: '全栈基座项目（React）',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/fullstack-base-project-react',
        },
        {
          id: 'H73KXwMkj6dPxVRPwo99RmqC',
          text: '全栈基座项目（Vue）',
          link: '/dev-knowledge/cross-domain/engineering/architecture-docs/fullstack-base-project-vue',
        },
        {
          id: 'BipPU3mfoviNW2EHFyVZ0YS2',
          text: '设计系统与组件库架构 [P8]',
          link: '/dev-knowledge/cross-domain/engineering/interview/design-system',
        },
        {
          id: 'Xd0b3JcyZerDZxJLGxY2bzot',
          text: '前端 DevOps 与发布体系 [P8]',
          link: '/dev-knowledge/cross-domain/engineering/interview/frontend-devops',
        },
        {
          id: 'os1oxfinwG57b4xL8G0bQyvS',
          text: '前端测试金字塔实战 [P6-P7]',
          link: '/dev-knowledge/cross-domain/engineering/interview/testing-strategy',
        },
        {
          id: 'vkWZmRLeh6KZy1GrOFSvj-3R',
          text: 'Vite 核心原理与插件开发 [P6-P7]',
          link: '/dev-knowledge/cross-domain/engineering/interview/vite-internals',
        },
        {
          id: 'ua7sRCLycN5ZDC8KqYZaBwdF',
          text: '构建工具深度对比 [P8]',
          link: '/dev-knowledge/cross-domain/engineering/interview/build-tool-deep-comparison',
        },
        {
          id: 't3SQ5tz4I4qkkYw6hCKF1XYt',
          text: 'Vite 插件开发实战 [P6-P7]',
          link: '/dev-knowledge/cross-domain/engineering/interview/vite-plugin-development',
        },
        {
          id: 't2r4VZYDkSdv9WDoqSBPlzTe',
          text: 'Monorepo 构建优化 [P8]',
          link: '/dev-knowledge/cross-domain/engineering/interview/monorepo-build-optimization',
        },
        {
          id: 'wBva9hWkJptpXE4XFp9tbLmr',
          text: 'Rolldown 与构建工具未来 [P8]',
          link: '/dev-knowledge/cross-domain/engineering/interview/rolldown-and-future',
        },
      ],
    },
    {
      text: '架构愿景与系统设计',
      collapsed: true,
      items: [
        {
          id: 'vMy__yViVkqD4jiW3U2ZfGgZ',
          text: '架构愿景',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/architectural-vision-1',
        },
        {
          id: 'GfZpo5ULRJ1X72jYTSDZ58_j',
          text: '超一线科技公司大前端架构师视野',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/architect-vision-2',
        },
        {
          id: 'jl2OSq5zOei3dMRcfapoWISL',
          text: '闭环设计',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/closed-loop-1',
        },
        {
          id: 'MjM0OFQja__17xR8V395Y5J7',
          text: '影响分析',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/influence-1',
        },
        {
          id: 'ie0G2M5NjlTdB7KvAwicBdqr',
          text: '设计原则',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/principles-1',
        },
        {
          id: 'b-CrKeN3Zk07ozewQ92ydT72',
          text: '实施报告',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/report-1',
        },
        {
          id: 'XWZko5J2JkCc6KnUaa9SPRwq',
          text: '路线图',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/roadmap-1',
        },
        {
          id: 'Y6TKpvT2hTFeBqMvC7o65mhe',
          text: '检查清单',
          link: '/dev-knowledge/cross-domain/architecture-and-system/vision/checklist-1',
        },
        {
          id: 'cdQlRirX639qwz0x7NnPHUKn',
          text: '前端架构模式 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/architecture/frontend-architecture-patterns',
        },
        {
          id: '6Nv88OVMygvW0QQuf3H60-pr',
          text: '大型应用状态架构 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/architecture/state-architecture',
        },
        {
          id: 'uHdwKUOuI0cJ9MExkFbV1rs9',
          text: '模块联邦 V2 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/architecture/module-federation-v2',
        },
        {
          id: 'LobNRwCZiI5apdBA2W95KCWH',
          text: 'AI 能力集成架构 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/architecture/ai-integration-architecture',
        },
        {
          id: 'X8qLJMYXLM1N5ZcHB1sDLwTm',
          text: '客户端数据架构 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/architecture/client-data-architecture',
        },
        {
          id: 'HVoH0OdVkGhMXkEYYXsS4AqG',
          text: '实时协作系统设计 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/system-design/real-time-collaboration',
        },
        {
          id: 'HPfrsY-X2aaiSq6k78_5TXoY',
          text: '低代码平台架构 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/system-design/low-code-platform',
        },
        {
          id: 'eWT1ZdMRs_YpMAVgAfgGnxoc',
          text: 'Design Token 体系 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/system-design/design-token-system',
        },
        {
          id: '0b5JW1OmUfyz6o3kPGwCdfDu',
          text: '前端可观测性 [P8]',
          link: '/dev-knowledge/cross-domain/architecture-and-system/system-design/frontend-observability',
        },
      ],
    },
    {
      text: '跨框架研发思维',
      collapsed: true,
      items: [
        {
          id: 'L9bkfQZF-7OLu21yH7cWdsww',
          text: '技术名词深度解析索引',
          link: '/dev-knowledge/cross-domain/architecture-and-system/terminology-index',
        },
        {
          id: 'j4OYf7WTcPlyAuGKtyqnzQ8a',
          text: '跨框架研发思维对比',
          link: '/dev-knowledge/cross-domain/architecture-and-system/cross-framework-thinking-comparison',
        },
        {
          id: '_xhueKRX_CavM_eUhS3MEWn4',
          text: 'JS · Dart · Python 三大语言 API 对比',
          link: '/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-api-comparison',
        },
        {
          id: 'w6TLaUhcFXmxfVNhfTcLENKO',
          text: 'React 19 vs Vue 3 vs Flutter 性能对决',
          link: '/dev-knowledge/cross-domain/architecture-and-system/framework-performance-comparison',
        },
        {
          id: 'i_5lM8uzuGpesl2xnQyrQv7h',
          text: 'BUG 修复思维对比',
          link: '/dev-knowledge/cross-domain/architecture-and-system/bug-fixing-thinking',
        },
        {
          id: 'NDr8mR_mk_7YkALOChLZRt9T',
          text: '技术迭代与学习疲态',
          link: '/dev-knowledge/cross-domain/architecture-and-system/tech-iteration-and-learning-fatigue',
        },
        {
          id: 'ITeAx-Y4M8EEFyFpcYfoNIFl',
          text: '数据·算法·显示 三者分离（跨框架）',
          link: '/dev-knowledge/cross-domain/architecture-and-system/frontend-data-algorithm-view-separation',
        },
      ],
    },
    {
      text: '框架对比与选型',
      collapsed: true,
      items: [
        {
          id: '9y4QupKd-mfzfxMi401PVaje',
          text: 'Signals vs Virtual DOM [P6-P7]',
          link: '/dev-knowledge/cross-domain/framework-comparison/signal-vs-vdom',
        },
        {
          id: 'zNEvicdSAll-UgF6CMOURZH2',
          text: 'SSR/SSG/ISR 全栈方案对比 [P6-P7]',
          link: '/dev-knowledge/cross-domain/framework-comparison/ssr-fullstack-comparison',
        },
        {
          id: 'EtbEtNJDdJXZeYg5IhlOp7Rn',
          text: '2026 元框架趋势 [P8]',
          link: '/dev-knowledge/cross-domain/framework-comparison/meta-framework-trends',
        },
      ],
    },
    {
      text: 'AI 与新技术',
      collapsed: true,
      items: [
        {
          id: 'E2ZIBoxv-3GN4q6hSU6IpLJ7',
          text: 'AI 辅助开发工程化 [P6-P7]',
          link: '/dev-knowledge/cross-domain/ai-and-new-tech/ai-assisted-development',
        },
        {
          id: 'rD_h7n08ExU09kHJh-ZhGHKZ',
          text: 'LLM 前端集成 [P6-P7]',
          link: '/dev-knowledge/cross-domain/ai-and-new-tech/llm-frontend-integration',
        },
        {
          id: 'PmgbXLL3qW8QaWHWP7ug9_Cg',
          text: 'MCP 协议与 Tool Use [P6-P7]',
          link: '/dev-knowledge/cross-domain/ai-and-new-tech/mcp-and-tool-use',
        },
        {
          id: 'X1SWHKcbC2eulD-lAH99bvcx',
          text: 'Edge Computing 前端场景 [P8]',
          link: '/dev-knowledge/cross-domain/ai-and-new-tech/edge-computing',
        },
      ],
    },
    {
      text: 'API 与跨平台',
      collapsed: true,
      items: [
        {
          id: 'NKI5aBGugE-zK7iRJWfi3CeL',
          text: 'API 设计模式 [P8]',
          link: '/dev-knowledge/cross-domain/api-and-cross-platform/api-design-patterns',
        },
        {
          id: 'mPo_j7MGZsANacOfW4D0jJ0y',
          text: 'BFF 模式与 API 网关 [P8]',
          link: '/dev-knowledge/cross-domain/api-and-cross-platform/bff-and-gateway',
        },
        {
          id: 'lHtffp9n4GsKJCqAUscVNH1G',
          text: '跨端技术选型矩阵 [P8]',
          link: '/dev-knowledge/cross-domain/api-and-cross-platform/cross-platform-selection',
        },
        {
          id: '8GLRHs8U1XbBfxNzEdKQQfvk',
          text: '多端一致性方案 [P8]',
          link: '/dev-knowledge/cross-domain/api-and-cross-platform/multi-platform-consistency',
        },
      ],
    },
    {
      text: '技术管理 [TL]',
      collapsed: true,
      items: [
        {
          id: '7_ABrrHFydDUpvkThCBURTyU',
          text: '技术领导力',
          link: '/dev-knowledge/cross-domain/management/tech-leadership',
        },
        {
          id: '3RehZ-J2WmGLEZactnXBJ7Fh',
          text: '团队建设方法论',
          link: '/dev-knowledge/cross-domain/management/team-building',
        },
        {
          id: 'bJO-sB6nEEQUM_68EIOE23fW',
          text: '项目交付管理',
          link: '/dev-knowledge/cross-domain/management/project-delivery',
        },
        {
          id: 'zUNKSYBuWKVSh2AB-XTtu1Sn',
          text: '跨团队协作',
          link: '/dev-knowledge/cross-domain/management/cross-team-collaboration',
        },
        {
          id: 'BLYYGHgg7tpv_m5uP-S2fnQ0',
          text: '技术雷达与创新落地',
          link: '/dev-knowledge/cross-domain/management/tech-radar-and-innovation',
        },
      ],
    },
  ],
}

// ── 学习路径 ──
const learningPathsSection = {
  text: '学习路径导航',
  collapsed: false,
  items: [
    {
      id: 'iIBnp7w831B0xDF-gwsaUhz6',
      text: '初级工程师（P4-P5）',
      link: '/dev-knowledge/learning-paths/junior',
    },
    {
      id: '8t5Ar_hPd06rodt3sUPTfhn7',
      text: '中级工程师（P5-P6）',
      link: '/dev-knowledge/learning-paths/intermediate',
    },
    {
      id: 't_bOPLWCjxZsDId1piV-8xYP',
      text: '高级工程师（P6-P7）',
      link: '/dev-knowledge/learning-paths/senior',
    },
    {
      id: 'O4CwJq2yv3vr38SP4Rwd7FnU',
      text: '架构师（P8）',
      link: '/dev-knowledge/learning-paths/architect',
    },
    {
      id: 'Yfm5ZMq_XHuSURZW3dftDr8D',
      text: '技术主管（TL）',
      link: '/dev-knowledge/learning-paths/manager',
    },
    {
      id: 'YyNSeu8ggs4zKQ9pKoNDpipz',
      text: 'Flutter 学习路径',
      link: '/dev-knowledge/learning-paths/flutter',
    },
  ],
}

// ── 组装侧边栏 ──
export const devKnowledgeSidebar = {
  collapsed: false,
  items: [
    learningPathsSection,
    vueSection,
    reactSection,
    flutterSection,
    jsTsSection,
    nodejsSection,
    pythonSection,
    crossDomainSection,
  ],
}
