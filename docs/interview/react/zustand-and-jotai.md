---
title: 'Zustand/Jotai 状态管理深度 [P6-P7]'
level: 'senior'
tags: ['Zustand', 'Jotai', 'React', '状态管理', '原子化']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# Zustand/Jotai 状态管理深度 [P6-P7]

> Zustand 和 Jotai 是 2026 年 React 生态最流行的轻量级状态管理方案。Zustand 基于单一 store + hooks，Jotai 基于原子化模型。两者都极简、TypeScript 友好，但设计哲学截然不同。

## 核心概念（What）

### Zustand vs Jotai vs Redux 对比

| 特性     | Zustand                        | Jotai               | Redux Toolkit        |
| -------- | ------------------------------ | ------------------- | -------------------- |
| 模型     | 单一 store                     | 原子化（多个 atom） | 单一 store + reducer |
| 体积     | ~1KB                           | ~2KB                | ~10KB                |
| Provider | 不需要                         | 不需要              | 需要                 |
| 更新粒度 | selector 级别                  | atom 级别           | selector 级别        |
| 中间件   | 丰富（persist/devtools/immer） | 有限                | 丰富                 |
| 学习曲线 | 低                             | 低                  | 中                   |
| 派生状态 | computed/getter                | 派生 atom           | createSelector       |
| 异步     | 直接 async/await               | 直接 async/await    | createAsyncThunk     |

### Zustand vs Redux 架构差异

两者都是「单一 store + 订阅模式」，但设计哲学截然不同：

```
更新流程对比：

Redux（严格单向数据流）：
  Component → dispatch(action) → Middleware → Reducer → New State → Store → useSelector → 重渲染
  ├── action 是纯对象描述：{ type: 'INCREMENT', payload: 1 }
  ├── reducer 是纯函数：(state, action) => newState，禁止副作用
  ├── middleware 拦截 action：处理异步、日志、路由等
  └── 强制不可变：reducer 必须返回新对象，禁止修改原 state

Zustand（极简直接更新）：
  Component → setState(partial) → 合并 state → 通知 listeners → selector 过滤 → 重渲染
  ├── 无 action/reducer：直接在 setState 中写更新逻辑
  ├── 无 middleware 拦截链：中间件包裹 store 创建函数（洋葱模型）
  ├── 无 Provider：store 是模块级闭包，全局单例
  └── 同样不可变：Object.assign({}, state, partial)，但 API 更简洁
```

```
核心差异总结：
┌─────────────────┬──────────────────────────┬──────────────────────────┐
│ 维度            │ Redux                    │ Zustand                  │
├─────────────────┼──────────────────────────┼──────────────────────────┤
│ 更新方式        │ dispatch(action) → reducer│ setState(partial) 直接更新│
│ 样板代码        │ 多（action/reducer/connect）│ 极少（create 一步到位）  │
│ 异步处理        │ middleware（thunk/saga）   │ 直接在 action 中 async   │
│ 状态结构        │ 单一 state tree + slice   │ 单一 store 扁平对象      │
│ 组件连接        │ Provider + useSelector    │ 直接调用 hook            │
│ DevTools        │ 成熟（时间旅行、action 回放）│ 通过 devtools 中间件集成 │
│ 可测试性        │ reducer 纯函数易测试       │ 函数直接测试，同样简单    │
│ 适用场景        │ 大型应用、需要严格规范     │ 中小型应用、快速开发      │
└─────────────────┴──────────────────────────┴──────────────────────────┘
```

**本质区别**：Redux 通过**约束流程**（强制 action → reducer）保证可预测性，适合团队协作和大型应用；Zustand 通过**简化流程**（去掉 action/reducer 中间层）降低复杂度，适合快速迭代。两者底层都是发布-订阅模式，差异在于中间是否有一层「action 分发 + reducer 纯函数计算」的间接层。

---

## 底层原理（Why）

### 1. Zustand 源码级原理

```typescript
// Zustand 核心实现（简化版）
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = Object.assign({}, state, nextState);
    listeners.forEach(listener => listener());
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { setState, getState, subscribe };
}

// React 绑定（useStore hook）
function useStore(store, selector) {
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const state = store.getState();
  const selected = selector(state);

  useEffect(() => {
    return store.subscribe(() => {
      const nextSelected = selector(store.getState());
      // 只在选中值变化时触发更新
      if (!Object.is(selected, nextSelected)) {
        forceUpdate();
      }
    });
  }, [store, selector]);

  return selected;
}

// 使用
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
}));

// 组件使用（selector 精确订阅）
function Counter() {
  const count = useCounterStore(s => s.count); // 只订阅 count
  return <div>{count}</div>;
}
```

### 2. Zustand 核心架构深度解析

#### 2.1 发布-订阅模式与 Listener 机制

Zustand 的核心是一个经典的**发布-订阅（Pub/Sub）模式**，但做了极致精简：

```
Zustand 架构模型：
┌──────────────────────────────────────────────────────────┐
│  Store（全局单例）                                         │
│  ├── state: 当前状态树（单一不可变对象）                    │
│  ├── listeners: Set<listener>（订阅者集合）                 │
│  ├── setState(partial): 合并状态 → 通知所有 listener       │
│  ├── getState(): 返回当前 state 快照                      │
│  └── subscribe(listener): 注册订阅 → 返回取消函数          │
│                                                           │
│  关键设计决策：                                            │
│  ├── 无 Provider：Store 是模块级闭包变量，全局单例          │
│  ├── 无 dispatch/action：直接调用 setState，无样板代码     │
│  ├── 不可变更新：Object.assign({}, state, nextState)       │
│  └── 广播通知：setState 后遍历所有 listener，无依赖追踪    │
└──────────────────────────────────────────────────────────┘
```

#### 2.2 更新传播流程

```
setState 完整传播链：
1. 调用 setState(partial)
   ├── partial 是函数 → partial(state) → 计算 nextState
   └── partial 是对象 → 直接作为 nextState
2. 合并状态：state = Object.assign({}, state, nextState)
   └── 浅合并（只合并顶层属性），生成新的 state 引用
3. 广播通知：listeners.forEach(listener => listener())
   └── 无差别广播，所有 listener 都会收到通知
4. React 组件侧（useStore hook 内部）：
   ├── listener 被触发 → 执行 selector(store.getState())
   ├── 比较 selected 与 nextSelected（Object.is）
   ├── 值未变 → 跳过渲染（关键优化点）
   └── 值变化 → forceUpdate() → React 重渲染该组件
```

与 Jotai 的核心差异：

```
Zustand 广播模型 vs Jotai DAG 模型：

Zustand（广播式）：
  setState → 通知所有 listener → 每个 listener 自己用 selector 过滤
  ├── 优点：实现极简，无依赖图维护开销
  ├── 缺点：listener 数量多时，每次 setState 都遍历所有 listener
  └── 优化依赖：subscribeWithSelector 中间件在 store 层面做 Object.is 过滤

Jotai（DAG 式）：
  set(atom) → 标记脏节点 → 沿 DAG 边拓扑传播 → 只通知订阅了该 atom 的组件
  ├── 优点：精确传播，未订阅的组件零开销
  ├── 缺点：需要维护依赖图，atom 数量多时图管理有开销
  └── 优化依赖：惰性求值，派生 atom 无人订阅时不计算
```

#### 2.3 Selector 精确订阅机制

Selector 是 Zustand 实现精确更新的核心手段——store 广播通知所有 listener，但每个 listener 通过 selector 过滤，只在关心的值变化时才触发重渲染：

```typescript
// Selector 工作原理
function useStore(store, selector) {
  const [, forceUpdate] = useReducer((c) => c + 1, 0)

  // 1. 渲染时：从 store 取当前值，用 selector 提取关心的部分
  const selected = selector(store.getState())

  useEffect(() => {
    return store.subscribe(() => {
      // 2. store 变化时：重新执行 selector
      const nextSelected = selector(store.getState())
      // 3. Object.is 精确比较：值未变则跳过
      if (!Object.is(selected, nextSelected)) {
        forceUpdate() // 只有值真正变化才触发重渲染
      }
    })
  })

  return selected
}

// ⚠️ 陷阱：内联 selector 每次渲染创建新函数引用
function Bad() {
  // 每次渲染 new function → useEffect 依赖变化 → 重新订阅 → 内存泄漏风险
  const items = useStore((s) => s.items.filter((i) => i.active))
}

// ✅ 修复：提取到模块顶层，保持引用稳定
const selectActiveItems = (s) => s.items.filter((i) => i.active)
function Good() {
  const items = useStore(selectActiveItems)
}

// ✅ 进阶：useShallow 浅比较（对象/数组场景）
import { useShallow } from 'zustand/react/shallow'
function Profile() {
  // Object.is 比较引用 → 永远不等（每次 filter 返回新数组）
  // useShallow 逐元素比较 → 内容相同则跳过
  const { name, email } = useUserStore(useShallow((s) => ({ name: s.name, email: s.email })))
}
```

#### 2.4 中间件洋葱模型

Zustand 的中间件采用**洋葱模型**（类似 Koa），每个中间件包裹 store 创建函数，层层增强能力：

```
中间件组合原理（洋葱模型）：

create(devtools(persist(immer(stateCreator))))

执行顺序：
外层 → devtools（拦截 setState，发送到 Redux DevTools）
  ↓
中层 → persist（拦截 setState，同步写入 localStorage）
  ↓
内层 → immer（拦截 setState，用 produce 包装实现 mutable 写法）
  ↓
核心 → stateCreator（用户定义的状态和操作）

每个中间件的职责：
┌──────────────────────────────────────────────────────────┐
│  devtools:  拦截 set → 发送 action 到 DevTools → 透传    │
│  persist:   拦截 set → 写入 storage → 初始化时恢复状态    │
│  immer:     拦截 set → produce(draft) → 生成不可变结果    │
│  temporal:  拦截 set → 保存历史快照 → 支持 undo/redo      │
└──────────────────────────────────────────────────────────┘
```

```typescript
// 自定义中间件示例：日志中间件
const logger = (config) => (set, get, api) => {
  // 增强 set 方法：在更新前后打印日志
  const enhancedSet = (...args) => {
    console.group('Zustand Update')
    console.log('prev:', get())
    set(...args)
    console.log('next:', get())
    console.groupEnd()
  }
  // 将增强后的 set 传递给下一层
  return config(enhancedSet, get, api)
}

// 使用
const useStore = create(
  logger((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
  })),
)
```

### 3. Zustand 中间件体系（实战）

```typescript
// 1. persist 中间件：自动持久化
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (credentials) => {
        const data = await api.login(credentials)
        set({ token: data.token, user: data.user })
      },
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 只持久化部分状态
        token: state.token,
        user: state.user,
      }),
    },
  ),
)

// 2. immer 中间件：不可变更新简化
import { immer } from 'zustand/middleware/immer'

const useTodoStore = create(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: Date.now(), text, done: false })
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id)
        if (todo) todo.done = !todo.done
      }),
  })),
)

// 3. devtools 中间件：Redux DevTools 集成
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 }), false, 'increment'),
    }),
    { name: 'my-store' },
  ),
)
```

### 3. Jotai 原子化模型

Jotai 的原子化模型（Atomic State Management）底层基于**有向无环图（DAG）**的依赖追踪与响应式更新机制。核心思想是将状态拆分为最小粒度的独立单元（Atom），通过自动化依赖收集实现精确的组件重渲染。

#### 3.1 Atom 作为基本单元

每个 atom 代表一个独立的状态节点：

- **原始 Atom（Primitive Atom）**：持有实际值（数字、字符串、对象等），类似 Redux 中的单个 state 字段，但完全独立，无需预定义全局 Store 结构
- **派生 Atom（Derived Atom）**：不持有直接值，通过读取其他 Atom 计算得出，类似电子表格中的公式单元格

#### 3.2 依赖追踪与 DAG

Jotai 核心引擎维护一个隐式的依赖图：

```
DAG 依赖图结构：
┌─────────────────────────────────────────────────────────┐
│  节点：每个 Atom 是图中的一个节点                         │
│  边：如果 Atom B 读取了 Atom A（通过 get(a)），           │
│       则存在一条从 A 指向 B 的依赖边                      │
│  无环性：依赖关系不能形成闭环，保证状态更新的确定性         │
│                                                         │
│  示例：                                                  │
│  countAtom ──→ doubleAtom ──→ labelAtom                │
│       │                        ↑                        │
│       └────────────────────────┘                        │
│  （countAtom 变化 → doubleAtom 重算 → labelAtom 重算）   │
└─────────────────────────────────────────────────────────┘
```

当组件使用 `useAtom` 或 `useAtomValue` 订阅某个 Atom 时，Jotai 在内部记录该组件与该 Atom 的订阅关系。

#### 3.3 响应式更新流程

当某个原始 Atom 的值发生变化时，Jotai 的执行流程：

```
更新传播流程：
1. 标记脏节点 → 被修改的 Atom 标记为 dirty
2. 拓扑传播 → 沿依赖图向下遍历，找到所有依赖该 Atom 的派生 Atom
3. 惰性求值（Lazy Evaluation）→
   ├── 派生 Atom 不会立即重新计算，除非有组件正在订阅它
   └── 如果组件订阅了派生 Atom，检查其依赖是否变化，只有真正变化时才重新执行
4. 精确重渲染 →
   ├── 只有直接订阅了变化 Atom 的组件才触发重渲染
   └── 未订阅的组件完全不受影响（即使在同一组件树中）
```

这与 Redux 或 Context API 不同——后者往往需要手动优化或使用 selector 来避免不必要的渲染。

#### 3.4 代码示例

```typescript
// Jotai：原子化状态管理
import { atom, useAtom, useAtomValue } from 'jotai';

// 基础 atom
const countAtom = atom(0);
const nameAtom = atom('Jotai');

// 派生 atom（只读）
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 可写派生 atom
const incrementAtom = atom(
  (get) => get(countAtom),
  (get, set, value: number) => {
    set(countAtom, get(countAtom) + value);
  }
);

// 异步 atom
const userAtom = atom(async (get) => {
  const token = get(tokenAtom);
  if (!token) return null;
  return await fetchUser(token);
});

// 组件使用
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom); // 只读
  return (
    <div>
      <p>{count} (double: {doubleCount})</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}

// Jotai 核心优势：
// ├── 原子化：每个状态独立（无全局 store）
// ├── 精确更新：只有使用特定 atom 的组件重渲染
// ├── 无 Provider 也可以（默认使用全局 scope）
// └── 组合性强：atom 可以组合其他 atom
```

#### 3.5 读写分离机制

Jotai 的 atom 天然将「读」和「写」分离为两个独立函数，这是其精确更新的关键：

```
读写分离架构：
┌──────────────────────────────────────────────────────────┐
│  atom(readFn, writeFn)                                    │
│                                                           │
│  readFn(get) → 声明依赖 + 返回值                          │
│  ├── 每次 get(atomA) 都注册一条依赖边                      │
│  ├── 返回值被缓存，依赖未变时直接返回                       │
│  └── 组件通过 useAtomValue 消费，只在返回值变化时重渲染     │
│                                                           │
│  writeFn(get, set, ...args) → 修改其他 atom               │
│  ├── 可以 set 任意 atom（不限于自身）                      │
│  ├── set 触发目标 atom 的依赖传播                          │
│  └── 组件通过 useAtom 的 [_, setter] 消费                 │
│                                                           │
│  关键：read 和 write 互不干扰                              │
│  ├── 只读 atom：atom((get) => ...)  ← 派生 atom          │
│  ├── 只写 atom：atom(null, (get, set, v) => ...)         │
│  └── 读写 atom：atom((get) => ..., (get, set, v) => ...) │
└──────────────────────────────────────────────────────────┘
```

```typescript
// 读写分离的实际应用

// 1. 只读派生：自动追踪依赖，值变化才重算
const filterAtom = atom<'all' | 'done' | 'active'>('all')
const itemsAtom = atom<Item[]>([])
const filteredAtom = atom((get) => {
  const filter = get(filterAtom)
  const items = get(itemsAtom)
  // get() 同时注册了对 filterAtom 和 itemsAtom 的依赖
  return filter === 'all' ? items : items.filter(i =>
    filter === 'done' ? i.done : !i.done
  )
})

// 2. 可写派生：通过 set 间接修改源 atom
const toggleAllAtom = atom(
  null, // 无 read 函数 → 不可读
  (get, set) => {
    const items = get(itemsAtom)
    const allDone = items.every(i => i.done)
    set(itemsAtom, items.map(i => ({ ...i, done: !allDone })))
  }
)

// 3. 组件消费：读写分离
function TodoList() {
  const filtered = useAtomValue(filteredAtom)   // 只读 → 精确订阅
  const [, toggleAll] = useAtom(toggleAllAtom)  // 只写 → 不触发重渲染
  return <div>...</div>
}

// 4. 与 Zustand 对比：
// Zustand: store.setState({ items: [...] })  → 整个 store 通知所有 listener
// Jotai:   set(itemsAtom, [...])             → 只沿 itemsAtom 的 DAG 边传播
//          未订阅 itemsAtom 的组件完全不受影响
```

#### 3.6 Atom Scope 与 Provider

Jotai 默认使用全局 scope（无需 Provider），但也支持通过 `Provider` 实现作用域隔离：

```typescript
import { Provider, useAtom } from 'jotai'

// 全局 scope（默认）—— 所有组件共享同一份 atom 值
const countAtom = atom(0)
function App() {
  return <Counter /> // 读写全局 countAtom
}

// Provider scope —— 组件树内的 atom 值独立于外部
function ScopedApp() {
  return (
    <Provider> {/* 创建新的 scope */}
      <Counter /> {/* 这个 Counter 的 countAtom 与全局完全隔离 */}
    </Provider>
  )
}

// 使用场景：
// ├── 默认全局 scope：简单应用，无需包裹 Provider
// ├── 嵌套 Provider：微前端、多实例组件（如多个独立购物车）
// └── 测试隔离：单元测试中用 Provider 隔离 atom 状态
```

### 4. 选型决策

```
选型决策树：

Q: 应用状态复杂度？
├── 简单（< 10 个状态） → Zustand（最简单）
├── 中等（10-50 个状态） → Zustand（中间件丰富）
└── 复杂（> 50 个状态，频繁交叉依赖）
    ├── 需要细粒度更新 → Jotai（原子化）
    └── 需要时间旅行调试 → Redux Toolkit

Q: 需要持久化？
├── 是 → Zustand + persist 中间件
└── 否 → 两者都可以

Q: 服务端状态为主？
├── 是 → TanStack Query（不需要客户端状态管理）
└── 否 → Zustand / Jotai
```

---

## 派生状态深度对比（Derived State）

> 派生状态是指**不直接存储、而是从已有状态计算得出**的值。类似 Vue 的 `computed`、Redux 的 `createSelector`。核心挑战是**缓存与精确更新**——只有依赖变化时才重新计算。

### 1. Zustand 派生状态

Zustand 本身不提供内置 computed 机制，需要通过不同模式实现：

```typescript
// ═══ 模式一：selector 函数（最常用）═══
// selector 函数每次渲染都会执行，但 Zustand 内部通过 Object.is 比较返回值，
// 只有返回值真正变化时才触发重渲染（相当于轻量 memo）
const useItemStore = create((set) => ({
  items: [],
  taxRate: 0.13,
}))

function CartTotal() {
  const withTax = useItemStore((s) => {
    const subtotal = s.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    return subtotal * (1 + s.taxRate)
  })
  return <span>总计: ¥{withTax.toFixed(2)}</span>
}

// ═══ 模式二：subscribeWithSelector 中间件（推荐）═══
// 提供 memo 化的 selector，只在派生值真正变化时通知
import { createStore } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const store = createStore(
  subscribeWithSelector((set) => ({
    items: [],
    taxRate: 0.13,
  }))
)

// 外部 memo 化计算
const selectSubtotal = (s) =>
  s.items.reduce((sum, i) => sum + i.price * i.qty, 0)
const selectTotalWithTax = (s) => selectSubtotal(s) * (1 + s.taxRate)

// 订阅时自动做 Object.is 比较，值不变不触发
const unsub = store.subscribe(selectTotalWithTax, (total) => {
  console.log('总价变化:', total)
})

// ═══ 模式三：在 store 内存储派生值（反模式 ⚠️）═══
// ❌ 不推荐：手动同步派生值容易出错
const useBadStore = create((set) => ({
  items: [],
  taxRate: 0.13,
  total: 0, // 需要手动在 addItem 时同步更新
  addItem: (item) =>
    set((s) => ({
      items: [...s.items, item],
      total: s.total + item.price * item.qty, // 手动维护，易遗漏
    })),
}))

// ═══ 模式四：外部 computed 库（zustand-computed）═══
import { computed } from 'zustand-computed'

const useComputedStore = create(
  computed((set) => ({
    items: [],
    taxRate: 0.13,
  }), {
    // 声明计算属性和依赖，自动 memo
    subtotal: (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    totalWithTax: (s) => s.subtotal * (1 + s.taxRate),
  })
)
```

### 2. Jotai 派生 atom

Jotai 的派生是**一等公民**——通过 `atom((get) => ...)` 声明，自动追踪依赖并缓存：

```typescript
import { atom, useAtom, useAtomValue } from 'jotai'

// ═══ 基础派生（只读）═══
const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2) // 自动追踪 countAtom

// ═══ 多级派生链 ═══
const countAtom2 = atom(0)
const doubleAtom2 = atom((get) => get(countAtom2) * 2)
const quadAtom = atom((get) => get(doubleAtom2) * 2)       // 依赖 doubleAtom
const labelAtom = atom((get) => `当前: ${get(quadAtom)}`)   // 依赖 quadAtom
// 依赖链: countAtom → doubleAtom → quadAtom → labelAtom
// 只有 countAtom 变化时，整条链才会重新计算

// ═══ 可写派生 atom ═══
const filterAtom = atom('all')
const itemsAtom = atom([])
const filteredItemsAtom = atom(
  (get) => {
    const filter = get(filterAtom)
    const items = get(itemsAtom)
    switch (filter) {
      case 'done': return items.filter(i => i.done)
      case 'active': return items.filter(i => !i.done)
      default: return items
    }
  },
  (get, set, newItems) => {
    // 可写派生：同时更新源 atom
    set(itemsAtom, newItems)
  }
)

// ═══ 异步派生 atom ═══
const userIdAtom = atom(1)
const userAtom = atom(async (get) => {
  const id = get(userIdAtom)
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})
// 自动处理：userIdAtom 变化 → 重新 fetch → Suspense 自动挂起

// ═══ 组件使用 ═══
function Dashboard() {
  const label = useAtomValue(labelAtom)   // 只读派生
  const [filtered, setFiltered] = useAtom(filteredItemsAtom) // 可写派生
  const user = useAtomValue(userAtom)     // 异步派生（配合 Suspense）
  return <div>{label}</div>
}
```

**Jotai 派生的核心优势**：

```
依赖追踪机制：
┌─────────────────────────────────────────────────┐
│  atom((get) => ...) 执行时：                      │
│  1. get(atomA) → 注册对 atomA 的依赖              │
│  2. get(atomB) → 注册对 atomB 的依赖              │
│  3. atomA 或 atomB 变化 → 自动重新执行计算函数     │
│  4. 结果缓存 → 如果依赖未变，直接返回缓存值        │
│                                                   │
│  等价于 Vue 的 computed({ get() { ... } })         │
└─────────────────────────────────────────────────┘
```

### 3. Redux createSelector（Reselect）

Redux 通过 `createSelector` 实现 memo 化派生：

```typescript
import { createSelector } from '@reduxjs/toolkit'

// 输入 selector（从 store 取数据）
const selectItems = (state) => state.cart.items
const selectTaxRate = (state) => state.cart.taxRate

// 输出 selector（memo 化计算）
const selectSubtotal = createSelector(
  [selectItems],
  (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0)
)

const selectTotalWithTax = createSelector(
  [selectSubtotal, selectTaxRate],
  (subtotal, taxRate) => subtotal * (1 + taxRate)
)

// createSelector 的 memo 机制：
// ├── 输入 selector 返回值未变 → 直接返回上次结果（=== 比较）
// ├── 任一输入变化 → 重新执行 resultFn
// └── 支持自定义 equalityChecker

// 组件使用
import { useSelector } from 'react-redux'

function CartTotal() {
  const total = useSelector(selectTotalWithTax) // memo 化，不重复计算
  return <span>¥{total.toFixed(2)}</span>
}
```

### 4. 三种派生模式对比

| 维度         | Zustand                        | Jotai                 | Redux (Reselect)                     |
| ------------ | ------------------------------ | --------------------- | ------------------------------------ |
| 底层原理     | 发布-订阅 + selector 过滤      | DAG 依赖图 + 惰性求值 | 单一数据流 + reducer 纯函数          |
| 语法         | selector 函数 / 中间件         | `atom((get) => ...)`  | `createSelector([inputs], resultFn)` |
| 自动依赖追踪 | ❌ 手动声明                    | ✅ get() 自动收集     | ❌ 手动声明输入 selector             |
| 缓存机制     | subscribeWithSelector / 外部库 | 内置（atom 级别）     | createSelector 内置 memo             |
| 多级派生     | 手动组合                       | 声明式链式组合        | createSelector 嵌套                  |
| 异步派生     | 自行处理                       | 原生支持 + Suspense   | createAsyncThunk                     |
| 可写派生     | set() 函数内处理               | atom(get, set) 双参数 | 不支持（必须 dispatch action）       |
| 性能开销     | 低（selector 简单）            | 极低（atom 粒度）     | 中（需维护 memo 缓存）               |

### 5. 派生状态性能陷阱

```typescript
// ❌ 陷阱一：Zustand 组件内复杂 selector 无缓存
function Expensive() {
  // 每次渲染都重新计算 O(n) 操作
  const result = useStore((s) => s.items.filter(expensiveFilter))
  // ✅ 修复：提取到外部 + useMemo
}
const selectFiltered = (s) => s.items.filter(expensiveFilter)
function ExpensiveFixed() {
  const result = useStore(selectFiltered) // selector 引用稳定，subscribeWithSelector 会 memo
}

// ❌ 陷阱二：Jotai 派生 atom 中触发副作用
const badAtom = atom((get) => {
  fetch('/api/data') // ⚠️ 每次依赖变化都发请求
  return get(dataAtom)
})
// ✅ 修复：异步 atom 正确处理
const goodAtom = atom(async (get) => {
  const id = get(idAtom)
  return fetch(`/api/data/${id}`).then((r) => r.json())
})

// ❌ 陷阱三：Redux selector 未 memo 化
function MyComp() {
  // 每次渲染创建新 selector 函数 → memo 失效
  const val = useSelector((s) => s.items.filter((x) => x.active))
  // ✅ 修复：提取到组件外部
}
const selectActiveItems = createSelector([(s) => s.items], (items) => items.filter((x) => x.active))
```

---

## 高频面试题

### Q1: Zustand 的更新机制是什么？

**参考答案要点**：

- 基于发布-订阅模式：store 内部维护一个 `Set<listener>` 订阅者集合
- `setState(partial)` 先通过 `Object.assign` 浅合并状态，生成新的 state 引用
- 然后无差别广播通知所有 listener（`listeners.forEach(fn => fn())`）
- React 组件通过 `selector` 函数精确订阅：listener 触发后执行 `selector(getState())`
- 用 `Object.is` 比较 selector 返回值，只有值真正变化时才 `forceUpdate` 触发重渲染
- 不需要 Provider（store 是模块级闭包，全局单例）
- 中间件采用洋葱模型（类似 Koa），`devtools(persist(immer(fn)))` 层层包裹增强
- 性能关键：selector 必须提取到模块顶层保持引用稳定，否则 useEffect 依赖变化导致反复重新订阅

### Q2: Jotai 的原子化模型有什么优势？

**参考答案要点**：

- 底层基于 DAG（有向无环图）的依赖追踪，每个 atom 是图中的一个节点
- 派生 atom 通过 `get()` 自动注册依赖边，无需手动声明
- 响应式更新采用惰性求值 + 拓扑传播：脏节点标记 → 沿 DAG 边传播 → 只在组件订阅时重算
- 精确更新：只有直接订阅了变化 atom 的组件才重渲染，未订阅的完全不受影响
- 读写分离：read 函数声明依赖并缓存，write 函数通过 set 触发精确传播
- 组合性强：atom 可以组合其他 atom，支持多级派生链、异步派生、可写派生
- 无全局 store，状态按最小粒度拆分，适合状态交叉依赖多的复杂场景

### Q3: 如何选型 Zustand vs Jotai？

**参考答案要点**：

- Zustand：单一 store、中间件丰富、学习成本低、适合大多数场景
- Jotai：原子化、细粒度更新、适合状态交叉依赖多的场景
- 简单规则：状态少选 Zustand，状态多选 Jotai，服务端状态选 TanStack Query

### Q4: 三种方案的派生状态机制有何差异？

**参考答案要点**：

- **Zustand**：无内置 computed，通过 selector 函数实时计算；`subscribeWithSelector` 中间件提供 memo 化；也可用 `zustand-computed` 外部库声明式派生
- **Jotai**：派生是一等公民，`atom((get) => ...)` 自动追踪依赖并缓存，支持多级链式派生、异步派生、可写派生，机制最接近 Vue 的 `computed`
- **Redux**：通过 `createSelector`（Reselect）实现 memo 化派生，需手动声明输入 selector，缓存基于 `===` 比较
- **关键差异**：Jotai 自动依赖追踪 > Redux createSelector 手动声明 > Zustand 无内置方案
- **常见陷阱**：组件内创建匿名 selector 导致 memo 失效；派生函数中触发副作用

---

## 延伸思考

1. **设计题**：为一个大型 SaaS 应用设计状态管理架构（客户端状态 + 服务端状态）。
2. **场景题**：Zustand store 中某个字段频繁更新导致大量组件重渲染，如何优化？
3. **对比题**：Zustand vs Redux Toolkit vs Jotai vs Valtio，2026 年如何选择？
4. **派生题**：购物车场景——商品列表 + 折扣规则 + 税率，分别用 Zustand / Jotai / Redux 实现派生总价，分析各自的缓存策略与性能差异。

---

## 参考资料

- [Zustand 文档](https://docs.zustand.pmnd.rs)
- [Jotai 文档](https://jotai.org)
- [Zustand 源码](https://github.com/pmndrs/zustand)
