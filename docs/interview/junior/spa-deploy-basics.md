---
title: "SPA 部署基础（Nginx 配置） [P4-P5]"
level: "junior"
tags: ["部署", "Nginx", "SPA", "CDN", "History 模式"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# SPA 部署基础（Nginx 配置） [P4-P5]

> 单页应用（SPA）部署需要特殊配置。History 模式路由会导致 404 问题，需要 Nginx 配置 try_files 解决。

## 核心概念（What）

### SPA 部署特点

```
SPA（单页应用）部署特点：
├── 只有一个 HTML 文件
├── 所有路由由前端 JS 处理
├── 需要配置 fallback 到 index.html
└── 静态资源需要 CDN

部署流程：
├── 1. 构建：npm run build
├── 2. 输出：dist/ 目录
├── 3. 上传：到服务器或 CDN
├── 4. 配置：Nginx try_files
└── 5. 访问：所有路由返回 index.html
```

## 基础用法（How）

### Nginx 基础配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/my-app/dist;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### try_files 详解

```
try_files 作用：
├── 尝试按顺序查找文件
├── 找到则返回
└── 都找不到则 fallback

示例：
location / {
    try_files $uri $uri/ /index.html;
}

访问 /user/123：
├── 查找 /var/www/my-app/dist/user/123（不存在）
├── 查找 /var/www/my-app/dist/user/123/（不存在）
└── 返回 /index.html

结果：
├── 浏览器加载 index.html
├── Vue/React 接管路由
└── 渲染 /user/123 页面
```

### History 模式 404 问题

```
问题：
SPA 使用 History 路由：
├── /
├── /user
├── /user/123
└── /about

直接访问 /user/123：
├── 浏览器请求 /user/123
├── 服务器找不到文件
└── 返回 404！

解决：
├── Nginx：try_files → /index.html
├── Apache：FallbackResource /index.html
└── Node.js：express-history-api-fallback
```

### Hash 模式 vs History 模式

```
Hash 模式：
├── URL：https://example.com/#/user/123
├── # 后面的内容不发送到服务器
├── 不需要服务器配置
└── 缺点：URL 不美观

History 模式：
├── URL：https://example.com/user/123
├── 美观，像真实路径
├── 需要服务器配置 fallback
└── 推荐生产环境使用

Vue 配置：
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(), // History 模式
  routes: [...]
});

React 配置：
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter>
  <App />
</BrowserRouter>
```

### CDN 部署

```
CDN（内容分发网络）：
├── 将静态资源缓存到全球节点
├── 用户从最近节点加载
├── 加速资源加载
└── 减轻服务器压力

部署策略：
├── HTML → 服务器（不缓存）
├── JS/CSS/图片 → CDN（长期缓存）
└── 文件名带 hash（保证更新）

Vite 构建输出：
dist/
├── index.html              → 服务器
├── assets/
│   ├── app-a1b2c3d4.js     → CDN（带 hash）
│   ├── index-e5f6g7h8.css  → CDN（带 hash）
│   └── logo-i9j0k1l2.png   → CDN
```

### 环境变量

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com

# .env.staging
VITE_API_URL=https://api-staging.example.com
```

```javascript
// 代码中使用
const apiUrl = import.meta.env.VITE_API_URL;

fetch(`${apiUrl}/users`);
```

### 部署检查清单

```
部署前检查：
├── 构建：npm run build
├── 环境变量：检查 API 地址
├── 路由模式：History 需配置 Nginx
├── 静态资源：配置 CDN
├── Gzip：开启压缩
├── HTTPS：配置 SSL 证书
└── 缓存：静态资源长期缓存

部署后验证：
├── 访问首页
├── 刷新子路由（测试 404）
├── 检查接口请求
├── 查看 Console 错误
└── 测试性能（Lighthouse）
```

## 常见面试题

### Q1: 为什么 SPA 需要 try_files？

```
原因：
├── SPA 只有一个 index.html
├── 路由由前端 JS 处理
├── 直接访问子路由，服务器找不到文件
└── 返回 404

try_files 解决：
├── 尝试查找文件
├── 找不到则返回 index.html
└── 前端路由接管渲染
```

### Q2: Hash 模式和 History 模式的区别？

```
┌──────────┬──────────────────┬──────────────────┐
│          │   Hash 模式      │  History 模式    │
├──────────┼──────────────────┼──────────────────┤
│ URL      │ /#/user/123      │ /user/123        │
│ 美观     │ 不美观           │ 美观             │
│ 配置     │ 无需配置         │ 需 try_files     │
│ SEO      │ 不友好           │ 友好             │
│ 兼容性   │ 支持旧浏览器     │ 需要 HTML5       │
└──────────┴──────────────────┴──────────────────┘

推荐：生产环境用 History 模式
```

### Q3: 如何配置 SPA 的缓存策略？

```
HTML 文件：
├── 不缓存或短缓存
├── 每次获取最新版本
└── Cache-Control: no-cache

静态资源（JS/CSS/图片）：
├── 长期缓存（1 年）
├── 文件名带 hash
├── 更新时 hash 变化
└── Cache-Control: public, max-age=31536000, immutable

Nginx 配置：
location / {
    add_header Cache-Control "no-cache";
}

location ~* \.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 延伸练习

1. 本地搭建 Nginx，配置 SPA 部署
2. 测试 History 模式刷新 404 问题
3. 配置静态资源缓存
4. 部署到 CDN（如阿里云 OSS）
5. 配置 HTTPS

## 参考资料

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Vue Router History 模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)
- [React Router 部署](https://create-react-app.dev/docs/deployment/)
