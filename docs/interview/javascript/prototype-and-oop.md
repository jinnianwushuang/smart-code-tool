---
title: "原型链本质与元编程 [P6-P7]"
level: "senior"
tags: ["JavaScript", "原型链", "class", "Proxy", "元编程"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 原型链本质与元编程 [P6-P7]

> 原型链是 JavaScript 最核心的设计之一，理解它的本质不仅有助于写出正确的继承代码，更是理解框架底层（如 Vue 的响应式、React 的 Fiber）的基础。元编程（Proxy/Reflect）则是现代框架的基石。

## 核心概念（What）

### JavaScript 的继承模型

```
JavaScript 没有"类"的底层支持
├── 只有对象和原型
├── class 是语法糖（编译为原型链操作）
├── 继承通过 [[Prototype]] 链实现
└── 元编程通过 Proxy/Reflect 拦截对象操作
```

---

## 底层原理（Why）

### 1. 原型链的本质

#### [[Prototype]] 内部属性

```javascript
// 每个对象都有一个内部属性 [[Prototype]]
// 它指向另一个对象或 null
// 通过 __proto__（非标准但广泛支持）或 Object.getPrototypeOf() 访问

const obj = {};
Object.getPrototypeOf(obj) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype) === null; // true（原型链终点）
```

#### 属性查找机制

```javascript
// 访问 obj.prop 时的查找过程：
// 1. 在 obj 自身查找 prop
// 2. 找不到 → 沿 [[Prototype]] 链向上查找
// 3. 找到 → 返回值
// 4. 到达 null → 返回 undefined

const animal = {
  eat() { return "eating"; }
};

const dog = Object.create(animal);
dog.bark = function() { return "woof"; };

const puppy = Object.create(dog);

puppy.bark();  // "woof"（自身属性）
puppy.eat();   // "eating"（沿原型链找到 animal.eat）
puppy.toString(); // "[object Object]"（继续向上找到 Object.prototype）

// 原型链结构：
// puppy → dog → animal → Object.prototype → null
```

#### Object.create 的本质

```javascript
// Object.create(proto) 的本质：创建一个空对象，其 [[Prototype]] 指向 proto

// 等价实现
function create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

// 或者使用 Object.setPrototypeOf（不推荐，性能差）
function create(proto) {
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  return obj;
}
```

### 2. class 语法的底层实现

```javascript
// ES6 class
class Animal {
  constructor(name) {
    this.name = name;
  }
  eat() { return `${this.name} is eating`; }
  static create(name) { return new Animal(name); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  bark() { return "woof"; }
}

// 底层等价代码（简化版）
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function() {
  return `${this.name} is eating`;
};
Animal.create = function(name) {
  return new Animal(name);
};

function Dog(name, breed) {
  Animal.call(this, name); // super(name) 的本质
  this.breed = breed;
}

// 继承的核心：建立原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
// 设置 [[Prototype]] 使 Dog 能访问 Animal 的静态方法
Object.setPrototypeOf(Dog, Animal);

Dog.prototype.bark = function() { return "woof"; };
```

#### class 语法的关键细节

```javascript
// 1. class 内部默认严格模式
// 2. class 构造函数必须用 new 调用（不能当普通函数）
// 3. class 方法不可枚举（enumerable: false）
// 4. class 方法没有 [[Construct]]（不能用 new 调用类方法）
// 5. 私有字段 # 是真正的私有（不在原型上，在实例的 WeakMap 中）

class Counter {
  #count = 0; // 真正的私有字段

  increment() { this.#count++; }
  get value() { return this.#count; }

  // 私有方法
  #validate(n) { return typeof n === 'number' && n > 0; }
}

const c = new Counter();
c.#count; // SyntaxError
'#count' in c; // true（可以检测是否存在）
```

### 3. Proxy 与 Reflect：元编程

#### Proxy 的能力

```javascript
// Proxy 可以拦截对象的 13 种操作
const handler = {
  get(target, prop, receiver) { },       // 属性读取
  set(target, prop, value, receiver) { }, // 属性设置
  has(target, prop) { },                  // in 操作符
  deleteProperty(target, prop) { },       // delete 操作
  ownKeys(target) { },                    // Object.keys/Reflect.ownKeys
  defineProperty(target, prop, desc) { }, // Object.defineProperty
  getOwnPropertyDescriptor(target, prop) {}, // Object.getOwnPropertyDescriptor
  apply(target, thisArg, args) { },       // 函数调用
  construct(target, args, newTarget) { }, // new 操作
  // ... 还有 getPrototypeOf, setPrototypeOf, isExtensible, preventExtensions
};

const proxy = new Proxy(target, handler);
```

#### Vue 3 响应式的 Proxy 实现（简化版）

```javascript
// Vue 3 响应式的核心原理
const targetMap = new WeakMap(); // 存储依赖关系
let activeEffect = null; // 当前正在执行的副作用

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
          depsMap = new Map();
          targetMap.set(target, depsMap);
        }
        let deps = depsMap.get(key);
        if (!deps) {
          deps = new Set();
          depsMap.set(key, deps);
        }
        deps.add(activeEffect);
      }
      // 递归代理嵌套对象
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发副作用
        const depsMap = targetMap.get(target);
        if (depsMap) {
          const deps = depsMap.get(key);
          if (deps) {
            deps.forEach(effect => {
              if (effect.scheduler) {
                effect.scheduler(effect);
              } else {
                effect();
              }
            });
          }
        }
      }
      return result;
    }
  });
}

function effect(fn) {
  activeEffect = fn;
  fn(); // 执行时触发 get，收集依赖
  activeEffect = null;
}

// 使用
const state = reactive({ count: 0, nested: { value: 1 } });

effect(() => {
  console.log('count changed to', state.count);
});

state.count = 1; // 触发上面的 effect
```

#### Reflect 的作用

```javascript
// Reflect 提供了与 Proxy handler 方法一一对应的静态方法
// 它的核心价值：确保正确的默认行为

// 1. 在 Proxy 中使用 Reflect 保证默认行为正确
const handler = {
  get(target, key, receiver) {
    // 必须使用 Reflect.get 而不是 target[key]
    // 因为 receiver 可能是代理对象，需要正确的 this 绑定
    return Reflect.get(target, key, receiver);
  }
};

// 2. Reflect 方法的返回值更合理
Reflect.defineProperty(obj, 'key', { value: 1 }); // true/false
Object.defineProperty(obj, 'key', { value: 1 }); // obj 或 throw

// 3. Reflect.ownKeys 返回所有自有属性键
Reflect.ownKeys({ a: 1, [Symbol()]: 2 }); // ['a', Symbol()]
// 等价于 Object.getOwnPropertyNames() + Object.getOwnPropertySymbols()
```

### 4. 元编程实战

```javascript
// 1. 用 Proxy 实现属性验证
function createValidator(target, validator) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validator[prop]) {
        const [valid, errorMsg] = validator[prop](value);
        if (!valid) throw new Error(`${prop}: ${errorMsg}`);
      }
      return Reflect.set(obj, prop, value);
    }
  });
}

const user = createValidator({}, {
  age: (v) => [typeof v === 'number' && v > 0, '必须是正数'],
  name: (v) => [typeof v === 'string' && v.length > 0, '不能为空'],
});

user.age = 25;   // OK
user.age = -1;   // Error: age: 必须是正数

// 2. 用 Proxy 实现自动日志
function withLogging(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof value === 'function') {
        return function(...args) {
          console.log(`Calling ${String(key)} with`, args);
          const result = value.apply(this, args);
          console.log(`${String(key)} returned`, result);
          return result;
        };
      }
      return value;
    }
  });
}

// 3. 用 Proxy 实现不可变对象
function deepFreeze(obj) {
  return new Proxy(obj, {
    set() { throw new Error('Cannot modify frozen object'); },
    deleteProperty() { throw new Error('Cannot delete from frozen object'); },
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof value === 'object' && value !== null) {
        return deepFreeze(value);
      }
      return value;
    }
  });
}
```

---

## 高频面试题

### Q1: 原型链的查找机制是什么？

**参考答案要点**：
- 每个对象有 `[[Prototype]]` 内部属性，指向另一个对象或 null
- 属性查找沿原型链向上，找到即返回，到 null 返回 undefined
- `Object.create(proto)` 创建以 proto 为原型的对象
- 赋值操作不会沿原型链查找（直接在自身创建属性）
- 原型链终点是 `Object.prototype`（再上面是 null）

### Q2: class 和原型的关系是什么？

**参考答案要点**：
- class 是原型继承的语法糖，编译后仍然是原型链操作
- `constructor` 对应构造函数
- 实例方法定义在 `prototype` 上
- `extends` 通过 `Object.create()` 建立原型链
- `super()` 调用父类构造函数
- class 与函数的区别：必须 new 调用、方法不可枚举、内部严格模式

### Q3: Proxy 和 Object.defineProperty 的区别？

**参考答案要点**：
- `defineProperty` 只能拦截已有属性的 get/set，无法检测新增/删除属性
- `Proxy` 可以拦截 13 种操作，包括新增属性、delete、has 等
- `Proxy` 返回新代理对象，`defineProperty` 修改原对象
- `Proxy` 不支持 IE，`defineProperty` 兼容性更好
- Vue 2 用 `defineProperty`（需要 `$set` 解决限制），Vue 3 用 `Proxy`

---

## 延伸思考

1. **设计题**：如果用 Proxy 实现一个完整的响应式系统，如何处理数组的变更检测？
2. **场景题**：为什么 Vue 3 选择 Proxy 而不是 defineProperty？Proxy 在 SSR 场景有什么限制？
3. **对比题**：JavaScript 的原型继承 vs 类继承，各自的优劣？为什么 ES6 要引入 class 语法？

---

## 参考资料

- [MDN - Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN - Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Vue 3 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [You Don't Know JS - this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS)
