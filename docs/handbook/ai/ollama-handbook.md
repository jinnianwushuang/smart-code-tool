# Ollama 开发手册

## 概述

Ollama 是一个开源工具,用于在本地运行大型语言模型(LLM)。它简化了模型的下载、管理和部署过程,让开发者能够在自己的机器上轻松运行开源 LLM,如 Llama 3、Mistral、Gemma 等。

### 核心优势

- **本地运行**: 数据隐私安全,无需联网
- **简单易用**: 一行命令即可运行模型
- **多模型支持**: 支持众多开源 LLM
- **API 兼容**: 提供 OpenAI 兼容的 API 接口
- **跨平台**: 支持 macOS、Linux、Windows

### 系统要求

| 配置 | 最低要求       | 推荐配置                   |
| ---- | -------------- | -------------------------- |
| CPU  | 4 核           | 8 核以上                   |
| 内存 | 8 GB           | 16 GB 以上                 |
| 磁盘 | 10 GB          | 50 GB 以上（SSD 推荐）     |
| GPU  | 无（CPU 模式） | NVIDIA 8GB+ / Apple M 系列 |

### 支持的模型格式

- **GGUF**: 主要支持的格式（llama.cpp 生态）
- **Safetensors**: Hugging Face 模型格式
- **PyTorch**: 部分支持

### 架构概览

```text
┌─────────────────────────────┐
│      客户端 / 应用层        │
│  (Web UI / CLI / API SDK)   │
└─────────┬───────────────────┘
          │ HTTP REST API
┌─────────▼───────────────────┐
│      Ollama 服务层          │
│  (模型加载 / 推理 / 调度)  │
└─────────┬───────────────────┘
          │
┌─────────▼───────────────────┐
│      llama.cpp 推理引擎     │
│  (GGUF 解析 / 量化 / 计算) │
└─────────┬───────────────────┘
          │
┌─────────▼───────────────────┐
│   硬件加速层              │
│  CUDA / Metal / CPU        │
└─────────────────────────────┘
```

## 快速开始

### 安装

#### macOS

```bash
# 使用 Homebrew
brew install ollama

# 或直接下载安装包
curl -fsSL https://ollama.com/install.sh | sh
```

#### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Windows

从 [Ollama 官网](https://ollama.com/download) 下载 Windows 安装包

```powershell
# 或使用 winget 安装
winget install Ollama.Ollama

# 验证安装
ollama --version

# 启动服务
ollama serve
```

#### Docker

```bash
# 基础启动
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# GPU 加速启动（NVIDIA）
docker run -d --gpus all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# 拉取并运行模型
docker exec -it ollama ollama run llama3
```

### 验证安装

```bash
ollama --version

# 快速测试（拉取并运行一个小模型）
ollama run tinyllama "hello"
```

## 基本命令

### 模型管理

#### 拉取模型

```bash
# 拉取最新版本的 Llama 3
ollama pull llama3

# 拉取特定版本
ollama pull llama3:8b

# 拉取 Mistral
ollama pull mistral

# 拉取 Gemma
ollama pull gemma:2b

# 查看可用模型列表
ollama list
```

#### 删除模型

```bash
ollama rm llama3

# 删除特定版本
ollama rm llama3:70b

# 删除自定义模型
ollama rm my-coder
```

#### 复制模型

```bash
ollama cp llama3 my-llama3

# 复制并重命名（用于备份）
ollama cp llama3 llama3-backup
```

#### 查看模型信息

```bash
# 查看模型详细参数
ollama show llama3

# 查看模型的 Modelfile
ollama show llama3 --modelfile

# 查看模型的系统提示词
ollama show llama3 --system

# 查看模型参数配置
ollama show llama3 --parameters
```

### 运行模型

#### 交互式对话

```bash
# 启动交互模式
ollama run llama3

# 直接提问
ollama run llama3 "什么是机器学习?"

# 多行输入(按 Ctrl+D 结束)
ollama run llama3 << EOF
请解释一下深度学习的基本原理
EOF

# 指定参数运行
ollama run llama3 --verbose "解释量子计算"

# 管道输入
echo "用 Python 写一个爬虫" | ollama run llama3

# 将文件内容作为输入
cat requirements.txt | ollama run llama3 "分析这些依赖的作用"
```

#### 后台服务

```bash
# 启动 Ollama 服务(默认端口 11434)
ollama serve

# 后台启动服务
nohup ollama serve > ollama.log 2>&1 &

# 检查服务状态
curl http://localhost:11434/api/tags

# 查看版本信息
curl http://localhost:11434/api/version

# 指定监听地址和端口
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```

## API 使用

### REST API

#### 生成文本

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "为什么天空是蓝色的?",
  "stream": false
}'
```

#### 聊天接口

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3",
  "messages": [
    {
      "role": "user",
      "content": "你好!"
    }
  ],
  "stream": false
}'
```

#### 流式输出

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "写一首诗",
  "stream": true
}'
```

#### 生成嵌入向量

```bash
curl http://localhost:11434/api/embeddings -d '{
  "model": "llama3",
  "prompt": "机器学习是人工智能的一个分支"
}'
```

#### 查看已加载模型列表

```bash
# 列出本地所有模型
curl http://localhost:11434/api/tags

# 查看模型详细信息
curl http://localhost:11434/api/show -d '{
  "name": "llama3"
}'
```

#### 多轮对话（带上下文）

```bash
# 第一轮
curl http://localhost:11434/api/chat -d '{
  "model": "llama3",
  "messages": [
    {"role": "system", "content": "你是一个 Python 专家"},
    {"role": "user", "content": "什么是装饰器?"}
  ],
  "stream": false
}'

# 第二轮（带上第一轮的 assistant 回复）
curl http://localhost:11434/api/chat -d '{
  "model": "llama3",
  "messages": [
    {"role": "system", "content": "你是一个 Python 专家"},
    {"role": "user", "content": "什么是装饰器?"},
    {"role": "assistant", "content": "装饰器是 Python 中的一种设计模式..."},
    {"role": "user", "content": "请给出一个具体示例"}
  ],
  "stream": false
}'
```

#### 带图片的多模态对话

```bash
# 使用 llava 模型分析图片
curl http://localhost:11434/api/generate -d '{
  "model": "llava",
  "prompt": "描述这张图片的内容",
  "images": ["iVBORw0KGgoAAAANSUhEUgAA..."]
}'
```

#### 使用 OpenAI 兼容接口

```bash
# Ollama 兼容 OpenAI API 格式
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "llama3",
  "messages": [
    {"role": "user", "content": "你好!"}
  ],
  "temperature": 0.7
}'

# 兼容的嵌入接口
curl http://localhost:11434/v1/embeddings -d '{
  "model": "llama3",
  "input": "机器学习是人工智能的一个分支"
}'
```

### Python SDK

#### 基础对话

```python
import requests
import json

def chat_with_ollama(prompt, model="llama3"):
    url = "http://localhost:11434/api/chat"

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }

    response = requests.post(url, json=payload)
    result = response.json()

    return result['message']['content']

# 使用示例
response = chat_with_ollama("解释量子计算")
print(response)
```

#### 流式输出

```python
import requests
import json

def stream_chat(prompt, model="llama3"):
    url = "http://localhost:11434/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }

    response = requests.post(url, json=payload, stream=True)

    for line in response.iter_lines():
        if line:
            data = json.loads(line)
            print(data['response'], end='', flush=True)

# 使用示例
stream_chat("写一个 Python 快速排序算法")
```

#### 使用官方 Python SDK

```python
import ollama

# 基础对话
response = ollama.chat(model='llama3', messages=[
    {'role': 'user', 'content': '你好!'},
])
print(response['message']['content'])

# 流式输出
stream = ollama.chat(model='llama3', messages=[
    {'role': 'user', 'content': '写一首诗'},
], stream=True)

for chunk in stream:
    print(chunk['message']['content'], end='', flush=True)

# 生成嵌入向量
result = ollama.embeddings(model='llama3', prompt='机器学习是人工智能的一个分支')
print(f"向量维度: {len(result['embedding'])}")

# 使用自定义模型
response = ollama.chat(model='my-coder', messages=[
    {'role': 'user', 'content': '解释闭包的概念'},
])
print(response['message']['content'])
```

### JavaScript SDK

```javascript
async function chatWithOllama(prompt, model = 'llama3') {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  })

  const data = await response.json()
  return data.message.content
}

// 使用示例
chatWithOllama('什么是人工智能?').then(console.log)
```

#### 流式输出（ReadableStream）

```javascript
async function streamChat(prompt, model = 'llama3') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true }),
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      const data = JSON.parse(line)
      process.stdout.write(data.response)
    }
  }
}

// 使用示例
await streamChat('用 JavaScript 实现一个防抖函数')
```

#### 使用 OpenAI SDK 连接 Ollama

```javascript
import OpenAI from 'openai'

// 将 OpenAI SDK 指向 Ollama
const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // Ollama 不需要真实 API key
})

const response = await client.chat.completions.create({
  model: 'llama3',
  messages: [
    { role: 'system', content: '你是一个专业的编程助手' },
    { role: 'user', content: '解释 TypeScript 的类型守卫' },
  ],
})

console.log(response.choices[0].message.content)
```

## 高级配置

### Modelfile 自定义模型

Modelfile 允许你自定义模型的行为和参数。

#### 创建 Modelfile

```dockerfile
# 基础模型
FROM llama3

# 设置参数
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096

# 系统提示
SYSTEM """
你是一个专业的编程助手。
请用简洁清晰的方式回答问题。
如果涉及代码,请提供完整的示例。
"""

# 模板(可选)
TEMPLATE """
{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}<|user|>
{{ .Prompt }}<|end|>
<|assistant|>
"""
```

### 构建自定义模型

```bash
# 从 Modelfile 创建模型（默认使用当前目录下的 Modelfile）
ollama create my-coder -f Modelfile

# 指定文件名创建模型
ollama create my-coder -f ./configs/coder.Modelfile
ollama create my-translator -f /path/to/translator.Modelfile

# 不带 -f 参数时，默认读取当前目录的 Modelfile
ollama create my-coder

# 使用自定义模型
ollama run my-coder
```

#### 更多 Modelfile 示例

**示例 1：编程助手模型**

```dockerfile
FROM codellama:7b

PARAMETER temperature 0.3
PARAMETER num_ctx 8192
PARAMETER repeat_penalty 1.15

SYSTEM """
你是一个资深全栈开发工程师，擅长 Python、JavaScript、Go 等语言。
回答问题时请：
1. 先简要说明思路
2. 给出完整可运行的代码
3. 附上关键代码的注释说明
"""
```

```bash
ollama create code-assistant -f code-assistant.Modelfile
ollama run code-assistant
```

**示例 2：翻译模型**

```dockerfile
FROM qwen:7b

PARAMETER temperature 0.1
PARAMETER top_p 0.95
PARAMETER num_ctx 4096

SYSTEM """
你是一个专业的中英翻译助手。
- 如果输入是中文，翻译为英文
- 如果输入是英文，翻译为中文
- 保持原文的语气和风格
- 只输出翻译结果，不要添加解释
"""

TEMPLATE """{{ .System }}
用户: {{ .Prompt }}
翻译结果:"""
```

```bash
ollama create translator -f translator.Modelfile
ollama run translator "今天天气真好"
```

**示例 3：SQL 生成模型**

```dockerfile
FROM llama3:8b

PARAMETER temperature 0.2
PARAMETER num_ctx 4096
PARAMETER stop "[done]"

SYSTEM """
你是一个 SQL 专家。根据用户的自然语言描述生成对应的 SQL 语句。
支持 MySQL、PostgreSQL、SQLite 语法。
只输出 SQL 语句，不要添加额外解释。
"""
```

```bash
ollama create sql-gen -f sql-gen.Modelfile
ollama run sql-gen "查询每个部门的平均工资，按降序排列"
```

**示例 4：基于 GGUF 文件创建模型**

```dockerfile
FROM ./models/my-model.Q4_K_M.gguf

PARAMETER temperature 0.7
PARAMETER num_ctx 2048

SYSTEM """
你是一个 helpful 的 AI 助手。
"""
```

```bash
ollama create my-local-model -f custom-gguf.Modelfile
```

**示例 5：基于已有自定义模型二次构建**

```dockerfile
# 基于之前创建的 my-coder 模型
FROM my-coder

# 覆盖部分参数
PARAMETER temperature 0.5

SYSTEM """
你是一个专注于前端开发的编程助手，精通 React、Vue、TypeScript。
"""
```

```bash
ollama create frontend-expert -f frontend.Modelfile
ollama run frontend-expert
```

#### 管理自定义模型

```bash
# 查看所有模型（包括自定义模型）
ollama list

# 查看模型详细信息
ollama show my-coder

# 查看模型的 Modelfile 定义
ollama show my-coder --modelfile

# 复制自定义模型
ollama cp my-coder my-coder-backup

# 删除自定义模型
ollama rm my-coder

# 导出 Modelfile 供复用
ollama show my-coder --modelfile > saved-Modelfile
```

### 常用参数说明

```python
{
  "model": "llama3",
  "prompt": "你的问题",
  "options": {
    "temperature": 0.7,      # 创造性 (0-1, 越高越随机)
    "top_k": 40,             # 采样候选词数量
    "top_p": 0.9,            # 核采样概率阈值
    "num_predict": 512,      # 最大生成 token 数
    "stop": ["\n", "User:"], # 停止序列
    "num_ctx": 4096,         # 上下文窗口大小
    "repeat_penalty": 1.1,   # 重复惩罚系数
    "seed": 42               # 随机种子(可复现结果)
  }
}
```

## 与 LangChain 集成

### 基础集成

```python
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate

# 初始化 Ollama
llm = Ollama(model="llama3", base_url="http://localhost:11434")

# 创建提示模板
prompt = ChatPromptTemplate.from_template("请回答: {question}")

# 创建链
chain = prompt | llm

# 执行
result = chain.invoke({"question": "什么是 Python?"})
print(result)
```

### 聊天模型

```python
from langchain_community.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

# 初始化聊天模型
chat_model = ChatOllama(model="llama3", temperature=0.7)

# 发送消息
messages = [
    SystemMessage(content="你是一个 helpful 的 AI 助手"),
    HumanMessage(content="请介绍你自己")
]

response = chat_model.invoke(messages)
print(response.content)
```

### 流式输出

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama3")

# 流式生成
for chunk in llm.stream("写一个关于春天的故事"):
    print(chunk, end="", flush=True)
```

### 嵌入模型

```python
from langchain_community.embeddings import OllamaEmbeddings

# 初始化嵌入模型
embeddings = OllamaEmbeddings(model="llama3")

# 生成嵌入向量
text = "机器学习是人工智能的一个分支"
vector = embeddings.embed_query(text)
print(f"向量维度: {len(vector)}")

# 批量生成嵌入向量
texts = ["深度学习", "自然语言处理", "计算机视觉"]
vectors = embeddings.embed_documents(texts)
print(f"生成了 {len(vectors)} 个向量")
```

### RAG 知识库问答

```python
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# 初始化模型
llm = Ollama(model="llama3")
embeddings = OllamaEmbeddings(model="llama3")

# 加载和分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
docs = text_splitter.create_documents([
    "你的文档内容..."
])

# 创建向量存储
vectorstore = Chroma.from_documents(docs, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 构建 RAG 链
prompt = ChatPromptTemplate.from_template("""
根据以下上下文回答问题:
{context}

问题: {question}
""")

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 问答
answer = rag_chain.invoke("文档的主要内容是什么?")
print(answer)
```

### 结构化输出

```python
from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

# 定义输出结构
class CodeReview(BaseModel):
    summary: str = Field(description="代码摘要")
    issues: list[str] = Field(description="发现的问题列表")
    rating: int = Field(description="评分 1-10")
    suggestion: str = Field(description="改进建议")

# 使用结构化输出
llm = ChatOllama(model="llama3", format="json")
parser = JsonOutputParser(pydantic_object=CodeReview)

prompt = ChatPromptTemplate.from_template(
    "请审查以下代码并给出评价:\n{code}\n{format_instructions}"
)

chain = prompt | llm | parser
result = chain.invoke({
    "code": "def add(a, b): return a + b",
    "format_instructions": parser.get_format_instructions()
})

print(result)
# {'summary': '...', 'issues': [...], 'rating': 8, 'suggestion': '...'}
```

## 与 LlamaIndex 集成

### 基础查询

```python
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# 初始化 LLM 和 Embeddings
llm = Ollama(model="llama3", request_timeout=60.0)
embed_model = OllamaEmbedding(model_name="llama3")

# 加载文档
documents = SimpleDirectoryReader("./data").load_data()

# 创建索引
index = VectorStoreIndex.from_documents(
    documents,
    llm=llm,
    embed_model=embed_model
)

# 查询
query_engine = index.as_query_engine()
response = query_engine.query("文档的主要内容是什么?")
print(response)
```

### 流式查询

```python
# 流式查询
streaming_query_engine = index.as_query_engine(streaming=True)
streaming_response = streaming_query_engine.query("请总结文档的核心观点")

for text in streaming_response.response_gen:
    print(text, end="", flush=True)
```

### 对话式查询（Chat Engine）

```python
# 创建对话引擎
chat_engine = index.as_chat_engine(
    chat_mode="condense_question",
    llm=llm,
    verbose=True
)

# 多轮对话
response1 = chat_engine.chat("文档讲了什么?")
print(response1)

response2 = chat_engine.chat("能详细解释第二部分吗?")
print(response2)

# 重置对话历史
chat_engine.reset()
```

## 常见模型推荐

### 通用对话

| 模型    | 参数量 | 特点               | 适用场景       |
| ------- | ------ | ------------------ | -------------- |
| Llama 3 | 8B/70B | Meta 出品,性能优秀 | 通用对话、编程 |
| Mistral | 7B     | 法国团队,效率高    | 多语言、推理   |
| Qwen    | 7B/72B | 阿里出品,中文好    | 中文应用       |
| Gemma   | 2B/7B  | Google 出品,轻量   | 资源受限环境   |

### 代码专用

| 模型           | 参数量     | 特点              |
| -------------- | ---------- | ----------------- |
| CodeLlama      | 7B/13B/34B | Meta 代码专用模型 |
| StarCoder      | 15B        | 多编程语言支持    |
| DeepSeek-Coder | 6.7B/33B   | 深度求索出品      |

### 数学推理

| 模型      | 参数量 | 特点           |
| --------- | ------ | -------------- |
| Mathstral | 7B     | Mistral 数学版 |
| OpenMath  | 7B     | 开源数学模型   |

### 视觉多模态

| 模型            | 参数量  | 特点                   |
| --------------- | ------- | ---------------------- |
| LLaVA           | 7B/13B  | 图文理解，开源视觉模型 |
| BakLLaVA        | 7B      | Mistral 架构 + 视觉    |
| Llama3.2-Vision | 11B/90B | Meta 官方多模态模型    |

### 嵌入模型

| 模型              | 参数量 | 特点                     |
| ----------------- | ------ | ------------------------ |
| nomic-embed-text  | 137M   | 开源嵌入模型，支持多语言 |
| mxbai-embed-large | 335M   | 高质量嵌入向量           |
| all-minilm        | 38M    | 轻量级嵌入模型           |

### 拉取示例

```bash
# 通用模型
ollama pull llama3:8b
ollama pull mistral:7b
ollama pull qwen:7b

# 代码模型
ollama pull codellama:7b
ollama pull starcoder:7b

# 多模态模型
ollama pull llava:7b
ollama pull bakllava:7b

# 嵌入模型
ollama pull nomic-embed-text
ollama pull mxbai-embed-large

# 轻量模型(适合低配机器)
ollama pull gemma:2b
ollama pull phi3:mini
```

### 硬件与模型选型参考

| 硬件配置            | 推荐模型                | 量化方案 | 显存/内存占用 |
| ------------------- | ----------------------- | -------- | ------------- |
| 8 GB 内存           | gemma:2b, phi3:mini     | Q4_K_M   | ~3 GB         |
| 16 GB 内存          | llama3:8b, qwen:7b      | Q4_K_M   | ~5 GB         |
| 32 GB 内存          | llama3:70b              | Q4_K_M   | ~40 GB        |
| RTX 3060 (12GB)     | llama3:8b, codellama:7b | Q8_0     | ~8 GB         |
| RTX 4090 (24GB)     | llama3:70b              | Q4_K_M   | ~20 GB        |
| Apple M1/M2 (16GB)  | llama3:8b, qwen:7b      | Q5_K_M   | ~6 GB         |
| Apple M3 Max (64GB) | llama3:70b              | Q5_K_M   | ~45 GB        |

## 性能优化

### GPU 加速

#### NVIDIA GPU

```bash
# 确保安装了 CUDA
nvidia-smi

# Ollama 会自动检测并使用 GPU
ollama run llama3
```

#### Apple Silicon (M1/M2/M3)

```bash
# macOS 上自动使用 Metal 加速
ollama run llama3

# 查看 GPU 使用情况
sudo powermetrics --samplers gpu_power -i 1000
```

### 内存优化

```python
# 减小上下文窗口
options = {
    "num_ctx": 2048,  # 默认 4096
    "num_gpu_layers": 20  # 控制 GPU 层数
}

# 量化模型(更小更快)
ollama pull llama3:8b-q4_K_M  # 4-bit 量化
ollama pull llama3:8b-q8_0    # 8-bit 量化
```

#### 量化版本对照

```bash
# 各量化格式对比（以 llama3:8b 为例）
ollama pull llama3:8b           # FP16 原始精度，约 16GB
ollama pull llama3:8b-q8_0      # 8-bit 量化，约 8GB
ollama pull llama3:8b-q5_K_M    # 5-bit 量化，约 5.5GB（推荐平衡）
ollama pull llama3:8b-q4_K_M    # 4-bit 量化，约 4.7GB（推荐速度）
ollama pull llama3:8b-q2_K      # 2-bit 量化，约 2.8GB（最小但质量下降）
```

#### 环境变量调优

```bash
# 控制最大并行请求数
OLLAMA_NUM_PARALLEL=4 ollama serve

# 控制同时加载的模型数量
OLLAMA_MAX_LOADED_MODELS=2 ollama serve

# 设置模型在内存中的保持时间（默认 5 分钟）
OLLAMA_KEEP_ALIVE=30m ollama serve

# 指定 GPU 设备
CUDA_VISIBLE_DEVICES=0 ollama serve

# Flash Attention 加速（需要模型支持）
OLLAMA_FLASH_ATTENTION=1 ollama serve
```

### 并发处理

```python
import asyncio
import aiohttp

async def parallel_chat(prompts):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for prompt in prompts:
            task = send_request(session, prompt)
            tasks.append(task)

        results = await asyncio.gather(*tasks)
        return results

async def send_request(session, prompt):
    async with session.post(
        'http://localhost:11434/api/generate',
        json={"model": "llama3", "prompt": prompt, "stream": False}
    ) as resp:
        return await resp.json()
```

## 生产部署

### Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_data:
```

```bash
# 启动服务
docker-compose up -d

# 预加载模型
docker exec -it ollama ollama pull llama3

# 同时加载多个模型
docker exec -it ollama ollama pull qwen:7b
docker exec -it ollama ollama pull codellama:7b
```

#### 仅 CPU 部署

```yaml
# docker-compose-cpu.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_KEEP_ALIVE=30m
      - OLLAMA_NUM_PARALLEL=4

volumes:
  ollama_data:
```

#### 使用 Dockerfile 自定义镜像

```dockerfile
# Dockerfile
FROM ollama/ollama:latest

# 复制自定义 Modelfile
COPY Modelfile /Modelfile

# 启动服务并创建自定义模型
CMD ["sh", "-c", "ollama serve & sleep 5 && ollama create my-model -f /Modelfile && wait"]
```

```bash
# 构建自定义镜像
docker build -t my-ollama .
docker run -d -p 11434:11434 --name my-ollama my-ollama
```

### Kubernetes 部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
        - name: ollama
          image: ollama/ollama:latest
          ports:
            - containerPort: 11434
          volumeMounts:
            - name: ollama-storage
              mountPath: /root/.ollama
          resources:
            limits:
              nvidia.com/gpu: 1
      volumes:
        - name: ollama-storage
          persistentVolumeClaim:
            claimName: ollama-pvc
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ollama-service
spec:
  type: ClusterIP
  selector:
    app: ollama
  ports:
    - port: 11434
      targetPort: 11434
```

```bash
# 部署和应用
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 预加载模型
kubectl exec -it deploy/ollama -- ollama pull llama3

# 检查 Pod 状态
kubectl get pods -l app=ollama

# 查看日志
kubectl logs -f deploy/ollama
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name ollama.example.com;

    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 增加超时时间
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

#### 带认证的 Nginx 代理

```nginx
server {
    listen 443 ssl;
    server_name ollama.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # 基础认证
    auth_basic "Ollama API";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;

        # 限制请求体大小（模型上传）
        client_max_body_size 100m;
    }
}
```

#### API Key 认证代理

```nginx
server {
    listen 443 ssl;
    server_name ollama.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        # 检查 Authorization Header
        if ($http_authorization != "Bearer your-api-key-here") {
            return 403;
        }

        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_read_timeout 300s;
    }
}
```

## 监控与日志

### 启用详细日志

```bash
# 设置日志级别
export OLLAMA_DEBUG=1

# 重启服务
ollama serve

# 查看服务日志（macOS / Linux）
cat ~/.ollama/logs/server.log

# 实时跟踪日志
tail -f ~/.ollama/logs/server.log

# 查看模型加载日志
OLLAMA_DEBUG=1 ollama run llama3 "hello" 2>&1 | grep -i "load\|gpu\|memory"
```

### 资源监控脚本

```bash
#!/bin/bash
# monitor.sh - 监控 Ollama 服务状态

echo "=== Ollama 服务监控 ==="
echo "时间: $(date)"

# 检查服务是否运行
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "服务状态: 运行中"
else
    echo "服务状态: 已停止"
    exit 1
fi

# 查看已加载的模型
echo ""
echo "=== 已加载模型 ==="
curl -s http://localhost:11434/api/ps | python3 -m json.tool 2>/dev/null

# 查看所有本地模型
echo ""
echo "=== 本地模型列表 ==="
ollama list

# GPU 使用情况（NVIDIA）
if command -v nvidia-smi &> /dev/null; then
    echo ""
    echo "=== GPU 使用情况 ==="
    nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader
fi

# 内存使用
echo ""
echo "=== 系统内存 ==="
free -h 2>/dev/null || vm_stat 2>/dev/null
```

### 性能监控

```python
import time
import requests

def benchmark_model(model, prompt, iterations=10):
    times = []

    for _ in range(iterations):
        start = time.time()

        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }
        )

        elapsed = time.time() - start
        times.append(elapsed)

    avg_time = sum(times) / len(times)
    print(f"平均响应时间: {avg_time:.2f}s")
    print(f"最快: {min(times):.2f}s")
    print(f"最慢: {max(times):.2f}s")

# 测试
benchmark_model("llama3", "解释相对论")
```

### API 调用统计

```python
import requests
import time
from collections import defaultdict

class OllamaMonitor:
    """监控 Ollama API 调用统计"""

    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.stats = defaultdict(lambda: {"calls": 0, "total_time": 0, "errors": 0})

    def chat(self, model, prompt):
        start = time.time()
        try:
            resp = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=120
            )
            elapsed = time.time() - start
            self.stats[model]["calls"] += 1
            self.stats[model]["total_time"] += elapsed

            result = resp.json()
            # 记录 token 统计信息
            if "eval_count" in result:
                tokens = result["eval_count"]
                tps = tokens / elapsed if elapsed > 0 else 0
                print(f"[{model}] {tokens} tokens, {tps:.1f} tokens/s")

            return result['message']['content']

        except Exception as e:
            self.stats[model]["errors"] += 1
            print(f"错误: {e}")
            return None

    def print_stats(self):
        print("\n=== 调用统计 ===")
        for model, data in self.stats.items():
            avg = data["total_time"] / data["calls"] if data["calls"] > 0 else 0
            print(f"模型: {model}")
            print(f"  调用次数: {data['calls']}")
            print(f"  平均耗时: {avg:.2f}s")
            print(f"  错误次数: {data['errors']}")

# 使用示例
monitor = OllamaMonitor()
monitor.chat("llama3", "什么是机器学习?")
monitor.chat("llama3", "解释深度学习")
monitor.chat("qwen:7b", "你好世界")
monitor.print_stats()
```

## 故障排查

### 常见问题

#### 1. 端口被占用

```bash
# 检查端口占用
lsof -i :11434

# 更改端口
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```

#### 2. 内存不足

```bash
# 使用更小的模型
ollama pull gemma:2b

# 或量化版本
ollama pull llama3:8b-q4_K_M
```

#### 3. 模型下载失败

```bash
# 清理缓存
rm -rf ~/.ollama/models

# 重新下载
ollama pull llama3
```

#### 4. GPU 未识别

```bash
# 检查 CUDA
nvidia-smi

# 检查 Ollama 日志
cat ~/.ollama/logs/server.log

# 强制使用 CPU
OLLAMA_NOGPU=1 ollama serve
```

#### 5. 模型加载缓慢

```bash
# 检查磁盘空间
df -h ~/.ollama/models

# 检查磁盘 I/O 性能
iostat -x 1 5

# 预加载模型到内存（避免首次请求慢）
ollama run llama3 "" --verbose 2>/dev/null
# 或使用 keep alive 保持模型在内存中
curl http://localhost:11434/api/generate -d '{"model": "llama3", "keep_alive": "30m"}'
```

#### 6. 并发请求报错

```bash
# 增加并行处理数
OLLAMA_NUM_PARALLEL=4 ollama serve

# 增加同时加载的模型数
OLLAMA_MAX_LOADED_MODELS=3 ollama serve
```

#### 7. 自定义模型创建失败

```bash
# 检查 Modelfile 语法
ollama create test -f Modelfile --verbose

# 确认基础模型已下载
ollama list
ollama pull llama3

# 检查 GGUF 文件路径是否正确
ls -la ./models/*.gguf
```

### 健康检查

```bash
# 检查服务状态
curl http://localhost:11434/api/version

# 列出已加载模型
curl http://localhost:11434/api/tags

# 查看当前运行中的模型
curl http://localhost:11434/api/ps

# 测试生成
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello",
  "stream": false
}'

# 卸载内存中的模型（释放显存）
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "keep_alive": 0
}'
```

#### 自动化健康检查脚本

```python
import requests
import time

def health_check(base_url="http://localhost:11434", model="llama3"):
    """Ollama 服务健康检查"""

    # 1. 检查服务连通性
    try:
        resp = requests.get(f"{base_url}/api/version", timeout=5)
        print(f"✓ 服务运行中: {resp.json()['version']}")
    except requests.ConnectionError:
        print("✗ 服务无法连接")
        return False

    # 2. 检查模型是否可用
    resp = requests.get(f"{base_url}/api/tags", timeout=5)
    models = [m['name'] for m in resp.json().get('models', [])]
    if any(model in m for m in models):
        print(f"✓ 模型 {model} 已就绪")
    else:
        print(f"✗ 模型 {model} 未找到，可用模型: {models}")
        return False

    # 3. 测试生成能力
    start = time.time()
    resp = requests.post(
        f"{base_url}/api/generate",
        json={"model": model, "prompt": "hi", "stream": False},
        timeout=30
    )
    elapsed = time.time() - start

    if resp.status_code == 200:
        print(f"✓ 生成测试通过 ({elapsed:.2f}s)")
    else:
        print(f"✗ 生成测试失败: {resp.status_code}")
        return False

    print("✓ 所有检查通过")
    return True

health_check()
```

## 最佳实践

### 1. 选择合适的模型

```python
# 资源有限 -> 小模型
model = "gemma:2b"

# 平衡性能和速度
model = "llama3:8b"

# 需要高质量输出
model = "llama3:70b"

# 中文应用
model = "qwen:7b"
```

### 2. 提示工程

```python
# 使用清晰的指令
prompt = """
请完成以下任务:
1. 分析问题要点
2. 提供解决方案
3. 给出代码示例

问题: {question}
"""

# Few-shot 示例
prompt = """
示例 1:
输入: 2+2
输出: 4

示例 2:
输入: 3*5
输出: 15

现在请计算: {expression}
"""

# 角色设定提示
prompt = """
你是一个资深 Python 开发者，拥有 10 年经验。
请遵循以下原则回答:
- 代码符合 PEP 8 规范
- 包含完整的类型注解
- 添加 docstring 和注释
- 考虑异常处理和边界情况

问题: {question}
"""

# Chain of Thought（思维链）
prompt = """
请一步步思考以下问题:

问题: {question}

请按以下步骤回答:
1. 首先理解问题
2. 列出关键要素
3. 逐步推理
4. 得出结论
"""
```

### 5. 多模型路由

```python
import requests

# 根据任务类型选择合适的模型
MODEL_ROUTER = {
    "coding": "codellama:7b",
    "chinese": "qwen:7b",
    "math": "mistral:7b",
    "general": "llama3:8b",
    "vision": "llava:7b",
    "embedding": "nomic-embed-text",
}

def smart_chat(prompt, task_type="general"):
    model = MODEL_ROUTER.get(task_type, MODEL_ROUTER["general"])
    response = requests.post(
        'http://localhost:11434/api/chat',
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        },
        timeout=120
    )
    return response.json()['message']['content']

# 使用示例
print(smart_chat("用 Python 写一个快速排序", task_type="coding"))
print(smart_chat("解释一下傅里叶变换", task_type="math"))
print(smart_chat("推荐几本好书", task_type="general"))
```

### 6. 对话历史管理

```python
import requests

class ConversationManager:
    """管理多轮对话历史"""

    def __init__(self, model="llama3", max_history=10):
        self.model = model
        self.max_history = max_history
        self.messages = []

    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})
        # 保留最近 N 轮对话（避免超出上下文窗口）
        if len(self.messages) > self.max_history * 2:
            self.messages = self.messages[-(self.max_history * 2):]

    def chat(self, user_input):
        self.add_message("user", user_input)

        response = requests.post(
            'http://localhost:11434/api/chat',
            json={
                "model": self.model,
                "messages": self.messages,
                "stream": False
            },
            timeout=120
        )

        assistant_msg = response.json()['message']['content']
        self.add_message("assistant", assistant_msg)
        return assistant_msg

    def reset(self):
        self.messages = []

# 使用示例
conv = ConversationManager(model="llama3")
print(conv.chat("你好，我是小明"))
print(conv.chat("我叫什么名字?"))
print(conv.chat("请介绍一下 Python"))
conv.reset()
```

### 3. 错误处理

```python
import requests
from requests.exceptions import ConnectionError, Timeout

def safe_chat(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                'http://localhost:11434/api/chat',
                json={
                    "model": "llama3",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=60
            )
            response.raise_for_status()
            return response.json()

        except ConnectionError:
            print("连接失败,请检查 Ollama 服务是否运行")
            break
        except Timeout:
            print(f"请求超时,重试 {attempt + 1}/{max_retries}")
            continue
        except Exception as e:
            print(f"错误: {e}")
            break

    return None
```

### 4. 缓存策略

```python
import hashlib
import json
import os

class OllamaCache:
    def __init__(self, cache_dir="./cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_key(self, prompt, model):
        key_str = f"{model}:{prompt}"
        return hashlib.md5(key_str.encode()).hexdigest()

    def get(self, prompt, model):
        cache_key = self._get_cache_key(prompt, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")

        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                return json.load(f)
        return None

    def set(self, prompt, model, response):
        cache_key = self._get_cache_key(prompt, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")

        with open(cache_file, 'w') as f:
            json.dump(response, f)

# 使用缓存
cache = OllamaCache()
cached_response = cache.get(prompt, "llama3")

if cached_response:
    print("使用缓存结果")
    response = cached_response
else:
    response = chat_with_ollama(prompt)
    cache.set(prompt, "llama3", response)
```

## 生态系统

### 相关工具

- **Open WebUI**: 美观的 Web 界面，支持多模型切换、对话历史、RAG
- **Ollama.js**: 官方 JavaScript 客户端库
- **Ollama Python**: 官方 Python SDK
- **Continue**: VS Code / JetBrains AI 编程助手(支持 Ollama)
- **AnythingLLM**: 本地 AI 桌面应用，支持文档问答
- **Chatbox**: 跨平台 AI 聊天客户端
- **Enchanted**: macOS / iOS 原生 Ollama 客户端

### Open WebUI 快速部署

```bash
# Docker 一键部署 Open WebUI + Ollama
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main

# 访问 http://localhost:3000 即可使用 Web 界面
```

### Continue 插件配置

```json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "Ollama Llama3",
      "provider": "ollama",
      "model": "llama3",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "Ollama CodeLlama",
      "provider": "ollama",
      "model": "codellama:7b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "CodeLlama Autocomplete",
    "provider": "ollama",
    "model": "codellama:7b-code",
    "apiBase": "http://localhost:11434"
  }
}
```

### 模型仓库

- [Ollama Library](https://ollama.com/library)
- [Hugging Face](https://huggingface.co/models)
- [GGUF Models](https://huggingface.co/TheBloke)

## 学习资源

### 官方文档

- [Ollama 官方网站](https://ollama.com/)
- [GitHub Repository](https://github.com/ollama/ollama)
- [API 文档](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Modelfile 文档](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)
- [OpenAI 兼容性说明](https://github.com/ollama/ollama/blob/main/docs/openai.md)

### 社区资源

- [Discord Community](https://discord.gg/ollama)
- [Reddit r/Ollama](https://www.reddit.com/r/Ollama/)
- [Awesome Ollama](https://github.com/ollama/awesome-ollama)
- [Ollama Blog](https://ollama.com/blog)

### 教程推荐

1. **入门指南**: 从零开始使用 Ollama
2. **模型微调**: 自定义训练自己的模型
3. **RAG 实战**: 结合向量数据库构建知识库
4. **生产部署**: 企业级部署方案
5. **Tool Calling**: 使用 Ollama 实现工具调用（Function Calling）
6. **多模态应用**: 使用 LLaVA / Llama 3.2 Vision 实现图文理解

## 版本更新

### 主要版本变更

| 版本   | 主要变更                                |
| ------ | --------------------------------------- |
| v0.6+  | 支持 Llama 3.2 Vision 多模态、工具调用  |
| v0.5+  | 支持 Llama 3.1、结构化输出（JSON mode） |
| v0.4+  | 支持 Modelfile ADAPTER 指令、嵌入模型   |
| v0.3+  | OpenAI 兼容 API、多模态图片理解         |
| v0.2+  | 支持 Llama 3、并发请求                  |
| v0.1.x | 初始发布，基础模型管理                  |

### 升级方法

```bash
# macOS (Homebrew)
brew upgrade ollama

# Linux / macOS (脚本)
curl -fsSL https://ollama.com/install.sh | sh

# Docker
docker pull ollama/ollama:latest
docker-compose up -d

# 检查更新后的版本
ollama --version
```

### 迁移指南

```bash
# 旧版本命令
ollama run llama2

# 新版本(Llama 3)
ollama run llama3

# 查看已安装模型（升级后确认模型完好）
ollama list

# 清理旧版本缓存（释放磁盘空间）
ollama rm llama2
```

## 总结

Ollama 让本地运行 LLM 变得简单:

1. **易用性**: 一行命令启动模型
2. **灵活性**: 支持多种模型和自定义配置
3. **生态丰富**: 与主流框架无缝集成
4. **隐私安全**: 数据完全本地化

掌握 Ollama 可以帮助你:

- 快速原型验证 AI 应用
- 保护敏感数据隐私
- 降低 API 调用成本
- 离线环境下使用 AI

随着开源模型的发展,Ollama 将继续成为本地 AI 开发的首选工具。建议定期关注新模型发布和性能优化技巧。
