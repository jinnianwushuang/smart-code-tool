---
title: mitt清理
order: 86
---

## Mitt清理

在 Vue 3 项目中，使用 `mitt` 进行跨组件通信非常普遍。为了避免组件销毁后事件监听依然存活导致的“重复触发”或“内存泄漏”，我们需要封装一个能自动执行 `emitter.off` 的组合式函数。

这个封装的重点在于识别 **`{ emitter, type, handler }`** 这一三要素结构。

## 1. 通用 Mitt 清理函数 `useMittCleaner.js`

```javascript
import { onUnmounted, isRef } from 'vue'

/**
 * 通用 Mitt 事件监听销毁组合式函数
 * 支持结构:
 * 1. 单个对象: { emitter: bus, type: 'user-login', handler: fn }
 * 2. 数组: [ { emitter, type, handler }, ... ]
 * 3. 包含以上对象的 Ref 或普通容器
 */
export function useMittCleaner(resources) {
  const clean = (item) => {
    if (!item) return

    // 1. 处理 Ref (自动解包)
    if (isRef(item)) {
      clean(item.value)
      item.value = null
      return
    }

    // 2. 处理数组 (递归清理)
    if (Array.isArray(item)) {
      item.forEach((i) => clean(i))
      item.length = 0
      return
    }

    // 3. 核心逻辑：识别 Mitt 监听三要素
    // 判定标准：具备 emitter (有 off 方法), type (事件名), handler (回调)
    if (item.emitter && typeof item.emitter.off === 'function' && item.type && item.handler) {
      const { emitter, type, handler } = item
      emitter.off(type, handler)
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

  // 组件卸载时自动注销所有事件
  onUnmounted(() => {
    clean(resources)
  })

  // 返回手动清理能力
  return { clean }
}
```

## 2. 业务代码使用示例

```javascript
import { onMounted } from 'vue'
import mitt from 'mitt'
import { useMittCleaner } from '@/composables/useMittCleaner'

// 假设这是全局或局部定义的 bus
const bus = mitt()

// 1. 定义处理函数
const onUserLogin = (data) => console.log('用户登录:', data)
const onThemeChange = (color) => console.log('主题变更:', color)

// 2. 组织监听资源 (可以是数组、对象或单个引用)
const eventGroup = [
  { emitter: bus, type: 'user-login', handler: onUserLogin },
  { emitter: bus, type: 'theme-change', handler: onThemeChange },
]

onMounted(() => {
  // 绑定监听
  bus.on('user-login', onUserLogin)
  bus.on('theme-change', onThemeChange)
})

// 3. 注册自动销毁
useMittCleaner(eventGroup)
```

## 💡 封装设计的亮点：

1. **解耦绑定与销毁**：你只需要在监听时顺手把参数丢进一个数组，**不需要**在 `onUnmounted` 里写一堆重复的 `bus.off`。
2. **通用适配**：不仅支持 `mitt`，只要是符合 `.off(type, handler)` 接口的事件库（如原生 **EventEmitter**）都能直接复用。
3. **递归支持**：即使你的监听对象是动态生成的并存储在 `ref` 数组里，该函数也能精准定位并销毁。
4. **防错处理**：清理后会自动删除容器内的 Key 或清空数组，确保引用被完全释放。
