---
title: "实时协作系统设计 [P8]"
level: "architect"
tags: ["CRDT", "OT", "WebSocket", "实时协作"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 实时协作系统设计 [P8]

> 实时协作是前端架构中最具挑战性的系统设计之一。2026 年，CRDT 成为主流方案，结合 WebSocket/WebTransport 实现毫秒级同步。

## 核心概念（What）

### 实时协作核心技术

```
┌─────────────────────────────────┐
│         协作应用层               │
│  文档编辑 │ 白板 │ 表格 │ 设计   │
├─────────────────────────────────┤
│         冲突解决层               │
│  CRDT │ OT │ 最后写入者胜出     │
├─────────────────────────────────┤
│         通信层                   │
│  WebSocket │ WebTransport │ SSE │
├─────────────────────────────────┤
│         存储层                   │
│  操作日志 │ 快照 │ 版本历史      │
└─────────────────────────────────┘
```

### CRDT vs OT

| 特性 | CRDT | OT |
|------|------|-----|
| 冲突解决 | 数据结构保证收敛 | 中心服务器转换 |
| 去中心化 | ✓（P2P 可用） | ✗（需要中心节点） |
| 离线支持 | 天然支持 | 需要额外处理 |
| 实现复杂度 | 高（数据结构复杂） | 中（算法复杂） |
| 代表实现 | Yjs, Automerge | Google Docs |

---

## 底层原理（Why）

### 1. CRDT 基础

```typescript
// Yjs 示例：协作富文本编辑
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// 创建文档
const doc = new Y.Doc();

// 协作富文本
const ytext = doc.getText('content');

// WebSocket 连接
const provider = new WebsocketProvider('wss://yjs.example.com', 'my-doc', doc);

// 监听变更
ytext.observe((event) => {
  // 其他用户的修改会同步到这里
  updateEditor(event);
});

// 本地编辑（自动同步到其他用户）
ytext.insert(0, 'Hello ');
ytext.insert(6, 'World');

// 协作感知（光标位置）
const yawareness = provider.awareness;
yawareness.setLocalState({ cursor: { index: 5, length: 0 } });
```

### 2. WebSocket 架构

```typescript
// WebSocket 服务端架构
class CollabServer {
  private rooms = new Map<string, Room>();

  handleConnection(ws: WebSocket, docId: string, userId: string) {
    const room = this.getOrCreateRoom(docId);

    // 加入房间
    room.addUser(userId, ws);

    // 发送当前文档状态
    ws.send(JSON.stringify({ type: 'snapshot', data: room.getSnapshot() }));

    // 广播操作
    ws.on('message', (data) => {
      const op = JSON.parse(data);
      room.applyOperation(op);
      room.broadcast(op, userId); // 广播给其他用户
    });

    ws.on('close', () => room.removeUser(userId));
  }
}

// 消息类型
type CollabMessage =
  | { type: 'operation'; op: Operation; userId: string; clock: number }
  | { type: 'snapshot'; data: DocumentSnapshot }
  | { type: 'awareness'; userId: string; cursor: Cursor }
  | { type: 'presence'; userId: string; selection: Selection };
```

### 3. 冲突解决策略

```
冲突场景和解决方案：

场景 1：同时编辑同一位置
├── CRDT：自动合并（字符级别）
├── OT：服务器决定顺序
└── LWW：后写入者覆盖

场景 2：离线编辑后合并
├── CRDT：天然支持（操作日志合并）
├── OT：需要重放操作
└── LWW：可能丢失数据

场景 3：大量并发编辑
├── CRDT：文档大小增长（操作日志）
├── OT：服务器负载高
└── 优化：定期快照压缩
```

### 4. 性能优化

```
性能优化策略：
├── 操作合并（批量发送，减少消息数）
├── 快照压缩（定期生成快照，截断操作日志）
├── 增量同步（只发送差异）
├── 懒加载（大文档分段加载）
└── 本地优先（先更新本地，再同步）

延迟优化：
├── WebSocket 长连接（避免 HTTP 握手开销）
├── 操作预测（乐观更新）
├── 光标平滑（动画过渡）
└── 感知延迟 < 100ms（用户无感知）
```

---

## 高频面试题

### Q1: CRDT 和 OT 如何选择？

**参考答案要点**：
- CRDT：去中心化、离线支持好、P2P 可用
- OT：实现相对简单、Google Docs 验证
- 新项目推荐 CRDT（Yjs/Automerge）
- 选择依据：是否需要离线、是否需要 P2P、团队经验

### Q2: 如何保证实时协作的延迟体验？

**参考答案要点**：
- 本地优先（先更新本地 UI，再同步）
- 操作预测（乐观更新）
- WebSocket 长连接
- 操作合并（批量发送）
- 目标：感知延迟 < 100ms

### Q3: 如何处理大文档的协作性能？

**参考答案要点**：
- 分段加载（只加载可视区域）
- 定期快照（压缩操作日志）
- 增量同步（只发送差异）
- 虚拟滚动（大列表/大表格）
- 懒加载（按需加载内容块）

---

## 延伸思考

1. **设计题**：设计一个支持 100 人同时编辑的在线文档系统。
2. **场景题**：用户 A 离线编辑了 1 小时，恢复网络后如何合并？
3. **对比题**：Yjs vs Automerge vs Liveblocks，CRDT 库对比？

---

## 参考资料

- [CRDT 论文](https://arxiv.org/abs/2004.04303)
- [Yjs 文档](https://docs.yjs.dev)
- [Automerge 文档](https://automerge.org)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
