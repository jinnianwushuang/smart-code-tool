---
title: Flutter 路由架构设计
order: 20
---

# Flutter 路由架构设计

路由是 Flutter 应用的骨架。一个设计良好的路由架构不仅管理页面跳转，还承载了深度链接、权限守卫、状态恢复等关键职责。

本文从**项目级路由架构设计**角度出发，系统梳理 Flutter 路由方案选型、路由树设计、深度链接配置、守卫模式与导航抽象。

---

## 一、路由方案选型对比

Flutter 生态中有三种主流路由方案：

| 方案              | 类型安全                    | 代码生成 | 深度链接   | 学习成本 | 维护状态 |
| ----------------- | --------------------------- | -------- | ---------- | -------- | -------- |
| **GoRouter**      | 中（支持 type-safe routes） | 可选     | 原生支持   | 中       | 官方推荐 |
| **auto_route**    | 高（完全类型安全）          | 必须     | 支持       | 中       | 社区维护 |
| **Navigator 2.0** | 低                          | 否       | 需手动实现 | 高       | 官方底层 |

### 选型建议

| 场景                            | 推荐                            |
| ------------------------------- | ------------------------------- |
| 新项目（默认选择）              | GoRouter                        |
| 需要强类型路由 + 可接受代码生成 | auto_route                      |
| 极度定制化路由逻辑              | Navigator 2.0（不推荐直接使用） |

---

## 二、GoRouter 路由树设计

### 路由树架构

一个典型的 Flutter 应用路由树如下：

```dart
final router = GoRouter(
  initialLocation: '/splash',
  redirect: _globalRedirect,
  routes: [
    // ── 公开路由（无需登录） ──
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashPage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),

    // ── 需要登录的路由（Shell Route 包裹） ──
    ShellRoute(
      redirect: _authRedirect,
      builder: (context, state, child) => MainScaffold(child: child),
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfilePage(),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsPage(),
          routes: [
            GoRoute(
              path: 'account',
              builder: (context, state) => const AccountSettingsPage(),
            ),
            GoRoute(
              path: 'notifications',
              builder: (context, state) => const NotificationSettingsPage(),
            ),
          ],
        ),
      ],
    ),
  ],
);
```

### Shell Route 的价值

Shell Route 是 GoRouter 中最强大的特性之一。它允许你在多个页面之间共享一个外层容器（如底部导航栏），同时每个 Tab 维护独立的导航栈。

```dart
ShellRoute(
  builder: (context, state, child) {
    return ScaffoldWithNavBar(child: child);
  },
  routes: [
    // Tab 1: 首页
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return StatefulNestedNavigation(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/home', builder: (_, __) => HomePage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/search', builder: (_, __) => SearchPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, __) => ProfilePage()),
        ]),
      ],
    ),
  ],
);
```

### 路由参数传递

```dart
// ── 路径参数 ──
GoRoute(
  path: '/user/:id',
  builder: (context, state) {
    final userId = state.pathParameters['id']!;
    return UserDetailPage(userId: userId);
  },
);

// ── 查询参数 ──
GoRoute(
  path: '/search',
  builder: (context, state) {
    final query = state.uri.queryParameters['q'] ?? '';
    return SearchPage(query: query);
  },
);

// ── 额外参数（对象传递） ──
GoRoute(
  path: '/product',
  builder: (context, state) {
    final product = state.extra as Product;
    return ProductDetailPage(product: product);
  },
);
```

---

## 三、深度链接（Deep Link）配置

深度链接是移动应用的核心能力，允许从外部（浏览器、推送通知、其他 App）直接跳转到应用内特定页面。

### 平台配置

**iOS（Universal Links）：**

```json
// .well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.example.app",
        "paths": ["/product/*", "/user/*", "/order/*"]
      }
    ]
  }
}
```

**Android（App Links）：**

```json
// .well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": ["YOUR_CERT_FINGERPRINT"]
    }
  }
]
```

### GoRouter 深度链接配置

```dart
final router = GoRouter(
  initialLocation: '/home',
  routes: [
    GoRoute(
      path: '/product/:id',
      builder: (context, state) => ProductPage(id: state.pathParameters['id']!),
    ),
    GoRoute(
      path: '/user/:id',
      builder: (context, state) => UserPage(id: state.pathParameters['id']!),
    ),
  ],
);

// ── MaterialApp.router 自动处理深度链接 ──
MaterialApp.router(
  routerConfig: router,
);
```

### 深度链接路由表设计

```
应用路由设计：
├── /splash                    → 启动页
├── /login                     → 登录页
├── /home                      → 首页
├── /product/:id               → 商品详情
├── /user/:id                  → 用户主页
├── /order/:id                 → 订单详情
├── /search?q=xxx              → 搜索结果
├── /settings                  → 设置
│   ├── /settings/account      → 账户设置
│   └── /settings/notifications → 通知设置
└── /chat/:conversationId      → 聊天页
```

---

## 四、路由守卫模式

路由守卫确保用户在访问特定页面前满足条件（如已登录、有权限）。

### 全局重定向守卫

```dart
final router = GoRouter(
  redirect: (context, state) {
    final authBloc = context.read<AuthBloc>();
    final authState = authBloc.state;

    final isLoggedIn = authState is AuthAuthenticated;
    final isOnLoginPage = state.matchedLocation == '/login';

    // 未登录且不在登录页 → 重定向到登录
    if (!isLoggedIn && !isOnLoginPage) {
      return '/login?redirect=${state.uri}';
    }

    // 已登录但在登录页 → 重定向到首页
    if (isLoggedIn && isOnLoginPage) {
      return '/home';
    }

    return null; // 不重定向
  },
);
```

### Shell Route 级别的认证守卫

```dart
ShellRoute(
  redirect: (context, state) {
    final isLoggedIn = context.read<AuthBloc>().state is AuthAuthenticated;
    if (!isLoggedIn) {
      return '/login?redirect=${state.uri}';
    }
    return null;
  },
  builder: (context, state, child) => MainScaffold(child: child),
  routes: [
    // 所有需要登录的路由放在这里
    GoRoute(path: '/home', builder: (_, __) => HomePage()),
    GoRoute(path: '/profile', builder: (_, __) => ProfilePage()),
  ],
);
```

### 权限守卫

```dart
// 角色检查守卫
GoRoute(
  path: '/admin',
  redirect: (context, state) {
    final userRole = context.read<AuthBloc>().state.user?.role;
    if (userRole != UserRole.admin) {
      return '/forbidden';
    }
    return null;
  },
  builder: (context, state) => AdminDashboard(),
);
```

---

## 五、导航抽象层设计

直接在业务代码中调用 `context.go('/path')` 会导致路由路径散落各处，难以维护。推荐封装统一的导航层。

### 导航服务抽象

```dart
// ── 定义导航接口 ──
abstract class AppRouter {
  void goHome();
  void goToProduct(String productId);
  void goToUser(String userId);
  void goToLogin({String? redirect});
  void goToSettings();
  void goBack();
}

// ── GoRouter 实现 ──
class GoRouterAppRouter implements AppRouter {
  final GoRouter _router;

  GoRouterAppRouter(this._router);

  @override
  void goHome() => _router.go('/home');

  @override
  void goToProduct(String productId) => _router.go('/product/$productId');

  @override
  void goToUser(String userId) => _router.go('/user/$userId');

  @override
  void goToLogin({String? redirect}) {
    final uri = redirect != null ? '/login?redirect=$redirect' : '/login';
    _router.go(uri);
  }

  @override
  void goToSettings() => _router.go('/settings');

  @override
  void goBack() => _router.pop();
}
```

### 在依赖注入中注册

```dart
// 注册导航服务
getIt.registerSingleton<AppRouter>(GoRouterAppRouter(router));

// 在 BLoC 中使用
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final AppRouter _router;

  ProductBloc(this._router) : super(ProductInitial()) {
    on<ProductViewRequested>((event, emit) {
      _router.goToProduct(event.productId);
    });
  }
}
```

---

## 六、嵌套导航模式

### 问题场景

底部导航栏的每个 Tab 需要维护独立的导航栈。用户在 Tab A 进入详情页后，切换到 Tab B 再切回 Tab A，应该还在详情页。

### StatefulShellRoute 解决方案

```dart
StatefulShellRoute.indexedStack(
  builder: (context, state, navigationShell) {
    return ScaffoldWithNavBar(navigationShell: navigationShell);
  },
  branches: [
    // Branch 1: 首页
    StatefulShellBranch(
      routes: [
        GoRoute(
          path: '/home',
          builder: (_, __) => HomePage(),
          routes: [
            GoRoute(path: 'detail/:id', builder: (_, state) => DetailPage(id: state.pathParameters['id']!)),
          ],
        ),
      ],
    ),
    // Branch 2: 搜索
    StatefulShellBranch(
      routes: [
        GoRoute(
          path: '/search',
          builder: (_, __) => SearchPage(),
        ),
      ],
    ),
    // Branch 3: 我的
    StatefulShellBranch(
      routes: [
        GoRoute(
          path: '/profile',
          builder: (_, __) => ProfilePage(),
        ),
      ],
    ),
  ],
);
```

### 底部导航栏实现

```dart
class ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: '搜索'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }
}
```

---

## 七、路由状态管理

### 监听路由变化

```dart
// 在 BLoC 中监听路由变化
class NavigationBloc extends Bloc<NavigationEvent, NavigationState> {
  final GoRouter _router;

  NavigationBloc(this._router) : super(NavigationInitial()) {
    _router.routerDelegate.addListener(_onRouteChanged);
  }

  void _onRouteChanged() {
    final currentRoute = _router.routerDelegate.currentConfiguration;
    final lastMatch = currentRoute.last;
    final path = lastMatch is RouteMatch ? lastMatch.route.path : '/';

    add(RouteChanged(path));
  }

  @override
  Future<void> close() {
    _router.routerDelegate.removeListener(_onRouteChanged);
    return super.close();
  }
}
```

### 路由过渡动画

```dart
GoRoute(
  path: '/detail/:id',
  pageBuilder: (context, state) {
    return CustomTransitionPage(
      key: state.pageKey,
      child: DetailPage(id: state.pathParameters['id']!),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween(begin: const Offset(1, 0), end: Offset.zero)
              .animate(CurvedAnimation(parent: animation, curve: Curves.easeInOut)),
          child: child,
        );
      },
    );
  },
);
```

---

## 八、路由架构最佳实践

### 实践 1：路由路径集中管理

```dart
// routes/app_routes.dart
abstract class AppRoutes {
  static const splash = '/splash';
  static const login = '/login';
  static const home = '/home';
  static const product = '/product';
  static const user = '/user';
  static const settings = '/settings';

  // 带参数的路由路径生成
  static String productDetail(String id) => '/product/$id';
  static String userProfile(String id) => '/user/$id';
}
```

### 实践 2：路由表与页面分离

```dart
// 路由表只定义路径和 builder 的映射
// 页面文件只负责 UI，不关心路由配置
GoRoute(
  path: AppRoutes.product,
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return ProductPage(productId: id);
  },
);
```

### 实践 3：错误页面处理

```dart
GoRouter(
  errorBuilder: (context, state) => ErrorPage(
    error: state.error,
    path: state.uri.toString(),
  ),
);
```

---

## 九、与面试文档的关系说明

| 面试文档                 | 面试视角                              | 本文视角                     |
| ------------------------ | ------------------------------------- | ---------------------------- |
| go-router-deep.md        | GoRouter 内部原理、Navigator 2.0 源码 | 项目级路由架构设计与工程实践 |
| architecture-patterns.md | Clean Architecture 理论               | 路由守卫、导航抽象等具体实现 |

本文不涉及 GoRouter 的源码分析或 Navigator 2.0 的底层机制，这些内容在面试文档中已有覆盖。
