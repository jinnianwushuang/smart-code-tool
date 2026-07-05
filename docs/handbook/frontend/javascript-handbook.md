# JavaScript 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-19  
> **适用对象**: JavaScript 开发人员、前端工程师、Node.js 开发者

---

## 📑 目录

- [一、基础语法](#一基础语法)
- [二、数据类型](#二数据类型)
- [三、运算符](#三运算符)
- [四、控制流](#四控制流)
- [五、函数](#五函数)
- [六、数组](#六数组)
- [七、对象](#七对象)
- [八、字符串](#八字符串)
- [九、ES6+ 新特性](#九es6-新特性)
- [十、异步编程](#十异步编程)
- [十一、事件循环](#十一事件循环)
- [十二、原型和继承](#十二原型和继承)
- [十三、DOM 操作](#十三dom-操作)
- [十四、事件处理](#十四事件处理)
- [十五、存储 API](#十五存储-api)
- [十六、模块化](#十六模块化)
- [十七、正则表达式](#十七正则表达式)
- [十八、JSON](#十八json)
- [十九、类型转换](#十九类型转换)
- [二十、错误处理](#二十错误处理)
- [二十一、解构赋值](#二十一解构赋值)
- [二十二、扩展运算符](#二十二扩展运算符)
- [二十三、Map 和 Set](#二十三map-和-set)
- [二十四、WeakMap 和 WeakSet](#二十四weakmap-和-weakset)
- [二十五、Symbol](#二十五symbol)
- [二十六、代理和反射](#二十六代理和反射)
- [二十七、迭代和生成器](#二十七迭代和生成器)
- [二十八、实验性语法](#二十八实验性语法)
- [二十九、性能优化](#二十九性能优化)
- [三十、调试技巧](#三十调试技巧)
- [三十一、设计模式](#三十一设计模式)
- [三十二、最佳实践](#三十二最佳实践)
- [三十三、实用工具函数](#三十三实用工具函数)

---

## 一、基础语法

### 1.1 变量声明

```javascript
// var (函数作用域，不推荐)
var name = 'Alice'

// let (块级作用域，推荐)
let age = 25
age = 26 // 可以重新赋值

// const (块级作用域，常量，推荐)
const PI = 3.14159
// PI = 3.14; // Error! 不能重新赋值

// 解构赋值
const [a, b] = [1, 2]
const { name, age } = { name: 'Bob', age: 30 }
```

### 1.2 注释

```javascript
// 单行注释

/* 
   多行注释
   多行注释
*/

/**
 * JSDoc 注释
 * @param {string} name - 用户名
 * @returns {string} 问候语
 */
function greet(name) {
  return `Hello, ${name}`
}
```

### 1.3 严格模式

```javascript
'use strict'

// 或在函数内部
function myFunction() {
  'use strict'
  // 代码
}
```

---

## 二、数据类型

### 2.1 基本类型

```javascript
// 7 种基本类型
let str = 'Hello' // String
let num = 42 // Number
let bigInt = 9007199254740991n // BigInt
let bool = true // Boolean
let undef = undefined // Undefined
let nul = null // Null
let sym = Symbol('id') // Symbol

// 类型检查
typeof 'Hello' // "string"
typeof 42 // "number"
typeof true // "boolean"
typeof undefined // "undefined"
typeof null // "object" (历史遗留问题)
typeof Symbol() // "symbol"
typeof 9007199254740991n // "bigint"

// 引用类型
typeof {} // "object"
typeof [] // "object"
typeof function () {} // "function"
```

### 2.2 类型转换

```javascript
// 转为字符串
String(123) // "123"
;(123).toString() // "123"
;`${123}` // "123"

// 转为数字
Number('123') // 123
parseInt('123') // 123
parseFloat('123.45') // 123.45
;+'123' // 123

// 转为布尔值
Boolean('') // false
Boolean(0) // false
Boolean(null) // false
Boolean(undefined) // false
Boolean(NaN) // false
Boolean('hello') // true
Boolean(1) // true
```

### 2.3 真假值 (Falsy Values)

```javascript
// 以下值为 falsy
false
0 - 0
0n
;('')
null
undefined
NaN

// 其他所有值都是 truthy
```

---

## 三、运算符

### 3.1 算术运算符

```javascript
+    // 加法
-    // 减法
*    // 乘法
/    // 除法
%    // 取模
**   // 幂运算
++   // 自增
--   // 自减
```

### 3.2 比较运算符

```javascript
==   // 相等（类型转换）
===  // 严格相等（推荐）
!=   // 不等
!==  // 严格不等（推荐）
>    // 大于
<    // 小于
>=   // 大于等于
<=   // 小于等于
```

### 3.3 逻辑运算符

```javascript
&&   // 与
||   // 或
!    // 非
??   // 空值合并运算符
```

### 3.4 三元运算符

```javascript
const status = age >= 18 ? 'adult' : 'minor'
```

### 3.5 可选链和空值合并

```javascript
// 可选链 (?.)
const name = user?.profile?.name

// 空值合并 (??)
const value = input ?? 'default' // 仅在 null/undefined 时使用默认值

// 与 || 的区别
0 || 'default' // "default"
0 ?? 'default' // 0
```

---

## 四、控制流

### 4.1 条件语句

```javascript
// if-else
if (condition) {
  // code
} else if (anotherCondition) {
  // code
} else {
  // code
}

// switch
switch (value) {
  case 1:
    console.log('One')
    break
  case 2:
    console.log('Two')
    break
  default:
    console.log('Other')
}
```

### 4.2 循环

```javascript
// for 循环
for (let i = 0; i < 10; i++) {
  console.log(i)
}

// for...of (遍历可迭代对象)
for (const item of array) {
  console.log(item)
}

// for...in (遍历对象属性)
for (const key in object) {
  console.log(key, object[key])
}

// while 循环
while (condition) {
  // code
}

// do...while 循环
do {
  // code
} while (condition)
```

### 4.3 循环控制

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) continue // 跳过本次循环
  if (i === 8) break // 跳出循环
  console.log(i)
}
```

---

## 五、函数

### 5.1 函数声明

```javascript
// 函数声明
function add(a, b) {
  return a + b
}

// 函数表达式
const add = function (a, b) {
  return a + b
}

// 箭头函数 (ES6)
const add = (a, b) => a + b

// 带函数体的箭头函数
const multiply = (a, b) => {
  return a * b
}
```

### 5.2 参数

```javascript
// 默认参数
function greet(name = 'Guest') {
  return `Hello, ${name}`
}

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0)
}

// 解构参数
function displayUser({ name, age }) {
  console.log(`${name}, ${age}`)
}
```

### 5.3 闭包

```javascript
function createCounter() {
  let count = 0
  return function () {
    count++
    return count
  }
}

const counter = createCounter()
counter() // 1
counter() // 2
```

### 5.4 高阶函数

```javascript
// 函数作为参数
function execute(fn, value) {
  return fn(value)
}

execute((x) => x * 2, 5) // 10

// 函数返回函数
function multiplier(factor) {
  return function (number) {
    return number * factor
  }
}

const double = multiplier(2)
double(5) // 10
```

### 5.5 this 绑定

```javascript
const obj = {
  name: 'Alice',
  greet: function () {
    console.log(`Hello, ${this.name}`)
  },
}

obj.greet()

// bind
const greet = obj.greet.bind(obj)

// call
obj.greet.call(obj)

// apply
obj.greet.apply(obj)

// 箭头函数（继承外层 this）
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name) // undefined (指向外层作用域)
  },
}
```

---

## 六、数组

### 6.1 创建数组

```javascript
const arr = [1, 2, 3]
const arr2 = new Array(1, 2, 3)
const arr3 = Array.from('hello') // ["h", "e", "l", "l", "o"]
const arr4 = Array.of(1, 2, 3)
```

### 6.2 访问和修改

```javascript
const arr = [1, 2, 3, 4, 5]

arr[0] // 1
arr[arr.length - 1] // 5
arr.at(-1) // 5 (ES2022)

arr.push(6) // 末尾添加
arr.pop() // 末尾删除
arr.unshift(0) // 开头添加
arr.shift() // 开头删除
```

### 6.3 数组方法

#### 遍历方法

```javascript
const arr = [1, 2, 3, 4, 5]

// forEach
arr.forEach((item, index) => {
  console.log(index, item)
})

// map (返回新数组)
const doubled = arr.map((x) => x * 2) // [2, 4, 6, 8, 10]

// filter (过滤)
const evens = arr.filter((x) => x % 2 === 0) // [2, 4]

// reduce (归约)
const sum = arr.reduce((acc, curr) => acc + curr, 0) // 15

// find (查找第一个匹配)
const found = arr.find((x) => x > 3) // 4

// findIndex (查找索引)
const index = arr.findIndex((x) => x > 3) // 3

// some (是否存在)
const hasEven = arr.some((x) => x % 2 === 0) // true

// every (是否全部)
const allPositive = arr.every((x) => x > 0) // true
```

#### 转换方法

```javascript
// join
arr.join('-') // "1-2-3-4-5"

// slice (截取，不修改原数组)
arr.slice(1, 3) // [2, 3]

// splice (修改原数组)
arr.splice(1, 2) // 从索引1开始删除2个元素

// concat (合并)
;[1, 2].concat([3, 4]) // [1, 2, 3, 4]

// flat (扁平化)
;[1, [2, [3]]].flat(2) // [1, 2, 3]

// flatMap
;[1, 2, 3].flatMap((x) => [x, x * 2]) // [1, 2, 2, 4, 3, 6]
```

#### 排序和搜索

```javascript
// sort
arr.sort((a, b) => a - b) // 升序
arr.sort((a, b) => b - a) // 降序

// reverse
arr.reverse()

// indexOf
arr.indexOf(3) // 2

// includes
arr.includes(3) // true
```

### 6.4 展开运算符

```javascript
// 复制数组
const copy = [...arr]

// 合并数组
const merged = [...arr1, ...arr2]

// 函数参数
Math.max(...[1, 2, 3]) // 3
```

---

## 七、对象

### 7.1 创建对象

```javascript
// 对象字面量
const obj = {
  name: 'Alice',
  age: 25,
}

// 构造函数
const obj2 = new Object()

// Object.create
const obj3 = Object.create(null)
```

### 7.2 访问属性

```javascript
obj.name // "Alice"
obj['name'] // "Alice"

// 可选链
obj?.address?.city

// 设置属性
obj.email = 'alice@example.com'
obj['phone'] = '123456'
```

### 7.3 对象方法

```javascript
// 获取键/值/ entries
Object.keys(obj) // ["name", "age"]
Object.values(obj) // ["Alice", 25]
Object.entries(obj) // [["name", "Alice"], ["age", 25]]

// 合并对象
const merged = { ...obj1, ...obj2 }
const merged2 = Object.assign({}, obj1, obj2)

// 冻结对象
Object.freeze(obj)

// 密封对象
Object.seal(obj)

// 防止扩展
Object.preventExtensions(obj)
```

### 7.4 解构赋值

```javascript
const { name, age } = obj
const { name: userName, age: userAge } = obj

// 默认值
const { name = 'Guest' } = obj

// 剩余属性
const { name, ...rest } = obj
```

### 7.5 遍历对象

```javascript
// for...in
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key])
  }
}

// Object.keys
Object.keys(obj).forEach((key) => {
  console.log(key, obj[key])
})

// Object.entries
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}
```

### 7.6 Map 和 Set

```javascript
// Map
const map = new Map()
map.set('key', 'value')
map.get('key')
map.has('key')
map.delete('key')
map.size

// Set
const set = new Set([1, 2, 3])
set.add(4)
set.has(3)
set.delete(2)
set.size
```

---

## 八、字符串

### 8.1 字符串方法

```javascript
const str = 'Hello World'

// 长度
str.length // 11

// 查找
str.indexOf('World') // 6
str.includes('World') // true
str.startsWith('Hello') // true
str.endsWith('World') // true

// 提取
str.slice(0, 5) // "Hello"
str.substring(0, 5) // "Hello"
str.substr(0, 5) // "Hello" (已废弃)

// 替换
str.replace('World', 'JS') // "Hello JS"
str.replaceAll('l', 'L') // "HeLLo WorLd"

// 分割和连接
str.split(' ') // ["Hello", "World"]
;['Hello', 'World'].join(' ') // "Hello World"

// 大小写
str.toLowerCase() // "hello world"
str.toUpperCase() // "HELLO WORLD"

// 去除空格
'  hello  '.trim() // "hello"
'  hello  '.trimStart() // "hello  "
'  hello  '.trimEnd() // "  hello"

// 重复
'ha'.repeat(3) // "hahaha"

// 填充
'5'.padStart(3, '0') // "005"
'5'.padEnd(3, '0') // "500"
```

### 8.2 模板字符串

```javascript
const name = 'Alice'
const age = 25

// 基本用法
const greeting = `Hello, ${name}!`

// 多行字符串
const multiline = `
    Line 1
    Line 2
`

// 表达式
const result = `Sum: ${2 + 2}`

// 标签模板
function tag(strings, ...values) {
  console.log(strings, values)
}
tag`Hello ${name}`
```

---

## 九、ES6+ 新特性

### 9.1 let 和 const

```javascript
// 见第一章
```

### 9.2 箭头函数

```javascript
// 见第五章
```

### 9.3 类和继承

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} makes a noise`
  }

  // 静态方法
  static create(name) {
    return new Animal(name)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)
    this.breed = breed
  }

  speak() {
    return `${this.name} barks`
  }
}

const dog = new Dog('Rex', 'Labrador')
dog.speak() // "Rex barks"
```

### 9.4 Promise

```javascript
// 见第十章
```

### 9.5 async/await

```javascript
// 见第十章
```

### 9.6 模块系统

```javascript
// 见第十三章
```

### 9.7 解构赋值

```javascript
// 见第六章和第七章
```

### 9.8 展开和剩余运算符

```javascript
// 展开
const arr = [1, 2, 3]
const newArr = [...arr, 4, 5]

const obj = { a: 1, b: 2 }
const newObj = { ...obj, c: 3 }

// 剩余
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0)
}

const { a, ...rest } = { a: 1, b: 2, c: 3 }
```

### 9.9 可选链和空值合并

```javascript
// 见第三章
```

### 9.10 其他新特性

```javascript
// BigInt
const big = 9007199254740991n

// Symbol
const id = Symbol('id')

// WeakMap / WeakSet
const weakMap = new WeakMap()

// Proxy
const proxy = new Proxy(target, handler)

// Reflect
Reflect.get(obj, 'key')

// Intl API
new Intl.DateTimeFormat('en-US').format(new Date())
```

---

## 十、异步编程

### 10.1 Callback

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, 'data')
  }, 1000)
}

fetchData((err, data) => {
  if (err) {
    console.error(err)
  } else {
    console.log(data)
  }
})
```

### 10.2 Promise

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
    // reject("error");
  }, 1000)
})

// 使用 Promise
promise
  .then((result) => {
    console.log(result)
    return 'next'
  })
  .then((result) => {
    console.log(result)
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    console.log('done')
  })

// Promise 方法
Promise.all([p1, p2, p3]) // 全部成功
Promise.allSettled([p1, p2, p3]) // 等待全部完成
Promise.race([p1, p2, p3]) // 第一个完成
Promise.any([p1, p2, p3]) // 第一个成功
```

### 10.3 async/await

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

// 并行执行
async function fetchMultiple() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then((r) => r.json()),
    fetch('/api/posts').then((r) => r.json()),
  ])
  return { users, posts }
}
```

### 10.4 Fetch API

```javascript
// GET 请求
fetch('https://api.example.com/data')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network error')
    }
    return response.json()
  })
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

// POST 请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Alice' }),
})

// async/await
async function postData() {
  const response = await fetch('https://api.example.com/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice' }),
  })
  return response.json()
}
```

---

## 十一、事件循环

### 11.1 宏任务 vs 微任务

- **宏任务**: `setTimeout`, `setInterval`, `setImmediate`
- **微任务**: `Promise`, `queueMicrotask`, `MutationObserver`

### 11.2 执行顺序示例

```javascript
console.log('Script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

Promise.resolve()
  .then(() => {
    console.log('Promise 1')
  })
  .then(() => {
    console.log('Promise 2')
  })

console.log('Script end')

// 输出顺序:
// Script start
// Script end
// Promise 1
// Promise 2
// setTimeout
```

---

## 十二、原型和继承

### 12.1 原型链

```javascript
function Animal(name) {
  this.name = name
}

Animal.prototype.move = function () {
  console.log(`${this.name} is moving`)
}

function Dog(name, breed) {
  Animal.call(this, name) // 调用父构造函数
  this.breed = breed
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog

Dog.prototype.bark = function () {
  console.log(`${this.name} is barking`)
}

const dog = new Dog('Buddy', 'Golden Retriever')
dog.move() // Buddy is moving
dog.bark() // Buddy is barking
```

### 12.2 检查原型

```javascript
dog instanceof Dog // true
dog instanceof Animal // true
Object.getPrototypeOf(dog) === Dog.prototype // true
```

---

## 十三、DOM 操作

### 11.1 选择元素

```javascript
// 单个元素
document.getElementById('id')
document.querySelector('.class')
document.querySelector('#id')

// 多个元素
document.getElementsByClassName('class')
document.getElementsByTagName('div')
document.querySelectorAll('.class')
```

### 11.2 创建和修改元素

```javascript
// 创建元素
const div = document.createElement('div')
div.className = 'container'
div.textContent = 'Hello'
div.innerHTML = '<p>Hello</p>'

// 添加元素
parent.appendChild(child)
parent.insertBefore(newChild, referenceChild)

// 移除元素
parent.removeChild(child)
child.remove()

// 替换元素
parent.replaceChild(newChild, oldChild)
```

### 11.3 属性操作

```javascript
// 获取/设置属性
element.getAttribute('id')
element.setAttribute('id', 'new-id')
element.removeAttribute('id')

// 类名操作
element.classList.add('active')
element.classList.remove('active')
element.classList.toggle('active')
element.classList.contains('active')

// 样式操作
element.style.color = 'red'
element.style.cssText = 'color: red; font-size: 16px;'
```

### 11.4 遍历 DOM

```javascript
// 父节点
element.parentNode
element.parentElement

// 子节点
element.childNodes
element.children
element.firstChild
element.lastChild
element.firstElementChild
element.lastElementChild

// 兄弟节点
element.nextSibling
element.previousSibling
element.nextElementSibling
element.previousElementSibling
```

### 11.5 位置和尺寸

```javascript
// 位置
element.offsetTop
element.offsetLeft
element.getBoundingClientRect()

// 尺寸
element.offsetWidth
element.offsetHeight
element.clientWidth
element.clientHeight

// 滚动
element.scrollTop
element.scrollLeft
element.scrollHeight
element.scrollWidth
element.scrollTo(0, 100)
element.scrollIntoView()
```

---

## 十四、事件处理

### 12.1 事件监听

```javascript
// 添加事件监听器
element.addEventListener('click', handler)
element.addEventListener('click', handler, { once: true })

// 移除事件监听器
element.removeEventListener('click', handler)

// 事件处理器
function handler(event) {
  console.log(event.type)
  console.log(event.target)
  event.preventDefault()
  event.stopPropagation()
}
```

### 12.2 常见事件

```javascript
// 鼠标事件
;(click, dblclick, mousedown, mouseup)
;(mouseover, mouseout, mousemove)

// 键盘事件
;(keydown, keyup, keypress)

// 表单事件
;(submit, change, input, focus, blur)

// 文档事件
;(load, DOMContentLoaded, unload)

// 触摸事件
;(touchstart, touchmove, touchend)
```

### 12.3 事件对象

```javascript
element.addEventListener('click', (event) => {
  event.target // 触发事件的元素
  event.currentTarget // 绑定事件的元素
  event.type // 事件类型
  event.preventDefault() // 阻止默认行为
  event.stopPropagation() // 阻止冒泡
  event.stopImmediatePropagation() // 阻止其他监听器
})
```

### 12.4 事件委托

```javascript
// 利用事件冒泡
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('li')) {
    console.log('Clicked:', e.target.textContent)
  }
})
```

---

## 十五、存储 API

### 15.1 LocalStorage (永久存储)

```javascript
localStorage.setItem('key', 'value')
localStorage.getItem('key') // 'value'
localStorage.removeItem('key')
localStorage.clear() // 清空所有
```

### 15.2 SessionStorage (会话存储)

```javascript
sessionStorage.setItem('key', 'value')
sessionStorage.getItem('key')
```

### 15.3 Cookie

```javascript
document.cookie = 'name=value; path=/; expires=' + new Date(2026, 6, 5)
document.cookie = 'name=value; path=/; max-age=3600' // 1小时
```

---

## 十六、模块化

### 13.1 ES Modules

```javascript
// export
export const PI = 3.14
export function add(a, b) {
  return a + b
}
export default class Calculator {}

// 或者
const PI = 3.14
function add(a, b) {
  return a + b
}
export { PI, add }

// import
import Calculator from './calculator.js'
import { PI, add } from './math.js'
import * as Math from './math.js'

// 动态导入
const module = await import('./module.js')
```

### 13.2 CommonJS (Node.js)

```javascript
// exports
module.exports = { add, subtract }
exports.PI = 3.14

// require
const math = require('./math')
const { add, subtract } = require('./math')
```

---

## 十八、JSON

### 18.1 序列化和反序列化

```javascript
const obj = { name: 'John', age: 30, active: true }
const jsonStr = JSON.stringify(obj)
const parsed = JSON.parse(jsonStr)
```

### 18.2 自定义转换

```javascript
// 自定义序列化
JSON.stringify(obj, (key, value) => {
  if (typeof value === 'number') {
    return value * 2
  }
  return value
})

// 自定义反序列化
JSON.parse(jsonStr, (key, value) => {
  if (key === 'age') {
    return value + 1
  }
  return value
})
```

### 18.3 格式化输出

```javascript
JSON.stringify(obj, null, 2) // 美化输出

// 过滤函数属性
JSON.stringify(obj, (key, value) => {
  if (typeof value === 'function') {
    return undefined
  }
  return value
})
```

---

## 十九、类型转换

### 19.1 显式转换

```javascript
String(123) // '123'
Number('123') // 123
Boolean(1) // true
parseInt('123') // 123
parseFloat('123.45') // 123.45
```

### 19.2 隐式转换

```javascript
123 + '' // '123'
'123' - 0 // 123
!0 // true
!!1 // true
```

### 19.3 相等比较

```javascript
0 == false // true (宽松)
0 === false // false (严格)
null == undefined // true (宽松)
null === undefined // false (严格)
```

---

## 二十、错误处理

### 14.1 try-catch

```javascript
try {
  // 可能抛出错误的代码
  throw new Error('Something went wrong')
} catch (error) {
  console.error(error.message)
  console.error(error.stack)
} finally {
  // 总是执行
  console.log('Cleanup')
}
```

### 14.2 错误类型

```javascript
// 内置错误类型
Error
SyntaxError
TypeError
ReferenceError
RangeError
URIError
EvalError

// 自定义错误
class CustomError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'CustomError'
    this.code = code
  }
}

throw new CustomError('Invalid input', 400)
```

### 14.3 全局错误处理

```javascript
// 浏览器
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', error)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason)
})

// Node.js
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason)
})
```

---

## 十七、正则表达式

### 15.1 创建正则

```javascript
// 字面量
const regex = /pattern/flags;

// 构造函数
const regex = new RegExp("pattern", "flags");
```

### 15.2 标志

```javascript
g // 全局匹配
i // 忽略大小写
m // 多行模式
s // dotall 模式
u // Unicode
y // sticky
```

### 15.3 常用方法

```javascript
const regex = /\d+/g
const str = 'There are 123 apples and 456 oranges'

// test
regex.test(str) // true

// exec
regex.exec(str) // ["123"]

// match
str.match(/\d+/g) // ["123", "456"]

// matchAll
;[...str.matchAll(/\d+/g)]

// replace
str.replace(/\d+/g, 'NUM')

// search
str.search(/\d+/) // 10

// split
str.split(/\s+/)
```

### 15.4 常用模式

```javascript
\d      // 数字
\D      // 非数字
\w      // 单词字符
\W      // 非单词字符
\s      // 空白字符
\S      // 非空白字符
.       // 任意字符
^       // 开头
$       // 结尾
*       // 0或多次
+       // 1或多次
?       // 0或1次
{n}     // n次
{n,}    // 至少n次
{n,m}   // n到m次
[]      // 字符类
[^]     // 否定字符类
()      // 分组
|       // 或
```

### 15.5 示例

```javascript
// 邮箱验证
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// URL 验证
const urlRegex = /^https?:\/\/[^\s]+$/

// 电话号码
const phoneRegex = /^\d{3}-\d{3}-\d{4}$/

// 提取 HTML 标签
const tagRegex = /<([^>]+)>/g
```

---

## 十六、常用 API

### 16.1 Console

```javascript
console.log('log')
console.info('info')
console.warn('warn')
console.error('error')
console.debug('debug')

console.table([{ a: 1 }, { a: 2 }])
console.time('timer')
console.timeEnd('timer')
console.trace()
console.assert(condition, 'message')
```

### 16.2 JSON

```javascript
// 序列化
JSON.stringify({ name: 'Alice' })

// 反序列化
JSON.parse('{"name":"Alice"}')

// 格式化
JSON.stringify(obj, null, 2)

// 自定义序列化
JSON.stringify(obj, (key, value) => {
  if (typeof value === 'function') {
    return undefined
  }
  return value
})
```

### 16.3 Math

```javascript
Math.abs(-5) // 5
Math.ceil(4.2) // 5
Math.floor(4.8) // 4
Math.round(4.5) // 5
Math.max(1, 2, 3) // 3
Math.min(1, 2, 3) // 1
Math.random() // 0-1 随机数
Math.pow(2, 3) // 8
Math.sqrt(16) // 4
Math.PI // 3.14159...
```

### 16.4 Date

```javascript
const now = new Date()
const date = new Date(2024, 0, 15)

// 获取
date.getFullYear()
date.getMonth() // 0-11
date.getDate() // 1-31
date.getDay() // 0-6
date.getHours()
date.getMinutes()
date.getSeconds()

// 设置
date.setFullYear(2025)
date.setMonth(0)
date.setDate(1)

// 格式化
date.toISOString()
date.toLocaleDateString()
date.toLocaleTimeString()

// 时间戳
Date.now()
date.getTime()
```

### 16.5 localStorage 和 sessionStorage

```javascript
// localStorage (持久化)
localStorage.setItem('key', 'value')
localStorage.getItem('key')
localStorage.removeItem('key')
localStorage.clear()

// sessionStorage (会话级)
sessionStorage.setItem('key', 'value')
sessionStorage.getItem('key')
sessionStorage.removeItem('key')
sessionStorage.clear()
```

### 16.6 URL

```javascript
const url = new URL('https://example.com/path?query=value')

url.href
url.protocol
url.host
url.pathname
url.search
url.hash
url.searchParams.get('query')
url.searchParams.set('key', 'value')
url.searchParams.append('key', 'value2')
```

---

## 二十一、解构赋值

### 21.1 数组解构

```javascript
const [a, b, c] = [1, 2, 3]
const [x, , z] = [1, 2, 3] // 跳过第二个
const [first, ...rest] = [1, 2, 3, 4] // first=1, rest=[2,3,4]
const [d = 10] = [] // 默认值
```

### 21.2 对象解构

```javascript
const { name: personName, age: personAge } = { name: 'John', age: 30 }
const { name = 'Guest', email = 'no-email' } = obj
const { x: coords_x, y: coords_y } = { x: 10, y: 20 }
```

### 21.3 嵌套解构

```javascript
const {
  address: { city },
} = person
```

### 21.4 函数参数解构

```javascript
function printPerson({ name, age }) {
  console.log(`${name} is ${age} years old`)
}
```

---

## 二十二、扩展运算符

### 22.1 数组展开

```javascript
const arr1 = [1, 2, 3]
const arr2 = [0, ...arr1, 4] // [0, 1, 2, 3, 4]
```

### 22.2 对象展开

```javascript
const obj_a = { a: 1, b: 2 }
const obj_b = { ...obj_a, c: 3 } // { a: 1, b: 2, c: 3 }
```

### 22.3 函数参数

```javascript
const numbers = [1, 2, 3]
Math.max(...numbers) // 3
```

---

## 二十三、Map 和 Set

### 23.1 Map

```javascript
// 键值对集合，键可以是任意类型
const map = new Map()
map.set('key1', 'value1')
map.set(42, 'value2')
map.get('key1') // 'value1'
map.size // 2
map.has('key1') // true
map.delete('key1')
map.clear()

for (const [key, value] of map) {
  console.log(key, value)
}
```

### 23.2 Set

```javascript
// 唯一值集合
const set = new Set([1, 2, 2, 3, 3, 3])
set.size // 3
set.add(4)
set.has(2) // true
set.delete(2)
set.clear()

for (const value of set) {
  console.log(value) // 1, 3, 4
}

// 数组去重
const unique = [...new Set([1, 2, 2, 3, 3, 3])] // [1, 2, 3]
```

---

## 二十四、WeakMap 和 WeakSet

### 24.1 WeakMap

```javascript
// 键只能是对象，垃圾回收安全
const wm = new WeakMap()
const key1 = { id: 1 }

wm.set(key1, 'value')
wm.get(key1) // 'value'
wm.has(key1) // true
wm.delete(key1) // true
```

### 24.2 WeakSet

```javascript
// 值只能是对象
const ws = new WeakSet()
const obj = { id: 1 }

ws.add(obj)
ws.has(obj) // true
ws.delete(obj) // true
```

---

## 二十五、Symbol

### 25.1 基本用法

```javascript
const sym1 = Symbol('description')
const sym2 = Symbol('description')
sym1 === sym2 // false (每个 Symbol 都是唯一的)
```

### 25.2 全局 Symbol 注册表

```javascript
const globalSym = Symbol.for('app.id')
const sameSym = Symbol.for('app.id')
globalSym === sameSym // true
```

### 25.3 对象属性名

```javascript
const obj = {}
obj[sym1] = 'value1'
obj[sym2] = 'value2'

Object.keys(obj) // [] (Symbol 属性不被枚举)
Object.getOwnPropertySymbols(obj) // [sym1, sym2]
```

### 25.4 常见 Symbol

```javascript
Symbol.iterator // 可迭代协议
Symbol.asyncIterator // 异步可迭代
Symbol.hasInstance // instanceof 行为
Symbol.toStringTag // Object.prototype.toString
```

---

## 二十六、代理和反射

### 26.1 Proxy

```javascript
const target = { name: 'John', age: 30 }

const handler = {
  get(target, property) {
    console.log(`Getting ${property}`)
    return target[property]
  },
  set(target, property, value) {
    console.log(`Setting ${property} to ${value}`)
    target[property] = value
    return true
  },
}

const proxy = new Proxy(target, handler)
proxy.name // 'Getting name', 'John'
proxy.age = 31 // 'Setting age to 31'
```

### 26.2 Reflect API

```javascript
Reflect.get(target, 'name') // 'John'
Reflect.set(target, 'age', 32) // true
Reflect.has(target, 'name') // true
Reflect.ownKeys(target) // ['name', 'age']
```

---

## 二十七、迭代和生成器

### 27.1 可迭代协议

```javascript
const iterable = {
  [Symbol.iterator]() {
    let count = 0
    return {
      next: () => ({
        value: count++,
        done: count > 3,
      }),
    }
  },
}

for (const value of iterable) {
  console.log(value) // 0, 1, 2
}
```

### 27.2 Generator 函数

```javascript
function* generator() {
  yield 1
  yield 2
  yield 3
}

const gen = generator()
gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
gen.next() // { value: 3, done: false }
gen.next() // { value: undefined, done: true }

for (const value of generator()) {
  console.log(value) // 1, 2, 3
}
```

---

## 二十八、实验性语法

### 28.1 装饰器 (Decorators) - Stage 3

```javascript
// 类装饰器
function logged(target) {
  console.log(`Class ${target.name} is being instantiated`)
  return target
}

@logged
class UserService {
  constructor(name) {
    this.name = name
  }
}

// 方法装饰器
function deprecated(target, context) {
  if (context.kind === 'method') {
    return function (...args) {
      console.warn(`Method ${String(context.name)} is deprecated`)
      return target.call(this, ...args)
    }
  }
}

class ApiClient {
  @deprecated
  oldMethod() {
    return 'old implementation'
  }

  newMethod() {
    return 'new implementation'
  }
}

// 属性装饰器
function readonly(target, context) {
  if (context.kind === 'field') {
    return function (initialValue) {
      Object.defineProperty(this, context.name, {
        value: initialValue,
        writable: false,
        enumerable: true,
        configurable: true,
      })
    }
  }
}

class User {
  @readonly
  id = 123

  constructor(name) {
    this.name = name
  }
}

const user = new User('Alice')
user.id // 123
// user.id = 456; // Error! Cannot assign to read only property

// 存取器装饰器 (getter/setter)
function logAccess(target, context) {
  if (context.kind === 'accessor') {
    const { get, set } = target
    return {
      get() {
        console.log(`Getting ${String(context.name)}`)
        return get.call(this)
      },
      set(value) {
        console.log(`Setting ${String(context.name)} to`, value)
        set.call(this, value)
      },
    }
  }
}

class BankAccount {
  #balance = 0

  @logAccess
  get balance() {
    return this.#balance
  }

  @logAccess
  set balance(value) {
    if (value < 0) {
      throw new Error('Balance cannot be negative')
    }
    this.#balance = value
  }
}

const account = new BankAccount()
account.balance = 1000 // "Setting balance to 1000"
console.log(account.balance) // "Getting balance", 1000

// addInitializer - 在类实例化时执行初始化逻辑
function validate(target, context) {
  if (context.kind === 'class') {
    context.addInitializer(function () {
      console.log(`Initializing ${this.constructor.name}`)
      // 可以在这里进行实例级别的验证或设置
      if (!this.validate) {
        this.validate = function () {
          return true
        }
      }
    })
  }
}

@validate
class Product {
  constructor(name, price) {
    this.name = name
    this.price = price
  }

  validate() {
    return this.price > 0 && this.name.length > 0
  }
}

const product = new Product('Laptop', 999)
product.validate() // true

// 属性装饰器中使用 addInitializer
function bound(target, context) {
  if (context.kind === 'method' || context.kind === 'getter' || context.kind === 'setter') {
    context.addInitializer(function () {
      // 将方法绑定到当前实例
      this[context.name] = this[context.name].bind(this)
    })
  }
}

class EventHandler {
  constructor() {
    this.message = 'Hello'
  }

  @bound
  handleClick() {
    console.log(this.message)
  }
}

const handler = new EventHandler()
const button = { onclick: handler.handleClick }
button.onclick() // "Hello" (this 正确指向 handler 实例)
```

### 28.2 Array Grouping - ECMAScript 2024

```javascript
const people = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 },
  { name: 'David', age: 30 },
]

// Object.groupBy
const groupedByAge = Object.groupBy(people, (person) => person.age)
// {
//   25: [{name: 'Alice', age: 25}, {name: 'Charlie', age: 25}],
//   30: [{name: 'Bob', age: 30}, {name: 'David', age: 30}]
// }

// Map.groupBy
const groupedMap = Map.groupBy(people, (person) => person.age)
```

### 28.3 Change Array by Copy - ECMAScript 2023

```javascript
const original = [3, 1, 4, 1, 5, 9, 2, 6]

// 排序（不修改原数组）
const sorted = original.toSorted((a, b) => a - b)
// [1, 1, 2, 3, 4, 5, 6, 9]

// 反转（不修改原数组）
const reversed = original.toReversed()
// [6, 2, 9, 5, 1, 4, 1, 3]

// 拼接（不修改原数组）
const spliced = original.toSpliced(2, 3, 10, 20)
// [3, 1, 10, 20, 9, 2, 6]

// 替换元素（不修改原数组）
const replaced = original.with(0, 100)
// [100, 1, 4, 1, 5, 9, 2, 6]
```

### 28.4 Private Field Checks - ECMAScript 2022

```javascript
class SafeUser {
  #password

  constructor(password) {
    this.#password = password
  }

  // 检查对象是否有某个私有字段
  static isSafeUser(obj) {
    return #password in obj
  }

  verifyPassword(pwd) {
    if (!(#password in this)) {
      throw new Error('Invalid object')
    }
    return this.#password === pwd
  }
}

const user = new SafeUser('secret123')
SafeUser.isSafeUser(user) // true
SafeUser.isSafeUser({}) // false
```

### 28.5 Static Class Fields - ECMAScript 2022

```javascript
class MathUtils {
  // 静态字段
  static PI = 3.141592653589793
  static VERSION = '1.0.0'

  // 静态块 - 初始化静态字段
  static {
    console.log(`Initializing MathUtils v${this.VERSION}`)
    this.E = Math.E
  }

  // 静态方法
  static circleArea(radius) {
    return this.PI * radius ** 2
  }

  // 私有静态字段
  static #cache = new Map()

  static cachedCompute(key, fn) {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, fn())
    }
    return this.#cache.get(key)
  }
}

MathUtils.circleArea(5) // 78.53981633974483
```

### 其他实验性特性

- **Pipeline 操作符 (`|>`)** - Stage 2
- **Partial Application Syntax** - Stage 2
- **Record & Tuple** - Stage 2
- **Temporal API** - Stage 3
- **Import Attributes** - Stage 3
- **Top-level Await** - ECMAScript 2022

---

## 二十九、性能优化

### 17.1 防抖和节流

```javascript
// 防抖 (debounce)
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// 节流 (throttle)
function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 使用
window.addEventListener('resize', debounce(handleResize, 250))
window.addEventListener('scroll', throttle(handleScroll, 100))
```

### 17.2 内存管理

```javascript
// 避免内存泄漏
// 1. 及时清理事件监听器
element.removeEventListener('click', handler)

// 2. 清除定时器
clearInterval(timerId)
clearTimeout(timeoutId)

// 3. 避免闭包引用大对象
function createHandler() {
  const largeObject = {
    /* ... */
  }
  return function () {
    // 只使用需要的数据
    console.log(largeObject.key)
  }
}

// 4. 使用 WeakMap/WeakSet
const cache = new WeakMap()
```

### 17.3 性能监控

```javascript
// Performance API
performance.now()
performance.mark('start')
// ... code ...
performance.mark('end')
performance.measure('myMeasure', 'start', 'end')

// 获取性能指标
const measures = performance.getEntriesByType('measure')

// Navigation Timing
performance.navigation
performance.timing
```

### 17.4 代码分割

```javascript
// 动态导入实现懒加载
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js')
  module.doSomething()
})
```

---

## 三十、调试技巧

### 18.1 Console 调试

```javascript
// 基本输出
console.log('message')
console.table(array)
console.group('Group')
console.log('nested')
console.groupEnd()

// 条件输出
console.assert(condition, 'message')

// 计数
console.count('label')
console.countReset('label')

// 追踪
console.trace()
```

### 18.2 Debugger

```javascript
// 断点
debugger

// 条件断点
if (condition) debugger
```

### 18.3 浏览器 DevTools

```
快捷键:
- F12: 打开 DevTools
- Ctrl+Shift+C: 选择元素
- Ctrl+Shift+I: 控制台
- Ctrl+Shift+J: 控制台 (Chrome)
- Ctrl+Shift+K: 控制台 (Firefox)

功能:
- Elements: 查看和编辑 DOM/CSS
- Console: 执行 JavaScript
- Sources: 调试 JavaScript
- Network: 监控网络请求
- Performance: 性能分析
- Memory: 内存分析
- Application: 存储和缓存
```

### 18.4 性能分析

```javascript
// Console 性能面板
console.profile('myProfile')
// ... code ...
console.profileEnd('myProfile')

// Performance API
const start = performance.now()
// ... code ...
const end = performance.now()
console.log(`Elapsed: ${end - start}ms`)
```

---

## 三十一、设计模式

### 19.1 单例模式

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance
    }
    Singleton.instance = this
  }
}

const instance1 = new Singleton()
const instance2 = new Singleton()
instance1 === instance2 // true
```

### 19.2 工厂模式

```javascript
class Car {
  constructor(type) {
    this.type = type
  }
}

class CarFactory {
  static create(type) {
    return new Car(type)
  }
}

const car = CarFactory.create('sedan')
```

### 19.3 观察者模式

```javascript
class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args))
    }
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener)
    }
  }
}
```

### 19.4 模块模式

```javascript
const Module = (function () {
  let privateVar = 'private'

  function privateMethod() {
    return privateVar
  }

  return {
    publicMethod: function () {
      return privateMethod()
    },
  }
})()

Module.publicMethod() // "private"
```

### 19.5 发布-订阅模式

```javascript
class PubSub {
  constructor() {
    this.subscribers = {}
  }

  subscribe(topic, callback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = []
    }
    this.subscribers[topic].push(callback)

    return () => {
      this.subscribers[topic] = this.subscribers[topic].filter((cb) => cb !== callback)
    }
  }

  publish(topic, data) {
    if (this.subscribers[topic]) {
      this.subscribers[topic].forEach((callback) => callback(data))
    }
  }
}
```

---

## 三十二、最佳实践

### 20.1 代码规范

```javascript
// 使用 const 和 let，避免 var
const PI = 3.14
let count = 0

// 使用严格相等
if (value === 0) {
}

// 使用模板字符串
const greeting = `Hello, ${name}`

// 使用箭头函数
const add = (a, b) => a + b

// 使用解构
const { name, age } = user

// 使用展开运算符
const newArray = [...oldArray, newItem]

// 使用可选链
const city = user?.address?.city

// 使用空值合并
const value = input ?? 'default'
```

### 20.2 命名规范

```javascript
// 变量和函数：camelCase
const userName = 'Alice'
function getUser() {}

// 类：PascalCase
class UserProfile {}

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY = 3

// 私有变量：下划线前缀
const _privateVar = 'private'

// 布尔值：is/has/can 前缀
const isActive = true
const hasPermission = false
```

### 20.3 错误处理

```javascript
// 始终处理错误
try {
  const data = await fetchData()
} catch (error) {
  console.error('Failed to fetch:', error)
}

// 不要吞掉错误
try {
  // code
} catch (error) {
  // 记录或重新抛出
  logger.error(error)
  throw error
}

// 验证输入
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Arguments must be numbers')
  }
  if (b === 0) {
    throw new RangeError('Division by zero')
  }
  return a / b
}
```

### 20.4 性能建议

```javascript
// 使用 Map/Set 代替对象进行频繁查找
const map = new Map()
map.set(key, value)
map.has(key) // O(1)

// 避免在循环中进行 DOM 操作
const fragment = document.createDocumentFragment()
items.forEach((item) => {
  const li = document.createElement('li')
  li.textContent = item
  fragment.appendChild(li)
})
list.appendChild(fragment)

// 使用 requestAnimationFrame 进行动画
function animate() {
  // update
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

// 使用 Web Workers 进行重型计算
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.onmessage = (event) => {
  console.log(event.data)
}
```

### 32.5 安全建议

```javascript
// 避免 eval
// Bad
eval(userInput)

// Good
Function(userInput)()

// 防止 XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 使用 HTTPS
// 验证输入
// 使用 Content Security Policy
// 避免暴露敏感信息
```

---

## 三十三、实用工具函数

### 33.1 深拷贝

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) {
    const arr = []
    for (let i = 0; i < obj.length; i++) {
      arr[i] = deepClone(obj[i])
    }
    return arr
  }
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}
```

### 33.2 数组去重

```javascript
const removeDuplicates = (arr) => [...new Set(arr)]
```

### 33.3 数组扁平化

```javascript
const flatten = (arr) => arr.flat(Infinity)
```

### 33.4 嵌套属性访问

```javascript
const getNestedValue = (obj, path, defaultValue = null) => {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj)
  return value ?? defaultValue
}

// 使用示例
getNestedValue(user, 'address.city', 'Unknown')
```

### 33.5 延迟执行

```javascript
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 使用示例
await delay(1000) // 等待 1 秒
```

### 33.6 重试函数

```javascript
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await delay(delayMs * attempt)
    }
  }
}

// 使用示例
const result = await retry(() => fetchData(), 3, 1000)
```

### 33.7 链式 Promise

```javascript
function chain(...fns) {
  return (value) => fns.reduce((p, fn) => p.then(fn), Promise.resolve(value))
}

// 使用示例
const process = chain(
  (data) => data * 2,
  (data) => data + 10,
  (data) => Math.sqrt(data),
)
process(5) // Promise
```

### 33.8 管道组合

```javascript
function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x)
}

// 使用示例
const transform = pipe(
  (x) => x * 2,
  (x) => x + 10,
  (x) => x.toString(),
)
transform(5) // "20"
```

### 33.9 组合函数

```javascript
function compose(...fns) {
  return (x) => fns.reduceRight((v, f) => f(v), x)
}

// 使用示例
const transform = compose(
  (x) => x.toString(),
  (x) => x + 10,
  (x) => x * 2,
)
transform(5) // "20"
```

### 33.10 类型守卫

```javascript
function isString(value) {
  return typeof value === 'string'
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

function isArray(value) {
  return Array.isArray(value)
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
```

### 33.11 非空断言

```javascript
function nonNull(value, message = 'Value cannot be null or undefined') {
  if (value == null) {
    throw new Error(message)
  }
  return value
}

// 使用示例
const safeValue = nonNull(maybeNull, 'Value is required')
```

### 33.12 防抖 (Debounce)

```javascript
function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 使用示例
window.addEventListener('resize', debounce(handleResize, 250))
```

### 33.13 节流 (Throttle)

```javascript
function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 使用示例
window.addEventListener('scroll', throttle(handleScroll, 100))
```

### 33.14 批量更新 DOM

```javascript
function batchUpdateDOM(updates) {
  requestAnimationFrame(() => {
    updates.forEach((update) => update())
  })
}
```

### 33.15 惰性求值

```javascript
function lazy(fn) {
  let evaluated = false
  let value
  return () => {
    if (!evaluated) {
      value = fn()
      evaluated = true
    }
    return value
  }
}
```

### 33.16 缓存装饰器

```javascript
function cacheable(ttl = 60000) {
  const cache = new Map()
  return function (target, context) {
    if (context.kind === 'method') {
      return function (...args) {
        const key = JSON.stringify(args)
        const cached = cache.get(key)
        if (cached && Date.now() - cached.timestamp < ttl) {
          return cached.value
        }
        const result = target.call(this, ...args)
        cache.set(key, { value: result, timestamp: Date.now() })
        return result
      }
    }
  }
}
```

### 33.17 柯里化函数

```javascript
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args)
    } else {
      return (...nextArgs) => curried(...args, ...nextArgs)
    }
  }
}

const curriedAdd = curry((a, b, c) => a + b + c)
curriedAdd(1)(2)(3) // 6
```

### 33.18 记忆化（缓存结果）

```javascript
function memoize(fn) {
  const cache = {}
  return function (...args) {
    const key = JSON.stringify(args)
    if (key in cache) {
      return cache[key]
    }
    const result = fn(...args)
    cache[key] = result
    return result
  }
}
```

---

## 附录

### A. 常用工具库

```
HTTP 请求:
- Axios: https://axios-http.com/
- Fetch API: 内置

日期处理:
- Day.js: https://day.js.org/
- date-fns: https://date-fns.org/
- Moment.js: https://momentjs.com/ (维护模式)

工具函数:
- Lodash: https://lodash.com/
- Ramda: https://ramdajs.com/

状态管理:
- Redux: https://redux.js.org/
- Zustand: https://zustand-demo.pmnd.rs/
- Jotai: https://jotai.org/
```

### B. 有用的资源

- **MDN Web Docs**: https://developer.mozilla.org/
- **JavaScript.info**: https://javascript.info/
- **ECMAScript Spec**: https://tc39.es/ecma262/
- **Can I Use**: https://caniuse.com/
- **npm**: https://www.npmjs.com/

### C. 学习路线

```
基础 → DOM → 异步 → ES6+ → 框架 → Node.js → 工程化

1. JavaScript 基础语法
2. DOM 操作和事件
3. 异步编程 (Promise, async/await)
4. ES6+ 新特性
5. 前端框架 (React/Vue/Angular)
6. Node.js 后端开发
7. 构建工具 (Webpack/Vite)
8. 测试 (Jest/Mocha)
9. TypeScript
10. 性能优化和安全
```

---

**祝您 JavaScript 编程愉快！** ⚡

如有问题，请查阅 MDN 文档或社区论坛。
