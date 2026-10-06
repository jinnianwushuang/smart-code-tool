/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['AI', 'Ollama']
 */

// AI 侧边栏配置
export const aiSidebar = {
  // text: '🤖 AI',
  collapsed: false,
  items: [
    {
      text: '零散思考',
      items: [
        {
          text: 'AI时代大前端工程师的生存与出路',
          link: '/ai/thinking/frontend-engineer-survival-in-ai-era',
          id: 'KY74QeMTkG4pj8Vyl8DW0-P_',
        },
      ],
    },
    {
      text: 'AI知识库',
      items: [
        {
          text: 'AI行业核心概念与术语',
          link: '/ai/base-knowledge/ai-industry-concepts',
          id: 'e1fcmSeOterLAVoIAtxHK30a',
        },
        {
          text: 'AI应用开发者知识清单',
          link: '/ai/base-knowledge/ai-developer-knowledge-checklist',
          id: 'joy3LHVl8mywxyIihP5j7SNa',
        },
        {
          text: '智能体发展历程',
          link: '/ai/base-knowledge/ai-agent-evolution',
          id: '9UaJ1q_pSLrYHqvAcf2A1jtG',
        },
        {
          text: '本地知识库',
          link: '/ai/idea/kbs',
          id: 'JwdHMUg-J0rqJtbayh3thvwY',
        },
        {
          text: 'M4 Max 新电脑整备指南',
          link: '/ai/idea/new-mac-setup-guide',
          id: 'Rs-XEWKC4pWc9CDvnSOIpUDZ',
        },

        {
          text: 'Ollama 自定义模型笔记',
          link: '/ai/ollama/ollama-custom-model-file',
          id: 'SF1OLJlwxjVmVCv0ymzDkVuZ',
        },
        {
          text: 'Python 本地智能体最佳实践',
          link: '/ai/ollama/python-local-agent-best-practice',
          id: 'xATmrV29a2sQn8PAm2zU2evK',
        },
      ],
    },

    {
      text: 'AI手册',
      items: [
        {
          text: 'LangChain 手册',
          link: '/handbook/ai/langchain-handbook',
          id: 'Sm6U_aWOcu80kamxJ7JSDua4',
        },
        {
          text: 'Ollama 手册',
          link: '/handbook/ai/ollama-handbook',
          id: 'pYbeeROoYk3tBtWWLDSqrIP7',
        },
      ],
    },
  ],
}
