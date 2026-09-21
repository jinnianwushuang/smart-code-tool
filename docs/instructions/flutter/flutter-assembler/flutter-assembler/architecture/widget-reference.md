# Widget 装配模式参照

> Flutter 3 + GetX 架构下的 Widget 标准写法与组合模式。

## 核心原则

1. **Widget 即 UI 描述**：`build` 方法只描述 UI 结构，不包含业务逻辑
2. **const 构造优先**：所有无动态参数的 Widget 必须使用 `const`
3. **Obx 下沉至叶子节点**：响应式状态监听尽量贴近最小刷新单元
4. **禁止在 build 内调用 Get.put**：依赖注入必须在 Binding 或生命周期中完成
5. **GetView 替代 StatelessWidget**：需要访问 Controller 时使用 `GetView<T>`

## 页面 Widget 标准写法

```dart
/// 用户管理页面入口
class UserManagementPage extends GetView<UserManagementController> {
  const UserManagementPage({super.key});

  @override
  String? get tag => null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('用户管理')),
      body: Column(
        children: [
          const _SearchBar(),          // 搜索区域
          _DataTable(),                 // 表格区域（含 Obx）
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.handleAddClick,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

## 子组件标准写法

```dart
/// 搜索区域（无状态，const 构造）
class _SearchBar extends StatelessWidget {
  const _SearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<UserManagementController>();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: TextField(
        decoration: const InputDecoration(
          hintText: '搜索用户',
          prefixIcon: Icon(Icons.search),
          border: OutlineInputBorder(),
        ),
        onChanged: controller.handleSearchChange,
      ),
    );
  }
}
```

## Obx 下沉至叶子节点

```dart
/// ✅ 正确：Obx 包裹最小刷新单元
class _UserCountBadge extends StatelessWidget {
  const _UserCountBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<UserManagementController>();
    return Obx(() => Text('共 ${controller.users.length} 人'));
  }
}

/// ❌ 错误：Obx 包裹整个页面导致全页刷新
class _BadPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<UserManagementController>();
    return Obx(() => Scaffold(  // 整个 Scaffold 都在 Obx 内
      body: Column(children: [/* 大量子组件 */]),
    ));
  }
}
```

## GetBuilder vs Obx 选型

```dart
/// GetBuilder：简单状态，不需要响应式（手动 update）
class _CounterWidget extends StatelessWidget {
  const _CounterWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<CounterController>(
      id: 'counter',  // 精确刷新
      builder: (c) => Text('计数: ${c.count}'),
    );
  }
}

/// Obx：响应式状态，自动追踪依赖
class _StatusWidget extends StatelessWidget {
  const _StatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<StatusController>();
    return Obx(() => Text('状态: ${controller.status.value}'));
  }
}
```

## const 构造规则

```dart
/// ✅ 必须 const 的场景
const SizedBox(height: 16)
const Icon(Icons.add)
const EdgeInsets.all(16)
const Text('标题')
const Divider()

/// ✅ 自定义 Widget 支持 const
class MyCard extends StatelessWidget {
  const MyCard({super.key, required this.title});
  final String title;
  // ...
}

/// ❌ 不能 const 的场景（有运行时计算）
Widget(width: MediaQuery.of(context).size.width * 0.5)
```

## Widget 组合模式

```dart
/// 通过组合小组件构建复杂 UI
class _UserDetailCard extends StatelessWidget {
  const _UserDetailCard({super.key, required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _UserNameRow(name: user.name),
            const SizedBox(height: 8),
            _UserEmailRow(email: user.email),
            const SizedBox(height: 8),
            _UserRoleChip(role: user.role),
          ],
        ),
      ),
    );
  }
}
```

## Material 3 适配

```dart
/// ✅ Material 3 写法
// 使用 WidgetStateProperty 替代 MaterialStateProperty
TextField(
  decoration: InputDecoration(
    filled: true,
    fillColor: WidgetStateColor.resolveWith((states) {
      if (states.contains(WidgetState.focused)) {
        return Theme.of(context).colorScheme.primaryContainer;
      }
      return null;
    }),
  ),
)

/// ❌ 已废弃
// MaterialStateProperty → 改用 WidgetStateProperty
// MaterialStateColor → 改用 WidgetStateColor
```
