---
title: "ES6+ 模块系统与工程化 [P5-P6]"
level: "intermediate"
tags: ["JavaScript", "ES6", "模块", "ESM", "CJS", "tree-shaking"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# ES6+ 模块系统与工程化 [P5-P6]

> ES6 模块是 JavaScript 的官方标准。理解 ESM 和 CJS 的区别、tree-shaking 原理，才能优化打包体积。

## 核心概念（What）

### 模块化演进

```
模块化历史：
├── 全局变量 → 污染命名空间
├── IIFE → 立即执行函数（闭包隔离）
├── CommonJS → Node.js（同步加载）
├── AMD → RequireJS（异步加载）
├── CMD → SeaJS（按需加载）
└── ES6 Modules → 官方标准（静态编译）

ES6 模块优势：
├── 静态结构（编译时确定依赖）
├── tree-shaking（去除无用代码）
├── 支持异步加载
└── 浏览器原生支持
```

## 底层原理（Why）

### CommonJS

```javascript
// CommonJS（Node.js）

// math.js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };

// index.js
const { add, subtract } = require('./math');

console.log(add(1, 2)); // 3

// 特点：
// ├── 同步加载（require）
// ├── 运行时加载（动态）
// ├── 输出值的拷贝
// └── this 指向 module

// 原理：
// ├── 包装函数：(function(exports, require, module, __filename, __dirname) { ... })
// ├── 缓存：require.cache
// └── 输出拷贝：module.exports 的浅拷贝
```

### ES6 Modules

```javascript
// ES6 模块（ESM）

// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

export function multiply(a, b) {
  return a * b;
}

export default class Calculator {
  // ...
}

// index.js
import Calculator, { add, subtract } from './math.js';

console.log(add(1, 2)); // 3

// 特点：
// ├── 异步加载（import）
// ├── 编译时加载（静态）
// ├── 输出值的引用
// └── 严格模式

// 导出方式：
// 1. 命名导出
export const name = 'Alice';
export function greet() {}
export class User {}

// 2. 默认导出
export default function() {}
export default class {}

// 3. 混合导出
export const name = 'Alice';
export default function() {}

// 导入方式：
// 1. 命名导入
import { name, greet } from './module.js';

// 2. 默认导入
import myDefault from './module.js';

// 3. 全部导入
import * as module from './module.js';

// 4. 重命名
import { name as userName } from './module.js';

// 5. 动态导入（异步）
import('./module.js').then(module => {
  console.log(module.default);
});
```

### ESM vs CJS 对比

```
┌──────────────┬──────────────┬──────────────┐
│              │  CommonJS    │  ES6 Module  │
├──────────────┼──────────────┼──────────────┤
│ 加载方式     │ 运行时       │ 编译时       │
│ 加载时机     │ 同步         │ 异步         │
│ 输出         │ 值的拷贝     │ 值的引用     │
│ this         │ module       │ undefined    │
│ tree-shaking │ 不支持       │ 支持         │
│ 浏览器       │ 不支持       │ 原生支持     │
│ 语法         │ require      │ import       │
└──────────────┴──────────────┴──────────────┘

示例：
// CJS
const { add } = require('./math');
// add 是值的拷贝

// ESM
import { add } from './math.js';
// add 是值的引用
```

### tree-shaking

```javascript
// tree-shaking = 去除无用代码

// utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

// index.js
import { add } from './utils.js';

console.log(add(1, 2));

// 打包后（tree-shaking）：
// 只包含 add 函数
// subtract 和 multiply 被移除

// 条件：
// ├── 必须使用 ESM
// ├── 必须是静态导入
// ├── 必须是命名导出
// └── 构建工具支持（Webpack/Rollup/Vite）

// 副作用标记：
// package.json
{
  "sideEffects": false // 所有文件都没有副作用
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "./src/polyfills.js",
    "*.css"
  ]
}
```

## 实战应用（How）

### 动态导入

```javascript
// 动态 import（异步）
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.doSomething();
});

// 路由懒加载（React）
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

// 路由懒加载（Vue）
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];
```

### 模块加载策略

```javascript
// 1. 预加载（preload）
// <link rel="modulepreload" href="./module.js">

// 2. 条件加载
if (needsFeature) {
  import('./feature.js').then(module => {
    module.init();
  });
}

// 3. 并行加载
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js')
]).then(([mod1, mod2, mod3]) => {
  // 使用模块
});

// 4. 错误处理
import('./module.js')
  .then(module => {
    module.init();
  })
  .catch(error => {
    console.error('加载失败:', error);
  });
```

### 浏览器中使用

```html
<!-- 浏览器原生支持 -->
<script type="module">
  import { add } from './math.js';
  console.log(add(1, 2));
</script>

<!-- 外部模块 -->
<script type="module" src="./app.js"></script>

<!-- 模块特性：
  ├── 自动严格模式
  ├── 自动 defer（延迟执行）
  ├── 支持 import/export
  └── CORS（跨域限制）
-->
```

### 工程化配置

```json
// package.json
{
  "type": "module", // 整个项目使用 ESM
  "main": "./dist/index.cjs", // CJS 入口
  "module": "./dist/index.js", // ESM 入口
  "exports": {
    ".": {
      "import": "./dist/index.js", // ESM
      "require": "./dist/index.cjs" // CJS
    }
  }
}
```

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
}
```

## 高频面试题

### Q1: ESM 和 CJS 的区别？

```
┌──────────────┬──────────────┬──────────────┐
│              │  CommonJS    │  ES6 Module  │
├──────────────┼──────────────┼──────────────┤
│ 加载方式     │ 运行时       │ 编译时       │
│ 加载时机     │ 同步         │ 异步         │
│ 输出         │ 值的拷贝     │ 值的引用     │
│ tree-shaking │ 不支持       │ 支持         │
│ 浏览器       │ 不支持       │ 原生支持     │
└──────────────┴──────────────┴──────────────┘

推荐：
├── 新项目 → ESM
├── Node.js → ESM（type: "module"）
└── 兼容旧项目 → 双格式
```

### Q2: 什么是 tree-shaking？

```
tree-shaking = 去除无用代码

原理：
├── 静态分析 import/export
├── 标记未使用的导出
├── 压缩时移除
└── 减小打包体积

条件：
├── 必须使用 ESM
├── 必须是静态导入
├── 必须是命名导出
└── 构建工具支持

优化：
├── 使用命名导出
├── 避免副作用
├── 配置 sideEffects
└── 按需导入
```

### Q3: 如何实现按需加载？

```
方法：
├── 动态 import()
├── 路由懒加载
├── 组件懒加载
└── 代码分割

示例：
// 动态导入
const module = await import('./module.js');

// React 懒加载
const Component = React.lazy(() => import('./Component'));

// Vue 懒加载
component: () => import('./Component.vue')
```

## 延伸思考

1. 如何设计模块 API？
2. 如何处理循环依赖？
3. 如何优化打包体积？

## 参考资料

- [MDN 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [ECMAScript 6 入门 - 模块](https://es6.ruanyifeng.com/#docs/module)
