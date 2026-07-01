# Ollama 开发手册

## 概述

Ollama 是一个开源工具,用于在本地运行大型语言模型(LLM)。它简化了模型的下载、管理和部署过程,让开发者能够在自己的机器上轻松运行开源 LLM,如 Llama 3、Mistral、Gemma 等。

### 核心优势

- **本地运行**: 数据隐私安全,无需联网
- **简单易用**: 一行命令即可运行模型
- **多模型支持**: 支持众多开源 LLM
- **API 兼容**: 提供 OpenAI 兼容的 API 接口
- **跨平台**: 支持 macOS、Linux、Windows

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

#### Docker

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 验证安装

```bash
ollama --version
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
```

#### 复制模型

```bash
ollama cp llama3 my-llama3
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
```

#### 后台服务

```bash
# 启动 Ollama 服务(默认端口 11434)
ollama serve

# 检查服务状态
curl http://localhost:11434/api/tags
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

### Python SDK

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

#### 构建自定义模型

```bash
# 从 Modelfile 创建模型
ollama create my-coder -f Modelfile

# 使用自定义模型
ollama run my-coder
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
```

## 与 LlamaIndex 集成

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

### 拉取示例

```bash
# 通用模型
ollama pull llama3:8b
ollama pull mistral:7b
ollama pull qwen:7b

# 代码模型
ollama pull codellama:7b
ollama pull starcoder:7b

# 轻量模型(适合低配机器)
ollama pull gemma:2b
ollama pull phi3:mini
```

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
```

### Kubernetes 部署

```yaml
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

## 监控与日志

### 启用详细日志

```bash
# 设置日志级别
export OLLAMA_DEBUG=1

# 重启服务
ollama serve
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

### 健康检查

```bash
# 检查服务状态
curl http://localhost:11434/api/version

# 列出已加载模型
curl http://localhost:11434/api/tags

# 测试生成
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello",
  "stream": false
}'
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

- **Open WebUI**: 美观的 Web 界面
- **Ollama.js**: JavaScript 客户端库
- **Ollama Python**: 官方 Python SDK
- **Continue**: VS Code AI 编程助手(支持 Ollama)

### 模型仓库

- [Ollama Library](https://ollama.com/library)
- [Hugging Face](https://huggingface.co/models)
- [GGUF Models](https://huggingface.co/TheBloke)

## 学习资源

### 官方文档

- [Ollama 官方网站](https://ollama.com/)
- [GitHub Repository](https://github.com/ollama/ollama)
- [API 文档](https://github.com/ollama/ollama/blob/main/docs/api.md)

### 社区资源

- [Discord Community](https://discord.gg/ollama)
- [Reddit r/Ollama](https://www.reddit.com/r/Ollama/)
- [Awesome Ollama](https://github.com/ollama/awesome-ollama)

### 教程推荐

1. **入门指南**: 从零开始使用 Ollama
2. **模型微调**: 自定义训练自己的模型
3. **RAG 实战**: 结合向量数据库构建知识库
4. **生产部署**: 企业级部署方案

## 版本更新

### v0.1.x 主要特性

- 支持更多模型格式
- 改进的 GPU 支持
- 更好的 API 稳定性
- 性能优化

### 迁移指南

```bash
# 旧版本命令
ollama run llama2

# 新版本(Llama 3)
ollama run llama3
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
