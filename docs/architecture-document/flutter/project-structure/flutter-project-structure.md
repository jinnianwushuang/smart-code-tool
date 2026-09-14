---
title: Flutter 项目结构与分层规范
order: 40
---

# Flutter 项目结构与分层规范

项目结构是架构的骨架。一个清晰的目录结构不仅降低了新成员的上手成本，还隐含了模块间的依赖关系和职责边界。

本文系统梳理 Flutter 项目的目录结构设计、分层架构、依赖注入、模块通信与环境配置等工程化实践。

---

## 一、Feature-first vs Layer-first 目录结构

### Layer-first（按层组织）

```
lib/
├── models/          # 所有数据模型
├── services/        # 所有服务
├── repositories/    # 所有仓库
├── blocs/           # 所有状态管理
├── pages/           # 所有页面
├── widgets/         # 所有组件
└── utils/           # 工具类
```

**问题**：当项目增长到 50+ 文件时，很难找到某个功能的所有相关文件。

### Feature-first（按功能组织）— 推荐

```
lib/
├── core/                    # 全局共享
│   ├── network/             # Dio 配置、拦截器
│   ├── router/              # 路由配置
│   ├── theme/               # 主题
│   ├── di/                  # 依赖注入
│   └── utils/               # 工具类
├── features/                # 按功能模块组织
│   ├── auth/                # 认证模块
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── blocs/
│   │       ├── pages/
│   │       └── widgets/
│   ├── home/                # 首页模块
│   ├── product/             # 商品模块
│   └── profile/             # 个人中心模块
└── shared/                  # 跨功能共享组件
    ├── widgets/
    └── extensions/
```

### 对比总结

| 维度         | Layer-first        | Feature-first    |
| ------------ | ------------------ | ---------------- |
| **可维护性** | 低（功能分散）     | 高（功能内聚）   |
| **可扩展性** | 低（改一处动全身） | 高（模块独立）   |
| **团队协作** | 差（容易冲突）     | 好（各模块独立） |
| **适用规模** | 小型 Demo          | 中大型项目       |

---

## 二、分层架构：Presentation / Domain / Data

### 三层职责

```
┌─────────────────────────────────────────────┐
│  Presentation Layer                          │
│  ├── Pages（页面 UI）                         │
│  ├── Widgets（可复用组件）                     │
│  ├── BLoC / Riverpod（状态管理）              │
│  └── 依赖：Domain Layer                      │
├─────────────────────────────────────────────┤
│  Domain Layer                                │
│  ├── Entities（业务实体，纯 Dart）            │
│  ├── Repositories（抽象接口）                 │
│  ├── UseCases（业务用例）                     │
│  └── 依赖：无（纯 Dart 层）                   │
├─────────────────────────────────────────────┤
│  Data Layer                                  │
│  ├── Repositories（接口实现）                 │
│  ├── RemoteDataSource（API 调用）             │
│  ├── LocalDataSource（本地缓存）              │
│  ├── Models（DTO，与 API 结构一致）           │
│  └── 依赖：Domain Layer（实现其接口）          │
└─────────────────────────────────────────────┘
```

### 依赖规则

```
Presentation → Domain ← Data

关键原则：
1. Domain 层不依赖任何其他层（纯 Dart）
2. Data 层实现 Domain 层定义的接口
3. Presentation 层通过 Domain 层的接口与 Data 层交互
```

### 完整 Feature 模块示例

```dart
// ── Domain Layer ──

// domain/entities/user.dart
class User {
  final String id;
  final String name;
  final String email;
  const User({required this.id, required this.name, required this.email});
}

// domain/repositories/user_repository.dart
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<List<User>> getUsers();
}

// domain/usecases/get_user.dart
class GetUserUseCase {
  final UserRepository repository;
  GetUserUseCase(this.repository);
  Future<User> call(String userId) => repository.getUser(userId);
}

// ── Data Layer ──

// data/models/user_model.dart
class UserModel {
  final String id;
  final String name;
  final String email;

  UserModel({required this.id, required this.name, required this.email});

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'] as String,
    name: json['name'] as String,
    email: json['email'] as String,
  );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email};

  User toEntity() => User(id: id, name: name, email: email);
}

// data/datasources/user_remote_data_source.dart
abstract class UserRemoteDataSource {
  Future<UserModel> getUser(String id);
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final Dio dio;
  UserRemoteDataSourceImpl(this.dio);

  @override
  Future<UserModel> getUser(String id) async {
    final response = await dio.get('/users/$id');
    return UserModel.fromJson(response.data);
  }
}

// data/repositories/user_repository_impl.dart
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  UserRepositoryImpl(this.remoteDataSource);

  @override
  Future<User> getUser(String id) async {
    final model = await remoteDataSource.getUser(id);
    return model.toEntity();
  }
}

// ── Presentation Layer ──

// presentation/blocs/user_bloc.dart
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserUseCase getUserUseCase;

  UserBloc(this.getUserUseCase) : super(UserInitial()) {
    on<UserLoadRequested>(_onLoad);
  }

  Future<void> _onLoad(UserLoadRequested event, Emitter<UserState> emit) async {
    emit(UserLoading());
    try {
      final user = await getUserUseCase(event.userId);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }
}

// presentation/pages/user_page.dart
class UserPage extends StatelessWidget {
  final String userId;
  const UserPage({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        // UI 渲染逻辑...
        return Container();
      },
    );
  }
}
```

---

## 三、依赖注入方案

### get_it + injectable

```dart
// core/di/injection.dart
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

final getIt = GetIt.instance;

@InjectableInit()
void configureDependencies() => getIt.init();

// ── 注册标记 ──

// 环境配置
@module
abstract class RegisterModule {
  @singleton
  Dio get dio => Dio(BaseOptions(baseUrl: 'https://api.example.com'));

  @singleton
  SharedPreferences get prefs => throw UnimplementedError();
}

// Repository 注册
@injectable
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  UserRepositoryImpl(this.remoteDataSource);
}

// DataSource 注册
@injectable
class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final Dio dio;
  UserRemoteDataSourceImpl(this.dio);
}

// BLoC 注册（工厂模式，每次创建新实例）
@injectable
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserUseCase getUserUseCase;
  UserBloc(this.getUserUseCase) : super(UserInitial());
}
```

### 初始化顺序

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. 初始化基础服务
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);

  // 2. 初始化依赖注入
  configureDependencies();

  // 3. 启动应用
  runApp(const MyApp());
}
```

---

## 四、模块间通信

### 原则：接口隔离

模块间通过 Domain 层的接口通信，不直接依赖实现。

```dart
// ── 正确：通过 Domain 接口 ──
// product 模块使用 auth 的接口
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final AuthRepositoryInterface authRepository; // 依赖接口
  ProductBloc(this.authRepository) : super(ProductInitial());
}

// ── 错误：直接依赖实现 ──
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final AuthBloc authBloc; // 直接依赖另一个模块的 BLoC ❌
}
```

### 事件总线模式

对于松耦合的跨模块通信，可以使用事件总线：

```dart
// core/event_bus/event_bus.dart
class EventBus {
  final _controller = StreamController.broadcast();

  Stream<T> on<T>() => _controller.stream.where((event) => event is T).cast<T>();

  void emit(Object event) => _controller.add(event);

  void dispose() => _controller.close();
}

// ── 发布事件 ──
eventBus.emit(UserLoggedIn(user));

// ── 订阅事件 ──
eventBus.on<UserLoggedIn>().listen((event) {
  // 处理登录事件
});
```

---

## 五、资源管理

### 目录结构

```
assets/
├── images/
│   ├── common/          # 通用图片
│   ├── auth/            # 认证模块图片
│   └── home/            # 首页模块图片
├── icons/               # SVG 图标
├── fonts/               # 自定义字体
├── animations/          # Lottie 动画
└── l10n/                # 国际化文件
    ├── app_en.arb
    ├── app_zh.arb
    └── app_ja.arb
```

### 资源声明

```yaml
# pubspec.yaml
flutter:
  assets:
    - assets/images/common/
    - assets/icons/
    - assets/animations/
  fonts:
    - family: CustomFont
      fonts:
        - asset: assets/fonts/CustomFont-Regular.ttf
        - asset: assets/fonts/CustomFont-Bold.ttf
          weight: 700
```

### 类型安全资源访问

```dart
// 使用 build_runner 生成类型安全的资源引用
// 或使用 flutter_gen 包
import 'package:your_app/generated/assets.gen.dart';

// 使用
Image.asset(Assets.images.common.logo);
```

---

## 六、环境配置

### 多环境管理

```dart
// core/config/environment.dart
enum Environment { dev, staging, production }

class AppConfig {
  final Environment environment;
  final String baseUrl;
  final String apiKey;

  const AppConfig._({
    required this.environment,
    required this.baseUrl,
    required this.apiKey,
  });

  static const dev = AppConfig._(
    environment: Environment.dev,
    baseUrl: 'https://dev-api.example.com',
    apiKey: 'dev-key-xxx',
  );

  static const staging = AppConfig._(
    environment: Environment.staging,
    baseUrl: 'https://staging-api.example.com',
    apiKey: 'staging-key-xxx',
  );

  static const production = AppConfig._(
    environment: Environment.production,
    baseUrl: 'https://api.example.com',
    apiKey: 'prod-key-xxx',
  );
}
```

### 通过 dart-define 切换环境

```bash
# 开发环境
flutter run --dart-define=ENV=dev

# 预发布环境
flutter run --dart-define=ENV=staging

# 生产环境
flutter build apk --dart-define=ENV=production
```

```dart
// core/config/config.dart
class Config {
  static AppConfig get current {
    const env = String.fromEnvironment('ENV', defaultValue: 'dev');
    switch (env) {
      case 'production':
        return AppConfig.production;
      case 'staging':
        return AppConfig.staging;
      default:
        return AppConfig.dev;
    }
  }
}
```

---

## 七、大型项目模块化实践

### 内部包拆分

当项目足够大时，可以将 features 拆分为独立的 Dart 包：

```
my_app/
├── app/                        # 主应用（壳工程）
│   ├── lib/
│   │   └── main.dart
│   └── pubspec.yaml            # 依赖所有 feature 包
├── packages/
│   ├── core/                   # 核心包
│   │   ├── lib/
│   │   └── pubspec.yaml
│   ├── feature_auth/           # 认证模块包
│   │   ├── lib/
│   │   └── pubspec.yaml
│   ├── feature_home/           # 首页模块包
│   │   ├── lib/
│   │   └── pubspec.yaml
│   └── feature_product/        # 商品模块包
│       ├── lib/
│       └── pubspec.yaml
└── pubspec.yaml                # workspace 配置
```

### 包间依赖

```yaml
# packages/feature_auth/pubspec.yaml
dependencies:
  core:
    path: ../core # 依赖核心包
```

```yaml
# app/pubspec.yaml
dependencies:
  core:
    path: ../packages/core
  feature_auth:
    path: ../packages/feature_auth
  feature_home:
    path: ../packages/feature_home
```

### 模块化收益

| 收益         | 说明                       |
| ------------ | -------------------------- |
| **编译加速** | 修改一个包只需重新编译该包 |
| **团队隔离** | 不同团队负责不同包         |
| **独立测试** | 每个包可以独立运行测试     |
| **版本管理** | 包可以独立发版             |

---

## 八、项目结构速查表

| 项目规模               | 推荐结构               | 状态管理            | 依赖注入            |
| ---------------------- | ---------------------- | ------------------- | ------------------- |
| **小型**（< 20 页面）  | Layer-first            | Provider / Riverpod | 手动注册            |
| **中型**（20-50 页面） | Feature-first          | BLoC / Riverpod     | get_it              |
| **大型**（> 50 页面）  | Feature-first + 内部包 | BLoC + Clean Arch   | get_it + injectable |

---

## 九、常见反模式

### 反模式 1：God Page

一个页面文件超过 500 行，混合了 UI、业务逻辑和网络请求。

```dart
// ❌ 反模式
class OrderPage extends StatefulWidget {
  @override
  State<OrderPage> createState() => _OrderPageState();
}

class _OrderPageState extends State<OrderPage> {
  // 500+ 行混合代码...
}

// ✅ 正确：拆分为 BLoC + 页面 + 组件
// - OrderBloc：业务逻辑
// - OrderPage：页面编排
// - OrderListWidget / OrderDetailWidget：UI 组件
```

### 反模式 2：全局状态滥用

```dart
// ❌ 反模式：所有状态都放全局
class GlobalState {
  static final currentUser = Rxn<User>();
  static final cartItems = <CartItem>[].obs;
  static final themeMode = ThemeMode.light.obs;
  static final isLoading = false.obs;
}

// ✅ 正确：按职责分离
// - AuthBloc：用户认证状态
// - CartBloc：购物车状态
// - ThemeCubit：主题状态
// - 页面局部状态留在 Widget 内部
```

### 反模式 3：循环依赖

```dart
// ❌ 反模式：feature_a 依赖 feature_b，feature_b 又依赖 feature_a
// feature_a/pubspec.yaml
dependencies:
  feature_b:
    path: ../feature_b

// feature_b/pubspec.yaml
dependencies:
  feature_a:
    path: ../feature_a  # 循环依赖！

// ✅ 正确：提取共享逻辑到 core 包
// core/ 包定义接口
// feature_a 和 feature_b 都依赖 core，互不依赖
```
