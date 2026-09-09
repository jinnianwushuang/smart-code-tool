---
title: 'HTTP/3、WebTransport 与 QUIC [P6-P7]'
level: 'senior'
tags: ['HTTP/3', 'QUIC', 'WebTransport', '0-RTT']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# HTTP/3、WebTransport 与 QUIC [P6-P7]

> HTTP/3 基于 QUIC 协议，2026 年已被主流浏览器和 CDN 全面支持。WebTransport 则为前端提供了类似 WebSocket 但更强大的双向通信能力。

## 核心概念（What）

### 协议演进

```
HTTP/1.1 → HTTP/2 → HTTP/3
  │          │         │
  TCP       TCP       QUIC (UDP)
  文本      二进制     二进制
  队头阻塞   流级阻塞   无队头阻塞
  156ms     156ms     1-RTT / 0-RTT
```

### 核心特性对比

| 特性     | HTTP/1.1 | HTTP/2       | HTTP/3  |
| -------- | -------- | ------------ | ------- |
| 多路复用 | ✗        | ✓            | ✓       |
| 队头阻塞 | 严重     | 有（TCP 层） | 无      |
| 连接迁移 | ✗        | ✗            | ✓       |
| 0-RTT    | ✗        | ✗            | ✓       |
| 握手延迟 | 2-RTT    | 1-RTT        | 0-1 RTT |

---

## 底层原理（Why）

### 1. QUIC 协议核心

```
QUIC 核心优势：
├── 基于 UDP（避免 TCP 队头阻塞）
├── 内建 TLS 1.3（0-RTT 连接）
├── 流级别独立（一个流丢包不影响其他流）
├── 连接迁移（IP/端口变化不断连）
└── 拥塞控制可定制（不依赖操作系统）

QUIC 连接建立：
Client                          Server
  │─── Initial (QUIC + TLS) ──→│
  │←── Handshake + Data ───────│  ← 1-RTT 即可传数据
  │─── Data ──────────────────→│

  0-RTT 场景（之前连接过）：
  │─── 0-RTT Data ────────────→│  ← 直接发数据
  │←── Response ───────────────│
```

### 2. HTTP/3 对前端的影响

```
HTTP/3 前端优化变化：
├── 不再需要域名分片（sharding）
│   └── HTTP/2 用多域名绕过 6 连接限制
│   └── HTTP/3 单连接多路复用，无需分片
├── 连接迁移
│   └── WiFi → 4G 切换不断连
│   └── 对移动端体验提升明显
├── 0-RTT 连接
│   └── 重复访问几乎零延迟
│   └── 需要安全考虑（重放攻击）
└── 部署注意
    └── CDN 支持（Cloudflare、Akamai 已全面支持）
    └── 需要 UDP 443 端口开放
```

### 3. WebTransport

```typescript
// WebTransport：替代 WebSocket 的现代方案
const transport = new WebTransport('https://example.com/transport')
await transport.ready

// 发送数据（类似 WebSocket，但支持多流）
const stream = await transport.createBidirectionalStream()
const writer = stream.writable.getWriter()
await writer.write(new TextEncoder().encode('Hello'))

// 接收数据
const reader = stream.readable.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  console.log(new TextDecoder().decode(value))
}

// WebTransport vs WebSocket：
// ├── 多流（一个连接多个独立流，互不阻塞）
// ├── 基于 QUIC（0-RTT、连接迁移）
// ├── 支持不可靠传输（类似 UDP）
// ├── 双向流（类似 HTTP/2 流）
// └── 更好的拥塞控制
```

### 4. 优先级提示

```html
<!-- HTTP/3 优先级提示 -->
<link rel="preload" href="/critical.css" as="style" fetchpriority="high" />
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high" />
<script src="/app.js" fetchpriority="low"></script>

<!-- Priority Hints API -->
<img src="/below-fold.jpg" fetchpriority="low" />
<img src="/hero.jpg" fetchpriority="high" />
```

---

## 高频面试题

### Q1: HTTP/3 解决了 HTTP/2 的什么问题？

**参考答案要点**：

- TCP 层的队头阻塞（HTTP/2 多路复用但 TCP 是有序流）
- 连接建立延迟（QUIC 0-RTT vs TCP+TLS 2-RTT）
- 网络切换断连（QUIC 连接迁移 vs TCP 依赖 IP+Port）
- 拥塞控制绑定操作系统（QUIC 在用户空间实现）

### Q2: WebTransport 比 WebSocket 好在哪里？

**参考答案要点**：

- 多流：一个连接多个独立流，互不阻塞
- 基于 QUIC：0-RTT、连接迁移
- 支持不可靠传输（Datagram API）
- 更现代的 API 设计（Stream-based）
- 适用：实时游戏、音视频、大文件传输

### Q3: HTTP/3 时代，前端优化策略有什么变化？

**参考答案要点**：

- 不再需要域名分片
- 减少 HTTP/2 Push（HTTP/3 不再推荐）
- 利用 0-RTT 优化重复访问
- 优先级提示（fetchpriority）更重要
- 关注 CDN 的 HTTP/3 支持情况

---

## 延伸思考

1. **设计题**：为一个实时协作应用设计基于 WebTransport 的通信架构。
2. **场景题**：HTTP/3 部署后，如何验证和监控性能提升？
3. **对比题**：WebTransport vs WebSocket vs SSE 用于实时通信的 trade-off？

---

## 参考资料

- [HTTP/3 RFC](https://www.rfc-editor.org/rfc/rfc9114)
- [QUIC RFC](https://www.rfc-editor.org/rfc/rfc9000)
- [WebTransport API](https://www.w3.org/TR/webtransport/)
- [Can I use HTTP/3](https://caniuse.com/http3)
