---
title: 'Dio 网络层与 HTTP 客户端体系 [P6-P7]'
level: 'senior'
tags: ['Dio', 'Flutter', '网络', '拦截器', 'HTTP']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# Dio 网络层与 HTTP 客户端体系 [P6-P7]

> Dio 是 Flutter 最流行的 HTTP 客户端，功能强大、可扩展性好。拦截器链、Transformer、取消请求、文件上传下载等能力使其成为 Flutter 网络层的事实标准。

## 核心概念（What）

### Dio vs http 包 vs chopper 对比

| 特性         | Dio        | http | chopper |
| ------------ | ---------- | ---- | ------- |
| 拦截器       | ✅（链式） | ❌   | ✅      |
| Transformer  | ✅         | ❌   | ❌      |
| 取消请求     | ✅         | ✅   | ✅      |
| 文件上传下载 | ✅         | ✅   | ✅      |
| FormData     | ✅         | ❌   | ✅      |
| 全局配置     | ✅         | 手动 | ✅      |
| 2026 趋势    | 主流       | 基础 | 小众    |

---

## 底层原理（Why）

### 1. Dio 拦截器链：责任链模式的实现

**核心问题**：拦截器链的执行顺序和底层机制是什么？

```
拦截器链底层数据结构：

[Dio] 内部维护：
        │
        └─ _interceptors: Interceptors(List<Interceptor>)
            ├─ [0] AuthInterceptor
            ├─ [1] LogInterceptor
            └─ [2] RetryInterceptor

请求执行链路（责任链模式）：

[dio.get('/api/data')]
        ↓
[DioMixin._dispatch 创建 RequestOptions]
        ↓
[InterceptorState 包装请求]
        ↓
[遍历拦截器链]
        ├─ AuthInterceptor.onRequest(options, handler)
        │   └─ handler.next(options) → 传递给下一个
        ├─ LogInterceptor.onRequest(options, handler)
        │   └─ handler.next(options) → 传递给下一个
        └─ RetryInterceptor.onRequest(options, handler)
            └─ handler.next(options) → 传递给下一个
        ↓
[HTTP Client 发送请求]
        ↓
[响应拦截器链（正序执行，与请求同序）]
        ├─ AuthInterceptor.onResponse(response, handler)
        ├─ LogInterceptor.onResponse(response, handler)
        └─ RetryInterceptor.onResponse(response, handler)
```

**关键洞察**：

- 请求拦截器按**注册顺序**执行（正序）
- 响应拦截器按**注册顺序**执行（正序）
- `handler.next()` 传递给下一个，`handler.resolve()` 短路返回，`handler.reject()` 抛出错误
- 拦截器可以在任何环节**短路**（不继续传递，直接返回响应）
- Token 刷新场景：在 `onError` 中拦截 401，刷新 Token 后用 `dio.fetch(options)` 重试

### 2. Transformer 底层：数据序列化管线

```
Transformer 是请求/响应数据的序列化/反序列化层：

[请求数据转换]（Request Transformer）
        │
        ├─ 输入：Map / String / FormData
        ├─ 默认：JsonTransformer
        │   └─ JSON 序列化 → Uint8List
        └─ 输出：RequestOptions.data (已序列化)

[响应数据转换]（Response Transformer）
        │
        ├─ 输入：Response.data (原始字节流)
        ├─ 默认：JsonTransformer
        │   └─ JSON 反序列化 → Map / List
        └─ 输出：Response<T>.data (已反序列化)

自定义 Transformer 场景：
├─ 加密传输 → 实现加密 Transformer
├─ Protobuf → 替换 JSON 为 Protobuf 序列化
└─ 自定义编码 → 处理特殊字符集
```

### 3. 取消请求底层：CancelToken 机制

```
CancelToken 的底层实现：

[CancelToken] 内部维护：
        ├─ _completer: Completer<DioException>?
        ├─ _cancelError: DioException?
        └─ _requestOptions: List<RequestOptions>（关联的请求列表）

取消流程：
[cancelToken.cancel('用户取消')]
        ↓
[_cancelError = DioException(type: cancel)]
        ↓
[遍历 _requestOptions]
        └─ 对每个关联的请求调用 HttpClientRequest.abort()
        ↓
[底层 Socket 连接被关闭]
        ↓
[请求的 Future 返回 DioException]

多个请求共享同一个 CancelToken：
├─ 页面级 CancelToken → 页面销毁时取消所有请求
└─ 请求级 CancelToken → 单独控制某个请求
```

### 4. 连接池与 HTTP 引擎

```
Dio 底层使用 dart:io 的 HttpClient：

[Dio] ──► HttpClient
        │
        ├─ maxConnectionsPerHost: 连接池上限
        ├─ idleTimeout: 空闲连接回收时间
        └─ connectionTimeout: 连接超时

HTTP/2 支持：
├─ dart:io HttpClient 支持 HTTP/2
├─ 同一 host 的请求复用同一个 TCP 连接
└─ 多路复用减少连接建立开销

DioAdapter 抽象层：
├─ IOHttpClientAdapter（默认，dart:io）
├─ BrowserHttpClientAdapter（Web 端，XMLHttpRequest）
└─ 自定义 Adapter（如接入 Mock 数据）
```

---

## 代码示例

### 基础使用与全局配置

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

### 拦截器链

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

// 拦截器执行顺序（Dio 全部 FIFO 正序，与 Axios 的请求逆序不同）：
// 请求：AuthInterceptor.onRequest → LogInterceptor.onRequest
// 响应：AuthInterceptor.onResponse → LogInterceptor.onResponse
// 错误：AuthInterceptor.onError → LogInterceptor.onError
```

### Transformer（数据转换）

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

### 取消请求

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

### 重试策略

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

- 请求、响应、错误拦截器**均按注册顺序执行（FIFO 正序）**
- 底层是 `for` 循环 + `future.then()` 顺序拼接的扁平链，非 OkHttp/Axios 的嵌套回弹模型
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
