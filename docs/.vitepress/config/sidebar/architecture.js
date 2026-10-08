/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['设计模式', '架构']
 */

// 架构文档侧边栏配置

// ── 架构愿景 ──
const architecturalVision = {
  text: '架构愿景',
  collapsed: true,
  items: [
    {
      text: '架构愿景',
      link: '/architecture-document/architectural-vision/architectural-vision-1',
      id: 'EKBVi9HeKb1VqdyA6hL_xDZD',
    },
    {
      id: 'IAND01o2TqdJ8icVDyd23t7O',
      text: '闭环设计',
      link: '/architecture-document/architectural-vision/closed-loop-1',
    },
    {
      id: 'lsUb7Cyzb-_MB0lN0W1qPvWG',
      text: '影响分析',
      link: '/architecture-document/architectural-vision/influence-1',
    },
    {
      id: 't2HwGHSArpXXL_10JrqZGEqo',
      text: '设计原则',
      link: '/architecture-document/architectural-vision/principles-1',
    },
    {
      id: 'zDgyi8QNBXFkht4-YU5CTwd9',
      text: '实施报告',
      link: '/architecture-document/architectural-vision/report-1',
    },
    {
      id: 'J2adGTYbBYDmEDWy9SkbmT3E',
      text: '路线图',
      link: '/architecture-document/architectural-vision/roadmap-1',
    },
    {
      id: 'M5BX5o_a0iKKa1u_smDRl7lm',
      text: '检查清单',
      link: '/architecture-document/architectural-vision/checklist-1',
    },
  ],
}

// ── Flutter 架构 ──
const flutter = {
  text: 'Flutter 架构',
  collapsed: true,
  items: [
    {
      text: '状态管理架构',
      items: [
        {
          text: 'Flutter 状态管理架构选型',
          link: '/architecture-document/flutter/state-management/flutter-state-management-architecture',
          id: '7EUMOUTWgqGx2XiGzGiz-fRW',
        },
      ],
    },
    {
      text: '路由架构设计',
      items: [
        {
          text: 'Flutter 路由架构设计',
          link: '/architecture-document/flutter/routing/flutter-routing-architecture',
          id: 'zoFtvjcqs72GN06QrznML6c7',
        },
      ],
    },
    {
      text: '网络层架构',
      items: [
        {
          text: 'Flutter 网络层架构设计',
          link: '/architecture-document/flutter/networking/flutter-network-architecture',
          id: 'nw3_PL5Fw3Oaueyax54xbjLj',
        },
      ],
    },
    {
      text: '项目结构规范',
      items: [
        {
          text: 'Flutter 项目结构与分层规范',
          link: '/architecture-document/flutter/project-structure/flutter-project-structure',
          id: '9SZMkG_F6867zlib6RuHx22d',
        },
      ],
    },
    {
      text: '思考文档',
      items: [
        {
          text: '平台认知',
          items: [
            {
              text: '原生开发主流语言对比',
              link: '/architecture-document/flutter/thinking/native-languages-comparison',
              id: 'HYt5KtSwqU_E4OPPoBahNHc2',
            },
            {
              text: 'iOS 与 Android 必备知识',
              link: '/architecture-document/flutter/thinking/flutter-ios-android-knowledge',
              id: 'Mg88cDSX_6xM1eFFWrEV2Mo9',
            },
            {
              text: 'APP 启动与屏幕渲染原理',
              link: '/architecture-document/flutter/thinking/app-launch-and-rendering-pipeline',
              id: '-S24gXWPhmH7Tj399DPiZ84K',
            },
            {
              text: '系统内核与平台差异适配',
              link: '/architecture-document/flutter/thinking/os-kernel-platform-differences',
              id: 'nUtLX1V72rx7KYFpy6-gnT-l',
            },
          ],
        },
        {
          text: '核心原理',
          items: [
            {
              text: '网络层与弱网优化',
              link: '/architecture-document/flutter/thinking/mobile-network-layer',
              id: 'R86oj_WdnZUWa3qWO2xPpRDY',
            },
            {
              text: '内存管理与性能调优',
              link: '/architecture-document/flutter/thinking/memory-management-performance',
              id: 'C-xTF7MBTopNgzC6Ymc7WXAt',
            },
            {
              text: '音视频与相机管线',
              link: '/architecture-document/flutter/thinking/audio-video-camera',
              id: 'KIQmUuAF6So_Hzoi9OLB8Wfk',
            },
            {
              text: '数据·算法·显示 三者分离',
              link: '/architecture-document/flutter/thinking/data-algorithm-view-separation',
              id: 'I1uaDO7rsgcYc34-Ay7c0Nve',
            },
            {
              text: '组件设计模式',
              link: '/architecture-document/flutter/thinking/flutter-component-design-patterns',
              id: 'o0RaaxqygCxL8gsK6w3ZO4R-',
            },
            {
              text: 'setState 滥用与 Widget 重建失控',
              link: '/architecture-document/flutter/thinking/setstate-rebuild-chaos-root-cause',
              id: 'pB86u79TwM9q-Qk2KfNFOQM3',
            },
            {
              text: 'Widget × 帧调度 × 三层对象同步',
              link: '/architecture-document/flutter/thinking/widget-frame-sync-formula',
              id: 'yB5b96FDlOpaQtriSXTPRLoO',
            },
            {
              text: '节点数据结构精讲：Widget·Element·RenderObject 三棵树',
              link: '/architecture-document/flutter/thinking/element-widget-renderobject-tree',
              id: 'FlNode1flutter_thinking_element',
            },
          ],
        },
        {
          text: '数据与安全',
          items: [
            {
              text: '存储与数据同步',
              link: '/architecture-document/flutter/thinking/storage-data-sync',
              id: 'ZTv9KTvKlytFZ8KdaMV_4n6I',
            },
            {
              text: '安全攻防基础',
              link: '/architecture-document/flutter/thinking/mobile-security',
              id: '0nnOmoF055jNvn20xzuoyT1-',
            },
          ],
        },
        {
          text: '工程实践',
          items: [
            {
              text: '混合栈与模块化架构',
              link: '/architecture-document/flutter/thinking/hybrid-stack-modularization',
              id: 'h6OzZKMo2NGOm8IAxx0FBKQm',
            },
            {
              text: 'CI/CD 与发布工程化',
              link: '/architecture-document/flutter/thinking/cicd-release-engineering',
              id: 'N9nckESxfmbdR0tyNpUcLSdQ',
            },
            {
              text: '测试体系',
              link: '/architecture-document/flutter/thinking/testing-system',
              id: 'B-3faNi_Bx5QWOOVRx_qnzLX',
            },
          ],
        },
      ],
    },
  ],
}

// ── Python 架构 ──
const python = {
  text: 'Python 架构',
  collapsed: true,
  items: [
    {
      text: '工程化实践',
      items: [
        {
          text: 'Python 项目工程化实践',
          link: '/architecture-document/python/engineering/python-engineering-practices',
          id: 'M7gC9Q1hgvTzM-NfXgNCKSpM',
        },
      ],
    },
    {
      text: '技术选型',
      items: [
        {
          text: 'Python 后端框架技术选型',
          link: '/architecture-document/python/technology-selection/python-backend-framework-selection',
          id: 'TzC-Xf_4I2CGv3X1vbT3qNvk',
        },
      ],
    },
    {
      text: 'AI 开发架构',
      items: [
        {
          text: 'Python AI 开发架构指南',
          link: '/architecture-document/python/ai-architecture/python-ai-development-guide',
          id: '_2waLSTPyA_x-hZ9HMvfqUu6',
        },
      ],
    },
  ],
}

// ── Node.js 架构 ──
const nodejs = {
  text: 'Node.js 架构',
  collapsed: true,
  items: [
    {
      text: '项目架构',
      items: [
        {
          text: 'Node.js 项目架构与分层规范',
          link: '/architecture-document/nodejs/project-architecture/nodejs-project-architecture',
          id: 'FEYEr9apr3_uXicXqs5Y9Y1H',
        },
      ],
    },
    {
      text: '框架选型',
      items: [
        {
          text: 'Node.js 框架架构选型',
          link: '/architecture-document/nodejs/framework-selection/nodejs-framework-selection',
          id: 'BBe9B5yNs1bU9OOegN-AINxx',
        },
      ],
    },
    {
      text: '中间件架构',
      items: [
        {
          text: 'Node.js 中间件与管道架构',
          link: '/architecture-document/nodejs/middleware-patterns/nodejs-middleware-patterns',
          id: '0iDgHBPrK0OeySxR6cCbznrX',
        },
      ],
    },
  ],
}

// ── React 架构 ──
const react = {
  text: 'React 架构',
  collapsed: true,
  items: [
    {
      text: '组件设计模式',
      items: [
        {
          text: 'React 组件设计模式',
          link: '/architecture-document/react/component-patterns/react-component-design-patterns',
          id: 'ztDSmYNxV_YTp-VqTR3OFPyZ',
        },
      ],
    },
    {
      text: 'Hooks 架构模式',
      items: [
        {
          text: 'React Hooks 架构模式',
          link: '/architecture-document/react/hooks-patterns/react-hooks-architecture',
          id: 'w5DKoU37dXlsaxAkqfILZv0S',
        },
        {
          text: '数据·算法·显示 三者分离',
          link: '/architecture-document/react/hooks-patterns/data-algorithm-view-separation',
          id: 'N71Sjioo3ZkPoULrvjDf8A9v',
        },
      ],
    },
    {
      text: '状态管理架构',
      items: [
        {
          text: 'React 状态管理架构',
          link: '/architecture-document/react/state-management/react-state-management-architecture',
          id: 'hqo96eLofwbJOHN9vezcwh9k',
        },
      ],
    },
    {
      text: '性能思考',
      items: [
        {
          text: '大型单例对象高性能消费',
          link: '/architecture-document/react/performance/large-object-consumption',
          id: 'zkqmNwzI0gz5MRW025OhlqAg',
        },
      ],
    },
    {
      text: '研发思维',
      items: [
        {
          text: '不必要 Re-render 的元凶与根治',
          link: '/architecture-document/react/thinking/unnecessary-rerender-root-cause',
          id: 'Nk-8CWPKQrqJ82Hqk1fLiJq2',
        },
        {
          text: 'Fiber × 并发调度 × 数据视图同步',
          link: '/architecture-document/react/thinking/fiber-concurrent-sync-formula',
          id: 'g_AvfJNasYLO6Af_ixLW0kjn',
        },
        {
          text: '大型深层对象的 zustand+selector+Immer 分频治理',
          link: '/architecture-document/react/thinking/deep-object-frequency-governance-cn',
          id: 'RANuzxeimpltF74mEzJdeExh',
        },
      ],
    },
    {
      text: '原理说明',
      items: [
        {
          id: 'qlpYU_1T0skJIghsrQJ04S7d',
          text: 'useEffect 原理',
          link: '/architecture-document/react/principle/use-effect',
        },
        {
          text: 'Hooks 执行阶段：Render vs Commit',
          link: '/architecture-document/react/principle/hooks-phase-timing',
          id: '6dh199RccRTzLXzMGnKESNWO',
        },
        {
          text: 'Fiber Node 数据结构精讲',
          link: '/architecture-document/react/principle/fiber-node-data-structure',
          id: 'FbNode1React_principle_fiber',
        },
      ],
    },
    {
      text: '技术选型',
      items: [
        {
          id: '-Im6F2jj_UN7Swx9ZiICEU3J',
          text: 'App 项目',
          link: '/architecture-document/react/technology-selection/app-project',
        },
        {
          text: '后端项目',
          link: '/architecture-document/react/technology-selection/backend-project',
          id: '4loNlErhavhYmtd5U3DyBYFx',
        },
        {
          text: '客户端项目',
          link: '/architecture-document/react/technology-selection/client-project',
          id: '7fHXnZc5IOED2YivtdEgUlHJ',
        },
        {
          text: '桌面端项目',
          link: '/architecture-document/react/technology-selection/desktop-project',
          id: 'sqqqHD8nC7LhSYrHXNOGboAu',
        },
        {
          text: 'Electron + React 技术选型',
          link: '/architecture-document/react/technology-selection/electron-react-technology-selection',
          id: 'bnmu4nYPS-Ovxs-6oE83NrgE',
        },
      ],
    },
  ],
}

// ── Vue 架构 ──
const vue = {
  text: 'Vue 架构',
  collapsed: true,
  items: [
    {
      text: '通用工具',
      items: [
        {
          id: '-IfxevXeW91Ix7iurjkAVEEB',
          text: '模块加载器',
          link: '/architecture-document/vue/general-tools/module-loader',
        },
        {
          text: 'Payload 包装器',
          link: '/architecture-document/vue/general-tools/wrap-with-payload',
          id: 'iwtfXQv_OVlW6knvxvQBOxMg',
        },
      ],
    },
    {
      text: '标准化模板',
      items: [
        {
          text: '架构概述',
          link: '/architecture-document/vue/standardized-template-cn/architecture-overview-cn',
          id: 'PGQj7CYKDaHUkNZLXH3sIhDb',
        },
        {
          text: 'LV1-LV5 架构演进',
          link: '/architecture-document/vue/standardized-template-cn/architecture-evolution-cn',
          id: '1rO_SGybaUNDCBHIQfsDMeGy',
        },
        {
          text: '装配器模式',
          link: '/architecture-document/vue/standardized-template-cn/assembler-pattern-cn',
          id: 'fI52Y7HTYCx1fVz61qdGn-Dn',
        },
        {
          text: '状态管理',
          link: '/architecture-document/vue/standardized-template-cn/state-management-cn',
          id: 'vNJnSq-wECg4rrpMo9Ut6EPb',
        },
        {
          text: '生命周期与副作用',
          link: '/architecture-document/vue/standardized-template-cn/lifecycle-and-effects-cn',
          id: '1sxE6TnlPc_4S64_SSTtrnyR',
        },
        {
          text: '事件管道系统',
          link: '/architecture-document/vue/standardized-template-cn/event-pipeline-system-cn',
          id: 'dHBMwDlD9WYKpuMM5RLo_ToQ',
        },
        {
          text: '组件系统',
          link: '/architecture-document/vue/standardized-template-cn/component-system-cn',
          id: 'hpD01zU5exHFzpzRN1eS0thR',
        },
        {
          text: 'API 请求与模块调用说明',
          link: '/architecture-document/vue/standardized-template-cn/api-request-and-module',
          id: 'qvvl493vNxrjfiuSCjVNS3Xd',
        },
        {
          text: '组件设计模式',
          link: '/architecture-document/vue/standardized-template-cn/vue-component-design-patterns',
          id: 'Ml1uIaxTfhaBK98i_eqNkLgD',
        },
      ],
    },

    {
      text: '研发思维',
      items: [
        {
          text: '数据·算法·显示 三者分离',
          link: '/architecture-document/vue/thinking/data-algorithm-view-separation-cn',
          id: 'qcaObjv4rjg4gFyVEjirmBGF',
        },
        {
          text: 'shallowRef 范式与高性能架构',
          link: '/architecture-document/vue/thinking/shallowRef-paradigm-high-performance',
          id: '1a6XCCAni-54Am-II7rQE3LI',
        },
        {
          text: '无效渲染的元凶与根治方案',
          link: '/architecture-document/vue/thinking/render-chaos-root-cause',
          id: 'yDSS93QX-w7PQRXKy14Zc6BM',
        },
        {
          text: '渲染原理 × 事件调度 × 数据视图同步',
          link: '/architecture-document/vue/thinking/rendering-scheduling-sync-formula',
          id: 'FzSHQz7EBBP_SLmvfziMmeY3',
        },
        {
          text: '大型深层对象的按频率分频治理',
          link: '/architecture-document/vue/thinking/deep-object-frequency-governance-cn',
          id: 'wd0l-6METxuqz8GfvD_YcckK',
        },
        {
          text: 'VNode 数据结构精讲',
          link: '/architecture-document/vue/thinking/vnode-data-structure',
          id: 'VuNode1vue_thinking_vnode',
        },
      ],
    },

    {
      text: '技术选型',
      items: [
        {
          id: 'zsD1qYeN3haxKPF_D48Vu2DF',
          text: 'App 项目',
          link: '/architecture-document/vue/technology-selection/app-project',
        },
        {
          text: '后端项目',
          link: '/architecture-document/vue/technology-selection/backend-project',
          id: 'JIpGALrKypcSj0tGWROjXvjD',
        },
        {
          text: '客户端项目',
          link: '/architecture-document/vue/technology-selection/client-project',
          id: '-U6mm7EVvPEc9twF1rT5cqNM',
        },
        {
          text: '桌面端项目',
          link: '/architecture-document/vue/technology-selection/desktop-project',
          id: '2rAhz04MpzDjUKT3qBikP3gK',
        },
        {
          text: '业务组件 SDK 打包',
          link: '/architecture-document/vue/technology-selection/sdk-project',
          id: 'tSxDmCD3EU6QOWNZXIFiGXbY',
        },
        {
          text: 'Electron + Vue 3 技术选型',
          link: '/architecture-document/vue/technology-selection/electron-vue3-technology-selection',
          id: 'bUYMb2Bg3hKRQnStuE_td8NA',
        },
      ],
    },
  ],
}

// ── 工程化 ──
const engineering = {
  text: '工程化',
  collapsed: true,
  items: [
    {
      text: '前端脚手架背后的脚本语言解析',
      link: '/architecture-document/engineering/job/frontend-scaffold-scripts',
      id: 'raQdA5ia_yYx-qKqeQQGOk0s',
    },
    {
      text: '项目根目录配置文件解析',
      link: '/architecture-document/engineering/job/frontend-project-config-files',
      id: '8OqI7DwhEMgZHp8XR4y8AZDg',
    },
    {
      text: 'Docker 镜像构建脚本对比',
      link: '/architecture-document/engineering/job/docker-image-build-script-comparison',
      id: 'u8yAD8a3dpo-EpfK1Nefx1x3',
    },
    {
      text: '包管理与 Monorepo 工具链',
      link: '/architecture-document/engineering/job/npm-pnpm-monorepo-toolchain',
      id: 'BC0uDGVKrp_knBR0KiqFICZk',
    },
    {
      text: '单仓 vs 多仓的选择',
      link: '/architecture-document/engineering/job/monorepo-vs-polyrepo',
      id: '137I4eWCVaOjw59CRPJywdUt',
    },
    {
      text: '常见 SaaS 平台功能',
      link: '/architecture-document/engineering/job/common-saas-platform-features',
      id: 'mamKtugLJU3-2_gKcVzu_aN-',
    },

    {
      text: '全栈基座项目（React）',
      link: '/architecture-document/engineering/job/fullstack-base-project-react',
      id: 'pYKcPE8rdattb1C6nxdVav7g',
    },

    {
      text: '全栈基座项目（Vue）',
      link: '/architecture-document/engineering/job/fullstack-base-project-vue',
      id: 'Y6AtCbwPmmYfYRQEywI_Jsl4',
    },
  ],
}

// ── 数据库 ──
const database = {
  text: '数据库',
  collapsed: true,
  items: [
    {
      text: 'PostgreSQL vs MySQL + MongoDB',
      link: '/architecture-document/database/postgresql-vs-mysql-mongodb',
      id: 'B1Z2Jp2sRvW1R_gg5kHBSyoh',
    },
  ],
}

// ── 通用知识 ──
const generalKnowledge = {
  text: '通用知识',
  collapsed: true,
  items: [
    {
      text: '前端渲染模式全解',
      link: '/architecture-document/general-knowledge/frontend-rendering-modes',
      id: '2ZI6JeS86oW6uu04_X4_uCHh',
    },
    {
      id: '9PnQqFj2P04pkHNxoFRp9iuY',
      text: '网络通用知识',
      link: '/architecture-document/general-knowledge/network-fundamentals',
    },
    {
      text: 'Chrome 开发者工具全解',
      link: '/architecture-document/general-knowledge/chrome-devtools',
      id: '9GoChumAsKAu3CjFFjdh9nQA',
    },
    {
      text: '系统内核与 CPU 架构',
      link: '/architecture-document/general-knowledge/os-kernel-cpu-architecture',
      id: 'gkS6X26Io7PccVRTGZCDzCqv',
    },
    {
      text: 'Linux 目录结构',
      link: '/architecture-document/general-knowledge/linux-directory-structure',
      id: 'XLM3sKmTJ1m2TFNEVg3wXwv0',
    },
    {
      text: '国内开发镜像设置与还原',
      link: '/architecture-document/general-knowledge/dev-mirror-setup',
      id: 'EywGA0L3jqSz6gnw6OnX885k',
    },
    {
      text: '构建优化核心概念',
      link: '/architecture-document/general-knowledge/build-optimization-concepts',
      id: '_JqmPTq-YFv3joHsq1EN-t0X',
    },
    {
      text: 'Rolldown 与 Oxc',
      link: '/architecture-document/general-knowledge/rolldown-and-oxc',
      id: 'j7aOfXWUvlQc5_CSfywzwSeM',
    },
    {
      text: 'Signal 细粒度响应式',
      link: '/architecture-document/general-knowledge/signal-reactivity',
      id: '6THSGgA5RMVkZJLfdW0Qd_aF',
    },
  ],
}

// ── 数据结构 ──
const dataStructure = {
  text: '数据结构',
  collapsed: true,
  items: [
    {
      id: 'Cgg6LvUD1NhmBIMkjXzgxS_1',
      text: '基础概念',
      link: '/architecture-document/data-structure/basic-concepts',
    },
    {
      id: 'O4xn4qbfnB4QuqkPY_JBzMVK',
      text: '线性结构',
      link: '/architecture-document/data-structure/linear-structures',
    },
    {
      id: 'WnZ67PONkdEmoB3-8GGeBKuu',
      text: '树形结构',
      link: '/architecture-document/data-structure/tree-structures',
    },
    {
      id: 'D5KrOsOBF7WkfqVbJmx5VRUA',
      text: '图结构',
      link: '/architecture-document/data-structure/graph-structures',
    },
    {
      id: 'Pup9yg4tpTI6bJ_vBJF5KBw_',
      text: '哈希表与集合',
      link: '/architecture-document/data-structure/hash-structures',
    },
    {
      id: 'M4rF-anbEjBd_nTUn8pOpWhe',
      text: '高级数据结构',
      link: '/architecture-document/data-structure/advanced-structures',
    },
  ],
}

// ── 设计模式 ──
const designPatterns = {
  text: '设计模式',
  collapsed: true,
  items: [
    {
      id: 'QhhNiXMDPEY4mvd2kKrhSenJ',
      text: '概述',
      link: '/architecture-document/design-patterns/overview',
    },
    {
      id: 'juvz29IotOKHSxnNZPZHfoKV',
      text: '创建型模式',
      link: '/architecture-document/design-patterns/creational',
    },
    {
      id: '6MaIWwrYAxw1XbphivXVFFgc',
      text: '结构型模式',
      link: '/architecture-document/design-patterns/structural',
    },
    {
      id: 'zhpZPqkOCZqMhlONnZx75MOl',
      text: '行为型模式',
      link: '/architecture-document/design-patterns/behavioral',
    },
  ],
}

// ── AI 代码检查 ──
const aiCodeInspection = {
  text: 'AI 代码检查',
  collapsed: true,
  items: [
    {
      id: 'VXnd5hfY1vWrOhWIbcMlId_H',
      text: '架构概述',
      link: '/architecture-document/ai-code-inspection/architecture-overview',
    },
    {
      text: 'Prompt 工程策略',
      link: '/architecture-document/ai-code-inspection/prompt-engineering',
      id: 'A5eOACFM7Oi7Ql55HSjRPMMe',
    },
    {
      text: '代码上下文采集与组装',
      link: '/architecture-document/ai-code-inspection/code-context-pipeline',
      id: 'B_AyWiNk120ggJNRW8kYFxMS',
    },
    {
      text: '检查规则体系设计',
      link: '/architecture-document/ai-code-inspection/rule-system-design',
      id: 'mzD-ndXersggkSvE3YFwcQ_D',
    },
    {
      id: 'i6dUT84uwqTQMg2TAGmHPANQ',
      text: 'CI/CD 集成方案',
      link: '/architecture-document/ai-code-inspection/ci-integration',
    },
    {
      text: '扩展性与自定义机制',
      link: '/architecture-document/ai-code-inspection/extensibility-and-customization',
      id: 'Zw37avn7uzXSfr3ShGG4ykWw',
    },
  ],
}

// ── 典型拆解 ──
const typicalAnalysis = {
  text: '典型拆解',
  collapsed: true,
  items: [
    {
      text: 'TypeScript 类型拆解',
      link: '/architecture-document/typical-analysis/typescript-type-analysis',
      id: 'rQYao9gcxJMJpXfgF0OUGbrh',
    },
    {
      text: 'Node.js 事件调度拆解',
      link: '/architecture-document/typical-analysis/nodejs-event-scheduling',
      id: 'tPbKAPsPMZO_xYHE4ZnlkMGQ',
    },
    {
      text: '浏览器端 JS 调度拆解',
      link: '/architecture-document/typical-analysis/browser-js-scheduling',
      id: '43k_QOuOTsF80NPXG1z7n005',
    },
    {
      text: 'Promise/A+ 手写实现拆解',
      link: '/architecture-document/typical-analysis/promise-implementation',
      id: '3vpgQbBaHPamEsXYbNoFtNk-',
    },
    {
      text: '原型链与继承拆解',
      link: '/architecture-document/typical-analysis/prototype-chain-and-inheritance',
      id: 'tF7_oxLGCVcmRVRy6Pwln7V2',
    },
    {
      text: '虚拟 DOM Diff 算法拆解',
      link: '/architecture-document/typical-analysis/virtual-dom-diff',
      id: 'Se244vJTuEmWgOrZWxjGrMGm',
    },
    {
      text: '响应式系统核心原理拆解',
      link: '/architecture-document/typical-analysis/reactive-system',
      id: 'liT1-YBz9kkawS3LuS20jKDO',
    },
    {
      text: '深拷贝全场景拆解',
      link: '/architecture-document/typical-analysis/deep-clone',
      id: 'ibHdfTDWr0R9QSLrGmTbPbCv',
    },
    {
      text: '前端路由系统实现拆解',
      link: '/architecture-document/typical-analysis/frontend-router',
      id: '7CtQqOZQO_bQKpUzmJTsz_kM',
    },
  ],
}

// ── 研发思维 ──
const thinking = {
  text: '研发思维',
  collapsed: true,
  items: [
    {
      text: '技术名词深度解析索引（入口）',
      link: '/architecture-document/thinking/terminology-index',
      id: 'ozIL0o_ltXfBuXI2hkm3jjX2',
    },
    {
      text: '跨框架研发思维对比',
      link: '/architecture-document/thinking/cross-framework-thinking-comparison',
      id: 'y0ZcW5BycsZTRWZLbmie-GZX',
    },
    {
      text: 'React 19 vs Vue 3 复杂业务性能对决',
      link: '/architecture-document/thinking/react19-vs-vue3-performance',
      id: 'R19vV3perf_compare_thinking',
    },
    {
      id: 'YquLM7cTTLRaI2GtQpVJD-h1',
      text: 'BUG 修复思维对比',
      link: '/architecture-document/thinking/bug-fixing-thinking',
    },
    {
      text: '技术迭代与学习疲态',
      link: '/architecture-document/thinking/tech-iteration-and-learning-fatigue',
      id: 'oS4oQVVx0FEqtB4LbukvJz1v',
    },
    {
      text: '数据·算法·显示 三者分离',
      link: '/architecture-document/thinking/frontend-data-algorithm-view-separation',
      id: '37F4wFSzNS4d8F4_tr6WrJU2',
    },
  ],
}

// ── 组装侧边栏 ──
export const architectureSidebar = {
  // text: '🏗️ 架构',
  collapsed: false,
  items: [
    architecturalVision,

    python,
    nodejs,
    react,

    vue,
    flutter,
    engineering,
    aiCodeInspection,
    database,
    generalKnowledge,
    dataStructure,
    designPatterns,
    typicalAnalysis,
    thinking,
  ],
}
