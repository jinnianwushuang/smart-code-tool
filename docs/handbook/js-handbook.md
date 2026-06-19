# JavaScript 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-19  
> **适用对象**: JavaScript 开发人员、前端工程师、Node.js 开发者

---

## 📑 目录

- [1. 变量和作用域](#1-变量和作用域)
- [2. 数据类型](#2-数据类型)
- [3. 字符串操作](#3-字符串操作)
- [4. 数组操作](#4-数组操作)
- [5. 对象操作](#5-对象操作)
- [6. 函数](#6-函数)
- [7. this 绑定](#7-this-绑定)
- [8. 闭包](#8-闭包)
- [9. 异步编程](#9-异步编程)
- [10. 事件循环](#10-事件循环)
- [11. 原型和继承](#11-原型和继承)
- [12. 类 (ES6+)](#12-类-es6)
- [13. 正则表达式](#13-正则表达式)
- [14. JSON](#14-json)
- [15. 类型转换](#15-类型转换)
- [16. 错误处理](#16-错误处理)
- [17. DOM 操作](#17-dom-操作)
- [18. 事件处理](#18-事件处理)
- [19. 存储 API](#19-存储-api)
- [20. 模块化](#20-模块化)
- [21. 解构赋值](#21-解构赋值)
- [22. 扩展运算符](#22-扩展运算符)
- [23. 迭代和生成器](#23-迭代和生成器)
- [24. 代理和反射](#24-代理和反射)
- [25. WeakMap 和 WeakSet](#25-weakmap-和-weakset)
- [26. Map 和 Set](#26-map-和-set)
- [27. Symbol](#27-symbol)
- [28. 实验性语法](#28-实验性语法)
- [29. 最佳实践](#29-最佳实践)
- [30. 性能优化](#30-性能优化)
- [31. 实用工具函数](#31-实用工具函数)

---

## 1. 变量和作用域

### 变量声明

```javascript
// var - 函数作用域，容易造成提升问题（避免使用）
var oldVar = 'old way';

// let - 块级作用域，推荐使用
let blockScoped = 'let value';

// const - 块级作用域，不能重新赋值（优先使用）
const constant = 'const value';
```

### 暂时死区 (Temporal Dead Zone)

访问 `const`/`let` 变量在声明前会报错，不会像 `var` 那样提升。

### 避免全局作用域污染

```javascript
// 使用 IIFE 隐藏作用域
(function() {
  const privateVar = 'only accessible inside';
  console.log(privateVar);
})();
```

---

## 2. 数据类型

### 原始类型

```javascript
const str = 'string';        // String
const num = 42;              // Number
const bool = true;           // Boolean
const sym = Symbol('unique'); // Symbol
const bigInt = 100n;         // BigInt
const undef = undefined;     // Undefined
const nil = null;            // Null
```

### 引用类型

```javascript
const obj = { name: 'John', age: 30 };
const arr = [1, 2, 3];
const func = () => 'function';
```

### 类型检查

```javascript
typeof str;      // 'string'
typeof num;      // 'number'
typeof bool;     // 'boolean'
typeof sym;      // 'symbol'
typeof bigInt;   // 'bigint'
typeof undef;    // 'undefined'
typeof func;     // 'function'
typeof obj;      // 'object'
typeof nil;      // 'object' (历史遗留)

Array.isArray(arr);           // true
obj instanceof Object;        // true
```

---

## 3. 字符串操作

### 模板字符串

```javascript
const name = 'Alice';
const greeting = `Hello, ${name}!`;

const multiline = `
  Line 1
  Line 2
  Line 3
`;
```

### 常用方法

```javascript
const text = 'Hello World';

text.length;                    // 11
text.charAt(0);                 // 'H'
text.charCodeAt(0);             // 72
text.substring(0, 5);           // 'Hello'
text.slice(0, 5);               // 'Hello'
text.split(' ');                // ['Hello', 'World']
text.toUpperCase();             // 'HELLO WORLD'
text.toLowerCase();             // 'hello world'
text.trim();                    // 移除首尾空格
text.startsWith('Hello');       // true
text.endsWith('World');         // true
text.includes('World');         // true
text.indexOf('World');          // 6
text.replace('World', 'JS');    // 'Hello JS'
text.replaceAll('o', '0');      // 'Hell0 W0rld'
text.repeat(2);                 // 'Hello WorldHello World'
text.padStart(15, '*');         // '*****Hello World'
text.padEnd(15, '*');           // 'Hello World*****'
```

### 字符串分解

```javascript
const [first, ...rest] = 'hello';
```

---

## 4. 数组操作

### 数组创建

```javascript
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, 'two', true, { key: 'value' }];

Array(5);                       // [empty × 5]
Array(1, 2, 3);                 // [1, 2, 3]
Array.from('hello');            // ['h', 'e', 'l', 'l', 'o']
Array.of(1, 2, 3);              // [1, 2, 3]
[...numbers];                   // 浅拷贝
```

### 添加元素

```javascript
numbers.push(6);                // 在末尾添加，修改原数组
numbers.unshift(0);             // 在开头添加，修改原数组
[...numbers, 7];                // 创建新数组
```

### 移除元素

```javascript
numbers.pop();                  // 移除末尾
numbers.shift();                // 移除开头
numbers.splice(1, 2);           // 从索引 1 移除 2 个元素
```

### 查找元素

```javascript
numbers.indexOf(3);             // 2
numbers.lastIndexOf(3);         // 2
numbers.find(n => n > 3);       // 4
numbers.findIndex(n => n > 3);  // 3
numbers.includes(3);            // true
```

### 迭代操作

```javascript
numbers.forEach((n, i) => console.log(n, i));
numbers.map(n => n * 2);                    // [2, 4, 6, 8, 10]
numbers.filter(n => n > 2);                 // [3, 4, 5]
numbers.reduce((sum, n) => sum + n, 0);     // 15
numbers.reduceRight((sum, n) => sum + n, 0); // 从右往左
numbers.every(n => n > 0);                  // true
numbers.some(n => n > 3);                   // true
```

### 数组转换

```javascript
numbers.join('-');              // '1-2-3-4-5'
numbers.reverse();              // [5, 4, 3, 2, 1]
numbers.sort((a, b) => a - b);  // 数字排序
numbers.slice(1, 3);            // [2, 3]
numbers.flat(1);                // 展平一层
numbers.flatMap(n => [n, n * 2]); // map 后展平
```

---

## 5. 对象操作

### 属性访问

```javascript
const person = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  address: {
    city: 'New York',
    zip: '10001'
  },
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

person.name;                    // 'John'
person['email'];                // 'john@example.com'
person?.phone;                  // 可选链，null/undefined 时返回 undefined
person?.address?.city;          // 深层可选链
```

### 属性操作

```javascript
Object.keys(person);            // ['name', 'age', 'email', 'address', 'greet']
Object.values(person);          // ['John', 30, 'john@example.com', {...}, ...]
Object.entries(person);         // [['name', 'John'], ...]
Object.getOwnPropertyNames(person);
Object.assign({}, person, { age: 31 });  // 合并对象
{ ...person, age: 31 };         // 展开语法合并
```

### 属性描述符

```javascript
Object.getOwnPropertyDescriptor(person, 'name');

Object.defineProperty(person, 'country', {
  value: 'USA',
  writable: false,
  enumerable: true,
  configurable: false
});
```

### 冻结和密封

```javascript
Object.freeze(person);          // 完全冻结
Object.isFrozen(person);        // true
Object.seal(person);            // 密封（能修改属性，不能增删）
Object.isSealed(person);        // true
```

### 对象转换

```javascript
JSON.stringify(person);                      // 转 JSON 字符串
JSON.parse(JSON.stringify(person));          // 深拷贝（简单对象）
```

### 解构赋值

```javascript
const { name, address: { city } } = person;                    // 嵌套解构
const { name: personName = 'Default' } = person;               // 默认值
```

---

## 6. 函数

### 函数声明方式

```javascript
// 函数声明
function add(a, b) {
  return a + b;
}

// 函数表达式
const multiply = function(a, b) {
  return a * b;
};

// 箭头函数
const divide = (a, b) => a / b;
const square = x => x * x;
const getObj = () => ({ x: 1, y: 2 });
```

### 参数特性

```javascript
// 默认参数
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// 参数解构
function printPoint({ x, y }) {
  console.log(`Point: (${x}, ${y})`);
}
```

### 函数调用方式

```javascript
add(1, 2);                        // 直接调用
add.call(null, 1, 2);             // 指定 this
add.apply(null, [1, 2]);          // 指定 this 和数组参数
const boundAdd = add.bind(null, 1); // 创建新函数，部分应用
boundAdd(2);                      // 3
```

### 柯里化函数

```javascript
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return (...nextArgs) => curried(...args, ...nextArgs);
    }
  };
};

const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(1)(2)(3); // 6
```

### 记忆化（缓存结果）

```javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}
```

---

## 7. this 绑定

### this 绑定规则

```javascript
const obj1 = {
  value: 42,
  getValue() {
    return this.value;
  }
};

obj1.getValue(); // 42

const getValue = obj1.getValue;
getValue(); // undefined（this 指向 global/undefined）
```

### 箭头函数的 this

```javascript
const obj2 = {
  value: 42,
  getValue: () => {
    return this.value; // 箭头函数 this 继承自外层作用域
  }
};
```

---

## 8. 闭包

### 数据封装示例

```javascript
function makeCounter() {
  let count = 0;
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    get() {
      return count;
    }
  };
}

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.get();       // 2
```

---

## 9. 异步编程

### 回调函数

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { data: 'result' });
  }, 1000);
}

fetchData((err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
```

### Promise

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success');
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));
```

### 链式 Promise

```javascript
Promise.resolve(1)
  .then(n => n + 1)
  .then(n => n * 2)
  .then(n => console.log(n)); // 4
```

### Promise 工具方法

```javascript
Promise.all([p1, p2, p3]);         // 全部成功才成功
Promise.race([p1, p2, p3]);        // 第一个完成
Promise.allSettled([p1, p2]);      // 等待全部完成（无论成功失败）
Promise.any([p1, p2]);             // 任一成功就成功
```

### Async/Await

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### 并行执行

```javascript
async function parallel() {
  const [user, posts] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts')
  ]);
  return { user, posts };
}
```

### 连续执行

```javascript
async function sequential() {
  const user = await fetch('/api/user');
  const posts = await fetch(`/api/users/${user.id}/posts`);
  return { user, posts };
}
```

---

## 10. 事件循环

### 宏任务 vs 微任务

- **宏任务**: `setTimeout`, `setInterval`, `setImmediate`
- **微任务**: `Promise`, `queueMicrotask`, `MutationObserver`

### 执行顺序示例

```javascript
console.log('Script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
  })
  .then(() => {
    console.log('Promise 2');
  });

console.log('Script end');

// 输出顺序:
// Script start
// Script end
// Promise 1
// Promise 2
// setTimeout
```

---

## 11. 原型和继承

### 原型链

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.move = function() {
  console.log(`${this.name} is moving`);
};

function Dog(name, breed) {
  Animal.call(this, name); // 调用父构造函数
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

const dog = new Dog('Buddy', 'Golden Retriever');
dog.move(); // Buddy is moving
dog.bark(); // Buddy is barking
```

### 检查原型

```javascript
dog instanceof Dog;                     // true
dog instanceof Animal;                  // true
Object.getPrototypeOf(dog) === Dog.prototype; // true
```

---

## 12. 类 (ES6+)

### 类定义

```javascript
class Animal2 {
  constructor(name) {
    this.name = name;
  }

  move() {
    console.log(`${this.name} is moving`);
  }

  static info() {
    return 'Animals move around';
  }

  get displayName() {
    return `Animal: ${this.name}`;
  }

  set displayName(value) {
    this.name = value;
  }
}
```

### 继承

```javascript
class Dog2 extends Animal2 {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  move() {
    super.move();
    console.log(`${this.name} is running`);
  }

  bark() {
    console.log(`${this.name} is barking`);
  }
}
```

### 私有字段和方法

```javascript
class User {
  #password; // 私有字段

  constructor(name, password) {
    this.name = name;
    this.#password = password;
  }

  #hashPassword() { // 私有方法
    return 'hashed_' + this.#password;
  }

  verifyPassword(pwd) {
    return this.#hashPassword() === 'hashed_' + pwd;
  }

  static create(name, password) {
    return new User(name, password);
  }
}
```

---

## 13. 正则表达式

### 创建正则

```javascript
const regex = /hello/i;        // i: 忽略大小写
const regexG = /l/g;           // g: 全局匹配
const regexM = /^start/m;      // m: 多行模式
const regex2 = new RegExp('hello', 'i');
```

### 常用方法

```javascript
regex.test('Hello World');              // true
'Hello World'.match(/\w+/g);            // ['Hello', 'World']
'Hello World'.search(/World/);          // 6
'Hello World'.replace(/World/, 'JS');   // 'Hello JS'
'Hello,World,JS'.split(',');            // ['Hello', 'World', 'JS']
```

### 常见正则模式

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/.+/;
const phoneRegex = /^\d{10,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

---

## 14. JSON

### 序列化和反序列化

```javascript
const obj = { name: 'John', age: 30, active: true };
const jsonStr = JSON.stringify(obj);
const parsed = JSON.parse(jsonStr);
```

### 自定义转换

```javascript
// 自定义序列化
JSON.stringify(obj, (key, value) => {
  if (typeof value === 'number') {
    return value * 2;
  }
  return value;
});

// 自定义反序列化
JSON.parse(jsonStr, (key, value) => {
  if (key === 'age') {
    return value + 1;
  }
  return value;
});
```

---

## 15. 类型转换

### 显式转换

```javascript
String(123);        // '123'
Number('123');      // 123
Boolean(1);         // true
parseInt('123');    // 123
parseFloat('123.45'); // 123.45
```

### 隐式转换

```javascript
123 + '';           // '123'
'123' - 0;          // 123
!0;                 // true
!!1;                // true
```

### 相等比较

```javascript
0 == false;         // true (宽松)
0 === false;        // false (严格)
null == undefined;  // true (宽松)
null === undefined; // false (严格)
```

---

## 16. 错误处理

### try-catch-finally

```javascript
try {
  throw new Error('Something went wrong');
} catch (error) {
  console.error(error.message);
  console.error(error.stack);
} finally {
  console.log('Cleanup');
}
```

### 自定义错误

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  throw new ValidationError('Invalid input');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  }
}
```

---

## 17. DOM 操作

> **注意**: 这些代码只在浏览器环境中工作

### 选择元素

```javascript
const el1 = document.getElementById('myId');
const el2 = document.querySelector('.myClass');
const el3 = document.querySelectorAll('div.item');
const el4 = document.getElementsByTagName('p');
const el5 = document.getElementsByClassName('active');
```

### 创建和修改元素

```javascript
const div = document.createElement('div');
div.textContent = 'Hello';
div.className = 'container';
div.setAttribute('data-id', '123');
div.innerHTML = '<p>Content</p>';

// 添加到 DOM
document.body.appendChild(div);
parentElement.insertBefore(div, referenceElement);
element.replaceChild(newElement, oldElement);

// 移除元素
element.remove();
parent.removeChild(child);
```

### 查询关系

```javascript
element.parentElement;
element.children;
element.childNodes;
element.nextElementSibling;
element.previousElementSibling;
element.firstElementChild;
element.lastElementChild;
```

### 样式操作

```javascript
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.classList.add('active');
element.classList.remove('inactive');
element.classList.toggle('hidden');
element.classList.contains('selected');
```

### 属性和数据

```javascript
element.getAttribute('data-id');
element.setAttribute('data-id', '456');
element.dataset.id; // 访问 data-* 属性
```

---

## 18. 事件处理

### 添加事件监听

```javascript
element.addEventListener('click', (event) => {
  console.log('Clicked:', event.target);
});
```

### 事件对象

```javascript
function handleEvent(event) {
  event.type;                    // 事件类型
  event.target;                  // 触发事件的元素
  event.currentTarget;           // 监听器绑定的元素
  event.preventDefault();        // 阻止默认行为
  event.stopPropagation();       // 阻止冒泡
  event.stopImmediatePropagation(); // 阻止其他监听器执行
  event.clientX, event.clientY;  // 鼠标坐标
  event.key;                     // 键盘键
}
```

### 移除事件监听

```javascript
element.removeEventListener('click', handleEvent);
```

### 事件委托

```javascript
parent.addEventListener('click', (event) => {
  if (event.target.classList.contains('child')) {
    console.log('Child clicked');
  }
});
```

---

## 19. 存储 API

### LocalStorage (永久存储)

```javascript
localStorage.setItem('key', 'value');
localStorage.getItem('key');      // 'value'
localStorage.removeItem('key');
localStorage.clear();             // 清空所有
```

### SessionStorage (会话存储)

```javascript
sessionStorage.setItem('key', 'value');
sessionStorage.getItem('key');
```

### Cookie

```javascript
document.cookie = 'name=value; path=/; expires=' + new Date(2026, 6, 5);
document.cookie = 'name=value; path=/; max-age=3600'; // 1小时
```

---

## 20. 模块化

### ES6 模块

```javascript
// export.js
export const utils = { /* ... */ };
export default MyClass;

// import.js
import MyClass, { utils } from './module.js';
```

### CommonJS (Node.js)

```javascript
// module.js
module.exports = { /* ... */ };

// app.js
const { /* ... */ } = require('./module.js');
```

---

## 21. 解构赋值

### 数组解构

```javascript
const [a, b, c] = [1, 2, 3];
const [x, , z] = [1, 2, 3];           // 跳过第二个
const [first, ...rest] = [1, 2, 3, 4]; // first=1, rest=[2,3,4]
const [d = 10] = [];                   // 默认值
```

### 对象解构

```javascript
const { name: personName, age: personAge } = { name: 'John', age: 30 };
const { name = 'Guest', email = 'no-email' } = obj;
const { x: coords_x, y: coords_y } = { x: 10, y: 20 };
```

### 嵌套解构

```javascript
const { address: { city } } = person;
```

### 函数参数解构

```javascript
function printPerson({ name, age }) {
  console.log(`${name} is ${age} years old`);
}
```

---

## 22. 扩展运算符

### 数组展开

```javascript
const arr1 = [1, 2, 3];
const arr2 = [0, ...arr1, 4]; // [0, 1, 2, 3, 4]
```

### 对象展开

```javascript
const obj_a = { a: 1, b: 2 };
const obj_b = { ...obj_a, c: 3 }; // { a: 1, b: 2, c: 3 }
```

### 函数参数

```javascript
const numbers = [1, 2, 3];
Math.max(...numbers); // 3
```

---

## 23. 迭代和生成器

### 可迭代协议

```javascript
const iterable = {
  [Symbol.iterator]() {
    let count = 0;
    return {
      next: () => ({
        value: count++,
        done: count > 3
      })
    };
  }
};

for (const value of iterable) {
  console.log(value); // 0, 1, 2
}
```

### Generator 函数

```javascript
function* generator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

for (const value of generator()) {
  console.log(value); // 1, 2, 3
}
```

---

## 24. 代理和反射

### Proxy

```javascript
const target = { name: 'John', age: 30 };

const handler = {
  get(target, property) {
    console.log(`Getting ${property}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`Setting ${property} to ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);
proxy.name;      // 'Getting name', 'John'
proxy.age = 31;  // 'Setting age to 31'
```

### Reflect API

```javascript
Reflect.get(target, 'name');      // 'John'
Reflect.set(target, 'age', 32);   // true
Reflect.has(target, 'name');      // true
Reflect.ownKeys(target);          // ['name', 'age']
```

---

## 25. WeakMap 和 WeakSet

### WeakMap

```javascript
// 键只能是对象，垃圾回收安全
const wm = new WeakMap();
const key1 = { id: 1 };

wm.set(key1, 'value');
wm.get(key1);    // 'value'
wm.has(key1);    // true
wm.delete(key1); // true
```

### WeakSet

```javascript
// 值只能是对象
const ws = new WeakSet();
const obj = { id: 1 };

ws.add(obj);
ws.has(obj);     // true
ws.delete(obj);  // true
```

---

## 26. Map 和 Set

### Map

```javascript
// 键值对集合，键可以是任意类型
const map = new Map();
map.set('key1', 'value1');
map.set(42, 'value2');
map.get('key1');   // 'value1'
map.size;          // 2
map.has('key1');   // true
map.delete('key1');
map.clear();

for (const [key, value] of map) {
  console.log(key, value);
}
```

### Set

```javascript
// 唯一值集合
const set = new Set([1, 2, 2, 3, 3, 3]);
set.size;    // 3
set.add(4);
set.has(2);  // true
set.delete(2);
set.clear();

for (const value of set) {
  console.log(value); // 1, 3, 4
}

// 数组去重
const unique = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]
```

---

## 27. Symbol

### 基本用法

```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');
sym1 === sym2; // false (每个 Symbol 都是唯一的)
```

### 全局 Symbol 注册表

```javascript
const globalSym = Symbol.for('app.id');
const sameSym = Symbol.for('app.id');
globalSym === sameSym; // true
```

### 对象属性名

```javascript
const obj = {};
obj[sym1] = 'value1';
obj[sym2] = 'value2';

Object.keys(obj);                    // [] (Symbol 属性不被枚举)
Object.getOwnPropertySymbols(obj);   // [sym1, sym2]
```

### 常见 Symbol

```javascript
Symbol.iterator;        // 可迭代协议
Symbol.asyncIterator;   // 异步可迭代
Symbol.hasInstance;     // instanceof 行为
Symbol.toStringTag;     // Object.prototype.toString
```

---

## 28. 实验性语法

### 28.1 装饰器 (Decorators) - Stage 3

```javascript
// 类装饰器
function logged(target) {
  console.log(`Class ${target.name} is being instantiated`);
  return target;
}

@logged
class UserService {
  constructor(name) {
    this.name = name;
  }
}

// 方法装饰器
function deprecated(target, context) {
  if (context.kind === 'method') {
    return function(...args) {
      console.warn(`Method ${String(context.name)} is deprecated`);
      return target.call(this, ...args);
    };
  }
}

class ApiClient {
  @deprecated
  oldMethod() {
    return 'old implementation';
  }
  
  newMethod() {
    return 'new implementation';
  }
}

// 自动绑定装饰器
function bound(target, context) {
  if (context.kind === 'method') {
    return function(...args) {
      return target.call(this, ...args);
    };
  }
}

class Button {
  constructor(label) {
    this.label = label;
  }
  
  @bound
  handleClick() {
    console.log(`Button ${this.label} clicked`);
  }
}
```

### 28.2 Array Grouping - ECMAScript 2024

```javascript
const people = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 },
  { name: 'David', age: 30 }
];

// Object.groupBy
const groupedByAge = Object.groupBy(people, person => person.age);
// { 
//   25: [{name: 'Alice', age: 25}, {name: 'Charlie', age: 25}],
//   30: [{name: 'Bob', age: 30}, {name: 'David', age: 30}] 
// }

// Map.groupBy
const groupedMap = Map.groupBy(people, person => person.age);
```

### 28.3 Change Array by Copy - ECMAScript 2023

```javascript
const original = [3, 1, 4, 1, 5, 9, 2, 6];

// 排序（不修改原数组）
const sorted = original.toSorted((a, b) => a - b);
// [1, 1, 2, 3, 4, 5, 6, 9]

// 反转（不修改原数组）
const reversed = original.toReversed();
// [6, 2, 9, 5, 1, 4, 1, 3]

// 拼接（不修改原数组）
const spliced = original.toSpliced(2, 3, 10, 20);
// [3, 1, 10, 20, 9, 2, 6]

// 替换元素（不修改原数组）
const replaced = original.with(0, 100);
// [100, 1, 4, 1, 5, 9, 2, 6]
```

### 28.4 Private Field Checks - ECMAScript 2022

```javascript
class SafeUser {
  #password;
  
  constructor(password) {
    this.#password = password;
  }
  
  // 检查对象是否有某个私有字段
  static isSafeUser(obj) {
    return #password in obj;
  }
  
  verifyPassword(pwd) {
    if (!(#password in this)) {
      throw new Error('Invalid object');
    }
    return this.#password === pwd;
  }
}

const user = new SafeUser('secret123');
SafeUser.isSafeUser(user); // true
SafeUser.isSafeUser({});   // false
```

### 28.5 Static Class Fields - ECMAScript 2022

```javascript
class MathUtils {
  // 静态字段
  static PI = 3.141592653589793;
  static VERSION = '1.0.0';
  
  // 静态块 - 初始化静态字段
  static {
    console.log(`Initializing MathUtils v${this.VERSION}`);
    this.E = Math.E;
  }
  
  // 静态方法
  static circleArea(radius) {
    return this.PI * radius ** 2;
  }
  
  // 私有静态字段
  static #cache = new Map();
  
  static cachedCompute(key, fn) {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, fn());
    }
    return this.#cache.get(key);
  }
}

MathUtils.circleArea(5); // 78.53981633974483
```

### 其他实验性特性

- **Pipeline 操作符 (`|>`)** - Stage 2
- **Partial Application Syntax** - Stage 2
- **Record & Tuple** - Stage 2
- **Temporal API** - Stage 3
- **Import Attributes** - Stage 3
- **Top-level Await** - ECMAScript 2022

---

## 29. 最佳实践

### ✅ 推荐做法

1. 使用 `const` 为默认，需要重新赋值时用 `let`，避免 `var`
2. 不要在循环中创建函数，容易造成闭包陷阱
3. 使用 `const` 防止意外修改
4. 优先使用现代语法（箭头函数、解构、展开等）
5. 使用 `===` 进行比较，避免 `==`
6. 使用 `try-catch` 处理错误
7. 使用 `async/await` 而不是嵌套回调
8. 避免过深的嵌套（使用提前返回）
9. 使用有意义的变量名
10. 编写可测试的模块化代码
11. 关注 TC39 提案，适时采用稳定的新特性
12. 使用 ESLint/Prettier 保持代码风格一致
13. 编写类型注释或使用 TypeScript
14. 使用 Immutable 数据结构减少副作用
15. 合理使用装饰器提高代码可读性

### ❌ 常见错误

1. 在回调中使用 `var` 导致闭包问题
2. 忘记使用 `await`，返回 Promise 而不是值
3. 对象/数组浅拷贝导致的意外修改
4. 没有处理异步操作中的错误
5. 过度使用全局变量
6. 不理解 `this` 的绑定规则
7. 忘记移除事件监听导致内存泄漏
8. 直接修改 DOM 导致性能问题
9. 使用 `eval` 或 `with` 语句
10. 没有使用 `===` 进行严格比较
11. 忽略浏览器的兼容性问题
12. 不使用模块化导致命名冲突

---

## 30. 性能优化

### 防抖 (Debounce)

```javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 使用示例
window.addEventListener('resize', debounce(handleResize, 250));
```

### 节流 (Throttle)

```javascript
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 使用示例
window.addEventListener('scroll', throttle(handleScroll, 100));
```

### 批量更新 DOM

```javascript
function batchUpdateDOM(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}
```

### 惰性求值

```javascript
function lazy(fn) {
  let evaluated = false;
  let value;
  return () => {
    if (!evaluated) {
      value = fn();
      evaluated = true;
    }
    return value;
  };
}
```

### 缓存装饰器

```javascript
function cacheable(ttl = 60000) {
  const cache = new Map();
  return function(target, context) {
    if (context.kind === 'method') {
      return function(...args) {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
          return cached.value;
        }
        const result = target.call(this, ...args);
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
      };
    }
  };
}
```

---

## 31. 实用工具函数

### 深拷贝

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) {
    const arr = [];
    for (let i = 0; i < obj.length; i++) {
      arr[i] = deepClone(obj[i]);
    }
    return arr;
  }
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}
```

### 数组去重

```javascript
const removeDuplicates = (arr) => [...new Set(arr)];
```

### 数组扁平化

```javascript
const flatten = (arr) => arr.flat(Infinity);
```

### 嵌套属性访问

```javascript
const getNestedValue = (obj, path, defaultValue = null) => {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return value ?? defaultValue;
};

// 使用示例
getNestedValue(user, 'address.city', 'Unknown');
```

### 延迟执行

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 使用示例
await delay(1000); // 等待 1 秒
```

### 重试函数

```javascript
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(delayMs * attempt);
    }
  }
}

// 使用示例
const result = await retry(() => fetchData(), 3, 1000);
```

### 链式 Promise

```javascript
function chain(...fns) {
  return (value) => fns.reduce((p, fn) => p.then(fn), Promise.resolve(value));
}

// 使用示例
const process = chain(
  data => data * 2,
  data => data + 10,
  data => Math.sqrt(data)
);
process(5); // Promise
```

### 管道组合

```javascript
function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x);
}

// 使用示例
const transform = pipe(
  x => x * 2,
  x => x + 10,
  x => x.toString()
);
transform(5); // "20"
```

### 组合函数

```javascript
function compose(...fns) {
  return (x) => fns.reduceRight((v, f) => f(v), x);
}

// 使用示例
const transform = compose(
  x => x.toString(),
  x => x + 10,
  x => x * 2
);
transform(5); // "20"
```

### 类型守卫

```javascript
function isString(value) {
  return typeof value === 'string';
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

function isArray(value) {
  return Array.isArray(value);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
```

### 非空断言

```javascript
function nonNull(value, message = 'Value cannot be null or undefined') {
  if (value == null) {
    throw new Error(message);
  }
  return value;
}

// 使用示例
const safeValue = nonNull(maybeNull, 'Value is required');
```

---

## 附录

### A. 有用的资源

- **MDN Web Docs**: https://developer.mozilla.org/
- **JavaScript.info**: https://javascript.info/
- **TC39 Proposals**: https://github.com/tc39/proposals
- **Can I Use**: https://caniuse.com/
- **npm**: https://www.npmjs.com/

### B. 学习路线

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

### C. 常用工具库

```
HTTP 请求:
- Axios: https://axios-http.com/
- Fetch API: 内置

日期处理:
- Day.js: https://day.js.org/
- date-fns: https://date-fns.org/

工具函数:
- Lodash: https://lodash.com/
- Ramda: https://ramdajs.com/

状态管理:
- Redux: https://redux.js.org/
- Zustand: https://zustand-demo.pmnd.rs/
```

---

**祝您 JavaScript 编程愉快！** ⚡

如有问题，请查阅 MDN 文档或社区论坛。
