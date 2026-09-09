---
title: 'MCP 协议与 Tool Use 前端实践 [P6-P7]'
level: 'senior'
tags: ['MCP', 'Tool Use', 'Agent', '协议', 'AI 工具']
difficulty: 'hard'
updated: '2026-09-10'
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

### 1. Tool Use 前端实现

```typescript
// Tool 定义
interface Tool {
  name: string
  description: string
  inputSchema: JSONSchema
}

// Tool 调用请求
interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

// Tool 调用结果
interface ToolResult {
  id: string
  content: string
  isError: boolean
}

// 前端处理 Tool Use 流程
class ToolUseHandler {
  async process(message: string, tools: Tool[]) {
    const response = await this.callLLM(message, tools)

    // 检查是否有工具调用
    if (response.toolCalls?.length) {
      const results: ToolResult[] = []

      for (const call of response.toolCalls) {
        // 展示工具调用中...
        this.ui.showToolCalling(call)

        // 敏感工具需要用户确认
        if (this.requiresConfirmation(call)) {
          const confirmed = await this.ui.requestConfirmation(call)
          if (!confirmed) {
            results.push({ id: call.id, content: 'User cancelled', isError: true })
            continue
          }
        }

        // 执行工具
        const result = await this.executeTool(call)
        results.push(result)
        this.ui.showToolResult(call, result)
      }

      // 将工具结果返回给 LLM 继续生成
      return this.callLLMWithResults(message, tools, results)
    }

    return response
  }
}
```

### 2. 工具权限控制

```typescript
// 工具权限分级
enum ToolPermission {
  AUTO,        // 自动执行（无需确认）
  CONFIRM,     // 需要用户确认
  RESTRICTED,  // 受限（特定条件下需要确认）
  BLOCKED,     // 禁止使用
}

// 权限配置
const toolPermissions: Record<string, ToolPermission> = {
  'search': ToolPermission.AUTO,        // 搜索自动执行
  'read_file': ToolPermission.AUTO,     // 读文件自动执行
  'write_file': ToolPermission.CONFIRM, // 写文件需要确认
  'delete': ToolPermission.CONFIRM,     // 删除需要确认
  'execute_code': ToolPermission.CONFIRM,
  'send_email': ToolPermission.BLOCKED, // 禁止自动发邮件
};

// 确认 UI
function ToolConfirmationDialog({ toolCall }: { toolCall: ToolCall }) {
  return (
    <Dialog>
      <p>AI 想要执行以下操作：</p>
      <code>{toolCall.name}({JSON.stringify(toolCall.arguments)})</code>
      <div className="actions">
        <Button onClick={() => confirm(true)}>允许</Button>
        <Button onClick={() => confirm(false)}>拒绝</Button>
        <Button onClick={() => confirm(true, 'always')}>始终允许</Button>
      </div>
    </Dialog>
  );
}
```

### 3. 工具调用结果渲染

```typescript
// 不同工具结果的渲染策略
function ToolResultRenderer({ result }: { result: ToolResult }) {
  switch (result.toolName) {
    case 'search':
      return <SearchResults items={result.data} />;
    case 'code_execution':
      return <CodeOutput output={result.data.output} />;
    case 'file_read':
      return <FilePreview content={result.data.content} />;
    case 'api_call':
      return <JSONViewer data={result.data} />;
    default:
      return <pre>{JSON.stringify(result.data, null, 2)}</pre>;
  }
}

// 工具调用时间线 UI
function ToolCallTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div key={i} className={`step step-${step.type}`}>
          {step.type === 'thought' && <ThoughtBubble text={step.content} />}
          {step.type === 'tool_call' && <ToolCallCard call={step.toolCall} />}
          {step.type === 'tool_result' && <ToolResultRenderer result={step.result} />}
          {step.type === 'final_answer' && <MarkdownRenderer content={step.content} />}
        </div>
      ))}
    </div>
  );
}
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

- 工具权限分级（自动/确认/禁止）
- 敏感操作需要用户确认
- 沙箱执行（代码执行类工具）
- 输入验证（防止注入攻击）
- 审计日志（记录所有工具调用）

### Q3: 如何设计好的 Tool Use UX？

**参考答案要点**：

- 实时展示工具调用状态（调用中/成功/失败）
- 敏感操作需要用户确认
- 工具结果结构化展示（不是原始 JSON）
- 支持中断正在执行的工具
- 错误时展示清晰的失败原因

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
