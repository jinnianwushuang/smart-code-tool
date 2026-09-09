---
title: "Web 安全实战：CSP/SRI/依赖检查 [P5-P6]"
level: "intermediate"
tags: ["安全", "CSP", "SRI", "依赖检查", "Helmet"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Web 安全实战：CSP/SRI/依赖检查 [P5-P6]

> Web 安全是前端必须掌握的知识。CSP、SRI、依赖检查是常用的安全手段，能有效防范 XSS 和供应链攻击。

## 核心概念（What）

### 安全防线

```
前端安全防线：
├── CSP → 内容安全策略（防 XSS）
├── SRI → 子资源完整性（防篡改）
├── 依赖检查 → 检查已知漏洞
├── HTTPS → 加密传输
├── HttpOnly Cookie → 防止 JS 读取
├── SameSite Cookie → 防 CSRF
└── Helmet → 安全响应头

安全威胁：
├── XSS → 注入恶意脚本
├── CSRF → 伪造用户请求
├── 点击劫持 → 诱导点击
├── 供应链攻击 → 第三方库被篡改
└── 数据泄露 → 敏感信息暴露
```

## 底层原理（Why）

### CSP（Content Security Policy）

```html
<!-- 1. HTTP 响应头 -->
Content-Security-Policy: default-src 'self';
Content-Security-Policy: script-src 'self' https://cdn.example.com;
Content-Security-Policy: style-src 'self' 'unsafe-inline';

<!-- 2. Meta 标签 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

<!-- 3. 常用指令 -->
<!--
default-src → 默认策略
script-src → JavaScript 来源
style-src → CSS 来源
img-src → 图片来源
connect-src → API 请求来源
font-src → 字体来源
object-src → 插件（flash 等）
frame-src → iframe 来源
-->

<!-- 4. 特殊值 -->
<!--
'self' → 同源
'unsafe-inline' → 允许内联（不推荐）
'unsafe-eval' → 允许 eval（不推荐）
'none' → 禁止所有
nonce-xxx → 使用 nonce
hash-xxx → 使用 hash
-->

<!-- 5. nonce 示例 -->
<!-- 服务端生成随机 nonce -->
<script nonce="abc123">
  console.log('允许执行');
</script>

<!-- CSP 头 -->
Content-Security-Policy: script-src 'nonce-abc123'

<!-- 6. hash 示例 -->
<script>console.log('allowed');</script>

<!-- CSP 头 -->
Content-Security-Policy: script-src 'sha256-xxx'
```

```javascript
// CSP 报告
// 配置 report-uri 或 report-to
Content-Security-Policy: default-src 'self'; report-uri /csp-report

// 服务端接收报告
app.post('/csp-report', (req, res) => {
  console.log('CSP 违规:', req.body);
  res.sendStatus(204);
});

// 只报告不阻止（测试用）
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

### SRI（Subresource Integrity）

```html
<!-- SRI = 验证资源完整性 -->

<!-- 1. 生成 hash -->
<!-- openssl dgst -sha384 -binary jquery.min.js | openssl base64 -A -->

<!-- 2. 添加 integrity 属性 -->
<script 
  src="https://cdn.example.com/jquery.min.js"
  integrity="sha384-xxx"
  crossorigin="anonymous">
</script>

<link 
  rel="stylesheet" 
  href="https://cdn.example.com/bootstrap.min.css"
  integrity="sha384-yyy"
  crossorigin="anonymous">

<!-- 3. 工作原理 -->
<!--
├── 浏览器下载资源
├── 计算 hash
├── 对比 integrity 中的 hash
├── 匹配 → 执行/应用
└── 不匹配 → 拒绝加载
-->

<!-- 4. 生成工具 -->
<!-- https://www.srihash.org/ -->
<!-- npm install sri-toolbox -->
```

### 依赖安全检查

```bash
# 1. npm audit
npm audit
npm audit fix
npm audit fix --force

# 2. yarn audit
yarn audit
yarn audit fix

# 3. pnpm audit
pnpm audit

# 4. 第三方工具
# Snyk
npm install -g snyk
snyk test
snyk monitor

# Socket
# Depcheck

# 5. CI/CD 集成
# .github/workflows/security.yml
name: Security Check
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=high
```

### 安全响应头

```javascript
// Helmet（Express 中间件）
const helmet = require('helmet');
app.use(helmet());

// 自动设置以下响应头：
// Content-Security-Policy
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Strict-Transport-Security
// Referrer-Policy

// 手动配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));

// Nginx 配置
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'";
```

## 实战应用（How）

### 安全检查清单

```
开发阶段：
├── 启用 HTTPS
├── 配置 CSP
├── 使用 SRI（CDN 资源）
├── HttpOnly Cookie
├── SameSite Cookie
└── 输入验证

部署阶段：
├── npm audit → 检查依赖
├── 安全响应头 → Helmet/Nginx
├── CORS 配置 → 限制来源
└── 环境变量 → 不暴露敏感信息

运行阶段：
├── 监控错误日志
├── 监控安全事件
├── 定期更新依赖
└── 定期安全审计
```

### 依赖安全最佳实践

```json
// package.json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "precommit": "npm audit"
  },
  
  "overrides": {
    "lodash": "4.17.21"
  }
}

// .npmrc
audit-level=high
```

```javascript
// 锁定版本
// package-lock.json / pnpm-lock.yaml

// 使用精确版本
{
  "dependencies": {
    "lodash": "4.17.21" // 不使用 ^ 或 ~
  }
}

// 定期更新
// npm update
// npm outdated
```

### XSS 防范

```vue
<!-- Vue 自动转义 -->
<template>
  <!-- 安全：自动转义 -->
  <p>{{ userInput }}</p>
  
  <!-- 危险：v-html -->
  <div v-html="userInput"></div>
</template>

<script setup>
import DOMPurify from 'dompurify';

const userInput = '<script>alert(1)</script>';

// 使用 DOMPurify 消毒
const safeHtml = computed(() => DOMPurify.sanitize(userInput));
</script>
```

```javascript
// React 自动转义
function Component() {
  const userInput = '<script>alert(1)</script>';
  
  // 安全：自动转义
  return <div>{userInput}</div>;
  
  // 危险：dangerouslySetInnerHTML
  // return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
}

// 使用 DOMPurify
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(userInput);
return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
```

## 高频面试题

### Q1: CSP 的作用？

```
CSP（Content Security Policy）：
├── 限制资源加载来源
├── 防止 XSS 攻击
├── 阻止恶意脚本执行
└── 报告违规行为

配置方式：
├── HTTP 响应头
├── Meta 标签
└── nonce/hash

常用指令：
├── default-src → 默认
├── script-src → JS
├── style-src → CSS
└── img-src → 图片
```

### Q2: SRI 的原理？

```
SRI（Subresource Integrity）：
├── 验证资源完整性
├── 防止 CDN 被篡改
├── 使用 hash 校验
└── 不匹配则拒绝加载

使用：
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-xxx"
  crossorigin="anonymous">
</script>
```

### Q3: 如何检查依赖安全？

```
工具：
├── npm audit → 官方工具
├── yarn audit → Yarn 自带
├── snyk → 第三方平台
└── CI/CD 集成

流程：
├── 定期运行 npm audit
├── 修复高危漏洞
├── 锁定版本（lock 文件）
└── 使用精确版本号
```

## 延伸思考

1. 如何设计安全的前端架构？
2. 如何做安全审计？
3. 如何处理安全漏洞？

## 参考资料

- [CSP 官方文档](https://content-security-policy.com/)
- [SRI Hash Generator](https://www.srihash.org/)
- [Helmet.js](https://helmetjs.github.io/)
