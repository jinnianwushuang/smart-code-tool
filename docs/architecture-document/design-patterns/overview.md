# 设计模式概述

设计模式是软件工程中解决常见设计问题的可复用方案。它们不是具体的代码,而是经过验证的最佳实践和思想模板。

## 什么是设计模式?

设计模式由"四人帮"(Gang of Four, GoF)在 1994 年出版的《设计模式:可复用面向对象软件的基础》一书中系统化提出,包含 23 种经典模式。

### 核心特征

1. **可复用**: 在不同场景下重复使用
2. **经过验证**: 在实践中被证明有效
3. **语言无关**: 思想通用,不依赖特定语言
4. **解决常见问题**: 针对特定的设计挑战

## 为什么需要设计模式?

### 1. 提高代码质量

```javascript
// ❌ 没有模式的代码 - 紧耦合
class Order {
  constructor() {
    this.payment = new PayPalPayment() // 硬编码依赖
  }
}

// ✅ 使用策略模式 - 松耦合
class Order {
  constructor(paymentStrategy) {
    this.payment = paymentStrategy // 依赖注入
  }
}
```

### 2. 促进团队沟通

设计模式提供了共同的词汇表:

- "这里用单例模式"
- "那个模块用了观察者模式"
- "我们需要重构为工厂模式"

### 3. 加速开发

不必重新发明轮子,直接应用成熟方案。

### 4. 提高可维护性

遵循公认的模式,代码更易理解和修改。

## 设计模式分类

### 创建型模式 (Creational Patterns)

关注对象的创建机制,提高灵活性和复用性。

| 模式                                               | 用途                        | 复杂度 |
| -------------------------------------------------- | --------------------------- | ------ |
| [单例](./creational#单例模式-singleton)            | 确保只有一个实例            | ⭐     |
| [工厂方法](./creational#工厂方法-factory-method)   | 定义创建接口,子类决定实例化 | ⭐⭐   |
| [抽象工厂](./creational#抽象工厂-abstract-factory) | 创建相关对象族              | ⭐⭐⭐ |
| [建造者](./creational#建造者-builder)              | 分步构建复杂对象            | ⭐⭐   |
| [原型](./creational#原型-prototype)                | 通过克隆创建对象            | ⭐⭐   |

### 结构型模式 (Structural Patterns)

关注类和对象的组合,形成更大的结构。

| 模式                                    | 用途                  | 复杂度 |
| --------------------------------------- | --------------------- | ------ |
| [适配器](./structural#适配器-adapter)   | 转换接口使其兼容      | ⭐⭐   |
| [桥接](./structural#桥接-bridge)        | 分离抽象与实现        | ⭐⭐⭐ |
| [组合](./structural#组合-composite)     | 树形结构处理部分-整体 | ⭐⭐   |
| [装饰器](./structural#装饰器-decorator) | 动态添加职责          | ⭐⭐   |
| [外观](./structural#外观-facade)        | 提供简化接口          | ⭐     |
| [享元](./structural#享元-flyweight)     | 共享细粒度对象        | ⭐⭐⭐ |
| [代理](./structural#代理-proxy)         | 控制对象访问          | ⭐⭐   |

### 行为型模式 (Behavioral Patterns)

关注对象之间的通信和责任分配。

| 模式                                                  | 用途                       | 复杂度 |
| ----------------------------------------------------- | -------------------------- | ------ |
| [责任链](./behavioral#责任链-chain-of-responsibility) | 请求沿链传递               | ⭐⭐   |
| [命令](./behavioral#命令-command)                     | 封装请求为对象             | ⭐⭐   |
| [迭代器](./behavioral#迭代器-iterator)                | 顺序访问集合元素           | ⭐⭐   |
| [中介者](./behavioral#中介者-mediator)                | 减少对象间直接交互         | ⭐⭐⭐ |
| [备忘录](./behavioral#备忘录-memento)                 | 保存和恢复状态             | ⭐⭐   |
| [观察者](./behavioral#观察者-observer)                | 一对多依赖通知             | ⭐⭐   |
| [状态](./behavioral#状态-state)                       | 对象内部状态改变行为       | ⭐⭐   |
| [策略](./behavioral#策略-strategy)                    | 封装可互换算法             | ⭐⭐   |
| [模板方法](./behavioral#模板方法-template-method)     | 定义算法骨架               | ⭐⭐   |
| [访问者](./behavioral#访问者-visitor)                 | 在不修改类的前提下添加操作 | ⭐⭐⭐ |

## SOLID 原则

设计模式通常遵循 SOLID 原则:

### S - 单一职责原则 (Single Responsibility)

一个类应该只有一个引起它变化的原因。

```javascript
// ❌ 违反 SRP
class User {
  saveToDatabase() {}
  generateReport() {}
  sendEmail() {}
}

// ✅ 遵循 SRP
class UserRepository {
  save(user) {}
}

class ReportGenerator {
  generate(user) {}
}

class EmailService {
  send(user) {}
}
```

### O - 开闭原则 (Open/Closed)

对扩展开放,对修改关闭。

```javascript
// ❌ 违反 OCP
class DiscountCalculator {
  calculate(type) {
    if (type === 'vip') return 0.8
    if (type === 'regular') return 0.9
  }
}

// ✅ 遵循 OCP - 使用策略模式
class DiscountStrategy {
  calculate() {}
}

class VIPDiscount extends DiscountStrategy {
  calculate() {
    return 0.8
  }
}

class RegularDiscount extends DiscountStrategy {
  calculate() {
    return 0.9
  }
}
```

### L - 里氏替换原则 (Liskov Substitution)

子类应该能够替换父类而不影响程序正确性。

```javascript
// ❌ 违反 LSP
class Rectangle {
  setWidth(w) {
    this.width = w
  }
  setHeight(h) {
    this.height = h
  }
}

class Square extends Rectangle {
  setWidth(w) {
    super.setWidth(w)
    super.setHeight(w) // 破坏Rectangle的行为
  }
}

// ✅ 遵循 LSP - 不使用继承
class Shape {
  area() {}
}

class RectangleShape extends Shape {
  constructor(width, height) {
    this.width = width
    this.height = height
  }
  area() {
    return this.width * this.height
  }
}

class SquareShape extends Shape {
  constructor(side) {
    this.side = side
  }
  area() {
    return this.side * this.side
  }
}
```

### I - 接口隔离原则 (Interface Segregation)

客户端不应被迫依赖它不使用的接口。

```javascript
// ❌ 违反 ISP
class Worker {
  work() {}
  eat() {}
  sleep() {}
}

// ✅ 遵循 ISP
class Workable {
  work() {}
}

class Eatable {
  eat() {}
}

class Robot implements Workable {
  work() {}
  // 不需要 eat 和 sleep
}
```

### D - 依赖倒置原则 (Dependency Inversion)

高层模块不应依赖低层模块,两者都应依赖抽象。

```javascript
// ❌ 违反 DIP
class OrderService {
  constructor() {
    this.db = new MySQLDatabase() // 依赖具体实现
  }
}

// ✅ 遵循 DIP
class OrderService {
  constructor(database) {
    this.db = database // 依赖抽象
  }
}

const service = new OrderService(new MySQLDatabase())
// 或
const service = new OrderService(new PostgreSQLDatabase())
```

## 设计原则总结

除了 SOLID,还有以下重要原则:

### KISS (Keep It Simple, Stupid)

保持简单,避免过度设计。

### DRY (Don't Repeat Yourself)

不要重复自己,提取公共逻辑。

### YAGNI (You Ain't Gonna Need It)

不要提前实现可能不需要的功能。

### 组合优于继承

优先使用对象组合而非类继承。

```javascript
// ❌ 过度使用继承
class FlyingCar extends Car {
  fly() {}
}

// ✅ 使用组合
class Car {
  constructor(flyingCapability) {
    this.flying = flyingCapability
  }
}

class FlyingCapability {
  fly() {}
}

const car = new Car(new FlyingCapability())
```

## 何时使用设计模式?

### ✅ 适合使用

1. **问题 recurring**: 反复遇到类似的设计问题
2. **团队熟悉**: 团队成员理解该模式
3. **收益明显**: 能显著提高代码质量或可维护性
4. **不过度设计**: 当前需求确实需要这种抽象

### ❌ 避免使用

1. **过早优化**: 为了用模式而用模式
2. **过度复杂**: 简单问题用复杂方案
3. **团队不熟悉**: 增加理解成本
4. **性能敏感**: 某些模式有性能开销

## 学习建议

1. **理解意图**: 每个模式解决什么问题
2. **掌握结构**: UML 图帮助理解关系
3. **实践应用**: 在实际项目中尝试
4. **识别场景**: 学会识别适用场景
5. **避免教条**: 灵活运用,不死搬硬套

## JavaScript/TypeScript 中的特殊性

JavaScript 作为动态语言,有些模式的实现与传统 OOP 语言不同:

- **接口**: JS 没有原生接口,可用 duck typing 或 TypeScript
- **访问控制**: JS 没有 private/protected,可用 WeakMap 或 Symbol
- **泛型**: JS 不支持,TypeScript 支持
- **函数式替代**: 很多模式可用高阶函数简化

## 下一步

- [创建型模式](./creational) - 学习如何灵活创建对象
- [结构型模式](./structural) - 学习如何组织类和对象
- [行为型模式](./behavioral) - 学习如何分配责任和通信

## 参考资源

- 《设计模式:可复用面向对象软件的基础》- GoF
- 《Head First 设计模式》
- Refactoring Guru (https://refactoring.guru/design-patterns)
- Source Making (https://sourcemaking.com/design-patterns)
