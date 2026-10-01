# Signal — 细粒度响应式的新范式

> Signal 正在成为前端响应式编程的统一语言。
> 从 SolidJS 推广，到 Angular、Preact、Svelte 5 采纳，再到 ES2026 正式写入 JS 规范——
> Signal 代表了"值级精确更新"的响应式范式，与 Vue 的 Proxy 方案殊途同归。

---

## 一、一句话定义

Signal 是一种**细粒度响应式原语**：它是一个包含值的容器，当值变化时，只有直接依赖该值的 DOM 节点或计算会被更新——**不重跑组件函数，不触发虚拟 DOM Diff**。

---

## 二、Signal vs 传统响应式

### 2.1 更新粒度对比

```
┌─────────────────────────────────────────────────────────────┐
│  响应式范式对比                                              │
│                                                              │
│  React (useState)                                            │
│  ┌──────────┐                                                │
│  │ Component │ ← state 变化 → 整个组件函数重新执行           │
│  │  函数     │   → 生成新虚拟 DOM → Diff → 更新 DOM          │
│  └──────────┘   粒度：组件级                                  │
│                                                              │
│  Vue 3 (Proxy/ref)                                           │
│  ┌──────────┐                                                │
│  │ Component │ ← 响应式数据变化 → 重新执行 render effect     │
│  │  渲染     │   → 生成新虚拟 DOM → Patch → 更新 DOM         │
│  └──────────┘   粒度：组件级（但依赖追踪更精确）             │
│                                                              │
│  Signal (Solid/Svelte/ES2026)                                │
│  ┌──────────┐                                                │
│  │ Signal    │ ← 值变化 → 直接更新绑定的 DOM 节点            │
│  │  → DOM   │   不重跑组件，不生成虚拟 DOM                   │
│  └──────────┘   粒度：节点级（最细）                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 心智模型差异

| 维度       | React useState               | Vue ref/reactive             | Signal                |
| ---------- | ---------------------------- | ---------------------------- | --------------------- |
| 更新粒度   | 组件级（整棵子树重渲染）     | 组件级（render effect 重跑） | 节点级（精确到 DOM）  |
| 组件重执行 | ✅ 每次 state 变化都重跑     | ✅ render effect 重跑        | ❌ 组件函数只执行一次 |
| 虚拟 DOM   | ✅ 需要 Diff                 | ✅ 需要 Diff/Patch           | ❌ 不需要             |
| 手动优化   | useMemo / useCallback / memo | shallowRef / computed        | 不需要（天然精确）    |
| 心智负担   | 高（闭包陷阱、依赖数组）     | 中（ref 解包、响应式丢失）   | 低（值变了就更新）    |

---

## 三、各框架的 Signal 实现

### 3.1 SolidJS — Signal 的原点

SolidJS 是最早将 Signal 作为核心原语的框架，组件函数**只执行一次**：

```js
import { createSignal, createEffect, createMemo } from 'solid-js'

function Counter() {
  const [count, setCount] = createSignal(0)

  // createMemo：自动计算，依赖变化时重算
  const doubled = createMemo(() => count() * 2)

  // createEffect：副作用，count 变化时自动执行
  createEffect(() => {
    console.log('Count is:', count())
  })

  // 组件函数只执行一次
  // count 变化时，只有绑定的 DOM 文本节点更新
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count()}, Doubled: {doubled()}
    </button>
  )
}
```

**SolidJS 的核心设计**：

- 组件函数只执行一次，之后永远不再重跑
- Signal 变化直接更新对应的 DOM 节点
- 没有虚拟 DOM，没有 Diff，没有 Fiber 调度

### 3.2 Angular Signals — 从 Zone.js 迁移

Angular 从 v16 开始引入 Signals，作为替代 Zone.js 变化检测的新方案：

```ts
import { signal, computed, effect } from '@angular/core'

@Component({
  template: `
    <button (click)="increment()">Count: {{ count() }}, Doubled: {{ doubled() }}</button>
  `,
})
class CounterComponent {
  count = signal(0)
  doubled = computed(() => this.count() * 2)

  increment() {
    this.count.update((c) => c + 1)
  }

  constructor() {
    // 副作用：count 变化时自动执行
    effect(() => {
      console.log('Count changed:', this.count())
    })
  }
}
```

**Angular Signals 的目标**：

- 最终替代 Zone.js（"很多 Angular 开发者提到 Zone.js 时都会做出呕吐的表情"）
- 更精细的更新控制，消除不必要的变化检测
- 与现有 OnPush 策略共存，渐进迁移

### 3.3 Preact Signals — 跨框架共享

Preact 的 Signals 库可以跨框架使用，甚至可以在 React 中使用：

```js
import { signal, computed, effect } from '@preact/signals-react'

// 全局 Signal — 框架无关
const count = signal(0)
const doubled = computed(() => count.value * 2)

// 在 React 组件中使用
function Counter() {
  return (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  )
}
```

**关键优势**：Signal 是框架无关的，可以在 React、Vue、Solid 甚至原生 JS 中共享——为微前端架构提供了天然的状态同步方案。

### 3.4 Svelte 5 Runes — 编译器生成的 Signal

Svelte 5 的 Runes 系统编译后生成类似 SolidJS 的 Signal 原语：

```svelte
<!-- Svelte 5 Runes 语法 -->
<script>
  let count = $state(0)           // 编译为 Signal
  let doubled = $derived(count * 2) // 编译为 computed

  $effect(() => {
    console.log('Count:', count)    // 编译为 effect
  })
</script>

<button onclick={() => count++}>
  Count: {count}, Doubled: {doubled}
</button>
```

### 3.5 Vue 与 Signal

Vue 3 的 `ref` 在概念上已经接近 Signal：

```js
import { ref, computed, effect } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

// Vue 的 effect（底层 API）
effect(() => {
  console.log('Count:', count.value)
})
```

Vue 3.5+ 的 Vapor 模式进一步优化了响应式追踪，与 Signal 的细粒度理念趋同。Vue 的 Proxy 方案和 Signal 方案的核心差异：

| 维度     | Vue Proxy 方案           | Signal 方案                |
| -------- | ------------------------ | -------------------------- |
| 依赖追踪 | Proxy 拦截属性读取       | Signal 读取时自动建立      |
| 虚假依赖 | 可能因"意外访问属性"建立 | 更精确，只追踪真正使用的值 |
| 语法     | `ref.value` 需要解包     | `signal.value` 或直接调用  |
| 对象深层 | Proxy 自动递归代理       | 需要手动创建嵌套 Signal    |

---

## 四、ES2026 — Signal 写入 JS 规范

### 4.1 里程碑

2026 年，TC39 委员会宣布 **Signals 提案通过终审**，正式进入 ECMAScript 2026 标准。JavaScript 引擎层级终于拥有了原生的细粒度响应式状态管理。

### 4.2 原生 Signal API

```js
// ES2026 原生 Signal（浏览器引擎内置）
const count = new Signal.State(0)
const doubled = new Signal.Computed(() => count.get() * 2)

// 自动追踪依赖，不需要写依赖数组
Signal.sub(() => {
  console.log(`Count: ${count.get()}`)
})

count.set(1) // 自动触发上面的 sub
```

### 4.3 为什么这是"手动追踪的终点"

| 时代                | 方案                                | 痛点                 |
| ------------------- | ----------------------------------- | -------------------- |
| 手动 DOM            | `document.getElementById`           | 手动管理一切         |
| React Hooks         | `useState` + `useEffect` + 依赖数组 | 闭包陷阱、漏写依赖   |
| Vue Composition API | `ref` + `watch` + `watchEffect`     | ref 解包、响应式丢失 |
| ES2026 Signal       | `Signal.State` + `Signal.sub`       | 引擎原生，无需框架   |

---

## 五、Signal 的适用场景

### 5.1 最适合 Signal 的场景

```
✅ 高频更新的小型状态（计数器、滑块、拖拽位置）
✅ 跨框架共享状态（微前端架构）
✅ 不需要组件重渲染的纯数据更新
✅ 性能敏感的大型列表（只更新变化的行）
```

### 5.2 Signal 不是万能的

```
⚠️ 复杂对象状态管理 → 仍需要 Store 模式（Pinia/Zustand）
⚠️ 列表渲染 → 仍需框架的列表 Diff（key 机制）
⚠️ 组件生命周期 → Signal 不处理生命周期
⚠️ 服务端渲染 → Signal 需要额外的序列化方案
```

---

## 六、跨框架对比速查

| 概念           | Vue                | React       | SolidJS        | Angular      | Svelte 5         |
| -------------- | ------------------ | ----------- | -------------- | ------------ | ---------------- |
| **状态原语**   | `ref` / `reactive` | `useState`  | `createSignal` | `signal()`   | `$state()`       |
| **计算属性**   | `computed`         | `useMemo`   | `createMemo`   | `computed()` | `$derived()`     |
| **副作用**     | `watchEffect`      | `useEffect` | `createEffect` | `effect()`   | `$effect()`      |
| **更新粒度**   | 组件级             | 组件级      | 节点级         | 节点级       | 节点级           |
| **虚拟 DOM**   | ✅                 | ✅          | ❌             | ❌           | ❌（编译时优化） |
| **组件重执行** | ✅                 | ✅          | ❌             | ❌           | ❌               |

---

## 七、深度思考

1. **React 的立场**：React 核心团队坚持"UI = f(state)"的函数式纯粹性，暂未引入 Signal。React Compiler 解决"组件级"记忆化，Signal 解决"值级"精确更新——两者互补还是对立？
2. **Vue 的 Proxy vs Signal**：Vue 的 Proxy 方案在对象深层代理上更自然，Signal 在依赖追踪上更精确——未来 Vue 是否会全面转向 Signal？
3. **ES2026 Signal 的浏览器兼容**：原生 Signal 需要浏览器引擎支持，polyfill 方案的性能开销如何？
4. **框架无关的 Signal**：Signal 是框架无关的，但 UI 框架的组件模型、生命周期、路由等仍然框架特定——Signal 在微前端中的实际价值有多大？

---

## 参考

- [SolidJS 官方文档 — Signals](https://www.solidjs.com/tutorial/introducing_signals)
- [Angular Signals 官方指南](https://angular.dev/guide/signals)
- [Preact Signals](https://preactjs.com/guide/v10/signals/)
- [TC39 Signals 提案](https://github.com/tc39/proposal-signals)
- [前端框架渲染模型深度拆解：从 Virtual DOM 到 Signals](https://www.chenxutan.com/d/4522.html)
- [2026 前端框架深度解析](https://juejin.cn/post/7659854493061726223)
