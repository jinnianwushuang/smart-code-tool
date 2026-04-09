import { api_service } from 'src/api/index.js'
/**
 * 主调度函数 (Main Dispatcher)
 */
export const handle_init_table_data = async (payload) => {
  // 从 payload 解构上下文
  const {} = payload

  try {
    // 1. 预检
    const can_proceed = check_request_eligibility(payload)
    if (!can_proceed) return

    // 2. 准备参数
    const final_params = compute_request_params(payload)

    // 3. 获取 API 引用
    const api_func = get_target_api_func(payload)

    // 4. 发起异步请求
    const response = await api_func(final_params)

    // 5. 处理结果
    handle_api_response(payload, response)
  } catch (error) {
    // 6. 异常处理
    console.error('请求流程崩溃:', error)
    error_handler(payload, error)
  } finally {
    // 7. 最终兜底 (如重置 Loading 状态)
    finally_handler(payload)
  }
}

// 1. 计算是否可以发起请求 (预检)
const check_request_eligibility = (payload) => {
  const { params, is_loading } = payload
  // 示例：如果正在加载或缺少必要参数，则拦截
  if (is_loading || !params) return false
  return true
}

// 2. 计算请求参数 (转换/格式化)
const compute_request_params = (payload) => {
  const { params, user_id } = payload
  return {
    ...params,
    uid: user_id,
    timestamp: Date.now(),
  }
}

// 3. 匹配实际的 API 函数 (策略分配)
const get_target_api_func = (payload) => {
  const { api_type } = payload
  // 从服务层映射中获取具体的请求方法
  return api_service[api_type] || api_service.default_fetch
}

// 5 & 6. 响应处理与异常捕获
const handle_api_response = (payload, response) => {
  const {} = payload

  if (response.code === 200) {
    return success_handler(payload, response.data)
  } else {
    return error_handler(payload, response.message)
  }
}

const success_handler = (payload, data) => {
  const {} = payload
  // 示例：处理成功数据
  console.log('请求成功:', data)
}

const error_handler = (payload, message) => {
  const {} = payload
  // 示例：处理错误信息
  console.error('请求失败:', message)
}

// 7. 最终兜底 (如重置 Loading 状态)
const finally_handler = (payload) => {
  const {} = payload
}
