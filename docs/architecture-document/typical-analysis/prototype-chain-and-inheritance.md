# 原型链与 new/class 继承典型拆解

> 本文档从原型链底层机制出发，逐步拆解 `new` 操作符、`Object.create`、
> 构造函数继承、ES6 class 继承的底层实现。

---

## 一、原型链核心三要素

```
每个对象 → 有一个 [[Prototype]]（即 __proto__）→ 指向另一个对象或 null
每个函数 → 有一个 prototype 属性 → 用于作为通过该函数 new 出来的对象的原型
属性查找 → 沿原型链逐级向上，直到 null
```

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function () {
  console.log(`Hi, I'm ${this.name}`)
}

const p = new Person('Alice')

// 原型链关系：
// p.__proto__ === Person.prototype         ✅
// Person.prototype.__proto__ === Object.prototype  ✅
// Object.prototype.__proto__ === null       ✅
```

**原型链查找拆解：**

| 步骤 | 查找过程 | 结果 |
|---|---|---|
| ① | `p.sayHi()` → 在 `p` 自身找 | 没找到 |
| ② | 沿 `p.__proto__` → `Person.prototype` 找 | 找到 `sayHi` ✅ |
| ③ | 若还没找到 → 继续到 `Object.prototype` | 再找不到 → `undefined` |

---

## 二、手写 new 操作符

### 2.1 实现

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建一个空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)

  // 2. 以 obj 为 this 执行构造函数
  const result = Constructor.apply(obj, args)

  // 3. 如果构造函数返回了一个对象，则用该对象；否则用新创建的对象
  return result !== null && (typeof result === 'object' || typeof result === 'function')
    ? result
    : obj
}
```

### 2.2 拆解执行过程

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function () {
  console.log(this.name)
}

const p = myNew(Person, 'Alice')
```

| 步骤 | 操作 | 结果 |
|---|---|---|
| ① | `Object.create(Person.prototype)` | 创建空对象 `{}`，`__proto__` 指向 `Person.prototype` |
| ② | `Person.apply(obj, ['Alice'])` | 在 `obj` 上执行 `this.name = 'Alice'` |
| ③ | 构造函数无返回值（`undefined`） | 返回 `obj` |
| ④ | 最终 | `p.name === 'Alice'`，`p.sayHi()` 可用 |

### 2.3 关键设计点

| 设计点 | 为什么 |
|---|---|
| `Object.create(Constructor.prototype)` | 让新对象的 `__proto__` 正确指向构造函数的原型 |
| `Constructor.apply(obj, args)` | 让构造函数中的 `this` 指向新对象，完成属性初始化 |
| 返回值判断 | 如果构造函数显式返回对象，`new` 的结果应该是那个对象而非新创建的对象 |

---

## 三、继承方案演进 — 从构造函数到 class

### 3.1 方案一：原型链继承

```javascript
function Animal() {
  this.colors = ['red', 'blue'] // 引用类型属性
}
Animal.prototype.eat = function () {
  console.log('eating')
}

function Dog() {}
Dog.prototype = new Animal() // ← 核心：子类原型 = 父类实例

const d1 = new Dog()
const d2 = new Dog()
d1.colors.push('green')
console.log(d2.colors) // ['red', 'blue', 'green'] ← 问题：引用类型被共享！
```

| 优点 | 缺点 |
|---|---|
| 父类原型方法可复用 | 引用类型属性被所有实例共享 |
| — | 无法向父类构造函数传参 |

### 3.2 方案二：借用构造函数

```javascript
function Animal(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

function Dog(name) {
  Animal.call(this, name) // ← 核心：在子类中调用父类构造函数
}

const d1 = new Dog('Buddy')
const d2 = new Dog('Max')
d1.colors.push('green')
console.log(d2.colors) // ['red', 'blue'] ← 不共享 ✅
// 但：Animal.prototype 上的方法无法复用 ❌
```

### 3.3 方案三：组合继承（最常用传统方案）

```javascript
function Animal(name) {
  this.name = name
  this.colors = ['red', 'blue']
}
Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`)
}

function Dog(name, breed) {
  Animal.call(this, name)       // 第二次调用 Animal → 属性独立
  this.breed = breed
}
Dog.prototype = new Animal()    // 第一次调用 Animal → 继承原型方法
Dog.prototype.constructor = Dog // 修复 constructor 指向
Dog.prototype.bark = function () {
  console.log('woof!')
}

const d = new Dog('Buddy', 'Labrador')
d.eat()  // "Buddy is eating" ✅
d.bark() // "woof!" ✅
```

**问题**：`Animal` 构造函数被调用了**两次**（一次 `new Animal()` 设置原型，一次 `call` 初始化属性）。

### 3.4 方案四：寄生组合继承（最优传统方案）

```javascript
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype) // 只复制原型，不执行构造函数
  prototype.constructor = child
  child.prototype = prototype
}

function Animal(name) {
  this.name = name
}
Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`)
}

function Dog(name, breed) {
  Animal.call(this, name) // 只调用一次 ✅
  this.breed = breed
}
inheritPrototype(Dog, Animal) // 不执行 Animal 构造函数 ✅
Dog.prototype.bark = function () {
  console.log('woof!')
}
```

**对比组合继承：**

| 对比项 | 组合继承 | 寄生组合继承 |
|---|---|---|
| 父类构造函数调用次数 | 2 次 | 1 次 |
| 原型方法复用 | ✅ | ✅ |
| 属性独立 | ✅ | ✅ |
| 额外属性 | 原型上有重复的父类实例属性 | 无多余属性 |

---

## 四、ES6 class 继承 — 底层仍是寄生组合继承

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }
  eat() {
    console.log(`${this.name} is eating`)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name) // ← 必须先调用 super，才能使用 this
    this.breed = breed
  }
  bark() {
    console.log('woof!')
  }
}
```

### 4.1 super 的本质

```javascript
// class 继承的底层等价于：
function Dog(name, breed) {
  // super(name) 等价于：
  const _this = Reflect.construct(Animal, [name], new.target)
  // new.target 指向 Dog，所以创建的对象原型是 Dog.prototype
  _this.breed = breed
  return _this
}
```

| 设计点 | 说明 |
|---|---|
| `super()` 必须先于 `this` | 子类实例由父类构造函数创建（`Reflect.construct`），`this` 来自父类 |
| `new.target` | 确保创建的对象原型是**子类**的 `prototype`，而非父类 |
| 底层机制 | 本质仍是寄生组合继承，只是语法糖 |

### 4.2 class vs 构造函数对比

| 对比项 | 构造函数 | class |
|---|---|---|
| 调用方式 | 可当普通函数调用 | 必须 `new`，否则报错 |
| 原型方法可枚举性 | 可枚举 | **不可枚举**（`enumerable: false`） |
| 静态方法 | `Constructor.method` | `static method` |
| 继承 | 手动设置原型链 | `extends` + `super` |
| 私有成员 | 无原生支持 | `#field` 语法 |

---

## 五、高频面试题拆解

### 5.1 实现 instanceof

```javascript
function myInstanceof(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj)
  while (proto !== null) {
    if (proto === Constructor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}

// 拆解
myInstanceof(new Dog(), Animal)
// Dog 实例 → __proto__ → Dog.prototype → __proto__ → Animal.prototype ✅
```

### 5.2 实现 Object.create

```javascript
function myCreate(proto) {
  function F() {}
  F.prototype = proto
  return new F()
}
// 本质：创建一个空对象，其 __proto__ 指向 proto
```

### 5.3 hasOwnProperty vs in

```javascript
const obj = { a: 1 }
// obj.__proto__ = Object.prototype（有 toString）

'a' in obj              // true  — 沿原型链查找
obj.hasOwnProperty('a') // true  — 只查自身
'toString' in obj              // true  — 在原型链上找到了
obj.hasOwnProperty('toString') // false — 不是自身属性
```

---

## 六、总结：原型链与继承知识图谱

```
原型链
├── 核心三要素
│   ├── __proto__     → 对象的隐式原型
│   ├── prototype     → 函数的显式原型
│   └── 属性查找      → 沿原型链逐级向上
│
├── new 操作符
│   ├── Object.create(Constructor.prototype)
│   ├── Constructor.apply(obj, args)
│   └── 返回值判断
│
├── 继承方案演进
│   ├── 原型链继承     → 引用类型共享问题
│   ├── 借用构造函数   → 方法无法复用
│   ├── 组合继承       → 父类调用两次
│   ├── 寄生组合继承   → 最优传统方案 ✅
│   └── class extends  → 语法糖，底层 Reflect.construct
│
└── 高频手写
    ├── instanceof     → 沿原型链查找
    ├── Object.create  → 空对象 + 原型指向
    └── hasOwnProperty → 自身 vs 原型链
```
