---
title: Flutter 本地存储选型
tags: ['Flutter', '本地存储']
---

# Flutter 本地存储选型（2026）

> 按数据复杂度和性能需求选择：shared_preferences（轻量键值）→ Hive/Isar（NoSQL）→ Drift（关系型）。

---

## 一、主流方案对比

| 维度 | shared_preferences | Hive | Isar 4.0 | Drift | sqflite |
|------|-------------------|------|----------|-------|---------|
| **类型** | 键值对 | NoSQL | NoSQL | SQLite ORM | SQLite |
| **纯 Dart** | ✅ | ✅ | ❌（Native） | ✅ | ❌（Native） |
| **性能** | 中 | 高 | 极高 | 中 | 中 |
| **关系查询** | ❌ | ❌ | 部分 | ✅ | ✅ |
| **类型安全** | ❌ | ✅（Adapter） | ✅ | ✅（代码生成） | ❌ |
| **加密** | ❌ | ✅ | ✅ | ✅（SQLCipher） | ✅ |
| **Web 支持** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **包体积** | 极小 | 小 | 中（Native） | 小 | 中（Native） |
| **学习曲线** | 极低 | 低 | 中 | 中高 | 中 |
| **月下载量** | 200 万+ | 80 万+ | 30 万+ | 40 万+ | 100 万+ |

---

## 二、shared_preferences（轻量键值）

### 定位

Flutter 官方维护的轻量键值存储，**适合存 Token、主题、语言等简单配置**。

### 核心 API

```dart
final prefs = await SharedPreferences.getInstance();

// 写入
await prefs.setString('token', 'abc123');
await prefs.setInt('launchCount', 1);
await prefs.setBool('isDarkMode', true);
await prefs.setStringList('tags', ['flutter', 'dart']);

// 读取
final token = prefs.getString('token');
final isDark = prefs.getBool('isDarkMode') ?? false;

// 删除
await prefs.remove('token');
await prefs.clear();
```

### 适用场景

- ✅ Token / RefreshToken 存储
- ✅ 用户偏好设置（主题/语言/字体大小）
- ✅ 首次启动标记
- ✅ 简单计数器
- ❌ 大量数据（> 100 条）
- ❌ 复杂对象存储
- ❌ 需要查询/排序

### 注意事项

```dart
// ❌ 不要存大 JSON
await prefs.setString('userList', jsonEncode(hugeList));  // 性能差

// ✅ 大对象用 Hive/Isar
final box = await Hive.openBox<User>('users');
await box.put('user1', user);
```

---

## 三、Hive（轻量 NoSQL）

### 核心优势

1. **纯 Dart** — 零 Native 依赖，全平台支持（含 Web）
2. **高性能** — 读写速度极快，适合大量键值数据
3. **类型安全** — TypeAdapter 支持自定义对象
4. **加密** — HiveAesCipher 支持 AES-256 加密
5. **轻量** — 包体积小，API 简洁

### 核心 API

```dart
// 1. 注册 Adapter（自定义对象）
@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final String name;
  @HiveField(2)
  final String email;

  User({required this.id, required this.name, required this.email});
}

// 运行 build_runner 生成 user.g.dart

// 2. 打开 Box
final userBox = await Hive.openBox<User>('users');

// 3. CRUD
await userBox.put('user1', User(id: '1', name: 'John', email: 'john@example.com'));
final user = userBox.get('user1');
await userBox.delete('user1');

// 4. 查询
final allUsers = userBox.values.toList();
final filtered = userBox.values.where((u) => u.name.contains('John')).toList();

// 5. 监听变化（响应式）
userBox.watch(key: 'user1').listen((event) {
  print('User changed: ${event.value}');
});

// 6. 加密 Box
final encryptionKey = Hive.generateSecureKey();
final secureBox = await Hive.openBox<User>(
  'secure_users',
  encryptionCipher: HiveAesCipher(encryptionKey),
);
```

### 适用场景

- ✅ 业务数据缓存（列表/详情/搜索历史）
- ✅ 离线数据持久化
- ✅ 大量键值数据（> 100 条）
- ✅ 需要响应式监听
- ❌ 复杂关系查询（用 Drift）
- ❌ 需要 SQL 能力

### Hive vs Isar

| 维度 | Hive | Isar 4.0 |
|------|------|----------|
| 纯 Dart | ✅ | ❌（Native） |
| 性能 | 高 | 极高（2-3x） |
| 关系查询 | ❌ | 部分（Link） |
| 全文搜索 | ❌ | ✅ |
| 包体积 | 小 | 中 |
| Web 支持 | ✅ | ✅ |
| 成熟度 | 高（2019） | 中（2022） |

**2026 年现状**：
- Hive 社区版（hive_ce）持续维护，稳定可靠
- Isar 4.0 性能更强，但引入 Native 依赖，包体积增大
- **轻量场景选 Hive，高性能场景选 Isar**

---

## 四、Isar 4.0（高性能 NoSQL）

### 核心优势

1. **极致性能** — 比 Hive 快 2-3 倍，支持百万级数据
2. **全文搜索** — 内置 FTS 引擎
3. **关系查询** — Link 支持一对多/多对多
4. **类型安全** — 代码生成，编译时检查
5. **ACID 事务** — 原子性操作

### 核心 API

```dart
// 1. 定义 Schema
@collection
class User {
  Id id = Isar.autoIncrement;
  @Index(type: IndexType.value)
  late String email;
  late String name;
  late int age;

  @Backlink(to: 'posts')
  final posts = IsarLinks<Post>();
}

@collection
class Post {
  Id id = Isar.autoIncrement;
  late String title;
  @Index(type: IndexType.words)  // 全文搜索
  late String content;

  final author = IsarLink<User>();
}

// 2. 打开数据库
final isar = await Isar.open([UserSchema, PostSchema], name: 'myApp');

// 3. CRUD
await isar.writeTxn(() async {
  await isar.users.put(User()..name = 'John'..email = 'john@example.com');
});

final user = await isar.users.filter().emailEqualTo('john@example.com').findFirst();

// 4. 查询（类型安全）
final adults = await isar.users
    .filter()
    .ageGreaterThanOrEqualTo(18)
    .sortByDesc(age)
    .findAll();

// 5. 全文搜索
final posts = await isar.posts
    .search()
    .contentMatches('flutter isar')
    .findAll();

// 6. 关系查询
final userWithPosts = await isar.users
    .filter()
    .emailEqualTo('john@example.com')
    .loadPosts()  // 自动加载关联数据
    .findFirst();
```

### 适用场景

- ✅ 大量数据（> 1 万条）
- ✅ 需要全文搜索
- ✅ 需要关系查询
- ✅ 高性能要求
- ❌ 简单键值存储（杀鸡用牛刀）
- ❌ 对包体积极度敏感

---

## 五、Drift（类型安全 SQLite）

### 核心优势

1. **类型安全 SQL** — 代码生成，编译时检查查询
2. **关系查询** — 完整 SQL 能力（JOIN/子查询/聚合）
3. **响应式** — Stream 自动推送数据变化
4. **纯 Dart** — 无 Native 依赖（Web 用 sql.js）
5. **迁移管理** — 版本化 Schema 迁移

### 核心 API

```dart
// 1. 定义表
part 'database.g.dart';

class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get email => text().unique()();
  IntColumn get age => integer().nullable()();
}

class Posts extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get title => text()();
  TextColumn get content => text()();
  IntColumn get authorId => integer().references(Users, #id)();
}

// 2. 定义数据库
@DriftDatabase(tables: [Users, Posts])
class MyDatabase extends _$MyDatabase {
  MyDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // 查询
  Future<List<User>> getUsers() => select(users).get();

  // 带 JOIN 的查询
  Future<List<PostWithAuthor>> getPostsWithAuthor() {
    final query = select(posts).join([
      innerJoin(users, users.id.equalsExp(posts.authorId)),
    ]);
    return query.map((row) => PostWithAuthor(
      post: row.readTable(posts),
      author: row.readTable(users),
    )).get();
  }

  // 插入
  Future<int> insertUser(UsersCompanion user) => into(users).insert(user);

  // 更新
  Future<bool> updateUser(User user) => update(users).replace(user);

  // 删除
  Future<int> deleteUser(int id) => (delete(users)..where((u) => u.id.equals(id))).go();

  // 响应式查询（Stream）
  Stream<List<User>> watchUsers() => select(users).watch();
}

// 3. 使用
final db = MyDatabase();
final allUsers = await db.getUsers();
db.watchUsers().listen((users) {
  // 数据变化时自动触发
});
```

### 适用场景

- ✅ 需要复杂关系查询（JOIN/子查询）
- ✅ 数据量大且结构复杂
- ✅ 需要 SQL 能力
- ✅ 需要数据迁移管理
- ❌ 简单键值存储
- ❌ 不需要关系查询

---

## 六、选型决策

```
存什么数据？
├─ Token/设置/简单配置 → shared_preferences
├─ 业务缓存（列表/详情/搜索历史）
│   ├─ 数据量 < 1 万条 → Hive
│   └─ 数据量 > 1 万条 / 需要全文搜索 → Isar
└─ 结构化数据（订单/消息/复杂关系）
    ├─ 需要 SQL 查询 → Drift
    └─ 简单 CRUD → Hive / Isar
```

### 推荐组合

| 项目规模 | 推荐方案 |
|---------|---------|
| 小型 | shared_preferences |
| 中型 | shared_preferences + Hive |
| 大型 | shared_preferences + Hive/Isar + Drift |

### 常见搭配

```dart
// Token 存储 → shared_preferences
final prefs = await SharedPreferences.getInstance();
await prefs.setString('access_token', token);

// 用户缓存 → Hive
final userBox = await Hive.openBox<User>('users');
await userBox.put(userId, user);

// 订单数据 → Drift（需要关系查询）
final orders = await db.select(db.orders)
    .join([innerJoin(db.users, db.users.id.equalsExp(db.orders.userId))])
    .get();
```

---

## 七、迁移成本

| 迁移路径 | 成本 | 说明 |
|---------|------|------|
| shared_preferences → Hive | 低 | API 相似，数据迁移脚本 |
| Hive → Isar | 低 | Schema 定义相似，数据导出/导入 |
| sqflite → Drift | 中 | SQL 可复用，需加代码生成层 |
| Hive → Drift | 高 | 数据模型重构，NoSQL → SQL |

---

## 参考资源

- [shared_preferences 官方文档](https://pub.dev/packages/shared_preferences)
- [Hive 官方文档](https://docs.hivedb.dev/)
- [Isar 官方文档](https://isar.dev/)
- [Drift 官方文档](https://drift.simonbinder.eu/)
- [sqflite 官方文档](https://pub.dev/packages/sqflite)
