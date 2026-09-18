# 架构概念说明

> 理解装配架构的核心理念，有助于更好地使用和定制代码模板。

## 核心理念

装配架构基于 **原子装配（Atoms Assembler）** 模式，将 Vue 组件的内部逻辑拆分为独立的模块文件，通过装配器自动扫描、分类、聚合，最终组装成完整的组件上下文。

**核心优势**：
- **模块化**：每个功能模块独立文件，职责单一
- **自动清理**：生命周期钩子、事件监听、定时器等自动注册和清理
- **可扩展**：新增功能只需添加模块文件，装配器自动发现

## 多例模板 vs 单例模板

| 特性 | 多例模板（multiton） | 单例模板（singleton） |
|------|---------------------|----------------------|
| 实例数 | 每次使用创建独立实例 | 全局共享单一实例 |
| 状态隔离 | 各实例状态完全独立 | 所有使用者共享状态 |
| 适用场景 | 业务页面、独立功能块 | 弹窗、表格、搜索栏等公共组件 |
| 复杂度 | 较低 | 较高（含 API 请求、组件配置） |

## 装配器工作原理

```
1. 模块扫描
   import.meta.glob(['../module/**/*.js', '../state/*.js'])
   ↓ 自动发现所有模块文件

2. 模块分类
   根据文件路径自动分类：
   - /state/ → 状态机
   - /module/lifecycle/ → 生命周期
   - /module/effect/watcher.js → Vue 监听器
   - /module/effect/（其他） → 副作用
   - /module/event-pipeline/ → 事件通道
   - /module/exposed-method/ → 对外方法

3. 聚合组装
   atoms_assembler() 将分类后的模块聚合为：
   - state_fn_arr → 状态机初始化函数队列
   - method_fn_arr → 业务方法函数队列
   - lifecycle_fn_arr → 生命周期函数队列
   - watcher_fn_arr → 监听器函数队列
   - event_pipeline_fn_arr → 事件通道函数队列

4. 上下文组装
   useContextAssembler() 消费上述队列，组装为组件运行时的 payload 上下文
```

## 事件通道系统（Event Pipeline）

事件通道是组件内部的事件流管道，用于解耦业务逻辑：

- 每个事件通道文件定义一个独立的事件流
- 通道之间互不干扰
- 一个组件内只能有一个事件通道注册函数

## 生命周期自动清理

装配架构通过 `lifecycle-disposer` 机制实现自动清理：

- **useEventListenerCleaner**：自动清理 `addEventListener` 注册的原生事件监听
- **useAllExceptEventListenerCleaner**：清理非事件监听类的资源（定时器、watcher 等）
- 所有清理逻辑在 `onUnmounted` 时自动执行，开发者无需手动管理

## 目录结构总览

```
src/
├── standardization/          ← 标准模板（开发者基于此创建业务组件）
│   ├── multiton-template/    ← 多例模板
│   └── singleton-template/   ← 单例模板
├── common/                   ← 装配引擎核心（一般不需修改）
│   └── architecture-design/
├── composable/               ← 架构组合函数（一般不需修改）
│   ├── architecture-design/
│   └── index.js              ← Composable 函数索引
└── css/                      ← 全局样式变量
```
