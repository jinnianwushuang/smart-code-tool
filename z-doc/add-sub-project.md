# 新增子项目指南

## 架构概览

```
smart-code-tool/
├── src/                          # 共享内核（多项目共用，不要放子项目特有代码）
│   ├── App.vue                   # 根组件（各子项目共用）
│   ├── assets/                   # 静态资源
│   ├── boot/                     # 启动引导（组件注册等）
│   ├── common/                   # 公共模块
│   ├── components/               # 公共组件
│   ├── composable/               # 公共 composable
│   ├── css/                      # 公共样式
│   ├── i18n/                     # 国际化
│   ├── output/                   # barrel export 层（聚合模块统一入口）
│   └── standardization/          # 标准化模板
│
├── project/                      # 子项目目录（每个子项目独立目录）
│   ├── code-tool/                # 示例：工具库
│   └── vue-test/                 # 示例：架构验证
│
├── entries/                      # Vite 配置（每个子项目一个子目录）
│   ├── code-tool/vite.config.js
│   └── vue-test/vite.config.js
│
├── index-code-tool.html          # HTML 入口（命名规则：index-<项目名>.html）
├── index-vue-test.html
│
├── docs/app-iframe/              # VitePress iframe 嵌入页（每个子项目一个）
│   ├── code-tool-app/index.md
│   └── vue-test-app/index.md
│
├── scripts/
│   ├── dev.mjs                   # 开发服务器启动脚本
│   └── build.mjs                 # 构建脚本
│
└── dist/                         # 构建输出
    ├── (VitePress 文档 → 根目录)
    ├── code-tool-app/
    └── vue-test-app/
```

### 核心设计原则

- **`src/`** = 共享内核，所有子项目通过 `src` alias 引用
- **`project/<子项目>/`** = 子项目特有代码，遵循标准 Vue3 src 目录结构
- **Vite 双 alias**：`src` → 共享内核，`project` → 当前子项目目录
- **`root: projectRoot`**：Vite root 统一指向项目根目录
- **HTML 入口在项目根**：命名 `index-<项目名>.html`，通过 `rollupOptions.input` 指定构建入口

---

## 新增子项目步骤（以 `my-app` 为例）

### 1. 创建子项目目录

```
project/my-app/
├── main.js           # 应用入口
├── router/
│   ├── index.js      # 路由入口
│   └── routes/
│       └── my-app-routes.js   # 路由定义
├── layout/
│   └── layout.vue    # 布局组件
└── pages/
    └── my-app/
        └── index.vue # 首页
```

**main.js 模板**（参照现有子项目）：

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

### 2. 创建 HTML 入口

在项目根目录创建 `index-my-app.html`：

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/logo/icons8-light-on-96.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的应用</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./project/my-app/main.js"></script>
  </body>
</html>
```

> 脚本路径 `./project/my-app/main.js` 是相对于项目根目录（即 Vite root）。

### 3. 创建 Vite 配置

创建 `entries/my-app/vite.config.js`：

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

const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig(async () => {
  return {
    root: projectRoot,
    base: '/smart-code-tool/my-app/',
    build: {
      outDir: `${projectRoot}/dist/my-app`,
      rollupOptions: {
        input: `${projectRoot}/index-my-app.html`,
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
        project: `${projectRoot}/project/my-app`,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 23360, // 分配新端口，注意不要与现有端口冲突
    },
  }
})
```

**关键配置项说明**：

| 配置项                      | 规则                           | 示例                       |
| --------------------------- | ------------------------------ | -------------------------- |
| `root`                      | 固定为 `projectRoot`           | `projectRoot`              |
| `base`                      | `/smart-code-tool/<项目名>/`   | `/smart-code-tool/my-app/` |
| `build.outDir`              | `${projectRoot}/dist/<项目名>` | `dist/my-app`              |
| `build.rollupOptions.input` | 指向根目录的 HTML 入口         | `index-my-app.html`        |
| `resolve.alias.project`     | 指向子项目目录                 | `project/my-app`           |
| `server.port`               | 分配不冲突的端口               | `23360`                    |
| `server.host`               | 固定 `0.0.0.0`                 | 确保 IPv4+IPv6 都可访问    |

### 4. 创建 VitePress iframe 嵌入页

创建 `docs/app-iframe/my-app/index.md`：

```markdown
---
layout: page
title: 我的应用
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

onMounted(() => {
  const isDev = import.meta.env.DEV
  iframeSrc.value = isDev
    ? 'http://localhost:<端口>/smart-code-tool/my-app/index-my-app.html'
    : '/smart-code-tool/my-app/index.html'
})
</script>
```

> **注意**：dev 环境指向 `index-my-app.html`（源文件名），prod 环境指向 `index.html`（构建输出默认名）。

### 5. 添加 VitePress 代理

编辑 `docs/.vitepress/config/vite.js`，在 `proxy` 中新增：

```js
'/smart-code-tool/my-app/': {
  target: 'http://localhost:<端口>',
  changeOrigin: true,
},
```

### 6. 更新开发脚本

编辑 `scripts/dev.mjs`：

```js
// 新增启动命令
const myAppDev = $`vite --config entries/my-app/vite.config.js`

// 更新 console 输出
console.log(chalk.gray('   - My-app: http://localhost:<端口>/smart-code-tool/my-app/'))

// 加入 Promise.all
await Promise.all([vueDev, vueTestDev, myAppDev, docsDev])
```

### 7. 更新构建脚本

编辑 `scripts/build.mjs`，在 VitePress 构建之后新增步骤：

```js
console.log(chalk.yellow('🔨 Step N: Building my-app application → dist/my-app/...'))
await $`vite build --config entries/my-app/vite.config.js`
console.log(chalk.green('✓ My-app application built\n'))
```

> **构建顺序**：VitePress 必须第一个构建（它会清空 `dist/`），子项目在其后顺序构建。

### 8. 更新 VitePress 导航（可选）

如需在导航栏添加入口，编辑 `docs/.vitepress/config/nav.js`。

---

## 命名规范速查

| 项目        | 命名规则                                  | 示例                              |
| ----------- | ----------------------------------------- | --------------------------------- |
| 子项目目录  | `project/<项目名>/`                       | `project/my-app/`                 |
| Vite 配置   | `entries/<项目名>/vite.config.js`         | `entries/my-app/vite.config.js`   |
| HTML 入口   | `index-<项目名>.html`（项目根目录）       | `index-my-app.html`               |
| base 路径   | `/smart-code-tool/<项目名>/`              | `/smart-code-tool/my-app/`        |
| 构建输出    | `dist/<项目名>/`                          | `dist/my-app/`                    |
| iframe 页面 | `docs/app-iframe/<项目名>/index.md`       | `docs/app-iframe/my-app/index.md` |
| 开发端口    | 分配不冲突端口（现有：23000/23330/23350） | `23360`                           |

---

## Checklist

- [ ] `project/<项目名>/` 目录创建（含 main.js、router/、layout/、pages/）
- [ ] `index-<项目名>.html` 创建在项目根目录
- [ ] `entries/<项目名>/vite.config.js` 创建
- [ ] `docs/app-iframe/<项目名>/index.md` 创建
- [ ] `docs/.vitepress/config/vite.js` 新增代理
- [ ] `scripts/dev.mjs` 新增启动命令
- [ ] `scripts/build.mjs` 新增构建步骤
- [ ] 端口不冲突
- [ ] `pnpm dev` 验证开发环境
- [ ] `pnpm build` 验证构建产物
