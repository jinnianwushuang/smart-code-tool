# AI 行业核心概念与术语

本文档整理了人工智能（AI）行业的核心名词、概念和技术术语，帮助快速理解 AI 领域的基础知识。

## 一、基础概念

### 1. 人工智能 (Artificial Intelligence, AI)

使计算机系统能够模拟人类智能行为的技术总称，包括学习、推理、感知、语言理解等能力。

### 2. 机器学习 (Machine Learning, ML)

AI 的一个子集，通过算法让计算机从数据中学习规律，无需显式编程即可做出预测或决策。

### 3. 深度学习 (Deep Learning, DL)

机器学习的分支，使用多层神经网络模拟人脑处理信息的方式，擅长处理图像、语音、文本等非结构化数据。

### 4. 大语言模型 (Large Language Model, LLM)

基于海量文本数据训练的深度学习模型，具备强大的自然语言理解和生成能力，如 GPT、Claude、Llama 等。

### 5. 生成式 AI (Generative AI)

能够创造新内容（文本、图像、音频、视频、代码等）的 AI 系统，而非仅进行分类或预测。

---

## 二、核心技术

### 1. 神经网络 (Neural Network)

模仿生物神经元结构的计算模型，由输入层、隐藏层和输出层组成。

#### 常见类型：

- **CNN (Convolutional Neural Network)**: 卷积神经网络，主要用于图像处理
- **RNN (Recurrent Neural Network)**: 循环神经网络，适合处理序列数据
- **Transformer**: 基于注意力机制的架构，现代 NLP 任务的主流模型
- **GAN (Generative Adversarial Network)**: 生成对抗网络，用于生成逼真数据

### 2. 注意力机制 (Attention Mechanism)

允许模型在处理输入时动态关注不同部分的重要性，是 Transformer 架构的核心。

### 3. 预训练 (Pre-training)

在大规模无标注数据上训练模型，学习通用语言或视觉表示。

### 4. 微调 (Fine-tuning)

在预训练模型基础上，使用特定领域的小规模数据进行进一步训练，以适应具体任务。

### 5. 提示工程 (Prompt Engineering)

设计和优化输入提示词，以引导 AI 模型产生期望输出的技术。

### 6. RAG (Retrieval-Augmented Generation)

检索增强生成：结合外部知识库检索和 LLM 生成，提高回答准确性和时效性。

### 7. MCP (Model Context Protocol)

模型上下文协议：由 Anthropic 提出的开放标准，用于标准化 AI 模型与外部数据源、工具和服务之间的连接方式。MCP 使 AI 助手能够安全地访问本地文件、数据库、API 等资源，扩展模型的能力边界。

### 8. Embedding (向量嵌入)

将文本、图像等数据转换为高维向量表示的技术，使得语义相似的内容在向量空间中距离更近。是语义搜索、RAG、推荐系统的核心技术。

### 9. Zero-shot / Few-shot Learning

- **Zero-shot (零样本学习)**: 模型在没有见过特定任务示例的情况下完成任务
- **Few-shot (少样本学习)**: 仅提供少量示例就能让模型学会新任务
- **One-shot (单样本学习)**: 仅提供一个示例

### 10. Chain of Thought (CoT, 思维链)

通过让模型展示推理步骤而非直接给出答案，显著提升复杂问题的解决能力。常用于数学、逻辑推理等任务。

---

## 三、模型相关术语

### 1. 参数 (Parameters)

模型中可调整的权重值，参数量越大通常表示模型越复杂、能力越强。

### 2. Token

文本的基本单位，可以是单词、子词或字符。LLM 处理文本时以 token 为单位。

### 3. 上下文窗口 (Context Window)

模型一次能处理的 token 数量上限，决定了模型能"记住"多少对话历史。

### 4. 温度 (Temperature)

控制模型输出随机性的参数：

- 低温（0.1-0.3）：输出更确定、保守
- 高温（0.7-1.0）：输出更多样、创造性

### 5. Top-p / Nucleus Sampling

另一种采样策略，只考虑累积概率达到阈值 p 的 token，平衡多样性和质量。

### 6. 幻觉 (Hallucination)

模型生成看似合理但实际错误或虚构的内容，是 LLM 的主要挑战之一。

---

## 四、训练与优化

### 1. 数据集 (Dataset)

用于训练、验证和测试模型的数据集合。

#### 分类：

- **训练集 (Training Set)**: 用于模型学习
- **验证集 (Validation Set)**: 用于调参和模型选择
- **测试集 (Test Set)**: 用于最终评估

### 2. 过拟合 (Overfitting)

模型在训练数据上表现很好，但在新数据上泛化能力差。

### 3. 欠拟合 (Underfitting)

模型过于简单，无法捕捉数据中的规律。

### 4. 损失函数 (Loss Function)

衡量模型预测与真实值之间差距的函数，训练目标是 minimize loss。

### 5. 梯度下降 (Gradient Descent)

通过计算损失函数的梯度来更新模型参数的优化算法。

### 6. 学习率 (Learning Rate)

控制参数更新步长的超参数，过大导致震荡，过小收敛缓慢。

### 7. 正则化 (Regularization)

防止过拟合的技术，如 L1/L2 正则化、Dropout 等。

### 8. LoRA (Low-Rank Adaptation)

低秩适应：一种高效的微调方法，只训练少量额外参数而非全部模型参数，大幅降低计算成本和存储需求。

### 9. Epoch

训练轮次，表示模型完整遍历一次训练数据集的次数。通常需要多个 epoch 才能达到好的效果。

### 10. Batch Size

每次迭代中用于更新模型参数的样本数量。较大的 batch size 训练更稳定但需要更多内存，较小的 batch size 可能收敛更快但噪声更大。

---

## 五、评估指标

### 1. 准确率 (Accuracy)

正确预测的比例，适用于分类任务。

### 2. 精确率 (Precision) & 召回率 (Recall)

- **精确率**: 预测为正的样本中真正为正的比例
- **召回率**: 所有正样本中被正确预测的比例

### 3. F1 Score

精确率和召回率的调和平均数，综合评估模型性能。

### 4. BLEU / ROUGE

用于评估文本生成质量的指标，常用于机器翻译和摘要任务。

### 5. Perplexity (困惑度)

衡量语言模型预测能力的指标，越低越好。

---

## 六、应用领域

### 1. NLP (Natural Language Processing)

自然语言处理，包括：

- 机器翻译
- 情感分析
- 文本分类
- 命名实体识别 (NER)
- 问答系统

### 2. CV (Computer Vision)

计算机视觉，包括：

- 图像分类
- 目标检测
- 图像分割
- 人脸识别
- OCR (光学字符识别)

### 3. 语音技术

- ASR (Automatic Speech Recognition): 语音识别
- TTS (Text-to-Speech): 语音合成
- 声纹识别

### 4. 推荐系统

基于用户行为和偏好，个性化推荐内容的系统。

### 5. 强化学习 (Reinforcement Learning)

通过与环境交互、获得奖励/惩罚来学习最优策略，应用于游戏 AI、机器人控制等。

---

## 七、部署与工程化

### 1. 推理 (Inference)

使用训练好的模型进行预测的过程。

### 2. 延迟 (Latency)

从输入到输出所需的时间，影响用户体验。

### 3. 吞吐量 (Throughput)

单位时间内处理的请求数量。

### 4. 量化 (Quantization)

将模型参数从高精度（如 FP32）转换为低精度（如 INT8），减小模型体积、加速推理。

### 5. 剪枝 (Pruning)

移除模型中不重要的连接或神经元，减少计算量。

### 6. 蒸馏 (Distillation)

将大模型（教师模型）的知识转移到小模型（学生模型），保持性能的同时降低资源需求。

### 7. API (Application Programming Interface)

提供模型服务的接口，如 OpenAI API、Anthropic API 等。

### 8. In-context Learning (上下文学习)

LLM 通过在输入提示中包含示例或指令来学习新任务的能力，无需更新模型参数。这是大语言模型区别于传统模型的重要特性。

---

## 八、伦理与安全

### 1. 偏见 (Bias)

训练数据中的偏差导致模型产生不公平或歧视性输出。

### 2. 对齐 (Alignment)

确保 AI 系统的行为符合人类价值观和目标。

### 3. 可解释性 (Explainability)

理解模型为何做出特定决策的能力，对医疗、金融等高风险领域尤为重要。

### 4. 隐私保护

- **差分隐私 (Differential Privacy)**: 在数据中添加噪声以保护个体隐私
- **联邦学习 (Federated Learning)**: 在不共享原始数据的情况下协同训练模型

### 5. 内容安全

检测和过滤有害、违法或不适当的内容。

---

## 九、热门框架与工具

### 1. 深度学习框架

- **PyTorch**: Facebook 开发，研究社区主流选择
- **TensorFlow**: Google 开发，工业界广泛应用
- **JAX**: Google 开发，高性能数值计算

### 2. AI 硬件

- **GPU (Graphics Processing Unit)**: 图形处理器，并行计算能力强，是 AI 训练的主流硬件
- **TPU (Tensor Processing Unit)**: Google 开发的专用 AI 芯片，针对张量运算优化
- **NPU (Neural Processing Unit)**: 神经网络处理单元，专为 AI 推理设计的芯片

### 3. LLM 相关工具

- **LangChain**: 构建 LLM 应用的框架
- **LlamaIndex**: 数据索引和检索框架
- **Hugging Face Transformers**: 预训练模型库
- **vLLM**: 高性能 LLM 推理引擎
- **Ollama**: 本地运行开源 LLM 的工具
- **LM Studio**: 图形化界面的本地 LLM 运行工具

### 4. 向量数据库

- **Pinecone**
- **Milvus**
- **Chroma**
- **Weaviate**

用于存储和检索向量嵌入，支持语义搜索和 RAG。

---

## 十、前沿趋势

### 1. 多模态 (Multimodal)

同时处理多种类型数据（文本、图像、音频、视频）的模型。

### 2. Agent (智能体)

能够自主规划、调用工具、执行任务的 AI 系统。

### 3. MoE (Mixture of Experts)

混合专家模型，动态激活部分参数，提高效率。

### 4. 小模型 (Small Language Models, SLM)

参数量较小但针对特定任务优化的模型，成本更低、部署更容易。

### 5. 边缘 AI (Edge AI)

在本地设备（手机、IoT 设备）上运行 AI 模型，保护隐私、降低延迟。

---

## 参考资料

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Hugging Face Course](https://huggingface.co/course)
- [Stanford CS229: Machine Learning](https://cs229.stanford.edu/)
- [Deep Learning Specialization (Coursera)](https://www.coursera.org/specializations/deep-learning)
