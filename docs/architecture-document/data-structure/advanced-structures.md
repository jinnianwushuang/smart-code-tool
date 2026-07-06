# 高级数据结构

本章介绍一些在特定场景下非常有用的高级数据结构,包括并查集、跳表、线段树、树状数组等。

## 并查集 (Union-Find / Disjoint Set)

### 概念

并查集用于处理不相交集合的合并和查询问题,支持两种操作:

- **Find**: 确定元素属于哪个集合
- **Union**: 合并两个集合

### 基础实现

```javascript
class UnionFind {
  constructor(size) {
    this.parent = new Array(size).fill(0).map((_, i) => i)
    this.rank = new Array(size).fill(0)
  }

  // 查找根节点
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]) // 路径压缩
    }
    return this.parent[x]
  }

  // 合并两个集合
  union(x, y) {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) return false

    // 按秩合并
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX
    } else {
      this.parent[rootY] = rootX
      this.rank[rootX]++
    }

    return true
  }

  // 检查是否在同一集合
  connected(x, y) {
    return this.find(x) === this.find(y)
  }
}
```

### 优化技术

#### 1. 路径压缩 (Path Compression)

```javascript
find(x) {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]); // 递归压缩
  }
  return this.parent[x];
}

// 迭代版本
find(x) {
  let root = x;
  while (root !== this.parent[root]) {
    root = this.parent[root];
  }

  // 压缩路径
  while (x !== root) {
    const next = this.parent[x];
    this.parent[x] = root;
    x = next;
  }

  return root;
}
```

#### 2. 按秩合并 (Union by Rank)

将较矮的树连接到较高的树上,保持树的平衡。

### 时间复杂度

使用路径压缩和按秩合并后:

- **均摊时间复杂度**: O(α(n)),其中 α 是反阿克曼函数,增长极慢
- **实际表现**: 几乎是 O(1)

### 应用场景

#### 1. 连通分量检测

```javascript
function countComponents(n, edges) {
  const uf = new UnionFind(n)
  let components = n

  for (const [u, v] of edges) {
    if (uf.union(u, v)) {
      components--
    }
  }

  return components
}

console.log(
  countComponents(5, [
    [0, 1],
    [1, 2],
    [3, 4],
  ]),
) // 2
```

#### 2. Kruskal 最小生成树算法

```javascript
function kruskalMST(vertices, edges) {
  edges.sort((a, b) => a.weight - b.weight)

  const uf = new UnionFind(vertices)
  const mst = []
  let totalWeight = 0

  for (const edge of edges) {
    if (uf.union(edge.from, edge.to)) {
      mst.push(edge)
      totalWeight += edge.weight

      if (mst.length === vertices - 1) break
    }
  }

  return { mst, totalWeight }
}
```

#### 3. 动态连通性

```javascript
class DynamicConnectivity {
  constructor(n) {
    this.uf = new UnionFind(n)
  }

  connect(p, q) {
    this.uf.union(p, q)
  }

  isConnected(p, q) {
    return this.uf.connected(p, q)
  }

  componentCount() {
    const roots = new Set()
    for (let i = 0; i < this.uf.parent.length; i++) {
      roots.add(this.uf.find(i))
    }
    return roots.size
  }
}
```

## 跳表 (Skip List)

### 概念

跳表是一种概率性数据结构,通过多层链表实现快速查找,平均时间复杂度为 O(log n)。

### 特点

- **多层索引**: 每层是下一层的子集
- **概率平衡**: 通过随机化决定节点层数
- **实现简单**: 比平衡树更容易实现
- **并发友好**: 适合并发环境

### 实现

```javascript
class SkipListNode {
  constructor(value, level) {
    this.value = value
    this.forward = new Array(level + 1).fill(null)
  }
}

class SkipList {
  constructor(maxLevel = 16, probability = 0.5) {
    this.maxLevel = maxLevel
    this.probability = probability
    this.level = 0
    this.header = new SkipListNode(-Infinity, maxLevel)
  }

  _randomLevel() {
    let level = 0
    while (Math.random() < this.probability && level < this.maxLevel) {
      level++
    }
    return level
  }

  search(target) {
    let current = this.header

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i].value < target) {
        current = current.forward[i]
      }
    }

    current = current.forward[0]
    return current && current.value === target ? current : null
  }

  insert(value) {
    const update = new Array(this.maxLevel + 1).fill(null)
    let current = this.header

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i].value < value) {
        current = current.forward[i]
      }
      update[i] = current
    }

    current = current.forward[0]

    if (current && current.value === value) {
      return // 已存在
    }

    const newLevel = this._randomLevel()

    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.header
      }
      this.level = newLevel
    }

    const newNode = new SkipListNode(value, newLevel)

    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i].forward[i]
      update[i].forward[i] = newNode
    }
  }

  delete(value) {
    const update = new Array(this.maxLevel + 1).fill(null)
    let current = this.header

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i].value < value) {
        current = current.forward[i]
      }
      update[i] = current
    }

    current = current.forward[0]

    if (!current || current.value !== value) {
      return false
    }

    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== current) break
      update[i].forward[i] = current.forward[i]
    }

    while (this.level > 0 && !this.header.forward[this.level]) {
      this.level--
    }

    return true
  }

  display() {
    for (let i = this.level; i >= 0; i--) {
      let current = this.header.forward[i]
      let line = `Level ${i}: `

      while (current) {
        line += `${current.value} -> `
        current = current.forward[i]
      }

      console.log(line + 'NULL')
    }
  }
}

// 使用示例
const skipList = new SkipList()
skipList.insert(3)
skipList.insert(6)
skipList.insert(7)
skipList.insert(9)
skipList.insert(12)
skipList.display()

console.log(skipList.search(6)) // SkipListNode
console.log(skipList.search(8)) // null
```

### 性能分析

| 操作 | 平均情况 | 最坏情况   |
| ---- | -------- | ---------- |
| 查找 | O(log n) | O(n)       |
| 插入 | O(log n) | O(n)       |
| 删除 | O(log n) | O(n)       |
| 空间 | O(n)     | O(n log n) |

### 应用场景

- Redis 的有序集合 (Sorted Set)
- 数据库索引
- 需要频繁插入/删除且要求有序的場景

## 线段树 (Segment Tree)

详见 [树形数据结构](./tree-structures#线段树-segment-tree) 章节。

## 树状数组 (Binary Indexed Tree / Fenwick Tree)

### 概念

树状数组用于高效计算前缀和,支持单点更新和前缀和查询,时间复杂度均为 O(log n)。

### 实现

```javascript
class BIT {
  constructor(size) {
    this.size = size
    this.tree = new Array(size + 1).fill(0)
  }

  // 获取最低位的 1
  _lowbit(x) {
    return x & -x
  }

  // 单点更新: O(log n)
  update(index, delta) {
    index++ // BIT 从 1 开始

    while (index <= this.size) {
      this.tree[index] += delta
      index += this._lowbit(index)
    }
  }

  // 前缀和查询: O(log n)
  query(index) {
    index++
    let sum = 0

    while (index > 0) {
      sum += this.tree[index]
      index -= this._lowbit(index)
    }

    return sum
  }

  // 区间和查询: O(log n)
  rangeQuery(left, right) {
    return this.query(right) - this.query(left - 1)
  }
}

// 使用示例
const bit = new BIT(5)
const nums = [1, 3, 5, 7, 9]

// 初始化
nums.forEach((num, i) => bit.update(i, num))

console.log(bit.query(2)) // 1 + 3 + 5 = 9
console.log(bit.rangeQuery(1, 3)) // 3 + 5 + 7 = 15

// 更新
bit.update(2, 2) // 索引 2 增加 2
console.log(bit.query(2)) // 1 + 3 + 7 = 11
```

### 应用场景

#### 逆序对计数

```javascript
function countInversions(nums) {
  const maxVal = Math.max(...nums)
  const bit = new BIT(maxVal)
  let count = 0

  // 从右往左遍历
  for (let i = nums.length - 1; i >= 0; i--) {
    // 查询小于当前值的数量
    count += bit.query(nums[i] - 1)
    // 更新
    bit.update(nums[i], 1)
  }

  return count
}

console.log(countInversions([2, 4, 1, 3, 5])) // 3
```

## Trie 的扩展

### 后缀树 (Suffix Tree)

用于字符串匹配的高效数据结构。

```javascript
class SuffixTree {
  constructor(text) {
    this.text = text
    this.root = {}

    // 构建所有后缀
    for (let i = 0; i < text.length; i++) {
      this._insert(text.substring(i), i)
    }
  }

  _insert(suffix, index) {
    let node = this.root

    for (const char of suffix) {
      if (!node[char]) {
        node[char] = {}
      }
      node = node[char]
    }

    node.index = index
  }

  search(pattern) {
    let node = this.root

    for (const char of pattern) {
      if (!node[char]) return []
      node = node[char]
    }

    // 收集所有匹配的位置
    const positions = []
    this._collectPositions(node, positions)
    return positions
  }

  _collectPositions(node, positions) {
    if (node.index !== undefined) {
      positions.push(node.index)
    }

    for (const key in node) {
      if (key !== 'index') {
        this._collectPositions(node[key], positions)
      }
    }
  }
}

// 使用示例
const st = new SuffixTree('banana')
console.log(st.search('ana')) // [1, 3]
```

## LRU/LFU Cache

### LFU Cache (最少使用)

```javascript
class LFUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.keyToValue = new Map()
    this.keyToFreq = new Map()
    this.freqToKeys = new Map()
    this.minFreq = 0
  }

  get(key) {
    if (!this.keyToValue.has(key)) return -1

    this._increaseFreq(key)
    return this.keyToValue.get(key)
  }

  put(key, value) {
    if (this.capacity === 0) return

    if (this.keyToValue.has(key)) {
      this.keyToValue.set(key, value)
      this._increaseFreq(key)
      return
    }

    if (this.keyToValue.size >= this.capacity) {
      this._evict()
    }

    this.keyToValue.set(key, value)
    this.keyToFreq.set(key, 1)

    if (!this.freqToKeys.has(1)) {
      this.freqToKeys.set(1, new Set())
    }
    this.freqToKeys.get(1).add(key)

    this.minFreq = 1
  }

  _increaseFreq(key) {
    const freq = this.keyToFreq.get(key)
    this.keyToFreq.set(key, freq + 1)

    this.freqToKeys.get(freq).delete(key)
    if (this.freqToKeys.get(freq).size === 0) {
      this.freqToKeys.delete(freq)
      if (this.minFreq === freq) {
        this.minFreq++
      }
    }

    if (!this.freqToKeys.has(freq + 1)) {
      this.freqToKeys.set(freq + 1, new Set())
    }
    this.freqToKeys.get(freq + 1).add(key)
  }

  _evict() {
    const keys = this.freqToKeys.get(this.minFreq)
    const keyToEvict = keys.values().next().value

    keys.delete(keyToEvict)
    if (keys.size === 0) {
      this.freqToKeys.delete(this.minFreq)
    }

    this.keyToValue.delete(keyToEvict)
    this.keyToFreq.delete(keyToEvict)
  }
}
```

## 块状链表 (Unrolled Linked List)

结合数组和链表的优点。

```javascript
class BlockNode {
  constructor(capacity = 10) {
    this.elements = []
    this.capacity = capacity
    this.next = null
  }

  isFull() {
    return this.elements.length >= this.capacity
  }
}

class UnrolledLinkedList {
  constructor(blockCapacity = 10) {
    this.blockCapacity = blockCapacity
    this.head = new BlockNode(blockCapacity)
    this.size = 0
  }

  append(value) {
    let current = this.head

    while (current.next && current.isFull()) {
      current = current.next
    }

    if (current.isFull()) {
      const newNode = new BlockNode(this.blockCapacity)
      current.next = newNode
      current = newNode
    }

    current.elements.push(value)
    this.size++
  }

  get(index) {
    if (index < 0 || index >= this.size) return undefined

    let current = this.head
    let remaining = index

    while (current) {
      if (remaining < current.elements.length) {
        return current.elements[remaining]
      }
      remaining -= current.elements.length
      current = current.next
    }

    return undefined
  }

  toArray() {
    const result = []
    let current = this.head

    while (current) {
      result.push(...current.elements)
      current = current.next
    }

    return result
  }
}
```

**优势**:

- 缓存友好(块内连续)
- 减少内存分配次数
- 适合批量操作

## 实际应用对比

| 数据结构 | 最佳场景   | 优势              | 劣势           |
| -------- | ---------- | ----------------- | -------------- |
| 并查集   | 连通性问题 | 近乎 O(1)         | 只支持特定操作 |
| 跳表     | 有序集合   | 实现简单,并发友好 | 额外空间       |
| 树状数组 | 前缀和查询 | 代码简洁,常数小   | 功能有限       |
| Trie     | 字符串检索 | 前缀匹配高效      | 空间消耗大     |
| 块状链表 | 批量操作   | 缓存友好          | 实现复杂       |

## 选择指南

### 何时使用并查集?

- 动态连通性判断
- 最小生成树 (Kruskal)
- 图的连通分量

### 何时使用跳表?

- 需要有序结构
- 并发环境
- 替代平衡树

### 何时使用树状数组?

- 频繁的前缀和查询
- 单点更新 + 区间查询
- 逆序对计数

### 何时使用 Trie?

- 自动补全
- 拼写检查
- IP 路由

## 实践建议

1. **理解 trade-off**: 没有完美的数据结构
2. **优先使用标准库**: 大多数语言提供成熟实现
3. **考虑实际数据规模**: 小规模时简单结构可能更好
4. **测试边界情况**: 空结构、单元素、大量重复
5. **关注常数因子**: 理论复杂度相同,实际性能可能差异很大
6. **利用空间换时间**: 适当冗余可以加速查询

## 总结

高级数据结构在特定场景下能提供卓越的性能:

- **并查集**: 处理集合合并和查询
- **跳表**: 简单的有序结构实现
- **树状数组**: 高效的前缀和操作
- **Trie**: 字符串相关操作
- **LRU/LFU**: 缓存淘汰策略

掌握这些数据结构可以让你在面对复杂问题时游刃有余。

## 参考资料

- 《算法导论》- Thomas H. Cormen
- 《数据结构与算法分析》- Mark Allen Weiss
- LeetCode 题库
- Redis 源码 (跳表实现)
