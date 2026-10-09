---
tags: ['React', '架构', '面试', '汇总']
---

# React 文档汇总

> React 19 相关的全部文档入口汇总，覆盖架构设计、原理深入、面试知识体系。

---

## 📐 架构文档

> 来源：`architecture-document/react/`

### 组件设计模式

- [React 组件设计模式](../react/component-patterns/react-component-design-patterns) - 容器/展示、HOC、复合组件、受控/非受控等模式
- [Error Boundary 与错误恢复](../react/component-patterns/error-boundary-and-suspense) - 三层错误边界、Suspense 协同、错误上报与自动恢复

### Hooks 架构模式

- [React Hooks 架构模式](../react/hooks-patterns/react-hooks-architecture) - 自定义 Hook 设计原则、分层体系、副作用管理
- [数据·算法·显示 三者分离](../react/hooks-patterns/data-algorithm-view-separation) - React Query + useMemo + JSX 的三层分离与 RSC 架构拓展
- [React Ref 完全指南](../react/hooks-patterns/react-ref-complete-guide) - useRef/forwardRef/useImperativeHandle/Callback Ref 全用法
- [React Context 深度专题](../react/hooks-patterns/react-context-deep-dive) - Context 性能陷阱、拆分策略、精确订阅与状态管理边界

### 状态管理架构

- [React 状态管理架构](../react/state-management/react-state-management-architecture) - 状态分类、Zustand/Redux Toolkit/Jotai 选型与工程化实践

### 路由架构

- [React Router v6+ 路由架构](../react/routing/react-router-architecture) - 路由模式、loader/action 数据流、守卫、代码分割

### 性能思考

- [大型单例对象高性能消费](../react/performance/large-object-consumption)
- [React 性能优化系统手册](../react/performance/react-performance-optimization) - memo/useMemo/代码分割/虚拟列表/Profiler 诊断全维度

### 研发思维

- [不必要 Re-render 的元凶与根治](../react/thinking/unnecessary-rerender-root-cause) - React 卡顿元凶：不必要 Re-render 的五大病灶与根治方案
- [Fiber × 并发调度 × 数据视图同步](../react/thinking/fiber-concurrent-sync-formula) - React 底层万用公式：Fiber 架构、并发调度、数据视图同步
- [大型深层对象的 zustand+selector+Immer 分频治理](../react/thinking/deep-object-frequency-governance-cn) - zustand 外部 Store + selector 精确订阅 + Immer 不可变更新

### 原理说明

- [useEffect 原理](../react/principle/use-effect) - 同步机制与 Fiber 源码深度解析
- [Hooks 执行阶段：Render vs Commit](../react/principle/hooks-phase-timing) - 各 Hook 在渲染管线中的执行位点、三种 Effect 时序对比
- [Fiber Node 数据结构精讲](../react/principle/fiber-node-data-structure) - Fiber 节点完整字段解析、链表遍历、双缓冲、Hooks 链表
- [React 事件系统](../react/principle/react-event-system) - 合成事件、事件委托、冒泡捕获、闭包陷阱、Portal 事件行为

### 技术选型

- [App 项目](../react/technology-selection/app-project)
- [后端项目](../react/technology-selection/backend-project)
- [客户端项目](../react/technology-selection/client-project)
- [桌面端项目](../react/technology-selection/desktop-project)
- [Electron + React 技术选型](../react/technology-selection/electron-react-technology-selection)

---

## 🎯 面试知识

> 来源：`interview/`

### 中级 [P5-P6]

- [React 入门：JSX、Hooks、组件模式](/interview/intermediate/react-basics)

### 高级 [P6-P7/P8]

- [Fiber 架构与优先级调度](/interview/react/fiber-architecture)
- [并发渲染与 Suspense](/interview/react/concurrent-rendering)
- [React Server Components 原理](/interview/react/server-components)
- [状态管理本质与有限状态机](/interview/react/state-machine)
- [React 19 新特性深度解析](/interview/react/react-19-features)
- [React Compiler 原理与实践](/interview/react/react-compiler)
- [Zustand/Jotai 状态管理深度](/interview/react/zustand-and-jotai)
- [TanStack Query 数据获取与缓存](/interview/react/tanstack-query)
- [Next.js 15 全栈框架原理](/interview/react/nextjs-15)
- [React Hook Form + Zod 表单体系](/interview/react/react-hook-form-and-zod)
- [Testing Library + MSW 测试体系](/interview/react/react-testing-library)
- [React 生态架构模式](/interview/react/react-architecture-patterns)

---

## 🔗 跨框架对比

以下文档涉及 React 与其他框架的横向对比：

- [跨框架研发思维对比](../thinking/cross-framework-thinking-comparison) - Vue·React·Flutter 三层分离、不必要渲染元凶、底层万用公式
- [数据·算法·显示 三者分离（通用）](../thinking/frontend-data-algorithm-view-separation)
- [React 19 vs Vue 3 vs Flutter 复杂业务性能对决](../thinking/framework-performance-comparison)
- [Signals vs Virtual DOM](/interview/framework-comparison/signal-vs-vdom)
- [SSR/SSG/ISR 全栈方案对比](/interview/framework-comparison/ssr-fullstack-comparison)
- [2026 元框架趋势](/interview/framework-comparison/meta-framework-trends)
