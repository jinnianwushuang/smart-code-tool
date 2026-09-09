---
title: "GoRouter 路由管理深度 [P6-P7]"
level: "senior"
tags: ["GoRouter", "Flutter", "路由", "Deep Link", "ShellRoute"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# GoRouter 路由管理深度 [P6-P7]

> GoRouter 是 Flutter 2026 年官方推荐的路由方案。声明式路由、嵌套路由、路由守卫、Deep Link 支持，使其成为 Flutter 路由的事实标准。

## 核心概念（What）

### GoRouter vs auto_route vs Navigator 对比

| 特性 | GoRouter | auto_route | Navigator |
|------|----------|------------|-----------|
| 声明式 | ✅ | ✅ | ❌ |
| 嵌套路由 | ✅（ShellRoute） | ✅ | 手动 |
| Deep Link | ✅ | ✅ | 手动 |
| 路由守卫 | ✅（redirect） | ✅ | 手动 |
| 官方推荐 | ✅ | ❌ | ✅ |
| Codegen | ❌ | ✅ | ❌ |

---

## 底层原理（Why）

### 1. 基础路由配置

```dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    // 静态路由
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),

    // 动态参数
    GoRoute(
      path: '/detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'];
        return DetailScreen(id: id!);
      },
    ),

    // 查询参数
    GoRoute(
      path: '/search',
      builder: (context, state) {
        final query = state.uri.queryParameters['q'];
        return SearchScreen(query: query);
      },
    ),

    // 子路由
    GoRoute(
      path: '/settings',
      builder: (context, state) => SettingsScreen(),
      routes: [
        GoRoute(
          path: 'profile',
          builder: (context, state) => ProfileSettings(),
        ),
        GoRoute(
          path: 'notifications',
          builder: (context, state) => NotificationSettings(),
        ),
      ],
    ),
  ],
);
```

### 2. ShellRoute（嵌套导航）

```dart
// ShellRoute：保持底部导航栏，只切换内容区域
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return ScaffoldWithNavBar(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => HomeScreen(),
        ),
        GoRoute(
          path: '/search',
          builder: (context, state) => SearchScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => ProfileScreen(),
        ),
      ],
    ),
  ],
);

// ScaffoldWithNavBar
class ScaffoldWithNavBar extends StatelessWidget {
  final Widget child;

  const ScaffoldWithNavBar({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: '搜索'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }
}
```

### 3. 路由守卫（redirect）

```dart
final router = GoRouter(
  redirect: (context, state) {
    final authService = GetIt.instance<AuthService>();
    final isAuthenticated = authService.isAuthenticated;
    final isLoginPage = state.matchedLocation == '/login';

    // 未登录且不在登录页 → 重定向到登录页
    if (!isAuthenticated && !isLoginPage) {
      return '/login?redirect=${state.uri}';
    }

    // 已登录且在登录页 → 重定向到首页
    if (isAuthenticated && isLoginPage) {
      return '/home';
    }

    return null; // 不重定向
  },
  routes: [...],
);

// 路由级别守卫（GoRoute redirect）
GoRoute(
  path: '/admin',
  redirect: (context, state) {
    final role = GetIt.instance<AuthService>().userRole;
    if (role != 'admin') return '/forbidden';
    return null;
  },
  builder: (context, state) => AdminScreen(),
)
```

### 4. Deep Link 支持

```dart
// Deep Link：从外部链接打开应用特定页面
// Android: AndroidManifest.xml
// <intent-filter>
//   <action android:name="android.intent.action.VIEW" />
//   <category android:name="android.intent.category.DEFAULT" />
//   <category android:name="android.intent.category.BROWSABLE" />
//   <data android:scheme="myapp" android:host="detail" />
// </intent-filter>

// iOS: Info.plist
// <key>CFBundleURLTypes</key>
// <array>
//   <dict>
//     <key>CFBundleURLSchemes</key>
//     <array><string>myapp</string></array>
//   </dict>
// </array>

// GoRouter 自动处理 Deep Link
// myapp://detail/123 → 打开 DetailScreen(id: '123')
// https://example.com/detail/123 → 打开 DetailScreen(id: '123')

// 配置
GoRouter(
  routes: [...],
);

// 通用链接（Universal Links / App Links）
// 需要在服务器放置 assetlinks.json（Android）或 apple-app-site-association（iOS）
```

### 5. 类型安全路由（推荐）

```dart
// 类型安全路由（避免字符串拼接错误）

// 1. 定义路由扩展
extension GoRouterHelper on GoRouter {
  void goHome() => go('/home');
  void goDetail(String id) => go('/detail/$id');
  void goSearch(String query) => go('/search?q=$query');
}

// 2. 使用
context.goHome();
context.goDetail('123');
context.goSearch('flutter');

// 3. 高级：TypedGoRoute（GoRouter 6.0+）
@TypedGoRoute<HomeRoute>(path: '/home')
class HomeRoute extends GoRouteData {
  const HomeRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) {
    return HomeScreen();
  }
}

@TypedGoRoute<DetailRoute>(path: '/detail/:id')
class DetailRoute extends GoRouteData {
  final String id;
  const DetailRoute(this.id);

  @override
  Widget build(BuildContext context, GoRouterState state) {
    return DetailScreen(id: id);
  }
}

// 使用
const HomeRoute().go(context);
DetailRoute('123').go(context);
```

---

## 高频面试题

### Q1: GoRouter 的 ShellRoute 是什么？

**参考答案要点**：
- ShellRoute 保持外层 UI（如底部导航栏），只切换内部内容
- 适合底部导航、侧边栏导航场景
- 子路由切换时，ShellRoute 的 builder 不重建
- 类似 Web 的 Layout Route

### Q2: GoRouter 如何实现路由守卫？

**参考答案要点**：
- 全局 redirect：GoRouter 的 redirect 参数
- 路由级 redirect：GoRoute 的 redirect 参数
- 返回 null 表示不重定向
- 返回路径字符串表示重定向
- 可结合认证状态实现登录拦截

### Q3: GoRouter 如何处理 Deep Link？

**参考答案要点**：
- 自动匹配 URL 到路由
- Android：intent-filter 配置
- iOS：URL Scheme + Universal Links
- 支持自定义 scheme（myapp://）和 HTTPS（example.com）
- 需要服务端配置 assetlinks.json / apple-app-site-association

---

## 延伸思考

1. **设计题**：为一个社交应用设计路由架构（底部导航 + 详情页 + Deep Link）。
2. **场景题**：GoRouter 嵌套路由中，子页面返回时状态丢失，如何解决？
3. **对比题**：GoRouter vs auto_route，2026 年 Flutter 路由怎么选？

---

## 参考资料

- [GoRouter 文档](https://gorouter.dev)
- [GoRouter 嵌套路由](https://gorouter.dev/nested-routes)
- [Deep Linking](https://gorouter.dev/web-url)
