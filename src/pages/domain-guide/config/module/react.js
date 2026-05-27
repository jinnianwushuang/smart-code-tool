export const tab_name = 'React'
export const order = 20
export const docs = [
  {
    category: 'React 生态核心',
    color: 'blue',
    items: [
      {
        name: 'React',
        url: 'https://react.dev',
        tag: 'Core',
        desc: '用于构建用户界面的 JavaScript 库，引领了声明式编程范式。',
      },
      {
        name: 'Next.js',
        url: 'https://nextjs.org',
        tag: 'Framework',
        desc: '当前最流行的 React 全栈框架，支持 App Router 与多种渲染模式。',
      },
      {
        name: 'Remix',
        url: 'https://remix.run',
        tag: 'Framework',
        desc: '专注于 Web 标准和现代 HTTP 策略的全栈 UI 框架。',
      },
      {
        name: 'React RFCs',
        url: 'https://github.com/reactjs/rfcs',
        tag: 'Design',
        desc: '研究 React 未来特性的设计提案，理解技术背后的 Why。',
      },
    ],
  },
  {
    category: 'UI 组件方案',
    color: 'cyan',
    items: [
      {
        name: 'shadcn/ui',
        url: 'https://ui.shadcn.com',
        tag: 'Components',
        desc: '基于 Radix UI 和 Tailwind CSS 的组件集合，引领了“代码拷贝”而非依赖安装的 UI 整合新模式。',
      },
    ],
  },
  {
    category: 'Headless UI (无样式组件库)',
    color: 'purple',
    items: [
      {
        name: 'Radix UI',
        url: 'https://www.radix-ui.com',
        tag: 'Headless',
        desc: '高质量、无样式、完全无障碍的组件原语，shadcn/ui 的底层核心。',
      },
      {
        name: 'Headless UI',
        url: 'https://headlessui.com',
        tag: 'Headless',
        desc: '由 Tailwind Labs 开发，与 Tailwind CSS 深度集成的无头库。',
      },
      {
        name: 'React Aria',
        url: 'https://react-spectrum.adobe.com/react-aria/',
        tag: 'Hooks',
        desc: '来自 Adobe，提供完整的无障碍支持和高度定制化的 Hooks。',
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
    category: '数据流与逻辑处理',
    color: 'orange',
    items: [
      {
        name: 'TanStack Query',
        url: 'https://tanstack.com/query',
        tag: 'Async',
        desc: '强大的异步状态管理库，处理缓存、同步与更新。',
      },
      {
        name: 'Zustand',
        url: 'https://zustand-demo.pmnd.rs',
        tag: 'State',
        desc: '极致轻量、基于 Flux 原理的 React 状态管理方案。',
      },
    ],
  },
  {
    category: '动画与交互',
    color: 'pink',
    items: [
      {
        name: 'Framer Motion',
        url: 'https://www.framer.com/motion/',
        tag: 'Animation',
        desc: '为 React 准备的工业级动画库，声明式 API 极其优雅。',
      },
    ],
  },
]