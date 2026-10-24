---
title: Flutter 技术选型指南
tags: ['Flutter', '技术选型']
---

# Flutter 技术选型指南（2026 年 10 月）

> 基于 2026 年 Flutter 生态现状，按项目规模给出推荐技术栈。所有推荐均以 pub.dev 下载量、社区活跃度、官方维护状态为依据。

---

## 一、快速选型表

### 按项目规模推荐

| 类别     | 原型/小型（<1 万行）   | 中型（1-5 万行）           | 大型（>5 万行）                        |
| -------- | ---------------------- | -------------------------- | -------------------------------------- |
| 状态管理 | GetX / Provider        | Riverpod                   | Riverpod / Bloc                        |
| 路由     | GetX 内置 / go_router  | go_router                  | go_router / auto_route                 |
| 网络请求 | http / Dio             | Dio                        | Dio + Retrofit                         |
| 本地存储 | shared_preferences     | Hive / Isar                | Drift / Isar                           |
| 安全存储 | flutter_secure_storage | flutter_secure_storage     | flutter_secure_storage + 加密策略      |
| 依赖注入 | GetX 内置              | get_it + Injectable        | Riverpod（内置）                       |
| UI 组件  | Material 3             | Material 3                 | Material 3 + 自建组件库                |
| 图片加载 | cached_network_image   | cached_network_image       | cached_network_image + 预加载/降采样   |
| 屏幕适配 | MediaQuery             | flutter_screenutil         | flutter_screenutil / 响应式断点        |
| 动画     | Lottie                 | Lottie / Rive              | Rive（运行时状态机）                   |
| 环境配置 | --dart-define          | envied / flutter_dotenv    | envied（类型安全 + 代码生成）          |
| 代码生成 | —                      | json_serializable          | freezed + json_serializable + retrofit |
| 日志     | print / logger         | logger / talker            | talker / logging + 分级落盘            |
| 错误监控 | —                      | Sentry / Crashlytics       | Sentry + 自建上报（国内 Bugly）        |
| 权限管理 | permission_handler     | permission_handler         | permission_handler                     |
| 推送通知 | —                      | firebase_messaging         | firebase_messaging / 极光·个推         |
| 埋点分析 | —                      | firebase_analytics         | firebase_analytics / 友盟·神策         |
| 国际化   | intl                   | slang                      | slang / easy_localization              |
| 测试     | flutter_test           | flutter_test + mocktail    | 全套 + integration_test                |
| CI/CD    | —                      | Codemagic / GitHub Actions | Fastlane + Codemagic                   |

### 2026 年主流共识

```
状态管理：Riverpod（新项目首选）> Bloc（工程纪律）> GetX（快速交付）
路由导航：go_router（官方维护，声明式）> auto_route（类型安全）
网络请求：Dio（功能最全）> Retrofit（类型安全封装）
本地存储：Isar / Hive（NoSQL）> Drift（关系型）> shared_preferences（轻量）
依赖注入：Riverpod 内置 > get_it + Injectable > GetX 内置
代码生成：freezed + json_serializable + build_runner
```

---

## 二、状态管理选型

### 四强对比

| 方案             | 核心理念                 | 编译时安全 | 学习曲线 | 适用场景           |
| ---------------- | ------------------------ | ---------- | -------- | ------------------ |
| **Riverpod 3.0** | Provider 声明式 + 依赖图 | ✅         | 中       | 新项目首选，中大型 |
| **Bloc/Cubit**   | 事件驱动 + 单向数据流    | ✅         | 中高     | 企业级，强架构约束 |
| **GetX**         | 响应式 + 一体化          | ❌         | 低       | 快速原型，小项目   |
| **Provider**     | InheritedWidget 封装     | ❌         | 低       | 简单项目，遗留维护 |

### 选型决策树

```
你的项目会活多久？
├─ < 3 个月（原型/黑客松）→ GetX 或 Provider
├─ 3-12 个月（中小型商业）→ Riverpod
└─ > 12 个月（大型/多人维护）
    ├─ 团队偏函数式 → Riverpod
    └─ 团队偏工程纪律 → Bloc
```

### 2026 年趋势

- **Riverpod 3.0** 已成为新项目首选，编译时安全 + 内置 DI + 离线持久化
- **Bloc** 在大型企业项目中仍占主导，Event/State 分离便于测试
- **GetX** 社区活跃但架构债明显，全局单例难以测试和迁移
- **Provider** 官方已将 ChangeNotifier 迁入独立 `listen` 包，逐步退出主流

> 详细对比见：[状态管理选型](./state-management.md)

---

## 三、路由导航选型

| 方案              | 维护方       | 声明式 | 深度链接 | 类型安全       | 适用场景         |
| ----------------- | ------------ | ------ | -------- | -------------- | ---------------- |
| **go_router**     | Flutter 官方 | ✅     | ✅       | 部分           | 通用首选         |
| **auto_route**    | 社区         | ✅     | ✅       | ✅（代码生成） | 大型项目，多模块 |
| **GetX 路由**     | 社区         | ❌     | ❌       | ❌             | 仅限 GetX 项目   |
| **Navigator 2.0** | Flutter 官方 | ✅     | 手动     | ❌             | 底层自定义       |

### 推荐

- **新项目**：go_router（官方维护，128 万+月下载，声明式 API，嵌套路由清晰）
- **多模块大型项目**：auto_route（代码生成强类型路由，与 Clean Architecture 集成好）
- **GetX 项目**：继续使用 GetX 路由，但不建议新项目采用

> 详细对比见：[路由导航选型](./routing.md)

---

## 四、网络请求选型

| 方案                | 特点               | 拦截器   | 代码生成 | 适用场景         |
| ------------------- | ------------------ | -------- | -------- | ---------------- |
| **Dio**             | 功能最全，生态丰富 | ✅       | ❌       | 通用首选         |
| **Retrofit**        | Dio 封装，类型安全 | 继承 Dio | ✅       | 大型项目，接口多 |
| **http**            | 官方轻量，无依赖   | ❌       | ❌       | 简单请求         |
| **graphql_flutter** | GraphQL 客户端     | —        | ❌       | GraphQL 后端     |

### 推荐组合

```
小型项目：Dio
中大型项目：Dio + Retrofit + json_serializable
GraphQL 项目：graphql_flutter + Dio（作为底层 transport）
```

> 详细对比见：[网络请求选型](./networking.md)

---

## 五、本地存储选型

| 方案                   | 类型   | 性能 | 关系查询 | 纯 Dart      | 适用场景               |
| ---------------------- | ------ | ---- | -------- | ------------ | ---------------------- |
| **shared_preferences** | 键值对 | 中   | ❌       | ✅           | Token/设置等简单数据   |
| **Hive**               | NoSQL  | 高   | ❌       | ✅           | 大量键值数据，离线缓存 |
| **Isar 4.0**           | NoSQL  | 极高 | 部分     | ❌（Native） | 高性能本地数据库       |
| **Drift**              | SQLite | 中   | ✅       | ✅           | 关系型数据，复杂查询   |
| **sqflite**            | SQLite | 中   | ✅       | ❌（Native） | 传统 SQLite 需求       |

### 推荐组合

```
轻量存储（Token/主题/设置）：shared_preferences
业务缓存（列表/详情/搜索历史）：Hive 或 Isar
结构化数据（订单/消息/本地数据库）：Drift
```

### 2026 年趋势

- **Isar 4.0** 性能超越 Hive，但引入 Native 依赖，包体积增大
- **Hive** 纯 Dart 实现，零 Native 依赖，仍是轻量首选
- **Drift** 类型安全 SQLite，适合需要关系查询的场景

> 详细对比见：[本地存储选型](./storage.md)

---

## 六、依赖注入选型

| 方案                    | 类型                  | 编译时安全 | 与状态管理集成 | 适用场景      |
| ----------------------- | --------------------- | ---------- | -------------- | ------------- |
| **Riverpod**            | 声明式 Provider       | ✅         | 内置           | Riverpod 项目 |
| **get_it + Injectable** | 服务定位器 + 代码生成 | ✅         | 需手动         | Bloc/通用项目 |
| **get_it**              | 服务定位器            | ❌         | 需手动         | 简单项目      |
| **GetX 内置**           | 全局单例              | ❌         | 内置           | GetX 项目     |

### 推荐

- **Riverpod 项目**：直接用 Riverpod 的 Provider 体系，无需额外 DI
- **Bloc 项目**：get_it + Injectable（代码生成，编译时安全）
- **简单项目**：get_it 手动注册

---

## 七、UI 与适配选型

| 方案                     | 用途      | 说明                               |
| ------------------------ | --------- | ---------------------------------- |
| **Material 3**           | UI 组件库 | Flutter 默认，2026 年已全面支持 M3 |
| **flutter_screenutil**   | 屏幕适配  | 按设计稿比例缩放，国内项目常用     |
| **cached_network_image** | 图片缓存  | 网络图片加载 + 磁盘缓存            |
| **Rive**                 | 交互动画  | 替代 Lottie，支持状态机，性能更好  |
| **Lottie**               | 矢量动画  | After Effects 导出，生态成熟       |
| **shimmer**              | 骨架屏    | 加载占位效果                       |

### 2026 年趋势

- **Material 3** 已成为 Flutter 默认主题，动态取色（Dynamic Color）全面支持
- **Rive** 在交互动画领域逐步替代 Lottie，支持运行时状态机
- **flutter_screenutil** 仍是国内项目屏幕适配主流方案

---

## 八、代码生成与工程化

| 工具                  | 用途         | 说明                              |
| --------------------- | ------------ | --------------------------------- |
| **build_runner**      | 代码生成引擎 | 所有代码生成的底层依赖            |
| **freezed**           | 不可变数据类 | 联合类型 + copyWith + JSON 序列化 |
| **json_serializable** | JSON 模型    | 自动生成 fromJson/toJson          |
| **retrofit**          | HTTP 客户端  | 注解式 API 定义，类型安全         |
| **slang**             | 国际化       | 类型安全翻译，编译时检查          |
| **injectable**        | DI 代码生成  | 配合 get_it 自动注册依赖          |
| **Melos**             | 多包管理     | Monorepo 工具，自动化工作流       |

### 推荐组合

```
小型项目：json_serializable
中大型项目：freezed + json_serializable + retrofit + injectable
Monorepo：Melos
```

---

## 九、测试方案

| 类型     | 工具                  | 说明                         |
| -------- | --------------------- | ---------------------------- |
| 单元测试 | flutter_test          | 内置，Widget 测试 + 逻辑测试 |
| Mock     | mocktail              | 替代 mockito，无需代码生成   |
| 集成测试 | integration_test      | 端到端测试，真机/模拟器运行  |
| 黄金测试 | flutter_test (golden) | UI 快照对比                  |
| 性能测试 | DevTools + benchmark  | 帧率/内存/CPU 分析           |

---

## 十、CI/CD 与发布

| 方案                          | 特点                         | 适用场景             |
| ----------------------------- | ---------------------------- | -------------------- |
| **Codemagic**                 | Flutter 专属 CI/CD，零配置   | 首选，移动端构建     |
| **GitHub Actions**            | 通用 CI/CD，生态丰富         | 已有 GitHub 工作流   |
| **Fastlane**                  | 自动化发布（签名/上传/截图） | 大型项目，多环境发布 |
| **Firebase App Distribution** | 内测分发                     | 测试版本分发         |

---

## 十一、工程化配套选型

> 以下类别虽非架构主干，但几乎每个生产级 App 都要做选型决策。

### 安全存储（Token / 密钥）

| 方案                       | 说明                                        |
| -------------------------- | ------------------------------------------- |
| **flutter_secure_storage** | iOS Keychain / Android Keystore，Token 首选 |
| **Hive 加密 Box**          | HiveAesCipher（AES-256），适合批量加密数据  |

> ⚠️ **不要用 shared_preferences 存 Token**——它是明文存储，可被 root 设备或系统备份读取。

### 图片加载

| 方案                     | 说明                             |
| ------------------------ | -------------------------------- |
| **cached_network_image** | 网络图 + 磁盘缓存，绝对主流      |
| **ExtendedImage**        | 功能更全（裁剪/缩放/编辑/手势）  |
| **skeletonizer**         | 骨架屏占位（shimmer 的现代替代） |

### 日志

| 方案                  | 说明                                |
| --------------------- | ----------------------------------- |
| **logger**            | 彩色分级日志，开发调试首选          |
| **talker**            | 带 UI 控制台 + 历史回放，可对接 Dio |
| **logging**           | 官方底层日志 API                    |
| **pretty_dio_logger** | Dio 请求/响应专用日志               |

### 错误监控 / 崩溃上报

| 方案                     | 说明                                       |
| ------------------------ | ------------------------------------------ |
| **Sentry**               | 全平台、开源，错误聚合 + 性能追踪 + 面包屑 |
| **Firebase Crashlytics** | Google 生态，免费，崩溃自动聚类            |
| **Bugly（腾讯）**        | 国内友好，符号表自动上传                   |

> 三者都自动接管 `FlutterError.onError` 与 `runZonedGuarded`，并对 Native 层崩溃做符号还原。

### 环境配置

| 方案               | 说明                                  |
| ------------------ | ------------------------------------- |
| **envied**         | 类型安全，编译时读取 `.env`，代码生成 |
| **flutter_dotenv** | 运行时读取 `.env`，简单直接           |
| **--dart-define**  | Flutter 内置，编译时注入常量          |

### 权限管理

| 方案                   | 说明                       |
| ---------------------- | -------------------------- |
| **permission_handler** | 统一权限请求 API，绝对主流 |

### 推送通知

| 方案                            | 说明             |
| ------------------------------- | ---------------- |
| **firebase_messaging**          | FCM，海外首选    |
| **极光 jpush / 个推 / 友盟**    | 国内厂商通道聚合 |
| **flutter_local_notifications** | 本地/定时通知    |

### 埋点分析

| 方案                   | 说明     |
| ---------------------- | -------- |
| **firebase_analytics** | 海外主流 |
| **友盟 U-App / 神策**  | 国内主流 |

---

## 十二、完整技术栈推荐

### 2026 年推荐技术栈（中大型项目）

```yaml
# 核心框架
flutter: ">=3.44"  # 2026 年 Q4 基线候选
dart: ">=3.8"

# 状态管理 + DI
flutter_riverpod: ^3.0.0
riverpod_annotation: ^3.0.0

# 路由
go_router: ^16.0.0

# 网络
dio: ^5.8.0
retrofit: ^4.4.0

# 数据模型
freezed_annotation: ^3.0.0
json_annotation: ^4.9.0

# 本地存储
shared_preferences: ^2.5.0
hive_ce: ^2.8.0        # Hive Community Edition
drift: ^2.25.0          # 如需关系型

# 安全存储（Token/密钥，勿用 shared_preferences）
flutter_secure_storage: ^9.2.0

# UI
flutter_screenutil: ^5.9.0
cached_network_image: ^3.4.0

# 日志与错误监控
logger: ^2.5.0
sentry_flutter: ^8.14.0

# 环境配置（编译时读取 .env）
envied: ^1.1.0

# 权限
permission_handler: ^11.3.0

# 国际化
slang: ^4.5.0
slang_flutter: ^4.5.0

# 代码生成（dev_dependencies）
build_runner: ^2.4.0
freezed: ^3.0.0
json_serializable: ^6.9.0
retrofit_generator: ^9.1.0
riverpod_generator: ^3.0.0
envied_generator: ^1.1.0

# 测试（dev_dependencies）
mocktail: ^1.0.0
integration_test: sdk: flutter
```

### 2026 年推荐技术栈（小型项目/原型）

```yaml
# 核心框架
flutter: '>=3.44'

# 状态管理 + 路由 + DI（一体化）
get: ^4.7.0

# 网络
dio: ^5.8.0

# 本地存储
shared_preferences: ^2.5.0
hive_ce: ^2.8.0

# 安全存储（Token）
flutter_secure_storage: ^9.2.0

# UI
flutter_screenutil: ^5.9.0
cached_network_image: ^3.4.0
```

---

## 十三、选型避坑指南

### 不要做的事

| ❌ 避免                  | ✅ 替代                     | 原因                                  |
| ------------------------ | --------------------------- | ------------------------------------- |
| 新项目用 Provider        | Riverpod                    | Provider 已进入维护模式，官方推荐迁移 |
| 新项目用 GetX 做大型架构 | Riverpod / Bloc             | GetX 全局单例难以测试和迁移           |
| 用 sqflite 做复杂查询    | Drift                       | Drift 类型安全，编译时检查 SQL        |
| 用 Lottie 做交互动画     | Rive                        | Rive 支持状态机，性能更好             |
| 手写 JSON 解析           | json_serializable / freezed | 代码生成减少样板代码和错误            |
| 硬编码字符串做国际化     | slang / easy_localization   | 类型安全，编译时检查缺失翻译          |

### 迁移成本评估

| 迁移路径             | 成本 | 说明                           |
| -------------------- | ---- | ------------------------------ |
| Provider → Riverpod  | 低   | 同源重构，状态类可保留         |
| GetX → Riverpod/Bloc | 高   | 全局单例调用点遍布，需全量重写 |
| Bloc → Riverpod      | 中   | UI 层全量替换，业务逻辑可复用  |
| Riverpod → Bloc      | 中   | 同上，反向迁移                 |
| Hive → Isar          | 低   | API 相似，数据迁移脚本即可     |
| sqflite → Drift      | 中   | SQL 可复用，需加代码生成层     |

---

## 参考资源

- [Flutter 官方包推荐](https://docs.flutter.dev/packages-and-plugins/favorites)
- [pub.dev 趋势](https://pub.dev/packages?q=sort%3Apopularity)
- [Flutter State Management 官方指南](https://docs.flutter.dev/data-and-backend/state-mgmt)
- [go_router 官方文档](https://pub.dev/packages/go_router)
- [Riverpod 官方文档](https://riverpod.dev/)
- [Andrea Bizzotto - Flutter Clean Architecture](https://codewithandrea.com/)
