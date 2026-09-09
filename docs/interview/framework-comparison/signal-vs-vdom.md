---
title: "Signals vs Virtual DOM [P6-P7]"
level: "senior"
tags: ["Signals", "Virtual DOM", "响应式", "性能"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Signals vs Virtual DOM：技术路线之争 [P6-P7]

> 2026 年，Signals（信号）成为前端响应式的新范式，与 Virtual DOM 形成两大技术路线之争。Vue、Solid、Angular、Preact 都已拥抱 Signals。

## 核心概念（What）

### 两大范式对比

| 特性 | Virtual DOM | Signals |
|------|------------|---------|
| 更新粒度 | 组件级 | 细粒度（变量级） |
| 更新机制 | Diff + Patch | 直接 DOM 操作 |
| 心智模型 | 不可变 + 重新渲染 | 可变 + 自动追踪 |
| 性能 | 中等（Diff 开销） | 高（无 Diff） |
| 代表框架 | React | Vue, Solid, Angular, Preact |

---

## 底层原理（Why）

### 1. Virtual DOM 工作流

```
状态变化 → 重新渲染组件 → 生成新 VDOM → Diff 对比 → Patch DOM

开销分析：
├── 组件函数重新执行（包括所有子组件，除非 memo）
├── VDOM 对象创建和比较
├── Diff 算法 O(n) 复杂度
└── 最终 DOM 操作（可能很少，但前面的开销已发生）
```

### 2. Signals 工作流

```
状态变化 → 依赖追踪 → 精确更新受影响的 DOM 节点

开销分析：
├── 无组件重新渲染
├── 无 VDOM 创建和 Diff
├── 直接更新对应的 DOM 文本/属性
└── 最小化 DOM 操作
```

```typescript
// Signals 示例（Preact Signals）
import { signal, computed, effect } from '@preact/signals';

const count = signal(0);
const double = computed(() => count.value * 2);

// 只有使用 double 的 DOM 会更新，不会重新渲染整个组件
effect(() => {
  console.log(`Double: ${double.value}`);
});

count.value = 1; // 触发 effect，精确更新
```

### 3. React 为什么不用 Signals？

```
React 的选择：
├── 组件是函数（每次调用都是全新执行）
├── 不可变状态（immutability）
├── 单向数据流
└── 显式 memo（useMemo, React.memo）

React 不用 Signals 的原因：
├── 与不可变数据模型冲突
├── 细粒度追踪需要 Proxy/Getter（与 React 模型不同）
├── Server Components 与 Signals 不兼容
└── React 团队认为编译器优化（React Compiler）可以解决性能问题

React Compiler（2026）：
├── 自动 memo（不再需要 useMemo/React.memo）
├── 编译时分析依赖关系
├── 跳过未变化的组件渲染
└── 本质上是用编译器达到类似 Signals 的效果
```

### 4. 性能对比

```
场景：1000 个列表项，更新其中 1 个

Virtual DOM（React）：
├── 重新渲染列表组件
├── 生成 1000 个 VDOM 节点
├── Diff 1000 个节点
└── 更新 1 个 DOM 节点

Signals（Solid/Vue）：
├── 追踪到 1 个信号变化
├── 直接更新 1 个 DOM 节点
└── 无 Diff 开销

结论：
- 列表越大，Signals 优势越明显
- 简单场景差异不大
- React Compiler 可以缩小差距
```

---

## 高频面试题

### Q1: Signals 和 Virtual DOM 的本质区别？

**参考答案要点**：
- VDOM：声明式 UI + Diff 算法（组件级更新）
- Signals：响应式追踪 + 精确更新（变量级更新）
- VDOM 是「重新执行然后对比」，Signals 是「追踪依赖然后精确更新」
- 两者都是声明式的，区别在更新策略

### Q2: React 为什么坚持不用 Signals？

**参考答案要点**：
- 与 React 的不可变数据模型冲突
- Server Components 无法使用 Signals（服务端没有响应式运行时）
- React 选择编译器优化路线（React Compiler）
- 生态惯性（React 生态太大，不可能大改）

### Q3: 2026 年应该选择哪个范式？

**参考答案要点**：
- 新项目：Vue/Solid（Signals）或 React（Compiler 优化）都可以
- 团队熟悉 React → React + Compiler
- 追求极致性能 → Solid/Svelte（编译时优化）
- 核心能力：理解两种范式的 trade-off，而非盲目选边

---

## 延伸思考

1. **设计题**：将一个 React 组件重构为 Signals 模式。
2. **场景题**：一个大型表单应用，选择 React 还是 Vue/Solid？为什么？
3. **对比题**：Signals vs React Compiler vs Svelte 编译器，各自的优化策略？

---

## 参考资料

- [Signals Proposal](https://github.com/preactjs/signals)
- [React Compiler](https://react.dev/learn/react-compiler)
- [Solid.js](https://www.solidjs.com)
- [Vue Reactivity](https://vuejs.org/guide/extras/reactivity-in-depth.html)
