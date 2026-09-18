# 集成指南

> 手把手指导你在新 Vue 3 项目中搭建装配架构骨架。

## 前置要求

- Node.js >= 18
- 包管理器（pnpm / npm / yarn）
- 一个新建的 Vue 3 + Vite 项目（或已有项目）

## Step 1：新建项目（可选）

```bash
pnpm create vite my-app --template vue
cd my-app
```

## Step 2：安装依赖

参考压缩包内的 `dependencies.md`，根据你选择的 UI 框架安装对应依赖：

```bash
# 基础依赖（必须）
pnpm add vue vue-router mitt change-case

# 开发依赖（必须）
pnpm add -D vite @vitejs/plugin-vue sass-embedded

# UI 框架 — 默认方案（Quasar + Ant Design Vue）
pnpm add quasar @quasar/vite-plugin ant-design-vue
```

## Step 3：复制代码

将压缩包内 `code-template/` 目录的**所有内容**复制到项目的 `src/` 目录下：

```
src/
├── standardization/          ← 标准模板
│   ├── multiton-template/
│   └── singleton-template/
├── common/                   ← 装配引擎
│   └── architecture-design/
├── composable/               ← 组合函数
│   ├── architecture-design/
│   └── index.js
└── css/                      ← 样式变量
    ├── index.scss
    ├── dark-variables.scss
    ├── light-variables.scss
    ├── quasar-variables.scss
    ├── utils.scss
    └── scroll.scss
```

## Step 4：配置 Vite

参考压缩包内的 `vite.config.template.js`，关键配置项：

```javascript
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: 'src/css/quasar-variables.scss',
    }),
  ],
  resolve: {
    alias: {
      // 【必须】模板代码中所有 import 都依赖此别名
      src: resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 避免 macOS localhost 访问异常
  },
})
```

## Step 5：验证集成

1. 在路由中添加测试路由：

```javascript
{ path: '/test', component: () => import('src/standardization/multiton-template/index.vue') }
```

2. 启动开发服务器：`pnpm dev`
3. 访问 `http://localhost:5173/test`
4. 确认页面正常渲染，控制台无报错

## Step 6：清理验证页面

验证通过后：
1. 删除 `standardization/multiton-template/component/component-demo/` 目录
2. 删除测试路由
3. 开始开发你的业务组件

---

## Common Pitfalls FAQ

### `import.meta.glob` 报错

**原因**：`import.meta.glob` 是 Vite 特有 API，webpack 不支持。

**解决**：
- 推荐方案：使用 Vite 作为构建工具
- 如果必须用 webpack，需要将 `import.meta.glob` 替换为 `require.context`：

```javascript
// Vite（当前模板使用的方式）
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], { eager: true })

// webpack 等效写法
const modules = require.context('../module', true, /\.js$/)
```

### `src/` 别名未配置导致 import 报错

**原因**：模板代码中所有 import 都使用 `src/` 路径别名。

**解决**：确保 `vite.config.js` 中配置了 `resolve.alias`：

```javascript
resolve: {
  alias: {
    src: resolve(__dirname, 'src'),
  },
},
```

### Quasar CSS 变量不生效

**原因**：SCSS 变量文件的引入顺序不对。

**解决**：确保 `quasar` 插件配置中指定了 `sassVariables` 路径，且 `src/css/quasar-variables.scss` 文件存在。

### 深色模式适配问题

**注意**：
- 模板包含 `dark-variables.scss` 和 `light-variables.scss`
- 需要配合 VitePress 或自定义逻辑切换 `.dark` class
- Quasar 的暗色模式需要通过 `Quasar.setDarkMode(true)` 激活

### lodash / dayjs 按需引入

如果不需要完整的 lodash，可以使用 `lodash-es` 配合 tree-shaking：

```javascript
// 替代完整引入
import { debounce } from 'lodash-es'  // 而非 import _ from 'lodash'
```
