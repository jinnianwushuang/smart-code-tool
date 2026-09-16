# 浏览器端纯 JS 调度典型拆解

> 本文档从 **Event Loop 执行机制** 出发，拆解浏览器端 JS 任务调度的核心原理，
> 涵盖大厂高频面试题、微任务/宏任务调度顺序、并发控制调度器等经典场景。

---

## 一、Event Loop 核心机制 — 宏任务与微任务

### 1.1 调度模型总览

```
┌──────────────────────────────────────────────────┐
│                   Event Loop                      │
│                                                    │
│  ① 执行当前宏任务（同步代码）                        │
│  ② 清空微任务队列（全部执行完）                       │
│  ③ 渲染页面（如有需要）                              │
│  ④ 取下一个宏任务                                    │
│  ⑤ 重复 ① → ④                                     │
└──────────────────────────────────────────────────┘

宏任务（Macrotask）          微任务（Microtask）
├── setTimeout                ├── Promise.then/catch/finally
├── setInterval               ├── MutationObserver
├── setImmediate (Node)       ├── queueMicrotask()
├── I/O                       └── process.nextTick (Node)
├── requestAnimationFrame
└── UI rendering
```

**核心规则：**

| 规则                 | 说明                                         |
| -------------------- | -------------------------------------------- |
| 微任务优先           | 每个宏任务执行完毕后，**必须**清空所有微任务 |
| 微任务中产生的微任务 | 同一轮内继续执行，不会推迟到下一轮           |
| 宏任务每次一个       | 每轮 Event Loop 只执行**一个**宏任务         |
| rAF 在渲染前         | `requestAnimationFrame` 在页面重绘之前执行   |

---

## 二、高频面试题 — 输出顺序预测

### 2.1 经典题一：Promise + setTimeout + 同步代码

```javascript
console.log('1 - 同步')

setTimeout(() => {
  console.log('2 - 宏任务')
}, 0)

Promise.resolve().then(() => {
  console.log('3 - 微任务')
})

console.log('4 - 同步')
```

**拆解执行过程：**

| 步骤 | 执行内容                                                  | 输出         |
| ---- | --------------------------------------------------------- | ------------ |
| ①    | 同步代码：`console.log('1')`                              | `1 - 同步`   |
| ②    | 遇到 `setTimeout`，回调注册为**宏任务**，放入宏任务队列   | —            |
| ③    | 遇到 `Promise.then`，回调注册为**微任务**，放入微任务队列 | —            |
| ④    | 同步代码：`console.log('4')`                              | `4 - 同步`   |
| ⑤    | 同步代码执行完，清空微任务队列 → 执行 `then` 回调         | `3 - 微任务` |
| ⑥    | 微任务清空完毕，取下一个宏任务 → 执行 `setTimeout` 回调   | `2 - 宏任务` |

**最终输出顺序：`1 → 4 → 3 → 2`**

### 2.2 经典题二：嵌套 Promise + 多个 setTimeout

```javascript
setTimeout(() => {
  console.log('A')
  Promise.resolve().then(() => {
    console.log('B')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('C')
  setTimeout(() => {
    console.log('D')
  }, 0)
})

console.log('E')
```

**拆解执行过程：**

| 轮次    | 阶段       | 执行内容                                                        | 输出 |
| ------- | ---------- | --------------------------------------------------------------- | ---- |
| 第 1 轮 | 同步代码   | `console.log('E')`                                              | `E`  |
|         | 微任务队列 | 执行 `then` → `console.log('C')`，注册 `setTimeout(D)` 为宏任务 | `C`  |
| 第 2 轮 | 宏任务     | 执行 `setTimeout` → `console.log('A')`，注册 `then(B)` 为微任务 | `A`  |
|         | 微任务队列 | 执行 `then` → `console.log('B')`                                | `B`  |
| 第 3 轮 | 宏任务     | 执行 `setTimeout(D)` → `console.log('D')`                       | `D`  |

**最终输出顺序：`E → C → A → B → D`**

### 2.3 经典题三：async/await + Promise + setTimeout

```javascript
async function async1() {
  console.log('A')
  await async2()
  console.log('B') // await 后面的代码 = then 的回调
}

async function async2() {
  console.log('C')
}

setTimeout(() => {
  console.log('D')
}, 0)

console.log('E')
async1()
console.log('F')
```

**关键转换**：`await async2()` 等价于 `async2().then(() => { ... })`，`then` 回调是微任务。

**拆解执行过程：**

| 步骤 | 执行内容                                               | 输出 |
| ---- | ------------------------------------------------------ | ---- |
| ①    | `setTimeout` 注册宏任务                                | —    |
| ②    | `console.log('E')`                                     | `E`  |
| ③    | `async1()` 执行：`console.log('A')`                    | `A`  |
| ④    | `await async2()` → 执行 `async2()`：`console.log('C')` | `C`  |
| ⑤    | `await` 将后续代码 `console.log('B')` 注册为微任务     | —    |
| ⑥    | `console.log('F')`                                     | `F`  |
| ⑦    | 同步代码完毕，清空微任务 → 执行 `console.log('B')`     | `B`  |
| ⑧    | 取下一个宏任务 → `console.log('D')`                    | `D`  |

**最终输出顺序：`E → A → C → F → B → D`**

---

## 三、requestAnimationFrame 调度 — 渲染前回调

### 3.1 执行时机对比

```javascript
setTimeout(() => console.log('setTimeout'), 0)
queueMicrotask(() => console.log('microtask'))
requestAnimationFrame(() => console.log('rAF'))

// 当前宏任务的同步代码执行完后：
// ① microtask     ← 微任务，最先执行
// ② rAF           ← 在页面重绘之前执行
// ③ setTimeout    ← 下一个宏任务，最后执行
```

**三种调度的精确时序：**

| 调度方式                | 执行时机                       | 典型用途                 |
| ----------------------- | ------------------------------ | ------------------------ |
| `queueMicrotask`        | 当前宏任务结束后立即           | 状态同步、响应式更新通知 |
| `requestAnimationFrame` | 页面重绘之前（约 16.6ms 一次） | 动画帧更新、DOM 测量     |
| `setTimeout(fn, 0)`     | 下一个宏任务（至少 4ms 延迟）  | 延迟执行、任务分片       |

### 3.2 动画调度实战

```javascript
function animate(element, from, to, duration) {
  const startTime = performance.now()

  function frame(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 缓动函数：easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3)
    const value = from + (to - from) * eased

    element.style.transform = `translateX(${value}px)`

    if (progress < 1) {
      requestAnimationFrame(frame) // 注册下一帧
    }
  }

  requestAnimationFrame(frame) // 启动动画
}
```

> **为什么用 `rAF` 而不是 `setTimeout`？**
>
> - `rAF` 与浏览器刷新率同步（通常 60Hz = 16.6ms），不会丢帧
> - 页面不可见时自动暂停，节省 CPU
> - `setTimeout` 频率不固定，可能导致动画卡顿

---

## 四、并发调度器 — 大厂高频手写题

> 字节 / 美团 / 快手 高频题：实现一个请求调度器，最多允许 N 个请求并发。

### 4.1 实现

```javascript
class Scheduler {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent
    this.running = 0 // 当前正在执行的任务数
    this.queue = [] // 等待队列
  }

  add(promiseCreator) {
    return new Promise((resolve, reject) => {
      this.queue.push({ promiseCreator, resolve, reject })
      this._check() // 每次添加任务时检查是否可以执行
    })
  }

  _check() {
    // 当有空位且队列中有等待任务时，取出执行
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const { promiseCreator, resolve, reject } = this.queue.shift()
      this.running++

      promiseCreator()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--
          this._check() // 任务完成后检查队列
        })
    }
  }
}
```

### 4.2 使用示例与执行过程

```javascript
const scheduler = new Scheduler(2) // 最多 2 个并发

const createTask = (name, delay) => () =>
  new Promise((resolve) => {
    console.log(`[${name}] 开始`)
    setTimeout(() => {
      console.log(`[${name}] 完成`)
      resolve(name)
    }, delay)
  })

scheduler.add(createTask('A', 1000))
scheduler.add(createTask('B', 500))
scheduler.add(createTask('C', 300))
scheduler.add(createTask('D', 200))
```

**拆解执行过程：**

| 时间   | 事件                        | 并发数 | 队列   |
| ------ | --------------------------- | ------ | ------ |
| 0ms    | A、B 开始执行（并发上限 2） | 2      | [C, D] |
| 500ms  | B 完成 → 从队列取 C 开始    | 2      | [D]    |
| 800ms  | C 完成 → 从队列取 D 开始    | 2      | []     |
| 1000ms | A 完成                      | 1      | []     |
| 1000ms | D 完成                      | 0      | []     |

**输出顺序：**

```
[A] 开始
[B] 开始
[B] 完成
[C] 开始
[C] 完成
[D] 开始
[A] 完成
[D] 完成
```

### 4.3 调度器核心设计拆解

| 设计点       | 实现方式                                | 原因                            |
| ------------ | --------------------------------------- | ------------------------------- |
| 并发控制     | `running` 计数器 + `maxConcurrent` 上限 | 限制同时执行的任务数            |
| 等待队列     | `queue` 数组，FIFO 顺序                 | 保证任务按添加顺序执行          |
| 自动调度     | 任务完成时 `finally` 中调用 `_check()`  | 无需手动触发，自动填充空位      |
| Promise 封装 | `add()` 返回 Promise                    | 调用方可以 `await` 等待任务完成 |

---

## 五、任务分片 — 大数据量渲染不卡顿

> 将大任务拆分为多个小片，利用 `setTimeout` 或 `requestIdleCallback` 在帧间执行。

### 5.1 setTimeout 分片

```javascript
function chunkTask(items, processItem, chunkSize = 50) {
  let index = 0

  function processChunk() {
    const end = Math.min(index + chunkSize, items.length)

    for (; index < end; index++) {
      processItem(items[index], index)
    }

    if (index < items.length) {
      setTimeout(processChunk, 0) // 让出主线程，下一片在下一个宏任务执行
    }
  }

  processChunk() // 第一片立即执行
}

// 渲染 10000 条数据，每片 50 条
chunkTask(
  Array.from({ length: 10000 }, (_, i) => i),
  (item, index) => {
    const div = document.createElement('div')
    div.textContent = `Item ${item}`
    container.appendChild(div)
  },
)
```

### 5.2 三种分片方案对比

| 方案            | API                     | 执行时机          | 适用场景              |
| --------------- | ----------------------- | ----------------- | --------------------- |
| setTimeout 分片 | `setTimeout(fn, 0)`     | 下一个宏任务      | 通用任务分片          |
| rAF 分片        | `requestAnimationFrame` | 重绘前（~16.6ms） | 与动画相关的 DOM 操作 |
| rIC 分片        | `requestIdleCallback`   | 浏览器空闲时      | 非紧急计算、日志上报  |

---

## 六、总结：浏览器端 JS 调度知识图谱

```
浏览器端 JS 调度
├── Event Loop 核心
│   ├── 宏任务：setTimeout / setInterval / I/O / rAF
│   ├── 微任务：Promise.then / queueMicrotask / MutationObserver
│   └── 执行顺序：同步 → 微任务 → 渲染 → 下一个宏任务
│
├── 调度 API
│   ├── queueMicrotask       → 状态同步、响应式通知
│   ├── requestAnimationFrame → 动画帧、DOM 测量
│   ├── setTimeout(fn, 0)    → 延迟执行、任务分片
│   └── requestIdleCallback  → 空闲时执行非紧急任务
│
├── 并发调度器
│   ├── 计数器 + 等待队列     → 控制最大并发数
│   └── Promise 封装          → 支持 await 等待
│
└── 任务分片
    ├── setTimeout 分片       → 通用方案
    ├── rAF 分片              → 动画相关
    └── rIC 分片              → 非紧急计算
```
