---
title: 定时器清理函数
order: 1
---

## 定时器清理函数

这是一个非常实用的封装。在 Vue3 中，为了防止内存泄漏，最优雅的做法是利用 `onUnmounted` 钩子自动清理定时器。

我们将通过判断传入参数的类型（**Ref、Array、Object**），递归或遍历地提取出定时器 ID 并执行 `clearTimeout` 或 `clearInterval`。

## 1. 通用定时器清理函数 `useTimerCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 通用定时器销毁组合式函数
 * @param {any} timers - 支持单值、Ref、数组、普通对象
 */
export function useTimerCleaner(timers) {
  const clean = (target) => {
    // 1. 处理 Ref 对象
    if (isRef(target)) {
      clean(target.value)
      target.value = null
      return
    }

    // 2. 处理数组 (批量定时器)
    if (Array.isArray(target)) {
      target.forEach((t) => clean(t))
      target.length = 0
      return
    }

    // 3. 处理普通对象 (键值对存储的定时器)
    if (target && typeof target === 'object') {
      Object.keys(target).forEach((key) => {
        clean(target[key])
        delete target[key]
      })
      return
    }

    // 4. 执行真正的清理 (数值或 ID)
    if (target) {
      clearTimeout(target)
      clearInterval(target)
    }
  }

  // 自动在组件卸载时清理
  onUnmounted(() => {
    clean(timers)
  })

  // 同时返回清理方法，支持手动提前清理
  return { clean }
}
```

## 2. 多场景使用示例

在你的 `.vue` 组件中，你可以随心所欲地组织定时器结构：

```javascript
import { ref } from 'vue'
import { useTimerCleaner } from '@/composables/useTimerCleaner'

// 场景 A: 单个 Ref 定时器
const timerA = ref(null)
timerA.value = setTimeout(() => console.log('A'), 1000)

// 场景 B: 数组批量定时器
const timerList = [
  setInterval(() => console.log('B1'), 2000),
  setTimeout(() => console.log('B2'), 3000),
]

// 场景 C: 普通对象键值对
const timerGroup = {
  polling: setInterval(() => console.log('C1'), 5000),
  delay: setTimeout(() => console.log('C2'), 10000),
}

// 统一注册清理（组件卸载时会自动执行所有 clearTimeout/clearInterval）
useTimerCleaner([timerA, timerList, timerGroup])

// 如果需要手动提前清理
const { clean } = useTimerCleaner(timerA)
const stopA = () => clean(timerA)
```

## 💡 封装细节说明：

1. **兼容性**：在 JS 中，`clearTimeout` 和 `clearInterval` 是**通用**的（它们共享同一个 ID 池），所以可以统一调用。
2. **深度递归**：代码中通过递归处理了 `Ref` 和 `Array`，即使你传入 `ref([id1, id2])` 这种嵌套结构也能识别。
3. **零副作用**：清理后会将 `ref.value` 设为 `null` 或清空数组，防止后续逻辑误判。
