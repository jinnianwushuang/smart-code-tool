# Flutter 装配架构指令集

> 面向 AI 助手的 Flutter 3 + GetX 标准化 Widget + GetX 装配架构开发指令集。

## 概述

本指令集基于 **Flutter 3 + GetX Widget + GetX 装配模式**，为 AI 助手提供一套完整的开发规范与执行流程。覆盖页面级开发、重构、迭代、修复和代码检查五大任务类型。

**核心理念**：复制 → 改配置 → 傻瓜式快速使用。

## 快速开始

<a href="/archive/flutter-kit.zip" class="download-btn" download>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  下载 Flutter 全套套件
</a>

### 1. 拷贝指令集

将 `flutter-assembler/` 目录下的 **`flutter-assembler/`** 子目录整个拷贝到你的项目中：

```
你的项目/
  └── flutter-assembler/       ← 拷贝这个目录的全部内容
        ├── config.md           ← 修改此文件适配你的项目
        ├── architecture/       ← 架构参照文件
        ├── instructions/       ← AI 执行指令
        ├── entry/              ← AI 入口文件
        └── glossary.md         ← 术语表
```

### 2. 修改配置

编辑 `config.md`，填写必填项（标记 `<!-- 需配置 -->` 的部分）。参照 [配置指南](./config-guide.md) 或 `config.example.md` 示例。

关键配置项：

| 配置项                | 说明                             | 必填 |
| --------------------- | -------------------------------- | ---- |
| `features_root_path`  | 功能模块目录根路径               | ✅   |
| `shared_widgets_path` | 全局共享组件路径                 | ✅   |
| `routes_config_path`  | 路由配置文件路径                 | ✅   |
| `ui_style`            | UI 风格（material3 / material2） | ✅   |
| `api_request_lib`     | API 请求库                       | ✅   |
| `getx_version`        | GetX 版本                        | ✅   |

### 3. 加载上下文

在 AI 助手中，指定加载入口文件：

```
请读取 flutter-assembler/entry/context-entry.md 并按顺序建立上下文
```

AI 将按以下顺序加载：

1. `config.md` → 项目配置
2. `glossary.md` → 术语表
3. `architecture/` → 架构参照（按需）
4. `instructions/` → 执行框架

### 4. 提交任务

按以下格式向 AI 提交任务：

```
任务类型：新需求开发
问题描述：新增一个「用户管理」页面
目标目录：lib/features/user_management/
报告地址：默认
附加信息：使用 Material 3 组件
```

AI 将自动识别任务类型并按架构规范执行。

## 支持的任务类型

| 任务类型   | 触发关键词                 | 说明                              |
| ---------- | -------------------------- | --------------------------------- |
| 新需求开发 | 新增、创建、开发、实现     | 从零创建符合架构规范的新页面/模块 |
| 重构       | 重构、优化、改造、迁移     | 将现有代码改造为 GetX 架构规范    |
| 需求迭代   | 迭代、修改、调整、增加功能 | 在已有架构基础上增加/修改功能     |
| 修复       | 修复、bug、报错、异常      | 修复页面中的问题                  |
| 代码检查   | 检查、审查、review、合规   | 检查代码是否符合架构规范          |

## 核心约束

- **单次执行**：一次只做一类任务
- **存疑即问**：信息不全就提问，禁止瞎猜
- **安全熔断**：超出范围或卡住时停止并反馈
- **GetX 约束**：禁止 build 内 Get.put、Obx 下沉至叶子、const 优先
- **Theme 复用**：Material 3 组件 > 插件 > 全局 Theme > 自定义 Widget
- **验证边界**：默认只做静态分析，不主动启动项目
- **代码生成约束**：单 Widget ≤ 200 行、单 Controller ≤ 300 行、注释 ≥ 10%、单函数 ≤ 50 行（可配置）

## 文档导航

| 文档                            | 说明                           |
| ------------------------------- | ------------------------------ |
| [设计架构](./design.md)         | 指令集的整体设计思路与目录结构 |
| [执行流程](./execution-flow.md) | AI 执行任务的完整流程图        |
| [配置指南](./config-guide.md)   | config.md 各配置项详细说明     |
| [文件索引](./file-index.md)     | 指令集全部文件的功能索引       |
