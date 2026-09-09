---
title: "异步编程深入：Promise/async/await 实战 [P5-P6]"
level: "intermediate"
tags: ["JavaScript", "异步", "Promise", "async", "await"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 异步编程深入：Promise/async/await 实战 [P5-P6]

> 异步编程是 JavaScript 的核心。Promise 解决回调地狱，async/await 让异步代码像同步一样简洁。

## 核心概念（What）

### 同步 vs 异步

```
同步（Synchronous）：
├── 代码按顺序执行
├── 阻塞后续代码
├── 简单直观
└── 适合 CPU 密集任务

异步（Asynchronous）：
├── 不阻塞后续代码
├── 回调处理结果
├── 适合 I/O 操作
└── 网络请求、文件读写、定时器

示例：
// 同步
const data = fetchData(); // 阻塞
console.log(data);        // 等待完成

// 异步
fetchData().then(data => {
  console.log(data);      // 数据就绪后执行
});
console.log('继续执行');   // 不等待
```

## 底层原理（Why）

### Promise

```javascript
// Promise = 异步操作的最终结果

// 三种状态：
// ├── pending → 进行中
// ├── fulfilled → 成功
// └── rejected → 失败

// 创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve('成功');
    } else {
      reject('失败');
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result); // '成功'
  })
  .catch(error => {
    console.error(error); // '失败'
  })
  .finally(() => {
    console.log('无论成功失败都执行');
  });

// 链式调用
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(error => console.error(error));
```

### Promise 方法

```javascript
// 1. Promise.all（全部成功）
Promise.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
])
.then(results => {
  console.log(results); // [user1, user2, user3]
})
.catch(error => {
  console.error(error); // 任一失败
});

// 2. Promise.allSettled（等待全部完成）
Promise.allSettled([
  fetchUser(1),
  fetchUser(2), // 可能失败
  fetchUser(3)
])
.then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log(result.value);
    } else {
      console.error(result.reason);
    }
  });
});

// 3. Promise.race（最快的那个）
Promise.race([
  fetchWithTimeout('/api/data', 5000),
  timeout(5000)
])
.then(result => {
  console.log(result);
})
.catch(error => {
  console.error('超时');
});

// 4. Promise.any（任一成功）
Promise.any([
  fetchFromCDN('data'),
  fetchFromAPI('data'),
  fetchFromCache('data')
])
.then(result => {
  console.log(result); // 最快成功的那个
});

// 工具函数
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}
```

### async/await

```javascript
// async/await = Promise 的语法糖

// async 函数返回 Promise
async function fetchUser() {
  return 'Alice';
}

fetchUser().then(user => {
  console.log(user); // 'Alice'
});

// await 等待 Promise 完成
async function getUserData() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 错误处理
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 并发执行
async function getDashboard() {
  // ❌ 串行（慢）
  const user = await fetchUser();
  const posts = await fetchPosts();
  const comments = await fetchComments();
  
  // ✅ 并行（快）
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return { user, posts, comments };
}
```

## 实战应用（How）

### 错误处理

```javascript
// 1. try/catch（推荐）
async function fetchData() {
  try {
    const data = await getData();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error; // 继续抛出
  }
}

// 2. .catch()
async function fetchData() {
  const data = await getData().catch(error => {
    console.error('获取数据失败:', error);
    return null; // 返回默认值
  });
  
  return data;
}

// 3. 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
  event.preventDefault();
});

// 4. 封装错误处理
async function safeAsync(fn) {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}

// 使用
const [error, data] = await safeAsync(() => fetchData());
if (error) {
  console.error('失败:', error);
} else {
  console.log('成功:', data);
}
```

### 并发控制

```javascript
// 1. 限制并发数
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    
    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(ret);
}

// 使用：最多同时 3 个请求
const urls = Array.from({ length: 100 }, (_, i) => `/api/data/${i}`);
await asyncPool(3, urls, url => fetch(url));

// 2. 重试机制
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用
const data = await retry(() => fetchData(), 3, 2000);

// 3. 超时控制
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
  
  return Promise.race([promise, timeout]);
}

// 使用
const data = await withTimeout(fetchData(), 5000);
```

### 常见模式

```javascript
// 1. 串行执行
async function serial() {
  const result1 = await step1();
  const result2 = await step2(result1);
  const result3 = await step3(result2);
  return result3;
}

// 2. 并行执行
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    step1(),
    step2(),
    step3()
  ]);
  return { result1, result2, result3 };
}

// 3. 竞争执行
async function race() {
  const result = await Promise.race([
    fetchFromCDN(),
    fetchFromAPI(),
    timeout(5000)
  ]);
  return result;
}

// 4. 瀑布流（前一个结果传给后一个）
async function waterfall(fns) {
  let result;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}

// 使用
const result = await waterfall([
  () => step1(),
  (r1) => step2(r1),
  (r2) => step3(r2)
]);
```

## 高频面试题

### Q1: Promise 的状态？

```
三种状态：
├── pending → 进行中
├── fulfilled → 成功（有值）
└── rejected → 失败（有原因）

特点：
├── 状态不可逆（pending → fulfilled/rejected）
├── 一旦改变就固定
└── then/catch 注册回调
```

### Q2: async/await 的优势？

```
相比 Promise：
├── 代码更简洁（像同步）
├── 错误处理更直观（try/catch）
├── 调试更容易
└── 避免回调地狱

示例：
// Promise 链
fetchUser()
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(error => console.error(error));

// async/await
try {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  console.log(comments);
} catch (error) {
  console.error(error);
}
```

### Q3: 如何处理并发请求？

```
方法：
├── Promise.all → 全部成功
├── Promise.allSettled → 等待全部
├── Promise.race → 最快那个
├── Promise.any → 任一成功
└── 自定义并发控制

示例：
// 并行（推荐）
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
]);

// 限制并发
await asyncPool(3, urls, fetch);
```

## 延伸思考

1. 如何取消 Promise？
2. async/await 的错误处理最佳实践？
3. 如何实现 Promise.all？

## 参考资料

- [MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
