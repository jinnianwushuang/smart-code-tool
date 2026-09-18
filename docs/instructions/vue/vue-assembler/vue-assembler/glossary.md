# 架构术语表

> 统一术语定义，确保 AI 与使用者理解一致。

## 核心概念

| 术语 | 含义 | 对应文件 |
|------|------|----------|
| **装配器（Assembler）** | 架构的核心枢纽，负责自动发现、验证和组合所有模块，注入到组件中 | `assembler/assembler.js` |
| **atoms_assembler** | 公共装配器函数，接收模块扫描结果，验证分类并组合成统一上下文 | 公共模块（配置路径） |
| **useContextAssembler** | 组合式注入函数，将装配器产出的上下文注入到 Vue 组件中 | 公共模块（配置路径） |
| **payload** | 统一上下文对象，包含所有状态、方法、事件管道，在模块间传递 | 运行时生成 |
| **base_payload** | 基础上下文，在 index.vue 中定义，包含 props、emit、income_pipeline 等 | `index.vue` |

## 状态相关

| 术语 | 含义 | 对应文件 |
|------|------|----------|
| **单例状态（Singleton State）** | 跨组件实例共享的状态，所有实例访问同一份数据 | `state/singleton/*.js` |
| **多例状态（Multiton State）** | 每个组件实例独立的状态副本 | `state/multiton.js` |
| **计算属性（Computed）** | 从单例或多例状态派生的响应式值 | `state/computed.js` |
| **init_singleton** | 单例状态重置函数，组件卸载时调用，恢复初始值 | `state/singleton/*.js` |
| **ALL_CONTEXT_STATE** | 对外提供的状态机挂载点（空对象，由装配器填充） | `index.vue` / `expose.js` |

## 事件相关

| 术语 | 含义 | 对应文件 |
|------|------|----------|
| **事件管道（Event Pipeline）** | 集中式事件处理系统，所有用户交互通过管道路由 | `module/event-pipeline/` |
| **ALL_EVENT_PIPELINE** | 事件管道总对象，按业务域组织（dialog / table / other） | 装配器自动生成 |
| **income_pipeline** | 下游组件调用当前组件的通道，指定函数名字列表 | `index.vue` |
| **emit** | Vue 组件原生的事件发射，向上冒泡 | `index.vue` |

## 生命周期相关

| 术语 | 含义 | 对应文件 |
|------|------|----------|
| **lifecycle_onBeforeMount** | 挂载前钩子，用于准备状态、重置单例 | `module/lifecycle/lifecycle.js` |
| **lifecycle_onMounted** | 挂载后钩子，用于获取初始数据、启动副作用 | `module/lifecycle/lifecycle.js` |
| **lifecycle_onBeforeUnmount** | 卸载前钩子，用于保存状态、取消请求 | `module/lifecycle/lifecycle.js` |
| **lifecycle_onUnmounted** | 卸载后钩子，最终清理 | `module/lifecycle/lifecycle.js` |
| **lifecycle_onActivated** | KeepAlive 重新激活钩子 | `module/lifecycle/lifecycle.js` |
| **lifecycle_onDeactivated** | KeepAlive 停用钩子 | `module/lifecycle/lifecycle.js` |

## 副作用相关

| 术语 | 含义 | 对应文件 |
|------|------|----------|
| **cleanup_effect_dom** | DOM 引用清理 | `module/effect/dom.js` |
| **cleanup_effect_listener** | 事件监听器清理 | `module/effect/listener.js` |
| **cleanup_effect_watcher** | Vue 观察器清理 | `module/effect/watcher.js` |
| **cleanup_effect_timer** | 定时器清理 | `module/effect/timer.js` |
| **cleanup_effect_mitter** | 事件发射器监听清理 | `module/effect/mitter.js` |
| **cleanup_effect_other** | 其他自定义效果清理 | `module/effect/other.js` |

## 模板相关

| 术语 | 含义 |
|------|------|
| **多例模板（Multiton Template）** | 每实例独立状态的页面模板，适合多个同类组件并排场景 |
| **单例模板（Singleton Template）** | 跨实例共享状态的页面模板，额外提供 expose.js 和 api-request/ |
| **expose.js** | 仅单例模板有，声明对外提供的 ALL_CONTEXT_STATE 和 ALL_EVENT_PIPELINE |

## 命名规则速查

| 类型 | 规则 | 示例 |
|------|------|------|
| 文件名 | `kebab-case` | `merchant-search.vue` |
| 变量名 | `snake_case` | `table_data` |
| 生命周期函数 | `lifecycle_*` | `lifecycle_onMounted` |
| 副作用清理函数 | `cleanup_effect_*` | `cleanup_effect_watcher` |
| 事件处理函数 | `handle_*` / `on_*` | `handle_query_click` |
| 常量 | `UPPER_SNAKE_CASE` | `ALL_EVENT_PIPELINE` |
