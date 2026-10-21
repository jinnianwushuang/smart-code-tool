---
title: Vue 架构设计
---

# Vue 架构设计

Vue 3 架构设计与面试知识库，涵盖标准化模板、组件模式、响应式原理、生态实战。

## 架构设计

### 通用工具

| 文档                                                | 说明                  |
| --------------------------------------------------- | --------------------- |
| [模块加载器](./general-tools/module-loader)         | 模块加载器设计与实现  |
| [Payload 包装器](./general-tools/wrap-with-payload) | 统一 Payload 包装方案 |

### 标准化模板

| 文档                                                                 | 说明                     |
| -------------------------------------------------------------------- | ------------------------ |
| [架构概述](./standardized-template/architecture-overview)            | Vue 3 标准化模板架构总览 |
| [LV1-LV5 架构演进](./standardized-template/architecture-evolution)   | 五级架构演进路径         |
| [装配器模式](./standardized-template/assembler-pattern)              | 装配器模式设计与实践     |
| [状态管理](./standardized-template/state-management)                 | 标准化状态管理方案       |
| [生命周期与副作用](./standardized-template/lifecycle-and-effects)    | 生命周期管理与副作用控制 |
| [事件管道系统](./standardized-template/event-pipeline-system)        | 事件管道系统设计         |
| [组件系统](./standardized-template/component-system)                 | 组件体系架构             |
| [API 请求与模块调用](./standardized-template/api-request-and-module) | API 请求封装与模块调用   |
| [组件设计模式](./standardized-template/component-design-patterns)    | 组件设计模式最佳实践     |

### 独立文档

| 文档                                                                        | 说明                    |
| --------------------------------------------------------------------------- | ----------------------- |
| [Composable 设计模式](./composable-patterns/vue-composable-design-patterns) | Composable 函数设计范式 |
| [性能优化系统手册](./performance/vue-performance-optimization)              | Vue 性能优化完整手册    |

### 研发思维

| 文档                                                                        | 说明                   |
| --------------------------------------------------------------------------- | ---------------------- |
| [数据·算法·显示 三者分离](./thinking/data-algorithm-view-separation)        | 核心研发思维：三者分离 |
| [shallowRef 范式与高性能架构](./thinking/shallowRef-paradigm)               | shallowRef 高性能范式  |
| [无效渲染的元凶与根治](./thinking/render-chaos-root-cause)                  | 无效渲染根因分析与治理 |
| [渲染原理 × 事件调度 × 数据视图同步](./thinking/rendering-scheduling-sync)  | 渲染调度与数据同步公式 |
| [大型深层对象的按频率分频治理](./thinking/deep-object-frequency-governance) | 大对象分频治理策略     |
| [VNode 数据结构精讲](./thinking/vnode-data-structure)                       | VNode 数据结构深度讲解 |

### 底层原理拆解

| 文档                                                                 | 说明                  |
| -------------------------------------------------------------------- | --------------------- |
| [Vue 3 响应式系统架构](./typical-analysis/vue-reactivity-system)     | 响应式系统底层架构    |
| [Vue 3 编译器优化原理](./typical-analysis/vue-compiler-optimization) | 编译器优化原理        |
| [Vue Router 4 底层原理](./typical-analysis/vue-router-internals)     | Vue Router 4 内部实现 |

### 技术选型

| 文档                                                              | 说明                      |
| ----------------------------------------------------------------- | ------------------------- |
| [App 项目](./technology-selection/app-project)                    | Vue App 项目技术选型      |
| [后端项目](./technology-selection/backend-project)                | Vue 后端项目技术选型      |
| [客户端项目](./technology-selection/client-project)               | Vue 客户端项目技术选型    |
| [桌面端项目](./technology-selection/desktop-project)              | Vue 桌面端项目技术选型    |
| [业务组件 SDK 打包](./technology-selection/sdk-project)           | 业务组件 SDK 打包方案     |
| [Electron + Vue 3 技术选型](./technology-selection/electron-vue3) | Electron + Vue 3 选型实践 |

---

## 面试知识库

### 初级 [P4-P5]

| 文档                                                                           | 说明           |
| ------------------------------------------------------------------------------ | -------------- |
| [Vue 3 入门：模板、组件、生命周期](../interview/junior/vue-basics)             | Vue 3 基础入门 |
| [Vue 组件模式：Props、Emit、Slots](../interview/junior/vue-component-patterns) | 组件模式基础   |

### 中级 [P5-P6]

| 文档                                                                | 说明             |
| ------------------------------------------------------------------- | ---------------- |
| [Vue 3 生命周期深入](../interview/intermediate/vue-lifecycle)       | 生命周期深入理解 |
| [Vue 组件通信方式全景](../interview/intermediate/vue-communication) | 组件通信方式全览 |
| [Vue Router 路由实战](../interview/intermediate/vue-router-basics)  | 路由实战技巧     |

### 高级 [P6-P7/P8]

| 文档                                                                       | 说明                       |
| -------------------------------------------------------------------------- | -------------------------- |
| [Vue 响应式系统底层](../interview/advanced/reactivity-deep)                | 响应式系统深度解析         |
| [Vue 编译器优化](../interview/advanced/compiler-optimization)              | 编译器优化原理             |
| [Vapor Mode 原理](../interview/advanced/vapor-mode)                        | Vapor Mode 无虚拟 DOM 原理 |
| [渲染器 Patch 流程与 Diff 算法](../interview/advanced/renderer-patch-flow) | Patch 流程与 Diff 算法     |
| [Vue 3.5+ 新特性与响应式重构](../interview/advanced/vue-3.5-new-features)  | Vue 3.5+ 新特性            |
| [Pinia 状态管理原理与实战](../interview/advanced/pinia-deep)               | Pinia 深度原理             |
| [Vue Router 4 路由系统深度](../interview/advanced/vue-router-4)            | Vue Router 4 深度解析      |
| [Nuxt 3 全栈框架原理与实战](../interview/advanced/nuxt-3-fullstack)        | Nuxt 3 全栈框架            |
| [Vue 3 生态实战模式](../interview/advanced/vue-ecosystem-patterns)         | Vue 3 生态实战             |
