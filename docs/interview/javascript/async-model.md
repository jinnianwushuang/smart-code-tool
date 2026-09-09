---
title: '异步编程模型演进 [P6-P7]'
level: 'senior'
tags: ['JavaScript', '异步', 'Promise', 'Async Iterator']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# 异步编程模型演进 [P6-P7]

> 从回调地狱到 Async Iterator，JavaScript 异步编程经历了四次范式跃迁。理解每一步的动机和代价，才能在架构层面做出正确的异步设计决策。

## 核心概念（What）

### 异步演进时间线

```
1995  回调函数（Callback）
  ↓   问题：回调地狱、控制流困难
2009  Promise（CommonJS Promises/A）
  ↓   问题：链式冗长、无法取消
2015  async/await（ES2017）
  ↓   问题：串行执行、无流式处理
2018  Async Iterator + for await...of（ES2018）
  ↓   问题：错误处理复杂
2024  Promise.withResolvers / 结构化并发模式
```

---

## 底层原理（Why）

### 1. 回调模式（Callback）

```javascript
// 回调地狱：嵌套导致代码向右漂移
getUser(userId, (err, user) => {
  if (err) return handleError(err)
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err)
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return handleError(err)
      // 真正的业务逻辑在第四层嵌套里
      processDetails(details)
    })
  })
})
```

**核心问题**：

- 控制流不可组合（无法用 try/catch 统一处理）
- 回调可能执行 0 次、1 次或多次
- 没有标准化的错误传播约定

### 2. Promise 模式

#### Promise 的状态机

```
         resolve()
Pending ──────────→ Fulfilled
   │                    │
   │ resolve()          │ then()
   ├──────────────────→ │
   │                    │
   │ reject()           │ catch()
   └──────────→ Rejected
```

#### Promise 的微观本质

```javascript
// Promise 的本质是：将异步操作的结果"物化"为一个可组合的对象
// 它实现了 Continuation Passing Style (CPS) 的直接风格

// CPS 风格（回调）
function add(a, b, callback) {
  callback(a + b)
}
add(1, 2, (result) => console.log(result))

// 直接风格（Promise）
function add(a, b) {
  return Promise.resolve(a + b)
}
add(1, 2).then((result) => console.log(result))

// Promise 的关键设计：
// 1. then() 总是返回新的 Promise（可链式）
// 2. 回调异步执行（即使 Promise 已 fulfilled）
// 3. 错误自动向下传播（直到被 catch 捕获）
```

#### Promise 组合模式

```javascript
// Promise.all - 并行执行，全部成功
const [user, config] = await Promise.all([fetchUser(), fetchConfig()])

// Promise.allSettled - 并行执行，等待全部完成（不论成败）
const results = await Promise.allSettled([fetchUser(), fetchConfig()])
// [{ status: 'fulfilled', value: ... }, { status: 'rejected', reason: ... }]

// Promise.race - 竞速（第一个完成的决定结果）
const result = await Promise.race([
  fetchData(),
  timeout(5000), // 超时控制
])

// Promise.any - 第一个成功的（忽略失败）
const fastest = await Promise.any([fetchFromCDN1(), fetchFromCDN2(), fetchFromCDN3()])

// Promise.withResolvers（2024）- 外部控制 Promise
const { promise, resolve, reject } = Promise.withResolvers()
// 适用于需要将 resolve/reject 暴露到外部的场景
```

### 3. async/await 模式

#### 底层实现：Generator + 自动执行器

```javascript
// async/await 是 Generator + 自动执行器的语法糖

// Generator 版本
function* fetchUserData() {
  const user = yield getUser()
  const orders = yield getOrders(user.id)
  return orders
}

// async/await 版本（等价）
async function fetchUserData() {
  const user = await getUser()
  const orders = await getOrders(user.id)
  return orders
}

// 底层：async 函数编译为 Generator + 状态机
// Babel/SWC 会将 async/await 转换为类似 _asyncToGenerator 的调用
```

#### 结构化并发（2026 最佳实践）

```javascript
// 反模式：不必要的串行化
async function loadDashboard() {
  const user = await fetchUser() // 等待 200ms
  const config = await fetchConfig() // 等待 150ms
  const notifications = await fetchNotifications() // 等待 100ms
  // 总耗时：450ms
  return { user, config, notifications }
}

// 正确：独立任务并行化
async function loadDashboard() {
  const [user, config, notifications] = await Promise.all([
    fetchUser(), // ┐
    fetchConfig(), // ├── 并行，总耗时 200ms
    fetchNotifications(), // ┘
  ])
  return { user, config, notifications }
}

// 高级模式：有依赖关系的并发
async function loadDashboard() {
  // 第一步：并行获取用户和配置
  const [user, config] = await Promise.all([fetchUser(), fetchConfig()])

  // 第二步：依赖用户信息，并行获取通知和订单
  const [notifications, orders] = await Promise.all([
    fetchNotifications(user.id),
    fetchOrders(user.id),
  ])

  return { user, config, notifications, orders }
}
```

### 4. Async Iterator 与流式异步

```javascript
// Async Iterator 协议
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0
    return {
      async next() {
        if (i < 3) {
          return { value: await fetchData(i++), done: false }
        }
        return { done: true }
      },
    }
  },
}

// for await...of 消费
for await (const item of asyncIterable) {
  console.log(item)
}

// Async Generator（最常用的创建方式）
async function* fetchPages(url) {
  let page = 1
  while (true) {
    const response = await fetch(`${url}?page=${page}`)
    const data = await response.json()
    if (data.length === 0) return
    yield data
    page++
  }
}

// 消费分页数据
for await (const page of fetchPages('/api/users')) {
  for (const user of page) {
    processUser(user)
  }
}
```

#### Async Iterator 的实际应用

```javascript
// 1. 流式处理 SSE（Server-Sent Events）
async function* streamSSE(url) {
  const response = await fetch(url)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    const text = decoder.decode(value)
    // 解析 SSE 格式
    const events = text.split('\n\n').filter(Boolean)
    for (const event of events) {
      yield JSON.parse(event.replace('data: ', ''))
    }
  }
}

// 使用
for await (const event of streamSSE('/api/events')) {
  updateUI(event)
}

// 2. 异步管道组合
async function* pipe(source, ...transforms) {
  let stream = source
  for (const transform of transforms) {
    stream = transform(stream)
  }
  yield* stream
}
```

---

## 实战应用（How）

### 错误处理最佳实践

```javascript
// async/await 的错误处理策略

// 策略 1：try/catch（适合需要不同错误处理的场景）
async function loadUser() {
  try {
    const user = await fetchUser()
    return { data: user, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// 策略 2：包装函数（Go 风格，减少嵌套）
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])

async function loadUser() {
  const [err, user] = await to(fetchUser())
  if (err) return handleError(err)
  return user
}

// 策略 3：全局错误边界（适合统一处理）
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason)
  event.preventDefault() // 阻止控制台警告
})
```

### 超时控制

```javascript
// 使用 AbortController 实现超时
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

// 使用 Promise.race（更简洁但无法取消底层请求）
async function fetchWithTimeout(url, timeoutMs) {
  return Promise.race([
    fetch(url).then((r) => r.json()),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
  ])
}
```

---

## 高频面试题

### Q1: async/await 和 Promise 的关系是什么？

**参考答案要点**：

- async/await 是 Promise 的语法糖，不是新机制
- async 函数返回一个 Promise
- await 暂停 async 函数执行，等待 Promise resolve
- 底层实现：async 函数编译为状态机（类似 Generator + 自动执行器）
- 优势：同步代码风格、更好的错误处理（try/catch）、更清晰的调用栈

### Q2: Promise.all 和 Promise.allSettled 的区别？

**参考答案要点**：

- `Promise.all`：任一 Promise reject 就立即 reject（快速失败）
- `Promise.allSettled`：等待全部 Promise 完成（不论成败），返回每个的状态和结果
- 使用场景：all 适合"全部必须成功"的场景，allSettled 适合"需要知道每个结果"的场景

### Q3: 如何实现异步任务的并发控制？

**参考答案要点**：

- 使用 `Promise.all` 并行执行独立任务
- 使用信号量模式控制并发数（如 p-limit 库）
- 使用 Async Generator 实现流式处理
- 使用 `AbortController` 实现取消和超时

---

## 延伸思考

1. **设计题**：设计一个异步任务调度器，支持并发限制、优先级、超时和重试。
2. **场景题**：一个页面需要同时发起 20 个 API 请求，如何优化加载性能？
3. **对比题**：Async Iterator vs Observable（RxJS），各自的适用场景？

---

## 参考资料

- [MDN - async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [TC39 - Async Iteration Proposal](https://github.com/tc39/proposal-async-iteration)
- [Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
- [Patterns for async/await](https://www.javascripttutorial.net/es6/async-await/)
