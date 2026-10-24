---
title: Flutter 路由导航选型
tags: ['Flutter', '路由']
---

# Flutter 路由导航选型（2026）

> go_router 是 2026 年 Flutter 路由的官方标准和社区共识首选，auto_route 在类型安全场景下是有力补充。

---

## 一、主流方案对比

| 维度 | go_router | auto_route | GetX 路由 | Navigator 2.0 原生 |
|------|-----------|------------|-----------|-------------------|
| **维护方** | Flutter 官方 | 社区（Milad Akarie） | 社区（Jonatas Law） | Flutter 官方 |
| **月下载量** | 128 万+ | 40 万+ | 随 GetX 包 | 内置 |
| **声明式** | ✅ | ✅ | ❌（命令式） | ✅ |
| **深度链接** | ✅ 自动 | ✅ 自动 | ❌ 手动 | 手动实现 |
| **类型安全** | 部分（路径字符串） | ✅（代码生成） | ❌ | ❌ |
| **嵌套路由** | ✅ ShellRoute | ✅ AutoTabsRouter | ❌ | 手动实现 |
| **路由守卫** | redirect | AutoRouteGuard | GetMiddleware | 手动实现 |
| **Web URL 同步** | ✅ | ✅ | ❌ | 手动实现 |
| **学习曲线** | 低 | 中 | 低 | 高 |
| **与 Riverpod/Bloc 集成** | ✅ 良好 | ✅ 良好 | 仅 GetX | 需手动 |

---

## 二、go_router（官方推荐）

### 为什么是首选

1. **Flutter 官方维护** — 与框架同步更新，长期支持有保障
2. **声明式 API** — 路由配置集中管理，UI 与导航逻辑分离
3. **深度链接** — 自动处理 Web URL 同步、浏览器前进/后退
4. **嵌套导航** — ShellRoute 支持底部 Tab + 独立导航栈
5. **路由守卫** — redirect 机制处理认证/权限
6. **生态兼容** — 与 Riverpod、Bloc 无缝集成

### 核心 API

```dart
// 路由配置
final router = GoRouter(
  initialLocation: '/home',
  redirect: (context, state) {
    final isLoggedIn = ref.read(authProvider).isAuthenticated;
    final isLoginRoute = state.matchedLocation == '/login';

    if (!isLoggedIn && !isLoginRoute) return '/login';
    if (isLoggedIn && isLoginRoute) return '/home';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: HomePage(),
          ),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ProfilePage(),
          ),
        ),
      ],
    ),
    GoRoute(
      path: '/products/:id',
      builder: (context, state) {
        final productId = state.pathParameters['id']!;
        return ProductDetailPage(productId: productId);
      },
    ),
  ],
);

// 导航
context.go('/home');              // 替换当前栈
context.push('/products/42');     // 压栈
context.pop();                    // 出栈

// 带参数导航
context.go('/products/${product.id}');
```

### 与 Riverpod 集成

```dart
// go_router_refresh_stream：Provider 变化时自动刷新路由
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    refreshListenable: GoRouterRefreshStream(ref.watch(authProvider)),
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      // ...
    },
    routes: [...],
  );
});
```

### 适用场景

- ✅ 新项目通用首选
- ✅ Web + Mobile 多端（URL 同步）
- ✅ 需要深度链接
- ✅ 嵌套导航（Tab + 独立栈）
- ❌ 需要编译时类型安全（考虑 auto_route）

---

## 三、auto_route（类型安全）

### 核心优势

1. **代码生成** — 注解定义路由，生成强类型代码
2. **编译时检查** — 路由参数类型在编译期验证
3. **模块化** — 每个 feature module 独立定义路由
4. **AutoTabsRouter** — 嵌套 Tab 导航开箱即用

### 核心 API

```dart
// 路由定义（注解）
@MaterialAutoRouter(
  routes: <AutoRoute>[
    AutoRoute(page: LoginPage, path: '/login'),
    AutoRoute(page: HomePage, path: '/home'),
    AutoRoute(page: ProductDetailPage, path: '/products/:id'),
    AutoRoute(
      page: EmptyRouterPage,  // Shell
      path: '/main',
      children: [
        AutoRoute(page: HomeTab, path: 'home'),
        AutoRoute(page: ProfileTab, path: 'profile'),
      ],
    ),
  ],
)
class AppRouter extends _$AppRouter {}

// 运行 build_runner 生成 app_router.gr.dart

// 导航（类型安全）
context.router.push(ProductDetailRoute(id: 42));  // 编译时检查参数类型
context.router.pop();
```

### 适用场景

- ✅ 大型多模块项目
- ✅ 需要编译时路由类型安全
- ✅ Clean Architecture 分层
- ❌ 简单项目（代码生成增加复杂度）

---

## 四、GetX 路由

### 现状

GetX 路由是 GetX 框架的一部分，**不独立发布**。2026 年社区共识：

- ❌ 不支持声明式路由
- ❌ 不支持深度链接 / Web URL 同步
- ❌ 与生态包（go_router、Riverpod）不兼容
- ❌ 全局状态污染路由逻辑

### 仅适用于

- 已有 GetX 存量项目
- 极简单原型（不需要深度链接）

---

## 五、Navigator 2.0 原生

### 何时使用

- 需要完全自定义路由行为
- 构建路由框架/库
- go_router / auto_route 无法满足的特殊需求

### 复杂度警告

Navigator 2.0 原生 API（RouterDelegate、RouteInformationParser）非常底层，**不建议业务项目直接使用**。go_router 和 auto_route 都是对其的封装。

---

## 六、选型决策

```
需要路由吗？
├─ 新项目 → go_router（官方维护，生态最好）
├─ 大型多模块 + 类型安全 → auto_route
├─ 已有 GetX 项目 → 继续用 GetX 路由（不建议迁移）
└─ 需要完全自定义 → Navigator 2.0 原生（极少数场景）
```

### go_router vs auto_route

| 你的需求 | 选择 |
|---------|------|
| 快速上手，官方支持 | go_router |
| 编译时类型安全 | auto_route |
| Web URL 同步 | go_router（更成熟） |
| 多模块独立路由 | auto_route（模块化更好） |
| 与 Riverpod 集成 | go_router（社区方案更多） |
| 与 Bloc 集成 | 两者均可 |

---

## 七、跨平台路由注意事项

### Web vs Mobile 差异

| 行为 | Web | Mobile |
|------|-----|--------|
| URL 栏 | 显示完整路径 | 不显示 |
| 浏览器前进/后退 | 需同步 | 无 |
| 深度链接 | 直接访问 URL | 通过 Intent/Universal Link |
| 刷新页面 | 重新加载当前路由 | 无刷新概念 |
| 新标签页打开 | 支持 | 不支持 |

### 开发避坑

```dart
// ❌ 不要在 Web 端用 push 替代 go（会导致浏览器历史堆积）
context.push('/home');  // Web 端每次 push 都新增历史记录

// ✅ Web 端用 go（替换当前历史条目）
context.go('/home');

// ❌ 不要硬编码路径字符串（重构时容易遗漏）
context.go('/products/42');

// ✅ 使用常量或代码生成
context.go(AppRoutes.productDetail(42));  // auto_route
// 或
context.go('/products/$productId');       // go_router + 常量
```

---

## 参考资源

- [go_router 官方文档](https://pub.dev/packages/go_router)
- [auto_route 官方文档](https://pub.dev/packages/auto_route)
- [Flutter 路由官方指南](https://docs.flutter.dev/ui/navigation)
- [Navigator 2.0 深度解析](https://medium.com/flutter/learning-flutters-new-navigation-and-routing-system-7c9068155ade)
