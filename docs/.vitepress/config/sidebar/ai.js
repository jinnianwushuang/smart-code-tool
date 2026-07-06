// AI 侧边栏配置
export const aiSidebar = {
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
