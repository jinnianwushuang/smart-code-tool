# Flutter 企业级项目参考手册

> **版本**: 1.0  
> **最后更新**: 2026-07-22  
> **适用对象**: 中高级 Flutter 开发者、移动端架构师  
> **技术选型**: GetX + Retrofit + json_serializable + Dio

---

## 📑 目录

- [一、技术选型总览](#一技术选型总览)
- [二、项目初始化](#二项目初始化)
- [三、目录结构规范](#三目录结构规范)
- [四、GetX 状态管理](#四getx-状态管理)
- [五、GetX 路由管理](#五getx-路由管理)
- [六、GetX 依赖注入](#六getx-依赖注入)
- [七、Retrofit 网络层](#七retrofit-网络层)
- [八、json_serializable 数据模型](#八json_serializable-数据模型)
- [九、统一响应与异常处理](#九统一响应与异常处理)
- [十、拦截器体系](#十拦截器体系)
- [十一、环境配置管理](#十一环境配置管理)
- [十二、企业级功能模块](#十二企业级功能模块)
- [十三、构建与发布](#十三构建与发布)
- [十四、工作流](#十四工作流)

---

## 一、技术选型总览

| 职责 | 方案 | 说明 |
|------|------|------|
| 状态管理 | **GetX** | 轻量、高性能、无 BuildContext 依赖 |
| 路由管理 | **GetX Router** | 命名路由 + 中间件 + 转场动画 |
| 依赖注入 | **GetX DI** | 替代 GetIt，与状态管理统一 |
| 网络请求 | **Retrofit + Dio** | 声明式 API、类型安全、自动生成 |
| 数据序列化 | **json_serializable** | 编译期代码生成，零运行时反射 |
| 本地存储 | **GetStorage / SharedPreferences** | 轻量 KV 存储 |
| 日志 | **logger** | 分级日志输出 |
| 国际化 | **GetX Translations** | 内置 i18n 方案 |

### 核心依赖 (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  dio: ^5.7.0
  retrofit: ^4.4.1
  json_annotation: ^4.9.0
  get_storage: ^2.1.1
  logger: ^2.4.0
  pretty_dio_logger: ^1.4.0
  flutter_screenutil: ^5.9.3
  cached_network_image: ^3.4.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.13
  retrofit_generator: ^9.1.5
  json_serializable: ^6.8.0
  flutter_lints: ^5.0.0
```

---

## 二、项目初始化

### 2.1 创建项目

```bash
flutter create --org com.yourcompany --project-name your_app your_app
cd your_app
```

### 2.2 安装依赖

```bash
flutter pub add get dio retrofit json_annotation get_storage logger pretty_dio_logger flutter_screenutil cached_network_image
flutter pub add --dev build_runner retrofit_generator json_serializable flutter_lints
```

### 2.3 代码生成命令

```bash
# 一次性生成
dart run build_runner build --delete-conflicting-outputs

# 监听模式（开发时使用）
dart run build_runner watch --delete-conflicting-outputs
```

---

## 三、目录结构规范

```
lib/
├── main.dart                          # 入口
├── app/
│   ├── app.dart                       # GetMaterialApp 配置
│   ├── bindings/                      # 全局 Bindings
│   │   └── initial_binding.dart
│   ├── routes/
│   │   ├── app_pages.dart             # 路由表
│   │   └── app_routes.dart            # 路由名称常量
│   ├── middleware/
│   │   └── auth_middleware.dart       # 路由守卫
│   └── theme/
│       ├── app_theme.dart
│       └── app_colors.dart
├── core/
│   ├── network/
│   │   ├── api_client.dart            # Dio 单例
│   │   ├── api_exception.dart         # 异常定义
│   │   ├── api_response.dart          # 统一响应包装
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       ├── log_interceptor.dart
│   │       └── error_interceptor.dart
│   ├── storage/
│   │   └── storage_service.dart       # GetStorage 封装
│   ├── constants/
│   │   ├── api_constants.dart
│   │   └── app_constants.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   └── extensions.dart
│   └── widgets/                       # 全局通用组件
│       ├── app_loading.dart
│       ├── app_empty.dart
│       └── app_error.dart
├── data/
│   ├── models/                        # 数据模型 (json_serializable)
│   │   ├── user_model.dart
│   │   └── user_model.g.dart
│   ├── providers/                     # Retrofit API 定义
│   │   ├── api_provider.dart
│   │   └── api_provider.g.dart
│   └── repositories/                  # 数据仓库
│       └── user_repository.dart
├── modules/                           # 业务模块 (按功能划分)
│   ├── auth/
│   │   ├── auth_binding.dart
│   │   ├── auth_controller.dart
│   │   ├── auth_view.dart
│   │   └── widgets/
│   ├── home/
│   │   ├── home_binding.dart
│   │   ├── home_controller.dart
│   │   ├── home_view.dart
│   │   └── widgets/
│   └── profile/
│       ├── profile_binding.dart
│       ├── profile_controller.dart
│       └── profile_view.dart
└── services/
    ├── auth_service.dart
    └── notification_service.dart
```

---

## 四、GetX 状态管理

### 4.1 Controller 基础模式

```dart
import 'package:get/get.dart';

class HomeController extends GetxController {
  // ===== 响应式状态 =====
  final isLoading = false.obs;
  final userName = ''.obs;
  final items = <ItemModel>[].obs;
  final tabIndex = 0.obs;

  // ===== 生命周期 =====
  @override
  void onInit() {
    super.onInit();
    _loadData();
  }

  @override
  void onReady() {
    super.onReady();
    // 页面渲染完成后执行
  }

  @override
  void onClose() {
    super.onClose();
    // 释放资源
  }

  // ===== 业务方法 =====
  Future<void> _loadData() async {
    isLoading.value = true;
    try {
      final result = await _repository.getItems();
      items.assignAll(result);
    } catch (e) {
      Get.snackbar('错误', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void changeTab(int index) {
    tabIndex.value = index;
  }
}
```

### 4.2 View 中使用

```dart
import 'package:get/get.dart';
import 'package:flutter/material.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('首页')),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        return ListView.builder(
          itemCount: controller.items.length,
          itemBuilder: (context, index) {
            return ListTile(title: Text(controller.items[index].name));
          },
        );
      }),
    );
  }
}
```

### 4.3 GetBuilder（非响应式更新）

```dart
// Controller 中手动更新
class SettingsController extends GetxController {
  String language = 'zh_CN';

  void setLanguage(String lang) {
    language = lang;
    update(); // 手动触发更新
  }
}

// View 中使用
GetBuilder<SettingsController>(
  builder: (ctrl) => Text(ctrl.language),
)
```

### 4.4 状态混入 (Mixin)

```dart
// 通用加载状态混入
mixin LoadingMixin on GetxController {
  final isLoading = false.obs;

  Future<T> withLoading<T>(Future<T> Function() action) async {
    isLoading.value = true;
    try {
      return await action();
    } finally {
      isLoading.value = false;
    }
  }
}

// 使用
class UserController extends GetxController with LoadingMixin {
  final users = <UserModel>[].obs;

  Future<void> fetchUsers() async {
    final result = await withLoading(() => _repo.getUsers());
    users.assignAll(result);
  }
}
```

### 4.5 Worker 监听

```dart
class SearchController extends GetxController {
  final keyword = ''.obs;

  @override
  void onInit() {
    super.onInit();
    // 防抖搜索
    debounce(keyword, (_) => _doSearch(), time: const Duration(milliseconds: 500));
    // 每次变化触发
    ever(keyword, (_) => debugPrint('keyword changed'));
    // 只触发一次
    once(keyword, (_) => debugPrint('first change'));
  }

  void _doSearch() {
    // 执行搜索逻辑
  }
}
```

---

## 五、GetX 路由管理

### 5.1 路由名称定义

```dart
// app/routes/app_routes.dart
abstract class AppRoutes {
  static const splash = '/splash';
  static const login = '/login';
  static const home = '/home';
  static const profile = '/profile';
  static const detail = '/detail';
}
```

### 5.2 路由表配置

```dart
// app/routes/app_pages.dart
import 'package:get/get.dart';

abstract class AppPages {
  static final pages = [
    GetPage(
      name: AppRoutes.splash,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: AuthBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const HomeView(),
      binding: HomeBinding(),
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: AppRoutes.detail,
      page: () => const DetailView(),
      binding: DetailBinding(),
      transition: Transition.rightToLeft,
    ),
  ];
}
```

### 5.3 路由导航

```dart
// 跳转
Get.toNamed(AppRoutes.detail);
Get.toNamed(AppRoutes.detail, arguments: {'id': 123});

// 替换当前页
Get.offNamed(AppRoutes.home);

// 清除所有栈并跳转
Get.offAllNamed(AppRoutes.login);

// 返回
Get.back();
Get.back(result: 'done');

// 接收参数
final args = Get.arguments as Map<String, dynamic>;
final id = args['id'];
```

### 5.4 路由中间件（守卫）

```dart
// app/middleware/auth_middleware.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthMiddleware extends GetMiddleware {
  @override
  int? get priority => 1;

  @override
  RouteSettings? redirect(String? route) {
    final authService = Get.find<AuthService>();
    if (!authService.isLoggedIn) {
      return const RouteSettings(name: AppRoutes.login);
    }
    return null; // 不重定向
  }

  @override
  GetPageBuilder? onPageCalled(GetPage? page) {
    // 页面被调用时
    return super.onPageCalled(page);
  }
}
```

### 5.5 Binding 依赖绑定

```dart
// modules/home/home_binding.dart
import 'package:get/get.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HomeController>(() => HomeController(
      repository: Get.find(),
    ));
    Get.lazyPut<UserRepository>(() => UserRepository(
      provider: Get.find(),
    ));
  }
}
```

---

## 六、GetX 依赖注入

### 6.1 注册服务

```dart
// app/bindings/initial_binding.dart
class InitialBinding extends Bindings {
  @override
  void dependencies() {
    // 单例 - 全局唯一
    Get.put<StorageService>(StorageService(), permanent: true);
    Get.put<AuthService>(AuthService(), permanent: true);

    // 懒加载单例
    Get.lazyPut<ApiClient>(() => ApiClient.create());

    // 工厂模式 - 每次获取新实例
    Get.create(() => Logger());
  }
}
```

### 6.2 获取服务

```dart
// 获取已注册的服务
final api = Get.find<ApiClient>();
final storage = Get.find<StorageService>();

// 判断是否已注册
if (Get.isRegistered<ApiClient>()) {
  final api = Get.find<ApiClient>();
}

// 注销
Get.delete<SomeController>();
```

### 6.3 在 main.dart 中初始化

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化存储
  await GetStorage.init();

  runApp(
    GetMaterialApp(
      title: 'Enterprise App',
      initialBinding: InitialBinding(),
      initialRoute: AppRoutes.splash,
      getPages: AppPages.pages,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      defaultTransition: Transition.cupertino,
      translations: AppTranslations(),
      locale: const Locale('zh', 'CN'),
      fallbackLocale: const Locale('en', 'US'),
      debugShowCheckedModeBanner: false,
    ),
  );
}
```

---

## 七、Retrofit 网络层

### 7.1 Dio 客户端配置

```dart
// core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response, FormData, MultipartFile;

class ApiClient {
  static Dio? _dio;

  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    dio.interceptors.addAll([
      AuthInterceptor(),
      ErrorInterceptor(),
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        compact: true,
      ),
    ]);

    return dio;
  }
}
```

### 7.2 Retrofit API 定义

```dart
// data/providers/api_provider.dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/user_model.dart';
import '../models/page_model.dart';

part 'api_provider.g.dart';

@RestApi(baseUrl: ApiConstants.baseUrl)
abstract class ApiProvider {
  factory ApiProvider(Dio dio, {String baseUrl}) = _ApiProvider;

  // ===== 认证 =====
  @POST('/auth/login')
  Future<ApiResponse<LoginModel>> login(@Body() LoginRequest request);

  @POST('/auth/refresh')
  Future<ApiResponse<TokenModel>> refreshToken(@Body() RefreshRequest request);

  @POST('/auth/logout')
  Future<ApiResponse<void>> logout();

  // ===== 用户 =====
  @GET('/users')
  Future<ApiResponse<PageModel<UserModel>>> getUsers(
    @Query('page') int page,
    @Query('size') int size, {
    @Query('keyword') String? keyword,
    @Query('status') int? status,
  });

  @GET('/users/{id}')
  Future<ApiResponse<UserModel>> getUserById(@Path('id') int id);

  @POST('/users')
  Future<ApiResponse<UserModel>> createUser(@Body() CreateUserRequest request);

  @PUT('/users/{id}')
  Future<ApiResponse<UserModel>> updateUser(
    @Path('id') int id,
    @Body() UpdateUserRequest request,
  );

  @DELETE('/users/{id}')
  Future<ApiResponse<void>> deleteUser(@Path('id') int id);

  // ===== 文件上传 =====
  @POST('/upload')
  @MultiPart()
  Future<ApiResponse<UploadModel>> uploadFile(
    @Part() File file, {
    @Part() String? type,
  });

  // ===== 通用 =====
  @GET('/config/app')
  Future<ApiResponse<AppConfigModel>> getAppConfig();
}
```

### 7.3 生成代码

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 7.4 Repository 层封装

```dart
// data/repositories/user_repository.dart
import 'package:get/get.dart';

class UserRepository {
  final ApiProvider _provider;

  UserRepository({required ApiProvider provider}) : _provider = provider;

  Future<List<UserModel>> getUsers({int page = 1, int size = 20, String? keyword}) async {
    final response = await _provider.getUsers(page, size, keyword: keyword);
    return response.data?.records ?? [];
  }

  Future<UserModel> getUserById(int id) async {
    final response = await _provider.getUserById(id);
    return response.data!;
  }

  Future<UserModel> createUser(CreateUserRequest request) async {
    final response = await _provider.createUser(request);
    return response.data!;
  }

  Future<void> deleteUser(int id) async {
    await _provider.deleteUser(id);
  }
}
```

---

## 八、json_serializable 数据模型

### 8.1 基础模型定义

```dart
// data/models/user_model.dart
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final int id;
  final String username;
  final String? email;
  final String? avatar;
  final int status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final RoleModel? role;

  const UserModel({
    required this.id,
    required this.username,
    this.email,
    this.avatar,
    required this.status,
    required this.createdAt,
    this.updatedAt,
    this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  // 便捷方法
  bool get isActive => status == 1;
  String get displayName => username;
}

@JsonSerializable()
class RoleModel {
  final int id;
  final String name;
  final List<String> permissions;

  const RoleModel({
    required this.id,
    required this.name,
    required this.permissions,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) => _$RoleModelFromJson(json);
  Map<String, dynamic> toJson() => _$RoleModelToJson(this);
}
```

### 8.2 字段映射与高级配置

```dart
@JsonSerializable()
class OrderModel {
  final int id;

  // 字段名映射：JSON 中为 order_no，Dart 中为 orderNo
  @JsonKey(name: 'order_no')
  final String orderNo;

  // 默认值
  @JsonKey(defaultValue: 0.0)
  final double amount;

  // 自定义序列化
  @JsonKey(fromJson: _dateTimeFromJson, toJson: _dateTimeToJson)
  final DateTime? paidAt;

  // 忽略字段
  @JsonKey(includeFromJson: false, includeToJson: false)
  bool isSelected;

  // 枚举
  final OrderStatus status;

  const OrderModel({
    required this.id,
    required this.orderNo,
    this.amount = 0.0,
    this.paidAt,
    this.isSelected = false,
    required this.status,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) => _$OrderModelFromJson(json);
  Map<String, dynamic> toJson() => _$OrderModelToJson(this);

  static DateTime? _dateTimeFromJson(int? timestamp) {
    return timestamp != null ? DateTime.fromMillisecondsSinceEpoch(timestamp * 1000) : null;
  }

  static int? _dateTimeToJson(DateTime? date) {
    return date != null ? date.millisecondsSinceEpoch ~/ 1000 : null;
  }
}

// 枚举序列化
enum OrderStatus {
  @JsonValue(0)
  pending,
  @JsonValue(1)
  paid,
  @JsonValue(2)
  shipped,
  @JsonValue(3)
  completed,
  @JsonValue(-1)
  cancelled,
}
```

### 8.3 请求模型

```dart
@JsonSerializable()
class LoginRequest {
  final String username;
  final String password;
  @JsonKey(name: 'device_id')
  final String deviceId;

  const LoginRequest({
    required this.username,
    required this.password,
    required this.deviceId,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class CreateUserRequest {
  final String username;
  final String email;
  final String password;
  @JsonKey(name: 'role_id')
  final int roleId;

  const CreateUserRequest({
    required this.username,
    required this.email,
    required this.password,
    required this.roleId,
  });

  factory CreateUserRequest.fromJson(Map<String, dynamic> json) => _$CreateUserRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateUserRequestToJson(this);
}
```

### 8.4 分页模型

```dart
@JsonSerializable(genericArgumentFactories: true)
class PageModel<T> {
  final List<T> records;
  final int total;
  final int page;
  final int size;

  const PageModel({
    required this.records,
    required this.total,
    required this.page,
    required this.size,
  });

  factory PageModel.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$PageModelFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
      _$PageModelToJson(this, toJsonT);

  bool get hasNext => page * size < total;
  int get totalPages => (total / size).ceil();
}
```

---

## 九、统一响应与异常处理

### 9.1 统一响应结构

```dart
// core/network/api_response.dart
import 'package:json_annotation/json_annotation.dart';

part 'api_response.g.dart';

@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final int code;
  final String message;
  final T? data;

  const ApiResponse({
    required this.code,
    required this.message,
    this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);

  bool get isSuccess => code == 0 || code == 200;
}
```

### 9.2 异常定义

```dart
// core/network/api_exception.dart
class ApiException implements Exception {
  final int code;
  final String message;
  final dynamic data;

  const ApiException({
    required this.code,
    required this.message,
    this.data,
  });

  @override
  String toString() => 'ApiException($code): $message';
}

class NetworkException extends ApiException {
  const NetworkException({super.code = -1, required super.message});
}

class UnauthorizedException extends ApiException {
  const UnauthorizedException({super.code = 401, super.message = '登录已过期，请重新登录'});
}

class ForbiddenException extends ApiException {
  const ForbiddenException({super.code = 403, super.message = '无权限访问'});
}

class ServerException extends ApiException {
  const ServerException({super.code = 500, super.message = '服务器异常'});
}
```

### 9.3 全局错误处理

```dart
// core/network/error_handler.dart
import 'package:get/get.dart';

class ErrorHandler {
  static void handle(dynamic error) {
    if (error is UnauthorizedException) {
      // Token 过期 → 跳转登录
      Get.offAllNamed(AppRoutes.login);
      Get.snackbar('提示', error.message);
    } else if (error is ForbiddenException) {
      Get.snackbar('权限不足', error.message);
    } else if (error is NetworkException) {
      Get.snackbar('网络错误', '请检查网络连接');
    } else if (error is ServerException) {
      Get.snackbar('服务异常', '服务器繁忙，请稍后重试');
    } else if (error is ApiException) {
      Get.snackbar('请求失败', error.message);
    } else {
      Get.snackbar('未知错误', error.toString());
    }
  }
}
```

---

## 十、拦截器体系

### 10.1 认证拦截器

```dart
// core/network/interceptors/auth_interceptor.dart
import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response, FormData, MultipartFile;

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final storage = Get.find<StorageService>();
    final token = storage.getToken();

    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // 尝试刷新 Token
      final refreshed = await _tryRefreshToken(err);
      if (refreshed) {
        // 重放请求
        final response = await _retry(err.requestOptions);
        return handler.resolve(response);
      }
      // 刷新失败 → 登出
      Get.find<AuthService>().logout();
    }
    handler.next(err);
  }

  Future<bool> _tryRefreshToken(DioException err) async {
    try {
      final storage = Get.find<StorageService>();
      final refreshToken = storage.getRefreshToken();
      if (refreshToken == null) return false;

      final dio = Dio();
      final response = await dio.post(
        '${ApiConstants.baseUrl}/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final newToken = response.data['data']['access_token'];
        storage.saveToken(newToken);
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return ApiClient.instance.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }
}
```

### 10.2 错误转换拦截器

```dart
// core/network/interceptors/error_interceptor.dart
import 'package:dio/dio.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final exception = _mapException(err);
    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: exception,
        type: err.type,
      ),
    );
  }

  ApiException _mapException(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkException(message: '连接超时，请检查网络');
      case DioExceptionType.connectionError:
        return const NetworkException(message: '网络连接失败');
      case DioExceptionType.badResponse:
        return _handleBadResponse(err.response);
      default:
        return NetworkException(message: err.message ?? '网络异常');
    }
  }

  ApiException _handleBadResponse(Response? response) {
    final statusCode = response?.statusCode ?? 0;
    final message = response?.data?['message'] ?? '请求失败';

    switch (statusCode) {
      case 401:
        return UnauthorizedException(message: message);
      case 403:
        return ForbiddenException(message: message);
      case 404:
        return ApiException(code: 404, message: '资源不存在');
      case 500:
      case 502:
      case 503:
        return ServerException(message: message);
      default:
        return ApiException(code: statusCode, message: message);
    }
  }
}
```

---

## 十一、环境配置管理

### 11.1 环境枚举

```dart
// core/constants/env.dart
enum Env { dev, staging, production }

class EnvConfig {
  static Env _current = Env.dev;

  static void init(Env env) => _current = env;
  static Env get current => _current;

  static String get baseUrl {
    switch (_current) {
      case Env.dev:
        return 'http://192.168.1.100:8080/api/v1';
      case Env.staging:
        return 'https://staging-api.example.com/api/v1';
      case Env.production:
        return 'https://api.example.com/api/v1';
    }
  }

  static bool get isDev => _current == Env.dev;
  static bool get enableLog => _current != Env.production;
}
```

### 11.2 多入口文件

```dart
// lib/main_dev.dart
import 'core/constants/env.dart';
import 'main.dart' as app;

void main() {
  EnvConfig.init(Env.dev);
  app.main();
}

// lib/main_prod.dart
import 'core/constants/env.dart';
import 'main.dart' as app;

void main() {
  EnvConfig.init(Env.production);
  app.main();
}
```

### 11.3 构建命令

```bash
# 开发环境
flutter run --target lib/main_dev.dart

# 生产环境
flutter build apk --target lib/main_prod.dart --release
flutter build ios --target lib/main_prod.dart --release
```

---

## 十二、企业级功能模块

### 12.1 本地存储封装

```dart
// core/storage/storage_service.dart
import 'package:get_storage/get_storage.dart';
import 'package:get/get.dart';

class StorageService extends GetxService {
  late final GetStorage _box;

  static const _tokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userKey = 'user_info';

  Future<StorageService> init() async {
    _box = GetStorage();
    return this;
  }

  // Token
  void saveToken(String token) => _box.write(_tokenKey, token);
  String? getToken() => _box.read(_tokenKey);
  void saveRefreshToken(String token) => _box.write(_refreshTokenKey, token);
  String? getRefreshToken() => _box.read(_refreshTokenKey);

  // 用户信息
  void saveUser(UserModel user) => _box.write(_userKey, user.toJson());
  UserModel? getUser() {
    final json = _box.read<Map<String, dynamic>>(_userKey);
    return json != null ? UserModel.fromJson(json) : null;
  }

  // 通用
  void write(String key, dynamic value) => _box.write(key, value);
  T? read<T>(String key) => _box.read<T>(key);
  void remove(String key) => _box.remove(key);
  void clear() => _box.erase();
}
```

### 12.2 认证服务

```dart
// services/auth_service.dart
import 'package:get/get.dart';

class AuthService extends GetxService {
  final _storage = Get.find<StorageService>();
  final _provider = Get.find<ApiProvider>();

  final isLoggedIn = false.obs;
  final currentUser = Rxn<UserModel>();

  @override
  void onInit() {
    super.onInit();
    _restoreSession();
  }

  void _restoreSession() {
    final token = _storage.getToken();
    if (token != null && token.isNotEmpty) {
      isLoggedIn.value = true;
      currentUser.value = _storage.getUser();
    }
  }

  Future<void> login(String username, String password) async {
    final response = await _provider.login(LoginRequest(
      username: username,
      password: password,
      deviceId: 'flutter-app',
    ));

    final data = response.data!;
    _storage.saveToken(data.accessToken);
    _storage.saveRefreshToken(data.refreshToken);
    _storage.saveUser(data.user);

    isLoggedIn.value = true;
    currentUser.value = data.user;
  }

  void logout() {
    _storage.clear();
    isLoggedIn.value = false;
    currentUser.value = null;
    Get.offAllNamed(AppRoutes.login);
  }
}
```

### 12.3 全局加载与对话框

```dart
// core/widgets/app_dialogs.dart
import 'package:get/get.dart';
import 'package:flutter/material.dart';

class AppDialogs {
  static void showLoading({String message = '加载中...'}) {
    Get.dialog(
      WillPopScope(
        onWillPop: () async => false,
        child: Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 16),
                  Text(message),
                ],
              ),
            ),
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  static void hideLoading() {
    if (Get.isDialogOpen == true) {
      Get.back();
    }
  }

  static Future<bool> showConfirm({
    required String title,
    required String content,
  }) async {
    final result = await Get.dialog<bool>(
      AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('取消')),
          ElevatedButton(onPressed: () => Get.back(result: true), child: const Text('确认')),
        ],
      ),
    );
    return result ?? false;
  }
}
```

### 12.4 下拉刷新 + 上拉加载

```dart
// 通用分页 Controller 基类
abstract class PaginatedController<T> extends GetxController {
  final items = <T>[].obs;
  final isLoading = false.obs;
  final isLoadingMore = false.obs;
  final hasMore = true.obs;
  final page = 1.obs;
  final pageSize = 20;

  Future<List<T>> fetchPage(int page, int size);

  Future<void> refresh() async {
    page.value = 1;
    hasMore.value = true;
    isLoading.value = true;
    try {
      final result = await fetchPage(1, pageSize);
      items.assignAll(result);
      hasMore.value = result.length >= pageSize;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadMore() async {
    if (!hasMore.value || isLoadingMore.value) return;
    isLoadingMore.value = true;
    try {
      final nextPage = page.value + 1;
      final result = await fetchPage(nextPage, pageSize);
      items.addAll(result);
      page.value = nextPage;
      hasMore.value = result.length >= pageSize;
    } finally {
      isLoadingMore.value = false;
    }
  }

  @override
  void onInit() {
    super.onInit();
    refresh();
  }
}

// 具体实现
class UserListController extends PaginatedController<UserModel> {
  final _repository = Get.find<UserRepository>();

  @override
  Future<List<UserModel>> fetchPage(int page, int size) {
    return _repository.getUsers(page: page, size: size);
  }
}
```

### 12.5 GetX 国际化

```dart
// app/translations/app_translations.dart
import 'package:get/get.dart';

class AppTranslations extends Translations {
  @override
  Map<String, Map<String, String>> get keys => {
    'zh_CN': {
      'app_name': '企业应用',
      'login': '登录',
      'logout': '退出登录',
      'home': '首页',
      'profile': '我的',
      'loading': '加载中...',
      'network_error': '网络异常，请重试',
      'confirm_delete': '确认删除？',
    },
    'en_US': {
      'app_name': 'Enterprise App',
      'login': 'Login',
      'logout': 'Logout',
      'home': 'Home',
      'profile': 'Profile',
      'loading': 'Loading...',
      'network_error': 'Network error, please retry',
      'confirm_delete': 'Confirm delete?',
    },
  };
}

// 使用
Text('app_name'.tr)
Text('loading'.tr)
```

---

## 十三、构建与发布

### 13.1 代码规范 (analysis_options.yaml)

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_declarations
    - avoid_print
    - prefer_single_quotes
    - sort_child_properties_last
    - use_key_in_widget_constructors
    - prefer_final_locals

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  errors:
    invalid_annotation_target: ignore
```

### 13.2 构建脚本

```bash
#!/bin/bash
# build.sh

echo "🔨 生成代码..."
dart run build_runner build --delete-conflicting-outputs

echo "📦 构建 APK..."
flutter build apk --release --target lib/main_prod.dart

echo "📦 构建 App Bundle..."
flutter build appbundle --release --target lib/main_prod.dart

echo "🍎 构建 iOS..."
flutter build ios --release --target lib/main_prod.dart --no-codesign

echo "✅ 构建完成"
```

### 13.3 常用命令速查

```bash
# 代码生成
dart run build_runner build --delete-conflicting-outputs
dart run build_runner watch --delete-conflicting-outputs

# 清理
flutter clean
flutter pub get
dart run build_runner clean

# 分析
flutter analyze

# 测试
flutter test
flutter test --coverage

# 性能分析
flutter run --profile
flutter build apk --analyze-size

# 多环境运行
flutter run --target lib/main_dev.dart
flutter run --target lib/main_prod.dart --release
```

### 13.4 完整模块示例

```dart
// ===== modules/user/user_binding.dart =====
class UserBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<UserListController>(() => UserListController());
  }
}

// ===== modules/user/user_list_controller.dart =====
class UserListController extends PaginatedController<UserModel> {
  final _repo = Get.find<UserRepository>();
  final keyword = ''.obs;

  @override
  Future<List<UserModel>> fetchPage(int page, int size) {
    return _repo.getUsers(page: page, size: size, keyword: keyword.value);
  }

  void search(String value) {
    keyword.value = value;
    refresh();
  }

  Future<void> deleteUser(int id) async {
    final confirmed = await AppDialogs.showConfirm(
      title: '提示',
      content: 'confirm_delete'.tr,
    );
    if (confirmed) {
      await _repo.deleteUser(id);
      items.removeWhere((e) => e.id == id);
      Get.snackbar('成功', '删除成功');
    }
  }
}

// ===== modules/user/user_list_view.dart =====
class UserListView extends GetView<UserListController> {
  const UserListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          onChanged: controller.search,
          decoration: const InputDecoration(hintText: '搜索用户'),
        ),
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        return RefreshIndicator(
          onRefresh: controller.refresh,
          child: ListView.builder(
            itemCount: controller.items.length + 1,
            itemBuilder: (context, index) {
              if (index == controller.items.length) {
                controller.loadMore();
                return controller.hasMore.value
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : const SizedBox.shrink();
              }
              final user = controller.items[index];
              return ListTile(
                title: Text(user.username),
                subtitle: Text(user.email ?? ''),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () => controller.deleteUser(user.id),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
```

---

## 十四、工作流

### 14.1 Git 分支策略

```
main (生产)          ← 只接受 release / hotfix 合入
  │
  ├── develop (开发主线)    ← 日常开发合入
  │     │
  │     ├── feature/login     ← 功能分支
  │     ├── feature/payment
  │     └── feature/profile
  │
  ├── release/1.2.0          ← 预发布分支（从 develop 切出）
  │
  └── hotfix/fix-crash       ← 热修复分支（从 main 切出）
```

#### 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能 | `feature/<模块>-<简述>` | `feature/user-login` |
| 修复 | `fix/<issue号>-<简述>` | `fix/123-crash-on-startup` |
| 热修复 | `hotfix/<版本>-<简述>` | `hotfix/1.2.1-token-expire` |
| 发布 | `release/<版本号>` | `release/1.3.0` |

#### 提交信息规范 (Conventional Commits)

```
<type>(<scope>): <subject>

# type 取值
feat:     新功能
fix:      修复 Bug
refactor: 重构（不改变功能）
perf:     性能优化
test:     测试
docs:     文档
chore:    构建/工具变更

# 示例
feat(auth): 添加手机号验证码登录
fix(home): 修复列表下拉刷新闪烁问题
refactor(network): 抽取 Dio 拦截器为独立模块
```

### 14.2 CI/CD 流水线 (GitHub Actions)

```yaml
# .github/workflows/flutter-ci.yml
name: Flutter CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  FLUTTER_VERSION: '3.24.0'

jobs:
  # ===== 代码质量检查 =====
  analyze:
    name: Analyze & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          channel: stable
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Code generation
        run: dart run build_runner build --delete-conflicting-outputs

      - name: Analyze
        run: flutter analyze --fatal-infos

      - name: Format check
        run: dart format --set-exit-if-changed .

  # ===== 单元测试 =====
  test:
    name: Unit & Widget Tests
    runs-on: ubuntu-latest
    needs: analyze
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          channel: stable
          cache: true

      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs

      - name: Run tests with coverage
        run: flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: coverage/lcov.info

  # ===== 构建 Android =====
  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          channel: stable
          cache: true

      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs

      - name: Decode keystore
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/keystore.jks

      - name: Build APK
        run: flutter build apk --release --target lib/main_prod.dart
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Build App Bundle
        run: flutter build appbundle --release --target lib/main_prod.dart

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: android-release
          path: |
            build/app/outputs/flutter-apk/app-release.apk
            build/app/outputs/bundle/release/app-release.aab

  # ===== 构建 iOS =====
  build-ios:
    name: Build iOS
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          channel: stable
          cache: true

      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs

      - name: Build iOS (no codesign)
        run: flutter build ios --release --target lib/main_prod.dart --no-codesign

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-release
          path: build/ios/iphoneos/
```

### 14.3 自动化版本发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Update pubspec version
        run: |
          sed -i "s/version: .*/version: ${{ steps.version.outputs.VERSION }}+${{ github.run_number }}/" pubspec.yaml

      - name: Generate changelog
        id: changelog
        run: |
          git log $(git describe --tags --abbrev=0 HEAD^)..HEAD --pretty=format:"- %s" > CHANGELOG.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: CHANGELOG.md
          files: |
            build/app/outputs/flutter-apk/app-release.apk
            build/app/outputs/bundle/release/app-release.aab
```

### 14.4 本地开发工作流

```bash
# ===== 日常开发流程 =====

# 1. 从 develop 切出功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-profile

# 2. 开发 & 代码生成（监听模式）
dart run build_runner watch --delete-conflicting-outputs

# 3. 运行项目（开发环境）
flutter run --target lib/main_dev.dart

# 4. 提交前检查
flutter analyze                    # 静态分析零警告
dart format .                      # 格式化
flutter test                       # 单元测试

# 5. 提交代码
git add .
git commit -m "feat(profile): 完成用户资料编辑功能"

# 6. 推送并创建 PR
git push origin feature/user-profile
# → 在 GitHub/GitLab 创建 Pull Request → develop

# ===== 发布流程 =====

# 1. 从 develop 切出 release 分支
git checkout develop
git checkout -b release/1.3.0

# 2. 更新版本号
# pubspec.yaml → version: 1.3.0+13

# 3. 测试 & 修复（仅允许 bugfix 提交）
flutter test --coverage

# 4. 合入 main 并打 tag
git checkout main
git merge release/1.3.0
git tag v1.3.0
git push origin main --tags

# 5. 回合 develop
git checkout develop
git merge release/1.3.0
```

### 14.5 代码审查检查清单

| 检查项 | 说明 |
|------|------|
| 分层规范 | View 不含业务逻辑，Controller 不含 UI 代码 |
| 命名规范 | 文件名 snake_case，类名 PascalCase |
| 状态管理 | 响应式变量使用 `.obs`，避免 `setState` |
| 网络层 | API 必须通过 Retrofit 定义，禁止裸 Dio 调用 |
| 异常处理 | 不允许空 `catch`，统一走 `ErrorHandler` |
| 资源释放 | `onClose()` 中释放 Stream / Timer / AnimationController |
| 硬编码 | 字符串走 i18n，颜色走 `AppColors`，尺寸走常量 |
| 测试覆盖 | 核心业务逻辑需有单元测试 |

### 14.6 环境矩阵

| 环境 | 入口文件 | 用途 | API 地址 |
|------|------|------|------|
| dev | `main_dev.dart` | 本地开发调试 | `http://192.168.1.100:8080` |
| staging | `main_staging.dart` | QA 测试验收 | `https://staging-api.example.com` |
| production | `main_prod.dart` | 正式发布 | `https://api.example.com` |

```bash
# 对应运行命令
flutter run --target lib/main_dev.dart
flutter run --target lib/main_staging.dart
flutter build apk --release --target lib/main_prod.dart
```

---

## 附录

### A. 依赖版本对照

| 包名 | 版本 | 用途 |
|------|------|------|
| get | ^4.6.6 | 状态管理 / 路由 / DI |
| dio | ^5.7.0 | HTTP 客户端 |
| retrofit | ^4.4.1 | 声明式 API |
| json_annotation | ^4.9.0 | 序列化注解 |
| json_serializable | ^6.8.0 | 序列化代码生成 |
| retrofit_generator | ^9.1.5 | Retrofit 代码生成 |
| build_runner | ^2.4.13 | 构建工具 |
| get_storage | ^2.1.1 | 本地存储 |
| logger | ^2.4.0 | 日志 |
| pretty_dio_logger | ^1.4.0 | Dio 日志美化 |
| flutter_screenutil | ^5.9.3 | 屏幕适配 |

### B. 架构分层职责

```
┌─────────────────────────────────────────┐
│  Presentation (View + Controller)       │  ← GetX 响应式 UI
├─────────────────────────────────────────┤
│  Domain (Repository 接口)               │  ← 业务规则
├─────────────────────────────────────────┤
│  Data (Repository 实现 + Provider)      │  ← Retrofit + Model
├─────────────────────────────────────────┤
│  Core (Network / Storage / Utils)       │  ← 基础设施
└─────────────────────────────────────────┘
```

### C. 开发检查清单

- [ ] 所有 Model 使用 `json_serializable` 生成
- [ ] 所有 API 使用 `retrofit` 声明式定义
- [ ] 每个模块包含 Binding / Controller / View 三件套
- [ ] 统一使用 `ApiResponse<T>` 包装响应
- [ ] 全局异常由 `ErrorInterceptor` 统一转换
- [ ] Token 刷新由 `AuthInterceptor` 自动处理
- [ ] 路由跳转统一使用命名路由
- [ ] 敏感页面配置 `AuthMiddleware` 守卫
- [ ] 多环境使用独立入口文件
- [ ] 提交前执行 `flutter analyze` 零警告

### D. Android Studio 必装插件

| 插件名称 | 用途 | 必要性 |
|------|------|------|
| **Flutter** | Flutter 开发核心支持（调试、热重载、Widget 检查） | ⭐ 必装 |
| **Dart** | Dart 语言支持（代码补全、分析、重构） | ⭐ 必装 |
| **Flutter Riverpod Snippets** | 状态管理代码模板（本项目用 GetX 可选装） | 推荐 |
| **GetX Snippets** | GetX 代码模板（快速生成 Controller/View/Binding） | ⭐ 必装 |
| **JSON to Dart Model** | JSON 一键生成 Dart Model 类（配合 json_serializable） | ⭐ 必装 |
| **Retrofit Generator** | Retrofit 接口代码生成辅助 | 推荐 |
| **Flutter Intl** | 国际化 ARB 文件管理与多语言同步 | 推荐 |
| **Error Lens** | 行内直接显示错误/警告信息 | 推荐 |
| **Rainbow Brackets** | 彩色括号配对，深层嵌套一目了然 | 推荐 |
| **Key Promoter X** | 提示快捷键，提升操作效率 | 可选 |
| **.ignore** | 快速生成/管理 .gitignore 文件 | 可选 |
| **ADB Idea** | 快捷执行 ADB 命令（清除数据、卸载等） | 可选 |
| **Flutter Outline** | 增强 Widget 树大纲视图 | 可选 |
| **Pub Version Check** | 检查 pubspec.yaml 依赖是否有新版本 | 可选 |

#### 安装路径

```
Android Studio → Settings → Plugins → Marketplace → 搜索插件名 → Install → Restart IDE
```

#### 推荐 IDE 配置

```
# Settings → Editor → General
✅ Show line numbers
✅ Show whitespaces

# Settings → Editor → Code Style → Dart
Line length: 100

# Settings → Languages & Frameworks → Flutter
✅ Enable Hot Reload on save
✅ Enable Hot Restart on save

# Settings → Tools → Actions on Save
✅ Reformat code
✅ Optimize imports
```

---

**祝企业级 Flutter 项目开发顺利！** 🚀
