export const tab_name = '架构与设计'
export const order = 50
export const docs = [
  {
    category: '应用架构与模式',
    color: 'blue',
    items: [
      {
        name: 'Patterns.dev',
        url: 'https://www.patterns.dev',
        tag: 'Patterns',
        desc: '现代 Web 应用的设计模式、渲染模式与性能优化。',
      },
      {
        name: 'Micro Frontends',
        url: 'https://micro-frontends.org',
        tag: 'Architecture',
        desc: '微前端架构理念与集成方案深度解析。',
      },
      {
        name: 'System Design Primer',
        url: 'https://github.com/donnemartin/system-design-primer',
        tag: 'Design',
        desc: '学习如何设计可扩展的系统,架构师必经之路。',
      },
      {
        name: 'GraphQL',
        url: 'https://graphql.org',
        tag: 'API',
        desc: '用于 API 的查询语言,提供更精确的数据请求方式。',
      },
      {
        name: 'tRPC',
        url: 'https://trpc.io',
        tag: 'Type-Safe',
        desc: '端到端的类型安全 API,无需模式定义即可在前后端共享类型。',
      },
      {
        name: 'Clean Architecture',
        url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
        tag: 'Architecture',
        desc: 'Robert C. Martin 提出的整洁架构原则,关注业务逻辑独立性。',
      },
      {
        name: 'Domain-Driven Design',
        url: 'https://martinfowler.com/tags/domain%20driven%20design.html',
        tag: 'DDD',
        desc: '领域驱动设计,通过统一语言连接业务与技术团队。',
      },
      {
        name: 'Event-Driven Architecture',
        url: 'https://www.confluent.io/learn/event-driven-architecture/',
        tag: 'EDA',
        desc: '事件驱动架构,构建松耦合、高可扩展的分布式系统。',
      },
    ],
  },
  {
    category: '设计系统规范与理论',
    color: 'pink',
    items: [
      {
        name: 'Material Design',
        url: 'https://m3.material.io/',
        tag: 'Standard',
        desc: 'Google 出品的设计规范,跨端 UI 交互逻辑的深度参考。',
      },
      {
        name: 'Apple Human Interface Guidelines',
        url: 'https://developer.apple.com/design/human-interface-guidelines/',
        tag: 'iOS/macOS',
        desc: 'Apple 官方的人机界面指南,iOS 和 macOS 应用设计的金标准。',
      },
      {
        name: 'Design Systems Repo',
        url: 'https://designsystemsrepo.com/',
        tag: 'Resources',
        desc: '汇总了全球顶尖公司的设计系统(如 Carbon, Polaris),架构师的选型灵感库。',
      },
      {
        name: 'Atomic Design',
        url: 'https://atomicdesign.bradfrost.com/',
        tag: 'Methodology',
        desc: '原子化设计理念,将 UI 拆分为原子、分子、组织等层次。',
      },
      {
        name: 'Ant Design',
        url: 'https://ant.design/',
        tag: 'Enterprise',
        desc: '阿里巴巴出品的企业级 UI 设计语言和 React 组件库。',
      },
      {
        name: 'Fluent Design',
        url: 'https://fluent2.microsoft.design/',
        tag: 'Microsoft',
        desc: '微软 Fluent 设计系统,强调光感、深度、动效和材质。',
      },
    ],
  },
  {
    category: '运行时与底层原理',
    color: 'orange',
    items: [
      {
        name: 'V8 Blog',
        url: 'https://v8.dev',
        tag: 'Engine',
        desc: '深入理解 JavaScript 引擎优化、内存管理与垃圾回收。',
      },
      {
        name: 'Cloudflare Blog',
        url: 'https://blog.cloudflare.com',
        tag: 'Edge',
        desc: '研究边缘计算、网络安全与全球分发网络的前沿实践。',
      },
      {
        name: 'Node.js Design Patterns',
        url: 'https://nodejs-design-patterns.com',
        tag: 'Patterns',
        desc: 'Node.js 设计模式与最佳实践,构建可扩展的应用程序。',
      },
      {
        name: 'JavaScript Info',
        url: 'https://javascript.info/',
        tag: 'Deep Dive',
        desc: '现代 JavaScript 教程,从基础到高级主题的深入讲解。',
      },
      {
        name: 'Web Platform Docs',
        url: 'https://webplatform.github.io/docs/',
        tag: 'Standards',
        desc: 'Web 平台标准文档,了解浏览器如何实现 Web 技术。',
      },
    ],
  },
  {
    category: '组件治理与文档化',
    color: 'purple',
    items: [
      {
        name: 'Docusaurus',
        url: 'https://docusaurus.io/',
        tag: 'Docs',
        desc: 'Meta 出品,目前构建企业级技术文档与组件库说明书的首选方案。',
      },
      {
        name: 'Zeroheight',
        url: 'https://zeroheight.com/',
        tag: 'Platform',
        desc: '连接设计师与开发者的桥梁,管理设计令牌(Design Tokens)的专业平台。',
      },
      {
        name: 'Storybook Docs',
        url: 'https://storybook.js.org/docs/writing-docs/introduction',
        tag: 'Workshop',
        desc: '将 UI 组件开发与文档自动集成,实现"代码即文档"的工程化实践。',
      },
      {
        name: 'Figma',
        url: 'https://www.figma.com/',
        tag: 'Design Tool',
        desc: '基于浏览器的协作设计工具,现代 UI/UX 设计的行业标准。',
      },
      {
        name: 'Chromatic',
        url: 'https://www.chromatic.com/',
        tag: 'Visual Testing',
        desc: 'Storybook 的云端服务,提供可视化测试和 UI 审查功能。',
      },
      {
        name: 'Bit.dev',
        url: 'https://bit.dev/',
        tag: 'Component Hub',
        desc: '组件驱动开发平台,支持组件的独立开发、测试和发布。',
      },
    ],
  },
  {
    category: '安全与前沿协议',
    color: 'red',
    items: [
      {
        name: 'WebAssembly',
        url: 'https://webassembly.org',
        tag: 'WASM',
        desc: '高性能计算、音视频处理的前端终极方案。',
      },
      {
        name: 'OWASP Foundation',
        url: 'https://owasp.org',
        tag: 'Security',
        desc: 'Web 安全标准,防止 XSS、CSRF 等攻击。',
      },
      {
        name: 'HTTP/3 Spec',
        url: 'https://quicwg.org',
        tag: 'Protocol',
        desc: '下一代网络协议,深入了解 QUIC 与低延迟。',
      },
      {
        name: 'CORS Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
        tag: 'Security',
        desc: '跨域资源共享机制详解,解决前端跨域问题的核心知识。',
      },
      {
        name: 'Content Security Policy',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        tag: 'Security',
        desc: '内容安全策略,防止 XSS 和数据注入攻击的重要防线。',
      },
      {
        name: 'OAuth 2.0 & OIDC',
        url: 'https://oauth.net/',
        tag: 'Auth',
        desc: '开放授权标准,现代应用身份认证与授权的核心协议。',
      },
    ],
  },
  {
    category: '计算机科学基础',
    color: 'cyan',
    items: [
      {
        name: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org',
        tag: 'Type System',
        desc: '掌握大规模前端协作必备的类型编程艺术。',
      },
      {
        name: 'LeetCode',
        url: 'https://leetcode.cn',
        tag: 'Algorithm',
        desc: '算法思维是解决复杂业务逻辑的基础能力。',
      },
      {
        name: 'Web.dev',
        url: 'https://web.dev',
        tag: 'Performance',
        desc: 'Google 官方的 Web 核心指标 (Core Web Vitals) 指南。',
      },
      {
        name: 'Refactoring Guru',
        url: 'https://refactoring.guru',
        tag: 'Refactoring',
        desc: '设计模式与重构技术的可视化教程,提升代码质量。',
      },
      {
        name: 'Computer Science Basics',
        url: 'https://teachyourselfcs.com/',
        tag: 'CS Fundamentals',
        desc: '自学计算机科学核心课程的最佳路径和资源推荐。',
      },
      {
        name: 'Design Patterns',
        url: 'https://refactoring.guru/design-patterns',
        tag: 'Patterns',
        desc: '23 种经典设计模式的详细讲解与代码示例。',
      },
    ],
  },
  {
    category: '技术决策与知识沉淀',
    color: 'green',
    items: [
      {
        name: 'ADR Guide',
        url: 'https://adr.github.io/',
        tag: 'Governance',
        desc: '架构决策记录 (ADR) 标准,记录每一个重大技术选型的背景与权衡。',
      },
      {
        name: 'Mermaid.js',
        url: 'https://mermaid.live/',
        tag: 'Diagram',
        desc: '使用代码绘制流程图、序列图,是编写 RFC 文档的标配工具。',
      },
      {
        name: 'RFC Editor',
        url: 'https://www.rfc-editor.org/',
        tag: 'Standards',
        desc: '互联网技术标准文档库,了解 Web 技术演进的历史与规范。',
      },
      {
        name: 'Tech Radar',
        url: 'https://www.thoughtworks.com/radar',
        tag: 'Trends',
        desc: 'ThoughtWorks 技术雷达,洞察技术趋势和采纳建议。',
      },
      {
        name: 'Excalidraw',
        url: 'https://excalidraw.com',
        tag: 'Whiteboard',
        desc: '虚拟手绘风格白板,架构师绘制草图、流程图的极简神器。',
      },
    ],
  },
  {
    category: '可观测性与监控',
    color: 'teal',
    items: [
      {
        name: 'OpenTelemetry',
        url: 'https://opentelemetry.io/',
        tag: 'Observability',
        desc: '云原生可观测性框架,统一的追踪、指标和日志标准。',
      },
      {
        name: 'Prometheus',
        url: 'https://prometheus.io/',
        tag: 'Monitoring',
        desc: '开源监控系统,多维数据模型和强大的查询语言。',
      },
      {
        name: 'Grafana',
        url: 'https://grafana.com/',
        tag: 'Visualization',
        desc: '数据可视化和监控仪表盘,支持多种数据源。',
      },
      {
        name: 'Sentry',
        url: 'https://sentry.io/',
        tag: 'Error Tracking',
        desc: '实时错误追踪和性能监控,快速定位生产环境问题。',
      },
    ],
  },
]
