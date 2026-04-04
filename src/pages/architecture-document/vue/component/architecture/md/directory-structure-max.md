---
title: 模板代码目录结构
order: 21
---

## 模板代码目录结构

这套结构是一个高度解耦的后台页面模板。

模板包含：25 个目录, 34 个文件。

一切都是模块化的，热拔插的，按需增加或者删除文件，非常轻松。

通用的组件模板可以从这个标准后台页面模板内删减所得。

#### 注意

- 后台管理类项目是平坦化的，组件层级深度较浅，事件管道,event-pipeline 模式更适合。
- 复杂客户端类型的项目是树形的，组件层级深度较深，事件总线，mitt 模式更适合。
- 小型组件一样采用这种结构，
- 文件路径和文件名不能更换
- 部分函数名字不可更换

```bash
# bash
tree  ./max-template > structure.txt
# powershell
tree ./max-template /f /a | Out-File -FilePath structure.txt -Encoding utf8

# powershell
npx tree-cli -l 10 -o structure.txt


```

## 后台页面模板目录结构

## 表格视图

| 完整路径                                                     | 类型 | 说明 (备注)                             |
| :----------------------------------------------------------- | :--- | :-------------------------------------- |
| `./max-template`                                             | 目录 | 页面模板根目录                          |
| `./max-template/api-request`                                 | 目录 | 接口请求层，负责与后端交互              |
| `./max-template/api-request/index.js`                        | 文件 | 请求接口导出入口                        |
| `./max-template/api-request/module`                          | 目录 | 业务模块相关的请求逻辑                  |
| `./max-template/api-request/module/handle_init_table_data.js` | 文件 | **表格初始化数据**的获取与处理逻辑      |
| `./max-template/component`                                   | 目录 | 页面私有组件库                          |
| `./max-template/component/dialog-wrapper`                    | 目录 | **弹窗容器**组件，统一管理弹窗表现      |
| `./max-template/component/dialog-wrapper/component`          | 目录 | 弹窗内嵌入的具体业务组件                |
| `./max-template/component/dialog-wrapper/component/dialog-copy-use` | 目录 | 弹窗组件示例                            |
| `./max-template/component/dialog-wrapper/component/dialog-copy-use/dialog-copy-use.vue` | 文件 | 弹窗组件示例                            |
| `./max-template/component/dialog-wrapper/config`             | 目录 | 弹窗包装器相关的配置                    |
| `./max-template/component/dialog-wrapper/config/config.js`   | 文件 | 弹窗包装器相关的配置 文件               |
| `./max-template/component/dialog-wrapper/dialog-wrapper.vue` | 文件 | 弹窗包装器主文件                        |
| `./max-template/component/table-main-area`                   | 目录 | **主表格区域**组件                      |
| `./max-template/component/table-main-area/component`         | 目录 | 表格内部组件（如自定义单元格）          |
| `./max-template/component/table-main-area/component/table-td-copy-use` | 目录 | 表格单元格组件示例                      |
| `./max-template/component/table-main-area/component/table-td-copy-use/table-td-copy-use.vue` | 文件 | 表格单元格组件示例                      |
| `./max-template/component/table-main-area/config`            | 目录 | 表格配置项                              |
| `./max-template/component/table-main-area/config/config.js`  | 文件 | 表格配置项（如 Table-Column 配置）      |
| `./max-template/component/table-main-area/table-main-area.vue` | 文件 | 表格区域主文件                          |
| `./max-template/component/top-search-area`                   | 目录 | **顶部搜索/筛选**区域组件               |
| `./max-template/component/top-search-area/top-search-area.vue` | 文件 | 搜索表单主文件                          |
| `./max-template/assemble`                                    | 目录 | VUE 装配逻辑                            |
| `./max-template/assembler/assembler.js`                      | 文件 | 聚合装配 (Assembler/All Assembly)       |
| `./max-template/css`                                         | 目录 | 样式文件夹                              |
| `./max-template/css/index.scss`                              | 文件 | 页面局部样式定义                        |
| `./max-template/module/effect`                               | 目录 | **副作用/监听层**，处理非 UI 的逻辑触发 |
| `./max-template/module/effect/dom.js`                        | 文件 | 直接操作 DOM 的相关逻辑                 |
| `./max-template/module/effect/listener.js`                   | 文件 | 各种原生监听器（如 resize, scroll 等）  |
| `./max-template/module/effect/mitter.js`                     | 文件 | 事件总线 (Mitt) 处理                    |
| `./max-template/module/effect/other.js`                      | 文件 | 其他非分类副作用                        |
| `./max-template/module/effect/timer.js`                      | 文件 | 定时器相关逻辑管理                      |
| `./max-template/module/effect/watcher.js`                    | 文件 | Vue Watcher 监听逻辑                    |
| `./max-template/module/lifecycle`                            | 目录 | 生命周期回调                            |
| `./max-template/module/lifecycle/lifecycle.js`               | 文件 | 生命周期回调                            |
| `./max-template/module/exposed-method`                       | 目录 | 对外暴露方法                            |
| `./max-template/module/exposed-method/exposed-method.js`     | 文件 | 对外暴露方法                            |
| `./max-template/index.vue`                                   | 文件 | **主入口页面**                          |
| `./max-template/module`                                      | 目录 | 页面级的**业务逻辑处理**模块            |
| `./max-template/module/emit`                                 | 目录 | 向父级组件的事件派发逻辑                |
| `./max-template/module/emit/emit.js`                         | 文件 | 向父级组件的事件分发函数定义            |
| `./max-template/module/event-listener`                       | 目录 | 原生事件监听配置                        |
| `./max-template/module/event-listener/event-listener.js`     | 文件 | 原生事件监听配置                        |
| `./max-template/module/event-pipeline`                       | 目录 | 向子孙组件的事件管道                    |
| `./max-template/module/event-pipeline/event-pipeline.js`     | 文件 | 向子孙组件的事件管道生成器              |
| `./max-template/module/event-pipeline/module`                | 目录 | 不同交互场景的事件管道分支              |
| `./max-template/module/event-pipeline/module/dialog.js`      | 文件 | 弹窗相关的事件管道                      |
| `./max-template/module/event-pipeline/module/other.js`       | 文件 | 其他业务流程的事件管道                  |
| `./max-template/module/event-pipeline/module/table.js`       | 文件 | 表格相关的的事件管道                    |
| `./max-template/module/other-method`                         | 目录 | 其他业务方法                            |
| `./max-template/module/other-method/index.js`                | 文件 | 其他业务方法                            |
| `./max-template/state`                                       | 目录 | 状态机                                  |
| `./max-template/state/computed.js`                           | 文件 | 复杂的计算属性逻辑抽离                  |
| `./max-template/state/config.js`                             | 文件 | 状态层的默认配置/常量                   |
| `./max-template/state/multiton.js`                           | 文件 | **多例**状态管理                        |
| `./max-template/state/singleton`                             | 目录 | **单例**状态管理目录                    |
| `./max-template/state/singleton/dialog.js`                   | 文件 | 弹窗的显示/隐藏/参数状态                |
| `./max-template/state/singleton/other.js`                    | 文件 | 其他单例状态                            |
| `./max-template/state/singleton/table.js`                    | 文件 | 表格的分页、选态、数据源状态            |
| `./max-template/state/singleton.js`                          | 文件 | 单例状态的主导出文件                    |

## 树形视图

```text
./max-template
├── api-request
│   ├── index.js
│   └── module
│       └── handle_init_table_data.js
├── assembler
│   └── assembler.js
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
├── css
│   └── index.scss
├── index.vue
├── module
│   ├── effect
│   │   ├── dom.js
│   │   ├── listener.js
│   │   ├── mitter.js
│   │   ├── other.js
│   │   ├── timer.js
│   │   └── watcher.js
│   ├── emit
│   │   └── emit.js
│   ├── event-pipeline
│   │   ├── event-pipeline.js
│   │   └── module
│   │       ├── dialog.js
│   │       ├── other.js
│   │       └── table.js
│   ├── exposed-method
│   │   └── exposed-method.js
│   ├── lifecycle
│   │   └── lifecycle.js
│   └── other-method
│       ├── event-listener.js
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
