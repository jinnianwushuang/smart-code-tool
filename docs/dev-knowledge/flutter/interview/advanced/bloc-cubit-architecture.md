---
title: 'BLoC/Cubit 架构模式与大规模实践 [P6-P7]'
level: 'senior'
tags: ['BLoC', 'Cubit', 'Flutter', '状态管理', '事件驱动']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# BLoC/Cubit 架构模式与大规模实践 [P6-P7]

> BLoC（Business Logic Component）是 Flutter 最成熟的状态管理方案之一。事件驱动模型、可预测的状态流转、完善的测试支持，使其成为大型项目的首选。

## 核心概念（What）

### BLoC vs Cubit 对比

| 特性     | BLoC                       | Cubit                      |
| -------- | -------------------------- | -------------------------- |
| 模型     | 事件驱动（Event → State）  | 方法调用（Method → State） |
| 复杂度   | 高（需定义 Event + State） | 低（直接调用方法）         |
| 可测试性 | 极好（事件流可测试）       | 好                         |
| 适用场景 | 大型项目、复杂业务逻辑     | 中小型项目、简单逻辑       |
| 代码量   | 多                         | 少                         |

---

## 底层原理（Why）

### 1. BLoC 底层：双 Stream 事件驱动模型

**核心问题**：BLoC 的事件驱动底层到底是什么？

```
底层数据结构：

[Bloc<Event, State>]
        │
        ├─ _eventController: StreamController<Event>（事件流控制器）
        │   └─ 内部维护一个事件队列（FIFO）
        │
        ├─ _stateController: StreamController<State>（状态流控制器）
        │   └─ 内部维护状态订阅者列表
        │
        └─ _handlers: Map<Type, _EventHandler>（事件处理器注册表）
            └─ on<Increment>((event, emit) { ... })
               ──► _handlers[Increment] = handler

完整执行链路：

[bloc.add(Increment())]
        ↓
[_eventController.add(Increment)]
        ↓
[事件进入队列] ──► 按顺序处理（FIFO）
        ↓
[_dispatchLoop] ──► 循环从队列中取出事件
        ↓
[_handlers[Increment]] ──► 查找对应的事件处理器
        ↓
[handler(event, emit)]
        ├─ emit 是 Emitter 对象，内部调用 _stateController.add(newState)
        └─ emit 会检查是否已被取消（防止状态竞争）
        ↓
[_stateController.stream] ──► 状态流广播
        ↓
[BlocBuilder 监听状态流]
        └─ 收到新状态 → 调用 _element.markNeedsBuild()
        ↓
[UI 更新]
```

**关键洞察**：

- BLoC 内部是两个独立的 StreamController，事件流和状态流分离
- 事件是**串行处理**的（队列 + 顺序执行），天然避免状态竞争
- `emit` 不是直接修改状态，而是向状态流广播新值
- `on<Event>` 本质是注册事件处理器到 Map 中
- `transformEvents` 可以在事件进入队列前进行转换（防抖/节流/去重）

### 2. emit 调度与状态竞争防护

```
emit 的底层安全机制：

[handler 开始执行]
        ↓
[创建 Emitter 对象] ──► 内部持有 _isCanceled 标志
        ↓
[emit(newState)]
        ├─ 检查 _isCanceled → 如果已取消则抛出异常
        ├─ 检查 newState != state → 相同状态不重复 emit
        └─ _stateController.add(newState) → 广播给所有监听者

状态竞争防护：
[快速连续 add(FetchUser('A')) 和 add(FetchUser('B'))]
        ↓
[队列中依次处理]
        ├─ FetchUser('A') 开始 → emit(loading)
        ├─ FetchUser('A') 的 emit 被取消（因为新事件进来了）
        └─ FetchUser('B') 开始 → emit(loading) → emit(loaded('B'))

BlocObserver 全局监控：
[BlocObserver] ──► 全局单例观察者
        ├─ onEvent(bloc, event) ──► 每个事件被 add 时触发
        ├─ onTransition(bloc, transition) ──► 每次状态转换时触发
        └─ onError(bloc, error, stackTrace) ──► 异常时触发
```

### 3. BlocBuilder 底层：StreamBuilder 的封装

```
BlocBuilder 本质是 StreamBuilder<State> 的语法糖：

[BlocBuilder<Bloc, State>(builder: (context, state) => ...)]
        ↓
[内部创建 _BlocBuilderBase extends StreamBuilder<State>]
        ├─ stream = bloc.stream（状态流）
        ├─ initialData = bloc.state（当前状态）
        └─ builder = 用户传入的 builder

BlocListener 底层：
[BlocListener] ──► 内部用 StreamSubscription 监听状态流
        └─ 每次状态变化触发 listener 回调（不重建 UI）

BlocProvider 底层：
[BlocProvider] ──► 内部用 InheritedWidget 向下传递 Bloc 实例
        ├─ create: (context) => MyBloc() ──► 创建 Bloc 实例
        └─ 子 Widget 通过 context.read<MyBloc>() 查找
            └─ 本质是 dependOnInheritedWidgetOfExactType
```

### 4. Cubit vs BLoC 底层差异

```
Cubit 是 BLoC 的简化版，底层差异：

┌─────────────────┬─────────────────┬─────────────────┐
│                 │      BLoC       │      Cubit      │
├─────────────────┼─────────────────┼─────────────────┤
│ 事件流         │ ✅ StreamController<Event>  │ ❌ 无事件流          │
│ 状态流         │ ✅ StreamController<State>  │ ✅ StreamController<State> │
│ 状态触发       │ emit(state)       │ emit(state)       │
│ 事件处理       │ on<Event>(handler) │ 直接定义方法      │
│ 状态竞争防护   │ ✅ 队列串行       │ ❌ 需手动处理      │
│ transformEvents │ ✅ 支持          │ ❌ 不支持          │
│ 测试           │ blocTest(事件序列) │ blocTest(方法调用) │
└─────────────────┴─────────────────┴─────────────────┘

Cubit 没有事件队列，直接调用方法 → emit，
所以并发调用时可能发生状态竞争。
```

---

## 代码示例

### BLoC 事件驱动模型

```dart
// BLoC 核心：Event → Stream → State

// 1. 定义事件
abstract class CounterEvent {}
class Increment extends CounterEvent {}
class Decrement extends CounterEvent {}
class Reset extends CounterEvent {}

// 2. 定义状态
class CounterState {
  final int count;
  const CounterState({required this.count});
}

// 3. 实现 BLoC
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState(count: 0)) {
    on<Increment>((event, emit) {
      emit(CounterState(count: state.count + 1));
    });

    on<Decrement>((event, emit) {
      emit(CounterState(count: state.count - 1));
    });

    on<Reset>((event, emit) {
      emit(const CounterState(count: 0));
    });
  }
}

// 4. 使用
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => CounterBloc(),
      child: BlocBuilder<CounterBloc, CounterState>(
        builder: (context, state) {
          return Column(
            children: [
              Text('${state.count}'),
              ElevatedButton(
                onPressed: () => context.read<CounterBloc>().add(Increment()),
                child: Text('Increment'),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

### Cubit 简化模式

```dart
// Cubit：BLoC 的简化版（直接调用方法）

class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);

  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
  void reset() => emit(0);
}

// 使用
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => CounterCubit(),
      child: BlocBuilder<CounterCubit, int>(
        builder: (context, count) {
          return Column(
            children: [
              Text('$count'),
              ElevatedButton(
                onPressed: () => context.read<CounterCubit>().increment(),
                child: Text('Increment'),
              ),
            ],
          );
        },
      ),
    );
  }
}

// Cubit vs BLoC 选择：
// ├── 简单逻辑（计数器、开关）→ Cubit
// ├── 复杂业务（多事件、状态机）→ BLoC
// └── 需要事件转换（transformEvents）→ BLoC
```

### bloc_test 测试

```dart
import 'package:bloc_test/bloc_test.dart';

// BLoC 测试
blocTest<CounterBloc, CounterState>(
  'emits [1] when Increment is added',
  build: () => CounterBloc(),
  act: (bloc) => bloc.add(Increment()),
  expect: () => [const CounterState(count: 1)],
);

blocTest<CounterBloc, CounterState>(
  'emits [1, 2] when multiple Increments are added',
  build: () => CounterBloc(),
  act: (bloc) => bloc
    ..add(Increment())
    ..add(Increment()),
  expect: () => [
    const CounterState(count: 1),
    const CounterState(count: 2),
  ],
);

// Cubit 测试
blocTest<CounterCubit, int>(
  'emits [1] when increment is called',
  build: () => CounterCubit(),
  act: (cubit) => cubit.increment(),
  expect: () => [1],
);

// 带 Mock 的测试
class MockUserRepository extends Mock implements UserRepository {}

blocTest<UserBloc, UserState>(
  'emits loaded state when fetch succeeds',
  build: () {
    final repo = MockUserRepository();
    when(() => repo.fetchUser()).thenAnswer((_) async => User(name: 'Alice'));
    return UserBloc(repo);
  },
  act: (bloc) => bloc.add(FetchUser()),
  expect: () => [
    UserState.loading(),
    UserState.loaded(User(name: 'Alice')),
  ],
);
```

### HydratedBloc 持久化

```dart
import 'package:hydrated_bloc/hydrated_bloc.dart';

// HydratedBloc：自动持久化状态
class ThemeCubit extends HydratedCubit<ThemeState> {
  ThemeCubit() : super(ThemeState.light);

  void toggle() => emit(
    state == ThemeState.light ? ThemeState.dark : ThemeState.light,
  );

  @override
  ThemeState? fromJson(Map<String, dynamic> json) {
    return ThemeState.values[json['theme'] as int];
  }

  @override
  Map<String, dynamic>? toJson(ThemeState state) {
    return {'theme': state.index};
  }
}

// 初始化
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  HydratedBloc.storage = await HydratedStorage.build(
    storageDirectory: await getApplicationDocumentsDirectory(),
  );
  runApp(const MyApp());
}
```

### 大型项目分层架构

```
lib/
├── core/                        # 核心层
│   ├── error/                   # 错误处理
│   ├── network/                 # 网络配置
│   └── utils/                   # 工具类
│
├── features/                    # 功能模块
│   ├── auth/                    # 认证功能
│   │   ├── data/                # 数据层
│   │   │   ├── repositories/    # Repository 实现
│   │   │   ├── datasources/     # 远程/本地数据源
│   │   │   └── models/          # 数据模型
│   │   ├── domain/              # 领域层
│   │   │   ├── entities/        # 业务实体
│   │   │   ├── repositories/    # Repository 接口
│   │   │   └── usecases/        # 用例
│   │   └── presentation/        # 展示层
│   │       ├── bloc/            # BLoC/Cubit
│   │       ├── pages/           # 页面
│   │       └── widgets/         # 组件
│   │
│   └── home/                    # 首页功能
│       ├── data/
│       ├── domain/
│       └── presentation/
│
└── app/                         # 应用入口
    ├── app.dart
    └── router.dart
```

---

## 高频面试题

### Q1: BLoC 的事件驱动模型有什么优势？

**参考答案要点**：

- 可预测的状态流转（Event → State 单向数据流）
- 事件可测试（blocTest 精确验证事件序列）
- 支持事件转换（transformEvents 实现防抖/节流）
- 状态不可变（immutability）
- 适合复杂业务逻辑

### Q2: BLoC 和 Cubit 如何选择？

**参考答案要点**：

- BLoC：事件驱动，适合复杂业务（多事件、状态机）
- Cubit：方法调用，适合简单逻辑（计数、开关）
- 大型项目推荐 BLoC（事件流可追踪、可测试）
- 中小型项目推荐 Cubit（代码量少）

### Q3: BLoC 的分层架构如何设计？

**参考答案要点**：

- Data 层：Repository 实现、数据源（Remote/Local）、数据模型
- Domain 层：业务实体、Repository 接口、用例
- Presentation 层：BLoC/Cubit、页面、组件
- 依赖方向：Presentation → Domain ← Data

---

## 延伸思考

1. **设计题**：为一个电商应用设计 BLoC 架构（商品/购物车/订单/用户）。
2. **场景题**：BLoC 中事件处理耗时操作（网络请求），如何避免状态竞争？
3. **对比题**：BLoC vs Riverpod vs GetX，大型 Flutter 项目怎么选？

---

## 参考资料

- [BLoC 文档](https://bloclibrary.dev)
- [HydratedBloc](https://bloclibrary.dev/hydrated-bloc)
- [bloc_test](https://pub.dev/packages/bloc_test)
