---
title: 架构概述
order: 5
---

# Backend Page Template 架构概述

## 目标

`src/standardization/backend-page-template` 目录下的这套架构是一套可插拔、模块化的后端页面模板。它通过统一的 `payload` 上下文、动态模块扫描、以及 `useContextAssembler` 组装器，保持组件逻辑清晰、可复用。

## 核心设计理念

- `payload` 作为组件上下文载荷，在各模块间统一传递
- 采用 `import.meta.glob` 动态扫描模块，自动装配功能块
- 通过 `all_atoms_assembler`/`useContextAssembler` 统一构建状态与行为
- 把生命周期、事件、API、组件方法、状态定义拆分为可插拔模块

## 目录结构说明

```
backend-page-template/
├── index.vue                   # 主组件入口，负责组件上下文与模板渲染
├── api-request/                # API 请求处理逻辑和请求入口
├── assembler/                  # 组装器入口，用于加载当前模块及状态
├── component/                  # 可插拔组件子模块（如对话框、表格区域）
├── css/                        # 样式定义
├── module/                     # 核心业务模块（生命周期、事件、效果、异步方法等）
└── state/                      # 状态定义与共享数据模块
```

## 关键入口

### `index.vue`

主组件通过 `useContextAssembler` 加载上下文：

```javascript
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/module/assembler.js'

const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}

const {
  user_info,
  btn_a_click,
  wrapped_payload: { handle_query_demo },
} = useContextAssembler(base_payload, all_atoms_assembler())
```

其中：
- `base_payload` 是组件基础上下文
- `all_atoms_assembler()` 负责动态扫描本目录状态和模块
- `useContextAssembler()` 负责将状态与方法注入组件模板

### `assembler/module/assembler.js`

该文件使用 `import.meta.glob('./module/*.js', { eager: true })` 扫描当前目录内的模块，并交给 `common_assemble_function` 统一装配。

```javascript
import { common_assemble_function } from 'src/output/common/project-common.js'
const modules = import.meta.glob('./module/*.js', { eager: true })
export default common_assemble_function(modules)
```

## 模块之间的协作

- `state/` 目录负责定义可共享状态、计算属性、配置数据
- `module/` 目录负责业务逻辑、生命周期、事件管道、发射器、API 调度等
- `api-request/` 负责请求入口与流程封装
- `component/` 目录则负责可复用 UI 子模块和配置

## 可拔插特性

由于采用模块扫描和统一 `payload` 传递，新增业务逻辑只需：

1. 在 `state/` 或 `module/` 下新增 JS 文件
2. 或在 `component/` 下新增组件子目录
3. 不需要改动主组件入口或核心组装器

这样即可保持架构的可扩展性和可维护性。
