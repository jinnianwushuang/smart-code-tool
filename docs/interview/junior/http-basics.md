---
title: "HTTP 协议基础 [P4-P5]"
level: "junior"
tags: ["HTTP", "HTTPS", "状态码", "请求方法", "Header"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# HTTP 协议基础 [P4-P5]

> HTTP 是浏览器与服务器通信的协议。理解请求方法、状态码和 Header 是前端开发的基础。

## 核心概念（What）

### 请求方法

```
常用 HTTP 方法：

GET    → 获取资源（幂等，可缓存）
POST   → 提交数据（创建资源）
PUT    → 完整更新资源（幂等）
PATCH  → 部分更新资源
DELETE → 删除资源（幂等）

GET vs POST：
├── GET：参数在 URL 中，有长度限制，可缓存，可收藏
├── POST：参数在请求体中，无长度限制，不可缓存
└── 获取数据用 GET，提交数据用 POST
```

### 状态码

```
2xx 成功：
├── 200 OK              成功
├── 201 Created         创建成功
└── 204 No Content      成功但无内容

3xx 重定向：
├── 301 Moved Permanently 永久重定向（SEO 传递）
├── 302 Found             临时重定向
└── 304 Not Modified      协商缓存命中

4xx 客户端错误：
├── 400 Bad Request       请求格式错误
├── 401 Unauthorized      未认证
├── 403 Forbidden         无权限
├── 404 Not Found         资源不存在
└── 405 Method Not Allowed 方法不允许

5xx 服务器错误：
├── 500 Internal Server Error 服务器内部错误
├── 502 Bad Gateway           网关错误
├── 503 Service Unavailable   服务不可用
└── 504 Gateway Timeout       网关超时
```

### 请求/响应结构

```
请求结构：
GET /api/users?page=1 HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer token123
Cookie: sessionId=abc

响应结构：
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: sessionId=abc
Content-Length: 256

{"users": [...], "total": 100}
```

### 常用 Header

```
请求 Header：
├── Content-Type: application/json     请求体格式
├── Accept: application/json           期望的响应格式
├── Authorization: Bearer <token>      认证信息
├── Cookie: key=value                  Cookie
└── User-Agent: Mozilla/5.0...         浏览器信息

响应 Header：
├── Content-Type: application/json     响应体格式
├── Set-Cookie: key=value              设置 Cookie
├── Cache-Control: max-age=3600        缓存控制
├── Access-Control-Allow-Origin: *     CORS 跨域
└── Content-Length: 256                响应体大小
```

### HTTPS

```
HTTP vs HTTPS：
├── HTTP：明文传输，不安全
├── HTTPS：HTTP + TLS/SSL 加密，安全
└── URL 区别：http:// vs https://

HTTPS 过程（简化）：
1. 客户端请求 HTTPS 连接
2. 服务器返回证书
3. 客户端验证证书
4. 协商加密密钥
5. 加密通信
```

---

## 常见面试题

### Q1: GET 和 POST 的区别？

**答**：GET 用于获取数据（参数在 URL，可缓存），POST 用于提交数据（参数在请求体，不可缓存）。

### Q2: 301 和 302 的区别？

**答**：301 永久重定向（搜索引擎更新 URL），302 临时重定向（搜索引擎保留原 URL）。

### Q3: 401 和 403 的区别？

**答**：401 未认证（需要登录），403 已认证但无权限。

---

## 延伸练习

1. 在 DevTools Network 面板查看一个请求的 Header
2. 解释 200/301/404/500 状态码的含义
3. 用 `fetch` 发送 GET 和 POST 请求

---

## 参考资料

- [HTTP 协议教程](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)
- [HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)
