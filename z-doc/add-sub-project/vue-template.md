# Vue 子项目模板

> 本文档是「新增子项目指南」的 Vue 框架模板。配合主文档 `add-sub-project.md` 使用。

---

## 前置：安装依赖（仅首次需要）

现有项目已包含 Vue 相关依赖，无需额外安装。如需新增 Vue 子项目，确认以下依赖已存在：

- `vue`、`vue-router`
- `quasar`、`@quasar/extras`
- `ant-design-vue`
- `@unhead/vue`
- `@vitejs/plugin-vue`、`@quasar/vite-plugin`

---

## 目录结构

```
project/<项目名>-app/
├── main.js                       # Vue 应用入口
├── router/
│   ├── index.js                  # 路由入口
│   └── routes/
│       └── <路由文件>             # 路由定义
├── layout/
│   └── layout.vue                # 布局组件（含 iframe 头部隐藏）
└── pages/
    └── <项目名>/
        └── index.vue             # 首页占位组件
```

---

## main.js 模板

```js
import { createApp } from 'vue'
import { Quasar, Notify, Loading } from 'quasar'
import { register_component } from 'src/boot/component.js'
import Antd from 'ant-design-vue'
import { createHead } from '@unhead/vue/client'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import 'ant-design-vue/dist/reset.css'
import 'github-markdown-css/github-markdown.css'
import 'quasar/src/css/index.sass'
import 'src/css/index.scss'

import App from 'src/App.vue'
import router from './router'

const app = createApp(App)
register_component(app)
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Loading },
  config: { dark: true },
})
app.use(Antd)
const head = createHead()
app.use(head)
app.mount('#app')
```

> **关键点**：
>
> - 导入 `src/App.vue` 作为共享根组件（含 Ant Design Vue 的 ConfigProvider + 主题切换）
> - 通过 `src/boot/component.js` 注册全局组件
> - 同时加载 Quasar 和 Ant Design Vue 两套 UI 库

---

## router/index.js 模板

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes_<项目名变量> } from './routes/<路由文件>'

const router = createRouter({
  // 必须使用 Hash 路由，多项目 iframe 嵌入场景下 History 模式会导致路由匹配失败
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/<项目名>' },
    ...routes_<项目名变量>,
  ],
})

export default router
```

> **必须使用 `createWebHashHistory`**（而非 `createWebHistory`）。多项目 iframe 嵌入场景下，iframe src 指向 HTML 全路径（如 `project/<项目名>-app/index.html`），History 模式会把 HTML 文件路径当作路由去匹配，导致路由失败；Hash 模式路由走 `#` 片段，不受 HTML 文件路径影响。

---

## layout/layout.vue 模板（含 iframe 头部隐藏）

子应用通过 VitePress iframe 嵌入时，VitePress 已有顶部导航栏，子应用自身的头部需隐藏。

```vue
<template>
  <a-layout style="height: 100vh">
    <!-- 关键：v-if="!isInIframe" 在 iframe 嵌入时隐藏头部 -->
    <a-layout-header v-if="!isInIframe" class="header">
      <!-- 头部内容 -->
    </a-layout-header>
    <a-layout>
      <!-- 侧边栏 + 内容区 -->
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { isDarkTheme } from 'src/output/common/project-common.js'

// 同步检测 iframe 嵌入，避免 onMounted 时才隐藏头部导致的闪烁
const isInIframe = ref(window.self !== window.top)

onMounted(() => {
  // 监听 VitePress 父页面的主题切换消息，无需重载即可同步主题
  if (isInIframe.value) {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'theme-change') {
        isDarkTheme.value = event.data.theme === 'dark'
      }
    })
  }
})
</script>

<style lang="scss" scoped>
/* 头部隐藏后，内容区高度自动撑满 100vh */
.header {
  height: 64px;
  line-height: 64px;
}
</style>
```

> **实现原理**：`window.self !== window.top` 判断当前页面是否在 iframe 中。`v-if` 移除头部 DOM，内容区自动占满全高。

---

## HTML 入口

在 `project/<项目名>-app/` 目录下创建 `index.html`：

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
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

> `src` 路径相对于 HTML 文件位置，`index.html` 与 `main.js` 同在 `project/<项目名>-app/` 下，直接使用 `./main.js`。

---

## Vite 配置

创建 `project/<项目名>-app/vite.config.js`：

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 项目根目录（配置文件在 project/<项目名>-app/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig(async () => {
  return {
    root: projectRoot,
    cacheDir: `${projectRoot}/node_modules/.vite-<项目名>-app`,
    base: '/smart-code-tool/<项目名>-app/',
    build: {
      outDir: `${projectRoot}/dist/<项目名>-app`,
      rollupOptions: {
        input: `${projectRoot}/project/<项目名>-app/index.html`,
      },
    },
    define: {
      __APP_BUILD_TIME__: JSON.stringify(
        dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss Z'),
      ),
    },
    plugins: [
      vue({ template: { transformAssetUrls } }),
      quasar({
        sassVariables: `${projectRoot}/src/css/quasar-variables.scss`,
      }),
    ],
    resolve: {
      alias: {
        src: `${projectRoot}/src`,
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

### Vue 模板关键配置项

| 配置项                  | 值                                    | 说明                                   |
| ----------------------- | ------------------------------------- | -------------------------------------- |
| `cacheDir`              | `node_modules/.vite-<项目名>-app`     | 独立依赖缓存目录，避免多 Vite 实例冲突 |
| `plugins`               | `vue()` + `quasar()`                  | Vue SFC 支持 + Quasar 样式变量         |
| `resolve.alias.src`     | `${projectRoot}/src`                  | 指向共享内核（Vue 子项目可复用）       |
| `resolve.alias.project` | `${projectRoot}/project/<项目名>-app` | 指向子项目目录                         |
| `server.cors`           | `true`                                | 显式启用 CORS，支持 iframe 嵌入        |
