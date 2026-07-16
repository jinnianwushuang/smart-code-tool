# AI 应用开发者 知识清单

本文档面向 AI 应用开发者，系统梳理了从基础理论到工程实践所需掌握的核心知识体系，帮助你快速定位学习方向、查漏补缺。

---

## 一、AI 基础理论

### 1.1 核心概念

- [ ] 理解人工智能、机器学习、深度学习三者的关系
- [ ] 掌握监督学习、无监督学习、强化学习的区别与应用场景
- [ ] 了解大语言模型（LLM）的工作原理：Transformer 架构、注意力机制
- [ ] 理解预训练（Pre-training）与微调（Fine-tuning）的流程
- [ ] 了解生成式 AI 与传统判别式 AI 的差异

### 1.2 关键术语

- [ ] Token、Tokenization、Tokenizer
- [ ] Embedding（向量嵌入）
- [ ] 上下文窗口（Context Window）
- [ ] Temperature、Top-p 采样参数
- [ ] 幻觉（Hallucination）
- [ ] 思维链（Chain of Thought, CoT）
- [ ] Zero-shot / Few-shot / In-context Learning

---

## 二、Prompt Engineering（提示工程）

### 2.1 基础技巧

- [ ] 掌握清晰指令的编写原则：明确角色、任务、格式、约束
- [ ] 了解 Few-shot Prompting（示例引导）
- [ ] 掌握结构化输出（JSON Mode、Markdown 格式约束）

### 2.2 进阶技巧

- [ ] 思维链（CoT）提示：让模型逐步推理
- [ ] 自我一致性（Self-Consistency）：多次采样取共识
- [ ] ReAct 模式：推理 + 行动交替
- [ ] 系统提示词（System Prompt）的设计与优化
- [ ] 提示词注入（Prompt Injection）的防范策略

---

## 三、LLM API 集成

### 3.1 主流 API 服务

- [ ] OpenAI API（GPT 系列）
- [ ] Anthropic API（Claude 系列）
- [ ] Google Gemini API
- [ ] 国内大模型 API（通义千问、文心一言、智谱、DeepSeek 等）
- [ ] 开源模型本地部署（Ollama、vLLM、LM Studio）

### 3.2 接口核心概念

- [ ] Chat Completions 接口：messages、role、content
- [ ] Streaming 流式响应处理
- [ ] Function Calling / Tool Use 工具调用
- [ ] 多模态输入：图片、音频、文件处理
- [ ] Token 计费与用量控制
- [ ] 速率限制（Rate Limit）与重试策略

---

## 四、RAG（检索增强生成）

### 4.1 核心流程

- [ ] 文档加载与解析（PDF、Markdown、HTML 等）
- [ ] 文本分块策略（Chunking）：固定长度、语义分块、递归分块
- [ ] 向量化（Embedding）模型选择
- [ ] 向量数据库存储与检索
- [ ] 上下文组装与 Prompt 构建

### 4.2 向量数据库

- [ ] Chroma（轻量级，适合本地开发）
- [ ] Milvus（分布式，适合生产环境）
- [ ] Pinecone（云端托管）
- [ ] Weaviate
- [ ] pgvector（PostgreSQL 扩展）

### 4.3 进阶优化

- [ ] 混合检索：向量检索 + 关键词检索（BM25）
- [ ] 重排序（Reranking）
- [ ] 查询改写与扩展
- [ ] 元数据过滤
- [ ] 多轮对话中的 RAG 策略

---

## 五、AI Agent（智能体）

### 5.1 核心概念

- [ ] Agent 的基本架构：感知 → 规划 → 行动 → 反馈
- [ ] ReAct 框架
- [ ] Plan-and-Execute 模式
- [ ] 多 Agent 协作模式

### 5.2 工具调用

- [ ] Function Calling 实现机制
- [ ] MCP（Model Context Protocol）协议
- [ ] 自定义工具开发
- [ ] 工具描述与参数设计最佳实践

### 5.3 记忆系统

- [ ] 短期记忆（对话上下文）
- [ ] 长期记忆（持久化存储）
- [ ] 工作记忆（当前任务状态）

### 5.4 主流框架

- [ ] LangChain / LangGraph
- [ ] LlamaIndex
- [ ] AutoGen
- [ ] CrewAI
- [ ] Dify（低代码平台）

---

## 六、模型微调与训练

### 6.1 微调方法

- [ ] 全量微调（Full Fine-tuning）
- [ ] LoRA / QLoRA（参数高效微调）
- [ ] P-Tuning v2
- [ ] Adapter 方法

### 6.2 数据准备

- [ ] 训练数据格式设计（指令-输入-输出）
- [ ] 数据清洗与质量筛选
- [ ] 数据增强策略
- [ ] 标注工具与工作流

### 6.3 训练工具

- [ ] Hugging Face Transformers + PEFT
- [ ] LLaMA-Factory
- [ ] Axolotl
- [ ] 训练监控：Loss 曲线、评估指标

---

## 七、工程化实践

### 7.1 应用架构

- [ ] LLM 应用分层架构：接入层 → 业务层 → 模型层 → 数据层
- [ ] 会话管理（Session）与上下文策略
- [ ] 异步处理与任务队列
- [ ] 缓存策略（语义缓存、响应缓存）

### 7.2 可观测性

- [ ] 日志记录：请求、响应、Token 用量
- [ ] 链路追踪（Tracing）
- [ ] 成本监控与告警
- [ ] 质量评估与 A/B 测试

### 7.3 安全与合规

- [ ] 输入过滤与内容安全审核
- [ ] 输出审核与敏感信息脱敏
- [ ] 用户数据隐私保护
- [ ] API Key 管理与权限控制
- [ ] 模型输出的免责声明与兜底策略

### 7.4 性能优化

- [ ] 流式输出（SSE / WebSocket）
- [ ] 请求批处理
- [ ] 模型量化部署（GPTQ、AWQ、GGUF）
- [ ] 边缘推理与本地模型选择

---

## 八、多模态 AI

### 8.1 视觉理解

- [ ] 图像描述与识别（GPT-4V、Claude Vision）
- [ ] OCR 与文档理解
- [ ] 图表分析与数据提取

### 8.2 语音与音频

- [ ] 语音识别（ASR）：Whisper 等
- [ ] 语音合成（TTS）
- [ ] 实时语音对话

### 8.3 视频处理

- [ ] 视频内容理解
- [ ] 视频摘要与关键帧提取

---

## 九、AI 产品设计

### 9.1 产品思维

- [ ] AI 能力边界认知：什么能做、什么做不好
- [ ] 人机协作设计：AI 辅助而非替代
- [ ] 容错设计：处理模型错误和不确定性
- [ ] 用户期望管理

### 9.2 交互设计

- [ ] 对话式 UI 设计模式
- [ ] 加载状态与进度反馈
- [ ] 流式输出的 UI 处理
- [ ] 错误提示与重试引导

### 9.3 评估体系

- [ ] 模型输出质量评估方法
- [ ] 用户满意度指标
- [ ] 自动化评测流水线
- [ ] 人工评估与标注流程

---

## 十、持续学习与前沿跟踪

### 10.1 信息源

- [ ] 论文：arXiv、Papers With Code
- [ ] 社区：Hugging Face、Reddit r/MachineLearning
- [ ] 博客：OpenAI Blog、Anthropic Research、Google AI Blog
- [ ] 播客 / 视频：Latent Space、AI Explained

### 10.2 前沿方向

- [ ] 多模态大模型
- [ ] 长上下文模型
- [ ] AI Agent 与自动化
- [ ] 小模型与端侧部署
- [ ] AI 编程助手（Copilot、Cursor 等）
- [ ] 世界模型与具身智能

---

## 参考资料

- [OpenAI 官方文档](https://platform.openai.com/docs)
- [Anthropic 官方文档](https://docs.anthropic.com/)
- [LangChain 文档](https://python.langchain.com/docs/)
- [Hugging Face 课程](https://huggingface.co/course)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [AI 行业核心概念与术语](./ai-industry-concepts)
