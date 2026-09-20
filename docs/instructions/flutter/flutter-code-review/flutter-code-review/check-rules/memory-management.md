# 内存管理（memory-management）

> 检查资源生命周期管理问题，防止内存泄漏。Flutter 中资源释放集中在 `dispose`（StatefulWidget）与 `onClose`（GetxController）。

## 检查项

### 1. Controller 未 dispose

- **严重级别**：🔴 Error
- **检查方式**：检查 `TextEditingController` / `ScrollController` / `AnimationController` / `FocusNode` / `VideoPlayerController` 是否在 `dispose` 或 `onClose` 中释放
- **问题示例**：

```dart
class MyState extends State<MyWidget> {
  final _controller = TextEditingController();
  // ❌ 缺少 dispose
}
```

- **正确写法**：

```dart
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

### 2. GetxController 资源未在 onClose 释放

- **严重级别**：🔴 Error
- **检查方式**：检查 `GetxController` 中持有的 Controller / Timer / 订阅是否在 `onClose()` 中释放
- **正确写法**：

```dart
class UserController extends GetxController {
  final nameCtrl = TextEditingController();
  late final Worker worker;

  @override
  void onInit() {
    super.onInit();
    worker = ever(count, (_) => refresh());
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    worker.dispose(); // ✅ Worker 必须 dispose
    super.onClose();
  }
}
```

### 3. GetX Worker 未 dispose

- **严重级别**：🔴 Error
- **检查方式**：检查 `ever` / `once` / `debounce` / `interval` 创建的 Worker 是否在 `onClose` 中 `dispose()`
- **处理建议**：Worker 必须在 `onInit` 创建、`onClose` 释放，否则监听器泄漏

### 4. StreamSubscription 未取消

- **严重级别**：🔴 Error
- **检查方式**：检查 `stream.listen(...)` 返回的订阅是否在 `dispose` / `onClose` 中 `cancel()`
- **正确写法**：

```dart
StreamSubscription? _sub;

@override
void initState() {
  super.initState();
  _sub = dataStream.listen(_onData);
}

@override
void dispose() {
  _sub?.cancel();
  super.dispose();
}
```

### 5. Timer 未取消

- **严重级别**：🔴 Error
- **检查方式**：检查 `Timer` / `Timer.periodic` 是否在 `dispose` / `onClose` 中 `cancel()`
- **正确写法**：

```dart
final _timer = Timer.periodic(const Duration(seconds: 1), (_) => tick());

@override
void dispose() {
  _timer.cancel();
  super.dispose();
}
```

### 6. 监听器 / 回调未移除

- **严重级别**：🟡 Warning
- **检查方式**：检查 `addListener` / `registerRoute` / 事件总线监听是否有对应的 `removeListener` / 注销
- **正确写法**：

```dart
scrollController.addListener(_onScroll);
// dispose 中：
scrollController.removeListener(_onScroll);
```

### 7. 本地存储敏感数据 / 全局 Controller 生命周期

- **严重级别**：🟡 Warning
- **检查方式**：
  - 检查是否用 `SharedPreferences` 明文存储 Token / 密码（应使用 `flutter_secure_storage`）
  - 检查需常驻的全局 Controller 是否使用 `Get.put(permanent: true)`，避免被误回收；反之临时 Controller 不应滥用 permanent
- **处理建议**：敏感数据加密存储；全局服务用 `permanent: true`，页面级 Controller 随路由销毁
