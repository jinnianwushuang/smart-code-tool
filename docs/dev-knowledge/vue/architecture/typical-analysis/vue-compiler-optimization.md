---
title: 'Vue 3 编译器优化原理'
tags: ['Vue', '编译器', '静态提升', 'Block Tree', '底层原理']
---

# Vue 3 编译器优化原理

> 本文从 Vue 3 模板编译流程出发，深入拆解编译器层面的六大优化策略：静态提升（hoistStatic）、预字符串化（preStringify）、事件缓存、PatchFlag 标记、Block Tree 靶向更新、内联静态元素，以及与 Vue 2 / React 的根本差异。

---

## 一、Vue 3 编译流程全景

### 1.1 三阶段编译管线

```
模板编译三阶段：

┌──────────────────────────────────────────────────────────┐
│  模板 (Template)                                          │
│  <div class="container">                                  │
│    <h1>{{ title }}</h1>                                   │
│    <p>静态文本</p>                                         │
│    <button @click="handleClick">按钮</button>             │
│  </div>                                                   │
└────────────────────────┬─────────────────────────────────┘
                         │ ① parse（词法/语法分析）
                         ▼
┌──────────────────────────────────────────────────────────┐
│  AST（抽象语法树）                                        │
│  {                                                        │
│    type: 1,            // 元素节点                        │
│    tag: 'div',                                            │
│    props: [{ name: 'class', value: 'container' }],       │
│    children: [                                            │
│      { type: 1, tag: 'h1', children: [{ type: 5, content: { content: 'title' } }] }, │
│      { type: 1, tag: 'p', children: [{ type: 2, content: '静态文本' }] },             │
│      { type: 1, tag: 'button', props: [{ name: 'onClick', ... }] },                  │
│    ]                                                      │
│  }                                                        │
└────────────────────────┬─────────────────────────────────┘
                         │ ② transform（语义分析 + 优化）
                         ▼
┌──────────────────────────────────────────────────────────┐
│  优化后的 AST                                             │
│  • 标记静态节点（PatchFlag = HOISTED）                    │
│  • 标记动态节点（PatchFlag = TEXT / PROPS）               │
│  • 构建 Block Tree（标记 Block 根节点）                   │
│  • 静态提升（hoistStatic）                                │
│  • 预字符串化（preStringify）                             │
└────────────────────────┬─────────────────────────────────┘
                         │ ③ generate（代码生成）
                         ▼
┌──────────────────────────────────────────────────────────┐
│  渲染函数 (Render Function)                               │
│  import { createElementVNode as _createElementVNode,     │
│           toDisplayString as _toDisplayString,            │
│           createTextVNode as _createTextVNode,            │
│           Fragment as _Fragment } from "vue"              │
│                                                          │
│  const _hoisted_1 = _createTextVNode("静态文本")          │
│  const _hoisted_2 = { class: "container" }               │
│                                                          │
│  export function render(_ctx, ...) {                      │
│    return (_openBlock(),                                  │
│      _createElementBlock("div", _hoisted_2, [            │
│        _createElementVNode("h1", null,                    │
│          _toDisplayString(_ctx.title), 1 /* TEXT */),     │
│        _hoisted_1,                                        │
│        _createElementVNode("button", {                    │
│          onClick: _ctx.handleClick                        │
│        }, "按钮")                                         │
│      ]))                                                  │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
```

### 1.2 编译器优化介入的时机

```
编译器的核心任务：在编译阶段尽可能多地分析模板特征，
将运行时的工作提前到编译时完成。

Vue 3 编译器优化策略：
├── ① 静态提升（hoistStatic）→ 将静态节点提升到渲染函数外
├── ② 预字符串化（preStringify）→ 大量静态节点直接转为字符串
├── ③ 事件缓存（cacheHandlers）→ 缓存事件处理函数
├── ④ PatchFlag 标记 → 标记动态节点的更新类型
├── ⑤ Block Tree → 跳过静态子树，靶向更新动态节点
└── ⑥ 内联静态元素 → 小静态节点直接内联创建
```

---

## 二、静态提升（hoistStatic）

### 2.1 原理

```
问题：每次渲染都创建相同的静态 VNode → 浪费

┌──────────────────────────────────────────────────────────┐
│  模板：                                                   │
│  <div>                                                    │
│    <header>                                               │
│      <h1>标题</h1>     ← 纯静态，永远不变                 │
│      <nav>导航</nav>   ← 纯静态                          │
│    </header>                                              │
│    <main>{{ content }}</main>  ← 动态                     │
│  </div>                                                   │
│                                                          │
│  Vue 2 编译结果（无静态提升）：                            │
│  function render() {                                      │
│    return h('div', [                                      │
│      h('header', [                                        │
│        h('h1', '标题'),    // 每次渲染都创建新 VNode       │
│        h('nav', '导航'),   // 每次渲染都创建新 VNode       │
│      ]),                                                  │
│      h('main', this.content),                             │
│    ])                                                     │
│  }                                                        │
│                                                          │
│  Vue 3 编译结果（静态提升）：                              │
│  const _hoisted_1 = h('h1', '标题')  // 只创建一次        │
│  const _hoisted_2 = h('nav', '导航') // 只创建一次        │
│                                                          │
│  function render() {                                      │
│    return createBlock('div', null, [                      │
│      createBlock('header', null, [                        │
│        _hoisted_1,  // 直接引用，不重新创建                │
│        _hoisted_2,  // 直接引用，不重新创建                │
│      ]),                                                  │
│      createBlock('main', null, this.content),             │
│    ])                                                     │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
```

### 2.2 静态提升判定规则

```
hoistStatic 遍历 AST 时的判定：

节点可提升的条件（全部满足）：
├── ① 是元素节点 或 文本节点
├── ② 没有动态绑定（无 v-bind、v-on、v-if、v-for）
├── ③ 所有子节点也都是静态的（递归检查）
├── ④ 不在 Suspense / Teleport 内部
└── ⑤ 不在 slot 内部（slot 可能被延迟执行）

提升策略：
├── 单个静态节点 → 提升为常量
├── 连续多个静态节点 → 合并为一个数组提升
└── 超过一定数量的静态节点 → 触发预字符串化
```

---

## 三、预字符串化（preStringify）

### 3.1 原理

```
问题：大量静态节点即使提升，仍然是 VNode 对象 → 内存开销

解决方案：将连续的静态子节点直接序列化为 HTML 字符串

┌──────────────────────────────────────────────────────────┐
│  模板：                                                   │
│  <div>                                                    │
│    <p>第一段</p>                                          │
│    <p>第二段</p>                                          │
│    <p>第三段</p>                                          │
│    <p>第四段</p>                                          │
│    <p>第五段</p>                                          │
│    <p>第六段</p>                                          │
│    <p>第七段</p>                                          │
│    <p>第八段</p>                                          │
│    <p>第九段</p>                                          │
│    <p>第十段</p>     ← 10 个连续静态节点                  │
│    {{ dynamic }}                                          │
│  </div>                                                   │
│                                                          │
│  编译结果（预字符串化）：                                  │
│  const _hoisted_1 = "<p>第一段</p><p>第二段</p>..."      │
│                                                          │
│  function render() {                                      │
│    return createBlock('div', null, [                      │
│      createStaticVNode(_hoisted_1),  // 直接作为字符串    │
│      createTextVNode(toDisplayString(dynamic)),           │
│    ])                                                     │
│  }                                                        │
│                                                          │
│  运行时：                                                  │
│  • createStaticVNode 直接设置 innerHTML                   │
│  • 不创建 VNode 对象 → 零内存开销                         │
│  • 浏览器原生解析 HTML → 比 JS 创建 VNode 更快            │
└──────────────────────────────────────────────────────────┘
```

### 3.2 触发条件

```
预字符串化的触发条件（Vue 3 源码）：

const shouldStringify = (node) => {
  // ① 连续静态子节点数量 >= 阈值
  //   开发模式：5 个
  //   生产模式：20 个（更激进）
  return staticNodeCount >= threshold;
};

// 阈值配置
const hoistStatic = {
  // 开发模式：5 个连续静态节点触发
  // 生产模式：20 个连续静态节点触发
  // 理由：生产模式代码体积更重要，字符串化减少 VNode 数量
};
```

---

## 四、事件缓存（cacheHandlers）

### 4.1 原理

```
问题：每次渲染都创建新的事件处理函数 → 导致子组件不必要的重新渲染

┌──────────────────────────────────────────────────────────┐
│  模板：                                                   │
│  <button @click="handleClick">按钮</button>              │
│                                                          │
│  默认编译结果（无缓存）：                                  │
│  function render() {                                      │
│    return createBlock('button', {                         │
│      onClick: ($event) => handleClick($event)  // 每次新函数 │
│    }, '按钮')                                             │
│  }                                                        │
│                                                          │
│  开启 cacheHandlers 后的编译结果：                         │
│  function render(_ctx, _cache) {                          │
│    return createBlock('button', {                         │
│      onClick: _cache[0] || (                              │
│        _cache[0] = ($event) => handleClick($event)        │
│      )  // 缓存到 _cache 数组，只创建一次                 │
│    }, '按钮')                                             │
│  }                                                        │
│                                                          │
│  效果：                                                    │
│  • 事件函数引用稳定 → 子组件不会因为 props 变化而重新渲染 │
│  • 配合 React.memo 类似的优化（Vue 的 shouldUpdate 检查） │
└──────────────────────────────────────────────────────────┘
```

### 4.2 缓存数组

```
// _cache 数组的结构
_cache = [
  // index 0: 第一个缓存事件
  ($event) => handleClick($event),
  // index 1: 第二个缓存事件
  ($event) => handleInput($event),
  // ...
];

// 缓存索引在编译时确定
// 每个 @click / @input 对应一个固定的 _cache 索引
// 渲染时：_cache[i] || (_cache[i] = handler)
```

---

## 五、PatchFlag 标记

### 5.1 PatchFlag 类型

```typescript
// PatchFlag 位标记（Vue 3 源码）
enum PatchFlags {
  TEXT = 1, // 0b0000000001  动态文本内容（{{ }}）
  CLASS = 2, // 0b0000000010  动态 class
  STYLE = 4, // 0b0000000100  动态 style
  PROPS = 8, // 0b0000001000  动态属性（非 class/style）
  FULL_PROPS = 16, // 0b0000010000  动态 key 变化 / 属性名动态
  HYDRATE_EVENTS = 32, // 0b0000100000  有事件监听（SSR 水合）
  STABLE_FRAGMENT = 64, // 0b0001000000  稳定子节点顺序（v-for 无 key 变化）
  KEYED_FRAGMENT = 128, // 0b0010000000  有 key 的 fragment（需要完整 diff）
  UNKEYED_FRAGMENT = 256, // 0b0100000000  无 key 的 fragment
  NEED_PATCH = 512, // 0b1000000000  需要 patch（ref / v-on 非缓存）
  DYNAMIC_SLOTS = 1024, // 0b10000000000 动态 slot
  DEV_ROOT_FRAGMENT = 2048, // 开发模式专用
  HOISTED = -1, // 静态节点（不需要 patch）
  BAIL = -2, // 退出优化（diff 整个子树）
}
```

### 5.2 PatchFlag 在渲染函数中的使用

```
// 模板
<div :class="cls">{{ text }}</div>

// 编译结果
createElementVNode("div", {
  class: _ctx.cls           // 动态 class → PatchFlag.CLASS
}, _toDisplayString(_ctx.text), 1 /* TEXT */)
//                           ↑
//                     PatchFlag = TEXT (1)
//                     运行时只需更新文本内容

// 多个动态绑定
<div :class="cls" :style="sty" :title="title">{{ text }}</div>

// 编译结果 → PatchFlag 位运算合并
createElementVNode("div", {
  class: _ctx.cls,
  style: _ctx.sty,
  title: _ctx.title
}, _toDisplayString(_ctx.text),
  1 | 2 | 4 | 8  // TEXT | CLASS | STYLE | PROPS = 15
)
// 运行时：根据 PatchFlag 只更新 class、style、title、text
// 不检查其他属性 → 跳过不必要的对比
```

### 5.3 PatchFlag 的运行时优化

```
// patch 函数简化版
function patch(n1, n2, container) {
  const { patchFlag } = n2;

  if (patchFlag === 0) {
    // 无标记 → 全量 diff（静态节点，不需要 patch）
    return;
  }

  if (patchFlag & PatchFlags.TEXT) {
    // 有文本变化 → 只更新文本
    if (n1.children !== n2.children) {
      setTextContent(container, n2.children);
    }
  }

  if (patchFlag & PatchFlags.CLASS) {
    // 有 class 变化 → 只更新 class
    if (n1.props.class !== n2.props.class) {
      patchClass(container, n2.props.class);
    }
  }

  if (patchFlag & PatchFlags.STYLE) {
    // 有 style 变化 → 只更新 style
    patchStyle(container, n1.props.style, n2.props.style);
  }

  if (patchFlag & PatchFlags.PROPS) {
    // 有属性变化 → 只更新指定属性
    // n2.dynamicProps 记录了哪些属性是动态的
    if (n2.dynamicProps) {
      for (const key of n2.dynamicProps) {
        patchProp(container, key, n1.props[key], n2.props[key]);
      }
    }
  }

  // 没有标记的方面 → 完全跳过
  // 这就是"靶向更新"的核心
}
```

---

## 六、Block Tree 与靶向更新

### 6.1 Block Tree 结构

```
Block Tree：在 VNode 树中标记"块根节点"，每个块根节点
收集其内部所有动态后代节点到一个扁平数组（dynamicChildren）。

模板：
<div>                    ← Block 根节点
  <header>               ← 纯静态（被提升）
    <h1>标题</h1>
  </header>
  <main>                 ← 普通节点
    <p>{{ text1 }}</p>   ← 动态（PatchFlag.TEXT）
    <p>静态</p>          ← 静态
    <div :class="cls">   ← 动态（PatchFlag.CLASS）
      <span>{{ text2 }}</span>  ← 动态（嵌套在动态节点内）
    </div>
  </main>
</div>

编译后的 Block Tree：
<div (Block)>
  dynamicChildren: [
    <p> text1 </p>,          // 扁平化收集
    <div class="cls">        // 扁平化收集
      // text2 不需要单独收集
      // 因为 div 是动态节点，更新时会递归处理其子节点
    </p>,
  ]

关键：
  • Block 根节点收集所有动态后代（跨层级）
  • dynamicChildren 是扁平数组（不需要遍历静态节点）
  • 更新时只遍历 dynamicChildren → 跳过所有静态节点
```

### 6.2 靶向更新流程

```
数据变化（text1 更新）
│
├── ① 触发组件重新渲染
│
├── ② 执行渲染函数 → 生成新的 VNode 树
│   └── Block 根节点包含 dynamicChildren 数组
│
├── ③ patch 函数对比新旧 VNode
│   └── 发现 patchFlag → 进入靶向更新模式
│
├── ④ 遍历 dynamicChildren（扁平数组）
│   ├── 第一个：text1 的 <p> → PatchFlag.TEXT → 更新文本
│   └── 第二个：cls 的 <div> → PatchFlag.CLASS → 更新 class
│
└── ⑤ 完成
    • 没有遍历 <header>（静态，被提升）
    • 没有遍历静态的 <p>静态</p>
    • 没有遍历 <span>（嵌套在动态 <div> 内，跟随更新）
    • 只处理了 2 个动态节点

对比 Vue 2 / React：
  Vue 2：遍历整棵 VNode 树 → 每个节点都要对比
  React：遍历整棵 Fiber 树 → 每个节点都要 reconcile
  Vue 3：只遍历 dynamicChildren → 跳过所有静态节点
```

### 6.3 Block 嵌套与动态子节点收集

```
嵌套 Block 的情况：

<div>                    ← Block 1
  <p>{{ a }}</p>         ← 动态
  <template v-if="show"> ← Block 2（条件渲染创建新 Block）
    <p>{{ b }}</p>       ← 动态
    <p>静态</p>          ← 静态
  </template>
</div>

Block 1 的 dynamicChildren:
  [<p>{{ a }}</p>, Block 2 引用]

Block 2 的 dynamicChildren:
  [<p>{{ b }}</p>]

更新流程：
  ① 遍历 Block 1 的 dynamicChildren
  ② <p>{{ a }}</p> → 更新文本
  ③ Block 2 → 递归遍历其 dynamicChildren
  ④ <p>{{ b }}</p> → 更新文本

关键：
  • 条件渲染（v-if）创建新的 Block
  • 列表渲染（v-for）创建 Fragment Block
  • 每个 Block 独立收集自己的动态后代
  • 形成"Block 树"→ 靶向更新可以在 Block 间跳转
```

---

## 七、与 Vue 2 的对比

```
┌─────────────────────────────────────────────────────────────┐
│              Vue 2 vs Vue 3 编译器优化对比                    │
│                                                              │
│  Vue 2                          Vue 3                        │
│  ──────                         ──────                       │
│                                                              │
│  静态标记：无                   静态标记：PatchFlag          │
│  └── 全量 diff                  └── 靶向更新                 │
│                                                              │
│  静态提升：无                   静态提升：hoistStatic        │
│  └── 每次渲染重建静态 VNode     └── 静态节点只创建一次       │
│                                                              │
│  事件缓存：无                   事件缓存：cacheHandlers      │
│  └── 每次渲染创建新函数         └── 函数引用稳定              │
│                                                              │
│  Block Tree：无                 Block Tree：dynamicChildren  │
│  └── 遍历整棵 VNode 树          └── 只遍历动态节点数组       │
│                                                              │
│  预字符串化：无                 预字符串化：preStringify     │
│  └── 大量静态节点 → VNode 开销  └── 大量静态节点 → HTML 字符串│
│                                                              │
│  性能差异：                                                    │
│  • 更新性能提升 30-50%（静态内容越多，优势越大）             │
│  • 内存占用减少（静态节点复用）                               │
│  • 首次渲染略快（静态节点直接 innerHTML）                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 八、与 React 编译优化的对比

```
┌─────────────────────────────────────────────────────────────┐
│           Vue 3 编译器优化 vs React Compiler                 │
│                                                              │
│  Vue 3（编译时优化）           React Compiler（运行时优化）  │
│  ─────────────────             ──────────────────────        │
│                                                              │
│  模板编译时分析                 运行时 Babel 插件分析         │
│  └── 编译器知道哪些是静态的    └── 通过代码分析推断           │
│                                                              │
│  PatchFlag 位标记              自动 memo 插入                │
│  └── 编译产物包含标记          └── 编译产物包含 memo 调用    │
│                                                              │
│  Block Tree 靶向更新           Fiber 树跳过                  │
│  └── dynamicChildren 扁平数组  └── bailout 跳过子树          │
│                                                              │
│  静态提升（编译时）             useMemo（运行时）             │
│  └── 常量提升到函数外          └── 运行时缓存计算结果        │
│                                                              │
│  根本差异：                                                    │
│  • Vue：模板是声明式的 → 编译器可以完全分析                   │
│  • React：JSX 是图灵完备的 → 需要运行时分析                  │
│  • Vue 优化更彻底（编译时 > 运行时）                          │
│  • React 更灵活（任意 JS 逻辑）                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 九、高频面试题

### 9.1 Vue 3 相比 Vue 2 在编译层面做了哪些优化？

```
六大优化：
① 静态提升（hoistStatic）→ 静态节点只创建一次
② 预字符串化（preStringify）→ 大量静态节点转为 HTML 字符串
③ 事件缓存（cacheHandlers）→ 事件函数引用稳定
④ PatchFlag 标记 → 标记动态节点的更新类型
⑤ Block Tree → 扁平化收集动态后代，靶向更新
⑥ 内联静态元素 → 小静态节点直接内联创建

效果：
  • 更新性能提升 30-50%
  • 静态内容越多，优势越大
  • 内存占用减少
```

### 9.2 什么是 PatchFlag？它如何优化更新性能？

```
PatchFlag 是编译时给 VNode 打的位标记：
  • TEXT (1)：动态文本
  • CLASS (2)：动态 class
  • STYLE (4)：动态 style
  • PROPS (8)：动态属性

更新时：
  • patch 函数检查 patchFlag
  • 只处理标记为动态的部分
  • 跳过未标记的部分

例如：patchFlag = TEXT | CLASS = 3
  → 只对比文本和 class
  → 不检查 style、props 等
  → 减少不必要的对比操作
```

### 9.3 什么是 Block Tree？它和 PatchFlag 的关系是什么？

```
Block Tree：
  • 在 VNode 树中标记"块根节点"
  • 每个块根节点收集所有动态后代到 dynamicChildren 数组
  • dynamicChildren 是扁平数组（跨层级收集）

与 PatchFlag 的关系：
  • PatchFlag 标记"这个节点是动态的，更新类型是什么"
  • Block Tree 收集"所有动态节点到一个数组"
  • 更新时：遍历 dynamicChildren → 根据 PatchFlag 靶向更新

效果：
  • 不需要遍历整棵 VNode 树
  • 只遍历 dynamicChildren（全是动态节点）
  • 每个动态节点根据 PatchFlag 精确更新
```

---

## 参考资料

- [Vue 3 源码 - compiler-core](https://github.com/vuejs/core/tree/main/packages/compiler-core)
- [Vue 3 编译器优化详解](https://vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue 3 Performance](https://vuejs.org/guide/best-practices/performance.html)
