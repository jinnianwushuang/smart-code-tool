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

### 3. 敏感信息硬编码

- **严重级别**：🔴 Error
- **检查方式**：检查代码中是否存在硬编码的 API Key、密码、Token、私钥等
- **问题示例**：

```javascript
const API_KEY = 'sk-abc123def456'
const password = 'admin123'
const secret = '-----BEGIN PRIVATE KEY-----'
```

- **处理建议**：使用环境变量 `import.meta.env.VITE_API_KEY` 管理敏感配置

### 4. URL 拼接未编码

- **严重级别**：🟡 Warning
- **检查方式**：检查 `window.location` 或 URL 拼接中是否对用户输入进行了 `encodeURIComponent` 编码
- **问题示例**：

```javascript
window.location.href = `/search?q=${userInput}`
// 如果 userInput 包含特殊字符，可能导致注入
```

- **正确写法**：

```javascript
window.location.href = `/search?q=${encodeURIComponent(userInput)}`
```

### 5. `localStorage` 存储敏感数据

- **严重级别**：🔴 Error
- **检查方式**：检查 `localStorage.setItem` 是否存储了 Token、密码等敏感信息
- **问题示例**：

```javascript
localStorage.setItem('token', token)
localStorage.setItem('password', password)
```

- **处理建议**：Token 应使用 httpOnly Cookie 存储，密码不应在前端持久化

### 6. 生产环境未关闭 devtools

- **严重级别**：🟡 Warning
- **检查方式**：检查 Vue 配置中是否在生产环境关闭了 devtools
- **问题示例**：

```javascript
// main.js
app.config.devtools = true // 生产环境不应开启
```

- **处理建议**：确保 Vite 构建配置中 `__VUE_PROD_DEVTOOLS__` 为 `false`（默认即为 `false`）
