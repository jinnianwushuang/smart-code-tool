---
title: "Dio 网络层与 HTTP 客户端体系 [P6-P7]"
level: "senior"
tags: ["Dio", "Flutter", "网络", "拦截器", "HTTP"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Dio 网络层与 HTTP 客户端体系 [P6-P7]

> Dio 是 Flutter 最流行的 HTTP 客户端，功能强大、可扩展性好。拦截器链、Transformer、取消请求、文件上传下载等能力使其成为 Flutter 网络层的事实标准。

## 核心概念（What）

### Dio vs http 包 vs chopper 对比

| 特性 | Dio | http | chopper |
|------|-----|------|---------|
| 拦截器 | ✅（链式） | ❌ | ✅ |
| Transformer | ✅ | ❌ | ❌ |
| 取消请求 | ✅ | ✅ | ✅ |
| 文件上传下载 | ✅ | ✅ | ✅ |
| FormData | ✅ | ❌ | ✅ |
| 全局配置 | ✅ | 手动 | ✅ |
| 2026 趋势 | 主流 | 基础 | 小众 |

---

## 底层原理（Why）

### 1. 基础使用与全局配置

```dart
import 'package:dio/dio.dart';

// 全局 Dio 实例（推荐单例）
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: Duration(seconds: 10),
  receiveTimeout: Duration(seconds: 15),
  headers: {
    'Content-Type': 'application/json',
  },
));

// 请求
Response response = await dio.get('/users');
Response response = await dio.post('/users', data: {'name': 'Alice'});
Response response = await dio.put('/users/1', data: {'name': 'Bob'});
Response response = await dio.delete('/users/1');

// 泛型响应
Response<List<User>> response = await dio.get<List<User>>(
  '/users',
  queryParameters: {'page': 1},
);
```

### 2. 拦截器链

```dart
// 拦截器：请求/响应前后处理
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = StorageUtil.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options); // 继续执行
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token 过期，尝试刷新
      refreshToken().then((newToken) {
        // 重试原请求
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        dio.fetch(err.requestOptions).then(handler.resolve, handler.reject);
      }).catchError((e) => handler.reject(err));
    } else {
      handler.next(err);
    }
  }
}

// 日志拦截器
class LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('REQUEST[${options.method}] => ${options.uri}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('RESPONSE[${response.statusCode}] => ${response.data}');
    handler.next(response);
  }
}

// 注册拦截器（顺序重要）
dio.interceptors.addAll([
  AuthInterceptor(),    // 1. 添加认证头
  LogInterceptor(),     // 2. 记录日志
]);

// 拦截器执行顺序：
// 请求：AuthInterceptor.onRequest → LogInterceptor.onRequest
// 响应：LogInterceptor.onResponse → AuthInterceptor.onResponse
// 错误：LogInterceptor.onError → AuthInterceptor.onError
```

### 3. Transformer（数据转换）

```dart
// Transformer：请求/响应数据转换

// 自定义 Transformer（自动解析 JSON）
class JsonTransformer extends DefaultTransformer {
  @override
  Future<dynamic> transformResponse(
    RequestOptions options,
    ResponseBody response,
  ) async {
    final data = await super.transformResponse(options, response);
    // 自动解析 JSON
    if (data is String) {
      return json.decode(data);
    }
    return data;
  }
}

dio.transformer = JsonTransformer();

// 请求数据转换
dio.post('/users', data: {
  'name': 'Alice',
  'age': 25,
});
// 自动序列化为 JSON

// FormData（文件上传）
FormData formData = FormData.fromMap({
  'name': 'Alice',
  'avatar': await MultipartFile.fromFile('./avatar.png', filename: 'avatar.png'),
});
dio.post('/upload', data: formData);
```

### 4. 取消请求

```dart
// 取消请求：避免页面退出后仍在请求
class UserRepository {
  CancelToken? _cancelToken;

  Future<List<User>> fetchUsers() async {
    _cancelToken?.cancel(); // 取消之前的请求
    _cancelToken = CancelToken();

    try {
      final response = await dio.get(
        '/users',
        cancelToken: _cancelToken,
      );
      return (response.data as List).map((e) => User.fromJson(e)).toList();
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) {
        print('Request cancelled: ${e.message}');
      }
      rethrow;
    }
  }

  void dispose() {
    _cancelToken?.cancel();
  }
}

// 在 Widget 中使用
class UserListWidget extends StatefulWidget { ... }

class _UserListWidgetState extends State<UserListWidget> {
  final _repo = UserRepository();

  @override
  void dispose() {
    _repo.dispose(); // 页面销毁时取消请求
    super.dispose();
  }
}
```

### 5. 重试策略

```dart
// 重试拦截器
class RetryInterceptor extends Interceptor {
  final int maxRetries;
  final Dio dio;

  RetryInterceptor({this.maxRetries = 3, required this.dio});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (_shouldRetry(err)) {
      for (int i = 0; i < maxRetries; i++) {
        try {
          await Future.delayed(Duration(seconds: i + 1)); // 指数退避
          final response = await dio.fetch(err.requestOptions);
          return handler.resolve(response);
        } catch (e) {
          if (i == maxRetries - 1) rethrow;
        }
      }
    }
    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        (err.response?.statusCode ?? 0) >= 500;
  }
}
```

---

## 高频面试题

### Q1: Dio 的拦截器链是如何工作的？

**参考答案要点**：
- 拦截器按注册顺序执行 onRequest
- 响应按注册逆序执行 onResponse
- 错误按注册逆序执行 onError
- handler.next() 传递给下一个拦截器
- handler.resolve/reject 中断链

### Q2: 如何处理 Token 过期自动刷新？

**参考答案要点**：
- AuthInterceptor 的 onError 中检测 401
- 调用 refreshToken API 获取新 token
- 用新 token 重试原请求（dio.fetch）
- 多个并发请求需要队列化（避免多次刷新）

### Q3: 如何取消正在进行的请求？

**参考答案要点**：
- 使用 CancelToken
- 页面 dispose 时调用 cancelToken.cancel()
- 捕获 DioException 判断 isCancel
- 避免页面销毁后仍在请求导致内存泄漏

---

## 延伸思考

1. **设计题**：设计一个完整的 Flutter 网络层（拦截器、重试、缓存、错误处理）。
2. **场景题**：多个并发请求同时触发 Token 刷新，如何避免重复刷新？
3. **对比题**：Dio vs http 包 vs Retrofit，Flutter 网络层怎么选？

---

## 参考资料

- [Dio 文档](https://pub.dev/packages/dio)
- [Dio 拦截器](https://pub.dev/documentation/dio/latest/topics/interceptor-topic.html)
- [Dio 最佳实践](https://github.com/cfug/dio/blob/main/dio/README-ZH.md)
