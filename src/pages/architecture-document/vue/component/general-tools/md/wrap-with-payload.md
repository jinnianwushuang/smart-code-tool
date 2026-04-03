---
title: 函数包装器
order: 52
---

## 函数包装器

这是一个经典的**高阶函数（Higher-Order Function）**封装场景。通过遍历 `fn_obj` 并将每个函数包装一层，可以实现自动注入 `payload` 作为第一个参数。

```javascript
/**
 * 上下文注入调度器
 * @param {Object} payload - 全局上下文载荷
 * @param {Object} fn_obj - 包含多个业务逻辑函数的对象
 * @returns {Object} - 增强后的函数对象
 */
const wrap_with_payload = (payload, fn_obj) => {
  const dispatched_methods = {}

  // 遍历函数定义对象
  Object.keys(fn_obj).forEach((fn_name) => {
    const original_fn = fn_obj[fn_name]

    // 确保值是函数才进行封装
    if (typeof original_fn === 'function') {
      /**
       * 包装后的箭头函数
       * @param {...any} args - 调用时传入的后续参数
       */
      dispatched_methods[fn_name] = async (...args) => {
        // 自动将 payload 作为第一个参数注入，后续参数跟在其后
        return await original_fn(payload, ...args)
      }
    }
  })

  return dispatched_methods
}

/**
 * 示例用法
 */

// 1. 定义上下文（例如 Vue 的 store、信号、配置等）
const my_payload = {
  user_token: 'abc-123',
  base_url: 'https://api.example.com',
  retry_limit: 3,
}

// 2. 定义业务逻辑函数对象
const user_actions = {
  // 每个函数的第一个参数预留给 payload
  fetch_profile: async (payload, user_id) => {
    console.log(`使用 Token: ${payload.user_token} 获取用户 ${user_id} 的资料`)
    // 实际 API 调用逻辑...
  },

  update_settings: async (payload, settings) => {
    console.log(`向 ${payload.base_url} 发送配置更新`, settings)
  },
}

// 3. 执行封装
const actions = wrap_with_payload(my_payload, user_actions)

// 4. 调用（此时不需要手动传入 payload）
actions.fetch_profile('user_001')
actions.update_settings({ theme: 'dark' })
```

## 核心逻辑说明：

1. **参数自动注入**：通过 `original_fn(payload, ...args)`，将调用者传入的参数自动“后移”，确保 `payload` 始终占据第一个位置。
2. **异步支持**：包装函数使用了 `async/await`，确保它可以无缝处理异步 API 请求。
3. **命名风格**：完全遵循你要求的 `snake_case` 风格。
4. **解耦**：业务逻辑函数（`user_actions`）只需要声明 `payload` 参数，而不需要关心 `payload` 从哪里来，这让单元测试变得非常简单。
