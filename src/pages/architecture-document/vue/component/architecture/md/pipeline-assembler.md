---
title: 业务函数-聚合装配-子孙组件消费事件管道
order: 101
---

## 事件管道-下游消费事件聚合装配

## 1. 封装通用调度器

```javascript
import { get_file_name_cases } from 'src/common/util/file/file.js'

/**
 * 通用管道事件调度器
 * @param {Object} modules - 由 import.meta.glob 扫描出的原始对象
 * @param {string} currentFilePath - 传入 import.meta.url
 * @returns {Object} 包含代理对象和生成器
 * @description
 * 1. 预处理：解析路径并转换 snake_case，排除下划线文件。
 * 2. 定义新的生成器函数 (传入 payload 参数)，支持动态注入上下文。
 * 3. 包装模块内容为方法对象，自动补全第一个参数为 payload。
 * 4. 处理 income_pipeline 注入，将指定函数添加到 all_event_pipeline 的 income 属性中。
 */
export const event_pipeline_register = ({ modules, currentFilePath }) => {
  const modules_obj = {}
  const all_event_pipeline = {}

  // 1. 预处理：解析路径并转换 snake_case，排除下划线文件
  Object.keys(modules).forEach((path) => {
    const { original, snake } = get_file_name_cases(path)

    // 过滤约定：以 "___" 结尾的文件名不参与聚合
    if (original.endsWith('___')) return

    // 提取模块内容（兼容 default 导出和具名导出）
    modules_obj[snake] = modules[path].default || modules[path]
  })

  /**
   * 2. 定义新的生成器函数 (传入 payload 参数)
   */
  const create_event_pipeline = (payload = {}) => {
    // 3.  包装模块内容为 方法对象
    Object.entries(modules_obj).forEach(([fileName, moduleContent]) => {
      Object.entries(moduleContent).forEach(([methodName, originMethod]) => {
        if (typeof originMethod === 'function') {
          // 核心实现：补全第一个参数为 payload
          moduleContent[methodName] = (...args) => originMethod(payload, ...args)
        }
        all_event_pipeline[fileName] = moduleContent
      })
    })
    // 4. 处理 income_pipeline 注入
    const { income_pipeline } = payload || {}
    if (income_pipeline) {
      let income_pipeline_obj = {}
      income_pipeline.map((incomeMethodName) => {
        let originMethod = payload[incomeMethodName]

        if (typeof originMethod === 'function') {
          // 核心实现：补全第一个参数为 payload
          income_pipeline_obj[incomeMethodName] = (...args) => originMethod(payload, ...args)
        }
      })

      all_event_pipeline['income'] = income_pipeline_obj
    }
  }

  return {
    all_event_pipeline,
    create_event_pipeline,
  }
}
```

## 2. 在业务目录中使用示例(`module/event-pipeline/event-pipeline.js`)

```javascript
import { event_pipeline_register } from 'src/output/common/project-common.js'

// 1. 扫描当前目录下 module 文件夹中的 JS
const modules = import.meta.glob('../module/event-pipeline/*.js', {
  eager: true,
})

// 2. 记录当前文件路径
const currentFilePath = import.meta.url

// 3. 传入参数进行封装
export const { all_event_pipeline, create_event_pipeline } = event_pipeline_register(
  modules,
  currentFilePath,
)
```

## 3. 子模块编写示例 (`module/event-pipeline/module/other.js`)

```javascript
import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

export { handle_init_table_data }
export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
```

## 4. 最终调用效果

```javascript
import { all_event_pipeline } from 'src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js'

//  <q-btn
//         label="查询"
//         color="primary"
//         @click="all_event_pipeline.other.handle_query_click"
//       />
```

## 💡 核心逻辑说明

1. **增补参数策略**：`return (...args) => originMethod(payload, ...args)` 确保了 `payload` 永远是第一个参数，后续业务参数依次排列，非常适合处理**上下文注入**。
2. **上下文隔离**：`all_event_pipeline.other.handle_query_click` 子孙组件调用父级方法时，会自动将父级方法第一个参数 `payload` 透传给被调用的方法。
3. **Snake Case 约束**：无论文件名是 `UserCenter.js` 还是 `userCenter.js`，最终通过代理访问时必须使用 `user_center`，保证了调用链命名的规范性。
