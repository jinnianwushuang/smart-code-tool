---
title: '前端可观测性 [P8]'
level: 'architect'
tags: ['埋点', '性能监控', '错误追踪', '用户行为']
difficulty: 'expert'
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

### 1. PerformanceObserver 与性能采集管线

前端性能监控的底层不是「调 API」，而是浏览器内核暴露的**性能观察管线**。

```
浏览器性能采集管线：

  ┌──────────────────────────────────────────────┐
  │  浏览器内核（Blink/WebKit/Gecko）               │
  │  ├── 渲染帧完成后生成 PerformanceEntry           │
  │  ├── 条目类型：navigation / resource / paint /   │
  │  │   longtask / layout-shift / LCP              │
  │  └── 条目进入 PerformanceObserver 注册队列      │
  └──────────────────┬───────────────────────────┘
                     │ 异步回调（不阻塞渲染）
                     ▼
  ┌──────────────────────────────────────────────┐
  │  PerformanceObserver 处理层                      │
  │  ├── buffered: true → 立即回放已积累的条目      │
  │  ├── 新条目触发 callback(entryList)              │
  │  └── 条目通过 sendBeacon / fetch 上报           │
  └──────────────────────────────────────────────┘

Core Web Vitals 采集原理：

  CLS（累积布局偏移）：
    ├── 监听 LayoutShift 类型的 PerformanceEntry
    ├── 每个 entry 有 value（0~1 之间的偏移分数）
    ├── 只有 entry.hadRecentInput === false 时才累加（排除用户输入）
    ├── 会话窗口算法：将连续的 LayoutShift 分组为会话，取最大会话值
    └── 页面卸载时（visibilitychange）上报最终值

  LCP（最大内容绘制）：
    ├── 监听 LargestContentfulPaint 类型的 PerformanceEntry
    ├── 每次渲染新内容时触发（可能多次）
    ├── 取最后一次（最大的那个）
    ├── element 属性指向具体 DOM 节点（可用于截图）
    └── 页面交互后不再更新

  INP（交互到下次绘制）：
    ├── 监听所有 pointerdown / click / keyboard 交互事件
    ├── 每个事件测量从交互发生到下一帧绘制的延迟
    ├── 延迟 = 输入处理 + 事件回调执行 + 下一帧渲染
    ├── 取所有交互的第 98 百分位值（排除异常值）
    └── 页面卸载时上报
```

### 2. 错误捕获与 Source Map 还原原理

错误监控的底层不是「try-catch」，而是浏览器事件循环中的**全局异常冒泡机制** + **符号映射还原**。

```
错误捕获链路：

  JS 运行时错误：
    ├── 未捕获的异常冒泡到 window.onerror
    ├── 参数：message, source, lineno, colno, error
    ├── lineno/colno 是压缩后代码的位置
    └── 需要 Source Map 还原为源码位置

  Promise 未处理拒绝：
    ├── Promise 链中的 reject 没有被 catch
    ├── 冒泡到 window.onunhandledrejection
    ├── event.reason 包含拒绝原因
    └── 异步错误，不在同步调用栈中

  React Error Boundary：
    ├── 利用 Fiber 树的冒泡机制
    ├── 组件 render / 生命周期 / 子树中的错误
    ├── 向上冒泡到最近的 componentDidCatch 边界
    └── 边界组件决定降级 UI（不会卸载整个应用）

Source Map 还原算法：

  Source Map 本质是 VLQ 编码的映射表：
    压缩代码第 N 行第 M 列 → 源码第 X 文件第 Y 行第 Z 列

  还原过程：
    1. 加载 .map 文件（JSON 格式）
    2. 解析 mappings 字段（VLQ 编码的序列）
    3. 构建映射表：(generatedLine, generatedCol) → (source, originalLine, originalCol)
    4. 查找错误位置 (lineno, colno) 在映射表中的对应源码位置
    5. 返回原始文件名 + 行号 + 列号 + 上下文代码

  VLQ 编码原理：
    ├── 每个映射段用分号分隔（表示行）
    ├── 每段内用逗号分隔（表示多个映射）
    ├── 每个映射 5 个字段：
    │   ├── 压缩后列号（相对前一列的偏移）
    │   ├── 源文件索引（相对偏移）
    │   ├── 源码行号（相对偏移）
    │   ├── 源码列号（相对偏移）
    │   └── 名称索引（相对偏移）
    └── 用 Base64 VLQ 编码压缩数值
```

### 3. 链路追踪的 Span 模型与 Context Propagation

全链路追踪的底层不是「加个 Header」，而是 OpenTelemetry 定义的**分布式 Span 树模型**。

```
Span 树模型（OpenTelemetry 标准）：

  Trace（链路）= 一棵 Span 树
    ├── TraceID：全局唯一（128 位，通常用 UUID v4）
    ├── 根 Span：前端页面加载（navigation trace）
    │   ├── 子 Span：API 请求（HTTP GET /api/users）
    │   │   └── 后端 Span：数据库查询（SELECT * FROM users）
    │   ├── 子 Span：组件渲染（React render）
    │   └── 子 Span：资源加载（script.js / style.css）
    └── 每个 Span 包含：
        ├── spanId（8 字节，唯一）
        ├── parentSpanId（父 Span 的 spanId）
        ├── operationName（操作名称）
        ├── startTime / endTime（精确到纳秒）
        ├── attributes（键值对元数据）
        └── status（OK / ERROR）

Context Propagation（上下文传播）：

  前端 → 后端 传播链路：
    1. 前端生成 TraceID + SpanID
    2. 注入 HTTP Header：
       ├── traceparent: 00-{traceId}-{spanId}-01
       │   （W3C Trace Context 标准格式）
       ├── tracestate: vendor1=value1,vendor2=value2
       │   （厂商扩展信息）
       └── baggage: userId=123,tenantId=abc
           （业务上下文传播）
    3. 后端解析 traceparent → 提取 TraceID
    4. 后端创建子 Span（parentSpanId = 前端 SpanID）
    5. 后端调用其他服务时继续传播

  前端自动注入实现：
    ├── 拦截 fetch / XMLHttpRequest
    ├── 从当前 Active Span 提取 Context
    ├── 注入到请求 Header
    └── 响应时自动结束 Span（记录状态码和耗时）
```

### 4. 埋点事件调度与数据上报管线

埋点系统的底层不是「发个请求」，而是一个**事件调度器**，解决批量、重试、降级、采样问题。

```
埋点事件调度管线：

  Event Queue（事件队列）：
    ├── 用户行为 → 生成 Event 对象（事件名 + 属性 + 时间戳 + sessionId）
    ├── Event 进入内存队列（Array / RingBuffer）
    └── 队列满时触发 flush（批量发送）

  Flush 策略：
    ├── 定时 flush：每 N 秒发送一次（默认 5s）
    ├── 定量 flush：队列达到 M 条时发送（默认 20 条）
    ├── 关键事件 flush：重要事件立即发送（如支付成功）
    └── 页面卸载 flush：visibilitychange 时用 sendBeacon 发送剩余事件

  上报传输层：
    ├── navigator.sendBeacon(url, data)
    │   ├── 浏览器保证页面卸载后仍会发送
    │   ├── 不阻塞页面卸载
    │   └── 限制：只能 POST，不能自定义 Header
    ├── fetch(url, { keepalive: true })
    │   ├── 支持自定义 Header 和方法
    │   └── keepalive 保证卸载后继续
    └── Image Beacon（降级方案）
        ├── new Image().src = url + '?' + queryString
        ├── 最老但最兼容的埋点方式
        └── 限制：只能 GET，数据长度受 URL 限制

  采样策略：
    ├── 全量采样：每个事件都上报（调试环境）
    ├── 固定比例采样：Math.random() < 0.1（10% 用户）
    ├── 会话级采样：同一会话内保持一致
    └── 条件采样：错误事件 100%，性能事件 10%

  数据压缩与批处理：
    ├── 多个 Event 合并为一个数组
    ├── JSON.stringify → gzip/deflate（如果服务端支持）
    ├── 或使用 protobuf / msgpack 二进制编码
    └── 减少请求数 + 减少传输体积
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
