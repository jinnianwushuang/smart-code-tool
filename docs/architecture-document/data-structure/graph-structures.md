# 图数据结构

图是由顶点(节点)和边组成的数据结构,用于表示对象之间的关系。图是最通用的数据结构之一,可以建模各种复杂的关系网络。

## 基本概念

- **顶点 (Vertex/Node)**: 图中的基本单元
- **边 (Edge)**: 连接两个顶点的线
- **度 (Degree)**: 与顶点相连的边的数量
- **路径 (Path)**: 顶点序列,相邻顶点之间有边相连
- **环 (Cycle)**: 起点和终点相同的路径
- **连通图**: 任意两个顶点之间都有路径
- **加权图**: 边带有权重值

## 图的分类

| 类型   | 描述                   | 示例               |
| ------ | ---------------------- | ------------------ |
| 无向图 | 边没有方向             | 社交网络好友关系   |
| 有向图 | 边有方向               | 网页链接、依赖关系 |
| 加权图 | 边有权重               | 地图距离、网络延迟 |
| 无权图 | 边无权重               | 简单关系网络       |
| 稠密图 | 边数接近顶点数的平方   | 完全图             |
| 稀疏图 | 边数远小于顶点数的平方 | 社交网络           |

## 图的表示

### 1. 邻接矩阵

```javascript
class GraphMatrix {
  constructor(vertices) {
    this.vertices = vertices
    this.matrix = Array(vertices)
      .fill(null)
      .map(() => Array(vertices).fill(0))
  }

  // 添加边: O(1)
  addEdge(v1, v2, weight = 1) {
    this.matrix[v1][v2] = weight
    this.matrix[v2][v1] = weight // 无向图
  }

  // 检查是否有边: O(1)
  hasEdge(v1, v2) {
    return this.matrix[v1][v2] !== 0
  }

  // 获取邻居: O(V)
  getNeighbors(v) {
    const neighbors = []
    for (let i = 0; i < this.vertices; i++) {
      if (this.matrix[v][i] !== 0) {
        neighbors.push(i)
      }
    }
    return neighbors
  }
}
```

**优点**:

- 查询边的存在性: O(1)
- 适合稠密图

**缺点**:

- 空间复杂度: O(V²)
- 遍历邻居: O(V)
- 不适合稀疏图

### 2. 邻接表

```javascript
class GraphList {
  constructor() {
    this.adjacencyList = new Map()
  }

  // 添加顶点
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, [])
    }
  }

  // 添加边: O(1)
  addEdge(v1, v2, weight = 1) {
    this.addVertex(v1)
    this.addVertex(v2)

    this.adjacencyList.get(v1).push({ vertex: v2, weight })
    this.adjacencyList.get(v2).push({ vertex: v1, weight }) // 无向图
  }

  // 获取邻居: O(degree)
  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || []
  }

  // 删除边: O(E)
  removeEdge(v1, v2) {
    const neighbors1 = this.adjacencyList.get(v1)
    const neighbors2 = this.adjacencyList.get(v2)

    if (neighbors1) {
      this.adjacencyList.set(
        v1,
        neighbors1.filter((n) => n.vertex !== v2),
      )
    }

    if (neighbors2) {
      this.adjacencyList.set(
        v2,
        neighbors2.filter((n) => n.vertex !== v1),
      )
    }
  }
}
```

**优点**:

- 空间复杂度: O(V + E)
- 遍历邻居高效
- 适合稀疏图

**缺点**:

- 查询边的存在性: O(degree)

### 选择建议

- **稠密图**: 使用邻接矩阵
- **稀疏图**: 使用邻接表
- **频繁查询边**: 使用邻接矩阵或哈希表优化

## 图的遍历

### 深度优先搜索 (DFS)

```javascript
class GraphTraversal {
  constructor(graph) {
    this.graph = graph
  }

  // DFS - 递归实现
  dfsRecursive(start, visited = new Set(), callback) {
    visited.add(start)
    callback(start)

    const neighbors = this.graph.getNeighbors(start)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        this.dfsRecursive(neighbor.vertex, visited, callback)
      }
    }
  }

  // DFS - 迭代实现
  dfsIterative(start, callback) {
    const visited = new Set()
    const stack = [start]

    while (stack.length > 0) {
      const vertex = stack.pop()

      if (!visited.has(vertex)) {
        visited.add(vertex)
        callback(vertex)

        const neighbors = this.graph.getNeighbors(vertex)
        // 逆序入栈,保证访问顺序
        for (let i = neighbors.length - 1; i >= 0; i--) {
          if (!visited.has(neighbors[i].vertex)) {
            stack.push(neighbors[i].vertex)
          }
        }
      }
    }
  }

  // BFS - 广度优先搜索
  bfs(start, callback) {
    const visited = new Set()
    const queue = [start]
    visited.add(start)

    while (queue.length > 0) {
      const vertex = queue.shift()
      callback(vertex)

      const neighbors = this.graph.getNeighbors(vertex)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          visited.add(neighbor.vertex)
          queue.push(neighbor.vertex)
        }
      }
    }
  }
}

// 使用示例
const graph = new GraphList()
graph.addEdge('A', 'B')
graph.addEdge('A', 'C')
graph.addEdge('B', 'D')
graph.addEdge('C', 'E')
graph.addEdge('D', 'E')

const traversal = new GraphTraversal(graph)

console.log('DFS:')
traversal.dfsIterative('A', (v) => console.log(v))
// A -> C -> E -> D -> B

console.log('BFS:')
traversal.bfs('A', (v) => console.log(v))
// A -> B -> C -> D -> E
```

### DFS vs BFS

| 特性       | DFS              | BFS            |
| ---------- | ---------------- | -------------- |
| 数据结构   | 栈               | 队列           |
| 空间复杂度 | O(V)             | O(V)           |
| 时间复杂度 | O(V + E)         | O(V + E)       |
| 应用场景   | 拓扑排序、环检测 | 最短路径(无权) |
| 特点       | 深入探索         | 逐层扩展       |

## 最短路径算法

### Dijkstra 算法 (单源最短路径)

适用于**非负权重**的图。

```javascript
function dijkstra(graph, start) {
  const distances = new Map()
  const previous = new Map()
  const pq = new PriorityQueue() // 最小堆

  // 初始化
  for (const vertex of graph.adjacencyList.keys()) {
    distances.set(vertex, Infinity)
    previous.set(vertex, null)
  }
  distances.set(start, 0)

  pq.enqueue(start, 0)

  while (!pq.isEmpty()) {
    const { item: current, priority: currentDist } = pq.dequeue()

    if (currentDist > distances.get(current)) continue

    const neighbors = graph.getNeighbors(current)
    for (const neighbor of neighbors) {
      const alt = distances.get(current) + neighbor.weight

      if (alt < distances.get(neighbor.vertex)) {
        distances.set(neighbor.vertex, alt)
        previous.set(neighbor.vertex, current)
        pq.enqueue(neighbor.vertex, alt)
      }
    }
  }

  return { distances, previous }
}

// 重建路径
function getPath(previous, start, end) {
  const path = []
  let current = end

  while (current !== null) {
    path.unshift(current)
    current = previous.get(current)
  }

  return path[0] === start ? path : []
}
```

**时间复杂度**: O((V + E) log V) 使用优先队列

### Bellman-Ford 算法

适用于**有负权重**的图,可以检测负权环。

```javascript
function bellmanFord(graph, start) {
  const distances = new Map()
  const previous = new Map()
  const vertices = Array.from(graph.adjacencyList.keys())

  // 初始化
  for (const vertex of vertices) {
    distances.set(vertex, Infinity)
    previous.set(vertex, null)
  }
  distances.set(start, 0)

  // 松弛操作 V-1 次
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const u of vertices) {
      const neighbors = graph.getNeighbors(u)
      for (const { vertex: v, weight } of neighbors) {
        if (distances.get(u) + weight < distances.get(v)) {
          distances.set(v, distances.get(u) + weight)
          previous.set(v, u)
        }
      }
    }
  }

  // 检测负权环
  for (const u of vertices) {
    const neighbors = graph.getNeighbors(u)
    for (const { vertex: v, weight } of neighbors) {
      if (distances.get(u) + weight < distances.get(v)) {
        throw new Error('Graph contains negative weight cycle')
      }
    }
  }

  return { distances, previous }
}
```

**时间复杂度**: O(V × E)

### Floyd-Warshall 算法 (所有点对最短路径)

```javascript
function floydWarshall(vertices, edges) {
  const n = vertices.length
  const dist = Array(n)
    .fill(null)
    .map(() => Array(n).fill(Infinity))

  // 初始化
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0
  }

  for (const { from, to, weight } of edges) {
    dist[from][to] = weight
  }

  // 动态规划
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }

  return dist
}
```

**时间复杂度**: O(V³)

## 最小生成树 (MST)

### Prim 算法

```javascript
function prim(graph) {
  const mst = []
  const visited = new Set()
  const pq = new PriorityQueue()

  // 从任意顶点开始
  const start = graph.adjacencyList.keys().next().value
  visited.add(start)

  // 将起始顶点的所有边加入优先队列
  for (const neighbor of graph.getNeighbors(start)) {
    pq.enqueue({ from: start, to: neighbor.vertex, weight: neighbor.weight }, neighbor.weight)
  }

  while (!pq.isEmpty() && visited.size < graph.adjacencyList.size) {
    const { item: edge } = pq.dequeue()

    if (visited.has(edge.to)) continue

    visited.add(edge.to)
    mst.push(edge)

    // 将新加入顶点的所有边加入队列
    for (const neighbor of graph.getNeighbors(edge.to)) {
      if (!visited.has(neighbor.vertex)) {
        pq.enqueue({ from: edge.to, to: neighbor.vertex, weight: neighbor.weight }, neighbor.weight)
      }
    }
  }

  return mst
}
```

**时间复杂度**: O(E log V)

### Kruskal 算法

需要并查集支持(见高级数据结构章节)。

```javascript
function kruskal(vertices, edges) {
  // 按权重排序
  edges.sort((a, b) => a.weight - b.weight)

  const uf = new UnionFind(vertices.length)
  const mst = []

  for (const edge of edges) {
    if (uf.find(edge.from) !== uf.find(edge.to)) {
      uf.union(edge.from, edge.to)
      mst.push(edge)
    }
  }

  return mst
}
```

**时间复杂度**: O(E log E)

## 拓扑排序

适用于**有向无环图 (DAG)**,用于任务调度、依赖解析等。

### Kahn 算法 (BFS)

```javascript
function topologicalSortKahn(graph) {
  const inDegree = new Map()
  const queue = []
  const result = []

  // 计算入度
  for (const vertex of graph.adjacencyList.keys()) {
    inDegree.set(vertex, 0)
  }

  for (const vertex of graph.adjacencyList.keys()) {
    const neighbors = graph.getNeighbors(vertex)
    for (const neighbor of neighbors) {
      inDegree.set(neighbor.vertex, inDegree.get(neighbor.vertex) + 1)
    }
  }

  // 将入度为 0 的顶点加入队列
  for (const [vertex, degree] of inDegree) {
    if (degree === 0) {
      queue.push(vertex)
    }
  }

  while (queue.length > 0) {
    const vertex = queue.shift()
    result.push(vertex)

    const neighbors = graph.getNeighbors(vertex)
    for (const neighbor of neighbors) {
      inDegree.set(neighbor.vertex, inDegree.get(neighbor.vertex) - 1)
      if (inDegree.get(neighbor.vertex) === 0) {
        queue.push(neighbor.vertex)
      }
    }
  }

  // 如果结果不包含所有顶点,说明有环
  if (result.length !== graph.adjacencyList.size) {
    throw new Error('Graph has a cycle')
  }

  return result
}
```

### DFS 方法

```javascript
function topologicalSortDFS(graph) {
  const visited = new Set()
  const tempMarked = new Set()
  const result = []

  function dfs(vertex) {
    if (tempMarked.has(vertex)) {
      throw new Error('Graph has a cycle')
    }
    if (visited.has(vertex)) return

    tempMarked.add(vertex)

    const neighbors = graph.getNeighbors(vertex)
    for (const neighbor of neighbors) {
      dfs(neighbor.vertex)
    }

    tempMarked.delete(vertex)
    visited.add(vertex)
    result.unshift(vertex)
  }

  for (const vertex of graph.adjacencyList.keys()) {
    if (!visited.has(vertex)) {
      dfs(vertex)
    }
  }

  return result
}
```

## 连通分量

### 无向图的连通分量

```javascript
function findConnectedComponents(graph) {
  const visited = new Set()
  const components = []

  function dfs(vertex, component) {
    visited.add(vertex)
    component.push(vertex)

    const neighbors = graph.getNeighbors(vertex)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        dfs(neighbor.vertex, component)
      }
    }
  }

  for (const vertex of graph.adjacencyList.keys()) {
    if (!visited.has(vertex)) {
      const component = []
      dfs(vertex, component)
      components.push(component)
    }
  }

  return components
}
```

### 强连通分量 (Tarjan 算法)

```javascript
function tarjanSCC(graph) {
  let index = 0
  const indices = new Map()
  const lowlinks = new Map()
  const onStack = new Set()
  const stack = []
  const sccs = []

  function strongconnect(v) {
    indices.set(v, index)
    lowlinks.set(v, index)
    index++
    stack.push(v)
    onStack.add(v)

    const neighbors = graph.getNeighbors(v)
    for (const neighbor of neighbors) {
      const w = neighbor.vertex

      if (!indices.has(w)) {
        strongconnect(w)
        lowlinks.set(v, Math.min(lowlinks.get(v), lowlinks.get(w)))
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v), indices.get(w)))
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc = []
      let w
      do {
        w = stack.pop()
        onStack.delete(w)
        scc.push(w)
      } while (w !== v)
      sccs.push(scc)
    }
  }

  for (const vertex of graph.adjacencyList.keys()) {
    if (!indices.has(vertex)) {
      strongconnect(vertex)
    }
  }

  return sccs
}
```

## 实际应用

### 1. 社交网络分析

```javascript
// 查找共同好友
function findMutualFriends(graph, user1, user2) {
  const friends1 = new Set(graph.getNeighbors(user1).map((n) => n.vertex))
  const friends2 = new Set(graph.getNeighbors(user2).map((n) => n.vertex))

  return [...friends1].filter((f) => friends2.has(f))
}

// 六度分隔理论 - BFS 查找最短路径
function degreesOfSeparation(graph, person1, person2) {
  const visited = new Set()
  const queue = [[person1, 0]]
  visited.add(person1)

  while (queue.length > 0) {
    const [current, degree] = queue.shift()

    if (current === person2) return degree

    const neighbors = graph.getNeighbors(current)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        visited.add(neighbor.vertex)
        queue.push([neighbor.vertex, degree + 1])
      }
    }
  }

  return -1 // 不连通
}
```

### 2. 依赖解析

```javascript
// 模块依赖管理
class DependencyResolver {
  constructor() {
    this.graph = new GraphList()
  }

  addModule(name, dependencies = []) {
    this.graph.addVertex(name)
    for (const dep of dependencies) {
      this.graph.addEdge(dep, name) // dep -> name
    }
  }

  getBuildOrder() {
    return topologicalSortKahn(this.graph)
  }

  hasCircularDependency() {
    try {
      topologicalSortKahn(this.graph)
      return false
    } catch {
      return true
    }
  }
}

// 使用示例
const resolver = new DependencyResolver()
resolver.addModule('A', ['B', 'C'])
resolver.addModule('B', ['D'])
resolver.addModule('C', ['D'])
resolver.addModule('D', [])

console.log(resolver.getBuildOrder()) // ['D', 'B', 'C', 'A']
```

### 3. 路径规划

```javascript
// 地图导航
function findShortestPath(map, start, end) {
  const { distances, previous } = dijkstra(map, start)
  const path = getPath(previous, start, end)

  return {
    path,
    distance: distances.get(end),
  }
}
```

### 4. 网络流 (最大流)

Ford-Fulkerson 算法用于解决最大流问题,应用于:

- 网络带宽优化
- 任务分配
- 二分图匹配

## 性能对比

| 算法           | 时间复杂度     | 适用场景         |
| -------------- | -------------- | ---------------- |
| DFS/BFS        | O(V + E)       | 遍历、连通性     |
| Dijkstra       | O((V+E) log V) | 非负权最短路径   |
| Bellman-Ford   | O(V × E)       | 负权最短路径     |
| Floyd-Warshall | O(V³)          | 所有点对最短路径 |
| Prim           | O(E log V)     | 最小生成树       |
| Kruskal        | O(E log E)     | 最小生成树       |
| 拓扑排序       | O(V + E)       | DAG 排序         |

## 实践建议

1. **选择合适的表示**: 稀疏图用邻接表,稠密图用邻接矩阵
2. **理解算法限制**: Dijkstra 不支持负权,Bellman-Ford 慢但通用
3. **注意环检测**: 拓扑排序前先检测环
4. **利用标准库**: 许多语言提供图算法库
5. **考虑空间复杂度**: 大规模图要注意内存使用
6. **并行化**: BFS 可以并行处理每一层

## 下一步

- [哈希表与集合](./hash-structures) - 高效的键值存储
- [高级数据结构](./advanced-structures) - 并查集、跳表等
