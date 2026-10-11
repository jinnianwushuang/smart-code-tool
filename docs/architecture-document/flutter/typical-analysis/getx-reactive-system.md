---
title: 'GetX 响应式系统核心原理拆解'
tags: ['案例']
---

# GetX 响应式系统核心原理典型拆解

> 本文档从 Dart 的 `ChangeNotifier` 出发，逐步拆解 GetX 响应式系统的核心原理：
> `.obs` 的 Rx 封装、`Obx` 的依赖收集、`Worker` 的副作用监听、`GetBuilder` 的轻量更新，
> 以及与 Vue `ref + computed + watch` 的底层同构关系。

---

## 一、GetX 响应式三要素

```
GetX 响应式系统
├── Rx 变量（.obs）   → 将普通值包装成可观察对象（类似 Vue 的 ref）
├── Obx / GetBuilder  → 注册 UI 副作用（读取 Rx 时自动收集依赖）
└── Worker（ever/debounce/once）→ 注册逻辑副作用（数据变化时执行回调）
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

## 七、高频面试题

### 7.1 Obx 和 GetBuilder 怎么选？

```
┌─────────────────────────────────────────────────────────────┐
│  选 Obx 的场景                          选 GetBuilder 的场景 │
│                                                              │
│  • 数据频繁变化（动画、实时数据）       • 数据变化少          │
│  • 不想手动管理更新                     • 需要精确控制更新    │
│  • 多个 Rx 变量组合渲染                 • 避免 Rx 包装开销    │
│  • 需要 debounce/interval 等 Worker     • 页面级大组件刷新    │
│                                                              │
│  ⚠️ 性能陷阱                            ⚠️ 性能陷阱          │
│  • 不要在 Obx 内做重计算               • 忘记调用 update()   │
│  • 避免 Obx 包裹过大的 Widget 树       • 大量 GetBuilder     │
│    → 用 const 子 Widget 减少重建          管理成本上升         │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 为什么 GetX 不需要 setState？

```
传统 Flutter：
  setState(() { _count++; });  // 必须手动触发重建
  ↓
  markNeedsBuild → 下一帧重建

GetX：
  count.value++;               // Rx 自动通知
  ↓
  Obx 收到通知 → 内部调用 setState → markNeedsBuild → 下一帧重建

本质：GetX 只是把 setState 藏到了 Rx 的通知机制里，
      底层仍然是 Flutter 的 setState → Element 重建流程。
```

### 7.3 Worker 在 onClose 不 dispose 会怎样？

```dart
// ❌ 错误：手动创建的 Worker 没有绑定生命周期
class MyController extends GetxController {
  final count = 0.obs;

  void setupWorker() {
    ever(count, (val) {
      // 如果 Controller 已销毁，这里会访问已释放的资源
      print(val);
    });
  }
}

// ✅ 正确：在 onInit 中创建（GetX 自动管理生命周期）
class MyController extends GetxController {
  final count = 0.obs;

  @override
  void onInit() {
    super.onInit();
    ever(count, (val) {
      print(val);  // Controller 销毁时自动 dispose
    });
  }
}
```

---

## 八、与 Vue 响应式系统的底层同构

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
