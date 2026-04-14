---
title: DART 基础令
order: 44
---

## DART 基础令

这份文档重点介绍 Dart SDK 自带的命令行工具。由于 Flutter 已经内置了 Dart，如果你已经安装了 Flutter，可以直接在终端使用 dart 命令。

## 一、 Dart 基础命令

这些命令用于日常开发、运行脚本和检查代码。

## 1. 运行与执行

- 运行 Dart 文件: dart run &lt;file_name&gt;.dart（例如 dart run bin/main.dart）。
- 编译为本地机器码: dart compile exe &lt;file_name&gt;.dart（生成一个独立的二进制可执行文件，无需安装 Dart 即可运行）。
- 编译为 JavaScript: dart compile js &lt;file_name&gt;.dart（用于 Web 开发）。

## 2. 环境与版本

- 查看版本: dart --version。
- 查看帮助: dart help &lt;command&gt;。

---

## 二、 项目与依赖管理 (Pub 工具)

pub 是 Dart 的包管理器。在现代 Dart 版本中，直接使用 dart pub 前缀。

## 1. 依赖操作

- 获取依赖: dart pub get（根据 pubspec.yaml 下载并安装包）。
- 升级依赖: dart pub upgrade（升级到符合版本限制的最新版）。
- 检查过时依赖: dart pub outdated（列出哪些包有更新的版本可选）。
- 添加依赖: dart pub add &lt;package_name&gt;（自动修改 pubspec.yaml 并下载）。
- 移除依赖: dart pub remove &lt;package_name&gt;。

## 2. 发布与缓存

- 发布前检查: dart pub publish --dry-run（检查项目是否符合发布到 pub.dev 的标准）。
- 发布包: dart pub publish（正式发布你的库）。
- 清理缓存: dart pub cache clean。

---

## 三、 代码质量与开发工具

Dart 提供了强大的内置工具来保证代码风格统一和减少错误。

## 1. 格式化与分析

- 自动格式化: dart format .（将当前目录下的所有代码按标准规范对齐）。
- 静态分析: dart analyze（检查代码中的语法错误、警告和不符合最佳实践的地方）。
- 修复建议: dart fix --apply（自动应用分析器建议的修复，如移除未使用的导入）。

## 2. 文档与测试

- 运行测试: dart test（运行 test/ 目录下的所有单元测试）。
- 生成文档: dart doc .（根据代码中的 /// 注释生成 HTML 文档）。

---

## 四、 核心配置文件：pubspec.yaml 简述

每一个 Dart 项目的核心都是这个文件：

name: my_app # 项目名称description: 一个 Dart 项目version: 1.0.0 # 项目版本
environment:
sdk: '&gt;=3.0.0 &lt;4.0.0' # 支持的 Dart 版本范围
dependencies: # 生产环境依赖
http: ^1.1.0
dev_dependencies: # 开发环境依赖（测试、代码生成等）
test: ^1.24.0

---

## 实用技巧：全局激活工具

如果你下载了一个用 Dart 写的工具（比如 stagehand 或 grinder），可以全局安装它：

- 安装: dart pub global activate &lt;package_name&gt;。
- 运行: dart pub global run &lt;package_name&gt;（或配置 PATH 后直接运行命令）。

您是准备开发一个 Dart 服务端/命令行工具，还是在为 Flutter 项目编写纯 Dart 的单元测试？
