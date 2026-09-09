---
title: "Flutter 与原生交互 [P8]"
level: "architect"
tags: ["Flutter", "Platform Channel", "FFI", "混合栈"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
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

---

## 底层原理（Why）

### 1. Platform Channel 机制

```dart
// 三种 Channel 类型：

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

// 2. EventChannel：持续数据流（原生 → Dart）
// 适用于传感器数据、网络状态变化等

// 3. BasicMessageChannel：自定义编解码的消息传递
```

### 2. FFI（Foreign Function Interface）

```dart
// FFI 允许 Dart 直接调用 C/C++ 函数
// 适用于高性能计算、已有 C/C++ 库集成

import 'dart:ffi';
import 'package:ffi/ffi.dart';

// 1. 加载动态库
final dylib = DynamicLibrary.open('libmylib.so');

// 2. 定义函数签名
typedef NativeAdd = Int32 Function(Int32 a, Int32 b);
typedef DartAdd = int Function(int a, int b);

// 3. 查找并绑定函数
final add = dylib.lookupFunction<NativeAdd, DartAdd>('add');

// 4. 调用
final result = add(1, 2); // 3

// FFI vs Platform Channel：
// FFI：直接调用，零序列化开销，适合高频调用
// Channel：需要序列化，适合低频的平台 API 调用
```

### 3. Add-to-App 集成

```
Add-to-App：将 Flutter 模块嵌入现有原生应用

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

### 4. 混合栈架构

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

## 实战应用（How）

### 相机集成示例

```dart
// 使用 Platform Channel 集成原生相机

// Dart 端
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

// iOS 端
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
- FFI：直接调用 C/C++ 函数，零序列化开销
- Channel：需要序列化，有性能开销
- FFI 适合高频调用（如音视频处理）
- Channel 适合低频平台 API 调用（如相机、GPS）
- FFI 需要编写 C 接口，Channel 使用原生 API

### Q3: Add-to-App 的混合栈如何管理？

**参考答案要点**：
- Flutter 和原生的导航栈独立
- 需要统一导航管理器同步两个栈
- FlutterBoost 等方案通过 Channel 同步栈状态
- 关键挑战：返回键行为、页面转场动画、内存管理

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
