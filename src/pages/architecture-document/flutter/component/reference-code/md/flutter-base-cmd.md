---
title: Flutter 基础命令
order: 144
---

## Flutter 基础命令

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

您目前是正在配置 **Android 的签名证书**，还是需要了解如何将 Flutter 项目**部署到 Web 平台**？
