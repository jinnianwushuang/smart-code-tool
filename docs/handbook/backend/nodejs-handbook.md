# Node.js 开发速查手册

> **版本**: Node.js 24 LTS  
> **最后更新**: 2026-09-16  
> **适用对象**: Node.js 后端开发人员、全栈工程师、工具链开发者

---

## 目录

1. [基础语法](#1-基础语法)
2. [模块系统](#2-模块系统)
3. [异步编程](#3-异步编程)
4. [核心模块：文件与路径](#4-核心模块文件与路径)
5. [核心模块：网络与 HTTP](#5-核心模块网络与-http)
6. [事件与流](#6-事件与流)
7. [错误处理](#7-错误处理)
8. [包管理与项目配置](#8-包管理与项目配置)
9. [内置测试运行器](#9-内置测试运行器)
10. [进程与环境](#10-进程与环境)
11. [常用内置 API](#11-常用内置-api)
12. [性能与调试](#12-性能与调试)
13. [常用命令](#13-常用命令)

---

## 1. 基础语法

### 1.1 变量与数据类型

```javascript
// 声明变量
const PI = 3.14159 // 常量，不可重新赋值
let count = 0 // 块级作用域变量
// var 已不推荐使用（函数作用域，容易引发 bug）

// 基本数据类型
const str = 'hello' // string
const num = 42 // number（整数和浮点数统一）
const big = 9007199254740993n // bigint（任意精度整数）
const flag = true // boolean
const empty = null // null
const notDefined = undefined // undefined
const sym = Symbol('id') // symbol

// 类型检查
typeof str // 'string'
typeof num // 'number'
typeof flag // 'boolean'
typeof empty // 'object'（历史遗留 bug）
typeof notDefined // 'undefined'
Array.isArray([1, 2]) // true

// 类型转换
Number('42') // 42
String(42) // "42"
Boolean(0) // false
Boolean('') // false
Boolean(null) // false
Boolean(undefined) // false
Boolean('hello') // true
parseInt('42px') // 42
parseFloat('3.14') // 3.14
```

### 1.2 字符串

```javascript
// 模板字符串（推荐）
const name = 'World'
const greeting = `Hello, ${name}!` // 插值
const multiline = `line1\nline2` // 多行

// 常用方法
'hello'.toUpperCase() // 'HELLO'
'HELLO'.toLowerCase() // 'hello'
'hello world'.includes('world') // true
'hello world'.startsWith('hello') // true
'hello world'.endsWith('world') // true
'  hello  '.trim() // 'hello'
'hello'.padStart(10, '-') // '-----hello'
'hello'.padEnd(10, '-') // 'hello-----'
'a,b,c'.split(',') // ['a', 'b', 'c']
'hello'.replace('l', 'L') // 'heLlo'（只替换第一个）
'hello'.replaceAll('l', 'L') // 'heLLo'
'hello'.slice(1, 3) // 'el'
'hello'.at(-1) // 'o'（支持负索引）
```

### 1.3 数组

```javascript
const arr = [1, 2, 3, 4, 5]

// 增删
arr.push(6) // 末尾添加 → [1,2,3,4,5,6]
arr.unshift(0) // 开头添加 → [0,1,2,3,4,5,6]
arr.pop() // 末尾删除 → 返回 6
arr.shift() // 开头删除 → 返回 0
arr.splice(2, 1) // 从索引 2 删除 1 个元素
arr.splice(2, 0, 99) // 从索引 2 插入 99

// 查找
arr.includes(3) // true
arr.indexOf(3) // 2
arr.find((x) => x > 3) // 4（返回第一个匹配的元素）
arr.findIndex((x) => x > 3) // 3（返回索引）
arr.at(-1) // 最后一个元素（支持负索引）

// 变换（返回新数组，不修改原数组）
arr.map((x) => x * 2) // [2,4,6,8,10]
arr.filter((x) => x > 3) // [4,5]
arr.reduce((sum, x) => sum + x, 0) // 15
arr.flat() // 展平一层
arr
  .flatMap((x) => [x, x * 2]) // 展平 + map
  [(3, 1, 2)].sort((a, b) => a - b) // [1, 2, 3]
arr.toReversed() // 反转（不修改原数组）
arr.toSorted((a, b) => b - a) // 排序（不修改原数组）

// 判断
arr.every((x) => x > 0) // true（全部满足）
arr.some((x) => x > 3) // true（至少一个满足）

// 分组（Node.js 21+）
const items = [
  { type: 'fruit', name: 'apple' },
  { type: 'veggie', name: 'carrot' },
  { type: 'fruit', name: 'banana' },
]
Object.groupBy(items, (i) => i.type)
// { fruit: [...], veggie: [...] }

// 解构
const [first, second, ...rest] = arr
```

### 1.4 对象

```javascript
const user = {
  name: 'Alice',
  age: 25,
  address: { city: 'Beijing' },
}

// 访问
user.name // 'Alice'
user['age'] // 25
user.address?.city // 'Beijing'（可选链）
user.phone?.number ?? 'N/A' // 'N/A'（空值合并）

// 解构
const {
  name,
  age,
  address: { city },
} = user

// 常用方法
Object.keys(user) // ['name', 'age', 'address']
Object.values(user) // ['Alice', 25, {...}]
Object.entries(user) // [['name','Alice'], ['age',25], ...]
Object.fromEntries([
  ['a', 1],
  ['b', 2],
]) // { a: 1, b: 2 }
Object.assign({}, defaults, user) // 浅合并

// 展开运算符
const updated = { ...user, age: 26 } // 浅拷贝 + 覆盖
const merged = { ...defaults, ...user } // 合并对象

// 冻结（不可变）
const frozen = Object.freeze({ x: 1 })
frozen.x = 2 // 静默失败（严格模式下报错）
```

### 1.5 Map / Set

```javascript
// Map（键可以是任意类型）
const map = new Map()
map.set('key1', 'value1')
map.set(42, 'value2')
map.set(true, 'value3')

map.get('key1') // 'value1'
map.has(42) // true
map.size // 3
map.delete('key1')
map.clear()

// 初始化
const map2 = new Map([
  ['a', 1],
  ['b', 2],
])

// Set（唯一值集合）
const set = new Set([1, 2, 3, 3, 2]) // Set {1, 2, 3}
set.add(4)
set.has(3) // true
set.size // 4
set.delete(1)

// 去重
const unique = [...new Set([1, 2, 2, 3, 3])] // [1, 2, 3]

// WeakMap / WeakSet（弱引用，键/元素可被 GC 回收）
const weak = new WeakMap()
```

---

## 2. 模块系统

### 2.1 ESM（推荐，Node.js 24 默认）

```javascript
// ── 命名导出/导入 ──
// math.js
export const PI = 3.14159
export function add(a, b) {
  return a + b
}

// main.js
import { PI, add } from './math.js' // 必须写 .js 扩展名

// ── 默认导出/导入 ──
// logger.js
export default function log(msg) {
  console.log(msg)
}

// main.js
import log from './logger.js'

// ── 重导出 ──
// index.js
export { add } from './math.js'
export { default as Logger } from './logger.js'
export * from './utils.js'

// ── 动态导入（懒加载/条件加载）──
const { heavyModule } = await import('./heavy-module.js')

// ── package.json 配置 ──
// { "type": "module" }  ← 启用 ESM（Node.js 24 推荐）
// { "type": "commonjs" } ← 使用 CJS（旧项目兼容）
```

### 2.2 CJS（旧项目兼容）

```javascript
// math.js
const PI = 3.14159
function add(a, b) {
  return a + b
}
module.exports = { PI, add }

// main.js
const { PI, add } = require('./math.js')
```

### 2.3 内置模块导入

```javascript
// Node.js 24 推荐使用 node: 前缀
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'node:http'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs/promises'

// 内置模块也支持子路径导入
import { join, resolve } from 'node:path'
```

---

## 3. 异步编程

### 3.1 Promise

```javascript
// 创建 Promise
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('done'), 1000)
})

// 链式调用
fetchData()
  .then((data) => process(data))
  .then((result) => console.log(result))
  .catch((err) => console.error(err))
  .finally(() => console.log('完成'))

// 并行执行
const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()])

// 竞速（取最快的）
const fastest = await Promise.race([fetchA(), fetchB()])

// 全部完成（不论成功失败）
const results = await Promise.allSettled([fetchA(), fetchB()])
// [{ status: 'fulfilled', value: ... }, { status: 'rejected', reason: ... }]

// 任意一个完成
const first = await Promise.any([fetchA(), fetchB()])
```

### 3.2 async/await

```javascript
// 基本用法
async function loadUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('加载失败:', error.message)
    throw error
  }
}

// 串行 vs 并行
// ❌ 串行（慢）
const a = await fetchA()
const b = await fetchB()

// ✅ 并行（快）
const [a, b] = await Promise.all([fetchA(), fetchB()])

// 循环中的并行
const ids = [1, 2, 3, 4, 5]
const users = await Promise.all(ids.map((id) => fetchUser(id)))

// Top-level await（ESM 模块顶层可直接 await）
const config = await import('./config.js').then((m) => m.default)
```

### 3.3 AsyncIterator（Node.js 24）

```javascript
// 异步迭代器
async function* generateIds() {
  let id = 0
  while (true) {
    await new Promise((r) => setTimeout(r, 1000))
    yield ++id
  }
}

for await (const id of generateIds()) {
  console.log(id) // 每秒输出递增的 id
}

// AsyncIterable 工具方法
const results = await Array.fromAsync(generateIds()) // 收集所有值
```

---

## 4. 核心模块：文件与路径

### 4.1 fs 文件操作

```javascript
import {
  readFile,
  writeFile,
  mkdir,
  unlink,
  readdir,
  stat,
  copyFile,
  rename,
} from 'node:fs/promises'
import { existsSync } from 'node:fs'

// 读取文件
const content = await readFile('data.txt', 'utf-8')
const buffer = await readFile('image.png') // 返回 Buffer

// 写入文件
await writeFile('output.txt', 'Hello World', 'utf-8')
await writeFile('output.txt', data, { flag: 'a' }) // 追加模式

// 目录操作
await mkdir('new-dir', { recursive: true })
const files = await readdir('src')
const allFiles = await readdir('src', { recursive: true, withFileTypes: true })

// 文件信息
const info = await stat('file.txt')
info.size // 文件大小（字节）
info.isFile() // true
info.isDirectory() // false
info.mtime // 最后修改时间

// 其他操作
await copyFile('src.txt', 'dest.txt')
await rename('old.txt', 'new.txt')
await unlink('temp.txt') // 删除文件
existsSync('file.txt') // 同步检查文件是否存在
```

### 4.2 path 路径处理

```javascript
import path from 'node:path'

path.join('/foo', 'bar', 'baz') // '/foo/bar/baz'
path.resolve('src', 'index.js') // 绝对路径
path.dirname('/foo/bar/baz.js') // '/foo/bar'
path.basename('/foo/bar/baz.js') // 'baz.js'
path.extname('file.txt') // '.txt'
path.parse('/foo/bar/baz.js')
// { root: '/', dir: '/foo/bar', base: 'baz.js', ext: '.js', name: 'baz' }
path.format({ dir: '/foo', name: 'bar', ext: '.js' }) // '/foo/bar.js'
```

### 4.3 glob 模式匹配（Node.js 22+）

```javascript
import { glob } from 'node:fs/promises'

// 基础 glob
for await (const entry of glob('src/**/*.js')) {
  console.log(entry)
}

// 带选项
const files = await Array.fromAsync(
  glob('**/*.ts', {
    exclude: (name) => name.includes('node_modules'),
  }),
)
```

---

## 5. 核心模块：网络与 HTTP

### 5.1 fetch API（内置，无需第三方库）

```javascript
// GET 请求
const res = await fetch('https://api.example.com/users')
const data = await res.json()

// POST 请求
const res = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', age: 25 }),
})

// 请求选项
const res = await fetch(url, {
  method: 'PUT',
  headers: { Authorization: 'Bearer token123' },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(5000), // 5 秒超时
})

// 错误处理
if (!res.ok) {
  throw new Error(`HTTP ${res.status}: ${res.statusText}`)
}

// Response 方法
await res.json() // 解析 JSON
await res.text() // 获取文本
await res.arrayBuffer() // 获取 ArrayBuffer
await res.blob() // 获取 Blob
```

### 5.2 HTTP 服务器

```javascript
import { createServer } from 'node:http'

const server = createServer(async (req, res) => {
  // 请求信息
  const { method, url, headers } = req

  // 简单路由
  if (method === 'GET' && url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }))
    return
  }

  // POST 请求体解析
  if (method === 'POST' && url === '/api/data') {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const body = JSON.parse(Buffer.concat(chunks).toString())

    res.writeHead(201, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ received: body }))
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})
```

---

## 6. 事件与流

### 6.1 EventEmitter

```javascript
import { EventEmitter } from 'node:events'

// 创建事件发射器
const emitter = new EventEmitter()

// 监听事件
emitter.on('data', (payload) => {
  console.log('收到数据:', payload)
})

// 只监听一次
emitter.once('init', () => console.log('初始化完成'))

// 触发事件
emitter.emit('data', { id: 1, name: 'test' })
emitter.emit('init')

// 移除监听
const handler = (msg) => console.log(msg)
emitter.on('log', handler)
emitter.off('log', handler) // 移除指定监听器
emitter.removeAllListeners('log')

// 继承 EventEmitter
class MyService extends EventEmitter {
  start() {
    this.emit('start')
  }
}

// 常用方法
emitter.listenerCount('data') // 监听器数量
emitter.eventNames() // 所有事件名
emitter.setMaxListeners(20) // 设置最大监听器数（默认 10）
```

> 📖 底层拆解（手写 EventEmitter、通配符、异步触发、安全触发）：[Node.js 事件调度拆解](/architecture-document/typical-analysis/nodejs-event-scheduling)

### 6.2 Stream 流

```javascript
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Transform } from 'node:stream'

// 可读流
const readable = createReadStream('large-file.txt', {
  highWaterMark: 64 * 1024, // 64KB 缓冲区
  encoding: 'utf-8',
})

// 逐块读取
for await (const chunk of readable) {
  process.stdout.write(chunk)
}

// 管道（推荐用 pipeline，自动处理错误和清理）
await pipeline(
  createReadStream('input.txt'),
  new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk.toString().toUpperCase())
    },
  }),
  createWriteStream('output.txt'),
)

// 可写流
const writable = createWriteStream('log.txt')
writable.write('line 1\n')
writable.write('line 2\n')
writable.end('last line\n')
```

> 📖 底层拆解（pipe 底层原理、背压控制、pipeline 安全组合）：[Node.js 事件调度拆解 — 流式管线](/architecture-document/typical-analysis/nodejs-event-scheduling#四-流式管线调度-可读-可写-转换流组合)

---

## 7. 错误处理

### 7.1 自定义错误类

```javascript
class AppError extends Error {
  constructor(message, { code, statusCode, cause } = {}) {
    super(message, { cause })
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

// 使用
throw new AppError('用户不存在', { code: 'USER_NOT_FOUND', statusCode: 404 })

// 捕获
try {
  await findUser(id)
} catch (error) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message, code: error.code })
  } else {
    // 未知错误
    console.error('未预期的错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}
```

### 7.2 全局错误处理

```javascript
// 未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1) // 必须退出，状态不可预测
})

// 未处理的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Rejection:', reason)
})

// Node.js 24 中 unhandledRejection 默认行为是警告（未来版本将变为退出）
```

---

## 8. 包管理与项目配置

### 8.1 package.json 核心字段

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  },
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node dist/index.js",
    "test": "node --test",
    "build": "tsc"
  },
  "engines": {
    "node": ">=24.0.0"
  },
  "dependencies": {},
  "devDependencies": {},
  "peerDependencies": {}
}
```

### 8.2 npm / pnpm 常用操作

```bash
# 初始化项目
npm init -y

# 安装依赖
npm install express              # 生产依赖
npm install -D typescript        # 开发依赖
npm install -g nodemon           # 全局安装

# pnpm（推荐，更快更省磁盘）
pnpm add express
pnpm add -D typescript
pnpm install                     # 安装所有依赖

# 查看依赖
npm ls                           # 依赖树
npm ls --depth=0                 # 只看顶层
npm outdated                     # 检查过期依赖

# 运行脚本
npm run dev
pnpm dev                         # pnpm 可以省略 run
```

---

## 9. 内置测试运行器

### 9.1 基本用法（Node.js 24 内置，无需安装）

```javascript
// tests/math.test.js
import { describe, it, test, expect, before, after, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { add, multiply } from '../src/math.js'

// 基本测试
test('add 函数', () => {
  assert.equal(add(1, 2), 3)
  assert.equal(add(-1, 1), 0)
})

// describe 分组
describe('multiply', () => {
  it('两个正数相乘', () => {
    assert.equal(multiply(2, 3), 6)
  })

  it('乘以零', () => {
    assert.equal(multiply(5, 0), 0)
  })

  it('负数相乘', () => {
    assert.equal(multiply(-2, -3), 6)
  })
})

// 异步测试
test('异步操作', async () => {
  const result = await asyncFunction()
  assert.ok(result.success)
})

// 生命周期
describe('数据库测试', () => {
  before(() => {
    /* 所有测试前执行一次 */
  })
  after(() => {
    /* 所有测试后执行一次 */
  })
  beforeEach(() => {
    /* 每个测试前执行 */
  })

  it('should connect', () => {
    /* ... */
  })
})

// Mock
test('mock 函数', () => {
  const fn = mock.fn((x) => x * 2)
  fn(3)
  fn(5)
  assert.equal(fn.mock.calls.length, 2)
  assert.equal(fn.mock.calls[0].arguments[0], 3)
  assert.equal(fn.mock.results[0].value, 6)
})

// Mock 模块
test('mock 模块', async () => {
  mock.module('./db.js', {
    namedExports: { query: () => [{ id: 1 }] },
  })
  const { getUsers } = await import('./service.js')
  const users = await getUsers()
  assert.deepEqual(users, [{ id: 1 }])
})
```

### 9.2 运行测试

```bash
node --test                         # 运行所有 *.test.js
node --test tests/                  # 运行指定目录
node --test --test-name-pattern "add"  # 按名称过滤
node --test --watch                 # 监听模式
node --test --coverage              # 覆盖率（Node.js 22+）
```

---

## 10. 进程与环境

### 10.1 process 对象

```javascript
// 环境变量
process.env.NODE_ENV // 'development' | 'production'
process.env.PORT // 自定义端口
process.env.DATABASE_URL // 数据库连接串

// 进程信息
process.pid // 进程 ID
process.ppid // 父进程 ID
process.platform // 'darwin' | 'linux' | 'win32'
process.arch // 'x64' | 'arm64'
process.version // 'v24.x.x'
process.versions // { node, v8, openssl, ... }
process.cwd() // 当前工作目录
process.uptime() // 进程运行时间（秒）
process.memoryUsage() // { rss, heapTotal, heapUsed, ... }

// 进程控制
process.exit(0) // 正常退出
process.exit(1) // 异常退出
process.exitCode = 1 // 设置退出码（不立即退出）

// 信号处理
process.on('SIGINT', () => {
  console.log('收到 Ctrl+C，正在优雅关闭...')
  cleanup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  // Docker/K8s 发送的终止信号
  gracefulShutdown()
})
```

### 10.2 child_process 子进程

```javascript
import { exec, execSync, spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

// 执行命令（异步）
const { stdout, stderr } = await execAsync('ls -la')
console.log(stdout)

// 执行命令（同步，阻塞）
const output = execSync('node --version').toString().trim()

// spawn（适合长时间运行的进程）
const child = spawn('node', ['server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '4000' },
})
child.stdout.on('data', (data) => console.log(`子进程: ${data}`))
child.on('exit', (code) => console.log(`子进程退出: ${code}`))

// execFile（更安全，不启动 shell）
execFile('git', ['--version'], (error, stdout) => {
  console.log(stdout)
})
```

### 10.3 Worker Threads（多线程）

```javascript
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

if (isMainThread) {
  // 主线程
  const worker = new Worker('./worker.js', { workerData: [1, 2, 3, 4, 5] })
  worker.on('message', (result) => console.log('计算结果:', result))
  worker.on('error', (err) => console.error('Worker 错误:', err))
  worker.on('exit', (code) => console.log('Worker 退出:', code))
} else {
  // Worker 线程
  const sum = workerData.reduce((a, b) => a + b, 0)
  parentPort.postMessage(sum)
}
```

---

## 11. 常用内置 API

### 11.1 URL 与查询参数

```javascript
const url = new URL('https://example.com/api/users?page=1&size=10')
url.hostname // 'example.com'
url.pathname // '/api/users'
url.searchParams.get('page') // '1'
url.searchParams.getAll('tag') // ['a', 'b']
url.searchParams.set('page', '2')
url.toString() // 更新后的完整 URL
```

### 11.2 crypto 加密

```javascript
import { createHash, randomUUID, randomBytes } from 'node:crypto'

// 哈希
createHash('sha256').update('password').digest('hex')

// UUID
const id = randomUUID() // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

// 随机字节
const token = randomBytes(32).toString('hex')

// HMAC
import { createHmac } from 'node:crypto'
const signature = createHmac('sha256', 'secret-key').update('data').digest('hex')
```

### 11.3 util 工具

```javascript
import { promisify, format, inspect, deprecate } from 'node:util'

// promisify：将回调函数转为 Promise
import { readFile } from 'node:fs'
const readFileAsync = promisify(readFile)

// format：格式化字符串
format('Hello %s, age %d', 'Alice', 25) // 'Hello Alice, age 25'

// inspect：调试输出
inspect(obj, { depth: null, colors: true })

// TextEncoder / TextDecoder（全局可用）
const encoder = new TextEncoder()
const bytes = encoder.encode('hello') // Uint8Array
const decoder = new TextDecoder()
const str = decoder.decode(bytes) // 'hello'
```

### 11.4 timers 定时器

```javascript
// 基本定时器
setTimeout(() => console.log('3秒后'), 3000)
setInterval(() => console.log('每秒'), 1000)

// 取消
const timer = setTimeout(() => {}, 5000)
clearTimeout(timer)

// Promise 化定时器
import { setTimeout as sleep } from 'node:timers/promises'
await sleep(1000) // 等待 1 秒
await sleep(1000, 'result') // 1 秒后 resolve 'result'

// 迭代定时器
import { setInterval } from 'node:timers/promises'
for await (const _ of setInterval(1000)) {
  console.log('每秒执行')
}
```

### 11.5 Buffer

```javascript
// 创建 Buffer
const buf1 = Buffer.from('hello', 'utf-8')
const buf2 = Buffer.alloc(16) // 16 字节，填充 0
const buf3 = Buffer.from([0x48, 0x65]) // 从数组

// 操作
buf1.toString('utf-8') // 'hello'
buf1.toString('hex') // '68656c6c6f'
buf1.toString('base64') // 'aGVsbG8='
buf1.length // 5
Buffer.concat([buf1, buf2]) // 合并
Buffer.compare(buf1, buf2) // 比较
buf1.equals(Buffer.from('hello')) // true
```

---

## 12. 性能与调试

### 12.1 --watch 模式（开发利器）

```bash
# 文件变化时自动重启（Node.js 18.11+，无需 nodemon）
node --watch src/index.js

# 配合 TypeScript
node --watch --import tsx src/index.ts
```

### 12.2 调试

```bash
# Inspector 调试
node --inspect src/index.js          # 启动 Inspector
node --inspect-brk src/index.js      # 启动并在第一行暂停

# 然后在 Chrome 打开 chrome://inspect 或使用 VS Code 调试器

# VS Code launch.json 配置
# {
#   "type": "node",
#   "request": "launch",
#   "name": "Debug",
#   "program": "${workspaceFolder}/src/index.js"
# }
```

### 12.3 性能分析

```bash
# CPU Profiling
node --prof src/index.js
node --prof-process isolate-*.log > profile.txt

# Heap Snapshot
node --heapsnapshot-signal=SIGUSR2 src/index.js
# 发送 SIGUSR2 信号生成堆快照

# 内存追踪
node --trace-gc src/index.js         # 追踪 GC 事件
node --max-old-space-size=4096 src/index.js  # 设置最大堆内存（MB）
```

### 12.4 诊断

```bash
# 诊断报告（崩溃时自动生成）
node --report-on-fatalerror src/index.js
node --report-uncaught-exception src/index.js

# 诊断报告（手动触发）
node --diagnostic-dir=./reports src/index.js
# 发送 SIGUSR2 生成报告
```

---

## 13. 常用命令

### 13.1 Node.js 运行时

```bash
node                          # 进入 REPL 交互模式
node script.js                # 执行脚本
node -e "console.log(1+2)"    # 执行内联代码
node -p "process.version"     # 打印表达式结果
node --version                # 查看版本（或 node -v）
node --check script.js        # 语法检查（不执行）
```

### 13.2 开发模式

```bash
node --watch src/index.js               # 文件变化自动重启
node --watch-path=src --watch-path=config src/index.js  # 监听多个目录
node --env-file=.env src/index.js       # 加载环境变量文件（Node.js 20.6+）
node --import tsx src/index.ts          # 通过 loader 运行 TypeScript
```

### 13.3 调试与诊断

```bash
node --inspect src/index.js             # 启动 Inspector（Chrome DevTools 调试）
node --inspect-brk src/index.js         # Inspector + 首行断点
node --prof src/index.js                # CPU 性能分析
node --prof-process isolate-*.log       # 处理性能分析日志
node --heapsnapshot-signal=SIGUSR2      # 信号触发堆快照
node --trace-gc src/index.js            # 追踪垃圾回收
node --max-old-space-size=4096          # 设置 V8 最大堆内存（MB）
node --report-on-fatalerror             # 致命错误时生成诊断报告
node --diagnostic-dir=./reports         # 诊断报告输出目录
```

### 13.4 测试

```bash
node --test                             # 运行所有测试文件
node --test tests/unit/                 # 运行指定目录
node --test --test-name-pattern "add"   # 按测试名过滤
node --test --test-concurrency=1        # 串行执行
node --test --watch                     # 监听模式（文件变化自动重跑）
node --test --coverage                  # 代码覆盖率（Node.js 22+）
node --test-reporter=spec               # 指定报告格式（spec / tap / junit）
node --test-reporter-destination=stdout # 报告输出目标
```

### 13.5 包管理（npm）

```bash
npm init -y                             # 初始化 package.json
npm install                             # 安装所有依赖
npm install express                     # 安装生产依赖
npm install -D typescript               # 安装开发依赖
npm install -g nodemon                  # 全局安装
npm uninstall express                   # 卸载依赖
npm update                              # 更新依赖（遵循 semver）
npm outdated                            # 查看过期依赖
npm ls --depth=0                        # 查看顶层依赖树
npm run dev                             # 运行 package.json 中的脚本
npm cache clean --force                 # 清除 npm 缓存
npm config set registry https://registry.npmmirror.com  # 设置镜像源
```

### 13.6 包管理（pnpm，推荐）

```bash
pnpm init                               # 初始化
pnpm install                            # 安装所有依赖
pnpm add express                        # 生产依赖
pnpm add -D typescript                  # 开发依赖
pnpm remove express                     # 卸载
pnpm update                             # 更新依赖
pnpm outdated                           # 查看过期
pnpm ls --depth 0                       # 查看顶层依赖
pnpm store prune                        # 清理全局 store 中未引用的包
pnpm config set registry https://registry.npmmirror.com  # 设置镜像源
```

### 13.7 实用单行命令

```bash
# 启动 HTTP 服务器（分享静态文件）
node -e "require('node:http').createServer((req,res)=>{res.end('ok')}).listen(3000)"

# 查看 Node.js 编译选项
node -p "process.config.variables"

# Base64 编解码
node -e "console.log(Buffer.from('hello').toString('base64'))"
node -e "console.log(Buffer.from('aGVsbG8=','base64').toString())"

# 生成 UUID
node -e "console.log(require('crypto').randomUUID())"

# 计算哈希
node -e "console.log(require('crypto').createHash('sha256').update('hello').digest('hex'))"

# 获取本机 IP
node -e "console.log(Object.values(require('os').networkInterfaces()).flat().filter(i=>i.family==='IPv4'&&!i.internal).map(i=>i.address))"

# 查看 V8 内存限制
node -e "console.log(v8.getHeapStatistics().heap_size_limit / 1024 / 1024 + ' MB')"
```
