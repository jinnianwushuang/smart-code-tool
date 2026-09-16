# Promise/A+ 手写实现典型拆解

> 本文档从 Promise/A+ 规范出发，逐步手写实现一个符合规范的 Promise，
> 拆解 then 链式调用、值穿透、微任务投递等核心机制。

---

## 一、Promise 核心三要素

```
Promise
├── 状态机：pending → fulfilled / rejected（不可逆）
├── then 方法：注册 onFulfilled / onRejected 回调
└── 微任务投递：回调异步执行（queueMicrotask / setTimeout）
```

| 要素           | 说明                                                       |
| -------------- | ---------------------------------------------------------- |
| **三种状态**   | `pending`（等待）、`fulfilled`（成功）、`rejected`（失败） |
| **状态不可逆** | pending → fulfilled 或 pending → rejected，之后状态冻结    |
| **then 异步**  | 即使 Promise 已 resolved，then 回调也必须异步执行          |

---

## 二、基础版 Promise — 状态机 + then

```javascript
class MyPromise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  constructor(executor) {
    this.status = MyPromise.PENDING
    this.value = undefined // 成功的值
    this.reason = undefined // 失败的原因

    const resolve = (value) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULFILLED
        this.value = value
      }
    }

    const reject = (reason) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.REJECTED
        this.reason = reason
      }
    }

    // executor 执行出错，直接 reject
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    // 参数穿透：不传则使用默认回调
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (e) => {
            throw e
          }

    if (this.status === MyPromise.FULFILLED) {
      onFulfilled(this.value)
    } else if (this.status === MyPromise.REJECTED) {
      onRejected(this.reason)
    }
  }
}
```

**拆解要点：**

| 设计点            | 实现                           | 原因                                                 |
| ----------------- | ------------------------------ | ---------------------------------------------------- |
| 状态守卫          | `if (this.status === PENDING)` | 保证状态只能从 pending 变更一次                      |
| executor 异常捕获 | `try/catch` 包裹 `executor()`  | `new Promise((res, rej) => { throw err })` 应 reject |
| 参数穿透          | 默认 `onFulfilled = v => v`    | `promise.then(null, onRejected)` 值应向下传递        |

---

## 三、异步版 — 支持 pending 状态下的 then 注册

```javascript
then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v
  onRejected = typeof onRejected === 'function' ? onRejected : (e) => { throw e }

  if (this.status === MyPromise.FULFILLED) {
    queueMicrotask(() => onFulfilled(this.value))
  } else if (this.status === MyPromise.REJECTED) {
    queueMicrotask(() => onRejected(this.reason))
  } else {
    // pending 状态：先存起来，等 resolve/reject 时再执行
    this._onFulfilledCallbacks.push(() => onFulfilled(this.value))
    this._onRejectedCallbacks.push(() => onRejected(this.reason))
  }
}
```

需要在 constructor 中初始化回调队列：

```javascript
constructor(executor) {
  // ...
  this._onFulfilledCallbacks = []
  this._onRejectedCallbacks = []

  const resolve = (value) => {
    if (this.status === MyPromise.PENDING) {
      this.status = MyPromise.FULFILLED
      this.value = value
      // 异步执行所有 then 回调
      this._onFulfilledCallbacks.forEach((fn) => queueMicrotask(fn))
    }
  }

  const reject = (reason) => {
    if (this.status === MyPromise.PENDING) {
      this.status = MyPromise.REJECTED
      this.reason = reason
      this._onRejectedCallbacks.forEach((fn) => queueMicrotask(fn))
    }
  }
  // ...
}
```

**执行时序拆解：**

| 步骤 | 事件                            | 说明                                                 |
| ---- | ------------------------------- | ---------------------------------------------------- |
| ①    | `new Promise(executor)`         | executor 同步执行，遇到异步操作 → 保持 pending       |
| ②    | `.then(onFulfilled)`            | status 为 pending → 回调存入 `_onFulfilledCallbacks` |
| ③    | 异步操作完成 → `resolve(value)` | 状态变为 fulfilled → 遍历执行所有存储的回调          |
| ④    | `queueMicrotask(fn)`            | 回调通过微任务异步执行                               |

---

## 四、链式调用 — then 返回新 Promise

> Promise/A+ 规范核心要求：`then` 必须返回一个新的 Promise。

```javascript
then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v
  onRejected = typeof onRejected === 'function' ? onRejected : (e) => { throw e }

  const promise2 = new MyPromise((resolve, reject) => {
    const handleFulfilled = () => {
      try {
        const x = onFulfilled(this.value)
        resolvePromise(promise2, x, resolve, reject)
      } catch (err) {
        reject(err)
      }
    }

    const handleRejected = () => {
      try {
        const x = onRejected(this.reason)
        resolvePromise(promise2, x, resolve, reject)
      } catch (err) {
        reject(err)
      }
    }

    if (this.status === MyPromise.FULFILLED) {
      queueMicrotask(handleFulfilled)
    } else if (this.status === MyPromise.REJECTED) {
      queueMicrotask(handleRejected)
    } else {
      this._onFulfilledCallbacks.push(() => queueMicrotask(handleFulfilled))
      this._onRejectedCallbacks.push(() => queueMicrotask(handleRejected))
    }
  })

  return promise2
}
```

### 核心：resolvePromise 递归解析

```javascript
function resolvePromise(promise2, x, resolve, reject) {
  // 不能返回自身，否则死循环
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'))
  }

  // 如果 x 是 MyPromise 实例，等它 resolved
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
    return
  }

  // 如果 x 是 thenable（有 then 方法的对象）
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false // 防止多次调用
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            // 递归解析（y 可能还是 Promise）
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          },
        )
      } else {
        resolve(x) // 普通对象，直接 resolve
      }
    } catch (err) {
      if (called) return
      reject(err)
    }
  } else {
    resolve(x) // 普通值，直接 resolve
  }
}
```

**链式调用拆解：**

| 步骤 | 代码                          | 执行过程                                                  |
| ---- | ----------------------------- | --------------------------------------------------------- |
| ①    | `promise.then(fn1)`           | 返回 `promise2`，`fn1` 的返回值 `x` 传入 `resolvePromise` |
| ②    | `resolvePromise(promise2, x)` | 若 `x` 是 Promise → 等它 resolved 再 resolve `promise2`   |
| ③    | `promise2.then(fn2)`          | `fn2` 收到的是 `fn1` 异步解析后的最终值                   |

> **核心价值**：`resolvePromise` 递归展开所有 Promise 嵌套层，让链式调用中的每个 `then` 都能拿到上一层的最终值。

---

## 五、静态方法 — all / race / allSettled / any

### 5.1 Promise.all

```javascript
static all(promises) {
  return new MyPromise((resolve, reject) => {
    const results = []
    let count = 0

    if (promises.length === 0) return resolve([])

    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(
        (value) => {
          results[i] = value // 注意：按原始顺序存放
          if (++count === promises.length) resolve(results)
        },
        reject, // 任一 rejected → 整体 rejected
      )
    })
  })
}
```

### 5.2 Promise.race

```javascript
static race(promises) {
  return new MyPromise((resolve, reject) => {
    for (const p of promises) {
      MyPromise.resolve(p).then(resolve, reject) // 第一个 settled 的决定结果
    }
  })
}
```

### 5.3 Promise.allSettled

```javascript
static allSettled(promises) {
  return new MyPromise((resolve) => {
    const results = []
    let count = 0

    if (promises.length === 0) return resolve([])

    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(
        (value) => {
          results[i] = { status: 'fulfilled', value }
          if (++count === promises.length) resolve(results)
        },
        (reason) => {
          results[i] = { status: 'rejected', reason }
          if (++count === promises.length) resolve(results) // 永远 resolve
        },
      )
    })
  })
}
```

**四个静态方法对比：**

| 方法         | 成功条件       | 失败条件      | 返回值                        |
| ------------ | -------------- | ------------- | ----------------------------- |
| `all`        | 全部 fulfilled | 任一 rejected | 所有值的数组                  |
| `race`       | —              | —             | 第一个 settled 的值           |
| `allSettled` | 全部 settled   | 不会失败      | `{status, value/reason}` 数组 |
| `any`        | 任一 fulfilled | 全部 rejected | 第一个 fulfilled 的值         |

---

## 六、总结：Promise 知识图谱

```
Promise/A+
├── 状态机
│   ├── pending → fulfilled / rejected（不可逆）
│   └── executor 异常自动 reject
│
├── then 方法
│   ├── 参数穿透（默认回调）
│   ├── pending 状态回调存储
│   ├── 微任务投递（queueMicrotask）
│   └── 返回新 Promise（链式调用）
│
├── resolvePromise
│   ├── 自身引用检测（防循环）
│   ├── Promise 实例递归展开
│   ├── thenable 对象适配
│   └── called 守卫（防多次调用）
│
└── 静态方法
    ├── all      → 全部成功才成功
    ├── race     → 第一个决定结果
    ├── allSettled → 全部 settled，永不失败
    └── any      → 一个成功即成功
```
