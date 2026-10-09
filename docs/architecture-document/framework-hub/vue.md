---
tags: ['Vue', '架构', '面试', '汇总']
---

# Vue 文档汇总

> Vue 3 相关的全部文档入口汇总，覆盖架构设计、原理深入、面试知识体系。

---

## 📐 架构文档

> 来源：`architecture-document/vue/`

### 标准化模板

- [架构概述](../vue/standardized-template-cn/architecture-overview-cn) - Vue 标准化装配架构总览
- [LV1-LV5 架构演进](../vue/standardized-template-cn/architecture-evolution-cn) - 从单文件到装配器的渐进式演进
- [装配器模式](../vue/standardized-template-cn/assembler-pattern-cn)
- [状态管理](../vue/standardized-template-cn/state-management-cn)
- [生命周期与副作用](../vue/standardized-template-cn/lifecycle-and-effects-cn)
- [事件管道系统](../vue/standardized-template-cn/event-pipeline-system-cn)
- [组件系统](../vue/standardized-template-cn/component-system-cn)
- [API 请求与模块调用](../vue/standardized-template-cn/api-request-and-module)
- [组件设计模式](../vue/standardized-template-cn/vue-component-design-patterns) - Composable、作用域插槽、装配器、v-model、provide/inject 等

### 通用工具

- [模块加载器](../vue/general-tools/module-loader)
- [Payload 包装器](../vue/general-tools/wrap-with-payload)

### 原理说明

- [Vue 3 响应式系统架构](../vue/principle/vue-reactivity-system) - Proxy 依赖收集、调度器批量更新、ref/reactive/computed 全解析

### Composable 设计模式

- [Vue 3 Composable 设计模式](../vue/composable-patterns/vue-composable-design-patterns) - 设计原则、常见模式、分层体系与反模式

### 性能优化

- [Vue 3 性能优化系统手册](../vue/performance/vue-performance-optimization) - v-once/v-memo/shallowRef/虚拟滚动/DevTools 诊断全维度

### 研发思维

- [数据·算法·显示 三者分离](../vue/thinking/data-algorithm-view-separation-cn) - Composition API + Composable + computed 的三层分离
- [shallowRef 范式与高性能架构](../vue/thinking/shallowRef-paradigm-high-performance) - shallowRef 范式 + 纯粹算法转换 + 合理调度策略
- [无效渲染的元凶与根治方案](../vue/thinking/render-chaos-root-cause) - Vue 3 卡顿元凶：逻辑触发的混乱无序高频无效渲染
- [渲染原理 × 事件调度 × 数据视图同步](../vue/thinking/rendering-scheduling-sync-formula) - 现代前端底层万用公式三柱合一
- [VNode 数据结构精讲](../vue/thinking/vnode-data-structure) - VNode 完整字段解析、shapeFlag/patchFlag 位优化、Block 树靶向更新
- [大型深层对象的按频率分频治理](../vue/thinking/deep-object-frequency-governance-cn) - 低频 shallowRef+computed / 高频 mitt+节流防抖 双管道协同

### 技术选型

- [App 项目](../vue/technology-selection/app-project)
- [后端项目](../vue/technology-selection/backend-project)
- [客户端项目](../vue/technology-selection/client-project)
- [桌面端项目](../vue/technology-selection/desktop-project)
- [业务组件 SDK 打包](../vue/technology-selection/sdk-project)
- [Electron + Vue 3 技术选型](../vue/technology-selection/electron-vue3-technology-selection)

---

## 🎯 面试知识

> 来源：`interview/`

### 初级 [P4-P5]

- [Vue 3 入门：模板、组件、生命周期](/interview/junior/vue-basics)
- [Vue 组件模式：Props、Emit、Slots](/interview/junior/vue-component-patterns)

### 中级 [P5-P6]

- [Vue 3 生命周期深入](/interview/intermediate/vue-lifecycle)
- [Vue 组件通信方式全景](/interview/intermediate/vue-communication)
- [Vue Router 路由实战](/interview/intermediate/vue-router-basics)

### 高级 [P6-P7/P8]

- [Vue 响应式系统底层](/interview/vue/reactivity-deep)
- [Vue 编译器优化](/interview/vue/compiler-optimization)
- [Vapor Mode 原理](/interview/vue/vapor-mode)
- [渲染器 Patch 流程与 Diff 算法](/interview/vue/renderer-patch-flow)
- [Vue 3.5+ 新特性与响应式重构](/interview/vue/vue-3.5-new-features)
- [Pinia 状态管理原理与实战](/interview/vue/pinia-deep)
- [Vue Router 4 路由系统深度](/interview/vue/vue-router-4)
- [Nuxt 3 全栈框架原理与实战](/interview/vue/nuxt-3-fullstack)
- [Vue 3 生态实战模式](/interview/vue/vue-ecosystem-patterns)

---

## 🔗 跨框架对比

以下文档涉及 Vue 与其他框架的横向对比：

- [跨框架研发思维对比](../thinking/cross-framework-thinking-comparison) - Vue·React·Flutter 三层分离、不必要渲染元凶、底层万用公式
- [数据·算法·显示 三者分离（通用）](../thinking/frontend-data-algorithm-view-separation)
- [React 19 vs Vue 3 vs Flutter 复杂业务性能对决](../thinking/framework-performance-comparison)
