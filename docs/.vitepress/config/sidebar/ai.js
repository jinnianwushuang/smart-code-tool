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
    {
      text: 'AI 代码检查',
      collapsed: true,
      items: [
        {
          id: 'VXnd5hfY1vWrOhWIbcMlId_H',
          text: '架构概述',
          link: '/ai/code-inspection/architecture-overview',
        },
        {
          text: 'Prompt 工程策略',
          link: '/ai/code-inspection/prompt-engineering',
          id: 'A5eOACFM7Oi7Ql55HSjRPMMe',
        },
        {
          text: '代码上下文采集与组装',
          link: '/ai/code-inspection/code-context-pipeline',
          id: 'B_AyWiNk120ggJNRW8kYFxMS',
        },
        {
          text: '检查规则体系设计',
          link: '/ai/code-inspection/rule-system-design',
          id: 'mzD-ndXersggkSvE3YFwcQ_D',
        },
        {
          id: 'i6dUT84uwqTQMg2TAGmHPANQ',
          text: 'CI/CD 集成方案',
          link: '/ai/code-inspection/ci-integration',
        },
        {
          text: '扩展性与自定义机制',
          link: '/ai/code-inspection/extensibility-and-customization',
          id: 'Zw37avn7uzXSfr3ShGG4ykWw',
        },
      ],
    },
    {
      text: '指令集设计理念',
      collapsed: true,
      items: [
        { id: 'urjfs3o5zDYrokhLuD1LVUAU', text: '总览', link: '/ai/instructions/' },
        {
          id: 'GHdjVG0XCjQNzSsr2edfzeFe',
          text: '计划书归档',
          link: '/ai/instructions/_plan-archive/',
        },
        {
          text: '指令集体系设计',
          collapsed: true,
          items: [
            {
              id: 'dZinK2xonp__M0s83nQXY32-',
              text: '总览',
              link: '/ai/instructions/instruction-architecture/',
            },
            {
              text: '设计文档',
              collapsed: true,
              items: [
                {
                  text: '分层模型设计',
                  link: '/ai/instructions/instruction-architecture/design/layered-model',
                  id: 'ToEdgcvYply8B3AZGaiNnikV',
                },
                {
                  text: '参数管道设计',
                  link: '/ai/instructions/instruction-architecture/design/parameter-pipeline',
                  id: '5mrsWr-VgCOqnsBsUr3LtGOo',
                },
                {
                  text: '注解驱动文档生成',
                  link: '/ai/instructions/instruction-architecture/design/annotation-driven-docs',
                  id: '-RHtZ83mJAwDbPdlS5GLXoNs',
                },
                {
                  text: '执行模型与编排',
                  link: '/ai/instructions/instruction-architecture/design/execution-model',
                  id: '3qxdijt6h0KXoJif_57YZvgX',
                },
              ],
            },
            {
              text: '规范文件',
              collapsed: true,
              items: [
                {
                  text: '术语表模板',
                  link: '/ai/instructions/instruction-architecture/standards/glossary-template',
                  id: '9cTO-D0onJkFuXslg1Oz2e6v',
                },
                {
                  text: '约束规则规范',
                  link: '/ai/instructions/instruction-architecture/standards/constraint-rules',
                  id: 'nieouMuASjxiT75hIywxDT8i',
                },
                {
                  text: '注解格式规范',
                  link: '/ai/instructions/instruction-architecture/standards/annotation-format',
                  id: 'yokm4c6TUhEj2nEr2k--rlqF',
                },
              ],
            },
            {
              text: '实现示例',
              collapsed: true,
              items: [
                {
                  text: '第 2 层示例',
                  link: '/ai/instructions/instruction-architecture/examples/layer-2-example/entry',
                  id: '9rCoRla0uJq0wLNSoTR6pXL7',
                },
                {
                  text: '第 3 层示例',
                  link: '/ai/instructions/instruction-architecture/examples/layer-3-example/entry',
                  id: 'nVW1oXAY24EhaY7SwCrhN9PL',
                },
                {
                  text: '编排文件示例',
                  link: '/ai/instructions/instruction-architecture/examples/pipeline-example/feature-complete',
                  id: 'KQinjtPzR-83NY0VkQ3CmNH7',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
