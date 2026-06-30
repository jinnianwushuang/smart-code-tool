# Smart Code Tool 文档中心

欢迎来到 Smart Code Tool 文档中心！这里汇集了项目的所有技术文档、架构设计、代码规范和最佳实践。

## 📚 文档分类

### 🏗️ 架构文档 (Architecture Document)

#### AI 架构

- [架构愿景](./architecture-document/ai/architectural-vision/architectural-vision-1.md) - 项目整体架构愿景
- [闭环设计](./architecture-document/ai/architectural-vision/closed-loop-1.md) - 系统闭环设计方案
- [影响分析](./architecture-document/ai/architectural-vision/influence-1.md) - 架构变更影响分析
- [设计原则](./architecture-document/ai/architectural-vision/principles-1.md) - 架构设计核心原则
- [实施报告](./architecture-document/ai/architectural-vision/report-1.md) - 架构实施进展报告
- [路线图](./architecture-document/ai/architectural-vision/roadmap-1.md) - 技术发展路线图
- [检查清单](./architecture-document/ai/architectural-vision/checklist-1.md) - 架构审查检查清单

##### Vue 句子组装

- [管理端句子](./architecture-document/ai/vue/admin-sentence.md)
- [Vue 基础句子](./architecture-document/ai/vue/base-sentence-vue.md)
- [JS 句子](./architecture-document/ai/vue/js-sentence.md)
- [Web 句子](./architecture-document/ai/vue/web-sentence.md)

##### 基础句子

- [基础句子模板](./architecture-document/ai/sentence_assembly/base-sentence.md)

#### 代码分析工具

- [代码分析思路](./architecture-document/code-analysis/idea-doc/idea.md)
- [代码分析思路 2](./architecture-document/code-analysis/idea-doc/idea2.md)
- [代码分析思路 4](./architecture-document/code-analysis/idea-doc/idea4.md)
- [技术选型](./architecture-document/code-analysis/idea-doc/technology-selection.md)
- [依赖分析](./architecture-document/code-analysis/idea-doc/yilai.md)
- [拓扑结构](./architecture-document/code-analysis/fragment/topo.md)

#### Flutter 架构

- [Dart 基础命令](./architecture-document/flutter/reference-code/dart-base-cmd.md)
- [Dart 基础代码](./architecture-document/flutter/reference-code/dart-base-code.md)
- [Flutter 基础命令](./architecture-document/flutter/reference-code/flutter-base-cmd.md)
- [Flutter 基础代码](./architecture-document/flutter/reference-code/flutter-base-code.md)

#### Python 架构

- [Python 基础命令](./architecture-document/python/reference-code/python-base-cmd.md)
- [Python 基础代码](./architecture-document/python/reference-code/python-base-code.md)

#### React 架构

##### Vue to React

- [Vue vs React](./architecture-document/react/idea-doc/idea1.md)
- [Vue to React 原因](./architecture-document/react/idea-doc/idea2.md)
- [Vue to React 路径图](./architecture-document/react/idea-doc/idea3.md)
- [Vue to React 代码](./architecture-document/react/idea-doc/idea4.md)
- [React 神库](./architecture-document/react/idea-doc/idea6.md)

##### 性能思考

- [大型单例设计](./architecture-document/react/other-idea/idea1.md)

##### 原理说明

- [useEffect 原理](./architecture-document/react/principle/use-effect.md)

##### 参考代码

- [基础命令](./architecture-document/react/reference-code/base-cmd.md)
- [基础代码](./architecture-document/react/reference-code/base-code.md)

##### 技术选型

- [App 项目](./architecture-document/react/technology-selection/app-project.md)
- [后端项目](./architecture-document/react/technology-selection/backend-project.md)
- [客户端项目](./architecture-document/react/technology-selection/client-project.md)
- [桌面端项目](./architecture-document/react/technology-selection/desktop-project.md)

#### Rust 架构

- [Rust 学习指南](./architecture-document/rust/begin/rust-study.md)

#### Vue 架构

##### 架构设计

- [Assembler 组装器](./architecture-document/vue/architecture/assemble_assembler.md)
- [核心原则](./architecture-document/vue/architecture/core-principle.md)
- [目录结构规范](./architecture-document/vue/architecture/directory-structure-max.md)
- [Pipeline 组装器](./architecture-document/vue/architecture/pipeline-assembler.md)
- [单例合并](./architecture-document/vue/architecture/singleton-merge.md)

##### 通用 Composable

- [DOM 清理](./architecture-document/vue/general-composable/dom-dispose.md)
- [事件监听清理](./architecture-document/vue/general-composable/event-listener-dispose.md)
- [Mitt 清理](./architecture-document/vue/general-composable/mitt-dispose.md)
- [超级清理器](./architecture-document/vue/general-composable/super-dispose.md)
- [定时器清理](./architecture-document/vue/general-composable/timer-dispose.md)
- [Watch 清理](./architecture-document/vue/general-composable/watch-dispose.md)

##### 通用工具

- [TanStack Query](./architecture-document/vue/general-tools/TanStack-Query.md)
- [Axios 封装](./architecture-document/vue/general-tools/axios-suit.md)
- [模块加载器](./architecture-document/vue/general-tools/module-loader.md)
- [API 重试机制](./architecture-document/vue/general-tools/re-try-api-request.md)
- [Payload 包装器](./architecture-document/vue/general-tools/wrap-with-payload.md)

##### 参考代码

- [Pipeline + Mitt + Proxy](./architecture-document/vue/reference-code/pipeline-assembler-mitt-proxy.md)
- [Pipeline + Mitt](./architecture-document/vue/reference-code/pipeline-assembler-mitt.md)
- [Pipeline + Proxy 同步](./architecture-document/vue/reference-code/pipeline-assembler-proxy-sync.md)
- [Vite Glob 导入](./architecture-document/vue/reference-code/vite-glob.md)

##### 标准代码

- [Assembler 新模式](./architecture-document/vue/standard-code/assembler-new.md)
- [方法规范](./architecture-document/vue/standard-code/method.md)
- [状态规范](./architecture-document/vue/standard-code/state.md)

##### 标准化模板（中文）

- [API 请求与模块](./architecture-document/vue/standardized-template-cn/api-request-and-module.md)
- [API 请求处理](./architecture-document/vue/standardized-template-cn/api-request-handling-cn.md)
- [架构概览](./architecture-document/vue/standardized-template-cn/architecture-overview-cn.md)
- [架构概览（英文）](./architecture-document/vue/standardized-template-cn/architecture-overview.md)
- [Assembler 模式](./architecture-document/vue/standardized-template-cn/assembler-pattern-cn.md)
- [组件系统](./architecture-document/vue/standardized-template-cn/component-system-cn.md)
- [组件使用](./architecture-document/vue/standardized-template-cn/component-usage.md)
- [配置指南](./architecture-document/vue/standardized-template-cn/configuration-guide-cn.md)
- [事件 Pipeline 系统](./architecture-document/vue/standardized-template-cn/event-pipeline-system-cn.md)
- [扩展模板](./architecture-document/vue/standardized-template-cn/extending-the-template-cn.md)
- [生命周期与副作用](./architecture-document/vue/standardized-template-cn/lifecycle-and-effects-cn.md)
- [生命周期事件效果](./architecture-document/vue/standardized-template-cn/lifecycle-event-effect.md)
- [状态与 Assembler](./architecture-document/vue/standardized-template-cn/state-and-assembler.md)
- [状态管理](./architecture-document/vue/standardized-template-cn/state-management-cn.md)

##### 标准化模板（英文）

- [API 请求处理](./architecture-document/vue/standardized-template-en/api-request-handling.md)
- [架构概览](./architecture-document/vue/standardized-template-en/architecture-overview.md)
- [Assembler 模式](./architecture-document/vue/standardized-template-en/assembler-pattern.md)
- [组件系统](./architecture-document/vue/standardized-template-en/component-system.md)
- [配置指南](./architecture-document/vue/standardized-template-en/configuration-guide.md)
- [事件 Pipeline 系统](./architecture-document/vue/standardized-template-en/event-pipeline-system.md)
- [扩展模板](./architecture-document/vue/standardized-template-en/extending-the-template.md)
- [生命周期与副作用](./architecture-document/vue/standardized-template-en/lifecycle-and-effects.md)
- [状态管理](./architecture-document/vue/standardized-template-en/state-management.md)

##### 技术选型

- [App 项目](./architecture-document/vue/technology-selection/app-project.md)
- [后端项目](./architecture-document/vue/technology-selection/backend-project.md)
- [客户端项目](./architecture-document/vue/technology-selection/client-project.md)
- [桌面端项目](./architecture-document/vue/technology-selection/desktop-project.md)

---

### 📖 开发手册 (Handbook)

#### 前端开发

##### 前端框架

- [Vue 3 手册](./handbook/frontend/vue3-handbook.md) - Vue 3 前端框架开发
- [React 19 手册](./handbook/frontend/react19-handbook.md) - React 19 最新特性
- [Next.js 手册](./handbook/frontend/nextjs-handbook.md) - Next.js 全栈框架指南

##### JavaScript & TypeScript

- [TypeScript 手册](./handbook/frontend/typescript-handbook.md) - TypeScript 开发参考
- [JavaScript 手册](./handbook/frontend/javascript-handbook.md) - JavaScript 开发手册
- [JS 手册](./handbook/frontend/js-handbook.md) - JS 快速参考手册
- [正则速查](./handbook/frontend/regex-handbook.md) - 正则表达式速查

##### 样式相关

- [CSS 手册](./handbook/frontend/css-handbook.md) - CSS3 样式开发参考
- [SCSS 手册](./handbook/frontend/scss-handbook.md) - SCSS/Sass 样式预处理器
- [Tailwind CSS 手册](./handbook/frontend/tailwind-css-handbook.md) - Tailwind CSS 样式框架指南

#### 后端开发

##### 后端框架

- [NestJS 手册](./handbook/backend/nestjs-handbook.md) - NestJS 后端框架指南
- [FastAPI 手册](./handbook/backend/fastapi-handbook.md) - FastAPI Python Web 框架

#### 数据库

##### 数据库 ORM

- [Prisma 手册](./handbook/database/prisma-handbook.md) - Prisma ORM 数据库工具
- [Sequelize 手册](./handbook/database/sequelize-handbook.md) - Sequelize SQL ORM
- [Mongoose 手册](./handbook/database/mongoose-handbook.md) - Mongoose MongoDB ODM

##### 数据库系统

- [MySQL 手册](./handbook/database/mysql-handbook.md) - MySQL 关系型数据库速查
- [MongoDB 手册](./handbook/database/mongodb-handbook.md) - MongoDB NoSQL 数据库速查
- [PostgreSQL 速查](./handbook/database/postgresql-handbook.md) - PostgreSQL 数据库速查

#### 移动开发

##### 移动端技术

- [Dart 手册](./handbook/mobile/dart-handbook.md) - Dart 编程语言指南
- [Flutter 手册](./handbook/mobile/flutter-handbook.md) - Flutter 跨平台移动开发

#### 系统运维

##### 运维工具

- [Shell 手册](./handbook/devops/shell-handbook.md) - Shell 脚本编程指南
- [Linux 命令速查](./handbook/devops/linux-handbook.md) - Linux 日常最常用命令
- [Git 速查](./handbook/devops/git-handbook.md) - Git 版本控制速查
- [Nginx 速查](./handbook/devops/nginx-handbook.md) - Nginx Web 服务器配置

#### 开发工具

##### 通用工具

- [Python 手册](./handbook/tools/python-handbook.md) - Python 开发手册
- [Docker 手册](./handbook/tools/docker-handbook.md) - Docker 容器化部署指南
- [Vim 手册](./handbook/tools/vim-handbook.md) - Vim 编辑器使用指南

---

## 🔗 快速链接

- [返回首页](/)

---

## 📝 文档说明

本文档中心采用 VitePress 构建，支持 Markdown 格式，提供清晰的导航结构和代码高亮功能。所有文档按照技术领域和项目模块进行分类，方便开发者快速查找所需信息。
