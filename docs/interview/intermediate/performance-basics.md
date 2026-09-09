---
title: "前端性能优化基础 [P5-P6]"
level: "intermediate"
tags: ["性能优化", "Core Web Vitals", "图片优化", "代码分割"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 前端性能优化基础 [P5-P6]

> 前端性能优化是提升用户体验的关键。掌握 Core Web Vitals、图片优化、代码分割等基础优化手段。

## 核心概念（What）

### 性能指标

```
Core Web Vitals（核心 Web 指标）：

1. LCP (Largest Contentful Paint) → 最大内容绘制
   ├── 目标：< 2.5s
   ├── 衡量：首屏加载速度
   └── 优化：优化关键资源

2. FID (First Input Delay) → 首次输入延迟
   ├── 目标：< 100ms
   ├── 衡量：交互响应速度
   └── 优化：减少 JS 执行时间

3. CLS (Cumulative Layout Shift) → 累计布局偏移
   ├── 目标：< 0.1
   ├── 衡量：视觉稳定性
   └── 优化：避免布局抖动

其他指标：
├── FCP (First Contentful Paint) → 首次内容绘制
├── TTFB (Time to First Byte) → 首字节时间
├── TTI (Time to Interactive) → 可交互时间
└── TBT (Total Blocking Time) → 总阻塞时间
```

## 底层原理（Why）

### 图片优化

```html
<!-- 1. 使用现代格式 -->
<picture>
  <source srcset="/images/photo.webp" type="image/webp">
  <source srcset="/images/photo.jpg" type="image/jpeg">
  <img src="/images/photo.jpg" alt="照片">
</picture>

<!-- 2. 响应式图片 -->
<img 
  srcset="/images/photo-400.jpg 400w,
          /images/photo-800.jpg 800w,
          /images/photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1000px) 800px,
         1200px"
  src="/images/photo-800.jpg"
  alt="照片">

<!-- 3. 懒加载 -->
<img loading="lazy" src="/images/photo.jpg" alt="照片">

<!-- 4. 指定尺寸（避免 CLS） -->
<img src="/photo.jpg" width="800" height="600" alt="照片">
```

```
图片优化策略：
├── 格式选择
│   ├── WebP → 压缩率高（推荐）
│   ├── AVIF → 最新格式
│   └── JPEG/PNG → 兼容性好
├── 尺寸优化
│   ├── 响应式图片（srcset）
│   ├── 缩略图
│   └── 指定宽高
├── 加载优化
│   ├── 懒加载（loading="lazy"）
│   ├── 预加载关键图片
│   └── 渐进式 JPEG
└── 压缩优化
    ├── 无损压缩
    ├── 有损压缩
    └── 工具：TinyPNG、imagemin
```

### 代码分割

```javascript
// 1. 路由级别分割
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];

// 2. 组件级别分割
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 3. 第三方库分割
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  }
}

// 4. 动态导入
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.doSomething();
});
```

### 资源优化

```html
<!-- 1. 预加载关键资源 -->
<link rel="preload" href="/fonts/roboto.woff2" as="font" crossorigin>
<link rel="preload" href="/css/main.css" as="style">

<!-- 2. 预连接 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 3. 异步加载脚本 -->
<script async src="/analytics.js"></script>
<script defer src="/app.js"></script>

<!-- 4. 内联关键 CSS -->
<style>
  /* 首屏关键 CSS */
  .header { ... }
  .hero { ... }
</style>
<link rel="stylesheet" href="/css/main.css">
```

```javascript
// 5. 防抖/节流
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 使用
const handleSearch = debounce((keyword) => {
  fetchResults(keyword);
}, 300);

const handleScroll = throttle(() => {
  updatePosition();
}, 100);
```

### 缓存策略

```nginx
# Nginx 配置

# HTML 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache";
}

# 静态资源长期缓存（文件名带 hash）
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

## 实战应用（How）

### 性能监控

```javascript
// Performance API
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['resource', 'navigation'] });

// Core Web Vitals
// 安装：npm install web-vitals
import { getLCP, getFID, getCLS } from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);

// 上报性能数据
function sendMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const metrics = {
    domContentLoaded: navigation.domContentLoadedEventEnd,
    loadComplete: navigation.loadEventEnd,
    firstByte: navigation.responseStart
  };
  
  navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
}

window.addEventListener('load', sendMetrics);
```

### Lighthouse 审计

```
Lighthouse 审计项：

Performance（性能）：
├── First Contentful Paint
├── Largest Contentful Paint
├── Total Blocking Time
├── Cumulative Layout Shift
└── Speed Index

Accessibility（可访问性）：
├── 颜色对比度
├── 图片 alt 属性
├── 表单标签
└── ARIA 属性

Best Practices（最佳实践）：
├── HTTPS
├── 图片尺寸
├── 控制台错误
└── 安全头

SEO：
├── meta 标签
├── 结构化数据
├── 移动端友好
└── robots.txt
```

## 高频面试题

### Q1: Core Web Vitals 有哪些？

```
三大指标：
├── LCP → 最大内容绘制（< 2.5s）
├── FID → 首次输入延迟（< 100ms）
└── CLS → 累计布局偏移（< 0.1）

优化方向：
├── LCP → 优化关键资源、预加载
├── FID → 减少 JS 执行时间、代码分割
└── CLS → 指定尺寸、避免动态插入
```

### Q2: 如何优化首屏加载？

```
策略：
├── 路由懒加载 → 减少首屏 JS
├── 图片懒加载 → 减少首屏请求
├── 预加载关键资源 → preload
├── 代码分割 → 按需加载
├── CDN 加速 → 减少延迟
├── Gzip 压缩 → 减少体积
├── 缓存策略 → 减少请求
└── SSR/SSG → 首屏直出
```

### Q3: 如何减少 CLS？

```
方法：
├── 指定图片/视频尺寸
├── 预留广告位空间
├── 避免动态插入内容
├── 使用 transform 动画
├── 字体优化（font-display: optional）
└── 骨架屏占位
```

## 延伸思考

1. 如何监控页面性能？
2. 如何优化长列表渲染？
3. Service Worker 离线缓存？

## 参考资料

- [Web 性能优化](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
