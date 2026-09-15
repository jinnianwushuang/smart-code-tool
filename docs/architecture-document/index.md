# 🏗️ 架构文档

欢迎来到架构文档中心!这里汇集了各种技术架构的设计思路、最佳实践和参考代码。

## 📖 文档分类

### 架构

- [架构愿景](./architectural-vision/architectural-vision-1) - 整体架构设计

### 🎨 Flutter 架构

- [状态管理架构选型](./flutter/state-management/flutter-state-management-architecture) - BLoC/Riverpod/GetX 选型决策矩阵与 Clean Architecture 集成
- [路由架构设计](./flutter/routing/flutter-routing-architecture) - GoRouter 路由树设计、深度链接、守卫模式与导航抽象
- [网络层架构设计](./flutter/networking/flutter-network-architecture) - Dio 拦截器链、Repository 模式、错误处理统一与缓存策略
- [项目结构与分层规范](./flutter/project-structure/flutter-project-structure) - Feature-first 目录结构、分层架构、依赖注入与模块化实践
- [原生开发主流语言对比](./flutter/thinking/native-languages-comparison) - Kotlin/Swift/Dart/TS/C++ 等主流语言说明与选型对比
- [iOS 与 Android 必备知识](./flutter/thinking/flutter-ios-android-knowledge) - Flutter 开发者必须掌握的平台知识梳理
- [APP 启动与屏幕渲染原理](./flutter/thinking/app-launch-and-rendering-pipeline) - 从点击图标到像素点亮的全链路与图形管线解析
- [系统内核与平台差异适配](./flutter/thinking/os-kernel-platform-differences) - Linux/XNU 内核差异、Android 碎片化与 Flutter 分层适配策略
- [网络层与弱网优化](./flutter/thinking/mobile-network-layer) - HTTPS 全链路、连接优化、DNS 防劫持与弱网对抗
- [内存管理与性能调优](./flutter/thinking/memory-management-performance) - 三层内存模型、OOM 归因、泄漏检测与 APM 体系
- [音视频与相机管线](./flutter/thinking/audio-video-camera) - 相机管线、编解码、播放管线、WebRTC 与直播架构
- [数据·算法·显示 三者分离](./flutter/thinking/data-algorithm-view-separation) - BLoC/Riverpod/Stream 架构下的三层分离与 Flutter 渲染管线同构
- [存储与数据同步](./flutter/thinking/storage-data-sync) - SQLite/KV 选型、离线优先架构与冲突解决
- [安全攻防基础](./flutter/thinking/mobile-security) - 逆向防护、安全存储、证书固定与 API 安全
- [混合栈与模块化架构](./flutter/thinking/hybrid-stack-modularization) - 引擎管理、混合路由与大型项目模块化
- [CI/CD 与发布工程化](./flutter/thinking/cicd-release-engineering) - 双平台流水线、签名自动化与灰度发布
- [测试体系](./flutter/thinking/testing-system) - 测试金字塔、Widget/集成/Golden 测试与 CI 质量门禁

### 🐍 Python 架构

- [项目工程化实践](./python/engineering/python-engineering-practices) - 虚拟环境、uv 包管理、Ruff 代码工具、CLI 脚本开发
- [后端框架技术选型](./python/technology-selection/python-backend-framework-selection) - FastAPI/Django/Flask 选型决策与工程化集成
- [AI 开发架构指南](./python/ai-architecture/python-ai-development-guide) - LangChain/LangGraph、RAG、Agent 模式与前端集成

### 🟢 Node.js 架构

- [项目架构与分层规范](./nodejs/project-architecture/nodejs-project-architecture) - 分层架构、依赖注入、模块化设计、错误处理
- [框架架构选型](./nodejs/framework-selection/nodejs-framework-selection) - Express/Koa/Fastify/NestJS/Hono 选型决策与全栈框架
- [中间件与管道架构](./nodejs/middleware-patterns/nodejs-middleware-patterns) - 中间件模型演进、认证/限流/校验管道、NestJS 管道架构

### ⚛️ React 架构

- [组件设计模式](./react/component-patterns/react-component-design-patterns) - 容器/展示、HOC、复合组件、受控/非受控等模式
- [Hooks 架构模式](./react/hooks-patterns/react-hooks-architecture) - 自定义 Hook 设计原则、分层体系、副作用管理
- [数据·算法·显示 三者分离](./react/hooks-patterns/data-algorithm-view-separation) - React Query + useMemo + JSX 的三层分离与 RSC 架构拓展
- [状态管理架构](./react/state-management/react-state-management-architecture) - 状态分类、Zustand/Redux Toolkit/Jotai 选型与工程化实践
- [useEffect 原理](./react/principle/use-effect) - 同步机制与 Fiber 源码深度解析
- [技术选型](./react/technology-selection/app-project)

### 💚 Vue 架构

- [架构概述](./vue/standardized-template-cn/architecture-overview-cn) - Vue 标准化装配架构总览
- [LV1-LV5 架构演进](./vue/standardized-template-cn/architecture-evolution-cn) - 从单文件到装配器的渐进式演进
- [通用工具](./vue/general-tools/module-loader) - 模块加载器与函数包装器
- [技术选型](./vue/technology-selection/app-project)
- [业务组件 SDK 打包](./vue/technology-selection/sdk-project) - 将业务组件封装为独立 SDK 供外部项目使用
- [数据·算法·显示 三者分离](./vue/standardized-template-cn/data-algorithm-view-separation-cn) - Composition API + Composable + computed 的三层分离与装配架构融合

### 🔧 工程化

- [前端脚手架背后的脚本语言解析](./engineering/job/frontend-scaffold-scripts)
- [Docker 镜像构建脚本对比](./engineering/job/docker-image-build-script-comparison)
- [包管理与 Monorepo 工具链](./engineering/job/npm-pnpm-monorepo-toolchain) - npm/pnpm/Yarn、Nx、Turborepo、Changesets

### 🗄️ 数据库

- [PostgreSQL vs MySQL + MongoDB](./database/postgresql-vs-mysql-mongodb) - 数据库选型对比与架构设计

### 📊 编程中的数据结构

- [基础概念](./data-structure/basic-concepts) - 数据结构概述与选择原则
- [线性结构](./data-structure/linear-structures) - 数组、链表、栈、队列
- [树形结构](./data-structure/tree-structures) - 二叉树、平衡树、堆、Trie
- [图结构](./data-structure/graph-structures) - 图的表示、遍历、最短路径
- [哈希表与集合](./data-structure/hash-structures) - 高效的键值存储
- [高级数据结构](./data-structure/advanced-structures) - 并查集、跳表、线段树

### 🎨 设计模式

- [概述](./design-patterns/overview) - SOLID 原则与设计模式分类
- [创建型模式](./design-patterns/creational) - 单例、工厂、建造者、原型
- [结构型模式](./design-patterns/structural) - 适配器、装饰器、代理、组合
- [行为型模式](./design-patterns/behavioral) - 观察者、策略、命令、状态

### 📡 通用知识

- [前端渲染模式全解](./general-knowledge/frontend-rendering-modes) - CSR、SSR、SSG、ISR、Streaming SSR、RSC 等模式详解
- [网络通用知识](./general-knowledge/network-fundamentals) - TCP/IP、HTTP、HTTPS、DNS、CORS、缓存策略等
- [Chrome 开发者工具全解](./general-knowledge/chrome-devtools) - Elements、Console、Sources、Network、Performance 等面板详解

### 💭 研发思维

- [BUG 修复思维对比](./thinking/bug-fixing-thinking) - 工程师/架构师/主管三种视角的 BUG 修复思维差异与协同模式
- [技术迭代与学习疲态](./thinking/tech-iteration-and-learning-fatigue) - 技术快速迭代下的学习疲态本质、三种视角应对策略与协同模型
- [数据·算法·显示 三者分离](./thinking/frontend-data-algorithm-view-separation) - 前端编程终极朴素思想：接口原始数据、算法处理、界面显示数据三层分离，与浏览器架构同构

## 🎯 快速开始

根据你的技术栈选择对应的架构文档:

- **前端开发**: 查看 [Vue 架构](./vue/standardized-template-cn/architecture-overview-cn) 或 [React 架构](./react/component-patterns/react-component-design-patterns)
- **移动开发**: 查看 [Flutter 架构](./flutter/project-structure/flutter-project-structure)
- **后端开发**: 查看 [Python 架构](./python/technology-selection/python-backend-framework-selection)
