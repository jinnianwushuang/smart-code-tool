export const tab_name = 'AI'
export const order = 9
export const docs = [
  {
    category: 'AI 搜索引擎（免登录）',
    color: 'cyan',
    items: [
      {
        name: '百度 AI 搜索',
        url: 'https://chat.baidu.com/search',
        tag: 'Search',
        desc: '百度推出的 AI 驱动搜索引擎,无需登录即可使用智能问答和搜索功能。',
      },
      {
        name: 'Google Gemini',
        url: 'https://gemini.google.com/',
        tag: 'Search',
        desc: 'Google 的 AI 助手,支持智能搜索、内容生成和多模态交互,可直接访问。',
      },
      {
        name: 'Perplexity',
        url: 'https://www.perplexity.ai/',
        tag: 'AI Search',
        desc: '基于 AI 的答案引擎,提供准确、实时的搜索结果并附带引用来源。',
      },

      {
        name: 'Kimi 智能搜索',
        url: 'https://kimi.moonshot.cn/',
        tag: 'Chinese',
        desc: '月之暗面出品的 AI 助手,支持超长文本处理和智能搜索,国内访问友好。',
      },
    ],
  },
  {
    category: 'AI 工具导航与资源',
    color: 'pink',
    items: [
      {
        name: 'AI 工具箱',
        url: 'https://ai-bot.cn/',
        tag: 'Navigation',
        desc: '全面的 AI 工具导航网站,收录国内外优质 AI 产品、教程和资源。',
      },
      {
        name: 'AMZ123 AI 导航',
        url: 'https://www.amz123.com/ai',
        tag: 'Navigation',
        desc: '跨境电商领域的 AI 工具集合,提供电商运营相关的 AI 应用推荐。',
      },
    ],
  },
  {
    category: '主流大模型 (LLMs)',
    color: 'purple',
    items: [
      {
        name: 'DeepSeek',
        url: 'https://www.deepseek.com/',
        tag: 'Hot',
        desc: '国产大模型之光,提供高性能、低成本的推理模型及 API。',
      },
      {
        name: 'OpenAI (ChatGPT)',
        url: 'https://openai.com/',
        tag: 'Top',
        desc: '行业标杆,提供 GPT-4o、o1 等领先的多模态大模型。',
      },
      {
        name: 'Claude (Anthropic)',
        url: 'https://claude.ai/',
        tag: 'Coding',
        desc: '由 Anthropic 开发,代码编写与逻辑推理能力极强,深受开发者喜爱。',
      },
      {
        name: 'Gemini (Google)',
        url: 'https://gemini.google.com/',
        tag: 'Multi-modal',
        desc: 'Google 出品的多模态 AI 助手,深度集成 Google 生态。',
      },
      {
        name: 'Qwen (通义千问)',
        url: 'https://tongyi.aliyun.com/qianwen/',
        tag: 'Chinese',
        desc: '阿里巴巴出品,中文理解能力强,支持长文本处理。',
      },
    ],
  },
  {
    category: 'AI IDE 专区',
    color: 'blue',
    items: [
      {
        name: 'Cursor',
        url: 'https://cursor.com/',
        tag: 'IDE',
        desc: '目前最火的 AI 驱动的代码编辑器,内置深度集成的编程助手。',
      },
      {
        name: 'Qoder',
        url: 'https://qoder.com/',
        tag: 'IDE',
        desc: '智能 AI 编程助手,提供代码理解、生成和优化的全流程支持。',
      },
      {
        name: 'TRAE',
        url: 'https://trae.ai/',
        tag: 'IDE',
        desc: '新兴的 AI 原生 IDE,专注于提升开发效率和代码质量。',
      },
      {
        name: 'GitHub Copilot',
        url: 'https://github.com/features/copilot',
        tag: 'Extension',
        desc: 'GitHub 与 OpenAI 合作开发的 AI 编程助手,支持多种 IDE。',
      },
      {
        name: 'Windsurf',
        url: 'https://windsurf.com/',
        tag: 'IDE',
        desc: '基于 VS Code 的 AI 原生 IDE,提供智能代码补全和对话式编程。',
      },
      {
        name: 'Zed',
        url: 'https://zed.dev/',
        tag: 'Editor',
        desc: 'Rust 编写的高性能代码编辑器,内置 AI 辅助功能。',
      },
      {
        name: 'Continue',
        url: 'https://continue.dev/',
        tag: 'Extension',
        desc: '开源的 AI 编程助手插件,支持 VS Code 和 JetBrains。',
      },
      {
        name: 'CodiumAI',
        url: 'https://www.codium.ai/',
        tag: 'Testing',
        desc: 'AI 驱动的测试生成工具,自动生成单元测试和文档。',
      },
      {
        name: 'Tabnine',
        url: 'https://www.tabnine.com/',
        tag: 'Autocomplete',
        desc: 'AI 代码自动补全工具,支持多种编程语言和 IDE。',
      },
      {
        name: 'Codeium',
        url: 'https://codeium.com/',
        tag: 'Free',
        desc: '免费的 AI 编程助手,提供智能代码补全和聊天功能。',
      },
    ],
  },
  {
    category: 'AI 框架与开发工具',
    color: 'cyan',
    items: [
      {
        name: 'LangChain',
        url: 'https://www.langchain.com/',
        tag: 'Framework',
        desc: '构建大语言模型应用的领先框架,支持链式调用与 RAG 落地。',
      },
      {
        name: 'LlamaIndex',
        url: 'https://www.llamaindex.ai/',
        tag: 'RAG',
        desc: '专注于数据索引和检索的框架,简化 RAG 应用开发。',
      },
      {
        name: 'Dify',
        url: 'https://dify.ai/zh',
        tag: 'LLMOps',
        desc: '开源的 LLM 应用开发平台,可视化编排工作流,快速上线 AI 应用。',
      },
      {
        name: 'LangGraph',
        url: 'https://langchain-ai.github.io/langgraph/',
        tag: 'Agent',
        desc: 'LangChain 推出的 Agent 编排框架,构建复杂的多步骤 AI 工作流。',
      },
      {
        name: 'Ollama',
        url: 'https://ollama.com/',
        tag: 'Local',
        desc: '在本地运行开源大模型的简易工具,支持多种模型一键部署。',
      },
      {
        name: 'Hugging Face Transformers',
        url: 'https://huggingface.co/docs/transformers',
        tag: 'Library',
        desc: '强大的 NLP 库,提供数千个预训练模型用于文本、图像和音频处理。',
      },
    ],
  },
  {
    category: 'AI 社区与模型托管',
    color: 'orange',
    items: [
      {
        name: 'Hugging Face',
        url: 'https://huggingface.co/',
        tag: 'Community',
        desc: 'AI 界的 GitHub,托管了海量的开源模型、数据集与 Demo。',
      },
      {
        name: 'ModelScope (魔搭)',
        url: 'https://modelscope.cn/',
        tag: 'Chinese',
        desc: '阿里巴巴推出的 AI 模型开放平台,提供丰富的中文模型资源。',
      },
      {
        name: 'Civitai (C 站)',
        url: 'https://civitai.com/',
        tag: 'Image',
        desc: '最活跃的 Stable Diffusion 提示词与模型分享社区。',
      },
      {
        name: 'Replicate',
        url: 'https://replicate.com/',
        tag: 'API',
        desc: '通过 API 运行开源机器学习模型的平台,无需管理基础设施。',
      },
    ],
  },
  {
    category: 'AI 应用与 UI 参考',
    color: 'green',
    items: [
      {
        name: 'Vercel AI SDK',
        url: 'https://sdk.vercel.ai/',
        tag: 'Integration',
        desc: '在 React/Vue 中构建流式对话 UI 的行业标准 SDK。',
      },
      {
        name: 'Open WebUI',
        url: 'https://github.com/open-webui/open-webui',
        tag: 'Application',
        desc: '目前功能最全、设计最优雅的开源 AI 聊天交互界面参考。',
      },
      {
        name: 'Chatbot UI',
        url: 'https://github.com/mckaywrigley/chatbot-ui',
        tag: 'Template',
        desc: '简洁美观的 ChatGPT 风格 UI 模板,适合快速搭建 AI 应用。',
      },
      {
        name: 'FastGPT',
        url: 'https://fastgpt.in/',
        tag: 'Platform',
        desc: '开源的 AI 知识库问答平台,支持 RAG 和可视化工作流编排。',
      },
    ],
  },
]
