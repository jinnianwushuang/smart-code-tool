---
title: "并发渲染与 Suspense [P6-P7]"
level: "senior"
tags: ["React", "并发", "Suspense", "Transitions"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 并发渲染与 Suspense [P6-P7]

> React 18 的并发特性（Concurrent Features）是 Fiber 架构的最终呈现。Suspense 让异步数据获取和代码分割成为一等公民，Transitions 让 UI 过渡保持响应。理解并发模型是掌握现代 React 的关键。

## 核心概念（What）

### 并发渲染的本质

```
同步渲染（React 17 及之前）：
  开始渲染 → 不可中断 → 提交 DOM → 完成
  问题：渲染期间阻塞用户交互

并发渲染（React 18+）：
  开始渲染 → 可中断 → 处理用户交互 → 恢复渲染 → 提交 DOM
  核心：渲染可以被"打断"，让位给更高优先级的任务

关键 API：
├── useTransition     → 标记低优先级更新
├── useDeferredValue → 延迟更新某个值
├── Suspense         → 声明异步边界
└── use()            → 在渲染中读取异步资源
```

---

## 底层原理（Why）

### 1. Suspense 的工作原理

```javascript
// Suspense 的本质：声明一个"异步边界"
// 当子组件在渲染中需要异步数据时，Suspense 显示 fallback

<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>

// 底层机制：
// 1. AsyncComponent 在渲染时"抛出"一个 Promise（throw promise）
// 2. React 捕获这个 Promise
// 3. 如果还没有缓存数据 → 显示 fallback
// 4. Promise resolve 后 → 重新渲染 AsyncComponent
// 5. 这次渲染中数据已就绪 → 正常渲染
```

### 2. use() Hook

```javascript
import { use } from 'react';

// use() 可以在渲染中读取 Promise
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// use() 也可以在渲染中读取 Context
function ThemeButton() {
  const theme = use(ThemeContext);
  return <button className={theme}>Click</button>;
}

// use() 的关键限制：
// - 只能在组件或 Hook 中调用
// - 不能在条件语句或循环中调用
// - 不能在 async 函数中调用
// - 传入的 Promise 必须在组件外部创建
```

### 3. startTransition 与 useTransition

```javascript
// startTransition：标记回调中的更新为"过渡更新"
import { startTransition } from 'react';

setInputValue(value); // 紧急更新：立即反映到输入框

startTransition(() => {
  setSearchQuery(value); // 过渡更新：可以延迟
});

// useTransition：返回 isPending 状态
import { useTransition } from 'react';

function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    // 紧急：更新输入框
    setInput(e.target.value);

    // 过渡：更新搜索结果
    startTransition(() => {
      setQuery(e.target.value);
    });
  };

  return (
    <>
      <input onChange={handleChange} />
      {isPending && <LoadingIndicator />}
      <SearchResults query={query} />
    </>
  );
}
```

### 4. useDeferredValue

```javascript
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  // deferredQuery 会在紧急更新完成后才更新
  const deferredQuery = useDeferredValue(query);

  // 对比当前值和延迟值，决定是否显示旧结果
  const isStale = deferredQuery !== query;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}

// useDeferredValue vs useTransition 的区别：
// - useTransition：在触发更新时标记优先级
// - useDeferredValue：在接收值时延迟更新
// - 效果类似，但使用场景不同
```

### 5. 并发渲染的边界情况

```javascript
// 1. 竞态条件（Race Condition）
// React 的并发渲染会自动处理竞态：
// 如果渲染被中断，旧的结果会被丢弃

// 2. 撕裂（Tearing）
// 同一个渲染中，不同组件可能看到不同的状态
// React 通过"可中断渲染 + 一致性检查"来解决

// 3. 外部状态的同步
// 对于不在 React 管理下的状态（如 DOM 属性、第三方库）
// 需要使用 useSyncExternalStore

import { useSyncExternalStore } from 'react';

const useOnlineStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine, // getSnapshot
    () => true              // getServerSnapshot
  );
};
```

### 6. Suspense 与数据获取模式

```javascript
// 2026 推荐的 Suspense 数据获取模式

// 模式 1：瀑布流 → 并行化
// 反模式：串行获取
function ProfilePage() {
  const user = use(fetchUser());     // 等待用户
  const posts = use(fetchPosts(user.id)); // 再等待文章
  return <Profile user={user} posts={posts} />;
}

// 优化：在父组件提前开始获取
function ProfilePageWrapper() {
  const userPromise = fetchUser();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfilePage userPromise={userPromise} />
    </Suspense>
  );
}

function ProfilePage({ userPromise }) {
  const user = use(userPromise); // 可能已经 resolve
  const posts = use(fetchPosts(user.id));
  return <Profile user={user} posts={posts} />;
}

// 模式 2：嵌套 Suspense（渐进式加载）
<Suspense fallback={<PageSkeleton />}>
  <PageLayout>
    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar />
    </Suspense>
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  </PageLayout>
</Suspense>
```

---

## 实战应用（How）

### 并发模式下的性能优化

```jsx
// 1. 使用 React.memo 配合并发渲染
const ExpensiveList = React.memo(({ items }) => {
  return items.map(item => <ListItem key={item.id} item={item} />);
});

// 2. 合理使用 Suspense 边界
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<AppSkeleton />}>
        <Router />
      </Suspense>
    </ErrorBoundary>
  );
}

// 3. 避免在过渡更新中做昂贵计算
function SearchPage({ query }) {
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    // 只在 deferredQuery 变化时重新计算
    return expensiveSearch(deferredQuery);
  }, [deferredQuery]);

  return <ResultList results={results} />;
}
```

---

## 高频面试题

### Q1: React 并发渲染的核心原理是什么？

**参考答案要点**：
- 基于 Fiber 架构的可中断渲染
- 渲染阶段可暂停、恢复、丢弃
- 通过 Lane Model 区分更新优先级
- 用户交互（输入/点击）优先级高于数据更新
- startTransition 标记的更新为低优先级

### Q2: Suspense 的工作原理是什么？

**参考答案要点**：
- 组件在渲染时 throw Promise 来"挂起"
- React 捕获 Promise，显示最近的 Suspense fallback
- Promise resolve 后重新渲染
- 支持嵌套 Suspense 实现渐进式加载
- React 19 中 Suspense 也支持表单操作（useActionState）

### Q3: useTransition 和 useDeferredValue 的区别？

**参考答案要点**：
- useTransition：在触发更新时标记为过渡更新，返回 isPending
- useDeferredValue：延迟更新接收到的值，在紧急更新完成后才更新
- 效果类似：都是将部分更新标记为低优先级
- 使用场景：useTransition 适合在新数据产生时，useDeferredValue 适合在接收数据时

---

## 延伸思考

1. **设计题**：如何设计一个支持并发渲染的组件库，让每个组件都能独立加载和更新？
2. **场景题**：一个搜索页面在输入时卡顿，如何用并发特性优化？
3. **对比题**：React 的并发模型 vs Vue 的响应式系统 vs SolidJS 的 Signals，各自处理异步的方式？

---

## 参考资料

- [React 18 并发特性](https://react.dev/reference/react/useTransition)
- [React Suspense 文档](https://react.dev/reference/react/Suspense)
- [React 18 Working Group](https://github.com/reactwg/react-18)
- [Dan Abramov - Suspense in React 18](https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md)
