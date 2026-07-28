---
title: 事件管道-MITT模式-异步链式调用
order: 104
---

# 事件管道-MITT模式-异步链式调用

要在 **Mitt（事件驱动）** 的架构下支持 **异步链式调用**，核心难点在于 `mitt` 本身是“触发即忘”的同步机制。要实现链式，我们需要将 `emit` 包装成 **Promise**，并让事件处理器返回结果。

我们可以通过在 `emit` 时传递一个**回调函数**或利用 **双向通信** 模式来实现。

## 1. 核心调度器实现 `pipeline-async-mitt.js`

```javascript
import { snakeCase } from 'change-case'
import mitt from 'mitt'

/**
 * 支持异步链式调用的 Mitt 管道调度器
 */
export const usePipelineLoader = (modulesRaw, currentFilePath) => {
  const emitter = mitt()
  const modules = {}

  // 1. 预处理模块并注册监听
  Object.keys(modulesRaw).forEach((path) => {
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')
    if (fileName.startsWith('_')) return

    const fileNameSnake = snakeCase(fileName)
    const moduleContent = modulesRaw[path].default || modulesRaw[path]
    modules[fileNameSnake] = moduleContent

    Object.keys(moduleContent).forEach((methodName) => {
      if (typeof moduleContent[methodName] === 'function') {
        const eventName = `${fileNameSnake}:${methodName}`

        // 关键：监听器改为 async，并接收 resolve 回调
        emitter.on(eventName, async ({ payload, lastResult, args, resolve }) => {
          // 执行业务函数：(payload, lastResult, ...args)
          const result = await moduleContent[methodName](payload, lastResult, ...args)
          // 将结果返回给调用者
          resolve(result)
        })
      }
    })
  })

  /**
   * 2. 定义支持链式的生成器
   * @param {Object} payload 初始负载
   * @param {any} lastResult 上一步的结果
   */
  const createPipelineEvent = (payload = {}, lastResult = null) => {
    return new Proxy(modules, {
      get(target, fileName) {
        if (!(fileName in target)) return {}

        return new Proxy(target[fileName], {
          get(subTarget, methodName) {
            if (typeof subTarget[methodName] !== 'function') return undefined

            // 3. 核心：返回一个 Promise 化的调用函数
            return (...args) => {
              return new Promise((resolve) => {
                const eventName = `${fileName}:${methodName}`

                // 触发事件，并传入 resolve 让处理器把结果传回来
                emitter.emit(eventName, {
                  payload,
                  lastResult,
                  args,
                  resolve,
                })
              }).then((result) => {
                // 4. 实现链式：.then 之后返回一个新的 Proxy 携带当前结果
                return {
                  result,
                  next: createPipelineEvent(payload, result),
                }
              })
            }
          },
        })
      },
    })
  }

  return {
    all_pipeline_event: createPipelineEvent({}),
    createPipelineEvent,
    emitter,
    currentFilePath,
  }
}
```

## 2. 业务模块示例 (`module/order_sys.js`)

参数签名：`(payload, lastResult, ...args)`

```javascript
// module/order_sys.js
export const create = async (payload, _, productName) => {
  console.log(`[${payload.user}] 创建订单:`, productName)
  return { orderId: 'SN-' + Math.random().toString(16).slice(2), productName }
}

export const pay = async (payload, lastResult, amount) => {
  console.log(`[${payload.user}] 支付订单:`, lastResult.orderId, '金额:', amount)
  return { ...lastResult, status: 'PAID', amount }
}
```

## 3. 链式调用演示

```javascript
import { usePipelineLoader } from './index.js'

const modulesRaw = import.meta.glob('./module/*.js', { eager: true })
const { createPipelineEvent } = usePipelineLoader(modulesRaw, import.meta.url)

const orderFlow = createPipelineEvent({ user: '张三' })

async function run() {
  // 链式调用核心写法：
  // await 第一次调用 -> 得到 { result, next }
  // 通过 .next 继续调用

  const step1 = await orderFlow.order_sys.create('MacBook Pro')

  const step2 = await step1.next.order_sys.pay(19999)

  console.log('流程结束，最终凭证:', step2.result)
}

run()
```

## 💡 核心原理解析

1. **Promise 桥接机制**：由于 `mitt` 的 `emit` 是单向的，我们在事件荷载（Event Payload）中注入了 `resolve` 函数。业务逻辑执行完后调用 `resolve(result)`，从而让调用方的 `Promise` 状态变为完成。
2. **Next 递归代理**：在 `Promise.then` 中，我们递归调用 `createPipelineEvent` 并传入当前的 `result`。这样下一步的调用就能通过 `lastResult` 拿到上一步的数据。
3. **解耦与追踪**：这种方式既保持了 **Mitt 事件驱动** 的解耦特性（可以有其他监听者悄悄监听 `order_sys:pay` 做埋点），又获得了 **链式编程** 的丝滑体验。
