---
title: 请求错误重试
order: 61
---

# 请求错误重试



## JS 健壮性轮询函数封装 (AbortController 版)

这是一个非常实用的**工业级 JS 异步轮询封装**，结合了 `AbortController`、连续错误熔断以及特定错误终止机制。

------
## 1. 核心设计目标

- **成功即停**：一旦满足业务成功条件，立即停止，不再发起后续请求。
- **资源释放**：支持手动中止（如页面销毁），同时清除 `fetch` 和 `setTimeout`。
- **连续容错**：接口偶发报错自动重试，但连续报错达到上限（`maxErrors`）则停止。
- **特定熔断**：遇到 `401`、`403` 等权限错误时，立即停止轮询，不进行无意义重试。

## 2. 代码实现

```javascript
/**
 * 健壮的异步轮询工具函数
 * @param {Function} apiFn - 请求逻辑: (signal) => Promise
 * @param {Function} checkSuccess - 成功判定: (res) => boolean
 * @param {Object} options - 配置项
 * @param {number} options.interval - 轮询间隔(ms)，默认 2000
 * @param {number} options.maxAttempts - 总尝试次数上限，默认不限
 * @param {number} options.maxErrors - 允许的连续错误次数上限，默认 5
 */
function poll(apiFn, checkSuccess, { 
  interval = 2000, 
  maxAttempts = Infinity, 
  maxErrors = 5 
} = {}) {
  // 创建中止控制器
  const controller = new AbortController();
  const { signal } = controller;

  const execute = async () => {
    let attempts = 0;      // 总计数
    let errorCount = 0;    // 连续错误计数

    while (attempts < maxAttempts) {
      // 检查是否已被手动中止
      if (signal.aborted) return { status: 'aborted', attempts };

      attempts++;
      try {
        const result = await apiFn(signal);
        
        errorCount = 0; // 请求成功，重置连续错误计数

        // 业务逻辑检查：是否达到“成功停止”的状态
        if (checkSuccess(result)) {
          return { status: 'success', data: result, attempts };
        }
        
        console.log(`[第${attempts}次] 业务未完成，继续轮询...`);
      } catch (err) {
        // 1. 手动中止异常不计入错误
        if (err.name === 'AbortError') return { status: 'aborted', attempts };

        // 2. 特定错误熔断：权限类错误(401/403)直接退出
        const status = err.status || err.response?.status;
        if (status === 401 || status === 403) {
          throw new Error(`权限失效(${status})，轮询强行终止`);
        }

        // 3. 连续错误计数
        errorCount++;
        console.warn(`[第${attempts}次] 接口异常(${errorCount}/${maxErrors}): ${err.message}`);

        if (errorCount >= maxErrors) {
          throw new Error(`连续报错达上限 ${maxErrors} 次，任务停止`);
        }
      }

      // 4. 等待下一次轮询，并监听中止信号
      if (attempts < maxAttempts) {
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, interval);
          // 如果在等待期间中止，立即清除定时器
          signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
        });
      }
    }

    return { status: 'limit_reached', attempts };
  };

  return {
    promise: execute(),
    abort: () => controller.abort() // 暴露给外部的手动停止方法
  };
}
```

## 3. 使用场景示例

```javascript
// 模拟 API 请求（注意：需将状态码挂在 Error 对象上以触发熔断）
const checkStatusApi = (taskId) => async (signal) => {
  const res = await fetch(`/api/task/${taskId}`, { signal });
  if (!res.ok) {
    const err = new Error(res.statusText);
    err.status = res.status; // 关键：透传状态码
    throw err;
  }
  return res.json();
};

// 开启轮询
const { promise, abort } = poll(
  checkStatusApi('task_123'),
  (res) => res.data.status === 'COMPLETED',
  { interval: 3000, maxErrors: 3 }
);

// 处理结果
promise
  .then(res => console.log('轮询结束:', res))
  .catch(err => console.error('轮询失败:', err.message));

// 场景：Vue/React 组件卸载时调用
// abort();
```

## 4. 关键点总结

- **`AbortController`**：现代浏览器原生支持，是处理异步任务取消的标准方案。
- **`errorCount` 逻辑**：仅在**连续**报错时累加。只要成功一次，计数就归零。
- **`signal` 传递**：必须将 `signal` 传给底层的 `fetch` 或 `axios`，否则网络请求无法真正中断。

需要将此函数导出为 **ES 模块**（`export`）或集成到您的**项目工具类**中吗？
