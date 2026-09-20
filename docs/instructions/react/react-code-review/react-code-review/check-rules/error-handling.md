# 错误处理（error-handling）

> 检查项目中的错误处理完整性，确保异常场景有合理的兜底方案。

## 检查项

### 1. API 请求无错误处理

- **严重级别**：🔴 Error
- **检查方式**：检查所有 API 调用是否有 `catch` 或 `try/catch` 包裹，是否存在空 `catch {}`
- **问题示例**：

```tsx
// 无 catch
const res = await api.getData()

// 空 catch
try {
  await api.getData()
} catch (e) {} // 吞掉错误，用户无感知
```

- **正确写法**：

```tsx
try {
  const res = await api.getData()
  setList(res.data)
} catch (error) {
  message.error('加载数据失败，请稍后重试')
  console.error('API error:', error)
}
```

### 2. 异步操作无 fallback

- **严重级别**：🟡 Warning
- **检查方式**：检查 `async/await` 和 Promise 链是否有错误处理机制，Suspense 是否有 `errorElement` / ErrorBoundary 兜底
- **处理建议**：添加 `try/catch` 或 `.catch()` 并提供 fallback 数据或用户提示

### 3. 组件缺少 ErrorBoundary

- **严重级别**：🟡 Warning
- **检查方式**：检查关键页面/路由是否被 ErrorBoundary 包裹。React 19 中 ErrorBoundary 仍须用 class 组件的 `componentDidCatch` / `getDerivedStateFromError` 实现
- **正确写法**：

```tsx
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('组件错误:', error, info)
    // 上报错误到监控平台
  }
  render() {
    return this.state.hasError ? <FallbackUI /> : this.props.children
  }
}
```

- **处理建议**：路由级、关键区块级添加 ErrorBoundary，展示友好的错误降级 UI

### 4. 用户可见的错误未友好化

- **严重级别**：🟡 Warning
- **检查方式**：检查错误消息是否直接将技术错误信息（堆栈、错误码）展示给用户
- **问题示例**：

```tsx
catch (error) {
  message.error(error.message) // 可能展示 "TypeError: Cannot read properties of undefined"
  message.error(error.stack)   // 更严重，暴露堆栈信息
}
```

- **正确写法**：

```tsx
catch (error) {
  message.error('操作失败，请稍后重试')
  console.error('技术详情:', error) // 技术信息只打印到控制台
}
```

### 5. 全局错误处理缺失

- **严重级别**：🟡 Warning
- **检查方式**：检查应用入口是否配置了 `window.onerror` 和 `window.onunhandledrejection`
- **正确写法**：

```tsx
window.addEventListener('error', (event) => {
  console.error('全局错误捕获:', event.error)
  // 上报错误到监控平台
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
  // 上报错误
})
```
