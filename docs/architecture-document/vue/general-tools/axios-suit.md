---
title: axios 封装
order: 71
---

# axios 封装



## 工业级 Axios 异步请求封装方案

这个文档将 **Axios 统一请求封装**、**AbortController 中止管理**、**自动去重**以及**参数格式统一**完美整合，是一份开箱即用的工业级前端请求层方案。

------

## 1. 设计核心

- **参数标准化**：统一 `get/post` 调用方式，消除 `params` 与 `data` 的字段记忆负担。
- **请求去重**：自动中止同一接口的重复请求，防止后端压力与前端数据竞态。
- **手动中止**：支持通过 `signal` 配合 `AbortController` 随时停止请求（如组件销毁、轮询中止）。
- **错误熔断**：透传 HTTP 状态码，支持 401/403 权限错误立即停止业务逻辑。

------

## 2. 核心代码实现

## 模块 A：`cancel.js` (中止管理)

管理请求的生命周期，防止重复发送。

```javascript
// utils/cancel.js
const pendingMap = new Map();

export const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
};

export const addPending = (config) => {
  const key = getRequestKey(config);
  if (!pendingMap.has(key)) {
    const controller = new AbortController();
    config.signal = config.signal || controller.signal;
    pendingMap.set(key, controller);
  }
};

export const removePending = (config) => {
  const key = getRequestKey(config);
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key);
    controller.abort(); // 执行中止
    pendingMap.delete(key);
  }
};
```

## 模块 B：`request.js` (Axios 实例与拦截器)

核心封装，处理参数统一化与错误拦截。

```javascript
// utils/request.js
import axios from 'axios';
import { addPending, removePending } from './cancel';

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 环境变量
  timeout: 10000,
});

// --- 请求拦截器 ---
instance.interceptors.request.use(config => {
  removePending(config); // 尝试取消上一个相同的重复请求
  addPending(config);    // 记录当前请求
  
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// --- 响应拦截器 ---
instance.interceptors.response.use(response => {
  removePending(response.config);
  const { data } = response;

  if (data.code === 200) return data.data; // 业务成功，直接返回数据
  
  // 业务错误处理
  console.error(data.msg || '业务异常');
  return Promise.reject(new Error(data.msg || 'Error'));
}, error => {
  if (axios.isCancel(error)) return new Promise(() => {}); // 手动取消不报错

  const status = error.response?.status;
  error.status = status; // 透传状态码，供轮询熔断使用

  if (status === 401) console.error('未授权，跳转登录');
  return Promise.reject(error);
});

/**
 * 统一参数格式的请求对象
 */
const http = {
  get(url, params = {}, config = {}) {
    return instance({ url, method: 'get', params, ...config });
  },
  post(url, data = {}, config = {}) {
    // 自动识别 FormData 处理 Content-Type
    const headers = data instanceof FormData 
      ? { ...config.headers, 'Content-Type': 'multipart/form-data' } 
      : config.headers;
    return instance({ url, method: 'post', data, ...config, headers });
  },
  put(url, data = {}, config = {}) {
    return instance({ url, method: 'put', data, ...config });
  },
  delete(url, params = {}, config = {}) {
    return instance({ url, method: 'delete', params, ...config });
  }
};

export default http;
```

------

## 3. 调用示例 (Services 层)

将 API 请求模块化，能让业务代码极度简洁。

```javascript
// api/user.js
import http from '@/utils/request';

export const userService = {
  // GET: 自动处理为 /api/user/info?id=1
  getInfo: (id) => http.get('/user/info', { id }),
  
  // POST: 自动处理 Body 传参
  update: (data) => http.post('/user/update', data),
  
  // 带中止信号的请求 (配合轮询或组件卸载)
  getStatus: (id, signal) => http.get(`/status/${id}`, {}, { signal }),

  // 文件上传
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return http.post('/user/avatar', fd);
  }
};
```

------

## 4. 配合轮询工具使用

这是之前封装的 `poll` 函数与此 Axios 封装的完美联动：

```javascript
import { userService } from '@/api/user';
import { poll } from '@/utils/poll';

// 需求：轮询用户审核状态，直到成功
const { promise, abort } = poll(
  (signal) => userService.getStatus('user_001', signal), // 透传信号
  (res) => res.auditStatus === 'PASSED',
  { interval: 2000, maxErrors: 3 }
);

promise.then(data => {
  console.log('审核通过:', data);
}).catch(err => {
  // 如果是 401 权限错误，poll 内部会感知并停止，进入此处
  console.error('停止轮询:', err.message);
});

// 组件卸载时：abort();
```

## 5. 笔记总结

- **GET**：传参始终用第二个参数（`params` 映射）。
- **POST**：传参始终用第二个参数（`data` 映射）。
- **中止请求**：在第三个参数中传入 `{ signal }`。
- **去重**：默认开启。若需关闭，可在拦截器中根据 `config.url` 做白名单过滤。

这份笔记完整涵盖了从**底层协议**到**业务调用**的所有环节，建议作为项目的标准请求模版。**需要针对不同环境（Dev/Prod）配置多 BaseURL 吗？**
