/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['Vue', '前端']
 */

// 开发手册侧边栏配置
export const handbookSidebar = {
  // text: '📚 开发手册',
  collapsed: false,
  items: [
    {
      text: '速查索引',
      items: [
        {
          id: 'FhHItJRvhn-u5-0h5I_bIm6G',
          text: '技术术语速查索引',
          link: '/handbook/tech-glossary-index/',
        },
        {
          id: 'qS65gjoJSCAFQgTnXqhEznES',
          text: '知识体系导航',
          link: '/handbook/tech-glossary-index/knowledge-map',
        },
      ],
    },
    {
      text: 'AI 开发',
      items: [
        {
          id: 'TFeoDohK0iBERYa3ZIZ15IDy',
          text: 'LangChain 手册',
          link: '/handbook/ai/langchain-handbook',
        },
        {
          id: 'OEIIcYsHutpTrh99uiq-XH9y',
          text: 'Ollama 手册',
          link: '/handbook/ai/ollama-handbook',
        },
      ],
    },
    {
      text: '前端开发',
      items: [
        {
          id: 'l5fFWgqQMbfzl1Tm9T5X85ob',
          text: 'Vue 3 手册',
          link: '/handbook/frontend/vue3-handbook',
        },
        {
          id: '8Y3J2L-M1kgTk-KcigN0W4Nd',
          text: 'Vue 3 核心原理',
          link: '/handbook/frontend/vue3-core-principles',
        },
        {
          id: 'gfnojO12ayaHtb1if67m9Mxh',
          text: 'React 19 手册',
          link: '/handbook/frontend/react19-handbook',
        },
        {
          id: 'VJRb4nNWkwt5lR0s2ORmH9Kx',
          text: 'React 19 核心原理',
          link: '/handbook/frontend/react19-core-principles',
        },
        {
          id: 'SBom8XaIsK5QWj_ddZuMAGWk',
          text: 'React Native 手册',
          link: '/handbook/frontend/react-native-handbook',
        },
        {
          id: 'MqSEhTCFUVwauG0ddk8QJ7E8',
          text: 'React Native 核心原理',
          link: '/handbook/frontend/react-native-core-principles',
        },
        {
          id: 'vJ31jyiw040FstciSL4LvORz',
          text: 'Next.js 手册',
          link: '/handbook/frontend/nextjs-handbook',
        },
        {
          id: '52O8ageMB0cudACc-y2e08k1',
          text: 'Next.js 核心原理',
          link: '/handbook/frontend/nextjs-core-principles',
        },
        {
          id: 'S4PxoOELHfUSMu7DxRTPAvI1',
          text: 'Vite 核心原理',
          link: '/handbook/frontend/vite-core-principles',
        },
        {
          id: '3RN105fCX-tonGdJosUmkr2a',
          text: 'Electron 手册',
          link: '/handbook/electron/electron-handbook',
        },
        {
          id: '707HYbyl054I1dl_zaAPO3ow',
          text: 'Electron 核心原理',
          link: '/handbook/electron/electron-core-principles',
        },
        {
          id: 'BT8H0hgjE_pnCj2Ie5xNcrHM',
          text: 'TypeScript 手册',
          link: '/handbook/frontend/typescript-handbook',
        },
        {
          id: '5WIdTA0XL3LKrCqgY-GPGA-A',
          text: 'TypeScript 核心原理',
          link: '/handbook/frontend/typescript-core-principles',
        },
        {
          id: 's9KRq_YaqSRyRCTbIPuy7d4z',
          text: 'JavaScript 手册',
          link: '/handbook/frontend/javascript-handbook',
        },
        {
          text: 'JavaScript 高阶API原理',
          link: '/handbook/frontend/javascript-advanced-principles',
          id: 'l1YAprpeoVUh5yvf2bN1npEp',
        },
        {
          id: 'RrJkmJeCUqybBuskGv5wt7oU',
          text: 'CSS 手册',
          link: '/handbook/frontend/css-handbook',
        },
        {
          id: 'yZhCv5A_yowAbNGfzHXDSKj2',
          text: 'SCSS 手册',
          link: '/handbook/frontend/scss-handbook',
        },
        {
          id: 'L6JDFKMCN6g85mcA7zSf2dbb',
          text: 'Tailwind CSS 手册',
          link: '/handbook/frontend/tailwind-css-handbook',
        },
        {
          id: 'QagUcR4BxsSunLPnMhSgxLOe',
          text: '正则 手册',
          link: '/handbook/frontend/regex-handbook',
        },
      ],
    },
    {
      text: '后端开发',
      items: [
        {
          id: 'tBV47YYX2fAKGFMBiFpCKlrs',
          text: 'Python 手册',
          link: '/handbook/backend/python-handbook',
        },
        {
          id: 'osCZjmreNGboQ9OTaSgcdPXq',
          text: 'Node.js 手册',
          link: '/handbook/backend/nodejs-handbook',
        },
        {
          id: '95Ig3aakfPBpyUxxuXX3py47',
          text: 'NestJS 手册',
          link: '/handbook/backend/nestjs-handbook',
        },
        {
          id: 'sLm6PxGRoBWekuWTala2lbou',
          text: 'NestJS 核心原理',
          link: '/handbook/backend/nestjs-core-principles',
        },
        {
          id: 'YilBKf9ZwSagCak01qiz1aAY',
          text: 'FastAPI 手册',
          link: '/handbook/backend/fastapi-handbook',
        },
        {
          id: 'ghAzUFmcLnAVl5iFeZDW_0Ui',
          text: 'Django 手册',
          link: '/handbook/backend/django-handbook',
        },
        {
          id: 'mAgQaxgUx9n1xMBsUPD6SPUk',
          text: 'Egg.js V3 手册',
          link: '/handbook/backend/eggjs-handbook',
        },
        {
          id: '2mdxTq59Op4yhHbuLRDVT_pT',
          text: 'Egg.js V4 手册',
          link: '/handbook/backend/eggjs-v4-handbook',
        },
      ],
    },
    {
      text: '数据库',
      items: [
        {
          id: 'FnxqMR9XFRG6bOUs1uRbMGoB',
          text: 'MySQL 手册',
          link: '/handbook/database/mysql-handbook',
        },
        {
          id: 'JGdF249ou-hxzK6WybbcEcmR',
          text: 'PostgreSQL 速查',
          link: '/handbook/database/postgresql-handbook',
        },
        {
          id: 'ZWalh8QFHtUZo24LBjDhBsTE',
          text: 'MongoDB 手册',
          link: '/handbook/database/mongodb-handbook',
        },
        {
          id: 'UfawqvWMO6E80OovBaSsJN7v',
          text: 'Redis 手册',
          link: '/handbook/database/redis-handbook',
        },
        {
          id: 'GvR_sE8JM_t-doEETvqMM_St',
          text: 'Prisma 手册',
          link: '/handbook/database/prisma-handbook',
        },
        {
          id: 'zyZrs1smB1nIBplRsOUEJcG4',
          text: 'Sequelize 手册',
          link: '/handbook/database/sequelize-handbook',
        },
        {
          id: 'QQUYG3jW1Vit3TjzAF1bZKqv',
          text: 'Mongoose 手册',
          link: '/handbook/database/mongoose-handbook',
        },
        {
          id: '379fvt0UftUINue4XKICWgu9',
          text: 'Chroma 手册',
          link: '/handbook/database/chroma-handbook',
        },
        {
          id: 'cAW_bY_MJkTY8ciVJMl365BV',
          text: 'Milvus 手册',
          link: '/handbook/database/milvus-handbook',
        },
      ],
    },
    {
      text: '移动开发',
      items: [
        {
          id: '5ccjdS34ccqvL7WBa-zgLago',
          text: 'Flutter 手册',
          link: '/handbook/mobile/flutter-handbook',
        },
        {
          id: 'M1TApL5SK7zqWxGmEFdaIGO2',
          text: 'Flutter 核心原理',
          link: '/handbook/mobile/flutter-core-principles',
        },
        {
          id: 'MVV4_yZsDoVPzHhXxoqzQfdn',
          text: 'Flutter 企业级项目手册',
          link: '/handbook/mobile/flutter-enterprise-handbook',
        },
        {
          id: 'R5WKexUmX94Hjvm7tqTYHT-b',
          text: 'Retrofit 原理与工作流',
          link: '/handbook/mobile/flutter-retrofit',
        },
        {
          id: 'JnpIFMtNdJNfK1QYPNEo1MvO',
          text: 'GetX 原理与工作流',
          link: '/handbook/mobile/flutter-getx',
        },
        {
          id: 'sBxGvOv90KHwmZ-58AmTiiEj',
          text: 'Dart 手册',
          link: '/handbook/mobile/dart-handbook',
        },
      ],
    },
    {
      text: '系统运维',
      items: [
        {
          id: 'kj8LPHJ_37UhS23nyzrdFOqu',
          text: 'Docker 手册',
          link: '/handbook/devops/docker-handbook',
        },
        {
          id: 'CmAdaBOytn6fMCRS6I8kRXTB',
          text: 'Linux 命令速查',
          link: '/handbook/devops/linux-handbook',
        },
        { id: 'jvJqz5zXzdqV8Ydc8SXVMfGU', text: 'Git 速查', link: '/handbook/devops/git-handbook' },
        {
          id: 'mxIiARkWGdkOx5BVzNiaLKLr',
          text: 'Shell 手册',
          link: '/handbook/devops/shell-handbook',
        },
        {
          id: 'ghb-9-X9V0M7z-Zm7cWYaRCB',
          text: 'Nginx 速查',
          link: '/handbook/devops/nginx-handbook',
        },
        {
          id: 'vT7IyEvuMFW50FBL1L5uS3m5',
          text: 'Jenkins 手册',
          link: '/handbook/devops/jenkins-handbook',
        },
        {
          id: 'FJoNry1cfyKK_5Kb6poDM_qT',
          text: 'Google zx 手册',
          link: '/handbook/devops/google-zx-handbook',
        },
      ],
    },
    {
      text: '其他手册',
      items: [
        { id: 'X6ycVBqL-TLZNI1OozUoqoWy', text: 'VBA 手册', link: '/handbook/tools/vba-handbook' },
        {
          id: 'U0qIcXgrdnv6VmTtYGYDRiYF',
          text: 'Excel 公式手册',
          link: '/handbook/tools/excel-formulas-handbook',
        },
        { id: 'tX1hznePj4cuzUeDvD32tLFx', text: 'Vim 手册', link: '/handbook/tools/vim-handbook' },
      ],
    },
  ],
}
