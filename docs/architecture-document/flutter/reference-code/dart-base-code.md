---
title: DART 基础代码
order: 14
---

# DART 基础代码

这份 Dart 基础知识代码涵盖了从基础变量、复杂集合、流程控制到面向对象和异步处理的核心语法。

```dart
// 1. 变量与基本数据类型
void basicTypes() {
  // 强类型定义
  String name = "Dart";
  int age = 13;
  double version = 3.0;
  bool isCool = true;

  // 类型推断 (var / final / const)
  var city = "Beijing";     // 可变
  final now = DateTime.now(); // 运行时常量（只能赋值一次）
  const pi = 3.14159;       // 编译时常量（性能更优）

  // 空安全 (Null Safety)
  String? nullableString;   // 可为空
  String nonNullable = "Must have value";
  print(nullableString ?? "Default Value"); // ?? 运算符：为空则取右值

  late String description; // 延迟初始化：承诺稍后赋值，避开构造函数检查
}

// 2. 容器与集合 (Collections)
void collections() {
  // 列表 (List) 与 扩展操作符
  var list1 = ['Apple', 'Banana'];
  var list2 = ['Orange', ...list1]; // 展开操作符

  // 集合控制流 (Collection If/For) - Flutter UI 编写神器
  var nav = ['Home', 'Furniture', if (true) 'Plants'];

  // 映射 (Map) - 键值对
  Map<String, dynamic> user = {
    'id': 1,
    'name': 'Alice',
    'isAdmin': false
  };

  // 级联操作符 (Cascades)
  var list = []
    ..add('Item 1')
    ..add('Item 2')
    ..removeAt(0);
}

// 3. 流程控制 (Flow Control)
void controlFlow(int score) {
  // 条件判断
  if (score >= 90) {
    print('Excellent');
  } else if (score >= 60) {
    print('Pass');
  } else {
    print('Fail');
  }

  // 循环
  for (var i = 0; i < 3; i++) {
    print('Index: $i');
  }

  for (var item in [1, 2, 3]) {
    print('Item: $item');
  }

  // Switch (Dart 3.0+ 支持模式匹配)
  var status = 'loading';
  switch (status) {
    case 'loading': print('加载中');
    case 'success': print('成功');
    default: print('未知');
  }
}

// 4. 函数 (Functions)
// 简写：箭头函数
String greet(String person) => "Hello, $person!";

// 命名参数 (Named Parameters) - 常用在 Flutter
void setConfig({required String theme, int fontSize = 14}) {
  print('Theme: $theme, Size: $fontSize');
}

// 5. 类与对象 (OOP)
class Person {
  String name;
  int _age; // 下划线开头表示私有

  // 构造函数简写
  Person(this.name, this._age);

  // 命名构造函数
  Person.guest() : name = 'Guest', _age = 18;

  // 方法
  void info() => print('$name is $_age years old.');
}

// 6. 现代特性：记录 (Records) 与 模式匹配 (Dart 3+)
(double, double) getLocation() => (39.9, 116.4); // 返回多个值

void processRecords() {
  var (lat, lon) = getLocation(); // 解构赋值
  print('经度: $lat, 纬度: $lon');
}

// 7. 扩展方法 (Extensions) - 为已有类增加功能
extension StringFix on String {
  bool get isEmail => contains('@');
}

// 8. 异步处理 (Async/Await & Stream)
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 1));
  return "Data received";
}

// Stream：处理连续的异步数据流
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    yield i;
  }
}

// 9. 混入 (Mixins) - 实现多重继承的效果
mixin Swimmer {
  void swim() => print("Swimming...");
}
class Dolphin extends Person with Swimmer {
  Dolphin(super.name, super.age);
}

void handleErrors() {
  try {
    throw Exception('Something went wrong');
  } catch (e) {
    print('Caught: $e');
  } finally {
    print('Cleanup');
  }
}

// 入口函数
void main() async {
  print('--- Dart 基础知识速查 ---');
  basicTypes();
  controlFlow(85);
  setConfig(theme: 'Dark', fontSize: 16);

  var p = Person('Bob', 25);
  p.info();

  String data = await fetchData();
  print(data);
}
```

## 重点提示（方便查阅）：

1. **空安全**：记得使用 `?` 声明可空类型，使用 `??` 处理默认值。
2. **方法参数**：`{}` 括起来的是命名参数，调用时更清晰（Flutter 开发核心）。
3. **构造函数**：`this.name` 这种简写方式是 Dart 的特色，直接完成属性赋值。
4. **异步**：`Future` 和 `async/await` 是处理网络请求和 IO 的标准方式。
