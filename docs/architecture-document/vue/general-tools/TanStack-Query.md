---
title: TanStack-Query 封装
order: 101
---

# TanStack-Query 封装

## 工业级 TanStack-Query 封装

在大型项目中，直接在组件（View 层）里写 `useQuery` 会导致逻辑混淆、难以复用且主组件臃肿。

**TanStack Query 二次封装的核心思想是：核心配置统一化 + 业务逻辑 Hooks 化 + 接口定义 Service 化。**

以下是工业级的封装架构方案：

---

#### 1. 目录结构设计 (解耦 View 与 Logic)

通过分层，将请求配置、接口定义和业务逻辑彻底剥离。

```text
src/
  ├── api/              # 第一层：纯 API 定义 (Axios)
  │   └── user.js
  ├── hooks/            # 第二层：业务 Query 封装 (TanStack Query)
  │   └── queries/
  │       └── useUserQuery.js
  └── views/            # 第三层：组件调用
      └── UserProfile.vue
```

---

#### 2. 第一层：API Service 封装 (基于之前的 Axios)

这里只负责发请求，不关心状态。

```javascript
// src/api/user.js
//import http from 'src/utils/request';

export const fetchUserInfo = (id) => http.get(`/user/${id}`)
export const updateUserName = (data) => http.post('/user/update', data)
```

---

#### 3. 第二层：核心 Query 业务封装 (关键)

不要在组件里写 `queryKey`。将每一个业务逻辑封装成一个自定义 Hook。

#### 示例：查询类 Hook (`useUserQuery.js`)

```javascript
// src/hooks/queries/useUserQuery.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query' // 或 react-query
import { fetchUserInfo, updateUserName } from 'src/api/user'

/**
 * 封装：获取用户信息
 * 解决：自动缓存、参数监听、局部 loading
 */
export function useUserInfo(userId) {
  return useQuery({
    queryKey: ['user', userId], // 统一管理 Key
    queryFn: () => fetchUserInfo(userId),
    enabled: !!userId, // 只有有 ID 时才触发
    staleTime: 1000 * 60 * 5, // 5分钟内数据被认为是新鲜的
  })
}

/**
 * 封装：更新用户信息
 * 解决：成功后自动刷新关联的数据
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserName,
    onSuccess: (data, variables) => {
      // 核心：操作成功后，让对应的 'user' 缓存失效，触发 UI 自动重绘
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      console.log('修改成功')
    },
  })
}
```

---

#### 4. 第三层：主组件调用 (瘦身后的视图)

组件只负责“展示”和“触发”，不再关心缓存怎么更新、请求怎么中止。

```vue
<!-- UserProfile.vue (Vue 示例) -->

import { useUserInfo, useUpdateUser } from 'src/hooks/queries/useUserQuery' const props =
defineProps(['id']) // 1. 调用封装好的 Hook，直接解构状态 const { data: user, isLoading, isError } =
useUserInfo(props.id) const { mutate: update, isPending } = useUpdateUser() const handleRename = ()
=> { update({ id: props.id, name: '新名字' }) }

<!-- <div v-if="isLoading">加载中...</div>
  <div v-else>
    <h1>{{ user.name }}</h1>
    <button :disabled="isPending" @click="handleRename">改名</button>
  </div> -->
```

---

#### 5. 进阶：如何处理“不同区域同接口”的隔离？

在大型页面中，如果两个区域请求同一个接口但参数不同，TanStack Query 会通过 **`queryKey`** 自动实现隔离：

- 区域 A 传入 `['user', 1]`
- 区域 B 传入 `['user', 2]`

由于 Key 不同，它们在全局缓存池里是独立的。如果参数相同，它们会**自动合并请求**，只发一次网络请求，然后同步更新两个区域的 UI。

---

#### 6. 为什么这种封装更高级？

1. **自动缓存管理**：如果你从 A 页面跳到 B 页面再跳回来，数据是秒开的（Stale-While-Revalidate）。
2. **声明式编程**：主组件不再有复杂的 `onMounted` 和 `watcher`，代码量减少 60% 以上。
3. **无感刷新**：通过 `invalidateQueries`，你更新了数据，页面上引用该数据的所有组件都会自动重新拉取，不需要手动通知。
4. **接口聚合**：你可以轻松在 Hook 里组合多个接口请求（使用 `useQueries`），而主组件依然只需要看一个 `isLoading`。

**建议：** 如果你的项目接口超过 50 个，一定要建立一个 `queryKeys.js` 常量文件来统一管理所有的 Key，防止拼写错误导致缓存失效。

## 统一管理全局的 `QueryKey` 常量

在大型项目中，直接在组件或 Hook 里写字符串（如 `['user', id]`）是非常危险的。一旦拼写错误（如写成 `['users', id]`），缓存同步就会失效。

**工业级方案：使用「Key 工厂（Key Factory）」模式统一管理全局 QueryKey。**

---

#### 1. 定义 Key 工厂 (`src/api/queryKeys.js`)

这种结构化的对象可以清晰地展现接口的层级关系，并支持**局部刷新**（失效 `user.all`）或**精确刷新**（失效 `user.detail(1)`）。

```javascript
// src/api/queryKeys.js

export const userKeys = {
  all: ['users'], // 根 Key
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), { params }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
}

export const orderKeys = {
  all: ['orders'],
  detail: (id) => [...orderKeys.all, 'detail', id],
  log: (id) => [...orderKeys.detail(id), 'logs'],
}
```

---

#### 2. 在自定义 Hook 中使用

这样封装后，Hook 的逻辑变得非常清晰且具备类型暗示。

```javascript
// src/hooks/queries/useUserQuery.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { userKeys } from 'src/api/queryKeys'
import { fetchUserInfo, updateUserName } from 'src/api/user'

// 查询用户信息
export function useUserInfo(userId) {
  return useQuery({
    queryKey: userKeys.detail(userId), // 使用工厂生成 Key: ['users', 'detail', 123]
    queryFn: () => fetchUserInfo(userId),
    enabled: !!userId,
  })
}

// 修改用户信息
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserName,
    onSuccess: (data, variables) => {
      // 精准失效：只刷新这个用户的详情
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      })

      // 或者全局失效：刷新所有用户信息（如列表页也需要同步）
      // queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  })
}
```

---

#### 3. 大型页面的「局部隔离」实战

假设你的页面有三个区域：**个人资料卡片**、**最近订单**、**操作日志**。

```javascript
// 组件内调用示例
const { data: user } = useUserInfo(id) // Key: ['users', 'detail', id]
const { data: orders } = useOrders(id) // Key: ['orders', 'detail', id]
const { data: logs } = useOrderLogs(id) // Key: ['orders', 'detail', id, 'logs']
```

#### 这种管理的强大之处：

1. **分层失效**：如果你调用 `queryClient.invalidateQueries({ queryKey: orderKeys.all })`，TanStack Query 会自动刷新**所有订单列表、所有订单详情以及所有订单日志**，因为它们的 Key 都包含 `['orders']` 前缀。
2. **避免硬编码**：全局搜索 `userKeys` 就能找到所有引用用户接口的地方，维护成本极低。
3. **自动隔离**：不同区域如果传入不同的 `id`，`userKeys.detail(id)` 产生的数组自然不同，数据永远不会串行。

#### 总结

这就是大型前端项目的 **「Service + QueryKey + Hooks」** 三层架构。主组件现在只需要引入 Hook，像使用普通变量一样获取数据即可。

## QueryKey 避坑指南

在大型项目中，`QueryKey` 不仅仅是缓存标识，更是**全局状态驱动器**。除了前面提到的工厂模式，还有以下工业级开发中必须避开的坑和提效技巧：

#### 1. 声明式依赖：QueryKey 即“全家桶”变量

在大型项目中，最常见的 Bug 是“参数变了，但请求没发”。

- **原则**：`queryFn` 里用到的**所有变量**（筛选、分页、排序、搜索词），必须全部放进 `QueryKey`。

- **技巧**：将对象参数作为 `QueryKey` 的一部分。TanStack Query 会对对象进行**深度确定性哈希**（Deterministic Hash），即使对象属性顺序不同，也会被识别为同一个 Key。

  ```javascript
  // 即使顺序不同，缓存依然有效
  queryKey: ['users', { page: 1, sort: 'desc' }]
  queryKey: ['users', { sort: 'desc', page: 1 }]
  ```

#### 2. 避免 “QueryKey 漂移” (Drift)

在大项目多人协作时，不同开发者可能为同一个接口写出略微不同的 Key（例如 `['user']` 和 `['users']`），导致缓存失效或冗余请求。

- **对策**：使用 [Query Key Factory](https://tanstack.com/query/v4/docs/react/community/lukemorales-query-key-factory) 库或强类型定义。强制要求团队成员只能从工厂方法中获取 Key，绝不允许在组件内手动书写数组字符串。

#### 3. 利用层次结构实现“地毯式刷新”

利用 `invalidateQueries` 的**前缀匹配特性**，在大页面中可以实现非常精细或大面积的数据更新：

- **失效全部用户数据**：`queryClient.invalidateQueries({ queryKey: ['users'] })`
- **仅失效搜索列表**：`queryClient.invalidateQueries({ queryKey: ['users', 'list'] })`
- **仅失效 ID 为 1 的详情**：`queryClient.invalidateQueries({ queryKey: ['users', 'detail', 1] })`

#### 4. 解决“序列化”陷阱

`QueryKey` 必须是**可序列化的**。

- **错误示例**：不要把复杂的 Class 实例、函数或带有循环引用的对象放进 `QueryKey`。
- **后果**：会导致哈希计算失败或无限重复请求。

#### 5. 性能优化：模糊匹配 vs 精确匹配

在大型页面中，不当的失效会导致全页面“震荡”（所有组件同时进入 Loading）。

- **精确匹配**：在不需要联动刷新时，使用 `{ exact: true }`，防止误伤前缀相同的其他请求。

  ```javascript
  // 只刷新 ID 为 1 的，不影响 ['users', 'list']
  queryClient.invalidateQueries({ queryKey: ['users', 1], exact: true })
  ```

#### 6. 使用 `queryOptions` 进行逻辑聚合 (V5+ 推荐)

为了极致的精简，可以使用 `queryOptions` 将 `queryKey` 和 `queryFn` 绑定在一起导出。 [7]

```javascript
// src/api/user.options.js
export const userDetailOptions = (id) =>
  queryOptions({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,
  })

// 组件中一行调用
const { data } = useQuery(userDetailOptions(props.id))
```

**建议：** 在开发阶段开启 TanStack Query Devtools，这是观察 `QueryKey` 是否正确隔离、是否存在重复请求的最直观工具。
