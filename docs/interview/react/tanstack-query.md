---
title: 'TanStack Query 数据获取与缓存 [P6-P7]'
level: 'senior'
tags: ['TanStack Query', 'React Query', '数据获取', '缓存', '乐观更新']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# TanStack Query 数据获取与缓存 [P6-P7]

> TanStack Query（原 React Query）是 2026 年 React 生态数据获取和缓存的事实标准。它将服务端状态管理从客户端状态管理中分离，提供缓存、去重、后台更新、乐观更新等能力。

## 核心概念（What）

### TanStack Query 核心能力

| 能力              | 说明                           |
| ----------------- | ------------------------------ |
| **缓存**          | 自动缓存请求结果，避免重复请求 |
| **去重**          | 同一请求并发时只发一次         |
| **后台刷新**      | 先显示缓存，后台静默更新       |
| **分页/无限滚动** | useInfiniteQuery 内置支持      |
| **乐观更新**      | 先更新 UI，失败回滚            |
| **Mutation**      | 创建/更新/删除操作管理         |
| **DevTools**      | 可视化缓存状态                 |

---

## 底层原理（Why）

### 1. 核心架构

```typescript
// QueryClient：全局配置和缓存管理
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟内视为新鲜（不重新获取）
      gcTime: 30 * 60 * 1000, // 30 分钟后垃圾回收（清除缓存）
      retry: 3, // 失败重试 3 次
      refetchOnWindowFocus: true, // 窗口聚焦时重新获取
    },
  },
})

// 核心概念：
// ├── staleTime：数据新鲜期（期间不重新获取）
// ├── gcTime：缓存保留时间（过期后清除）
// ├── stale：数据过期 → 后台静默重新获取
// └── fresh：数据新鲜 → 直接使用缓存
```

### 2. useQuery 原理

```typescript
// useQuery：数据获取 + 缓存
function useUsers() {
  return useQuery({
    queryKey: ['users', { page: 1 }], // 缓存 key（数组，自动序列化）
    queryFn: () => fetch('/api/users').then((r) => r.json()),
    staleTime: 60_000, // 1 分钟内视为新鲜
  })
}

// 状态流转：
// 1. 首次请求 → status: 'pending', fetchStatus: 'fetching'
// 2. 数据返回 → status: 'success', fetchStatus: 'idle'
// 3. 过期后重新获取 → status: 'success'（显示旧数据）, fetchStatus: 'fetching'
// 4. 请求失败 → status: 'error', fetchStatus: 'idle'

// 缓存匹配：
// queryKey: ['users', { page: 1 }]
// → 匹配 ['users']（部分匹配）
// → 精确匹配 ['users', { page: 1 }]
// → queryClient.invalidateQueries({ queryKey: ['users'] }) 使所有 users 缓存失效
```

### 3. 乐观更新

```typescript
// 乐观更新：先更新 UI，请求失败时回滚
function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todo: Todo) => api.updateTodo(todo),

    // 乐观更新
    onMutate: async (newTodo) => {
      // 取消相关查询的正在进行的重获取
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // 保存之前的值（用于回滚）
      const previousTodos = queryClient.getQueryData(['todos'])

      // 乐观更新缓存
      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old.map((t) => (t.id === newTodo.id ? newTodo : t)),
      )

      // 返回上下文（onError 和 onSettled 可以访问）
      return { previousTodos }
    },

    // 失败回滚
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },

    // 无论成功失败都重新获取
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

### 4. 无限滚动

```typescript
// useInfiniteQuery：分页/无限滚动
function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/users?cursor=${pageParam}`);
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

// 组件使用
function UserList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteUsers();

  // 滚动到底部加载更多
  const observerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div>
      {data?.pages.map(page =>
        page.users.map(user => <UserCard key={user.id} user={user} />)
      )}
      <div ref={observerRef}>
        {isFetchingNextPage && 'Loading more...'}
      </div>
    </div>
  );
}
```

---

## 高频面试题

### Q1: staleTime 和 gcTime 的区别？

**参考答案要点**：

- `staleTime`：数据新鲜期，期间直接使用缓存，不重新获取
- `gcTime`：缓存保留时间，过期后从缓存中清除
- staleTime < gcTime：过期后后台静默更新（显示旧数据）
- staleTime = 0：每次使用都重新获取（默认）

### Q2: 乐观更新的实现原理？

**参考答案要点**：

- onMutate 中先取消进行中的请求
- 保存旧缓存值（previousData）
- 立即更新缓存（setQueriesData）→ UI 立即更新
- onError 中回滚到旧值
- onSettled 中重新获取最新数据

### Q3: TanStack Query 和 SWR 的区别？

**参考答案要点**：

- TanStack Query：功能全面（Query + Mutation + InfiniteQuery）
- SWR：更轻量，专注数据获取
- TanStack Query 缓存管理更精细（staleTime/gcTime）
- SWR API 更简洁（data, error, isLoading）
- 2026 趋势：TanStack Query 更主流

---

## 延伸思考

1. **设计题**：为一个电商应用设计数据获取层（商品列表/详情/购物车/订单）。
2. **场景题**：多个组件使用同一 queryKey，如何避免重复请求？
3. **对比题**：TanStack Query vs SWR vs Apollo Client，GraphQL 场景怎么选？

---

## 参考资料

- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
