# GetxController 生命周期参照

> GetxController 的生命周期钩子、Binding 注册机制与标准写法。

## 核心原则

1. **Controller 只包含业务逻辑**：状态声明、数据处理、API 调用
2. **生命周期必须遵守顺序**：onInit → onReady → onClose
3. **Binding 是唯一注册入口**：禁止在 build 方法内调用 Get.put
4. **Controller 不持有 Widget 引用**：通过回调/事件与 UI 通信
5. **及时释放资源**：onClose 中清理 Timer、Stream 订阅等

## Controller 标准结构

```dart
/// 用户管理 Controller
class UserManagementController extends GetxController {
  // ─── 响应式状态 ───
  final users = <User>[].obs;
  final isLoading = false.obs;
  final searchKeyword = ''.obs;

  // ─── 简单状态（GetBuilder 用）───
  int _currentPage = 1;
  int get currentPage => _currentPage;

  // ─── 非响应式数据 ───
  int _totalCount = 0;
  int get totalCount => _totalCount;

  // ─── 生命周期 ───

  @override
  void onInit() {
    super.onInit();
    // 同步初始化：设置监听器、初始化非异步资源
    _setupSearchDebounce();
  }

  @override
  void onReady() {
    super.onReady();
    // 异步初始化：首次数据加载、API 调用
    handleInitLoad();
  }

  @override
  void onClose() {
    // 资源清理（必须完整）
    _searchDebounce?.cancel();
    users.close();
    isLoading.close();
    searchKeyword.close();
    super.onClose();
  }

  // ─── 业务方法 ───

  Future<void> handleInitLoad() async {
    isLoading.value = true;
    try {
      final result = await _api.fetchUsers(page: 1);
      users.assignAll(result.data);
      _totalCount = result.total;
    } finally {
      isLoading.value = false;
    }
  }

  void handleSearchChange(String keyword) {
    searchKeyword.value = keyword;
    _searchDebounce?.call();
  }

  // ─── 私有方法 ───

  Debounce? _searchDebounce;

  void _setupSearchDebounce() {
    _searchDebounce = Debounce(const Duration(milliseconds: 300));
  }

  final _api = Get.find<UserApi>();
}
```

## Binding 注册标准写法

```dart
/// 页面 Binding — Controller 唯一注册入口
class UserManagementBinding extends Bindings {
  @override
  void dependencies() {
    // Get.lazyPut：懒加载，首次使用时才创建
    Get.lazyPut<UserManagementController>(
      () => UserManagementController(),
      fenix: true,  // 页面销毁后允许重新创建
    );

    // Get.put：立即创建（仅用于必须立即初始化的服务）
    // Get.put(() => UserApi());

    // Get.lazySingleton：全局单例
    // Get.lazySingleton<UserApi>(() => UserApi());
  }
}
```

## 注册方式对比

| 方式 | 创建时机 | 生命周期 | 适用场景 |
|------|---------|---------|---------|
| `Get.lazyPut` | 首次 Get.find 时 | 跟随页面 | 页面级 Controller（推荐） |
| `Get.put` | 立即 | 跟随页面 | 需要立即初始化的服务 |
| `Get.lazySingleton` | 首次 Get.find 时 | 全局 | 全局单例服务 |
| `Get.putAsync` | 异步完成后 | 全局 | 需要异步初始化的服务 |

## 生命周期钩子说明

| 钩子 | 调用时机 | 用途 | 是否异步 |
|------|---------|------|---------|
| `onInit` | Controller 创建后 | 同步初始化（监听器、本地资源） | 否 |
| `onReady` | onInit 完成后、首帧后 | 异步初始化（API 调用、数据加载） | 是 |
| `onClose` | Controller 销毁前 | 资源清理（Timer、Stream、Rx 关闭） | 否 |

## 资源清理清单

```dart
@override
void onClose() {
  // 1. 取消 Timer
  _timer?.cancel();

  // 2. 取消 Debounce
  _debounce?.cancel();

  // 3. 取消 Stream 订阅
  _subscription?.cancel();

  // 4. 关闭 Rx 变量（.obs 创建的）
  _rxVariable.close();

  // 5. 清理大对象引用
  _largeData = null;

  super.onClose();
}
```

## 常见错误

```dart
/// ❌ 错误：在 build 内 Get.put
class BadPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.put(MyController());  // 禁止！
    return Text(controller.title);
  }
}

/// ❌ 错误：onClose 未清理 Rx
class BadController extends GetxController {
  final items = <String>[].obs;
  final loading = false.obs;

  @override
  void onClose() {
    // 未关闭 Rx 变量 → 内存泄漏
    super.onClose();
  }
}

/// ✅ 正确：通过 Binding 注册 + 完整清理
class GoodBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GoodController>(() => GoodController(), fenix: true);
  }
}

class GoodController extends GetxController {
  final items = <String>[].obs;
  final loading = false.obs;

  @override
  void onClose() {
    items.close();
    loading.close();
    super.onClose();
  }
}
```
