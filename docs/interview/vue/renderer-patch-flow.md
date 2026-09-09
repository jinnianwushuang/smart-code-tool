---
title: "渲染器 Patch 流程与 Diff 算法 [P6-P7]"
level: "senior"
tags: ["Vue", "渲染器", "diff", "调度更新"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 渲染器 Patch 流程与 Diff 算法 [P6-P7]

> 渲染器是 Vue 的核心引擎，负责将虚拟 DOM 转化为真实 DOM 并高效更新。理解 patch 流程和 diff 算法，是掌握 Vue 性能优化和排查渲染问题的基础。

## 核心概念（What）

### 渲染器职责

```
虚拟 DOM（VNode 树）
       │
       ▼
┌─────────────────────────────────────┐
│           渲染器（Renderer）          │
│                                      │
│  mount()     → 首次渲染到 DOM         │
│  patch()     → 对比新旧 VNode 并更新   │
│  unmount()   → 从 DOM 移除并清理      │
│                                      │
│  核心算法：                           │
│  - patchElement   → 元素节点对比      │
│  - patchChildren  → 子节点对比（Diff） │
│  - patchComponent → 组件对比          │
└─────────────────────────────────────┘
       │
       ▼
真实 DOM
```

---

## 底层原理（Why）

### 1. Patch 总流程

```javascript
// patch 函数的核心逻辑（简化版）
const patch = (n1, n2, container, anchor = null) => {
  // n1 是旧 VNode，n2 是新 VNode
  // 如果类型不同，直接替换
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1)
    n1 = null
  }

  if (n1 === null) {
    // 新节点：执行挂载
    mount(n2, container, anchor)
  } else {
    // 同类型节点：执行更新
    patchElement(n1, n2, container, anchor)
  }
}

function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
```

### 2. 元素节点 Patch（patchElement）

```javascript
const patchElement = (n1, n2, container, anchor) => {
  const el = (n2.el = n1.el) // 复用 DOM 元素

  const oldProps = n1.props
  const newProps = n2.props || {}

  // 1. 补丁标记优化（Vue 3 特有）
  if (n2.patchFlag > 0) {
    // 有标记：只更新标记的部分
    if (n2.patchFlag & PatchFlags.TEXT) {
      // 只更新文本
      if (n2.children !== n1.children) {
        hostSetElementText(el, n2.children)
      }
      return // 不需要处理其他内容
    }

    if (n2.patchFlag & PatchFlags.CLASS) {
      // 只更新 class
      if (newProps.class !== oldProps.class) {
        hostPatchAttr(el, 'class', newProps.class)
      }
    }

    if (n2.patchFlag & PatchFlags.STYLE) {
      // 只更新 style
      hostPatchStyle(el, oldProps.style, newProps.style)
    }

    if (n2.patchFlag & PatchFlags.PROPS) {
      // 只更新指定的 props
      if (n2.dynamicProps) {
        for (const key of n2.dynamicProps) {
          hostPatchProp(el, key, oldProps[key], newProps[key])
        }
      }
    }
  } else {
    // 无标记（全量对比）
    patchProps(el, oldProps, newProps)
  }

  // 2. 处理子节点
  patchChildren(n1, n2, el, null)
}
```

### 3. Diff 算法（patchChildren）

```javascript
const patchChildren = (n1, n2, container, anchor) => {
  const c1 = n1.children  // 旧子节点
  const c2 = n2.children  // 新子节点

  // 三种情况
  const isOldArray = Array.isArray(c1)
  const isNewArray = Array.isArray(c2)

  if (!isNewArray) {
    if (isOldArray) {
      // 旧：数组 → 新：文本/null → 卸载旧子节点
      unmountChildren(c1)
    }
    if (c1 !== c2) {
      hostSetElementText(container, c2)
    }
  } else {
    if (isOldArray) {
      // 旧：数组 → 新：数组 → 执行核心 Diff 算法
      patchKeyedChildren(c1, c2, container, anchor)
    } else {
      // 旧：文本/null → 新：数组 → 清空并挂载新子节点
      if (isOldArray) hostSetElementText(container, '')
      mountChildren(c2, container, anchor)
    }
  }
}
```

### 4. 核心 Diff：Keyed Children 对比

```javascript
// Vue 3 的 Keyed Diff 算法（简化版）
function patchKeyedChildren(c1, c2, container, parentAnchor) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1 // 旧数组末尾
  let e2 = l2 - 1         // 新数组末尾

  // 1. 从前往后对比相同节点
  // (a b) c
  // (a b) d e
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    i++
  }

  // 2. 从后往前对比相同节点
  //   a (b c)
  // d e (b c)
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    e1--
    e2--
  }

  // 3. 处理剩余节点
  if (i > e1) {
    // 旧节点已处理完，新节点有剩余 → 挂载新节点
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        patch(null, c2[i], container, anchor)
        i++
      }
    }
  } else if (i > e2) {
    // 新节点已处理完，旧节点有剩余 → 卸载旧节点
    while (i <= e1) {
      unmount(c1[i])
      i++
    }
  } else {
    // 4. 中间部分：使用最长递增子序列优化
    const s1 = i // 旧数组剩余起始
    const s2 = i // 新数组剩余起始

    // 建立新节点 key → index 映射
    const keyToNewIndexMap = new Map()
    for (i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }

    // 遍历旧节点，决定移动/删除/新增
    let patched = 0
    const toBePatched = e2 - s2 + 1
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
    let moved = false
    let maxNewIndexSoFar = 0

    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i]
      const newIndex = keyToNewIndexMap.get(prevChild.key)

      if (newIndex === undefined) {
        // 旧节点在新列表中不存在 → 删除
        unmount(prevChild)
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true // 需要移动
        }
        patch(prevChild, c2[newIndex], container)
        patched++
      }
    }

    // 5. 使用最长递增子序列确定最小移动
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []
    let j = increasingNewIndexSequence.length - 1

    // 从后往前遍历，插入/移动节点
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex]
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor

      if (newIndexToOldIndexMap[i] === 0) {
        // 新节点 → 挂载
        patch(null, nextChild, container, anchor)
      } else if (moved) {
        // 需要移动
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          move(nextChild, container, anchor)
        } else {
          j--
        }
      }
    }
  }
}
```

### 5. 最长递增子序列（LIS）

```javascript
// 最长递增子序列算法
// 用于确定哪些节点不需要移动（保持相对顺序）
function getSequence(arr) {
  const p = arr.slice() // 记录前驱节点
  const result = [0]    // 结果序列
  let i, j, u, v, c

  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI === 0) continue // 跳过新增节点

    j = result[result.length - 1]
    if (arr[j] < arrI) {
      p[i] = j
      result.push(i)
      continue
    }

    // 二分查找替换位置
    u = 0
    v = result.length - 1
    while (u < v) {
      c = (u + v) >> 1
      if (arr[result[c]] < arrI) {
        u = c + 1
      } else {
        v = c
      }
    }

    if (arrI < arr[result[u]]) {
      if (u > 0) {
        p[i] = result[u - 1]
      }
      result[u] = i
    }
  }

  // 回溯构建序列
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}

// 示例：
// 旧：[1, 2, 3, 4, 5]
// 新：[1, 3, 2, 5, 4]
// newIndexToOldIndexMap: [0, 2, 1, 4, 3]（0 表示新增）
// LIS: [1, 3]（索引 1 和 3 位置的节点不需要移动）
// 需要移动的：索引 2 和 4
```

### 6. 组件 Patch（patchComponent）

```javascript
const patchComponent = (n1, n2, container, anchor) => {
  const instance = (n2.component = n1.component)

  // 1. 检查 props 是否变化
  if (shouldUpdateComponent(n1, n2)) {
    // 2. 更新组件实例的 props
    instance.next = n2
    // 3. 触发组件更新
    instance.update()
  } else {
    // props 未变化，复用 DOM
    n2.el = n1.el
    instance.vnode = n2
  }
}

// shouldUpdateComponent 的优化
function shouldUpdateComponent(prevVNode, nextVNode) {
  // 1. 如果有 patchFlag，快速判断
  if (nextVNode.patchFlag > 0) {
    // 根据标记判断需要对比哪些 props
    return true
  }

  // 2. 全量对比 props
  const prevProps = prevVNode.props || {}
  const nextProps = nextVNode.props || {}

  for (const key in nextProps) {
    if (prevProps[key] !== nextProps[key]) return true
  }

  // 3. 检查是否有被删除的 props
  for (const key in prevProps) {
    if (!(key in nextProps)) return true
  }

  return false
}
```

---

## 实战应用（How）

### Diff 算法性能优化

```vue
<!-- 1. 始终使用 key -->
<template>
  <!-- 错误：无 key，Vue 只能按位置对比 -->
  <div v-for="item in list">{{ item.name }}</div>

  <!-- 正确：有 key，Vue 可以精确追踪节点移动 -->
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>
</template>

<!-- 2. 避免不必要的列表重排 -->
<script setup>
// 错误：每次排序都触发大量 DOM 移动
const sortedList = computed(() =>
  [...list.value].sort((a, b) => a.name.localeCompare(b.name))
)

// 优化：使用稳定排序 + 虚拟滚动
// 或者在数据层面保持顺序，只更新变化的项
</script>

<!-- 3. 使用 v-once 标记完全静态的内容 -->
<template>
  <div v-once class="static-content">
    <!-- 这段内容永远不会变化，只渲染一次 -->
    <h1>关于我们</h1>
    <p>公司简介...</p>
  </div>
</template>
```

---

## 高频面试题

### Q1: Vue 3 的 Diff 算法是如何工作的？

**参考答案要点**：
- 先对比头尾相同的节点（双端对比），缩小未对比范围
- 对中间剩余部分，建立 key → index 映射表
- 遍历旧节点，决定 patch/删除/新增
- 使用最长递增子序列（LIS）确定最小移动量
- LIS 中的节点不需要移动，其余节点通过 insertBefore 调整位置

### Q2: 为什么 v-for 中必须使用 key？

**参考答案要点**：
- 没有 key 时，Vue 只能按索引位置对比（in-place patch）
- 有 key 时，Vue 可以精确追踪每个节点的身份
- key 使得节点可以在列表中移动、插入、删除而不丢失状态
- 没有 key 的列表重排会导致组件状态错乱和不必要的 DOM 操作

### Q3: Vue 3 的 Diff 相比 Vue 2 有什么改进？

**参考答案要点**：
- Vue 3 使用补丁标记，可以跳过静态节点的 diff
- Vue 3 的 Block Tree 将树形结构扁平化，减少遍历开销
- Vue 3 的 LIS 算法确保最小 DOM 移动量
- Vue 3 对 Fragment 的处理更完善（支持多根节点）
- Vue 3 的组件更新通过 shouldUpdateComponent 优化

---

## 延伸思考

1. **设计题**：如果列表有 10000 项且频繁插入/删除，如何设计一个高效的 Diff 策略？
2. **场景题**：一个拖拽排序列表在拖拽过程中出现闪烁，如何排查和修复？
3. **对比题**：Vue 的 Diff 算法 vs React 的 Reconciliation vs Inferno 的 Diff，各自的策略差异？

---

## 参考资料

- [Vue 3 源码 - @vue/runtime-core renderer](https://github.com/vuejs/core/tree/main/packages/runtime-core/src/renderer.ts)
- [Vue 3 渲染机制](https://vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue 3 列表渲染优化](https://vuejs.org/guide/best-practices/performance.html#virtualize-large-lists)
