---
title: 'Dart Future/Stream/Isolate 异步调度拆解'
tags: ['案例']
---
# Dart Future/Stream/Isolate 异步调度典型拆解

> 本文档从 Dart 的 Event Loop 出发，逐步拆解 Future、Stream、Isolate 三大异步机制的核心原理，
> 涵盖微任务/宏任务调度顺序、Stream 背压控制、Isolate 内存隔离模型等 Flutter 高频考点。

---

## 一、Dart Event Loop 核心机制

### 1.1 单线程调度模型

```
┌─────────────────────────────────────────────────────────────┐
│                    Dart Event Loop                            │
│                                                              │
│  ① 执行当前宏任务（同步代码）                                │
│  ② 清空微任务队列（全部执行完）                              │
│  ③ 检查是否有待处理的宏任务                                  │
│  ④ 取下一个宏任务（Timer/IO/事件）                           │
│  ⑤ 重复 ① → ④                                              │
└─────────────────────────────────────────────────────────────┘

宏任务（Event）                微任务（Microtask）
├── Timer (setTimeout)         ├── Future.microtask
├── I/O 回调                   ├── scheduleMicrotask
├── 平台通道回调               ├── Future.then（链式）
├── UI 事件（点击/滑动）       └── Zone 内的微任务
├── Stream 事件
└── requestAnimationFrame（Flutter VSync）
```

### 1.2 核心规则

| 规则                     | 说明                                             |
| ------------------------ | ------------------------------------------------ |
| 微任务优先               | 每个宏任务执行完后，**必须**清空所有微任务       |
| 微任务中产生的微任务     | 同一轮内继续执行（但有深度限制）                 |
| 宏任务每次一个           | 每轮 Event Loop 只执行**一个**宏任务             |
| Future 默认是宏任务      | `Future.delayed` / `Future(() {})` 都是宏任务    |
| `Future.microtask`       | 显式创建微任务（类似 JS 的 `queueMicrotask`）    |

---

## 二、Future — 单次异步值

### 2.1 Future 的三种创建方式

```dart
// 方式 1：Future 构造器（宏任务）
Future(() {
  print('宏任务：下一轮 Event Loop 执行');
});

// 方式 2：Future.delayed（宏任务 + 延迟）
Future.delayed(Duration(seconds: 1), () {
  print('宏任务：1 秒后执行');
});

// 方式 3：Future.microtask（微任务）
Future.microtask(() {
  print('微任务：当前宏任务结束后立即执行');
});

// 方式 4：async 函数（返回 Future）
Future<int> fetchData() async {
  return 42;  // 自动包装为 Future.value(42)
}
```

### 2.2 经典面试题：输出顺序

```dart
void main() {
  print('1 - 同步');

  Future(() {
    print('2 - 宏任务');
  });

  Future.microtask(() {
    print('3 - 微任务');
  });

  Future.delayed(Duration(seconds: 1), () {
    print('4 - 延迟宏任务');
  });

  scheduleMicrotask(() {
    print('5 - 微任务 2');
  });

  print('6 - 同步结束');
}

// 输出顺序：
// 1 - 同步
// 6 - 同步结束
// 3 - 微任务（Future.microtask）
// 5 - 微任务 2（scheduleMicrotask）
// 2 - 宏任务（Future 构造器）
// 4 - 延迟宏任务（1 秒后）
```

### 2.3 Future 链式调用

```dart
fetchData()
  .then((value) {
    print('成功：$value');
    return value * 2;  // 返回新 Future
  })
  .then((value) {
    print('翻倍：$value');
  })
  .catchError((error) {
    print('错误：$error');
  })
  .whenComplete(() {
    print('完成（无论成功失败）');
  });

// 等价于 async/await
try {
  final value = await fetchData();
  print('成功：$value');
  final doubled = value * 2;
  print('翻倍：$doubled');
} catch (error) {
  print('错误：$error');
} finally {
  print('完成（无论成功失败）');
}
```

### 2.4 Future 与 JS Promise 的对照

| 维度             | JS Promise                    | Dart Future                    |
| ---------------- | ----------------------------- | ------------------------------ |
| 创建             | `new Promise()`               | `Future()` / `Future.value()`  |
| 微任务           | `Promise.resolve().then()`    | `Future.microtask()`           |
| 链式调用         | `.then().catch()`             | `.then().catchError()`         |
| 并行执行         | `Promise.all()`               | `Future.wait()`                |
| 竞争             | `Promise.race()`              | `Future.any()`                 |
| async/await      | ✅ 支持                       | ✅ 支持                        |
| 取消             | ❌ 不支持（需 AbortController）| ❌ 不支持                      |

---

## 三、Stream — 多次异步值流

### 3.1 Stream 的两种类型

```dart
// 单订阅 Stream（默认）：只能有一个监听器
final singleStream = Stream.fromIterable([1, 2, 3]);

singleStream.listen((data) {
  print(data);
});
// singleStream.listen(...);  // ❌ 报错：Stream 已被监听

// 多订阅 Stream（广播）：可以有多个监听器
final broadcastStream = StreamController.broadcast();

broadcastStream.stream.listen((data) => print('监听 1: $data'));
broadcastStream.stream.listen((data) => print('监听 2: $data'));

broadcastStream.add(1);  // 两个监听器都收到
```

### 3.2 Stream 的常用构造方式

```dart
// 1. 从 Iterable 创建
Stream.fromIterable([1, 2, 3]);

// 2. 定时发射
Stream.periodic(Duration(seconds: 1), (count) => count);

// 3. StreamController（最灵活）
final controller = StreamController<int>();
controller.add(1);
controller.add(2);
controller.close();

// 4. async* 生成器（类似 JS async function*）
Stream<int> countStream() async* {
  for (int i = 0; i < 3; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;  // 发射值
  }
}
```

### 3.3 Stream 背压控制

```dart
// 问题场景：生产者快于消费者
final controller = StreamController<int>();

// 生产者：每秒发射 100 个值
Timer.periodic(Duration(seconds: 1), (_) {
  for (int i = 0; i < 100; i++) {
    controller.add(i);  // 快速发射
  }
});

// 消费者：每 10 秒处理一个值
controller.stream.listen((data) {
  Future.delayed(Duration(seconds: 10), () {
    print('处理：$data');
  });
});

// 问题：缓冲区无限增长 → 内存溢出

// ✅ 解决方案：暂停/恢复
final subscription = controller.stream.listen((data) {
  subscription.pause();  // 暂停接收
  processData(data).then((_) {
    subscription.resume();  // 处理完恢复
  });
});
```

### 3.4 Stream 与 JS AsyncIterator 的对照

| 维度         | JS AsyncIterator              | Dart Stream                    |
| ------------ | ----------------------------- | ------------------------------ |
| 创建         | `async function*`             | `async*` / `StreamController`  |
| 发射值       | `yield value`                 | `yield value` / `add(value)`   |
| 消费         | `for await (const x of s)`    | `await for (var x in s)`       |
| 背压         | ❌ 无（需手动实现）           | ✅ 内置（pause/resume）        |
| 多订阅       | ❌ 不支持                     | ✅ `broadcast()`               |
| 转换         | 手动 map/filter               | `.map().where().take()`        |

---

## 四、Isolate — 真正的并行计算

### 4.1 Isolate 内存隔离模型

```
┌─────────────────────────────────────────────────────────────┐
│                    Dart 内存模型                               │
│                                                              │
│  Main Isolate（主线程）                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Heap（堆）                                          │    │
│  │  ├── Widget 树                                       │    │
│  │  ├── GetX Controller                                 │    │
│  │  └── 所有 UI 状态                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Worker Isolate（后台线程）                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  独立 Heap（堆）                                     │    │
│  │  ├── 不能访问主 Isolate 的对象                       │    │
│  │  ├── 只能传递可序列化数据                            │    │
│  │  └── 计算完成后通过 SendPort 返回结果                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  通信方式：SendPort / ReceivePort（消息传递）                │
│  数据传递：深拷贝（或 TransferableTypedData 零拷贝）         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Isolate 基本用法

```dart
import 'dart:isolate';

// 方式 1：Isolate.run（Dart 2.19+，推荐）
Future<int> heavyComputation() async {
  final result = await Isolate.run(() {
    // 在独立 Isolate 中执行
    int sum = 0;
    for (int i = 0; i < 1000000000; i++) {
      sum += i;
    }
    return sum;  // 返回结果（自动序列化传回）
  });
  return result;
}

// 方式 2：Isolate.spawn（更灵活，支持双向通信）
Future<void> communicateWithIsolate() async {
  final receivePort = ReceivePort();
  
  await Isolate.spawn((SendPort sendPort) {
    // 后台 Isolate
    sendPort.send('准备就绪');
    
    final receivePort = ReceivePort();
    sendPort.send(receivePort.sendPort);
    
    receivePort.listen((message) {
      if (message == '计算') {
        sendPort.send(42);
      }
    });
  }, receivePort.sendPort);
  
  final sendPort = await receivePort.first;
  sendPort.send('计算');
  final result = await receivePort.first;
  print('结果：$result');
}
```

### 4.3 Isolate 在 Flutter 中的应用场景

```dart
// ❌ 错误：在主 Isolate 做 CPU 密集计算 → UI 卡顿
class MyController extends GetxController {
  final data = <int>[].obs;

  Future<void> loadData() async {
    // 阻塞主线程 5 秒 → 动画卡死
    final result = heavyComputation();
    data.value = result;
  }
}

// ✅ 正确：用 Isolate 做 CPU 密集计算
class MyController extends GetxController {
  final data = <int>[].obs;

  Future<void> loadData() async {
    // 在后台 Isolate 计算 → 主线程不阻塞
    final result = await Isolate.run(() {
      return heavyComputation();
    });
    data.value = result;  // 回到主 Isolate 更新 UI
  }
}
```

### 4.4 Isolate 与 JS Web Worker 的对照

| 维度         | JS Web Worker               | Dart Isolate                   |
| ------------ | --------------------------- | ------------------------------ |
| 创建         | `new Worker('worker.js')`   | `Isolate.run()` / `spawn()`    |
| 通信         | `postMessage` / `onmessage` | `SendPort` / `ReceivePort`     |
| 内存         | 独立堆（结构化克隆）        | 独立堆（深拷贝）               |
| 零拷贝       | `Transferable`（ArrayBuffer）| `TransferableTypedData`       |
| 共享内存     | ❌ 不支持                   | ❌ 不支持                      |
| 终止         | `worker.terminate()`        | `isolate.kill()`               |
| 适用场景     | CPU 密集计算                | CPU 密集计算                   |

---

## 五、Flutter 中的 Event Loop 特殊机制

### 5.1 VSync 帧调度

```dart
// Flutter 的渲染与 VSync 同步
class FrameCallback extends StatefulWidget {
  @override
  State<FrameCallback> createState() => _FrameCallbackState();
}

class _FrameCallbackState extends State<FrameCallback> {
  @override
  void initState() {
    super.initState();
    
    // 注册帧回调（在每帧渲染前执行）
    WidgetsBinding.instance.addPostFrameCallback((_) {
      print('帧渲染完成');
    });
    
    // 注册持久帧回调（每帧都执行）
    WidgetsBinding.instance.addPersistentFrameCallback((_) {
      // 动画等场景
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

### 5.2 Flutter 帧管线时序

```
VSync 信号到来
│
├── ① Animation 阶段
│   └── 执行所有 AnimationController 的 tick
│
├── ② Build 阶段
│   └── 重建 dirty Element
│   └── 调用 build() → 新 Widget 树
│
├── ③ Layout 阶段
│   └── 计算所有需要布局的 RenderObject 的尺寸和位置
│
├── ④ Paint 阶段
│   └── 生成 Layer 树（绘制指令）
│
├── ⑤ Composite 阶段
│   └── Layer 树提交给引擎
│
└── ⑥ Rasterize 阶段（引擎线程）
    └── GPU 光栅化 → 屏幕像素
```

### 5.3 Future.delayed vs Timer vs VSync

```dart
// 方式 1：Future.delayed（不精确，受 Event Loop 影响）
Future.delayed(Duration(milliseconds: 16), () {
  // 大约 16ms 后执行，但不保证与帧同步
});

// 方式 2：Timer（同上）
Timer(Duration(milliseconds: 16), () {
  // 大约 16ms 后执行
});

// 方式 3：VSync 同步（精确，与帧同步）
final controller = AnimationController(
  vsync: this,
  duration: Duration(milliseconds: 16),
);
controller.forward();  // 与屏幕刷新率同步
```

---

## 六、高频面试题

### 6.1 Future 和 Timer 有什么区别？

```dart
// Future.delayed：返回 Future，可以 await
await Future.delayed(Duration(seconds: 1));
print('1 秒后');

// Timer：不返回 Future，不能 await
Timer(Duration(seconds: 1), () {
  print('1 秒后');
});

// 本质区别：
// Future.delayed 内部用 Timer 实现，但包装成了 Future
// → 可以链式调用 .then() / await
// Timer 是底层的宏任务调度器
```

### 6.2 为什么 Flutter 主线程不能做 CPU 密集计算？

```
Dart 是单线程模型（主 Isolate）：
  - UI 渲染、手势处理、动画都在主 Isolate
  - CPU 密集计算会阻塞 Event Loop
  - → 帧超时（>16ms）→ 掉帧 → 动画卡顿

解决方案：
  - 用 Isolate 把计算推到后台线程
  - 主 Isolate 只负责 UI 渲染
  - Isolate 间通过消息传递通信

性能阈值：
  - < 1ms：可以直接在主 Isolate 做
  - 1-16ms：考虑优化算法
  - > 16ms：必须用 Isolate
```

### 6.3 Stream 和 EventChannel 有什么关系？

```dart
// EventChannel 是 Flutter 平台通道的 Stream 封装
const platform = MethodChannel('com.example/channel');

// 接收平台（Android/iOS）的持续数据流
final eventChannel = EventChannel('com.example/events');

eventChannel.receiveBroadcastStream().listen((event) {
  print('平台事件：$event');
});

// 本质：
// EventChannel 内部用 StreamController 封装
// 平台回调 → StreamController.add() → Stream 发射
// → Flutter 主 Isolate 的 Event Loop 处理
```

---

## 七、与浏览器 JS 调度的对照

```
┌─────────────────────────────────────────────────────────────┐
│                  浏览器 JS vs Dart 调度对照                    │
│                                                              │
│  浏览器 JS                     Dart (Flutter)                │
│  ─────────                     ──────────────                │
│                                                              │
│  Event Loop                    Event Loop                    │
│  ├── 宏任务每次一个            ├── 宏任务每次一个            │
│  └── 微任务全部清空            └── 微任务全部清空            │
│                                                              │
│  宏任务                        宏任务                        │
│  ├── setTimeout                ├── Timer / Future.delayed    │
│  ├── I/O 回调                  ├── I/O 回调                  │
│  └── requestAnimationFrame     └── VSync 帧回调              │
│                                                              │
│  微任务                        微任务                        │
│  ├── Promise.then              ├── Future.then               │
│  ├── queueMicrotask            ├── Future.microtask          │
│  └── MutationObserver          └── scheduleMicrotask         │
│                                                              │
│  并行计算                      并行计算                      │
│  └── Web Worker                └── Isolate                   │
│      ├── 独立堆                    ├── 独立堆                │
│      ├── postMessage               └── SendPort/ReceivePort│
│      └── Transferable                └── TransferableTypedData│
│                                                              │
│  多次异步值                    多次异步值                    │
│  └── AsyncIterator             └── Stream                    │
│      ├── async function*           ├── async*                │
│      └── for await                 └── await for             │
│                                                              │
│  ════════════════════════════════════════════════════        │
│                                                              │
│  本质相同：都是单线程 Event Loop + 微任务/宏任务调度         │
│  差异：Dart 有 Isolate（真正的多线程并行），JS 只有 Worker   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
