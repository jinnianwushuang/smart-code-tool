# 术语表

> 代码模板中涉及的核心概念和文件对照。

## 架构概念

| 术语 | 含义 | 对应文件 |
|------|------|---------|
| 装配架构 | 基于原子装配模式的 Vue 3 组件架构体系 | 整体目录结构 |
| 原子装配（atoms_assembler） | 将模块扫描、分类、聚合的核心函数 | `common/architecture-design/assembler/assemble_atoms.js` |
| 模块扫描 | 通过 `import.meta.glob` 自动发现并加载模块文件 | `standardization/*/assembler/assembler.js` |
| 上下文装配器（useContextAssembler） | 消费生成器函数队列，组装组件运行上下文 | `composable/architecture-design/assembler/useContextAssembler.js` |
| 生命周期装配器 | 自动注册和清理 Vue 生命周期钩子 | `composable/architecture-design/assembler/useModuleLifecycleAssembler.js` |

## 模板类型

| 术语 | 含义 | 对应目录 |
|------|------|---------|
| 多例模板（multiton） | 每次使用创建独立实例，状态互不影响 | `standardization/multiton-template/` |
| 单例模板（singleton） | 全局共享单一实例，适合弹窗、表格等公共组件 | `standardization/singleton-template/` |

## 模块分类

| 术语 | 含义 | 对应目录 |
|------|------|---------|
| 状态机（state） | 组件的响应式数据定义 | `state/` |
| 生命周期（lifecycle） | onMounted / onUnmounted 等钩子 | `module/lifecycle/` |
| 副作用（effect） | 定时器、监听器、watcher 等 | `module/effect/` |
| 事件通道（event-pipeline） | 组件内的事件流管道 | `module/event-pipeline/` |
| 对外方法（exposed-method） | 暴露给父组件调用的方法 | `module/exposed-method/` |

## 装配器文件

| 文件 | 职责 |
|------|------|
| `assemble_atoms.js` | 核心聚合入口，扫描模块并分类 |
| `assemble_state.js` | 状态机聚合器 |
| `assemble_multiton.js` | 多例模块聚合器 |
| `assemble_singleton.js` | 单例模块聚合器 |
| `assemble_component.js` | 组件聚合器 |
| `assemble_event_pipeline.js` | 事件通道聚合器 |
| `assemble_function.js` | 函数聚合器 |

## Composable 函数

| 文件 | 职责 |
|------|------|
| `useContextAssembler.js` | 上下文启动器，组装 payload |
| `useModuleLifecycleAssembler.js` | 模块生命周期管理 |
| `useEventListenerCleaner.js` | 事件监听自动清理 |
| `useAllExceptEventListenerCleaner.js` | 非事件监听的自动清理 |
| `useGlobalVariable.js` | 全局变量注入（router、route 等） |
| `composable/index.js` | Composable 函数索引（供动态查找） |

## 工具文件

| 文件 | 职责 |
|------|------|
| `mitt-kit/mitt.js` | 事件总线封装（EMITTER） |
| `function-wrapper/wrap_with_payload.js` | payload 函数包装器 |
| `function-wrapper/wrap_with_payload_pipeline.js` | 管道式函数包装 |
| `util/file/file.js` | 文件名解析工具 |
| `util/log/log.js` | 日志工具 |
| `util/merge/merge.js` | payload 合并工具 |
| `util/merge/architecture_check.js` | 架构合规检查 |
