---
title: 事件管道-MITT模式
order: 103
---

# 事件管道-MITT模式

既然要使用 **mitt** 来等比实现，我们的思路需要从“**直接调用**”转变为“**事件驱动**”。

在这种架构下，`all_pipeline_event` 不再是一个嵌套的 Proxy 函数调用器，而是一个**事件发布者**。当你访问 `all_pipeline_event.file_name.method_name(args)` 时，它实际上是触发了一个格式为 `file_name:method_name` 的全局事件。

## 1. 核心调度器实现 `pipeline-mitt-engine.js`

我们需要安装 `mitt`：`npm install mitt`。

```javascript
import { snakeCase } from 'change-case'
import mitt from 'mitt'

/**
 * Mitt 版管道事件调度器
 * @param {Object} modulesRaw - import.meta.glob 的结果
 * @param {string} currentFilePath - import.meta.url
 */
export const usePipelineLoader = (modulesRaw, currentFilePath) => {
  const emitter = mitt()
  const modules = {}

  // 1. 预处理模块并自动注册 Mitt 监听
  Object.keys(modulesRaw).forEach((path) => {
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')
    if (fileName.startsWith('_')) return

    const fileNameSnake = snakeCase(fileName)
    const moduleContent = modulesRaw[path].default || modulesRaw[path]
    modules[fileNameSnake] = moduleContent

    // 自动为模块内的每个函数注册事件监听
    // 事件名格式: "user_manager:get_info"
    Object.keys(moduleContent).forEach((methodName) => {
      if (typeof moduleContent[methodName] === 'function') {
        const eventName = `${fileNameSnake}:${methodName}`

        // 监听事件：解构出 payload 和 原始参数
        emitter.on(eventName, ({ payload, args }) => {
          moduleContent[methodName](payload, ...args)
        })
      }
    })
  })

  /**
   * 2. 定义生成器函数 (返回代理对象)
   */
  const createPipelineEvent = (payload = {}) => {
    return new Proxy(modules, {
      get(target, fileName) {
        if (!(fileName in target)) {
          console.error(`[Mitt-Pipeline] 模块 ${fileName} 不存在 @ ${currentFilePath}`)
          return {}
        }

        return new Proxy(target[fileName], {
          get(subTarget, methodName) {
            // 检查方法是否存在
            if (typeof subTarget[methodName] !== 'function') return undefined

            // 3. 核心拦截：调用时不再直接执行函数，而是派发 Mitt 事件
            return (...args) => {
              const eventName = `${fileName}:${methodName}`
              emitter.emit(eventName, { payload, args })
            }
          },
        })
      },
    })
  }

  const all_pipeline_event = createPipelineEvent({})

  return {
    all_pipeline_event,
    createPipelineEvent,
    emitter, // 暴露原生 mitt 实例供外部高级监听
    currentFilePath,
  }
}
```

## 2. 业务模块编写 (`module/logger.js`)

参数结构保持不变：第一个参数永远是 `payload`。

```javascript
// module/logger.js
export const log_message = (payload, message) => {
  console.log(`[${payload.appId}] 收到日志事件:`, message)
}
```

## 3. 应用层调用

```javascript
import { usePipelineLoader } from './pipeline-mitt-engine'

// 扫描并初始化
const modulesRaw = import.meta.glob('./module/*.js', { eager: true })
const { all_pipeline_event, createPipelineEvent, emitter } = usePipelineLoader(
  modulesRaw,
  import.meta.url,
)

// 场景 A: 默认调用
// 触发事件 "logger:log_message" -> 执行 logger.js 里的 log_message({}, 'Hello')
all_pipeline_event.logger.log_message('Hello Default')

// 场景 B: 携带 Payload 调用
const adminEvent = createPipelineEvent({ appId: 'ADMIN_PLATFORM' })
// 触发事件 "logger:log_message" -> 执行 log_message({appId: '...'}, 'Hello')
adminEvent.logger.log_message('System Booted')

// 场景 C: 你甚至可以跨组件直接用原生 mitt 触发
emitter.emit('logger:log_message', {
  payload: { appId: 'EXTERNAL' },
  args: ['From raw emitter'],
})
```

## 💡 为什么这种方案很强大？

1. **解耦调用者与执行者**：调用 `all_pipeline_event.xxx` 的组件不需要真的加载业务代码，它只是发了一个指令。
2. **多处响应 (Pub/Sub)**：由于是基于 `mitt`，你可以有多个文件同时监听同一个 `fileName:methodName` 事件，实现“一处调用，多处响应”（例如：调用支付接口时，日志模块、埋点模块、通知模块可以同时监听并自动执行）。
3. **调试透明**：你可以全局拦截 `emitter.on('*')`，看到整个应用中所有管道事件的流转路径和 Payload 数据。

**下一步建议**：是否需要我演示如何在这种 Mitt 架构下加入 **事件劫持（Middleware）** 逻辑，在事件到达业务模块前进行拦截修改？
