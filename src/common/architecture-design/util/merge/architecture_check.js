const architecture_check_keys = [
  {
    key: 'wrap_payload',
    default_count: 0,
  },
  {
    key: 'income_pipeline',
    default_count: 0,
  },
  {
    key: 'props',
    default_count: 0,
  },
  {
    key: 'emit',
    default_count: 0,
  },
  {
    key: 'all_event_pipeline',
    default_count: 0,
  },

  {
    key: 'useContextAssembler',
    default_count: 0,
  },
  {
    key: 'architecture_check_result',
    default_count: 1,
    max_count: 1,
  },

  ,
]
const architecture_check_keys_arr = architecture_check_keys.map((config) => config.key)
const error_message_use_arr = architecture_check_keys_arr.slice(0, -1)
const common_message_fn = (key) => {
  return `[架构检查失败] 检测到重复字段： ${key}  定义或者执行次数不能超过1,请检查代码!`
}
/**
 *  架构检查  预处理
 * @param {*} payload
 */
export const architecture_check_pre_process = (payload) => {
  if (!payload.architecture_check_result) {
    payload.architecture_check_result = {}
  }
  architecture_check_keys.map((config) => {
    architecture_check_pre_process_item(payload, config)
  })
}

/**
 *  架构检查  检查
 * @param {*} payload
 */
const architecture_check_pre_process_item = (payload, config) => {
  let { architecture_check_result = {} } = payload

  let { key, default_count } = config

  let count_key = `${key}_count`

  architecture_check_result[count_key] = default_count
}

/**
 *  架构检查   键合并过程计数
 * @param {*} payload
 */
export const architecture_check_when_merge_to_payload = (payload, key) => {
  if (architecture_check_keys_arr.includes(key)) {
    payload.architecture_check_result[`${key}_count`] += 1
  }
}

/**
 *  架构检查   终处理
 * @param {*} payload
 */
export const architecture_check_after_process = (payload) => {
  architecture_check_keys.map((config) => {
    architecture_check_after_process_item(payload, config)
  })
}

/**
 *  架构检查   检查
 * @param {*} payload
 */
const architecture_check_after_process_item = (payload, config) => {
  const is_prod = import.meta.env?.PROD
  let { architecture_check_result = {} } = payload

  let { key, default_count, max_count, message } = config
  if (!max_count) {
    max_count = default_count + 1
  }

  let count_key = `${key}_count`
  if (architecture_check_result[count_key] > max_count) {
    let message_str = ''

    if (message) {
      if (typeof message === 'function') {
        message_str = message()
      } else {
        message_str = message
      }
    } else {
      message_str = common_message_fn(key)
    }

    if (is_prod) {
      console.warn(message_str)
    } else {
      console.error(message_str)

      console.error(
        `[架构检查失败] 检测到重复字段：以下项在单组件内必须保持唯一性，多处定义将引发不可预知的错误！：${error_message_use_arr.join(',')}`,
      )
      throw new Error(message_str)
    }
  }
}
