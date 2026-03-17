export const architecture_docs = [
  {
    category: '构建工具与生态',
    color: 'orange',
    items: [
      {
        name: 'Vite',
        url: 'https://cn.vitejs.dev',
        tag: 'Build',
        desc: '极速的前端构建工具，Vue3 的标准开发工具。',
      },
      {
        name: 'VueUse',
        url: 'https://vueuse.org',
        tag: 'Hooks',
        desc: '必装的组合式 API 工具库，提供数百个常用 hooks。',
      },
      {
        name: 'TypeScript',
        url: 'https://www.typescriptlang.org',
        tag: 'Type',
        desc: 'Vue3 开发的强力伙伴，提供完美的类型支持。',
      },
    ],
  },

  {
    category: '架构工程化 (Architecture & Tooling)',
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
        name: 'WebAssembly',
        url: 'https://webassembly.org',
        level: '前沿',
        desc: '高性能计算、音视频处理的前端终极方案。',
      },
    ],
  },
  {
    category: '安全与协议 (Security & Network)',
    icon: 'SecurityScanOutlined',
    tagColor: 'red',
    items: [
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
    category: '算法与通用技术 (Computer Science)',
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
  {
    category: '工程化与部署 (DevOps & Deployment)',
    icon: 'CloudServerOutlined',
    tagColor: 'blue',
    items: [
      {
        name: 'Docker Docs',
        url: 'https://docs.docker.com',
        tag: 'Container',
        desc: '容器化部署标准，实现开发与环境一致性。',
        priority: 5,
      },
      {
        name: 'Nginx Config',
        url: 'https://nginx.org',
        tag: 'Server',
        desc: '反向代理、负载均衡及静态资源缓存配置。',
        priority: 5,
      },
      {
        name: 'GitHub Actions',
        url: 'https://docs.github.com',
        tag: 'CI/CD',
        desc: '学习自动化流水线、构建、测试与自动发布。',
        priority: 4,
      },
      {
        name: 'Jenkins',
        url: 'https://www.jenkins.io',
        tag: 'CI/CD',
        desc: '老牌且强大的开源自动化服务器。',
        priority: 3,
      },
    ],
  },
]
