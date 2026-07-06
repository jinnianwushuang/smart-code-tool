# 行为型模式

行为型模式关注对象之间的通信、责任分配和算法封装,使对象间的协作更加灵活。

## 责任链 (Chain of Responsibility)

### 意图

将请求沿处理者链传递,直到有对象处理它。

### 实现

```javascript
class Handler {
  constructor(nextHandler = null) {
    this.nextHandler = nextHandler
  }

  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request)
    }
    return null
  }
}

class AuthHandler extends Handler {
  handle(request) {
    if (!request.user) {
      throw new Error('Authentication required')
    }
    console.log('Auth passed')
    return super.handle(request)
  }
}

class ValidationHandler extends Handler {
  handle(request) {
    if (!request.data || Object.keys(request.data).length === 0) {
      throw new Error('Validation failed: empty data')
    }
    console.log('Validation passed')
    return super.handle(request)
  }
}

class LoggingHandler extends Handler {
  handle(request) {
    console.log(`Processing request: ${JSON.stringify(request)}`)
    return super.handle(request)
  }
}

class BusinessHandler extends Handler {
  handle(request) {
    console.log('Business logic executed')
    return { status: 'success', data: request.data }
  }
}

// 构建责任链
const chain = new AuthHandler(new ValidationHandler(new LoggingHandler(new BusinessHandler())))

// 使用
try {
  const result = chain.handle({
    user: 'alice',
    data: { name: 'test' },
  })
  console.log(result)
} catch (error) {
  console.error(error.message)
}
```

### 应用场景

- 中间件系统(Express/Koa)
- 事件处理
- 日志记录链
- 权限验证链

### Express 中间件示例

```javascript
const express = require('express')
const app = express()

// 责任链模式的典型应用
app.use(authMiddleware) // 认证
app.use(validationMiddleware) // 验证
app.use(loggingMiddleware) // 日志
app.use((req, res) => {
  // 业务逻辑
  res.json({ message: 'Success' })
})
```

## 命令 (Command)

### 意图

将请求封装为对象,支持参数化、队列化和日志化。

### 实现

```javascript
// 命令接口
class Command {
  execute() {}
  undo() {}
}

// 接收者
class Light {
  constructor(name) {
    this.name = name
    this.isOn = false
  }

  turnOn() {
    this.isOn = true
    console.log(`${this.name} light is ON`)
  }

  turnOff() {
    this.isOn = false
    console.log(`${this.name} light is OFF`)
  }
}

// 具体命令
class LightOnCommand extends Command {
  constructor(light) {
    super()
    this.light = light
  }

  execute() {
    this.light.turnOn()
  }

  undo() {
    this.light.turnOff()
  }
}

class LightOffCommand extends Command {
  constructor(light) {
    super()
    this.light = light
  }

  execute() {
    this.light.turnOff()
  }

  undo() {
    this.light.turnOn()
  }
}

// 调用者
class RemoteControl {
  constructor() {
    this.commands = []
    this.history = []
  }

  setCommand(command) {
    this.commands.push(command)
  }

  pressButton(index) {
    const command = this.commands[index]
    if (command) {
      command.execute()
      this.history.push(command)
    }
  }

  pressUndo() {
    const lastCommand = this.history.pop()
    if (lastCommand) {
      lastCommand.undo()
    }
  }
}

// 使用
const livingRoomLight = new Light('Living Room')
const bedroomLight = new Light('Bedroom')

const remote = new RemoteControl()
remote.setCommand(new LightOnCommand(livingRoomLight))
remote.setCommand(new LightOffCommand(livingRoomLight))
remote.setCommand(new LightOnCommand(bedroomLight))

remote.pressButton(0) // Living Room light is ON
remote.pressButton(2) // Bedroom light is ON
remote.pressUndo() // Bedroom light is OFF
```

### 宏命令

```javascript
class MacroCommand extends Command {
  constructor(commands) {
    super()
    this.commands = commands
  }

  execute() {
    this.commands.forEach((cmd) => cmd.execute())
  }

  undo() {
    this.commands
      .slice()
      .reverse()
      .forEach((cmd) => cmd.undo())
  }
}

// 一键场景模式
const morningScene = new MacroCommand([
  new LightOnCommand(livingRoomLight),
  new LightOnCommand(bedroomLight),
  // ... 更多命令
])

remote.setCommand(morningScene)
remote.pressButton(3) // 执行所有命令
```

### 应用场景

- 撤销/重做功能
- 任务队列
- 事务处理
- 宏录制
- 请求日志

## 迭代器 (Iterator)

### 意图

提供一种方法顺序访问聚合对象的各个元素,而不暴露其内部表示。

### 实现

```javascript
// 自定义迭代器
class BookShelf {
  constructor() {
    this.books = []
  }

  addBook(book) {
    this.books.push(book)
  }

  [Symbol.iterator]() {
    let index = 0
    const books = this.books

    return {
      next() {
        if (index < books.length) {
          return { value: books[index++], done: false }
        } else {
          return { done: true }
        }
      },
    }
  }
}

// 使用
const shelf = new BookShelf()
shelf.addBook('Design Patterns')
shelf.addBook('Clean Code')
shelf.addBook('Refactoring')

for (const book of shelf) {
  console.log(book)
}

// 或使用展开运算符
const allBooks = [...shelf]
```

### 反向迭代器

```javascript
class ReverseIterator {
  constructor(collection) {
    this.collection = collection
  }

  [Symbol.iterator]() {
    const items = this.collection
    let index = items.length - 1

    return {
      next() {
        if (index >= 0) {
          return { value: items[index--], done: false }
        } else {
          return { done: true }
        }
      },
    }
  }
}

// 使用
const reverseShelf = new ReverseIterator(shelf.books)
for (const book of reverseShelf) {
  console.log(book) // 倒序输出
}
```

### 过滤迭代器

```javascript
class FilteredIterator {
  constructor(collection, predicate) {
    this.collection = collection
    this.predicate = predicate
  }

  [Symbol.iterator]() {
    const items = this.collection.filter(this.predicate)
    let index = 0

    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false }
        } else {
          return { done: true }
        }
      },
    }
  }
}

// 使用 - 只迭代价格大于 50 的书
const expensiveBooks = new FilteredIterator(shelf.books, (book) => book.price > 50)
```

### 应用场景

- 集合遍历
- 数据库查询结果
- 文件系统遍历
- 树/图遍历

## 中介者 (Mediator)

### 意图

定义一个中介对象来封装一系列对象之间的交互,减少耦合。

### 实现

```javascript
class ChatMediator {
  constructor() {
    this.users = []
  }

  addUser(user) {
    this.users.push(user)
    user.setMediator(this)
  }

  sendMessage(message, sender) {
    this.users.forEach((user) => {
      if (user !== sender) {
        user.receiveMessage(message, sender)
      }
    })
  }
}

class User {
  constructor(name) {
    this.name = name
    this.mediator = null
  }

  setMediator(mediator) {
    this.mediator = mediator
  }

  sendMessage(message) {
    console.log(`${this.name} sends: ${message}`)
    this.mediator.sendMessage(message, this)
  }

  receiveMessage(message, sender) {
    console.log(`${this.name} receives from ${sender.name}: ${message}`)
  }
}

// 使用
const mediator = new ChatMediator()

const alice = new User('Alice')
const bob = new User('Bob')
const charlie = new User('Charlie')

mediator.addUser(alice)
mediator.addUser(bob)
mediator.addUser(charlie)

alice.sendMessage('Hello everyone!')
// Bob receives from Alice: Hello everyone!
// Charlie receives from Alice: Hello everyone!
```

### 应用场景

- 聊天室
- MVC 框架中的 Controller
- GUI 组件协调
- 航空交通管制系统

### vs 观察者

| 特性     | 中介者                  | 观察者             |
| -------- | ----------------------- | ------------------ |
| 通信方式 | 集中式                  | 分布式             |
| 耦合度   | 对象间解耦,都依赖中介者 | 主题和观察者松耦合 |
| 复杂度   | 中介者可能变得复杂      | 简单直接           |

## 备忘录 (Memento)

### 意图

在不破坏封装性的前提下,捕获并外部化对象的内部状态,以便后续恢复。

### 实现

```javascript
// 备忘录
class Memento {
  constructor(state) {
    this.state = state
  }

  getState() {
    return this.state
  }
}

// 发起人
class TextEditor {
  constructor() {
    this.content = ''
  }

  type(text) {
    this.content += text
  }

  save() {
    return new Memento(this.content)
  }

  restore(memento) {
    this.content = memento.getState()
  }

  getContent() {
    return this.content
  }
}

// 管理者
class History {
  constructor() {
    this.mementos = []
  }

  push(memento) {
    this.mementos.push(memento)
  }

  pop() {
    return this.mementos.pop()
  }
}

// 使用
const editor = new TextEditor()
const history = new History()

editor.type('Hello')
history.push(editor.save())

editor.type(' World')
history.push(editor.save())

editor.type('!!!')
console.log(editor.getContent()) // Hello World!!!

// 撤销
editor.restore(history.pop())
console.log(editor.getContent()) // Hello World

editor.restore(history.pop())
console.log(editor.getContent()) // Hello
```

### 应用场景

- 撤销/重做
- 游戏存档
- 事务回滚
- 版本控制

## 观察者 (Observer)

### 意图

定义对象间的一对多依赖关系,当一个对象状态改变时,所有依赖者都会收到通知。

### 实现

```javascript
class Subject {
  constructor() {
    this.observers = []
  }

  subscribe(observer) {
    this.observers.push(observer)
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data))
  }
}

class Observer {
  constructor(name) {
    this.name = name
  }

  update(data) {
    console.log(`${this.name} received: ${data}`)
  }
}

// 使用
const subject = new Subject()

const observer1 = new Observer('Observer 1')
const observer2 = new Observer('Observer 2')

subject.subscribe(observer1)
subject.subscribe(observer2)

subject.notify('First notification')
// Observer 1 received: First notification
// Observer 2 received: First notification

subject.unsubscribe(observer1)
subject.notify('Second notification')
// Observer 2 received: Second notification
```

### EventEmitter 实现

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
    return this // 链式调用
  }

  off(event, listener) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter((l) => l !== listener)
    return this
  }

  emit(event, ...args) {
    if (!this.events[event]) return
    this.events[event].forEach((listener) => listener(...args))
    return this
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }
}

// 使用
const emitter = new EventEmitter()

emitter.on('data', (data) => {
  console.log('Received:', data)
})

emitter.once('connect', () => {
  console.log('Connected!') // 只触发一次
})

emitter.emit('data', 'Hello')
emitter.emit('connect')
emitter.emit('connect') // 不会再次触发
```

### 应用场景

- 事件系统
- MVC 模式
- 响应式编程
- 发布-订阅系统
- Redux/Vuex 状态管理

## 状态 (State)

### 意图

允许对象在内部状态改变时改变其行为。

### 实现

```javascript
// 状态接口
class State {
  insertCoin(context) {}
  ejectCoin(context) {}
  selectProduct(context) {}
  dispense(context) {}
}

// 具体状态
class NoCoinState extends State {
  insertCoin(context) {
    console.log('Coin inserted')
    context.setState(context.hasCoinState)
  }

  ejectCoin(context) {
    console.log('No coin to eject')
  }

  selectProduct(context) {
    console.log('Please insert coin first')
  }

  dispense(context) {
    console.log('Please insert coin first')
  }
}

class HasCoinState extends State {
  insertCoin(context) {
    console.log('Already has coin')
  }

  ejectCoin(context) {
    console.log('Coin returned')
    context.setState(context.noCoinState)
  }

  selectProduct(context) {
    console.log('Product selected')
    context.setState(context.soldState)
  }

  dispense(context) {
    console.log('Please select product first')
  }
}

class SoldState extends State {
  insertCoin(context) {
    console.log('Please wait, dispensing...')
  }

  ejectCoin(context) {
    console.log('Cannot eject, already sold')
  }

  selectProduct(context) {
    console.log('Already selected')
  }

  dispense(context) {
    console.log('Product dispensed')
    context.setState(context.noCoinState)
  }
}

// 上下文
class VendingMachine {
  constructor() {
    this.noCoinState = new NoCoinState()
    this.hasCoinState = new HasCoinState()
    this.soldState = new SoldState()

    this.currentState = this.noCoinState
  }

  setState(state) {
    this.currentState = state
  }

  insertCoin() {
    this.currentState.insertCoin(this)
  }

  ejectCoin() {
    this.currentState.ejectCoin(this)
  }

  selectProduct() {
    this.currentState.selectProduct(this)
  }

  dispense() {
    this.currentState.dispense(this)
  }
}

// 使用
const machine = new VendingMachine()
machine.insertCoin() // Coin inserted
machine.selectProduct() // Product selected
machine.dispense() // Product dispensed
```

### 应用场景

- 工作流引擎
- 游戏角色状态
- TCP 连接状态
- UI 组件状态

## 策略 (Strategy)

### 意图

定义一系列算法,使它们可以互相替换。

### 实现

```javascript
// 策略接口
class PaymentStrategy {
  pay(amount) {}
}

// 具体策略
class CreditCardPayment extends PaymentStrategy {
  constructor(cardNumber) {
    super()
    this.cardNumber = cardNumber
  }

  pay(amount) {
    console.log(`Paid $${amount} using credit card ${this.cardNumber}`)
  }
}

class PayPalPayment extends PaymentStrategy {
  constructor(email) {
    super()
    this.email = email
  }

  pay(amount) {
    console.log(`Paid $${amount} using PayPal (${this.email})`)
  }
}

class CryptoPayment extends PaymentStrategy {
  constructor(walletAddress) {
    super()
    this.walletAddress = walletAddress
  }

  pay(amount) {
    console.log(`Paid $${amount} using crypto (${this.walletAddress})`)
  }
}

// 上下文
class ShoppingCart {
  constructor() {
    this.items = []
    this.paymentStrategy = null
  }

  addItem(item) {
    this.items.push(item)
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy
  }

  checkout() {
    const total = this.items.reduce((sum, item) => sum + item.price, 0)

    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set')
    }

    this.paymentStrategy.pay(total)
  }
}

// 使用
const cart = new ShoppingCart()
cart.addItem({ name: 'Book', price: 20 })
cart.addItem({ name: 'Pen', price: 5 })

cart.setPaymentStrategy(new CreditCardPayment('1234-5678'))
cart.checkout() // Paid $25 using credit card 1234-5678

cart.setPaymentStrategy(new PayPalPayment('user@example.com'))
cart.checkout() // Paid $25 using PayPal (user@example.com)
```

### 排序策略

```javascript
class Sorter {
  constructor(strategy) {
    this.strategy = strategy
  }

  setStrategy(strategy) {
    this.strategy = strategy
  }

  sort(arr) {
    return this.strategy.sort([...arr])
  }
}

const bubbleSort = {
  sort: (arr) => {
    // 冒泡排序实现
    const n = arr.length
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        }
      }
    }
    return arr
  },
}

const quickSort = {
  sort: (arr) => {
    if (arr.length <= 1) return arr

    const pivot = arr[Math.floor(arr.length / 2)]
    const left = arr.filter((x) => x < pivot)
    const middle = arr.filter((x) => x === pivot)
    const right = arr.filter((x) => x > pivot)

    return [...quickSort.sort(left), ...middle, ...quickSort.sort(right)]
  },
}

const sorter = new Sorter(bubbleSort)
console.log(sorter.sort([5, 3, 8, 1, 2]))

sorter.setStrategy(quickSort)
console.log(sorter.sort([5, 3, 8, 1, 2]))
```

### 应用场景

- 支付方式选择
- 排序算法
- 压缩算法
- 路由策略
- 验证规则

## 模板方法 (Template Method)

### 意图

定义算法骨架,将某些步骤延迟到子类实现。

### 实现

```javascript
class DataProcessor {
  // 模板方法 - 定义算法骨架
  process(filePath) {
    this.readFile(filePath)
    this.parseData()
    this.analyze()
    this.report()
  }

  // 基本方法 - 已实现
  readFile(filePath) {
    console.log(`Reading file: ${filePath}`)
    this.rawData = `Content from ${filePath}`
  }

  report() {
    console.log('Generating report...')
    console.log(`Analysis complete. Results: ${this.result}`)
  }

  // 抽象方法 - 由子类实现
  parseData() {
    throw new Error('Abstract method: must be implemented by subclass')
  }

  analyze() {
    throw new Error('Abstract method: must be implemented by subclass')
  }
}

class CSVProcessor extends DataProcessor {
  parseData() {
    console.log('Parsing CSV data')
    this.parsedData = this.rawData.split(',')
  }

  analyze() {
    console.log('Analyzing CSV data')
    this.result = `CSV analysis: ${this.parsedData.length} fields`
  }
}

class JSONProcessor extends DataProcessor {
  parseData() {
    console.log('Parsing JSON data')
    this.parsedData = JSON.parse(this.rawData)
  }

  analyze() {
    console.log('Analyzing JSON data')
    this.result = `JSON analysis: ${Object.keys(this.parsedData).length} keys`
  }
}

// 使用
const csvProcessor = new CSVProcessor()
csvProcessor.process('data.csv')

const jsonProcessor = new JSONProcessor()
jsonProcessor.process('data.json')
```

### 钩子方法

```javascript
class Game {
  play() {
    this.initialize()
    this.startPlay()

    if (this.isGameOver()) {
      this.endGame()
    }
  }

  initialize() {
    console.log('Game initialized')
  }

  startPlay() {
    throw new Error('Must implement startPlay')
  }

  endGame() {
    console.log('Game ended')
  }

  // 钩子方法 - 可选覆盖
  isGameOver() {
    return true // 默认立即结束
  }
}

class Chess extends Game {
  startPlay() {
    console.log('Chess game started')
  }

  isGameOver() {
    // 实际应该检查棋盘状态
    return false // 继续游戏
  }
}
```

### 应用场景

- 框架设计
- 测试框架
- 数据处理管道
- 游戏循环

## 访问者 (Visitor)

### 意图

在不修改元素类的前提下,定义作用于这些元素的新操作。

### 实现

```javascript
// 访问者接口
class Visitor {
  visitCircle(circle) {}
  visitRectangle(rectangle) {}
}

// 元素接口
class Shape {
  accept(visitor) {}
}

// 具体元素
class Circle extends Shape {
  constructor(radius) {
    super()
    this.radius = radius
  }

  accept(visitor) {
    visitor.visitCircle(this)
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super()
    this.width = width
    this.height = height
  }

  accept(visitor) {
    visitor.visitRectangle(this)
  }
}

// 具体访问者 - 计算面积
class AreaCalculator extends Visitor {
  constructor() {
    super()
    this.totalArea = 0
  }

  visitCircle(circle) {
    const area = Math.PI * circle.radius * circle.radius
    this.totalArea += area
    console.log(`Circle area: ${area.toFixed(2)}`)
  }

  visitRectangle(rectangle) {
    const area = rectangle.width * rectangle.height
    this.totalArea += area
    console.log(`Rectangle area: ${area}`)
  }
}

// 具体访问者 - 绘制
class Drawer extends Visitor {
  visitCircle(circle) {
    console.log(`Drawing circle with radius ${circle.radius}`)
  }

  visitRectangle(rectangle) {
    console.log(`Drawing rectangle ${rectangle.width}x${rectangle.height}`)
  }
}

// 对象结构
class Drawing {
  constructor() {
    this.shapes = []
  }

  addShape(shape) {
    this.shapes.push(shape)
  }

  accept(visitor) {
    this.shapes.forEach((shape) => shape.accept(visitor))
  }
}

// 使用
const drawing = new Drawing()
drawing.addShape(new Circle(5))
drawing.addShape(new Rectangle(4, 6))
drawing.addShape(new Circle(3))

const calculator = new AreaCalculator()
drawing.accept(calculator)
console.log(`Total area: ${calculator.totalArea.toFixed(2)}`)

const drawer = new Drawer()
drawing.accept(drawer)
```

### 应用场景

- AST(抽象语法树)遍历
- XML/JSON 解析
- 编译器优化
- 报表生成

### 优缺点

✅ 易于添加新操作
✅ 符合开闭原则
❌ 违反依赖倒置(元素依赖访问者)
❌ 添加新元素类型困难

## 模式对比

| 模式     | 核心思想       | 适用场景         |
| -------- | -------------- | ---------------- |
| 责任链   | 请求传递       | 中间件、事件处理 |
| 命令     | 封装请求       | 撤销/重做、队列  |
| 迭代器   | 统一遍历       | 集合访问         |
| 中介者   | 集中协调       | 多对象交互       |
| 备忘录   | 状态保存       | 撤销/重做、存档  |
| 观察者   | 一对多通知     | 事件系统         |
| 状态     | 状态驱动行为   | 状态机           |
| 策略     | 算法互换       | 可替换算法       |
| 模板方法 | 算法骨架       | 框架设计         |
| 访问者   | 分离操作与结构 | AST、报表        |

## 实践建议

1. **责任链**: 注意链的长度,避免性能问题
2. **命令**: 结合宏命令实现批量操作
3. **迭代器**: 优先使用 ES6 Symbol.iterator
4. **中介者**: 防止中介者变成"上帝对象"
5. **备忘录**: 注意内存占用,限制历史记录数量
6. **观察者**: 注意内存泄漏,及时取消订阅
7. **状态**: 状态转换逻辑可能复杂,考虑状态表
8. **策略**: 结合工厂模式创建策略
9. **模板方法**: 使用钩子方法提供扩展点
10. **访问者**: 仅在元素结构稳定时使用

## JavaScript 特殊性

- **函数即策略**: 很多行为型模式可用高阶函数简化
- **EventEmitter**: Node.js 内置观察者模式实现
- **Promise/Async**: 异步命令的自然实现
- **Generator**: 天然支持迭代器协议

## 下一步

回顾所有设计模式,根据实际需求选择合适的模式组合使用。记住:**模式是工具,不是目标**。
