---
title: "前端错误处理与监控入门 [P5-P6]"
level: "intermediate"
tags: ["错误处理", "ErrorBoundary", "监控", "错误上报"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 前端错误处理与监控入门 [P5-P6]

> 前端错误处理保证应用稳定性。掌握错误捕获、ErrorBoundary、错误上报等技术，能快速定位和修复问题。

## 核心概念（What）

### 错误类型

```
前端错误类型：
├── 语法错误 → 代码写错（编译时报错）
├── 运行时错误 → 执行时报错
│   ├── TypeError → 类型错误
│   ├── ReferenceError → 引用错误
│   ├── RangeError → 范围错误
│   └── SyntaxError → 语法错误
├── 异步错误 → Promise 未捕获
├── 资源加载错误 → 图片/脚本加载失败
└── CORS 错误 → 跨域问题

错误处理目标：
├── 快速发现 → 监控告警
├── 准确定位 → 错误堆栈
├── 优雅降级 → 用户体验
└── 防止崩溃 → 错误边界
```

## 底层原理（Why）

### 全局错误捕获

```javascript
// 1. window.onerror（同步错误）
window.onerror = function(message, source, lineno, colno, error) {
  console.error('错误:', message);
  console.error('文件:', source);
  console.error('行号:', lineno, '列号:', colno);
  console.error('堆栈:', error?.stack);
  
  // 上报错误
  reportError({
    message,
    source,
    lineno,
    colno,
    stack: error?.stack,
    url: window.location.href,
    timestamp: Date.now()
  });
};

// 2. unhandledrejection（Promise 错误）
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
  
  reportError({
    type: 'unhandledrejection',
    reason: event.reason,
    stack: event.reason?.stack,
    url: window.location.href,
    timestamp: Date.now()
  });
  
  event.preventDefault(); // 阻止默认行为
});

// 3. 资源加载错误
window.addEventListener('error', (event) => {
  const target = event.target;
  
  if (target instanceof HTMLImageElement || 
      target instanceof HTMLScriptElement) {
    console.error('资源加载失败:', target.src);
    
    reportError({
      type: 'resource',
      src: target.src,
      tagName: target.tagName,
      url: window.location.href,
      timestamp: Date.now()
    });
  }
}, true); // 使用捕获阶段
```

### Vue 错误处理

```vue
<script setup>
import { onErrorCaptured } from 'vue';

// 组件内错误捕获
onErrorCaptured((error, instance, info) => {
  console.error('捕获到错误:', error);
  console.error('组件实例:', instance);
  console.error('错误信息:', info);
  
  // 上报错误
  reportError({
    error: error.message,
    stack: error.stack,
    component: instance?.$options?.name,
    info,
    url: window.location.href
  });
  
  // 返回 false 阻止错误继续传播
  return false;
});
</script>

<!-- 全局错误处理 -->
<!-- main.js -->
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误:', error);
  
  reportError({
    error: error.message,
    stack: error.stack,
    component: instance?.$options?.name,
    info
  });
};

// 警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('警告:', msg, trace);
};

app.mount('#app');
```

### React 错误边界

```jsx
// ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('错误边界捕获:', error, errorInfo);
    
    // 上报错误
    reportError({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>出错了，请稍后重试</h1>;
    }
    
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

// 函数组件错误处理（React 18+）
import { useErrorHandler } from 'react-error-boundary';

function MyComponent() {
  const handleError = useErrorHandler();
  
  useEffect(() => {
    fetchData().catch(handleError);
  }, [handleError]);
  
  return <div>内容</div>;
}
```

### 错误上报

```javascript
// 错误上报函数
function reportError(errorData) {
  const data = {
    ...errorData,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now(),
    user: getCurrentUser() // 用户信息
  };
  
  // 方式 1：sendBeacon（推荐，页面卸载时也能发送）
  navigator.sendBeacon('/api/errors', JSON.stringify(data));
  
  // 方式 2：fetch
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  // 方式 3：图片（跨域友好）
  const img = new Image();
  img.src = `/api/errors?data=${encodeURIComponent(JSON.stringify(data))}`;
}

// 错误去重
const reportedErrors = new Set();

function reportErrorOnce(errorData) {
  const key = `${errorData.error}-${errorData.url}`;
  
  if (reportedErrors.has(key)) {
    return; // 已上报
  }
  
  reportedErrors.add(key);
  reportError(errorData);
  
  // 限制数量
  if (reportedErrors.size > 100) {
    reportedErrors.clear();
  }
}
```

### 第三方监控

```javascript
// Sentry
import * as Sentry from '@sentry/vue';
import { createApp } from 'vue';

const app = createApp(App);

Sentry.init({
  dsn: 'https://example@sentry.io/123',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});

Sentry.init(app);

// 手动上报
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}

// 添加上下文
Sentry.setUser({ id: 1, username: 'Alice' });
Sentry.setExtra('orderId', '12345');

// Fundebug
// Bugsnag
// Rollbar
```

## 实战应用（How）

### 错误处理最佳实践

```javascript
// 1. try/catch 处理可能出错的代码
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('请求失败:', error);
    reportError(error);
    
    // 返回默认值或重新抛出
    return null;
    // throw error;
  }
}

// 2. Promise.catch 处理
fetchData()
  .then(data => console.log(data))
  .catch(error => {
    console.error('错误:', error);
    reportError(error);
  });

// 3. 优雅降级
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(err => {
        setError(err);
        reportError(err);
      });
  }, [userId]);
  
  if (error) {
    return <div>加载失败，请稍后重试</div>;
  }
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return <div>{user.name}</div>;
}

// 4. 重试机制
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 性能监控

```javascript
// Performance API
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'resource') {
      console.log(`${entry.name}: ${entry.duration}ms`);
      
      if (entry.duration > 1000) {
        reportError({
          type: 'slow_resource',
          url: entry.name,
          duration: entry.duration
        });
      }
    }
  });
});

observer.observe({ entryTypes: ['resource'] });

// Core Web Vitals
import { getLCP, getFID, getCLS } from 'web-vitals';

getLCP(reportMetric);
getFID(reportMetric);
getCLS(reportMetric);

function reportMetric(metric) {
  reportError({
    type: 'web_vital',
    name: metric.name,
    value: metric.value,
    rating: metric.rating // good | needs-improvement | poor
  });
}
```

## 高频面试题

### Q1: 如何捕获前端错误？

```
同步错误：
├── window.onerror
├── try/catch
└── Vue: onErrorCaptured

异步错误：
├── unhandledrejection 事件
├── Promise.catch()
└── async/await + try/catch

资源错误：
├── window.addEventListener('error', ..., true)
└── 捕获阶段监听

React 错误：
└── ErrorBoundary（componentDidCatch）
```

### Q2: 如何上报错误？

```
方法：
├── navigator.sendBeacon（推荐）
├── fetch POST
└── 图片 src

内容：
├── 错误信息
├── 堆栈信息
├── 用户信息
├── 环境信息
└── 时间戳

去重：
└── 使用 Set 记录已上报的错误
```

### Q3: ErrorBoundary 的作用？

```
作用：
├── 捕获子组件的渲染错误
├── 显示降级 UI
├── 上报错误信息
└── 防止整个应用崩溃

使用：
├── 包裹可能出错的组件
├── 实现 getDerivedStateFromError
├── 实现 componentDidCatch
└── 提供降级 UI

注意：
├── 只能捕获渲染阶段的错误
├── 不能捕获事件处理函数错误
└── 不能捕获异步错误
```

## 延伸思考

1. 如何设计错误监控平台？
2. 如何定位线上 Bug？
3. 如何做错误告警？

## 参考资料

- [MDN 错误处理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors)
- [Sentry 官方文档](https://docs.sentry.io/)
