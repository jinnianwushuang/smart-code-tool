# Node.js 服务端事件调度典型拆解

> 本文档从**手写 EventEmitter** 出发，逐步拆解 Node.js 事件调度的核心机制，
> 涵盖大厂高频面试题、中间件管道模式、流式管线等经典场景。

---

## 一、手写 EventEmitter — 事件系统底层原理

### 1.1 基础版实现

```javascript
class EventEmitter {
  constructor() {
    this._events = Object.create(null) // 事件存储，用 null 原型避免原型链污染
  }

  // 注册监听器
  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = []
    }
    this._events[event].push(listener)
    return this // 支持链式调用
  }

  // 触发事件
  emit(event, ...args) {
    const listeners = this._events[event]
    if (!listeners || listeners.length === 0) return false

    // 拷贝一份再遍历，防止回调中 remove 导致索引错乱
    const copy = listeners.slice()
    for (const listener of copy) {
      listener.apply(this, args)
    }
    return true
  }

  // 移除监听器
  off(event, listener) {
    const listeners = this._events[event]
    if (!listeners) return this

    this._events[event] = listeners.filter((fn) => fn !== listener)
    return this
  }

  // 只执行一次的监听器
  once(event, listener) {
    const wrapper = (...args) => {
      listener.apply(this, args)
      this.off(event, wrapper) // 执行后自动移除
    }
    wrapper._original = listener // 保留原始引用，方便 off 移除
    this.on(event, wrapper)
    return this
  }
}
```

**核心设计拆解：**

| 设计点      | 实现方式                       | 原因                                    |
| ----------- | ------------------------------ | --------------------------------------- |
| 事件存储    | `Object.create(null)`          | 无原型对象，避免 `toString` 等键冲突    |
| 安全遍历    | `listeners.slice()` 拷贝后遍历 | 防止回调中 `off` 导致遍历索引错乱       |
| `once` 实现 | 包装函数 + 执行后自动 `off`    | 用 `_original` 保留原始引用             |
| 链式调用    | 每个方法 `return this`         | 支持 `emitter.on('a', fn).on('b', fn2)` |

### 1.2 进阶版 — 异步事件 + 错误处理 + 最大监听数

```javascript
class AdvancedEmitter extends EventEmitter {
  constructor() {
    super()
    this._maxListeners = 10 // 默认最大监听数，防止内存泄漏
  }

  on(event, listener) {
    super.on(event, listener)
    const count = this._events[event]?.length || 0
    if (count > this._maxListeners) {
      console.warn(`⚠️ 事件 "${event}" 已有 ${count} 个监听器，可能存在内存泄漏`)
    }
    return this
  }

  // 异步触发：等待所有异步监听器完成
  async emitAsync(event, ...args) {
    const listeners = this._events[event]
    if (!listeners || listeners.length === 0) return []

    const copy = listeners.slice()
    const results = await Promise.all(copy.map((listener) => listener.apply(this, args)))
    return results
  }

  // 安全触发：单个监听器报错不影响其他
  emitSafe(event, ...args) {
    const listeners = this._events[event]
    if (!listeners) return false

    const copy = listeners.slice()
    for (const listener of copy) {
      try {
        listener.apply(this, args)
      } catch (err) {
        // 触发 error 事件，而不是让异常逃逸
        this.emit('error', err, event)
      }
    }
    return true
  }
}
```

**进阶特性拆解：**

| 特性        | 实现原理                         | 应用场景                             |
| ----------- | -------------------------------- | ------------------------------------ |
| 最大监听数  | `on` 时计数检查，超限 `warn`     | Node.js 原生 EventEmitter 也有此机制 |
| `emitAsync` | `Promise.all` 并行执行所有监听器 | 需要等待所有异步回调完成的场景       |
| `emitSafe`  | `try/catch` 包裹每个监听器       | 插件系统，单个插件崩溃不影响全局     |

---

## 二、高频面试题：实现带通配符的 EventEmitter

> 字节跳动 / 美团 / 阿里 近年常考：实现一个 EventEmitter，支持 `*` 通配符监听。

```javascript
class WildcardEmitter extends EventEmitter {
  on(event, listener) {
    if (event === '*') {
      // 通配符监听器单独存储
      if (!this._wildcardListeners) {
        this._wildcardListeners = []
      }
      this._wildcardListeners.push(listener)
    } else {
      super.on(event, listener)
    }
    return this
  }

  emit(event, ...args) {
    // 1. 触发精确匹配的监听器
    super.emit(event, ...args)

    // 2. 触发通配符监听器，额外传入事件名
    if (this._wildcardListeners) {
      const copy = this._wildcardListeners.slice()
      for (const listener of copy) {
        listener.call(this, event, ...args)
      }
    }
    return true
  }
}

// 使用示例
const emitter = new WildcardEmitter()

emitter.on('data', (msg) => console.log(`收到数据: ${msg}`))
emitter.on('*', (event, ...args) => {
  console.log(`[日志] 事件 "${event}" 被触发，参数:`, args)
})

emitter.emit('data', 'hello')
// 输出:
// 收到数据: hello
// [日志] 事件 "data" 被触发，参数: [ 'hello' ]
```

**通配符机制拆解：**

| 步骤                      | 执行过程                              | 结果                    |
| ------------------------- | ------------------------------------- | ----------------------- |
| ① `emit('data', 'hello')` | 先触发 `data` 的精确监听器            | `收到数据: hello`       |
| ②                         | 再触发 `*` 通配符监听器，首参为事件名 | `[日志] 事件 "data"...` |

> **设计要点**：通配符监听器与精确监听器分开存储，`emit` 时先精确后通配，保证执行顺序可预测。

---

## 三、中间件管道模型 — Koa 洋葱圈原理

> Node.js 服务端最经典的调度模式，面试必考。

### 3.1 核心实现

```javascript
function compose(middlewares) {
  return function (ctx) {
    function dispatch(i) {
      if (i >= middlewares.length) return Promise.resolve()

      const middleware = middlewares[i]
      return Promise.resolve(
        middleware(ctx, () => dispatch(i + 1)),
        //                    ↑ next() = 调用下一个中间件
      )
    }
    return dispatch(0)
  }
}
```

### 3.2 使用示例与执行流程

```javascript
const middlewares = [
  async (ctx, next) => {
    console.log('1 → 进入')
    await next()
    console.log('1 ← 回来')
  },
  async (ctx, next) => {
    console.log('2 → 进入')
    await next()
    console.log('2 ← 回来')
  },
  async (ctx, next) => {
    console.log('3 → 进入（最内层）')
    // 不调用 next()，管道到此折返
  },
]

const run = compose(middlewares)
run({})
```

**输出顺序：**

```
1 → 进入
2 → 进入
3 → 进入（最内层）
2 ← 回来
1 ← 回来
```

### 3.3 洋葱模型拆解

```
请求进入 →
  ┌─────────────────────────────┐
  │  中间件 1 前置逻辑            │  ↓ 进入
  │  ┌───────────────────────┐  │
  │  │  中间件 2 前置逻辑      │  │  ↓ 进入
  │  │  ┌─────────────────┐  │  │
  │  │  │  中间件 3 执行    │  │  │  ↓ 到达最内层
  │  │  └─────────────────┘  │  │
  │  │  中间件 2 后置逻辑      │  │  ↑ 折返
  │  └───────────────────────┘  │
  │  中间件 1 后置逻辑            │  ↑ 折返
  └─────────────────────────────┘
← 响应返回
```

| 阶段         | 执行内容                             | 类比                         |
| ------------ | ------------------------------------ | ---------------------------- |
| **进入阶段** | 每个中间件 `await next()` 之前的代码 | 请求拦截、鉴权、日志         |
| **最内层**   | 最后一个中间件不调用 `next()`        | 核心业务逻辑                 |
| **折返阶段** | 每个中间件 `await next()` 之后的代码 | 响应处理、错误捕获、耗时统计 |

### 3.4 实际应用：请求耗时统计

```javascript
const timerMiddleware = async (ctx, next) => {
  const start = performance.now()
  await next() // 执行后续所有中间件
  const ms = (performance.now() - start).toFixed(2)
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
}

const authMiddleware = async (ctx, next) => {
  if (!ctx.headers.authorization) {
    throw new Error('Unauthorized')
  }
  await next()
}

// 组合：timer 包裹 auth，精确统计含鉴权在内的完整耗时
const run = compose([timerMiddleware, authMiddleware, handlerMiddleware])
```

---

## 四、流式管线调度 — 可读/可写/转换流组合

> Node.js Stream 是事件驱动的极致应用，`pipe` 本质是事件调度。

### 4.1 pipe 底层原理拆解

```javascript
// ReadableStream.prototype.pipe 的简化实现
function pipe(readable, writable) {
  readable.on('data', (chunk) => {
    // 背压控制：如果写入缓冲区满，暂停读取
    const canContinue = writable.write(chunk)
    if (!canContinue) {
      readable.pause() // 暂停 'data' 事件
      writable.once('drain', () => {
        readable.resume() // 缓冲区排空后恢复读取
      })
    }
  })

  readable.on('end', () => {
    writable.end() // 数据读完，关闭写入流
  })

  readable.on('error', (err) => {
    writable.destroy(err) // 读取出错，销毁写入流
  })
}
```

**背压（Backpressure）机制拆解：**

| 步骤 | 事件                            | 动作                                |
| ---- | ------------------------------- | ----------------------------------- |
| ①    | `readable` 触发 `data`          | 向 `writable` 写入数据块            |
| ②    | `writable.write()` 返回 `false` | 缓冲区已满，调用 `readable.pause()` |
| ③    | `writable` 缓冲区排空           | 触发 `drain` 事件                   |
| ④    | 监听 `drain`                    | 调用 `readable.resume()` 恢复读取   |

> **核心思想**：通过事件（`data` / `drain`）协调读写速度，防止快速生产者淹没慢速消费者。

### 4.2 Pipeline 安全组合

```javascript
const { pipeline } = require('node:stream/promises')

// Node.js 推荐的流组合方式，自动处理错误传播和流销毁
async function processFile() {
  await pipeline(
    fs.createReadStream('input.csv'),
    csvParser(), // 转换流：CSV → JSON
    transformStream(), // 转换流：数据清洗
    fs.createWriteStream('output.json'),
  )
  console.log('处理完成')
}
```

`pipeline` vs `pipe` 的区别：

| 对比项   | `pipe`                     | `pipeline`               |
| -------- | -------------------------- | ------------------------ |
| 错误处理 | 需手动监听每个流的 `error` | 自动传播错误并销毁所有流 |
| 内存泄漏 | 出错时可能不销毁中间流     | 保证所有流都被正确清理   |
| 异步等待 | 需手动包装 Promise         | 原生返回 Promise         |

---

## 五、总结：Node.js 事件调度知识图谱

```
事件调度
├── EventEmitter 核心
│   ├── on / emit / off / once     → 基础事件注册与触发
│   ├── emitAsync                  → 异步并行触发
│   ├── emitSafe                   → 安全触发（错误隔离）
│   └── 通配符 *                   → 全局事件监听
│
├── 中间件管道（Koa 模型）
│   ├── compose()                  → 递归组合中间件
│   ├── 洋葱模型                   → 前置逻辑 → 最内层 → 后置折返
│   └── 实际应用                   → 鉴权 / 日志 / 耗时统计
│
└── 流式管线（Stream）
    ├── pipe()                     → 事件驱动的读写协调
    ├── 背压控制                   → pause / resume / drain
    └── pipeline()                 → 安全组合 + 错误传播 + 自动清理
```
