# 哈希表与集合

哈希表(Hash Table)和集合(Set)是基于哈希函数实现的高效数据结构,提供平均 O(1) 的查找、插入和删除操作。

## 哈希函数

### 什么是哈希函数?

哈希函数将任意大小的输入映射到固定大小的输出(哈希值)。

```javascript
// 简单的字符串哈希函数
function hashFunction(key, tableSize) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % tableSize
  }
  return hash
}

console.log(hashFunction('hello', 10)) // 某个 0-9 的值
console.log(hashFunction('world', 10)) // 某个 0-9 的值
```

### 好的哈希函数特性

1. **确定性**: 相同输入总是产生相同输出
2. **均匀分布**: 不同输入均匀分布到各个桶
3. **高效计算**: 计算速度快
4. **低碰撞率**: 尽量减少不同输入产生相同哈希值

## 哈希冲突解决

### 1. 链地址法 (Separate Chaining)

每个桶是一个链表,冲突的元素链接在一起。

```javascript
class HashTableChaining {
  constructor(size = 53) {
    this.keyMap = new Array(size)
  }

  _hash(key) {
    let total = 0
    const WEIRD_PRIME = 31

    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i]
      const value = char.charCodeAt(0) - 96
      total = (total * WEIRD_PRIME + value) % this.keyMap.length
    }

    return total
  }

  set(key, value) {
    const index = this._hash(key)

    if (!this.keyMap[index]) {
      this.keyMap[index] = []
    }

    // 检查是否已存在,更新值
    for (let i = 0; i < this.keyMap[index].length; i++) {
      if (this.keyMap[index][i][0] === key) {
        this.keyMap[index][i][1] = value
        return
      }
    }

    this.keyMap[index].push([key, value])
  }

  get(key) {
    const index = this._hash(key)

    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          return this.keyMap[index][i][1]
        }
      }
    }

    return undefined
  }

  delete(key) {
    const index = this._hash(key)

    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          this.keyMap[index].splice(i, 1)
          return true
        }
      }
    }

    return false
  }

  keys() {
    const keysArr = []

    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        for (let j = 0; j < this.keyMap[i].length; j++) {
          keysArr.push(this.keyMap[i][j][0])
        }
      }
    }

    return keysArr
  }
}
```

### 2. 开放地址法 (Open Addressing)

#### 线性探测

```javascript
class HashTableLinearProbing {
  constructor(size = 53) {
    this.keyMap = new Array(size).fill(null)
    this.size = size
    this.count = 0
  }

  _hash(key) {
    let total = 0
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i]
      const value = char.charCodeAt(0) - 96
      total = (total * 31 + value) % this.size
    }
    return total
  }

  set(key, value) {
    if (this.count / this.size > 0.7) {
      this._resize()
    }

    let index = this._hash(key)
    let originalIndex = index

    while (this.keyMap[index] !== null && this.keyMap[index].key !== key) {
      index = (index + 1) % this.size

      if (index === originalIndex) {
        throw new Error('Hash table is full')
      }
    }

    if (this.keyMap[index] === null) {
      this.count++
    }

    this.keyMap[index] = { key, value }
  }

  get(key) {
    let index = this._hash(key)
    const originalIndex = index

    while (this.keyMap[index] !== null) {
      if (this.keyMap[index].key === key) {
        return this.keyMap[index].value
      }

      index = (index + 1) % this.size

      if (index === originalIndex) {
        return undefined
      }
    }

    return undefined
  }

  delete(key) {
    let index = this._hash(key)
    const originalIndex = index

    while (this.keyMap[index] !== null) {
      if (this.keyMap[index].key === key) {
        this.keyMap[index] = 'DELETED' // 标记为已删除
        this.count--
        return true
      }

      index = (index + 1) % this.size

      if (index === originalIndex) {
        return false
      }
    }

    return false
  }

  _resize() {
    const oldKeyMap = this.keyMap
    this.size = this.size * 2 + 1
    this.keyMap = new Array(this.size).fill(null)
    this.count = 0

    for (const item of oldKeyMap) {
      if (item && item !== 'DELETED') {
        this.set(item.key, item.value)
      }
    }
  }
}
```

#### 二次探测

```javascript
// 使用二次函数而不是线性递增
index = (originalIndex + i * i) % size
```

#### 双重哈希

```javascript
// 使用第二个哈希函数
index = (hash1(key) + i * hash2(key)) % size
```

### 3. 再哈希 (Rehashing)

当负载因子超过阈值时,扩大哈希表并重新哈希所有元素。

```javascript
_resize() {
  const newSize = this.size * 2 + 1; // 通常选择质数
  const oldItems = [...this.items()];

  this.size = newSize;
  this.keyMap = new Array(newSize).fill(null);
  this.count = 0;

  for (const [key, value] of oldItems) {
    this.set(key, value);
  }
}
```

## JavaScript Map 和 Set

### Map

```javascript
// 创建 Map
const map = new Map()

// 设置键值对
map.set('name', 'Alice')
map.set('age', 25)
map.set({ id: 1 }, 'object key') // 对象可以作为键

// 获取值
console.log(map.get('name')) // 'Alice'

// 检查键是否存在
console.log(map.has('age')) // true

// 删除
map.delete('age')

// 遍历
for (const [key, value] of map) {
  console.log(`${key}: ${value}`)
}

// 大小
console.log(map.size)

// 与普通对象的区别
const obj = {}
obj['1'] = 'one'
obj[1] = 'one' // 覆盖,因为键被转换为字符串

const map2 = new Map()
map2.set('1', 'string one')
map2.set(1, 'number one') // 不覆盖,不同类型
console.log(map2.size) // 2
```

### Set

```javascript
// 创建 Set
const set = new Set()

// 添加元素
set.add(1)
set.add(2)
set.add(2) // 重复,不会添加

// 检查存在
console.log(set.has(1)) // true

// 删除
set.delete(2)

// 大小
console.log(set.size) // 1

// 遍历
set.forEach((value) => console.log(value))

// 数组去重
const arr = [1, 2, 2, 3, 3, 4]
const unique = [...new Set(arr)] // [1, 2, 3, 4]

// 集合运算
const setA = new Set([1, 2, 3, 4])
const setB = new Set([3, 4, 5, 6])

// 交集
const intersection = new Set([...setA].filter((x) => setB.has(x)))
console.log(intersection) // Set { 3, 4 }

// 并集
const union = new Set([...setA, ...setB])
console.log(union) // Set { 1, 2, 3, 4, 5, 6 }

// 差集
const difference = new Set([...setA].filter((x) => !setB.has(x)))
console.log(difference) // Set { 1, 2 }
```

## 实际应用

### 1. 缓存 (LRU Cache)

结合哈希表和双向链表实现 LRU 缓存。

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    // 移到末尾(最近使用)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的(第一个)
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, value)
  }
}

// 使用示例
const cache = new LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
console.log(cache.get(1)) // 1
cache.put(3, 3) // 删除 key 2
console.log(cache.get(2)) // -1 (not found)
```

### 2. 词频统计

```javascript
function wordFrequency(text) {
  const words = text.toLowerCase().match(/\w+/g) || []
  const freq = new Map()

  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1)
  }

  return freq
}

const text = 'the quick brown fox jumps over the lazy dog the fox'
const freq = wordFrequency(text)

// 按频率排序
const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
console.log(sorted)
// [['the', 3], ['fox', 2], ['quick', 1], ...]
```

### 3. 两数之和

```javascript
function twoSum(nums, target) {
  const map = new Map()

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]

    if (map.has(complement)) {
      return [map.get(complement), i]
    }

    map.set(nums[i], i)
  }

  return []
}

console.log(twoSum([2, 7, 11, 15], 9)) // [0, 1]
```

**时间复杂度**: O(n),比暴力解法 O(n²) 快很多

### 4. 最长无重复字符子串

```javascript
function lengthOfLongestSubstring(s) {
  const map = new Map()
  let maxLength = 0
  let start = 0

  for (let end = 0; end < s.length; end++) {
    const char = s[end]

    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1
    }

    map.set(char, end)
    maxLength = Math.max(maxLength, end - start + 1)
  }

  return maxLength
}

console.log(lengthOfLongestSubstring('abcabcbb')) // 3 ("abc")
```

### 5. 分组变位词

```javascript
function groupAnagrams(strs) {
  const map = new Map()

  for (const str of strs) {
    // 排序后的字符串作为键
    const key = str.split('').sort().join('')

    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key).push(str)
  }

  return [...map.values()]
}

console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))
// [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

### 6. 布隆过滤器 (Bloom Filter)

概率性数据结构,用于判断元素是否在集合中。

```javascript
class BloomFilter {
  constructor(size, hashCount) {
    this.size = size
    this.hashCount = hashCount
    this.bitArray = new Array(size).fill(0)
  }

  _hashes(item) {
    const hashes = []
    for (let i = 0; i < this.hashCount; i++) {
      let hash = 0
      const str = item.toString() + i
      for (let j = 0; j < str.length; j++) {
        hash = (hash << 5) - hash + str.charCodeAt(j)
        hash = hash & hash // Convert to 32bit integer
      }
      hashes.push(Math.abs(hash) % this.size)
    }
    return hashes
  }

  add(item) {
    const hashes = this._hashes(item)
    for (const hash of hashes) {
      this.bitArray[hash] = 1
    }
  }

  mightContain(item) {
    const hashes = this._hashes(item)
    return hashes.every((hash) => this.bitArray[hash] === 1)
  }
}

// 使用示例
const filter = new BloomFilter(1000, 3)
filter.add('apple')
filter.add('banana')

console.log(filter.mightContain('apple')) // true (一定存在)
console.log(filter.mightContain('banana')) // true (一定存在)
console.log(filter.mightContain('cherry')) // false (可能存在,有假阳性)
```

**特点**:

- 可能有假阳性(false positive)
- 不会有假阴性(false negative)
- 空间效率高
- 应用于: 网页爬虫去重、缓存穿透防护

## 性能分析

### 时间复杂度

| 操作 | 平均情况 | 最坏情况 |
| ---- | -------- | -------- |
| 查找 | O(1)     | O(n)     |
| 插入 | O(1)     | O(n)     |
| 删除 | O(1)     | O(n)     |

> 最坏情况发生在所有元素都冲突时,退化为链表

### 空间复杂度

- **链地址法**: O(n + k),k 为桶数量
- **开放地址法**: O(k),需要预留空间

### 负载因子

负载因子 = 元素数量 / 桶数量

- **理想范围**: 0.5 - 0.75
- **过高**: 冲突增多,性能下降
- **过低**: 浪费空间

## 哈希表 vs 其他结构

| 特性     | 哈希表 | 平衡树   | 数组 |
| -------- | ------ | -------- | ---- |
| 查找     | O(1)   | O(log n) | O(n) |
| 插入     | O(1)   | O(log n) | O(n) |
| 删除     | O(1)   | O(log n) | O(n) |
| 有序性   | ✗      | ✓        | ✓    |
| 范围查询 | ✗      | ✓        | ✓    |
| 内存开销 | 较高   | 中等     | 最低 |

## 实践建议

1. **选择合适的负载因子**: 通常在 0.75 左右触发扩容
2. **使用质数作为桶数量**: 减少冲突
3. **好的哈希函数**: 均匀分布,计算快速
4. **处理冲突**: 根据场景选择链地址法或开放地址法
5. **注意键的类型**: JavaScript Map 支持各种类型作为键
6. **避免修改键**: 插入后不要修改会影响哈希值的属性
7. **考虑有序需求**: 如果需要有序,使用 TreeMap 或 SortedMap

## 常见问题

### Q: 为什么 HashMap 的容量通常是 2 的幂?

A: 可以使用位运算 `hash & (capacity - 1)` 代替取模,速度更快。

### Q: 如何处理哈希碰撞攻击?

A:

- 使用加密哈希函数
- 限制单个桶的最大长度
- 随机化哈希函数种子

### Q: Map 和普通对象有什么区别?

A:

- Map 的键可以是任意类型
- Map 保持插入顺序
- Map 有 size 属性
- Map 有更好的性能(大量键值对时)

## 下一步

- [高级数据结构](./advanced-structures) - 并查集、跳表、线段树等
