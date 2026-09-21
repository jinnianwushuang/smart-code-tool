# Server/Client 组件边界参照

## 核心概念

React 19 中组件默认为 Server Component。需要浏览器交互的组件必须标记 `'use client'`。

## 边界划分原则

```
Server Components（默认）
  ├── 数据获取（直接访问数据库/文件系统）
  ├── 敏感信息（API 密钥、Token 不发送到客户端）
  ├── 静态内容（不交互的页面部分）
  └── 依赖客户端组件的布局

Client Components（标记 'use client'）
  ├── 交互逻辑（onClick、onChange 等事件处理）
  ├── 浏览器 API（window、localStorage、navigator）
  ├── 状态管理（useState、useReducer、useEffect）
  └── 生命周期相关（useRef、DOM 操作）
```

## Server Component 标准写法

```jsx
// app/users/page.jsx — 默认为 Server Component
import { UserList } from './UserList'
import { db } from '@/lib/database'

export default async function UsersPage() {
  // 直接在服务端获取数据，无需 API 调用
  const users = await db.user.findMany()

  return (
    <div>
      <h1>用户列表</h1>
      <UserList initialData={users} />
    </div>
  )
}
```

## Client Component 标准写法

```jsx
// app/users/UserList.jsx — 需要交互，标记为 Client Component
'use client'

import { useState } from 'react'

export function UserList({ initialData }) {
  const [searchTerm, setSearchTerm] = useState('')
  const filtered = initialData.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜索用户"
      />
      <ul>
        {filtered.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 边界划分规则

| 场景                    | 组件类型 | 说明                          |
| ----------------------- | -------- | ----------------------------- |
| 纯展示 + 无交互         | Server   | 默认即可                      |
| 需要 useState/useEffect | Client   | 必须标记 `'use client'`       |
| 需要事件处理            | Client   | onClick/onChange 等           |
| 需要浏览器 API          | Client   | window/localStorage 等        |
| 数据获取                | Server   | 直接 async/await              |
| 混合场景                | 拆分     | Server 布局 + Client 交互部分 |

## 组件树中的边界位置

```
Server Component（页面）
  └── Client Component（交互区域）  ← 边界在这里
        └── Server Component（不可以！Client 内部不能嵌套 Server）
```

**关键规则**：一旦标记 `'use client'`，其所有子组件都是 Client Component。Server Component 可以导入 Client Component，但反过来不行。

## 数据传递跨越边界

```jsx
// Server Component 向 Client Component 传递数据
export default async function Page() {
  const data = await fetchData() // 服务端获取
  return <ClientComponent serverData={data} /> // 通过 props 传递
}

// Client Component 不能使用服务端专有功能
;('use client')
export function ClientComponent({ serverData }) {
  // serverData 已经是序列化后的普通数据
  const [localState, setLocalState] = useState(serverData)
  return <div>{/* ... */}</div>
}
```

## 关键约束

- `'use client'` 必须放在文件第一行（注释除外）
- Server Component 不能使用 `useState`/`useEffect`/`useRef` 等 Hook
- Server Component 不能绑定事件处理函数
- Client Component 可以在 Server Component 中作为 children 使用
- 避免将大量数据从 Server 传递到 Client（序列化开销）
- 敏感信息（API Key 等）只能出现在 Server Component 中
