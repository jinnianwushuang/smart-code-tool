---
title: "本地存储与 Cookie 基础 [P4-P5]"
level: "junior"
tags: ["localStorage", "sessionStorage", "Cookie", "存储"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# 本地存储与 Cookie 基础 [P4-P5]

> 浏览器提供多种存储方式：localStorage（永久）、sessionStorage（会话）、Cookie（随请求发送）。

## 核心概念（What）

### 三种存储对比

```
┌────────────────┬──────────────┬──────────────┬──────────────┐
│                │ localStorage │ sessionStorage│   Cookie     │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ 生命周期       │ 永久（手动删）│ 标签页关闭   │ 设定过期时间 │
│ 容量           │ ~5MB         │ ~5MB         │ ~4KB         │
│ 随请求发送     │ 否           │ 否           │ 是           │
│ 跨标签页       │ 共享         │ 不共享       │ 共享         │
│ API            │ 简单         │ 简单         │ 复杂         │
└────────────────┴──────────────┴──────────────┴──────────────┘

选择规则：
├── 用户偏好/主题 → localStorage
├── 临时表单数据 → sessionStorage
├── 认证 Token   → Cookie（httpOnly）
└── 大量数据     → IndexedDB
```

### localStorage

```javascript
// 存储（只能存字符串）
localStorage.setItem('theme', 'dark');
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));

// 读取
const theme = localStorage.getItem('theme'); // 'dark'
const user = JSON.parse(localStorage.getItem('user'));

// 删除
localStorage.removeItem('theme');

// 清空
localStorage.clear();

// 注意：存储对象需要先 JSON.stringify，读取时 JSON.parse
```

### sessionStorage

```javascript
// API 与 localStorage 完全一致
sessionStorage.setItem('temp', 'data');
const temp = sessionStorage.getItem('temp');
sessionStorage.removeItem('temp');

// 区别：关闭标签页后数据消失
```

### Cookie

```javascript
// 设置 Cookie
document.cookie = 'name=Alice; max-age=86400; path=/';
document.cookie = 'theme=dark; expires=Fri, 31 Dec 2026 23:59:59 GMT';

// 读取所有 Cookie
document.cookie; // "name=Alice; theme=dark"

// 删除（设置过期时间为过去）
document.cookie = 'name=; max-age=0';

// Cookie 属性：
// ├── max-age=秒数    有效期（秒）
// ├── expires=日期     过期日期
// ├── path=/          有效路径
// ├── domain=xxx.com  有效域名
// ├── secure          仅 HTTPS 发送
// └── httpOnly        JS 无法访问（安全）
```

---

## 常见面试题

### Q1: localStorage 和 Cookie 的区别？

**答**：
- localStorage：5MB、不随请求发送、API 简单
- Cookie：4KB、随请求发送、有过期时间、可设 httpOnly

### Q2: localStorage 能存对象吗？

**答**：不能直接存。需要 `JSON.stringify()` 转字符串存储，读取时 `JSON.parse()` 转回对象。

### Q3: 关闭浏览器后哪些数据会丢失？

**答**：sessionStorage 会丢失。localStorage 和 Cookie（未设过期时间）不会丢失。

---

## 延伸练习

1. 用 localStorage 保存用户主题偏好
2. 在 DevTools Application 面板查看存储数据
3. 用 `document.cookie` 设置和读取 Cookie

---

## 参考资料

- [Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)
