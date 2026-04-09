import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
} from 'vue'
import {
  genarate_event_listener,
  genarate_event_pipeline,
  genarate_singleton,
} from './config/config.js'

import { useEventListenerCleaner } from 'src/composable/architecture-design/lifecycle-disposer-composable/useEventListenerCleaner.js'
import { useAllExceptEventListenerCleaner } from 'src/composable/architecture-design/lifecycle-disposer-composable/useAllExceptEventListenerCleaner.js'

/**
 * 模块扫描后 解析组装生命周期
 */
export const useModuleLifecycleAssembler = (all_params) => {
  const { modules = {} } = all_params

  const [_, lifecycle] =
    Object.entries(modules).find(([path, mod]) => path.includes('/module/lifecycle/')) || []

  assemble_lifecycle_centralized({
    ...all_params,
    lifecycle,
  })
}

/**
 *
 * @param {*} all_params.payload 上下文载荷对象
 * @param {*} all_params.modules vite glob 扫描的 模块对象
 * @param {*} all_params.lifecycle_mod 额外的参数，生命周期钩子
 * @returns {Object} 包含生命周期函数的对象
 *
 *
 *
 */
const assemble_lifecycle_centralized = (all_params) => {
  const { payload, modules = {}, lifecycle = {} } = all_params

  const genarate_fn = (item) => {
    const method = find_method({ modules, item })
    if (method) {
      return () => method(payload)
    }
    return item.default
  }

  const event_pipeline_fn = genarate_fn(genarate_event_pipeline)
  const singleton_fn = genarate_fn(genarate_singleton)

  // 事件监听的 相关逻辑 需要先注册 先销毁 ，因此 排在最前面

  {
    const method = find_method({
      modules,

      item: genarate_event_listener,
    })
    if (method) {
      useEventListenerCleaner(method(payload))
    }
  }

  onBeforeMount(() => {
    // 组件生命周期开始前，先执行单例函数，生成单例对象，供组件内其他函数调用
    singleton_fn()
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onBeforeMount?.(payload)
    // 事件管道的函数 需要在生命周期开始前就生成好，供组件内其他函数调用
    event_pipeline_fn()
  })
  onMounted(() => {
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onMounted?.(payload)
  })
  onBeforeUnmount(() => {
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onBeforeUnmount?.(payload)
  })
  onUnmounted(() => {
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onUnmounted?.(payload)
    // 组件生命周期结束时，执行一次单例函数，进行清理工作
    singleton_fn()
  })
  onActivated(() => {
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onActivated?.(payload)
  })
  onDeactivated(() => {
    // 执行传入的生命周期回调函数
    lifecycle?.lifecycle_onDeactivated?.(payload)
  })
  // 根据配置项，找到需要销毁副作用的函数，并执行

  //by_module 模式下，根据配置项的 file_path 在扫描的模块中找到对应模块，再从模块中找到对应函数

  Object.entries(modules).forEach(([path, mod]) => {
    if (path.includes('/effect/')) {
      if (!path.includes('/listener.js')) {
        const method = mod[Object.keys(mod)[0]]
        useAllExceptEventListenerCleaner(method(payload))
      }
    }
  })
}
/**
 * 通过配置或者模块扫描 找到对应的模块
 * @param {*} param0
 * @returns
 */
const find_method = ({ modules, assemble_type, item }) => {
  let method = null

  //by_module 模式下，根据配置项的 file_path 在扫描的模块中找到对应模块，再从模块中找到对应函数

  let [find_mod] = Object.entries(modules).filter(([path, mod]) => path.includes(item.file_path))

  if (find_mod) {
    let [file_path, mod] = find_mod
    method = mod[item.method_name]
  }

  return method
}
