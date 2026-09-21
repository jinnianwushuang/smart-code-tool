# Vue 3 标准架构代码模板

> 面向开发者的 Vue 3 装配架构代码模板包，下载即可在新项目中快速搭建架构骨架。

## 概述

本指令集提供 **Vue 3 装配架构的核心代码模板**，包含多例/单例两种标准模板、装配引擎、组合函数和全局样式。附带完整的集成指南和定制文档，帮助开发者在新项目中快速搭建架构骨架。

**核心理念**：下载 → 拷贝代码 → 配环境 → 跑验证 → 开始开发。

## 快速开始

<a href="/archive/vue-kit.zip" class="download-btn" download>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  下载 Vue 全套套件
</a>

### 1. 下载并解压

下载 `vue-arch-starter.zip`，解压后将 `code-template/` 目录内容复制到项目 `src/` 下。

### 2. 安装依赖

参考 `dependencies.md` 安装必需依赖：

```bash
pnpm add vue vue-router mitt change-case
pnpm add -D vite @vitejs/plugin-vue sass-embedded
pnpm add quasar @quasar/vite-plugin ant-design-vue
```

### 3. 配置 Vite

参考 `vite.config.template.js`，确保配置了 `src/` 路径别名：

```javascript
resolve: {
  alias: {
    src: `${projectRoot}/src`,
  },
},
```

### 4. 验证

启动开发服务器，访问 `standardization/multiton-template/index.vue`，确认装配器正常工作。

## 包含内容

| 目录                                  | 说明                                       |
| ------------------------------------- | ------------------------------------------ |
| `standardization/multiton-template/`  | 多例模板 — 每次使用创建独立实例            |
| `standardization/singleton-template/` | 单例模板 — 全局共享单一实例                |
| `common/architecture-design/`         | 装配引擎核心（7 个装配器 + 工具函数）      |
| `composable/architecture-design/`     | 架构组合函数（上下文启动器、生命周期管理） |
| `css/`                                | 全局样式变量（亮/暗主题、Quasar 变量）     |

## 与 vue-assembler 的关系

| 本包（vue-arch-starter） | vue-assembler（AI 指令集）   |
| ------------------------ | ---------------------------- |
| 给**开发者**用           | 给 **AI 助手**用             |
| 提供代码骨架 + 集成指南  | 提供 AI 执行规范 + 架构参照  |
| 解决「怎么搭建」的问题   | 解决「怎么按规范工作」的问题 |

两者互补，建议配合使用。

## 文档导航

| 文档                           | 说明                                     |
| ------------------------------ | ---------------------------------------- |
| [架构概念](./architecture.md)  | 装配架构核心理念、模块系统、生命周期管理 |
| [集成指南](./integration.md)   | 手把手搭建架构骨架 + Common Pitfalls FAQ |
| [定制指南](./customization.md) | UI 框架替换、模块扩展、模板维护策略      |
| [文件索引](./file-index.md)    | 代码模板全部文件的功能索引               |
