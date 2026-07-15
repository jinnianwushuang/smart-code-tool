# Chroma 向量数据库开发手册

> **版本**: 1.0  
> **最后更新**: 2026-07-16  
> **适用版本**: Chroma 0.5.x / 0.6.x  
> **适用对象**: AI 应用开发者、后端工程师、全栈工程师

---

## 📑 目录

- [一、Chroma 基础](#一chroma-基础)
- [二、安装与配置](#二安装与配置)
- [三、核心概念](#三核心概念)
- [四、基础操作 (CRUD)](#四基础操作-crud)
- [五、Embedding 函数](#五embedding-函数)
- [六、元数据过滤 (Metadata Filtering)](#六元数据过滤-metadata-filtering)
- [七、持久化存储](#七持久化存储)
- [八、集合管理](#八集合管理)
- [九、与 LangChain 集成](#九与-langchain-集成)
- [十、与阿里云百炼集成](#十与阿里云百炼集成)
- [十一、客户端-服务器模式](#十一客户端-服务器模式)
- [十二、Docker 部署](#十二docker-部署)
- [十三、常见应用场景](#十三常见应用场景)
- [十四、性能优化与最佳实践](#十四性能优化与最佳实践)
- [十五、常见问题排查](#十五常见问题排查)

---

## 一、Chroma 基础

### 1.1 什么是 Chroma

Chroma 是一个开源的向量数据库（Vector Database），专为 AI 应用设计，用于存储和检索嵌入向量（Embeddings）。它提供了简单直观的 API，支持元数据过滤和持久化存储。

**核心特性**：

- 零配置启动，开箱即用
- 支持多种 Embedding 模型（OpenAI、HuggingFace、自定义）
- 元数据过滤，精准检索
- 内置持久化，数据不丢失
- 支持客户端-服务器模式，适合生产部署
- Python / JavaScript 双语言 SDK

### 1.2 向量数据库 vs 传统数据库

| 特性     | 向量数据库 (Chroma)  | 关系型数据库 (MySQL) | 文档数据库 (MongoDB) |
| -------- | -------------------- | -------------------- | -------------------- |
| 数据类型 | 向量 + 文本 + 元数据 | 结构化表格           | JSON 文档            |
| 查询方式 | 相似度搜索 (KNN)     | SQL 精确查询         | 字段匹配查询         |
| 核心场景 | RAG、语义搜索、推荐  | 事务处理、报表       | 内容管理、日志       |
| 索引方式 | HNSW / IVF           | B+ Tree              | B+ Tree / 全文       |
| 性能特点 | 高维向量检索快       | 精确查询快           | 灵活 schema          |

### 1.3 典型应用场景

- **RAG (检索增强生成)**：知识库问答系统
- **语义搜索**：基于含义而非关键词的搜索
- **推荐系统**：基于相似度的内容推荐
- **文档去重**：检测相似或重复的文档
- **多模态搜索**：图像、音频的向量检索
- **异常检测**：识别偏离正常模式的数据

---

## 二、安装与配置

### 2.1 Python 安装

```bash
# 基础安装
pip install chromadb

# 安装指定版本
pip install chromadb==0.5.23

# 安装完整版本（包含所有 Embedding 模型支持）
pip install "chromadb[embeddings]"
```

### 2.2 JavaScript / Node.js 安装

```bash
npm install chromadb
# 或
pnpm add chromadb
```

### 2.3 Docker 安装（生产部署）

```bash
docker pull chromadb/chroma

# 快速启动
docker run -p 8000:8000 chromadb/chroma

# 持久化数据启动
docker run -p 8000:8000 -v ./chroma-data:/chroma/chroma chromadb/chroma
```

### 2.4 环境变量配置

```bash
# .env 文件（使用 OpenAI Embedding 时需要）
OPENAI_API_KEY=your-openai-api-key

# 阿里云百炼 API Key
DASHSCOPE_API_KEY=your-dashscope-api-key
```

---

## 三、核心概念

### 3.1 核心术语

| 术语           | 说明                                |
| -------------- | ----------------------------------- |
| **Client**     | Chroma 客户端，连接本地或远程数据库 |
| **Collection** | 数据集合，类似关系型数据库的表      |
| **Document**   | 原始文本内容                        |
| **Embedding**  | 文本转换后的向量表示（浮点数组）    |
| **Metadata**   | 附加在文档上的结构化键值数据        |
| **ID**         | 文档的唯一标识符                    |

### 3.2 数据模型

```
Collection: "my_knowledge_base"
├── Document 1
│   ├── id: "doc_001"
│   ├── document: "LangChain 是一个 AI 开发框架..."
│   ├── embedding: [0.123, 0.456, 0.789, ...]  (1536维)
│   └── metadata: {source: "docs.pdf", page: 1, category: "tech"}
├── Document 2
│   ├── id: "doc_002"
│   ├── document: "Chroma 是一个向量数据库..."
│   ├── embedding: [0.321, 0.654, 0.987, ...]
│   └── metadata: {source: "web", category: "database"}
└── ...
```

---

## 四、基础操作 (CRUD)

### 4.1 初始化客户端

```python
import chromadb

# 内存模式（数据不持久化，适合测试）
client = chromadb.Client()

# 持久化模式（数据保存到磁盘）
client = chromadb.PersistentClient(path="./chroma_db")

# 远程模式（连接 Chroma 服务器）
client = chromadb.HttpClient(host="localhost", port=8000)
```

### 4.2 创建集合

```python
# 创建集合（不存在则创建，已存在则返回）
collection = client.get_or_create_collection(
    name="knowledge_base",
    metadata={"description": "技术知识库"}
)

# 创建集合时指定距离度量方式
from chromadb.utils import embedding_functions

collection = client.create_collection(
    name="my_docs",
    metadata={"hnsw:space": "cosine"}  # cosine | l2 | ip
)
```

**距离度量方式对比**：

| 度量            | 说明                       | 适用场景     |
| --------------- | -------------------------- | ------------ |
| `cosine` (默认) | 余弦相似度，衡量方向相似性 | 文本语义搜索 |
| `l2`            | 欧氏距离，衡量绝对距离     | 图像特征匹配 |
| `ip`            | 内积，综合方向和幅度       | 推荐系统     |

### 4.3 插入数据

```python
# 方式 1：手动提供 Embedding
collection.add(
    ids=["doc_001", "doc_002", "doc_003"],
    embeddings=[
        [0.1, 0.2, 0.3, ...],  # doc_001 的向量
        [0.4, 0.5, 0.6, ...],  # doc_002 的向量
        [0.7, 0.8, 0.9, ...],  # doc_003 的向量
    ],
    documents=["文档内容1", "文档内容2", "文档内容3"],
    metadatas=[
        {"source": "pdf", "page": 1},
        {"source": "web", "category": "tech"},
        {"source": "txt", "category": "guide"},
    ]
)

# 方式 2：使用默认 Embedding 函数（自动向量化）
collection = client.get_or_create_collection(
    name="auto_embed_collection"
    # 默认使用 all-MiniLM-L6-v2 模型
)

collection.add(
    ids=["doc_001", "doc_002"],
    documents=["LangChain 是 AI 开发框架", "Chroma 是向量数据库"],
    metadatas=[{"type": "framework"}, {"type": "database"}]
)
```

### 4.4 查询数据

```python
# 语义搜索（基于向量相似度）
results = collection.query(
    query_texts=["什么是向量数据库？"],
    n_results=3,  # 返回最相似的 3 条结果
    include=["documents", "metadatas", "distances"]
)

# 解析结果
for i in range(len(results["ids"][0])):
    print(f"ID: {results['ids'][0][i]}")
    print(f"文档: {results['documents'][0][i]}")
    print(f"元数据: {results['metadatas'][0][i]}")
    print(f"距离: {results['distances'][0][i]}")
    print("---")

# 多查询文本（批量查询）
results = collection.query(
    query_texts=["向量数据库", "AI 开发框架"],
    n_results=2
)
```

### 4.5 更新数据

```python
# 更新文档内容
collection.update(
    ids=["doc_001"],
    documents=["更新后的文档内容"],
    metadatas=[{"source": "updated", "version": 2}]
)

# Upsert（存在则更新，不存在则插入）
collection.upsert(
    ids=["doc_001", "doc_004"],
    documents=["新内容1", "新内容4"],
    metadatas=[{"v": 2}, {"v": 1}]
)
```

### 4.6 删除数据

```python
# 按 ID 删除
collection.delete(ids=["doc_001", "doc_002"])

# 按条件删除
collection.delete(where={"source": "web"})

# 删除所有数据（谨慎操作）
collection.delete(where={"$and": [{"source": {"$ne": ""}}]})
```

### 4.7 获取数据

```python
# 获取全部数据
all_data = collection.get()

# 按 ID 获取
specific = collection.get(ids=["doc_001", "doc_003"])

# 按元数据条件获取
filtered = collection.get(where={"category": "tech"})

# 限制返回数量
limited = collection.get(limit=10, offset=0)

# 只返回指定字段
docs_only = collection.get(include=["documents"])
```

---

## 五、Embedding 函数

### 5.1 默认 Embedding（all-MiniLM-L6-v2）

```python
# 默认使用 sentence-transformers/all-MiniLM-L6-v2（384维）
collection = client.get_or_create_collection(name="default_embed")

# 添加时自动向量化
collection.add(
    ids=["1"],
    documents=["自动向量化的文本"]
)
```

### 5.2 OpenAI Embedding

```python
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os

openai_ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"  # 1536维
    # model_name="text-embedding-3-large"  # 3072维，更精准
)

collection = client.get_or_create_collection(
    name="openai_collection",
    embedding_function=openai_ef
)
```

### 5.3 阿里云百炼 Embedding（推荐国内用户）

```python
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os

# 百炼兼容 OpenAI 接口
dashscope_ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model_name="text-embedding-v3"  # 1024维
    # 可选: text-embedding-v1, text-embedding-v2, text-embedding-v3
)

collection = client.get_or_create_collection(
    name="dashscope_collection",
    embedding_function=dashscope_ef
)

# 添加数据（自动向量化）
collection.add(
    ids=["doc_001"],
    documents=["阿里云百炼提供高质量的中文文本向量化服务"],
    metadatas=[{"source": "aliyun"}]
)
```

### 5.4 HuggingFace Embedding

```python
from chromadb.utils.embedding_functions import HuggingFaceEmbeddingFunction

hf_ef = HuggingFaceEmbeddingFunction(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    # 适合中文的多语言模型
)

collection = client.get_or_create_collection(
    name="hf_collection",
    embedding_function=hf_ef
)
```

### 5.5 自定义 Embedding 函数

```python
from chromadb import EmbeddingFunction
from typing import List

class MyEmbeddingFunction(EmbeddingFunction):
    def __init__(self, model_path: str):
        # 加载自定义模型
        self.model = self._load_model(model_path)

    def _load_model(self, path):
        # 实现模型加载逻辑
        pass

    def __call__(self, input: List[str]) -> List[List[float]]:
        # 将文本列表转换为向量列表
        embeddings = []
        for text in input:
            vec = self.model.encode(text)
            embeddings.append(vec.tolist())
        return embeddings

# 使用自定义 Embedding
my_ef = MyEmbeddingFunction("./my_model")
collection = client.get_or_create_collection(
    name="custom_collection",
    embedding_function=my_ef
)
```

---

## 六、元数据过滤 (Metadata Filtering)

### 6.1 基础过滤

```python
# 查询时过滤元数据
results = collection.query(
    query_texts=["Python 教程"],
    n_results=5,
    where={"category": "programming"}
)

# get 操作也支持过滤
docs = collection.get(where={"source": "pdf", "page": 1})
```

### 6.2 高级过滤操作符

```python
# 比较操作符
collection.query(
    query_texts=["搜索内容"],
    where={"year": {"$gte": 2023}}  # 大于等于
)

# 支持的操作符:
# $eq  - 等于（默认）
# $ne  - 不等于
# $gt  - 大于
# $gte - 大于等于
# $lt  - 小于
# $lte - 小于等于
# $in  - 在列表中
# $nin - 不在列表中

# $in 操作符
collection.query(
    query_texts=["搜索内容"],
    where={"category": {"$in": ["tech", "science", "math"]}}
)
```

### 6.3 组合条件

```python
# $and 逻辑与
results = collection.query(
    query_texts=["机器学习"],
    where={
        "$and": [
            {"category": {"$eq": "AI"}},
            {"year": {"$gte": 2024}},
            {"language": {"$in": ["zh", "en"]}}
        ]
    }
)

# $or 逻辑或
results = collection.query(
    query_texts=["编程教程"],
    where={
        "$or": [
            {"category": "programming"},
            {"category": "tutorial"},
            {"tag": "beginner"}
        ]
    }
)

# 嵌套组合
results = collection.query(
    query_texts=["深度学习"],
    where={
        "$and": [
            {
                "$or": [
                    {"category": "AI"},
                    {"category": "ML"}
                ]
            },
            {"year": {"$gte": 2023}}
        ]
    }
)
```

### 6.4 文档内容过滤

```python
# 除了元数据过滤，还支持文档内容过滤
results = collection.query(
    query_texts=["Python"],
    where_document={"$contains": "机器学习"}  # 文档中包含指定文本
)

# 组合使用
results = collection.query(
    query_texts=["Python 入门"],
    where={"category": "programming"},
    where_document={"$contains": "基础语法"}
)
```

---

## 七、持久化存储

### 7.1 本地持久化

```python
import chromadb

# 创建持久化客户端
client = chromadb.PersistentClient(
    path="./chroma_db",  # 数据存储目录
)

# 数据会自动保存到磁盘
collection = client.get_or_create_collection(name="persistent_data")
collection.add(
    ids=["1", "2"],
    documents=["持久化文档1", "持久化文档2"]
)

# 重启程序后数据仍然存在
client2 = chromadb.PersistentClient(path="./chroma_db")
collection2 = client2.get_collection("persistent_data")
print(collection2.count())  # 输出: 2
```

### 7.2 数据导入导出

```python
import json

# 导出数据
all_data = collection.get(include=["documents", "metadatas", "embeddings"])
with open("chroma_export.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

# 导入数据
with open("chroma_export.json", "r", encoding="utf-8") as f:
    data = json.load(f)

new_collection = client.get_or_create_collection(name="imported_data")
new_collection.add(
    ids=data["ids"],
    documents=data["documents"],
    metadatas=data["metadatas"],
    embeddings=data["embeddings"]
)
```

---

## 八、集合管理

### 8.1 集合操作

```python
# 列出所有集合
collections = client.list_collections()
for col in collections:
    print(f"集合: {col.name}")

# 获取集合信息
collection = client.get_collection("knowledge_base")
print(f"文档数量: {collection.count()}")

# 修改集合名称和元数据
collection.modify(
    name="new_name",
    metadata={"updated": "2026-07-16"}
)

# 删除集合（不可恢复！）
client.delete_collection("knowledge_base")
```

### 8.2 集合元数据

```python
# 创建时设置元数据
collection = client.create_collection(
    name="tagged_collection",
    metadata={
        "description": "带标签的知识库",
        "version": "1.0",
        "hnsw:space": "cosine",  # 距离度量
        "hnsw:construction_ef": 100,  # 构建参数
        "hnsw:search_ef": 10,  # 搜索参数
    }
)
```

**HNSW 参数说明**：

| 参数                   | 默认值 | 说明                                           |
| ---------------------- | ------ | ---------------------------------------------- |
| `hnsw:space`           | `l2`   | 距离度量 (cosine / l2 / ip)                    |
| `hnsw:construction_ef` | 100    | 构建索引时的搜索宽度，越大索引越精确但构建越慢 |
| `hnsw:search_ef`       | 10     | 搜索时的候选集大小，越大结果越精确但查询越慢   |
| `hnsw:M`               | 16     | 每个节点的最大连接数                           |

---

## 九、与 LangChain 集成

### 9.1 基础集成

```python
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

# 初始化 Embedding
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("DASHSCOPE_API_KEY"),
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="text-embedding-v3"
)

# 方式 1：从文档列表创建
from langchain_core.documents import Document

docs = [
    Document(page_content="LangChain 是 AI 应用开发框架", metadata={"source": "web"}),
    Document(page_content="Chroma 是开源向量数据库", metadata={"source": "doc"}),
]

vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name="langchain_docs",
    persist_directory="./chroma_db"
)

# 方式 2：从文本分割器创建
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

long_text = "这是一段很长的文档内容..." * 100
chunks = text_splitter.split_text(long_text)

vectorstore = Chroma.from_texts(
    texts=chunks,
    embedding=embeddings,
    collection_name="split_docs",
    persist_directory="./chroma_db"
)
```

### 9.2 相似度搜索

```python
# 基础相似度搜索
results = vectorstore.similarity_search("什么是向量数据库？", k=3)
for doc in results:
    print(f"内容: {doc.page_content}")
    print(f"元数据: {doc.metadata}")
    print("---")

# 带距离的搜索
results_with_scores = vectorstore.similarity_search_with_score(
    "AI 开发框架",
    k=3
)
for doc, score in results_with_scores:
    print(f"[{score:.4f}] {doc.page_content}")

# 带元数据过滤的搜索
results = vectorstore.similarity_search(
    "Python 教程",
    k=3,
    filter={"source": "web"}
)
```

### 9.3 作为 Retriever 使用（用于 RAG）

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

# 初始化 LLM
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 创建 Retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",  # 或 "mmr" (最大边际相关性)
    search_kwargs={"k": 3}
)

# MMR Retriever（减少结果冗余）
mmr_retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.5}
)

# 构建 RAG 链
rag_prompt = ChatPromptTemplate.from_template("""
基于以下上下文回答问题：

{context}

问题：{question}

答案：
""")

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
)

# 提问
result = rag_chain.invoke("Chroma 有哪些核心特性？")
print(result.content)
```

---

## 十、与阿里云百炼集成

### 10.1 完整的中文 RAG 方案

```python
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os

# 使用百炼 Embedding
dashscope_ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model_name="text-embedding-v3"
)

# 初始化 Chroma（持久化）
client = chromadb.PersistentClient(path="./chroma_cn_db")
collection = client.get_or_create_collection(
    name="cn_knowledge_base",
    embedding_function=dashscope_ef,
    metadata={"hnsw:space": "cosine"}
)

# 添加中文文档
documents = [
    "LangChain 是一个用于开发大型语言模型应用的开源框架，提供了链式调用、代理、记忆等功能。",
    "Chroma 是一个开源的向量数据库，专为 AI 应用设计，支持语义搜索和元数据过滤。",
    "RAG（检索增强生成）是一种结合信息检索和文本生成的技术，可以提高 LLM 回答的准确性。",
    "阿里云百炼是阿里巴巴推出的一站式大模型服务平台，提供 Qwen 系列模型。",
    "向量数据库将文本转换为高维向量，通过计算向量间的距离来实现语义相似度搜索。",
]

metadatas = [
    {"category": "framework", "source": "official_docs"},
    {"category": "database", "source": "official_docs"},
    {"category": "technique", "source": "blog"},
    {"category": "platform", "source": "aliyun"},
    {"category": "concept", "source": "tutorial"},
]

ids = [f"doc_{i:03d}" for i in range(len(documents))]

collection.add(ids=ids, documents=documents, metadatas=metadatas)

# 语义搜索
results = collection.query(
    query_texts=["如何提高 AI 回答的准确性？"],
    n_results=3,
    include=["documents", "metadatas", "distances"]
)

for i, (doc, meta, dist) in enumerate(zip(
    results["documents"][0],
    results["metadatas"][0],
    results["distances"][0]
)):
    print(f"[{i+1}] (距离: {dist:.4f}) [{meta['category']}] {doc}")
```

### 10.2 百炼 Embedding 模型对比

| 模型                | 维度 | 特点                 | 适用场景         |
| ------------------- | ---- | -------------------- | ---------------- |
| `text-embedding-v1` | 1536 | 基础版，成本低       | 简单语义搜索     |
| `text-embedding-v2` | 1536 | 增强版，效果更好     | 高精度 RAG       |
| `text-embedding-v3` | 1024 | 最新版，支持动态维度 | 通用场景（推荐） |

---

## 十一、客户端-服务器模式

### 11.1 启动 Chroma 服务器

```bash
# 方式 1：使用 chroma CLI
chroma run --path ./chroma_data --host 0.0.0.0 --port 8000

# 方式 2：使用 uvicorn
uvicorn chromadb.app:app --host 0.0.0.0 --port 8000
```

### 11.2 Python 客户端连接

```python
import chromadb

# 连接远程服务器
client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    # ssl=True,  # 启用 HTTPS
    # headers={"Authorization": "Bearer your-token"}  # 认证
)

# 测试连接
print(client.heartbeat())  # 返回服务器时间戳

# 后续操作与本地模式完全一致
collection = client.get_or_create_collection(name="remote_collection")
collection.add(
    ids=["1"],
    documents=["远程存储的文档"]
)
```

### 11.3 JavaScript 客户端

```javascript
import { ChromaClient } from 'chromadb'

// 连接 Chroma 服务器
const client = new ChromaClient({
  path: 'http://localhost:8000',
})

// 创建或获取集合
const collection = await client.getOrCreateCollection({
  name: 'js_collection',
})

// 添加数据
await collection.add({
  ids: ['doc_001', 'doc_002'],
  documents: ['JavaScript 向量搜索', 'Node.js AI 开发'],
  metadatas: [{ lang: 'js' }, { lang: 'nodejs' }],
})

// 查询
const results = await collection.query({
  queryTexts: ['向量数据库'],
  nResults: 2,
})

console.log(results.documents)
```

---

## 十二、Docker 部署

### 12.1 基础 Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  chroma:
    image: chromadb/chroma:latest
    container_name: chroma-server
    ports:
      - '8000:8000'
    volumes:
      - ./chroma-data:/chroma/chroma # 持久化数据
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    restart: unless-stopped
```

### 12.2 带认证的部署

```yaml
# docker-compose.yml（带基础认证）
version: '3.8'

services:
  chroma:
    image: chromadb/chroma:latest
    container_name: chroma-secure
    ports:
      - '8000:8000'
    volumes:
      - ./chroma-data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - CHROMA_SERVER_AUTHN_CREDENTIALS=admin:secure_password_here
      - CHROMA_SERVER_AUTHN_PROVIDER=chromadb.auth.basic_authn.BasicAuthenticationServerProvider
      - ANONYMIZED_TELEMETRY=FALSE
    restart: unless-stopped
```

```bash
# 启动
docker-compose up -d

# 查看日志
docker logs -f chroma-secure
```

### 12.3 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name chroma.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 大文件上传支持
        client_max_body_size 100M;
    }
}
```

---

## 十三、常见应用场景

### 13.1 RAG 知识库系统

```python
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import os

# 1. 加载文档
pdf_loader = PyPDFLoader("knowledge_base.pdf")
docs = pdf_loader.load()

# 2. 文本分割
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", "。", ".", " "]
)
chunks = splitter.split_documents(docs)

# 3. 创建向量存储
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("DASHSCOPE_API_KEY"),
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="text-embedding-v3"
)
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="rag_kb",
    persist_directory="./chroma_rag"
)

# 4. 构建 RAG 链
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

prompt = ChatPromptTemplate.from_template("""
你是一个专业的知识助手。基于以下参考资料回答问题，如果资料中没有相关信息，请明确说明。

参考资料：
{context}

用户问题：{question}

请用中文回答：
""")

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
)

# 5. 使用
answer = rag_chain.invoke("文档中提到的核心技术有哪些？")
print(answer.content)
```

### 13.2 语义搜索引擎

```python
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os

ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model_name="text-embedding-v3"
)

client = chromadb.PersistentClient(path="./search_engine")
collection = client.get_or_create_collection(
    name="articles",
    embedding_function=ef,
    metadata={"hnsw:space": "cosine"}
)

# 索引文章
articles = [
    {"title": "Python 异步编程指南", "content": "asyncio 是 Python 的异步 IO 框架...", "tags": "python"},
    {"title": "Vue 3 组合式 API", "content": "setup 函数是 Vue 3 组合式 API 的入口...", "tags": "vue"},
    {"title": "Docker 容器化部署", "content": "Docker 通过容器技术实现应用的隔离部署...", "tags": "devops"},
    {"title": "RAG 技术详解", "content": "检索增强生成结合了信息检索和文本生成...", "tags": "ai"},
]

for i, article in enumerate(articles):
    collection.add(
        ids=[f"article_{i}"],
        documents=[f"{article['title']}\n{article['content']}"],
        metadatas=[{"title": article["title"], "tags": article["tags"]}]
    )

# 语义搜索（输入自然语言，返回相关文章）
def semantic_search(query: str, top_k: int = 3):
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    search_results = []
    for i in range(len(results["ids"][0])):
        search_results.append({
            "id": results["ids"][0][i],
            "title": results["metadatas"][0][i]["title"],
            "relevance": 1 - results["distances"][0][i],  # cosine 距离转相似度
            "snippet": results["documents"][0][i][:100] + "..."
        })
    return search_results

# 测试
results = semantic_search("如何构建 AI 应用？")
for r in results:
    print(f"[{r['relevance']:.2f}] {r['title']}: {r['snippet']}")
```

### 13.3 文档去重检测

```python
def detect_duplicates(collection, threshold: float = 0.95):
    """检测集合中相似度超过阈值的文档对"""
    all_data = collection.get(include=["documents", "embeddings"])
    ids = all_data["ids"]
    embeddings = all_data["embeddings"]

    duplicates = []
    import numpy as np

    for i in range(len(ids)):
        # 查询与当前文档相似的其他文档
        results = collection.query(
            query_embeddings=[embeddings[i]],
            n_results=5,
            include=["documents", "distances"]
        )
        for j, (result_id, distance) in enumerate(
            zip(results["ids"][0], results["distances"][0])
        ):
            similarity = 1 - distance  # cosine
            if result_id != ids[i] and similarity >= threshold:
                pair = tuple(sorted([ids[i], result_id]))
                if pair not in duplicates:
                    duplicates.append(pair)

    return duplicates
```

---

## 十四、性能优化与最佳实践

### 14.1 批量操作

```python
# 批量插入（推荐，性能远优于逐条插入）
BATCH_SIZE = 500

documents_batch = []
ids_batch = []
metadatas_batch = []

for i, doc in enumerate(large_dataset):
    ids_batch.append(f"doc_{i}")
    documents_batch.append(doc["text"])
    metadatas_batch.append(doc["metadata"])

    if len(ids_batch) >= BATCH_SIZE:
        collection.add(ids=ids_batch, documents=documents_batch, metadatas=metadatas_batch)
        ids_batch.clear()
        documents_batch.clear()
        metadatas_batch.clear()

# 插入剩余数据
if ids_batch:
    collection.add(ids=ids_batch, documents=documents_batch, metadatas=metadatas_batch)
```

### 14.2 合理设置分块大小

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 根据应用场景选择分块大小
splitter_configs = {
    "qa_system": {"chunk_size": 500, "chunk_overlap": 50},     # QA 系统：小块更精准
    "summarization": {"chunk_size": 2000, "chunk_overlap": 200}, # 摘要：大块保留上下文
    "search": {"chunk_size": 800, "chunk_overlap": 100},       # 搜索：均衡
}

splitter = RecursiveCharacterTextSplitter(**splitter_configs["qa_system"])
```

### 14.3 使用 MMR 减少冗余

```python
# MMR (Maximal Marginal Relevance) 在保证相关性的同时减少结果冗余
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 5,           # 返回 5 个结果
        "fetch_k": 20,    # 先检索 20 个候选
        "lambda_mult": 0.7  # 0-1，越大越相关，越小越多样
    }
)
```

### 14.4 生产环境建议

1. **使用客户端-服务器模式**，避免多进程同时访问本地文件
2. **批量写入**，每批 100-1000 条，避免逐条操作
3. **合理设置 HNSW 参数**：
   - 数据量 < 100 万：默认参数即可
   - 数据量 > 100 万：增大 `construction_ef` 和 `M`
4. **定期备份**，导出关键数据到 JSON 或外部存储
5. **监控内存使用**，大规模数据考虑分片或多集合管理

---

## 十五、常见问题排查

### Q1: 嵌入维度不匹配

```python
# 错误：混合使用不同维度的 Embedding
# text-embedding-3-small: 1536 维
# text-embedding-v3: 1024 维

# 解决：一个集合只使用一种 Embedding 函数
# 如需切换，重新创建集合并重新导入数据
```

### Q2: 中文搜索效果不好

```python
# 使用对中文友好的 Embedding 模型
# 推荐 1：阿里云百炼 text-embedding-v3
dashscope_ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model_name="text-embedding-v3"
)

# 推荐 2：HuggingFace 多语言模型
from chromadb.utils.embedding_functions import HuggingFaceEmbeddingFunction
hf_ef = HuggingFaceEmbeddingFunction(
    model_name="BAAI/bge-large-zh-v1.5"  # 中文专用模型
)
```

### Q3: 内存不足

```python
# 大规模数据使用远程 Chroma 服务器
client = chromadb.HttpClient(host="chroma-server", port=8000)

# 或分批加载数据
for batch in data_batches:
    collection.add(**batch)
    import gc
    gc.collect()
```

### Q4: 查询结果不准确

```python
# 1. 增加返回数量
results = collection.query(query_texts=[q], n_results=10)

# 2. 使用更好的 Embedding 模型

# 3. 调整分块大小（更小的块 → 更精准的匹配）

# 4. 添加元数据过滤缩小范围
results = collection.query(
    query_texts=[q],
    n_results=5,
    where={"category": "relevant_category"}
)

# 5. 使用 MMR 提升结果多样性
```

### Q5: 与其他向量数据库对比

| 特性           | Chroma          | Pinecone   | Milvus      | Weaviate    |
| -------------- | --------------- | ---------- | ----------- | ----------- |
| 部署方式       | 本地 / 自托管   | 云服务     | 自托管 / 云 | 自托管 / 云 |
| 易用性         | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐   | ⭐⭐⭐      | ⭐⭐⭐      |
| 性能（大规模） | ⭐⭐⭐          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐    |
| 开源           | ✅              | ❌         | ✅          | ✅          |
| 元数据过滤     | ✅              | ✅         | ✅          | ✅          |
| 适合阶段       | 原型 → 中等生产 | 大规模生产 | 大规模生产  | 中大规模    |

---

## 参考资源

- [Chroma 官方文档](https://docs.trychroma.com/)
- [Chroma GitHub](https://github.com/chroma-core/chroma)
- [Chroma Cookbook](https://cookbook.chromadb.dev/)
- [LangChain + Chroma 集成指南](https://python.langchain.com/docs/integrations/vectorstores/chroma/)
- [阿里云百炼 Embedding 文档](https://help.aliyun.com/zh/model-studio/)
