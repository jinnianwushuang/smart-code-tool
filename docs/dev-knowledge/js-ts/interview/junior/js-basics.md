---
title: 'JavaScript 基础：变量、类型、运算 [P4-P5]'
level: 'junior'
tags: ['JavaScript', '变量', '数据类型', '类型转换']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# JavaScript 基础：变量、类型、运算 [P4-P5]

> JavaScript 是前端的核心语言。理解变量声明、数据类型和类型转换是写出正确代码的基础。

## 核心概念（What）

### 变量声明

```javascript
// var：函数作用域（旧方式，不推荐）
var name = 'Alice'
if (true) {
  var x = 10
}
console.log(x) // 10（var 没有块级作用域！）

// let：块级作用域（推荐）
let age = 25
if (true) {
  let y = 20
}
// console.log(y); // 报错！y 不存在

// const：块级作用域 + 不可重新赋值（推荐）
const PI = 3.14159
// PI = 3; // 报错！

// 注意：const 对象的属性可以修改
const user = { name: 'Alice' }
user.name = 'Bob' // ✓ 合法
// user = {};      // ✗ 报错

// 规则：
// ├── 默认用 const
// ├── 需要重新赋值时用 let
// └── 不用 var
```

### 数据类型

```javascript
// 7 种原始类型
const str = 'hello' // string
const num = 42 // number
const big = 9007199254740991n // bigint
const bool = true // boolean
const empty = null // null
const notDefined = undefined // undefined
const id = Symbol('id') // symbol

// 1 种引用类型
const obj = { name: 'Alice', age: 25 } // object
const arr = [1, 2, 3] // object (数组)
const fn = function () {} // object (函数)

// typeof 检测
typeof 'hello' // 'string'
typeof 42 // 'number'
typeof true // 'boolean'
typeof undefined // 'undefined'
typeof null // 'object'（历史 bug！）
typeof {} // 'object'
typeof [] // 'object'
typeof function () {} // 'function'
```

### 类型转换

```javascript
// 隐式转换（JS 自动转换）
'5' + 3 // '53'（字符串拼接）
'5' - 3 // 2（数字运算）
'5' * '2' // 10
true + 1 // 2
null + 5 // 5
undefined + 5 // NaN

// 假值（falsy）
// false, 0, '', null, undefined, NaN
// 其余都是真值（truthy）

Boolean(0) // false
Boolean('') // false
Boolean(null) // false
Boolean(undefined) // false
Boolean('hello') // true
Boolean(42) // true
Boolean([]) // true（注意：空数组是真值！）
Boolean({}) // true

// 显式转换
Number('42') // 42
Number('hello') // NaN
Number(null) // 0
Number(undefined) // NaN
Number(true) // 1

String(42) // '42'
String(null) // 'null'
String(undefined) + // 'undefined'
  // 常用技巧
  '42' // 42（一元加号转数字）
!!'hello' // true（双重取反转布尔）
42 + '' // '42'（拼接空字符串转字符串）
```

### 运算符

```javascript
// == vs ===
'5' == 5 // true（会类型转换）
'5' === 5 // false（严格比较，推荐！）
null == undefined // true
null === undefined // false

// 规则：始终使用 ===

// 可选链 ?.
const user = { address: { city: 'Beijing' } }
user.address?.city // 'Beijing'
user.contact?.phone // undefined（不报错）

// 空值合并 ??
const name = null ?? '默认值' // '默认值'
const age = 0 ?? 18 // 0（?? 只判断 null/undefined）
const age2 = 0 || 18 // 18（|| 判断所有假值）

// 三元运算符
const status = age >= 18 ? '成年' : '未成年'

// 解构赋值
const { name, age } = user
const [first, second] = [1, 2, 3]
```

---

## 底层原理（Why）

### JavaScript 引擎底层机制

```
JavaScript 核心概念的底层原理：

  1. 变量存储与内存管理：
     ├── 栈（Stack）vs 堆（Heap）：
     │   ├── 原始类型（string/number/boolean）：存储在栈中（快速访问）
     │   └── 引用类型（object/array/function）：
     │       ├── 对象本身存储在堆中（灵活大小）
     │       └── 栈中存储指向堆中对象的指针（引用）
     ├── 垃圾回收机制（GC）：
     │   ├── 引用计数：对象被引用次数为 0 时回收
     │   │   └── 问题：循环引用导致内存泄漏
     │   └── 标记清除（现代浏览器）：
     │       ├── 1. 从根对象（window/global）出发
     │       ├── 2. 标记所有可达对象
     │       └── 3. 清除未标记对象（不可达）
     └── 内存泄漏常见场景：
         ├── 未清理的定时器/事件监听器
         ├── 闭包引用外部变量
         └── 全局变量累积

  2. 类型系统底层：
     ├── 动态类型：变量类型在运行时确定
     ├── 弱类型：允许隐式类型转换
     ├── 类型转换规则：
     │   ├── 隐式转换：
     │   │   ├── 字符串 + 数字 → 字符串拼接
     │   │   ├── 布尔值 + 数字 → 数字运算
     │   │   └── null/undefined → 0/NaN
     │   └── 显式转换：
     │       ├── Number()/String()/Boolean()
     │       └── parseInt()/parseFloat()
     └── typeof 的底层实现：
         ├── 检查对象内部的 [[Type]] 内部槽
         └── 返回类型字符串（'object'/'function'/'string'...）

  3. 相等性比较算法：
     ├── ==（宽松相等）：
     │   ├── 允许类型转换
     │   ├── 比较规则复杂（参考 ES6 抽象相等比较算法）
     │   └── 不推荐（容易出错）
     ├── ===（严格相等）：
     │   ├── 不进行类型转换
     │   ├── 类型不同直接返回 false
     │   └── 推荐（行为可预测）
     └── Object.is()：
         ├── 与 === 类似
         └── 特殊处理：NaN === NaN 为 true，-0 === +0 为 false

  4. 解构赋值的底层机制：
     ├── 迭代器协议（Iterator Protocol）：
     │   ├── 对象必须实现 [Symbol.iterator]() 方法
     │   ├── 返回 { value, done } 对象
     │   └── 数组/字符串/Map/Set 默认实现
     ├── 解构过程：
     │   ├── 1. 调用迭代器的 next() 方法
     │   ├── 2. 获取 value 并赋值给对应变量
     │   └── 3. 重复直到 done 为 true
     └── 默认值机制：
         ├── 只有当值为 undefined 时才使用默认值
         └── null 不会触发默认值
```

---

## 常见面试题

### Q1: let、const、var 的区别？

**答**：

- `var`：函数作用域，有变量提升，可重复声明
- `let`：块级作用域，无变量提升，不可重复声明
- `const`：块级作用域，声明时必须赋值，不可重新赋值（但对象属性可改）

### Q2: `null` 和 `undefined` 的区别？

**答**：

- `undefined`：变量已声明但未赋值
- `null`：表示"空"，是人为赋的值
- `typeof null` 返回 `'object'`（历史 bug）
- `null == undefined` 为 `true`，`null === undefined` 为 `false`

### Q3: `==` 和 `===` 的区别？

**答**：

- `==`：宽松比较，会进行类型转换
- `===`：严格比较，不做类型转换
- 推荐始终使用 `===`

---

## 延伸练习

1. 写出 `typeof null`、`typeof []`、`typeof undefined` 的结果
2. 用 `??` 和 `||` 分别处理默认值，观察区别
3. 用解构赋值从对象和数组中提取值

---

## 参考资料

- [MDN JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
- [JavaScript 基础](https://javascript.info/types)
