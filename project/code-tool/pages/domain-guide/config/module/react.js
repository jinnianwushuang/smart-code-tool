export const tab_name = 'React'
export const order = 20
export const docs = [
  {
    category: '核心框架',
    color: 'blue',
    items: [
      {
        name: 'React',
        url: 'https://react.dev',
        tag: 'Core',
        desc: '用于构建用户界面的 JavaScript 库,引领了声明式编程范式。',
      },
      {
        name: 'Next.js',
        url: 'https://nextjs.org',
        tag: 'Framework',
        desc: '当前最流行的 React 全栈框架,支持 App Router 与多种渲染模式。',
      },
      {
        name: 'Remix',
        url: 'https://remix.run',
        tag: 'Framework',
        desc: '专注于 Web 标准和现代 HTTP 策略的全栈 UI 框架。',
      },
      {
        name: 'Expo',
        url: 'https://expo.dev',
        tag: 'React Native',
        desc: 'React Native 官方推荐的应用开发平台,提供开箱即用的工具链与构建服务。',
      },
      {
        name: 'React Router',
        url: 'https://reactrouter.com',
        tag: 'Router',
        desc: 'React 生态中最流行的声明式路由库,支持嵌套路由与数据加载。',
      },
      {
        name: 'React RFCs',
        url: 'https://github.com/reactjs/rfcs',
        tag: 'Design',
        desc: '研究 React 未来特性的设计提案,理解技术背后的 Why。',
      },
    ],
  },
  {
    category: 'UI 组件库',
    color: 'cyan',
    items: [
      {
        name: 'shadcn/ui',
        url: 'https://ui.shadcn.com',
        tag: 'Components',
        desc: '基于 Radix UI 和 Tailwind CSS 的组件集合,引领了"代码拷贝"而非依赖安装的 UI 整合新模式。',
      },
      {
        name: 'Radix UI',
        url: 'https://www.radix-ui.com',
        tag: 'Headless',
        desc: '高质量、无样式、完全无障碍的组件原语,shadcn/ui 的底层核心。',
      },
      {
        name: 'Headless UI',
        url: 'https://headlessui.com',
        tag: 'Headless',
        desc: '由 Tailwind Labs 开发,与 Tailwind CSS 深度集成的无头库。',
      },
      {
        name: 'React Aria',
        url: 'https://react-spectrum.adobe.com/react-aria/',
        tag: 'Hooks',
        desc: '来自 Adobe,提供完整的无障碍支持和高度定制化的 Hooks。',
      },
      {
        name: 'Ark UI',
        url: 'https://ark-ui.com',
        tag: 'Headless',
        desc: '基于 Zag.js 状态机驱动的跨框架无头组件库。',
      },
    ],
  },
  {
    category: '状态管理',
    color: 'orange',
    items: [
      {
        name: 'TanStack Query',
        url: 'https://tanstack.com/query',
        tag: 'Async',
        desc: '强大的异步状态管理库,处理缓存、同步与更新。',
      },
      {
        name: 'Zustand',
        url: 'https://zustand-demo.pmnd.rs',
        tag: 'State',
        desc: '极致轻量、基于 Flux 原理的 React 状态管理方案。',
      },
      {
        name: 'Redux Toolkit',
        url: 'https://redux-toolkit.js.org',
        tag: 'State',
        desc: 'Redux 官方推荐的标准工具集,简化 Redux 开发流程。',
      },
      {
        name: 'Jotai',
        url: 'https://jotai.org',
        tag: 'State',
        desc: '受 Recoil 启发的原子化状态管理库,极简且灵活。',
      },
      {
        name: 'Recoil',
        url: 'https://recoiljs.org',
        tag: 'State',
        desc: 'Facebook 出品的原子化状态管理库,专为 React 设计。',
      },
    ],
  },
  {
    category: '数据获取',
    color: 'teal',
    items: [
      {
        name: 'SWR',
        url: 'https://swr.vercel.app',
        tag: 'Data Fetching',
        desc: 'Vercel 出品的 React Hooks 数据请求库,支持自动缓存与重新验证。',
      },
      {
        name: 'Apollo Client',
        url: 'https://www.apollographql.com/docs/react/',
        tag: 'GraphQL',
        desc: '功能完整的 GraphQL 客户端,管理本地与远程数据。',
      },
      {
        name: 'Axios',
        url: 'https://axios-http.com',
        tag: 'HTTP',
        desc: '基于 Promise 的 HTTP 客户端,适用于浏览器和 Node.js。',
      },
    ],
  },
  {
    category: '表单处理',
    color: 'green',
    items: [
      {
        name: 'React Hook Form',
        url: 'https://react-hook-form.com',
        tag: 'Form',
        desc: '高性能、灵活的 React 表单库,减少不必要的重新渲染。',
      },
      {
        name: 'Formik',
        url: 'https://formik.org',
        tag: 'Form',
        desc: '流行的 React 表单管理库,提供简洁的 API。',
      },
      {
        name: 'Zod',
        url: 'https://zod.dev',
        tag: 'Validation',
        desc: 'TypeScript 优先的模式声明和验证库,常用于表单数据校验。',
      },
      {
        name: 'Yup',
        url: 'https://github.com/jquense/yup',
        tag: 'Validation',
        desc: 'JavaScript 对象模式解析和验证库,常与 Formik 配合使用。',
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
        name: 'Styled Components',
        url: 'https://styled-components.com',
        tag: 'CSS-in-JS',
        desc: '利用模板字面量语法为组件编写实际 CSS 代码。',
      },
      {
        name: 'Emotion',
        url: 'https://emotion.sh',
        tag: 'CSS-in-JS',
        desc: '高性能且灵活的 CSS-in-JS 库,支持对象和字符串样式。',
      },
    ],
  },
  {
    category: '动画效果',
    color: 'pink',
    items: [
      {
        name: 'Framer Motion',
        url: 'https://www.framer.com/motion/',
        tag: 'Animation',
        desc: '为 React 准备的工业级动画库,声明式 API 极其优雅。',
      },
      {
        name: 'React Spring',
        url: 'https://react-spring.dev',
        tag: 'Animation',
        desc: '基于物理的动画库,创建流畅自然的交互动画。',
      },
      {
        name: 'GSAP',
        url: 'https://gsap.com',
        tag: 'Animation',
        desc: '专业级 JavaScript 动画库,性能卓越且功能强大。',
      },
    ],
  },
  {
    category: '测试工具',
    color: 'red',
    items: [
      {
        name: 'React Testing Library',
        url: 'https://testing-library.com/docs/react-testing-library/intro/',
        tag: 'Testing',
        desc: '鼓励以用户视角编写测试,避免测试实现细节。',
      },
      {
        name: 'Vitest',
        url: 'https://vitest.dev',
        tag: 'Testing',
        desc: '由 Vite 驱动的极速单元测试框架,兼容 Jest API。',
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
        name: 'Recharts',
        url: 'https://recharts.org',
        tag: 'Chart',
        desc: '基于 D3 的 React 图表库,声明式组合 API。',
      },
      {
        name: 'Victory',
        url: 'https://commerce.nearform.com/open-source/victory/',
        tag: 'Chart',
        desc: '一组用于构建交互式数据可视化的 React 组件。',
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
        desc: '无头富文本编辑器框架,完全可定制且基于 ProseMirror。',
      },
      {
        name: 'Slate',
        url: 'https://docs.slatejs.org',
        tag: 'Editor',
        desc: '完全可定制的富文本编辑器框架,适合复杂场景。',
      },
    ],
  },
  {
    category: '拖拽交互',
    color: 'lime',
    items: [
      {
        name: 'dnd kit',
        url: 'https://dndkit.com',
        tag: 'DnD',
        desc: '现代化、轻量级、高性能的 React 拖拽工具包。',
      },
      {
        name: 'React Beautiful DnD',
        url: 'https://github.com/atlassian/react-beautiful-dnd',
        tag: 'DnD',
        desc: 'Atlassian 出品的美观且易用的拖拽库。',
      },
    ],
  },
  {
    category: '国际化',
    color: 'violet',
    items: [
      {
        name: 'react-i18next',
        url: 'https://react.i18next.com',
        tag: 'i18n',
        desc: '基于 i18next 的 React 国际化解决方案。',
      },
    ],
  },
  {
    category: '最佳实践',
    color: 'magenta',
    items: [
      {
        name: 'Taxonomy',
        url: 'https://github.com/shadcn-ui/taxonomy',
        tag: 'Next.js',
        desc: '由 shadcn 开发,展示了 Next.js App Router、RSC 和 Server Actions 的最佳实践。',
      },
      {
        name: 'Bulletproof React',
        url: 'https://github.com/alan2207/bulletproof-react',
        tag: 'Architecture',
        desc: '目前 GitHub 上最受推崇的 React 企业级项目架构参考指南。',
      },
    ],
  },
]
