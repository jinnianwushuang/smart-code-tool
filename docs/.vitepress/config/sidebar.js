// docs/.vitepress/config/sidebar.js
// 侧边栏配置 - 支持根据路由路径动态显示对应分类的菜单

// 定义各个分类的侧边栏数据
const psychologySidebar = {
  // text: '🧠 心理认知',
  collapsed: false,
  items: [
    {
      text: '人生哲学',
      items: [
        {
          text: '威廉·詹姆斯名言',
          link: '/psychology/philosophy/william-james', // 1842年出生，现代心理学与实用主义先驱
        },
        {
          text: '西格蒙德·弗洛伊德名言',
          link: '/psychology/philosophy/sigmund-freud', // 1856年出生，精神分析学派创始人
        },
        {
          text: '阿尔弗雷德·阿德勒名言',
          link: '/psychology/philosophy/alfred-adler', // 1870年出生，个体心理学创始人
        },
        {
          text: '卡尔·荣格经典名言',
          link: '/psychology/philosophy/carl-gustav-jung', // 1875年出生，分析心理学创始人
        },
        {
          text: '维克多·弗兰克尔名言',
          link: '/psychology/philosophy/viktor-frankl', // 1905年出生，存在主义与意义治疗大师
        },
        {
          text: '米哈里·契克森米哈赖名言',
          link: '/psychology/philosophy/mihaly-csikszentmihalyi', // 1934年出生，积极心理学与心流之父
        },
        {
          text: '乔丹·彼得森名言',
          link: '/psychology/philosophy/jordan-b-peterson', // 1962年出生，当代临床心理学家
        },
        {
          text: '纳瓦尔·拉维康特的名言',
          link: '/psychology/philosophy/naval-ravikant', // 1974年出生，当代硅谷现代思想家、投资人
        },
      ],
    },
    {
      text: '认知与学习',
      items: [
        {
          text: '思维闭环 - 学习之道',
          link: '/psychology/cognition-learning/thought-loop-the-path-of-learning',
        },
        {
          text: '玩游戏与学习的差异',
          link: '/psychology/cognition-learning/games-and-learning',
        },
        {
          text: '个人成长顺序',
          link: '/psychology/cognition-learning/sequence-of-personal-growth',
        },
        {
          text: '一天彻底改变人生',
          link: '/psychology/cognition-learning/how-to-fix-your-entire-life-in-1-day',
        },
      ],
    },
    {
      text: '世界规律',
      items: [
        {
          text: '十大世界运转法则',
          link: '/psychology/world-laws/world-operation',
        },
      ],
    },
    {
      text: '心理健康',
      items: [
        {
          text: '走出精神内耗',
          link: '/psychology/mental-health/break-from-mental-exhaustion',
        },
      ],
    },
    {
      text: '综合指南',
      items: [
        {
          text: '现代生存双指南',
          link: '/psychology/comprehensive-guide/modern-survival-dual-guide',
        },
      ],
    },
  ],
}

const aiSidebar = {
  // text: '🤖 AI',

  collapsed: false,
  items: [
    {
      text: 'AI知识库',
      items: [
        {
          text: 'AI行业核心概念与术语',
          link: '/ai/base-knowledge/ai-industry-concepts',
        },
        {
          text: '本地知识库',
          link: '/ai/idea/kbs',
        },
        {
          text: 'M4 Max 新电脑整备指南',
          link: '/ai/idea/new-mac-setup-guide',
        },
      ],
    },

    {
      text: 'AI手册',
      items: [
        {
          text: 'LangChain 手册',
          link: '/handbook/ai/langchain-handbook',
        },
        {
          text: 'Ollama 手册',
          link: '/handbook/ai/ollama-handbook',
        },
      ],
    },

    {
      text: 'Vue 句子组装',

      items: [
        { text: '管理端句子', link: '/ai/vue/admin-sentence' },
        { text: 'Vue 基础句子', link: '/ai/vue/base-sentence-vue' },
        { text: 'JS 句子', link: '/ai/vue/js-sentence' },
        { text: 'Web 句子', link: '/ai/vue/web-sentence' },
      ],
    },
    {
      text: '基础句子',
      items: [
        {
          text: '基础句子模板',
          link: '/ai/sentence_assembly/base-sentence',
        },
      ],
    },
  ],
}
const architectureSidebar = {
  // text: '🏗️ 架构',
  collapsed: false,
  items: [
    {
      text: '架构愿景',
      collapsed: false,
      items: [
        {
          text: '架构愿景',
          link: '/architecture-document/architectural-vision/architectural-vision-1',
        },
        {
          text: '闭环设计',
          link: '/architecture-document/architectural-vision/closed-loop-1',
        },
        {
          text: '影响分析',
          link: '/architecture-document/architectural-vision/influence-1',
        },
        {
          text: '设计原则',
          link: '/architecture-document/architectural-vision/principles-1',
        },
        {
          text: '实施报告',
          link: '/architecture-document/architectural-vision/report-1',
        },
        {
          text: '路线图',
          link: '/architecture-document/architectural-vision/roadmap-1',
        },
        {
          text: '检查清单',
          link: '/architecture-document/architectural-vision/checklist-1',
        },
      ],
    },

    {
      text: '代码分析工具',
      collapsed: true,
      items: [
        { text: '代码分析思路', link: '/architecture-document/code-analysis/idea-doc/idea' },
        {
          text: '代码分析思路 2',
          link: '/architecture-document/code-analysis/idea-doc/idea2',
        },
        {
          text: '代码分析思路 4',
          link: '/architecture-document/code-analysis/idea-doc/idea4',
        },
        {
          text: '技术选型',
          link: '/architecture-document/code-analysis/idea-doc/technology-selection',
        },
        { text: '依赖分析', link: '/architecture-document/code-analysis/idea-doc/yilai' },
        { text: '拓扑结构', link: '/architecture-document/code-analysis/fragment/topo' },
      ],
    },
    {
      text: 'Flutter 架构',
      collapsed: false,
      items: [
        {
          text: 'Dart 基础命令',
          link: '/architecture-document/flutter/reference-code/dart-base-cmd',
        },
        {
          text: 'Dart 基础代码',
          link: '/architecture-document/flutter/reference-code/dart-base-code',
        },
        {
          text: 'Flutter 基础命令',
          link: '/architecture-document/flutter/reference-code/flutter-base-cmd',
        },
        {
          text: 'Flutter 基础代码',
          link: '/architecture-document/flutter/reference-code/flutter-base-code',
        },
      ],
    },
    {
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
    },
    {
      text: 'React 架构',
      collapsed: true,
      items: [
        {
          text: 'Vue to React',
          items: [
            { text: 'Vue vs React', link: '/architecture-document/react/idea-doc/idea1' },
            {
              text: 'Vue to React 原因',
              link: '/architecture-document/react/idea-doc/idea2',
            },
            {
              text: 'Vue to React 路径图',
              link: '/architecture-document/react/idea-doc/idea3',
            },
            {
              text: 'Vue to React 代码',
              link: '/architecture-document/react/idea-doc/idea4',
            },

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
            {
              text: 'useEffect 原理',
              link: '/architecture-document/react/principle/use-effect',
            },
          ],
        },
        {
          text: '参考代码',
          items: [
            {
              text: '基础命令',
              link: '/architecture-document/react/reference-code/base-cmd',
            },
            {
              text: '基础代码',
              link: '/architecture-document/react/reference-code/base-code',
            },
          ],
        },
        {
          text: '技术选型',
          items: [
            {
              text: 'App 项目',
              link: '/architecture-document/react/technology-selection/app-project',
            },
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
    },
    {
      text: 'Rust 架构',
      collapsed: true,
      items: [{ text: 'Rust 学习指南', link: '/architecture-document/rust/begin/rust-study' }],
    },
    {
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
            {
              text: '核心原则',
              link: '/architecture-document/vue/architecture/core-principle',
            },
            {
              text: '目录结构规范',
              link: '/architecture-document/vue/architecture/directory-structure-max',
            },
            {
              text: 'Pipeline 组装器',
              link: '/architecture-document/vue/architecture/pipeline-assembler',
            },
            {
              text: '单例合并',
              link: '/architecture-document/vue/architecture/singleton-merge',
            },
          ],
        },
        {
          text: '通用 Composable',
          items: [
            {
              text: 'DOM 清理',
              link: '/architecture-document/vue/general-composable/dom-dispose',
            },
            {
              text: '事件监听清理',
              link: '/architecture-document/vue/general-composable/event-listener-dispose',
            },
            {
              text: 'Mitt 清理',
              link: '/architecture-document/vue/general-composable/mitt-dispose',
            },
            {
              text: '超级清理器',
              link: '/architecture-document/vue/general-composable/super-dispose',
            },
            {
              text: '定时器清理',
              link: '/architecture-document/vue/general-composable/timer-dispose',
            },
            {
              text: 'Watch 清理',
              link: '/architecture-document/vue/general-composable/watch-dispose',
            },
          ],
        },
        {
          text: '通用工具',
          items: [
            {
              text: 'TanStack Query',
              link: '/architecture-document/vue/general-tools/TanStack-Query',
            },
            {
              text: 'Axios 封装',
              link: '/architecture-document/vue/general-tools/axios-suit',
            },
            {
              text: '模块加载器',
              link: '/architecture-document/vue/general-tools/module-loader',
            },
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
            {
              text: 'Vite Glob 导入',
              link: '/architecture-document/vue/reference-code/vite-glob',
            },
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
            {
              text: 'App 项目',
              link: '/architecture-document/vue/technology-selection/app-project',
            },
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
          ],
        },
      ],
    },

    {
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
      ],
    },
  ],
}

const handbookSidebar = {
  // text: '📚 开发手册',
  collapsed: false,
  items: [
    {
      text: 'AI 开发',
      items: [
        { text: 'LangChain 手册', link: '/handbook/ai/langchain-handbook' },
        { text: 'Ollama 手册', link: '/handbook/ai/ollama-handbook' },
      ],
    },
    {
      text: '前端开发',
      items: [
        { text: 'Vue 3 手册', link: '/handbook/frontend/vue3-handbook' },
        { text: 'React 19 手册', link: '/handbook/frontend/react19-handbook' },
        { text: 'Next.js 手册', link: '/handbook/frontend/nextjs-handbook' },
        { text: 'TypeScript 手册', link: '/handbook/frontend/typescript-handbook' },
        { text: 'JavaScript 手册', link: '/handbook/frontend/javascript-handbook' },
        { text: 'CSS 手册', link: '/handbook/frontend/css-handbook' },
        { text: 'Tailwind CSS 手册', link: '/handbook/frontend/tailwind-css-handbook' },
      ],
    },
    {
      text: '后端开发',
      items: [
        { text: 'NestJS 手册', link: '/handbook/backend/nestjs-handbook' },
        { text: 'FastAPI 手册', link: '/handbook/backend/fastapi-handbook' },
        { text: 'Django 手册', link: '/handbook/backend/django-handbook' },
      ],
    },
    {
      text: '数据库',
      items: [
        { text: 'MySQL 手册', link: '/handbook/database/mysql-handbook' },
        { text: 'PostgreSQL 速查', link: '/handbook/database/postgresql-handbook' },
        { text: 'MongoDB 手册', link: '/handbook/database/mongodb-handbook' },
        { text: 'Prisma 手册', link: '/handbook/database/prisma-handbook' },
      ],
    },
    {
      text: '移动开发',
      items: [
        { text: 'Flutter 手册', link: '/handbook/mobile/flutter-handbook' },
        { text: 'Dart 手册', link: '/handbook/mobile/dart-handbook' },
      ],
    },
    {
      text: '系统运维',
      items: [
        { text: 'Docker 手册', link: '/handbook/tools/docker-handbook' },
        { text: 'Linux 命令速查', link: '/handbook/devops/linux-handbook' },
        { text: 'Git 速查', link: '/handbook/devops/git-handbook' },
        { text: 'Shell 手册', link: '/handbook/devops/shell-handbook' },
        { text: 'Nginx 速查', link: '/handbook/devops/nginx-handbook' },
        { text: 'Jenkins 手册', link: '/handbook/devops/jenkins-handbook' },
        { text: 'Google zx 手册', link: '/handbook/devops/google-zx-handbook' },
      ],
    },
    {
      text: '开发工具',
      items: [
        { text: 'Python 手册', link: '/handbook/tools/python-handbook' },
        { text: 'VBA 手册', link: '/handbook/tools/vba-handbook' },
        { text: 'Excel 公式手册', link: '/handbook/tools/excel-formulas-handbook' },
        { text: 'Vim 手册', link: '/handbook/tools/vim-handbook' },
      ],
    },
  ],
}

const homeSidebar = {
  // text: '🏠 首页',
  items: [
    { text: '首页', link: '/' },
    { text: 'AI', link: '/ai/' },
    {
      text: '架构',
      link: '/architecture-document/',
    },
    {
      text: '心理认知',
      link: '/psychology/',
    },

    {
      text: '开发手册',
      link: '/handbook',
    },
  ],
}

// 导出侧边栏配置函数,根据路径返回对应的侧边栏
export const sidebar = {
  '/ai/': [aiSidebar],
  // 心理认知相关路径
  '/psychology/': [psychologySidebar],

  // 架构文档相关路径
  '/architecture-document/': [architectureSidebar],

  // 开发手册相关路径
  '/handbook/': [handbookSidebar],

  // 默认侧边栏(首页等)
  // '/': [aiSidebar, psychologySidebar, architectureSidebar, handbookSidebar],
  '/': [homeSidebar],
}
