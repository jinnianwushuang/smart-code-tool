---
title: Flutter 性能优化实战
tags: ['Flutter', '性能优化']
---

# Flutter 性能优化实战

Flutter 应用的性能优化围绕三个核心目标：减少帧构建时间（UI 线程）、减少光栅化时间（Raster 线程）、降低内存占用。本文从渲染优化、内存管理、启动性能、诊断工具四个维度构建完整的优化体系。

---

## 一、渲染性能优化

### 1.1 减少 Widget 重建范围

```dart
// ❌ 问题：setState 在顶层 → 整棵子树重建
class ParentWidget extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Counter(), // 频繁变化
        ExpensiveList(), // 不需要重建但被迫重建
      ],
    );
  }
}

// ✅ 方案一：状态下沉
class ParentWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Counter(), // 自身管理状态
        const ExpensiveList(), // const → 不重建
      ],
    );
  }
}

// ✅ 方案二：ValueListenableBuilder 精确更新
class CounterWidget extends StatelessWidget {
  final counter = ValueNotifier(0);

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: counter,
      builder: (context, value, child) {
        return Text('$value'); // 只有 Text 重建
      },
      child: const Icon(Icons.add), // child 不重建
    );
  }
}
```

### 1.2 ListView 优化

```dart
// ❌ 全量构建：1000 项 = 1000 个 Widget
Column(
  children: items.map((item) => ItemWidget(item)).toList(),
)

// ✅ 懒加载构建：只构建可视区域
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)

// ✅ 进一步优化：key + const
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(
      key: ValueKey(items[index].id),
      item: items[index],
    );
  },
)
```

### 1.3 图片加载优化

```dart
// ✅ 指定尺寸，避免解码过大的原图
Image.asset(
  'assets/photo.png',
  width: 100,
  height: 100,
  cacheWidth: 200, // 缓存尺寸（2x 屏幕）
  cacheHeight: 200,
  fit: BoxFit.cover,
)

// ✅ 使用 cached_network_image 缓存网络图片
CachedNetworkImage(
  imageUrl: 'https://example.com/image.jpg',
  memCacheWidth: 200,
  placeholder: (context, url) => const SkeletonBox(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

---

## 二、内存优化

### 2.1 避免内存泄漏

```dart
// ❌ 泄漏：StreamSubscription 未取消
class MyWidget extends StatefulWidget { ... }
class _MyWidgetState extends State<MyWidget> {
  late StreamSubscription sub;

  @override
  void initState() {
    super.initState();
    sub = myStream.listen((data) {
      setState(() { /* ... */ }); // Widget 销毁后仍触发
    });
  }
  // 忘记 dispose → 内存泄漏
}

// ✅ 在 dispose 中取消订阅
@override
void dispose() {
  sub.cancel();
  super.dispose();
}

// ✅ 使用 StreamBuilder 自动管理
StreamBuilder<int>(
  stream: myStream,
  builder: (context, snapshot) {
    return Text('${snapshot.data}');
  },
)
```

### 2.2 减少对象创建

```dart
// ❌ 每次 build 创建新 TextStyle
Text('Hello', style: TextStyle(fontSize: 16, color: Colors.black))

// ✅ 提取为常量
const _textStyle = TextStyle(fontSize: 16, color: Colors.black);
Text('Hello', style: _textStyle)

// ❌ 每次 build 创建新 List
children: [
  Widget1(),
  Widget2(),
  Widget3(),
]

// ✅ 使用 const 或 final 列表
static const _children = [Widget1(), Widget2(), Widget3()];
```

### 2.3 Dart 对象与 Native 内存

```dart
// Dart 对象由 GC 管理，但以下对象占用 Native 内存：
// - Image（解码后的像素数据在 Native 堆）
// - Canvas / Picture（GPU 资源）
// - Isolate（独立堆内存）

// ✅ 及时释放大图
final image = await decodeImageFromBytes(largeBytes);
// 使用完毕后
image.dispose(); // 释放 Native 内存
```

---

## 三、启动性能优化

### 3.1 延迟初始化

```dart
// ❌ 启动时初始化所有服务
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initDatabase();
  await initAnalytics();
  await initPushNotification();
  await initCrashReporting();
  runApp(const App());
}

// ✅ 只初始化必要服务，其余延迟
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initDatabase(); // 必需
  runApp(const App());

  // 首帧渲染后初始化非必需服务
  SchedulerBinding.instance.addPostFrameCallback((_) async {
    await initAnalytics();
    await initPushNotification();
    await initCrashReporting();
  });
}
```

### 3.2 骨架屏替代 Splash

```dart
// ✅ 首帧立即显示骨架屏，避免白屏
class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: FutureBuilder(
        future: initServices(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const SkeletonScreen(); // 骨架屏
          }
          return const MainScreen();
        },
      ),
    );
  }
}
```

---

## 四、性能诊断工具

### 4.1 Flutter DevTools Performance

操作步骤：

1. 打开 Flutter DevTools → Performance 面板
2. 点击「Record」→ 执行目标操作
3. 停止录制 → 分析帧耗时

**关键指标**：

| 指标 | 含义 | 优化目标 |
|---|---|---|
| UI 帧耗时 | Build + Layout + Paint | < 8ms（留余量给 Raster） |
| Raster 帧耗时 | GPU 光栅化 | < 8ms |
| 总帧耗时 | UI + Raster | < 16.67ms（60fps） |
| Jank 帧 | 超过预算的帧 | 越少越好 |

### 4.2 Flutter DevTools Memory

- **Heap Snapshot**：查看当前 Dart 堆中所有对象
- **Allocation Profile**：追踪对象分配热点
- **Leak 检测**：识别未释放的对象

### 4.3 性能诊断决策树

```
应用卡顿 / 掉帧
├── UI 线程耗时长？
│   ├── Build 阶段慢 → 减少 Widget 树深度 / const Widget
│   ├── Layout 阶段慢 → 减少嵌套 / 使用 SizedBox 替代 Flexible
│   └── Paint 阶段慢 → RepaintBoundary / CustomPaint
├── Raster 线程耗时长？
│   ├── 图片过大 → 指定 cacheWidth/cacheHeight
│   ├── 阴影/模糊过多 → 减少 blur radius / 用图片替代
│   └── 动画复杂 → CustomPainter + shouldRepaint 优化
├── 启动慢？
│   ├── 初始化过多 → 延迟非必要服务
│   └── 首帧白屏 → 骨架屏 / Flutter Splash
└── 内存持续增长？
    ├── StreamSubscription 未取消 → dispose 中 cancel
    ├── Image 未释放 → image.dispose()
    └── Controller 未销毁 → dispose 中 dispose
```

---

## 五、Flutter vs React vs Vue 性能优化对比

| 优化维度 | Flutter | React | Vue |
|---|---|---|---|
| 减少重渲染 | const Widget + RepaintBoundary | React.memo | v-once + v-memo |
| 缓存计算 | 手动缓存变量 | useMemo | computed |
| 懒加载 | deferred components | React.lazy | defineAsyncComponent |
| 列表优化 | ListView.builder | 虚拟列表 | useVirtualList |
| 大数据控制 | 不可变数据 + shallowRef | useSyncExternalStore | shallowRef + Object.freeze |
| 诊断工具 | Flutter DevTools | React DevTools | Vue DevTools |
| 动画性能 | 原生渲染 60/120fps | CSS/RAF | CSS/RAF |

---

## 六、性能优化速查表

| 优化手段 | 适用场景 | 收益 |
|---|---|---|
| `const Widget` | 所有不变的 Widget | 跳过 Element update |
| `RepaintBoundary` | 动画区域隔离 | 减少重绘范围 |
| `ValueListenableBuilder` | 局部值变化 | 精确重建 |
| `ListView.builder` | 长列表 | 懒加载构建 |
| `cacheWidth/cacheHeight` | 图片加载 | 减少内存 + 解码时间 |
| 延迟初始化 | 启动优化 | 减少首帧时间 |
| `dispose` 清理 | 所有 StatefulWidget | 防止内存泄漏 |
| `CustomPaint` | 复杂绘制 | 绕过 Widget 树 |
| Impeller | 全平台 | 消除着色器编译卡顿 |
| DevTools Performance | 性能诊断 | 定位帧耗时瓶颈 |
