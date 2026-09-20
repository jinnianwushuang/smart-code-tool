# 内存管理（memory-management）

> 检查组件生命周期中的资源清理问题，防止内存泄漏。React 中资源清理集中在 `useEffect` 的返回函数。

## 检查项

### 1. useEffect 中定时器未清理

- **严重级别**：🔴 Error
- **检查方式**：检查 `useEffect` 中的 `setInterval` / `setTimeout` 是否在返回的清理函数中清除
- **问题示例**：

```tsx
useEffect(() => {
  setInterval(() => refresh(), 5000) // 未保存、未清理
}, [])
```

- **正确写法**：

```tsx
useEffect(() => {
  const timer = setInterval(() => refresh(), 5000)
  return () => clearInterval(timer)
}, [])
```

### 2. 事件监听未移除

- **严重级别**：🔴 Error
- **检查方式**：检查 `addEventListener` 是否在 `useEffect` 清理函数中 `removeEventListener`
- **正确写法**：

```tsx
useEffect(() => {
  const onResize = () => {}
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])
```

### 3. 请求未取消（AbortController）

- **严重级别**：🟡 Warning
- **检查方式**：检查 `useEffect` 中发起的 `fetch` 是否在清理函数中通过 `AbortController` 取消，避免组件卸载后 setState
- **正确写法**：

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== 'AbortError') console.error(e)
    })
  return () => controller.abort()
}, [url])
```

### 4. 订阅未取消（WebSocket / EventEmitter / store）

- **严重级别**：🔴 Error
- **检查方式**：检查 WebSocket、EventEmitter、状态管理库（如 zustand `subscribe`）的订阅是否在清理函数中取消
- **正确写法**：

```tsx
useEffect(() => {
  const unsub = useStore.subscribe(listener)
  const ws = new WebSocket(url)
  return () => {
    unsub()
    ws.close()
  }
}, [url])
```

### 5. 卸载后更新状态（async gap）

- **严重级别**：🟡 Warning
- **检查方式**：检查异步操作完成后是否直接 setState 而未判断组件是否仍挂载/请求是否已被取消
- **处理建议**：配合 AbortController 或 `ignore` 标志位；React 18+ 已不再对卸载后 setState 报警告，但仍应避免无效更新与竞态

### 6. 闭包持有大对象/过期引用

- **严重级别**：🔵 Info
- **检查方式**：检查 `useEffect` / `useCallback` 闭包是否长期持有大对象或 DOM 引用导致无法回收
- **处理建议**：用 `useRef` 承载可变引用，清理函数中置空

### 7. 本地存储使用问题

- **严重级别**：🟡 Warning
- **检查方式**：检查 `localStorage` / `sessionStorage` 的使用是否存在以下问题：
  - 未做 `try/catch`（隐私模式/容量超限会抛异常）
  - 存储敏感信息（Token、密码）
  - 数据过期未清理
- **处理建议**：存储操作包裹 `try/catch`；敏感信息使用 httpOnly Cookie；设置过期时间并定期清理
