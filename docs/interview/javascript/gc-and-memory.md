---
title: 'GC 算法与内存管理 [P6-P7]'
level: 'senior'
tags: ['JavaScript', 'GC', '内存泄漏', 'WeakRef']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# GC 算法与内存管理 [P6-P7]

> 前端工程师通常不需要手动管理内存，但理解 GC 的工作原理对于排查内存泄漏、优化性能至关重要。高级面试中，内存管理是区分 P6 和 P7 的关键考点。

## 核心概念（What）

### JavaScript 内存生命周期

```
分配（Allocation）→ 使用（Usage）→ 回收（Reclamation）
     ↑                                    │
     └────────────────────────────────────┘
                    自动回收（GC）
```

### 为什么前端需要关注 GC？

1. **SPA 应用**：长时间运行，内存持续增长导致卡顿
2. **大数据可视化**：大量对象创建导致频繁 GC
3. **移动端 WebView**：内存限制严格，容易被系统杀死
4. **Node.js 服务**：内存泄漏导致 OOM 崩溃

---

## 底层原理（Why）

### 1. V8 分代 GC 策略

#### 新生代（New Space）—— Scavenge 算法

```
New Space（默认 32MB，64 位系统）
┌────────────────┬────────────────┐
│   From Space   │    To Space    │
│   （活动对象）  │  （复制目标）   │
│                │                │
│  ┌────┐        │                │
│  │ A  │ ──────────────────→ ┌──┐│
│  └────┘        │             │A ││
│  ┌────┐        │             └──┘│
│  │ B  │ ────── 被回收           │
│  └────┘        │                │
│  ┌────┐        │             ┌──┐│
│  │ C  │ ──────────────────→ │C ││
│  └────┘        │             └──┘│
└────────────────┴────────────────┘

过程：
1. 新对象分配到 From Space
2. From Space 满时，触发 Scavenge GC
3. 遍历 From Space 中的存活对象
4. 将存活对象复制到 To Space
5. 交换 From 和 To 的角色
6. 释放原 From Space
```

**晋升条件**：对象在新生代存活超过 2 次 GC → 晋升到老年代

#### 老年代（Old Space）—— Mark-Sweep-Compact

```
Mark 阶段：从根对象出发，标记所有可达对象
  ┌─────────────────────────────────────┐
  │  Root → A → B     (标记 A, B)       │
  │  Root → C         (标记 C)          │
  │  D, E 不可达      (标记为垃圾)       │
  └─────────────────────────────────────┘

Sweep 阶段：清除未标记的对象
  ┌─────────────────────────────────────┐
  │  [A] [  ] [B] [  ] [C] [  ]        │
  │        ↑        ↑        ↑          │
  │       空洞     空洞     空洞         │
  └─────────────────────────────────────┘

Compact 阶段：移动存活对象，消除碎片
  ┌─────────────────────────────────────┐
  │  [A] [B] [C] [    空闲区域    ]     │
  └─────────────────────────────────────┘
```

### 2. Orinoco GC 的并发策略（2026 现状）

| 阶段            | 是否并发 | 说明                               |
| --------------- | -------- | ---------------------------------- |
| 标记（Mark）    | 并发     | 与 JS 执行并行，使用写屏障记录变更 |
| 清理（Sweep）   | 并发     | 非移动对象的清理可并发             |
| 压缩（Compact） | 非并发   | 需要移动对象，必须暂停 JS          |
| 新生代 Scavenge | 并行     | 多线程复制，但需要暂停 JS          |

**并发标记的写屏障（Write Barrier）**：

```javascript
// 并发标记期间，JS 代码可能修改对象引用
// 写屏障确保 GC 能感知到这些修改

// 伪代码：V8 在每次属性赋值时插入写屏障
obj.prop = newValue
// 底层：
// 1. 执行赋值
// 2. 如果 GC 正在标记，记录 (obj, newValue) 到 remembered set
// 3. GC 标记结束后，处理 remembered set 中的额外引用
```

### 3. 内存泄漏的常见模式

```javascript
// 模式 1：意外的全局变量
function process() {
  data = new Array(1000000) // 忘记 var/let/const → 全局变量
}

// 模式 2：未清理的定时器
const interval = setInterval(() => {
  updateUI() // 即使组件已销毁，定时器仍在运行
}, 1000)

// 模式 3：闭包持有大对象
function createProcessor() {
  const hugeDataset = loadHugeDataset() // 100MB
  return function process(item) {
    return hugeDataset.find((d) => d.id === item.id) // 只用了 find 方法
    // 但整个 hugeDataset 都被闭包持有
  }
}

// 模式 4：分离的 DOM 引用
function createWidget() {
  const el = document.createElement('div')
  el.innerHTML = '<span>Complex widget with lots of content</span>'
  document.body.appendChild(el)
  widgetCache.set('main', el)
  return el
}

function destroyWidget() {
  const el = widgetCache.get('main')
  document.body.removeChild(el) // DOM 已移除
  // 但 widgetCache 仍持有引用 → 内存泄漏
  widgetCache.delete('main') // 需要手动清理
}

// 模式 5：事件监听器未移除
class Component {
  mount() {
    window.addEventListener('resize', this.handleResize)
  }
  // 忘记在 unmount 中移除监听器
  // unmount() {
  //   window.removeEventListener('resize', this.handleResize);
  // }
}

// 模式 6：Map/Set 作为缓存但未设置上限
const cache = new Map() // 无限增长
function getCached(key) {
  if (!cache.has(key)) {
    cache.set(key, computeExpensive(key))
  }
  return cache.get(key)
}
```

### 4. WeakRef 和 FinalizationRegistry

```javascript
// WeakRef：创建对象的弱引用（不阻止 GC 回收）
const weakRef = new WeakRef(expensiveObject)

// 使用时需要检查是否已被回收
const obj = weakRef.deref()
if (obj) {
  obj.doSomething()
} else {
  // 对象已被 GC 回收
}

// FinalizationRegistry：对象被 GC 时执行回调
const registry = new FinalizationRegistry((key) => {
  console.log(`Object with key ${key} was garbage collected`)
  // 适合清理外部资源（如 C++ 侧的内存）
})

// 注册弱引用和清理回调
registry.register(expensiveObject, cleanupData, 'my-object-key')

// 实际应用：实现带自动清理的缓存
class AutoCleanupCache {
  constructor() {
    this._cache = new Map()
    this._registry = new FinalizationRegistry((key) => {
      this._cache.delete(key)
    })
  }

  set(key, value) {
    this._cache.set(key, value)
    this._registry.register(value, key, key)
  }

  get(key) {
    return this._cache.get(key)
  }
}
```

### 5. 内存分析工具

```
Chrome DevTools Memory 面板：
├── Heap Snapshot     → 堆快照，查看对象分布和引用链
├── Allocation Timeline → 内存分配时间线，定位分配热点
├── Allocation Instrumentation → 逐次分配跟踪
└── Detached Elements → 分离的 DOM 元素检测

Node.js 内存分析：
├── --inspect → Chrome DevTools 远程调试
├── process.memoryUsage() → 查看内存使用量
├── v8.getHeapStatistics() → V8 堆统计
└── clinic.js / 0x → 自动化性能分析
```

```javascript
// Node.js 内存监控
function logMemory() {
  const usage = process.memoryUsage()
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`, // 常驻集大小
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`, // V8 堆总量
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`, // V8 堆已用
    external: `${Math.round(usage.external / 1024 / 1024)}MB`, // C++ 对象
    arrayBuffers: `${Math.round(usage.arrayBuffers / 1024 / 1024)}MB`, // ArrayBuffer
  })
}

// 设置 --max-old-space-size 限制堆大小
// node --max-old-space-size=4096 app.js
```

---

## 实战应用（How）

### 内存泄漏排查流程

```
1. 复现问题：观察内存使用量是否持续增长不回落
2. 获取堆快照：操作前拍一次，操作后拍一次
3. 对比分析：Comparison 视图找到增长最多的对象类型
4. 追溯引用链：Retainers 面板查看谁在持有这些对象
5. 定位代码：找到创建这些对象的代码位置
6. 修复验证：修复后重新测试，确认内存不再增长
```

### 前端内存优化策略

```javascript
// 1. 对象池（Object Pool）模式
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this._factory = factory
    this._reset = reset
    this._pool = []
    for (let i = 0; i < initialSize; i++) {
      this._pool.push(factory())
    }
  }

  acquire() {
    return this._pool.length > 0 ? this._pool.pop() : this._factory()
  }

  release(obj) {
    this._reset(obj)
    this._pool.push(obj)
  }
}

// 使用：复用 Vector 对象，避免频繁创建
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (v) => {
    v.x = 0
    v.y = 0
  },
)

const vec = vectorPool.acquire()
vec.x = 10
vec.y = 20
useVector(vec)
vectorPool.release(vec) // 归还到池中

// 2. 使用 TypedArray 替代普通数组（大量数值数据）
// 普通数组：每个元素是 V8 对象，占用大量内存
const normalArray = new Array(1000000).fill(0) // ~8MB + 对象开销

// TypedArray：连续的内存块，无对象开销
const typedArray = new Float64Array(1000000) // 精确 8MB
```

---

## 高频面试题

### Q1: JavaScript 的垃圾回收机制是什么？

**参考答案要点**：

- V8 采用分代回收：新生代（Scavenge）+ 老年代（Mark-Sweep-Compact）
- 新生代使用复制算法，对象存活 2 次 GC 后晋升到老年代
- 老年代使用标记-清除-压缩算法
- Orinoco GC 支持并发标记和清理，减少主线程停顿
- GC 触发条件：新生代空间不足、老年代空间不足、显式调用 `gc()`

### Q2: 如何排查和解决前端内存泄漏？

**参考答案要点**：

- 常见泄漏模式：未清理的定时器/事件监听、闭包持有大对象、分离的 DOM 引用、无限增长的缓存
- 排查工具：Chrome DevTools Memory 面板（Heap Snapshot + Comparison）
- 排查流程：复现 → 快照对比 → 找到增长对象 → 追溯引用链 → 定位代码 → 修复验证
- 预防措施：组件卸载时清理副作用、使用 WeakMap/WeakSet 代替 Map/Set 做缓存

### Q3: WeakRef 和 WeakMap 的区别和使用场景？

**参考答案要点**：

- `WeakMap`：键为弱引用，键对象被 GC 时自动删除条目
- `WeakRef`：对任意对象的弱引用，不阻止 GC
- `FinalizationRegistry`：对象被 GC 时执行回调
- 使用场景：缓存（WeakMap）、DOM 节点关联数据（WeakMap）、大对象生命周期追踪（WeakRef + FinalizationRegistry）

---

## 延伸思考

1. **设计题**：设计一个前端内存监控 SDK，如何在不影响性能的情况下采集内存指标？
2. **场景题**：一个 WebGL 应用在运行 30 分钟后崩溃，如何排查？
3. **对比题**：V8 的 Orinoco GC vs JavaScriptCore 的 GC vs SpiderMonkey 的 GC，各自的策略差异？

---

## 参考资料

- [V8 Blog - Orinoco GC](https://v8.dev/blog/trash-talk)
- [Chrome DevTools - Memory 面板](https://developer.chrome.com/docs/devtools/memory/)
- [MDN - WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef)
- [Node.js 内存调试](https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot)
