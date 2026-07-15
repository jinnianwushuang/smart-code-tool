# Milvus 向量数据库开发手册

> **版本**: 1.0  
> **最后更新**: 2026-07-16  
> **适用版本**: Milvus 2.4.x / 2.5.x  
> **适用对象**: AI 应用开发者、后端工程师、数据工程师

---

## 📑 目录

- [一、Milvus 基础](#一milvus-基础)
- [二、安装与部署](#二安装与部署)
- [三、核心概念](#三核心概念)
- [四、Collection 管理](#四collection-管理)
- [五、数据操作 (CRUD)](#五数据操作-crud)
- [六、索引类型与选择](#六索引类型与选择)
- [七、搜索与查询](#七搜索与查询)
- [八、Partition 与 Partition Key](#八partition-与-partition-key)
- [九、PyMilvus 高级用法](#九pymilvus-高级用法)
- [十、与 LangChain 集成](#十与-langchain-集成)
- [十一、与阿里云百炼集成](#十一与阿里云百炼集成)
- [十二、Milvus Lite 轻量模式](#十二milvus-lite-轻量模式)
- [十三、常见应用场景](#十三常见应用场景)
- [十四、集群与生产部署](#十四集群与生产部署)
- [十五、性能优化与最佳实践](#十五性能优化与最佳实践)
- [十六、常见问题排查](#十六常见问题排查)

---

## 一、Milvus 基础

### 1.1 什么是 Milvus

Milvus 是一个开源的高性能向量数据库，由 Zilliz 团队开发，专为大规模向量相似度搜索设计。它支持万亿级向量数据的存储和检索，是目前最成熟的开源向量数据库之一。

**核心特性**：

- 高性能：支持万亿级向量数据，毫秒级查询响应
- 云原生架构：计算与存储分离，弹性扩展
- 丰富的索引类型：HNSW、IVF_FLAT、IVF_SQ8、DiskANN 等
- 混合查询：向量搜索 + 标量过滤同时执行
- GPU 加速：支持 GPU 索引构建和搜索
- 多语言 SDK：Python、Java、Go、Node.js、C#
- 多模态支持：文本、图像、音视频向量

### 1.2 向量数据库对比

| 特性     | Milvus                | Chroma          | Pinecone   | Weaviate    |
| -------- | --------------------- | --------------- | ---------- | ----------- |
| 部署方式 | 自托管 / Zilliz Cloud | 本地 / 自托管   | 云服务     | 自托管 / 云 |
| 数据规模 | 万亿级                | 百万级          | 十亿级     | 十亿级      |
| 开源     | ✅ Apache 2.0         | ✅ Apache 2.0   | ❌         | ✅ BSD      |
| GPU 加速 | ✅                    | ❌              | ❌         | ❌          |
| 混合查询 | ✅ 强                 | ✅ 基础         | ✅ 基础    | ✅ 强       |
| 易用性   | ⭐⭐⭐                | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐   | ⭐⭐⭐      |
| 适合阶段 | 中大规模生产          | 原型 → 中等生产 | 大规模生产 | 中大规模    |

### 1.3 典型应用场景

- **RAG (检索增强生成)**：大规模知识库问答系统
- **语义搜索**：万亿级文档的语义检索
- **推荐系统**：基于用户行为向量的实时推荐
- **图像/视频搜索**：以图搜图、视频内容检索
- **异常检测**：网络安全、金融风控
- **药物发现**：分子结构相似度搜索

---

## 二、安装与部署

### 2.1 Milvus Lite（本地开发，推荐入门）

```bash
# 安装 pymilvus（包含 Milvus Lite）
pip install pymilvus

# Milvus Lite 无需 Docker，直接在 Python 中使用
```

```python
from pymilvus import MilvusClient

# 本地文件模式（数据持久化到文件）
client = MilvusClient(uri="./milvus_demo.db")

# 内存模式（数据不持久化，适合测试）
client = MilvusClient(uri=":memory:")
```

### 2.2 Docker 单机部署（开发/测试环境）

```bash
# 下载 docker-compose 文件
wget https://github.com/milvus-io/milvus/releases/download/v2.4.0/milvus-standalone-docker-compose.yml -O docker-compose.yml

# 启动 Milvus Standalone
docker-compose up -d

# 验证启动状态
docker-compose ps

# 服务端口：19530（gRPC）、9091（metrics）
```

```yaml
# 简化版 docker-compose.yml（Milvus Standalone）
version: '3.5'

services:
  etcd:
    image: quay.io/coreos/etcd:v3.5.5
    container_name: milvus-etcd
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
    volumes:
      - etcd_data:/etcd

  minio:
    image: minio/minio:latest
    container_name: milvus-minio
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    volumes:
      - minio_data:/minio_data
    command: minio server /minio_data

  standalone:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-standalone
    ports:
      - '19530:19530'
      - '9091:9091'
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    depends_on:
      - etcd
      - minio

volumes:
  etcd_data:
  minio_data:
```

### 2.3 连接 Milvus 服务器

```python
from pymilvus import connections, MilvusClient

# 方式 1：使用 MilvusClient（推荐，2.4+ 版本）
client = MilvusClient(
    uri="http://localhost:19530",
    # token="root:Milvus",  # 认证（默认用户名 root，密码 Milvus）
)

# 方式 2：使用 connections（旧版 API）
connections.connect(
    alias="default",
    host="localhost",
    port="19530",
    # user="root",
    # password="Milvus",
)
```

### 2.4 Zilliz Cloud（托管云服务）

```python
from pymilvus import MilvusClient

# 连接 Zilliz Cloud
client = MilvusClient(
    uri="https://your-cluster-id.api.gcp-us-west1.zillizcloud.com:19530",
    token="your-api-key"
)
```

---

## 三、核心概念

### 3.1 数据模型

```
Database (数据库)
└── Collection (集合，类似关系型数据库的表)
    ├── Field: id (INT64, 主键)
    ├── Field: vector (FLOAT_VECTOR, dim=768)
    ├── Field: text (VARCHAR, max_length=65535)
    ├── Field: category (VARCHAR, 标量过滤字段)
    ├── Field: year (INT64, 标量过滤字段)
    ├── Index: vector_index (HNSW)
    └── Partition (分区，可选)
        ├── _default
        └── partition_2024
```

### 3.2 核心术语

| 术语            | 说明                             |
| --------------- | -------------------------------- |
| **Collection**  | 数据集合，类似关系型数据库的表   |
| **Field**       | 字段定义，包括标量字段和向量字段 |
| **Schema**      | Collection 的结构定义            |
| **Index**       | 向量字段的索引，加速搜索         |
| **Partition**   | 数据分区，提高查询效率           |
| **Segment**     | 数据分片，Milvus 的底层存储单元  |
| **Entity**      | 一条数据记录                     |
| **Metric Type** | 距离度量方式（L2、IP、COSINE）   |

### 3.3 支持的数据类型

| 类型                                 | 说明       | 示例                |
| ------------------------------------ | ---------- | ------------------- |
| `INT8` / `INT16` / `INT32` / `INT64` | 整数       | `INT64` 主键        |
| `FLOAT` / `DOUBLE`                   | 浮点数     | 评分、价格          |
| `BOOL`                               | 布尔值     | 状态标记            |
| `VARCHAR`                            | 字符串     | 文本内容、分类标签  |
| `JSON`                               | JSON 对象  | 灵活元数据          |
| `ARRAY`                              | 数组       | 标签列表            |
| `FLOAT_VECTOR`                       | 浮点向量   | 文本/图像 Embedding |
| `BINARY_VECTOR`                      | 二进制向量 | 指纹、哈希特征      |
| `SPARSE_FLOAT_VECTOR`                | 稀疏向量   | BM25、TF-IDF        |

---

## 四、Collection 管理

### 4.1 创建 Collection（简单方式）

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="http://localhost:19530")

# 快速创建（自动创建 id + vector 字段）
client.create_collection(
    collection_name="quick_demo",
    dimension=768  # 向量维度
)
```

### 4.2 创建 Collection（自定义 Schema）

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

# 1. 创建 Schema
schema = MilvusClient.create_schema(
    auto_id=False,          # 手动指定 ID
    enable_dynamic_field=True  # 支持动态字段
)

# 2. 添加字段
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=128)
schema.add_field(field_name="year", datatype=DataType.INT32)
schema.add_field(field_name="tags", datatype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=10, max_length=64)
schema.add_field(field_name="metadata", datatype=DataType.JSON)

# 3. 创建索引参数
index_params = client.prepare_index_params()

# 向量字段索引
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    metric_type="COSINE",
    params={"M": 16, "efConstruction": 200}
)

# 标量字段索引（加速过滤查询）
index_params.add_index(
    field_name="category",
    index_type="Trie"  # 字符串字段用 Trie 索引
)

# 4. 创建 Collection
client.create_collection(
    collection_name="knowledge_base",
    schema=schema,
    index_params=index_params
)

# 查看 Collection 信息
info = client.describe_collection("knowledge_base")
print(f"字段: {[f['name'] for f in info['fields']]}")
```

### 4.3 Collection 操作

```python
# 列出所有 Collection
collections = client.list_collections()
print(collections)

# 检查 Collection 是否存在
exists = client.has_collection("knowledge_base")
print(f"存在: {exists}")

# 查看 Collection 统计信息
stats = client.get_collection_stats("knowledge_base")
print(f"数据量: {stats['row_count']}")

# 删除 Collection（不可恢复！）
client.drop_collection("knowledge_base")
```

---

## 五、数据操作 (CRUD)

### 5.1 插入数据

```python
import numpy as np

# 准备数据
data = [
    {
        "id": 1,
        "vector": np.random.rand(768).tolist(),
        "text": "LangChain 是 AI 应用开发框架",
        "category": "AI",
        "year": 2024,
        "tags": ["langchain", "ai", "framework"],
        "metadata": {"source": "web", "author": "tech_blog"}
    },
    {
        "id": 2,
        "vector": np.random.rand(768).tolist(),
        "text": "Milvus 是高性能向量数据库",
        "category": "database",
        "year": 2024,
        "tags": ["milvus", "vector", "database"],
        "metadata": {"source": "official", "author": "zilliz"}
    },
    {
        "id": 3,
        "vector": np.random.rand(768).tolist(),
        "text": "RAG 技术结合检索和生成",
        "category": "AI",
        "year": 2025,
        "tags": ["rag", "retrieval"],
        "metadata": {"source": "paper", "author": "researcher"}
    }
]

# 插入数据
result = client.insert(
    collection_name="knowledge_base",
    data=data
)
print(f"插入数量: {result['insert_count']}")
```

### 5.2 Upsert（插入或更新）

```python
# Upsert：ID 存在则更新，不存在则插入
upsert_data = [
    {
        "id": 1,
        "vector": np.random.rand(768).tolist(),
        "text": "LangChain 是 AI 应用开发框架（已更新）",
        "category": "AI",
        "year": 2025,
    }
]

result = client.upsert(
    collection_name="knowledge_base",
    data=upsert_data
)
```

### 5.3 查询数据

```python
# 按 ID 查询
result = client.query(
    collection_name="knowledge_base",
    ids=[1, 2, 3]
)
for r in result:
    print(r)

# 按条件查询
result = client.query(
    collection_name="knowledge_base",
    filter='category == "AI" and year >= 2024',
    output_fields=["text", "category", "year"],
    limit=10
)
for r in result:
    print(f"[{r['category']}] {r['text']}")

# 查询所有数据（注意：大数据量时设置 limit）
result = client.query(
    collection_name="knowledge_base",
    filter="",
    output_fields=["*"],
    limit=100,
    offset=0  # 分页
)
```

### 5.4 删除数据

```python
# 按 ID 删除
client.delete(
    collection_name="knowledge_base",
    ids=[1, 2]
)

# 按条件删除
client.delete(
    collection_name="knowledge_base",
    filter='category == "deprecated"'
)
```

---

## 六、索引类型与选择

### 6.1 索引类型对比

| 索引类型         | 内存占用 | 查询速度 | 精度 | 适用场景                   |
| ---------------- | -------- | -------- | ---- | -------------------------- |
| **FLAT**         | 高       | 中       | 100% | 小数据集精确搜索           |
| **IVF_FLAT**     | 中       | 快       | 高   | 中等数据集，平衡速度和精度 |
| **IVF_SQ8**      | 低       | 很快     | 中高 | 大规模数据，内存有限       |
| **IVF_PQ**       | 很低     | 很快     | 中   | 超大规模数据               |
| **HNSW**         | 高       | 很快     | 很高 | 高性能场景（推荐）         |
| **DISKANN**      | 很低     | 快       | 高   | 数据量超出内存             |
| **SCANN**        | 中       | 很快     | 高   | Google 优化的索引          |
| **GPU_IVF_FLAT** | GPU 显存 | 极快     | 高   | GPU 加速场景               |

### 6.2 距离度量方式

| 度量类型 | 说明       | 适用场景             |
| -------- | ---------- | -------------------- |
| `L2`     | 欧氏距离   | 图像特征、数值向量   |
| `IP`     | 内积       | 推荐系统、归一化向量 |
| `COSINE` | 余弦相似度 | 文本语义搜索（推荐） |

### 6.3 创建索引

```python
# HNSW 索引（推荐，综合性能最好）
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    metric_type="COSINE",
    params={
        "M": 16,             # 每个节点的最大连接数（16-64）
        "efConstruction": 200  # 构建时搜索范围（100-500）
    }
)
client.create_index(
    collection_name="knowledge_base",
    index_params=index_params
)

# IVF_FLAT 索引（内存适中，精度高）
index_params.add_index(
    field_name="vector",
    index_type="IVF_FLAT",
    metric_type="COSINE",
    params={"nlist": 1024}  # 聚类数（数据量/40 左右）
)

# DiskANN 索引（数据量超出内存时使用）
index_params.add_index(
    field_name="vector",
    index_type="DISKANN",
    metric_type="COSINE",
    params={}
)

# 加载 Collection 到内存（搜索前必须执行）
client.load_collection("knowledge_base")
```

---

## 七、搜索与查询

### 7.1 向量相似度搜索

```python
# 基础搜索
query_vector = np.random.rand(768).tolist()

results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=5,  # Top-K
    output_fields=["text", "category", "year"]
)

# 解析结果
for hits in results:
    for hit in hits:
        print(f"ID: {hit['id']}, 距离: {hit['distance']:.4f}")
        print(f"  内容: {hit['entity']['text']}")
        print(f"  分类: {hit['entity']['category']}")
```

### 7.2 带过滤条件的搜索

```python
# 向量搜索 + 标量过滤（混合查询）
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=5,
    filter='category == "AI" and year >= 2024',
    output_fields=["text", "category", "year"]
)

# 复杂过滤条件
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=5,
    filter='category in ["AI", "database"] and year > 2023 and tags like "%vector%"',
    output_fields=["text", "category"]
)
```

### 7.3 搜索参数调优

```python
# HNSW 搜索参数
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=10,
    search_params={
        "ef": 128  # 搜索时探索范围（越大越精准，越慢）
        # 建议：ef = limit * 2 ~ limit * 4
    },
    output_fields=["text"]
)

# IVF 搜索参数
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=10,
    search_params={
        "nprobe": 16  # 搜索时探测的聚类数（越大越精准）
    }
)
```

### 7.4 批量搜索

```python
# 多个查询向量同时搜索
query_vectors = [np.random.rand(768).tolist() for _ in range(10)]

results = client.search(
    collection_name="knowledge_base",
    data=query_vectors,
    limit=5,
    output_fields=["text"]
)

# 每个查询向量的结果
for i, hits in enumerate(results):
    print(f"\n查询 {i+1} 的结果:")
    for hit in hits:
        print(f"  ID: {hit['id']}, 距离: {hit['distance']:.4f}")
```

### 7.5 混合搜索（Hybrid Search）

```python
from pymilvus import AnnSearchRequest, WeightedRanker, RRFRanker

# 稠密向量搜索请求
dense_request = AnnSearchRequest(
    data=[dense_vector],       # 768维稠密向量
    anns_field="dense_vector",
    param={"metric_type": "COSINE", "params": {"ef": 128}},
    limit=20
)

# 稀疏向量搜索请求（BM25 关键词匹配）
sparse_request = AnnSearchRequest(
    data=[sparse_vector],       # 稀疏向量
    anns_field="sparse_vector",
    param={"metric_type": "IP"},
    limit=20
)

# 混合搜索（RRF 融合排序）
from pymilvus import hybrid_search

results = hybrid_search(
    collection_name="knowledge_base",
    reqs=[dense_request, sparse_request],
    ranker=RRFRanker(k=60),    # RRF 排序
    # ranker=WeightedRanker(0.7, 0.3),  # 加权排序
    limit=10,
    output_fields=["text"]
)
```

---

## 八、Partition 与 Partition Key

### 8.1 Partition 分区

```python
# 创建分区
client.create_partition(
    collection_name="knowledge_base",
    partition_name="partition_2024"
)

# 列出分区
partitions = client.list_partitions("knowledge_base")
print(partitions)

# 插入数据到指定分区
client.insert(
    collection_name="knowledge_base",
    data=data,
    partition_name="partition_2024"
)

# 在指定分区中搜索（缩小搜索范围）
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=5,
    partition_names=["partition_2024"]
)

# 删除分区
client.drop_partition(
    collection_name="knowledge_base",
    partition_name="partition_2024"
)
```

### 8.2 Partition Key（自动分区）

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

schema = MilvusClient.create_schema(auto_id=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)

# 使用 Partition Key：自动按 category 值路由到对应分区
schema.add_field(
    field_name="category",
    datatype=DataType.VARCHAR,
    max_length=128,
    is_partition_key=True  # 标记为分区键
)

# 设置分区数
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="HNSW", metric_type="COSINE")

client.create_collection(
    collection_name="partitioned_kb",
    schema=schema,
    index_params=index_params,
    num_partitions=16  # 分区数量
)

# 插入数据时自动路由到对应分区
# 搜索时指定 filter 会自动进行分区裁剪（Partition Pruning）
results = client.search(
    collection_name="partitioned_kb",
    data=[query_vector],
    filter='category == "AI"',  # 自动只在 AI 分区中搜索
    limit=5
)
```

---

## 九、PyMilvus 高级用法

### 9.1 动态字段（Dynamic Fields）

```python
# Schema 启用动态字段
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True  # 允许插入未定义的字段
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)

# 插入时可以添加 Schema 中未定义的字段
data = [
    {
        "id": 1,
        "vector": np.random.rand(768).tolist(),
        "custom_field_1": "动态值1",  # 动态字段
        "custom_field_2": 42,         # 动态字段
        "nested": {"key": "value"}    # 动态 JSON 字段
    }
]

client.insert(collection_name="dynamic_collection", data=data)

# 查询动态字段
results = client.query(
    collection_name="dynamic_collection",
    filter='custom_field_2 > 10',
    output_fields=["custom_field_1", "nested"]
)
```

### 9.2 多向量字段

```python
schema = MilvusClient.create_schema(auto_id=True)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)

# 多个向量字段（如：文本向量 + 图像向量）
schema.add_field(field_name="text_vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=512)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)

# 为每个向量字段创建索引
index_params = client.prepare_index_params()
index_params.add_index(field_name="text_vector", index_type="HNSW", metric_type="COSINE")
index_params.add_index(field_name="image_vector", index_type="HNSW", metric_type="L2")

client.create_collection(
    collection_name="multi_vector",
    schema=schema,
    index_params=index_params
)
```

### 9.3 迭代器查询（大规模数据遍历）

```python
# 使用迭代器遍历所有数据
iterator = client.query_iterator(
    collection_name="knowledge_base",
    batch_size=1000,
    output_fields=["text", "category"]
)

total = 0
while True:
    result = iterator.next()
    if not result:
        break
    for row in result:
        total += 1
        # 处理每条数据
    print(f"已处理: {total}")

iterator.close()
```

---

## 十、与 LangChain 集成

### 10.1 基础集成

```python
from langchain_community.vectorstores import Milvus
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_core.documents import Document
import os

# 初始化 Embedding
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("DASHSCOPE_API_KEY"),
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="text-embedding-v3"
)

# 从文档创建 Milvus 向量存储
docs = [
    Document(page_content="Milvus 是高性能向量数据库", metadata={"source": "web"}),
    Document(page_content="LangChain 是 AI 开发框架", metadata={"source": "doc"}),
]

vectorstore = Milvus.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name="langchain_milvus",
    connection_args={"uri": "http://localhost:19530"}
)

# 相似度搜索
results = vectorstore.similarity_search("向量数据库", k=3)
for doc in results:
    print(f"{doc.page_content} | {doc.metadata}")
```

### 10.2 RAG 集成

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

# LLM
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# Retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# RAG 链
rag_prompt = ChatPromptTemplate.from_template("""
基于以下参考资料回答问题：

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
answer = rag_chain.invoke("Milvus 支持哪些索引类型？")
print(answer.content)
```

### 10.3 MMR Retriever

```python
# MMR 检索（减少结果冗余）
mmr_retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 5,
        "fetch_k": 20,
        "lambda_mult": 0.5
    }
)

results = mmr_retriever.invoke("向量数据库的特性")
for doc in results:
    print(doc.page_content[:100])
```

---

## 十一、与阿里云百炼集成

### 11.1 完整的中文 RAG 方案

```python
from pymilvus import MilvusClient, DataType
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import numpy as np, os

# 百炼 Embedding（通过 OpenAI 兼容接口）
def get_dashscope_embeddings(texts: list[str]) -> list[list[float]]:
    """使用阿里云百炼获取文本向量"""
    from openai import OpenAI
    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    response = client.embeddings.create(
        model="text-embedding-v3",
        input=texts
    )
    return [item.embedding for item in response.data]

# 连接 Milvus
milvus_client = MilvusClient(uri="http://localhost:19530")

# 创建 Schema
schema = MilvusClient.create_schema(auto_id=True)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=1024)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)
schema.add_field(field_name="source", datatype=DataType.VARCHAR, max_length=256)
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=128)

# 创建索引
index_params = milvus_client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    metric_type="COSINE",
    params={"M": 16, "efConstruction": 200}
)

milvus_client.create_collection(
    collection_name="cn_rag_kb",
    schema=schema,
    index_params=index_params
)

# 添加中文文档
documents = [
    "Milvus 是一个开源的高性能向量数据库，支持万亿级向量数据的存储和检索。",
    "RAG（检索增强生成）结合了信息检索和文本生成，提高 LLM 回答的准确性。",
    "LangChain 是一个用于开发大型语言模型应用的框架，提供了链式调用和代理功能。",
    "阿里云百炼提供 Qwen 系列大模型和高质量的中文文本 Embedding 服务。",
    "HNSW 是一种基于图的近似最近邻搜索算法，具有很高的搜索精度和速度。",
]

vectors = get_dashscope_embeddings(documents)

data = [
    {
        "vector": vectors[i],
        "text": documents[i],
        "source": "handbook",
        "category": "tech"
    }
    for i in range(len(documents))
]

milvus_client.insert(collection_name="cn_rag_kb", data=data)

# 语义搜索
query_vector = get_dashscope_embeddings(["什么是向量数据库？"])[0]
results = milvus_client.search(
    collection_name="cn_rag_kb",
    data=[query_vector],
    limit=3,
    output_fields=["text", "source"]
)

for hits in results:
    for hit in hits:
        print(f"[{hit['distance']:.4f}] {hit['entity']['text']}")
```

---

## 十二、Milvus Lite 轻量模式

### 12.1 基础使用

Milvus Lite 是 Milvus 的轻量版本，无需 Docker，可直接在 Python 进程中运行。

```python
from pymilvus import MilvusClient

# 文件持久化
client = MilvusClient(uri="./milvus_local.db")

# 创建 Collection
client.create_collection(
    collection_name="lite_demo",
    dimension=384  # 向量维度
)

# 插入数据
client.insert(
    collection_name="lite_demo",
    data=[
        {"id": 1, "vector": [0.1] * 384, "text": "轻量模式文档1"},
        {"id": 2, "vector": [0.2] * 384, "text": "轻量模式文档2"},
    ]
)

# 搜索
results = client.search(
    collection_name="lite_demo",
    data=[[0.15] * 384],
    limit=2,
    output_fields=["text"]
)
```

### 12.2 Milvus Lite 适用场景

| 场景                       | 推荐                              |
| -------------------------- | --------------------------------- |
| 本地开发和原型验证         | ✅ 推荐                           |
| Jupyter Notebook 实验      | ✅ 推荐                           |
| 边缘设备部署               | ✅ 推荐                           |
| 中小规模数据（< 100 万条） | ✅ 可用                           |
| 大规模生产环境             | ❌ 用 Milvus Standalone / Cluster |
| 高并发访问                 | ❌ 用 Milvus Standalone / Cluster |

---

## 十三、常见应用场景

### 13.1 大规模 RAG 知识库

```python
from pymilvus import MilvusClient
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import os

client = MilvusClient(uri="http://localhost:19530")

# 1. 加载和分割文档
loader = PyPDFLoader("large_document.pdf")
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
chunks = splitter.split_documents(docs)

# 2. 获取 Embedding
from openai import OpenAI
embed_client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

def batch_embed(texts, batch_size=25):
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        resp = embed_client.embeddings.create(model="text-embedding-v3", input=batch)
        all_embeddings.extend([item.embedding for item in resp.data])
    return all_embeddings

texts = [chunk.page_content for chunk in chunks]
vectors = batch_embed(texts)

# 3. 批量插入 Milvus
data = [
    {
        "vector": vectors[i],
        "text": texts[i],
        "source": chunk.metadata.get("source", ""),
        "page": chunk.metadata.get("page", 0)
    }
    for i, chunk in enumerate(chunks)
]

# 分批插入
BATCH = 500
for i in range(0, len(data), BATCH):
    client.insert(collection_name="rag_kb", data=data[i:i+BATCH])

print(f"已插入 {len(data)} 条文档片段")
```

### 13.2 多模态搜索

```python
# 图像向量搜索
schema = MilvusClient.create_schema(auto_id=True)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=512)
schema.add_field(field_name="image_path", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="description", datatype=DataType.VARCHAR, max_length=1024)

index_params = client.prepare_index_params()
index_params.add_index(field_name="image_vector", index_type="HNSW", metric_type="L2")

client.create_collection(
    collection_name="image_search",
    schema=schema,
    index_params=index_params
)

# 以图搜图
def search_similar_images(query_image_vector, top_k=5):
    results = client.search(
        collection_name="image_search",
        data=[query_image_vector],
        limit=top_k,
        output_fields=["image_path", "description"]
    )
    return [
        {"path": h["entity"]["image_path"], "score": h["distance"]}
        for h in results[0]
    ]
```

### 13.3 推荐系统

```python
# 用户行为向量 → 相似内容推荐
def recommend_items(user_vector, category_filter=None, top_k=10):
    filter_expr = f'category == "{category_filter}"' if category_filter else ""

    results = client.search(
        collection_name="item_vectors",
        data=[user_vector],
        limit=top_k,
        filter=filter_expr,
        output_fields=["title", "category", "rating"],
        search_params={"ef": 128}
    )

    recommendations = []
    for hit in results[0]:
        recommendations.append({
            "id": hit["id"],
            "title": hit["entity"]["title"],
            "score": 1 - hit["distance"],  # 转为相似度
            "category": hit["entity"]["category"]
        })
    return recommendations
```

---

## 十四、集群与生产部署

### 14.1 Milvus Cluster 部署

```yaml
# docker-compose-cluster.yml（简化版）
version: '3.5'

services:
  etcd:
    image: quay.io/coreos/etcd:v3.5.5
    container_name: milvus-etcd

  minio:
    image: minio/minio:latest
    container_name: milvus-minio
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    command: minio server /minio_data

  proxy:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-proxy
    command: ['milvus', 'run', 'proxy']
    ports:
      - '19530:19530'
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000

  querynode:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-querynode
    command: ['milvus', 'run', 'querynode']
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000

  datanode:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-datanode
    command: ['milvus', 'run', 'datanode']
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000

  indexnode:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-indexnode
    command: ['milvus', 'run', 'indexnode']
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000

  rootcoord:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-rootcoord
    command: ['milvus', 'run', 'rootcoord']
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000

  datacoord:
    image: milvusdb/milvus:v2.4-latest
    container_name: milvus-datacoord
    command: ['milvus', 'run', 'datacoord']
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
```

### 14.2 Milvus 集群架构

```
                    ┌─────────────┐
                    │   Proxy     │  ← 客户端接入层
                    └──────┬──────┘
                           │
        ┌──────────┬───────┼───────┬──────────┐
        │          │       │       │          │
  ┌─────┴─────┐ ┌──┴──┐ ┌─┴───┐ ┌─┴──────┐ ┌─┴─────┐
  │ RootCoord │ │Data │ │Query│ │Index   │ │Proxy  │
  │           │ │Coord│ │Coord│ │Coord   │ │       │
  └───────────┘ └──┬──┘ └──┬──┘ └───┬────┘ └───────┘
                   │       │        │
              ┌────┴──┐ ┌──┴───┐ ┌──┴────┐
              │Data   │ │Query │ │Index  │
              │Node   │ │Node  │ │Node   │
              └───────┘ └──────┘ └───────┘
                   │       │        │
              ┌────┴───────┴────────┴──┐
              │      MinIO / S3        │  ← 对象存储
              └────────────────────────┘
              ┌────────────────────────┐
              │        etcd            │  ← 元数据存储
              └────────────────────────┘
```

### 14.3 监控与告警

```bash
# Milvus 内置 Prometheus metrics（端口 9091）
# 访问 http://localhost:9091/metrics

# 使用 Attu（Milvus 管理 UI）
docker run -d --name attu \
  -p 8000:3000 \
  -e MILVUS_URL=milvus-standalone:19530 \
  zilliz/attu:latest
```

---

## 十五、性能优化与最佳实践

### 15.1 Schema 设计建议

```python
# ✅ 好的实践
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
# 为高频过滤字段创建索引
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=128)
# 使用固定长度 VARCHAR，避免过大
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535)

# ❌ 避免
# 不要设置过大的 max_length
# 不要在未加载的 Collection 上搜索
# 不要使用 FLAT 索引处理大数据集
```

### 15.2 批量操作优化

```python
# ✅ 批量插入（推荐，每批 1000-10000 条）
BATCH_SIZE = 5000
for i in range(0, len(data), BATCH_SIZE):
    client.insert(collection_name="kb", data=data[i:i+BATCH_SIZE])

# ❌ 逐条插入（极慢）
for item in data:
    client.insert(collection_name="kb", data=[item])
```

### 15.3 搜索参数调优指南

| 数据规模     | 推荐索引          | HNSW ef | 搜索延迟 |
| ------------ | ----------------- | ------- | -------- |
| < 10 万      | FLAT              | N/A     | < 10ms   |
| 10-100 万    | HNSW              | 64-128  | < 20ms   |
| 100-1000 万  | HNSW / IVF_SQ8    | 128-256 | < 50ms   |
| 1000 万-1 亿 | IVF_SQ8 / DiskANN | N/A     | < 100ms  |
| > 1 亿       | DiskANN           | N/A     | < 200ms  |

### 15.4 生产环境清单

- [ ] 使用 Milvus Standalone 或 Cluster 模式
- [ ] 为向量字段创建合适的索引
- [ ] 为高频过滤的标量字段创建索引
- [ ] 搜索前确保 Collection 已 `load`
- [ ] 合理设置 `ef` / `nprobe` 参数
- [ ] 配置认证（用户名/密码）
- [ ] 部署 Attu 管理界面
- [ ] 配置 Prometheus + Grafana 监控
- [ ] 定期备份 etcd 和 MinIO 数据

---

## 十六、常见问题排查

### Q1: 搜索返回空结果

```python
# 原因：Collection 未加载
client.load_collection("knowledge_base")  # 搜索前必须加载

# 检查 Collection 状态
info = client.describe_collection("knowledge_base")
print(info)
```

### Q2: 插入数据维度不匹配

```python
# 确保向量维度与 Schema 定义一致
# Schema: dim=768 → 插入的向量必须也是 768 维

# 检查向量维度
schema = client.describe_collection("knowledge_base")
for field in schema["fields"]:
    if "vector" in field["name"]:
        print(f"字段: {field['name']}, 维度: {field.get('params', {}).get('dim')}")
```

### Q3: 搜索速度慢

```python
# 1. 检查是否创建了索引
indexes = client.list_indexes("knowledge_base")
print(indexes)

# 2. 如果没有索引，创建 HNSW 索引
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="HNSW",
    metric_type="COSINE",
    params={"M": 16, "efConstruction": 200}
)
client.create_index("knowledge_base", index_params)

# 3. 调整搜索参数
results = client.search(
    collection_name="knowledge_base",
    data=[query_vector],
    limit=10,
    search_params={"ef": 64}  # 降低 ef 提高速度（牺牲精度）
)
```

### Q4: 内存不足

```python
# 1. 使用量化索引降低内存占用
# IVF_SQ8 比 HNSW 内存占用低 4-8 倍
index_params.add_index(
    field_name="vector",
    index_type="IVF_SQ8",
    metric_type="COSINE",
    params={"nlist": 1024}
)

# 2. 使用 DiskANN（数据存储在磁盘）
index_params.add_index(
    field_name="vector",
    index_type="DISKANN",
    metric_type="COSINE"
)

# 3. 释放不再使用的 Collection
client.release_collection("unused_collection")
```

---

## 参考资源

- [Milvus 官方文档](https://milvus.io/docs)
- [Milvus GitHub](https://github.com/milvus-io/milvus)
- [PyMilvus SDK 文档](https://milvus.io/api-reference/pymilvus/v2.4.x/About.md)
- [Zilliz Cloud（托管服务）](https://zilliz.com/cloud)
- [Attu 管理界面](https://github.com/zilliztech/attu)
- [阿里云百炼 Embedding 文档](https://help.aliyun.com/zh/model-studio/)
