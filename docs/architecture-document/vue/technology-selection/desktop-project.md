---
title: 桌面端类型项目技术选型
order: 204
---

# Vue 3 桌面端类型项目技术选型指南

在开发基于 Vue 3 的桌面端 项目时，除了核心的 Web 技术栈，还需要重点考虑桌面容器的选择、原生系统 API 的调用以及本地数据的持久化。

## 1. 桌面端容器选型

| 方案 | 核心技术 | 优点 | 缺点 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Tauri** | Rust + Webview | 包体积极小 (几MB)、内存占用低、安全性高、系统调用快。 | 跨端 Webview 兼容性差异、Rust 学习曲线。 | 追求轻量化、高性能的新型工具类应用。 |
| **Electron** | Chromium + Node.js | 生态最成熟、API 极度丰富、完全的一致性环境、开发效率极高。 | 包体积大 (80MB+)、内存占用高。 | 复杂交互、重度依赖 Node 生态、需要高度一致性表现的应用。 |

## 2. 核心技术栈

- **框架核心**: [Vue 3 (Composition API)](https://cn.vuejs.org/) - 利用其优秀的响应式系统。
- **构建工具**: [Vite](https://cn.vitejs.dev/) - 极速的热更新体验，适配 Tauri/Electron 均有成熟插件。
- **编程语言**: [TypeScript](https://www.typescriptlang.org/) - 客户端项目通常逻辑较重，强类型保证大规模重构的安全。

## 3. UI 交互层

- **原子化 CSS**: [Tailwind CSS](https://tailwindcss.com/) - 提升样式开发效率，减少冗余 CSS。
- **组件方案**:
    - **[shadcn-vue](https://www.shadcn-vue.com/)**: 推荐方案。基于 Radix Vue，代码拷贝模式，极具自定义自由度，适合定制化需求强的客户端。
    - **[PrimeVue (Unstyled)](https://primevue.org/)**: 适合需要复杂数据表格和丰富交互，同时想保持高度样式自由的项目。
- **图标库**: [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next) - 轻量级且美观。
- **动画**: [VueUse / Motion](https://motion.vueuse.org/) - 客户端应用非常强调丝滑的动效交互。

## 4. 状态管理与数据流

- **全局状态**: [Pinia](https://pinia.vuejs.org/zh/) - Vue 官方推荐，结构清晰。
- **异步数据**: [TanStack Query (Vue Query)](https://tanstack.com/query/latest/docs/framework/vue/overview) - 处理网络请求缓存、重试、Loading 状态的标配方案。
- **实用函数**: [VueUse](https://vueuse.org/) - 提供了大量的系统交互组合式函数（如鼠标位置、窗口大小、本地存储等）。

## 5. 本地化存储与持久化

客户端应用不同于传统 Web，往往需要存储更大量的数据。

- **简单持久化**: `localStorage` 或 Pinia 的持久化插件。
- **轻量数据库**: SQLite - 结合 Prisma 或 Tauri 的插件进行操作。
- **离线同步**: PouchDB / RxDB - 适合需要离线编辑并自动与云端同步的场景。

## 6. 通讯与原生交互

- **HTTP 客户端**: Axios。
- **实时通讯**: Socket.io。
- **原生 API 调用**:
    - **Tauri**: 通过 `invoke` 调用 Rust 命令。
    - **Electron**: 通过 `ipcMain` / `ipcRenderer` 进行主进程与渲染进程通讯。

## 7. 质量保证

- **单元测试**: Vitest - 与 Vite 无缝结合。
- **端到端测试 (E2E)**: Playwright - 模拟真实用户在客户端内的交互。
- **监控**: Sentry - 收集客户端运行时的错误日志。

## 8. 项目技术选型 `package.json` 样板

以下提供两套生产可用的 `package.json` 样板，分别对应 Tauri 和 Electron 方案，可直接用于项目初始化。

### 方案 A：Tauri + Vue 3 + shadcn-vue（轻量化工具方案）

> 适用于：菜单栏应用、性能监控、个人助手等轻量化工具类应用。包体积极小 (几MB)，内存占用低。

```json
{
  "name": "vue-tauri-starter",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:info": "tauri info",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.1",
    "pinia-plugin-persistedstate": "^4.2.0",
    "@tanstack/vue-query": "^5.62.0",
    "@tauri-apps/api": "^2.2.0",
    "@tauri-apps/plugin-shell": "^2.2.0",
    "@tauri-apps/plugin-dialog": "^2.2.0",
    "@tauri-apps/plugin-fs": "^2.2.0",
    "@tauri-apps/plugin-store": "^2.2.0",
    "@tauri-apps/plugin-notification": "^2.2.0",
    "@vueuse/core": "^12.4.0",
    "axios": "^1.7.9",
    "dayjs": "^1.11.13",
    "lucide-vue-next": "^0.468.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "radix-vue": "^1.9.12"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.2.0",
    "typescript": "~5.6.3",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.10",
    "@vitejs/plugin-vue": "^5.2.1",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "@vue/eslint-config-typescript": "^14.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**关键说明：**
- `@tauri-apps/cli` 是 Tauri 的命令行工具，用于构建和管理原生项目
- `@tauri-apps/plugin-*` 是 Tauri v2 的插件系统，每个原生能力对应一个独立插件
- `radix-vue` + `class-variance-authority` + `clsx` + `tailwind-merge` 是 shadcn-vue 的底层依赖组合
- Tauri v2 后端使用 Rust 编写，前端通过 `@tauri-apps/api` 的 `invoke` 调用 Rust 命令

### 方案 B：Electron + Vue 3 + PrimeVue（生产力工具方案）

> 适用于：IDE、音乐播放器、重度 IM 软件等功能复杂的生产力工具。生态最成熟，API 极度丰富。

```json
{
  "name": "vue-electron-starter",
  "version": "1.0.0",
  "private": true,
  "main": "dist-electron/main.js",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build && electron-builder",
    "preview": "vite preview",
    "electron:dev": "vite",
    "electron:build": "vite build && electron-builder",
    "electron:build:win": "vite build && electron-builder --win",
    "electron:build:mac": "vite build && electron-builder --mac",
    "electron:build:linux": "vite build && electron-builder --linux",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.1",
    "pinia-plugin-persistedstate": "^4.2.0",
    "@tanstack/vue-query": "^5.62.0",
    "@vueuse/core": "^12.4.0",
    "primevue": "^4.2.5",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1",
    "dayjs": "^1.11.13",
    "lucide-vue-next": "^0.468.0",
    "electron-store": "^10.0.0",
    "electron-updater": "^6.3.9"
  },
  "devDependencies": {
    "electron": "^33.3.0",
    "electron-builder": "^25.1.8",
    "vite-plugin-electron": "^0.28.8",
    "vite-plugin-electron-renderer": "^0.14.6",
    "typescript": "~5.6.3",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.10",
    "@vitejs/plugin-vue": "^5.2.1",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6",
    "@playwright/test": "^1.49.1",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "@vue/eslint-config-typescript": "^14.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**关键说明：**
- `vite-plugin-electron` 实现 Vite 与 Electron 的无缝集成，支持主进程和渲染进程的统一构建
- `electron-builder` 负责打包分发，支持 Windows/macOS/Linux 三平台
- `electron-store` 是 Electron 环境下的持久化存储方案，替代 `localStorage`
- `electron-updater` 实现应用内自动更新，是桌面端运维的标配能力
- `socket.io-client` 用于实时通讯场景，如 IM 聊天、协作编辑等

## 9. 选型建议

1. **如果是轻量化的工具**（如：菜单栏应用、性能监控、个人助手）：优先选择 **Tauri + Vue 3 + Tailwind CSS + shadcn-vue**。
2. **如果是功能复杂的生产力工具**（如：IDE、音乐播放器、重度 IM 软件）：优先选择 **Electron + Vue 3 + Pinia + PrimeVue**。
3. **如果涉及到多端逻辑复用**：建议采用 **Monorepo (pnpm + Turborepo)** 架构，将核心逻辑抽象到 `packages/shared`。