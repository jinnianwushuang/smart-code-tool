# Vue 通用代码检查指令集

> 面向所有 Vue 3 项目的通用代码质量检查指令集，不绑定特定装配架构。

## 概述

本指令集为 AI 助手提供 **10 大检查维度、57 个检查项**，覆盖代码规范、Vue 模板、性能、内存管理、并发处理、国际化、安全、错误处理、组件设计和代码卫生。

**核心理念**：复制 → 改配置 → 傻瓜式快速使用。

## 快速开始

<a href="/archive/vue-kit.zip" class="download-btn" download>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  下载 Vue 全套套件
</a>

### 1. 拷贝指令集

将 `vue-code-review/` 目录下的 **`vue-code-review/`** 子目录拷贝到你的项目中：

```
你的项目/
  └── vue-code-review/
        ├── config.md       ← 修改此文件适配你的项目
        ├── check-rules/    ← 10 大检查维度
        ├── instructions/   ← AI 执行指令
        ├── entry/          ← AI 入口文件
        └── glossary.md     ← 术语表
```

### 2. 修改配置

编辑 `config.md`，至少填写 `ui_framework`。参照 [配置指南](./config-guide.md) 了解详情。

### 3. 加载上下文

在 AI 助手中，指定加载入口文件：

```
请读取 vue-code-review/entry/context-entry.md 并按顺序建立上下文
```

### 4. 提交检查任务

```
任务类型：深度代码审查
检查目录：src/pages/user-management/    ← 可选，不填则全项目
报告地址：默认
附加信息：重点关注内存泄漏问题
```

## 10 大检查维度

| #   | 维度     | 检查项数 | 说明                                            |
| --- | -------- | -------- | ----------------------------------------------- |
| 1   | 代码规范 | 6        | 文件行数、函数长度、注释比例、ESLint、命名      |
| 2   | Vue 模板 | 9        | v-for key、v-html、props、deep 选择器、全局 CSS |
| 3   | 性能     | 6        | 动画、虚拟滚动、watcher、懒加载                 |
| 4   | 内存管理 | 7        | 定时器、事件监听、watcher、Worker、存储         |
| 5   | 并发处理 | 4        | 竞态条件、Promise、防抖节流                     |
| 6   | 国际化   | 4        | 硬编码文本、多语种键值对比（需开关）            |
| 7   | 安全     | 6        | XSS、注入、敏感信息、正则                       |
| 8   | 错误处理 | 5        | catch、ErrorBoundary、错误友好化                |
| 9   | 组件设计 | 5        | 职责拆分、Props 透传、循环依赖                  |
| 10  | 代码卫生 | 5        | console.log、死代码、魔法数字                   |

## 支持的任务类型

| 任务类型        | 说明                             |
| --------------- | -------------------------------- |
| ESLint 配置审计 | 检查 ESLint 配置完整性并给出建议 |
| 深度代码审查    | 按 10 大维度逐项审查             |
| 完整检查        | ESLint 审计 + 深度审查           |
| 国际化专项检查  | 仅检查国际化相关项（需开关开启） |

## 文档导航

| 文档                            | 说明                           |
| ------------------------------- | ------------------------------ |
| [设计架构](./design.md)         | 指令集的整体设计思路与目录结构 |
| [执行流程](./execution-flow.md) | AI 执行检查任务的完整流程图    |
| [配置指南](./config-guide.md)   | config.md 各配置项详细说明     |
| [文件索引](./file-index.md)     | 指令集全部文件的功能索引       |
