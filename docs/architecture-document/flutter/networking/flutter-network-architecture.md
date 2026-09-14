---
title: Flutter 网络层架构设计
order: 30
---

# Flutter 网络层架构设计

网络层是 Flutter 应用与后端服务通信的桥梁。一个设计良好的网络层架构应该具备：统一的请求/响应处理、可插拔的拦截器链、清晰的错误处理、以及离线缓存能力。

本文从**工程化集成和架构分层**角度出发，系统梳理 Flutter 网络层的架构设计模式。

> **注意**：移动端网络原理（HTTPS 链路、弱网优化、DNS 防劫持等）请参考 [网络层与弱网优化](../thinking/mobile-network-layer)。本文聚焦 Flutter 框架层面的工程实现。

---

## 一、网络层架构分层

一个完整的 Flutter 网络层架构分为四层：

```
┌─────────────────────────────────────────────┐
│  Presentation Layer（BLoC / Riverpod）       │
│  职责：调用 Repository，处理 UI 状态          │
├─────────────────────────────────────────────┤
│  Repository Layer                            │
│  职责：协调 Remote + Local DataSource        │
├─────────────────────────────────────────────┤
│  DataSource Layer                            │
│  ├── RemoteDataSource（Dio HTTP 客户端）      │
│  └── LocalDataSource（Hive / SQLite 缓存）   │
├─────────────────────────────────────────────┤
│  Infrastructure Layer                        │
│  ├── Dio 配置 + 拦截器链                     │
│  ├── Token 刷新机制                          │
│  └── SSL Pinning 配置                        │
└─────────────────────────────────────────────┘
```

---

## 二、Dio 客户端架构配置

### 基础配置

```dart
// infrastructure/network/dio_client.dart
class DioClient {
  late final Dio _dio;

  DioClient({required String baseUrl, required SharedPreferences prefs}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors(prefs);
  }

  void _setupInterceptors(SharedPreferences prefs) {
    // 拦截器链：按顺序执行
    _dio.interceptors.addAll([
      // 1. 日志拦截器（仅 Debug 模式）
      if (kDebugMode)
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          requestHeader: true,
        ),

      // 2. 认证拦截器：自动附加 Token
      AuthInterceptor(prefs: prefs),

      // 3. 错误拦截器：统一处理异常
      ErrorInterceptor(),
    ]);
  }

  Dio get dio => _dio;
}
```

### 拦截器链设计

```dart
// ── 认证拦截器 ──
class AuthInterceptor extends Interceptor {
  final SharedPreferences prefs;

  AuthInterceptor({required this.prefs});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = prefs.getString('access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

// ── 错误拦截器 ──
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final apiError = _parseError(err);

    switch (apiError.type) {
      case ApiErrorType.unauthorized:
        // Token 过期，触发登出
        getIt<AuthBloc>().add(AuthLogoutRequested());
        break;
      case ApiErrorType.network:
        // 网络错误，提示用户检查网络
        break;
      case ApiErrorType.server:
        // 服务端错误，上报日志
        break;
      default:
        break;
    }

    handler.next(err.copyWith(error: apiError));
  }

  ApiError _parseError(DioException err) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      return ApiError(type: ApiErrorType.timeout, message: '请求超时');
    }

    if (err.type == DioExceptionType.connectionError) {
      return ApiError(type: ApiErrorType.network, message: '网络连接失败');
    }

    if (err.response != null) {
      final statusCode = err.response!.statusCode!;
      if (statusCode == 401) {
        return ApiError(type: ApiErrorType.unauthorized, message: '登录已过期');
      }
      if (statusCode >= 500) {
        return ApiError(type: ApiErrorType.server, message: '服务器错误');
      }
    }

    return ApiError(type: ApiErrorType.unknown, message: '未知错误');
  }
}
```

---

## 三、Token 自动刷新机制

Token 过期时自动刷新，对业务层透明：

```dart
class TokenRefreshInterceptor extends Interceptor {
  final SharedPreferences prefs;
  final Dio _dio;
  bool _isRefreshing = false;
  Completer<void>? _completer;

  TokenRefreshInterceptor({required this.prefs, required Dio dio}) : _dio = dio;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = prefs.getString('access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      _completer = Completer<void>();

      try {
        // 使用 refresh token 获取新 access token
        final refreshToken = prefs.getString('refresh_token');
        final response = await _dio.post('/auth/refresh', data: {
          'refresh_token': refreshToken,
        });

        final newToken = response.data['access_token'];
        await prefs.setString('access_token', newToken);

        _completer!.complete();
        _isRefreshing = false;

        // 重试原始请求
        final requestOptions = err.requestOptions;
        requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final retryResponse = await _dio.fetch(requestOptions);
        return handler.resolve(retryResponse);
      } catch (e) {
        _completer?.completeError(e);
        _isRefreshing = false;
        // 刷新失败，强制登出
        getIt<AuthBloc>().add(AuthLogoutRequested());
      }
    }

    handler.next(err);
  }
}
```

---

## 四、Repository 模式与数据源抽象

### DataSource 分层

```dart
// ── Remote DataSource：负责 API 调用 ──
abstract class UserRemoteDataSource {
  Future<UserDto> getUser(String id);
  Future<List<UserDto>> getUsers();
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final Dio _dio;

  UserRemoteDataSourceImpl(this._dio);

  @override
  Future<UserDto> getUser(String id) async {
    final response = await _dio.get('/users/$id');
    return UserDto.fromJson(response.data);
  }

  @override
  Future<List<UserDto>> getUsers() async {
    final response = await _dio.get('/users');
    return (response.data as List).map((json) => UserDto.fromJson(json)).toList();
  }
}

// ── Local DataSource：负责缓存 ──
abstract class UserLocalDataSource {
  Future<void> cacheUser(UserDto user);
  Future<UserDto?> getCachedUser(String id);
  Future<void> clearCache();
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final HiveInterface _hive;

  UserLocalDataSourceImpl(this._hive);

  @override
  Future<void> cacheUser(UserDto user) async {
    final box = await _hive.openBox('users');
    await box.put(user.id, user.toJson());
  }

  @override
  Future<UserDto?> getCachedUser(String id) async {
    final box = await _hive.openBox('users');
    final json = box.get(id);
    return json != null ? UserDto.fromJson(json) : null;
  }

  @override
  Future<void> clearCache() async {
    final box = await _hive.openBox('users');
    await box.clear();
  }
}
```

### Repository 实现

```dart
// ── Repository：协调 Remote + Local ──
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserLocalDataSource localDataSource;

  UserRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<User> getUser(String id) async {
    try {
      // 策略 1：网络优先，失败回退缓存
      final remoteUser = await remoteDataSource.getUser(id);
      await localDataSource.cacheUser(remoteUser);
      return remoteUser.toDomain();
    } catch (e) {
      // 网络失败时检查缓存
      final cachedUser = await localDataSource.getCachedUser(id);
      if (cachedUser != null) return cachedUser.toDomain();
      rethrow;
    }
  }

  @override
  Future<List<User>> getUsers() async {
    try {
      final remoteUsers = await remoteDataSource.getUsers();
      // 批量缓存
      for (final user in remoteUsers) {
        await localDataSource.cacheUser(user);
      }
      return remoteUsers.map((dto) => dto.toDomain()).toList();
    } catch (e) {
      // 网络失败时返回缓存（如果有）
      final box = await Hive.openBox('users');
      final cachedUsers = box.values.map((json) => UserDto.fromJson(json).toDomain()).toList();
      if (cachedUsers.isNotEmpty) return cachedUsers;
      rethrow;
    }
  }
}
```

---

## 五、错误处理统一

### 统一错误类型

```dart
// domain/errors/failures.dart
abstract class Failure {
  final String message;
  const Failure(this.message);
}

class ServerFailure extends Failure {
  final int? statusCode;
  const ServerFailure(super.message, {this.statusCode});
}

class NetworkFailure extends Failure {
  const NetworkFailure() : super('网络连接失败，请检查网络设置');
}

class CacheFailure extends Failure {
  const CacheFailure() : super('本地数据读取失败');
}

class AuthFailure extends Failure {
  const AuthFailure() : super('登录已过期，请重新登录');
}

class ValidationFailure extends Failure {
  final Map<String, String> fieldErrors;
  const ValidationFailure(super.message, this.fieldErrors);
}
```

### 使用 Either 模式处理错误

```dart
import 'package:dartz/dartz.dart';

// Repository 返回 Either<Failure, SuccessType>
class UserRepositoryImpl implements UserRepository {
  @override
  Future<Either<Failure, User>> getUser(String id) async {
    try {
      final remoteUser = await remoteDataSource.getUser(id);
      await localDataSource.cacheUser(remoteUser);
      return Right(remoteUser.toDomain());
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionError) {
        // 尝试缓存
        final cached = await localDataSource.getCachedUser(id);
        if (cached != null) return Right(cached.toDomain());
        return const Left(NetworkFailure());
      }
      if (e.response?.statusCode == 401) {
        return const Left(AuthFailure());
      }
      return Left(ServerFailure(
        e.message ?? '服务器错误',
        statusCode: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}

// ── 在 BLoC 中使用 ──
class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository _repository;

  UserBloc(this._repository) : super(UserInitial()) {
    on<UserLoadRequested>((event, emit) async {
      emit(UserLoading());
      final result = await _repository.getUser(event.userId);
      result.fold(
        (failure) => emit(UserError(failure.message)),
        (user) => emit(UserLoaded(user)),
      );
    });
  }
}
```

---

## 六、序列化方案对比

| 方案                  | 代码生成 | 空安全 | 不可变性 | 性能 | 推荐场景       |
| --------------------- | -------- | ------ | -------- | ---- | -------------- |
| **json_serializable** | 是       | 是     | 可选     | 中   | 默认选择       |
| **freezed**           | 是       | 是     | 强制     | 中   | 需要不可变模型 |
| **dart_mappable**     | 是       | 是     | 强制     | 高   | 高性能场景     |
| **手动 fromJson**     | 否       | 手动   | 手动     | 高   | 极简单模型     |

### freezed 模型定义

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    String? avatar,
    @Default(false) bool isVerified,
    @Default([]) List<String> roles,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### DTO 与 Domain Model 分离

```dart
// ── DTO（Data Transfer Object）：与 API 响应结构一致 ──
@freezed
class UserDto with _$UserDto {
  const factory UserDto({
    required String id,
    required String name,
    required String email,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
    @JsonKey(name: 'is_verified') bool? isVerified,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) =>
      _$UserDtoFromJson(json);
}

// ── Domain Model：业务层使用，与 API 解耦 ──
class User {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  final bool isVerified;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    this.isVerified = false,
  });
}

// ── 扩展：DTO → Domain ──
extension UserDtoX on UserDto {
  User toDomain() => User(
    id: id,
    name: name,
    email: email,
    avatar: avatarUrl,
    isVerified: isVerified ?? false,
  );
}
```

---

## 七、Mock 与测试支持

### 测试用 Mock DataSource

```dart
// test/mocks/user_remote_data_source_mock.dart
class MockUserRemoteDataSource implements UserRemoteDataSource {
  List<UserDto> users = [];
  bool shouldThrow = false;

  @override
  Future<UserDto> getUser(String id) async {
    if (shouldThrow) throw DioException(requestOptions: RequestOptions());
    return users.firstWhere((u) => u.id == id);
  }

  @override
  Future<List<UserDto>> getUsers() async {
    if (shouldThrow) throw DioException(requestOptions: RequestOptions());
    return users;
  }
}
```

### Mocktail 集成

```dart
import 'package:mocktail/mocktail.dart';

class MockUserRepository extends Mock implements UserRepository {}

void main() {
  late MockUserRepository mockRepository;
  late UserBloc userBloc;

  setUp(() {
    mockRepository = MockUserRepository();
    userBloc = UserBloc(mockRepository);
  });

  test('should emit [UserLoading, UserLoaded] when user is fetched', () async {
    // Arrange
    final user = User(id: '1', name: 'Alice', email: 'alice@example.com');
    when(() => mockRepository.getUser('1'))
        .thenAnswer((_) async => Right(user));

    // Act
    userBloc.add(UserLoadRequested(userId: '1'));

    // Assert
    await expectLater(
      userBloc.stream,
      emitsInOrder([UserLoading(), UserLoaded(user)]),
    );
    verify(() => mockRepository.getUser('1')).called(1);
  });
}
```

---

## 八、与现有文档的关系

| 文档                                                                          | 定位                              | 本文区别                         |
| ----------------------------------------------------------------------------- | --------------------------------- | -------------------------------- |
| [网络层与弱网优化](../thinking/mobile-network-layer)                          | 移动网络原理（TCP/QUIC/DNS/弱网） | 本文聚焦 Flutter Dio 工程化实现  |
| [存储与数据同步](../thinking/storage-data-sync)                               | 存储原理（SQLite/同步策略）       | 本文聚焦 Repository 层的缓存集成 |
| [Dio 网络层与 HTTP 客户端体系](../../../interview/flutter/dio-and-networking) | Dio 内部原理面试                  | 本文聚焦架构分层和工程实践       |
