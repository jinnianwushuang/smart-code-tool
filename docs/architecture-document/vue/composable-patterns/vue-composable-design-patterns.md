---
title: Vue 3 Composable 设计模式
tags: ['Vue', 'Composable']
---

# Vue 3 Composable 设计模式

Composable 是 Vue 3 Composition API 提供的代码复用机制，等价于 React 的自定义 Hook，但得益于响应式系统的自动追踪，Composable 的使用模式有显著差异。本文系统梳理 Composable 的设计原则、常见模式与反模式。

---

## 一、Composable 核心规范

### 1.1 命名与结构

```ts
// 命名规范：use 前缀 + 功能名
// 文件命名：useXxx.ts
import { ref, computed, type Ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return { count, double, increment, decrement, reset }
}
```

### 1.2 在组件中使用

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

const { count, double, increment } = useCounter(10)
</script>

<template>
  <p>Count: {{ count }}, Double: {{ double }}</p>
  <button @click="increment">+1</button>
</template>
```

### 1.3 与 React Hook 的核心差异

| 维度 | Vue Composable | React Hook |
|---|---|---|
| 调用时机 | `setup()` 中调用一次 | 每次渲染都调用 |
| 状态持有 | 返回的 ref 跨渲染保持 | 依赖 React 内部链表 |
| 依赖声明 | 不需要（自动追踪） | 必须显式声明依赖数组 |
| 缓存派生 | `computed`（自动） | `useMemo`（手动） |
| 闭包陷阱 | 不存在（ref 引用稳定） | 常见（需 useCallback） |

---

## 二、Composable 设计原则

### 2.1 单一职责

```ts
// ❌ 职责过多
function useUserAndPosts() {
  const user = ref(null)
  const posts = ref([])
  // ... 用户逻辑 + 文章逻辑混在一起
  return { user, posts, fetchUser, fetchPosts }
}

// ✅ 单一职责，可组合
function useUser() {
  const user = ref<User | null>(null)
  const loading = ref(false)

  async function fetchUser(id: string) {
    loading.value = true
    user.value = await api.getUser(id)
    loading.value = false
  }

  return { user, loading, fetchUser }
}

function usePosts(userId: Ref<string>) {
  const posts = ref<Post[]>([])
  watch(userId, async (id) => {
    posts.value = await api.getPosts(id)
  })
  return { posts }
}

// 组合使用
const { user, fetchUser } = useUser()
const { posts } = usePosts(computed(() => user.value?.id ?? ''))
```

### 2.2 返回值结构化

```ts
// ✅ 返回响应式状态 + 操作方法 + 派生数据
export function useTodoList() {
  const todos = ref<Todo[]>([])
  const filter = ref<'all' | 'active' | 'done'>('all')

  // 派生数据（computed）
  const filteredTodos = computed(() => {
    if (filter.value === 'all') return todos.value
    if (filter.value === 'active') return todos.value.filter((t) => !t.done)
    return todos.value.filter((t) => t.done)
  })

  const remaining = computed(() =>
    todos.value.filter((t) => !t.done).length
  )

  // 操作方法
  function addTodo(text: string) {
    todos.value.push({ id: Date.now(), text, done: false })
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) todo.done = !todo.done
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  return {
    // 状态
    todos,
    filter,
    // 派生
    filteredTodos,
    remaining,
    // 操作
    addTodo,
    toggleTodo,
    removeTodo,
  }
}
```

### 2.3 参数接受 Ref 或普通值

```ts
import { unref, type MaybeRef } from 'vue'

// 同时接受 Ref 和普通值
export function useFetch<T>(
  url: MaybeRef<string>,
  options?: MaybeRef<RequestInit>
) {
  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  // unref 自动解包：如果是 ref 则取 .value，否则原样返回
  async function execute() {
    loading.value = true
    try {
      const response = await fetch(unref(url), unref(options))
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 如果 url 是 ref，自动监听变化
  if (isRef(url)) {
    watch(url, () => execute())
  }

  execute() // 首次执行
  return { data, error, loading, refresh: execute }
}

// 两种用法都支持
useFetch('/api/users') // 普通值
useFetch(computed(() => `/api/users/${userId.value}`)) // Ref
```

---

## 三、常见 Composable 模式

### 3.1 生命周期绑定

```ts
import { onMounted, onUnmounted, ref } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

### 3.2 可中止的异步操作

```ts
import { ref, onUnmounted, type Ref } from 'vue'

export function useAsyncTask<T>(task: () => Promise<T>) {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)
  let abortController: AbortController | null = null

  async function execute() {
    // 取消上一次请求
    abortController?.abort()
    abortController = new AbortController()

    loading.value = true
    error.value = null

    try {
      data.value = await task()
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        error.value = e as Error
      }
    } finally {
      loading.value = false
    }
  }

  onUnmounted(() => {
    abortController?.abort()
  })

  return { data, error, loading, execute }
}
```

### 3.3 本地存储同步

```ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // 从 localStorage 初始化
  const stored = localStorage.getItem(key)
  const initial = stored ? JSON.parse(stored) : defaultValue
  const data = ref<T>(initial) as Ref<T>

  // 自动同步到 localStorage
  watch(
    data,
    (val) => {
      localStorage.setItem(key, JSON.stringify(val))
    },
    { deep: true }
  )

  // 监听其他标签页的变更
  window.addEventListener('storage', (e) => {
    if (e.key === key && e.newValue) {
      data.value = JSON.parse(e.newValue)
    }
  })

  return data
}

// 使用
const theme = useLocalStorage<'light' | 'dark'>('theme', 'light')
```

---

## 四、Composable 分层体系

```
composables/
├── useCounter.ts          # 基础 Composable（无外部依赖）
├── useFetch.ts            # 基础 Composable
├── useLocalStorage.ts     # 基础 Composable
├── useUser.ts             # 业务 Composable（组合基础 Composable）
├── useTodoList.ts         # 业务 Composable
└── useAuth.ts             # 业务 Composable（组合 useFetch + useLocalStorage）
```

**分层原则**：

| 层级 | 特征 | 示例 |
|---|---|---|
| 基础层 | 通用、无业务逻辑、可跨项目复用 | useCounter、useFetch、useLocalStorage |
| 业务层 | 组合基础层、包含业务规则 | useUser、useTodoList、useAuth |
| 页面层 | 特定页面专属、不跨页面复用 | useDashboardPage |

---

## 五、反模式

### 5.1 在 Composable 中使用 setTimeout 而非 watch

```ts
// ❌ 反模式：手动同步
function useSearch(query: Ref<string>) {
  const results = ref([])
  let timer: number

  watch(query, (val) => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      results.value = await search(val)
    }, 300)
  })

  return { results }
}

// ✅ 使用 @vueuse/core 的 useDebounceFn
import { useDebounceFn } from '@vueuse/core'

function useSearch(query: Ref<string>) {
  const results = ref([])
  const debouncedSearch = useDebounceFn(async (val: string) => {
    results.value = await search(val)
  }, 300)

  watch(query, debouncedSearch)
  return { results }
}
```

### 5.2 返回非响应式数据

```ts
// ❌ 返回解构后的普通值
function useWindowSize() {
  const width = ref(window.innerWidth)
  return { width: width.value } // 普通数字，不响应！
}

// ✅ 返回 ref
function useWindowSize() {
  const width = ref(window.innerWidth)
  return { width } // ref，保持响应式
}
```

### 5.3 Composable 中直接操作 DOM

```ts
// ❌ Composable 不应直接操作 DOM
function useScroll() {
  const el = document.querySelector('.container') // 硬编码 DOM
  // ...
}

// ✅ 通过 ref 传入
function useScroll(elRef: Ref<HTMLElement | null>) {
  const scrollTop = ref(0)

  onMounted(() => {
    elRef.value?.addEventListener('scroll', () => {
      scrollTop.value = elRef.value!.scrollTop
    })
  })

  return { scrollTop }
}

// 组件中使用
// <div ref="containerRef">...</div>
// const { scrollTop } = useScroll(containerRef)
```

---

## 六、Composable 速查表

| 模式 | 适用场景 | 示例 |
|---|---|---|
| 基础状态封装 | 通用状态管理 | useCounter、useToggle |
| 生命周期绑定 | 事件监听/资源清理 | useMousePosition、useWindowSize |
| 异步数据获取 | API 调用 | useFetch、useAsyncTask |
| 本地存储同步 | 持久化状态 | useLocalStorage |
| 可中止操作 | 竞态条件处理 | useAsyncTask + AbortController |
| 参数接受 Ref | 响应式参数 | `MaybeRef<T>` + `unref()` |
| 组合复用 | 业务逻辑封装 | useAuth = useFetch + useLocalStorage |
| 分层体系 | 代码组织 | 基础层 → 业务层 → 页面层 |
