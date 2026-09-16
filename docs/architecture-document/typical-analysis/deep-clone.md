# 深拷贝全场景典型拆解

> 本文档从浅拷贝到深拷贝，逐步拆解各种实现方案的覆盖范围与缺陷，
> 最终实现一个处理循环引用、特殊类型、Symbol 的完整深拷贝。

---

## 一、浅拷贝 vs 深拷贝

```javascript
const original = { a: 1, b: { c: 2 } }

// 浅拷贝：只复制第一层
const shallow = { ...original }
shallow.b.c = 999
console.log(original.b.c) // 999 ← 嵌套对象仍共享引用 ❌

// 深拷贝：递归复制所有层级
const deep = myDeepClone(original)
deep.b.c = 999
console.log(original.b.c) // 2 ← 完全独立 ✅
```

| 方案                           | 覆盖范围 | 循环引用   | 特殊类型   |
| ------------------------------ | -------- | ---------- | ---------- |
| `Object.assign` / 展开运算符   | 浅拷贝   | —          | —          |
| `JSON.parse(JSON.stringify())` | 深拷贝   | ❌ 报错    | ❌ 丢失    |
| `structuredClone`              | 深拷贝   | ✅         | 大部分 ✅  |
| 手写递归                       | 深拷贝   | 需手动处理 | 需手动处理 |

---

## 二、JSON.parse(JSON.stringify()) — 最简单的"深拷贝"

```javascript
const obj = {
  name: 'Alice',
  age: 25,
  hobby: ['reading', 'coding'],
  info: { city: 'Beijing' },
}
const clone = JSON.parse(JSON.stringify(obj))
```

**缺陷全拆解：**

| 场景             | 代码                 | 结果                     |
| ---------------- | -------------------- | ------------------------ |
| `undefined`      | `{ a: undefined }`   | 属性直接**消失**         |
| `Function`       | `{ a: () => {} }`    | 属性直接**消失**         |
| `Symbol`         | `{ a: Symbol('x') }` | 属性直接**消失**         |
| `Date`           | `{ a: new Date() }`  | 变成**字符串**           |
| `RegExp`         | `{ a: /abc/g }`      | 变成**空对象** `{}`      |
| `Map / Set`      | `{ a: new Map() }`   | 变成**空对象** `{}`      |
| `循环引用`       | `obj.self = obj`     | 直接**报错** `TypeError` |
| `NaN / Infinity` | `{ a: NaN }`         | 变成 `null`              |

> 结论：`JSON.parse(JSON.stringify())` 只适用于**纯数据对象**（无函数、无特殊类型、无循环引用）。

---

## 三、手写完整深拷贝

### 3.1 第一版：基础递归

```javascript
function deepCloneV1(obj) {
  if (typeof obj !== 'object' || obj === null) return obj

  const clone = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      clone[key] = deepCloneV1(obj[key])
    }
  }
  return clone
}
```

**问题**：无法处理循环引用 → `obj.self = obj` 会导致无限递归栈溢出。

### 3.2 第二版：解决循环引用

```javascript
function deepCloneV2(obj, map = new WeakMap()) {
  if (typeof obj !== 'object' || obj === null) return obj

  // 已拷贝过 → 直接返回缓存的引用
  if (map.has(obj)) return map.get(obj)

  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone) // 先存入 map，再递归（防止循环引用）

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      clone[key] = deepCloneV2(obj[key], map)
    }
  }
  return clone
}
```

**循环引用处理拆解：**

```javascript
const obj = { a: 1 }
obj.self = obj // 循环引用

// 执行过程：
// ① deepCloneV2(obj) → map 中没有 → 创建 clone = {}
// ② map.set(obj, clone) → 先存入 map
// ③ 遍历 key 'self' → deepCloneV2(obj.self) = deepCloneV2(obj)
// ④ map 中已有 obj → 直接返回 clone（步骤②存入的）
// ⑤ clone.self = clone ← 循环引用正确保持 ✅
```

| 设计点           | 实现                             | 原因                     |
| ---------------- | -------------------------------- | ------------------------ |
| `WeakMap` 做缓存 | key 是原对象，value 是克隆对象   | 弱引用不阻止 GC          |
| **先存后递归**   | `map.set(obj, clone)` 在递归之前 | 防止循环引用导致无限递归 |

### 3.3 最终版：全类型支持

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 1. 基本类型直接返回
  if (typeof obj !== 'object' || obj === null) return obj

  // 2. 处理特殊对象类型
  const tag = Object.prototype.toString.call(obj)

  // Date → 创建新的 Date
  if (tag === '[object Date]') return new Date(obj.getTime())

  // RegExp → 创建新的 RegExp
  if (tag === '[object RegExp]') return new RegExp(obj.source, obj.flags)

  // Map → 递归拷贝每个键值对
  if (tag === '[object Map]') {
    const clone = new Map()
    map.set(obj, clone)
    obj.forEach((value, key) => {
      clone.set(deepClone(key, map), deepClone(value, map))
    })
    return clone
  }

  // Set → 递归拷贝每个元素
  if (tag === '[object Set]') {
    const clone = new Set()
    map.set(obj, clone)
    obj.forEach((value) => {
      clone.add(deepClone(value, map))
    })
    return clone
  }

  // 3. 循环引用检测
  if (map.has(obj)) return map.get(obj)

  // 4. 数组 / 普通对象
  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone)

  // 5. 拷贝 Symbol 键
  const symbolKeys = Object.getOwnPropertySymbols(obj)
  for (const symKey of symbolKeys) {
    clone[symKey] = deepClone(obj[symKey], map)
  }

  // 6. 拷贝字符串键（包括不可枚举属性）
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key === 'symbol') continue // Symbol 已处理
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)
    if ('value' in descriptor) {
      clone[key] = deepClone(obj[key], map)
    }
    // getter/setter 不拷贝（只拷贝数据属性）
  }

  return clone
}
```

**全场景覆盖拆解：**

| 场景         | 处理方式                       | 代码                     |
| ------------ | ------------------------------ | ------------------------ |
| 基本类型     | 直接返回                       | `typeof !== 'object'`    |
| `null`       | 直接返回                       | `obj === null`           |
| `Date`       | `new Date(obj.getTime())`      | 创建新的日期对象         |
| `RegExp`     | `new RegExp(source, flags)`    | 保留正则表达式完整信息   |
| `Map`        | 递归拷贝键值对                 | 键和值都可能也是复杂对象 |
| `Set`        | 递归拷贝元素                   | 每个元素独立克隆         |
| 循环引用     | `WeakMap` 缓存 + 先存后递归    | 防止栈溢出               |
| `Symbol` 键  | `Object.getOwnPropertySymbols` | 展开运算符不拷贝 Symbol  |
| 不可枚举属性 | `Reflect.ownKeys`              | `for...in` 只遍历可枚举  |

---

## 四、structuredClone — 浏览器原生深拷贝

```javascript
const obj = {
  date: new Date(),
  regex: /abc/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  buffer: new ArrayBuffer(8),
}
obj.self = obj // 循环引用也支持 ✅

const clone = structuredClone(obj)
```

**与手写方案对比：**

| 对比项          | `structuredClone`   | 手写 `deepClone` |
| --------------- | ------------------- | ---------------- |
| 循环引用        | ✅ 原生支持         | ✅ WeakMap 处理  |
| `Date / RegExp` | ✅                  | ✅               |
| `Map / Set`     | ✅                  | ✅               |
| `ArrayBuffer`   | ✅                  | ❌ 需额外处理    |
| `Function`      | ❌ 报错             | ❌ 函数无法克隆  |
| `DOM 节点`      | ❌ 报错             | ❌               |
| `Symbol` 属性   | ✅                  | ✅               |
| 性能            | 更快（C++ 实现）    | 较慢（JS 递归）  |
| 兼容性          | Chrome 98+ / FF 94+ | 全平台           |
| 可定制性        | 不可定制            | 可自定义策略     |

---

## 五、总结：深拷贝方案选型指南

```
深拷贝方案选型
├── 纯 JSON 数据 → JSON.parse(JSON.stringify())
│   └── 最简单，但有 8 种缺陷
│
├── 通用场景 → structuredClone()
│   └── 原生 API，性能好，支持循环引用
│   └── 需要 Chrome 98+ / Node 17+
│
└── 需要定制 → 手写 deepClone
    ├── 基础递归 + WeakMap 解决循环引用
    ├── 特殊类型处理（Date/RegExp/Map/Set）
    └── Symbol 键 + 不可枚举属性
```
