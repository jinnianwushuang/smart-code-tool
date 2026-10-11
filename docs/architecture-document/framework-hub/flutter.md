---
tags: ['Flutter', '架构', '面试', '汇总']
---

# Flutter 文档汇总

> Flutter 3 相关的全部文档入口汇总，覆盖架构设计、平台认知、原理深入、面试知识体系。

---

## 📐 架构文档

> 来源：`architecture-document/flutter/`

### 核心架构

- [状态管理架构选型](../flutter/state-management/flutter-state-management-architecture) - BLoC/Riverpod/GetX 选型决策矩阵与 Clean Architecture 集成
- [路由架构设计](../flutter/routing/flutter-routing-architecture) - GoRouter 路由树设计、深度链接、守卫模式与导航抽象
- [网络层架构设计](../flutter/networking/flutter-network-architecture) - Dio 拦截器链、Repository 模式、错误处理统一与缓存策略
- [项目结构与分层规范](../flutter/project-structure/flutter-project-structure) - Feature-first 目录结构、分层架构、依赖注入与模块化实践

### 渲染引擎

- [Flutter 渲染管线与 Impeller](../flutter/rendering/flutter-rendering-pipeline) - Widget→Element→RenderObject 三棵树、Impeller 预编译着色器、渲染优化

### 性能优化

- [Flutter 性能优化实战](../flutter/performance/flutter-performance-optimization) - const Widget/RepaintBoundary/ListView.builder/内存管理/DevTools 诊断

### 插件开发

- [Flutter 插件开发架构](../flutter/plugin/flutter-plugin-architecture) - Platform Channel/MethodChannel/EventChannel/FFI 原生交互

### 思考文档

#### 平台认知

- [原生开发主流语言对比](../flutter/thinking/native-languages-comparison) - Kotlin/Swift/Dart/TS/C++ 等主流语言说明与选型对比
- [iOS 与 Android 必备知识](../flutter/thinking/flutter-ios-android-knowledge) - Flutter 开发者必须掌握的平台知识梳理
- [APP 启动与屏幕渲染原理](../flutter/thinking/app-launch-and-rendering-pipeline) - 从点击图标到像素点亮的全链路与图形管线解析
- [系统内核与平台差异适配](../flutter/thinking/os-kernel-platform-differences) - Linux/XNU 内核差异、Android 碎片化与 Flutter 分层适配策略

#### 核心原理

- [网络层与弱网优化](../flutter/thinking/mobile-network-layer) - HTTPS 全链路、连接优化、DNS 防劫持与弱网对抗
- [内存管理与性能调优](../flutter/thinking/memory-management-performance) - 三层内存模型、OOM 归因、泄漏检测与 APM 体系
- [音视频与相机管线](../flutter/thinking/audio-video-camera) - 相机管线、编解码、播放管线、WebRTC 与直播架构
- [数据·算法·显示 三者分离](../flutter/thinking/data-algorithm-view-separation) - BLoC/Riverpod/Stream 架构下的三层分离与 Flutter 渲染管线同构
- [组件设计模式](../flutter/thinking/flutter-component-design-patterns) - Stateless/Stateful 分离、InheritedWidget、BLoC、Key 模式等
- [setState 滥用与 Widget 重建失控](../flutter/thinking/setstate-rebuild-chaos-root-cause) - Flutter 卡顿元凶：不必要重建的五大病灶与根治方案
- [Widget × 帧调度 × 三层对象同步](../flutter/thinking/widget-frame-sync-formula) - Flutter 底层万用公式：Widget 不可变性、帧管线、三层对象同步
- [大型深层对象的按频率分频治理](../flutter/thinking/deep-object-frequency-governance-cn) - ValueNotifier + Riverpod + Stream 三管道分频协同
- [节点数据结构精讲：Widget·Element·RenderObject 三棵树](../flutter/thinking/element-widget-renderobject-tree) - 三棵节点树的数据结构、职责分工与协同更新流程

#### 数据与安全

- [存储与数据同步](../flutter/thinking/storage-data-sync) - SQLite/KV 选型、离线优先架构与冲突解决
- [安全攻防基础](../flutter/thinking/mobile-security) - 逆向防护、安全存储、证书固定与 API 安全

#### 工程实践

- [混合栈与模块化架构](../flutter/thinking/hybrid-stack-modularization) - 引擎管理、混合路由与大型项目模块化
- [CI/CD 与发布工程化](../flutter/thinking/cicd-release-engineering) - 双平台流水线、签名自动化与灰度发布
- [测试体系](../flutter/thinking/testing-system) - 测试金字塔、Widget/集成/Golden 测试与 CI 质量门禁

### 典型拆解

> 来源：`flutter/typical-analysis/`

- [GetX 响应式系统核心原理拆解](../flutter/typical-analysis/getx-reactive-system) - `.obs` → `Obx` 依赖收集 → Worker 副作用 → 与 Vue 响应式同构
- [Widget 重建与 Element 更新拆解](../flutter/typical-analysis/flutter-widget-rebuild) - setState → markNeedsBuild → Element Diff → const 优化 → RepaintBoundary
- [Dart Future/Stream/Isolate 异步调度拆解](../flutter/typical-analysis/dart-async-scheduling) - Event Loop → Future → Stream → Isolate 内存隔离模型

---

## 🎯 面试知识

> 来源：`interview/`

### 中级 [P5-P6]

- [Dart 语言基础与核心特性](/interview/flutter-intermediate/flutter-dart-basics)
- [Flutter Widget 体系与布局系统](/interview/flutter-intermediate/flutter-widget-and-layout)
- [Flutter 状态管理基础](/interview/flutter-intermediate/flutter-state-management-basics)
- [Flutter 导航与路由实战](/interview/flutter-intermediate/flutter-navigation-and-routing)

### 高级 [P6-P7/P8]

- [Flutter 渲染引擎](/interview/flutter/rendering-engine) - Impeller/Skia、三棵树机制
- [Dart 语言深度](/interview/flutter/dart-advanced) - Isolate 并发、Mixin 线性化、AOT/JIT
- [Flutter 状态管理架构](/interview/flutter/architecture-patterns) - Riverpod/BLoC 大规模、Clean Architecture、DI
- [Flutter 与原生交互](/interview/flutter/platform-interop) - Platform Channel、FFI、混合栈架构
- [Flutter 性能优化与工程化](/interview/flutter/performance-engineering) - 启动优化、内存治理、包体积、灰度发布
- [Riverpod 状态管理深度](/interview/flutter/riverpod-deep) - Codegen、AsyncValue、Provider 依赖图
- [BLoC/Cubit 架构模式与大规模实践](/interview/flutter/bloc-cubit-architecture) - 事件驱动、bloc_test、分层架构
- [GetX 生态体系](/interview/flutter/getx-ecosystem) - 状态/路由/DI 三合一、GetBuilder vs Obx
- [GoRouter 路由管理深度](/interview/flutter/go-router-deep) - ShellRoute、Deep Link、路由守卫
- [Dio 网络层与 HTTP 客户端体系](/interview/flutter/dio-and-networking) - 拦截器链、Transformer、取消请求
- [Flutter 本地存储与持久化](/interview/flutter/flutter-local-storage) - Isar/Hive/SQLite/drift、加密存储

---

## 🔗 跨框架对比

以下文档涉及 Flutter 与其他框架的横向对比：

- [跨框架研发思维对比](../thinking/cross-framework-thinking-comparison) - Vue·React·Flutter 三层分离、不必要渲染元凶、底层万用公式
- [数据·算法·显示 三者分离（通用）](../thinking/frontend-data-algorithm-view-separation)
- [React 19 vs Vue 3 vs Flutter 复杂业务性能对决](../thinking/framework-performance-comparison)
- [跨端技术选型矩阵](/interview/cross-platform/cross-platform-selection)
- [多端一致性方案](/interview/cross-platform/multi-platform-consistency)
