---
title: 'Flutter 本地存储与持久化 [P6-P7]'
level: 'senior'
tags: ['Flutter', '本地存储', 'SharedPreferences', 'Hive', 'SQLite', 'Isar']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# Flutter 本地存储与持久化 [P6-P7]

> Flutter 提供多种本地存储方案，从简单的键值对到完整的数据库。2026 年，Isar（NoSQL）和 drift（SQLite 类型安全）是最活跃的方案。

## 核心概念（What）

### 存储方案对比

| 方案                       | 类型           | 性能 | 适用场景   | 2026 状态 |
| -------------------------- | -------------- | ---- | ---------- | --------- |
| **SharedPreferences**      | 键值对         | 中   | 简单配置   | 仍主流    |
| **Hive**                   | NoSQL          | 高   | 中等数据量 | 维护模式  |
| **Isar**                   | NoSQL          | 极高 | 大数据量   | 活跃      |
| **SQLite (sqflite)**       | SQL            | 高   | 复杂查询   | 稳定      |
| **drift**                  | SQL (类型安全) | 高   | 复杂查询   | 活跃      |
| **flutter_secure_storage** | 加密存储       | 中   | 敏感数据   | 活跃      |

---

## 底层原理（Why）

### 1. SharedPreferences 底层：平台原生存储桥接

**核心问题**：SharedPreferences 底层是如何存储数据的？

```
底层存储引擎：

[SharedPreferences] ──► Platform Channel ──► 原生存储
        │
        ├─ iOS: NSUserDefaults（plist 文件）
        │   └─ 存储在 ~/Library/Preferences/ 目录
        │
        └─ Android: android.content.SharedPreferences
            └─ 存储在 /data/data/<package>/shared_prefs/ 目录

执行链路：
[prefs.setString('key', 'value')]
        ↓
[Dart 层] ──► MethodChannel('plugins.flutter.io/shared_preferences')
        ↓
[Platform Channel] ──► 异步调用原生方法
        ↓
[原生层]
        ├─ iOS: [[NSUserDefaults standardUserDefaults] setObject:value forKey:key]
        └─ Android: editor.putString(key, value).apply()
        ↓
[写入磁盘]（apply 是异步，commit 是同步）

关键限制：
├─ 只支持基本类型（String/int/double/bool/List<String>）
├─ 不支持复杂对象（需手动 JSON 序列化）
├─ 数据量限制（建议 < 1MB）
└─ 不支持监听变化（需结合 ValueNotifier）
```

### 2. Hive/Isar 底层：NoSQL 存储引擎对比

```
Hive 底层架构：

[Hive] ──► Box（类似表）
        │
        ├─ 纯 Dart 实现（无原生依赖）
        ├─ 数据存储在单个二进制文件中
        ├─ 使用 LazyBox 实现懒加载（首次访问时才反序列化）
        └─ TypeAdapter 负责序列化/反序列化

Isar 底层架构（Hive 继任者）：

[Isar] ──► Collection（类似表）
        │
        ├─ 基于 LMDB（Lightning Memory-Mapped Database）
        ├─ 内存映射文件（mmap）→ 零拷贝读取
        ├─ 支持索引（B+ 树）→ 快速查询
        ├─ 支持关系（Link/Backlink）
        └─ Codegen 生成类型安全的查询 API

性能对比：
┌──────────────┬──────────────┬──────────────┐
│              │   Hive       │    Isar      │
├──────────────┼──────────────┼──────────────┤
│ 读取速度     │ 快           │ 极快（mmap）  │
│ 写入速度     │ 快           │ 极快          │
│ 查询能力     │ 弱（全量扫描）│ 强（索引）    │
│ 关系支持     │ ❌           │ ✅            │
│ 跨平台       │ ✅           │ ✅            │
└──────────────┴──────────────┴──────────────┘
```

### 3. SQLite/drift 底层：关系型存储引擎

```
SQLite 底层架构：

[SQLite] ──► B+ 树索引
        │
        ├─ 数据存储在单个文件中
        ├─ 支持事务（ACID）
        ├─ 支持复杂查询（JOIN、聚合、子查询）
        └─ 通过 FFI 调用 C 库（sqflite）

drift（SQLite 类型安全封装）：

[drift] ──► 在 SQLite 之上提供：
        │
        ├─ 编译时 SQL 检查（Codegen）
        ├─ 类型安全的查询 API
        ├─ 自动迁移（Schema 变更检测）
        └─ 响应式查询（Stream 监听表变化）

执行链路：
[ref.watch(usersTable.select())]
        ↓
[drift 生成 SQL 语句]
        ↓
[sqflite 执行 SQL]
        ↓
[SQLite B+ 树查找]
        ↓
[结果反序列化为 Dart 对象]
        ↓
[返回 Stream<List<User>>]
```

### 4. 加密存储底层：flutter_secure_storage

```
加密存储底层实现：

[flutter_secure_storage] ──► 平台原生加密 API
        │
        ├─ iOS: Keychain Services
        │   └─ 硬件加密（Secure Enclave）
        │   └─ 数据存储在加密的 Keychain 数据库中
        │
        └─ Android: EncryptedSharedPreferences
            └─ 基于 Android Keystore System
            └─ AES-256-GCM 加密
            └─ 密钥存储在硬件安全模块（TEE/StrongBox）

执行链路：
[storage.write(key: 'token', value: 'xxx')]
        ↓
[Dart 层] ──► MethodChannel
        ↓
[原生层]
        ├─ iOS: SecItemAdd() → Keychain
        └─ Android: EncryptedSharedPreferences.putString()
        ↓
[数据加密后写入磁盘]

安全级别：
├─ Keychain/Keystore 是系统级安全存储
├─ 密钥由硬件安全模块保护
└─ 即使设备被 root，也无法直接读取密钥
```

---

## 代码示例

### SharedPreferences

```dart
import 'package:shared_preferences/shared_preferences.dart';

// SharedPreferences：简单键值对存储
class SettingsService {
  static const _themeKey = 'theme';
  static const _languageKey = 'language';

  Future<void> setTheme(String theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, theme);
  }

  String getTheme() {
    final prefs = SharedPreferences.getInstance() as SharedPreferences;
    return prefs.getString(_themeKey) ?? 'light';
  }

  // 监听变化
  void listenThemeChanges(void Function(String?) onChanged) {
    // SharedPreferences 不直接支持监听
    // 需要结合 ValueNotifier 或 StateManagement
  }
}

// 适用场景：
// ├── 用户偏好设置（主题、语言）
// ├── 简单标志位（首次启动、引导完成）
// └── 小量数据（< 1MB）

// 不适用：
// ├── 大量数据（> 1MB 性能下降）
// ├── 复杂查询
// └── 结构化数据
```

### Hive

```dart
import 'package:hive_flutter/hive_flutter.dart';

// Hive：高性能 NoSQL 数据库
// 初始化
await Hive.initFlutter();
Hive.registerAdapter(UserAdapter()); // 注册类型适配器

final box = await Hive.openBox<User>('users');

// 基本操作
await box.put('user1', User(name: 'Alice', age: 25));
User? user = box.get('user1');
await box.delete('user1');
await box.clear();

// 查询
final allUsers = box.values.toList();
final adults = box.values.where((u) => u.age >= 18).toList();

// 监听变化
box.watch().listen((event) {
  print('Box changed: ${event.key}');
});

// Hive 特点：
// ├── 纯 Dart 实现（无原生依赖）
// ├── 高性能（比 SQLite 快）
// ├── 支持类型适配器
// └── 2026 状态：维护模式（Isar 是继任者）
```

### Isar

```dart
import 'package:isar/isar.dart';

// Isar：高性能 NoSQL 数据库（Hive 继任者）
@collection
class User {
  Id? id;
  @Index()
  String? name;
  int? age;
  DateTime? createdAt;

  User({this.id, this.name, this.age, this.createdAt});
}

// 初始化
final isar = await Isar.open([UserSchema]);

// CRUD
final user = User(name: 'Alice', age: 25, createdAt: DateTime.now());
await isar.users.put(user); // 插入/更新
final fetched = await isar.users.get(user.id!);
await isar.users.delete(user.id!);

// 查询（类型安全）
final adults = await isar.users
    .filter()
    .ageGreaterThanOrEqualTo(18)
    .findAll();

final sorted = await isar.users
    .sortByAge()
    .findAll();

// 监听（实时查询）
final query = isar.users.filter().ageGreaterThan(18).watch();
query.listen((users) {
  print('Adults: ${users.length}');
});

// Isar 优势：
// ├── 极高性能（比 Hive 更快）
// ├── 类型安全（Codegen）
// ├── 支持索引和复杂查询
// ├── 实时监听
// └── 纯 Dart（无原生依赖）
```

### SQLite (drift)

```dart
import 'package:drift/drift.dart';

// drift：类型安全的 SQLite ORM
// 定义表
class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 1, max: 50)();
  IntColumn get age => integer()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// DAO（数据访问对象）
@DriftAccessor(tables: [Users])
class UserDao extends DatabaseAccessor<AppDatabase> with _$UserDaoMixin {
  UserDao(AppDatabase db) : super(db);

  Future<List<User>> getAllUsers() => select(users).get();

  Future<User> getUserById(int id) =>
      (select(users)..where((t) => t.id.equals(id)))
          .getSingle();

  Future<int> insertUser(User user) => into(users).insert(user);

  Stream<List<User>> watchUsers() => select(users).watch();
}

// drift 优势：
// ├── 类型安全（编译时检查）
// ├── 支持复杂查询（JOIN、聚合）
// ├── 自动迁移
// ├── 实时监听（watch）
// └── 适合复杂数据模型
```

### 加密存储

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// flutter_secure_storage：加密存储敏感数据
final storage = FlutterSecureStorage();

// 写入（自动加密）
await storage.write(key: 'token', value: 'secret_token');

// 读取（自动解密）
String? token = await storage.read(key: 'token');

// 删除
await storage.delete(key: 'token');

// 底层实现：
// ├── iOS：Keychain
// ├── Android：EncryptedSharedPreferences
// └── 安全性：硬件级加密

// 适用场景：
// ├── Token / JWT
// ├── 密码
// ├── API Key
// └── 敏感用户数据
```

### 数据迁移策略

```dart
// 数据迁移：版本升级时迁移数据
class MigrationService {
  static const _versionKey = 'db_version';

  static Future<void> migrateIfNeeded() async {
    final prefs = await SharedPreferences.getInstance();
    final currentVersion = prefs.getInt(_versionKey) ?? 0;
    final targetVersion = 3; // 当前版本

    if (currentVersion < targetVersion) {
      for (int v = currentVersion + 1; v <= targetVersion; v++) {
        await _runMigration(v);
      }
      await prefs.setInt(_versionKey, targetVersion);
    }
  }

  static Future<void> _runMigration(int version) async {
    switch (version) {
      case 1:
        // v1 迁移：初始化数据库
        break;
      case 2:
        // v2 迁移：添加新字段
        break;
      case 3:
        // v3 迁移：数据格式变更
        break;
    }
  }
}
```

---

## 高频面试题

### Q1: Flutter 本地存储方案如何选择？

**参考答案要点**：

- 简单配置 → SharedPreferences
- 中等数据量、NoSQL → Isar（推荐）或 Hive
- 复杂查询、关系型 → drift（SQLite 类型安全）
- 敏感数据 → flutter_secure_storage
- 2026 趋势：Isar 替代 Hive，drift 替代 sqflite

### Q2: Isar 相比 Hive 有什么优势？

**参考答案要点**：

- 更高性能
- 类型安全（Codegen）
- 支持索引和复杂查询
- 实时监听（watch）
- Hive 进入维护模式，Isar 是继任者

### Q3: 如何设计 Flutter 应用的数据迁移策略？

**参考答案要点**：

- 版本号管理（SharedPreferences 存储当前版本）
- 增量迁移（逐版本执行迁移脚本）
- 向后兼容（新代码能读旧数据）
- 迁移失败处理（回滚或提示用户）

---

## 延伸思考

1. **设计题**：为一个社交应用设计本地存储架构（用户/消息/缓存）。
2. **场景题**：应用升级后旧数据格式不兼容，如何无缝迁移？
3. **对比题**：Isar vs drift vs Hive，2026 年 Flutter 存储方案怎么选？

---

## 参考资料

- [Isar 文档](https://isar.dev)
- [drift 文档](https://drift.simonbinder.eu)
- [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)
