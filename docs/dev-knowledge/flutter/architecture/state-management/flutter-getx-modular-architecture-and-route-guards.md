---
title: 'GetX 模块化架构与路由守卫实战'
tags: ['Flutter', 'GetX', '模块化', '路由守卫', 'Middleware', 'Binding', 'DI', '实战']
---

# GetX 模块化架构与路由守卫实战

> 本文基于 flutter_app 项目的 10 个业务模块实战，深度讲解 GetX 标准模块化分层（View / Controller / Binding / Routes）、依赖注入策略、GetView 模式、多 Tab 控制器聚合、路由守卫（GetMiddleware）等工程实践。

---

## 一、标准模块结构

### 1.1 六件套约定

每个业务模块由 4 类文件组成（部分模块可省略 binding/routes）：

```
modules/
└── <module>/
    ├── binding/
    │   └── <module>_binding.dart      ← 依赖注入注册
    ├── controller/
    │   ├── <module>_controller.dart   ← 业务逻辑 + 响应式状态
    │   └── <module>_detail_controller.dart（如有详情页）
    ├── routes/
    │   └── <module>_routes.dart       ← 路由定义
    └── view/
        ├── <module>_page.dart         ← 页面 UI
        └── <module>_detail_page.dart（如有详情页）
```

### 1.2 四层职责

| 层             | 文件                           | 职责                  | 关键约束                      |
| -------------- | ------------------------------ | --------------------- | ----------------------------- |
| **View**       | `view/*_page.dart`             | 纯 UI 渲染 + 事件转发 | 禁止在 build 中 `Get.put()`   |
| **Controller** | `controller/*_controller.dart` | 业务逻辑 + 响应式状态 | 使用 `.obs` 变量存储状态      |
| **Binding**    | `binding/*_binding.dart`       | 注册依赖到 GetX 容器  | 使用 `Get.lazyPut` 延迟实例化 |
| **Routes**     | `routes/*_routes.dart`         | 导出路由列表          | 关联 binding + middleware     |

---

## 二、View 层：GetView 模式

### 2.1 标准写法

```dart
// modules/article/view/article_list_page.dart

class ArticleListPage extends GetView<ArticleListController> {
  const ArticleListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(controller.title)),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const ListSkeleton();
        }
        return ListView.builder(
          itemCount: controller.articles.length,
          itemBuilder: (context, index) {
            final article = controller.articles[index];
            return ArticleCard(article: article);
          },
        );
      }),
    );
  }
}
```

### 2.2 GetView 的本质

```dart
// GetX 源码中 GetView 的定义：

abstract class GetView<T> extends StatelessWidget {
  const GetView({super.key});

  /// 通过 Get.find<T>() 获取控制器
  T get controller => Get.find<T>();

  @override
  Widget build(BuildContext context);
}
```

**关键认知：**

- `GetView<T>` 是一个 `StatelessWidget`
- `controller` getter 每次调用都执行 `Get.find<T>()`
- `Get.find()` 是 O(1) 的字典查找，性能无忧
- 控制器必须在调用前已通过 Binding 注册

### 2.3 禁止在 build 中 Get.put()

```dart
// ❌ 错误：在 build 中注册控制器
class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Get.put(MyController());  // 每次 build 都会执行！
    return ...;
  }
}

// ❌ 错误：在 build 中查找未注册的控制器
class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<MyController>();  // 如果没注册就崩溃
    return ...;
  }
}

// ✅ 正确：使用 GetView + Binding 注册
class MyPage extends GetView<MyController> {
  // controller 由 Binding 在路由进入时自动注册
  // build 中直接使用 controller.xxx
}
```

---

## 三、Controller 层：响应式状态

### 3.1 标准写法

```dart
// modules/article/controller/article_list_controller.dart

class ArticleListController extends GetxController {
  final _api = Get.find<ApiClient>();

  // 响应式状态
  final articles = <Article>[].obs;
  final isLoading = false.obs;
  final currentPage = 1.obs;
  final hasMore = true.obs;

  @override
  void onInit() {
    super.onInit();
    fetchArticles();
  }

  Future<void> fetchArticles({bool refresh = false}) async {
    if (refresh) {
      currentPage.value = 1;
      hasMore.value = true;
    }
    if (!hasMore.value || isLoading.value) return;

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
    } on DioException catch (e) {
      Get.snackbar('错误', AppError.message(e));
    } finally {
      isLoading.value = false;
    }
  }
}
```

### 3.2 Controller 生命周期

```
路由进入 → Binding.dependencies() 注册
    ↓
GetxController 实例化
    ↓
onInit()          ← 初始化数据、发起首次请求
    ↓
onReady()         ← Widget 已渲染到屏幕
    ↓
[用户交互]        ← 点击、滚动等事件触发方法
    ↓
onClose()         ← 路由离开时清理（取消订阅、释放资源）
```

### 3.3 参数化页面

```dart
// modules/article/controller/article_detail_controller.dart

class ArticleDetailController extends GetxController {
  late final String articleId;
  final article = Rxn<Article>();  // 可空响应式

  @override
  void onInit() {
    super.onInit();
    // 从路由参数获取文章 ID
    final args = Get.arguments as Map<String, dynamic>?;
    articleId = args?['id'] ?? '';
    fetchDetail();
  }

  Future<void> fetchDetail() async {
    final api = Get.find<ApiClient>();
    final response = await api.dio.get('/articles/$articleId');
    article.value = Article.fromJson(response.data['data']);
  }
}
```

---

## 四、Binding 层：依赖注入策略

### 4.1 标准 Binding

```dart
// modules/article/binding/article_binding.dart

class ArticleBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ArticleListController>(
      () => ArticleListController(),
      fenix: true,  // 关闭后重新进入时重新创建
    );
  }
}
```

### 4.2 三种注入策略对比

| 方法             | 生命周期           | 关闭后行为           | 适用场景                              |
| ---------------- | ------------------ | -------------------- | ------------------------------------- |
| `Get.put()`      | 立即创建，永久驻留 | 需手动删除           | 全局服务（ApiClient、StorageService） |
| `Get.lazyPut()`  | 首次使用时创建     | SmartManagement 决定 | 页面级控制器（默认选择）              |
| `Get.putAsync()` | 异步创建           | 同 `Get.put()`       | 需要异步初始化的服务                  |

### 4.3 SmartManagement 策略

```dart
// GetMaterialApp 中的配置

GetMaterialApp(
  smartManagement: SmartManagement.full,  // 默认值
  // ...
);
```

| 策略           | 行为                               | 适用场景           |
| -------------- | ---------------------------------- | ------------------ |
| `full`         | 页面离开时自动删除控制器和 Binding | 大多数场景（默认） |
| `keepFactory`  | 删除控制器，保留 Binding 工厂      | 频繁进出的页面     |
| `onlyBuilders` | 只删除在 Binding 中注册的控制器    | 精细控制           |

### 4.4 HomeBinding：多 Tab 控制器聚合

```dart
// modules/home/binding/home_binding.dart

class HomeBinding implements Bindings {
  @override
  void dependencies() {
    // 4 个 Tab 的控制器统一在这里注册
    // 随 Home Shell 的生命cycle 管理
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<CategoryController>(() => CategoryController());
    Get.lazyPut<MemberController>(() => MemberController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
```

**为什么不在各 Tab 页面内注册？**

- Tab 页面在 `IndexedStack` 中保持活跃，不会频繁销毁重建
- 由 `HomeBinding` 统一注册，随 Home Shell 一起创建/销毁
- 避免 Tab 切换时控制器被意外删除

---

## 五、Routes 层：路由定义

### 5.1 模块路由

```dart
// modules/article/routes/article_routes.dart

class ArticleRoutes {
  static const list = '/articles';
  static const detail = '/articles/detail';

  static List<GetPage> pages = [
    GetPage(
      name: list,
      page: () => const ArticleListPage(),
      binding: ArticleBinding(),
    ),
    GetPage(
      name: detail,
      page: () => const ArticleDetailPage(),
      binding: ArticleDetailBinding(),
    ),
  ];
}
```

### 5.2 路由聚合

```dart
// app/routes/app_pages.dart

import '../../modules/splash/routes/splash_routes.dart';
import '../../modules/auth/routes/auth_routes.dart';
import '../../modules/home/routes/home_routes.dart';
import '../../modules/article/routes/article_routes.dart';
// ... 其他模块

class AppPages {
  static final pages = <GetPage>[
    ...SplashRoutes.pages,
    ...AuthRoutes.pages,
    ...HomeRoutes.pages,
    ...ArticleRoutes.pages,
    ...NoticeRoutes.pages,
    ...NotificationRoutes.pages,
    ...MemberRoutes.pages,
    ...OrderRoutes.pages,
    ...ProfileRoutes.pages,
    ...OfflineRoutes.pages,
  ];
}
```

### 5.3 路由名常量

```dart
// app/routes/app_routes.dart

abstract class AppRoutes {
  static const splash = '/splash';
  static const login = '/login';
  static const register = '/register';
  static const home = '/home';
  static const articles = '/articles';
  static const articleDetail = '/articles/detail';
  // ...
}
```

---

## 六、路由守卫：GetMiddleware

### 6.1 AuthMiddleware 实现

```dart
// shared/middlewares/auth_middleware.dart

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    final isLoggedIn = Get.find<StorageService>().isLoggedIn;
    if (!isLoggedIn) {
      return const RouteSettings(name: AppRoutes.login);
    }
    return null;  // 不拦截
  }
}
```

### 6.2 在路由中应用

```dart
// modules/profile/routes/profile_routes.dart

static List<GetPage> pages = [
  GetPage(
    name: AppRoutes.profile,
    page: () => const ProfilePage(),
    binding: ProfileBinding(),
    middlewares: [AuthMiddleware()],  // ← 需要登录才能访问
  ),
];
```

### 6.3 Middleware 执行顺序

```dart
// 一个路由可以配置多个 Middleware

GetPage(
  name: '/admin',
  page: () => const AdminPage(),
  middlewares: [
    AuthMiddleware(),      // ① 先检查登录
    RoleMiddleware(),      // ② 再检查角色
    LogMiddleware(),       // ③ 最后记录日志
  ],
);

// 执行顺序：① → ② → ③
// 任一 Middleware 返回 redirect → 后续不再执行
```

### 6.4 GetMiddleware 完整 API

```dart
class MyMiddleware extends GetMiddleware {
  // 优先级（数字越小越先执行）
  @override
  int? get priority => 1;

  // 重定向（返回 null 表示不拦截）
  @override
  RouteSettings? redirect(String? route) {
    return null;
  }

  // 路由进入前调用（可修改 GetPage 配置）
  @override
  GetPage? onPageCalled(GetPage page) {
    return page;
  }

  // 路由绑定创建前调用
  @override
  void onBindingsStart(Bindings? binding) {}

  // 路由绑定完成后调用
  @override
  void onBindingsEnd() {}

  // 页面构建前调用（可替换页面）
  @override
  Widget onPageBuilt(Widget page) {
    return page;
  }

  // 页面销毁后调用
  @override
  void onPageDisposed(Widget page) {}
}
```

---

## 七、Import 路径规范

### 7.1 路径层级规则

```
lib/
├── modules/
│   └── <module>/
│       ├── view/          ← 3 层深度
│       ├── controller/    ← 3 层深度
│       ├── binding/       ← 3 层深度
│       └── routes/        ← 3 层深度
```

### 7.2 各层 import 规则

```dart
// view/*.dart → 到 lib/ 需要 ../../../
import '../../../data/api/api_client.dart';
import '../../../services/storage_service.dart';

// controller/*.dart → 到 lib/ 需要 ../../../
import '../../../shared/utils/error_mapper.dart';

// binding/*.dart → 同模块内用 ../
import '../controller/article_list_controller.dart';

// routes/*.dart → 同模块用 ../，外部用 ../../../
import '../binding/article_binding.dart';
import '../../../app/routes/app_routes.dart';
```

### 7.3 常见错误

```dart
// ❌ 错误：多了一层 ../
import '../../../../data/api/api_client.dart';
// 解析为 lib/ 的父目录，找不到文件

// ✅ 正确：三层 ../
import '../../../data/api/api_client.dart';
// 解析为 lib/data/api/api_client.dart
```

---

## 八、全局服务注册 vs 页面级注册

### 8.1 注册时机对照表

| 服务                    | 注册位置         | 注册方式         | 生命周期                   |
| ----------------------- | ---------------- | ---------------- | -------------------------- |
| `ApiClient`             | `main()`         | `Get.put()`      | 应用级，永久驻留           |
| `StorageService`        | `main()`         | `Get.putAsync()` | 应用级                     |
| `SecureStorageService`  | `main()`         | `Get.put()`      | 应用级                     |
| `NetworkService`        | `main()`         | `Get.putAsync()` | 应用级                     |
| `AuthController`        | `main()`         | `Get.put()`      | 应用级（需全局监听登录态） |
| `HomeController`        | `HomeBinding`    | `Get.lazyPut()`  | 页面级                     |
| `ArticleListController` | `ArticleBinding` | `Get.lazyPut()`  | 页面级                     |
| `ProfileController`     | `ProfileBinding` | `Get.lazyPut()`  | 页面级                     |

### 8.2 为什么 AuthController 在 main() 注册

```dart
// main.dart 中

Get.put(AuthController());

// 因为 AuthController 需要在多个地方被访问：
// - 登录页 → 调用 login()
// - 个人设置页 → 调用 logout()
// - AuthInterceptor → 检查登录状态
// - 任何页面 → 可能显示当前用户信息
//
// 如果放在 AuthBinding 中，离开登录页后就会被销毁
// 其他页面就无法访问登录状态了
```

---

## 九、模块间通信

### 9.1 通过 Get.find() 跨模块访问

```dart
// 在 ArticleDetailPage 中访问 AuthController

class ArticleDetailController extends GetxController {
  void toggleFavorite() {
    final auth = Get.find<AuthController>();
    if (!auth.isLoggedIn.value) {
      Get.toNamed(AppRoutes.login);
      return;
    }
    // 执行收藏逻辑
  }
}
```

### 9.2 通过 GetxService 共享状态

```dart
// StorageService 作为全局状态共享

class StorageService extends GetxService {
  bool isLoggedIn = false;
  // ...
}

// 在任何地方访问
final isLoggedIn = Get.find<StorageService>().isLoggedIn;
```

---

## 十、总结

### 10.1 核心知识图谱

```
GetX 模块化架构
│
├── View 层
│   ├── GetView<T> → 自动获取控制器
│   ├── Obx() → 响应式 UI 更新
│   └── 禁止在 build 中 Get.put()
│
├── Controller 层
│   ├── .obs → 响应式状态
│   ├── onInit() → 初始化数据
│   ├── onClose() → 清理资源
│   └── Get.arguments → 路由参数
│
├── Binding 层
│   ├── Get.lazyPut() → 延迟实例化（页面级）
│   ├── Get.put() → 立即注册（全局服务）
│   ├── Get.putAsync() → 异步初始化
│   └── SmartManagement → 自动回收策略
│
├── Routes 层
│   ├── GetPage → 路由定义
│   ├── binding → 关联依赖注入
│   ├── middlewares → 关联路由守卫
│   └── app_pages.dart → 聚合所有模块路由
│
└── Middleware 路由守卫
    ├── redirect() → 重定向判断
    ├── priority → 执行优先级
    └── 多中间件链式执行
```

### 10.2 设计原则

| 原则            | 实践                                     |
| --------------- | ---------------------------------------- |
| View 纯净       | 只负责 UI，不包含业务逻辑                |
| Controller 自治 | 每个模块的 Controller 独立管理自己的状态 |
| Binding 解耦    | 依赖注入与页面代码分离                   |
| 路由集中        | 所有路由在 app_pages.dart 聚合           |
| 守卫声明        | 在路由定义处声明权限要求                 |

---

## 相关链接

- [GetX 框架底层设计原理](/dev-knowledge/flutter/architecture/typical-analysis/getx-reactive-system)
- [GetX 生态体系](/dev-knowledge/flutter/interview/advanced/getx-ecosystem)
- [Dio 拦截器链与 Token 无感刷新](/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh)
- [全局错误处理与启动优化](/dev-knowledge/flutter/architecture/thinking/flutter-error-handling-and-launch-optimization)
