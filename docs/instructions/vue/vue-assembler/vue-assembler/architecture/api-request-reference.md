# API 请求处理参照

> 仅单例模板提供此模块。

## 目录结构

```
api-request/
├── index.js                              # 统一入口
└── module/
    └── handle_init_table_data.js         # 标准请求流程实现
```

## 7 步标准请求流程

```javascript
// api-request/module/handle_init_table_data.js

export const handle_init_table_data = async (payload) => {
  try {
    // 步骤 1：计算是否可以发起请求（防重复提交）
    const can_proceed = check_request_eligibility(payload)
    if (!can_proceed) return

    // 步骤 2：计算请求参数（合并表单、分页、上下文）
    const final_params = compute_request_params(payload)

    // 步骤 3：获取实际 API 函数（根据 api_type 匹配）
    const api_func = get_target_api_func(payload)

    // 步骤 4：发起异步请求
    const response = await api_func(final_params)

    // 步骤 5：处理返回结果（更新表格数据、分页等）
    handle_api_response(payload, response)
  } catch (error) {
    // 步骤 6：异常处理
    error_handler(payload, error)
  } finally {
    // 步骤 7：兜底处理（重置 loading 状态等）
    finally_handler(payload)
  }
}
```

## 各步骤标准实现

### 步骤 1：预检

```javascript
const check_request_eligibility = (payload) => {
  const { table_loading, query_form } = payload
  // 正在加载中或参数缺失则中止
  if (table_loading.value) return false
  return true
}
```

### 步骤 2：参数构建

```javascript
const compute_request_params = (payload) => {
  const { query_form, pagination } = payload
  return {
    ...query_form.value,
    page: pagination.value.current,
    page_size: pagination.value.pageSize,
  }
}
```

### 步骤 3：API 函数匹配

```javascript
const get_target_api_func = (payload) => {
  const { api_type } = payload
  return api_service[api_type] || api_service.default_fetch
}
```

### 步骤 5：响应处理

```javascript
const handle_api_response = (payload, response) => {
  const { table_data, pagination } = payload
  if (response.code === 200) {
    table_data.value = response.data.rows
    pagination.value.total = response.data.total
  } else {
    error_handler(payload, response.message)
  }
}
```

### 步骤 6：错误处理

```javascript
const error_handler = (payload, message) => {
  console.error('请求失败:', message)
}
```

### 步骤 7：兜底处理

```javascript
const finally_handler = (payload) => {
  const { table_loading } = payload
  table_loading.value = false
}
```

## 调用链路

```
lifecycle_onMounted
  → handle_init_table_data(payload)     # 初始加载
  → 7 步标准流程

handle_query_click（事件管道）
  → handle_init_table_data(payload)     # 查询触发

on_table_change（事件管道）
  → handle_init_table_data(payload)     # 翻页触发
```

## 关键约束

- API 请求统一通过 `handle_init_table_data` 入口，禁止绕过
- 必须实现完整的 7 步流程，不可跳过预检或兜底
- 错误处理必须包含，禁止空 catch
- `table_loading` 状态必须在 finally 中重置
