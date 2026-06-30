// docs/.vitepress/config/nav.js
// 导航栏配置

export const nav = [
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
      {
        text: '工程化',
        link: '/architecture-document/engineering/job/frontend-scaffold-scripts',
      },
    ],
  },
  { text: 'GitHub', link: 'https://github.com/jinnianwushuang/smart-code-tool' },
]
