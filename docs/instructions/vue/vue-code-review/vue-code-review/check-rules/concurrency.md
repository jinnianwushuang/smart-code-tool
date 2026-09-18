# 并发处理（concurrency）

> 检查异步操作和并发场景中的安全问题。

## 检查项

### 1. API 请求竞态条件

- **严重级别**：🔴 Error
- **检查方式**：检查是否存在快速连续发起多个 API 请求但未处理竞态的模式（如搜索框输入、分页切换）
- **问题示例**：

```javascript
async function search(keyword) {
  const res = await api.search(keyword)
  results.value = res.data // 后发的请求可能先返回，导致结果被旧数据覆盖
}
```

- **正确写法**：

```javascript
let currentRequestId = 0

async function search(keyword) {
  const requestId = ++currentRequestId
  const res = await api.search(keyword)
  if (requestId === currentRequestId) {
    results.value = res.data // 只有最新请求才会更新结果
  }
}
```

- **处理建议**：使用 AbortController 取消旧请求，或使用请求 ID 模式

### 2. 异步操作中共享状态未保护

- **严重级别**：🟡 Warning
- **检查方式**：检查多个异步操作是否并发修改同一个响应式数据
- **处理建议**：使用互斥锁或队列机制保护共享状态

### 3. Promise 未处理 rejection

- **严重级别**：🟡 Warning
- **检查方式**：检查 `async/await` 是否有 `try/catch` 包裹，Promise 链是否有 `.catch()`
- **问题示例**：

```javascript
async function loadData() {
  const data = await api.getData() // 如果请求失败，异常未被捕获
  list.value = data
}
```

- **正确写法**：

```javascript
async function loadData() {
  try {
    const data = await api.getData()
    list.value = data
  } catch (error) {
    console.error('加载数据失败:', error)
    // 给用户友好的错误提示
  }
}
```

### 4. 防抖/节流缺失

- **严重级别**：🟡 Warning
- **检查方式**：检查高频触发的事件处理函数（搜索输入、滚动、窗口 resize）是否使用了防抖或节流
- **问题示例**：

```html
<input @input="handleSearch" />
<!-- 每次输入都会触发 API 请求 -->
```

- **正确写法**：

```html
<input @input="debouncedSearch" />
```

```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((e) => {
  api.search(e.target.value)
}, 300)
```

- **处理建议**：高频操作应使用防抖（debounce）或节流（throttle）
