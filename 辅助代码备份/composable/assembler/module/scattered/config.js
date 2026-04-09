import { useWatcherCleaner } from 'src/composable/architecture-design/lifecycle-disposer/useWatcherCleaner.js'
import { useEventListenerCleaner } from 'src/composable/architecture-design/lifecycle-disposer-composable/useEventListenerCleaner.js'
import { useDomCleaner } from 'src/composable/architecture-design/lifecycle-disposer/useDomCleaner.js'
import { useTimerCleaner } from 'src/composable/architecture-design/lifecycle-disposer/useTimerCleaner.js'
import { useEmitterCleaner } from 'src/composable/architecture-design/lifecycle-disposer/useEmitterCleaner.js'

//需要销毁副作用的 函数生成器
export const cleanup_effect_arr = [
  {
    file_path: '/effect/watcher.js',
    method_name: 'cleanup_effect_watcher',
    config_key: 'watch',
    handle_fn: useWatcherCleaner,
  },

  {
    file_path: '/effect/timer.js',
    method_name: 'cleanup_effect_timer',
    config_key: 'timer',
    handle_fn: useTimerCleaner,
  },
  {
    file_path: '/effect/mitter.js',
    method_name: 'cleanup_effect_mitter',
    config_key: 'mitt',
    handle_fn: useEmitterCleaner,
  },
  {
    file_path: '/effect/listener.js',
    method_name: 'cleanup_effect_listener',
    config_key: 'listener',
    handle_fn: useEventListenerCleaner,
  },
  {
    file_path: '/effect/dom.js',
    method_name: 'cleanup_effect_dom',
    config_key: 'dom',

    handle_fn: useDomCleaner,
  },
]

// 事件通道生成器的函数配置
export const genarate_event_pipeline = {
  file_path: '/module/event-pipeline/event-pipeline.js',
  method_name: 'create_event_pipeline',
  config_key: 'emit',
  use_payload: true,
  default: () => {},
}
//  单例初始化的函数配置
export const genarate_singleton = {
  file_path: '/variable/singleton.js',
  method_name: 'init_all_singleton',
  config_key: 'singleton',
  use_payload: false,
  default: () => {
    return () => {}
  },
}
