# LangChain 开发手册

## 概述

LangChain 是一个用于构建基于大型语言模型(LLM)应用程序的开源框架。它提供了标准化的接口和组件,使开发者能够轻松创建复杂的 AI 应用,如聊天机器人、问答系统、文档分析工具等。

**重要提示**:本文档基于 LangChain 1.x 最新版本编写。如果你使用的是旧版本(0.x),请参考文末的迁移指南。

## 核心概念

### 1. LLM 与 Chat Models(语言模型)

LangChain 1.x 推荐使用 LCEL (LangChain Expression Language) 替代传统的 Chains。

#### 使用 OpenAI

```python
from langchain_openai import ChatOpenAI

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 调用
from langchain_core.messages import HumanMessage
response = llm.invoke([HumanMessage(content="什么是机器学习?")])
print(response.content)
```

#### 使用阿里云百炼(推荐国内用户)

```python
from langchain_openai import ChatOpenAI
import os

# 阿里云百炼兼容 OpenAI 接口
llm = ChatOpenAI(
    model="qwen-plus",  # 可选: qwen-turbo, qwen-plus, qwen-max
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    temperature=0
)

# 调用
from langchain_core.messages import HumanMessage
response = llm.invoke([HumanMessage(content="你好,请介绍一下自己")])
print(response.content)
```

#### 使用 DashScope 原生 SDK

```python
from langchain_community.chat_models.tongyi import ChatTongyi
import os

# 使用通义千问
llm = ChatTongyi(
    model="qwen-plus",
    dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
)

# 流式输出
from langchain_core.messages import HumanMessage
for chunk in llm.stream([HumanMessage(content="写一首关于春天的诗")]):
    print(chunk.content, end="", flush=True)
```

### 2. Prompts & LCEL(提示词与表达式语言)

LCEL 是 LangChain 1.x 推荐的链式调用方式,替代了旧的 LLMChain。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os

# 创建提示模板
prompt = ChatPromptTemplate.from_template("请回答以下问题: {question}")

# 初始化模型(使用阿里云百炼)
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 使用 LCEL 组合(chain)
chain = prompt | llm

# 执行
result = chain.invoke({"question": "什么是机器学习?"})
print(result.content)
```

### 3. Memory(记忆)

Memory 组件允许对话记住之前的交互。**注意**: LangChain 1.x 中推荐使用 LangGraph 管理对话状态。

```python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 定义工具(可以为空列表)
tools = []

# 使用 LangGraph 的记忆功能
memory = MemorySaver()
agent = create_react_agent(llm, tools, checkpointer=memory)

# 多轮对话(通过 thread_id 维护会话状态)
config = {"configurable": {"thread_id": "conversation-1"}}

# 第一轮
result1 = agent.invoke(
    {"messages": [("human", "你好,我叫小明")]},
    config=config
)

# 第二轮
result2 = agent.invoke(
    {"messages": [("human", "我今年25岁")]},
    config=config
)

# 第三轮 - 能记住之前的信息
result3 = agent.invoke(
    {"messages": [("human", "我叫什么名字?")]},
    config=config
)
print(result3["messages"][-1].content)
```

### 4. Document Loaders(文档加载器)

从各种来源加载文档数据。**注意**: 在 LangChain 1.x 中,许多 loaders 已移至 `langchain-community`。

```python
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    WebBaseLoader,
    CSVLoader
)

# 加载文本文件
loader = TextLoader("document.txt")
docs = loader.load()

# 加载 PDF
pdf_loader = PyPDFLoader("document.pdf")
pdf_docs = pdf_loader.load()

# 加载网页
web_loader = WebBaseLoader("https://example.com")
web_docs = web_loader.load()

# 加载 CSV
csv_loader = CSVLoader("data.csv")
csv_docs = csv_loader.load()
```

### 5. Vector Stores(向量存储)

用于语义搜索和检索增强生成(RAG)。**注意**: 在 LangChain 1.x 中,vectorstores 和 embeddings 已移至 `langchain-community`。

```python
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
import os

# 文本分割
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(docs)

# 创建嵌入(使用阿里云百炼)
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("DASHSCOPE_API_KEY"),
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="text-embedding-v1"  # 百炼的 embedding 模型
)

# 创建向量存储
vectorstore = Chroma.from_documents(texts, embeddings)

# 语义搜索
query = "机器学习的基本概念"
similar_docs = vectorstore.similarity_search(query, k=3)
```

**使用阿里云通义 Embedding**:

```python
from langchain_community.embeddings.alibaba_tongyi import AlibabaTongyiEmbeddings
import os

# 使用通义千问的 embedding 模型
embeddings = AlibabaTongyiEmbeddings(
    dashscope_api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="text-embedding-v1"
)

# 创建向量存储
vectorstore = Chroma.from_documents(texts, embeddings)
```

### 6. Agents(代理)

**重要**: LangChain 1.x 中,Agent API 发生重大变化。旧的 `initialize_agent` 已被弃用,推荐使用 LangGraph。

```python
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langgraph.prebuilt import create_react_agent
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 定义工具
tools = [DuckDuckGoSearchRun()]

# 创建 Agent(使用 LangGraph)
agent = create_react_agent(llm, tools)

# 执行
result = agent.invoke({"messages": [("human", "今天北京的天气如何?")]})
print(result["messages"][-1].content)
```

## 快速开始

### 环境准备

### 安装

```bash
# 基础安装(LangChain 1.x)
pip install langchain

# 安装 OpenAI 集成
pip install langchain-openai

# 安装阿里云百炼集成(推荐)
pip install langchain-community dashscope

# 安装向量数据库
pip install chromadb

# 安装其他常用依赖
pip install langchain-core tiktoken python-dotenv
```

### 环境变量配置

```bash
# .env 文件
OPENAI_API_KEY=your-openai-api-key-here

# 阿里云百炼 API Key(推荐使用)
DASHSCOPE_API_KEY=your-dashscope-api-key-here
```

```python
import os
from dotenv import load_dotenv

load_dotenv()
```

## 常见应用场景

### 1. 问答系统(QA) - RAG

```python
from langchain_openai import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import os

# 准备知识库
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("DASHSCOPE_API_KEY"),
    openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1"
)
vectorstore = Chroma.from_documents(docs, embeddings)

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 创建检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 创建 RAG 提示模板
rag_prompt = ChatPromptTemplate.from_template("""
基于以下上下文回答问题:

{context}

问题: {question}

答案:
""")

# 使用 LCEL 构建 RAG 链
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
)

# 提问
result = rag_chain.invoke("文档中提到了哪些关键技术?")
print(result.content)
```

### 2. 文档摘要

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.text_splitter import CharacterTextSplitter
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 文本分割
text_splitter = CharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
texts = text_splitter.split_documents(docs)

# 创建摘要提示
summarize_prompt = ChatPromptTemplate.from_template("""
请总结以下内容:

{text}

摘要:
""")

# 使用 LCEL
summarize_chain = summarize_prompt | llm

# 对每个文本块生成摘要
summaries = []
for text in texts:
    summary = summarize_chain.invoke({"text": text.page_content})
    summaries.append(summary.content)

# 合并所有摘要
final_summary = "\n\n".join(summaries)
print(final_summary)
```

### 3. 代码助手

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 代码生成提示
code_prompt = ChatPromptTemplate.from_template("""
你是一个专业的程序员。请根据以下需求编写 {language} 代码:

需求: {requirement}

要求:
1. 代码要简洁高效
2. 添加必要的注释
3. 考虑边界情况

代码:
""")

# 使用 LCEL
code_chain = code_prompt | llm

code = code_chain.invoke({
    "language": "Python",
    "requirement": "实现一个快速排序算法"
})
print(code.content)
```

### 4. 数据提取

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 定义输出结构
class PersonInfo(BaseModel):
    name: str = Field(description="人物姓名")
    age: int = Field(description="年龄")
    occupation: str = Field(description="职业")

# 创建解析器
parser = PydanticOutputParser(pydantic_object=PersonInfo)

# 创建提示
extract_prompt = ChatPromptTemplate.from_template("""
从以下文本中提取人物信息:

{text}

{format_instructions}
""")

# 使用 LCEL
extract_chain = extract_prompt | llm | parser

result = extract_chain.invoke({
    "text": "张三,30岁,是一名软件工程师",
    "format_instructions": parser.get_format_instructions()
})
print(result)
```

## 高级特性

### 1. 自定义工具

```python
from langchain_core.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class CalculatorInput(BaseModel):
    expression: str = Field(description="数学表达式,如 '2 + 2'")

class CalculatorTool(BaseTool):
    name: str = "calculator"
    description: str = "用于执行数学计算"
    args_schema: Type[BaseModel] = CalculatorInput

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {str(e)}"

# 使用自定义工具
calculator = CalculatorTool()
result = calculator.invoke({"expression": "2 + 2"})
print(result)
```

### 2. 流式输出

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os

# 启用流式输出
llm_streaming = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    streaming=True
)

# 流式生成
for chunk in llm_streaming.stream([HumanMessage(content="写一首关于春天的诗")]):
    print(chunk.content, end="", flush=True)
```

### 3. 缓存机制

```python
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache

# 启用缓存
set_llm_cache(InMemoryCache())

# 第一次调用会执行 API 请求
result1 = llm.invoke([HumanMessage(content="你好")])

# 第二次相同请求会从缓存返回
result2 = llm.invoke([HumanMessage(content="你好")])  # 更快,不消耗 API 配额
```

## 最佳实践

### 1. 提示工程技巧

```python
# 使用 Few-Shot 示例
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

examples = [
    {
        "input": "2+2",
        "output": "4"
    },
    {
        "input": "2*3",
        "output": "6"
    }
]

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="输入: {input}\n输出: {output}"
)

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="你是一个数学助手:",
    suffix="输入: {input}\n输出:",
    input_variables=["input"]
)
```

### 2. 错误处理

```python
from langchain_core.exceptions import OutputParserException

try:
    result = chain.invoke({"input": input_text})
except OutputParserException as e:
    print(f"输出解析错误: {e}")
except Exception as e:
    print(f"执行错误: {e}")
    # 重试逻辑
    result = chain.invoke({"input": input_text})
```

### 3. Token 管理

```python
from langchain_community.callbacks import get_openai_callback

# 监控 Token 使用
with get_openai_callback() as cb:
    result = chain.invoke({"input": "长文本..."})
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost: ${cb.total_cost}")
```

### 4. 链的组合(LCEL)

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 创建多个子链
translation_prompt = ChatPromptTemplate.from_template("将以下文本翻译成英文: {text}")
summarization_prompt = ChatPromptTemplate.from_template("总结以下内容: {text}")

translation_chain = translation_prompt | llm
summarization_chain = summarization_prompt | llm

# 使用 LCEL 组合
from langchain_core.runnables import RunnablePassthrough

sequential_chain = (
    RunnablePassthrough.assign(translated=translation_chain)
    | RunnablePassthrough.assign(summary=summarization_chain)
)

result = sequential_chain.invoke({"text": "原始文本"})
print(result)
```

## 调试与优化

### 1. 启用详细日志

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 在链中启用 verbose
chain = prompt | llm
# LCEL 默认支持详细日志
```

### 2. 使用 LangSmith

```python
import os

# 配置 LangSmith
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"
```

### 3. 性能优化

```python
# 1. 使用更小的模型进行测试
llm_test = ChatOpenAI(
    model="qwen-turbo",  # 百炼的快速模型
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 2. 减少上下文长度
text_splitter = CharacterTextSplitter(
    chunk_size=500,  # 减小分块大小
    chunk_overlap=50
)

# 3. 缓存嵌入
from langchain_community.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore

store = LocalFileStore("./cache/")
cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
    embeddings,
    store,
    namespace="embeddings"
)
```

## 阿里云百炼平台深度集成

### 1. 平台介绍

阿里云百炼(Model Studio)是阿里巴巴推出的一站式大模型服务平台,提供:

- **丰富的模型选择**: Qwen(通义千问)系列、DeepSeek、Llama 等
- **OpenAI 兼容接口**: 无缝切换,无需修改代码
- **高性价比**: 相比 OpenAI 更具价格优势
- **中文优化**: 对中文理解和生成效果更好
- **企业级服务**: SLA 保障、技术支持

### 2. 获取 API Key

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com)
2. 完成实名认证
3. 在左侧导航栏找到 **API Key** 菜单
4. 点击 **「+ 创建 API Key」** 按钮
5. 复制并妥善保存 Key(格式为 `sk-xxxx`)

**⚠️ 安全提示**: 切勿将 API Key 硬编码到代码中,应使用环境变量或 `.env` 文件。

### 3. 支持的模型

| 模型名称   | 特点            | 适用场景             |
| ---------- | --------------- | -------------------- |
| qwen-turbo | 速度快,成本低   | 简单对话、快速响应   |
| qwen-plus  | 均衡型,性价比高 | 通用任务、文档处理   |
| qwen-max   | 旗舰型,能力最强 | 复杂推理、专业领域   |
| qwen-long  | 超长上下文支持  | 长文档分析、书籍摘要 |

完整模型列表请参考: [阿里云百炼模型总览](https://help.aliyun.com/zh/model-studio/getting-started/models)

### 4. 基础调用示例

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import os

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    temperature=0.7,
    max_tokens=2000
)

# 简单对话
messages = [
    SystemMessage(content="你是一个专业的AI助手"),
    HumanMessage(content="请介绍一下阿里云百炼平台")
]

response = llm.invoke(messages)
print(response.content)
```

### 5. 流式输出

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os

llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    streaming=True
)

# 流式输出
for chunk in llm.stream([HumanMessage(content="写一首关于春天的诗")]):
    print(chunk.content, end="", flush=True)
```

### 6. 使用通义千问 Embedding

```python
from langchain_community.embeddings.alibaba_tongyi import AlibabaTongyiEmbeddings
from langchain_community.vectorstores import Chroma
import os

# 初始化 Embedding
embeddings = AlibabaTongyiEmbeddings(
    dashscope_api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="text-embedding-v1"
)

# 创建向量存储
texts = ["机器学习是人工智能的一个分支", "深度学习是机器学习的子领域"]
vectorstore = Chroma.from_texts(texts, embeddings)

# 语义搜索
query = "什么是AI?"
results = vectorstore.similarity_search(query, k=2)
for doc in results:
    print(doc.page_content)
```

### 7. RAG 实战示例

```python
from langchain_openai import ChatOpenAI
from langchain_community.embeddings.alibaba_tongyi import AlibabaTongyiEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import os

# 1. 加载文档
loader = TextLoader("knowledge_base.txt", encoding='utf-8')
documents = loader.load()

# 2. 文本分割
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(documents)

# 3. 创建向量存储
embeddings = AlibabaTongyiEmbeddings(
    dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
)
vectorstore = Chroma.from_documents(texts, embeddings)

# 4. 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 5. 创建检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 6. 创建 RAG 提示模板
rag_prompt = ChatPromptTemplate.from_template("""
基于以下公司政策文档回答问题:

{context}

问题: {question}

请给出详细答案:
""")

# 7. 使用 LCEL 构建 RAG 链
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
)

# 8. 提问
question = "公司的请假政策是什么?"
answer = rag_chain.invoke(question)
print(f"问题: {question}")
print(f"答案: {answer.content}")
```

### 8. Function Calling(函数调用)

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
import os

# 定义工具
@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    # 这里可以调用真实的天气 API
    return f"{city}今天的天气晴朗,温度20-25度"

@tool
def calculate(expression: str) -> str:
    """执行数学计算"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except:
        return "计算失败"

tools = [get_weather, calculate]

# 初始化模型
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 创建 Agent
agent = create_react_agent(llm, tools)

# 执行
result = agent.invoke({
    "messages": [("human", "北京今天的天气怎么样?另外帮我算一下 25 * 4")]
})
print(result["messages"][-1].content)
```

### 9. 成本优化建议

1. **选择合适的模型**: 简单任务用 `qwen-turbo`,复杂任务用 `qwen-plus` 或 `qwen-max`
2. **控制 token 数量**: 合理设置 `max_tokens`,避免过长输出
3. **使用缓存**: 对常见问题使用缓存机制
4. **批量处理**: 合并多个小请求为一个批量请求
5. **监控用量**: 定期查看 API 使用情况,优化调用策略

```python
from langchain_community.callbacks import get_openai_callback

# 监控每次调用的成本
with get_openai_callback() as cb:
    response = llm.invoke([HumanMessage(content="你好")])
    print(f"Tokens used: {cb.total_tokens}")
    print(f"Cost: ${cb.total_cost}")
```

## 常见问题

### Q1: 如何处理超长文本?

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 使用递归字符分割器
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " ", ""]
)

chunks = splitter.split_documents(docs)
```

### Q2: 如何提高回答准确性?

```python
# 1. 使用 RAG 提供上下文
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 2. 设置较低的温度
llm_accurate = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    temperature=0.1
)

# 3. 添加思维链
cot_prompt = PromptTemplate(
    template="让我们一步步思考:\n{question}\n\n思考过程:",
    input_variables=["question"]
)
```

### Q3: 如何保护敏感信息?

```python
from dotenv import load_dotenv
import os

# 加载 .env 文件
load_dotenv()

# 从环境变量读取
api_key = os.getenv("DASHSCOPE_API_KEY")

# 不要硬编码 API Key
# ❌ 错误做法
# api_key = "sk-xxxxxxxxxx"

# ✅ 正确做法
llm = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)
```

### Q4: LangChain 0.x 如何迁移到 1.x?

**主要变化**:

1. **导入路径变化**:

```python
# 旧版本 (0.x)
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.document_loaders import TextLoader
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 新版本 (1.x)
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
```

2. **Chains 被 LCEL 替代**:

```python
# ⚠️ 旧版本代码(已弃用,仅供参考)
from langchain.chains import LLMChain
chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run({"input": "text"})

# ✅ 新版本代码(推荐使用)
chain = prompt | llm
result = chain.invoke({"input": "text"})
```

3. **Agents 迁移到 LangGraph**:

```python
# ⚠️ 旧版本代码(已弃用,仅供参考)
from langchain.agents import initialize_agent
agent = initialize_agent(tools, llm, agent_type="zero-shot-react-description")

# ✅ 新版本代码(推荐使用)
from langgraph.prebuilt import create_react_agent
agent = create_react_agent(llm, tools)
```

4. **Memory 迁移**:

```python
# ⚠️ 旧版本代码(已弃用,不推荐在新项目中使用)
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
conversation = ConversationChain(llm=llm, memory=memory)
conversation.predict(input="你好")

# ✅ 新版本代码(推荐使用 LangGraph)
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

memory = MemorySaver()
agent = create_react_agent(llm, tools=[], checkpointer=memory)
```

**官方迁移指南**: [LangChain v1.0 Migration Guide](https://docs.langchain.com/oss/python/migrate/langchain-v1)

### Q5: 为什么选择阿里云百炼而不是 OpenAI?

**优势对比**:

| 特性       | 阿里云百炼               | OpenAI       |
| ---------- | ------------------------ | ------------ |
| 价格       | 更低(约 1/3-1/2)         | 较高         |
| 中文支持   | 优秀                     | 良好         |
| 网络稳定性 | 国内访问快               | 需要科学上网 |
| 模型选择   | Qwen、DeepSeek、Llama 等 | GPT 系列     |
| 企业服务   | SLA 保障                 | 有限         |
| 合规性     | 符合中国法规             | 需注意       |

**适用场景**:

- 面向中国用户的应用 → 推荐百炼
- 需要低成本部署 → 推荐百炼
- 国际化应用 → 可同时支持两者
- 特定领域需求 → 根据模型能力选择

## 生态系统组件

### 主要集成

- **LLM Providers**:
  - OpenAI, Anthropic, Google, Azure
  - **阿里云百炼**(Qwen 系列)
  - Ollama(本地部署)
  - DeepSeek, Moonshot
- **Vector Stores**: Chroma, Pinecone, Weaviate, FAISS, Milvus
- **Document Loaders**: PDF, Word, HTML, Notion, GitHub
- **Tools**: Search, Calculator, Python REPL, SQL Database
- **Callbacks**: LangSmith, Wandb, Arize

### 相关项目

- **LangGraph**: 构建有状态的、多参与者应用(**推荐用于复杂 Agent**)
- **LangServe**: 部署 LangChain 应用为 REST API
- **LangSmith**: 调试、测试、评估和监控 LLM 应用

### 阿里云生态

- **DashScope SDK**: 阿里云官方 SDK
- **Spring AI Alibaba**: Java 生态的 AI 集成
- **ModelScope**: 阿里魔搭社区(开源模型平台)

## 学习资源

### 官方文档

- [LangChain 官方文档(Python)](https://python.langchain.com/)
- [LangChain JavaScript](https://js.langchain.com/)
- [LangChain v1.0 迁移指南](https://docs.langchain.com/oss/python/migrate/langchain-v1)
- [阿里云百炼官方文档](https://help.aliyun.com/zh/model-studio/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)

### 社区资源

- [GitHub Repository](https://github.com/langchain-ai/langchain)
- [Discord Community](https://discord.gg/langchain)
- [YouTube Tutorials](https://www.youtube.com/@LangChain)
- [阿里云百炼开发者社区](https://developer.aliyun.com/modelstudio)

### 推荐教程

1. **入门系列**: 从基础概念到实际应用
2. **RAG 实战**: 构建企业级检索增强系统
3. **Agent 开发**: 创建自主 AI 代理(推荐学习 LangGraph)
4. **生产部署**: LangServe 和最佳实践
5. **阿里云百炼实战**: 从零搭建中文 AI 应用

## 版本更新

### LangChain 1.x 主要变化(2024-2025)

**架构重构**:

- 模块化拆分:`langchain-core`、`langchain-community`、`langchain-{provider}`
- **LCEL 成为标准**: 替代传统 Chains
- **LangGraph 整合**: Agent 开发推荐使用 LangGraph
- **Pydantic v2**: 全面升级,性能提升

**废弃的 API**:

- `langchain.chains.LLMChain` → 使用 LCEL (`prompt | llm`)
- `langchain.agents.initialize_agent` → 使用 `langgraph.prebuilt.create_react_agent`
- `langchain.chat_models` → 使用 `langchain_openai.ChatOpenAI`
- `langchain.document_loaders` → 使用 `langchain_community.document_loaders`

**新增特性**:

- `.content_blocks`: 统一的多模态输出结构
- `create_agent`: 简化的 Agent 创建
- Middleware 系统: 替代旧的 hooks
- 更好的类型提示和 IDE 支持

### 阿里云百炼集成更新

- **OpenAI 兼容模式**: 无需修改代码即可切换
- **ChatTongyi**: 原生通义千问集成
- **AlibabaTongyiEmbeddings**: 专用 Embedding 模型
- **Function Calling**: 完整的工具调用支持

### 迁移建议

如果你正在使用 LangChain 0.x:

1. **逐步迁移**: 先更新导入路径,再重构 Chains 为 LCEL
2. **测试优先**: 确保每个模块迁移后功能正常
3. **参考官方指南**: [Migration Guide](https://docs.langchain.com/oss/python/migrate/langchain-v1)
4. **考虑百炼**: 如果面向中国用户,建议同时集成阿里云百炼

## 总结

LangChain 1.x 提供了更强大、更灵活的工具集来构建 LLM 应用:

### 核心优势

1. **标准化接口**: 统一的 LLM、嵌入、向量存储接口
2. **LCEL 表达式语言**: 更简洁、更灵活的链式调用
3. **LangGraph 集成**: 生产级 Agent 开发框架
4. **丰富的生态**: 大量集成和工具,包括**阿里云百炼**
5. **灵活扩展**: 易于创建自定义组件

### 阿里云百炼的价值

对于中国开发者,阿里云百炼提供了:

- ✅ **成本优势**: 相比 OpenAI 降低 50%-70% 成本
- ✅ **网络稳定**: 国内访问速度快,无需科学上网
- ✅ **中文优化**: Qwen 模型对中文理解更准确
- ✅ **OpenAI 兼容**: 无缝切换,学习成本低
- ✅ **企业支持**: SLA 保障和技术支持

### 掌握 LangChain 可以帮助你

- 快速原型验证 AI 应用想法
- 构建生产级的 LLM 系统
- 实现复杂的 AI 工作流
- 降低 AI 应用开发门槛
- **低成本部署中文 AI 应用**(通过百炼)

### 下一步

1. **新手**: 从基础 LCEL 开始,熟悉链式调用
2. **进阶**: 学习 LangGraph,构建复杂 Agent
3. **实战**: 使用阿里云百炼搭建 RAG 系统
4. **生产**: 学习 LangServe 部署和监控

随着 LLM 技术的发展,LangChain 也在不断演进。建议:

- 持续关注[官方文档](https://python.langchain.com/)
- 关注[阿里云百炼](https://bailian.console.aliyun.com)的最新模型
- 参与社区讨论,分享实践经验
