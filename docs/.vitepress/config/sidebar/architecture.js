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

// ── 代码分析工具 ──
const codeAnalysis = {
  text: '代码分析工具',
  collapsed: true,
  items: [
    { text: '代码分析思路', link: '/architecture-document/code-analysis/idea-doc/idea' },
    { text: '代码分析思路 2', link: '/architecture-document/code-analysis/idea-doc/idea2' },
    { text: '代码分析思路 4', link: '/architecture-document/code-analysis/idea-doc/idea4' },
    {
      text: '技术选型',
      link: '/architecture-document/code-analysis/idea-doc/technology-selection',
    },
    { text: '依赖分析', link: '/architecture-document/code-analysis/idea-doc/yilai' },
    { text: '拓扑结构', link: '/architecture-document/code-analysis/fragment/topo' },
  ],
}

// ── Flutter 架构 ──
const flutter = {
  text: 'Flutter 架构',
  collapsed: true,
  items: [
    { text: 'Dart 基础命令', link: '/architecture-document/flutter/reference-code/dart-base-cmd' },
    { text: 'Dart 基础代码', link: '/architecture-document/flutter/reference-code/dart-base-code' },
    {
      text: 'Flutter 基础命令',
      link: '/architecture-document/flutter/reference-code/flutter-base-cmd',
    },
    {
      text: 'Flutter 基础代码',
      link: '/architecture-document/flutter/reference-code/flutter-base-code',
    },
  ],
}

// ── Python 架构 ──
const python = {
  text: 'Python 架构',
  collapsed: true,
  items: [
    {
      text: 'Python 基础命令',
      link: '/architecture-document/python/reference-code/python-base-cmd',
    },
    {
      text: 'Python 基础代码',
      link: '/architecture-document/python/reference-code/python-base-code',
    },
  ],
}

// ── React 架构 ──
const react = {
  text: 'React 架构',
  collapsed: true,
  items: [
    {
      text: 'Vue to React',
      items: [
        { text: 'Vue vs React', link: '/architecture-document/react/idea-doc/idea1' },
        { text: 'Vue to React 原因', link: '/architecture-document/react/idea-doc/idea2' },
        { text: 'Vue to React 路径图', link: '/architecture-document/react/idea-doc/idea3' },
        { text: 'Vue to React 代码', link: '/architecture-document/react/idea-doc/idea4' },
        { text: 'React 神库', link: '/architecture-document/react/idea-doc/idea6' },
      ],
    },
    {
      text: '性能思考',
      items: [{ text: '大型单例设计', link: '/architecture-document/react/other-idea/idea1' }],
    },
    {
      text: '原理说明',
      items: [
        { text: 'useEffect 原理', link: '/architecture-document/react/principle/use-effect' },
      ],
    },
    {
      text: '参考代码',
      items: [
        { text: '基础命令', link: '/architecture-document/react/reference-code/base-cmd' },
        { text: '基础代码', link: '/architecture-document/react/reference-code/base-code' },
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
      ],
    },
  ],
}

// ── Rust 架构 ──
const rust = {
  text: 'Rust 架构',
  collapsed: true,
  items: [{ text: 'Rust 学习指南', link: '/architecture-document/rust/begin/rust-study' }],
}

// ── Vue 架构 ──
const vue = {
  text: 'Vue 架构',
  collapsed: true,
  items: [
    {
      text: '架构设计',
      items: [
        {
          text: 'Assembler 组装器',
          link: '/architecture-document/vue/architecture/assemble_assembler',
        },
        { text: '核心原则', link: '/architecture-document/vue/architecture/core-principle' },
        {
          text: '目录结构规范',
          link: '/architecture-document/vue/architecture/directory-structure-max',
        },
        {
          text: 'Pipeline 组装器',
          link: '/architecture-document/vue/architecture/pipeline-assembler',
        },
        { text: '单例合并', link: '/architecture-document/vue/architecture/singleton-merge' },
      ],
    },
    {
      text: '通用 Composable',
      items: [
        { text: 'DOM 清理', link: '/architecture-document/vue/general-composable/dom-dispose' },
        {
          text: '事件监听清理',
          link: '/architecture-document/vue/general-composable/event-listener-dispose',
        },
        { text: 'Mitt 清理', link: '/architecture-document/vue/general-composable/mitt-dispose' },
        { text: '超级清理器', link: '/architecture-document/vue/general-composable/super-dispose' },
        { text: '定时器清理', link: '/architecture-document/vue/general-composable/timer-dispose' },
        { text: 'Watch 清理', link: '/architecture-document/vue/general-composable/watch-dispose' },
      ],
    },
    {
      text: '通用工具',
      items: [
        { text: 'TanStack Query', link: '/architecture-document/vue/general-tools/TanStack-Query' },
        { text: 'Axios 封装', link: '/architecture-document/vue/general-tools/axios-suit' },
        { text: '模块加载器', link: '/architecture-document/vue/general-tools/module-loader' },
        {
          text: 'API 重试机制',
          link: '/architecture-document/vue/general-tools/re-try-api-request',
        },
        {
          text: 'Payload 包装器',
          link: '/architecture-document/vue/general-tools/wrap-with-payload',
        },
      ],
    },
    {
      text: '参考代码',
      items: [
        {
          text: 'Pipeline + Mitt + Proxy',
          link: '/architecture-document/vue/reference-code/pipeline-assembler-mitt-proxy',
        },
        {
          text: 'Pipeline + Mitt',
          link: '/architecture-document/vue/reference-code/pipeline-assembler-mitt',
        },
        {
          text: 'Pipeline + Proxy 同步',
          link: '/architecture-document/vue/reference-code/pipeline-assembler-proxy-sync',
        },
        { text: 'Vite Glob 导入', link: '/architecture-document/vue/reference-code/vite-glob' },
      ],
    },
    {
      text: '标准代码',
      items: [
        {
          text: 'Assembler 新模式',
          link: '/architecture-document/vue/standard-code/assembler-new',
        },
        { text: '方法规范', link: '/architecture-document/vue/standard-code/method' },
        { text: '状态规范', link: '/architecture-document/vue/standard-code/state' },
      ],
    },
    {
      text: '标准化模板（中文）',
      items: [
        {
          text: 'API 请求与模块',
          link: '/architecture-document/vue/standardized-template-cn/api-request-and-module',
        },
        {
          text: 'API 请求处理',
          link: '/architecture-document/vue/standardized-template-cn/api-request-handling-cn',
        },
        {
          text: '架构概览',
          link: '/architecture-document/vue/standardized-template-cn/architecture-overview-cn',
        },
        {
          text: '架构概览（英文）',
          link: '/architecture-document/vue/standardized-template-cn/architecture-overview',
        },
        {
          text: 'Assembler 模式',
          link: '/architecture-document/vue/standardized-template-cn/assembler-pattern-cn',
        },
        {
          text: '组件系统',
          link: '/architecture-document/vue/standardized-template-cn/component-system-cn',
        },
        {
          text: '组件使用',
          link: '/architecture-document/vue/standardized-template-cn/component-usage',
        },
        {
          text: '配置指南',
          link: '/architecture-document/vue/standardized-template-cn/configuration-guide-cn',
        },
        {
          text: '事件 Pipeline 系统',
          link: '/architecture-document/vue/standardized-template-cn/event-pipeline-system-cn',
        },
        {
          text: '扩展模板',
          link: '/architecture-document/vue/standardized-template-cn/extending-the-template-cn',
        },
        {
          text: '生命周期与副作用',
          link: '/architecture-document/vue/standardized-template-cn/lifecycle-and-effects-cn',
        },
        {
          text: '生命周期事件效果',
          link: '/architecture-document/vue/standardized-template-cn/lifecycle-event-effect',
        },
        {
          text: '状态与 Assembler',
          link: '/architecture-document/vue/standardized-template-cn/state-and-assembler',
        },
        {
          text: '状态管理',
          link: '/architecture-document/vue/standardized-template-cn/state-management-cn',
        },
      ],
    },
    {
      text: '标准化模板（英文）',
      items: [
        {
          text: 'API 请求处理',
          link: '/architecture-document/vue/standardized-template-en/api-request-handling',
        },
        {
          text: '架构概览',
          link: '/architecture-document/vue/standardized-template-en/architecture-overview',
        },
        {
          text: 'Assembler 模式',
          link: '/architecture-document/vue/standardized-template-en/assembler-pattern',
        },
        {
          text: '组件系统',
          link: '/architecture-document/vue/standardized-template-en/component-system',
        },
        {
          text: '配置指南',
          link: '/architecture-document/vue/standardized-template-en/configuration-guide',
        },
        {
          text: '事件 Pipeline 系统',
          link: '/architecture-document/vue/standardized-template-en/event-pipeline-system',
        },
        {
          text: '扩展模板',
          link: '/architecture-document/vue/standardized-template-en/extending-the-template',
        },
        {
          text: '生命周期与副作用',
          link: '/architecture-document/vue/standardized-template-en/lifecycle-and-effects',
        },
        {
          text: '状态管理',
          link: '/architecture-document/vue/standardized-template-en/state-management',
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
    {
      text: 'PostgreSQL vs MySQL + MongoDB',
      link: '/architecture-document/engineering/job/postgresql-vs-mysql-mongodb',
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

// ── 组装侧边栏 ──
export const architectureSidebar = {
  // text: '🏗️ 架构',
  collapsed: false,
  items: [
    architecturalVision,
    codeAnalysis,
    flutter,
    python,
    react,
    rust,
    vue,
    engineering,
    generalKnowledge,
    dataStructure,
    designPatterns,
  ],
}
