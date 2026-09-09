---
title: "闭包、作用域链与执行上下文 [P5-P6]"
level: "intermediate"
tags: ["JavaScript", "闭包", "作用域", "执行上下文", "this"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 闭包、作用域链与执行上下文 [P5-P6]

> 闭包是 JavaScript 的核心概念。理解执行上下文、作用域链和闭包，才能写出正确的代码。

## 核心概念（What）

### 执行上下文

```
执行上下文 = 代码执行的环境

三种上下文：
├── 全局上下文 → 程序启动时创建
├── 函数上下文 → 函数调用时创建
└── eval 上下文 → eval() 中（不推荐）

创建过程：
├── 1. 创建阶段（进入函数时）
│   ├── 创建变量对象（VO）
│   ├── 建立作用域链
│   └── 确定 this 指向
├── 2. 执行阶段
│   ├── 变量赋值
│   ├── 函数执行
│   └── 返回结果
└── 3. 销毁阶段（函数执行完毕）

示例：
function add(a, b) {
  const sum = a + b;
  return sum;
}

// 调用 add(1, 2) 时：
// 1. 创建上下文
//    VO = { a: 1, b: 2, sum: undefined }
//    this = window（或 undefined）
// 2. 执行
//    sum = 3
// 3. 返回 3，销毁上下文
```

### 作用域与作用域链

```
作用域 = 变量的可访问范围

三种作用域：
├── 全局作用域 → 任何地方可访问
├── 函数作用域 → 函数内可访问（var/let/const）
└── 块级作用域 → {} 内可访问（let/const）

作用域链 = 变量查找的链条

function outer() {
  const x = 10;
  
  function inner() {
    const y = 20;
    console.log(x + y); // x 从外层作用域查找
  }
}

查找规则：
├── 从当前作用域开始查找
├── 找不到则查找父作用域
├── 一直查找到全局作用域
└── 找不到则报错（ReferenceError）

示例：
const a = 1;

function outer() {
  const b = 2;
  
  function inner() {
    const c = 3;
    console.log(a + b + c); // 1 + 2 + 3 = 6
    // c → 当前作用域
    // b → 父作用域
    // a → 全局作用域
  }
}
```

## 底层原理（Why）

### 闭包

```
闭包 = 函数 + 它能访问的外部变量

形成条件：
├── 函数嵌套
├── 内部函数引用外部变量
└── 内部函数被外部引用

示例：
function createCounter() {
  let count = 0; // 外部变量
  
  return function() { // 内部函数
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// counter 函数 + count 变量 = 闭包
// count 不会被销毁

原理：
├── createCounter() 执行完毕
├── 但返回的函数引用了 count
├── count 保存在内存中
└── 每次调用都能访问和修改
```

### 闭包的应用

```javascript
// 1. 数据私有化
function createUser(name) {
  let age = 0; // 私有变量
  
  return {
    getAge: () => age,
    setAge: (newAge) => {
      if (newAge > 0 && newAge < 150) {
        age = newAge;
      }
    },
    getName: () => name
  };
}

const user = createUser('Alice');
user.setAge(25);
console.log(user.getAge()); // 25
// console.log(user.age); // undefined（无法直接访问）

// 2. 函数柯里化
function multiply(a) {
  return function(b) {
    return a * b;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// 3. 防抖/节流
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 300);

// 4. 缓存
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache[key]) {
      return cache[key];
    }
    
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const factorial = memoize((n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

console.log(factorial(5)); // 120
console.log(factorial(5)); // 120（缓存）
```

### this 指向

```javascript
// this 指向规则：

// 1. 全局上下文
console.log(this); // window（浏览器）或 global（Node）

// 2. 函数调用
function foo() {
  console.log(this); // window（非严格模式）或 undefined（严格模式）
}
foo();

// 3. 对象方法
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name); // obj（调用者）
  }
};
obj.greet();

// 4. 构造函数
function Person(name) {
  this.name = name; // 新创建的实例
}
const person = new Person('Alice');

// 5. 箭头函数（没有自己的 this）
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name); // 外层作用域的 this
  },
  greetNormal() {
    setTimeout(() => {
      console.log(this.name); // obj2（继承外层）
    }, 100);
  }
};

// 6. 显式绑定
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: 'Alice' };
greet.call(user, 'Hello');      // Hello, Alice
greet.apply(user, ['Hello']);   // Hello, Alice
const boundGreet = greet.bind(user);
boundGreet('Hello');            // Hello, Alice

// 7. 优先级
// new > 显式 > 对象方法 > 全局
```

### 调用方式对比

```javascript
// 1. 函数调用
function foo() {
  console.log(this);
}
foo(); // window 或 undefined

// 2. 方法调用
const obj = {
  foo() {
    console.log(this);
  }
};
obj.foo(); // obj

// 3. 构造函数调用
function Person() {
  console.log(this);
}
new Person(); // 新实例

// 4. call/apply/bind
function greet() {
  console.log(this);
}
greet.call({ name: 'Alice' }); // { name: 'Alice' }

// 5. 箭头函数
const arrow = () => {
  console.log(this); // 外层 this
};
```

## 实战应用（How）

### 闭包的内存问题

```javascript
// 问题：内存泄漏
function createLargeClosure() {
  const largeData = new Array(1000000);
  
  return function() {
    return largeData.length;
  };
}

const fn = createLargeClosure();
// largeData 永远不会被回收！

// 解决：及时释放引用
function createClosure() {
  let data = { value: 1 };
  
  return {
    getData: () => data,
    destroy: () => {
      data = null; // 释放引用
    }
  };
}

const closure = createClosure();
console.log(closure.getData());
closure.destroy(); // 释放内存

// 循环中的闭包
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
  // 输出：3, 3, 3（var 是函数作用域）
}

// 解决 1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
  // 输出：0, 1, 2
}

// 解决 2：IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
  // 输出：0, 1, 2
}
```

### 性能优化

```javascript
// 避免在循环中创建闭包
// ❌ 不好
for (let i = 0; i < 1000; i++) {
  const fn = () => console.log(i);
  fn();
}

// ✅ 好
function createLogger(i) {
  return () => console.log(i);
}

for (let i = 0; i < 1000; i++) {
  const fn = createLogger(i);
  fn();
}
```

## 高频面试题

### Q1: 什么是闭包？有什么应用？

```
闭包 = 函数 + 它能访问的外部变量

形成条件：
├── 函数嵌套
├── 内部函数引用外部变量
└── 内部函数被外部引用

应用：
├── 数据私有化（模块模式）
├── 函数柯里化
├── 防抖/节流
└── 缓存（memoize）

注意：
├── 可能导致内存泄漏
└── 及时释放不需要的引用
```

### Q2: this 指向的规则？

```
规则（优先级从高到低）：
├── new 构造 → 新实例
├── call/apply/bind → 显式指定
├── 对象方法 → 调用者
├── 普通函数 → window/undefined
└── 箭头函数 → 外层 this

技巧：
├── 不确定时打印 this
├── 箭头函数没有自己的 this
└── 用 bind 绑定 this
```

### Q3: 闭包的内存问题？

```
问题：
├── 闭包持有外部变量
├── 变量不会被垃圾回收
└── 可能导致内存泄漏

解决：
├── 及时释放引用（置 null）
├── 避免在循环中创建闭包
└── 使用 WeakMap/WeakRef

示例：
const closure = createClosure();
closure.destroy(); // 释放引用
```

## 延伸思考

1. 如何用闭包实现模块模式？
2. 箭头函数和普通函数的区别？
3. 如何检测内存泄漏？

## 参考资料

- [MDN 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [MDN this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
