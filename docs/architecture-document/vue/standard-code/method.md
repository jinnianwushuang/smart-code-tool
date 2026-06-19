---
title: 零件-方法
order: 31
---

## 零件-方法-目录结构

#### module 目录

```text
./module
├── emit
│   └── emit.js
├── event-listener
│   └── event-listener.js
├── event-pipeline
│   ├── event-pipeline.js
│   └── module
│       ├── dialog.js
│       ├── other.js
│       └── table.js
└── other-method
    └── index.js

```

#### api-request 目录

```text
./api-request
├── index.js
└── module
    └── handle_init_table_data.js

```

#### effect 目录

```text
./effect
├── dom.js
├── listener.js
├── mitter.js
├── other.js
├── timer.js
└── watcher.js

```

## api-request聚合导出：api-request/index.js

```javascript
import { common_assemble_function } from 'src/output/common/project-common.js'

// 1. 扫描 module 目录下所有 .js 文件
// eager: true 表示同步引入，生成的 modules 是一个包含模块内容的 Object
const modules = import.meta.glob('./module/*.js', { eager: true })

// 3. 统一导出
export default common_assemble_function(modules)
```

## 事件管道聚合导出：module/event-pipeline/event-pipeline.js

```javascript
import { assemble_event_pipeline } from 'src/output/common/project-common.js'

// 1. 扫描当前目录下 module 文件夹中的 JS
const modules = import.meta.glob('../module/event-pipeline/*.js', {
  eager: true,
})

// 2. 记录当前文件路径
const currentFilePath = import.meta.url

// 3. 传入参数进行封装
export const { ALL_EVENT_PIPELINE, create_event_pipeline } = assemble_event_pipeline(
  modules,
  currentFilePath,
)
```

## 单个函数示例

```javascript
export const handle_dialog_copy_use_confirm_click = (payload) => {
  const { all_dialog_state } = payload
  all_dialog_state.value.dialog_copy_use = true
}
```

## 管道文件内函数嫁接示例

```javascript
import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

export { handle_init_table_data }
export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
```
