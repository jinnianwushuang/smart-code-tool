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

## 8. 选型建议

1. **如果是轻量化的工具**（如：菜单栏应用、性能监控、个人助手）：优先选择 **Tauri + Vue 3 + Tailwind CSS + shadcn-vue**。
2. **如果是功能复杂的生产力工具**（如：IDE、音乐播放器、重度 IM 软件）：优先选择 **Electron + Vue 3 + Pinia + PrimeVue**。
3. **如果涉及到多端逻辑复用**：建议采用 **Monorepo (pnpm + Turborepo)** 架构，将核心逻辑抽象到 `packages/shared`。