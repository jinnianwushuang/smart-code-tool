---
title: Flutter 状态管理选型
tags: ['Flutter', '状态管理']
---

# Flutter 状态管理选型（2026）

> 2026 年 Flutter 状态管理格局：Riverpod、Bloc、GetX、Provider 四足鼎立，没有银弹，只有匹配。

---

## 一、四强横评

### 核心对比

| 维度 | Riverpod 3.0 | Bloc/Cubit | GetX | Provider |
|------|-------------|------------|------|----------|
| **核心理念** | 声明式依赖图 | 事件驱动单向流 | 响应式一体化 | InheritedWidget 封装 |
| **编译时安全** | ✅ | ✅ | ❌ | ❌ |
| **BuildContext 依赖** | ❌ 完全脱离 | 部分（BlocProvider） | ❌ | ✅ 强依赖 |
| **内置 DI** | ✅ | ❌（需 get_it） | ✅ | ❌ |
| **异步状态处理** | AsyncValue 原生支持 | State 手动封装 | Rx 响应式 | FutureProvider |
| **测试友好度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **学习曲线** | 中 | 中高 | 低 | 低 |
| **样板代码** | 少（代码生成） | 多（Event/State） | 极少 | 少 |
| **社区活跃度** | 🔥 最高 | 🔥 高 | 活跃 | 维护模式 |
| **月下载量（2026）** | 200 万+ | 150 万+ | 100 万+ | 80 万+（下降） |

### 底层共识

四套方案共享同一套 Flutter 响应式基础设施：

```
StatelessWidget / StatefulWidget
        ↓
    State<T> 承载局部可变状态
        ↓
  setState() → markNeedsBuild() → 重建 Widget
        ↓
  InheritedWidget → 跨层级状态共享
```

所有上层方案都是对这套机制的封装和扩展，没有脱离 Flutter 框架本身。

---

## 二、Riverpod 3.0

### 为什么是 2026 年首选

1. **编译时安全** — Provider 依赖在编译期检查，运行时不会出现 `ProviderNotFoundException`
2. **完全脱离 BuildContext** — 可在任何地方访问状态（Service、Repository、测试）
3. **内置 DI** — 不需要 get_it，Provider 本身就是依赖容器
4. **AsyncValue 三态** — `Loading / Data / Error` 原生支持，无需手动封装
5. **代码生成** — `@riverpod` 注解 + build_runner，减少样板代码
6. **离线持久化** — 3.0 新增状态持久化能力

### 核心 API

```dart
// 声明 Provider
@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;

  void increment() => state++;
}

// 使用（ConsumerWidget）
class CounterPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  }
}

// 异步 Provider
@riverpod
Future<List<User>> fetchUsers(FetchUsersRef ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/users');
  return response.data.map((json) => User.fromJson(json)).toList();
}

// 使用 AsyncValue
class UserList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final users = ref.watch(fetchUsersProvider);
    return users.when(
      loading: () => CircularProgressIndicator(),
      error: (e, _) => Text('Error: $e'),
      data: (list) => ListView.builder(
        itemCount: list.length,
        itemBuilder: (_, i) => Text(list[i].name),
      ),
    );
  }
}
```

### 适用场景

- ✅ 新项目（中大型）
- ✅ 需要强测试覆盖
- ✅ 团队有 React/函数式背景
- ✅ 多模块依赖管理
- ❌ 极简单页面（杀鸡用牛刀）

---

## 三、Bloc/Cubit

### 核心优势

1. **Event/State 分离** — 业务逻辑与 UI 完全解耦
2. **单向数据流** — 可预测、可追踪、可回放
3. **BlocObserver** — 全局状态变化监控，调试利器
4. **Hydration** — 状态自动持久化（bloc_persistence）
5. **企业级验证** — 大量大型项目实战验证

### Cubit vs Bloc

| 维度 | Cubit | Bloc |
|------|-------|------|
| 触发方式 | 直接调用方法 | 发送 Event |
| 样板代码 | 少 | 多 |
| 适用场景 | 简单状态 | 复杂业务流 |
| 可追溯性 | 中 | 高（Event 日志） |

```dart
// Cubit（简单场景）
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  void increment() => emit(state + 1);
}

// Bloc（复杂场景）
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<LoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await authRepo.login(event.email, event.password);
        emit(AuthSuccess(user));
      } catch (e) {
        emit(AuthError(e.toString()));
      }
    });
  }
}
```

### 适用场景

- ✅ 大型企业项目（10+ 人团队）
- ✅ 需要严格架构约束
- ✅ 复杂业务流程（审批/支付/多步骤）
- ✅ 需要状态回放/审计
- ❌ 快速原型（样板代码太多）

---

## 四、GetX

### 核心优势

1. **极简 API** — 最少代码量实现功能
2. **一体化** — 状态管理 + 路由 + DI + Snackbar 全包
3. **无需 Context** — 全局访问
4. **响应式** — `Obx()` 自动更新

### 架构债警告

```dart
// GetX 的便利
class CounterController extends GetxController {
  final count = 0.obs;
  void increment() => count.value++;
}

// 使用
Obx(() => Text('${controller.count.value}'));

// ⚠️ 问题：全局单例，难以测试
Get.find<CounterController>(); // 任何地方都能调用
```

**GetX 的核心问题**：

| 问题 | 影响 |
|------|------|
| 全局单例（Get.find） | 测试时无法隔离，Mock 困难 |
| 隐式依赖 | 依赖关系不可见，重构风险高 |
| 无编译时检查 | 运行时才发现 Provider 未注册 |
| 路由耦合 | GetX 路由与生态包不兼容 |
| 迁移成本高 | 全局调用点遍布，难以渐进迁移 |

### 适用场景

- ✅ 原型验证 / 黑客松（< 1 万行）
- ✅ 个人项目 / 小团队快速交付
- ✅ 已有 GetX 存量项目（不建议迁移）
- ❌ 中大型商业项目
- ❌ 需要强测试覆盖
- ❌ 多人协作长期维护

### 存量项目务实路线

如果项目已用 GetX 且代码量大，**不要冲动迁移**：

1. 用模块边界隔离 `Get.find` — 收敛到各模块入口
2. 禁止业务代码直接触碰全局 Controller
3. 新代码改用 `Obx` + 模块内局部状态
4. 逐步收口后再评估迁移

---

## 五、Provider

### 现状（2026）

- 官方已将 `ChangeNotifier` 迁入独立 `listen` 包
- Provider 进入**维护模式**，不再积极开发
- 月下载量持续下降
- **不建议新项目使用**

### 适用场景

- ✅ 遗留项目维护
- ✅ 极简单页面（1-2 个共享状态）
- ❌ 新项目

---

## 六、选型决策框架

### 三个核心问题

选型前先回答：

1. **团队能承受多大的概念升级成本？**
   - 低 → GetX / Provider
   - 中 → Riverpod
   - 高 → Bloc

2. **项目会活多久、多少人维护？**
   - < 3 个月 / 1-2 人 → GetX
   - 3-12 个月 / 3-10 人 → Riverpod
   - > 12 个月 / 10+ 人 → Riverpod / Bloc

3. **代码评审想靠"人的自觉"还是"编译器的检查"？**
   - 人的自觉 → GetX / Provider
   - 编译器检查 → Riverpod / Bloc

### 迁移成本矩阵

| 从 ↓ 到 → | Riverpod | Bloc | GetX | Provider |
|-----------|----------|------|------|----------|
| **Provider** | 低（同源） | 中 | 低 | — |
| **GetX** | 高（全量重写） | 高 | — | 低 |
| **Bloc** | 中（UI 层替换） | — | 低 | 中 |
| **Riverpod** | — | 中（UI 层替换） | 低 | 中 |

---

## 七、2026 年趋势总结

1. **Riverpod 3.0 成为新项目默认选择** — 编译时安全 + 内置 DI + 离线持久化
2. **Bloc 在大型企业项目中地位稳固** — Event/State 分离便于审计和测试
3. **GetX 社区活跃但架构债明显** — 适合快速交付，不适合长期维护
4. **Provider 逐步退出主流** — 官方重心转向 Riverpod
5. **框架层状态原语中性化** — Flutter 把 ChangeNotifier 迁入独立包，让上层方案公平竞争

---

## 参考资源

- [Riverpod 官方文档](https://riverpod.dev/)
- [Bloc 官方文档](https://bloclibrary.dev/)
- [GetX 官方文档](https://pub.dev/packages/get)
- [Flutter 状态管理官方指南](https://docs.flutter.dev/data-and-backend/state-mgmt)
- [Andrea Bizzotto - Flutter 状态管理](https://codewithandrea.com/)
