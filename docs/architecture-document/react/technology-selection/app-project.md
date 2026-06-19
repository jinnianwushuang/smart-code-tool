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

## 9. 架构师选型建议

- **如果是需要极致原生性能、深度定制原生模块的复杂应用**: 优先选择 **React Native CLI + TypeScript + NativeBase + Realm**。
- **如果是追求快速迭代、开发效率，且对原生定制需求不高的应用**: 推荐 **Expo (Managed Workflow) + React Native + Tailwind CSS + Zustand**。
- **如果需要构建设计系统，且同时支持 Web 和 Native**: 考虑 **Tamagui + React Native + Monorepo (pnpm + Nx)**。
 
 