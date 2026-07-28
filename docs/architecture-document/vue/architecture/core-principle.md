---
title: 架构核心原理：零件+装配=页面
order: 1
---

# 架构核心原理：零件+装配=页面

## 1. 核心公式

> **零件（属性 + 方法 ）+ 装配（零件装配 +上下文装配） = 页面**

## 2. 零件库 (Atoms)

## 零件：属性 (State )

| 类型         | 说明                         | 对应 Vue 概念       | 对应 目录、文件        |
| :----------- | :--------------------------- | :------------------ | ---------------------- |
| **常量配置** | 静态配置（全局）             | `project-common.js` | `project-common.js`    |
| **外部输入** | 父组件透传的只读数据         | `defineProps`       | 模块/index.vue         |
| **内部状态** | 组件私有的响应式数据、状态机 | `ref`, `reactive`   | 模块/state/            |
| **衍生状态** | 基于基础数据计算而来的逻辑   | `computed`          | 模块/state/computed.js |
| **共享状态** | 全局或模块间的共享数据       | `Pinia` / `Vuex`    | 模块/state/computed.js |
| **常量配置** | 静态配置（模块/本地）        | `config.js`         | 模块/state/onfig.js    |

## 零件：方法 ( Methods)

| 类型              | 说明                                                       | 对应 目录、文件                                |
| :---------------- | :--------------------------------------------------------- | :--------------------------------------------- |
| **全局工具**      | 如日期格式化、消息提示等通用函数                           | `project-common.js`                            |
| **Store状态变更** | 原 `VUEX` 中的 `Setter` 函数                               | 直接引入使用                                   |
| **接口调度**      | 组件私有API请求逻辑函数                                    | `模块/api-request/`                            |
| **业务逻辑**      | 组件私有业务逻辑函数                                       | `模块/module/`                                 |
| 对外输出函数      | 逻辑切面对外输出函数                                       | `模块/module/expose-method/exposed-method.js`  |
| 生命周期          | 生命周期回调方法                                           | `模块/module/lifecycle/lifecycle.js`           |
| **向上事件派发**  | 消息通信：对父级组件的派发事件生成器                       | `模块/module/emit/emit.js`                     |
| **向下事件管道**  | 消息通信：对子孙组件的事件管道注册器                       | `模块/module/event-pipeline/event-pipeline.js` |
| **Vue监听清理**   | 副作用清理：Vue 监听生成器                                 | `模块/module/effect/watcher.js`                |
| **原生监听清理**  | 副作用清理：DOM事件监听 生成器                             | `模块/module/effect/listener.js`               |
| **全局事件总线**  | 副作用清理：Mitt 生成器                                    | `模块/module/effect/mitter.js`                 |
| **DOM清理**       | 副作用清理：DOM 引用生成器                                 | `模块/module/effect/dom.js`                    |
| **定时器清理**    | 副作用清理：定时器、动画帧 生成器                          | `模块/module/effect/timer.js`                  |
| **其他清理**      | 副作用清理：Observer，AbortController，WebSocket 等 生成器 | `模块/module/effect/other.js`                  |

## 3. 装配 (Assembly)

| 事务                          | 说明                                                     | 对应 目录、文件             |
| ----------------------------- | -------------------------------------------------------- | --------------------------- |
| 零件聚合装配 (Atoms Assembly) | 将属性、方法聚合装配。                                   | 模块/assembler/assembler.js |
| 上下文装配(Context Assembly)  | 执行最终聚合生成的队列，对提供的基础上下文进行扩充装配。 | 模块/index.vue              |

## 4. 调试指南

当需要定位逻辑源头时，按以下优先级进行排查：

1. **当前组件目录：** 查看所在目录下的局部逻辑块。
2. **composable-common：** 查看模块内的通用组合逻辑。
3. **project-common：** 查看项目级的公共逻辑。
4. **store-common：** 针对 VUEX 等明显单例特征的状态。
