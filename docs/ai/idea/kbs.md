# 程序员离线 AI 知识库搭建指南

## 📖 快速开始

**想快速体验？选择以下任一方案：**

### 方案一：Open WebUI（推荐个人开发者）⭐

```bash
# 一行命令启动
docker run -d -p 3000:8080 -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main

# 访问 http://localhost:3000
```

**优势**：简单易用、功能完善、界面美观

### 方案二：AnythingLLM（推荐团队使用）🏢

```bash
# 一行命令启动
docker run -d -p 3001:3001 -v anythingllm_data:/app/server/storage --name anythingllm --restart always mintplexlabs/anythingllm

# 访问 http://localhost:3001
```

**优势**：企业级功能、权限管理、多工作区

### 方案三：自建 RAG 系统（学习目的）🔧

适合想要深入理解 RAG 原理的开发者，参考本文档「完整搭建步骤」章节。

---

## 概述

离线 AI 知识库允许开发者在无需网络连接的情况下，利用本地大语言模型（LLM）访问个人代码库、技术文档和笔记。本指南将详细介绍从零开始搭建完整的离线 AI 知识管理系统的步骤。

## ❓ 为什么需要离线 AI 知识库？

### 核心优势

| 优势            | 说明                                       |
| --------------- | ------------------------------------------ |
| 🔒 **隐私保护** | 敏感代码和数据不会上传到云端，完全本地运行 |
| 💰 **成本控制** | 避免 API 调用费用，一次性硬件投入          |
| 🌐 **稳定性**   | 不受网络波动影响，随时随地可用             |
| ⚙️ **定制化**   | 完全掌控模型选择和配置，按需优化           |
| ⚡ **速度**     | 本地推理通常更快（取决于硬件配置）         |
| 📚 **知识积累** | 构建个人/团队专属知识库，持续增值          |

### 典型应用场景

- 🔐 **处理机密项目代码** - 金融、医疗等敏感行业
- ✈️ **在无网络环境工作** - 飞机、高铁、偏远地区
- 🔍 **频繁查询大型代码库** - 快速定位和理解代码
- 🎓 **构建个人技术知识体系** - 整理文档、笔记、教程
- 👥 **团队知识共享** - 统一的知识管理平台

## 🏗️ 系统架构

```
┌─────────────────────────────────────┐
│         用户界面层                    │
│  (Open WebUI / AnythingLLM / VS Code)│
└──────────────┬──────────────────────┘
               │ HTTP/API
┌──────────────▼──────────────────────┐
│      应用服务层                       │
│  (RAG 引擎 / 向量检索 / 对话管理)     │
└──────────────┬──────────────────────┘
               │ 向量相似度搜索
┌──────────────▼──────────────────────┐
│      数据存储层                       │
│  (ChromaDB/Qdrant + 原始文档)        │
└──────────────┬──────────────────────┘
               │ Embedding + Prompt
┌──────────────▼──────────────────────┐
│      模型推理层                       │
│  (Ollama: LLM + Embedding 模型)      │
└─────────────────────────────────────┘
```

**数据流向**：

1. 用户上传文档 → 2. 文本分块 → 3. 生成向量 → 4. 存储到向量数据库
2. 用户提问 → 6. 问题向量化 → 7. 检索相关文档 → 8. LLM 生成答案

## 🧩 核心组件选择

### 1. 本地 LLM 推理引擎

#### ⭐ Ollama（强烈推荐）

**适合人群**：所有用户，特别是新手

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 下载模型
ollama pull llama3.2:3b        # 轻量级，4GB RAM
ollama pull qwen2.5:7b         # 中文支持好，8GB RAM
ollama pull codellama:13b      # 代码专用，16GB RAM
ollama pull deepseek-coder:6.7b # 代码生成优秀

# 启动服务
ollama serve
```

**优势**：简单易用、模型丰富、社区活跃、跨平台

#### LM Studio（图形界面友好）

- 下载地址：https://lmstudio.ai/
- 特点：可视化界面，一键下载模型，适合不熟悉命令行的用户
- **适用场景**：Windows/macOS 桌面用户

#### Text Generation WebUI（高级用户）

```bash
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
pip install -r requirements.txt
python server.py
```

**适用场景**：需要更多自定义选项的高级用户

### 2. 向量数据库

#### ⭐ ChromaDB（强烈推荐）

**适合人群**：所有用户，特别是新手和中小型项目

```bash
pip install chromadb
```

**优势**：轻量级、易集成、Python 原生、无需额外服务

#### Qdrant（性能更好）

**适合人群**：需要高性能和生产环境部署

```bash
# Docker 方式
docker run -p 6333:6333 qdrant/qdrant

# Python SDK
pip install qdrant-client
```

**优势**：性能优秀、支持分布式、Rust 编写、API 丰富

#### FAISS（Facebook 开源）

**适合人群**：需要极致性能和完全控制

```bash
pip install faiss-cpu  # CPU 版本
pip install faiss-gpu  # GPU 版本
```

**优势**：速度最快、内存效率高、适合大规模数据
**劣势**：使用复杂、缺少持久化、需要自行管理

### 3. Embedding 模型

#### sentence-transformers（Python 库）

```bash
pip install sentence-transformers

# 常用模型
# all-MiniLM-L6-v2     - 快速，英文
# paraphrase-multilingual-MiniLM-L12-v2 - 多语言
# bge-m3                - 中文效果好
# bge-large-zh          - 中文专用
```

#### Ollama 内置 Embedding（推荐）

```bash
ollama pull nomic-embed-text      # 通用文本嵌入
ollama pull mxbai-embed-large     # 高质量嵌入
```

**推荐**：使用 Ollama 内置 Embedding，无需额外安装 Python 库

### 3.5 Open WebUI（推荐图形界面）

Open WebUI 是一个功能强大的本地 LLM Web 界面，支持 RAG、多模型管理、知识库等功能。

#### Docker 安装（推荐）

```bash
# 拉取并运行 Open WebUI
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main

# 访问 http://localhost:3000
```

#### Docker Compose 安装（与 Ollama 集成）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - '11434:11434'
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    volumes:
      - open-webui_data:/app/backend/data
    ports:
      - '3000:8080'
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
  open-webui_data:
```

启动服务：

```bash
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

#### 主要功能

- ✅ **多模型管理**：切换不同的 Ollama 模型
- ✅ **RAG 知识库**：上传文档并建立索引
- ✅ **聊天历史**：自动保存对话记录
- ✅ **代码高亮**：支持多种编程语言
- ✅ **插件系统**：扩展功能
- ✅ **用户管理**：多用户支持
- ✅ **移动端适配**：响应式设计

#### 配置知识库

1. 访问 http://localhost:3000
2. 注册/登录账号
3. 点击左侧 "Knowledge" 菜单
4. 上传文档（PDF、Markdown、TXT 等）
5. 选择 Embedding 模型
6. 开始提问

#### 环境变量配置

```bash
# 自定义端口
docker run -d \
  -p 8080:8080 \
  -v open-webui:/app/backend/data \
  -e WEBUI_PORT=8080 \
  ghcr.io/open-webui/open-webui:main

# 启用调试模式
-e DEBUG=true

# 配置 Ollama URL
-e OLLAMA_BASE_URL=http://host.docker.internal:11434
```

#### 备份与恢复

```bash
# 备份数据卷
docker run --rm \
  -v open-webui:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/open-webui-backup.tar.gz -C /data .

# 恢复数据
docker run --rm \
  -v open-webui:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/open-webui-backup.tar.gz -C /data
```

**优势**：相比自建 Web 界面，Open WebUI 提供了更完善的功能和更好的用户体验，强烈推荐用于生产环境。

### 3.6 AnythingLLM（企业级知识库）

AnythingLLM 是一个功能强大的本地 RAG 平台，支持多文档源、多用户协作和企业级部署。

#### Docker 安装（推荐）

```bash
# 拉取并运行 AnythingLLM
docker run -d \
  -p 3001:3001 \
  -v anythingllm_data:/app/server/storage \
  --name anythingllm \
  --restart always \
  mintplexlabs/anythingllm

# 访问 http://localhost:3001
```

#### Docker Compose 安装（完整版）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  anythingllm:
    image: mintplexlabs/anythingllm:latest
    container_name: anythingllm
    ports:
      - '3001:3001'
    volumes:
      - anythingllm_storage:/app/server/storage
      - anythingllm_logs:/app/server/logs
    environment:
      - STORAGE_DIR=/app/server/storage
      - LOG_LEVEL=info
      # Ollama 配置
      - LLM_PROVIDER=ollama
      - OLLAMA_BASE_PATH=http://host.docker.internal:11434
      # Embedding 配置
      - EMBEDDING_ENGINE=ollama
      - OLLAMA_EMBEDDING_MODEL=nomic-embed-text
    restart: unless-stopped
    extra_hosts:
      - 'host.docker.internal:host-gateway'

volumes:
  anythingllm_storage:
  anythingllm_logs:
```

启动服务：

```bash
docker compose up -d

# 查看日志
docker compose logs -f anythingllm

# 停止服务
docker compose down
```

#### 主要功能

- ✅ **多文档源支持**：PDF、Word、TXT、Markdown、网站链接等
- ✅ **向量数据库**：内置 ChromaDB，支持 Pinecone、Qdrant 等
- ✅ **多 LLM 提供商**：Ollama、OpenAI、Anthropic、Azure 等
- ✅ **工作区管理**：为不同项目创建独立的知识库
- ✅ **团队协作**：多用户、权限管理
- ✅ **API 接口**：可编程集成到其他应用
- ✅ **聊天历史**：完整的对话记录和管理
- ✅ **引用溯源**：显示答案来源和置信度

#### 初始化配置

1. 访问 http://localhost:3001
2. 创建管理员账号
3. 选择 LLM 提供商（选择 Ollama）
4. 配置 Ollama URL：`http://host.docker.internal:11434`
5. 选择 Embedding 引擎（选择 Ollama）
6. 选择 Embedding 模型：`nomic-embed-text`
7. 完成设置

#### 创建工作区和上传文档

1. 点击 "New Workspace" 创建新工作区
2. 命名工作区（如 "Python 开发文档"）
3. 点击 "Documents" 标签
4. 上传文档或添加网页链接
5. 点击 "Move to Workspace" 将文档添加到工作区
6. 等待向量化完成（可查看进度）
7. 开始在工作区中提问

#### 高级配置

```bash
# 使用自定义端口
docker run -d \
  -p 8080:3001 \
  -v anythingllm_data:/app/server/storage \
  mintplexlabs/anythingllm

# 配置环境变量
-e JWT_SECRET="your-secret-key" \
-e AUTH_TOKEN="your-auth-token" \
-e SERVER_PORT=3001

# 使用外部向量数据库（如 Qdrant）
-e VECTOR_DB_PROVIDER=qdrant \
-e QDRANT_URL=http://qdrant:6333
```

#### 与 Ollama 集成示例

确保 Ollama 已运行并可访问：

```bash
# 测试 Ollama 连接
curl http://localhost:11434/api/tags

# 下载推荐的模型
ollama pull qwen2.5:7b
ollama pull nomic-embed-text

# 在 AnythingLLM 中配置
# LLM Model: qwen2.5:7b
# Embedding Model: nomic-embed-text
```

#### 备份与迁移

```bash
# 备份存储目录
docker cp anythingllm:/app/server/storage ./backup

# 或使用数据卷备份
docker run --rm \
  -v anythingllm_storage:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/anythingllm-backup.tar.gz -C /data .

# 恢复数据
docker run --rm \
  -v anythingllm_storage:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/anythingllm-backup.tar.gz -C /data
```

#### API 使用示例

```bash
# 获取工作区列表
curl -X GET http://localhost:3001/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY"

# 发送查询请求
curl -X POST http://localhost:3001/api/v1/workspace/python-dev/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "如何在 Python 中使用装饰器？",
    "mode": "chat"
  }'
```

#### 性能优化建议

```bash
# 1. 调整批处理大小（大文档时）
-e CHUNK_SIZE=1000 \
-e CHUNK_OVERLAP=200

# 2. 限制并发请求数
-e MAX_CONCURRENT_REQUESTS=5

# 3. 启用缓存
-e ENABLE_CACHE=true \
-e CACHE_TTL=3600

# 4. 配置日志级别
-e LOG_LEVEL=warn  # production
-e LOG_LEVEL=debug # development
```

**对比 Open WebUI**：

- AnythingLLM 更适合**企业级应用**和**团队协作**
- 提供更完善的**权限管理**和**工作区隔离**
- 支持更多**文档源**和**向量数据库**
- API 更加**标准化**，便于集成
- Open WebUI 更轻量，适合**个人使用**和**快速部署**

**选择建议**：

- 个人开发者 → Open WebUI
- 小团队/企业 → AnythingLLM
- 需要复杂权限管理 → AnythingLLM
- 追求简单易用 → Open WebUI

### 4. Web UI 平台对比与选择

> **提示**：对于大多数用户，直接跳过本节，使用上面的「快速开始」方案即可。本节仅作为技术选型参考。

| 特性           | Open WebUI    | AnythingLLM     | 自建方案            |
| -------------- | ------------- | --------------- | ------------------- |
| **部署难度**   | ⭐ 简单       | ⭐⭐ 中等       | ⭐⭐⭐⭐ 复杂       |
| **功能完整性** | ⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 全面 | ⭐⭐ 基础           |
| **自定义程度** | ⭐⭐⭐ 中等   | ⭐⭐⭐ 中等     | ⭐⭐⭐⭐⭐ 完全可控 |
| **适用场景**   | 个人开发      | 团队协作        | 学习研究            |
| **维护成本**   | 低            | 中              | 高                  |
| **社区支持**   | 活跃          | 活跃            | 依赖 LangChain      |

**选择建议**：

- 🎯 **个人开发者** → Open WebUI（轻量、美观、够用）
- 👥 **小团队（2-10人）** → AnythingLLM（权限管理、工作区隔离）
- 🏢 **企业级应用** → AnythingLLM（标准化 API、审计日志）
- 🎓 **学习 RAG 原理** → 自建方案（完全掌控每个环节）

## 完整搭建步骤（自建方案）

> **注意**：如果你已经使用了 Open WebUI 或 AnythingLLM，可以跳过此章节。本节适合想要深入理解 RAG 原理的开发者。

### 第一步：环境准备

```bash
# 创建项目目录
mkdir offline-ai-knowledge-base
cd offline-ai-knowledge-base

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# 安装核心依赖
pip install \
    ollama \
    chromadb \
    sentence-transformers \
    langchain \
    langchain-community \
    langchain-chroma \
    unstructured \
    python-dotenv \
    fastapi \
    uvicorn
```

### 第二步：初始化 Ollama 模型

```bash
# 启动 Ollama 服务
ollama serve

# 在新终端下载模型
ollama pull qwen2.5:7b          # 主对话模型
ollama pull nomic-embed-text    # 向量化模型

# 验证安装
ollama list
ollama run qwen2.5:7b "你好"
```

### 第三步：构建文档索引系统

创建 `indexer.py`：

```python
import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
    UnstructuredMarkdownLoader
)
import hashlib

class KnowledgeIndexer:
    def __init__(self, db_path="./chroma_db", model_name="all-MiniLM-L6-v2"):
        # 初始化向量数据库
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="knowledge_base",
            metadata={"hnsw:space": "cosine"}
        )

        # 初始化 Embedding 模型
        self.embedding_model = SentenceTransformer(model_name)

        # 文本分割器
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def load_documents(self, directory: str, file_types: list = None):
        """加载文档"""
        if file_types is None:
            file_types = ['.md', '.txt', '.py', '.js', '.java']

        documents = []
        loader = DirectoryLoader(
            path=directory,
            glob=f"**/*{{{','.join(file_types)}}}",
            show_progress=True
        )
        documents.extend(loader.load())

        return documents

    def split_and_index(self, documents):
        """分割文档并建立索引"""
        for doc in documents:
            # 生成分块
            chunks = self.text_splitter.split_text(doc.page_content)

            for i, chunk in enumerate(chunks):
                # 生成唯一 ID
                chunk_id = hashlib.md5(
                    f"{doc.metadata.get('source', '')}_{i}".encode()
                ).hexdigest()

                # 生成向量
                embedding = self.embedding_model.encode(chunk).tolist()

                # 存储到向量数据库
                self.collection.add(
                    ids=[chunk_id],
                    embeddings=[embedding],
                    metadatas=[{
                        "source": doc.metadata.get("source", ""),
                        "chunk_index": i,
                        "content_preview": chunk[:100]
                    }],
                    documents=[chunk]
                )

        print(f"索引完成！共存储 {len(documents)} 个文档")

    def index_directory(self, directory: str):
        """索引整个目录"""
        print(f"开始索引目录: {directory}")
        documents = self.load_documents(directory)
        self.split_and_index(documents)

    def clear_index(self):
        """清空索引"""
        self.client.delete_collection("knowledge_base")
        print("索引已清空")

if __name__ == "__main__":
    indexer = KnowledgeIndexer()

    # 索引你的代码库或文档
    indexer.index_directory("./docs")
    indexer.index_directory("./src")
```

### 第四步：构建查询引擎

创建 `query_engine.py`：

```python
import chromadb
from sentence_transformers import SentenceTransformer
from langchain.llms import Ollama
from langchain.prompts import PromptTemplate
from typing import List, Dict

class QueryEngine:
    def __init__(self, db_path="./chroma_db", model_name="all-MiniLM-L6-v2"):
        # 连接向量数据库
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_collection("knowledge_base")

        # 初始化 Embedding 模型
        self.embedding_model = SentenceTransformer(model_name)

        # 初始化 LLM
        self.llm = Ollama(
            model="qwen2.5:7b",
            base_url="http://localhost:11434",
            temperature=0.7
        )

        # 定义提示词模板
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""
你是一个专业的编程助手。基于以下上下文信息回答问题。
如果上下文中没有相关信息，请明确说明。

上下文信息：
{context}

问题：{question}

请提供详细、准确的回答：
"""
        )

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """搜索相关文档"""
        # 生成查询向量
        query_embedding = self.embedding_model.encode(query).tolist()

        # 向量检索
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

        # 格式化结果
        formatted_results = []
        for i, (doc, meta, distance) in enumerate(zip(
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0]
        )):
            formatted_results.append({
                "content": doc,
                "source": meta.get("source", ""),
                "relevance_score": 1 - distance,
                "chunk_index": meta.get("chunk_index", 0)
            })

        return formatted_results

    def generate_answer(self, query: str, context: str) -> str:
        """基于上下文生成答案"""
        prompt = self.prompt_template.format(
            context=context,
            question=query
        )

        answer = self.llm(prompt)
        return answer

    def query(self, question: str, top_k: int = 5) -> Dict:
        """完整查询流程"""
        print(f"\n🔍 搜索相关问题: {question}\n")

        # 检索相关文档
        relevant_docs = self.search(question, top_k)

        if not relevant_docs:
            return {
                "answer": "未找到相关文档",
                "sources": []
            }

        # 构建上下文
        context = "\n\n".join([
            f"[来源: {doc['source']}]\n{doc['content']}"
            for doc in relevant_docs
        ])

        # 生成答案
        print("📝 生成答案中...\n")
        answer = self.generate_answer(question, context)

        return {
            "answer": answer,
            "sources": relevant_docs
        }

    def display_result(self, result: Dict):
        """显示查询结果"""
        print("=" * 80)
        print("💡 答案:")
        print("=" * 80)
        print(result["answer"])
        print("\n")

        print("📚 参考来源:")
        print("-" * 80)
        for i, source in enumerate(result["sources"], 1):
            print(f"{i}. {source['source']}")
            print(f"   相关性: {source['relevance_score']:.2%}")
            print(f"   预览: {source['content'][:100]}...")
            print()

if __name__ == "__main__":
    engine = QueryEngine()

    # 示例查询
    question = "如何在 Python 中使用装饰器？"
    result = engine.query(question)
    engine.display_result(result)
```

### 第五步：创建 Web 界面（可选）

创建 `app.py`：

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from query_engine import QueryEngine
from indexer import KnowledgeIndexer
import uvicorn

app = FastAPI(title="离线 AI 知识库")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化引擎
engine = QueryEngine()
indexer = KnowledgeIndexer()

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

class IndexRequest(BaseModel):
    directory: str

@app.post("/query")
async def query(request: QueryRequest):
    try:
        result = engine.query(request.question, request.top_k)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/index")
async def index_documents(request: IndexRequest):
    try:
        indexer.index_directory(request.directory)
        return {"message": "索引完成"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

启动服务：

```bash
python app.py
```

### 第六步：VS Code 集成（推荐）

安装 VS Code 扩展：

1. **Continue** - https://continue.dev/ （推荐）
2. **Codeium** - 支持本地模型
3. **Tabby** - 开源 AI 编程助手

#### Continue 配置示例

创建 `~/.continue/config.json`：

```json
{
  "models": [
    {
      "title": "Ollama",
      "provider": "ollama",
      "model": "qwen2.5:7b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  },
  "vector": {
    "provider": "chroma",
    "config": {
      "collection": "knowledge_base",
      "directory": "./chroma_db"
    }
  }
}
```

---

## 📚 核心组件详细说明

> 以下章节详细介绍各个组件的选择和配置，供深入学习参考。

## 高级优化技巧

### 1. 提升检索质量

```python
# 使用更好的 Embedding 模型
embedding_model = SentenceTransformer("BAAI/bge-large-zh-v1.5")

# 混合检索（关键词 + 向量）
from rank_bm25 import BM25Okapi

class HybridSearch:
    def __init__(self):
        self.vector_store = ChromaDB()
        self.bm25 = None

    def build_bm25_index(self, documents):
        corpus = [doc.page_content for doc in documents]
        tokenized_corpus = [doc.split() for doc in corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def hybrid_search(self, query, top_k=5):
        # 向量检索
        vector_results = self.vector_store.similarity_search(query, top_k=10)

        # BM25 检索
        query_tokens = query.split()
        bm25_scores = self.bm25.get_scores(query_tokens)

        # 融合排序
        # ... 实现重排序逻辑
```

### 2. 增量更新索引

```python
def incremental_index(indexer, directory):
    """只索引新增或修改的文件"""
    import pickle
    import os

    cache_file = ".index_cache.pkl"
    old_hashes = {}

    if os.path.exists(cache_file):
        with open(cache_file, 'rb') as f:
            old_hashes = pickle.load(f)

    new_hashes = {}
    files_to_index = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.md', '.py', '.js')):
                filepath = os.path.join(root, file)
                file_hash = hashlib.md5(open(filepath, 'rb').read()).hexdigest()
                new_hashes[filepath] = file_hash

                if filepath not in old_hashes or old_hashes[filepath] != file_hash:
                    files_to_index.append(filepath)

    # 索引新文件
    for filepath in files_to_index:
        indexer.index_file(filepath)

    # 保存新的哈希表
    with open(cache_file, 'wb') as f:
        pickle.dump(new_hashes, f)
```

### 3. 多模态支持

```bash
# 安装多模态依赖
pip install unstructured[pdf] pillow pytesseract

# 处理 PDF、图片中的文字
from unstructured.partition.pdf import partition_pdf
from unstructured.partition.image import partition_image

elements = partition_pdf(filename="document.pdf")
for element in elements:
    print(element.text)
```

### 4. 代码专用优化

```python
# 针对代码的特殊处理
class CodeIndexer(KnowledgeIndexer):
    def process_code_file(self, filepath):
        """专门处理代码文件"""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取函数、类定义
        import ast
        tree = ast.parse(content)

        code_chunks = []
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                chunk = ast.get_source_segment(content, node)
                code_chunks.append({
                    "type": type(node).__name__,
                    "name": node.name,
                    "content": chunk
                })

        return code_chunks
```

## 硬件要求参考

| 模型规模 | RAM 需求 | GPU VRAM | 推理速度 | 适用场景   |
| -------- | -------- | -------- | -------- | ---------- |
| 3B       | 4-8 GB   | 2-4 GB   | 快       | 日常问答   |
| 7B       | 8-16 GB  | 6-8 GB   | 中等     | 通用任务   |
| 13B      | 16-32 GB | 10-12 GB | 较慢     | 专业编码   |
| 34B+     | 32GB+    | 24GB+    | 慢       | 高质量输出 |

**推荐配置**：

- 入门：Mac M1/M2 (16GB) 或 RTX 3060 (12GB)
- 进阶：RTX 4090 (24GB) 或 Mac M3 Pro (36GB)
- 专业：多卡 A100/A6000

## 常见问题与解决方案

### Q1: 中文效果不好？

```bash
# 使用中文优化的模型
ollama pull qwen2.5:7b
ollama pull deepseek-coder:6.7b

# 使用中文 Embedding
pip install FlagEmbedding
from FlagEmbedding import FlagModel
model = FlagModel('BAAI/bge-large-zh-v1.5')
```

### Q2: 内存不足？

```bash
# 使用量化模型
ollama pull llama3.2:3b-q4_K_M
ollama pull qwen2.5:7b-q4_K_M

# 或使用 GGUF 格式
# 从 HuggingFace 下载 .gguf 文件，用 llama.cpp 加载
```

### Q3: 检索结果不相关？

- 调整 chunk_size（建议 500-1500）
- 增加 chunk_overlap（建议 100-300）
- 使用更好的 Embedding 模型
- 添加元数据过滤
- 实施查询重写

### Q4: 如何备份知识库？

```bash
# ChromaDB 数据在 ./chroma_db 目录
tar -czf knowledge_backup.tar.gz ./chroma_db

# 恢复
tar -xzf knowledge_backup.tar.gz
```

## 最佳实践

### 1. 文档组织

```
knowledge-base/
├── docs/
│   ├── programming/
│   │   ├── python/
│   │   ├── javascript/
│   │   └── rust/
│   ├── frameworks/
│   │   ├── react/
│   │   ├── vue/
│   │   └── django/
│   └── notes/
├── code/
│   ├── projects/
│   └── snippets/
└── references/
    ├── api-docs/
    └── tutorials/
```

### 2. 定期维护

```python
# 每周运行一次
def maintenance():
    # 清理无效索引
    indexer.cleanup_stale_entries()

    # 重新索引重要文档
    indexer.reindex_priority_files()

    # 备份数据库
    backup_chroma_db()
```

### 3. 性能监控

```python
import time

def benchmark_query(engine, query):
    start = time.time()
    result = engine.query(query)
    elapsed = time.time() - start

    print(f"查询耗时: {elapsed:.2f}s")
    print(f"检索文档数: {len(result['sources'])}")
    print(f"答案长度: {len(result['answer'])} 字符")
```

## 扩展阅读

- **Ollama 官方文档**: https://ollama.com/docs
- **LangChain RAG 教程**: https://python.langchain.com/docs/use_cases/question_answering/
- **ChromaDB 文档**: https://docs.trychroma.com/
- **HuggingFace Embedding 模型**: https://huggingface.co/models?pipeline_tag=feature-extraction
- **Awesome Local AI**: https://github.com/run-llama/awesome-local-ai

## 💡 总结与下一步

### 快速回顾

搭建离线 AI 知识库有三种方案：

1. **Open WebUI**（推荐个人）- 一行命令启动，功能完善
2. **AnythingLLM**（推荐团队）- 企业级功能，权限管理
3. **自建 RAG**（学习目的）- 完全掌控，深入理解原理

### 关键步骤

无论选择哪种方案，核心流程都是：

1. ✅ 安装 Ollama 和本地 LLM
2. ✅ 下载 Embedding 模型
3. ✅ 部署 Web UI 平台
4. ✅ 上传文档并建立索引
5. ✅ 开始提问和探索

### 下一步建议

- 🚀 **立即体验**：使用「快速开始」中的一行命令
- 📖 **深入学习**：阅读「完整搭建步骤」了解 RAG 原理
- 🔧 **优化性能**：参考「高级优化技巧」提升检索质量
- ❓ **解决问题**：查看「常见问题与解决方案」
- 🌐 **扩展阅读**：探索更多本地 AI 工具和资源

---

**最后更新**: 2026-06-23  
**适用平台**: macOS / Linux / Windows  
**难度等级**: ⭐⭐⭐☆☆（中等）  
**预计时间**: 30 分钟（快速方案） / 2-3 小时（自建方案）
