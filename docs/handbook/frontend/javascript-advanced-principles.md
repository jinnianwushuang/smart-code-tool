# JavaScript 高阶与实验性 API 底层原理

> **版本**: 1.0  
> **最后更新**: 2026-07-22  
> **适用对象**: 高级前端工程师、想深入理解 JS 本质的开发者

---

## 📑 目录

- [一、语法糖本质拆解](#一语法糖本质拆解)
- [二、高阶 API 深度解析](#二高阶-api-深度解析)
- [三、实验性 API（TC39 提案）](#三实验性-apitc39-提案)

---

## 一、语法糖本质拆解

> 语法糖（Syntactic Sugar）不引入新能力，只改变书写方式。拆解语法糖 = 理解引擎实际执行了什么。

### 1.1 class → 原型链 + 构造函数

**糖的写法：**

```javascript
class Animal {
  #name // 私有字段
  static count = 0

  constructor(name) {
    this.#name = name
    Animal.count++
  }

  speak() {
    return `${this.#name} makes a sound`
  }

  get name() {
    return this.#name
  }

  static create(name) {
    return new Animal(name)
  }
}

class Dog extends Animal {
  speak() {
    return super.speak() + ' woof!'
  }
}
```

**本质还原（ES5 等价物）：**

```javascript
// class 声明 ≈ 函数声明 + 原型方法挂载
function Animal(name) {
  // constructor 就是函数体本身
  if (!(this instanceof Animal)) {
    throw new TypeError("Class constructor cannot be invoked without 'new'")
  }
  // 私有字段 → WeakMap 模拟（引擎内部用隐藏槽 [[PrivateFields]]）
  _name.set(this, name)
  Animal.count++
}

var _name = new WeakMap()

// 方法挂载到 prototype，且不可枚举（区别于 ES5 手动赋值）
Object.defineProperty(Animal.prototype, 'speak', {
  value: function () {
    return _name.get(this) + ' makes a sound'
  },
  writable: true,
  configurable: true,
  enumerable: false, // 关键区别：class 方法默认不可枚举
})

// getter → 定义在原型上的访问器属性
Object.defineProperty(Animal.prototype, 'name', {
  get: function () {
    return _name.get(this)
  },
  enumerable: false,
  configurable: true,
})

// static → 直接挂在构造函数对象上
Animal.count = 0
Animal.create = function (name) {
  return new Animal(name)
}

// extends 本质 → 原型链双层继承
function Dog(name) {
  Animal.call(this, name) // super() ≈ 父类构造函数 call
}

// 子类原型继承父类原型（通过 Object.create，而非直接赋值）
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog

// super.speak() ≈ 沿原型链查找父类方法并调用
Dog.prototype.speak = function () {
  return Animal.prototype.speak.call(this) + ' woof!'
}

// 静态继承：Dog.__proto__ === Animal（ES5 无法实现，ES6 通过设置构造函数的 [[Prototype]]）
Object.setPrototypeOf(Dog, Animal)
```

**关键差异总结：**

| 特性 | class | ES5 等价物 |
|------|-------|-----------|
| 必须 new 调用 | ✅ 内部检查 | ❌ 需手动判断 |
| 方法不可枚举 | ✅ 默认 | ❌ 需 defineProperty |
| 类体提升 | ❌ 不存在提升（TDZ） | 函数声明有提升 |
| 私有字段 | ✅ #语法 | ❌ WeakMap 模拟 |
| 静态继承 | ✅ 自动 | ❌ 需 setPrototypeOf |

### 1.2 async/await → Generator + Promise + 自动执行器

**糖的写法：**

```javascript
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`)
  const user = await res.json()
  return user
}
```

**本质还原：**

```javascript
// async 函数 ≈ 返回 Promise 的 Generator 自动执行器
function fetchUser(id) {
  // async 函数体被编译为状态机
  return spawn(function* () {
    const res = yield fetch(`/api/users/${id}`)
    const user = yield res.json()
    return user
  })
}

// spawn = 自动执行器（这就是 co 库的核心原理）
function spawn(genFn) {
  return new Promise((resolve, reject) => {
    const gen = genFn()

    function step(nextFn) {
      let result
      try {
        result = nextFn()
      } catch (e) {
        return reject(e) // await 处抛错 → Promise reject
      }
      if (result.done) {
        return resolve(result.value) // return 值 → resolve 值
      }
      // yield 的值被 Promise.resolve 包装（所以 await 非 Promise 值也能工作）
      Promise.resolve(result.value).then(
        (value) => step(() => gen.next(value)), // 成功 → 恢复执行
        (err) => step(() => gen.throw(err)) // 失败 → 在 await 处抛出
      )
    }

    step(() => gen.next(undefined))
  })
}
```

**await 的精确语义拆解：**

```javascript
// await expr 实际执行了 3 步：
// 1. Promise.resolve(expr) → 包装为 thenable
// 2. 暂停当前 async 函数（保存执行上下文到堆）
// 3. 微任务队列中恢复执行

// 证据：await 会多一轮微任务
async function demo() {
  console.log(1)
  await null // 即使 await 非 Promise，也会让出执行权
  console.log(3)
}
demo()
console.log(2)
// 输出: 1, 2, 3

// 错误处理本质：try/catch 包裹的是 gen.throw()
async function risky() {
  try {
    await Promise.reject(new Error('boom'))
  } catch (e) {
    // 等价于 Promise.reject(...).then(null, e => {...})
    console.log(e.message)
  }
}
```

### 1.3 解构赋值 → 属性访问 + 临时变量

**糖的写法：**

```javascript
const { a, b: renamed, c = 'default', ...rest } = obj
const [first, , third, ...others] = arr
function greet({ name, age = 18 } = {}) {}
```

**本质还原：**

```javascript
// 对象解构 → 逐个属性访问
const _temp = obj
const a = _temp.a
const renamed = _temp.b
const c = _temp.c === undefined ? 'default' : _temp.c // 默认值仅在 undefined 时生效

// 剩余属性 → 排除法浅拷贝
const rest = {}
for (const key of Object.keys(_temp)) {
  if (key !== 'a' && key !== 'b' && key !== 'c') {
    rest[key] = _temp[key]
  }
}

// 数组解构 → 迭代器协议！不是索引访问
const _iter = arr[Symbol.iterator]()
const first = _iter.next().value
_iter.next() // 空位：调用 next() 但丢弃值
const third = _iter.next().value
const others = []
let _step
while (!(_step = _iter.next()).done) {
  others.push(_step.value)
}

// 参数解构 → 对 arguments[0] 执行解构 + 默认参数处理
function greet(_param) {
  const _arg = _param === undefined ? {} : _param
  const name = _arg.name
  const age = _arg.age === undefined ? 18 : _arg.age
}
```

**本质洞察：**

```javascript
// 数组解构走迭代器协议的证据：
const fakeArray = {
  *[Symbol.iterator]() {
    yield 'a'
    yield 'b'
    yield 'c'
  },
}
const [x, y, z] = fakeArray // 正常工作！不需要 length 和索引

// 对象解构走 [[Get]] 的证据：可以用 getter 拦截
const trapped = {
  get a() {
    console.log('a 被访问了')
    return 1
  },
}
const { a: val } = trapped // 打印: "a 被访问了"
```

### 1.4 展开运算符 → 迭代协议 / 浅拷贝

**糖的写法：**

```javascript
const merged = { ...defaults, ...overrides }
const combined = [...arr1, ...arr2]
fn(...args)
```

**本质还原：**

```javascript
// 对象展开 → Object.assign 语义（浅拷贝 + 自有可枚举属性）
const merged = Object.assign({}, defaults, overrides)
// 注意：只拷贝自有可枚举属性，getter 会被求值后拷贝值

// 数组展开 → for...of 逐个 push（走迭代器协议）
const combined = []
for (const item of arr1) combined.push(item)
for (const item of arr2) combined.push(item)

// 展开字符串的证据（按 Unicode 码点迭代，而非索引）
const emoji = '👨‍👩‍👧'
console.log([...emoji].length) // 3（码点数量）
console.log(emoji.length) // 8（UTF-16 编码单元数）

// 函数调用展开 → apply 语义
fn(...args) // ≈ fn.apply(undefined, args)
// 但区别：展开走迭代器协议，apply 要求类数组
fn(...new Set([1, 2, 3])) // Set 可以直接展开，apply 不行

// 构造函数展开
new Date(...[2026, 0, 1]) // ≈ Reflect.construct(Date, [2026, 0, 1])
```

### 1.5 可选链与空值合并 → 短路条件判断

**糖的写法：**

```javascript
const city = user?.address?.city
const name = user.name ?? 'Anonymous'
user.greet?.()
arr?.[index]
```

**本质还原：**

```javascript
// ?. → 逐级 null/undefined 检查 + 短路
const city =
  user === null || user === undefined
    ? undefined
    : user.address === null || user.address === undefined
      ? undefined
      : user.address.city

// ?? → 严格 null/undefined 检查（区别于 || 的 falsy 检查）
const name = user.name !== null && user.name !== undefined ? user.name : 'Anonymous'
// 对比 ||：0 || 'x' → 'x'，但 0 ?? 'x' → 0

// ?.() 方法调用 → 先检查是否为 null/undefined
if (user.greet !== null && user.greet !== undefined) {
  user.greet()
}

// 短路效应：?. 后面的整个链条都不会执行
user?.profile.settings.theme // 如果 user 为 null，profile 的 getter 不会触发
```

### 1.6 箭头函数 → 词法 this 绑定

**糖的写法：**

```javascript
const add = (a, b) => a + b
const getThis = () => this
const obj = {
  method: () => this, // 捕获定义处的 this
}
```

**本质还原：**

```javascript
// 箭头函数 ≈ 提前绑定 this 的普通函数
const _this = this // 在定义处捕获外层 this（词法作用域）

const add = function (a, b) {
  return a + b
}.bind(_this) // 且 bind 后无法再被 call/apply/new 改变

// 箭头函数的 4 个"没有"：
// 1. 没有自己的 this → 从外层词法环境继承
// 2. 没有 arguments → 用 rest 参数替代
// 3. 没有 prototype → 不能作为构造函数
// 4. 没有 super/new.target

// 经典场景拆解：
class Timer {
  constructor() {
    this.seconds = 0
    // 箭头函数捕获了 constructor 执行时的 this（即实例）
    setInterval(() => {
      this.seconds++ // this === Timer 实例
    }, 1000)

    // 等价于：
    const _self = this
    setInterval(function () {
      _self.seconds++
    }, 1000)
  }
}
```

### 1.7 模板字符串 → 字符串拼接 + Tagged Template 元编程

**糖的写法：**

```javascript
const msg = `Hello ${name}, you are ${age} years old`
```

**本质还原：**

```javascript
// 基础模板 → 字符串拼接（表达式先求值再 String() 转换）
const msg = 'Hello ' + String(name) + ', you are ' + String(age) + ' years old'

// Tagged Template → 编译期拆分为静态部分 + 动态部分
function highlight(strings, ...values) {
  // strings: ['Hello ', ', you are ', ' years old']（Raw 形式也通过 strings.raw 提供）
  // values: [name, age]（原始值，未被 String() 转换！）
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '')
}

const msg = highlight`Hello ${name}, you are ${age} years old`
// ≈ highlight(['Hello ', ', you are ', ' years old'], name, age)

// 实际应用：防 XSS 的 SQL/HTML 模板
function safeHTML(strings, ...values) {
  return strings.reduce(
    (result, str, i) =>
      result + str + escapeHTML(String(values[i] ?? '')), // 只对插值转义
    ''
  )
}
```

### 1.8 getter/setter → Object.defineProperty

**糖的写法：**

```javascript
const person = {
  _age: 25,
  get age() {
    return this._age
  },
  set age(val) {
    if (val < 0) throw new RangeError('Invalid age')
    this._age = val
  },
}
```

**本质还原：**

```javascript
// 对象字面量 getter/setter → defineProperty
const person = { _age: 25 }
Object.defineProperty(person, 'age', {
  get() {
    return this._age
  },
  set(val) {
    if (val < 0) throw new RangeError('Invalid age')
    this._age = val
  },
  enumerable: true, // 字面量中定义的访问器默认可枚举
  configurable: true,
})

// Vue 3 之前的响应式系统正是利用了这个机制：
function reactive(obj, key, val) {
  const dep = new Set() // 依赖收集器
  Object.defineProperty(obj, key, {
    get() {
      if (currentEffect) dep.add(currentEffect) // 读取时收集依赖
      return val
    },
    set(newVal) {
      val = newVal
      dep.forEach((effect) => effect()) // 写入时触发更新
    },
  })
}
```

### 1.9 模块化语法 → 运行时的模块加载

**糖的写法：**

```javascript
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'
export default class {}
export const version = '1.0'
```

**本质还原（CJS 视角）：**

```javascript
// ESM import ≈ 编译期静态分析 + 运行时绑定
// CJS 等价物：
const { readFile } = require('node:fs/promises')
const path = require('node:path')

// 但本质区别：ESM 是活绑定（live binding），CJS 是值拷贝
// ESM:
// counter.js: export let count = 0; export function inc() { count++ }
// main.js: import { count, inc } from './counter.js'
// inc(); console.log(count) // 1 ← 实时反映模块内部变化

// CJS:
// counter.js: let count = 0; module.exports = { count, inc }
// main.js: const { count, inc } = require('./counter')
// inc(); console.log(count) // 0 ← 拷贝的是旧值

// export default 的本质：名为 "default" 的具名导出
export default function foo() {}
// ≈
function foo() {}
export { foo as default }

// 动态 import() → 返回 Promise 的模块加载
const module = await import('./heavy-module.js')
// ≈ require 的异步版 + Promise 包装，但返回的是 Module Namespace Object
// module.default → default 导出
// module.namedExport → 具名导出
```

---

## 二、高阶 API 深度解析

### 2.1 Proxy 元编程

> Proxy 是 JS 唯一能拦截**对象基本操作**（get/set/has/delete/construct...）的 API，是"拦截器模式"的语言级实现。

```javascript
// 13 种可拦截操作（trap）完整清单：
const handler = {
  get(target, key, receiver) {}, // 属性读取
  set(target, key, value, receiver) {}, // 属性写入
  has(target, key) {}, // in 操作符
  deleteProperty(target, key) {}, // delete 操作符
  ownKeys(target) {}, // Object.keys / for...in
  getOwnPropertyDescriptor(target, key) {}, // Object.getOwnPropertyDescriptor
  defineProperty(target, key, descriptor) {}, // Object.defineProperty
  getPrototypeOf(target) {}, // Object.getPrototypeOf / __proto__
  setPrototypeOf(target, proto) {}, // Object.setPrototypeOf
  isExtensible(target) {}, // Object.isExtensible
  preventExtensions(target) {}, // Object.preventExtensions
  apply(target, thisArg, args) {}, // 函数调用（仅函数目标）
  construct(target, args, newTarget) {}, // new 调用（仅函数目标）
}
```

**receiver 参数——最易踩坑的细节：**

```javascript
const obj = {
  _name: 'base',
  get name() {
    return this._name // this 是谁？取决于 receiver！
  },
}

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    // receiver = 属性查找的起点（通常是 proxy 本身或继承 proxy 的对象）
    console.log(`get ${String(key)}, receiver === proxy: ${receiver === proxy}`)
    return Reflect.get(target, key, receiver) // 传递 receiver 保证 getter 中 this 正确
  },
})

// 不传 receiver 的 bug：
const badProxy = new Proxy(obj, {
  get(target, key) {
    return target[key] // getter 中 this === target（原始对象），丢失了代理语义
  },
})
```

**Proxy 不变量约束（Invariant）：**

```javascript
// 引擎强制的规则，违反直接抛 TypeError：
const sealed = Object.seal({ a: 1 })
const p = new Proxy(sealed, {
  get() {
    return 999 // ❌ TypeError! 密封对象的不可配置属性必须返回真实值
  },
})
p.a // TypeError: 'get' on proxy: property 'a' is non-configurable...

// 设计原因：防止 Proxy 破坏 JS 对象模型的一致性保证
```

**实战：实现 Vue 3 reactive 核心：**

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      if (key === '__raw') return target // 获取原始对象的逃生舱
      track(target, key) // 依赖收集
      const result = Reflect.get(target, key, receiver)
      // 惰性深层代理：访问嵌套对象时才创建子 Proxy
      return typeof result === 'object' && result !== null ? reactive(result) : result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (!Object.is(oldValue, value)) {
        trigger(target, key) // 仅在值真正变化时触发
      }
      return result
    },
    deleteProperty(target, key) {
      const had = key in target
      const result = Reflect.deleteProperty(target, key)
      if (had) trigger(target, key)
      return result
    },
  })
}
```

### 2.2 Reflect —— 对象操作的标准化集合

> Reflect 不是新能力，而是把散落在各处的对象操作收拢为**统一签名的函数式 API**，每个方法与 Proxy trap 一一对应。

```javascript
// 为什么需要 Reflect？对比旧写法：
try {
  Object.defineProperty(obj, 'x', { value: 1 }) // 失败时抛异常
} catch (e) {}

Reflect.defineProperty(obj, 'x', { value: 1 }) // 失败时返回 false —— 与 Proxy trap 返回值语义一致

// 核心价值 1：与 Proxy 配合的默认行为转发
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log('intercepted')
    return Reflect.get(target, key, receiver) // 标准转发，保证 receiver 语义
  },
})

// 核心价值 2：将命令式操作变为函数式（可用于高阶函数）
const keys = Reflect.ownKeys(obj) // ≈ Object.keys + Symbols
Reflect.has(obj, 'key') // ≈ 'key' in obj
Reflect.deleteProperty(obj, 'key') // ≈ delete obj.key

// 核心价值 3：construct 可以指定 new.target（实现继承hack）
function Parent() {
  this.from = new.target.name // new.target 指向实际被 new 的构造函数
}
function Child() {}
Reflect.construct(Parent, [], Child) // 执行 Parent 构造逻辑，但 new.target === Child
```

### 2.3 Symbol 与内置协议（Well-Known Symbols）

> Symbol 的本质：创建**全局唯一标识符**，用于定义不会冲突的属性键。内置 Symbol 是引擎暴露的"协议钩子"。

```javascript
// Symbol 本质拆解：
const s1 = Symbol('desc')
const s2 = Symbol('desc')
s1 === s2 // false —— 描述相同但值唯一

// Symbol 属性不参与常规遍历（"半隐藏"属性）
const obj = { [s1]: 'secret', visible: 1 }
Object.keys(obj) // ['visible']
Object.getOwnPropertySymbols(obj) // [s1] —— 但可以被显式获取
Reflect.ownKeys(obj) // ['visible', s1] —— 全量获取

// 内置协议 Symbol —— 改变语言行为的钩子：

// 1. Symbol.iterator → for...of 协议
class Range {
  constructor(start, end) {
    this.start = start
    this.end = end
  }
  [Symbol.iterator]() {
    let current = this.start
    const end = this.end
    return {
      next() {
        return current <= end ? { value: current++, done: false } : { done: true }
      },
    }
  }
}
for (const n of new Range(1, 3)) console.log(n) // 1, 2, 3

// 2. Symbol.toPrimitive → 类型转换协议
class Money {
  constructor(amount) {
    this.amount = amount
  }
  [Symbol.toPrimitive](hint) {
    // hint: 'number' | 'string' | 'default'
    if (hint === 'string') return `$${this.amount}`
    return this.amount
  }
}
const price = new Money(42)
console.log(`${price}`) // "$42" (hint: string)
console.log(price * 2) // 84 (hint: number)
console.log(price + '') // "42" (hint: default → 走 number)

// 3. Symbol.hasInstance → instanceof 协议
class Even {
  static [Symbol.hasInstance](val) {
    return typeof val === 'number' && val % 2 === 0
  }
}
console.log(4 instanceof Even) // true —— instanceof 被重写了！

// 4. Symbol.species → 控制派生对象的构造函数
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array // map/filter 等返回纯 Array 而非 MyArray
  }
}
const arr = new MyArray(1, 2, 3)
arr.map((x) => x * 2) instanceof MyArray // false

// 5. Symbol.asyncIterator → for await...of 协议
const asyncIterable = {
  [Symbol.asyncIterator]: async function* () {
    yield 1
    yield 2
  },
}
for await (const val of asyncIterable) console.log(val)

// 6. Symbol.dispose / Symbol.asyncDispose → using 语句协议（见 3.8 节）
```

### 2.4 迭代器协议 —— for...of 的本质

```javascript
// for...of 的完整展开：
for (const item of iterable) {
  // body
}

// ≈ 引擎实际执行的代码：
const iterator = iterable[Symbol.iterator]() // 1. 获取迭代器
let result = iterator.next() // 2. 首次 next
while (!result.done) {
  const item = result.value // 3. 取值
  // body
  result = iterator.next() // 4. 推进
}
// 5. 如果循环被 break/return 中断，且 iterator.return 存在，则调用它（清理资源）

// 解构、展开、Array.from、Promise.all 全部基于此协议：
Array.from(iterable) // 内部就是 while(!done) push
new Set(iterable) // 同上
[...iterable] // 同上

// 迭代器是一次性的（区别于可迭代对象）：
const set = new Set([1, 2, 3]) // 可迭代对象：可多次 for...of
const iter = set[Symbol.iterator]() // 迭代器：消费一次即耗尽
iter.next() // {value: 1, done: false}
iter.next() // {value: 2, done: false}
iter.next() // {value: 3, done: false}
iter.next() // {done: true} —— 永远 done

// 自定义可迭代对象（惰性计算）：
const fibonacci = {
  [Symbol.iterator]() {
    let [prev, curr] = [0, 1]
    return {
      next() {
        ;[prev, curr] = [curr, prev + curr]
        return { value: prev, done: false } // 无限迭代器
      },
    }
  },
}
for (const n of fibonacci) {
  if (n > 100) break // break 触发 iterator.return?.()
  console.log(n)
}
```

### 2.5 Generator —— 可暂停的协程

> Generator 本质：一个**状态机**，每次 yield 保存完整执行上下文（局部变量、执行位置）到堆内存，next() 恢复执行。

```javascript
function* counter() {
  console.log('start')
  const a = yield 1 // yield 是双向通道：暂停并返回值，next(arg) 传入恢复值
  console.log('received:', a)
  const b = yield 2
  return a + b
}

const gen = counter()
// 此时函数体一行都没执行！（惰性启动）

gen.next(100) // 打印 'start'，暂停在 yield 1，返回 {value: 1, done: false}
// 注意：100 被丢弃了！第一次 next 的参数无法被接收（因为还没有 yield 在等待）

gen.next(10) // 打印 'received: 10'，暂停在 yield 2，返回 {value: 2, done: false}
gen.next(20) // 返回 {value: 30, done: true}

// 状态机视角（编译器实际生成的结构）：
function counterCompiled() {
  let state = 0,
    a,
    b
  return {
    next(arg) {
      switch (state) {
        case 0:
          console.log('start')
          state = 1
          return { value: 1, done: false }
        case 1:
          a = arg // yield 的赋值发生在恢复时
          console.log('received:', a)
          state = 2
          return { value: 2, done: false }
        case 2:
          b = arg
          state = 3
          return { value: a + b, done: true }
      }
    },
  }
}

// yield* 委托 —— 迭代器组合：
function* inner() {
  yield 'a'
  yield 'b'
  return 'inner-done' // return 值成为 yield* 表达式的值
}
function* outer() {
  const result = yield* inner() // 透传所有 next/throw 给 inner
  console.log(result) // 'inner-done'
  yield 'c'
}

// 实战：用 Generator 实现扁平化迭代（惰性，不占额外内存）
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item) // 递归委托
    } else {
      yield item
    }
  }
}
[...flatten([1, [2, [3, 4]], 5])] // [1, 2, 3, 4, 5]
```

### 2.6 WeakRef 与 FinalizationRegistry —— 弱引用与垃圾回收感知

```javascript
// 强引用 vs 弱引用：
let strong = { data: 'big' } // 强引用：GC 不会回收
const weak = new WeakRef(strong) // 弱引用：不阻止 GC

strong = null // 对象现在可以被回收了
// 注意：GC 时机不确定，weak.deref() 可能仍返回对象（直到 GC 实际运行）

const obj = weak.deref() // 返回对象或 undefined
if (obj) {
  console.log(obj.data)
}

// FinalizationRegistry —— 对象被 GC 后的回调（不可靠！仅用于清理/统计）
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`对象被回收了，关联值: ${heldValue}`)
  // ⚠️ 不保证执行时机，甚至不保证一定执行（页面关闭时可能跳过）
})

let target = { cache: new Array(1000000) }
registry.register(target, 'cache-slot-1') // heldValue 不能是 target 本身（否则阻止回收）
target = null // 等待 GC...

// 实战：手动缓存 + 自动清理
class AutoCleanCache {
  #cache = new Map()
  #registry = new FinalizationRegistry((key) => {
    const ref = this.#cache.get(key)
    if (ref && !ref.deref()) this.#cache.delete(key) // 只清理已失效的条目
  })

  set(key, value) {
    const ref = new WeakRef(value)
    this.#cache.set(key, ref)
    this.#registry.register(value, key)
  }

  get(key) {
    return this.#cache.get(key)?.deref() // 可能返回 undefined（已被回收）
  }
}
```

### 2.7 structuredClone —— 结构化克隆算法

```javascript
// JSON 深拷贝的致命缺陷：
const original = {
  date: new Date(),
  regex: /abc/gi,
  map: new Map([['k', 'v']]),
  buffer: new Uint8Array([1, 2, 3]),
  circular: null,
  undef: undefined,
  fn: () => {},
}
original.circular = original

JSON.parse(JSON.stringify(original))
// ❌ Date → 字符串, Map → {}, 循环引用直接报错, undefined/fn 被丢弃

// structuredClone 使用结构化克隆算法（与 postMessage 相同）：
const clone = structuredClone(original)
clone.date instanceof Date // ✅ true
clone.map instanceof Map // ✅ true
clone.circular === clone // ✅ 循环引用正确处理
clone.buffer instanceof Uint8Array // ✅ true

// 支持类型：所有原始值、Boolean/String/Number 对象、Date、RegExp、
// Map、Set、ArrayBuffer、TypedArray、Blob、File、ImageData、
// 普通对象/数组（递归）、循环引用

// 不支持（抛 DataCloneError）：函数、DOM 节点、Symbol、原型链（克隆后全是普通对象）
// structuredClone(() => {}) // ❌ DataCloneError

// 性能对比（大对象）：
// JSON 方式: ~100ms | structuredClone: ~60ms | lodash.cloneDeep: ~80ms
// structuredClone 是原生实现，无需序列化为字符串中间态
```

### 2.8 AbortController —— 取消机制的统一协议

```javascript
// 本质：一个可观察的"取消信号"对象
const controller = new AbortController()
const signal = controller.signal

// signal 是 AbortSignal 实例，继承 EventTarget
signal.aborted // false
signal.addEventListener('abort', () => {
  console.log('已取消，原因:', signal.reason)
})

controller.abort('用户主动取消') // 触发 abort 事件，设置 reason

// fetch 如何使用它（内部实现原理）：
async function fetchWithAbort(url, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      return reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    const onAbort = () => {
      // 实际会中断底层网络连接
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
    // ... 正常 fetch 逻辑，完成后 removeEventListener
  })
}

// 组合信号（ES2024+ 静态方法）：
const timeoutSignal = AbortSignal.timeout(5000) // 5秒后自动 abort
const userSignal = controller.signal
const combined = AbortSignal.any([timeoutSignal, userSignal]) // 任一触发即取消

// 实战：竞态请求（只保留最后一次）
let currentSignal = null
async function search(keyword) {
  currentSignal?.abort() // 取消上一次
  currentSignal = AbortSignal.timeout(3000)
  try {
    const res = await fetch(`/api/search?q=${keyword}`, { signal: currentSignal })
    return res.json()
  } catch (e) {
    if (e.name === 'AbortError') return null // 静默处理取消
    throw e
  }
}
```

### 2.9 Atomics 与 SharedArrayBuffer —— 真正的多线程共享内存

```javascript
// Web Worker 间默认是消息传递（拷贝），SharedArrayBuffer 实现真正的共享内存
const sab = new SharedArrayBuffer(4) // 4 字节共享内存
const view = new Int32Array(sab) // 用 TypedArray 视图读写

// 为什么需要 Atomics？—— 非原子操作有竞态条件：
// view[0]++ 实际是 3 步：读取 → 加1 → 写回
// 两个 Worker 同时执行会丢失更新！

// Atomics 保证操作原子性：
Atomics.add(view, 0, 1) // 原子加
Atomics.compareExchange(view, 0, 0, 42) // CAS：期望值是0才替换为42
Atomics.load(view, 0) // 原子读（保证读到完整值）
Atomics.store(view, 0, 100) // 原子写

// 线程间同步（类似操作系统的条件变量）：
// Worker A（等待方）：
Atomics.wait(view, 0, 0) // 阻塞，直到 view[0] !== 0 或被 notify
console.log('被唤醒了')

// Worker B（通知方）：
Atomics.store(view, 0, 1)
Atomics.notify(view, 0, 1) // 唤醒 1 个等待者

// 注意：主线程不允许 Atomics.wait（会冻结 UI），只能在 Worker 中使用
// Atomics.waitAsync 是主线程可用的非阻塞版本（返回 Promise）
const result = Atomics.waitAsync(view, 0, 0)
result.async // true
result.value.then((r) => console.log(r)) // 'ok' | 'timed-out'
```

---

## 三、实验性 API（TC39 提案）

> TC39 提案阶段：Stage 0（设想）→ 1（提案）→ 2（草案）→ 3（候选）→ 4（完成/已纳入标准）  
> Stage 3+ 的提案语法基本稳定，可通过 Babel/TypeScript 提前使用。

### 3.1 Decorators 装饰器（Stage 3）

```javascript
// 装饰器本质：在类/方法定义时执行的高阶函数
// TC39 新版装饰器（与旧版 legacy 语法不兼容！）

// 类装饰器
function logged(originalClass, context) {
  // context: { kind: 'class', name, addInitializer }
  console.log(`类 ${context.name} 被定义了`)
  return class extends originalClass {
    // 可以返回新类来替换原类
  }
}

// 方法装饰器
function log(originalMethod, context) {
  // context: { kind: 'method', name, static, private, access }
  const methodName = String(context.name)
  return function (...args) {
    console.log(`→ ${methodName}(${JSON.stringify(args)})`)
    const result = originalMethod.call(this, ...args)
    console.log(`← ${methodName} = ${result}`)
    return result
  }
}

// 访问器装饰器 + 字段装饰器
function readonly(value, context) {
  if (context.kind === 'field') {
    // 字段装饰器接收初始化函数，返回新的初始化函数
    return function (initialValue) {
      Object.freeze(this) // 初始化后冻结
      return initialValue
    }
  }
}

@logged
class Calculator {
  @log
  add(a, b) {
    return a + b
  }
}

// 本质拆解 —— 装饰器就是函数调用：
class Calculator_raw {
  add(a, b) {
    return a + b
  }
}
// @log 等价于：
Calculator_raw.prototype.add = log(Calculator_raw.prototype.add, {
  kind: 'method',
  name: 'add',
  static: false,
  private: false,
})
// @logged 等价于：
const Calculator = logged(Calculator_raw, { kind: 'class', name: 'Calculator' })

// 执行顺序：成员装饰器先执行（从下到上），类装饰器最后执行
// 实际应用：NestJS/Angular 的依赖注入、MobX 的 observable、路由注册
```

### 3.2 Pipeline Operator 管道操作符（Stage 2+）

```javascript
// 问题：深层嵌套函数调用可读性极差
const result = unique(sortBy(filter(users, (u) => u.active), 'age').map((u) => u.name))

// Hack-style 管道（当前主推方案，% 是占位符）：
const result = users
  |> filter(%, (u) => u.active)
  |> sortBy(%, 'age')
  |> %.map((u) => u.name)
  |> unique(%)

// 本质：纯粹的语法变换，% 被替换为前一步的结果
// a |> f(%) === f(a)
// a |> f(%, b) === f(a, b)
// a |> %.method() === a.method()

// 与函数式 compose 的对比：
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x)
const transform = pipe(
  (users) => filter(users, (u) => u.active),
  (users) => sortBy(users, 'age'),
  (users) => users.map((u) => u.name),
  unique
)
const result2 = transform(users) // 功能等价，但管道语法无需定义中间函数

// await 在管道中的使用：
const data = fetch('/api')
  |> await % // |> await % 是合法语法
  |> await %.json()
  |> %.data
```

### 3.3 Record & Tuple 不可变数据结构（Stage 2）

```javascript
// 语法：#[...] 和 #{...} —— 深度不可变的值类型
const rec = #{ name: 'Alice', age: 30, tags: #['a', 'b'] }
const tup = #[1, 2, 3]

// 本质特性 1：值语义（按内容比较，而非引用）
#{ a: 1 } === #{ a: 1 } // true！（普通对象是 false）
#[1, 2] === #[1, 2] // true！
// 引擎实现：内部化（interning）—— 相同内容的 Record 共享同一内存地址

// 本质特性 2：深度不可变
rec.name = 'Bob' // ❌ TypeError: Cannot modify immutable record
tup.push(4) // ❌ 没有 push 方法！Tuple 不是 Array

// 本质特性 3：与现有 API 互操作
const obj = Record.toObject(rec) // 转为普通对象（深层转换）
const arr = Tuple.toArray(tup) // 转为普通数组
Record.isRecord(rec) // true
Tuple.isTuple(tup) // true

// 转换方法（不修改原值，返回新值）：
const updated = rec.with({ age: 31 }) // #{ name: 'Alice', age: 31, ... }
const extended = tup.with(1, 99) // #[1, 99, 3]
tup.slice(1) // #[2, 3]

// 限制：只能包含原始值和其他 Record/Tuple
#{ fn: () => {} } // ❌ TypeError
#{ date: new Date() } // ❌ TypeError

// 应用场景：React 的 memo 比较、缓存 key、状态管理（天然 immutable）
// 对比 Immer：Record & Tuple 是语言级方案，无需运行时代理
```

### 3.4 Pattern Matching 模式匹配（Stage 2）

```javascript
// 提案语法（match 表达式）：
const message = match (response) {
  when ({ status: 200, data: { users } }) -> `找到 ${users.length} 个用户`;
  when ({ status: 404 }) -> '资源不存在';
  when ({ status: 500, error }) if error.critical -> '严重错误: ' + error.message; // guard 子句
  when ({ status: Number }) -> `其他状态码`; // 内置类型匹配
  default -> '未知响应';
}

// 本质拆解 —— match 是 if/else + 解构 + 严格比较的组合：
let message
if (
  response !== null &&
  typeof response === 'object' &&
  response.status === 200 &&
  response.data !== null &&
  Array.isArray(response.data.users)
) {
  const users = response.data.users
  message = `找到 ${users.length} 个用户`
} else if (response.status === 404) {
  message = '资源不存在'
} // ... 以此类推

// 对比 switch 的缺陷：
switch (response.status) {
  case 200: // 只能匹配单个值，不能解构
  // 用 === 比较，但无法处理结构匹配
}

// 与解构的区别：解构是"提取"，模式匹配是"检查 + 提取"
const { a, b } = obj // 如果 obj 没有 a/b，得到 undefined（不报错）
// match 中 { a, b } 模式要求属性必须存在且匹配

// 实际应用：替代大量 if/else 链处理 API 响应、状态机转换、AST 遍历
```

### 3.5 Temporal API —— Date 的终结者（Stage 3）

```javascript
// Date 的原罪：可变、时区混乱、月份从0开始、非 ISO 格式
// Temporal 设计原则：不可变、时区显式、区分"墙上时间"和"精确时刻"

// 1. Temporal.Instant —— 精确时刻（UTC 时间戳）
const now = Temporal.Now.instant() // 2026-07-22T08:30:00Z
now.epochMilliseconds // 毫秒时间戳
now.add({ hours: 2 }) // 不可变，返回新实例

// 2. Temporal.ZonedDateTime —— 带时区的时刻（处理夏令时的正确方式）
const meeting = Temporal.ZonedDateTime.from({
  timeZone: 'Asia/Shanghai',
  year: 2026,
  month: 7,
  day: 22,
  hour: 14,
})
meeting.toString() // 2026-07-22T14:00:00+08:00[Asia/Shanghai]
meeting.withTimeZone('America/New_York').toString() // 同一时刻的纽约表示

// 3. Temporal.PlainDate / PlainTime / PlainDateTime —— 墙上时间（无时区）
const birthday = Temporal.PlainDate.from('1995-03-15')
birthday.dayOfWeek // 3 (周三) —— Date 需要 getDay() 且周日=0
birthday.until(Temporal.PlainDate.from('2026-07-22')) // P31Y4M7D（ISO 8601 时长）
birthday.add({ months: 1 }) // 1995-04-15（自动处理月末溢出）

// 4. Temporal.Duration —— 精确时长
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 })
meeting.add(duration)
duration.total({ unit: 'minutes', relativeTo: meeting }) // 150

// 5. 日期运算的正确性对比：
// Date 的坑：
new Date(2026, 0, 31) + '1 month' // NaN（字符串拼接！）
const d = new Date(2026, 0, 31)
d.setMonth(d.getMonth() + 1) // 3月3日！（1月31+1月=2月31→溢出）

// Temporal 的解决方案：
Temporal.PlainDate.from('2026-01-31').add({ months: 1 }) // 2026-02-28（默认 constrain 策略）
Temporal.PlainDate.from('2026-01-31').add({ months: 1 }, { overflow: 'reject' }) // ❌ 抛错

// 6. 格式化与解析（告别 moment/dayjs 的 format 字符串）
meeting.toLocaleString('zh-CN') // 本地化格式
Temporal.PlainDate.from({ year: 2026, month: 7, day: 22 }).toString() // ISO 8601 标准输出
```

### 3.6 Promise.withResolvers（Stage 4 —— 已纳入标准）

```javascript
// 痛点：resolve/reject 只在 executor 内可用，外部控制很别扭
let resolve, reject
const promise = new Promise((res, rej) => {
  resolve = res // 泄露到外部作用域
  reject = rej
})

// 新 API：
const { promise, resolve, reject } = Promise.withResolvers()

// 本质拆解：
Promise.withResolvers = function () {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// 典型场景 1：事件转 Promise
function onceEvent(emitter, event) {
  const { promise, resolve } = Promise.withResolvers()
  emitter.once(event, resolve)
  return promise
}

// 典型场景 2：带超时的 Promise 竞赛
function withTimeout(promise, ms) {
  const { promise: wrapper, resolve, reject } = Promise.withResolvers()
  const timer = setTimeout(() => reject(new Error('Timeout')), ms)
  promise.then(
    (v) => {
      clearTimeout(timer)
      resolve(v)
    },
    (e) => {
      clearTimeout(timer)
      reject(e)
    }
  )
  return wrapper
}

// 典型场景 3：队列消费者模式
class TaskQueue {
  #waiters = []
  push(task) {
    const waiter = this.#waiters.shift()
    waiter ? waiter.resolve(task) : this.#buffer.push(task)
  }
  take() {
    const task = this.#buffer.shift()
    if (task) return Promise.resolve(task)
    const { promise, resolve } = Promise.withResolvers()
    this.#waiters.push({ resolve })
    return promise
  }
}
```

### 3.7 Iterator Helpers —— 迭代器的链式操作（Stage 3）

```javascript
// 痛点：数组方法链会创建大量中间数组
const result = arr
  .filter((x) => x > 0) // 新数组 1
  .map((x) => x * 2) // 新数组 2
  .slice(0, 10) // 新数组 3

// Iterator Helpers：惰性求值，零中间分配
const result = arr
  .values() // 转为迭代器
  .filter((x) => x > 0) // 返回惰性迭代器（不执行）
  .map((x) => x * 2) // 返回惰性迭代器（不执行）
  .take(10) // 只取前 10 个
  .toArray() // 此时才真正执行，且只遍历到第 10 个满足条件的元素

// 完整 API 清单：
const iter = [1, 2, 3, 4, 5].values()

iter.map(fn) // 转换每个元素
iter.filter(fn) // 过滤
iter.take(n) // 取前 n 个
iter.drop(n) // 跳过前 n 个
iter.flatMap(fn) // 映射后展平一层
iter.forEach(fn) // 遍历（消费迭代器）
iter.reduce(fn, init) // 归约
iter.some(fn) / iter.every(fn) / iter.find(fn) // 短路判断
iter.toArray() // 收集为数组
Iterator.from(iterable) // 任意可迭代对象 → Iterator 实例

// 对无限序列的意义（数组方法做不到）：
function* naturals() {
  let n = 1
  while (true) yield n++
}
const firstTenSquares = Iterator.from(naturals())
  .map((n) => n * n)
  .filter((n) => n % 2 === 0)
  .take(10)
  .toArray() // [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]
// 数组的 filter/map 会先遍历无限序列 → 永远卡死

// 本质：每个 helper 返回一个新迭代器，next() 时才逐级拉取（pull-based）
```

### 3.8 Explicit Resource Management —— using 语句（Stage 3）

```javascript
// 痛点：try/finally 手动释放资源
const file = await openFile('data.txt')
try {
  await file.read()
} finally {
  await file.close() // 容易忘记，嵌套时代码爆炸
}

// using 语法（同步资源）：
{
  using file = openFile('data.txt') // 要求对象实现 Symbol.dispose
  file.read()
} // 块结束时自动调用 file[Symbol.dispose]()

// await using（异步资源）：
{
  await using conn = await db.connect() // 要求实现 Symbol.asyncDispose
  await conn.query('SELECT 1')
} // 自动 await conn[Symbol.asyncDispose]()

// 协议本质：
const resource = {
  [Symbol.dispose]() {
    console.log('同步清理')
  },
}
const asyncResource = {
  async [Symbol.asyncDispose]() {
    console.log('异步清理')
  },
}

// using 的本质展开：
{
  const file = openFile('data.txt')
  try {
    file.read()
  } finally {
    file[Symbol.dispose]?.() // 引擎实际生成的代码
  }
}

// 多个 using 按声明的逆序释放（栈语义）：
{
  using a = getResourceA()
  using b = getResourceB()
} // 先释放 b，再释放 a

// 实战场景：数据库事务、文件句柄、锁、定时器、AbortController
using timer = new DisposableTimer(5000, callback) // 超时自动清理
using lock = await mutex.acquire() // 作用域结束自动释放锁
```

### 3.9 Set 新方法（Stage 4 —— 已纳入标准）

```javascript
const evens = new Set([2, 4, 6, 8])
const primes = new Set([2, 3, 5, 7])

// 集合运算（终于不用手动遍历了）：
evens.union(primes) // Set {2, 4, 6, 8, 3, 5, 7} —— 并集
evens.intersection(primes) // Set {2} —— 交集
evens.difference(primes) // Set {4, 6, 8} —— 差集（在 evens 不在 primes）
evens.symmetricDifference(primes) // Set {4, 6, 8, 3, 5, 7} —— 对称差集

// 判断方法：
evens.isSubsetOf(new Set([1, 2, 3, 4, 5, 6, 7, 8])) // true —— 子集
evens.isSupersetOf(new Set([2, 4])) // true —— 超集
evens.isDisjointFrom(primes) // false —— 是否无交集

// 本质拆解（以 intersection 为例）：
Set.prototype.intersection = function (other) {
  const result = new Set()
  // 优化：遍历较小的集合
  const [smaller, larger] = this.size <= other.size ? [this, other] : [other, this]
  for (const item of smaller) {
    if (larger.has(item)) result.add(item) // O(min(n,m))
  }
  return result // 返回新 Set，不修改原集合（不可变语义）
}

// 之前的手动实现对比：
const intersectionOld = new Set([...evens].filter((x) => primes.has(x))) // 展开+filter，多余分配
```

### 3.10 Object.groupBy / Map.groupBy / Array.fromAsync（Stage 4）

```javascript
// Object.groupBy —— 按条件分组为普通对象
const inventory = [
  { name: 'apple', type: 'fruit', qty: 5 },
  { name: 'carrot', type: 'vegetable', qty: 10 },
  { name: 'banana', type: 'fruit', qty: 3 },
]

Object.groupBy(inventory, (item) => item.type)
// {
//   fruit: [{apple...}, {banana...}],
//   vegetable: [{carrot...}]
// }

// 本质拆解：
function groupBy(items, keyFn) {
  const result = Object.create(null) // 无原型对象，避免 __proto__ 键冲突
  for (const item of items) {
    const key = String(keyFn(item)) // 键被强制转为字符串！
    ;(result[key] ??= []).push(item)
  }
  return result
}

// Map.groupBy —— 键可以是任意类型
Map.groupBy(inventory, (item) => item.qty > 5)
// Map { false => [apple, banana], true => [carrot] } —— 布尔键！对象键做不到

// Array.fromAsync —— 异步可迭代 → 数组
async function* fetchPages() {
  yield await fetch('/api/page/1').then((r) => r.json())
  yield await fetch('/api/page/2').then((r) => r.json())
}
const allPages = await Array.fromAsync(fetchPages()) // [{...}, {...}]

// 本质：
async function fromAsync(iterable) {
  const result = []
  for await (const item of iterable) {
    result.push(item)
  }
  return result
}
// 为什么需要它？Array.from(asyncGen()) 得到的是 [Promise, Promise]（不会 await！）
```

### 3.11 Import Attributes 导入属性（Stage 4）

```javascript
// 语法演进：import assertions (with 取代了 assert)
import config from './config.json' with { type: 'json' }
import styles from './styles.css' with { type: 'css' }

// JSON Module 的完整使用：
import pkg from '../package.json' with { type: 'json' }
console.log(pkg.version)

// 动态导入版本：
const module = await import('./data.json', { with: { type: 'json' } })

// 本质：告诉引擎模块的 MIME 类型，用于安全校验
// 没有 with { type: 'json' }，导入 .json 文件直接报错（安全策略）
// 引擎校验：文件实际类型必须与声明一致，否则拒绝加载

// CSS Module Scripts（浏览器原生 CSS-in-JS）：
import sheet from './theme.css' with { type: 'css' }
document.adoptedStyleSheets = [sheet] // 直接应用，零运行时开销

// 与 Webpack/Vite 的 import 断言对比：
// import data from './data.json' assert { type: 'json' } ← 旧语法，已废弃
// 构建工具已跟进支持 with 语法（Vite 5+, Webpack 5.90+）
```

### 3.12 Observable —— 可观察值提案（Stage 1）

```javascript
// 提案目标：为"随时间变化的值"提供语言级原语
// 当前状态：Stage 1，语法和 API 仍在讨论中

// 提案核心概念：
// 1. 新的原始包装类型，类似 Promise 之于异步值
// 2. 与信号（Signals）生态对齐 —— Angular/Vue/Solid/Preact 的信号都受此启发

// 预期 API 形态（基于当前提案讨论）：
const counter = new Observable.State(0) // 可变状态容器
counter.get() // 0
counter.set(1) // 更新

// 派生值（自动追踪依赖）：
const doubled = new Observable.Computed(() => counter.get() * 2)
counter.set(5)
doubled.get() // 10 —— 自动重新计算

// 与现有方案对比：
// Vue ref:       const count = ref(0); computed(() => count.value * 2)
// Solid signal:  const [count, setCount] = createSignal(0)
// Preact signal: const count = signal(0)
// TC39 Observable 旨在统一这些模式为平台标准

// 为什么重要：
// - 框架信号实现互不兼容，生态碎片化
// - 语言级原语可被浏览器优化（如精确 DOM 更新）
// - 未来可能与模板语法、事件系统集成
```

---

## 附录：提案状态速查表

| API | Stage | 可用性 |
|-----|-------|--------|
| Promise.withResolvers | 4 ✅ | 所有现代浏览器 |
| Set 新方法 | 4 ✅ | Chrome 122+, Firefox 127+ |
| Object.groupBy / Map.groupBy | 4 ✅ | Chrome 117+, Firefox 119+ |
| Array.fromAsync | 4 ✅ | Chrome 121+, Firefox 115+ |
| Import Attributes | 4 ✅ | Chrome 123+ (JSON/CSS) |
| Decorators | 3 | TypeScript 5.0+, Babel |
| Temporal | 3 | Chrome 129+ (部分), polyfill 可用 |
| Iterator Helpers | 3 | Chrome 122+, Firefox 131+ |
| using (Resource Management) | 3 | TypeScript 5.2+, Babel |
| Pipeline Operator | 2 | Babel 插件 |
| Record & Tuple | 2 | Babel 插件 + polyfill |
| Pattern Matching | 2 | 无（语法仍在设计） |
| Observable | 1 | 无（概念阶段） |
