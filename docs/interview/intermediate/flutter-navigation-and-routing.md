---
title: 'Flutter 导航与路由实战 [P5-P6]'
level: 'intermediate'
tags: ['Flutter', '导航', '路由', 'Navigator', 'GoRouter']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# Flutter 导航与路由实战 [P5-P6]

> Flutter 提供 Navigator 进行页面导航。理解命名路由、参数传递、Deep Link 和 GoRouter，才能构建完整的导航体系。

## 核心概念（What）

### 导航方式

```
Flutter 导航演进：

基础导航：
├── Navigator.push → 压栈
├── Navigator.pop → 出栈
├── Navigator.pushReplacement → 替换
└── Navigator.pushAndRemoveUntil → 清理栈

命名路由：
├── routes 表 → 路由映射
├── onGenerateRoute → 动态生成
└── 参数传递 → RouteSettings

现代路由：
├── GoRouter → 官方推荐（声明式）
├── 支持 Deep Link
├── 支持 Web URL
└── 支持嵌套路由
```

## 底层原理（Why）

### 基础导航

```dart
// 1. 直接跳转
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DetailPage(id: '123'),
  ),
);

// 2. 返回
Navigator.pop(context);

// 3. 返回并带数据
Navigator.pop(context, result);

// 接收数据
final result = await Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SelectPage()),
);

// 4. 替换当前页
Navigator.pushReplacement(
  context,
  MaterialPageRoute(builder: (context) => HomePage()),
);

// 5. 清空栈并跳转
Navigator.pushAndRemoveUntil(
  context,
  MaterialPageRoute(builder: (context) => LoginPage()),
  (route) => false, // 移除所有路由
);

// 6. 返回到根路由
Navigator.popUntil(context, ModalRoute.withName('/'));
```

### 命名路由

```dart
// 1. 定义路由表
class AppRoutes {
  static const String home = '/';
  static const String login = '/login';
  static const String profile = '/profile';
  static const String detail = '/detail';

  static Map<String, WidgetBuilder> routes = {
    home: (context) => HomePage(),
    login: (context) => LoginPage(),
    profile: (context) => ProfilePage(),
  };

  // 动态路由
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case detail:
        final id = settings.arguments as String;
        return MaterialPageRoute(
          builder: (context) => DetailPage(id: id),
          settings: settings,
        );
      default:
        return MaterialPageRoute(
          builder: (context) => UnknownPage(),
        );
    }
  }
}

// 2. 配置 MaterialApp
MaterialApp(
  initialRoute: AppRoutes.home,
  routes: AppRoutes.routes,
  onGenerateRoute: AppRoutes.onGenerateRoute,
)

// 3. 使用命名路由
// 无参数
Navigator.pushNamed(context, AppRoutes.profile);

// 带参数
Navigator.pushNamed(
  context,
  AppRoutes.detail,
  arguments: '123',
);

// 接收参数
class DetailPage extends StatelessWidget {
  final String id;

  const DetailPage({required this.id});

  @override
  Widget build(BuildContext context) {
    // 从 arguments 获取
    final args = ModalRoute.of(context)?.settings.arguments as String;
    return Text('Detail: $id');
  }
}
```

### GoRouter（现代路由）

```dart
// 1. 添加依赖
dependencies:
  go_router: ^14.0.0

// 2. 配置路由
final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomePage(),
      routes: [
        GoRoute(
          path: 'login',
          builder: (context, state) => LoginPage(),
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => ProfilePage(),
        ),
        GoRoute(
          path: 'detail/:id', // 路径参数
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return DetailPage(id: id);
          },
        ),
        GoRoute(
          path: 'search',
          builder: (context, state) {
            final keyword = state.uri.queryParameters['q'] ?? '';
            return SearchPage(keyword: keyword);
          },
        ),
      ],
    ),
  ],

  // 错误处理
  errorBuilder: (context, state) => ErrorPage(error: state.error),

  // 重定向
  redirect: (context, state) {
    final isLoggedIn = AuthService.isLoggedIn();
    final isLoginRoute = state.matchedLocation == '/login';

    if (!isLoggedIn && !isLoginRoute) {
      return '/login'; // 未登录重定向到登录页
    }

    if (isLoggedIn && isLoginRoute) {
      return '/'; // 已登录重定向到首页
    }

    return null; // 不重定向
  },
);

// 3. 使用 GoRouter
MaterialApp.router(
  routerConfig: router,
)

// 4. 导航操作
// 跳转
context.go('/profile');
context.go('/detail/123');
context.go('/search?q=flutter');

// 压栈
context.push('/detail/123');

// 返回
context.pop();

// 返回并带数据
context.pop(result);

// 替换
context.pushReplacement('/profile');

// 5. 获取参数
class DetailPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final id = GoRouterState.of(context).pathParameters['id'];
    final keyword = GoRouterState.of(context).uri.queryParameters['q'];

    return Text('ID: $id, Keyword: $keyword');
  }
}
```

### Deep Link

```dart
// GoRouter 支持 Deep Link
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProductPage(id: id);
      },
    ),
  ],
);

// Android 配置
// android/app/src/main/AndroidManifest.xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="example.com"
    android:pathPrefix="/product" />
</intent-filter>

// iOS 配置
// ios/Runner/Info.plist
<key>FlutterDeepLinkingEnabled</key>
<true/>

// 使用
// https://example.com/product/123 → 打开 ProductPage(id: '123')
```

### 嵌套导航

```dart
// ShellRoute（底部导航）
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
```

## 实战应用（How）

### 路由守卫

```dart
final router = GoRouter(
  redirect: (context, state) {
    final auth = AuthService.instance;
    final currentPath = state.matchedLocation;

    // 公开路由
    final publicRoutes = ['/login', '/register', '/forgot-password'];
    final isPublic = publicRoutes.contains(currentPath);

    // 未登录
    if (!auth.isLoggedIn && !isPublic) {
      return '/login?redirect=$currentPath';
    }

    // 已登录访问登录页
    if (auth.isLoggedIn && currentPath == '/login') {
      return '/';
    }

    // 权限检查
    if (currentPath.startsWith('/admin') && !auth.isAdmin) {
      return '/forbidden';
    }

    return null;
  },
);
```

### 页面过渡动画

```dart
// 自定义过渡动画
GoRoute(
  path: '/detail/:id',
  pageBuilder: (context, state) {
    return CustomTransitionPage(
      key: state.pageKey,
      child: DetailPage(id: state.pathParameters['id']!),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: Offset(1.0, 0.0),
            end: Offset.zero,
          ).animate(animation),
          child: child,
        );
      },
    );
  },
)

// 淡入淡出
FadeTransitionPage(
  child: DetailPage(),
)

// 缩放
ScaleTransition(
  scale: animation,
  child: child,
)
```

## 高频面试题

### Q1: Navigator 和 GoRouter 的区别？

```
Navigator：
├── 命令式导航
├── 手动管理路由栈
├── 不支持 Deep Link
├── 不支持 Web URL
└── 适合：简单应用

GoRouter：
├── 声明式导航
├── 自动管理路由栈
├── 支持 Deep Link
├── 支持 Web URL
├── 支持嵌套路由
└── 适合：中大型应用

推荐：
├── 新项目 → GoRouter
├── 需要 Web/Deep Link → GoRouter
└── 简单应用 → Navigator
```

### Q2: 如何实现路由守卫？

```
方法：
├── GoRouter redirect 参数
├── 检查登录状态
├── 检查权限
└── 重定向到对应页面

示例：
redirect: (context, state) {
  if (!isLoggedIn && !isPublicRoute) {
    return '/login';
  }
  return null;
}
```

### Q3: 如何传递页面参数？

```
方式：
├── 构造函数参数 → 类型安全
├── 路径参数 → /detail/:id
├── 查询参数 → /search?q=keyword
└── arguments → RouteSettings

推荐：
├── 简单参数 → 路径/查询参数
├── 复杂对象 → 构造函数
└── Deep Link → 路径参数
```

## 延伸思考

1. 如何实现页面间数据共享？
2. 如何处理返回确认对话框？
3. 如何实现页面预加载？

## 参考资料

- [GoRouter 官方文档](https://pub.dev/packages/go_router)
- [Flutter 导航](https://docs.flutter.dev/ui/navigation)
