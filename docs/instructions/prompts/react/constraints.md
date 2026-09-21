---
title: React 提示词约束
---

# React 提示词约束

> 本文件作为 React 提示词的**基础上下文**，由 AI 助手在回答前自动读取。包含所有 React 提示词共享的技术约束和编码约定。

---

## 版本基线

- **React 19** + **TypeScript 5.5+**
- 函数组件 + Hooks，禁止 class 组件
- 默认启用 React Compiler（`babel-plugin-react-compiler`）
- **禁止手动写** `useMemo` / `useCallback`（Compiler 自动处理）
- **禁止使用** `forwardRef` / `defaultProps` / `propTypes`

## Props 规范

- 使用 `interface Props {}` 定义类型
- 默认值使用**解构默认参数**：`function Comp({ size = 'md' }: Props)`
- ref 作为普通 prop 接收（React 19 内置，无需 forwardRef）
- 透传原生属性使用 `React.ComponentProps<'div'>` 或 `HTMLAttributes<T>`

## Custom Hook 规范

- 命名 `use[功能名]`，返回解构友好对象 `{ data, loading, error, refresh }`
- 副作用在 cleanup 中释放，避免内存泄漏
- 异步操作包含 loading / error / AbortController 竞态取消
- 参数支持 options 对象扩展：`useXxx(params, { debounce: 300 })`
- StrictMode 下 effect 执行两次，Hook 需保证幂等

## 类型定义

- 组件配套 `types.ts` 独立声明导出类型
- Props / State / API Response 类型集中定义

## 样式规范

- 优先 CSS Modules 或 Tailwind
- 主题切换：CSS 变量 + `next-themes` / ThemeProvider
- React 19 样式优先级：`<link rel="stylesheet" precedence="high" href="...">`
- 组件内 `<style href="..." precedence="...">{css}</style>` 自动去重

## 状态管理

- Zustand 优先：`create<StoreState>()(devtools(persist(...)))`
- 细粒度 selector + `useShallow` 防重渲染
- 持久化 `persist` 中间件 + `partialize` 精确挑选

## 路由与权限

- React Router v7 / Next.js App Router
- 权限：`<Permission>` 组件或 `usePermission` Hook
- 路由守卫：loader + redirect / middleware.ts
- 懒加载：`React.lazy` + `<Suspense>`

## 性能优化

- React Compiler 自动优化，启用后禁止手动 memo
- 紧急/非紧急更新：`useTransition` / `useDeferredValue`
- 大列表虚拟滚动：`@tanstack/react-virtual`
- 状态下沉到叶子组件，Context 拆分为 State / Dispatch
- Suspense 声明式处理数据请求
- Server Components 下沉纯展示和数据获取

## 代码组织

- 组件文件不超过 300 行，超出按以下架构拆解：
  - Container（数据获取 + 状态协调）
  - Presentational（纯 UI，接收 props）
  - Custom Hooks（业务逻辑 `useXxx`）
  - 子组件目录（独立 UI 片段）
  - utils（纯函数，不依赖 React）
  - types.ts（类型集中定义）
- 一个 effect = 一个副作用意图，避免大杂烩
- 跨层级用 Context，全局状态用 Zustand

## 输出要求

- 提供完整可运行的代码，包含必要的 import
- 包含 TypeScript 类型定义
- 提供基础使用示例
