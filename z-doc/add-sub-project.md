# 新增子项目指南

> **本文档面向 AI 助手**：按步骤执行即可创建完整子项目。所有占位变量在下方「变量替换表」中定义。

---

## 变量替换表

本文档中所有 `<变量>` 均按下表替换（以 `my-app` 为示例）：

| 占位变量     | 含义                               | 示例值          |
| ------------ | ---------------------------------- | --------------- |
| `<项目名>`   | 子项目标识名（小写、连字符分隔）   | `my-app`        |
| `<项目标题>` | 显示名称                           | `我的应用`      |
| `<端口>`     | 开发服务器端口（不与现有端口冲突） | `23380`         |
| `<路由文件>` | 路由定义文件名                     | `my-app-routes` |

**现有端口分配**：23000（Docs）、23330（code-tool）、23350（vue-test）、23370（react-test）

---

## 架构概览

```
smart-code-tool/
├── src/                              # 共享内核（Vue 子项目共用）
│   ├── App.vue                       # 根组件（Vue 子项目共用）
│   ├── assets/ boot/ common/         # 公共模块
│   ├── components/ composable/       # 公共组件/composable
│   ├── css/ i18n/                    # 公共样式/国际化
│   ├── output/                       # barrel export 层
│   └── standardization/              # 标准化模板
│
├── project/<项目名>-app/              # 子项目代码 + Vite 配置 + HTML 入口
│   ├── vite.config.js                # Vite 配置
│   ├── index.html                    # HTML 入口
│   ├── main.js(x)                    # 应用入口
│   ├── router/                       # 路由配置
│   ├── layout/                       # 布局组件
│   └── pages/                        # 页面组件
│
├── docs/app-iframe/<项目名>-app/index.md  # VitePress iframe 嵌入页
│
├── scripts/dev.mjs                    # 开发脚本
├── scripts/build.mjs                  # 构建脚本
├── job/post-build/move-entry-html.js  # 构建后处理（移动入口 HTML）
└── dist/<项目名>-app/                 # 构建输出
```

### 核心机制

- **Vite root**：统一指向 `projectRoot`（项目根目录）
- **独立缓存**：`cacheDir` 设为 `node_modules/.vite-<项目名>-app`，避免多 Vite 实例共享缓存导致 504（注意是顶层配置项，不是 `optimizeDeps` 子项）
- **HTML 入口**：在 `project/<项目名>-app/index.html`，构建后由 post-build 脚本移到 dist 根目录
- **构建后处理**：`job/post-build/move-entry-html.js` 将嵌套路径的 HTML 移到 dist 输出根目录
- **iframe 嵌入**：子应用通过 VitePress 的 iframe 页面展示，布局组件需检测 iframe 并隐藏头部

### iframe 嵌入约束（Vue / React 通用）

多项目 iframe 嵌入场景下，**必须同时满足以下两个条件**：

1. **路由模式**：必须使用 Hash 路由（Vue: `createWebHashHistory` / React: `HashRouter`）
2. **iframe src**：dev 环境指向 HTML 全路径（`project/<项目名>-app/index.html`）

> History 路由（`createWebHistory` / `BrowserRouter`）会把 HTML 文件路径当作路由去匹配，导致 "No routes matched" 报错。Hash 路由走 `#` 片段，不受 HTML 文件路径影响。

### 两种框架模式

| 模式             | alias 策略                                         | 适用场景                                        |
| ---------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Vue 子项目**   | 双 alias：`src` → 共享内核，`project` → 子项目目录 | 需要复用 `src/` 中的 Vue 组件、composable、样式 |
| **React 子项目** | 单 alias：仅 `project` → 子项目目录                | 完全独立，不共享 Vue 内核                       |

---

## 步骤 1：选择框架模板并创建子项目

根据子项目的技术栈，选择对应模板文档并按步骤执行：

- **Vue 子项目** → [Vue 模板](./add-sub-project/vue-template.md)
  - 目录结构、main.js、router、layout.vue、Vite 配置（vue + quasar 插件）
- **React 子项目** → [React 模板](./add-sub-project/react-template.md)
  - 目录结构、main.jsx、App.jsx、Layout.jsx、Vite 配置（react 插件）

> 两个模板均包含：目录结构、入口文件、路由配置、布局组件（含 iframe 检测）、HTML 入口、Vite 配置的完整代码模板。

---

## 步骤 2：创建 VitePress iframe 嵌入页

创建 `docs/app-iframe/<项目名>-app/index.md`：

```markdown
---
layout: page
title: <项目标题>
sidebar: false
aside: false
---

<div style="position: fixed; top: var(--vp-nav-height); left: 0; right: 0; bottom: 0;">
  <iframe
    v-show="iframeReady"
    ref="iframeEl"
    :src="iframeSrc"
    style="width: 100%; height: 100%; border: none;"
    allow="fullscreen; clipboard-read; clipboard-write"
    @load="onIframeLoad"
  ></iframe>
</div>

<script setup>
import { ref, onMounted } from 'vue'

const iframeSrc = ref('')
const iframeReady = ref(false)
const iframeEl = ref(null)

function syncTheme() {
  const iframe = iframeEl.value
  if (iframe?.contentWindow) {
    const theme = localStorage.getItem('app-theme-mode') || 'dark'
    iframe.contentWindow.postMessage({ type: 'theme-change', theme }, '*')
  }
}

function onIframeLoad() {
  syncTheme()
  iframeReady.value = true
}

onMounted(() => {
  const isDev = import.meta.env.DEV
  iframeSrc.value = isDev
    ? 'http://localhost:<端口>/smart-code-tool/<项目名>-app/project/<项目名>-app/index.html'
    : '/smart-code-tool/<项目名>-app/index.html'

  // 页面重新可见时，重置状态让 iframe 重新同步主题后再显示
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && iframeEl.value) {
      iframeReady.value = false
      iframeEl.value.src = iframeEl.value.src
    }
  })
})
</script>
```

---

## 步骤 3：添加 VitePress 代理

编辑 `docs/.vitepress/config/vite.js`，在 `proxy` 对象中新增：

```js
'/smart-code-tool/<项目名>-app/': {
  target: 'http://localhost:<端口>',
  changeOrigin: true,
},
```

---

## 步骤 4：更新开发脚本

编辑 `scripts/dev.mjs`：

1. 端口清理命令增加 `-ti :<端口>`
2. 新增 Vite 启动命令：

   ```js
   const <项目名变量>Dev = $`vite --config project/<项目名>-app/vite.config.js`
   ```

3. 新增 console 输出：

   ```js
   console.log(
     chalk.gray(
       '   - <项目标题>: http://localhost:<端口>/smart-code-tool/<项目名>-app/project/<项目名>-app/',
     ),
   )
   ```

4. 加入 `Promise.all` 数组：
   ```js
   await Promise.all([vueDev, vueTestDev, reactTestDev, <项目名变量>Dev, docsDev])
   ```

---

## 步骤 5：更新构建脚本

编辑 `scripts/build.mjs`，在已有构建步骤之后新增：

```js
console.log(chalk.yellow('🔨 Step N: Building <项目名> application → dist/<项目名>-app/...'))
await $`vite build --config project/<项目名>-app/vite.config.js`
console.log(chalk.green('✓ <项目标题> application built\n'))
```

> **构建顺序**：VitePress 必须第一个构建（它会清空 `dist/`），子项目在其后顺序构建。

---

## 步骤 6：更新构建后处理脚本

编辑 `job/post-build/move-entry-html.js`，新增入口 HTML 的移动和清理：

```js
await copyFile('dist/<项目名>-app/project/<项目名>-app/index.html', 'dist/<项目名>-app/index.html')
await remove('dist/<项目名>-app/project/<项目名>-app/index.html')
```

> 构建后 Vite 会将 `project/<项目名>-app/index.html` 输出到 `dist/<项目名>-app/project/<项目名>-app/index.html`，此脚本将其移到 dist 根目录并清理原文件。

---

## 步骤 7：更新 VitePress 导航（可选）

如需在导航栏添加入口，编辑 `docs/.vitepress/config/nav.js`。

---

## 命名规范速查

| 产物        | 命名规则                                | 示例                                  |
| ----------- | --------------------------------------- | ------------------------------------- |
| 子项目目录  | `project/<项目名>-app/`                 | `project/my-app-app/`                 |
| Vite 配置   | `project/<项目名>-app/vite.config.js`   | `project/my-app-app/vite.config.js`   |
| HTML 入口   | `project/<项目名>-app/index.html`       | `project/my-app-app/index.html`       |
| base 路径   | `/smart-code-tool/<项目名>-app/`        | `/smart-code-tool/my-app-app/`        |
| 构建输出    | `dist/<项目名>-app/`                    | `dist/my-app-app/`                    |
| iframe 页面 | `docs/app-iframe/<项目名>-app/index.md` | `docs/app-iframe/my-app-app/index.md` |
| 开发端口    | 不冲突的端口                            | `23380`                               |

---

## Checklist

### 通用（所有框架）

- [ ] `project/<项目名>-app/index.html` 创建（HTML 入口）
- [ ] `project/<项目名>-app/vite.config.js` 创建
- [ ] `docs/app-iframe/<项目名>-app/index.md` 创建
- [ ] `docs/.vitepress/config/vite.js` 新增代理
- [ ] `scripts/dev.mjs` 新增启动命令 + 端口清理
- [ ] `scripts/build.mjs` 新增构建步骤
- [ ] `job/post-build/move-entry-html.js` 新增入口 HTML 移动/清理
- [ ] 端口不冲突（现有：23000/23330/23350/23370）
- [ ] `pnpm dev` 验证开发环境
- [ ] `pnpm build` 验证构建产物

### Vue 子项目额外检查

- [ ] `project/<项目名>-app/` 目录创建（含 main.js、router/、layout/、pages/）
- [ ] layout 组件添加 iframe 检测（`v-if="!isInIframe"` 隐藏头部）
- [ ] 导入 `src/App.vue` 作为根组件

### React 子项目额外检查

- [ ] React 依赖已安装（react、react-dom、react-router-dom、@vitejs/plugin-react）
- [ ] `project/<项目名>-app/` 目录创建（含 main.jsx、App.jsx、layout/、pages/）
- [ ] Layout 组件添加 iframe 检测（`!isInIframe` 条件渲染头部）
- [ ] `BrowserRouter.basename` 与 Vite `base` 路径一致
