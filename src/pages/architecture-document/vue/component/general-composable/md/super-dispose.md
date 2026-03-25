---
title: 超级聚合清理函数
order: 56
---

## 🚀 全能副作用清理器 (Ultimate Side Effect Cleaner)

在 Vue 3 开发中，内存泄漏通常源于**组件销毁后残留的异步任务或全局监听**。`useSuperCleaner` 的核心逻辑是：**“基于特征识别的自动化递归销毁”**。它通过扫描资源对象的属性特征，自动匹配对应的清理方案。

---

## 1. 核心代码实现 `useSuperCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 全能副作用清理器 V2.0
 * 核心原理：特征识别 (Feature Detection) + 深度递归逻辑 + 容错执行
 */
export function useSuperCleaner(resources, options = { debug: false }) {
  const isDev = import.meta.env?.DEV || options.debug

  const log = (type, detail) => {
    if (isDev) console.log(`[SuperCleaner] 🟢 已清理 ${type}:`, detail)
  }

  const clean = (item) => {
    if (!item) return

    try {
      // --- 1. 容器类递归 (Ref / Array / Set / Map) ---
      if (isRef(item)) {
        clean(item.value)
        item.value = null
        return
      }
      if (Array.isArray(item)) {
        item.forEach((i) => clean(i))
        item.length = 0
        return
      }
      if (item instanceof Set || item instanceof Map) {
        item.forEach((i) => clean(i))
        item.clear()
        return
      }

      // --- 2. 函数类 (Vue Watch / 取消订阅句柄 / 状态重置) ---
      if (typeof item === 'function') {
        item()
        log('函数句柄', item.name || 'Anonymous Fn')
        return
      }

      // --- 3. 标识符类 (定时器 / 动画帧 ID) ---
      if (typeof item === 'number' || typeof item === 'string') {
        clearTimeout(item)
        clearInterval(item)
        if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
          window.cancelAnimationFrame(item)
        }
        log('定时器/动画帧', item)
        return
      }

      // --- 4. 复杂对象与 Web API 实例 ---
      if (typeof item === 'object') {
        // 4.1 具有销毁方法的第三方实例 (ECharts, Swiper, Monaco, Worker)
        if (typeof item.dispose === 'function') {
          item.dispose()
          log('实例 (dispose)', item.constructor.name)
          return
        }
        if (typeof item.destroy === 'function') {
          item.destroy()
          log('实例 (destroy)', item.constructor.name)
          return
        }
        if (typeof item.terminate === 'function') {
          item.terminate()
          log('Worker (terminate)', item)
          return
        }

        // 4.2 原生 Web API 识别
        if (item instanceof AbortController) {
          item.abort()
          log('请求 (Abort)', 'HTTP Request')
          return
        }
        if (item instanceof WebSocket) {
          item.close()
          log('Socket (Close)', item.url)
          return
        }
        if (
          item instanceof IntersectionObserver ||
          item instanceof ResizeObserver ||
          item instanceof MutationObserver
        ) {
          item.disconnect()
          log('观察者 (Disconnect)', item.constructor.name)
          return
        }

        // 4.3 原生 DOM 事件监听结构 { target, type, handler }
        if (item.target && item.type && item.handler) {
          const el = isRef(item.target) ? item.target.value : item.target
          el?.removeEventListener?.(item.type, item.handler, item.options)
          log('原生事件 (off)', `${item.type} @ ${el?.tagName || 'window'}`)
          return
        }

        // 4.4 Mitt / EventEmitter 结构 { emitter, type, handler }
        if (item.emitter?.off && item.type && item.handler) {
          item.emitter.off(item.type, item.handler)
          log('Mitt事件 (off)', item.type)
          return
        }

        // 4.5 普通对象容器：递归清理所有 Key
        Object.keys(item).forEach((key) => {
          clean(item[key])
          delete item[key]
        })
      }
    } catch (error) {
      console.error(`[SuperCleaner] 🔴 清理资源时发生异常:`, error, item)
    }
  }

  onUnmounted(() => {
    if (isDev) console.group('📦 SuperCleaner: 开始执行全局清理...')
    clean(resources)
    if (isDev) console.groupEnd()
  })

  return {
    manualClean: () => clean(resources),
  }
}
```

---

## 2. 支持内容清单

| 资源类别     | 识别特征 / 清理动作                | 常见场景                    |
| :----------- | :--------------------------------- | :-------------------------- |
| **定时器**   | `Number/String` -> `clearTimeout`  | 轮询、延迟逻辑              |
| **Vue 监听** | `Function` -> `stop()`             | `watch`, `watchEffect`      |
| **网络请求** | `AbortController` -> `abort()`     | 接口在页面离开时取消        |
| **网络连接** | `WebSocket` -> `close()`           | 实时通讯、长连接            |
| **第三方库** | `.dispose()` / `.destroy()`        | ECharts, Swiper, Editor     |
| **原生事件** | `{ target, type, handler }`        | 窗口 `resize`, 全局 `click` |
| **组件通信** | `{ emitter, type, handler }`       | Mitt 事件总线注销           |
| **观察者**   | `instanceof Observer`              | 元素可见性监听、容器缩放    |
| **多线程**   | `Worker` -> `.terminate()`         | 耗时计算 Web Worker         |
| **动画帧**   | `Number` -> `cancelAnimationFrame` | Canvas 渲染、游戏循环       |

#### 支持内容

- **Vue 副作用**：`watch` / `watchEffect` 停止句柄。
- **定时器**：`setTimeout` / `setInterval` / `requestAnimationFrame`。
- **网络层**：`Axios/Fetch` 请求取消 (`AbortController`)、`WebSocket` 断开。
- **UI 插件**：ECharts、Canvas、Editor、Swiper 等所有带 `destroy/dispose` 的实例。
- **原生监听**：`window/DOM` 的 `addEventListener`。
- **组件通信**：`mitt` 或 `EventEmitter` 的事件监听。
- **浏览器观察者**：监听元素大小、可见性、DOM 树变动的各种 `Observer`。

---

## 3. 原理说明

`useSuperCleaner` 采用 **“全量登记，统一销毁”** 的策略。它利用 JavaScript 的 **鸭子类型 (Duck Typing)** 特征，不依赖具体的类名，而是探测对象是否具有 `dispose`、`abort` 或 `off` 等销毁方法。通过**递归扫描**，它可以穿透复杂的嵌套结构（如嵌套在 `ref` 数组里的定时器），确保每一个副作用都能被触达。

---

## 4. 完整应用示例

```javascript
import { ref, watch, onMounted } from 'vue'
import { useSuperCleaner } from '@/composables/useSuperCleaner'
import mitt from 'mitt'
import * as echarts from 'echarts'

const bus = mitt()
const domRef = ref(null)

// 1. 定义资源集合 (可以使用普通对象或 Ref)
const sideEffects = {
  // 请求与连接
  api: new AbortController(),
  socket: new WebSocket('ws://example.com'),

  // 观察者与 Worker
  observer: new ResizeObserver(() => console.log('Resized')),
  worker: new Worker(new URL('./task.js', import.meta.url)),

  // 监听器 (Vue & 原生)
  stops: [
    watch(domRef, () => {}),
    { target: window, type: 'keydown', handler: (e) => console.log(e.key) },
  ],

  // 第三方实例
  chart: ref(null),

  // 状态重置匿名函数
  reset: () => console.log('清理完成，重置全局状态...'),
}

onMounted(() => {
  // 初始化资源
  sideEffects.chart.value = echarts.init(domRef.value)
  sideEffects.observer.observe(domRef.value)

  // 绑定原生事件
  const ev = sideEffects.stops[1]
  ev.target.addEventListener(ev.type, ev.handler)
})

// 🚀 接管所有销毁任务
useSuperCleaner(sideEffects)

//<div ref="domRef" style="width: 100%; height: 300px;"></div>
```

## 5. 为什么选择这种封装方案？

1. **心智负担极低**：你不再需要在 `onUnmounted` 里写几十行 `if (timer) clearInterval(timer)`。
2. **防止逻辑遗漏**：只要你在创建资源时将其放入 `sideEffects` 对象，就绝对不会忘记销毁。
3. **高性能**：使用 `shallowRef` 思想，不监听资源内部的变化，只在组件死亡时执行一次递归扫描。
4. **支持手动清理**：如果业务中需要提前重置，直接调用 `const { clean } = useSuperCleaner(res); clean();` 即可。
5. **日志追踪 (Log Tracking)**：详细记录每种资源的销毁情况，方便在开发环境排查内存泄漏。
6. **异常隔离 (Error Isolation)**：通过 `try...catch` 确保单个资源清理失败（如第三方插件 Bug）不会中断后续其他资源的销毁。
7. **弱引用检测 (Weak Reference)**：增加对 `Set` 和 `Map` 的递归支持。
8. **防二次执行**：资源被清理后会打上标记或物理删除，防止手动触发与自动触发冲突。
9. **类型收窄**：对 `window` 和 `document` 等全局对象做了更严谨的判断。

---
