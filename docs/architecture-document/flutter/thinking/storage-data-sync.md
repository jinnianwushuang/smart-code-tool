# 移动端存储与数据同步

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 移动端存储的核心命题不是"怎么存"，而是"在离线、弱网、多端并发的现实下，如何保证数据最终一致且用户体验流畅"。离线优先（Offline-First）是移动架构区别于 Web 架构的分水岭。

---

## 📑 目录

- [一、移动端存储技术选型](#一移动端存储技术选型)
- [二、SQLite 原理与实践](#二sqlite-原理与实践)
- [三、KV 存储：从 SharedPreferences 到 MMKV](#三kv-存储从-sharedpreferences-到-mmkv)
- [四、文件存储与沙箱](#四文件存储与沙箱)
- [五、离线优先架构](#五离线优先架构)
- [六、数据同步策略](#六数据同步策略)
- [七、冲突解决](#七冲突解决)
- [八、缓存架构](#八缓存架构)
- [九、数据迁移与版本管理](#九数据迁移与版本管理)
- [十、存储性能与安全](#十存储性能与安全)

---

## 一、移动端存储技术选型

### 1.1 存储需求分类

```
① 配置/小量 KV 数据
   Token、用户偏好、功能开关
   → SharedPreferences / MMKV / flutter_secure_storage

② 结构化业务数据
   订单、消息、联系人（需查询/事务）
   → SQLite (sqflite/drift) / Isar / Hive

③ 文档/非结构化数据
   JSON 文档、日志
   → 文件系统 / Sembast / Hive

④ 大文件
   图片、视频、下载文件
   → 文件系统 + 元数据索引

⑤ 敏感数据
   密钥、生物特征、凭证
   → Keystore/Keychain（flutter_secure_storage）
```

### 1.2 主流方案对比

| 方案 | 类型 | 查询能力 | 事务 | 性能 | 适用 |
| ---- | ---- | -------- | ---- | ---- | ---- |
| SharedPreferences | KV | 无 | 无 | 中 | 极小配置 |
| MMKV | KV | 无 | 无 | 极高 | 高频读写 KV |
| Hive | 嵌入式 KV | 弱 | 支持 | 高 | 轻量文档 |
| Isar | 嵌入式 DB | 强（索引） | 支持 | 极高 | 高性能结构化 |
| sqflite | SQLite 封装 | SQL | 支持 | 中 | 通用 SQL 场景 |
| drift | SQLite ORM | 强（类型安全） | 支持 | 中 | 复杂数据模型 |
| Sembast | 文档 DB | 中 | 支持 | 中 | NoSQL 文档 |
| Realm | 对象 DB | 强 | 支持 | 高 | 跨平台对象存储 |

### 1.3 选型决策树

```
需要 SQL/复杂关联查询？
├── 是 → drift（类型安全 ORM，推荐）/ sqflite
└── 否 → 数据量级？
    ├── <100 条简单配置 → SharedPreferences / MMKV
    ├── 中等文档数据 → Hive / Isar
    └── 高性能结构化 → Isar

需要加密？
├── 敏感凭证 → flutter_secure_storage（硬件级）
└── 业务数据加密 → SQLCipher (sqflite) / Hive 加密

需要跨设备同步？
└── 见第六节同步策略（本地存储 + 同步层分离设计）
```

---

## 二、SQLite 原理与实践

### 2.1 SQLite 在移动端的地位

```
为什么 SQLite 是移动端事实标准：
├── 系统内置（Android/iOS 均预装，零依赖）
├── 单文件数据库（便于备份/迁移）
├── ACID 事务（崩溃不丢数据）
├── 性能优异（本地 I/O，微秒级查询）
└── Flutter 通过 sqflite 插件桥接平台 SQLite

架构位置：
Dart 业务代码
    ↓
drift / sqflite（Dart 层）
    ↓ Platform Channel
平台 SQLite（C 库）
    ↓
文件系统（.db 文件）
```

### 2.2 SQLite 存储引擎

```
数据库文件结构：
┌─────────────────────────────┐
│ Page 1: 数据库头 + Schema     │
│ Page 2: B-Tree (表数据)       │  ← 默认页大小 4KB
│ Page 3: B-Tree (索引)         │
│ ...                          │
└─────────────────────────────┘

B-Tree 索引原理：
- 表数据按 rowid 组织为 B+Tree
- 索引为独立 B+Tree（叶子存 rowid 指针）
- 查询 O(log n)，范围扫描顺序读

WAL 模式（Write-Ahead Logging）：
- 默认 rollback journal：写时复制原页 → 阻塞读
- WAL：写入追加到 -wal 文件 → 读写并发
- 移动端强烈推荐开启 WAL：
  db.rawQuery('PRAGMA journal_mode=WAL');
```

### 2.3 drift 类型安全 ORM

```dart
// drift：编译期生成类型安全查询代码
import 'package:drift/drift.dart';

// 表定义
class Orders extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get orderNo => text().unique()();
  IntColumn get userId => integer()();
  RealColumn get amount => real()();
  IntColumn get status => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
}

@DriftDatabase(tables: [Orders])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

// 类型安全查询（编译期检查）
Future<List<Order>> userOrders(int userId) {
  return (select(db.orders)
    ..where((o) => o.userId.equals(userId))
    ..orderBy([(o) => OrderingTerm.desc(o.createdAt)])
    ..limit(20)
  ).get();
}

// 响应式查询（数据变化自动通知 UI）
Stream<List<Order>> watchOrders() {
  return (select(db.orders)
    ..where((o) => o.status.equals(1))
  ).watch();  // → 配合 StreamBuilder/Riverpod
}
```

### 2.4 SQLite 性能优化

```dart
// 1. 批量写入用事务（性能差异 10-100 倍）
// ❌ 逐条插入（每条独立事务 + fsync）
for (final item in items) {
  await db.into(db.orders).insert(item);
}
// ✅ 批量事务
await db.transaction(() async {
  for (final item in items) {
    await db.into(db.orders).insert(item);
  }
});

// 2. 索引设计
// WHERE/ORDER BY/JOIN 字段建索引
// 复合索引遵循最左前缀原则
// 避免过度索引（写放大）

// 3. 分页查询（避免全量加载）
..limit(20)..offset(page * 20)

// 4. 后台 Isolate 执行重查询
// drift 支持 background isolate，避免阻塞 UI

// 5. PRAGMA 调优
PRAGMA journal_mode=WAL;        // 读写并发
PRAGMA synchronous=NORMAL;      // WAL 下安全且快
PRAGMA cache_size=-8000;        // 8MB 页缓存
PRAGMA temp_store=MEMORY;       // 临时表内存化
```

---

## 三、KV 存储：从 SharedPreferences 到 MMKV

### 3.1 SharedPreferences 的问题

```
Android 实现：XML 文件全量读写
┌─────────────────────────────────────┐
│ 写入流程：                             │
│ ① 内存 Map 修改                        │
│ ② apply() 异步全量序列化整个 Map 到 XML  │
│                                      │
│ 问题：                                │
│ - 全量写入：改 1 个 key 重写整个文件      │
│ - 主线程风险：commit() 同步阻塞          │
│ - 无加密、无多进程安全                   │
│ - 大 value 性能灾难                    │
└─────────────────────────────────────┘

iOS 实现：NSUserDefaults（plist）
- 系统级缓存，相对高效
- 但同样全量持久化，不适合大数据
```

### 3.2 MMKV 原理

```
MMKV（腾讯开源）核心设计：
┌─────────────────────────────────────┐
│ ① mmap 内存映射                       │
│    文件映射到进程内存                    │
│    写入 = 写内存（OS 异步刷盘）          │
│    → 写入性能 ~10MB/s（SP 的 100 倍）   │
│                                      │
│ ② Protocol Buffers 增量编码            │
│    仅追加变更的 KV（append-only）        │
│    定期整理压缩（compaction）            │
│    → 避免全量重写                      │
│                                      │
│ ③ 多进程安全（CRC 校验 + 文件锁）        │
│                                      │
│ ④ 可选 AES 加密                        │
└─────────────────────────────────────┘

Flutter 使用（mmkv 插件）：
final kv = MMKV.defaultMMKV();
kv.encodeString('token', 'xxx');
final token = kv.decodeString('token');
kv.encodeBool('dark_mode', true);
```

### 3.3 KV 存储使用规范

```
适合 KV 存储：
✅ 配置项（<1KB 的标量值）
✅ 状态标记（首次启动/版本标记）
✅ 高频小数据读写（计数/开关）

不适合 KV 存储：
❌ 大 JSON（>100KB，应存文件或 DB）
❌ 需要查询的数据（无索引能力）
❌ 敏感数据（用 secure storage）
❌ 无限增长的列表（日志/消息 → DB）
```

---

## 四、文件存储与沙箱

### 4.1 双平台沙箱目录

```
Android 应用目录：
/data/data/<package>/
├── files/          # 内部文件（私有，卸载清除）
├── cache/          # 缓存（系统可清理，无保证）
├── shared_prefs/   # SharedPreferences XML
└── databases/      # SQLite 文件
/storage/emulated/0/Android/data/<package>/
└── files/          # 外部私有目录（卸载清除）

iOS 应用沙箱：
Documents/    # 用户数据（iCloud 备份，用户可见）
Library/
├── Caches/   # 缓存（不备份，系统可清理）
└── Preferences/  # NSUserDefaults
tmp/          # 临时文件（随时可清理）

Flutter 获取路径（path_provider）：
final docs = await getApplicationDocumentsDirectory();
final cache = await getTemporaryDirectory();
final support = await getApplicationSupportDirectory();
```

### 4.2 目录选择策略

```
数据类型          目录选择              备份策略
──────────────────────────────────────────────
用户核心数据      Documents (iOS)      备份
                 files (Android)
可重建缓存        Caches/tmp           不备份
                 cache (Android)
下载的大文件      外部存储/Cache         不备份
配置             KV 存储               视情况

iOS 审核注意：
- Documents 会被 iCloud 备份 → 大文件放 Caches
- 不备份目录需标记排除（URLResourceValues）
- 缓存过大可能被系统清理 → 核心数据勿放 Cache
```

### 4.3 文件操作最佳实践

```dart
// 1. 大文件读写用流（避免全量加载到内存）
// ❌ 全量读取 500MB 视频 → OOM
final bytes = await File(videoPath).readAsBytes();
// ✅ 流式处理
final stream = File(videoPath).openRead();
await stream.pipe(outputSink);

// 2. 原子写入（防写一半崩溃导致损坏）
Future<void> atomicWrite(File file, String content) async {
  final tmp = File('${file.path}.tmp');
  await tmp.writeAsString(content);
  await tmp.rename(file.path);  // rename 是原子操作
}

// 3. 文件 I/O 放 Isolate（避免阻塞 UI）
final result = await Isolate.run(() => parseLargeJson(file));

// 4. 及时清理缓存
// 监听存储空间不足事件，主动清理 Cache 目录
```

---

## 五、离线优先架构

### 5.1 离线优先的设计哲学

```
传统在线优先（Online-First）：
UI ← API 响应 ← 网络
问题：弱网/断网 = 功能不可用，加载转圈

离线优先（Offline-First）：
UI ← 本地数据库（永远有数据，即时响应）
        ↕ 同步层（后台异步）
      远程服务器

核心原则：
① 本地是唯一数据源（UI 只读本地）
② 网络是同步通道（不是数据源）
③ 写操作先落本地，后台同步
④ 用户永远感知不到"网络请求"
```

### 5.2 离线优先架构分层

```
┌─────────────────────────────────────┐
│ UI 层                                │
│ 监听本地数据流（Stream/Riverpod）      │
├─────────────────────────────────────┤
│ Repository 层                        │
│ 读：本地优先 + 后台刷新                 │
│ 写：本地落库 + 入同步队列               │
├──────────────┬──────────────────────┤
│ 本地存储       │ 同步引擎               │
│ (drift/Isar) │ (变更追踪+重试+冲突解决) │
├──────────────┴──────────────────────┤
│ 网络层（API Client）                  │
└─────────────────────────────────────┘
```

### 5.3 Repository 读写模式

```dart
class OrderRepository {
  final OrderDao _dao;        // 本地存储
  final OrderApi _api;        // 远程 API
  final SyncQueue _syncQueue; // 同步队列

  // 读：本地优先
  Stream<List<Order>> watchOrders() {
    // 1. 立即返回本地数据（UI 即时渲染）
    final localStream = _dao.watchAll();

    // 2. 后台静默刷新（有网时）
    _refreshInBackground();

    return localStream;
  }

  Future<void> _refreshInBackground() async {
    if (!await hasConnectivity()) return;
    try {
      final remote = await _api.fetchOrders(
        since: await _dao.lastSyncTime(),
      );
      await _dao.upsertAll(remote);  // 更新本地
      await _dao.setLastSyncTime(DateTime.now());
    } catch (_) {
      // 静默失败，本地数据仍可用
    }
  }

  // 写：本地优先 + 异步同步
  Future<void> createOrder(Order order) async {
    // 1. 立即写入本地（标记 pending 状态）
    await _dao.insert(order.copyWith(syncStatus: SyncStatus.pending));
    // 2. 加入同步队列（后台执行，失败重试）
    await _syncQueue.enqueue(SyncOperation(
      type: OperationType.create,
      entity: 'order',
      payload: order.toJson(),
    ));
    // UI 立即反馈成功（乐观更新）
  }
}
```

### 5.4 乐观更新与状态标记

```dart
// 每条数据携带同步状态
class Order {
  final String id;
  final SyncStatus syncStatus;  // pending/synced/conflict/error
  final DateTime updatedAt;
  final int version;
}

enum SyncStatus {
  pending,   // 本地已写，待同步
  syncing,   // 同步中
  synced,    // 已同步
  conflict,  // 冲突待解决
  error,     // 同步失败（业务错误）
}

// UI 展示同步状态（ subtle 的视觉提示）
ListTile(
  title: Text(order.title),
  trailing: switch (order.syncStatus) {
    SyncStatus.pending || SyncStatus.syncing => Icon(Icons.sync, size: 16),
    SyncStatus.conflict => Icon(Icons.warning_amber, size: 16),
    SyncStatus.error => Icon(Icons.error_outline, size: 16),
    _ => null,  // synced 不显示
  },
)
```

---

## 六、数据同步策略

### 6.1 同步模式对比

| 模式 | 机制 | 实时性 | 复杂度 | 适用 |
| ---- | ---- | ------ | ------ | ---- |
| 轮询 | 定时拉取 | 低 | 低 | 低频数据 |
| 增量拉取 | since 时间戳/游标 | 中 | 中 | 通用列表 |
| 推送触发 | FCM/APNs 通知拉取 | 高 | 中 | 消息类 |
| WebSocket | 长连接双向 | 极高 | 高 | 协作/聊天 |
| 变更流 | CDC + 订阅 | 高 | 高 | 企业级同步 |

### 6.2 增量同步设计

```dart
// 基于时间戳 + 游标的增量同步
class IncrementalSync {
  Future<void> syncOrders() async {
    // 1. 读取上次同步点
    var cursor = await _store.getSyncCursor('orders');

    while (true) {
      // 2. 拉取增量（服务端按 updated_at 排序分页）
      final page = await _api.fetchOrders(
        since: cursor.timestamp,
        cursor: cursor.next,
        limit: 100,
      );

      // 3. 本地 upsert（按 id 去重）
      await _dao.upsertAll(page.items);

      // 4. 更新同步点
      cursor = page.nextCursor;
      await _store.saveSyncCursor('orders', cursor);

      if (!page.hasMore) break;
    }

    // 5. 处理删除（软删除同步）
    // 服务端返回 deleted_ids 或 tombstone 记录
  }
}

// 关键设计点：
// - 服务端 updated_at 需索引 + 时钟单调（避免漏同步）
// - 删除用软删除（tombstone），否则增量无法感知删除
// - 同步点持久化（断点续传）
```

### 6.3 同步队列与重试

```dart
// 写操作同步队列（持久化，App 重启不丢）
class SyncQueue {
  final SyncOperationDao _dao;

  Future<void> enqueue(SyncOperation op) async {
    await _dao.insert(op.copyWith(
      createdAt: DateTime.now(),
      retryCount: 0,
    ));
    _scheduleFlush();
  }

  Future<void> _flush() async {
    if (!await hasConnectivity()) return;

    // 按创建顺序处理（保证因果序）
    final ops = await _dao.pendingOrdered();
    for (final op in ops) {
      try {
        await _executeRemote(op);
        await _dao.delete(op.id);
      } on NetworkError {
        // 网络错误：指数退避重试
        await _dao.incrementRetry(op.id,
          nextRetryAt: _backoff(op.retryCount));
        if (op.retryCount > 10) await _markDead(op);  // 死信
        break;  // 网络故障，停止本轮
      } on BusinessError catch (e) {
        // 业务错误：标记冲突/失败，不重试
        await _dao.markError(op.id, e.message);
      }
    }
  }

  // 触发时机：入队时 / 网络恢复 / App 前台 / 定时器
}
```

### 6.4 多端同步与最后写入胜出

```
场景：用户在手机和平板同时修改同一订单

同步冲突时间线：
T1: 设备A 读取订单（version=3）
T2: 设备B 读取订单（version=3）
T3: 设备A 提交修改（version=4）✅
T4: 设备B 提交修改（基于 version=3）❌ 冲突！

服务端乐观锁：
PUT /orders/123
If-Match: 3          ← 携带读取时的版本
→ 409 Conflict（版本已过期）

客户端处理 409：
① 拉取最新版本
② 自动合并 or 提示用户选择
③ 重新提交
```

---

## 七、冲突解决

### 7.1 冲突解决策略谱系

```
① LWW（Last Write Wins，最后写入胜出）
   按时间戳取最新 → 简单但可能丢数据
   适用：单用户场景、非关键字段

② 字段级合并（Field-level Merge）
   不同字段分别取各自最新值
   适用：多字段对象，修改不重叠

③ CRDT（无冲突复制数据类型）
   数据结构设计保证任意顺序合并收敛
   适用：协作编辑、计数器、集合

④ 操作变换 OT（Operational Transformation）
   变换并发操作顺序使其收敛
   适用：文本协作编辑（Google Docs 模式）

⑤ 人工解决
   展示冲突双方版本，用户选择
   适用：关键业务数据
```

### 7.2 CRDT 计数器示例

```dart
// G-Counter（只增计数器，天然无冲突）
class GCounter {
  final Map<String, int> _counts;  // nodeId → count

  int get value => _counts.values.fold(0, (a, b) => a + b);

  void increment(String nodeId) {
    _counts[nodeId] = (_counts[nodeId] ?? 0) + 1;
  }

  // 合并：每个节点取 max → 任意顺序/重复合并结果一致
  GCounter merge(GCounter other) {
    final merged = Map<String, int>.from(_counts);
    other._counts.forEach((node, count) {
      merged[node] = max(merged[node] ?? 0, count);
    });
    return GCounter(merged);
  }
}

// 性质：交换律 + 结合律 + 幂等
// → 同步消息乱序/重复/丢失（重发）都不影响最终一致
```

### 7.3 实战冲突处理流程

```dart
Future<void> syncWithConflictHandling(SyncOperation op) async {
  try {
    await _api.push(op);
  } on ConflictException catch (e) {
    // 1. 拉取服务端最新版本
    final serverVersion = await _api.fetch(op.entityId);
    final localVersion = await _dao.get(op.entityId);

    // 2. 尝试自动合并（字段级）
    final merged = FieldMerger.merge(
      base: e.baseVersion,      // 共同祖先
      local: localVersion,
      remote: serverVersion,
    );

    if (merged.hasConflicts) {
      // 3. 无法自动合并 → 标记冲突，待用户处理
      await _dao.markConflict(op.entityId, localVersion, serverVersion);
    } else {
      // 4. 自动合并成功 → 提交合并结果
      await _api.push(merged.result);
      await _dao.upsert(merged.result);
    }
  }
}
```

---

## 八、缓存架构

### 8.1 缓存模式

```
① Cache-Aside（旁路缓存，最常用）
   读：缓存命中→返回；未命中→查源→写缓存
   写：更新源→失效缓存
   适用：通用读多写少场景

② Read-Through（读穿透）
   缓存层自动从源加载（对调用方透明）
   适用：Repository 封装

③ Write-Through（写穿透）
   写缓存同步写源（强一致）
   适用：写后立读场景

④ Write-Behind（写回）
   写缓存异步批量写源（高性能，有丢失风险）
   适用：埋点/日志等可容忍丢失场景
```

### 8.2 移动端缓存特殊性

```
与 Web/服务端缓存的差异：
├── 缓存即"本地数据库"（离线可用的数据源）
├── 无分布式一致性问题（单设备单用户）
├── 但有"服务端数据新鲜度"问题
└── 存储配额受限（iOS 缓存可能被系统清理）

移动端缓存失效策略：
① TTL 过期（时间维度）
② 版本戳失效（ETag/版本号）
③ 主动失效（写操作/推送通知）
④ 容量淘汰（LRU，空间维度）
```

### 8.3 Stale-While-Revalidate 模式

```dart
// 移动端最佳读取体验：先展示旧数据，后台刷新
Stream<Result<T>> staleWhileRevalidate<T>({
  required Future<T?> Function() readCache,
  required Future<T> Function() fetchRemote,
  required Future<void> Function(T) writeCache,
}) async* {
  // 1. 立即产出缓存（可能为 null）
  final cached = await readCache();
  if (cached != null) yield Result.data(cached, isStale: true);

  // 2. 后台拉取最新
  try {
    final fresh = await fetchRemote();
    await writeCache(fresh);
    yield Result.data(fresh, isStale: false);
  } catch (e) {
    if (cached == null) yield Result.error(e);  // 无缓存才报错
    // 有缓存 → 静默失败，用户无感
  }
}
```

---

## 九、数据迁移与版本管理

### 9.1 Schema 迁移

```dart
// drift 版本迁移
@override
int get schemaVersion => 3;

@override
MigrationStrategy get migration => MigrationStrategy(
  onCreate: (m) => m.createAll(),
  onUpgrade: (m, from, to) async {
    if (from < 2) {
      // v1 → v2：orders 表新增 discount 列
      await m.addColumn(orders, orders.discount);
    }
    if (from < 3) {
      // v2 → v3：新增索引 + 数据修复
      await m.createIndex(Index('idx_order_status', 'CREATE INDEX ...'));
      await customStatement('UPDATE orders SET status=0 WHERE status IS NULL');
    }
  },
);

// 迁移原则：
// 1. 只增不删（新增列/表安全，删除列需多版本过渡）
// 2. 新列必须有默认值（旧数据兼容）
// 3. 迁移脚本幂等（可重复执行）
// 4. 大表迁移分批（避免长时间锁表）
```

### 9.2 数据格式版本管理

```dart
// KV/文件存储的数据版本化
class VersionedStore<T> {
  static const _versionKey = 'data_version';

  Future<T?> load() async {
    final storedVersion = kv.decodeInt32(_versionKey) ?? 0;
    final raw = kv.decodeString(_dataKey);
    if (raw == null) return null;

    var data = jsonDecode(raw);
    // 逐版本迁移
    if (storedVersion < 2) data = _migrateV1toV2(data);
    if (storedVersion < 3) data = _migrateV2toV3(data);

    // 回写新版本
    kv.encodeInt32(_versionKey, currentVersion);
    return fromJson(data);
  }
}

// 破坏性变更兜底：
// 迁移失败 → 清空本地数据 + 全量重新同步
// （本地数据是缓存，服务端是权威 → 可安全丢弃）
```

---

## 十、存储性能与安全

### 10.1 存储性能基准

```
典型操作耗时参考（中端设备）：
┌──────────────────────────┬──────────────┐
│ 操作                      │ 耗时          │
├──────────────────────────┼──────────────┤
│ MMKV 写入                 │ ~0.01ms      │
│ SharedPreferences 写入    │ ~1-10ms      │
│ SQLite 单条插入（事务内）   │ ~0.1ms       │
│ SQLite 单条插入（独立事务） │ ~5-15ms (fsync) │
│ SQLite 万条批量插入        │ ~50-200ms    │
│ 1MB 文件读写              │ ~10-50ms     │
│ JSON 解析 1MB             │ ~20-80ms     │
└──────────────────────────┴──────────────┘

性能要点：
- 事务批量写 vs 逐条写：10-100 倍差距（fsync 开销）
- 主线程禁止大 I/O（Isolate 执行）
- 启动路径避免读大文件（延迟加载）
```

### 10.2 存储安全

```dart
// 1. 敏感数据加密存储
// SQLCipher（sqflite 加密扩展）：整库 AES-256
// Hive 加密 Box：value 级加密
final encryptionKey = await SecureKeyStore.getOrCreateKey();
final box = await Hive.openBox('secure',
  encryptionCipher: HiveAesCipher(encryptionKey));

// 2. 密钥管理
// 加密密钥存 Keystore/Keychain，数据存普通文件
// 密钥永不落普通存储

// 3. 防备份泄露（iOS）
// 敏感文件排除 iCloud 备份
// 评估：卸载重装后数据是否应该保留

// 4. 数据清理
// 退出登录 → 清空用户数据（防多账号串数据）
Future<void> clearUserData() async {
  await _db.deleteAll();
  await _kv.clear();
  await _fileCache.clear();
}
```

### 10.3 存储空间治理

```
空间监控：
- 定期检查应用数据目录大小
- 缓存超阈值自动清理（LRU 淘汰）
- 系统空间不足事件响应（Android onTrimMemory）

清理优先级（空间不足时）：
① 临时文件（tmp）
② 图片/媒体缓存
③ 过期业务缓存
④ 旧版本数据
⑤ （绝不清理）用户核心数据

用户可见的存储管理：
- 设置页展示缓存大小 + 一键清理
- 大文件下载前检查可用空间
```

---

## 📎 参考资源

- [drift (moor) 官方文档](https://drift.simonbinder.eu/)
- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [MMKV 原理介绍](https://github.com/Tencent/MMKV/wiki/design)
- [Offline First 设计模式](http://offlinefirst.org/)
