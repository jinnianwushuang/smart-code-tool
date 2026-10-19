---
title: 'GetX 框架底层设计原理全拆解'
tags: ['案例']
---

# GetX 框架底层设计原理全拆解

> 本文档从 GetStream 底层引擎出发，全面拆解 GetX 框架各模块的底层设计原理：
> `.obs` 的 Rx 封装、`Obx` 的依赖收集、`Worker` 的副作用监听、`GetBuilder` 的轻量更新，
> GetStream 底层引擎、GetxController 生命周期、DI 容器、SmartManagement、路由引擎、RxList/RxMap 集合响应式，
> 以及与 Vue `ref + computed + watch` 的底层同构关系。

---

## 一、GetX 响应式系统全景

```
GetX 响应式系统全景
├── 流引擎层
│   └── GetStream<T>        → 自研事件流（非 dart:async Stream）
├── 响应式层
│   ├── Rx 变量（.obs）     → 将普通值包装成可观察对象（类似 Vue 的 ref）
│   └── RxList/RxMap/RxSet  → 集合响应式（拦截操作符）
├── UI 绑定层
│   ├── Obx                 → 自动依赖收集 + 精准重建
│   └── GetBuilder          → 手动 update() + id 精确刷新
├── 副作用层
│   └── Worker（ever/debounce/once/interval）→ 逻辑副作用监听
├── 控制器层
│   └── GetxController      → 生命周期 + 状态持有 + Worker 管理
├── DI 容器层
│   └── GetInstance         → 全局 HashMap + 懒加载 + Bindings
└── 路由引擎层
    └── GetDelegate         → Navigator 2.0 + Middleware 链 + Binding 联动
```

**核心流程：**

```dart
final count = 0.obs;           // 创建 Rx<int>

Obx(() => Text('$count'))      // 读取 → 收集 Obx 为依赖

count.value++                   // 写入 → 通知所有依赖的 Obx 重建
```

---

## 二、Rx 变量的本质 — 观察者模式封装

### 2.1 Rx 类型体系

```dart
// .obs 扩展方法（GetX 源码简化版）
extension RxIntExtension on int {
  RxInt get obs => RxInt(this);
}

// RxInt 继承自 RxNotifier
class RxInt extends RxNotifier<int> {
  RxInt(int initial) : super(initial);
}

// RxNotifier 是核心：持有值 + 通知监听器
class RxNotifier<T> {
  RxNotifier(T initial) : _value = initial;

  T _value;

  T get value {
    // 读取时：如果有活跃的 RxInterface，收集依赖
    RxInterface.notifyChildren(this);
    return _value;
  }

  set value(T newValue) {
    if (_value == newValue) return;  // 值未变 → 不通知（同 Vue trigger 优化）
    _value = newValue;
    _refresh();  // 通知所有监听器
  }

  // 监听器管理
  final List<VoidCallback> _listeners = [];

  Stream<T> get stream => _controller.stream;  // 高级用法

  void _refresh() {
    for (final listener in _listeners) {
      listener();  // 逐个通知（类似 Vue trigger）
    }
  }
}
```

### 2.2 与 Vue ref 的对照

| 维度       | Vue `ref`                    | GetX `Rx<T>`                     |
| ---------- | ---------------------------- | -------------------------------- |
| 包装方式   | `ref(0)` 返回 `{ value: 0 }` | `0.obs` 返回 `RxInt(0)`          |
| 读取追踪   | Proxy `get` → `track()`      | `get value` → `notifyChildren`   |
| 写入通知   | Proxy `set` → `trigger()`    | `set value` → `_refresh()`       |
| 值未变优化 | ✅ 跳过 trigger              | ✅ 跳过 _refresh                 |
| 深层响应   | `reactive()` 递归代理        | ❌ 不支持（需手动 `.refresh()`） |
| 计算属性   | `computed(() => ...)`        | `RxBool` 等 + `debounce`         |

**关键差异：** Vue 用 Proxy 拦截所有属性访问实现自动深层追踪；GetX 只追踪 `.value` 的读写，深层对象需手动调用 `.refresh()`。

---

## 三、Obx 的依赖收集机制

### 3.1 Obx Widget 简化实现

```dart
class Obx extends StatefulWidget {
  final WidgetBuilder builder;

  const Obx(this.builder);

  @override
  State<Obx> createState() => _ObxState();
}

class _ObxState extends State<Obx> {
  // 内部持有一个 RxInterface 实例
  late final _observer = _Observer();

  @override
  void initState() {
    super.initState();
    _observer._listener = _markNeedsBuild;
  }

  void _markNeedsBuild() {
    setState(() {});  // 触发 Widget 重建
  }

  @override
  Widget build(BuildContext context) {
    // 关键：将当前 observer 设为"活跃观察者"
    RxInterface.observer = _observer;

    // 执行 builder → 内部读取 .obs 值 → 自动收集依赖
    final widget = widget.builder(context);

    // builder 执行完毕，清除活跃观察者
    RxInterface.observer = null;

    return widget;
  }

  @override
  void dispose() {
    _observer.dispose();  // 清理所有订阅
    super.dispose();
  }
}
```

### 3.2 依赖收集的时序图

```
Obx.build() 执行
│
├── ① RxInterface.observer = _observer   // 设全局变量
│
├── ② builder(context) 执行
│   ├── 读取 count.value
│   │   └── RxNotifier.get value
│   │       └── RxInterface.notifyChildren(this)
│   │           └── observer.addDependency(this)  // 收集！
│   ├── 读取 name.value
│   │   └── 同上 → 收集 name
│   └── 返回 Text('$count $name')
│
├── ③ RxInterface.observer = null         // 清除全局变量
│
└── 此时 _observer 已收集到 [count, name] 两个依赖
    → 任一变化 → _markNeedsBuild → setState → 重建
```

### 3.3 与 Vue effect 的对照

```
Vue effect                          GetX Obx
──────────                          ────────
activeEffect = effectFn             RxInterface.observer = observer

effectFn() {                        builder() {
  read state.count                    read count.value
  → track(target, 'count')            → notifyChildren(count)
  read state.name                     → 收集 count
  → track(target, 'name')           read name.value
}                                     → 收集 name
                                    }
activeEffect = null                 RxInterface.observer = null

count++ → trigger → effectFn 重跑  count.value++ → _refresh → setState
```

---

## 四、Worker — 逻辑副作用监听

### 4.1 Worker 类型速查

```dart
class MyController extends GetxController {
  final count = 0.obs;

  @override
  void onInit() {
    super.onInit();

    // ① ever：每次变化都执行（类似 Vue watch）
    ever(count, (newVal) {
      print('count 变为: $newVal');
    });

    // ② once：只在第一次变化时执行
    once(count, (newVal) {
      print('count 首次变为: $newVal');
    });

    // ③ debounce：防抖（适合搜索输入）
    debounce(count, (_) {
      searchApi();
    }, time: Duration(milliseconds: 500));

    // ④ interval：节流（限制执行频率）
    interval(count, (_) {
      print('最多每秒执行一次');
    }, time: Duration(seconds: 1));
  }

  @override
  void onClose() {
    // Worker 在 onClose 自动 dispose（GetX 自动管理）
    super.onClose();
  }
}
```

### 4.2 Worker 简化实现

```dart
// ever() 的简化实现
Worker ever<T>(Rx<T> rx, void Function(T) callback) {
  // 内部订阅 Rx 的 stream
  final subscription = rx.listen((value) {
    callback(value);
  });

  return Worker(subscription.dispose);
}

// debounce() 的简化实现
Worker debounce<T>(Rx<T> rx, void Function(T) callback, {required Duration time}) {
  Timer? timer;

  final subscription = rx.listen((value) {
    timer?.cancel();           // 取消上一次的定时器
    timer = Timer(time, () {   // 重新计时
      callback(value);
    });
  });

  return Worker(() {
    timer?.cancel();
    subscription.cancel();
  });
}
```

### 4.3 Worker 与 Vue watch 的对照

| 维度     | Vue `watch`                 | GetX Worker                   |
| -------- | --------------------------- | ----------------------------- |
| 立即执行 | `{ immediate: true }`       | 不需要（`ever` 自动监听变化） |
| 深度监听 | `{ deep: true }`            | 不需要（Rx 只监听 `.value`）  |
| 防抖     | 需手动 `watchDebounced`     | `debounce()` 内置             |
| 节流     | 需手动 `watchThrottled`     | `interval()` 内置             |
| 执行一次 | `{ once: true }` (Vue 3.4+) | `once()` 内置                 |
| 自动清理 | `onUnmounted` 自动清理      | `onClose` 自动清理            |

---

## 五、GetBuilder — 轻量级非响应式更新

### 5.1 GetBuilder vs Obx

```dart
// 方式一：Obx（响应式，自动追踪依赖）
final count = 0.obs;
Obx(() => Text('$count'))

// 方式二：GetBuilder（非响应式，手动触发）
final count = 0;  // 普通变量
GetBuilder<MyController>(
  id: 'counter',  // 可选：精确更新
  builder: (ctrl) => Text('${ctrl.count}'),
)
ctrl.update(['counter']);  // 手动触发
```

| 对比     | Obx              | GetBuilder               |
| -------- | ---------------- | ------------------------ |
| 数据源   | `.obs` Rx 变量   | 普通变量                 |
| 更新方式 | 自动（依赖收集） | 手动（`update()`）       |
| 性能     | 有 Rx 包装开销   | 零开销（纯 setState）    |
| 适用场景 | 数据频繁变化     | 数据变化少、精确控制更新 |
| 粒度控制 | 自动精确         | 通过 `id` 精确           |

### 5.2 GetBuilder 简化实现

```dart
class GetBuilder<T extends GetxController> extends StatefulWidget {
  final String? id;
  final Widget Function(T) builder;

  const GetBuilder({this.id, required this.builder});

  @override
  State<GetBuilder<T>> createState() => _GetBuilderState<T>();
}

class _GetBuilderState<T extends GetxController> extends State<GetBuilder<T>> {
  late T controller;

  @override
  void initState() {
    super.initState();
    controller = Get.find<T>();

    // 注册：告诉 Controller "我监听你"
    controller.addListener(widget.id, _markNeedsBuild);
  }

  void _markNeedsBuild() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return widget.builder(controller);
  }

  @override
  void dispose() {
    controller.removeListener(widget.id, _markNeedsBuild);
    super.dispose();
  }
}
```

---

## 六、完整数据流：从 `.obs` 到像素

```
count.value++
│
├── ① RxNotifier.set value
│   ├── 值未变？→ return（短路）
│   └── _value = newValue
│       └── _refresh()
│           ├── 通知 Obx 依赖 → setState → markNeedsBuild
│           └── 通知 Worker 监听 → 执行回调
│
├── ② Flutter 调度
│   ├── setState 标记 Element 为 dirty
│   └── 下一帧 VSync → performRebuild
│       └── build() → Obx.builder() 重新执行
│           └── 读取 count.value → 返回新 Text Widget
│
├── ③ Element Diff
│   ├── 对比新旧 Text Widget
│   ├── key 相同 + type 相同 → 复用 Element
│   └── 更新 RenderObject 的属性
│
└── ④ 渲染管线
    ├── Layout → 重新计算 Text 尺寸
    ├── Paint → 重新绘制文字
    └── Composite → 提交到 GPU
```

---

## 七、GetStream — 自研事件流引擎

### 7.1 为什么不用 dart:async Stream？

| 维度     | dart:async Stream                   | GetStream                  |
| -------- | ----------------------------------- | -------------------------- |
| 内存开销 | 每个 Stream 有 Zone/Subscription 链 | 轻量回调列表，无 Zone 绑定 |
| 订阅管理 | Subscription 需手动 cancel          | 返回 VoidCallback，更轻量  |
| 通知方式 | 异步（经过 Event Loop）             | 同步遍历回调，零调度开销   |
| 语义     | 通用异步数据流                      | 专为"值变化通知"优化       |

### 7.2 GetStream 核心实现

```dart
// GetStream 简化源码（核心思想）
class GetStream<T> {
  // 回调列表（非传统 Stream 的 Subscription 链）
  final List<void Function(T)> _listeners = [];
  T? _value;

  // 添加监听（返回取消订阅函数）
  VoidCallback listen(void Function(T) callback) {
    _listeners.add(callback);
    return () => _listeners.remove(callback);
  }

  // 触发通知（同步遍历）
  void add(T newValue) {
    _value = newValue;
    // 创建副本遍历，避免遍历期间增删导致异常
    for (final listener in List.of(_listeners)) {
      listener(newValue);
    }
  }

  // 销毁：清空所有监听
  void destroy() {
    _listeners.clear();
    _value = null;
  }
}
```

**关键设计**：

- **同步通知**：`add()` 同步遍历回调，不经过 Event Loop，响应更快
- **返回值清理**：`listen()` 返回 `VoidCallback`，比 `StreamSubscription.cancel()` 更轻量
- **防并发修改**：`List.of(_listeners)` 创建副本遍历，避免遍历期间增删导致异常
- **无 Zone 绑定**：不依赖 Dart Zone，减少内存开销和上下文切换

---

## 八、GetxController 生命周期

### 8.1 生命周期时序

```
Get.put(Controller()) 或路由进入触发 Binding
│
├── ① 构造函数执行
│   └── 初始化普通变量
│
├── ② onInit()
│   └── 异步初始化（如 API 请求、Worker 创建）
│   └── ⚠️ 此时 Widget 尚未构建
│
├── ③ onReady()
│   └── Widget 首次渲染完成后调用
│   └── 适合执行依赖 UI 的操作（如动画启动）
│
├── ④ 正常使用中...
│   └── Rx 变量变化 → Obx 重建
│   └── Worker 回调执行
│
└── ⑤ onClose()
    └── Controller 被销毁前调用
    └── 清理 Worker、关闭 Stream、释放资源
    └── ⚠️ 必须调用 super.onClose()
```

### 8.2 生命周期简化实现

```dart
// GetxController 简化源码
abstract class GetxController extends GetLifeCycleBase {
  // 生命周期回调列表
  final List<VoidCallback> _onInitCallbacks = [];
  final List<VoidCallback> _onReadyCallbacks = [];
  final List<VoidCallback> _onCloseCallbacks = [];

  // Worker 列表（onClose 时自动 dispose）
  final List<Worker> _workers = [];

  // GetBuilder 监听器
  final Map<String?, List<VoidCallback>> _updaters = {};

  @mustCallSuper
  void onInit() {
    // 子类重写：初始化逻辑
  }

  @mustCallSuper
  void onReady() {
    // 子类重写：UI 就绪后逻辑
  }

  @mustCallSuper
  void onClose() {
    // ① 清理所有 Worker
    for (final worker in _workers) {
      worker.dispose();
    }
    _workers.clear();

    // ② 清理所有 GetBuilder 监听
    _updaters.clear();

    // ③ 清理 Rx 的 Stream
    // （Rx 变量在 GC 时自动清理，但显式 destroy 更安全）
  }

  // GetBuilder 用的 update() 方法
  void update([List<String>? ids, bool condition = true]) {
    if (!condition) return;

    if (ids == null) {
      // 无 id → 通知所有 GetBuilder
      for (final list in _updaters.values) {
        for (final callback in list) {
          callback();
        }
      }
    } else {
      // 有 id → 只通知匹配的 GetBuilder
      for (final id in ids) {
        final list = _updaters[id];
        if (list != null) {
          for (final callback in list) {
            callback();
          }
        }
      }
    }
  }
}
```

### 8.3 生命周期调用时机

| 场景                              | onInit         | onReady         | onClose            |
| --------------------------------- | -------------- | --------------- | ------------------ |
| `Get.put(Controller())`           | 立即调用       | 下一帧调用      | `Get.delete()` 时  |
| 路由 Binding 注入                 | 路由进入时     | 页面首次渲染后  | 路由退出时（默认） |
| `Get.lazyPut(() => Controller())` | 首次 `find` 时 | onInit 后下一帧 | 同路由退出         |

---

## 九、DI 容器 GetInstance — 依赖注入原理

### 9.1 GetInstance 核心设计

GetX 的 DI 本质是一个**全局 HashMap + 工厂模式**：

```dart
// GetInstance 简化源码（核心思想）
class GetInstance {
  // 单例注册表：key = 类型名 + tag，value = 工厂
  final Map<String, _InstanceBuilderFactory> _singl = {};

  // put：立即创建并存入
  S put<S>(S dependency, {String? tag}) {
    final key = _getKey(S, tag);
    _singl[key] = _InstanceBuilderFactory(
      isSingleton: true,
      builderFunc: () => dependency,
      isInit: true,
      instance: dependency,
    );
    return dependency;
  }

  // lazyPut：延迟创建，首次 find 时才实例化
  void lazyPut<S>(InstanceBuilderCallback<S> builder, {String? tag}) {
    final key = _getKey(S, tag);
    _singl[key] = _InstanceBuilderFactory(
      isSingleton: true,
      builderFunc: builder,
      isLazy: true,  // 标记为懒加载
      isInit: false,
    );
  }

  // find：从容器取出（懒加载则此时创建）
  S find<S>({String? tag}) {
    final key = _getKey(S, tag);
    final builder = _singl[key];

    if (builder == null) {
      throw 'Instance not found for type $S';
    }

    // 懒加载：首次 find 时才创建
    if (builder.isLazy && !builder.isInit) {
      builder.instance = builder.builderFunc();
      builder.isInit = true;
    }

    return builder.instance as S;
  }

  // delete：从容器移除（触发 onClose）
  bool delete<S>({String? tag}) {
    final key = _getKey(S, tag);
    final builder = _singl.remove(key);

    if (builder != null) {
      // 调用生命周期回调
      (builder.instance as GetxController?)?.onClose();
    }

    return builder != null;
  }

  // create：每次 find 都新建新实例
  S create<S>(InstanceBuilderCallback<S> builder, {String? tag}) {
    // 不存入注册表，直接返回新实例
    return builder();
  }

  // 生成 key：类型名 + tag
  String _getKey(Type type, String? tag) {
    return tag == null ? type.toString() : '${type.toString()}$tag';
  }
}
```

### 9.2 四种注册方式对比

| 方式             | 创建时机           | 存储方式     | 适用场景                    |
| ---------------- | ------------------ | ------------ | --------------------------- |
| `Get.put()`      | 立即创建           | 单例存入容器 | App 级服务（如 ApiService） |
| `Get.lazyPut()`  | 首次 find 时创建   | 单例存入容器 | 路由级 Controller           |
| `Get.putAsync()` | 异步创建完成后存入 | 单例存入容器 | 需要异步初始化的服务        |
| `Get.create()`   | 每次 find 都新建   | 不存入容器   | 需要多实例的场景            |

### 9.3 Bindings — 路由与 DI 联动

```dart
// Bindings 简化实现
class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<HomeRepository>(() => HomeRepository());
  }
}

// 路由进入时的执行流程
Get.toNamed('/home')
│
├── ① 查找 GetPage 配置
│   └── GetPage(name: '/home', page: () => HomeView(), binding: HomeBinding())
│
├── ② 执行 Binding.dependencies()
│   └── HomeBinding.dependencies() → 注册 HomeController + HomeRepository
│
├── ③ 执行 Middleware 链
│   └── 鉴权、日志、重定向等
│
├── ④ 构建页面 Widget
│   └── HomeView() → 内部 Get.find<HomeController>() → 获取已注册实例
│
└── ⑤ 页面销毁时
    └── 根据 SmartManagement 策略决定是否 delete Controller
```

---

## 十、SmartManagement — 自动释放策略

### 10.1 四种策略

```dart
// GetMaterialApp 配置
GetMaterialApp(
  smartManagement: SmartManagement.standard, // 默认策略
  // ...
)
```

| 策略            | 释放时机                                  | 适用场景                   |
| --------------- | ----------------------------------------- | -------------------------- |
| **Standard**    | 页面销毁时自动释放 Controller             | 大多数场景（默认）         |
| **OnlyBuilder** | 仅 GetBuilder/GetX 管理的 Controller 释放 | 混合使用 Obx 和 GetBuilder |
| **FullScreen**  | 仅全屏页面销毁时释放                      | 全屏应用（非弹窗）         |
| **KeepFactory** | 保留 Factory 但释放实例                   | 需要频繁重建的场景         |

### 10.2 Standard 策略简化实现

```dart
// Standard 策略简化逻辑
class SmartManagementStandard {
  void onPageDispose(GetPage page) {
    // 页面销毁时，查找该页面 Binding 注册的所有 Controller
    for (final controller in page.binding.registeredControllers) {
      // 检查是否还有其他页面在使用
      if (!isControllerInUse(controller)) {
        Get.delete(controller);  // 自动释放
      }
    }
  }
}
```

**核心机制**：

- 每个 GetPage 的 Binding 会记录注册的 Controller
- 页面销毁时，检查 Controller 是否还被其他页面引用
- 无引用 → 自动调用 `onClose()` 并从容器移除
- 有引用 → 保留（如全局 `Get.put()` 注册的）

---

## 十一、路由引擎 — GetDelegate 设计原理

### 11.1 GetX 路由 vs Flutter 原生路由

| 维度     | Flutter Navigator 2.0                   | GetX Route            |
| -------- | --------------------------------------- | --------------------- |
| 依赖     | 需要 BuildContext                       | 不需要 Context        |
| 配置     | RouteInformationParser + RouterDelegate | GetPage 列表          |
| 中间件   | 无原生支持                              | GetMiddleware 链      |
| Binding  | 无                                      | 自动联动              |
| 参数传递 | RouteSettings.arguments                 | Get.arguments（全局） |

### 11.2 GetDelegate 简化实现

```dart
// GetDelegate 简化源码（核心思想）
class GetDelegate extends RouterDelegate<GetPageRoute>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<GetPageRoute> {
  // 路由栈
  final List<GetPage> _routeStack = [];

  // 路由表（从 GetMaterialApp.getPages 获取）
  final List<GetPage> getPages;

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: _routeStack.map((page) => page.toFlutterPage()).toList(),
      onPopPage: (route, result) {
        // 页面 pop 时触发
        _routeStack.removeLast();
        notifyListeners();  // 通知 Router 状态变化
        return route.didPop(result);
      },
    );
  }

  // Get.to() 的实现
  Future<T?> to<T>(Widget page, {String? routeName}) {
    final getPage = GetPage(name: routeName, page: () => page);
    _routeStack.add(getPage);
    notifyListeners();  // 触发 Navigator 重建
    return Completer<T?>().future;
  }

  // Get.toNamed() 的实现
  Future<T?> toNamed<T>(String name) {
    final getPage = getPages.firstWhere((p) => p.name == name);

    // ① 执行 Binding
    getPage.binding?.dependencies();

    // ② 执行 Middleware 链
    for (final middleware in getPage.middlewares ?? []) {
      final redirect = middleware.redirect(name);
      if (redirect != null) {
        return toNamed(redirect);  // 重定向
      }
    }

    _routeStack.add(getPage);
    notifyListeners();
    return Completer<T?>().future;
  }
}
```

### 11.3 Middleware 执行链

```dart
// GetMiddleware 简化实现
abstract class GetMiddleware {
  // 重定向（返回 null 表示不重定向）
  RouteSettings? redirect(String? route) => null;

  // 页面进入前调用
  void onPageCalled(GetPage? page) {}

  // 页面构建时调用
  GetPage? onPageBuild(GetPage? page) => page;

  // 页面销毁时调用
  void onPageDispose(GetPage? page) {}
}

// Middleware 执行顺序
Get.toNamed('/protected')
│
├── ① onPageCalled（每个 Middleware）
│   └── 可用于日志、埋点
│
├── ② redirect（每个 Middleware）
│   └── 返回非 null → 重定向到该路由
│   └── 典型场景：未登录 → 重定向 /login
│
├── ③ Binding.dependencies()
│   └── 注入 Controller
│
├── ④ onPageBuild（每个 Middleware）
│   └── 可修改 GetPage 配置（如添加 transition）
│
├── ⑤ 页面构建并显示
│
└── ⑥ 页面销毁 → onPageDispose（每个 Middleware）
    └── 清理资源
```

---

## 十二、RxList/RxMap — 集合响应式

### 12.1 RxList 的特殊设计

```dart
// RxList 简化实现
class RxList<E> extends RxNotifier<List<E>> implements List<E> {
  RxList([List<E> initial = const []]) : super(initial);

  // 拦截操作符 []
  @override
  E operator [](int index) {
    RxInterface.notifyChildren(this);
    return value[index];
  }

  // 拦截赋值 []=
  @override
  void operator []=(int index, E value) {
    this.value[index] = value;
    refresh();  // 手动触发通知
  }

  // 拦截 add/remove 等方法
  @override
  void add(E value) {
    this.value.add(value);
    refresh();
  }

  @override
  void remove(Object? value) {
    final removed = this.value.remove(value);
    if (removed) refresh();
  }

  // 批量操作后手动调用
  void refresh() {
    _refresh();  // 调用父类的通知方法
  }
}
```

### 12.2 使用示例

```dart
class ListController extends GetxController {
  final items = <String>[].obs;  // RxList<String>

  void addItem(String item) {
    items.add(item);  // 自动触发 Obx 重建
  }

  void updateItem(int index, String item) {
    items[index] = item;  // 自动触发（拦截了 []=）
  }

  void batchUpdate(List<String> newItems) {
    items.assignAll(newItems);  // 批量替换（内部自动 refresh）
  }
}
```

**关键差异**：

- `RxList` 拦截了 `[]`、`[]=`、`add`、`remove` 等操作符
- 部分操作（如 `[]=`）需要手动调用 `refresh()`
- 批量操作建议用 `assignAll()` / `addAll()`（内部已处理 refresh）

---

## 十三、与 Vue 响应式系统的底层同构

```
┌─────────────────────────────────────────────────────────────┐
│                  响应式系统的底层同构                          │
│                                                              │
│  Vue 3                         GetX                          │
│  ─────                         ────                          │
│                                                              │
│  reactive/ref                  Rx (.obs)                     │
│  └── Proxy 拦截读写            └── getter/setter 拦截        │
│                                                              │
│  effect                        Obx / GetBuilder              │
│  └── activeEffect 全局变量     └── RxInterface.observer      │
│  └── track() 收集依赖          └── notifyChildren() 收集     │
│                                                              │
│  trigger                       _refresh / update             │
│  └── 值未变 → 跳过             └── 值未变 → 跳过             │
│  └── 通知 deps Set             └── 通知 listeners List       │
│                                                              │
│  computed                      Rx + debounce / RxBool        │
│  └── dirty 标记 + 惰性求值     └── 无惰性求值（需手动实现）  │
│                                                              │
│  watch                         Worker (ever/debounce/once)   │
│  └── onUnmounted 自动清理      └── onClose 自动清理          │
│                                                              │
│  ════════════════════════════════════════════════════        │
│                                                              │
│  本质都是同一个模式：                                          │
│  数据变化 → 自动通知依赖 → 执行副作用（渲染/回调）           │
│  差异只在：拦截方式（Proxy vs getter）和依赖存储结构          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 十四、高频面试题

### 14.1 GetStream 和 dart:async Stream 有什么区别？

```
dart:async Stream:
  • 异步通知（经过 Event Loop）
  • 每个 Subscription 绑定到 Zone
  • 需要手动 cancel Subscription
  • 适合通用异步数据流

GetStream:
  • 同步通知（直接遍历回调）
  • 无 Zone 绑定，内存更轻
  • 返回 VoidCallback 作为取消函数
  • 专为"值变化通知"场景优化

GetX 选择 GetStream 的原因：
  → 响应式系统需要的是"值变化立即通知 UI 重建"
  → 同步遍历比异步调度更快
  → 无 Zone 开销，适合高频更新（如动画）
```

### 14.2 SmartManagement 的 Standard 和 KeepFactory 有什么区别？

```
Standard:
  • 页面销毁 → 检查 Controller 是否被引用
  • 无引用 → 调用 onClose() + 从容器移除
  • 有引用 → 保留（如全局 Get.put()）
  • 适用：大多数场景

KeepFactory:
  • 页面销毁 → 调用 onClose() + 清空实例
  • 但保留 Factory（_InstanceBuilderFactory 不删除）
  • 下次 find 时 → 重新调用 Factory 创建新实例
  • 适用：需要频繁重建的场景（如列表页反复进出）

差异本质：
  Standard → 销毁后彻底移除，再次 find 报错
  KeepFactory → 销毁实例但保留工厂，再次 find 重建
```

### 14.3 GetxController 的 onInit 和 onReady 有什么区别？

```
onInit:
  • 调用时机：Controller 创建后立即调用
  • Widget 状态：尚未构建
  • 适合：异步初始化、创建 Worker、API 请求
  • ⚠️ 不要在这里操作 Widget（如动画、FocusNode）

onReady:
  • 调用时机：onInit 后，Widget 首次渲染完成
  • Widget 状态：已构建并显示
  • 适合：依赖 UI 的操作（启动动画、请求焦点、测量尺寸）
  • 类似 Flutter 的 WidgetsBinding.instance.addPostFrameCallback

调用顺序：构造函数 → onInit → 首次 build → onReady
```

### 14.4 为什么 GetX 路由不需要 BuildContext？

```
Flutter 原生路由：
  Navigator.of(context).push(...)  // 必须依赖 Context 查找 Navigator
  ↓
  Context → InheritedWidget → NavigatorState → 执行跳转

GetX 路由：
  Get.to(...)  // 不需要 Context
  ↓
  GetMaterialApp 在初始化时将 NavigatorState 存入全局变量
  Get.to() 直接操作全局 NavigatorState
  ↓
  本质：GetX 把 Navigator 变成了全局单例

优势：
  • 可以在任何地方调用（Service、Controller、工具函数）
  • 不需要层层传递 Context
  • 代码更简洁

劣势：
  • 全局状态，难以测试
  • 多 Navigator 场景复杂（如 Tab 嵌套）
  • 不如官方 Router 2.0 规范
```
