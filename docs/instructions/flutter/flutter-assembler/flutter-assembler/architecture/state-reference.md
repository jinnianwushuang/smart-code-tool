# 状态管理模式参照

> GetX 状态管理的分层策略、Obx/GetBuilder 选型与 Obx 粒度控制。

## 核心原则

1. **状态就近原则**：状态尽量放在最近的 Controller 中，避免全局共享
2. **Obx 粒度下沉**：响应式监听贴近最小刷新单元，避免大范围重建
3. **响应式 vs 简单状态**：频繁变化的用 `.obs`，不频繁的用 GetBuilder
4. **禁止全局 Obx 包裹**：不在顶层使用 Obx 包裹整个页面或应用

## 状态分类

| 分类             | 说明                     | 实现方式                | 示例                 |
| ---------------- | ------------------------ | ----------------------- | -------------------- |
| 页面级响应式状态 | 页面内频繁变化的数据     | `.obs` + `Obx`          | 列表数据、搜索关键词 |
| 页面级简单状态   | 页面内不频繁变化的数据   | 普通变量 + `GetBuilder` | 当前页码、排序方式   |
| 全局响应式状态   | 跨页面共享的频繁变化数据 | 全局 `.obs` + `Obx`     | 用户信息、主题       |
| 全局简单状态     | 跨页面共享的配置         | 普通变量 + `GetBuilder` | 应用版本号           |
| 表单状态         | 表单输入数据             | `.obs` + `Obx`          | 表单字段值、验证状态 |

## 页面级响应式状态（推荐默认方案）

```dart
class ProductListController extends GetxController {
  // 响应式状态
  final products = <Product>[].obs;
  final isLoading = false.obs;
  final searchKeyword = ''.obs;
  final selectedCategory = <String>[].obs;

  // 计算属性（getter，自动追踪依赖）
  List<Product> get filteredProducts => products.where((p) {
    final matchKeyword = searchKeyword.value.isEmpty ||
        p.name.contains(searchKeyword.value);
    final matchCategory = selectedCategory.isEmpty ||
        selectedCategory.contains(p.category);
    return matchKeyword && matchCategory;
  }).toList();

  int get productCount => filteredProducts.length;

  @override
  void onReady() {
    super.onReady();
    loadProducts();
  }

  Future<void> loadProducts() async {
    isLoading.value = true;
    try {
      final data = await Get.find<ProductApi>().fetchProducts();
      products.assignAll(data);
    } finally {
      isLoading.value = false;
    }
  }
}
```

## 页面级简单状态（GetBuilder）

```dart
class ReportController extends GetxController {
  // 简单状态
  int _currentPage = 1;
  int get currentPage => _currentPage;

  String _sortBy = 'date';
  String get sortBy => _sortBy;

  // 需要手动 update
  void changePage(int page) {
    _currentPage = page;
    update(['pagination']);  // 精确刷新
    _loadPageData();
  }

  void changeSortBy(String field) {
    _sortBy = field;
    update(['table']);  // 精确刷新
  }
}

// Widget 中使用
class _PaginationBar extends StatelessWidget {
  const _PaginationBar({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ReportController>(
      id: 'pagination',  // 只响应 pagination 更新
      builder: (c) => Row(
        children: [
          Text('第 ${c.currentPage} 页'),
          // ...
        ],
      ),
    );
  }
}
```

## Obx 粒度控制

```dart
/// ✅ 正确：Obx 包裹最小刷新单元
class _ProductCountBadge extends StatelessWidget {
  const _ProductCountBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<ProductListController>();
    return Obx(() => Badge(label: Text('${c.productCount}')));
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<ProductListController>();
    return Obx(() => c.isLoading.value
        ? const CircularProgressIndicator()
        : const SizedBox.shrink());
  }
}

/// ❌ 错误：Obx 包裹整个页面
class _BadProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = Get.find<ProductListController>();
    return Obx(() => Scaffold(  // 整个页面都在 Obx 内重建
      body: Column(children: [
        // 100+ 个子组件...
      ]),
    ));
  }
}
```

## 全局状态管理

```dart
/// 全局用户状态 Controller
class AuthController extends GetxController {
  final currentUser = Rxn<User>();  // 可空响应式
  final token = ''.obs;

  bool get isLoggedIn => currentUser.value != null;
  String get displayName => currentUser.value?.name ?? '未登录';

  Future<void> login(String username, String password) async {
    final result = await Get.find<AuthApi>().login(username, password);
    token.value = result.token;
    currentUser.value = result.user;
  }

  void logout() {
    token.value = '';
    currentUser.value = null;
  }
}

/// 注册为全局单例
class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazySingleton<AuthController>(() => AuthController());
    Get.lazySingleton<AuthApi>(() => AuthApi());
  }
}
```

## 状态选型决策树

```
需要跨页面共享？
├── 是 → 全局状态
│   ├── 频繁变化 → 全局 .obs + Obx
│   └── 不频繁 → 全局变量 + GetBuilder
└── 否 → 页面级状态
    ├── 频繁变化（列表、搜索、实时） → .obs + Obx
    └── 不频繁（页码、排序、开关） → 普通变量 + GetBuilder
```

## Rx 变量操作速查

```dart
// 声明
final items = <String>[].obs;
final count = 0.obs;
final name = ''.obs;
final user = Rxn<User>();  // 可空

// 读取
items.value         // 获取列表
items.length        // RxList 直接支持
items[0]            // RxList 直接支持下标

// 写入
items.value = [1, 2, 3]     // 整体赋值
items.add(4)                 // RxList 直接支持 add
items.assignAll([1, 2, 3])  // 替换全部（推荐）
items.assignAll([])          // 清空（推荐）
count.value++
count.increment()

// 监听
ever(items, (value) => print('变化: $value'));
once(count, (value) => print('首次变化: $value'));
debounce(items, Duration(seconds: 1), (value) => print('防抖: $value'));
```
