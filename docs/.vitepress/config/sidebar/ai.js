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
        },
      ],
    },
    {
      text: 'AI知识库',
      items: [
        {
          text: 'AI行业核心概念与术语',
          link: '/ai/base-knowledge/ai-industry-concepts',
        },
        {
          text: 'AI应用开发者知识清单',
          link: '/ai/base-knowledge/ai-developer-knowledge-checklist',
        },
        {
          text: '智能体发展历程',
          link: '/ai/base-knowledge/ai-agent-evolution',
        },
        {
          text: '本地知识库',
          link: '/ai/idea/kbs',
        },
        {
          text: 'M4 Max 新电脑整备指南',
          link: '/ai/idea/new-mac-setup-guide',
        },

        {
          text: 'Ollama 自定义模型笔记',
          link: '/ai/ollama/ollama-custom-model-file',
        },
        {
          text: 'Python 本地智能体最佳实践',
          link: '/ai/ollama/python-local-agent-best-practice',
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
      text: 'AI 提示词集',
      items: [
        { text: '提示词集总索引', link: '/instructions/prompts/' },
        { text: '通用提示词', link: '/instructions/prompts/base-sentence' },
        { text: 'Vue 提示词', link: '/instructions/prompts/vue/prompts' },
        { text: 'React 提示词', link: '/instructions/prompts/react/prompts' },
        { text: 'Flutter 提示词', link: '/instructions/prompts/flutter/prompts' },
      ],
    },
  ],
}
