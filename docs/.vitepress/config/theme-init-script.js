/**
 * VitePress 主题初始化内联脚本
 * 在 HTML <head> 中同步执行，防止首次加载时主题闪烁（先亮后暗）
 *
 * 优先级：VitePress localStorage > 主应用 localStorage > 系统偏好
 */
;(() => {
  const t =
    localStorage.getItem('vitepress-theme-appearance') ||
    localStorage.getItem('app-theme-mode')
  if (t === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (!t && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
})()
