---
title: 'Flutter 全局错误处理与启动优化实战'
tags:
  ['Flutter', '错误处理', 'FlutterError', 'PlatformDispatcher', '启动优化', 'ErrorReporter', '实战']
---

# Flutter 全局错误处理与启动优化实战

> 本文基于 flutter_app 项目的错误处理与启动优化实践，深度讲解 FlutterError.onError + PlatformDispatcher.onError 双层错误捕获、环境区分处理、错误上报机制、异步服务初始化编排、首帧优化等工程实战经验。

---

## 一、全局错误处理架构

### 1.1 双层捕获机制

```
Flutter 错误捕获两层体系：

┌─────────────────────────────────────────────────────────┐
│ 第一层：FlutterError.onError                              │
│                                                         │
│ 捕获范围：                                                │
│ • Widget build() 中的异常                                │
│ • 手势处理异常                                           │
│ • 布局异常                                               │
│ • 动画异常                                               │
│ • 所有同步的 Flutter 框架错误                             │
│                                                         │
│ 触发时机：Widget 树构建/渲染过程中                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 第二层：PlatformDispatcher.onError                       │
│                                                         │
│ 捕获范围：                                                │
│ • 异步代码异常（Future/Stream）                           │
│ • Timer 回调异常                                         │
│ • Isolate 间通信异常                                     │
│ • 所有未被 try-catch 捕获的异步错误                       │
│                                                         │
│ 触发时机：事件循环处理异步任务时                           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 完整实现

```dart
// main.dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 全局错误处理（必须在 runApp 之前）
  _setupErrorHandling();

  // ... 其他初始化
  runApp(MyApp());
}

void _setupErrorHandling() {
  // 第一层：Flutter 框架错误
  FlutterError.onError = (details) {
    if (kDebugMode) {
      // Debug 模式：打印到控制台
      FlutterError.presentError(details);
    } else {
      // Release 模式：上报到服务器
      ErrorReporter.report(
        message: details.exception.toString(),
        stack: details.stack?.toString(),
        source: 'FlutterError.onError',
        component: details.context?.toString(),
      );
    }
  };

  // 第二层：异步错误
  PlatformDispatcher.instance.onError = (error, stack) {
    if (kDebugMode) {
      debugPrint('AsyncError: $error\n$stack');
    } else {
      ErrorReporter.report(
        message: error.toString(),
        stack: stack.toString(),
        source: 'PlatformDispatcher.onError',
      );
    }
    return true;  // 标记为已处理，不再传递给系统
  };
}
```

---

## 二、ErrorReporter：错误上报

### 2.1 实现

```dart
// services/error_reporter.dart

class ErrorReporter {
  static Future<void> report({
    required String message,
    String? stack,
    String? source,
    String? component,
  }) async {
    try {
      final api = Get.find<ApiClient>();
      await api.dio.post(
        '/api/client-errors',
        data: {
          'message': message,
          'stackTrace': stack,
          'source': source,
          'component': component,
          'timestamp': DateTime.now().toIso8601String(),
          'appVersion': '1.0.0',
          'platform': Platform.operatingSystem,
        },
      );
    } catch (e) {
      // 上报失败不能影响用户体验
      debugPrint('Error reporting failed: $e');
    }
  }
}
```

### 2.2 上报策略

| 策略     | 说明                     |
| -------- | ------------------------ |
| 环境区分 | Debug 打印，Release 上报 |
| 异步上报 | 不阻塞主线程             |
| 失败静默 | 上报失败不影响应用       |
| 信息脱敏 | 不上传用户隐私数据       |

---

## 三、启动优化：异步服务编排

### 3.1 启动时间线

```
main() 开始
    ↓
① WidgetsFlutterBinding.ensureInitialized()     ~1ms
    ↓
② _setupErrorHandling()                          <1ms
    ↓
③ PaintingBinding 配置                           <1ms
    ↓
④ Get.putAsync<StorageService>()                 ~50-200ms（Hive 初始化）
    ↓
⑤ Get.putAsync<LocaleService>()                  ~10-50ms
    ↓
⑥ Get.put<SecureStorageService>()                <1ms
    ↓
⑦ Get.put<ApiClient>()                           <1ms
    ↓
⑧ Get.put<AuthController>()                      <1ms
    ↓
⑨ Get.putAsync<NetworkService>()                 ~20-100ms
    ↓
⑩ Get.putAsync<OfflineService>()                 ~30-100ms
    ↓
⑪ 检查登录状态                                    ~5-20ms
    ↓
⑫ runApp(MyApp())                                ~10-50ms
    ↓
首帧渲染                                         ~16-33ms
    ↓
用户看到画面（总计 ~150-500ms）
```

### 3.2 优化策略

```dart
// ❌ 反模式：串行初始化所有服务

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await initStorage();      // 200ms
  await initLocale();       // 50ms
  await initNetwork();      // 100ms
  await initOffline();      // 100ms
  await checkLogin();       // 20ms

  runApp(MyApp());  // 总计 ~470ms
}

// ✅ 优化模式：并行初始化无依赖服务

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 第一级：必须同步完成的（无依赖）
  Get.put(SecureStorageService());
  Get.put(ApiClient());

  // 第二级：可并行初始化的
  final results = await Future.wait([
    Get.putAsync<StorageService>(() => StorageService().init()),
    Get.putAsync<LocaleService>(() => LocaleService().init()),
    Get.putAsync<NetworkService>(() => NetworkService().init()),
    Get.putAsync<OfflineService>(() => OfflineService().init()),
  ]);

  // 第三级：依赖第二级的
  Get.put(AuthController());

  runApp(MyApp());  // 总计 ~200ms（并行后）
}
```

### 3.3 分级初始化

```dart
// 更精细的分级策略

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 第一级：首帧必需（同步）
  _setupErrorHandling();
  Get.put(SecureStorageService());
  Get.put(ApiClient());

  // 第二级：首帧前完成（异步，可并行）
  await Future.wait([
    StorageService().init(),
    LocaleService().init(),
  ]);

  // 启动应用（不阻塞）
  runApp(MyApp());

  // 第三级：首帧后异步初始化
  Future.microtask(() async {
    await NetworkService().init();
    await OfflineService().init();
    Get.put(AuthController());
  });
}
```

---

## 四、图片缓存配置

### 4.1 配置时机

```dart
// main.dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 图片缓存配置（在 runApp 之前）
  PaintingBinding.instance.imageCache.maximumSizeBytes = 100 << 20;  // 100MB
  PaintingBinding.instance.imageCache.maximumSize = 200;              // 200 张

  // ...
}
```

### 4.2 缓存策略

| 参数               | 说明           | 推荐值               |
| ------------------ | -------------- | -------------------- |
| `maximumSizeBytes` | 磁盘缓存上限   | 100MB（`100 << 20`） |
| `maximumSize`      | 内存缓存图片数 | 200 张               |

**原理：**

- Flutter 默认缓存 100MB 磁盘 + 1000 张图片
- 对于内容类应用（文章列表+图片），200 张足够
- 减少内存占用，避免低端机 OOM

---

## 五、Splash 启动页

### 5.1 设计原则

```
Splash 页的作用：

1. 品牌展示（Logo + 品牌色）
2. 掩盖启动耗时（服务初始化 + 首帧渲染）
3. 检查登录状态（决定是否跳转登录页）
4. 预加载数据（首屏数据提前请求）
```

### 5.2 实现

```dart
// modules/splash/view/splash_page.dart

class SplashPage extends GetView<SplashController> {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Icon(
              Icons.flutter_dash,
              size: 80,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
            const SizedBox(height: 24),
            // 品牌名
            Text(
              'Fullstack Base',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
            const SizedBox(height: 48),
            // 加载指示器
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(
                Theme.of(context).colorScheme.onPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 5.3 SplashController

```dart
// modules/splash/controller/splash_controller.dart

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    _checkLoginAndNavigate();
  }

  Future<void> _checkLoginAndNavigate() async {
    // 等待 1 秒（展示品牌）
    await Future.delayed(const Duration(seconds: 1));

    final storage = Get.find<StorageService>();
    final secureStorage = Get.find<SecureStorageService>();

    // 检查登录状态
    final isLoggedIn = await secureStorage.isLoggedIn();
    storage.isLoggedIn = isLoggedIn;

    // 跳转
    if (isLoggedIn) {
      Get.offAllNamed(AppRoutes.home);
    } else {
      Get.offAllNamed(AppRoutes.login);
    }
  }
}
```

---

## 六、统一错误映射

### 6.1 AppError 工具类

```dart
// shared/utils/error_mapper.dart

class AppError {
  static String message(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return '网络连接超时，请检查网络';

        case DioExceptionType.badResponse:
          final status = error.response?.statusCode;
          final data = error.response?.data;

          // 尝试提取服务端返回的错误信息
          if (data is Map && data['message'] != null) {
            return data['message'].toString();
          }

          // 按状态码分类
          switch (status) {
            case 400:
              return '请求参数错误';
            case 401:
              return '登录已过期，请重新登录';
            case 403:
              return '没有权限访问';
            case 404:
              return '请求的资源不存在';
            case 500:
              return '服务器内部错误';
            default:
              return '服务器错误 ($status)';
          }

        case DioExceptionType.cancel:
          return '请求已取消';

        case DioExceptionType.connectionError:
          return '网络连接失败，请检查网络';

        default:
          return '网络异常，请稍后重试';
      }
    }

    // 非 Dio 异常
    return error.toString();
  }
}
```

### 6.2 使用方式

```dart
// 在 Controller 中统一处理

class ArticleListController extends GetxController {
  Future<void> fetchArticles() async {
    try {
      final response = await _api.dio.get('/articles');
      // 处理成功响应
    } on DioException catch (e) {
      // 统一错误提示
      Get.snackbar('错误', AppError.message(e));
    } catch (e) {
      // 兜底处理
      Get.snackbar('错误', '未知错误：${e.toString()}');
    }
  }
}
```

---

## 七、启动性能度量

### 7.1 度量指标

| 指标                        | 说明                 | 目标值 |
| --------------------------- | -------------------- | ------ |
| TTI (Time To Interactive)   | 从点击图标到可交互   | < 2s   |
| TTFD (Time To Full Display) | 从点击到首帧完整显示 | < 1.5s |
| 首帧渲染时间                | runApp() 到首帧上屏  | < 50ms |

### 7.2 度量工具

```dart
// Debug 模式下打印启动耗时

void main() async {
  final stopwatch = Stopwatch()..start();

  WidgetsFlutterBinding.ensureInitialized();
  debugPrint('Binding 初始化: ${stopwatch.elapsedMilliseconds}ms');

  await initServices();
  debugPrint('服务初始化: ${stopwatch.elapsedMilliseconds}ms');

  runApp(MyApp());
  debugPrint('runApp 调用: ${stopwatch.elapsedMilliseconds}ms');

  stopwatch.stop();
}
```

### 7.3 性能分析

```bash
# Android 启动耗时分析

adb shell am start -W com.example.flutter_app

# 输出：
# Status: ok
# LaunchState: COLD
# Activity: com.example.flutter_app/.MainActivity
# TotalTime: 450ms  ← 冷启动总耗时
# WaitTime: 460ms
```

---

## 八、总结

### 8.1 核心知识图谱

```
全局错误处理与启动优化
│
├── 双层错误捕获
│   ├── FlutterError.onError → 同步框架错误
│   └── PlatformDispatcher.onError → 异步错误
│
├── 错误上报
│   ├── ErrorReporter → 生产环境上报
│   ├── 环境区分 → Debug 打印 / Release 上报
│   └── 失败静默 → 不影响用户体验
│
├── 启动优化
│   ├── 并行初始化 → Future.wait() 同时初始化无依赖服务
│   ├── 分级初始化 → 首帧必需 / 首帧前 / 首帧后
│   └── 图片缓存 → 配置合理上限
│
├── Splash 启动页
│   ├── 品牌展示 → Logo + 品牌色
│   ├── 掩盖耗时 → 等待服务初始化
│   └── 状态检查 → 决定跳转登录/首页
│
└── 统一错误映射
    ├── AppError.message() → DioException 转中文提示
    └── 按状态码分类 → 400/401/403/404/500
```

### 8.2 设计原则

| 原则     | 实践                           |
| -------- | ------------------------------ |
| 错误不吞 | 所有异常必须记录或上报         |
| 启动精简 | 首帧只做必需初始化             |
| 并行优化 | 无依赖服务同时初始化           |
| 用户友好 | 错误提示用中文，不暴露技术细节 |
| 度量驱动 | 启动耗时可量化、可优化         |

---

## 相关链接

- [WidgetsFlutterBinding 底层原理与启动全链路](/dev-knowledge/flutter/architecture/typical-analysis/flutter-binding-init-and-engine-bootstrap)
- [Dio 拦截器链与 Token 无感刷新](/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh)
- [GetX 模块化架构与路由守卫](/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards)
- [APP 启动与屏幕渲染原理](/dev-knowledge/flutter/architecture/thinking/app-launch-and-rendering-pipeline)
