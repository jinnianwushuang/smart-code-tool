---
title: 大对象消费
order: 14
---

# 大对象消费

在 React 19 中，面对一个**非响应式**、**逻辑复杂**且**体积巨大**的单例对象，核心挑战在于如何避免不必要的重渲染，同时确保组件在渲染时能拿到最新数据。

以下是高性能设计的几个核心策略：

## 1. 使用 `use` 配合 `Context` (React 19 新特性)

即使对象不是响应式的，你也需要一种手段将其注入组件树。将单例对象放入 `Context`，但在组件内使用 React 19 的 **`use(Context)`** 来读取。

- **优势**：`use()` 比 `useContext` 更灵活，可以在条件语句中使用。
- **关键点**：由于对象本身不是 state，修改它的属性不会触发渲染。这正是你需要的——只有当父级组件因为其他原因（如路由切换、强制刷新）重渲染时，子组件才会重新读取它。
-

## 2. 局部消费：选择性订阅 (Pub/Sub)

如果你希望对象的**某个局部**更改时，只有相关组件刷新，而不是全量刷新，可以使用**外部存储同步（External Store）**模式。

- **方案**：使用 `useSyncExternalStore`。
- **做法**：在单例对象中实现一个简单的订阅机制（发布订阅）。组件通过 `useSyncExternalStore` 订阅该对象。
- **性能**：它可以精确控制哪些组件需要根据对象的特定部分更新，而无需将整个大对象变成 React State。
-

## 3. 利用 `useMemo` 和 `useDeferredValue` 隔离计算

如果组件从大对象中提取数据的逻辑很重：

- 使用 **`useMemo`** 缓存计算结果，依赖项可以是一个手动触发的“版本号”或“时间戳”。
- 如果读取操作可能阻塞 UI，配合 **`useDeferredValue`**，让 React 优先处理输入等高优先级任务。
-

## 4. 避免“属性钻透”，采用“容器组件”

不要把大对象作为 props 层层传递。

- **设计**：让叶子节点组件通过 Context 或直接引用单例来获取数据。
- **优化**：在中间层使用 **`React.memo`**。既然单例对象的引用不变，中间组件只要 props 没变就不会重渲染。

## 5. 显式触发更新

既然对象是非响应式的，当你确定需要界面同步变化时，可以使用一个简单的 `useReducer` 或 `useState` 计数器来手动触发**局部**渲染：

```javascript
const [, forceUpdate] = useReducer((x) => x + 1, 0)
```

## 总结方案

- **默认读取**：直接在组件内引用单例，或通过 `use(Context)` 注入。
- **按需渲染**：使用 `useSyncExternalStore` 订阅对象的局部变更。
- **性能阻断**：大量使用 `React.memo` 阻止因父组件更新导致的无效子组件重绘

## MITT

在 React 19 中，使用类似 [Mitt](https://github.com/developit) 的事件库来管理“巨大单例对象”的局部更新是非常高效的方案。这种**发布/订阅（Pub/Sub）模式**可以将“数据变更”与“组件渲染”解耦，避免 React 树的大范围无效重绘。

以下是高性能设计的具体实现步骤：

## 1. 核心架构：事件总线 + 单例对象

将你的单例对象与 Mitt 结合。Mitt 负责通知“哪里变了”，单例对象负责“存储数据”。

```javascript
import mitt from 'mitt'

// 定义事件类型
const emitter = mitt()

// 你的巨大单例对象
export const bigService = {
  data: {
    user: { name: 'Alice', age: 25 },
    settings: { theme: 'dark' },
    // ... 其他大量数据
  },

  // 修改数据并发布事件
  updateUser(newName) {
    this.data.user.name = newName
    // 仅发布 user 变更事件，不需要全量通知
    emitter.emit('user_changed', this.data.user)
  },
}

export { emitter }
```

## 2. 使用 `useSyncExternalStore` 实现高性能监听 (React 推荐)

为了在 React 中“正确且高性能”地消费这个非响应式对象，**[useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)** 是比 `useEffect` 更好的选择。它能确保组件在并发模式下依然保持数据同步，且仅在订阅的局部数据变化时触发重渲染。

你可以封装一个自定义 Hook：

```javascript
import { useSyncExternalStore } from 'react'
import { emitter, bigService } from './bigService'

export function useBigServiceUser() {
  // 订阅逻辑
  const subscribe = (callback) => {
    emitter.on('user_changed', callback)
    return () => emitter.off('user_changed', callback)
  }

  // 获取快照逻辑（必须返回稳定的值，或基本类型）
  const getSnapshot = () => bigService.data.user.name

  return useSyncExternalStore(subscribe, getSnapshot)
}
```

## 3. 组件层级设计建议

- **各层级按需消费**：不要在顶层组件订阅事件。让**叶子节点组件**（真正需要显示名字的那个小组件）直接使用 `useBigServiceUser`。这样当 `user.name` 改变时，只有该叶子节点会重渲染，整棵树的其他部分完全静默。
- **事件细粒度化**：不要只发一个 `data_changed` 事件。针对大对象的不同模块发送不同的事件（如 `user_changed`, `config_changed`），实现精准通知。
- **利用 React 19 的 `use` 注入**：如果你依然想通过 Context 传递这个单例对象以方便测试，可以使用 React 19 的 `use(MyContext)` 来获取单例引用，然后配合上述 Hook 进行局部订阅。 [1, 2, 3, 4]
-

## 4. 为什么这样设计更高性能？

1. **跳过 Diff 算法**：普通的 React State 变更需要从根部开始 Diff 树。而 Mitt + `useSyncExternalStore` 类似于“点对点”通知，直接击中目标组件。
2. **非响应式优势**：大对象不需要被 `Proxy` 包裹（如 Vue 或 Valtio），这节省了海量的内存和初始化开销。
3. **内存管理**：Mitt 非常轻量（小于 200b），且通过 `useSyncExternalStore` 的清除机制可以完美避免内存泄漏。 [5, 6]
