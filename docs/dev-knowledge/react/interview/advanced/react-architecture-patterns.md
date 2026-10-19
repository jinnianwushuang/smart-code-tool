---
title: 'React 生态架构模式 [P8]'
level: 'architect'
tags: ['React', '架构', '项目结构', '状态分层', '代码分割']
difficulty: 'expert'
target: '架构师（P8）'
---

# React 生态架构模式 [P8]

> 大型 React 应用的架构设计是架构师的核心技能。本文探讨项目分层、状态分层、错误边界、代码分割、Monorepo 组织等架构模式。

## 核心概念（What）

### React 架构设计维度

| 维度         | 问题               | 解决方案                       |
| ------------ | ------------------ | ------------------------------ |
| **项目结构** | 如何组织代码？     | Feature-based / Feature-Sliced |
| **状态分层** | 什么状态放哪里？   | Server state vs Client state   |
| **错误边界** | 局部错误不崩溃全局 | ErrorBoundary + Suspense       |
| **代码分割** | 首屏加载优化       | React.lazy + Route-based       |
| **Monorepo** | 多包管理           | Turborepo + 共享包             |

---

## 底层原理（Why）

### 1. Feature-based 架构的依赖反转原则

Feature-based 不是“按功能分文件夹”那么简单，它实现了**依赖反转原则（DIP）**——高层模块不依赖低层模块，两者都依赖抽象。

```
依赖方向对比：

Layer-based（按技术层分）：
  src/components/ → src/hooks/ → src/api/ → src/utils/

  问题：任何组件都可以 import 任何其他组件
  → 依赖关系是“网状”的，无法控制耦合
  → 删除一个功能可能影响多个不相关模块

Feature-based（按功能分）：
  features/auth/ → features/dashboard/ → features/products/

  每个 feature 内部自包含：
  ├── components/  ← 只在本 feature 内使用
  ├── hooks/       ← 只在本 feature 内使用
  ├── api/         ← 只在本 feature 内使用
  └── index.ts     ← 唯一对外暴露的公共 API

依赖规则：
  features 之间不能互相 import
  ├── ❌ import { useAuth } from '../auth/hooks/useAuth'
  └── ✅ 通过 shared/ 或 app/ 层组合

  依赖方向：
  pages/ → features/ → shared/
  ↑            ↑           ↑
  组合层      业务层      基础层

  每层只能向下依赖，不能反向
```

### 2. Error Boundary 的 Fiber 异常捕获链路

Error Boundary 不是 try/catch 的包装，而是 React Fiber 树中的一个**异常冒泡协议**。

```
Error Boundary 捕获链路：

组件 A 抛出错误
  │
  ├── React 在 beginWork(A) 中捕获异常
  ├── 向上遍历 Fiber 树，寻找最近的 Error Boundary Fiber
  │   ├── 检查每个 Fiber 节点的 state 是否有 getDerivedStateFromError
  │   └── 找到 Error Boundary → 停止冒泡
  │
  ├── 调用 getDerivedStateFromError(error) → 更新 state
  ├── 调用 componentDidCatch(error, info) → 副作用（日志上报）
  └── 重新渲染 Error Boundary 的 fallback UI

未捕获的错误：
  └── 没有任何 Error Boundary 捕获 → 整棵组件树卸载
      → React 19 的 createRoot 会调用 onRecoverableError

嵌套 Error Boundary 的恢复策略：
  <ErrorBoundary fallback={<GlobalError />}>
    <ErrorBoundary fallback={<DashboardError />}>
      <Dashboard />
    </ErrorBoundary>
  </ErrorBoundary>

  Dashboard 出错 → 只影响 DashboardError 的 fallback
  → 外层 GlobalError 不受影响
  → 其他兄弟组件正常渲染
```

### 3. React.lazy() 与 Suspense 的代码分割协议

`React.lazy()` 不是简单的 `import()`，它与 Suspense 共享同一套**异步边界协议**。

```
React.lazy() 执行链路：

const Dashboard = lazy(() => import('./Dashboard'))
  │
  ├── 返回一个特殊的 Lazy 组件类型
  ├── 首次渲染时：
  │   ├── 调用 loader 函数 → 返回 Promise
  │   ├── Promise 未 resolve → throw Promise（与 Suspense 协议一致）
  │   └── Suspense 捕获 → 显示 fallback
  │
  ├── Promise resolve 后：
  │   ├── 获得模块对象 { default: DashboardComponent }
  │   ├── 缓存模块引用（下次不再加载）
  │   └── 重新渲染 → 这次 Lazy 组件直接渲染 DashboardComponent
  │
  └── 后续渲染：
      └── 模块已缓存 → 直接渲染，无 Suspense 挂起

代码分割的 Bundle 影响：
  原始 Bundle：app.js (500KB)

  分割后：
  ├── app.js (200KB) ← 入口 + 共享代码
  ├── dashboard.js (150KB) ← 懒加载
  ├── settings.js (100KB) ← 懒加载
  └── vendor.js (50KB) ← 第三方库

  首次加载只需 200KB，路由切换时按需加载其他 Chunk
```

---

## 高频面试题

### Q1: 大型 React 项目如何组织代码结构？

**参考答案要点**：

- Feature-based（按功能分）：每个 feature 独立（components/hooks/api/types）
- shared/ 存放通用资源
- Feature 之间通过 index.ts 暴露公共 API
- 避免 feature 之间直接引用内部实现

### Q2: React 项目中如何分层管理状态？

**参考答案要点**：

- Server State → TanStack Query（缓存 + 后台更新）
- Client State → Zustand/Jotai（全局 UI 状态）
- URL State → React Router（可分享的参数）
- Form State → React Hook Form（表单内部状态）
- 原则：能不放全局就不放全局

### Q3: 如何实现 React 应用的代码分割？

**参考答案要点**：

- Route-based：React.lazy + Suspense（最常用）
- Component-based：大型组件懒加载
- 预加载：hover/focus 时预加载
- Webpack magic comment：`/* webpackChunkName: "xxx" */`
- 目标：首屏 bundle < 200KB

---

## 延伸思考

1. **设计题**：为一个大型 SaaS 平台设计 React 架构（多团队、多模块、共享组件库）。
2. **场景题**：React 应用首屏加载时间 > 3 秒，如何从架构层面优化？
3. **对比题**：Feature-based vs Feature-Sliced vs Clean Architecture，哪种更适合大型项目？

---

## 参考资料

- [React 架构模式](https://www.patterns.dev/react)
- [Feature-Sliced Design](https://feature-sliced.design)
- [State Management Best Practices](https://redux.js.org/usage/migrating-to-modern-redux)
