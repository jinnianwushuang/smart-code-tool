---
title: 桌面端类型项目技术选型
order: 304
---

# React 桌面端项目技术选型指南

构建基于 React 的桌面端应用时，架构师需要在“包体积”、“性能”与“系统 API 丰富度”之间做出权衡。目前行业主要在 **Electron** (稳健生态) 与 **Tauri** (极致性能) 之间进行选择。

## 1. 桌面容器选型

| 方案           | 核心原理                | 优点                                                                | 缺点                                             | 适用场景                                                      |
| :------------- | :---------------------- | :------------------------------------------------------------------ | :----------------------------------------------- | :------------------------------------------------------------ |
| **Tauri (v2)** | Rust + 系统原生 WebView | **包体积极小 (2MB+)**、内存占用极低、安全性极高、支持 iOS/Android。 | 依赖宿主 WebView (存在兼容性坑)、Rust 学习成本。 | 轻量级工具、效率软件、高性能辅助工具。                        |
| **Electron**   | Chromium + Node.js      | **一致性极高**、API 覆盖最全、生态库极多、调试体验最佳。            | 包体积大 (80MB+)、内存消耗重。                   | 大型 IDE (如 VS Code)、重度 IM (如 Discord)、复杂企业级软件。 |

## 2. 核心技术栈

- **前端框架**: [React 18/19](https://react.dev) - 利用其强大的声明式 UI 和丰富的社区 Hooks。
- **构建工具**: [Vite](https://cn.vitejs.dev/) - 配合 `vite-plugin-electron` 或 `tauri-action`，提供极速的开发反馈。
- **语言**: TypeScript - 必须选项，用于管理跨进程通讯 (IPC) 的类型定义。

## 3. UI 交互与动画

- **原子化 CSS**: Tailwind CSS - 方便快速适配桌面端不同尺寸的窗口。
- **组件选型**:
  - **shadcn/ui**: **首选推荐**。基于 Radix UI，不产生额外的包体积负担，且方便针对桌面端特有的“无框窗口 (Frameless)”进行样式定制。
  - **Mantine**: 提供丰富的原生交互组件（如模态框、侧边栏），非常适合生产力工具。
- **动画引擎**: Framer Motion - 实现 macOS/Windows 风格的平滑过渡动画。
- **图标**: Lucide React。

## 4. 状态管理与逻辑解耦

- **全局状态**: Zustand - 极其轻量，非常适合在桌面端多窗口场景下管理共享状态。
- **异步数据**: TanStack Query - 自动处理本地与云端的数据同步、缓存和重试逻辑。
- **系统交互**: React Use - 提供了大量监听窗口、键盘快捷键、剪贴板的快捷 Hooks。

## 5. 数据持久化方案

桌面应用通常需要处理比 Web 更多的本地数据：

- **配置项存储**: `electron-store` 或 Tauri 的 `tauri-plugin-store`。
- **本地数据库**:
  - **SQLite**: 配合 Prisma 或 Drizzle ORM。
  - **RxDB**: 适合需要多端同步和响应式数据流的场景。

## 6. 原生能力集成 (IPC)

- **Electron**: 通过 `preload.js` 暴露 `contextBridge`，利用 `ipcRenderer` 和 `ipcMain` 进行安全通讯。
- **Tauri**: 通过 `invoke` 直接调用 Rust 后端函数，利用 `Event` 系统进行双向监听。

## 7. 质量保证与自动化

- **单元测试**: Vitest - 针对逻辑层和 Hooks 进行测试。
- **E2E 测试**:
  - Playwright (支持 Electron)。
  - Tauri-driver (基于 WebDriver)。
- **CI/CD**: 利用 GitHub Actions 自动化编译生产环境二进制文件 (dmg/exe/deb)。

## 8. 项目初始化 package.json 参考

以下提供两套生产可用的 `package.json` 模板，可根据实际选型方案选择使用。

### 方案 A：Tauri v2 + React + shadcn/ui（极致轻量，追求下载体验）

适用于轻量级工具、效率软件、高性能辅助工具，包体积极小 (2MB+)。

```json
{
  "name": "react-desktop-tauri",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.1",
    "@tauri-apps/api": "^2.2.0",
    "@tauri-apps/plugin-store": "^2.2.0",
    "@tauri-apps/plugin-fs": "^2.2.0",
    "@tauri-apps/plugin-dialog": "^2.2.0",
    "@tauri-apps/plugin-shell": "^2.2.0",
    "@tauri-apps/plugin-notification": "^2.2.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.3",
    "lucide-react": "^0.469.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0",
    "framer-motion": "^11.15.0",
    "react-use": "^17.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "typescript": "^5.7.3",
    "@types/react": "^19.0.3",
    "@types/react-dom": "^19.0.2",
    "@types/node": "^22.10.5",
    "@tauri-apps/cli": "^2.2.0",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "eslint": "^9.17.0",
    "@eslint/js": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.3.0",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "jsdom": "^25.0.1"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 方案 B：Electron + React + Ant Design + Vite（全功能型，生态成熟）

适用于大型 IDE、重度 IM、复杂企业级软件，需要 Node 原生模块支持。

```json
{
  "name": "react-desktop-electron",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && electron-builder",
    "preview": "vite preview",
    "electron:dev": "vite --mode electron",
    "electron:build": "vite build && electron-builder --config electron-builder.yml",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.1",
    "antd": "^5.22.7",
    "@ant-design/icons": "^5.5.2",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.3",
    "axios": "^1.7.9",
    "electron-store": "^10.0.0",
    "better-sqlite3": "^11.7.0",
    "drizzle-orm": "^0.38.3",
    "react-use": "^17.6.0",
    "react-i18next": "^15.4.0",
    "i18next": "^24.2.1",
    "dayjs": "^1.11.13",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "vite-plugin-electron": "^0.28.8",
    "vite-plugin-electron-renderer": "^0.14.6",
    "electron": "^33.3.1",
    "electron-builder": "^25.1.8",
    "typescript": "^5.7.3",
    "@types/react": "^19.0.3",
    "@types/react-dom": "^19.0.2",
    "@types/node": "^22.10.5",
    "@types/better-sqlite3": "^7.6.12",
    "less": "^4.2.1",
    "drizzle-kit": "^0.30.1",
    "eslint": "^9.17.0",
    "@eslint/js": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.3.0",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "jsdom": "^25.0.1",
    "playwright": "^1.49.1"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

> **使用说明**：
>
> - Tauri 方案需要先安装 [Rust](https://www.rust-lang.org/tools/install)，然后通过 `npx tauri init` 初始化 Rust 后端工程。
> - Electron 方案中 `vite-plugin-electron` 用于无缝集成 Vite 与 Electron 主进程/预加载脚本。
> - `electron-builder` 负责打包为 `dmg` / `exe` / `deb` 等安装文件，配置可写在 `electron-builder.yml` 中。
> - `better-sqlite3` + `drizzle-orm` 为桌面端本地数据库方案，适合离线数据持久化场景。
> - 版本号以发布时的最新稳定版为准，建议定期通过 `npx npm-check-updates` 检查更新。

## 9. 架构师选型建议

1. **追求极致用户下载体验**：优先选择 **Tauri + React + shadcn/ui + Rust**。
2. **需要快速移植现有 Web 项目且依赖 Node 原生模块**：优先选择 **Electron + React + Ant Design + Vite**。
3. **需要支持多窗口、离线协作**：推荐 **Zustand + SQLite + TanStack Query** 架构。
