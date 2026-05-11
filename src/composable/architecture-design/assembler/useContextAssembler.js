import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
} from 'vue'
import {
  architecture_check_pre_process,
  architecture_check_after_process,
  merge_to_payload_with_conflict_logs,
} from 'src/output/common/project-common.js'
import { useAllExceptEventListenerCleaner } from 'src/composable/architecture-design/lifecycle-disposer-composable/useAllExceptEventListenerCleaner.js'

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
  // if (!base_payload.ALL_CONTEXT_STATE) {
  //   console.error('必须指定传入 ALL_CONTEXT_STATE 属性，用于 当前组件的状态机的挂载点！！')
  //   return false
  // }
  // if (!base_payload.ALL_EVENT_PIPELINE) {
  //   console.error('必须指定传入 ALL_EVENT_PIPELINE 属性，用于 当前组件的事件通道的挂载点！！')
  //   return false
  // }

  // 事件通道的函数只能有一个，过多会导致组件内事件调用混乱，难以维护！！
  if (config_obj.event_pipeline_fn_arr?.length > 1) {
    console.error(
      '一个组件内只能有一个事件通道注册函数，当前配置了多个事件通道注册函数，请检查 event_pipeline 相关配置项！！请在 income_pipeline 中配置公共业务逻辑切面提供的函数名字！！',
    )

    return false
  }

  // 架构检查 前置处理
  architecture_check_pre_process(payload)
  // 合并 初始上下文
  merge_to_payload_with_conflict_logs({
    payload,
    dataToMerge: base_payload,
    file_path: 'useContextAssembler.js',
  })

  onBeforeMount(() => {
    // 事件通道需要最先生成 因为状态机和方法可能会依赖事件通道
    config_obj.event_pipeline_fn_arr?.forEach((fn) => {
      fn(payload)
    })

    //单例状态机需要在 此处统一初始化 ，提前生成给后续的 切面逻辑使用
    config_obj.singleton_init_fn_arr?.forEach((fn) => {
      fn(payload)
    })
  })

  // 1. 状态机就绪 合并状态机
  config_obj.state_fn_arr?.forEach((fn) => {
    // console.error('状态机就绪 合并状态机')
    Object.assign(payload, fn(payload))
  })

  // 此处可以去执行注入 原生监听和 VUE 监听，生命周期
  // 此时状态机初始化完成 ，
  // 实际业务场景下，可能存在 在 onbeforemount 生命周期内重新更改赋值状态机的值的情况， 如果 VUE 监听植入执行过早会多触发一次监听
  // 原生事件监听，有依赖DOM 节点的和不依赖的，比如消息通道或者按钮点击，或者手势 事件，依赖DOM节点的需要在生命周期内植入， 不依赖的可以提前植入
  // 由于VUE 的DOM 引用，有响应式 ，因此 可以前置执行 原生监听

  // 2. 方法挂载 合并返回的常规函数
  config_obj.method_fn_arr?.forEach((fn) => {
    Object.assign(payload, fn(payload))
  })
  // 3. 生命周期激活
  config_obj.lifecycle_fn_arr?.forEach((fn) => Object.assign(payload, fn(payload)))

  // 注入处理VUE监听器 的销毁逻辑
  config_obj.watcher_fn_arr?.forEach((fn) => {
    useAllExceptEventListenerCleaner(fn(payload))
  })

  onUnmounted(() => {
    //单例状态机需要在    组件生命周期结束时，  进行清理工作
    config_obj.singleton_init_fn_arr?.forEach((fn) => {
      fn(payload)
    })

    clear_context_expose(payload)
  })

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

const clear_context_expose = (payload) => {
  const { ALL_CONTEXT_STATE, ALL_EVENT_PIPELINE } = payload
  if (ALL_CONTEXT_STATE) {
    for (const key in ALL_CONTEXT_STATE) {
      delete ALL_CONTEXT_STATE[key]
    }
  }

  if (ALL_EVENT_PIPELINE) {
    for (const key in ALL_EVENT_PIPELINE) {
      delete ALL_EVENT_PIPELINE[key]
    }
  }
}
