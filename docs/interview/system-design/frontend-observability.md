---
title: '前端可观测性 [P8]'
level: 'architect'
tags: ['埋点', '性能监控', '错误追踪', '用户行为']
difficulty: 'expert'
updated: '2026-09-10'
target: '架构师（P8）'
---

# 前端可观测性 [P8]

> 可观测性不是「加个监控」，而是建立从用户行为到系统状态的完整洞察链。2026 年，前端可观测性涵盖埋点、性能、错误、用户行为四大体系。

## 核心概念（What）

### 可观测性三大支柱（前端版）

```
├── 指标（Metrics）
│   ├── 性能指标（CWV、FCP、LCP、INP）
│   ├── 业务指标（PV/UV、转化率、留存率）
│   └── 错误指标（错误率、影响用户数）
├── 日志（Logs）
│   ├── 错误日志（Error Boundary、Sentry）
│   ├── 操作日志（用户行为链路）
│   └── 性能日志（资源加载、API 耗时）
└── 追踪（Traces）
    ├── 用户行为追踪（页面浏览、点击、转化）
    ├── 请求链路追踪（前端 → BFF → 微服务）
    └── 性能追踪（长任务、阻塞渲染）
```

---

## 底层原理（Why）

### 1. 性能监控

```typescript
// Core Web Vitals 采集
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals'

// 累积布局偏移
onCLS((metric) => {
  sendToAnalytics('CLS', metric.value)
})

// 首次输入延迟
onFID((metric) => {
  sendToAnalytics('FID', metric.value)
})

// 最大内容绘制
onLCP((metric) => {
  sendToAnalytics('LCP', metric.value)
})

// 交互到下次绘制（2026 替代 FID）
onINP((metric) => {
  sendToAnalytics('INP', metric.value)
})

// 首字节时间
onTTFB((metric) => {
  sendToAnalytics('TTFB', metric.value)
})

// 自定义性能指标
class PerformanceMonitor {
  // API 请求耗时
  trackAPI(url: string, startTime: number) {
    const duration = performance.now() - startTime
    sendToAnalytics('api_duration', { url, duration })
  }

  // 组件渲染耗时
  trackRender(componentName: string, callback: () => void) {
    const start = performance.now()
    callback()
    const duration = performance.now() - start
    if (duration > 16) {
      // 超过一帧
      sendToAnalytics('slow_render', { component: componentName, duration })
    }
  }

  // 长任务监控
  observeLongTasks() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        sendToAnalytics('long_task', { duration: entry.duration, startTime: entry.startTime })
      }
    }).observe({ entryTypes: ['longtask'] })
  }
}
```

### 2. 错误追踪

```typescript
// 全局错误捕获
class ErrorTracker {
  init() {
    // JS 错误
    window.addEventListener('error', (event) => {
      this.capture({
        type: 'js_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    })

    // Promise 未捕获异常
    window.addEventListener('unhandledrejection', (event) => {
      this.capture({
        type: 'promise_rejection',
        message: String(event.reason),
        stack: event.reason?.stack,
      })
    })

    // React Error Boundary
    // Vue errorHandler
    // API 错误拦截
  }

  capture(error: ErrorEvent) {
    const enriched = {
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      breadcrumbs: this.getBreadcrumbs(), // 操作面包屑
    }

    // 发送到错误追踪服务（Sentry 等）
    sendToSentry(enriched)
  }
}
```

### 3. 用户行为埋点

```typescript
// 声明式埋点
function TrackClick({ event, properties, children }: TrackProps) {
  const handleClick = () => {
    track(event, properties);
  };

  return <div onClick={handleClick}>{children}</div>;
}

// 使用
<TrackClick event="add_to_cart" properties={{ productId: '123', price: 99 }}>
  <Button>加入购物车</Button>
</TrackClick>

// 自动埋点（基于 DOM 属性）
// <button data-track="click" data-track-event="submit_form">提交</button>
function autoTrackSetup() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const trackEl = target.closest('[data-track]');
    if (trackEl) {
      const eventName = trackEl.dataset.trackEvent || 'click';
      track(eventName, {
        element: trackEl.tagName,
        text: trackEl.textContent?.trim(),
        id: trackEl.id,
      });
    }
  });
}

// 页面浏览追踪
function trackPageView() {
  track('page_view', {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    screenWidth: window.screen.width,
  });
}
```

### 4. 链路追踪

```typescript
// 全链路追踪（前端 → 后端）
class TraceManager {
  // 生成追踪 ID
  generateTraceId(): string {
    return crypto.randomUUID()
  }

  // API 请求携带追踪信息
  async fetchWithTrace(url: string, options: RequestInit = {}) {
    const traceId = this.generateTraceId()
    const spanId = this.generateSpanId()

    const headers = {
      ...options.headers,
      'X-Trace-Id': traceId,
      'X-Span-Id': spanId,
      'X-Span-Start': String(performance.now()),
    }

    const response = await fetch(url, { ...options, headers })

    // 记录 Span
    this.recordSpan({
      traceId,
      spanId,
      operation: url,
      duration: performance.now() - Number(headers['X-Span-Start']),
      status: response.status,
    })

    return response
  }
}
```

---

## 高频面试题

### Q1: 前端可观测性包含哪些维度？

**参考答案要点**：

- 性能监控：Core Web Vitals、API 耗时、渲染性能
- 错误追踪：JS 错误、Promise 异常、API 错误
- 用户行为：PV/UV、点击、转化漏斗
- 链路追踪：全链路 Trace ID、Span 记录

### Q2: 如何设计埋点体系？

**参考答案要点**：

- 自动埋点：PV、页面性能、错误
- 声明式埋点：业务事件（组件包裹）
- 代码埋点：复杂业务逻辑
- 埋点治理：版本管理、质量校验、数据校验

### Q3: 如何利用可观测性数据改进产品？

**参考答案要点**：

- 性能数据 → 优化首屏加载、交互响应
- 错误数据 → 定位和修复高频错误
- 行为数据 → 优化转化漏斗、改进 UX
- 关联分析 → 性能与转化率的关系

---

## 延伸思考

1. **设计题**：为一个电商应用设计完整的可观测性体系。
2. **场景题**：线上错误率突然飙升，如何快速定位问题？
3. **对比题**：Sentry vs Datadog vs 自建监控方案？

---

## 参考资料

- [Web Vitals](https://web.dev/vitals/)
- [Sentry 文档](https://docs.sentry.io)
- [OpenTelemetry](https://opentelemetry.io)
- [前端监控体系](https://www.atlassian.com/software/monitoring)
