# 安全（security）

> 检查项目中的安全漏洞和风险。

## 检查项

### 1. 不安全的正则表达式

- **严重级别**：🔴 Error
- **检查方式**：检查正则表达式中是否存在嵌套量词等可能触发 ReDoS（正则表达式拒绝服务攻击）的模式
- **问题示例**：

```javascript
// 嵌套量词，可能导致指数级回溯
const regex = /^(a+)+$/
const regex2 = /([a-zA-Z]+)*[0-9]/
```

- **处理建议**：使用更精确的正则表达式，避免嵌套量词

### 2. `eval()` / `new Function()` 使用

- **严重级别**：🔴 Error
- **检查方式**：扫描代码中是否存在 `eval()`、`new Function()`、`setTimeout(string)` 等动态执行代码的调用
- **问题示例**：

```javascript
eval('alert("xss")')
const fn = new Function('return ' + userInput)
setTimeout('doSomething()', 1000) // 字符串形式
```

- **处理建议**：使用 `JSON.parse()` 替代 `eval()`，使用函数引用替代字符串

### 3. dangerouslySetInnerHTML 注入 XSS

- **严重级别**：🔴 Error
- **检查方式**：检查 `dangerouslySetInnerHTML` 的内容是否来自用户输入或未经消毒的后端数据
- **问题示例**：

```tsx
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

- **正确写法**：

```tsx
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

- **处理建议**：优先文本渲染；确需富文本必须经 DOMPurify 等消毒

### 4. 敏感信息硬编码

- **严重级别**：🔴 Error
- **检查方式**：检查代码中是否存在硬编码的 API Key、密码、Token、私钥等
- **问题示例**：

```javascript
const API_KEY = 'sk-abc123def456'
const password = 'admin123'
```

- **处理建议**：使用环境变量 `import.meta.env.VITE_API_KEY`（Vite）或框架密钥管理；服务端密钥严禁出现在客户端 bundle

### 5. URL 拼接未编码

- **严重级别**：🟡 Warning
- **检查方式**：检查 `window.location`、`href` 或 URL 拼接中是否对用户输入进行了 `encodeURIComponent` 编码
- **问题示例**：

```javascript
window.location.href = `/search?q=${userInput}`
```

- **正确写法**：

```javascript
window.location.href = `/search?q=${encodeURIComponent(userInput)}`
```

### 6. 本地存储敏感数据 / 生产环境调试开启

- **严重级别**：🔴 Error
- **检查方式**：
  - 检查 `localStorage` / `sessionStorage` / `cookie` 是否存储 Token、密码等敏感信息（非 httpOnly）
  - 检查生产构建是否残留 sourcemap 泄露、React DevTools 生产提示、调试开关
- **处理建议**：Token 使用 httpOnly Cookie；生产环境关闭 sourcemap 或设为 hidden；密码不应在前端持久化
