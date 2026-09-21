# 架构术语表

> 统一术语定义，确保 AI 与使用者理解一致。

## 核心概念

| 术语                 | 含义                                                | 对应文件                               |
| -------------------- | --------------------------------------------------- | -------------------------------------- |
| **页面 Hook**        | 管理整个页面状态和逻辑的自定义 Hook                 | `pages/<页面名>/hooks/use-<页面名>.js` |
| **功能 Hook**        | 封装可复用功能逻辑的 Hook                           | `src/hooks/use-<功能名>.js`            |
| **Server Component** | React 19 默认组件类型，在服务端渲染，可直接获取数据 | `pages/<页面名>/index.jsx`             |
| **Client Component** | 标记 `'use client'` 的组件，可使用 Hook 和事件处理  | 需要交互的组件文件                     |
| **Action**           | React 19 的异步数据变更流程，处理表单提交和乐观更新 | `pages/<页面名>/actions/*.js`          |

## 状态相关

| 术语                  | 含义                                        | 对应文件                   |
| --------------------- | ------------------------------------------- | -------------------------- |
| **组件状态**          | 通过 `useState` 管理的组件内部状态          | 组件/Hook 内部             |
| **Reducer 状态**      | 通过 `useReducer` 管理的复杂状态            | Hook 内部                  |
| **全局状态（Store）** | 通过 Zustand 等管理的跨页面共享状态         | `src/store/use-*-store.js` |
| **服务端状态**        | 通过 `use()` + Suspense 获取的服务端数据    | Server Component 内        |
| **函数式更新**        | 使用 `setState((prev) => ...)` 避免闭包陷阱 | 所有状态更新               |

## 事件相关

| 术语               | 含义                               | 说明                          |
| ------------------ | ---------------------------------- | ----------------------------- |
| **事件处理函数**   | 以 `handle` 开头的用户交互处理函数 | `handleQuery`、`handleSubmit` |
| **回调函数**       | 通过 props 从父组件传递的函数      | `onQuery`、`onChange`         |
| **useActionState** | React 19 管理 Action 状态的 Hook   | 处理 pending/error/success    |
| **useOptimistic**  | React 19 乐观更新 Hook             | 先更新 UI 再执行异步          |

## 生命周期相关

| 术语                | 含义                                   | 说明                 |
| ------------------- | -------------------------------------- | -------------------- |
| **useEffect**       | React 副作用 Hook，处理挂载/更新/卸载  | 必须有清理函数       |
| **useLayoutEffect** | 同步副作用 Hook，在 DOM 更新后同步执行 | 测量 DOM、动画       |
| **清理函数**        | useEffect 返回的函数，组件卸载时执行   | 清除定时器、取消订阅 |

## 命名规则速查

| 类型        | 规则                         | 示例                          |
| ----------- | ---------------------------- | ----------------------------- |
| 组件文件名  | `PascalCase.jsx`             | `SearchBar.jsx`               |
| Hook 文件名 | `kebab-case.js`，`use-` 前缀 | `use-user-management.js`      |
| 组件名      | `PascalCase`                 | `SearchBar`、`DataTable`      |
| Hook 名     | `camelCase`，`use` 前缀      | `useUserManagement`           |
| 函数名      | `camelCase`                  | `handleQuery`、`loadData`     |
| 事件处理    | `handle` 前缀                | `handleQuery`、`handleSubmit` |
| 状态变量    | `camelCase`                  | `tableData`、`isLoading`      |
| 常量        | `UPPER_SNAKE_CASE`           | `API_BASE_URL`                |
| Action type | `UPPER_SNAKE_CASE`           | `'FETCH_START'`               |
