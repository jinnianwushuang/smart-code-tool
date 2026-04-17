---
title: API 请求处理
order: 25
---

# API 请求与模块调用说明

## 目录结构

```
api-request/
├── index.js
└── module/
    └── handle_init_table_data.js
```

## API 请求入口

`api-request/index.js` 是本模块 API 调用的统一入口。它并未直接放置具体请求逻辑，而是为业务请求调用提供统一层。

## 请求流程实现

`api-request/module/handle_init_table_data.js` 实现了一个标准请求流程：

```javascript
export const handle_init_table_data = async (payload) => {
  try {
    const can_proceed = check_request_eligibility(payload)
    if (!can_proceed) return

    const final_params = compute_request_params(payload)
    const api_func = get_target_api_func(payload)
    const response = await api_func(final_params)
    handle_api_response(payload, response)
  } catch (error) {
    error_handler(payload, error)
  } finally {
    finally_handler(payload)
  }
}
```

### 7 个步骤

1. 计算是否可以发起请求
2. 计算请求参数
3. 获取实际 API 函数
4. 发起异步请求
5. 处理返回结果
6. 异常处理
7. 最终兜底处理

## 详细实现

### 预检逻辑

```javascript
const check_request_eligibility = (payload) => {
  const { params, is_loading } = payload
  if (is_loading || !params) return false
  return true
}
```

如果当前正在加载，或者参数缺失，则中止请求。

### 参数构建

```javascript
const compute_request_params = (payload) => {
  const { params, user_id } = payload
  return {
    ...params,
    uid: user_id,
    timestamp: Date.now(),
  }
}
```

将基础参数与用户 ID、时间戳等上下文信息合并。

### API 函数匹配

```javascript
const get_target_api_func = (payload) => {
  const { api_type } = payload
  return api_service[api_type] || api_service.default_fetch
}
```

通过 `payload.api_type` 匹配对应的 API 服务函数。

## 响应与异常处理

```javascript
const handle_api_response = (payload, response) => {
  if (response.code === 200) {
    return success_handler(payload, response.data)
  } else {
    return error_handler(payload, response.message)
  }
}
```

### 错误处理示例

```javascript
const error_handler = (payload, message) => {
  console.error('请求失败:', message)
}
```

### 兜底处理

```javascript
const finally_handler = (payload) => {}
```

该处理函数可用于重置 `loading` 状态、释放资源或记录日志。

## 模块间调用关系

- `module/lifecycle/lifecycle.js` 会调用 `handle_query_demo(payload)`，间接触发 API 请求
- `module/other-method/index.js` 提供可复用的业务方法
- `module/emit/emit.js` 可生成可供模板绑定的事件发射方法

## 结论

- 该模块采用统一请求流程模板，便于扩展与测试
- 通过 `payload` 解构上下文，保持函数接口一致
- 增加新的 API 类型时只需扩展 `api_service` 或新增 `api_type` 映射
