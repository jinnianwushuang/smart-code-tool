---
title: 'Flutter 与原生交互 [P8]'
level: 'architect'
tags: ['Flutter', 'Platform Channel', 'FFI', '混合栈']
difficulty: 'expert'
target: '架构师（P8）'
---

# Flutter 与原生交互 [P8]

> Flutter 不是万能的，实际项目中必然需要与原生平台交互。Platform Channel、FFI、Add-to-App 是三种核心交互方式，混合栈架构是大型项目的关键架构决策。

## 核心概念（What）

### 三种原生交互方式

```
┌─────────────────────────────────────────────┐
│              Flutter (Dart)                  │
│                                              │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐ │
│  │Platform      │ │  FFI     │ │  REST    │ │
│  │Channel       │ │          │ │  API     │ │
│  └──────┬───────┘ └────┬─────┘ └────┬─────┘ │
└─────────┼──────────────┼────────────┼───────┘
          │              │            │
          ▼              ▼            ▼
┌─────────────────────────────────────────────┐
│              原生平台                         │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐ │
│  │MethodChannel │ │ C/C++    │ │ 后端     │ │
│  │EventChannel  │ │ Library  │ │ 服务     │ │
│  │BasicChannel  │ │          │ │          │ │
│  └──────────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────┘
```

### FFI vs MethodChannel 选型对比

| 维度         | MethodChannel 📞                          | Flutter FFI ⚡                                         |
| ------------ | ----------------------------------------- | ------------------------------------------------------ |
| **通信机制** | 基于消息传递（序列化/反序列化），异步通信 | 基于内存共享（直接指针操作），同步/异步皆可            |
| **性能损耗** | 数据量大或频繁调用时，序列化开销极大      | 几乎零开销，接近原生 C/C++ 调用速度                    |
| **调用链**   | Dart → Java/OC → C++（绕远路）            | Dart → C++/Rust（直达底层）                            |
| **适用场景** | 调用手机系统 API（相机、GPS、电池电量）   | 高性能计算（音视频解码、图像处理、加密算法、游戏引擎） |
| **复杂度**   | 低（标准 API）                            | 高（需管理内存、编写 C 接口）                          |

---

## 一、Platform Channel

### 底层原理：消息编解码与线程模型

```
Platform Channel 底层架构：

[Dart 层] ──► BinaryMessenger ──► [Platform Channel] ──► [原生层]
        │                                              │
        └─ Dart UI 线程                                ├─ iOS: Main Thread
                                                       └─ Android: Main Thread

消息编解码流程：

[Dart 调用 channel.invokeMethod('getBattery')]
        ↓
[MethodChannel 编码]
        ├─ 默认编解码器：StandardMethodCodec
        │   └─ 将方法名 + 参数序列化为二进制
        ├─ 支持 JSON / 自定义编解码器
        └─ 输出：BinaryMessage (Uint8List)
        ↓
[BinaryMessenger 发送]
        ├─ 通过 Flutter Engine 的 Platform Thread 传递
        └─ 异步消息（不阻塞 Dart UI 线程）
        ↓
[原生层接收]
        ├─ iOS: FlutterBinaryMessenger → FlutterMethodChannel
        └─ Android: BinaryMessenger → MethodChannel
        ↓
[原生层解码] → [执行原生方法] → [结果编码并返回] → [Dart 层解码] ──► Future 完成

线程模型关键点：
├─ Dart 端：调用在 UI 线程，结果通过 Future 返回
├─ 原生端：方法调用在主线程执行
├─ 耗时操作必须在原生端开子线程
└─ 大量数据传输建议用 BasicMessageChannel + 自定义编解码
```

### 代码示例

```dart
// ── 三种 Channel 类型 ──

// 1. MethodChannel：一次性调用（Dart ↔ 原生）

// Dart 端
final channel = MethodChannel('com.example/battery');
final batteryLevel = await channel.invokeMethod<int>('getBatteryLevel');

// iOS 端（Swift）
let channel = FlutterMethodChannel(name: "com.example/battery", binaryMessenger: messenger)
channel.setMethodCallHandler { (call, result) in
  if call.method == "getBatteryLevel" {
    let level = UIDevice.current.batteryLevel
    result(Int(level * 100))
  } else {
    result(FlutterMethodNotImplemented)
  }
}

// Android 端（Kotlin）
val channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example/battery")
channel.setMethodCallHandler { call, result ->
  if (call.method == "getBatteryLevel") {
    val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    result.success(level)
  } else {
    result.notImplemented()
  }
}

// 2. EventChannel：持续数据流（原生 → Dart），适用于传感器数据、网络状态变化等
// 3. BasicMessageChannel：自定义编解码的消息传递
```

---

## 二、FFI（Foreign Function Interface）

### 底层原理：内存共享与零拷贝调用

```
FFI 底层架构：

[Dart 代码] ──► dart:ffi ──► [C/C++ 函数]
        │
        ├─ 无需序列化/反序列化（零拷贝）
        ├─ 直接操作内存指针
        └─ 性能接近原生调用

FFI 调用流程：

[dylib.lookupFunction<NativeAdd, DartAdd>('add')]
        ↓
[Dart VM 查找动态库中的符号地址]
        ├─ dlopen() 加载动态库
        └─ dlsym() 查找函数指针
        ↓
[生成 Dart 函数包装器]
        └─ 将 C 函数签名映射为 Dart 函数签名
        ↓
[调用 add(1, 2)]
        ├─ Dart 参数转换为 C 类型（int → int32_t）
        ├─ 直接跳转到 C 函数地址执行
        └─ C 返回值转换为 Dart 类型

性能对比：
┌─────────────────┬─────────────────┬─────────────────┐
│                 │ Platform Channel │      FFI        │
├─────────────────┼─────────────────┼─────────────────┤
│ 序列化开销       │ ✅ 有            │ ❌ 无            │
│ 线程切换         │ ✅ 有            │ ❌ 无            │
│ 调用延迟         │ ~0.1ms          │ ~0.001ms         │
└─────────────────┴─────────────────┴─────────────────┘
```

### dart:ffi 三个核心实体

| 实体             | 职责                                                       |
| ---------------- | ---------------------------------------------------------- |
| `Pointer<T>`     | 代表 C 的内存地址，通过指针直接读写 C 的内存               |
| `DynamicLibrary` | 运行时加载原生库文件（`.so` / `.dylib` / `.dll`）          |
| 类型映射         | C 类型与 Dart 类型不能直接混用，需通过 `dart:ffi` 声明映射 |

**常用类型映射**：

| C 类型             | Dart (dart:ffi)    | Dart 业务类型                |
| ------------------ | ------------------ | ---------------------------- |
| `int32_t`          | `Int32`            | `int`                        |
| `float` / `double` | `Float` / `Double` | `double`                     |
| `char*`            | `Pointer<Utf8>`    | `String`（需 `package:ffi`） |
| `void*`            | `Pointer<Void>`    | —                            |

### 代码示例

```dart
import 'dart:ffi';
import 'package:ffi/ffi.dart';

// ── 1. 加载动态库 ──
// .so (Android/Linux)  .dylib (macOS/iOS)  .dll (Windows)
final dylib = DynamicLibrary.open('libmylib.so');

// ── 2. 定义函数签名（Native 类型 ↔ Dart 类型映射）──
typedef NativeAdd = Int32 Function(Int32 a, Int32 b);
typedef DartAdd = int Function(int a, int b);

// ── 3. 查找并绑定函数 ──
final add = dylib.lookupFunction<NativeAdd, DartAdd>('add');

// ── 4. 调用 ──
final result = add(1, 2); // 3
```

---

## 三、Add-to-App 与混合栈

### Add-to-App 底层：多引擎架构

```
Add-to-App 底层架构：

[原生应用]
        │
        ├─ FlutterEngineGroup（引擎组，共享资源）
        │   ├─ Engine 1 → FlutterActivity/ViewController
        │   └─ Engine 2 → 另一个 Flutter 页面
        │
        └─ 每个 FlutterEngine 独立的：
            ├─ Dart Isolate（独立内存堆）
            ├─ Render Tree
            └─ Platform Channel 实例

引擎管理策略：
├─ 单引擎：简单场景，整个应用都是 Flutter
├─ 多引擎：混合栈场景，原生和 Flutter 页面交替
└─ 引擎预热：在原生侧提前创建 FlutterEngine，减少首帧延迟

内存管理：
├─ 每个 FlutterEngine 占用 ~30-50MB 内存
├─ FlutterEngineGroup 共享资源可减少 ~50% 内存
└─ 引擎销毁后内存不会立即释放（GC 延迟）
```

```
Add-to-App 嵌入示意：

┌─────────────────────────────────────────┐
│           原生应用（iOS/Android）         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  原生页面 A                         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Flutter 模块                       │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │  FlutterActivity/Controller  │  │  │
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │  Flutter 页面           │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  原生页面 B                         │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 混合栈架构

```
FlutterBoost / Thrio 等混合栈方案：

核心问题：
- Flutter 和原生的导航栈是独立的
- 如何在两个栈之间保持一致？

解决方案：
1. 原生栈为主，Flutter 作为页面嵌入
2. 统一导航管理器，同时管理两个栈
3. 通过 Channel 同步栈状态

┌─────────────────────────────────────────┐
│           统一导航管理器                  │
│                                          │
│  原生栈:  [A] → [B] → [Flutter] → [D]  │
│                                          │
│  Flutter 栈: [F1] → [F2] → [F3]        │
│                                          │
│  当从 F3 返回到 B 时：                   │
│  1. 关闭 Flutter 容器                    │
│  2. 原生栈 pop Flutter Activity          │
│  3. 回到 B 页面                          │
└─────────────────────────────────────────┘
```

---

## 实战应用：相机集成

```dart
// 使用 Platform Channel 集成原生相机

// ── Dart 端 ──
class CameraService {
  static const _channel = MethodChannel('com.example/camera');

  Future<String?> takePhoto() async {
    try {
      final path = await _channel.invokeMethod<String>('takePhoto');
      return path;
    } on PlatformException catch (e) {
      print('Camera error: ${e.message}');
      return null;
    }
  }
}

// ── iOS 端（Swift）──
class CameraHandler: NSObject, FlutterPlugin {
  static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "com.example/camera", binaryMessenger: registrar.messenger())
    let instance = CameraHandler()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {
    case "takePhoto":
      presentCamera(result: result)
    default:
      result(FlutterMethodNotImplemented)
    }
  }
}
```

---

## 高频面试题

### Q1: Platform Channel 的通信机制是什么？

**参考答案要点**：

- 基于消息传递，Dart 和原生通过 Channel 通信
- 数据需要序列化（StandardMessageCodec）
- MethodChannel：请求-响应模式
- EventChannel：持续数据流（原生 → Dart）
- 通信是异步的，不阻塞 UI 线程

### Q2: FFI 和 Platform Channel 有什么区别？

**参考答案要点**：

- FFI：直接调用 C/C++ 函数，零序列化开销，无线程切换
- Channel：需要序列化，有性能开销，涉及线程切换
- FFI 适合高频调用（如音视频处理），Channel 适合低频平台 API 调用（如相机、GPS）
- FFI 需要编写 C 接口和管理内存，Channel 使用标准原生 API

### Q3: Add-to-App 的混合栈如何管理？

**参考答案要点**：

- Flutter 和原生的导航栈独立，需要统一导航管理器同步两个栈
- FlutterBoost 等方案通过 Channel 同步栈状态
- 关键挑战：返回键行为、页面转场动画、内存管理
- 引擎预热是优化首帧延迟的关键手段

---

## 延伸思考

1. **设计题**：设计一个支持 Flutter 和原生混合导航的大型 App 架构。
2. **场景题**：一个已有 5 年历史的原生 App 如何渐进式引入 Flutter？
3. **对比题**：FlutterBoost vs Thrio vs 官方 Add-to-App，各自的 trade-off？

---

## 参考资料

- [Flutter Platform Channels](https://docs.flutter.dev/platform-integration/platform-channels)
- [Flutter FFI 文档](https://docs.flutter.dev/platform-integration/c-interop)
- [Add-to-App 指南](https://docs.flutter.dev/add-to-app)
- [FlutterBoost](https://github.com/alibaba/flutter_boost)
