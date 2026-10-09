# 🏗️ 架构文档

欢迎来到架构文档中心!这里汇集了各种技术架构的设计思路、最佳实践和参考代码。

## 📖 文档分类

### 架构

- [架构愿景](./architectural-vision/architectural-vision-1) - 整体架构设计

### 🎨 Flutter 架构

> 📌 完整入口：[Flutter 文档汇总](./framework-hub/flutter)

- [状态管理架构选型](./flutter/state-management/flutter-state-management-architecture) - BLoC/Riverpod/GetX 选型决策矩阵
- [项目结构与分层规范](./flutter/project-structure/flutter-project-structure) - Feature-first 目录结构与分层架构
- [Flutter 渲染管线与 Impeller](./flutter/rendering/flutter-rendering-pipeline) - 三棵树、Impeller 预编译着色器

_更多文档见 [Flutter 汇总页](./framework-hub/flutter)_

### 🐍 Python 架构

- [项目工程化实践](./python/engineering/python-engineering-practices) - 虚拟环境、uv 包管理、Ruff 代码工具、CLI 脚本开发
- [后端框架技术选型](./python/technology-selection/python-backend-framework-selection) - FastAPI/Django/Flask 选型决策与工程化集成
- [AI 开发架构指南](./python/ai-architecture/python-ai-development-guide) - LangChain/LangGraph、RAG、Agent 模式与前端集成

### 🟢 Node.js 架构

- [项目架构与分层规范](./nodejs/project-architecture/nodejs-project-architecture) - 分层架构、依赖注入、模块化设计、错误处理
- [框架架构选型](./nodejs/framework-selection/nodejs-framework-selection) - Express/Koa/Fastify/NestJS/Hono 选型决策与全栈框架
- [中间件与管道架构](./nodejs/middleware-patterns/nodejs-middleware-patterns) - 中间件模型演进、认证/限流/校验管道、NestJS 管道架构

### ⚛️ React 架构

> 📌 完整入口：[React 文档汇总](./framework-hub/react)

- [组件设计模式](./react/component-patterns/react-component-design-patterns) - 容器/展示、HOC、复合组件等模式
- [Hooks 架构模式](./react/hooks-patterns/react-hooks-architecture) - 自定义 Hook 设计原则、分层体系
- [状态管理架构](./react/state-management/react-state-management-architecture) - Zustand/Redux Toolkit/Jotai 选型
- [Fiber × 并发调度 × 数据视图同步](./react/thinking/fiber-concurrent-sync-formula) - React 底层万用公式

_更多文档见 [React 汇总页](./framework-hub/react)_

### 💚 Vue 架构

> 📌 完整入口：[Vue 文档汇总](./framework-hub/vue)

- [架构概述](./vue/standardized-template-cn/architecture-overview-cn) - Vue 标准化装配架构总览
- [LV1-LV5 架构演进](./vue/standardized-template-cn/architecture-evolution-cn) - 从单文件到装配器的渐进式演进
- [Vue 3 响应式系统架构](./vue/principle/vue-reactivity-system) - Proxy 依赖收集、调度器批量更新
- [渲染原理 × 事件调度 × 数据视图同步](./vue/thinking/rendering-scheduling-sync-formula) - 现代前端底层万用公式三柱合一

_更多文档见 [Vue 汇总页](./framework-hub/vue)_

### 🔧 工程化

- [前端脚手架背后的脚本语言解析](./engineering/job/frontend-scaffold-scripts)
- [Docker 镜像构建脚本对比](./engineering/job/docker-image-build-script-comparison)
- [包管理与 Monorepo 工具链](./engineering/job/npm-pnpm-monorepo-toolchain) - npm/pnpm/Yarn、Nx、Turborepo、Changesets

### 🤖 AI 代码检查

- [架构概述](./ai-code-inspection/architecture-overview) - 五层管线架构、与传统 Lint 的互补关系、大型项目特殊挑战
- [Prompt 工程策略](./ai-code-inspection/prompt-engineering) - 四要素框架、场景模板、版本管理、多模型适配
- [代码上下文采集与组装](./ai-code-inspection/code-context-pipeline) - Diff 采集、依赖签名摘要、Token 预算、大文件切片
- [检查规则体系设计](./ai-code-inspection/rule-system-design) - 规则数据结构、五大分类、优先级、误报管理
- [CI/CD 集成方案](./ai-code-inspection/ci-integration) - PR 触发/定时扫描/发布门禁、成本控制、渐进式引入
- [扩展性与自定义机制](./ai-code-inspection/extensibility-and-customization) - 插件化架构、分层配置、四阶段演进路线

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
- [构建优化核心概念](./general-knowledge/build-optimization-concepts) - Tree Shaking、代码分割、HMR、依赖预构建四大支柱
- [Rolldown 与 Oxc](./general-knowledge/rolldown-and-oxc) - Rust 重塑前端工具链：Rolldown 统一打包器 + Oxc 编译器工具链
- [Signal 细粒度响应式](./general-knowledge/signal-reactivity) - Signal 原语、跨框架对比、ES2026 原生规范

### 💭 研发思维

- [技术名词深度解析索引（入口）](./thinking/terminology-index) - 核心名词按领域分类，链接各技术目录深度解析，跨框架对比速查
- [跨框架研发思维对比](./thinking/cross-framework-thinking-comparison) - Vue·React·Flutter 三大框架在三个核心主题上的横向对比：三层分离、不必要渲染元凶、底层万用公式
- [BUG 修复思维对比](./thinking/bug-fixing-thinking) - 工程师/架构师/主管三种视角的 BUG 修复思维差异与协同模式
- [技术迭代与学习疲态](./thinking/tech-iteration-and-learning-fatigue) - 技术快速迭代下的学习疲态本质、三种视角应对策略与协同模型
- [数据·算法·显示 三者分离](./thinking/frontend-data-algorithm-view-separation) - 前端编程终极朴素思想：接口原始数据、算法处理、界面显示数据三层分离，与浏览器架构同构

### 🔬 典型拆解

- [TypeScript 类型拆解](./typical-analysis/typescript-type-analysis) - 内置工具类型底层实现逐行拆解：Exclude/infer/ReturnType/Awaited/Partial/Pick/Omit
- [Node.js 事件调度拆解](./typical-analysis/nodejs-event-scheduling) - 手写 EventEmitter、通配符事件、Koa 洋葱模型中间件管道、流式管线背压控制
- [浏览器端 JS 调度拆解](./typical-analysis/browser-js-scheduling) - Event Loop 宏/微任务调度、高频面试题输出预测、并发调度器、任务分片
- [Promise/A+ 手写实现拆解](./typical-analysis/promise-implementation) - 状态机、then 链式调用、resolvePromise 递归解析、all/race/allSettled/any
- [原型链与继承拆解](./typical-analysis/prototype-chain-and-inheritance) - 手写 new、原型链查找、继承方案演进、class extends 底层原理
- [虚拟 DOM Diff 算法拆解](./typical-analysis/virtual-dom-diff) - 同层比较、Vue 2 双端 Diff、React key Map Diff、key 的作用
- [响应式系统核心原理拆解](./typical-analysis/reactive-system) - Proxy + effect + track/trigger、computed 惰性计算、watch 侦听器
- [深拷贝全场景拆解](./typical-analysis/deep-clone) - 循环引用、Date/RegExp/Map/Set、Symbol 键、structuredClone 对比
- [前端路由系统实现拆解](./typical-analysis/frontend-router) - Hash/History 两种模式、动态路由匹配、懒加载、导航守卫

## 🎯 快速开始

根据你的技术栈选择对应的架构文档:

- **前端开发**: 查看 [Vue 文档汇总](./framework-hub/vue) 或 [React 文档汇总](./framework-hub/react)
- **移动开发**: 查看 [Flutter 文档汇总](./framework-hub/flutter)
- **按框架浏览**: 进入 [框架文档汇总](./framework-hub/) 按技术栈一站查找
- **后端开发**: 查看 [Python 架构](./python/technology-selection/python-backend-framework-selection)
