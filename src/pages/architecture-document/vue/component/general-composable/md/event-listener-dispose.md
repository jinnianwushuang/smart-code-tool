---
title: 原生事件监听清理函数
order: 5
---

## 原生事件监听清理函数

在 Vue 3 中，原生事件监听（`addEventListener`）如果没有配对的 `removeEventListener`，在组件销毁后会导致内存泄漏甚至逻辑冲突。

这个封装的难点在于：**移除监听需要原始的 `target`、`type` 和 `handler` 三要素**。我们可以约定一个简单的对象结构 `{ target, type, handler }` 来实现批量自动化销毁。

## 1. 通用事件监听清理函数 `useEventListenerCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 通用原生事件监听销毁组合式函数
 * 支持结构:
 * 1. 单个对象: { target: window, type: 'resize', handler: fn }
 * 2. 以上对象的数组: [ { target, type, handler }, ... ]
 * 3. 包含以上对象的 Ref 或普通对象容器
 */
export function useEventListenerCleaner(resources) {
  const clean = (item) => {
    if (!item) return

    // 1. 处理 Ref (自动解包)
    if (isRef(item)) {
      clean(item.value)
      item.value = null
      return
    }

    // 2. 处理数组 (递归遍历)
    if (Array.isArray(item)) {
      item.forEach((i) => clean(i))
      item.length = 0
      return
    }

    // 3. 处理核心逻辑：原生事件对象结构
    // 判定标准：包含 target, type, handler 三个关键属性
    if (item.target && item.type && typeof item.handler === 'function') {
      const { target, type, handler, options } = item
      // 如果 target 是 Ref (如 ref(DOM))，自动取其 value
      const el = isRef(target) ? target.value : target

      if (el && el.removeEventListener) {
        el.removeEventListener(type, handler, options)
      }
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

  // 组件销毁时自动执行
  onUnmounted(() => {
    clean(resources)
  })

  // 返回手动清理方法
  return { clean }
}
```

## 2. 业务代码使用示例

```javascript

import { ref, onMounted } from 'vue'
import { useEventListenerCleaner } from '@/composables/useEventListenerCleaner'

const myButton = ref(null)

// 1. 定义事件处理函数
const handleResize = () => console.log('窗口缩放了')
const handleClick = () => console.log('按钮被点了')

// 2. 组织监听器资源（支持数组、Ref、或混合结构）
const eventResources = [
  { target: window, type: 'resize', handler: handleResize },
  { target: myButton, type: 'click', handler: handleClick } // target 支持传入 DOM Ref
]

onMounted(() => {
  // 绑定监听
  window.addEventListener('resize', handleResize)
  myButton.value?.addEventListener('click', handleClick)
})

// 3. 注册自动销毁
useEventListenerCleaner(eventResources)



  <button ref="myButton">点击测试</button>

```

## 💡 封装设计的核心：

1. **结构约定**：通过 `{ target, type, handler }` 这一标准结构，将散乱的 `addEventListener` 逻辑**数据化**。
2. **DOM Ref 兼容**：`target` 属性支持传入 Vue 的 `ref(null)`，函数内部会自动处理 `.value`。
3. **深度递归**：无论你把事件监听对象藏在数组还是多层嵌套对象里，都能被“挖”出来清理掉。
4. **无缝集成**：由于该函数只在 `onUnmounted` 时工作，它不会干扰你正常的 `addEventListener` 过程。
