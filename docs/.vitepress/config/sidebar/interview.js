// 面试知识库侧边栏配置
export const interviewSidebar = {
  collapsed: false,
  items: [
    // ── 导航 ──
    {
      text: '学习路径导航',
      collapsed: false,
      items: [
        { text: '初级工程师（P4-P5）', link: '/interview/levels/junior' },
        { text: '中级工程师（P5-P6）', link: '/interview/levels/intermediate' },
        { text: '高级工程师（P6-P7）', link: '/interview/levels/senior' },
        { text: '架构师（P8）', link: '/interview/levels/architect' },
        { text: '技术主管（TL）', link: '/interview/levels/manager' },
        { text: 'Flutter 学习路径', link: '/interview/levels/flutter' },
      ],
    },
    // ── 初级（P4-P5）──
    {
      text: '初级工程师（P4-P5）',
      collapsed: true,
      items: [
        { text: 'HTML5 语义化与文档结构 [P4-P5]', link: '/interview/junior/html-semantics' },
        { text: 'CSS 布局：Flexbox 与 Grid [P4-P5]', link: '/interview/junior/css-layout' },
        { text: '响应式设计与移动端适配 [P4-P5]', link: '/interview/junior/responsive-design' },
        {
          text: 'CSS 新特性：变量、动画、过渡 [P4-P5]',
          link: '/interview/junior/css-modern-features',
        },
        { text: 'JavaScript 基础：变量、类型、运算 [P4-P5]', link: '/interview/junior/js-basics' },
        { text: '函数与作用域基础 [P4-P5]', link: '/interview/junior/functions-and-scope' },
        { text: '对象与类基础 [P4-P5]', link: '/interview/junior/objects-and-classes' },
        { text: 'DOM 操作与事件处理 [P4-P5]', link: '/interview/junior/dom-and-events' },
        { text: '浏览器基础：结构与开发者工具 [P4-P5]', link: '/interview/junior/browser-basics' },
        { text: 'HTTP 协议基础 [P4-P5]', link: '/interview/junior/http-basics' },
        { text: '本地存储与 Cookie 基础 [P4-P5]', link: '/interview/junior/storage-and-cookie' },
        { text: 'Vue 3 入门：模板、组件、生命周期 [P4-P5]', link: '/interview/junior/vue-basics' },
        {
          text: 'Vue 组件模式：Props、Emit、Slots [P4-P5]',
          link: '/interview/junior/vue-component-patterns',
        },
        {
          text: 'TypeScript 入门：类型注解与基础类型 [P4-P5]',
          link: '/interview/junior/typescript-basics',
        },
        { text: 'Git 基础：分支策略与协作流程 [P4-P5]', link: '/interview/junior/git-basics' },
        { text: 'npm/pnpm 包管理入门 [P4-P5]', link: '/interview/junior/npm-pnpm-basics' },
        { text: 'Chrome DevTools 实战 [P4-P5]', link: '/interview/junior/devtools-basics' },
        { text: '前端调试基础 [P4-P5]', link: '/interview/junior/debugging-basics' },
        { text: 'Web 安全入门：XSS/CSRF [P4-P5]', link: '/interview/junior/web-security-basics' },
        { text: 'SPA 部署基础（Nginx 配置） [P4-P5]', link: '/interview/junior/spa-deploy-basics' },
        { text: '表单与验证基础 [P4-P5]', link: '/interview/junior/form-validation-basics' },
      ],
    },
    // ── 中级（P5-P6）──
    {
      text: '中级工程师（P5-P6）',
      collapsed: true,
      items: [
        {
          text: 'CSS 架构：BEM/CSS Modules/Tailwind [P5-P6]',
          link: '/interview/intermediate/css-architecture',
        },
        {
          text: 'CSS 预处理器：Sass/Less/PostCSS [P5-P6]',
          link: '/interview/intermediate/css-preprocessors',
        },
        {
          text: '闭包、作用域链与执行上下文 [P5-P6]',
          link: '/interview/intermediate/js-closures-context',
        },
        {
          text: '异步编程深入：Promise/async/await [P5-P6]',
          link: '/interview/intermediate/async-deep-dive',
        },
        { text: 'ES6+ 模块系统与工程化 [P5-P6]', link: '/interview/intermediate/es6-modules' },
        {
          text: 'JavaScript 常用设计模式 [P5-P6]',
          link: '/interview/intermediate/js-design-patterns',
        },
        {
          text: '浏览器渲染机制：重排/重绘/合成 [P5-P6]',
          link: '/interview/intermediate/rendering-mechanism',
        },
        {
          text: 'HTTP 缓存策略：强缓存/协商缓存 [P5-P6]',
          link: '/interview/intermediate/http-caching',
        },
        {
          text: '前端网络优化：预加载/懒加载/压缩 [P5-P6]',
          link: '/interview/intermediate/network-optimization',
        },
        {
          text: 'Vue 3 响应式原理入门 [P5-P6]',
          link: '/interview/intermediate/vue-reactivity-basics',
        },
        { text: 'Vue 3 生命周期深入 [P5-P6]', link: '/interview/intermediate/vue-lifecycle' },
        { text: 'Vue 组件通信方式全景 [P5-P6]', link: '/interview/intermediate/vue-communication' },
        { text: 'Vue Router 路由实战 [P5-P6]', link: '/interview/intermediate/vue-router-basics' },
        {
          text: 'TypeScript 类型体操入门 [P5-P6]',
          link: '/interview/intermediate/ts-types-practice',
        },
        { text: 'TypeScript 工程化实践 [P5-P6]', link: '/interview/intermediate/ts-engineering' },
        {
          text: 'React 入门：JSX、Hooks、组件模式 [P5-P6]',
          link: '/interview/intermediate/react-basics',
        },
        {
          text: 'Dart 语言基础与核心特性 [P5-P6]',
          link: '/interview/intermediate/flutter-dart-basics',
        },
        {
          text: 'Flutter Widget 体系与布局系统 [P5-P6]',
          link: '/interview/intermediate/flutter-widget-and-layout',
        },
        {
          text: 'Flutter 状态管理基础：setState/Provider/Bloc [P5-P6]',
          link: '/interview/intermediate/flutter-state-management-basics',
        },
        {
          text: 'Flutter 导航与路由实战 [P5-P6]',
          link: '/interview/intermediate/flutter-navigation-and-routing',
        },
        { text: '前端性能优化基础 [P5-P6]', link: '/interview/intermediate/performance-basics' },
        {
          text: '前端测试基础：Jest/Vitest [P5-P6]',
          link: '/interview/intermediate/testing-basics',
        },
        {
          text: '构建工具入门：Vite 配置与使用 [P5-P6]',
          link: '/interview/intermediate/build-tools-basics',
        },
        { text: '前端错误处理与监控入门 [P5-P6]', link: '/interview/intermediate/error-handling' },
        {
          text: 'Web 安全实战：CSP/SRI/依赖检查 [P5-P6]',
          link: '/interview/intermediate/web-security-practice',
        },
        {
          text: 'Docker 容器化基础与前端部署 [P5-P6]',
          link: '/interview/intermediate/docker-basics',
        },
      ],
    },
    // ── 高级技术栈 ──
    {
      text: 'JavaScript & Node.js 深度（P6-P7）',
      collapsed: true,
      items: [
        {
          text: 'V8 引擎与 JavaScript 运行时 [P6-P7]',
          link: '/interview/javascript/engine-and-runtime',
        },
        { text: 'Node.js 运行时 [P6-P7]', link: '/interview/javascript/nodejs-runtime' },
        { text: 'JavaScript 类型系统深层 [P6-P7]', link: '/interview/javascript/type-system-deep' },
        { text: '异步编程模型演进 [P6-P7]', link: '/interview/javascript/async-model' },
        { text: 'GC 算法与内存管理 [P6-P7]', link: '/interview/javascript/gc-and-memory' },
        { text: '原型链本质与元编程 [P6-P7]', link: '/interview/javascript/prototype-and-oop' },
        {
          text: 'ES2025/2026 新特性与现代 Web APIs [P6-P7]',
          link: '/interview/javascript/es2025-2026-and-web-apis',
        },
      ],
    },
    {
      text: 'TypeScript 高阶（P6-P7）',
      collapsed: true,
      items: [
        { text: '高级类型体操 [P6-P7]', link: '/interview/typescript/type-challenges' },
        { text: 'TypeScript 编译器架构 [P8]', link: '/interview/typescript/compiler-internals' },
        { text: '类型系统设计哲学 [P8]', link: '/interview/typescript/type-system-design' },
        { text: 'TypeScript 5.x 新特性 [P6-P7]', link: '/interview/typescript/ts5-new-features' },
      ],
    },
    {
      text: 'Vue 深度（P6-P7）',
      collapsed: true,
      items: [
        { text: 'Vue 响应式系统底层 [P6-P7]', link: '/interview/vue/reactivity-deep' },
        { text: 'Vue 编译器优化 [P6-P7]', link: '/interview/vue/compiler-optimization' },
        { text: 'Vapor Mode 原理 [P6-P7]', link: '/interview/vue/vapor-mode' },
        {
          text: '渲染器 Patch 流程与 Diff 算法 [P6-P7]',
          link: '/interview/vue/renderer-patch-flow',
        },
        {
          text: 'Vue 3.5+ 新特性与响应式重构 [P6-P7]',
          link: '/interview/vue/vue-3.5-new-features',
        },
        { text: 'Pinia 状态管理原理与实战 [P6-P7]', link: '/interview/vue/pinia-deep' },
        { text: 'Vue Router 4 路由系统深度 [P6-P7]', link: '/interview/vue/vue-router-4' },
        { text: 'Nuxt 3 全栈框架原理与实战 [P8]', link: '/interview/vue/nuxt-3-fullstack' },
        { text: 'Vitest + Vue 测试体系 [P6-P7]', link: '/interview/vue/vitest-and-vue-testing' },
        { text: 'Vue 3 生态实战模式 [P6-P7]', link: '/interview/vue/vue-ecosystem-patterns' },
      ],
    },
    {
      text: 'React 深度（P6-P7）',
      collapsed: true,
      items: [
        { text: 'Fiber 架构与优先级调度 [P6-P7]', link: '/interview/react/fiber-architecture' },
        { text: '并发渲染与 Suspense [P6-P7]', link: '/interview/react/concurrent-rendering' },
        {
          text: 'React Server Components 原理 [P6-P7]',
          link: '/interview/react/server-components',
        },
        { text: '状态管理本质与有限状态机 [P6-P7]', link: '/interview/react/state-machine' },
        { text: 'React 19 新特性深度解析 [P6-P7]', link: '/interview/react/react-19-features' },
        { text: 'React Compiler 原理与实践 [P8]', link: '/interview/react/react-compiler' },
        { text: 'Zustand/Jotai 状态管理深度 [P6-P7]', link: '/interview/react/zustand-and-jotai' },
        { text: 'TanStack Query 数据获取与缓存 [P6-P7]', link: '/interview/react/tanstack-query' },
        { text: 'Next.js 15 全栈框架原理 [P8]', link: '/interview/react/nextjs-15' },
        {
          text: 'React Hook Form + Zod 表单体系 [P6-P7]',
          link: '/interview/react/react-hook-form-and-zod',
        },
        {
          text: 'Testing Library + MSW 测试体系 [P6-P7]',
          link: '/interview/react/react-testing-library',
        },
        { text: 'React 生态架构模式 [P8]', link: '/interview/react/react-architecture-patterns' },
      ],
    },
    {
      text: 'Flutter 高级与架构（P6-P7/P8）',
      collapsed: true,
      items: [
        { text: 'Flutter 渲染引擎 [P6-P7]', link: '/interview/flutter/rendering-engine' },
        { text: 'Dart 语言深度 [P6-P7]', link: '/interview/flutter/dart-advanced' },
        { text: 'Flutter 状态管理架构 [P8]', link: '/interview/flutter/architecture-patterns' },
        { text: 'Flutter 与原生交互 [P8]', link: '/interview/flutter/platform-interop' },
        {
          text: 'Flutter 性能优化与工程化 [P8]',
          link: '/interview/flutter/performance-engineering',
        },
        { text: 'Riverpod 状态管理深度 [P6-P7]', link: '/interview/flutter/riverpod-deep' },
        {
          text: 'BLoC/Cubit 架构模式与大规模实践 [P6-P7]',
          link: '/interview/flutter/bloc-cubit-architecture',
        },
        { text: 'GetX 生态体系 [P6-P7]', link: '/interview/flutter/getx-ecosystem' },
        { text: 'GoRouter 路由管理深度 [P6-P7]', link: '/interview/flutter/go-router-deep' },
        {
          text: 'Dio 网络层与 HTTP 客户端体系 [P6-P7]',
          link: '/interview/flutter/dio-and-networking',
        },
        {
          text: 'Flutter 本地存储与持久化 [P6-P7]',
          link: '/interview/flutter/flutter-local-storage',
        },
      ],
    },
    // ── 浏览器与网络 ──
    {
      text: '浏览器与网络（P6-P7）',
      collapsed: true,
      items: [
        {
          text: '浏览器渲染管线 [P6-P7]',
          link: '/interview/browser-and-network/rendering-pipeline',
        },
        {
          text: 'HTTP/3、WebTransport 与 QUIC [P6-P7]',
          link: '/interview/browser-and-network/http3-and-webtransport',
        },
        {
          text: 'WebAssembly 在前端的应用 [P6-P7]',
          link: '/interview/browser-and-network/wasm-frontend',
        },
        { text: '浏览器安全模型 [P6-P7]', link: '/interview/browser-and-network/security-model' },
      ],
    },
    // ── 工程化与构建 ──
    {
      text: '工程化与全栈（P6-P7/P8）',
      collapsed: true,
      items: [
        { text: '构建工具链演进 [P6-P7]', link: '/interview/engineering/build-toolchain' },
        { text: 'Monorepo 架构设计 [P8]', link: '/interview/engineering/monorepo-architecture' },
        { text: '微前端方案对比 [P8]', link: '/interview/engineering/micro-frontend' },
        { text: '设计系统与组件库架构 [P8]', link: '/interview/engineering/design-system' },
        { text: '性能预算体系 [P6-P7]', link: '/interview/engineering/performance-budget' },
        { text: '测试金字塔实战 [P6-P7]', link: '/interview/engineering/testing-strategy' },
        { text: '前端 DevOps 与发布体系 [P8]', link: '/interview/engineering/frontend-devops' },
        {
          text: 'Node.js Web 框架对比 [P6-P7]',
          link: '/interview/engineering/nodejs-web-framework',
        },
        {
          text: 'Node.js 数据库与 ORM [P6-P7]',
          link: '/interview/engineering/nodejs-database-orm',
        },
        { text: 'Node.js 部署与运维 [P6-P7]', link: '/interview/engineering/nodejs-deploy-ops' },
      ],
    },
    {
      text: '构建工具生态（P6-P7）',
      collapsed: true,
      items: [
        { text: 'Vite 核心原理与插件开发 [P6-P7]', link: '/interview/build-tools/vite-internals' },
        {
          text: '构建工具深度对比 [P8]',
          link: '/interview/build-tools/build-tool-deep-comparison',
        },
        {
          text: 'Vite 插件开发实战 [P6-P7]',
          link: '/interview/build-tools/vite-plugin-development',
        },
        {
          text: 'Monorepo 构建优化 [P8]',
          link: '/interview/build-tools/monorepo-build-optimization',
        },
        {
          text: 'Rolldown 与构建工具未来 [P8]',
          link: '/interview/build-tools/rolldown-and-future',
        },
      ],
    },
    // ── 架构与系统设计 ──
    {
      text: '架构设计（P8）',
      collapsed: true,
      items: [
        {
          text: '前端架构模式 [P8]',
          link: '/interview/architecture/frontend-architecture-patterns',
        },
        { text: '大型应用状态架构 [P8]', link: '/interview/architecture/state-architecture' },
        { text: '模块联邦 V2 [P8]', link: '/interview/architecture/module-federation-v2' },
        {
          text: 'AI 能力集成架构 [P8]',
          link: '/interview/architecture/ai-integration-architecture',
        },
        { text: '客户端数据架构 [P8]', link: '/interview/architecture/client-data-architecture' },
      ],
    },
    {
      text: '系统设计（P8）',
      collapsed: true,
      items: [
        { text: '实时协作系统设计 [P8]', link: '/interview/system-design/real-time-collaboration' },
        { text: '低代码平台架构 [P8]', link: '/interview/system-design/low-code-platform' },
        { text: 'Design Token 体系 [P8]', link: '/interview/system-design/design-token-system' },
        { text: '前端可观测性 [P8]', link: '/interview/system-design/frontend-observability' },
      ],
    },
    // ── 跨领域专题 ──
    {
      text: 'API 与跨平台架构（P6-P7）',
      collapsed: true,
      items: [
        { text: 'API 设计模式 [P8]', link: '/interview/api-architecture/api-design-patterns' },
        { text: 'BFF 模式与 API 网关 [P8]', link: '/interview/api-architecture/bff-and-gateway' },
        {
          text: '跨端技术选型矩阵 [P8]',
          link: '/interview/cross-platform/cross-platform-selection',
        },
        {
          text: '多端一致性方案 [P8]',
          link: '/interview/cross-platform/multi-platform-consistency',
        },
      ],
    },
    {
      text: '框架对比与选型（P6-P7）',
      collapsed: true,
      items: [
        {
          text: 'Signals vs Virtual DOM [P6-P7]',
          link: '/interview/framework-comparison/signal-vs-vdom',
        },
        {
          text: 'SSR/SSG/ISR 全栈方案对比 [P6-P7]',
          link: '/interview/framework-comparison/ssr-fullstack-comparison',
        },
        {
          text: '2026 元框架趋势 [P8]',
          link: '/interview/framework-comparison/meta-framework-trends',
        },
      ],
    },
    {
      text: 'AI 与新技术（P6-P7）',
      collapsed: true,
      items: [
        {
          text: 'AI 辅助开发工程化 [P6-P7]',
          link: '/interview/ai-and-new-tech/ai-assisted-development',
        },
        {
          text: 'LLM 前端集成 [P6-P7]',
          link: '/interview/ai-and-new-tech/llm-frontend-integration',
        },
        {
          text: 'MCP 协议与 Tool Use [P6-P7]',
          link: '/interview/ai-and-new-tech/mcp-and-tool-use',
        },
        { text: 'Edge Computing 前端场景 [P8]', link: '/interview/ai-and-new-tech/edge-computing' },
      ],
    },
    // ── 管理 ──
    {
      text: '技术管理（TL）',
      collapsed: true,
      items: [
        { text: '技术领导力 [TL]', link: '/interview/management/tech-leadership' },
        { text: '团队建设方法论 [TL]', link: '/interview/management/team-building' },
        { text: '项目交付管理 [TL]', link: '/interview/management/project-delivery' },
        { text: '跨团队协作 [TL]', link: '/interview/management/cross-team-collaboration' },
        {
          text: '技术雷达与创新落地 [TL]',
          link: '/interview/management/tech-radar-and-innovation',
        },
      ],
    },
  ],
}
