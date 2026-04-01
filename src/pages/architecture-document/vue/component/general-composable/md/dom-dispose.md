---
title: DOM引用清理函数
order: 1
---

这份笔记整理了 Vue 3.5+ 推出的 `useTemplateRef` 与传统 `ref` 在 DOM 引用管理上的核心差异，以及在面对第三方库（如 ECharts, Swiper）时的副作用销毁最佳实践。

------

## 📝 Vue 3 DOM 引用与副作用销毁指南

## 一、 `useTemplateRef` vs `ref` 核心差异

| 特性            | `ref(null)` (传统方式)                            | `useTemplateRef` (Vue 3.5+)                    |
| :-------------- | :------------------------------------------------ | :--------------------------------------------- |
| **定义方式**    | `const myDom = ref(null)`                         | `const myDom = useTemplateRef('domKey')`       |
| **匹配机制**    | 变量名必须与模板中 `ref="xxx"` 字符串**完全一致** | 通过第一个参数（字符串键）匹配，变量名可自定义 |
| **可写性**      | **可读写** (`ShallowRef`)                         | **只读** (`Readonly<ShallowRef>`)              |
| **TS 类型推导** | 需要手动指定：`ref<HTMLDivElement                 | null>(null)`                                   |
| **初始化时机**  | 挂载前为 `null`                                   | 挂载前为 `null`                                |

------

## 二、 基础副作用销毁 (DOM 原生操作)

无论是哪种方式，Vue 都会在组件**卸载 (Unmount)** 或 **v-if 切换**时自动将 `.value` 置为 `null`。但**手动添加的监听器**必须手动清理。

## 1. 手动清理模式 (onUnmounted)

最通用的做法，适用于简单的 DOM 操作。

```javascript
const box = useTemplateRef('my-box')
const handleResize = () => { /* ... */ }

onMounted(() => {
  box.value?.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 核心：手动移除监听，防止闭包内存泄漏
  box.value?.removeEventListener('resize', handleResize)
})
```

## 2. 自动清理模式 (watchEffect / watch)

利用 Vue 内置的 `onCleanup` 机制，代码更内聚。

```javascript
watchEffect((onCleanup) => {
  const el = box.value
  if (el) {
    el.addEventListener('click', handleClick)
    // 当 el 改变或组件卸载时，自动触发以下清理函数
    onCleanup(() => el.removeEventListener('click', handleClick))
  }
})
```

------

## 三、 三方库复杂 DOM 引用的副作用销毁 (重点)

对于 ECharts、Monaco Editor、Swiper 等库，单纯让 DOM 消失是不够的，因为这些库会在内存中创建复杂的**实例对象**和**定时器**。

## 销毁流程：

1. **调用销毁方法**：调用库自带的 `.dispose()` 或 `.destroy()`。
2. **断开引用**：将实例变量置为 `null`，确保垃圾回收 (GC) 能识别。

## 最佳实践代码：

```javascript
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 1. 获取 DOM 引用
const chartDom = useTemplateRef('chart-container')
let myChart = null // 存储三方库实例

onMounted(() => {
  if (chartDom.value) {
    // 2. 初始化实例
    myChart = echarts.init(chartDom.value)
    myChart.setOption({ /* ... */ })
  }
})

onUnmounted(() => {
  // 3. 核心：执行三方库专用的销毁逻辑
  if (myChart) {
    myChart.dispose() // 释放 WebGL/Canvas 资源、解绑内部监听
    myChart = null    // 彻底切断 JS 引用
  }
})
```

------

## 四、 总结与避坑指南

1. **useTemplateRef 是只读的**：
   - 不要尝试 `myRef.value = null`，这会报错。销毁引用只能通过销毁 DOM（如 `v-if=false`）或组件卸载来由 Vue 自动完成。
2. **避免闭包泄漏**：
   - 如果在 `onMounted` 中使用了 `window.addEventListener` 并引用了 DOM 变量，**务必**在 `onUnmounted` 中移除，否则该组件及其 DOM 节点永远无法被回收。
3. **Keep-alive 陷阱**：
   - 如果组件在 `<KeepAlive>` 中，`onUnmounted` 不会触发。请改用 `onDeactivated` 钩子来停止定时器或高耗能动画，并在 `onActivated` 中重新激活。

------







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
