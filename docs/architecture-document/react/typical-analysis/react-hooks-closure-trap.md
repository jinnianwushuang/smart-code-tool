---
title: 'React Hooks 闭包陷阱与依赖追踪原理'
tags: ['React', 'Hooks', '闭包', '依赖追踪', '底层原理']
---

# React Hooks 闭包陷阱与依赖追踪原理

> 本文从 JavaScript 闭包本质出发，深入拆解 React Hooks 的闭包陷阱成因、依赖数组机制、Hooks 链表数据结构、useEffect/useCallback/useMemo 的依赖追踪原理、useRef 打破闭包的方法，以及与 Vue 响应式系统的根本差异。

---

## 一、闭包陷阱的根源

### 1.1 函数组件的本质

```
函数组件每次渲染都是一次独立的函数调用：

// 第 1 次渲染（count = 0）
function Counter() {
  const count = 0;  // 本次渲染的局部变量
  const handleClick = () => console.log(count); // 闭包捕获 count = 0
  return <button onClick={handleClick}>{count}</button>;
}

// 第 2 次渲染（count = 1）
function Counter() {
  const count = 1;  // 新的局部变量（与上次完全独立）
  const handleClick = () => console.log(count); // 闭包捕获 count = 1
  return <button onClick={handleClick}>{count}</button>;
}

// 第 3 次渲染（count = 2）
function Counter() {
  const count = 2;  // 又一个新的局部变量
  const handleClick = () => console.log(count); // 闭包捕获 count = 2
  return <button onClick={handleClick}>{count}</button>;
}

关键认知：
  • 每次渲染都有自己的 props 和 state（"每次渲染都有独立的 props"）
  • 函数内部的变量/函数都是该次渲染的"快照"
  • 闭包捕获的是创建时的值，不是最新值
```

### 1.2 经典闭包陷阱

```
// ❌ 经典陷阱：setTimeout 中读到旧值
function Counter() {
  const [count, setCount] = useState(0);

  const showAlert = () => {
    setTimeout(() => {
      alert(`count: ${count}`); // 永远弹出创建时的 count 值
    }, 3000);
  };

  return <button onClick={showAlert}>Show</button>;
}

// 执行流程：
// ① 用户点击按钮（count = 0）→ showAlert 被调用
//    → setTimeout 注册回调，闭包捕获 count = 0
// ② 用户在 3 秒内点击增加按钮 → count 变为 1 → 触发重新渲染
// ③ 新的渲染创建了新的 showAlert（闭包捕获 count = 1）
// ④ 但旧的 setTimeout 回调仍然引用旧的 showAlert（count = 0）
// ⑤ 3 秒后 → alert 弹出 "count: 0"（旧值）

// 这不是 React 的 bug，而是 JavaScript 闭包的正确行为
// React 函数组件的设计决定了每次渲染都是独立的闭包
```

### 1.3 为什么类组件没有这个问题？

```
// 类组件：this 是可变引用
class Counter extends React.Component {
  showAlert = () => {
    setTimeout(() => {
      alert(`count: ${this.state.count}`); // 读到最新值
    }, 3000);
  };

  render() {
    return <button onClick={this.showAlert}>Show</button>;
  }
}

// 原因：
// • this 指向组件实例（单例）
// • this.state 是可变的（setState 修改同一个对象）
// • setTimeout 回调通过 this 引用 → 读到最新的 state

// 对比函数组件：
// • 没有 this，每次渲染都是独立的函数作用域
// • state 是不可变的（每次渲染都是新的局部变量）
// • 闭包捕获的是创建时的值
```

---

## 二、依赖数组机制

### 2.1 useEffect 依赖数组原理

```
// useEffect 的简化实现（React 源码核心逻辑）
function useEffect(create, deps) {
  // 获取当前 Fiber 节点
  const fiber = currentlyRenderingFiber;

  // 获取或创建 Hook 对象
  const hook = getOrCreateHook(fiber);

  if (deps !== undefined) {
    // 有依赖数组 → 对比新旧依赖
    const prevDeps = hook.memoizedState?.deps;

    if (areDepsEqual(prevDeps, deps)) {
      // 依赖未变 → 跳过（不重新执行 effect）
      return;
    }
  }

  // 依赖变了（或首次执行）→ 注册 effect
  hook.memoizedState = { create, deps };

  // 标记副作用 → Commit 阶段执行
  pushEffect(fiber, { create, deps, destroy: hook.destroy });
}

// 依赖对比算法（Object.is）
function areDepsEqual(prevDeps, nextDeps) {
  if (prevDeps === null || nextDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false; // 任一依赖变化 → 重新执行
    }
  }
  return true; // 所有依赖相同 → 跳过
}
```

### 2.2 依赖数组的三种用法

```
用法一：不传依赖数组
useEffect(() => {
  // 每次渲染后都执行
  // 等同于 class 的 componentDidUpdate
});

用法二：空依赖数组
useEffect(() => {
  // 只在挂载时执行一次
  // 等同于 class 的 componentDidMount
}, []);

用法三：指定依赖
useEffect(() => {
  // count 变化时执行
  console.log(count);
}, [count]);

// ⚠️ 关键：依赖数组是"契约"
// 你告诉 React "这个 effect 依赖这些值"
// 如果遗漏依赖 → effect 读到的是旧闭包值
```

### 2.3 遗漏依赖的后果

```
// ❌ 错误：遗漏 count 依赖
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // 闭包捕获 count = 0 → 永远设为 1
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 遗漏了 count

  return <div>{count}</div>;
}

// 执行流程：
// ① 首次渲染 → count = 0
// ② useEffect 执行 → setInterval 注册
//    → 回调闭包捕获 count = 0
// ③ 每秒执行 → setCount(0 + 1) → count 变为 1
// ④ 重新渲染 → 但 useEffect 不重新执行（deps = []）
// ⑤ setInterval 回调仍然引用旧闭包（count = 0）
// ⑥ 每秒都执行 setCount(0 + 1) → count 永远为 1

// ✅ 正确方案一：添加依赖
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(timer);
}, [count]); // 每次 count 变化 → 清除旧 interval → 创建新 interval

// ✅ 正确方案二：使用函数式更新（推荐）
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1); // 不依赖外部 count
  }, 1000);
  return () => clearInterval(timer);
}, []); // 无需依赖

// ✅ 正确方案三：使用 useRef
const countRef = useRef(0);
useEffect(() => {
  const timer = setInterval(() => {
    countRef.current += 1;
    setCount(countRef.current);
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 三、Hooks 链表数据结构

### 3.1 Fiber 上的 Hooks 链表

```
Fiber Node
└── memoizedState → Hook 对象（链表头）
                      │
                      ▼
                   Hook {
                     memoizedState: 当前值（useState 的值 / useEffect 的 effect 对象）
                     queue: 更新队列（useState 的 dispatch）
                     next: 下一个 Hook 对象
                   }
                      │
                      ▼
                   Hook { ... }  // 第二个 Hook
                      │
                      ▼
                   Hook { ... }  // 第三个 Hook
                      │
                      ▼
                   null

// 关键：Hooks 链表顺序必须稳定
// React 通过调用顺序（index）来匹配 Hook 对象
// 这就是为什么 Hooks 不能在条件/循环中调用
```

### 3.2 useState 的更新队列

```
// useState 简化实现
function useState(initialState) {
  const fiber = currentlyRenderingFiber;
  const hook = getOrCreateHook(fiber);

  if (isFirstRender) {
    // 首次渲染：初始化
    hook.memoizedState = initialState;
    hook.queue = { pending: null };
  }

  // 处理更新队列
  let state = hook.memoizedState;
  let update = hook.queue.pending;

  if (update !== null) {
    // 有待处理的更新 → 逐个计算新状态
    do {
      const action = update.action;
      state = typeof action === 'function'
        ? action(state)  // 函数式更新
        : action;         // 直接值
      update = update.next;
    } while (update !== hook.queue.pending);

    hook.queue.pending = null; // 清空队列
    hook.memoizedState = state; // 保存新状态
  }

  // 返回 [当前状态, dispatch 函数]
  const dispatch = (action) => {
    const update = { action, next: null };

    // 插入到环形链表
    if (hook.queue.pending === null) {
      update.next = update; // 环形：自己指向自己
    } else {
      update.next = hook.queue.pending.next;
      hook.queue.pending.next = update;
    }
    hook.queue.pending = update;

    // 调度重新渲染
    scheduleUpdateOnFiber(fiber, DefaultLane);
  };

  return [state, dispatch];
}
```

### 3.3 Hooks 调用顺序必须稳定

```
// ❌ 错误：条件调用 Hooks
function App({ condition }) {
  if (condition) {
    const [name, setName] = useState('Alice'); // Hook #1
  }
  const [age, setAge] = useState(25); // Hook #2 或 Hook #1？

  // 问题：
  // condition = true  → Hooks 链表：[name] → [age]
  // condition = false → Hooks 链表：[age]
  // React 按 index 匹配 → age 被错误地匹配到 name 的位置
}

// ✅ 正确：始终按相同顺序调用
function App({ condition }) {
  const [name, setName] = useState('Alice'); // Hook #1（始终调用）
  const [age, setAge] = useState(25);        // Hook #2（始终调用）

  // 可以根据条件使用值，但不能条件调用 Hook
  const displayName = condition ? name : 'Anonymous';
}
```

---

## 四、useRef — 打破闭包的利器

### 4.1 useRef 的本质

```
// useRef 简化实现
function useRef(initialValue) {
  const fiber = currentlyRenderingFiber;
  const hook = getOrCreateHook(fiber);

  if (isFirstRender) {
    // 首次渲染：创建 ref 对象
    hook.memoizedState = { current: initialValue };
  }

  // 返回同一个 ref 对象（每次渲染都返回同一个引用）
  return hook.memoizedState;
}

// 关键：
// • ref 对象在组件整个生命周期内保持不变
// • 修改 ref.current 不会触发重新渲染
// • ref.current 是"可变引用"（类似类组件的 this）
```

### 4.2 useRef 解决闭包陷阱

```
// ✅ 使用 useRef 保存最新值
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 每次渲染时同步 ref 到最新值
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const showAlert = () => {
    setTimeout(() => {
      alert(`count: ${countRef.current}`); // 读到最新值
    }, 3000);
  };

  return (
    <>
      <div>{count}</div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={showAlert}>Show</button>
    </>
  );
}

// 原理：
// • countRef 对象在组件生命周期内保持不变
// • countRef.current 是可变的（每次渲染同步最新值）
// • setTimeout 闭包捕获的是 countRef（同一个对象引用）
// • 访问 countRef.current 时读到的是最新值
```

### 4.3 自定义 Hook：useLatest

```
// 通用方案：useLatest（始终保持最新值的 ref）
function useLatest(value) {
  const ref = useRef(value);

  // 每次渲染后同步最新值
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const latestCount = useLatest(count);

  const showAlert = () => {
    setTimeout(() => {
      alert(`count: ${latestCount.current}`); // 始终最新
    }, 3000);
  };

  return <button onClick={showAlert}>Show</button>;
}
```

---

## 五、useCallback / useMemo 依赖追踪

### 5.1 useCallback 原理

```
// useCallback 简化实现
function useCallback(callback, deps) {
  const fiber = currentlyRenderingFiber;
  const hook = getOrCreateHook(fiber);

  if (isFirstRender || !areDepsEqual(hook.memoizedState?.deps, deps)) {
    // 首次渲染 或 依赖变化 → 创建新的回调
    hook.memoizedState = { callback, deps };
  }

  // 返回缓存的回调（依赖未变则返回旧回调）
  return hook.memoizedState.callback;
}

// 用途：缓存函数引用，避免子组件不必要的重新渲染
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // count 变化时才创建新函数
```

### 5.2 useMemo 原理

```
// useMemo 简化实现
function useMemo(factory, deps) {
  const fiber = currentlyRenderingFiber;
  const hook = getOrCreateHook(fiber);

  if (isFirstRender || !areDepsEqual(hook.memoizedState?.deps, deps)) {
    // 首次渲染 或 依赖变化 → 重新计算
    hook.memoizedState = {
      value: factory(), // 执行工厂函数
      deps,
    };
  }

  // 返回缓存的值
  return hook.memoizedState.value;
}

// 用途：缓存计算结果，避免每次渲染都重新计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]); // a 或 b 变化时才重新计算
```

### 5.3 什么时候不需要 useCallback/useMemo？

```
不需要缓存的场景：

① 子组件没有用 React.memo 包裹
   → 父组件重新渲染 → 子组件必然重新渲染
   → 缓存函数引用没有意义

② 计算开销很小
   → useMemo 本身的对比开销 > 重新计算的开销
   → 得不偿失

③ 值在每次渲染都需要重新计算
   → 缓存反而导致读到旧值

需要缓存的场景：

① 子组件用 React.memo 包裹
   → 缓存函数引用 → 避免子组件不必要的重新渲染

② 计算开销很大（如大数组排序、复杂过滤）
   → useMemo 缓存结果 → 避免重复计算

③ 作为其他 Hook 的依赖
   → useEffect(fn, [callback]) → callback 变化会导致 effect 重新执行
   → 用 useCallback 稳定引用
```

---

## 六、useEffect vs useLayoutEffect

### 6.1 执行时机对比

```
useEffect（异步、被动效果）：
┌──────────────────────────────────────────────────────────┐
│  Render → Commit（DOM 操作）→ 浏览器绘制 → useEffect     │
│                                                          │
│  • 在浏览器绘制后异步执行                                 │
│  • 不阻塞浏览器绘制                                       │
│  • 适合：数据请求、订阅、日志                             │
│  • 用户可能先看到旧 UI，再看到新 UI（闪烁）               │
└──────────────────────────────────────────────────────────┘

useLayoutEffect（同步、布局效果）：
┌──────────────────────────────────────────────────────────┐
│  Render → Commit（DOM 操作）→ useLayoutEffect → 浏览器绘制│
│                                                          │
│  • 在 DOM 操作后、浏览器绘制前同步执行                    │
│  • 阻塞浏览器绘制                                         │
│  • 适合：测量 DOM 尺寸、同步修改 DOM                      │
│  • 用户看到的是最终 UI（无闪烁）                          │
└──────────────────────────────────────────────────────────┘
```

### 6.2 使用场景

```
// useLayoutEffect：测量 DOM 并同步调整
function Tooltip({ text }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // 在浏览器绘制前测量 DOM 尺寸
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom,
      left: rect.left,
    });
  }, [text]);

  return (
    <div ref={ref} style={position}>
      {text}
    </div>
  );
}

// useEffect：异步数据请求
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 在浏览器绘制后异步请求
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}
```

---

## 七、与 Vue 响应式系统的根本差异

```
┌─────────────────────────────────────────────────────────────┐
│              React Hooks vs Vue 响应式                        │
│                                                              │
│  React Hooks                    Vue 3 响应式                  │
│  ───────────                    ──────────                   │
│                                                              │
│  每次渲染创建新闭包              Proxy 拦截读写               │
│  └── 值被"冻结"在渲染时刻      └── 始终访问最新值            │
│                                                              │
│  手动声明依赖（deps 数组）       自动追踪依赖                 │
│  └── 遗漏依赖 → bug            └── 无需关心依赖列表          │
│                                                              │
│  不可变数据（useState）          可变数据（ref/reactive）     │
│  └── setState(prev => prev+1)  └── count.value++            │
│                                                              │
│  函数式思维                      面向对象思维                 │
│  └── 每次渲染都是纯函数        └── 组件实例持续存在          │
│                                                              │
│  闭包陷阱：普遍问题              闭包陷阱：不存在             │
│  └── setTimeout 读到旧值        └── setTimeout 读到最新值    │
│                                                              │
│  根本原因：                                                    │
│  React 每次渲染都是独立的函数调用                              │
│  Vue 组件实例持续存在，响应式系统追踪属性变化                  │
└─────────────────────────────────────────────────────────────┘
```

### 7.1 相同逻辑的两种实现

```
// React：闭包陷阱
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // ❌ 闭包捕获 count = 0
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 遗漏 count 依赖

  return <div>{count}</div>;
}

// Vue：无闭包问题
<template>
  <div>{{ count }}</div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

// 无需依赖数组，自动追踪 count
const timer = setInterval(() => {
  count.value++; // ✅ 始终访问最新值
}, 1000);

onUnmounted(() => clearInterval(timer));
</script>
```

---

## 八、高频面试题

### 8.1 为什么 React Hooks 不能在条件语句中调用？

```
原因：React 通过调用顺序（index）来匹配 Hooks 链表中的节点

组件代码：
  useState()    → Hook #0
  useEffect()   → Hook #1
  useState()    → Hook #2

如果条件调用：
  if (condition) {
    useState()  → 有时是 Hook #0，有时不存在
  }
  useEffect()   → 有时是 Hook #1，有时是 Hook #0

React 按 index 匹配 → 类型不匹配 → 崩溃

解决方案：
  • ESLint 规则：react-hooks/rules-of-hooks
  • 始终在顶层调用 Hooks（不在条件/循环/嵌套函数中）
```

### 8.2 useEffect 和 useLayoutEffect 有什么区别？

```
useEffect：
  • 在浏览器绘制后异步执行
  • 不阻塞渲染
  • 适合：数据请求、订阅、日志
  • 可能出现"闪烁"（先看到旧 UI，再看到新 UI）

useLayoutEffect：
  • 在 DOM 操作后、浏览器绘制前同步执行
  • 阻塞渲染
  • 适合：测量 DOM、同步修改 DOM
  • 无闪烁（用户看到最终 UI）

选择原则：
  • 默认用 useEffect
  • 只有需要同步测量/修改 DOM 时才用 useLayoutEffect
```

### 8.3 如何避免 React Hooks 的闭包陷阱？

```
方案一：正确声明依赖
  useEffect(() => { ... }, [count]); // 列出所有依赖

方案二：使用函数式更新
  setCount(prev => prev + 1); // 不依赖外部 count

方案三：使用 useRef
  const countRef = useRef(count);
  countRef.current = count; // 每次渲染同步最新值

方案四：使用 useReducer
  // 将状态逻辑提取到 reducer，减少闭包依赖

方案五：使用 useEvent（实验性 API）
  // 始终读到最新的 props/state，无需依赖数组
```

---

## 参考资料

- [React Hooks 官方文档](https://react.dev/reference/react)
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [React 源码 Hooks 实现](https://github.com/facebook/react/tree/main/packages/react-reconciler/src)
