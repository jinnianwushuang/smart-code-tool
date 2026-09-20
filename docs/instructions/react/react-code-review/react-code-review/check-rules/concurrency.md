# 并发处理（concurrency）

> 检查异步操作和并发场景中的安全问题。

## 检查项

### 1. API 请求竞态条件

- **严重级别**：🔴 Error
- **检查方式**：检查是否存在快速连续发起多个请求但未处理竞态的模式（如搜索框输入、分页切换、依赖变化触发的 useEffect 请求）
- **问题示例**：

```tsx
useEffect(() => {
  fetch(`/api/search?q=${keyword}`)
    .then((r) => r.json())
    .then(setResults) // 后发请求可能先返回，结果被旧数据覆盖
}, [keyword])
```

- **正确写法**：

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/search?q=${keyword}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setResults)
    .catch((e) => {
      if (e.name !== 'AbortError') throw e
    })
  return () => controller.abort() // 取消上一次请求
}, [keyword])
```

- **处理建议**：使用 AbortController 取消旧请求，或使用请求 ID / SWR、TanStack Query 等库内建去重

### 2. 异步操作中共享状态未保护

- **严重级别**：🟡 Warning
- **检查方式**：检查多个异步操作是否并发写同一状态，是否使用了函数式更新避免读到过期闭包值
- **正确写法**：

```tsx
// ✅ 函数式更新，基于最新 state
setCount((c) => c + 1)
```

### 3. Promise 未处理 rejection

- **严重级别**：🟡 Warning
- **检查方式**：检查 `async/await` 是否有 `try/catch`，Promise 链是否有 `.catch()`，`useEffect` 内 async 是否被正确包裹
- **问题示例**：

```tsx
useEffect(() => {
  loadData() // async 函数返回的 Promise 未处理 rejection
}, [])
```

- **正确写法**：

```tsx
useEffect(() => {
  const run = async () => {
    try {
      const data = await api.getData()
      setList(data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
  run()
}, [])
```

### 4. 防抖/节流缺失

- **严重级别**：🟡 Warning
- **检查方式**：检查高频触发的事件处理函数（搜索输入、滚动、resize）是否使用了防抖或节流
- **问题示例**：

```tsx
<input onChange={(e) => api.search(e.target.value)} />
// 每次输入都会触发 API 请求
```

- **处理建议**：高频操作应使用防抖（debounce）或节流（throttle），可用 `useDeferredValue`、`useTransition` 或工具库实现
