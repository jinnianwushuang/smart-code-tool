export const tab_name = 'react'
export const order = 71
export const docs = [
  {
    category: 'React 生态与现代架构',
    color: 'cyan',
    brandColor: '#61dafb',

    items: [
      {
        name: 'React 官网',
        url: 'https://zh-hans.react.dev/',
        tag: 'Core',
        desc: '全新 Hooks 优先的官方文档，深度解析并发渲染 (Concurrent) 与服务端组件 (RSC)。',
        priority: 5,
      },
      {
        name: 'Next.js',
        url: 'https://www.nextjs.cn/',
        tag: 'Framework',
        desc: 'React 生产级框架之王，支持 App Router、全栈 API 路由与极致的 SEO 优化方案。',
        priority: 5,
      },
      {
        name: 'TanStack Query',
        url: 'https://tanstack.com',
        tag: 'Data Fetching',
        desc: '异步状态管理库，解决请求缓存、SWR 更新及复杂的服务器状态同步问题。',
        priority: 5,
      },
      {
        name: 'Framer Motion',
        url: 'https://www.framer.com',
        tag: 'Animation',
        desc: 'React 声明式动画库，让复杂的组件入场、手势交互与布局过渡变得极其简单。',
        priority: 4,
      },

      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        tag: 'Styling',
        desc: '原子类优先的 CSS 框架，与现代组件化开发完美契合，极大地提升了开发效率。',
        priority: 5,
      },
    ],
  },
  {
    category: 'React 主流 UI 组件库',
    color: 'blue',
    brandColor: '#61dafb',

    items: [
      {
        name: 'shadcn/ui',
        url: 'https://ui.shadcn.com',
        tag: 'Modern',
        desc: '当前最火的组件构建方式：非传统依赖包，而是代码所有权归你，基于 Radix UI 和 Tailwind。',
        priority: 5,
      },
      {
        name: 'Ant Design',
        url: 'https://ant.design',
        tag: 'Enterprise',
        desc: '全球使用最广的 React 中后台 UI 体系，拥有极度完善的设计规范与组件生态。',
        priority: 5,
      },
      {
        name: 'MUI (Material UI)',
        url: 'https://mui.com',
        tag: 'Standard',
        desc: '基于 Google Material Design 规范，世界级流行的 React 组件库，定制化能力极强。',
        priority: 5,
      },

      {
        name: 'Chakra UI',
        url: 'https://chakra-ui.com',
        tag: 'DX',
        desc: '简单、模块化且易于使用的组件库，通过 Props 直接控制样式，开发体验极佳。',
        priority: 4,
      },
      {
        name: 'NextUI',
        url: 'https://nextui.org',
        tag: 'Design',
        desc: '基于 Tailwind CSS 构建的现代感十足、动画丝滑的 UI 库，非常适合 C 端产品。',
        priority: 4,
      },
      {
        name: 'Headless UI',
        url: 'https://headlessui.com',
        tag: 'Unstyled',
        desc: '由 Tailwind 官方出品，完全无样式但包含完美交互逻辑的组件，适合深度自研 UI。',
        priority: 4,
      },
    ],
  },
]
