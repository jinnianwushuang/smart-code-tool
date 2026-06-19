---
title: API 请求处理
order: 23
---

# API 请求处理

## 概述

该模板提供结构化的 API 请求处理系统，具有自动错误处理、加载状态管理和请求取消功能。

## API 结构

### API 模块组织

```
api/
├── index.js              # API 入口点
├── module/
│   ├── service.js        # 通用服务方法
│   └── user.js           # 用户特定 API
└── utils/
    ├── wrapper/          # 请求包装器
    └── ...               # 其他工具
```

### 基础 API 配置

位于 `api/index.js`：

```javascript
import axios from 'axios'

// Create axios instance
// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    // 添加认证令牌
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    // 处理常见错误
    if (error.response?.status === 401) {
      // Redirect to login
      // 重定向到登录
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

## 请求包装器系统

### 请求包装器概述

请求包装器提供一致的请求处理，包括加载状态、错误处理和取消功能。

### 基础请求包装器

位于 `api/utils/wrapper/request-wrapper.js`：

```javascript
import apiClient from '../index.js'

// Basic request wrapper
// 基础请求包装器
export const request_wrapper = async (config, options = {}) => {
  const {
    showLoading = true,
    showError = true,
    loadingText = 'Loading...',
  } = options

  try {
    // Show loading
    // 显示加载
    if (showLoading) {
      // Implementation depends on your loading system
      // 实现取决于您的加载系统
      console.log(loadingText)
    }

    const response = await apiClient(config)
    return response.data
  } catch (error) {
    // Handle error
    // 处理错误
    if (showError) {
      console.error('Request failed:', error.message)
    }
    throw error
  } finally {
    // Hide loading
    // 隐藏加载
    if (showLoading) {
      console.log('Loading complete')
    }
  }
}
```

### 高级请求包装器

具有取消和重试功能的包装器：

```javascript
import apiClient from '../index.js'

// Advanced request wrapper with cancellation and retry
// 具有取消和重试功能的先进请求包装器
export const advanced_request_wrapper = async (config, options = {}) => {
  const {
    showLoading = true,
    showError = true,
    retryCount = 3,
    retryDelay = 1000,
    cancellable = true,
  } = options

  let cancelToken = null
  if (cancellable) {
    const CancelToken = apiClient.CancelToken
    cancelToken = CancelToken.source()
  }

  const makeRequest = async (attempt = 1) => {
    try {
      if (showLoading) {
        console.log(`Loading... (attempt ${attempt})`)
      }

      const response = await apiClient({
        ...config,
        cancelToken: cancelToken?.token,
      })

      return response.data
    } catch (error) {
      if (apiClient.isCancel(error)) {
        console.log('Request cancelled')
        throw error
      }

      if (attempt < retryCount && shouldRetry(error)) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await delay(retryDelay)
        return makeRequest(attempt + 1)
      }

      if (showError) {
        console.error('Request failed:', error.message)
      }
      throw error
    } finally {
      if (showLoading) {
        console.log('Loading complete')
      }
    }
  }

  const result = await makeRequest()

  // Return result and cancel function
  // 返回结果和取消函数
  return {
    data: result,
    cancel: () => cancelToken?.cancel('Operation cancelled by user'),
  }
}

// Helper functions
// 辅助函数
const shouldRetry = (error) => {
  // Retry on network errors or 5xx status codes
  // 在网络错误或 5xx 状态码上重试
  return !error.response || error.response.status >= 500
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
```

## API 模块

### 服务模块

位于 `api/module/service.js`：

```javascript
import { request_wrapper } from '../utils/wrapper/request-wrapper.js'

// Generic service methods
// 通用服务方法
export const get_list = async (endpoint, params = {}) => {
  return request_wrapper({
    method: 'GET',
    url: endpoint,
    params,
  })
}

export const get_detail = async (endpoint, id) => {
  return request_wrapper({
    method: 'GET',
    url: `${endpoint}/${id}`,
  })
}

export const create_item = async (endpoint, data) => {
  return request_wrapper({
    method: 'POST',
    url: endpoint,
    data,
  })
}

export const update_item = async (endpoint, id, data) => {
  return request_wrapper({
    method: 'PUT',
    url: `${endpoint}/${id}`,
    data,
  })
}

export const delete_item = async (endpoint, id) => {
  return request_wrapper({
    method: 'DELETE',
    url: `${endpoint}/${id}`,
  })
}
```

### 特定模块

位于 `api/module/user.js`：

```javascript
import { get_list, get_detail, create_item, update_item, delete_item } from './service.js'

// User-specific API methods
// 用户特定的 API 方法
export const get_user_list = (params) => get_list('/users', params)
export const get_user_detail = (id) => get_detail('/users', id)
export const create_user = (data) => create_item('/users', data)
export const update_user = (id, data) => update_item('/users', id, data)
export const delete_user = (id) => delete_item('/users', id)

// Additional user methods
// 额外的用户方法
export const login = async (credentials) => {
  return request_wrapper({
    method: 'POST',
    url: '/auth/login',
    data: credentials,
  })
}

export const logout = async () => {
  return request_wrapper({
    method: 'POST',
    url: '/auth/logout',
  })
}

export const get_user_profile = async () => {
  return request_wrapper({
    method: 'GET',
    url: '/user/profile',
  })
}
```

## 请求处理集成

### 在组件中使用 API

在主组件中：

```javascript
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/module/assembler.js'

const {
  handle_query_user_list,
  handle_create_user,
  handle_update_user,
  handle_delete_user,
} = useContextAssembler(base_payload, all_atoms_assembler())
```

### 请求处理方法

位于 `module/other-method/api-request.js`：

```javascript
// Query user list
// 查询用户列表
export const handle_query_user_list = async (payload) => {
  const { table_data, pagination, loading } = payload

  try {
    loading.value = true

    const response = await get_user_list({
      page: pagination.value.current,
      size: pagination.value.pageSize,
      ...payload.query_form.value,
    })

    table_data.value = response.data
    pagination.value.total = response.total
  } catch (error) {
    console.error('Failed to load user list:', error)
    // Handle error (show notification, etc.)
    // 处理错误（显示通知等）
  } finally {
    loading.value = false
  }
}

// Create user
// 创建用户
export const handle_create_user = async (payload) => {
  const { all_dialog_state, table_data } = payload

  try {
    await create_user(all_dialog_state.value.form)

    // Close dialog and refresh list
    // 关闭对话框并刷新列表
    all_dialog_state.value.visible = false
    await handle_query_user_list(payload)

    // Show success message
    // 显示成功消息
    console.log('User created successfully')
  } catch (error) {
    console.error('Failed to create user:', error)
    // Handle error
    // 处理错误
  }
}

// Update user
// 更新用户
export const handle_update_user = async (payload) => {
  const { all_dialog_state, table_data, current_edit_id } = payload

  try {
    await update_user(current_edit_id.value, all_dialog_state.value.form)

    // Close dialog and refresh list
    // 关闭对话框并刷新列表
    all_dialog_state.value.visible = false
    await handle_query_user_list(payload)

    console.log('User updated successfully')
  } catch (error) {
    console.error('Failed to update user:', error)
  }
}

// Delete user
// 删除用户
export const handle_delete_user = async (payload) => {
  const { table_data, current_delete_id } = payload

  try {
    await delete_user(current_delete_id.value)

    // Refresh list
    // 刷新列表
    await handle_query_user_list(payload)

    console.log('User deleted successfully')
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}
```

## 错误处理

### 全局错误处理

位于 `api/utils/error-handler.js`：

```javascript
// Global error handler
// 全局错误处理器
export const handle_api_error = (error) => {
  if (error.response) {
    // Server responded with error status
    // 服务器以错误状态响应
    const { status, data } = error.response

    switch (status) {
      case 400:
        console.error('Bad Request:', data.message)
        break
      case 401:
        console.error('Unauthorized')
        // Redirect to login
        // 重定向到登录
        break
      case 403:
        console.error('Forbidden:', data.message)
        break
      case 404:
        console.error('Not Found:', data.message)
        break
      case 500:
        console.error('Internal Server Error')
        break
      default:
        console.error('API Error:', data.message)
    }
  } else if (error.request) {
    // Network error
    // 网络错误
    console.error('Network Error:', error.message)
  } else {
    // Other error
    // 其他错误
    console.error('Request Error:', error.message)
  }
}

// Validation error handler
// 验证错误处理器
export const handle_validation_error = (error, form_ref) => {
  if (error.response?.status === 422) {
    const { errors } = error.response.data

    // Set form validation errors
    // 设置表单验证错误
    Object.keys(errors).forEach(field => {
      form_ref.value.setFields([
        {
          name: field,
          errors: [errors[field][0]],
        },
      ])
    })
  }
}
```

### 请求取消

```javascript
// Example with cancellation
// 具有取消的示例
export const handle_search_with_cancel = async (payload) => {
  const { search_query, table_data, loading, cancel_token } = payload

  // Cancel previous request
  // 取消之前的请求
  if (cancel_token.value) {
    cancel_token.value.cancel('New search initiated')
  }

  try {
    loading.value = true

    const result = await advanced_request_wrapper({
      method: 'GET',
      url: '/search',
      params: { q: search_query.value },
    }, { cancellable: true })

    cancel_token.value = result.cancel
    table_data.value = result.data
  } catch (error) {
    if (!apiClient.isCancel(error)) {
      console.error('Search failed:', error)
    }
  } finally {
    loading.value = false
  }
}
```

## 加载状态管理

### 全局加载状态

```javascript
// Global loading state
// 全局加载状态
export const global_loading = ref(false)

// Loading manager
// 加载管理器
export const loading_manager = {
  start: () => global_loading.value = true,
  stop: () => global_loading.value = false,

  // Scoped loading
  // 作用域加载
  withLoading: async (fn) => {
    loading_manager.start()
    try {
      return await fn()
    } finally {
      loading_manager.stop()
    }
  },
}
```

### 组件级加载状态

```javascript
// Component loading states
// 组件加载状态
export const component_loading_states = {
  table: ref(false),
  form: ref(false),
  dialog: ref(false),
}

// Usage in methods
// 在方法中的使用
export const handle_submit_form = async (payload) => {
  const { component_loading_states } = payload

  return loading_manager.withLoading(async () => {
    component_loading_states.form.value = true
    try {
      await submit_form_api(payload.form_data.value)
      console.log('Form submitted successfully')
    } finally {
      component_loading_states.form.value = false
    }
  })
}
```

## 缓存和优化

### 简单缓存

```javascript
// Simple cache implementation
// 简单缓存实现
const cache = new Map()

export const cached_request = async (key, request_fn, ttl = 300000) => {
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  const data = await request_fn()
  cache.set(key, { data, timestamp: Date.now() })

  return data
}

// Usage
// 使用
export const get_cached_user_list = (params) => {
  const key = `user_list_${JSON.stringify(params)}`
  return cached_request(key, () => get_user_list(params))
}
```

### 请求去重

```javascript
// Request deduplication
// 请求去重
const pending_requests = new Map()

export const deduped_request = async (key, request_fn) => {
  if (pending_requests.has(key)) {
    return pending_requests.get(key)
  }

  const promise = request_fn()
  pending_requests.set(key, promise)

  try {
    const result = await promise
    return result
  } finally {
    pending_requests.delete(key)
  }
}

// Usage
// 使用
export const get_deduped_user_detail = (id) => {
  const key = `user_detail_${id}`
  return deduped_request(key, () => get_user_detail(id))
}
```

## 测试 API 请求

```javascript
import { describe, test, expect, vi } from 'vitest'
import { get_user_list } from '../api/module/user.js'

// Mock axios
// 模拟 axios
vi.mock('axios')

describe('API Requests', () => {
  test('get_user_list returns user data', async () => {
    const mockData = { data: [{ id: 1, name: 'John' }], total: 1 }

    // Mock the API response
    // 模拟 API 响应
    axios.get.mockResolvedValue({ data: mockData })

    const result = await get_user_list()

    expect(result).toEqual(mockData)
    expect(axios.get).toHaveBeenCalledWith('/users', { params: {} })
  })

  test('handles API errors', async () => {
    axios.get.mockRejectedValue(new Error('Network error'))

    await expect(get_user_list()).rejects.toThrow('Network error')
  })
})
```
