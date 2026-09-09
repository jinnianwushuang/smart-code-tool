---
title: 'Zustand/Jotai 状态管理深度 [P6-P7]'
level: 'senior'
tags: ['Zustand', 'Jotai', 'React', '状态管理', '原子化']
difficulty: 'hard'
updated: '2026-09-10'
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
import { atom, useAtom } from 'jotai';

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

---

## 延伸思考

1. **设计题**：为一个大型 SaaS 应用设计状态管理架构（客户端状态 + 服务端状态）。
2. **场景题**：Zustand store 中某个字段频繁更新导致大量组件重渲染，如何优化？
3. **对比题**：Zustand vs Redux Toolkit vs Jotai vs Valtio，2026 年如何选择？

---

## 参考资料

- [Zustand 文档](https://zustand-demo.pmnd.rs)
- [Jotai 文档](https://jotai.org)
- [Zustand 源码](https://github.com/pmndrs/zustand)
