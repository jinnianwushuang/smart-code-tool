# 错误处理（error-handling）

> 检查项目中的错误处理完整性，确保异常场景有合理的兜底方案。

## 检查项

### 1. API 请求无错误处理

- **严重级别**：🔴 Error
- **检查方式**：检查所有 API 调用是否有 `catch` 或 `try/catch` 包裹，是否存在空 `catch {}`
- **问题示例**：

```javascript
// 无 catch
const res = await api.getData()

// 空 catch
try {
  await api.getData()
} catch (e) {} // 吞掉错误，用户无感知
```

- **正确写法**：

```javascript
try {
  const res = await api.getData()
  list.value = res.data
} catch (error) {
  ElMessage.error('加载数据失败，请稍后重试')
  console.error('API error:', error)
}
```

### 2. 异步操作无 fallback

- **严重级别**：🟡 Warning
- **检查方式**：检查 `async/await` 和 Promise 链是否有错误处理机制
- **问题示例**：

```javascript
const data = await api.fetchList() // 如果失败，整个函数中断
```

- **处理建议**：添加 `try/catch` 或 `.catch()` 并提供 fallback 数据或用户提示

### 3. 组件缺少 Error Boundary

- **严重级别**：🔵 Info
- **检查方式**：检查关键页面组件是否使用 `onErrorCaptured` 捕获子组件错误
- **正确写法**：

```javascript
import { onErrorCaptured, ref } from 'vue'

const hasError = ref(false)

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  console.error('组件错误:', error, info)
  return false // 阻止错误继续向上传播
})
```

- **处理建议**：关键页面组件建议添加错误边界，展示友好的错误降级 UI

### 4. 用户可见的错误未友好化

- **严重级别**：🟡 Warning
- **检查方式**：检查错误消息是否直接将技术错误信息（如堆栈、错误码）展示给用户
- **问题示例**：

```javascript
catch (error) {
  ElMessage.error(error.message) // 可能展示 "TypeError: Cannot read property 'x' of undefined"
  ElMessage.error(error.stack)   // 更严重，暴露堆栈信息
}
```

- **正确写法**：

```javascript
catch (error) {
  ElMessage.error('操作失败，请稍后重试')
  console.error('技术详情:', error) // 技术信息只打印到控制台
}
```

### 5. 全局错误处理缺失

- **严重级别**：🟡 Warning
- **检查方式**：检查应用入口是否配置了 `app.config.errorHandler` 和 `window.onunhandledrejection`
- **正确写法**：

```javascript
// main.js
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误捕获:', error)
  // 上报错误到监控平台
}

window.onunhandledrejection = (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
  // 上报错误
}
```
