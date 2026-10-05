/**
 * 抗遗忘复习系统 — 浏览器通知提醒
 *
 * 在复习到期时发送浏览器通知（需用户授权）
 */

import { ref } from 'vue'

/**
 * useReviewNotification — 通知管理
 *
 * @param {object} review - useReview 实例
 */
export function useReviewNotification(review) {
  const isPermissionGranted = ref(
    typeof Notification !== 'undefined' && Notification.permission === 'granted',
  )
  let checkInterval = null
  let isActive = false // 是否正在运行定时检查
  let wasPaused = false // 是否因页面隐藏而暂停

  /**
   * 立即检查一次到期情况
   */
  function checkOnce() {
    if (!isPermissionGranted.value) return
    const dueCount = review.dueRecords.value.length
    if (dueCount > 0) sendNotification(dueCount)
  }

  /**
   * 请求通知权限
   */
  async function requestPermission() {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') {
      isPermissionGranted.value = true
      return true
    }
    if (Notification.permission === 'denied') {
      isPermissionGranted.value = false
      return false
    }

    const result = await Notification.requestPermission()
    isPermissionGranted.value = result === 'granted'
    return isPermissionGranted.value
  }

  /**
   * 发送通知
   */
  function sendNotification(dueCount) {
    if (!isPermissionGranted.value || dueCount <= 0) return

    try {
      new Notification('📚 复习提醒', {
        body: `你有 ${dueCount} 篇文档到期需要复习`,
        icon: '/smart-code-tool/doc-assets/logo/icons8-light-on-96.png',
        tag: 'review-reminder',
      })
    } catch {
      // 部分环境不支持 Notification 构造函数，静默忽略
    }
  }

  /**
   * 页面可见性变化处理：隐藏时暂停，可见时恢复并立即检查一次
   */
  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // 页面隐藏：暂停 interval，但保留 isActive 状态
      if (isActive && checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
        wasPaused = true
      }
    } else if (document.visibilityState === 'visible' && wasPaused) {
      // 页面恢复可见：重启 interval + 立即检查一次
      checkInterval = setInterval(checkOnce, 30 * 60 * 1000)
      wasPaused = false
      checkOnce()
    }
  }

  /**
   * 启动定时检查（每 30 分钟检查一次到期情况）
   */
  function startChecking() {
    if (isActive) return
    isActive = true
    wasPaused = false
    checkInterval = setInterval(checkOnce, 30 * 60 * 1000) // 30 分钟
    // 注册可见性监听
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  /**
   * 停止定时检查（完全关闭，移除监听）
   */
  function stopChecking() {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    isActive = false
    wasPaused = false
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return {
    isPermissionGranted,
    requestPermission,
    sendNotification,
    startChecking,
    stopChecking,
  }
}
