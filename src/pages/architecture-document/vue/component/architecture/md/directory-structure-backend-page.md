---
title: 后台页面模板目录结构
order: 21
---

## 后台页面模板目录结构

这套结构是一个高度解耦的后台页面模板。

模板包含：25 个目录, 35 个文件。

一切都是模块化的，按需增加文件，按需删除文件。

```bash
# bash
tree  ./backend-page-template > structure-backend-page.txt
# powershell
tree ./backend-page-template /f /a > structure-backend-page.txt
# powershell
npx tree-cli -l 10 -o structure-backend-page.txt


```

## 表格视图

| 完整路径                                                                                              | 类型 | 说明 (备注)                               |
| :---------------------------------------------------------------------------------------------------- | :--- | :---------------------------------------- |
| `./backend-page-template`                                                                             | 目录 | 页面模板根目录                            |
| `./backend-page-template/api-request`                                                                 | 目录 | 接口请求层，负责与后端交互                |
| `./backend-page-template/api-request/index.js`                                                        | 文件 | 请求接口导出入口                          |
| `./backend-page-template/api-request/module`                                                          | 目录 | 业务模块相关的请求逻辑                    |
| `./backend-page-template/api-request/module/handle_init_table_data.js`                                | 文件 | **表格初始化数据**的获取与处理逻辑        |
| `./backend-page-template/component`                                                                   | 目录 | 页面私有组件库                            |
| `./backend-page-template/component/dialog-wrapper`                                                    | 目录 | **弹窗容器**组件，统一管理弹窗表现        |
| `./backend-page-template/component/dialog-wrapper/component`                                          | 目录 | 弹窗内嵌入的具体业务组件                  |
| `./backend-page-template/component/dialog-wrapper/component/dialog-copy-use`                          | 目录 | 弹窗组件示例                              |
| `./backend-page-template/component/dialog-wrapper/component/dialog-copy-use/dialog-copy-use.vue`      | 文件 | 弹窗组件示例                              |
| `./backend-page-template/component/dialog-wrapper/config`                                             | 目录 | 弹窗包装器相关的配置                      |
| `./backend-page-template/component/dialog-wrapper/config/config.js`                                   | 文件 | 弹窗包装器相关的配置 文件                 |
| `./backend-page-template/component/dialog-wrapper/dialog-wrapper.vue`                                 | 文件 | 弹窗包装器主文件                          |
| `./backend-page-template/component/table-main-area`                                                   | 目录 | **主表格区域**组件                        |
| `./backend-page-template/component/table-main-area/component`                                         | 目录 | 表格内部组件（如自定义单元格）            |
| `./backend-page-template/component/table-main-area/component/table-td-copy-use`                       | 目录 | 表格单元格组件示例                        |
| `./backend-page-template/component/table-main-area/component/table-td-copy-use/table-td-copy-use.vue` | 文件 | 表格单元格组件示例                        |
| `./backend-page-template/component/table-main-area/config`                                            | 目录 | 表格配置项                                |
| `./backend-page-template/component/table-main-area/config/config.js`                                  | 文件 | 表格配置项（如 Table-Column 配置）        |
| `./backend-page-template/component/table-main-area/table-main-area.vue`                               | 文件 | 表格区域主文件                            |
| `./backend-page-template/component/top-search-area`                                                   | 目录 | **顶部搜索/筛选**区域组件                 |
| `./backend-page-template/component/top-search-area/top-search-area.vue`                               | 文件 | 搜索表单主文件                            |
| `./backend-page-template/composable`                                                                  | 目录 | **Vue Composables** (组合式 API 逻辑抽离) |
| `./backend-page-template/assembler/assembler.js`                                                      | 文件 | 聚合装配 (Assembler/All Assembly)         |
| `./backend-page-template/assembler/module`                                                            | 目录 | 装配单元目录                              |
| `./backend-page-template/assembler/module/lifecycle.js`                                               | 文件 | 单元调度装配 (Lifecycle Assembly)         |
| `./backend-page-template/assembler/module/method.js`                                                  | 文件 | 单元方法装配 (Method Assembly)            |
| `./backend-page-template/assembler/module/state.js`                                                   | 文件 | 单元属性装配 (State Assembly)             |
| `./backend-page-template/css`                                                                         | 目录 | 样式文件夹                                |
| `./backend-page-template/css/index.scss`                                                              | 文件 | 页面局部样式定义                          |
| `./backend-page-template/effect`                                                                      | 目录 | **副作用/监听层**，处理非 UI 的逻辑触发   |
| `./backend-page-template/effect/dom.js`                                                               | 文件 | 直接操作 DOM 的相关逻辑                   |
| `./backend-page-template/effect/listener.js`                                                          | 文件 | 各种原生监听器（如 resize, scroll 等）    |
| `./backend-page-template/effect/mitter.js`                                                            | 文件 | 事件总线 (Mitt) 处理                      |
| `./backend-page-template/effect/other.js`                                                             | 文件 | 其他非分类副作用                          |
| `./backend-page-template/effect/timer.js`                                                             | 文件 | 定时器相关逻辑管理                        |
| `./backend-page-template/effect/watcher.js`                                                           | 文件 | Vue Watcher 监听逻辑                      |
| `./backend-page-template/index.vue`                                                                   | 文件 | **主入口页面**                            |
| `./backend-page-template/module`                                                                      | 目录 | 页面级的**业务逻辑处理**模块              |
| `./backend-page-template/module/emit`                                                                 | 目录 | 向父级组件的事件派发逻辑                  |
| `./backend-page-template/module/emit/emit.js`                                                         | 文件 | 向父级组件的事件分发函数定义              |
| `./backend-page-template/module/event-listener`                                                       | 目录 | 原生事件监听配置                          |
| `./backend-page-template/module/event-listener/event-listener.js`                                     | 文件 | 原生事件监听配置                          |
| `./backend-page-template/module/event-pipeline`                                                       | 目录 | 向子孙组件的事件管道                      |
| `./backend-page-template/module/event-pipeline/event-pipeline.js`                                     | 文件 | 向子孙组件的事件管道生成器                |
| `./backend-page-template/module/event-pipeline/module`                                                | 目录 | 不同交互场景的事件管道分支                |
| `./backend-page-template/module/event-pipeline/module/dialog.js`                                      | 文件 | 弹窗相关的事件管道                        |
| `./backend-page-template/module/event-pipeline/module/other.js`                                       | 文件 | 其他业务流程的事件管道                    |
| `./backend-page-template/module/event-pipeline/module/table.js`                                       | 文件 | 表格相关的的事件管道                      |
| `./backend-page-template/module/other-method`                                                         | 目录 | 其他业务方法                              |
| `./backend-page-template/module/other-method/index.js`                                                | 文件 | 其他业务方法                              |
| `./backend-page-template/state`                                                                       | 目录 | 状态机                                    |
| `./backend-page-template/state/computed.js`                                                           | 文件 | 复杂的计算属性逻辑抽离                    |
| `./backend-page-template/state/config.js`                                                             | 文件 | 状态层的默认配置/常量                     |
| `./backend-page-template/state/multiton.js`                                                           | 文件 | **多例**状态管理                          |
| `./backend-page-template/state/singleton`                                                             | 目录 | **单例**状态管理目录                      |
| `./backend-page-template/state/singleton/dialog.js`                                                   | 文件 | 弹窗的显示/隐藏/参数状态                  |
| `./backend-page-template/state/singleton/other.js`                                                    | 文件 | 其他单例状态                              |
| `./backend-page-template/state/singleton/table.js`                                                    | 文件 | 表格的分页、选态、数据源状态              |
| `./backend-page-template/state/singleton.js`                                                          | 文件 | 单例状态的主导出文件                      |

## 树形视图

```text
./backend-page-template
├── api-request
│   ├── index.js
│   └── module
│       └── handle_init_table_data.js
├── component
│   ├── dialog-wrapper
│   │   ├── component
│   │   │   └── dialog-copy-use
│   │   │       └── dialog-copy-use.vue
│   │   ├── config
│   │   │   └── config.js
│   │   └── dialog-wrapper.vue
│   ├── table-main-area
│   │   ├── component
│   │   │   └── table-td-copy-use
│   │   │       └── table-td-copy-use.vue
│   │   ├── config
│   │   │   └── config.js
│   │   └── table-main-area.vue
│   └── top-search-area
│       └── top-search-area.vue
├── assembler
│   ├── assembler.js
│   └── module
│       ├── lifecycle.js
│       ├── method.js
│       └── state.js
├── css
│   └── index.scss
├── effect
│   ├── dom.js
│   ├── listener.js
│   ├── mitter.js
│   ├── other.js
│   ├── timer.js
│   └── watcher.js
├── index.vue
├── module
│   ├── emit
│   │   └── emit.js
│   ├── event-listener
│   │   └── event-listener.js
│   ├── event-pipeline
│   │   ├── event-pipeline.js
│   │   └── module
│   │       ├── dialog.js
│   │       ├── other.js
│   │       └── table.js
│   └── other-method
│       └── index.js
└── state
   ├── computed.js
   ├── config.js
   ├── multiton.js
   ├── singleton
   │   ├── dialog.js
   │   ├── other.js
   │   └── table.js
   └── singleton.js






```
