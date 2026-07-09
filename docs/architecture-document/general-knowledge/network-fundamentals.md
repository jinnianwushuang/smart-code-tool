# 软件开发者需要了解的网络通用知识

## 概述

网络是软件系统的血管。无论是前端、后端还是移动端，理解网络底层原理能帮助你更高效地排查问题、设计架构和优化性能。本文梳理开发者应掌握的核心网络知识。

---

## TCP/IP 协议栈

### 四层模型

```
应用层     → HTTP / HTTPS / WebSocket / DNS
传输层     → TCP / UDP
网络层     → IP / ICMP
链路层     → 以太网 / Wi-Fi
```

### TCP 三次握手

```
客户端              服务器
  │  SYN (seq=x)  │
  ├───────────────►│
  │SYN+ACK(seq=y) │
  │ack=x+1        │
  │◄───────────────┤
  │  ACK (ack=y+1)│
  ├───────────────►│
  │   连接建立     │
```

**为什么是三次？** 防止已失效的连接请求到达服务器，导致资源浪费。两次握手无法确认客户端的接收能力。

### TCP 四次挥手

```
客户端              服务器
  │    FIN         │
  ├───────────────►│  客户端进入 FIN_WAIT_1
  │    ACK         │
  │◄───────────────┤  服务器进入 CLOSE_WAIT
  │    FIN         │  服务器发送完剩余数据
  │◄───────────────┤
  │    ACK         │
  ├───────────────►│  客户端进入 TIME_WAIT (2MSL)
  │   连接关闭     │
```

**为什么是四次？** 服务器收到 FIN 时可能还有数据未发送完，因此 ACK 和 FIN 分开发送。

### TCP vs UDP

| 特性     | TCP                | UDP                 |
| -------- | ------------------ | ------------------- |
| 连接     | 面向连接           | 无连接              |
| 可靠性   | 可靠（重传、排序） | 不可靠              |
| 顺序     | 保证有序           | 不保证              |
| 速度     | 较慢（有握手开销） | 快                  |
| 适用场景 | HTTP、文件传输     | 视频直播、DNS、游戏 |

---

## HTTP 协议

### HTTP 请求/响应结构

```
请求：
GET /api/users HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer <token>

响应：
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600

{ "users": [...] }
```

### HTTP 方法语义

| 方法    | 语义         | 幂等 | 安全 | 请求体 |
| ------- | ------------ | ---- | ---- | ------ |
| GET     | 获取资源     | ✅   | ✅   | ❌     |
| POST    | 创建资源     | ❌   | ❌   | ✅     |
| PUT     | 全量更新     | ✅   | ❌   | ✅     |
| PATCH   | 部分更新     | ❌   | ❌   | ✅     |
| DELETE  | 删除资源     | ✅   | ❌   | 可选   |
| OPTIONS | 查询支持方法 | ✅   | ✅   | ❌     |

### HTTP 状态码分类

| 范围 | 含义       | 常见状态码                                             |
| ---- | ---------- | ------------------------------------------------------ |
| 1xx  | 信息       | 101 Switching Protocols                                |
| 2xx  | 成功       | 200 OK、201 Created、204 No Content                    |
| 3xx  | 重定向     | 301 永久、302 临时、304 未修改                         |
| 4xx  | 客户端错误 | 400 坏请求、401 未认证、403 禁止、404 未找到、429 限流 |
| 5xx  | 服务器错误 | 500 内部错误、502 网关错误、503 不可用、504 超时       |

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| 特性       | HTTP/1.1       | HTTP/2             | HTTP/3           |
| ---------- | -------------- | ------------------ | ---------------- |
| 传输层     | TCP            | TCP                | QUIC (UDP)       |
| 多路复用   | ❌（队头阻塞） | ✅（同连接多请求） | ✅（无队头阻塞） |
| 头部压缩   | ❌             | HPACK              | QPACK            |
| 服务器推送 | ❌             | ✅                 | ✅               |
| 连接建立   | TCP 三次握手   | TCP + TLS          | QUIC 0-RTT/1-RTT |
| 队头阻塞   | 有（TCP 层）   | 无（应用层）       | 完全无           |

---

## HTTPS / TLS

### TLS 1.3 握手（1-RTT）

```
客户端                          服务器
  │  ClientHello                │
  │  (支持的加密套件 + 密钥共享) │
  ├────────────────────────────►│
  │  ServerHello                │
  │  (选定加密套件 + 密钥共享)   │
  │  + 加密的扩展数据            │
  │◄────────────────────────────┤
  │  客户端验证证书 + 计算密钥   │
  │  Finished (加密)            │
  ├────────────────────────────►│
  │  Finished (加密)            │
  │◄────────────────────────────┤
  │  安全通信开始               │
```

### 核心概念

- **对称加密**：通信双方用同一密钥（AES），速度快
- **非对称加密**：公钥加密、私钥解密（RSA/ECDHE），用于密钥交换
- **证书链**：服务器证书 → 中间证书 → 根证书（浏览器内置信任）
- **HSTS**：`Strict-Transport-Security` 强制浏览器只用 HTTPS 访问

---

## DNS 解析

### 解析流程

```
浏览器缓存 → 操作系统缓存 → 本地 DNS 服务器 → 根域名服务器
    → 顶级域服务器 (.com) → 权威域名服务器 → 返回 IP
```

### DNS 记录类型

| 类型  | 用途                      |
| ----- | ------------------------- |
| A     | 域名 → IPv4 地址          |
| AAAA  | 域名 → IPv6 地址          |
| CNAME | 域名 → 另一个域名（别名） |
| MX    | 邮件服务器                |
| TXT   | 文本记录（SPF、DKIM 等）  |
| NS    | 指定权威 DNS 服务器       |

### DNS 优化

- **DNS 预取**：`<link rel="dns-prefetch" href="//cdn.example.com">`
- **DoH (DNS over HTTPS)**：加密 DNS 查询，防止劫持
- **Anycast**：同一 IP 指向地理最近的 DNS 服务器

---

## WebSocket

### 与 HTTP 的区别

| 特性     | HTTP              | WebSocket        |
| -------- | ----------------- | ---------------- |
| 通信方式 | 请求-响应（单向） | 全双工           |
| 连接     | 短连接/Keep-Alive | 持久连接         |
| 开销     | 每次带完整 Header | 帧头仅 2-14 字节 |
| 适用场景 | REST API          | 实时通信         |

### 握手过程

```
客户端：
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

服务器：
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

---

## 跨域 (CORS)

### 同源策略

协议 + 域名 + 端口三者完全一致才算同源，否则浏览器阻止读取响应。

### 简单请求 vs 预检请求

```
简单请求条件（同时满足）：
- 方法：GET / POST / HEAD
- Content-Type：text/plain、multipart/form-data、application/x-www-form-urlencoded
- 无自定义 Header

不满足 → 先发 OPTIONS 预检请求：

浏览器                    服务器
  │  OPTIONS /api          │
  │  Origin: http://a.com  │
  │  Access-Control-Request-Method: POST
  ├───────────────────────►│
  │  204 OK                │
  │  Access-Control-Allow-Origin: http://a.com
  │  Access-Control-Allow-Methods: POST, GET
  │◄───────────────────────┤
  │  实际 POST 请求        │
  ├───────────────────────►│
  │  正常响应              │
  │◄───────────────────────┤
```

### 常用 CORS 响应头

| Header                             | 说明                       |
| ---------------------------------- | -------------------------- |
| `Access-Control-Allow-Origin`      | 允许的源（`*` 或具体域名） |
| `Access-Control-Allow-Methods`     | 允许的 HTTP 方法           |
| `Access-Control-Allow-Headers`     | 允许的请求头               |
| `Access-Control-Allow-Credentials` | 是否允许携带 Cookie        |
| `Access-Control-Max-Age`           | 预检结果缓存时间（秒）     |

---

## CDN 与缓存策略

### CDN 工作原理

```
用户请求 → CDN 边缘节点（命中缓存？）
  ├── 命中 → 直接返回（毫秒级）
  └── 未命中 → 回源服务器 → 缓存 → 返回
```

### 缓存策略

| 策略     | Header                            | 特点                         |
| -------- | --------------------------------- | ---------------------------- |
| 强缓存   | `Cache-Control: max-age=31536000` | 不请求服务器，直接用本地缓存 |
| 协商缓存 | `ETag` / `Last-Modified`          | 请求服务器验证，304 则用缓存 |
| 不缓存   | `Cache-Control: no-store`         | 每次都重新请求               |

### 缓存最佳实践

```
HTML      → Cache-Control: no-cache（每次验证）
JS/CSS    → Cache-Control: max-age=31536000 + 文件名 hash
图片/字体 → Cache-Control: max-age=31536000 + CDN
API 响应  → Cache-Control: private, no-store（敏感数据）
```

---

## Cookie / Session / Token

### 三者对比

| 特性     | Cookie               | Session      | Token (JWT)              |
| -------- | -------------------- | ------------ | ------------------------ |
| 存储位置 | 浏览器               | 服务器       | 客户端（localStorage等） |
| 跨域     | ❌（受同源策略限制） | ❌           | ✅（可手动携带）         |
| 安全性   | 可设置 HttpOnly      | 较安全       | 需防范 XSS               |
| 扩展性   | 受域名限制           | 需要共享存储 | 无状态，易扩展           |
| 大小     | 4KB 限制             | 无限制       | 较大（包含载荷）         |

### Cookie 安全属性

| 属性       | 作用                                    |
| ---------- | --------------------------------------- |
| `HttpOnly` | JS 无法读取，防 XSS 窃取                |
| `Secure`   | 仅 HTTPS 传输                           |
| `SameSite` | `Strict` / `Lax` / `None`，防 CSRF 攻击 |
| `Domain`   | 指定 Cookie 可用的域名范围              |
| `Path`     | 指定 Cookie 可用的路径范围              |

---

## 网络性能指标

### Web Vitals

| 指标 | 全称                      | 衡量内容         | 良好阈值 |
| ---- | ------------------------- | ---------------- | -------- |
| LCP  | Largest Contentful Paint  | 最大内容渲染时间 | ≤ 2.5s   |
| FID  | First Input Delay         | 首次交互延迟     | ≤ 100ms  |
| CLS  | Cumulative Layout Shift   | 累积布局偏移     | ≤ 0.1    |
| INP  | Interaction to Next Paint | 交互到下次绘制   | ≤ 200ms  |
| TTFB | Time to First Byte        | 首字节到达时间   | ≤ 800ms  |

### 网络请求生命周期

```
DNS 查询 → TCP 连接 → TLS 握手 → 发送请求 → 等待响应(TTFB) → 下载内容
  ↓            ↓           ↓           ↓            ↓              ↓
 快/慢取决于  三次握手  1-RTT/0-RTT  请求大小    服务器处理    带宽
 DNS 缓存    延迟                          网络延迟      速度
```

---

## 常见网络攻击与防护

| 攻击类型     | 原理                     | 防护手段                       |
| ------------ | ------------------------ | ------------------------------ |
| XSS          | 注入恶意脚本到页面       | CSP、转义输出、HttpOnly Cookie |
| CSRF         | 诱导用户发起非预期请求   | SameSite Cookie、CSRF Token    |
| SQL 注入     | 拼接恶意 SQL 语句        | 参数化查询、ORM                |
| DDoS         | 大量请求耗尽服务器资源   | CDN、限流、WAF                 |
| 中间人攻击   | 窃听/篡改通信内容        | HTTPS、证书锁定                |
| Clickjacking | 透明 iframe 覆盖诱导点击 | `X-Frame-Options: DENY`        |

### CSP (Content Security Policy)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src * data:;
  connect-src https://api.example.com;
```

---

## 总结

| 知识领域  | 核心要点                             |
| --------- | ------------------------------------ |
| TCP/IP    | 三次握手、四次挥手、可靠传输         |
| HTTP      | 方法语义、状态码、HTTP/2/3 多路复用  |
| HTTPS/TLS | 证书链、1-RTT 握手、HSTS             |
| DNS       | 解析流程、记录类型、预取优化         |
| WebSocket | 全双工、101 升级握手                 |
| CORS      | 同源策略、预检请求、响应头配置       |
| CDN/缓存  | 强缓存 vs 协商缓存、文件名 hash 策略 |
| 认证      | Cookie/Session/Token 选型与安全属性  |
| 性能      | Web Vitals、请求生命周期优化         |
| 安全      | XSS/CSRF/DDoS 防护、CSP 策略         |

掌握这些网络基础知识，能让你在日常开发中更快定位问题、写出更健壮的代码。
