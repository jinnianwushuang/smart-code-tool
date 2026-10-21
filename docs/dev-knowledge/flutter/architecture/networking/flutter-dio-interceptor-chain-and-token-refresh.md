---
title: 'Dio 拦截器链与 Token 无感刷新实战'
tags: ['Flutter', 'Dio', '拦截器', 'Token刷新', 'Completer', '网络层', '实战']
---

# Dio 拦截器链与 Token 无感刷新实战

> 本文基于 flutter_app 项目的真实网络层实现，深度讲解 Dio 多拦截器协作设计、Token 无感刷新的 Completer 并发锁机制、弱网容错策略、缓存白名单设计、日志脱敏等工程实战经验。

---

## 一、整体架构

### 1.1 拦截器链全景

```
请求发出
  ↓
┌─────────────────────────────────────────────────────┐
│  AuthInterceptor（请求拦截）                           │
│  → 自动附加 Bearer Token                              │
│  → 白名单接口跳过（login/register/refresh）            │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  CacheInterceptor（请求拦截）                          │
│  → 白名单 GET 接口检查本地缓存                         │
│  → TTL 内命中 → 直接返回缓存，不发网络请求              │
│  → 未命中/过期 → 放行                                  │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  AppLogInterceptor（请求拦截）                         │
│  → Debug 模式打印请求信息                              │
│  → 自动脱敏 password/token 等敏感字段                  │
└─────────────────────────┬───────────────────────────┘
                          ↓
                     网络请求发出
                          ↓
                     响应/错误返回
                          ↓
┌─────────────────────────────────────────────────────┐
│  CacheInterceptor（响应拦截）                          │
│  → 白名单 GET 200 响应写入缓存                         │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  AppLogInterceptor（响应拦截）                         │
│  → Debug 模式打印响应状态码                            │
└─────────────────────────┬───────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  AuthInterceptor（错误拦截）                           │
│  → 401 触发 Token 刷新流程                             │
│  → 刷新成功 → 用新 Token 重放原请求                    │
│  → 刷新失败（服务端拒绝）→ 清 Token 跳登录              │
│  → 网络错误 → 不登出，保留原错误                        │
└─────────────────────────────────────────────────────┘
```

### 1.2 ApiClient 注册

```dart
// data/api/api_client.dart

class ApiClient extends GetxService {
  late final Dio dio;

  ApiClient() {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(milliseconds: AppConfig.connectTimeout),
        receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    // 拦截器顺序很关键！
    // Auth 最先执行（请求阶段最先附加 Token）
    // Cache 其次（请求阶段检查缓存）
    // Log 最后（记录最终发出的请求）
    dio.interceptors.addAll([
      AuthInterceptor(dio),
      CacheInterceptor(),
      AppLogInterceptor(),
    ]);
  }
}
```

**拦截器执行顺序规则：**

| 阶段       | 执行顺序       | 说明                                       |
| ---------- | -------------- | ------------------------------------------ |
| onRequest  | 先注册的先执行 | Auth → Cache → Log                         |
| onResponse | 后注册的先执行 | Log → Cache → Auth（Auth 不处理 response） |
| onError    | 后注册的先执行 | 与 onResponse 相反                         |

---

## 二、AuthInterceptor 深度拆解

### 2.1 请求阶段：自动附加 Token

```dart
@override
void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
  // 登录/注册/刷新接口不需要 Token
  if (!_isAuthEndpoint(options.path)) {
    final storage = Get.find<SecureStorageService>();
    final token = await storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
  }
  handler.next(options);
}

bool _isAuthEndpoint(String path) {
  return path.contains('/auth/login') ||
      path.contains('/auth/register') ||
      path.contains('/auth/refresh');
}
```

**设计要点：**

- 通过路径白名单排除不需要 Token 的接口
- 从 `SecureStorageService`（flutter_secure_storage）异步读取 Token
- Token 不存在时不发空 Authorization 头

### 2.2 错误阶段：401 处理决策树

```
收到 DioException
    ↓
status == 401？
    ├── 否 → handler.next(err)，原样传递
    └── 是 → 是认证接口本身？
              ├── 是 → handler.next(err)，不重试（避免死循环）
              └── 否 → 调用 _refreshToken()
                        ↓
                   返回 _RefreshResult
                        ├── success → 用新 Token 重放请求
                        │              → _dio.fetch(requestOptions)
                        │              → handler.resolve(response)
                        │
                        ├── logout → 清 Token + 清缓存 + 跳登录页
                        │            → handler.next(err)
                        │
                        └── retryable → 网络错误，不登出
                                       → handler.next(err)
```

### 2.3 三态枚举设计

```dart
enum _RefreshResult { success, logout, retryable }
```

| 结果        | 触发条件                                        | 处理策略                       |
| ----------- | ----------------------------------------------- | ------------------------------ |
| `success`   | Token 刷新成功                                  | 用新 Token 重放原请求          |
| `logout`    | 服务端返回 401/400/403（refreshToken 明确失效） | 清除本地凭据，跳转登录页       |
| `retryable` | 超时/断连/5xx 等网络错误                        | 不登出，保留原错误，用户可重试 |

**核心认知：网络错误 ≠ 认证失败。** 弱网环境下 Token 刷新请求可能超时，此时绝不能踢用户下线。

---

## 三、Token 无感刷新：Completer 并发锁

### 3.1 问题场景

```
时间线：
  T0: 请求 A 发出 → 401 → 触发刷新
  T1: 请求 B 发出 → 401 → 又触发刷新？！
  T2: 请求 C 发出 → 401 → 又触发刷新？！

如果不加锁：
  → 3 个刷新请求并发执行
  → 第一个成功，后两个拿到旧 refreshToken
  → 可能导致 refreshToken 被重复使用而失效
  → 用户被错误踢出登录
```

### 3.2 Completer 锁实现

```dart
class AuthInterceptor extends Interceptor {
  final Dio _dio;
  Completer<String?>? _refreshCompleter;
  bool _isRefreshing = false;

  Future<_RefreshResult> _refreshToken() async {
    // ① 如果正在刷新，等待当前刷新完成
    if (_isRefreshing) {
      await _refreshCompleter?.future;
      // 等锁释放后，检查 Token 是否已更新
      final storage = Get.find<SecureStorageService>();
      final token = await storage.getAccessToken();
      return token != null ? _RefreshResult.success : _RefreshResult.logout;
    }

    // ② 设置刷新锁
    _isRefreshing = true;
    _refreshCompleter = Completer<String?>();

    try {
      final storage = Get.find<SecureStorageService>();
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken == null) {
        _refreshCompleter!.complete(null);
        return _RefreshResult.logout;
      }

      // ③ 调用刷新接口
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data['data'] as Map<String, dynamic>;
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;

      // ④ 保存新 Token
      await storage.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      // ⑤ 通知等待的请求：刷新成功
      _refreshCompleter!.complete(newAccessToken);
      return _RefreshResult.success;

    } on DioException catch (e) {
      _refreshCompleter!.complete(null);
      // 区分网络错误 vs 认证失败
      final status = e.response?.statusCode;
      final type = e.type;
      if (type == DioExceptionType.badResponse &&
          (status == 401 || status == 400 || status == 403)) {
        return _RefreshResult.logout;
      }
      // timeout / connectionError / 5xx → 弱网，不踢用户
      return _RefreshResult.retryable;

    } catch (e) {
      _refreshCompleter!.complete(null);
      return _RefreshResult.retryable;

    } finally {
      // ⑥ 无论成功失败，释放锁
      _isRefreshing = false;
      _refreshCompleter = null;
    }
  }
}
```

### 3.3 并发时序图

```
请求 A ──401──→ _refreshToken()
                  │ _isRefreshing = true
                  │ 发起刷新请求...
                  │
请求 B ──401──→ _refreshToken()
                  │ _isRefreshing == true
                  │ await _refreshCompleter!.future  ← 挂起等待
                  │
请求 C ──401──→ _refreshToken()
                  │ _isRefreshing == true
                  │ await _refreshCompleter!.future  ← 挂起等待
                  │
              [刷新成功]
                  │ _refreshCompleter!.complete(newToken)
                  │ _isRefreshing = false
                  ↓
请求 A ← 拿到新 Token → 重放请求 → 成功
请求 B ← await 恢复 → 读 Storage → 拿到新 Token → 重放 → 成功
请求 C ← await 恢复 → 读 Storage → 拿到新 Token → 重放 → 成功
```

### 3.4 为什么用 Completer 而不是 Lock

| 方案              | 优点                    | 缺点                          |
| ----------------- | ----------------------- | ----------------------------- |
| `Completer`       | Dart 原生、零依赖、轻量 | 需要手动管理 complete/finally |
| `synchronized` 包 | 语义清晰                | 额外依赖、重量级              |
| `Semaphore`       | 可控制并发数            | 过度设计（只需互斥）          |

**Completer 是 Dart 异步模型中最轻量的"一次性Promise"，完美适配"等一次刷新结果"的场景。**

---

## 四、CacheInterceptor：白名单 TTL 缓存

### 4.1 设计原则

```
缓存策略：
├── 只缓存 GET 请求（POST/PUT/DELETE 不缓存）
├── 只缓存白名单公开接口（私有接口不缓存）
├── TTL 过期自动失效（默认 30 分钟）
├── 退出登录时清空缓存（防止账号切换串数据）
└── 缓存命中直接返回，不发网络请求（省流量 + 加速）
```

### 4.2 白名单配置

```dart
const _cacheWhitelist = [
  '/articles',    // 文章列表
  '/categories',  // 分类列表
  '/notices',     // 公告列表
  '/tags',        // 标签列表
];
```

**为什么不用全量缓存？**

- `/members/me`、`/orders` 等接口包含用户私有数据
- 如果缓存了 A 用户的响应，B 用户登录后可能读到 A 的数据
- 白名单只缓存公开、无用户差异的接口

### 4.3 请求拦截：缓存命中逻辑

```dart
@override
void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
  // 非白名单 GET → 直接放行
  if (options.method != 'GET' || !_isWhitelisted(options.path)) {
    handler.next(options);
    return;
  }

  final storage = Get.find<StorageService>();
  final cacheKey = _buildCacheKey(options);
  final cached = storage.getCachedResponse(cacheKey);

  if (cached != null) {
    // TTL 内命中 → 直接返回缓存响应
    handler.resolve(
      Response(
        requestOptions: options,
        data: cached,
        statusCode: 200,
      ),
    );
    return;
  }

  // 未命中 → 正常发网络请求
  handler.next(options);
}
```

### 4.4 缓存 Key 构建

```dart
String _buildCacheKey(RequestOptions options) {
  // 对 query 参数按 key 排序后拼接
  // 确保 ?page=1&size=10 和 ?size=10&page=1 命中同一缓存
  final sortedParams = options.queryParameters.entries.toList()
    ..sort((a, b) => a.key.compareTo(b.key));
  final params = sortedParams.map((e) => '${e.key}=${e.value}').join('&');
  return '${options.path}?$params';
}
```

### 4.5 响应拦截：写入缓存

```dart
@override
void onResponse(Response response, ResponseInterceptorHandler handler) async {
  if (response.requestOptions.method == 'GET' &&
      response.statusCode == 200 &&
      response.data is Map<String, dynamic> &&
      _isWhitelisted(response.requestOptions.path)) {
    final storage = Get.find<StorageService>();
    final cacheKey = _buildCacheKey(response.requestOptions);
    await storage.cacheResponse(cacheKey, response.data as Map<String, dynamic>);
  }
  handler.next(response);
}
```

### 4.6 TTL 过期机制

```dart
// services/storage_service.dart

Future<void> cacheResponse(String key, Map<String, dynamic> data) async {
  final cacheData = jsonEncode({
    'data': data,
    'timestamp': DateTime.now().millisecondsSinceEpoch,
  });
  await _cacheBox.put(key, cacheData);
}

Map<String, dynamic>? getCachedResponse(String key) {
  final raw = _cacheBox.get(key);
  if (raw == null) return null;

  final parsed = jsonDecode(raw) as Map<String, dynamic>;
  final timestamp = parsed['timestamp'] as int;
  final elapsed = DateTime.now().millisecondsSinceEpoch - timestamp;
  final ttlMs = AppConfig.cacheTtlMinutes * 60 * 1000;

  if (elapsed > ttlMs) {
    _cacheBox.delete(key);  // 过期自动清除
    return null;
  }
  return parsed['data'] as Map<String, dynamic>?;
}
```

---

## 五、AppLogInterceptor：日志脱敏

### 5.1 脱敏设计

```dart
const _sensitiveKeys = [
  'password', 'token', 'accessToken', 'refreshToken',
  'secret', 'credential',
];
```

### 5.2 递归脱敏算法

```dart
static dynamic _maskSensitive(dynamic data) {
  if (data is Map<String, dynamic>) {
    return data.map((key, value) {
      final isSensitive = _sensitiveKeys.any(
        (k) => key.toLowerCase().contains(k.toLowerCase()),
      );
      return MapEntry(key, isSensitive ? '***' : _maskSensitive(value));
    });
  }
  if (data is List) {
    return data.map(_maskSensitive).toList();
  }
  return data;
}
```

**效果示例：**

```
// 原始请求体
{"username": "admin", "password": "admin123"}

// 日志输出
{"username": "admin", "password": "***"}

// 原始响应体
{"data": {"accessToken": "eyJhbGci...", "user": {"name": "admin"}}}

// 日志输出
{"data": {"token": "***", "user": {"name": "admin"}}}
```

### 5.3 Debug 模式限制

```dart
@override
void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
  if (kDebugMode) {
    debugPrint('┌─── Request ───');
    debugPrint('│ ${options.method} ${options.uri}');
    if (options.data != null) {
      debugPrint('│ Body: ${_maskSensitive(options.data)}');
    }
    debugPrint('└───────────────');
  }
  handler.next(options);
}
```

**Release 模式完全不打印**，避免日志影响性能和安全。

---

## 六、常见反模式与避坑

### 6.1 反模式：网络错误触发登出

```dart
// ❌ 错误：所有刷新失败都登出
catch (e) {
  await storage.clearTokens();
  Get.offAllNamed(AppRoutes.login);
}

// ✅ 正确：区分网络错误和认证失败
on DioException catch (e) {
  if (e.type == DioExceptionType.badResponse &&
      (e.response?.statusCode == 401 || e.response?.statusCode == 400)) {
    // 服务端明确拒绝 → 登出
    return _RefreshResult.logout;
  }
  // timeout / connectionError / 5xx → 弱网，不踢用户
  return _RefreshResult.retryable;
}
```

### 6.2 反模式：缓存私有接口

```dart
// ❌ 错误：缓存所有 GET 请求
if (options.method == 'GET') {
  // /members/me、/orders 等私有接口也会被缓存！
}

// ✅ 正确：白名单只缓存公开接口
const _cacheWhitelist = ['/articles', '/categories', '/notices', '/tags'];
```

### 6.3 反模式：日志明文打印密码

```dart
// ❌ 错误：直接打印请求体
debugPrint('Body: ${options.data}');
// 输出：{"password": "admin123"}

// ✅ 正确：递归脱敏
debugPrint('Body: ${_maskSensitive(options.data)}');
// 输出：{"password": "***"}
```

### 6.4 反模式：无并发锁

```dart
// ❌ 错误：每个 401 都触发独立刷新
void onError(DioException err, ErrorInterceptorHandler handler) async {
  if (err.response?.statusCode == 401) {
    await _refreshToken();  // 3 个并发请求 → 3 次刷新！
  }
}

// ✅ 正确：Completer 锁保证只刷新一次
if (_isRefreshing) {
  await _refreshCompleter?.future;  // 等待第一个刷新完成
}
```

---

## 七、SecureStorageService：Token 安全存储

### 7.1 为什么不用 SharedPreferences

| 方案                   | 安全性               | 适用场景             |
| ---------------------- | -------------------- | -------------------- |
| SharedPreferences      | ❌ 明文存储          | 用户偏好、非敏感配置 |
| Hive                   | ❌ 明文存储          | API 缓存、离线数据   |
| flutter_secure_storage | ✅ Keychain/Keystore | Token、密码、密钥    |

### 7.2 实现

```dart
// data/local/secure_storage.dart

class SecureStorageService extends GetxService {
  final _storage = const FlutterSecureStorage();

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }

  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null;
  }
}
```

**底层实现：**

- iOS → Keychain（硬件加密保护）
- Android → Keystore（TEE 可信执行环境保护）

---

## 八、退出登录清理流程

```dart
// 在 AuthController 或 ProfileController 中

Future<void> logout() async {
  // 1. 清除 Token（SecureStorage）
  final secureStorage = Get.find<SecureStorageService>();
  await secureStorage.clearTokens();

  // 2. 清除 API 缓存（Hive）
  final storageService = Get.find<StorageService>();
  await storageService.clearCache();
  storageService.isLoggedIn = false;

  // 3. 清除离线数据（可选）
  // Get.find<OfflineService>().clearAll();

  // 4. 跳转到登录页（清除路由栈）
  Get.offAllNamed(AppRoutes.login);
}
```

**顺序很重要：** 先清 Token → 再清缓存 → 最后跳页面。如果先跳页面，其他页面可能还在读取缓存数据。

---

## 九、统一错误映射

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
          if (data is Map && data['message'] != null) {
            return data['message'].toString();
          }
          return '服务器错误 ($status)';
        case DioExceptionType.cancel:
          return '请求已取消';
        default:
          return '网络异常，请稍后重试';
      }
    }
    return error.toString();
  }
}
```

**使用方式：**

```dart
try {
  final response = await apiClient.dio.get('/articles');
  // 处理响应
} on DioException catch (e) {
  Get.snackbar('错误', AppError.message(e));
}
```

---

## 十、总结

### 10.1 核心知识图谱

```
Dio 拦截器链工程
│
├── AuthInterceptor
│   ├── onRequest → 自动附加 Bearer Token
│   ├── onError → 401 处理
│   │   ├── _refreshToken() → Completer 并发锁
│   │   ├── success → 重放请求
│   │   ├── logout → 清 Token + 跳登录
│   │   └── retryable → 弱网不登出
│   └── _isAuthEndpoint() → 白名单跳过
│
├── CacheInterceptor
│   ├── onRequest → 白名单 GET 缓存命中
│   ├── onResponse → 写入缓存
│   ├── _buildCacheKey() → 参数排序拼接
│   └── TTL 过期 → StorageService 管理
│
├── AppLogInterceptor
│   ├── onRequest → 脱敏打印
│   ├── onResponse → 状态码打印
│   ├── onError → 错误打印
│   └── _maskSensitive() → 递归脱敏算法
│
└── 配套组件
    ├── SecureStorageService → Keychain/Keystore
    ├── StorageService → Hive TTL 缓存
    ├── NetworkService → 网络状态监听
    └── AppError → 统一错误映射
```

### 10.2 设计原则

| 原则     | 实践                                 |
| -------- | ------------------------------------ |
| 弱网友好 | 网络错误不踢用户，保留重试机会       |
| 安全第一 | Token 加密存储，日志自动脱敏         |
| 缓存精准 | 白名单只缓存公开接口，退出清缓存     |
| 并发安全 | Completer 锁防止多请求同时刷新 Token |
| 职责分离 | 每个拦截器只做一件事，组合协作       |

---

## 相关链接

- [Dio 网络层与 HTTP 客户端](/dev-knowledge/flutter/interview/advanced/dio-and-networking)
- [Flutter 本地存储与持久化](/dev-knowledge/flutter/interview/advanced/flutter-local-storage)
- [GetX 框架底层设计原理](/dev-knowledge/flutter/architecture/typical-analysis/getx-reactive-system)
- [全局错误处理与启动优化](/dev-knowledge/flutter/architecture/thinking/flutter-error-handling-and-launch-optimization)
