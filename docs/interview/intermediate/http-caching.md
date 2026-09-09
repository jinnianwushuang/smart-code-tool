---
title: "HTTP 缓存策略：强缓存/协商缓存 [P5-P6]"
level: "intermediate"
tags: ["HTTP", "缓存", "Cache-Control", "ETag", "性能优化"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# HTTP 缓存策略：强缓存/协商缓存 [P5-P6]

> HTTP 缓存是前端性能优化的关键。合理使用缓存能大幅减少网络请求，提升加载速度。

## 核心概念（What）

### 缓存的作用

```
HTTP 缓存的好处：
├── 减少网络请求 → 加快加载速度
├── 减少服务器压力 → 降低带宽成本
├── 提升用户体验 → 秒开页面
└── 减少 CDN 流量 → 降低成本

缓存分类：
├── 强缓存 → 不发请求，直接用本地缓存
└── 协商缓存 → 发请求确认，再决定是否使用缓存
```

## 底层原理（Why）

### 强缓存

```
强缓存 = 不发请求，直接使用本地缓存

控制字段：

1. Cache-Control（HTTP/1.1，优先级高）
   Cache-Control: max-age=31536000
   → 31536000 秒内（1 年）直接使用缓存

   常见值：
   ├── max-age=3600       → 缓存 1 小时
   ├── max-age=31536000   → 缓存 1 年
   ├── no-cache           → 不缓存（实际是协商缓存）
   ├── no-store           → 完全不缓存
   ├── public             → 允许 CDN 缓存
   └── private            → 只允许浏览器缓存

2. Expires（HTTP/1.0，绝对时间）
   Expires: Wed, 21 Oct 2026 07:28:00 GMT
   → 到指定时间过期

   缺点：
   ├── 服务器和客户端时间可能不一致
   └── 修改时间需要重新设置

优先级：Cache-Control > Expires

流程：
├── 1. 浏览器发起请求
├── 2. 检查 Cache-Control / Expires
├── 3. 未过期 → 直接使用缓存（200 from cache）
└── 4. 已过期 → 进入协商缓存
```

### 协商缓存

```
协商缓存 = 发请求确认，再决定是否使用缓存

控制字段：

1. ETag / If-None-Match（优先级高）
   服务端：ETag: "abc123"
   客户端：If-None-Match: "abc123"

   流程：
   ├── 1. 首次请求 → 服务端返回 ETag
   ├── 2. 缓存 ETag
   ├── 3. 再次请求 → 携带 If-None-Match
   ├── 4. 服务端对比 ETag
   │   ├── 相同 → 304 Not Modified（使用缓存）
   │   └── 不同 → 200 + 新内容 + 新 ETag
   └── 5. 浏览器更新缓存

2. Last-Modified / If-Modified-Since
   服务端：Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
   客户端：If-Modified-Since: Wed, 21 Oct 2026 07:28:00 GMT

   缺点：
   ├── 精度只有秒级
   ├── 文件修改但内容没变 → 误判
   └── 文件没修改但内容变了 → 误判

优先级：ETag > Last-Modified
```

### 缓存决策流程

```
请求流程：

1. 检查强缓存
   ├── Cache-Control / Expires
   ├── 未过期 → 200 from cache（不发请求）
   └── 已过期 → 进入协商缓存

2. 协商缓存
   ├── ETag / If-None-Match
   ├── Last-Modified / If-Modified-Since
   ├── 服务端对比
   │   ├── 没变 → 304 Not Modified（使用缓存）
   │   └── 变了 → 200 + 新内容
   └── 更新本地缓存

3. 无缓存
   └── 正常请求 → 200 + 内容
```

## 实战应用（How）

### 缓存策略设计

```
策略：
├── HTML → 不缓存（no-cache）
├── JS/CSS（带 hash）→ 长期缓存（1 年）
├── 图片/字体 → 长期缓存（1 年）
├── API 响应 → 短缓存（几分钟）
└── 动态数据 → 不缓存

Nginx 配置：
# HTML 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache";
}

# JS/CSS 长期缓存（文件名带 hash）
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# 图片长期缓存
location ~* \.(png|jpg|jpeg|gif|svg|ico|webp)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# 字体长期缓存
location ~* \.(woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 文件名 Hash 策略

```
Vite 构建输出：
dist/
├── index.html              → 不缓存
├── assets/
│   ├── app-a1b2c3d4.js     → 长期缓存
│   ├── index-e5f6g7h8.css  → 长期缓存
│   └── logo-i9j0k1l2.png   → 长期缓存

原理：
├── 文件名包含内容 hash
├── 内容变化 → hash 变化 → 文件名变化
├── 浏览器认为是新文件 → 重新下载
└── 内容不变 → hash 不变 → 使用缓存

优势：
├── 长期缓存（减少请求）
├── 内容更新（文件名变化）
└── 版本控制（hash 标识）
```

### 缓存更新策略

```javascript
// 1. 版本号更新
// index.html 中引用带版本的资源
<script src="/js/app.js?v=1.2.3"></script>

// 2. Service Worker 缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ]);
    })
  );
});

// 3. 强制刷新
// 用户操作：Cmd/Ctrl + Shift + R
// 或清除浏览器缓存

// 4. 服务端控制
// 设置短缓存 + ETag
Cache-Control: max-age=60 // 1 分钟
```

## 高频面试题

### Q1: 强缓存和协商缓存的区别？

```
强缓存：
├── 不发请求
├── 直接使用本地缓存
├── 控制字段：Cache-Control / Expires
├── 状态码：200 from cache
└── 速度快

协商缓存：
├── 发请求确认
├── 服务端判断是否更新
├── 控制字段：ETag / Last-Modified
├── 状态码：304 Not Modified
└── 保证一致性
```

### Q2: Cache-Control 的常用值？

```
┌──────────────────┬──────────────────────────┐
│ 值               │ 含义                     │
├──────────────────┼──────────────────────────┤
│ max-age=3600     │ 缓存 3600 秒             │
│ no-cache         │ 不缓存（协商缓存）       │
│ no-store         │ 完全不缓存               │
│ public           │ 允许 CDN 缓存            │
│ private          │ 只允许浏览器缓存         │
│ immutable        │ 不可变（不检查）         │
└──────────────────┴──────────────────────────┘

推荐组合：
├── HTML → no-cache
├── 静态资源（带 hash）→ public, max-age=31536000, immutable
└── API → no-store 或短 max-age
```

### Q3: ETag 和 Last-Modified 的区别？

```
┌──────────────┬──────────────┬──────────────┐
│              │    ETag      │ Last-Modified│
├──────────────┼──────────────┼──────────────┤
│ 精度         │ 高（hash）   │ 低（秒级）   │
│ 性能         │ 需要计算     │ 读取时间戳   │
│ 准确性       │ 高           │ 可能误判     │
│ 优先级       │ 高           │ 低           │
└──────────────┴──────────────┴──────────────┘

推荐：优先使用 ETag
```

## 延伸思考

1. 如何设计缓存策略？
2. Service Worker 缓存的优势？
3. 缓存失效的常见问题？

## 参考资料

- [HTTP 缓存](https://web.dev/http-cache/)
- [Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)
