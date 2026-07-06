# 线性数据结构

线性结构是最基础的数据结构,元素之间是一对一的线性关系。本章深入探讨数组、链表、栈和队列。

## 数组 (Array)

### 特点

- **连续内存**: 元素在内存中连续存储
- **随机访问**: 通过索引 O(1) 访问任意元素
- **固定大小**: 传统数组大小固定(动态数组会自动扩容)
- **缓存友好**: 连续内存对 CPU 缓存友好

### JavaScript 实现

```javascript
// 基本数组操作
const arr = [1, 2, 3, 4, 5]

// 访问: O(1)
console.log(arr[2]) // 3

// 尾部插入: O(1) 摊销
arr.push(6)

// 尾部删除: O(1)
arr.pop()

// 头部插入: O(n) - 需要移动所有元素
arr.unshift(0)

// 查找: O(n)
arr.indexOf(3)

// 遍历: O(n)
arr.forEach((item) => console.log(item))
```

### 性能分析

| 操作          | 时间复杂度 |
| ------------- | ---------- |
| 随机访问      | O(1)       |
| 尾部插入/删除 | O(1) 摊销  |
| 头部插入/删除 | O(n)       |
| 中间插入/删除 | O(n)       |
| 查找          | O(n)       |

### 应用场景

- 需要频繁随机访问的场景
- 数据量已知且变化不大
- 需要排序或二分查找
- 矩阵运算、图像处理

### 优化技巧

```javascript
// 1. 预分配数组大小(避免频繁扩容)
const arr = new Array(1000)

// 2. 使用 TypedArray 处理数值(更紧凑)
const intArray = new Int32Array(1000)

// 3. 避免稀疏数组
const sparse = []
sparse[1000] = 1 // 浪费内存

// 4. 使用 push 而非 unshift
arr.push(item) // O(1)
arr.unshift(item) // O(n)
```

## 链表 (Linked List)

### 特点

- **非连续内存**: 节点分散存储,通过指针连接
- **动态大小**: 无需预分配空间
- **快速插入/删除**: 只需修改指针
- **顺序访问**: 无法随机访问,必须从头遍历

### 实现

```javascript
class ListNode {
  constructor(val) {
    this.val = val
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  // 头部插入: O(1)
  prepend(val) {
    const node = new ListNode(val)
    node.next = this.head
    this.head = node
    this.size++
  }

  // 尾部插入: O(n) - 需要遍历到末尾
  append(val) {
    const node = new ListNode(val)
    if (!this.head) {
      this.head = node
    } else {
      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = node
    }
    this.size++
  }

  // 查找: O(n)
  find(val) {
    let current = this.head
    while (current) {
      if (current.val === val) return current
      current = current.next
    }
    return null
  }

  delete(val) {
    if (!this.head) return false

    if (this.head.val === val) {
      this.head = this.head.next
      this.size--
      return true
    }

    let current = this.head
    while (current.next) {
      if (current.next.val === val) {
        current.next = current.next.next
        this.size--
        return true
      }
      current = current.next
    }
    return false
  }

  // 遍历: O(n)
  traverse(callback) {
    let current = this.head
    while (current) {
      callback(current.val)
      current = current.next
    }
  }
}
```

### 性能分析

| 操作                | 时间复杂度     |
| ------------------- | -------------- |
| 头部插入/删除       | O(1)           |
| 尾部插入            | O(n) 或 O(1)\* |
| 查找                | O(n)           |
| 已知位置的插入/删除 | O(1)           |

> \*如果有尾指针,尾部插入可以是 O(1)

### 变体

#### 双向链表

```javascript
class DoublyListNode {
  constructor(val) {
    this.val = val
    this.prev = null
    this.next = null
  }
}
```

优势:

- 可以从尾部向前遍历
- 删除节点时无需找前驱节点

#### 循环链表

最后一个节点指向第一个节点,适合环形缓冲区、轮询调度等场景。

### 应用场景

- 频繁插入/删除的场景
- 实现栈、队列、哈希表
- LRU 缓存
- 多项式表示

## 栈 (Stack)

### 特点

- **LIFO**: Last In First Out (后进先出)
- **单端操作**: 只能在一端(push/pop)进行操作
- **受限访问**: 无法访问中间元素

### 实现

```javascript
class Stack {
  constructor() {
    this.items = []
  }

  // 入栈: O(1)
  push(item) {
    this.items.push(item)
  }

  // 出栈: O(1)
  pop() {
    if (this.isEmpty()) throw new Error('Stack is empty')
    return this.items.pop()
  }

  // 查看栈顶: O(1)
  peek() {
    if (this.isEmpty()) throw new Error('Stack is empty')
    return this.items[this.items.length - 1]
  }

  isEmpty() {
    return this.items.length === 0
  }

  size() {
    return this.items.length
  }
}
```

### 经典应用

#### 1. 括号匹配

```javascript
function isValidParentheses(s) {
  const stack = []
  const map = { ')': '(', ']': '[', '}': '{' }

  for (const char of s) {
    if (char in map) {
      // 右括号:检查栈顶是否匹配
      if (stack.pop() !== map[char]) return false
    } else {
      // 左括号:入栈
      stack.push(char)
    }
  }

  return stack.length === 0
}

console.log(isValidParentheses('()[]{}')) // true
console.log(isValidParentheses('([)]')) // false
```

#### 2. 函数调用栈

```javascript
// 递归本质上是利用系统调用栈
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1) // 每次调用压栈
}
```

#### 3. 表达式求值

```javascript
// 逆波兰表达式求值
function evalRPN(tokens) {
  const stack = []
  const ops = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.trunc(a / b),
  }

  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop()
      const a = stack.pop()
      stack.push(ops[token](a, b))
    } else {
      stack.push(Number(token))
    }
  }

  return stack.pop()
}

console.log(evalRPN(['2', '1', '+', '3', '*'])) // 9
```

#### 4. 浏览器后退功能

```javascript
class BrowserHistory {
  constructor() {
    this.backStack = []
    this.forwardStack = []
    this.currentPage = null
  }

  visit(url) {
    if (this.currentPage) {
      this.backStack.push(this.currentPage)
    }
    this.currentPage = url
    this.forwardStack = [] // 清空前进历史
  }

  back() {
    if (this.backStack.length === 0) return
    this.forwardStack.push(this.currentPage)
    this.currentPage = this.backStack.pop()
  }

  forward() {
    if (this.forwardStack.length === 0) return
    this.backStack.push(this.currentPage)
    this.currentPage = this.forwardStack.pop()
  }
}
```

## 队列 (Queue)

### 特点

- **FIFO**: First In First Out (先进先出)
- **双端操作**: 一端入队(enqueue),另一端出队(dequeue)
- **公平性**: 先到先服务

### 基础实现

```javascript
class Queue {
  constructor() {
    this.items = []
    this.front = 0
  }

  // 入队: O(1)
  enqueue(item) {
    this.items.push(item)
  }

  // 出队: O(1) 摊销
  dequeue() {
    if (this.isEmpty()) throw new Error('Queue is empty')
    const item = this.items[this.front]
    this.front++

    // 定期清理已出队的元素
    if (this.front > this.items.length / 2) {
      this.items = this.items.slice(this.front)
      this.front = 0
    }

    return item
  }

  peek() {
    if (this.isEmpty()) throw new Error('Queue is empty')
    return this.items[this.front]
  }

  isEmpty() {
    return this.front >= this.items.length
  }

  size() {
    return this.items.length - this.front
  }
}
```

### 优先队列

```javascript
class PriorityQueue {
  constructor() {
    this.heap = []
  }

  // 入队: O(log n)
  enqueue(item, priority) {
    this.heap.push({ item, priority })
    this._bubbleUp(this.heap.length - 1)
  }

  // 出队(最高优先级): O(log n)
  dequeue() {
    if (this.isEmpty()) throw new Error('Queue is empty')

    const top = this.heap[0]
    const last = this.heap.pop()

    if (this.heap.length > 0) {
      this.heap[0] = last
      this._sinkDown(0)
    }

    return top.item
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break

      ;[this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]]
      index = parentIndex
    }
  }

  _sinkDown(index) {
    const length = this.heap.length

    while (true) {
      let largest = index
      const left = 2 * index + 1
      const right = 2 * index + 2

      if (left < length && this.heap[left].priority > this.heap[largest].priority) {
        largest = left
      }

      if (right < length && this.heap[right].priority > this.heap[largest].priority) {
        largest = right
      }

      if (largest === index) break

      ;[this.heap[largest], this.heap[index]] = [this.heap[index], this.heap[largest]]
      index = largest
    }
  }

  isEmpty() {
    return this.heap.length === 0
  }
}

// 使用示例
const pq = new PriorityQueue()
pq.enqueue('紧急任务', 3)
pq.enqueue('普通任务', 1)
pq.enqueue('重要任务', 2)

console.log(pq.dequeue()) // '紧急任务'
console.log(pq.dequeue()) // '重要任务'
console.log(pq.dequeue()) // '普通任务'
```

### 应用场景

#### 1. BFS 广度优先搜索

```javascript
function bfs(graph, start) {
  const queue = [start]
  const visited = new Set([start])
  const result = []

  while (queue.length > 0) {
    const node = queue.shift() // 出队
    result.push(node)

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor) // 入队
      }
    }
  }

  return result
}
```

#### 2. 任务调度

```javascript
class TaskScheduler {
  constructor() {
    this.queue = []
  }

  addTask(task, priority = 0) {
    this.queue.push({ task, priority, timestamp: Date.now() })
    this.queue.sort((a, b) => b.priority - a.priority)
  }

  executeNext() {
    if (this.queue.length === 0) return null
    const { task } = this.queue.shift()
    return task()
  }
}
```

#### 3. 消息队列

- RabbitMQ、Kafka 等消息中间件
- 异步任务处理
- 流量削峰

## 对比总结

| 特性     | 数组       | 链表     | 栈         | 队列      |
| -------- | ---------- | -------- | ---------- | --------- |
| 访问方式 | 随机       | 顺序     | 单端       | 双端      |
| 插入效率 | O(n)       | O(1)\*   | O(1)       | O(1)      |
| 删除效率 | O(n)       | O(1)\*   | O(1)       | O(1)      |
| 内存占用 | 紧凑       | 额外指针 | 紧凑       | 紧凑      |
| 缓存友好 | ✓          | ✗        | ✓          | ✓         |
| 典型应用 | 排序、查找 | 动态集合 | 回溯、解析 | BFS、调度 |

> \*指已知位置的情况

## 实践建议

1. **优先使用数组**: 除非有明确的理由使用链表
2. **用数组模拟栈/队列**: JavaScript 的数组已经足够高效
3. **注意数组扩容**: 大量插入时预分配空间
4. **考虑双端队列**: 需要两端操作时使用
5. **优先队列用堆**: 不要每次都排序

## 下一步

- [树形数据结构](./tree-structures) - 学习非线性结构
- [图数据结构](./graph-structures) - 探索复杂关系
- [哈希表与集合](./hash-structures) - 高效查找方案
