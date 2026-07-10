---
title: 用户端类型项目技术选型
order: 104
---

# Vue 3 用户端项目技术选型指南

Vue 3 用户端项目通常对性能、首屏加载速度、SEO 以及交互体验有极高要求。本指南将提供一套现代化的 Vue 3 选型方案。

## 1. 核心技术栈 (Core Stack)

- **框架核心**: [Vue 3 (Composition API)](https://cn.vuejs.org/) - 利用组合式 API 实现逻辑解耦与代码复用。
- **全栈框架**: [Nuxt.js](https://nuxt.com) - **首选推荐**。提供成熟的 SSR/SSG/ISR 方案，内置自动导入、文件路由及极致的性能优化，是面向 SEO 应用的标准选择。
- **构建工具**: [Vite](https://cn.vitejs.dev/) - 如果不使用 Nuxt，Vite 是 Vue 项目的不二之选。
- **编程语言**: [TypeScript](https://www.typescriptlang.org/) - 现代前端开发的基石，提供卓越的 IDE 支持。

## 2. UI 框架与组件 (UI Frameworks & Components)

- **原子化 CSS**: [Tailwind CSS](https://tailwindcss.com/) 或 [UnoCSS](https://unocss.dev/) - 快速构建响应式界面，减少打包后的 CSS 体积。
- **Headless UI (无样式库)**:
  - **[Radix Vue](https://www.radix-vue.com)**: Radix UI 的 Vue 移植版，提供无障碍、可定制的底层组件原语。
  - **[Headless UI Vue](https://headlessui.com/vue/menu)**: Tailwind 官方出品，交互简洁且易于定制。
- **组件库 (可选)**:
  - **[shadcn-vue](https://www.shadcn-vue.com)**: 基于 Radix Vue 和 Tailwind，通过代码拷贝模式实现极致的 UI 控制权。
  - **[PrimeVue](https://primevue.org/)**: 组件极其丰富，支持 Unstyled 模式，适合交互极其复杂的 C 端产品。
- **图标库**: [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next) 或 [Iconify](https://iconify.design/)。

## 3. 状态管理与数据流 (State Management)

- **服务端状态**: [TanStack Query (Vue Query)](https://tanstack.com/query) - 解决请求缓存、自动同步、分页加载及异步逻辑封装的最佳实践。
- **全局状态**: [Pinia](https://pinia.vuejs.org/zh/) - Vue 官方推荐，轻量、直观且类型友好。
- **表单管理**: [VeeValidate](https://vee-validate.logaretm.com/) 配合 [Zod](https://zod.dev/) 进行严密的验证。

## 4. 路由与导航 (Routing & Navigation)

- **框架内置**: Nuxt Router - 基于文件系统的路由，支持中间件与嵌套路由。
- **基础路由**: [Vue Router](https://router.vuejs.org/zh/) - 传统 SPA 项目的标准方案。

## 5. 业务能力增强 (Business Logic)

- **组合式工具库**: [VueUse](https://vueuse.org/) - **核心必选**。内置上百个 Composable 函数，涵盖浏览器、传感器、动画等方方面面。
- **动画**: [VueUse / Motion](https://motion.vueuse.org/) - 基于 Motion One，提供简洁的声明式动画。
- **国际化**: [Vue I18n](https://vue-i18n.intlify.dev/)。

## 6. 质量保证与测试 (Quality Assurance)

- **单元测试**: [Vitest](https://vitest.dev) - 与 Vite/Nuxt 深度集成。
- **端到端测试**: [Playwright](https://playwright.dev)。
- **静态检查**: ESLint + Prettier + Biome。

## 7. 性能优化与监控 (Performance & Monitoring)

- **性能分析**: [Lighthouse](https://developer.chrome.com/docs/lighthouse/)。
- **错误捕获**: [Sentry](https://sentry.io/) - 监控线上运行时的脚本错误及性能数据。
- **图片处理**: [Nuxt Image](https://image.nuxt.com/) - 自动实现图片的自适应、懒加载及格式转换。

## 8. 项目初始化 package.json 参考

以下提供两套生产可用的 `package.json` 模板，可根据实际选型方案选择使用。

### 方案 A：Nuxt.js + Tailwind CSS + shadcn-vue（SEO / SSR 优先）

适用于门户、电商、内容网站等需要 SEO 和高性能首屏的项目。

```json
{
  "name": "vue-client-nuxt",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "nuxt": "^3.15.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0",
    "@pinia/nuxt": "^0.9.0",
    "@tanstack/vue-query": "^5.62.0",
    "@vueuse/nuxt": "^12.4.0",
    "@vueuse/core": "^12.4.0",
    "vue-i18n": "^10.0.5",
    "@nuxtjs/i18n": "^9.1.0",
    "@nuxt/image": "^1.8.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@nuxt/devtools": "^1.7.0",
    "@nuxt/eslint": "^0.7.4",
    "@nuxt/tailwindcss": "^6.12.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vue-tsc": "^2.2.0",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.3.0",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6"
  },
  "lint-staged": {
    "*.{vue,js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 方案 B：Vite + Pinia + VueUse + Headless UI（SPA 优先）

适用于追求极致交互体验的单页 Web App，不需要 SSR 的场景。

```json
{
  "name": "vue-client-spa",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0",
    "@tanstack/vue-query": "^5.62.0",
    "@vueuse/core": "^12.4.0",
    "@vueuse/motion": "^2.2.6",
    "vue-i18n": "^10.0.5",
    "radix-vue": "^1.9.12",
    "axios": "^1.7.9",
    "zod": "^3.24.1",
    "vee-validate": "^4.15.0",
    "@zodios/core": "^10.9.6"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.7",
    "vue-tsc": "^2.2.0",
    "typescript": "^5.7.3",
    "@types/node": "^22.10.5",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "unplugin-auto-import": "^0.18.6",
    "unplugin-vue-components": "^0.27.5",
    "eslint": "^9.17.0",
    "eslint-plugin-vue": "^9.32.0",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.3.0",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6",
    "@playwright/test": "^1.49.1"
  },
  "lint-staged": {
    "*.{vue,js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

> **使用说明**：
>
> - Nuxt 方案建议使用 `pnpm` 安装，初始化后可通过 `npx nuxi@latest init` 生成基础项目结构。
> - SPA 方案中 `radix-vue` 为 Headless UI 底层库，可配合 Tailwind 自定义样式，或直接使用 `shadcn-vue` CLI 安装组件。
> - 版本号以发布时的最新稳定版为准，建议定期通过 `npx npm-check-updates` 检查更新。

## 9. 架构师选型建议

- **如果是高性能、SEO 优先的门户/电商网站**: 优先选择 **Nuxt.js + Tailwind CSS + shadcn-vue + TanStack Query**。
- **如果是追求极致交互体验的单页 Web App**: 推荐 **Vite + Pinia + VueUse + Headless UI**。
- **如果是跨端复用需求高的项目**: 采用 **Monorepo (pnpm + Turborepo)** 组织代码。
