# 📚 开发手册

欢迎来到开发手册中心！这里汇集了全栈开发所需的核心技术文档和速查指南。

## 🤖 AI 开发

| 手册                                              | 描述                                                           |
| ------------------------------------------------- | -------------------------------------------------------------- |
| [LangChain 手册](/handbook/ai/langchain-handbook) | LangChain 框架完整指南，包括链式调用、代理、记忆系统等核心概念 |
| [Ollama 手册](/handbook/ai/ollama-handbook)       | Ollama 本地大模型部署与管理指南                                |

---

## 🎨 前端开发

### 前端框架

| 手册                                                            | 描述                                           |
| --------------------------------------------------------------- | ---------------------------------------------- |
| [Vue 3 手册](/handbook/frontend/vue3-handbook)                  | Vue 3 组合式 API、响应式系统、组件开发最佳实践 |
| [Vue 3 核心原理](/handbook/frontend/vue3-core-principles)       | Vue 3 响应式系统、虚拟 DOM、编译优化底层实现   |
| [React 19 手册](/handbook/frontend/react19-handbook)            | React 19 新特性、Hooks、性能优化指南           |
| [React 19 核心原理](/handbook/frontend/react19-core-principles) | React Fiber 架构、协调算法、并发渲染底层实现   |
| [React Native 手册](/handbook/frontend/react-native-handbook) | React Native 跨平台移动开发、核心组件、导航与性能优化 |
| [React Native 核心原理](/handbook/frontend/react-native-core-principles) | Bridge/JSI 架构、Fabric 渲染器、Yoga 布局、Hermes 引擎底层实现 |
| [Next.js 手册](/handbook/frontend/nextjs-handbook)              | Next.js 服务端渲染、静态生成、路由系统详解     |
| [Next.js 核心原理](/handbook/frontend/nextjs-core-principles)   | Next.js 核心底层原理深度解析                   |
| [Vite 核心原理](/handbook/frontend/vite-core-principles)        | Vite 脚手架架构、依赖预构建、HMR 热更新底层实现 |
| [Electron 手册](/handbook/electron/electron-handbook)            | Electron 桌面应用开发、进程模型、IPC 通信、打包发布 |
| [Electron 核心原理](/handbook/electron/electron-core-principles) | 多进程架构、IPC 机制、上下文隔离、渲染管线、安全模型与自动更新原理 |
| [Electron + Vue 3 技术选型](/handbook/electron/electron-vue3-technology-selection) | Electron + Vue 3 技术栈选型与最佳实践 |
| [Electron + React 技术选型](/handbook/electron/electron-react-technology-selection) | Electron + React 技术栈选型与最佳实践 |

### JavaScript & TypeScript

| 手册                                                      | 描述                                        |
| --------------------------------------------------------- | ------------------------------------------- |
| [TypeScript 手册](/handbook/frontend/typescript-handbook) | TypeScript 类型系统、高级类型、泛型编程指南 |
| [TypeScript 核心原理](/handbook/frontend/typescript-core-principles) | 编译器架构、类型系统、控制流分析、泛型推断底层实现 |
| [JavaScript 手册](/handbook/frontend/javascript-handbook) | JavaScript 核心语法、异步编程、模块化开发   |
| [JavaScript 高阶与实验性 API](/handbook/frontend/javascript-advanced-principles) | 语法糖本质拆解、高阶 API 深度解析、TC39 实验性提案 |
| [正则速查](/handbook/frontend/regex-handbook)             | 正则表达式语法、常用模式、实战示例          |

### 样式相关

| 手册                                                          | 描述                                          |
| ------------------------------------------------------------- | --------------------------------------------- |
| [CSS 手册](/handbook/frontend/css-handbook)                   | CSS 布局、选择器、动画、响应式设计            |
| [SCSS 手册](/handbook/frontend/scss-handbook)                 | SCSS 预处理器语法、嵌套、混入、变量使用       |
| [Tailwind CSS 手册](/handbook/frontend/tailwind-css-handbook) | Tailwind CSS 原子化类库、自定义配置、最佳实践 |

---

## ⚙️ 后端开发

### 后端框架

| 手册                                                  | 描述                                               |
| ----------------------------------------------------- | -------------------------------------------------- |
| [Python 手册](/handbook/backend/python-handbook)        | Python 编程基础、标准库、虚拟环境管理              |
| [NestJS 手册](/handbook/backend/nestjs-handbook)      | NestJS 模块化架构、依赖注入、中间件、守卫          |
| [NestJS 核心原理](/handbook/backend/nestjs-core-principles) | NestJS 依赖注入容器、元编程、模块系统底层实现 |
| [FastAPI 手册](/handbook/backend/fastapi-handbook)    | FastAPI 高性能 Python Web 框架、自动文档、依赖注入 |
| [Django 手册](/handbook/backend/django-handbook)      | Django 全栈框架、ORM、认证系统、REST API           |
| [Egg.js V3 手册](/handbook/backend/eggjs-handbook)    | Egg.js V3 企业级 Node.js 框架、插件机制、多进程    |
| [Egg.js V4 手册](/handbook/backend/eggjs-v4-handbook) | Egg.js V4 全面 ESM、装饰器编程、依赖注入、Koa 3    |

---

## 💾 数据库

### 数据库 ORM

| 手册                                                    | 描述                                         |
| ------------------------------------------------------- | -------------------------------------------- |
| [Prisma 手册](/handbook/database/prisma-handbook)       | Prisma 类型安全 ORM、Schema 定义、查询构建器 |
| [Sequelize 手册](/handbook/database/sequelize-handbook) | Sequelize Node.js ORM、模型定义、关联查询    |
| [Mongoose 手册](/handbook/database/mongoose-handbook)   | Mongoose MongoDB ODM、Schema 设计、聚合管道  |

### 数据库系统

| 手册                                                      | 描述                                                    |
| --------------------------------------------------------- | ------------------------------------------------------- |
| [MySQL 手册](/handbook/database/mysql-handbook)           | MySQL 关系型数据库、SQL 语法、索引优化、事务处理        |
| [MongoDB 手册](/handbook/database/mongodb-handbook)       | MongoDB 文档数据库、CRUD 操作、聚合框架、索引策略       |
| [PostgreSQL 速查](/handbook/database/postgresql-handbook) | PostgreSQL 高级特性、JSONB、窗口函数、性能调优          |
| [Redis 手册](/handbook/database/redis-handbook)           | Redis 数据结构、持久化、集群、ioredis/redis-py 客户端   |
| [Chroma 手册](/handbook/database/chroma-handbook)         | Chroma 向量数据库、语义搜索、RAG 集成、元数据过滤       |
| [Milvus 手册](/handbook/database/milvus-handbook)         | Milvus 高性能向量数据库、万亿级检索、混合搜索、集群部署 |

---

## 📱 移动开发

### 移动端技术

| 手册                                              | 描述                                          |
| ------------------------------------------------- | --------------------------------------------- |
| [Flutter 手册](/handbook/mobile/flutter-handbook) | Flutter 跨平台 UI 框架、Widget 系统、状态管理 |
| [Flutter 核心原理](/handbook/mobile/flutter-core-principles) | 三棵树、渲染管线、Hot Reload、Platform Channel 底层实现 |
| [Flutter 企业级项目手册](/handbook/mobile/flutter-enterprise-handbook) | Flutter 企业级项目架构、工程化实践参考手册 |
| [Retrofit 原理与工作流](/handbook/mobile/flutter-retrofit) | 声明式 HTTP 客户端、注解 + 代码生成、Dio 集成原理 |
| [GetX 原理与工作流](/handbook/mobile/flutter-getx) | 状态管理、路由导航、依赖注入一体化框架原理 |
| [Dart 手册](/handbook/mobile/dart-handbook)       | Dart 编程语言、异步编程、类型系统             |

---

## 🛠️ 系统运维

### 运维工具

| 手册                                                  | 描述                                         |
| ----------------------------------------------------- | -------------------------------------------- |
| [Shell 手册](/handbook/devops/shell-handbook)         | Shell 脚本编程、常用命令、自动化任务         |
| [Linux 命令速查](/handbook/devops/linux-handbook)     | Linux 系统管理、文件操作、进程管理、权限控制 |
| [Git 速查](/handbook/devops/git-handbook)             | Git 版本控制、分支管理、协作工作流           |
| [Nginx 速查](/handbook/devops/nginx-handbook)         | Nginx 配置、反向代理、负载均衡、SSL 证书     |
| [Jenkins 手册](/handbook/devops/jenkins-handbook)     | Jenkins CI/CD 流水线、自动化构建、持续部署   |
| [Google zx 手册](/handbook/devops/google-zx-handbook) | JavaScript 编写脚本、自动化任务、CI/CD 集成  |

---

## 🔧 其他手册

### 通用工具

| 手册 | 描述 |
| ---- | ---- |
| [VBA 手册](/handbook/tools/vba-handbook) | Excel VBA 自动化、批量报表生成、数据处理 |
| [Excel 公式手册](/handbook/tools/excel-formulas-handbook) | Excel 常用公式、函数详解、实用案例 |
| [Docker 手册](/handbook/devops/docker-handbook) | Docker 容器化、镜像构建、容器编排、多阶段构建 |
| [Vim 手册](/handbook/tools/vim-handbook) | Vim 编辑器快捷键、配置、插件管理 |

---

## 💡 使用建议

- **快速查找**：使用浏览器搜索功能（Ctrl/Cmd + F）快速定位手册
- **分类浏览**：根据技术领域选择对应的手册类别
- **收藏常用**：将高频使用的手册加入书签以便快速访问
- **持续更新**：手册内容会随技术发展持续更新，建议定期查看

---

 