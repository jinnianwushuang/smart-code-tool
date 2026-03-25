---
title: 事件管道-代理模式
order: 101
---

## 事件管道-代理模式

这是一个非常硬核的**架构级封装**。通过 `Proxy` 代理，我们可以在运行时动态拦截 `file_name` 和 `method_name`，从而实现一种类似“命令模式”或“管道调度”的调用体验。

根据你的要求，我们需要将 **Vite 的静态扫描结果**（`modulesRaw`）和 **当前文件元数据**（`currentFilePath`）从函数内部剥离出来，作为参数注入。这样封装后的 `usePipelineLoader` 将变成一个**纯逻辑调度器**，可以在任何目录下复用。

## 1. 封装通用调度器 `pipeline-engine.js`

这个文件不包含任何 `import.meta`，只负责逻辑转换和 `Proxy` 代理。

```javascript
import { snakeCase } from 'change-case'

/**
 * 通用管道事件调度器
 * @param {Object} modulesRaw - 由 import.meta.glob 扫描出的原始对象
 * @param {string} currentFilePath - 传入 import.meta.url
 * @returns {Object} 包含代理对象和生成器
 */
export const usePipelineLoader = (modulesRaw, currentFilePath) => {
  const modules = {}

  // 1. 预处理：解析路径并转换 snake_case，排除下划线文件
  Object.keys(modulesRaw).forEach((path) => {
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')

    if (!fileName.startsWith('_')) {
      const key = snakeCase(fileName)
      // 提取模块内容（兼容 default 导出和具名导出）
      modules[key] = modulesRaw[path].default || modulesRaw[path]
    }
  })

  /**
   * 2. 定义新的生成器函数 (传入 payload 参数)
   */
  const createPipelineEvent = (payload = {}) => {
    // 3. 定义代理对象
    return new Proxy(modules, {
      get(target, fileName) {
        // 第一层拦截：文件名 (file_name)
        if (!(fileName in target)) {
          console.error(`[Pipeline Error] 模块 "${fileName}" 不存在。来源: ${currentFilePath}`)
          return {}
        }

        const moduleContent = target[fileName]

        return new Proxy(moduleContent, {
          get(subTarget, methodName) {
            // 第二层拦截：函数名 (method_name)
            const originMethod = subTarget[methodName]

            if (typeof originMethod === 'function') {
              // 核心实现：补全第一个参数为 payload
              return (...args) => originMethod(payload, ...args)
            }
            return originMethod
          },
        })
      },
    })
  }

  // 4. 定义默认的代理对象 (payload 为空)
  const all_pipeline_event = createPipelineEvent({})

  return {
    all_pipeline_event,
    createPipelineEvent,
    currentFilePath, // 记录并返回原始路径供调试
  }
}
```

## 2. 在业务目录中使用示例

假设你在 `src/api/events/index.js` 中使用它：

```javascript
// src/api/events/index.js
import { usePipelineLoader } from '@/utils/pipeline-engine'

// 1. 扫描当前目录下 module 文件夹中的 JS
const modulesRaw = import.meta.glob('./module/*.js', { eager: true })

// 2. 记录当前文件路径
const currentFilePath = import.meta.url

// 3. 传入参数进行封装
export const { all_pipeline_event, createPipelineEvent } = usePipelineLoader(
  modulesRaw,
  currentFilePath,
)
```

## 3. 子模块编写示例 (`module/user_center.js`)

```javascript
// src/api/events/module/user_center.js
export const update_profile = (payload, userId, newName) => {
  console.log('--- 管道触发 ---')
  console.log('系统负载 (Payload):', payload)
  console.log('业务参数 (userId):', userId)
  console.log('业务参数 (newName):', newName)
}
```

## 4. 最终调用效果

```javascript
import { all_pipeline_event, createPipelineEvent } from '@/api/events'

// 方式 A: 直接执行默认对象
// 实际执行: update_profile({}, '001', '张三')
all_pipeline_event.user_center.update_profile('001', '张三')

// 方式 B: 注入 Payload 执行
// 实际执行: update_profile({ token: 'xyz' }, '002', '李四')
const customEvent = createPipelineEvent({ token: 'xyz' })
customEvent.user_center.update_profile('002', '李四')
```

## 💡 核心逻辑说明

1. **参数化隔离**：将 `import.meta` 移出通用函数，解决了 Vite 在不同目录下解析路径的上下文限制。
2. **增补参数策略**：`return (...args) => originMethod(payload, ...args)` 确保了 `payload` 永远是第一个参数，后续业务参数依次排列，非常适合处理**上下文注入**。
3. **Snake Case 约束**：无论文件名是 `UserCenter.js` 还是 `userCenter.js`，最终通过代理访问时必须使用 `user_center`，保证了调用链命名的规范性。

你是否需要在这个调度器中增加 **异步链式调用 (Async Chain)** 或 **执行结果自动日志打印** 功能？**立即开始** 或 **告知细节**。
