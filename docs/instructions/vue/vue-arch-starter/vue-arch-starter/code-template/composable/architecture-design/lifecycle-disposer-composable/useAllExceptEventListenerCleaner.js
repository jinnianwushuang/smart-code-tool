import { onUnmounted, isRef } from 'vue'

/**
 * 全能副作用清理器 V2.0
 * 核心原理：特征识别 (Feature Detection) + 深度递归逻辑 + 容错执行
 */
export function useAllExceptEventListenerCleaner(resources, options = { debug: false }) {
  const isDev = import.meta.env?.DEV || options.debug

  const log = (type, detail) => {
    if (isDev) console.log(`[SuperCleaner] 🟢 已清理 ${type}:`, detail)
  }

  const clean = (item) => {
    if (!item) return

    try {
      // --- 1. 容器类递归 (Ref / Array / Set / Map) ---
      if (isRef(item)) {
        clean(item.value)
        item.value = null
        return
      }
      if (Array.isArray(item)) {
        item.forEach((i) => clean(i))
        item.length = 0
        return
      }
      if (item instanceof Set || item instanceof Map) {
        item.forEach((i) => clean(i))
        item.clear()
        return
      }

      // --- 2. 函数类 (Vue Watch / 取消订阅句柄 / 状态重置) ---
      if (typeof item === 'function') {
        if (typeof item.stop === 'function') {
          item.stop()
          log('Vue Watch', item.name || 'Anonymous Fn')
          return
        } else if (typeof item.unsubscribe === 'function') {
          item.unsubscribe()
          log('RxJS Observable', item.name || 'Anonymous Fn')
          return
        } else if (typeof item.cancel === 'function') {
          item.cancel()
          log('Lodash Debounce / Throttle', item.name || 'Anonymous Fn')
          return
        } else if (typeof item.off === 'function') {
          item.off()
          log('有off 句柄的函数', item.name || 'Anonymous Fn')
          return
        } else {
          item()
          log('函数句柄', item.name || 'Anonymous Fn')
          return
        }
      }

      // --- 3. 标识符类 (定时器 / 动画帧 ID) ---
      if (typeof item === 'number' || typeof item === 'string') {
        clearTimeout(item)
        clearInterval(item)
        if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
          window.cancelAnimationFrame(item)
        }
        log('定时器/动画帧', item)
        return
      }

      // --- 4. 复杂对象与 Web API 实例 ---
      if (typeof item === 'object') {
        // 4.1 具有销毁方法的第三方实例 (ECharts, Swiper, Monaco, Worker)
        if (typeof item.dispose === 'function') {
          item.dispose()
          log('实例 (dispose)', item.constructor.name)
          return
        }
        if (typeof item.destroy === 'function') {
          item.destroy()
          log('实例 (destroy)', item.constructor.name)
          return
        }
        if (typeof item.terminate === 'function') {
          item.terminate()
          log('Worker (terminate)', item)
          return
        }

        // 4.2 原生 Web API 识别
        if (item instanceof AbortController) {
          item.abort()
          log('请求 (Abort)', 'HTTP Request')
          return
        }
        if (item instanceof WebSocket) {
          item.close()
          log('Socket (Close)', item.url)
          return
        }
        if (
          item instanceof IntersectionObserver ||
          item instanceof ResizeObserver ||
          item instanceof MutationObserver
        ) {
          item.disconnect()
          log('观察者 (Disconnect)', item.constructor.name)
          return
        }

        // 4.3 原生 DOM 事件监听结构 { target, type, handler }
        if (item.target && item.type && item.handler) {
          const el = isRef(item.target) ? item.target.value : item.target
          el?.removeEventListener?.(item.type, item.handler, item.options)
          log('原生事件 (off)', `${item.type} @ ${el?.tagName || 'window'}`)
          return
        }

        // 4.4 Mitt   结构 { off ,type }
        if (item.off) {
          item.off?.()
          log('Mitt事件 (off)', item.type)
          return
        }

        // 4.5 普通对象容器：递归清理所有 Key
        Object.keys(item).forEach((key) => {
          clean(item[key])
          delete item[key]
        })
      }
    } catch (error) {
      console.error(`[SuperCleaner] 🔴 清理资源时发生异常:`, error, item)
    }
  }

  onUnmounted(() => {
    if (isDev) console.group('📦 SuperCleaner: 开始执行全局清理...')
    clean(resources)
    if (isDev) console.groupEnd()
  })

  return {
    manualClean: () => clean(resources),
  }
}
