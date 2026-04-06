---
title: 生命周期、事件管道与方法暴露说明
order: 81
---

# 生命周期、事件管道与方法暴露说明

## 目录结构

```
module/
├── emit/
│   └── emit.js
├── event-pipeline/
│   ├── event-pipeline.js
│   └── module/
├── lifecycle/
│   └── lifecycle.js
├── other-method/
│   └── index.js
```

## 生命周期模块

`module/lifecycle/lifecycle.js` 提供了组件生命周期钩子方法：

```javascript
import { handle_query_demo } from '../../api-request/index.js'
import { handle_xxx_demo } from '../other-method/index.js'
export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')
  handle_xxx_demo(payload)
}
export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')
  handle_query_demo(payload)
}
```

- `lifecycle_onBeforeMount` 可用于组件挂载前初始化逻辑
- `lifecycle_onMounted` 可用于挂载后发起数据请求
- `lifecycle_onBeforeUnmount` / `lifecycle_onUnmounted` / `lifecycle_onActivated` / `lifecycle_onDeactivated` 预留生命周期扩展点

## 事件管道模块

`module/event-pipeline/event-pipeline.js` 使用 `event_pipeline_register` 扫描当前目录下的事件模块：

```javascript
const modules = import.meta.glob('../module/event-pipeline/*.js', {
  eager: true,
})
export const { all_event_pipeline, create_event_pipeline } =
  event_pipeline_register(modules, currentFilePath)
```

该设计支持：
- 事件模块自动注册
- 按需创建事件管道
- 模块化拆分事件逻辑

## 事件发射模块

`module/emit/emit.js` 提供发射器创建函数：

```javascript
export const create_messaging_emit = (payload) => {
  const { emit, btn_a_color } = payload
  const btn_a_click = () => {
    emit('btn-a-click', btn_a_color.value)
  }
  return {
    btn_a_click,
  }
}
```

- `emit` 由组件 `defineEmits` 提供
- 该模块通过 `payload` 解构上下文，生成可供模板使用的方法

## 业务方法模块

`module/other-method/index.js` 是业务方法入口，当前包含演示函数：

```javascript
export const handle_xxx_demo = (payload) => {
  const {
    // ...
  } = payload
  return {
    // ...
  }
}
```

- 该模块适合放置自定义业务方法
- 可以通过 `payload` 获取组件上下文数据

## 设计价值

- 生命周期、事件、发射器、业务方法均基于 `payload` 统一传递
- 各模块可独立开发、独立测试
- 通过 `import.meta.glob` 自动扫描，支持无侵入式扩展
- 该架构增强了可维护性与可拔插能力
