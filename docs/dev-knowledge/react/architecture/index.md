---
title: React 架构设计
---

# React 架构设计

React 架构设计与面试知识库，涵盖组件模式、Hooks 架构、状态管理、并发渲染、底层原理。

## 架构设计

### 组件设计模式

| 文档                                                                          | 说明                     |
| ----------------------------------------------------------------------------- | ------------------------ |
| [React 组件设计模式](./component-patterns/react-component-design-patterns)    | 组件设计范式总览         |
| [Error Boundary 与错误恢复](./component-patterns/error-boundary-and-suspense) | 错误边界与 Suspense 恢复 |

### Hooks 架构模式

| 文档                                                                       | 说明                   |
| -------------------------------------------------------------------------- | ---------------------- |
| [React Hooks 架构模式](./hooks-patterns/react-hooks-architecture)          | Hooks 架构范式总览     |
| [数据·算法·显示 三者分离](./hooks-patterns/data-algorithm-view-separation) | 核心研发思维：三者分离 |
| [React Ref 完全指南](./hooks-patterns/react-ref-complete-guide)            | Ref 完全指南           |
| [React Context 深度专题](./hooks-patterns/react-context-deep-dive)         | Context 深度专题       |

### 独立文档

| 文档                                                                   | 说明             |
| ---------------------------------------------------------------------- | ---------------- |
| [状态管理架构](./state-management/react-state-management-architecture) | 状态管理架构设计 |
| [React Router v6+ 路由架构](./routing/react-router-architecture)       | 路由架构设计     |

### 性能思考

| 文档                                                                   | 说明                 |
| ---------------------------------------------------------------------- | -------------------- |
| [大型单例对象高性能消费](./performance/large-object-consumption)       | 大对象高性能消费方案 |
| [React 性能优化系统手册](./performance/react-performance-optimization) | 性能优化完整手册     |

### 研发思维

| 文档                                                                                          | 说明                     |
| --------------------------------------------------------------------------------------------- | ------------------------ |
| [不必要 Re-render 的元凶与根治](./thinking/unnecessary-rerender-root-cause)                   | 不必要渲染根因分析与治理 |
| [Fiber × 并发调度 × 数据视图同步](./thinking/fiber-concurrent-sync-formula)                   | Fiber 调度与数据同步公式 |
| [大型深层对象的 zustand+selector+Immer 分频治理](./thinking/deep-object-frequency-governance) | 大对象分频治理策略       |

### 底层原理拆解

| 文档                                                                        | 说明                   |
| --------------------------------------------------------------------------- | ---------------------- |
| [useEffect 原理](./typical-analysis/use-effect)                             | useEffect 底层实现     |
| [Hooks 执行阶段：Render vs Commit](./typical-analysis/hooks-phase-timing)   | Hooks 阶段时序解析     |
| [Fiber Node 数据结构精讲](./typical-analysis/fiber-node-data-structure)     | Fiber Node 数据结构    |
| [React 事件系统](./typical-analysis/react-event-system)                     | 事件系统底层实现       |
| [Fiber 架构与并发模式原理](./typical-analysis/react-fiber-architecture)     | Fiber 架构与并发模式   |
| [Hooks 闭包陷阱与依赖追踪原理](./typical-analysis/react-hooks-closure-trap) | 闭包陷阱与依赖追踪     |
| [Context 底层原理与性能陷阱](./typical-analysis/react-context-internals)    | Context 底层与性能陷阱 |

### 技术选型

| 文档                                                               | 说明                      |
| ------------------------------------------------------------------ | ------------------------- |
| [App 项目](./technology-selection/app-project)                     | React App 项目技术选型    |
| [后端项目](./technology-selection/backend-project)                 | React 后端项目技术选型    |
| [客户端项目](./technology-selection/client-project)                | React 客户端项目技术选型  |
| [桌面端项目](./technology-selection/desktop-project)               | React 桌面端项目技术选型  |
| [Electron + React 技术选型](./technology-selection/electron-react) | Electron + React 选型实践 |

---

## 面试知识库

### 中级 [P5-P6]

| 文档                                                                       | 说明           |
| -------------------------------------------------------------------------- | -------------- |
| [React 入门：JSX、Hooks、组件模式](../interview/intermediate/react-basics) | React 基础入门 |

### 高级 [P6-P7/P8]

| 文档                                                                            | 说明                    |
| ------------------------------------------------------------------------------- | ----------------------- |
| [Fiber 架构与优先级调度](../interview/advanced/fiber-architecture)              | Fiber 架构与调度原理    |
| [并发渲染与 Suspense](../interview/advanced/concurrent-rendering)               | 并发渲染与 Suspense     |
| [React Server Components 原理](../interview/advanced/server-components)         | Server Components 原理  |
| [状态管理本质与有限状态机](../interview/advanced/state-machine)                 | 状态管理本质与状态机    |
| [React 19 新特性深度解析](../interview/advanced/react-19-features)              | React 19 新特性         |
| [React Compiler 原理与实践](../interview/advanced/react-compiler)               | React Compiler 原理     |
| [Zustand/Jotai 状态管理深度](../interview/advanced/zustand-and-jotai)           | Zustand/Jotai 深度      |
| [TanStack Query 数据获取与缓存](../interview/advanced/tanstack-query)           | TanStack Query 数据获取 |
| [Next.js 15 全栈框架原理](../interview/advanced/nextjs-15)                      | Next.js 15 全栈框架     |
| [React Hook Form + Zod 表单体系](../interview/advanced/react-hook-form-and-zod) | 表单验证体系            |
| [Testing Library + MSW 测试体系](../interview/advanced/react-testing-library)   | 测试体系实战            |
| [React 生态架构模式](../interview/advanced/react-architecture-patterns)         | 生态架构模式            |
