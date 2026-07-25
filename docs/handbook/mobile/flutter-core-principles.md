# Flutter 核心底层原理深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-26  
> **适用对象**: 高级移动端工程师、跨平台架构师、对 Flutter internals 感兴趣的开发者

---

## 📑 目录

- [一、Flutter 架构概览](#一flutter-架构概览)
- [二、三棵树：Widget / Element / RenderObject](#二三棵树widget--element--renderobject)
- [三、渲染管线](#三渲染管线)
- [四、Dart 运行时与编译模型](#四dart-运行时与编译模型)
- [五、Event Loop 与异步模型](#五event-loop-与异步模型)
- [六、状态管理原理](#六状态管理原理)
- [七、Hot Reload 原理](#七hot-reload-原理)
- [八、Platform Channel 平台通信](#八platform-channel-平台通信)
- [九、动画系统原理](#九动画系统原理)
- [十、性能优化机制](#十性能优化机制)

---

## 一、Flutter 架构概览

### 1.1 三层架构

```
┌─────────────────────────────────────────────┐
│              Framework (Dart)                │
│  Material / Cupertino / Widgets / Rendering │
│  Animation / Painting / Gestures            │
├─────────────────────────────────────────────┤
│              Engine (C++)                    │
│  Skia / Impeller · Dart Runtime · Text      │
│  Network I/O · Plugin Architecture          │
├─────────────────────────────────────────────┤
│              Embedder (平台相关)              │
│  Android (Java/C++) · iOS (ObjC/C++)        │
│  Windows / macOS / Linux / Web              │
└─────────────────────────────────────────────┘
```

| 层级 | 语言 | 职责 |
| ---- | ---- | ---- |
| Framework | Dart | Widget 系统、布局、手势、动画等上层抽象 |
| Engine | C++ | 图形绘制（Skia/Impeller）、Dart VM、文本排版 |
| Embedder | 平台语言 | 线程管理、生命周期、平台插件桥接 |

### 1.2 线程模型

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Platform     │  │ UI (Dart)    │  │ Raster (GPU) │  │ I/O          │
│ Thread       │  │ Thread       │  │ Thread       │  │ Thread       │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ 原生事件分发  │  │ Widget build │  │ Layer Tree   │  │ 图片解码      │
│ 插件回调      │  │ Layout       │  │ 光栅化       │  │ 文件读写      │
│ 生命周期      │  │ Paint 指令   │  │ GPU 提交     │  │ 网络预处理    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**关键流程**：

1. UI 线程构建 Layer Tree，交给 Raster 线程
2. Raster 线程通过 Skia/Impeller 将 Layer 光栅化为 GPU 纹理
3. Platform 线程负责原生事件（触摸、生命周期）转发到 UI 线程
4. I/O 线程执行耗时操作（如图片解码），避免阻塞 UI 线程

### 1.3 自绘引擎 vs 桥接方案

| 维度 | Flutter (自绘) | React Native (桥接) |
| ---- | -------------- | ------------------- |
| 渲染方式 | 直接调用 Skia/Impeller 绘制 | 映射到原生控件 |
| 一致性 | 全平台像素级一致 | 依赖平台控件行为 |
| 性能瓶颈 | GPU 光栅化 | JS-Native 桥通信 |
| 平台特性 | 需 Platform Channel | 天然支持 |

---

## 二、三棵树：Widget / Element / RenderObject

### 2.1 三棵树职责

```
Widget Tree          Element Tree           RenderObject Tree
(配置描述)           (上下文/桥梁)           (布局绘制实体)

Container            StatefulElement        RenderDecoratedBox
├── Padding          ├── SingleChild...     ├── RenderPadding
│   └── Text         │   └── Stateless...   │   └── RenderParagraph
└── GestureDetector  └── ...                └── ...
```

| 树 | 特点 | 生命周期 |
| -- | ---- | -------- |
| Widget | 不可变配置描述（蓝图），轻量 | 每次 build 全部重建 |
| Element | Widget 的实例化上下文，管理生命周期 | 长期存在，增量更新 |
| RenderObject | 实际执行布局/绘制的重量级对象 | 长期存在，复用 |

### 2.2 Element 的复用机制

```dart
// Widget 重建时，Element 通过 key + runtimeType 判断是否复用
class CounterPage extends StatefulWidget { ... }

// 场景：setState 触发 rebuild
// 1. 新的 Widget 树被创建（轻量，仅配置对象）
// 2. Element 对比新旧 Widget：
//    - runtimeType 相同 && key 相同 → 复用 Element，更新配置
//    - 不同 → 销毁旧 Element，创建新 Element
// 3. RenderObject 同理复用，避免昂贵的重建
```

**对比流程图**：

```
setState() / 父级 rebuild
    ↓
创建新 Widget 树（O(n)，轻量）
    ↓
Element.updateChild() 逐层对比
    ↓
┌─────────────────────────────────────┐
│ runtimeType == old.runtimeType      │
│ && key == old.key                   │
│   → YES: element.update(newWidget)  │  ← 复用，仅更新配置
│   → NO:  element.unmount()          │  ← 销毁重建
│          element.inflateWidget()    │
└─────────────────────────────────────┘
    ↓
RenderObject 标记 dirty
    ↓
下一帧执行 layout + paint
```

### 2.3 Key 的作用

```dart
// 无 Key：Element 按位置匹配，列表插入/删除导致错位复用
Row(
  children: [CardA, CardB],  // 删除 CardA 后
  children: [CardB],         // Element[0] 错误复用给 CardB
)

// 有 Key：按 Key 精确匹配
Row(
  children: [
    Card(key: ValueKey('a')),
    Card(key: ValueKey('b')),
  ],
)

// GlobalKey：跨父级保持 State
final formKey = GlobalKey<FormState>();
Form(key: formKey, child: ...);
formKey.currentState?.validate();
```

| Key 类型 | 用途 |
| -------- | ---- |
| ValueKey | 按值匹配（ID、字符串） |
| ObjectKey | 按对象引用匹配 |
| UniqueKey | 每次创建新实例，强制重建 |
| GlobalKey | 全局唯一，跨树访问 State/RenderObject |

### 2.4 BuildContext 本质

```dart
// BuildContext 就是 Element 的抽象接口
abstract class BuildContext {
  Widget get widget;               // 当前关联的 Widget
  InheritedWidget dependOnInheritedWidgetOfExactType<T>();
  void visitChildElements(ElementVisitor visitor);
}

// context.read<T>() / Theme.of(context) 本质：
// 沿 Element 树向上查找最近的 InheritedElement
Theme.of(context)
  → context.dependOnInheritedWidgetOfExactType<_InheritedTheme>()
  → 沿父链查找，注册依赖关系
  → InheritedWidget 更新时，通知所有依赖者 rebuild
```

---

## 三、渲染管线

### 3.1 完整渲染流程

```
用户输入 / setState
    ↓
① Build Phase（构建阶段）
    Widget.build() → 生成新 Widget 树
    Element diff → 更新 RenderObject 配置
    ↓
② Layout Phase（布局阶段）
    RenderObject.performLayout()
    约束传递：父 → 子（Constraints 向下传递）
    尺寸确定：子 → 父（Size 向上返回）
    ↓
③ Paint Phase（绘制阶段）
    RenderObject.paint() → 生成 Layer Tree
    RecordingCanvas 记录绘制指令
    ↓
④ Composite & Rasterize（合成与光栅化）
    Layer Tree → Raster 线程
    Skia/Impeller → GPU 纹理
    ↓
⑤ 上屏显示（VSync 同步）
```

### 3.2 约束传递机制

```dart
// 布局核心协议：
// 1. 父节点向子节点传递 Constraints（最小/最大宽高）
// 2. 子节点在约束内确定自己的 Size
// 3. 父节点根据子节点 Size 进行定位

// Constraints 结构
class BoxConstraints {
  final double minWidth, maxWidth;
  final double minHeight, maxHeight;
}

// 示例：SizedBox → ConstrainedBox → 子节点
SizedBox(
  width: 200,  // 生成 tight 约束: w=200
  child: Container(
    width: 300,  // 想 300，但被约束为 200
    child: Text('Hello'),
  ),
)
```

**常见布局约束传递**：

```
Screen (390×844)
└── Scaffold
    └── body: Center
        约束: 0<=w<=390, 0<=h<=∞ (loose)
        └── Container(width: 200)
            约束: w=200 (tight)
            └── Text('Hi')
                约束: 0<=w<=200 (loose)
                → 自适应文本宽度
```

### 3.3 RelayoutBoundary（布局边界）

```dart
// 当 RenderObject 满足以下条件之一，成为 RelayoutBoundary：
// - isRepaintBoundary == true
// - 父级约束与自身约束无耦合（sizedByParent）
// - parentUsesSize == false

// 意义：子树布局变化不会触发边界外的重新布局
// RepaintBoundary 同理隔离绘制

// 手动创建绘制边界
RepaintBoundary(
  child: CustomPaint(painter: WavePainter()),  // 动画仅重绘此区域
)
```

### 3.4 Layer 结构与合成

```
TransformLayer (根)
├── OffsetLayer
│   ├── PictureLayer (Canvas 绘制指令)
│   ├── OpacityLayer
│   └── ClipRectLayer
│       └── PictureLayer
└── TextureLayer (平台视图/视频)

// RepaintBoundary → 独立 OffsetLayer
// 动画时仅重绘对应 Layer，其他 Layer 复用纹理
```

---

## 四、Dart 运行时与编译模型

### 4.1 JIT + AOT 混合编译

```
开发阶段 (flutter run)：
┌──────────────────────────────────────┐
│ Dart 源码 → Kernel IR → JIT 编译      │
│ 优势：支持 Hot Reload，秒级反馈        │
│ 代价：启动稍慢，运行时有编译开销        │
└──────────────────────────────────────┘

发布阶段 (flutter build)：
┌──────────────────────────────────────┐
│ Dart 源码 → Kernel IR → AOT 机器码    │
│ 优势：零运行时编译，极速启动            │
│ 产物：libapp.so (Android) / App.framework (iOS) │
└──────────────────────────────────────┘
```

### 4.2 Dart 内存模型

```
Dart Heap（每个 Isolate 独立）
┌─────────────────────────────────────┐
│ New Space (新生代)                    │
│ ├── Semi-space A (活跃)              │
│ └── Semi-space B (空闲)              │
│ 策略：Scavenge（复制存活对象）         │
├─────────────────────────────────────┤
│ Old Space (老年代)                    │
│ 策略：Mark-Sweep-Compact             │
└─────────────────────────────────────┘

// Isolate 之间不共享内存，通过消息传递通信
// 避免锁竞争，天然线程安全
```

### 4.3 Isolate 通信

```dart
// 方式一：Isolate.run（一次性计算）
final result = await Isolate.run(() => heavyComputation(data));

// 方式二：长期 Isolate + SendPort
final receivePort = ReceivePort();
await Isolate.spawn(workerIsolate, receivePort.sendPort);

final sendPort = await receivePort.first as SendPort;
final response = ReceivePort();
sendPort.send(['task', response.sendPort]);

// 方式三：compute（旧 API，Isolate.run 的前身）
final decoded = await compute(parseJson, bigJsonString);
```

---

## 五、Event Loop 与异步模型

### 5.1 事件循环结构

```
main() 执行完毕
    ↓
┌─────────────────────────────────────┐
│          Event Loop                  │
│                                      │
│  ① Microtask Queue（微任务队列）      │
│     scheduleMicrotask()              │
│     Future.value / Future.sync       │
│     Completer.complete               │
│     ↓ 全部清空后                      │
│  ② Event Queue（事件队列）            │
│     Timer / I/O / 手势事件            │
│     Future.delayed                   │
│     Isolate 消息                     │
│     ↓ 取一个执行后回到 ①              │
└─────────────────────────────────────┘
```

### 5.2 Future / async-await 本质

```dart
// async 函数本质：状态机 + 微任务调度
Future<String> fetchData() async {
  print('A');                    // 同步执行
  final data = await httpGet();  // 挂起，注册回调
  print('B');                    // httpGet 完成后，作为微任务恢复
  return data;
}

// 等价于（伪代码）：
Future<String> fetchData() {
  print('A');
  return httpGet().then((data) {
    print('B');
    return data;
  });
}

// 执行顺序示例
void main() {
  print('1');
  Future.microtask(() => print('3'));  // 微任务
  Future(() => print('4'));            // 事件队列
  print('2');
}
// 输出：1 2 3 4
```

### 5.3 Stream 原理

```dart
// Stream 本质：异步事件序列的抽象
// 单订阅 Stream：内部维护 _State 状态机
// 广播 Stream：维护监听器链表

final stream = Stream.periodic(Duration(seconds: 1), (i) => i);

// listen 时创建 _StreamSubscription
// 数据到达 → 加入 pending 队列 → 微任务逐个分发
stream.listen(
  (data) => print(data),      // onData
  onError: (e) => print(e),   // onError
  onDone: () => print('end'), // onDone
);

// async* 生成器：惰性求值，yield 一个分发一个
Stream<int> countStream(int max) async* {
  for (var i = 0; i < max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}
```

---

## 六、状态管理原理

### 6.1 setState 触发机制

```dart
// setState 源码核心逻辑（简化）
void setState(VoidCallback fn) {
  // 1. 执行回调，修改状态
  final Object? result = fn() as dynamic;

  // 2. 标记 Element 为 dirty
  _element!.markNeedsBuild();
}

// markNeedsBuild 流程：
// Element.markNeedsBuild()
//   → _dirty = true
//   → BuildOwner.scheduleBuildFor(this)
//   → onBuildScheduled() → ensureVisualUpdate()
//   → SchedulerBinding.scheduleFrame()
//   → 下一帧 VSync → buildScope() → 重建 dirty 子树
```

### 6.2 InheritedWidget 依赖注入

```dart
// InheritedWidget 原理：Element 树中的依赖注册与通知
class ThemeData extends InheritedWidget {
  final Color primaryColor;

  @override
  bool updateShouldNotify(ThemeData old) => primaryColor != old.primaryColor;
}

// dependOnInheritedWidgetOfExactType 内部：
// 1. 沿 _inheritedWidgets Map 向上查找（O(1)，非遍历）
// 2. 注册依赖：_dependencies.add(inheritedElement)
// 3. InheritedWidget 更新时：
//    notifyClients() → 遍历所有依赖者 → markNeedsBuild()

// 性能关键：每个 Element 持有 _inheritedWidgets 哈希表
// 子树插入时继承父级的表，查找复杂度 O(1)
```

### 6.3 主流状态管理方案对比

| 方案 | 原理 | 粒度 | 适用场景 |
| ---- | ---- | ---- | -------- |
| setState | Element dirty 标记 | Widget 级 | 局部简单状态 |
| InheritedWidget | 依赖注册 + 通知 | 子树级 | 主题、国际化 |
| Provider | InheritedWidget 封装 | 精确订阅 | 中型应用 |
| Riverpod | 编译期安全容器 | 精确订阅 | 大型应用 |
| GetX | 全局单例 + 观察者 | Rx 变量级 | 快速开发 |
| BLoC | Stream 事件驱动 | 状态级 | 复杂业务逻辑 |

### 6.4 Provider 核心实现

```dart
// Provider 本质：InheritedProvider + ChangeNotifier
class ChangeNotifierProvider<T extends ChangeNotifier> {
  // 1. 创建 _InheritedProviderScope（InheritedWidget）
  // 2. 监听 ChangeNotifier.addListener
  // 3. notifyListeners() → markNeedsNotifyDependents()
  // 4. 仅重建消费了该 Provider 的 Widget

  // context.watch<T>()：注册依赖，响应更新
  // context.read<T>()：不注册依赖，一次性读取
}

// 精确重建：Consumer / Selector
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,  // 仅监听 itemCount
  builder: (_, count, __) => Text('$count'),
  // itemCount 不变 → 不 rebuild
)
```

---

## 七、Hot Reload 原理

### 7.1 工作流程

```
开发者保存代码 (Cmd+S)
    ↓
① Flutter Tool 检测文件变化
    ↓
② Dart 源码增量编译为新的 Kernel 文件
    ↓
③ 通过 VM Service 发送 reloadSources 指令
    ↓
④ Dart VM 替换已加载的类库（保留堆状态）
    ↓
⑤ Framework 调用 reassemble()
    ↓
⑥ WidgetsBinding.drawFrame() 重建 Widget 树
    ↓
⑦ UI 更新（State 保持不变）
```

### 7.2 状态保持机制

```dart
// Hot Reload 保留 State 的原因：
// - Element 和 State 对象存活在堆内存中
// - 仅替换类的代码（方法体），不重新实例化对象
// - Widget 树重建时，Element diff 命中复用路径

// Hot Reload 失效场景（需 Hot Restart）：
// 1. main() 中的初始化逻辑变更
// 2. 全局变量/静态字段初始值变更
// 3. 泛型类型签名变更
// 4. enum ↔ class 类型互转
// 5. initState() 中的逻辑（不会重新执行）

class CounterPage extends StatefulWidget { ... }

class _CounterPageState extends State<CounterPage> {
  int count = 0;  // Hot Reload 后 count 值保留

  @override
  void initState() {
    super.initState();
    // Hot Reload 不会重新执行此方法
  }
}
```

### 7.3 Hot Reload vs Hot Restart vs 冷启动

| 方式 | 耗时 | State | 原理 |
| ---- | ---- | ----- | ---- |
| Hot Reload | ~100ms | 保留 | 增量编译 + 类替换 |
| Hot Restart | ~1-3s | 重置 | 重新执行 main()，重建 Isolate |
| 冷启动 | ~5-30s | 重置 | 完整编译 + 应用安装 + 启动 |

---

## 八、Platform Channel 平台通信

### 8.1 三种 Channel 类型

```
┌─────────────────────────────────────────────────────┐
│                    Dart (UI Thread)                   │
├─────────────────┬──────────────────┬────────────────┤
│ MethodChannel   │ EventChannel     │ BasicMessage   │
│ 一次性方法调用   │ 持续事件流        │ Channel        │
│ (invokeMethod)  │ (receiveBroadcast│ 异步消息        │
│                 │  Stream)         │ (send)         │
├─────────────────┴──────────────────┴────────────────┤
│           BinaryMessenger (消息编解码)                 │
│     StandardMethodCodec / JSONMethodCodec            │
├─────────────────────────────────────────────────────┤
│                  Platform (原生线程)                   │
│        Android: MethodChannel + MethodCallHandler    │
│        iOS: FlutterMethodChannel + handler           │
└─────────────────────────────────────────────────────┘
```

### 8.2 MethodChannel 通信流程

```dart
// Dart 端
final channel = MethodChannel('com.app/battery');
final level = await channel.invokeMethod<int>('getBatteryLevel');

// 内部流程：
// 1. invokeMethod → 编码为 ByteData (StandardMethodCodec)
// 2. BinaryMessenger.send(channelName, message)
// 3. 经 Engine 转发到 Platform Thread
// 4. 原生端解码 → 执行 handler → 编码结果返回
// 5. Dart 端 Future 完成（异步，不阻塞 UI 线程）
```

```kotlin
// Android 端 (Kotlin)
class MainActivity : FlutterActivity() {
  override fun configureFlutterEngine(engine: FlutterEngine) {
    MethodChannel(engine.dartExecutor, "com.app/battery")
      .setMethodCallHandler { call, result ->
        when (call.method) {
          "getBatteryLevel" -> {
            val level = getBatteryLevel()
            if (level != -1) result.success(level)
            else result.error("UNAVAILABLE", "电量不可用", null)
          }
          else -> result.notImplemented()
        }
      }
  }
}
```

### 8.3 编解码与性能

```dart
// StandardMessageCodec 支持的数据类型：
// null, bool, int, double, String, Uint8List, Int32List,
// Int64List, Float64List, List, Map

// 性能要点：
// 1. 消息序列化有开销 → 避免高频小消息（如逐帧传传感器数据）
// 2. 大数据传输考虑 Platform View 或 FFI
// 3. EventChannel 适合持续数据流（传感器、电量变化）

// Dart FFI：绕过 Channel，直接调用 C/C++ 代码
final dylib = DynamicLibrary.open('libnative.so');
final nativeAdd = dylib.lookupFunction<Int32 Function(Int32, Int32),
    int Function(int, int)>('add');
print(nativeAdd(1, 2));  // 同步调用，无序列化开销
```

---

## 九、动画系统原理

### 9.1 动画驱动机制

```
AnimationController (TickerProvider)
    ↓ Ticker 注册到 SchedulerBinding
VSync 信号到达（60/120Hz）
    ↓ Ticker._tick(elapsed)
AnimationController._tick()
    ↓ 计算 value = lerp(begin, end, curve(t))
通知 listeners (ValueNotifier 机制)
    ↓
AnimatedWidget / AnimatedBuilder rebuild
    ↓ 或 RenderObject 直接更新属性
Layout → Paint → 上屏
```

### 9.2 AnimationController 核心实现

```dart
class AnimationController extends Animation<double> {
  // 本质：基于 Ticker 的插值器
  void _tick(Duration elapsed) {
    _lastElapsedDuration = elapsed;
    final double elapsedInSeconds = elapsed.inMicroseconds / 1e6;
    // 线性插值 + 曲线变换
    _value = _simulation!.x(elapsedInSeconds).clamp(lowerBound, upperBound);
    if (_simulation!.isDone(elapsedInSeconds)) {
      _status = ...;
    }
    notifyListeners();  // 触发 rebuild
  }
}

// Ticker 与 VSync：
// SchedulerBinding.scheduleFrameCallback()
//   → window.scheduleFrame()
//   → 引擎等待下一个 VSync
//   → handleBeginFrame() → 执行所有 Ticker 回调
```

### 9.3 动画性能分级

```dart
// ❌ 低效：每帧重建整个子树
AnimatedBuilder(
  animation: controller,
  builder: (_, child) => Column(
    children: [ExpensiveWidget(), Opacity(opacity: controller.value)],
  ),
)

// ✅ 高效：child 缓存 + 仅变换层更新
AnimatedBuilder(
  animation: controller,
  builder: (_, child) => Opacity(
    opacity: controller.value,
    child: child,  // 子树不重建，仅 OpacityLayer 更新
  ),
  child: const ExpensiveWidget(),
)

// ✅ 最优：Transform 不触发子树 Layout
Transform.translate(
  offset: Offset(0, controller.value * 100),
  child: child,  // 仅修改 Layer 的 transform 矩阵
)
```

| 属性变化 | 触发阶段 | 性能代价 |
| -------- | -------- | -------- |
| width/height/padding | Layout + Paint | 高 |
| color/opacity | Paint | 中 |
| transform (translate/scale/rotate) | Composite | 低 |

---

## 十、性能优化机制

### 10.1 Build 阶段优化

```dart
// 1. 减少 rebuild 范围
// ❌ 整个页面 rebuild
class Page extends StatefulWidget {
  Widget build(_) => Column(children: [Header(), Counter()]);
}

// ✅ 状态下沉，局部 rebuild
class Counter extends StatefulWidget {
  // 仅 Counter 子树 rebuild
}

// 2. const 构造函数 → 编译期常量，跳过 diff
const Padding(padding: EdgeInsets.all(16.0))

// 3. 避免在 build 中创建对象
// ❌ build 中 new → 每帧 GC 压力
Widget build(_) => Text(style: TextStyle(fontSize: 14));

// ✅ 提取为静态/成员变量
static final _style = TextStyle(fontSize: 14);
```

### 10.2 列表性能

```dart
// ListView.builder 懒加载原理：
// 1. SliverChildBuilderDelegate 按需创建子 Widget
// 2. Viewport 仅构建可见区域 ± cacheExtent (默认 250px)
// 3. 滚出范围的 Element 被回收（keepAlive 除外）

ListView.builder(
  itemCount: 10000,
  itemBuilder: (_, index) => ItemWidget(index),
  // 实际同时存活的子节点 ≈ 屏幕可见数 + 缓存数
)

// 大列表优化清单：
// - 固定 itemExtent → 跳过逐个 layout
// - AutomaticKeepAliveClientMixin → 保持关键项
// - 避免 ListView(children: [...]) 全量构建
```

### 10.3 光栅化与绘制优化

```dart
// 1. RepaintBoundary 隔离重绘区域
RepaintBoundary(
  child: CustomPaint(painter: AnimatedWavePainter()),
)

// 2. shouldRepaint 精确控制
class WavePainter extends CustomPainter {
  @override
  bool shouldRepaint(covariant WavePainter old) =>
      old.phase != phase;  // 仅相位变化时重绘
}

// 3. 图片优化
Image.asset('photo.png', cacheWidth: 400)  // 按显示尺寸解码
// 解码在 I/O 线程，不阻塞 UI

// 4. Shader 预热（Impeller 默认解决）
// Skia 时代：首次动画卡顿 → ShaderWarmUp
```

### 10.4 性能诊断工具

| 工具 | 用途 |
| ---- | ---- |
| Flutter DevTools - Performance | 帧耗时分析（Build/Layout/Paint） |
| DevTools - Widget Inspector | 树结构、rebuild 原因追踪 |
| DevTools - Memory | 堆快照、泄漏检测 |
| `debugPrintRebuildDirtyWidgets()` | 打印每帧重建的 Widget |
| `debugProfileBuildsEnabled` | Timeline 中标记 build 耗时 |
| Timeline (Dart DevTools) | 各线程耗时全景 |

### 10.5 16ms 帧预算分配

```
一帧 16.6ms (60fps) / 8.3ms (120fps)
┌────────────────────────────────────────┐
│ UI Thread: Build + Layout + Paint 指令  │
│ 目标 < 8ms                              │
├────────────────────────────────────────┤
│ Raster Thread: 光栅化 + GPU 合成         │
│ 目标 < 8ms                              │
└────────────────────────────────────────┘

// 掉帧排查路径：
// 1. Performance Overlay 观察 UI/Raster 哪个超时
// 2. UI 超时 → 优化 build/layout（减少 rebuild、const）
// 3. Raster 超时 → 优化绘制（RepaintBoundary、减少 Layer）
```

---

## 📎 参考资源

- [Flutter 官方架构文档](https://docs.flutter.dev/resources/architectural-overview)
- [Flutter 渲染管线源码](https://github.com/flutter/flutter/tree/master/packages/flutter/lib/src/rendering)
- [Dart VM 内部机制](https://mrale.ph/dart/)
- [Flutter 源码剖析 - Element 树](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/widgets/framework.dart)
