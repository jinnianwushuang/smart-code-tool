---
title: 'JS · Dart · Python 三大语言 API 与底层机制对比'
tags: ['JavaScript', 'Dart', 'Python', '语言对比', 'API对比', '底层原理']
---

# JS · Dart · Python 三大语言 API 与底层机制对比

> 本文从数据类型、异步模型、OOP 体系、集合操作、错误处理、模块系统、内存管理、并发模型八大维度，系统对比 JavaScript、Dart、Python 三大语言的 API 设计与底层机制差异。帮助开发者在跨语言开发时快速建立统一认知，避免"用 JS 思维写 Dart"或"用 Python 思维写 JS"的常见陷阱。

---

## 一、对比总览

```
┌─────────────────────────────────────────────────────────────────┐
│              三大语言的核心定位与设计哲学                          │
│                                                                  │
│  JavaScript          Dart                Python                  │
│  ──────────          ────                ──────                  │
│  浏览器脚本          Flutter/移动端       后端/AI/脚本            │
│  动态弱类型          静态强类型（可选推断）动态强类型              │
│  单线程 + 事件循环   单线程 + 事件循环    多线程 + GIL            │
│  原型链 OOP          类 OOP（mixins）     多范式 OOP             │
│  一切皆表达式        一切皆对象           一切皆对象              │
│  回调/Promise/async  Future/async/await   asyncio/Thread/Process │
│                                                                  │
│  共同点：                                                        │
│  • 都支持 async/await 语法                                      │
│  • 都有 GC（自动内存管理）                                       │
│  • 都支持函数式编程（高阶函数、闭包）                            │
│  • 都有丰富的标准库和生态                                        │
│                                                                  │
│  核心差异：                                                      │
│  • 类型系统：JS 弱类型 → Dart 强类型 → Python 强类型             │
│  • 并发模型：JS 单线程 → Dart 单线程 → Python 多线程（GIL）     │
│  • OOP 模型：JS 原型链 → Dart 类 → Python 多继承               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、数据类型与集合操作

### 2.1 基础类型对比

```
┌─────────────────────────────────────────────────────────────────┐
│  类型          JavaScript          Dart              Python      │
│  ────          ──────────          ────              ──────      │
│  整数          number (双精度浮点) int               int         │
│  浮点          number              double            float       │
│  字符串        string              String            str         │
│  布尔          boolean             bool              bool        │
│  空值          null / undefined    null              None        │
│  数组/列表     Array               List              list        │
│  字典/映射     Object / Map        Map               dict        │
│  集合          Set                 Set               set         │
│                                                                  │
│  关键差异：                                                      │
│  • JS 的 number 统一了整数和浮点（IEEE 754 双精度）             │
│  • Dart 区分 int 和 double（类型安全）                           │
│  • Python 的 int 是任意精度（不会溢出）                          │
│  • JS 的 null 和 undefined 是两个不同的值                        │
│  • Dart 和 Python 只有一个空值（null / None）                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 集合操作对比

```javascript
// ── JavaScript ──
const arr = [1, 2, 3, 4, 5]

// map / filter / reduce
const doubled = arr.map((x) => x * 2) // [2, 4, 6, 8, 10]
const evens = arr.filter((x) => x % 2 === 0) // [2, 4]
const sum = arr.reduce((acc, x) => acc + x, 0) // 15

// 查找
const found = arr.find((x) => x > 3) // 4
const index = arr.findIndex((x) => x > 3) // 3
const has = arr.includes(3) // true

// 展开/合并
const merged = [...arr, 6, 7] // [1,2,3,4,5,6,7]
const copied = [...arr] // 浅拷贝
```

```dart
// ── Dart ──
final list = [1, 2, 3, 4, 5];

// map / where (filter) / reduce
final doubled = list.map((x) => x * 2).toList();        // [2, 4, 6, 8, 10]
final evens = list.where((x) => x % 2 == 0).toList();   // [2, 4]
final sum = list.reduce((acc, x) => acc + x);            // 15

// 查找
final found = list.firstWhere((x) => x > 3);            // 4
final index = list.indexWhere((x) => x > 3);            // 3
final has = list.contains(3);                            // true

// 展开/合并
final merged = [...list, 6, 7];                          // [1,2,3,4,5,6,7]
final copied = [...list];                                 // 浅拷贝
```

```python
# ── Python ──
arr = [1, 2, 3, 4, 5]

# map / filter / reduce（需要导入 functools）
doubled = [x * 2 for x in arr]              # [2, 4, 6, 8, 10]（列表推导式）
evens = [x for x in arr if x % 2 == 0]      # [2, 4]
from functools import reduce
sum_val = reduce(lambda acc, x: acc + x, arr) # 15

# 查找
found = next(x for x in arr if x > 3)       # 4
index = next(i for i, x in enumerate(arr) if x > 3)  # 3
has = 3 in arr                               # True

# 展开/合并
merged = [*arr, 6, 7]                        # [1, 2, 3, 4, 5, 6, 7]
copied = arr.copy()                           # 浅拷贝
```

### 2.3 Map / Dict 操作对比

```javascript
// JavaScript
const map = new Map([
  ['a', 1],
  ['b', 2],
])
map.set('c', 3)
map.get('a') // 1
map.has('b') // true
map.delete('c')
map.size // 2
map.forEach((v, k) => console.log(k, v))

// 普通 Object 作为字典
const obj = { a: 1, b: 2 }
obj['c'] = 3
obj['a'] // 1
'a' in obj // true
Object.keys(obj) // ['a', 'b', 'c']
```

```dart
// Dart
final map = {'a': 1, 'b': 2};
map['c'] = 3;
map['a'];               // 1
map.containsKey('b');   // true
map.remove('c');
map.length;             // 2
map.forEach((k, v) => print('$k $v'));
```

```python
# Python
d = {'a': 1, 'b': 2}
d['c'] = 3
d['a']                  # 1
'b' in d                # True
del d['c']
len(d)                  # 2
for k, v in d.items():
    print(k, v)
```

---

## 三、异步模型

### 3.1 异步模型对比

```
┌─────────────────────────────────────────────────────────────────┐
│  维度          JavaScript          Dart              Python      │
│  ────          ──────────          ────              ──────      │
│                                                                  │
│  异步基础      事件循环 + 回调     事件循环 + Future  事件循环    │
│  核心抽象      Promise             Future/Stream     asyncio     │
│  语法糖        async/await         async/await       async/await │
│  并发模型      单线程              单线程（Isolate）  多线程+GIL  │
│  并行计算      Worker              Isolate            Process    │
│                                                                  │
│  关键差异：                                                      │
│  • JS Promise 是微任务（microtask）                              │
│  • Dart Future 也是微任务（与 JS 对齐）                          │
│  • Python asyncio 基于协程（coroutine）                          │
│                                                                  │
│  • JS 单线程 → Web Worker 实现并行                               │
│  • Dart 单线程 → Isolate 实现并行（内存隔离）                    │
│  • Python 多线程 → GIL 限制真并行 → multiprocessing              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 async/await 对比

```javascript
// JavaScript
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// 并行执行
const [a, b] = await Promise.all([
  fetch('/api/a').then((r) => r.json()),
  fetch('/api/b').then((r) => r.json()),
])
```

```dart
// Dart
Future<Data> fetchData() async {
  try {
    final response = await http.get(Uri.parse('/api/data'));
    final data = jsonDecode(response.body);
    return Data.fromJson(data);
  } catch (error) {
    print('Error: $error');
    rethrow;
  }
}

// 并行执行
final results = await Future.wait([
  http.get(Uri.parse('/api/a')),
  http.get(Uri.parse('/api/b')),
]);
```

```python
# Python
import asyncio
import aiohttp

async def fetch_data():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('/api/data') as response:
                data = await response.json()
                return data
    except Exception as error:
        print(f'Error: {error}')
        raise

# 并行执行
async def main():
    results = await asyncio.gather(
        fetch_one('/api/a'),
        fetch_one('/api/b'),
    )
```

### 3.3 事件循环差异

```
JavaScript 事件循环：
┌──────────────────────────────────────────────────────────┐
│  调用栈 → 微任务队列 → 宏任务队列                        │
│                                                          │
│  微任务：Promise.then / queueMicrotask / MutationObserver │
│  宏任务：setTimeout / setInterval / I/O                  │
│                                                          │
│  执行顺序：                                               │
│  ① 执行同步代码（调用栈清空）                             │
│  ② 清空微任务队列（全部执行完）                           │
│  ③ 执行一个宏任务                                         │
│  ④ 重复 ②③                                              │
└──────────────────────────────────────────────────────────┘

Dart 事件循环：
┌──────────────────────────────────────────────────────────┐
│  与 JS 几乎相同（因为 Dart 设计时参考了 JS）              │
│                                                          │
│  微任务：Future.microtask / scheduleMicrotask             │
│  宏任务：Timer / I/O                                     │
│                                                          │
│  差异：                                                   │
│  • Dart 有两个事件循环队列（微任务 + 事件队列）           │
│  • 微任务优先级高于事件队列（与 JS 一致）                 │
│  • Dart 的 Isolate 有独立的事件循环和内存堆               │
└──────────────────────────────────────────────────────────┘

Python asyncio 事件循环：
┌──────────────────────────────────────────────────────────┐
│  基于协程（coroutine）+ 任务（Task）                      │
│                                                          │
│  asyncio.run(main()) → 创建事件循环 → 运行协程            │
│                                                          │
│  与 JS/Dart 的差异：                                      │
│  • Python 有真正的多线程（但有 GIL）                      │
│  • asyncio 是协作式多任务（协程主动让出）                 │
│  • 可以用 ThreadPoolExecutor 绕过 GIL                    │
│  • 可以用 ProcessPoolExecutor 实现真并行                  │
└──────────────────────────────────────────────────────────┘
```

---

## 四、OOP 体系

### 4.1 类与继承对比

```javascript
// JavaScript（ES6 class，本质是原型链的语法糖）
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(`${this.name} makes a sound`)
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks`)
  }
}

const dog = new Dog('Rex')
dog.speak() // "Rex barks"

// 注意：JS 的 class 是原型链的语法糖
// 本质上仍然是 prototype-based OOP
```

```dart
// Dart（真正的类 OOP）
class Animal {
  final String name;
  Animal(this.name);

  void speak() {
    print('$name makes a sound');
  }
}

class Dog extends Animal {
  Dog(String name) : super(name);

  @override
  void speak() {
    print('$name barks');
  }
}

final dog = Dog('Rex');
dog.speak(); // "Rex barks"

// Dart 支持 mixins（多继承的替代方案）
mixin Flyer {
  void fly() => print('Flying');
}

class FlyingDog extends Dog with Flyer {}
```

```python
# Python（多范式 OOP）
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f'{self.name} makes a sound')

class Dog(Animal):
    def speak(self):
        print(f'{self.name} barks')

dog = Dog('Rex')
dog.speak()  # "Rex barks"

# Python 支持多继承
class Flyer:
    def fly(self):
        print('Flying')

class FlyingDog(Dog, Flyer):
    pass

# MRO（方法解析顺序）：C3 线性化算法
FlyingDog.__mro__  # 查看继承链
```

### 4.2 OOP 特性对比

```
┌─────────────────────────────────────────────────────────────────┐
│  特性          JavaScript          Dart              Python      │
│  ────          ──────────          ────              ──────      │
│                                                                  │
│  类            class（语法糖）     class（真类）      class      │
│  继承          extends             extends            多继承     │
│  多继承        ❌ 不支持           ❌ 不支持          ✅ 支持    │
│  Mixin         ❌ 不支持           ✅ with            ✅ 支持    │
│  接口          ❌ 不支持           ✅ implements      ❌ 不支持  │
│  抽象类        ❌ 不支持           ✅ abstract        ✅ ABC     │
│  枚举          ✅ enum（ES2020+）  ✅ enum            ✅ Enum    │
│  私有成员      # 前缀              _ 前缀（约定）     _ 前缀     │
│  getter/setter ✅ get/set          ✅ get/set         @property  │
│  静态成员      static              static             @classmethod│
│                                                                  │
│  核心差异：                                                      │
│  • JS 是原型链 OOP → class 是语法糖                              │
│  • Dart 是经典类 OOP → 支持 interface/abstract/mixin             │
│  • Python 支持多继承 → MRO 解决菱形继承                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、错误处理

### 5.1 异常处理对比

```javascript
// JavaScript
try {
  const result = riskyOperation()
  console.log(result)
} catch (error) {
  console.error('Error:', error.message)
} finally {
  cleanup()
}

// 异步错误
async function asyncOp() {
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    throw new Error('Async error: ' + error.message)
  }
}

// 自定义错误
class CustomError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CustomError'
  }
}

throw new CustomError('Something went wrong')
```

```dart
// Dart
try {
  final result = riskyOperation();
  print(result);
} catch (error, stackTrace) {
  print('Error: $error');
  print('Stack: $stackTrace');
} finally {
  cleanup();
}

// 异步错误
Future<Data> asyncOp() async {
  try {
    final data = await fetchData();
    return data;
  } catch (error) {
    throw Exception('Async error: $error');
  }
}

// 自定义异常
class CustomException implements Exception {
  final String message;
  CustomException(this.message);

  @override
  String toString() => 'CustomException: $message';
}

throw CustomException('Something went wrong');
```

```python
# Python
try:
    result = risky_operation()
    print(result)
except Exception as error:
    print(f'Error: {error}')
finally:
    cleanup()

# 异步错误
async def async_op():
    try:
        data = await fetch_data()
        return data
    except Exception as error:
        raise Exception(f'Async error: {error}')

# 自定义异常
class CustomError(Exception):
    def __init__(self, message):
        super().__init__(message)

    def __str__(self):
        return f'CustomError: {self.args[0]}'

raise CustomError('Something went wrong')
```

---

## 六、模块系统

### 6.1 模块导入导出对比

```javascript
// JavaScript（ES Modules）
// 导出
export const PI = 3.14
export function add(a, b) {
  return a + b
}
export class Calculator {}

// 默认导出
export default class MyClass {}

// 导入
import { PI, add } from './math.js'
import MyClass from './my-class.js'
import * as MathUtils from './math.js'

// 动态导入
const module = await import('./lazy-module.js')
```

```dart
// Dart
// 导出（文件即模块，默认全部导出）
const pi = 3.14;
int add(int a, int b) => a + b;
class Calculator { }

// 导入
import 'math.dart';
import 'math.dart' as math;          // 带前缀
import 'math.dart' show add, pi;     // 只导入指定
import 'math.dart' hide Calculator;  // 排除指定

// 延迟导入（懒加载）
import 'lazy_module.dart' deferred as lazy;
// 使用：await lazy.loadLibrary();
```

```python
# Python
# 导出（模块即文件，默认全部导出）
PI = 3.14
def add(a, b):
    return a + b

class Calculator:
    pass

# __all__ 控制 from module import * 的行为
__all__ = ['PI', 'add', 'Calculator']

# 导入
from math import pi, sin
import math
from math import *  # 不推荐

# 相对导入（包内）
from . import sibling_module
from ..parent import parent_func
```

---

## 七、内存管理

### 7.1 GC 策略对比

```
┌─────────────────────────────────────────────────────────────────┐
│  维度          JavaScript          Dart              Python      │
│  ────          ──────────          ────              ──────      │
│                                                                  │
│  GC 算法       分代 GC            分代 GC            引用计数    │
│  （V8）        （新生代 + 老年代） （新生代 + 老年代） + 分代 GC  │
│                                                                  │
│  回收策略      标记-清除           标记-清除           引用计数   │
│              + 标记-整理         + Scavenge          + 循环检测  │
│                                                                  │
│  暂停策略      STW（Stop-The-World）STW              无暂停     │
│              + 增量标记          + 并发标记          （引用计数）│
│                                                                  │
│  循环引用      ✅ 可处理           ✅ 可处理           ✅ 可处理  │
│              （标记-清除）        （标记-清除）        （循环检测）│
│                                                                  │
│  手动释放      ❌ 不支持           ❌ 不支持           ✅ __del__ │
│              （依赖 GC）          （依赖 GC）          （不推荐） │
│                                                                  │
│  弱引用        WeakRef / WeakMap   WeakReference      weakref   │
│                                                                  │
│  关键差异：                                                      │
│  • JS/Dart 使用标记-清除 → 有 STW 暂停                          │
│  • Python 使用引用计数 → 即时回收，无暂停                       │
│  • Python 的循环引用需要 gc 模块检测                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 八、字符串操作

### 8.1 字符串 API 对比

```javascript
// JavaScript
const str = 'Hello, World!'

str.length // 13
str.toUpperCase() // "HELLO, WORLD!"
str.toLowerCase() // "hello, world!"
str.includes('World') // true
str.startsWith('Hello') // true
str.endsWith('!') // true
str.indexOf('World') // 7
str.slice(0, 5) // "Hello"
str.split(', ') // ["Hello", "World!"]
str.trim() // 去除两端空白
str.replace('World', 'JS') // "Hello, JS!"
str.repeat(2) // "Hello, World!Hello, World!"
str.padStart(20, '-') // "-------Hello, World!"

// 模板字符串
const name = 'Alice'
const greeting = `Hello, ${name}!`
```

```dart
// Dart
final str = 'Hello, World!';

str.length;                  // 13
str.toUpperCase();           // "HELLO, WORLD!"
str.toLowerCase();           // "hello, world!"
str.contains('World');       // true
str.startsWith('Hello');     // true
str.endsWith('!');           // true
str.indexOf('World');        // 7
str.substring(0, 5);         // "Hello"
str.split(', ');             // ["Hello", "World!"]
str.trim();                  // 去除两端空白
str.replaceAll('World', 'Dart'); // "Hello, Dart!"
str * 2;                     // "Hello, World!Hello, World!"
str.padLeft(20, '-');        // "-------Hello, World!"

// 字符串插值
final name = 'Alice';
final greeting = 'Hello, $name!';
```

```python
# Python
s = 'Hello, World!'

len(s)                       # 13
s.upper()                    # "HELLO, WORLD!"
s.lower()                    # "hello, world!"
'World' in s                 # True
s.startswith('Hello')        # True
s.endswith('!')              # True
s.find('World')              # 7
s[0:5]                       # "Hello"
s.split(', ')                # ["Hello", "World!"]
s.strip()                    # 去除两端空白
s.replace('World', 'Python') # "Hello, Python!"
s * 2                        # "Hello, World!Hello, World!"
s.zfill(20)                  # "0000000Hello, World!"

# f-string 格式化
name = 'Alice'
greeting = f'Hello, {name}!'
```

---

## 九、高频面试题

### 9.1 JS 和 Dart 的异步模型有什么异同？

```
相同点：
  • 都使用事件循环（Event Loop）
  • 都支持 async/await 语法
  • 都是单线程（Dart 用 Isolate 实现并行）
  • Future/Promise 都是微任务

差异点：
  • JS 的 Promise 有三种状态（pending/fulfilled/rejected）
  • Dart 的 Future 也有类似状态，但 API 不同
  • JS 用 Promise.all() 并行执行
  • Dart 用 Future.wait() 并行执行
  • Dart 有 Isolate（内存隔离的并行单元）
  • JS 有 Web Worker（消息传递的并行单元）
```

### 9.2 Python 的 GIL 是什么？它对多线程有什么影响？

```
GIL（Global Interpreter Lock）：
  • Python 解释器中的全局锁
  • 同一时刻只有一个线程执行 Python 字节码
  • 目的：保护 Python 内部对象（如引用计数）的线程安全

影响：
  • CPU 密集型任务 → 多线程无法利用多核（假并行）
  • I/O 密集型任务 → 多线程有效（I/O 等待时释放 GIL）

解决方案：
  • CPU 密集型 → multiprocessing（多进程）
  • I/O 密集型 → asyncio（协程）或 threading
  • 使用 C 扩展释放 GIL（如 NumPy）
```

### 9.3 三大语言的内存管理有什么区别？

```
JavaScript（V8）：
  • 分代 GC（新生代 + 老年代）
  • 标记-清除 + 标记-整理
  • STW 暂停（Stop-The-World）
  • 无法手动释放内存

Dart：
  • 分代 GC（与 JS 类似）
  • 新生代用 Scavenge（复制算法）
  • 老年代用标记-清除
  • 无法手动释放内存

Python：
  • 引用计数（主要）+ 分代 GC（辅助）
  • 引用计数 → 即时回收（无暂停）
  • 分代 GC → 处理循环引用
  • 可以手动调用 gc.collect()
```

---

## 参考资料

- [JavaScript MDN 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Dart 官方文档](https://dart.dev/guides)
- [Python 官方文档](https://docs.python.org/3/)
- [V8 GC 详解](https://v8.dev/blog/trash-talk)
- [Dart Isolate 详解](https://dart.dev/language/concurrency)
- [Python GIL 详解](https://docs.python.org/3/glossary.html#term-global-interpreter-lock)
