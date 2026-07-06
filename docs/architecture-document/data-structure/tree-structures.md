# 树形数据结构

树是一种非线性的层次结构,由节点和边组成。每个节点有零个或多个子节点,但只有一个父节点(根节点除外)。

## 基本概念

- **根节点 (Root)**: 树的顶部节点,没有父节点
- **叶子节点 (Leaf)**: 没有子节点的节点
- **内部节点**: 既有父节点又有子节点的节点
- **深度 (Depth)**: 从根到节点的路径长度
- **高度 (Height)**: 从节点到最远叶子的路径长度
- **度 (Degree)**: 节点的子节点数量

## 二叉树 (Binary Tree)

### 特点

每个节点最多有两个子节点:左子节点和右子节点。

### 实现

```javascript
class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

class BinaryTree {
  constructor() {
    this.root = null
  }

  // 前序遍历: 根 -> 左 -> 右
  preorder(node = this.root, result = []) {
    if (!node) return result
    result.push(node.val)
    this.preorder(node.left, result)
    this.preorder(node.right, result)
    return result
  }

  // 中序遍历: 左 -> 根 -> 右
  inorder(node = this.root, result = []) {
    if (!node) return result
    this.inorder(node.left, result)
    result.push(node.val)
    this.inorder(node.right, result)
    return result
  }

  // 后序遍历: 左 -> 右 -> 根
  postorder(node = this.root, result = []) {
    if (!node) return result
    this.postorder(node.left, result)
    this.postorder(node.right, result)
    result.push(node.val)
    return result
  }

  // 层序遍历 (BFS)
  levelOrder() {
    if (!this.root) return []

    const result = []
    const queue = [this.root]

    while (queue.length > 0) {
      const node = queue.shift()
      result.push(node.val)

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    return result
  }
}
```

### 遍历方式对比

| 遍历方式 | 顺序     | 应用场景           |
| -------- | -------- | ------------------ |
| 前序     | 根左右   | 复制树、序列化     |
| 中序     | 左根右   | BST 排序输出       |
| 后序     | 左右根   | 删除树、计算表达式 |
| 层序     | 从上到下 | BFS、最短路径      |

## 二叉搜索树 (BST)

### 特点

- 左子树所有节点 < 根节点
- 右子树所有节点 > 根节点
- 左右子树也是 BST

### 实现

```javascript
class BinarySearchTree {
  constructor() {
    this.root = null
  }

  // 插入: O(log n) 平均, O(n) 最坏
  insert(val) {
    const node = new TreeNode(val)

    if (!this.root) {
      this.root = node
      return
    }

    let current = this.root
    while (true) {
      if (val < current.val) {
        if (!current.left) {
          current.left = node
          return
        }
        current = current.left
      } else if (val > current.val) {
        if (!current.right) {
          current.right = node
          return
        }
        current = current.right
      } else {
        return // 重复值不插入
      }
    }
  }

  // 查找: O(log n) 平均
  search(val) {
    let current = this.root

    while (current) {
      if (val === current.val) return current
      if (val < current.val) {
        current = current.left
      } else {
        current = current.right
      }
    }

    return null
  }

  delete(val) {
    this.root = this._deleteNode(this.root, val)
  }

  _deleteNode(node, val) {
    if (!node) return null

    if (val < node.val) {
      node.left = this._deleteNode(node.left, val)
    } else if (val > node.val) {
      node.right = this._deleteNode(node.right, val)
    } else {
      // 找到要删除的节点

      // 情况1: 叶子节点
      if (!node.left && !node.right) {
        return null
      }

      // 情况2: 只有一个子节点
      if (!node.left) return node.right
      if (!node.right) return node.left

      // 情况3: 有两个子节点
      // 找到右子树的最小值(中序后继)
      const minNode = this._findMin(node.right)
      node.val = minNode.val
      node.right = this._deleteNode(node.right, minNode.val)
    }

    return node
  }

  _findMin(node) {
    while (node.left) {
      node = node.left
    }
    return node
  }

  // 查找最小值
  findMin() {
    if (!this.root) return null
    let current = this.root
    while (current.left) {
      current = current.left
    }
    return current.val
  }

  // 查找最大值
  findMax() {
    if (!this.root) return null
    let current = this.root
    while (current.right) {
      current = current.right
    }
    return current.val
  }
}
```

### 性能问题

BST 在最坏情况下会退化为链表:

```javascript
const bst = new BinarySearchTree()
bst.insert(1)
bst.insert(2)
bst.insert(3)
bst.insert(4)
// 退化为: 1 -> 2 -> 3 -> 4
```

解决方案: 使用平衡二叉搜索树

## 平衡二叉搜索树

### AVL 树

**特点**: 任意节点的左右子树高度差不超过 1

**旋转操作**:

```javascript
class AVLNode extends TreeNode {
  constructor(val) {
    super(val)
    this.height = 1
  }
}

class AVLTree extends BinarySearchTree {
  constructor() {
    super()
  }

  _getHeight(node) {
    return node ? node.height : 0
  }

  _getBalance(node) {
    return node ? this._getHeight(node.left) - this._getHeight(node.right) : 0
  }

  _updateHeight(node) {
    node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right))
  }

  // 右旋
  _rotateRight(y) {
    const x = y.left
    const T2 = x.right

    x.right = y
    y.left = T2

    this._updateHeight(y)
    this._updateHeight(x)

    return x
  }

  // 左旋
  _rotateLeft(x) {
    const y = x.right
    const T2 = y.left

    y.left = x
    x.right = T2

    this._updateHeight(x)
    this._updateHeight(y)

    return y
  }

  insert(val) {
    this.root = this._insert(this.root, val)
  }

  _insert(node, val) {
    if (!node) return new AVLNode(val)

    if (val < node.val) {
      node.left = this._insert(node.left, val)
    } else if (val > node.val) {
      node.right = this._insert(node.right, val)
    } else {
      return node // 重复值
    }

    this._updateHeight(node)

    const balance = this._getBalance(node)

    // LL 情况
    if (balance > 1 && val < node.left.val) {
      return this._rotateRight(node)
    }

    // RR 情况
    if (balance < -1 && val > node.right.val) {
      return this._rotateLeft(node)
    }

    // LR 情况
    if (balance > 1 && val > node.left.val) {
      node.left = this._rotateLeft(node.left)
      return this._rotateRight(node)
    }

    // RL 情况
    if (balance < -1 && val < node.right.val) {
      node.right = this._rotateRight(node.right)
      return this._rotateLeft(node)
    }

    return node
  }
}
```

### 红黑树

**特点**:

- 节点是红色或黑色
- 根节点是黑色
- 叶子节点(NIL)是黑色
- 红色节点的子节点必须是黑色
- 从任一节点到其叶子的所有路径包含相同数量的黑色节点

JavaScript 的 `Map` 和 `Set` 底层通常使用红黑树或哈希表实现。

## 堆 (Heap)

### 特点

- **完全二叉树**: 除了最后一层,其他层都是满的
- **堆性质**:
  - 最大堆: 父节点 >= 子节点
  - 最小堆: 父节点 <= 子节点

### 数组实现

```javascript
class MinHeap {
  constructor() {
    this.heap = []
  }

  // 获取父节点索引
  _parent(i) {
    return Math.floor((i - 1) / 2)
  }

  // 获取左子节点索引
  _left(i) {
    return 2 * i + 1
  }

  // 获取右子节点索引
  _right(i) {
    return 2 * i + 2
  }

  // 上浮
  _bubbleUp(i) {
    while (i > 0 && this.heap[this._parent(i)] > this.heap[i]) {
      ;[this.heap[this._parent(i)], this.heap[i]] = [this.heap[i], this.heap[this._parent(i)]]
      i = this._parent(i)
    }
  }

  // 下沉
  _sinkDown(i) {
    const size = this.heap.length

    while (true) {
      let smallest = i
      const left = this._left(i)
      const right = this._right(i)

      if (left < size && this.heap[left] < this.heap[smallest]) {
        smallest = left
      }

      if (right < size && this.heap[right] < this.heap[smallest]) {
        smallest = right
      }

      if (smallest === i) break

      ;[this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]]
      i = smallest
    }
  }

  // 插入: O(log n)
  push(val) {
    this.heap.push(val)
    this._bubbleUp(this.heap.length - 1)
  }

  // 弹出最小值: O(log n)
  pop() {
    if (this.heap.length === 0) return undefined

    const min = this.heap[0]
    const last = this.heap.pop()

    if (this.heap.length > 0) {
      this.heap[0] = last
      this._sinkDown(0)
    }

    return min
  }

  // 查看最小值: O(1)
  peek() {
    return this.heap[0]
  }

  size() {
    return this.heap.length
  }
}
```

### 应用场景

#### Top K 问题

```javascript
function findTopK(nums, k) {
  const minHeap = new MinHeap()

  for (const num of nums) {
    minHeap.push(num)
    if (minHeap.size() > k) {
      minHeap.pop() // 保持堆大小为 k
    }
  }

  // 堆中剩余的 k 个元素就是最大的 k 个
  const result = []
  while (minHeap.size() > 0) {
    result.push(minHeap.pop())
  }

  return result.reverse()
}

console.log(findTopK([3, 1, 5, 12, 2, 11], 3)) // [5, 11, 12]
```

#### 合并 K 个有序链表

```javascript
function mergeKLists(lists) {
  const minHeap = new MinHeap()

  // 将每个链表的头节点加入堆
  lists.forEach((list, index) => {
    if (list) {
      minHeap.push({ val: list.val, index })
    }
  })

  const dummy = new ListNode(0)
  let current = dummy

  while (minHeap.size() > 0) {
    const { val, index } = minHeap.pop()
    current.next = new ListNode(val)
    current = current.next

    // 如果该链表还有下一个节点,加入堆
    if (lists[index].next) {
      lists[index] = lists[index].next
      minHeap.push({ val: lists[index].val, index })
    }
  }

  return dummy.next
}
```

## Trie (前缀树)

### 特点

- 用于字符串检索
- 公共前缀共享节点
- 高效的前缀匹配

### 实现

```javascript
class TrieNode {
  constructor() {
    this.children = {}
    this.isEnd = false
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  // 插入单词: O(m), m 为单词长度
  insert(word) {
    let node = this.root

    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }

    node.isEnd = true
  }

  // 搜索单词: O(m)
  search(word) {
    const node = this._searchPrefix(word)
    return node !== null && node.isEnd
  }

  // 检查是否有以 prefix 为前缀的单词: O(m)
  startsWith(prefix) {
    return this._searchPrefix(prefix) !== null
  }

  _searchPrefix(prefix) {
    let node = this.root

    for (const char of prefix) {
      if (!node.children[char]) return null
      node = node.children[char]
    }

    return node
  }
}

// 使用示例
const trie = new Trie()
trie.insert('apple')
trie.insert('app')
trie.insert('application')

console.log(trie.search('apple')) // true
console.log(trie.search('app')) // true
console.log(trie.startsWith('appl')) // true
console.log(trie.startsWith('ban')) // false
```

### 应用场景

- 自动补全
- 拼写检查
- IP 路由最长前缀匹配
- 词频统计

## B 树 / B+ 树

### 特点

- **多路搜索树**: 每个节点可以有多个子节点
- **平衡**: 所有叶子节点在同一层
- **适合磁盘存储**: 减少 I/O 次数

### B+ 树 vs B 树

| 特性       | B 树     | B+ 树            |
| ---------- | -------- | ---------------- |
| 数据存储   | 所有节点 | 仅叶子节点       |
| 范围查询   | 较慢     | 快(叶子节点链表) |
| 空间利用率 | 较低     | 较高             |
| 应用场景   | 文件系统 | 数据库索引       |

### 为什么数据库用 B+ 树?

1. **减少磁盘 I/O**: 树的高度低,每次查询只需几次磁盘读取
2. **范围查询高效**: 叶子节点形成链表,顺序扫描快
3. **稳定性能**: 所有查询时间复杂度相同

## 线段树 (Segment Tree)

### 特点

- 用于区间查询和更新
- 支持快速求区间和、最大值、最小值等

### 实现

```javascript
class SegmentTree {
  constructor(nums) {
    this.n = nums.length
    this.tree = new Array(4 * this.n).fill(0)
    this.build(nums, 0, 0, this.n - 1)
  }

  build(nums, node, start, end) {
    if (start === end) {
      this.tree[node] = nums[start]
      return
    }

    const mid = Math.floor((start + end) / 2)
    this.build(nums, 2 * node + 1, start, mid)
    this.build(nums, 2 * node + 2, mid + 1, end)
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2]
  }

  // 区间查询: O(log n)
  query(node, start, end, L, R) {
    if (R < start || L > end) return 0
    if (L <= start && end <= R) return this.tree[node]

    const mid = Math.floor((start + end) / 2)
    return this.query(2 * node + 1, start, mid, L, R) + this.query(2 * node + 2, mid + 1, end, L, R)
  }

  // 单点更新: O(log n)
  update(node, start, end, idx, val) {
    if (start === end) {
      this.tree[node] = val
      return
    }

    const mid = Math.floor((start + end) / 2)
    if (idx <= mid) {
      this.update(2 * node + 1, start, mid, idx, val)
    } else {
      this.update(2 * node + 2, mid + 1, end, idx, val)
    }

    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2]
  }
}

// 使用示例
const nums = [1, 3, 5, 7, 9, 11]
const segTree = new SegmentTree(nums)

console.log(segTree.query(0, 0, 5, 1, 3)) // 3 + 5 + 7 = 15
segTree.update(0, 0, 5, 2, 10) // 将索引 2 的值改为 10
console.log(segTree.query(0, 0, 5, 1, 3)) // 3 + 10 + 7 = 20
```

## 树的应用场景总结

| 树类型     | 典型应用                 |
| ---------- | ------------------------ |
| BST        | 有序数据、字典           |
| AVL/红黑树 | Map/Set 实现、数据库索引 |
| 堆         | 优先队列、Top K、堆排序  |
| Trie       | 自动补全、搜索引擎       |
| B+/B 树    | 数据库索引、文件系统     |
| 线段树     | 区间查询、RMQ 问题       |

## 实践建议

1. **优先使用标准库**: JavaScript 的 `Map`、`Set` 已经优化得很好
2. **理解平衡的重要性**: 不平衡的树会退化
3. **选择合适的树**: 根据具体需求选择 BST、堆、Trie 等
4. **注意递归深度**: 深树可能导致栈溢出,考虑迭代实现
5. **内存管理**: 删除节点时注意释放内存

## 下一步

- [图数据结构](./graph-structures) - 学习更复杂的非线性结构
- [哈希表与集合](./hash-structures) - 高效的键值存储
- [高级数据结构](./advanced-structures) - 并查集、跳表等
