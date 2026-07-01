# LangChain 开发手册

## 概述

LangChain 是一个用于构建基于大型语言模型(LLM)应用程序的开源框架。它提供了标准化的接口和组件,使开发者能够轻松创建复杂的 AI 应用,如聊天机器人、问答系统、文档分析工具等。

## 核心概念

### 1. Chains(链)

Chains 是 LangChain 的核心抽象,表示一系列可组合的操作。

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 创建提示模板
prompt = PromptTemplate(
    input_variables=["question"],
    template="请回答以下问题: {question}"
)

# 创建链
chain = LLMChain(llm=llm, prompt=prompt)

# 执行
result = chain.run("什么是机器学习?")
print(result)
```

### 2. Agents(代理)

Agents 使用 LLM 决定采取什么行动以及以什么顺序执行。

```python
from langchain.agents import initialize_agent, Tool
from langchain.tools import DuckDuckGoSearchRun

# 定义工具
search = DuckDuckGoSearchRun()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="用于搜索互联网获取最新信息"
    )
]

# 初始化代理
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent_type="zero-shot-react-description",
    verbose=True
)

# 执行代理
result = agent.run("今天北京的天气如何?")
```

### 3. Memory(记忆)

Memory 组件允许链和代理记住之前的交互。

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建带记忆的对话链
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 多轮对话
conversation.predict(input="你好,我叫小明")
conversation.predict(input="我今年25岁")
conversation.predict(input="我叫什么名字?")  # 能记住之前的信息
```

### 4. Document Loaders(文档加载器)

从各种来源加载文档数据。

```python
from langchain.document_loaders import (
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

用于语义搜索和检索增强生成(RAG)。

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter

# 文本分割
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(docs)

# 创建嵌入
embeddings = OpenAIEmbeddings()

# 创建向量存储
vectorstore = Chroma.from_documents(texts, embeddings)

# 语义搜索
query = "机器学习的基本概念"
similar_docs = vectorstore.similarity_search(query, k=3)
```

## 快速开始

### 安装

```bash
# 基础安装
pip install langchain

# 安装 OpenAI 集成
pip install langchain-openai

# 安装向量数据库
pip install chromadb

# 安装其他常用依赖
pip install langchain-community tiktoken
```

### 环境变量配置

```bash
# .env 文件
OPENAI_API_KEY=your-api-key-here
```

```python
import os
from dotenv import load_dotenv

load_dotenv()
```

## 常见应用场景

### 1. 问答系统(QA)

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 准备知识库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(docs, embeddings)

# 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 提问
result = qa_chain.run("文档中提到了哪些关键技术?")
```

### 2. 文档摘要

```python
from langchain.chains.summarize import load_summarize_chain

# 加载摘要链
summarize_chain = load_summarize_chain(llm, chain_type="map_reduce")

# 生成摘要
summary = summarize_chain.run(docs)
print(summary)
```

### 3. 代码助手

```python
from langchain.prompts import ChatPromptTemplate

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

code_chain = LLMChain(llm=llm, prompt=code_prompt)

code = code_chain.run({
    "language": "Python",
    "requirement": "实现一个快速排序算法"
})
```

### 4. 数据提取

```python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

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

extract_chain = extract_prompt | llm | parser

result = extract_chain.invoke({
    "text": "张三,30岁,是一名软件工程师",
    "format_instructions": parser.get_format_instructions()
})
```

## 高级特性

### 1. 自定义工具

```python
from langchain.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class CalculatorInput(BaseModel):
    expression: str = Field(description="数学表达式,如 '2 + 2'")

class CalculatorTool(BaseTool):
    name = "calculator"
    description = "用于执行数学计算"
    args_schema: Type[BaseModel] = CalculatorInput

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {str(e)}"

    async def _arun(self, expression: str) -> str:
        return self._run(expression)

# 使用自定义工具
calculator = CalculatorTool()
```

### 2. 流式输出

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# 启用流式输出
llm_streaming = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 流式生成
for chunk in llm_streaming.stream("写一首关于春天的诗"):
    print(chunk.content, end="", flush=True)
```

### 3. 缓存机制

```python
from langchain.cache import InMemoryCache
import langchain

# 启用缓存
langchain.llm_cache = InMemoryCache()

# 第一次调用会执行 API 请求
result1 = llm.predict("你好")

# 第二次相同请求会从缓存返回
result2 = llm.predict("你好")  # 更快,不消耗 API 配额
```

### 4. 并行执行

```python
from langchain.chains import MapReduceDocumentsChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain

# 并行处理多个文档
map_reduce_chain = MapReduceDocumentsChain.from_llm(
    llm=llm,
    document_variable_name="text",
)

results = map_reduce_chain.run(docs)
```

## 最佳实践

### 1. 提示工程技巧

```python
# 使用 Few-Shot 示例
from langchain.prompts import FewShotPromptTemplate

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
from langchain.schema import OutputParserException

try:
    result = chain.run(input_text)
except OutputParserException as e:
    print(f"输出解析错误: {e}")
except Exception as e:
    print(f"执行错误: {e}")
    # 重试逻辑
    result = chain.run(input_text)
```

### 3. Token 管理

```python
from langchain.callbacks import get_openai_callback

# 监控 Token 使用
with get_openai_callback() as cb:
    result = chain.run("长文本...")
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost: ${cb.total_cost}")
```

### 4. 链的组合

```python
from langchain.chains import SequentialChain

# 创建多个子链
translation_chain = LLMChain(llm=llm, prompt=translation_prompt)
summarization_chain = LLMChain(llm=llm, prompt=summarization_prompt)

# 组合成顺序链
sequential_chain = SequentialChain(
    chains=[translation_chain, summarization_chain],
    input_variables=["text"],
    output_variables=["summary"],
    verbose=True
)

result = sequential_chain.run({"text": "原始文本"})
```

## 调试与优化

### 1. 启用详细日志

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 在链中启用 verbose
chain = LLMChain(llm=llm, prompt=prompt, verbose=True)
```

### 2. 使用 LangSmith

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"
```

### 3. 性能优化

```python
# 1. 使用更小的模型进行测试
llm_test = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# 2. 减少上下文长度
text_splitter = CharacterTextSplitter(
    chunk_size=500,  # 减小分块大小
    chunk_overlap=50
)

# 3. 缓存嵌入
from langchain.embeddings import CacheBackedEmbeddings

cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
    embeddings,
    cache_store
)
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
llm_accurate = ChatOpenAI(model="gpt-4", temperature=0.1)

# 3. 添加思维链
cot_prompt = PromptTemplate(
    template="让我们一步步思考:\n{question}\n\n思考过程:",
    input_variables=["question"]
)
```

### Q3: 如何保护敏感信息?

```python
from langchain.utils.env import get_from_env

# 不要硬编码 API Key
api_key = get_from_env("OPENAI_API_KEY")

# 使用环境变量
import os
os.environ["OPENAI_API_KEY"] = api_key
```

## 生态系统组件

### 主要集成

- **LLM Providers**: OpenAI, Anthropic, Google, Azure, Ollama
- **Vector Stores**: Chroma, Pinecone, Weaviate, FAISS, Milvus
- **Document Loaders**: PDF, Word, HTML, Notion, GitHub
- **Tools**: Search, Calculator, Python REPL, SQL Database
- **Callbacks**: LangSmith, Wandb, Arize

### 相关项目

- **LangGraph**: 构建有状态的、多参与者应用
- **LangServe**: 部署 LangChain 应用为 REST API
- **LangSmith**: 调试、测试、评估和监控 LLM 应用

## 学习资源

### 官方文档

- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain JavaScript](https://js.langchain.com/)

### 社区资源

- [GitHub Repository](https://github.com/langchain-ai/langchain)
- [Discord Community](https://discord.gg/langchain)
- [YouTube Tutorials](https://www.youtube.com/@LangChain)

### 推荐教程

1. **入门系列**: 从基础概念到实际应用
2. **RAG 实战**: 构建企业级检索增强系统
3. **Agent 开发**: 创建自主 AI 代理
4. **生产部署**: LangServe 和最佳实践

## 版本更新

### v0.1.x 主要变化

- 新的模块化架构
- 改进的异步支持
- 更好的类型提示
- 性能优化

### 迁移指南

```python
# 旧版本
from langchain.chat_models import ChatOpenAI

# 新版本
from langchain_openai import ChatOpenAI
```

## 总结

LangChain 提供了强大的工具集来构建 LLM 应用:

1. **标准化接口**: 统一的 LLM、嵌入、向量存储接口
2. **组件化设计**: Chains、Agents、Memory 等可组合组件
3. **丰富的生态**: 大量集成和工具
4. **灵活扩展**: 易于创建自定义组件

掌握 LangChain 可以帮助你:

- 快速原型验证 AI 应用想法
- 构建生产级的 LLM 系统
- 实现复杂的 AI 工作流
- 降低 AI 应用开发门槛

随着 LLM 技术的发展,LangChain 也在不断演进,建议持续关注官方文档和社区动态。
