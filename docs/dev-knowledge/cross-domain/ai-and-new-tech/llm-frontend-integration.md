---
title: 'LLM 前端集成 [P6-P7]'
level: 'senior'
tags: ['LLM', '流式输出', 'Tokenizer', '本地推理', 'WebGPU']
difficulty: 'hard'
target: 'P6+ 高级工程师'
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

### 1. SSE 流式接收的浏览器管线

流式输出的底层不是「ReadableStream API 调用」，而是**HTTP Chunked → ReadableStream → TextDecoder → SSE 解析 → 增量 DOM 更新的浏览器管线**。

```
SSE 流式接收的浏览器管线：

  HTTP 层：
    ├── 服务端返回 Transfer-Encoding: chunked
    ├── 每个 chunk = "data: {json}\n\n"（SSE 协议格式）
    ├── 浏览器接收到 chunk 后立即触发 ReadableStream 的 readable 事件
    └── 不需要等待完整响应（与传统 HTTP 请求的根本区别）

  流解析层：
    ├── ReadableStream.getReader() 获取读取器
    ├── reader.read() 返回 { done, value }（value 是 Uint8Array）
    ├── TextDecoder 将 Uint8Array 转为 UTF-8 字符串
    ├── 缓冲拼接：不完整的行保留在 buffer 中
    │   ├── decoder.decode(value, { stream: true }) → 处理多字节字符
    │   └── 按 \n 分割 → 最后一个不完整的行放回 buffer
    └── SSE 过滤：只处理 "data: " 前缀的行

  增量渲染层（性能关键）：
    ├── 问题：每次收到 chunk 都 setState → 触发整个组件 re-render
    ├── 优化方案：
    │   ├── useRef 存储累积内容（不触发 re-render）
    │   ├── requestAnimationFrame 节流更新（每帧最多一次 setState）
    │   └── 或使用 useSyncExternalStore（精确控制订阅更新）
    └── Markdown 增量渲染：
        ├── 不重新解析整个 Markdown（O(n) 每次 chunk → O(n²) 总开销）
        ├── 增量解析：只解析新增的文本片段
        └── 使用 marked/remark 的 tokenizer 模式（逐 token 解析）
```

### 2. Tokenizer 的 BPE 算法与前端实现

Tokenizer 的底层不是「字符计数」，而是**BPE（Byte Pair Encoding）子词分词算法 + 词表查找**。

```
BPE Tokenizer 底层：

  BPE 算法原理：
    1. 训练阶段（离线）：
       ├── 从语料库统计所有相邻字节对的出现频率
       ├── 选择最高频的字节对 → 合并为新 token
       ├── 重复上述过程 N 次 → 得到词表（vocabulary）
       └── 词表示例：{ "the": 0, "th": 1, "e": 2, "ing": 3, ... }

    2. 编码阶段（运行时）：
       ├── 输入文本 → 拆分为单字节序列
       ├── 贪心匹配：从左到右，每次匹配词表中最长的子词
       │   ├── "streaming" → "stream" + "ing"（2 个 token）
       │   └── 不是 "s" + "t" + "r" + ...（7 个 token）
       └── 输出：token ID 序列（整数数组）

  前端 Tokenizer 的挑战：
    ├── 精确计算需要加载词表文件（GPT-4 的 cl100k 词表 ~4.5MB）
    ├── 解决方案：
    │   ├── 方案 A：加载 WASM 版 tiktoken（C++ 编译，速度快）
    │   ├── 方案 B：纯 JS 实现（慢但无额外依赖）
    │   └── 方案 C：粗略估算（字符数 / 4 英文，字符数 / 2 中文）
    └── 性能：WASM 版 ~10x 快于纯 JS 版

  上下文窗口管理策略：
    ├── 预算分配：总窗口 = 系统提示 + 工具描述 + 对话历史 + 输出预留
    ├── 裁剪优先级（从最先丢弃）：
    │   ├── 1. 最早的非系统消息
    │   ├── 2. 最长的工具返回结果
    │   └── 3. 保留：系统提示 + 最近 2-3 轮对话
    └── 摘要压缩：早期对话由 LLM 生成摘要替代（节省 token）
```

### 3. WebGPU 本地推理的浏览器管线

WebGPU 推理的底层不是「在浏览器跑模型」，而是**GPU 计算管线 + 模型权重加载 + 内存管理的协同**。

```
WebGPU 本地推理底层：

  执行流程：
    1. 模型加载：
       ├── 模型文件（GGUF/Safetensors 格式）从 CDN 下载
       ├── 首次加载：下载 ~500MB-2GB（取决于模型大小）
       ├── 缓存到 IndexedDB / OPFS（后续启动秒级加载）
       └── 量化格式：INT4（最小）→ INT8 → FP16（最精确）

    2. GPU 初始化：
       ├── navigator.gpu.requestAdapter() → 获取 GPU 适配器
       ├── 创建 GPUDevice（逻辑设备）
       ├── 分配 GPUBuffer（模型权重存储）
       └── 创建 Compute Pipeline（计算管线）

    3. 推理执行：
       ├── 输入 token → 编码为整数 → 写入 GPU Buffer
       ├── 执行 Transformer 层（多层 Attention + FFN）
       │   ├── 每层都是 GPU Compute Shader（WGSL 语言）
       │   ├── KV Cache 存储在 GPU 显存中（避免重复计算）
       │   └── 自回归：每次生成一个 token → 追加到 KV Cache → 再次推理
       └── 输出 token ID → 解码为文本 → 显示到 UI

  性能约束：
    ├── GPU 显存限制：浏览器通常分配 < 4GB
    ├── 模型大小限制：INT4 量化后 ~500MB 的模型可在消费级 GPU 运行
    ├── 推理速度：~10-30 tokens/sec（取决于模型大小和 GPU 性能）
    └── 对比：远程 API ~50-100 tokens/sec（但需要网络延迟）

  适用场景判断：
    ├── 选本地推理：隐私敏感、离线需求、减少 API 成本
    ├── 选远程 API：大模型能力、速度要求高、设备性能有限
    └── 混合方案：优先本地 → 本地无法处理时 fallback 到远程
```

### 4. 流式 Markdown 增量渲染算法

流式 Markdown 渲染的底层不是「每次 chunk 重新 parse」，而是**增量 Tokenizer + 局部 DOM 更新**。

````
流式 Markdown 增量渲染：

  朴素方案的问题：
    ├── 每次收到新 chunk → marked.parse(全文) → innerHTML = 结果
    ├── 复杂度：O(n) 每次 × n 次 chunk = O(n²) 总开销
    └── 长文本时严重卡顿（1000 字 × 100 次 chunk = 100,000 次解析操作）

  增量渲染方案：
    1. 维护一个「已确认」缓冲区：
       ├── 已接收的文本分为两部分：
       │   ├── 已完成部分（不会再变化）→ 解析为 HTML 缓存
       │   └── 进行中部分（可能还在生成）→ 暂不解析
       ├── 如何判断「已完成」：
       │   ├── 遇到完整的块级元素结尾（空行、代码块结束符）
       │   └── 最后一个块级元素已完成 → 之前的文本都是「已完成」
       └── 只对「进行中」部分做轻量处理

    2. 增量解析策略：
       ├── 只解析新增的文本片段（不是全文）
       ├── 已解析的 HTML 保持不变（不重新渲染）
       └── 新 HTML 追加到 DOM 末尾（appendChild，不触发重排）

    3. 特殊处理：
       ├── 代码块：等待 ``` 结束符再一次性渲染（避免中间状态闪烁）
       ├── 表格：等待完整行再渲染
       └── 行内代码/粗体：可以实时渲染（不影响块级结构）
````

---

## 高频面试题

### Q1: 前端如何处理 LLM 的流式输出？

**参考答案要点**：

- HTTP Chunked → ReadableStream → TextDecoder → SSE 解析
- 缓冲拼接处理不完整行（多字节 UTF-8 字符）
- useRef + requestAnimationFrame 节流更新（避免每个 chunk 都 re-render）
- 支持中断（AbortController 关闭 HTTP 连接）
- 增量 Markdown 渲染（避免 O(n²) 全量重解析）

### Q2: 如何在浏览器端运行 LLM？

**参考答案要点**：

- WebGPU 计算管线 + 模型权重加载到 GPU Buffer
- 量化格式（INT4/INT8）减小模型体积和显存占用
- KV Cache 存储在 GPU 显存（避免重复计算历史 token）
- 限制：模型大小 < 2GB、GPU 显存 < 4GB、推理速度 ~10-30 tokens/sec
- 适用：隐私场景、离线场景、小模型

### Q3: 如何管理 LLM 的上下文窗口？

**参考答案要点**：

- BPE Tokenizer 精确计算 token 数（或粗略估算：字符数/4）
- 预算分配：系统提示 + 工具描述 + 对话历史 + 输出预留
- 裁剪策略：保留系统消息 + 最近 N 轮，丢弃最早的消息
- 摘要压缩：早期对话由 LLM 生成摘要替代

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
