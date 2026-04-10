import {
  architecture_check_pre_process,
  architecture_check_after_process,
  merge_to_payload_with_conflict_logs,
} from 'src/output/common/project-common.js'

/**
 * 上下文启动器
 * 消费生成器函数队列，扩充上下文
 */
export const useContextAssembler = (initialPayload, config_obj = {}) => {
  let base_payload = {}
  let payload = {}

  if (typeof initialPayload === 'function') {
    base_payload = initialPayload()
  } else {
    base_payload = initialPayload
  }

  // 架构检查 前置处理
  architecture_check_pre_process(payload)
  // 合并 初始上下文
  merge_to_payload_with_conflict_logs({
    payload,
    dataToMerge: base_payload,
    file_path: 'useContextAssembler.js',
  })

  // 1. 状态机就绪 合并状态机
  config_obj.state_fn_arr?.forEach((fn) => {
    Object.assign(payload, fn(payload))
  })
  // 2. 方法挂载 合并返回的常规函数
  config_obj.method_fn_arr?.forEach((fn) => {
    Object.assign(payload, fn(payload))
  })
  // 3. 生命周期激活 合并返回的 emit 函数
  config_obj.lifecycle_fn_arr?.forEach((fn) => Object.assign(payload, fn(payload)))
  // 4. 函数包装
  const { wrap_payload } = payload

  // 函数包装 上下文包装
  if (wrap_payload && wrap_payload.length > 0) {
    let wrapped_payload = {}
    wrap_payload.forEach((fn_name) => {
      if (typeof payload[fn_name] !== 'function') {
        console.warn(
          `wrap_payload 配置项指定的函数 ${fn_name} 在 payload 中未找到或不是函数，跳过包装。`,
        )
        return
      }
      wrapped_payload[fn_name] = (...args) => payload[fn_name](payload, ...args)
    })

    Object.assign(payload, {
      wrapped_payload,
    })
  }
  // 架构检查 后置处理
  architecture_check_after_process(payload)
  // 最后返回生成的 payload 对象，供组件内使用

  return payload
}
