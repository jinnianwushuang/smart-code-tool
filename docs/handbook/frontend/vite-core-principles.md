# Vite 脚手架原理与 HMR 深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-25  
> **适用对象**: 高级前端工程师、构建工具爱好者、需要深入理解 Vite 内部机制的开发者

---

## 📑 目录

- [一、Vite 架构概览](#一vite-架构概览)
- [二、开发服务器原理](#二开发服务器原理)
- [三、依赖预构建](#三依赖预构建)
- [四、HMR 热更新原理](#四hmr-热更新原理)
- [五、模块图与请求管道](#五模块图与请求管道)
- [六、插件系统](#六插件系统)
- [七、生产构建原理](#七生产构建原理)
- [八、CSS 处理管线](#八css-处理管线)
- [九、环境变量与模式](#九环境变量与模式)
- [十、性能优化机制](#十性能优化机制)

---

## 一、Vite 架构概览

### 1.1 为什么 Vite 快 — 核心设计哲学

```
传统打包器 (Webpack) 开发模式:

入口文件
    ↓
递归解析所有依赖 (Bundle)
    ↓
编译转换所有模块
    ↓
生成完整 Bundle
    ↓
启动 Dev Server
    ↓
浏览器加载 (等待时间长)

───────────────────────────────

Vite 开发模式 (No-Bundle):

启动 Dev Server (几乎即时)
    ↓
浏览器请求 index.html
    ↓
解析 <script type="module" src="/src/main.js">
    ↓
浏览器原生 ESM 按需请求模块
    ↓
Vite 仅转换当前请求的模块 (On-Demand)
    ↓
页面渲染
```

### 1.2 双引擎架构

```
┌─────────────────────────────────────────────┐
│                  Vite                        │
├──────────────────┬──────────────────────────┤
│   开发模式        │       生产模式            │
├──────────────────┼──────────────────────────┤
│ esbuild (Go)     │  Rollup (JS)             │
│ - 依赖预构建      │  - 完整打包              │
│ - TS/JSX 转译    │  - Tree Shaking          │
│ - 速度: 10-100x  │  - Code Splitting        │
├──────────────────┼──────────────────────────┤
│ 原生 ESM 按需编译 │  输出优化后的静态资源      │
└──────────────────┴──────────────────────────┘
```

### 1.3 项目启动流程

```
vite (CLI 入口)
    ↓
resolveConfig()          # 合并配置: 默认值 + vite.config.js + CLI 参数 + .env
    ↓
createServer()           # 创建开发服务器
├── 创建 HTTP Server (Connect 中间件架构)
├── 初始化插件容器 (createPluginContainer)
├── 创建 ModuleGraph (模块图)
├── 注册内部中间件:
│   ├── cors / proxy / base
│   ├── transformMiddleware    ← 核心: 模块转换
│   ├── serveStaticMiddleware  ← 静态文件
│   ├── spaFallbackMiddleware  ← SPA 回退
│   └── htmlFallbackMiddleware
├── 启动 WebSocket Server (HMR 通道)
└── 触发 optimizeDeps() (依赖预构建)
    ↓
server.listen()
    ↓
就绪 (打印耗时)
```

### 1.4 中间件管道 (Connect)

```typescript
// Vite Dev Server 本质是一个 Connect 应用
// 请求按中间件注册顺序依次处理:

请求 → cors → proxy → base → transformMiddleware → static → spaFallback → 404

// transformMiddleware 是核心, 处理:
// /src/main.js        → JS 转换 (esbuild/插件)
// /src/App.vue        → Vue SFC 编译
// /src/style.css      → CSS 后处理
// /@vite/client       → HMR 客户端运行时
// /@react-refresh     → React Fast Refresh 运行时
// /node_modules/.vite → 预构建依赖 (直接返回)
```

---

## 二、开发服务器原理

### 2.1 模块请求的完整生命周期

```
浏览器: import { createApp } from 'vue'
    ↓ (被重写为)
浏览器: import { createApp } from '/node_modules/.vite/deps/vue.js?v=abc123'
    ↓ HTTP 请求
transformMiddleware 拦截
    ↓
1. resolveId: 确定模块真实路径
    ↓
2. load: 读取文件内容
    ↓
3. transform: 插件链转换 (TS→JS, Vue SFC→JS...)
    ↓
4. importAnalysis: 重写 import 路径 (核心!)
    ↓
5. 缓存结果 (transformResultCache)
    ↓
响应浏览器 (附带 ETag, 支持 304)
```

### 2.2 Import Analysis — 路径重写

```javascript
// 源码 (浏览器无法解析裸模块名):
import { ref } from 'vue'
import App from './App.vue'
import styles from './style.module.scss'

// Vite transform 后 (浏览器可直接执行):
import { ref } from '/node_modules/.vite/deps/vue.js?v=f3cd8a12'
import App from '/src/App.vue'
import styles from '/src/style.module.scss?import'

// 重写规则:
// 1. 裸模块名 → 预构建产物路径 + 版本 hash
// 2. 相对路径 → 绝对 URL 路径
// 3. 特殊后缀 → 添加查询参数 (?import, ?raw, ?url)
// 4. 绝对路径 → 添加 root 前缀
```

### 2.3 文件监听 (Chokidar)

```typescript
// Vite 使用 chokidar 监听项目文件变化
// 监听范围: 项目根目录下所有文件 (排除 node_modules, .git)

server.watcher.on('change', async (file) => {
  // 1. 使 ModuleGraph 中对应模块的缓存失效
  moduleGraph.onFileChange(file)

  // 2. 计算受影响的模块, 发送 HMR 更新
  updateModules(file, timestamp)
})

server.watcher.on('add', (file) => { /* 新文件: 触发 full-reload 检查 */ })
server.watcher.on('unlink', (file) => { /* 删除: 清理模块图 + reload */ })

// 性能细节:
// - 使用原生 fs.watch (通过 chokidar 封装)
// - node_modules 不监听 (依赖变化需重启/重新预构建)
// - 大量文件变化时合并更新 (debounce)
```

### 2.4 缓存策略

```typescript
// 三层缓存体系:

// 1. 内存缓存 — transformResultCache (Map)
//    key: 文件路径 + 查询参数
//    value: { code, map, etag }
//    失效时机: 文件变化 / 配置变化

// 2. 磁盘缓存 — node_modules/.vite (预构建产物)
//    失效时机: 依赖版本变化 / lockfile 变化 / 配置变化
//    判断依据: _metadata.json 中的 hash

// 3. HTTP 缓存 — ETag + If-None-Match
//    浏览器重复请求 → 304 Not Modified → 用本地缓存
//    即使模块未变化也走一次 transform (内存缓存命中, 开销极小)

// 缓存失效链:
// 文件修改 → chokidar 触发 → moduleGraph.invalidateModule()
//         → transformResultCache.delete(id)
//         → 下次请求重新 transform
```

---

## 三、依赖预构建

### 3.1 为什么需要预构建

```
问题 1: CommonJS/UMD 模块无法被浏览器 ESM 加载
─────────────────────────────────────────────
// lodash-es 是 ESM ✅ 浏览器可直接用
// lodash (CJS) ❌ 浏览器无法解析 require/exports
// react (CJS) ❌ 需要转换为 ESM

问题 2: 模块碎片化导致请求瀑布流
─────────────────────────────────────────────
// lodash-es 源码: 600+ 个独立文件!
import { debounce } from 'lodash-es'
// debounce.js → import _baseDelay → import _toNumber → ...
// 浏览器: 600+ 次 HTTP 请求 → 页面卡顿

// 预构建后: 600+ 文件 → 1 个文件
// lodash-es → node_modules/.vite/deps/lodash-es.js (单文件 ESM)
```

### 3.2 预构建流程

```
服务启动 / 首次请求
    ↓
扫描依赖入口:
├── 1. 裸 import 静态分析 (es-module-lexer 解析所有源文件)
├── 2. package.json dependencies
└── 3. 特殊文件: .html 中的 <script> 引用
    ↓
过滤: 排除 linked packages / 已在 optimizeDeps.include 中的
    ↓
esbuild 批量转换:
├── CJS/UMD → ESM
├── 多文件模块 → 合并为单文件
└── 输出到 node_modules/.vite/deps/
    ↓
生成 _metadata.json:
{
  "hash": "abc123",        // 配置+lockfile 的 hash
  "browserHash": "def456", // 依赖内容的 hash
  "optimized": {
    "vue": { "fileHash": "xxx", "needsInterop": true },
    "lodash-es": { "fileHash": "yyy", "needsInterop": false }
  }
}
```

### 3.3 缓存失效与重新预构建

```typescript
// _metadata.json 中的 hash 由以下因素决定:
// 1. lockfile 内容 (pnpm-lock.yaml / package-lock.json)
// 2. vite.config.js 中影响预构建的配置项
// 3. NODE_ENV / mode

// 触发重新预构建的场景:
// - npm install 新依赖 (lockfile 变化)
// - 修改 optimizeDeps 配置
// - 运行时发现新依赖 (动态 import 的包未预构建)

// 运行时发现新依赖的处理:
// 1. 请求到达 → 发现未预构建的裸模块
// 2. 暂停该请求
// 3. 增量预构建该依赖
// 4. 如果已有页面加载 → 触发 full-reload (带新 hash)
// 5. 恢复请求

// 手动控制:
// vite --force  → 忽略缓存, 强制重新预构建
```

### 3.4 optimizeDeps 配置

```typescript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    // 强制预构建 (扫描不到的依赖, 如动态 import)
    include: ['lodash-es', 'axios'],

    // 排除预构建 (linked 本地包 / 已是 ESM 的大包)
    exclude: ['my-linked-package'],

    // 传递给 esbuild 的选项
    esbuildOptions: {
      plugins: [/* esbuild 插件 */],
      define: { global: 'globalThis' },
    },

    // 预构建入口 (默认自动扫描)
    entries: ['src/**/*.vue', 'src/**/*.ts'],
  },
})
```

---

## 四、HMR 热更新原理

### 4.1 HMR 整体架构

```
┌──────────────┐         WebSocket          ┌──────────────┐
│   浏览器      │ ◄═══════════════════════► │  Vite Server  │
│              │                            │              │
│ @vite/client │  ← { type: 'update',       │  chokidar    │
│ (HMR 运行时)  │      path, timestamp }     │  (文件监听)   │
│              │                            │      ↓       │
│  import.meta │  ← { type: 'full-reload' } │  ModuleGraph │
│  .hot API    │                            │  (失效计算)   │
└──────────────┘                            └──────────────┘

通信协议: JSON over WebSocket
客户端: /@vite/client (自动注入到每个 HTML)
```

### 4.2 HMR 更新流程 (以 Vue SFC 为例)

```
1. 开发者修改 src/App.vue
        ↓
2. chokidar 检测到文件变化
        ↓
3. moduleGraph.onFileChange('/src/App.vue')
   → 清除该模块的 transformResultCache
   → 标记 importedModules 需要重新验证
        ↓
4. 计算更新边界 (propagateUpdate):
   从变化模块向上遍历 importers 链:
   
   App.vue ← main.js ← index.html
   
   规则: 向上查找最近的"热边界" (Hot Boundary)
   - Vue SFC: 组件自身就是热边界 ✅ (可局部更新)
   - 无 hot API 的普通 JS: 继续向上冒泡
   - 冒泡到入口仍未找到边界 → full-reload
        ↓
5. 发送 WebSocket 消息:
   {
     type: 'update',
     updates: [{
       type: 'js-update',
       path: '/src/App.vue',
       acceptedPath: '/src/App.vue',
       timestamp: 1721900000000
     }]
   }
        ↓
6. 浏览器 @vite/client 收到消息:
   → 动态 import(`/src/App.vue?t=1721900000000`)
   → 时间戳参数绕过缓存, 获取最新代码
        ↓
7. Vue HMR Runtime 执行更新:
   → 比对新旧组件选项
   → 保留实例状态 (data/ref 不丢失)
   → 仅重新渲染受影响的组件树
        ↓
8. 页面局部刷新完成 (毫秒级)
```

### 4.3 import.meta.hot API 原理

```typescript
// HMR API 是模块与 HMR 系统通信的接口
if (import.meta.hot) {
  // 声明自身为热边界, 并处理更新
  import.meta.hot.accept((newModule) => {
    // newModule: 重新加载后的模块
    // 在这里执行自定义的更新逻辑
  })

  // 接受依赖模块的更新 (依赖热边界)
  import.meta.hot.accept('./dep.js', (newDep) => {
    // dep.js 变化时, 不 reload, 执行此回调
  })

  // 模块被替换前的清理
  import.meta.hot.dispose((data) => {
    // data: 可序列化对象, 传递给新模块的 hot.data
    clearInterval(timer)
    removeEventListener(...)
  })

  // 拒绝更新 → 强制向上冒泡
  import.meta.hot.decline()

  // 手动触发整页刷新
  import.meta.hot.invalidate()
}
```

### 4.4 accept 边界与冒泡算法

```
模块图示例:

index.html → main.js → App.vue → Header.vue
                     → utils.js → constants.js

场景 A: 修改 Header.vue
─────────────────────
Header.vue 是 Vue 组件 → 自身就是热边界
结果: 仅 Header.vue 热更新 ✅

场景 B: 修改 constants.js
─────────────────────
constants.js 无 hot API → 向上冒泡到 utils.js
utils.js 无 hot API → 继续冒泡到 main.js
main.js 无 hot API → 冒泡到 index.html (入口)
结果: full-reload ❌ (整页刷新)

场景 C: utils.js 中声明了 import.meta.hot.accept('./constants.js')
─────────────────────
constants.js 变化 → 冒泡到 utils.js → 命中 accept 边界
结果: utils.js 重新执行, 处理新 constants ✅

// 冒泡算法伪代码:
function propagateUpdate(module, boundaries) {
  for (const importer of module.importers) {
    if (importer.acceptsUpdate(module)) {
      boundaries.add({ boundary: importer, updatedModule: module })
    } else if (importer.isEntry) {
      return FULL_RELOAD
    } else {
      propagateUpdate(importer, boundaries)  // 递归向上
    }
  }
}
```

### 4.5 CSS 的 HMR

```
CSS 文件的 HMR 是"无状态"的 — 直接替换, 无需 JS 参与:

修改 style.css
    ↓
Vite 检测到变化
    ↓
WebSocket: { type: 'update', updates: [{ type: 'css-update', path: '/src/style.css', timestamp }] }
    ↓
客户端处理:
├── 找到 <link href="/src/style.css"> 标签
├── 创建新 <link href="/src/style.css?t=新时间戳">
├── 新样式加载完成后移除旧 <link>
└── 无需刷新页面, 无状态丢失

// CSS Modules 的特殊处理:
// .module.css 变化 → 除了替换 <link>, 还需更新引用它的 JS 模块
// → 触发对应 JS 模块的 hot update (重新绑定 class 映射)

// Vue SFC 中的 <style>:
// 编译为独立 CSS 请求 → 走 CSS HMR 路径
// <template> 变化 → 仅重新渲染 (保留状态)
// <script> 变化 → 组件重新创建 (setup 重新执行)
```

### 4.6 框架 HMR 集成对比

```
┌────────────┬──────────────────────────────────────────────┐
│ 框架        │ HMR 实现方式                                  │
├────────────┼──────────────────────────────────────────────┤
│ Vue 3      │ @vitejs/plugin-vue 注入 HMR 边界代码           │
│            │ 每个 SFC 编译后自带 import.meta.hot.accept()    │
│            │ 模板变化: 重渲染保留状态; 脚本变化: 重建组件      │
├────────────┼──────────────────────────────────────────────┤
│ React      │ @vitejs/plugin-react 集成 react-refresh        │
│            │ babel 插件为每个组件文件注入:                    │
│            │ - $RefreshReg$(Component, 'id') 注册组件        │
│            │ - import.meta.hot.accept() 边界                │
│            │ 函数组件状态保留; 非组件导出变化 → 整文件重载     │
├────────────┼──────────────────────────────────────────────┤
│ Svelte     │ vite-plugin-svelte 内置 HMR                    │
│            │ 组件实例状态保留, 仅重新挂载                     │
└────────────┴──────────────────────────────────────────────┘
```

### 4.7 full-reload 触发条件

```typescript
// 以下场景 Vite 会放弃热更新, 直接整页刷新:

// 1. 非模块文件变化 (public/ 目录下的静态资源)
//    → 无法通过模块图追踪, 直接 reload

// 2. 冒泡到入口仍未找到热边界
//    → 纯 JS 工具模块 (无 accept) 被入口直接引用

// 3. 模块调用 import.meta.hot.invalidate()
//    → 框架插件判断无法安全热更新时主动触发

// 4. 配置文件变化 (vite.config.js)
//    → 服务器自动重启 + full-reload

// 5. .env 文件变化
//    → 环境变量可能影响模块行为, full-reload

// 6. 新增/删除文件 (某些情况)
//    → 可能影响路由/模块图结构

// WebSocket 断连恢复:
// 客户端检测到 ws 断开 → 自动重连
// 重连成功后 → full-reload (确保状态一致)
```

---

## 五、模块图与请求管道

### 5.1 ModuleGraph 数据结构

```typescript
// ModuleGraph 是 Vite 开发模式的核心数据结构
// 记录所有模块及其依赖关系

class ModuleNode {
  url: string                    // 浏览器请求的 URL
  id: string | null              // 文件系统绝对路径
  file: string | null            // 文件路径 (无查询参数)
  type: 'js' | 'css'             // 模块类型
  info: ModuleInfo               // Rollup 兼容的模块信息
  meta: Record<string, any>      // 插件自定义元数据
  importers: Set<ModuleNode>     // 谁引用了我 (反向依赖)
  importedModules: Set<ModuleNode> // 我引用了谁 (正向依赖)
  acceptedHmrDeps: Set<ModuleNode> // accept() 声明的依赖
  isSelfAccepting: boolean       // 是否 accept 自身
  transformResult: TransformResult | null  // 转换结果缓存
  lastHMRTimestamp: number       // 最近一次 HMR 时间戳
}

// 模块图示意:
// main.js ──→ App.vue ──→ Header.vue
//    │            │
//    │            └──→ style.css
//    └──→ vue (预构建)
```

### 5.2 模块失效传播

```typescript
// 文件变化时的失效算法:
function invalidateModule(mod: ModuleNode, seen: Set) {
  // 1. 清除转换缓存
  mod.transformResult = null

  // 2. 重置 HMR 边界信息
  mod.isSelfAccepting = false (待重新 transform 确定)

  // 3. 递归失效所有 importer (向上游传播)
  for (const importer of mod.importers) {
    if (!seen.has(importer)) {
      invalidateModule(importer, seen)
    }
  }
}

// 注意: 失效是"懒"的 — 只清缓存, 不重新编译
// 重新编译发生在浏览器下次请求该模块时 (按需)
```

### 5.3 Transform Pipeline 详解

```typescript
// 每个模块请求经过的完整管道:

async function transformRequest(url: string, server: ViteDevServer) {
  // 0. 检查内存缓存
  const cached = server.moduleGraph.getModuleByUrl(url)
  if (cached?.transformResult) return cached.transformResult

  // 1. resolveId — 确定模块 ID
  //    插件 resolveId 钩子链 + 内置解析器
  const id = await pluginContainer.resolveId(url)

  // 2. load — 加载模块内容
  //    插件 load 钩子 → 默认 fs.readFile
  const { code, map } = await pluginContainer.load(id)

  // 3. transform — 插件转换链
  //    按插件 enforce 顺序: pre → normal → post
  let result = await pluginContainer.transform(code, id)

  // 4. importAnalysis (内置后置插件)
  //    - 重写 import 路径
  //    - 注入 HMR 边界代码 (import.meta.hot)
  //    - 记录模块依赖关系到 ModuleGraph
  result = await importAnalysisPlugin.transform(result, id)

  // 5. 缓存到 ModuleGraph
  mod.transformResult = { code, map, etag: getEtag(code) }

  return mod.transformResult
}
```

---

## 六、插件系统

### 6.1 插件执行模型

```typescript
// Vite 插件 = Rollup 插件 + Vite 扩展钩子
// 基于 Rollup 的插件容器实现 (兼容大部分 Rollup 插件)

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    // ─── Vite 独有钩子 ───
    enforce: 'pre' | 'post',     // 执行顺序 (pre 在内置插件前)
    apply: 'serve' | 'build',    // 仅开发 / 仅构建时生效
    config(config, env) {},      // 修改/扩展配置 (最早执行)
    configResolved(config) {},   // 配置确定后 (只读)
    configureServer(server) {},  // 访问 Dev Server (添加中间件)
    transformIndexHtml(html) {}, // 转换 index.html
    handleHotUpdate(ctx) {},     // 自定义 HMR 处理
    buildStart() {},             // 构建开始

    // ─── Rollup 兼容钩子 ───
    options(options) {},         // 修改 Rollup 选项
    buildEnd() {},               // 构建结束
    resolveId(id, importer) {},  // 自定义模块解析
    load(id) {},                 // 自定义模块加载
    transform(code, id) {},      // 自定义模块转换
    generateBundle() {},         // 输出产物操作
    closeBundle() {},            // Bundle 完成后
  }
}
```

### 6.2 钩子执行时序

```
开发模式 (vite dev):
─────────────────
config → configResolved → configureServer → buildStart
    ↓ (服务运行中, 每个模块请求:)
    resolveId → load → transform
    ↓ (文件变化时:)
    handleHotUpdate
    ↓ (服务关闭:)
    buildEnd → closeBundle

构建模式 (vite build):
─────────────────
config → configResolved → buildStart
    ↓ (每个模块:)
    resolveId → load → transform
    ↓ (产物生成:)
    generateBundle → writeBundle → closeBundle

// enforce 排序规则:
// alias → pre 插件 → 内置插件 → normal 插件 → post 插件 → 内置 post 插件
```

### 6.3 handleHotUpdate — 自定义 HMR

```typescript
// 插件可以拦截/修改 HMR 行为
export default function myHmrPlugin(): Plugin {
  return {
    name: 'custom-hmr',
    handleHotUpdate({ file, server, modules, timestamp, read }) {
      // 场景: JSON 配置文件变化时只更新特定模块
      if (file.endsWith('config.json')) {
        // 返回需要更新的模块子集 (缩小更新范围)
        return modules.filter(m => m.url.includes('config'))
      }

      // 场景: 向客户端发送自定义事件
      if (file.endsWith('.md')) {
        server.ws.send({
          type: 'custom',
          event: 'markdown-updated',
          data: { file, timestamp }
        })
        // 返回空数组 → 阻止默认 HMR 行为
        return []
      }
    }
  }
}

// 客户端监听自定义事件:
// import.meta.hot.on('markdown-updated', (data) => { ... })
```

### 6.4 虚拟模块模式

```typescript
// 插件常见模式: 虚拟模块 (不存在的文件路径)
const virtualModuleId = 'virtual:my-config'
const resolvedVirtualModuleId = '\0' + virtualModuleId
// '\0' 前缀: Rollup 约定, 防止其他插件/文件系统处理

export default function virtualPlugin(): Plugin {
  return {
    name: 'virtual-config',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId  // 拦截解析
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 返回动态生成的模块内容
        return `export default ${JSON.stringify(generateConfig())}`
      }
    }
  }
}

// 使用: import config from 'virtual:my-config'
```

---

## 七、生产构建原理

### 7.1 构建流程

```
vite build
    ↓
1. 确定入口: index.html (多页应用: rollupOptions.input)
    ↓
2. 创建 Rollup Bundle:
   ├── 解析模块图 (所有 import 递归)
   ├── 插件 transform 链 (与开发模式共享)
   ├── Tree Shaking (基于 ESM 静态分析)
   └── Code Splitting (动态 import 边界)
    ↓
3. 产物优化:
   ├── 资源内联 (小于 assetsInlineLimit 的 → base64)
   ├── CSS 提取 (独立 .css 文件)
   ├── 文件名 hash (内容指纹)
   └── 预加载指令注入 (<link rel="modulepreload">)
    ↓
4. 输出到 dist/
   ├── index.html (注入资源引用)
   ├── assets/
   │   ├── index-a1b2c3.js      (入口 chunk)
   │   ├── vendor-d4e5f6.js     (公共依赖 chunk)
   │   ├── About-g7h8i9.js      (懒加载 chunk)
   │   └── index-j1k2l3.css
   └── favicon.ico (public/ 直接复制)
```

### 7.2 Tree Shaking 原理

```javascript
// 前提: ESM 的静态结构 (import/export 必须在顶层)
// utils.js
export function used() { return 'used' }
export function unused() { return 'unused' }

// main.js
import { used } from './utils'
console.log(used())

// Rollup 分析:
// 1. 标记 main.js 中实际使用的导出: used ✅, unused ❌
// 2. unused 无副作用标记 → 安全移除
// 3. 产物中不包含 unused 函数

// 副作用声明 (package.json):
{
  "sideEffects": false           // 所有文件无副作用
  // "sideEffects": ["*.css"]    // 仅 CSS 有副作用
}
// 作用: 允许打包器删除"未使用但被 import"的模块
// 风险: 误标导致 polyfill/样式丢失
```

### 7.3 Code Splitting 策略

```typescript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['lodash-es', 'dayjs'],
        },
        // 或函数形式 (更灵活)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            return 'vendor'
          }
        },
        // 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 分包阈值
    chunkSizeWarningLimit: 500,  // kB
    // 小资源内联阈值
    assetsInlineLimit: 4096,     // 4kB 以下 → base64
  },
})

// 动态 import → 自动分包边界
const Admin = () => import('./pages/Admin.vue')
// 构建产物: Admin-[hash].js (独立 chunk, 按需加载)
```

---

## 八、CSS 处理管线

### 8.1 开发模式 CSS 流程

```
请求 /src/style.scss
    ↓
1. 预处理器编译 (sass/less/stylus)
    ↓
2. PostCSS 处理 (如果配置了 postcss.config.js)
    ↓
3. CSS Modules 处理 (*.module.css/scss)
   → 生成 class 映射: { title: '_title_abc123' }
    ↓
4. 转换为 JS 模块:
   ┌─────────────────────────────────────────┐
   │ import { updateStyle } from '/@vite/client' │
   │ const css = ".title { color: red }"     │
   │ updateStyle('style-id', css)            │
   │ export default { title: '_title_abc123' }│
   └─────────────────────────────────────────┘
    ↓
5. 浏览器执行: 动态创建/更新 <style> 标签
   (开发模式 CSS 以 <style> 内联注入, 非 <link>)
```

### 8.2 构建模式 CSS 流程

```
Rollup 构建时:
    ↓
1. 所有 CSS 模块编译 + CSS Modules hash
    ↓
2. 提取: 每个 JS chunk 对应的 CSS → 独立 .css 文件
    ↓
3. HTML 注入: <link rel="stylesheet" href="/assets/index-hash.css">
    ↓
4. CSS 代码分割: 动态 import 的组件 CSS → 独立文件, 随 JS 按需加载

// CSS 顺序保证:
// Vite 按照模块图中的引入顺序合并 CSS
// 注意: 异步 chunk 的 CSS 加载顺序可能与预期不同 (已知限制)
```

---

## 九、环境变量与模式

### 9.1 环境变量系统

```bash
# .env                # 所有模式加载
# .env.local          # 所有模式, git 忽略
# .env.development    # vite dev 时加载
# .env.production     # vite build 时加载
# .env.staging        # vite build --mode staging 时加载

# 暴露规则: 只有 VITE_ 前缀的变量会注入客户端代码
VITE_API_BASE=https://api.example.com   # ✅ 客户端可用
SECRET_KEY=abc123                        # ❌ 仅服务端 (vite.config.js)
```

```typescript
// 客户端使用:
console.log(import.meta.env.VITE_API_BASE)
console.log(import.meta.env.MODE)    // 'development' | 'production'
console.log(import.meta.env.DEV)     // boolean
console.log(import.meta.env.PROD)    // boolean
console.log(import.meta.env.BASE_URL) // 部署基础路径

// 注入原理 (静态替换):
// 开发模式: define 插件在 transform 时替换 import.meta.env.X → 字面量
// 构建模式: Rollup define 插件在打包时替换 (dead code elimination 生效)

// vite.config.js 中读取:
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')  // '' = 不过滤前缀
  return {
    server: { proxy: { '/api': env.API_BACKEND } }  // 无 VITE_ 前缀也可用
  }
})
```

### 9.2 模式 (Mode) 机制

```
vite dev              → mode = 'development'
vite build            → mode = 'production'
vite build --mode staging → mode = 'staging'
vite dev --mode test  → mode = 'test'

// mode 决定:
// 1. 加载哪个 .env.[mode] 文件
// 2. import.meta.env.MODE 的值
// 3. process.env.NODE_ENV 的值 (dev→development, build→production)

// 注意区分: mode ≠ NODE_ENV
// vite build --mode staging 时:
//   import.meta.env.MODE === 'staging'
//   import.meta.env.PROD === true (build 行为仍是 production 优化)
```

---

## 十、性能优化机制

### 10.1 开发性能优化清单

```typescript
// 1. 减少预构建扫描时间
optimizeDeps: {
  include: ['large-cjs-package'],  // 显式声明, 避免二次扫描触发 reload
}

// 2. 排除不需要处理的路径
server: {
  watch: {
    ignored: ['**/dist/**', '**/coverage/**']
  }
}

// 3. 大型 monorepo: 只监听子包
// 4. 避免在 transform 钩子中做昂贵操作 (阻塞所有模块请求)

// 5. warmup — 预热常用模块 (Vite 4.3+)
server: {
  warmup: {
    clientFiles: ['./src/main.ts', './src/App.vue']
    // 服务启动后立即预转换, 首次访问无延迟
  }
}
```

### 10.2 构建性能优化

```typescript
export default defineConfig({
  build: {
    // esbuild 压缩 (默认, 极快) vs terser (更慢但更小)
    minify: 'esbuild',

    // 关闭 sourcemap 加速构建
    sourcemap: false,

    // 大项目: 跳过 CSS 代码分割 (减少计算)
    cssCodeSplit: true,

    // 目标环境 (影响 polyfill 和语法降级程度)
    target: 'es2020',

    // 报告压缩大小 (关闭可加速构建)
    reportCompressedSize: false,
  },

  // 使用构建缓存
  cacheDir: 'node_modules/.vite',
})
```

### 10.3 常见性能问题排查

```
问题: 开发启动慢
─────────────
1. 预构建耗时 → 检查 node_modules/.vite/deps 数量
   优化: optimizeDeps.include 显式声明大依赖
2. 插件 config 钩子中有同步 IO → 改为异步
3. 大量文件监听 → 配置 server.watch.ignored

问题: HMR 变慢 / 触发 full-reload
─────────────
1. 修改的模块无热边界 → 检查 import.meta.hot.accept 链
2. 循环依赖导致冒泡范围过大 → 解开循环
3. handleHotUpdate 插件返回过多模块 → 缩小范围

问题: 构建产物过大
─────────────
1. vite-bundle-visualizer 分析 chunk 组成
2. 检查 sideEffects 标记是否缺失 (Tree Shaking 失效)
3. manualChunks 拆分大 vendor
4. 检查是否有大型静态资源未走 CDN

// 诊断命令:
// vite --debug            → 输出详细日志
// vite build --profile    → 生成 CPU profile (Chrome DevTools 分析)
```

### 10.4 Vite 6 Environment API (演进方向)

```typescript
// Vite 6 引入 Environment API — 统一多环境处理
// 动机: SSR / Worker / RSC 等场景需要独立的模块图和转换管道

// 传统: server.moduleGraph (单一, SSR 共享有冲突)
// 新模型: 每个 environment 拥有独立的:
// - ModuleGraph
// - Transform Pipeline
// - 预构建实例

// 概念模型:
interface ViteEnvironment {
  name: string              // 'client' | 'ssr' | 'worker'
  moduleGraph: ModuleGraph
  transformRequest(url): Promise<TransformResult>
  hot: HotChannel           // 独立的 HMR 通道
}

// 意义:
// 1. 插件可以为不同环境提供不同行为
// 2. SSR HMR 与客户端 HMR 互不干扰
// 3. 为 Rolldown (Rust 版 Rollup) 统一铺路
```

