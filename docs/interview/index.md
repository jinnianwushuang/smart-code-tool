# 大前端面试知识体系

> 面向 2026 年，覆盖初级（P4-P5）、中级（P5-P6）、高级工程师（P6-P7）、架构师（P8）、技术主管五个层级的系统化面试知识库。
> 覆盖 Web 前端 + Node.js 全栈 + Flutter 跨端，共计 135 篇深度文档。

---

## 层级说明

| 层级             | 适用人群                 | 核心能力要求                           |
| ---------------- | ------------------------ | -------------------------------------- |
| **junior**       | 初级工程师（P4-P5）      | 基础概念、常用 API、能独立完成开发任务 |
| **intermediate** | 中级工程师（P5-P6）      | 原理理解、实战经验、能解决复杂问题     |
| **senior**       | 高级/资深工程师（P6-P7） | 深度原理、源码级理解、复杂问题排查     |
| **architect**    | 前端架构师（P8）         | 系统设计、技术选型决策、跨团队方案推动 |
| **manager**      | 技术主管/TL              | 团队管理、项目交付、技术战略规划       |

---

## 学习路径导航

> 按工程师层级组织的学习路径，每篇文档包含级别特征、相关文档链接、建议学习顺序。

| 文档                                                  | 级别         | 描述                                        |
| ----------------------------------------------------- | ------------ | ------------------------------------------- |
| [初级工程师（P4-P5）](/interview/levels/junior)       | junior       | 21 篇基础文档，HTML/CSS/JS/Vue/TS/工具链    |
| [中级工程师（P5-P6）](/interview/levels/intermediate) | intermediate | 26 篇进阶文档，JS/CSS/Vue/TS/Flutter/工程化 |
| [高级工程师（P6-P7）](/interview/levels/senior)       | senior       | 41 篇深入文档，框架源码/架构设计/性能优化   |
| [架构师（P8）](/interview/levels/architect)           | architect    | 12 篇架构文档，系统设计/技术选型/影响力     |
| [技术主管（TL）](/interview/levels/manager)           | manager      | 8 篇管理文档，团队管理/项目管理/沟通协作    |
| [Flutter 学习路径](/interview/levels/flutter)         | all          | 10 篇 Flutter 文档，从入门到进阶            |

---

## 初级工程师 [P4-P5]

| 文档                                                                                 | 层级   | 描述                                    |
| ------------------------------------------------------------------------------------ | ------ | --------------------------------------- |
| [HTML5 语义化与文档结构 [P4-P5]](/interview/junior/html-semantics)                   | junior | 语义标签、SEO、无障碍                   |
| [CSS 布局：Flexbox 与 Grid [P4-P5]](/interview/junior/css-layout)                    | junior | Flexbox 属性、Grid 布局、居中方案       |
| [响应式设计与移动端适配 [P4-P5]](/interview/junior/responsive-design)                | junior | 媒体查询、移动优先、rem/vw              |
| [CSS 新特性：变量、动画、过渡 [P4-P5]](/interview/junior/css-modern-features)        | junior | CSS 变量、transition、animation         |
| [JavaScript 基础：变量、类型、运算 [P4-P5]](/interview/junior/js-basics)             | junior | 数据类型、类型转换、运算符              |
| [函数与作用域基础 [P4-P5]](/interview/junior/functions-and-scope)                    | junior | 函数声明、箭头函数、作用域              |
| [对象与类基础 [P4-P5]](/interview/junior/objects-and-classes)                        | junior | 对象字面量、class、继承                 |
| [DOM 操作与事件处理 [P4-P5]](/interview/junior/dom-and-events)                       | junior | querySelector、事件监听、事件委托       |
| [浏览器基础：结构与开发者工具 [P4-P5]](/interview/junior/browser-basics)             | junior | 浏览器结构、URL→渲染、DevTools          |
| [HTTP 协议基础 [P4-P5]](/interview/junior/http-basics)                               | junior | HTTP 方法、状态码、HTTPS                |
| [浏览器存储全景 [P4-P5]](/interview/junior/storage-and-cookie)                       | junior | localStorage/Cookie/IndexedDB/Cache API |
| [Vue 3 入门：模板、组件、生命周期 [P4-P5]](/interview/junior/vue-basics)             | junior | 模板语法、组件注册、生命周期            |
| [Vue 组件模式：Props、Emit、Slots [P4-P5]](/interview/junior/vue-component-patterns) | junior | Props/Emit/Slots/provide-inject         |
| [TypeScript 入门：类型注解与基础类型 [P4-P5]](/interview/junior/typescript-basics)   | junior | 基础类型、接口、枚举                    |
| [Git 基础：分支策略与协作流程 [P4-P5]](/interview/junior/git-basics)                 | junior | add/commit/push、分支、合并             |
| [npm/pnpm 包管理入门 [P4-P5]](/interview/junior/npm-pnpm-basics)                     | junior | package.json、依赖管理、scripts         |
| [Chrome DevTools 实战 [P4-P5]](/interview/junior/devtools-basics)                    | junior | Elements/Console/Network/Sources        |
| [前端调试基础 [P4-P5]](/interview/junior/debugging-basics)                           | junior | debugger、断点、条件断点                |
| [Web 安全入门：XSS/CSRF [P4-P5]](/interview/junior/web-security-basics)              | junior | XSS 类型与防范、CSRF 原理               |
| [SPA 部署基础（Nginx 配置） [P4-P5]](/interview/junior/spa-deploy-basics)            | junior | Nginx try_files、History 模式           |
| [表单与验证基础 [P4-P5]](/interview/junior/form-validation-basics)                   | junior | 表单控件、验证规则、正则                |

---

## 中级工程师 [P5-P6]

| 文档                                                                                       | 层级         | 描述                                     |
| ------------------------------------------------------------------------------------------ | ------------ | ---------------------------------------- |
| [CSS 架构：BEM/CSS Modules/Tailwind [P5-P6]](/interview/intermediate/css-architecture)     | intermediate | BEM 命名、CSS Modules、Tailwind          |
| [CSS 预处理器：Sass/Less/PostCSS [P5-P6]](/interview/intermediate/css-preprocessors)       | intermediate | Sass 变量/嵌套/mixin、PostCSS            |
| [闭包、作用域链与执行上下文 [P5-P6]](/interview/intermediate/js-closures-context)          | intermediate | 执行上下文、闭包应用、this               |
| [异步编程深入：Promise/async/await [P5-P6]](/interview/intermediate/async-deep-dive)       | intermediate | Promise 链、并发控制、错误处理           |
| [ES6+ 模块系统与工程化 [P5-P6]](/interview/intermediate/es6-modules)                       | intermediate | ESM vs CJS、tree-shaking、动态 import    |
| [JavaScript 常用设计模式 [P5-P6]](/interview/intermediate/js-design-patterns)              | intermediate | 观察者/策略/工厂/单例/装饰器             |
| [浏览器渲染机制：重排/重绘/合成 [P5-P6]](/interview/intermediate/rendering-mechanism)      | intermediate | 重排/重绘/合成、GPU 加速                 |
| [HTTP 缓存策略：强缓存/协商缓存 [P5-P6]](/interview/intermediate/http-caching)             | intermediate | Cache-Control/ETag、缓存策略设计         |
| [前端网络优化：预加载/懒加载/压缩 [P5-P6]](/interview/intermediate/network-optimization)   | intermediate | preload/prefetch、懒加载、CDN            |
| [Vue 3 响应式原理入门 [P5-P6]](/interview/intermediate/vue-reactivity-basics)              | intermediate | reactive/ref 原理、依赖收集/派发         |
| [Vue 3 生命周期深入 [P5-P6]](/interview/intermediate/vue-lifecycle)                        | intermediate | 完整生命周期、组合式 API 钩子            |
| [Vue 组件通信方式全景 [P5-P6]](/interview/intermediate/vue-communication)                  | intermediate | props/emit/provide-inject/v-model        |
| [Vue Router 路由实战 [P5-P6]](/interview/intermediate/vue-router-basics)                   | intermediate | 路由配置、导航守卫、路由懒加载           |
| [TypeScript 类型体操入门 [P5-P6]](/interview/intermediate/ts-types-practice)               | intermediate | 泛型、条件类型、映射类型、工具类型       |
| [TypeScript 工程化实践 [P5-P6]](/interview/intermediate/ts-engineering)                    | intermediate | tsconfig 配置、声明文件、框架集成        |
| [React 入门：JSX、Hooks、组件模式 [P5-P6]](/interview/intermediate/react-basics)           | intermediate | JSX、useState/useEffect、组件模式        |
| [前端性能优化基础 [P5-P6]](/interview/intermediate/performance-basics)                     | intermediate | Core Web Vitals、图片优化、代码分割      |
| [前端测试基础：Jest/Vitest [P5-P6]](/interview/intermediate/testing-basics)                | intermediate | 测试金字塔、Vitest/Jest、组件测试        |
| [构建工具入门：Vite 配置与使用 [P5-P6]](/interview/intermediate/build-tools-basics)        | intermediate | Vite 配置、环境变量、代理                |
| [前端错误处理与监控入门 [P5-P6]](/interview/intermediate/error-handling)                   | intermediate | ErrorBoundary、全局错误捕获、上报        |
| [Web 安全实战：CSP/SRI/依赖检查 [P5-P6]](/interview/intermediate/web-security-practice)    | intermediate | CSP 策略、SRI、依赖安全检查              |
| [Docker 容器化基础与前端部署 [P5-P6]](/interview/intermediate/docker-basics)               | intermediate | Dockerfile、docker-compose、容器化部署   |
| [Dart 语言基础与核心特性 [P5-P6]](/interview/intermediate/flutter-dart-basics)             | intermediate | 空安全、异步编程、OOP、Mixin             |
| [Flutter Widget 体系与布局系统 [P5-P6]](/interview/intermediate/flutter-widget-and-layout) | intermediate | Widget 生命周期、布局约束、常用布局组件  |
| [Flutter 状态管理基础 [P5-P6]](/interview/intermediate/flutter-state-management-basics)    | intermediate | setState、Provider、Bloc 入门            |
| [Flutter 导航与路由实战 [P5-P6]](/interview/intermediate/flutter-navigation-and-routing)   | intermediate | Navigator、命名路由、GoRouter、Deep Link |

---

## JavaScript & Node.js 深度 [P6-P7]

| 文档                                                                                        | 层级   | 描述                                                             |
| ------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| [V8 引擎与 JavaScript 运行时 [P6-P7]](/interview/javascript/engine-and-runtime)             | senior | V8 编译流程、事件循环、内存管理                                  |
| [Node.js 运行时 [P6-P7]](/interview/javascript/nodejs-runtime)                              | senior | libuv、Stream/Buffer、Worker Threads、Cluster                    |
| [JavaScript 类型系统深层 [P6-P7]](/interview/javascript/type-system-deep)                   | senior | 类型强制转换、结构化类型、与 TS 对比                             |
| [异步编程模型演进 [P6-P7]](/interview/javascript/async-model)                               | senior | 回调→Promise→async/await→Async Iterator                          |
| [GC 算法与内存管理 [P6-P7]](/interview/javascript/gc-and-memory)                            | senior | GC 算法、内存泄漏排查、WeakRef                                   |
| [原型链本质与元编程 [P6-P7]](/interview/javascript/prototype-and-oop)                       | senior | 原型链、class 底层、Proxy/Reflect 元编程                         |
| [ES2025/2026 新特性与现代 Web APIs [P6-P7]](/interview/javascript/es2025-2026-and-web-apis) | senior | Temporal、Decorators、View Transitions、Scroll-driven Animations |

---

## TypeScript 高阶 [P6-P7/P8]

| 文档                                                                    | 层级      | 描述                                                   |
| ----------------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| [高级类型体操 [P6-P7]](/interview/typescript/type-challenges)           | senior    | 条件类型、模板字面量类型、递归类型                     |
| [TypeScript 编译器架构 [P8]](/interview/typescript/compiler-internals)  | architect | 编译器架构、AST、类型检查流程                          |
| [类型系统设计哲学 [P8]](/interview/typescript/type-system-design)       | architect | HKT 缺失、brand 模式、类型安全设计                     |
| [TypeScript 5.x 新特性 [P6-P7]](/interview/typescript/ts5-new-features) | senior    | satisfies、isolatedDeclarations、using、const 类型参数 |

---

## 浏览器与网络 [P6-P7]

| 文档                                                                                          | 层级   | 描述                            |
| --------------------------------------------------------------------------------------------- | ------ | ------------------------------- |
| [浏览器渲染管线 [P6-P7]](/interview/browser-and-network/rendering-pipeline)                   | senior | 样式计算→布局→分层→绘制→合成    |
| [HTTP/3、WebTransport 与 QUIC [P6-P7]](/interview/browser-and-network/http3-and-webtransport) | senior | HTTP/3、WebTransport、QUIC 影响 |
| [WebAssembly 在前端的应用 [P6-P7]](/interview/browser-and-network/wasm-frontend)              | senior | 图像处理、编解码、游戏引擎      |
| [浏览器安全模型 [P6-P7]](/interview/browser-and-network/security-model)                       | senior | CSP、COOP/COEP、SRI、沙箱机制   |

---

## Vue 深度 [P6-P7/P8]

| 文档                                                                        | 层级      | 描述                               |
| --------------------------------------------------------------------------- | --------- | ---------------------------------- |
| [Vue 响应式系统底层 [P6-P7]](/interview/vue/reactivity-deep)                | senior    | Proxy/Reflect、依赖收集、调度器    |
| [Vue 编译器优化 [P6-P7]](/interview/vue/compiler-optimization)              | senior    | 静态提升、补丁标记、内联缓存       |
| [Vapor Mode 原理 [P6-P7]](/interview/vue/vapor-mode)                        | senior    | 无虚拟 DOM 编译模式                |
| [渲染器 Patch 流程与 Diff 算法 [P6-P7]](/interview/vue/renderer-patch-flow) | senior    | patch 流程、diff 算法、调度更新    |
| [Vue 3.5+ 新特性与响应式重构 [P6-P7]](/interview/vue/vue-3.5-new-features)  | senior    | useTemplateRef、useId、defineModel |
| [Pinia 状态管理原理与实战 [P6-P7]](/interview/vue/pinia-deep)               | senior    | Plugin 系统、持久化、SSR 集成      |
| [Vue Router 4 路由系统深度 [P6-P7]](/interview/vue/vue-router-4)            | senior    | Radix Tree、导航守卫、动态路由     |
| [Nuxt 3 全栈框架原理与实战 [P8]](/interview/vue/nuxt-3-fullstack)           | architect | SSR/SSG/ISR、Nitro、auto-imports   |
| [Vitest + Vue 测试体系 [P6-P7]](/interview/vue/vitest-and-vue-testing)      | senior    | Vitest、Vue Test Utils、Playwright |
| [Vue 3 生态实战模式 [P6-P7]](/interview/vue/vue-ecosystem-patterns)         | senior    | Composable、Suspense、KeepAlive    |

---

## React 深度 [P6-P7/P8]

| 文档                                                                               | 层级      | 描述                             |
| ---------------------------------------------------------------------------------- | --------- | -------------------------------- |
| [Fiber 架构与优先级调度 [P6-P7]](/interview/react/fiber-architecture)              | senior    | Fiber 架构、时间切片、优先级调度 |
| [并发渲染与 Suspense [P6-P7]](/interview/react/concurrent-rendering)               | senior    | 并发渲染、Suspense、Transitions  |
| [React Server Components 原理 [P6-P7]](/interview/react/server-components)         | senior    | RSC 原理、序列化协议、流式渲染   |
| [状态管理本质与有限状态机 [P6-P7]](/interview/react/state-machine)                 | senior    | 状态管理本质、信号 vs 不可变     |
| [React 19 新特性深度解析 [P6-P7]](/interview/react/react-19-features)              | senior    | use hook、Actions、useOptimistic |
| [React Compiler 原理与实践 [P8]](/interview/react/react-compiler)                  | architect | 自动 Memo、编译时优化            |
| [Zustand/Jotai 状态管理深度 [P6-P7]](/interview/react/zustand-and-jotai)           | senior    | 单一 store vs 原子化模型         |
| [TanStack Query 数据获取与缓存 [P6-P7]](/interview/react/tanstack-query)           | senior    | 缓存策略、乐观更新、无限滚动     |
| [Next.js 15 全栈框架原理 [P8]](/interview/react/nextjs-15)                         | architect | App Router、Server Actions、缓存 |
| [React Hook Form + Zod 表单体系 [P6-P7]](/interview/react/react-hook-form-and-zod) | senior    | uncontrolled、Schema 验证        |
| [Testing Library + MSW 测试体系 [P6-P7]](/interview/react/react-testing-library)   | senior    | 用户视角测试、网络 Mock          |
| [React 生态架构模式 [P8]](/interview/react/react-architecture-patterns)            | architect | 项目分层、状态分层、代码分割     |

---

## Flutter 高级与架构 [P6-P7/P8]

| 文档                                                                                  | 层级      | 描述                                         |
| ------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| [Flutter 渲染引擎 [P6-P7]](/interview/flutter/rendering-engine)                       | senior    | Impeller/Skia、三棵树机制                    |
| [Dart 语言深度 [P6-P7]](/interview/flutter/dart-advanced)                             | senior    | Isolate 并发、Mixin 线性化、AOT/JIT          |
| [Flutter 状态管理架构 [P8]](/interview/flutter/architecture-patterns)                 | architect | Riverpod/BLoC 大规模、Clean Architecture、DI |
| [Flutter 与原生交互 [P8]](/interview/flutter/platform-interop)                        | architect | Platform Channel、FFI、混合栈架构            |
| [Flutter 性能优化与工程化 [P8]](/interview/flutter/performance-engineering)           | architect | 启动优化、内存治理、包体积、灰度发布         |
| [Riverpod 状态管理深度 [P6-P7]](/interview/flutter/riverpod-deep)                     | senior    | Codegen、AsyncValue、Provider 依赖图         |
| [BLoC/Cubit 架构模式与大规模实践 [P6-P7]](/interview/flutter/bloc-cubit-architecture) | senior    | 事件驱动、bloc_test、分层架构                |
| [GetX 生态体系 [P6-P7]](/interview/flutter/getx-ecosystem)                            | senior    | 状态/路由/DI 三合一、GetBuilder vs Obx       |
| [GoRouter 路由管理深度 [P6-P7]](/interview/flutter/go-router-deep)                    | senior    | ShellRoute、Deep Link、路由守卫              |
| [Dio 网络层与 HTTP 客户端体系 [P6-P7]](/interview/flutter/dio-and-networking)         | senior    | 拦截器链、Transformer、取消请求              |
| [Flutter 本地存储与持久化 [P6-P7]](/interview/flutter/flutter-local-storage)          | senior    | Isar/Hive/SQLite/drift、加密存储             |

---

## 框架对比与选型 [P6-P7/P8]

| 文档                                                                                         | 层级      | 描述                               |
| -------------------------------------------------------------------------------------------- | --------- | ---------------------------------- |
| [Signals vs Virtual DOM [P6-P7]](/interview/framework-comparison/signal-vs-vdom)             | senior    | 技术路线之争                       |
| [SSR/SSG/ISR 全栈方案对比 [P6-P7]](/interview/framework-comparison/ssr-fullstack-comparison) | senior    | Next/Nuxt/Astro/SvelteKit          |
| [2026 元框架趋势 [P8]](/interview/framework-comparison/meta-framework-trends)                | architect | Turbopack、Rust 编译、Edge Runtime |

---

## 工程化与全栈 [P6-P7/P8]

| 文档                                                                         | 层级      | 描述                                   |
| ---------------------------------------------------------------------------- | --------- | -------------------------------------- |
| [Vite 核心原理与插件开发 [P6-P7]](/interview/build-tools/vite-internals)     | senior    | ESM 原生、HMR、Rollup 集成             |
| [构建工具深度对比 [P8]](/interview/build-tools/build-tool-deep-comparison)   | architect | Vite vs Turbopack vs Rspack vs Webpack |
| [Vite 插件开发实战 [P6-P7]](/interview/build-tools/vite-plugin-development)  | senior    | Rollup 兼容、虚拟模块、自动导入插件    |
| [Monorepo 构建优化 [P8]](/interview/build-tools/monorepo-build-optimization) | architect | Turborepo 缓存、Nx 计算图、增量构建    |
| [Rolldown 与构建工具未来 [P8]](/interview/build-tools/rolldown-and-future)   | architect | Rolldown、Oxc 工具链、Rust 化趋势      |
| [构建工具链演进 [P6-P7]](/interview/engineering/build-toolchain)             | senior    | Webpack→Vite→Turbopack→Rspack→Oxc      |
| [Monorepo 架构设计 [P8]](/interview/engineering/monorepo-architecture)       | architect | pnpm workspace、Turborepo、Nx          |
| [微前端方案对比 [P8]](/interview/engineering/micro-frontend)                 | architect | Module Federation、qiankun、WASM 隔离  |
| [设计系统与组件库架构 [P8]](/interview/engineering/design-system)            | architect | headless UI、design token、主题引擎    |
| [性能预算体系 [P6-P7]](/interview/engineering/performance-budget)            | senior    | Core Web Vitals、INP、优化策略         |
| [测试金字塔实战 [P6-P7]](/interview/engineering/testing-strategy)            | senior    | 单元/集成/E2E/视觉回归/性能测试        |
| [前端 DevOps 与发布体系 [P8]](/interview/engineering/frontend-devops)        | architect | CI/CD、Feature Flag、金丝雀发布        |
| [Node.js Web 框架对比 [P6-P7]](/interview/engineering/nodejs-web-framework)  | senior    | Express/Koa/Fastify/NestJS 对比        |
| [Node.js 数据库与 ORM [P6-P7]](/interview/engineering/nodejs-database-orm)   | senior    | MySQL/PostgreSQL/MongoDB/Redis 集成    |
| [Node.js 部署与运维 [P6-P7]](/interview/engineering/nodejs-deploy-ops)       | senior    | Docker、PM2、BFF、监控告警             |

---

## API 架构体系 [P8]

| 文档                                                                    | 层级      | 描述                                   |
| ----------------------------------------------------------------------- | --------- | -------------------------------------- |
| [API 设计模式 [P8]](/interview/api-architecture/api-design-patterns)    | architect | RESTful/GraphQL/tRPC/gRPC-Web 对比选型 |
| [BFF 模式与 API 网关 [P8]](/interview/api-architecture/bff-and-gateway) | architect | BFF、API 网关、契约设计                |

---

## 跨平台架构 [P8]

| 文档                                                                        | 层级      | 描述                                      |
| --------------------------------------------------------------------------- | --------- | ----------------------------------------- |
| [跨端技术选型矩阵 [P8]](/interview/cross-platform/cross-platform-selection) | architect | RN vs Flutter vs Tauri vs Electron vs Web |
| [多端一致性方案 [P8]](/interview/cross-platform/multi-platform-consistency) | architect | 共享代码策略、平台差异抽象层              |

---

## 架构设计 [P8]

| 文档                                                                        | 层级      | 描述                                        |
| --------------------------------------------------------------------------- | --------- | ------------------------------------------- |
| [前端架构模式 [P8]](/interview/architecture/frontend-architecture-patterns) | architect | Clean Architecture、Hexagonal、DDD 前端落地 |
| [大型应用状态架构 [P8]](/interview/architecture/state-architecture)         | architect | 有限状态机、事件溯源、CQRS 前端             |
| [模块联邦 V2 [P8]](/interview/architecture/module-federation-v2)            | architect | 模块联邦 V2 与去中心化微前端                |
| [AI 能力集成架构 [P8]](/interview/architecture/ai-integration-architecture) | architect | Agent 前端、流式协议、上下文管理            |
| [客户端数据架构 [P8]](/interview/architecture/client-data-architecture)     | architect | 离线优先、IndexedDB/SQLite WASM、数据同步   |

---

## 系统设计 [P8]

| 文档                                                                      | 层级      | 描述                            |
| ------------------------------------------------------------------------- | --------- | ------------------------------- |
| [实时协作系统设计 [P8]](/interview/system-design/real-time-collaboration) | architect | CRDT、OT、WebSocket 架构        |
| [低代码平台架构 [P8]](/interview/system-design/low-code-platform)         | architect | DSL 设计、渲染引擎、扩展机制    |
| [Design Token 体系 [P8]](/interview/system-design/design-token-system)    | architect | 多品牌/多主题/跨平台 Token 流转 |
| [前端可观测性 [P8]](/interview/system-design/frontend-observability)      | architect | 埋点体系、性能监控、错误追踪    |

---

## AI 与新技术 [P6-P7/P8]

| 文档                                                                            | 层级      | 描述                                      |
| ------------------------------------------------------------------------------- | --------- | ----------------------------------------- |
| [AI 辅助开发工程化 [P6-P7]](/interview/ai-and-new-tech/ai-assisted-development) | senior    | Copilot 集成、Prompt 工程、代码审查       |
| [LLM 前端集成 [P6-P7]](/interview/ai-and-new-tech/llm-frontend-integration)     | senior    | 流式输出、Tokenizer、本地推理             |
| [MCP 协议与 Tool Use [P6-P7]](/interview/ai-and-new-tech/mcp-and-tool-use)      | senior    | MCP 协议、Tool Use 前端实践               |
| [Edge Computing 前端场景 [P8]](/interview/ai-and-new-tech/edge-computing)       | architect | Edge SSR、Deno Deploy、Cloudflare Workers |

---

## 技术管理 [TL]

| 文档                                                                       | 层级    | 描述                             |
| -------------------------------------------------------------------------- | ------- | -------------------------------- |
| [技术领导力 [TL]](/interview/management/tech-leadership)                   | manager | 技术决策、RFC 流程、技术债务管理 |
| [团队建设方法论 [TL]](/interview/management/team-building)                 | manager | 招聘面试设计、成长体系、1on1     |
| [项目交付管理 [TL]](/interview/management/project-delivery)                | manager | 估时方法、风险管理、质量门禁     |
| [跨团队协作 [TL]](/interview/management/cross-team-collaboration)          | manager | 接口契约、联调流程、SLA 约定     |
| [技术雷达与创新落地 [TL]](/interview/management/tech-radar-and-innovation) | manager | 技术选型评估框架、PoC 流程       |

---

## 使用建议

- **按层级学习**：先掌握 senior 级别内容，再向 architect/manager 层级拓展
- **按专题深入**：选择 2-3 个核心领域做到 expert 级别深度
- **面试准备**：每篇文档包含高频面试题和延伸思考，可直接用于自测
- **持续更新**：文档会随技术发展持续更新，建议定期查看
