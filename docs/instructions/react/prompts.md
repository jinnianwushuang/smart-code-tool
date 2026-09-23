---
title: React 提示词集
---

# React 提示词集

面向 React 19 开发场景的 AI 提示词集合。每个 Prompt 用代码块包裹，**复制后替换 `[方括号]` 内容即可直接使用**。

> 版本基线：**React 19 + TypeScript 5.5+**。默认启用 React Compiler（`babel-plugin-react-compiler`）与 Actions 新范式，不再手动写 `useMemo` / `useCallback` / `forwardRef` / `propTypes`。

---

## B. React 组件开发（日常高频）

## RB1. 新建基础组件

> 适用：创建一个标准 React 19 组件，含完整 TS 类型定义

```text
请先阅读 ./constraints.md 作为基础上下文。
编写 [组件名] 组件，技术栈：[UI 库] + [样式方案]。
功能：
1. [功能点1，如：受控与非受控双模式输入]
2. [功能点2，如：点击外部自动关闭]
```

---

## RB2. 新建表单组件（Actions 范式）

> 适用：React 19 表单，使用 Actions + useActionState + useOptimistic

```text
请先阅读 ./constraints.md 作为基础上下文。
编写 [表单名] 表单组件，使用 [react-hook-form / Formik / 原生 FormData]。
字段：
1. [字段1] - [校验规则]
2. [字段2] - [校验规则]
联动逻辑：当 [条件] 时，显示/隐藏 [目标字段]
使用 `<form action>` + useActionState + useFormStatus 新范式。
```

---

## RB3. 新建列表/表格组件

> 适用：带分页、搜索、排序的数据列表

```text
请先阅读 ./constraints.md 作为基础上下文。
封装 [业务名] 高级搜索列表组件，使用 [Ant Design Table / TanStack Table]。
搜索栏：[N] 个筛选条件，支持展开/收起。
表格列：序号、[字段]、状态标签、操作列。
含 useTable Hook、useTransition、Suspense 骨架屏、ErrorBoundary。
```

---

## RB4. 新建弹窗/对话框组件

> 适用：可复用弹窗，支持 Portal、焦点管理、Esc 关闭

```text
请先阅读 ./constraints.md 作为基础上下文。
封装通用 [弹窗类型] 弹窗组件，使用 [Radix / shadcn / Ant Design]。
受控+非受控双模式、Portal 渲染、焦点管理、Esc/遮罩关闭、loading 防重复、ref 暴露方法。
[可选] fullscreen + 无障碍。
```

---

## RB5. 组件大文件拆解

> 适用：将超过 300 行的大组件拆分为模块化架构（React Compiler 友好）

```text
请先阅读 ./constraints.md 作为基础上下文。
组件超过 [N] 行，职责：[描述]，问题：[如：JSX 太长 / useEffect 依赖地狱]。
按 Container + Presentational + Custom Hooks + 子组件 + utils + types.ts 架构拆解。
```

---

## RB6. 组件性能优化

> 适用：解决渲染卡顿、瀑布请求、大列表性能问题

```text
请先阅读 ./constraints.md 作为基础上下文。
组件存在性能问题：[如：大列表卡顿 / 输入延迟 / 子组件重渲染]。
当前代码：
[粘贴代码]
React Compiler：[是/否]
请排查并给出优化方案。
```

---

## RB7. Custom Hook 提取

> 适用：从组件中提取可复用逻辑为 useXxx 函数

```text
请先阅读 ./constraints.md 作为基础上下文。
将组件中 [需要提取的逻辑] 提取为 Custom Hook。
组件功能：[描述功能]
```

---

## RB8. 样式与主题适配

> 适用：CSS Modules / Tailwind / 组件库样式覆盖 + 亮暗主题

```text
请先阅读 ./constraints.md 作为基础上下文。
样式方案：[CSS Modules / Tailwind]，目标：[样式变化]，问题：[当前问题]。
给出样式隔离、CSS 变量主题方案、组件库覆盖方式和 React 19 precedence 样式优先级。
```

---

## C. React 生态与架构

## RC1. 状态管理（Zustand / Redux Toolkit / Jotai）

> 适用：设计全局状态管理模块

```text
请先阅读 ./constraints.md 作为基础上下文。
设计 [Zustand / Redux Toolkit / Jotai] store 管理 [业务模块]。
State：[字段列表]，Actions：[异步请求]，Selectors：[细粒度选择器]，持久化：[指定字段]。
```

---

## RC2. 路由与权限

> 适用：动态路由 + 按钮权限 + 面包屑（React Router v7 / Next.js App Router）

```text
请先阅读 ./constraints.md 作为基础上下文。
实现 RBAC 权限方案，使用 [React Router v7 / Next.js App Router]。
含动态路由、Permission 组件/Hook、面包屑、路由守卫、懒加载、错误页面。
```

---

## RC3. ECharts 可视化封装

> 适用：封装通用图表组件

```text
请先阅读 ./constraints.md 作为基础上下文。
封装通用 `<BaseChart />` 组件，支持 [图表类型]。
ref as prop 暴露方法、ResizeObserver 自适应、dispose 防泄漏、SSR 兼容。
```

---

## RC4. H5 移动端适配

> 适用：移动端列表、下拉刷新、图片懒加载

```text
请先阅读 ./constraints.md 作为基础上下文。
开发 H5 端 [业务名] 滚动列表，使用 [Vant / Ant Design Mobile]。
含 IntersectionObserver 触底加载、下拉刷新、图片懒加载、虚拟滚动、vw 适配、iOS 兼容。
```

---

## D. React 19 新特性专属

## RD1. Server Components（RSC）设计

> 适用：Next.js App Router / React Router v7 framework mode 下的服务端组件

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 Server Components 设计 [功能名] 模块。
给出 Server/Client 边界划分、数据获取、Server Actions、Suspense 流式渲染、SEO 元数据、缓存策略。
```

---

## RD2. `use()` API 与 Suspense 数据流

> 适用：以声明式方式消费 Promise 和 Context

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 `use()` API 重构以下数据消费代码：
[粘贴旧代码]
给出重构后组件、Suspense 边界布局、Promise 缓存方案。
```

---

## RD3. Actions + useActionState + useOptimistic

> 适用：React 19 表单与异步交互新范式

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 Actions 范式实现 [场景，如：评论提交 / 点赞] 功能。
含 useActionState + useFormStatus + useOptimistic 乐观更新、`<form action>` 替代 onSubmit。
```

---

## RD4. Document Metadata 与资源预加载

> 适用：SEO 元数据、字体、样式表、脚本预加载

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 React 19 原生能力实现 [场景，如：文章页 SEO / 首屏字体优化]。
含原生 `<title>`/`<meta>`、样式表 precedence、preload/prefetchDNS 资源预加载。
```

---

## RD5. Ref 清理函数与 useImperativeHandle

> 适用：React 19 ref callback 新语义 + 暴露组件方法

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 React 19 ref 新特性实现 [场景，如：DOM 测量 / 焦点管理 / 暴露子组件方法]。
含 ref as prop、ref callback cleanup、useImperativeHandle。
```

---

## RD6. ErrorBoundary 与错误报告

> 适用：React 19 新错误处理机制

```text
请先阅读 ./constraints.md 作为基础上下文。
搭建 [项目名] 的错误边界与上报体系。
含分层 ErrorBoundary、React 19 错误回调、Fallback UI、Sentry 上报、开发/生产差异化。
```

---

## E. JavaScript 通用

## RE1. 复杂数据结构处理

> 适用：数组/对象转换、统计、过滤、树结构

```text
请先阅读 ./constraints.md 作为基础上下文。
数据：[粘贴或描述结构]
转换：过滤 [条件] → 转换 [如：列表转树] → 统计 [字段] 的总和/平均值。
要求纯函数，含边界处理。
```

---

## RE2. 异步流程控制

> 适用：并发请求、串行请求、超时、竞态处理

```text
请先阅读 ./constraints.md 作为基础上下文。
场景：[如：并发 5 个接口 / 串行请求 / 搜索防竞态]。
要求：async/await + AbortController 竞态 + AbortSignal.timeout + [并发限制]。
```

---

## RE3. 工具函数封装

> 适用：防抖节流、深拷贝、日期格式化等通用工具

```text
请先阅读 ./constraints.md 作为基础上下文。
封装 [功能名] 工具函数，优先使用现代 API（structuredClone / Intl），含完整 TS 类型和测试用例。
```

---

## RE4. DOM 操作与原生交互

> 适用：不依赖框架的原生 JS 实现

```text
请先阅读 ./constraints.md 作为基础上下文。
原生 JS 实现 [功能名]，使用最新 DOM API，集成防抖/节流，Shadow DOM 样式隔离，含 init/destroy。
```

---

## F. Web/H5 应用

## RF1. H5 无限滚动列表

> 适用：移动端商品列表、信息流

```text
请先阅读 ./constraints.md 作为基础上下文。
开发 H5 端 [业务名] 无限滚动列表，使用 [Vant / Ant Design Mobile]。
含触底加载、下拉刷新、图片懒加载、虚拟滚动、iOS 兼容。
```

---

## RF2. PC 官网响应式页面

> 适用：产品介绍、特性展示等官网页面

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 Next.js 15 + [Tailwind] 开发 [模块名] 响应式页面。
Server Component 优先、Framer Motion 入场动画、语义化 SEO、next/image 优化。
```

---

## RF3. H5 营销活动页

> 适用：倒计时、抢购、报名表等活动页面

```text
请先阅读 ./constraints.md 作为基础上下文。
H5 活动页 [倒计时/报名表] 组件，场景：[描述]。
requestAnimationFrame 精准计时、Actions 乐观更新、埋点预留、vw 适配、SSR 兼容。
```

---

## RF4. 多端适配方案

> 适用：一套代码兼容 H5 和 PC

```text
请先阅读 ./constraints.md 作为基础上下文。
[功能名] 模块同时兼容 H5 和 PC。
给出 useDevice Hook、Media Queries 方案、SSR 设备检测、Pointer Events、动态导入布局。
```

---

## React 19 迁移速查表

从 React 18 及以下迁移到 React 19 时，以下写法需要更新（可作为 Prompt 补充指令）：

```text
请先阅读 ./constraints.md 作为基础上下文。
请按 React 19 迁移规范检查并改写以下代码：
[粘贴旧代码]

迁移清单：
1. ❌ `forwardRef((props, ref) => ...)` → ✅ `function C({ ref, ...props }) { ... }`
2. ❌ `<MyContext.Provider value={...}>` → ✅ `<MyContext value={...}>`
3. ❌ `propTypes` / `defaultProps`（函数组件） → ✅ TS 类型 + 解构默认参数
4. ❌ `useContext(Ctx)` → ✅ `use(Ctx)`（可在条件语句中）
5. ❌ `useEffect + fetch + setState + loading` → ✅ `use(promise)` + `<Suspense>`
6. ❌ `onSubmit={e => { e.preventDefault(); ... }}` → ✅ `<form action={fn}>` + `useActionState`
7. ❌ 手写乐观更新 setState 回滚 → ✅ `useOptimistic`
8. ❌ `react-helmet` → ✅ 原生 `<title>` / `<meta>` 组件
9. ❌ ref callback `return () => {}` 无意义写法 → ✅ 明确 setup/cleanup 语义
10. ❌ `useRef()` 无初值 → ✅ `useRef<T | null>(null)`
11. ❌ 手动 `useMemo` / `useCallback` → ✅ 启用 React Compiler 后删除
12. ❌ `ReactDOM.render` → ✅ `createRoot(...).render(...)`
13. ❌ `unstable_ConcurrentMode` → ✅ `createRoot` 默认并发
14. ❌ 字符串 ref / legacy context / findDOMNode → ✅ 全部移除
```

---

## 提问技巧（React 19 专属）

1. **强制版本**：开头声明「基于 React 19 + TypeScript 5.5+」，避免 AI 输出 forwardRef / defaultProps 等过时写法
2. **说明 Compiler 状态**：明确「已启用 / 未启用 React Compiler」，直接影响是否需要手写 memo
3. **框架上下文**：说明是 [Vite SPA / Next.js App Router / Next.js Pages Router / React Router v7 framework / Remix]，决定是否可用 RSC 与 Server Actions
4. **赋予角色**：「你是一名精通 React 19 与 Server Components 的资深前端工程师」
5. **给例子（Few-Shot）**：贴上项目现有组件风格，让 AI 保持一致
6. **分步思考**：复杂逻辑前加「请先分析实现思路（含 Hook 调用链、状态提升、副作用边界），再生成代码」
