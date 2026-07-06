# 创建型模式

创建型模式关注对象的创建过程,使系统不依赖于具体类的实例化方式。

## 单例模式 (Singleton)

### 意图

确保一个类只有一个实例,并提供全局访问点。

### 实现

```javascript
// 基础实现
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance
    }

    // 初始化
    this.data = []
    Singleton.instance = this
  }

  addData(item) {
    this.data.push(item)
  }

  getData() {
    return this.data
  }
}

// 使用
const instance1 = new Singleton()
const instance2 = new Singleton()
console.log(instance1 === instance2) // true
```

### ES6 Module 方式(推荐)

```javascript
// singleton.js
class Database {
  constructor() {
    this.connection = null
  }

  connect() {
    if (!this.connection) {
      this.connection = createConnection()
    }
    return this.connection
  }
}

export default new Database() // 模块级别单例

// 使用
import db from './singleton.js'
db.connect()
```

### TypeScript 实现

```typescript
class Logger {
  private static instance: Logger
  private logs: string[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(message: string) {
    this.logs.push(`${new Date().toISOString()}: ${message}`)
  }

  getLogs() {
    return this.logs
  }
}
```

### 应用场景

- 数据库连接池
- 日志记录器
- 配置管理器
- 缓存管理器

### 注意事项

⚠️ **测试困难**: 单例状态在测试间共享,需要清理
⚠️ **隐藏依赖**: 使依赖关系不明显
⚠️ **并发问题**: 多线程环境需要同步机制

## 工厂方法 (Factory Method)

### 意图

定义创建对象的接口,但由子类决定实例化哪个类。

### 实现

```javascript
// 产品接口
class Button {
  render() {}
  onClick() {}
}

// 具体产品
class WindowsButton extends Button {
  render() {
    console.log('Render Windows button')
  }

  onClick() {
    console.log('Windows button clicked')
  }
}

class MacButton extends Button {
  render() {
    console.log('Render Mac button')
  }

  onClick() {
    console.log('Mac button clicked')
  }
}

// 创建者
class Dialog {
  createButton() {
    throw new Error('Abstract method')
  }

  render() {
    const button = this.createButton()
    button.render()
    return button
  }
}

// 具体创建者
class WindowsDialog extends Dialog {
  createButton() {
    return new WindowsButton()
  }
}

class MacDialog extends Dialog {
  createButton() {
    return new MacButton()
  }
}

// 使用
const dialog = os === 'windows' ? new WindowsDialog() : new MacDialog()
dialog.render()
```

### 简单工厂(静态工厂)

```javascript
class NotificationFactory {
  static create(type) {
    switch (type) {
      case 'email':
        return new EmailNotification()
      case 'sms':
        return new SMSNotification()
      case 'push':
        return new PushNotification()
      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }
}

// 使用
const notification = NotificationFactory.create('email')
notification.send()
```

### 应用场景

- 跨平台 UI 组件
- 日志记录器(文件/控制台/远程)
- 数据库连接器(MySQL/PostgreSQL/MongoDB)

### 优点

✅ 符合开闭原则
✅ 解耦创建和使用
✅ 单一职责原则

## 抽象工厂 (Abstract Factory)

### 意图

提供创建相关或依赖对象族的接口,而无需指定具体类。

### 实现

```javascript
// 抽象产品
class Button {
  render() {}
}

class Checkbox {
  render() {}
}

// 具体产品 - Windows
class WindowsButton extends Button {
  render() {
    console.log('Windows Button')
  }
}

class WindowsCheckbox extends Checkbox {
  render() {
    console.log('Windows Checkbox')
  }
}

// 具体产品 - Mac
class MacButton extends Button {
  render() {
    console.log('Mac Button')
  }
}

class MacCheckbox extends Checkbox {
  render() {
    console.log('Mac Checkbox')
  }
}

// 抽象工厂
class GUIFactory {
  createButton() {}
  createCheckbox() {}
}

// 具体工厂
class WindowsFactory extends GUIFactory {
  createButton() {
    return new WindowsButton()
  }

  createCheckbox() {
    return new WindowsCheckbox()
  }
}

class MacFactory extends GUIFactory {
  createButton() {
    return new MacButton()
  }

  createCheckbox() {
    return new MacCheckbox()
  }
}

// 客户端代码
class Application {
  constructor(factory) {
    this.factory = factory
  }

  render() {
    const button = this.factory.createButton()
    const checkbox = this.factory.createCheckbox()

    button.render()
    checkbox.render()
  }
}

// 使用
const factory = os === 'windows' ? new WindowsFactory() : new MacFactory()
const app = new Application(factory)
app.render()
```

### 应用场景

- 跨平台 UI 工具包
- 主题系统(浅色/深色主题)
- 数据库驱动族

### vs 工厂方法

| 特性     | 工厂方法 | 抽象工厂 |
| -------- | -------- | -------- |
| 创建对象 | 单个产品 | 产品族   |
| 继承     | 是       | 组合     |
| 复杂度   | 低       | 高       |

## 建造者 (Builder)

### 意图

分步构建复杂对象,允许不同表示。

### 实现

```javascript
class House {
  constructor() {
    this.walls = 0
    this.doors = 0
    this.windows = 0
    this.hasGarage = false
    this.hasSwimmingPool = false
  }

  describe() {
    return `House with ${this.walls} walls, ${this.doors} doors, 
            ${this.windows} windows, 
            ${this.hasGarage ? 'with' : 'without'} garage,
            ${this.hasSwimmingPool ? 'with' : 'without'} pool`
  }
}

class HouseBuilder {
  constructor() {
    this.house = new House()
  }

  setWalls(count) {
    this.house.walls = count
    return this // 链式调用
  }

  setDoors(count) {
    this.house.doors = count
    return this
  }

  setWindows(count) {
    this.house.windows = count
    return this
  }

  setGarage(hasGarage) {
    this.house.hasGarage = hasGarage
    return this
  }

  setSwimmingPool(hasPool) {
    this.house.hasSwimmingPool = hasPool
    return this
  }

  build() {
    return this.house
  }
}

// 使用 - 链式调用
const house = new HouseBuilder()
  .setWalls(4)
  .setDoors(2)
  .setWindows(6)
  .setGarage(true)
  .setSwimmingPool(false)
  .build()

console.log(house.describe())
```

### 导演类(Director)

```javascript
class HouseDirector {
  constructor(builder) {
    this.builder = builder
  }

  constructMinimalHouse() {
    return this.builder.setWalls(4).setDoors(1).setWindows(2).build()
  }

  constructLuxuryHouse() {
    return this.builder
      .setWalls(6)
      .setDoors(3)
      .setWindows(10)
      .setGarage(true)
      .setSwimmingPool(true)
      .build()
  }
}

// 使用
const builder = new HouseBuilder()
const director = new HouseDirector(builder)
const luxuryHouse = director.constructLuxuryHouse()
```

### 应用场景

- 复杂对象构建(HTTP 请求、SQL 查询)
- 文档生成器
- UI 组件构建

### 优点

✅ 分步构建,清晰可控
✅ 可复用相同的构建代码
✅ 符合单一职责原则

## 原型 (Prototype)

### 意图

通过克隆现有对象创建新对象,避免重复初始化。

### 实现

```javascript
class Circle {
  constructor(radius, color) {
    this.radius = radius
    this.color = color
  }

  clone() {
    // 深拷贝
    return new Circle(this.radius, this.color)
  }

  describe() {
    return `Circle: radius=${this.radius}, color=${this.color}`
  }
}

// 使用
const original = new Circle(5, 'red')
const clone = original.clone()

console.log(original.describe()) // Circle: radius=5, color=red
console.log(clone.describe()) // Circle: radius=5, color=red
console.log(original === clone) // false
```

### JavaScript 原生支持

```javascript
// Object.create
const prototype = {
  greet() {
    return `Hello, I'm ${this.name}`
  },
}

const obj1 = Object.create(prototype)
obj1.name = 'Alice'

const obj2 = Object.create(prototype)
obj2.name = 'Bob'

console.log(obj1.greet()) // Hello, I'm Alice
console.log(obj2.greet()) // Hello, I'm Bob
```

### 深拷贝实现

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (hash.has(obj)) {
    return hash.get(obj) // 处理循环引用
  }

  const clone = Array.isArray(obj) ? [] : {}
  hash.set(obj, clone)

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash)
    }
  }

  return clone
}

// 使用
const original = {
  name: 'Alice',
  address: {
    city: 'Beijing',
    street: 'Main St',
  },
  hobbies: ['reading', 'coding'],
}

const clone = deepClone(original)
clone.address.city = 'Shanghai'

console.log(original.address.city) // Beijing (不受影响)
console.log(clone.address.city) // Shanghai
```

### 应用场景

- 游戏对象克隆(敌人、道具)
- 配置对象复制
- 撤销/重做功能

### 优点

✅ 避免重复初始化
✅ 运行时动态创建
✅ 简化复杂对象创建

## 模式对比

| 模式     | 核心思想       | 适用场景        |
| -------- | -------------- | --------------- |
| 单例     | 唯一实例       | 全局状态管理    |
| 工厂方法 | 子类决定实例化 | 扩展新产品类型  |
| 抽象工厂 | 创建产品族     | 跨平台/主题系统 |
| 建造者   | 分步构建       | 复杂对象构造    |
| 原型     | 克隆对象       | 避免重复初始化  |

## 实践建议

1. **优先使用简单工厂**: 除非确实需要扩展性
2. **避免过度使用单例**: 考虑依赖注入
3. **建造者适合链式调用**: 提高可读性
4. **原型注意深拷贝**: 避免浅拷贝陷阱
5. **TypeScript 增强类型安全**: 利用接口和泛型

## 下一步

- [结构型模式](./structural) - 学习如何组织类和对象
- [行为型模式](./behavioral) - 学习对象间通信
