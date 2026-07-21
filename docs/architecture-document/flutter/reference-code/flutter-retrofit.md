---
title: Flutter Retrofit 原理与工作流
order: 154
---

## Flutter Retrofit 原理与工作流

Retrofit 是 Flutter/Dart 生态中最流行的**声明式 HTTP 客户端**，灵感来自 Android 的 Retrofit。它通过**注解 + 代码生成**的方式，将接口定义自动转化为可执行的网络请求代码，底层依赖 Dio 完成实际通信。

---

## 一、核心原理

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    开发者编写的代码                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  @RestApi()                                       │  │
│  │  abstract class UserApi {                         │  │
│  │    @GET('/users/{id}')                            │  │
│  │    Future<User> getUser(@Path('id') int id);      │  │
│  │  }                                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼  build_runner 代码生成
┌─────────────────────────────────────────────────────────┐
│              自动生成的 .g.dart 文件                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  class _UserApi implements UserApi {              │  │
│  │    final Dio _dio;                                │  │
│  │    @override                                      │  │
│  │    Future<User> getUser(int id) async {           │  │
│  │      final response = await _dio.get(             │  │
│  │        '/users/$id',                              │  │
│  │      );                                           │  │
│  │      return User.fromJson(response.data);         │  │
│  │    }                                              │  │
│  │  }                                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼  运行时调用
┌─────────────────────────────────────────────────────────┐
│                     Dio HTTP 引擎                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Interceptors → Transformer → HttpClient          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 代码生成原理（Source Gen）

Retrofit 基于 Dart 的 `source_gen` + `build_runner` 体系：

1. **编译期扫描**：`build_runner` 启动后，扫描所有带 `@RestApi()` 注解的抽象类。
2. **AST 解析**：读取类中每个方法的 HTTP 注解（`@GET`、`@POST` 等）、参数注解（`@Path`、`@Query`、`@Body` 等）。
3. **代码拼接**：生成一个 `_ClassName` 私有实现类，将注解信息转化为 Dio 调用代码。
4. **序列化桥接**：结合 `json_serializable` 生成的 `fromJson` / `toJson` 完成数据转换。

> 关键依赖链：`retrofit` → `retrofit_generator` → `source_gen` → `analyzer`

### 1.3 运行时原理

生成的代码在运行时本质上是：

```dart
// 生成的代码核心逻辑（简化）
class _UserApi implements UserApi {
  _UserApi(this._dio, {this.baseUrl});

  final Dio _dio;
  String? baseUrl;

  @override
  Future<User> getUser(int id) async {
    // 1. 构建请求参数
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _headers = <String, dynamic>{};
    final _data = <String, dynamic>{};

    // 2. 发起 Dio 请求
    final _result = await _dio.fetch<Map<String, dynamic>>(
      _setStreamType<User>(
        Options(method: 'GET', headers: _headers, extra: _extra)
            .compose(_dio.options, '/users/$id',
                queryParameters: queryParameters, data: _data)
            .copyWith(baseUrl: baseUrl ?? _dio.options.baseUrl),
      ),
    );

    // 3. 反序列化响应
    final value = User.fromJson(_result.data!);
    return value;
  }
}
```

---

## 二、注解体系

### 2.1 类级注解

| 注解 | 作用 | 示例 |
|------|------|------|
| `@RestApi()` | 标记为 Retrofit 接口 | `@RestApi(baseUrl: '/api/v1')` |

### 2.2 方法级注解（HTTP 方法）

| 注解 | HTTP 方法 | 典型场景 |
|------|-----------|----------|
| `@GET('/path')` | GET | 查询资源 |
| `@POST('/path')` | POST | 创建资源 |
| `@PUT('/path')` | PUT | 全量更新 |
| `@PATCH('/path')` | PATCH | 部分更新 |
| `@DELETE('/path')` | DELETE | 删除资源 |
| `@HEAD('/path')` | HEAD | 获取响应头 |
| `@OPTIONS('/path')` | OPTIONS | 预检请求 |

### 2.3 参数级注解

| 注解 | 作用 | 示例 |
|------|------|------|
| `@Path('key')` | 路径参数替换 | `@GET('/users/{id}')` + `@Path('id') int id` |
| `@Query('key')` | URL 查询参数 | `@Query('page') int page` |
| `@Queries()` | 整个 Map 作为查询参数 | `@Queries() Map<String, dynamic> params` |
| `@Body()` | 请求体（JSON） | `@Body() CreateUserDto dto` |
| `@Field('key')` | 表单字段 | `@Field('name') String name` |
| `@Header('key')` | 请求头 | `@Header('Authorization') String token` |
| `@Part()` | Multipart 文件上传 | `@Part() File file` |

---

## 三、完整工作流

### 3.1 项目配置

```yaml
# pubspec.yaml
dependencies:
  dio: ^5.4.0
  retrofit: ^4.1.0
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.8
  retrofit_generator: ^8.1.0
  json_serializable: ^6.7.1
```

### 3.2 开发流程（6 步）

```
Step 1: 定义数据模型 (Model)
         ↓
Step 2: 定义 API 接口 (抽象类 + 注解)
         ↓
Step 3: 运行 build_runner 生成代码
         ↓
Step 4: 创建 Dio 实例 + 配置拦截器
         ↓
Step 5: 实例化 API 客户端
         ↓
Step 6: 在业务层调用接口方法
```

### 3.3 代码示例

**Step 1 — 数据模型：**

```dart
// models/user.dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

**Step 2 — API 接口定义：**

```dart
// api/user_api.dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/user.dart';

part 'user_api.g.dart';

@RestApi(baseUrl: 'https://api.example.com/v1')
abstract class UserApi {
  factory UserApi(Dio dio, {String baseUrl}) = _UserApi;

  @GET('/users')
  Future<List<User>> getUsers({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/users/{id}')
  Future<User> getUserById(@Path('id') int id);

  @POST('/users')
  Future<User> createUser(@Body() Map<String, dynamic> body);

  @PUT('/users/{id}')
  Future<User> updateUser(
    @Path('id') int id,
    @Body() Map<String, dynamic> body,
  );

  @DELETE('/users/{id}')
  Future<void> deleteUser(@Path('id') int id);

  @POST('/users/avatar')
  Future<String> uploadAvatar(
    @Part() File file,
    @Part('userId') int userId,
  );
}
```

**Step 3 — 生成代码：**

```bash
dart run build_runner build --delete-conflicting-outputs
```

**Step 4 & 5 — Dio 配置与实例化：**

```dart
// core/api_client.dart
import 'package:dio/dio.dart';
import '../api/user_api.dart';

class ApiClient {
  late final Dio dio;
  late final UserApi userApi;

  ApiClient() {
    dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    // 拦截器配置
    dio.interceptors.addAll([
      LogInterceptor(requestBody: true, responseBody: true),
      AuthInterceptor(),
    ]);

    // 实例化 Retrofit 客户端
    userApi = UserApi(dio);
  }
}

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['Authorization'] = 'Bearer <token>';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // 处理 token 过期，刷新或跳转登录
    }
    handler.next(err);
  }
}
```

**Step 6 — 业务调用：**

```dart
// controllers/user_controller.dart
import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/user.dart';

class UserController extends GetxController {
  final _apiClient = ApiClient();
  final users = <User>[].obs;
  final isLoading = false.obs;

  Future<void> fetchUsers({int page = 1}) async {
    try {
      isLoading.value = true;
      final result = await _apiClient.userApi.getUsers(page: page);
      users.assignAll(result);
    } catch (e) {
      Get.snackbar('错误', '获取用户列表失败: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
```

---

## 四、请求生命周期（从调用到响应）

```
业务代码调用 userApi.getUserById(1)
        │
        ▼
┌─ 生成的 _UserApi 实现 ─────────────────────────┐
│  1. 解析注解 → 构建 Options (method/headers)    │
│  2. 拼接 URL: baseUrl + path + pathParams       │
│  3. 组装 queryParameters / data                 │
└────────────────────────────────────────────────┘
        │
        ▼
┌─ Dio 引擎 ─────────────────────────────────────┐
│  4. 执行 Request Interceptors (请求拦截)        │
│  5. Transformer.transformRequest (序列化 body)  │
│  6. HttpClientAdapter 发起真实 HTTP 请求        │
│  7. Transformer.transformResponse (反序列化)    │
│  8. 执行 Response Interceptors (响应拦截)       │
└────────────────────────────────────────────────┘
        │
        ▼
┌─ 生成的 _UserApi 实现 ─────────────────────────┐
│  9. 调用 User.fromJson() 转为强类型对象         │
│  10. 返回 Future<User> 给业务层                 │
└────────────────────────────────────────────────┘
```

---

## 五、高级用法

### 5.1 统一响应包装

```dart
// 后端统一返回格式: { "code": 0, "msg": "ok", "data": {...} }
@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final int code;
  final String msg;
  final T data;

  ApiResponse({required this.code, required this.msg, required this.data});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) =>
      _$ApiResponseFromJson(json, fromJsonT);
}

// 接口中使用
@GET('/users/{id}')
Future<ApiResponse<User>> getUser(@Path('id') int id);
```

### 5.2 动态 BaseUrl（多环境）

```dart
// 通过工厂构造传入不同环境的 baseUrl
final userApi = UserApi(
  dio,
  baseUrl: EnvConfig.current.apiBaseUrl, // dev / staging / prod
);
```

### 5.3 取消请求

```dart
final cancelToken = CancelToken();

// 发起请求时传入
@GET('/long-task')
Future<Result> longTask(@CancelRequest() CancelToken token);

// 需要取消时
cancelToken.cancel('用户离开页面');
```

### 5.4 自定义 Headers

```dart
@GET('/secure-data')
Future<Data> getSecureData({
  @Header('X-Custom-Token') required String token,
  @Header('X-Device-Id') required String deviceId,
});
```

---

## 六、与其他方案对比

| 维度 | Retrofit + Dio | 原生 Dio | GetConnect | http 包 |
|------|---------------|----------|------------|---------|
| 类型安全 | ✅ 编译期检查 | ❌ 手动拼 URL | ❌ 弱类型 | ❌ 手动 |
| 代码生成 | ✅ 自动生成 | ❌ | ❌ | ❌ |
| 拦截器 | ✅ Dio 全套 | ✅ | 有限 | ❌ |
| 可测试性 | ✅ Mock 抽象类 | 一般 | 一般 | 一般 |
| 学习成本 | 中（需理解注解） | 低 | 低 | 低 |
| 适用规模 | 中大型项目 | 任意 | 小型/GetX 项目 | 简单脚本 |

---

## 七、常见问题与最佳实践

### 7.1 生成失败排查

```bash
# 清理缓存后重新生成
dart run build_runner clean
dart run build_runner build --delete-conflicting-outputs

# 查看详细错误
dart run build_runner build --verbose
```

### 7.2 最佳实践清单

1. **part 声明不可遗漏**：每个使用注解的文件顶部必须有 `part 'xxx.g.dart';`。
2. **Model 与 API 分离**：Model 放 `models/`，接口放 `api/`，避免循环依赖。
3. **统一错误处理**：在 Dio 拦截器中统一处理 HTTP 错误码，业务层只关注成功逻辑。
4. **泛型序列化**：使用 `genericArgumentFactories: true` 处理 `ApiResponse<T>` 嵌套。
5. **避免在生成文件中手动修改**：`.g.dart` 文件每次 build 都会覆盖。
6. **CI 中执行生成**：在 CI 流水线中加入 `build_runner build` 步骤，确保生成代码最新。
