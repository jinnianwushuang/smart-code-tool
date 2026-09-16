---
title: 'Dart 语言基础与核心特性 [P5-P6]'
level: 'intermediate'
tags: ['Dart', 'Flutter', '空安全', 'OOP', '异步']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# Dart 语言基础与核心特性 [P5-P6]

> Dart 是 Flutter 的编程语言。掌握 Dart 的核心特性——空安全、异步编程、OOP 和函数式编程，是写好 Flutter 的基础。

## 核心概念（What）

### Dart 语言特点

```
Dart 核心特性：
├── 空安全（Null Safety）→ 编译时避免空指针
├── 异步支持 → async/await + Future/Stream
├── OOP → 类、混入、继承、抽象类
├── 函数式 → 高阶函数、闭包、箭头函数
├── 可选类型 → 类型注解 + 类型推导
└── 即时编译 → 开发 JIT，生产 AOT

与 JavaScript 对比：
├── 类型系统更严格
├── 空安全内置
├── 没有 undefined（只有 null）
├── 支持 mixin（多继承替代）
└── 异步模型类似（Future ≈ Promise）
```

## 底层原理（Why）

### 空安全（Null Safety）

```dart
// Dart 2.12+ 默认空安全

// 可空类型
String? nullableName; // 可以是 null
nullableName = null;  // ✓
nullableName = 'Alice'; // ✓

// 非空类型
String name = 'Alice';
// name = null; // ✗ 编译错误

// 空安全操作符
String? maybeNull;

// ?. 安全调用
maybeNull?.length; // null（不报错）

// ?? 空合并
String value = maybeNull ?? 'default'; // 'default'

// ??= 空赋值
maybeNull ??= 'fallback'; // 只在 null 时赋值

// ! 强制非空（慎用）
String definitely = maybeNull!; // 如果 null 则运行时错误

// late 关键字
late String lazyValue; // 延迟初始化
lazyValue = 'hello';   // 使用前必须赋值

// 类型提升
void printLength(String? str) {
  if (str != null) {
    // str 自动提升为 String（非空）
    print(str.length);
  }
}
```

### 异步编程

```dart
// Future ≈ JavaScript 的 Promise

// async/await
Future<String> fetchUserName() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Alice';
}

void main() async {
  String name = await fetchUserName();
  print(name); // Alice
}

// Future 方法
Future<void> multipleFutures() async {
  // 并行执行（类似 Promise.all）
  var results = await Future.wait([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3),
  ]);

  // 任一完成（类似 Promise.race）
  var first = await Future.any([
    slowOperation(),
    timeout(),
  ]);

  // 链式调用
  fetchUser(1)
    .then((user) => fetchPosts(user.id))
    .then((posts) => print(posts))
    .catchError((error) => print(error));
}

// Stream ≈ JavaScript 的 Observable/AsyncIterator

// 创建 Stream
Stream<int> countStream() async* {
  for (int i = 1; i <= 5; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// 监听 Stream
void main() async {
  await for (var value in countStream()) {
    print(value); // 1, 2, 3, 4, 5
  }

  // 或使用 listen
  countStream().listen((value) {
    print('Received: $value');
  });
}

// Stream 转换
stream
  .where((item) => item > 3)
  .map((item) => item * 2)
  .listen(print);
```

### 类与面向对象

```dart
// 基础类
class User {
  final String name; // final 不可变
  int age;

  // 构造函数
  User(this.name, this.age);

  // 命名构造函数
  User.guest() : name = 'Guest', age = 0;

  // 工厂构造函数
  factory User.fromJson(Map<String, dynamic> json) {
    return User(json['name'], json['age']);
  }

  // 方法
  void greet() {
    print('Hi, I\'m $name');
  }

  // getter/setter
  bool get isAdult => age >= 18;
  set age(int value) {
    if (value >= 0) _age = value;
  }

  int _age = 0; // 私有属性（下划线前缀）
}

// 继承
class Admin extends User {
  final List<String> permissions;

  Admin(String name, int age, this.permissions) : super(name, age);

  @override
  void greet() {
    print('Admin: $name');
  }
}

// 抽象类（接口）
abstract class Repository<T> {
  Future<T> getById(String id);
  Future<List<T>> getAll();
  Future<void> create(T item);
}

// 实现
class UserRepository extends Repository<User> {
  @override
  Future<User> getById(String id) async {
    // 实现
  }

  @override
  Future<List<User>> getAll() async {
    // 实现
  }

  @override
  Future<void> create(User item) async {
    // 实现
  }
}

// Mixin（多继承替代方案）
mixin Logger {
  void log(String message) {
    print('[LOG] $message');
  }
}

mixin Validator {
  bool validate(String input) {
    return input.isNotEmpty;
  }
}

// 使用多个 mixin
class Service with Logger, Validator {
  void doSomething() {
    if (validate('data')) {
      log('Processing...');
    }
  }
}

// 扩展方法
extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return this[0].toUpperCase() + substring(1);
  }

  bool get isEmail => contains('@');
}

// 使用
print('hello'.capitalize()); // Hello
print('test@example.com'.isEmail); // true
```

### 集合与函数式

```dart
// List
final numbers = [1, 2, 3, 4, 5];

final doubled = numbers.map((n) => n * 2).toList();
final evens = numbers.where((n) => n % 2 == 0).toList();
final sum = numbers.reduce((a, b) => a + b);
final first = numbers.firstWhere((n) => n > 3);

// Map
final user = {'name': 'Alice', 'age': 25};
user['email'] = 'alice@example.com';
user.forEach((key, value) {
  print('$key: $value');
});

// Set
final unique = {1, 2, 3, 3, 4}; // {1, 2, 3, 4}

// 级联操作符
final button = TextButton()
  ..onPressed = () => print('Clicked')
  ..style = ButtonStyle(
    backgroundColor: Colors.blue,
  )
  ..child = Text('Submit');

// 展开操作符
final list1 = [1, 2, 3];
final list2 = [4, 5, 6];
final combined = [...list1, ...list2]; // [1, 2, 3, 4, 5, 6]

final map1 = {'a': 1};
final map2 = {'b': 2};
final merged = {...map1, ...map2}; // {'a': 1, 'b': 2}
```

## 实战应用（How）

### 常用模式

```dart
// 1. 不可变数据类
class User {
  final String id;
  final String name;
  final String email;

  const User({
    required this.id,
    required this.name,
    required this.email,
  });

  // copyWith 模式
  User copyWith({
    String? id,
    String? name,
    String? email,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
    );
  }
}

// 使用
final user = User(id: '1', name: 'Alice', email: 'alice@example.com');
final updated = user.copyWith(name: 'Bob');

// 2. 枚举扩展
enum Status { loading, success, error }

extension StatusExtension on Status {
  bool get isLoading => this == Status.loading;
  bool get isSuccess => this == Status.success;
  bool get isError => this == Status.error;
}

// 3. 密封类（Dart 3.0+）
sealed class Result<T> {}

class Success<T> extends Result<T> {
  final T value;
  Success(this.value);
}

class Failure<T> extends Result<T> {
  final Exception error;
  Failure(this.error);
}

// 模式匹配
void handleResult(Result<int> result) {
  switch (result) {
    case Success(value: final v):
      print('Success: $v');
    case Failure(error: final e):
      print('Error: $e');
  }
}
```

## 高频面试题

### Q1: Dart 的空安全如何工作？

```
空安全机制：
├── 类型后加 ? → 可空类型（String?）
├── 不加 ? → 非空类型（String）
├── ?. → 安全调用
├── ?? → 空合并
├── ! → 强制非空（慎用）
└── late → 延迟初始化

优势：
├── 编译时检查（不是运行时）
├── 减少空指针异常
└── 代码更健壮
```

### Q2: Dart 的 mixin 和继承的区别？

```
继承（extends）：
├── 单继承
├── is-a 关系
├── 可以重写方法
└── 有构造函数顺序

Mixin（with）：
├── 多 mixin
├── has-a 能力
├── 复用代码
└── 不能有构造函数

使用场景：
├── 继承 → 类型层次（Animal → Dog）
└── Mixin → 能力组合（Logger + Validator）
```

### Q3: Future 和 Stream 的区别？

```
Future：
├── 单个异步值
├── ≈ JavaScript Promise
├── await 获取结果
└── 用于：API 请求、文件读取

Stream：
├── 多个异步值序列
├── ≈ JavaScript Observable
├── await for 或 listen
└── 用于：WebSocket、事件流、实时数据
```

## 延伸思考

1. Dart 3.0 的模式匹配有哪些用法？
2. 如何设计不可变的数据模型？
3. Dart 的 isolate 和线程的区别？

## 参考资料

- [Dart 官方文档](https://dart.dev/guides)
- [Dart 空安全](https://dart.dev/null-safety)
