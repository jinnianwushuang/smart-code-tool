---
title: 'Flutter slang 国际化方案实战'
tags: ['Flutter', 'slang', '国际化', 'i18n', '类型安全', '翻译', '实战']
---

# Flutter slang 国际化方案实战

> 本文基于 flutter_app 项目的 slang 国际化实践，深度讲解 slang 配置、翻译文件组织、类型安全访问、TranslationProvider 集成、设备语言检测、用户偏好切换、与 intl/get_i18n 对比等实战经验。

---

## 一、为什么选择 slang

### 1.1 Flutter 国际化方案对比

| 方案              | 类型安全        | 代码生成    | 学习曲线 | 2026 活跃度 |
| ----------------- | --------------- | ----------- | -------- | ----------- |
| **slang**         | ✅ 完全类型安全 | ✅ 自动生成 | 低       | 高          |
| intl              | ❌ 字符串 key   | ❌ 手动维护 | 中       | 官方维护    |
| get_i18n          | ❌ 字符串 key   | ❌ 无       | 低       | 低          |
| easy_localization | ⚠️ 部分         | ✅ 可选     | 中       | 中          |

### 1.2 slang 核心优势

```dart
// ❌ intl：字符串 key，无类型检查
AppLocalizations.of(context)!.helloWorld
// 拼写错误不会编译报错，运行时崩溃

// ✅ slang：完全类型安全
t.auth.login
// 拼写错误 → 编译报错
// 支持 IDE 自动补全
// 支持参数化翻译
```

---

## 二、配置与初始化

### 2.1 slang.yaml 配置

```yaml
# slang.yaml

base_locale: zh # 基础语言（必须）
fallback_strategy: base_locale # 缺失翻译回退策略
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

### 2.2 依赖配置

```yaml
# pubspec.yaml

dependencies:
  slang: ^4.4.1
  slang_flutter: ^4.4.1

dev_dependencies:
  build_runner: ^2.4.14
```

### 2.3 翻译文件结构

```
lib/i18n/
├── translations.json          ← 基础语言（中文）
├── translations_en.json       ← 英文翻译
├── translations_zh.json       ← 中文翻译（可选，与 base 相同）
└── translations.g.dart        ← 自动生成（不要手动修改）
```

---

## 三、翻译文件编写

### 3.1 基础语言（中文）

```json
// lib/i18n/translations_zh.json
{
  "app": {
    "title": "全栈基座",
    "loading": "加载中...",
    "retry": "重试"
  },
  "auth": {
    "login": "登录",
    "register": "注册",
    "logout": "退出登录",
    "username": "用户名",
    "password": "密码",
    "confirmPassword": "确认密码",
    "loginSuccess": "登录成功",
    "loginFailed": "登录失败，请检查用户名和密码"
  },
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "error": "出错了",
    "success": "操作成功",
    "networkError": "网络连接失败，请检查网络",
    "serverError": "服务器错误，请稍后重试"
  },
  "article": {
    "title": "文章",
    "list": "文章列表",
    "detail": "文章详情",
    "noMore": "没有更多了",
    "empty": "暂无文章"
  }
}
```

### 3.2 其他语言（英文）

```json
// lib/i18n/translations_en.json
{
  "app": {
    "title": "Fullstack Base",
    "loading": "Loading...",
    "retry": "Retry"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "username": "Username",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "loginSuccess": "Login successful",
    "loginFailed": "Login failed, please check your credentials"
  },
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "error": "Error",
    "success": "Success",
    "networkError": "Network error, please check your connection",
    "serverError": "Server error, please try again later"
  },
  "article": {
    "title": "Article",
    "list": "Article List",
    "detail": "Article Detail",
    "noMore": "No more articles",
    "empty": "No articles yet"
  }
}
```

### 3.3 参数化翻译

```json
// 支持动态参数

// translations_zh.json
{
  "greeting": "你好, {name}!",
  "itemCount": "共 {count} 项",
  "relativeTime": "{time}前"
}

// translations_en.json
{
  "greeting": "Hello, {name}!",
  "itemCount": "{count} items",
  "relativeTime": "{time} ago"
}
```

---

## 四、生成与使用

### 4.1 运行生成命令

```bash
# 方式 1：独立运行 slang（推荐）
dart run slang

# 方式 2：通过 build_runner
dart run build_runner build

# 生成文件：lib/i18n/translations.g.dart
```

### 4.2 生成的代码结构

```dart
// lib/i18n/translations.g.dart（自动生成）

class Translations {
  final _AppStrings app = _AppStrings();
  final _AuthStrings auth = _AuthStrings();
  final _CommonStrings common = _CommonStrings();
  final _ArticleStrings article = _ArticleStrings();
}

class _AppStrings {
  String get title => '全栈基座';  // zh
  String get loading => '加载中...';
  String get retry => '重试';
}

class _AuthStrings {
  String get login => '登录';
  String get register => '注册';
  // ...
}

// 参数化翻译
String greeting({required String name}) => '你好, $name!';
String itemCount({required int count}) => '共 $count 项';
```

### 4.3 在代码中使用

```dart
// 方式 1：通过 context（推荐，支持运行时切换）

class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text(context.t.auth.login);  // "登录"
  }
}

// 方式 2：全局访问（无需 context）

class MyController extends GetxController {
  void showSuccess() {
    Get.snackbar(t.common.success, t.article.saved);
  }
}

// 方式 3：带参数

Text(t.greeting(name: '张三'))  // "你好, 张三!"
Text(t.itemCount(count: 10))    // "共 10 项"
```

---

## 五、集成到应用

### 5.1 TranslationProvider 包裹

```dart
// main.dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化 slang
  LocaleSettings.useDeviceLocale();  // 使用设备语言

  // 如果有保存的语言偏好
  final localeService = Get.find<LocaleService>();
  if (localeService.hasSavedLocale) {
    LocaleSettings.setLocale(localeService.savedLocale);
  }

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return TranslationProvider(  // ← slang 提供的 Provider
      child: ScreenUtilInit(
        builder: (context, child) {
          return GetMaterialApp(
            title: t.app.title,
            // 不需要手动设置 locale
            // TranslationProvider 自动处理
            // ...
          );
        },
      ),
    );
  }
}
```

### 5.2 运行时切换语言

```dart
// 切换到英文

void switchToEnglish() {
  LocaleSettings.setLocale(AppLocale.en);
  // 所有使用 context.t 的 Widget 自动更新
}

// 切换到中文

void switchToChinese() {
  LocaleSettings.setLocale(AppLocale.zh);
}

// 获取当前语言

AppLocale currentLocale = LocaleSettings.currentLocale;
```

### 5.3 LocaleService：持久化语言偏好

```dart
// services/locale_service.dart

class LocaleService extends GetxService {
  static const _key = 'app_locale';
  late final SharedPreferences _prefs;

  Future<LocaleService> init() async {
    _prefs = await SharedPreferences.getInstance();
    return this;
  }

  AppLocale get savedLocale {
    final code = _prefs.getString(_key);
    if (code == null) return AppLocale.zh;
    return AppLocale.values.firstWhere(
      (e) => e.languageCode == code,
      orElse: () => AppLocale.zh,
    );
  }

  bool get hasSavedLocale => _prefs.containsKey(_key);

  Future<void> saveLocale(AppLocale locale) async {
    await _prefs.setString(_key, locale.languageCode);
  }
}
```

---

## 六、语言选择页面

### 6.1 UI 实现

```dart
// modules/profile/view/language_settings_page.dart

class LanguageSettingsPage extends GetView<LocaleService> {
  const LanguageSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t.settings.language)),
      body: ListView(
        children: AppLocale.values.map((locale) {
          final isSelected = LocaleSettings.currentLocale == locale;

          return ListTile(
            title: Text(_localeName(locale)),
            trailing: isSelected ? const Icon(Icons.check) : null,
            onTap: () async {
              // 切换语言
              LocaleSettings.setLocale(locale);
              // 保存偏好
              await controller.saveLocale(locale);
              // 返回
              Get.back();
            },
          );
        }).toList(),
      ),
    );
  }

  String _localeName(AppLocale locale) {
    switch (locale) {
      case AppLocale.zh:
        return '中文';
      case AppLocale.en:
        return 'English';
      default:
        return locale.languageCode;
    }
  }
}
```

---

## 七、最佳实践

### 7.1 翻译文件组织

```
✅ 推荐：按功能模块分组

{
  "auth": { "login": "...", "register": "..." },
  "article": { "title": "...", "list": "..." },
  "common": { "confirm": "...", "cancel": "..." }
}

❌ 不推荐：扁平化所有 key

{
  "auth_login": "...",
  "auth_register": "...",
  "article_title": "..."
}
```

### 7.2 避免硬编码文本

```dart
// ❌ 错误：硬编码中文

Text('登录')
Get.snackbar('错误', '网络异常')

// ✅ 正确：使用翻译

Text(t.auth.login)
Get.snackbar(t.common.error, t.common.networkError)
```

### 7.3 翻译缺失处理

```yaml
# slang.yaml

fallback_strategy: base_locale
# 如果英文翻译缺失，使用中文兜底
```

### 7.4 代码审查检查

```bash
# 提交前检查翻译文件是否最新

dart run slang  # 重新生成
git diff lib/i18n/translations.g.dart  # 检查变更
```

---

## 八、总结

### 8.1 核心知识图谱

```
slang 国际化方案
│
├── 配置
│   ├── slang.yaml → 生成配置
│   ├── pubspec.yaml → 依赖声明
│   └── translations_*.json → 翻译源文件
│
├── 生成
│   ├── dart run slang → 生成 translations.g.dart
│   └── 禁止手动修改 .g.dart 文件
│
├── 使用
│   ├── TranslationProvider → 包裹 MyApp
│   ├── context.t.xxx → Widget 中使用
│   ├── t.xxx → 非 Widget 代码中使用
│   └── LocaleSettings.setLocale() → 运行时切换
│
└── 持久化
    ├── LocaleService → SharedPreferences 保存偏好
    ├── useDeviceLocale() → 首次使用设备语言
    └── hasSavedLocale → 是否有用户偏好
```

### 8.2 设计原则

| 原则     | 实践                        |
| -------- | --------------------------- |
| 类型安全 | 编译期检查翻译 key 是否存在 |
| 模块化   | 按功能分组翻译文件          |
| 持久化   | 保存用户语言偏好            |
| 兜底策略 | 缺失翻译回退到基础语言      |
| 代码生成 | 翻译文件 → 自动生成代码     |

---

## 相关链接

- [build_runner 代码生成工程化](/dev-knowledge/flutter/architecture/thinking/flutter-build-runner-code-generation)
- [GetX 模块化架构与路由守卫](/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards)
- [UI 适配·主题·加载状态设计](/dev-knowledge/flutter/architecture/performance/flutter-ui-adaptation-theming-loading-states)
