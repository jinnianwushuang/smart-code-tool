export const tab_name = '架构 & 通用'
export const order = 50
export const docs = [
  {
    category: '应用架构与模式',
    icon: 'RocketOutlined',
    tagColor: 'blue',
    items: [
      {
        name: 'Patterns.dev',
        url: 'https://www.patterns.dev',
        level: '架构',
        desc: '现代 Web 应用的设计模式、渲染模式与性能优化。',
      },
      {
        name: 'Micro Frontends',
        url: 'https://micro-frontends.org',
        level: '架构',
        desc: '微前端架构理念与集成方案深度解析。',
      },
      {
        name: 'System Design Primer',
        url: 'https://github.com/donnemartin/system-design-primer',
        level: '核心',
        desc: '学习如何设计可扩展的系统，架构师必经之路。',
      },
      {
        name: 'GraphQL',
        url: 'https://graphql.org',
        level: 'Protocol',
        desc: '用于 API 的查询语言，提供更精确的数据请求方式。',
      },
      {
        name: 'tRPC',
        url: 'https://trpc.io',
        level: 'Architecture',
        desc: '端到端的类型安全 API，无需模式定义即可在前后端共享类型。',
      },
    ],
  },
  {
    category: '运行时与底层原理',
    icon: 'ClusterOutlined',
    tagColor: 'orange',
    items: [
      {
        name: 'V8 Blog',
        url: 'https://v8.dev',
        level: '底层',
        desc: '深入理解 JavaScript 引擎优化、内存管理与垃圾回收。',
      },
      {
        name: 'Cloudflare Blog',
        url: 'https://blog.cloudflare.com',
        level: '基础设施',
        desc: '研究边缘计算、网络安全与全球分发网络的前沿实践。',
      },
    ],
  },
  {
    category: '安全与前沿协议',
    icon: 'SecurityScanOutlined',
    tagColor: 'red',
    items: [
      {
        name: 'WebAssembly',
        url: 'https://webassembly.org',
        level: '前沿',
        desc: '高性能计算、音视频处理的前端终极方案。',
      },
      {
        name: 'OWASP Foundation',
        url: 'https://owasp.org',
        level: '安全',
        desc: 'Web 安全标准，防止 XSS、CSRF 等攻击。',
      },
      {
        name: 'HTTP/3 Spec',
        url: 'https://quicwg.org',
        level: '网络',
        desc: '下一代网络协议，深入了解 QUIC 与低延迟。',
      },
    ],
  },
  {
    category: '计算机科学基础',
    icon: 'CodeOutlined',
    tagColor: 'purple',
    items: [
      {
        name: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org',
        level: '进阶',
        desc: '掌握大规模前端协作必备的类型编程艺术。',
      },
      {
        name: 'LeetCode',
        url: 'https://leetcode.cn',
        level: '算法',
        desc: '算法思维是解决复杂业务逻辑的基础能力。',
      },
      {
        name: 'Web.dev',
        url: 'https://web.dev',
        level: '性能',
        desc: 'Google 官方的 Web 核心指标 (Core Web Vitals) 指南。',
      },
    ],
  },
]
