# 技术术语速查索引

> 本文汇总 handbook / interview / architecture-document 三大知识体系中的核心技术名词，按领域分类，方便快速检索和回忆知识体系。
> 每个术语后可查阅对应的手册或专题文档获取深度内容。

---

## 一、JavaScript 核心

### 语言基础

`变量与数据类型` `类型转换` `隐式强制` `typeof` `instanceof` `Symbol` `BigInt` `解构赋值` `展开运算符` `可选链 ?. ` `空值合并 ??` `逻辑赋值 &&= ||= ??=` `模板字面量` `标签模板` `箭头函数` `this 绑定` `call / apply / bind` `闭包` `作用域链` `执行上下文` `词法环境` `提升 Hoisting` `柯里化 Currying` `防抖 Debounce` `节流 Throttle` `深拷贝与浅拷贝` `Structured Clone` `WeakMap / WeakSet` `Object.freeze / seal` `Property Descriptor`

### 面向对象与原型

`原型链 Prototype Chain` `class 语法糖` `继承` `super` `静态方法` `getter / setter` `Proxy` `Reflect` `元编程 Metaprogramming` `new.target`

### 异步编程

`事件循环 Event Loop` `宏任务 / 微任务` `Promise` `async / await` `then / catch / finally` `Promise.all / race / allSettled / any` `回调地狱` `Async Iterator` `for await...of` `生成器 Generator` `yield` `Observable`

### 模块系统

`ESM (import / export)` `CJS (require / module.exports)` `动态 import()` `tree-shaking` `Side Effects` `循环依赖` `CommonJS 互操作`

### 内存与引擎

`V8 引擎` `词法分析` `字节码` `JIT 编译` `TurboFan` `Maglev` `GC 垃圾回收` `标记清除` `Scavenge 算法` `内存泄漏` `WeakRef` `FinalizationRegistry` `ArrayBuffer` `TypedArray` `Hidden Class` `Inline Cache (IC)` `Deoptimization` `Memory Snapshot`

### Node.js

`libuv` `事件循环 (Node)` `Stream / Buffer` `Worker Threads` `Cluster 模块` `EventEmitter` `进程间通信 IPC` `REPL` `package.json` `ESM in Node` `npx` `npm scripts` `nodemon` `--experimental-flags`

### ES 新特性

`Temporal API` `Decorators 装饰器` `View Transitions API` `Scroll-driven Animations` `Array.groupBy` `Iterator Helpers` `Promise.withResolvers` `satisfies 操作符` `using 声明 (TC39)` `Intl API` `RegExp 命名捕获组` `后行断言` `Unicode 属性转义`

### Web API 与存储

`Shadow DOM` `Web Components` `Custom Elements` `HTML Template` `localStorage` `sessionStorage` `Cookie` `IndexedDB` `Cache API` `Service Worker API` `History API` `Intersection Observer` `Mutation Observer` `Resize Observer` `Performance API` `Web Storage` `File API / Blob` `Fetch API` `XMLHttpRequest` `WebSocket` `Server-Sent Events (SSE)` `Notification API` `Geolocation API` `Clipboard API` `Web Crypto API`

---

## 二、TypeScript

### 类型系统

`类型注解` `类型推断` `联合类型` `交叉类型` `字面量类型` `枚举 Enum` `接口 Interface` `类型别名 type` `泛型 Generics` `约束 extends` `条件类型` `映射类型` `模板字面量类型` `递归类型` `工具类型 (Partial / Required / Pick / Omit / Record)` `infer 关键字` `分布式条件类型`

### 高级类型

`类型守卫 Type Guard` `类型收窄 Narrowing` `可辨识联合 Discriminated Union` `never` `unknown` `any` `void` `as const` `const 类型参数` `satisfies` `brand 品牌类型` `HKT 高阶类型` `声明合并` `模块增强` `协变 / 逆变 / 双变 Variance` `type-only import / export` `import.meta`

### 工程化

`tsconfig.json` `strict 模式` `声明文件 .d.ts` `@types` `isolatedDeclarations` `路径别名 paths` `项目引用 Project References` `编译器 API` `AST 抽象语法树` `类型检查流程`

---

## 三、Vue 生态

### Vue 3 核心

`组合式 API (Composition API)` `setup()` `ref` `reactive` `computed` `watch / watchEffect / watchPostEffect` `toRef / toRefs` `shallowRef / shallowReactive` `readonly` `effectScope` `模板语法` `v-bind / v-on / v-model / v-slot` `v-if / v-show / v-for / v-else` `v-memo` `生命周期钩子` `onMounted / onUpdated / onUnmounted` `onActivated / onDeactivated` `onErrorCaptured` `defineProps / defineEmits / defineExpose / defineModel` `defineOptions` `defineAsyncComponent` `Suspense` `Teleport` `KeepAlive` `Transition / TransitionGroup` `app.config.errorHandler` `Custom Renderer`

### 响应式原理

`Proxy / Reflect` `依赖收集 track` `触发更新 trigger` `effect 副作用` `调度器 scheduler` `惰性求值 lazy` `深层响应式` `信号 Signals`

### 编译器优化

`静态提升 Hoist Static` `补丁标记 PatchFlags` `内联缓存` `Block Tree` `Hoist Static Tree` `Cache Handlers` `Vapor Mode (无虚拟 DOM)`

### 渲染器

`虚拟 DOM Virtual DOM` `patch 流程` `Diff 算法` `最长递增子序列` `调度更新` `批量更新` `nextTick`

### 生态工具

`Vue Router 4` `导航守卫` `动态路由` `Radix Tree` `Pinia` `Store` `Plugin 系统` `持久化插件` `SSR 集成` `Vitest` `Vue Test Utils` `Playwright` `Nuxt 3` `Nitro 引擎` `auto-imports` `useTemplateRef` `useId`

### 架构模式

`Composable 组合式函数` `provide / inject` `事件总线 EventBus / Mitt` `Pipeline Assembler 模式` `状态管理分层` `业务组件 SDK`

---

## 四、React 生态

### React 核心

`JSX` `虚拟 DOM` `Hooks` `useState` `useEffect` `useRef` `useMemo` `useCallback` `useReducer` `useContext` `useLayoutEffect` `useImperativeHandle` `useDeferredValue` `useTransition` `useId` `use hook (React 19)` `useOptimistic` `useFormStatus` `useActionState` `useSyncExternalStore` `useInsertionEffect` `useDebugValue` `React.memo` `forwardRef` `createPortal` `lazy` `React.StrictMode` `ErrorBoundary`

### Fiber 架构

`Fiber 树` `时间切片 Time Slicing` `优先级调度 Lane Model` `协调 Reconciliation` `双缓冲 Double Buffering` `可中断渲染`

### 并发特性

`并发渲染 Concurrent Mode` `Suspense` `startTransition` `流式渲染 Streaming SSR` `React Server Components (RSC)` `Server Actions` `序列化协议`

### 状态管理

`Redux` `Zustand` `Jotai` `Recoil` `MobX` `Valtio` `信号 vs 不可变数据` `有限状态机 XState` `单一 Store vs 原子化`

### 生态工具

`React Hook Form` `Zod Schema 验证` `TanStack Query (React Query)` `缓存策略` `乐观更新` `无限滚动` `Testing Library` `MSW (Mock Service Worker)` `React Compiler` `自动 Memo`

### 全栈框架

`Next.js` `App Router` `Pages Router` `getServerSideProps` `getStaticProps` `Incremental Static Regeneration (ISR)` `Server Components` `Edge Runtime` `Middleware` `Turbopack` `Remix` `React Native (New Architecture)` `Expo Router`

---

## 五、Flutter / Dart

### Dart 语言

`空安全 Null Safety` `异步编程 (async / await / Future / Stream)` `Isolate 并发` `事件循环` `Mixin 线性化` `扩展方法 Extension` `枚举增强` `模式匹配 Pattern Matching` `AOT 编译` `JIT 编译` `Sound Type System`

### Flutter 核心

`Widget 体系` `StatelessWidget / StatefulWidget` `Element` `RenderObject` `三棵树 (Widget Tree / Element Tree / RenderObject Tree)` `BuildContext` `布局约束 Constraints` `事件冒泡与命中测试 Hit Testing`

### 渲染引擎

`Impeller` `Skia` `渲染管线` `栅格化 Rasterization` `图层 Layer` `RepaintBoundary`

### 状态管理

`setState` `Provider` `Riverpod` `BLoC / Cubit` `GetX` `事件驱动` `依赖注入 DI` `Codegen 代码生成` `AsyncValue`

### 路由与导航

`Navigator` `命名路由` `GoRouter` `ShellRoute` `Deep Link` `路由守卫`

### 网络与存储

`Dio` `拦截器链 Interceptor` `Transformer` `Retrofit (声明式 HTTP)` `HTTP Client` `Isar` `Hive` `SQLite` `drift` `加密存储` `SharedPreferences`

### 平台与工程化

`Platform Channel (MethodChannel / EventChannel)` `FFI (Foreign Function Interface)` `混合栈架构` `引擎管理` `模块化` `启动优化` `内存治理` `包体积优化` `灰度发布` `Hot Reload` `Hot Restart`

### 测试

`Widget 测试` `集成测试` `Golden 测试` `bloc_test` `CI 质量门禁`

---

## 六、CSS / 样式

### CSS 基础

`选择器` `优先级 Specificity` `盒模型 Box Model` `BFC (块级格式化上下文)` `Flexbox` `Grid 布局` `定位 Position` `浮动 Float` `层叠 Stacking Context` `:has()` `:is()` `:where()` `:nth-child()` `aspect-ratio` `object-fit` `content-visibility` `contain` `overscroll-behavior` `scroll-snap`

### 响应式与布局

`媒体查询 Media Query` `移动优先 Mobile First` `rem / em / vw / vh` `Container Query` `@container` `@scope` `clamp()` `CSS 变量 Custom Properties` `@layer 级联层`

### 动画与过渡

`transition` `animation` `@keyframes` `transform` `GPU 加速` `will-change` `Scroll-driven Animation` `View Transition` `clip-path` `mask` `filter / backdrop-filter` `mix-blend-mode` `isolation`

### CSS 架构

`BEM 命名` `CSS Modules` `CSS-in-JS` `Tailwind CSS 原子化` `Utility-First` `Scoped CSS` `color-mix()` `oklch / lch / lab` `@property`

### 预处理器与工具

`Sass / SCSS` `Less` `PostCSS` `Autoprefixer` `Mixin` `嵌套 Nested` `变量` `继承 @extend`

---

## 七、浏览器与网络

### 浏览器原理

`浏览器内核` `渲染管线 (Style → Layout → Paint → Composite)` `重排 Reflow` `重绘 Repaint` `合成 Composite` `GPU 加速` `多进程架构` `V8 渲染进程`

### HTTP 协议

`HTTP/1.1` `HTTP/2 (多路复用)` `HTTP/3 (QUIC)` `HTTPS (TLS/SSL)` `请求方法 GET/POST/PUT/DELETE/PATCH` `状态码 2xx/3xx/4xx/5xx` `请求头 / 响应头` `CORS 跨域` `Cookie` `SameSite` `CORS 预检 preflight` `WebSocket` `Server-Sent Events (SSE)` `长轮询 Long Polling` `gRPC` `Protobuf`

### 缓存策略

`强缓存 (Cache-Control / Expires)` `协商缓存 (ETag / Last-Modified)` `Service Worker 缓存` `HTTP Cache`

### 网络安全

`XSS (跨站脚本)` `CSRF (跨站请求伪造)` `CSP (内容安全策略)` `SRI (子资源完整性)` `COOP / COEP` `CORS` `CRLF 注入` `点击劫持` `DNS 劫持` `证书固定 Certificate Pinning` `JWT (JSON Web Token)` `OAuth 2.0` `OIDC` `Session` `Token 刷新机制` `RBAC 基于角色的访问控制` `CORS 预检 (preflight)`

### 网络优化

`DNS 预解析` `预连接 preconnect` `预加载 preload / prefetch` `懒加载 Lazy Loading` `CDN` `压缩 (gzip / brotli)` `HTTP/2 Server Push` `连接复用`

### WebTransport & WASM

`WebTransport` `WebAssembly (WASM)` `图像处理` `音视频编解码` `游戏引擎`

---

## 八、数据结构与算法

### 线性结构

`数组 Array` `链表 LinkedList` `双向链表` `循环链表` `栈 Stack` `队列 Queue` `双端队列 Deque` `优先队列` `跳表 Skip List` `LRU Cache` `一致性哈希` `倒排索引`

### 树形结构

`二叉树` `平衡二叉树 (AVL)` `红黑树` `B 树 / B+ 树` `堆 (Heap)` `Trie 字典树` `线段树` `并查集 Union-Find`

### 图结构

`有向图 / 无向图` `邻接矩阵` `邻接表` `深度优先 DFS` `广度优先 BFS` `最短路径 (Dijkstra / Floyd)` `最小生成树 (Kruskal / Prim)` `拓扑排序`

### 哈希与集合

`哈希表 HashMap` `哈希冲突` `链地址法` `开放寻址法` `Set` `Map` `布隆过滤器`

### 排序与搜索

`冒泡排序` `选择排序` `插入排序` `归并排序` `快速排序` `堆排序` `二分搜索` `双指针` `滑动窗口` `动态规划 DP` `贪心算法` `回溯 Backtracking` `分治 Divide & Conquer` `递归 Recursion` `BFS / DFS 应用`

### 复杂度

`时间复杂度 O(n)` `空间复杂度` `均摊复杂度` `Big O`

---

## 九、设计模式

### SOLID 原则

`单一职责 SRP` `开闭原则 OCP` `里氏替换 LSP` `接口隔离 ISP` `依赖倒置 DIP`

### 创建型模式

`单例模式 Singleton` `工厂方法 Factory Method` `抽象工厂 Abstract Factory` `建造者 Builder` `原型 Prototype`

### 结构型模式

`适配器 Adapter` `装饰器 Decorator` `代理 Proxy` `组合 Composite` `外观 Facade` `桥接 Bridge` `享元 Flyweight`

### 行为型模式

`观察者 Observer` `策略 Strategy` `命令 Command` `状态 State` `模板方法 Template Method` `迭代器 Iterator` `责任链 Chain of Responsibility` `中间件 Middleware`

### 前端常用模式

`发布-订阅 EventEmitter` `MVC / MVP / MVVM` `组合式 Composable` `依赖注入 DI` `Pipeline 管道模式` `Assembler 装配器模式`

---

## 十、前端工程化

### 构建工具

`Webpack` `Vite` `Rollup` `esbuild` `Turbopack` `Rspack` `Parcel` `Oxc` `Rolldown` `SWC` `Babel` `PostCSS`

### Vite 深入

`ESM 原生` `依赖预构建 Pre-Build` `HMR 热模块替换` `Rollup 插件兼容` `虚拟模块` `环境变量` `代理配置` `插件开发`

### Monorepo

`pnpm workspace` `Turborepo` `Nx` `Lerna` `Changesets` `增量构建` `远程缓存` `任务编排`

### 微前端

`Module Federation V1 / V2` `qiankun` `single-spa` `WASM 隔离` `去中心化微前端` `iframe 隔离`

### 包管理

`npm` `pnpm` `Yarn` `pnpm-lock.yaml` `workspace` `peerDependencies` `hoisting 提升` `幽灵依赖`

### 测试体系

`单元测试` `集成测试` `E2E 测试` `视觉回归测试` `性能测试` `测试金字塔` `Jest` `Vitest` `Playwright` `Cypress` `Vue Test Utils` `Testing Library` `MSW` `覆盖率 Coverage`

### CI/CD 与发布

`GitHub Actions` `GitLab CI` `Jenkins` `Feature Flag` `金丝雀发布 Canary` `蓝绿部署` `Preview Environment` `灰度发布` `A/B 测试`

### 代码质量

`ESLint` `Prettier` `Husky` `lint-staged` `commitlint` `Conventional Commits` `pre-commit hook`

---

## 十一、后端框架

### Node.js 框架

`Express` `Koa` `Fastify` `NestJS` `Egg.js` `Midway` `中间件 Middleware` `路由 Router` `控制器 Controller` `守卫 Guard` `拦截器 Interceptor` `管道 Pipe` `过滤器 Filter`

### NestJS 深入

`模块化 Module` `依赖注入 DI Container` `元编程 Reflect Metadata` `装饰器 Decorator` `Provider` `自定义装饰器` `动态模块` `全局模块` `生命周期钩子`

### Python 框架

`Django` `FastAPI` `Flask` `ORM` `Pydantic` `异步 ASGI` `WSGI` `依赖注入` `自动文档 OpenAPI`

### Egg.js

`Plugin 插件机制` `多进程模型` `Cluster` `Loader 加载机制` `ESM (V4)` `Koa 3 集成`

### 后端通用概念

`消息队列 Message Queue` `RabbitMQ` `Kafka` `Redis Stream` `缓存设计 (LRU / LFU)` `缓存失效策略` `分布式锁` `Pub/Sub 发布订阅` `速率限制 Rate Limiting` `熔断器 Circuit Breaker` `重试与幂等性` `Saga 模式` `事件驱动架构 Event-Driven`

---

## 十二、数据库

### 关系型数据库

`MySQL` `PostgreSQL` `索引 (B+ 树)` `事务 ACID` `锁机制` `MVCC` `慢查询优化` `分库分表` `读写分离` `JSONB` `窗口函数`

### NoSQL 数据库

`MongoDB` `文档模型` `聚合管道 Aggregation` `副本集 Replica Set` `分片 Sharding` `Redis` `数据结构 (String / Hash / List / Set / ZSet)` `持久化 (RDB / AOF)` `集群 Cluster` `哨兵 Sentinel` `缓存穿透 / 击穿 / 雪崩`

### 向量数据库

`Chroma` `Milvus` `向量索引 (HNSW / IVF)` `语义搜索` `Embedding` `RAG (检索增强生成)` `元数据过滤` `混合搜索 Hybrid Search`

### ORM / ODM

`Prisma` `Schema 定义` `查询构建器` `Sequelize` `模型定义` `关联查询` `Mongoose` `Schema 设计` `聚合管道` `Drift (SQLite)`

---

## 十三、DevOps / 运维

### 容器化

`Docker` `Dockerfile` `docker-compose` `镜像构建` `多阶段构建 Multi-Stage` `容器编排` `Docker Network` `Volume` `Kubernetes (K8s)` `Pod` `Deployment` `Service` `Ingress` `Helm` `Service Mesh (Istio)`

### 版本控制

`Git` `分支策略 (Git Flow / Trunk-Based)` `合并冲突` `Rebase` `Cherry-Pick` `Tag` `Submodule`

### 服务器与部署

`Nginx` `反向代理` `负载均衡` `SSL/TLS 证书` `SPA 部署 (try_files)` `PM2` `进程管理` `静态资源缓存` `APM` `Sentry` `Grafana` `Prometheus` `日志聚合 (ELK)` `链路追踪 Tracing` `告警 Alerting`

### 脚本与自动化

`Shell / Bash` `Google zx` `Makefile` `cron` `自动化任务` `VBA`

### Linux

`文件系统` `权限管理 chmod` `进程管理 ps / kill` `管道 pipe` `文本处理 (grep / awk / sed)` `系统监控 (top / htop)`

---

## 十四、架构设计

### 架构模式

`Clean Architecture 整洁架构` `六边形架构 Hexagonal` `DDD 领域驱动设计` `CQRS` `事件溯源 Event Sourcing` `有限状态机 FSM` `事件驱动架构 Event-Driven` `Saga 模式` `响应式编程 Reactive Programming`

### 微服务与分布式

`BFF (Backend for Frontend)` `API 网关` `RESTful API` `GraphQL` `tRPC` `gRPC-Web` `微服务` `服务网格 Service Mesh` `SLA` `速率限制 Rate Limiting` `熔断器 Circuit Breaker` `重试与幂等性` `消息队列 Message Queue` `分布式锁`

### 前端架构

`项目分层 (presentation / domain / data)` `状态分层` `代码分割 Code Splitting` `Design Token` `多品牌 / 多主题` `Design System` `headless UI`

### 系统设计

`实时协作 (CRDT / OT / WebSocket)` `低代码平台 (DSL / 渲染引擎 / 扩展机制)` `前端可观测性 (埋点 / 性能监控 / 错误追踪)` `离线优先 Offline-First` `IndexedDB` `SQLite WASM` `数据同步`

---

## 十五、AI 与新技术

### AI 开发

`LangChain` `链式调用 Chain` `Agent 代理` `记忆系统 Memory` `RAG 检索增强生成` `Prompt 工程` `Embedding 向量嵌入` `Token` `Tokenizer` `Transformer` `Attention 注意力机制` `Fine-tuning 微调` `RLHF` `Function Calling` `Reranking` `Hallucination 幻觉` `向量数据库`

### LLM 集成

`流式输出 Streaming` `SSE (Server-Sent Events)` `上下文管理` `本地推理 (Ollama)` `模型微调 Fine-tuning` `RLHF (人类反馈强化学习)` `Function Calling` `上下文窗口 Context Window` `Temperature` `Top-P 采样`

### MCP 协议

`MCP (Model Context Protocol)` `Tool Use` `AI Agent` `前端 AI 集成`

### 边缘计算

`Edge SSR` `Deno Deploy` `Cloudflare Workers` `边缘函数`

### AI 辅助开发

`Copilot` `AI Code Review` `AI 测试生成` `Cursor / Qoder`

---

## 十六、跨平台技术

### 跨端方案对比

`React Native` `Flutter` `Tauri` `Electron` `Expo` `Bridge 架构` `JSI (JavaScript Interface)` `Fabric 渲染器` `Yoga 布局引擎` `Hermes 引擎` `Tauri 2.0` `Capacitor`

### Electron

`主进程 / 渲染进程` `IPC 通信 (ipcMain / ipcRenderer)` `上下文隔离 Context Isolation` `preload 脚本` `BrowserWindow` `打包发布 (electron-builder / electron-forge)`

### 移动端通用

`Deep Link / Universal Link` `推送通知 Push Notification` `应用签名` `App Store / Play Store 发布` `热更新 CodePush`

---

## 十七、性能优化

### 前端性能指标

`Core Web Vitals` `LCP (Largest Contentful Paint)` `FID (First Input Delay)` `INP (Interaction to Next Paint)` `CLS (Cumulative Layout Shift)` `FCP (First Contentful Paint)` `TTFB (Time to First Byte)`

### 优化策略

`代码分割 Code Splitting` `Tree Shaking` `懒加载 Lazy Loading` `预加载 Preload` `图片优化 (WebP / AVIF)` `CDN 加速` `缓存策略` `虚拟列表 Virtual List` `防抖节流` `Web Worker` `Service Worker` `性能预算 Performance Budget`

### 移动端性能

`启动优化` `内存治理` `包体积优化` `帧率优化` `GPU 渲染` `Impeller vs Skia`

---

## 十八、可访问性 / SEO / 国际化

### 可访问性 (a11y)

`ARIA` `WCAG` `语义化 HTML` `键盘导航` `屏幕阅读器` `a11y` `焦点管理 Focus Management` `颜色对比度` `无障碍标签` `skip navigation`

### SEO

`SEO` `Meta Tags` `Open Graph` `Sitemap` `robots.txt` `结构化数据 JSON-LD` `Core Web Vitals 与 SEO` `语义化 HTML` `Canonical URL` `hreflang`

### 国际化 (i18n)

`i18n` `l10n` `Intl API` `gettext` `ICU 消息格式` `RTL 布局` `复数规则 Pluralization` `翻译记忆 Translation Memory`

---

## 十九、技术管理

`技术领导力` `RFC 流程` `技术债务管理` `技术雷达 Tech Radar` `PoC 验证` `团队建设` `招聘面试设计` `成长体系` `1on1` `项目估时` `风险管理` `质量门禁 Quality Gate` `跨团队协作` `接口契约` `联调流程` `SLA 约定` `技术选型评估框架`

---

## 二十、通用概念速查

| 缩写  | 全称                                       | 含义               |
| ----- | ------------------------------------------ | ------------------ |
| SPA   | Single Page Application                    | 单页应用           |
| MPA   | Multi Page Application                     | 多页应用           |
| CSR   | Client-Side Rendering                      | 客户端渲染         |
| SSR   | Server-Side Rendering                      | 服务端渲染         |
| SSG   | Static Site Generation                     | 静态站点生成       |
| ISR   | Incremental Static Regeneration            | 增量静态再生       |
| RSC   | React Server Components                    | React 服务端组件   |
| PWA   | Progressive Web App                        | 渐进式 Web 应用    |
| DI    | Dependency Injection                       | 依赖注入           |
| IoC   | Inversion of Control                       | 控制反转           |
| ORM   | Object-Relational Mapping                  | 对象关系映射       |
| ODM   | Object-Document Mapping                    | 对象文档映射       |
| DSL   | Domain-Specific Language                   | 领域特定语言       |
| AST   | Abstract Syntax Tree                       | 抽象语法树         |
| HMR   | Hot Module Replacement                     | 热模块替换         |
| ESM   | ECMAScript Module                          | ES 模块            |
| CJS   | CommonJS                                   | CommonJS 模块      |
| BFF   | Backend for Frontend                       | 服务于前端的后端   |
| CRDT  | Conflict-free Replicated Data Type         | 无冲突复制数据类型 |
| OT    | Operational Transformation                 | 操作转换           |
| CQRS  | Command Query Responsibility Segregation   | 命令查询职责分离   |
| DDD   | Domain-Driven Design                       | 领域驱动设计       |
| ACID  | Atomicity Consistency Isolation Durability | 事务四大特性       |
| MVCC  | Multi-Version Concurrency Control          | 多版本并发控制     |
| RAG   | Retrieval-Augmented Generation             | 检索增强生成       |
| MCP   | Model Context Protocol                     | 模型上下文协议     |
| LCP   | Largest Contentful Paint                   | 最大内容绘制       |
| INP   | Interaction to Next Paint                  | 交互到下次绘制     |
| CLS   | Cumulative Layout Shift                    | 累积布局偏移       |
| TTFB  | Time to First Byte                         | 首字节时间         |
| WASM  | WebAssembly                                | Web 汇编           |
| FFI   | Foreign Function Interface                 | 外部函数接口       |
| SLA   | Service Level Agreement                    | 服务等级协议       |
| CI/CD | Continuous Integration / Delivery          | 持续集成/交付      |
| JWT   | JSON Web Token                             | JSON 网络令牌      |
| OAuth | Open Authorization                         | 开放授权           |
| SSE   | Server-Sent Events                         | 服务端推送事件     |
| RBAC  | Role-Based Access Control                  | 基于角色的访问控制 |
| LRU   | Least Recently Used                        | 最近最少使用       |
| APM   | Application Performance Monitoring         | 应用性能监控       |
| i18n  | Internationalization                       | 国际化             |
| a11y  | Accessibility                              | 可访问性           |
| SEO   | Search Engine Optimization                 | 搜索引擎优化       |
| K8s   | Kubernetes                                 | 容器编排系统       |
| ELK   | Elasticsearch + Logstash + Kibana          | 日志聚合方案       |
