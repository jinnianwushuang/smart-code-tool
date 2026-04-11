import { onMounted, onUnmounted } from 'vue'

/**
 * 通用事件监听注册与自动销毁 useEventListener
 * 这里的漏洞 需要代码内 事件监听 先注册 先销毁 需要在DOM 副作用组合逻辑之前使用
 * 支持结构:
 * 1. 单个对象: { target: window, type: 'resize', handler: fn }
 * 2. 以上对象的数组: [ { target, type, handler }, ... ]
 * 3. 包含以上对象的 Ref 或普通对象容器
 */

/**
 * 通用原生事件监听封装
 * @param {Array} configs - 配置对象数组 [{ target, type, handler, options }]
 */
export function useEventListener(configs) {
  const controller = new AbortController()
  const { signal } = controller

  onMounted(() => {
    configs.forEach(({ target, type, handler, options = {} }) => {
      // 关键：将 signal 传入 addEventListener 的配置项
      target.addEventListener(type, handler, { ...options, signal })
    })
  })

  onUnmounted(() => {
    // 触发中止信号，关联的所有监听器会自动销毁
    controller.abort()
  })

  // 返回控制器，方便外部手动提前中止
  return controller
}
