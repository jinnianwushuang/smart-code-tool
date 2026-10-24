---
title: 'build_runner 代码生成工程化实战'
tags: ['Flutter', 'build_runner', 'Retrofit', 'json_serializable', 'slang', '代码生成', '工程化']
---

# build_runner 代码生成工程化实战

> 本文基于 flutter_app 项目中 Retrofit + json_serializable + slang 三套代码生成器共存的实战经验，深度讲解 build_runner 的配置、Annotation 标注规范、`.g.dart` 管理策略、多生成器冲突解决、开发工作流等工程化实践。

---

## 一、整体架构

### 1.1 三套生成器共存

```
flutter_app/
├── data/
│   ├── api/
│   │   ├── auth_api.dart          ← @RestApi() → Retrofit 生成
│   │   ├── auth_api.g.dart        ← 生成的 HTTP 实现
│   │   ├── article_api.dart       ← @RestApi()
│   │   └── article_api.g.dart
│   └── models/
│       ├── user.dart              ← @JsonSerializable() → json_serializable 生成
│       ├── user.g.dart            ← 生成的 fromJson/toJson
│       ├── api_response.dart      ← @JsonSerializable(genericArgumentFactories: true)
│       └── api_response.g.dart
├── i18n/
│   ├── translations.json          ← slang 源文件（手动编辑）
│   ├── translations_en.json       ← 英文翻译
│   ├── translations_zh.json       ← 中文翻译
│   └── translations.g.dart        ← slang 生成的类型安全翻译类
```

### 1.2 依赖配置

```yaml
# pubspec.yaml

dependencies:
  # 序列化
  json_annotation: ^4.12.0
  # 网络层
  retrofit: ^4.10.0

dev_dependencies:
  build_runner: ^2.4.14
  retrofit_generator: ^10.2.8
  json_serializable: ^6.14.1
  # slang 通过 dart run slang 独立运行
  slang_flutter: ^4.4.1
```

---

## 二、json_serializable：模型序列化

### 2.1 标准模型定义

```dart
// data/models/user.dart

import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';  // ← 必须声明 part 指令

@JsonSerializable()
class UserModel {
  final String id;
  final String username;
  final String? email;       // 可空字段
  final String? nickname;
  final String? avatar;
  final String? phone;
  final String? status;
  final String? createdAt;

  const UserModel({
    required this.id,
    required this.username,
    this.email,
    this.nickname,
    this.avatar,
    this.phone,
    this.status,
    this.createdAt,
  });

  // 工厂方法：调用生成的 _$UserModelFromJson
  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  // 序列化方法：调用生成的 _$UserModelToJson
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
```

### 2.2 泛型模型

```dart
// data/models/api_response.dart

@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final int code;
  final String message;
  final T? data;
  final int timestamp;

  // 泛型需要额外的 fromJson/toJson 函数参数
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
      _$ApiResponseToJson(this, toJsonT);
}
```

**使用示例：**

```dart
// 解析 ApiResponse<UserModel>

final response = await dio.get('/users/me');
final apiResponse = ApiResponse<UserModel>.fromJson(
  response.data,
  (json) => UserModel.fromJson(json as Map<String, dynamic>),
);

// apiResponse.data 的类型是 UserModel?
final user = apiResponse.data;
```

### 2.3 常用 Annotation 配置

```dart
// 全局配置（在文件顶部或 build.yaml 中）

// 方式 1：类级别注解
@JsonSerializable(
  explicitToJson: true,           // 嵌套对象也调用 toJson
  includeIfNull: false,           // null 字段不序列化
  fieldRename: FieldRename.snake, // Dart camelCase → JSON snake_case
)
class MyModel { ... }

// 方式 2：字段级别注解
class MyModel {
  @JsonKey(name: 'user_name')     // 自定义 JSON key
  final String username;

  @JsonKey(defaultValue: '')       // 缺失时使用默认值
  final String nickname;

  @JsonKey(ignore: true)           // 不参与序列化
  final bool isLoaded = false;

  @JsonKey(fromJson: _dateTimeFromJson) // 自定义转换
  final DateTime createdAt;
}

// 自定义转换函数
DateTime _dateTimeFromJson(String json) => DateTime.parse(json);
String _dateTimeToJson(DateTime date) => date.toIso8601String();
```

### 2.4 模型汇总导出

```dart
// data/models/models.dart

export 'api_response.dart';
export 'user.dart';
// 新增模型在此添加 export
```

---

## 三、Retrofit：类型安全 HTTP 客户端

### 3.1 API 定义

```dart
// data/api/auth_api.dart

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'auth_api.g.dart';  // ← 必须声明 part 指令

@RestApi()
abstract class AuthApi {
  // 工厂方法：Retrofit 生成 _AuthApi 实现类
  factory AuthApi(Dio dio, {String baseUrl}) = _AuthApi;

  @POST('/auth/login')
  Future<HttpResponse<dynamic>> login({
    @Body() required Map<String, dynamic> body,
  });

  @POST('/auth/register')
  Future<HttpResponse<dynamic>> register({
    @Body() required Map<String, dynamic> body,
  });

  @POST('/auth/refresh')
  Future<HttpResponse<dynamic>> refresh({
    @Body() required Map<String, dynamic> body,
  });
}
```

### 3.2 常用 Annotation

```dart
@RestApi(baseUrl: 'https://api.example.com')
abstract class ArticleApi {
  factory ArticleApi(Dio dio, {String baseUrl}) = _ArticleApi;

  // GET 请求 + 查询参数
  @GET('/articles')
  Future<HttpResponse<dynamic>> getArticles({
    @Query('page') int page = 1,
    @Query('size') int size = 10,
    @Query('categoryId') String? categoryId,
  });

  // 路径参数
  @GET('/articles/{id}')
  Future<HttpResponse<dynamic>> getArticle(
    @Path('id') String id,
  );

  // POST + Body
  @POST('/articles')
  Future<HttpResponse<dynamic>> createArticle(
    @Body() Map<String, dynamic> body,
  );

  // PUT + 路径参数 + Body
  @PUT('/articles/{id}')
  Future<HttpResponse<dynamic>> updateArticle(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  // DELETE
  @DELETE('/articles/{id}')
  Future<HttpResponse<dynamic>> deleteArticle(
    @Path('id') String id,
  );

  // 文件上传
  @POST('/upload')
  @MultiPart()
  Future<HttpResponse<dynamic>> uploadFile(
    @Part() File file,
    @Part(name: 'description') String? description,
  );
}
```

### 3.3 使用方式

```dart
// 在 Controller 中使用

class ArticleListController extends GetxController {
  late final ArticleApi _api;

  @override
  void onInit() {
    super.onInit();
    final dio = Get.find<ApiClient>().dio;
    _api = ArticleApi(dio);
  }

  Future<void> fetchArticles() async {
    final response = await _api.getArticles(page: 1, size: 10);
    // response.data 是 Map<String, dynamic>
    // response.response 是底层 Dio Response
  }
}
```

---

## 四、slang：类型安全国际化

### 4.1 配置文件

```yaml
# slang.yaml

base_locale: zh # 基础语言
fallback_strategy: base_locale # 缺失翻译时回退到基础语言
input_directory: lib/i18n # 翻译文件输入目录
input_file_pattern: .json # 输入文件格式
output_directory: lib/i18n # 输出目录
output_file_name: translations.g.dart # 输出文件名
output_class_name: Translations # 生成的类名
translate_var: t # 代码中使用的变量名
enum_name: AppLocale # 语言枚举名
locale_handling: true # 启用运行时语言切换
flutter_integration: true # 集成 Flutter Widget
```

### 4.2 翻译文件

```json
// lib/i18n/translations_zh.json
{
  "app": {
    "title": "全栈基座",
    "loading": "加载中..."
  },
  "auth": {
    "login": "登录",
    "register": "注册",
    "logout": "退出登录",
    "username": "用户名",
    "password": "密码"
  },
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "error": "出错了",
    "retry": "重试"
  }
}
```

```json
// lib/i18n/translations_en.json
{
  "app": {
    "title": "Fullstack Base",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "username": "Username",
    "password": "Password"
  },
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "error": "Error",
    "retry": "Retry"
  }
}
```

### 4.3 生成的代码

```dart
// lib/i18n/translations.g.dart（自动生成，不要手动修改）

class Translations {
  final app = _AppStrings();
  final auth = _AuthStrings();
  final common = _CommonStrings();
}

class _AppStrings {
  String get title => '全栈基座';  // zh
  String get loading => '加载中...';
}

class _AuthStrings {
  String get login => '登录';
  String get register => '注册';
  // ...
}
```

### 4.4 在代码中使用

```dart
// 方式 1：通过 context（推荐）
Text(context.t.auth.login)

// 方式 2：全局访问（无需 context）
Text(t.auth.login)

// 方式 3：带参数的翻译
// JSON: "welcome": "你好, {name}!"
Text(t.welcome(name: '张三'))
```

### 4.5 集成到 MyApp

```dart
// main.dart

@override
Widget build(BuildContext context) {
  return TranslationProvider(  // ← slang 提供的 Provider
    child: ScreenUtilInit(
      builder: (context, child) {
        return GetMaterialApp(
          // 不需要手动设置 locale，TranslationProvider 自动处理
          // ...
        );
      },
    ),
  );
}
```

---

## 五、build_runner 命令与工作流

### 5.1 常用命令

```bash
# 一次性生成（推荐日常使用）
dart run build_runner build --delete-conflicting-outputs

# 监听模式（开发时持续生成）
dart run build_runner watch --delete-conflicting-outputs

# 清理缓存后重新生成
dart run build_runner clean
dart run build_runner build --delete-conflicting-outputs

# slang 独立运行（不走 build_runner）
dart run slang
```

### 5.2 参数说明

| 参数                           | 说明                         |
| ------------------------------ | ---------------------------- |
| `build`                        | 一次性生成所有文件           |
| `watch`                        | 监听文件变化，自动重新生成   |
| `clean`                        | 清理 `.dart_tool/build` 缓存 |
| `--delete-conflicting-outputs` | 自动覆盖已存在的输出文件     |

### 5.3 开发工作流

```
修改 Model / API 定义 / 翻译文件
    ↓
运行 dart run build_runner build --delete-conflicting-outputs
    ↓
*.g.dart 文件自动更新
    ↓
继续开发

推荐：开发阶段使用 watch 模式
dart run build_runner watch --delete-conflicting-outputs
```

---

## 六、`.g.dart` 文件管理

### 6.1 必须提交到 Git

```txt
# .gitignore 中不要忽略 *.g.dart 文件！

# ❌ 错误：忽略生成文件
*.g.dart

# ✅ 正确：提交生成文件
# （不添加 *.g.dart 到 .gitignore）
```

**为什么？**

- CI/CD 环境可能不运行 build_runner
- 生成文件确保团队成员无需额外步骤即可编译
- 避免"在我机器上能跑"的问题

### 6.2 禁止手动修改

```dart
// ❌ 绝对不要手动修改 *.g.dart 文件！

// 这些文件会在下次运行 build_runner 时被覆盖
// 手动修改会导致：
// 1. 代码审查时混淆（哪些是手改的，哪些是生成的）
// 2. 重新生成后丢失修改
// 3. 团队成员运行生成后产生冲突

// ✅ 正确做法：修改源文件（.dart / .json），然后重新生成
```

### 6.3 part 指令的作用

```dart
// 源文件
part 'user.g.dart';  // ← 声明 user.g.dart 是此文件的一部分

// 生成的文件（user.g.dart）
// 可以访问源文件的所有私有成员
UserModel _$UserModelFromJson(Map<String, dynamic> json) { ... }
```

**part 的意义：**

- 让生成的代码与源文件在同一个库中
- 生成的代码可以访问 `private` 成员
- 避免 `import` 循环依赖

---

## 七、常见问题与解决方案

### 7.1 生成器冲突

```
问题：多个 build_runner 生成器同时运行时可能冲突

解决：确保 pubspec.yaml 中版本兼容
dev_dependencies:
  build_runner: ^2.4.14
  json_serializable: ^6.14.1
  retrofit_generator: ^10.2.8

如果仍有冲突：
dart run build_runner clean
flutter clean
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```

### 7.2 part 文件找不到

```
问题：Builder could not find ...

原因：part 指令声明的文件名与实际生成的文件名不匹配

解决：
1. 确保 part 文件名与类名一致
2. 确保文件在同一目录
3. 运行 dart run build_runner clean 清理缓存
```

### 7.3 泛型序列化错误

```
问题：Missing type argument for generic type

原因：泛型类需要 genericArgumentFactories: true

解决：
@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> { ... }
```

### 7.4 slang 生成失败

```
问题：slang 报错 "Missing base locale"

原因：base_locale 指定的语言文件不存在

解决：
1. 确保 slang.yaml 中 base_locale 与文件名匹配
2. 确保 translations_zh.json 存在（如果 base_locale: zh）
3. 运行 dart run slang 单独测试
```

---

## 八、build.yaml 高级配置

### 8.1 自定义生成器行为

```yaml
# build.yaml（项目根目录）

targets:
  $default:
    builders:
      json_serializable:
        options:
          explicit_to_json: true # 全局启用 explicitToJson
          field_rename: snake # 全局 snake_case 转换
          include_if_null: false # 全局忽略 null 字段

      retrofit_generator:
        generate_for:
          - lib/data/api/**.dart # 只处理 API 目录
```

### 8.2 分模块配置

```yaml
# 如果项目很大，可以按模块配置

targets:
  $default:
    builders:
      json_serializable:
        generate_for:
          - lib/data/models/**.dart
          - lib/modules/*/models/**.dart
```

---

## 九、总结

### 9.1 核心知识图谱

```
build_runner 代码生成工程
│
├── json_serializable
│   ├── @JsonSerializable() → fromJson/toJson
│   ├── @JsonKey() → 字段级配置
│   ├── genericArgumentFactories → 泛型支持
│   └── part '*.g.dart' → 库内访问
│
├── Retrofit
│   ├── @RestApi() → HTTP 客户端接口
│   ├── @GET/@POST/@PUT/@DELETE → HTTP 方法
│   ├── @Query/@Path/@Body/@Part → 参数注解
│   ├── HttpResponse<T> → 类型安全响应
│   └── factory → 生成实现类
│
├── slang
│   ├── slang.yaml → 配置
│   ├── translations_*.json → 翻译源文件
│   ├── TranslationProvider → Flutter 集成
│   └── t.xxx.yyy → 类型安全访问
│
└── 工程化实践
    ├── *.g.dart 必须提交 Git
    ├── 禁止手动修改生成文件
    ├── watch 模式持续生成
    └── build.yaml 全局配置
```

### 9.2 开发规范

| 规范                     | 说明                          |
| ------------------------ | ----------------------------- |
| 修改模型后必须重新生成   | `dart run build_runner build` |
| 翻译文件只改 JSON 源文件 | 然后 `dart run slang`         |
| `.g.dart` 文件提交到 Git | 确保团队和 CI 可直接编译      |
| 禁止手动编辑生成文件     | 重新生成覆盖所有修改          |
| 使用 part 指令           | 确保生成代码可访问私有成员    |

---

## 相关链接

- [Dio 拦截器链与 Token 无感刷新](/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh)
- [GetX 模块化架构与路由守卫](/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards)
- [slang 国际化方案](/dev-knowledge/flutter/architecture/thinking/flutter-slang-i18n-solution)
