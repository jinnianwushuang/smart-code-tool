/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── Python 体系 ──
export const pythonSection = {
  text: 'Python 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: 'wsnitjiF85ksXTCIg_3yy9-y',
          text: 'Python 项目工程化实践',
          link: '/dev-knowledge/python/architecture/engineering/python-engineering-practices',
        },
        {
          id: 'ITiSVHYAz4NWfQ_u4Bd_Gfvx',
          text: 'Python 后端框架技术选型',
          link: '/dev-knowledge/python/architecture/technology-selection/python-backend-framework-selection',
        },
        {
          id: 'MQeLTmqoA0Ajx_xtq52NuRN4',
          text: 'Python AI 开发架构指南',
          link: '/dev-knowledge/python/architecture/ai-architecture/python-ai-development-guide',
        },
      ],
    },
  ],
}
