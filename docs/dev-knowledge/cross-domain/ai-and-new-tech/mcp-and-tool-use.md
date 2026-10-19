---
title: 'MCP 协议与 Tool Use 前端实践 [P6-P7]'
level: 'senior'
tags: ['MCP', 'Tool Use', 'Agent', '协议', 'AI 工具']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# MCP 协议与 Tool Use 前端实践 [P6-P7]

> Model Context Protocol（MCP）是 2025-2026 年 AI 工程领域最重要的标准化协议之一。它为 LLM 与外部工具的交互提供了统一规范，前端需要实现 Tool Use 的展示、确认和结果渲染。

## 核心概念（What）

### MCP 核心架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LLM 应用   │────→│  MCP Client  │────→│  MCP Server  │
│  (Host)      │     │              │     │  (Tool)      │
└──────────────┘     └──────────────┘     └──────────────┘

MCP 三大能力：
├── Tools：LLM 可调用的外部工具（搜索、代码执行、API 调用）
├── Resources：外部资源访问（文件、数据库、API 数据）
└── Prompts：预定义的提示模板

Tool Use 流程：
1. 用户发送消息
2. LLM 分析 → 决定调用哪个工具
3. MCP Client 执行工具调用
4. 返回结果给 LLM
5. LLM 基于结果生成最终回复
```

---

## 底层原理（Why）

### 1. 工具描述协议：LLM 如何理解工具

Tool Use 的底层不是「API 调用」，而是**JSON Schema 工具描述 + LLM 结构化输出 + 运行时工具注册表**。

```
工具描述协议底层：

  工具注册阶段：
    ├── 每个工具向 LLM 提供结构化描述：
    │   {
    │     name: "search_web",
    │     description: "搜索互联网获取实时信息",
    │     inputSchema: {
    │       type: "object",
    │       properties: {
    │         query: { type: "string", description: "搜索关键词" },
    │         maxResults: { type: "number", description: "最大结果数" }
    │       },
    │       required: ["query"]
    │     }
    │   }
    ├── LLM 将工具描述注入到系统提示中
    │   ├── 工具名称 → LLM 知道可以调用什么
    │   ├── description → LLM 理解每个工具的能力和适用场景
    │   └── inputSchema → LLM 知道需要传递什么参数
    └── 描述质量直接决定 LLM 的工具选择准确率

  LLM 工具调用的生成过程：
    1. 用户消息 + 工具描述 → 注入 LLM 上下文
    2. LLM 推理：分析用户需求 → 判断是否需要工具
    3. 如果需要 → LLM 生成结构化输出（不是自然语言）：
       { "tool": "search_web", "arguments": { "query": "..." } }
    4. 前端解析结构化输出 → 匹配工具注册表 → 执行
    └── 关键点：LLM 的输出格式由 API 约束（tool_choice 参数）

  前端工具注册表设计：
    ├── 注册表维护所有可用工具的元数据
    ├── 每个工具包含：
    │   ├── schema（用于 LLM 理解）
    │   ├── handler（执行函数）
    │   ├── permission（权限级别）
    │   └── renderer（结果渲染组件）
    └── 动态注册/注销（运行时添加新工具）
```

### 2. 工具执行安全模型：沙箱 + 权限分级 + Human-in-the-Loop

工具安全的底层不是「if/else 权限判断」，而是**多层防御体系：输入验证 → 权限检查 → 沙箱执行 → 结果过滤**。

```
工具执行安全模型：

  第一层：输入验证（防止注入攻击）
    ├── LLM 生成的参数可能包含恶意内容
    │   ├── SQL 注入：query = "'; DROP TABLE users; --"
    │   ├── 路径穿越：path = "../../etc/passwd"
    │   └── XSS：content = "<script>alert(1)</script>"
    ├── 每个工具的 handler 负责验证自己的参数
    └── 通用验证：白名单字符、长度限制、类型检查

  第二层：权限分级（Tool Permission Levels）
    ├── AUTO：自动执行（只读操作，如搜索、读取）
    ├── CONFIRM：需要用户确认（写操作，如创建文件、发送请求）
    ├── RESTRICTED：条件性限制（如只在特定时间/金额下需要确认）
    └── BLOCKED：完全禁止（如删除数据库、发送邮件）

  第三层：沙箱执行（代码执行类工具）
    ├── Web Worker 隔离：在独立线程中执行代码
    │   ├── 无法访问主线程的 DOM、Cookie、LocalStorage
    │   ├── 内存限制（Web Worker 独立内存空间）
    │   └── 执行超时（超过 N 秒自动终止）
    ├── WASM 沙箱：更严格的隔离（系统级沙箱）
    │   ├── 没有文件系统访问
    │   ├── 没有网络访问（除非显式允许）
    │   └── 内存边界检查
    └── iframe 沙箱：sandbox 属性限制能力
        ├── sandbox="allow-scripts"（只允许 JS）
        └── 不添加 allow-same-origin（阻止访问父页面）

  第四层：结果过滤（防止数据泄露）
    ├── 工具返回结果可能包含敏感信息
    ├── 前端在展示前过滤敏感字段
    └── 日志中脱敏处理
```

### 3. Agent 循环的前端状态机

Agent Tool Use 的底层不是「while 循环」，而是**有限状态机驱动的推理-行动循环 + 可中断/可恢复的执行引擎**。

```
Agent 循环的状态机模型：

  状态定义：
    ├── idle：等待用户输入
    ├── thinking：LLM 正在推理（等待 API 响应）
    ├── tool_calling：LLM 决定调用工具（等待工具执行）
    ├── tool_result：工具执行完成（准备将结果反馈给 LLM）
    ├── confirming：等待用户确认敏感操作
    ├── streaming：LLM 正在流式输出最终答案
    ├── error：执行出错（可重试或终止）
    └── done：完成（展示最终答案）

  状态转换规则：
    idle → thinking（用户发送消息）
    thinking → tool_calling（LLM 决定调用工具）
    thinking → streaming（LLM 直接给出答案）
    thinking → error（API 调用失败）
    tool_calling → confirming（敏感工具需要确认）
    tool_calling → tool_result（工具执行完成）
    tool_calling → error（工具执行失败）
    confirming → tool_calling（用户确认，执行工具）
    confirming → error（用户拒绝）
    tool_result → thinking（将结果反馈给 LLM，继续推理）
    streaming → done（流式输出完成）

  可中断设计：
    ├── AbortController 贯穿整个 Agent 循环
    ├── 用户点击「停止」→ abort 当前操作
    │   ├── thinking 中 → 取消 API 请求
    │   ├── tool_calling 中 → 取消工具执行
    │   └── streaming 中 → 停止流式接收
    ├── 中断后状态保存（可以恢复继续）
    └── 超时控制：每个状态设置最大停留时间

  并发工具调用：
    ├── LLM 可能一次返回多个工具调用
    ├── 独立工具 → 并行执行（Promise.all）
    ├── 有依赖的工具 → 串行执行（按依赖顺序）
    └── 部分失败 → 已成功的结果仍然有效，失败的标记错误
```

### 4. 工具结果渲染管线

工具结果渲染的底层不是「switch/case 组件选择」，而是**结构化数据 → 渲染策略匹配 → 自适应布局的管线**。

```
工具结果渲染管线：

  渲染策略匹配：
    ├── 工具结果类型 → 自动匹配最佳渲染组件
    │   ├── 搜索结果列表 → 卡片列表 + 高亮关键词
    │   ├── 代码执行输出 → 终端风格（等宽字体 + 语法高亮）
    │   ├── 文件内容 → 预览组件（Markdown/代码/图片）
    │   ├── JSON 数据 → 可折叠的树形查看器
    │   ├── 图表数据 → 自动选择图表类型（折线/柱状/饼图）
    │   └── 未知类型 → 原始 JSON 格式化显示
    └── 渲染组件从工具注册表的 renderer 字段获取

  时间线展示模式：
    ├── Agent 的多步推理过程以时间线形式展示
    ├── 每个步骤包含：
    │   ├── Thought（推理过程）→ 可折叠的思考气泡
    │   ├── Tool Call（工具调用）→ 工具名称 + 参数摘要
    │   ├── Tool Result（工具结果）→ 结构化渲染
    │   └── 状态指示器（loading/success/error）
    └── 用户可以展开/折叠每个步骤（避免信息过载）

  性能优化：
    ├── 虚拟滚动：工具调用步骤多时只渲染可见区域
    ├── 延迟渲染：不可见的步骤不执行渲染
    └── 结果缓存：相同参数的工具调用结果可复用
```

---

## 高频面试题

### Q1: MCP 协议解决了什么问题？

**参考答案要点**：

- 统一了 LLM 与外部工具的交互协议（之前各家实现不同）
- 标准化了工具描述（JSON Schema）
- 支持工具的发现和动态加载
- 前端可以统一处理不同工具的调用和结果展示
- 类比：USB 之于硬件设备 = MCP 之于 AI 工具

### Q2: Tool Use 的安全考虑？

**参考答案要点**：

- 多层防御：输入验证 → 权限分级 → 沙箱执行 → 结果过滤
- 敏感操作需要用户确认（Human-in-the-Loop）
- 代码执行类工具在沙箱中运行（Web Worker/WASM/iframe）
- 审计日志（记录所有工具调用）

### Q3: 如何设计好的 Tool Use UX？

**参考答案要点**：

- Agent 循环状态机驱动（idle → thinking → tool_calling → streaming → done）
- 实时展示工具调用状态（调用中/成功/失败）
- 敏感操作需要用户确认，支持中断
- 工具结果结构化展示（不是原始 JSON）
- 时间线模式展示多步推理过程

---

## 延伸思考

1. **设计题**：设计一个支持多工具的 AI Agent 前端界面。
2. **场景题**：工具调用超时或失败，如何优雅降级？
3. **对比题**：MCP vs OpenAI Function Calling vs LangChain Tools？

---

## 参考资料

- [MCP Protocol](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Tool Use Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
