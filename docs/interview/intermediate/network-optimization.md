---
title: "前端网络优化：预加载/懒加载/压缩 [P5-P6]"
level: "intermediate"
tags: ["网络优化", "预加载", "懒加载", "压缩", "CDN"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 前端网络优化：预加载/懒加载/压缩 [P5-P6]

> 网络优化是前端性能提升的关键。预加载、懒加载、压缩和 CDN 能显著减少加载时间。

## 核心概念（What）

### 网络优化目标

```
优化目标：
├── 减少请求数量 → 合并、雪碧图
├── 减少请求大小 → 压缩、优化资源
├── 减少请求延迟 → CDN、预加载
├── 减少请求次数 → 缓存、懒加载
└── 提升用户体验 → 首屏加载、交互响应
```

## 底层原理（Why）

### 预加载（Preload/Prefetch）

```html
<!-- preload：当前页面必需资源，高优先级 -->
<link rel="preload" href="/fonts/roboto.woff2" as="font" crossorigin>
<link rel="preload" href="/css/main.css" as="style">
<link rel="preload" href="/js/app.js" as="script">

<!-- prefetch：未来页面可能需要的资源，低优先级 -->
<link rel="prefetch" href="/js/about-page.js">
<link rel="prefetch" href="/images/banner.jpg">

<!-- preconnect：提前建立连接 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- dns-prefetch：提前 DNS 解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- prerender：预渲染整个页面 -->
<link rel="prerender" href="https://example.com/about">
```

```
对比：
┌──────────────┬──────────────┬──────────────┐
│              │   preload    │   prefetch   │
├──────────────┼──────────────┼──────────────┤
│ 优先级       │ 高           │ 低           │
│ 时机         │ 当前页面     │ 未来页面     │
│ 使用场景     │ 关键资源     │ 下一页资源   │
│ 浏览器支持   │ 现代浏览器   │ 现代浏览器   │
└──────────────┴──────────────┴──────────────┘

推荐：
├── preload → 字体、关键 CSS、首屏图片
├── prefetch → 路由懒加载的页面
├── preconnect → API、CDN 域名
└── dns-prefetch → 第三方域名
```

### 懒加载（Lazy Loading）

```javascript
// 1. 图片懒加载（Intersection Observer）
<img data-src="/images/photo.jpg" class="lazy">

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy').forEach(img => {
  observer.observe(img);
});

// 2. 原生懒加载（浏览器支持）
<img loading="lazy" src="/images/photo.jpg" alt="照片">

// 3. 路由懒加载（Vue）
const routes = [
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];

// 4. 组件懒加载（React）
const About = React.lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <About />
    </Suspense>
  );
}

// 5. 无限滚动
const loadMore = async () => {
  const response = await fetch(`/api/data?page=${page}`);
  const data = await response.json();
  items.push(...data);
  page++;
};

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    loadMore();
  }
});
```

### 资源压缩

```
压缩方式：

1. Gzip（最常用）
   ├── 压缩率：60-80%
   ├── 服务器配置
   └── 浏览器自动解压

2. Brotli（更新，压缩率更高）
   ├── 压缩率：70-90%
   ├── 比 Gzip 慢
   └── 现代浏览器支持

3. 代码压缩（构建时）
   ├── Terser → JavaScript 压缩
   ├── cssnano → CSS 压缩
   ├── html-minifier → HTML 压缩
   └── 图片压缩 → TinyPNG、imagemin
```

```nginx
# Nginx 配置 Gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
gzip_comp_level 6;

# Brotli（需要模块）
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

### CDN 优化

```
CDN（内容分发网络）：
├── 全球节点分布
├── 用户从最近节点加载
├── 减少网络延迟
└── 减轻服务器压力

部署策略：
├── 静态资源 → CDN（JS/CSS/图片/字体）
├── HTML → 服务器（不缓存或短缓存）
├── API → 服务器（动态数据）
└── 动态内容 → 服务器

优势：
├── 加速资源加载
├── 减少服务器带宽
├── 提高可用性
└── 防御 DDoS
```

## 实战应用（How）

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

<!-- 4. 占位图 -->
<img 
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3C/svg%3E"
  data-src="/images/photo.jpg"
  class="lazy"
  alt="照片">
```

### 代码分割

```javascript
// Vite 配置
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

// 动态导入
const loadModule = async () => {
  const { default: module } = await import('./heavy-module.js');
  return module;
};

// 路由级别分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.vue')
  }
];
```

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
// LCP (Largest Contentful Paint) → 最大内容绘制
// FID (First Input Delay) → 首次输入延迟
// CLS (Cumulative Layout Shift) → 累计布局偏移

// 上报性能数据
const sendMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const metrics = {
    domContentLoaded: navigation.domContentLoadedEventEnd,
    loadComplete: navigation.loadEventEnd,
    firstByte: navigation.responseStart
  };
  
  navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
};

window.addEventListener('load', sendMetrics);
```

## 高频面试题

### Q1: preload 和 prefetch 的区别？

```
preload：
├── 高优先级
├── 当前页面必需资源
├── 立即加载
└── 字体、关键 CSS

prefetch：
├── 低优先级
├── 未来页面可能需要的资源
├── 空闲时加载
└── 下一页、路由组件
```

### Q2: 如何实现图片懒加载？

```
方法：
├── Intersection Observer（推荐）
├── loading="lazy"（原生）
├── 滚动事件监听
└── 第三方库（lazysizes）

原理：
├── 图片进入视口时才加载
├── 减少首屏请求
└── 提升加载速度

示例：
<img loading="lazy" src="/photo.jpg">

或

<img data-src="/photo.jpg" class="lazy">
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
    }
  });
});
</script>
```

### Q3: 如何优化首屏加载？

```
策略：
├── 路由懒加载 → 减少首屏 JS
├── 图片懒加载 → 减少首屏请求
├── 预加载关键资源 → preload
├── 代码分割 → 按需加载
├── CDN 加速 → 减少延迟
├── Gzip/Brotli → 压缩资源
├── 缓存策略 → 减少请求
└── SSR/SSG → 首屏直出
```

## 延伸思考

1. 如何选择合适的图片格式？
2. Service Worker 离线缓存？
3. 如何监控页面性能？

## 参考资料

- [Web 性能优化](https://web.dev/performance/)
- [资源提示](https://web.dev/resource-hints/)
