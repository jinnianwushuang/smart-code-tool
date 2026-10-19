---
title: '客户端数据架构 [P8]'
level: 'architect'
tags: ['离线优先', 'IndexedDB', 'SQLite WASM', '缓存分层', '数据同步']
difficulty: 'expert'
target: '架构师（P8）'
---

# 客户端数据架构 [P8]

> 2026 年，客户端数据架构从「每次请求服务端」演进到「离线优先 + 本地数据库 + 增量同步」，PWA、协同编辑、离线应用对客户端数据层提出更高要求。

## 核心概念（What）

### 客户端数据架构分层

```
┌─────────────────────────────┐
│       应用层                 │
│  React/Vue 组件              │
├─────────────────────────────┤
│       数据访问层              │
│  Repository 模式             │
├──────────────┬──────────────┤
│  缓存层      │  持久化层     │
│  Memory      │  IndexedDB   │
│  LRU Cache   │  SQLite WASM │
├──────────────┴──────────────┤
│       同步层                 │
│  增量同步 │ 冲突解决 │ 队列  │
└─────────────────────────────┘
```

### 存储方案对比

| 方案             | 容量   | 查询     | 事务 | 适用场景   |
| ---------------- | ------ | -------- | ---- | ---------- |
| **localStorage** | 5MB    | 无       | 无   | 简单键值   |
| **IndexedDB**    | 大容量 | 索引查询 | 支持 | 结构化数据 |
| **SQLite WASM**  | 大容量 | SQL      | 完整 | 复杂查询   |
| **OPFS**         | 大容量 | 文件级   | 无   | 大文件     |

---

## 底层原理（Why）

### 1. IndexedDB 的存储引擎底层

IndexedDB 的底层不是「浏览器里的数据库」，而是**基于 LevelDB/SQLite 的浏览器端事务型存储引擎**。

```
IndexedDB 存储引擎底层：

  内部实现（以 Chromium 为例）：
    ├── 存储后端：LevelDB（磁盘上的 LSM-Tree 结构）
    ├── 抽象层：IndexedDB 规范 API → LevelDB 操作映射
    ├── 事务模型：MVCC（多版本并发控制）
    │   ├── 每个事务有快照（读取一致性视图）
    │   ├── 读写事务互斥（同一 Object Store）
    │   └── 只读事务可并发（共享快照）
    └── 索引实现：B+ Tree（LevelDB 的有序范围查询）

  性能特征：
    ├── 写入性能：~10,000 ops/sec（顺序写入，LSM-Tree 优势）
    ├── 读取性能：~50,000 ops/sec（点查，B+ Tree O(logN)）
    ├── 事务开销：每次事务创建需要 IPC 到浏览器进程
    └── 存储配额：通常为磁盘的 10-60%（浏览器策略不同）

  SQLite WASM vs IndexedDB 的本质区别：
    ├── IndexedDB：浏览器原生，API 异步，查询能力有限（只能索引+游标）
    ├── SQLite WASM：完整 SQL 引擎在 WASM 沙箱中运行
    │   ├── 查询能力：JOIN、子查询、窗口函数、CTE
    │   ├── 事务能力：完整 ACID（BEGIN/COMMIT/ROLLBACK）
    │   └── 存储后端：通过 OPFS（Origin Private File System）持久化
    └── 选择依据：简单键值/索引查询 → IndexedDB；复杂关系查询 → SQLite WASM
```

### 2. 离线优先同步协议：Operation Log + 增量推送

离线优先的底层不是「本地写 + 后台上传」，而是**操作日志（Operation Log）+ 向量时钟 + 增量同步协议**。

```
离线优先同步协议：

  核心模型：Operation Log（操作日志）
    ├── 每次写操作生成一条不可变记录：
    │   { opId, entityId, operation, payload, timestamp, deviceId }
    ├── 本地写入 = 追加操作日志 + 应用操作到本地状态
    ├── 同步 = 将本地操作日志推送到服务端
    └── 操作日志是事实来源（Source of Truth），不是当前状态

  增量同步算法：
    1. 客户端记录 lastSyncVector（上次同步的逻辑时钟）
    2. 同步时发送 lastSyncVector → 服务端返回此后的所有变更
    3. 客户端推送本地未同步的操作（opId > lastSyncVector）
    4. 服务端合并后返回新的 lastSyncVector

  冲突检测机制：
    ├── 服务端检测到同一 entityId 被多端修改 → 标记冲突
    ├── 冲突解决策略：
    │   ├── LWW（Last Write Wins）：比较 timestamp，最新者胜
    │   ├── Server Wins：服务端版本覆盖客户端
    │   ├── Field-level Merge：不同字段各自保留
    │   ├── CRDT：数据结构层面保证无冲突（见下节）
    │   └── 用户决策：弹出冲突 UI 让用户选择
    └── 冲突解决后生成新的操作记录，继续同步

  网络恢复策略：
    ├── online 事件触发 → 立即开始同步
    ├── 后台同步（Background Sync API）：
    │   ├── Service Worker 注册同步任务
    │   ├── 浏览器在网络恢复时自动触发
    │   └── 即使应用未打开也能完成同步
    └── 指数退避重试：失败后等待 1s → 2s → 4s → 8s → ...
```

### 3. 三级缓存的失效与一致性协议

缓存分层的底层不是「if/else 查三个地方」，而是**缓存失效策略 + 后台静默刷新 + 最终一致性保证**。

```
三级缓存协议（Memory → IndexedDB → Network）：

  读取路径（Cache-Aside 模式）：
    1. 查 Memory Cache（LRU，O(1) 命中）
       ├── 命中且未过期 → 直接返回（0ms）
       └── 未命中或过期 → 进入下一步
    2. 查 IndexedDB（本地持久化，~1-5ms）
       ├── 命中 → 回填 Memory Cache + 返回
       │   └── 同时触发后台静默刷新（Stale-While-Revalidate）
       └── 未命中 → 进入下一步
    3. 查 Network（远程 API，~50-200ms）
       ├── 成功 → 回填 IndexedDB + Memory Cache + 返回
       └── 失败（离线）→ 返回 null 或上次缓存值

  写入路径（Write-Through）：
    1. 写入 Memory Cache（同步，立即生效）
    2. 写入 IndexedDB（异步，持久化）
    3. 写入 Network（异步，同步到服务端）
    └── 如果离线 → 写入 Operation Log，等待网络恢复

  缓存失效策略：
    ├── TTL（Time-To-Live）：
    │   ├── 每个缓存条目有过期时间
    │   ├── 过期后不立即删除，而是标记为 stale
    │   └── stale 数据可以返回（降级体验）+ 后台刷新
    ├── LRU（Least Recently Used）：
    │   ├── 控制 Memory Cache 的条目上限
    │   ├── 超出上限时淘汰最久未访问的条目
    │   └── 实现：Map + 双向链表（O(1) 淘汰）
    └── 版本号驱动失效：
        ├── 服务端返回数据时附带 version 字段
        ├── 客户端比对 version → 不同则刷新
        └── WebSocket 推送 version 变更 → 主动失效

  Stale-While-Revalidate 的价值：
    ├── 用户看到的是本地缓存（毫秒级响应）
    ├── 后台静默获取最新数据（不阻塞 UI）
    ├── 下次访问时数据已是最新
    └── 权衡：用户可能看到短暂的过期数据
```

### 4. CRDT 的无冲突合并算法

CRDT 的底层不是「自动合并」，而是**数据结构的数学性质保证任意顺序合并结果一致**。

```
CRDT（Conflict-free Replicated Data Type）：

  核心数学性质：
    ├── 交换律：merge(A, B) = merge(B, A)
    ├── 结合律：merge(A, merge(B, C)) = merge(merge(A, B), C)
    └── 幂等律：merge(A, A) = A
    ↑ 满足这三条 → 无需冲突解决，任意顺序合并结果一致

  常见 CRDT 数据类型：
    ├── G-Counter（只增计数器）：
    │   ├── 每个设备维护自己的计数
    │   └── 合并 = 取各设备的最大值之和
    ├── LWW-Register（最后写入寄存器）：
    │   ├── 每次写入附带时间戳
    │   └── 合并 = 保留时间戳最大的值
    ├── RGA 序列（可增删的有序列表）：
    │   ├── 每个元素有唯一 ID + 前驱引用
    │   ├── 插入 = 在前驱之后插入新节点
    │   ├── 删除 = 标记为 tombstone（不物理删除）
    │   └── 合并 = 按 ID 拓扑排序重建序列
    └── Yjs 的 YXmlFragment / YText：
        ├── 基于 RGA 变体（相对位置算法）
        ├── 性能优化：VarInt 压缩 + 增量 State Vector
        └── 2026 年最成熟的浏览器端 CRDT 实现

  CRDT vs OT（Operational Transformation）：
    ├── CRDT：数据结构层面保证一致性（去中心化）
    │   ├── 优势：无需中央服务器，适合 P2P
    │   └── 劣势：数据结构设计复杂，内存开销大（tombstone）
    ├── OT：算法层面转换操作（需要中央服务器）
    │   ├── 优势：内存效率高，适合文档编辑
    │   └── 劣势：需要中央服务器协调，算法实现复杂
    └── 2026 年趋势：CRDT 在浏览器端更受欢迎（Yjs/Automerge）
```

---

## 高频面试题

### Q1: 离线优先架构的核心挑战？

**参考答案要点**：

- 数据同步：离线操作需要在恢复网络后同步
- 冲突解决：多设备同时修改同一数据
- 用户体验：明确标识离线状态和同步进度
- 数据一致性：保证最终一致性
- 存储限制：不同浏览器存储配额不同

### Q2: IndexedDB 和 SQLite WASM 如何选择？

**参考答案要点**：

- IndexedDB：原生 API、无额外依赖、适合简单结构化数据
- SQLite WASM：完整 SQL 能力、适合复杂查询和关系数据
- 选择依据：查询复杂度、数据关系、团队 SQL 经验
- 趋势：2026 年 SQLite WASM（如 wa-sqlite）越来越成熟

### Q3: 如何设计客户端缓存的失效策略？

**参考答案要点**：

- TTL（时间过期）：简单但可能返回过期数据
- LRU（最近最少使用）：控制内存占用
- 版本号：服务端返回数据版本，客户端比对
- 事件驱动：服务端推送数据变更通知
- 实际方案：TTL + LRU + 后台静默刷新（Stale-While-Revalidate）

---

## 延伸思考

1. **设计题**：设计一个支持离线使用的笔记应用数据架构。
2. **场景题**：多用户同时编辑同一文档，如何保证数据一致性？
3. **对比题**：CRDT vs OT 在浏览器端实现的 trade-off？

---

## 参考资料

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md)
- [Offline-First](https://offlinefirst.org)
- [CRDT](https://crdt.tech)
