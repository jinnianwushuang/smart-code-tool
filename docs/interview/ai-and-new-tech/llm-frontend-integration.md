---
title: "LLM 前端集成 [P6-P7]"
level: "senior"
tags: ["LLM", "流式输出", "Tokenizer", "本地推理", "WASM"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# LLM 前端集成 [P6-P7]

> 2026 年，LLM 不再只是后端的事。前端需要处理流式输出、Token 计算、本地推理（WebGPU/WASM）、上下文管理等全新挑战。

## 核心概念（What）

### 前端 LLM 集成架构

```
┌─────────────────────────────────┐
│         UI 层                    │
│  对话界面 │ Markdown 渲染 │ 代码高亮│
├─────────────────────────────────┤
│         通信层                   │
│  SSE 流式 │ AbortController │ 重试│
├─────────────────────────────────┤
│         处理层                   │
│  Tokenizer │ 上下文管理 │ 缓存   │
├─────────────────────────────────┤
│         推理层                   │
│  远程 API │ WebGPU 本地推理      │
└─────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. 流式输出处理

```typescript
// 完整的流式聊天实现
class ChatStream {
  private abortController: AbortController | null = null;

  async send(messages: Message[], onChunk: (text: string) => void) {
    this.abortController = new AbortController();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
      signal: this.abortController.signal,
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {}
      }
    }
  }

  abort() {
    this.abortController?.abort();
  }
}

// React Hook
function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef(new ChatStream());

  const send = useCallback(async (input: string) => {
    setIsStreaming(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);

    let assistantContent = '';
    await streamRef.current.send(newMessages, (chunk) => {
      assistantContent += chunk;
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistantContent },
      ]);
    });
    setIsStreaming(false);
  }, [messages]);

  return { messages, send, isStreaming, abort: () => streamRef.current.abort() };
}
```

### 2. Tokenizer 前端实现

```typescript
// 前端 Token 计数（用于上下文管理）
class TokenCounter {
  private encoder: TextEncoder;

  constructor() {
    this.encoder = new TextEncoder();
  }

  // 粗略估计（英文约 4 字符/token，中文约 2 字符/token）
  estimate(text: string): number {
    const bytes = this.encoder.encode(text).length;
    // GPT-4 大约 1 token ≈ 4 字节英文 / 3 字节中文
    return Math.ceil(bytes / 4);
  }

  // 精确计算（需要加载 tokenizer 模型）
  async countExact(text: string): Promise<number> {
    // 使用 tiktoken 的 WASM 版本
    const encoding = await getEncoding('cl100k_base');
    return encoding.encode(text).length;
  }
}

// 上下文窗口管理
class ContextManager {
  private maxTokens: number;
  private counter = new TokenCounter();

  constructor(maxTokens = 4096) {
    this.maxTokens = maxTokens;
  }

  // 截断消息列表以适应上下文窗口
  trimMessages(messages: Message[]): Message[] {
    const systemMsg = messages.find(m => m.role === 'system');
    const nonSystemMsgs = messages.filter(m => m.role !== 'system');

    let totalTokens = systemMsg ? this.counter.estimate(systemMsg.content) : 0;
    const result: Message[] = [];

    // 从最新消息开始，向前添加
    for (let i = nonSystemMsgs.length - 1; i >= 0; i--) {
      const msg = nonSystemMsgs[i];
      const tokens = this.counter.estimate(msg.content);
      if (totalTokens + tokens > this.maxTokens - 500) break; // 预留 500 token 给回复
      totalTokens += tokens;
      result.unshift(msg);
    }

    if (systemMsg) result.unshift(systemMsg);
    return result;
  }
}
```

### 3. WebGPU 本地推理

```typescript
// 2026 年，WebGPU 允许在浏览器中运行小型 LLM
// 使用 transformers.js 或 WebLLM
import { pipeline } from '@xenova/transformers';

// 加载本地模型（首次需要下载）
const generator = await pipeline('text-generation', 'Xenova/gpt2');

// 本地推理（无需网络）
const result = await generator('Hello, world!', {
  max_new_tokens: 100,
  temperature: 0.7,
});

// WebGPU 加速（比 WASM 快 5-10 倍）
// 适用场景：隐私敏感数据、离线场景、减少 API 成本
// 限制：模型大小（< 2GB）、GPU 内存、浏览器兼容性
```

### 4. 流式 Markdown 渲染

```typescript
// 流式 Markdown 渲染器
function StreamingMarkdown({ content }: { content: string }) {
  // 使用 marked + 增量渲染
  const html = useMemo(() => {
    return marked.parse(content, {
      breaks: true,
      gfm: true,
    });
  }, [content]);

  return (
    <div className="markdown-body">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Cursor />  {/* 闪烁光标表示正在生成 */}
    </div>
  );
}

// 性能优化：避免每次 chunk 都重新解析整个 Markdown
// 方案：增量解析（只解析新增部分）
```

---

## 高频面试题

### Q1: 前端如何处理 LLM 的流式输出？

**参考答案要点**：
- 使用 ReadableStream + TextDecoder 逐块读取
- SSE 格式解析（data: 前缀 + JSON）
- 增量更新 UI（避免全量 re-render）
- 支持中断（AbortController）
- 错误恢复（断线重连、从上次位置继续）

### Q2: 如何在浏览器端运行 LLM？

**参考答案要点**：
- WebGPU 加速推理（transformers.js、WebLLM）
- 模型量化（INT4/INT8 减小体积）
- 限制：模型大小、GPU 内存、推理速度
- 适用：隐私场景、离线场景、小模型
- 趋势：2026 年 WebGPU 已广泛支持

### Q3: 如何管理 LLM 的上下文窗口？

**参考答案要点**：
- Token 计数（精确或粗略估计）
- 保留系统消息和最近 N 轮对话
- 早期对话摘要压缩
- 滑动窗口策略
- 预留 Token 给模型回复

---

## 延伸思考

1. **设计题**：设计一个支持离线使用的 AI 聊天应用。
2. **场景题**：流式 Markdown 渲染在长文本时卡顿，如何优化？
3. **对比题**：远程 API vs 本地推理 vs 混合方案，各自的 trade-off？

---

## 参考资料

- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [WebLLM](https://webllm.mlc.ai)
- [OpenAI Streaming API](https://platform.openai.com/docs/api-reference/streaming)
- [WebGPU API](https://www.w3.org/TR/webgpu/)
