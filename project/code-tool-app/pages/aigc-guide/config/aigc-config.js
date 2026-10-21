/**
 * AIGC 导航数据配置
 * 按能力域分类，覆盖视觉设计、视频制作、音频加工、文案写作、自媒体运营、AI工具链、数字人、变现平台
 */

export const aigc_tabs = [
  { name: '全部', key: 'all', order: 0 },
  { name: '🎨 视觉设计', key: 'visual', order: 1 },
  { name: '🎬 视频制作', key: 'video', order: 2 },
  { name: '🎵 音频加工', key: 'audio', order: 3 },
  { name: '✍️ 文案写作', key: 'writing', order: 4 },
  { name: '🧑 数字人', key: 'digital-human', order: 5 },
  { name: '🤖 AI 工具链', key: 'workflow', order: 6 },
  { name: '📱 自媒体运营', key: 'social', order: 7 },
  { name: '💰 接单变现', key: 'monetize', order: 8 },
  { name: '📚 学习资源', key: 'learning', order: 9 },
]

export const aigc_docs = {
  // ─── 🎨 视觉设计 ───
  visual: [
    {
      category: 'AI 绘画（生图）',
      color: 'pink',
      items: [
        {
          name: 'Midjourney v7',
          url: 'https://www.midjourney.com/',
          tag: 'Top',
          desc: '出图质感天花板，v7 画质再升级。设计师/创意人首选。',
        },
        {
          name: 'Nano Banana 2.1',
          url: 'https://aistudio.google.com/',
          tag: 'HOT',
          desc: 'Google 最新生图模型（2026.10.6 上线），文字渲染+多参考图融合+4K 输出。',
        },
        {
          name: 'Flux 2',
          url: 'https://blackforestlabs.ai/',
          tag: '开源',
          desc: '提示词遵循最精准，可本地部署。Flux 2 批量生产管线更强。',
        },
        {
          name: 'Lovart',
          url: 'https://lovart.ai/',
          tag: '智能体',
          desc: 'AI 设计智能体平台，集成 30+ 模型（Nano Banana/Flux/MJ），对话式协作出图。',
        },
        {
          name: '即梦 AI',
          url: 'https://jimeng.jianying.com/',
          tag: '免费',
          desc: '字节跳动出品，Seedream 5.0 生图 + Seedance 生视频一体化，中文提示词友好。',
        },
        {
          name: '造点 AI',
          url: 'https://zaodian.tongyi.aliyun.com/',
          tag: '国产',
          desc: '阿里夸克出品，整合通义万相 Wan 2.5，AI 生图+生视频一站式。',
        },
        {
          name: 'Stable Diffusion',
          url: 'https://stability.ai/',
          tag: '开源',
          desc: '生态最丰富，LoRA/ControlNet 插件海量，深度玩家必备。',
        },
      ],
    },
    {
      category: '工作流 & 精准控制',
      color: 'purple',
      items: [
        {
          name: 'ComfyUI',
          url: 'https://github.com/comfyanonymous/ComfyUI',
          tag: '核心',
          desc: '节点式 AI 工作流引擎，自动化批量生产神器。程序员降维打击。',
        },
        {
          name: 'ControlNet',
          url: 'https://github.com/lllyasviel/ControlNet',
          tag: '插件',
          desc: '精准控制 AI 生图的构图、姿态、边缘，配合 SD 使用。',
        },
        {
          name: 'IPAdapter',
          url: 'https://github.com/tencent-ailab/IP-Adapter',
          tag: '一致性',
          desc: '用参考图保持角色/风格一致性，AI 短剧角色必备。',
        },
      ],
    },
    {
      category: '设计辅助',
      color: 'blue',
      items: [
        {
          name: 'Canva AI',
          url: 'https://www.canva.com/',
          tag: '模板',
          desc: '在线设计平台，AI 一键生成海报、Logo、社交媒体图。',
        },
        {
          name: 'Remove.bg',
          url: 'https://www.remove.bg/',
          tag: '抠图',
          desc: 'AI 自动抠图，5 秒出结果，电商美工必备。',
        },
        {
          name: 'Clipdrop',
          url: 'https://clipdrop.co/',
          tag: '工具集',
          desc: 'Stability AI 出品的 AI 图像编辑工具集（抠图/放大/去背景）。',
        },
      ],
    },
  ],

  // ─── 🎬 视频制作 ───
  video: [
    {
      category: 'AI 视频生成',
      color: 'red',
      items: [
        {
          name: '商汤 Seko',
          url: 'https://sekofun.com/',
          tag: 'TOP1',
          desc: '2026 AI 视频 TOP10 榜首。创编一体化多剧集生成智能体，单项目支持 100 集。',
        },
        {
          name: '即梦 AI',
          url: 'https://jimeng.jianying.com/',
          tag: '首选',
          desc: '字节 Seedance 2.5 驱动，与剪映/抖音深度打通，漫剧圈出镜率最高。',
        },
        {
          name: '可灵 AI 4.0',
          url: 'https://klingai.kuaishou.com/',
          tag: '标杆',
          desc: '快手出品，最长 2 分钟 1080P/30fps 长视频，全球用户破亿。釜山电影节合作方。',
        },
        {
          name: '海螺 AI',
          url: 'https://hailuoai.video/',
          tag: 'HOT',
          desc: 'MiniMax 出品，H3 模型性价比极高，运动流畅度和角色情绪表达突出。',
        },
        {
          name: '通义万相 Wan 3.0',
          url: 'https://tongyi.aliyun.com/wanxiang/',
          tag: '开源',
          desc: '阿里出品，单片段最长 30 秒长镜头，消费级显卡可跑，开源模型首选。',
        },
        {
          name: 'Vidu 2.0',
          url: 'https://www.vidu.cn/',
          tag: '国产',
          desc: '生数科技出品，最长 8 秒多宽高比片段，原生带对白与音效。',
        },
        {
          name: 'RunningHub',
          url: 'https://www.runninghub.cn/',
          tag: '平台',
          desc: '云端 ComfyUI + AI 视频/漫剧一站式创作，电商视频批量生成。',
        },
        {
          name: 'Runway Gen-4.5',
          url: 'https://runwayml.com/',
          tag: '专业',
          desc: '专业级多镜头控制，好莱坞都在用。$15-95/月。',
        },
        {
          name: 'PixTV',
          url: 'https://www.pixtv.ai/',
          tag: '新锐',
          desc: '面向 AIGC 内容创作的 AI 视频生成工具，支持 Seedance 2.5 等多模型。',
        },
      ],
    },
    {
      category: '剪辑 & 后期',
      color: 'orange',
      items: [
        {
          name: '剪映',
          url: 'https://www.capcut.cn/',
          tag: '必备',
          desc: '字节跳动出品，AI 字幕/配音/特效一站式，短剧剪辑首选。',
        },
        {
          name: 'CapCut (海外版)',
          url: 'https://www.capcut.com/',
          tag: '海外',
          desc: '剪映国际版，出海短剧剪辑用这个。',
        },
        {
          name: 'Premiere Pro',
          url: 'https://www.adobe.com/products/premiere.html',
          tag: '专业',
          desc: 'Adobe 专业剪辑软件，AI 功能持续增强。',
        },
      ],
    },
  ],

  // ─── 🎵 音频加工 ───
  audio: [
    {
      category: 'AI 音乐生成',
      color: 'green',
      items: [
        {
          name: 'Suno v6',
          url: 'https://suno.com/',
          tag: 'Top',
          desc: '多模态音乐模型，Cover 改风格/局部替换/续写/音轨分离，AI 音乐工作室。',
        },
        {
          name: 'Udio',
          url: 'https://www.udio.com/',
          tag: '音质',
          desc: '录音棚级音质，Inpaint 局部重绘+Remix 风格转换。高保真音乐制作。',
        },
        {
          name: 'KitsAI',
          url: 'https://www.kits.ai/',
          tag: '变声',
          desc: 'AI 声音转换+声音克隆，录完 rap 直接换音色。音乐人必备。',
        },
        {
          name: '网易天音',
          url: 'https://tianyin.163.com/',
          tag: '免费',
          desc: '网易云音乐旗下一站式 AI 音乐创作，词曲编唱混全流程免费。',
        },
        {
          name: 'ACE-Step',
          url: 'https://github.com/ace-step/ACE-Step',
          tag: '开源',
          desc: '开源 AI 音乐生成模型，可本地部署，Suno 的免费替代方案。',
        },
      ],
    },
    {
      category: 'AI 配音 & 语音',
      color: 'cyan',
      items: [
        {
          name: '讯飞配音',
          url: 'https://peiyin.xunfei.cn/',
          tag: '中文',
          desc: '科大讯飞出品，多种用途+方言分类，解说/教育/广告场景覆盖最全。',
        },
        {
          name: '魔音工坊',
          url: 'https://www.moyin.com/',
          tag: '推荐',
          desc: '声音库丰富+调音精细，日常配音和有声书制作首选。',
        },
        {
          name: 'ElevenLabs',
          url: 'https://elevenlabs.io/',
          tag: '情感',
          desc: '语音克隆+情感化语音输出，多语言配音。AI 短剧/纪录片首选。',
        },
        {
          name: 'LipVoice',
          url: 'https://lipvoice.ai/',
          tag: '聚合',
          desc: '模型聚合平台，接入 IndexTTS2.5/CosyVoice3.5/Qwen3-TTS 等 8 款模型。',
        },
        {
          name: '火山引擎豆包语音',
          url: 'https://www.volcengine.com/product/speech',
          tag: '企业',
          desc: '字节跳动豆包语音大模型，企业级 TTS，短视频/口播场景覆盖。',
        },
        {
          name: '剪映 AI 配音',
          url: 'https://www.capcut.cn/',
          tag: '免费',
          desc: '集成在剪映中，短剧配音直接用，中文效果稳定。',
        },
      ],
    },
  ],

  // ─── ✍️ 文案写作 ───
  writing: [
    {
      category: 'AI 对话 & 写作',
      color: 'blue',
      items: [
        {
          name: 'DeepSeek',
          url: 'https://www.deepseek.com/',
          tag: '免费',
          desc: '国产大模型之光，推理能力最强，性价比之王。零成本起步首选。',
        },
        {
          name: 'ChatGPT',
          url: 'https://chat.openai.com/',
          tag: '全能',
          desc: '六边形战士，多模态全能。$20/月，付费首选。',
        },
        {
          name: 'Claude',
          url: 'https://claude.ai/',
          tag: '长文',
          desc: '长文最强，百万上下文窗口。写长提案、审合同、改方案。',
        },
        {
          name: '豆包',
          url: 'https://www.doubao.com/',
          tag: '中文',
          desc: '字节跳动出品，中文语感第一。自媒体文案、爆款标题、小红书。',
        },
        {
          name: 'Kimi',
          url: 'https://kimi.moonshot.cn/',
          tag: '长文档',
          desc: '月之暗面出品，长文档处理、论文阅读能力强。',
        },
        {
          name: '通义千问',
          url: 'https://tongyi.aliyun.com/',
          tag: '办公',
          desc: '阿里巴巴出品，公文写作、体制内办公场景适用。',
        },
      ],
    },
  ],

  // ─── 🧑 数字人 ───
  'digital-human': [
    {
      category: '数字人视频生成',
      color: 'magenta',
      items: [
        {
          name: 'HeyGen',
          url: 'https://www.heygen.com/',
          tag: '海外',
          desc: '100+ 数字人形象，40+ 语言，175 种语言唇形同步。跨境电商首选。$24/月起。',
        },
        {
          name: '腾讯智影',
          url: 'https://zhi.qq.com/',
          tag: '国产',
          desc: '腾讯出品，数字人+视频风格化，动态漫画+AI 视频风格化功能强。',
        },
        {
          name: '万兴播爆',
          url: 'https://virbo.wondershare.cn/',
          tag: '营销',
          desc: '国产营销场景数字人，模板丰富，电商/培训视频快速制作。',
        },
        {
          name: '蝉镜 AI',
          url: 'https://www.chanjing.cn/',
          tag: '批量',
          desc: '批量数字人能力强，版权清晰。适合电商矩阵号。',
        },
        {
          name: '星宇智算',
          url: 'https://www.xingyuzhisuan.com/',
          tag: '性价比',
          desc: '49元/月起，性价比最高。方言支持，唇形同步最准。',
        },
        {
          name: 'D-ID',
          url: 'https://www.d-id.com/',
          tag: '简单',
          desc: '照片驱动数字人，上传照片即可生成口播视频。API 集成方便。',
        },
        {
          name: 'Synthesia',
          url: 'https://www.synthesia.io/',
          tag: '企业',
          desc: '企业级数字人平台，150+ 语言支持，培训视频制作首选。',
        },
      ],
    },
  ],

  // ─── 🤖 AI 工具链 & 工作流 ───
  workflow: [
    {
      category: '工作流编排',
      color: 'teal',
      items: [
        {
          name: 'ComfyUI',
          url: 'https://github.com/comfyanonymous/ComfyUI',
          tag: '核心',
          desc: '节点式 AI 工作流引擎，图像/视频批量生产自动化。程序员最爱。',
        },
        {
          name: '扣子 (Coze)',
          url: 'https://www.coze.cn/',
          tag: '低代码',
          desc: '字节跳动出品，可视化编排 AI Bot，零代码搭建 AI 工作流。',
        },
        {
          name: 'Dify',
          url: 'https://dify.ai/zh',
          tag: '开源',
          desc: '开源 LLM 应用开发平台，可视化编排工作流，快速上线 AI 应用。',
        },
        {
          name: 'n8n',
          url: 'https://n8n.io/',
          tag: '自动化',
          desc: '开源工作流自动化平台，连接各类 AI API 和数据源。',
        },
      ],
    },
    {
      category: 'AI Agent 开发',
      color: 'indigo',
      items: [
        {
          name: 'LangChain',
          url: 'https://www.langchain.com/',
          tag: '框架',
          desc: '构建 LLM 应用的领先框架，支持链式调用与 RAG。',
        },
        {
          name: 'LangGraph',
          url: 'https://langchain-ai.github.io/langgraph/',
          tag: 'Agent',
          desc: 'LangChain 推出的 Agent 编排框架，构建复杂多步骤 AI 工作流。',
        },
        {
          name: 'Ollama',
          url: 'https://ollama.com/',
          tag: '本地',
          desc: '本地运行开源大模型，支持多种模型一键部署。',
        },
        {
          name: 'FastGPT',
          url: 'https://fastgpt.in/',
          tag: '知识库',
          desc: '开源 AI 知识库问答平台，支持 RAG 和可视化工作流编排。',
        },
      ],
    },
  ],

  // ─── 📱 自媒体运营 ───
  social: [
    {
      category: '内容创作平台',
      color: 'orange',
      items: [
        {
          name: '抖音创作者中心',
          url: 'https://creator.douyin.com/',
          tag: '短视频',
          desc: '抖音官方创作者后台，数据分析、内容管理、变现入口。',
        },
        {
          name: '小红书创作者中心',
          url: 'https://creator.xiaohongshu.com/',
          tag: '种草',
          desc: '小红书官方创作者平台，笔记管理、数据分析、品牌合作。',
        },
        {
          name: 'B站创作中心',
          url: 'https://member.bilibili.com/',
          tag: '中长视频',
          desc: 'Bilibili 创作者后台，视频管理、充电计划、数据分析。',
        },
        {
          name: '视频号助手',
          url: 'https://channels.weixin.qq.com/',
          tag: '微信',
          desc: '微信视频号官方管理后台，内容发布、直播、数据分析。',
        },
      ],
    },
    {
      category: '多平台分发工具',
      color: 'lime',
      items: [
        {
          name: '蚁小二',
          url: 'https://www.yixiaoer.cn/',
          tag: '分发',
          desc: '一键分发到 42+ 平台，支持图文/短视频，批量定时发布+违禁词预检。',
        },
        {
          name: '易撰',
          url: 'https://www.yizhuan5.com/',
          tag: '创作+分发',
          desc: '全网素材采集+AI 润色+多平台分发+数据复盘，内容量产一体化。',
        },
        {
          name: '讯飞绘文',
          url: 'https://huiwen.xunfei.cn/',
          tag: 'AI创作',
          desc: '科大讯飞出品，AI 智能创作润色+多平台分发+原创合规检测。',
        },
        {
          name: '融媒宝',
          url: 'https://www.rongmeibao.com/',
          tag: '管理',
          desc: '多平台内容管理+分发+数据分析一体化。',
        },
      ],
    },
  ],

  // ─── 💰 接单变现 ───
  monetize: [
    {
      category: '接单平台',
      color: 'gold',
      items: [
        {
          name: '闲鱼',
          url: 'https://www.goofish.com/',
          tag: '新手',
          desc: 'H1 AI 服务订单 981.6 万笔。零门槛起步，新手第一站。',
        },
        {
          name: '腾讯企鹅微单',
          url: 'https://mp.weixin.qq.com/',
          tag: 'NEW',
          desc: '腾讯 2026.10 新上线，AI 创作者接单平台，微信内完成交易闭环。',
        },
        {
          name: '小红书',
          url: 'https://www.xiaohongshu.com/',
          tag: '引流',
          desc: '展示型接单，客户主动找你。客单价 100-500 元。',
        },
        {
          name: '泡漫接单广场',
          url: 'https://www.paoman.cn/',
          tag: '短剧',
          desc: 'AI 漫剧承制接单，保底 700-1000 元/分钟 + 分成，已产出超千部漫剧。',
        },
        {
          name: 'Fiverr',
          url: 'https://www.fiverr.com/',
          tag: '海外',
          desc: '国际自由职业平台，英语好可做，客单价 $20-300。',
        },
      ],
    },
    {
      category: '知识付费',
      color: 'volcano',
      items: [
        {
          name: '知识星球',
          url: 'https://zsxq.com/',
          tag: '社群',
          desc: '付费社群平台，适合沉淀 AIGC 领域知识和经验变现。',
        },
        {
          name: '小鹅通',
          url: 'https://www.xiaoeknow.com/',
          tag: '课程',
          desc: '在线知识付费平台，支持课程、社群、直播等多种变现形式。',
        },
        {
          name: '千聊',
          url: 'https://www.qlchat.com/',
          tag: '直播',
          desc: '微信生态知识付费平台，直播+录播课程变现。',
        },
      ],
    },
  ],

  // ─── 📚 学习资源 ───
  learning: [
    {
      category: 'AIGC 学习社区',
      color: 'geekblue',
      items: [
        {
          name: 'AI 工具排行榜',
          url: 'https://www.aitoollab.cn/',
          tag: '评测',
          desc: '收录 972 款 AI 工具，逐款实测评分，每日更新排行。',
        },
        {
          name: 'AI 工具箱',
          url: 'https://ai-bot.cn/',
          tag: '导航',
          desc: '全面的 AI 工具导航网站，收录国内外优质 AI 工具和教程。',
        },
        {
          name: 'Civitai (C 站)',
          url: 'https://civitai.com/',
          tag: '社区',
          desc: '最活跃的 SD/Flux 提示词与模型分享社区。',
        },
        {
          name: 'Hugging Face',
          url: 'https://huggingface.co/',
          tag: '模型',
          desc: 'AI 界的 GitHub，海量开源模型、数据集与 Demo。',
        },
        {
          name: 'ModelScope (魔搭)',
          url: 'https://modelscope.cn/',
          tag: '中文',
          desc: '阿里巴巴 AI 模型开放平台，丰富的中文模型资源。',
        },
      ],
    },
    {
      category: '提示词工程',
      color: 'cyan',
      items: [
        {
          name: 'Prompt Engineering Guide',
          url: 'https://www.promptingguide.ai/zh',
          tag: '系统',
          desc: '系统全面的提示词工程指南，支持中文。',
        },
        {
          name: 'LangGPT 结构化提示词',
          url: 'https://github.com/langgptai/LangGPT',
          tag: '框架',
          desc: '结构化提示词框架，模板化编写高质量系统提示词。',
        },
        {
          name: 'FlowGPT',
          url: 'https://flowgpt.com/',
          tag: '社区',
          desc: '活跃的提示词分享社区，发现和投票优质模板。',
        },
      ],
    },
  ],
}

// 构建 all 分类（合并所有）
const all_docs_list = []
Object.values(aigc_docs).forEach((groups) => {
  groups.forEach((group) => {
    all_docs_list.push(group)
  })
})
aigc_docs['all'] = all_docs_list
