# 新增子项目指南

> **本文档面向 AI 助手**：按步骤执行即可创建完整子项目。所有占位变量在下方「变量替换表」中定义。

---

## 变量替换表

本文档中所有 `<变量>` 均按下表替换（以 `my-app` 为示例）：

| 占位变量     | 含义                               | 示例值             |
| ------------ | ---------------------------------- | ------------------ |
| `<项目名>`   | 子项目标识名（小写、连字符分隔）   | `my-app`           |
| `<项目标题>` | 显示名称                           | `我的应用`         |
| `<端口>`     | 开发服务器端口（不与现有端口冲突） | `23360`            |
| `<路由文件>` | 路由定义文件名                     | `my-app-routes.js` |

**现有端口分配**：23000（Docs）、23330（code-tool）、23350（vue-test）

---

## 架构概览

```
smart-code-tool/
├── src/                              # 共享内核（多项目共用）
│   ├── App.vue                       # 根组件（各子项目共用）
│   ├── assets/ boot/ common/         # 公共模块
│   ├── components/ composable/       # 公共组件/composable
│   ├── css/ i18n/                    # 公共样式/国际化
│   ├── output/                       # barrel export 层
│   └── standardization/              # 标准化模板
│
├── project/<项目名>/                  # 子项目特有代码（标准 Vue3 src 结构）
│   ├── main.js                       # 应用入口
│   ├── router/index.js               # 路由入口
│   ├── router/routes/<路由文件>       # 路由定义
│   ├── layout/layout.vue             # 布局组件
│   └── pages/                        # 页面组件
│
├── entries/<项目名>/vite.config.js    # Vite 配置
├── index-<项目名>.html                # HTML 入口（项目根目录）
├── docs/app-iframe/<项目名>/index.md  # VitePress iframe 嵌入页
│
├── scripts/dev.mjs                    # 开发脚本
├── scripts/build.mjs                  # 构建脚本
└── dist/<项目名>/                     # 构建输出
```

### 核心机制

- **双 alias**：Vite 配置中 `src` → 共享内核，`project` → 当前子项目目录
- **Vite root**：统一指向 `projectRoot`（项目根目录）
- **HTML 入口**：在项目根目录，命名 `index-<项目名>.html`，构建输出保持源文件名不变
- **iframe 嵌入**：子应用通过 VitePress 的 iframe 页面展示，布局组件需检测 iframe 并隐藏头部

---

## 步骤 1：创建子项目目录结构

创建以下目录和文件：

```
project/<项目名>/
├── main.js
├── router/
│   ├── index.js
│   └── routes/
│       └── <路由文件>
├── layout/
│   └── layout.vue
└── pages/
    └── <项目名>/
        └── index.vue
```

### main.js 模板

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

### router/index.js 模板

```js
import { createRouter, createWebHistory } from 'vue-router'
import { routes_<项目名变量> } from './routes/<路由文件>'

const router = createRouter({
  history: createWebHistory('/smart-code-tool/<项目名>/'),
  routes: [
    { path: '/', redirect: '/<项目名>' },
    ...routes_<项目名变量>,
  ],
})

export default router
```

### layout/layout.vue 模板（含 iframe 头部隐藏）

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

## 步骤 2：创建 HTML 入口

在项目根目录创建 `index-<项目名>.html`：

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
    <script type="module" src="./project/<项目名>/main.js"></script>
  </body>
</html>
```

> `src` 路径相对于项目根目录（即 Vite root）。

---

## 步骤 3：创建 Vite 配置

创建 `entries/<项目名>/vite.config.js`：

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

// 项目根目录（配置文件在 entries/<项目名>/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig(async () => {
  return {
    root: projectRoot,
    base: '/smart-code-tool/<项目名>/',
    build: {
      outDir: `${projectRoot}/dist/<项目名>`,
      rollupOptions: {
        input: `${projectRoot}/index-<项目名>.html`,
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
        project: `${projectRoot}/project/<项目名>`,
      },
    },
    server: {
      host: '0.0.0.0',
      port: <端口>,
    },
  }
})
```

### 关键配置项

| 配置项                      | 值                           | 说明                            |
| --------------------------- | ---------------------------- | ------------------------------- |
| `root`                      | `projectRoot`                | 固定，指向项目根目录            |
| `base`                      | `/smart-code-tool/<项目名>/` | 子应用的基础路径                |
| `build.outDir`              | `dist/<项目名>`              | 构建输出目录                    |
| `build.rollupOptions.input` | `index-<项目名>.html`        | HTML 入口（构建后保持源文件名） |
| `resolve.alias.src`         | `src`                        | 指向共享内核                    |
| `resolve.alias.project`     | `project/<项目名>`           | 指向子项目目录                  |
| `server.host`               | `0.0.0.0`                    | 必须，确保 IPv4+IPv6 都可访问   |
| `server.port`               | `<端口>`                     | 分配不冲突的端口                |

---

## 步骤 4：创建 VitePress iframe 嵌入页

创建 `docs/app-iframe/<项目名>/index.md`：

```markdown
---
layout: page
title: <项目标题>
sidebar: false
aside: false
---

<div style="position: fixed; top: var(--vp-nav-height); left: 0; right: 0; bottom: 0;">
  <iframe
    :src="iframeSrc"
    style="width: 100%; height: 100%; border: none;"
    allow="fullscreen; clipboard-read; clipboard-write"
  ></iframe>
</div>

<script setup>
import { ref, onMounted } from 'vue'

const iframeSrc = ref('')

// 向 iframe 推送当前主题，解决页面缓存后主题不同步的问题
function syncThemeToIframe() {
  const iframe = document.querySelector('iframe')
  if (iframe?.contentWindow) {
    const theme = localStorage.getItem('app-theme-mode') || 'dark'
    iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*')
  }
}

onMounted(() => {
  const isDev = import.meta.env.DEV
  // dev 指向子项目 dev server，prod 指向同域构建产物
  // 构建输出保持源文件名不变，dev/prod 文件名一致
  iframeSrc.value = isDev
    ? 'http://localhost:<端口>/smart-code-tool/<项目名>/index-<项目名>.html'
    : '/smart-code-tool/<项目名>/index-<项目名>.html'

  // 页面可见时同步主题（处理 VitePress 页面缓存场景）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncThemeToIframe()
  })
})
</script>
```

---

## 步骤 5：添加 VitePress 代理

编辑 `docs/.vitepress/config/vite.js`，在 `proxy` 对象中新增：

```js
'/smart-code-tool/<项目名>/': {
  target: 'http://localhost:<端口>',
  changeOrigin: true,
},
```

---

## 步骤 6：更新开发脚本

编辑 `scripts/dev.mjs`：

1. 新增 Vite 启动命令：

   ```js
   const <项目名变量>Dev = $`vite --config entries/<项目名>/vite.config.js`
   ```

2. 新增 console 输出：

   ```js
   console.log(chalk.gray('   - <项目标题>: http://localhost:<端口>/smart-code-tool/<项目名>/'))
   ```

3. 加入 `Promise.all` 数组：
   ```js
   await Promise.all([vueDev, vueTestDev, <项目名变量>Dev, docsDev])
   ```

---

## 步骤 7：更新构建脚本

编辑 `scripts/build.mjs`，在 VitePress 构建步骤之后新增：

```js
console.log(chalk.yellow('🔨 Step N: Building <项目名> application → dist/<项目名>/...'))
await $`vite build --config entries/<项目名>/vite.config.js`
console.log(chalk.green('✓ <项目标题> application built\n'))
```

> **构建顺序**：VitePress 必须第一个构建（它会清空 `dist/`），子项目在其后顺序构建。

---

## 步骤 8：更新 VitePress 导航（可选）

如需在导航栏添加入口，编辑 `docs/.vitepress/config/nav.js`。

---

## 命名规范速查

| 产物        | 命名规则                            | 示例                              |
| ----------- | ----------------------------------- | --------------------------------- |
| 子项目目录  | `project/<项目名>/`                 | `project/my-app/`                 |
| Vite 配置   | `entries/<项目名>/vite.config.js`   | `entries/my-app/vite.config.js`   |
| HTML 入口   | `index-<项目名>.html`（项目根目录） | `index-my-app.html`               |
| base 路径   | `/smart-code-tool/<项目名>/`        | `/smart-code-tool/my-app/`        |
| 构建输出    | `dist/<项目名>/`                    | `dist/my-app/`                    |
| iframe 页面 | `docs/app-iframe/<项目名>/index.md` | `docs/app-iframe/my-app/index.md` |
| 开发端口    | 不冲突的端口                        | `23360`                           |

---

## Checklist

- [ ] `project/<项目名>/` 目录创建（含 main.js、router/、layout/、pages/）
- [ ] layout 组件添加 iframe 检测（`v-if="!isInIframe"` 隐藏头部）
- [ ] `index-<项目名>.html` 创建在项目根目录
- [ ] `entries/<项目名>/vite.config.js` 创建
- [ ] `docs/app-iframe/<项目名>/index.md` 创建
- [ ] `docs/.vitepress/config/vite.js` 新增代理
- [ ] `scripts/dev.mjs` 新增启动命令
- [ ] `scripts/build.mjs` 新增构建步骤
- [ ] 端口不冲突（现有：23000/23330/23350）
- [ ] `pnpm dev` 验证开发环境
- [ ] `pnpm build` 验证构建产物
