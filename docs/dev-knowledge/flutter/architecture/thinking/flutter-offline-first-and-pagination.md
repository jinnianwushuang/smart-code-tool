---
title: 'Flutter 离线优先架构与分页加载实战'
tags: ['Flutter', '离线优先', 'Hive', '网络状态', '分页', '下拉刷新', 'SmartRefresher', '实战']
---

# Flutter 离线优先架构与分页加载实战

> 本文基于 flutter_app 项目的离线能力实现，深度讲解三服务协作架构（StorageService + NetworkService + OfflineService）、Hive 缓存策略、网络状态感知、离线文章阅读、分页加载与下拉刷新组件封装等实战经验。

---

## 一、整体架构

### 1.1 三服务协作

```
┌─────────────────────────────────────────────────────────┐
│                    应用层（Controller）                    │
│  ArticleListController / ArticleDetailController         │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ StorageService   │ │NetworkService│ │ OfflineService   │
│ (Hive 缓存管理)   │ │(网络状态监听) │ │(离线文章管理)     │
│                  │ │              │ │                  │
│ • API 响应缓存    │ │ • 在线/离线   │ │ • 文章收藏       │
│ • TTL 过期策略    │ │ • 连接类型    │ │ • 离线阅读       │
│ • 缓存清除       │ │ • 状态变化通知 │ │ • 数据持久化     │
└────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            ↓
                  ┌──────────────────┐
                  │   Hive 本地存储   │
                  │                  │
                  │ • api_cache Box  │ ← 接口缓存
                  │ • offline_articles│ ← 离线文章
                  └──────────────────┘
```

### 1.2 服务初始化顺序

```dart
// main.dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. 初始化存储（最先，其他服务依赖）
  final storageService = await Get.putAsync<StorageService>(
    () async => StorageService().init(),
  );

  // 2. 初始化网络监听
  await Get.putAsync<NetworkService>(
    () async => NetworkService().init(),
  );

  // 3. 初始化离线服务
  await Get.putAsync<OfflineService>(
    () async => OfflineService().init(),
  );

  runApp(MyApp());
}
```

---

## 二、StorageService：API 缓存管理

### 2.1 核心实现

```dart
// services/storage_service.dart

class StorageService extends GetxService {
  static const _cacheBoxName = 'api_cache';
  late Box<String> _cacheBox;

  bool isLoggedIn = false;

  Future<StorageService> init() async {
    await Hive.initFlutter();
    _cacheBox = await Hive.openBox<String>(_cacheBoxName);
    return this;
  }

  /// 缓存 GET 响应
  Future<void> cacheResponse(String key, Map<String, dynamic> data) async {
    final cacheData = jsonEncode({
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
    await _cacheBox.put(key, cacheData);
  }

  /// 读取缓存（检查 TTL）
  Map<String, dynamic>? getCachedResponse(String key) {
    final raw = _cacheBox.get(key);
    if (raw == null) return null;

    try {
      final parsed = jsonDecode(raw) as Map<String, dynamic>;
      final timestamp = parsed['timestamp'] as int;
      final elapsed = DateTime.now().millisecondsSinceEpoch - timestamp;
      final ttlMs = AppConfig.cacheTtlMinutes * 60 * 1000;

      if (elapsed > ttlMs) {
        _cacheBox.delete(key);  // 过期自动清除
        return null;
      }
      return parsed['data'] as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  /// 清除所有缓存
  Future<void> clearCache() => _cacheBox.clear();
}
```

### 2.2 TTL 过期策略

```
缓存生命周期：

请求 → CacheInterceptor 检查
    ↓
缓存存在？
├── 是 → 检查时间戳
│       ├── 未过期（< 30 分钟）→ 直接返回缓存
│       └── 已过期（≥ 30 分钟）→ 删除缓存，发网络请求
└── 否 → 发网络请求
         ↓
    响应成功 → 写入缓存（附带时间戳）
```

**配置参数：**

```dart
// app/values/config.dart

class AppConfig {
  static const int cacheTtlMinutes = 30;  // 缓存有效期 30 分钟
}
```

### 2.3 缓存清除时机

| 场景     | 操作           | 原因               |
| -------- | -------------- | ------------------ |
| 退出登录 | `clearCache()` | 防止账号切换串数据 |
| 手动刷新 | 不主动清除     | TTL 过期后自动更新 |
| 数据变更 | 不主动清除     | 依赖 TTL 自然过期  |

---

## 三、NetworkService：网络状态监听

### 3.1 核心实现

```dart
// services/network_service.dart

class NetworkService extends GetxService {
  final _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  bool _firstUpdate = true;

  final isOnline = true.obs;
  final connectionType = Rxn<ConnectivityResult>();

  Future<NetworkService> init() async {
    // 初始状态
    final result = await _connectivity.checkConnectivity();
    _updateStatus(result);

    // 监听变化
    _subscription = _connectivity.onConnectivityChanged.listen(_updateStatus);
    return this;
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final online = !results.contains(ConnectivityResult.none);

    // 首次更新只记录状态，不弹 Snackbar
    if (!_firstUpdate) {
      if (isOnline.value && !online) {
        // 从在线变为离线
        Get.snackbar(
          '网络断开',
          '当前无网络连接，部分功能不可用',
          snackPosition: SnackPosition.TOP,
          duration: const Duration(seconds: 3),
        );
      } else if (!isOnline.value && online) {
        // 从离线恢复在线
        Get.snackbar(
          '网络恢复',
          '已重新连接网络',
          snackPosition: SnackPosition.TOP,
          duration: const Duration(seconds: 2),
        );
      }
    }
    _firstUpdate = false;
    isOnline.value = online;
    connectionType.value = results.isNotEmpty ? results.first : null;
  }

  @override
  void onClose() {
    _subscription?.cancel();
    super.onClose();
  }
}
```

### 3.2 首次更新陷阱

```dart
// ❌ 错误：启动时弹 Snackbar

void _updateStatus(ConnectivityResult result) {
  if (!isOnline) {
    Get.snackbar('网络断开', '...');  // 启动时可能还没 runApp()！
  }
}

// ✅ 正确：跳过首次更新

bool _firstUpdate = true;

void _updateStatus(List<ConnectivityResult> results) {
  if (!_firstUpdate) {
    // 只在后续更新时弹提示
    if (isOnline.value && !online) {
      Get.snackbar(...);
    }
  }
  _firstUpdate = false;
}
```

**原因：** `NetworkService.init()` 在 `main()` 中执行，此时 `runApp()` 还没完成，`Get.snackbar()` 需要的 Overlay 还不存在。

### 3.3 在 Controller 中使用

```dart
class ArticleListController extends GetxController {
  final _network = Get.find<NetworkService>();

  Future<void> fetchArticles() async {
    if (!_network.isOnline.value) {
      Get.snackbar('提示', '当前无网络，显示缓存数据');
      // 从缓存加载
      return;
    }
    // 正常网络请求
  }
}
```

---

## 四、OfflineService：离线文章管理

### 4.1 核心实现

```dart
// services/offline_service.dart

class OfflineService extends GetxService {
  static const _boxName = 'offline_articles';
  late Box _box;

  Future<OfflineService> init() async {
    _box = await Hive.openBox(_boxName);
    return this;
  }

  /// 获取所有离线文章
  List<Map<String, dynamic>> getArticles() {
    return _box.values
        .map((e) => Map<String, dynamic>.from(jsonDecode(e as String)))
        .toList()
      ..sort((a, b) =>
          (b['savedAt'] as String? ?? '').compareTo(a['savedAt'] as String? ?? ''));
  }

  /// 保存文章到离线
  Future<void> saveArticle(Map<String, dynamic> article) async {
    final id = article['id'] as String;
    final data = Map<String, dynamic>.from(article);
    data['savedAt'] = DateTime.now().toIso8601String();
    await _box.put(id, jsonEncode(data));
    Get.snackbar('已收藏', '文章已保存到离线阅读');
  }

  /// 移除离线文章
  Future<void> removeArticle(String id) async {
    await _box.delete(id);
  }

  /// 检查文章是否已离线
  bool isSaved(String id) {
    return _box.containsKey(id);
  }

  /// 清空所有离线文章
  Future<void> clearAll() async {
    await _box.clear();
  }
}
```

### 4.2 离线阅读页面

```dart
// modules/offline/view/offline_articles_page.dart

class OfflineArticlesPage extends GetView<OfflineService> {
  const OfflineArticlesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final articles = controller.getArticles();

    return Scaffold(
      appBar: AppBar(title: const Text('离线文章')),
      body: articles.isEmpty
          ? const EmptyState(description: '暂无离线文章')
          : ListView.builder(
              itemCount: articles.length,
              itemBuilder: (context, index) {
                final article = articles[index];
                return ListTile(
                  title: Text(article['title'] ?? ''),
                  subtitle: Text(article['author'] ?? ''),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () async {
                      await controller.removeArticle(article['id']);
                      // 刷新页面
                      (context as Element).markNeedsBuild();
                    },
                  ),
                  onTap: () {
                    // 跳转到文章详情（离线模式）
                    Get.toNamed(
                      AppRoutes.articleDetail,
                      arguments: {'id': article['id'], 'offline': true},
                    );
                  },
                );
              },
            ),
    );
  }
}
```

---

## 五、分页加载与下拉刷新

### 5.1 LoadMoreList 通用组件

```dart
// shared/widgets/load_more_list.dart

class LoadMoreList extends StatelessWidget {
  final RefreshController controller;
  final VoidCallback onRefresh;
  final VoidCallback onLoading;
  final Widget child;
  final bool enablePullUp;

  const LoadMoreList({
    super.key,
    required this.controller,
    required this.onRefresh,
    required this.onLoading,
    required this.child,
    this.enablePullUp = true,
  });

  @override
  Widget build(BuildContext context) {
    return SmartRefresher(
      controller: controller,
      onRefresh: onRefresh,
      onLoading: onLoading,
      enablePullUp: enablePullUp,
      header: const WaterDropHeader(),
      footer: const ClassicFooter(
        loadStyle: LoadStyle.ShowWhenLoading,
        loadingText: '加载中...',
        noDataText: '没有更多了',
        idleText: '上拉加载更多',
      ),
      child: child,
    );
  }
}
```

### 5.2 Controller 分页逻辑

```dart
class ArticleListController extends GetxController {
  final _api = Get.find<ApiClient>();
  final _network = Get.find<NetworkService>();

  // 响应式状态
  final articles = <Article>[].obs;
  final isLoading = false.obs;
  final currentPage = 1.obs;
  final hasMore = true.obs;

  // 下拉刷新控制器
  late final RefreshController refreshController;

  @override
  void onInit() {
    super.onInit();
    refreshController = RefreshController(initialRefresh: false);
    fetchArticles(refresh: true);
  }

  /// 获取文章列表
  Future<void> fetchArticles({bool refresh = false}) async {
    if (refresh) {
      currentPage.value = 1;
      hasMore.value = true;
    }
    if (!hasMore.value || isLoading.value) return;

    // 检查网络
    if (!_network.isOnline.value) {
      Get.snackbar('提示', '当前无网络');
      refreshController.refreshCompleted();
      return;
    }

    isLoading.value = true;
    try {
      final response = await _api.dio.get(
        '/articles',
        queryParameters: {
          'page': currentPage.value,
          'size': 10,
        },
      );

      final list = (response.data['data']['list'] as List)
          .map((e) => Article.fromJson(e))
          .toList();

      if (refresh) {
        articles.value = list;
      } else {
        articles.addAll(list);
      }

      hasMore.value = list.length >= 10;
      currentPage.value++;

      // 通知刷新完成
      refreshController.refreshCompleted();
      if (!hasMore.value) {
        refreshController.loadNoData();
      } else {
        refreshController.loadComplete();
      }
    } on DioException catch (e) {
      Get.snackbar('错误', AppError.message(e));
      refreshController.refreshFailed();
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    refreshController.dispose();
    super.onClose();
  }
}
```

### 5.3 View 中使用

```dart
class ArticleListPage extends GetView<ArticleListController> {
  const ArticleListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('文章列表')),
      body: Obx(() {
        // 首次加载显示骨架屏
        if (controller.isLoading.value && controller.articles.isEmpty) {
          return const ListSkeleton();
        }

        // 空状态
        if (controller.articles.isEmpty) {
          return const EmptyState(description: '暂无文章');
        }

        // 列表 + 分页
        return LoadMoreList(
          controller: controller.refreshController,
          onRefresh: () => controller.fetchArticles(refresh: true),
          onLoading: () => controller.fetchArticles(),
          child: ListView.builder(
            itemCount: controller.articles.length,
            itemBuilder: (context, index) {
              final article = controller.articles[index];
              return ArticleCard(article: article);
            },
          ),
        );
      }),
    );
  }
}
```

### 5.4 分页状态机

```
初始状态：
├── isLoading = false
├── hasMore = true
├── currentPage = 1
└── articles = []

下拉刷新：
├── refresh = true
├── currentPage = 1
├── hasMore = true
├── articles = [新数据]
└── refreshController.refreshCompleted()

上拉加载：
├── refresh = false
├── currentPage++
├── articles.addAll([新数据])
├── hasMore = (list.length >= 10)
└── refreshController.loadComplete() / loadNoData()

无更多数据：
├── hasMore = false
├── refreshController.loadNoData()
└── 显示"没有更多了"
```

---

## 六、总结

### 6.1 核心知识图谱

```
离线优先架构
│
├── StorageService（Hive 缓存）
│   ├── cacheResponse() → 写入缓存 + 时间戳
│   ├── getCachedResponse() → TTL 检查 + 返回
│   └── clearCache() → 退出登录清除
│
├── NetworkService（网络监听）
│   ├── isOnline.obs → 在线状态
│   ├── onConnectivityChanged → 实时监听
│   └── _firstUpdate → 启动时不弹提示
│
├── OfflineService（离线文章）
│   ├── saveArticle() → 保存到 Hive
│   ├── getArticles() → 按时间排序
│   └── removeArticle() → 删除
│
└── 分页加载
    ├── LoadMoreList → SmartRefresher 封装
    ├── RefreshController → 刷新状态管理
    ├── fetchArticles(refresh: true) → 下拉刷新
    ├── fetchArticles(refresh: false) → 上拉加载
    └── hasMore → 是否还有更多数据
```

### 6.2 设计原则

| 原则     | 实践                          |
| -------- | ----------------------------- |
| 缓存精准 | 白名单只缓存公开接口          |
| 弱网友好 | 网络错误不踢用户，保留重试    |
| 状态可视 | 骨架屏/空状态/加载中有明确 UI |
| 数据一致 | 退出登录清缓存，防账号串数据  |
| 组件复用 | 抽取通用分页组件              |

---

## 相关链接

- [Dio 拦截器链与 Token 无感刷新](/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh)
- [Flutter 本地存储与持久化](/dev-knowledge/flutter/interview/advanced/flutter-local-storage)
- [UI 适配·主题·加载状态设计](/dev-knowledge/flutter/architecture/performance/flutter-ui-adaptation-theming-loading-states)
