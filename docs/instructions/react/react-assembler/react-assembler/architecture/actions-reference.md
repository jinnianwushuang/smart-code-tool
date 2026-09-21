# Actions 模式参照

## 什么是 Actions

React 19 引入 Actions，统一处理表单提交、异步操作和乐观更新。Actions 是函数式的数据变更流程，替代传统的事件处理 + 状态管理模式。

## useActionState 标准写法

```jsx
// actions/create-user-action.js
'use server'

export async function createUserAction(prevState, formData) {
  // 1. 从 FormData 提取数据
  const name = formData.get('name')
  const email = formData.get('email')

  // 2. 验证
  if (!name || !email) {
    return { error: '姓名和邮箱不能为空', success: false }
  }

  // 3. 执行异步操作
  try {
    const response = await api.createUser({ name, email })
    return { error: null, success: true, data: response.data }
  } catch (error) {
    return { error: error.message, success: false }
  }
}
```

```jsx
// components/CreateUserForm.jsx
import { useActionState } from 'react'
import { createUserAction } from '../actions/create-user-action'

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, {
    error: null,
    success: false,
  })

  return (
    <form action={formAction}>
      <input name="name" placeholder="姓名" />
      <input name="email" placeholder="邮箱" />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">创建成功</p>}
    </form>
  )
}
```

## 乐观更新（useOptimistic）

```jsx
// components/TodoList.jsx
import { useOptimistic } from 'react'

export function TodoList({ todos, onToggle }) {
  const [optimisticTodos, toggleOptimistic] = useOptimistic(todos, (state, toggledId) =>
    state.map((todo) => (todo.id === toggledId ? { ...todo, completed: !todo.completed } : todo)),
  )

  const handleToggle = async (id) => {
    // 立即更新 UI（乐观更新）
    toggleOptimistic(id)
    // 然后执行实际异步操作
    await onToggle(id)
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li
          key={todo.id}
          onClick={() => handleToggle(todo.id)}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  )
}
```

## use() API 数据获取

```jsx
// pages/user-list.jsx
import { use, Suspense } from 'react'

// 服务端数据获取函数
function fetchUsers() {
  return api.getUsers()
}

function UserList() {
  const users = use(fetchUsers())

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

export default function UserPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserList />
    </Suspense>
  )
}
```

## Actions 与传统事件处理对比

```
传统模式：
  用户点击 → onClick handler → setState → useEffect 监听 → 发起请求 → setState 更新

Actions 模式：
  用户提交 → form action → useActionState 自动处理 pending/error → 返回结果 → UI 更新
```

## 关键约束

- Server Actions 必须在文件顶部标记 `'use server'`
- `useActionState` 第一个参数必须是 async 函数
- `use()` 只能在组件或 Hook 顶层调用，不能在条件/循环中
- 乐观更新必须配合实际异步操作，不能只有乐观 UI
- Actions 的返回值会作为下一次调用的 `prevState`
