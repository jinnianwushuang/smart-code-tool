# 新增 react-test-app 子项目执行计划

## 变量定义

| 变量 | 值 |
|------|-----|
| `<项目名>` | `react-test` |
| `<项目标题>` | `React 架构验证` |
| `<端口>` | `23370` |
| `<路由文件>` | `react-test-routes.jsx` |

---

## Step 1：安装 React 依赖

```bash
pnpm add react react-dom react-router-dom
pnpm add -D @vitejs/plugin-react
```

> 仅新增依赖，不影响现有 Vue 子项目。

---

## Step 2：创建子项目目录结构（project/react-test-app/）

```
project/react-test-app/
├── main.jsx                # React 应用入口
├── App.jsx                 # React 根组件
├── router/
│   ├── index.jsx           # React Router 配置
│   └── routes/
│       └── react-test-routes.jsx  # 路由定义
├── layout/
│   └── Layout.jsx          # 布局组件（含 iframe 检测）
└── pages/
    └── react-test/
        └── index.jsx       # 首页占位组件
```

### 2.1 main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <BrowserRouter basename="/smart-code-tool/react-test-app/">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

### 2.2 App.jsx

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { routes } from './router/routes/react-test-routes'
import Layout from './layout/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/react-test" replace />} />
        {routes}
      </Route>
    </Routes>
  )
}
```

### 2.3 router/index.jsx

> 如果路由直接在 App.jsx 中配置，此文件可省略。保留作为路由集中管理入口：

```jsx
export { default as routes } from './routes/react-test-routes'
```

### 2.4 router/routes/react-test-routes.jsx

```jsx
import { Route } from 'react-router-dom'

export const routes = (
  <Route path="/react-test" element={<ReactTestHome />} />
)

function ReactTestHome() {
  const { default: Index } = await import('project/pages/react-test/index.jsx')
  return <Index />
}
```

> 实际实现中可直接 import 页面组件，避免动态导入的复杂性。

### 2.5 layout/Layout.jsx

```jsx
import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

const isInIframe = window.self !== window.top

export default function Layout() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isInIframe && (
        <header style={{ height: 64, lineHeight: '64px', padding: '0 24px' }}>
          <h1>React 架构验证</h1>
        </header>
      )}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
```

### 2.6 pages/react-test/index.jsx

```jsx
export default function ReactTestHome() {
  return (
    <div style={{ padding: 24 }}>
      <h2>React 架构验证 - 首页</h2>
      <p>子项目已成功运行。</p>
    </div>
  )
}
```

---

## Step 3：创建 HTML 入口（entries/react-test-app/index.html）

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/logo/icons8-light-on-96.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React 架构验证</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="../../project/react-test-app/main.jsx"></script>
  </body>
</html>
```

---

## Step 4：创建 Vite 配置（entries/react-test-app/vite.config.js）

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig(async () => {
  return {
    root: projectRoot,
    base: '/smart-code-tool/react-test-app/',
    build: {
      outDir: `${projectRoot}/dist/react-test-app`,
      rollupOptions: {
        input: `${projectRoot}/entries/react-test-app/index.html`,
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
        project: `${projectRoot}/project/react-test-app`,
      },
    },
    server: {
      host: '127.0.0.1',
      port: 23370,
      cors: true,
    },
  }
})
```

> **与 Vue 子项目的关键差异**：
> - 插件使用 `@vitejs/plugin-react` 替代 `@vitejs/plugin-vue` + `@quasar/vite-plugin`
> - 无 `src` alias（React 项目不共享 Vue 内核）
> - 保留 `project` alias 指向自身目录

---

## Step 5：创建 VitePress iframe 嵌入页（docs/app-iframe/react-test/index.md）

参照 `docs/app-iframe/vue-test-app/index.md` 模板，替换：
- `title`: `React 架构验证`
- 端口: `23370`
- 路径中所有 `vue-test-app` → `react-test-app`

---

## Step 6：更新 VitePress 代理（docs/.vitepress/config/vite.js）

在 `proxy` 对象中新增：

```js
'/smart-code-tool/react-test-app/': {
  target: 'http://localhost:23370',
  changeOrigin: true,
},
```

---

## Step 7：更新开发脚本（scripts/dev.mjs）

1. 端口清理命令增加 `-ti :23370`
2. 新增 console 输出：`React-Test app: http://localhost:23370/smart-code-tool/react-test-app/...`
3. 新增 Vite 启动命令：`const reactTestDev = $\`vite --config entries/react-test-app/vite.config.js\``
4. 加入 `Promise.all` 数组

---

## Step 8：更新构建脚本（scripts/build.mjs）

在 vue-test-app 构建步骤之后新增：

```js
console.log(chalk.yellow('🔨 Step N: Building react-test application → dist/react-test-app/...'))
await $\`vite build --config entries/react-test-app/vite.config.js\`
console.log(chalk.green('✓ React 架构验证 application built\n'))
```

同时在完成输出信息中增加 `React-Test App: ./dist/react-test-app`。

---

## Step 9：更新构建后处理（job/post-build/move-entry-html.js）

新增：

```js
await copyFile('dist/react-test-app/entries/react-test-app/index.html', 'dist/react-test-app/index.html')
await remove('dist/react-test-app/entries/react-test-app/index.html')
```

---

## Step 10：验证

| 验证项 | 命令 | 预期结果 |
|--------|------|----------|
| 开发模式 | `pnpm dev` | 4 个服务并行启动，访问 `localhost:23370` 可见 React 首页 |
| 构建 | `pnpm build` | `dist/react-test-app/` 生成，包含 `index.html` |
| iframe 嵌入 | 访问 VitePress 文档页 | React 子应用在 iframe 中正常显示 |

---

## 文件清单

### 新建文件（8 个）

| 文件路径 | 说明 |
|---------|------|
| `project/react-test-app/main.jsx` | React 入口 |
| `project/react-test-app/App.jsx` | 根组件 |
| `project/react-test-app/router/index.jsx` | 路由入口（可选） |
| `project/react-test-app/router/routes/react-test-routes.jsx` | 路由定义 |
| `project/react-test-app/layout/Layout.jsx` | 布局组件 |
| `project/react-test-app/pages/react-test/index.jsx` | 首页占位 |
| `entries/react-test-app/index.html` | HTML 入口 |
| `entries/react-test-app/vite.config.js` | Vite 配置 |
| `docs/app-iframe/react-test/index.md` | iframe 嵌入页 |

### 修改文件（5 个）

| 文件路径 | 改动 |
|---------|------|
| `package.json` | 新增 react/react-dom/react-router-dom + @vitejs/plugin-react |
| `docs/.vitepress/config/vite.js` | 新增代理条目 |
| `scripts/dev.mjs` | 新增启动命令 + 端口清理 |
| `scripts/build.mjs` | 新增构建步骤 |
| `job/post-build/move-entry-html.js` | 新增 HTML 搬移 |
