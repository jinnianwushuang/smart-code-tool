---
title: '技术名词深度解析索引（入口）'
tags: ['思维']
---

# 技术名词深度解析索引

> 深入理解一个技术名词的命名与特性，对理解相关技术栈非常有帮助。
> 本索引将核心名词按领域分类，链接到各技术目录中的深度解析文档，方便跨框架对比反思。

---

## 响应式与状态

| 名词                                 | 简述                                         | 深度解析                                                                                                                                                       |
| ------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **响应式系统 (Reactive System)**     | Proxy + track/trigger，数据变化自动触发更新  | 📖 [响应式系统核心原理](../typical-analysis/reactive-system.md)                                                                                                |
| **依赖收集 (Dependency Collection)** | 读取时记录"谁在用我"，变化时精准通知         | 📖 [响应式系统 — 依赖收集](../typical-analysis/reactive-system.md)                                                                                             |
| **Proxy**                            | ES6 代理对象，Vue 3 响应式的底层拦截器       | 📖 [响应式系统 — Proxy 实现](../typical-analysis/reactive-system.md)                                                                                           |
| **Signal**                           | 细粒度响应式原语，Angular/Solid/Preact 采用  | 📖 [Signal 细粒度响应式](../general-knowledge/signal-reactivity.md)                                                                                            |
| **Computed / 计算属性**              | 惰性求值 + 缓存，只在依赖变化时重算          | 📖 [响应式系统 — computed](../typical-analysis/reactive-system.md)                                                                                             |
| **Watch / 侦听器**                   | 监听数据变化执行副作用（DOM 操作、网络请求） | 📖 [响应式系统 — watch](../typical-analysis/reactive-system.md)                                                                                                |
| **状态管理 (State Management)**      | 集中管理应用状态：Vuex/Pinia、Redux/Zustand  | 📖 [Vue 状态管理](../vue/standardized-template-cn/state-management-cn.md) · [React 状态管理](../react/state-management/react-state-management-architecture.md) |

---

## 渲染与更新

| 名词                           | 简述                                          | 深度解析                                                                                                                                                                                                  |
| ------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **虚拟 DOM (Virtual DOM)**     | 用 JS 对象描述 DOM 树，Diff 后最小化更新      | 📖 [虚拟 DOM Diff 算法](../typical-analysis/virtual-dom-diff.md)                                                                                                                                          |
| **Diff 算法**                  | 同层比较 + key 优化，找出最小变更集           | 📖 [Diff 算法拆解](../typical-analysis/virtual-dom-diff.md)                                                                                                                                               |
| **Fiber**                      | React 的增量渲染架构，可中断的协程式调度      | 📖 [Fiber × 并发调度公式](../react/thinking/fiber-concurrent-sync-formula.md) · [Fiber Node 数据结构](../react/principle/fiber-node-data-structure.md)                                                    |
| **节点数据结构**               | 各框架渲染树的核心节点数据结构与树形组织方式  | 📖 [React Fiber Node](../react/principle/fiber-node-data-structure.md) · [Vue VNode](../vue/thinking/vnode-data-structure.md) · [Flutter 三棵树](../flutter/thinking/element-widget-renderobject-tree.md) |
| **渲染管线 (Render Pipeline)** | 数据变化 → 虚拟 DOM → Diff → Patch → 像素上屏 | 📖 [Vue 渲染调度公式](../vue/thinking/rendering-scheduling-sync-formula.md) · [Flutter 帧调度](../flutter/thinking/widget-frame-sync-formula.md)                                                          |
| **渲染模式**                   | CSR / SSR / SSG / ISR / Streaming SSR / RSC   | 📖 [前端渲染模式全解](../general-knowledge/frontend-rendering-modes.md)                                                                                                                                   |
| **Re-render / 重渲染**         | 组件函数重新执行，生成新的虚拟 DOM            | 📖 [React 不必要 Re-render 元凶](../react/thinking/unnecessary-rerender-root-cause.md) · [Vue 无效渲染元凶](../vue/thinking/render-chaos-root-cause.md)                                                   |
| **Reconciliation / 协调**      | React 将新旧虚拟 DOM 对比的过程               | 📖 [Diff 算法拆解](../typical-analysis/virtual-dom-diff.md)                                                                                                                                               |
| **Patch**                      | Vue 将 Diff 结果应用到真实 DOM 的操作         | 📖 [渲染调度公式](../vue/thinking/rendering-scheduling-sync-formula.md)                                                                                                                                   |

---

## JavaScript 核心

| 名词                         | 简述                                         | 深度解析                                                                                                                               |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **原型链 (Prototype Chain)** | 对象通过 `__proto__` 链式查找属性和方法      | 📖 [原型链与继承拆解](../typical-analysis/prototype-chain-and-inheritance.md)                                                          |
| **闭包 (Closure)**           | 函数记住并访问其词法作用域中的变量           | 📖 [原型链 — 闭包应用](../typical-analysis/prototype-chain-and-inheritance.md)                                                         |
| **Event Loop**               | 浏览器/Node.js 的事件循环调度机制            | 📖 [浏览器 JS 调度](../typical-analysis/browser-js-scheduling.md) · [Node.js 事件调度](../typical-analysis/nodejs-event-scheduling.md) |
| **Promise**                  | 异步编程的容器对象，链式调用解决回调地狱     | 📖 [Promise/A+ 手写实现](../typical-analysis/promise-implementation.md)                                                                |
| **async/await**              | Promise 的语法糖，让异步代码看起来像同步     | 📖 [Promise 实现](../typical-analysis/promise-implementation.md)                                                                       |
| **TypeScript 类型系统**      | 结构化类型 + 泛型 + 条件类型的编译时类型推导 | 📖 [TS 类型拆解](../typical-analysis/typescript-type-analysis.md)                                                                      |
| **深拷贝 (Deep Clone)**      | 递归复制对象所有层级，处理循环引用等边界     | 📖 [深拷贝全场景拆解](../typical-analysis/deep-clone.md)                                                                               |

---

## 框架核心概念

| 名词                    | 简述                                    | 深度解析                                                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **组件设计模式**        | 容器/展示、复合组件、HOC、Composable 等 | 📖 [Vue 组件模式](../vue/standardized-template-cn/vue-component-design-patterns.md) · [React 组件模式](../react/component-patterns/react-component-design-patterns.md) · [Flutter 组件模式](../flutter/thinking/flutter-component-design-patterns.md)                           |
| **数据·算法·显示 分离** | 接口原始数据 → 算法处理 → 界面显示数据  | 📖 [前端三层分离](../thinking/frontend-data-algorithm-view-separation.md) · [Vue](../vue/thinking/data-algorithm-view-separation-cn.md) · [React](../react/hooks-patterns/data-algorithm-view-separation.md) · [Flutter](../flutter/thinking/data-algorithm-view-separation.md) |
| **Hooks / Composable**  | 封装可复用逻辑的函数式抽象              | 📖 [React Hooks 架构](../react/hooks-patterns/react-hooks-architecture.md)                                                                                                                                                                                                      |
| **依赖注入 (DI)**       | IoC 容器管理依赖关系，解耦组件通信      | 📖 [NestJS DI](../nodejs/project-architecture/nodejs-project-architecture.md)                                                                                                                                                                                                   |
| **中间件 (Middleware)** | 请求/响应处理链，洋葱模型               | 📖 [Node.js 中间件模式](../nodejs/middleware-patterns/nodejs-middleware-patterns.md)                                                                                                                                                                                            |
| **前端路由**            | Hash/History 模式实现 SPA 页面切换      | 📖 [前端路由实现拆解](../typical-analysis/frontend-router.md)                                                                                                                                                                                                                   |
| **shallowRef 范式**     | 跳过深层响应式追踪，手动控制更新粒度    | 📖 [shallowRef 高性能范式](../vue/thinking/shallowRef-paradigm-high-performance.md)                                                                                                                                                                                             |

---

## 构建工具

| 名词                             | 简述                                                 | 深度解析                                                                   |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| **Tree Shaking**                 | 基于 ESM 静态分析，移除未使用的导出代码              | 📖 [构建优化核心概念](../general-knowledge/build-optimization-concepts.md) |
| **HMR (Hot Module Replacement)** | 修改代码不刷新页面，模块级别热更新                   | 📖 [构建优化核心概念](../general-knowledge/build-optimization-concepts.md) |
| **依赖预构建**                   | 将 CJS/UMD 依赖转换为 ESM，减少浏览器请求            | 📖 [构建优化核心概念](../general-knowledge/build-optimization-concepts.md) |
| **代码分割 (Code Splitting)**    | 按路由/组件拆分产物，按需加载                        | 📖 [构建优化核心概念](../general-knowledge/build-optimization-concepts.md) |
| **Rolldown**                     | Vite 8 底层 Rust 打包引擎，统一替代 esbuild + Rollup | 📖 [Rolldown 与 Oxc](../general-knowledge/rolldown-and-oxc.md)             |
| **Oxc**                          | Rust 实现的 JS 工具链：解析/转换/压缩/Lint           | 📖 [Rolldown 与 Oxc](../general-knowledge/rolldown-and-oxc.md)             |

---

## 网络与浏览器

| 名词                     | 简述                                     | 深度解析                                                                  |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| **TCP/IP**               | 互联网基础协议栈，三次握手/四次挥手      | 📖 [网络通用知识](../general-knowledge/network-fundamentals.md)           |
| **HTTP/HTTPS**           | 超文本传输协议，TLS 加密的安全版本       | 📖 [网络通用知识](../general-knowledge/network-fundamentals.md)           |
| **CORS**                 | 跨域资源共享机制，浏览器安全策略         | 📖 [网络通用知识](../general-knowledge/network-fundamentals.md)           |
| **Event Loop (浏览器)**  | 宏任务/微任务调度，requestAnimationFrame | 📖 [浏览器 JS 调度拆解](../typical-analysis/browser-js-scheduling.md)     |
| **Event Loop (Node.js)** | libuv 事件循环，6 个阶段的调度           | 📖 [Node.js 事件调度拆解](../typical-analysis/nodejs-event-scheduling.md) |

---

## 设计模式与架构

| 名词           | 简述                                   | 深度解析                                                                         |
| -------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| **观察者模式** | 一对多依赖，状态变化自动通知所有观察者 | 📖 [行为型模式](../design-patterns/behavioral.md)                                |
| **单例模式**   | 全局唯一实例，如连接池、配置管理器     | 📖 [创建型模式](../design-patterns/creational.md)                                |
| **策略模式**   | 定义一系列算法，运行时可互换           | 📖 [行为型模式](../design-patterns/behavioral.md)                                |
| **代理模式**   | 通过代理对象控制对真实对象的访问       | 📖 [结构型模式](../design-patterns/structural.md)                                |
| **适配器模式** | 将一个接口转换为另一个接口             | 📖 [结构型模式](../design-patterns/structural.md)                                |
| **装饰器模式** | 动态给对象添加额外功能                 | 📖 [结构型模式](../design-patterns/structural.md)                                |
| **Monorepo**   | 多项目放在同一仓库，共享代码无需发布   | 📖 [包管理与 Monorepo 工具链](../engineering/job/npm-pnpm-monorepo-toolchain.md) |

---

## 跨框架对比速查

> 同一概念在不同框架中的命名与实现差异，点击可快速跳转对比。

| 概念                   | Vue                                                                                     | React                                                                              | Flutter                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **数据·算法·显示分离** | [Composition API 三层分离](../vue/thinking/data-algorithm-view-separation-cn.md)        | [Hooks 三层分离](../react/hooks-patterns/data-algorithm-view-separation.md)        | [BLoC 三层分离](../flutter/thinking/data-algorithm-view-separation.md)                        |
| **不必要渲染元凶**     | [无效渲染根治](../vue/thinking/render-chaos-root-cause.md)                              | [Re-render 根治](../react/thinking/unnecessary-rerender-root-cause.md)             | [Widget 重建失控](../flutter/thinking/setstate-rebuild-chaos-root-cause.md)                   |
| **底层调度公式**       | [渲染 × 事件 × 数据视图](../vue/thinking/rendering-scheduling-sync-formula.md)          | [Fiber × 并发 × 数据视图](../react/thinking/fiber-concurrent-sync-formula.md)      | [Widget × 帧调度 × 三层对象](../flutter/thinking/widget-frame-sync-formula.md)                |
| **节点数据结构**       | [VNode 数据结构精讲](../vue/thinking/vnode-data-structure.md)                           | [Fiber Node 数据结构精讲](../react/principle/fiber-node-data-structure.md)         | [Widget·Element·RenderObject 三棵树](../flutter/thinking/element-widget-renderobject-tree.md) |
| **深层对象治理**       | [按频率分频治理](../vue/thinking/deep-object-frequency-governance-cn.md)                | [zustand+selector+Immer](../react/thinking/deep-object-frequency-governance-cn.md) | —                                                                                             |
| **组件设计模式**       | [Composable + 装配器](../vue/standardized-template-cn/vue-component-design-patterns.md) | [HOC + 复合组件](../react/component-patterns/react-component-design-patterns.md)   | [InheritedWidget + BLoC](../flutter/thinking/flutter-component-design-patterns.md)            |
| **运行时性能对决**     | [React 19 vs Vue 3 内存/CPU/更新/延迟全维度对比](./react19-vs-vue3-performance.md)      | ← 同左                                                                             | —                                                                                             |

---

> 💡 **使用建议**：遇到不确定的名词，先在本页找到分类和一句话定义，再跳转到对应深度解析文档深入理解。跨框架对比速查表适合在切换技术栈时快速对照。
