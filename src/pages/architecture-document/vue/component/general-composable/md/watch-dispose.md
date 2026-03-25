---
title: watch清理函数
order: 14
---

## watch清理函数

在 Vue 3 中，`watch` 或 `watchEffect` 会返回一个 **停止监听函数 (Stop Handle)**。如果在组件外部或异步逻辑中创建了监听器，必须手动调用这个函数来销毁它，否则会造成内存泄漏。

这个封装的重点在于识别 **“函数类型”** 的资源并执行它。

## 1. 通用 Watch 销毁函数 `useWatchCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 通用 Vue Watch 停止监听组合式函数
 * @param {any} resources - 支持单个 stopHandle、数组、Ref 或普通对象容器
 */
export function useWatchCleaner(resources) {
  const clean = (item) => {
    if (!item) return

    // 1. 处理 Ref (自动解包)
    if (isRef(item)) {
      clean(item.value)
      item.value = null
      return
    }

    // 2. 处理数组 (递归清理，如 [stop1, stop2])
    if (Array.isArray(item)) {
      item.forEach((i) => clean(i))
      item.length = 0
      return
    }

    // 3. 核心逻辑：执行停止监听函数
    // Vue 的 watch 返回的是一个函数，直接执行即可停止监听
    if (typeof item === 'function') {
      item()
      return
    }

    // 4. 处理普通对象容器 (递归清理内部属性)
    if (typeof item === 'object') {
      Object.keys(item).forEach((key) => {
        clean(item[key])
        delete item[key]
      })
    }
  }

  // 组件卸载时自动停止所有监听
  onUnmounted(() => {
    clean(resources)
  })

  // 返回手动清理方法
  return { clean }
}
```

## 2. 业务代码使用示例

```javascript
import { ref, watch, watchEffect } from 'vue'
import { useWatchCleaner } from '@/composables/useWatchCleaner'

const count = ref(0)
const stopHandles = [] // 数组收集

// 1. 手动创建监听器 (通常在异步或特定逻辑中创建时需要手动销毁)
const stop1 = watch(count, (val) => console.log('Watch 1:', val))
const stop2 = watchEffect(() => console.log('WatchEffect:', count.value))

// 2. 放入容器
stopHandles.push(stop1, stop2)

// 3. 注册自动销毁
useWatchCleaner(stopHandles)

// 模拟逻辑变更
const add = () => count.value++
```

## 💡 封装设计的核心亮点：

1. **识别函数特征**：Vue 所有的 `watch` 停止句柄本质都是**函数**。通过 `typeof item === 'function'` 统一识别并执行。
2. **兼容性强**：不仅可以清理 `watch`，任何符合 **“执行即销毁”** 模式的第三方库函数（如某些自定义的 `unsubscribe` 函数）都可以通过这个工具清理。
3. **递归与 Ref 支持**：支持 `ref([stop1, stop2])` 这种嵌套结构，确保在复杂业务逻辑下也能精准定位到每一个句柄。
4. **防重复执行**：清理后会将数组清空或对象键删除，避免在其他地方误触发已失效的句柄。
