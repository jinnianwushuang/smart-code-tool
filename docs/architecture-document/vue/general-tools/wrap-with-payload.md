---
title: 函数包装器
order: 52
---

# 函数包装器

## 实际源码位置

`src/common/architecture-design/function-wrapper/wrap_with_payload.js`

---

这是一个经典的**高阶函数（Higher-Order Function）**封装场景。通过遍历 `fn_obj` 并将每个函数包装一层，可以实现自动注入 `payload` 作为第一个参数。

```javascript
/**
 * 上下文执行调度器 (工厂模式)
 * @param {Object} payload - 上下文载荷
 * @param {Object} fn_obj - 函数定义集合
 * @returns {Object} - 包装后的函数集合
 * @description
 * 1. 遍历函数对象中的每一个键值对。
 * 2. 如果值是函数，则创建一个新的函数，自动将 payload 作为第一个参数传入。
 * 3. 如果值不是函数，则直接保留原值。
 */
export const wrap_with_payload = (payload, fn_obj) => {
  const dispatched_methods = {}

  Object.entries(fn_obj).forEach(([fn_name, raw_fn]) => {
    if (typeof raw_fn === 'function') {
      dispatched_methods[fn_name] = (...args) => raw_fn(payload, ...args)
    } else {
      dispatched_methods[fn_name] = raw_fn
    }
  })

  return dispatched_methods
}
```

## 在验证代码中的实际使用示例

```javascript
// project/vue-test-app/pages/vue-test/multiton-lv3/componsable/index.js
import { wrap_with_payload } from 'src/output/common/project-common.js'

// 业务函数对象，第一个参数预留给 payload
const fn_obj = {
  handle_query: (payload) => {
    /* ... */
  },
  handle_reset: (payload) => {
    /* ... */
  },
}

// 包装后自动注入 payload
const wrapped = wrap_with_payload(payload, fn_obj)
wrapped.handle_query() // 无需手动传 payload
```

## 核心逻辑说明：

1. **参数自动注入**：通过 `raw_fn(payload, ...args)`，将调用者传入的参数自动“后移”，确保 `payload` 始终占据第一个位置。
2. **非函数值保留**：如果 `fn_obj` 中包含非函数属性（如常量配置），会直接保留不做包装。
3. **命名风格**：完全遵循 `snake_case` 风格。
4. **解耦**：业务逻辑函数只需要声明 `payload` 参数，而不需要关心 `payload` 从哪里来，这让单元测试变得非常简单。
