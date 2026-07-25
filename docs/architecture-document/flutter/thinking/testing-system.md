# Flutter 测试体系

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 测试不是"写完代码补的作业"，而是架构质量的试金石——难以测试的代码，往往是设计有问题的代码。移动端测试的独特之处在于 UI 与平台的双重复杂性，需要分层构建"测试金字塔"。

---

## 📑 目录

- [一、测试金字塔与 Flutter 映射](#一测试金字塔与-flutter-映射)
- [二、单元测试](#二单元测试)
- [三、Widget 测试](#三widget-测试)
- [四、集成测试](#四集成测试)
- [五、Golden Test（截图测试）](#五golden-test截图测试)
- [六、Mock 与测试替身](#六mock-与测试替身)
- [七、可测试性架构设计](#七可测试性架构设计)
- [八、测试数据与工厂](#八测试数据与工厂)
- [九、CI 中的测试策略](#九ci-中的测试策略)
- [十、测试度量与治理](#十测试度量与治理)

---

## 一、测试金字塔与 Flutter 映射

### 1.1 经典金字塔

```
        ╱╲
       ╱E2E╲          少（慢、贵、脆）
      ╱──────╲
     ╱ 集成测试 ╲        中
    ╱────────────╲
   ╱   Widget 测试  ╲     较多（Flutter 特色层）
  ╱──────────────────╲
 ╱      单元测试        ╲   多（快、稳、便宜）
╱────────────────────────╲

Flutter 四层测试：
┌──────────────┬────────────┬──────────┬──────────────┐
│ 类型          │ 运行环境    │ 速度      │ 验证对象       │
├──────────────┼────────────┼──────────┼──────────────┤
│ 单元测试      │ Dart VM    │ ~ms      │ 函数/类/逻辑    │
│ Widget 测试  │ Flutter 测试│ ~10-100ms│ 组件渲染/交互   │
│              │ 渲染器      │          │              │
│ 集成测试      │ 真机/模拟器 │ ~s       │ 完整用户流程    │
│ Golden 测试  │ 测试渲染器  │ ~100ms   │ UI 视觉一致性   │
└──────────────┴────────────┴──────────┴──────────────┘
```

### 1.2 各层职责边界

```
单元测试（占比 ~60%）：
✅ 业务逻辑（Bloc/Notifier/UseCase）
✅ 工具函数、数据转换
✅ Repository（Mock 数据源）
❌ 不测：UI 渲染、平台 API

Widget 测试（占比 ~25%）：
✅ 组件渲染正确性
✅ 用户交互（点击/输入/滚动）
✅ 状态变化 → UI 更新
❌ 不测：跨页面流程、真实网络

集成测试（占比 ~10%）：
✅ 核心用户旅程（登录→下单→支付）
✅ 页面间导航
✅ 真实/模拟后端联调
❌ 不测：边界条件穷举（太慢）

Golden 测试（占比 ~5%）：
✅ 视觉回归（UI 不被意外改坏）
✅ 设计规范落地验证
```

### 1.3 测试命令速查

```bash
# 单元测试 + Widget 测试
flutter test                          # 全部
flutter test test/unit/order_test.dart # 单文件
flutter test --name "should add"      # 按名称过滤

# 覆盖率
flutter test --coverage
# 生成报告：genhtml coverage/lcov.info -o coverage/html

# 集成测试
flutter test integration_test/app_test.dart -d <device_id>

# Golden 测试
flutter test --update-goldens         # 更新基准图
flutter test                          # 对比验证
```

---

## 二、单元测试

### 2.1 测试结构规范

```dart
// 文件命名：xxx_test.dart，与被测文件镜像
// lib/src/domain/order_calculator.dart
// test/src/domain/order_calculator_test.dart

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('OrderCalculator.calculateDiscount', () {
    // Arrange-Act-Assert 结构
    test('VIP 用户满 100 减 20', () {
      // Arrange
      final calculator = OrderCalculator();
      final order = OrderFixture.vip(amount: 150);

      // Act
      final discount = calculator.calculateDiscount(order);

      // Assert
      expect(discount, 20);
    });

    test('普通用户无折扣', () {
      final calculator = OrderCalculator();
      final order = OrderFixture.normal(amount: 150);

      expect(calculator.calculateDiscount(order), 0);
    });

    test('金额不足 100 无折扣', () {
      final calculator = OrderCalculator();
      final order = OrderFixture.vip(amount: 50);

      expect(calculator.calculateDiscount(order), 0);
    });
  });
}
```

### 2.2 异步测试

```dart
test('成功获取用户信息', () async {
  final repository = UserRepository(api: MockApi());

  final user = await repository.getUser(1);

  expect(user.name, '张三');
});

// 超时控制
test('慢接口超时处理', () async {
  expect(
    () => repository.fetchWithTimeout(),
    throwsA(isA<TimeoutException>()),
  );
}, timeout: Timeout(Duration(seconds: 5)));

// Stream 测试
test('计数器每秒递增', () {
  final stream = CounterStream().stream;

  expectLater(
    stream,
    emitsInOrder([0, 1, 2, emitsDone]),
  );
});
```

### 2.3 常用 Matcher

```dart
// 基础断言
expect(value, 42);
expect(value, equals(42));
expect(name, isNotEmpty);
expect(list, hasLength(3));
expect(map, containsPair('key', 'value'));

// 类型断言
expect(result, isA<Success>());
expect(() => fn(), throwsA(isA<FormatException>()));

// 近似值（浮点数必用）
expect(price, closeTo(99.99, 0.01));

// 集合断言
expect(users, everyElement(isA<User>()));
expect(ids, containsAll([1, 2, 3]));
expect(sortedList, isSorted);

// 自定义 Matcher（提升可读性）
class HasValidEmail extends Matcher {
  @override
  bool matches(item, Map context) =>
      RegExp(r'^[\w.]+@[\w.]+\.\w+$').hasMatch(item.email);
  @override
  Description describe(Description d) => d.add('有效邮箱格式');
}
expect(user, HasValidEmail());
```

---

## 三、Widget 测试

### 3.1 Widget 测试基础

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('点击按钮计数增加', (WidgetTester tester) async {
    // 构建被测 Widget
    await tester.pumpWidget(const MaterialApp(home: CounterPage()));

    // 验证初始状态
    expect(find.text('0'), findsOneWidget);

    // 模拟点击
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();  // 触发重建

    // 验证状态更新
    expect(find.text('1'), findsOneWidget);
  });
}

// pump 的作用：
// pump()：处理一帧（触发 rebuild/动画单帧）
// pumpAndSettle()：持续 pump 直到无待处理帧（动画完成）
// pump(Duration)：推进指定时间（测试定时动画）
```

### 3.2 查找器（Finder）

```dart
// 按文本
find.text('提交订单')
find.textContaining('订单')

// 按 Key（推荐：稳定不脆弱）
find.byKey(Key('submit_button'))

// 按类型
find.byType(ElevatedButton)
find.byIcon(Icons.add)

// 组合查找
find.descendant(
  of: find.byType(Card),
  matching: find.byType(Text),
)
find.widgetWithText(ElevatedButton, '确认')

// 数量断言
expect(find.byType(ListTile), findsNWidgets(5));
expect(find.text('错误'), findsNothing);
```

### 3.3 交互模拟

```dart
// 点击
await tester.tap(find.byKey(Key('like_button')));
await tester.longPress(find.byType(Card));
await tester.doubleTap(find.byType(Image));

// 文本输入
await tester.enterText(find.byType(TextField), 'hello@test.com');

// 滚动
await tester.scrollUntilVisible(
  find.text('第 100 项'),
  500,  // 每次滚动距离
  scrollable: find.byType(Scrollable),
);
await tester.drag(find.byType(ListView), Offset(0, -300));
await tester.fling(find.byType(ListView), Offset(0, -500), 1000);

// 手势
await tester.pinch(...);  // 捏合缩放

// 键盘/物理按键
await tester.sendKeyEvent(LogicalKeyboardKey.enter);
```

### 3.4 测试异步与网络

```dart
testWidgets('加载并展示订单列表', (tester) async {
  // Mock 网络层
  final mockApi = MockOrderApi();
  when(() => mockApi.fetchOrders()).thenAnswer(
    (_) async => [OrderFixture.sample()],
  );

  await tester.pumpWidget(MaterialApp(
    home: Provider.value(
      value: OrderController(api: mockApi),
      child: OrderListPage(),
    ),
  ));

  // 初始：加载指示器
  expect(find.byType(CircularProgressIndicator), findsOneWidget);

  // 等待异步完成
  await tester.pumpAndSettle();

  // 数据渲染
  expect(find.text('订单 #1001'), findsOneWidget);
  verify(() => mockApi.fetchOrders()).called(1);
});

// 测试错误状态
testWidgets('加载失败展示重试', (tester) async {
  when(() => mockApi.fetchOrders())
      .thenThrow(NetworkException('超时'));

  await tester.pumpWidget(...);
  await tester.pumpAndSettle();

  expect(find.text('加载失败'), findsOneWidget);
  expect(find.text('重试'), findsOneWidget);
});
```

---

## 四、集成测试

### 4.1 集成测试框架

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('核心用户旅程', () {
    testWidgets('登录 → 浏览商品 → 下单', (tester) async {
      app.main();  // 启动真实应用
      await tester.pumpAndSettle();

      // 1. 登录
      await tester.enterText(
        find.byKey(Key('phone_input')), '13800138000');
      await tester.tap(find.byKey(Key('login_button')));
      await tester.pumpAndSettle();

      // 2. 浏览商品
      await tester.tap(find.text('手机数码'));
      await tester.pumpAndSettle();

      // 3. 下单
      await tester.tap(find.byKey(Key('product_0')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(Key('buy_now')));
      await tester.pumpAndSettle();

      // 4. 验证订单页
      expect(find.text('订单提交成功'), findsOneWidget);
    });
  });
}
```

### 4.2 集成测试环境策略

```
后端依赖处理：
┌──────────────────────────────────────────┐
│ 方案一：测试环境后端（推荐）                  │
│ - 独立测试环境 + 测试账号                    │
│ - 数据可重置，不影响生产                      │
│                                          │
│ 方案二：Mock Server                        │
│ - 本地起 Mock 服务（WireMock/自建）           │
│ - 完全可控，但需维护 Mock 数据                │
│                                          │
│ 方案三：依赖注入切换                          │
│ - 测试构建注入 Mock API Client               │
│ - --dart-define=USE_MOCK=true              │
└──────────────────────────────────────────┘

测试数据管理：
- 专用测试账号（固定数据，可预期）
- 每次测试前重置数据（API 或数据库脚本）
- 测试间无依赖（可独立/乱序运行）
```

### 4.3 集成测试稳定性

```
防 Flaky（不稳定测试）实践：

① 充分等待，避免硬编码 sleep
// ❌ await Future.delayed(Duration(seconds: 3));
// ✅ await tester.pumpAndSettle();
// ✅ 等待特定元素出现：
await tester.pumpUntilFound(find.text('加载完成'));

② 重试机制（CI 层）
// flaky 测试自动重跑 1 次（治标）
// 根因分析才是治本

③ 超时保护
testWidgets('...', (tester) async { ... },
  timeout: Timeout(Duration(minutes: 2)));

④ 截图取证（失败时）
// IntegrationTestWidgetsFlutterBinding
//   .instance.takeScreenshot('failure_step3');

⑤ 隔离运行
// 每个测试独立启动应用（状态不串扰）
```

---

## 五、Golden Test（截图测试）

### 5.1 Golden Test 原理

```
原理：
① 渲染 Widget → 生成位图
② 与基准图（golden file）逐像素对比
③ 差异超阈值 → 测试失败

价值：
- 捕获意外的 UI 变化（样式被改坏）
- 跨组件视觉回归（改 A 影响了 B）
- 设计规范验证

局限：
- 平台/字体渲染差异 → 基准图需统一环境生成
- 频繁变化的 UI 不适合
- 不能验证交互逻辑
```

### 5.2 Golden Test 实践

```dart
import 'package:golden_toolkit/golden_toolkit.dart';

void main() {
  testGoldens('订单卡片视觉回归', (tester) async {
    await loadAppFonts();  // 加载字体（保证一致性）

    final builder = GoldenBuilder.column()
      ..addScenario('普通状态', OrderCard(order: OrderFixture.sample()))
      ..addScenario('VIP 订单', OrderCard(order: OrderFixture.vip()))
      ..addScenario('已取消', OrderCard(order: OrderFixture.cancelled()))
      ..addScenario('深色模式', OrderCard(order: OrderFixture.sample()),
          wrapper: darkModeWrapper);

    await tester.pumpWidgetBuilder(builder.build());
    await screenMatchesGolden(tester, 'order_card');
  });
}

// 生成/更新基准图：
// flutter test --update-goldens
// 基准图入库（test/goldens/*.png）
// CI 中对比验证（Linux 环境统一生成）
```

### 5.3 Golden Test 治理

```
最佳实践：
① 基准图在 CI（Linux）统一生成
   本地 macOS/Windows 渲染有微差 → 仅 CI 更新基准
② 小粒度组件测试（整页 Golden 太脆弱）
③ 多场景组合（正常/异常/边界/深色模式）
④ 差异容忍度配置（抗锯齿微差）
⑤ Golden 失败 → 人工 Review 差异图（可能是有意变更）

目录组织：
test/
├── goldens/
│   ├── components/
│   │   ├── order_card.png
│   │   └── user_avatar.png
│   └── pages/
│       └── home_page.png
```

---

## 六、Mock 与测试替身

### 6.1 测试替身分类

```
┌────────────┬──────────────────────────────┐
│ 类型        │ 用途                          │
├────────────┼──────────────────────────────┤
│ Dummy      │ 占位对象（不使用）               │
│ Fake       │ 简化实现（内存版 Repository）     │
│ Mock       │ 记录调用 + 可编程返回             │
│ Stub       │ 固定返回值                      │
│ Spy        │ 真实实现 + 记录调用               │
└────────────┴──────────────────────────────┘

移动端常用：
- Mock：mocktail / mockito（验证交互）
- Fake：内存实现（集成测试的本地存储）
```

### 6.2 mocktail 实践

```dart
import 'package:mocktail/mocktail.dart';

// 定义 Mock
class MockOrderApi extends Mock implements OrderApi {}
class FakeOrder extends Fake implements Order {}

void main() {
  late MockOrderApi api;

  setUp(() {
    api = MockOrderApi();
    registerFallbackValue(FakeOrder());  // 参数回退值
  });

  test('创建订单成功后刷新列表', () async {
    // 编排行为
    when(() => api.createOrder(any())).thenAnswer(
      (_) async => OrderFixture.sample(id: 1001));
    when(() => api.fetchOrders()).thenAnswer(
      (_) async => [OrderFixture.sample(id: 1001)]);

    final controller = OrderController(api: api);
    await controller.createOrder(OrderFixture.newOrder());

    // 验证交互
    verify(() => api.createOrder(any())).called(1);
    verify(() => api.fetchOrders()).called(1);  // 创建后刷新
    expect(controller.orders.length, 1);
  });

  test('创建订单失败不刷新', () async {
    when(() => api.createOrder(any()))
        .thenThrow(ServerException(500));

    final controller = OrderController(api: api);

    expect(
      () => controller.createOrder(OrderFixture.newOrder()),
      throwsA(isA<ServerException>()),
    );
    verifyNever(() => api.fetchOrders());
  });
}
```

### 6.3 Fake 实现模式

```dart
// Fake 本地存储（集成测试用，比 Mock 更真实）
class FakeOrderDao implements OrderDao {
  final _orders = <Order>[];

  @override
  Future<void> insert(Order order) async => _orders.add(order);

  @override
  Stream<List<Order>> watchAll() => Stream.value(List.of(_orders));

  @override
  Future<Order?> get(String id) async =>
      _orders.where((o) => o.id == id).firstOrNull;

  // 测试辅助方法
  void seed(List<Order> data) => _orders.addAll(data);
}

// Mock vs Fake 选择：
// 单元测试（验证交互逻辑）→ Mock
// 集成/Widget 测试（需要真实行为）→ Fake
```

---

## 七、可测试性架构设计

### 7.1 依赖注入是前提

```dart
// ❌ 不可测试：硬编码依赖
class OrderController {
  final api = OrderApi();  // 无法替换！
  Future<void> load() => api.fetchOrders();
}

// ✅ 可测试：构造函数注入
class OrderController {
  final OrderApi api;
  OrderController({required this.api});
  Future<void> load() => api.fetchOrders();
}

// 测试时注入 Mock，生产注入真实实现
// 大型项目：GetIt/Riverpod 统一管理依赖
```

### 7.2 逻辑与 UI 分离

```dart
// ❌ 逻辑埋在 Widget 里（无法单元测试）
class PriceWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    // 折扣计算逻辑写在这里 → 只能 Widget 测试
    final discount = price > 100 ? price * 0.8 : price;
    return Text('¥$discount');
  }
}

// ✅ 逻辑提取为纯函数/类（可单元测试）
class PriceCalculator {
  static double applyDiscount(double price) =>
      price > 100 ? price * 0.8 : price;
}

class PriceWidget extends StatelessWidget {
  Widget build(BuildContext context) =>
      Text('¥${PriceCalculator.applyDiscount(price)}');
}

// 原则：
// - 业务逻辑 → 纯 Dart 类（单元测试覆盖）
// - UI 只做展示 + 事件转发（Widget 测试覆盖）
// - 状态管理对象（Bloc/Notifier）100% 可单元测试
```

### 7.3 状态管理对象测试

```dart
// BLoC 测试（bloc_test 包）
blocTest<OrderBloc, OrderState>(
  '加载订单成功 → 发出 [loading, loaded]',
  build: () => OrderBloc(api: mockApi),
  act: (bloc) => bloc.add(LoadOrders()),
  expect: () => [
    OrderLoading(),
    OrderLoaded([OrderFixture.sample()]),
  ],
  verify: (_) => verify(() => mockApi.fetchOrders()).called(1),
);

// Riverpod 测试（ProviderContainer 覆盖）
test('订单列表 Provider', () async {
  final container = ProviderContainer(
    overrides: [
      orderApiProvider.overrideWithValue(mockApi),
    ],
  );
  addTearDown(container.dispose);

  final orders = await container.read(orderListProvider.future);
  expect(orders, hasLength(1));
});

// ChangeNotifier 测试
test('计数器递增', () {
  final notifier = CounterNotifier();
  notifier.increment();
  expect(notifier.count, 1);
});
```

---

## 八、测试数据与工厂

### 8.1 Fixture 工厂模式

```dart
// 集中管理测试数据（避免每个测试硬编码）
class OrderFixture {
  static Order sample({
    String id = '1001',
    double amount = 99.0,
    OrderStatus status = OrderStatus.paid,
  }) => Order(
    id: id,
    orderNo: 'NO$id',
    amount: amount,
    status: status,
    createdAt: DateTime(2026, 1, 1),
    items: [OrderItemFixture.sample()],
  );

  static Order vip({double amount = 200}) =>
      sample(amount: amount, status: OrderStatus.vip_discount);

  static Order cancelled() =>
      sample(status: OrderStatus.cancelled);
}

// 优势：
// - 测试意图清晰（OrderFixture.cancelled() 自解释）
// - 数据结构变更只改一处
// - 默认值合理，按需覆盖
```

### 8.2 边界值与等价类

```dart
// 等价类划分 + 边界值分析
group('价格计算', () {
  // 有效等价类
  test('普通价格无折扣', ...);      // price < 100
  test('满 100 享 8 折', ...);      // price >= 100

  // 边界值
  test('恰好 100 元', ...);         // 边界点
  test('99.99 元', ...);            // 边界下
  test('100.01 元', ...);           // 边界上

  // 无效等价类（防御性）
  test('负数价格抛异常', ...);
  test('零价格处理', ...);
  test('超大金额精度', ...);         // 浮点精度陷阱
});
```

---

## 九、CI 中的测试策略

### 9.1 测试分层执行

```
PR 阶段（快速反馈 <10min）：
├── flutter analyze（静态检查）
├── 单元测试（并行分片）
├── Widget 测试
└── 增量 Golden 对比

合并后（Nightly，30-60min）：
├── 全量测试套件
├── 集成测试（模拟器 Farm）
├── 覆盖率报告
└── 性能基线测试

发布前：
├── 真机集成测试（核心路径）
├── 多设备兼容性（设备 Farm）
└── 人工探索性测试
```

### 9.2 测试并行与加速

```yaml
# 测试分片并行（GitHub Actions 矩阵）
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: flutter test --shard-index ${{ matrix.shard-1 }} --total-shards 4

# 加速手段：
# 1. 测试分片并行（时间 / N）
# 2. 依赖缓存（pub cache）
# 3. 跳过无关测试（变更影响分析）
# 4. 集成测试仅核心路径（控制总量）
```

### 9.3 设备 Farm 集成测试

```
云端设备 Farm：
├── Firebase Test Lab（Google 官方）
├── AWS Device Farm
├── BrowserStack / Sauce Labs
└── 自建真机墙（大厂）

执行流程：
① flutter build apk --debug（含集成测试）
② 上传 APK + test APK 到 Farm
③ 选择设备矩阵（型号 × OS 版本）
④ 执行 + 收集结果/截图/日志
⑤ 失败用例自动重试 + 人工确认

设备矩阵选择：
- 覆盖主流分辨率/刘海形态
- 覆盖 OS 版本区间（min ~ latest）
- 覆盖芯片阵营（骁龙/天玑/Apple）
```

---

## 十、测试度量与治理

### 10.1 覆盖率解读

```bash
# 生成覆盖率
flutter test --coverage
# coverage/lcov.info

# 查看报告
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

```
覆盖率的正确认知：
✅ 是：发现未测试代码的线索
❌ 不是：质量的绝对保证

高覆盖率 ≠ 高质量：
- 100% 行覆盖但无断言 = 无效测试
- 覆盖了但没测边界 = 虚假安全感

合理目标：
- 核心业务逻辑：≥90%
- 工具类/基础库：≥85%
- UI 层：Widget 测试覆盖核心组件
- 整体：70-80%（不盲目追 100%）

更有价值的指标：
- 变异测试得分（Mutation Score）
- 缺陷逃逸率（线上 Bug / 总 Bug）
- 测试稳定性（Flaky 率）
```

### 10.2 测试治理规范

```
团队测试规范：
① 新增业务逻辑必须附带单元测试
② Bug 修复必须先写复现测试（红 → 绿）
③ 测试代码与业务代码同等 Review
④ Flaky 测试 24h 内修复或隔离（不允许带病运行）
⑤ 测试命名表达意图：
   ✅ 'VIP 用户满 100 减 20'
   ❌ 'test1' / 'testDiscount'

测试代码质量：
- 测试也要 DRY（Fixture 复用）
- 一个测试只验证一个行为
- 避免测试间依赖（独立可乱序）
- 测试速度守护（慢测试标记 + 优化）
```

### 10.3 测试成熟度演进

```
Level 0：无测试
  → 起步：核心逻辑单元测试

Level 1：有单元测试
  → 补充：Widget 测试覆盖核心组件

Level 2：单元 + Widget
  → 补充：集成测试覆盖核心旅程 + CI 门禁

Level 3：完整金字塔 + CI 门禁
  → 补充：Golden 测试 + 设备 Farm + 性能基线

Level 4：自动化质量守护
  → 变异测试、智能测试选择、质量大盘

演进原则：
- 从"最痛的点"开始（线上 Bug 多的模块先补）
- 先保证核心路径，再追求覆盖率
- 测试是投资，ROI 最高的先做
```

---

## 📎 参考资源

- [Flutter 测试官方文档](https://docs.flutter.dev/testing)
- [mocktail 文档](https://pub.dev/packages/mocktail)
- [golden_toolkit](https://pub.dev/packages/golden_toolkit)
- [集成测试指南](https://docs.flutter.dev/testing/integration-tests)
