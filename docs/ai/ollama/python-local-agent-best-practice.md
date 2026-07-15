# Python 本地智能体开发最佳实践

> 基于 Ollama + Qwen 系列模型，使用 Python 构建本地自用智能体的项目实践指南。

---

## 一、方案概览

| 组件         | 选型                         | 说明                                     |
| ------------ | ---------------------------- | ---------------------------------------- |
| 本地模型运行 | Ollama                       | 本地部署运行大模型，提供 OpenAI 兼容 API |
| 代码模型     | `qwen3-coder:30b`            | 面向编程场景优化，支持 32k 上下文        |
| 通用模型     | `qwen3.5:27b`                | 面向问答、写作、分析等通用场景           |
| 开发语言     | Python 3.11+                 | 生态丰富，LangChain/Ollama SDK 支持完善  |
| 智能体框架   | LangChain / LangGraph        | 提供工具调用、记忆、多步推理等能力       |
| API 兼容层   | Ollama OpenAI-Compatible API | 无需修改代码即可切换本地/云端模型        |

---

## 二、环境搭建

### 2.1 安装 Ollama 并拉取模型

```bash
# 安装 Ollama（macOS）
brew install ollama

# 启动 Ollama 服务
ollama serve

# 拉取模型
ollama pull qwen3-coder:30b
ollama pull qwen3.5:27b

# 验证模型可用
ollama list
```

### 2.2 Python 环境配置

```bash
# 创建项目
mkdir local-agent && cd local-agent
python -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install ollama langchain langchain-ollama langchain-core langgraph rich
```

### 2.3 requirements.txt

```txt
ollama>=0.4.0
langchain>=0.3.0
langchain-ollama>=0.2.0
langchain-core>=0.3.0
langgraph>=0.2.0
rich>=13.0.0
python-dotenv>=1.0.0
```

---

## 三、项目结构

```
local-agent/
├── .env                    # 环境变量配置
├── requirements.txt        # Python 依赖
├── config.py               # 统一配置管理
├── models/
│   ├── __init__.py
│   └── llm.py              # 模型连接与初始化
├── agents/
│   ├── __init__.py
│   ├── coder_agent.py      # 编程智能体
│   ├── general_agent.py    # 通用智能体
│   └── router_agent.py     # 路由智能体（自动分发）
├── tools/
│   ├── __init__.py
│   ├── file_tools.py       # 文件读写工具
│   ├── shell_tools.py      # Shell 执行工具
│   └── search_tools.py     # 代码搜索工具
├── prompts/
│   ├── __init__.py
│   └── templates.py        # 提示词模板
└── main.py                 # 入口文件
```

---

## 四、核心代码实现

### 4.1 统一配置管理 `config.py`

```python
"""统一配置管理"""
from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()

@dataclass
class ModelConfig:
    """模型配置"""
    base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    coder_model: str = os.getenv("CODER_MODEL", "qwen3-coder:30b")
    general_model: str = os.getenv("GENERAL_MODEL", "qwen3.5:27b")
    temperature_coder: float = 0.3
    temperature_general: float = 0.7
    max_tokens: int = 8192

@dataclass
class AppConfig:
    """应用配置"""
    model: ModelConfig = ModelConfig()
    verbose: bool = os.getenv("VERBOSE", "false").lower() == "true"

config = AppConfig()
```

### 4.2 模型连接 `models/llm.py`

```python
"""模型连接与初始化"""
from langchain_ollama import ChatOllama
from config import config


def get_coder_llm() -> ChatOllama:
    """获取代码专用模型"""
    return ChatOllama(
        base_url=config.model.base_url,
        model=config.model.coder_model,
        temperature=config.model.temperature_coder,
        max_tokens=config.model.max_tokens,
    )


def get_general_llm() -> ChatOllama:
    """获取通用模型"""
    return ChatOllama(
        base_url=config.model.base_url,
        model=config.model.general_model,
        temperature=config.model.temperature_general,
        max_tokens=4096,
    )
```

### 4.3 工具定义 `tools/file_tools.py`

```python
"""文件操作工具"""
from langchain_core.tools import tool
from pathlib import Path


@tool
def read_file(file_path: str) -> str:
    """读取指定路径的文件内容。

    Args:
        file_path: 文件的绝对或相对路径
    """
    path = Path(file_path)
    if not path.exists():
        return f"错误：文件不存在 - {file_path}"
    if not path.is_file():
        return f"错误：路径不是文件 - {file_path}"
    try:
        content = path.read_text(encoding="utf-8")
        return content
    except Exception as e:
        return f"读取文件失败：{e}"


@tool
def write_file(file_path: str, content: str) -> str:
    """将内容写入指定路径的文件（覆盖写入）。

    Args:
        file_path: 文件的绝对或相对路径
        content: 要写入的文件内容
    """
    path = Path(file_path)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return f"成功写入文件：{file_path}（{len(content)} 字符）"
    except Exception as e:
        return f"写入文件失败：{e}"


@tool
def list_directory(dir_path: str = ".") -> str:
    """列出指定目录下的文件和子目录。

    Args:
        dir_path: 目录路径，默认为当前目录
    """
    path = Path(dir_path)
    if not path.exists():
        return f"错误：目录不存在 - {dir_path}"
    items = []
    for item in sorted(path.iterdir()):
        prefix = "📁 " if item.is_dir() else "📄 "
        items.append(prefix + item.name)
    return "\n".join(items) if items else "目录为空"
```

### 4.4 工具定义 `tools/shell_tools.py`

```python
"""Shell 执行工具"""
import subprocess
from langchain_core.tools import tool


@tool
def run_command(command: str, timeout: int = 30) -> str:
    """执行 Shell 命令并返回输出结果。

    Args:
        command: 要执行的 Shell 命令
        timeout: 命令超时时间（秒），默认 30 秒
    """
    # 安全检查：禁止危险命令
    dangerous = ["rm -rf /", "mkfs", "dd if=", ":(){:|:&};:"]
    for d in dangerous:
        if d in command:
            return f"安全限制：禁止执行危险命令 - {d}"

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        output = ""
        if result.stdout:
            output += f"STDOUT:\n{result.stdout}"
        if result.stderr:
            output += f"\nSTDERR:\n{result.stderr}"
        output += f"\n返回码: {result.returncode}"
        return output.strip()
    except subprocess.TimeoutExpired:
        return f"命令超时（{timeout}秒）：{command}"
    except Exception as e:
        return f"执行失败：{e}"
```

### 4.5 提示词模板 `prompts/templates.py`

```python
"""提示词模板"""

CODER_SYSTEM_PROMPT = """你是一位资深全栈工程师 AI 助手，具备以下能力：

## 核心能力
- 代码编写：根据需求编写高质量、可运行的代码
- 代码审查：发现代码中的问题并提供改进建议
- 调试排错：分析错误信息，定位并修复 Bug
- 架构设计：给出清晰的技术方案和架构建议

## 工具使用
你可以使用以下工具来完成任务：
- read_file：读取文件内容
- write_file：写入文件内容
- list_directory：列出目录内容
- run_command：执行 Shell 命令

## 工作流程
1. 先理解用户需求
2. 如需了解现有代码，使用 read_file 读取相关文件
3. 编写或修改代码
4. 必要时使用 run_command 验证代码是否正确
5. 给出清晰的说明

## 规范
- 使用中文交流
- 代码遵循各语言/框架的最佳实践
- 给出可直接运行的完整代码
"""

GENERAL_SYSTEM_PROMPT = """你是一个智能 AI 助手，擅长知识问答、文本写作、分析和推理。

## 核心原则
1. 回答准确，不确定的内容明确说明
2. 表达清晰简洁，善用结构化表达
3. 使用中文交流
4. 先给结论，再展开说明
"""

ROUTER_PROMPT = """你是一个任务路由智能体。根据用户的输入判断应该使用哪个专业模型来处理：

- 如果任务涉及 **编程、代码、调试、架构设计**，选择 `coder`
- 如果是 **问答、写作、分析、翻译** 等通用任务，选择 `general`

只返回 `coder` 或 `general`，不要返回其他内容。

用户输入：{input}
"""
```

### 4.6 编程智能体 `agents/coder_agent.py`

```python
"""编程智能体 - 面向代码开发场景"""
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from models.llm import get_coder_llm
from tools.file_tools import read_file, write_file, list_directory
from tools.shell_tools import run_command
from prompts.templates import CODER_SYSTEM_PROMPT


def create_coder_agent():
    """创建编程智能体（ReAct 模式）"""
    llm = get_coder_llm()
    tools = [read_file, write_file, list_directory, run_command]

    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=SystemMessage(content=CODER_SYSTEM_PROMPT),
    )
    return agent


async def chat_with_coder(user_input: str, history: list = None):
    """与编程智能体对话"""
    agent = create_coder_agent()
    messages = history or []
    messages.append({"role": "user", "content": user_input})

    result = await agent.ainvoke({"messages": messages})
    return result["messages"][-1].content
```

### 4.7 通用智能体 `agents/general_agent.py`

```python
"""通用智能体 - 面向问答、写作等通用场景"""
from langchain_core.messages import SystemMessage
from models.llm import get_general_llm
from prompts.templates import GENERAL_SYSTEM_PROMPT


async def chat_with_general(user_input: str) -> str:
    """与通用智能体对话（简单问答，无工具调用）"""
    from langchain_core.messages import HumanMessage

    llm = get_general_llm()
    messages = [
        SystemMessage(content=GENERAL_SYSTEM_PROMPT),
        HumanMessage(content=user_input),
    ]
    response = await llm.ainvoke(messages)
    return response.content
```

### 4.8 路由智能体 `agents/router_agent.py`

```python
"""路由智能体 - 自动判断使用哪个专业模型"""
from models.llm import get_general_llm
from agents.coder_agent import chat_with_coder
from agents.general_agent import chat_with_general
from prompts.templates import ROUTER_PROMPT


async def route_and_chat(user_input: str) -> tuple[str, str]:
    """根据用户输入自动路由到合适的智能体。

    Returns:
        (model_type, response_content)
    """
    llm = get_general_llm()

    # 路由判断
    from langchain_core.messages import HumanMessage
    route_result = await llm.ainvoke([
        HumanMessage(content=ROUTER_PROMPT.format(input=user_input))
    ])
    model_type = "coder" if "coder" in route_result.content.lower() else "general"

    # 分发到对应智能体
    if model_type == "coder":
        response = await chat_with_coder(user_input)
    else:
        response = await chat_with_general(user_input)

    return model_type, response
```

### 4.9 入口文件 `main.py`

```python
"""本地智能体 - 入口文件"""
import asyncio
from rich.console import Console
from rich.panel import Panel
from agents.router_agent import route_and_chat

console = Console()


async def main():
    console.print(Panel(
        "[bold green]🤖 本地智能体已启动[/]\n"
        f"代码模型：qwen3-coder:30b | 通用模型：qwen3.5:27b\n"
        "输入 [bold]quit[/] 退出",
        title="Local Agent",
    ))

    while True:
        try:
            user_input = console.input("\n[bold cyan]你：[/]").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "q"):
            console.print("[dim]再见！[/]")
            break

        with console.status("[bold yellow]思考中..."):
            model_type, response = await route_and_chat(user_input)

        label = "💻 编程" if model_type == "coder" else "💬 通用"
        console.print(f"\n[bold green]{label}助手：[/]\n{response}")


if __name__ == "__main__":
    asyncio.run(main())
```

### 4.10 环境变量 `.env`

```env
# Ollama 服务地址
OLLAMA_BASE_URL=http://localhost:11434

# 模型选择
CODER_MODEL=qwen3-coder:30b
GENERAL_MODEL=qwen3.5:27b

# 是否输出详细日志
VERBOSE=false
```

---

## 五、运行与测试

```bash
# 确保 Ollama 服务正在运行
ollama serve

# 启动智能体
python main.py
```

### 测试用例

| 输入示例                           | 预期路由 | 说明            |
| ---------------------------------- | -------- | --------------- |
| "帮我写一个 Python 快速排序"       | coder    | 编程任务        |
| "解释一下什么是 Transformer"       | general  | 知识问答        |
| "读取 main.py 并优化代码"          | coder    | 代码审查 + 工具 |
| "帮我写一篇关于 AI 的技术博客大纲" | general  | 写作任务        |

---

## 六、进阶：多模型协作模式

### 6.1 编程 + 审查双模型协作

```python
"""双模型协作：Coder 写代码，General 做审查"""
import asyncio
from agents.coder_agent import chat_with_coder
from agents.general_agent import chat_with_general


async def code_and_review(requirement: str) -> dict:
    """编码 + 代码审查双模型协作流程"""
    # 第一步：Coder 编写代码
    code_result = await chat_with_coder(requirement)

    # 第二步：General 审查代码
    review_prompt = f"""请审查以下代码实现，从以下维度给出评价：
1. 代码质量（可读性、命名规范）
2. 逻辑正确性
3. 性能考虑
4. 改进建议

原始需求：{requirement}

代码实现：
{code_result}
"""
    review_result = await chat_with_general(review_prompt)

    return {"code": code_result, "review": review_result}
```

### 6.2 使用 LangGraph 构建多步工作流

```python
"""LangGraph 多步工作流：需求分析 → 编码 → 测试 → 总结"""
from langgraph.graph import StateGraph, END
from typing import TypedDict


class WorkflowState(TypedDict):
    requirement: str
    analysis: str
    code: str
    test_result: str
    summary: str


def build_dev_workflow():
    """构建开发工作流"""
    graph = StateGraph(WorkflowState)

    async def analyze(state: WorkflowState) -> WorkflowState:
        from agents.general_agent import chat_with_general
        analysis = await chat_with_general(
            f"分析以下开发需求，列出实现步骤：\n{state['requirement']}"
        )
        return {**state, "analysis": analysis}

    async def code(state: WorkflowState) -> WorkflowState:
        from agents.coder_agent import chat_with_coder
        code = await chat_with_coder(
            f"根据以下分析和需求编写代码：\n\n需求：{state['requirement']}\n\n分析：{state['analysis']}"
        )
        return {**state, "code": code}

    async def test(state: WorkflowState) -> WorkflowState:
        from agents.coder_agent import chat_with_coder
        result = await chat_with_coder(
            f"请为以下代码编写测试用例并验证：\n{state['code']}"
        )
        return {**state, "test_result": result}

    async def summarize(state: WorkflowState) -> WorkflowState:
        from agents.general_agent import chat_with_general
        summary = await chat_with_general(
            f"总结以下开发过程：\n需求：{state['requirement']}\n代码：{state['code']}\n测试：{state['test_result']}"
        )
        return {**state, "summary": summary}

    graph.add_node("analyze", analyze)
    graph.add_node("code", code)
    graph.add_node("test", test)
    graph.add_node("summarize", summarize)

    graph.set_entry_point("analyze")
    graph.add_edge("analyze", "code")
    graph.add_edge("code", "test")
    graph.add_edge("test", "summarize")
    graph.add_edge("summarize", END)

    return graph.compile()
```

---

## 七、性能优化建议

| 优化方向     | 建议                                           |
| ------------ | ---------------------------------------------- |
| 模型量化     | 使用 Q4_K_M 量化版本，显存占用降低约 50%       |
| 上下文管理   | 只传入必要的代码片段，避免将整个文件塞入上下文 |
| 流式输出     | 使用 `stream=True` 实时输出，提升交互体验      |
| 工具调用缓存 | 对重复的文件读取结果做缓存，减少不必要的 I/O   |
| 并发请求     | 路由判断与模型加载可并行，减少首 Token 延迟    |
| Prompt 精简  | 使用结构化提示词，避免冗长的系统提示           |

### 流式输出示例

```python
"""流式输出支持"""
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage


async def stream_chat(user_input: str):
    """流式对话输出"""
    llm = ChatOllama(
        model="qwen3-coder:30b",
        temperature=0.3,
        streaming=True,
    )
    messages = [
        SystemMessage(content="你是编程助手，用中文回答。"),
        HumanMessage(content=user_input),
    ]
    async for chunk in llm.astream(messages):
        print(chunk.content, end="", flush=True)
    print()
```

---

## 八、Ollama + Open WebUI 一体化部署

> [Open WebUI](https://github.com/open-webui/open-webui) 是目前最流行的本地大模型 Web 交互界面，支持多模型切换、对话管理、RAG 知识库等功能，与 Ollama 天然适配。

### 8.1 方案对比

| 维度       | 纯命令行（本方案 Python Agent） | Open WebUI                    |
| ---------- | ------------------------------- | ----------------------------- |
| 交互方式   | 终端 CLI                        | 浏览器 Web 界面               |
| 适合场景   | 自动化、工具调用、编程集成      | 日常对话、模型体验、多人共用  |
| 工具调用   | 支持（LangChain Tools）         | 支持（内置 Function Calling） |
| 多模型切换 | 代码路由                        | 界面下拉选择                  |
| 部署复杂度 | 低                              | 中（Docker）                  |

> **建议**：两者并行部署，Python Agent 用于编程自动化场景，Open WebUI 用于日常交互和模型体验。

### 8.2 Docker Compose 配置

项目已在 `docs/ai/ollama/` 目录下提供了一键部署文件：

```
docs/ai/ollama/
├── docker-compose-ollama-webui.yml   # Ollama + Open WebUI 一键部署
├── ollama-custom-model-file.md        # 自定义模型 Modelfile
└── python-local-agent-best-practice.md
```

#### 启动服务

```bash
# 进入 compose 文件所在目录
cd docs/ai/ollama

# 启动（后台运行）
docker compose -f docker-compose-ollama-webui.yml up -d

# 查看运行状态
docker compose -f docker-compose-ollama-webui.yml ps

# 查看日志
docker compose -f docker-compose-ollama-webui.yml logs -f

# 停止服务
docker compose -f docker-compose-ollama-webui.yml down
```

#### 访问地址

| 服务       | 地址                            |
| ---------- | ------------------------------- |
| Open WebUI | http://localhost:3000           |
| Ollama API | http://localhost:11434          |
| 模型列表   | http://localhost:11434/api/tags |

### 8.3 首次使用配置

1. 浏览器打开 `http://localhost:3000`
2. 注册账号（首个用户自动成为管理员）
3. 在顶部模型下拉框中选择 `qwen3-coder:30b` 或 `qwen3.5:27b`
4. 开始对话

#### 拉取模型（容器内执行）

```bash
# 通过 Ollama 容器拉取新模型
docker exec -it ollama-server ollama pull qwen3-coder:30b
docker exec -it ollama-server ollama pull qwen3.5:27b

# 查看已安装的模型
docker exec -it ollama-server ollama list
```

### 8.4 NVIDIA GPU 支持

如果有 NVIDIA 独立显卡，修改 `docker-compose-ollama-webui.yml` 中 ollama 服务，取消 GPU 配置注释：

```yaml
services:
  ollama:
    # ... 其他配置不变 ...
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

前提条件：宿主机需安装 [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)。

### 8.5 与 Python Agent 协同使用

Ollama Docker 服务同时暴露 `11434` 端口，Python Agent 可直接连接：

```env
# .env 文件无需修改，Docker 部署和原生安装端口相同
OLLAMA_BASE_URL=http://localhost:11434
```

这意味着：

- **Open WebUI** 通过 `http://localhost:3000` 提供 Web 界面
- **Python Agent** 通过 `http://localhost:11434` 调用 Ollama API
- 两者共享同一个 Ollama 实例和同一套模型，互不干扰

### 8.6 Open WebUI 进阶功能

| 功能             | 说明                                     | 适用场景              |
| ---------------- | ---------------------------------------- | --------------------- |
| 多模型对比       | 同一条 prompt 发给多个模型，并排对比输出 | 模型选型、效果评估    |
| RAG 知识库       | 上传文档构建本地知识库，支持语义检索增强 | 私有文档问答          |
| Function Calling | 内置工具调用支持，可配置外部 API         | 联网搜索、数据分析    |
| 对话导入/导出    | 支持 JSON/Markdown 格式导入导出对话记录  | 数据备份、知识沉淀    |
| Prompt 模板      | 预设提示词模板，一键切换角色             | 快速切换编程/写作模式 |
| 多用户管理       | 支持多账号、权限控制                     | 团队共享              |

### 8.7 常见问题

**Q：Open WebUI 连不上 Ollama？**

确认两个容器在同一网络下，检查 Ollama 容器是否正常运行：

```bash
docker ps | grep ollama
# 查看 Ollama 容器日志
docker logs ollama-server
```

**Q：模型下拉框为空？**

需要先拉取模型，在终端执行：

```bash
docker exec -it ollama-server ollama pull qwen3-coder:30b
```

然后刷新 Open WebUI 页面。

---

## 九、常见问题

### Q1：Ollama 连接失败

```bash
# 检查 Ollama 服务是否运行
curl http://localhost:11434/api/tags

# 如果未运行，启动服务
ollama serve
```

### Q2：模型加载慢或 OOM

- 选择更小的量化版本，如 `qwen3-coder:30b-q4_K_M`
- 减小 `num_ctx` 参数值（如从 32768 降到 16384）
- 确保有足够的内存（30b 模型建议至少 32GB 内存）

### Q3：工具调用不准确

- 在工具函数的 docstring 中清晰描述参数和用途
- 在系统提示词中明确说明工具的使用场景
- 使用 few-shot 示例引导模型正确使用工具

### Q4：响应质量不稳定

- 调低 `temperature`（代码场景建议 0.2-0.4）
- 增大 `num_ctx` 以提供更多上下文
- 使用自定义 Modelfile 固定参数配置（参考 [Ollama 自定义模型笔记](./ollama-custom-model-file)）
