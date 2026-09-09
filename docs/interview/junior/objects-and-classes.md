---
title: '对象与类基础 [P4-P5]'
level: 'junior'
tags: ['JavaScript', '对象', 'class', '原型', '继承']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# 对象与类基础 [P4-P5]

> 对象是 JavaScript 的核心数据结构。class 语法让面向对象编程更直观。

## 核心概念（What）

### 对象基础

```javascript
// 创建对象
const user = {
  name: 'Alice',
  age: 25,
  greet() {
    return `Hi, I'm ${this.name}`
  },
}

// 访问属性
user.name // 'Alice'
user['age'] // 25
user.greet() // "Hi, I'm Alice"

// 修改/添加属性
user.age = 26
user.email = 'alice@example.com' // 新增

// 删除属性
delete user.email

// 检查属性
'name' in user // true
user.hasOwnProperty('age') // true

// 遍历对象
Object.keys(user) // ['name', 'age', 'greet']
Object.values(user) // ['Alice', 26, ƒ]
Object.entries(user) // [['name','Alice'], ['age',26], ...]

// 解构
const { name, age } = user
```

### 常用对象方法

```javascript
// 合并对象
const defaults = { theme: 'light', lang: 'zh' }
const custom = { theme: 'dark' }
const config = { ...defaults, ...custom }
// { theme: 'dark', lang: 'zh' }

// Object.assign
const merged = Object.assign({}, defaults, custom)

// 冻结对象（不可修改）
const frozen = Object.freeze({ x: 1, y: 2 })
frozen.x = 10 // 静默失败（严格模式报错）

// 可选链
const city = user?.address?.city // undefined（不报错）

// 空值合并
const name = user.name ?? 'Unknown'
```

### class 语法

```javascript
// 定义类
class Animal {
  // 构造函数
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  // 实例方法
  speak() {
    return `${this.name} makes a sound`
  }

  // getter
  get info() {
    return `${this.name}, ${this.age} years old`
  }

  // 静态方法（属于类本身）
  static create(name, age) {
    return new Animal(name, age)
  }
}

const cat = new Animal('Cat', 3)
cat.speak() // 'Cat makes a sound'
cat.info // 'Cat, 3 years old'

// 继承
class Dog extends Animal {
  constructor(name, age, breed) {
    super(name, age) // 调用父类构造函数
    this.breed = breed
  }

  speak() {
    return `${this.name} barks`
  }
}

const dog = new Dog('Rex', 5, 'Labrador')
dog.speak() // 'Rex barks'（覆盖了父类方法）
```

### 数组常用方法

```javascript
const nums = [1, 2, 3, 4, 5]

// 遍历
nums.forEach((n) => console.log(n))

// 映射（返回新数组）
nums.map((n) => n * 2) // [2, 4, 6, 8, 10]

// 过滤
nums.filter((n) => n > 3) // [4, 5]

// 查找
nums.find((n) => n > 3) // 4（第一个）
nums.findIndex((n) => n > 3) // 3（索引）
nums.includes(3) // true

// 归约
nums.reduce((sum, n) => sum + n, 0) // 15

// 判断
nums.every((n) => n > 0) // true（全部满足）
nums.some((n) => n > 4) // true（至少一个满足）

// 排序
;['banana', 'apple', 'cherry'].sort() // ['apple', 'banana', 'cherry']

// 链式调用
nums
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reduce((sum, n) => sum + n, 0)
```

---

## 常见面试题

### Q1: 对象浅拷贝和深拷贝的区别？

**答**：

- 浅拷贝：只复制第一层（`...` 展开、`Object.assign`）
- 深拷贝：复制所有层级（`structuredClone()`、`JSON.parse(JSON.stringify())`）
- 嵌套对象修改时，浅拷贝会互相影响

### Q2: class 和构造函数的关系？

**答**：

- `class` 是构造函数的语法糖
- `class Animal {}` 等价于 `function Animal() {}`
- class 更清晰，支持 extends 继承

### Q3: `map` 和 `forEach` 的区别？

**答**：

- `map`：返回新数组，不修改原数组
- `forEach`：无返回值，只用于遍历
- 需要转换数据用 `map`，只需遍历用 `forEach`

---

## 延伸练习

1. 用展开运算符合并两个对象
2. 用 class 创建一个 `Car` 类（品牌、年份、启动方法）
3. 用链式调用：过滤偶数 → 乘以 2 → 求和

---

## 参考资料

- [MDN 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [数组方法](https://javascript.info/array-methods)
