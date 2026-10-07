---
title: 'Vue VNode 数据结构精讲'
tags: ['Vue']
---

# Vue VNode 数据结构精讲

> VNode（虚拟节点）是 Vue 渲染系统的核心数据结构。每一个模板标签、文本、组件实例，在 Vue 内部都是一个 VNode 对象。理解 VNode 的字段含义、创建时机和 Diff 流程，是深入理解 Vue 响应式更新、组件生命周期和性能优化的基础。

---

## 1. VNode 的本质

VNode 是一个普通 JS 对象，用声明式的方式描述真实 DOM 节点。Vue 的渲染流程：

```
模板/JSX → render() → VNode 树 → Patch 算法 → 真实 DOM
```

与 React Fiber 不同，Vue 的 VNode 是**不可变的纯描述对象**——每次更新都创建全新的 VNode 树，然后通过 Diff 算法找出差异，最后将差异应用到真实 DOM。

---

## 2. VNode 完整数据结构

```typescript
interface VNode {
  // ══════════ 节点身份 ══════════
  type: any,               // 节点类型：标签名('div') / 组件对象 / 文本 Symbol / Fragment Symbol
  props: VNodeProps | null, // HTML 属性 + 组件 props
  key: string | number | symbol | null,  // Diff 时的唯一标识
  ref: VNodeNormalizedRef | null,        // 模板 ref 引用

  // ══════════ 树结构 ══════════
  children: VNodeNormalizedChildren,     // 子节点（文本字符串 / VNode 数组 / 插槽对象）
  shapeFlag: number,     // 位标记：描述节点类型 + children 类型（用于 Patch 时快速判断处理策略）

  // ══════════ 组件实例关联 ══════════
  component: ComponentInternalInstance | null,  // 组件实例（仅组件 VNode 有值）
  suspense: Suspense | null,                    // Suspense 实例
  dirs: DirectiveBinding[] | null,              // 指令绑定信息（v-if / v-for / v-model 等）

  // ══════════ Patch 过程状态 ══════════
  el: Node | null,              // 挂载后指向的真实 DOM 节点
  anchor: Node | null,          // Fragment 的结束锚点
  target: Element | null,       // Teleport 的目标元素

  // ══════════ Diff 优化 ══════════
  patchFlag: number,   // 编译期静态分析标记（哪些 props/children 是动态的）
  dynamicProps: string[] | null,  // 动态 prop 名列表（编译期提取）
  dynamicChildren: VNode[] | null, // Block 模式下的动态子节点（跳过静态节点 Diff）

  // ══════════ 状态标记 ══════════
  // 以下均为位运算标记
  staticCount: number,       // 静态节点计数（用于 hoistStatic 优化）
  // 内部标记（非公开 API）
  _isStatic: boolean,        // 是否为静态节点
  isBlockNode: boolean,      // 是否为 Block 根节点
}
```

---

## 3. 关键字段深度解析

### 3.1 type — 节点类型

`type` 决定 Vue 如何处理这个 VNode：

| type 值 | 含义 | 处理方式 |
|---|---|---|
| `string`（如 `'div'`） | 原生 HTML 元素 | 创建/更新真实 DOM 元素 |
| `Component Object` | Vue 组件 | 创建组件实例，调用 setup/render |
| `Text`（Symbol） | 纯文本节点 | 创建/更新 Text 节点 |
| `Comment`（Symbol） | 注释节点 | 创建 Comment 节点 |
| `Fragment`（Symbol） | 片段（多根节点） | 不创建包裹 DOM，直接挂载 children |
| `Static`（Symbol） | 静态提升节点 | 只创建一次，后续复用（hoistStatic） |

### 3.2 shapeFlag — 位标记组合

`shapeFlag` 用二进制位同时描述**节点类型**和**children 类型**，避免运行时 `typeof` 判断：

```
节点类型位（低 4 位）：
  0b0001 = ELEMENT          (原生元素)
  0b0010 = FUNCTIONAL_COMPONENT  (函数组件)
  0b0100 = STATEFUL_COMPONENT    (有状态组件)
  0b1000 = TEXT_CHILDREN         (children 是纯文本)

children 类型位（高 4 位）：
  0b0001_0000 = TEXT_CHILDREN      (文本子节点)
  0b0010_0000 = ARRAY_CHILDREN     (VNode 数组子节点)
  0b0100_0000 = SLOTS_CHILDREN     (插槽子节点)
```

**示例**：一个 `<div>` 包含 VNode 数组子节点：
```
shapeFlag = ELEMENT | ARRAY_CHILDREN = 0b0001 | 0b0010_0000 = 17
```

Patch 时通过位运算 `shapeFlag & ARRAY_CHILDREN` 快速判断子节点处理策略，比 `Array.isArray(children)` 更高效。

### 3.3 patchFlag — 编译期优化标记

Vue 3 的模板编译器会分析模板，为每个 VNode 打上 `patchFlag`，告诉运行时哪些部分是动态的：

| patchFlag | 含义 |
|---|---|
| `TEXT` (1) | 节点文本内容是动态的 |
| `CLASS` (2) | class 绑定是动态的 |
| `STYLE` (4) | style 绑定是动态的 |
| `PROPS` (8) | 其他属性是动态的（需配合 dynamicProps） |
| `NEED_PATCH` (16) | 需要执行生命周期钩子或 ref |
| `FULL_PROPS` (32) | props 不固定，需要完整 Diff |
| `KEYED_FRAGMENT` (64) | 带 key 的列表（需要完整 Diff） |
| `UNKEYED_FRAGMENT` (128) | 不带 key 的列表 |
| `STABLE_FRAGMENT` (256) | 子节点顺序固定的片段 |
| `BAIL` (-1) | 跳过优化，走完整 Diff |

**编译优化效果**：

```html
<!-- 模板 -->
<div>
  <h1 :title="msg">Hello</h1>   <!-- patchFlag = TEXT -->
  <p class="static">固定文本</p>  <!-- patchFlag = 0（纯静态，跳过 Diff） -->
  <span :class="cls">动态</span>  <!-- patchFlag = CLASS -->
</div>
```

运行时只 Diff `h1` 的文本和 `span` 的 class，`<p>` 完全跳过。这就是 Vue 3 比 Vue 2 快的核心原因之一。

### 3.4 dynamicChildren — Block 树

Vue 3 引入 **Block** 概念：每个组件的 render 函数返回一个 Block（根 VNode），其 `dynamicChildren` 收集了所有后代中的动态节点（跳过静态节点和稳定结构）。

```
Block (div)
├── h1 (TEXT) → 收入 dynamicChildren
├── p (静态) → 跳过
└── div (v-if)
    ├── span (CLASS) → 收入 dynamicChildren
    └── img (静态) → 跳过

dynamicChildren = [h1_vnode, span_vnode]
```

Patch 时直接遍历 `dynamicChildren` 数组，**无需递归遍历整棵 VNode 树**。这就是"靶向更新"。

### 3.5 component — 组件实例引用

对于组件 VNode，`component` 指向其对应的组件内部实例：

```typescript
interface ComponentInternalInstance {
  type: Component,           // 组件定义对象（setup 函数或 options）
  parent: ComponentInternalInstance | null,  // 父组件实例
  appContext: AppContext,     // 应用上下文（全局配置、provide/inject 容器）
  vnode: VNode,              // 对应的 VNode（反向引用）
  subTree: VNode,            // 组件 render 返回的 VNode 树
  update: SchedulerJob,      // 组件的更新函数（effect 调度器）

  // 状态
  setupState: object,        // setup() 返回的响应式状态
  props: object,             // 当前 props
  attrs: object,             // 透传属性（未在 props 中声明的）
  slots: object,             // 插槽函数

  // 生命周期
  isMounted: boolean,        // 是否已挂载
  isUnmounted: boolean,      // 是否已卸载
}
```

**关键关系**：VNode.component.subTree 就是该组件渲染出的子 VNode 树。更新时，Vue 重新调用 render 得到新的 subTree，然后与旧 subTree 做 Diff。

---

## 4. VNode 的创建与更新流程

### 4.1 创建（Render 阶段）

```
用户触发 setState
  → 组件的 effect 重新执行
  → 调用 render() 生成新的 VNode 树
  → 与旧 VNode 树做 Patch（Diff + 应用变更）
```

### 4.2 Patch 流程

```javascript
function patch(n1, n2, container) {
  // n1 = 旧 VNode, n2 = 新 VNode
  if (n1.type !== n2.type) {
    // 类型不同 → 直接替换
    replace(n1, n2)
  } else {
    // 类型相同 → 精细化更新
    switch (n2.type) {
      case 'string': patchElement(n1, n2); break    // 原生元素
      case Text:      patchText(n1, n2); break       // 文本
      case Fragment:  patchFragment(n1, n2); break   // 片段
      default:        patchComponent(n1, n2); break  // 组件
    }
  }
}
```

### 4.3 元素 Diff（patchElement）

```javascript
function patchElement(n1, n2) {
  const el = n2.el = n1.el  // 复用真实 DOM

  // 1. 更新属性（利用 patchFlag 跳过静态属性）
  if (n2.patchFlag & CLASS) patchClass(el, n2.props.class)
  if (n2.patchFlag & STYLE) patchStyle(el, n1.props.style, n2.props.style)
  if (n2.patchFlag & TEXT)  patchText(el, n2.children)

  // 2. 更新子节点
  if (n2.dynamicChildren) {
    // Block 优化：只更新动态子节点
    patchBlockChildren(n1, n2)
  } else {
    // 完整 Diff
    patchChildren(n1.children, n2.children, el)
  }
}
```

---

## 5. 与 React Fiber 的核心差异

| 维度 | Vue VNode | React Fiber Node |
|---|---|---|
| **可变性** | 不可变描述对象，每次更新创建新的 | 可变对象，在双缓冲树之间复用和修改 |
| **树结构** | children 数组（树形递归） | child/sibling/return 链表（迭代遍历） |
| **中断能力** | 不可中断（同步递归 Diff） | 可中断（链表遍历可随时暂停） |
| **优化策略** | 编译期 patchFlag + Block 树（靶向更新） | 运行时 memo + flags（跳过未变子树） |
| **状态位置** | 状态在响应式系统中（ref/reactive），VNode 只是描述 | 状态在 Fiber 节点上（memoizedState） |
| **组件实例** | VNode.component 指向实例 | Fiber 节点本身承载状态，无独立实例对象 |

---

## 6. 实践意义

理解 VNode 数据结构，能直接解释以下 Vue 常见问题：

- **为什么 key 很重要？** → Diff 时通过 key 判断 VNode 是否可复用，无 key 则走"就地复用"策略，可能导致状态错乱
- **为什么 v-if/v-for 不建议同时用？** → v-for 生成的 VNode 数组与 v-if 的条件渲染混合时，patchFlag 和 shapeFlag 的组合会导致不必要的完整 Diff
- **为什么静态内容不触发更新？** → patchFlag = 0 的 VNode 在 Patch 时被完全跳过
- **为什么 Fragment 会影响 DOM 结构？** → Fragment VNode 不创建包裹 DOM，其 children 直接挂载到父容器
- **为什么 Teleport 能移动 DOM？** → Teleport VNode 的 target 字段指向目标容器，Patch 时将 el 移动到目标位置
