---
title: 事件管道-代理模式-异步链式调用
order: 102
---

# 事件管道-代理模式-异步链式调用

要实现**异步链式调用**，核心在于让 Proxy 返回的不再是简单的函数执行结果，而是一个**可等待且可继续链接的对象**。

由于 `all_pipeline_event.file.method()` 已经占用了第一个调用位，我们可以通过在返回结果中继续挂载 Proxy，或者利用 **Promise 的 `.then` 链** 来实现。

这里采用一种更优雅的方案：**自动追踪执行结果并将结果注入下一个链条的 Payload 中**。

## 1. 增强版调度器 `pipeline-engine.js`

```javascript
import { snakeCase } from 'change-case'

export const usePipelineLoader = (modulesRaw, currentFilePath) => {
  const modules = {}

  // 1. 预处理模块
  Object.keys(modulesRaw).forEach((path) => {
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')
    if (!fileName.startsWith('_')) {
      const key = snakeCase(fileName)
      modules[key] = modulesRaw[path].default || modulesRaw[path]
    }
  })

  /**
   * 核心：创建支持异步链式调用的代理
   * @param {Object} payload 初始负载
   * @param {Object} lastResult 上一个环节的执行结果
   */
  const createPipelineEvent = (payload = {}, lastResult = null) => {
    return new Proxy(modules, {
      get(target, fileName) {
        if (!(fileName in target)) {
          console.error(`[Pipeline] 模块 ${fileName} 不存在 @ ${currentFilePath}`)
          return {}
        }

        const moduleContent = target[fileName]

        return new Proxy(moduleContent, {
          get(subTarget, methodName) {
            const originMethod = subTarget[methodName]

            if (typeof originMethod === 'function') {
              // 返回一个带链式能力的异步函数
              return async (...args) => {
                // 1. 执行当前函数 (注入 payload 和 上一次的结果)
                // 约定：函数签名 (payload, lastResult, ...args)
                const result = await originMethod(payload, lastResult, ...args)

                // 2. 返回一个“链式代理”
                // 允许通过 .next.file_name.method_name 继续调用
                return {
                  result, // 当前步骤的结果
                  next: createPipelineEvent(payload, result), // 携带结果进入下一环
                }
              }
            }
            return originMethod
          },
        })
      },
    })
  }

  const all_pipeline_event = createPipelineEvent({})

  return {
    all_pipeline_event,
    createPipelineEvent,
    currentFilePath,
  }
}
```

## 2. 业务模块编写逻辑 (`module/order_flow.js`)

在异步链式模式下，我们约定每个函数的参数为：`(payload, lastResult, ...args)`。

```javascript
// module/order_flow.js
export const create_order = async (payload, _, orderId) => {
  console.log('步骤 1: 创建订单', orderId)
  return { id: orderId, status: 'created' } // 返回给下一步
}

export const pay_order = async (payload, lastResult, amount) => {
  console.log('步骤 2: 支付订单', lastResult.id, '金额:', amount)
  return { ...lastResult, paid: true, amount }
}

export const send_notification = async (payload, lastResult) => {
  console.log('步骤 3: 发送通知给用户', payload.userId)
  return `Finished order ${lastResult.id}`
}
```

## 3. 异步链式调用示例

```javascript
import { createPipelineEvent } from './events/index.js'

const flow = createPipelineEvent({ userId: 'USR_999' })

// 运行异步链条
const runFlow = async () => {
  const step1 = await flow.order_flow.create_order('ORD_001')

  // step1.result 是创建的结果
  // step1.next 是新的代理，自动把 step1.result 传给 pay_order 的第二个参数
  const step2 = await step1.next.order_flow.pay_order(199)

  const step3 = await step2.next.order_flow.send_notification()

  console.log('最终状态:', step3.result)
}

runFlow()
```

## 💡 设计原理解析

1. **结果传递 (Waterfall 模式)**：每个 `async` 执行后返回一个包含 `next` 的对象。`next` 是一个新的 Proxy 实例，它闭包引用了上一个函数的返回值 `result`。
2. **Payload 贯穿**：`payload`（如用户信息、配置）在整个链条中保持不变，而 `lastResult` 随每一步更新。
3. **解耦调用**：你可以随时中断链条获取中间结果，也可以无限 `.next` 下去，非常适合处理**审批流、订单状态机**或**复杂的表单分步提交**。
