---
title: Flutter 架构中的数据·算法·显示分离思考
order: 50
---

# Flutter 架构思考 — 数据·算法·显示 三者分离

> Flutter 的 Widget 树、Stream 管线和状态管理方案，构成了移动端最精密的"渲染管线"。本文从 Flutter 架构的视角，探讨三者分离在移动端跨平台框架中的独特表达——它不仅是前端思想的延伸，更是对"声明式 UI"本质的深度诠释。

---

## 一、Flutter 与三层分离的深层关系

### 1.1 Flutter 的渲染管线本身就是一次三层分离

Flutter 的底层架构就是一条精密的三层管线：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flutter 渲染引擎内部架构                       │
│                                                                  │
│   ① 数据获取层                                                   │
│   ┌──────────────────────────────────────────────────┐          │
│   │  Dart VM + Platform Channel                      │          │
│   │  • Dart 代码发起网络请求（dio/http）               │          │
│   │  • Platform Channel 调用原生 API                   │          │
│   │  • 返回原始字节流 / JSON                           │          │
│   │                                                   │          │
│   │  特征：只负责"拿到原始数据"                        │          │
│   └──────────────────────────────────────────────────┘          │
│                          ↓                                       │
│   ② 算法处理层                                                   │
│   ┌──────────────────────────────────────────────────┐          │
│   │  Framework Layer（Dart 框架层）                    │          │
│   │  • Widget 构建：声明式描述 UI 结构                 │          │
│   │  • Element Tree：将 Widget 配置实例化为元素        │          │
│   │  • Render Object：计算布局（Layout）               │          │
│   │                                                   │          │
│   │  状态管理（BLoC / Riverpod / Provider）            │          │
│   │  • 业务逻辑处理                                   │          │
│   │  • 数据转换和派生                                  │          │
│   │                                                   │          │
│   │  特征：纯 Dart 计算，不涉及底层渲染               │          │
│   └──────────────────────────────────────────────────┘          │
│                          ↓                                       │
│   ③ 界面显示层                                                   │
│   ┌──────────────────────────────────────────────────┐          │
│   │  Engine Layer（C++ 引擎层）                        │          │
│   │  • Skia / Impeller 光栅化                         │          │
│   │  • GPU 渲染管线                                   │          │
│   │  • 图层合成与输出                                  │          │
│   │                                                   │          │
│   │  特征：只关心"怎么画到屏幕上"                      │          │
│   └──────────────────────────────────────────────────┘          │
│                          ↓                                       │
│                     用户看到的像素                                  │
└─────────────────────────────────────────────────────────────────┘
```

**关键洞察**：Flutter 的 `Widget → Element → RenderObject → Skia` 管线，与浏览器的 `HTML → DOM → Render Tree → Paint → Composite` 管线高度同构。Flutter 的应用层代码（Dart）中的三层分离，就是在与这条底层管线对齐。

### 1.2 Flutter 状态分类与三层映射

Flutter 的状态分类（参考状态管理架构文档）天然对应三层：

| 状态类型       | 对应三层       | 管理方式                       | 说明                            |
| -------------- | -------------- | ------------------------------ | ------------------------------- |
| **外部状态**   | ① 接口原始数据 | Repository + dio               | 来自 API / 本地数据库的原始数据 |
| **业务状态**   | ② 算法层       | BLoC / Riverpod                | 对原始数据的加工、计算、派生    |
| **UI 状态**    | ③ 界面显示数据 | StatefulWidget / ValueNotifier | 直接驱动 Widget 重建的局部状态  |
| **持久化状态** | 跨层           | SharedPreferences / Hive       | 三层中任何一层都可能需要持久化  |

---

## 二、BLoC 模式：三层分离的教科书实现

### 2.1 BLoC 的三层职责

BLoC（Business Logic Component）模式是 Flutter 中最严格的状态管理方案，它天然就是三层分离的实现：

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLoC 模式中的三层                              │
│                                                                  │
│   ① 数据层：Repository                                           │
│   ┌──────────────────────────────────────────────────┐          │
│   │  class UserRepository {                           │          │
│   │    Future<User> fetchUser(int id);                │          │
│   │    Stream<User> watchUser(int id);                │          │
│   │  }                                                │          │
│   │                                                   │          │
│   │  职责：只负责获取原始数据，不关心业务逻辑          │          │
│   └──────────────────────────────────────────────────┘          │
│                          ↓                                       │
│   ② 算法层：BLoC                                                 │
│   ┌──────────────────────────────────────────────────┐          │
│   │  class UserBLoC extends Bloc<UserEvent, UserState>│          │
│   │    // Event → 算法处理 → State                    │          │
│   │    on<LoadUser>((event, emit) async {             │          │
│   │      final raw = await repo.fetchUser(event.id);  │          │
│   │      final viewModel = transformToViewModel(raw);  │          │
│   │      emit(UserLoaded(viewModel));                  │          │
│   │    });                                             │          │
│   │  }                                                │          │
│   │                                                   │          │
│   │  职责：接收 Event，调用 Repository，执行业务算法，  │          │
│   │       输出 State（显示数据）                        │          │
│   └──────────────────────────────────────────────────┘          │
│                          ↓                                       │
│   ③ 显示层：Widget                                               │
│   ┌──────────────────────────────────────────────────┐          │
│   │  BlocBuilder<UserBLoC, UserState>(                │          │
│   │    builder: (context, state) {                     │          │
│   │      if (state is UserLoaded) {                    │          │
│   │        return Text(state.viewModel.displayName);   │          │
│   │      }                                             │          │
│   │    },                                              │          │
│   │  )                                                │          │
│   │                                                   │          │
│   │  职责：只根据 State 渲染 UI，不包含业务逻辑        │          │
│   └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 BLoC 的数据流：与浏览器管线的同构

```
浏览器：  HTTP Response → Parser → Layout → Paint → Screen
BLoC：    API Response  → Event  → BLoC  → State → Widget

同构关系：
• HTTP Response ↔ API Response：原始数据输入
• Parser ↔ Event：触发处理的入口
• Layout ↔ BLoC：核心计算逻辑
• Paint ↔ State：输出中间表示
• Screen ↔ Widget：最终渲染
```

### 2.3 BLoC 的标准代码组织

```dart
// ── ① 数据层 ──
// lib/data/repositories/user_repository.dart
class UserRepository {
  final Dio _dio;

  Future<UserRawData> fetchUser(int id) async {
    final response = await _dio.get('/api/users/$id');
    return UserRawData.fromJson(response.data);  // 返回原始数据模型
  }

  Stream<UserRawData> watchUsers() async* {
    // 流式数据获取
  }
}

// ── ② 算法层（纯函数，不依赖 Flutter）──
// lib/domain/transforms/user_transform.dart
class UserTransform {
  /// 纯函数：原始数据 → 显示数据
  static UserViewModel toViewModel(UserRawData raw) {
    return UserViewModel(
      id: raw.id,
      displayName: '${raw.firstName} ${raw.lastName}',
      departmentName: DepartmentResolver.resolve(raw.deptId),
      statusText: StatusMapper.toText(raw.status),
      lastLoginText: TimeFormatter.relative(raw.lastLoginAt),
    );
  }

  /// 纯函数：列表过滤和排序
  static List<UserViewModel> buildList(
    List<UserRawData> rawList,
    UserFilters filters,
  ) {
    return rawList
        .where((u) => matchesFilters(u, filters))
        .toList()
      ..sort((a, b) => b.score.compareTo(a.score))
      ..map(toViewModel).toList();
  }
}

// ── ②③ 桥梁层（BLoC）──
// lib/presentation/blocs/user_bloc.dart
class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository _repository;

  UserBloc(this._repository) : super(UserInitial()) {
    on<LoadUsers>(_onLoadUsers);
    on<FilterChanged>(_onFilterChanged);
  }

  Future<void> _onLoadUsers(LoadUsers event, Emitter<UserState> emit) async {
    emit(UserLoading());
    try {
      final rawUsers = await _repository.fetchUsers();
      // 算法层转换
      final viewModel = UserTransform.buildList(rawUsers, UserFilters.empty());
      emit(UserLoaded(viewModel));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  void _onFilterChanged(FilterChanged event, Emitter<UserState> emit) {
    final currentState = state;
    if (currentState is UserLoaded) {
      // 重新应用算法
      final filtered = UserTransform.buildList(
        currentState.rawData,  // 保留原始数据用于重新计算
        event.filters,
      );
      emit(UserLoaded(filtered, rawData: currentState.rawData));
    }
  }
}

// ── ③ 显示层（Widget）──
// lib/presentation/pages/user_list_page.dart
class UserListPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoading) return CircularProgressIndicator();
        if (state is UserLoaded) {
          return ListView.builder(
            itemCount: state.users.length,
            itemBuilder: (context, index) {
              final user = state.users[index];
              return ListTile(
                title: Text(user.displayName),
                subtitle: Text(user.departmentName),
                trailing: Text(user.statusText),
              );
            },
          );
        }
        return SizedBox();
      },
    );
  }
}
```

---

## 三、Riverpod：更轻量的三层分离

### 3.1 Riverpod 的三层映射

Riverpod 以更少的样板代码实现三层分离：

```dart
// ── ① 数据层 ──
// lib/providers/user_providers.dart
final userRepositoryProvider = Provider((ref) => UserRepository(ref.watch(dioProvider)));

final usersRawProvider = FutureProvider<List<UserRawData>>((ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.fetchUsers();  // 返回原始数据
});

// ── ② 算法层（纯函数 + Provider 组合）──
final filteredUsersProvider = Provider<List<UserViewModel>>((ref) {
  final rawAsync = ref.watch(usersRawProvider);
  final filters = ref.watch(filtersProvider);

  return rawAsync.when(
    data: (rawList) => UserTransform.buildList(rawList, filters),
    loading: () => [],
    error: (_, __) => [],
  );
});

// ── ③ 显示层 ──
class UserListWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 直接消费算法层的输出
    final users = ref.watch(filteredUsersProvider);

    return ListView.builder(
      itemCount: users.length,
      itemBuilder: (context, index) => UserTile(user: users[index]),
    );
  }
}
```

### 3.2 Riverpod 的"自动依赖追踪"与 Vue computed 的同构

Riverpod 的 Provider 自动追踪依赖关系，当上游 Provider 变化时自动失效并重新计算——这与 Vue 的 `computed` 行为高度一致：

```
Vue：     rawUsers(reactive) → computed(buildList) → 模板渲染
Riverpod：usersRawProvider   → filteredUsersProvider → Widget 重建

共同特征：
• 自动依赖追踪（不需要手动声明依赖列表）
• 上游变化时自动重新计算
• 结果自动缓存，避免重复计算
```

---

## 四、Stream：Flutter 独有的"数据流管线"

### 4.1 Stream 是 Flutter 的"渲染管线"

Flutter 的 Stream 机制是连接三层的独特纽带。与 Web 前端的 Promise/Fetch 不同，Flutter 大量使用 Stream 来处理持续变化的数据：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stream 驱动的三层数据流                        │
│                                                                  │
│   ① 数据源（Repository）                                         │
│      Stream<UserRawData> ────── 持续产出原始数据                  │
│                    ↓                                             │
│   ② 算法管线（BLoC / Transform）                                  │
│      .map(transform) ──────── 对每个数据做转换                    │
│      .where(filter)  ──────── 过滤不需要的数据                    │
│      .distinct()   ────────── 去重，避免无效更新                  │
│                    ↓                                             │
│   ③ 显示层（Widget）                                              │
│      StreamBuilder ────────── 根据最新数据重建 Widget             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Stream 管线 vs 浏览器渲染管线

```
浏览器：
  HTML 字节流 → Parser → DOM Tree → Layout → Paint → 像素帧
  （持续接收、增量解析、实时更新）

Flutter Stream：
  API 数据流 → Repository → BLoC → State → Widget rebuild → Skia 渲染
  （持续接收、增量处理、实时更新）

共同特征：
• 都是"流式"的——数据持续到达，界面持续更新
• 都是"增量"的——不需要每次从头重建
• 都是"单向"的——数据从上游流向下游，不反向
```

### 4.3 Stream 的标准用法

```dart
// ① 数据层：Repository 提供 Stream
Stream<List<OrderRawData>> watchOrders() {
  return _websocketClient
      .stream('orders')
      .map((json) => OrderRawData.fromJsonList(json));
}

// ② 算法层：BLoC 中用 Stream 变换
class OrderBLoC extends Bloc<OrderEvent, OrderState> {
  OrderBLoC(this._repo) : super(OrderInitial()) {
    on<WatchOrders>((event, emit) async {
      await emit.forEach(
        _repo.watchOrders()
            .map((rawList) => OrderTransform.buildList(rawList))  // 算法转换
            .distinct(),  // 去重，避免无效重建
        onData: (viewModel) => OrderLoaded(viewModel),
      );
    });
  }
}

// ③ 显示层：BlocBuilder 自动响应
BlocBuilder<OrderBLoC, OrderState>(
  builder: (context, state) {
    if (state is OrderLoaded) {
      return OrderListView(orders: state.orders);
    }
    return LoadingView();
  },
)
```

---

## 五、Flutter 特有的挑战与应对

### 5.1 挑战一：Widget 重建的成本意识

Flutter 的 Widget 是"不可变的配置对象"，每次 State 变化都会触发 Widget 重建。如果算法层没有在合适的时机完成转换，就可能在 Widget 的 `build()` 方法中执行昂贵的计算：

```dart
// ❌ 反模式：在 build() 中做数据转换
class UserListWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final rawUsers = context.watch<UserProvider>().rawUsers;
    // 每次 build 都会重新执行转换！
    final processed = rawUsers
        .where((u) => u.status == 1)
        .map((u) => UserViewModel.fromRaw(u))
        .toList();
    return ListView(/* ... */);
  }
}

// ✅ 正确：在 Provider/BLoC 中完成转换，Widget 只消费结果
class UserListWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewModel = ref.watch(filteredUsersProvider);  // 已缓存的计算结果
    return ListView(/* ... */);
  }
}
```

### 5.2 挑战二：context 与三层的边界

Flutter 的 `context` 是一个强大的依赖查找工具，但它不应该渗透到算法层：

| 规则                                 | 说明                          |
| ------------------------------------ | ----------------------------- |
| Repository 不使用 `context`          | 数据获取层不依赖 Flutter 框架 |
| Transform 纯函数不使用 `context`     | 算法层不依赖 Flutter 框架     |
| Widget 的 `build()` 中使用 `context` | 显示层可以访问 Flutter 上下文 |
| BLoC 通过构造函数注入依赖            | 桥梁层通过 DI 获取 Repository |

### 5.3 挑战三：Platform Channel 的跨层穿透

Platform Channel 允许 Dart 调用原生代码，但它应该只出现在数据层：

```dart
// ✅ 正确：Platform Channel 封装在 Repository 中
class LocationRepository {
  Future<LocationRawData> getCurrentLocation() async {
    final result = await _channel.invokeMethod('getLocation');
    return LocationRawData.fromJson(result);
  }
}

// ❌ 反模式：在 Widget 中直接调用 Platform Channel
class LocationWidget extends StatelessWidget {
  void _getLocation() async {
    final result = await platformChannel.invokeMethod('getLocation');
    // 在显示层直接处理原始数据...
  }
}
```

---

## 六、Flutter 的"防火墙"检验

### 6.1 三层独立可测试

```dart
// ✅ 算法层可脱离 Flutter 环境独立测试
import 'package:test/test.dart';
import 'package:my_app/domain/transforms/user_transform.dart';

void main() {
  test('UserTransform.toViewModel 正确转换', () {
    final raw = UserRawData(
      id: 1, firstName: 'John', lastName: 'Doe',
      status: 1, deptId: 2, score: 85,
    );
    final viewModel = UserTransform.toViewModel(raw);
    expect(viewModel.displayName, 'John Doe');
    expect(viewModel.statusText, 'Active');
  });
  // 不需要 WidgetTester，不需要 pumpWidget
}
```

### 6.2 三层可独立替换

| 替换场景                            | 需要改动的文件     | 不需要改动的文件      |
| ----------------------------------- | ------------------ | --------------------- |
| 数据源换了（REST → WebSocket）      | Repository 实现    | Transform、Widget     |
| UI 换了（Material → Cupertino）     | Widget 文件        | Repository、Transform |
| 排序规则变了                        | Transform 文件     | Repository、Widget    |
| 状态管理方案换了（BLoC → Riverpod） | Provider/BLoC 文件 | Repository、Transform |

### 6.3 检验清单

- [ ] `domain/transforms/` 下的转换函数是否不 import `flutter` 或 `widgets`？
- [ ] Repository 是否只返回原始数据模型（不掺杂业务逻辑）？
- [ ] Widget 的 `build()` 方法中是否避免了昂贵的数据转换？
- [ ] BLoC/Provider 是否保留了原始数据以支持重新过滤/排序？
- [ ] Platform Channel 调用是否封装在 Repository 层？

---

## 七、三大框架对比：Flutter vs Vue vs React 的三层分离

| 维度               | Vue                         | React                      | Flutter                                |
| ------------------ | --------------------------- | -------------------------- | -------------------------------------- |
| **数据获取层**     | api/ + api-request 模块     | React Query / SWR / RSC    | Repository + dio                       |
| **算法层载体**     | transform 纯函数 + computed | transform 纯函数 + useMemo | Transform 纯函数 + Provider/BLoC       |
| **显示数据层**     | ref/reactive + 模板         | useState + JSX             | State + Widget                         |
| **自动同步机制**   | computed 自动追踪           | useMemo 手动依赖           | Provider 自动追踪                      |
| **逻辑复用单元**   | Composable (use-*)          | Custom Hook                | Provider / BLoC                        |
| **框架自动化程度** | 高（响应式自动同步）        | 低（手动管理为主）         | 中（Provider 自动，Widget 手动）       |
| **渲染管线**       | 模板编译 → VDOM → DOM       | JSX → VDOM → DOM           | Widget → Element → RenderObject → Skia |

**共同本质**：无论框架怎么变，三层分离的思想不变——**数据进来，算法加工，显示出去**。

---

## 八、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Flutter 的三层分离实现路径：                                    │
│                                                                  │
│   ① 接口原始数据    →  Repository + dio / Platform Channel       │
│   ② 算法处理        →  domain/transforms/（纯 Dart 函数）        │
│   ③ 界面显示数据    →  BLoC State / Provider + Widget            │
│                                                                  │
│   Flutter 提供的"机制"：                                          │
│   • Stream：持续数据流的三层管线                                  │
│   • BLoC：严格的 Event → State 单向数据流                        │
│   • Riverpod：自动依赖追踪的 Provider 体系                       │
│   • Widget 不可变性：每次重建都是确定性的                         │
│                                                                  │
│   Flutter 的独特之处：                                            │
│   • 渲染管线更深（Widget → Element → RenderObject → Skia）       │
│   • Widget 重建成本需要更精细的算法层缓存                        │
│   • Platform Channel 必须封装在数据层，不能渗透到其他层           │
│   • Stream 是连接三层的独特纽带，比 Web 的 Promise 更强大         │
│                                                                  │
│   核心思想不变：                                                   │
│   数据进来 → 算法加工 → 显示出去                                  │
│   Flutter 只是用 Dart 和 Skia 重新演绎了这条永恒的管线            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Flutter 的三层分离，本质上是将 Web 前端已经验证的架构思想，用 Dart 语言和 Skia 渲染引擎重新表达。框架不同，思想相同——**数据·算法·显示**，三者分离，与渲染管线同构。
