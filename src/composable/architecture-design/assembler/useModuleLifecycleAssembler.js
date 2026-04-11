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

import { useAllExceptEventListenerCleaner } from 'src/composable/architecture-design/lifecycle-disposer-composable/useAllExceptEventListenerCleaner.js'

/**
 * 模块扫描后 解析组装生命周期
 */
export const useModuleLifecycleAssembler = (all_params) => {
  const { modules = {} } = all_params

  const lifecycle_arr =
    Object.entries(modules).filter(([path, mod]) => path.includes('/module/lifecycle/')) || []

  const lifecycle = lifecycle_arr.map(([path, mod]) => {
    return mod
  })

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
  const { payload, modules = {}, lifecycle = [] } = all_params
  const controller = new AbortController()
  const { signal } = controller
  const event_listener_config_arr = []

  //  真正执行的 时候这里只会有 0次或者 1次  useModuleLifecycleAssembler 每次执行内部都是闭包
  const genarate_fn = (item) => {
    const method = find_method({ modules, item })
    if (method) {
      return () => method(payload)
    }
    return item.default()
  }

  // 事件管道的 相关逻辑
  const event_pipeline_fn = genarate_fn(genarate_event_pipeline)
  const singleton_fn = genarate_fn(genarate_singleton)
  let event_pipeline_off = null
  // 事件监听的 相关逻辑  合并

  {
    const method = find_method({
      modules,

      item: genarate_event_listener,
    })

    if (method) {
      event_listener_config_arr.push(...method(payload))
    }
  }

  onBeforeMount(() => {
    // 组件生命周期开始前，先执行单例函数，生成单例对象，供组件内其他函数调用
    singleton_fn(payload)
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onBeforeMount')
    // 事件管道的函数 需要在生命周期开始前就生成好，供组件内其他函数调用
    event_pipeline_off = event_pipeline_fn(payload)
    //原生事件监听的相关逻辑
    event_listener_config_arr.forEach(({ target, type, handler, options = {} }) => {
      // 关键：将 signal 传入 addEventListener 的配置项
      target.addEventListener(type, handler, { ...options, signal })
    })
  })
  onMounted(() => {
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onMounted')
  })
  onBeforeUnmount(() => {
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onBeforeUnmount')
  })
  onUnmounted(() => {
    //触发中止信号，关联的所有监听器会自动销毁
    controller.abort()
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onUnmounted')
    // 组件生命周期结束时，执行一次单例函数，进行清理工作
    singleton_fn(payload)
    event_pipeline_off?.off()
  })
  onActivated(() => {
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onActivated')
  })
  onDeactivated(() => {
    // 执行传入的生命周期回调函数

    run_lifecycle_hook(payload, lifecycle, 'lifecycle_onDeactivated')
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
 * 模块扫描后 解析组装生命周期
 */
const run_lifecycle_hook = (paylaod, lifecycle, hook_name) => {
  lifecycle.map((x) => {
    x[hook_name]?.(paylaod)
  })
}

/**
 * 通过配置或者模块扫描 找到对应的模块
 * @param {*} param0
 * @returns
 */
const find_method = ({ modules, item }) => {
  let method = null

  //by_module 模式下，根据配置项的 file_path 在扫描的模块中找到对应模块，再从模块中找到对应函数

  let [find_mod] = Object.entries(modules).filter(([path, mod]) => path.includes(item.file_path))

  if (find_mod) {
    let [file_path, mod] = find_mod
    method = mod[item.method_name]
  }

  return method
}
