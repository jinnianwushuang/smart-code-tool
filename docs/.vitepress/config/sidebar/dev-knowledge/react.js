/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── React 体系 ──
export const reactSection = {
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
          text: '性能优化',
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
      ],
    },
    {
      text: '思考文档',
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
