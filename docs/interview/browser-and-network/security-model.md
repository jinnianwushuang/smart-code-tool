---
title: '浏览器安全模型 [P6-P7]'
level: 'senior'
tags: ['CSP', 'COOP', 'COEP', 'SRI', '沙箱', '安全']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# 浏览器安全模型 [P6-P7]

> 浏览器安全是前端工程师必须掌握的底层知识。2026 年，CSP Level 3、COOP/COEP、Permissions Policy 构成了现代浏览器的纵深防御体系。

## 核心概念（What）

### 安全防御层次

```
┌─────────────────────────────┐
│       传输安全               │
│  HTTPS / HSTS / SRI        │
├─────────────────────────────┤
│       内容安全               │
│  CSP / Trusted Types       │
├─────────────────────────────┤
│       跨域隔离               │
│  COOP / COEP / CORP        │
├─────────────────────────────┤
│       权限控制               │
│  Permissions Policy         │
├─────────────────────────────┤
│       沙箱隔离               │
│  iframe sandbox / Origin    │
└─────────────────────────────┘
```

---

## 底层原理（Why）

### 1. Content Security Policy（CSP）

```
# CSP 响应头
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';

# CSP 演进
Level 1：白名单（容易被绕过）
Level 2：nonce + hash（更安全）
Level 3：strict-dynamic（自动信任被信任脚本加载的脚本）
Level 4：trusted-types（防止 DOM XSS）
```

```html
<!-- Nonce 方式 -->
<script nonce="abc123">
  console.log('trusted script')
</script>

<!-- Hash 方式 -->
<!-- CSP: script-src 'sha256-base64hash...' -->
<script>
  console.log('known script')
</script>

<!-- strict-dynamic：nonce 脚本动态创建的子脚本自动信任 -->
<script nonce="abc123">
  const script = document.createElement('script')
  script.src = '/dynamic.js' // 自动被信任
  document.head.appendChild(script)
</script>
```

### 2. COOP / COEP（跨域隔离）

```
# Cross-Origin-Opener-Policy
# 防止跨域窗口引用攻击
Cross-Origin-Opener-Policy: same-origin

# Cross-Origin-Embedder-Policy
# 阻止加载跨域资源（除非明确允许）
Cross-Origin-Embedder-Policy: require-corp

# 效果：启用 SharedArrayBuffer（用于 WASM 多线程等）
# 需要 COOP + COEP 同时设置

# 跨域资源需要添加 CORP 头
Cross-Origin-Resource-Policy: cross-origin
```

### 3. Trusted Types（防止 DOM XSS）

```typescript
// 启用 Trusted Types
// CSP: require-trusted-types-for 'script'

// 创建策略
const policy = trustedTypes.createPolicy('my-policy', {
  createHTML: (input: string) => DOMPurify.sanitize(input),
  createScriptURL: (input: string) => {
    const url = new URL(input)
    if (url.protocol !== 'https:') throw new Error('Only HTTPS')
    return input
  },
})

// 使用策略
const safeHTML = policy.createHTML(userInput)
element.innerHTML = safeHTML // 安全

// 不使用策略会报错
element.innerHTML = userInput // TypeError: requires Trusted Types
```

### 4. Subresource Integrity（SRI）

```html
<!-- SRI：确保 CDN 资源未被篡改 -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>

<!-- 如果资源被篡改，浏览器会拒绝执行 -->
```

### 5. iframe 沙箱

```html
<!-- 沙箱 iframe -->
<iframe
  src="https://untrusted.com"
  sandbox="allow-scripts allow-same-origin"
  csp="default-src 'none'; script-src 'self'"
></iframe>

<!-- sandbox 属性值 -->
<!-- allow-scripts：允许脚本 -->
<!-- allow-same-origin：允许同源（谨慎使用） -->
<!-- allow-forms：允许表单提交 -->
<!-- allow-popups：允许弹窗 -->
<!-- 空 sandbox = 最严格限制 -->
```

---

## 高频面试题

### Q1: CSP 如何防止 XSS 攻击？

**参考答案要点**：

- 限制脚本来源（script-src 白名单）
- 使用 nonce/hash 只允许已知脚本执行
- strict-dynamic 自动信任被信任脚本加载的子脚本
- 禁止 inline script（默认阻止事件处理器和 javascript: URL）
- frame-ancestors 防止点击劫持

### Q2: COOP/COEP 的作用是什么？

**参考答案要点**：

- COOP：防止跨域窗口引用攻击（window.opener 隔离）
- COEP：阻止加载未授权的跨域资源
- 组合效果：启用跨域隔离，允许使用 SharedArrayBuffer
- 影响：需要为所有跨域资源添加 CORP 头

### Q3: 如何设计一个完整的前端安全方案？

**参考答案要点**：

- 传输层：HTTPS + HSTS + SRI
- 内容层：CSP Level 3 + Trusted Types
- 跨域层：COOP + COEP + CORP
- 权限层：Permissions Policy（限制 API 使用）
- 沙箱层：iframe sandbox + CSP
- 监控层：CSP violation report + Security Headers 扫描

---

## 延伸思考

1. **设计题**：为一个金融应用设计完整的安全策略。
2. **场景题**：CSP 导致第三方脚本无法执行，如何在不降低安全性的情况下解决？
3. **对比题**：CSP nonce vs hash vs strict-dynamic 的 trade-off？

---

## 参考资料

- [CSP Level 3](https://www.w3.org/TR/CSP3/)
- [COOP/COEP](https://web.dev/coop-coep/)
- [Trusted Types](https://web.dev/trusted-types/)
- [Security Headers](https://securityheaders.com)
