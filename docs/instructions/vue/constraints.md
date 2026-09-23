---
title: Vue 提示词约束
---

# Vue 提示词约束

> 本文件作为 Vue 提示词的**基础上下文**，由 AI 助手在回答前自动读取。包含所有 Vue 提示词共享的技术约束和编码约定。

---

## 版本基线

- **Vue 3.4+** + **TypeScript 5.5+**
- 使用 `<script setup>` 语法，禁止 Options API（除非明确要求）
- 编译宏：`defineProps` / `defineEmits` / `defineExpose` / `defineModel` / `withDefaults`

## 组合式 API 规范

- 响应式数据：基础类型用 `ref`，对象用 `reactive`，只读用 `computed`
- 副作用：`watchEffect`（自动依赖收集）优先于 `watch`（手动指定依赖）
- 生命周期：`onMounted` / `onUpdated` / `onUnmounted` 等
- Composable 命名：`use[功能名]`，返回解构友好对象 `{ data, loading, error, refresh }`
- Composable 内部状态用 `ref`/`reactive`，对外暴露只读 `computed`
- 异步操作必须包含 `loading` 状态和错误处理

## 类型定义

- Props 使用 `defineProps<T>()` 泛型定义，配合 `withDefaults` 设置默认值
- Emits 使用 `defineEmits<{ (e: 'name'): void }>()` 声明类型
- 通过 `defineExpose` 暴露需要的方法，类型明确

## 样式规范

- 使用 `<style scoped>`，穿透用 `:deep()`
- 主题切换使用 CSS 变量方案，支持亮暗模式
- 组件库样式覆盖优先通过组件库提供的主题变量，而非强制 `!important`

## 状态管理

- Pinia Setup Store 语法：`defineStore('id', () => { ... })`
- Getters 用 `computed`，Actions 处理异步含 loading/error
- 持久化配合 `pinia-plugin-persistedstate`

## 路由与权限

- Vue Router 4 动态路由挂载
- 按钮权限使用 `v-permission` 自定义指令
- 路由守卫处理登录跳转和权限校验
- 面包屑配合路由 `meta` 自动生成

## 性能优化

- 响应式追踪优化：`shallowRef` / `markRaw` 避免深层代理
- `v-memo` 缓存不常变化的模板块
- 大列表使用虚拟滚动
- `watchEffect` 替代不必要的 `watch` 减少触发次数

## 代码组织

- 组件文件不超过 300 行，超出按以下架构拆解：
  - 主组件（布局编排 + 状态协调，≤200 行）
  - 子组件（独立 UI 片段）
  - composable（业务逻辑 `useXxx`）
  - utils（纯函数：格式化、计算、校验）
- 逻辑与视图分离，复杂逻辑提取为 composable
- 纯函数工具提取到独立文件，无副作用

## 输出要求

- 提供完整可运行的代码，包含必要的 import
- 包含 TypeScript 类型定义
- 提供基础使用示例
