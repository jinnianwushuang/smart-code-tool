---
title: Flutter 网络请求选型
tags: ['Flutter', '网络请求']
---

# Flutter 网络请求选型（2026）

> Dio 是 2026 年 Flutter 网络请求的绝对主流，Retrofit 在其上提供类型安全封装。

---

## 一、主流方案对比

| 维度 | Dio | Retrofit | http | graphql_flutter |
|------|-----|----------|------|-----------------|
| **定位** | 功能最全的 HTTP 客户端 | Dio 的类型安全封装 | 官方轻量客户端 | GraphQL 客户端 |
| **拦截器** | ✅ 强大 | 继承 Dio | ❌ | — |
| **代码生成** | ❌ | ✅ | ❌ | ❌ |
| **文件上传/下载** | ✅ | ✅ | 基础 | — |
| **Cookie 管理** | ✅ | ✅ | ❌ | — |
| **请求取消** | ✅ CancelToken | ✅ | ✅ | ✅ |
| **HTTP/2** | ✅ | ✅ | ❌ | — |
| **学习曲线** | 低 | 中 | 极低 | 高 |
| **月下载量** | 300 万+ | 80 万+ | 200 万+ | 50 万+ |
| **适用场景** | 通用首选 | 大型项目 | 简单请求 | GraphQL 后端 |

---

## 二、Dio（通用首选）

### 为什么是主流

1. **拦截器链** — Auth/Cache/Log/Retry 可组合
2. **全局配置** — BaseUrl/Header/Timeout 统一管理
3. **文件操作** — 上传/下载/进度回调
4. **请求取消** — CancelToken 防止内存泄漏
5. **FormData** — multipart/form-data 原生支持
6. **生态丰富** — dio_cache_interceptor、dio_smart_retry 等

### 核心 API

```dart
// 基础配置
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: Duration(seconds: 10),
  receiveTimeout: Duration(seconds: 15),
  headers: {'Content-Type': 'application/json'},
));

// 拦截器
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    // 添加 Token
    final token = ref.read(authProvider).token;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  },
  onResponse: (response, handler) {
    // 统一响应处理
    handler.next(response);
  },
  onError: (error, handler) {
    // 401 自动刷新 Token
    if (error.response?.statusCode == 401) {
      // 刷新逻辑
    }
    handler.next(error);
  },
));

// GET 请求
final response = await dio.get('/users', queryParameters: {'page': 1});

// POST 请求
final response = await dio.post('/users', data: {'name': 'John'});

// 文件上传
final formData = FormData.fromMap({
  'file': await MultipartFile.fromFile(filePath),
  'description': 'avatar',
});
await dio.post('/upload', data: formData);

// 文件下载
await dio.download(url, savePath, onReceiveProgress: (received, total) {
  print('${(received / total * 100).toStringAsFixed(0)}%');
});

// 请求取消
final cancelToken = CancelToken();
dio.get('/long-task', cancelToken: cancelToken);
cancelToken.cancel('User cancelled');
```

### 拦截器实战（Token 无感刷新）

```dart
class AuthInterceptor extends Interceptor {
  final Dio dio;
  final TokenStorage tokenStorage;
  Completer<String>? _refreshCompleter;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        // 并发锁：多个请求同时 401 只刷新一次
        _refreshCompleter ??= Completer<String>();
        if (!_refreshCompleter!.isCompleted) {
          final newToken = await _refreshToken();
          _refreshCompleter!.complete(newToken);
        }
        final token = await _refreshCompleter!.future;
        _refreshCompleter = null;

        // 重试原请求
        final options = err.requestOptions;
        options.headers['Authorization'] = 'Bearer $token';
        final response = await dio.fetch(options);
        return handler.resolve(response);
      } catch (e) {
        _refreshCompleter = null;
        // 刷新失败 → 登出
        await tokenStorage.clear();
        return handler.reject(err);
      }
    }
    handler.next(err);
  }
}
```

### 适用场景

- ✅ 所有项目通用首选
- ✅ 需要拦截器（Auth/Cache/Log）
- ✅ 文件上传/下载
- ✅ 需要请求取消
- ❌ 极简单请求（http 包更轻量）

---

## 三、Retrofit（类型安全封装）

### 核心优势

1. **注解式 API** — 接口定义即文档
2. **代码生成** — 编译时生成实现，类型安全
3. **基于 Dio** — 继承 Dio 所有能力（拦截器/取消/上传）
4. **减少样板** — 无需手写每个请求方法

### 核心 API

```dart
// 1. 定义接口（注解）
part 'user_api.g.dart';

@RestApi(baseUrl: 'https://api.example.com')
abstract class UserApi {
  factory UserApi(Dio dio, {String baseUrl}) = _UserApi;

  @GET('/users')
  Future<List<User>> getUsers(@Query('page') int page);

  @GET('/users/{id}')
  Future<User> getUserById(@Path('id') int id);

  @POST('/users')
  Future<User> createUser(@Body() CreateUserRequest request);

  @PUT('/users/{id}')
  Future<User> updateUser(@Path('id') int id, @Body() UpdateUserRequest request);

  @DELETE('/users/{id}')
  Future<void> deleteUser(@Path('id') int id);

  @POST('/upload')
  @MultiPart()
  Future<String> uploadAvatar(@Part() File file);
}

// 2. 运行 build_runner
// dart run build_runner build

// 3. 使用
final userApi = UserApi(dio);
final users = await userApi.getUsers(page: 1);  // 类型安全，编译时检查
```

### 与 Riverpod 集成

```dart
@riverpod
UserApi userApi(UserApiRef ref) {
  final dio = ref.watch(dioProvider);
  return UserApi(dio);
}

// 使用
class UserListPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final users = ref.watch(userListProvider);
    // ...
  }
}

@riverpod
Future<List<User>> userList(UserListRef ref) async {
  final api = ref.watch(userApiProvider);
  return api.getUsers(page: 1);
}
```

### 适用场景

- ✅ 中大型项目（接口多）
- ✅ 需要类型安全
- ✅ 团队偏好注解式开发
- ❌ 小型项目（代码生成增加复杂度）

---

## 四、http（官方轻量）

### 定位

Flutter 官方维护的轻量 HTTP 客户端，**无第三方依赖**。

### 适用场景

- ✅ 极简单请求（1-2 个 API）
- ✅ 不想引入 Dio 依赖
- ✅ 学习/教学示例
- ❌ 需要拦截器
- ❌ 文件上传/下载
- ❌ 复杂请求管理

```dart
import 'package:http/http.dart' as http;

final response = await http.get(Uri.parse('https://api.example.com/users'));
if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
}
```

---

## 五、graphql_flutter

### 适用场景

- ✅ 后端使用 GraphQL
- ✅ 需要订阅（Subscription）
- ❌ REST API 项目

```dart
final client = GraphQLClient(
  cache: GraphQLCache(store: HiveStore()),
  link: HttpLink('https://api.example.com/graphql'),
);

final result = await client.query(QueryOptions(
  document: gql('''
    query GetUsers {
      users { id name email }
    }
  '''),
));
```

---

## 六、选型决策

```
后端是什么？
├─ REST API
│   ├─ 简单项目（< 5 个接口）→ http
│   ├─ 通用项目 → Dio
│   └─ 大型项目（接口多 + 类型安全）→ Dio + Retrofit
└─ GraphQL
    └─ graphql_flutter + Dio（作为 transport）
```

### 推荐组合

| 项目规模 | 推荐方案 |
|---------|---------|
| 原型/小型 | Dio |
| 中型 | Dio + json_serializable |
| 大型 | Dio + Retrofit + json_serializable + freezed |
| GraphQL | graphql_flutter + Dio |

---

## 七、常见反模式

### ❌ 不要在 Service 层直接 new Dio()

```dart
// 错误：每个 Service 创建独立 Dio 实例
class UserService {
  final dio = Dio();  // ❌ 无法共享拦截器/配置
}

// 正确：通过 DI 注入单例 Dio
class UserService {
  final Dio dio;
  UserService(this.dio);  // ✅
}
```

### ❌ 不要在拦截器中做业务逻辑

```dart
// 错误：拦截器中处理 UI 逻辑
onError: (error, handler) {
  Get.snackbar('Error', error.message);  // ❌ 拦截器不应操作 UI
  handler.next(error);
}

// 正确：拦截器只做 HTTP 层处理，业务逻辑在 Repository/Provider
onError: (error, handler) {
  // ✅ 只处理 Token 刷新、重试等 HTTP 层逻辑
  handler.next(error);
}
```

### ❌ 不要忽略请求取消

```dart
// 错误：页面销毁后请求仍在进行
@override
void dispose() {
  super.dispose();  // ❌ 请求未取消，回调时 context 已失效
}

// 正确：使用 CancelToken
final cancelToken = CancelToken();

@override
void dispose() {
  cancelToken.cancel('Page disposed');
  super.dispose();
}
```

---

## 参考资源

- [Dio 官方文档](https://pub.dev/packages/dio)
- [Retrofit 官方文档](https://pub.dev/packages/retrofit)
- [http 官方文档](https://pub.dev/packages/http)
- [graphql_flutter 官方文档](https://pub.dev/packages/graphql_flutter)
