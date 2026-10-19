---
title: 'Vue 3 生态实战模式 [P6-P7]'
level: 'senior'
tags: ['Vue 3', '组合式 API', 'Suspense', 'Teleport', 'KeepAlive', 'provide/inject']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# Vue 3 生态实战模式 [P6-P7]

> 组合式 API 是 Vue 3 的核心范式，配合 Suspense、Teleport、KeepAlive、provide/inject 等内置组件，可以构建高度可复用的应用架构。本文深入探讨这些模式的设计原则和实战应用。

## 核心概念（What）

### Vue 3 核心模式全景

| 模式               | 解决的问题            | 核心 API                        |
| ------------------ | --------------------- | ------------------------------- |
| **Composable**     | 逻辑复用              | setup + ref/reactive + 生命周期 |
| **Suspense**       | 异步组件加载状态      | `<Suspense>` + async setup      |
| **Teleport**       | 弹窗/Tooltip 挂载位置 | `<Teleport to="body">`          |
| **KeepAlive**      | 组件状态缓存          | `<KeepAlive>` + include/exclude |
| **provide/inject** | 跨层级依赖注入        | provide() / inject()            |

---

## 底层原理（Why）

### 1. Composable 的响应式追踪链路

Composable 不是“普通函数”，它是 Vue 响应式系统的**一等公民**——每次调用都创建独立的响应式作用域。

```
Composable 响应式链路：

useMouse() 调用时：
  │
  ├── 创建 ref(0) → 创建 ReactiveEffect
  │   └── effect 内执行 track() → 收集依赖
  │
  ├── onMounted(() => { ... })
  │   └── 注册到当前组件的 effectScope
  │       └── 组件卸载时自动清理
  │
  └── 返回 { x, y }（ref 引用）
      └── 模板中使用 x.value → 创建新的 effect
          └── x 变化 → trigger → 重新执行 effect → DOM 更新

为什么 Composable 能保持响应式：
  ├── ref/reactive 返回的是 Proxy/Ref 对象（引用类型）
  ├── 从 composable 返回后，引用关系不断裂
  ├── 模板中访问 .value → 自动 track
  └── 修改 .value → 自动 trigger → 组件重渲染

与 React Hook 的本质差异：
  React Hook：每次渲染重新执行，状态通过 Fiber 节点保持
  Vue Composable：只执行一次（setup 阶段），状态通过 ref 持久存在
```

### 2. Suspense 的异步依赖收集算法

Vue 的 Suspense 不是“等待 Promise”，而是一个**异步依赖收集器**——它递归收集所有子组件的异步操作。

```
Suspense 执行链路：

<Suspense>
  <AsyncComponent />  ← async setup()
</Suspense>

1. 开始渲染 Suspense 的 default 插槽
   └── 遇到 AsyncComponent → 执行 setup()
       └── setup() 返回 Promise → 标记为“挂起”

2. Suspense 收集到未完成的 Promise
   ├── 显示 fallback 插槽
   └── 等待所有 Promise resolve

3. 所有 Promise 完成
   ├── 重新渲染 default 插槽
   ├── 这次组件正常渲染（数据已就绪）
   └── 触发 @resolve 事件

嵌套 Suspense 的优先级：
  内层 Suspense 先处理自己的异步组件
  如果内层全部完成 → 内层显示内容
  外层等待所有内层 Suspense 完成
  → 外层显示内容

与 React Suspense 的差异：
  Vue：支持 async setup（组合式 API 级别）
  React：支持 throw promise（渲染级别）
  Vue 的 Suspense 更贴近开发者心智模型
```

### 3. KeepAlive 的 LRU 缓存引擎

KeepAlive 不是“隐藏组件”，而是一个**带 LRU 策略的 VNode 缓存池**。

```
KeepAlive 缓存机制：

<KeepAlive :include="['A', 'B']" :max="10">
  <component :is="currentView" />
</KeepAlive>

内部数据结构：
  cache: Map<string | number, VNode>  ← VNode 缓存池
  keys: Set<string | number>          ← 缓存键集合（维护顺序）

切换组件时：
  1. 检查新组件的 name 是否在 include 中
     ├── 不在 → 直接卸载旧组件，挂载新组件
     └── 在 → 进入缓存流程

  2. 缓存流程：
     ├── 旧组件 VNode 存入 cache（不卸载，只移动 DOM 到隐藏容器）
     ├── 检查 cache.size > max
     │   └── 超过 → 删除最久未使用的（LRU）
     └── 新组件从 cache 中查找
         ├── 有缓存 → 复用 VNode + DOM（触发 onActivated）
         └── 无缓存 → 创建新 VNode（首次渲染）

为什么用 LRU 而不是无限缓存：
  ├── 内存有限，不可能缓存所有组件
  ├── LRU 保证最常使用的组件被保留
  └── max 参数让开发者控制内存上限
```

```ts
const themeKey: InjectionKey<ThemeConfig> = Symbol('theme');

// 父组件
provide(themeKey, { mode: 'light', primaryColor: '#3b82f6', toggle() { ... } });

// 子组件（自动推断类型）
const theme = inject(themeKey); // ThemeConfig | undefined
const theme2 = inject(themeKey)!; // ThemeConfig（非空断言）
const theme3 = inject(themeKey, { mode: 'light', primaryColor: '#000', toggle() {} }); // 带默认值

// 最佳实践：
// ├── 使用 Symbol 作为 key（避免命名冲突）
// ├── 使用 InjectionKey<T> 保证类型安全
// ├── 封装为 composable（封装 inject 逻辑）
// └── 提供默认值（避免 undefined）

```

---

## 高频面试题

### Q1: Composable 的设计原则是什么？

**参考答案要点**：

- 命名以 `use` 开头
- 返回 ref/reactive（保持响应式）
- 自动清理副作用（onUnmounted 中移除监听器）
- 接受 MaybeRef 参数（支持响应式输入）
- 单一职责，可组合

### Q2: Suspense 的工作原理？

**参考答案要点**：

- 等待内部所有异步 setup 完成
- 期间显示 fallback 内容
- 支持嵌套（多层 Suspense）
- 提供 resolve/pending 事件
- 注意：Vue 3.5 中 Suspense 已稳定

### Q3: KeepAlive 的缓存策略如何设计？

**参考答案要点**：

- include/exclude 控制缓存哪些组件
- max 控制最大缓存数量（LRU 淘汰）
- 组件必须有 name 属性
- 使用 onActivated/onDeactivated 生命周期
- 路由级别缓存：meta.keepAlive + 动态 include

---

## 延伸思考

1. **设计题**：设计一个通用的 useFetch composable（支持缓存、重试、取消）。
2. **场景题**：KeepAlive 缓存的组件数据不更新，如何解决？
3. **对比题**：provide/inject vs Pinia，全局状态管理如何选择？

---

## 参考资料

- [Vue 3 Composable 文档](https://vuejs.org/guide/reusability/composables.html)
- [Suspense RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0027-suspense.md)
- [Teleport 文档](https://vuejs.org/guide/built-ins/teleport.html)

```

```
