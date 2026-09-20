# Flutter Widget（flutter-widget）

> 检查 Flutter 3 Widget 构建与 GetX 使用中的最佳实践与常见反模式。以 Flutter 3.24+ / Material 3 / GetX 4.6+ 为基线，忽略历史版本兼容写法。

## 检查项

### 1. 静态 Widget 缺少 const 构造

- **严重级别**：🟡 Warning
- **检查方式**：检查不依赖运行时变量的 Widget 是否可加 `const`（`prefer_const_constructors`）
- **问题示例**：

```dart
SizedBox(height: 16)          // 可 const
Text('标题')                   // 可 const
Padding(padding: EdgeInsets.all(8))
```

- **正确写法**：

```dart
const SizedBox(height: 16)
const Text('标题')
const Padding(padding: EdgeInsets.all(8))
```

- **处理建议**：为所有可常量化 Widget 添加 `const`，减少重建开销

### 2. 列表项缺少稳定 key

- **严重级别**：🟡 Warning
- **检查方式**：检查 `ListView` / `Column` 中动态增删、重排的列表项是否设置了 `ValueKey` / `ObjectKey`
- **问题示例**：

```dart
// 列表项可增删/重排却无 key，复用状态错乱
children: items.map((e) => ItemTile(item: e)).toList()
```

- **正确写法**：

```dart
children: items.map((e) => ItemTile(key: ValueKey(e.id), item: e)).toList()
```

### 3. build 方法体积过大

- **严重级别**：🟡 Warning
- **检查方式**：检查单个 `build` 方法行数是否超过阈值（默认 50 行）
- **处理建议**：抽取私有方法（`Widget _buildHeader()`）或拆分为独立子 Widget 文件

### 4. build 内 setState / 副作用 / Get.put

- **严重级别**：🔴 Error
- **检查方式**：检查 `build` 方法内是否存在：
  - 直接调用 `setState`（会触发无限重建）
  - 发起网络请求、修改状态等副作用
  - 在 `build` 内 `Get.put` / `Get.find` 注册依赖
- **问题示例**：

```dart
Widget build(BuildContext context) {
  final controller = Get.put(UserController()); // ❌ build 内注册
  setState(() {});                              // ❌ build 内 setState
  return ...;
}
```

- **正确写法**：

```dart
// ✅ 依赖在 Binding 中注册
class UserBinding extends Bindings {
  @override
  void dependencies() => Get.lazyPut(() => UserController());
}

// ✅ GetView 通过 Get.find 获取已注册实例
class UserView extends GetView<UserController> {
  @override
  Widget build(BuildContext context) => Text(controller.title);
}
```

### 5. 使用已废弃的旧 API（Flutter 3 迁移点）

- **严重级别**：🟡 Warning
- **检查方式**：扫描 Flutter 3 已废弃/更名的 API，给出迁移建议：

```dart
// ❌ 旧 API → ✅ Flutter 3 新 API
MaterialStateProperty.all(...)   → WidgetStateProperty.all(...)
MaterialStateProperty.resolveWith → WidgetStateProperty.resolveWith
WillPopScope(...)                → PopScope(canPop: ..., onPopInvokedWithResult: ...)
ThemeData(primarySwatch: ...)    → ThemeData(colorScheme: ...) + themeMode
Scaffold(resizeToAvoidBottomPadding:) → resizeToAvoidBottomInset
 RaisedButton / FlatButton        → ElevatedButton / TextButton
withOpacity(x)                   → withValues(alpha: x)（新版）
```

- **处理建议**：统一迁移到 Flutter 3 新 API，启用 Material 3（`useMaterial3: true`）

### 6. GetX 三件套职责错配

- **严重级别**：🟡 Warning（`use_getx` 为 true 时）
- **检查方式**：检查是否遵循 View（GetView）+ Controller（GetxController）+ Binding（Bindings）三件套：
  - View 中混入业务逻辑/状态
  - Controller 中直接持有 Widget / BuildContext
  - 未通过 Binding 注入而在 View 内手动 `Get.put`
- **处理建议**：View 只负责渲染，Controller 承载状态与逻辑，Binding 负责依赖注入

### 7. Obx / GetBuilder 粒度过大

- **严重级别**：🟡 Warning
- **检查方式**：检查 `Obx(() => ...)` 是否包裹了过大的 Widget 子树，导致任一 Rx 变化即整块重建
- **问题示例**：

```dart
Obx(() => Column(children: [
  Header(),           // 与响应式数据无关
  Text(controller.count.value),
  Footer(),           // 与响应式数据无关
]))
```

- **正确写法**：

```dart
Column(children: [
  const Header(),
  Obx(() => Text('${controller.count.value}')), // ✅ 粒度下沉到叶子
  const Footer(),
])
```

### 8. Widget 树嵌套过深

- **严重级别**：🔵 Info
- **检查方式**：检查 `build` 中 Widget 嵌套层级是否过深（如超过 8 层）
- **处理建议**：抽取子 Widget，使用 `SizedBox` / `Padding` 组合替代深层嵌套

### 9. 未使用的导入 / 变量

- **严重级别**：🔵 Info
- **检查方式**：检查 `import` 但未使用的库、定义但未使用的变量（`unused_import` / `unused_local_variable`）
- **处理建议**：移除未使用导入，交由 `dart fix --apply` 自动清理
