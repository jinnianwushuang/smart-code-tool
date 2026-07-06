# 结构型模式

结构型模式关注如何组合类和对象以形成更大的结构,同时保持结构的灵活性和高效性。

## 适配器 (Adapter)

### 意图

将一个类的接口转换成客户希望的另一个接口,使不兼容的类能够一起工作。

### 实现

```javascript
// 旧系统 - 不兼容的接口
class LegacyPayment {
  processPayment(amount) {
    console.log(`Legacy payment: $${amount}`)
    return { status: 'success', legacyId: Date.now() }
  }
}

// 新系统期望的接口
class PaymentProcessor {
  pay(amount) {}
  refund(amount) {}
}

// 适配器
class PaymentAdapter extends PaymentProcessor {
  constructor(legacyPayment) {
    super()
    this.legacyPayment = legacyPayment
  }

  pay(amount) {
    const result = this.legacyPayment.processPayment(amount)
    return {
      success: result.status === 'success',
      transactionId: result.legacyId,
    }
  }

  refund(amount) {
    // 旧系统不支持退款,返回错误
    throw new Error('Refund not supported by legacy system')
  }
}

// 使用
const legacy = new LegacyPayment()
const adapter = new PaymentAdapter(legacy)
adapter.pay(100) // 适配调用
```

### 对象适配器(组合方式)

```javascript
class EuropeanSocket {
  plugIn() {
    return 'European power'
  }
}

class AmericanSocket {
  connect() {
    return 'American power'
  }
}

// 对象适配器
class SocketAdapter {
  constructor(europeanSocket) {
    this.europeanSocket = europeanSocket
  }

  connect() {
    return this.europeanSocket.plugIn()
  }
}

// 使用
const euSocket = new EuropeanSocket()
const adapter = new SocketAdapter(euSocket)
console.log(adapter.connect()) // European power
```

### 应用场景

- API 版本兼容
- 第三方库集成
- 遗留系统迁移
- 数据格式转换(JSON ↔ XML)

### JavaScript 特色实现

```javascript
// 函数式适配器
const adaptLogger = (oldLogger) => ({
  info: (msg) => oldLogger.log('INFO', msg),
  error: (msg) => oldLogger.log('ERROR', msg),
  warn: (msg) => oldLogger.log('WARN', msg),
})

// 使用
const adaptedLogger = adaptLogger(legacyLogger)
adaptedLogger.info('Hello')
```

## 桥接 (Bridge)

### 意图

将抽象与实现分离,使它们可以独立变化。

### 实现

```javascript
// 实现接口
class DrawingAPI {
  drawCircle(x, y, radius) {}
}

// 具体实现
class VectorAPI extends DrawingAPI {
  drawCircle(x, y, radius) {
    console.log(`Vector: Circle at (${x}, ${y}) with radius ${radius}`)
  }
}

class RasterAPI extends DrawingAPI {
  drawCircle(x, y, radius) {
    console.log(`Raster: Circle at (${x}, ${y}) with radius ${radius}`)
  }
}

// 抽象
class Shape {
  constructor(drawingAPI) {
    this.drawingAPI = drawingAPI
  }

  draw() {}
  resize(factor) {}
}

// 扩展抽象
class Circle extends Shape {
  constructor(x, y, radius, drawingAPI) {
    super(drawingAPI)
    this.x = x
    this.y = y
    this.radius = radius
  }

  draw() {
    this.drawingAPI.drawCircle(this.x, this.y, this.radius)
  }

  resize(factor) {
    this.radius *= factor
  }
}

// 使用 - 可以独立变化抽象和实现
const vectorCircle = new Circle(5, 5, 10, new VectorAPI())
vectorCircle.draw() // Vector: Circle at (5, 5) with radius 10

const rasterCircle = new Circle(5, 5, 10, new RasterAPI())
rasterCircle.draw() // Raster: Circle at (5, 5) with radius 10
```

### 应用场景

- 跨平台 UI(抽象:控件,实现:Windows/Mac/Linux)
- 数据库驱动(抽象:查询,实现:MySQL/PostgreSQL)
- 图形渲染(抽象:形状,实现:OpenGL/DirectX/Vulkan)

### vs 适配器

| 特性 | 适配器     | 桥接           |
| ---- | ---------- | -------------- |
| 目的 | 兼容接口   | 分离抽象与实现 |
| 时机 | 事后       | 事前设计       |
| 结构 | 包装现有类 | 两个独立层次   |

## 组合 (Composite)

### 意图

将对象组合成树形结构以表示"部分-整体"的层次结构,使客户端统一处理单个对象和组合对象。

### 实现

```javascript
class FileSystemComponent {
  constructor(name) {
    this.name = name
  }

  getSize() {
    throw new Error('Abstract method')
  }

  display(indent = 0) {
    throw new Error('Abstract method')
  }
}

class File extends FileSystemComponent {
  constructor(name, size) {
    super(name)
    this.size = size
  }

  getSize() {
    return this.size
  }

  display(indent = 0) {
    console.log(' '.repeat(indent) + `📄 ${this.name} (${this.size}KB)`)
  }
}

class Folder extends FileSystemComponent {
  constructor(name) {
    super(name)
    this.children = []
  }

  add(component) {
    this.children.push(component)
  }

  remove(component) {
    const index = this.children.indexOf(component)
    if (index > -1) {
      this.children.splice(index, 1)
    }
  }

  getSize() {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0)
  }

  display(indent = 0) {
    console.log(' '.repeat(indent) + `📁 ${this.name} (${this.getSize()}KB)`)
    this.children.forEach((child) => child.display(indent + 2))
  }
}

// 使用
const root = new Folder('root')

const docs = new Folder('docs')
docs.add(new File('readme.md', 5))
docs.add(new File('guide.pdf', 100))

const src = new Folder('src')
src.add(new File('index.js', 10))
src.add(new File('app.js', 15))

root.add(docs)
root.add(src)
root.add(new File('.gitignore', 1))

root.display()
/*
📁 root (131KB)
  📁 docs (105KB)
    📄 readme.md (5KB)
    📄 guide.pdf (100KB)
  📁 src (25KB)
    📄 index.js (10KB)
    📄 app.js (15KB)
  📄 .gitignore (1KB)
*/
```

### 应用场景

- 文件系统
- UI 组件树
- 组织结构图
- HTML DOM 树

### 优点

✅ 统一处理简单和复杂元素
✅ 易于添加新组件类型
✅ 符合开闭原则

## 装饰器 (Decorator)

### 意图

动态地给对象添加额外职责,比继承更灵活。

### 实现

```javascript
// 基础组件
class Coffee {
  cost() {
    return 5
  }

  description() {
    return 'Simple Coffee'
  }
}

// 装饰器基类
class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee
  }

  cost() {
    return this.coffee.cost()
  }

  description() {
    return this.coffee.description()
  }
}

// 具体装饰器
class Milk extends CoffeeDecorator {
  cost() {
    return super.cost() + 2
  }

  description() {
    return `${super.description()}, Milk`
  }
}

class Sugar extends CoffeeDecorator {
  cost() {
    return super.cost() + 1
  }

  description() {
    return `${super.description()}, Sugar`
  }
}

class Whip extends CoffeeDecorator {
  cost() {
    return super.cost() + 3
  }

  description() {
    return `${super.description()}, Whip`
  }
}

// 使用 - 链式装饰
let order = new Coffee()
order = new Milk(order)
order = new Sugar(order)
order = new Whip(order)

console.log(order.description()) // Simple Coffee, Milk, Sugar, Whip
console.log(order.cost()) // 11
```

### JavaScript 装饰器语法(实验性)

```javascript
// TypeScript/Babel 装饰器
function log(target, name, descriptor) {
  const original = descriptor.value

  descriptor.value = function (...args) {
    console.log(`Calling ${name} with`, args)
    const result = original.apply(this, args)
    console.log(`Result:`, result)
    return result
  }

  return descriptor
}

class Calculator {
  @log
  add(a, b) {
    return a + b
  }
}
```

### 函数式装饰器

```javascript
// 高阶函数实现装饰
const withLogging =
  (fn) =>
  (...args) => {
    console.log(`Calling with args:`, args)
    const result = fn(...args)
    console.log(`Result:`, result)
    return result
  }

const withCaching = (fn) => {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// 组合装饰器
const expensiveCalculation = (n) => {
  console.log('Calculating...')
  return n * n
}

const decorated = withCaching(withLogging(expensiveCalculation))
decorated(5) // 第一次计算
decorated(5) // 从缓存返回
```

### 应用场景

- 日志记录
- 性能监控
- 权限验证
- 缓存
- 输入验证

### vs 继承

| 特性   | 装饰器         | 继承       |
| ------ | -------------- | ---------- |
| 灵活性 | 运行时动态添加 | 编译时静态 |
| 组合   | 可以任意组合   | 单一继承链 |
| 类爆炸 | 避免           | 可能导致   |

## 外观 (Facade)

### 意图

为子系统提供统一的简化接口。

### 实现

```javascript
// 复杂子系统
class CPU {
  freeze() {
    console.log('CPU frozen')
  }
  jump(position) {
    console.log(`CPU jumped to ${position}`)
  }
  execute() {
    console.log('CPU executing')
  }
}

class Memory {
  load(position, data) {
    console.log(`Memory loaded ${data} at ${position}`)
  }
}

class HardDrive {
  read(position, size) {
    console.log(`HardDrive read ${size} bytes from ${position}`)
    return 'data'
  }
}

// 外观
class ComputerFacade {
  constructor() {
    this.cpu = new CPU()
    this.memory = new Memory()
    this.hardDrive = new HardDrive()
  }

  start() {
    console.log('Starting computer...')
    this.cpu.freeze()
    this.memory.load('0x00', this.hardDrive.read('0x00', 1024))
    this.cpu.jump('0x00')
    this.cpu.execute()
    console.log('Computer started')
  }
}

// 使用 - 简化接口
const computer = new ComputerFacade()
computer.start()
```

### 实际示例:API 客户端

```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`)
    return response.json()
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }
}

// 外观 - 简化的业务接口
class UserService {
  constructor() {
    this.api = new APIClient('https://api.example.com')
  }

  async getUsers() {
    return this.api.get('/users')
  }

  async getUser(id) {
    return this.api.get(`/users/${id}`)
  }

  async createUser(data) {
    return this.api.post('/users', data)
  }
}

// 使用
const userService = new UserService()
const users = await userService.getUsers()
```

### 应用场景

- 简化复杂库的使用
- 提供统一入口点
- 解耦客户端和子系统

## 享元 (Flyweight)

### 意图

通过共享技术有效地支持大量细粒度对象。

### 实现

```javascript
class TreeType {
  constructor(name, color, texture) {
    this.name = name
    this.color = color
    this.texture = texture
  }

  render(x, y) {
    console.log(`Rendering ${this.name} tree at (${x}, ${y}) with ${this.color} color`)
  }
}

// 享元工厂
class TreeFactory {
  constructor() {
    this.treeTypes = new Map()
  }

  getTreeType(name, color, texture) {
    const key = `${name}-${color}-${texture}`

    if (!this.treeTypes.has(key)) {
      this.treeTypes.set(key, new TreeType(name, color, texture))
    }

    return this.treeTypes.get(key)
  }
}

// 上下文
class Tree {
  constructor(x, y, treeType) {
    this.x = x
    this.y = y
    this.treeType = treeType
  }

  render() {
    this.treeType.render(this.x, this.y)
  }
}

// 森林
class Forest {
  constructor() {
    this.trees = []
    this.factory = new TreeFactory()
  }

  plantTree(x, y, name, color, texture) {
    const treeType = this.factory.getTreeType(name, color, texture)
    const tree = new Tree(x, y, treeType)
    this.trees.push(tree)
  }

  render() {
    this.trees.forEach((tree) => tree.render())
  }
}

// 使用 - 大量树木共享少量 TreeType
const forest = new Forest()
forest.plantTree(1, 2, 'Oak', 'green', 'rough')
forest.plantTree(3, 4, 'Oak', 'green', 'rough') // 共享同一个 TreeType
forest.plantTree(5, 6, 'Pine', 'dark green', 'smooth')

console.log(forest.trees.length) // 3 棵树
console.log(forest.factory.treeTypes.size) // 2 种类型(共享)

forest.render()
```

### 应用场景

- 游戏中的大量相似对象(树木、粒子)
- 文本编辑器中的字符样式
- GUI 组件的图标
- Canvas 绘图

### 优点

✅ 大幅减少内存占用
✅ 提高性能
✅ 支持大量对象

## 代理 (Proxy)

### 意图

为其他对象提供一种代理以控制对这个对象的访问。

### 实现

#### 虚拟代理(延迟加载)

```javascript
class HeavyImage {
  constructor(url) {
    this.url = url
    this.loaded = false
    this.data = null
  }

  load() {
    if (!this.loaded) {
      console.log(`Loading image from ${this.url}...`)
      // 模拟异步加载
      this.data = `Image data from ${this.url}`
      this.loaded = true
    }
    return this.data
  }

  display() {
    const data = this.load()
    console.log(`Displaying: ${data}`)
  }
}

// 代理
class ImageProxy {
  constructor(url) {
    this.url = url
    this.realImage = null
  }

  display() {
    if (!this.realImage) {
      this.realImage = new HeavyImage(this.url)
    }
    this.realImage.display()
  }
}

// 使用 - 只在需要时加载
const proxy = new ImageProxy('large-photo.jpg')
// ... 可能不会立即显示
proxy.display() // 此时才真正加载
```

#### 保护代理(访问控制)

```javascript
class Document {
  constructor(content, owner) {
    this.content = content
    this.owner = owner
  }

  read(user) {
    if (user !== this.owner) {
      throw new Error('Access denied')
    }
    return this.content
  }
}

class DocumentProxy {
  constructor(document) {
    this.document = document
  }

  read(user) {
    if (this.checkPermission(user)) {
      return this.document.read(user)
    }
    throw new Error('Permission check failed')
  }

  checkPermission(user) {
    // 复杂的权限检查逻辑
    console.log(`Checking permission for ${user}`)
    return user === this.document.owner
  }
}

// 使用
const doc = new Document('Secret content', 'alice')
const proxy = new DocumentProxy(doc)

proxy.read('alice') // OK
proxy.read('bob') // Access denied
```

#### ES6 Proxy

```javascript
const target = {
  name: 'Alice',
  age: 25,
}

const handler = {
  get(target, prop) {
    console.log(`Getting property: ${prop}`)
    return prop in target ? target[prop] : undefined
  },

  set(target, prop, value) {
    console.log(`Setting ${prop} to ${value}`)
    if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
      throw new Error('Invalid age')
    }
    target[prop] = value
    return true
  },
}

const proxy = new Proxy(target, handler)

console.log(proxy.name) // Getting property: name, Alice
proxy.age = 30 // Setting age to 30
proxy.age = -1 // Error: Invalid age
```

### 应用场景

- 懒加载
- 访问控制
- 日志记录
- 缓存
- 远程代理(RPC)

## 模式对比

| 模式   | 核心思想       | 适用场景           |
| ------ | -------------- | ------------------ |
| 适配器 | 接口转换       | 兼容不同接口       |
| 桥接   | 分离抽象与实现 | 多维度变化         |
| 组合   | 树形结构       | 部分-整体关系      |
| 装饰器 | 动态添加职责   | 灵活扩展功能       |
| 外观   | 简化接口       | 隐藏复杂性         |
| 享元   | 共享细粒度对象 | 大量相似对象       |
| 代理   | 控制访问       | 延迟加载、权限控制 |

## 实践建议

1. **适配器**: 优先使用对象适配器(组合)而非类适配器(继承)
2. **桥接**: 当有两个独立变化的维度时考虑
3. **组合**: 确保叶节点和组合节点接口一致
4. **装饰器**: 注意装饰顺序,考虑使用函数式替代
5. **外观**: 不要将所有逻辑都放入外观,保持子系统可访问
6. **享元**: 区分内部状态(可共享)和外部状态(不可共享)
7. **代理**: ES6 Proxy 提供了强大的元编程能力

## 下一步

- [行为型模式](./behavioral) - 学习对象间通信和责任分配
