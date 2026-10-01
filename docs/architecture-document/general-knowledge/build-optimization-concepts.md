# 构建优化核心概念：Tree Shaking · 代码分割 · HMR · 依赖预构建

> 现代前端构建工具（Vite、Rolldown、Webpack、Turbopack）都在围绕这四个核心概念做优化。
> 理解它们的原理，才能在面对"包体积过大""构建太慢""HMR 不生效"等问题时精准定位。

---

## 一、Tree Shaking — 摇掉没用的代码

### 1.1 一句话定义

基于 ESM 静态分析，在打包时移除所有**未被引用的导出代码**，让最终产物只包含真正用到的部分。

### 1.2 为什么叫 "Tree Shaking"

把模块依赖图想象成一棵大树：

- **根**是入口文件（如 `main.js`）
- **枝叶**是各个模块的 `export`
- 摇一摇，**枯叶（未使用的 export）** 就掉下来了

这个概念最早由 Rollup 在 2016 年推广。

### 1.3 工作原理

```
源码（ESM）                    打包后
┌──────────────┐              ┌──────────────┐
│ utils.js     │              │ utils.js     │
│  export add  │ ──被引用──→  │  add() ✓     │
│  export sub  │ ──未引用──→  │  （已移除）    │
│  export mul  │ ──未引用──→  │  （已移除）    │
└──────────────┘              └──────────────┘
```

**关键前提**：Tree Shaking 依赖 ESM 的**静态结构**——`import`/`export` 必须在编译时就能确定，不能是动态的。

| 模块格式                       | 能否 Tree Shake | 原因                       |
| ------------------------------ | --------------- | -------------------------- |
| ESM (`import/export`)          | ✅ 可以         | 静态分析，编译时确定依赖   |
| CJS (`require/module.exports`) | ❌ 不行         | 动态执行，运行时才知道依赖 |
| UMD                            | ❌ 不行         | 兼容多种环境，无法静态分析 |

### 1.4 常见陷阱

```js
// ❌ 副作用代码会阻止 Tree Shaking
import './polyfill.js'  // 打包器不敢移除，因为可能有副作用

// ❌ 整个命名空间导入，无法精确分析
import * as utils from './utils.js'
utils.add(1, 2)  // sub、mul 也可能被保留

// ✅ 具名导入，Tree Shaking 友好
import { add } from './utils.js'

// ✅ 标记副作用：package.json 中 "sideEffects": false
{
  "sideEffects": ["./src/polyfill.js"]  // 只有这个文件有副作用
}
```

### 1.5 Vite 8 / Rolldown 中的 Tree Shaking

Rolldown 底层使用 Oxc 的**语义分析**能力进行 Tree Shaking，比传统 Rollup 的 JS 分析更精准：

- 能识别更多的死代码模式
- 内置 `minify: 'oxc'` 压缩阶段会做二次死代码消除
- 配置项从 `build.rollupOptions` 迁移到 `build.rolldownOptions`

---

## 二、代码分割 (Code Splitting) — 按需加载的基石

### 2.1 一句话定义

将一个大的 JS bundle 拆分成多个小 chunk，**只在需要时才加载**，减少首屏加载体积。

### 2.2 三种分割策略

```
┌─────────────────────────────────────────────────┐
│                 代码分割策略                       │
│                                                  │
│  ① 入口分割         ② 路由分割       ③ 组件分割  │
│  多入口各自打包      每个路由一个 chunk  动态 import │
│                                                  │
│  entry-a.js         /home → home.js    Modal.js  │
│  entry-b.js         /about → about.js  ↑ 打开时  │
│                    /login → login.js    才加载    │
└─────────────────────────────────────────────────┘
```

### 2.3 实现方式

```js
// ① 多入口（构建工具配置）
// vite.config.js
export default {
  build: {
    rolldownOptions: {
      input: {
        main: './src/main.js',
        admin: './src/admin.js',
      },
    },
  },
}

// ② 路由级分割（框架自动处理）
// Vue Router / React Router 的懒加载
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

// ③ 组件级分割（动态 import）
const showModal = async () => {
  const { Modal } = await import('./components/Modal.js')
  Modal.open()
}
```

### 2.4 分割粒度权衡

| 策略     | 首屏速度 | 请求数 | 缓存效率   | 适用场景           |
| -------- | -------- | ------ | ---------- | ------------------ |
| 不分割   | 慢       | 1      | 全量失效   | 小型项目           |
| 路由分割 | 快       | 中     | 路由级缓存 | 中大型 SPA         |
| 组件分割 | 最快     | 多     | 组件级缓存 | 大型项目、重型组件 |

### 2.5 Rolldown 的高级分包控制

Rolldown 提供了比 Rollup `manualChunks` 更灵活的 `advancedChunks`：

```js
// vite.config.js (Vite 8)
export default {
  build: {
    rolldownOptions: {
      advancedChunks: {
        groups: {
          // 把 node_modules 中的 Vue 单独分包
          'vue-vendor': {
            test: /[\\/]node_modules[\\/](vue|@vue)[\\/]/,
            minSize: 10000,
          },
        },
      },
    },
  },
}
```

---

## 三、HMR (Hot Module Replacement) — 模块热替换

### 3.1 一句话定义

修改代码后**不刷新页面**，只替换变更的模块，并保留当前应用状态。

### 3.2 HMR vs 其他刷新策略

```
┌─────────────────────────────────────────────────────────┐
│  策略对比                                                │
│                                                         │
│  手动刷新    → 改代码 → F5 → 丢失状态 → 重新导航       │
│  Live Reload → 改代码 → 自动刷新 → 丢失状态             │
│  HMR         → 改代码 → 模块替换 → 保留状态 ✓          │
│  Fast Refresh→ 改代码 → 组件替换 → 保留状态 + 错误恢复  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.3 HMR 工作流程

```
  编辑器保存
      │
      ▼
  构建工具检测文件变更
      │
      ▼
  编译变更模块（增量编译）
      │
      ▼
  通过 WebSocket 推送给浏览器
      │
      ▼
  浏览器接收更新
      │
      ├── 模块有 HMR API → 执行 accept 回调（精确替换）
      │
      └── 模块无 HMR API → 向上冒泡到父模块
                              │
                              └── 冒泡到根 → 整页刷新
```

### 3.4 HMR API 示例

```js
// 原生 HMR API（Vite 插件中使用）
if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    // newModule 是更新后的模块
    updateUI(newModule.default)
  })

  // 接受依赖模块的更新
  import.meta.hot.accept('./dep.js', (newDep) => {
    // dep.js 更新时执行
  })

  // 模块销毁（清理副作用）
  import.meta.hot.dispose(() => {
    cleanup()
  })
}
```

### 3.5 Vite 8 的 HMR 改进

| 特性                       | Vite 7 (esbuild+Rollup)                       | Vite 8 (Rolldown)                 |
| -------------------------- | --------------------------------------------- | --------------------------------- |
| 开发模式 HMR               | esbuild 转换 + WebSocket                      | Rolldown 增量编译 + WebSocket     |
| Bundled Dev Mode（实验性） | 不支持                                        | 支持（8.1+），预打包所有模块      |
| 一致性                     | dev 用 esbuild，build 用 Rollup，行为可能不同 | 统一 Rolldown，dev/build 行为一致 |

**Bundled Dev Mode** 是 Vite 8.1 引入的实验性功能：将开发模式的所有模块预打包为一个 bundle，接近生产构建的行为，但保留 HMR 能力。解决了"dev 能跑、build 就炸"的经典问题。

---

## 四、依赖预构建 (Dependency Pre-bundling)

### 4.1 一句话定义

将 `node_modules` 中的 CJS/UMD 依赖**预先转换为 ESM** 并合并，减少开发时的浏览器请求数。

### 4.2 为什么需要预构建

```
没有预构建（裸 ESM 开发服务器）：

  import lodash from 'lodash'
       │
       ▼
  浏览器请求 /node_modules/lodash/index.js
       │
       ▼
  index.js 内部有 300+ 个 require('./xxx')
       │
       ▼
  浏览器发起 300+ 个请求 → 💥 页面卡死

有预构建：

  import lodash from 'lodash'
       │
       ▼
  Vite 检测到 lodash 是 CJS 依赖
       │
       ▼
  预构建：lodash 的 300+ 文件 → 合并为 1 个 ESM 文件
       │
       ▼
  浏览器只发 1 个请求 → ✅ 秒开
```

### 4.3 预构建的缓存机制

```
node_modules/lodash/
  ├── (300+ 文件)
  │
  ▼ 预构建
node_modules/.vite/deps/
  ├── lodash.js          ← 合并后的 ESM 文件
  ├── lodash.js.metadata.json  ← 缓存元信息
  │
  ▼ 二次启动
  检查 package.json 的 dependencies 是否变化
  ├── 没变 → 直接用缓存（毫秒级启动）
  └── 变了 → 重新预构建
```

### 4.4 Vite 8 中预构建的变化

| 维度       | Vite 7 (esbuild)   | Vite 8 (Rolldown)      |
| ---------- | ------------------ | ---------------------- |
| 预构建引擎 | esbuild            | Rolldown               |
| 产物格式   | 单个 ESM 文件      | 单个 ESM 文件          |
| 缓存策略   | 基于 metadata.json | 基于 metadata.json     |
| 模块联邦   | 不支持             | 内置支持               |
| 持久缓存   | 不支持             | 支持（模块级持久缓存） |

### 4.5 手动控制预构建

```js
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建指定依赖
    include: ['lodash', 'axios'],
    // 排除某些依赖
    exclude: ['some-problematic-lib'],
    // 预构建时转换为 ESM 的额外扩展名
    extensions: ['.mjs', '.cjs'],
  },
}
```

---

## 五、四个概念的协作关系

```
┌─────────────────────────────────────────────────────────────┐
│                    构建优化的四个支柱                          │
│                                                              │
│  开发阶段                                                    │
│  ┌──────────────┐    ┌──────────┐                           │
│  │ 依赖预构建    │ →  │  HMR     │                           │
│  │ CJS→ESM 合并 │    │ 模块热替换│                           │
│  └──────────────┘    └──────────┘                           │
│                                                              │
│  生产阶段                                                    │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │ Tree Shaking  │ →  │ 代码分割     │                       │
│  │ 移除死代码    │    │ 按需加载 chunk│                       │
│  └──────────────┘    └──────────────┘                       │
│                                                              │
│  统一引擎（Vite 8）                                          │
│  ┌──────────────────────────────────────────┐               │
│  │ Rolldown（打包） + Oxc（编译）            │               │
│  │ 开发/生产 同一引擎，行为一致              │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、深度思考

1. **Tree Shaking 的边界**：如果一个库用 `export *` 导出，或者内部有副作用（如 polyfill），Tree Shaking 还能生效吗？
2. **代码分割的代价**：分割越细，HTTP 请求越多。HTTP/2 多路复用下，是否还需要过度分割？
3. **HMR 的可靠性**：为什么有时候 HMR 会"失效"需要手动刷新？冒泡边界在哪？
4. **预构建的缓存陷阱**：为什么有时改了 `node_modules` 里的代码但没触发重新预构建？如何强制清理？

---

## 参考

- [Vite 8 官方文档 — Rolldown 集成](https://cn.vitejs.dev/guide/rolldown)
- [Rolldown 官方文档](https://rolldown.rs)
- [Rollup — Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)
- [Webpack — Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite — Dependency Pre-Bundling](https://cn.vitejs.dev/guide/dep-pre-bundling)
