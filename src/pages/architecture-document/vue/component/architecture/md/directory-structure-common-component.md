---
title: 通用组件模板目录结构
order: 18
---

## 通用组件模板目录结构

这套结构是一个高度解耦的通用组件模板。

模板包含：11 个目录, 15 个文件。

一切都是模块化的，按需增加文件，按需删除文件。

本模板从后台页面模板删减而成，适用于任何级别的组件开发。

```bash
# bash
tree  ./common-component-template > structure-common-component.txt
# powershell
tree ./common-component-template /f /a > structure-common-component.txt
# powershell
npx tree-cli -l 10 -o structure-common-component.txt


```

## 表格视图

| 完整路径                                                                   | 类型 | 说明 (备注)                               |
| :------------------------------------------------------------------------- | :--- | :---------------------------------------- |
| `./common-component-template`                                              | 目录 | 页面模板根目录                            |
| `./common-component-template/api-request`                                  | 目录 | 接口请求层，负责与后端交互                |
| `./common-component-template/api-request/index.js`                         | 文件 | 请求接口导出入口                          |
| `./common-component-template/api-request/module`                           | 目录 | 业务模块相关的请求逻辑                    |
| `./common-component-template/api-request/module/handle_init_table_data.js` | 文件 | **表格初始化数据**的获取与处理逻辑        |
| `./common-component-template/composable`                                   | 目录 | **Vue Composables** (组合式 API 逻辑抽离) |
| `./common-component-template/assembler/assembler.js`                       | 文件 | 聚合装配 (Assembler/All Assembly)         |
| `./common-component-template/assembler/module`                             | 目录 | 装配单元目录                              |
| `./common-component-template/assembler/module/lifecycle.js`                | 文件 | 单元调度装配 (Lifecycle Assembly)         |
| `./common-component-template/assembler/module/method.js`                   | 文件 | 单元方法装配 (Method Assembly)            |
| `./common-component-template/assembler/module/state.js`                    | 文件 | 单元属性装配 (State Assembly)             |
| `./common-component-template/css`                                          | 目录 | 样式文件夹                                |
| `./common-component-template/css/index.scss`                               | 文件 | 组件局部样式定义                          |
| `./common-component-template/effect`                                       | 目录 | **副作用/监听层**，处理非 UI 的逻辑触发   |
| `./common-component-template/effect/mitter.js`                             | 文件 | 事件总线 (Mitt) 处理                      |
| `./common-component-template/effect/watcher.js`                            | 文件 | Vue Watcher 监听逻辑                      |
| `./common-component-template/index.vue`                                    | 文件 | **主入口页面**                            |
| `./common-component-template/module`                                       | 目录 | 组件的**业务逻辑处理**模块                |
| `./common-component-template/module/emit`                                  | 目录 | 向父级组件的事件派发逻辑                  |
| `./common-component-template/module/emit/emit.js`                          | 文件 | 向父级组件的事件分发函数定义              |
| `./common-component-template/module/other-method`                          | 目录 | 其他业务方法                              |
| `./common-component-template/module/other-method/index.js`                 | 文件 | 其他业务方法                              |
| `./common-component-template/state`                                        | 目录 | 状态机                                    |
| `./common-component-template/state/computed.js`                            | 文件 | 复杂的计算属性逻辑抽离                    |
| `./common-component-template/state/config.js`                              | 文件 | 状态层的默认配置/常量                     |
| `./common-component-template/state/multiton.js`                            | 文件 | **多例**状态管理                          |

## 树形视图

```text
./common-component-template
├── api-request
│   ├── index.js
│   └── module
│       └── handle_init_table_data.js
├── assembler
│   ├── assembler.js
│   └── module
│       ├── lifecycle.js
│       ├── method.js
│       └── state.js
├── css
│   └── index.scss
├── effect
│   ├── mitter.js
│   └── watcher.js
├── index.vue
├── module
│   ├── emit
│   │   └── emit.js
│   └── other-method
│       └── index.js
└── state
    ├── computed.js
    ├── config.js
    └── multiton.js





```
