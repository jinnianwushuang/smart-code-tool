---
title: Python AI 开发架构指南
order: 30
---

# Python AI 开发架构指南

AI 开发是当前 Python 生态中最火热的方向。对于前端工程师来说，Python 在 AI 领域的地位类似于 JavaScript 在前端的地位——它是这个领域的"母语"。

本文从**前端工程师入门 AI 开发**的视角，梳理 Python AI 开发的技术栈、架构模式与工程化实践。

> **实践参考**：本地智能体开发的详细配置指南请参考 [Python 本地智能体最佳实践](../../../ai/ollama/python-local-agent-best-practice)。本文聚焦架构层面的概念和模式。

---

## 一、Python AI 技术栈全景

```
┌─────────────────────────────────────────────────────────┐
│  应用层                                                  │
│  ├── AI Agent（智能体）                                  │
│  ├── RAG（检索增强生成）                                  │
│  ├── Chatbot（对话机器人）                                │
│  └── AI 工具链（代码生成、文档生成、数据分析）             │
├─────────────────────────────────────────────────────────┤
│  框架层                                                  │
│  ├── LangChain（通用 AI 应用框架）                       │
│  ├── LangGraph（有状态 Agent 编排）                      │
│  ├── LlamaIndex（RAG 专用框架）                          │
│  └── OpenAI SDK / Ollama SDK（模型调用）                  │
├─────────────────────────────────────────────────────────┤
│  基础设施层                                              │
│  ├── 向量数据库（Chroma / Milvus / FAISS）               │
│  ├── Embedding 模型（text-embedding / bge）              │
│  ├── LLM 模型（GPT-4o / Claude / Qwen / Llama）         │
│  └── 模型运行（Ollama 本地 / OpenAI API 云端）            │
└─────────────────────────────────────────────────────────┘
```

### 前端工程师的技术映射

| AI 概念               | 前端类比                       |
| --------------------- | ------------------------------ |
| LLM（大语言模型）     | 浏览器引擎（核心运行时）       |
| Prompt（提示词）      | HTML 模板（定义输出结构）      |
| Embedding（向量嵌入） | 编译后的哈希（将文本转为数值） |
| 向量数据库            | 索引系统（快速检索相似内容）   |
| LangChain             | React（编排组件的框架）        |
| LangGraph             | Redux（管理状态流转）          |
| Agent（智能体）       | 一个完整的 SPA 应用            |
| Tool（工具调用）      | API 接口（模型调用外部能力）   |
| RAG                   | 带缓存的 SSR（先检索再生成）   |

---

## 二、模型调用层

### OpenAI 兼容 API

无论使用云端（OpenAI）还是本地（Ollama），都通过统一的 OpenAI 兼容接口调用：

```python
from openai import OpenAI

# ── 云端：OpenAI ──
client = OpenAI(api_key="sk-xxx")

# ── 本地：Ollama（OpenAI 兼容模式） ──
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="not-needed",
)

# 统一调用方式
response = client.chat.completions.create(
    model="qwen3-coder:30b",  # 或 "gpt-4o"
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "解释什么是 RAG"},
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)
```

### 流式输出

```python
stream = client.chat.completions.create(
    model="qwen3-coder:30b",
    messages=[{"role": "user", "content": "写一首关于代码的诗"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## 三、LangChain：AI 应用框架

LangChain 是构建 AI 应用的标准框架，类似于 React 之于前端开发。

### 核心概念

```python
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

# ── 1. 模型封装 ──
llm = ChatOllama(model="qwen3-coder:30b", temperature=0)

# ── 2. Prompt 模板（类似前端模板引擎） ──
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}专家。请用{language}回答。"),
    ("human", "{question}"),
])

# ── 3. 链（Chain）：组合 Prompt + Model ──
chain = prompt | llm  # 管道操作符

# ── 4. 调用 ──
result = chain.invoke({
    "role": "前端开发",
    "language": "中文",
    "question": "什么是虚拟 DOM？",
})
print(result.content)
```

### LCEL（LangChain Expression Language）

LCEL 是 LangChain 的管道语法，类似于函数式编程中的 `pipe`：

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 构建管道：Prompt → Model → 输出解析
chain = (
    {"question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()  # 提取纯文本
)

# 调用
answer = chain.invoke("什么是 React Hooks？")
```

---

## 四、工具调用（Function Calling）

工具调用是让 LLM 能够执行外部操作（查数据库、调 API、执行代码）的核心能力。

### 定义工具

```python
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """搜索互联网获取最新信息"""
    # 实际实现：调用搜索 API
    return f"搜索结果：关于 '{query}' 的最新信息..."

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"计算错误: {e}"

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气"""
    # 模拟天气数据
    weather_data = {"北京": "晴 25°C", "上海": "多云 22°C", "深圳": "小雨 28°C"}
    return weather_data.get(city, f"未找到 {city} 的天气数据")
```

### 绑定工具到模型

```python
tools = [search_web, calculate, get_weather]
llm_with_tools = llm.bind_tools(tools)

# 模型会自动决定何时调用工具
response = llm_with_tools.invoke("北京今天天气怎么样？")

# 检查是否有工具调用
if response.tool_calls:
    for tool_call in response.tool_calls:
        print(f"调用工具: {tool_call['name']}, 参数: {tool_call['args']}")
```

---

## 五、ReAct Agent：推理 + 行动

ReAct（Reasoning + Acting）是最常用的 Agent 模式：模型先推理应该做什么，然后执行工具，再根据结果继续推理。

### 使用 LangGraph 构建 Agent

```python
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama

# 创建 Agent
agent = create_react_agent(
    model=ChatOllama(model="qwen3-coder:30b"),
    tools=[search_web, calculate, get_weather],
)

# 运行
result = agent.invoke({
    "messages": [{"role": "user", "content": "北京天气如何？顺便算一下 25°C 等于多少°F"}]
})

# 查看完整对话链
for message in result["messages"]:
    print(f"[{message.type}] {message.content}")
```

### Agent 执行流程

```
用户输入: "北京天气如何？算一下 25°C 等于多少°F"
    │
    ▼
[推理] 我需要查天气和做计算
    │
    ▼
[行动] 调用 get_weather("北京")
    │
    ▼
[观察] "晴 25°C"
    │
    ▼
[推理] 需要计算 25°C 转 °F
    │
    ▼
[行动] 调用 calculate("25 * 9/5 + 32")
    │
    ▼
[观察] "77.0"
    │
    ▼
[最终回答] 北京今天晴，25°C，等于 77°F
```

---

## 六、RAG：检索增强生成

RAG（Retrieval-Augmented Generation）是让 LLM 基于私有数据回答的核心架构。

### RAG 流程

```
文档 → 分块 → Embedding → 存入向量数据库
                                ↓
用户提问 → 问题 Embedding → 检索相似文档块 → 拼接上下文 → LLM 生成回答
```

### 基础 RAG 实现

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

# ── 1. 加载文档 ──
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# ── 2. 分块 ──
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# ── 3. 向量化并存入数据库 ──
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db")

# ── 4. 检索 ──
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
relevant_docs = retriever.invoke("什么是虚拟 DOM？")

# ── 5. 构建 RAG 链 ──
from langchain_core.prompts import ChatPromptTemplate

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "根据以下上下文回答问题。如果上下文中没有答案，请说明你不知道。\n\n上下文：{context}"),
    ("human", "{question}"),
])

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
    | StrOutputParser()
)

answer = rag_chain.invoke("什么是虚拟 DOM？")
```

---

## 七、LangGraph：有状态 Agent 编排

LangGraph 是 LangChain 团队开发的 Agent 编排框架，使用图结构定义 Agent 的工作流程。

### 核心概念

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

# ── 1. 定义状态 ──
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# ── 2. 定义节点 ──
def call_model(state: AgentState):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def use_tool(state: AgentState):
    # 执行工具调用
    tool_result = execute_tool(state["messages"][-1])
    return {"messages": [tool_result]}

# ── 3. 构建图 ──
graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.add_node("tool", use_tool)

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, {
    "continue": "tool",
    "end": END,
})
graph.add_edge("tool", "agent")

# ── 4. 编译并运行 ──
app = graph.compile()
result = app.invoke({"messages": [("user", "帮我查一下北京的天气")]})
```

### LangGraph 工作流模式

| 模式                  | 说明                   | 适用场景           |
| --------------------- | ---------------------- | ------------------ |
| **ReAct**             | 推理→行动→观察循环     | 通用 Agent         |
| **Plan-and-Execute**  | 先规划步骤，再逐步执行 | 复杂多步任务       |
| **Multi-Agent**       | 多个 Agent 协作        | 分工明确的复杂任务 |
| **Human-in-the-Loop** | 关键步骤需人类确认     | 高风险操作         |

---

## 八、AI 项目结构设计

### 标准 AI 项目结构

```
my-ai-agent/
├── pyproject.toml
├── src/
│   └── agent/
│       ├── __init__.py
│       ├── main.py              # 入口
│       ├── config/
│       │   ├── settings.py      # 配置（模型、API Key）
│       │   └── prompts/         # Prompt 模板
│       │       ├── system.txt
│       │       └── rag.txt
│       ├── models/              # 数据模型
│       │   └── schemas.py
│       ├── agents/              # Agent 定义
│       │   ├── router_agent.py  # 路由 Agent
│       │   └── coding_agent.py  # 编码 Agent
│       ├── tools/               # 工具定义
│       │   ├── search.py
│       │   ├── calculator.py
│       │   └── file_ops.py
│       └── graph/               # LangGraph 工作流
│           └── workflow.py
├── tests/
├── data/                        # 知识库数据
└── .env                         # 环境变量（API Key）
```

### 配置管理

```python
# config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 模型配置
    coding_model: str = "qwen3-coder:30b"
    general_model: str = "qwen3.5:27b"
    embedding_model: str = "nomic-embed-text"

    # API 配置
    ollama_base_url: str = "http://localhost:11434"
    openai_api_key: str = ""

    # RAG 配置
    chunk_size: int = 500
    chunk_overlap: int = 50
    retrieval_k: int = 3

    model_config = {"env_file": ".env"}

settings = Settings()
```

---

## 九、前端 + Python AI 集成模式

### 架构模式

```
┌─────────────────────┐         ┌─────────────────────┐
│  前端（Vue/React）   │  HTTP   │  Python AI 后端     │
│                     │ ←─────→ │                     │
│  ┌───────────────┐  │         │  ┌───────────────┐  │
│  │ 聊天界面       │  │         │  │ FastAPI        │  │
│  │ 文件上传       │  │  SSE    │  │ └─ Agent       │  │
│  │ 结果展示       │  │ ←────── │  │ └─ RAG Pipeline│  │
│  └───────────────┘  │         │  └───────────────┘  │
└─────────────────────┘         └─────────────────────┘
```

### FastAPI + 流式输出

```python
# main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

app = FastAPI()

@app.post("/chat")
async def chat(request: ChatRequest):
    async def generate():
        async for chunk in agent.astream(
            {"messages": [("user", request.message)]},
        ):
            if "messages" in chunk:
                content = chunk["messages"][-1].content
                yield {"data": content}

    return EventSourceResponse(generate())
```

### 前端消费

```typescript
// 前端使用 EventSource 消费 SSE 流
const eventSource = new EventSource('/api/chat')
eventSource.onmessage = (event) => {
  appendToChat(event.data)
}
```

---

## 十、学习路径建议

### 前端工程师的 Python AI 学习路线

```
第一阶段：Python 基础（1-2 周）
├── 基础语法（变量、函数、类）
├── 虚拟环境 + uv 包管理
└── 参考：本文的工程化实践文档

第二阶段：AI 基础概念（1-2 周）
├── LLM 调用（OpenAI SDK / Ollama）
├── Prompt Engineering
└── Embedding + 向量数据库概念

第三阶段：LangChain 入门（2-3 周）
├── LCEL 管道语法
├── 工具调用（Function Calling）
├── 基础 RAG 实现
└── 参考：本地智能体最佳实践文档

第四阶段：LangGraph Agent（2-4 周）
├── StateGraph 构建
├── ReAct Agent 模式
├── 多 Agent 协作
└── Human-in-the-Loop

第五阶段：工程化落地（持续）
├── FastAPI 后端集成
├── 前端 + AI 后端联调
└── 部署（Docker + Ollama）
```

---

## 十一、核心库速查表

| 库                 | 用途                  | 安装命令                  |
| ------------------ | --------------------- | ------------------------- |
| `openai`           | OpenAI 兼容 API 调用  | `uv add openai`           |
| `langchain-core`   | LangChain 核心抽象    | `uv add langchain-core`   |
| `langchain-ollama` | Ollama 模型集成       | `uv add langchain-ollama` |
| `langchain-chroma` | Chroma 向量数据库集成 | `uv add langchain-chroma` |
| `langgraph`        | Agent 编排框架        | `uv add langgraph`        |
| `chromadb`         | 向量数据库            | `uv add chromadb`         |
| `pydantic`         | 数据验证              | `uv add pydantic`         |
| `fastapi`          | Web API 框架          | `uv add fastapi`          |
| `sse-starlette`    | SSE 流式响应          | `uv add sse-starlette`    |

---

## 十二、相关文档

| 文档                                                                                  | 定位                               |
| ------------------------------------------------------------------------------------- | ---------------------------------- |
| [Python 本地智能体最佳实践](../../../ai/ollama/python-local-agent-best-practice)      | 详细的 Ollama + LangChain 配置指南 |
| [Python 项目工程化实践](../engineering/python-engineering-practices)                  | 虚拟环境、工具链、代码规范         |
| [Python 后端框架技术选型](../technology-selection/python-backend-framework-selection) | FastAPI/Django/Flask 选型          |
