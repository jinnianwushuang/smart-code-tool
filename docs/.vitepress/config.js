// docs/.vitepress/config.js
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Smart Code Tool',
  description: 'Smart Code Tool 文档中心',

  // 必须设置 base。如果你的 GitHub 仓库名是 'my-project'，
  // 那么基础路径必须包含仓库名，格式为：/仓库名/docs/
  base: '/smart-code-tool/docs/',

  // 让 VitePress 打包出来的文件，直接塞进主应用的打包目录内
  outDir: '../dist/docs',

  // 自定义主题配置
  themeConfig: {
    // Logo 和标题
    logo: '/logo/icons8-light-on-100.png',

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      {
        text: '心理认知',
        items: [
          // ========== 人生哲学 ==========
          {
            text: '威廉·詹姆斯名言',
            link: '/psychology/william-james', // 1842年出生，现代心理学与实用主义先驱
          },
          {
            text: '西格蒙德·弗洛伊德名言',
            link: '/psychology/sigmund-freud', // 1856年出生，精神分析学派创始人
          },
          {
            text: '阿尔弗雷德·阿德勒名言',
            link: '/psychology/alfred-adler', // 1870年出生，个体心理学创始人
          },
          {
            text: '卡尔·荣格经典名言',
            link: '/psychology/carl-gustav-jung', // 1875年出生，分析心理学创始人
          },
          {
            text: '维克多·弗兰克尔名言',
            link: '/psychology/viktor-frankl', // 1905年出生，存在主义与意义治疗大师
          },
          {
            text: '米哈里·契克森米哈赖名言',
            link: '/psychology/mihaly-csikszentmihalyi', // 1934年出生，积极心理学与心流之父
          },
          {
            text: '乔丹·彼得森名言',
            link: '/psychology/jordan-b-peterson', // 1962年出生，当代临床心理学家
          },
          {
            text: '纳瓦尔·拉维康特的名言',
            link: '/psychology/naval-ravikant', // 1974年出生，当代硅谷现代思想家、投资人
          },

          // ========== 认知与学习 ==========
          { text: '思维闭环 - 学习之道', link: '/psychology/thought-loop-the-path-of-learning' },
          { text: '玩游戏与学习的差异', link: '/psychology/games-and-learning' },
          { text: '个人成长顺序', link: '/psychology/sequence-of-personal-growth' },
          {
            text: '1天彻底改变人生',
            link: '/psychology/how-to-fix-your-entire-life-in-1-day',
          },

          // ========== 世界规律 ==========
          { text: '十大世界运转法则', link: '/psychology/world-operation' },

          // ========== 心理健康 ==========
          { text: '走出精神内耗', link: '/psychology/break-from-mental-exhaustion' },

          // ========== 综合指南 ==========
          { text: '现代生存双指南', link: '/psychology/modern-survival-dual-guide' },
        ],
      },
      {
        text: '开发手册',
        items: [
          // ========== 前端框架 ==========
          { text: 'Vue 3 手册', link: '/handbook/frontend/vue3-handbook' },
          { text: 'React 19 手册', link: '/handbook/frontend/react19-handbook' },
          { text: 'Next.js 手册', link: '/handbook/frontend/nextjs-handbook' },

          // ========== JavaScript & TypeScript ==========
          { text: 'TypeScript 手册', link: '/handbook/frontend/typescript-handbook' },
          { text: 'JavaScript 手册', link: '/handbook/frontend/javascript-handbook' },
          { text: 'JS 手册', link: '/handbook/frontend/js-handbook' },
          { text: '正则速查', link: '/handbook/frontend/regex-handbook' },

          // ========== 样式相关 ==========
          { text: 'CSS 手册', link: '/handbook/frontend/css-handbook' },
          { text: 'SCSS 手册', link: '/handbook/frontend/scss-handbook' },
          { text: 'Tailwind CSS 手册', link: '/handbook/frontend/tailwind-css-handbook' },

          // ========== 后端框架 ==========
          { text: 'NestJS 手册', link: '/handbook/backend/nestjs-handbook' },
          { text: 'FastAPI 手册', link: '/handbook/backend/fastapi-handbook' },

          // ========== 数据库 ORM ==========
          { text: 'Prisma 手册', link: '/handbook/database/prisma-handbook' },
          { text: 'Sequelize 手册', link: '/handbook/database/sequelize-handbook' },
          { text: 'Mongoose 手册', link: '/handbook/database/mongoose-handbook' },

          // ========== 数据库 ==========
          { text: 'MySQL 手册', link: '/handbook/database/mysql-handbook' },
          { text: 'MongoDB 手册', link: '/handbook/database/mongodb-handbook' },
          { text: 'PostgreSQL 速查', link: '/handbook/database/postgresql-handbook' },

          // ========== 移动开发 ==========
          { text: 'Dart 手册', link: '/handbook/mobile/dart-handbook' },
          { text: 'Flutter 手册', link: '/handbook/mobile/flutter-handbook' },

          // ========== 系统运维 ==========
          { text: 'Shell 手册', link: '/handbook/devops/shell-handbook' },
          { text: 'Linux 命令速查', link: '/handbook/devops/linux-handbook' },
          { text: 'Git 速查', link: '/handbook/devops/git-handbook' },
          { text: 'Nginx 速查', link: '/handbook/devops/nginx-handbook' },

          // ========== 其他工具 ==========
          { text: 'Python 手册', link: '/handbook/tools/python-handbook' },
          { text: 'Docker 手册', link: '/handbook/tools/docker-handbook' },
          { text: 'Vim 手册', link: '/handbook/tools/vim-handbook' },
        ],
      },
      {
        text: '架构文档',
        items: [
          {
            text: 'AI 相关',
            link: '/architecture-document/ai/architectural-vision/architectural-vision-1',
          },
          { text: 'Vue 架构', link: '/architecture-document/vue/architecture/core-principle' },
          { text: 'React 文档', link: '/architecture-document/react/idea-doc/idea1' },
          { text: '代码分析', link: '/architecture-document/code-analysis/idea-doc/idea' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/jinnianwushuang/smart-code-tool' },
    ],

    // 搜索功能配置
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    // 侧边栏配置
    sidebar: [
      {
        text: '🧠 心理认知',
        collapsed: false,
        items: [
          {
            text: '人生哲学',
            items: [
              {
                text: '威廉·詹姆斯名言',
                link: '/psychology/william-james', // 1842年出生，现代心理学与实用主义先驱
              },
              {
                text: '西格蒙德·弗洛伊德名言',
                link: '/psychology/sigmund-freud', // 1856年出生，精神分析学派创始人
              },
              {
                text: '阿尔弗雷德·阿德勒名言',
                link: '/psychology/alfred-adler', // 1870年出生，个体心理学创始人
              },
              {
                text: '卡尔·荣格经典名言',
                link: '/psychology/carl-gustav-jung', // 1875年出生，分析心理学创始人
              },
              {
                text: '维克多·弗兰克尔名言',
                link: '/psychology/viktor-frankl', // 1905年出生，存在主义与意义治疗大师
              },
              {
                text: '米哈里·契克森米哈赖名言',
                link: '/psychology/mihaly-csikszentmihalyi', // 1934年出生，积极心理学与心流之父
              },
              {
                text: '乔丹·彼得森名言',
                link: '/psychology/jordan-b-peterson', // 1962年出生，当代临床心理学家
              },
              {
                text: '纳瓦尔·拉维康特的名言',
                link: '/psychology/naval-ravikant', // 1974年出生，当代硅谷现代思想家、投资人
              },
            ],
          },
          {
            text: '认知与学习',
            items: [
              {
                text: '思维闭环 - 学习之道',
                link: '/psychology/thought-loop-the-path-of-learning',
              },
              {
                text: '玩游戏与学习的差异',
                link: '/psychology/games-and-learning',
              },
              {
                text: '个人成长顺序',
                link: '/psychology/sequence-of-personal-growth',
              },
              {
                text: '一天彻底改变人生',
                link: '/psychology/how-to-fix-your-entire-life-in-1-day',
              },
            ],
          },
          {
            text: '世界规律',
            items: [
              {
                text: '十大世界运转法则',
                link: '/psychology/world-operation',
              },
            ],
          },
          {
            text: '心理健康',
            items: [
              {
                text: '走出精神内耗',
                link: '/psychology/break-from-mental-exhaustion',
              },
            ],
          },
          {
            text: '综合指南',
            items: [
              {
                text: '现代生存双指南',
                link: '/psychology/modern-survival-dual-guide',
              },
            ],
          },
        ],
      },
      {
        text: '🏗️ 架构文档',
        collapsed: false,
        items: [
          {
            text: 'AI 架构',
            collapsed: true,
            items: [
              {
                text: 'AI知识库',
                items: [
                  {
                    text: '本地知识库',
                    link: '/architecture-document/ai/idea/kbs',
                  },
                  {
                    text: 'M4 Max 新电脑整备指南',
                    link: '/architecture-document/ai/idea/new-mac-setup-guide',
                  },
                ],
              },
              {
                text: '架构愿景',
                collapsed: true,
                items: [
                  {
                    text: '架构愿景',
                    link: '/architecture-document/ai/architectural-vision/architectural-vision-1',
                  },
                  {
                    text: '闭环设计',
                    link: '/architecture-document/ai/architectural-vision/closed-loop-1',
                  },
                  {
                    text: '影响分析',
                    link: '/architecture-document/ai/architectural-vision/influence-1',
                  },
                  {
                    text: '设计原则',
                    link: '/architecture-document/ai/architectural-vision/principles-1',
                  },
                  {
                    text: '实施报告',
                    link: '/architecture-document/ai/architectural-vision/report-1',
                  },
                  {
                    text: '路线图',
                    link: '/architecture-document/ai/architectural-vision/roadmap-1',
                  },
                  {
                    text: '检查清单',
                    link: '/architecture-document/ai/architectural-vision/checklist-1',
                  },
                ],
              },
              {
                text: 'Vue 句子组装',
                collapsed: true,
                items: [
                  { text: '管理端句子', link: '/architecture-document/ai/vue/admin-sentence' },
                  { text: 'Vue 基础句子', link: '/architecture-document/ai/vue/base-sentence-vue' },
                  { text: 'JS 句子', link: '/architecture-document/ai/vue/js-sentence' },
                  { text: 'Web 句子', link: '/architecture-document/ai/vue/web-sentence' },
                ],
              },
              {
                text: '基础句子',
                items: [
                  {
                    text: '基础句子模板',
                    link: '/architecture-document/ai/sentence_assembly/base-sentence',
                  },
                ],
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
            collapsed: true,
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
                items: [
                  { text: '大型单例设计', link: '/architecture-document/react/other-idea/idea1' },
                ],
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
            items: [
              { text: 'Rust 学习指南', link: '/architecture-document/rust/begin/rust-study' },
            ],
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
                text: 'Docker 镜像构建脚本对比',
                link: '/architecture-document/engineering/job/docker-image-build-script-comparison',
              },
            ],
          },
        ],
      },
      {
        text: '📖 开发手册',
        collapsed: false,
        items: [
          {
            text: '前端开发',
            collapsed: true,
            items: [
              {
                text: '前端框架',
                items: [
                  { text: 'Vue 3 手册', link: '/handbook/frontend/vue3-handbook' },
                  { text: 'React 19 手册', link: '/handbook/frontend/react19-handbook' },
                  { text: 'Next.js 手册', link: '/handbook/frontend/nextjs-handbook' },
                ],
              },
              {
                text: 'JavaScript & TypeScript',
                items: [
                  { text: 'TypeScript 手册', link: '/handbook/frontend/typescript-handbook' },
                  { text: 'JavaScript 手册', link: '/handbook/frontend/javascript-handbook' },
                  { text: 'JS 手册', link: '/handbook/frontend/js-handbook' },
                  { text: '正则速查', link: '/handbook/frontend/regex-handbook' },
                ],
              },
              {
                text: '样式相关',
                items: [
                  { text: 'CSS 手册', link: '/handbook/frontend/css-handbook' },
                  { text: 'SCSS 手册', link: '/handbook/frontend/scss-handbook' },
                  { text: 'Tailwind CSS 手册', link: '/handbook/frontend/tailwind-css-handbook' },
                ],
              },
            ],
          },
          {
            text: '后端开发',
            collapsed: true,
            items: [
              {
                text: '后端框架',
                items: [
                  { text: 'NestJS 手册', link: '/handbook/backend/nestjs-handbook' },
                  { text: 'FastAPI 手册', link: '/handbook/backend/fastapi-handbook' },
                ],
              },
            ],
          },
          {
            text: '数据库',
            collapsed: true,
            items: [
              {
                text: '数据库 ORM',
                items: [
                  { text: 'Prisma 手册', link: '/handbook/database/prisma-handbook' },
                  { text: 'Sequelize 手册', link: '/handbook/database/sequelize-handbook' },
                  { text: 'Mongoose 手册', link: '/handbook/database/mongoose-handbook' },
                ],
              },
              {
                text: '数据库系统',
                items: [
                  { text: 'MySQL 手册', link: '/handbook/database/mysql-handbook' },
                  { text: 'MongoDB 手册', link: '/handbook/database/mongodb-handbook' },
                  { text: 'PostgreSQL 速查', link: '/handbook/database/postgresql-handbook' },
                ],
              },
            ],
          },
          {
            text: '移动开发',
            collapsed: true,
            items: [
              {
                text: '移动端技术',
                items: [
                  { text: 'Dart 手册', link: '/handbook/mobile/dart-handbook' },
                  { text: 'Flutter 手册', link: '/handbook/mobile/flutter-handbook' },
                ],
              },
            ],
          },
          {
            text: '系统运维',
            collapsed: true,
            items: [
              {
                text: '运维工具',
                items: [
                  { text: 'Shell 手册', link: '/handbook/devops/shell-handbook' },
                  { text: 'Linux 命令速查', link: '/handbook/devops/linux-handbook' },
                  { text: 'Git 速查', link: '/handbook/devops/git-handbook' },
                  { text: 'Nginx 速查', link: '/handbook/devops/nginx-handbook' },
                ],
              },
            ],
          },
          {
            text: '开发工具',
            collapsed: true,
            items: [
              {
                text: '通用工具',
                items: [
                  { text: 'Python 手册', link: '/handbook/tools/python-handbook' },
                  { text: 'Docker 手册', link: '/handbook/tools/docker-handbook' },
                  { text: 'Vim 手册', link: '/handbook/tools/vim-handbook' },
                ],
              },
            ],
          },
        ],
      },
    ],

    // 上一页/下一页导航
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    // 编辑链接配置
    editLink: {
      pattern: 'https://github.com/jinnianwushuang/smart-code-tool/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    // 社交链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/jinnianwushuang/smart-code-tool' }],
    //
    outline: {
      // level: [2, 3],
      label: '页面导航',
    },
  },

  // 核心：利用 vite 的 define 配置注入全局变量
  vite: {
    define: {
      __APP_BUILD_TIME__: JSON.stringify(new Date().toLocaleString()),
    },
  },
})
