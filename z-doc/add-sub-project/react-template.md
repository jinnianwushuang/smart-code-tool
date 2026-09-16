# React 子项目模板

> 本文档是「新增子项目指南」的 React 框架模板。配合主文档 `add-sub-project.md` 使用。

---

## 前置：安装依赖

React 子项目采用**完全独立模式**，不共享 Vue 内核，需安装以下依赖：

```bash
pnpm add react react-dom react-router-dom
pnpm add -D @vitejs/plugin-react
```

> 已安装（以实际 package.json 为准）：
>
> - `react` 19.x
> - `react-dom` 19.x
> - `react-router-dom` 7.x
> - `@vitejs/plugin-react` 6.x

---

## 目录结构

```
project/<项目名>-app/
├── main.jsx                      # React 应用入口
├── App.jsx                       # 根组件（路由配置）
├── router/
│   └── routes/
│       └── <路由文件>             # 路由定义（.jsx）
├── layout/
│   └── Layout.jsx                # 布局组件（含 iframe 头部隐藏）
└── pages/
    └── <项目名>/
        └── index.jsx             # 首页占位组件
```

> **与 Vue 模板的差异**：
>
> - 无 `router/index.js`，路由直接在 `App.jsx` 中配置
> - 文件扩展名为 `.jsx` 而非 `.js`/`.vue`
> - 不共享 `src/` 内核，Vite alias 中无 `src` 条目

---

## main.jsx 模板

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
```

> **关键点**：
>
> - **必须使用 `HashRouter`**（而非 `BrowserRouter`）。多项目 iframe 嵌入场景下，BrowserRouter 会把 HTML 文件路径（如 `/entries/react-test-app/index.html`）当作路由去匹配，导致 "No routes matched" 报错；HashRouter 路由走 `#` 片段，不受 HTML 文件路径影响
> - iframe 嵌入页的 dev src 必须指向 **HTML 全路径**（`entries/<项目名>-app/index.html`），与 HashRouter 配合使用
> - `React.StrictMode` 启用开发模式严格检查
> - 不使用共享 `src/App.vue`，React 子项目完全独立

---

## App.jsx 模板

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { routes } from './router/routes/<路由文件>'
import Layout from './layout/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/<项目名>" replace />} />
        {routes}
      </Route>
    </Routes>
  )
}
```

---

## 路由定义模板

`router/routes/<路由文件>.jsx`：

```jsx
import { Route } from 'react-router-dom'
import <页面组件名> from 'project/pages/<项目名>/index'

export const routes = <Route path="/<项目名>" element={<页面组件名 />} />
```

> `project` alias 指向 `project/<项目名>-app/`，可通过此别名导入页面组件。

---

## layout/Layout.jsx 模板（含 iframe 头部隐藏）

```jsx
import { Outlet } from 'react-router-dom'

const isInIframe = window.self !== window.top

export default function Layout() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isInIframe && (
        <header style={{ height: 64, lineHeight: '64px', padding: '0 24px' }}>
          <h1><项目标题></h1>
        </header>
      )}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
```

> **与 Vue 模板的对比**：
>
> - React 使用 `<Outlet />` 渲染子路由，Vue 使用 `<RouterView />`
> - React 中 `isInIframe` 是普通常量（模块加载时计算），Vue 中用 `ref` 包裹
> - React 模板暂不集成主题同步（`postMessage` 监听），如需可参照 Vue 模板的 `onMounted` 逻辑用 `useEffect` 实现

---

## 首页占位组件

`pages/<项目名>/index.jsx`：

```jsx
export default function <页面组件名>() {
  return (
    <div style={{ padding: 24 }}>
      <h2><项目标题> - 首页</h2>
      <p>子项目已成功运行。</p>
    </div>
  )
}
```

---

## HTML 入口

在 `entries/<项目名>-app/` 目录下创建 `index.html`：

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/logo/icons8-light-on-96.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><项目标题></title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="../../project/<项目名>-app/main.jsx"></script>
  </body>
</html>
```

> 注意 `src` 指向 `main.jsx`（而非 Vue 的 `main.js`）。

---

## Vite 配置

创建 `entries/<项目名>-app/vite.config.js`：

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 项目根目录（配置文件在 entries/<项目名>-app/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig(async () => {
  return {
    root: projectRoot,
    cacheDir: `${projectRoot}/node_modules/.vite-<项目名>-app`,
    base: '/smart-code-tool/<项目名>-app/',
    build: {
      outDir: `${projectRoot}/dist/<项目名>-app`,
      rollupOptions: {
        input: `${projectRoot}/entries/<项目名>-app/index.html`,
      },
    },
    define: {
      __APP_BUILD_TIME__: JSON.stringify(
        dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss Z'),
      ),
    },
    plugins: [react()],
    resolve: {
      alias: {
        project: `${projectRoot}/project/<项目名>-app`,
      },
    },
    server: {
      host: '127.0.0.1',
      port: <端口>,
      cors: true,
    },
  }
})
```

### React 模板关键配置项

| 配置项          | 值                                | 说明                                   |
| --------------- | --------------------------------- | -------------------------------------- |
| `cacheDir`      | `node_modules/.vite-<项目名>-app` | 独立依赖缓存目录，避免多 Vite 实例冲突 |
| `plugins`       | `react()`                         | JSX 转换支持                           |
| `resolve.alias` | 仅 `project`                      | 无 `src` alias（不共享 Vue 内核）      |
| `server.cors`   | `true`                            | 显式启用 CORS，支持 iframe 嵌入        |

### 与 Vue 模板的 Vite 配置差异

| 差异点           | Vue 模板                    | React 模板                 |
| ---------------- | --------------------------- | -------------------------- |
| 插件             | `vue()` + `quasar()`        | `react()`                  |
| `src` alias      | 有，指向共享内核            | 无                         |
| Quasar sass 变量 | 配置 `quasar.sassVariables` | 不需要                     |
| 路由模式         | Vue Router（Hash 模式）     | React Router（HashRouter） |
| 其他配置         | 完全相同                    | 完全相同                   |
