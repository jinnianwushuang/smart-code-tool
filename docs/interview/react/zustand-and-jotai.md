---
title: 'Zustand/Jotai 状态管理深度 [P6-P7]'
level: 'senior'
tags: ['Zustand', 'Jotai', 'React', '状态管理', '原子化']
difficulty: 'hard'
updated: '2026-10-07'
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

### 2. Zustand 中间件体系

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

```typescript
// Jotai：原子化状态管理（类似 Recoil 但更简单）
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

// Jotai 核心优势（派生 atom 详见下方「派生状态深度对比」章节）：
// ├── 原子化：每个状态独立（无全局 store）
// ├── 精确更新：只有使用特定 atom 的组件重渲染
// ├── 无 Provider 也可以（默认使用全局 scope）
// └── 组合性强：atom 可以组合其他 atom
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

- 基于发布-订阅模式（listeners Set）
- setState 合并状态后通知所有 listener
- React 组件通过 selector 精确订阅（Object.is 比较）
- 只有 selector 返回值变化时才触发组件重渲染
- 不需要 Provider（store 是全局单例）

### Q2: Jotai 的原子化模型有什么优势？

**参考答案要点**：

- 每个 atom 独立，无全局 store
- 派生 atom 自动追踪依赖（类似 computed）
- 精确更新：只有使用特定 atom 的组件重渲染
- 组合性强：atom 可以组合其他 atom
- 适合状态交叉依赖多的复杂场景

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
