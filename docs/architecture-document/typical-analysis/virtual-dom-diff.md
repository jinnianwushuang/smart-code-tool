# 虚拟 DOM Diff 算法典型拆解

> 本文档从虚拟 DOM 的本质出发，逐步拆解 Diff 算法的核心策略，
> 涵盖同层比较、双端 Diff、key 的作用等 Vue/React 框架面试核心考点。

---

## 一、虚拟 DOM 是什么

```javascript
// 真实 DOM
// <div class="container"><p>Hello</p></div>

// 虚拟 DOM（用 JS 对象描述 DOM 结构）
const vnode = {
  tag: 'div',
  props: { className: 'container' },
  children: [
    { tag: 'p', props: {}, children: ['Hello'] },
  ],
}
```

| 对比 | 真实 DOM | 虚拟 DOM |
|---|---|---|
| 本质 | 浏览器渲染树节点 | 普通 JS 对象 |
| 创建成本 | 高（涉及浏览器引擎） | 低（只是对象字面量） |
| 操作成本 | 高（触发重排重绘） | 低（内存中计算） |
| 核心价值 | — | 用最小代价把差异应用到真实 DOM |

---

## 二、Diff 核心策略 — 同层比较

> 完整树对比复杂度 O(n³)，实际框架采用**同层比较**策略，复杂度降为 O(n)。

**规则：只比较同一层级的节点，不跨层级移动。**

```
旧树                    新树
  A                       A
  ├── B                   ├── B（变了）
  │   └── D               │   └── E  ← 跨层了，不检测
  └── C                   └── C
```

如果 B 的子节点从 D 变成 E，同层 Diff 不会发现 D→E 的移动，而是直接**替换 B 的整个子树**。

---

## 三、简单 Diff 算法实现

### 3.1 两个节点比较

```javascript
function diff(oldVNode, newVNode) {
  // 1. 标签不同 → 直接替换
  if (oldVNode.tag !== newVNode.tag) {
    return { type: 'REPLACE', vnode: newVNode }
  }

  // 2. 标签相同 → 比较属性 + 递归比较子节点
  const propsPatch = diffProps(oldVNode.props, newVNode.props)
  const childrenPatch = diffChildren(oldVNode.children, newVNode.children)

  return {
    type: 'UPDATE',
    props: propsPatch,
    children: childrenPatch,
  }
}
```

### 3.2 子节点列表 Diff（无 key 版）

```javascript
function diffChildren(oldChildren, newChildren) {
  const patches = []
  const maxLen = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < maxLen; i++) {
    if (i >= oldChildren.length) {
      patches.push({ type: 'INSERT', index: i, vnode: newChildren[i] })
    } else if (i >= newChildren.length) {
      patches.push({ type: 'REMOVE', index: i })
    } else {
      patches.push(diff(oldChildren[i], newChildren[i]))
    }
  }
  return patches
}
```

**问题**：无 key 时，列表头部插入一个元素会导致**后面所有节点都被更新**。

```
旧: [A, B, C]
新: [X, A, B, C]

无 key Diff:
  位置 0: A vs X → 替换 ❌（本应插入）
  位置 1: B vs A → 替换 ❌
  位置 2: C vs B → 替换 ❌
  位置 3: 新增 C  → 插入 ❌
```

---

## 四、双端 Diff — Vue 2 的核心算法

> 维护四个指针，从新旧列表的两端向中间逼近。

```javascript
function vue2Diff(oldChildren, newChildren) {
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    const oldStart = oldChildren[oldStartIdx]
    const oldEnd = oldChildren[oldEndIdx]
    const newStart = newChildren[newStartIdx]
    const newEnd = newChildren[newEndIdx]

    if (isSameVNode(oldStart, newStart)) {
      // ① 旧前 vs 新前 → 相同，两个前指针后移
      patch(oldStart, newStart)
      oldStartIdx++
      newStartIdx++
    } else if (isSameVNode(oldEnd, newEnd)) {
      // ② 旧后 vs 新后 → 相同，两个后指针前移
      patch(oldEnd, newEnd)
      oldEndIdx--
      newEndIdx--
    } else if (isSameVNode(oldStart, newEnd)) {
      // ③ 旧前 vs 新后 → 相同，旧前移到末尾
      patch(oldStart, newEnd)
      moveAfter(oldStart, oldEnd)
      oldStartIdx++
      newEndIdx--
    } else if (isSameVNode(oldEnd, newStart)) {
      // ④ 旧后 vs 新前 → 相同，旧后移到开头
      patch(oldEnd, newStart)
      moveBefore(oldEnd, oldStart)
      oldEndIdx--
      newStartIdx++
    } else {
      // ⑤ 四种都没匹配 → 遍历旧列表查找
      const idxInOld = findIndex(oldChildren, newStart, oldStartIdx, oldEndIdx)
      if (idxInOld !== -1) {
        patch(oldChildren[idxInOld], newStart)
        moveBefore(oldChildren[idxInOld], oldStart)
        oldChildren[idxInOld] = undefined // 标记已处理
      } else {
        insert(newStart) // 全新节点，插入
      }
      newStartIdx++
    }
  }

  // 处理剩余
  if (oldStartIdx > oldEndIdx) {
    // 旧列表先遍历完 → 新列表剩余都是新增
    for (let i = newStartIdx; i <= newEndIdx; i++) insert(newChildren[i])
  } else {
    // 新列表先遍历完 → 旧列表剩余都是删除
    for (let i = oldStartIdx; i <= oldEndIdx; i++) remove(oldChildren[i])
  }
}
```

**双端 Diff 执行过程图解：**

```
旧列表:  [A, B, C, D]         新列表:  [D, B, A, C]
          ↑        ↑                    ↑        ↑
        oldStart oldEnd             newStart  newEnd

第 1 轮: oldStart=A, newStart=D → 不匹配
         oldEnd=D, newEnd=C → 不匹配
         oldStart=A, newEnd=C → 不匹配
         oldEnd=D, newStart=D → ✅ 匹配！D 移到开头
         → [D, A, B, C]  oldEnd--, newStart++

第 2 轮: oldStart=A, newStart=B → 不匹配
         oldEnd=C, newEnd=C → ✅ 匹配！不动
         → oldEnd--, newEnd--

第 3 轮: oldStart=A, newStart=B → 不匹配
         oldStart=A, newEnd=B → ✅ 匹配！A 移到 B 前面
         → [D, A, B, C]  oldStart++, newEnd--

第 4 轮: oldStart=B, newStart=B → ✅ 匹配！
         → oldStart++, newStart++

结束 ✅ 只需移动 D，其他位置不变
```

---

## 五、React 16+ 的 Diff — 带 key 的同层 Diff

```javascript
// React 使用 key 建立新旧节点映射
function reactDiff(oldChildren, newChildren) {
  // 1. 用 key 建立旧节点的 Map
  const oldKeyMap = new Map()
  oldChildren.forEach((child, i) => {
    if (child.key != null) oldKeyMap.set(child.key, { vnode: child, index: i })
  })

  // 2. 遍历新列表，从 Map 中查找可复用节点
  let lastIndex = 0 // 记录已复用的最大索引
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    const mapped = oldKeyMap.get(newChild.key)

    if (mapped) {
      // 可复用
      patch(mapped.vnode, newChild)
      oldKeyMap.delete(newChild.key)
      // 如果旧索引 < lastIndex，说明需要移动
      if (mapped.index < lastIndex) {
        move(newChild, i) // 需要 DOM 移动
      } else {
        lastIndex = mapped.index // 更新最大索引
      }
    } else {
      insert(newChild, i) // 新节点，插入
    }
  }

  // 3. Map 中剩余的都是要删除的
  oldKeyMap.forEach(({ vnode }) => remove(vnode))
}
```

**React Diff 核心规则：**

| 规则 | 说明 |
|---|---|
| 同层比较 | 不跨层级移动节点 |
| key 映射 | 通过 key 建立 O(1) 查找 |
| `lastIndex` 判断 | 旧索引 < lastIndex → 需要移动；否则位置已正确 |
| 只向右移动 | 不会对节点做左移操作（性能优化） |

---

## 六、key 的作用 — 为什么不能用 index

### 6.1 用 index 作为 key

```
旧: [{id:1, name:'A'}, {id:2, name:'B'}, {id:3, name:'C'}]
新: [{id:2, name:'B'}, {id:1, name:'A'}, {id:3, name:'C'}]  ← 头部插入 B

index key Diff:
  位置 0: A vs B → 更新属性（name 从 A→B）❌ 错误更新
  位置 1: B vs A → 更新属性（name 从 B→A）❌ 错误更新
  位置 2: C vs C → 不变 ✅
```

### 6.2 用唯一 id 作为 key

```
id key Diff:
  key=2: 旧位置 1 → 新位置 0 → 移动 ✅
  key=1: 旧位置 0 → 新位置 1 → 移动 ✅
  key=3: 旧位置 2 → 新位置 2 → 不动 ✅
```

| 对比 | index key | 唯一 id key |
|---|---|---|
| 头部插入 | 后面所有节点错误更新 | 只移动受影响的节点 |
| 删除中间项 | 后面所有节点错误更新 | 只删除目标节点 |
| 排序操作 | 全部重新渲染 | 只移动 DOM 位置 |

---

## 七、总结：Diff 算法知识图谱

```
虚拟 DOM Diff
├── 核心策略
│   ├── 同层比较         → O(n) 复杂度
│   └── 不跨层移动       → 简化算法
│
├── Vue 2 双端 Diff
│   ├── 四指针：oldStart/oldEnd/newStart/newEnd
│   ├── 四种快速匹配 + 一种遍历兜底
│   └── 剩余处理：新增 or 删除
│
├── React Diff
│   ├── key Map 建立 O(1) 映射
│   ├── lastIndex 判断是否需要移动
│   └── 只向右移动策略
│
└── key 的作用
    ├── 唯一 id → 精确复用，最小化 DOM 操作
    └── index   → 列表变动时导致错误更新
```
