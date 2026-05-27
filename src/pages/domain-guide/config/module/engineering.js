export const tab_name = '工程化'
export const order = 40
export const docs = [
  {
    category: '现代构建工具',
    color: 'orange',
    items: [
      {
        name: 'Vite',
        url: 'https://cn.vitejs.dev',
        tag: 'Build',
        desc: '基于原生 ES 模块的极速前端构建工具。',
      },
      {
        name: 'esbuild',
        url: 'https://esbuild.github.io/',
        tag: 'Build',
        desc: '极快的 JavaScript 打包与压缩工具，基于 Go 编写。',
      },
      {
        name: 'tsup',
        url: 'https://tsup.egoist.dev/',
        tag: 'Build',
        desc: '基于 esbuild 的零配置 TypeScript 打包工具。',
      },
      {
        name: 'Rollup',
        url: 'https://rollupjs.org',
        tag: 'Build',
        desc: '下一代 ES 模块打包器，Vite 的生产环境构建核心。',
      },
      {
        name: 'SWC',
        url: 'https://swc.rs',
        tag: 'Build',
        desc: '基于 Rust 的极速 JavaScript/TypeScript 编译工具。',
      },
      {
        name: 'Rspack',
        url: 'https://www.rspack.dev/',
        tag: 'Build',
        desc: '字节跳动出品，兼容 Webpack 生态的 Rust 编写高性能打包工具。',
      },
      {
        name: 'Farm',
        url: 'https://www.farmfe.org/',
        tag: 'Build',
        desc: '极致性能的次世代增量构建引擎，真正实现秒级编译。',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        tag: 'CSS',
        desc: '只需编写 HTML 即可快速构建现代网站的实用程序优先 CSS 框架。',
      },
      {
        name: 'UnoCSS',
        url: 'https://unocss.dev',
        tag: 'CSS',
        desc: '即时按需的原子化 CSS 引擎，极致的性能与灵活性。',
      },
    ],
  },
  {
    category: '包管理与 Monorepo',
    color: 'cyan',
    items: [
      {
        name: 'pnpm',
        url: 'https://pnpm.io/',
        tag: 'Pkg',
        desc: '快速、节省磁盘空间的包管理器，现代项目的首选。',
      },
      {
        name: 'Deno',
        url: 'https://deno.com',
        tag: 'Runtime',
        desc: '原生支持 TS、极其安全的下一代 JavaScript 运行时。',
      },
      {
        name: 'Bun',
        url: 'https://bun.sh',
        tag: 'Runtime',
        desc: '集运行时、打包器、测试运行器和包管理器于一体的极速工具。',
      },
      {
        name: 'Turborepo',
        url: 'https://turbo.build/',
        tag: 'Monorepo',
        desc: '针对 JS/TS 代码库的高性能构建系统。',
      },
      {
        name: 'Nx',
        url: 'https://nx.dev/',
        tag: 'Monorepo',
        desc: '智能、快速、可扩展的构建系统，支持强大的依赖分析。',
      },
    ],
  },
  {
    category: '微前端架构方案',
    color: 'magenta',
    items: [
      {
        name: 'qiankun',
        url: 'https://qiankun.umijs.org/',
        tag: 'Framework',
        desc: '基于 single-spa 封装，目前国内应用最广泛、生态最成熟的微前端集成方案。',
      },
      {
        name: 'Module Federation',
        url: 'https://module-federation.io/',
        tag: 'Standard',
        desc: 'Webpack 5 引入的模块联邦，实现应用间的运行时代码共享，已支持 Vite。',
      },
      {
        name: 'single-spa',
        url: 'https://single-spa.js.org/',
        tag: 'Core',
        desc: '微前端领域的开路先锋，提供应用生命周期管理与路由分发的核心能力。',
      },
      {
        name: 'wujie (无界)',
        url: 'https://wujie-micro.github.io/doc/',
        tag: 'WebComponent',
        desc: '基于 WebComponent + iframe 隔离方案，解决极端的样式与脚本冲突问题。',
      },
      {
        name: 'MicroApp',
        url: 'https://micro-zoe.github.io/micro-app/',
        tag: 'WebComponent',
        desc: '京东出品，类 WebComponent 设计，接入成本极低且对原有代码侵入性小。',
      },
    ],
  },
  {
    category: 'Node.js 工具链开发',
    color: 'green',
    items: [
      {
        name: 'Commander',
        url: 'https://github.com/tj/commander.js/',
        tag: 'CLI',
        desc: 'Node.js 命令行界面的完整解决方案。',
      },
      {
        name: 'Execa',
        url: 'https://github.com/sindresorhus/execa',
        tag: 'CLI',
        desc: '专为人类设计的子进程管理工具。',
      },
    ],
  },
  {
    category: '研发流与质量控制',
    color: 'blue',
    items: [
      {
        name: 'ESLint',
        url: 'https://eslint.org',
        tag: 'Lint',
        desc: '代码检查工具，确保代码规范与质量。',
      },
      {
        name: 'Prettier',
        url: 'https://prettier.io',
        tag: 'Format',
        desc: '高度一致的代码格式化工具，支持多种语言。',
      },
      {
        name: 'Biome',
        url: 'https://biomejs.dev',
        tag: 'Toolchain',
        desc: '高性能的前端工具链，集成了格式化与校验功能。',
      },
      {
        name: 'Husky',
        url: 'https://typicode.github.io/husky/',
        tag: 'Workflow',
        desc: '现代化的 Git Hooks 管理工具。',
      },
      {
        name: 'lint-staged',
        url: 'https://github.com/lint-staged/lint-staged',
        tag: 'Workflow',
        desc: '针对 Git 暂存区文件运行 Lint 的利器。',
      },
      {
        name: 'Changesets',
        url: 'https://github.com/changesets/changesets',
        tag: 'Workflow',
        desc: '自动化版本管理与变更日志生成的工具。',
      },
    ],
  },
  {
    category: '测试与自动化验证',
    color: 'red',
    items: [
      {
        name: 'Vitest',
        url: 'https://vitest.dev',
        tag: 'Unit',
        desc: '由 Vite 驱动的极速单元测试框架，兼容 Jest API。',
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
    category: '开发工作坊与文档',
    color: 'pink',
    items: [
      {
        name: 'Storybook',
        url: 'https://storybook.js.org',
        tag: 'Workshop',
        desc: '用于隔离开发和测试 UI 组件的工业级环境。',
      },
    ],
  },
  {
    category: '平台工程与可观测性',
    color: 'cyan',
    items: [
      {
        name: 'Backstage',
        url: 'https://backstage.io',
        tag: 'IDP',
        desc: '由 Spotify 开源的开发者门户，大厂基础设施治理利器。',
      },
      {
        name: 'OpenTelemetry',
        url: 'https://opentelemetry.io',
        tag: 'Observability',
        desc: '全链路监控标准，架构师掌控应用健康度的眼睛。',
      },
    ],
  },
  {
    category: 'Web 性能监控与分析',
    color: 'yellow',
    items: [
      {
        name: 'Lighthouse',
        url: 'https://developer.chrome.com/docs/lighthouse/',
        tag: 'Audit',
        desc: 'Google 开源的自动化工具，用于提升网页质量（性能、可访问性、SEO）。',
      },
      {
        name: 'PageSpeed Insights',
        url: 'https://pagespeed.web.dev/',
        tag: 'Analysis',
        desc: '基于 Lighthouse 和 CrUX 数据，分析网页性能并提供针对性的优化建议。',
      },
      {
        name: 'WebPageTest',
        url: 'https://www.webpagetest.org/',
        tag: 'Deep Dive',
        desc: '提供极其详尽的性能分析报告，包括瀑布图、视频回放及多地区网络模拟。',
      },
      {
        name: 'web-vitals',
        url: 'https://github.com/GoogleChrome/web-vitals',
        tag: 'Library',
        desc: '用于衡量真实用户核心网页指标 (Core Web Vitals) 的标准 JS 库。',
      },
      {
        name: 'Sentry Performance',
        url: 'https://sentry.io/for/performance/',
        tag: 'Monitoring',
        desc: '实时性能监控平台，能够追踪 LCP、FID、CLS 等指标并定位异常事务。',
      },
    ],
  },
  {
    category: '安全合规与代码审计',
    color: 'red',
    items: [
      {
        name: 'Snyk',
        url: 'https://snyk.io/',
        tag: 'Security',
        desc: '自动扫描依赖库漏洞，架构师在 CI/CD 阶段必须设置的安全红线。',
      },
      {
        name: 'SonarQube',
        url: 'https://www.sonarqube.org/',
        tag: 'Audit',
        desc: '工业级代码质量审计平台，追踪技术债、覆盖率与安全隐患。',
      },
      {
        name: 'FOSSA',
        url: 'https://fossa.com/',
        tag: 'Compliance',
        desc: '自动化开源许可（License）合规管理，规避企业法律风险。',
      },
    ],
  },
  {
    category: '自动化部署 (DevOps)',
    color: 'purple',
    items: [
      {
        name: 'Docker Docs',
        url: 'https://docs.docker.com',
        tag: 'Container',
        desc: '容器化部署标准，实现开发与环境一致性。',
      },
      {
        name: 'GitHub Actions',
        url: 'https://docs.github.com/en/actions',
        tag: 'CI/CD',
        desc: '学习自动化流水线、构建、测试与自动发布。',
      },
    ],
  },
]