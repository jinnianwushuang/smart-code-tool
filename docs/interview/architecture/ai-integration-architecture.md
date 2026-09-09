---
title: "AI 能力集成架构 [P8]"
level: "architect"
tags: ["AI 集成", "Agent", "流式协议", "上下文管理", "LLM"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
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

### 1. 流式输出架构

```typescript
// SSE 流式接收 LLM 输出
async function streamChat(prompt: string, onChunk: (text: string) => void) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      const parsed = JSON.parse(data);
      onChunk(parsed.choices[0].delta.content);
    }
  }
}

// React 集成
function ChatMessage({ prompt }: { prompt: string }) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setIsStreaming(true);
    streamChat(prompt, (chunk) => {
      setContent(prev => prev + chunk);
    }).finally(() => setIsStreaming(false));
  }, [prompt]);

  return (
    <div className="message">
      <MarkdownRenderer content={content} />
      {isStreaming && <Cursor />}
    </div>
  );
}
```

### 2. AI Agent 前端架构

```typescript
// Agent 工具调用循环
interface AgentStep {
  type: 'thought' | 'tool_call' | 'tool_result' | 'final_answer';
  content: string;
  tool?: { name: string; input: unknown };
}

class AgentOrchestrator {
  private steps: AgentStep[] = [];

  async run(userMessage: string): AsyncGenerator<AgentStep> {
    this.steps = [{ type: 'thought', content: `User says: ${userMessage}` }];

    while (true) {
      // 调用 LLM 决定下一步
      const response = await this.callLLM(this.steps);

      if (response.type === 'final_answer') {
        yield response;
        return;
      }

      if (response.type === 'tool_call') {
        yield response;
        // 执行工具
        const result = await this.executeTool(response.tool!);
        const toolStep: AgentStep = { type: 'tool_result', content: JSON.stringify(result) };
        this.steps.push(toolStep);
        yield toolStep;
      }
    }
  }
}

// UI 展示 Agent 思考过程
function AgentPanel({ agent }: { agent: AgentOrchestrator }) {
  const [steps, setSteps] = useState<AgentStep[]>([]);

  async function run(message: string) {
    for await (const step of agent.run(message)) {
      setSteps(prev => [...prev, step]);
    }
  }
}
```

### 3. 上下文管理

```typescript
// 上下文窗口管理
class ContextManager {
  private maxTokens: number;
  private messages: Message[] = [];

  constructor(maxTokens: number = 4096) {
    this.maxTokens = maxTokens;
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.trimIfNeeded();
  }

  // 上下文裁剪策略
  private trimIfNeeded() {
    const totalTokens = this.messages.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content), 0
    );

    if (totalTokens <= this.maxTokens) return;

    // 策略 1：保留系统消息和最近 N 轮
    // 策略 2：摘要压缩早期对话
    // 策略 3：滑动窗口（保留最近消息）
    while (this.estimateTotal() > this.maxTokens && this.messages.length > 2) {
      // 保留 system 和最后一条，移除中间的
      const systemMsg = this.messages.find(m => m.role === 'system');
      const recent = this.messages.slice(-4);
      this.messages = [systemMsg, ...recent].filter(Boolean);
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // 粗略估计
  }
}
```

### 4. MCP 协议集成

```
MCP（Model Context Protocol）前端集成：

┌──────────┐     ┌──────────┐     ┌──────────┐
│  前端 UI  │────→│  MCP     │────→│  Tools   │
│          │     │  Client  │     │  Server  │
└──────────┘     └──────────┘     └──────────┘

MCP 能力：
├── Tool Use：LLM 调用外部工具（搜索、代码执行、API 调用）
├── Context：管理对话上下文和系统提示
├── Resources：文件、数据库等外部资源访问
└── Streaming：流式输出和中间步骤展示

前端集成要点：
- 工具调用结果的结构化展示
- 工具权限控制（哪些工具可用）
- 中间步骤的 UI 反馈
- 错误处理和重试
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
- 使用 SSE 或 ReadableStream 逐块接收
- React 中使用 useRef 避免频繁 re-render
- Markdown 流式渲染（partial parsing）
- 支持中断/取消（AbortController）
- 错误恢复（断线重连、从上次位置继续）

### Q3: Agent 前端的 UX 设计要点？

**参考答案要点**：
- 实时展示思考过程（Thought → Tool → Result → Answer）
- 工具调用需要用户确认（安全敏感操作）
- 支持中断正在执行的 Agent
- 错误时展示清晰的失败原因和重试选项
- 长时间任务提供进度反馈

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
