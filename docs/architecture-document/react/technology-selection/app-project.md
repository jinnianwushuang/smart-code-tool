---
title: 原生APP类型项目技术选型
order: 194
---

# React 原生 APP 类型项目技术选型指南

React 生态在原生 APP 开发领域主要通过 **React Native** 实现跨平台。本指南将围绕 React Native 及其生态，提供一套现代化的技术选型方案，旨在兼顾开发效率、原生性能和可维护性。

## 1. 跨端框架与工具链

| 方案 | 核心特点 | 优点 | 缺点 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **React Native CLI** | 官方核心，直接管理原生项目。 | 完全控制原生代码，可深度定制，性能接近原生。 | 配置复杂，需要原生开发经验，环境搭建繁琐。 | 对原生能力有深度定制需求，或需要集成复杂原生模块的项目。 |
| **Expo (Managed Workflow)** | 封装 React Native，提供大量开箱即用的 API。 | 开发效率极高，环境配置简单，内置大量原生模块。 | 无法直接修改原生代码，部分原生模块受限。 | 快速原型开发、中小型应用、对原生定制需求不高的项目。 |

## 2. 核心技术栈 (Core Stack)

- **前端框架**: [React 18/19](https://react.dev) - 核心 UI 库。
- **构建工具**: Metro (React Native 默认) / [Vite](https://cn.vitejs.dev/) (通过 `react-native-vite-plugin` 或 Expo 的未来集成)。
- **编程语言**: TypeScript - 移动端逻辑复杂，强类型是保障。

## 3. UI 交互与组件 (UI & Components)

- **样式方案**:
    - **Tailwind CSS for React Native**: 通过 `NativeWind` 或 `Tamagui` 实现原子化 CSS。
    - **Styled Components / Emotion**: 适用于组件级样式封装。
- **组件库**:
    - **NativeBase**: 跨平台组件库，提供丰富的可访问性组件。
    - **UI Kitten**: 基于 Eva Design System，提供主题定制能力。
    - **Tamagui**: 针对 React Native 和 Web 的高性能 UI 库，支持编译时优化。
- **图标库**: React Native Vector Icons - 丰富的图标集。
- **动画**: Reanimated - 强大的原生驱动动画库，实现流畅交互。

## 4. 状态管理与数据流 (State Management)

- **服务端状态**: TanStack Query (React Query) - 统一管理 API 请求、缓存、Loading 状态。
- **客户端状态**:
    - **Zustand**: 轻量、高性能的全局状态管理。
    - **Recoil / Jotai**: 原子化状态管理，适合细粒度状态更新。
- **表单管理**: React Hook Form - 配合 Zod 进行表单校验。

## 5. 原生能力接入 (Native Capabilities)

- **相机/相册**: `@react-native-community/camera` (CLI) / `expo-image-picker` (Expo)。
- **地理位置**: `@react-native-community/geolocation` (CLI) / `expo-location` (Expo)。
- **蓝牙**: `react-native-ble-plx` (CLI) / `expo-bluetooth` (Expo)。
- **文件系统**: `react-native-fs` (CLI) / `expo-file-system` (Expo)。

## 6. 本地存储与数据库

- **键值存储**: `@react-native-async-storage/async-storage`。
- **本地数据库**:
    - **Realm**: 移动端优先的数据库，支持离线优先和实时同步。
    - **SQLite**: 传统关系型数据库，适合复杂查询。
    - **WatermelonDB**: 针对 React Native 优化的高性能响应式数据库。

## 7. 路由与导航 (Routing & Navigation)

- **React Navigation**: 官方推荐，功能强大，支持堆栈、Tab、抽屉等多种导航模式。

## 8. 质量保证与运维

- **单元测试**: Jest + React Native Testing Library。
- **E2E 测试**: Detox (CLI) / Appium。
- **错误监控**: Sentry - 实时捕获原生和 JS 错误。
- **热更新**: CodePush (CLI) / Expo EAS Update。

## 9. 项目技术选型 `package.json` 样板

以下提供两套生产可用的 `package.json` 样板，分别对应 Expo 和 React Native CLI 方案，可直接用于项目初始化。

### 方案 A：Expo (Managed Workflow) + Zustand + NativeWind（快速迭代方案）

> 适用于：追求快速迭代、开发效率，且对原生定制需求不高的中小型应用。

```json
{
  "name": "react-expo-starter",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "dev:android": "expo start --android",
    "dev:ios": "expo start --ios",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    "update": "eas update",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-native": "0.76.6",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.1",
    "expo-image-picker": "~16.0.4",
    "expo-location": "~18.0.4",
    "expo-file-system": "~18.0.8",
    "expo-camera": "~16.0.14",
    "expo-constants": "~17.0.4",
    "expo-linking": "~7.0.4",
    "expo-splash-screen": "~0.29.21",
    "expo-updates": "~0.27.4",
    "@react-navigation/native": "^7.0.14",
    "nativewind": "^4.1.23",
    "zustand": "^5.0.3",
    "@tanstack/react-query": "^5.62.0",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.24.1",
    "axios": "^1.7.9",
    "dayjs": "^1.11.13",
    "@react-native-async-storage/async-storage": "2.1.0",
    "react-native-reanimated": "~3.16.5",
    "react-native-safe-area-context": "4.14.1",
    "react-native-screens": "~4.4.0",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-vector-icons": "^10.2.0",
    "@expo/vector-icons": "^14.0.4"
  },
  "devDependencies": {
    "typescript": "~5.6.3",
    "@types/react": "~18.3.12",
    "@types/react-native": "^0.73.0",
    "tailwindcss": "^3.4.17",
    "jest": "^29.7.0",
    "jest-expo": "~52.0.3",
    "@testing-library/react-native": "^12.9.0",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "eslint-plugin-react": "^7.37.3",
    "eslint-plugin-react-hooks": "^5.1.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**关键说明：**
- `expo-router` 是 Expo 官方文件系统路由方案，类似 Next.js 的 `app/` 目录结构
- `nativewind` 将 Tailwind CSS 带入 React Native，支持原子化 CSS 开发
- `eas build` 和 `eas update` 是 Expo 的云构建和 OTA 热更新服务
- `@react-native-async-storage/async-storage` 是 React Native 官方的键值存储方案

### 方案 B：React Native CLI + TypeScript + NativeBase（深度定制方案）

> 适用于：需要极致原生性能、深度定制原生模块的复杂应用。

```json
{
  "name": "react-native-cli-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "build:android:release": "cd android && ./gradlew assembleRelease",
    "build:ios:release": "react-native run-ios --configuration Release",
    "pod:install": "cd ios && pod install && cd ..",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit",
    "test:e2e": "detox test --configuration ios.sim.debug"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-native": "0.76.6",
    "@react-navigation/native": "^7.0.14",
    "@react-navigation/native-stack": "^7.2.0",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "native-base": "^3.4.28",
    "zustand": "^5.0.3",
    "@tanstack/react-query": "^5.62.0",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.24.1",
    "axios": "^1.7.9",
    "dayjs": "^1.11.13",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "realm": "^12.13.2",
    "react-native-reanimated": "^3.16.5",
    "react-native-safe-area-context": "^4.14.1",
    "react-native-screens": "^4.4.0",
    "react-native-gesture-handler": "^2.20.2",
    "react-native-vector-icons": "^10.2.0",
    "react-native-fs": "^2.20.0",
    "react-native-ble-plx": "^3.2.1",
    "@react-native-camera-roll/camera-roll": "^7.8.3",
    "react-native-code-push": "^10.1.1",
    "@sentry/react-native": "^6.5.0"
  },
  "devDependencies": {
    "typescript": "~5.6.3",
    "@types/react": "~18.3.12",
    "@types/react-native": "^0.73.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.9.0",
    "detox": "^20.33.0",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "eslint-plugin-react": "^7.37.3",
    "eslint-plugin-react-hooks": "^5.1.0",
    "@react-native/babel-preset": "0.76.6",
    "@react-native/eslint-config": "0.76.6",
    "@react-native/metro-config": "0.76.6",
    "@react-native/typescript-config": "0.76.6"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**关键说明：**
- `react-native-code-push` 实现 OTA 热更新，无需经过应用商店审核即可推送 JS Bundle 更新
- `realm` 是移动端优先的数据库，支持离线优先和实时同步，适合复杂数据场景
- `detox` 是 React Native 专用的 E2E 测试框架，模拟真实用户交互
- `@sentry/react-native` 实时捕获原生和 JS 层错误，是生产环境监控的标配
- `react-native-ble-plx` 和 `react-native-fs` 是 CLI 方案下接入蓝牙和文件系统的常用方案

## 10. 架构师选型建议

- **如果是需要极致原生性能、深度定制原生模块的复杂应用**: 优先选择 **React Native CLI + TypeScript + NativeBase + Realm**。
- **如果是追求快速迭代、开发效率，且对原生定制需求不高的应用**: 推荐 **Expo (Managed Workflow) + React Native + Tailwind CSS + Zustand**。
- **如果需要构建设计系统，且同时支持 Web 和 Native**: 考虑 **Tamagui + React Native + Monorepo (pnpm + Nx)**。
 
 