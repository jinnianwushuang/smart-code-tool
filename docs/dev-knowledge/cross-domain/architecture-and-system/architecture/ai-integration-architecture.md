---
title: 'AI 能力集成架构 [P8]'
level: 'architect'
tags: ['AI 集成', 'Agent', '流式协议', '上下文管理', 'LLM']
difficulty: 'expert'
target: '架构师（P8）'
---

# AI 能力集成架构 [P8]

> 2026 年，前端应用不再是单纯的「渲染 + 交互」，而是集成了 AI Agent、流式对话、上下文管理等能力的智能应用。架构设计面临全新挑战。

## 核心概念（What）

### AI 集成架构分层

```
┌─────────────────────────────────────┐
│          AI 应用层                   │
│  对话 UI │ Agent 面板 │ 智能助手     │
├─────────────────────────────────────┤
│          AI 编排层                   │
│  上下文管理 │ 工具调用 │ 多轮对话    │
├─────────────────────────────────────┤
│          AI 通信层                   │
│  SSE 流式 │ WebSocket │ MCP 协议    │
├─────────────────────────────────────┤
│          AI 服务层                   │
│  LLM API │ RAG │ 向量数据库        │
└─────────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. SSE 流式协议底层：HTTP 长连接 + 分块传输

流式输出的底层不是「ReadbleStream API」，而是**HTTP/1.1 Chunked Transfer Encoding + Server-Sent Events 协议的结合**。

```
SSE 流式协议底层：

  HTTP 层面的执行流程：
    1. 客户端发送 POST /api/chat（Accept: text/event-stream）
    2. 服务端返回 HTTP 200 + 响应头：
       ├── Content-Type: text/event-stream（标记为 SSE 流）
       ├── Transfer-Encoding: chunked（分块传输，不等待完整响应）
       ├── Cache-Control: no-cache（禁止缓存）
       └── Connection: keep-alive（保持长连接）
    3. 服务端持续写入 chunk：
       ├── 每个 chunk = "data: {json}\n\n"（SSE 协议格式）
       ├── 每个 chunk 立即 flush 到客户端（不等完整响应）
       └── 最后一个 chunk = "data: [DONE]\n\n"（结束标记）

  为什么选择 SSE 而不是 WebSocket：
    ├── SSE：单向（服务端 → 客户端），天然适合 LLM 流式输出
    │   ├── 基于 HTTP（复用现有基础设施：CDN、代理、负载均衡）
    │   ├── 自动重连（浏览器内置 EventSource）
    │   └── 轻量（无需握手协议）
    ├── WebSocket：双向，适合需要客户端持续推送的场景
    │   ├── 需要额外握手（HTTP Upgrade）
    │   └── 不经过 CDN/代理（某些企业网络会阻断）
    └── WebTransport（2026 新兴）：基于 HTTP/3
        ├── 多路复用（无队头阻塞）
        ├── 支持流和 datagram
        └── 未来可能替代 SSE + WebSocket

  背压控制（Backpressure）：
    ├── 问题：LLM 生成速度 > 客户端渲染速度 → 内存膨胀
    ├── 解决方案：
    │   ├── 服务端：监控客户端消费速度，调整生成速率
    │   ├── 客户端：使用 ReadableStream 的 desiredSize 控制拉取
    │   └── 中间层：消息队列缓冲（Redis Stream / Kafka）
    └── 不控制背压的后果：浏览器 OOM、UI 卡顿、内存泄漏
```

### 2. Agent 编排引擎：ReAct 循环 + 工具调用协议

Agent 的底层不是「while 循环调用 LLM」，而是**ReAct（Reasoning + Acting）推理循环 + 工具描述协议 + 执行沙箱**。

```
Agent 编排引擎底层：

  ReAct 推理循环：
    每一轮循环包含三个阶段：
    ├── 1. Thought（推理）：
    │   ├── LLM 分析当前状态和历史步骤
    │   ├── 决定下一步行动（调用工具 or 返回最终答案）
    │   └── 输出结构化的推理过程（可展示给用户）
    ├── 2. Action（行动）：
    │   ├── 如果选择调用工具 → 生成工具名称 + 参数（JSON）
    │   └── 如果选择返回答案 → 终止循环
    └── 3. Observation（观察）：
        ├── 执行工具，获取返回结果
        ├── 将结果追加到历史上下文
        └── 进入下一轮 Thought

  工具调用协议（Tool Calling Protocol）：
    ├── 工具描述（注册阶段）：
    │   ├── 每个工具提供 JSON Schema 描述
    │   │   { name, description, parameters: { type, properties, required } }
    │   ├── LLM 根据描述理解工具能力
    │   └── 描述质量直接影响 LLM 的工具选择准确率
    ├── 工具执行（运行阶段）：
    │   ├── LLM 输出结构化的工具调用指令
    │   ├── 前端解析指令 → 匹配工具注册表 → 执行
    │   ├── 执行结果序列化为文本 → 反馈给 LLM
    │   └── 安全控制：敏感工具需要用户确认（Human-in-the-Loop）
    └── 错误处理：
        ├── 工具执行失败 → 将错误信息反馈给 LLM（让它调整策略）
        ├── 工具不存在 → 提示 LLM 可用工具列表
        └── 超时控制：每个工具设置最大执行时间

  前端 Agent UX 关键设计：
    ├── 思考过程可视化：折叠/展开每轮 Thought-Action-Observation
    ├── 工具调用确认：敏感操作（删除、支付）弹出确认对话框
    ├── 中断机制：AbortController 终止正在执行的 Agent 循环
    └── 进度反馈：显示当前是第几轮推理，已调用哪些工具
```

### 3. 上下文窗口管理：Token 预算分配 + 摘要压缩算法

上下文管理的底层不是「数组截取」，而是**Token 预算分配 + 多级摘要压缩 + 优先级保留策略**。

```
上下文窗口管理底层：

  Token 预算分配模型：
    总预算 = 模型上下文窗口（如 128K tokens）
    ├── 系统提示（System Prompt）：固定占用（不可裁剪）
    ├── 工具描述（Tool Definitions）：固定占用（影响工具选择）
    ├── 对话历史（Messages）：动态分配（可裁剪/压缩）
    └── 输出预留（Max Output Tokens）：固定预留（如 4096）

    可用历史预算 = 总预算 - 系统提示 - 工具描述 - 输出预留

  上下文裁剪策略（从简单到复杂）：
    1. 滑动窗口（Sliding Window）：
       ├── 保留最近 N 轮对话，丢弃更早的
       ├── 优势：简单高效
       └── 劣势：丢失早期上下文（长对话中遗忘关键信息）

    2. Token 精确计算 + 截断：
       ├── 使用 tokenizer（如 tiktoken）精确计算每条消息的 token 数
       ├── 从最早的消息开始移除，直到总 token 在预算内
       └── 保留 system 消息和最近 N 条（永不删除）

    3. 摘要压缩（Summarization）：
       ├── 早期对话由 LLM 生成摘要（用少量 token 保留关键信息）
       ├── 摘要替换原始对话 → 大幅减少 token 占用
       ├── 触发条件：总 token 超过阈值的 80% 时触发压缩
       └── 成本：每次压缩需要一次额外的 LLM 调用

    4. RAG 增强（Retrieval-Augmented Generation）：
       ├── 将历史对话向量化存入向量数据库
       ├── 新消息到来时检索最相关的历史片段
       ├── 只注入相关上下文（不是全部历史）
       └── 优势：无限历史记忆 + 精确上下文召回

  Token 估算方法：
    ├── 精确方式：tiktoken（OpenAI）/ count-tokens（Anthropic）
    ├── 粗略估算：字符数 / 4（英文）或 字符数 / 2（中文）
    └── 生产建议：使用精确估算（避免超出窗口导致截断）
```

### 4. MCP 协议架构：JSON-RPC 2.0 + 能力协商 + 传输抽象

MCP 的底层不是「工具调用 API」，而是**基于 JSON-RPC 2.0 的标准化协议 + 能力协商机制 + 多传输层抽象**。

```
MCP（Model Context Protocol）协议架构：

  协议分层：
    ├── 消息层：JSON-RPC 2.0（请求/响应/通知三种消息类型）
    ├── 能力层：initialize 握手时协商双方支持的能力
    │   ├── capabilities.tools → 是否支持工具调用
    │   ├── capabilities.resources → 是否支持资源访问
    │   └── capabilities.prompts → 是否支持提示模板
    └── 传输层：支持多种传输方式
        ├── stdio（标准输入输出）→ 本地进程通信
        ├── HTTP + SSE → 远程服务器通信
        └── WebSocket → 双向实时通信

  核心交互流程：
    1. 初始化握手：
       ├── Client 发送 initialize 请求（声明自己支持的能力）
       ├── Server 返回 capabilities（声明自己支持的能力）
       └── 双方根据交集确定最终启用的功能
    2. 工具发现：
       ├── Client 发送 tools/list → Server 返回可用工具列表
       ├── 每个工具包含 name/description/inputSchema
       └── Client 将工具列表注入 LLM 的上下文
    3. 工具执行：
       ├── LLM 决定调用工具 → Client 发送 tools/call
       ├── Server 执行工具 → 返回结果
       └── Client 将结果反馈给 LLM → 继续推理

  前端集成 MCP 的架构选择：
    ├── 方案 A：前端直连 MCP Server（通过 HTTP+SSE）
    │   ├── 优势：低延迟，无需后端中转
    │   └── 风险：暴露 API Key，安全风险高
    ├── 方案 B：后端作为 MCP Client，前端通过 API 间接调用
    │   ├── 优势：安全（API Key 在服务端），可控
    │   └── 劣势：多一跳延迟
    └── 方案 C（推荐）：后端 MCP Client + 前端 SSE 流式展示
        ├── 后端管理 MCP 连接和工具执行
        ├── 前端通过 SSE 接收流式结果
        └── 兼顾安全和体验
```

---

## 高频面试题

### Q1: 前端 AI 应用的架构挑战有哪些？

**参考答案要点**：

- 流式输出的 UI 渲染（逐字显示 + Markdown 实时解析）
- 上下文窗口管理（Token 限制、摘要压缩）
- Agent 思考过程的可视化
- 工具调用的权限和安全
- 离线/弱网下的降级策略

### Q2: 如何处理 LLM 的流式输出？

**参考答案要点**：

- SSE 协议：HTTP Chunked Transfer + text/event-stream
- ReadableStream 逐块读取 + TextDecoder 解码
- 背压控制：防止 LLM 生成速度超过客户端渲染速度
- 支持中断/取消（AbortController 关闭 HTTP 连接）
- 错误恢复（断线重连、从上次位置继续）

### Q3: Agent 前端的 UX 设计要点？

**参考答案要点**：

- ReAct 循环：Thought → Action → Observation 的可视化展示
- 工具调用需要用户确认（Human-in-the-Loop，安全敏感操作）
- 支持中断正在执行的 Agent（AbortController）
- 错误时展示清晰的失败原因和重试选项
- 长时间任务提供进度反馈（当前第几轮推理）

---

## 延伸思考

1. **设计题**：设计一个支持多 Agent 协作的前端应用架构。
2. **场景题**：AI 对话应用的首 Token 延迟 3 秒，如何优化用户体验？
3. **对比题**：SSE vs WebSocket vs WebTransport 用于 AI 流式通信的 trade-off？

---

## 参考资料

- [MCP Protocol](https://modelcontextprotocol.io)
- [OpenAI API Streaming](https://platform.openai.com/docs/api-reference/streaming)
- [AI Engineering Patterns](https://lilianweng.github.io/posts/2023-06-23-agent/)
