---
title: "客户端数据架构 [P8]"
level: "architect"
tags: ["离线优先", "IndexedDB", "SQLite WASM", "缓存分层", "数据同步"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
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

| 方案 | 容量 | 查询 | 事务 | 适用场景 |
|------|------|------|------|----------|
| **localStorage** | 5MB | 无 | 无 | 简单键值 |
| **IndexedDB** | 大容量 | 索引查询 | 支持 | 结构化数据 |
| **SQLite WASM** | 大容量 | SQL | 完整 | 复杂查询 |
| **OPFS** | 大容量 | 文件级 | 无 | 大文件 |

---

## 底层原理（Why）

### 1. Repository 模式封装存储

```typescript
// 抽象 Repository 接口
interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
  query(filter: Partial<T>): Promise<T[]>;
}

// IndexedDB 实现
class IndexedDBRepository<T extends { id: string }> implements Repository<T> {
  private dbName: string;
  private storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(item: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const request = tx.objectStore(this.storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 2. 离线优先同步策略

```typescript
// 离线优先架构
class SyncManager {
  private pendingOps: SyncOperation[] = [];
  private lastSyncTime: number = 0;

  // 写操作先写本地，再同步
  async write<T>(item: T, type: 'create' | 'update' | 'delete') {
    // 1. 写入本地数据库
    await this.localRepo.save(item);

    // 2. 记录同步操作
    const op: SyncOperation = {
      id: crypto.randomUUID(),
      type,
      data: item,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.pendingOps.push(op);

    // 3. 尝试同步（如果在线）
    if (navigator.onLine) {
      await this.sync();
    }
  }

  // 增量同步
  async sync() {
    if (!navigator.onLine || this.pendingOps.length === 0) return;

    for (const op of this.pendingOps) {
      try {
        await this.sendToServer(op);
        op.status = 'synced';
      } catch (error) {
        if (error.status === 409) {
          // 冲突解决
          await this.resolveConflict(op, error.serverData);
        } else {
          op.retryCount++;
          // 指数退避重试
        }
      }
    }

    // 清理已同步的操作
    this.pendingOps = this.pendingOps.filter(op => op.status !== 'synced');
  }
}
```

### 3. 缓存分层策略

```typescript
// 三级缓存：Memory → IndexedDB → Network
class CachedRepository<T extends { id: string }> {
  private memoryCache = new LRUCache<string, T>({ max: 100, ttl: 60_000 });

  async getById(id: string): Promise<T | null> {
    // L1: Memory Cache
    const cached = this.memoryCache.get(id);
    if (cached) return cached;

    // L2: IndexedDB
    const local = await this.localRepo.getById(id);
    if (local) {
      this.memoryCache.set(id, local);
      // 后台静默更新
      this.refreshFromServer(id);
      return local;
    }

    // L3: Network
    return this.refreshFromServer(id);
  }

  private async refreshFromServer(id: string): Promise<T | null> {
    try {
      const data = await fetch(`/api/items/${id}`).then(r => r.json());
      if (data) {
        await this.localRepo.save(data);
        this.memoryCache.set(id, data);
      }
      return data;
    } catch {
      return null; // 离线时返回 null
    }
  }
}
```

### 4. 冲突解决策略

```
冲突解决策略：
├── Last Write Wins（LWW）：以时间戳最新的为准
├── Server Wins：服务端数据优先
├── Client Wins：客户端数据优先
├── Merge：字段级别合并
├── CRDT：无冲突复制数据类型（协作场景）
└── 用户决策：弹出冲突解决 UI

选择依据：
├── 单用户多设备 → LWW 足够
├── 多用户协作 → CRDT 或 OT
└── 业务强约束 → 用户决策
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
- 实际方案：TTL + LRU + 后台静默刷新

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
