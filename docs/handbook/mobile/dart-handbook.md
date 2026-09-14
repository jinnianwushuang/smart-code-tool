# Dart 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Flutter 开发者、移动应用开发者

---

## 📑 目录

- [一、基础语法](#一基础语法)
- [二、数据类型](#二数据类型)
- [三、控制流](#三控制流)
- [四、函数](#四函数)
- [五、类与对象](#五类与对象)
- [六、泛型](#六泛型)
- [七、异步编程](#七异步编程)
- [八、异常处理](#八异常处理)
- [九、库和包](#九库和包)
- [十、最佳实践](#十最佳实践)
- [十一、常用命令](#十一常用命令)

---

## 一、基础语法

### 1.1 Hello World

```dart
void main() {
  print('Hello, World!');
}
```

### 1.2 变量

```dart
// 类型推断
var name = 'Bob';
var age = 25;

// 显式类型
String greeting = 'Hello';
int count = 10;

// 动态类型
dynamic value = 'string';
value = 123;

// 常量
const pi = 3.14159;
final DateTime now = DateTime.now();
```

### 1.3 字符串

```dart
String str1 = 'Single quotes';
String str2 = "Double quotes";
String str3 = '''Triple quotes
for multiline''';

// 插值
String name = 'Alice';
print('Hello, $name!');
print('Result: ${2 + 2}');

// 常用方法
str.length
str.toUpperCase()
str.toLowerCase()
str.contains('pattern')
str.startsWith('prefix')
str.endsWith('suffix')
str.substring(0, 5)
str.split(',')
str.trim()
str.replaceAll('old', 'new')
```

---

## 二、数据类型

### 2.1 Numbers

```dart
int integer = 42;
double decimal = 3.14;
num number = 10; // int or double

// 转换
int.parse('42')
double.parse('3.14')
42.toString()
3.14.toStringAsFixed(2)

// 运算
+ - * / ~/ (整除) %
```

### 2.2 Booleans

```dart
bool isTrue = true;
bool isFalse = false;

// 逻辑运算
&& || !
```

### 2.3 Lists

```dart
// 创建
List<int> numbers = [1, 2, 3];
var fruits = ['apple', 'banana'];
var list = List.filled(3, 0);

// 访问
list[0]
list.length
list.isEmpty
list.isNotEmpty

// 方法
list.add(4)
list.addAll([5, 6])
list.insert(0, 0)
list.remove(2)
list.removeAt(0)
list.clear()
list.contains(2)
list.indexOf(2)
list.sort()
list.reversed
list.sublist(1, 3)

// 遍历
for (var item in list) { }
list.forEach((item) => print(item));
list.map((e) => e * 2).toList();
list.where((e) => e > 2).toList();
list.reduce((a, b) => a + b);
```

### 2.4 Sets

```dart
Set<String> fruits = {'apple', 'banana'};
var set = <int>{1, 2, 3};

set.add('orange')
set.remove('apple')
set.contains('banana')
set.union(otherSet)
set.intersection(otherSet)
```

### 2.5 Maps

```dart
Map<String, int> scores = {
  'Alice': 95,
  'Bob': 87
};

var map = Map<String, String>();

// 访问
map['key']
map.containsKey('key')
map.containsValue(value)

// 方法
map['key'] = 'value'
map.remove('key')
map.keys
map.values
map.entries
map.forEach((k, v) => print('$k: $v'))
```

### 2.6 Runes & Symbols

```dart
// Runes (Unicode)
Runes input = new Runes('\u2665');

// Symbols
#symbol
```

---

## 三、控制流

### 3.1 If-Else

```dart
if (condition) {
  // code
} else if (anotherCondition) {
  // code
} else {
  // code
}

// 三元运算符
var status = age >= 18 ? 'adult' : 'minor';

// Null-aware
var result = value ?? 'default';
```

### 3.2 Switch

```dart
switch (command) {
  case 'CLOSED':
    executeClosed();
    break;
  case 'PENDING':
    executePending();
    break;
  default:
    executeDefault();
}
```

### 3.3 For Loops

```dart
// 基本 for
for (int i = 0; i < 10; i++) {
  print(i);
}

// for-in
for (var item in collection) {
  print(item);
}

// forEach
collection.forEach((item) => print(item));
```

### 3.4 While & Do-While

```dart
while (condition) {
  // code
}

do {
  // code
} while (condition);
```

### 3.5 Break & Continue

```dart
for (int i = 0; i < 10; i++) {
  if (i == 5) break;
  if (i % 2 == 0) continue;
  print(i);
}
```

---

## 四、函数

### 4.1 函数定义

```dart
// 基本函数
int add(int a, int b) {
  return a + b;
}

// 箭头函数
int multiply(int a, int b) => a * b;

// 可选参数
void greet(String name, [String title = 'Mr.']) {
  print('Hello, $title $name');
}

// 命名参数
void paint({Color? color, double? size}) {
  // ...
}

paint(color: Colors.red, size: 10.0);
```

### 4.2 匿名函数

```dart
var list = ['apples', 'bananas', 'oranges'];
list.forEach((item) {
  print('${list.indexOf(item)}: $item');
});

// 赋值给变量
var func = (int x) => x * 2;
```

### 4.3 闭包

```dart
Function makeAdder(int addBy) {
  return (int i) => addBy + i;
}

var add2 = makeAdder(2);
print(add2(3)); // 5
```

### 4.4 级联运算符

```dart
var paint = Paint()
  ..color = Colors.black
  ..strokeCap = StrokeCap.round
  ..strokeWidth = 5.0;
```

---

## 五、类与对象

### 5.1 基本类

```dart
class Person {
  String name;
  int age;

  Person(this.name, this.age);

  void greet() {
    print('Hello, my name is $name');
  }
}

var person = Person('Alice', 25);
person.greet();
```

### 5.2 构造函数

```dart
class Point {
  double x, y;

  // 普通构造
  Point(double x, double y) {
    this.x = x;
    this.y = y;
  }

  // 语法糖
  Point(this.x, this.y);

  // 命名构造
  Point.origin() : x = 0, y = 0;

  // 工厂构造
  factory Point.fromJson(Map<String, dynamic> json) {
    return Point(json['x'], json['y']);
  }
}
```

### 5.3 继承

```dart
class Animal {
  String name;

  Animal(this.name);

  void speak() {
    print('...');
  }
}

class Dog extends Animal {
  Dog(String name) : super(name);

  @override
  void speak() {
    print('Woof!');
  }
}
```

### 5.4 Mixins

```dart
mixin Flyable {
  void fly() {
    print('Flying...');
  }
}

mixin Swimmable {
  void swim() {
    print('Swimming...');
  }
}

class Duck with Flyable, Swimmable {
}
```

### 5.5 抽象类

```dart
abstract class Shape {
  double area();

  void describe() {
    print('This is a shape');
  }
}

class Circle extends Shape {
  double radius;

  Circle(this.radius);

  @override
  double area() => 3.14 * radius * radius;
}
```

### 5.6 接口

```dart
// Dart 没有 interface 关键字
// 使用 abstract class

abstract class Printable {
  void print();
}

class Document implements Printable {
  @override
  void print() {
    print('Printing document...');
  }
}
```

### 5.7 Getters & Setters

```dart
class Rectangle {
  double width, height;

  Rectangle(this.width, this.height);

  double get area => width * height;

  set area(double value) {
    width = sqrt(value);
    height = width;
  }
}
```

### 5.8 扩展

```dart
extension StringExtension on String {
  int parseInt() {
    return int.parse(this);
  }

  bool get isEmail {
    return contains('@');
  }
}

'42'.parseInt();
'test@example.com'.isEmail;
```

---

## 六、泛型

### 6.1 泛型类

```dart
class Box<T> {
  T value;

  Box(this.value);

  T getValue() => value;
}

var intBox = Box<int>(42);
var stringBox = Box<String>('hello');
```

### 6.2 泛型函数

```dart
T first<T>(List<T> items) {
  return items[0];
}

var firstItem = first<int>([1, 2, 3]);
```

### 6.3 泛型约束

```dart
class Container<T extends num> {
  T value;
  Container(this.value);
}
```

---

## 七、异步编程

### 7.1 Future

```dart
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Data';
}

// 使用
fetchData().then((value) {
  print(value);
}).catchError((error) {
  print(error);
});

// async/await
Future<void> loadData() async {
  try {
    var data = await fetchData();
    print(data);
  } catch (e) {
    print(e);
  }
}
```

### 7.2 Stream

```dart
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    yield i;
    await Future.delayed(Duration(seconds: 1));
  }
}

// 监听
countStream(5).listen((value) {
  print(value);
});

// async-for
await for (var value in countStream(5)) {
  print(value);
}
```

### 7.3 Async/Await

```dart
Future<void> fetchMultiple() async {
  var user = await fetchUser();
  var posts = await fetchPosts(user.id);

  // 并行
  var results = await Future.wait([
    fetchUser(),
    fetchPosts(),
  ]);
}
```

---

## 八、异常处理

### 8.1 Try-Catch

```dart
try {
  int.parse('abc');
} on FormatException catch (e) {
  print('Format error: $e');
} catch (e) {
  print('Unknown error: $e');
} finally {
  print('Always executed');
}
```

### 8.2 Throw

```dart
throw Exception('Something went wrong');
throw 'Error message';
```

### 8.3 Custom Exceptions

```dart
class CustomException implements Exception {
  final String message;

  CustomException(this.message);

  @override
  String toString() => 'CustomException: $message';
}

throw CustomException('Custom error');
```

---

## 九、库和包

### 9.1 Import

```dart
// 标准库
import 'dart:io';
import 'dart:async';

// 第三方包
import 'package:http/http.dart' as http;

// 本地文件
import 'lib/models/user.dart';

// 部分导入
import 'package:lib/lib.dart' show ClassA;
import 'package:lib/lib.dart' hide ClassB;

// 前缀
import 'package:lib/lib.dart' as prefix;
```

### 9.2 Export

```dart
// barrel file
export 'src/class_a.dart';
export 'src/class_b.dart';
```

### 9.3 Pubspec

```yaml
name: my_app
description: My application
version: 1.0.0

environment:
  sdk: '>=2.12.0 <3.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^0.13.0
  provider: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
```

---

## 十、最佳实践

### 10.1 代码风格

```dart
// 使用 final 和 const
final name = 'Alice';
const pi = 3.14;

// 避免 var 当类型明确时
String name = 'Alice'; // ✅
var name = 'Alice';    // ❌

// 使用 ?. 和 ??
name?.length
value ?? 'default'

// 级联运算符
var button = Button()
  ..text = 'Click'
  ..onClick = handler;

// 集合操作符
var list = [1, 2, ...otherList, 3];
var map = {...baseMap, 'key': 'value'};
```

### 10.2 Null Safety

```dart
// Nullable types
String? nullable;
String nonNullable = '';

// Null assertion
nullable!

// Null-aware operators
nullable?.method()
value ?? defaultValue
value ??= computeValue()

// Late
late String initializedLater;
```

### 10.3 性能优化

```dart
// 使用 const 构造函数
const Text('Hello')

// 避免在 build 中创建对象
final controller = TextEditingController();

// 使用 keys
ListView.builder(
  key: ValueKey(itemId),
  itemBuilder: ...
)

// 懒加载
LazyIndexedStack(
  index: currentIndex,
  children: pages,
)
```

### 10.4 测试

```dart
import 'package:test/test.dart';

void main() {
  test('adds numbers', () {
    expect(add(1, 2), equals(3));
  });

  test('throws exception', () {
    expect(() => divide(1, 0), throwsA(isA<Exception>()));
  });
}
```

---

## 十一、常用命令

### 11.1 Dart SDK 命令

```bash
# 版本查看
dart --version

# 运行脚本
dart run bin/main.dart
dart run                    # 运行默认入口

# 直接执行 Dart 文件
dart script.dart

# 交互式 REPL
dart

# 代码分析
dart analyze                # 分析当前项目
dart analyze lib/           # 分析指定目录
dart analyze --fatal-infos  # 包含 info 级别

# 代码格式化
dart format .               # 格式化整个项目
dart format lib/            # 格式化指定目录
dart format --line-length 120 .  # 自定义行宽
dart format --output=none --set-exit-if-changed .  # CI 检查

# 修复建议
dart fix                    # 显示可修复项
dart fix --apply            # 自动修复

# 编译
dart compile exe bin/main.dart         # 编译为原生可执行文件
dart compile exe bin/main.dart -o app  # 指定输出文件名
dart compile js bin/main.dart          # 编译为 JavaScript
dart compile aot-snapshot bin/main.dart  # AOT 编译

# 创建项目
dart create my_project                # 创建 Dart 项目
dart create -t server-shelf my_server # 服务端模板
dart create -t package my_package     # 包模板
dart create -t console my_cli         # 命令行模板
```

### 11.2 Flutter 命令

```bash
# 版本与环境
flutter --version
flutter doctor                # 检查环境配置
flutter doctor -v             # 详细检查
flutter doctor --android-licenses  # 接受 Android 许可

# 创建项目
flutter create my_app                    # 创建 Flutter 项目
flutter create --org com.example my_app  # 指定包名
flutter create --platforms=ios,android my_app  # 指定平台
flutter create --template=package my_pkg # 创建包
flutter create --template=plugin my_plugin  # 创建插件

# 运行
flutter run                 # 运行到默认设备
flutter run -d chrome       # 运行到 Chrome
flutter run -d ios          # 运行到 iOS 模拟器
flutter run -d android      # 运行到 Android
flutter run --release       # Release 模式运行
flutter run --profile       # Profile 模式运行

# 热重载
# 在 run 中按 r 键：热重载
# 在 run 中按 R 键：热重启
# 在 run 中按 q 键：退出

# 设备管理
flutter devices             # 列出可用设备
flutter emulators           # 列出可用模拟器
flutter emulators --create  # 创建新模拟器
```

### 11.3 Pub 包管理

```bash
# 安装依赖
flutter pub get             # Flutter 项目
dart pub get                # 纯 Dart 项目

# 添加依赖
flutter pub add http                    # 添加依赖
flutter pub add dev:build_runner        # 添加开发依赖
flutter pub add 'provider:^6.0.0'       # 指定版本

# 移除依赖
flutter pub remove http

# 升级依赖
flutter pub upgrade                     # 升级所有
flutter pub upgrade http                # 升级指定包
flutter pub upgrade --major-versions    # 允许大版本升级

# 查看依赖
flutter pub deps          # 依赖树
flutter pub outdated      # 查看过期依赖

# 清理缓存
flutter pub cache repair  # 修复缓存
flutter pub cache clean   # 清除缓存

# 发布包
dart pub publish           # 发布到 pub.dev
dart pub publish --dry-run # 模拟发布

# 全局激活
dart pub global activate <package>
dart pub global list
dart pub global deactivate <package>
```

### 11.4 构建与发布

```bash
# Android
flutter build apk                     # 构建 APK
flutter build apk --release           # Release APK
flutter build apk --debug             # Debug APK
flutter build appbundle               # 构建 AAB（Google Play）
flutter build apk --split-per-abi     # 按 ABI 分包

# iOS
flutter build ios                     # 构建 iOS
flutter build ios --release           # Release iOS
flutter build ios --no-codesign       # 不签名构建

# Web
flutter build web                     # 构建 Web
flutter build web --release

# macOS / Windows / Linux
flutter build macos
flutter build windows
flutter build linux

# 安装到设备
flutter install                       # 安装到连接设备

# 清理
flutter clean                         # 清理构建产物
flutter pub get                       # 清理后重新获取依赖
```

### 11.5 测试命令

```bash
# Flutter 测试
flutter test                          # 运行所有测试
flutter test test/widget_test.dart    # 运行指定文件
flutter test --coverage               # 生成覆盖率报告
flutter test --update-goldens         # 更新 Golden 测试图片
flutter test --plain-name "login"     # 按名称过滤

# Dart 测试
dart test                             # 运行所有测试
dart test --coverage=coverage         # 覆盖率
dart test --platform chrome           # 指定平台

# 集成测试
flutter test integration_test/app_test.dart
flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart

# 性能测试
flutter run --profile --trace-skia    # Skia 性能追踪
flutter run --profile --trace-widget-rebuilds  # Widget 重建追踪
```

### 11.6 代码生成

```bash
# build_runner（代码生成工具）
dart run build_runner build           # 执行代码生成
dart run build_runner watch           # 监听模式（自动重新生成）
dart run build_runner build --delete-conflicting-outputs  # 清理后生成

# 常用生成器
# build_runner + json_serializable → JSON 序列化
# build_runner + freezed → 不可变数据类
# build_runner + built_value → 值类型
# build_runner + retrofit → API 客户端

# 单个文件生成
dart run build_runner build --build-filter="lib/models/*.dart"
```

### 11.7 实用技巧

```bash
# 查看 Flutter 日志（带颜色）
flutter run --verbose

# 查看 Widget 树
flutter inspect                 # 打开 DevTools

# 生成应用图标
flutter pub add flutter_launcher_icons
# 配置 pubspec.yaml 后运行:
flutter pub run flutter_launcher_icons

# 生成启动页
flutter pub add flutter_native_splash
# 配置 pubspec.yaml 后运行:
flutter pub run flutter_native_splash:create

# 查看应用大小
flutter build apk --analyze-size
flutter build ios --analyze-size

# Fuchsia 相关
flutter config --enable-fuchsia=true

# 渠道切换
flutter channel stable          # 稳定版
flutter channel beta            # Beta 版
flutter channel dev             # 开发版
flutter channel master          # 最新代码
flutter upgrade                 # 升级 Flutter SDK
```

---

## 附录

### A. 常用包

- **http**: HTTP 请求
- **provider**: 状态管理
- **flutter_riverpod**: 状态管理
- **bloc**: 状态管理
- **dio**: HTTP 客户端
- **shared_preferences**: 本地存储
- **sqflite**: SQLite 数据库

### B. 有用的资源

- **Dart 官方文档**: https://dart.dev/guides
- **DartPad**: https://dartpad.dev/ (在线编辑器)
- **Pub.dev**: https://pub.dev/ (包管理器)

### C. 学习路线

```
Dart 基础 → OOP → 异步编程 → Flutter 基础 → Widget → 状态管理 → 高级特性

1. Dart 语法基础
2. 面向对象编程
3. 泛型和集合
4. 异步编程 (Future/Stream)
5. Flutter 框架
6. Widget 系统
7. 状态管理
8. 路由导航
9. 网络请求
10. 本地存储
11. 测试
12. 发布
```

---

**祝您 Dart 开发愉快！** 🎯
