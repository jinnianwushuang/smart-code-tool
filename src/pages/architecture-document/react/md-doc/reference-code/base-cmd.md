---
title: react 基础命令
order: 124
---

对于资深开发者来说，不需要看那些冗长的教程。React 的命令主要分为 **项目脚手架**、**包管理** 和 **日常开发** 三类。

目前的趋势是 **Vite** 已经取代了陈旧的 `create-react-app (CRA)`。

## 1. 快速创建项目 (推荐 Vite)

Vite 速度极快，是目前 React 开发的首选。
[VIte 官方模板](https://github.com/vitejs/vite/tree/main/packages/create-vite)

```bash
# 使用 npm
npm create vite@latest my-react-app -- --template react-ts

# 使用 pnpm (资深开发者推荐，更节省空间)
pnpm create vite my-react-app --template react-ts

# 使用 yarn
yarn create vite my-react-app --template react-ts
```

## 2. 传统/官方脚手架 (Next.js - 生产环境首选)

如果你要做的是大型生产项目，现在官方推荐直接上 **Next.js**：

```bash
npx create-next-app@latest
```

_(虽然 CRA 命令 `npx create-react-app` 还在，但官方已基本停止推荐使用)_

---

## 3. 日志开发与构建命令

进入项目目录后，最常用的指令：

| 功能               | 命令 (npm)        | 命令 (pnpm)    | 说明                     |
| :----------------- | :---------------- | :------------- | :----------------------- |
| **安装依赖**       | `npm install`     | `pnpm i`       | 对应 Vue 项目的安装      |
| **启动开发服务器** | `npm run dev`     | `pnpm dev`     | 对应 `npm run serve/dev` |
| **项目打包**       | `npm run build`   | `pnpm build`   | 生成产物到 `dist` 目录   |
| **预览打包结果**   | `npm run preview` | `pnpm preview` | 在本地跑生成的构建包     |
| **代码检查**       | `npm run lint`    | `pnpm lint`    | 修复代码风格             |

---

## 4. 必备生态库安装 (资深必装)

React 核心库很小，你通常需要手动安装这些“标配”：

```bash
# 路由 (React Router)
pnpm add react-router-dom

# 状态管理 (Zustand - 比 Vuex/Pinia 更简洁)
pnpm add zustand

# 网络请求 (TanStack Query - React 生态的神级工具)
pnpm add @tanstack/react-query

# 样式处理 (Tailwind CSS)
npx tailwindcss init -p
```

---

## 5. 调试工具命令

- **React DevTools**: 必装 Chrome 插件。
- **npx**: 当你不想全局安装某个工具（如代码格式化、生成镜像）时，直接用 `npx <command>`。

## 资深 Tips：

在 Vue 中我们常用 `vue-cli` 或 `Vite`。在 React 中，**没有官方的“全家桶”命令行工具**（像 `vue add router` 这种）。React 崇尚 **组合模式**，所有的插件都需要你手动 `pnpm add` 然后在代码里进行配置。

**你需要我为你演示如何通过一行命令快速配置一套包含“路由+状态管理+Tailwind”的 React 开发模板吗？**
