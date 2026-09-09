---
title: '函数与作用域基础 [P4-P5]'
level: 'junior'
tags: ['JavaScript', '函数', '作用域', 'this', '箭头函数']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# 函数与作用域基础 [P4-P5]

> 函数是 JavaScript 的核心。理解函数声明、箭头函数、作用域和 this 指向是写出正确代码的关键。

## 核心概念（What）

### 函数定义方式

```javascript
// 1. 函数声明（有提升）
function add(a, b) {
  return a + b
}

// 2. 函数表达式（无提升）
const add = function (a, b) {
  return a + b
}

// 3. 箭头函数（简洁，无自己的 this）
const add = (a, b) => a + b

// 箭头函数简写
const double = (x) => x * 2 // 单参数省略括号
const greet = () => 'Hello' // 无参数
const log = (msg) => console.log(msg) // 单行返回省略 return 和 {}
```

### 参数与返回值

```javascript
// 默认参数
function greet(name = 'World') {
  return `Hello, ${name}!`
}
greet() // 'Hello, World!'
greet('Alice') // 'Hello, Alice!'

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0)
}
sum(1, 2, 3, 4) // 10

// 解构参数
function createUser({ name, age, role = 'user' }) {
  return { name, age, role }
}
createUser({ name: 'Alice', age: 25 })

// 返回值
// 没有 return 或 return 后无值 → 返回 undefined
function noReturn() {
  console.log('hello')
}
noReturn() // undefined
```

### 作用域

```javascript
// 全局作用域
const global = 'I am global'

function outer() {
  // 函数作用域
  const outerVar = 'I am outer'

  function inner() {
    // 可以访问外层变量（作用域链）
    console.log(global) // 'I am global'
    console.log(outerVar) // 'I am outer'
  }

  inner()
  // console.log(innerVar); // 报错！
}

// 块级作用域（let/const）
if (true) {
  let blockVar = 'I am block'
  const blockConst = 'I am block too'
}
// console.log(blockVar); // 报错！

// 作用域链：内层可以访问外层，外层不能访问内层
```

### this 指向

```javascript
// 规则：this 取决于函数如何被调用

// 1. 普通函数调用 → this 指向 window（严格模式 undefined）
function showThis() {
  console.log(this)
}
showThis() // window

// 2. 对象方法调用 → this 指向调用者
const user = {
  name: 'Alice',
  greet() {
    console.log(`Hi, I'm ${this.name}`)
  },
}
user.greet() // this → user

// 3. 箭头函数 → 没有自己的 this，继承外层
const counter = {
  count: 0,
  start() {
    // 箭头函数继承外层的 this
    setInterval(() => {
      this.count++
      console.log(this.count)
    }, 1000)
  },
}

// 4. 事件处理 → this 指向触发事件的元素
button.addEventListener('click', function () {
  this.style.color = 'red' // this → button
})

// 常见陷阱
const obj = {
  name: 'Alice',
  greet: () => {
    console.log(this.name) // this 是 window，不是 obj！
  },
}
```

---

## 常见面试题

### Q1: 箭头函数和普通函数的区别？

**答**：

- 箭头函数没有自己的 `this`（继承外层）
- 箭头函数不能用作构造函数（不能 `new`）
- 箭头函数没有 `arguments` 对象
- 箭头函数更简洁

### Q2: 如何改变 this 的指向？

**答**：

- `call(thisArg, arg1, arg2)`：立即调用
- `apply(thisArg, [args])`：立即调用，参数为数组
- `bind(thisArg)`：返回新函数，不立即调用
- 箭头函数：继承外层 this

### Q3: 什么是闭包？（简单版）

**答**：函数可以记住并访问它创建时的变量，即使函数在外部被调用。

---

## 延伸练习

1. 写一个箭头函数，接收数组返回其最大值
2. 解释代码中 `this` 的指向
3. 用 `bind` 改变函数的 `this` 指向

---

## 参考资料

- [MDN 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [this 关键字](https://javascript.info/object-methods)
