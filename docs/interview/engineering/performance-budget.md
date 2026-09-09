---
title: "性能预算体系 [P6-P7]"
level: "senior"
tags: ["性能", "Core Web Vitals", "INP", "优化"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 性能预算体系 [P6-P7]

> 性能预算是确保应用持续保持高性能的工程化手段。2026 年，INP（Interaction to Next Paint）正式替代 FID 成为 Core Web Vitals 指标，性能优化从"加载优先"转向"交互优先"。

## 核心概念（What）

### Core Web Vitals（2026）

| 指标 | 含义 | 良好阈值 | 衡量维度 |
|------|------|----------|----------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 加载性能 |
| **INP** | Interaction to Next Paint | ≤ 200ms | 交互响应 |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 视觉稳定性 |

---

## 底层原理（Why）

### 1. INP 深度解析

```
INP 测量流程：
1. 用户交互（点击/输入/键盘）
2. 浏览器排队等待主线程空闲
3. 主线程执行事件处理 + 样式计算 + 布局 + 绘制
4. 下一帧绘制到屏幕

INP = 步骤 2-4 的总耗时

优化策略：
├── 减少主线程阻塞（长任务拆分）
├── 使用 startTransition 降低优先级
├── 避免同步布局计算
├── 使用 requestAnimationFrame
└── 使用 Web Worker 处理计算
```

### 2. 性能预算制定

```javascript
// 性能预算示例
const performanceBudget = {
  // 资源预算
  maxBundleSize: '200KB',        // JS 包大小
  maxCSSSize: '50KB',            // CSS 大小
  maxImageSize: '100KB',         // 单张图片大小
  maxTotalSize: '1MB',           // 页面总大小
  maxRequests: 50,               // 最大请求数

  // 时间预算
  maxFCP: '1.5s',               // First Contentful Paint
  maxLCP: '2.5s',               // Largest Contentful Paint
  maxINP: '200ms',              // Interaction to Next Paint
  maxCLS: 0.1,                  // Cumulative Layout Shift
  maxTTI: '3.5s',               // Time to Interactive
};
```

### 3. 加载优化

```
加载优化清单：
├── 代码分割（Route-based + Component-based）
├── Tree Shaking（确保 sideEffects: false）
├── 图片优化（WebP/AVIF + 响应式 + 懒加载）
├── 字体优化（font-display: swap + 子集化）
├── 预加载关键资源（preload / prefetch / preconnect）
├── 缓存策略（强缓存 + 内容哈希）
└── CDN 部署（就近访问）
```

### 4. 运行时优化

```javascript
// 1. 长任务拆分（解决 INP）
// 反模式：一个长任务阻塞主线程 500ms
function processAllItems(items) {
  items.forEach(item => heavyProcess(item)); // 阻塞 500ms
}

// 优化：使用 scheduler.yield() 拆分任务
async function processAllItems(items) {
  for (const item of items) {
    heavyProcess(item);
    if (typeof scheduler !== 'undefined') {
      await scheduler.yield(); // 让出主线程
    }
  }
}

// 2. 虚拟滚动（大列表）
// 只渲染可视区域的元素
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.key} style={{ transform: `translateY(${virtualRow.start}px)` }}>
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 高频面试题

### Q1: INP 和 FID 有什么区别？

**参考答案要点**：
- FID 只测量第一次交互的延迟
- INP 测量所有交互中最慢的一次（取第 98 百分位）
- INP 包含事件处理 + 渲染时间，FID 只包含事件排队时间
- INP 更全面反映交互性能

### Q2: 如何建立性能预算？

**参考答案要点**：
- 资源预算：限制 JS/CSS/图片大小和请求数
- 时间预算：设定 LCP/INP/CLS 阈值
- 工具：Lighthouse CI + bundlesize + webpack-bundle-analyzer
- 在 CI 中自动检查，超标则阻断合并

### Q3: 如何优化 INP？

**参考答案要点**：
- 拆分长任务（scheduler.yield / setTimeout）
- 使用 startTransition 降低非紧急更新优先级
- 避免同步 DOM 操作（读写分离）
- 使用 Web Worker 处理计算密集任务
- 减少事件处理器的复杂度

---

## 延伸思考

1. **设计题**：设计一个前端性能监控体系，覆盖哪些指标？
2. **场景题**：一个电商首页 LCP 4 秒、INP 800ms，如何系统化优化？
3. **对比题**：Chrome DevTools Performance 面板 vs WebPageTest vs Lighthouse，各自的适用场景？

---

## 参考资料

- [Core Web Vitals](https://web.dev/articles/vitals)
- [INP 深入解析](https://web.dev/articles/inp)
- [Performance Budget](https://web.dev/articles/performance-budgets)
