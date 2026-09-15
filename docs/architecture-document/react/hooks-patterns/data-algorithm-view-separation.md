---
title: React Hooks 架构中的数据·算法·显示分离
order: 25
---

# React Hooks 架构 — 数据·算法·显示 三者分离

> React 的 "UI = f(state)" 哲学天然蕴含了三层分离的思想。但 React 不像 Vue 那样提供响应式自动同步——它把"什么时候获取数据、什么时候重算、怎么传给组件"的决策权全部交给了 Hooks。本文从 React Hooks 架构的视角，阐述三者分离在 React 生态中的现代化实现方式。

---

## 一、React 与三层分离的关系：更底层，更自由

### 1.1 React 不提供"自动化管线"

| 特性                    | Vue                     | React                       |
| ----------------------- | ----------------------- | --------------------------- |
| 数据变化 → 自动重算     | `computed` 自动依赖追踪 | 需要 `useMemo` 手动声明依赖 |
| 数据变化 → 自动更新 DOM | 响应式系统自动          | `setState` 触发 Re-render   |
| 数据获取 → 自动缓存     | 无内置（需 Pinia 等）   | React Query / SWR 提供      |
| 逻辑复用                | Composable（`use-*`）   | Custom Hooks                |

**React 更底层**：它只提供了 `useState`、`useEffect`、`useMemo` 等原语，三层分离的架构完全靠开发者通过 Hooks 组合来建立。这意味着 React 中三层分离**更灵活，但也更容易做乱**。

### 1.2 "UI = f(state)" 的三层解读

React 的核心公式 `UI = f(state)` 看似简单，但 `state` 并不是一个单一概念：

```
┌─────────────────────────────────────────────────────────────────┐
│                    React 中的三层映射                             │
│                                                                  │
│   ① 接口原始数据（Server State）                                  │
│      → React Query / SWR / TanStack Query 管理                  │
│      → 特征：来自服务端，有缓存、有生命周期、会过期                │
│                                                                  │
│   ② 算法（Pure Transform）                                       │
│      → useMemo 内的纯计算函数                                    │
│      → 自定义 Hook 内的纯逻辑                                    │
│      → 特征：输入确定则输出确定，不依赖 React API                  │
│                                                                  │
│   ③ 界面显示数据（Client State + Derived State）                  │
│      → useState / useReducer 管理的 UI 状态                      │
│      → useMemo 派生的展示数据                                    │
│      → 特征：直接驱动 JSX 渲染                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、Custom Hooks：三层分离的核心载体

### 2.1 Hook 分层体系

在 React 中实现三层分离，关键是**让 Custom Hooks 承担不同层的职责**：

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   数据获取 Hook（Data Hooks）                                     │
│   ├── useUserQuery()        → React Query，返回原始服务端数据     │
│   ├── useOrderListQuery()   → 封装请求，返回 { data, loading }   │
│   └── 职责：只管"拿数据"，不管"怎么用"                            │
│                                                                  │
│   算法 Hook（Transform Hooks）                                    │
│   ├── useFilteredUsers()    → 接收原始数据，返回过滤后的结果      │
│   ├── useSortedOrders()     → 接收原始数据，返回排序后的结果      │
│   └── 职责：纯计算，用 useMemo 包裹，不产生副作用                 │
│                                                                  │
│   显示 Hook（View Hooks）                                         │
│   ├── useUserTable()        → 组合数据+算法，返回表格所需的一切   │
│   ├── useDashboard()        → 组合多个数据源，返回面板所需状态    │
│   └── 职责：串联三层，输出组件直接消费的完整 ViewModel            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 标准写法：三层清晰分离

```tsx
// ── ① 数据获取层 ──
// hooks/useUserQuery.ts
import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '@/api/user-api'

export function useUserQuery(params: UserQueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    // 返回原始服务端数据，不做任何加工
  })
}

// ── ② 算法层（纯函数 + useMemo）──
// utils/user-transform.ts（纯 TypeScript，不 import React）
export function buildUserViewModel(rawUsers: UserRawData[], filters: UserFilters): UserTableRow[] {
  return rawUsers
    .filter((user) => matchesFilters(user, filters))
    .sort((a, b) => b.score - a.score)
    .map((user) => ({
      id: user.id,
      displayName: `${user.first_name} ${user.last_name}`,
      departmentName: getDepartmentName(user.dept_id),
      statusText: STATUS_MAP[user.status],
      lastLoginText: formatRelativeTime(user.last_login_at),
    }))
}

// ── ②③ 桥梁层（组合 Hook）──
// hooks/useUserTable.ts
import { useMemo, useState } from 'react'
import { useUserQuery } from './useUserQuery'
import { buildUserViewModel } from '@/utils/user-transform'

export function useUserTable(params: UserQueryParams) {
  const { data: rawUsers, isLoading } = useUserQuery(params)
  const [filters, setFilters] = useState<UserFilters>({})

  // useMemo = 算法层的"自动缓存"
  // 只有 rawUsers 或 filters 变化时才重新计算
  const tableData = useMemo(() => buildUserViewModel(rawUsers ?? [], filters), [rawUsers, filters])

  return { tableData, filters, setFilters, isLoading }
}

// ── ③ 显示层（组件）──
// components/UserTable.tsx
import { useUserTable } from '@/hooks/useUserTable'

export function UserTable({ params }: { params: UserQueryParams }) {
  const { tableData, filters, setFilters, isLoading } = useUserTable(params)

  if (isLoading) return <Spinner />

  return (
    <table>
      <tbody>
        {tableData.map((row) => (
          <tr key={row.id}>
            <td>{row.displayName}</td>
            <td>{row.departmentName}</td>
            <td>{row.statusText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 三、React Query / SWR：数据获取层的现代化方案

### 3.1 Server State vs Client State

React 生态对"状态"的分类比 Vue 更明确——TanStack Query 提出了 **Server State** 和 **Client State** 的区分：

| 状态类型          | 对应三层       | 管理工具              | 特征                             |
| ----------------- | -------------- | --------------------- | -------------------------------- |
| **Server State**  | ① 接口原始数据 | React Query / SWR     | 来自服务端，有缓存、过期、重试   |
| **Client State**  | ③ 界面显示数据 | useState / useReducer | 纯 UI 状态（表单、弹窗、选中项） |
| **Derived State** | ② 算法层输出   | useMemo               | 从 Server/Client State 计算得出  |

```tsx
// Server State：React Query 自动管理缓存、重试、过期
const { data: rawUsers } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})

// Client State：纯 UI 状态
const [selectedTab, setSelectedTab] = useState('all')
const [searchText, setSearchText] = useState('')

// Derived State：算法层输出（useMemo 自动缓存）
const filteredUsers = useMemo(
  () => buildUserViewModel(rawUsers ?? [], { search: searchText, tab: selectedTab }),
  [rawUsers, searchText, selectedTab],
)
```

### 3.2 React Query 是"网络栈"的 React 化身

React Query 之于 React，就像浏览器的 Network Stack 之于渲染引擎：

```
浏览器：  Network Stack → 缓存响应 → 交给 Parser
React：   React Query  → 缓存响应 → 交给组件

共同特征：
• 自动缓存和过期管理
• 后台静默刷新
• 重试和错误处理
• 让上层（组件/Parser）不需要关心"数据怎么来的"
```

---

## 四、React 特有的挑战与应对

### 4.1 挑战一：useEffect 中的"三层混合"

React 中最常见的反模式是在 `useEffect` 中混合三层逻辑：

```tsx
// ❌ 反模式：useEffect 中混合了数据获取 + 算法 + 状态设置
useEffect(() => {
  fetch('/api/users')
    .then((res) => res.json())
    .then((data) => {
      // 在 effect 里做数据转换（算法层混入了副作用）
      const processed = data
        .filter((u) => u.status === 1)
        .map((u) => ({ ...u, displayName: `${u.first} ${u.last}` }))
      setUsers(processed) // 直接设置到状态
    })
}, [])
```

**问题**：

- 算法逻辑（filter + map）被锁死在 effect 中，无法独立测试
- 无法利用 `useMemo` 的缓存能力
- 数据获取和转换逻辑耦合

```tsx
// ✅ 正确：三层分离
const { data: rawUsers } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })

const users = useMemo(() => buildUserViewModel(rawUsers ?? [], {}), [rawUsers])
```

### 4.2 挑战二：Props Drilling 与三层穿透

当组件树较深时，原始数据可能通过 props 层层传递，导致算法逻辑散落在各层：

```tsx
// ❌ 反模式：每一层都在做一部分转换
function ParentPage() {
  const { data } = useOrderQuery()
  const summary = computeSummary(data)     // 部分转换
  return <ChildA summary={summary} />
}
function ChildA({ summary }) {
  const filtered = summary.filter(...)     // 又一部分转换
  return <ChildB data={filtered} />
}
```

**应对**：在最高的合理层级完成所有算法转换，向下传递**显示数据**而非中间态。

```tsx
// ✅ 正确：在顶层 Hook 中完成所有转换
function ParentPage() {
  const viewModel = useOrderDashboard() // 内部完成 原始数据 → 算法 → 显示数据
  return <ChildA viewModel={viewModel} /> // 向下传递的是完整的 ViewModel
}
```

### 4.3 挑战三：useMemo 的依赖管理

React 的 `useMemo` 需要手动声明依赖，这是与 Vue `computed` 最大的区别：

| 特性     | Vue computed             | React useMemo            |
| -------- | ------------------------ | ------------------------ |
| 依赖追踪 | 自动（Proxy 细粒度追踪） | 手动（依赖数组）         |
| 缓存失效 | 依赖变化时自动失效       | 依赖数组变化时失效       |
| 遗漏风险 | 无                       | 可能遗漏依赖导致过期数据 |

**规则**：`useMemo` 内的纯函数必须是**引用透明**的——同样的输入永远产出同样的输出，且不依赖外部可变状态。

---

## 五、React Server Components：服务端即数据层

### 5.1 RSC 对三层分离的影响

React Server Components（RSC）将三层分离推向了新维度——**服务端组件本身就是数据获取层**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    RSC 架构中的三层分布                           │
│                                                                  │
│   服务端                                                         │
│   ├── Server Component：直接访问数据库/API（① 数据获取层）        │
│   ├── 在服务端完成数据转换（② 算法层的一部分）                    │
│   └── 序列化后的数据传递给客户端                                  │
│                                                                  │
│   客户端                                                         │
│   ├── Client Component：接收已处理的数据                          │
│   ├── 客户端的 useMemo 做剩余的转换（② 算法层的另一部分）         │
│   └── useState 管理 UI 状态（③ 显示数据层）                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 RSC 中的三层代码组织

```tsx
// ── 服务端组件（数据获取层 + 部分算法层）──
// app/users/page.tsx (Server Component by default)
import { UserTable } from './UserTable'
import { fetchUsers } from '@/api/user-api'
import { buildUserViewModel } from '@/utils/user-transform'

export default async function UsersPage() {
  const rawUsers = await fetchUsers() // ① 获取原始数据
  const initialData = buildUserViewModel(
    // ② 在服务端完成初始转换
    rawUsers,
    {},
  )
  return <UserTable initialData={initialData} /> // ③ 传递显示数据给客户端
}

// ── 客户端组件（③ 显示数据层 + 客户端算法层）──
// app/users/UserTable.tsx (Client Component)
;('use client')

import { useState, useMemo } from 'react'

export function UserTable({ initialData }: { initialData: UserTableRow[] }) {
  const [filters, setFilters] = useState({})

  // 客户端的算法层：用户交互驱动的实时过滤
  const filteredData = useMemo(
    () => applyClientFilters(initialData, filters),
    [initialData, filters],
  )

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />
      <table>{/* 渲染 filteredData */}</table>
    </>
  )
}
```

---

## 六、React 生态中的"防火墙"检验

### 6.1 三层独立可测试

```tsx
// ✅ 算法层可脱离 React 环境独立测试
import { buildUserViewModel } from './user-transform'

test('buildUserViewModel 过滤并排序', () => {
  const raw = [
    { id: 1, status: 1, score: 80, first_name: 'A', last_name: 'B', dept_id: 1 },
    { id: 2, status: 0, score: 90, first_name: 'C', last_name: 'D', dept_id: 2 },
  ]
  const result = buildUserViewModel(raw, {})
  expect(result).toHaveLength(1)
  expect(result[0].displayName).toBe('A B')
})
// 不需要 React Testing Library，不需要 render，不需要 mock
```

### 6.2 三层可独立替换

| 替换场景                     | 需要改动的文件         | 不需要改动的文件             |
| ---------------------------- | ---------------------- | ---------------------------- |
| 数据源换了（REST → GraphQL） | `api/*.ts`、Query Hook | `transform/*.ts`、组件       |
| UI 换了（表格 → 卡片）       | 组件 JSX               | `api/*.ts`、`transform/*.ts` |
| 排序规则变了                 | `transform/*.ts`       | `api/*.ts`、组件 JSX         |
| 缓存策略变了                 | React Query 配置       | 其他所有层                   |

### 6.3 检验清单

- [ ] `transform/` 或 `utils/` 目录下的转换函数是否不 import `react`？
- [ ] `useEffect` 中是否避免了数据转换逻辑（转换应在 `useMemo` 中）？
- [ ] 组件是否只消费 ViewModel，不直接访问 API 原始响应的字段？
- [ ] Server State（React Query）和 Client State（useState）是否职责分明？
- [ ] Custom Hook 是否遵循单一职责（数据获取 vs 逻辑转换 vs 组合编排）？

---

## 七、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   React 的三层分离实现路径：                                      │
│                                                                  │
│   ① 接口原始数据    →  React Query / SWR / Server Components     │
│   ② 算法处理        →  transform/*.ts（纯函数）+ useMemo 缓存    │
│   ③ 界面显示数据    →  useState + useMemo 输出 + JSX 渲染        │
│                                                                  │
│   React 提供的"机制"：                                            │
│   • Custom Hooks：三层逻辑的封装和复用单元                        │
│   • useMemo：算法层的缓存和自动重算                               │
│   • React Query：数据获取层的缓存和生命周期管理                   │
│   • Server Components：将数据获取层推到服务端                     │
│                                                                  │
│   与 Vue 的关键区别：                                             │
│   • Vue 的 computed 自动追踪依赖 → React 需要手动写依赖数组       │
│   • Vue 的响应式自动同步 → React 需要 setState 触发更新           │
│   • React 更底层更自由 → 三层分离更靠开发者自律                   │
│                                                                  │
│   核心思想不变：                                                   │
│   数据进来 → 算法加工 → 显示出去                                  │
│   React 只是提供了更灵活的原语，让你自己搭建这条管线              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

React 的哲学是"给你最少的原语，给你最大的自由"。三层分离在 React 中不是框架帮你做的事，而是你作为架构师主动建立的秩序。
