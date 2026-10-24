/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── 跨域知识 ──
export const crossDomainSection = {
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
