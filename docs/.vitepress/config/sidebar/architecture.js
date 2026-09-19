// 架构文档侧边栏配置

// ── 架构愿景 ──
const architecturalVision = {
  text: '架构愿景',
  collapsed: true,
  items: [
    {
      text: '架构愿景',
      link: '/architecture-document/architectural-vision/architectural-vision-1',
    },
    { text: '闭环设计', link: '/architecture-document/architectural-vision/closed-loop-1' },
    { text: '影响分析', link: '/architecture-document/architectural-vision/influence-1' },
    { text: '设计原则', link: '/architecture-document/architectural-vision/principles-1' },
    { text: '实施报告', link: '/architecture-document/architectural-vision/report-1' },
    { text: '路线图', link: '/architecture-document/architectural-vision/roadmap-1' },
    { text: '检查清单', link: '/architecture-document/architectural-vision/checklist-1' },
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
        },
      ],
    },
    {
      text: '路由架构设计',
      items: [
        {
          text: 'Flutter 路由架构设计',
          link: '/architecture-document/flutter/routing/flutter-routing-architecture',
        },
      ],
    },
    {
      text: '网络层架构',
      items: [
        {
          text: 'Flutter 网络层架构设计',
          link: '/architecture-document/flutter/networking/flutter-network-architecture',
        },
      ],
    },
    {
      text: '项目结构规范',
      items: [
        {
          text: 'Flutter 项目结构与分层规范',
          link: '/architecture-document/flutter/project-structure/flutter-project-structure',
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
            },
            {
              text: 'iOS 与 Android 必备知识',
              link: '/architecture-document/flutter/thinking/flutter-ios-android-knowledge',
            },
            {
              text: 'APP 启动与屏幕渲染原理',
              link: '/architecture-document/flutter/thinking/app-launch-and-rendering-pipeline',
            },
            {
              text: '系统内核与平台差异适配',
              link: '/architecture-document/flutter/thinking/os-kernel-platform-differences',
            },
          ],
        },
        {
          text: '核心原理',
          items: [
            {
              text: '网络层与弱网优化',
              link: '/architecture-document/flutter/thinking/mobile-network-layer',
            },
            {
              text: '内存管理与性能调优',
              link: '/architecture-document/flutter/thinking/memory-management-performance',
            },
            {
              text: '音视频与相机管线',
              link: '/architecture-document/flutter/thinking/audio-video-camera',
            },
            {
              text: '数据·算法·显示 三者分离',
              link: '/architecture-document/flutter/thinking/data-algorithm-view-separation',
            },
            {
              text: '组件设计模式',
              link: '/architecture-document/flutter/thinking/flutter-component-design-patterns',
            },
            {
              text: 'setState 滥用与 Widget 重建失控',
              link: '/architecture-document/flutter/thinking/setstate-rebuild-chaos-root-cause',
            },
            {
              text: 'Widget × 帧调度 × 三层对象同步',
              link: '/architecture-document/flutter/thinking/widget-frame-sync-formula',
            },
          ],
        },
        {
          text: '数据与安全',
          items: [
            {
              text: '存储与数据同步',
              link: '/architecture-document/flutter/thinking/storage-data-sync',
            },
            {
              text: '安全攻防基础',
              link: '/architecture-document/flutter/thinking/mobile-security',
            },
          ],
        },
        {
          text: '工程实践',
          items: [
            {
              text: '混合栈与模块化架构',
              link: '/architecture-document/flutter/thinking/hybrid-stack-modularization',
            },
            {
              text: 'CI/CD 与发布工程化',
              link: '/architecture-document/flutter/thinking/cicd-release-engineering',
            },
            {
              text: '测试体系',
              link: '/architecture-document/flutter/thinking/testing-system',
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
        },
      ],
    },
    {
      text: '技术选型',
      items: [
        {
          text: 'Python 后端框架技术选型',
          link: '/architecture-document/python/technology-selection/python-backend-framework-selection',
        },
      ],
    },
    {
      text: 'AI 开发架构',
      items: [
        {
          text: 'Python AI 开发架构指南',
          link: '/architecture-document/python/ai-architecture/python-ai-development-guide',
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
        },
      ],
    },
    {
      text: '框架选型',
      items: [
        {
          text: 'Node.js 框架架构选型',
          link: '/architecture-document/nodejs/framework-selection/nodejs-framework-selection',
        },
      ],
    },
    {
      text: '中间件架构',
      items: [
        {
          text: 'Node.js 中间件与管道架构',
          link: '/architecture-document/nodejs/middleware-patterns/nodejs-middleware-patterns',
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
        },
      ],
    },
    {
      text: 'Hooks 架构模式',
      items: [
        {
          text: 'React Hooks 架构模式',
          link: '/architecture-document/react/hooks-patterns/react-hooks-architecture',
        },
        {
          text: '数据·算法·显示 三者分离',
          link: '/architecture-document/react/hooks-patterns/data-algorithm-view-separation',
        },
      ],
    },
    {
      text: '状态管理架构',
      items: [
        {
          text: 'React 状态管理架构',
          link: '/architecture-document/react/state-management/react-state-management-architecture',
        },
      ],
    },
    {
      text: '性能思考',
      items: [
        {
          text: '大型单例对象高性能消费',
          link: '/architecture-document/react/performance/large-object-consumption',
        },
      ],
    },
    {
      text: '研发思维',
      items: [
        {
          text: '不必要 Re-render 的元凶与根治',
          link: '/architecture-document/react/thinking/unnecessary-rerender-root-cause',
        },
        {
          text: 'Fiber × 并发调度 × 数据视图同步',
          link: '/architecture-document/react/thinking/fiber-concurrent-sync-formula',
        },
      ],
    },
    {
      text: '原理说明',
      items: [
        { text: 'useEffect 原理', link: '/architecture-document/react/principle/use-effect' },
      ],
    },
    {
      text: '技术选型',
      items: [
        { text: 'App 项目', link: '/architecture-document/react/technology-selection/app-project' },
        {
          text: '后端项目',
          link: '/architecture-document/react/technology-selection/backend-project',
        },
        {
          text: '客户端项目',
          link: '/architecture-document/react/technology-selection/client-project',
        },
        {
          text: '桌面端项目',
          link: '/architecture-document/react/technology-selection/desktop-project',
        },
        {
          text: 'Electron + React 技术选型',
          link: '/architecture-document/react/technology-selection/electron-react-technology-selection',
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
        { text: '模块加载器', link: '/architecture-document/vue/general-tools/module-loader' },
        {
          text: 'Payload 包装器',
          link: '/architecture-document/vue/general-tools/wrap-with-payload',
        },
      ],
    },
    {
      text: '标准化模板',
      items: [
        {
          text: '架构概述',
          link: '/architecture-document/vue/standardized-template-cn/architecture-overview-cn',
        },
        {
          text: 'LV1-LV5 架构演进',
          link: '/architecture-document/vue/standardized-template-cn/architecture-evolution-cn',
        },
        {
          text: '装配器模式',
          link: '/architecture-document/vue/standardized-template-cn/assembler-pattern-cn',
        },
        {
          text: '状态管理',
          link: '/architecture-document/vue/standardized-template-cn/state-management-cn',
        },
        {
          text: '生命周期与副作用',
          link: '/architecture-document/vue/standardized-template-cn/lifecycle-and-effects-cn',
        },
        {
          text: '事件管道系统',
          link: '/architecture-document/vue/standardized-template-cn/event-pipeline-system-cn',
        },
        {
          text: '组件系统',
          link: '/architecture-document/vue/standardized-template-cn/component-system-cn',
        },
        {
          text: 'API 请求与模块调用说明',
          link: '/architecture-document/vue/standardized-template-cn/api-request-and-module',
        },
        {
          text: '组件设计模式',
          link: '/architecture-document/vue/standardized-template-cn/vue-component-design-patterns',
        },
      ],
    },

    {
      text: '研发思维',
      items: [
        {
          text: '数据·算法·显示 三者分离',
          link: '/architecture-document/vue/thinking/data-algorithm-view-separation-cn',
        },
        {
          text: 'shallowRef 范式与高性能架构',
          link: '/architecture-document/vue/thinking/shallowRef-paradigm-high-performance',
        },
        {
          text: '无效渲染的元凶与根治方案',
          link: '/architecture-document/vue/thinking/render-chaos-root-cause',
        },
        {
          text: '渲染原理 × 事件调度 × 数据视图同步',
          link: '/architecture-document/vue/thinking/rendering-scheduling-sync-formula',
        },
      ],
    },

    {
      text: '技术选型',
      items: [
        { text: 'App 项目', link: '/architecture-document/vue/technology-selection/app-project' },
        {
          text: '后端项目',
          link: '/architecture-document/vue/technology-selection/backend-project',
        },
        {
          text: '客户端项目',
          link: '/architecture-document/vue/technology-selection/client-project',
        },
        {
          text: '桌面端项目',
          link: '/architecture-document/vue/technology-selection/desktop-project',
        },
        {
          text: '业务组件 SDK 打包',
          link: '/architecture-document/vue/technology-selection/sdk-project',
        },
        {
          text: 'Electron + Vue 3 技术选型',
          link: '/architecture-document/vue/technology-selection/electron-vue3-technology-selection',
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
    },
    {
      text: '项目根目录配置文件解析',
      link: '/architecture-document/engineering/job/frontend-project-config-files',
    },
    {
      text: 'Docker 镜像构建脚本对比',
      link: '/architecture-document/engineering/job/docker-image-build-script-comparison',
    },
    {
      text: '包管理与 Monorepo 工具链',
      link: '/architecture-document/engineering/job/npm-pnpm-monorepo-toolchain',
    },
    {
      text: '单仓 vs 多仓的选择',
      link: '/architecture-document/engineering/job/monorepo-vs-polyrepo',
    },
    {
      text: '常见 SaaS 平台功能',
      link: '/architecture-document/engineering/job/common-saas-platform-features',
    },

    {
      text: '全栈基座项目（React）',
      link: '/architecture-document/engineering/job/fullstack-base-project-react',
    },

    {
      text: '全栈基座项目（Vue）',
      link: '/architecture-document/engineering/job/fullstack-base-project-vue',
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
    },
    { text: '网络通用知识', link: '/architecture-document/general-knowledge/network-fundamentals' },
    {
      text: 'Chrome 开发者工具全解',
      link: '/architecture-document/general-knowledge/chrome-devtools',
    },
    {
      text: '系统内核与 CPU 架构',
      link: '/architecture-document/general-knowledge/os-kernel-cpu-architecture',
    },
    {
      text: 'Linux 目录结构',
      link: '/architecture-document/general-knowledge/linux-directory-structure',
    },
    {
      text: '国内开发镜像设置与还原',
      link: '/architecture-document/general-knowledge/dev-mirror-setup',
    },
  ],
}

// ── 数据结构 ──
const dataStructure = {
  text: '数据结构',
  collapsed: true,
  items: [
    { text: '基础概念', link: '/architecture-document/data-structure/basic-concepts' },
    { text: '线性结构', link: '/architecture-document/data-structure/linear-structures' },
    { text: '树形结构', link: '/architecture-document/data-structure/tree-structures' },
    { text: '图结构', link: '/architecture-document/data-structure/graph-structures' },
    { text: '哈希表与集合', link: '/architecture-document/data-structure/hash-structures' },
    { text: '高级数据结构', link: '/architecture-document/data-structure/advanced-structures' },
  ],
}

// ── 设计模式 ──
const designPatterns = {
  text: '设计模式',
  collapsed: true,
  items: [
    { text: '概述', link: '/architecture-document/design-patterns/overview' },
    { text: '创建型模式', link: '/architecture-document/design-patterns/creational' },
    { text: '结构型模式', link: '/architecture-document/design-patterns/structural' },
    { text: '行为型模式', link: '/architecture-document/design-patterns/behavioral' },
  ],
}

// ── AI 代码检查 ──
const aiCodeInspection = {
  text: 'AI 代码检查',
  collapsed: true,
  items: [
    { text: '架构概述', link: '/architecture-document/ai-code-inspection/architecture-overview' },
    {
      text: 'Prompt 工程策略',
      link: '/architecture-document/ai-code-inspection/prompt-engineering',
    },
    {
      text: '代码上下文采集与组装',
      link: '/architecture-document/ai-code-inspection/code-context-pipeline',
    },
    {
      text: '检查规则体系设计',
      link: '/architecture-document/ai-code-inspection/rule-system-design',
    },
    { text: 'CI/CD 集成方案', link: '/architecture-document/ai-code-inspection/ci-integration' },
    {
      text: '扩展性与自定义机制',
      link: '/architecture-document/ai-code-inspection/extensibility-and-customization',
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
    },
    {
      text: 'Node.js 事件调度拆解',
      link: '/architecture-document/typical-analysis/nodejs-event-scheduling',
    },
    {
      text: '浏览器端 JS 调度拆解',
      link: '/architecture-document/typical-analysis/browser-js-scheduling',
    },
    {
      text: 'Promise/A+ 手写实现拆解',
      link: '/architecture-document/typical-analysis/promise-implementation',
    },
    {
      text: '原型链与继承拆解',
      link: '/architecture-document/typical-analysis/prototype-chain-and-inheritance',
    },
    {
      text: '虚拟 DOM Diff 算法拆解',
      link: '/architecture-document/typical-analysis/virtual-dom-diff',
    },
    {
      text: '响应式系统核心原理拆解',
      link: '/architecture-document/typical-analysis/reactive-system',
    },
    {
      text: '深拷贝全场景拆解',
      link: '/architecture-document/typical-analysis/deep-clone',
    },
    {
      text: '前端路由系统实现拆解',
      link: '/architecture-document/typical-analysis/frontend-router',
    },
  ],
}

// ── 研发思维 ──
const thinking = {
  text: '研发思维',
  collapsed: true,
  items: [
    {
      text: '跨框架研发思维对比（入口）',
      link: '/architecture-document/thinking/cross-framework-thinking-comparison',
    },
    { text: 'BUG 修复思维对比', link: '/architecture-document/thinking/bug-fixing-thinking' },
    {
      text: '技术迭代与学习疲态',
      link: '/architecture-document/thinking/tech-iteration-and-learning-fatigue',
    },
    {
      text: '数据·算法·显示 三者分离',
      link: '/architecture-document/thinking/frontend-data-algorithm-view-separation',
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
