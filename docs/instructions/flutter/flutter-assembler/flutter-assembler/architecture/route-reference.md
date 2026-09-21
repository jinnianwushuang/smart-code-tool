# 路由管理模式参照

> GetX 路由管理、命名路由配置与中间件标准写法。

## 核心原则

1. **命名路由统一管理**：所有路由集中在路由表中定义
2. **页面通过 Get.toNamed 跳转**：禁止使用 `Navigator.push`
3. **中间件处理鉴权/日志**：路由跳转前后的横切逻辑
4. **参数传递用 arguments**：通过 `Get.toNamed` 的 arguments 传参
5. **路由动画统一配置**：在 GetPage 中统一设置过渡动画

## 路由表标准写法

```dart
/// 路由配置
abstract class AppRoutes {
  static const login = '/login';
  static const home = '/home';
  static const userManagement = '/user-management';
  static const userDetail = '/user-management/detail';
  static const settings = '/settings';
}

/// 路由页面映射
abstract class AppPages {
  static final pages = <GetPage>[
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginPage(),
      binding: LoginBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const HomePage(),
      binding: HomeBinding(),
      transition: Transition.fadeIn,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: AppRoutes.userManagement,
      page: () => const UserManagementPage(),
      binding: UserManagementBinding(),
      transition: Transition.rightToLeft,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: AppRoutes.userDetail,
      page: () => const UserDetailPage(),
      binding: UserDetailBinding(),
      transition: Transition.rightToLeft,
    ),
  ];
}
```

## 路由初始化

```dart
/// main.dart 中初始化路由
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'My App',
      theme: ThemeData(useMaterial3: true),
      initialRoute: AppRoutes.login,
      getPages: AppPages.pages,
      unknownRoute: GetPage(
        name: '/not-found',
        page: () => const NotFoundPage(),
      ),
    );
  }
}
```

## 路由跳转

```dart
/// ✅ 标准跳转方式
// 普通跳转
Get.toNamed(AppRoutes.userManagement);

// 跳转并替换当前路由
Get.offNamed(AppRoutes.home);

// 跳转并清除所有历史
Get.offAllNamed(AppRoutes.login);

// 带参数跳转
Get.toNamed(
  AppRoutes.userDetail,
  arguments: {'userId': 123},
);

// 返回
Get.back();

// 返回并带结果
Get.back(result: {'updated': true});
```

## 路由参数接收

```dart
class UserDetailController extends GetxController {
  late final int userId;

  @override
  void onInit() {
    super.onInit();
    // 从路由参数中获取
    final args = Get.arguments as Map<String, dynamic>;
    userId = args['userId'] as int;
    loadUserDetail();
  }

  Future<void> loadUserDetail() async {
    // 使用 userId 加载数据
  }
}
```

## 路由中间件

```dart
/// 鉴权中间件
class AuthMiddleware extends GetMiddleware {
  @override
  int? get priority => 1;

  @override
  RouteSettings? redirect(String? route) {
    final auth = Get.find<AuthController>();
    if (!auth.isLoggedIn) {
      return const RouteSettings(name: AppRoutes.login);
    }
    return null;  // 不重定向
  }

  @override
  GetPage? onPageCalled(GetPage? page) {
    // 页面调用前的钩子（可用于日志、埋点）
    return page;
  }

  @override
  void onPageDispose(GetPage? page) {
    // 页面销毁后的钩子
  }
}
```

## 路由守卫模式

```dart
/// 组合多个中间件
class ProtectedMiddleware extends GetMiddleware {
  @override
  int? get priority => 0;

  @override
  RouteSettings? redirect(String? route) {
    final auth = Get.find<AuthController>();

    // 未登录 → 跳转登录页
    if (!auth.isLoggedIn) {
      return const RouteSettings(name: AppRoutes.login);
    }

    // Token 过期 → 刷新 Token
    if (auth.isTokenExpired) {
      // 异步刷新场景：使用 Get.offNamed 跳转刷新页
      return const RouteSettings(name: AppRoutes.login);
    }

    return null;
  }
}
```

## 常见错误

```dart
/// ❌ 错误：使用 Navigator.push
Navigator.push(context, MaterialPageRoute(builder: (_) => NewPage()));

/// ❌ 错误：硬编码路由字符串
Get.toNamed('/user-management/detail');

/// ✅ 正确：使用命名路由常量
Get.toNamed(AppRoutes.userDetail);

/// ❌ 错误：在 Widget 中直接创建 Controller
Get.put(UserDetailController());

/// ✅ 正确：通过 Binding 注册（路由配置中已包含）
// GetPage 的 binding 参数会自动处理
```
