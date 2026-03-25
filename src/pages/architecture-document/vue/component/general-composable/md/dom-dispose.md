---
title: DOM引用清理函数
order: 1
---

## DOM引用清理函数

在 Vue 3 中，DOM 引用（如 ECharts 实例、Swiper、富文本编辑器、或者自定义的侦听器）如果不在组件销毁时手动释放，会导致内存泄漏或残留。

这里封装一个通用的 `useResourceCleaner`，它不仅支持**定时器**，还扩展支持了**具有 `dispose` 或 `destroy` 方法的第三方库实例**。

## 1. 通用资源清理函数 `useResourceCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 通用资源/引用销毁组合式函数
 * 支持：定时器ID、Ref对象、数组、普通对象、具有 destroy/dispose 方法的实例
 */
export function useResourceCleaner(resources) {
  const clean = (target) => {
    if (!target) return

    // 1. 处理 Ref 对象 (解包)
    if (isRef(target)) {
      clean(target.value)
      target.value = null
      return
    }

    // 2. 处理数组 (递归清理每一项)
    if (Array.isArray(target)) {
      target.forEach((item) => clean(item))
      target.length = 0
      return
    }

    // 3. 处理对象 (遍历键值对)
    if (typeof target === 'object') {
      // 3.1 优先处理具有销毁方法的第三方实例 (如 ECharts, MonacoEditor, Swiper)
      if (typeof target.dispose === 'function') {
        target.dispose()
        return
      }
      if (typeof target.destroy === 'function') {
        target.destroy()
        return
      }

      // 3.2 否则视为普通键值对容器，递归清理内部属性
      Object.keys(target).forEach((key) => {
        clean(target[key])
        delete target[key]
      })
      return
    }

    // 4. 处理定时器 ID (数值或特定标识)
    // 注意：clearTimeout 和 clearInterval 在浏览器中是通用的
    if (typeof target === 'number' || typeof target === 'string') {
      clearTimeout(target)
      clearInterval(target)
    }
  }

  // 组件卸载时自动触发
  onUnmounted(() => {
    clean(resources)
  })

  // 返回清理方法，支持手动提前释放
  return { clean }
}
```

## 2. 多场景实战示例

````javascript

import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useResourceCleaner } from '@/composables/useResourceCleaner'

// 场景 1: ECharts 实例 (带 dispose 方法)
const chartRef = ref(null)

// 场景 2: 定时器数组
const timers = [
  setInterval(() => console.log('轮询中...'), 2000),
  setTimeout(() => console.log('延迟执行'), 5000)
]

// 场景 3: 混合对象存储
const group = {
  subTimer: setTimeout(() => {}, 1000),
  otherRef: ref(null)
}

onMounted(() => {
  // 初始化图表
  const chartInstance = echarts.init(document.getElementById('main'))
  chartRef.value = chartInstance
})

// 一键注册所有需要销毁的资源
// 无论是 Ref、数组还是含有销毁方法的实例，都会被正确处理
useResourceCleaner([chartRef, timers, group])



 // <div id="main" style="width: 600px;height:400px;"></div>

```

## 💡 封装设计的亮点：

1. **鸭子类型 (Duck Typing)**：通过检测是否存在 `.dispose()` 或 `.destroy()`，自动适配几乎所有主流第三方 JS 库（如 **ECharts, Three.js, Video.js** 等）。
2. **递归深度清理**：支持复杂的嵌套结构，例如 `ref([ instance1, { t: timerId } ])`。
3. **安全性**：在清理 `Ref` 或 `Array` 后会自动置空，防止代码在其他地方再次调用已销毁的资源引发报错。


````
