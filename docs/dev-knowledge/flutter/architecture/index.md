---
title: Flutter 架构设计
---

# Flutter 架构设计

Flutter 架构设计与面试知识库，涵盖状态管理、路由、渲染引擎、插件开发、跨端实践。

## 架构设计

### 核心架构

| 文档                                                                                               | 说明                          |
| -------------------------------------------------------------------------------------------------- | ----------------------------- |
| [状态管理架构选型](./state-management/flutter-state-management-architecture)                       | 状态管理方案选型对比          |
| [GetX 模块化架构与路由守卫](./state-management/flutter-getx-modular-architecture-and-route-guards) | GetX 模块分层与路由守卫实战   |
| [路由架构设计](./routing/flutter-routing-architecture)                                             | 路由架构设计                  |
| [网络层架构设计](./networking/flutter-network-architecture)                                        | 网络层架构设计                |
| [Dio 拦截器链与 Token 无感刷新](./networking/flutter-dio-interceptor-chain-and-token-refresh)      | 拦截器链与 Token 刷新实战     |
| [项目结构与分层规范](./project-structure/flutter-project-structure)                                | 项目结构与分层规范            |
| [渲染管线与 Impeller](./rendering/flutter-rendering-pipeline)                                      | 渲染管线与 Impeller 引擎      |
| [性能优化实战](./performance/flutter-performance-optimization)                                     | 性能优化实战手册              |
| [UI 适配·主题·加载状态设计](./performance/flutter-ui-adaptation-theming-loading-states)            | ScreenUtil + M3 主题 + 骨架屏 |
| [插件开发架构](./plugin/flutter-plugin-architecture)                                               | 插件开发架构指南              |

### 思考文档

| 文档                                                                                | 说明                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| [原生开发主流语言对比](./thinking/native-languages-comparison)                      | 原生开发语言对比分析                 |
| [iOS 与 Android 必备知识](./thinking/flutter-ios-android-knowledge)                 | iOS/Android 必备知识                 |
| [APP 启动与屏幕渲染原理](./thinking/app-launch-and-rendering-pipeline)              | APP 启动与渲染管线                   |
| [系统内核与平台差异适配](./thinking/os-kernel-platform-differences)                 | 系统内核与平台差异                   |
| [网络层与弱网优化](./thinking/mobile-network-layer)                                 | 网络层与弱网优化                     |
| [内存管理与性能调优](./thinking/memory-management-performance)                      | 内存管理与性能调优                   |
| [音视频与相机管线](./thinking/audio-video-camera)                                   | 音视频与相机管线                     |
| [数据·算法·显示 三者分离](./thinking/data-algorithm-view-separation)                | 核心研发思维：三者分离               |
| [组件设计模式](./thinking/flutter-component-design-patterns)                        | 组件设计模式                         |
| [setState 滥用与 Widget 重建失控](./thinking/setstate-rebuild-chaos-root-cause)     | setState 滥用根因与治理              |
| [Widget × 帧调度 × 三层对象同步](./thinking/widget-frame-sync-formula)              | Widget 帧调度同步公式                |
| [大型深层对象的按频率分频治理](./thinking/deep-object-frequency-governance-cn)      | 大对象分频治理策略                   |
| [节点数据结构精讲：三棵树](./thinking/element-widget-renderobject-tree)             | Element/Widget/RenderObject 三棵树   |
| [存储与数据同步](./thinking/storage-data-sync)                                      | 存储与数据同步                       |
| [安全攻防基础](./thinking/mobile-security)                                          | 移动端安全攻防                       |
| [混合栈与模块化架构](./thinking/hybrid-stack-modularization)                        | 混合栈与模块化                       |
| [CI/CD 与发布工程化](./thinking/cicd-release-engineering)                           | CI/CD 与发布工程化                   |
| [测试体系](./thinking/testing-system)                                               | Flutter 测试体系                     |
| [build_runner 代码生成工程化](./thinking/flutter-build-runner-code-generation)      | Retrofit + json_serializable + slang |
| [离线优先架构与分页加载](./thinking/flutter-offline-first-and-pagination)           | Hive 缓存 + 网络监听 + 分页组件      |
| [全局错误处理与启动优化](./thinking/flutter-error-handling-and-launch-optimization) | 双层错误捕获 + 启动编排优化          |
| [slang 国际化方案](./thinking/flutter-slang-i18n-solution)                          | 类型安全国际化实战                   |

### 典型拆解

| 文档                                                                                                       | 说明                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [GetX 框架底层设计原理](./typical-analysis/getx-reactive-system)                                           | GetX 响应式系统拆解          |
| [Widget 重建与 Element 更新拆解](./typical-analysis/flutter-widget-rebuild)                                | Widget 重建与 Element 更新   |
| [Dart Future/Stream/Isolate 异步调度](./typical-analysis/dart-async-scheduling)                            | Dart 异步调度机制            |
| [StatefulWidget 底层原理](./typical-analysis/flutter-stateful-widget-internals)                            | StatefulWidget 底层原理      |
| [WidgetsFlutterBinding 底层原理与启动全链路](./typical-analysis/flutter-binding-init-and-engine-bootstrap) | Binding 初始化与 Engine 启动 |

---

## 面试知识库

### 中级 [P5-P6]

| 文档                                                                         | 说明              |
| ---------------------------------------------------------------------------- | ----------------- |
| [Dart 语言基础与核心特性](../interview/intermediate/flutter-dart-basics)     | Dart 语言基础     |
| [Widget 体系与布局系统](../interview/intermediate/flutter-widget-and-layout) | Widget 与布局系统 |
| [状态管理基础](../interview/intermediate/flutter-state-management-basics)    | 状态管理基础      |
| [导航与路由实战](../interview/intermediate/flutter-navigation-and-routing)   | 导航与路由实战    |

### 高级 [P6-P7/P8]

| 文档                                                                 | 说明                |
| -------------------------------------------------------------------- | ------------------- |
| [渲染引擎](../interview/advanced/rendering-engine)                   | 渲染引擎深度解析    |
| [Dart 语言深度](../interview/advanced/dart-advanced)                 | Dart 高级特性       |
| [状态管理架构](../interview/advanced/architecture-patterns)          | 状态管理架构模式    |
| [与原生交互](../interview/advanced/platform-interop)                 | Flutter 与原生交互  |
| [性能优化与工程化](../interview/advanced/performance-engineering)    | 性能优化与工程化    |
| [Riverpod 状态管理深度](../interview/advanced/riverpod-deep)         | Riverpod 深度解析   |
| [BLoC/Cubit 架构模式](../interview/advanced/bloc-cubit-architecture) | BLoC/Cubit 架构模式 |
| [GetX 生态体系](../interview/advanced/getx-ecosystem)                | GetX 生态体系       |
| [GoRouter 路由管理深度](../interview/advanced/go-router-deep)        | GoRouter 深度解析   |
| [Dio 网络层与 HTTP 客户端](../interview/advanced/dio-and-networking) | Dio 网络层实战      |
| [本地存储与持久化](../interview/advanced/flutter-local-storage)      | 本地存储与持久化    |
