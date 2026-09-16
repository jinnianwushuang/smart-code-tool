---
title: '中级工程师（P5-P6）学习路径'
level: 'intermediate'
tags: ['中级', 'P5', 'P6', '学习路径']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# 中级工程师（P5-P6）学习路径

> 中级工程师的核心目标是「用好」——理解原理、掌握实战，能独立解决复杂问题。

## 级别特征

```
核心要求：
├── 深入理解 JS/TS 核心概念
├── 掌握框架原理（不只是会用）
├── 了解浏览器渲染、网络优化
├── 具备性能优化意识
├── 能编写可测试的代码
└── 了解工程化实践

面试重点：
├── 原理理解（不只是表面）
├── 实战经验（做过什么）
├── 问题解决能力
└── 技术深度与广度
```

---

## 学习文档（26 篇）

### CSS 进阶（2 篇）

| 文档                                                                                   | 描述                            |
| -------------------------------------------------------------------------------------- | ------------------------------- |
| [CSS 架构：BEM/CSS Modules/Tailwind [P5-P6]](/interview/intermediate/css-architecture) | BEM 命名、CSS Modules、Tailwind |
| [CSS 预处理器：Sass/Less/PostCSS [P5-P6]](/interview/intermediate/css-preprocessors)   | Sass 变量/嵌套/mixin、PostCSS   |

### JavaScript 进阶（4 篇）

| 文档                                                                                 | 描述                           |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| [闭包、作用域链与执行上下文 [P5-P6]](/interview/intermediate/js-closures-context)    | 执行上下文、闭包应用、this     |
| [异步编程深入：Promise/async/await [P5-P6]](/interview/intermediate/async-deep-dive) | Promise 链、并发控制、错误处理 |
| [ES6+ 模块系统与工程化 [P5-P6]](/interview/intermediate/es6-modules)                 | ESM vs CJS、tree-shaking       |
| [JavaScript 常用设计模式 [P5-P6]](/interview/intermediate/js-design-patterns)        | 观察者/策略/工厂/单例          |

### 浏览器/网络进阶（3 篇）

| 文档                                                                                     | 描述                     |
| ---------------------------------------------------------------------------------------- | ------------------------ |
| [浏览器渲染机制：重排/重绘/合成 [P5-P6]](/interview/intermediate/rendering-mechanism)    | 重排/重绘/合成、GPU 加速 |
| [HTTP 缓存策略：强缓存/协商缓存 [P5-P6]](/interview/intermediate/http-caching)           | Cache-Control/ETag       |
| [前端网络优化：预加载/懒加载/压缩 [P5-P6]](/interview/intermediate/network-optimization) | preload、懒加载、CDN     |

### Vue 中级（4 篇）

| 文档                                                                          | 描述                        |
| ----------------------------------------------------------------------------- | --------------------------- |
| [Vue 3 响应式原理入门 [P5-P6]](/interview/intermediate/vue-reactivity-basics) | reactive/ref 原理、依赖收集 |
| [Vue 3 生命周期深入 [P5-P6]](/interview/intermediate/vue-lifecycle)           | 完整生命周期、组合式 API    |
| [Vue 组件通信方式全景 [P5-P6]](/interview/intermediate/vue-communication)     | props/emit/provide-inject   |
| [Vue Router 路由实战 [P5-P6]](/interview/intermediate/vue-router-basics)      | 导航守卫、路由懒加载        |

### TypeScript 中级（2 篇）

| 文档                                                                         | 描述                         |
| ---------------------------------------------------------------------------- | ---------------------------- |
| [TypeScript 类型体操入门 [P5-P6]](/interview/intermediate/ts-types-practice) | 泛型、条件类型、工具类型     |
| [TypeScript 工程化实践 [P5-P6]](/interview/intermediate/ts-engineering)      | tsconfig、声明文件、框架集成 |

### React 入门（1 篇）

| 文档                                                                             | 描述                    |
| -------------------------------------------------------------------------------- | ----------------------- |
| [React 入门：JSX、Hooks、组件模式 [P5-P6]](/interview/intermediate/react-basics) | JSX、useState/useEffect |

> 📌 Flutter/Dart 中级内容已迁移至独立目录：[Flutter 中级（P5-P6）](/interview/levels/flutter#入门中级-p5-p6-4-篇)

### 工程化/性能/测试/安全（6 篇）

| 文档                                                                                    | 描述                       |
| --------------------------------------------------------------------------------------- | -------------------------- |
| [前端性能优化基础 [P5-P6]](/interview/intermediate/performance-basics)                  | Core Web Vitals、图片优化  |
| [前端测试基础：Jest/Vitest [P5-P6]](/interview/intermediate/testing-basics)             | 测试金字塔、组件测试       |
| [构建工具入门：Vite 配置与使用 [P5-P6]](/interview/intermediate/build-tools-basics)     | Vite 配置、环境变量、代理  |
| [前端错误处理与监控入门 [P5-P6]](/interview/intermediate/error-handling)                | ErrorBoundary、错误上报    |
| [Web 安全实战：CSP/SRI/依赖检查 [P5-P6]](/interview/intermediate/web-security-practice) | CSP、SRI、依赖安全         |
| [Docker 容器化基础与前端部署 [P5-P6]](/interview/intermediate/docker-basics)            | Dockerfile、docker-compose |

---

## 建议学习顺序

```
第 1-2 周：JS 进阶（4 篇）→ 深入理解语言核心
第 3-4 周：CSS 进阶 + 浏览器/网络（5 篇）→ 样式与性能
第 5-6 周：Vue 中级（4 篇）→ 框架原理
第 7 周：TypeScript（2 篇）→ 类型安全
第 8 周：React 入门（1 篇）→ 对比学习
第 9-10 周：Flutter（4 篇）→ 跨端拓展
第 11-12 周：工程化/性能/测试/安全（6 篇）→ 完整体系
```

## 晋升到高级

完成中级内容后，建议继续学习 [高级工程师（P6-P7）](/interview/levels/senior) 内容，重点深入：

- V8 引擎、GC 算法等底层原理
- Vue/React 源码级理解
- 架构设计、系统设计能力
