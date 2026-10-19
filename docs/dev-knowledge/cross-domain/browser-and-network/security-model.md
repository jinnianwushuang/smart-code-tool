---
title: '浏览器安全模型 [P6-P7]'
level: 'senior'
tags: ['CSP', 'COOP', 'COEP', 'SRI', '沙箱', '安全']
difficulty: 'hard'
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
│  iframe sandbox / Origin   │
└─────────────────────────────┘
```

---

## 底层原理（Why）

### 1. CSP 执行管线：策略解析 → 资源拦截 → 违规报告

CSP 的底层不是「配置响应头」，而是**浏览器内核级的资源执行拦截管线**。

```
CSP 执行管线：

  策略解析阶段（浏览器收到响应头时）：
    ├── 解析 Content-Security-Policy 头的策略字符串
    ├── 将策略编译为内部规则表：
    │   ├── script-src → 允许执行的脚本来源列表
    │   ├── style-src → 允许加载的样式来源列表
    │   ├── connect-src → 允许发起网络请求的目标列表
    │   └── ...（每个指令对应一类资源）
    └── 策略立即生效（后续所有资源加载都受约束）

  资源拦截阶段（每次加载/执行资源时）：
    ├── 脚本执行前检查：
    │   ├── 内联脚本 → 默认阻止（除非 'unsafe-inline'）
    │   ├── 外部脚本 → 检查来源是否在 script-src 白名单中
    │   ├── nonce 脚本 → 检查 nonce 值是否匹配
    │   └── hash 脚本 → 计算脚本内容的 hash → 比对
    │
    ├── 样式加载检查：
    │   ├── 内联 style 属性 → 默认阻止（除非 'unsafe-inline'）
    │   └── 外部样式表 → 检查 style-src 白名单
    │
    └── 网络请求检查：
        ├── fetch/XHR/WebSocket → 检查 connect-src
        └── 不在白名单 → 请求被阻止（控制台报错）

  CSP 三级演进的安全模型：
    ├── Level 1（白名单模式）：
    │   ├── 问题：白名单可被绕过（JSONP 端点、开放重定向）
    │   └── 只能阻止简单 XSS 注入
    ├── Level 2（nonce/hash 模式）：
    │   ├── 每个脚本需要唯一的 nonce（每次请求重新生成）
    │   ├── 或精确的 hash（脚本内容不变时使用）
    │   └── 解决了白名单绕过问题
    ├── Level 3（strict-dynamic 模式）：
    │   ├── nonce 脚本动态创建的子脚本自动继承信任
    │   ├── 无需为每个动态脚本添加 nonce
    │   └── 解决了动态加载脚本的 CSP 兼容问题
    └── Level 4（trusted-types 模式）：
        ├── 禁止直接赋值 innerHTML/outerHTML/document.write
        ├── 必须通过 Trusted Types 策略（经过消毒函数）
        └── 从根源上消除 DOM-based XSS
```

### 2. 同源策略（SOP）与跨域隔离模型

跨域安全的底层不是「CORS 配置」，而是**同源策略的形式化定义 + COOP/COEP 的进程级隔离**。

```
同源策略与跨域隔离：

  同源策略（Same-Origin Policy）的形式化：
    ├── 同源定义：协议 + 域名 + 端口 三者完全相同
    ├── 限制范围：
    │   ├── DOM 访问：不同源的 iframe 无法访问父页面 DOM
    │   ├── 网络请求：fetch/XHR 受 CORS 约束
    │   ├── Cookie/LocalStorage：不同源无法读取
    │   └── 但：图片/脚本/CSS 加载不受限（可被利用做 CSRF）
    └── 漏洞：document.domain 设置可放宽域名限制（已废弃）

  COOP（Cross-Origin-Opener-Policy）的进程隔离：
    ├── 目的：防止跨域窗口通过 window.opener 引用攻击
    │   ├── 攻击场景：恶意页面通过 window.opener.location = '钓鱼URL'
    │   └── 防御：COOP: same-origin 强制将跨域窗口放入不同的浏览器进程组
    ├── 效果：
    │   ├── 同 COOP 组的窗口共享进程
    │   ├── 不同 COOP 组的窗口隔离到不同进程
    │   └── window.opener 返回 null（跨窗口引用被切断）
    └── 这是启用 SharedArrayBuffer 的前提条件之一

  COEP（Cross-Origin-Embedder-Policy）的资源加载约束：
    ├── 目的：防止加载未授权的跨域资源（防止 Spectre 攻击）
    ├── 效果：
    │   ├── 所有资源必须满足以下条件之一：
    │   │   ├── 同源
    │   │   ├── 带有 CORP: cross-origin 头
    │   │   └── 通过 CORS 协议加载
    │   └── 不满足 → 资源加载被阻止
    └── 与 COOP 组合 → 启用跨域隔离（SharedArrayBuffer 可用）

  CORP（Cross-Origin-Resource-Policy）的资源端授权：
    ├── same-origin：只允许同源页面加载
    ├── same-site：允许同站点（同注册域名）加载
    └── cross-origin：允许任何来源加载
```

### 3. Trusted Types 的 DOM XSS 防御机制

Trusted Types 的底层不是「消毒函数封装」，而是**浏览器原生的赋值拦截 + 类型系统强制约束**。

```
Trusted Types 防御机制：

  DOM XSS 攻击链：
    用户输入 → 危险 Sink（innerHTML/eval/document.write）→ 恶意脚本执行

  Trusted Types 的拦截原理：
    1. 浏览器启用 require-trusted-types-for 'script' 后：
       ├── innerHTML = string → TypeError（直接赋值被阻止）
       ├── eval(string) → TypeError
       ├── document.write(string) → TypeError
       └── 所有「危险 Sink」只接受 Trusted Type 对象

    2. 创建策略（Policy）= 声明消毒逻辑：
       ├── createHTML(input) → 经过 DOMPurify 等库消毒 → 返回 TrustedHTML
       ├── createScript(input) → 经过白名单校验 → 返回 TrustedScript
       └── createScriptURL(input) → 经过 URL 校验 → 返回 TrustedScriptURL

    3. 使用策略后的赋值：
       ├── element.innerHTML = policy.createHTML(userInput) → 安全（已消毒）
       └── 浏览器信任 Trusted Type 对象（不再检查内容）

  为什么比 CSP 更有效：
    ├── CSP nonce/hash 只能控制脚本来源（不能防止脚本内容中的 XSS）
    ├── Trusted Types 直接禁止了所有危险赋值操作
    ├── 开发者必须显式声明消毒逻辑（不能绕过）
    └── 类型系统保证：只有经过消毒的值才能传入 Sink
```

### 4. SRI 与 iframe 沙箱的完整性验证

```
SRI（Subresource Integrity）验证管线：
  ├── 浏览器下载资源后计算 hash（sha256/sha384/sha512）
  ├── 与 integrity 属性中的 hash 比对
  ├── 匹配 → 正常执行
  ├── 不匹配 → 拒绝执行（控制台报 net::ERR_INTEGRITY_FAILURE）
  └── 用途：CDN 资源防篡改（供应链攻击防御）

iframe 沙箱隔离模型：
  ├── sandbox 属性为空 → 最严格限制：
  │   ├── 禁止脚本执行
  │   ├── 禁止表单提交
  │   ├── 禁止弹窗
  │   ├── 禁止同源访问（视为唯一不透明源）
  │   └── 禁止 Top Navigation
  ├── 按需放开：
  │   ├── allow-scripts → 允许脚本（但禁止同源，脚本无法访问父页面）
  │   ├── allow-same-origin → 恢复同源（⚠️ 与 allow-scripts 组合有风险）
  │   └── allow-forms → 允许表单提交
  └── 安全原则：allow-scripts + allow-same-origin 不要同时设置
      （否则 iframe 可以移除自己的 sandbox 属性）
```

---

## 高频面试题

### Q1: CSP 如何防止 XSS 攻击？

**参考答案要点**：

- CSP 执行管线：策略解析 → 资源拦截 → 违规报告
- nonce/hash 只允许已知脚本执行（Level 2+）
- strict-dynamic 自动信任被信任脚本加载的子脚本（Level 3）
- Trusted Types 禁止直接赋值 innerHTML（Level 4，从根源消除 DOM XSS）
- frame-ancestors 防止点击劫持

### Q2: COOP/COEP 的作用是什么？

**参考答案要点**：

- COOP：进程级隔离，防止跨域窗口引用攻击（window.opener 隔离）
- COEP：资源加载约束，阻止未授权的跨域资源（防 Spectre 攻击）
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
