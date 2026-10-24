/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── Node.js 体系 ──
export const nodejsSection = {
  text: 'Node.js 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: '7wIutCbmNfPBY7Rq138Yko4A',
          text: '项目架构与分层规范',
          link: '/dev-knowledge/nodejs/architecture/project-architecture/nodejs-project-architecture',
        },
        {
          id: 'mSm7341KdjaElDSdzCEVwghS',
          text: '框架架构选型',
          link: '/dev-knowledge/nodejs/architecture/framework-selection/nodejs-framework-selection',
        },
        {
          id: '1-scn9M2HBhjgtw-xeJzXCw8',
          text: '中间件与管道架构',
          link: '/dev-knowledge/nodejs/architecture/middleware-patterns/nodejs-middleware-patterns',
        },
      ],
    },
    {
      text: '面试知识库 [P6-P7]',
      collapsed: true,
      items: [
        {
          id: '30DSzuswZmc9NJi5FaRqOBj1',
          text: '构建工具链演进',
          link: '/dev-knowledge/nodejs/interview/advanced/build-toolchain',
        },
        {
          id: '8y5-H_PDc6BKt-rWt-NCA5tc',
          text: 'Monorepo 架构设计 [P8]',
          link: '/dev-knowledge/nodejs/interview/advanced/monorepo-architecture',
        },
        {
          id: '7THpPiaAMhkRref1Q-hf9HU9',
          text: '微前端方案对比 [P8]',
          link: '/dev-knowledge/nodejs/interview/advanced/micro-frontend',
        },
        {
          id: 'DswTcN0VbZaOX47X8NF5jV32',
          text: '性能预算体系',
          link: '/dev-knowledge/nodejs/interview/advanced/performance-budget',
        },
        {
          id: 'xA1La8d66plIqrH8ic7mD9Gq',
          text: 'Node.js Web 框架对比',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-web-framework',
        },
        {
          id: 'EAeWOXukZZJ1DAXH2dCi8BjJ',
          text: 'Node.js 数据库与 ORM',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-database-orm',
        },
        {
          id: 'LIlwiTESLWx_E-2tfKOHxD1T',
          text: 'Node.js 部署与运维',
          link: '/dev-knowledge/nodejs/interview/advanced/nodejs-deploy-ops',
        },
      ],
    },
  ],
}
