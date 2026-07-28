---
title: Flutter 基础命令
order: 144
---

# Flutter 基础命令

这份文档涵盖了 **Flutter** 开发中最常用的 CLI 命令，以及针对 Android 和 iOS 平台的**打包发布**流程。

## 一、 Flutter 常用命令

Flutter 命令行工具（CLI）是开发、调试和维护项目的核心。

## 1. 环境检查与基础管理

- **检查环境**: `flutter doctor`（诊断开发环境配置是否完整）。
- **查看版本**: `flutter --version`。
- **升级 Flutter**: `flutter upgrade`。
- **列出设备**: `flutter devices`（查看已连接的真机或模拟器）。

## 2. 项目创建与依赖管理

- **创建项目**: `flutter create <project_name>`。
- **获取依赖**: `flutter pub get`（根据 `pubspec.yaml` 下载插件）。
- **更新依赖**: `flutter pub upgrade`。
- **清理缓存**: `flutter clean`（删除 `build/` 目录，解决编译玄学问题）。

## 3. 运行与调试

- **运行项目**: `flutter run`。
- **指定设备运行**: `flutter run -d <device_id>`。
- **热重载 (Hot Reload)**: 在终端输入 `r`（仅限 `flutter run` 运行中）。
- **热重启 (Hot Restart)**: 在终端输入 `R`。

---

## 二、 Flutter 项目打包说明

打包前请确保已在 `pubspec.yaml` 中更新了 **version**（格式为 `版本号+构建号`，如 `1.0.0+1`）。

## 1. Android 打包 (生成 APK 或 App Bundle)

Android 推荐使用 App Bundle (`.aab`) 发布到 Google Play，使用 `.apk` 进行分发。

- **生成 App Bundle (推荐)**:

  ```bash
  flutter build appbundle
  ```

- **生成 APK (全平台通用)**:

  ```bash
  flutter build apk
  ```

- **生成特定架构 APK**:

  ```bash
  flutter build apk --split-per-abi  # 分别生成 arm64-v8a, armeabi-v7a 等小体积包
  ```

- **注意**: 首次打包需配置 `android/key.properties` 和签名文件（jks），否则无法发布。

## 2. iOS 打包 (生成 IPA)

iOS 打包必须在 **macOS** 环境下通过 **Xcode** 完成。

- **构建编译文件**:

  ```bash
  flutter build ios --release
  ```

- **生成 IPA**:
  1. 打开 `ios/Runner.xcworkspace`。
  2. 在 Xcode 中选择 `Product > Archive`。
  3. 在 Organizer 窗口点击 `Distribute App`，按照提示上传至 App Store Connect 或导出 Ad Hoc 测试包。

## 3. Web 打包

- **构建 Web 文件**:

  ```bash
  flutter build web
  ```

- 生成的产物在 `build/web` 目录下，可直接部署到 Nginx 或 GitHub Pages。

---

## 三、 性能优化与减小包体积

- **混淆与压缩**: 打包时默认会进行混淆。

- **移除调试符号**: 使用 `--split-debug-info` 减小包体积。

  ```bash
  flutter build apk --obfuscate --split-debug-info=/<directory>
  ```

- **检查包大小**: 使用 `flutter build apk --analyze-size` 查看哪些资源最占空间。

---

## 实用技巧：混合开发常用

- **生成代码**: 很多项目使用 `json_serializable`，需运行：

  ```bash
  flutter pub run build_runner build --delete-conflicting-outputs
  ```

## 四、 GETX + json_serializable 搭配

在 Flutter 开发中，结合 **GetX**（状态管理/路由）和 **json_serializable**（序列化）是高效率的黄金组合。

以下是这两个工具最常用的命令和提问 AI 的实战指引：

## 1. json_serializable 核心生成命令

由于 `json_serializable` 是基于代码生成的，你必须运行 `build_runner`：

- **单次执行（最常用）**：

  ```bash
  dart run build_runner build --delete-conflicting-outputs
  ```

  注：`--delete-conflicting-outputs` 建议常带，防止因旧文件冲突导致报错。

- **持续监听（开发 Model 时推荐）**：

  ```bash
  dart run build_runner watch
  ```

- **清理缓存（生成出错时执行）**：

  ```bash
  dart run build_runner clean
  ```

---

## 2. GetX 相关常用命令

GetX 本身不依赖代码生成，其命令主要通过 **GetX CLI**（如果安装了的话）来快速创建模版：

- **安装 GetX CLI**（如果你还没装）：

  ```bash
  flutter pub global activate get_cli
  ```

- **创建新的模块（页面+Controller+Binding）**：

  ```bash
  get create page:user_profile
  ```

- **安装 GetX 依赖**（标准 pub 命令）：

  ```bash
  flutter pub add get
  ```

---

## 3. 让 AI 结合 GetX + 序列化的提问模板

当你需要 AI 帮你写一套完整的业务逻辑（从 Model 到 Controller）时，这个模板最有效：

> **Prompt 语句：**
> “请基于 **GetX** 状态管理和 **json_serializable** 帮我实现一个 **[功能名，如：用户订单列表]** 模块。
>
> **要求：**
>
> 1. **Model 层**：根据这段 JSON [粘贴 JSON]，使用 `json_serializable` 编写类，包含 `part` 引用。
> 2. **Provider 层**：使用 `GetConnect` 或 `Dio` 封装一个请求方法。
> 3. **Controller 层**：
>    - 使用 `RxList` 或 `RxStatus` 管理订单列表状态。
>    - 实现一个 `fetchData` 异步方法，包含加载态（Loading）和异常处理。
> 4. **UI 层**：
>    - 使用 `GetView<YourController>` 编写简单的页面。
>    - 使用 `Obx()` 或 `GetBuilder` 包裹列表，展示从 Model 解析出来的数据。
> 5. **代码风格**：逻辑清晰，遵循 GetX 标准工程目录结构。”

---

## 💡 避坑小贴士：

1. **忘记写 `part`**：AI 生成 Model 时，一定要检查类文件顶部是否有 `part 'filename.g.dart';`，否则执行生成命令会跳过该文件。
2. **响应式丢失**：在 GetX 中，如果 Model 里的字段需要响应式，建议在 Controller 中定义 `var user = UserModel().obs;`。
3. **泛型解析**：如果你在做通用 API 返回封装（如 `BaseResponse<T>`），请务必在 Prompt 里注明“**需要处理泛型 T 的 json 转换逻辑**”。
