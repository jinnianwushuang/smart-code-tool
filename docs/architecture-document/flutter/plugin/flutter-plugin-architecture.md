---
title: Flutter 插件开发架构
tags: ['Flutter', '插件']
---

# Flutter 插件开发架构

Flutter 通过 Platform Channel 机制实现 Dart 代码与原生平台（Android/iOS）代码的通信。插件开发是 Flutter 扩展能力的核心——从相机、GPS 到蓝牙、支付，所有原生能力都通过插件暴露给 Dart 层。本文系统梳理插件开发的架构模式与最佳实践。

---

## 一、Platform Channel 通信机制

### 1.1 三种 Channel 类型

```dart
// ① MethodChannel — 一次性方法调用（最常用）
// Dart 调用原生方法，原生返回结果
final channel = MethodChannel('com.example/battery');
final level = await channel.invokeMethod<int>('getBatteryLevel');

// ② EventChannel — 持续事件流
// 原生向 Dart 推送事件（传感器、网络状态等）
final eventChannel = EventChannel('com.example/sensor');
eventChannel.receiveBroadcastStream().listen((data) {
  print('Sensor: $data');
});

// ③ BasicMessageChannel — 自定义消息传递
// 双向消息，支持自定义编解码
final messageChannel = BasicMessageChannel<String>('com.example/chat', StringCodec());
await messageChannel.send('Hello from Dart');
```

### 1.2 通信模型

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Dart (Flutter UI Thread)                       │
│  ┌──────────────┐                               │
│  │ MethodChannel │ ← invokeMethod()             │
│  │ EventChannel  │ ← receiveBroadcastStream()   │
│  │ BasicMessage  │ ← send()                     │
│  └──────┬───────┘                               │
│         │                                       │
│  ───────┼──────────────────────────────────     │
│         │ Platform Channel（消息传递层）          │
│  ───────┼──────────────────────────────────     │
│         │                                       │
│  ┌──────┴───────┐                               │
│  │ Android       │  iOS                         │
│  │ MethodCall    │  FlutterMethodChannel         │
│  │ EventSink     │  FlutterEventChannel          │
│  └──────────────┘                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.3 数据类型映射

| Dart 类型 | Android (Kotlin) | iOS (Swift) |
|---|---|---|
| `null` | `null` | `nil` |
| `bool` | `Boolean` | `Bool` |
| `int` | `Int` / `Long` | `Int` / `Int64` |
| `double` | `Double` | `Double` |
| `String` | `String` | `String` |
| `List<dynamic>` | `ArrayList` | `Array` |
| `Map<dynamic, dynamic>` | `HashMap` | `Dictionary` |
| `Uint8List` | `byte[]` | `FlutterStandardTypedData` |

---

## 二、插件项目结构

### 2.1 标准插件结构

```
my_plugin/
├── lib/                          # Dart 代码
│   ├── my_plugin.dart            # 公开 API
│   └── src/                      # 内部实现
│       └── my_plugin_platform.dart
├── android/                      # Android 原生代码
│   └── src/main/kotlin/
│       └── com/example/my_plugin/
│           └── MyPlugin.kt
├── ios/                          # iOS 原生代码
│   └── Classes/
│       └── MyPlugin.swift
├── test/                         # Dart 单元测试
├── example/                      # 示例 App
│   ├── lib/main.dart
│   ├── android/
│   └── ios/
├── pubspec.yaml                  # 插件配置
└── README.md
```

### 2.2 pubspec.yaml 插件声明

```yaml
# pubspec.yaml
flutter:
  plugin:
    platforms:
      android:
        package: com.example.my_plugin
        pluginClass: MyPlugin
      ios:
        pluginClass: MyPlugin
```

---

## 三、MethodChannel 实现

### 3.1 Dart 侧

```dart
// lib/my_plugin.dart
import 'package:flutter/services.dart';

class MyPlugin {
  static const _channel = MethodChannel('com.example/my_plugin');

  /// 获取电池电量
  static Future<int?> getBatteryLevel() async {
    try {
      final result = await _channel.invokeMethod<int>('getBatteryLevel');
      return result;
    } on PlatformException catch (e) {
      throw Exception('Failed to get battery: ${e.message}');
    }
  }

  /// 显示原生 Toast
  static Future<void> showToast(String message) async {
    await _channel.invokeMethod('showToast', {'message': message});
  }
}
```

### 3.2 Android (Kotlin) 侧

```kotlin
// android/src/main/kotlin/com/example/my_plugin/MyPlugin.kt
class MyPlugin : MethodCallHandler {
  private lateinit var context: Context

  companion object {
    @JvmStatic
    fun registerWith(registrar: PluginRegistry) {
      val channel = MethodChannel(registrar.messenger(), "com.example/my_plugin")
      val plugin = MyPlugin(registrar.context())
      channel.setMethodCallHandler(plugin)
    }
  }

  constructor(context: Context) {
    this.context = context
  }

  override fun onMethodCall(call: MethodCall, result: Result) {
    when (call.method) {
      "getBatteryLevel" -> {
        val batteryLevel = getBatteryLevel()
        result.success(batteryLevel)
      }
      "showToast" -> {
        val message = call.argument<String>("message") ?: ""
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        result.success(null)
      }
      else -> result.notImplemented()
    }
  }

  private fun getBatteryLevel(): Int {
    val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
  }
}
```

### 3.3 iOS (Swift) 侧

```swift
// ios/Classes/MyPlugin.swift
public class MyPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "com.example/my_plugin", binaryMessenger: registrar.messenger())
    let instance = MyPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {
    case "getBatteryLevel":
      let device = UIDevice.current
      device.isBatteryMonitoringEnabled = true
      let level = Int(device.batteryLevel * 100)
      result(level)
    case "showToast":
      // iOS 无原生 Toast，用自定义实现
      result(nil)
    default:
      result(FlutterMethodNotImplemented)
    }
  }
}
```

---

## 四、EventChannel — 持续事件流

### 4.1 Dart 侧

```dart
class SensorPlugin {
  static const _channel = EventChannel('com.example/sensor');

  /// 监听加速度传感器数据
  static Stream<SensorData> get sensorStream {
    return _channel.receiveBroadcastStream().map((event) {
      return SensorData(
        x: (event['x'] as double),
        y: (event['y'] as double),
        z: (event['z'] as double),
      );
    });
  }
}

// 使用
class SensorPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<SensorData>(
      stream: SensorPlugin.sensorStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Text('Waiting...');
        final data = snapshot.data!;
        return Text('X: ${data.x}, Y: ${data.y}, Z: ${data.z}');
      },
    );
  }
}
```

### 4.2 Android (Kotlin) 侧

```kotlin
class SensorPlugin(private val context: Context) : EventChannel.StreamHandler {
  private var sensorManager: SensorManager? = null
  private var accelerometer: Sensor? = null

  override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
    sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    sensorManager?.registerListener(
      object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          events?.success(mapOf(
            "x" to event.values[0],
            "y" to event.values[1],
            "z" to event.values[2],
          ))
        }
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
      },
      accelerometer,
      SensorManager.SENSOR_DELAY_UI
    )
  }

  override fun onCancel(arguments: Any?) {
    sensorManager?.unregisterListener(null)
  }
}
```

---

## 五、FFI — 直接调用 C/C++ 代码

### 5.1 适用场景

Platform Channel 有消息序列化开销，对于高频调用（音频处理、图像变换），FFI 直接调用 C/C++ 性能更好：

```dart
import 'dart:ffi';
import 'package:ffi/ffi.dart';

// 加载动态链接库
final lib = DynamicLibrary.open('libnative_calc.so');

// 绑定 C 函数签名
typedef NativeAdd = Double Function(Double, Double);
typedef DartAdd = double Function(double, double);

final add = lib.lookupFunction<NativeAdd, DartAdd>('native_add');

// 调用
final result = add(3.14, 2.72); // 直接调用，无序列化开销
```

### 5.2 FFI vs Platform Channel

| 维度 | FFI | Platform Channel |
|---|---|---|
| 调用方式 | 直接函数调用 | 消息传递 |
| 性能 | 极高（无序列化） | 中等（JSON 编解码） |
| 适用语言 | C/C++ | Kotlin/Swift/ObjC |
| 适用场景 | 音频/图像处理、加密算法 | 系统 API 调用 |
| 复杂度 | 高（需管理内存） | 低（标准 API） |

---

## 六、插件开发最佳实践

### 6.1 错误处理

```dart
// Dart 侧：统一错误处理
static Future<T?> invoke<T>(String method, [Map? args]) async {
  try {
    return await _channel.invokeMethod<T>(method, args);
  } on PlatformException catch (e) {
    switch (e.code) {
      case 'PERMISSION_DENIED':
        throw PermissionException(e.message);
      case 'NOT_FOUND':
        throw NotFoundException(e.message);
      default:
        throw PluginException(e.code, e.message);
    }
  } on MissingPluginException {
    throw UnsupportedPlatformException('Platform not supported');
  }
}
```

### 6.2 平台适配

```dart
// 使用 federated plugins 支持多平台
// pubspec.yaml
flutter:
  plugin:
    platforms:
      android:
        default_package: my_plugin_android
      ios:
        default_package: my_plugin_ios
      web:
        default_package: my_plugin_web
      linux:
        default_package: my_plugin_linux
```

### 6.3 测试策略

```dart
// 单元测试：Mock Channel
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('getBatteryLevel returns correct value', () async {
    // 设置 Mock
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
        const MethodChannel('com.example/my_plugin'),
        (call) async {
          if (call.method == 'getBatteryLevel') return 75;
          return null;
        },
      );

    final level = await MyPlugin.getBatteryLevel();
    expect(level, 75);
  });
}
```

---

## 七、插件开发速查表

| 主题 | 方案 |
|---|---|
| 一次性方法调用 | `MethodChannel` |
| 持续事件流 | `EventChannel` |
| 高频低延迟调用 | FFI（C/C++） |
| 错误处理 | `PlatformException` 分类处理 |
| 多平台支持 | Federated Plugins |
| 单元测试 | `setMockMethodCallHandler` |
| 数据类型 | Dart ↔ Kotlin ↔ Swift 自动映射 |
| 内存管理 | FFI 需手动 `malloc`/`free` |
