# 内存管理（memory-management）

> 检查组件生命周期中的资源清理问题，防止内存泄漏。

## 检查项

### 1. 组件销毁时未清理定时器

- **严重级别**：🔴 Error
- **检查方式**：检查 `setInterval` / `setTimeout` 的返回值是否在 `onBeforeUnmount` 或 `onUnmounted` 中被清除
- **问题示例**：

```javascript
setup() {
  setInterval(() => {
    refresh()
  }, 5000)
  // 未保存返回值，无法清除
}
```

- **正确写法**：

```javascript
import { onBeforeUnmount } from 'vue'

let timer = null
onMounted(() => {
  timer = setInterval(() => {
    refresh()
  }, 5000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
})
```

### 2. 组件销毁时未移除事件监听

- **严重级别**：🔴 Error
- **检查方式**：检查 `addEventListener` / `EventEmitter.on` 是否在 `onBeforeUnmount` 中移除
- **问题示例**：

```javascript
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
// 未移除监听
```

- **正确写法**：

```javascript
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
```

### 3. 组件销毁时未取消 watcher

- **严重级别**：🟡 Warning
- **检查方式**：检查使用 `watch` / `watchEffect` 时是否保存返回值并在卸载时调用停止函数
- **正确写法**：

```javascript
const stopWatch = watchEffect(() => {
  /* ... */
})
onBeforeUnmount(() => {
  stopWatch()
})
```

### 4. 事件总线（mitt/EventBus）未取消监听

- **严重级别**：🔴 Error
- **检查方式**：检查 `emitter.on` 是否在 `onBeforeUnmount` 中调用 `emitter.off`
- **正确写法**：

```javascript
import { emitter, EVENTS } from '@/utils/event-bus'

onMounted(() => {
  emitter.on(EVENTS.DATA_UPDATE, handleUpdate)
})
onBeforeUnmount(() => {
  emitter.off(EVENTS.DATA_UPDATE, handleUpdate)
})
```

### 5. WebWorker 通信未关闭

- **严重级别**：🔴 Error
- **检查方式**：检查 `new Worker()` 是否在 `onBeforeUnmount` 中调用 `worker.terminate()`
- **正确写法**：

```javascript
let worker = null
onMounted(() => {
  worker = new Worker('/worker.js')
  worker.onmessage = handleResult
})
onBeforeUnmount(() => {
  worker?.terminate()
})
```

### 6. 本地存储使用问题

- **严重级别**：🟡 Warning
- **检查方式**：检查 `localStorage` / `sessionStorage` 的使用是否存在以下问题：
  - 未做 `try/catch`（容量超限会抛异常）
  - 存储敏感信息（Token、密码）
  - 数据过期未清理
- **处理建议**：
  - 存储操作包裹 `try/catch`
  - 敏感信息使用 httpOnly Cookie
  - 设置过期时间并定期清理

### 7. DOM 引用未释放

- **严重级别**：🟡 Warning
- **检查方式**：检查 `ref` 引用的 DOM 元素在组件销毁后是否仍被外部变量引用
- **处理建议**：在 `onBeforeUnmount` 中将相关引用置为 `null`
